// install-city-images.js
// Master script: updates template, type, agent, CSS, then fetches images
// Run: node install-city-images.js

const fs = require('fs');
const { execSync } = require('child_process');

console.log('=== City Page Images Install ===\n');

// 1. Update city page template
console.log('Step 1: Updating city page template...');
execSync('node add-city-hero-image.js', { stdio: 'inherit' });

// 2. Update agent
console.log('\nStep 2: Updating agent with image fetching...');
execSync('node update-agent-images.js', { stdio: 'inherit' });

// 3. Append CSS
console.log('\nStep 3: Adding CSS...');
const css = fs.readFileSync('city-hero-image.css', 'utf-8');
fs.appendFileSync('src/styles/globals.css', '\n' + css);
console.log('CSS appended');

// 4. Fetch images for all existing cities
console.log('\nStep 4: Fetching Wikipedia images for all cities...');
console.log('This may take a few minutes...\n');
execSync('node fetch-city-images.js', { stdio: 'inherit' });

console.log('\n=== Done! Run: git add . && git commit -m "Add hero images to city pages" && git push ===');
