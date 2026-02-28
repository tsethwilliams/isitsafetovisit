import cityData from './city-data.json';

export interface CityScores {
  pettyCrime: number;
  violentCrime: number;
  scamRisk: number;
  womensSafety: number;
  nightSafety: number;
  transport: number;
  naturalHazards: number;
}

export interface Neighborhood {
  name: string;
  score: number;
  class: 'safe' | 'caution' | 'danger';
  description: string;
}

export interface Scam {
  name: string;
  risk: 'high' | 'medium' | 'low';
  description: string;
  howToAvoid: string;
}

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  regionSlug: string;
  lastUpdated: string;
  overallScore: number;
  verdict: string;
  badgeLabel: string;
  badgeClass: 'safe' | 'caution' | 'danger';
  scores: CityScores;
  summary: string;
  quickVerdict: string;
  neighborhoods: Neighborhood[];
  scams: Scam[];
  soloFemale: { overview: string; tips: string[] };
  nightSafety: { overview: string; tips: string[] };
  transport: { metro: string; rideshare: string; taxis: string; tips: string };
  customs: string[];
  health: { overview: string; water: string; vaccinations: string; altitude: string };
  emergency: {
    general: string; police: string; ambulance: string;
    fire: string; touristPolice: string; usEmbassy: string;
  };
  faq: { q: string; a: string }[];
  relatedCities: string[];
}

const data = cityData as { metadata: any; cities: City[] };

export function getAllCities(): City[] {
  return data.cities;
}

export function getCityBySlug(slug: string): City | undefined {
  return data.cities.find(c => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return data.cities.map(c => c.slug);
}

export function getCitiesByRegion(regionSlug: string): City[] {
  return data.cities.filter(c => c.regionSlug === regionSlug);
}

export function getRelatedCities(city: City): City[] {
  return city.relatedCities
    .map(slug => getCityBySlug(slug))
    .filter((c): c is City => c !== undefined);
}

export function getScoreColor(score: number): string {
  if (score >= 7) return 'safe';
  if (score >= 5) return 'caution';
  return 'danger';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}
