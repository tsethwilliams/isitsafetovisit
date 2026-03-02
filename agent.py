#!/usr/bin/env python3
"""
IsItSafeToVisit.com — City Safety Automation Agent
===================================================
Powered by Claude Code / Anthropic API

This agent automates:
1. Adding new cities to the platform
2. Refreshing stale city data
3. Recalculating safety rankings
4. Monitoring breaking safety events
5. Generating/revising city content

Usage:
  python agent.py --mode full          # Full pipeline: refresh + add + rank
  python agent.py --mode refresh       # Refresh stale cities only
  python agent.py --mode add           # Add new cities from queue
  python agent.py --mode rank          # Recalculate all rankings
  python agent.py --mode alert         # Check for breaking safety events
  python agent.py --mode single --city "Tokyo, Japan"  # Process single city

Scheduling (cron examples):
  # Full pipeline — weekly on Sunday at 2 AM
  0 2 * * 0 cd /path/to/project && python agent.py --mode full

  # Alert monitoring — every 6 hours
  0 */6 * * * cd /path/to/project && python agent.py --mode alert

  # Stale city refresh — daily at 3 AM
  0 3 * * * cd /path/to/project && python agent.py --mode refresh
"""

import json
import os
import sys
import argparse
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import anthropic

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CONFIG = {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "data_dir": Path("./data/cities"),
    "queue_file": Path("./data/city_queue.json"),
    "rankings_file": Path("./data/rankings.json"),
    "log_file": Path("./logs/agent.log"),
    "changelog_file": Path("./logs/changelog.json"),
    "staleness_threshold_days": 30,
    "batch_size_add": 5,       # New cities to add per run
    "batch_size_refresh": 10,  # Stale cities to refresh per run
    "confidence_threshold": 0.6,
}

# Category weights for overall score calculation
CATEGORY_WEIGHTS = {
    "crime": 0.25,
    "health": 0.15,
    "political_stability": 0.15,
    "infrastructure": 0.10,
    "natural_disaster": 0.10,
    "scams_and_fraud": 0.10,
    "lgbtq_safety": 0.05,
    "women_safety": 0.05,
    "night_safety": 0.05,
}

SAFETY_TIERS = [
    (85, 100, "very_safe", "Very Safe"),
    (70, 84, "generally_safe", "Generally Safe"),
    (55, 69, "moderate", "Moderate Risk"),
    (40, 54, "elevated", "Elevated Risk"),
    (0, 39, "high_risk", "High Risk"),
]

# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------

def setup_logging():
    CONFIG["log_file"].parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(CONFIG["log_file"]),
            logging.StreamHandler(sys.stdout),
        ],
    )

# ---------------------------------------------------------------------------
# Anthropic Client
# ---------------------------------------------------------------------------

def get_client():
    """Initialize Anthropic client. Expects ANTHROPIC_API_KEY env var."""
    return anthropic.Anthropic()


def call_claude(client, system_prompt: str, user_prompt: str, use_search: bool = True) -> str:
    """Call Claude with optional web search tool."""
    tools = []
    if use_search:
        tools.append({"type": "web_search_20250305", "name": "web_search"})

    messages = [{"role": "user", "content": user_prompt}]

    response = client.messages.create(
        model=CONFIG["model"],
        max_tokens=CONFIG["max_tokens"],
        system=system_prompt,
        messages=messages,
        tools=tools if tools else anthropic.NOT_GIVEN,
    )

    # Extract text from response blocks
    text_parts = []
    for block in response.content:
        if hasattr(block, "text"):
            text_parts.append(block.text)

    return "\n".join(text_parts)


# ---------------------------------------------------------------------------
# City Data Management
# ---------------------------------------------------------------------------

def load_city(city_id: str) -> Optional[dict]:
    """Load a city's data file."""
    path = CONFIG["data_dir"] / f"{city_id}.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return None


def save_city(city_data: dict):
    """Save a city's data file."""
    CONFIG["data_dir"].mkdir(parents=True, exist_ok=True)
    city_id = city_data["city_id"]
    path = CONFIG["data_dir"] / f"{city_id}.json"
    with open(path, "w") as f:
        json.dump(city_data, f, indent=2, default=str)
    logging.info(f"Saved city data: {city_id}")


def get_all_cities() -> list[dict]:
    """Load all city data files."""
    cities = []
    if CONFIG["data_dir"].exists():
        for file in CONFIG["data_dir"].glob("*.json"):
            with open(file) as f:
                cities.append(json.load(f))
    return cities


def get_stale_cities(threshold_days: int = None) -> list[dict]:
    """Find cities whose data is older than threshold."""
    threshold = threshold_days or CONFIG["staleness_threshold_days"]
    cutoff = datetime.now(timezone.utc) - timedelta(days=threshold)
    stale = []
    for city in get_all_cities():
        last_updated = datetime.fromisoformat(city.get("last_updated", "2020-01-01T00:00:00Z"))
        if last_updated.tzinfo is None:
            last_updated = last_updated.replace(tzinfo=timezone.utc)
        if last_updated < cutoff:
            stale.append(city)
    return sorted(stale, key=lambda c: c["last_updated"])


def load_queue() -> list[dict]:
    """Load the city addition queue."""
    if CONFIG["queue_file"].exists():
        with open(CONFIG["queue_file"]) as f:
            return json.load(f)
    return []


def save_queue(queue: list):
    """Save the city addition queue."""
    CONFIG["queue_file"].parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG["queue_file"], "w") as f:
        json.dump(queue, f, indent=2)


# ---------------------------------------------------------------------------
# Changelog
# ---------------------------------------------------------------------------

def log_change(action: str, city_id: str, details: str):
    """Append to the changelog."""
    CONFIG["changelog_file"].parent.mkdir(parents=True, exist_ok=True)
    changelog = []
    if CONFIG["changelog_file"].exists():
        with open(CONFIG["changelog_file"]) as f:
            changelog = json.load(f)

    changelog.append({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "city_id": city_id,
        "details": details,
    })

    with open(CONFIG["changelog_file"], "w") as f:
        json.dump(changelog, f, indent=2, default=str)


# ---------------------------------------------------------------------------
# Score Calculation
# ---------------------------------------------------------------------------

def calculate_overall_score(scores: dict) -> float:
    """Calculate weighted overall safety score."""
    total = 0
    for category, weight in CATEGORY_WEIGHTS.items():
        if category in scores:
            total += scores[category]["score"] * weight
    return round(total, 1)


def determine_tier(score: float) -> tuple[str, str]:
    """Determine safety tier from score."""
    for low, high, tier_id, tier_label in SAFETY_TIERS:
        if low <= score <= high:
            return tier_id, tier_label
    return "moderate", "Moderate Risk"


def calculate_trend(city_data: dict, new_score: float) -> str:
    """Determine if city safety is improving, stable, or declining."""
    old_score = city_data.get("overall_safety_score", new_score)
    diff = new_score - old_score
    if diff >= 3:
        return "improving"
    elif diff <= -3:
        return "declining"
    return "stable"


# ---------------------------------------------------------------------------
# Core Agent Functions
# ---------------------------------------------------------------------------

SYSTEM_PROMPT_GENERATE = """You are a travel safety research analyst for IsItSafeToVisit.com.
Your job is to produce comprehensive, accurate, and actionable safety assessments for cities worldwide.

CRITICAL RULES:
1. Be factual and evidence-based. Cite specific data points when possible.
2. Score on a 0-100 scale where 100 = safest.
3. Be balanced — acknowledge both risks and positive safety factors.
4. Include practical, actionable advice travelers can use.
5. Never minimize real dangers, but don't fear-monger either.
6. Consider different traveler profiles (solo, female, LGBTQ+, families).

OUTPUT FORMAT: You MUST respond with ONLY valid JSON matching the city schema.
No markdown, no explanations — just the JSON object."""


SYSTEM_PROMPT_REFRESH = """You are a travel safety data analyst updating existing city safety profiles.
You have the current data and need to check for any changes.

CRITICAL RULES:
1. Search for the latest travel advisories, crime data, and safety events.
2. Only change scores if there's evidence supporting the change.
3. Document what changed and why in the revision notes.
4. Flag any breaking safety events immediately.
5. Update the "recent_incidents" section with anything from the last 90 days.

OUTPUT FORMAT: You MUST respond with ONLY valid JSON matching the city schema.
No markdown, no explanations — just the JSON object."""


SYSTEM_PROMPT_ALERT = """You are a breaking-news safety monitor for IsItSafeToVisit.com.
Search for recent safety events that would affect traveler safety in any of the cities listed.

Focus on:
- Travel advisory changes (State Dept, FCDO)
- Political unrest, coups, protests
- Natural disasters
- Terrorism incidents
- Disease outbreaks
- Major crime waves

OUTPUT FORMAT: Respond with a JSON array of alerts:
[{"city_id": "...", "alert_type": "...", "severity": "critical|high|medium|low", "summary": "...", "action": "update_score|add_incident|emergency_content"}]

If no alerts, respond with: []"""


def generate_city(client, city_name: str, country: str) -> dict:
    """Generate a complete safety profile for a new city."""
    logging.info(f"Generating new city profile: {city_name}, {country}")

    city_id = f"{city_name.lower().replace(' ', '-')}-{country.lower().replace(' ', '-')}"

    prompt = f"""Research and generate a complete safety profile for {city_name}, {country}.

Search for:
1. Latest US State Department travel advisory for {country}
2. Crime statistics and safety data for {city_name}
3. Health risks and healthcare quality in {city_name}
4. Political stability and civil unrest risk in {country}
5. Natural disaster risks for {city_name}
6. Common tourist scams in {city_name}
7. LGBTQ+ safety and legal status in {country}
8. Women's safety and solo female travel reports for {city_name}
9. Nightlife safety in {city_name}
10. Emergency contact numbers for {city_name}

Generate the full city JSON with city_id: "{city_id}"
Include all score categories, sub-scores, content sections, and metadata.
Set last_updated to today: {datetime.now(timezone.utc).isoformat()}
Set auto_generated: true, human_reviewed: false"""

    response = call_claude(client, SYSTEM_PROMPT_GENERATE, prompt, use_search=True)

    try:
        # Try to extract JSON from response
        city_data = extract_json(response)
        city_data["city_id"] = city_id
        city_data["overall_safety_score"] = calculate_overall_score(city_data.get("scores", {}))
        tier_id, tier_label = determine_tier(city_data["overall_safety_score"])
        city_data["safety_tier"] = tier_id
        city_data["trending"] = "stable"
        return city_data
    except Exception as e:
        logging.error(f"Failed to parse city data for {city_name}: {e}")
        logging.debug(f"Raw response: {response[:500]}")
        return None


def refresh_city(client, city_data: dict) -> dict:
    """Refresh an existing city's safety data."""
    city_name = city_data["name"]
    country = city_data["country"]
    city_id = city_data["city_id"]
    logging.info(f"Refreshing city: {city_name}, {country}")

    prompt = f"""Here is the current safety data for {city_name}, {country}:

{json.dumps(city_data, indent=2, default=str)}

Search for any updates since {city_data.get('last_updated', 'unknown')}:
1. Has the travel advisory for {country} changed?
2. Any recent crime spikes or improvements in {city_name}?
3. Any political events, protests, or instability in {country}?
4. Any disease outbreaks or health alerts for {city_name}?
5. Any natural disasters or extreme weather events?
6. Any new scam reports for {city_name}?
7. Any changes to LGBTQ+ laws or safety in {country}?

Update the JSON with any changes. Update last_updated to: {datetime.now(timezone.utc).isoformat()}
Increment revision_count. Add any recent incidents to recent_incidents array."""

    response = call_claude(client, SYSTEM_PROMPT_REFRESH, prompt, use_search=True)

    try:
        updated_data = extract_json(response)
        updated_data["city_id"] = city_id
        new_score = calculate_overall_score(updated_data.get("scores", {}))
        updated_data["trending"] = calculate_trend(city_data, new_score)
        updated_data["overall_safety_score"] = new_score
        tier_id, _ = determine_tier(new_score)
        updated_data["safety_tier"] = tier_id
        return updated_data
    except Exception as e:
        logging.error(f"Failed to refresh {city_name}: {e}")
        return city_data  # Return unchanged data on failure


def check_alerts(client, cities: list[dict]) -> list[dict]:
    """Check for breaking safety events across all cities."""
    logging.info(f"Checking alerts for {len(cities)} cities")

    city_list = ", ".join([f"{c['name']} ({c['country']})" for c in cities[:50]])

    prompt = f"""Check for any breaking safety events in the last 48 hours
that would affect travelers in these cities:

{city_list}

Search for:
1. New or changed travel advisories
2. Political unrest or protests
3. Natural disasters
4. Terrorism or major crime events
5. Disease outbreaks
6. Airport closures or transport disruptions"""

    response = call_claude(client, SYSTEM_PROMPT_ALERT, prompt, use_search=True)

    try:
        alerts = extract_json(response)
        if isinstance(alerts, list):
            return alerts
    except Exception:
        pass
    return []


def recalculate_rankings(cities: list[dict]) -> list[dict]:
    """Recalculate and sort all city rankings."""
    for city in cities:
        if "scores" in city:
            city["overall_safety_score"] = calculate_overall_score(city["scores"])
            tier_id, _ = determine_tier(city["overall_safety_score"])
            city["safety_tier"] = tier_id

    ranked = sorted(cities, key=lambda c: c.get("overall_safety_score", 0), reverse=True)
    for i, city in enumerate(ranked):
        city["global_rank"] = i + 1

    return ranked


# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------

def extract_json(text: str) -> dict | list:
    """Extract JSON from Claude's response, handling markdown fences."""
    # Strip markdown code fences if present
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Remove first and last lines (fences)
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)

    return json.loads(cleaned)


# ---------------------------------------------------------------------------
# Pipeline Modes
# ---------------------------------------------------------------------------

def run_full_pipeline(client):
    """Run the complete pipeline: refresh stale + add new + recalculate."""
    logging.info("=" * 60)
    logging.info("FULL PIPELINE START")
    logging.info("=" * 60)

    # Step 1: Refresh stale cities
    run_refresh(client)

    # Step 2: Add new cities from queue
    run_add_cities(client)

    # Step 3: Recalculate all rankings
    run_rankings()

    # Step 4: Check for alerts
    run_alerts(client)

    logging.info("FULL PIPELINE COMPLETE")


def run_refresh(client):
    """Refresh stale cities."""
    stale = get_stale_cities()
    batch = stale[: CONFIG["batch_size_refresh"]]
    logging.info(f"Found {len(stale)} stale cities, refreshing {len(batch)}")

    for city in batch:
        updated = refresh_city(client, city)
        if updated:
            save_city(updated)
            log_change("refresh", city["city_id"],
                       f"Score: {city.get('overall_safety_score', '?')} → {updated.get('overall_safety_score', '?')}")


def run_add_cities(client):
    """Add new cities from the queue."""
    queue = load_queue()
    batch = queue[: CONFIG["batch_size_add"]]
    remaining = queue[CONFIG["batch_size_add"]:]
    logging.info(f"Queue has {len(queue)} cities, adding {len(batch)}")

    for entry in batch:
        city_name = entry.get("name", entry.get("city", ""))
        country = entry.get("country", "")
        if not city_name or not country:
            continue

        city_data = generate_city(client, city_name, country)
        if city_data:
            save_city(city_data)
            log_change("add", city_data["city_id"],
                       f"New city added with score {city_data.get('overall_safety_score', '?')}")

    save_queue(remaining)


def run_rankings():
    """Recalculate all rankings."""
    cities = get_all_cities()
    if not cities:
        logging.info("No cities to rank")
        return

    ranked = recalculate_rankings(cities)
    logging.info(f"Ranked {len(ranked)} cities")

    # Save updated cities with ranks
    for city in ranked:
        save_city(city)

    # Save rankings summary
    CONFIG["rankings_file"].parent.mkdir(parents=True, exist_ok=True)
    rankings_summary = [{
        "rank": c["global_rank"],
        "city_id": c["city_id"],
        "name": c["name"],
        "country": c["country"],
        "score": c["overall_safety_score"],
        "tier": c["safety_tier"],
        "trending": c.get("trending", "stable"),
    } for c in ranked]

    with open(CONFIG["rankings_file"], "w") as f:
        json.dump(rankings_summary, f, indent=2)

    log_change("rankings", "all", f"Recalculated rankings for {len(ranked)} cities")


def run_alerts(client):
    """Check for breaking safety events."""
    cities = get_all_cities()
    if not cities:
        return

    alerts = check_alerts(client, cities)
    if alerts:
        logging.warning(f"ALERTS DETECTED: {len(alerts)}")
        for alert in alerts:
            logging.warning(f"  [{alert.get('severity', '?')}] {alert.get('city_id', '?')}: {alert.get('summary', '?')}")
            log_change("alert", alert.get("city_id", "unknown"), json.dumps(alert))

            # Auto-refresh cities with critical alerts
            if alert.get("severity") == "critical":
                city = load_city(alert["city_id"])
                if city:
                    updated = refresh_city(client, city)
                    if updated:
                        save_city(updated)
    else:
        logging.info("No safety alerts detected")


def run_single_city(client, city_input: str):
    """Process a single city (add or refresh)."""
    parts = [p.strip() for p in city_input.split(",")]
    if len(parts) != 2:
        logging.error("City must be in format: 'City, Country'")
        return

    city_name, country = parts
    city_id = f"{city_name.lower().replace(' ', '-')}-{country.lower().replace(' ', '-')}"

    existing = load_city(city_id)
    if existing:
        logging.info(f"City exists, refreshing: {city_name}")
        updated = refresh_city(client, existing)
        if updated:
            save_city(updated)
            log_change("refresh", city_id, "Manual single-city refresh")
    else:
        logging.info(f"New city, generating: {city_name}")
        city_data = generate_city(client, city_name, country)
        if city_data:
            save_city(city_data)
            log_change("add", city_id, "Manual single-city addition")


# ---------------------------------------------------------------------------
# Seed Queue Generator
# ---------------------------------------------------------------------------

def generate_seed_queue():
    """Generate the initial queue of 100 cities to add."""
    seed_cities = [
        # Asia
        {"name": "Tokyo", "country": "Japan", "region": "East Asia"},
        {"name": "Bangkok", "country": "Thailand", "region": "Southeast Asia"},
        {"name": "Singapore", "country": "Singapore", "region": "Southeast Asia"},
        {"name": "Seoul", "country": "South Korea", "region": "East Asia"},
        {"name": "Hong Kong", "country": "China", "region": "East Asia"},
        {"name": "Taipei", "country": "Taiwan", "region": "East Asia"},
        {"name": "Bali", "country": "Indonesia", "region": "Southeast Asia"},
        {"name": "Hanoi", "country": "Vietnam", "region": "Southeast Asia"},
        {"name": "Ho Chi Minh City", "country": "Vietnam", "region": "Southeast Asia"},
        {"name": "Kuala Lumpur", "country": "Malaysia", "region": "Southeast Asia"},
        {"name": "Manila", "country": "Philippines", "region": "Southeast Asia"},
        {"name": "Phnom Penh", "country": "Cambodia", "region": "Southeast Asia"},
        {"name": "Mumbai", "country": "India", "region": "South Asia"},
        {"name": "New Delhi", "country": "India", "region": "South Asia"},
        {"name": "Kathmandu", "country": "Nepal", "region": "South Asia"},
        {"name": "Colombo", "country": "Sri Lanka", "region": "South Asia"},

        # Europe
        {"name": "London", "country": "United Kingdom", "region": "Western Europe"},
        {"name": "Paris", "country": "France", "region": "Western Europe"},
        {"name": "Barcelona", "country": "Spain", "region": "Southern Europe"},
        {"name": "Madrid", "country": "Spain", "region": "Southern Europe"},
        {"name": "Rome", "country": "Italy", "region": "Southern Europe"},
        {"name": "Amsterdam", "country": "Netherlands", "region": "Western Europe"},
        {"name": "Berlin", "country": "Germany", "region": "Western Europe"},
        {"name": "Munich", "country": "Germany", "region": "Western Europe"},
        {"name": "Prague", "country": "Czech Republic", "region": "Central Europe"},
        {"name": "Vienna", "country": "Austria", "region": "Central Europe"},
        {"name": "Budapest", "country": "Hungary", "region": "Central Europe"},
        {"name": "Lisbon", "country": "Portugal", "region": "Southern Europe"},
        {"name": "Athens", "country": "Greece", "region": "Southern Europe"},
        {"name": "Istanbul", "country": "Turkey", "region": "Eurasia"},
        {"name": "Dublin", "country": "Ireland", "region": "Western Europe"},
        {"name": "Edinburgh", "country": "United Kingdom", "region": "Western Europe"},
        {"name": "Copenhagen", "country": "Denmark", "region": "Northern Europe"},
        {"name": "Stockholm", "country": "Sweden", "region": "Northern Europe"},
        {"name": "Oslo", "country": "Norway", "region": "Northern Europe"},
        {"name": "Helsinki", "country": "Finland", "region": "Northern Europe"},
        {"name": "Zurich", "country": "Switzerland", "region": "Western Europe"},
        {"name": "Brussels", "country": "Belgium", "region": "Western Europe"},
        {"name": "Krakow", "country": "Poland", "region": "Central Europe"},
        {"name": "Warsaw", "country": "Poland", "region": "Central Europe"},
        {"name": "Bucharest", "country": "Romania", "region": "Eastern Europe"},
        {"name": "Sofia", "country": "Bulgaria", "region": "Eastern Europe"},
        {"name": "Tirana", "country": "Albania", "region": "Southern Europe"},
        {"name": "Tbilisi", "country": "Georgia", "region": "Caucasus"},

        # Americas
        {"name": "New York City", "country": "United States", "region": "North America"},
        {"name": "Los Angeles", "country": "United States", "region": "North America"},
        {"name": "Miami", "country": "United States", "region": "North America"},
        {"name": "San Francisco", "country": "United States", "region": "North America"},
        {"name": "Chicago", "country": "United States", "region": "North America"},
        {"name": "Las Vegas", "country": "United States", "region": "North America"},
        {"name": "Honolulu", "country": "United States", "region": "North America"},
        {"name": "Toronto", "country": "Canada", "region": "North America"},
        {"name": "Vancouver", "country": "Canada", "region": "North America"},
        {"name": "Mexico City", "country": "Mexico", "region": "Central America"},
        {"name": "Cancun", "country": "Mexico", "region": "Central America"},
        {"name": "Playa del Carmen", "country": "Mexico", "region": "Central America"},
        {"name": "San Jose", "country": "Costa Rica", "region": "Central America"},
        {"name": "Panama City", "country": "Panama", "region": "Central America"},
        {"name": "Bogota", "country": "Colombia", "region": "South America"},
        {"name": "Medellin", "country": "Colombia", "region": "South America"},
        {"name": "Cartagena", "country": "Colombia", "region": "South America"},
        {"name": "Lima", "country": "Peru", "region": "South America"},
        {"name": "Cusco", "country": "Peru", "region": "South America"},
        {"name": "Buenos Aires", "country": "Argentina", "region": "South America"},
        {"name": "Santiago", "country": "Chile", "region": "South America"},
        {"name": "Rio de Janeiro", "country": "Brazil", "region": "South America"},
        {"name": "Sao Paulo", "country": "Brazil", "region": "South America"},

        # Middle East
        {"name": "Dubai", "country": "United Arab Emirates", "region": "Middle East"},
        {"name": "Abu Dhabi", "country": "United Arab Emirates", "region": "Middle East"},
        {"name": "Doha", "country": "Qatar", "region": "Middle East"},
        {"name": "Riyadh", "country": "Saudi Arabia", "region": "Middle East"},
        {"name": "Amman", "country": "Jordan", "region": "Middle East"},
        {"name": "Tel Aviv", "country": "Israel", "region": "Middle East"},
        {"name": "Muscat", "country": "Oman", "region": "Middle East"},

        # Africa
        {"name": "Cape Town", "country": "South Africa", "region": "Southern Africa"},
        {"name": "Johannesburg", "country": "South Africa", "region": "Southern Africa"},
        {"name": "Marrakech", "country": "Morocco", "region": "North Africa"},
        {"name": "Cairo", "country": "Egypt", "region": "North Africa"},
        {"name": "Nairobi", "country": "Kenya", "region": "East Africa"},
        {"name": "Dar es Salaam", "country": "Tanzania", "region": "East Africa"},
        {"name": "Accra", "country": "Ghana", "region": "West Africa"},
        {"name": "Lagos", "country": "Nigeria", "region": "West Africa"},
        {"name": "Addis Ababa", "country": "Ethiopia", "region": "East Africa"},
        {"name": "Kigali", "country": "Rwanda", "region": "East Africa"},

        # Oceania
        {"name": "Sydney", "country": "Australia", "region": "Oceania"},
        {"name": "Melbourne", "country": "Australia", "region": "Oceania"},
        {"name": "Auckland", "country": "New Zealand", "region": "Oceania"},
        {"name": "Queenstown", "country": "New Zealand", "region": "Oceania"},
        {"name": "Fiji", "country": "Fiji", "region": "Oceania"},

        # Caribbean
        {"name": "San Juan", "country": "Puerto Rico", "region": "Caribbean"},
        {"name": "Nassau", "country": "Bahamas", "region": "Caribbean"},
        {"name": "Kingston", "country": "Jamaica", "region": "Caribbean"},
        {"name": "Havana", "country": "Cuba", "region": "Caribbean"},
        {"name": "Punta Cana", "country": "Dominican Republic", "region": "Caribbean"},
    ]

    save_queue(seed_cities)
    logging.info(f"Generated seed queue with {len(seed_cities)} cities")
    return seed_cities


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="IsItSafeToVisit.com City Safety Agent")
    parser.add_argument("--mode", choices=["full", "refresh", "add", "rank", "alert", "single", "seed"],
                        default="full", help="Pipeline mode")
    parser.add_argument("--city", type=str, help="City for single mode (format: 'City, Country')")
    args = parser.parse_args()

    setup_logging()
    logging.info(f"Agent starting — mode: {args.mode}")

    if args.mode == "seed":
        generate_seed_queue()
        return

    client = get_client()

    match args.mode:
        case "full":
            run_full_pipeline(client)
        case "refresh":
            run_refresh(client)
        case "add":
            run_add_cities(client)
        case "rank":
            run_rankings()
        case "alert":
            run_alerts(client)
        case "single":
            if not args.city:
                logging.error("--city required for single mode")
                sys.exit(1)
            run_single_city(client, args.city)


if __name__ == "__main__":
    main()
