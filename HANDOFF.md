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
| `index.html` | `<head>` rewrite (self-host Inter + dist/* refs + ?v=2). `<picture>` wrappers around every `<img>`. Footer "About"/"Contact". ecoForYou compact-mobile block at ≤600px. | Keep mine for `<head>`, image tags, and `.e4-*` mobile block. Keep yours for section content. |
| `main.js` | ScrollSmoother gated to ≥744px. Eco hero, People, Brands carousels rewritten to native scroll. Reveal IntersectionObserver block at bottom. | Keep mine for the 3 carousel IIFEs and the reveal block. Keep yours for section-specific logic. |
| `styles.css` | Hover suppressed on touch (`@media (hover: none)`). `.ppl-*` / `.brd-*` switched to native scroll. (Site-wide scrollbar unchanged from baseline.) | Keep mine for the hover-suppression block and `.ppl-*` / `.brd-*` track rules. |
| `styles4.css` | `.intl4-foot` and `.ad4-foot` at ≤540px: `flex-start` → `center`. | Keep mine (only 4 lines). |
| `package.json` | Added `build:*` scripts and devDeps: `esbuild`, `sharp`, `tailwindcss`, `@fontsource-variable/inter`. | Keep mine. |
| `vercel.json` | New file — skips Vercel's auto-build. | Keep mine. |
| `tailwind.config.js`, `src/tailwind.css` | New — replaces Tailwind CDN. | Keep mine. |
| `fonts/inter-var*.woff2` | New — self-hosted Inter. | Keep mine. |
| `brand_assets/**/*.webp` | New WebP versions of every brand/people image. | Keep mine. |
| `scripts/convert-to-webp.mjs`, `scripts/add-image-dimensions.mjs` | New helper scripts. | Keep mine. |
| `dist/*` (main.min.js, styles.min.css, styles4.min.css, tailwind.css) | Build outputs — committed so Vercel doesn't need to build. | Always run `npm run build` and use the freshly-built versions. Don't hand-merge `dist/*` diffs. |

---

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

## Commits in order (skim for context)

```
7b6f18b  Mobile-perf pass: Tailwind build, self-host Inter, WebP, minify
32e8cd7  Add vercel.json (skip auto-build)
6b2c226  Carousel jitter fix on high-refresh touch screens
8dd86d1  Brands thumbnail overflow fix
31ce912  Carousels: native overflow + scrollTo
e0b865a  Suppress :hover on touch devices
d11258d  Broader hover suppression + eco autoplay
75c7acf  Footer: drop "Us" from About/Contact
c938c0e  [reverted] Scrollbar tweak — off-canvas now uses site-wide rules as before
da715cc  Remove off-canvas bottom gradient fade
1ecb3a6  [reverted] Off-canvas scrollbar arrow caps suppression — no longer needed
7e47ff0  Cache-bust dist/* with ?v=2
ec72cdb  Eco autoplay + ATF-fit hero cards on phones
d66a599  People/Brands native scroll + center nav buttons ≤540px
```

To see the diff of any commit: `git show <hash>`.
