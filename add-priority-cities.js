const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/lib/city-data.json', 'utf-8'));
const q = JSON.parse(fs.readFileSync('data/city_queue.json', 'utf-8'));
const have = new Set(d.cities.map(c => c.name.toLowerCase()));

// Also check queue
q.forEach(c => {
  const name = (c.name || '').toLowerCase();
  if (name) have.add(name);
});

const priorityCities = [
  // Missing top 5 global
  {name:"Mecca",country:"Saudi Arabia",region:"Middle East"},
  {name:"Pattaya",country:"Thailand",region:"Southeast Asia"},
  {name:"Cancún",country:"Mexico",region:"Central America & Caribbean"},
  {name:"Bogotá",country:"Colombia",region:"South America"},
  {name:"São Paulo",country:"Brazil",region:"South America"},

  // Missing US cities - high search volume
  {name:"Jacksonville",country:"United States",region:"North America"},
  {name:"Fort Worth",country:"United States",region:"North America"},
  {name:"Oklahoma City",country:"United States",region:"North America"},
  {name:"Louisville",country:"United States",region:"North America"},
  {name:"Milwaukee",country:"United States",region:"North America"},
  {name:"Albuquerque",country:"United States",region:"North America"},
  {name:"Sacramento",country:"United States",region:"North America"},
  {name:"Raleigh",country:"United States",region:"North America"},
  {name:"Virginia Beach",country:"United States",region:"North America"},
  {name:"Long Beach",country:"United States",region:"North America"},
  {name:"Colorado Springs",country:"United States",region:"North America"},
  {name:"Omaha",country:"United States",region:"North America"},
  {name:"Cincinnati",country:"United States",region:"North America"},
  {name:"St. Louis",country:"United States",region:"North America"},
  {name:"Boise",country:"United States",region:"North America"},

  // US tourist destinations - high search volume for safety
  {name:"Myrtle Beach",country:"United States",region:"North America"},
  {name:"Palm Springs",country:"United States",region:"North America"},
  {name:"Lake Tahoe",country:"United States",region:"North America"},
  {name:"Hilton Head",country:"United States",region:"North America"},
  {name:"Cape Cod",country:"United States",region:"North America"},
  {name:"Scottsdale",country:"United States",region:"North America"},
  {name:"Park City",country:"United States",region:"North America"},
  {name:"Aspen",country:"United States",region:"North America"},

  // Additional high-search-volume global cities not yet covered
  {name:"Zanzibar City",country:"Tanzania",region:"Africa"},
  {name:"Muscat",country:"Oman",region:"Middle East"},
  {name:"Bruges",country:"Belgium",region:"Europe"},
  {name:"Dubrovnik",country:"Croatia",region:"Europe"},
  {name:"Sorrento",country:"Italy",region:"Europe"},
  {name:"Cinque Terre",country:"Italy",region:"Europe"},
  {name:"Queenstown",country:"New Zealand",region:"Oceania"},
  {name:"Fiji",country:"Fiji",region:"Oceania"},
];

let added = 0;
let skipped = 0;
const toAdd = [];

priorityCities.forEach(c => {
  if (!have.has(c.name.toLowerCase())) {
    toAdd.push(c);
    have.add(c.name.toLowerCase());
    added++;
  } else {
    skipped++;
  }
});

// Add to FRONT of queue
const newQueue = [...toAdd, ...q];
fs.writeFileSync('data/city_queue.json', JSON.stringify(newQueue, null, 2), 'utf-8');

console.log(`Added ${added} priority cities to front of queue (${skipped} already exist)`);
console.log(`Queue size: ${newQueue.length}`);
toAdd.forEach(c => console.log('  +', c.name, c.country));
