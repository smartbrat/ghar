# Ghar.tv Homepage Search — Full Handoff (PHP / MySQL / JS)

> Single guide for shipping the redesigned homepage search into the existing
> PHP/MySQL/JS codebase. All logic is in **`main.js`** (built → `dist/main.min.js`),
> styles in **`styles.css`**, search + modal markup in **`index.html`**, and the
> shared carousel engine in **`ghar-carousel.js`**.
> Search `main.js` for the banner `SEARCH BACKEND INTEGRATION` — that block is
> the one place you wire the backend.
>
> **This is the single, consolidated search handoff** — backend wiring *and*
> front-end architecture (mobile modal, shared carousel chassis, Recent
> Searches). It supersedes the former `SEARCH-MODAL-HANDOFF.md`.

---

## 0. TL;DR for the busy dev

1. The **URL contract is UNCHANGED** from your current live search — the new UI
   hands off to the exact same `searchpropbo.php` / `viewpropertydec.php` pages.
   So your backend needs **no changes**.
2. Adopt the new **`main.js` + `styles.css` + the search markup in `index.html`**,
   then do 3 small wiring steps: inject real `DATA`, set 2 id-maps, (optionally)
   point the type-ahead at endpoints. Rebuild, bump `?v=`.
3. Everything new (city picker, locality hierarchy, validation alerts, chips) is
   pure front-end and rides on top of that same contract.

Verified output (localhost, mock ids):
```
searchpropbo.php?cityid=mumbai&propertysaleid=1&propertytypeid=1&locids=loc_gw&sublocids=loc_jaw
viewpropertydec.php?robprojname=okiw9487prj_rex
```

---

## 1. What changed this round (feature changelog)

| # | Feature | User-facing behaviour |
|---|---------|----------------------|
| 1 | **City picker redesign** | Two-column "Start with your city" panel: left = search + popular-city **icon tiles** (3×3, building silhouettes + alt names like *Bangalore/MMR*); right = **Explore by category** list + a **Find Agents** button pinned bottom. Vertical divider between. |
| 2 | **City type-ahead** | Prefix-matches first, **alt-spelling aliases** (`bangalore→Bengaluru`, `bombay→Mumbai`, `madras→Chennai`…). Heading flips **Popular cities → Search results**; results render as a full-width list that handles long names. |
| 3 | **Locality hierarchy + refine** | City › Locality › Sub-locality. Typing matches **every level** with a breadcrumb ("Jawahar Nagar · Goregaon West"). A **"N areas ›"** pill drills into a locality's sub-areas (back link + "All of X"). Multi-select at any level → chips. |
| 4 | **Submit validation** (desktop + mobile) | A half-typed locality can't run a search. 1 match → auto-selects; many → inline alert *"Pick a location…"*; none → *"No exact match"* + **Search all of city** fallback. Inline red-badge alert (not a silent toast). |
| 5 | **Backend submit wiring** | `buildSearchUrl()` + `executeSearch()` emit the existing contract; `routeToProject()` opens the project page. Isolated in one config block. |
| 6 | **Chips polish** | Close icon is a crisp centred **SVG ×** (was the off-centre `&times;` glyph); right padding tightened so the × hugs the pill end. Applies to all chips (desktop bar, desktop panel, mobile). |
| 7 | **Mobile "Where?" rebuild** | Calmer/focused: light "Searching in <city> · Change" context, search field as primary, "SELECTED" chips with aligned "Clear all", suggestions, single full-width **Continue** at the bottom. |
| 8 | **Misc fixes** | Placeholder "Add a locality, project or pincode" after a city is picked; removed a stray focus-outline "(" artifact on `#whereInput`; hover-shadow no longer clipped in the city grid; removed the "or" text on the divider. |
| 9 | **Modal carousel-chassis reuse** | The mobile modal's chip rails now use the shared `ghar-carousel.js` engine (drag, swipe, arrows) instead of a bespoke copy. See §8. |
| 10 | **Desktop modal = centered card** | At ≥744px the modal becomes a dim-backdrop 720px centered card (was full-screen). Defined once in `styles.css`. See §8. |
| 11 | **Chip-tap reliability** | `clickSlopPx: 12` so a slightly jittery thumb tap on a chip registers as a tap, not a swipe. See §8. |
| 12 | **Recent Searches** | Device-local search history at the top of the empty state, one tap to re-run. See §9. |
| 13 | **Sign In modal full-screen on mobile** | `height: 100dvh` (dynamic viewport — accounts for the mobile URL bar) at `≤743.98px`. Was capped at `max-height: 100vh` so the modal collapsed to content height and the page leaked through below. Breakpoint widened from 480px → 743.98px to match the rest of the site. The Search modal already behaves this way. Collections modal stays a bottom sheet (browse pattern, not task). |
| 14 | **Mobile search-pill size unified** | Compact pill (`padding: 10px 28px` on `#mobSearchTrigger`, `6px 20px 8px` on `#mobSearchRow`) now applies to every page on phones — was previously gated behind `body.simple-nav` so only inner pages got it. The homepage used to render a taller pill. Single source in `styles.css` now; no `body.simple-nav` qualifier left. |

Commits: `b1e7d2a` (URL contract) · `4b64494` (modal chassis reuse + desktop card) · `4ca4a7b` (clickSlopPx + card consolidation) · `27382f3` (Recent Searches) · `1a9d730` (Sign In full-screen) · `109d1ab` (pill size unified).

---

## 2. Files & where each feature lives

| File | What's in it |
|---|---|
| `main.js` | **All** search logic (source of truth). Build → `dist/main.min.js`. |
| `styles.css` | `.where-prompt` (validation alert + keyframes), `.city-chip:hover`, `#searchBar #whereInput:focus-visible` reset. Build → `dist/styles.min.css`. |
| `index.html` | The search-bar markup + the **mobile modal** (`#mobileModal`) markup, and the `<script>/<link>` tags with `?v=` cache-busters. `design.html` / `design-article.html` carry the **same** modal markup, byte-identical (§8). |
| `ghar-carousel.js` | Shared carousel engine (`window.initCarousel`) used by the modal chip rails **and** every section rail. Loaded per page (not bundled into `main.min.js`). |
| `dist/*` | Minified build outputs — **don't hand-edit**; regenerate with `npm run build`. |

Key functions/consts in `main.js` (so you can locate things):

- **Config:** `SEARCH_ENDPOINT`, `PROJECT_ENDPOINT`, `PROJECT_PREFIX`, `MODE_ID`, `TYPE_ID`, `IS_DEV`
- **City data/tiles:** `DATA`, `TEMP_CITY_NAMES`, `POPULAR_CITIES`, `CITY_ICONS`, `CITY_POP_LABEL`, `CITY_SUB`, `CITY_ALIASES`, `cityIcon()`, `cityLabel()`, `cityLookup()`, `cityTileHTML()`, `cityRowHTML()`
- **Hierarchy:** `locById()`, `locChildren()`, `locHasChildren()`, `locBreadcrumb()`, `buildSugg()`, `locRowHTML()`, state `refineParent`
- **Submit:** `buildSearchUrl()`, `executeSearch()`, `routeToProject()`, `attemptSearch()` (desktop), `mobSubmitSearch()` (mobile)
- **Chips:** `CHIP_X`, `renderChips()`, `renderSelectedRowInPanel()`, `mobRenderSelectedChips()`
- **Validation alert:** desktop via `wherePrompt` state in `renderPanel()`; mobile via `mobShowWherePrompt()` + `mobSearchCitywide()`
- **Mobile:** `mob` state (incl. `refine`), `mobBuildSugg()`, `mobLocRowHTML()`, `mobRenderAcSuggestions()`, `mobRefine()`, `mobRefineBack()`, `mobOnLocInput()`, `mobSelect*()`
- **Recent Searches:** `recordRecentSearch()` (save, called in `executeSearch()`), `recentsDeskHTML()` / `recentsMobHTML()` (render), `goRecent()` / `window.goRecentMob`, `recentsLoad()` / `recentsSave()` (localStorage `ghar:recentSearches`) — §9
- **Shared carousel chassis:** `window.initCarousel()` in `ghar-carousel.js`; the modal-helper IIFE (in each page's `<script>`) wraps the chip rails — §8

---

## 3. Backend contract (UNCHANGED — kept from your live search)

```
Results : searchpropbo.php?cityid=<id>&propertysaleid=<id>&propertytypeid=<id>
                           &locids=<csv>&sublocids=<csv>[&pincode=<code>]
Project : viewpropertydec.php?robprojname=okiw9487<projectId>
```

`locids` / `sublocids` are **two INDEPENDENT comma lists** (verified against live
`searchpropbo.php`) — NOT positionally paired, no `0` padding, parent NOT injected:

| User picked | goes into | the other list |
|---|---|---|
| Whole locality (e.g. *Andheri West*) | `locids` ← its own id | left as-is |
| Sub-area (e.g. *Jawahar Nagar*) | `sublocids` ← its own id | left as-is (parent NOT added) |

Verified live formats:
```
locids=26,90 & sublocids=          ← two whole localities
locids=       & sublocids=17,177   ← two sub-areas (own ids; backend resolves parents)
```

This is produced by `buildSearchUrl()`. If you ever rename params, that's the only
function to touch.

---

## 4. Integration in 4 steps

### Step 1 — Config block (`main.js`, banner `SEARCH BACKEND INTEGRATION`)
```js
const SEARCH_ENDPOINT="searchpropbo.php";
const PROJECT_ENDPOINT="viewpropertydec.php";
const PROJECT_PREFIX="okiw9487";
const MODE_ID={buy:"1",rent:"2"};                  // → propertysaleid
const TYPE_ID={homes:"1",workspaces:"2",land:"3"}; // → propertytypeid
```
➡ Set `MODE_ID` / `TYPE_ID` to your real MySQL ids (currently 1/2/3 placeholders).

### Step 2 — Inject real `DATA`, delete the temp list
Replace the mock `DATA` object + the `TEMP_CITY_NAMES` block with PHP-injected
data of the same shape, e.g. before `main.js`:
```php
<script>var DATA = <?= json_encode($cities) ?>;</script>
```
Then delete everything between `TEMP CITY START` and `TEMP CITY END`. (See §5.)

### Step 3 — (Optional) point the type-ahead at endpoints
Both filter the in-memory `DATA` today. For large datasets, swap their bodies for
debounced fetches; **keep the return shapes identical**:

| Function | Endpoint suggestion | Returns |
|---|---|---|
| `cityLookup(q)` | `GET /api/cities?q=` | `[cityKey, …]` (ranked) |
| `buildSugg(c,q)` / `mobBuildSugg(q)` | `GET /api/suggest?cityid=&q=` | `{locations[], projects[], pincodes[], refine}` |

If you pre-load each city's localities into `DATA[city].locations`, you can leave
these as-is.

### Step 4 — Build & cache-bust
```
npm run build         # writes dist/main.min.js, dist/styles.min.css, dist/tailwind.css
```
Then bump the `?v=` numbers in `index.html` for `main.min.js` and `styles.min.css`.
**Note (Tailwind):** `tailwind.css` is *purged* — if you add a new Tailwind class
in markup, it won't apply until you `npm run build:tailwind`. The codebase favours
inline styles for one-off panel tweaks to avoid this.

---

## 5. Data shapes (what the backend injects)

```js
DATA = {
  "mumbai": {                        // key = city slug (used in URL bar + icon map)
    cityName: "Mumbai",
    cityid: 21,                      // ← numeric MySQL id → ?cityid= (falls back to key if absent)
    locations: [
      { id: 101, name: "Goregaon West", parent: null },  // top-level locality
      { id: 109, name: "Jawahar Nagar",  parent: 101 },  // sub-area → parent = 101
      …
    ],
    projects:  [ { id: 5001, name: "Raheja Exotica", micro: "Madh Island",
                   category: "residential", availability:{buy:true,rent:true} } ],
    pincodes:  [ { id: 9001, code: "400062", area: "Goregaon West" } ]
  },
  …
}
```
- `parent: null` = top-level locality; `parent: <id>` = sub-area of that locality. Any depth supported.
- `cityid` is what goes in the URL. If you key `DATA` by numeric id, you can omit `cityid`.
- Cities without sub-localities just behave flat — fully backward compatible.
- `CITY_ICONS` / `CITY_SUB` / `CITY_ALIASES` are keyed by the city slug — extend for new popular cities (others fall back to a generic building icon, no alt name).

### 5.1 City icons — read this before you go looking for an icon folder

**There is no icon folder, no image files, no icon font, no CDN.** Every city icon
is hand-drawn **inline SVG path data living inside `main.js`** (`CITY_ICONS` +
`CITY_ICON_GENERIC` at the top of the file, rendered by `cityIcon(slug, size)`).
They ship inside `dist/main.min.js` — nothing to host, nothing that can 404.

Three things this means for you:

1. **Nothing to deploy.** The icons are markup, not assets. What renders locally
   renders in prod, with zero asset pipeline.
2. **Keyed by city slug, fully decoupled from the data.** `CITY_ICONS` is separate
   from `DATA`. When you swap in PHP-served cities, you **do not touch the icon
   object** — PHP just needs to emit the matching slug.
3. **Graceful fallback — the layout never breaks.** Any city *without* a custom icon
   (currently ~11 are hand-drawn: Mumbai/Gateway, Hyderabad/Charminar, Jaipur/Hawa
   Mahal, etc.) automatically gets `CITY_ICON_GENERIC` (a generic skyline). Every
   city always gets *an* icon.

To add a custom icon for a new city, append one entry — `slug: '<path…>'` — to
`CITY_ICONS`. Skip it and that city simply shows the generic skyline. The SVGs use
`stroke="currentColor"`, so they auto-inherit the tile's text color (white when
active, ink otherwise) — no per-icon color work needed.

---

## 6. The search flow

```
DESKTOP                                MOBILE (#mobileModal)
─────────────────────────────         ─────────────────────────────
whereInput focus → city gate          tap search → modal → "Where?" step
  pick city tile  → setCity()           mobSelectCity()
  type locality   → buildSugg()         type locality → mobBuildSugg()
  "N areas ›"     → refineParent        "N areas ›"   → mob.refine
  pick suggestion → addLoc() (chip)     pick          → mobSelectLoc() (chip)
        │                                     │
        ▼  Search btn / Enter                 ▼  Continue / footer Search
   attemptSearch()                       mobSubmitSearch()
        │ validate "where"                    │ validate "where"
        ▼                                     ▼
  project? → routeToProject()           project? → routeToProject()
  else    → executeSearch()             else    → executeSearch()
                │                                     │
                └────────► buildSearchUrl() ──► searchpropbo.php?...
```

`executeSearch()` is the **single navigation hook** (change it for AJAX or a new
URL). On `localhost` (`IS_DEV`) it `console.log`s the URL instead of 404ing — drop
the guard in prod if you like.

**Validation (both platforms):** selection set / locations chosen → run; empty box
→ "All of <city>"; exactly one suggestion → auto-pick + run; many → block + inline
"Pick a location…" alert; none → block + "Search all of <city>" fallback.

---

## 7. New UI behaviours — don't accidentally strip these

- **`.where-prompt`** (styles.css) is the red-badge validation alert (with a
  spring/nudge animation, `prefers-reduced-motion` aware). Used by both desktop
  (`wherePrompt`) and mobile (`mobShowWherePrompt`).
- **`CHIP_X`** is the shared SVG close icon for every chip. Chips use tightened
  right padding (inline) so the × hugs the pill end.
- **`#searchBar #whereInput:focus-visible{outline:none}`** intentionally kills a
  rounded focus ring that the overflow-hidden chips row clipped into a stray "(".
- **`refineParent` / `mob.refine`** drive the locality drill-down; resetting them
  (on city change, typing, gate open) is wired — keep those resets.

---

## 8. Mobile modal & shared carousel chassis (front-end architecture)

The mobile search modal (`#mobileModal`) and its chip rails ride on the
**shared carousel chassis** — `ghar-carousel.js` → `window.initCarousel` — the
same engine the section rails (cities, designers, footer, People+Brands) use.
The old bespoke `gh-rail-frame` / `gh-rail-btn` rail code was deleted.

**Script load order — every page that has the modal (or any rail):**
```
1. Touch-detection IIFE   → sets window.__GHAR_IS_TOUCH__ + html.touch-device
2. GSAP (gsap, ScrollTrigger, Draggable)            [deferred]
3. ghar-carousel.js       → defines window.initCarousel   [deferred]
4. dist/main.min.js       → the app (search logic, rail inits)   [deferred]
5. Modal-helper IIFE      → wraps the chip rails, calls initCarousel   [deferred]
```
`ghar-carousel.js` must be present on **every page with the modal or a rail**
(index.html, design.html, design-article.html all load it). Convention is
**before** `main.min.js`; but every `initCarousel` consumer also retry-guards
(`typeof initCarousel !== 'function'` → `setTimeout`), so a late load
self-heals — `design.html` currently loads it *after* and still works. Use the
before-order on new pages so nothing relies on the retry safety net.

**Chip-rail wiring.** Each rail is wrapped `wrap` (positioning parent, no clip)
→ `outer` (`.rail-outer`, `overflow:hidden`) → `rail`; the prev/next chevrons
attach to `wrap` so they bleed `-12px` past the clip edge. The call:
```js
initCarousel({ outer, track, arrowPrev, arrowNext, snap: 'free',
               arrowExcludeSelector: '.dc-arrow', clickSlopPx: 12 });
```
- `arrowExcludeSelector: '.dc-arrow'` — city chips are `<button>`s, so the
  drag-exclude is narrowed to just the arrows (else grabbing a chip won't drag).
- `clickSlopPx: 12` — pointer-move (px) before a press becomes a drag (chassis
  default 5). 12 keeps a jittery thumb tap on a chip registering as a tap.
  **Keep this option** when you extract the partial.

**Byte-identical shared chrome.** The touch IIFE, the `ghar-carousel.js`
include, and the modal-helper IIFE are **byte-identical** across `index.html`,
`design.html`, `design-article.html` (verified md5-identical). Extract them into
**one SSI/PHP partial** during integration — don't let per-page copies drift.

**Desktop modal = centered card.** At `≥744px`, `#mobileModal` gets a dim
backdrop and `.ssp-modal-card` becomes a 720px centered card. Defined **once**
in `styles.css` (`#mobileModal .ssp-modal-card`, base
`background: var(--warm-white)`) — the old inline per-page copies were removed,
so `styles.css` is the single source.

---

## 9. Recent Searches (client-side, no backend)

Device-local search history (localStorage), shown at the top of the suggestion
**empty state**. Pure front-end — **nothing to wire on the backend**; it starts
populating the moment real searches run against your live data.

- **Storage:** key `ghar:recentSearches` — array, newest-first, deduped by URL,
  capped at 6. Each entry `{ city, cityName, mode, type, label, url, ts }`.
- **Save:** inside `executeSearch()` (the single submit hook), so every
  results-page search is captured on desktop and mobile. Project clicks
  (`routeToProject`) are intentionally not saved.
- **Show:** the empty-state branches of `renderPanel()` (desktop) and
  `mobRenderAcSuggestions()` (mobile), above "All of <city>", with a hairline
  between. Rows reuse the existing `.ac-item` / `.mob-ac-item` chassis (tinted
  `#fde8e8` clock icon for distinction). A row click navigates to its saved URL
  (`goRecent`); a "Clear" button empties the list.
- **Later (optional):** when user accounts exist, persist server-side so history
  follows the user across devices; localStorage stays the logged-out fallback.

---

## 10. MySQL shape + sample query (if you don't already have it)

```sql
cities      (id, slug, name)
localities  (id, city_id, parent_id NULL, name)   -- parent_id NULL = top-level
projects    (id, city_id, name, micro, category, buy_avail, rent_avail)
pincodes    (id, city_id, code, area)
```
`/api/suggest` localities (prefix-first):
```sql
SELECT id, name, parent_id AS parent
FROM localities
WHERE city_id = :cityid AND name LIKE CONCAT(:q,'%')
ORDER BY (name LIKE CONCAT(:q,'%')) DESC, name
LIMIT 8;
```

---

## 11. Merge strategy (into your existing twdist build)

The new code shares the **same architecture and element ids** as your live
`twdist/main.min.js` (`#whereInput`, `#mobLocInput`, the `mob` state object, `DATA`,
`routeToProject`, `mobSubmitSearch`, etc.). So:

1. **Take `main.js` as the new search source.** It already preserves your
   `searchpropbo.php` / `viewpropertydec.php` contract, so it's a drop-in upgrade of
   the search behaviour.
2. **Bring over the search markup** from `index.html` (the search bar `#searchBar`
   and the mobile modal `#mobileModal` block) and the `styles.css` additions in §2.
3. Do the 4 wiring steps (§4). The only backend touch-points are `DATA` injection
   and the `MODE_ID`/`TYPE_ID` maps.
4. Build into your `twdist` pipeline and bump the cache version.

If you prefer a surgical merge, diff your existing `mobSubmitSearch` / `buildSugg` /
`routeToProject` against these — the param names (`locids`, `sublocids`,
`cityid`, `propertysaleid`, `propertytypeid`, `okiw9487`) are identical, so the
diff is the new UI + validation, not the contract.

---

## 12. Go-live checklist

1. [ ] Inject real `DATA` (cities + `cityid` + localities with `parent`).
2. [ ] Set `MODE_ID` / `TYPE_ID` to real ids.
3. [ ] (Optional) wire `cityLookup` / `buildSugg` / `mobBuildSugg` to endpoints.
4. [ ] Delete the `TEMP CITY LIST` block.
5. [ ] (Optional) remove the `IS_DEV` localhost guard.
6. [ ] `npm run build`, bump `?v=` in `index.html` (+ inner pages).
7. [ ] Smoke test (desktop + mobile): city → locality + sub-area → Search → check
       `searchpropbo.php` URL has the right `cityid/locids/sublocids`; project →
       `viewpropertydec.php`; half-typed locality → blocked + alert.
8. [ ] `ghar-carousel.js` loaded before `main.min.js` on every page with the
       modal or a rail (§8). (Optional: standardize `design.html`'s order.)
9. [ ] Extract the shared chrome (touch IIFE + carousel include + modal-helper
       IIFE) into one partial; keep the pages byte-identical (§8).
10. [ ] Recent Searches works: run a search → reopen modal → it appears at the
        top → clicking re-runs it → "Clear" empties it (§9).
