#!/usr/bin/env python3
"""
IsItSafeToVisit.com â City Safety Automation Agent
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
  # Full pipeline â weekly on Sunday at 2 AM
  0 2 * * 0 cd /path/to/project && python agent.py --mode full

  # Alert monitoring â every 6 hours
  0 */6 * * * cd /path/to/project && python agent.py --mode alert

  # Stale city refresh â daily at 3 AM
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
    "max_tokens": 16384,
    "data_dir": Path("./data/cities"),
    "queue_file": Path("./data/city_queue.json"),
    "rankings_file": Path("./data/rankings.json"),
    "log_file": Path("./logs/agent.log"),
    "changelog_file": Path("./logs/changelog.json"),
    "staleness_threshold_days": 30,
    "batch_size_add": 8,       # New cities to add per run
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

    # Extract text from response blocks, skipping search result blocks
    text_parts = []
    for block in response.content:
        if hasattr(block, "text") and block.type == "text":
            text_parts.append(block.text)

    result = "\n".join(text_parts)
    logging.debug(f"Claude response length: {len(result)} chars")
    logging.debug(f"Claude response preview: {result[:200]}...")

    if not result.strip():
        logging.error("Claude returned empty text response")
        logging.debug(f"Response content types: {[block.type for block in response.content]}")

    return result


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
    city_id = city_data.get("city_id") or city_data.get("_city_id") or city_data.get("slug", "unknown")
    path = CONFIG["data_dir"] / f"{city_id}.json"
    with open(path, "w") as f:
        json.dump(city_data, f, indent=2, default=str, ensure_ascii=False)
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
            val = scores[category]
            # Handle both {"score": 75, ...} and plain 75
            if isinstance(val, dict):
                score_val = val.get("score", 0)
            elif isinstance(val, (int, float)):
                score_val = val
            else:
                score_val = 0
            total += score_val * weight
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
1. Be factual and evidence-based. Use data you find but write in your own words.
2. Score on a 1-10 scale where 10 = safest.
3. Be balanced â acknowledge both risks and positive safety factors.
4. Include practical, actionable advice travelers can use.
5. Never minimize real dangers, but don't fear-monger either.
6. Consider different traveler profiles (solo, female, LGBTQ+, families).
7. You MUST respond with ONLY valid JSON. No markdown fences, no explanations, no text before or after the JSON.
8. NEVER include <cite> tags, citation markers, or any HTML tags in the text. Write plain text only.
9. ALL fields shown in the schema below are REQUIRED. Do not omit any field.
10. The JSON must include: summary, quickVerdict, neighborhoods (6), scams (3-4), soloFemale, nightSafety, transport, customs, health, emergency, faq (5), relatedCities.

OUTPUT FORMAT: Respond with ONLY this exact JSON structure (no other text):
{
  "slug": "city-name",
  "name": "City Name",
  "country": "Country",
  "countryCode": "XX",
  "region": "Region Name",
  "regionSlug": "region-name",
  "lastUpdated": "2026-03-07",
  "overallScore": 7.2,
  "verdict": "Generally Safe / Moderate Caution Advised / Exercise Caution",
  "badgeLabel": "Generally Safe / Moderate Caution / Exercise Caution",
  "badgeClass": "safe / caution / danger",
  "scores": {
    "pettyCrime": 6.5,
    "violentCrime": 7.0,
    "scamRisk": 5.5,
    "womensSafety": 6.8,
    "nightSafety": 6.2,
    "transport": 7.5,
    "naturalHazards": 8.0
  },
  "summary": "2-3 sentence overview of the city's safety for tourists. Plain text only, no HTML.",
  "quickVerdict": "A paragraph giving the bottom-line safety assessment. Plain text only.",
  "neighborhoods": [
    {"name": "Neighborhood 1", "score": 8.5, "class": "safe", "description": "Description in plain text..."},
    {"name": "Neighborhood 2", "score": 6.0, "class": "caution", "description": "Description..."},
    {"name": "Neighborhood 3", "score": 3.5, "class": "danger", "description": "Description..."}
  ],
  "scams": [
    {"name": "Scam Name", "risk": "high", "description": "How it works...", "howToAvoid": "How to avoid..."}
  ],
  "soloFemale": {"overview": "Overview paragraph...", "tips": ["Tip 1", "Tip 2", "Tip 3"]},
  "nightSafety": {"overview": "Overview paragraph...", "tips": ["Tip 1", "Tip 2", "Tip 3"]},
  "transport": {"metro": "Metro info...", "rideshare": "Rideshare info...", "taxis": "Taxi info...", "tips": "Bottom line tip..."},
  "customs": ["Custom 1", "Custom 2", "Custom 3"],
  "health": {"overview": "Overview...", "water": "Water safety...", "vaccinations": "Vaccination info...", "altitude": "Climate info..."},
  "emergency": {"general": "Number", "police": "Number", "ambulance": "Number", "fire": "Number", "touristPolice": "Number or N/A", "usEmbassy": "Embassy info..."},
  "faq": [
    {"q": "Is City safe for tourists?", "a": "Answer..."},
    {"q": "Is City safe at night?", "a": "Answer..."},
    {"q": "Is City safe for solo female travelers?", "a": "Answer..."},
    {"q": "What areas should I avoid in City?", "a": "Answer..."},
    {"q": "Is it safe to use public transport in City?", "a": "Answer..."}
  ],
  "relatedCities": ["slug1", "slug2", "slug3"]
}

SCORING RULES:
- overallScore: Average of the 7 category scores, rounded to 1 decimal
- badgeClass: "safe" if overallScore >= 7.0, "caution" if 5.0-6.9, "danger" if below 5.0
- badgeLabel: "Generally Safe" / "Moderate Caution" / "Exercise Caution"
- neighborhood class: "safe" if score >= 7.0, "caution" if 5.0-6.9, "danger" if below 5.0
- Include exactly 6 neighborhoods, 3-4 scams, 5 FAQ items
- relatedCities should be slugs of cities in the same region

REGION OPTIONS: South America, Central America & Caribbean, North America, Southeast Asia, Africa, Europe, Middle East, South Asia, East Asia, Oceania"""


SYSTEM_PROMPT_REFRESH = """You are a travel safety data analyst updating existing city safety profiles.
You have the current data and need to check for any changes.

CRITICAL RULES:
1. Search for the latest travel advisories, crime data, and safety events.
2. Only change scores if there's evidence supporting the change.
3. Document what changed and why in the revision notes.
4. Flag any breaking safety events immediately.
5. Update the "recent_incidents" section with anything from the last 90 days.

OUTPUT FORMAT: You MUST respond with ONLY valid JSON matching the city schema.
No markdown, no explanations â just the JSON object."""


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
    """Generate a complete safety profile for a new city in site-ready format."""
    logging.info(f"Generating new city profile: {city_name}, {country}")

    city_id = f"{city_name.lower().replace(' ', '-')}-{country.lower().replace(' ', '-')}"
    slug = city_name.lower().replace(' ', '-')

    prompt = f"""Research and generate a complete safety profile for {city_name}, {country}.

Search for:
1. Latest US State Department travel advisory for {country}
2. Crime statistics and safety data for {city_name}
3. Health risks and healthcare quality in {city_name}
4. Natural disaster risks for {city_name}
5. Common tourist scams in {city_name}
6. Women's safety and solo female travel reports for {city_name}
7. Nightlife safety in {city_name}
8. Transport safety (metro, taxis, rideshare) in {city_name}
9. Emergency contact numbers for {city_name}
10. Local customs and etiquette in {country}

Generate the city JSON with slug: "{slug}"
Set lastUpdated to: "{datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
Include exactly 6 neighborhoods, 3-4 scams, and 5 FAQ items.
For relatedCities, use slugs of other cities in the same region.
Remember: scores are on a 1-10 scale. Respond with ONLY the JSON object."""

    max_retries = 2
    for attempt in range(max_retries + 1):
        if attempt > 0:
            logging.info(f"Retry {attempt}/{max_retries} for {city_name}")
            import time
            time.sleep(10)  # Brief pause before retry

        response = call_claude(client, SYSTEM_PROMPT_GENERATE, prompt, use_search=True)

        try:
            city_data = extract_json(response)
            # Ensure required fields exist
            city_data["slug"] = city_data.get("slug", slug)
            city_data["name"] = city_data.get("name", city_name)
            city_data["country"] = city_data.get("country", country)

            # Calculate overallScore from category scores if not present or wrong
            if "scores" in city_data:
                scores = city_data["scores"]
                score_values = [v for v in scores.values() if isinstance(v, (int, float))]
                if score_values:
                    city_data["overallScore"] = round(sum(score_values) / len(score_values), 1)

            # Set badge based on score
            score = city_data.get("overallScore", 5.0)
            if score >= 7.0:
                city_data["badgeClass"] = "safe"
                city_data["badgeLabel"] = "Generally Safe"
            elif score >= 5.0:
                city_data["badgeClass"] = "caution"
                city_data["badgeLabel"] = "Moderate Caution"
            else:
                city_data["badgeClass"] = "danger"
                city_data["badgeLabel"] = "Exercise Caution"

            # Also save to agent's data dir for tracking
            city_data["_city_id"] = city_id

            # Sanitize the data
            city_data = sanitize_city_data(city_data, city_name, country)

            return city_data
        except Exception as e:
            logging.error(f"Failed to parse city data for {city_name} (attempt {attempt + 1}): {e}")
            if attempt == max_retries:
                logging.error(f"All retries exhausted for {city_name}")
                logging.debug(f"Raw response: {response[:500]}")
                return None


def sanitize_city_data(city_data: dict, city_name: str, country: str) -> dict:
    """Strip citation tags and ensure all required fields exist."""
    import re

    def strip_cites(obj):
        """Recursively strip <cite> tags from all strings in the data."""
        if isinstance(obj, str):
            # Remove <cite ...>...</cite> tags but keep inner text
            cleaned = re.sub(r'<cite[^>]*>(.*?)</cite>', r'\1', obj)
            # Remove any remaining <cite> or </cite> tags
            cleaned = re.sub(r'</?cite[^>]*>', '', cleaned)
            return cleaned.strip()
        elif isinstance(obj, dict):
            return {k: strip_cites(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [strip_cites(item) for item in obj]
        return obj

    city_data = strip_cites(city_data)

    # Ensure all required fields exist with defaults
    defaults = {
        "health": {
            "overview": f"Healthcare in {city_name} is adequate for travelers. Pharmacies are widely available.",
            "water": "Check local advisories on tap water safety. Bottled water is widely available.",
            "vaccinations": "Ensure routine vaccinations are up to date. Check CDC recommendations before travel.",
            "altitude": f"Check local weather conditions before traveling to {city_name}."
        },
        "emergency": {
            "general": "112",
            "police": "Check local emergency number",
            "ambulance": "Check local emergency number",
            "fire": "Check local emergency number",
            "touristPolice": "N/A",
            "usEmbassy": f"Contact the nearest US Embassy or Consulate in {country}"
        },
        "faq": [
            {"q": f"Is {city_name} safe for tourists?", "a": f"{city_name} is generally safe for tourists who take standard precautions. Be aware of your surroundings and follow local safety advice."},
            {"q": f"Is {city_name} safe at night?", "a": f"Many areas of {city_name} are safe at night, but stick to well-lit, busy areas and use licensed transport."},
            {"q": f"Is {city_name} safe for solo female travelers?", "a": f"Solo female travelers can visit {city_name} safely by following standard precautions and staying aware of their surroundings."},
            {"q": f"What areas should I avoid in {city_name}?", "a": f"Check the neighborhood breakdown above for specific areas to exercise caution in {city_name}."},
            {"q": f"Is it safe to use public transport in {city_name}?", "a": f"Public transport in {city_name} is generally safe. Keep your belongings secure and be alert during rush hours."}
        ],
        "relatedCities": [],
        "customs": [f"Respect local customs and traditions in {city_name}.", "Learn a few basic phrases in the local language.", "Dress appropriately when visiting religious sites."],
        "soloFemale": {"overview": f"Solo female travel in {city_name} requires standard precautions.", "tips": ["Stay in well-reviewed accommodations.", "Share your itinerary with someone you trust.", "Trust your instincts in unfamiliar situations."]},
        "nightSafety": {"overview": f"Exercise standard nighttime precautions in {city_name}.", "tips": ["Stick to well-lit, populated areas.", "Use licensed taxis or rideshare apps.", "Avoid walking alone in unfamiliar areas late at night."]},
        "neighborhoods": [],
        "scams": [],
        "transport": {"metro": "Check local transit options.", "rideshare": "Uber and similar apps may be available.", "taxis": "Use licensed taxis.", "tips": "Plan your routes in advance."},
    }

    for field, default_val in defaults.items():
        if field not in city_data or city_data[field] is None:
            city_data[field] = default_val
            logging.warning(f"Added missing field '{field}' for {city_name}")

    return city_data


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

    # Handle both old format (city_id) and new format (name/country)
    city_names = []
    for c in cities[:50]:
        name = c.get('name', '')
        country = c.get('country', '')
        if not name:
            # Try to extract from city_id or slug
            city_id = c.get('city_id', c.get('slug', ''))
            name = city_id.replace('-', ' ').title() if city_id else 'Unknown'
        if name and name != 'Unknown':
            city_names.append(f"{name} ({country})" if country else name)

    if not city_names:
        logging.info("No valid cities to check alerts for")
        return []

    city_list = ", ".join(city_names)

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
    """Extract JSON from Claude's response, handling various formats."""
    import re

    cleaned = text.strip()

    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try stripping markdown code fences
    fence_pattern = re.compile(r'```(?:json)?\s*\n?(.*?)\n?\s*```', re.DOTALL)
    match = fence_pattern.search(cleaned)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Try finding JSON object by matching braces
    brace_start = cleaned.find('{')
    if brace_start != -1:
        depth = 0
        for i in range(brace_start, len(cleaned)):
            if cleaned[i] == '{':
                depth += 1
            elif cleaned[i] == '}':
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(cleaned[brace_start:i + 1])
                    except json.JSONDecodeError:
                        break

    # Try finding JSON array by matching brackets
    bracket_start = cleaned.find('[')
    if bracket_start != -1:
        depth = 0
        for i in range(bracket_start, len(cleaned)):
            if cleaned[i] == '[':
                depth += 1
            elif cleaned[i] == ']':
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(cleaned[bracket_start:i + 1])
                    except json.JSONDecodeError:
                        break

    raise json.JSONDecodeError("No valid JSON found in response", cleaned, 0)


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
                       f"Score: {city.get('overall_safety_score', '?')} â {updated.get('overall_safety_score', '?')}")


def run_add_cities(client):
    """Add new cities from the queue and merge into site's city-data.json."""
    queue = load_queue()
    batch = queue[: CONFIG["batch_size_add"]]
    remaining = queue[CONFIG["batch_size_add"]:]
    logging.info(f"Queue has {len(queue)} cities, adding {len(batch)}")

    new_cities = []
    for entry in batch:
        city_name = entry.get("name", entry.get("city", ""))
        country = entry.get("country", "")
        if not city_name or not country:
            continue

        city_data = generate_city(client, city_name, country)
        if city_data:
            # Save to agent's data dir
            save_city(city_data)
            new_cities.append(city_data)
            city_id = city_data.get("_city_id", city_data.get("slug", "unknown"))
            log_change("add", city_id,
                       f"New city added with score {city_data.get('overallScore', '?')}")

    save_queue(remaining)

    # Merge new cities into the site's city-data.json
    if new_cities:
        merge_into_site_data(new_cities)


def merge_into_site_data(new_cities: list[dict]):
    """Merge new city data into the site's src/lib/city-data.json."""
    site_data_path = Path("./src/lib/city-data.json")

    # Load existing site data
    if site_data_path.exists():
        with open(site_data_path) as f:
            site_data = json.load(f)
    else:
        site_data = {"cities": []}

    # Handle both formats: {"cities": [...]} or just [...]
    if isinstance(site_data, dict) and "cities" in site_data:
        cities_list = site_data["cities"]
    elif isinstance(site_data, list):
        cities_list = site_data
        site_data = {"cities": cities_list}
    else:
        cities_list = []
        site_data = {"cities": cities_list}

    existing_slugs = {c.get("slug") for c in cities_list}

    added = 0
    for city in new_cities:
        # Remove internal tracking fields
        clean_city = {k: v for k, v in city.items() if not k.startswith("_")}
        slug = clean_city.get("slug", "")

        if slug and slug not in existing_slugs:
            cities_list.append(clean_city)
            existing_slugs.add(slug)
            added += 1
            logging.info(f"Merged into site data: {clean_city.get('name', slug)}")
        elif slug in existing_slugs:
            logging.info(f"City already exists in site data, skipping: {slug}")

    if added > 0:
        with open(site_data_path, "w") as f:
            json.dump(site_data, f, indent=2, ensure_ascii=False)
        logging.info(f"Merged {added} new cities into {site_data_path}")

        # Update sitemap
        update_sitemap(new_cities)
    else:
        logging.info("No new cities to merge")


def update_sitemap(new_cities: list[dict]):
    """Add new city URLs to the sitemap."""
    sitemap_path = Path("./public/sitemap.xml")
    if not sitemap_path.exists():
        logging.warning("sitemap.xml not found, skipping sitemap update")
        return

    with open(sitemap_path) as f:
        content = f.read()

    new_entries = ""
    for city in new_cities:
        slug = city.get("slug", "")
        if slug and f"/cities/{slug}" not in content:
            new_entries += f"""  <url>
    <loc>https://www.isitsafetovisit.com/cities/{slug}</loc>
    <lastmod>{datetime.now(timezone.utc).strftime('%Y-%m-%d')}</lastmod>
    <priority>0.8</priority>
  </url>
"""

    if new_entries:
        # Insert before closing </urlset> tag
        content = content.replace("</urlset>", f"{new_entries}</urlset>")
        with open(sitemap_path, "w") as f:
            f.write(content)
        logging.info(f"Updated sitemap with {len(new_cities)} new URLs")


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
        "rank": c.get("global_rank", 0),
        "city_id": c.get("city_id", c.get("slug", "unknown")),
        "name": c.get("name", c.get("city_id", c.get("slug", "unknown")).replace("-", " ").title()),
        "country": c.get("country", ""),
        "score": c.get("overall_safety_score", c.get("overallScore", 0)),
        "tier": c.get("safety_tier", c.get("badgeClass", "unknown")),
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
    logging.info(f"Agent starting â mode: {args.mode}")

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
