# Design Pillar Template — Backend Handoff

> One template renders every Design vertical pillar landing (7 pages) and every Collection landing. This doc covers the URL routing, template hooks, content schema, and known follow-ups.

**Working example (live):** `/design/architecture` → [design-architecture.html](../design-architecture.html)
**Catalog entry:** [design-system.html#design-pillar](../design-system.html#design-pillar)
**Related:** [docs/DESIGN-ARTICLE-HANDOFF.md](DESIGN-ARTICLE-HANDOFF.md) for the article (`/design/{slug}`) template — the pillar template is its sibling.

---

## 1. What this template covers

One file (`design-architecture.html`) is the canonical renderer for **all** of the URLs below. The backend's job is to fill the placeholders for each URL — no per-pillar layout fork.

| URL | Pillar | Status |
|---|---|---|
| `/design/series` | Series | template ready, page not materialized |
| `/design/architecture` | Architecture | **live** (materialized example) |
| `/design/interiors` | Interiors | template ready, page not materialized |
| `/design/spaces` | Spaces | template ready, page not materialized |
| `/design/designers` | Designers | template ready, page not materialized |
| `/design/vastu` | Vastu | template ready, page not materialized |
| `/design/guides` | Guides | template ready, page not materialized |

It also covers **Collection landings** (`/design/celebrity-homes`, `/design/spotlights`, `/design/inspiration`, `/design/brands`, all roundup/material/audience/discipline/style tag pages) — same template, just with the `.subnav-link.active` lifted off (Collections aren't in the 7-pill subnav).

Designer profile listing + designer profile detail are NOT in scope here — they share shape with `/people/{slug}` and will be built with that work.

---

## 2. URL routing

Live demo (Vercel + local dev) maps `/design/architecture` → `design-architecture.html` via two parallel configs that **must stay in sync**:

**`vercel.json`** — production rewrites:
```json
"rewrites": [
  { "source": "/design/architecture", "destination": "/design-architecture.html" },
  { "source": "/design/series",       "destination": "/design-series.html" },
  { "source": "/design/interiors",    "destination": "/design-interiors.html" },
  { "source": "/design/spaces",       "destination": "/design-spaces.html" },
  { "source": "/design/designers",    "destination": "/design-designers.html" },
  { "source": "/design/vastu",        "destination": "/design-vastu.html" },
  { "source": "/design/guides",       "destination": "/design-guides.html" }
]
```

**`serve.mjs`** — local dev rewrites (mirror the above in the `REWRITES` map at the top of the file).

The other 6 destinations are wired but their target files don't exist yet. Visiting `/design/interiors` 404s today. When the next pillar page is materialized, drop the file at root with the matching name — the rewrite already routes to it.

When the PHP backend takes over, replace this scheme with a single route:

```php
// routes/design.php
Route::get('/design/{slug}', function ($slug) {
  $allowed = ['series','architecture','interiors','spaces','designers','vastu','guides'];
  if (!in_array($slug, $allowed)) abort(404);
  return view('design-pillar', ['slug' => $slug, ...]);
});
```

…and delete the static `.html` files + `vercel.json` rewrites + `serve.mjs` map.

---

## 3. Template hooks (placeholders)

The renderer needs these values per request. Names in `{CURLY_BRACES}` here are illustrative — the PHP/template-engine syntax will be the engine's.

| Hook | Type | Example | Where it lands |
|---|---|---|---|
| `{PILLAR_NAME}` | string | `"Architecture"` | `<title>`, OG meta, `<h1>` in `.dp-hero__title`, the breadcrumb current, ARIA labels |
| `{PILLAR_SLUG}` | string | `"architecture"` | canonical URL, `.subnav-link.active` match |
| `{PILLAR_DEK}` | string (≤200 chars) | `"Studios and stories shaping how India builds…"` | `<meta name="description">`, OG description, `.dp-hero__dek` |
| `{FILTER_CHIPS[]}` | list of `{label, slug, count}` | `[{"label":"Coastal","slug":"coastal","count":7}, …]` | `.dp-filterstrip__inner` (one `.dp-chip` per item; first chip is "All" injected by the template, not in the list — totals come from this list, not from the hero) |
| `{CARDS[]}` | list (paginated, default 12) | see card schema below | `.dp-grid` (one `.hr-card--ed` per item) |
| `{LOAD_MORE_HREF}` | string | `"/design/architecture?page=2"` | `.dp-loadmore` `href` |
| `{SPONSORED}` | single object `{href, image, brand_name, eyebrow, title, sub}` or null | the mid-grid sponsored slot | `.hr-card--sponsored` inserted between grid rows |
| `{SERIES_RAIL[]}` | list of `{name, slug, count, image}` | see series schema below | `.dp-series__rail` (one `.dp-series-card` per item) |
| `{PEOPLE_RAIL[]}` | list of `{name, slug, role, portrait}` | architects + designers tagged with the pillar | `.dp-people__rail` (one `.dp-person-card` per item, links to `/people/{slug}`) |
| `{BRANDS_RAIL[]}` | list of `{name, slug, tag, mark_text or logo_url}` | brands from `docs/BRANDS-curated.md` tagged with the pillar | `.dp-brands__rail` (one `.dp-brand-card` per item, links to `/brands/{slug}`) |
| `{PARTNER_HREF}` | string | `"/brandconnect?vertical=architecture"` | `.dp-partner` block CTA — pillar-scoped Brand Connect placement |

### Card schema (`{CARDS[]}` items)

```json
{
  "href":      "/design/bijoy-jain-alibaug",
  "image":     "https://images…?w=800&q=80&auto=format&fit=crop",
  "eyebrow":   "Coastal · Studio Mumbai",
  "title":     "Inside Bijoy Jain's Alibaug retreat — where stone, water and quiet do the talking.",
  "byline":    "Sumera Bhatia · 12 min read"
}
```

Markup the template generates per card:
```html
<a href="{href}" class="hr-card hr-card--ed">
  <div class="hr-card__thumb">
    <div class="hr-card__media" style="background-image:url('{image}')"></div>
  </div>
  <div class="hr-card__body">
    <span class="hr-card__eyebrow">{eyebrow}</span>
    <h3 class="hr-card__title">{title}</h3>
    <p class="hr-card__sub">{byline}</p>
  </div>
</a>
```

### Series rail schema (`{SERIES_RAIL[]}` items)

```json
{
  "name":  "Studio Visit",
  "href":  "/design/series/studio-visit",
  "count": 11,
  "image": "https://images…?w=600&q=80&auto=format&fit=crop"
}
```

Show ALL series sitting inside the pillar (no truncation needed — the rail scrolls horizontally on every viewport via the shared carousel chassis).

### Page IA (final, in render order)

```
1.  Header nav + subnav            (byte-identical chrome)
2.  Hero                           .dp-hero
3.  Filter strip                   .dp-filterstrip
4.  Story grid — first 6 cards     .dp-grid
5.  Sponsored editorial break      .hr-card--sponsored (sell-able)
6.  Story grid — last 6 cards      .dp-grid (continuation)
7.  Load more CTA                  .dp-loadmore
8.  Series in {Pillar} rail        .dp-series
9.  People in {Pillar} rail        .dp-people       ← new
10. Brands in {Pillar} rail        .dp-brands       ← new
11. Brand Connect partner CTA      .dp-partner      ← sell-able
12. Across Ghar.tv strip           DEFERRED — see §7
13. Footer                         (partial)
```

Sections 5, 9, 10, 11 are new in this version; the rest are unchanged from the first cut. (An earlier draft also had a "Lead editorial card" between hero and filter strip; rolled back per user feedback — the simple text hero reads better.)

### Monetization slots (the surfaces sales can sell)

| Slot | Where | Pricing tier (suggested) | What buyer gets |
|---|---|---|---|
| **Sponsored editorial break** (section 6) | mid-grid, spans all columns | Premium sponsored | Editorial-grade headline + photo + AD-style "Presented by" disclosure. Native, not banner. One per pillar at a time. |
| **Brand Connect partner CTA** (section 12) | above footer | Standing slot | Always-on Brand Connect lead-gen. Routes to `/brandconnect?vertical={pillar}`. Not buyer-specific — Ghar.tv's own pitch. |
| **Brands rail tile featuring** (section 11) | inside `.dp-brands__rail` | Curated placement | Brand appears on the pillar landing with `/brands/{slug}` link. Order in the rail determines weight (leftmost = most prominent). |

The People rail (section 10) is editorial, not monetized — surfaced architects/designers are who Ghar.tv's editorial covers, not a paid placement.

---

## 4. What's BYTE-IDENTICAL across pages (do not fork)

Three blocks **must stay identical** with `design.html` and `design-article.html`:

| Block | Where it lives | Maintenance rule |
|---|---|---|
| `<head>` nav-template `<style>` (lines ~94-200 of `design-architecture.html`) | inline `<style>` in each design-* page | Change in `design.html` first, copy-paste verbatim to siblings. |
| `<header id="navStack">` markup (mainNav + subnav) | inline in each page | Same — copy-paste verbatim. The only per-page difference is which `.subnav-link` carries `.active`. |
| `<!-- PARTIAL footer:start --> … :end -->` and `<!-- PARTIAL oc-menu:start --> … :end -->` | injected by `npm run build:partials` from `partials/footer.html` and `partials/oc-menu.html` | Edit the partial once, run the build, commit both the partial and the regenerated pages. |

When the backend takes over partials become real `include`s:

```php
<?php include 'partials/oc-menu.html'; ?>
<?php include 'partials/footer.html'; ?>
```

…and the marker pairs go away. See [`partials/README.md`](../partials/README.md).

---

## 5. What's NEW on this template (the `.dp-*` chassis)

| Class | Role | Lives in |
|---|---|---|
| `.dp-page` | `<main>` wrapper, removes article-style bottom padding | inline `<style>` block in `design-architecture.html` |
| `.dp-hero` | Section 1 — crumbs + title + count + dek | inline |
| `.dp-hero__crumbs`, `.dp-hero__title`, `.dp-hero__dek` | hero parts | inline |
| `.dp-filterstrip` + `.dp-chip` | Section 2 — sticky filter chips | inline |
| `.dp-grid-wrap` + `.dp-grid` | Section 3 — 3-col → 2-col → 1-col card grid | inline |
| `.hr-card--sponsored` (inside `.dp-grid`) | Section 3B — full-grid-width sponsored editorial break with AD-style disclosure strip | inline |
| `.dp-loadmore-wrap` + `.dp-loadmore` | Section 4 — single text CTA at grid foot | inline |
| `.dp-series` + `.dp-series__rail` + `.dp-series-card` | Section 5 — related-series carousel | inline |
| `.dp-people` + `.dp-people__rail` + `.dp-person-card` | Section 5B — People in {pillar} (round portraits) | inline |
| `.dp-brands` + `.dp-brands__rail` + `.dp-brand-card` | Section 5C — Brands in {pillar} (wordmark tiles) | inline |
| `.dp-partner-wrap` + `.dp-partner` | Section 5D — Brand Connect partner CTA (sand bg, white pill, mirrors `.ad-partner-bc` from design.html) | inline |

> **Why inline.** The `.dp-*` block lives inline in `design-architecture.html` for the first iteration so the chassis is self-contained — easy to read, easy to fork. Once a second pillar page goes live (e.g. when `/design/interiors` is built), promote `.dp-*` to `styles.css` so both pages share one source. Don't promote earlier — premature centralization with one consumer is harder to refactor than to live with.

---

## 6. What's REUSED (Reuse-First Protocol)

The template intentionally avoids creating new components for:

| Need | Reused from | How |
|---|---|---|
| Story card | `.hr-card` + `.hr-card--ed` from `design.html` | Same class names, same markup. `.hr-card`'s **base styling lives inline in design.html, not in `styles.css`** — the relevant rules for the `--ed` variant are re-stamped inside `.dp-grid` scope so the cards still render here. See section 9 follow-up. |
| Series rail carousel | `.rail-outer` + `.rail` shared chassis (`ghar-carousel.js`) | Outer wrap + inner rail with `width:max-content`; chassis init runs at page bottom. Drag on desktop, native swipe on touch. |
| Header / mobile pill / subnav | byte-identical inline block from `design.html` / `design-article.html` | Copy-paste verbatim; only the active pill class differs per page. |
| Footer / off-canvas menu | `partials/footer.html` + `partials/oc-menu.html` | Materialized at build time via `npm run build:partials` (now includes `design-architecture.html` in its `PAGES` array). |
| Mobile search pill | canonical `.search-trigger` class from `styles.css` | Untouched. |

---

## 7. The Across-Ghar.tv block — deferred

`design.html` has an `<section class="ad-around">` block (Editorial / GharTalks / Industry Voices / Events strips, each cross-linked by `topic=design`). The pillar template currently includes the **markup hidden** (search for `<section class="section-wrap ad-around" … hidden>` in `design-architecture.html`). The block doesn't render because the `.ad-*` CSS lives inline in `design.html` only.

**Follow-up:** extract the `.ad-around` / `.ad-vertical*` / `.ad-mod*` rules from `design.html`'s inline `<style>` into `styles.css`, then unhide the section on `design-architecture.html` and swap the topic filters (`topic=design` → `topic=architecture`). One CSS extraction unlocks the block on every future pillar page for free.

---

## 8. Mobile / responsive behavior

- **Breakpoints:** `≤743.98px` = mobile, `744-999.98px` = tablet (2-col grid), `≥1000px` = desktop (3-col grid).
- **Filter strip:** horizontally scrollable on mobile, sticky on every viewport. Background is `warm-white` so the underlying grid scrolls behind it cleanly.
- **Series rail:** native horizontal scroll on touch, drag-to-scroll with `ghar-carousel.js` on desktop ≥1024.
- **Touch targets:** chips and load-more pill are ≥44px tall.
- **Bottom bar:** the standard mobile bottom bar (`#bottomBar` with Ghar / Post Property / Account / Menu) appears at `≤743.98px`, identical to every other inner page.

---

## 9. Known follow-ups (carry forward)

1. **Extract `.ad-*` chassis to `styles.css`** so the Across-Ghar.tv strip can render on pillar pages (see section 7).
2. **Extract `.hr-card` base CSS to `styles.css`** so the chassis doesn't depend on each consumer page re-stamping `position:relative` + display props. Today: `.dp-grid` AND `.dp-lead` scopes both replicate the bits they need (search for `// .hr-card base styling…` and the `.dp-lead .hr-card` block); this works but is fragile.
3. **Extract `.ad-partner-bc` chassis to `styles.css`** so the Brand Connect partner CTA doesn't get duplicated on every pillar page. Today: the `.dp-partner` block in `design-architecture.html` mirrors design.html's `.ad-partner-bc` rules — keep them in sync until one source wins.
4. **Extract `.hr-card--sponsored` chassis to `styles.css`** so the sponsored editorial slot is reusable. Today: defined inside `.dp-grid` scope inline; same fragility.
5. **Promote `.dp-*` from inline to `styles.css`** once the second pillar page (likely `/design/interiors`) is built. Do this AFTER 2/3/4 so the dp-* block isn't dragging duplicated chassis CSS with it.
6. **Materialize the other 6 pillar pages** by copying `design-architecture.html` per template-handoff section 3 and adding the new filename to `scripts/build-partials.mjs` `PAGES` array.
7. **Designer profile detail** — defer until `/people/{slug}` work, where it will share the profile-detail template.
8. **Series sub-landing** (`/design/series/celebrity-homes`, etc.) — different template, defer.
9. **Real portrait + logo assets for the People + Brands rails.** Today the People rail uses generic Unsplash portraits (per [[feedback_template_images]] — these are template images, not actual people photos) and the Brands rail uses Gazpacho-text wordmarks instead of logo files. When real assets land in `brand_assets/people/` and `brand_assets/brands/`, swap the URLs in the rail markup; markup itself doesn't change.

---

## 10. Local dev / build

```bash
# Start dev server (mirrors Vercel rewrites)
node serve.mjs

# After editing a partial (footer.html or oc-menu.html), regenerate every page
npm run build:partials

# Full build (partials + Tailwind + styles + JS)
npm run build
```

The Architecture page is reachable at `http://localhost:3000/design/architecture` once `serve.mjs` is running.

---

## 11. Reference

- Memory: [[project_design_ia_7nav]], [[project_design_page_architecture]], [[feedback_reuse_first_protocol]], [[feedback_shared_chrome_byte_identical]]
- CLAUDE.md → "REUSE-FIRST PROTOCOL"
- Catalog: [design-system.html#design-pillar](../design-system.html#design-pillar)
- Sibling templates: [DESIGN-ARTICLE-HANDOFF.md](DESIGN-ARTICLE-HANDOFF.md) for `/design/{slug}` stories
