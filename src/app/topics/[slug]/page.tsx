import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getAllCities, getScoreColor, type City } from '@/lib/cities';

const TOPICS: Record<string, { title: string; description: string; metaDesc: string }> = {
  'scams': {
    title: 'Common Travel Scams by City',
    description: 'A comprehensive guide to tourist scams in cities worldwide. Know the tricks before you travel so you never fall for them.',
    metaDesc: 'City-by-city guide to common tourist scams worldwide. Learn the tricks, how they work, and how to avoid them in every destination.',
  },
  'neighborhoods': {
    title: 'Safe Neighborhoods by City',
    description: 'Know which neighborhoods are safe for tourists and which areas to avoid. Real safety ratings for districts in every city we cover.',
    metaDesc: 'Neighborhood safety breakdown for cities worldwide. Find out which areas are safe to stay, walk, and explore in every destination.',
  },
  'solo-female': {
    title: 'Solo Female Travel Safety',
    description: 'Honest safety assessments for women traveling alone. City-by-city tips, safe areas, and what to expect as a solo female traveler.',
    metaDesc: 'Solo female travel safety guides for cities worldwide. Honest assessments, practical tips, and safe area recommendations.',
  },
  'customs': {
    title: 'Local Customs & Etiquette',
    description: 'Avoid cultural faux pas with our city-by-city guide to local customs, dress codes, tipping norms, and social etiquette.',
    metaDesc: 'Local customs and etiquette guide for travelers. Dress codes, tipping norms, greetings, and cultural tips for every city.',
  },
  'night-safety': {
    title: 'Night Safety by City',
    description: 'Is it safe to go out at night? City-by-city nightlife safety guides covering safe areas, late-night transport, and after-dark tips.',
    metaDesc: 'Nighttime safety guides for cities worldwide. Safe nightlife areas, late-night transport options, and after-dark travel tips.',
  },
  'transport': {
    title: 'Transport Safety by City',
    description: 'Taxis, rideshares, metro systems, and more. Know which transport options are safe and which to avoid in every city.',
    metaDesc: 'Transport safety guides for cities worldwide. Metro, taxi, rideshare, and public transit safety ratings and tips.',
  },
  'health': {
    title: 'Health & Medical Safety',
    description: 'Water safety, vaccination requirements, healthcare quality, and health risks by city. Know before you go.',
    metaDesc: 'Health and medical safety guides for travelers. Water safety, vaccinations, hospitals, and health risks by city.',
  },
  'digital-safety': {
    title: 'Digital Safety for Travelers',
    description: 'Protect your devices and data while traveling. WiFi security, phone theft prevention, and VPN recommendations by city.',
    metaDesc: 'Digital safety tips for travelers. WiFi security, phone theft prevention, SIM card advice, and VPN recommendations.',
  },
};

const TOPIC_SLUGS = Object.keys(TOPICS);

export function generateStaticParams() {
  return TOPIC_SLUGS.map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const topic = TOPICS[params.slug];
  if (!topic) return { title: 'Topic Not Found' };
  return {
    title: `${topic.title} \u2014 IsItSafeToVisit.com`,
    description: topic.metaDesc,
  };
}

function getTopicContent(slug: string, city: City): { items: string[]; score?: number } {
  switch (slug) {
    case 'scams':
      return { items: city.scams?.map(s => `${s.name} (${s.risk} risk): ${s.description}`) || [], score: city.scores?.scamRisk };
    case 'neighborhoods':
      return { items: city.neighborhoods?.map(n => `${n.name} \u2014 ${n.score}/10: ${n.description}`) || [] };
    case 'solo-female':
      return { items: [city.soloFemale?.overview, ...(city.soloFemale?.tips || [])].filter(Boolean) as string[], score: city.scores?.womensSafety };
    case 'customs':
      return { items: city.customs || [] };
    case 'night-safety':
      return { items: [city.nightSafety?.overview, ...(city.nightSafety?.tips || [])].filter(Boolean) as string[], score: city.scores?.nightSafety };
    case 'transport':
      return { items: [city.transport?.metro, city.transport?.rideshare, city.transport?.taxis, city.transport?.tips].filter(Boolean) as string[], score: city.scores?.transport };
    case 'health':
      return { items: [city.health?.overview, city.health?.water, city.health?.vaccinations, city.health?.altitude].filter(Boolean) as string[] };
    case 'digital-safety':
      return { items: ['Use a VPN on public WiFi networks.', 'Keep your phone secure and backed up.', 'Be cautious with ATMs and card readers.'] };
    default:
      return { items: [] };
  }
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const topic = TOPICS[params.slug];
  if (!topic) return <div>Topic not found</div>;

  const cities = getAllCities();
  const citiesWithContent = cities
    .map(city => {
      const content = getTopicContent(params.slug, city);
      return { city, content };
    })
    .filter(({ content }) => content.items.length > 0)
    .sort((a, b) => (b.content.score || b.city.overallScore) - (a.content.score || a.city.overallScore));

  return (
    <>
      <Nav />
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Home</Link> <span className="sep">{'\u203A'}</span>
          Topics <span className="sep">{'\u203A'}</span>
          {topic.title}
        </div>
      </div>

      <section className="page-hero">
        <div className="container">
          <h1>{topic.title}</h1>
          <p className="page-hero-sub">{topic.description}</p>
          <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem' }}>{citiesWithContent.length} cities covered</p>
        </div>
      </section>

      <div className="container">
        <div className="topic-city-list">
          {citiesWithContent.slice(0, 50).map(({ city, content }) => (
            <div key={city.slug} className="topic-city-card">
              <div className="topic-city-header">
                <Link href={`/cities/${city.slug}`}>
                  <h3>{city.name}, {city.country}</h3>
                </Link>
                {content.score && (
                  <span className={`topic-score text-${getScoreColor(content.score)}`}>{content.score.toFixed(1)}/10</span>
                )}
              </div>
              <div className="topic-city-content">
                {content.items.slice(0, 3).map((item, i) => (
                  <p key={i}>{item.length > 200 ? item.slice(0, 200) + '...' : item}</p>
                ))}
              </div>
              <Link href={`/cities/${city.slug}`} className="topic-city-readmore">Full {city.name} safety guide {'\u2192'}</Link>
            </div>
          ))}
        </div>

        {citiesWithContent.length > 50 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-muted)' }}>
            Showing 50 of {citiesWithContent.length} cities. <Link href="/cities">Browse all cities {'\u2192'}</Link>
          </p>
        )}
      </div>
      <Footer />
    </>
  );
}
