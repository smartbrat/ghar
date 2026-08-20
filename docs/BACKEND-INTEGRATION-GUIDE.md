# Backend integration — PHP + MySQL wiring guide

> High-level playbook for wiring the shipped pages to your PHP + MySQL
> stack. Field-by-field template mapping is in `docs/TEMPLATES-USAGE.md`;
> this doc covers the DB shape, routing pattern, and integration
> checklist.

**Companion docs:**
- `docs/HANDOFF-INDEX.md` — read first, orders everything by vertical.
- `docs/TEMPLATES-USAGE.md` — per-template field contract.
- `docs/CHANGELOG-since-last-github.md` — what changed since your last
  pull, so you don't re-integrate old work.

---

## The deployment shape

- Static pages ship as they are. `vercel.json` sets `buildCommand` to
  a no-op — the repo is a static site.
- When you swap in PHP, you're the one rendering the HTML. The shipped
  `.html` files are the reference: keep the markup + class names + JS
  hooks byte-identical, only swap the data.
- Dist bundles (`dist/main.min.js`, `dist/styles.min.css`) are
  pre-built. Your PHP layout should serve them from `/dist/*` with
  their cache-buster query intact.

---

## Suggested DB schema (minimum viable)

The templates were built with these tables in mind. Names are
suggestive — use whatever your existing schema calls them.

### `brands`

| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| slug | varchar unique | Used in `/brands/{slug}` URL. |
| name | varchar | |
| tagline | text | |
| category | enum | e.g. Developer, Service, Interiors, Material. Drives hero eyebrow + which template variant to render. |
| founded_year | year | Renders as "Since {year}" in eyebrow. |
| brand_color_hex | char(7) | Sets `--brand`. |
| brand_soft_hex | char(7) NULL | Sets `--brand-soft`; when null, template auto-mixes. |
| hero_image_url | varchar | |
| logo_url | varchar | |
| website | varchar | |
| about_lede | text | Displayed as large-scale lede. |
| about_paragraphs | json | Array of paragraph strings. |
| share_image_url | varchar NULL | Optional override for `data-brand-share-image`. |
| published | bool | |

### `brand_socials`

| Column | Type | Notes |
|---|---|---|
| brand_id | int FK | |
| kind | enum | website / instagram / linkedin / youtube / email |
| url | varchar | |
| label | varchar | Renders in mobile linktr.ee stack. |

### `brand_metrics`, `brand_notable_projects`, `brand_categories`, `brand_clients`, `brand_team`, `brand_editorial`, `brand_podcasts`, `brand_awards`

One row per item. Empty tables → sections auto-hide via the `hidden`
attribute (see `TEMPLATES-USAGE.md` §"The one rule").

### `people`

| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| slug | varchar unique | Used in `/people/{slug}` URL. |
| name | varchar | |
| initials | char(2–3) | Monogram fallback when portrait null. |
| role | varchar | e.g. "Partner". |
| brand_id | int FK NULL | If they work for a brand in `brands`. |
| brand_link_label | varchar NULL | Sometimes the role brand is different from the profile brand. |
| city | varchar | Used by `window.gharCityMatch` for filter chips. |
| cat_id | enum | architects / interiors / developers / brandleaders / advisors / research. **Required** — drives hero eyebrow. |
| discipline | varchar NULL | Qualification, short form. |
| experience | varchar NULL | e.g. "44 years in practice". |
| portrait_url | varchar NULL | Null → monogram fallback. |
| portrait_original_url | varchar NULL | Pre-crop original, kept for future re-crop. |
| claimed | bool | Renders one line of small print at foot; not a badge by the name. |
| published | bool | |

### `person_figures`, `person_specialises`, `person_bio_paragraphs`, `person_registrations`, `person_notable_projects`, `person_published`, `person_voices`

One row per item. All auto-hide when empty.

---

## Routing — `/brands/{slug}` and `/people/{slug}`

Two options:

### Option A — one PHP handler per URL family

```apache
# .htaccess (or nginx equivalent)
RewriteRule ^brands/([a-z0-9-]+)$ /brand-profile.php?slug=$1 [L]
RewriteRule ^people/([a-z0-9-]+)$ /person-profile.php?slug=$1 [L]
```

```php
// brand-profile.php
$slug = $_GET['slug'] ?? '';
$brand = fetchBrandOrNotFound($slug);
$template = match($brand->category) {
  'developer' => '_dev/templates/brand-profile-developer.html',
  'service'   => '_dev/templates/brand-profile-service.html',
  default     => '_dev/templates/brand-profile.html',
};
renderTemplate($template, $brand);
```

**Advantage:** clean, single entry, easy to add caching.

### Option B — one static page per brand, generated

Keep the shipped `brand-profile-{slug}.html` files for the six
currently-built tenants and generate the rest with a build script
similar to `scripts/build-person-profiles.mjs`. This is what the repo
does for the four person profiles.

**Advantage:** no PHP hot path — Vercel serves static, cache is free.
**Disadvantage:** you need a rebuild + deploy for every content change.

**Recommendation:** Option A for scale, Option B while the tenant list
is small and hand-curated (< 20).

---

## Session flow — no PHP-session dependencies in the shipped code

The shipped JS treats these as **client-side only**:

- Recent searches → device `localStorage`.
- Selected search chips (city + localities) → `sessionStorage` +
  URL params.
- Sign-in state → a cookie your backend sets; JS reads it to swap the
  "Sign In" button for a profile icon.

No PHP `$_SESSION` is required for the page renders. Sign-in state is
purely a cookie boolean.

---

## Form submissions

All contact / RFP / subscribe forms submit to endpoints you provide.
The forms use the portal-canonical `.jm-*` field chassis (see
`_dev/reference/design-system.html`). Each form ships with:

- Client-side validation for required fields.
- A hidden `csrf` field the JS reads from a `<meta name="csrf">` tag.
  Your PHP layout should render the meta tag with a fresh token.

**Endpoints the shipped code expects:**

| Form | Method | Endpoint | Payload |
|---|---|---|---|
| Contact modal (any brand) | POST | `/api/brand-contact` | name, phone, email, note, brand_slug |
| RFP / brief modal | POST | `/api/brand-brief` | name, phone, email, project, budget, timeline, brand_slug |
| Subscribe modal | POST | `/api/subscribe` | email |
| Post Property | POST | `/api/property/create` | (existing flow — unchanged) |
| Sign in (phone + password) | POST | `/api/auth/signin` | phone, password |

**Response contract:** JSON `{ ok: true }` on success, `{ ok: false,
error: "..." }` on failure. The frontend paints the response into a
toast; nothing else moves.

---

## Sponsored content — attribution semantics

The design pillar surfaces sponsored articles with two attribution
patterns:

- **"In Collaboration With"** — brand co-produced the piece.
- **"Presented By"** — brand paid for placement; editorial produced.

**DB shape:**

```sql
articles.sponsored_by_brand_id INT NULL
articles.sponsorship_kind ENUM('collaboration', 'presented') NULL
```

Render only when both non-null. See
`docs/BRANDCONNECT-spotlight-delivery.md` and
`docs/RATE-CARD-brandconnect-internal.md` (internal, do not display to
users).

---

## Search — see the dedicated doc

Search modal + suggestion UX + URL builder + backend contract:
**`docs/SEARCH-CHANGES-HANDOFF.md`** (written specifically for the
programmer who already integrated the earlier version).

**Key fact:** the URL builder and backend suggestion endpoint contract
are UNCHANGED. Only the presentation layer moved. If your PHP
suggestion endpoint already answers the earlier version, nothing
server-side needs to change.

---

## Universal nav + footer

- `partials/nav.html`, `partials/footer.html`, `partials/oc-menu.html`,
  `partials/bottom-bar.html` — the four universal chrome partials.
- `scripts/build-partials.mjs` inlines them into every root `.html`
  page. If your PHP layout takes over rendering, `include` the partials
  directly and skip the build step.
- **All partials use absolute asset paths** (`/brand_assets/...`,
  `/dist/...`). Confirmed for the logo asset in the previous commit
  (`3be9609`).

---

## Performance guardrails to preserve

- **Dist bundles are cache-busted per bump.** Do not strip the
  `?v=91` / `?v=20` query params. They ensure browsers pick up new
  bundle content. When you rebuild `dist/`, bump both.
- **`ghar-carousel.js` gates auto-play on visibility.** Don't force
  auto-play from PHP — let the IntersectionObserver do its job.
- **Off-canvas menu + modals block scroll via event handlers, NOT
  `position: fixed` on body.** GSAP ScrollSmoother breaks with fixed
  body. Preserve the event-listener pattern.
- **Fonts are declared inline in each page's `<head>`** via a
  `@font-face` block plus `gazpacho.css`. Do NOT move to `styles.css`
  — the font family will FOUT on cold loads if you do. See
  `feedback_font_face_per_page` in memory.

---

## Content attribution — the load-bearing rule

Every profile page carries content by/about that entity, and never
that entity's employer / employee content. See
`docs/PROFILE-TEMPLATES-HANDOFF.md` §5. When you write the DB queries
for the "Also seen on Ghar.tv" / editorial strips:

- On a **brand profile**: `WHERE article.brand_id = :brand_id`.
- On a **person profile**: `WHERE article.author_id = :person_id OR
  article.subject_person_ids CONTAINS :person_id`.
- **Never** join person profile to their employer's articles unless
  the article specifically names the person.

Cross-contamination looked plausible in demo data and got shipped in
early iterations. It's a real correctness bug, not a nit.

---

## Local dev — how the shipped repo runs

The programmer should be able to clone + run without setup:

```bash
git clone git@github.com:smartbrat/ghar.git
cd ghar
npm install     # only if you're rebuilding dist
node serve.mjs  # dev server at http://localhost:3000
```

`serve.mjs` is a tiny static server that:

- Serves the repo root at `http://localhost:3000/`.
- Auto-maps every `.html` under `_dev/*/` at boot so
  `/design-system` → `_dev/reference/design-system.html`.
- Falls back to the `_dev/` variant on a root 404. Moved prototypes
  keep their old URLs.
- Mirrors the `vercel.json` rewrites so `/brands/teearch` locally
  resolves to `brand-profile-teearch.html`.

---

## The reuse-first protocol (repeat because it matters)

Before writing new HTML / CSS / JS for any UI element:

1. Grep `_dev/reference/design-system.html` — is there a catalog entry
   for this component?
2. Grep `styles.css` — is there a class that already paints this?
3. Grep `main.js` / `ghar-carousel.js` — is there a function that does
   this?

If a shared asset covers your case, use it. Forks always come home to
roost in the form of divergent bugs on other pages.

If something genuinely new is needed, add it to
`_dev/reference/design-system.html` as a catalog entry so the next
page reuses it.

---

## When you're done integrating

1. Diff your rendered HTML against the shipped `.html` files.
   Everything except the data content should be byte-identical: class
   names, section order, `data-*` attributes, `[hidden]` state.
2. Test every form endpoint returns `{ ok: true }` or a clean error.
3. Test the search flow end-to-end. See
   `docs/SEARCH-CHANGES-HANDOFF.md` §Testing checklist.
4. Test share modal on both a brand profile and a person profile —
   the preview image must resolve correctly (fallback chain in
   `docs/TEMPLATES-USAGE.md` §"Share modal image resolver").
5. Push to a preview URL first. Vercel auto-deploys the `main` branch
   — use a feature branch for staging.

---

## When something breaks

- **Section renders empty:** you removed the `hidden` attribute but
  didn't fill the inner markup. Add the markup, or restore `hidden`.
- **Section doesn't render at all:** you deleted the `<section>` node.
  Restore it — later edits assume it exists in the DOM.
- **Carousel doesn't scroll:** `ghar-carousel.js` didn't load. Check
  `<script>` order — must load AFTER the rail markup.
- **Nav collapse mispresenting:** you have a sub-nav bar somewhere
  the CSS variable `--subnav-h` isn't being set. See
  `feedback_nav_collapse_gate` in memory / `main.js`.
- **Font FOUT on cold load:** you moved `@font-face` to `styles.css`.
  Move it back into each page's `<head>`.
- **Logo 404 on subpath URLs:** absolute path missing on
  `brand_assets/logo.svg`. Fixed in `3be9609` for the shipped
  partials — check your PHP includes if you're not using the shipped
  partials.

---

**Last updated:** 2026-08-20. Companion docs listed at the top.
