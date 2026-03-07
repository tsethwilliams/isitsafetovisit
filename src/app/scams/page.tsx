import type { Metadata } from 'next'
import cityData from '@/data/city-data.json'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Common Tourist Scams by Country and City — IsItSafeToVisit.com',
  description: 'Browse common tourist scams by country and city with how-to-avoid guides for 500+ destinations.',
}

interface City {
  slug: string
  name: string
  country: string
  scores: { scamRisk: number }
}

const UNIVERSAL_SCAMS = [
  { category: 'Taxi and Transport', icon: '🚕', scams: [
    { name: 'Broken Meter Scam', description: 'Driver claims the meter is broken and quotes an inflated fixed fare. Common worldwide, especially at airports.', howToAvoid: 'Always insist on the meter, or use a rideshare app like Uber or Grab where the price is set in advance.' },
    { name: 'Long Route Detour', description: 'Taxi takes an unnecessarily long route to inflate the fare. Hard to detect in unfamiliar cities.', howToAvoid: 'Screenshot your route on Google Maps before getting in and speak up if the driver deviates significantly.' },
    { name: 'Fake Rideshare Driver', description: 'Impersonators wait near rideshare pickup zones pretending to be your booked driver.', howToAvoid: 'Always verify driver name, license plate, and car make before getting in. Never say the driver name first.' },
  ]},
  { category: 'Street and Attraction Scams', icon: '🗺️', scams: [
    { name: 'Friendship Bracelet', description: 'A stranger ties a bracelet onto your wrist without permission, then aggressively demands payment.', howToAvoid: 'Keep hands in pockets near tourist areas. Refuse firmly and walk away immediately.' },
    { name: 'Closed Attraction Redirect', description: 'A stranger claims your destination is closed today and offers to take you somewhere better. Nothing is ever closed.', howToAvoid: 'Ignore unsolicited advice about closures. Walk directly to the attraction yourself.' },
    { name: 'Dropped Item Distraction', description: 'Someone drops something and an accomplice pickpockets you while you are distracted.', howToAvoid: 'Keep your bag in front. Stay alert in crowded areas. Do not get drawn into street dramas.' },
  ]},
  { category: 'Food and Drink', icon: '🍽️', scams: [
    { name: 'Unmarked Menu Prices', description: 'Restaurant has no prices on the menu. The bill arrives with massive charges for service fees or inflated items.', howToAvoid: 'Always ask for a written menu with prices before ordering. If no prices are shown, leave.' },
    { name: 'Drink Spiking', description: 'Drinks are spiked with sedatives at bars. More common in nightlife districts.', howToAvoid: 'Never leave your drink unattended. Accept drinks only from bartenders. Travel with a buddy at night.' },
  ]},
  { category: 'Money and Cards', icon: '💳', scams: [
    { name: 'Currency Confusion', description: 'Vendors exploit unfamiliarity with local currency to shortchange you. Common with multi-zero currencies.', howToAvoid: 'Know the exchange rate before you arrive. Count change carefully every time.' },
    { name: 'ATM Card Skimming', description: 'Skimming devices installed on ATMs capture your card data and PIN.', howToAvoid: 'Use ATMs inside banks or hotels. Cover keypad when entering PIN. Check for loose card readers.' },
    { name: 'Fake Police Shakedown', description: 'Plain clothes police demand to inspect your wallet for counterfeit money and steal from it.', howToAvoid: 'Real police have uniforms. Insist on going to the nearest police station. Never hand over your wallet.' },
  ]},
]

export default function ScamsPage() {
  const cities = cityData as City[]
  const highRiskCities = cities
    .filter(c => c.scores?.scamRisk && c.scores.scamRisk <= 5.5)
    .sort((a, b) => a.scores.scamRisk - b.scores.scamRisk)
    .slice(0, 18)

  return (
    <main className="scams-page">
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a><span>›</span><span>Scam Guide</span></div>
          <h1>The Tourist Scam Guide</h1>
          <p className="hero-subtitle">Know the plays before they run them on you.</p>
        </div>
      </div>
      <div className="container page-content">
        <div className="scams-layout">
          <div className="scams-main">
            <p className="lead-text">Tourist scams are a global industry. The setups differ by city but the mechanics repeat — distraction, social pressure, confusion, urgency. Knowing the playbook is the best defense.</p>
            <section className="universal-scams">
              <h2>Universal Scams: The Global Playbook</h2>
              {UNIVERSAL_SCAMS.map((cat) => (
                <div key={cat.category} className="scam-category">
                  <h3><span className="cat-icon">{cat.icon}</span>{cat.category}</h3>
                  {cat.scams.map((scam) => (
                    <div key={scam.name} className="scam-card">
                      <p className="scam-name">{scam.name}</p>
                      <p className="scam-desc">{scam.description}</p>
                      <div className="avoid-box"><strong>How to avoid:</strong> {scam.howToAvoid}</div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
          <aside className="scams-sidebar">
            <div className="sidebar-widget">
              <h3>Highest Scam Risk Cities</h3>
              <p className="widget-note">Cities with the lowest scam safety scores in our database.</p>
              {highRiskCities.map((city) => (
                <Link key={city.slug} href={`/cities/${city.slug}`} className="risk-city-link">
                  <span className="rc-name">{city.name}</span>
                  <span className="rc-country">{city.country}</span>
                  <span className="rc-score">{city.scores.scamRisk.toFixed(1)}</span>
                </Link>
              ))}
            </div>
            <div className="sidebar-widget protect-widget">
              <h3>🛡️ Protect Yourself Online</h3>
              <p>A VPN protects your financial data on public Wi-Fi in hotels, cafes, and airports abroad.</p>
              <a href="https://go.nordvpn.net/aff_c?offer_id=15&aff_id=142230&url_id=902" target="_blank" rel="noopener noreferrer" className="vpn-cta">Get NordVPN — Travel Secure</a>
              <p className="affiliate-note">Affiliate link — helps support this site</p>
            </div>
            <div className="sidebar-widget insurance-widget">
              <h3>🚑 Travel Insurance</h3>
              <p>SafetyWing covers you worldwide from $1.87/day.</p>
              <a href="https://safetywing.com/?referenceID=26484939&utm_source=26484939&utm_medium=Ambassador" target="_blank" rel="noopener noreferrer" className="insurance-cta">Get SafetyWing Coverage</a>
              <p className="affiliate-note">Affiliate link — helps support this site</p>
            </div>
          </aside>
        </div>
        <section className="city-scams-section">
          <h2>Find Scam Guides by City</h2>
          <p>Every city page includes local scam warnings with risk levels and avoidance tips.</p>
          <div className="city-scams-grid">
            {cities.slice(0, 48).map((city) => (
              <Link key={city.slug} href={`/cities/${city.slug}#scams`} className="city-scam-chip">{city.name}</Link>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}><Link href="/" className="browse-all-link">Browse all cities →</Link></div>
        </section>
      </div>
      <style>{`
        .scams-page{background:var(--paper);min-height:100vh}
        .page-hero{background:var(--ink);padding:3rem 0 2.5rem;border-bottom:3px solid var(--accent)}
        .page-hero h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2rem,4vw,3rem);color:var(--paper);margin:.5rem 0 1rem}
        .hero-subtitle{font-size:1.1rem;color:#aaa;margin:0;font-style:italic}
        .breadcrumb{font-size:.85rem;color:#888;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem}
        .breadcrumb a{color:#aaa;text-decoration:none}
        .breadcrumb a:hover{color:var(--accent-light)}
        .page-content{padding-top:3rem;padding-bottom:4rem}
        .scams-layout{display:grid;grid-template-columns:1fr 300px;gap:2.5rem;align-items:start;margin-bottom:3rem}
        .lead-text{font-size:1.05rem;line-height:1.75;color:var(--ink-light);font-style:italic;border-left:3px solid var(--accent);padding-left:1.25rem;margin-bottom:2rem}
        .universal-scams h2{font-family:'DM Serif Display',Georgia,serif;font-size:1.75rem;color:var(--ink);margin:0 0 1.5rem;padding-bottom:.6rem;border-bottom:2px solid var(--border)}
        .scam-category{margin-bottom:2.5rem}
        .scam-category h3{font-family:'DM Serif Display',Georgia,serif;font-size:1.2rem;color:var(--ink);margin:0 0 1rem;display:flex;align-items:center;gap:.5rem}
        .scam-card{background:white;border:1px solid var(--border);border-radius:8px;padding:1.25rem;margin-bottom:1rem}
        .scam-name{font-weight:700;color:var(--ink);font-size:1rem;margin:0 0 .5rem}
        .scam-desc{font-size:.95rem;color:var(--ink-muted);line-height:1.6;margin-bottom:.75rem}
        .avoid-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;padding:.7rem 1rem;font-size:.9rem;color:var(--ink-light);line-height:1.55}
        .avoid-box strong{color:var(--safe-green)}
        .scams-sidebar{position:sticky;top:1.5rem;display:flex;flex-direction:column;gap:1.25rem}
        .sidebar-widget{background:white;border:1px solid var(--border);border-radius:8px;padding:1.25rem}
        .sidebar-widget h3{font-family:'DM Serif Display',Georgia,serif;font-size:1.05rem;color:var(--ink);margin:0 0 .5rem}
        .widget-note{font-size:.85rem;color:var(--ink-muted);margin-bottom:.75rem}
        .risk-city-link{display:flex;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border);text-decoration:none;gap:.4rem}
        .risk-city-link:last-child{border-bottom:none}
        .risk-city-link:hover .rc-name{color:var(--accent)}
        .rc-name{font-size:.9rem;font-weight:600;color:var(--ink);flex:1}
        .rc-country{font-size:.8rem;color:var(--ink-muted)}
        .rc-score{font-family:'JetBrains Mono',monospace;font-size:.85rem;font-weight:700;color:var(--danger-red)}
        .protect-widget,.insurance-widget{background:var(--paper-warm)}
        .protect-widget p,.insurance-widget p{font-size:.9rem;color:var(--ink-muted);line-height:1.55;margin-bottom:.75rem}
        .vpn-cta,.insurance-cta{display:block;text-align:center;padding:.65rem 1rem;border-radius:6px;font-weight:700;font-size:.9rem;text-decoration:none;margin-bottom:.5rem}
        .vpn-cta{background:#1a66cc;color:white}
        .insurance-cta{background:var(--accent);color:white}
        .affiliate-note{font-size:.75rem!important;color:#999!important;text-align:center;margin:0!important}
        .city-scams-section{border-top:2px solid var(--border);padding-top:2.5rem}
        .city-scams-section h2{font-family:'DM Serif Display',Georgia,serif;font-size:1.75rem;color:var(--ink);margin:0 0 .75rem}
        .city-scams-section > p{color:var(--ink-muted);margin-bottom:1.5rem}
        .city-scams-grid{display:flex;flex-wrap:wrap;gap:.5rem}
        .city-scam-chip{background:white;border:1px solid var(--border);border-radius:20px;padding:.35rem .9rem;font-size:.9rem;color:var(--ink-light);text-decoration:none;transition:border-color .15s,color .15s}
        .city-scam-chip:hover{border-color:var(--accent);color:var(--accent)}
        .browse-all-link{color:var(--accent);text-decoration:none;font-weight:600;font-size:.95rem}
        @media(max-width:900px){.scams-layout{grid-template-columns:1fr}.scams-sidebar{position:static}}
      `}</style>
    </main>
  )
}