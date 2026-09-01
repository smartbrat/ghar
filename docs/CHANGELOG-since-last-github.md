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
- `09016c4` → `e7a8eff` = the profile polish + Brand Engine
  architecture stretch (Section C below). Pushed 2026-08-31 as four
  commits: `79887c1` (C.1) · `d8d426c` (C.2) · `e7a8eff` (C.3) · the
  deploy-wiring commit (C.5) that carried the previous CHANGELOG
  update.
- `e7a8eff` → **HEAD** = the brief-pages + Path B asset-extraction +
  brand-profile motion polish stretch (Section D below). Pushed
  2026-09-01.

---

## Section D — Brief pages + Path B asset extraction + motion polish (PUSHED 2026-09-01)

Three tightly related themes in one push:

- **New production pages** at `/brands/brief` and `/people/brief` for
  the "share a brief" flow. Not `/post-your-requirement.php`: that
  is the PROPERTY requirement form. A project brief is different.
- **Path B asset extraction (Phase 1)** — start of shared-CSS/JS
  consolidation across brand tenants. New `dist/brand-profile.min.css`
  (canonical CSS extracted from every tenant) and `dist/bpr-reveal.js`
  (shared scroll-reveal observer helper). Horizon is the first tenant
  ported to consume `bpr-reveal.js`; the other 7 tenants still carry
  their inline decorator block and will migrate in a follow-up pass.
- **Motion polish** — contact section redesigned, hero animation
  stack tuned for mobile, images fade-in via animation (not
  transition, which was wiping hover transforms), and per-card
  micro-cascade reveals for Services on Horizon + Teearch.

### D.1 — Brief pages: `/brands/brief` and `/people/brief`

New root files `brands-brief.html` + `people-brief.html`, and a shared
`partials/brief-form.html` that both pages inline. Routes wired in
`vercel.json` and `serve.mjs`. Every "Share a brief" CTA across the
`/brands` and `/people` surfaces + `partials/br-brief-modal.html` now
points here — previously they fell back to
`/post-your-requirement.php`, which is the PROPERTY requirement form
(buy/rent a home), not a hires-a-brand project brief. The modal reuses
the same `brief-form.html` partial, so the modal and the page are
byte-identical form-wise; the standalone pages are the no-JS fallback
and the canonical hit for `?ref=…` deep links.

### D.2 — Path B Round 1a: `dist/brand-profile.min.css`

50 KB canonical extract from Horizon Architects' inline `<style>`
blocks. Every rule in the file is byte-identical across all 8 brand
tenants — verified with a state-machine CSS parser that tracks brace
depth ignoring `{` / `}` inside comments and strings.
`scratchpad/extract-canonical-brand-css-v2.py` is the extractor.

What stays inline per tenant:
- `@font-face` (avoid FOUT per memory rule)
- `:root` theme tokens (`--brand`, `--brand-soft` differ per tenant)
- Tenant-specific overrides (dark contact, ambient hero, service
  card chassis variants, etc.)

Load order in each tenant `<head>`:
1. `dist/styles.min.css` (portal-shared)
2. `dist/brand-profile.min.css` (this file) — added this stretch
3. Per-page `<style>` (tenant overrides, loads LAST so cascade ties
   go to the inline rule)

Wiring: every brand tenant + source template got
`<link rel="stylesheet" href="/dist/brand-profile.min.css?v=1">`
added after the existing `dist/styles.min.css` link. Idempotent —
running `scratchpad/wire-brand-profile-link.py` again is a no-op.

**Round 1b (strip duplicated inline rules) is NOT in this push.** The
inline copies of these canonical rules still exist in every tenant;
they will be stripped in a future pass once visual regression coverage
is in place. Until then, the cascade behaves the same as before — the
inline `<style>` loads last and wins ties.

### D.3 — Path B Round 2: `dist/bpr-reveal.js` (shared reveal observer)

New shared script that owns the scroll-reveal IntersectionObserver
wiring for brand tenants. Extracted verbatim from Horizon Architects'
inline decorator, so behaviour matches byte-for-byte. Each tenant
calls it with its own MAP + optional trigger overrides:

```html
<script src="/dist/bpr-reveal.js"></script>
<script>
  bprReveal({
    map: [
      [".bpr-services__grid li", "js-reveal--rise"],
      [".bpr-work-grid",         "js-reveal--rise"],
      /* per-tenant selector list */
    ],
    threshold : 0,                             /* default 0.15 */
    rootMargin: '0px 0px -160px 0px'           /* default '0px 0px -60px 0px' */
  });
</script>
```

Group detection follows the class prefix: `"js-cascade"` → parent-
level cascade, anything else → single-element `"js-reveal"` treatment.
Selector misses are silent.

**Only Horizon is ported to `bprReveal(...)` in this push.** The other
7 tenants (`asian-paints`, `avirahi`, `godrej-properties`, `obeetee`,
`saint-gobain`, `scarlet-splendour`, `teearch`) still carry their
inline IIFE decorator block. Two reasons:

1. Each tenant's MAP is chassis-specific (developer family vs
   service family vs product family) and needs a per-tenant audit
   before consolidation.
2. A wholesale port earlier this session broke tenant-specific
   animation choices and had to be reverted; the follow-up will
   convert one tenant at a time with visual verification each step.

Programmer note: `bpr-reveal.js` requires `dist/brand-profile.min.css`
for the `.js-reveal--*` / `.js-cascade--*` styling. If the CSS fails
to load, the JS still runs harmlessly — classes get added but nothing
paints them.

### D.4 — Brand + person profile motion polish

**Contact section redesign** (every brand tenant + source templates):
- Two-column form-shape collapsed to a single-column contained rounded
  card. Section is now transparent; the warm-cream/dark fill lives on
  an inner `.bpr-contact__inner` with `border-radius: 24px`.
- Mobile (≤899px): card stretches full container width; desktop keeps
  a narrower centred card so the section reads as a considered CTA
  rather than a full-bleed slab.

**Hero animation stack** (all 8 brand tenants):
- Mobile-specific `bprHeroLogoPop` (logo scale .85 → 1 at .35s) and
  `bprHeroNameIn` (blur-in at 1.25s).
- Mobile sequence rebalanced so the reveal order is Logo → Badge →
  Eyebrow → Title → Description → Facts.
- In-flow logo pattern ported from Horizon to Avirahi + Godrej +
  Scarlet (previously `position: absolute + translate`, which the
  new `transform: scale(.85)` pop was wiping).
- Scarlet's mobile `animation: none` override on eyebrow/tagline/
  name/actions/meta-row removed — it was suppressing the cascade.

**Image fade-in** (~26 files across brand + person tenants):
- Switched `img[loading="lazy"]:not([data-no-fade])` from a
  `transition: opacity` shorthand (which set `transition-property:
  opacity` and wiped every OTHER property's transition — killing
  hover transforms on gallery/work sections) to a CSS animation
  (`gharImgFadeIn`). Hover animations restored.

**Section-ID normalisation Phase 0** (Godrej + Avirahi + developer
template): `#story → #about`, `#projects → #work` — pushed as
`e7a8eff` already, listed here for the timeline.

### D.5 — Motion polish, tenant-specific (2026-09-01)

- **Horizon — hero "Watch the Film" cue.** `.bpr-hero__filmcue` was
  not in the hero animation cascade selector list; it rendered
  instantly while everything around it staggered in. Added to the
  cascade with `animation-delay: .78s` (slots between tagline `.58s`
  and meta-row `1.15s`).
- **Horizon — Services micro-cascade.** Overrides the generic
  `.js-reveal--rise` on each `<li>` with a per-card internal
  cascade: the row rises subtly (14px, .55s), then the icon scales
  in at +.15s, the title slides in from the left at +.28s, the
  description fades in at +.40s. Each card still triggers
  independently via its own IntersectionObserver.
- **Teearch — Services micro-cascade.** Same pattern tuned to
  Teearch's 3-column card chassis
  (`.bpr-about--seamless .bpr-services__grid li`): card rises +
  scales up subtly (translateY 24 + scale .96, .75s), then num →
  title → desc reveal in sequence. Reads as clearly animated even
  when multiple cards enter the viewport together.

**Not in this push (parked, one of the standing open decisions):**
Godrej Properties has no rendered Spotlight section. The developer
template family omits `<section id="spotlight">` by default. Decision
taken 2026-09-01 to add Spotlight to the developer template default
(so every future developer tenant inherits it) — the actual markup
port + content sourcing is the next stretch, not this one.

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

---

## 2026-09-01 · Design system consolidation (UNCOMMITTED)

### `_dev/reference/design-system.html`

Grew from 8 chapters to 12, and gained a searchable sidebar. Backup of the
prior state: `_dev/archive/design-system-backup-2026-09-01.html`.

**Navigation.** The sidebar now carries a filter (`#dsSearch`) over all 149
entries, matching label, anchor and a `data-kw` synonym list, so a symptom
finds its chapter ("clipped", "dropped click", "rupee", "em dash"). `/` or
Ctrl/Cmd+K focuses it, arrows move a cursor, Enter jumps, Esc clears. Chapter
groups collapse, with state in `localStorage` under `ghar-ds-nav-open`.
An IntersectionObserver marks the current section and keeps it in view.

**Four sections that existed but were unreachable from the nav** are now
listed: `#design-pillar`, `#voices-chassis`, `#brand-profile-fallbacks`,
`#in-focus-block`. They were moved out of the middle of chapter 04 into the
new chapter 08 so nav order matches document order.

**New chapters** (08 to 11 appended; 00 to 07 keep their numbers and every
existing anchor still resolves):

- **08 Page Templates** — template families, chassis vs tenant, the four moved
  sections, brand profile theming and logo tiles, directories and person
  profiles, paid surfaces.
- **09 Motion** — pacing table, motion deltas, easing, IntersectionObserver
  triggers and fallbacks, hover and the click target, carousel motion.
- **10 Engineering Contract** — reuse protocol, file placement and head order,
  cascade traps, the partials system, shared helpers, defensive layer.
- **11 The Register** — every hard rule on one page with its reason, plus the
  open debts.

**Chapter 05 (UX Principles)** was a single stub list; it is now nine real
sections.

### Bugs found and fixed while doing the above

- `.ds-hero` in the catalog collided with the production `.ds-hero` (the
  Design Stories hero card) in `styles.css`, which the page links for its live
  demos. The catalog's page heading was inheriting a card's `border-radius`,
  `overflow:hidden` and `translateY(-3px)` hover lift. Renamed to `.ds-intro`.
  Audited every other doc-chrome prefix; no other collision.
- `.ds-aud-card` lifted on hover but only its small inner link was clickable.
  The card is now the link, and its hover is border plus shadow with no
  transform, per the click-target rule.
- `.ds-sidebar-toggle` (the mobile hamburger) rendered at every desktop width,
  on top of the sidebar brand: `display:flex` is declared after the
  `@media (min-width:1024px){display:none}`, so source order won. Default is
  now `none`, revealed in the mobile block.
- `.ds-sidebar-brand` was rendering underlined.
- Three `<svg height="auto">` (invalid attribute) threw console errors.
- `brand_assets/people/sanjay-puri.jpg` was referenced but never added, so a
  masked-photo exhibit showed a broken image. Swapped for `rajiv-saini.jpg`.

Console errors on the page: 5 before, 1 after (the Suiza font 404, which is a
tracked open debt).

### `styles.css` — `.if-*` viewport queries converted to container queries

`.if-block` sets `container-type: inline-size`, and its `@container
(min-width:880px)` rule carries a comment saying the block is queried on the
container so any future host gets the right composition. Two of its
breakpoints were nonetheless `@media`: `(min-width:760px)` and
`(min-width:1080px)`. The block therefore read the VIEWPORT while its siblings
read the container. On `/brands` and `/people` the two agree, so it looked
fine; anywhere the block is narrower than the page they disagree and the
composition inverts. Measured in the catalog: a 390px-wide instance on a
1037px viewport rendered the desktop grid, with no lead photo and a 180px
portrait beside a 127px text column. Both blocks are now `@container`. Every
selector inside them was `.if-*`, so nothing else is affected.

`dist/styles.min.css` rebuilt via `npm run build:styles`.

**Cache-buster NOT bumped, deliberately.** 52 pages carry
`styles.min.css?v=29`. The `.sp-section` that hosts `.if-block` is `hidden` in
both `brands.html` and `people.html`, so this change has no visible effect in
production today. Whoever unhides that slot must bump the version query in the
same commit.

### `_dev/reference/design-system.html#in-focus-block` rebuilt

The exhibit held four hand-written static previews that had drifted from
`brands.html` (missing the required `sp-block` co-class, `div` instead of
`aside`, no `aria-label`) and, because of the query bug above, rendered the
desktop composition inside its "mobile" frames. Replaced with one live
instance per kind, markup copied verbatim from `brands.html`, driven by a
width control (390 / 600 / 880 / 1120 / fill) so the container-query
behaviour is actually demonstrable.

---

## 2026-09-01 (second pass) · Bug sweep, live exhibits, In Focus redesign

### Bugs found and fixed

| Where | Defect | Fix |
|---|---|---|
| `styles.css` `.arrow-link` | The inline SVG had no `width`/`height` and no CSS size rule, so as a flex item it sized from the line box: it rendered **27x27** and pushed the label onto a second line (link box 115x42). `.btn-link` always had this rule; `.arrow-link` never did. | `.arrow-link svg{width:14px;height:14px;flex-shrink:0}` plus `white-space:nowrap` and an arrow-slide on hover to match `.btn-link`. Now 129x21, one line. |
| `partials/nav.html` + 17 pages | `#goBtn`, the red circular search submit, had no accessible name at all. | `type="button"` and `aria-label="Search"`. |
| `partials/nav.html` + `index.html` + 16 pages | The logo link's `aria-label` sat on the bare `<svg>`, which is not reliably exposed. The link itself had no name. | Name moved to the `<a>` (`aria-label="Ghar.tv home"`), the graphic marked `aria-hidden`/`focusable="false"`. Verified across 47 files: no unlabelled logo link remains. |
| `_dev/reference/design-system.html` | Six icon-only buttons in the Patterns mocks had no accessible name, while the production partial they mock labels every one. | Labelled all six. |

The nav fixes were applied to **`partials/nav.html` and every generated copy in the same edit**, so the partial and the pages agree and a future `npm run build:partials` reproduces them rather than reverting them. The build was deliberately NOT run, because 40-odd files are dirty from other work and a rebuild would overwrite any hand-edited nav span in them.

A page-wide sweep for the same class of unsized-SVG defect found no other instances; the two remaining large inline SVGs are intentional graphics.

### In Focus (`.if-*`) redesigned

Flagged twice as looking bad. Two separate causes, both fixed.

**1. The tenant hex was painting the whole panel.** `.if-block__inner` carried `background: var(--brand-canvas)` with white type and rgba-white chips on top, which is precisely what the portal's own brand-theming rule forbids: the accent's surface area must be tiny, never a section background. On a warm-white page a full-bleed colour field reads as bought space, which is what the component was created to stop being. It is now the portal's own card language (white ground, hairline rule, ink and muted type, ink CTA) with the tenant present through its own logo, its own photography, a 34px accent keyline and the monogram tint.

The CTA is ink rather than the tenant hex because a filled pill needs its label to pass AA and an arbitrary tenant colour cannot be guaranteed to. White on the live TEEARCH hex `#c67e35` measures 3.26:1, which fails. Ink with white is 15.9:1 for every tenant.

**2. The composition was a text block with three equal photos under it.** No focal point, and it read as a contact sheet. Rebuilt as an editorial spread: a full-bleed photo mosaic down one side (one lead frame spanning two rows, two supporting frames) with the identity column beside it. The mark and the name were also sitting side by side at the same scale, reading as a duplication; they are now stacked as a lockup at different scales. Hover scales the lead frame from inside its own overflow box instead of translating it, which would have opened a seam in a flush mosaic.

Markup was not touched, so `brands.html`, `people.html` and the catalog exhibit all keep working.

**Content fix:** the third work tile pointed at `teearch-pmc-1.jpg`, which is a project-list table from a deck, not a photograph (all three `teearch-pmc-*` files are). Swapped for `teearch-commercial-1.jpg`, a real project photo, and relabelled `Commercial`, in both `brands.html` and the catalog.

### Live exhibits added

The new chapters were reference tables with no visual proof. Six interactive exhibits now demonstrate the rules rather than asserting them:

- **Dropped clicks** (Ch 09) - two identical links, transform on the anchor vs on the media, with live enter/leave-cycle and landed-click counters. The flicker is reproducible.
- **Pacing and easing** (Ch 09) - the same four-element reveal at rushed / house / past-the-cap, with easing and rise-distance switches and a computed sequence total. Plays on entry, once.
- **Clipped shadows** (Ch 09) - two identical tracks, one without clearance, one padded 12/24/40 with margins pulled back.
- **All four counts** (Ch 05) - one section switched through N=0 / 1 / 4 / 24, showing the grid collapse via `:empty`, the `:only-child` cap, and the "See all" link hiding itself at zero.
- **44px targets** (Ch 05) - the hit area drawn, same 16px glyph in both.
- **Logo tiles and accent surface** (Ch 08) - both tile failure modes with the real assets, including `godrej-properties.original-padded.png` (the untrimmed 20%-fill file), plus the same tenant hex as canvas vs as a keyline.

### Logo export

The wordmark and the G mark now carry the same Copy / SVG / PNG contract as the nine canonical shapes, with three colours (brand red, ink, white) driving the preview and the raster. The shapes' CSS skin and export script were **generalised, not copied**: one implementation serves both blocks. Two improvements fell out of that: the download filename now comes from a `data-export-prefix` on the owning block, and the PNG canvas follows the viewBox aspect instead of being forced square, which had letterboxed the 890.6x196.8 wordmark into a mostly empty file. It now exports 1024x226.

### Chapter 06 colour section rewritten

It re-listed all 17 swatches that Chapter 01 already owns, which guarantees eventual drift. Replaced with what Chapter 01 does not cover: an earning test, a coverage budget per tier (foundation 85-100%, one theme colour 0-15%, brand red under 5%), a subject-to-colour decision table, and a **live contrast exhibit** that computes all 19 pairings in the browser from the same hex values the chips are painted with.

That exhibit immediately surfaced a real finding: **white on brand red is 4.04:1**, which clears the display floor and misses the body floor. The prose was corrected to match the measured data rather than overclaiming.

### Debt paid

Palette naming drift is resolved. Display names were split (Marigold/Coral/Olive 9 times against Turmeric/Terracotta/Sage 16) while every CSS token was `--turmeric`/`--terracotta`/`--sage`. Converged the display names onto the token vocabulary, since renaming tokens across `styles.css` is the riskier direction. The debt row in Chapter 11 and the callout in Chapter 06 were deleted in the same edit, per the register's own rule.

`dist/styles.min.css` rebuilt. Cache-buster still not bumped; see the note in the previous entry.

### Navigation exhibits rebuilt as live renders

The Patterns nav section was a hand-drawn mock in bespoke `hp-nav-*` classes and had drifted badly from what ships:

- Its eyebrow read **"07 - Navigation (from index4)"**. `index4.html` was promoted to `index.html` and no longer exists.
- It showed a "WHERE" search bar with **Buy / Homes** toggles and a Post Property pill as *the* nav. Production has at least two different variants, and the homepage toggle says **Residential**, not Homes.
- The content-page nav (mark + vertical name + one contextual CTA + menu, 81px) was not represented at all.
- The mock overflowed its own exhibit container.

Replaced with **live iframes of real pages**, clipped to the chrome, so the exhibit renders whatever `partials/nav.html` and `nav.css` currently produce and cannot drift again. Scale and crop height are measured at runtime from the container, so the frames fill their column at any page width and stay correct on resize. Added a spec table of the body classes that select each variant.

**17 other stale `index4` references** across the catalog were retargeted to `index.html` or "the homepage". Each of them pointed a developer at a file that does not exist.

### White on turmeric and sage

White on turmeric and white on sage are now the **house pairings**, as decided.

I flagged first that they measure 2.12:1 and 2.54:1, below the 3:1 display floor,
and proposed darkened variants. That was declined: the palette values stay, and
white is the pairing.

Implemented without falsifying the exhibit. Those two rows carry a **HOUSE
PAIRING** label instead of a WCAG score, because a pairing the brand has chosen
is a decision, not a threshold result, and scoring it against a bar it was never
selected to meet is the wrong frame. The measured ratio still shows, since the
number is the useful part: it says how much type weight the pairing needs. The
accompanying note gives the practical rule rather than a warning: set these at
display weight (Gazpacho or Inter 600 and up, 24px or larger on a 1080 canvas),
and use ink for a paragraph on those grounds, where it measures 8.44:1 and
7.03:1.

Every other pairing keeps its BODY / DISPLAY flags. No derived colours were
added; the palette is unchanged at 17 values.

---

## 2026-09-01 (third pass) · Staleness sweep continued

### Footer exhibit rebuilt as a live render

`#hp-footer` was the same defect as the nav: a hand-drawn mock of chrome that is
generated from `partials/footer.html`. It had drifted badly. The mock showed a
static six-column grid labelled Discover / Content / Media & Events / For
Business / Tools & Services / Company with links to **SuperPro**, **Developer
Mandate**, **Creator Network**, **Saved Homes**, **Shortlists**. The real footer
has six different columns (Discover, Read & Watch, Brands & People, GharEvents,
For You, Tools & Services), names those products **For Brokers**, **For
Developers**, **For Brand Partners**, and carries Brands, People and the four
event shows. It is also a **rail on the shared carousel chassis**, not a grid,
which is exactly the property the mock could not show.

Replaced with a live render, plus a spec of the four layers.

### Live renders can now anchor to any element

The mechanism built for the nav was extended: `data-nv-anchor` takes a selector,
measures that element inside the live page, grows the frame to the full document
height and shifts it so the element sits at the top of the viewport. That is how
a footer sitting 3,037px down a real page is shown live without depending on
scrolling inside the frame, which ScrollSmoother makes unreliable. Scale and
crop are measured, so the frames fit their column at any width and re-fit on
resize and on frame load.

### Hero

`#hp-hero` was honestly labelled a "design exploration", so it was not a false
claim, but it showed a three-panel composition with GharTalks and GharEvents
side panels while the shipped hero is a centred wordline over the four ecoForYou
cards, and nothing in the catalog showed the real thing. Added a live render of
`.e4-hero` above it and reframed the exploration as a direction that was
considered and not taken.

Also corrected the brand tagline in that mock: it read **"Real estate. For
you."** against 47 production instances of **"Real Estate. For You."** The
catalog was the only place with the wrong casing.

### Community gateway

`#hp-community` carried a **"Join the Community"** CTA on `href="#"`. Three
problems at once: "Join" is language the project rules explicitly exclude
(account creation happens only through Post Property, Post Requirement or the
SuperPro application), the link went nowhere, and there is no `/community`
route in `vercel.json` or `serve.mjs`. Rewritten around the two verticals that
do exist, with real links to `/brands` and `/people`.

### Placeholder links no longer throw the reader to the top

Twelve component exhibits use `href="#"` because the destination is not what is
being demonstrated. Clicking one to inspect an active state jumped to the top of
a 1MB document. One delegated handler neutralises the jump without touching the
markup.

### Aubergine added to the canonical shapes

Shape 9 (Flat Modern) moved from Brand Blush `#f6aaad` to **Aubergine
`#895772`**, which was the one theme tone with no shape. Updated in all four
places it was bound: the display grid, the source card swatch (which drives the
PNG export), the card's hex label, and the legend. Verified by rasterising the
exported SVG and sampling a pixel: `#895772`.

Fixed while in there: the legend listed shape 2 as **Saltbox**, which is shape
5's name. Its source card calls it **Peak-left**. Two shapes shared one name in
the legend and in a mask comment.

---

## 2026-09-01 (fourth pass) · Chapter 07 built, debts closed

### Chapter 07 (Print & Brand) is no longer an outline

It was seven `is-pending` stubs. Now seven built sections, 465 lines, with live
exhibits.

- **What changes off screen** - the four things print does not forgive (gamut,
  dot gain, the moving guillotine, font embedding), each with what to do.
- **Colour in CMYK** - all twelve values converted **in the browser from the
  same hex the swatch is painted with**, so the table cannot drift from Chapter
  01. Total ink coverage computed and flagged per swatch. Rich-black builds,
  stock table, and the honest note that **brand red is out of process gamut**
  and prints duller.
- **The logo in print** - minimum widths in millimetres per process (litho,
  screen, embroidery, foil), proportional clear zone, three colourways.
- **Typography in points** - full hierarchy with sizes, leading and tracking,
  plus measure, hyphenation and the Indian numeral conventions.
- **The page** - a to-scale bleed / trim / safety diagram, the twelve-column
  grid, 12pt baseline, gutter allowance for bound work.
- **Stationery & collateral** - business card and A4 letterhead rendered at
  **true proportion** (verified: 1.648, which is exactly 89/54).
- **Large format** - sizing by viewing distance (7mm of cap height per metre),
  with resolution going *down* as size goes up, plus a pre-flight checklist.

**No Pantone numbers are printed.** A spot colour has to be chosen against a
physical guide under standardised light on the actual stock. A fabricated number
would be trusted and would be wrong, so the chapter gives the process and a
place to record the confirmed values instead.

### Debts closed

- **Gazpacho tracking** was specified three ways: `-0.035em` in Chapter 01,
  `-0.025em` in the project brief, and "default tracking at every size" as a
  standing instruction. Settled on **default tracking**, which is the standing
  rule and the typographically correct answer: tightening closes the counters,
  and in print they then fill with ink. Chapter 01 updated, both callouts and
  the register row removed.
- **The Suiza 404** is gone. The `@font-face` pointed at
  `brand_assets/SuizaDEMO-SemiBold.otf`, which is not in the repository, so it
  requested a missing file on every page load while everything fell back
  silently anyway. Commented out with restore instructions, and anything asking
  for Suiza now resolves to the documented substitute (Inter Semibold) rather
  than a random system face. **Console errors on the page: 0.**

### Em dashes removed

The register says "never an em dash, anywhere" while the document contained
**497** of them, which undermines every other rule on the page. All converted:
a colon where the second half is an independent clause (a comma there would be
a splice), a comma otherwise, `n/a` where one was standing in as a table
placeholder. Verified 0 in the rendered text. The page `<title>` was caught by
the sweep and reads correctly again.

### Final state

12 chapters, 148 nav entries, 0 pending. No dead anchors, no duplicate ids, no
broken images, no unlabelled controls, no horizontal overflow, no console
errors. All interactive exhibits verified alive: the four-count switcher, the
motion player, 19 live contrast pairs, 12 live CMYK swatches, 5 live page
frames, 11 copy/SVG/PNG cards.

### Deliberately NOT done

- **`npm run build:partials` was not run.** It regenerates the nav and footer
  spans across every page in its list, and ~40 files are dirty from other work.
  A rebuild would silently discard any hand-edited chrome in them. The nav
  accessibility fixes were written into both the partial and every generated
  copy, so they survive the next rebuild whenever it is safe to run.
- **The `?v=29` cache-buster was not bumped.** It spans 52 files, and the CSS
  changes are either invisible in production (the In Focus host section is
  `hidden`) or additive. Bump it with the partials rebuild.
- **The six fixed-count sections were not refactored.** That is production
  homepage layout surgery and deserves its own pass with sign-off, not a
  drive-by at the end of a long session. It stays logged in Chapter 11.

---

## 2026-09-01 (fifth pass) · Canonical shape SVGs were unusable in design tools

**Reported:** downloading a shape SVG and applying a colour in Canva or an
illustration app produced a thick border with the colour inset, instead of a
solid shape.

**Cause.** Eight of the nine shapes build their soft rounded edge out of a
28-unit stroke painted in the same colour as the fill. That works in a CSS
context because `currentColor` drives both. It does not survive export: Canva,
Illustrator and Figma treat fill and stroke as two independent properties, so
"apply a colour" sets the fill and leaves the stroke at its previous value. The
result is a 28-unit border in the old colour with the new colour sitting inset
inside it. Reproduced in the browser: setting `fill` alone left
`stroke: rgb(26,23,20)` against `fill: rgb(95,113,169)`.

**Fix.** The rounded silhouette is now baked into the path geometry and every
exported snippet is a single `fill` with no stroke. The outlined path is
generated from the source polygon as a Minkowski sum with a 14-unit disc: each
edge offset along its outward normal, corners joined by 14-unit arcs, winding
normalised so shape 5 (which winds the other way) comes out correct.

**Verified** by rasterising the stroked original and the outlined replacement
at 400x400 and comparing alpha per pixel:

| Shape | Differing pixels |
|---|---|
| 1, 2, 3, 4, 5, 7 | **0** |
| 8 | 16 (0.0100%) |
| 9 | 9 (0.0056%) |

The two non-zero results are anti-aliasing on a single rounded corner. Then
re-tested end to end: all nine snippets parse as XML, carry no stroke, and when
recoloured the way a design tool does it, rasterise to one uniform colour.

Shape 6 (Chimney Cottage) already had its curves in the path and needed no
conversion.

Copy, SVG download and PNG export all read the same snippet, so all three are
fixed by the one change. The family-rule callout was rewritten: it previously
told the reader to keep fill and stroke in step, which is now only true of how
the shapes are *authored*, not of the file they receive.

### Follow-up: dead canvas around every exported shape

**Reported:** after the stroke fix, the shapes still imported with blank space
on all four sides, so a design tool's selection box was the canvas rather than
the artwork.

**Cause.** The snippets carried `viewBox="0 0 200 200"` while the artwork
occupies `10,12` to `190,184`. That is 10 units of margin left and right, 12
above and 16 below, baked into every export.

**Fix.** Each file's `viewBox` is now the shape's own bounding box, measured
with `getBBox()` rather than assumed. Eight are `10 12 180 172`; Chimney
Cottage is `10 8.8 180 175.2`, because its chimney genuinely reaches 3.2 units
higher and cropping to the common box would clip it. `width` and `height` match,
so each file has a correct intrinsic size.

The family relationship is untouched: all nine still share the same width (180)
and the same baseline, so at one width, bottom-aligned, they line up exactly as
before. Only the empty margin is gone.

**Verified** by rasterising each snippet at its own aspect and testing whether
painted pixels reach row 0, the last row, column 0 and the last column. All
nine touch all four edges, so the box is tight with nothing clipped. The PNG
export picks the change up automatically through the viewBox-aspect logic: a
shape now renders 1024x978 at 82.4% ink coverage instead of a padded square.

### Follow-up 2: the tight viewBox still imported with padding

**Reported:** blank space on all four sides persisted after the crop.

**Cause, and it was in the previous fix.** Cropping produced
`viewBox="10 12 180 172"`, a **non-zero origin**. That is valid SVG and renders
correctly in a browser, which is why the local checks passed. But several
importers, Canva among them, read the width and height while positioning the
artwork against a 0,0 origin, which puts the 10 and 12 back as padding. The
downloaded file was correct by the spec and still wrong in the tool.

**Fix.** Every path is translated so its bounding box starts at the origin, and
the viewBox is now `0 0 180 172` (`0 0 180 175.2` for Chimney Cottage). Nothing
about the geometry changes, only where it sits in its own coordinate space, so
there is no longer an offset for an importer to mishandle.

Verified per shape with `getBBox()`: origin is 0,0 to within float noise and the
box exactly equals the viewBox. Raster check still shows all nine touching all
four edges. The actual downloaded bytes were captured by intercepting the
download path rather than inferring it:

```
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 180 172" width="180" height="172">
  <path d="M 58.17,1.43 L 172.17,57.43 A 14 14 0 0 1 180,70 L 180,158
           A 14 14 0 0 1 166,172 L 14,172 A 14 14 0 0 1 0,158 L 0,56
           A 14 14 0 0 1 3.62,46.61 L 41.62,4.61 A 14 14 0 0 1 58.17,1.43 Z"
        fill="currentColor"/>
</svg>
```

323 bytes, one fill, no stroke, coordinates running 0 to 180 and 0 to 172.

---

## 2026-09-01 (sixth pass) · Three problems the social team hit

### 1. Warm white was being applied as a default background. My error.

`CLAUDE.md` states `--bg #ffffff`, "Primary background, WHITE always", and the
standing note is that white is primary. The Chapter 06 colour guidance I wrote
said the opposite: "Warm white with ink type and one good photograph is the
house default". The colour-budget exhibit also painted its two correct frames
`#faf7f2`. Anything reading the chapter, human or machine, would reasonably
conclude every frame starts warm.

Corrected. White is now stated as the ground; warm white is described as a
deliberate panel tint chosen per frame, never a canvas. The exhibit frames are
white, and the AI brief gained an explicit BACKGROUND section that says so
before it lists any colour.

### 2 and 3. Fonts and colours are not respected by image generation

Both reports have one cause, and it is not a prompt problem.

**An image-generation model has no font engine.** It paints shapes that look
like letters. Uploading Gazpacho or Inter into the chat thread changes nothing,
because nothing in that pipeline loads a font file. Any headline it renders is
a generic serif or sans, frequently misspelt.

**It cannot hold an exact hex** either. `#ee324b` comes back as some other red
every time.

No wording fixes either one, so the brief now opens with a section stating what
the tool can and cannot be asked for, and the TYPE section is marked as
something a generated image cannot do. The division that works: language,
backgrounds without type, and exploration go to the AI; type, logo, brand
colour and layout are set downstream in a deterministic tool.

### The deterministic tool, built

A **carousel slide builder** now ships in Chapter 06. It renders to Canvas 2D,
which uses the fonts the document has already loaded, so `ctx.font =
'700 87px Gazpacho'` draws real Gazpacho and a fill of `#ee324b` is exactly
`#ee324b`. The two things a generated image cannot hold are the two things this
holds exactly.

Eyebrow, headline, standfirst and slide number; white / warm-panel / ink ground;
optional theme keyline; 1080x1080, 1080x1350 and 1080x1920; 72px margin; the
headline auto-fits and warns rather than shrinking below 44px; export as PNG or
straight to the clipboard.

Verified: ground renders pure `255,255,255`, the logo mark produces **786 pixels
of exact `#ee324b`**, a terracotta keyline produces **528 pixels of exact
`#d5613a`**, fonts measure distinctly from their generic fallbacks (Gazpacho
449.1px against 402.2px serif), and the download returns a 124KB
`ghar-slide-1080x1080.png`.

Also added: a test the team can apply to any frame. Pick the red out with a
colour picker and compare against `#ee324b`. If it does not match exactly, the
frame was generated rather than composed, and it does not ship.
