const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'app', 'regions', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add dynamic import at top
const mapImports = `import dynamic from 'next/dynamic';
const RegionsMap = dynamic(() => import('@/components/RegionsMap'), { ssr: false });
`;

// Add before first import
content = content.replace("import { Metadata }", mapImports + "import { Metadata }");

// Add map section before the regions-page-grid
const mapSection = `
      <section style={{marginBottom:'2.5rem'}}>
        <RegionsMap cities={cities.map(c=>({slug:c.slug,name:c.name,country:c.country,region:c.region,overallScore:c.overallScore}))} />
      </section>

      <h2 style={{fontFamily:'DM Serif Display, serif',fontSize:'1.8rem',marginBottom:'1.5rem'}}>All Regions</h2>
`;

content = content.replace(
  '<div className="regions-page-grid">',
  mapSection + '<div className="regions-page-grid">'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Map added to regions page successfully');
