import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'Travel Scams Guide \u2014 Common Tourist Scams Worldwide | IsItSafeToVisit.com',
  description: 'Comprehensive guide to common tourist scams in cities worldwide. Learn how scams work and how to avoid them before you travel.',
};

export default function ScamsPage() {
  const cities = getAllCities();
  const allScams: { city: string; citySlug: string; country: string; scam: { name: string; risk: string; description: string; howToAvoid: string } }[] = [];

  cities.forEach(city => {
    (city.scams || []).forEach(scam => {
      allScams.push({ city: city.name, citySlug: city.slug, country: city.country, scam });
    });
  });

  const highRisk = allScams.filter(s => s.scam.risk === 'high');
  const mediumRisk = allScams.filter(s => s.scam.risk === 'medium');
  const lowRisk = allScams.filter(s => s.scam.risk === 'low');

  // Group scams by type
  const scamTypes: Record<string, typeof allScams> = {};
  allScams.forEach(s => {
    const name = s.scam.name.toLowerCase();
    let type = 'Other';
    if (name.includes('pickpocket') || name.includes('theft') || name.includes('snatch')) type = 'Theft & Pickpocketing';
    else if (name.includes('taxi') || name.includes('meter') || name.includes('rickshaw') || name.includes('tuk')) type = 'Transport Scams';
    else if (name.includes('fake') || name.includes('counterfeit') || name.includes('police')) type = 'Impersonation Scams';
    else if (name.includes('overcharg') || name.includes('price') || name.includes('bill')) type = 'Overcharging';
    else if (name.includes('money') || name.includes('currency') || name.includes('atm') || name.includes('card')) type = 'Money & Currency Scams';
    else if (name.includes('guide') || name.includes('tour') || name.includes('ticket')) type = 'Tour & Ticket Scams';
    else if (name.includes('drink') || name.includes('drug') || name.includes('bar')) type = 'Bar & Drink Scams';
    if (!scamTypes[type]) scamTypes[type] = [];
    scamTypes[type].push(s);
  });

  return (
    <>
            <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span> Scams Guide
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>Travel Scams Guide</h1>
          <p className="page-hero-sub">We&apos;ve documented {allScams.length}+ scams across {cities.length} cities. Knowing how they work is your best defense.</p>
        </div>
      </section>

      <div className="container">
        <div className="scams-page-stats">
          <div className="stat-item">
            <div className="stat-number text-danger">{highRisk.length}</div>
            <div className="stat-label">High Risk</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-caution">{mediumRisk.length}</div>
            <div className="stat-label">Medium Risk</div>
          </div>
          <div className="stat-item">
            <div className="stat-number text-safe">{lowRisk.length}</div>
            <div className="stat-label">Low Risk</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{Object.keys(scamTypes).length}</div>
            <div className="stat-label">Scam Types</div>
          </div>
        </div>

        {Object.entries(scamTypes).sort((a, b) => b[1].length - a[1].length).map(([type, scams]) => (
          <section key={type} className="content-section">
            <h2>{type} ({scams.length})</h2>
            <div className="scams-page-grid">
              {scams.slice(0, 8).map((s, i) => (
                <div key={i} className="scam-card">
                  <div className="scam-header">
                    <span className={`scam-risk scam-risk-${s.scam.risk}`}>{s.scam.risk.toUpperCase()} RISK</span>
                    <h4>{s.scam.name}</h4>
                  </div>
                  <p className="scam-city-label">
                    <Link href={`/cities/${s.citySlug}`}>{s.city}, {s.country}</Link>
                  </p>
                  <p>{s.scam.description.length > 150 ? s.scam.description.slice(0, 150) + '...' : s.scam.description}</p>
                  <div className="scam-tip"><strong>How to avoid:</strong> {s.scam.howToAvoid.length > 120 ? s.scam.howToAvoid.slice(0, 120) + '...' : s.scam.howToAvoid}</div>
                </div>
              ))}
            </div>
            {scams.length > 8 && (
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
                Showing 8 of {scams.length} {type.toLowerCase()} scams. Browse individual city guides for complete details.
              </p>
            )}
          </section>
        ))}

        <section className="content-section">
          <h2>Cities with Most Scams</h2>
          <div className="region-city-list">
            {[...cities]
              .filter(c => c.scams && c.scams.length > 0)
              .sort((a, b) => b.scams.length - a.scams.length)
              .slice(0, 15)
              .map(city => (
                <Link key={city.slug} href={`/cities/${city.slug}`} className="recent-item">
                  <div className="recent-info">
                    <h3>{city.name}, {city.country}</h3>
                    <span>{city.scams.length} scams documented</span>
                  </div>
                  <span className={`recent-safety text-${city.badgeClass}`}>{city.scores?.scamRisk?.toFixed(1) || '?'} / 10</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
