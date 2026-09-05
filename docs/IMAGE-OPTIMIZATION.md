# Image Optimization

**Audience:** Programmer / DevOps, plus the AI (Claude) generation pipeline
that builds new brand and people templates.
**Owner:** Ghar.tv frontend.
**Status:** Live in production as of 2026-09-05.

The portal has two layers of image performance work. Level 1 ships in every
page and needs no per-image action. Level 2 needs the `convert-images.mjs`
tool below to run once per new asset drop and the `<picture>` markup
pattern to be used in templates.

---

## Level 1 · Graceful load, portal-wide (already live)

Every `<img>` on the portal starts blurred, slightly zoomed, and
transparent. When the browser fires `load`, the image cross-fades to sharp
over ~500 ms. Above-the-fold frames (`.bpr-hero__bg`, `.pp-portrait-wrap`,
`.hp-card-img`) paint a warm skeleton shimmer behind the image so the
frame is never blank on slow connections.

**How it's wired**
- CSS block "IMAGE GRACEFUL LOAD" in [`styles.css`](../styles.css) →
  compiled into [`dist/styles.min.css`](../dist/styles.min.css) by
  `npm run build:styles`.
- JS block in [`main.js`](../main.js) (loaded by every non-profile page)
  AND prepended to [`dist/bpr-reveal.js`](../dist/bpr-reveal.js) (loaded
  by brand-profile + person-profile pages). Sentinel `js-imgfx-init` on
  `<html>` prevents double-run when both scripts happen to load.
- Reduced-motion users get an instant swap, no blur / zoom.
- If JS fails to run, the CSS never activates (gated on `html.js-imgfx`)
  so no image is ever left permanently invisible.

**Opt out per image** (icons, logo sprites, inline SVG masks):
```html
<img src="…" class="no-imgfx" alt="…">
```

**Nothing else to do** — every image added anywhere on the portal
picks this up automatically.

---

## Level 2 · Responsive modern formats

Source PNG / JPG assets stay in `brand_assets/` and elsewhere as the master
originals. The build tool below generates three widths × two modern
formats (WebP + AVIF) beside each source. Templates then wrap the `<img>`
in a `<picture>` block so the browser picks the best-supported, smallest
variant that fits the viewport.

### 2.1 · Install (one-time on server)

```bash
npm install --save-dev sharp
```

### 2.2 · Run the converter

```bash
# whole brand_assets/ tree (default)
node _dev/tools/convert-images.mjs

# one subtree
node _dev/tools/convert-images.mjs brand_assets/brand-photos

# multiple
node _dev/tools/convert-images.mjs brand_assets people-photos
```

**Behaviour**
- Walks the target directories recursively, picking up every `.png`,
  `.jpg`, `.jpeg`. Skips `node_modules`, `.git`, `dist`, `_dev`.
- For each source emits `<stem>-640.webp`, `<stem>-1280.webp`,
  `<stem>-2560.webp`, and the matching `.avif` files, in the same folder.
- **Never upscales.** If the source is narrower than a target width, that
  width is skipped.
- Skips any variant whose output file is already newer than the source
  (mtime check) — safe to re-run any time.
- Prints per-file before / after byte counts and a summary at the end.

Example: on a 1.4 MB PNG hero, this typically ships a 60-90 KB 1280-wide
WebP and a 40-70 KB 1280-wide AVIF that the browser will pull instead.

### 2.3 · The `<picture>` wrapper (template rule)

Whenever a new brand or people template writes a `<picture>` for a hero,
portrait, project card, or other heavy grid image, use this shape:

```html
<picture>
  <source type="image/avif"
          srcset="/brand_assets/brand-photos/horizon-architects-hero-640.avif 640w,
                  /brand_assets/brand-photos/horizon-architects-hero-1280.avif 1280w,
                  /brand_assets/brand-photos/horizon-architects-hero-2560.avif 2560w"
          sizes="(min-width: 1280px) 1280px, 100vw">
  <source type="image/webp"
          srcset="/brand_assets/brand-photos/horizon-architects-hero-640.webp 640w,
                  /brand_assets/brand-photos/horizon-architects-hero-1280.webp 1280w,
                  /brand_assets/brand-photos/horizon-architects-hero-2560.webp 2560w"
          sizes="(min-width: 1280px) 1280px, 100vw">
  <img src="/brand_assets/brand-photos/horizon-architects-hero.png"
       alt="Horizon Architects studio"
       loading="eager"
       fetchpriority="high"
       decoding="async"
       width="2560" height="1440">
</picture>
```

**Rules of thumb for `sizes`**
- Hero (full-width until max-w): `sizes="(min-width: 1600px) 1600px, 100vw"`.
- Portrait card (~360px column): `sizes="(min-width: 900px) 360px, 100vw"`.
- Card grid image (~400px column): `sizes="(min-width: 900px) 400px, 100vw"`.

**Attributes on the `<img>` inside `<picture>`**
- `loading="eager"` + `fetchpriority="high"` — ATF (hero, portrait).
- `loading="lazy"` (default `fetchpriority`) — below the fold.
- `decoding="async"` — always.
- `width` and `height` — always, so the frame reserves layout space and
  CLS stays zero.
- No `class="no-imgfx"` — the graceful fade is part of the ATF story.

### 2.4 · When to run the converter

- **After any brand asset drop** — before the tenant page ships.
- **After any people portrait drop** — before the person profile ships.
- **After any editorial asset drop** for a design pillar cover image.
- **CI / server:** wire a hook that runs `node _dev/tools/convert-images.mjs`
  on any commit that touches `brand_assets/`.

### 2.5 · Rule for the AI generation pipeline

When the AI template generator writes a new brand-profile or person-profile
page (or any page that includes new hero-scale imagery), it MUST:

1. Land the source PNG / JPG in the correct `brand_assets/` subfolder.
2. Invoke `node _dev/tools/convert-images.mjs <that subfolder>` so the
   WebP + AVIF variants exist alongside the source.
3. Author the `<img>` tag as a full `<picture>` block per §2.3, with
   `srcset` at 640 / 1280 / 2560, correct `sizes`, and `loading` +
   `fetchpriority` matching the position (ATF vs below).
4. Set explicit `width` and `height` on the `<img>` so CLS stays zero.
5. Never opt out of graceful load with `no-imgfx` for content imagery —
   only for decorative icons and SVG masks.

This rule holds for every new template the AI ships, whether brand,
person, design, voices, or event. Skipping any step degrades the mobile
experience the entire portal was built to protect.

---

## Level 3 · Blur-up LQIP for ATF hero + portrait

For hero (`.bpr-hero__bg`) and portrait (`.pp-portrait-wrap`) containers,
the graceful load can be upgraded from a warm skeleton shimmer to a real
"blur-up" preview: the actual image's colours and soft shapes painted
first (from a ~500-1000 B base64 LQIP inlined in the HTML), cross-fading
to the sharp source when it arrives. Same technique Medium and Facebook
use, and matches the CodePen references
(`codepen.io/mohan-aiyer/full/YdwMmQ`,
`codepen.io/mohan-aiyer/full/JwogdR`) the design brief cited.

### 3.1 · The manifest

`convert-images.mjs` now also emits, for every source it scans:
- a **dominant colour** (hex, straight RGB mean of a 24 px thumbnail),
- an **LQIP** (24 px wide WebP, quality 30, base64 data URI, typically
  500-1000 bytes).

Both land in `brand_assets/image-manifest.json` (or the equivalent at
whichever top-level directory was passed as the first target arg),
keyed by the repo-relative forward-slash path:

```json
{
  "brand_assets/brand-photos/horizon-architects-hero.png": {
    "dom":   "#858177",
    "lqip":  "data:image/webp;base64,UklGRsg…",
    "width": 2560,
    "height": 1440
  }
}
```

### 3.2 · The container markup

Add the class `imgfx-blurup` and two inline CSS custom properties:

```html
<div class="bpr-hero__bg imgfx-blurup"
     style="--dom:#858177;
            --lqip:url('data:image/webp;base64,UklGRsg…')">
  <img src="/brand_assets/brand-photos/horizon-architects-hero.png"
       alt="" loading="eager" fetchpriority="high"
       decoding="async" width="2560" height="1440">
</div>
```

Exactly the same wrapper works for portrait frames
(`<div class="pp-portrait-wrap imgfx-blurup" …>`). The `.imgfx-blurup`
CSS in `styles.css` handles the rest: solid dominant ground, blurred
LQIP behind the image, cross-fade out when the real `<img>` reports
`is-loaded`. Reduced-motion users get an instant swap.

### 3.3 · Rule for the AI generation pipeline

When writing a new brand-profile or person-profile template, the AI
MUST:

1. Read `brand_assets/image-manifest.json` (run `convert-images.mjs`
   first if it is missing or the source was just dropped).
2. For every hero and portrait image on the page, look up the manifest
   entry and inline `--dom` + `--lqip` onto the container plus the
   `imgfx-blurup` class.
3. Leave below-fold grid images (cards, spotlight rails, project
   thumbnails) without blur-up; the shared skeleton shimmer + fade
   from Level 1 is sufficient there, and inlining ~1 KB per card
   would balloon the HTML.

### 3.4 · When to use blur-up vs skeleton shimmer

| Position                                 | Treatment          |
|------------------------------------------|--------------------|
| Hero (`.bpr-hero__bg`)                   | blur-up (LQIP)     |
| Portrait (`.pp-portrait-wrap`)           | blur-up (LQIP)     |
| Card grid image (`.hp-card-img` etc.)    | skeleton shimmer   |
| Editorial article body inline images     | skeleton shimmer   |
| Below-fold spotlight / project thumbs    | skeleton shimmer   |

---

## Level 4 · Future (not shipped)

- **BlurHash / ThumbHash string** — encode a 30-char hash instead of a
  ~1 KB base64 image. Smaller HTML, needs a ~3 KB decoder script per
  page. Consider only if HTML weight becomes a concern.
- **AVIF-only for AVIF-capable browsers** — drop WebP for browsers that
  advertise `image/avif` in `Accept:`. Requires a Vercel edge middleware
  and is a saving of ~10-20% on payload for a small share of traffic.

These are follow-up work, not on the current sprint.
