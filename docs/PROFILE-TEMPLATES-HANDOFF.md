# Profile Templates: Backend Handoff

> Brand profile and person profile templates. Two templates, shared chassis,
> different content models. This doc is the contract: what's built, what
> patterns to reuse, what content attribution rules to enforce, and the open
> work for the next iteration.

**Live templates**
- Brand base: [`brand-profile-service.html`](../brand-profile-service.html) → template
- Brand tenants:
  - [`brand-profile-teearch.html`](../brand-profile-teearch.html) → `/brands/teearch` (service brand exemplar)
  - [`brand-profile-avirahi.html`](../brand-profile-avirahi.html) → `/brands/avirahi` (developer exemplar)
  - [`brand-profile-godrej-properties.html`](../brand-profile-godrej-properties.html) → `/brands/godrej-properties` (older tenant)
  - [`brand-profile-obeetee.html`](../brand-profile-obeetee.html) → `/brands/obeetee`
  - [`brand-profile-saint-gobain.html`](../brand-profile-saint-gobain.html) → `/brands/saint-gobain`
  - [`brand-profile-asian-paints.html`](../brand-profile-asian-paints.html) → `/brands/asian-paints`
- Person base: [`person-profile.html`](../person-profile.html) → template
- Person tenants:
  - [`person-profile-tarun-motta.html`](../person-profile-tarun-motta.html) → `/people/tarun-motta`
  - [`person-profile-devesh-motta.html`](../person-profile-devesh-motta.html) → `/people/devesh-motta`
  - [`person-profile-hiten-motta.html`](../person-profile-hiten-motta.html) → `/people/hiten-motta`
  - [`person-profile-darshini-mahadevia.html`](../person-profile-darshini-mahadevia.html) → `/people/darshini-mahadevia`

**Catalog entry:** [design-system.html](../_dev/reference/design-system.html)
**Siblings:** [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md) · [`VOICES-HANDOFF.md`](VOICES-HANDOFF.md) · [`DESIGN-PILLAR-HANDOFF.md`](DESIGN-PILLAR-HANDOFF.md)

---

## 0. TL;DR for the busy dev

1. **Two templates, shared chassis.** `brand-profile-*.html` and
   `person-profile-*.html` share a lot of DOM patterns (`.bpr-topbar`,
   `.bpr-hero`, `.bpr-sec`, `.bpr-carousel`) with different content models.
2. **Pattern B mobile hero on the newer tenants.** Teearch + Avirahi use a
   card-lift mobile pattern (full-width image band at top → white rounded
   card lifts up over the photo bottom → content sits on the card). Older
   4 tenants (godrej / obeetee / saint-gobain / asian-paints) still ship
   the classic mobile hero. See §3.
3. **Content attribution is a hard rule.** Brand-attributed content on
   brand pages; person-attributed content on person pages. **No
   cross-contamination.** Voices are person-attributed by definition and
   never belong on a brand page unless the voice is *about* the brand.
   See §5. This rule surfaced substantial template pollution during
   development; §5b lists what was cleaned and what's still to check.
4. **The socials cluster inverts context.** Desktop = 36px icon-only
   glass pills with tooltip on hover. Mobile = full-width stacked rows
   with visible URL/username (linktr.ee shape). Tooltip uses the
   portal-canonical `.tip` chassis from `styles.css`. See §4.
5. **Notable Projects, not Selected Work.** Person profile Work sections
   are a short 4-item teaser + link out to the practice page, not a full
   portfolio. This stops the person profile competing with the brand
   profile for the same project list. See §6.
6. **Contact CTA in the topbar is brand-filled from paint** (not on
   scroll-flip). Contact panel is a warm-cream light panel by default;
   `.bpr-contact--dark` is an opt-in variant for tenants that want the
   moody treatment.

---

## 1. URL scheme

| URL | Renders | Notes |
|---|---|---|
| `/brands/{slug}` | `brand-profile-{slug}.html` | Per-tenant fully-rendered page. Backend can swap to a data-driven template when ready. |
| `/people/{slug}` | `person-profile-{slug}.html` | Same pattern per-tenant. |
| `/brands/{slug}#voices` | Anchor inside brand page | Discouraged for new tenants — voices belong on person pages. §5. |
| `/brands/{slug}#work` | Anchor inside brand page | Full project portfolio. Person page Notable Projects links here. |
| `/brands/{slug}#contact` | Anchor to contact panel | Sticky mobile bar retreats when in view. |
| `/people/{slug}#work` | Anchor inside person page | Notable Projects teaser. |
| `/people/{slug}#published` | Anchor to "On Ghar.tv" | Person-attributed content (interviews, op-eds, appearances). |

---

## 2. Shared chassis

Both templates ship the same top-level chrome:

```
<main class="bpr-page" data-brand-slug="…" data-brand-name="…"
      style="--brand:#…; --brand-soft:#…;">
  <div class="bpr-topbar">…</div>        ← fixed 84px→56px on scroll
  <section class="bpr-hero">…</section>  ← full-screen; Pattern B on mobile for teearch+avirahi
  <div class="bpr-topbar__subnav">…</div> ← slides in past-hero (desktop)
  <div class="pp-band">                   ← person profile only
    <div class="pp-wrap">
      <section class="pp-sec" id="work">…</section>
      <section class="pp-sec" id="published">…</section>
    </div>
  </div>
  <section class="bpr-sec" id="…">…</section>  ← brand-profile sections
  <section class="bpr-contact" id="contact">…</section>
  <div class="bpr-microft">…</div>       ← single-line Ghar.tv credit, not portal footer
  <div class="bpr-sticky-contact">…</div> ← mobile bottom bar
</main>
```

**Key CSS variables** the backend must set on `<main>`:
- `--brand` — tenant's identity hex (e.g. `#c67e35` for teearch)
- `--brand-soft` — light warm variant, used for panels + accents

Every downstream rule that colours accents, backgrounds, or hover states
reads these two variables. Never hardcode brand hex in tenant pages.

---

## 3. Hero patterns

### 3.1 Classic hero (godrej / obeetee / saint-gobain / asian-paints)

Full-bleed hero image + dark scrim + white text layered on top:

```
<section class="bpr-hero">
  <div class="bpr-hero__bg"><img src="…" /></div>
  <div class="bpr-hero__scrim"></div>
  <div class="bpr-hero__inner">
    <div class="bpr-hero__logo">…</div>
    <span class="bpr-badge">Featured</span>
    <span class="bpr-hero__eyebrow">Real Estate · Developer</span>
    <h1 class="bpr-hero__name">…</h1>
    <p class="bpr-hero__tagline">…</p>
    …
  </div>
</section>
```

Mobile keeps the same layout — image + scrim + white text — just resized.

### 3.2 Pattern B mobile hero (teearch + avirahi)

Below 768px: `bpr-hero--split` class enables a card-lift pattern:

- Full-width image (or ambient graphic) band at top, 4:3 aspect
- Content moves into a `bpr-hero__inner` white rounded card that
  `margin-top: -28px` lifts up over the image bottom
- Logo tile straddles the seam via `position: absolute; top: 0;
  left: 50%; transform: translate(-50%, -50%)`
- Glass Back + Share pills float over the image, fade out on
  `data-past-image` (JS flag on `<body>`)
- Bottom sticky bar picks up Back + Share once past-image

**Data-past-image trigger:** `body[data-past-image]` fires when the hero
image bottom leaves the viewport (roughly `<20px` from top).
Implemented in each file's trailing `<script>` (IntersectionObserver on
`.bpr-hero__bg img` or `.bpr-hero__ambient`).

### 3.3 Pattern B rollout status

- **DONE:** teearch (SVG ambient graphic), avirahi (photo)
- **PENDING:** godrej-properties, obeetee, saint-gobain, asian-paints

Each of the pending 4 needs the same treatment: `.bpr-hero--split` mobile
CSS block, `.bpr-hero__overlay` HTML, `data-past-image` JS, sticky bar
HTML. Estimate: 30–60 min per file done carefully.

---

## 4. Socials cluster

Located inside `.bpr-hero__meta-row` on brand pages (next to
`.bpr-hero__facts`), and inside `.pp-actions .pp-reach` on person pages.

### 4.1 Desktop behaviour

Icon-only 36px circular pills. **No hover-expand animation.** On hover
the label (already in DOM) becomes an absolutely-positioned dark chip
above the pill with a downward-pointing arrow. Person profiles use the
portal-canonical `.tip` + `.tip__anchor` + `.tip__bubble` system from
`styles.css`; brand profiles have an inline equivalent (should be
migrated to `.tip` chassis in a future consolidation pass).

Person profile markup:
```html
<div class="pp-reach__wrap tip">
  <a class="pp-reach__link pp-reach__link--web tip__anchor"
     href="https://…"
     aria-label="teearch.in"
     aria-describedby="tip-tarun-motta-web">
    <span class="pp-reach__icon"><svg>…</svg></span>
  </a>
  <span class="tip__bubble" role="tooltip" id="tip-tarun-motta-web">teearch.in</span>
</div>
```

### 4.2 Mobile behaviour (< 768px)

Full-width stacked rows (linktr.ee shape). Each row is 48px tall, icon
anchored left, label visible right after via `order: 1` on the label.

- **Brand profiles:** the `.bpr-hero__social-label` span is styled inline
- **Person profiles:** the label is rendered via CSS
  `content: attr(aria-label)` on `.pp-reach__link::after`, so no HTML
  change is needed to expose the label on mobile. Tooltip bubble hides
  on mobile via `.pp-reach__wrap .tip__bubble { display: none }`.

### 4.3 Colour context

- **Classic mobile hero (godrej etc.):** pill on dark hero → white glass
  base + white text. Reads on dark image.
- **Pattern B mobile hero (avirahi):** pill on white card → subtle
  warm-grey bg + ink text. `background: rgba(26,23,20,.04); color: var(--ink)`.
- **Teearch mobile (Pattern B with warm ambient):** pill uses
  espresso ink text on warm-white base.

The programmer needs to be aware that the pill's resting colour depends
on whether it sits on a dark image or a light card.

---

## 5. Content attribution rules (LOAD-BEARING)

**This is the single most important rule to enforce in backend logic.**

### 5.1 The rule

- Content **about a brand** (brand press releases, brand-sponsored
  articles, features about the brand's projects, research reports
  naming the brand) → shows on the **brand profile**.
- Content **by or about a person** (interviews with them, their
  op-eds, GharTalks episodes they appear on, articles quoting them,
  research pieces they're cited in) → shows on the **person profile**.
- **Do not cross-contaminate.** A "Presented by TEEARCH" article on
  Tarun Motta's page is a bug. Anuj Puri (ANAROCK Chairman) quotes on
  Avirahi's Voices row is a bug (different company entirely).
- **Exception:** a voice *about* the brand as a subject (e.g. an
  analyst note specifically naming Avirahi) can appear on the brand
  page's Voices row. But a founder's own quote is still
  person-attributed and belongs on the founder's person page — not
  the brand page — even though the person IS the brand.

### 5.2 Why this matters

Cross-contamination dilutes both pages:
- Person profiles become "shows brand's press releases" (loses
  individual identity)
- Brand profiles become "shows everyone's articles" (loses the brand
  as a focused subject)

### 5.3 What was cleaned up in this pass

- **Tarun / Devesh / Hiten Motta profiles:** the "On Ghar.tv" section
  had 4 TEEARCH-brand-attributed cards ("Presented by TEEARCH" /
  "Ghar.tv Research with TEEARCH"). All 4 confirmed to exist on
  `/brands/teearch#voices`. Removed from person profiles, replaced
  with an empty-state note pointing to the brand page.
- **Darshini Mahadevia:** kept as-is. Her content was already legit
  person-attributed (an op-ed BY her, a research piece she's CITED IN).
- **Tarun Motta profile "On Ghar.tv":** re-populated with 2 sample
  `.vx-card` entries using the Voices chassis. Content paraphrased
  from Tarun's on-page biography (not fabricated quotes). Flagged in
  HTML comment as sample content pending real Ghar.tv publications.
- **Avirahi Voices section:** removed entirely (`#voices` sub-nav pill
  removed, `<section id="voices">` block removed). The four rows there
  (Voices with team-member quotes, Editorial with Godrej project
  features, Intelligence with generic reports, Events with generic
  mentions, Heard-on-Ghar.tv with Godrej-referencing quote rationales)
  were all template pollution from the Godrej precedent this file was
  cloned from.
- **Avirahi legacy Work section:** the hidden `<section id="work" hidden>`
  contained 8 Godrej project cards as content. Deleted — it was
  landmine content that would surface if any backend fallback ever
  used it.
- **Avirahi Team section comment:** was "Team = real Godrej Properties
  leadership only" (stale template comment). The actual cards had been
  swapped to real Avirahi partners; comment was updated to match.

### 5.4 What's still to check

The three older brand tenants (Obeetee, Saint-Gobain, Asian Paints)
appear clean of cross-brand template pollution (each had only 1
reference to Godrej/Avirahi/Teearch, all likely legitimate). Not
audited in depth — a full attribution pass on each tenant would be
prudent before hard launch.

---

## 6. Notable Projects section (person profiles)

Instead of a full project portfolio duplicated across every person's
profile page, each person shows a short teaser + link out.

Person profile Work section markup:
```html
<section class="pp-sec" id="work" aria-labelledby="work-h">
  <div class="pp-sec__head pp-rise">
    <h2 class="pp-sec__title">Notable projects</h2>
    <p class="pp-sec__note">Delivered with TEEARCH. See the full portfolio on <a href="/brands/teearch">TEEARCH</a>.</p>
  </div>
  <div class="pp-idx pp-idx--bare">
    <ul class="pp-idx__list">
      <li><div class="pp-idx__row">
        <span class="pp-idx__n">01</span>
        <span class="pp-idx__t">…project title…</span>
        <span class="pp-idx__m"><span>…city…</span></span>
      </div></li>
      …
    </ul>
  </div>
  <a class="pp-work__more" href="/brands/teearch#work">
    See TEEARCH's full portfolio <svg>…</svg>
  </a>
</section>
```

Key details:
- `.pp-idx--bare` disables the desktop hover-preview split column.
  Person profiles show a plain numbered list, not the interactive
  index brand pages have.
- `.pp-work__more` is a subtle text-link with arrow slide on hover.
- Framing note in `.pp-sec__note` uses inline brand link (styled via
  `.pp-sec__note a`) — the brand name is linked, the phrase "the
  practice page" was rejected as insufficiently plain for Indian users.

---

## 7. Voices cards (`.vx-*` chassis)

Used on person profiles for the "On Ghar.tv" section. Ported from the
Industry Voices vertical (`voices-article.html`) so a Ghar.tv reader
recognises the format.

Card markup:
```html
<a href="/voices/{slug}" class="vx-card">
  <span class="vx-card__eyebrow">Developer Dialogues</span>
  <p class="vx-card__claim">Quote goes here.</p>
  <span class="vx-speaker">
    <span class="vx-speaker__face">
      <img src="/brand_assets/people/…" alt="" />
    </span>
    <span class="vx-speaker__id">
      <span class="vx-speaker__name">Person Name</span>
      <span class="vx-speaker__role">Role, Firm</span>
    </span>
  </span>
  <p class="vx-card__meta">
    <span class="vx-card__format">Interview</span> · 12 min read
  </p>
</a>
```

Person profile wrapper (`.pp-voices`): simple 2-col grid on desktop,
single column on mobile — NOT the rail/paginator setup brand profiles
use. A person profile typically accumulates 1–4 voice cards; a full
rail with pagination would be overkill.

Brand profile wrapper (`.bpr-voices__rail`): full rail with paginator +
"All voices" CTA. Currently unused (Avirahi's Voices row was removed
per §5); the CSS chassis stays inline for potential re-use.

---

## 8. Contact panel

### 8.1 Light default (teearch + avirahi)

Warm-cream panel with dark text, brand-accent bar under the section
title, portal-canonical `.jm-*` form fields.

```html
<section class="bpr-contact" id="contact">
  <div class="bpr-contact__inner">
    <div>
      <h2 class="bpr-contact__title">Contact</h2>
      <p class="bpr-contact__lead">…</p>
      <div class="bpr-contact__meta">
        <div class="bpr-contact__meta-row">
          <svg>…</svg>address / phone / email
        </div>
      </div>
    </div>
    <form class="bpr-contact__form" data-bpr-contact-form novalidate>
      <input class="jm-field" …>
      <div class="jm-phone">…</div>
      <textarea class="jm-field" …></textarea>
      <button type="submit" class="jm-btn jm-btn--primary">Send enquiry</button>
    </form>
  </div>
</section>
```

Panel background: `color-mix(in oklab, var(--brand-soft) 55%, #faf7f2 45%)`
— warm-cream that inherits the tenant palette. Primary CTA is solid
brand ink for maximum contrast.

### 8.2 Dark opt-in (`.bpr-contact--dark`)

Any tenant that wants the moody dark treatment adds `.bpr-contact--dark`
on the section. All the dark-panel styling (white-alpha field colours,
autofill palette swap, etc.) is gated behind that class.

### 8.3 Older 4 tenants (godrej / obeetee / saint-gobain / asian-paints)

Currently ship dark `.bpr-contact` panels with the older bespoke
`.bpr-form` field chassis (NOT `.bpr-contact__form` + `.jm-*`).
Migrating them to the light `.bpr-contact` + `.jm-*` pattern is a
larger refactor: both color inversion AND form-chassis swap. Pending.

### 8.4 Body padding + sticky bar

Mobile ships a fixed bottom Contact bar (`.bpr-sticky-contact`).
`<body>` reserves `padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px))`
for it. When the reader scrolls INTO the contact section, an
IntersectionObserver adds `data-contact-in-view` on `<body>`; the
sticky bar retreats and body padding is zeroed:

```css
body[data-contact-in-view] { padding-bottom: 0; }
body[data-contact-in-view] .bpr-sticky-contact { transform: translateY(100%); }
```

---

## 9. Topbar CTA

Contact button in the topbar reads brand-filled from paint — NOT a
glass chip that flips to brand fill on scroll. One hover state
(darken via `color-mix(...84%, #000)`). Applies to teearch + avirahi
(the two tenants with the newer topbar chassis).

---

## 10. Closer section (person profiles)

Warm-cream panel with a small brand accent bar under the Gazpacho title.
Primary "Get in touch" button + subtle "See more people" text-link
demoted below (not a second button — the demotion is intentional so the
title/primary read as the CTA and the exit link stays visible but
quiet).

Markup:
```html
<section class="pp-closer pp-rise">
  <h2 class="pp-closer__title">Work with {Person Name}</h2>
  <p class="pp-closer__lead">…</p>
  <div class="pp-actions">
    <button type="button" class="pp-btn pp-btn--primary"
            data-brand-contact data-brand="{Person Name}">
      Get in touch <svg>…</svg>
    </button>
    <a class="pp-btn pp-closer__more" href="/people">
      See more people <svg>…</svg>
    </a>
  </div>
</section>
```

Primary CTA shows on mobile too (no `display: none` on mobile any
more) — the sticky Contact bar is chrome; the closer is a designed
punctuation moment with its own identity.

---

## 11. Facts + Figures bordered-grid (mobile only)

Metrics blocks on both templates render as a bordered card on mobile:
2-column grid with hairline dividers between cells. Last cell spans
both columns when its position is odd (3-item layouts) so the box
stays symmetric.

- Brand hero metrics: `.bpr-hero__metrics` on `.bpr-hero--split`
- Person hero figures: `.pp-figs` on person profiles

CSS uses `align-items: stretch` so every cell's border-left runs the
full row height (no half-way dividers).

```css
@media (max-width: 767px) {
  .pp-figs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    align-items: stretch;
    border: 1px solid rgba(26,23,20,.18);
    border-radius: 12px;
    overflow: hidden;
  }
  .pp-fig {
    padding: 14px 16px;
    border-top: 1px solid rgba(26,23,20,.18);
    border-left: 1px solid rgba(26,23,20,.18);
  }
  .pp-fig:nth-child(1), .pp-fig:nth-child(2) { border-top: 0; }
  .pp-fig:nth-child(odd) { border-left: 0; }
  .pp-fig:last-child:nth-child(odd) { grid-column: 1 / -1; }
  .pp-fig__l { display: block; line-height: 1.35; }
}
```

---

## 12. Open items for the next iteration

Ordered by impact:

1. **Attribution audit on the 3 older brand tenants** (Obeetee,
   Saint-Gobain, Asian Paints). Spot-checked as clean of cross-brand
   pollution; full pass would be prudent.
2. **Pattern B mobile hero port** to the 4 older tenants (godrej,
   obeetee, saint-gobain, asian-paints). §3.3.
3. **Contact panel migration** to the light `.bpr-contact` + `.jm-*`
   chassis on the same 4 tenants. §8.3.
4. **Socials tooltip migration to the shared `.tip` chassis** on brand
   profiles (they currently use an inline equivalent). §4.1.
5. **Placeholder social handles on person profiles** (Tarun / Devesh
   / Hiten currently show "Placeholder LinkedIn" and "Placeholder
   Instagram" on mobile because that's what's in the `aria-label`).
   Backend needs to supply real handles or the pills should be
   suppressed when data is missing.
6. **Team-member Voices on brand pages need person-profile homes.**
   Virendra Shah / Hardik Shah / Satish Bhansali (Avirahi partners)
   don't yet have Ghar.tv person profiles built. Once they do, their
   quotes migrate cleanly. §5.1.
7. **CSS consolidation pass.** A lot of the profile CSS is inline in
   each page's `<style>` (the many iterations of the design left
   duplicated blocks across tenants). Extracting shared patterns
   (`.vx-card`, `.pp-voices`, `.pp-published-empty`, `.pp-work__more`,
   socials tooltip system, closer treatment) into a shared stylesheet
   is a real refactor, best done after the templates stabilise.
8. **Scroll-reveal fallback.** The About section's paragraph reveals
   depend on IntersectionObserver firing. Real users see them fine;
   headless/screenshot capture doesn't trigger them. Consider a
   `@media (prefers-reduced-motion: reduce)` fallback that opts out
   of the animation entirely.

---

## 13. What NOT to touch

- **`.tip` chassis in `styles.css`.** Portal-shared tooltip system;
  don't fork it per template. Person profiles already reuse it.
- **`.jm-*` form field classes.** Portal-canonical; used across the
  shared brand contact modal (`partials/br-contact-modal.html`) and
  the inline contact panels. Byte-identical on purpose.
- **Sub-nav pill structure on brand pages.** Section anchors + tab
  active-state are wired into `.bpr-topbar__subnav` and controlled by
  `data-past-hero` + `data-nav-hidden` body flags. Don't restyle
  without understanding the flag interaction.
- **`.pp-hold` interactive index chassis.** Retained for person
  profiles that ship a full project index (currently none use it after
  the Notable Projects rework, but the JS at [`person-profile-tarun-motta.html:6052`](../person-profile-tarun-motta.html#L6052)
  is null-guarded so it silently skips if `data-pp-index` isn't
  present).

---

## 14. File-level notes

### Brand tenant pages
Each `brand-profile-{slug}.html` is a full standalone page with all CSS
inline in its `<style>`. This was deliberate during template iteration
(makes per-tenant styling easy). For the backend rewrite, extracting
shared CSS to a `dist/brand-profile.min.css` and keeping only tenant-
specific overrides inline is the natural next step.

### Person tenant pages
Same convention: all CSS inline. Same consolidation path.

### Shared partials
- [`partials/br-contact-modal.html`](../partials/br-contact-modal.html) — shared modal, `.jm-*` fields
- [`partials/nav.html`](../partials/nav.html) — not used on profile pages (topbar is inline)
- [`partials/footer.html`](../partials/footer.html) — used on person profiles + Ghar.tv content pages, NOT on brand profiles (brand profiles ship `.bpr-microft` micro-footer)

### JS wiring
Every profile page ships its own trailing `<script>` block for
page-specific behaviour (`data-past-image`, `data-scrolled`,
`data-past-hero`, `data-contact-in-view`, `data-nav-hidden`). Shared
carousel init is via `initCarousel()` from `ghar-carousel.js` (deferred
load, polled at page init).

---

**Last updated:** 2026-08-19
