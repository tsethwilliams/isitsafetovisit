import Link from 'next/link';
import Footer from '@/components/Footer';
import SafetyBadge from '@/components/SafetyBadge';
import HomeSearch from '@/components/HomeSearch';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getAllCities, type City } from '@/lib/cities';

const REGION_META: Record<string, { emoji: string; order: number }> = {
  'europe': { emoji: '\uD83C\uDFF0', order: 1 },
  'southeast-asia': { emoji: '\uD83C\uDF0F', order: 2 },
  'south-america': { emoji: '\uD83C\uDF0E', order: 3 },
  'north-america': { emoji: '\uD83D\uDDFD', order: 4 },
  'africa': { emoji: '\uD83C\uDF0D', order: 5 },
  'central-america': { emoji: '\uD83C\uDF34', order: 6 },
  'central-america-caribbean': { emoji: '\uD83C\uDF34', order: 6 },
  'middle-east': { emoji: '\uD83D\uDD4C', order: 7 },
  'south-asia': { emoji: '\uD83C\uDFD4\uFE0F', order: 8 },
  'east-asia': { emoji: '\u26E9\uFE0F', order: 9 },
  'oceania': { emoji: '\uD83C\uDFD6\uFE0F', order: 10 },
  'central-asia': { emoji: '\uD83C\uDFDC\uFE0F', order: 11 },
};

const topics = [
  { slug: 'scams', icon: '\uD83C\uDFAD', name: 'Common Scams', desc: 'City-by-city breakdown of tourist scams and how to avoid them.' },
  { slug: 'neighborhoods', icon: '\uD83D\uDDFA\uFE0F', name: 'Safe Neighborhoods', desc: 'Where to stay, walk, and which areas to avoid.' },
  { slug: 'solo-female', icon: '\uD83D\uDC69', name: 'Solo Female Travel', desc: 'Honest safety assessments for women traveling alone.' },
  { slug: 'customs', icon: '\uD83E\uDD1D', name: 'Local Customs', desc: 'Etiquette, dress codes, tipping, and cultural norms.' },
  { slug: 'night-safety', icon: '\uD83C\uDF19', name: 'Night Safety', desc: 'Nightlife areas, late-night transport, and after-dark tips.' },
  { slug: 'transport', icon: '\uD83D\uDE8C', name: 'Transport Safety', desc: "Taxis, rideshares, transit \u2014 what's safe in each city." },
  { slug: 'health', icon: '\uD83C\uDFE5', name: 'Health & Medical', desc: 'Water safety, vaccinations, hospitals, and health risks.' },
  { slug: 'digital-safety', icon: '\uD83D\uDCF1', name: 'Digital Safety', desc: 'WiFi security, phone theft prevention, and VPNs.' },
];

// Curated list of featured cities — mix of safe, moderate, and diverse regions
const FEATURED_SLUGS = ['vienna', 'tokyo', 'bangkok', 'medellin', 'cape-town', 'dubrovnik'];

// Curated Unsplash photos for featured cities
const CITY_IMAGES: Record<string, string> = {
  'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&h=400&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&h=400&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&h=400&q=80',
  'medellin': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&h=400&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&h=400&q=80',
  'dubrovnik': 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&h=400&q=80',
};

function getCityImage(slug: string): string {
  return CITY_IMAGES[slug] || '';
}

function CityCard({ city }: { city: City }) {
  return (
    <Link href={`/cities/${city.slug}`} className="city-card">
      {getCityImage(city.slug) && (
        <div className="city-card-image" style={{
          backgroundImage: `url(${getCityImage(city.slug)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '160px',
          borderRadius: '12px 12px 0 0',
        }} />
      )}
      <div className="city-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div className="city-card-region">{city.country} &middot; {city.region}</div>
          <SafetyBadge label={city.badgeLabel} badgeClass={city.badgeClass} />
        </div>
        <h3 className="city-card-name">{city.name}</h3>
        <p className="city-card-excerpt">{city.summary.slice(0, 120)}...</p>
      </div>
    </Link>
  );
}

function getRegions(cities: City[]) {
  const regionMap: Record<string, { name: string; slug: string; count: number }> = {};
  cities.forEach(c => {
    let slug = c.regionSlug;
    if (slug === 'central-america-caribbean') slug = 'central-america';
    if (slug === 'west-africa') slug = 'africa';

    if (!regionMap[slug]) {
      regionMap[slug] = { name: c.region, slug, count: 0 };
    }
    regionMap[slug].count++;
  });
  return Object.values(regionMap).sort((a, b) => {
    const orderA = REGION_META[a.slug]?.order ?? 99;
    const orderB = REGION_META[b.slug]?.order ?? 99;
    return orderA - orderB;
  });
}

export default function HomePage() {
  const cities = getAllCities();

  // Get curated featured cities, fall back to first 6 if slugs not found
  let featured = FEATURED_SLUGS.map(slug => cities.find(c => c.slug === slug)).filter((c): c is City => c !== undefined);
  if (featured.length < 4) featured = cities.slice(0, 6);

  const recent = [...cities].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  const regions = getRegions(cities);

  const searchCities = cities.map(c => ({
    slug: c.slug,
    name: c.name,
    country: c.country,
    region: c.region,
    overallScore: c.overallScore,
    badgeClass: c.badgeClass,
  }));

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-badge">Updated March 2026</div>
          <h1>Know before <em>you go</em></h1>
          <p className="hero-sub">Honest, detailed safety guides for {cities.length}+ cities worldwide. Real neighborhood breakdowns, scam alerts, local customs, and practical tips.</p>
          <HomeSearch cities={searchCities} />
          <div className="search-hints">
            Popular:{' '}
            {['tokyo', 'bangkok', 'istanbul', 'cape-town', 'vienna'].map((slug, i) => {
              const c = cities.find(x => x.slug === slug);
              return c ? <span key={slug}>{i > 0 && ' \u00B7 '}<Link href={`/cities/${slug}`}>{c.name}</Link></span> : null;
            })}
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-number">{cities.length}</div><div className="stat-label">Cities Covered</div></div>
            <div className="stat-item"><div className="stat-number">{new Set(cities.map(c => c.country)).size}</div><div className="stat-label">Countries</div></div>
            <div className="stat-item"><div className="stat-number">{cities.reduce((s, c) => s + (c.scams?.length || 0), 0)}+</div><div className="stat-label">Scams Documented</div></div>
            <div className="stat-item"><div className="stat-number">Daily</div><div className="stat-label">Updates</div></div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header"><h2>Featured City Guides</h2><Link href="/cities">View All Cities {'\u2192'}</Link></div>
          <div className="city-grid">{featured.map(c => <CityCard key={c.slug} city={c} />)}</div>
        </div>
      </section>

      <section className="recent-section">
        <div className="container">
          <div className="section-header"><h2>Recently Updated</h2><Link href="/cities">All Guides {'\u2192'}</Link></div>
          <div className="recent-list">
            {recent.map((city, i) => (
              <Link key={city.slug} href={`/cities/${city.slug}`} className="recent-item">
                <span className="recent-rank">{String(i + 1).padStart(2, '0')}</span>
                <div className="recent-info"><h3>{city.name}, {city.country}</h3><span>{city.region}</span></div>
                <span className={`recent-safety text-${city.badgeClass}`}>{city.overallScore} / 10</span>
                <span className="recent-date">{city.lastUpdated}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="topics-section">
        <div className="container">
          <div className="section-header"><h2>Explore by Topic</h2></div>
          <div className="topics-grid">
            {topics.map(t => (
              <Link key={t.slug} href={`/topics/${t.slug}`} className="topic-card">
                <span className="topic-icon">{t.icon}</span><h3>{t.name}</h3><p>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="regions-section">
        <div className="container">
          <div className="section-header"><h2>Browse by Region</h2></div>
          <div className="regions-grid">
            {regions.map(r => (
              <Link key={r.slug} href={`/regions/${r.slug}`} className="region-card">
                <span className="region-emoji">{REGION_META[r.slug]?.emoji || '\uD83C\uDF0D'}</span>
                <div><div className="region-name">{r.name}</div><div className="region-count">{r.count} cities</div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Stay informed. Travel safer.</h2>
          <p>Get weekly safety updates, new city guides, and scam alerts delivered to your inbox.</p>
          <NewsletterSignup />
        </div>
      </section>

      <Footer />
    </>
  );
}
