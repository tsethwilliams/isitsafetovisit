const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/lib/city-data.json', 'utf-8'));
const have = new Set(d.cities.map(c => c.name.toLowerCase()));

const topGlobal = [
  'London','Paris','Bangkok','Dubai','Singapore','Kuala Lumpur','New York City','Istanbul','Tokyo',
  'Antalya','Seoul','Osaka','Mecca','Phuket','Pattaya','Milan','Barcelona','Palma de Mallorca','Bali',
  'Hong Kong','Amsterdam','Munich','Prague','Rome','Berlin','Vienna','Taipei','Lisbon','Athens','Miami',
  'Dublin','Cancun','Marrakech','Toronto','Sydney','Melbourne','Rio de Janeiro','Buenos Aires',
  'Cape Town','Cairo','Havana','Lima','Cusco','Cartagena','Mexico City','Bogota','Santiago','Sao Paulo',
  'Zurich','Budapest','Stockholm','Copenhagen','Edinburgh','Florence','Venice','Dubrovnik','Santorini',
  'Mykonos','Nice','Porto','Seville','Granada','Krakow','Reykjavik','Helsinki','Oslo','Kyoto','Hanoi',
  'Ho Chi Minh City','Chiang Mai','Phnom Penh','Siem Reap','Luang Prabang','Delhi','Mumbai','Jaipur',
  'Goa','Colombo','Kathmandu','Jerusalem','Tel Aviv','Amman','Petra','Doha','Abu Dhabi','Nairobi',
  'Johannesburg','Accra','Lagos','Casablanca'
];

const missingGlobal = topGlobal.filter(c => !have.has(c.toLowerCase()));
console.log('Missing top global destinations:', missingGlobal.length);
missingGlobal.forEach(c => console.log('  ', c));

const topUS = [
  'Jacksonville','Fort Worth','Oklahoma City','Louisville','Milwaukee','Albuquerque',
  'Fresno','Sacramento','Mesa','Omaha','Colorado Springs','Raleigh','Virginia Beach','Long Beach',
  'St. Louis','Cincinnati','Newark','Scottsdale','Boise','Palm Springs','Aspen','Park City',
  'Martha\'s Vineyard','Nantucket','Cape Cod','Myrtle Beach','Hilton Head','Lake Tahoe',
  'Yellowstone','Grand Canyon','Yosemite','Zion','Glacier National Park'
];

// Build priority queue: missing high-value cities first
const priorityQueue = [];

missingGlobal.forEach(c => {
  let country = 'Unknown';
  // Basic mapping for known cities
  const map = {
    'Mecca':'Saudi Arabia','Pattaya':'Thailand','Cancun':'Mexico','Delhi':'India',
    'Colombo':'Sri Lanka'
  };
  country = map[c] || country;
  priorityQueue.push({ name: c, country, region: 'Unknown', priority: 'high' });
});

topUS.forEach(c => {
  if (!have.has(c.toLowerCase())) {
    priorityQueue.push({ name: c, country: 'United States', region: 'North America', priority: 'medium' });
  }
});

console.log('\n--- Priority additions needed:', priorityQueue.length);
console.log('High priority (top global):', priorityQueue.filter(c => c.priority === 'high').length);
console.log('Medium priority (US cities):', priorityQueue.filter(c => c.priority === 'medium').length);
