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

const PARTIALS = ['nav', 'bottom-bar', 'footer', 'oc-menu', 'join-modal', 'mobile-search-modal', 'br-contact-modal', 'br-brief-modal', 'subscribe', 'subscribe-modal'];
const PAGES = ['index.html', 'design.html', 'design-article.html', 'design-architecture.html', 'design-series.html', 'design-heritage.html', 'for-brands.html', 'brands.html', 'brands-search.html', '_dev/templates/brand-profile.html', 'people.html',
  /* Voices. These three carry every partial marker EXCEPT `subscribe`:
     partials/subscribe.html hardcodes Design copy ("Ghar.tv Design",
     "Architecture worth visiting…"), so materializing it would print the
     wrong vertical's promise. They keep an un-markered copy of the same
     `.subscribe` chassis with Voices copy. The `no subscribe marker pair,
     skipping` warning for these three is EXPECTED, not a bug.
     Fix properly by parameterising eyebrow/title/dek in the partial, then
     bring all three back under the marker pair. */
  'voices.html', 'voices-search.html', 'voices-article.html', 'voices-conversations.html',
  /* People SRP — companion to /brands/search. Same chassis, /people data model. */
  'people-search.html',
  /* Person profiles are generated, but they carry the PARTIAL markers so the
     shared chrome stays byte-identical from here on. Regenerating a person
     page and then running this script must be a no-op. */
  'person-profile-tarun-motta.html', 'person-profile-hiten-motta.html',
  'person-profile-devesh-motta.html', 'person-profile-darshini-mahadevia.html',
  'person-profile-adi-godrej.html', 'person-profile-pirojsha-godrej.html',
  'person-profile-vinod-doshi.html', 'person-profile-suman-kanodia.html',
  'person-profile-ashish-bajoria.html', 'person-profile-virendra-shah.html',
  'person-profile-hardik-shah.html', 'person-profile-satish-bhansali.html',
  /* Templates, not shipped pages, but they seed every future person/brand
     page — if they drift, every page generated from them starts life stale.
     They live under _dev/templates/ (not the root) because they are never
     served; the paths below are relative to ROOT, which is all this script
     joins against. */
  '_dev/templates/person.html', '_dev/templates/person-profile.html'];

/* Masthead lockup, per page.
 *
 * partials/nav.html ships ONE lockup: the G symbol linking home, followed by
 * a vertical link that is a neutral placeholder ("Ghar.tv" -> "/"). This map
 * stamps the real name and destination into each content page after the
 * partial is expanded.
 *
 * Why the label is real markup and not CSS. The first cut generated it with
 * `content: var(--vertical)` from a per-page custom property, which rendered
 * correctly but is invisible to crawlers as anchor text: generated content
 * carries no link equity. "Voices" pointing at /voices is an internal link we
 * actually want counted, so it has to exist in the HTML.
 *
 * The two halves address different destinations ON PURPOSE: the symbol is the
 * company (home), the word is the section (the vertical's own root). Visually
 * one lockup, semantically two links.
 *
 * A page NOT listed here keeps the placeholder, which this script strips, so
 * it renders as the bare symbol. That is the intended treatment for forms and
 * other decision pages: symbol only, no section claim.
 */
const VERTICAL_LOCKUP = {
  'design.html':              { name: 'Design',  href: '/design' },
  'design-architecture.html': { name: 'Design',  href: '/design' },
  'design-heritage.html':     { name: 'Design',  href: '/design' },
  'design-series.html':       { name: 'Design',  href: '/design' },
  'design-article.html':      { name: 'Design',  href: '/design' },
  'voices.html':              { name: 'Voices',  href: '/voices' },
  'voices-search.html':       { name: 'Voices',  href: '/voices' },
  'voices-article.html':      { name: 'Voices',  href: '/voices' },
  'brands.html':              { name: 'Brands',  href: '/brands' },
  'brands-search.html':       { name: 'Brands',  href: '/brands' },
  'people.html':              { name: 'People',  href: '/people' },
};

/* Matches the placeholder anchor emitted by partials/nav.html. */
const VERTICAL_LINK_RE = /<a href="[^"]*" class="nav-mark__vertical" data-vertical-link>[^<]*<\/a>\s*/;

function applyVerticalLockup(html, page) {
  if (!VERTICAL_LINK_RE.test(html)) return html;
  const v = VERTICAL_LOCKUP[page];
  if (!v) return html.replace(VERTICAL_LINK_RE, '');
  return html.replace(
    VERTICAL_LINK_RE,
    `<a href="${v.href}" class="nav-mark__vertical" data-vertical-link>${v.name}</a> `
  );
}

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
    /* Stamped on every partial, not just `nav`, so a later partial expansion
       can never overwrite the lockup. Re-stamping an already-stamped anchor
       reproduces it byte for byte, which keeps the no-op check below honest. */
    const next = applyVerticalLockup(`${head}\n${content}\n${tail}`, page);
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
