# Changelog — since last GitHub upload

> Read this first if you have a checkout of `origin/main` from before
> this push. Everything below is new or changed. Ordered oldest →
> newest so you can walk the sequence.

**Ranges:**
- `origin/main` @ pre-handoff → `09016c4` = the original **10-commit
  handoff bundle** (Sections A below).
- `09016c4` → last committed = a follow-up stretch of tenant-content,
  routing and hero-polish work driven by product review (Section B
  below).
- `09016c4` → **HEAD** = the profile polish + Brand Engine
  architecture stretch (Section C below). **Pushed 2026-08-31** as
  four commits: `79887c1` (C.1) · `d8d426c` (C.2) · `e7a8eff` (C.3) ·
  the deploy-wiring commit (C.5) that carries this update.

---

## Section C — Brand Engine architecture + profile polish (PUSHED 2026-08-31)

Two conceptually separate stretches held together in the working tree.
When pushing, split into 3 focused commits per the recommendation at
the end of this section.

### C.1 — Profile polish (uncommitted from the earlier stretch)

Cross-tenant polish batch that landed before the architecture pivot.
All 14+ files uncommitted; no visual regressions expected because every
change was pattern-consistent across the affected tenant set.

- **Contact form → button on every brand + person profile** — replaced
  every inline `<form class="{bpr,pp}-contact__form">` with a single
  `Contact` / `Get in touch` button that opens the shared
  `partials/br-contact-modal.html` via `data-brand-contact
  data-brand="…"`. Programmer's dynamic-template ask: one enquiry
  surface across the portal instead of N inline forms.
  Files: 8 brand tenants + 14 person tenants + both source templates.
- **Voices card CSS cleanup + native rail** on 5 person profiles
  (Hemal Shah, Tarun Motta, Pirojsha Godrej, person-profile.html,
  person-profile-states.html) — removed stale local `.vx-card`
  overrides that were shadowing the canonical `.vx-*` chassis in
  `dist/styles.min.css`. Replaced with lean `.pp-voices-grid` — 3-col
  desktop grid, native horizontal scroll rail below 900px with
  scroll-snap + viewport-edge bleed. Wrapped `.vx-card__claim` text
  in curly quotes since canonical expects quotes in content, not
  decorative `::before/::after`.
- **Intel card footer fix** on 15 files (2 brand tenants + 13 person
  tenants) — `.bpr-intel-card__foot` was cramping when text wrapped
  to 2 lines. Fixed: `line-height 1 → 1.4`, `letter-spacing .12em →
  .1em`, `align-items center → flex-start`, added `text-wrap: pretty`.
- **`.pp-contact` grid alignment fix** on 14 person profiles — panel
  was double-padded (parent `.pp-wrap` gutters + own padding stacked).
  Removed horizontal padding on `.pp-contact` (base rule + mobile
  override both `padding: 0`). Panel now aligns to site container grid
  exactly like `.pp-sec` (left 24 / right 34 on mobile).

### C.2 — Brand Engine Architecture (2026-08-31)

Fundamental pivot from "per-tenant static templates" to an entity +
section-registry + distribution + entitlement engine, in response to
the 126-item Brand Connect + Entity Publishing + Distribution Engine
strategic brief. **Studio deliverables** — the programmer's build
comes on top.

**New docs under `docs/` (11 files, ~7,000 lines):**

- **[BRAND-ENGINE-AUDIT.md](BRAND-ENGINE-AUDIT.md)** (585 lines) —
  observational audit. What exists vs the 126-item ambition. Template
  quality matrix. 15 numbered gaps.
- **[BRAND-ENGINE-ARCHITECTURE.md](BRAND-ENGINE-ARCHITECTURE.md)**
  (1445 lines) — the skeleton. 15 sections covering entity model,
  section registry, composition rules, distribution surfaces,
  entitlements, motion, admin controls, AI ingestion, 8-phase
  migration plan, deliverables split.
- **[PROFILE-SECTIONS-SPEC.json](PROFILE-SECTIONS-SPEC.json)** (966
  lines) — section registry. 26 sections (14 brand + 12 person) with
  variants, fields, content_availability_rules, fallbacks,
  entitlement_gates. Analogue of `EDITOR-blocks-spec.json` for
  profile pages.
- **[COMPOSITION-RULES.md](COMPOSITION-RULES.md)** (407 lines) —
  category × section priority + variant defaults + display order.
  Seed tables for every brand category (developer / architect /
  materials / furniture / lighting / finance / proptech / vastu /
  interior) + every person discipline (architects / interiors /
  developers / brandleaders / advisors / research).
- **[ENTITY-RELATIONSHIPS.md](ENTITY-RELATIONSHIPS.md)** (584 lines)
  — many-to-many join tables (`brand_person_relationships`,
  `brand_project_relationships`, `person_project_relationships`,
  `person_aliases`, `article_entity_mentions`). SQL migrations,
  resolver signatures, entity resolution rules with confidence
  weights. Migration is additive; `people.brand_id` becomes derived
  until deprecation.
- **[DISTRIBUTION-SURFACES.json](DISTRIBUTION-SURFACES.json)** (468
  lines) — 17 named surfaces (directories, related rails, project
  pages, locality pages, homepage, newsletter, search) with
  eligibility rules + organic/promoted slots + ranking vocabulary +
  entitlement gates. One `resolveEntitiesForSurface()` powers every
  entity card.
- **[ENTITLEMENTS.md](ENTITLEMENTS.md)** (497 lines) — capability
  vocabulary (~35 keys grouped by scope) + 3 seed packages (Presence
  ₹15k / Spotlight ₹60k / Partner ₹200k) + admin override schema +
  resolver contract. Nowhere in code: `if (brand.package === 'X')`.
- **[MOTION-SYSTEM.md](MOTION-SYSTEM.md)** (386 lines) — 4 profiles
  (minimal / editorial / cinematic / dynamic) + token contract +
  shared `window.gharProfileMotion` observer. Codifies the recipe
  from the Horizon Architects tuning: threshold 0 + rootMargin -160px
  + per-item observation. Kills per-page inline observers.
- **[ADMIN-CONTROLS-SCHEMA.md](ADMIN-CONTROLS-SCHEMA.md)** (462
  lines) — `profile_section_configs` schema + 4 content modes (auto
  / manual_select / manual_content / custom_html) + admin UI
  wireframes + role-based access + audit log.
- **[AI-INGESTION.md](AI-INGESTION.md)** (539 lines) — Brand kit →
  6-stage pipeline (extract / resolve / propose / suggest / review /
  publish). Explicit "AI never does" list. Provenance table.
- **[BRAND-CAPABILITY-MATRIX.md](BRAND-CAPABILITY-MATRIX.md)** (356
  lines) — capability × package matrix. Commercial positioning per
  package. Add-ons + custom bundles + grandfathering.
- **[ATTRIBUTION-AUDIT-LEGACY-TENANTS.md](ATTRIBUTION-AUDIT-LEGACY-TENANTS.md)**
  — full attribution pass on Obeetee / Saint-Gobain / Asian Paints
  closing HANDOFF-INDEX pending item §6. Verdict: **CLEAN.** All
  cross-brand references live in HTML/CSS comments (developer notes),
  never user-facing.

**Docs updated:**

- **[HANDOFF-INDEX.md](HANDOFF-INDEX.md)** — new "Brand Engine
  Architecture" section (§1a) referencing all 11 new spec docs.
  Marked as load-bearing for the next stretch.

**Studio reference files updated:**

- **`_dev/reference/design-system.html`** — 7 new catalog entries at
  `#brand-profile-fallbacks` (section registry / modifier vocabulary
  / motion profiles / composition rules / entitlement gates / entity
  relationships / distribution surfaces) alongside the existing 2
  patterns.
- **`_dev/templates/brand-profile-states.html`** (NEW, 1031 lines) —
  every-section reference. 28 st-case blocks showing one worked
  example per section+variant. Analog of the existing
  `person-profile-states.html`. Serve at
  `http://localhost:3000/_dev/templates/brand-profile-states.html`.

### C.3 — Phase 0 section-ID normalisation

Load-bearing schema fix — normalises the section-ID drift between
service-family and developer-family templates so URL anchors are
consistent across every brand tenant.

- **`brand-profile-godrej-properties.html`**: `<section id="story">`
  → `<section id="about" data-previous-anchors="story">`; `<section
  id="projects">` → `<section id="work" data-previous-anchors="projects">`.
- **`brand-profile-avirahi.html`**: same treatment.
- **`_dev/templates/brand-profile-developer.html`** (source template):
  same treatment so future developer-family tenants start canonical.

`data-previous-anchors` is a marker for the future URL redirect layer.
When the composer + routing land, they'll read this attribute to
301-redirect old `#story` / `#projects` bookmarks to the canonical
`#about` / `#work`.

### C.4 — Memory updated

`project_brand_engine_architecture` memory entry expanded to reflect
that all 11 spec docs now exist as real files (previously they were
described in the architecture doc inline). Points at file paths for
the next session to find them.

### C.5 — Design system published at `/design-system`

`_dev/reference/design-system.html` was already tracked (the
`.gitignore` carries an explicit `!` negation for it alongside
`_dev/templates/`) but had **no Vercel route**, so it would only ever
have deployed at the raw `/_dev/reference/design-system` path — and
the file uses *relative* asset paths, which resolve correctly only
from a root URL.

- **`vercel.json`** — added
  `{ "source": "/design-system", "destination": "/_dev/reference/design-system" }`.
  A rewrite, not a redirect, so the browser URL stays `/design-system`
  and `href="styles.css"` / `href="gazpacho.css"` resolve against the
  root exactly as they do under `serve.mjs`. Deployed URL now matches
  the local one the CLAUDE.md protocol tells every session to open.
- **`robots.txt`** — `Disallow: /design-system` and `Disallow: /_dev/`.
  The catalog is reachable for the team and the integrator, but it is
  an internal reference and has no business in search results.
- **`_dev/reference/design-system.html`** — `<meta name="robots"
  content="noindex, nofollow">` as the belt to robots.txt's braces.

The catalog's Pattern 3–9 entries deep-link into `docs/*.md` and
`docs/*.json`; those resolve on the deploy because `outputDirectory`
is `.` and the whole `docs/` folder ships with C.2.

### Commit split as pushed

Four focused commits:

1. **`79887c1` Profile polish: voices rail, intel foot, contact grid, In Focus wide host** — C.1. 24 files.
2. **`d8d426c` Brand engine: full spec set, design-system catalog entries, states page** — C.2. 13 new files + 2 modified reference files.
3. **`e7a8eff` Brand profile phase 0: section-id normalisation** — C.3. 3 files. Also repaired the developer template's sub-nav + scrollspy, which still pointed at the pre-rename IDs.
4. **Publish the design system at /design-system** — C.5. `vercel.json` + `robots.txt`, plus this changelog.

---

## Section B — Follow-up work after the handoff bundle

### Vercel deploy fix (unblocks everything else)

- `e582f32` **vercel: fix invalid JSON** — `vercel.json` used
  `/* … */` and `//` comments which Vercel's strict JSON parser
  rejected. Every push since the comments were added had been failing
  silently and Vercel kept serving the last successful build.
  Rewritten as valid JSON. **Deploy immediately started working.**

### New tenant pages + directory changes

- `bf81234` **brands: developer category + Godrej + Avirahi + Scarlet
  stub** — new `data-cat="developer"` category on `/brands`; three
  new developer cards; Scarlet Splendour stubbed from
  `_dev/templates/brand-profile-service.html`.
- `bde8ca6` **logos** — real Avirahi mark downloaded from
  `avirahi.com`; Godrej hero switched to the modern
  `godrej-properties.svg` wordmark.
- `4021d4d` **brands + founders + /brands reorder** — TEEARCH →
  Avirahi → Scarlet → Godrej at the top of `/brands`; four founder
  stubs (Adi/Pirojsha Godrej, Vinod Doshi, Suman Kanodia); Godrej
  brand page rebuilt from the Avirahi Pattern-B chassis with
  Godrej-blue theme.
- `3cd36d4` **presentation-stub tenant pages** for the four brand
  founders. `docs/PROFILE-TEMPLATES-HANDOFF.md` §data model
  documents the person-record shape they follow.
- `1b4214c` **real portraits for 3 of 4 founders** (Adi = Wikimedia,
  Pirojsha = EY India EOY 2024, Suman = Love Happens Magazine).
  Vinod stays on monogram — no verified public portrait on record.
- `cc4d195` **real Godrej content + Scarlet template swap** — Godrej
  page's hero + about + featured + timeline + presence + contact
  block all rewritten with real Godrej facts (1897 group founded,
  1990 property arm, 2010 IPO, 8+ metros). Scarlet page overwritten
  with `_dev/templates/brand-profile.html` — the authoritative
  Scarlet template with real Scarlet content (13 mentions of
  Suman Kanodia / Ashish Bajoria / Matteo Cibic / Nika Zupanc).
- `2ced97e` **real imagery on Godrej + Scarlet** — every project
  card on Godrej gets its own real project photo (Emerald Waters,
  Godrej Two, Woods, Reserve, Aristocrat, The Trees, Splendour,
  Nurture). Scarlet page swapped its four Unsplash stock refs
  for real Scarlet product photography.
- `d8dbf63` **Ashish Bajoria person profile + Scarlet team links** —
  Scarlet template linked to `/people/suman-bajoria` (Suman's
  married name); her tenant profile is at `/people/suman-kanodia`.
  Links fixed and Ashish added as `/people/ashish-bajoria`.
- `eeb0284` **Avirahi team profiles + hero fix + local dev fix** —
  three Avirahi partner stubs added (`/people/virendra-shah`,
  `/hardik-shah`, `/satish-bhansali`) so the brand page's team rail
  no longer 404s on click. Godrej hero moved to clean
  `godrej-hero.png` (no baked-in ad text). Local dev server
  restarted with a fresh process so all new routes resolve.

### serve.mjs — auto-fallback for new tenants

- `b76e032` **serve.mjs: auto-fallback for `/brands` and `/people`
  slugs** — `serve.mjs`'s `REWRITES` map is snapshotted at boot,
  so a freshly-added tenant used to need a manual server restart
  to open on localhost. Now `/brands/{slug}` and `/people/{slug}`
  paths that miss the boot map try `brand-profile-{slug}.html` and
  `person-profile-{slug}.html` respectively before 404-ing. The
  "no /brands/:slug catch-all" safety still holds — only slugs
  whose tenant file actually exists resolve.

### Godrej hero — image + gradient polish

The Godrej brand-profile hero went through several iterations to
land on the right image + overlay combination. Final state:

- **Hero image**: `/brand_assets/brand-photos/godrej-hero.png` — a
  clean rendered twin-tower coastal composition. No embedded text,
  no watermark. (3.2 MB — a `.webp` compression pass would be a
  useful follow-up but doesn't affect readability.)
- **Two-layer scrim**:
  - Layer 1 — diagonal wash `to top right, .75 → 0` anchored at
    bottom-left where the content column sits. Fully transparent
    by the upper-right sky where the tower dominates.
  - Layer 2 — edge trim `.28 top / .42 bottom` so the topbar and
    the meta-row footer stay legible independently.
  - Mobile reverts to a vertical wash because content stacks over
    the middle of the frame.
- **`.bpr-hero__metrics` = glass panel** — subtle glassmorphism
  cribbed from the Teearch `.bpr-hero__overlay-btn` pattern:
  `background: rgba(255,255,255,.025)` + `backdrop-filter: blur(8px)
  saturate(1.05)` + hairline border + soft drop shadow. Reads as
  "a floating card holds the numbers" without looking like a
  frosted plate. Reuse this pattern on any future developer/similar
  brand-profile page.

Related iterations that landed and were then refined: `1e1b50b`
(darker scrim), `5a6bdd1` (dusk photo swap), `a0b70ab` (directional
scrim), `8a68eb6` (glass ribbon), `9f712e8` (subtler glass),
`690416d` (diagonal scrim restored), `bd05b9c` (glass further
softened).

### Fixes rolled into intermediate commits

- `3aad1ce` **role fields trimmed** — founder record `role` was
  producing tab titles like "Adi Godrej | Chairman Emeritus, Godrej
  Group, Godrej Properties" because the renderer appends
  `p.company.name` separately. Roles trimmed to just the title.
- `fc2fbcf` **peer-name wrap fix + Scarlet identity swap** —
  `.pp-peer__name` was `nowrap+ellipsis`, cutting "Pirojsha Godrej"
  to "Pirojsha Go…" on Adi's team card. Now wraps.
- `c35eeac` **teearch + person profiles polish** — TEEARCH H1
  standardised to all-caps; About-section IO reveal fires earlier;
  peer-name wrapping ported; Voices card `.vx-card__meta` gets
  breathing space.
- `3e78a74` **mobile UX** — carousel bleed on design/architecture,
  series, heritage pages; sticky contact-modal header at mobile;
  voices empty-state buttons cleaned up.

---

## Section A — Original handoff bundle

Older commit sequence, kept for reference. Ordered oldest → newest.

---

## Commit sequence

### 1 · `3be9609` — partials: fix Ghar.tv logo path so subpath URLs resolve it

**Portal-wide bug.** `partials/oc-menu.html` and `partials/footer.html`
referenced `brand_assets/logo.svg` without a leading slash. On subpath
URLs (`/people/{slug}`, `/brands/{slug}`, `/design/{slug}`,
`/voices/{slug}`) that resolves relative to the URL and 404s. Absolute
path `/brand_assets/logo.svg` fixes both. `scripts/build-partials.mjs`
inlined the fix into every consuming page.

**Programmer action:** none if your PHP layouts already include partials
via a build step. If you inline the nav / footer directly in a PHP
template, make sure the logo `src` is absolute (`/brand_assets/logo.svg`)
so it works on every URL depth.

### 2 · `7ae4e1d` — docs: programmer handoff for profiles, voices, brand connect, briefs

Fifteen new / refreshed handoff docs under `docs/`. **Start with
`HANDOFF-INDEX.md`.** It orders reading by vertical and captures the
cross-cutting rules (content attribution, reuse-first, file placement).

### 3 · `b5ef760` — assets: brand logos, team portraits, project photos, kit graphics

55 files. New asset families under `brand_assets/`:

- `brand-photos/teearch-*` — 4 project shots, 6 category shots.
- `brands/teearch-client-*.png` — 21 client logos.
- `brands/{anarock,godrej-properties,obeetee}.svg` — vector logos.
- `brands/scarlet-splendour.png` + `.original-padded.png`.
- `people/teearch-{tarun,hiten}-motta.jpg` + `.original.jpg`.
- `people/_originals/` — pre-crop originals kept for future re-crop.
- `_quarantine-stock/` — staging for hero candidates that were tried
  and set aside.
- `kit-assets/` — partner-kit graphics (glyphs, mock hub / category /
  story previews, OG image).

**Convention:** `{name}.original.jpg` sits next to `{name}.jpg` when the
displayed image is a cropped derivative. Backend should serve the crop;
the original is a source-of-truth for future re-crop.

### 4 · `3273a39` — voices: ship landing + SRP + article template

Industry Voices vertical, three surfaces:

- `voices.html` — landing.
- `voices-search.html` — SRP.
- `voices-article.html` — piece template.
- `voices.md` — single source of truth for all published copy.

The card chassis `.vx-*` (card / claim / eyebrow / meta) is
portal-canonical. It's reused on Tarun Motta's person profile for the 2
sample Voices cards. Keep the two in sync when either page changes.

**See:** `docs/VOICES-HANDOFF.md` for full data model + surfaces.

### 5 · `8932c32` — design pillar: architecture template, series/heritage franchises, partner kit

- `design.html` — hub refresh: 5+2 subnav, 3-col hero, sponsored
  surfaces on editorial slots only.
- `design-article.html` — article template with pillar / tags[] /
  typed-attrs schema. Authoritative taxonomy in
  `docs/DESIGN-taxonomy.html`.
- `design-architecture.html`, `design-series.html`,
  `design-heritage.html` — franchise landings.
- `design-partner-kit.html` — brand-partner one-pager with taxonomy,
  rate anchors, sample surfaces.
- `design-listing.css` — shared listing CSS extracted from repeated
  franchise pages.

**See:** `docs/DESIGN-PILLAR-HANDOFF.md`, `docs/DESIGN-ARTICLE-HANDOFF.md`.

### 6 · `260097d` — person profiles: template + 4 tenants, data-driven build

- `person-profile.html` — shared template. Portrait fade-only reveal
  (no transform — avoids visible top-gap bug).
- `person-profile-tarun-motta.html` — Voices cards using `.vx-*`
  chassis.
- `person-profile-devesh-motta.html` — no portrait, monogram fallback.
- `person-profile-hiten-motta.html` — monogram fallback.
- `person-profile-darshini-mahadevia.html` — full published strip
  (real academic authorship).
- `scripts/build-person-profiles.mjs` + `scripts/person-profile-data.mjs`
  — data-driven build. **A single record file (`person-profile-data.mjs`)
  stamps all four tenants** through the same render function, so metrics,
  socials, and notable-projects stay in one place.

Content-attribution rule: person profiles show only content by/about the
person, never their employer's brand content.

**See:** `docs/PROFILE-TEMPLATES-HANDOFF.md`, `_dev/templates/person.html`.

### 7 · `b6fe1cd` — brand profiles: 6 tenants + Pattern B split hero + shared contact modal

Six brand-profile tenants ship in two hero patterns:

- **Pattern B** (full-width image + lifted white card + logo overlap):
  `brand-profile-teearch.html`, `brand-profile-avirahi.html`.
- **Classic hero** (side-by-side hero image + meta card): the other
  four (godrej-properties, obeetee, saint-gobain, asian-paints).

**Shared behaviour on all six:**

- `.bpr-hero__socials` cluster — desktop tooltip, mobile linktr.ee
  stack. Icons appear first.
- `.bpr-contact` panel — light default on Teearch + Avirahi; four
  older tenants still ship the dark variant (pending Pattern B port).
- Contact CTA brand-filled from paint (no scroll-flip).
- Sticky bottom bar retreats on contact-in-view via
  `data-contact-in-view` body flag; `body { padding-bottom: 0 }` when
  set.
- Modal over-promise line removed.

Shared modals:
- `partials/br-brief-modal.html` — RFP / project brief capture.
- `partials/br-contact-modal.html` — universal contact modal (`.jm-*`
  chassis, portal form system).

**See:** `docs/PROFILE-TEMPLATES-HANDOFF.md`, `_dev/templates/brand-profile.html`.

### 8 · `38fe031` — directories: /brands, /people, brand-partner landing

- `brands.html` — Brands directory (canonical `.bpr-person` card,
  shared city matcher `window.gharCityMatch`, whole-row reveal via
  `window.gharGridReveal`).
- `brands-search.html` — Brands SRP.
- `people.html` — People directory (`.pe-*` chassis vs `.br-*` on
  brands). 31 people, 19 with monogram fallback. No person without a
  real portrait — hidden card, wired into every count.
- `for-brands.html` — Brand Connect landing (three doors: Brands /
  Developers / Brokers).

**See:** `docs/BRIEF-brands-srp.md`, `docs/BRIEF-people-pages.md`.

### 9 · `35586ec` — partials: subscribe modal, search-chip pill, mobile bottom-bar refresh

- `partials/subscribe-modal.html` + `subscribe.html` — new subscribe
  surface (email-only, no account).
- `partials/nav.html` — WHERE pill with pinned city chip
  (`#cityChipHost`) + horizontally scrolling locality chips
  (`.chip-scroll`), +N overflow chip.
- `partials/mobile-search-modal.html` — mobile recents rail on shared
  carousel chassis (`#mobRecents`); compact suggestion spacing;
  Pincodes block in the suggestion list.
- `partials/bottom-bar.html` — universal mobile bottom bar refresh.
- `scripts/build-partials.mjs` — adds subscribe-modal marker pair
  handling.

**See:** `docs/SEARCH-CHANGES-HANDOFF.md` (specifically written for the
programmer who already worked on the old search files).

### 10 · `dd27e4a` — shared: styles/JS + dist bundles + server routing

Shared chassis + infra that back all preceding commits.

- `styles.css` — canonical additions: `.vx-*` Voices, `.bpr-*` brand
  profile, `.pp-*` person profile, `.tip` tooltip, `.jm-*` form,
  `.chip-scroll`, `.rail-outer` / `.rail`.
- `main.js` — search-suggestion UX pass, off-canvas menu hardening,
  share-modal image resolver chain (`.pp-portrait img` fallback for
  person profiles).
- `ghar-carousel.js` — IntersectionObserver auto-play (threshold 0.15),
  reverse-jump bug fix, touch pan-y with 8px direction gate.
- `gt-fancybox.js` — lightweight lightbox for the design article
  template.
- `nav.css` — sticky-nav collapse gates + sub-nav slot rules.
- `index.html` — homepage integration of newer entry points.
- `serve.mjs` — `_dev/*.html` auto-map at boot; 404 fallback to `_dev`
  variant.
- `vercel.json` — clean-URL rewrites, `/design/:slug` catch-all,
  split alternation for design franchise routes.
- `dist/main.min.js`, `dist/styles.min.css`, `dist/tailwind.css` —
  rebuilt to match sources. **Currently newer than sources** (verified
  timestamps).
- `package.json` + `package-lock.json` — script updates.
- `.gitignore` — `_dev/` ignore with `_dev/templates/` +
  `_dev/README.md` + `_dev/reference/design-system.html` exceptions
  (see next commit).

---

## What changed structurally

### New pages routed for production

| URL | File | Vertical |
|---|---|---|
| `/voices` | `voices.html` | Voices |
| `/voices/search` | `voices-search.html` | Voices |
| `/voices/{slug}` | `voices-article.html` | Voices |
| `/design` | `design.html` | Design pillar |
| `/design/architecture` | `design-architecture.html` | Design pillar |
| `/design/series` | `design-series.html` | Design pillar |
| `/design/heritage` | `design-heritage.html` | Design pillar |
| `/design/partner-kit` | `design-partner-kit.html` | Design pillar |
| `/design/{slug}` | `design-article.html` (catch-all) | Design pillar |
| `/brands` | `brands.html` | Brands directory |
| `/brands/search` | `brands-search.html` | Brands directory |
| `/brands/{slug}` | `brand-profile-{slug}.html` (6 tenants) | Brand profiles |
| `/people` | `people.html` | People directory |
| `/people/{slug}` | `person-profile-{slug}.html` (4 tenants) | Person profiles |
| `/for-brands` | `for-brands.html` | Brand Connect |

All routing lives in `vercel.json`. Any new tenant slug must be added
there OR routed via a catch-all pattern. `serve.mjs` mirrors the same
rewrites for local dev.

### Templates that ship for backend integration

`_dev/templates/` (**newly included in the repo — see gitignore
exception**):

| Template | Purpose |
|---|---|
| `brand-profile.html` | Default brand profile template (chromeless full-hero). |
| `brand-profile-developer.html` | Developer-brand variant. |
| `brand-profile-service.html` | Service-brand variant (like Teearch). |
| `person-profile.html` | Person profile template (generated by build script). |
| `person-profile-states.html` | Every data-gated state rendered in one scroll — the reference for `[hidden]` auto-hide behaviour. |
| `person.html` | Seed markup for the build script. |

**See:** `docs/TEMPLATES-USAGE.md` for the data-binding contract.

### Shared JS globals introduced

| Global | Source | Purpose |
|---|---|---|
| `window.gharCityMatch(a, b)` | `main.js` | Canonical city-slug matcher. Every filter chip and directory grid uses this. Do not fork. |
| `window.gharGridReveal(gridEl, {stagger, threshold})` | `main.js` | Whole-row reveal — reads live column count from CSS grid, batches by row (not by fixed card count). |
| `window.gharCanCollapseNav()` | `main.js` | Nav collapse gate: only collapse L1 if a separate L2 subnav bar (`--subnav-h > 0`) takes the top. Prevents the nav vanishing on pages that don't have a subnav. |

---

## What did NOT change

- Homepage layout and copy (only integration points touched).
- Off-canvas menu structure (behaviour hardened, structure unchanged).
- Search results (SERP) page — the search *modal* changed (see
  `docs/SEARCH-CHANGES-HANDOFF.md`); the actual SRP is unchanged.
- Sign-in / sign-up modal chassis. Broker package flow was added as a
  variant in an earlier commit but the base modal is unchanged.
- All `docs/BRIEF-*.md` audience-page briefs (buyers, brokers,
  developers) — those pages are not yet built; the briefs are spec.

---

## Files that were RENAMED

`design-vertical-proposal.html` → `_dev/prototypes/design-vertical-proposal.html`.
Prototype now lives under `_dev/prototypes/` per the file-placement
rule. No production route referenced it.

---

## Deployment notes

- Dist bundles (`dist/main.min.js`, `dist/styles.min.css`,
  `dist/tailwind.css`) are pre-built and committed. `vercel.json`
  sets `buildCommand` to a no-op — Vercel serves the repo as static.
- Cache-buster query params (`?v=91`, `?v=20` on main.min.js /
  styles.min.css) are set inside each HTML page. Bump the version on
  any dist rebuild so browsers re-fetch.
- If you rebuild `dist/` yourself (via whatever npm script you have),
  make sure the version query in `partials/nav.html` and per-page
  `<link>` / `<script>` tags gets bumped too, else old bundles serve.
