// add-city-hero-image.js
// Updates the city page template to display a hero image if available
// Run: node add-city-hero-image.js

const fs = require('fs');
const filePath = 'src/app/cities/[slug]/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Add imageUrl to the City type check — it's already in the imported type
// Just need to add the hero image display

// Find the city-hero section and add image above it
const oldHero = `<section className="city-hero">`;
const newHero = `{city.imageUrl && (
        <div className="city-hero-image" style={{
          backgroundImage: \`linear-gradient(to bottom, rgba(0,0,0,0), rgba(250,249,246,1)), url(\${city.imageUrl})\`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '280px',
          marginTop: '-1rem',
        }} />
      )}

      <section className="city-hero">`;

content = content.replace(oldHero, newHero);

// Add imageUrl to the City type in cities.ts
const citiesPath = 'src/lib/cities.ts';
let citiesTs = fs.readFileSync(citiesPath, 'utf-8');

if (!citiesTs.includes('imageUrl')) {
  citiesTs = citiesTs.replace(
    'relatedCities: string[];',
    'relatedCities: string[];\n  imageUrl?: string;'
  );
  fs.writeFileSync(citiesPath, citiesTs, 'utf-8');
  console.log('Added imageUrl to City type in cities.ts');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Updated city page template with hero image support');
