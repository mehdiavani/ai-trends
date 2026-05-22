#!/usr/bin/env python3
"""
AI Trends Seed Data Generator
Generates ~90 days of realistic historical data so the dashboard looks good on first deploy.
Run once: python scripts/seed_data.py
Real daily cron data will accumulate alongside this.
"""

import json
import math
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "history.json"

random.seed(42)  # reproducible

# ── Realistic baselines (approx real-world proportions as of 2026) ──────────

PYPI_BASELINES = {
    # (last_week_base, monthly_growth_rate_pct)
    "openai":             (9_500_000, 0.8),
    "anthropic":          (3_200_000, 2.1),
    "google-generativeai":(2_800_000, 1.9),
    "huggingface-hub":    (6_100_000, 0.5),
    "mistralai":          (1_100_000, 2.4),
    "langchain":          (4_200_000, 0.3),
    "groq":               (   780_000, 3.2),
    "cohere":             (   620_000, 0.9),
    "ollama":             (   450_000, 4.1),
    "replicate":          (   310_000, 1.5),
    "together":           (   240_000, 2.8),
}

GITHUB_BASELINES = {
    # (stars_base, forks_base)
    "openai/openai-python":               (25_800, 3_600),
    "anthropics/anthropic-sdk-python":    (10_400, 1_100),
    "google-gemini/generative-ai-python": ( 5_200,   620),
    "mistralai/client-python":            ( 3_900,   410),
    "ollama/ollama":                      (98_000, 7_800),
    "huggingface/transformers":           (140_000, 27_000),
    "langchain-ai/langchain":             (98_000, 15_600),
    "BerriAI/litellm":                    (18_500, 2_100),
}

SO_BASELINES = {
    "openai-api":      46_000,
    "chatgpt-api":     28_000,
    "anthropic-claude":  8_200,
    "google-gemini":    12_400,
    "langchain":        31_000,
    "huggingface":      19_500,
}

HF_TOP_MODELS = [
    ("meta-llama/Llama-3.1-8B-Instruct",      85_000_000),
    ("meta-llama/Llama-3.1-70B-Instruct",     62_000_000),
    ("meta-llama/Llama-3.2-3B-Instruct",      54_000_000),
    ("google/gemma-2-9b-it",                  41_000_000),
    ("mistralai/Mistral-7B-Instruct-v0.3",    38_000_000),
    ("microsoft/phi-4",                       35_000_000),
    ("deepseek-ai/DeepSeek-R1-Distill-Llama-8B", 31_000_000),
    ("Qwen/Qwen2.5-7B-Instruct",             29_000_000),
    ("google/gemma-2-2b-it",                  27_000_000),
    ("meta-llama/Llama-3.2-1B-Instruct",      25_000_000),
    ("microsoft/phi-3-mini-4k-instruct",      22_000_000),
    ("HuggingFaceTB/SmolLM2-1.7B-Instruct",  18_000_000),
    ("Qwen/Qwen2.5-14B-Instruct",            16_000_000),
    ("NousResearch/Hermes-3-Llama-3.1-8B",   14_000_000),
    ("deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct", 12_000_000),
    ("meta-llama/Llama-3.3-70B-Instruct",     11_000_000),
    ("google/gemma-3-27b-it",                  9_500_000),
    ("mistralai/Mixtral-8x7B-Instruct-v0.1",   8_800_000),
    ("internlm/internlm2_5-7b-chat",           7_200_000),
    ("codellama/CodeLlama-7b-Instruct-hf",     6_900_000),
]

HF_LIKES = {name: random.randint(500, 25000) for name, _ in HF_TOP_MODELS}


def jitter(value, pct=0.04):
    """Add ±pct% random noise."""
    return int(value * (1 + random.uniform(-pct, pct)))


def trend(base, day_idx, total_days, growth_rate_monthly):
    """Apply compound daily growth plus some noise."""
    daily_growth = (1 + growth_rate_monthly / 100) ** (1 / 30)
    grown = base * (daily_growth ** (total_days - day_idx))
    return jitter(int(grown))


def generate_snapshot(date_str, day_idx, total_days):
    snapshot = {"date": date_str}

    # PyPI
    pypi = {}
    for pkg, (base_week, growth) in PYPI_BASELINES.items():
        week = trend(base_week, day_idx, total_days, growth)
        pypi[pkg] = {
            "last_day":   jitter(week // 7),
            "last_week":  week,
            "last_month": jitter(week * 4),
        }
    snapshot["pypi"] = pypi

    # GitHub (stars grow monotonically with tiny daily bumps)
    github = {}
    for repo, (stars_base, forks_base) in GITHUB_BASELINES.items():
        # stars grow ~0.1%/day, never decrease
        progress = day_idx / total_days
        stars = int(stars_base * (0.98 + 0.02 * progress)) + random.randint(0, 5)
        forks = int(forks_base * (0.98 + 0.02 * progress)) + random.randint(0, 2)
        github[repo] = {
            "stars":      stars,
            "forks":      forks,
            "issues":     random.randint(50, 400),
            "updated_at": f"{date_str}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:00Z",
        }
    snapshot["github"] = github

    # Stack Overflow (slow monotonic growth)
    stackoverflow = {}
    for tag, base in SO_BASELINES.items():
        progress = day_idx / total_days
        count = int(base * (0.97 + 0.03 * progress)) + random.randint(0, 10)
        stackoverflow[tag] = {"count": count}
    snapshot["stackoverflow"] = stackoverflow

    # HuggingFace top models (downloads grow with noise)
    hf_models = []
    for name, base_dl in HF_TOP_MODELS:
        progress = day_idx / total_days
        dl = int(base_dl * (0.90 + 0.10 * progress))
        dl = jitter(dl, 0.03)
        hf_models.append({
            "name":      name,
            "downloads": dl,
            "likes":     HF_LIKES[name],
        })
    snapshot["huggingface_top_models"] = hf_models

    return snapshot


def main():
    today = datetime.now(timezone.utc).date()
    total_days = 90

    print(f"Generating {total_days} days of seed data…")

    snapshots = []
    for i in range(total_days):
        date = today - timedelta(days=(total_days - 1 - i))
        snap = generate_snapshot(date.isoformat(), i, total_days - 1)
        snapshots.append(snap)
        if i % 10 == 0:
            print(f"  Day {i+1}/{total_days}: {date}")

    history = {
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "snapshots": snapshots,
    }

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(history, f, indent=2)

    size_kb = DATA_FILE.stat().st_size / 1024
    print(f"\n✓ Wrote {len(snapshots)} snapshots to {DATA_FILE}")
    print(f"  File size: {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
