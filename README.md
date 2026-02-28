# IsItSafeToVisit.com

Travel safety guides for 46 cities worldwide. Built with Next.js.

## Quick Start

### 1. Install Node.js
Download from https://nodejs.org (LTS version). This also installs `npm`.

### 2. Install Dependencies
Open a terminal/command prompt in this folder and run:
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```
Then open http://localhost:3000 in your browser.

### 4. Build for Production
```bash
npm run build
```

## Deploy to Vercel (Free)

1. Create a **GitHub** account at github.com (if you don't have one)
2. Create a **Vercel** account at vercel.com (sign in with GitHub)
3. Push this folder to a new GitHub repository:
   - Install GitHub Desktop (easiest): https://desktop.github.com
   - Create new repo → add this folder → push
4. In Vercel: "Import Project" → select your GitHub repo → Deploy
5. Point your GoDaddy domain:
   - In Vercel: Settings → Domains → Add `isitsafetovisit.com`
   - In GoDaddy: DNS → Change nameservers to the ones Vercel provides

That's it! Vercel auto-deploys when you push changes to GitHub.

## Project Structure

```
src/
  app/
    page.tsx              → Homepage
    layout.tsx            → Root layout (meta, fonts)
    cities/
      page.tsx            → All cities index
      [slug]/page.tsx     → Individual city pages (auto-generated for all 46 cities)
  components/             → Reusable UI components
  lib/
    cities.ts             → Data access functions
    city-data.json        → All 46 cities data (279 KB)
  styles/
    globals.css           → Design system
```

## Adding a New City

Edit `src/lib/city-data.json` and add a new city object to the `cities` array following the existing format. The site will automatically generate a new page for it.

## Cities Included (46)

**South America:** Buenos Aires, Cartagena, Cusco, Medellín, Montevideo, Quito, Rio de Janeiro, Santiago, São Paulo
**Central America:** Cancún, Guatemala City, Havana, Panama City, Playa del Carmen, San José, San Juan, Santo Domingo
**North America:** Mexico City
**Southeast Asia:** Bali, Bangkok, Da Nang, Hanoi, Ho Chi Minh City, Kuala Lumpur, Manila, Phnom Penh, Siem Reap
**Africa:** Cairo, Cape Town, Dar es Salaam, Johannesburg, Marrakech, Nairobi
**Europe:** Athens, Barcelona, Bucharest, Istanbul, Marseille, Naples, Tbilisi
**Middle East:** Amman, Dubai
**South Asia:** Colombo, Delhi, Kathmandu, Mumbai
