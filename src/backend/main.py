"""
main.py
-------
FastAPI backend for the phishing URL detector. Gets the raw URL string
from the front end, runs it through the model, and returns the result.

Security notes (see docs/threat-model-and-defences-draft.md for the full
threat model and write-up):
  - Input is capped at 2048 characters (see UrlRequest.url below), so a
    request can never make feature extraction or the model do more work
    than that bound allows, no matter how it's phrased. Required hygiene
    (2.3) and also narrows the Denial of Service risk (2.7).
  - /check only allows a limited number of predictions to run at the same
    time. Past that limit, a new request gets an immediate 503 instead of
    queueing up and making the server look frozen. This is the Denial of
    Service defence from section 2.7.
  - A few baseline security headers are added to every response. This is
    the Misconfiguration defence from section 2.7.
"""
import threading
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from features import extract_features_df, FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"

app = FastAPI()

# Only the React dev server is allowed to call this API - not "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add baseline headers FastAPI doesn't set by default.

    Misconfiguration defence (2.7): these are free to add and close off a
    handful of common header-based issues - MIME-sniffing a response into
    something it isn't, embedding the app in someone else's iframe
    (clickjacking), and leaking the full referrer URL to other sites.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    if "server" in response.headers:
        del response.headers["server"]
    return response


model = joblib.load(MODEL_PATH)
PHISHING_IDX = list(model.classes_).index(1)

# How many /check requests are allowed to run at once. This is the
# Denial of Service defence: past this limit, acquire() below returns
# False immediately (blocking=False) instead of making the caller - or
# everyone else - wait for a free slot. See check_url().
MAX_CONCURRENT_PREDICTIONS = 8
_prediction_slots = threading.Semaphore(MAX_CONCURRENT_PREDICTIONS)


class UrlRequest(BaseModel):
    # Hard ceiling on how much text ever reaches feature extraction,
    # whatever the caller sends. Required hygiene (2.3).
    url: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        description="The URL to classify, e.g. http://example.com/login",
    )


@app.get("/")
def root():
    return {"message": "Phishing URL Detector API"}


@app.post("/check")
def check_url(req: UrlRequest):
    # Fail fast with 503 if we're already at capacity, rather than
    # queueing this request (or anyone else's) and looking frozen.
    if not _prediction_slots.acquire(blocking=False):
        raise HTTPException(
            status_code=503,
            detail="Server is busy handling other requests, try again shortly",
        )
    try:
        url = req.url.strip()
        X = extract_features_df(pd.Series([url]))[FEATURE_COLUMNS]

        p_phish = float(model.predict_proba(X)[0][PHISHING_IDX])

        return {
            "url": url,
            "phishing_probability": round(p_phish, 4),
            "trust_score": round((1 - p_phish) * 100),
            "label": "phishing" if p_phish >= 0.5 else "benign",
            "features": {k: int(v) for k, v in X.iloc[0].items()},
        }
    finally:
        _prediction_slots.release()
