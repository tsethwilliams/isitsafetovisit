import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'Browse Cities by Region — IsItSafeToVisit',
  description: 'Explore travel safety guides organized by world region. Find safe cities in Europe, Asia, Latin America, Africa, and more.',
};

const REGION_META: Record<string, { emoji: string; description: string }> = {
  'Europe': { emoji: '🏰', description: 'From Western capitals to Eastern gems' },
  'Asia': { emoji: '🏯', description: 'Southeast Asia, East Asia, and the Subcontinent' },
  'South America': { emoji: '🌎', description: 'The continent from Colombia to Patagonia' },
  'Central America & Caribbean': { emoji: '🌴', description: 'Mexico, Central America, and island destinations' },
  'North America': { emoji: '🗽', description: 'United States and Canada city guides' },
  'Middle East': { emoji: '🕌', description: 'Gulf states, Levant, and beyond' },
  'Africa': { emoji: '🌍', description: 'Sub-Saharan Africa, North Africa, and East Africa' },
  'Oceania': { emoji: '🦘', description: 'Australia, New Zealand, and Pacific islands' },
};

function getScoreClass(score: number): string {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

export default function RegionsPage() {
  const raw = getAllCities();
  const cities = Array.isArray(raw) ? raw : [];

  const byRegion: Record<string, typeof cities> = {};
  for (const city of cities) {
    const region = city.region || 'Other';
    if (!byRegion[region]) byRegion[region] = [];
    byRegion[region].push(city);
  }

  const sortedRegions = Object.entries(byRegion).sort((a, b) => b[1].length - a[1].length);

  return (
    <main className="regions-page">
      <div className="regions-hero">
        <div className="container">
          <h1>Browse by Region</h1>
          <p className="regions-subtitle">
            {cities.length} cities across {sortedRegions.length} world regions
          </p>
        </div>
      </div>

      <div className="container">
        <div className="regions-grid">
          {sortedRegions.map(([region, regionCities]) => {
            const meta = REGION_META[region] || { emoji: '🌐', description: '' };
            const sorted = [...regionCities].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));

            return (
              <section key={region} className="region-section">
                <div className="region-header">
                  <span className="region-emoji">{meta.emoji}</span>
                  <div>
                    <h2 className="region-title">{region}</h2>
                    {meta.description && (
                      <p className="region-description">{meta.description}</p>
                    )}
                    <span className="region-count">{regionCities.length} cities</span>
                  </div>
                </div>

                <div className="region-cities-grid">
                  {sorted.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="region-city-card"
                    >
                      <div className="region-city-top">
                        <span className="region-city-name">{city.name}</span>
                        <span className={`region-city-score score-${getScoreClass(city.overallScore || 0)}`}>
                          {(city.overallScore || 0).toFixed(1)}
                        </span>
                      </div>
                      <span className="region-city-country">{city.country}</span>
                      <span className={`region-city-badge badge-${getScoreClass(city.overallScore || 0)}`}>
                        {city.badgeLabel || ((city.overallScore || 0) >= 7 ? 'Generally Safe' : (city.overallScore || 0) >= 5 ? 'Moderate Caution' : 'Exercise Caution')}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
