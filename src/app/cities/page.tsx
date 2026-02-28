import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SafetyBadge from '@/components/SafetyBadge';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'All City Safety Guides',
  description: 'Browse travel safety guides for 40+ cities worldwide. Neighborhood breakdowns, scam alerts, and practical tips.',
};

export default function CitiesIndex() {
  const cities = getAllCities();

  // Group by region
  const byRegion: Record<string, typeof cities> = {};
  cities.forEach(c => {
    if (!byRegion[c.region]) byRegion[c.region] = [];
    byRegion[c.region].push(c);
  });

  const regionOrder = ['South America', 'Central America & Caribbean', 'North America', 'Southeast Asia', 'Africa', 'Europe', 'Middle East', 'South Asia'];

  return (
    <>
      <Nav />
      <div className="container" style={{ padding: '60px 24px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 12 }}>
          City Safety Guides
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--ink-light)', marginBottom: 48, maxWidth: 600 }}>
          Honest safety information for {cities.length} cities across {Object.keys(byRegion).length} regions. Click any city for the full guide.
        </p>

        {regionOrder.filter(r => byRegion[r]).map(region => (
          <section key={region} style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--ink)' }}>
              {region}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {byRegion[region].sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                <Link key={city.slug} href={`/cities/${city.slug}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{city.country}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: city.badgeClass === 'safe' ? 'var(--safe-green)' : city.badgeClass === 'caution' ? 'var(--caution-amber)' : 'var(--danger-red)' }}>
                      {city.overallScore.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </>
  );
}
