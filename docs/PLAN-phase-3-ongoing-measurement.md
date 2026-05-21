# PLAN — Phase 3: Ongoing Measurement

> Continuous health-checks so the optimization gains from Phases 1 and 1.5 don't regress as the site grows. Web Vitals reporting, Lighthouse CI, unused-CSS audit, JavaScript code splitting.

## Why this matters

Without measurement, every new section, image, or third-party script silently eats back the perf we just won. A perf budget enforced in CI is what turns "we optimized once" into "the site stays fast."

This phase is *ongoing*, not one-shot. Most items are setup-once-run-forever.

## Effort

- Initial setup: ~3 hours total across all steps
- Then: zero per-PR overhead (CI does the watching)

---

## Step 1 · Web Vitals reporting in production

Ships `web-vitals` library, sends LCP / INP / CLS to an analytics endpoint on every real-user pageview. This is the gold-standard signal for whether the site is fast *for users on their actual devices and networks*, not just on Lighthouse's emulated mobile.

```bash
npm install -D web-vitals
```

Add to `main.js` (or a new `analytics.js` loaded with `defer`):

```js
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function send(metric) {
  // POST to your analytics endpoint. Vercel Analytics, Plausible, or Google Analytics 4 all accept this.
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    url: location.pathname,
    ua: navigator.userAgent
  });
  if (navigator.sendBeacon) navigator.sendBeacon('/api/vitals', body);
  else fetch('/api/vitals', { body, method: 'POST', keepalive: true });
}

onLCP(send);
onINP(send);
onCLS(send);
onFCP(send);
onTTFB(send);
```

If using Vercel: Vercel Analytics has built-in Web Vitals reporting — flip a toggle in the dashboard, skip this script entirely.

**Acceptance:** Web Vitals data flowing into the analytics dashboard, segmented by device class (mobile/desktop) and 75th percentile available.

---

## Step 2 · Lighthouse CI on every PR

Catches regressions before they merge. GitHub Action + a budget file that fails the build if scores drop.

```bash
npm install -D @lhci/cli
```

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/for-brokers", "http://localhost:3000/for-developers"],
      "startServerCommand": "node serve.mjs",
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["warn",  { "minScore": 0.90 }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }],
        "categories:seo": ["warn",            { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn",     { "maxNumericValue": 300 }],
        "unused-css-rules": "off"
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI
on: [pull_request]
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

**Acceptance:** Every PR shows a Lighthouse comment with score deltas; PRs that drop Performance below 85 are blocked.

---

## Step 3 · Unused-CSS audit + cleanup

`styles.css` is currently 140 KB. Much of it is probably dead code carried over from `index-v1.html`. PurgeCSS (built into Tailwind) won't touch custom CSS — we need a separate audit pass.

```bash
npm install -D purgecss
```

Run once to identify dead rules:

```bash
npx purgecss --css styles.css --content "index.html" "main.js" --output dist/purged-preview/
```

Inspect `dist/purged-preview/styles.css` against the source. Look at what got removed — if it's truly unused (confirm by grepping HTML/JS for any class), delete it from `styles.css`. **Do not auto-apply** — false positives are easy and styling can break in ways the scanner can't detect (e.g., classes added dynamically by GSAP / tweens).

Repeat per page if needed.

Expected savings: 40–80 KB on `styles.css`. Combined with minification, target ~70 KB total for `dist/styles.min.css`.

**Acceptance:** `dist/styles.min.css` reduced by ≥ 30% vs current; no visual regression.

---

## Step 4 · JavaScript code splitting

`main.js` does everything: nav, search, off-canvas, modals, every carousel, every IntersectionObserver, every animation. It's all parsed up-front even though most of it isn't needed until the user scrolls down or opens a modal.

Split into:

| Bundle | Contents | Load timing |
|---|---|---|
| `main-critical.js` | Nav, search bar, mobile bottom-nav, off-canvas open/close, scroll-restoration | `defer`, in `<head>` |
| `main-carousels.js` | All carousel autoplay + drag handlers | dynamic `import()` on first IO trigger |
| `main-modals.js` | Sign-in modal, country-code dropdown, mobile search panel | dynamic `import()` on first open-trigger click |
| `main-reveals.js` | Section entrance IO observer | `defer`, in `<head>` (lightweight, runs early) |

esbuild bundling:

```bash
npx esbuild src/main-critical.js src/main-carousels.js src/main-modals.js src/main-reveals.js \
  --bundle --minify --splitting --format=esm --outdir=dist
```

This is a moderately invasive refactor — main.js needs to be broken into modules. Estimate ~4 hours.

**Acceptance:** First-load JS execution time on mobile < 200 ms (currently likely 500–800 ms with the monolithic main.js).

---

## Step 5 · Performance budget enforcement

Once Lighthouse CI is running, add a budget file that hard-caps bytes per resource type:

`budget.json`:

```json
[{
  "path": "/*",
  "resourceSizes": [
    { "resourceType": "script", "budget": 150 },
    { "resourceType": "stylesheet", "budget": 100 },
    { "resourceType": "image", "budget": 800 },
    { "resourceType": "font", "budget": 100 },
    { "resourceType": "total", "budget": 1500 }
  ],
  "resourceCounts": [
    { "resourceType": "third-party", "budget": 5 }
  ]
}]
```

Reference it from `lighthouserc.json`. PRs that bust the budget fail.

**Acceptance:** Adding a 5 MB unoptimized image to a section makes the CI red.

---

## Combined acceptance criteria

- [ ] Real-user Web Vitals (LCP/INP/CLS) flowing into analytics, 75th percentile dashboarded
- [ ] Every PR runs Lighthouse CI and posts score deltas
- [ ] `dist/styles.min.css` reduced ≥ 30% via dead-code removal
- [ ] `main.js` split into 3–4 bundles loaded by need, not all-at-once
- [ ] Performance budget enforced in CI, regressions blocked

## Dependencies

- Vercel project (already in use) — provides analytics endpoint + CI runtime
- GitHub Actions enabled on the repo (free for public repos)
- Sequenced AFTER Phase 1 (so we measure the *optimized* baseline, not the dev-mode baseline). Phase 1.5 can land alongside.

## What this enables long-term

Once Phase 3 is in place, **every future change is auto-graded**. A new section can be added, an experiment can be A/B'd, a third-party widget can be evaluated — and the team sees the perf consequence before merging. That's what separates a portal that stays fast from one that decays.
