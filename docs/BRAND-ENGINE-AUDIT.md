# Brand Engine Audit — current state vs the 126-item brief

> **Purpose.** Map what actually exists in the Ghar.tv repo today against the
> ambitions of the Brand Connect + Entity Publishing + Distribution Engine
> brief. Observational only. Architecture recommendations live in the
> companion `BRAND-ENGINE-ARCHITECTURE.md` after this audit is reviewed.
>
> **Audience.** The programmer who will build the dynamic layer (backend +
> DB + admin + AI ingestion + distribution) on top of the static frontend
> shipped in this repo, and the studio/product team deciding what to
> commission next.
>
> **Not in scope.** No code changes. No template edits. No new tenants. No
> git commits. The uncommitted local batch from the previous stretch of
> work (pp-contact form → button, voices cleanup + native rail, intel foot
> fix, pp-contact grid alignment) remains held for the user's push
> authorization and is unrelated to this document.
>
> **Companion docs to read alongside** (do not duplicate, this audit
> assumes you have them):
>
> - [`docs/HANDOFF-INDEX.md`](../../docs/HANDOFF-INDEX.md)
> - [`docs/BACKEND-INTEGRATION-GUIDE.md`](../../docs/BACKEND-INTEGRATION-GUIDE.md)
> - [`docs/TEMPLATES-USAGE.md`](../../docs/TEMPLATES-USAGE.md)
> - [`docs/PROFILE-TEMPLATES-HANDOFF.md`](../../docs/PROFILE-TEMPLATES-HANDOFF.md)
> - [`docs/BRIEF-people-pages.md`](../../docs/BRIEF-people-pages.md)
> - [`docs/BRIEF-brands-srp.md`](../../docs/BRIEF-brands-srp.md)
> - [`docs/STORY-schema.md`](../../docs/STORY-schema.md)
> - [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json)
> - [`docs/EDITOR-migration-plan.md`](../../docs/EDITOR-migration-plan.md)
> - [`docs/VOICES-HANDOFF.md`](../../docs/VOICES-HANDOFF.md)
> - [`docs/CHANGELOG-since-last-github.md`](../../docs/CHANGELOG-since-last-github.md)

---

## 0. Framing — this is an evolution, not a rewrite

The 126-item brief describes a **Brand Connect + Entity Publishing + Distribution Engine**: entities (Brand, Person, Project, Product), typed relationships between them, AI-assisted composition, category-aware section engines, admin AUTO/MANUAL controls, distribution across many surfaces, and a Brand Connect capability/entitlement layer sitting on top.

The Ghar.tv codebase already implements a substantial fraction of that vision — **for articles**. What the brief now asks is: **take the same composition philosophy the article system already uses, extend it to Brand + Person profiles, and add an explicit entity + relationship + distribution layer around all three.**

The right posture for the next stretch of work is therefore:

1. **Inherit** the article-side architecture (block registry, auto-injection engine, component registry, structured story metadata, sponsored semantics, editor migration plan).
2. **Formalise** the profile-side patterns that are currently implicit (section registry, section variants, category composition rules, entity data contracts).
3. **Add** the missing layers explicitly (many-to-many entity relationships, distribution surface registry, entitlement contract, admin controls, AI ingestion contract).
4. **Do not rewrite** the shipped brand or person tenant pages. They are client-approved output. The engine has to be able to reproduce them.

That is the shape of the recommendation. The rest of this document establishes the evidence for it, section by section, following the audit outline in brief §121 (A → K).

---

## A. Current Brand Architecture

### A.1 Routing and file layout

`/brands` is the directory. `/brands/{slug}` is a per-tenant page. Every tenant currently ships as a hand-authored static HTML file at the repo root, one file per brand, and a `vercel.json` rewrite maps the pretty URL to the file.

| URL family | Backing file(s) | Notes |
|---|---|---|
| `/brands` | [`brands.html`](../../brands.html) | Directory. Data-cat filter (developer / …), pinned featured tenants at the top. |
| `/brands/search` | [`brands-search.html`](../../brands-search.html) | SRP. Cat + city + locality + recognition + name search + sort. See [`docs/BRIEF-brands-srp.md`](../../docs/BRIEF-brands-srp.md). |
| `/brands/{slug}` | `brand-profile-{slug}.html` (one per tenant) | Static per-tenant pages. Backend intended to swap to data-driven at integration. |

`serve.mjs` auto-falls-back a `/brands/{slug}` request to `brand-profile-{slug}.html` on the local dev server if the boot-time rewrite map hasn't caught up; the production rewrite still requires a `vercel.json` edit per new tenant. Both mappings live in the [`docs/BACKEND-INTEGRATION-GUIDE.md`](../../docs/BACKEND-INTEGRATION-GUIDE.md) "Option A vs Option B" section, with a stated recommendation of **Option A (one PHP handler per URL family)** once the tenant list exceeds ~20.

### A.2 Template families

Three source-of-truth templates ship under [`_dev/templates/`](../../_dev/templates/):

| Template file | Role | Line count | Currently used by tenants |
|---|---|---|---|
| [`brand-profile.html`](../../_dev/templates/brand-profile.html) | Default (chromeless full-hero) | 6242 | (no direct tenant — used as originator for Scarlet Splendour, then swapped) |
| [`brand-profile-service.html`](../../_dev/templates/brand-profile-service.html) | Service-brand variant (like Teearch) | 8669 | teearch, scarlet-splendour, horizon-architects, obeetee, saint-gobain, asian-paints |
| [`brand-profile-developer.html`](../../_dev/templates/brand-profile-developer.html) | Developer-brand variant | 6336 | godrej-properties, avirahi |

**8 tenants live in production today.** Every tenant is a full standalone HTML file with all CSS in a per-page `<style>` block. Consolidating the shared CSS into `dist/brand-profile.min.css` is listed as pending in [`docs/PROFILE-TEMPLATES-HANDOFF.md §14`](../../docs/PROFILE-TEMPLATES-HANDOFF.md).

### A.3 Section inventory per template family

Measured directly from the source `<section>` tags. Section IDs are what URL anchors (`#work`, `#about`) target and what the topbar sub-nav pill row wires to.

**Service family** (`brand-profile.html` + `brand-profile-service.html`):

```
bpr-hero
bpr-sec#about               ← lede + paragraphs + team + specialises + facts + registrations
bpr-sec#work                ← notable projects
bpr-sec--tight#presence     ← locations / cities / where they operate
bpr-sec#spotlight           ← editorial + intelligence + voices callouts (dark or warm)
bpr-contact#contact         ← contact form (now → button opening shared modal, uncommitted)
```

**Developer family** (`brand-profile-developer.html`):

```
bpr-hero                    ← classic hero (or split on Pattern-B ports)
bpr-film#film               ← commissioned film / hero video (optional, only on godrej so far)
bpr-sec--tight#story        ← the About equivalent
bpr-sec--attached#recognition (hidden default) ← awards + honours strip
bpr-featured#featured       ← headline project spotlight
bpr-sec#projects            ← project grid (developer's "Work" equivalent)
bpr-sec#team                ← leadership + partner grid
bpr-sec--tight#timeline     ← company history timeline
bpr-sec--tight#presence     ← geographic + market presence
bpr-contact#contact
```

**Horizon Architects** carries one extra hidden section — `#film-cinematic` — reserved for the alternate cinematic-film hero variant. That is a one-off variant, not a family.

Two things this inventory makes visible:

1. **Section IDs drift across families.** `#about` in service tenants is the same conceptual section as `#story` in developer tenants. Similarly `#work` (service) ≡ `#projects` (developer). URL anchors and topbar sub-nav pills are family-specific because of this.
2. **Modifier vocabulary is already doing variant work.** `bpr-sec--tight` (reduced vertical padding), `bpr-sec--attached` (visual link to prior section), `bpr-hero--split` (Pattern-B mobile hero), `bpr-about--seamless-wrap` (about variant), `bpr-featured` (dedicated wrapper for a featured project spotlight). These are undocumented — the vocabulary exists but a programmer joining the project would have to grep to discover it.

### A.4 Hero patterns

Per [`docs/PROFILE-TEMPLATES-HANDOFF.md §3`](../../docs/PROFILE-TEMPLATES-HANDOFF.md):

- **Classic hero** — full-bleed image + dark scrim + white text. Still shipping on obeetee, saint-gobain, asian-paints. Legacy default.
- **Pattern B split hero** — full-width image band + white rounded card that lifts up over the image bottom + logo tile straddling the seam. Currently on teearch, avirahi, godrej-properties. Horizon uses a related pattern with a warm ambient graphic instead of a photo.

Pattern B mobile hero port to the remaining 3 tenants (obeetee / saint-gobain / asian-paints) is one of the two named pending items in HANDOFF-INDEX §"Pending big items".

### A.5 Contact panel variants

- **Light** (`.bpr-contact`, warm-cream panel + `.jm-*` field chassis) — currently on teearch, avirahi, horizon-architects (and applied via the batch to horizon in the uncommitted stretch).
- **Dark** (`.bpr-contact--dark`, dark panel + older bespoke `.bpr-form` field chassis) — currently on godrej, obeetee, saint-gobain, asian-paints. Migration to the light `.jm-*` chassis is pending across the same 3 older tenants as the Pattern B port.

**The form itself has just moved.** In the uncommitted stretch, every brand tenant's contact `<form>` was replaced with a single `Contact` button that opens the shared `br-contact-modal` partial. The modal was already portal-canonical — every consumer previously had its own inline copy. This is now consolidated.

### A.6 Sponsored / paid content semantics

Two attribution patterns, encoded in the story schema and rendered on both editorial articles and brand microsites:

- **"In Collaboration With"** — brand co-produced the piece.
- **"Presented By"** — brand paid for placement; editorial produced.

DB shape recommendation exists in [`docs/BACKEND-INTEGRATION-GUIDE.md` "Sponsored content"](../../docs/BACKEND-INTEGRATION-GUIDE.md) as `articles.sponsored_by_brand_id + articles.sponsorship_kind ENUM`. See also [`docs/BRANDCONNECT-spotlight-delivery.md`](../../docs/BRANDCONNECT-spotlight-delivery.md).

### A.7 Theme + motion

- **Theme token contract is minimal but consistent.** Every brand-profile page's `<main>` carries `style="--brand:{hex}; --brand-soft:{hex};"`. Every downstream accent, hover, contact-panel fill reads these two variables. Tenants never hardcode brand hex.
- **Motion is per-page inline.** Each tenant carries its own `<script>` block for the IntersectionObserver reveal system (`js-reveal--rise/print/bloom/fade` + `js-cascade`), the hero animation keyframes, and any bespoke choreography (Horizon's badge pop + logo-in-flow, Teearch's card-lift, Avirahi's stage parallax). No shared motion profile / no motion token contract.

### A.8 Data flow today

Static HTML. Everything the reader sees is baked in at publish time. The `data-brand-slug` + `data-brand-name` + `--brand` + `--brand-soft` attributes on `<main>` are the tenant identity contract; the rest of the page's content lives inline in the file.

The intended data flow is documented in [`docs/BACKEND-INTEGRATION-GUIDE.md` "Suggested DB schema"](../../docs/BACKEND-INTEGRATION-GUIDE.md) — `brands` table + `brand_socials` + `brand_metrics` + `brand_notable_projects` + `brand_categories` + `brand_clients` + `brand_team` + `brand_editorial` + `brand_podcasts` + `brand_awards`. Every sub-table is one row per item; empty tables → sections auto-hide via the `hidden` attribute pattern documented in [`docs/TEMPLATES-USAGE.md` "The one rule"](../../docs/TEMPLATES-USAGE.md).

---

## B. Current People Architecture

### B.1 Routing

| URL family | Backing file(s) |
|---|---|
| `/people` | [`people.html`](../../people.html) — directory |
| `/people/search` | (deferred) — [`people-search.html`](../../people-search.html) exists as SRP stub |
| `/people/{slug}` | `person-profile-{slug}.html` |

`serve.mjs` auto-fallback works identically to `/brands/{slug}`.

### B.2 The universality rule (LOAD-BEARING)

Per [`docs/BRIEF-people-pages.md §5`](../../docs/BRIEF-people-pages.md), verbatim:

> **One template serves every person in the directory**, across roughly twenty professions, whether the record holds four fields or forty. There is no per-person or per-profession variant.
>
> Only four things can be assumed of everybody: Name / Photograph or monogram / Role with employer / City. Everything else is optional, and many records will have none of it.

**This directly contradicts the brief's §18 recommendation** ("Person profiles should also be category-aware — architect vs developer vs analyst emphasises different sections"). The current architecture explicitly rejects per-category person composition; the reason is stated in the brief-people-pages doc: "theming the ones who do would make the paying tier visible as a caste system inside a directory." Every person page is white + warm-white + ink + hairlines, no per-tenant colour theming. The portrait is the colour.

**Recommendation for the architecture doc:** keep the universality rule for the base treatment; introduce a variant system at the SECTION level (Selected Work variant for architects vs Research variant for economists) rather than at the PAGE level. Category shapes which sections are eligible + which variant per section, not whether the page is themed.

### B.3 Section inventory

Single template, `_dev/templates/person-profile.html` + `_dev/templates/person-profile-states.html` (dev-only, renders every state at once). 12 tenants live: tarun / devesh / hiten motta, darshini mahadevia, hemal shah, hardik shah, virendra shah, satish bhansali, ashish bajoria, suman kanodia (as `/people/suman-bajoria`), adi + pirojsha godrej, vinod doshi.

```
pp-hero                     ← name + portrait/monogram + role + city + eyebrow (cat_id)
pp-facts + pp-metrics       ← discipline / years / registrations
pp-specialises              ← warm-cream panel
pp-about                    ← manifesto lede + bio paragraphs
pp-facts-registered         ← formal registrations
pp-sec#story                ← statement + biography
pp-sec#work                 ← Notable Projects TEASER (4 items) + link to brand portfolio
pp-sec#voices               ← Voices .vx-* cards, person-attributed
pp-sec#published            ← "On Ghar.tv" — pieces about/by the person
pp-related                  ← "Also at {brand}" — 2-3 co-worker cards
pp-contact#contact          ← contact panel (now → button opening modal)
pp-sec--minor#team          ← minor / de-prioritised
pp-closer                   ← final CTA card
```

`person-profile-states.html` renders every state (full record / sparse record / no portrait / no employer / no biography / work with-vs-without photography / no work / published-of-one-kind / published-of-many-kinds / no published / no contact / no figures / no specialisations / no recognition) as sibling `st-case` sections. This is the reference for `[hidden]` auto-hide behaviour and is invaluable for a programmer building the composition engine.

### B.4 Content attribution rule (LOAD-BEARING, from `PROFILE-TEMPLATES-HANDOFF §5`)

- Content **about a brand** → brand profile.
- Content **by or about a person** → person profile.
- **No cross-contamination.** A "Presented by TEEARCH" article on Tarun Motta's page is a bug. Voices are person-attributed by definition; they belong on person profiles unless the voice is specifically about the brand.

Cross-contamination was substantial pollution in early iterations and got explicitly cleaned per §5.3 of that handoff.

### B.5 Portrait discipline

Per [[feedback_no_person_without_portrait]] and [`docs/BRIEF-people-pages.md §4`](../../docs/BRIEF-people-pages.md):

- Never a stock face, AI-generated face, or generic avatar.
- Real photograph of the named person, or a typographic monogram (initials).
- Since most people in the directory have no photograph (22 of 31 on last count), the monogram is the **normal case**, not the fallback.
- Directory listings hide entries without a real portrait for public listings that would be flanked by portraits (the Voices vertical uses this rule verbatim: no listing on Speakers index without a real face).

### B.6 Voices `.vx-*` chassis on person profiles

Cards ported from the Industry Voices vertical (`voices-article.html`), promoted to `dist/styles.min.css` as portal-canonical once the Voices browse page became a second consumer. On person profiles, the wrapper (`.pp-voices-grid`) is layout-only: 3-col desktop grid, native horizontal scroll rail on smaller viewports. The card face inherits the canonical `.vx-card` chassis.

The stretch of work just done (uncommitted) removed a stale local `.vx-card` override that had been shadowing the canonical chassis on 5 person profiles.

### B.7 Data flow

Same shape as brands. Static HTML today; DB shape suggested in [`docs/BACKEND-INTEGRATION-GUIDE.md`](../../docs/BACKEND-INTEGRATION-GUIDE.md) `people` table + `person_figures` + `person_specialises` + `person_bio_paragraphs` + `person_registrations` + `person_notable_projects` + `person_published` + `person_voices` + `person_socials`.

**One person → one `brand_id` FK NULL.** This is a critical gap vs the brief's Brand↔Person many-to-many relationship model. See §F.4.

---

## C. Current Brand Connect Architecture

### C.1 The commercial surfaces

| URL | File | Role |
|---|---|---|
| `/brand-connect` | [`brand-connect.html`](../../brand-connect.html) | Product landing (recent — added in the last push) |
| `/for-brands` | [`for-brands.html`](../../for-brands.html) | Earlier Brand Connect landing — three doors: Brands / Developers / Brokers |
| Internal | [`docs/RATE-CARD-brandconnect-internal.md`](../../docs/RATE-CARD-brandconnect-internal.md) | Internal rate card. Do NOT display to users. |
| Internal | [`docs/BRANDCONNECT-spotlight-delivery.md`](../../docs/BRANDCONNECT-spotlight-delivery.md) | How Spotlight tier surfaces render. |
| Internal | [`docs/BRAND-SERVICE-TEMPLATE-ANIMATION-SPEC.md`](../../docs/BRAND-SERVICE-TEMPLATE-ANIMATION-SPEC.md) | Motion contract for the service-brand template. |

### C.2 Package model as it exists today

The public [`/brand-connect`](../../brand-connect.html) page names Brand Connect tiers (Presence / Spotlight / Partner in previous naming; consult the live page for current). **These tier names are commercial marketing text, not technical architecture.** There is no code in the repo that gates behaviour on tier name.

What actually gates output today:

- **Which template family a tenant renders** — service vs developer — is the closest thing to a package choice, and it's made by manually picking which `_dev/templates/brand-profile-*.html` to clone when a new tenant is stubbed.
- **Which sections a tenant renders** — governed by the `hidden` attribute on each section + whether the DB has rows for it (or, today, whether the tenant HTML has content in it).
- **Which people are attached to a brand** — governed by `brand_id` on the person record + manually-selected `brand_team` rows.
- **Whether editorial content is attributed to the brand** — governed by the article's `sponsored_by_brand_id` / `sponsorship_kind` fields OR by the article being tagged with the brand's slug.
- **Whether the brand appears in editorial callout cards inside articles** — governed by the article's editor inserting a `brand_callout` block (per [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json)).

**There is no entitlement engine.** No table that says "brand X has capability Y". No middleware that reads a package and gates output. The commercial package concept is currently marketing copy on top of manual editorial + template-choice decisions.

### C.3 The gap between commercial promise and technical implementation

The brief §71–73 makes this point explicitly and it is correct: the current Brand Connect packages (Presence / Spotlight / Partner or whatever they are called at the point the programmer picks this up) should be treated as a **commercial draft, not permanent technical architecture**. Build capabilities as individual technical primitives; packages then become bundles of capabilities. Adding a new plan or campaign later is a config change, not a template rewrite.

**This gap is arguably the single most important thing the next stretch of work has to close.** It affects:

- How a new brand onboards (right now: someone hand-clones a template).
- How a brand's capabilities are enforced (right now: they aren't — the manual editorial process is the enforcement).
- How the commercial page describes what a tier gets (right now: prose that must be kept in sync manually with actual delivery).
- Analytics and billing (right now: no per-capability tracking).

### C.4 Sponsored content today

Article-side sponsored content is well-specified: [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json) `storyMetadata.sponsor` field + auto-injection rule `sponsor-brand-card` (priority 100) that injects the sponsor's brand profile card after the first H2 of every sponsored story. This works because editor-inserted `placement_slot` blocks and server-inserted auto-injection blocks share the same slot vocabulary.

**Brand-profile-side sponsored placement is not yet a first-class concept.** Whether a specific brand tenant gets a homepage-featured slot, a `In Focus` badge, or a category-priority position is a manual editorial decision expressed as static HTML in the relevant directory page — not a capability the brand's record can claim.

---

## D. Existing Reusable Assets Inventory

Grouped by concern, with paths + docs. This is the "reuse-first" haystack the [`CLAUDE.md`](../../CLAUDE.md) protocol tells you to grep before building anything new.

### D.1 CSS chassis

**Portal-canonical, in `dist/styles.min.css` (source split across per-page `<style>` blocks pending consolidation — [`docs/PROFILE-TEMPLATES-HANDOFF.md §14`](../../docs/PROFILE-TEMPLATES-HANDOFF.md)):**

| Chassis | Purpose | Consumers |
|---|---|---|
| `.bpr-*` | Brand profile — hero, sections, contact panel, sticky bar, micro-footer | 8 brand tenants + 3 source templates |
| `.pp-*` | Person profile — hero, portrait/monogram, facts, specialises, work, voices, contact | 12 person tenants + 2 source templates |
| `.vx-*` | Voices card + speaker | voices vertical + person profiles |
| `.jm-*` | Portal-canonical form fields + modal shell | brand contact modal + brief modal + subscribe modal + subscribe partial + inline brand contact form + person contact form |
| `.tip` + `.tip__anchor` + `.tip__bubble` | Portal-canonical hover tooltip (with pointer arrow) | person profile socials, various inline consumers |
| `.rail-outer` + `.rail` + `.dc-track` + `.dc-paginator` | Shared horizontal carousel chassis | every horizontal-scroll rail across the portal |
| `.subnav` + `.subnav-link` + `.subnav-inner` | Vertical sub-nav pill row | design pillar franchises + voices vertical |
| `.dp-*` | Design pillar — subnav, strips, ad slots, partner cards | design vertical |
| `.art-*` | Article body block chassis — every block from [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json) | design-article.html, voices-article.html |
| `.br-*` / `.pe-*` | Brand + person directory card + finder chassis | brands.html + people.html + brand/person search pages |
| `.hp-*` | Homepage patterns (billboard, score, glyph, cards, quotes, data, stats, nav, hero, notify, b2b, footer, combo) | index.html |
| `.cr-*` | Composition rules — grid, section head, cta placement, logo, card link, carousel | design-system.html reference only |
| `.bi-*` | Foundations — logo, marks, colors, type, imagery, shapes, masks, voice, scale, apps, restraint | design-system.html reference only |
| `.ui-*` | UI component families — buttons, section wrap, cards, forms, tooltips, modals, tabs, etc. | design-system.html reference only |

**Per-page `<style>` blocks** — every brand and person tenant + source template carries page-specific CSS inline. This is documented as a known consolidation debt, not an architectural choice.

### D.2 Shared JS

| File | Role | Deferred? |
|---|---|---|
| [`main.js`](../../main.js) | Homepage + shared UI (search, nav, off-canvas menu, modals, share-modal image resolver chain) | no |
| [`ghar-carousel.js`](../../ghar-carousel.js) | Horizontal carousel factory `initCarousel()`. IntersectionObserver auto-play (threshold 0.15). Touch pan-y + 8px direction gate. | yes |
| [`ghar-ticker.js`](../../ghar-ticker.js) | Ticker / marquee chassis. | yes |
| [`gt-fancybox.js`](../../gt-fancybox.js) | Lightweight lightbox for design article template (independent of PhotoSwipe pipeline in the article body spec). | yes |
| [`ghar-core.css`](../../ghar-core.css) | Critical-path CSS carve-out for above-the-fold on the homepage. | no |
| [`dist/photoswipe/`](../../dist/photoswipe/) | PhotoSwipe v5 (article body lightbox — per [`EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json) lightbox contract) | yes |

**Shared JS globals** (from [`docs/CHANGELOG-since-last-github.md`](../../docs/CHANGELOG-since-last-github.md)):

| Global | Source | Purpose |
|---|---|---|
| `window.gharCityMatch(a, b)` | `main.js` | Canonical city-slug matcher. Handles aliases (Bombay↔Mumbai, Bangalore↔Bengaluru). Every filter chip + directory grid uses this. |
| `window.gharGridReveal(gridEl, {stagger, threshold})` | `main.js` | Whole-row reveal — reads live column count from CSS grid, batches by row not by fixed card count. |
| `window.gharCanCollapseNav()` | `main.js` | Nav collapse gate: only collapse L1 if a separate L2 subnav bar (`--subnav-h > 0`) takes the top. |
| `brContactOpen(name)` / `brContactClose()` / `brContactSubmit(e)` | inline per page (extraction to `dist/br-contact.js` pending) | Shared contact modal wiring. Every consumer currently reinlines the wiring code. |
| Trailing `<script>` per profile page | inline | Page-specific IntersectionObserver setup for `data-past-image`, `data-past-hero`, `data-contact-in-view`, `data-nav-hidden` body flags. |

### D.3 Partials system

[`partials/`](../../partials/) directory + [`scripts/build-partials.mjs`](../../scripts/build-partials.mjs). Marker-pair inlining at build time:

| Partial | Purpose |
|---|---|
| [`nav.html`](../../partials/nav.html) | Universal topbar |
| [`oc-menu.html`](../../partials/oc-menu.html) | Off-canvas slide-in menu |
| [`bottom-bar.html`](../../partials/bottom-bar.html) | Universal mobile bottom bar |
| [`footer.html`](../../partials/footer.html) | Site footer (not used on brand profiles — they ship `.bpr-microft` micro-footer) |
| [`br-contact-modal.html`](../../partials/br-contact-modal.html) | Shared "Contact this brand" modal. Triggered by any `[data-brand-contact data-brand="{name}"]` element. |
| [`br-brief-modal.html`](../../partials/br-brief-modal.html) | RFP / project brief capture modal |
| [`join-modal.html`](../../partials/join-modal.html) | Sign-in / sign-up modal |
| [`subscribe.html`](../../partials/subscribe.html) | Email subscribe card |
| [`subscribe-modal.html`](../../partials/subscribe-modal.html) | Subscribe modal |
| [`mobile-search-modal.html`](../../partials/mobile-search-modal.html) | Mobile search modal |

At backend integration each marker pair becomes a PHP `include`. The partial files become the includes verbatim.

### D.4 Design-system.html as living reference

[`_dev/reference/design-system.html`](../../_dev/reference/design-system.html) (13,669 lines) is the catalog. Served at `http://localhost:3000/design-system` (not the `_dev/…` path — the dev server auto-maps it). Divisions:

| Division | Section-ID prefix | What it holds |
|---|---|---|
| Foundations | `bi-*` | Logo, marks, colors, palette, rules, type, imagery, shapes, masks, color-cards, voice, scale, apps, restraint |
| Composition Rules | `cr-*` | Grid, section head, CTA, CTA placement, logo, card-link, carousel |
| UI Components | `ui-*` | Buttons, section wrap, section head, 3-col editorial grid, carousels, cards, section block, utilities, hover-patterns, inputs, forms, primitives, navbars, dropdowns, modals, toasts, tabs, tooltips, pagination, disclosure |
| Patterns | `hp-*` | Homepage patterns — voice, billboard, score, glyph, cards, properties, quotes, data, stats, principles, community, nav, hero, notify, b2b, footer, combo |
| Placeholders | (mixed) | `#design-pillar`, `#voices-chassis`, `#brand-profile-fallbacks`, `#in-focus-block` — stubbed placeholder anchors waiting for their catalog entries |
| UX Principles | `ux-*` | Overview |
| Social Media | `social-*` | Cards |
| Print & Brand | `print-*` | Overview |

**Two placeholder sections that matter for the next stretch of work:**

- `#brand-profile-fallbacks` (line 12989) — already exists as an anchor, empty content. This is the natural home for the brand-profile section registry + variant catalog once the architecture doc is done.
- `#voices-chassis` (line 12951) — sibling for the same treatment on the voices side.

### D.5 Docs handoff

[`docs/`](../../docs/) already contains 25+ programmer-facing handoff docs. The [`HANDOFF-INDEX.md`](../../docs/HANDOFF-INDEX.md) orders them by vertical and lists cross-cutting rules. Coverage today:

- **Read-first-no-matter-what:** CLAUDE.md, BACKEND-INTEGRATION-GUIDE, TEMPLATES-USAGE, STORY-schema
- **Brand + person profiles:** PROFILE-TEMPLATES-HANDOFF, BRIEF-brands-srp, BRIEF-people-pages, PEOPLE-portrait-sourcing (+ queue)
- **Design pillar + article template:** DESIGN-PILLAR-HANDOFF, DESIGN-ARTICLE-HANDOFF, DESIGN-taxonomy.html
- **Voices:** VOICES-HANDOFF
- **Editor migration:** EDITOR-migration-plan, EDITOR-blocks-spec.json (1173 lines), EDITOR-implementation-kit/ (PHP + JS + SQL + plugins)
- **Brand Connect:** BRANDCONNECT-spotlight-delivery, RATE-CARD-brandconnect-internal, BRAND-SERVICE-TEMPLATE-ANIMATION-SPEC
- **Search:** SEARCH-HANDOFF, SEARCH-MODAL-HANDOFF, SEARCH-CHANGES-HANDOFF, CHANGES-search-suggestions
- **Audience briefs (spec, pages not yet built):** BRIEF-buyers-page, BRIEF-brokers-page, BRIEF-developers-page
- **Fresh checkout aids:** CHANGELOG-since-last-github, SEARCH-CHANGES-HANDOFF

**What the docs directory does NOT yet contain, and this audit does not provide:**

- No `BRAND-ENGINE-ARCHITECTURE.md` (the architecture doc that follows this audit)
- No `SECTION-REGISTRY.md` / `SECTION-VARIANTS.md` for profile pages equivalent to `EDITOR-blocks-spec.json` for articles
- No `ENTITY-RELATIONSHIPS.md` for Brand↔Person↔Project many-to-many contracts
- No `DISTRIBUTION-SURFACES.md` for the entity-out-across-portal side
- No `ENTITLEMENTS.md` for capability/package contracts
- No `MOTION-SYSTEM.md` for the section-level motion profile system
- No `AI-INGESTION.md` for the Brand Connect onboarding pipeline

Those are the gaps the architecture doc will address.

### D.6 Build scripts

[`scripts/`](../../scripts/):

- `build-partials.mjs` — marker-pair inlining
- `build-person-profiles.mjs` + `person-profile-data.mjs` — a single record file stamps four person tenants through the same render function. **This is the seed of a composition engine — but only for people, only at build time.** Extending its shape to brand tenants + all persons (not just the 4 seeded ones) is a natural early win.

---

## E. Template Quality Matrix

The comparison brief §59 asks for. Not exhaustive per file — a comparative read on each capability, with a "best-implementation-wins" call for what the shared engine should learn from.

For brands, ordered from newest / most-polished to oldest:

| Capability | Horizon Architects | TEEARCH | Scarlet Splendour | Avirahi | Godrej | Obeetee | Saint-Gobain | Asian Paints | Best-implementation call |
|---|---|---|---|---|---|---|---|---|---|
| **Hero — mobile** | Warm ambient + card-lift + logo in-flow | Pattern B split, warm ambient | Pattern B split, product photo | Pattern B split, photo | Pattern B split, photo + glass metric ribbon | classic scrim | classic scrim | classic scrim | Pattern B ports pending on the 3 older tenants (per HANDOFF-INDEX). **Best: Horizon** (in-flow logo + badge pop, from the recent stretch of work). |
| **Hero — desktop** | Full-bleed with breathing meta-row | Same | Same | Same + glass metric ribbon (from Godrej) | Best-in-class glass panel + directional two-layer scrim | classic | classic | classic | **Best: Godrej** for the glass metric ribbon + scrim system; **Horizon** for the badge + logo pop cascade. |
| **Reveal / motion tuning** | Per-item IO at threshold 0 + rootMargin `-160px` + no cascade layering | `.js-cascade--rise` on section groups | Same | Same + GSAP scrub on film stage | Same | Older cascade-only | Older cascade-only | Older cascade-only | **Best: Horizon** (uncommitted stretch of tuning landed the per-item / no-cascade / anchored-rootMargin recipe). |
| **Sections — About/Story** | `#about` (service) with paragraphs + team + specialises + facts + registrations | Same shape | Same | `#story` (developer) — different section IDs, otherwise similar shape | `#story` + film hero | `#about` | `#about` | `#about` | Section-ID drift is the finding. Two names for the same conceptual section. See §F.1. |
| **Sections — Work/Projects** | `#work` with intelligence cards (uncommitted foot fix) | `#work` with rich project rail | `#work` product grid | `#projects` (developer) — grid | `#projects` with per-card real project photos + featured spotlight | `#work` product grid | `#work` product grid | `#work` product grid | Naming drift again. Featured-project pattern is best expressed in `bpr-featured` chassis (Avirahi/Godrej). |
| **Spotlight (editorial + intel + voices callout)** | Warm-white with per-card colour tones (per intel-titlecard rule) | Same | Warm-white | (developer family has no spotlight — its equivalent is baked into #recognition + #featured) | (none) | Warm-white | Warm-white | Warm-white | **Best: Horizon + TEEARCH** for the mixed intel + editorial + voices treatment. Developer family should adopt a version of this. |
| **Team / Leadership** | `.bpr-people` cards + monogram fallback | `.bpr-people` (Motta family) | `.bpr-people` (Kanodia + Bajoria + Cibic + Zupanc) | `.bpr-people` (Doshi + partners) | `.bpr-people` (Godrej founder family + leadership) | (minimal) | (minimal) | (minimal) | **Best: Avirahi + Godrej** for the partner-grid pattern. Portrait discipline enforced. |
| **Recognition / Awards / Timeline** | (implicit in About) | (implicit) | (implicit) | `#recognition` (hidden default) + `#timeline` | `#recognition` + `#timeline` | (implicit) | (implicit) | (implicit) | **Best: Godrej + Avirahi** for the explicit `#recognition` + `#timeline` sections. Should be lifted to shared vocabulary. |
| **Presence / Locations** | `#presence` with city list | Same | Same | Same + market presence | Same + metros list | Same | Same | Same | Shared pattern. Consistent. |
| **Contact panel** | Light warm-cream + `.jm-*` chassis (button-only after uncommitted stretch) | Same | Same | Same | Dark + older `.bpr-form` chassis | Same | Same | Same | Migration to light + `.jm-*` pending on the 4 older tenants (Godrej / Obeetee / Saint-Gobain / Asian Paints). Handoff §8.3. |
| **Sticky mobile bar** | Retreats on `data-contact-in-view` | Same | Same | Same | Same | Same | Same | Same | Shared pattern. Consistent. |
| **Sub-nav pills** | Wires to family-specific section IDs | Same | Same | Same | Family-specific | Family-specific | Family-specific | Family-specific | Family-specific because of the section-ID drift. Once sections normalize, sub-nav becomes shared. |
| **Sponsored placement** | Per-card only (intel/editorial), no section-level | Same | Same | Same | Same | Same | Same | Same | **Rule enforced: no section-level sponsorship.** ([[feedback_no_section_level_sponsorship]]). |
| **Theme tokens** | `--brand` + `--brand-soft` | Same | Same | Same | Same | Same | Same | Same | Consistent. Two tokens is the current contract. |
| **SEO** | `<title>` + `meta[description]` + OG + canonical | Same | Same | Same | Same | Same | Same | Same | Consistent shape; per-brand values manually filled. |
| **Performance** | Deferred JS, inline critical CSS pattern | Same | Same | Same | 3.2MB hero PNG flagged in HANDOFF-INDEX | Same | Same | Same | Consistent shape, Godrej hero is the one flagged asset. |

**Classification of the recurring patterns** (per brief §59):

- **GLOBAL STANDARD** (already portal-canonical, do not fork): `.jm-*` forms + shared modals, `.tip` tooltip, `.rail-outer/.rail` + `initCarousel`, `.vx-card`, `--brand` + `--brand-soft` tokens, `[hidden]` auto-hide, `data-brand-contact` trigger.
- **SHARED COMPONENT** (portal-wide but consumed by many, needs the current per-page inline CSS extracted to `dist/`): `.bpr-hero` (both classic + split variants), `.bpr-contact` (light + dark variants), `.bpr-people`, `.pp-portrait` + `.pp-monogram`, `.pp-voices-grid`, `.pp-work` + `.pp-idx--bare`, `.bpr-featured`.
- **SECTION VARIANT** (variants that should be codified in a section registry — see architecture doc): `bpr-sec--tight`, `bpr-sec--attached`, `bpr-hero--split`, `bpr-about--seamless-wrap`, `pp-sec--minor`, dark-vs-light `.bpr-contact`, cinematic-film vs standard hero.
- **BRAND-SPECIFIC** (legitimately unique, not a candidate for shared): Horizon's warm ambient hero graphic (SVG per brand), Godrej's `#film` commissioned-film section (may become shared once a second tenant needs it), Scarlet's product-led work grid variant.
- **LEGACY** (older patterns still shipping, migration pending): Classic hero on Obeetee / Saint-Gobain / Asian Paints, dark contact panel + `.bpr-form` on those + Godrej, older `.bpr-hero__socials` inline tooltip (should migrate to `.tip` chassis).

For persons: **one template, one treatment.** The universality rule (§B.2) means there is no per-person quality matrix — the quality question for people is "does the page work at every state?" and `person-profile-states.html` is the reference for that.

---

## F. Duplication + Drift + Problems + Gaps vs Brief

The consolidated list. Every item is either evidence for the architecture doc or an immediate cleanup ticket.

### F.1 Section ID drift across brand template families

| Concept | Service family says | Developer family says | Person profile says |
|---|---|---|---|
| About / lede | `#about` | `#story` | `#story` |
| Work / notable projects | `#work` | `#projects` | `#work` |
| Team | (implicit in `#about`) | `#team` | `#team` (`pp-sec--minor`) |
| Recognition / awards | (in `#about`) | `#recognition` | (in `pp-facts-registered`) |
| Timeline | (none) | `#timeline` | (none) |
| Presence / locations | `#presence` | `#presence` | (n/a) |
| Spotlight | `#spotlight` | (none — its role is spread across `#recognition + #featured`) | (partial — `#published` + `#voices`) |
| Contact | `#contact` | `#contact` | `#contact` |
| Voices | (in `#spotlight`) | (in `#recognition`) | `#voices` |

**Impact:** URL anchors are family-specific. Topbar sub-nav pills are family-specific. Cross-tenant deep links (an article "About TEEARCH" pointing to `/brands/teearch#about` won't work if someone changes TEEARCH to the developer template). Programmer-facing surprise: two different IDs mean the same thing.

**The fix belongs in the architecture doc**: a normalised section-ID vocabulary that both families use, plus a variant field on each section that captures the design difference. The section is `about`; the variant is `default` (service) or `story` (developer).

### F.2 Modifier vocabulary is undocumented

`bpr-sec--tight` / `bpr-sec--attached` / `bpr-hero--split` / `bpr-about--seamless-wrap` / `bpr-featured` / `pp-sec--minor` are all doing variant work today. None of these are cataloged in the design-system.html reference. A programmer building tenant #9 would have to grep to find out what modifiers exist.

**The fix**: a modifier + variant catalog entry in `_dev/reference/design-system.html#brand-profile-fallbacks` (that anchor already exists — see §D.4).

### F.3 CSS per-page inline

Every brand tenant and every person tenant carries all its CSS in a per-page `<style>` block. Duplicated between tenants. Diverges silently — the recent voices cleanup landed exactly because five person tenants had a stale local `.vx-card` override shadowing the canonical chassis in `dist/styles.min.css`.

Documented as pending in [`docs/PROFILE-TEMPLATES-HANDOFF.md §14`](../../docs/PROFILE-TEMPLATES-HANDOFF.md).

**The fix** — a shared `dist/brand-profile.min.css` extracted from the intersection of all brand tenants' inline CSS, and `dist/person-profile.min.css` for persons. Tenant-specific overrides (real ones — brand-tinted panels, per-tenant hero graphics) remain inline. The consolidation is a real refactor, best done AFTER the section registry lands so the extraction has a shared vocabulary to target.

### F.4 Brand ↔ Person is one-to-many, brief asks for many-to-many

Current DB shape suggestion: `people.brand_id INT FK NULL`. One person → at most one brand. The current 12-person tenant set actually respects this — every person is filed under one primary brand (Motta family → TEEARCH, Kanodia + Bajoria → Scarlet, Godrej family → Godrej Properties, Doshi + Shah + Bhansali → Avirahi, etc).

The brief §12–15 explicitly asks for many-to-many: a person can found one organisation, work at another, previously work elsewhere, sit on a board, participate in GharTalks, appear at events, work on multiple projects. Structured Brand ↔ Person relationships with `role / relationshipType / isFounder / isLeadership / isFeatured / displayOrder / startDate / endDate / isCurrent / visibility` fields.

**Impact today:** none — the current tenant set doesn't have anyone with two brand affiliations. **Impact tomorrow:** a founder who leaves one firm and joins another; an analyst whose commentary appears on 20 pages; a partner who sits on multiple boards. Every one of these breaks the single `brand_id` model.

**The fix** — a `brand_person_relationships` join table with the fields the brief lists, replacing the direct FK. Existing `brand_id` becomes derived / primary-relationship-only. This is a real DB migration on the programmer's side; it needs to be planned before more tenants land or the migration surface grows.

### F.5 No distribution engine (entity → other surface)

The article side has a placement engine (per [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json) `autoInjection.rules`) that injects brand + person + newsletter + recirculation + trending + intelligence modules INTO articles at render time based on priority + audience + tag rules.

**The reverse doesn't exist.** No engine that surfaces a Brand or Person across many pages. Today, a brand card in the `brands` directory, in an "Also at TEEARCH" strip on a person profile, on a project page sidebar, in a related-brand rail on another brand's page — every one of those is manually placed HTML. There's no `resolveBrandsForSurface(surfaceId, {city, category, entitlement})` function.

**The fix** — a distribution surface registry + resolver, sitting alongside the article-side auto-injection engine, using the same priority + audience + entitlement vocabulary. Architecture doc.

### F.6 No entitlement engine

Covered in §C.2 – §C.3. No table that maps brand → capability. Package tier is marketing copy. Every current "enhanced" behaviour is a manual editorial decision.

**The fix** — a `brand_entitlements` table + a `resolveEntitlements(brandId)` function + capability keys used throughout the frontend (`data-cap="premium_profile"`, `data-cap="ghartalks"`, etc.). Packages become bundles of capability keys, defined in one place. Architecture doc.

### F.7 No AI ingestion pipeline

The brief §9 describes a Brand Connect onboarding workflow that identifies existing Ghar.tv entities, resolves duplicates, creates missing entities, creates relationships, AI-suggests composition, admin reviews, publishes. None of this exists.

**Today's onboarding is manual:** someone clones `_dev/templates/brand-profile-service.html` to `brand-profile-{slug}.html`, hand-fills the content, adds a `vercel.json` rewrite. The content is the AI ingest surface; the programmer's task is to make that programmatic + AI-assisted.

**The fix** — is genuinely new. Architecture doc will propose the shape (ingest input → entity resolution → relationship creation → composition suggestion → admin review → publish), but the actual pipeline is the programmer's build.

### F.8 No admin controls (AUTO / MANUAL / CUSTOM per section)

Brief §28 – §29 asks for four content modes per section: AUTO (retrieve related), MANUAL SELECT (admin picks records), MANUAL CONTENT (admin enters text/media), CUSTOM HTML (escape hatch). This is a rich admin surface. None of it exists today.

**Today's "admin" is:** edit the HTML file. Or (for articles) fill the giarticle.php form fields.

**The fix** — architecture doc will propose the section configuration schema (what a per-section config record looks like), the admin surface shape (section reorderable / hideable + variant picker + content-source picker + item selector), and the render-time resolver that consumes the config. The programmer builds the admin.

### F.9 No motion system

Motion is currently per-page inline JS + CSS keyframes. Every brand tenant has its own reveal setup. No motion profiles ("editorial", "cinematic", "dynamic"). No section-level motion attribute. No shared motion tokens.

The best-in-class recipe (Horizon's per-item + no-cascade + threshold 0 + rootMargin `-160px`) was arrived at through the recent stretch of tuning and is not yet codified anywhere shared.

**The fix** — a motion token contract + a `data-motion-profile` attribute at page or section level + shared observer setup extracted to `dist/main.min.js`. Architecture doc.

### F.10 No explicit section registry for profile pages

`docs/EDITOR-blocks-spec.json` is a mature 30+ block registry for ARTICLES with `htmlTemplate` + `cssClasses` + `fields` + validation for each block. There is no equivalent for BRAND or PERSON profile SECTIONS. The current section vocabulary is implicit in the source templates + the DB schema suggestion in BACKEND-INTEGRATION-GUIDE.

**The fix** — a `SECTION-REGISTRY.md` + `sections.json` (analogous to `EDITOR-blocks-spec.json`) that enumerates every profile section, its variants, its required data fields, its content-availability rules, its fallback behaviour. Architecture doc.

### F.11 No explicit category-aware composition rules

The three brand template families (default / developer / service) are the current expression of "different categories get different compositions." But which categories map to which family is undocumented and hardcoded to the choice-of-template-at-clone-time. When a Building Materials brand onboards, the choice is manual. When a Furniture brand onboards, ditto. When a Financial Institution onboards — there's no template for that at all.

**The fix** — a `COMPOSITION-RULES.md` + a category-to-section-priority map (per brief §46, `required / preferred / optional / premium / fallback / irrelevant` per section per category). Architecture doc.

### F.12 Chassis divergence — 4 older tenants still on legacy

Named in [`docs/HANDOFF-INDEX.md`](../../docs/HANDOFF-INDEX.md) "Pending big items":

1. Pattern B mobile hero not ported to Godrej / Obeetee / Saint-Gobain / Asian Paints (only Horizon + Teearch + Avirahi are on Pattern B; Godrej is a special case that uses classic desktop + Pattern-B-ish mobile via the glass panel).
2. Contact panel light migration on same 4 tenants.
3. Socials tooltip on brand profiles still uses inline equivalent instead of shared `.tip` chassis.
4. Placeholder social handles on person profiles (Tarun / Devesh / Hiten currently show "Placeholder LinkedIn" — backend needs to supply real handles or the pills should be suppressed when data is missing).

These are known, tracked, and not blocking. Called out here because they represent the difference between "how the newest tenant looks" and "what the shared engine has to be able to reproduce for every tenant."

### F.13 Person → brand-attributed content leakage

Documented cleanup in [`docs/PROFILE-TEMPLATES-HANDOFF.md §5.3`](../../docs/PROFILE-TEMPLATES-HANDOFF.md) landed for Tarun / Devesh / Hiten Motta profiles + Avirahi's Voices section. The 3 older brand tenants (Obeetee / Saint-Gobain / Asian Paints) were spot-checked as clean but not fully audited. A full attribution audit on every tenant is prudent before hard launch — but not something this audit blocks on.

### F.14 Progressive schema-ification pattern is worth adopting for profiles

The Voices vertical currently keeps its frontmatter in the piece's `<head>` as `<meta>` tags. At 30+ pieces it graduates to a `docs/voices-pieces.json` manifest. Only then does it migrate into a proper DB table. This is a good progressive pattern — it proves the schema before the migration.

**The equivalent for brand + person profiles** — extract the per-tenant HTML's inline content into structured YAML front-matter or a `docs/brands-tenants.json` + `docs/people-tenants.json` manifest as an intermediate step, so the DB schema in [`docs/BACKEND-INTEGRATION-GUIDE.md`](../../docs/BACKEND-INTEGRATION-GUIDE.md) is validated against real data before the programmer builds the schema in MySQL. The `scripts/person-profile-data.mjs` file is already the seed of this pattern for 4 person tenants; extending it to all 12 people + all 8 brands would be a very early win.

### F.15 The `/brand-connect` public page describes commercial capabilities that don't yet have technical primitives

Related to §C.3 – §F.6. The public [`brand-connect.html`](../../brand-connect.html) landing is currently marketing text on top of manual editorial. When the programmer builds entitlement primitives (§F.6), the commercial page should consume the same package definitions as the entitlement engine — so a change to what "Spotlight" includes updates the landing page automatically. Marketing descriptions stay editable; package facts do not diverge. Architecture doc.

---

## G / H / I / J / K — Deferred to `BRAND-ENGINE-ARCHITECTURE.md`

The audit stops here per the plan the user approved. The remaining brief §121 sections cover **proposed architecture, data model evolution, folder structure, migration strategy, reference implementation**. Those recommendations depend on this audit being reviewed first — the "best-implementation-wins" calls in §E and the drift catalog in §F are inputs to the architecture, not conclusions of it.

**The architecture doc will propose, in order:**

1. **Section Registry for profile pages** — analogous to `EDITOR-blocks-spec.json`, one entry per section (hero, about, work, presence, spotlight, team, timeline, recognition, contact, closer, voices, published, etc.), with `variants`, `fields`, `contentAvailabilityRules`, `fallbacks`, `entitlement` gates.
2. **Composition Rules per category** — brief §46 pattern: `required / preferred / optional / premium / fallback / irrelevant` per section per category, encoded as a small config table the composer reads.
3. **Entity Relationship Model** — `brands`, `people`, `projects`, `products`, `articles` as first-class entities; `brand_person_relationships`, `brand_project_relationships`, `person_project_relationships` as many-to-many join tables.
4. **Distribution Surface Registry** — brief §84 pattern: `brandDirectory / peopleDirectory / categoryPage / homepage / projectPage / propertyPage / localityPage / articlePage / intelligencePage / search / relatedContent / newsletter / recommendations`. Each surface declares `eligibleEntityTypes / relationshipRequirements / organicSlots / promotedSlots / rankingRules / entitlementRequirements`.
5. **Entitlement Contract** — capability keys + package bundles + admin controls.
6. **Motion System** — profile names + section-level attribute + shared observer setup.
7. **Admin Controls Schema** — per-section AUTO / MANUAL SELECT / MANUAL CONTENT / CUSTOM HTML config.
8. **AI Ingestion Contract** — input → entity resolution → relationship creation → composition suggestion → admin review → publish.
9. **Migration Strategy** — one existing tenant migrated as reference, second-tenant proof, per-family rollout order.
10. **Reference Chassis** — clean, canonical source templates rebuilt to be the programmer's template source, with every section variant inline and marked with data attributes so the programmer strips down to what a specific brand actually needs.

The intent is that the architecture doc + reference chassis + updated `_dev/reference/design-system.html#brand-profile-fallbacks` catalog entries together give the programmer everything needed to wire the dynamic layer without further design + product decisions.

---

## Housekeeping

- **Uncommitted local changes** from the previous stretch of work — pp-contact form → button on 14 files, voices cleanup + native rail on 5 files, intel foot fix on 15 files, pp-contact grid alignment on 14 files — remain held for the user's push authorization. This audit does not push.
- **This audit itself is uncommitted.** It lives at `_dev/reference/BRAND-ENGINE-AUDIT.md`. `_dev/` is gitignored except for `_dev/templates/`, `_dev/README.md`, `_dev/reference/design-system.html`. So this file is local-only until the user chooses to un-ignore it (add an exception) or copy it into `docs/`.
- **Next step**, on user sign-off: proceed to `_dev/reference/BRAND-ENGINE-ARCHITECTURE.md` (sections G–K), then the reference chassis files under `_dev/templates/`, then the section registry catalog entries under `_dev/reference/design-system.html#brand-profile-fallbacks`.

**Last updated:** 2026-08-31 (initial audit — Claude, in response to the 126-item Brand Connect + Entity Publishing + Distribution Engine brief).
