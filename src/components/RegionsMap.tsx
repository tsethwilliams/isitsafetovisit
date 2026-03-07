'use client';

import { useState } from 'react';
import Link from 'next/link';

type City = {
  slug: string;
  name: string;
  country: string;
  region: string;
  overallScore: number;
  badgeLabel?: string;
  scores?: { scamRisk?: number };
};

type RegionInfo = {
  overview: string;
  travelTips: string[];
  scamPatterns: string[];
  emoji: string;
};

const REGION_INFO: Record<string, RegionInfo> = {
  'Europe': {
    emoji: '🏰',
    overview: 'Europe is generally one of the safest regions for tourists, with strong rule of law, reliable emergency services, and well-developed tourist infrastructure. Western Europe is among the safest globally, while parts of Eastern Europe require more vigilance in major cities.',
    travelTips: ['Pickpocketing is the primary risk in tourist-heavy cities like Barcelona, Paris, and Rome', 'Public transport is safe but watch your belongings at busy stations', 'Most countries use 112 as the universal emergency number', 'ATMs are widely available — use bank ATMs to avoid skimming'],
    scamPatterns: ['Distraction theft at major monuments and metro stations', 'Fake petition signers (especially Paris and Barcelona)', 'Taxi overcharging at airports — always use metered cabs or apps', 'Friendship bracelet scam near the Eiffel Tower and Sacré-Cœur'],
  },
  'Asia': {
    emoji: '🏯',
    overview: 'Asia spans an enormous range of safety profiles — from ultra-safe Singapore and Japan to more challenging environments in parts of South and Southeast Asia. Research your specific destination carefully, as conditions vary dramatically between countries and even cities.',
    travelTips: ['Respect local customs and dress codes, especially at religious sites', 'Negotiate prices before getting into tuk-tuks or unmarked taxis', 'Street food is generally safe — look for busy stalls with high turnover', 'Download offline maps and key apps before arrival'],
    scamPatterns: ['Gem scam (especially Bangkok and Jaipur) — never buy gems as investments', 'Fake temple or attraction closure — a local says it is closed and offers an alternative', 'Tuk-tuk driver commission scams taking you to overpriced shops', 'Overly friendly strangers who lead you to expensive restaurants or bars'],
  },
  'South America': {
    emoji: '🌎',
    overview: 'South America offers some of the most rewarding travel experiences in the world, but also requires more safety awareness than other regions. Express kidnapping, opportunistic theft, and scams targeting tourists are common in major cities. Staying in well-traveled areas and using reputable transport significantly reduces risk.',
    travelTips: ['Use only app-based rideshares (Uber, Cabify, InDriver) — never hail taxis on the street', 'Do not use your phone openly on the street in major cities', 'Keep a second wallet with small cash for robbery situations', 'Research no-go neighborhoods thoroughly before exploring'],
    scamPatterns: ['Express kidnapping — being forced to ATMs for cash withdrawals', 'Fake police officers demanding to see your wallet', 'Mustard or bird dropping distraction theft', 'Currency exchange fraud — always count bills yourself'],
  },
  'Central America & Caribbean': {
    emoji: '🌴',
    overview: 'Central America and the Caribbean range from relatively safe tourist corridors in Costa Rica and Belize to higher-risk urban areas in parts of Guatemala, Honduras, and El Salvador. Island destinations in the Caribbean are generally safe within resort areas, with risk increasing in urban centers.',
    travelTips: ['Stick to established tourist routes — venturing off-path significantly increases risk', 'Book airport transfers in advance through your hotel', 'Travel between cities during daylight hours', 'Keep valuables in hotel safes'],
    scamPatterns: ['Taxi overcharging at airports and tourist zones', 'Fake tour operators selling non-existent excursions', 'Beach theft while swimming — never leave valuables unattended', 'Timeshare scams targeting tourists in resort areas'],
  },
  'North America': {
    emoji: '🗽',
    overview: 'The United States and Canada are generally safe for tourists with strong infrastructure and reliable emergency services. Risk is highly neighborhood-specific — major cities have both very safe tourist areas and high-crime districts within a few blocks of each other. Research your specific neighborhoods.',
    travelTips: ['Use 911 for all emergencies', 'Rideshares (Uber, Lyft) are safe and the preferred transport in most cities', 'Tipping is expected at restaurants (18-20%) and taxis', 'Healthcare is expensive — travel insurance is strongly recommended'],
    scamPatterns: ['Unlicensed taxi scams at major airports — only use official rideshare pickup zones', 'Street hustlers with games of chance (three-card monte, shell game)', 'Fake charity collectors', 'Overpriced tourist-area restaurants with hidden charges'],
  },
  'Middle East': {
    emoji: '🕌',
    overview: 'The Middle East is highly diverse — Gulf states like the UAE, Qatar, and Oman are among the safest countries in the world, while other areas require significant caution. Gulf tourism infrastructure is excellent. Check government advisories carefully for your specific destination.',
    travelTips: ['Dress conservatively, especially for women — research specific country requirements', 'Alcohol laws vary dramatically by country', 'Photography restrictions apply near government buildings and some mosques', 'Ramadan affects business hours and public eating — plan accordingly'],
    scamPatterns: ['Taxi overcharging is common — agree on a price or use meters before riding', 'Counterfeit goods sold as luxury items in souks', 'Fake gemstone and gold dealers', 'Overpriced tourist restaurants near major attractions'],
  },
  'Africa': {
    emoji: '🌍',
    overview: 'Africa is enormously diverse, with safe tourist havens alongside higher-risk destinations. Morocco, Tanzania, Botswana, and parts of South Africa have well-developed tourist infrastructure. Urban areas generally require more vigilance than rural safari destinations. Research each country individually.',
    travelTips: ['Use licensed tour operators for safari and adventure activities', 'Malaria prophylaxis is recommended for most sub-Saharan destinations', 'Yellow fever vaccination required for entry to many African countries', 'Driving after dark outside cities carries significant risk in many countries'],
    scamPatterns: ['Airport and bus station scammers posing as official helpers', 'Gem and craft overpricing at tourist markets', 'Fake guides who demand large fees after tours', 'Money changers offering above-market rates (counterfeit risk)'],
  },
  'Oceania': {
    emoji: '🦘',
    overview: 'Australia and New Zealand consistently rank among the safest countries in the world for tourists, with excellent infrastructure, reliable emergency services, and low crime. Pacific island destinations are generally safe, though some urban areas in PNG and parts of Melanesia require caution.',
    travelTips: ['Sun protection is essential — UV radiation is extremely high', 'Wildlife hazards are real — research dangerous animals for your region', 'Emergency number is 000 in Australia, 111 in New Zealand', 'Distances are vast — plan transport and accommodation well in advance'],
    scamPatterns: ['Ticket scalping at major events', 'Fake accommodation listings online', 'Overpriced tourist activities in major cities', 'Phone and internet scams targeting tourists (relatively low physical crime risk)'],
  },
};

// SVG region paths — simplified but recognizable world map
const REGION_PATHS: Record<string, string> = {
  'North America': 'M75,38 L240,35 L258,80 L275,145 L268,185 L225,205 L175,200 L130,178 L90,155 L68,110 Z',
  'Central America & Caribbean': 'M175,208 L268,188 L285,225 L278,258 L258,270 L225,272 L185,260 L168,238 Z',
  'South America': 'M178,278 L295,272 L318,355 L322,420 L298,458 L248,472 L195,450 L168,400 L158,335 Z',
  'Europe': 'M392,32 L532,28 L548,38 L548,130 L522,148 L468,155 L405,148 L388,110 L385,65 Z',
  'Africa': 'M390,155 L525,148 L545,155 L558,285 L548,388 L508,428 L452,438 L400,415 L375,348 L370,235 Z',
  'Middle East': 'M548,100 L648,92 L665,158 L630,195 L548,195 L535,155 Z',
  'Asia': 'M548,28 L918,25 L935,258 L835,295 L755,298 L665,268 L648,192 L665,158 L548,195 L535,155 L548,130 L548,38 Z',
  'Oceania': 'M718,308 L928,302 L938,452 L842,468 L745,460 L715,418 Z',
};

const REGION_LABEL_POS: Record<string, { x: number; y: number }> = {
  'North America': { x: 168, y: 122 },
  'Central America & Caribbean': { x: 225, y: 238 },
  'South America': { x: 240, y: 375 },
  'Europe': { x: 466, y: 92 },
  'Africa': { x: 462, y: 295 },
  'Middle East': { x: 598, y: 148 },
  'Asia': { x: 720, y: 152 },
  'Oceania': { x: 822, y: 388 },
};

function getScoreColor(score: number) {
  if (score >= 7) return '#2d7a4f';
  if (score >= 5) return '#b8860b';
  return '#c4322a';
}

function getScoreClass(score: number) {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

function avgScore(cities: City[]) {
  if (!cities.length) return 0;
  return cities.reduce((s, c) => s + c.overallScore, 0) / cities.length;
}

type Props = { cities: City[] };

export default function RegionsMap({ cities }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Group cities by region
  const byRegion: Record<string, City[]> = {};
  for (const city of cities) {
    const r = city.region || 'Other';
    if (!byRegion[r]) byRegion[r] = [];
    byRegion[r].push(city);
  }

  const regionNames = Object.keys(REGION_PATHS);
  const selectedCities = selected ? (byRegion[selected] || []) : [];
  const topSafe = [...selectedCities].sort((a, b) => b.overallScore - a.overallScore).slice(0, 4);
  const topRisk = [...selectedCities].sort((a, b) => a.overallScore - b.overallScore).slice(0, 4);
  const regionAvg = selected ? avgScore(selectedCities) : 0;
  const info = selected ? REGION_INFO[selected] : null;

  return (
    <div className="regions-map-wrapper">
      {/* Instruction */}
      <p className="regions-map-hint">Click any region to explore safety details</p>

      {/* SVG Map */}
      <div className="regions-svg-container">
        <svg
          viewBox="0 0 1000 500"
          className="regions-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ocean background */}
          <rect width="1000" height="500" fill="#dbeafe" rx="12" />

          {regionNames.map((region) => {
            const cities = byRegion[region] || [];
            const avg = avgScore(cities);
            const isSelected = selected === region;
            const hasData = cities.length > 0;
            const fillColor = hasData ? getScoreColor(avg) : '#94a3b8';
            const labelPos = REGION_LABEL_POS[region];

            return (
              <g key={region} onClick={() => setSelected(isSelected ? null : region)} style={{ cursor: 'pointer' }}>
                <path
                  d={REGION_PATHS[region]}
                  fill={fillColor}
                  fillOpacity={isSelected ? 1 : 0.65}
                  stroke={isSelected ? '#1a1a1a' : '#ffffff'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                {labelPos && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    fontSize={region === 'Central America & Caribbean' ? '9' : '11'}
                    fontWeight="700"
                    fill="white"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    paintOrder="stroke"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="3"
                  >
                    {region === 'Central America & Caribbean' ? 'C. America & Caribbean' : region}
                  </text>
                )}
                {hasData && labelPos && (
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 14}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                    paintOrder="stroke"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="3"
                  >
                    {avg.toFixed(1)} / 10
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="map-legend">
          <span className="legend-item"><span className="legend-dot" style={{background:'#2d7a4f'}}></span>Generally Safe (7+)</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#b8860b'}}></span>Moderate Caution (5–6.9)</span>
          <span className="legend-item"><span className="legend-dot" style={{background:'#c4322a'}}></span>Exercise Caution (&lt;5)</span>
        </div>
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
            {/* Safest Cities */}
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">✅ Safest Cities</h3>
              <div className="region-city-list">
                {topSafe.map(city => (
                  <Link key={city.slug} href={`/cities/${city.slug}`} className="region-city-row">
                    <span className="region-city-row-name">{city.name}, {city.country}</span>
                    <span className={`region-city-row-score score-${getScoreClass(city.overallScore)}`}>
                      {city.overallScore.toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Highest Risk Cities */}
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">⚠️ Highest Risk Cities</h3>
              <div className="region-city-list">
                {topRisk.map(city => (
                  <Link key={city.slug} href={`/cities/${city.slug}`} className="region-city-row">
                    <span className="region-city-row-name">{city.name}, {city.country}</span>
                    <span className={`region-city-row-score score-${getScoreClass(city.overallScore)}`}>
                      {city.overallScore.toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Scam Patterns */}
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">🎭 Regional Scam Patterns</h3>
              <ul className="region-detail-list">
                {info.scamPatterns.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            {/* Travel Tips */}
            <div className="region-detail-section">
              <h3 className="region-detail-section-title">💡 Travel Tips</h3>
              <ul className="region-detail-list">
                {info.travelTips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>

          <div className="region-detail-footer">
            <Link href={`/cities`} className="region-browse-btn">
              Browse all {selectedCities.length} {selected} cities →
            </Link>
          </div>
        </div>
      )}

      {!selected && (
        <div className="region-select-prompt">
          <p>Select a region on the map above to see safety scores, top cities, scam patterns, and travel tips.</p>
        </div>
      )}
    </div>
  );
}
