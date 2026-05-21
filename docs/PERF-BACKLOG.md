# Performance Backlog

> Index of all performance + portal-hygiene plans, with status. Updated 2026-05-21.

## ✅ Done in this session (committed to `main`)

The site has been moved from "dev-mode prototype" to "production asset pipeline" for the homepage:

| Change | Result | File |
|---|---|---|
| Tailwind CDN → built `dist/tailwind.css` | 11 KB cached file, vs 140 KB runtime CDN per visit | [index.html](../index.html) + [tailwind.config.js](../tailwind.config.js) |
| Self-hosted Inter as variable woff2 | 1 file (48 KB), no Google Fonts requests | [fonts/](../fonts/) |
| `brand_assets/*.png` → WebP via `<picture>` | 6.0 MB → 0.75 MB (87.5% smaller) | [scripts/convert-to-webp.mjs](../scripts/convert-to-webp.mjs) |
| `width`/`height` on 23 lazy images | CLS prevention | [scripts/add-image-dimensions.mjs](../scripts/add-image-dimensions.mjs) |
| Minified CSS + JS via esbuild | styles4: 63 → 31 KB, main.js: 109 → 77 KB | `npm run build` |
| `history.scrollRestoration = 'manual'` | Eliminates refresh position drift | inline `<script>` in head |
| `content-visibility: auto` on mobile sections | Browser skips offscreen layout/paint | inline `<style>` block |
| VideoWorks `filter: blur` → composited transform (mobile) | Removed paint-heavy keyframes | inline `<style>` block |
| Section entrance reveals via single IO | `.reveal-rise` on sec-head elements | [main.js](../main.js) IIFE + inline CSS |
| `theme-color`, `color-scheme`, `format-detection` meta | Mobile chrome integration | inline `<head>` meta |
| `dns-prefetch` for unsplash / ytimg / flagcdn | Faster lazy-image fetch | inline `<head>` |
| `decoding="async"` on all 33+ images | Off-main-thread decode | bulk find-replace |

## 📋 Planned next — sequenced by impact

Each phase has its own scoped plan doc.

### Phase 1 — Production bundle (most of this is now DONE)
- **Status:** Substantially complete. See [PLAN-phase-1-production-bundle.md](PLAN-phase-1-production-bundle.md) for the original scope. Tailwind, Inter, WebP, image dimensions, minify all shipped.
- **Remaining from this plan:** none for `index.html`. Other live pages (`for-brokers.html`, `for-developers.html`, etc.) still use the Tailwind CDN — migrate them when their next change comes through.

### Phase 1.5 — Section entrances (partially done)
- **Status:** Scaffolding in place. `.reveal-rise` applied to 6 section heads. See [PLAN-phase-1.5-section-entrances.md](PLAN-phase-1.5-section-entrances.md) for the full pattern + per-section application matrix.
- **Remaining:** apply `.reveal-stagger` to grids (Discover cities, Intelligence reports, Architecture rail, GharTalks episodes, etc.) per the matrix in the plan doc.

### Phase 2 — SEO and discoverability (not started)
- **Status:** Plan in [PLAN-phase-2-seo-discoverability.md](PLAN-phase-2-seo-discoverability.md).
- **Scope:** Open Graph + Twitter Card meta, canonical URL, JSON-LD structured data (`Organization` + `WebSite`), `sitemap.xml` + `robots.txt`, PWA manifest + icons, per-page meta descriptions.
- **Effort:** ~2 hours + brand-design task for OG image + icon set.
- **Blocking:** none. Can land anytime after Phase 1.

### Phase 3 — Ongoing measurement (not started)
- **Status:** Plan in [PLAN-phase-3-ongoing-measurement.md](PLAN-phase-3-ongoing-measurement.md).
- **Scope:** `web-vitals` reporting to analytics, Lighthouse CI in GitHub Actions, unused-CSS audit + cleanup, JavaScript code splitting, performance budget enforcement.
- **Effort:** ~3 hours initial setup, zero per-PR after that.
- **Why last:** measures the optimized baseline, not the dev-mode one. Land after Phases 1–2.

## 🗂 Reference docs

- [PLAN-tailwind-build.md](PLAN-tailwind-build.md) — original Tailwind replacement scope (now executed for `index.html`)
- [PLAN-phase-1-production-bundle.md](PLAN-phase-1-production-bundle.md) — Tailwind, Inter, WebP, dimensions, minify
- [PLAN-phase-1.5-section-entrances.md](PLAN-phase-1.5-section-entrances.md) — reveal-rise + reveal-stagger IO patterns
- [PLAN-phase-2-seo-discoverability.md](PLAN-phase-2-seo-discoverability.md) — OG, JSON-LD, sitemap, PWA
- [PLAN-phase-3-ongoing-measurement.md](PLAN-phase-3-ongoing-measurement.md) — web-vitals, Lighthouse CI, code splitting

## How to build locally

```bash
npm install
npm run build      # builds dist/tailwind.css, styles.min.css, styles4.min.css, main.min.js
npm run build:images   # only if brand_assets/ has new files
node serve.mjs     # dev server at http://localhost:3000
```

`npm run watch:tailwind` keeps Tailwind output in sync while editing utility classes in HTML.
