# PLAN — Replace Tailwind CDN with a built stylesheet

## Why this matters

`index.html` currently loads Tailwind via `https://cdn.tailwindcss.com`. That CDN is **play mode** — a 140 KB runtime that scans the DOM with MutationObserver, generates utility CSS in JS, and injects it after first paint. Tailwind's own docs say it's "best used for testing and development purposes, not for production."

Consequences on this site, observed:
- ~400–1500 ms layout-shift window on mobile cold loads while CDN injects classes
- The "scroll position keeps changing on refresh" symptom (browser restores Y before classes settle)
- Render-blocking script in the critical path
- Cannot be cached aggressively (each visit re-downloads the runtime)

Replacing with a precompiled `dist/tailwind.css` removes all of this.

## Current usage scan

- **Tailwind utility classes in `index.html`:** ~17 elements use Tailwind utilities (`flex`, `grid`, `gap-*`, `hidden`, `bg-*`, etc.). Most of the page uses semantic classes (`cn4-*`, `vw4-*`, `intl4-*`) defined in `styles.css` / `styles4.css` and the inline `<style>` block.
- **Tailwind utility classes added dynamically in `main.js`:** none. The 45 `classList.add/toggle` calls use custom classes (`oc-open`, `jm-open`, `active`, `is-hidden`, `panel-open`, etc.) — none are Tailwind utilities. **The CSS file generated from a static HTML scan will be complete.**
- **`tailwind.config` extensions in HTML:** custom font families (Inter, Gazpacho), custom colors (red `#ee324b`, hover `#d42839`, tx, mu, ln). Need to port into `tailwind.config.js`.

## Files to add

1. `package.json` — add `tailwindcss@^3.4` as devDependency, add `build:css` and `watch:css` scripts.
2. `tailwind.config.js` — content paths (`./*.html`, `./docs/**/*.html`), `theme.extend` mirroring the inline config in [index.html:14-32](../index.html#L14-L32).
3. `src/tailwind.css` — three `@tailwind` directives (`base`, `components`, `utilities`).
4. `dist/tailwind.css` — generated output (could gitignore or commit; commit is simpler for static hosting).

## Files to change

- `index.html` — replace `<script src="https://cdn.tailwindcss.com"></script>` + inline config script with `<link rel="stylesheet" href="dist/tailwind.css">`. Remove the preconnect hint to `cdn.tailwindcss.com`.
- `for-brokers.html`, `for-developers.html`, `for-allied.html`, `design-system.html`, `for-buyers-owners.html`, any other HTML pages also loading the CDN — same swap.
- `.gitignore` — optionally add `dist/` if we don't commit the built file. For Vercel deployment, easier to commit it.
- `vercel.json` (if present) or deployment script — ensure build runs before deploy (or commit the built file and skip).

## Commands to run

```bash
# Install
npm install -D tailwindcss@^3.4

# Initialize
npx tailwindcss init

# Build once (production, minified)
npx tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify

# Watch (during development)
npx tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --watch
```

## Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| A dynamically-generated Tailwind class breaks because it wasn't in the scan | Low — none found in `main.js` | If found later, add to `safelist` in `tailwind.config.js` |
| Custom theme tokens don't match the inline config | Medium | Port carefully from [index.html:14-32](../index.html#L14-L32); test the red CTAs, the search bar, the off-canvas menu |
| Vercel build doesn't run the CSS build | High if we don't pre-build | Easiest: commit `dist/tailwind.css` so no build step needed |
| `@tailwind base` resets break styles cascaded from `styles.css` | Medium | Either omit `@tailwind base` (likely safe since custom CSS provides resets) OR audit `styles.css` for conflicts |
| Per-page CSS divergence (e.g. `for-brokers.html` uses Tailwind classes not in `index.html`) | Medium | Tailwind's content scan covers all HTML files in the project — generates one CSS that works everywhere |

## Effort estimate

- Setup + first build: 30–45 minutes
- Test pass across all pages: 30 minutes
- Total: ~1.5 hours, single session, blocking work

## Acceptance criteria

- [ ] `index.html` does not load `cdn.tailwindcss.com`
- [ ] Network panel shows `dist/tailwind.css` as a single CSS file < 20 KB gzipped
- [ ] No visual regression on `index.html`, `for-brokers.html`, `for-developers.html`, `for-allied.html`, `design-system.html`, `for-buyers-owners.html` (compared to current Vercel deploy)
- [ ] Lighthouse mobile score: First Contentful Paint reduced by ≥ 300 ms; CLS reduced to < 0.1
- [ ] Page position on refresh stays stable (the original symptom that surfaced this work)

## When to do this

After the current PageSpeed-style optimization pass merges. Land it as its own PR with its own test sweep — too risky to bundle into a broader change.
