import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About IsItSafeToVisit.com — Our Mission and Methodology',
  description: 'How IsItSafeToVisit.com creates honest, data-driven travel safety guides for 500+ destinations worldwide.',
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a><span>›</span><span>About</span></div>
          <h1>About IsItSafeToVisit.com</h1>
          <p className="hero-subtitle">Honest travel safety intelligence — built for real travelers, not tourism boards.</p>
        </div>
      </div>
      <div className="container page-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>Every year, millions of travelers ask the same question: Is it safe to visit this city? The answers found online are often vague, outdated, or written by someone with a vested interest in getting them to book a trip.</p>
          <p>IsItSafeToVisit.com exists to change that. We provide straight-talking, neighborhood-level safety intelligence covering petty crime, scams, transport safety, solo female travel, nighttime safety, and more.</p>
          <p>We do not work for tourism boards. We do not get paid to say places are safer than they are. Our job is to give you the real picture so you can travel confidently and prepared.</p>
        </section>
        <section className="about-section">
          <h2>Our Methodology</h2>
          <div className="methodology-grid">
            <div className="method-card"><div className="method-icon">🏛️</div><h3>Government Travel Advisories</h3><p>U.S. State Department, UK FCDO, Australian DFAT, and Canadian GAC travel warnings form our baseline safety assessment.</p></div>
            <div className="method-card"><div className="method-icon">📊</div><h3>Crime Statistics</h3><p>Official crime data from local law enforcement, Numbeo crime indices, and international crime databases where available.</p></div>
            <div className="method-card"><div className="method-icon">✈️</div><h3>Traveler Reports</h3><p>Thousands of first-hand accounts from forums and travel communities inform our neighborhood breakdowns.</p></div>
            <div className="method-card"><div className="method-icon">📰</div><h3>Local News Monitoring</h3><p>We monitor English-language local news and wire services for safety incidents, protests, and emerging threats.</p></div>
            <div className="method-card"><div className="method-icon">🔬</div><h3>Expert Synthesis</h3><p>Our AI-assisted research synthesizes these sources into structured safety scores reviewed for accuracy.</p></div>
            <div className="method-card"><div className="method-icon">🔄</div><h3>Regular Updates</h3><p>We update city guides on a rolling basis to reflect new advisories, incidents, and evolving conditions.</p></div>
          </div>
        </section>
        <section className="about-section">
          <h2>How We Score Cities</h2>
          <p>Every city receives scores from 1 to 10 across seven safety categories, where 10 is safest and 1 is most dangerous.</p>
          <div className="score-categories">
            <div className="score-cat"><span className="score-label">Petty Crime</span><span className="score-desc">Pickpocketing, bag snatching, opportunistic theft</span></div>
            <div className="score-cat"><span className="score-label">Violent Crime</span><span className="score-desc">Assault, robbery, serious crime incidents</span></div>
            <div className="score-cat"><span className="score-label">Scam Risk</span><span className="score-desc">Tourist scams, taxi fraud, overcharging prevalence</span></div>
            <div className="score-cat"><span className="score-label">Women's Safety</span><span className="score-desc">Solo female traveler experience, harassment risk</span></div>
            <div className="score-cat"><span className="score-label">Night Safety</span><span className="score-desc">After-dark conditions, nightlife area risks</span></div>
            <div className="score-cat"><span className="score-label">Transport</span><span className="score-desc">Public transit safety, road conditions, rideshare reliability</span></div>
            <div className="score-cat"><span className="score-label">Natural Hazards</span><span className="score-desc">Earthquake, flood, hurricane, and environmental risk</span></div>
          </div>
        </section>
        <section className="about-section">
          <h2>A Note on Limitations</h2>
          <p>No travel safety resource is perfect. Safety conditions change rapidly and vary by neighborhood. Our guides are starting points, not guarantees. Always check current government advisories and get travel insurance.</p>
        </section>
        <section className="about-section about-cta-section">
          <h2>Start Researching Your Trip</h2>
          <p>We cover 500+ destinations and counting.</p>
          <div className="about-cta-buttons">
            <a href="/" className="btn-primary">Search Cities</a>
            <a href="/regions" className="btn-secondary">Browse by Region</a>
          </div>
        </section>
      </div>
      <style>{`
        .about-page{background:var(--paper);min-height:100vh}
        .page-hero{background:var(--ink);padding:3rem 0 2.5rem;border-bottom:3px solid var(--accent)}
        .page-hero h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2rem,4vw,3rem);color:var(--paper);margin:.5rem 0 1rem;line-height:1.15}
        .hero-subtitle{font-size:1.15rem;color:#aaa;max-width:600px;margin:0;font-style:italic}
        .breadcrumb{font-size:.85rem;color:#888;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem}
        .breadcrumb a{color:#aaa;text-decoration:none}
        .page-content{padding-top:3rem;padding-bottom:4rem}
        .about-section{max-width:760px;margin-bottom:3.5rem}
        .about-section h2{font-family:'DM Serif Display',Georgia,serif;font-size:1.75rem;color:var(--ink);margin:0 0 1.25rem;padding-bottom:.6rem;border-bottom:2px solid var(--border)}
        .about-section p{font-size:1.05rem;line-height:1.75;color:var(--ink-light);margin-bottom:1rem}
        .methodology-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem;margin-top:1.5rem}
        .method-card{background:white;border:1px solid var(--border);border-radius:8px;padding:1.5rem}
        .method-icon{font-size:1.75rem;margin-bottom:.75rem}
        .method-card h3{font-family:'DM Serif Display',Georgia,serif;font-size:1.1rem;color:var(--ink);margin:0 0 .5rem}
        .method-card p{font-size:.95rem;margin:0;color:var(--ink-muted)}
        .score-categories{margin:1.25rem 0;border:1px solid var(--border);border-radius:8px;overflow:hidden}
        .score-cat{display:flex;align-items:baseline;gap:1rem;padding:.85rem 1.25rem;border-bottom:1px solid var(--border)}
        .score-cat:last-child{border-bottom:none}
        .score-cat:nth-child(even){background:var(--paper-warm)}
        .score-label{font-family:'JetBrains Mono',monospace;font-size:.85rem;font-weight:700;color:var(--ink);min-width:160px;flex-shrink:0}
        .score-desc{font-size:.95rem;color:var(--ink-muted)}
        .about-cta-section{background:var(--paper-warm);border:1px solid var(--border);border-radius:10px;padding:2rem}
        .about-cta-section h2{border-bottom:none;margin-bottom:.75rem}
        .about-cta-buttons{display:flex;gap:1rem;margin-top:1.25rem;flex-wrap:wrap}
        .btn-primary{background:var(--accent);color:white;padding:.7rem 1.75rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:.95rem}
        .btn-secondary{background:white;color:var(--ink);padding:.7rem 1.75rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:.95rem;border:1px solid var(--border)}
        @media(max-width:640px){.methodology-grid{grid-template-columns:1fr}.score-cat{flex-direction:column;gap:.25rem}.score-label{min-width:unset}}
      `}</style>
    </main>
  )
}