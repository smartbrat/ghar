#!/usr/bin/env node
/* Expand shared HTML partials into every page that references them.
 *
 * Why this exists:
 *   - Shared chrome (footer, off-canvas menu) used to be copy-pasted into
 *     index.html, design.html, design-article.html and drift was inevitable
 *     (different init guards, different formatting, different content). Fixing
 *     a bug in one file would silently leave the other two broken.
 *   - Vercel serves these files statically — no SSI, no PHP includes — so we
 *     can't include partials at request time. Instead we materialize them at
 *     build time: edit the partial once, run this script, all pages update.
 *
 * Contract (per partial, per page):
 *
 *     <!-- PARTIAL footer:start -->
 *     ...inlined content...
 *     <!-- PARTIAL footer:end -->
 *
 *   This script replaces everything between the two markers with the partial's
 *   current content. Pages that don't carry the marker pair are skipped.
 *
 * Run:
 *
 *     npm run build:partials
 *
 * Workflow:
 *
 *   1. Edit `partials/footer.html` (or `partials/oc-menu.html`).
 *   2. `npm run build:partials` rewrites each marked page in place.
 *   3. Commit the partial AND the regenerated pages — Vercel only sees the
 *      expanded HTML and serves it as-is.
 *
 * PHP integration handoff:
 *   At backend integration time, replace each marker pair + its content with
 *   `<?php include 'partials/<name>.html'; ?>`. The partial files become the
 *   PHP includes. See docs/DESIGN-ARTICLE-HANDOFF.md.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PARTIALS = ['nav', 'bottom-bar', 'footer', 'oc-menu', 'join-modal', 'mobile-search-modal', 'br-contact-modal'];
const PAGES = ['index.html', 'design.html', 'design-article.html', 'design-architecture.html', 'for-brands.html', 'brands.html', 'brands-search.html', 'brand-profile.html'];

let touched = 0;
let skipped = 0;

for (const partial of PARTIALS) {
  const partialPath = path.join(ROOT, 'partials', `${partial}.html`);
  const content = (await fs.readFile(partialPath, 'utf8')).trimEnd();
  const startMarker = `<!-- PARTIAL ${partial}:start -->`;
  const endMarker = `<!-- PARTIAL ${partial}:end -->`;

  for (const page of PAGES) {
    const pagePath = path.join(ROOT, page);
    let html;
    try {
      html = await fs.readFile(pagePath, 'utf8');
    } catch {
      console.warn(`  ${page}: file missing, skipping`);
      skipped++;
      continue;
    }
    const startIdx = html.indexOf(startMarker);
    const endIdx = html.indexOf(endMarker);
    if (startIdx === -1 || endIdx === -1) {
      console.warn(`  ${page}: no ${partial} marker pair, skipping`);
      skipped++;
      continue;
    }
    if (endIdx <= startIdx) {
      console.error(`  ${page}: ${partial} end-marker appears before start-marker`);
      process.exit(1);
    }
    const head = html.slice(0, startIdx + startMarker.length);
    const tail = html.slice(endIdx);
    const next = `${head}\n${content}\n${tail}`;
    if (next === html) {
      console.log(`  ${page}: ${partial} already current`);
      continue;
    }
    await fs.writeFile(pagePath, next, 'utf8');
    console.log(`  ${page}: ${partial} expanded`);
    touched++;
  }
}

console.log(`\nDone. ${touched} expansion(s) written; ${skipped} skip(s).`);
