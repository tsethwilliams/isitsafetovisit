import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScoreRow from '@/components/ScoreRow';
import { getAllSlugs, getCityBySlug, getRelatedCities, formatDate, getScoreColor, type City } from '@/lib/cities';

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const city = getCityBySlug(params.slug);
  if (!city) return { title: 'City Not Found' };
  return {
    title: `Is ${city.name} Safe to Visit in 2026? — Safety Guide, Scams & Tips`,
    description: `Is ${city.name} safe for tourists in 2026? Honest neighborhood guide, common scams, safety tips. Updated ${formatDate(city.lastUpdated)}.`,
  };
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const city = getCityBySlug(params.slug);
  if (!city) return <div>City not found</div>;

  const related = getRelatedCities(city);
  const scoreColor = getScoreColor(city.overallScore);
  const scoreLabels: Record<string, string> = {
    pettyCrime: 'Petty Crime', violentCrime: 'Violent Crime', scamRisk: 'Scam Risk',
    womensSafety: "Women's Safety", nightSafety: 'Night Safety', transport: 'Transport', naturalHazards: 'Natural Hazards',
  };
  const hoodLabels: Record<string, string> = { safe: '● SAFE', caution: '● CAUTION', danger: '● AVOID' };

  return (
    <>
      <Nav />

      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">›</span>
          <Link href="/cities">Cities</Link> <span className="sep">›</span>
          {city.name}
        </div>
      </div>

      <section className="city-hero">
        <div className="container">
          <div className="city-hero-grid">
            <div>
              <div className="city-meta">{city.country} · {city.region}</div>
              <h1>Is {city.name} <em>safe</em> to visit in 2026?</h1>
              <p className="city-summary">{city.summary}</p>
              <p className="city-updated">Last updated: <strong>{formatDate(city.lastUpdated)}</strong></p>
            </div>
            <div className="scorecard">
              <div className="scorecard-header">
                <div className="scorecard-label">Overall Safety Score</div>
                <div className={`score-big text-${scoreColor}`}>{city.overallScore.toFixed(1)}</div>
                <div className="score-verdict">{city.verdict}</div>
              </div>
              <div className="score-breakdown">
                {Object.entries(city.scores).map(([key, val]) => (
                  <ScoreRow key={key} label={scoreLabels[key] || key} score={val} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="toc">
          <div className="toc-title">In This Guide</div>
          <ul className="toc-list">
            {[['#verdict','Quick Verdict'],['#neighborhoods','Safe Neighborhoods'],['#scams','Common Scams'],['#solo-female','Solo Female Travel'],['#night-safety','Night Safety'],['#transport','Transport Safety'],['#customs','Local Customs'],['#health','Health & Medical'],['#emergency','Emergency Numbers'],['#faq','FAQ']].map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container">
        <div className="content-layout">
          <div className="main-content">

            <section className="content-section" id="verdict">
              <h2>The Quick Verdict</h2>
              <div className="quick-verdict">
                <h3>⚡ Bottom Line</h3>
                <p>{city.quickVerdict}</p>
              </div>
            </section>

            <section className="content-section" id="neighborhoods">
              <h2>Neighborhood Safety Breakdown</h2>
              <p>{city.name}&rsquo;s safety varies by neighborhood. Here&rsquo;s what you need to know:</p>
              <div className="hood-grid">
                {city.neighborhoods.map(h => (
                  <div key={h.name} className="hood-card">
                    <h4>{h.name}</h4>
                    <div className={`hood-rating text-${h.class}`}>{hoodLabels[h.class]} — {h.score} / 10</div>
                    <p>{h.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-section" id="scams">
              <h2>Common Scams in {city.name}</h2>
              <p>Awareness is your best defense — once you know how they work, they&rsquo;re easy to avoid.</p>
              {city.scams.map(s => (
                <div key={s.name} className="scam-card">
                  <div className="scam-header">
                    <span className={`scam-risk scam-risk-${s.risk}`}>{s.risk.toUpperCase()} RISK</span>
                    <h4>{s.name}</h4>
                  </div>
                  <p>{s.description}</p>
                  <div className="scam-tip"><strong>How to avoid:</strong> {s.howToAvoid}</div>
                </div>
              ))}
            </section>

            <section className="content-section" id="solo-female">
              <h2>Solo Female Travel in {city.name}</h2>
              <p>{city.soloFemale.overview}</p>
              <ul className="tips-list">{city.soloFemale.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </section>

            <section className="content-section" id="night-safety">
              <h2>Is {city.name} Safe at Night?</h2>
              <p>{city.nightSafety.overview}</p>
              <ul className="tips-list">{city.nightSafety.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </section>

            <section className="content-section" id="transport">
              <h2>Transport Safety</h2>
              <h3>Metro &amp; Public Transit</h3><p>{city.transport.metro}</p>
              <h3>Uber &amp; Ride-Hailing</h3><p>{city.transport.rideshare}</p>
              <h3>Taxis</h3><p>{city.transport.taxis}</p>
              <p><strong>Bottom line:</strong> {city.transport.tips}</p>
            </section>

            <section className="content-section" id="customs">
              <h2>Local Customs &amp; Etiquette</h2>
              <ul className="tips-list">{city.customs.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </section>

            <section className="content-section" id="health">
              <h2>Health &amp; Medical</h2>
              <p>{city.health.overview}</p>
              <p><strong>Water:</strong> {city.health.water}</p>
              <p><strong>Vaccinations:</strong> {city.health.vaccinations}</p>
              <p><strong>Altitude/Climate:</strong> {city.health.altitude}</p>
            </section>

            <section className="content-section" id="emergency">
              <h2>Emergency Information</h2>
              <div className="emergency-box">
                <h3>🚨 Emergency Numbers</h3>
                {Object.entries({ 'General Emergency': city.emergency.general, 'Police': city.emergency.police, 'Ambulance': city.emergency.ambulance, 'Fire Department': city.emergency.fire, 'Tourist Police': city.emergency.touristPolice, 'US Embassy': city.emergency.usEmbassy }).map(([label, num]) => (
                  <div key={label} className="emergency-row"><span>{label}</span><span className="emergency-num">{num}</span></div>
                ))}
              </div>
            </section>

            <section className="content-section" id="faq">
              <h2>Frequently Asked Questions</h2>
              {city.faq.map((item, i) => (
                <details key={i} className="faq-item"><summary>{item.q}</summary><p>{item.a}</p></details>
              ))}
            </section>
          </div>

          <div className="sidebar">
            <div className="affiliate-box">
              <h4>🛡️ Travel Insurance for {city.country}</h4>
              <p>Medical emergencies abroad can cost thousands. Travel insurance starts from $1.50/day.</p>
              <a href="https://safetywing.com/?referenceID=26484939&utm_source=26484939&utm_medium=Ambassador" className="affiliate-btn">Get a Quote — SafetyWing</a>
              <p className="affiliate-disclaimer">Affiliate link — we may earn a commission at no cost to you</p>
            </div>

            {related.length > 0 && (
              <div className="sidebar-card">
                <h4>Nearby City Guides</h4>
                {related.slice(0, 5).map(rc => (
                  <Link key={rc.slug} href={`/cities/${rc.slug}`} className="sidebar-link">
                    {rc.name}
                    <span className={`sidebar-score text-${rc.badgeClass}`}>{rc.overallScore.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="sidebar-card">
              <h4>⚡ Quick Safety Tips</h4>
              {city.soloFemale.tips.slice(0, 5).map((tip, i) => (
                <p key={i} className="quick-tips-item">✓ {tip}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <div className="container">
            <div className="section-header"><h2>Similar City Guides</h2><Link href="/cities">All Cities →</Link></div>
            <div className="related-grid">
              {related.slice(0, 3).map(rc => (
                <Link key={rc.slug} href={`/cities/${rc.slug}`} className="related-card">
                  <div className="related-card-region">{rc.country} · {rc.region}</div>
                  <h3>{rc.name}</h3>
                  <p>{rc.summary.slice(0, 120)}...</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: city.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: `Is ${city.name} Safe to Visit in 2026?`, dateModified: city.lastUpdated,
        author: { '@type': 'Organization', name: 'IsItSafeToVisit.com' },
        publisher: { '@type': 'Organization', name: 'IsItSafeToVisit.com' },
      })}} />
    </>
  );
}
