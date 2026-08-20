# Templates — how to render pages server-side from `_dev/templates/`

> Contract for the backend integrator. The pages in `_dev/templates/`
> are the source-of-truth documents for brand and person profiles:
> the exact markup + CSS the frontend was built against, with copious
> inline comments explaining how to swap real data in.

**Location:** `_dev/templates/`. This folder is deliberately kept out
of the normal `_dev/` ignore rule so it ships in the repo. Everything
else under `_dev/` (prototypes, archive, tools, scratch) is local-only.

**Files:**

| Template | URL family | Purpose |
|---|---|---|
| `brand-profile.html` | `/brands/{slug}` | Default brand profile (chromeless full-hero). Use this for a plain brand microsite. |
| `brand-profile-developer.html` | `/brands/{slug}` | Developer-brand variant. Larger project grids, mandate-focused sections. |
| `brand-profile-service.html` | `/brands/{slug}` | Service-brand variant (like Teearch). Category strips, client logo grid. |
| `person-profile.html` | `/people/{slug}` | Person profile. Portrait or monogram fallback. |
| `person.html` | build seed | Not served. `scripts/build-person-profiles.mjs` reads this + `person-profile-data.mjs` to stamp each tenant. |
| `person-profile-states.html` | dev only | Every data-gated state rendered in one scroll. **Read this to understand `[hidden]` auto-hide behaviour** — a live profile only shows a third of the modules; this page shows all of them. |

---

## The one rule that makes this whole system work

**Every module that can be absent has a `hidden` attribute + a CSS rule
that hides it, so it collapses cleanly when the backend has no data
for that section.**

```html
<section class="bpr-sec" hidden data-section="podcast-appearances">
  <!-- rendered when the DB has podcast rows for this brand -->
</section>
```

```css
.bpr-sec[hidden] { display: none; }
```

**What your PHP does:** for each section, run its DB query. If the
query returns rows, `unset` the `hidden` attribute AND fill the inner
markup. If the query is empty, leave `hidden` on — the section
collapses and adjacent margins remain balanced.

**Never** delete the `<section>` node when a query is empty. Later
edits to the page assume the section exists in the DOM and only its
`hidden` state varies.

---

## Brand profile — data contract

**Route:** `/brands/{slug}`. Vercel `vercel.json` rewrites the six
built tenants explicitly; new tenants get a rewrite added there.

**Root element:**

```html
<main
  data-brand-slug="{slug}"
  data-brand-name="{name}"
  style="--brand: {hex}; --brand-soft: {hex};">
  ...
</main>
```

- `--brand` is the tenant's primary hex. Every accent, hover state,
  and contact-panel fill derives from it via CSS.
- `--brand-soft` is a lightened variant. Usually `color-mix(in oklab,
  var(--brand) 20%, white)` is enough; only override when the auto-mix
  produces a poor tone.

**Fields the template consumes (map to your `brands` table):**

| Template selector | DB field | Notes |
|---|---|---|
| `<title>`, `meta[description]`, `og:*`, `canonical` | name, tagline, hero image, canonical URL | Set in `<head>`. |
| `.bpr-hero__bg img` | `hero_image_url` | Full-width hero photo. |
| `.bpr-hero__logo img` | `logo_url` | Logo tile. White or dark bg per contrast rule. |
| `.bpr-hero__eyebrow` | `category` + " · Since " + `founded_year` | e.g. "Architecture · Since 2001". |
| `.bpr-hero__name` | `name` | H1. |
| `.bpr-hero__tagline` | `tagline` | Short lede. |
| `.bpr-hero__meta-row` | facts list | Metrics + Website pill. |
| `.bpr-hero__socials` | socials list | Icons first, tooltip on hover (desktop) / label after (mobile linktr.ee stack). |
| `.bpr-sec[data-section]` | per-section rows | Auto-hide via `hidden` when empty. |
| `.bpr-contact__form` | contact form | Portal-canonical `.jm-*` field chassis. Submits to your endpoint. |

**Sections (auto-hide via `hidden` when the backend has no rows):**

- About / lede
- Notable projects
- Categories / services
- Clients
- Team (partners, leads — data-gated on real portraits per
  `feedback_no_person_without_portrait`)
- Voices (person-attributed — only surface here when the voice is
  ABOUT the brand)
- Editorial mentions
- Podcast appearances
- Awards
- Contact

---

## Person profile — data contract

**Route:** `/people/{slug}`.

**Root element:**

```html
<main data-person-slug="{slug}" data-person-name="{name}">
  ...
</main>
```

- **No per-tenant colour theming.** Every person page is white +
  warm-white + ink + hairlines. The portrait is the colour. This is
  deliberate — inheriting an employer's hex paints a paid caste across
  the directory.

**Fields the template consumes (map to your `people` table):**

| Template selector | DB field | Notes |
|---|---|---|
| `.pp-portrait img` | `portrait_url` OR null → `.pp-monogram` | Fallback pattern: if `portrait_url` null, hide `.pp-portrait` and show `.pp-monogram` containing the person's initials. |
| `.pp-hero__eyebrow` | derived from `cat_id` | e.g. "Architecture", "Advisory", "Interiors". A FIELD, never a title claim. |
| `.pp-hero__name` | `name` | H1. |
| `.pp-hero__role` | `role` + ", " + `brand_link` | e.g. "Partner, TEEARCH →". Brand name is a link to `/brands/{brand_slug}`. |
| `.pp-facts` | `city`, `discipline`, `experience` | Fact chips. |
| `.pp-metrics` | `figures[] { value, label }` | 2–4 real numbers. Never derived, never rounded up. Empty → block does not draw. |
| `.pp-specialises` | `specialises[]` | Warm-cream panel. |
| `.pp-about` | `manifesto_lede` + `bio_paragraphs[]` | Manifesto is a display-scale lede; bio unfolds beneath. |
| `.pp-facts-registered` | `registrations[]` | e.g. "Registered Licensed Surveyor, MCGM (2004)". |
| `.pp-work` | `notable_projects[]` | Delivered with linked brand. Trim to 4; append "See {brand}'s full portfolio" link. |
| `.pp-published` | published content by/about the person | If empty → `.pp-published-empty` shows a warm-cream note. Never show brand-attributed content here. |
| `.pp-voices` | Voices by this person | `.vx-*` chassis. Empty → block hides. |
| `.pp-related` | "Also at {brand}" | 2–3 co-worker cards. |
| `.pp-closer` | fixed | Closer with paired CTAs. `Get in touch` (primary) + `See more people` (secondary text link). |

**Content attribution rule (load-bearing):**
- Content **by or about the person** → person profile.
- Content **about the person's employer brand** → brand profile.
- No cross-contamination. See
  `docs/PROFILE-TEMPLATES-HANDOFF.md` §5.

---

## Portrait vs monogram fallback

```html
<div class="pp-portrait-wrap">
  <div class="pp-portrait">
    <img src="{portrait_url}" alt="{name}" />
  </div>
  <!-- monogram is a sibling, hidden when portrait exists -->
  <div class="pp-monogram" aria-hidden="true">{initials}</div>
</div>
```

```css
.pp-portrait-wrap:has(.pp-portrait img[src]) .pp-monogram { display: none; }
.pp-portrait-wrap:has(.pp-portrait img[src=""]) .pp-portrait { display: none; }
```

**Your PHP:**

```php
if ($person->portrait_url) {
  echo '<div class="pp-portrait"><img src="'.e($person->portrait_url).'" alt="'.e($person->name).'"/></div>';
  echo '<div class="pp-monogram" aria-hidden="true">'.e($person->initials).'</div>';
} else {
  echo '<div class="pp-monogram">'.e($person->initials).'</div>';
}
```

**Do NOT** render an `<img>` with an empty `src` attribute. Empty
`src` triggers a browser request to the current page URL, which shows
up as a broken image in the network tab (this was a bug fixed for the
share modal — see `docs/SEARCH-CHANGES-HANDOFF.md` and
`docs/PROFILE-TEMPLATES-HANDOFF.md` §9).

---

## Share modal image resolver — the fallback chain

Every profile page ships with a share modal (`.bsm-*` chassis). The
image the modal shows is resolved in this order:

1. `main[data-brand-share-image]` — explicit override on the main
   element. If your CMS stores a per-profile share image, put it here
   with a **leading slash** (`/brand_assets/foo.jpg`), not a relative
   path.
2. `.bpr-hero__bg img` — the brand profile hero photo.
3. `.pp-portrait img` — the person profile portrait. (New in this
   push — was missing on person profiles, caused the share modal to
   show a blank tile.)
4. `.bpr-hero__logo img` — the brand logo, marked as `isLogo=true`
   so the modal renders it against a solid ground.

**Your PHP renderer:** set `data-brand-share-image` on `<main>` if
you have a dedicated share image. Otherwise omit it and let the
resolver walk the chain.

---

## Sections that render sub-components

Some sections defer to shared card chassis. Do NOT reinvent them
server-side:

| Section | Card chassis | Docs |
|---|---|---|
| Voices card | `.vx-card` (eyebrow / claim / meta) | `docs/VOICES-HANDOFF.md` |
| Person card (in "Also at" strip) | `.bpr-person` | `docs/BRIEF-people-pages.md` |
| Brand card (in Brands directory) | `.bpr-brand` | `docs/BRIEF-brands-srp.md` |
| Article card (in editorial strips) | `.article-card` | (in `_dev/reference/design-system.html`) |
| Podcast episode card | `.ep-card` | (in `_dev/reference/design-system.html`) |

**Where to look up any card chassis:** open
`_dev/reference/design-system.html` in a browser
(`http://localhost:3000/design-system` when the dev server is up). It's
the living catalog. Every card / rail / chip / form is there with
markup + rendered example.

---

## CSS override discipline

The templates rely on the shared cascade in `styles.css` / `nav.css`
and per-page `<style>` blocks near the top of the file. Rules to
follow when integrating server-side:

1. **Never fork a shared class.** If `.bpr-hero__socials` behaves 90%
   right for your case, use it. Don't create `.dev-hero__socials`.
   Fork = future divergence.
2. **Per-page `<style>` blocks lose specificity battles with shared
   `styles.css`.** If you need a shared rule to win over a page's
   inline `<style>`, add `!important` to the shared rule (see
   `feedback_shared_css_loses_to_page_style`).
3. **Cache-bust the bundles when you rebuild.** Every `<link>` and
   `<script>` reference to `dist/*.min.css` / `dist/*.min.js` uses
   `?v={n}`. Bump on rebuild.

---

## When the template gets a schema change

The templates are HTML source; there's no separate schema file. When
you add a new field:

1. Add the DB column / query.
2. Add the markup selector to the template with `hidden` + a data
   attribute.
3. Add the corresponding CSS rule (usually `.bpr-sec[hidden]` or
   `.pp-{block}[hidden]` already covers it — check first).
4. Update `docs/PROFILE-TEMPLATES-HANDOFF.md` §data model with the
   new field.
5. Rebuild `dist/`. Bump cache-buster.

---

## Reference — component catalog

`_dev/reference/design-system.html` is the living catalog. It ships
with the repo for exactly this purpose. Open at
`http://localhost:3000/design-system` (the dev server auto-maps it) to
see every reusable pattern with markup + working example.
