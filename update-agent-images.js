// update-agent-images.js
// Adds Wikipedia image fetching to the agent's sanitize_city_data function
// Run: node update-agent-images.js

const fs = require('fs');
let agent = fs.readFileSync('agent.py', 'utf-8');

// Add a Python function to fetch Wikipedia images
const imageFetchCode = `
def fetch_wikipedia_image(city_name: str, country: str) -> str:
    """Fetch the main Wikipedia image for a city."""
    import urllib.request
    import urllib.parse
    
    queries = [f"{city_name}, {country}", city_name]
    for query in queries:
        try:
            encoded = urllib.parse.quote(query)
            url = f"https://en.wikipedia.org/w/api.php?action=query&titles={encoded}&prop=pageimages&format=json&pithumbsize=1200&redirects=1"
            req = urllib.request.Request(url, headers={"User-Agent": "IsItSafeToVisit/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                thumb = page.get("thumbnail", {})
                if thumb.get("source") and thumb.get("width", 0) >= 400:
                    return thumb["source"]
        except Exception:
            continue
    return ""

`;

// Insert before the sanitize_city_data function
if (!agent.includes('fetch_wikipedia_image')) {
  agent = agent.replace(
    'def sanitize_city_data(',
    imageFetchCode + 'def sanitize_city_data('
  );
  
  // Add image fetching to the end of sanitize_city_data
  // Find where sanitize returns and add image fetch before it
  agent = agent.replace(
    '    return city_data\n\n\ndef refresh_city',
    '    # Fetch Wikipedia image if not present\n    if not city_data.get("imageUrl"):\n        try:\n            img = fetch_wikipedia_image(city_name, country)\n            if img:\n                city_data["imageUrl"] = img\n                logging.info(f"Found Wikipedia image for {city_name}")\n        except Exception as e:\n            logging.warning(f"Could not fetch image for {city_name}: {e}")\n\n    return city_data\n\n\ndef refresh_city'
  );
  
  fs.writeFileSync('agent.py', agent, 'utf-8');
  console.log('Agent updated with Wikipedia image fetching');
} else {
  console.log('Agent already has image fetching — skipping');
}
