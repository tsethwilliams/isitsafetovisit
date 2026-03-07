import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCities } from '@/lib/cities';

export const metadata: Metadata = {
  title: 'Travel Safety by Country — IsItSafeToVisit',
  description: 'Browse travel safety guides by country. Find overall safety scores, safest cities, common scams, and essential tips for every destination.',
};

function toSlug(country: string) {
  return country.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getScoreClass(score: number) {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

type CityData = {
  slug: string; name: string; country: string; region: string;
  overallScore: number; badgeLabel?: string;
};

export default function CountriesPage() {
  const raw = getAllCities();
  const cities: CityData[] = Array.isArray(raw) ? raw : [];

  // Build country map
  const countryMap: Record<string, CityData[]> = {};
  for (const city of cities) {
    if (!city.country) continue;
    if (!countryMap[city.country]) countryMap[city.country] = [];
    countryMap[city.country].push(city);
  }

  // Sort countries by city count desc, then alphabetically
  const countries = Object.entries(countryMap).sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return a[0].localeCompare(b[0]);
  });

  // Group by region
  const regionMap: Record<string, typeof countries> = {};
  for (const entry of countries) {
    const region = entry[1][0]?.region || 'Other';
    if (!regionMap[region]) regionMap[region] = [];
    regionMap[region].push(entry);
  }

  const regionOrder = ['Europe','Asia','North America','South America',
    'Central America & Caribbean','Africa','Middle East','Oceania'];

  return (
    <main className="countries-index-page">
      <div className="countries-hero">
        <div className="container">
          <h1>Travel Safety by Country</h1>
          <p className="countries-subtitle">
            {countries.length} countries · {cities.length} cities tracked
          </p>
        </div>
      </div>

      <div className="container">
        {regionOrder.map(region => {
          const regionCountries = regionMap[region];
          if (!regionCountries?.length) return null;
          return (
            <div key={region} className="countries-region-section">
              <h2 className="countries-region-heading">{region}</h2>
              <div className="countries-grid">
                {regionCountries.map(([country, cCities]) => {
                  const avg = cCities.reduce((s, c) => s + c.overallScore, 0) / cCities.length;
                  const slug = toSlug(country);
                  return (
                    <Link key={country} href={`/countries/${slug}`} className="country-card">
                      <div className="country-card-name">{country}</div>
                      <div className={`country-card-score score-${getScoreClass(avg)}`}>
                        {avg.toFixed(1)}<span className="country-card-denom">/10</span>
                      </div>
                      <div className="country-card-cities">{cCities.length} {cCities.length === 1 ? 'city' : 'cities'}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
