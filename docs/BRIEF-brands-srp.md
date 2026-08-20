# /brands/search — Search Results Page brief

The `/brands` landing has 2 filters + name search only:
- **Category** (7 parents, flat list)
- **City** (marquee list)
- **Search brand** (independent, OR)

When the reader picks any filter, the meta strip shows a **See all matches →** button that jumps to `/brands/search?cat=X&city=Y&q=Z`. That's the SRP.

The SRP is where the full facet set lives. This doc holds the plan we deferred.

---

## SRP filters (in this order)

| Facet | Source | Notes |
|---|---|---|
| **Category** ▾ | 7 parents from PARENTS | Pre-set from `?cat` param. |
| **Sub-category** ▾ | `PARENT_SUBS[cat]` | Only enabled once a category is set. |
| **City** ▾ | CITIES | Pre-set from `?city` param. |
| **Locality** ▾ | `LOCALITIES_BY_CITY[city]` | Only enabled once a city is set. |
| **Recognition** ▾ (multi) | `In Focus / Verified / Featured` | Matches `.brand-card__badge` variants. |
| **Sort** ▾ | Featured first (default) · A–Z · Newest | |
| **Search brand** | Free-text over brand index | Same autocomplete pattern as `/brands`. |

Reset all + result count + a Save-search bookmark link (later).

---

## Sub-category taxonomy (source of truth)

Seeded from `docs/DESIGN-taxonomy.html` and the planned brand adds — NOT scraped from cards. This means the SRP surfaces the full menu even when cards are sparse; empty states drive `share your project brief` conversions.

```js
var PARENT_SUBS = {
  materials: ['Paints & surfaces','Tiles & panels','Ceramic tiles','Sanitaryware','Bathware','Wallcoverings','Glass & glazing','Concrete surfaces','Quartz surfaces','Stone & cladding','Wood & plywood','Modular kitchens','Fittings & hardware','Waterproofing','Roofing'],
  furniture: ['Furniture houses','Luxury furniture','Sofas & seating','Dining','Bedroom','Storage','Outdoor','Kitchen cabinets','Decor & accessories','Carpets & textiles','Art & objects'],
  lighting:  ['Chandeliers','Decorative lighting','Task lighting','Architectural lighting','Outdoor lighting','Smart lighting','Switches & fixtures'],
  interior:  ['Interior design studios','Architects','Landscape design','Turnkey interiors','Design-build','Home renovation','Modular interiors'],
  finance:   ['Home loans','Refinance','Loan against property','Home insurance','NBFCs'],
  proptech:  ['Listings platforms','CRM & sales tech','Marketing tech','Virtual walkthroughs','Analytics','Property management'],
  vastu:     ['Vastu consulting','Acoustics','Sustainability & wellness','Water treatment']
};
```

---

## Localities per city (marquee)

Free-text tolerated. This list is the recognised set the SRP surfaces up-front; anything else lives on the brand's `data-locality` attribute and matches by exact string.

```js
var LOCALITIES_BY_CITY = {
  'Mumbai':    ['Bandra West','Bandra East','Andheri West','Malad West','Juhu','Powai','Worli','Lower Parel','Colaba','Chembur'],
  'Delhi NCR': ['Vasant Kunj','Chattarpur','Gurgaon','Noida','Greater Noida','South Delhi','Dwarka'],
  'Bengaluru': ['Koramangala','Indiranagar','HSR Layout','Whitefield','Jayanagar','Sadashivanagar'],
  'Chennai':   ['T. Nagar','Adyar','Nungambakkam','ECR','OMR'],
  'Hyderabad': ['Jubilee Hills','Banjara Hills','Gachibowli','HITEC City','Kokapet'],
  'Pune':      ['Kalyani Nagar','Koregaon Park','Baner','Kharadi','Viman Nagar'],
  'Kolkata':   ['Salt Lake','Alipore','New Town','Ballygunge'],
  'Ahmedabad': ['SG Highway','Bodakdev','Vastrapur','Prahlad Nagar'],
  'Multi-city':[]
};
```

---

## Category-accordion pattern (deferred from /brands)

We tried a two-dropdown "Category + Sub-category" and then a single accordion pattern on `/brands`. Both were removed to keep the landing bar minimal (2 dropdowns + name search + `See all matches →`). The accordion pattern is preserved here for the SRP build.

**Interaction spec:**
- Panel shows 7 parent rows.
- **Click parent row** → picks parent, closes panel. Fastest path.
- **Click ▸ chevron** on the row → expands that parent's sub-list inline underneath. No selection change. Only one parent expands at a time.
- **Click a sub in the expanded list** → picks parent + sub, closes panel.
- Trigger label: `All categories` | `Interior design & architecture` | `Interior design & architecture · Architects`.

Full HTML + CSS + JS available in git history — the working commit was on `main` before we simplified `/brands`. Search the git log for "cascading form-input filter bar" or "accordion pattern".

---

## URL contract

`/brands` writes to `/brands/search?cat=X&city=Y&q=Z`. The SRP reads these params on load and pre-populates:
- `cat` → parent id (matches PARENTS[i].id)
- `city` → city label (matches CITIES[i])
- `q` → free-text name query

Absent params → SRP shows all brands. This lets us deep-link from other surfaces (nav search, off-canvas, editorial pieces, "Brands in Bandra West" curated pages).
