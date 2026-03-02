import { useState, useEffect } from "react";

const SAMPLE_CITIES = [
  { rank: 1, name: "Tokyo", country: "Japan", score: 92, tier: "very_safe", trending: "stable", lastUpdated: "2 days ago", categories: { crime: 95, health: 90, political: 92, infrastructure: 95, disaster: 75, scams: 88, lgbtq: 85, women: 93, night: 90 } },
  { rank: 2, name: "Singapore", country: "Singapore", score: 91, tier: "very_safe", trending: "stable", lastUpdated: "1 day ago", categories: { crime: 96, health: 92, political: 95, infrastructure: 97, disaster: 85, scams: 82, lgbtq: 60, women: 95, night: 92 } },
  { rank: 3, name: "Copenhagen", country: "Denmark", score: 90, tier: "very_safe", trending: "improving", lastUpdated: "3 days ago", categories: { crime: 92, health: 93, political: 95, infrastructure: 93, disaster: 90, scams: 85, lgbtq: 95, women: 92, night: 88 } },
  { rank: 4, name: "Zurich", country: "Switzerland", score: 89, tier: "very_safe", trending: "stable", lastUpdated: "5 days ago", categories: { crime: 94, health: 95, political: 96, infrastructure: 92, disaster: 88, scams: 80, lgbtq: 88, women: 90, night: 85 } },
  { rank: 5, name: "Sydney", country: "Australia", score: 87, tier: "very_safe", trending: "stable", lastUpdated: "4 days ago", categories: { crime: 85, health: 92, political: 93, infrastructure: 90, disaster: 72, scams: 82, lgbtq: 92, women: 88, night: 85 } },
  { rank: 6, name: "Auckland", country: "New Zealand", score: 86, tier: "very_safe", trending: "stable", lastUpdated: "6 days ago", categories: { crime: 85, health: 90, political: 95, infrastructure: 85, disaster: 70, scams: 85, lgbtq: 93, women: 90, night: 82 } },
  { rank: 7, name: "Toronto", country: "Canada", score: 84, tier: "generally_safe", trending: "stable", lastUpdated: "2 days ago", categories: { crime: 82, health: 90, political: 92, infrastructure: 88, disaster: 82, scams: 78, lgbtq: 90, women: 85, night: 80 } },
  { rank: 8, name: "London", country: "United Kingdom", score: 81, tier: "generally_safe", trending: "stable", lastUpdated: "1 day ago", categories: { crime: 75, health: 88, political: 85, infrastructure: 90, disaster: 88, scams: 70, lgbtq: 90, women: 78, night: 72 } },
  { rank: 9, name: "Lisbon", country: "Portugal", score: 80, tier: "generally_safe", trending: "improving", lastUpdated: "3 days ago", categories: { crime: 80, health: 82, political: 88, infrastructure: 78, disaster: 78, scams: 72, lgbtq: 88, women: 82, night: 75 } },
  { rank: 10, name: "Dubai", country: "UAE", score: 79, tier: "generally_safe", trending: "stable", lastUpdated: "2 days ago", categories: { crime: 92, health: 85, political: 78, infrastructure: 95, disaster: 82, scams: 65, lgbtq: 30, women: 68, night: 80 } },
  { rank: 11, name: "Seoul", country: "South Korea", score: 78, tier: "generally_safe", trending: "stable", lastUpdated: "4 days ago", categories: { crime: 82, health: 85, political: 75, infrastructure: 92, disaster: 70, scams: 72, lgbtq: 45, women: 70, night: 78 } },
  { rank: 12, name: "Bangkok", country: "Thailand", score: 72, tier: "generally_safe", trending: "stable", lastUpdated: "1 day ago", categories: { crime: 65, health: 68, political: 60, infrastructure: 75, disaster: 70, scams: 50, lgbtq: 55, women: 60, night: 58 } },
  { rank: 13, name: "Mexico City", country: "Mexico", score: 62, tier: "moderate", trending: "improving", lastUpdated: "2 days ago", categories: { crime: 45, health: 65, political: 60, infrastructure: 70, disaster: 58, scams: 55, lgbtq: 70, women: 50, night: 45 } },
  { rank: 14, name: "Bogota", country: "Colombia", score: 58, tier: "moderate", trending: "improving", lastUpdated: "5 days ago", categories: { crime: 42, health: 62, political: 55, infrastructure: 65, disaster: 65, scams: 50, lgbtq: 60, women: 48, night: 40 } },
  { rank: 15, name: "Cairo", country: "Egypt", score: 52, tier: "elevated", trending: "declining", lastUpdated: "3 days ago", categories: { crime: 55, health: 48, political: 42, infrastructure: 50, disaster: 72, scams: 35, lgbtq: 15, women: 30, night: 38 } },
  { rank: 16, name: "Lagos", country: "Nigeria", score: 42, tier: "elevated", trending: "stable", lastUpdated: "7 days ago", categories: { crime: 32, health: 38, political: 40, infrastructure: 35, disaster: 55, scams: 28, lgbtq: 10, women: 35, night: 25 } },
];

const CHANGELOG = [
  { time: "2 min ago", action: "refresh", city: "London", detail: "Score: 80 → 81 (crime stats improved)" },
  { time: "15 min ago", action: "alert", city: "Istanbul", detail: "Protest activity detected near Taksim Square" },
  { time: "1 hr ago", action: "add", city: "Tbilisi", detail: "New city added — Score: 76 (Generally Safe)" },
  { time: "3 hrs ago", action: "refresh", city: "Bangkok", detail: "Score: 71 → 72 (air quality improved)" },
  { time: "6 hrs ago", action: "alert_clear", city: "Athens", detail: "Transport strike ended, score restored" },
  { time: "12 hrs ago", action: "add", city: "Porto", detail: "New city added — Score: 82 (Generally Safe)" },
  { time: "1 day ago", action: "refresh", city: "Cairo", detail: "Score: 54 → 52 (political tension)" },
  { time: "1 day ago", action: "ranking", city: "All", detail: "Global rankings recalculated (247 cities)" },
];

const PIPELINE_STATS = {
  totalCities: 247, citiesInQueue: 53, alertsActive: 3,
  lastFullRun: "Sunday 2:00 AM", nextFullRun: "Next Sunday 2:00 AM",
  refreshedToday: 12, addedThisWeek: 8, avgConfidence: 0.84
};

const tierConfig = {
  very_safe: { color: "#10b981", bg: "#ecfdf5", label: "Very Safe" },
  generally_safe: { color: "#22c55e", bg: "#f0fdf4", label: "Generally Safe" },
  moderate: { color: "#eab308", bg: "#fefce8", label: "Moderate" },
  elevated: { color: "#f97316", bg: "#fff7ed", label: "Elevated" },
  high_risk: { color: "#ef4444", bg: "#fef2f2", label: "High Risk" },
};

const trendIcons = { improving: "↑", stable: "→", declining: "↓" };
const trendColors = { improving: "#10b981", stable: "#6b7280", declining: "#ef4444" };

const actionColors = {
  refresh: "#3b82f6", add: "#10b981", alert: "#f97316",
  alert_clear: "#22c55e", ranking: "#8b5cf6"
};
const actionIcons = {
  refresh: "↻", add: "+", alert: "⚠", alert_clear: "✓", ranking: "#"
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setAnimateIn(true); }, []);

  const filteredCities = SAMPLE_CITIES.filter(
    c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryLabels = {
    crime: "Crime", health: "Health", political: "Political", infrastructure: "Infrastructure",
    disaster: "Disaster", scams: "Scams", lgbtq: "LGBTQ+", women: "Women", night: "Night"
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "#0a0e1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "0",
      overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700
            }}>🛡️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
                IsItSafeToVisit<span style={{ color: "#8b5cf6" }}>.com</span>
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>City Safety Automation Engine</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "rgba(16, 185, 129, 0.15)", color: "#10b981",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            System Active
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa"
          }}>Powered by Claude</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, padding: "0 32px",
        background: "rgba(15, 23, 42, 0.8)",
        borderBottom: "1px solid rgba(100, 116, 139, 0.15)"
      }}>
        {["overview", "cities", "pipeline", "changelog"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setSelectedCity(null); }} style={{
            padding: "14px 24px", border: "none", cursor: "pointer",
            background: "transparent", color: activeTab === tab ? "#e2e8f0" : "#64748b",
            fontSize: 13, fontWeight: 600, textTransform: "capitalize",
            borderBottom: activeTab === tab ? "2px solid #8b5cf6" : "2px solid transparent",
            transition: "all 0.2s", fontFamily: "inherit"
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: "24px 32px", maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ opacity: animateIn ? 1 : 0, transition: "opacity 0.5s" }}>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Cities", value: PIPELINE_STATS.totalCities, icon: "🌍", color: "#8b5cf6" },
                { label: "In Queue", value: PIPELINE_STATS.citiesInQueue, icon: "📋", color: "#06b6d4" },
                { label: "Active Alerts", value: PIPELINE_STATS.alertsActive, icon: "⚠️", color: "#f97316" },
                { label: "Avg Confidence", value: (PIPELINE_STATS.avgConfidence * 100).toFixed(0) + "%", icon: "📊", color: "#10b981" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.6))",
                  border: "1px solid rgba(100, 116, 139, 0.15)",
                  borderRadius: 14, padding: "20px 22px",
                  position: "relative", overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute", top: -8, right: -8, width: 60, height: 60,
                    borderRadius: "50%", background: stat.color, opacity: 0.06
                  }}></div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                  <div style={{ fontSize: 20, position: "absolute", top: 18, right: 18 }}>{stat.icon}</div>
                </div>
              ))}
            </div>

            {/* Two columns: Top Cities + Live Feed */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Top Cities */}
              <div style={{
                background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                borderRadius: 14, padding: 22
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
                  Top Ranked Cities
                </h3>
                {SAMPLE_CITIES.slice(0, 8).map((city, i) => (
                  <div key={i} onClick={() => { setSelectedCity(city); setActiveTab("cities"); }} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    marginBottom: 4, transition: "background 0.15s",
                    background: i % 2 === 0 ? "rgba(30, 27, 75, 0.2)" : "transparent",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(30, 27, 75, 0.2)" : "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#64748b",
                        width: 22, textAlign: "right"
                      }}>#{city.rank}</span>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{city.name}</span>
                        <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>{city.country}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: trendColors[city.trending], fontSize: 14 }}>{trendIcons[city.trending]}</span>
                      <span style={{
                        fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 14,
                        color: tierConfig[city.tier].color
                      }}>{city.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Feed */}
              <div style={{
                background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                borderRadius: 14, padding: 22
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
                  Live Activity Feed
                </h3>
                {CHANGELOG.map((entry, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "10px 0",
                    borderBottom: i < CHANGELOG.length - 1 ? "1px solid rgba(100, 116, 139, 0.08)" : "none"
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `${actionColors[entry.action]}20`,
                      color: actionColors[entry.action],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700
                    }}>{actionIcons[entry.action]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {entry.city}
                        <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 8 }}>{entry.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {entry.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CITIES TAB */}
        {activeTab === "cities" && (
          <div>
            <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
              <input
                type="text" placeholder="Search cities..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(100, 116, 139, 0.2)",
                  background: "rgba(15, 23, 42, 0.6)", color: "#e2e8f0", fontSize: 13,
                  fontFamily: "inherit", outline: "none"
                }}
              />
            </div>

            {selectedCity ? (
              /* City Detail View */
              <div>
                <button onClick={() => setSelectedCity(null)} style={{
                  background: "none", border: "none", color: "#8b5cf6", cursor: "pointer",
                  fontSize: 13, fontWeight: 500, marginBottom: 16, padding: 0, fontFamily: "inherit"
                }}>← Back to list</button>

                <div style={{
                  background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                  borderRadius: 16, padding: 28
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
                        {selectedCity.name}
                        <span style={{ fontSize: 16, color: "#64748b", fontWeight: 400, marginLeft: 12 }}>{selectedCity.country}</span>
                      </h2>
                      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                        <span style={{
                          padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          background: tierConfig[selectedCity.tier].bg + "30",
                          color: tierConfig[selectedCity.tier].color
                        }}>{tierConfig[selectedCity.tier].label}</span>
                        <span style={{
                          padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                          color: trendColors[selectedCity.trending],
                          background: trendColors[selectedCity.trending] + "15"
                        }}>{trendIcons[selectedCity.trending]} {selectedCity.trending}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 48, fontWeight: 800, fontFamily: "'JetBrains Mono'",
                      color: tierConfig[selectedCity.tier].color,
                      lineHeight: 1
                    }}>{selectedCity.score}</div>
                  </div>

                  {/* Category Bars */}
                  <div style={{ display: "grid", gap: 10 }}>
                    {Object.entries(selectedCity.categories).map(([key, val]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          width: 90, fontSize: 12, color: "#94a3b8", fontWeight: 500, textAlign: "right"
                        }}>{categoryLabels[key]}</span>
                        <div style={{
                          flex: 1, height: 22, background: "rgba(30, 27, 75, 0.4)",
                          borderRadius: 6, overflow: "hidden", position: "relative"
                        }}>
                          <div style={{
                            height: "100%", borderRadius: 6,
                            width: `${val}%`,
                            background: val >= 80 ? "linear-gradient(90deg, #10b981, #34d399)" :
                                       val >= 60 ? "linear-gradient(90deg, #eab308, #facc15)" :
                                       val >= 40 ? "linear-gradient(90deg, #f97316, #fb923c)" :
                                       "linear-gradient(90deg, #ef4444, #f87171)",
                            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                          }}></div>
                          <span style={{
                            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                            fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono'",
                            color: "#e2e8f0"
                          }}>{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 20, fontSize: 11, color: "#475569" }}>
                    Last updated: {selectedCity.lastUpdated} · Rank #{selectedCity.rank} globally
                  </div>
                </div>
              </div>
            ) : (
              /* City List View */
              <div style={{
                background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                borderRadius: 14, overflow: "hidden"
              }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 80px 100px",
                  padding: "12px 18px", background: "rgba(30, 27, 75, 0.3)",
                  fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em"
                }}>
                  <span>Rank</span><span>City</span><span>Score</span><span>Tier</span><span>Trend</span><span>Updated</span>
                </div>
                {filteredCities.map((city, i) => (
                  <div key={i} onClick={() => setSelectedCity(city)} style={{
                    display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 80px 100px",
                    padding: "12px 18px", cursor: "pointer", transition: "background 0.15s",
                    borderBottom: "1px solid rgba(100, 116, 139, 0.06)"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(139, 92, 246, 0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#64748b" }}>#{city.rank}</span>
                    <span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{city.name}</span>
                      <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>{city.country}</span>
                    </span>
                    <span>
                      <span style={{
                        fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15,
                        color: tierConfig[city.tier].color
                      }}>{city.score}</span>
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 500, height: 4, width: 40,
                        display: "inline-block", background: "rgba(100,116,139,0.2)", borderRadius: 2,
                        position: "relative", verticalAlign: "middle"
                      }}>
                        <span style={{
                          position: "absolute", left: 0, top: 0, height: "100%",
                          width: `${city.score}%`, borderRadius: 2,
                          background: tierConfig[city.tier].color
                        }}></span>
                      </span>
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: tierConfig[city.tier].color
                    }}>{tierConfig[city.tier].label}</span>
                    <span style={{ color: trendColors[city.trending], fontSize: 13 }}>
                      {trendIcons[city.trending]} <span style={{ fontSize: 11 }}>{city.trending}</span>
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{city.lastUpdated}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PIPELINE TAB */}
        {activeTab === "pipeline" && (
          <div>
            <div style={{
              background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
              borderRadius: 16, padding: 28, marginBottom: 20
            }}>
              <h3 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 600 }}>Automation Architecture</h3>

              {/* Pipeline Diagram */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "⏰", title: "GitHub Actions Scheduler", desc: "Full pipeline (weekly) · Refresh (daily) · Alerts (every 6h)", color: "#8b5cf6" },
                  { icon: "🤖", title: "agent.py Orchestrator", desc: "Routes tasks: add, refresh, rank, alert, single city", color: "#06b6d4" },
                  { icon: "🔍", title: "Claude API + Web Search", desc: "Researches State Dept, WHO, UNODC, Numbeo, news sources", color: "#3b82f6" },
                  { icon: "📊", title: "Score Calculator", desc: "9 weighted categories → overall score → safety tier → trend", color: "#10b981" },
                  { icon: "📁", title: "Data Store", desc: "data/cities/*.json · rankings.json · changelog.json", color: "#eab308" },
                  { icon: "🚀", title: "Site Rebuild", desc: "Auto-deploy via Vercel/Netlify webhook after data changes", color: "#f97316" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${step.color}18`, border: `1px solid ${step.color}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, flexShrink: 0
                      }}>{step.icon}</div>
                      {i < 5 && <div style={{ width: 2, height: 16, background: `${step.color}30` }}></div>}
                    </div>
                    <div style={{ paddingTop: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: step.color }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule & Config */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{
                background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                borderRadius: 14, padding: 22
              }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Schedule</h4>
                {[
                  { mode: "Full Pipeline", schedule: "Sunday 2:00 AM UTC", freq: "Weekly" },
                  { mode: "Stale Refresh", schedule: "Daily 3:00 AM UTC", freq: "Daily" },
                  { mode: "Alert Monitor", schedule: "Every 6 hours", freq: "4x/day" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", padding: "8px 0",
                    borderBottom: i < 2 ? "1px solid rgba(100, 116, 139, 0.08)" : "none",
                    fontSize: 12
                  }}>
                    <span style={{ fontWeight: 600 }}>{s.mode}</span>
                    <span style={{ color: "#64748b" }}>{s.schedule}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
                borderRadius: 14, padding: 22
              }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Configuration</h4>
                {[
                  { key: "Model", val: "Claude Sonnet 4" },
                  { key: "Staleness threshold", val: "30 days" },
                  { key: "Batch size (add)", val: "5 cities/run" },
                  { key: "Batch size (refresh)", val: "10 cities/run" },
                  { key: "Est. monthly cost", val: "~$15-30" },
                ].map((c, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", padding: "8px 0",
                    borderBottom: i < 4 ? "1px solid rgba(100, 116, 139, 0.08)" : "none",
                    fontSize: 12
                  }}>
                    <span style={{ color: "#94a3b8" }}>{c.key}</span>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 500, color: "#e2e8f0" }}>{c.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHANGELOG TAB */}
        {activeTab === "changelog" && (
          <div style={{
            background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(100, 116, 139, 0.15)",
            borderRadius: 14, padding: 22
          }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Recent Changes</h3>
            {CHANGELOG.map((entry, i) => (
              <div key={i} style={{
                display: "flex", gap: 16, padding: "14px 0",
                borderBottom: i < CHANGELOG.length - 1 ? "1px solid rgba(100, 116, 139, 0.08)" : "none"
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${actionColors[entry.action]}15`,
                  color: actionColors[entry.action],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, border: `1px solid ${actionColors[entry.action]}30`
                }}>{actionIcons[entry.action]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.city}</span>
                    <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono'" }}>{entry.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>{entry.detail}</div>
                  <span style={{
                    display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    padding: "2px 8px", borderRadius: 4,
                    background: `${actionColors[entry.action]}15`,
                    color: actionColors[entry.action]
                  }}>{entry.action.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
