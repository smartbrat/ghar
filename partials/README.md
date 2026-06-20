# Shared HTML partials

One source of truth for the chrome that has to be byte-identical across
`index.html`, `design.html`, and `design-article.html`.

| File | What it is |
|---|---|
| [`footer.html`](footer.html) | The site footer — link columns, social row, company strip, bottom bar, plus the dual-mode CSS and the initCarousel script that wires the mobile horizontal rail. |
| [`oc-menu.html`](oc-menu.html) | The off-canvas slide-in menu — main panel, all sub-panels (cities, content, events, services, tools), city tiles, and the menu footer. |

## Workflow

1. Edit the partial you care about.
2. Run `npm run build:partials` (also runs automatically as part of `npm run build`).
3. The script finds the `<!-- PARTIAL <name>:start --> ... <!-- PARTIAL <name>:end -->`
   marker pair in each page and replaces everything between them with the partial's
   current content. Pages that don't carry the marker pair are skipped, not errored.
4. Commit BOTH the partial AND the regenerated pages — Vercel serves the expanded
   HTML as-is (no runtime include processing).

## Why this exists

The footer's mobile horizontal-scroll silently broke on every page for months
because three copies of the init script diverged: `index.html` had no guard,
`design.html` and `design-article.html` had a one-shot `typeof` check that
always failed because `ghar-carousel.js` is deferred. Fixing it in one page
left the other two broken. Partials end that drift class entirely — there's
only ever one source.

## PHP integration

At backend integration the dev replaces each marker pair + its expanded content
with `<?php include __DIR__ . '/partials/footer.html'; ?>` (or Apache SSI).
The partial files become the includes verbatim. See
[`docs/DESIGN-ARTICLE-HANDOFF.md`](../docs/DESIGN-ARTICLE-HANDOFF.md).

## Adding a new partial

1. Create `partials/<name>.html` with the markup (and any inline `<style>` /
   `<script>` it carries — the partial is one self-contained chunk).
2. Add `<name>` to the `PARTIALS` array in
   [`scripts/build-partials.mjs`](../scripts/build-partials.mjs).
3. In every page that should consume it, wrap the existing inline copy with
   `<!-- PARTIAL <name>:start -->` and `<!-- PARTIAL <name>:end -->` markers.
4. Run `npm run build:partials` once to normalize.
