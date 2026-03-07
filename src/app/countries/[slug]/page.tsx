import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllCities } from '@/lib/cities';

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getScoreClass(score: number) {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

function getBadgeLabel(score: number) {
  if (score >= 7) return 'Generally Safe';
  if (score >= 5) return 'Moderate Caution';
  return 'Exercise Caution';
}

type CityData = {
  slug: string; name: string; country: string; region: string;
  overallScore: number; badgeLabel?: string; badgeClass?: string;
  scores?: Record<string, number>;
};

export async function generateStaticParams() {
  const raw = getAllCities();
  const cities: CityData[] = Array.isArray(raw) ? raw : [];
  const countries = new Set(cities.map(c => toSlug(c.country)));
  return Array.from(countries).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const raw = getAllCities();
  const cities: CityData[] = Array.isArray(raw) ? raw : [];
  const countryCities = cities.filter(c => toSlug(c.country) === params.slug);
  if (!countryCities.length) return { title: 'Country Not Found' };
  const country = countryCities[0].country;
  const avg = countryCities.reduce((s, c) => s + c.overallScore, 0) / countryCities.length;
  return {
    title: `Is ${country} Safe to Visit? Travel Safety Guide ${new Date().getFullYear()} — IsItSafeToVisit`,
    description: `${country} travel safety guide. Average safety score ${avg.toFixed(1)}/10 across ${countryCities.length} cities. Find the safest cities, common scams, and essential travel tips.`,
  };
}

const SCORE_LABELS: Record<string, string> = {
  pettyCrime: 'Petty Crime',
  violentCrime: 'Violent Crime',
  scamRisk: 'Scam Risk',
  womensSafety: "Women\u2019s Safety",
  nightSafety: 'Night Safety',
  transport: 'Transport',
  naturalHazards: 'Natural Hazards',
};

export default function CountryPage({ params }: { params: { slug: string } }) {
  const raw = getAllCities();
  const cities: CityData[] = Array.isArray(raw) ? raw : [];
  const countryCities = cities.filter(c => toSlug(c.country) === params.slug);
  if (!countryCities.length) notFound();

  const country = countryCities[0].country;
  const region = countryCities[0].region;
  const regionSlug = toSlug(region);

  const avg = countryCities.reduce((s, c) => s + c.overallScore, 0) / countryCities.length;
  const scoreClass = getScoreClass(avg);
  const badgeLabel = getBadgeLabel(avg);

  const sorted = [...countryCities].sort((a, b) => b.overallScore - a.overallScore);
  const safest = sorted.slice(0, 3);
  const riskiest = [...countryCities].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);

  // Avg per category
  const categoryAvgs: Record<string, number> = {};
  const scoreKeys = ['pettyCrime','violentCrime','scamRisk','womensSafety','nightSafety','transport','naturalHazards'];
  for (const key of scoreKeys) {
    const vals = countryCities.filter(c => c.scores?.[key]).map(c => c.scores![key]);
    if (vals.length) categoryAvgs[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const bookingUrl = `https://www.awin1.com/cread.php?awinmid=6776&awinaffid=2793818&ued=https://www.booking.com/searchresults.html?ss=${encodeURIComponent(country)}`;
  const safetyWingUrl = 'https://safetywing.com/?referenceID=26484939&utm_source=26484939&utm_medium=Ambassador';
  const nordvpnUrl = 'https://go.nordvpn.net/aff_c?offer_id=15&aff_id=142230&url_id=902';

  return (
    <main className="country-page">
      {/* Breadcrumb */}
      <div className="container">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/countries">Countries</Link>
          <span>›</span>
          <Link href={`/regions`}>{region}</Link>
          <span>›</span>
          <span>{country}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="country-hero">
        <div className="container">
          <div className="country-hero-inner">
            <div>
              <h1>Is {country} Safe to Visit?</h1>
              <p className="country-hero-subtitle">
                Safety analysis across {countryCities.length} {countryCities.length === 1 ? 'city' : 'cities'} · Updated {new Date().getFullYear()}
              </p>
            </div>
            <div className="country-hero-score">
              <div className={`country-big-score score-${scoreClass}`}>{avg.toFixed(1)}</div>
              <div className="country-big-score-label">out of 10</div>
              <div className={`safety-badge badge-${scoreClass}`}>{badgeLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container country-layout">
        <div className="country-main">

          {/* Category Scores */}
          {Object.keys(categoryAvgs).length > 0 && (
            <section className="country-section">
              <h2>Safety Score Breakdown</h2>
              <div className="country-scores-grid">
                {scoreKeys.filter(k => categoryAvgs[k]).map(key => (
                  <div key={key} className="country-score-row">
                    <span className="country-score-label">{SCORE_LABELS[key]}</span>
                    <div className="country-score-bar-wrap">
                      <div
                        className={`country-score-bar score-bar-${getScoreClass(categoryAvgs[key])}`}
                        style={{ width: `${categoryAvgs[key] * 10}%` }}
                      />
                    </div>
                    <span className={`country-score-val score-${getScoreClass(categoryAvgs[key])}`}>
                      {categoryAvgs[key].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Safest & Riskiest */}
          <section className="country-section">
            <div className="country-cities-grid">
              <div>
                <h2>✅ Safest Cities in {country}</h2>
                <div className="country-city-list">
                  {safest.map(city => (
                    <Link key={city.slug} href={`/cities/${city.slug}`} className="country-city-row">
                      <span className="country-city-name">{city.name}</span>
                      <span className={`country-city-score score-${getScoreClass(city.overallScore)}`}>
                        {city.overallScore.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              {riskiest[0]?.overallScore < avg && (
                <div>
                  <h2>⚠️ Higher Risk Cities</h2>
                  <div className="country-city-list">
                    {riskiest.map(city => (
                      <Link key={city.slug} href={`/cities/${city.slug}`} className="country-city-row">
                        <span className="country-city-name">{city.name}</span>
                        <span className={`country-city-score score-${getScoreClass(city.overallScore)}`}>
                          {city.overallScore.toFixed(1)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Booking CTA */}
          <div className="booking-cta-block">
            <div className="booking-cta-text">
              <strong>Ready to book {country}?</strong>
              <span>Compare hotels and find the best deals.</span>
            </div>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-booking">
              Search Hotels in {country}
            </a>
          </div>

          {/* All Cities */}
          <section className="country-section">
            <h2>All Cities in {country}</h2>
            <div className="country-all-cities">
              {sorted.map(city => (
                <Link key={city.slug} href={`/cities/${city.slug}`} className="country-all-city-row">
                  <span className="country-city-name">{city.name}</span>
                  <span className={`safety-badge badge-${getScoreClass(city.overallScore)} badge-sm`}>
                    {getBadgeLabel(city.overallScore)}
                  </span>
                  <span className={`country-city-score score-${getScoreClass(city.overallScore)}`}>
                    {city.overallScore.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="country-sidebar">
          <div className="sidebar-box">
            <div className="sidebar-box-title">🛡️ Travel Insurance</div>
            <p>Don't travel to {country} without coverage. Medical emergencies abroad can cost thousands.</p>
            <a href={safetyWingUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-safetywing">
              Get SafetyWing Coverage
            </a>
          </div>

          <div className="sidebar-box">
            <div className="sidebar-box-title">🔒 Stay Secure Online</div>
            <p>Protect yourself on public WiFi in hotels and cafés across {country}.</p>
            <a href={nordvpnUrl} target="_blank" rel="noopener noreferrer sponsored" className="btn-nordvpn">
              Get NordVPN
            </a>
          </div>

          <div className="sidebar-box">
            <div className="sidebar-box-title">📍 Explore the Region</div>
            <p>{country} is part of {region}.</p>
            <Link href={`/regions`} className="sidebar-region-link">
              View {region} safety overview →
            </Link>
          </div>

          <div className="sidebar-box">
            <div className="sidebar-box-title">🏙️ Browse All Countries</div>
            <Link href="/countries" className="sidebar-region-link">
              View all countries →
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
