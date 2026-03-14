const fs = require('fs');

// Load existing queue and city data to avoid duplicates
const queue = JSON.parse(fs.readFileSync('data/city_queue.json', 'utf-8'));
const cityData = JSON.parse(fs.readFileSync('src/lib/city-data.json', 'utf-8'));

const existingSlugs = new Set();
cityData.cities.forEach(c => existingSlugs.add(c.slug));
queue.forEach(c => {
  const slug = (c.name + ' ' + c.country).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  existingSlugs.add(slug);
});

const newCities = [
  // EAST ASIA
  {n:"Fukuoka",c:"Japan",r:"East Asia"},{n:"Sapporo",c:"Japan",r:"East Asia"},{n:"Okinawa",c:"Japan",r:"East Asia"},
  {n:"Nagoya",c:"Japan",r:"East Asia"},{n:"Kobe",c:"Japan",r:"East Asia"},{n:"Kanazawa",c:"Japan",r:"East Asia"},
  {n:"Yokohama",c:"Japan",r:"East Asia"},{n:"Seoul",c:"South Korea",r:"East Asia"},{n:"Busan",c:"South Korea",r:"East Asia"},
  {n:"Jeju Island",c:"South Korea",r:"East Asia"},{n:"Incheon",c:"South Korea",r:"East Asia"},{n:"Gyeongju",c:"South Korea",r:"East Asia"},
  {n:"Hong Kong",c:"China",r:"East Asia"},{n:"Shanghai",c:"China",r:"East Asia"},{n:"Beijing",c:"China",r:"East Asia"},
  {n:"Chengdu",c:"China",r:"East Asia"},{n:"Guilin",c:"China",r:"East Asia"},{n:"Xi'an",c:"China",r:"East Asia"},
  {n:"Shenzhen",c:"China",r:"East Asia"},{n:"Guangzhou",c:"China",r:"East Asia"},{n:"Hangzhou",c:"China",r:"East Asia"},
  {n:"Kunming",c:"China",r:"East Asia"},{n:"Lijiang",c:"China",r:"East Asia"},{n:"Lhasa",c:"China",r:"East Asia"},
  {n:"Macau",c:"China",r:"East Asia"},{n:"Taipei",c:"Taiwan",r:"East Asia"},{n:"Kaohsiung",c:"Taiwan",r:"East Asia"},
  {n:"Tainan",c:"Taiwan",r:"East Asia"},{n:"Hualien",c:"Taiwan",r:"East Asia"},{n:"Ulaanbaatar",c:"Mongolia",r:"East Asia"},

  // SOUTHEAST ASIA EXPANDED
  {n:"Chiang Mai",c:"Thailand",r:"Southeast Asia"},{n:"Phuket",c:"Thailand",r:"Southeast Asia"},
  {n:"Koh Samui",c:"Thailand",r:"Southeast Asia"},{n:"Krabi",c:"Thailand",r:"Southeast Asia"},
  {n:"Pai",c:"Thailand",r:"Southeast Asia"},{n:"Koh Phangan",c:"Thailand",r:"Southeast Asia"},
  {n:"Chiang Rai",c:"Thailand",r:"Southeast Asia"},{n:"Ayutthaya",c:"Thailand",r:"Southeast Asia"},
  {n:"Singapore",c:"Singapore",r:"Southeast Asia"},{n:"Penang",c:"Malaysia",r:"Southeast Asia"},
  {n:"Langkawi",c:"Malaysia",r:"Southeast Asia"},{n:"Malacca",c:"Malaysia",r:"Southeast Asia"},
  {n:"Kota Kinabalu",c:"Malaysia",r:"Southeast Asia"},{n:"Jakarta",c:"Indonesia",r:"Southeast Asia"},
  {n:"Yogyakarta",c:"Indonesia",r:"Southeast Asia"},{n:"Lombok",c:"Indonesia",r:"Southeast Asia"},
  {n:"Cebu",c:"Philippines",r:"Southeast Asia"},{n:"Palawan",c:"Philippines",r:"Southeast Asia"},
  {n:"Siargao",c:"Philippines",r:"Southeast Asia"},{n:"Boracay",c:"Philippines",r:"Southeast Asia"},
  {n:"Hoi An",c:"Vietnam",r:"Southeast Asia"},{n:"Ha Long Bay",c:"Vietnam",r:"Southeast Asia"},
  {n:"Sapa",c:"Vietnam",r:"Southeast Asia"},{n:"Nha Trang",c:"Vietnam",r:"Southeast Asia"},
  {n:"Dalat",c:"Vietnam",r:"Southeast Asia"},{n:"Hue",c:"Vietnam",r:"Southeast Asia"},
  {n:"Luang Prabang",c:"Laos",r:"Southeast Asia"},{n:"Vientiane",c:"Laos",r:"Southeast Asia"},
  {n:"Vang Vieng",c:"Laos",r:"Southeast Asia"},{n:"Yangon",c:"Myanmar",r:"Southeast Asia"},
  {n:"Bagan",c:"Myanmar",r:"Southeast Asia"},{n:"Mandalay",c:"Myanmar",r:"Southeast Asia"},

  // SOUTH ASIA
  {n:"Goa",c:"India",r:"South Asia"},{n:"Jaipur",c:"India",r:"South Asia"},{n:"Varanasi",c:"India",r:"South Asia"},
  {n:"Kerala",c:"India",r:"South Asia"},{n:"Udaipur",c:"India",r:"South Asia"},{n:"Agra",c:"India",r:"South Asia"},
  {n:"Rishikesh",c:"India",r:"South Asia"},{n:"Kolkata",c:"India",r:"South Asia"},{n:"Bangalore",c:"India",r:"South Asia"},
  {n:"Chennai",c:"India",r:"South Asia"},{n:"Hyderabad",c:"India",r:"South Asia"},{n:"Amritsar",c:"India",r:"South Asia"},
  {n:"Jodhpur",c:"India",r:"South Asia"},{n:"Darjeeling",c:"India",r:"South Asia"},{n:"Hampi",c:"India",r:"South Asia"},
  {n:"Ella",c:"Sri Lanka",r:"South Asia"},{n:"Galle",c:"Sri Lanka",r:"South Asia"},{n:"Kandy",c:"Sri Lanka",r:"South Asia"},
  {n:"Pokhara",c:"Nepal",r:"South Asia"},{n:"Dhaka",c:"Bangladesh",r:"South Asia"},
  {n:"Thimphu",c:"Bhutan",r:"South Asia"},{n:"Paro",c:"Bhutan",r:"South Asia"},
  {n:"Male",c:"Maldives",r:"South Asia"},{n:"Islamabad",c:"Pakistan",r:"South Asia"},{n:"Lahore",c:"Pakistan",r:"South Asia"},

  // CENTRAL ASIA
  {n:"Samarkand",c:"Uzbekistan",r:"Central Asia"},{n:"Tashkent",c:"Uzbekistan",r:"Central Asia"},
  {n:"Bukhara",c:"Uzbekistan",r:"Central Asia"},{n:"Almaty",c:"Kazakhstan",r:"Central Asia"},
  {n:"Astana",c:"Kazakhstan",r:"Central Asia"},{n:"Bishkek",c:"Kyrgyzstan",r:"Central Asia"},
  {n:"Dushanbe",c:"Tajikistan",r:"Central Asia"},{n:"Ashgabat",c:"Turkmenistan",r:"Central Asia"},

  // MIDDLE EAST EXPANDED
  {n:"Jeddah",c:"Saudi Arabia",r:"Middle East"},{n:"AlUla",c:"Saudi Arabia",r:"Middle East"},
  {n:"Medina",c:"Saudi Arabia",r:"Middle East"},{n:"Petra",c:"Jordan",r:"Middle East"},
  {n:"Wadi Rum",c:"Jordan",r:"Middle East"},{n:"Aqaba",c:"Jordan",r:"Middle East"},
  {n:"Jerusalem",c:"Israel",r:"Middle East"},{n:"Eilat",c:"Israel",r:"Middle East"},
  {n:"Beirut",c:"Lebanon",r:"Middle East"},{n:"Kuwait City",c:"Kuwait",r:"Middle East"},
  {n:"Manama",c:"Bahrain",r:"Middle East"},{n:"Salalah",c:"Oman",r:"Middle East"},
  {n:"Erbil",c:"Iraq",r:"Middle East"},

  // AFRICA EXPANDED
  {n:"Fez",c:"Morocco",r:"Africa"},{n:"Chefchaouen",c:"Morocco",r:"Africa"},{n:"Tangier",c:"Morocco",r:"Africa"},
  {n:"Essaouira",c:"Morocco",r:"Africa"},{n:"Casablanca",c:"Morocco",r:"Africa"},
  {n:"Luxor",c:"Egypt",r:"Africa"},{n:"Aswan",c:"Egypt",r:"Africa"},{n:"Sharm El Sheikh",c:"Egypt",r:"Africa"},
  {n:"Hurghada",c:"Egypt",r:"Africa"},{n:"Alexandria",c:"Egypt",r:"Africa"},
  {n:"Tunis",c:"Tunisia",r:"Africa"},{n:"Algiers",c:"Algeria",r:"Africa"},
  {n:"Mombasa",c:"Kenya",r:"Africa"},{n:"Zanzibar",c:"Tanzania",r:"Africa"},{n:"Arusha",c:"Tanzania",r:"Africa"},
  {n:"Kampala",c:"Uganda",r:"Africa"},{n:"Entebbe",c:"Uganda",r:"Africa"},
  {n:"Lalibela",c:"Ethiopia",r:"Africa"},{n:"Antananarivo",c:"Madagascar",r:"Africa"},
  {n:"Victoria",c:"Seychelles",r:"Africa"},{n:"Port Louis",c:"Mauritius",r:"Africa"},
  {n:"Durban",c:"South Africa",r:"Africa"},{n:"Stellenbosch",c:"South Africa",r:"Africa"},
  {n:"Pretoria",c:"South Africa",r:"Africa"},{n:"Victoria Falls",c:"Zimbabwe",r:"Africa"},
  {n:"Windhoek",c:"Namibia",r:"Africa"},{n:"Swakopmund",c:"Namibia",r:"Africa"},
  {n:"Gaborone",c:"Botswana",r:"Africa"},{n:"Maputo",c:"Mozambique",r:"Africa"},
  {n:"Lusaka",c:"Zambia",r:"Africa"},{n:"Livingstone",c:"Zambia",r:"Africa"},
  {n:"Dakar",c:"Senegal",r:"Africa"},{n:"Abidjan",c:"Ivory Coast",r:"Africa"},
  {n:"Praia",c:"Cape Verde",r:"Africa"},{n:"Banjul",c:"Gambia",r:"Africa"},

  // NORTH AMERICA EXPANDED
  {n:"Phoenix",c:"United States",r:"North America"},{n:"Minneapolis",c:"United States",r:"North America"},
  {n:"Orlando",c:"United States",r:"North America"},{n:"Tampa",c:"United States",r:"North America"},
  {n:"Salt Lake City",c:"United States",r:"North America"},{n:"Asheville",c:"United States",r:"North America"},
  {n:"Santa Fe",c:"United States",r:"North America"},{n:"Sedona",c:"United States",r:"North America"},
  {n:"Key West",c:"United States",r:"North America"},{n:"Maui",c:"United States",r:"North America"},
  {n:"Napa Valley",c:"United States",r:"North America"},{n:"Baltimore",c:"United States",r:"North America"},
  {n:"Pittsburgh",c:"United States",r:"North America"},{n:"Cleveland",c:"United States",r:"North America"},
  {n:"Indianapolis",c:"United States",r:"North America"},{n:"Kansas City",c:"United States",r:"North America"},
  {n:"Charlotte",c:"United States",r:"North America"},{n:"San Antonio",c:"United States",r:"North America"},
  {n:"El Paso",c:"United States",r:"North America"},{n:"Tucson",c:"United States",r:"North America"},
  {n:"Montreal",c:"Canada",r:"North America"},{n:"Quebec City",c:"Canada",r:"North America"},
  {n:"Banff",c:"Canada",r:"North America"},{n:"Ottawa",c:"Canada",r:"North America"},
  {n:"Calgary",c:"Canada",r:"North America"},{n:"Halifax",c:"Canada",r:"North America"},
  {n:"Whistler",c:"Canada",r:"North America"},{n:"Winnipeg",c:"Canada",r:"North America"},
  {n:"Edmonton",c:"Canada",r:"North America"},{n:"Niagara Falls",c:"Canada",r:"North America"},

  // CENTRAL AMERICA & CARIBBEAN EXPANDED
  {n:"Tulum",c:"Mexico",r:"Central America & Caribbean"},{n:"Oaxaca",c:"Mexico",r:"Central America & Caribbean"},
  {n:"Puerto Vallarta",c:"Mexico",r:"Central America & Caribbean"},{n:"San Miguel de Allende",c:"Mexico",r:"Central America & Caribbean"},
  {n:"Guadalajara",c:"Mexico",r:"Central America & Caribbean"},{n:"Merida",c:"Mexico",r:"Central America & Caribbean"},
  {n:"Cabo San Lucas",c:"Mexico",r:"Central America & Caribbean"},{n:"Monterrey",c:"Mexico",r:"Central America & Caribbean"},
  {n:"Guanajuato",c:"Mexico",r:"Central America & Caribbean"},{n:"Cozumel",c:"Mexico",r:"Central America & Caribbean"},
  {n:"Monteverde",c:"Costa Rica",r:"Central America & Caribbean"},{n:"Tamarindo",c:"Costa Rica",r:"Central America & Caribbean"},
  {n:"La Fortuna",c:"Costa Rica",r:"Central America & Caribbean"},{n:"Manuel Antonio",c:"Costa Rica",r:"Central America & Caribbean"},
  {n:"Bocas del Toro",c:"Panama",r:"Central America & Caribbean"},{n:"Boquete",c:"Panama",r:"Central America & Caribbean"},
  {n:"San Pedro",c:"Belize",r:"Central America & Caribbean"},{n:"Caye Caulker",c:"Belize",r:"Central America & Caribbean"},
  {n:"Antigua Guatemala",c:"Guatemala",r:"Central America & Caribbean"},{n:"Lake Atitlan",c:"Guatemala",r:"Central America & Caribbean"},
  {n:"El Tunco",c:"El Salvador",r:"Central America & Caribbean"},{n:"Roatan",c:"Honduras",r:"Central America & Caribbean"},
  {n:"Granada",c:"Nicaragua",r:"Central America & Caribbean"},{n:"San Juan del Sur",c:"Nicaragua",r:"Central America & Caribbean"},
  {n:"Trinidad",c:"Cuba",r:"Central America & Caribbean"},{n:"Vinales",c:"Cuba",r:"Central America & Caribbean"},
  {n:"Montego Bay",c:"Jamaica",r:"Central America & Caribbean"},{n:"Negril",c:"Jamaica",r:"Central America & Caribbean"},
  {n:"Bridgetown",c:"Barbados",r:"Central America & Caribbean"},{n:"Aruba",c:"Aruba",r:"Central America & Caribbean"},
  {n:"Curacao",c:"Curacao",r:"Central America & Caribbean"},{n:"St. Lucia",c:"Saint Lucia",r:"Central America & Caribbean"},

  // SOUTH AMERICA EXPANDED
  {n:"Mendoza",c:"Argentina",r:"South America"},{n:"Bariloche",c:"Argentina",r:"South America"},
  {n:"Ushuaia",c:"Argentina",r:"South America"},{n:"Salta",c:"Argentina",r:"South America"},
  {n:"Cordoba",c:"Argentina",r:"South America"},{n:"El Calafate",c:"Argentina",r:"South America"},
  {n:"Salvador",c:"Brazil",r:"South America"},{n:"Florianopolis",c:"Brazil",r:"South America"},
  {n:"Recife",c:"Brazil",r:"South America"},{n:"Fortaleza",c:"Brazil",r:"South America"},
  {n:"Manaus",c:"Brazil",r:"South America"},{n:"Brasilia",c:"Brazil",r:"South America"},
  {n:"Paraty",c:"Brazil",r:"South America"},{n:"Valparaiso",c:"Chile",r:"South America"},
  {n:"San Pedro de Atacama",c:"Chile",r:"South America"},{n:"Easter Island",c:"Chile",r:"South America"},
  {n:"Cali",c:"Colombia",r:"South America"},{n:"Santa Marta",c:"Colombia",r:"South America"},
  {n:"San Andres",c:"Colombia",r:"South America"},{n:"Machu Picchu",c:"Peru",r:"South America"},
  {n:"Arequipa",c:"Peru",r:"South America"},{n:"Iquitos",c:"Peru",r:"South America"},
  {n:"Galapagos Islands",c:"Ecuador",r:"South America"},{n:"Cuenca",c:"Ecuador",r:"South America"},
  {n:"Banos",c:"Ecuador",r:"South America"},{n:"Punta del Este",c:"Uruguay",r:"South America"},
  {n:"Colonia del Sacramento",c:"Uruguay",r:"South America"},{n:"La Paz",c:"Bolivia",r:"South America"},
  {n:"Sucre",c:"Bolivia",r:"South America"},{n:"Uyuni",c:"Bolivia",r:"South America"},
  {n:"Asuncion",c:"Paraguay",r:"South America"},{n:"Georgetown",c:"Guyana",r:"South America"},

  // EUROPE ADDITIONAL
  {n:"Monaco",c:"Monaco",r:"Europe"},{n:"Valletta",c:"Malta",r:"Europe"},{n:"Gozo",c:"Malta",r:"Europe"},
  {n:"Kyiv",c:"Ukraine",r:"Europe"},{n:"Lviv",c:"Ukraine",r:"Europe"},{n:"Odessa",c:"Ukraine",r:"Europe"},
  {n:"Nicosia",c:"Cyprus",r:"Europe"},{n:"Paphos",c:"Cyprus",r:"Europe"},
  {n:"Zakynthos",c:"Greece",r:"Europe"},{n:"Paros",c:"Greece",r:"Europe"},{n:"Naxos",c:"Greece",r:"Europe"},
  {n:"Sardinia",c:"Italy",r:"Europe"},{n:"Lake Como",c:"Italy",r:"Europe"},{n:"Positano",c:"Italy",r:"Europe"},
  {n:"Verona",c:"Italy",r:"Europe"},{n:"Genoa",c:"Italy",r:"Europe"},{n:"Lecce",c:"Italy",r:"Europe"},
  {n:"Siena",c:"Italy",r:"Europe"},{n:"Pisa",c:"Italy",r:"Europe"},{n:"Palermo",c:"Italy",r:"Europe"},
  {n:"Naples",c:"Italy",r:"Europe"},{n:"Zurich",c:"Switzerland",r:"Europe"},
  {n:"Marseille",c:"France",r:"Europe"},{n:"Montpellier",c:"France",r:"Europe"},
  {n:"Avignon",c:"France",r:"Europe"},{n:"Chamonix",c:"France",r:"Europe"},
  {n:"Annecy",c:"France",r:"Europe"},{n:"Normandy",c:"France",r:"Europe"},
  {n:"Munich",c:"Germany",r:"Europe"},{n:"Leipzig",c:"Germany",r:"Europe"},
  {n:"Nuremberg",c:"Germany",r:"Europe"},{n:"Stuttgart",c:"Germany",r:"Europe"},
  {n:"Dusseldorf",c:"Germany",r:"Europe"},{n:"Heidelberg",c:"Germany",r:"Europe"},
  {n:"Edinburgh",c:"United Kingdom",r:"Europe"},{n:"Cambridge",c:"United Kingdom",r:"Europe"},
  {n:"Oxford",c:"United Kingdom",r:"Europe"},{n:"Inverness",c:"United Kingdom",r:"Europe"},
  {n:"Isle of Skye",c:"United Kingdom",r:"Europe"},{n:"Cardiff",c:"United Kingdom",r:"Europe"},
  {n:"Malmo",c:"Sweden",r:"Europe"},{n:"Uppsala",c:"Sweden",r:"Europe"},
  {n:"Turku",c:"Finland",r:"Europe"},{n:"Tampere",c:"Finland",r:"Europe"},
  {n:"Stavanger",c:"Norway",r:"Europe"},{n:"Lofoten",c:"Norway",r:"Europe"},
  {n:"Copenhagen",c:"Denmark",r:"Europe"},{n:"Aarhus",c:"Denmark",r:"Europe"},
  {n:"Maastricht",c:"Netherlands",r:"Europe"},{n:"Utrecht",c:"Netherlands",r:"Europe"},
  {n:"Antwerp",c:"Belgium",r:"Europe"},{n:"Leuven",c:"Belgium",r:"Europe"},
  {n:"Sintra",c:"Portugal",r:"Europe"},{n:"Lagos",c:"Portugal",r:"Europe"},
  {n:"Madeira",c:"Portugal",r:"Europe"},{n:"Azores",c:"Portugal",r:"Europe"},
  {n:"Girona",c:"Spain",r:"Europe"},{n:"Cordoba",c:"Spain",r:"Europe"},
  {n:"Ibiza",c:"Spain",r:"Europe"},{n:"Canary Islands",c:"Spain",r:"Europe"},
  {n:"Cadiz",c:"Spain",r:"Europe"},{n:"Segovia",c:"Spain",r:"Europe"},
  {n:"Poznan",c:"Poland",r:"Europe"},{n:"Lodz",c:"Poland",r:"Europe"},
  {n:"Brno",c:"Czech Republic",r:"Europe"},{n:"Cesky Krumlov",c:"Czech Republic",r:"Europe"},
  {n:"Debrecen",c:"Hungary",r:"Europe"},{n:"Eger",c:"Hungary",r:"Europe"},
  {n:"Sibiu",c:"Romania",r:"Europe"},{n:"Timisoara",c:"Romania",r:"Europe"},
  {n:"Varna",c:"Bulgaria",r:"Europe"},{n:"Veliko Tarnovo",c:"Bulgaria",r:"Europe"},
  {n:"Piran",c:"Slovenia",r:"Europe"},{n:"Rovinj",c:"Croatia",r:"Europe"},
  {n:"Zadar",c:"Croatia",r:"Europe"},{n:"Pula",c:"Croatia",r:"Europe"},
  {n:"Tartu",c:"Estonia",r:"Europe"},{n:"Kaunas",c:"Lithuania",r:"Europe"},
  {n:"Jurmala",c:"Latvia",r:"Europe"},{n:"Bern",c:"Switzerland",r:"Europe"},

  // OCEANIA EXPANDED
  {n:"Brisbane",c:"Australia",r:"Oceania"},{n:"Perth",c:"Australia",r:"Oceania"},
  {n:"Adelaide",c:"Australia",r:"Oceania"},{n:"Cairns",c:"Australia",r:"Oceania"},
  {n:"Gold Coast",c:"Australia",r:"Oceania"},{n:"Hobart",c:"Australia",r:"Oceania"},
  {n:"Darwin",c:"Australia",r:"Oceania"},{n:"Canberra",c:"Australia",r:"Oceania"},
  {n:"Byron Bay",c:"Australia",r:"Oceania"},{n:"Great Barrier Reef",c:"Australia",r:"Oceania"},
  {n:"Wellington",c:"New Zealand",r:"Oceania"},{n:"Christchurch",c:"New Zealand",r:"Oceania"},
  {n:"Rotorua",c:"New Zealand",r:"Oceania"},{n:"Milford Sound",c:"New Zealand",r:"Oceania"},
  {n:"Wanaka",c:"New Zealand",r:"Oceania"},{n:"Napier",c:"New Zealand",r:"Oceania"},
  {n:"Nadi",c:"Fiji",r:"Oceania"},{n:"Suva",c:"Fiji",r:"Oceania"},
  {n:"Rarotonga",c:"Cook Islands",r:"Oceania"},{n:"Bora Bora",c:"French Polynesia",r:"Oceania"},
  {n:"Tahiti",c:"French Polynesia",r:"Oceania"},{n:"Apia",c:"Samoa",r:"Oceania"},
  {n:"Port Vila",c:"Vanuatu",r:"Oceania"},{n:"Noumea",c:"New Caledonia",r:"Oceania"},
];

// Deduplicate against existing cities and queue
let added = 0;
let skipped = 0;
const expanded = [...queue];

newCities.forEach(city => {
  const entry = { name: city.n, country: city.c, region: city.r };
  const slug = (city.n + ' ' + city.c).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (existingSlugs.has(slug)) {
    skipped++;
    return;
  }
  existingSlugs.add(slug);
  expanded.push(entry);
  added++;
});

fs.writeFileSync('data/city_queue.json', JSON.stringify(expanded, null, 2), 'utf-8');

console.log(`Queue expanded: ${added} new cities added, ${skipped} duplicates skipped`);
console.log(`Total queue size: ${expanded.length}`);
console.log(`Live cities: ${cityData.cities.length}`);
console.log(`Total when complete: ${cityData.cities.length + expanded.length}`);
