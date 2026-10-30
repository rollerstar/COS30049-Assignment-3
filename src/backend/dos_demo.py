"""
dos_demo.py
------------
Fires a burst of concurrent requests at the /check endpoint and reports
how many came back 200 (handled) vs 503 (rejected because the server was
already at MAX_CONCURRENT_PREDICTIONS). This is the attack + defence demo
for section 2.7 (Denial of Service).

Run it twice for the video:
  1. Temporarily comment out the semaphore check in main.py (or set
     MAX_CONCURRENT_PREDICTIONS to a huge number) and re-run this script -
     show the server struggling / requests taking much longer, or crashing.
  2. Put the real limit back, re-run - show a clean mix of 200s and 503s,
     and that the server is still responsive afterwards (the health check
     at the bottom still returns fast).

Usage:
    python dos_demo.py
"""
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

URL = "http://127.0.0.1:8000/check"
NUM_REQUESTS = 40          # how many requests to fire "at once"
MAX_WORKERS = 40           # fire them as close to simultaneously as possible


def send_one(i: int):
    start = time.perf_counter()
    try:
        r = requests.post(URL, json={"url": f"http://example-{i}.com/test"}, timeout=10)
        elapsed = time.perf_counter() - start
        return i, r.status_code, round(elapsed, 3)
    except requests.RequestException as e:
        elapsed = time.perf_counter() - start
        return i, f"ERROR: {e}", round(elapsed, 3)


def main():
    print(f"Firing {NUM_REQUESTS} concurrent requests at {URL} ...\n")
    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(send_one, i) for i in range(NUM_REQUESTS)]
        for f in as_completed(futures):
            results.append(f.result())

    results.sort()
    ok = sum(1 for _, status, _ in results if status == 200)
    rejected = sum(1 for _, status, _ in results if status == 503)
    other = len(results) - ok - rejected

    for i, status, elapsed in results:
        print(f"  request {i:>3}: status={status}  took={elapsed}s")

    print(f"\n{ok} succeeded (200), {rejected} rejected (503), {other} other/error")

    # Prove the server is still alive and responsive right after the burst.
    t0 = time.perf_counter()
    health = requests.get("http://127.0.0.1:8000/", timeout=5)
    print(f"\nServer still responsive: {health.status_code} in {round(time.perf_counter() - t0, 3)}s")


if __name__ == "__main__":
    main()
