"""
security_demo.py
-----------------
Demonstrates the security hygiene (2.3) and Misconfiguration defence
(2.7) parts of the submission against the running backend. Run this
while `uvicorn main:app --reload --port 8000` is running in another
terminal.

For the Denial of Service defence, use dos_demo.py instead - that one
needs a burst of concurrent requests, this one is simple sequential
checks that are easier to narrate one at a time.

Usage:
    python security_demo.py
"""
import requests

BASE = "http://127.0.0.1:8000"


def section(title):
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def normal_request():
    section("1. Normal request - baseline behaviour")
    print("Sending a normal URL to /check ...")
    r = requests.post(f"{BASE}/check", json={"url": "http://example.com/login"})
    print(f"Status: {r.status_code}")
    print(f"Body:   {r.json()}")
    print("\nThis is the happy path: input is accepted, the model runs, and")
    print("we get back a label, a probability and a trust score.")


def oversized_request():
    section("2. Hygiene (2.3) - oversized input is rejected on the back end")
    huge_url = "http://" + ("a" * 2100) + ".com"
    print(f"Sending a {len(huge_url)}-character URL (over the 2048 cap) ...")
    r = requests.post(f"{BASE}/check", json={"url": huge_url})
    print(f"Status: {r.status_code}")
    print(f"Body:   {r.json()}")
    print("\nFastAPI/Pydantic rejects this with 422 before it ever reaches")
    print("feature extraction or the model - the size limit in UrlRequest.url")
    print("(Field(..., max_length=2048)) is enforced on the back end, not")
    print("just in the React form, so an attacker bypassing the front end")
    print("entirely (e.g. with curl) still can't get an oversized request through.")


def missing_field_request():
    section("2b. Hygiene (2.3) - malformed input gets a clear error, not a crash")
    print("Sending a request with no 'url' field at all ...")
    r = requests.post(f"{BASE}/check", json={})
    print(f"Status: {r.status_code}")
    print(f"Body:   {r.json()}")
    print("\nAgain a clean 422 with a specific error message - not a 500,")
    print("not a stack trace, not a crash.")


def security_headers():
    section("3. Misconfiguration defence (2.7) - response headers")
    print("Checking headers on a normal response ...")
    r = requests.get(f"{BASE}/")
    for h in ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Server"]:
        print(f"  {h}: {r.headers.get(h, '(not present)')}")
    print("\nX-Content-Type-Options / X-Frame-Options / Referrer-Policy are set")
    print("by our security_headers middleware - none of these are on by default")
    print("in FastAPI. 'Server' being absent means we're not advertising exactly")
    print("which web server/version we're running, which is one less thing an")
    print("attacker gets for free when probing the app.")


def cors_check():
    section("4. Hygiene (2.3) - CORS only allows our own front end")
    print("Sending an OPTIONS preflight as if from an origin that ISN'T our")
    print("front end (http://evil-site.example) ...")
    r = requests.options(
        f"{BASE}/check",
        headers={
            "Origin": "http://evil-site.example",
            "Access-Control-Request-Method": "POST",
        },
    )
    allow_origin = r.headers.get("Access-Control-Allow-Origin", "(not present)")
    print(f"Status: {r.status_code}")
    print(f"Access-Control-Allow-Origin returned: {allow_origin}")
    print("\nBecause that header doesn't echo back 'http://evil-site.example',")
    print("a browser running JS on that origin would block the response from")
    print("ever reaching the attacker's page - unlike allow_origins=[\"*\"],")
    print("which would hand it over to anyone.")


if __name__ == "__main__":
    normal_request()
    oversized_request()
    missing_field_request()
    security_headers()
    cors_check()
    print("\n" + "=" * 70)
    print("Done. For the Denial of Service defence demo, run dos_demo.py separately.")
    print("=" * 70)
