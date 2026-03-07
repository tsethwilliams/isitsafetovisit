import type { Metadata } from 'next';
import { getAllCities } from '@/lib/cities';
import RegionsMap from '@/components/RegionsMap';

export const metadata: Metadata = {
  title: 'World Safety Map by Region — IsItSafeToVisit',
  description: 'Interactive world safety map. Click any region to explore safety scores, top cities, scam patterns, and travel tips for Europe, Asia, Latin America, Africa, and more.',
};

export default function RegionsPage() {
  const raw = getAllCities();
  const cities = Array.isArray(raw) ? raw : [];
  return (
    <main className="regions-page">
      <div className="regions-hero">
        <div className="container">
          <h1>World Safety Map</h1>
          <p className="regions-subtitle">
            Click any region to explore safety scores, top destinations, and what to watch out for.
          </p>
        </div>
      </div>
      <div className="container">
        <RegionsMap cities={cities} />
      </div>
    </main>
  );
}
