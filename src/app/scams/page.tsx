import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'Travel Scams to Avoid — IsItSafeToVisit',
  description: 'The complete guide to travel scams worldwide. Learn how to spot and avoid the most common tourist scams, from fake taxi overcharges to distraction theft.',
};

const UNIVERSAL_SCAMS = [
  {
    name: 'Fake Taxi / Unlicensed Drivers',
    risk: 'high',
    description: 'Unofficial drivers approach arrivals at airports and train stations, quoting flat rates that end up being 5–10x the metered fare — or involve a detour. In some countries, unlicensed drivers have robbed passengers.',
    howToAvoid: 'Always use official taxi ranks or pre-book via the city official app (Grab, Bolt, Uber, etc.). Never accept rides from strangers who approach you first.',
  },
  {
    name: 'Gem / Art Investment Scam',
    risk: 'high',
    description: 'A friendly local invites you to a family shop or gallery where you are pressured into buying gems, artwork, or rugs at inflated prices with promises of resale profit. The items are worthless.',
    howToAvoid: 'Politely decline any unsolicited invitation to a shop. Legitimate businesses do not need strangers to recruit customers.',
  },
  {
    name: 'Friendship Bracelet / Rose Trick',
    risk: 'medium',
    description: 'A street vendor ties a bracelet on your wrist or hands you a flower, then demands payment. Refusing leads to aggressive confrontation or a scene designed to embarrass you.',
    howToAvoid: 'Keep your hands in your pockets near street vendors. Firmly say "No thank you" before anything touches you.',
  },
  {
    name: 'Distraction Theft',
    risk: 'high',
    description: 'One person creates a distraction (spills something on you, asks for directions, starts a loud argument nearby) while an accomplice picks your pocket or grabs your bag.',
    howToAvoid: 'Use a cross-body bag with zipper facing inward. Be especially alert when anyone unexpectedly touches you or creates commotion.',
  },
  {
    name: 'ATM Skimming & Shoulder Surfing',
    risk: 'medium',
    description: 'Card readers attached to ATMs capture your card data. Bystanders watch you enter your PIN. Both methods can drain your account.',
    howToAvoid: 'Use ATMs inside banks during business hours. Shield your PIN every time. Check for loose card reader attachments.',
  },
  {
    name: 'Fake Police Officers',
    risk: 'high',
    description: 'People posing as plainclothes officers ask to inspect your wallet or passport for counterfeit bills or drug residue. They pocket cash or disappear with your documents.',
    howToAvoid: 'Real police do not inspect your wallet on the street. If approached, ask to go to the nearest police station. Never hand over your wallet or passport.',
  },
  {
    name: 'Restaurant / Bar Menu Scam',
    risk: 'medium',
    description: 'A friendly local suggests a restaurant or bar. You are shown one menu but charged from a different, much more expensive one.',
    howToAvoid: 'Choose your own restaurants independently. Always confirm prices before ordering. Check the bill line-by-line.',
  },
  {
    name: 'Currency Exchange Sleight of Hand',
    risk: 'medium',
    description: 'A money changer gives you back fewer notes than agreed, or substitutes lower-denomination bills mid-count, banking on you not recounting.',
    howToAvoid: 'Count your money yourself before leaving the window. Use official exchange booths or bank ATMs instead of street changers.',
  },
  {
    name: 'Wi-Fi Honeypot',
    risk: 'medium',
    description: 'A malicious Wi-Fi hotspot named something plausible intercepts your traffic to steal banking credentials and passwords.',
    howToAvoid: 'Use a VPN whenever connecting to public Wi-Fi. Verify the network name with hotel staff before connecting.',
  },
  {
    name: 'Petition / Charity Clipboard',
    risk: 'low',
    description: 'Someone approaches with a clipboard asking you to sign a petition. While you are distracted, an accomplice picks your pocket, or you are pressured into a large donation.',
    howToAvoid: 'Decline clipboard approaches in tourist areas. Keep valuables secured before engaging with anyone.',
  },
];

function getRiskColor(risk: string) {
  if (risk === 'high') return 'danger';
  if (risk === 'medium') return 'caution';
  return 'safe';
}

export default function ScamsPage() {
  const raw = getAllCities();
  const cities = Array.isArray(raw) ? raw : [];

  const highScamRiskCities = [...cities]
    .filter((c) => c.scores?.scamRisk !== undefined)
    .sort((a, b) => (a.scores.scamRisk ?? 10) - (b.scores.scamRisk ?? 10))
    .slice(0, 8);

  return (
    <main className="scams-page">
      <div className="scams-hero">
        <div className="container">
          <h1>Travel Scams: The Complete Guide</h1>
          <p className="scams-subtitle">
            Know what to expect before you land. The most common tourist scams worldwide — and exactly how to avoid them.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="scams-layout">
          <div className="scams-main">
            <div className="scams-intro">
              <p>
                Tourist scams are a global industry. Whether you are in Bangkok, Barcelona, or Buenos Aires, experienced scammers target travelers who are unfamiliar with local prices, customs, and social norms. The good news: most scams are entirely avoidable once you know what to look for.
              </p>
              <p>
                Below are the {UNIVERSAL_SCAMS.length} most common scam types you will encounter worldwide, plus city-specific scam guides for every destination in our database.
              </p>
            </div>

            <h2>The Most Common Tourist Scams</h2>

            <div className="scams-list">
              {UNIVERSAL_SCAMS.map((scam, i) => (
                <div key={i} className="scam-card">
                  <div className="scam-header">
                    <h3 className="scam-name">{scam.name}</h3>
                    <span className={`scam-risk risk-${getRiskColor(scam.risk)}`}>
                      {scam.risk.charAt(0).toUpperCase() + scam.risk.slice(1)} Risk
                    </span>
                  </div>
                  <p className="scam-description">{scam.description}</p>
                  <div className="scam-avoid">
                    <strong>How to avoid:</strong> {scam.howToAvoid}
                  </div>
                </div>
              ))}
            </div>

            <section className="scams-tips-section">
              <h2>General Anti-Scam Rules</h2>
              <ul className="scams-tips-list">
                <li><strong>Research before you arrive.</strong> Know the typical taxi fare from the airport. Know what a meal should cost. Scams rely on ignorance of local prices.</li>
                <li><strong>Slow down.</strong> Scammers create urgency. Any situation where you feel rushed to decide is a red flag.</li>
                <li><strong>Trust your instincts.</strong> If a deal feels too good, it is. If someone is being unusually helpful, ask yourself why.</li>
                <li><strong>Keep copies of your documents.</strong> Email yourself scans of your passport, visa, and insurance card.</li>
                <li><strong>Use a VPN on public Wi-Fi.</strong> This one step protects your banking login from Wi-Fi honeypot attacks.</li>
                <li><strong>Secure your phone.</strong> Your phone is the most targeted item. Use a cross-body bag or keep it in a front pocket in crowded areas.</li>
                <li><strong>Pre-book airport transport.</strong> Arranging your ride before you land eliminates the most common arrival scam entirely.</li>
              </ul>
            </section>

            <div className="scam-vpn-cta">
              <div className="vpn-cta-content">
                <h3>🔒 Protect Yourself on Public Wi-Fi</h3>
                <p>Wi-Fi honeypots can steal banking credentials in seconds. A VPN encrypts all your traffic — essential for any international trip.</p>
                <a
                  href="https://go.nordvpn.net/aff_c?offer_id=15&aff_id=142230&url_id=902"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-nordvpn"
                >
                  Get NordVPN — Protect Your Connection
                </a>
              </div>
            </div>
          </div>

          <aside className="scams-sidebar">
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">⚠️ High Scam Risk Cities</h3>
              <p className="sidebar-widget-desc">Cities with the lowest scam safety scores in our database.</p>
              <div className="sidebar-city-list">
                {highScamRiskCities.map((city) => (
                  <Link key={city.slug} href={`/cities/${city.slug}`} className="sidebar-city-item">
                    <span className="sidebar-city-name">{city.name}, {city.country}</span>
                    <span className="sidebar-city-score score-danger">
                      {(city.scores.scamRisk ?? 0).toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="sidebar-widget affiliate-widget safetywing-widget">
              <h3>🛡️ Travel Insurance</h3>
              <p>Get covered before you go. SafetyWing covers medical emergencies, trip interruption, and more from just $1.87/day.</p>
              <a
                href="https://safetywing.com/?referenceID=26484939&utm_source=26484939&utm_medium=Ambassador"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-safetywing"
              >
                Get Covered with SafetyWing
              </a>
            </div>

            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">🌍 City-Specific Scam Guides</h3>
              <p className="sidebar-widget-desc">Every city page includes the specific scams that target tourists there.</p>
              <Link href="/cities" className="sidebar-browse-link">
                Browse All {cities.length} Cities →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
