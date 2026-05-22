#!/usr/bin/env python3
"""
AI Trends Seed Data Generator
Reads the REAL latest snapshot from history.json and generates 89 days of
historical data working backwards from those real values — so the chart flows
smoothly into the real data with no visual spike.

Run after pulling real data from origin:
    python scripts/seed_data.py
"""

import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "history.json"

random.seed(42)

# Monthly growth rates (%) used to extrapolate backwards
PYPI_GROWTH = {
    "openai":              0.8,
    "anthropic":           2.1,
    "google-generativeai": 1.9,
    "huggingface-hub":     0.5,
    "mistralai":           2.4,
    "groq":                3.2,
    "cohere":              0.9,
    "ollama":              4.1,
    "replicate":           1.5,
    "together":            2.8,
}

SO_GROWTH = 0.03   # 3% over 90 days total
GH_GROWTH = 0.02   # 2% over 90 days total


def jitter(value, pct=0.025):
    return int(value * (1 + random.uniform(-pct, pct)))


def backward(value, day_back, growth_rate_monthly):
    """Scale a value backwards in time using daily compound growth."""
    daily = (1 + growth_rate_monthly / 100) ** (1 / 30)
    return max(1, int(value / (daily ** day_back)))


def main():
    if not DATA_FILE.exists():
        print("ERROR: data/history.json not found.")
        print("Pull from origin first: git pull")
        return

    with open(DATA_FILE) as f:
        history = json.load(f)

    snapshots = history.get("snapshots", [])
    if not snapshots:
        print("ERROR: history.json has no snapshots.")
        return

    # Use the most recent snapshot as the anchor point
    real_snap = max(snapshots, key=lambda s: s["date"])
    anchor_date = datetime.fromisoformat(real_snap["date"]).date()
    existing_dates = {s["date"] for s in snapshots}

    print(f"Anchor (real) snapshot: {real_snap['date']}")
    print(f"Generating 89 days of history backwards from {anchor_date}…\n")

    pypi_anchor  = real_snap.get("pypi", {})
    github_anchor = real_snap.get("github", {})
    so_anchor    = real_snap.get("stackoverflow", {})
    hf_anchor    = real_snap.get("huggingface_top_models", [])

    new_snapshots = []

    for days_back in range(1, 90):  # 1..89 days before anchor
        date = anchor_date - timedelta(days=days_back)
        date_str = date.isoformat()

        if date_str in existing_dates:
            continue  # skip dates that already have real data

        snapshot = {"date": date_str}

        # ── PyPI ────────────────────────────────────────────────────────────
        pypi = {}
        for pkg, growth in PYPI_GROWTH.items():
            if pkg not in pypi_anchor:
                continue
            anchor_week = pypi_anchor[pkg]["last_week"]
            week = jitter(backward(anchor_week, days_back, growth))
            pypi[pkg] = {
                "last_day":   jitter(week // 7),
                "last_week":  week,
                "last_month": jitter(week * 4),
            }
        snapshot["pypi"] = pypi

        # ── GitHub ──────────────────────────────────────────────────────────
        github = {}
        for repo, data in github_anchor.items():
            progress = 1 - (days_back / 89)  # 0 at day-89, 1 at anchor
            stars = int(data["stars"] * (1 - GH_GROWTH * (1 - progress))) + random.randint(0, 3)
            forks = int(data["forks"] * (1 - GH_GROWTH * (1 - progress))) + random.randint(0, 1)
            github[repo] = {
                "stars":      max(1, stars),
                "forks":      max(1, forks),
                "issues":     random.randint(50, 400),
                "updated_at": f"{date_str}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z",
            }
        snapshot["github"] = github

        # ── Stack Overflow ──────────────────────────────────────────────────
        stackoverflow = {}
        for tag, data in so_anchor.items():
            progress = 1 - (days_back / 89)
            count = int(data["count"] * (1 - SO_GROWTH * (1 - progress))) + random.randint(0, 5)
            stackoverflow[tag] = {"count": max(1, count)}
        snapshot["stackoverflow"] = stackoverflow

        # ── HuggingFace ─────────────────────────────────────────────────────
        hf_models = []
        for m in hf_anchor:
            progress = 1 - (days_back / 89)
            dl = int(m["downloads"] * (0.90 + 0.10 * progress))
            hf_models.append({
                "name":      m["name"],
                "downloads": jitter(dl, 0.03),
                "likes":     m.get("likes", 0),
            })
        snapshot["huggingface_top_models"] = hf_models

        new_snapshots.append(snapshot)

    # Merge: keep all existing real snapshots, add the generated ones
    merged = snapshots + new_snapshots
    merged.sort(key=lambda s: s["date"])

    history["snapshots"] = merged
    history["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(DATA_FILE, "w") as f:
        json.dump(history, f, indent=2)

    size_kb = DATA_FILE.stat().st_size / 1024
    print(f"✓ Added {len(new_snapshots)} seed snapshots")
    print(f"  Total snapshots: {len(merged)}")
    print(f"  Date range: {merged[0]['date']} → {merged[-1]['date']}")
    print(f"  File size: {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
