# IsItSafeToVisit.com — City Data Schema & Ranking Methodology

## 1. City Data Schema

Every city on the platform follows this structured schema:

```json
{
  "city_id": "bangkok-thailand",
  "name": "Bangkok",
  "country": "Thailand",
  "region": "Southeast Asia",
  "continent": "Asia",
  "coordinates": { "lat": 13.7563, "lng": 100.5018 },
  "population": 10700000,
  "last_updated": "2026-03-01T00:00:00Z",
  "data_freshness_days": 0,
  "overall_safety_score": 72,
  "safety_tier": "moderate",
  "trending": "stable",

  "scores": {
    "crime": {
      "score": 65,
      "weight": 0.25,
      "sub_scores": {
        "violent_crime": 70,
        "petty_theft": 55,
        "organized_crime": 75,
        "hate_crime": 80
      },
      "sources": ["UNODC", "OSAC", "local police data"],
      "last_verified": "2026-02-15"
    },
    "health": {
      "score": 68,
      "weight": 0.15,
      "sub_scores": {
        "disease_risk": 60,
        "healthcare_quality": 75,
        "air_quality": 55,
        "water_safety": 70
      },
      "sources": ["WHO", "CDC", "IQAir"],
      "last_verified": "2026-02-20"
    },
    "political_stability": {
      "score": 60,
      "weight": 0.15,
      "sub_scores": {
        "government_stability": 55,
        "civil_unrest_risk": 60,
        "terrorism_risk": 70,
        "press_freedom": 50
      },
      "sources": ["State Dept", "Global Peace Index", "Freedom House"],
      "last_verified": "2026-02-10"
    },
    "infrastructure": {
      "score": 75,
      "weight": 0.10,
      "sub_scores": {
        "transportation_safety": 65,
        "road_safety": 55,
        "emergency_services": 80,
        "digital_connectivity": 85
      },
      "sources": ["WHO road safety", "ITU"],
      "last_verified": "2026-02-18"
    },
    "natural_disaster": {
      "score": 70,
      "weight": 0.10,
      "sub_scores": {
        "earthquake_risk": 75,
        "flood_risk": 55,
        "extreme_weather": 70,
        "climate_resilience": 72
      },
      "sources": ["UNDRR", "EM-DAT", "NOAA"],
      "last_verified": "2026-02-25"
    },
    "scams_and_fraud": {
      "score": 50,
      "weight": 0.10,
      "sub_scores": {
        "tourist_scams": 40,
        "digital_fraud": 55,
        "taxi_overcharging": 45,
        "counterfeit_goods": 60
      },
      "sources": ["TripAdvisor reports", "Reddit travel subs", "Lonely Planet"],
      "last_verified": "2026-02-22"
    },
    "lgbtq_safety": {
      "score": 55,
      "weight": 0.05,
      "sub_scores": {
        "legal_protections": 50,
        "social_acceptance": 65,
        "violence_risk": 55
      },
      "sources": ["ILGA World", "Equaldex", "State Dept"],
      "last_verified": "2026-02-14"
    },
    "women_safety": {
      "score": 60,
      "weight": 0.05,
      "sub_scores": {
        "street_harassment": 50,
        "gender_based_violence": 65,
        "solo_travel_friendliness": 60
      },
      "sources": ["Georgetown WPS Index", "TrustPilot", "travel blogs"],
      "last_verified": "2026-02-16"
    },
    "night_safety": {
      "score": 58,
      "weight": 0.05,
      "sub_scores": {
        "nightlife_areas": 55,
        "late_night_transport": 65,
        "drink_spiking_risk": 50
      },
      "sources": ["OSAC", "local reports"],
      "last_verified": "2026-02-19"
    }
  },

  "content": {
    "summary": "Bangkok is a vibrant, generally safe city for tourists...",
    "detailed_overview": "...",
    "neighborhoods": {
      "safest": ["Silom", "Sukhumvit", "Rattanakosin"],
      "avoid": ["Khlong Toei (late night)"],
      "details": {}
    },
    "practical_tips": [],
    "emergency_info": {
      "police": "191",
      "ambulance": "1669",
      "tourist_police": "1155",
      "embassy_info": {}
    },
    "seasonal_considerations": [],
    "recent_incidents": [],
    "traveler_reviews_summary": ""
  },

  "metadata": {
    "created_date": "2026-01-15",
    "revision_count": 3,
    "content_version": "1.3",
    "auto_generated": true,
    "human_reviewed": false,
    "data_confidence": 0.82
  }
}
```

## 2. Safety Score Calculation

### Overall Score Formula

```
overall_safety_score = Σ (category_score × category_weight) × confidence_multiplier
```

Where:
- Each category score is 0–100 (100 = safest)
- Weights sum to 1.0
- Confidence multiplier = 0.85–1.0 based on data recency and source quality

### Category Weights

| Category | Weight | Rationale |
|---|---|---|
| Crime | 0.25 | Highest direct impact on traveler safety |
| Health | 0.15 | Disease, air quality, healthcare access |
| Political Stability | 0.15 | Unrest, terrorism, governance |
| Infrastructure | 0.10 | Transport, emergency services |
| Natural Disaster | 0.10 | Environmental risks |
| Scams & Fraud | 0.10 | Financial/personal safety |
| LGBTQ+ Safety | 0.05 | Legal and social environment |
| Women's Safety | 0.05 | Gender-specific risks |
| Night Safety | 0.05 | After-dark considerations |

### Safety Tiers

| Tier | Score Range | Label | Color |
|---|---|---|---|
| 1 | 85–100 | Very Safe | Green |
| 2 | 70–84 | Generally Safe | Light Green |
| 3 | 55–69 | Moderate Risk | Yellow |
| 4 | 40–54 | Elevated Risk | Orange |
| 5 | 0–39 | High Risk | Red |

### Trending Indicators

- **improving** — Score increased ≥3 points in last 90 days
- **stable** — Score changed <3 points in last 90 days
- **declining** — Score decreased ≥3 points in last 90 days
- **alert** — Breaking safety event detected

### Data Confidence Score

```
confidence = (source_quality × 0.4) + (data_recency × 0.3) + (source_count × 0.3)
```

- source_quality: 0–1 based on authority of sources (State Dept = 1.0, Reddit = 0.4)
- data_recency: 1.0 if <30 days, 0.8 if 30–90, 0.5 if 90–180, 0.3 if >180
- source_count: min(sources_used / 5, 1.0)

## 3. Data Sources Priority

### Tier 1 — Authoritative (weight: 1.0)
- US State Department Travel Advisories
- UK FCDO Travel Advice
- WHO Disease Outbreak News
- CDC Travel Health Notices
- UNODC Crime Statistics
- Global Peace Index

### Tier 2 — Reliable (weight: 0.75)
- OSAC Crime & Safety Reports
- Numbeo Crime Index
- IQAir Air Quality
- Freedom House Index
- ILGA World LGBTQ+ Laws
- Georgetown WPS Index

### Tier 3 — Community (weight: 0.5)
- TripAdvisor safety reviews
- Reddit r/travel, r/solotravel
- Lonely Planet Thorntree
- Google Maps reviews
- Travel blog aggregation

### Tier 4 — News Monitoring (weight: 0.6)
- Google News alerts
- Reuters, AP, BBC World
- Local English-language press
- Social media monitoring (X/Twitter)

## 4. City Expansion Strategy

### Phase 1 — Launch (100 cities)
Top tourist destinations by international arrivals:
- All capital cities of G20 nations
- Top 50 most-visited cities globally (Euromonitor)
- Key backpacker trail cities (Southeast Asia, Central America, South America)

### Phase 2 — Growth (250 cities)
- Secondary tourist cities in popular countries
- Emerging destinations (e.g., Tirana, Medellín, Tbilisi)
- Cruise port cities
- Business travel hubs

### Phase 3 — Comprehensive (500+ cities)
- All cities with >500K international visitors/year
- User-requested cities (tracked via search analytics)
- Regional safety hubs

## 5. Content Refresh Rules

| Trigger | Action | Priority |
|---|---|---|
| City data >30 days old | Full refresh | Normal |
| Travel advisory change | Immediate update | Critical |
| Natural disaster | Emergency content update | Critical |
| Political unrest/coup | Emergency content update | Critical |
| Pandemic/disease outbreak | Health section update | High |
| Score change >5 points | Ranking recalculation + content update | High |
| New data source available | Incorporate and recalculate | Normal |
| User reports (threshold: 10+) | Investigation + potential update | Normal |
| Seasonal change | Seasonal tips refresh | Low |
