const fs = require('fs');

// Known good Unsplash photo IDs for featured cities
const FEATURED_IMAGES = {
  'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&h=400&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&h=400&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&h=400&q=80',
  'medellin': 'https://images.unsplash.com/photo-1599493758267-c6c884862ed4?auto=format&fit=crop&w=800&h=400&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&h=400&q=80',
  'dubrovnik': 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&h=400&q=80',
};

// Update the homepage to use hardcoded image URLs
let page = fs.readFileSync('src/app/page.tsx', 'utf-8');

// Replace the getCityImage function with one that uses real URLs
const oldFn = `function getCityImage(cityName: string, country: string): string {
  const query = encodeURIComponent(\`\${cityName} \${country} city skyline\`);
  return \`https://source.unsplash.com/800x400/?\${query}\`;
}`;

const newFn = `// Curated Unsplash photos for featured cities
const CITY_IMAGES: Record<string, string> = {
  'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&h=400&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&h=400&q=80',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&h=400&q=80',
  'medellin': 'https://images.unsplash.com/photo-1599493758267-c6c884862ed4?auto=format&fit=crop&w=800&h=400&q=80',
  'cape-town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&h=400&q=80',
  'dubrovnik': 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&h=400&q=80',
};

function getCityImage(slug: string): string {
  return CITY_IMAGES[slug] || '';
}`;

page = page.replace(oldFn, newFn);

// Update CityCard to use slug-based image lookup and hide if no image
const oldCard = `      <div className="city-card-image" style={{
        backgroundImage: \`url(\${getCityImage(city.name, city.country)})\`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '160px',
        borderRadius: '12px 12px 0 0',
      }} />`;

const newCard = `      {getCityImage(city.slug) && (
        <div className="city-card-image" style={{
          backgroundImage: \`url(\${getCityImage(city.slug)})\`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '160px',
          borderRadius: '12px 12px 0 0',
        }} />
      )}`;

page = page.replace(oldCard, newCard);

fs.writeFileSync('src/app/page.tsx', page, 'utf-8');
console.log('Homepage updated with real Unsplash images for featured cities');
