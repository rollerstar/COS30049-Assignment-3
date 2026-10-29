"""
main.py
------------
Gets the raw URL string from the front-end,
uses the model and then outputs the values back
for use on the website
"""
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from features import extract_features_df, FEATURE_COLUMNS

MODEL_PATH = Path(__file__).resolve().parent / "model.joblib"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # CRA / Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = joblib.load(MODEL_PATH)
PHISHING_IDX = list(model.classes_).index(1)

class UrlRequest(BaseModel):
    url : str

@app.get("/")
def root():
    return {"message" : "Phishing URL Detector API"}

@app.post("/check")
def check_url(req: UrlRequest):
    url = req.url.strip()
    X = extract_features_df(pd.Series([url]))[FEATURE_COLUMNS]

    p_phish = float(model.predict_proba(X)[0][PHISHING_IDX])

    return {
        "url" : url,
        "phishing_probability" : round(p_phish, 4),
        "trust_score": round((1 - p_phish) * 100),
        "label": "phishing" if p_phish >= 0.5 else "benign",
        "features": {k: int(v) for k, v in X.iloc[0].items()},
    }