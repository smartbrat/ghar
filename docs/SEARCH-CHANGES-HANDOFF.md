# Property Search — changes since your last integration

> Written for the programmer who already wired the earlier search
> markup, CSS and JS. **This is a delta doc**, not a from-scratch
> rewrite. If you already know the old chassis, you only need to read
> the sections marked "**changed**" — everything else is the same.

**Companion docs (still current):**
- `docs/SEARCH-HANDOFF.md` — architecture, index, results page.
- `docs/SEARCH-MODAL-HANDOFF.md` — modal chassis.
- `docs/CHANGES-search-suggestions.md` — earlier suggestion changes
  (Part 1 + Part 2). Part 2 covers the "pinned/scrolling chips, panel
  cleanup, mobile recents on shared chassis" work that landed on
  `origin/main` in the previous push. **This delta doc covers the work
  AFTER that.**

---

## TL;DR — what actually moved

| Area | Change | Where |
|---|---|---|
| **Nav search pill** | Pinned city chip host + horizontally scrolling locality chips + fade + "+N" overflow chip | `partials/nav.html`, `styles.css` (`.chip-scroll`) |
| **Suggestion panel** | Header only on first-entry idle; drop the redundant selected-locations block; close (not blank) when locations are picked and not typing; typing re-opens | `main.js` |
| **Recents** | Compact pills (desktop) and a horizontal-scroll rail reusing the shared carousel chassis (mobile `#mobRecents`), matching the Popular-cities row | `main.js`, `partials/mobile-search-modal.html` |
| **Cache-busters** | `main?v=91`, `styles?v=20` | `partials/nav.html` and every page's `<link>` / `<script>` |
| **Nothing else in the search stack has moved** | Filter logic, URL builder, backend contract, SRP — untouched | — |

**If you already integrated the search work as of the previous push,
your DB layer + URL builder + SERP page are unchanged.** All of this
is presentation-layer + a few new selectors to wire in your PHP
template.

---

## 1 · Nav search pill — new markup **(changed)**

The old markup had the search bar as a single input. The new markup
splits it into three slots: a **pinned city chip** on the left, a
**scrolling locality chips rail** in the middle, and the input on the
right.

**Look for:** `#searchPill` in `partials/nav.html`.

```html
<div class="search-pill" id="searchPill">
  <!-- pinned city chip lives here, injected by JS -->
  <div id="cityChipHost" class="chip-host"></div>

  <!-- scrolling locality chips + fade -->
  <div class="chip-scroll" id="localityChipScroll">
    <!-- chips appended by JS; overflow beyond 2 collapses to +N -->
  </div>

  <input id="qInput" class="q-input" placeholder="..." />
  <button id="searchGo" class="btn-go">Search</button>
</div>
```

**What your PHP renderer needs:**
- Print the shell above verbatim (the JS finds and populates it).
- Do NOT render chips server-side — the JS reads state from
  `sessionStorage` / the URL and paints chips on load. Server-render
  chips will double-paint.
- The `data-*` attributes on `#cityChipHost` and `#localityChipScroll`
  are read-only inputs to the JS; don't add other data attrs to those
  nodes.

**Backend contract:** unchanged. The pill submits the same query
params as before — city id, locality ids, sublocality ids, free-text
query. See `docs/SEARCH-HANDOFF.md` for the URL builder.

---

## 2 · Chip overflow + "+N" — new interaction **(changed)**

When more than 2 locality chips are selected, the third-and-later
collapse into a single "+N" chip. Clicking "+N" opens a **Selected
Locations** manage view (a dropdown panel over the input).

**Selectors to know:**
- `.chip-scroll .chip` — a rendered chip.
- `.chip-scroll .chip--more` — the "+N" chip.
- `#selectedLocationsPanel` — the manage-view panel.

**What your PHP renderer needs:** nothing extra. The JS handles overflow
detection on load and on chip add/remove.

---

## 3 · Suggestion panel state machine — subtle change **(changed)**

Old behaviour: the panel always showed a header + recents + popular
cities block.

**New behaviour:**
1. First-entry idle (input has focus but no query and no chips):
   header + recents + popular. Same as before.
2. Locations picked, input not typing: **panel closes** (not blanks).
   Old code kept it open showing a "Selected locations" block; that
   block is gone.
3. User starts typing again: panel re-opens with suggestions.

**Why the change:** the redundant "Selected locations" block duplicated
what the chip pill already showed on the left, adding noise for no
gain.

**Your integration:** if you had the old block in your PHP template,
delete the container element and any PHP branching that populated it.
The chip pill is the single source of truth for selected locations
now.

---

## 4 · Mobile recents rail — shared carousel chassis **(changed)**

Old mobile modal: recents rendered as a static list.

**New behaviour:** recents render as a horizontal-scroll rail using the
same chassis as the Popular-cities row above it.

**Look for:** `#mobRecents` in `partials/mobile-search-modal.html`.
Wraps in a `.rail-outer` + `.rail` shell (the portal-canonical carousel
chassis in `ghar-carousel.js`).

**Your integration:** if you server-render recents into the mobile
modal, wrap each pill in the `.rail` list and let `initCarousel()` on
`#mobRecents` do the rest. **Do NOT re-implement horizontal scroll** —
the shared chassis handles touch pan-y, auto-play gating (off for
recents; on for editorial rails), and bleed-edge behaviour.

Recents themselves are read from device localStorage on load (client
side). No server round-trip.

---

## 5 · Pincodes block in suggestion list **(changed)**

Typed queries that look like a 6-digit pincode now surface a
"Pincodes" block in the suggestion list.

**Look for:** the pincode detection branch in `main.js` (search for
`isPincode`). Renders a `.suggestion-group[data-kind="pincode"]` block.

**Your integration:** if your suggestion endpoint returns pincode hits,
the front-end already knows how to render them. If your endpoint
doesn't (yet), the block simply doesn't render — safe to ship without
backend changes and turn on later.

---

## 6 · Search-trigger surface — one canonical class **(changed)**

The old code had four different classes / IDs that all triggered the
search modal on mobile / desktop (`#openSearch`, `.js-search`,
`.mob-search-btn`, etc.). These collapsed into **one canonical class**:
`.js-search-trigger`.

**Your integration:** any element that should open the search modal
gets `class="js-search-trigger"`. The JS listens once via delegation.
Remove any custom `onclick="openSearchModal()"` you may have inlined —
those are no longer needed.

---

## 7 · Cache-busters **(changed — update these)**

Every `<link>` / `<script>` reference to `dist/styles.min.css` and
`dist/main.min.js` now uses `?v=20` and `?v=91` respectively.

**Your integration:** if you rebuild `dist/` yourself, bump both
version numbers everywhere they appear (`partials/nav.html` head, every
page's `<head>` block). Missing the bump = users on old bundles get
none of these changes.

---

## 8 · What did NOT change

- **URL builder** — same query-param format. `locids`, `sublocids`,
  city id, free-text `q`.
- **Backend contract** — same suggestion endpoint, same shape.
- **SRP / results page** — untouched.
- **Filter logic** — the frontmatter filter chips (BHK, price band,
  property type) are unchanged.
- **Sign-in modal** — separate concern, unchanged in this push
  (broker-package flow was added earlier).
- **OTP flow / phone country picker** — unchanged.

---

## 9 · Files changed in this delta

Read these three files if you want a full understanding:

- `main.js` — 44 occurrences of the new selectors
  (`chip-scroll` / `cityChipHost` / `mobRecents` / `jm-` /
  `gharCityMatch`). Search for `INITSEARCH` or `renderSearchPill` to
  find the block.
- `styles.css` — 361 occurrences of the same. The `.chip-scroll`,
  `.chip-host`, `.chip--more` classes live here.
- `partials/nav.html` — the new search-pill markup (2 hits).
- `partials/mobile-search-modal.html` — the mobile modal + `#mobRecents`
  rail (2 hits).

---

## 10 · Testing checklist

When you've re-integrated the changes:

1. **Desktop:** open the nav search. Type "Mumbai" → pick two
   localities → confirm chip pill fills. Add a third → confirm "+N"
   overflow chip appears. Click "+N" → confirm manage view opens.
2. **Desktop:** click into the input with no chips selected → confirm
   panel opens with recents + popular. Click a chip → confirm panel
   closes (not blanks). Type → confirm panel re-opens.
3. **Mobile:** tap search icon in bottom bar → modal opens. Confirm
   recents rail scrolls horizontally with touch. Confirm Popular-cities
   row above it scrolls the same way.
4. **Both:** type "560001" → confirm Pincodes suggestion group renders
   (if your backend returns pincode hits).
5. **Regression:** submit a search from either surface → confirm the
   SRP URL is identical to what the old code produced. If not, the URL
   builder wasn't preserved and you need to compare against
   `docs/SEARCH-HANDOFF.md` §URL builder.

---

## When something's broken

- Chip pill empty on load → the JS ran before `sessionStorage` /
  URL parse. Check bundle load order: `dist/main.min.js` must load
  AFTER the pill markup (i.e. it's `defer`-loaded at the end of `<head>`
  or before `</body>`).
- "+N" chip never appears → check `.chip-scroll` has `overflow: hidden`
  in CSS. The count is derived from measured width, not from the item
  count.
- Recents rail doesn't scroll on mobile → `initCarousel('#mobRecents')`
  didn't run. Check `ghar-carousel.js` loaded on the mobile modal.
- Panel keeps re-opening after chip pick → your PHP is re-focusing the
  input on chip change. Remove the focus call.

---

**Last updated:** 2026-08-20.
