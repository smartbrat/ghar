# Search Suggestions — Changes to Apply

Five UX fixes to the homepage **search suggestion box**. Each is a small,
self-contained find-and-replace. Nothing else in the app is affected.

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
