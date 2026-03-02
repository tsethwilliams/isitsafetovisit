# 🌍 IsItSafeToVisit.com — Automated City Safety Engine

An AI-powered system that continuously researches, scores, ranks, and updates city safety profiles for travelers worldwide. Built on Claude (Anthropic API) with web search for real-time data.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   GitHub Actions                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Weekly    │  │ Daily    │  │ Every 6 hours      │ │
│  │ Full Run  │  │ Refresh  │  │ Alert Monitor      │ │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘ │
│       └──────────────┼─────────────────┘             │
│                      ▼                                │
│              ┌───────────────┐                        │
│              │   agent.py    │                        │
│              │  Orchestrator │                        │
│              └───────┬───────┘                        │
│                      │                                │
│         ┌────────────┼────────────┐                   │
│         ▼            ▼            ▼                   │
│  ┌─────────────┐ ┌────────┐ ┌──────────┐            │
│  │ Claude API  │ │ Scorer │ │ Ranker   │            │
│  │ + Web Search│ │        │ │          │            │
│  └─────────────┘ └────────┘ └──────────┘            │
│         │                                             │
│         ▼                                             │
│  ┌─────────────────────────────────────┐             │
│  │        data/cities/*.json           │             │
│  │        data/rankings.json           │             │
│  │        logs/changelog.json          │             │
│  └─────────────────────────────────────┘             │
│         │                                             │
│         ▼                                             │
│  ┌─────────────────────────────────────┐             │
│  │     Site Rebuild (Vercel/Netlify)   │             │
│  └─────────────────────────────────────┘             │
└──────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/isitsafetovisit-engine.git
cd isitsafetovisit-engine
pip install anthropic
```

### 2. Set API Key

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Generate Seed Queue

```bash
python agent.py --mode seed
```

This creates `data/city_queue.json` with 100 starter cities.

### 4. Add Cities

```bash
# Add next batch (5 cities from queue)
python agent.py --mode add

# Add a specific city
python agent.py --mode single --city "Tokyo, Japan"
```

### 5. Refresh & Rank

```bash
# Refresh stale cities (>30 days old)
python agent.py --mode refresh

# Recalculate all rankings
python agent.py --mode rank

# Check for breaking safety events
python agent.py --mode alert

# Run everything
python agent.py --mode full
```

## Pipeline Modes

| Mode | What It Does | Recommended Schedule |
|---|---|---|
| `full` | Refresh + Add + Rank + Alerts | Weekly (Sunday 2 AM) |
| `refresh` | Update stale cities (>30 days) | Daily (3 AM) |
| `add` | Add next 5 cities from queue | With full pipeline |
| `rank` | Recalculate all rankings | After any data change |
| `alert` | Monitor breaking safety events | Every 6 hours |
| `single` | Process one specific city | On-demand |
| `seed` | Generate initial 100-city queue | One-time setup |

## Configuration

Edit `CONFIG` in `agent.py`:

```python
CONFIG = {
    "model": "claude-sonnet-4-20250514",     # Claude model to use
    "staleness_threshold_days": 30,           # Days before refresh
    "batch_size_add": 5,                      # Cities to add per run
    "batch_size_refresh": 10,                 # Cities to refresh per run
    "confidence_threshold": 0.6,              # Min data confidence
}
```

## Safety Scoring

### Categories & Weights

| Category | Weight | What It Measures |
|---|---|---|
| Crime | 25% | Violent crime, theft, organized crime |
| Health | 15% | Disease, healthcare, air/water quality |
| Political Stability | 15% | Unrest, terrorism, governance |
| Infrastructure | 10% | Transport, emergency services |
| Natural Disaster | 10% | Environmental hazards |
| Scams & Fraud | 10% | Tourist scams, digital fraud |
| LGBTQ+ Safety | 5% | Legal protections, social acceptance |
| Women's Safety | 5% | Harassment, solo travel safety |
| Night Safety | 5% | After-dark considerations |

### Safety Tiers

| Score | Tier | Meaning |
|---|---|---|
| 85–100 | 🟢 Very Safe | Minimal precautions needed |
| 70–84 | 🟢 Generally Safe | Standard travel awareness |
| 55–69 | 🟡 Moderate Risk | Extra caution recommended |
| 40–54 | 🟠 Elevated Risk | Significant precautions needed |
| 0–39 | 🔴 High Risk | Avoid non-essential travel |

## Data Sources

The agent pulls from authoritative sources via web search:

**Tier 1 (Authoritative):** US State Dept, UK FCDO, WHO, CDC, UNODC, Global Peace Index

**Tier 2 (Reliable):** OSAC, Numbeo, IQAir, Freedom House, ILGA World

**Tier 3 (Community):** TripAdvisor, Reddit, Lonely Planet, Google Reviews

**Tier 4 (News):** Google News, Reuters, AP, BBC, local press

## GitHub Actions Setup

1. Add `ANTHROPIC_API_KEY` to repository secrets
2. Optionally add `DEPLOY_HOOK_URL` for auto-deploy
3. The workflows in `.github/workflows/` handle scheduling automatically

## File Structure

```
├── agent.py                          # Main orchestration agent
├── data/
│   ├── cities/                       # Individual city JSON files
│   │   ├── tokyo-japan.json
│   │   ├── bangkok-thailand.json
│   │   └── ...
│   ├── city_queue.json               # Cities waiting to be added
│   └── rankings.json                 # Global rankings summary
├── logs/
│   ├── agent.log                     # Runtime logs
│   └── changelog.json                # All changes with timestamps
├── .github/
│   └── workflows/
│       └── city-agent.yml            # Automated scheduling
└── README.md
```

## Adding Cities Manually

Add to `data/city_queue.json`:

```json
[
  {"name": "Tbilisi", "country": "Georgia", "region": "Caucasus"},
  {"name": "Porto", "country": "Portugal", "region": "Southern Europe"}
]
```

Then run: `python agent.py --mode add`

## Monitoring

- **Changelog:** `logs/changelog.json` tracks every add, refresh, and alert
- **GitHub Actions:** View run history in the Actions tab
- **Alerts:** Critical alerts trigger immediate city refreshes

## Cost Estimation

Using Claude Sonnet with web search:
- New city generation: ~$0.05–0.10 per city
- City refresh: ~$0.03–0.08 per city
- Alert check: ~$0.02–0.05 per run

Estimated monthly cost for 100 cities: ~$15–30/month
