# Search + Mobile Modal — Programmer Handoff (consolidated)

_Last updated: 2026-06-20. Covers the mobile search modal + carousel-chassis
reuse work and the search-URL contract. For the deeper search **data model**
(DATA shape, cityLookup, suggestion building, project flow) read the companion
[`docs/SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md) — this doc does not repeat it._

This is the single place to start. It tells you (1) the exact backend contract
the UI emits, (2) how the files/scripts are wired, (3) what's already built and
live, and (4) the short checklist to take it live. The search UI, modal,
carousel, desktop card, and Recent Searches are **all built and pushed** — your
job is wiring the live backend data, not rebuilding the front end.

---

## 0. TL;DR

- **Everything here is already built and pushed.** This is a *setup* guide, not
  a build spec. The UI matches the live `searchpropbo.php` contract — you wire
  real data + ids, you do **not** restructure the URL.
- Files split as **markup (HTML) · CSS (`styles.css`) · JS (`main.js` →
  minified to `dist/main.min.js`)**. Rebuild after editing source:
  `npm run build:js`, `npm run build:styles` (or `npm run build`).
- The mobile modal's chip rails reuse the shared carousel chassis
  (`ghar-carousel.js` → `window.initCarousel`), loaded on every page with the
  modal. Exact script set + order is in §3.
- Follow the **Quick Start** below, then use §7 as your final checklist.

---

## Quick Start (the path to live)

1. **Swap the data.** Replace the mock `DATA` in `main.js` with PHP-injected
   data of the same shape (city → `cityid` + `localities[]`; each locality →
   `id` / `name` / `parent`). Shape is documented in `SEARCH-HANDOFF.md`.
2. **Set the id maps.** Confirm `MODE_ID` / `TYPE_ID` (§1c) match your MySQL
   `propertysaleid` / `propertytypeid` values.
3. **Rebuild + cache-bust.** `npm run build:js && npm run build:styles`, then
   bump the `?v=NN` query on `main.min.js` / `styles.min.css` (§3).
4. **Keep the script set.** Every page with the modal loads, in order: touch
   IIFE → `ghar-carousel.js` → `main.min.js` → modal-helper IIFE (§3).
5. **Verify the URL.** On localhost the search logs the exact `searchpropbo.php`
   URL to the console — confirm `locids` / `sublocids` match §1a before going
   live.

The modal, carousel, Recent Searches, and desktop card all work out of the box.
Details below.

---

## 1. Search backend contract (AUTHORITATIVE — supersedes any inline comment)

The UI preserves the existing ghar.tv contract verbatim. Two endpoints:

### 1a. Results page

```
searchpropbo.php?cityid=<id>&propertysaleid=<id>&propertytypeid=<id>&locids=<csv>&sublocids=<csv>
```

**`locids` and `sublocids` are TWO INDEPENDENT comma-separated lists.**
They are NOT positionally paired. There is NO `0` padding. The parent of a
sub-area is NOT injected into `locids` — the backend resolves the parent
server-side.

| User picks…            | Goes into… |
|------------------------|------------|
| a **whole locality**   | its own id appended to `locids` |
| a **sub-area**         | its own id appended to `sublocids` (parent NOT added) |

**Verified live (the two URLs that defined this contract):**

```
…&cityid=21&propertysaleid=1&propertytypeid=1&locids=26,90&sublocids=
        → two whole localities (ids 26, 90)

…&cityid=21&propertysaleid=1&propertytypeid=1&locids=&sublocids=17,177
        → two sub-areas (ids 17, 177); backend resolves their parents
```

A mixed selection therefore yields e.g. `locids=26&sublocids=17` — each id
sits in exactly one list. Either list may be empty.

The code that produces this (`main.js`, `buildSearchUrl()`):

```js
const locids=[],sublocids=[];
multiLocs.forEach(l=>{
  if(l.parent) sublocids.push(l.id);   // sub-area  → own id in sublocids only
  else         locids.push(l.id);      // whole loc → own id in locids only
});
```

### 1b. Project detail page

```
viewpropertydec.php?robprojname=okiw9487<projectId>
```

Constants in `main.js`: `PROJECT_ENDPOINT = "viewpropertydec.php"`,
`PROJECT_PREFIX = "okiw9487"`.

### 1c. UI value → backend id maps (confirm against your MySQL ids)

```js
const MODE_ID={buy:"1",rent:"2"};                  // → propertysaleid
const TYPE_ID={homes:"1",workspaces:"2",land:"3"}; // → propertytypeid
```

These are **placeholders** — replace with your real ids if they differ.

### 1d. Why cross-state name collisions can't happen

Search is **city-scoped**: the modal locks suggestions to one city's dataset
before the user can pick anything, and every selection emits a **numeric id**,
never a name. So picking "Sunder Nagar" inside Mumbai can only ever send
Mumbai's Sunder Nagar id — there is no path to a same-named place in another
state. The only cosmetic caveat: two same-named localities **within one city**
render identical chip labels (the search is still correct via ids). If that
ever matters, disambiguate the label in `renderChips()` — not the query.

---

## 2. What changed this round (already applied + pushed)

The work spans these commits:

- **`b1e7d2a`** — *Fix search URL builder to match live backend
  (independent `locids`/`sublocids`).* The §1a model above.
- **`4b64494`** — *Mobile search modal: reuse carousel chassis, tighten
  suggestion spacing, desktop card behaviour.*
- **`4ca4a7b`** — *Chip-tap reliability: configurable `clickSlopPx` on the
  carousel chassis (see item 6) + the `.ssp-modal-card` consolidation (§5.2).*
- **`27382f3`** — *Recent Searches in the suggestion empty state (§5.3 / §6).*

What the modal reuse (`4b64494`) did:

1. **Carousel-chassis reuse (the big one).** The mobile modal's chip rails
   (`#mobCityChips`, `#mobExploreCats > div`) used to carry a bespoke,
   duplicated scroll/drag/arrow implementation (`gh-rail-frame` / `gh-rail-btn`
   — now deleted). They now reuse the **shared** chassis from
   `ghar-carousel.js` via `window.initCarousel({…})` — the same function the
   section rails (cities, projects, designers, footer, People+Brands) use.
   ~150 lines of duplicate logic removed.
2. **Two-layer wrap for the nav arrows.** Each rail is wrapped in
   `wrap` (positioning parent, no clip) → `outer` (`.rail-outer`,
   `overflow:hidden` clip box) → `rail`. The prev/next chevrons attach to
   `wrap` so they can bleed `-12px` past the clip edge (the chevron tip lands
   just past the last visible chip = stronger "scroll for more" signal),
   while chip content still clips cleanly inside `outer`.
3. **Suggestion-row spacing** tightened (padding `10px → 6px 10px`,
   `line-height:1.2`, group margins `→ 14px/2px`, smaller eyebrow emoji).
   Cosmetic only.
4. **Desktop modal becomes a centered card.** At `≥744px`, `#mobileModal`
   gets a dim backdrop and the `.ssp-modal-card` becomes a 720px centered
   card — same treatment inner pages already give under `body.simple-nav`.
   (See §5.2 — there is a small consolidation left to do here.)
5. **Shared chrome mirrored** across `index.html`, `design.html`,
   `design-article.html`: the touch-detection IIFE, the `ghar-carousel.js`
   include, and the modal-helper IIFE are **byte-identical** on all three
   (verified: same md5). Extract them into one SSI/PHP partial during
   integration — do not let per-page copies drift.
6. **Chip-tap reliability (`clickSlopPx`).** `initCarousel` takes an optional
   `clickSlopPx` — the pointer-move distance (px) before a press is
   reclassified as a drag and its click suppressed (default `5`). The modal
   passes `clickSlopPx: 12`, so a slightly jittery thumb tap on a city chip
   still registers as a tap rather than a swipe. The current modal call is
   `initCarousel({ outer, track, arrowPrev, arrowNext, snap: 'free',
   arrowExcludeSelector: '.dc-arrow', clickSlopPx: 12 })` — keep this option
   when extracting the partial; dropping it regresses touch chip taps.

---

## 3. File & dependency setup (load order matters)

Every page that renders the mobile search modal needs, in `<head>`/early body,
**in this order**:

1. **Touch-detection IIFE** (sets `window.__GHAR_IS_TOUCH__` +
   `html.touch-device`). Runs synchronously, early. `ghar-carousel.js` reads
   it at init to choose native-scroll (touch) vs GSAP-drag (desktop).
   _Present at `index.html:2187`._
2. GSAP (`gsap.min.js`, `ScrollTrigger`, `Draggable`) — deferred.
3. **`<script src="ghar-carousel.js" defer></script>`** — defines
   `window.initCarousel`. **Must come before `main.min.js`.**
4. `<script defer src="dist/main.min.js?v=NN"></script>` — the app
   (nav handlers, search logic, People+Brands rail init, …).
5. The **modal-helper IIFE** (`<script defer>`) — wraps the chip rails and
   calls `initCarousel`. Byte-identical across the 3 pages.

> ⚠️ **Gotcha that bit us:** `index.html` was missing the `ghar-carousel.js`
> include even though its code calls `initCarousel` (both the modal rails
> *and* the People+Brands carousel at `pplTrackWrap`). Without it, those
> silently no-op. It's fixed now — just make sure any **new** page that uses a
> rail or the modal includes `ghar-carousel.js` before `main.min.js`.

> **Order in practice (don't be alarmed by design.html):** every `initCarousel`
> consumer — the modal helper and each section-rail init — is wrapped in a
> `typeof initCarousel !== 'function'` retry, so a late `ghar-carousel.js`
> self-heals instead of throwing. `design.html` currently loads
> `ghar-carousel.js` *after* `main.min.js` and still works for exactly this
> reason. It's not a bug, but the **before** order (index.html /
> design-article.html) is the convention — use it on new pages and when you
> extract the shared partial, so nothing relies on the retry safety net.

**Cache-busting:** bump the `?v=NN` query on `main.min.js` (and
`styles.min.css`) whenever you rebuild, so browsers pull the new bundle.
`ghar-carousel.js` currently loads without a version query — add one if you
change that file.

**Build:** source files are `main.js` and `styles.css`. After editing:
`npm run build:js` and/or `npm run build:styles`. The minifier strips
comments, so **comment-only edits to `main.js` need no rebuild** (the bundle
is byte-unchanged).

---

## 4. City icons — no asset folder to wire

City icons are **inline SVG path data inside `main.js`** (`CITY_ICONS`,
keyed by city slug, with `CITY_ICON_GENERIC` as fallback). There is **no icon
folder, no image files, no CDN**. They ship inside `dist/main.min.js`.

- Adding a city's icon = add `slug: '<svg path data>'` to `CITY_ICONS`.
- A city with no entry falls back to a generic skyline icon — never breaks.
- Icons use `stroke="currentColor"`, so they auto-match the tile text color.

Full detail: §5.1 of [`docs/SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md).

---

## 5. Items resolved this round (all done)

### 5.1 Stale contract comment in `main.js` — ✅ FIXED

The `main.js` header block (~L308–315) used to describe the old, wrong model
("PARALLEL comma lists", `sublocid=0`, parent injection). It now reads:

```js
   locids / sublocids are TWO INDEPENDENT comma lists (NOT paired, no 0 pad):
     whole locality  → its own id in locids
     a sub-area      → its own id in sublocids (backend resolves the parent)
```

Comment-only change — minified output unchanged.

### 5.2 `.ssp-modal-card` consolidation — ✅ DONE (warm-white, all breakpoints)

The desktop centered-card treatment used to be defined **twice** — shared in
`styles.css` (`#mobileModal .ssp-modal-card`) and inline in each inner page's
`<head>` (`body.simple-nav .ssp-modal-card`). The inline copies are now
**removed**; `styles.css` is the single source for every page.

Background decision: the shared base `.ssp-modal-card` now sets
`background: var(--warm-white)` at **all** breakpoints. The modal's
`mob-section` cards are white-with-shadow, so a warm-white base gives the
standard on-brand "white cards floating on warm canvas" look. This unifies the
three pages and replaces index.html's old grey (`#f2f2f2`) mobile gutter and
the inner pages' old `#fff` mobile base. Desktop card stays warm-white as
agreed.

`styles.min.css` rebuilt; cache-bust versions bumped (index `v=19`,
design/design-article `v=16`).

### 5.3 Recent Searches — ✅ BUILT (see §6)

Implemented in `main.js` (localStorage, reuses the existing row chassis on both
desktop and mobile). §6 documents how it works and the later account-sync hook.

---

## 6. Recent Searches (IMPLEMENTED)

Client-side (localStorage), reusing the existing suggestion-row markup — no
backend needed. Lives in the "Recent Searches" module in `main.js`
(functions: `recentsLoad/recentsSave/recentLabel/recordRecentSearch/goRecent`
+ `recentsDeskHTML/recentsMobHTML`; globals `window.goRecentMob` /
`window.clearRecentsMob`). How it works:

- **Save** — `recordRecentSearch(url)` is called inside `executeSearch()` (the
  single submit hook), so every results-page search is captured on both
  desktop and mobile. Project clicks (`routeToProject`) are intentionally not
  saved.
- **Show** — `recentsDeskHTML()` / `recentsMobHTML()` render a "Recent
  Searches" group at the top of the suggestion **empty state** (after a city
  is chosen, above "All of <city>"), each row reusing `.ac-item` /
  `.mob-ac-item` with a clock icon. A row click navigates straight to its
  saved URL (`goRecent`); a "Clear" button empties the list.
- **Dev mode** — on localhost `goRecent` logs/toasts the URL instead of
  navigating (same as `executeSearch`), so it's testable without PHP.

**Storage** (device-local, anonymous — no backend needed):

```js
// key: "ghar:recentSearches"  — array, most-recent-first, cap ~6, dedupe by url
{
  city: "mumbai", cityName: "Mumbai",
  mode: "buy", type: "homes",
  label: "Goregaon West +2 · Buy · Homes",   // human-readable summary
  url: "searchpropbo.php?cityid=21&…",        // output of buildSearchUrl()
  ts: 1718900000000
}
```

**Where it lives in code:** the save point is inside `executeSearch()`
(`main.js`); the render points are the empty-state branches of `renderPanel()`
(desktop) and `mobRenderAcSuggestions()` (mobile), rendered above the "All of
<city>" row with a hairline separating the two. The clock-icon rows reuse the
existing `.ac-item` / `.mob-ac-item` chassis (tinted `#fde8e8` icon for
distinction). No new component, no new CSS class.

**Nothing to wire for the backend** — it's pure client state. It will start
populating the moment real searches run against your live data.

**Later (optional):** when user accounts exist, persist recent searches
server-side so they follow the user across devices; localStorage stays the
fallback for logged-out users.

---

## 7. Integration checklist

- [ ] Inject real `DATA` (city → `cityid` + `localities[]`; locality →
      `id`/`name`/`parent`) in place of the mock — same shape (see
      `SEARCH-HANDOFF.md`).
- [ ] Confirm `MODE_ID` / `TYPE_ID` match your MySQL ids (§1c).
- [ ] Confirm the `locids`/`sublocids` independent-list contract end-to-end
      against `searchpropbo.php` (§1a).
- [ ] Ensure `ghar-carousel.js` loads before `main.min.js` on **every** page
      with the modal or a rail (§3). (Optional cleanup: `design.html` loads it
      after — works via retry, but standardize it when you touch the file.)
- [ ] Extract the shared chrome (touch IIFE + carousel include + modal-helper
      IIFE) into one partial; keep the 3 pages byte-identical (§2, item 5 —
      verified md5-identical at handoff).
- [x] §5.1 stale comment — fixed.
- [x] §5.2 `.ssp-modal-card` consolidation — done (warm-white single source).
- [x] §5.3 Recent Searches — built (localStorage). Wire account-sync later
      (see §6) once user accounts exist; localStorage stays the logged-out
      fallback.
- [ ] Bump `?v=NN` on `main.min.js` / `styles.min.css` after any rebuild.
```
