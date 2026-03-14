// fetch-city-images.js
// Fetches Wikipedia main image for each city and adds imageUrl to city-data.json
// Run: node fetch-city-images.js
// Safe to re-run — skips cities that already have an imageUrl

const fs = require('fs');
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'IsItSafeToVisit/1.0 (hello@isitsafetovisit.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function getWikipediaImage(cityName, country) {
  // Try "CityName, Country" first, then just "CityName"
  const queries = [`${cityName}, ${country}`, cityName];
  
  for (const query of queries) {
    try {
      // Step 1: Search for the Wikipedia page
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=1200&redirects=1`;
      const searchData = await fetchJSON(searchUrl);
      
      const pages = searchData?.query?.pages;
      if (!pages) continue;
      
      const page = Object.values(pages)[0];
      if (page && page.thumbnail && page.thumbnail.source) {
        // Verify it's a decent size image
        if (page.thumbnail.width >= 400) {
          return page.thumbnail.source;
        }
      }
    } catch (e) {
      // Try next query
    }
  }
  
  return null;
}

async function main() {
  const dataPath = 'src/lib/city-data.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log(`Processing ${data.cities.length} cities...\n`);
  
  for (let i = 0; i < data.cities.length; i++) {
    const city = data.cities[i];
    
    // Skip if already has image
    if (city.imageUrl) {
      skipped++;
      continue;
    }
    
    process.stdout.write(`[${i + 1}/${data.cities.length}] ${city.name}, ${city.country}... `);
    
    const imageUrl = await getWikipediaImage(city.name, city.country);
    
    if (imageUrl) {
      city.imageUrl = imageUrl;
      updated++;
      console.log('OK');
    } else {
      failed++;
      console.log('NO IMAGE');
    }
    
    // Rate limit: 200ms between requests
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Save
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, No image: ${failed}`);
  console.log(`Total cities with images: ${data.cities.filter(c => c.imageUrl).length}/${data.cities.length}`);
}

main().catch(console.error);
