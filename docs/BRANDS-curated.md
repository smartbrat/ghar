# Curated Brands & Businesses Register

> Single source of truth for every brand / business the Ghar.tv team has met or curated for the platform. Maintained by hand. Append new brands as they're met.
>
> **Last update:** 2026-07-07 &mdash; added partner-brand section (Abhikrama, Scarlet Splendour) tied to the new `brand-profile.html` microsite template.
> **Source of business cards:** ACE Tech 2025 + Design Mumbai 2025 (+ photos of cards from the same period)
> **Raw sheet:** https://docs.google.com/spreadsheets/d/12tR8ERqL2nCLLwK20wIS96lKsiTuEszblr4E8uBksiU/edit?gid=0#gid=0
> **Raw CSVs in repo:** `.playwright-mcp/Event-Data---ACE-Tech.csv`, `.playwright-mcp/Event-Data---Design-Mumbai-Contact.csv`

---

## How brands map to Ghar.tv (the AD-derived rule)

Every brand becomes **one Brand record** at `/brands/{slug}` and **one Person record** at `/people/{founder}` — that's their permanent home. They surface across the platform via **tag queries**, never via category folders. The 6 tag dimensions are: **Discipline · Format · Material/Medium · Style · Region · Audience**. See `docs/DESIGN-taxonomy.html` for the full system.

Per the rule: a brand's surface placement is **derived from its tags**, not assigned. The columns below are the tags the brand carries — the placement column shows where those tags currently route them on `/design`.

---

## Pre-existing (older) brand set — `brand_assets/brands/`

These 16 brands had logos / assets in the repo before the event-business-card extraction. Most are larger national / mass-premium brands — they overlap with `/buyers` and `/services` verticals too.

| Brand | Discipline | Material | Format | Region | Audience | Primary surface |
|---|---|---|---|---|---|---|
| Asian Paints | paints, surfaces | paint | manufacturer | pan-india | mass-premium | `/design/material/paint-finishes` + `/brands/asian-paints` |
| Godrej Properties | (developer) | — | developer | pan-india | premium | `/buyers` + `/brands/godrej-properties` — surfaces in design only via Developer-Designed Homes series |
| Prestige Group | (developer) | — | developer | pan-india | premium | Same as Godrej |
| HDFC Bank | (finance) | — | financial-institution | pan-india | mass | `/services/finance` — not a design surface |
| Havells | lighting, electrical | lighting | manufacturer | pan-india | mass-premium | `/design/material/lighting` |
| Saint Gobain | glass, surfaces | glass | manufacturer | pan-india | mass-premium | `/design/material/glass-glazing` |
| Square Yards | (proptech) | — | service | pan-india | mass | `/buyers` — not a design surface |
| Livspace | interior-design | — | service | pan-india | premium | `/brands/livspace` only |
| Aluminr | hardware, architectural-metal | metal | manufacturer | pan-india | premium | `/design/material/metalwork` |
| Sources Unlimited | furniture | — | retailer | pan-india | luxury | `/design/material/furniture` |
| Hey Concrete | architectural-material | concrete | manufacturer | pan-india | premium | `/design/material/concrete` |
| House of Things | furniture, decor | — | retailer | pan-india | premium | `/design/discipline/furniture` |
| House of Edwa | decor, textiles | textiles | atelier | pan-india | premium | `/design/material/wallcoverings` / `/design/discipline/textiles` |
| Amore Muro | wallcoverings | wallcovering | manufacturer | pan-india | premium | `/design/material/wallcoverings` |
| Specta | stone, cladding | stone | manufacturer | pan-india | premium | `/design/material/stone-cladding` |
| Jaakhi | indian-crafts | textile, craft | atelier | pan-india | luxury | `/design/material/indian-crafts` |

---

## ACE Tech 2025 — 45 brands (extracted from event sheet)

| Brand | Industry / what they do | PoC | Contact | Discipline | Material | Format | Surface |
|---|---|---|---|---|---|---|---|
| Rise | IT & Digital Marketing | Sandip Kumar De | 8657647009 / sandeepkumar.de@riseit.in | (services) | — | service | Not /design — `/services` or `/partner/design` ops |
| Ultrasil | Metal Facade | Harpal Vaghela | 7433029826 / metalfacade@ultrasil.co.in | architecture, hardware | metal | manufacturer | `/design/material/metal-facade` |
| NEJÉ | Lighting Co. | Aarti | 9833164363 / info@nejelighting.com | lighting | — | manufacturer | `/design/material/lighting` |
| Pride Electronics | LED Lighting Solutions | Naresh Jiandani | 9820062959 / prideelectronics@hotmail.com | lighting | LED | manufacturer | `/design/material/lighting` |
| Keshari | Laminate & Veneer | Suresh Pardeshi | 9898182013 / keshariveneer@gmail.com | surfaces | wood, laminate | manufacturer | `/design/material/laminates` |
| Dinamoo | Studio (creative direction) | Siddharth Lunkad (Co-Founder & Creative Director) | 9753470000 / siddharth@dinamoo.in | branding, interior-design | — | studio | `/design/designers` |
| Unidus | Acoustics | Siddharth Gupta (Director) | 9810637376 / sid@unidusindia.com | acoustics, interior-design | — | manufacturer | `/design/material/acoustics` |
| SV Modutech | (modular construction) | Vikas M. Mistry (Director) | 9687444002 / info@svmodutech.com | construction | — | manufacturer | `/design/material/construction-systems` |
| NTURM Engineers | Scaffolding & Formwork | Niteshsingh Mehra (Sales Manager) | 7208331960 / nitesh@nturm.com | construction-engineering | — | service | `/design/discipline/construction` (Guides pillar) |
| Decoraids | Tiles, panels, coverings | Hardik Sheth (MD) | 9033330165 / hardik.sheth@decoraids.in | surfaces | tile, panel | manufacturer | `/design/material/tiles-ceramics` |
| Najaranu | (decor / lifestyle) | Samprati Doshi (Founder) | 7698899992 / team@najaranu.com | decor | — | studio | `/design/discipline/objects` |
| Hettich | Hardware (kitchen, furniture fittings) | Rahul Thakkar (Director-Sales) | 8980848484 / rahul.thakkar@hettich.com | hardware | — | manufacturer | `/design/material/hardware-fittings` |
| Vastu Raviraj | Vastu Shastra (authority) | Ar. Sunraj Ahirrao (Director) | 9819343834 / sunraj.ahirrao@vasturaviraj.in | vastu | — | consultancy | `/design/vastu` (pillar — authority directory) |
| Hetal Shukla | Art Installations | Hetal Shukla | 9821354319 / hetal.artist@gmail.com | art, sculpture | — | solo-practice | `/design/discipline/art` |
| Puja Enamels | Enamel artistry | Puja Sshah | 9136925232 | art, surfaces | enamel | atelier | `/design/discipline/art` |
| Navgrun | Artistic solar panels (BIPV) | Neeksha Vikram | 9364879638 / bipvproducts@navgrun.com | sustainable, lighting | solar | manufacturer | `/design/material/sustainable-tech` |
| Studio Auttam | Art | Isha Patel | 9630899999 / info@studioauttam.com | art | — | atelier | `/design/discipline/art` |
| Porcious | (porcelain tiles) | Dharmendra Rathore (RSM) | 9070029700 / dharmendra.rathore@porcious.com | surfaces | porcelain | manufacturer | `/design/material/tiles-ceramics` |
| R Square | UPVC Fins | Karan Patel (MD) | 8591283263 / rsquareupvcfins@gmail.com | architecture, surfaces | UPVC | manufacturer | `/design/material/doors-windows` |
| Lunar Ceramics | (ceramic tiles) | Mr. Anand Patel | 9099059008 / lunarceramics@yahoo.in | surfaces | ceramic | manufacturer | `/design/material/tiles-ceramics` |
| Changi Lighting | Lighting | — | 9833036002 / info@changilighting.com | lighting | — | manufacturer | `/design/material/lighting` |
| Johnson (HR Johnson) | Tiles & Bathware | Natasha Jalgaonkar (Dy Mgr) | 8655629201 / jalgaonkar.natasha@hrjohnsonindia.com | surfaces, sanitaryware | tile, ceramic | manufacturer | `/design/material/tiles-ceramics` + `/design/material/sanitaryware` |
| Painting Drive | Coatings | Tripur Sawant | 9920057672 / info@paintingdrive.com | paints, surfaces | paint | service | `/design/material/paint-finishes` |
| Shri Swami Bricks | Brickwork | Kishor D. Kapade | 9422959373 / shriswamibricksindustries@gmail.com | architecture, surfaces | brick | manufacturer | `/design/material/brick` |
| Pranaa | Greenspaces | Naveen Kumar Makoriya | 7738681391 / naveen.makoriya@worldofpranaa.com | landscape, sustainable | — | service | `/design/discipline/landscape` |
| Cosmos | Construction Machinery & Aluminium Formwork | Keshav Tidke (BDM) | 9172888070 / keshav@cosmossales.com | construction-engineering | — | manufacturer | `/design/discipline/construction` (Guides pillar) |
| Accorr | Door, Window, Façade | Vishal Kassundra (PM) + Nikunj Damania | 9081991009 / 9930771913 | architecture, surfaces | — | manufacturer | `/design/material/doors-windows` |
| Schach Engineers | Engineering services | Chandan Sinha (AVP) | 7304997614 / c.sinha@schachengineers.com | engineering | — | consultancy | `/design/discipline/construction` (Guides pillar) |
| Sparten | (granito tiles) | Hitesh Patel (Marketing Head) | 9512400444 / info@spartengranito.com | surfaces | granito | manufacturer | `/design/material/tiles-ceramics` |
| Metro Floor Tiles | (floor tiles) | Chirag Shah (BDO) | 9979843259 / metrofloortiles@gmail.com | surfaces | tile | manufacturer | `/design/material/tiles-ceramics` |
| Racy Sanitarywares | Sanitaryware | Milan Kaila (Director) | 9714244954 / racysanitaryware@gmail.com | sanitaryware | — | manufacturer | `/design/material/sanitaryware` |
| Zarna's | Art & Accessories | Zarna Mody Doshi | 9867320331 / zarnasart@gmail.com | art, decor | — | atelier | `/design/discipline/art` |
| HIFC (Home India Furniture Co.) | Furniture | Akempreet Singh (Owner) | 9464693100 / akempreet@hotmail.com | furniture | — | manufacturer | `/design/material/furniture` |
| Sculptico | (sculpture) | Nishant Dighe (Director) | 9967352257 / info@sculptico.art | art, sculpture | — | atelier | `/design/discipline/art` |
| Chiripal Design | Interior & Architecture | Chirag Chiripaln | 9662220234 / expert@chiripaldesign.com | architecture, interior-design | — | studio | `/design/designers` |
| Lifekrafts | (decor) | Naveen Kumar S (Marketing) | 6366967357 / sales02@lifekrafts.com | decor | — | manufacturer | `/design/discipline/objects` |
| S. Hashmi | Metal Nail Artist | S. Hashmi | 9893011246 / shashmiarts@gmail.com | art | metal | solo-practice | `/design/discipline/art` |
| Modula | (modular furniture) | Suraj Kumar (Sales Manager) | 9570164215 / suraj.kumar@modula.in | furniture | — | manufacturer | `/design/material/furniture` |
| Gorealla | AI (proptech) | Balaji Ratnam + Ankit Shah (Co-founders) | 9820189719 / 9870308810 | tech, proptech | — | service | Not /design — `/intelligence` or `/services` |
| Decor'it | Laminates | — | 7045989513 / hello@decoritlaminates.com | surfaces | wood, laminate | manufacturer | `/design/material/laminates` |
| The Art Society of India | (art society) | Kishore Ghankutkarn (Mgmt Cmte) | 9833121650 / theartsocietyofindia@gmail.com | art | — | gallery | `/design/discipline/art` |
| Unishield Pro | (protective coatings) | — | 9769664400 / unishield@bhikshutechnology.com | paints, surfaces | coating | manufacturer | `/design/material/paint-finishes` |
| Creative Slices | (creative agency) | Mautushi Sen | 9820362650 | branding | — | studio | `/design/designers` |

---

## Design Mumbai 2025 — 20 brands

| Brand | Industry / what they do | PoC | Contact | Discipline | Material | Format | Surface |
|---|---|---|---|---|---|---|---|
| Vibrant Technik | Contemporary Architectural Material | Narasimha Santosh Batchu (RM) | 7728060018 / narasimha@vibrant-technik.com | surfaces, architecture | — | manufacturer | `/design/material/architectural-materials` |
| Muura | Workplace Acoustics & Furniture | Bonni Aquib (VP) | 9650760209 / bonni@muura.in | acoustics, furniture | — | manufacturer | `/design/material/acoustics` + `/design/spaces` (workplace) |
| Baccarat | Crystal / luxury décor | Yashwant Kumar (Store Mgr) | 9220729800 / yashwant.kumar@luxabode.in | decor, lighting | crystal | retailer | `/design/discipline/objects` (luxury audience) |
| Taamaa | Lifestyle | — | 9319490782 / lifestyle@taamaa.in | decor | — | retailer | `/design/discipline/objects` |
| Lagom | Balanced Opulence, Timeless Style | (Business Manager) | 9071027102 / contactus@lagom.in | decor, furniture | — | retailer | `/design/discipline/objects` (luxury) |
| Sabbi | Surface & Design | Anjini Khanna (Founder) | 9518376976 / anjini@sabbi.in | surfaces | — | atelier | `/design/material/wallcoverings` |
| Studio 19 | Workplace design | Riddhi Sampat (Sr BDM) | 9004316665 / riddhi@studio19offices.com | interior-design, workplace | — | studio | `/design/spaces` (Workplace) |
| Jasmine Jhaveri | Design Studio (interior stylist) | Jasmine Jhaveri | studio@jasminejhaveri.com | interior-design | — | solo-practice | `/design/designers` |
| Fazo Project | Handmade Rugs | Fatima Warsi (Partner) | 9899292774 / fatima@fazoproject.com | textiles | textile, rug | atelier | `/design/material/rugs-textiles` |
| Hobo Houz | Pen Art, Textiles & Installation | Varsha Patra | 8897467890 / varsha@hobohuz.com | art, textiles | textile | solo-practice | `/design/discipline/art` |
| Venjara Carpets | Hand Crafted Rugs to Wooden Floors | Aishaa Nensey (Mktg Dir) | 9619476111 / aishaa@venjaracarpets.com | textiles, surfaces | textile, wood | manufacturer | `/design/material/rugs-textiles` |
| Chacko | (unspecified) | Vipin Joe | 9920455407 / mail@chacko.co.in | — | — | — | TBD on follow-up |
| Stonelite | (stone) | Priti Shah | 9223494386 | surfaces | stone | manufacturer | `/design/material/stone-cladding` |
| Source Designs | Light, Furniture, Home Decor | Prachi Batra | 9920645389 / info.sourcedesigns@gmail.com | lighting, furniture, decor | — | retailer | `/design/discipline/furniture` |
| Muse Create | Artist & Interior Designer | Ishika Agrawal (Founder) | 8966908873 / ishika@musecreate.co | interior-design, art | — | solo-practice | `/design/designers` |
| MYCEL | (international — sustainable material) | Yonghwan Jin | 82-10-3719-4948 / yonghwan.jin@mycel.earth | sustainable, surfaces | mycelium | manufacturer | `/design/material/sustainable-materials` |
| Natuzzi | Furniture | Ruta Hardikar (Sales) | 9594974284 / sales.natuzzi@ultimatefurniture.co.in | furniture | — | manufacturer | `/design/material/furniture` (luxury) |
| Studioworks | Furniture & Interior Product | — | 9638882388 / info@studioworks.co.in | furniture, interior-design | — | studio | `/design/material/furniture` |
| Lux Temporis | 4D Lights | Dorothee Giey (Co-founder/CEO) | 33-674641749 / dorothee@luxtemporis.com | lighting, art | — | atelier | `/design/material/lighting` + `/design/discipline/art` |
| LightForms | Lighting | Ajay Arora (MD) | 9872800488 / ajay@lightforms.com | lighting | — | manufacturer | `/design/material/lighting` |

---

## Brands from earlier mentions (worked examples in past sessions)

| Brand | Industry / what they do | Source | Discipline | Material | Format | Surface |
|---|---|---|---|---|---|---|
| MCM Flexi Cladding India Pvt. Ltd. | Flexible cladding (façade material) | User mentioned 2026-05-28 (business card) | architecture, surfaces | cladding | manufacturer | `/design/material/cladding` (worked example — see `docs/DESIGN-taxonomy.html`) |
| Studio FOV | Architectural model making + 3D walkthrough services | User mentioned 2026-05-27 (studiofov.com) | service, model-making | scale-model, 3d-walkthrough | service / studio | `/brands/studio-fov` + `/design/series/studio-visit` (does NOT get a discipline hub) |
| Anchor Switches | Switches | User mentioned 2026-05-27 | switches, hardware | — | manufacturer | `/brands/anchor-switches` + `/design/material/switches-fittings` |
| Terrain.art | Digital art / gallery | User mentioned 2026-05-27 (terrain.art) | art | digital | gallery | `/brands/terrain-art` + `/design/discipline/art` (gallery format) |
| Jaquar | Bath fittings / sanitaryware | Used as sponsored-native worked example 2026-06-02 | sanitaryware | — | manufacturer | `/design/material/sanitaryware` |

---

## Ghar.tv partner brands (worked with directly — VideoWorks / GharTalks / profile)

These are brands Ghar.tv has produced media for or has an active partner relationship with. They surface everywhere the media they anchor surfaces (podcast episode → /ghartalks + /brands/{slug}, film → /videoworks + /brands/{slug}). They also have a full **/brands/{slug} microsite** — see `brand-profile.html` template.

| Brand | Industry / what they do | Ghar.tv media | Discipline | Format | Region | Surface |
|---|---|---|---|---|---|---|
| Abhikrama | Architecture &amp; interior design studio | GharTalks episode (YouTube: `MX3DjZ9qtMY`) | architecture, interior-design | studio | Bengaluru | `/brands/abhikrama` + `/ghartalks/abhikrama` + `/design/designers` |
| Scarlet Splendour | Luxury furniture house (Kolkata) | Featured demo for the brand-profile template · VideoWorks (Teatro Scarlet short) · GharTalks (Ashish Bajoria episode) · Architecture &amp; Design editorial | furniture, luxury-decor | atelier, luxury-house | Kolkata HQ · global sales | `/brands/scarlet-splendour` + `/design/material/furniture` (luxury audience) + `/videoworks` + `/ghartalks` |

**Notes**:
- Scarlet Splendour is the featured demo brand for `brand-profile.html` (the microsite template). Real assets are wired: `brand_assets/brand-photos/scarlet-splendour-hero.png`, `brand_assets/brands/scarlet-splendour.png`. Collection thumbnails + designer portraits pulled from `scarletsplendour.com`.
- Abhikrama's public site is currently a placeholder ("Coming soon"). The GharTalks episode (`MX3DjZ9qtMY`, titled "Abhikrama") is their real Ghar.tv media asset — it drives the brand card and the profile page's featured film. Update this row when the brand's own site launches.

---

## How to add a new brand

1. Get the business card or sheet row.
2. Create a row in this file with the brand, what they do, PoC, contact.
3. Assign tags across the 6 dimensions (Discipline · Format · Material · Style · Region · Audience). Use existing tags in `docs/DESIGN-taxonomy.html`. If a new tag is genuinely needed, propose it — controlled vocabulary, never free-text.
4. The "Surface" column derives from the tags. No new categories required.
5. Their permanent home is `/brands/{slug}` regardless of where they surface.

---

## Counts (as of 2026-06-10)

- Pre-existing assets: **16** brands
- ACE Tech 2025: **45** rows (~43 unique companies after dedup)
- Design Mumbai 2025: **20** rows
- Earlier worked examples: **5**
- **Total addressable pool:** ~84 unique brands (the "106-brand pool" mentioned in older todos counted the business-card photos which I no longer have raw access to — that figure included those photos)
