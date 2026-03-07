import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About IsItSafeToVisit — Our Mission & Methodology',
  description: 'Learn how IsItSafeToVisit.com researches and scores city safety. Our methodology, data sources, and scoring system explained.',
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About IsItSafeToVisit</h1>
          <p className="about-subtitle">
            Honest, data-driven travel safety guides for every kind of traveler.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="about-content">

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              Every year, millions of travelers ask the same question before booking a trip: <em>&quot;Is it actually safe to go there?&quot;</em> The answers they find are often vague, outdated, or buried in State Department advisories written in bureaucratic language.
            </p>
            <p>
              IsItSafeToVisit was built to fix that. We provide city-level safety intelligence that is specific, current, and written for real travelers &mdash; not diplomats. We cover the neighborhoods you will actually visit, the scams that specifically target tourists, and the practical safety tips locals use every day.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Cover</h2>
            <p>
              Each city guide includes a comprehensive safety breakdown across seven key dimensions:
            </p>
            <div className="about-categories">
              <div className="about-category-item">
                <span className="about-category-icon">👜</span>
                <div>
                  <strong>Petty Crime</strong>
                  <p>Pickpocketing, bag snatching, phone theft, and opportunistic crime.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">⚠️</span>
                <div>
                  <strong>Violent Crime</strong>
                  <p>Muggings, robbery, assault, and physical safety risks for visitors.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">🎭</span>
                <div>
                  <strong>Scam Risk</strong>
                  <p>Tourist scams, overcharging, taxi fraud, and financial deceptions.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">👩</span>
                <div>
                  <strong>Women&apos;s Safety</strong>
                  <p>Solo female travel considerations, harassment levels, and safety culture.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">🌙</span>
                <div>
                  <strong>Night Safety</strong>
                  <p>After-dark conditions, nightlife areas, and late-night transport safety.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">🚌</span>
                <div>
                  <strong>Transport Safety</strong>
                  <p>Metro, bus, taxi, and rideshare safety and reliability.</p>
                </div>
              </div>
              <div className="about-category-item">
                <span className="about-category-icon">🌋</span>
                <div>
                  <strong>Natural Hazards</strong>
                  <p>Earthquakes, flooding, hurricanes, volcanic activity, and environmental risks.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Scoring System</h2>
            <p>
              Each category is scored on a <strong>1&ndash;10 scale</strong>, where <strong>10 is the safest possible</strong>. The overall city score is a weighted average across all seven categories. We use the following thresholds:
            </p>
            <div className="about-score-guide">
              <div className="about-score-item safe">
                <span className="about-score-range">7.0 &ndash; 10</span>
                <div>
                  <strong>Generally Safe</strong>
                  <p>Low risk for typical tourists. Standard vigilance applies.</p>
                </div>
              </div>
              <div className="about-score-item caution">
                <span className="about-score-range">5.0 &ndash; 6.9</span>
                <div>
                  <strong>Moderate Caution Advised</strong>
                  <p>Elevated risk in some areas or categories. Research your specific itinerary.</p>
                </div>
              </div>
              <div className="about-score-item danger">
                <span className="about-score-range">0 &ndash; 4.9</span>
                <div>
                  <strong>Exercise Caution</strong>
                  <p>Significant safety concerns. Travel with thorough preparation and awareness.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Data Sources</h2>
            <p>
              Our city safety profiles are built from a combination of authoritative sources, including:
            </p>
            <ul className="about-sources-list">
              <li>U.S. Department of State Travel Advisories</li>
              <li>UK Foreign, Commonwealth &amp; Development Office (FCDO) travel guidance</li>
              <li>Australian Department of Foreign Affairs and Trade (DFAT) advisories</li>
              <li>Numbeo Crime Index and city-level safety statistics</li>
              <li>Local law enforcement crime statistics (where publicly available)</li>
              <li>Expat community forums and long-term resident reports</li>
              <li>Travel community feedback (TripAdvisor, Reddit r/travel, Lonely Planet Thorn Tree)</li>
              <li>Recent news reports and incident coverage</li>
            </ul>
            <p>
              Data is synthesized using AI-assisted research and human editorial review. All profiles are time-stamped and refreshed regularly to reflect current conditions.
            </p>
          </section>

          <section className="about-section">
            <h2>Important Limitations</h2>
            <p>
              No safety guide is a substitute for your own judgment. Safety conditions change &mdash; sometimes rapidly. Political unrest, natural disasters, and local events can shift a city&apos;s risk profile overnight.
            </p>
            <p>
              Always cross-reference our guides with your government&apos;s official travel advisory before departing, and purchase comprehensive travel insurance for any international trip.
            </p>
            <div className="about-disclaimer">
              <strong>Disclaimer:</strong> IsItSafeToVisit.com provides general travel safety information for educational purposes only. We are not responsible for any decisions made based on this information. Always consult official government advisories and use your own judgment when traveling.
            </div>
          </section>

          <section className="about-section">
            <h2>Contact &amp; Feedback</h2>
            <p>
              Have information about a city we&apos;ve gotten wrong? Know of a safety situation we should flag? We want to hear from you.
            </p>
            <p>
              Reach us at: <strong>hello@isitsafetovisit.com</strong>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
