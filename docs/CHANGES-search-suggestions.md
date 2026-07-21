# Search Suggestions — Changes to Apply

Six UX fixes to the homepage **search suggestion box**. Each is a small,
self-contained find-and-replace. Before applying them, skim **Related files &
prerequisites** below — the search leans on a few files the edits do *not* touch,
and change #6 will do nothing unless those are present.

**Where the code lives**
- Desktop suggestion logic → `main.js` : `buildSugg()`, `renderPanel()`, `addLoc()`
- Mobile (modal) suggestion logic → `main.js` : `mobBuildSugg()`, `mobRenderAcSuggestions()`, `mobSelectLoc()`
- Search-modal pill rows (Popular cities / categories) → `index.html` : `wireChassis()` inline script

> After editing `main.js`, **rebuild your minified bundle** (`esbuild main.js --minify --outfile=dist/main.min.js` or your equivalent) and **bump the `?v=` cache-buster** on the `<script src="dist/main.min.js?v=NN">` tag so browsers fetch the new file.

---

## What changed (summary)

| # | Behaviour | Before | After |
|---|-----------|--------|-------|
| 1 | Idle suggestions (city picked, nothing typed) | Localities + Projects + **Pincodes**, plain labels | **Popular Localities · Popular Sub-Locations · Popular Projects** — no pincodes |
| 2 | Group eyebrows | Static (`Localities`, `Projects`) | **Say "Popular …" when idle; drop "Popular" once the user types** |
| 3 | After a location is selected | Popular list reappears (input clears → idle) | **Popular list is hidden** — only shows when nothing is picked yet |
| 4 | Mobile idle (small modal) | 3 groups, ~15 rows | **One compact "Popular Localities" (top 4)** |
| 5 | After selecting a location | Input loses focus | **Input stays focused** so the next one can be typed immediately |
| 6 | Popular-cities / category pill rows in the modal | Clip 22px short of the card edge | **Bleed to both card edges; first pill still rests on the content grid** |

**Backend note:** the idle "Popular …" lists are just the first *N* of each array
(`POP = 5` desktop, `4` mobile). Return each list **pre-sorted by popularity/rank**.
"Sub-locations" = child localities (entries that carry a `parent`); if a city has
no parent-linked children the group auto-hides. Pincodes are intentionally
withheld from the idle view and only appear once the user types.

---

## Related files & prerequisites (verify these exist — the edits above don't create them)

The find-and-replace edits assume the search modal and its carousel chassis are
already in place. These files are **part of the search but are not edited** by the
changes above — if the suggestion box or the modal pill rows misbehave, check here
first.

**A. `ghar-carousel.js`** — the shared carousel engine that drives the modal
Popular-cities / category **pill rows (change #6)**. It's loaded on the page via
`<script src="ghar-carousel.js" defer></script>` and exposes `window.initCarousel`.
The modal's `wireChassis()` calls it like this:

```js
window.initCarousel({ outer, track: rail, arrowPrev: prev, arrowNext: next,
                      snap: 'free', arrowExcludeSelector: '.dc-arrow', clickSlopPx: 12 });
```

So `initCarousel` **must support** the `snap: 'free'`, `arrowExcludeSelector`, and
`clickSlopPx` options. If your `ghar-carousel.js` predates them, update it to the
current version — do **not** inline a second carousel implementation. (Change #6's
`margin-left/right:-22px` bleed only has an effect once these pill rows are actually
wrapped in the `.rail-outer` chassis by `wireChassis`.)

**B. `styles.css`** — the chassis + suggestion-row classes the markup relies on.
No edits are needed; just confirm these classes exist:
- `.rail-outer`, `.rail`, `.dc-arrow`, `.dc-paginator` → the pill-row carousel (change #6)
- `.ac-item` → desktop suggestion rows · `.mob-ac-item` → mobile suggestion rows

**C. Mobile search-modal markup (`index.html`)** — the suggestion JS writes into
these containers; they must exist inside the modal:
- `#mobAcBox` — target that `mobRenderAcSuggestions()` fills with suggestions
- `#mobCityChips` and `#mobExploreCats > div` — the two pill rows `wireChassis()` wraps (change #6)
- `#mobLocInput` — the field re-focused after selecting a location (change #5)

**D. Location data shape** — sub-locations (changes #1 and #4) are localities whose
object carries a `parent` id pointing at the parent locality:
```js
{ id:"loc_child", name:"…", parent:"loc_parent" }   // sub-location
{ id:"loc_top",   name:"…", parent:null }           // top-level locality
```
Without `parent`-linked entries the "Popular Sub-Locations" group simply stays empty
(it does not error).

---

# `main.js`

## 1. `buildSugg(c, q)` — desktop suggestion builder

This function gains a new `sublocations` field, hides Popular once a location is
selected, and drops pincodes from the idle view.

**1a. Add `sublocations` to the empty-city guard.**

```js
// FIND
const d=DATA[c];if(!d)return{locations:[],projects:[],pincodes:[],refine:null};
// REPLACE
const d=DATA[c];if(!d)return{locations:[],sublocations:[],projects:[],pincodes:[],refine:null};
```

**1b. Add the per-group cap** right after the `ids` / `qt` line (top of the function):

```js
// FIND
const ids=new Set(multiLocs.map(x=>x.id)),qt=q.trim().toLowerCase();
// REPLACE
const ids=new Set(multiLocs.map(x=>x.id)),qt=q.trim().toLowerCase();
const POP=5;   /* per-group cap for the idle "Popular …" shortcuts. Backend
                  should return each list pre-sorted by popularity/rank. */
```

**1c. Add `sublocations` to the refine (drill-down) return.**

```js
// FIND
if(parent)return{locations:locChildren(c,refineParent).filter(x=>!ids.has(x.id)),projects:[],pincodes:[],refine:parent};
// REPLACE
if(parent)return{locations:locChildren(c,refineParent).filter(x=>!ids.has(x.id)),sublocations:[],projects:[],pincodes:[],refine:parent};
```

**1d. Replace the idle return** — add the "already selected → no Popular" guard,
split localities vs sub-locations, cap at `POP`, drop pincodes.

```js
// FIND
    /* Idle: top-level localities only — keeps the list calm. */
    return{locations:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,6),projects:d.projects.slice(0,4),pincodes:d.pincodes.slice(0,4),refine:null};
// REPLACE
    /* A location is already selected → don't resurface the Popular idle
       shortcuts. The user proceeds from the selected chip(s), or types to
       add more. Popular only shows when nothing is picked yet. */
    if(ids.size)return{locations:[],sublocations:[],projects:[],pincodes:[],refine:null};
    /* Idle: curated "Popular …" shortcuts only — top localities, top
       sub-locations, top projects. Pincodes are precise-intent, so they
       are withheld until the user types (see the query branch below). */
    return{
      locations:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,POP),
      sublocations:d.locations.filter(x=>x.parent&&!ids.has(x.id)).slice(0,POP),
      projects:d.projects.slice(0,POP),
      pincodes:[],
      refine:null
    };
```

**1e. Add `sublocations:[]` to the typed-query return** (sub-locations fold into
the flat "Locations" list while typing):

```js
// FIND
    locations:starts.concat(incl).slice(0,8),
    projects:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,6),
// REPLACE
    locations:starts.concat(incl).slice(0,8),
    sublocations:[],
    projects:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,6),
```

---

## 2. `renderPanel()` — desktop panel render (eyebrows + Sub-Locations group)

**2a. Include sub-locations in the "has results" check and add the `isIdle` flag.**

```js
// FIND
  const s=buildSugg(city,whereText);
  const has=s.locations.length||s.projects.length||s.pincodes.length;
// REPLACE
  const s=buildSugg(city,whereText);
  const has=s.locations.length||s.sublocations.length||s.projects.length||s.pincodes.length;
  /* Idle = city chosen but nothing typed/selected yet → "Popular …" eyebrows.
     Once the user types (or has picked locations), the groups become live
     search results and the eyebrows drop the "Popular" prefix. */
  const isIdle=!whereText.trim()&&!multiLocs.length&&!s.refine;
```

**2b. Make the localities eyebrow state-aware, and add the Sub-Locations group + state-aware Projects eyebrow.**

```js
// FIND
  }else if(s.locations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">'+(whereText.trim()?"Locations":"Localities")+'</div>';
    s.locations.forEach(l=>{h+=locRowHTML(city,l);});
  }
  if(s.projects.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Projects</div>';
// REPLACE
  }else if(s.locations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">'+(isIdle?"Popular Localities":"Locations")+'</div>';
    s.locations.forEach(l=>{h+=locRowHTML(city,l);});
  }
  if(s.sublocations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Popular Sub-Locations</div>';
    s.sublocations.forEach(l=>{h+=locRowHTML(city,l);});
  }
  if(s.projects.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">'+(isIdle?"Popular Projects":"Projects")+'</div>';
```

---

## 3. `addLoc(l)` — keep the input focused after selecting a location (desktop)

```js
// FIND
  $("#whereInput").value="";renderChips();renderPanel();
}
// REPLACE
  $("#whereInput").value="";renderChips();renderPanel();
  /* Keep the cursor in the input so the next location can be typed
     immediately without re-clicking the field. */
  setTimeout(()=>$("#whereInput")?.focus(),0);
}
```

---

## 4. `mobBuildSugg(q)` — mobile suggestion builder

Mirrors the desktop logic, but the mobile idle view is deliberately shorter:
**only a compact "Popular Localities" (top 4)** — no sub-locations/projects/pincodes
until the user types.

**4a. Replace the whole idle block** (refine return + idle return):

```js
// FIND
    if(mob.refine){const parent=locById(mob.city,mob.refine);if(parent)return{locs:locChildren(mob.city,mob.refine).filter(x=>!ids.has(x.id)),projs:[],pins:[],refine:parent};}
    return{locs:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,6),projs:d.projects.slice(0,4),pins:d.pincodes.slice(0,4),refine:null};
// REPLACE
    if(mob.refine){const parent=locById(mob.city,mob.refine);if(parent)return{locs:locChildren(mob.city,mob.refine).filter(x=>!ids.has(x.id)),sublocs:[],projs:[],pins:[],refine:parent};}
    /* A location is already selected → hide the Popular idle shortcuts
       (matches desktop). User proceeds from the chip(s) or types to add more. */
    if(ids.size)return{locs:[],sublocs:[],projs:[],pins:[],refine:null};
    /* Mobile idle stays deliberately SHORT — the modal is small and the
       Mode/Type steps sit right below, so we surface only a compact Popular
       Localities group (top 4). Sub-locations, projects and pincodes are all
       withheld until the user types. Desktop has room for the fuller three-
       group set — see buildSugg(). (Reversible: add sublocs/projs back here.) */
    return{locs:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,4),sublocs:[],projs:[],pins:[],refine:null};
```

**4b. Add `sublocs:[]` to the typed-query return:**

```js
// FIND
  return{locs:starts.concat(incl).slice(0,8),projs:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,5),pins:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,5):[],refine:null};
// REPLACE
  return{locs:starts.concat(incl).slice(0,8),sublocs:[],projs:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,5),pins:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,5):[],refine:null};
```

---

## 5. `mobRenderAcSuggestions(query)` — mobile panel render

**5a. Destructure `sublocs` and include it in the "has any" check:**

```js
// FIND
  const r=mobBuildSugg(query);const{locs,projs,pins}=r;
  const hasAny=locs.length||projs.length||pins.length;
// REPLACE
  const r=mobBuildSugg(query);const{locs,sublocs,projs,pins}=r;
  const hasAny=locs.length||(sublocs&&sublocs.length)||projs.length||pins.length;
```

**5b. Render the Sub-Locations group** (insert directly **after** the `if(locs.length){…}` line):

```js
// FIND  (this is the existing localities line — leave it as-is, add the new line under it)
  if(locs.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">${query.trim()?"Locations":"Popular Localities"}</div>`;locs.forEach(loc=>{h+=mobLocRowHTML(loc);});}
// ADD IMMEDIATELY BELOW IT
  if(sublocs&&sublocs.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">Popular Sub-Locations</div>`;sublocs.forEach(loc=>{h+=mobLocRowHTML(loc);});}
```

**5c. Pincode eyebrow** — it is now typed-only, so drop the dead "Popular Pincodes" label:

```js
// FIND
  if(pins.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">${query.trim()?"Pincodes":"Popular Pincodes"}</div>`;pins.forEach(pin=>{
// REPLACE (only the eyebrow label changes)
  if(pins.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">Pincodes</div>`;pins.forEach(pin=>{
```

---

## 6. `mobSelectLoc` — keep the input focused after selecting (mobile)

Add `if(i)setTimeout(()=>i.focus(),0);` at the very end of the function, just
before the closing `};`:

```js
// FIND (end of the function)
mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();};
// REPLACE
mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();if(i)setTimeout(()=>i.focus(),0);};
```

---

# `index.html` — search-modal pill rows (`wireChassis()`)

The "Popular cities" and "browse by category" pill rows in the mobile search
modal are wrapped in the carousel chassis (`.rail-outer` / `.rail`). Two lines
make them **bleed to both edges of the card** while keeping the first pill on the
content grid. `22px` = the modal section's horizontal padding — adjust only if
your section uses a different pad.

**6a. Bleed the clip box (`.rail-outer`) to both card edges:**

```js
// FIND
      outer.style.cssText = 'position:relative;overflow:hidden';
// REPLACE
      /* Bleed the clip window to BOTH card edges — cancel the where-section's
         22px side padding so chips run off the edge (left when scrolled, right
         at rest). Applied to the rail-outer (clip box), NOT the .rail track. */
      outer.style.cssText = 'position:relative;overflow:hidden;margin-left:-22px;margin-right:-22px';
```

**6b. Give the track a leading inset** so the first pill still rests on the grid
(add right after the `rail.style.flexWrap = 'nowrap';` line):

```js
// FIND
      rail.style.overflowX = 'visible';
      rail.style.width = 'max-content';
      rail.style.flexWrap = 'nowrap';
// REPLACE
      rail.style.overflowX = 'visible';
      rail.style.width = 'max-content';
      rail.style.flexWrap = 'nowrap';
      /* Leading inset so the first chip rests on the content grid (22px in
         from the card's left edge) even though the clip window bleeds to both
         edges. No trailing pad — the last chip runs off the right. */
      rail.style.paddingLeft = '22px';
```

---

## Test checklist

1. Pick a city, don't type → three groups **Popular Localities / Popular Sub-Locations / Popular Projects**, no pincodes. (Mobile: only **Popular Localities**, ~4 rows.)
2. Type a few letters → eyebrows change to **Locations / Projects**; a numeric query shows **Pincodes**.
3. Select a location → the Popular groups disappear (only the selected chip remains) and the input stays focused (cursor blinking, ready to type the next one).
4. In the mobile modal, scroll the Popular-cities row → pills bleed off **both** left and right edges; at rest the first pill lines up with the "POPULAR CITIES" label.

---
---

# Part 2 — Search-bar pills, panel behaviour & mobile recents (later pass)

A second UX pass on the same search. Unlike Part 1 (small find-and-replace tweaks),
this pass **restructures the WHERE-pill markup, adds CSS, and adds/edits several JS
functions** — so the fastest way to pick it up is to **pull the changed files**
below and merge if you have local edits. The list at the end tells you exactly
which files and why. **None of this changes the data contract** — `DATA` shape,
`buildSugg()` return shape, `setCity`/`addLoc`/`selection`, the search submission
(`name="where"` / `attemptSearch()` / result URLs) and the recents `localStorage`
format are all unchanged.

## What changed (summary)

| Area | Before | After |
|------|--------|-------|
| Desktop WHERE pill | "Where" eyebrow + one flat chips row (`overflow-hidden`), 24px pad | **No eyebrow.** City chip **pinned** in its own `#cityChipHost` (never scrolls/clips); locality chips live in a horizontally-scrolling `#chipsRow.chip-scroll` with a **left fade** once scrolled. Pad 15px. |
| Locality chips shown | up to 2–3, then clipped | **Max 2 chips + "+N"**. Clicking **"+N"** opens a *"Selected locations"* manage view in the panel (each pick removable). |
| Panel header ("Searching in <city> · Change city") | always shown | **Only on first-entry idle** (city picked, nothing selected, not typing). Hidden while typing and once a location chip exists — the city pill changes city. |
| Panel "Selected locations" block | shown when locations picked | **Removed** (redundant with the bar pills / the "+N" manage view). |
| Panel when locations picked + not typing | showed an empty box | **Panel closes**; reopens on the next keystroke. |
| Desktop recents | full 2-line rows | **Compact wrapping pills** (clock + "where" summary); **"All of <city>"** slimmed to a single line + chevron. |
| Mobile recents | 2-line rows | **Horizontal-scroll pill rail reusing the shared carousel chassis** (same bleed + fade + "›" cue as the Popular-cities row). |
| Shared nav border | `#d4cec2` (warm) | `var(--rule)` (matches homepage). |

## Files to pull (and why)

| File | Why |
|------|-----|
| `main.js` → rebuild `dist/main.min.js` | all the JS below |
| `styles.css` → rebuild `dist/styles.min.css` | new `.chip-scroll` + placeholder rules |
| `partials/nav.html` | new WHERE-pill markup + border fix (source of the desktop bar for inner pages) |
| `partials/mobile-search-modal.html` | new `#mobRecentsWrap` / `#mobRecents` rail |
| `index.html` | its **inline** nav + modal copies (index doesn't use the partials) + the same CSS inline in `<head>` |
| `design.html`, `design-article.html`, `design-architecture.html` (and `brands*.html`, `for-brands.html` once tracked) | regenerated by `npm run build:partials`; each page's inline `wireRails` also gains the `#mobRecents` line |

> **Build steps (unchanged workflow):** `npm run build:js` + `npm run build:styles` + `npm run build:partials`, then bump the `?v=` cache-busters (`main.min.js?v=` and `styles.min.css?v=`) on every page so browsers refetch. Current values: `main.min.js?v=91`, `styles.min.css?v=20`.

---

## A. Markup — WHERE pill (`partials/nav.html` **and** `index.html` inline nav)

```html
<!-- REPLACE the old wherePill inner (Where eyebrow + flat #chipsRow, padding:10px 24px) WITH: -->
<div id="wherePill" class="flex items-center flex-1 min-w-0 border-r border-ln relative" style="padding:10px 15px">
  <div class="flex items-center gap-1.5 flex-1 min-w-0">
    <span id="cityChipHost" class="shrink-0 flex items-center"></span>          <!-- pinned city chip lives here -->
    <div id="chipsRow" class="chip-scroll flex items-center gap-1.5 flex-nowrap flex-1 min-w-0">
      <input id="whereInput" type="text" name="where" ... class="flex-1 border-0 outline-none text-sm text-tx bg-transparent min-w-[80px]">
    </div>
  </div>
  <button id="clearBtn" ...>×</button>
  <div id="wherePanel" ...></div>
</div>
```

New DOM hooks the JS relies on: **`#cityChipHost`** (pinned city) and the **`.chip-scroll`** class on `#chipsRow`. Also change the nav border `#d4cec2` → `var(--rule)`.

## B. CSS — add to `styles.css` (already inline in `index.html <head>`)

```css
#searchBar .chip-scroll{overflow-x:auto;scrollbar-width:none}
#searchBar .chip-scroll::-webkit-scrollbar{display:none}
/* Left fade appears only while scrolled (JS toggles .is-scrolled) → overflow chips tuck behind the pinned city. */
#searchBar .chip-scroll.is-scrolled{-webkit-mask-image:linear-gradient(to right,transparent 0,#000 30px);mask-image:linear-gradient(to right,transparent 0,#000 30px)}
/* Field default text matches the Buy/Type labels. */
#whereInput::placeholder{color:#1a1714!important;font-weight:500;opacity:1}
```

## C. `main.js` — desktop chips / panel / recents

- **New state var:** add `manageLocs=false` to the top-level `let city="",…` declaration.
- **`renderChips()`** — city chip is appended to `#cityChipHost` (not `#chipsRow`); locality chips capped at **`slice(0,2)`** with a **"+N"** chip whose click does `manageLocs=true; openPanel()`. Calls `updateChipFade()`.
- **`updateChipFade()`** (new) — `$("#chipsRow").classList.toggle("is-scrolled", scrollLeft>1)`, bound once as a `scroll` listener.
- **`renderPanel()`** — three additions:
  - header appended only when `!whereText.trim() && !multiLocs.length`;
  - **manage-view branch:** `if(manageLocs && multiLocs.length && !whereText.trim() && city && !cityGateForced){ renderManageLocs(p); return; }`
  - **blank-box guard:** `if(multiLocs.length && !whereText.trim() && !s.refine){ panelOpen=false; hide panel + reset bar shadow; return; }`
- **`renderManageLocs(p)`** (new) — renders "Selected locations · N" + a removable pill per `multiLocs` entry + "Clear all". (Replaces the removed `renderSelectedRowInPanel()`.)
- **`recentsDeskHTML()`** — now emits **compact pills** (label = `r.label.split(" · ")[0]`), wired via `p.querySelectorAll(".sel-recent")` after render. "All of <city>" slimmed to one line + chevron.
- **`manageLocs` resets** to `false` in `addLoc()`, `removeLoc()` (when emptied), `closePanel()`, and the `#whereInput` `input` handler — which now calls **`openPanel()`** (so typing reopens a closed panel).

## D. `main.js` + partial — mobile recents on the shared chassis

- **Partial markup** (`partials/mobile-search-modal.html`, before `#mobAcBox`):
  ```html
  <div id="mobRecentsWrap" style="display:none;margin-top:14px">
    <div ...>Recent searches ... <button onclick="…clearRecentsMob()">Clear</button></div>
    <div id="mobRecents" style="display:flex;gap:8px"></div>
  </div>
  ```
- **`wireRails()`** (inline script, every page) — add `wireChassis(document.getElementById('mobRecents'));` and add `'mobRecents'` to the child-list poke array: `['mobCityChips','mobRecents']`. This reuses the **existing** `wireChassis`/`initCarousel` — no new carousel code.
- **`main.js`:** `recentsMobHTML()` is replaced by **`mobRenderRecents(show)`** which fills `#mobRecents` + toggles `#mobRecentsWrap`; `mobRenderAcSuggestions()` calls `mobRenderRecents(!query.trim() && !mob.locs.length && !r.refine)` and no longer inlines recents into `#mobAcBox`. Mobile "All of <city>" slimmed to match desktop.

## Test checklist (Part 2)

1. Pick a city + 3–4 localities → bar shows **city (pinned) + 2 chips + "+2"**; scrolling tucks chips behind the city with a left fade; nothing bleeds into "Buy".
2. Click **"+N"** → panel shows **"Selected locations · N"** with removable pills.
3. Type → panel results sit at the top (no header); clear the field with a chip selected → panel **closes** (no empty box); type again → it reopens.
4. Recents render as **pills** (desktop wraps; mobile is a horizontal-scroll rail with the same "›" cue as Popular cities).
5. Inner pages (`body.simple-nav`) open the **modal** for search at every width — confirm the modal shows the compact recents rail.
