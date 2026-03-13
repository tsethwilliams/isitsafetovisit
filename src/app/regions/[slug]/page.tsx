import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import SafetyBadge from '@/components/SafetyBadge';
import { getAllCities, getScoreColor, type City } from '@/lib/cities';

const REGION_NAMES: Record<string, string> = {
  'europe': 'Europe',
  'southeast-asia': 'Southeast Asia',
  'south-america': 'South America',
  'north-america': 'North America',
  'africa': 'Africa',
  'central-america': 'Central America & Caribbean',
  'middle-east': 'Middle East',
  'south-asia': 'South Asia',
  'east-asia': 'East Asia',
  'oceania': 'Oceania',
  'central-asia': 'Central Asia',
};

function getCitiesForRegion(slug: string): City[] {
  const cities = getAllCities();
  return cities.filter(c => {
    let regionSlug = c.regionSlug;
    if (regionSlug === 'central-america-caribbean') regionSlug = 'central-america';
    if (regionSlug === 'west-africa') regionSlug = 'africa';
    return regionSlug === slug;
  }).sort((a, b) => b.overallScore - a.overallScore);
}

function getAllRegionSlugs(): string[] {
  const cities = getAllCities();
  const slugs = new Set<string>();
  cities.forEach(c => {
    let slug = c.regionSlug;
    if (slug === 'central-america-caribbean') slug = 'central-america';
    if (slug === 'west-africa') slug = 'africa';
    slugs.add(slug);
  });
  return Array.from(slugs);
}

export function generateStaticParams() {
  return getAllRegionSlugs().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const name = REGION_NAMES[params.slug] || params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const cities = getCitiesForRegion(params.slug);
  return {
    title: `Is ${name} Safe? \u2014 Safety Guides for ${cities.length} Cities | IsItSafeToVisit.com`,
    description: `Travel safety guides for ${cities.length} cities in ${name}. Safety scores, neighborhood breakdowns, scam alerts, and practical tips for every destination.`,
  };
}

export default function RegionPage({ params }: { params: { slug: string } }) {
  const cities = getCitiesForRegion(params.slug);
  const regionName = REGION_NAMES[params.slug] || params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const avgScore = cities.length > 0 ? Math.round((cities.reduce((s, c) => s + c.overallScore, 0) / cities.length) * 10) / 10 : 0;
  const safest = cities.slice(0, 3);
  const countries = new Set(cities.map(c => c.country));

  if (cities.length === 0) return <div>Region not found</div>;

  return (
    <>
            <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span>
          <Link href="/regions">Regions</Link> <span className="sep">{'\u203A'}</span>
          {regionName}
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>Is {regionName} Safe to Visit?</h1>
          <p className="page-hero-sub">Safety guides for {cities.length} cities across {countries.size} countries in {regionName}. Average safety score: {avgScore}/10.</p>
        </div>
      </section>

      <div className="container">
        <div className="region-detail-stats">
          <div className="stat-item"><div className="stat-number">{cities.length}</div><div className="stat-label">Cities</div></div>
          <div className="stat-item"><div className="stat-number">{countries.size}</div><div className="stat-label">Countries</div></div>
          <div className="stat-item"><div className={`stat-number text-${getScoreColor(avgScore)}`}>{avgScore}</div><div className="stat-label">Avg Safety</div></div>
          <div className="stat-item"><div className="stat-number">{cities.reduce((s, c) => s + (c.scams?.length || 0), 0)}</div><div className="stat-label">Scams Listed</div></div>
        </div>

        {safest.length > 0 && (
          <div className="region-safest">
            <h2>Safest Cities in {regionName}</h2>
            <div className="city-grid">
              {safest.map(city => (
                <Link key={city.slug} href={`/cities/${city.slug}`} className="city-card">
                  <div className="city-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div className="city-card-region">{city.country}</div>
                      <SafetyBadge label={city.badgeLabel} badgeClass={city.badgeClass} />
                    </div>
                    <h3 className="city-card-name">{city.name}</h3>
                    <p className="city-card-excerpt">{city.summary.slice(0, 150)}...</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2>All Cities in {regionName}</h2>
        <div className="region-city-list">
          {cities.map(city => (
            <Link key={city.slug} href={`/cities/${city.slug}`} className="recent-item">
              <div className="recent-info">
                <h3>{city.name}, {city.country}</h3>
                <span>{city.verdict}</span>
              </div>
              <span className={`recent-safety text-${city.badgeClass}`}>{city.overallScore.toFixed(1)} / 10</span>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
