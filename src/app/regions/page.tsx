import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getAllCities, type City } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'Travel Safety by Region \u2014 IsItSafeToVisit.com',
  description: 'Browse travel safety guides organized by world region. Find safety ratings, scam alerts, and travel tips for cities across every continent.',
};

const REGION_META: Record<string, { emoji: string; description: string }> = {
  'europe': { emoji: '\uD83C\uDFF0', description: 'From Western Europe capitals to Eastern European gems, find safety guides for every European destination.' },
  'southeast-asia': { emoji: '\uD83C\uDF0F', description: 'Backpacker favorites and luxury destinations across Thailand, Vietnam, Indonesia, and more.' },
  'south-america': { emoji: '\uD83C\uDF0E', description: 'Safety guides for South American cities from Buenos Aires to Bogot\u00E1, including scam alerts and neighborhood breakdowns.' },
  'north-america': { emoji: '\uD83D\uDDFD', description: 'City safety guides for the United States, Canada, and Mexico.' },
  'africa': { emoji: '\uD83C\uDF0D', description: 'Travel safety information for African destinations from Cape Town to Cairo.' },
  'central-america': { emoji: '\uD83C\uDF34', description: 'Safety guides for Central America and Caribbean island destinations.' },
  'middle-east': { emoji: '\uD83D\uDD4C', description: 'Safety information for destinations across the Middle East, from Dubai to Jordan.' },
  'south-asia': { emoji: '\uD83C\uDFD4\uFE0F', description: 'Travel safety guides for India, Sri Lanka, Nepal, and the surrounding region.' },
  'east-asia': { emoji: '\u26E9\uFE0F', description: 'Safety guides for Japan, South Korea, China, Taiwan, and East Asian destinations.' },
  'oceania': { emoji: '\uD83C\uDFD6\uFE0F', description: 'Safety information for Australia, New Zealand, and Pacific Island destinations.' },
  'central-asia': { emoji: '\uD83C\uDFDC\uFE0F', description: 'Safety guides for the Silk Road region including Uzbekistan, Kazakhstan, and Kyrgyzstan.' },
};

function getRegions(cities: City[]) {
  const regionMap: Record<string, { name: string; slug: string; count: number; avgScore: number; cities: City[] }> = {};
  cities.forEach(c => {
    let slug = c.regionSlug;
    if (slug === 'central-america-caribbean') slug = 'central-america';
    if (slug === 'west-africa') slug = 'africa';

    if (!regionMap[slug]) {
      regionMap[slug] = { name: c.region, slug, count: 0, avgScore: 0, cities: [] };
    }
    regionMap[slug].count++;
    regionMap[slug].cities.push(c);
  });

  Object.values(regionMap).forEach(r => {
    r.avgScore = Math.round((r.cities.reduce((s, c) => s + c.overallScore, 0) / r.cities.length) * 10) / 10;
  });

  return Object.values(regionMap).sort((a, b) => b.count - a.count);
}

export default function RegionsPage() {
  const cities = getAllCities();
  const regions = getRegions(cities);

  return (
    <>
      <Nav />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span> Regions
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>Travel Safety by Region</h1>
          <p className="page-hero-sub">Browse {cities.length} city safety guides across {regions.length} world regions. Each guide includes safety scores, neighborhood breakdowns, scam alerts, and practical travel tips.</p>
        </div>
      </section>

      <div className="container">
        <div className="regions-page-grid">
          {regions.map(r => {
            const meta = REGION_META[r.slug];
            const topCities = r.cities.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
            return (
              <div key={r.slug} className="region-page-card">
                <div className="region-page-header">
                  <span className="region-page-emoji">{meta?.emoji || '\uD83C\uDF0D'}</span>
                  <div>
                    <h2><Link href={`/regions/${r.slug}`}>{r.name}</Link></h2>
                    <div className="region-page-stats">{r.count} cities &middot; Avg safety: {r.avgScore}/10</div>
                  </div>
                </div>
                {meta && <p className="region-page-desc">{meta.description}</p>}
                <div className="region-page-cities">
                  {topCities.map(c => (
                    <Link key={c.slug} href={`/cities/${c.slug}`} className="region-city-link">
                      <span>{c.name}</span>
                      <span className={`text-${c.badgeClass}`}>{c.overallScore.toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
                <Link href={`/regions/${r.slug}`} className="region-page-viewall">View all {r.count} cities {'\u2192'}</Link>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
