# Handoff — what changed since 2026-05-20

Your baseline is commit `a245d1c`. Everything below sits on top of it.

---

## The fastest way to apply everything

```bash
git pull origin main
npm install
npm run build      # only if you edited styles.css / main.js / src/tailwind.css
```

That's it. Push to your branch, Vercel picks it up.

---

## If you have local edits and want to keep them

Rebase your branch on top of main:

```bash
git fetch origin
git rebase origin/main
```

Resolve conflicts using the table below.

---

## What changed in each file (one line each)

| File | What changed | How to merge |
|---|---|---|
| `index.html` | `<head>` rewrite (self-host Inter + dist/* refs + ?v=2). **All your live-site SEO + tracking already merged in: title, description, keywords, robots, canonical, all OG tags, fb:app_id, Google Analytics (G-FPB6WSXDBG), Facebook Pixel (1067350171096989).** `<picture>` wrappers around every `<img>`. Footer "About"/"Contact". ecoForYou compact-mobile block at ≤600px. | Keep mine for `<head>`, image tags, and `.e4-*` mobile block. Keep yours for section content. |
| `main.js` | ScrollSmoother gated to ≥744px. Eco hero, People, Brands carousels rewritten to native scroll. Reveal IntersectionObserver block at bottom. | Keep mine for the 3 carousel IIFEs and the reveal block. Keep yours for section-specific logic. |
| `styles.css` | Hover suppressed on touch (`@media (hover: none)`). `.ppl-*` / `.brd-*` switched to native scroll. (Site-wide scrollbar unchanged from baseline.) | Keep mine for the hover-suppression block and `.ppl-*` / `.brd-*` track rules. |
| `styles4.css` | `.intl4-foot` and `.ad4-foot` at ≤540px: `flex-start` → `center`. | Keep mine (only 4 lines). |
| `package.json` | Added `build:*` scripts and devDeps: `esbuild`, `tailwindcss`, `@fontsource-variable/inter`. | Keep mine. |
| `vercel.json` | New file — skips Vercel's auto-build. | Keep mine. |
| `tailwind.config.js`, `src/tailwind.css` | New — replaces Tailwind CDN. | Keep mine. |
| `fonts/inter-var*.woff2` | New — self-hosted Inter. | Keep mine. |
| `brand_assets/**/*.webp` | New WebP versions of every brand/people image referenced from index.html. | Keep mine. |
| `dist/*` (main.min.js, styles.min.css, styles4.min.css, tailwind.css) | Build outputs — committed so Vercel doesn't need to build. | Always run `npm run build` and use the freshly-built versions. Don't hand-merge `dist/*` diffs. |

---

## What was synced from your live ghar.tv (you don't need to re-do)

Pulled directly into our `index.html` head so you don't lose your SEO/tracking work:

- `<title>` — "Ghar - Buy, Sell & Rent Properties | India's Leading Real Estate Platform"
- `<meta name="description">` — your 3L+ users / AI-powered tools copy
- `<meta name="keywords">` — your keyword list
- `<meta name="robots" / GOOGLEBOT / MSNBOT / YAHOOBOT>` — all INDEX,FOLLOW
- `<meta name="google-site-verification">` — your token
- `<link rel="canonical" href="https://www.ghar.tv/">`
- All Open Graph tags (og:type / og:title / og:url / og:image / og:image:width / og:image:height / og:description / og:site_name)
- `<meta property="fb:app_id">` — 156341217829167
- Google Analytics (`G-FPB6WSXDBG`) — gtag.js + config
- Facebook Pixel (`1067350171096989`) — full init + PageView track

**Note on production path**: your live server serves CSS from `https://www.ghar.tv/twdist/...`. Our repo (and Vercel deploy) serves from `dist/`. If you need `twdist/` for your prod box, either rename the folder on deploy or update the four `<link rel="stylesheet">` paths in `index.html`. (Vercel uses `dist/` as-is — no rename needed.)

## Build commands cheat sheet

```bash
npm run build:styles     # styles.css + styles4.css → dist/*.min.css
npm run build:js         # main.js → dist/main.min.js
npm run build:tailwind   # src/tailwind.css → dist/tailwind.css
npm run build            # all three above
node serve.mjs           # local server at http://localhost:3000
```

If you change `index.html` content (HTML classes), re-run `npm run build:tailwind`.

---

## Cache-busting rule

When you change anything in `dist/*`, bump `?v=N` on the matching `<link>` / `<script>` in `index.html` head (search for `?v=2`). Otherwise browsers serve the old cached version for 5 minutes.

---

## Repo contents (only what index.html needs)

The repo was pruned to runtime-only files plus build/dev infrastructure. No archived versions, no planning docs, no separate-page modules. If you need something that's not here, it's intentional.

Kept:

- `index.html` + the four linked inner pages (`for-allied.html`, `for-brokers.html`, `for-buyers-owners.html`, `for-developers.html`)
- `gazpacho.css`, `fonts/inter-var*.woff2` (self-hosted display + body type)
- `brand_assets/` — only images actually referenced from index.html
- `dist/` — built CSS + JS, committed so Vercel skips build
- Build sources: `main.js`, `styles.css`, `styles4.css`, `src/tailwind.css`, `tailwind.config.js`
- Project config: `package.json`, `package-lock.json`, `vercel.json`, `.gitignore`
- Dev server: `serve.mjs` (run with `node serve.mjs` for `http://localhost:3000`)

## Commits to skim (latest is on top of all these)

```
1978510  Carousels unified on GSAP-transform drag with rAF-batched pointermove
ae59cb5  Consolidate People+Brands onto the shared initCarousel chassis
0d8c633  Native scrollTo for all autoplay/prev-next
ec72cdb  Eco autoplay + ATF-fit hero cards on phones
7b6f18b  Mobile-perf pass: Tailwind build, self-host Inter, WebP, minify
32e8cd7  Add vercel.json (skip auto-build)
```

To see the diff of any commit: `git show <hash>`.
