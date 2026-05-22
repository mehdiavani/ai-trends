#!/usr/bin/env python3
"""
AI Trends Data Fetcher
Fetches daily snapshots from PyPI, GitHub, HuggingFace, and Stack Overflow.
Appends to data/history.json. Safe to run multiple times (skips if today exists).
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: 'requests' library not installed. Run: pip install requests")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
DATA_FILE = Path(__file__).parent.parent / "data" / "history.json"
MAX_SNAPSHOTS = 365  # keep at most one year of daily data

PYPI_PACKAGES = [
    "openai",
    "anthropic",
    "google-generativeai",
    "mistralai",
    "cohere",
    "groq",
    "ollama",
    "huggingface-hub",
    "replicate",
    "together",
]

GITHUB_REPOS = [
    "openai/openai-python",
    "anthropics/anthropic-sdk-python",
    "google-gemini/generative-ai-python",
    "mistralai/client-python",
    "ollama/ollama",
    "huggingface/transformers",
    "langchain-ai/langchain",
    "BerriAI/litellm",
]

SO_TAGS = [
    "openai-api",
    "chatgpt-api",
    "anthropic-claude",
    "google-gemini",
    "langchain",
    "huggingface",
]

TIMEOUT = 15  # seconds per request

# ── Helpers ──────────────────────────────────────────────────────────────────

def get(url, headers=None, params=None):
    """GET with timeout, returns parsed JSON or None on failure."""
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  WARN: {url} → {e}")
        return None


# ── Fetchers ─────────────────────────────────────────────────────────────────

def fetch_pypi():
    print("→ Fetching PyPI stats…")
    results = {}
    for pkg in PYPI_PACKAGES:
        data = get(f"https://pypistats.org/api/packages/{pkg}/recent")
        if data and "data" in data:
            d = data["data"]
            results[pkg] = {
                "last_day":   d.get("last_day", 0),
                "last_week":  d.get("last_week", 0),
                "last_month": d.get("last_month", 0),
            }
            print(f"   {pkg}: {results[pkg]['last_week']:,} downloads/week")
        else:
            print(f"   {pkg}: FAILED")
        time.sleep(0.3)  # be a polite guest
    return results


def fetch_github():
    print("→ Fetching GitHub stats…")
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        print("  INFO: No GITHUB_TOKEN set — using unauthenticated (60 req/hr limit)")

    results = {}
    for repo in GITHUB_REPOS:
        data = get(f"https://api.github.com/repos/{repo}", headers=headers)
        if data and "stargazers_count" in data:
            results[repo] = {
                "stars":      data["stargazers_count"],
                "forks":      data["forks_count"],
                "issues":     data["open_issues_count"],
                "updated_at": data["updated_at"],
            }
            print(f"   {repo}: {results[repo]['stars']:,} stars")
        else:
            print(f"   {repo}: FAILED")
        time.sleep(0.2)
    return results


def fetch_huggingface():
    print("→ Fetching HuggingFace top models…")
    data = get(
        "https://huggingface.co/api/models",
        params={"sort": "downloads", "limit": 20, "direction": -1},
    )
    if not data:
        return []
    models = []
    for m in data:
        models.append({
            "name":      m.get("id", ""),
            "downloads": m.get("downloads", 0),
            "likes":     m.get("likes", 0),
        })
    print(f"   Got {len(models)} top models")
    return models


def fetch_stackoverflow():
    print("→ Fetching Stack Overflow tag stats…")
    results = {}
    for tag in SO_TAGS:
        data = get(
            f"https://api.stackexchange.com/2.3/tags/{tag}/info",
            params={"site": "stackoverflow"},
        )
        if data and "items" in data and data["items"]:
            count = data["items"][0].get("count", 0)
            results[tag] = {"count": count}
            print(f"   {tag}: {count:,} questions")
        else:
            print(f"   {tag}: FAILED")
        time.sleep(0.5)  # SO rate limit is strict
    return results


# ── Main ──────────────────────────────────────────────────────────────────────

def load_history():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {"last_updated": "", "snapshots": []}


def save_history(history):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(history, f, indent=2)


def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"\n{'='*50}")
    print(f"AI Trends Data Fetcher — {today}")
    print(f"{'='*50}\n")

    history = load_history()

    # Skip if today's snapshot already exists
    existing_dates = {s["date"] for s in history.get("snapshots", [])}
    if today in existing_dates:
        print(f"✓ Snapshot for {today} already exists. Skipping.")
        return

    snapshot = {"date": today}

    # Fetch each source independently — failures don't block others
    try:
        snapshot["pypi"] = fetch_pypi()
    except Exception as e:
        print(f"ERROR in PyPI fetch: {e}")
        snapshot["pypi"] = {}

    try:
        snapshot["github"] = fetch_github()
    except Exception as e:
        print(f"ERROR in GitHub fetch: {e}")
        snapshot["github"] = {}

    try:
        snapshot["huggingface_top_models"] = fetch_huggingface()
    except Exception as e:
        print(f"ERROR in HuggingFace fetch: {e}")
        snapshot["huggingface_top_models"] = []

    try:
        snapshot["stackoverflow"] = fetch_stackoverflow()
    except Exception as e:
        print(f"ERROR in Stack Overflow fetch: {e}")
        snapshot["stackoverflow"] = {}

    # Append and prune
    history["snapshots"].append(snapshot)
    history["snapshots"].sort(key=lambda s: s["date"])
    if len(history["snapshots"]) > MAX_SNAPSHOTS:
        history["snapshots"] = history["snapshots"][-MAX_SNAPSHOTS:]

    history["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    save_history(history)

    print(f"\n✓ Saved snapshot for {today}")
    print(f"  Total snapshots in history: {len(history['snapshots'])}")
    print(f"  PyPI packages fetched:      {len(snapshot.get('pypi', {}))}")
    print(f"  GitHub repos fetched:       {len(snapshot.get('github', {}))}")
    print(f"  HuggingFace models:         {len(snapshot.get('huggingface_top_models', []))}")
    print(f"  Stack Overflow tags:        {len(snapshot.get('stackoverflow', {}))}")


if __name__ == "__main__":
    main()
