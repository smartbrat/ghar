# Brands & People: Programmer Guide

One short read before you build or change anything on brand profiles (`/brands/{slug}`) and people profiles (`/people/{slug}`). Each section says **what the rule is**, **where it lives**, and **what to do**. Deeper docs are linked; when this guide and an older doc disagree, this guide wins (see §12).

Last updated: 2026-09-17.

---

## 1. The ten rules that matter most

1. **The HTML is the contract.** Keep the shipped markup, class names and JS hooks. Swap data, not structure.
2. **Never copy a live tenant page** to start a new one. Start from `_dev/templates/`.
3. **Never invent content.** No made-up team, projects, years, stats or quotes. Empty beats fake.
4. **Brand color comes from one registry**: `scripts/brand-palettes.mjs`. Never write color tokens into a page.
5. **Every image is optimised before it is used** (AVIF + WebP `<picture>`, width/height). The build fails otherwise.
6. **Video is YouTube embeds**, click-to-play, 16:9.
7. **Code checks capabilities, never package names.** `if (brand.package === 'Featured')` is banned.
8. **No ad before editorial, no sponsored sections, no stacked sponsored units.**
9. **A person is only shown with a real portrait** in directories; profile and team blocks fall back to a monogram. Never stock, AI or placeholder faces.
10. **Nothing reaches production without a check at 1440px and 390px.**

---

## 2. Templates

| Brand category | Start from |
|---|---|
| developer | `_dev/templates/brand-profile-developer.html` |
| architect, interior, materials, furniture, lighting | `_dev/templates/brand-profile-service.html` |
| finance, proptech, vastu, anything else | `_dev/templates/brand-profile.html` |
| any person | generated, see §3 |

- `brand-profile-states.html` and `person-profile-states.html` are **reference pages**, not tenants. They show every section in every state so you can see how empty sections hide.
- **Which sections render, in what order and variant** per category: [`COMPOSITION-RULES.md`](COMPOSITION-RULES.md). The master section list (20 sections, variants, fallbacks, gates): [`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json).
- **Empty data:** keep the `<section>` in the markup and leave `hidden` on. Never delete it. Required sections (hero, about, work, contact, footer) always render and use their fallback when empty.
- **Shared CSS/JS lives in `dist/`** (`brand-profile.min.css`, `person-profile.css`, `brand-theme.css`, `styles.min.css`). Fix a shared bug there, never per tenant.
- **Shared chrome (nav, microfooter) is generated** by `npm run build:partials`. Don't hand-edit the `PARTIAL` blocks in pages.

---

## 3. Auto-generation

### People: scripted today
- Data: `scripts/person-profile-data.mjs` (`PEOPLE`, `CATEGORIES`).
- Build: `npm run build:people` renders every person page from one function, runs the image pipeline on each, and is idempotent.
- A person inherits the **parent brand's palette** (`company.palette` or `company.slug`), or the neutral `ghar` palette when unlinked. Dark only if that palette is `theme: 'dark'`.

### Brands: manual today, same steps a generator must follow
There is **no brand generator yet**. Pages are hand-built with the `/new-brand-profile <slug>` flow. Any future generator (or the PHP composer, §5) must do the same steps:

1. Get the brand's **own website**. No site, no page.
2. Scrape home, about, work, team, contact into JSON. Missing fields stay empty.
3. **Download the real logo, look at it, sample the colors.** Text extraction gets color wrong.
4. Add a palette record to `scripts/brand-palettes.mjs`, run `npm run build:palettes` (it fails on poor contrast), set `<body data-palette="{slug}">`.
5. Land images in `brand_assets/brands/{slug}/`, run `npm run images`.
6. Copy the category template, fill per `COMPOSITION-RULES.md`.
7. Add routes in **both** `vercel.json` and `serve.mjs`; add the slug to `SHOWCASE` in `scripts/build-directory-order.cjs`, run `npm run build:directory`.
8. Check at 1440 and 390.

AI-assisted ingestion (extract → match entities → propose → **admin review** → publish) is specified in [`AI-INGESTION.md`](AI-INGESTION.md). Nothing auto-publishes without an admin.

---

## 4. Brand color (palette registry)

- **One file:** `scripts/brand-palettes.mjs`. Each brand has roles: `primary`, `hover`, `text`, `ink`, `cta`, `ctaHover`, `alt`, `canvas`, `soft`, optional `theme: 'dark'`, and `src` (where the color was sampled from).
- **One build:** `npm run build:palettes` checks WCAG contrast and writes `dist/brand-theme.css`.
- **One hook on the page:** `<body data-palette="{slug}">`, with `/dist/brand-theme.css` linked **last** in `<head>`.
- The registry paints buttons, hovers, chips, contact card and CTA. Navbars stay **neutral glass** (white blur on light, dark blur on dark), never tinted.
- `native: true` records (Studio FOV, TEEARCH, Horizon, Obeetee) keep their original approved look. Don't "normalise" them.
- **Backend:** store the palette record per brand (JSON column is fine) and generate `brand-theme.css` from it, or keep the registry file as the source. Either way, pages only carry `data-palette`.

---

## 5. Backend

The stack is **PHP + MySQL**. Full detail: [`BACKEND-INTEGRATION-GUIDE.md`](BACKEND-INTEGRATION-GUIDE.md), [`ENTITY-RELATIONSHIPS.md`](ENTITY-RELATIONSHIPS.md).

**Rendering, two options**
| | How | Use when |
|---|---|---|
| **A. Dynamic (recommended at scale)** | `.htaccess` sends `/brands/{slug}` and `/people/{slug}` to one PHP handler per family, which picks the template by category | 20+ tenants, content edited often |
| **B. Static build** | a script writes one HTML file per tenant (like `build:people`) | few hand-curated tenants; every change needs a rebuild + deploy |

Before go-live, diff your rendered HTML against the shipped static page. It should match.

**Data model, in short**
- `brands` (+ `package_id`, `primary_category_id`, `status`), `people`, `projects`, `products`, one child table per repeated section (an empty table hides the section).
- **`brand_person_relationships`** links people to brands (founder / current / past / advisor…, `is_founder`, `is_leadership`, `is_featured`, dates). "Current" = `end_date IS NULL`.
- **Attribution:** a person page never shows the employer's articles; a brand page shows content about the brand.
- **De-duplication:** new people auto-match only at confidence ≥ 0.85, otherwise admin review.

**Admin controls** ([`ADMIN-CONTROLS-SCHEMA.md`](ADMIN-CONTROLS-SCHEMA.md)): per-section on/off, order, variant, content mode (auto, manual select, manual content, admin-only custom HTML). Order of precedence: **category rules → admin config → entitlement gates**. Drafts publish atomically; every admin action is logged.

**Forms:** `POST /api/brand-contact`, `/api/brand-brief`, `/api/subscribe`, `/api/auth/signin`, JSON `{ok}`/`{ok:false,error}`, CSRF from `<meta name="csrf">`. Portal forms and modals stay light and monochrome on every tenant.

**Caching:** profile bundles 5 min in preview, 1 h published; distribution surfaces 5 min.

The full "Brand Engine" (resolvers + composers in PHP) is a **proposal, not built**: [`BRAND-ENGINE-ARCHITECTURE.md`](BRAND-ENGINE-ARCHITECTURE.md).

---

## 6. Packages and entitlements (Brand Connect)

- **Current package names:** **Listed**, **Featured**, **Signature** (formerly Presence / Spotlight / Partner). Tiers stack: Signature includes Featured includes Listed.
- **Code uses capability keys only.** Packages are bundles of capabilities in tables (`capabilities`, `packages`, `package_capabilities`, `brand_entitlement_overrides` for add-ons and expiries). Detail: [`ENTITLEMENTS.md`](ENTITLEMENTS.md), [`BRAND-CAPABILITY-MATRIX.md`](BRAND-CAPABILITY-MATRIX.md).
- **Gates apply to:** which sections render, which variant, promoted slots on surfaces, and an "Upgrade to unlock" chip in admin only (never on the public page).
- **What visitors see by tier:** Listed = alphabetical, no badge. Featured = pinned first in category + `Featured` badge + rotates into In Focus. Signature = pinned + `Signature` badge + permanent In Focus.
- **People have no package.** Enhanced person pages count against their brand's limit. Every named founder of a paid brand gets a `/people` page.
- **Downgrade:** sections hide; already-published paid content stays up.
- Package names and prices are **internal**. Never show them in public copy.

---

## 7. Distribution (where a profile appears)

Spec: [`DISTRIBUTION-SURFACES.json`](DISTRIBUTION-SURFACES.json). One resolver, `resolveEntitiesForSurface(surface, context)` → `{organic, promoted}`.

- **Slot types:** organic (free), promoted (needs a capability), featured (editor pin, beats both).
- **18 surfaces**, including: `/brands` and `/people` directories, related/similar brands, "Also at {brand}", project and locality pages, article sponsor card and recirculation, homepage brand/person carousels, newsletter spotlight, search rows (organic only), Voices speaker index.
- **Rules:** only published entities; a person appears on a brand page only as founder / leadership / featured; people without a real portrait are excluded from directories and Voices; admin pins and suppressions override ranking.
- **Ranking tie-break by tier:** Signature > Featured > Listed > none.

**In Focus (Spotlight) block** above `/brands` and `/people`: one block at a time, built on brand identity (logo, color, name, one line, city, CTA), photo optional. Rotates daily (`gharSpotlightRotate()` in `main.js`); the featured brand is hidden from the grid that day. Currently **hidden in production**; only category pins and badges are live.

---

## 8. Auto-created content and banners per package

**Not automated yet.** Build it to these rules:

**Placement**
- Paid units only inside editorial reading flow. Never on forms, search, nav, filters or CTAs.
- **First screen has no paid surface.** Order: hero → chips → at least 3 editorial items → first sponsored item around position 4 → more editorial → billboard near the bottom.
- Sponsorship is on **single cards**, never a whole section. Never place a paid slot right after a sponsored lead card.
- Don't repeat the same advertiser across pillars.

**Banner (`.dp-adslot`) recipe**
- Landscape media (~16:9) only; never a portrait image.
- Canvas color: average the image's rightmost ~8% column, multiply by ~0.55 → `--brand-canvas`. Media fades into the panel (`linear-gradient(to right, transparent 55%, canvas)`): no visible seam.
- Deep muted panels only (navy, burgundy, espresso, charcoal, forest, plum); CTA text is white.
- `--brand-canvas` and `--brand-text` are set per instance, so the CMS drives them.

**Copy**
- Title: one full sentence, subject first. Lead: one fact + one action. CTA: one word ("Explore", "Read"). Editorial voice, no slogans, no em-dashes.

**Per tier:** Featured unlocks banners, sponsored stories, /design pillar hero-row cards and the sponsored strip. Signature adds always-on banners across /voices, /design and category pages, plus the film and GharTalks deliverables. Exact counts: see §12, still being finalised.

**Brands with no visuals:** use the graphic hero: `<img class="bpr-hero__graphic" src="/brand_assets/brand-graphics/{slug}.svg">` with `_default.svg` fallback. Generated graphics need sign-off before shipping. Brands with real photos use the image-led template.

---

## 9. Image upload and optimisation

Reference: [`IMAGE-OPTIMIZATION.md`](IMAGE-OPTIMIZATION.md). Source of truth for values: `scripts/lib/images.mjs`.

**Sourcing**
- From the brand's own site or the brand's official files. Never stock for a named brand. Never hotlink; store locally.
- **Team photos:** pre-crop to 4:3, head in the upper-centre third, min 600×450 (ideally 800×600). Name `brand_assets/people/{brand}-{first}-{last}.jpg`, keep the `.original.jpg`.
- **Portraits:** real photo of that person, ask the firm for an official headshot, 1200px+ long edge.

**On every upload (backend must do this)**
1. Save the original.
2. Make **AVIF + WebP at 640 / 1280 / 2560 px**, never upscaled. Name `{stem}-{width}.{avif|webp}`. (Today: `npm run images`, powered by `sharp`. In PHP: call the Node converter as a job, or use libvips/Imagick with the same widths and names.)
3. Store width and height.
4. Render:

```html
<picture>
  <source type="image/avif" srcset="…-640.avif 640w, …-1280.avif 1280w" sizes="{slot}">
  <source type="image/webp" srcset="…-640.webp 640w, …-1280.webp 1280w" sizes="{slot}">
  <img src="…original.jpg" alt="…" width="W" height="H" loading="lazy" decoding="async">
</picture>
```

| Slot | `sizes` |
|---|---|
| hero | `100vw` |
| person portrait | `(min-width:744px) 380px, 100vw` |
| logo | `240px` |
| cards / default | `(min-width:1024px) 40vw, 100vw` |

- **Top-of-page hero/portrait:** `loading="eager" fetchpriority="high"`. Everything else `lazy`.
- **Never `sizes="auto"`** (logos collapse to 0×0).
- `alt=""` only for decorative images.
- Required CSS (already in `styles.css`): `picture{display:contents}` and `:where(img[width][height]){height:auto}`.
- Fallback handlers use `(this.closest('picture')||this)`, not `this.parentElement`.
- **Check:** `npm run images:audit` (also runs first in `npm run build`). Markup for one file: `node scripts/images.mjs snippet /brand_assets/path.jpg "alt"`.

---

## 10. Video

- **Upload to YouTube; store only the video ID.** No self-hosting.
- The thumbnail is an image and goes through §9.
- Markup: `.hv-block` > `button.hv-thumb[data-hv-play="{id}"]` + `.hv-player[hidden]` for a feature film, or `.bpr-mcard--video.hv-card[data-hv-play="{id}"]` for a rail card. `dist/hv-video.js` handles click-to-play on its own (embeds `youtube.com/embed/{id}?autoplay=1&rel=0`).
- **Thumbnails are 16:9**, so the card doesn't jump when the player loads.
- Empty Ghar.tv sub-groups (films, GharTalks, editorial) are removed, never filled with placeholders.

---

## 11. Build, deploy, verify

| Command | Does |
|---|---|
| `node serve.mjs` | local server on :3000 (mirrors Vercel routes; restart after route changes) |
| `npm run build` | image audit → palettes → partials → tailwind → styles → js |
| `npm run build:people` | regenerate all person pages |
| `npm run build:directory` | directory order |
| `npm run images` | localise, convert, wrap, measure, audit |

- **Vercel** auto-deploys `main` (ghar-lime.vercel.app). Use a branch for staging. `dist/` is committed.
- **ghar.tv is a hand copy** under `/twassets/`. Copy pages **and** everything they load: `dist/*.css|js` and every new AVIF/WebP variant. The file list: `_dev/state/ghartv-copy-list.md`.
- **Verify every change at 1440px and 390px**: layout, hover, contact card, navbar scrolled state, images loaded.
- Root folder is production only; prototypes, tools and scratch go in `_dev/`.

---

## 12. Known conflicts in older docs (use this guide)

| Topic | Older doc says | Follow |
|---|---|---|
| Brand color | inline `--brand` / `--brand-soft` on `<main>` (TEMPLATES-USAGE, PROFILE-TEMPLATES-HANDOFF, TOKEN-CONTRACT body, PROFILE-SECTIONS-SPEC `themeTokens`) | palette registry + `data-palette` (§4) |
| Images | run `convert-images.mjs` by hand, LQIP blur-up only | `npm run images`, `<picture>` (§9) |
| `sizes` values | hero `1600px`, portrait `360px` | values in §9 (from code) |
| Person seed file | `person.html` | shell is `person-profile-adi-godrej.html` |
| Tenant counts | 6 / 8 brands, 4 / 12 / 13 people | `vercel.json`: 9 brands, 14 people |
| CSS location | all inline per page | shared `dist/` files |
| Package names | Presence / Spotlight / Partner | Listed / Featured / Signature |

**Pending product decisions (don't hard-code these yet)**
- Package **prices** (per month vs per year) and **deliverable counts** (films, GharTalks, sponsored stories, account manager tier) differ between the rate card and the capability matrix. Seed capabilities from the matrix, keep limits in the DB so they can change without code.
- Whether In Focus shows a "Sponsored" label.
- Sponsorship fields: `sponsored_by_brand_id` vs `sponsor_brand_slug`, and 2 vs 4 collaboration types. Pick one before the migration.
- Image upload endpoint for the article editor.

---

## Where to go deeper

[`HANDOFF-INDEX.md`](HANDOFF-INDEX.md) lists every handoff doc. Most used: `AUTO-GENERATION-CONTRACT.md`, `COMPOSITION-RULES.md`, `BACKEND-INTEGRATION-GUIDE.md`, `ENTITY-RELATIONSHIPS.md`, `ENTITLEMENTS.md`, `DISTRIBUTION-SURFACES.json`, `ADMIN-CONTROLS-SCHEMA.md`, `IMAGE-OPTIMIZATION.md`, `BRANDCONNECT-spotlight-delivery.md`, `EDITOR-migration-plan.md`.
