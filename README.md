# AI Trends 📈

> **Track which AI models developers are actually using — with real data, updated daily.**

<!-- Replace this with a screenshot of your live dashboard -->
<!-- ![AI Trends Dashboard](docs/screenshot.png) -->

**[🔗 Live Demo → mehdiavani.github.io/ai-trends](https://mehdiavani.github.io/ai-trends)**

[![Data Updated](https://img.shields.io/badge/data-updated%20daily-10a37f?style=flat-square)](https://github.com/mehdiavani/ai-trends/actions)
[![GitHub Pages](https://img.shields.io/badge/hosted%20on-GitHub%20Pages-blue?style=flat-square)](https://mehdiavani.github.io/ai-trends)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Zero Cost](https://img.shields.io/badge/hosting%20cost-%240%2Fmo-success?style=flat-square)](/)

---

## Why This Exists

Twitter hype doesn't tell you which AI developers are actually adopting.

**PyPI downloads, GitHub stars, and Stack Overflow questions do.**

Every day, millions of developers install AI SDKs, star repositories, and ask questions. This dashboard aggregates those signals into a single, honest picture of who's winning the AI race — right now, based on real usage data, not press releases.

---

## What It Tracks

| Signal | Source | Why It Matters |
|--------|--------|----------------|
| **Weekly downloads** | PyPI Stats API | Direct SDK usage by developers |
| **GitHub stars & forks** | GitHub API | Developer interest & community size |
| **Stack Overflow questions** | SE API | Real-world adoption friction |
| **HuggingFace top models** | HuggingFace API | Open model popularity |

**Providers tracked:** OpenAI · Anthropic · Google Gemini · Mistral · HuggingFace · Groq · Cohere · Ollama · Replicate · Together AI

---

## Architecture

Zero servers. Zero hosting costs. Everything runs on GitHub infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (daily 06:00 UTC)          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  PyPI Stats  │    │ GitHub API   │    │  HuggingFace │  │
│  │  (no auth)   │    │  (GH token)  │    │  (no auth)   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         └──────────┬────────┘                   │           │
│                    │         ┌──────────────┐   │           │
│                    │         │ Stack Overflow│   │           │
│                    │         │  (no auth)   ├───┘           │
│                    │         └──────────────┘               │
│                    ▼                                        │
│           scripts/fetch_data.py                             │
│                    │                                        │
│                    ▼                                        │
│           data/history.json  ◄── git commit & push          │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Pages (static hosting)               │
│                                                             │
│   React + Vite + Recharts ──► reads history.json at load    │
│   Dark dashboard with animated charts                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Deploy Your Own (3 Steps)

### 1. Fork & Enable GitHub Pages

1. Fork this repo
2. Go to **Settings → Pages**
3. Set source to **GitHub Actions**

### 2. Enable the Workflow

1. Go to **Actions** tab
2. Enable workflows if prompted
3. Click **"Fetch Data & Deploy"** → **"Run workflow"** for the first run

The workflow runs automatically every day at 06:00 UTC after that.

### 3. Add GitHub Token (for GitHub API)

The `GITHUB_TOKEN` is **automatically available** in GitHub Actions — no manual setup needed. If you want more rate limit headroom:

1. Create a PAT at **Settings → Developer settings → Personal access tokens** (no special permissions needed, `public_repo` read is enough)
2. Add it as a secret named `GITHUB_TOKEN` in **Settings → Secrets → Actions**

**That's it.** Your dashboard is live at `https://{your-username}.github.io/ai-trends`.

---

## Local Development

```bash
# Generate seed data (first time)
python scripts/seed_data.py

# Copy data for local dev
cp data/history.json frontend/public/history.json

# Install and run frontend
cd frontend
npm install
npm run dev
```

**Requirements:** Python 3.8+, Node.js 18+, `pip install requests`

---

## Data Sources

All APIs are free and require no account or credit card:

| API | Endpoint | Limit |
|-----|----------|-------|
| PyPI Stats | `pypistats.org/api/packages/{pkg}/recent` | None |
| GitHub API | `api.github.com/repos/{owner}/{repo}` | 5,000 req/hr with token, 60/hr without |
| HuggingFace | `huggingface.co/api/models?sort=downloads` | None |
| Stack Overflow | `api.stackexchange.com/2.3/tags/{tag}/info` | 300 req/day |

---

## Contributing

Pull requests welcome. Some ideas:

- **Add a new provider** — add an entry to `scripts/fetch_data.py` and `frontend/src/components/providers.js`
- **Add npm download stats** — similar to PyPI, using `api.npmjs.org`
- **Add Reddit/HN mention tracking** — using Pushshift or HNAPI
- **Improve the mobile layout**
- **Add a "this week vs last week" comparison email digest**

---

## Project Structure

```
ai-trends/
├── .github/
│   └── workflows/
│       └── fetch-data.yml     # Daily cron → fetch → build → deploy
├── scripts/
│   ├── fetch_data.py          # Fetches all 4 data sources, appends to history
│   └── seed_data.py           # One-time: generates 90 days of realistic fake data
├── frontend/                  # React + Vite + Recharts dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── HotRightNow.jsx    # Biggest mover this week
│   │       ├── TrendChart.jsx     # Main line chart (the hero)
│   │       ├── PyPIChart.jsx      # Current snapshot bar charts
│   │       └── ComparisonTable.jsx # Full table + GitHub stars
│   └── public/
│       └── history.json       # Copied here by workflow before build
├── data/
│   └── history.json           # Accumulated daily snapshots (source of truth)
└── README.md
```

---

## License

MIT. Do whatever you want with it.

---

*Built with zero dollars, zero servers, and a lot of curiosity about which AI is actually winning.*
