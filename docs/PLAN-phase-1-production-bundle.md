# PLAN — Phase 1: Production Bundle

> Biggest perceived perf win. Take the site from "dev-mode prototype" to "production-grade asset pipeline." Block of focused work, single PR.

## Why this matters

Today the site ships with:
- Tailwind injecting CSS at runtime via JS (~140 KB, render-blocking until parsed + applied)
- Inter fetched fresh from Google Fonts on every visit (~50 KB CSS + 4 font files)
- Brand asset PNGs at full source size (people portraits, brand logos — many 200–500 KB each)
- Unminified `styles.css` (140 KB), `styles4.css` (63 KB), `main.js` (large)
- 33 `<img>` tags with no explicit `width`/`height` attributes

Phase 1 fixes the asset pipeline so production users get small, cached, properly-sized assets on first paint.

## Effort

~3 hours, single session. Done as one PR with full visual regression test.

## Dependencies

- Node 20.14+ and npm 10+ (already installed on this machine)
- No new infrastructure — Vercel build step is enough

---

## Step 1 · Replace Tailwind CDN with built stylesheet

See [PLAN-tailwind-build.md](PLAN-tailwind-build.md) for the full plan. Summary of what to do:

```bash
npm install -D tailwindcss@^3.4
npx tailwindcss init
# Author src/tailwind.css with @tailwind directives
# Author tailwind.config.js mirroring the inline config at index.html:14-32
npx tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify
```

Then in every HTML file (`index.html`, `for-brokers.html`, `for-developers.html`, `for-allied.html`, `for-buyers-owners.html`, `design-system.html`):

```diff
- <script src="https://cdn.tailwindcss.com"></script>
- <script>tailwind.config = { ... }</script>
+ <link rel="stylesheet" href="dist/tailwind.css">
```

Also remove the `<link rel="preconnect" href="https://cdn.tailwindcss.com">` hint — no longer needed.

**Risk:** dynamic class generation. None found in `main.js`, but if Phase 2/3 work introduces any (`element.className = 'flex gap-4'`-style), add them to `safelist` in `tailwind.config.js`.

**Acceptance:** Network panel shows `dist/tailwind.css` < 20 KB gzipped, no calls to `cdn.tailwindcss.com`.

---

## Step 2 · Self-host Inter as `woff2`

### Why
Currently Inter loads via `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`. That's:
- 1 DNS lookup + TLS handshake to `fonts.googleapis.com` (~150ms on mobile)
- 1 fetch for the CSS file
- 1 DNS lookup + TLS handshake to `fonts.gstatic.com`
- 4 font file fetches (one per weight)
- No HTTP/2 multiplexing benefit because they're a different origin from our HTML

Self-hosting:
- Same origin = HTTP/2 multiplex with the HTML response
- Single `<link rel="preload" as="font" crossorigin>` per weight
- Aggressive caching (`Cache-Control: public, max-age=31536000, immutable` because filename is content-hashed)
- Removes a third-party dependency

### Steps

```bash
# Download Inter v4 woff2 files (subset: latin + latin-ext)
# Source: https://rsms.me/inter/font-files/Inter-Web.zip or https://github.com/rsms/inter/releases
mkdir -p fonts
# Place these files into fonts/:
#   inter-400.woff2  (Regular)
#   inter-500.woff2  (Medium)
#   inter-600.woff2  (SemiBold)
#   inter-700.woff2  (Bold)
```

Add to `styles.css` (or a new `fonts.css`):

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('fonts/inter-400.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('fonts/inter-500.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('fonts/inter-600.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('fonts/inter-700.woff2') format('woff2');
}
```

In `index.html` `<head>`, replace the Google Fonts block with:

```html
<link rel="preload" href="fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter-600.woff2" as="font" type="font/woff2" crossorigin>
<!-- 500 and 700 are below-the-fold; let them load with the CSS -->
```

Remove the `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`.

**Acceptance:** No requests to `googleapis.com` or `gstatic.com` in Network panel.

---

## Step 3 · Convert brand_assets PNGs to WebP

### Inventory

Run this to see what we're dealing with:

```bash
ls -lh brand_assets/**/*.{png,jpg,jpeg} | sort -k5 -h -r | head -30
```

Expected: people portraits (~300–600 KB), brand logos (~50–200 KB), shape SVGs (negligible).

### Conversion

```bash
# Install sharp once (handles WebP + AVIF in batch)
npm install -D sharp-cli

# Batch convert
npx sharp -i "brand_assets/**/*.{png,jpg,jpeg}" \
  -o "brand_assets" \
  -f webp \
  --webp-quality 85 \
  --webp-effort 6
```

### HTML pattern

Replace every:

```html
<img src="brand_assets/people/template-broker.png" alt="..." loading="lazy" decoding="async">
```

With:

```html
<picture>
  <source srcset="brand_assets/people/template-broker.webp" type="image/webp">
  <img src="brand_assets/people/template-broker.png" alt="..."
       width="240" height="240" loading="lazy" decoding="async">
</picture>
```

WebP-supporting browsers (everything modern) get the small file; the fallback PNG stays for legacy. Bot crawlers also fall back to PNG.

**Expected savings:** 60–75% byte reduction on people + brand assets. On a homepage with ~20 such images, that's 2–4 MB → 500 KB–1 MB.

**Acceptance:** Lighthouse "Serve images in next-gen formats" passes.

### Optional: AVIF for one more 30% win

Add an AVIF source above the WebP:

```html
<picture>
  <source srcset="brand_assets/people/template-broker.avif" type="image/avif">
  <source srcset="brand_assets/people/template-broker.webp" type="image/webp">
  <img src="..." width="240" height="240" loading="lazy" decoding="async">
</picture>
```

Decision: AVIF is now well-supported (95%+ browsers) — worth doing if you don't mind the extra build step.

---

## Step 4 · Add explicit width/height to all 33 remaining images

Each Unsplash/ytimg image currently relies on CSS `aspect-ratio` for stability. Adding explicit `width`/`height` attributes is belt-and-suspenders + Lighthouse explicitly checks for them.

### Approach

For each image, look at the wrapper's intended aspect ratio in CSS, then express it as concrete `width`/`height` attributes (browsers use these to compute the aspect ratio, then CSS scales the actual rendering).

Example — Discover project cards (`.dc-proj-img` uses `aspect-ratio: 4 / 5`):

```diff
- <img src="https://images.unsplash.com/photo-..." alt="..." loading="lazy" decoding="async">
+ <img src="https://images.unsplash.com/photo-..." alt="..."
+      width="600" height="750"
+      loading="lazy" decoding="async">
```

Match these aspect ratios to the existing CSS (verify with `grep "aspect-ratio" styles.css index.html`):
- Discover cards: 4:5 (`600 × 750`)
- Architecture & Design cards: 4:3 (`720 × 540`)
- Editorial cards: 16:9 (`1200 × 675`) or 1:1 (`400 × 400`)
- GharTalks thumbnails: 16:9 (`1280 × 720`)

**Acceptance:** Lighthouse "Image elements do not have explicit width and height" passes.

---

## Step 5 · Minify CSS and JS

### Approach A — use Vercel/build-step minification

If we're already adding a `tailwindcss` build step, add minification for the rest:

```bash
npm install -D esbuild
```

Add to `package.json`:

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify",
    "build:styles": "esbuild styles.css --minify --outfile=dist/styles.min.css && esbuild styles4.css --minify --outfile=dist/styles4.min.css",
    "build:js": "esbuild main.js --minify --outfile=dist/main.min.js",
    "build": "npm run build:css && npm run build:styles && npm run build:js"
  }
}
```

In `index.html`:

```diff
- <link rel="stylesheet" href="styles.css">
- <link rel="stylesheet" href="styles4.css">
+ <link rel="stylesheet" href="dist/styles.min.css">
+ <link rel="stylesheet" href="dist/styles4.min.css">

- <script defer src="main.js"></script>
+ <script defer src="dist/main.min.js"></script>
```

Add `dist/` to `.gitignore` and run `npm run build` as a Vercel build step (or commit `dist/` if you prefer no build).

### Approach B — keep source files, serve minified via server middleware

Vercel automatically Brotli/Gzip compresses text responses. Minification is still a meaningful pre-step (saves ~30% on top of compression) but Approach A is the standard.

**Expected savings:** 30–40% on each text file. `styles.css` 140 KB → ~90 KB; `main.js` size depends on its current content.

**Acceptance:** Each `.css` and `.js` response in Network panel ends in `.min.css`/`.min.js` and is roughly 30% smaller than the source file.

---

## Combined acceptance criteria

- [ ] `index.html` does not load `cdn.tailwindcss.com`, `fonts.googleapis.com`, or `fonts.gstatic.com`
- [ ] All `<img>` tags either use `<picture>` with WebP source OR are SVG
- [ ] All `<img>` tags have `width` and `height` attributes
- [ ] CSS + JS responses are minified
- [ ] Lighthouse mobile categories: Performance ≥ 85, Best Practices ≥ 95
- [ ] No visual regression on `index.html`, `for-brokers.html`, `for-developers.html`, `for-allied.html`, `for-buyers-owners.html`, `design-system.html`
- [ ] Refresh-position-drift is gone in real-world testing (the original symptom)

---

## What to land first if you can't do all of Phase 1 in one go

Order of impact:

1. Tailwind replacement (Step 1) — biggest CLS fix
2. brand_assets WebP (Step 3) — biggest byte savings
3. Self-host Inter (Step 2) — removes a third-party dep
4. Minify (Step 5) — small win, mechanical
5. Image dimensions (Step 4) — small win, tedious

Each step can land as its own PR if you prefer smaller diffs.
