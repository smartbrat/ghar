/* ═══════════════════════════════════════════════════════════════════════
   GHAR.TV VIDEO REGISTRY  ·  the one list of every video Ghar.tv publishes
   ───────────────────────────────────────────────────────────────────────
   Read by scripts/build-videos.mjs, which bakes the /videos pages from it.
   Programmer: this is the shape of the `videos` table. See
   docs/VIDEOS-HANDOFF.md.

   ONE HOME PER VIDEO. `home` is the single page a card links to. A
   GharTalks episode with a written page lives at /ghartalks/{slug}; a video
   with no other home gets /videos/{slug}. When project pages exist, a
   project tour's `home` moves to its project page and /videos keeps only
   the card.

   SOURCE: @Ghar.tv_official (channel UCLSlDxixcbyL4ElOAbqI_9A), pulled
   2026-09-28. Dates, durations and deks are YouTube's own. Titles are
   cleaned for display (no "| Ghar.tv", no hashtags). Nothing is invented.

   Fields
     id      YouTube id
     slug    /videos/{slug} when the video has no other home
     topic   project-tours | market | home-buying | design | ghartalks
     format  long (16:9 card) | short (9:16 card, vertical player)
     date    upload date, YYYY-MM-DD
     secs    duration in seconds
     city    optional, where the video is about
     home    the one page every card links to
     still   optional YouTube still name when maxres2 is missing (long only)
     dek     one or two sentences from the video's own description
   ═══════════════════════════════════════════════════════════════════════ */

export const TOPICS = [
  { slug: 'project-tours', label: 'Project tours', dek: 'Walkthroughs of homes being built and sold right now, with the view, the layout and the neighbourhood on screen.' },
  { slug: 'market', label: 'Market', dek: 'Prices, infrastructure and the deals moving Indian real estate, explained in a few minutes each.' },
  { slug: 'home-buying', label: 'Home buying', dek: 'The documents, checks and mistakes that decide whether a purchase goes well.' },
  { slug: 'design', label: 'Design', dek: 'How Indian homes are being designed now: minimalism, Vastu, materials and the people behind the rooms.' },
];

export const GHARTALKS = { slug: 'ghartalks', label: 'GharTalks', href: '/ghartalks' };

/* Hub lead. Editorial pick, not chronology. */
export const FEATURED = 'm0us2RQGskA';

export const VIDEOS = [
  {
    id: "f8tHTmsrPT0",
    slug: "why-are-affordable-buyers-disappearing",
    topic: "market",
    format: "short",
    title: "Why are affordable buyers disappearing?",
    date: "2026-09-25",
    secs: 58,
    home: "/videos/why-are-affordable-buyers-disappearing",
    dek: "India’s residential market is growing, but the growth isn't evenly distributed. In H1 2026, residential sales across seven major cities increased by 3%."
  },
  {
    id: "iQb3Ppp1Nww",
    slug: "dr-niranjan-hiranandani-on-what-affordable-housing-needs",
    topic: "ghartalks",
    format: "short",
    title: "Dr Niranjan Hiranandani on what affordable housing needs",
    date: "2026-09-04",
    secs: 175,
    home: "/videos/dr-niranjan-hiranandani-on-what-affordable-housing-needs",
    dek: "Dr Niranjan Hiranandani on affordable housing, home ownership and what has to change to make homes accessible."
  },
  {
    id: "AyJKAC9uOaE",
    slug: "warm-minimalism-the-secret-to-a-calm-home",
    topic: "design",
    format: "short",
    title: "Warm minimalism: the secret to a calm home",
    date: "2026-08-20",
    secs: 87,
    home: "/videos/warm-minimalism-the-secret-to-a-calm-home",
    dek: "Minimalism shouldn’t make your home feel cold or empty. Warm Minimalism is about creating a clean, intentional space while adding warmth through greige tones, natural materials, layered lighting, texture, and personal objects."
  },
  {
    id: "HDkru4a8jmo",
    slug: "save-yourself-from-bad-property-deals",
    topic: "home-buying",
    format: "short",
    title: "Save yourself from bad property deals",
    date: "2026-08-14",
    secs: 16,
    home: "/videos/save-yourself-from-bad-property-deals",
    dek: "Do the due diligence before you sign. A short reminder of what skipping it costs."
  },
  {
    id: "GYKJfGAmFSY",
    slug: "is-minimalism-overrated",
    topic: "design",
    format: "short",
    title: "Is minimalism overrated?",
    date: "2026-08-05",
    secs: 97,
    home: "/videos/is-minimalism-overrated",
    dek: "Minimalism has shaped modern architecture, interior design, and home décor for over a century. But despite its popularity, not everyone believes it's the perfect design philosophy."
  },
  {
    id: "Rn5ET6I1Xl0",
    slug: "lodha-altero-pune",
    topic: "project-tours",
    format: "short",
    title: "Lodha Altero, Pune",
    date: "2026-08-04",
    secs: 42,
    city: "Pune",
    home: "/videos/lodha-altero-pune",
    dek: "Luxury has a new address in Wakad. Discover Lodha Altero, an exclusive residential landmark near Mankar Chowk, offering expansive 4 & 5 BHK residences and luxury penthouses with world-class lifestyle amenities."
  },
  {
    id: "0oSGTPZvhUQ",
    slug: "minimalism-isnt-what-you-think",
    topic: "design",
    format: "short",
    title: "Minimalism isn’t what you think",
    date: "2026-07-31",
    secs: 82,
    home: "/videos/minimalism-isnt-what-you-think",
    dek: "Minimalism isn't about owning less. It's about living with more intention. In this video, we explore the psychology behind minimalism, why it has become one of the world's most influential lifestyle and interior design philosophies, and…"
  },
  {
    id: "8otoUgls8TA",
    slug: "minimalism-is-more-than-a-style",
    topic: "design",
    format: "short",
    title: "Minimalism is more than a style",
    date: "2026-07-17",
    secs: 130,
    home: "/videos/minimalism-is-more-than-a-style",
    dek: "Discover the fascinating history of Minimalist Architecture and how the Bauhaus movement transformed modern design forever."
  },
  {
    id: "qANZAjd-3Ew",
    slug: "the-biggest-vastu-myth-north-facing-homes",
    topic: "design",
    format: "short",
    title: "The biggest Vastu myth: north-facing homes",
    date: "2026-07-13",
    secs: 71,
    home: "/videos/the-biggest-vastu-myth-north-facing-homes",
    dek: "Discover the truth about Vastu Shastra and why simply buying a north-facing home doesn't automatically make it Vastu-compliant."
  },
  {
    id: "8sUsJjHK4pE",
    slug: "arkade-evoke-goregaon-west",
    topic: "project-tours",
    format: "short",
    title: "Arkade Evoke, Goregaon West",
    date: "2026-07-10",
    secs: 42,
    city: "Mumbai",
    home: "/videos/arkade-evoke-goregaon-west",
    dek: "Discover Arkade Evoke, a premium low-density residential development in Bangur Nagar, Goregaon West, offering spacious 2 & 3 BHK residences designed for modern luxury living."
  },
  {
    id: "jT8rmYBNi0g",
    slug: "kolte-patil-vivere-bangur-nagar",
    topic: "project-tours",
    format: "short",
    title: "Kolte Patil Vivere, Bangur Nagar",
    date: "2026-07-07",
    secs: 42,
    city: "Mumbai",
    home: "/videos/kolte-patil-vivere-bangur-nagar",
    dek: "Discover Kolte Patil Vivere, a premium low-density residential development in Bangur Nagar, Goregaon West, designed for those who value privacy, space, and seamless urban connectivity."
  },
  {
    id: "Dg1iiNXFNDQ",
    slug: "rustomjee-ozone-goregaon",
    topic: "project-tours",
    format: "short",
    title: "Rustomjee Ozone, Goregaon",
    date: "2026-07-04",
    secs: 33,
    city: "Mumbai",
    home: "/videos/rustomjee-ozone-goregaon",
    dek: "Discover Rustomjee Ozone Phase 2, an exclusive boutique luxury residential tower in Goregaon West, Mumbai, by Rustomjee."
  },
  {
    id: "NtrSg3Gqwgc",
    slug: "runwal-auris-malads-tallest-luxury-tower",
    topic: "project-tours",
    format: "short",
    title: "Runwal Auris: Malad’s tallest luxury tower",
    date: "2026-07-03",
    secs: 39,
    city: "Mumbai",
    home: "/videos/runwal-auris-malads-tallest-luxury-tower",
    dek: "Discover Runwal Auris, one of the most iconic ultra-luxury residential developments in Malad West, Mumbai, by Runwal Realty."
  },
  {
    id: "jx4rnr6ahg0",
    slug: "mangroves-bangur-nagar-a-view-that-stays",
    topic: "project-tours",
    format: "short",
    title: "Mangroves, Bangur Nagar: a view that stays",
    date: "2026-07-02",
    secs: 43,
    city: "Mumbai",
    home: "/videos/mangroves-bangur-nagar-a-view-that-stays",
    dek: "Discover Mangroves by Vibe Realty & Kumar Corp, a premium residential development in Bangur Nagar, Goregaon West, offering luxury 2 & 3 BHK residences with lifetime open views and thoughtfully planned modern living."
  },
  {
    id: "_E42aOA12CM",
    slug: "h-rishabraj-avyanna-goregaon",
    topic: "project-tours",
    format: "short",
    title: "H Rishabraj Avyanna, Goregaon",
    date: "2026-07-01",
    secs: 34,
    city: "Mumbai",
    home: "/videos/h-rishabraj-avyanna-goregaon",
    dek: "Discover H. Rishabraj, a premium residential development in Bangur Nagar, Goregaon West, offering thoughtfully designed 2 & 3 Bed Deck residences with modern layouts, private outdoor spaces, and exceptional lifestyle amenities."
  },
  {
    id: "zJBy8Hi_KJk",
    slug: "gera-the-crown-bavdhan-hills",
    topic: "project-tours",
    format: "short",
    title: "Gera The Crown, Bavdhan Hills",
    date: "2026-06-30",
    secs: 28,
    city: "Pune",
    home: "/videos/gera-the-crown-bavdhan-hills",
    dek: "Discover Gera The Crown, an exceptional residential development in the heart of Bavdhan hills, Pune."
  },
  {
    id: "VohaCGDzj00",
    slug: "lodha-sadahalli-bengaluru-luxury-meets-nature",
    topic: "project-tours",
    format: "long",
    title: "Lodha Sadahalli, Bengaluru: luxury meets nature",
    date: "2026-06-26",
    secs: 290,
    city: "Bengaluru",
    home: "/videos/lodha-sadahalli-bengaluru-luxury-meets-nature",
    dek: "Discover Lodha Sadahalli Garden Estate, one of North Bengaluru's most anticipated luxury residential developments by Lodha."
  },
  {
    id: "5pkkCI92bW0",
    slug: "moraj-opulence-deck-homes-mahim",
    topic: "project-tours",
    format: "short",
    title: "Moraj Opulence deck homes, Mahim",
    date: "2026-06-24",
    secs: 34,
    city: "Mumbai",
    home: "/videos/moraj-opulence-deck-homes-mahim",
    dek: "Sea views, private decks and rare privacy: the deck homes at Shivaji Park, Mahim."
  },
  {
    id: "txKePOMi0MU",
    slug: "square-yards-real-estates-new-unicorn",
    topic: "market",
    format: "short",
    title: "Square Yards: real estate’s new unicorn",
    date: "2026-06-24",
    secs: 46,
    home: "/videos/square-yards-real-estates-new-unicorn",
    dek: "India just got a new unicorn, and it's not a fintech, edtech, or AI startup. Square Yards, one of India's leading proptech companies, has crossed a $1 billion valuation after raising ₹900 crore through a mix of debt and equity funding."
  },
  {
    id: "4sRJmcjt9I0",
    slug: "gera-joy-on-the-treetops-hinjewadi",
    topic: "project-tours",
    format: "short",
    title: "Gera Joy on the Treetops, Hinjewadi",
    date: "2026-06-22",
    secs: 30,
    city: "Pune",
    home: "/videos/gera-joy-on-the-treetops-hinjewadi",
    dek: "Discover Gera Joy on the Treetops, a thoughtfully designed residential community in Hinjewadi, Pune, where modern living meets nature-inspired experiences."
  },
  {
    id: "IXjjen6-eg0",
    slug: "phoenix-kessaku-rajajinagar",
    topic: "project-tours",
    format: "short",
    title: "Phoenix Kessaku, Rajajinagar",
    date: "2026-06-10",
    secs: 64,
    city: "Bengaluru",
    home: "/videos/phoenix-kessaku-rajajinagar",
    dek: "Phoenix Kessaku in Rajajinagar, Bengaluru: luxury residences shaped by living philosophies from around the world."
  },
  {
    id: "8UvnPBSqrOM",
    slug: "prestige-nautilus-worli",
    topic: "project-tours",
    format: "long",
    title: "Prestige Nautilus, Worli",
    date: "2026-06-09",
    secs: 220,
    city: "Mumbai",
    home: "/videos/prestige-nautilus-worli",
    dek: "Prestige Nautilus Worli is emerging as one of Mumbai's most anticipated ultra-luxury residential developments."
  },
  {
    id: "7Ew87dGrciA",
    slug: "lodha-sea-face-the-view-money-cant-create",
    topic: "project-tours",
    format: "long",
    title: "Lodha Sea Face: the view money can’t create",
    date: "2026-06-03",
    secs: 216,
    city: "Mumbai",
    home: "/videos/lodha-sea-face-the-view-money-cant-create",
    still: "hq2",
    dek: "Explore Lodha Sea Face Worli, one of Mumbai's most exclusive ultra-luxury waterfront developments located directly on the iconic Worli Sea Face."
  },
  {
    id: "x0wax3h-TWo",
    slug: "godrej-trilogy-worlis-new-ultra-luxury-landmark",
    topic: "project-tours",
    format: "long",
    title: "Godrej Trilogy: Worli’s new ultra-luxury landmark?",
    date: "2026-06-01",
    secs: 39,
    city: "Mumbai",
    home: "/videos/godrej-trilogy-worlis-new-ultra-luxury-landmark",
    still: "hq2",
    dek: "Discover Godrej Trilogy Worli, one of Mumbai’s most talked-about ultra-luxury residential developments located on AB Nair Road, Worli."
  },
  {
    id: "UOkiWVDYrUY",
    slug: "godrej-trilogy-worli",
    topic: "project-tours",
    format: "long",
    title: "Godrej Trilogy, Worli",
    date: "2026-05-29",
    secs: 142,
    city: "Mumbai",
    home: "/videos/godrej-trilogy-worli",
    dek: "Discover Godrej Trilogy Worli, one of Mumbai’s most talked-about ultra-luxury residential developments in the heart of South Mumbai."
  },
  {
    id: "qyqV1yCDnyU",
    slug: "lodha-sea-face-worli",
    topic: "project-tours",
    format: "short",
    title: "Lodha Sea Face, Worli",
    date: "2026-05-23",
    secs: 81,
    city: "Mumbai",
    home: "/videos/lodha-sea-face-worli",
    dek: "In Mumbai, a sea-facing home is legacy. A look at Lodha Sea Face on the Worli waterfront."
  },
  {
    id: "V-3ooaYKUoQ",
    slug: "kalpataru-one-worli",
    topic: "project-tours",
    format: "short",
    title: "Kalpataru One, Worli",
    date: "2026-05-21",
    secs: 72,
    city: "Mumbai",
    home: "/videos/kalpataru-one-worli",
    dek: "Featuring iconic towers, expansive 4 & 5 BHK residences, private decks, 13 ft ceiling heights, and unmatched connectivity to BKC, Lower Parel & South Mumbai, this is where luxury meets legacy."
  },
  {
    id: "0mnIAfaRaLQ",
    slug: "worli-mumbais-luxury-epicentre",
    topic: "market",
    format: "short",
    title: "Worli, Mumbai’s luxury epicentre",
    date: "2026-05-20",
    secs: 50,
    city: "Mumbai",
    home: "/videos/worli-mumbais-luxury-epicentre",
    dek: "Worli is rapidly transforming into Mumbai’s most powerful luxury real estate destination."
  },
  {
    id: "6n4mJy3QdF4",
    slug: "lodha-villa-cerro-the-country-estate",
    topic: "project-tours",
    format: "short",
    title: "Lodha Villa Cerro: the country estate",
    date: "2026-05-19",
    secs: 72,
    city: "Khopoli",
    home: "/videos/lodha-villa-cerro-the-country-estate",
    dek: "The most exclusive homes are rarely inside crowded cities. Lodha Villa Cerro makes the case for a country estate near Mumbai."
  },
  {
    id: "_kTEGRosF28",
    slug: "a-4-bhk-bungalow-in-tungarli-lonavala",
    topic: "project-tours",
    format: "short",
    title: "A 4 BHK bungalow in Tungarli, Lonavala",
    date: "2026-05-18",
    secs: 76,
    city: "Lonavala",
    home: "/videos/a-4-bhk-bungalow-in-tungarli-lonavala",
    dek: "Experience luxury living in the heart of Tungarli, Lonavala with this stunning 4 BHK independent villa featuring premium interiors, spacious living spaces, private pool vibes, and resort-style architecture."
  },
  {
    id: "GIo55OLTlvc",
    slug: "the-future-of-south-mumbai-is-worli",
    topic: "market",
    format: "short",
    title: "The future of South Mumbai is Worli",
    date: "2026-05-17",
    secs: 77,
    city: "Mumbai",
    home: "/videos/the-future-of-south-mumbai-is-worli",
    dek: "Worli is rapidly transforming into Mumbai’s most influential luxury real estate corridor."
  },
  {
    id: "7Jf3HgUXkOQ",
    slug: "lodha-villa-cerro-weekend-homes-in-nature",
    topic: "project-tours",
    format: "short",
    title: "Lodha Villa Cerro: weekend homes in nature",
    date: "2026-05-15",
    secs: 79,
    city: "Khopoli",
    home: "/videos/lodha-villa-cerro-weekend-homes-in-nature",
    dek: "The future of luxury living near Mumbai may not be another skyscraper. It may be a private villa estate in the Sahyadris."
  },
  {
    id: "XueOvkYNts4",
    slug: "prestige-nautilus-ultra-luxury-in-worli",
    topic: "project-tours",
    format: "short",
    title: "Prestige Nautilus: ultra-luxury in Worli",
    date: "2026-05-14",
    secs: 80,
    city: "Mumbai",
    home: "/videos/prestige-nautilus-ultra-luxury-in-worli",
    dek: "Prestige Group’s landmark new project in Worli offers rare sea-facing 4 & 5 BHK residences with 13-foot ceilings, iconic architecture by Hafeez Contractor, exceptional privacy, and seamless connectivity to the Worli Metro, Sea Link,…"
  },
  {
    id: "FEPE-Uz0qB4",
    slug: "godrej-trilogy-in-a-minute",
    topic: "project-tours",
    format: "short",
    title: "Godrej Trilogy in a minute",
    date: "2026-05-12",
    secs: 71,
    city: "Mumbai",
    home: "/videos/godrej-trilogy-in-a-minute",
    dek: "Discover Godrej Trilogy, an ultra-luxury residential project by Godrej Properties located on AB Nair Road, Worli, next to the Nehru Planetarium in South Mumbai."
  },
  {
    id: "RaUSbDxXX6g",
    slug: "the-truth-about-cheap-real-estate",
    topic: "home-buying",
    format: "short",
    title: "The truth about cheap real estate",
    date: "2026-05-09",
    secs: 63,
    home: "/videos/the-truth-about-cheap-real-estate",
    dek: "Cheap property looks attractive at first. But in real estate, low price often comes with hidden costs: poor connectivity, weak demand, higher travel time, maintenance issues, and low resale potential."
  },
  {
    id: "LmMcPthk7qE",
    slug: "why-index-ii-matters",
    topic: "home-buying",
    format: "short",
    title: "Why Index II matters",
    date: "2026-05-06",
    secs: 72,
    home: "/videos/why-index-ii-matters",
    dek: "Before buying a property, don’t just check the flat, check the Index II. This government-issued registration document helps verify ownership, transaction details, registration history, and the legal validity of the deal."
  },
  {
    id: "1r4p-h7aDMg",
    slug: "the-interior-design-trends-defining-homes-in-2026",
    topic: "design",
    format: "short",
    title: "The interior design trends defining homes in 2026",
    date: "2026-04-25",
    secs: 72,
    home: "/videos/the-interior-design-trends-defining-homes-in-2026",
    dek: "Homes are becoming warmer, richer, and more personal, with layered styling, natural materials, deeper colours, sculptural lighting, and spaces that actually feel lived in."
  },
  {
    id: "421GZzdOEi4",
    slug: "godrej-trilogy-worli-rs-219-crore-in-9-days",
    topic: "market",
    format: "short",
    title: "Godrej Trilogy Worli: ₹219 crore in 9 days",
    date: "2026-04-21",
    secs: 49,
    city: "Mumbai",
    home: "/videos/godrej-trilogy-worli-rs-219-crore-in-9-days",
    dek: "Godrej Trilogy in Worli reportedly closed 10 luxury transactions ranging from ₹14 crore to ₹30 crore, with prices touching nearly ₹1 lakh per sq ft. The bigger signal? It’s not just penthouses or top floors moving."
  },
  {
    id: "NsS-LZ-j1FI",
    slug: "indias-first-bullet-train-mumbai-to-ahmedabad",
    topic: "market",
    format: "short",
    title: "India’s first bullet train, Mumbai to Ahmedabad",
    date: "2026-04-18",
    secs: 63,
    home: "/videos/indias-first-bullet-train-mumbai-to-ahmedabad",
    dek: "Bigger long-term shift may come from the Mumbai–Ahmedabad Bullet Train Corridor. With speeds of 320 km/h and travel time dropping from nearly 5 hours to around 2 hours, this project can reshape how people live, work, and invest."
  },
  {
    id: "elr-bRH9eCo",
    slug: "index-ii-the-document-that-can-save-you-lakhs",
    topic: "home-buying",
    format: "short",
    title: "Index II: the document that can save you lakhs",
    date: "2026-04-11",
    secs: 60,
    home: "/videos/index-ii-the-document-that-can-save-you-lakhs",
    dek: "Most buyers check the flat. Smart buyers check the documents. Index II is a government-issued record that proves a property transaction is legally registered."
  },
  {
    id: "COJT2k5BXFU",
    slug: "the-biggest-home-buying-mistake",
    topic: "home-buying",
    format: "short",
    title: "The biggest home-buying mistake",
    date: "2026-04-06",
    secs: 28,
    home: "/videos/the-biggest-home-buying-mistake",
    dek: "Most buyers do not lose money on a bad property. They lose it on bad timing."
  },
  {
    id: "5yePChXJ5G4",
    slug: "indias-most-unusual-sustainable-furniture-brands",
    topic: "design",
    format: "short",
    title: "India’s most unusual sustainable furniture brands",
    date: "2026-03-26",
    secs: 59,
    home: "/videos/indias-most-unusual-sustainable-furniture-brands",
    dek: "What if waste could become luxury? In this episode of the Home Decor series by Ghar.tv, we explore five Indian furniture brands that are redefining design through sustainability, craftsmanship, and storytelling."
  },
  {
    id: "Ofn605hMpc4",
    slug: "what-rs-1-crore-buys-in-mumbai",
    topic: "market",
    format: "short",
    title: "What ₹1 crore buys in Mumbai",
    date: "2026-03-24",
    secs: 63,
    city: "Mumbai",
    home: "/videos/what-rs-1-crore-buys-in-mumbai",
    dek: "What does ₹1 crore actually get you in Mumbai? From a compact 150 sq ft in South Mumbai to spacious homes in Thane and even larger options near Panvel, the difference is not just price, it’s what you prioritize. Location. Space."
  },
  {
    id: "dvCnV9Yg2rI",
    slug: "why-infrastructure-creates-real-estate-wealth",
    topic: "market",
    format: "short",
    title: "Why infrastructure creates real estate wealth",
    date: "2026-03-18",
    secs: 63,
    home: "/videos/why-infrastructure-creates-real-estate-wealth",
    dek: "Most people buy property based on the building. Smart investors don’t. They track infrastructure."
  },
  {
    id: "FdhGSuC02jQ",
    slug: "the-biggest-interior-design-trends-of-2026",
    topic: "design",
    format: "short",
    title: "The biggest interior design trends of 2026",
    date: "2026-03-13",
    secs: 70,
    home: "/videos/the-biggest-interior-design-trends-of-2026",
    dek: "Home design in 2026 is moving away from cold, minimal spaces. Comfort is returning. Color is back. And homes are becoming more personal than ever."
  },
  {
    id: "07Do4wCSc-A",
    slug: "from-affordable-to-premium-indias-housing-shift",
    topic: "market",
    format: "short",
    title: "From affordable to premium: India’s housing shift",
    date: "2026-03-08",
    secs: 72,
    home: "/videos/from-affordable-to-premium-indias-housing-shift",
    dek: "India’s housing market hasn’t slowed, it has shifted. Affordable housing launches have dropped sharply, while premium homes priced above ₹2 crore are gaining momentum. Why?"
  },
  {
    id: "LRPE-jOjQ78",
    slug: "the-hidden-design-genius-of-90s-indian-homes",
    topic: "design",
    format: "short",
    title: "The hidden design genius of 90s Indian homes",
    date: "2026-03-05",
    secs: 69,
    home: "/videos/the-hidden-design-genius-of-90s-indian-homes",
    dek: "If you’ve ever stepped into a 90s Indian home and thought, “Yeh ghar alag sa feel karta hai,” you’re not imagining it."
  },
  {
    id: "Kq-R93xeJFo",
    slug: "sussanne-khan-x-platinum-corp-design-as-the-luxury-pitch",
    topic: "design",
    format: "short",
    title: "Sussanne Khan x Platinum Corp: design as the luxury pitch",
    date: "2026-02-28",
    secs: 53,
    city: "Mumbai",
    home: "/videos/sussanne-khan-x-platinum-corp-design-as-the-luxury-pitch",
    dek: "Mumbai’s luxury housing market is shifting from square footage to storytelling. With Sussanne Khan partnering Platinum Corp, design is no longer an add-on, it’s a strategic differentiator."
  },
  {
    id: "hRXTchhxKBY",
    slug: "mumbai-3-0-a-rs-30-lakh-crore-expansion",
    topic: "market",
    format: "short",
    title: "Mumbai 3.0: a ₹30 lakh crore expansion",
    date: "2026-02-26",
    secs: 79,
    city: "Mumbai",
    home: "/videos/mumbai-3-0-a-rs-30-lakh-crore-expansion",
    dek: "Mumbai is entering its next chapter. The ambitious “Mumbai 3.0” vision aims to create a massive greenfield city beyond Navi Mumbai, backed by ₹30 lakh crore in planned investments, new infrastructure like Atal Setu and Navi Mumbai Airport,…"
  },
  {
    id: "dDx7yUzq0sg",
    slug: "lodha-villa-cerro-khopoli",
    topic: "project-tours",
    format: "long",
    title: "Lodha Villa Cerro, Khopoli",
    date: "2026-02-23",
    secs: 34,
    city: "Khopoli",
    home: "/videos/lodha-villa-cerro-khopoli",
    dek: "Nestled amidst the scenic Sahyadris, Lodha Villa Cerro unveils private luxury villas designed for expansive, nature-connected living."
  },
  {
    id: "lxuW5ajU6I8",
    slug: "raheja-imperia-at-the-riviere-worli",
    topic: "project-tours",
    format: "long",
    title: "Raheja Imperia at The Riviere, Worli",
    date: "2026-02-21",
    secs: 62,
    city: "Mumbai",
    home: "/videos/raheja-imperia-at-the-riviere-worli",
    dek: "Raheja Imperia, The Riviere Worli rises above South Mumbai as a statement of rarefied living. Sea-facing residences crafted with timeless Georgian elegance meet the drama of panoramic Arabian Sea views and an ever-evolving skyline."
  },
  {
    id: "aUTR7_dXToA",
    slug: "prince-krishna-kunj-goregaon-west",
    topic: "project-tours",
    format: "long",
    title: "Prince Krishna Kunj, Goregaon West",
    date: "2026-02-21",
    secs: 35,
    city: "Mumbai",
    home: "/videos/prince-krishna-kunj-goregaon-west",
    dek: "Located in Jawahar Nagar, Goregaon West, Krishna Kunj offers excellent connectivity and everyday convenience, everything you need, right where you need it."
  },
  {
    id: "kgvrqFRtQug",
    slug: "lodha-villa-cerro-where-land-becomes-legacy",
    topic: "project-tours",
    format: "short",
    title: "Lodha Villa Cerro: where land becomes legacy",
    date: "2026-02-19",
    secs: 85,
    city: "Khopoli",
    home: "/videos/lodha-villa-cerro-where-land-becomes-legacy",
    dek: "Lodha Villa Cerro in Khopoli isn’t vertical living, it’s horizontal luxury. A 25-acre low-density estate in Khalapur, just 90 minutes from South Mumbai via the Mumbai–Pune Expressway, with proximity to Navi Mumbai International Airport and…"
  },
  {
    id: "qdqf8kGHP9w",
    slug: "the-india-us-deal-the-real-estate-angle",
    topic: "market",
    format: "short",
    title: "The India–US deal: the real estate angle",
    date: "2026-02-17",
    secs: 115,
    home: "/videos/the-india-us-deal-the-real-estate-angle",
    dek: "Everyone is discussing the India–US trade deal. But almost no one is talking about its real estate impact. Lower tariffs → higher corporate profits → expansion. Stronger trade → stronger investor confidence."
  },
  {
    id: "DHqhIe4wo0w",
    slug: "bandra-versova-sea-link-mumbais-next-big-trigger",
    topic: "market",
    format: "short",
    title: "Bandra–Versova Sea Link: Mumbai’s next big trigger",
    date: "2026-02-14",
    secs: 89,
    city: "Mumbai",
    home: "/videos/bandra-versova-sea-link-mumbais-next-big-trigger",
    dek: "The Bandra–Versova Sea Link isn’t open yet, completion is expected around 2028. But Western Mumbai’s real estate isn’t waiting."
  },
  {
    id: "m0us2RQGskA",
    slug: "rise-or-fall-reading-mumbais-2026-market-from-the-supply-side",
    topic: "ghartalks",
    format: "long",
    title: "Rise or fall: reading Mumbai’s 2026 market from the supply side",
    date: "2026-02-05",
    secs: 771,
    city: "Mumbai",
    home: "/ghartalks/mumbai-rise-or-fall-2026",
    dek: "Pankaj Kapoor of Liases Foras on whether Mumbai prices have peaked, what 2026 holds and whether to buy now or wait."
  },
  {
    id: "VG-mDYfTXGs",
    slug: "modula-by-jsw-the-modular-home-made-in-india",
    topic: "ghartalks",
    format: "short",
    title: "Modula by JSW: the modular home, made in India",
    date: "2025-11-27",
    secs: 70,
    home: "/videos/modula-by-jsw-the-modular-home-made-in-india",
    dek: "The team behind Modula by JSW on modular homes and how India could build them."
  },
  {
    id: "SsReanHEja0",
    slug: "accorr-on-changing-how-india-builds-facades",
    topic: "ghartalks",
    format: "short",
    title: "Accorr on changing how India builds facades",
    date: "2025-11-25",
    secs: 64,
    home: "/videos/accorr-on-changing-how-india-builds-facades",
    dek: "Accorr, a facade solutions company, on the thinking behind building exteriors in India."
  },
  {
    id: "VS5heqbX1UU",
    slug: "mantra-properties-at-property-expo-2025",
    topic: "ghartalks",
    format: "long",
    title: "Mantra Properties at Property Expo 2025",
    date: "2025-10-09",
    secs: 132,
    home: "/videos/mantra-properties-at-property-expo-2025",
    dek: "Recorded at Homethon Property Expo 2025, hosted by NAREDCO Maharashtra, with the team from Mantra Properties."
  },
  {
    id: "89dPjxzX1aI",
    slug: "srishti-group-on-why-the-buyer-question-changed-before-the-market-did",
    topic: "ghartalks",
    format: "long",
    title: "Srishti Group on why the buyer question changed before the market did",
    date: "2025-10-08",
    secs: 139,
    city: "Mumbai",
    home: "/ghartalks/srishti-group",
    dek: "GharTalks with Srishti Group | Property Expo 2025 | Real estate Podcast | Ghar.tv In this special episode from the Homethon Property Expo 2025 hosted by NAREDCO Maharashtra, we sit down with the visionary team behind Srishti Group, one of…"
  },
  {
    id: "awvpdIuY04k",
    slug: "ad-media-ooh-on-outdoor-advertising-for-real-estate",
    topic: "ghartalks",
    format: "long",
    title: "AD Media OOH on outdoor advertising for real estate",
    date: "2025-10-08",
    secs: 420,
    home: "/videos/ad-media-ooh-on-outdoor-advertising-for-real-estate",
    dek: "Recorded at Homethon Property Expo 2025: AD Media OOH on outdoor advertising and how real estate brands use it."
  },
  {
    id: "NKBc2lcTKZQ",
    slug: "rnk-group-at-property-expo-2025",
    topic: "ghartalks",
    format: "long",
    title: "RNK Group at Property Expo 2025",
    date: "2025-10-08",
    secs: 120,
    home: "/videos/rnk-group-at-property-expo-2025",
    dek: "Recorded at Homethon Property Expo 2025, hosted by NAREDCO Maharashtra, with RNK Group."
  },
  {
    id: "qRWfp5paLc4",
    slug: "parth-developers-at-property-expo-2025",
    topic: "ghartalks",
    format: "long",
    title: "Parth Developers at Property Expo 2025",
    date: "2025-10-08",
    secs: 149,
    home: "/videos/parth-developers-at-property-expo-2025",
    dek: "Recorded at Homethon Property Expo 2025, hosted by NAREDCO Maharashtra, with Parth Developers."
  },
  {
    id: "sUCz1fRxeWo",
    slug: "samraat-group-at-property-expo-2025",
    topic: "ghartalks",
    format: "long",
    title: "Samraat Group at Property Expo 2025",
    date: "2025-10-08",
    secs: 208,
    home: "/videos/samraat-group-at-property-expo-2025",
    dek: "Recorded at Homethon Property Expo 2025, hosted by NAREDCO Maharashtra, with Samraat Group."
  },
  {
    id: "YKmVhuwYJlM",
    slug: "raymond-realty-on-turning-a-mill-land-bank-into-a-township",
    topic: "ghartalks",
    format: "long",
    title: "Raymond Realty on turning a mill land bank into a township",
    date: "2025-10-04",
    secs: 188,
    city: "Thane",
    home: "/ghartalks/raymond-realty-thane",
    dek: "GharTalks with Raymond Realty | Property Expo 2025 | Real estate Podcast | Ghar.tv Welcome to another exclusive episode from Homethon Property Expo 2025, hosted by NAREDCO Maharashtra!"
  },
  {
    id: "tjyHzEItoq0",
    slug: "reading-melbourne-what-an-offshore-market-tells-an-indian-buyer",
    topic: "ghartalks",
    format: "long",
    title: "Reading Melbourne: what an offshore market tells an Indian buyer",
    date: "2025-10-03",
    secs: 640,
    city: "Melbourne",
    home: "/ghartalks/reading-melbourne",
    dek: "GharTalks with Ghar.au | Exploring Melbourne Real Estate | Real estate Podcast | Ghar.tv This one’s special!"
  },
  {
    id: "veiWXyFuxNI",
    slug: "sunteck-on-building-along-a-citys-western-edge",
    topic: "ghartalks",
    format: "long",
    title: "Sunteck on building along a city’s western edge",
    date: "2025-10-01",
    secs: 260,
    city: "Mumbai",
    home: "/ghartalks/sunteck-western-edge",
    dek: "GharTalks with Sunteck Realty | Property Expo 2025 | Real estate Podcast | Ghar.tv In this special podcast episode recorded live at the Homethon Property Expo 2025 by NAREDCO Maharashtra, we sit down with the team from Sunteck Realty to…"
  },
  {
    id: "GtlOqCyET98",
    slug: "khopoli-mumbai-3-0s-investment-secret",
    topic: "market",
    format: "long",
    title: "Khopoli: Mumbai 3.0’s investment secret",
    date: "2025-06-16",
    secs: 213,
    city: "Khopoli",
    home: "/videos/khopoli-mumbai-3-0s-investment-secret",
    dek: "Tired of Mumbai’s sky-high real estate prices, traffic jams, and limited space? This video unlocks why Khopoli is emerging as India’s smartest land investment destination, and this video reveals why it’s happening right now."
  },
  {
    id: "gUl9hFvskhE",
    slug: "5-checks-before-buying-an-under-construction-home",
    topic: "home-buying",
    format: "long",
    title: "5 checks before buying an under-construction home",
    date: "2025-06-04",
    secs: 191,
    home: "/videos/5-checks-before-buying-an-under-construction-home",
    dek: "Booking an under-construction home? Five checks to run first, before the money and the years are committed."
  },
  {
    id: "FfSVVxWKWk8",
    slug: "the-rise-of-women-in-indian-real-estate",
    topic: "market",
    format: "long",
    title: "The rise of women in Indian real estate",
    date: "2025-04-01",
    secs: 93,
    home: "/videos/the-rise-of-women-in-indian-real-estate",
    dek: "Women are leading a quiet change in Indian real estate, from owning homes to running construction firms."
  },
  {
    id: "C7FVHFimsys",
    slug: "buying-a-home-for-rs-10-lakh-in-marathi",
    topic: "home-buying",
    format: "long",
    title: "Buying a home for ₹10 lakh (in Marathi)",
    date: "2025-02-15",
    secs: 132,
    home: "/videos/buying-a-home-for-rs-10-lakh-in-marathi",
    dek: "Budget makes a first home feel out of reach. How to buy a house in India for about ₹10 lakh, explained in Marathi."
  },
  {
    id: "1C2AN6Qio9k",
    slug: "moraj-sea-la-vista-sea-view-deck-homes-at-shivaji-park",
    topic: "project-tours",
    format: "long",
    title: "Moraj Sea La Vista: sea-view deck homes at Shivaji Park",
    date: "2024-08-29",
    secs: 81,
    city: "Mumbai",
    home: "/videos/moraj-sea-la-vista-sea-view-deck-homes-at-shivaji-park",
    dek: "Welcome to Moraj Sea La Vista, a breathtaking blend of luxury and sophistication located in the prestigious Shivaji Park, Dadar."
  },
  {
    id: "J7A1yedj1r0",
    slug: "birla-anayu-malabar-hill",
    topic: "project-tours",
    format: "long",
    title: "Birla Anayu, Malabar Hill",
    date: "2024-08-19",
    secs: 37,
    city: "Mumbai",
    home: "/videos/birla-anayu-malabar-hill",
    dek: "Discover the epitome of luxury living at Birla Anayu, Malabar Hill's latest architectural masterpiece."
  },
  {
    id: "gwKKwHUBTIg",
    slug: "embassy-lake-terraces-hebbal",
    topic: "project-tours",
    format: "long",
    title: "Embassy Lake Terraces, Hebbal",
    date: "2024-07-30",
    secs: 135,
    city: "Bengaluru",
    home: "/videos/embassy-lake-terraces-hebbal",
    dek: "Welcome to Embassy Lake Terraces, where urban sophistication meets futuristic design in Hebbal, North Bengaluru."
  },
  {
    id: "1XMZxJTEBP0",
    slug: "embassy-grove-triplex-villaments",
    topic: "project-tours",
    format: "long",
    title: "Embassy Grove triplex villaments",
    date: "2024-07-29",
    secs: 120,
    city: "Bengaluru",
    home: "/videos/embassy-grove-triplex-villaments",
    dek: "Triplex villaments at Embassy Grove, Kodihalli, Bengaluru: three levels of living in one home."
  },
  {
    id: "q2hVS8w-emM",
    slug: "vue-de-corsa-at-the-riviere-worli",
    topic: "project-tours",
    format: "long",
    title: "Vue de Corsa at The Riviere, Worli",
    date: "2024-06-25",
    secs: 70,
    city: "Mumbai",
    home: "/videos/vue-de-corsa-at-the-riviere-worli",
    dek: "Vue de Corsa at Raheja Imperia 2, part of The Riviere on the Worli skyline by Raheja Universal."
  },
  {
    id: "HtJwuk-pRpI",
    slug: "team-ghar-tv-at-the-india-property-show-dubai-2024",
    topic: "market",
    format: "long",
    title: "Team Ghar.tv at the India Property Show, Dubai 2024",
    date: "2024-04-05",
    secs: 258,
    city: "Dubai",
    home: "/videos/team-ghar-tv-at-the-india-property-show-dubai-2024",
    dek: "Three days at the Dubai World Trade Centre with real estate professionals from around the world, at IPS Dubai 2024."
  },
  {
    id: "UIeByAgxhCg",
    slug: "inside-sonie-thakkars-andheri-home-designed-by-niyati-jagirdar",
    topic: "design",
    format: "long",
    title: "Inside Sonie Thakkar’s Andheri home, designed by Niyati Jagirdar",
    date: "2024-04-01",
    secs: 862,
    city: "Mumbai",
    home: "/videos/inside-sonie-thakkars-andheri-home-designed-by-niyati-jagirdar",
    dek: "A VideoWorks film inside Sonie Thakkar’s Andheri home, and the design choices Niyati Jagirdar of Abhikrama made with her."
  },
  {
    id: "MX3DjZ9qtMY",
    slug: "abhikrama-on-running-a-small-studio-without-shrinking-the-work",
    topic: "ghartalks",
    format: "long",
    title: "Abhikrama on running a small studio without shrinking the work",
    date: "2023-12-26",
    secs: 2800,
    city: "Mumbai",
    home: "/ghartalks/abhikrama",
    dek: "Join \"Talks on Ghar\" with Niyati Jagirdar, Founder of Abhikrama Designs. This insightful discussion captures the core of Abhikrama Designs, showcasing its unique approach to interior design and architecture."
  }
];
