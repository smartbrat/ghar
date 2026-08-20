# Changelog — since last GitHub upload

> Read this first if you have a checkout of `origin/main` from before
> this push. Everything below is new or changed. Ordered oldest →
> newest so you can walk the sequence.

**Ranges:**
- `origin/main` @ pre-handoff → `09016c4` = the original **10-commit
  handoff bundle** (Sections A below).
- `09016c4` → **HEAD** = a follow-up stretch of tenant-content,
  routing and hero-polish work driven by product review (Section B
  below).

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
