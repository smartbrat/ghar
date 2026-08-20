# Handoff Index: Where to start

> Entry point for a programmer receiving this codebase. All handoff docs
> live in this `docs/` folder. Each one is a contract for a specific
> vertical or template — read the ones relevant to what you're implementing
> first. Don't try to read them all at once.

---

## Read in this order

### 0. Fresh checkout? Read the delta first.

If you're pulling on top of a previous checkout, read the changelog and
the search delta **before** touching anything — they capture what moved
since the last GitHub push so you don't re-integrate work already done.

| Doc | What's in it |
|---|---|
| [`CHANGELOG-since-last-github.md`](CHANGELOG-since-last-github.md) | Every commit in this push, ordered oldest → newest, with the programmer action for each. |
| [`SEARCH-CHANGES-HANDOFF.md`](SEARCH-CHANGES-HANDOFF.md) | **Read this if you already integrated the earlier search markup.** Delta doc — only what moved since your last search integration. URL builder + backend contract are unchanged. |

### 1. Foundation (read first, no matter what you're building)

| Doc | What's in it |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | Design system, colour discipline, typography rules, spacing, universal navigation architecture, ecosystem definitions. **Load-bearing** — everything below assumes this. |
| [`BACKEND-INTEGRATION-GUIDE.md`](BACKEND-INTEGRATION-GUIDE.md) | PHP + MySQL wiring: suggested DB schema, routing options, form endpoints, sponsored content semantics, reuse-first protocol, local dev. |
| [`TEMPLATES-USAGE.md`](TEMPLATES-USAGE.md) | How to render brand + person pages server-side from [`../_dev/templates/`](../_dev/templates/) — the source-of-truth templates that ship in the repo. Field-by-field data contract, `[hidden]` auto-hide rule, share-modal resolver chain. |
| [`STORY-schema.md`](STORY-schema.md) | Content data model — how a single story article is tagged, so it can route correctly to brand/person/pillar/vertical pages. |

### 2. Pick by vertical

**Working on brand or person profile pages?**
- [`PROFILE-TEMPLATES-HANDOFF.md`](PROFILE-TEMPLATES-HANDOFF.md) — brand + person profile templates, hero patterns (classic vs Pattern B), socials system (desktop tooltip + mobile linktr.ee), content attribution rules, Voices `.vx-*` chassis, contact panel, closer treatment, bordered-grid metrics, open items, what NOT to touch. **Load-bearing rule: content attribution.**

**Working on search?**
- [`SEARCH-CHANGES-HANDOFF.md`](SEARCH-CHANGES-HANDOFF.md) — **delta doc, read first if you already have an integration.** What changed since the last push.
- [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md) — search architecture, index, results page
- [`SEARCH-MODAL-HANDOFF.md`](SEARCH-MODAL-HANDOFF.md) — the search modal chassis
- [`CHANGES-search-suggestions.md`](CHANGES-search-suggestions.md) — earlier suggestion changes (Part 1 + Part 2)

**Working on Design pillar?**
- [`DESIGN-PILLAR-HANDOFF.md`](DESIGN-PILLAR-HANDOFF.md) — pillar page (`/design`)
- [`DESIGN-ARTICLE-HANDOFF.md`](DESIGN-ARTICLE-HANDOFF.md) — article template
- [`DESIGN-taxonomy.html`](DESIGN-taxonomy.html) — the pillar's full content taxonomy (open in a browser to read)

**Working on Voices / Industry Voices vertical?**
- [`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) — Voices vertical (landing / SRP / piece template)

**Working on the Brand Connect commercial layer?**
- [`BRANDCONNECT-spotlight-delivery.md`](BRANDCONNECT-spotlight-delivery.md) — how Spotlight tier surfaces render
- [`BRAND-SERVICE-TEMPLATE-ANIMATION-SPEC.md`](BRAND-SERVICE-TEMPLATE-ANIMATION-SPEC.md) — the service brand template's motion contract
- [`RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md) — internal rate reference (do NOT display to users)

**Working on People vertical?**
- [`BRIEF-people-pages.md`](BRIEF-people-pages.md) — People vertical brief
- [`PEOPLE-portrait-sourcing.md`](PEOPLE-portrait-sourcing.md) — sourcing rules for portraits
- [`PEOPLE-portrait-sourcing-queue.md`](PEOPLE-portrait-sourcing-queue.md) — active sourcing queue

**Working on Brands vertical?**
- [`BRIEF-brands-srp.md`](BRIEF-brands-srp.md) — the brands SRP page brief
- [`BRANDS-curated.md`](BRANDS-curated.md) — curated brand list

**Working on a specific audience page (Buyers / Brokers / Developers)?**
- [`BRIEF-buyers-page.md`](BRIEF-buyers-page.md)
- [`BRIEF-brokers-page.md`](BRIEF-brokers-page.md)
- [`BRIEF-developers-page.md`](BRIEF-developers-page.md)

**Working on the article editor migration?**
- [`EDITOR-migration-plan.md`](EDITOR-migration-plan.md)
- [`PRICE-LOOKUP-playbook.md`](PRICE-LOOKUP-playbook.md) — price data lookup

---

## Cross-cutting rules

These aren't tied to one vertical — they apply everywhere.

### Content attribution (from PROFILE-TEMPLATES-HANDOFF §5)

- Content **about a brand** → brand profile
- Content **by or about a person** → person profile
- **Never cross-contaminate.** A "Presented by TEEARCH" article on Tarun
  Motta's page is a bug. An analyst quote from Anuj Puri on Avirahi's
  Voices row (when it doesn't name Avirahi) is a bug.
- Voices are person-attributed by definition. They belong on person
  profiles unless the voice is specifically *about* the brand.

### Reuse-first (from `CLAUDE.md`)

Before generating ANY new component or CSS block:
1. Grep [`_dev/reference/design-system.html`](../_dev/reference/design-system.html) — the catalog
2. Grep [`styles.css`](../styles.css) — does a class already paint this?
3. Grep [`main.js`](../main.js), [`ghar-carousel.js`](../ghar-carousel.js) — does a function already do this?

If something new IS needed, add it to the design-system catalog so the
next page reuses it.

### File placement (from `CLAUDE.md`)

The project root is production-only. Every non-production file lives
under [`_dev/`](../_dev/README.md). If you're building something that
isn't going to a route in `vercel.json` / `serve.mjs`, it belongs in
`_dev/prototypes/`, `_dev/archive/`, or `_dev/scratch/`.

---

## Where things live

### CSS

- [`styles.css`](../styles.css) — portal-canonical shared CSS. The `.tip`
  tooltip chassis, `.jm-*` form fields, `.btn-*` buttons, `.rail-outer`
  carousel chassis, and much more live here.
- [`dist/styles.min.css`](../dist/styles.min.css) — minified version, what
  production loads.
- [`dist/tailwind.css`](../dist/tailwind.css) — Tailwind (only used in some
  design-system prototypes; profile pages don't use Tailwind).
- Per-page inline `<style>` blocks — profile pages, article templates, and
  many vertical pages ship their own inline CSS for page-specific
  patterns. **Consolidation of these into shared stylesheets is pending
  Phase 2 work.**

### JS

- [`main.js`](../main.js) — homepage + shared UI (search, nav, off-canvas
  menu, modals). Ships bundled as `dist/main.min.js`.
- [`ghar-carousel.js`](../ghar-carousel.js) — shared horizontal carousel
  chassis, `initCarousel()` factory. Deferred load, waits on GSAP.
- [`ghar-ticker.js`](../ghar-ticker.js) — ticker/marquee chassis (used on
  the homepage ecosystem strip).
- Per-page trailing `<script>` blocks — profile pages carry
  page-specific IntersectionObserver setup (`data-past-image`,
  `data-past-hero`, `data-contact-in-view`, `data-nav-hidden`).

### Partials

- [`partials/`](../partials/) — HTML snippets included by pages via the
  build-partials script. Nav, footer, contact modal, share modal,
  sign-in modal, etc.
- [`scripts/build-partials.mjs`](../scripts/build-partials.mjs) — the
  build tool that inlines partials into HTML files at build time.

### Assets

- [`brand_assets/`](../brand_assets/) — brand logos, project photos,
  people portraits. Organised by brand or by purpose (brands/,
  brand-photos/, people/, etc.).
- [`brand_assets/people/`](../brand_assets/people/) — portrait photos
  for person profile pages. Named `{slug}.jpg` or `{tenant}-{slug}.jpg`
  when the portrait comes from the brand's own photography.

### Templates + reference (ship in the repo, but live under `_dev/`)

The `_dev/` directory is gitignored EXCEPT for these paths, which
are load-bearing for the programmer:

- [`../_dev/templates/`](../_dev/templates/) — brand + person profile
  source-of-truth templates. See [`TEMPLATES-USAGE.md`](TEMPLATES-USAGE.md).
- [`../_dev/README.md`](../_dev/README.md) — explains the `_dev/`
  convention.
- [`../_dev/reference/design-system.html`](../_dev/reference/design-system.html)
  — living component catalog. Open at
  `http://localhost:3000/design-system` (dev server auto-maps it).

### Server + routing

- [`vercel.json`](../vercel.json) — production routing (Vercel)
- [`serve.mjs`](../serve.mjs) — local dev server (`node serve.mjs`).
  Auto-maps every `.html` under `_dev/*/` at boot and falls back to it
  on a root 404 — so moved prototypes keep their URLs.
- Local dev URL: `http://localhost:3000/`

---

## Recent work (2026-08 snapshot)

Broadly finalised:
- Design pillar (`/design`) + article template
- Voices vertical (landing / SRP / piece template)
- Brand profile template (Avirahi + Teearch as exemplars)
- Person profile template (Tarun / Devesh / Hiten / Darshini)
- Search + search modal
- Universal navigation (topbar + off-canvas + mobile bottom bar)

Pending big items:
1. **Pattern B mobile hero port** to 4 older brand tenants (godrej /
   obeetee / saint-gobain / asian-paints). See
   [`PROFILE-TEMPLATES-HANDOFF.md §3.3`](PROFILE-TEMPLATES-HANDOFF.md).
2. **Contact panel light migration** on the same 4 tenants (still ship
   dark `.bpr-contact` + older `.bpr-form` chassis). See
   [`PROFILE-TEMPLATES-HANDOFF.md §8.3`](PROFILE-TEMPLATES-HANDOFF.md).
3. **CSS consolidation** — extract shared patterns from per-page inline
   `<style>` blocks into shared stylesheets. Best done after templates
   fully stabilise.
4. **Content attribution audit** — 3 older brand tenants (Obeetee,
   Saint-Gobain, Asian Paints) spot-checked as clean of cross-brand
   pollution; a full pass would be prudent before hard launch.

---

## Conventions & gotchas

- **Never use `position: fixed` on `<body>`** to lock scroll. GSAP
  ScrollSmoother is active on desktop and breaks. Use event-based
  scroll blocking instead (see nav / modal implementations for the
  pattern).
- **Every carousel** auto-plays only when in viewport
  (IntersectionObserver, threshold 0.15). Stop when leaves viewport.
- **Touch:** use `touch-action: pan-y` + 8px direction-detection
  threshold before capturing horizontal swipe. See carousel chassis.
- **Bleed-edge pattern** for horizontally-scrolling rails:
  `margin-left/right: calc(-1 * var(--pad-h)); padding-left/right: var(--pad-h)`.
  Never wrap the parent in `overflow: hidden`.
- **On XXL screens (>1600px)** use `min(100vw, var(--max-w))` for card
  width calculations to prevent stretch.
- **Country code picker** in sign-up / phone fields is a searchable
  dropdown with 20+ countries. Not a toggle.
- **The `.pp-hold` interactive index chassis** on person profiles is
  retained for future use. JS at the bottom of person profile files is
  null-guarded — if `[data-pp-index]` isn't present, the block silently
  skips. Don't remove the JS.

---

## When something's broken

1. Check the console — most page-specific JS is defensive but a load
   failure of `ghar-carousel.js` will break rails silently.
2. Check `data-*` attributes on `<body>` — the direction-aware nav +
   contact-in-view + past-hero + past-image flags drive most
   scroll-triggered UI.
3. Check the browser dev server — `serve.mjs` auto-maps `_dev/*.html`
   pages at boot; if a prototype URL 404s, restart the server.
4. Screenshots of the current state live in
   `screenshots/claude-screenshots/` (git-ignored subfolder).

---

**Last updated:** 2026-08-20 — added `CHANGELOG-since-last-github.md`,
`SEARCH-CHANGES-HANDOFF.md`, `BACKEND-INTEGRATION-GUIDE.md`,
`TEMPLATES-USAGE.md`; un-gitignored `_dev/templates/` +
`_dev/README.md` + `_dev/reference/design-system.html` so the
programmer receives them.
