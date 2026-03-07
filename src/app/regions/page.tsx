import type { Metadata } from 'next'
import cityData from '@/data/city-data.json'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Travel Safety by Region — IsItSafeToVisit.com',
  description: 'Browse travel safety guides by world region. Safety ratings for cities in Europe, Asia, Latin America, Africa, the Middle East, and more.',
}

interface City {
  slug: string
  name: string
  country: string
  region: string
  overallScore: number
}

const REGION_META: Record<string, { emoji: string; description: string }> = {
  'Europe': { emoji: '🏰', description: 'From Western European capitals to emerging Eastern European gems — safety intel for the continent.' },
  'Asia': { emoji: '🏯', description: 'Southeast Asia, East Asia, South Asia and beyond — comprehensive guides across the world largest continent.' },
  'Latin America': { emoji: '🌎', description: 'Mexico, Central America, South America, and the Caribbean — honest safety assessments for one of the most popular travel regions.' },
  'North America': { emoji: '🗽', description: 'United States, Canada, and Mexico — city-level safety guides for destinations across the continent.' },
  'Middle East': { emoji: '🕌', description: 'Safety guides for cities across the Arabian Peninsula, Levant, and broader Middle East region.' },
  'Africa': { emoji: '🦁', description: 'From North African medinas to Southern African safari capitals — safety intelligence across a diverse continent.' },
  'Oceania': { emoji: '🦘', description: 'Australia, New Zealand, and Pacific island destinations — guides for the world most remote region.' },
  'Caribbean': { emoji: '🌴', description: 'Island-by-island safety breakdowns for the Caribbean most visited destinations.' },
}

function getScoreColor(score: number): string {
  if (score >= 7.5) return 'var(--safe-green)'
  if (score >= 5.0) return 'var(--caution-amber)'
  return 'var(--danger-red)'
}

export default function RegionsPage() {
  const cities = cityData as City[]
  const regionMap: Record<string, City[]> = {}
  for (const city of cities) {
    const region = city.region || 'Other'
    if (!regionMap[region]) regionMap[region] = []
    regionMap[region].push(city)
  }
  const sortedRegions = Object.entries(regionMap).sort((a, b) => b[1].length - a[1].length)

  return (
    <main className="regions-page">
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb"><a href="/">Home</a><span>›</span><span>Regions</span></div>
          <h1>Travel Safety by Region</h1>
          <p className="hero-subtitle">Browse safety guides for <strong>{cities.length}+ cities</strong> across {sortedRegions.length} world regions.</p>
        </div>
      </div>
      <div className="container page-content">
        <div className="regions-grid">
          {sortedRegions.map(([region, regionCities]) => {
            const meta = REGION_META[region] || { emoji: '🌐', description: `Travel safety guides for cities in ${region}.` }
            const topCities = [...regionCities].sort((a, b) => b.overallScore - a.overallScore).slice(0, 6)
            return (
              <section key={region} className="region-card">
                <div className="region-header">
                  <div className="region-title-row">
                    <span className="region-emoji">{meta.emoji}</span>
                    <div><h2>{region}</h2><span className="region-count">{regionCities.length} {regionCities.length === 1 ? 'city' : 'cities'}</span></div>
                  </div>
                  <p className="region-description">{meta.description}</p>
                </div>
                <div className="region-cities">
                  {topCities.map((city) => (
                    <Link key={city.slug} href={`/cities/${city.slug}`} className="region-city-link">
                      <span className="city-name">{city.name}</span>
                      <span className="city-country">{city.country}</span>
                      <span className="city-score" style={{ color: getScoreColor(city.overallScore) }}>{city.overallScore.toFixed(1)}</span>
                    </Link>
                  ))}
                </div>
                {regionCities.length > 6 && (
                  <div className="region-more"><span className="see-all-note">+ {regionCities.length - 6} more cities in {region}</span></div>
                )}
              </section>
            )
          })}
        </div>
      </div>
      <style>{`
        .regions-page{background:var(--paper);min-height:100vh}
        .page-hero{background:var(--ink);padding:3rem 0 2.5rem;border-bottom:3px solid var(--accent)}
        .page-hero h1{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(2rem,4vw,3rem);color:var(--paper);margin:.5rem 0 1rem;line-height:1.15}
        .hero-subtitle{font-size:1.1rem;color:#aaa;margin:0}
        .hero-subtitle strong{color:var(--paper)}
        .breadcrumb{font-size:.85rem;color:#888;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem}
        .breadcrumb a{color:#aaa;text-decoration:none}
        .breadcrumb a:hover{color:var(--accent-light)}
        .page-content{padding-top:3rem;padding-bottom:4rem}
        .regions-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:2rem}
        .region-card{background:white;border:1px solid var(--border);border-radius:10px;overflow:hidden}
        .region-header{padding:1.5rem 1.5rem 1.25rem;border-bottom:1px solid var(--border);background:var(--paper-warm)}
        .region-title-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.6rem}
        .region-emoji{font-size:2rem;line-height:1}
        .region-title-row h2{font-family:'DM Serif Display',Georgia,serif;font-size:1.4rem;color:var(--ink);margin:0 0 .15rem}
        .region-count{font-family:'JetBrains Mono',monospace;font-size:.8rem;color:var(--ink-muted);font-weight:600}
        .region-description{font-size:.9rem;color:var(--ink-muted);margin:0;line-height:1.55}
        .region-cities{padding:.5rem 0}
        .region-city-link{display:flex;align-items:center;padding:.7rem 1.5rem;text-decoration:none;border-bottom:1px solid var(--border);transition:background .15s;gap:.5rem}
        .region-city-link:last-child{border-bottom:none}
        .region-city-link:hover{background:var(--paper-warm)}
        .city-name{font-weight:600;color:var(--ink);font-size:.95rem;flex:1}
        .city-country{font-size:.85rem;color:var(--ink-muted)}
        .city-score{font-family:'JetBrains Mono',monospace;font-size:.85rem;font-weight:700}
        .region-more{padding:.85rem 1.5rem;border-top:1px solid var(--border);background:var(--paper-warm)}
        .see-all-note{font-size:.85rem;color:var(--ink-muted)}
        @media(max-width:640px){.regions-grid{grid-template-columns:1fr}}
      `}</style>
    </main>
  )
}