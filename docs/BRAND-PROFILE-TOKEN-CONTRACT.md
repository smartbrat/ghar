# Brand-profile token contract

> **2026-09-16: brand COLOR moved to the palette registry.** Every brand
> profile and every person profile takes its colors from ONE place:
> [`scripts/brand-palettes.mjs`](../scripts/brand-palettes.mjs). A page opts
> in with `<body data-palette="<slug>">` and links `/dist/brand-theme.css`
> LAST in `<head>`. Person pages get their parent brand's slug from the
> generator, or `ghar` (neutral) when unlinked. Pages carry NO inline color
> tokens (`--brand*`, `--contact-*` colors) on `:root` or `<main style>`.
>
> **Roles** (per brand, each hex sampled from the logo or the brand's own site,
> evidence in `src`): `primary` [bg, text] buttons + topbar/sticky CTA;
> `hover` [bg, text]; `text` accent text on the ground (4.5:1); `ink` contact
> card + dark bands; `cta` / `ctaHover` [bg, text] the contact button on the
> ink card, either primary + white (primary clears 3:1 on ink) or cream
> `#f5f2ec` + ink text, build-gated; `alt` large stat numbers; `canvas` image
> placeholders; `soft` share/menu chip grounds, avatar tiles; `theme: 'dark'`
> for dark tenants, which also makes every person page of that brand dark
> (the generator reads it; see AUTO-GENERATION-CONTRACT.md §2 "Person pages
> of a dark brand").
>
> **Tokens emitted** on `body[data-palette]`: `--brand --brand-on --brand-hover
> --brand-hover-on --brand-text --brand-stat --brand-ink --brand-cta --brand-cta-on
> --brand-cta-hover --brand-cta-hover-on --brand-alt --brand-canvas --brand-soft`,
> plus derived `--brand-line`, all `--contact-*` colors and `--gt-bar-bg`.
>
> **Surface mapping** lives in [`scripts/brand-theme.roles.css`](../scripts/brand-theme.roles.css)
> inside `@layer brand-theme` (a layered `!important` beats every older
> unlayered one): primary buttons, share/menu chips (white glass with a brand
> icon once scrolled or with no photo hero; chassis glass over a photo hero and
> on dark tenants; hover = primary), the contact card (ink + a glow in the brand's
> own hue, cta button, card-ink icons), image placeholder grounds.
>
> **Native palettes** (`native: true`: Studio FOV, TEEARCH, Horizon Architects,
> Obeetee) keep the look their own chassis paints from the tokens; the forced
> button, contact-card and placeholder rules skip them (`body[data-palette-forced]`
> in roles.css is expanded by the build). Optional `contact`, `person`, `tokens`
> maps and `noInk` carry their original values. Contrast misses on native
> records warn instead of failing.
>
> **Navbars are neutral glass** (user, 2026-09-16): `--gt-bar-bg` white .82,
> `--gt-bar-bg-dark` near-black .82, `--gt-bar-glow` rgba(0,0,0,.08). No brand
> tint in the bar fill or its shadow, and no colored button shadows.
>
> **Build:** `npm run build:palettes` (also part of `npm run build`) fails,
> writing nothing, if any pair misses WCAG. New tenant: add a record, build,
> stamp the slug. Change a color in the registry only, never in a page.
> Deliberately NOT themed: microfooter G-mark, Featured badge, intel-card
> glyphs, share-sheet social tiles, jm-* forms and modals.
>
> The sections below still describe the chassis slots; the "Tenant `:root`
> template" is superseded for color tokens.

> Every color, background, and stateful visual on the brand-profile
> chassis is driven by a CSS custom property. The **shape** lives in
> `dist/brand-profile.min.css`; the **look** lives in each tenant's
> `:root` block. Auto-generation writes each tenant's `:root` from
> brand data; the shared CSS never changes per tenant.
>
> This doc is authoritative. Any new component added to the chassis
> declares its tokens here first, THEN gets built into dist.

---

## Contract

Every entry below is a slot on the shared chassis. The **default** column
is what dist supplies when the tenant does NOT override — it is chosen so
an ungenerated tenant renders a considered light-brand-tinted card, not a
default white block.

### Global brand tokens (foundation)

| Token          | Type   | Default (dist)                        | Notes                              |
|----------------|--------|---------------------------------------|------------------------------------|
| `--brand`      | color  | `#d5613a` (terracotta)                | Primary brand accent               |
| `--brand-soft` | color  | `#f5e4cf` (warm cream)                | Soft brand tint for backgrounds    |
| `--brand-ink`  | color  | computed from `--brand` at ~30% dark  | Drafting ink for SVG line-art      |
| `--ink`        | color  | `#111111`                             | Body text                          |
| `--ink2`       | color  | `#374151`                             | Secondary text                     |
| `--muted`      | color  | `#6e655b`                             | Muted text                         |
| `--rule`       | color  | `#e5dcc8`                             | Hairline dividers                  |

Every tenant MUST supply `--brand` and `--brand-soft`. All other tokens
default to portal-canonical values.

---

### Contact card (`.bpr-contact*`)

| Token                     | Purpose                          | Light default                                       | Dark example (Godrej)         |
|---------------------------|----------------------------------|-----------------------------------------------------|-------------------------------|
| `--contact-surface`       | Card background                  | `color-mix(oklab, brand-soft 82%, warm-white 18%)`  | `#12181f`                     |
| `--contact-ink`           | Title + primary text             | `var(--ink)`                                        | `#f5f2ec`                     |
| `--contact-ink-muted`     | Lead, meta rows                  | `var(--muted)`                                      | `rgba(245,242,236,.72)`       |
| `--contact-eyebrow-color` | Small caps eyebrow               | `var(--muted)`                                      | `rgba(245,242,236,.7)`        |
| `--contact-border`        | Card outer border                | `var(--rule)`                                       | `rgba(255,255,255,.06)`       |
| `--contact-divider`       | Hairlines inside card            | `var(--rule)`                                       | `rgba(255,255,255,.10)`       |
| `--contact-panel-bg`      | Right CTA panel background       | `color-mix(brand 6%, transparent)`                  | `rgba(255,255,255,.035)`      |
| `--contact-panel-border`  | Right CTA panel border           | `var(--contact-divider)`                            | `rgba(255,255,255,.07)`       |
| `--contact-cta-bg`        | CTA button background            | `var(--brand)`                                      | `#f5f2ec`                     |
| `--contact-cta-fg`        | CTA button text                  | `#ffffff`                                           | `#12181f`                     |
| `--contact-cta-hover-bg`  | CTA hover background             | `color-mix(cta-bg 86%, #000)`                       | `#ffffff`                     |
| `--contact-glow-alpha`    | Radial glow opacity (0-1)        | `.38`                                               | `.35`                         |
| `--contact-accent`        | Accent bar, icons, glow, links   | auto: `color-mix(brand 60%, ink 40%)`               | auto — same formula           |

**Design rule — no colored edge stripes on cards.** Earlier v7 shipped a
solid brand-colour vertical stripe on the card's left edge as an
identity marker. Removed 2026-09-02 per the design system rule against
top / side accent strips on cards (see memory `feedback_no_top_accent_strip`
— the rule extends to any side). Brand identity now shows up only in the
CTA button + its glow shadow, plus the accent bar above the title if a
tenant re-enables it via tokens. If a card needs stronger identity, use
warmer text hierarchy, a more prominent Gazpacho title, or a
brand-tinted CTA glow — never a decorative edge stripe.

**Why `--contact-accent` is auto-computed and not just `var(--brand)`:** Tenants
have brand colors across the full luminance range — Godrej's navy `#003B71` on
a dark card would render as navy-on-navy (invisible); Horizon's bright orange
`#F98619` on a light card is fine but reads unrefined. Mixing brand with the
card's own INK color auto-adapts: on dark cards (ink = warm cream) the accent
LIFTS toward light; on light cards (ink = near-black) the accent DEEPENS. Same
formula, always readable, no per-tenant contrast tuning. A tenant that wants
a specific accent color can still set `--contact-accent` explicitly to override.

**Rule**: a tenant that opts into DARK mode overrides ALL of the above.
A tenant that keeps LIGHT mode overrides none (defaults hit) or a subset
(e.g. warmer `--contact-surface` for a specific hue).

---

### Intelligence card (`.bpr-intel-card`)

Uses global tokens only. Canvas rotates via `nth-child(4n+N)` using canonical
Ghar.tv Theme palette hues (Turmeric / Sage / Terracotta / Indigo), not
`--brand` — Intelligence is platform content, brand-agnostic.

| Token                    | Purpose                          | Default                          |
|--------------------------|----------------------------------|----------------------------------|
| `--titlecard-meta-color` | Footer meta row color            | `var(--muted)`                   |
| `--titlecard-divider`    | Divider above footer row         | `color-mix(ink 12%, transparent)`|

---

### Hero (`.bpr-hero*`)

Landed tokens (2026-09-02 pass):

| Token             | Purpose                                   | Default (dist) |
|-------------------|-------------------------------------------|----------------|
| `--hero-surface`  | Hero background when image is absent      | `#1a1714`      |
| `--hero-ink`      | Primary text on hero                       | `#fff`         |
| `--hero-tooltip-bg` | Share-label tooltip background + arrow  | `#1a1410`      |
| `--hero-tooltip-fg` | Share-label tooltip text                | `#fff`         |

Still tenant-inline (per-tenant divergence hasn't yet been squeezed
into a single canonical rule for these):

| Slot (planned)         | Purpose                          |
|------------------------|----------------------------------|
| `--hero-ink-muted`     | Facts row, meta row              |
| `--hero-divider`       | Meta row top-border              |
| `--hero-logo-tile-bg`  | Logo tile background             |

Run `node _dev/tools/audit-token-coverage.mjs` to see what remains
hardcoded.

### Card media placeholder

| Token                   | Purpose                              | Default (dist) |
|-------------------------|--------------------------------------|----------------|
| `--media-placeholder`   | Image-container fill before load     | `#f0ebe0`      |

Used by `.bpr-person__media`, `.bpr-work__media`, `.bpr-mcard__media`
and `.bpr-mcard--titlecard`. A tenant that ships all images with
warm-cream fallback keeps the default; a tenant that wants a cooler
placeholder sets it once and every image container follows.

---

## Tenant `:root` template

> **Superseded for colors (2026-09-16).** Do not set `--brand`, `--brand-soft`,
> `--brand-ink` or `--contact-*` colors here. Add a palette record instead
> (see top of this doc). Layout tokens (`--contact-panel-radius`, padding,
> fonts) may still be set per tenant.

Every new tenant :root MUST supply `--brand` + `--brand-soft`. Optionally
opts into dark-mode contact card by supplying the `--contact-*` block below.

```css
:root {
  /* Foundation portal tokens -- copy verbatim from any existing tenant */
  --warm-white: #faf7f2;
  --bg: #ffffff;
  --ink: #111111;
  --ink2: #374151;
  --muted: #6e655b;
  --faint: #6e655b;
  --rule: #e8e8e8;
  --accent: #ee324b;
  --max-w: clamp(1280px, 75vw, 1840px);
  --pad-h: clamp(24px, 3vw, 64px);
  --pad-v: clamp(80px, 9vw, 120px);
  --r: 20px;
  --rs: 12px;

  /* Brand identity -- REQUIRED per tenant */
  --brand: #YOURBRANDHEX;
  --brand-soft: #YOURBRANDSOFTHEX;

  /* Contact card: dark opt-in (OPTIONAL). Delete this block for light
     default (which uses brand-soft as the card background). */
  --contact-surface       : #1a1815;
  --contact-ink           : #f5f2ec;
  --contact-ink-muted     : rgba(245,242,236,.72);
  --contact-eyebrow-color : rgba(245,242,236,.7);
  --contact-border        : rgba(255,255,255,.06);
  --contact-divider       : rgba(255,255,255,.10);
  --contact-panel-bg      : rgba(255,255,255,.035);
  --contact-panel-border  : rgba(255,255,255,.07);
  --contact-cta-bg        : #f5f2ec;
  --contact-cta-fg        : #1a1815;
  --contact-cta-hover-bg  : #ffffff;
  --contact-glow-alpha    : .35;
}
```

---

## Audit tools

- `node _dev/tools/audit-chassis-drift.mjs` — find divergent inline CSS,
  orphan classes, dist/inline duplicates. Run before every commit.
- `node _dev/tools/audit-token-coverage.mjs` — find hardcoded colors in
  dist rules that should be tokens; find orphan var() references.
- `node _dev/tools/audit-visual-proof.mjs` — find empty [hidden] section
  scaffolds (templates must show visual proof for demo/client).
- `/tenant-matrix` (served from `_dev/reference/tenant-matrix.html`) —
  side-by-side render of every tenant × breakpoint × section. Restart
  `serve.mjs` after adding new tenants for the auto-mapper to pick up.

---

## How to add a new component to the chassis

1. Add its tokens to this doc (Contract section above).
2. Extract byte-canonical CSS from the canonical reference tenant
   (typically Horizon for architect-family; Teearch for service-family;
   Godrej for developer-family). If TWO tenants have the same class
   with different bodies, the audit script flags it and you pick
   the canonical variant BEFORE moving to dist.
3. Add the CSS to `dist/brand-profile.min.css` using `var(--slot, fallback)`
   for every color / background / border / spacing decision.
4. Populate the sensible defaults (light-brand-tinted for the visible
   default; dark or bespoke for opt-in tenants).
5. Run all three audits — expect zero orphans + zero drift after the
   port.
