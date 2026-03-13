import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'About IsItSafeToVisit.com \u2014 Our Mission & Methodology',
  description: 'Learn about IsItSafeToVisit.com, our safety scoring methodology, data sources, and mission to help travelers make informed decisions.',
};

export default function AboutPage() {
  const cities = getAllCities();
  const countries = new Set(cities.map(c => c.country)).size;
  const scams = cities.reduce((s, c) => s + (c.scams?.length || 0), 0);

  return (
    <>
      <Nav />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span> About
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>About IsItSafeToVisit</h1>
          <p className="page-hero-sub">Honest, research-backed travel safety information for {cities.length} cities across {countries} countries.</p>
        </div>
      </section>

      <div className="container">
        <div className="about-content">
          <section className="content-section">
            <h2>Our Mission</h2>
            <p>IsItSafeToVisit.com exists to give travelers the honest, detailed safety information they need before visiting a new city. We believe that informed travelers are safer travelers, and that accurate safety information should not be hidden behind generic advice like &ldquo;exercise normal precautions.&rdquo;</p>
            <p>Every city guide on our site includes real neighborhood breakdowns with safety scores, specific scam descriptions with avoidance tips, transport safety ratings, solo female travel assessments, night safety information, health advisories, and emergency contacts. We cover the details that matter to actual travelers making actual decisions.</p>
          </section>

          <section className="content-section">
            <h2>Our Safety Scoring Methodology</h2>
            <p>Each city is rated on a 1-10 scale across seven safety categories. These scores are researched individually for each city and reflect real-world conditions for tourists, not just residents.</p>
            <div className="about-scores-grid">
              <div className="about-score-item">
                <h4>Petty Crime</h4>
                <p>Pickpocketing, phone theft, bag snatching, and opportunistic theft targeting tourists.</p>
              </div>
              <div className="about-score-item">
                <h4>Violent Crime</h4>
                <p>Assault, robbery with violence, mugging, and the likelihood of physical danger to visitors.</p>
              </div>
              <div className="about-score-item">
                <h4>Scam Risk</h4>
                <p>Prevalence and sophistication of tourist-targeting scams, from taxi overcharging to elaborate fraud.</p>
              </div>
              <div className="about-score-item">
                <h4>Women&apos;s Safety</h4>
                <p>Street harassment levels, safety for solo female travelers, and gender-specific concerns.</p>
              </div>
              <div className="about-score-item">
                <h4>Night Safety</h4>
                <p>How safe the city is after dark, including nightlife districts, late-night transport, and street safety.</p>
              </div>
              <div className="about-score-item">
                <h4>Transport</h4>
                <p>Safety of taxis, rideshares, metro systems, buses, and other transit options available to tourists.</p>
              </div>
              <div className="about-score-item">
                <h4>Natural Hazards</h4>
                <p>Earthquake risk, extreme weather, flooding, air quality, and environmental safety considerations.</p>
              </div>
            </div>

            <h3>Safety Tiers</h3>
            <p>The overall safety score is the average of all seven categories, which determines the city&apos;s safety tier:</p>
            <div className="about-tiers">
              <div className="about-tier"><span className="text-safe">7.0 &ndash; 10.0</span> Generally Safe &mdash; Standard travel precautions are sufficient.</div>
              <div className="about-tier"><span className="text-caution">5.0 &ndash; 6.9</span> Moderate Caution &mdash; Extra awareness and precautions recommended.</div>
              <div className="about-tier"><span className="text-danger">Below 5.0</span> Exercise Caution &mdash; Significant safety concerns; research thoroughly before visiting.</div>
            </div>
          </section>

          <section className="content-section">
            <h2>Our Data Sources</h2>
            <p>City safety profiles are built from multiple authoritative sources including US State Department travel advisories, UK Foreign Commonwealth &amp; Development Office (FCDO) advice, local crime statistics, World Health Organization data, community reports from travelers, and local news monitoring. Safety profiles are updated regularly to reflect current conditions.</p>
          </section>

          <section className="content-section">
            <h2>By the Numbers</h2>
            <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
              <div className="stat-item"><div className="stat-number">{cities.length}</div><div className="stat-label">Cities Covered</div></div>
              <div className="stat-item"><div className="stat-number">{countries}</div><div className="stat-label">Countries</div></div>
              <div className="stat-item"><div className="stat-number">{scams}+</div><div className="stat-label">Scams Documented</div></div>
              <div className="stat-item"><div className="stat-number">{cities.reduce((s, c) => s + (c.neighborhoods?.length || 0), 0)}+</div><div className="stat-label">Neighborhoods Rated</div></div>
            </div>
          </section>

          <section className="content-section">
            <h2>Disclaimer</h2>
            <p>The safety information on IsItSafeToVisit.com is provided for general informational purposes only. While we strive for accuracy, safety conditions can change rapidly. Always check official government travel advisories before traveling and exercise your own judgment. We are not responsible for any incidents that may occur during your travels. Safety scores reflect our research-based assessment at the time of publication and may not capture every risk or recent development.</p>
          </section>

          <section className="content-section">
            <h2>Contact</h2>
            <p>Have a correction, suggestion, or question? We&apos;d love to hear from you. Reach out at <strong>hello@isitsafetovisit.com</strong>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
