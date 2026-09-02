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

/* ORDER MATTERS for `brief-form`: it expands INTO partials/br-brief-modal.html
   (which is listed in PAGES below), so it has to run before `br-brief-modal`
   expands that modal into the real pages. Nesting is one level deep only. */
const PARTIALS = ['brief-form', 'nav', 'bottom-bar', 'footer', 'oc-menu', 'join-modal', 'mobile-search-modal', 'br-contact-modal', 'br-brief-modal', 'subscribe', 'subscribe-modal'];
const PAGES = [
  /* Not a page: the brief modal is a partial that itself CONSUMES the
     brief-form partial, so it has to be processed like a page. Listed
     first so the form is inside it before it is copied into anything. */
  'partials/br-brief-modal.html',
  /* The two project-brief pages. They carry the form inline via the same
     brief-form partial and deliberately DO NOT carry the br-brief-modal
     marker: they are the brief, and a second copy would duplicate ids. */
  'brands-brief.html', 'people-brief.html',
  'index.html', 'design.html', 'design-article.html', 'design-architecture.html', 'design-series.html', 'design-heritage.html', 'for-brands.html', 'brands.html', 'brands-search.html', '_dev/templates/brand-profile.html', 'people.html',
  /* Voices. These three carry every partial marker EXCEPT `subscribe`:
     partials/subscribe.html hardcodes Design copy ("Ghar.tv Design",
     "Architecture worth visiting…"), so materializing it would print the
     wrong vertical's promise. They keep an un-markered copy of the same
     `.subscribe` chassis with Voices copy. The `no subscribe marker pair,
     skipping` warning for these three is EXPECTED, not a bug.
     Fix properly by parameterising eyebrow/title/dek in the partial, then
     bring all three back under the marker pair. */
  'voices.html', 'voices-search.html', 'voices-article.html', 'voices-conversations.html', 'voices-speakers.html', 'voices-quotes.html', 'voices-perspectives.html',
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
  /* The type/category page was missing here while every other page in the
     vertical was listed, so /voices/conversations rendered a bare G under a
     subnav whose active tab said Conversations. Third time this omission has
     shipped (see people-search.html below): a page added to PAGES but not to
     this map silently loses its lockup, because the script STRIPS the
     placeholder rather than leaving it visible. Nothing fails loudly.
     If you add a page to PAGES, add it here in the same edit or decide,
     deliberately, that it is a decision page that should stay bare. */
  'voices-conversations.html':{ name: 'Voices',  href: '/voices' },
  'voices-speakers.html':     { name: 'Voices',  href: '/voices' },
  'voices-quotes.html':       { name: 'Voices',  href: '/voices' },
  'voices-perspectives.html': { name: 'Voices',  href: '/voices' },
  'brands.html':              { name: 'Brands',  href: '/brands' },
  'brands-search.html':       { name: 'Brands',  href: '/brands' },
  'people.html':              { name: 'People',  href: '/people' },
  'brands-brief.html':        { name: 'Brands',  href: '/brands' },
  'people-brief.html':        { name: 'People',  href: '/people' },
  /* The SRP was missing here while its /brands twin was listed, so the
     people search rendered a bare G while every sibling page showed the
     section lockup. That read as a stale navbar. Same treatment as
     brands-search.html: the word points at the vertical root, which is
     also the only way back to /people now the breadcrumb is gone. */
  'people-search.html':       { name: 'People',  href: '/people' },
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

/* LOUD WARNING FOR THE MISSING-LOCKUP TRAP.
 *
 * A page added to PAGES but not to VERTICAL_LOCKUP loses its masthead label
 * silently, because applyVerticalLockup STRIPS the placeholder rather than
 * leaving it visible. The page still builds, still passes, and ships with a
 * bare G under a subnav naming the section. That has now happened three
 * times: brands-search.html, people-search.html and voices-conversations.html,
 * each reported as "the navbar looks stale".
 *
 * Staying bare is a legitimate choice for forms and decision pages, so this
 * cannot be a hard error. It lists them instead, so the omission is a
 * decision someone made rather than one nobody saw.
 */
const BARE_BY_DESIGN = new Set(['index.html', 'for-brands.html']);
const missingLockup = [];
for (const pg of PAGES) {
  if (pg in VERTICAL_LOCKUP || BARE_BY_DESIGN.has(pg) || pg.startsWith('_dev/')) continue;
  /* Only pages that actually carry the nav partial can lose a lockup. Most
     of PAGES is here for the subscribe-modal and has no masthead at all. */
  let src;
  try {
    src = await fs.readFile(path.join(ROOT, pg), 'utf8');
  } catch {
    continue;
  }
  if (src.includes('<!-- PARTIAL nav:start -->')) missingLockup.push(pg);
}
if (missingLockup.length) {
  console.warn(
    `
  NOTE: no masthead lockup for ${missingLockup.join(', ')}.` +
    `
  These render a bare G. Add them to VERTICAL_LOCKUP, or to` +
    `
  BARE_BY_DESIGN if that is intended.
`
  );
}

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
