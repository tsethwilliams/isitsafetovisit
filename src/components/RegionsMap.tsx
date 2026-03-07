'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO numeric code → region name
const COUNTRY_TO_REGION: Record<number, string> = {
  // Europe
  8:'Europe',20:'Europe',40:'Europe',56:'Europe',70:'Europe',100:'Europe',
  112:'Europe',191:'Europe',196:'Europe',203:'Europe',208:'Europe',233:'Europe',
  246:'Europe',250:'Europe',276:'Europe',300:'Europe',348:'Europe',352:'Europe',
  372:'Europe',380:'Europe',428:'Europe',438:'Europe',440:'Europe',442:'Europe',
  470:'Europe',492:'Europe',498:'Europe',499:'Europe',528:'Europe',578:'Europe',
  616:'Europe',620:'Europe',642:'Europe',674:'Europe',688:'Europe',703:'Europe',
  705:'Europe',724:'Europe',752:'Europe',756:'Europe',804:'Europe',807:'Europe',
  826:'Europe',831:'Europe',832:'Europe',833:'Europe',
  // Asia
  4:'Asia',50:'Asia',64:'Asia',96:'Asia',104:'Asia',116:'Asia',156:'Asia',
  344:'Asia',356:'Asia',360:'Asia',364:'Asia',392:'Asia',398:'Asia',408:'Asia',
  410:'Asia',418:'Asia',422:'Asia',458:'Asia',462:'Asia',496:'Asia',524:'Asia',
  586:'Asia',608:'Asia',626:'Asia',643:'Asia',702:'Asia',144:'Asia',764:'Asia',
  762:'Asia',860:'Asia',704:'Asia',417:'Asia',795:'Asia',
  // Middle East
  31:'Middle East',48:'Middle East',368:'Middle East',376:'Middle East',
  400:'Middle East',414:'Middle East',512:'Middle East',634:'Middle East',
  760:'Middle East',784:'Middle East',887:'Middle East',275:'Middle East',
  // North America
  124:'North America',840:'North America',
  // Central America & Caribbean
  28:'Central America & Caribbean',44:'Central America & Caribbean',
  52:'Central America & Caribbean',84:'Central America & Caribbean',
  192:'Central America & Caribbean',212:'Central America & Caribbean',
  214:'Central America & Caribbean',222:'Central America & Caribbean',
  308:'Central America & Caribbean',320:'Central America & Caribbean',
  332:'Central America & Caribbean',340:'Central America & Caribbean',
  388:'Central America & Caribbean',484:'Central America & Caribbean',
  558:'Central America & Caribbean',591:'Central America & Caribbean',
  630:'Central America & Caribbean',659:'Central America & Caribbean',
  662:'Central America & Caribbean',670:'Central America & Caribbean',
  780:'Central America & Caribbean',796:'Central America & Caribbean',
  // South America
  32:'South America',68:'South America',76:'South America',152:'South America',
  170:'South America',218:'South America',238:'South America',254:'South America',
  328:'South America',604:'South America',600:'South America',740:'South America',
  858:'South America',862:'South America',
  // Africa
  12:'Africa',24:'Africa',72:'Africa',108:'Africa',120:'Africa',132:'Africa',
  140:'Africa',148:'Africa',174:'Africa',178:'Africa',180:'Africa',204:'Africa',
  226:'Africa',231:'Africa',232:'Africa',266:'Africa',270:'Africa',288:'Africa',
  324:'Africa',384:'Africa',404:'Africa',426:'Africa',430:'Africa',434:'Africa',
  450:'Africa',454:'Africa',466:'Africa',478:'Africa',480:'Africa',504:'Africa',
  508:'Africa',516:'Africa',562:'Africa',566:'Africa',624:'Africa',646:'Africa',
  678:'Africa',686:'Africa',694:'Africa',706:'Africa',710:'Africa',716:'Africa',
  728:'Africa',729:'Africa',748:'Africa',768:'Africa',788:'Africa',800:'Africa',
  818:'Africa',834:'Africa',894:'Africa',
  // Oceania
  36:'Oceania',242:'Oceania',296:'Oceania',554:'Oceania',598:'Oceania',
  548:'Oceania',776:'Oceania',798:'Oceania',882:'Oceania',
};

const REGION_INFO: Record<string, {
  emoji: string;
  overview: string;
  travelTips: string[];
  scamPatterns: string[];
}> = {
  'Europe': {
    emoji: '🏰',
    overview: 'Europe is generally one of the safest regions for tourists, with strong rule of law, reliable emergency services, and well-developed tourist infrastructure. Western Europe is among the safest globally, while parts of Eastern Europe require more vigilance in major cities.',
    travelTips: ['Pickpocketing is the primary risk in tourist-heavy cities like Barcelona, Paris, and Rome','Public transport is safe but watch your belongings at busy stations','Most countries use 112 as the universal emergency number','ATMs are widely available — use bank ATMs to avoid skimming'],
    scamPatterns: ['Distraction theft at major monuments and metro stations','Fake petition signers (especially Paris and Barcelona)','Taxi overcharging at airports — always use metered cabs or apps','Friendship bracelet scam near major tourist attractions'],
  },
  'Asia': {
    emoji: '🏯',
    overview: 'Asia spans an enormous range of safety profiles — from ultra-safe Singapore and Japan to more challenging environments in parts of South and Southeast Asia. Research your specific destination carefully, as conditions vary dramatically between countries and even cities.',
    travelTips: ['Respect local customs and dress codes, especially at religious sites','Negotiate prices before getting into tuk-tuks or unmarked taxis','Street food is generally safe — look for busy stalls with high turnover','Download offline maps and key apps before arrival'],
    scamPatterns: ['Gem scam (especially Bangkok and Jaipur) — never buy gems as investments','Fake temple closure — a local says it is closed and offers a paid alternative','Tuk-tuk driver commission scams taking you to overpriced shops','Overly friendly strangers who lead you to expensive restaurants'],
  },
  'Middle East': {
    emoji: '🕌',
    overview: 'The Middle East is highly diverse — Gulf states like the UAE, Qatar, and Oman are among the safest countries in the world, while other areas require significant caution. Gulf tourism infrastructure is excellent. Check your government travel advisory carefully for your specific destination.',
    travelTips: ['Dress conservatively, especially for women — research specific country requirements','Alcohol laws vary dramatically by country','Photography restrictions apply near government buildings and mosques','Ramadan affects business hours and public eating — plan accordingly'],
    scamPatterns: ['Taxi overcharging is common — agree on a price before riding','Counterfeit goods sold as luxury items in souks','Fake gemstone and gold dealers targeting tourists','Overpriced tourist restaurants near major attractions'],
  },
  'North America': {
    emoji: '🗽',
    overview: 'The United States and Canada are generally safe for tourists with strong infrastructure and reliable emergency services. Risk is highly neighborhood-specific — major cities have both very safe tourist areas and high-crime districts within a few blocks of each other.',
    travelTips: ['Use 911 for all emergencies','Rideshares (Uber, Lyft) are safe and preferred in most cities','Tipping is expected at restaurants (18–20%)','Healthcare is expensive in the US — travel insurance is strongly recommended'],
    scamPatterns: ['Unlicensed taxi scams at major airports — use official rideshare zones','Street hustlers with games of chance (three-card monte, shell game)','Fake charity collectors in tourist areas','Overpriced tourist restaurants with hidden charges'],
  },
  'Central America & Caribbean': {
    emoji: '🌴',
    overview: 'Central America and the Caribbean range from relatively safe tourist corridors in Costa Rica and Belize to higher-risk urban areas in parts of Honduras and El Salvador. Island destinations are generally safe within resort areas, with risk increasing in urban centers.',
    travelTips: ['Stick to established tourist routes','Book airport transfers in advance through your hotel','Travel between cities during daylight hours only','Keep valuables in hotel safes'],
    scamPatterns: ['Taxi overcharging at airports and tourist zones','Fake tour operators selling non-existent excursions','Beach theft while swimming — never leave valuables unattended','Timeshare scams targeting tourists in resort areas'],
  },
  'South America': {
    emoji: '🌎',
    overview: 'South America offers some of the most rewarding travel experiences in the world, but requires more safety awareness than other regions. Express kidnapping, opportunistic theft, and scams targeting tourists are common in major cities. Use reputable transport and stay in well-traveled areas.',
    travelTips: ['Use only app-based rideshares — never hail taxis on the street','Do not use your phone openly on the street in major cities','Keep a second wallet with small cash for robbery situations','Research no-go neighborhoods thoroughly before exploring'],
    scamPatterns: ['Express kidnapping — being forced to ATMs for cash withdrawals','Fake police officers demanding to see your wallet','Mustard or bird dropping distraction theft','Currency exchange fraud — always count bills yourself'],
  },
  'Africa': {
    emoji: '🌍',
    overview: 'Africa is enormously diverse, with safe tourist havens alongside higher-risk destinations. Morocco, Tanzania, Botswana, and parts of South Africa have well-developed tourist infrastructure. Urban areas generally require more vigilance than rural safari destinations.',
    travelTips: ['Use licensed tour operators for safari and adventure activities','Malaria prophylaxis is recommended for most sub-Saharan destinations','Yellow fever vaccination required for entry to many African countries','Driving after dark outside cities carries significant risk in many countries'],
    scamPatterns: ['Airport and bus station scammers posing as official helpers','Gem and craft overpricing at tourist markets','Fake guides who demand large fees after completing tours','Money changers offering above-market rates (counterfeit risk)'],
  },
  'Oceania': {
    emoji: '🦘',
    overview: 'Australia and New Zealand consistently rank among the safest countries in the world for tourists, with excellent infrastructure and low crime rates. Pacific island destinations are generally safe, though some urban areas in Papua New Guinea require caution.',
    travelTips: ['Sun protection is essential — UV radiation is extremely high','Wildlife hazards are real — research dangerous animals for your region','Emergency: 000 in Australia, 111 in New Zealand','Distances are vast — plan transport and accommodation well in advance'],
    scamPatterns: ['Ticket scalping at major events','Fake accommodation listings online','Overpriced tourist activities in major cities','Phone and internet scams (physical crime risk is relatively low)'],
  },
};

type City = {
  slug: string; name: string; country: string; region: string;
  overallScore: number; badgeLabel?: string;
};

function getScoreClass(score: number) {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

function avgScore(cities: City[]) {
  if (!cities.length) return 0;
  return cities.reduce((s, c) => s + (c.overallScore || 0), 0) / cities.length;
}

const SCORE_COLORS: Record<string, string> = {
  safe: '#2d7a4f', caution: '#b8860b', danger: '#c4322a',
  none: '#cbd5e1',
};

type Props = { cities: City[] };

export default function RegionsMap({ cities }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{text: string; x: number; y: number} | null>(null);

  const byRegion: Record<string, City[]> = {};
  for (const city of cities) {
    const r = city.region || 'Other';
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(city);
  }

  const regionAvgScores: Record<string, number> = {};
  for (const [region, rCities] of Object.entries(byRegion)) {
    regionAvgScores[region] = avgScore(rCities);
  }

  function getCountryColor(geoId: string) {
    const id = parseInt(geoId);
    const region = COUNTRY_TO_REGION[id];
    if (!region || !regionAvgScores[region]) return SCORE_COLORS.none;
    return SCORE_COLORS[getScoreClass(regionAvgScores[region])];
  }

  function getCountryRegion(geoId: string) {
    return COUNTRY_TO_REGION[parseInt(geoId)] || null;
  }

  const selectedCities = selected ? (byRegion[selected] || []) : [];
  const topSafe = [...selectedCities].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
  const topRisk = [...selectedCities].sort((a, b) => a.overallScore - b.overallScore).slice(0, 5);
  const regionAvg = selected ? (regionAvgScores[selected] || 0) : 0;
  const info = selected ? REGION_INFO[selected] : null;

  return (
    <div className="regions-map-wrapper">
      <p className="regions-map-hint">Click any region to explore safety scores, top cities, scam patterns, and travel tips</p>

      {/* Legend */}
      <div className="map-legend" style={{marginBottom: '0.75rem'}}>
        <span className="legend-item"><span className="legend-dot" style={{background:'#2d7a4f'}}></span>Generally Safe (7+)</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#b8860b'}}></span>Moderate Caution (5–6.9)</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#c4322a'}}></span>Exercise Caution (&lt;5)</span>
        <span className="legend-item"><span className="legend-dot" style={{background:'#cbd5e1'}}></span>No data yet</span>
      </div>

      {/* World Map */}
      <div className="regions-svg-container" style={{position:'relative'}}>
        <ComposableMap
          projectionConfig={{ scale: 147, center: [10, 10] }}
          style={{ width: '100%', height: 'auto', borderRadius: '12px', background: '#dbeafe' }}
        >
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const region = getCountryRegion(geo.id);
                  const color = getCountryColor(geo.id);
                  const isSelected = region === selected;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={color}
                      fillOpacity={isSelected ? 1 : 0.75}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', cursor: region ? 'pointer' : 'default' },
                        hover: { outline: 'none', fillOpacity: 1, filter: region ? 'brightness(1.1)' : 'none' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={() => {
                        if (region) setSelected(selected === region ? null : region);
                      }}
                      onMouseEnter={(e: React.MouseEvent) => {
                        if (region) {
                          const avg = regionAvgScores[region];
                          setTooltip({
                            text: `${REGION_INFO[region]?.emoji || ''} ${region}${avg ? ' · ' + avg.toFixed(1) + '/10' : ''}`,
                            x: e.clientX,
                            y: e.clientY,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div className="map-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Region Detail Panel */}
      {selected && info && (
        <div className="region-detail-panel">
          <div className="region-detail-header">
            <div className="region-detail-title-row">
              <span className="region-detail-emoji">{info.emoji}</span>
              <div>
                <h2 className="region-detail-name">{selected}</h2>
                <div className="region-detail-meta">
                  <span className={`region-detail-score score-${getScoreClass(regionAvg)}`}>
                    {regionAvg.toFixed(1)} avg safety score
                  </span>
                  <span className="region-detail-citycount">{selectedCities.length} cities tracked</span>
                </div>
              </div>
            </div>
            <button className="region-detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          <p className="region-detail-overview">{info.overview}</p>

          <div className="region-detail-grid">
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">✅ Safest Cities</h3>
              <div className="region-city-list">
                {topSafe.map(city => (
                  <Link key={city.slug} href={`/cities/${city.slug}`} className="region-city-row">
                    <span className="region-city-row-name">{city.name}, {city.country}</span>
                    <span className={`region-city-row-score score-${getScoreClass(city.overallScore)}`}>{city.overallScore.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">⚠️ Highest Risk Cities</h3>
              <div className="region-city-list">
                {topRisk.map(city => (
                  <Link key={city.slug} href={`/cities/${city.slug}`} className="region-city-row">
                    <span className="region-city-row-name">{city.name}, {city.country}</span>
                    <span className={`region-city-row-score score-${getScoreClass(city.overallScore)}`}>{city.overallScore.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">🎭 Regional Scam Patterns</h3>
              <ul className="region-detail-list">
                {info.scamPatterns.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">💡 Travel Tips</h3>
              <ul className="region-detail-list">
                {info.travelTips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>

          <div className="region-detail-footer">
            <Link href="/cities" className="region-browse-btn">
              Browse all {selectedCities.length} {selected} cities →
            </Link>
          </div>
        </div>
      )}

      {!selected && (
        <div className="region-select-prompt">
          <p>Click any colored region on the map to explore safety details, top cities, and travel tips.</p>
        </div>
      )}
    </div>
  );
}
