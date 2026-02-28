import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SafetyBadge from '@/components/SafetyBadge';
import { getAllCities, type City } from '@/lib/cities';

const regions = [
  { slug: 'southeast-asia', name: 'Southeast Asia', emoji: '🌏', count: 9 },
  { slug: 'south-america', name: 'South America', emoji: '🌎', count: 9 },
  { slug: 'europe', name: 'Europe', emoji: '🏰', count: 7 },
  { slug: 'africa', name: 'Africa', emoji: '🌍', count: 6 },
  { slug: 'central-america', name: 'Central America & Caribbean', emoji: '🌴', count: 8 },
  { slug: 'north-america', name: 'North America', emoji: '🗽', count: 1 },
  { slug: 'middle-east', name: 'Middle East', emoji: '🕌', count: 2 },
  { slug: 'south-asia', name: 'South Asia', emoji: '🏔️', count: 4 },
];

const topics = [
  { slug: 'scams', icon: '🎭', name: 'Common Scams', desc: 'City-by-city breakdown of tourist scams and how to avoid them.' },
  { slug: 'neighborhoods', icon: '🗺️', name: 'Safe Neighborhoods', desc: 'Where to stay, walk, and which areas to avoid.' },
  { slug: 'solo-female', icon: '👩', name: 'Solo Female Travel', desc: 'Honest safety assessments for women traveling alone.' },
  { slug: 'customs', icon: '🤝', name: 'Local Customs', desc: 'Etiquette, dress codes, tipping, and cultural norms.' },
  { slug: 'night-safety', icon: '🌙', name: 'Night Safety', desc: 'Nightlife areas, late-night transport, and after-dark tips.' },
  { slug: 'transport', icon: '🚕', name: 'Transport Safety', desc: "Taxis, rideshares, transit — what's safe in each city." },
  { slug: 'health', icon: '🏥', name: 'Health & Medical', desc: 'Water safety, vaccinations, hospitals, and health risks.' },
  { slug: 'digital-safety', icon: '📱', name: 'Digital Safety', desc: 'WiFi security, phone theft prevention, and VPNs.' },
];

function CityCard({ city }: { city: City }) {
  return (
    <Link href={`/cities/${city.slug}`} className="city-card">
      <div className="city-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div className="city-card-region">{city.country} · {city.region}</div>
          <SafetyBadge label={city.badgeLabel} badgeClass={city.badgeClass} />
        </div>
        <h3 className="city-card-name">{city.name}</h3>
        <p className="city-card-excerpt">{city.summary.slice(0, 150)}...</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const cities = getAllCities();
  const featured = cities.slice(0, 6);
  const recent = cities.slice(0, 5);

  return (
    <>
      <Nav />
      <section className="hero">
        <div className="container">
          <div className="hero-badge">Updated February 2026</div>
          <h1>Know before <em>you go</em></h1>
          <p className="hero-sub">Honest, detailed safety guides for 300+ cities worldwide. Real neighborhood breakdowns, scam alerts, local customs, and practical tips.</p>
          <div className="search-hints">
            Popular:{' '}
            {['medellin', 'bangkok', 'istanbul', 'cape-town', 'mexico-city'].map((slug, i) => {
              const c = cities.find(x => x.slug === slug);
              return c ? <span key={slug}>{i > 0 && ' · '}<Link href={`/cities/${slug}`}>{c.name}</Link></span> : null;
            })}
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-number">{cities.length}</div><div className="stat-label">Cities Covered</div></div>
            <div className="stat-item"><div className="stat-number">{new Set(cities.map(c => c.country)).size}</div><div className="stat-label">Countries</div></div>
            <div className="stat-item"><div className="stat-number">{cities.reduce((s, c) => s + c.scams.length, 0)}+</div><div className="stat-label">Scams Documented</div></div>
            <div className="stat-item"><div className="stat-number">Weekly</div><div className="stat-label">Updates</div></div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header"><h2>Featured City Guides</h2><Link href="/cities">View All Cities →</Link></div>
          <div className="city-grid">{featured.map(c => <CityCard key={c.slug} city={c} />)}</div>
        </div>
      </section>

      <section className="recent-section">
        <div className="container">
          <div className="section-header"><h2>Recently Updated</h2><Link href="/cities">All Guides →</Link></div>
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
                <span className="region-emoji">{r.emoji}</span>
                <div><div className="region-name">{r.name}</div><div className="region-count">{r.count} cities</div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container"><h2>Stay safe out there</h2><p>Weekly safety updates, new city guides, and scam alerts. Free, no spam.</p></div>
      </section>

      <Footer />
    </>
  );
}
