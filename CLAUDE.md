# AI Trends — Project Guide

## What This Project Is
A live dashboard website that tracks which AI models/providers (ChatGPT, Claude, Gemini, Llama, Mistral, etc.) developers are actually adopting — using real data, not hype. It answers: "Which AI is winning right now?" with charts and numbers.

## Architecture: Zero-Server, Zero-Cost
Everything runs on GitHub infrastructure. No backend server. No hosting payments.

```
GitHub Actions (daily cron) → fetches data from free APIs → commits data.json → GitHub Pages serves static React site
```

### Data Pipeline (GitHub Actions)
- A **Python script** runs daily via GitHub Actions scheduled workflow
- Fetches data from 4 free APIs (details below)
- Writes results to `data/history.json` (append daily snapshot)
- Commits and pushes automatically

### Frontend (GitHub Pages)
- Static **React** site (built with Vite)
- Reads `data/history.json` at load time
- Renders charts using **Recharts**
- Deployed automatically from `gh-pages` branch or `/docs` folder

## Data Sources — All Free, No Auth Required

### 1. PyPI Download Stats (PRIMARY — most reliable signal)
- **API**: `https://pypistats.org/api/packages/{package}/recent` 
- **No API key needed**. No signup. No rate limit issues for daily use.
- **Packages to track**:
  - `openai` (OpenAI / ChatGPT)
  - `anthropic` (Claude)
  - `google-generativeai` (Gemini)
  - `mistralai` (Mistral)
  - `cohere` (Cohere)
  - `groq` (Groq)
  - `ollama` (Ollama / local models)
  - `huggingface-hub` (HuggingFace ecosystem)
  - `replicate` (Replicate)
  - `together` (Together AI)
- Returns: `last_day`, `last_week`, `last_month` download counts
- Also use: `https://pypistats.org/api/packages/{package}/overall?mirrors=false` for time series (last 180 days)

### 2. GitHub Stars (developer interest signal)
- **API**: `https://api.github.com/repos/{owner}/{repo}`
- **Needs**: GitHub Personal Access Token (free, no payment, created from GitHub settings)
- **Rate limit**: 5,000 requests/hour (more than enough)
- **Repos to track**:
  - `openai/openai-python`
  - `anthropics/anthropic-sdk-python`
  - `google-gemini/generative-ai-python`
  - `mistralai/client-python`
  - `ollama/ollama`
  - `huggingface/transformers`
  - `langchain-ai/langchain`
  - `BerriAI/litellm`
- Track: `stargazers_count`, `forks_count`, `open_issues_count`, `updated_at`

### 3. HuggingFace Model Stats (open model popularity)
- **API**: `https://huggingface.co/api/models?sort=downloads&limit=20`
- **No API key needed**
- Track top downloaded models and their download counts

### 4. Stack Overflow Questions (developer adoption signal)
- **API**: `https://api.stackexchange.com/2.3/tags/{tag}/info?site=stackoverflow`
- **No API key needed** (300 requests/day free)
- **Tags to track**: `openai-api`, `chatgpt-api`, `anthropic-claude`, `google-gemini`, `langchain`, `huggingface`

## File Structure

```
ai-trends/
├── .github/
│   └── workflows/
│       └── fetch-data.yml          # Daily cron job
├── scripts/
│   └── fetch_data.py               # Python data fetcher
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TrendChart.jsx      # Main line chart (star of the show)
│   │   │   ├── PyPIChart.jsx       # Downloads bar/line chart
│   │   │   ├── ComparisonTable.jsx # Side-by-side model stats
│   │   │   ├── HotRightNow.jsx    # "Trending this week" card
│   │   │   └── Header.jsx
│   │   ├── data/                   # Symlinked or copied from root data/
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── data/
│   └── history.json                # Accumulated daily snapshots
├── CLAUDE.md
└── README.md
```

## Design Requirements

### Aesthetic Direction
- **Dark theme** — rich dark background, not pure black. Think deep navy/charcoal.
- **Data-forward** — the charts are the hero, everything else supports them
- **Clean, editorial feel** — like a Bloomberg terminal meets a modern analytics dashboard
- **Color coding per provider**: 
  - OpenAI: green (#10a37f)
  - Anthropic: coral/orange (#d97706 or their brand tan)
  - Google/Gemini: blue (#4285f4)
  - Meta/Llama: blue (#0668E1)
  - Mistral: orange (#FF7000)
  - HuggingFace: yellow (#FFD21E)
- **Typography**: Use a distinctive monospace or technical font for numbers, paired with a clean sans-serif. Load from Google Fonts.
- **Animations**: Subtle chart entry animations. Numbers should feel alive.
- **Must look amazing in a single screenshot** — this is going on a GitHub README

### Key Visual Sections (top to bottom)
1. **Header**: Project name, "Updated daily" badge with last update timestamp
2. **Hot Right Now**: Card showing which model had the biggest growth this week (% change in PyPI downloads)
3. **Main Trend Chart**: Line chart showing PyPI weekly downloads over the last 90-180 days for all tracked providers. This is the centerpiece.
4. **GitHub Stars Comparison**: Bar chart or race chart showing cumulative stars
5. **Comparison Table**: Clean table with all metrics side by side
6. **Footer**: "Data from PyPI, GitHub, HuggingFace, Stack Overflow. Updated daily via GitHub Actions."

### Responsive
- Must look good on desktop (for the README screenshot) and mobile (for people visiting the live site)

## Developer Context
- The developer's primary language is **Java/Kotlin** but the data script should be in **Python** (better library support for these APIs + GitHub Actions has Python pre-installed)
- Frontend will be built using **React + Vite + Recharts** (use Claude Code for this)
- The developer is based in **Iran** — important constraints:
  - **GitHub works** (OFAC license granted for Iran)
  - **No paid services**. Zero. Not even $1.
  - **No credit card or KYC signups** for any service
  - **GitHub Pages** for hosting (free, no signup beyond GitHub account)
  - **GitHub Actions** for the cron job (free for public repos)
  - All API data sources must be **free and require no API key** (except GitHub token which is free)
  - The GitHub Personal Access Token should be stored as a **GitHub Actions secret** (never committed)

## GitHub Actions Workflow Requirements
- **Schedule**: Run once daily (e.g., `cron: '0 6 * * *'`)
- **Steps**: 
  1. Checkout repo
  2. Setup Python
  3. Install requests library
  4. Run `scripts/fetch_data.py`
  5. Commit and push updated `data/history.json` (only if changed)
- **Permissions**: needs `contents: write` to push commits
- The workflow should also build the React frontend and deploy to GitHub Pages

## Data Schema for history.json

```json
{
  "last_updated": "2026-05-21T06:00:00Z",
  "snapshots": [
    {
      "date": "2026-05-21",
      "pypi": {
        "openai": { "last_day": 123456, "last_week": 876543, "last_month": 3456789 },
        "anthropic": { "last_day": 45678, "last_week": 312345, "last_month": 1234567 }
      },
      "github": {
        "openai/openai-python": { "stars": 12345, "forks": 678 },
        "anthropics/anthropic-sdk-python": { "stars": 5678, "forks": 234 }
      },
      "stackoverflow": {
        "openai-api": { "count": 23456 },
        "anthropic-claude": { "count": 1234 }
      },
      "huggingface_top_models": [
        { "name": "meta-llama/Llama-3-8B", "downloads": 45678901 }
      ]
    }
  ]
}
```

## README Requirements
The README.md should be compelling and include:
1. A **banner/hero image** placeholder (screenshot of the live dashboard)
2. **One-liner**: "Track which AI models developers are actually using — with real data, updated daily."
3. **Live demo link**: `https://{username}.github.io/ai-trends`
4. **Data sources** section explaining where the data comes from
5. **"Why this exists"** section: "Twitter hype doesn't tell you which AI developers are actually adopting. PyPI downloads, GitHub stars, and Stack Overflow questions do."
6. **Architecture** section with a simple diagram
7. **Contributing** section
8. **License**: MIT

## Important Notes
- NEVER hardcode any API keys or tokens. Use environment variables / GitHub Actions secrets.
- The Python script must handle API failures gracefully (try/except, continue if one source fails)
- The site must work even if some data sources are temporarily unavailable
- Keep the data file size manageable — store daily snapshots but consider pruning data older than 1 year
- The frontend should show a "Last updated: X hours ago" indicator so visitors know the data is fresh
