/* ===================================================================
   PERSON PROFILE BUILDER  ·  /people/{slug}

   Emits:
     person-profile.html            the TEMPLATE ({{TOKENS}} + REPEAT fences)
     person-profile-{slug}.html     one rendered page per record

   Both come from the SAME render(), so the template cannot drift from
   what ships. Run: npm run build:people
   =================================================================== */
import { promises as fs, existsSync } from 'node:fs';
import {
  SHELL_PRE, SHELL_POST, SHELL_NAME, SHELL_PALETTE, SHELL_MICROFOOTER,
  CONTENT_GROUPS, CATEGORIES, PEOPLE, esc,
} from './person-profile-data.mjs';
// Brand color comes ONLY from the palette registry (dist/brand-theme.css).
import { PALETTES } from './brand-palettes.mjs';
// Portal image rule: every output goes through the same <picture>/AVIF/WebP
// transform the audit enforces (npm run build fails otherwise).
import { apply as optimiseImages } from './lib/images.mjs';

const ROOT = 'd:/WORK/ghar-claude/';

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
const CHEV  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

/* Spotlight furniture, copied glyph for glyph from the brand microsite
   so the two pages render the same controls. The play mark is not here:
   .bpr-mcard--video draws it in CSS. */
const PAG_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
const PAG_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
const INTEL_ARROW = '<svg class="bpr-intel-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

/* The hero foot bar's three facts, one icon each, drawn in the same
   Lucide-style stroke the brand template's meta row uses for its pin and
   its clock so the two pages read as one system. */
const PIN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
/* An award ribbon, not a mortarboard. A qualification here is as often a
   statutory licence as a degree, and a graduation cap would quietly
   restate the education framing this field was moved out of the eyebrow
   to escape. */
const CERT  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="M8.6 14.3 7 22l5-3 5 3-1.6-7.7"/></svg>';
/* A twinkle, filled rather than stroked: at 13px a stroked star is four
   hairlines and reads as a smudge. Two stars, uneven, because one
   centred star is a rating mark and a pair off-axis is a sparkle. */
/* TWO STARS, STROKED. Solid was the wrong read: a filled four-point star
   at this size is a lozenge, and the thing that makes a sparkle legible
   as a sparkle is the hollow, which is what the eye uses to tell the
   four needles apart.

   Both stars are the same construction at two radii, so the pair is one
   shape repeated rather than two drawings: four points on the compass,
   each arm a cubic whose control points sit at a fifth of the radius
   from the centre. That fifth is the whole character. Larger and the
   arms fatten into a diamond; this keeps the needles.

   STROKE WEIGHT IS THE LEGIBILITY PROBLEM, not the shape. At 1.6 the
   line was a fifth of the big star's radius and a third of the small
   one's, so the hollows closed to slivers and the pair read as two
   blobs. 1.15 against radii of 9 and 4.8 leaves an opening the eye can
   still find at 18px.

   Placed so nothing collides: the big star's right point stops at 18.6
   on y=14 and the small one's lowest point is 4 units above it on a
   different x. Stroked in currentColor so it takes the label's ink. */
const SPARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round" aria-hidden="true"><path d="M9.6 5C9.6 12.2 11.4 14 18.6 14C11.4 14 9.6 15.8 9.6 23C9.6 15.8 7.8 14 0.6 14C7.8 14 9.6 12.2 9.6 5Z"/><path d="M19.2 0.4C19.2 4.24 20.16 5.2 24 5.2C20.16 5.2 19.2 6.16 19.2 10C19.2 6.16 18.24 5.2 14.4 5.2C18.24 5.2 19.2 4.24 19.2 0.4Z"/></svg>';
/* The shelf, not a possession: a tag is what a directory hangs on a
   record, which is exactly what the category is. */
const TAG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';

/* PAGE STYLESHEET: /dist/person-profile.css, linked from the shell's head.
   It was extracted from this generator's old inline CSS on 2026-09-15
   (c413332) and has been the source of truth since. Edit it there. */

/* ── reach icons ───────────────────────────────────────────────────
   Kinds are validated in person-profile-data.mjs, so an unknown one
   throws at build rather than falling through to the globe and
   mislabelling somebody's social profile. */
const WEB   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const MAIL  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>';
const LINKD = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.5 18v-8h-2.5v8h2.5zm-1.25-9.1a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9zM18 18v-4.4c0-2.34-1.26-3.4-2.94-3.4-1.36 0-1.96.74-2.31 1.26v-1.06H10.25c.03.72 0 8 0 8h2.5v-4.47c0-.22.02-.44.08-.6.18-.44.58-.9 1.26-.9.89 0 1.24.67 1.24 1.66V18H18z"/></svg>';
const INSTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>';
const YT    = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.9-.5-5.7a3 3 0 0 0-2.1-2.1C18.6 3.7 12 3.7 12 3.7s-6.6 0-8.4.5a3 3 0 0 0-2.1 2.1C1 8.1 1 12 1 12s0 3.9.5 5.7a3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12zM9.8 15.4V8.6l5.9 3.4z"/></svg>';
const XMARK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1-5.7 6.1H1.6l7.5-8.6L1.2 3h6.6l4.5 5.6zm-1.1 16.1h1.8L7.7 4.8H5.8z"/></svg>';
const FB    = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>';
const REACH_ICON = { web: WEB, email: MAIL, linkedin: LINKD,
                     instagram: INSTA, youtube: YT, x: XMARK, facebook: FB };

const GHAR_G = '<svg viewBox="0 0 890.6 196.8" fill="currentColor" aria-hidden="true"><path d="M180.5,92.6l0,13.8c0,49.9-40.3,90.3-90.2,90.3S0,156.3,0,106.4V60.8c0-10.4,5.1-17.6,13.7-22.2l65.4-36c3-1.5,6.5-2.7,11.1-2.7c4.6,0,8.1,1.2,11.1,2.7l65.4,36l-30.6,23.9v0l0,0L97,40.9c-1.8-0.9-3.9-1.6-6.7-1.6c-2.8,0-4.9,0.7-6.7,1.6L44.3,62.5c-5.1,2.8-8.2,7.1-8.2,13.3v27.4c0,30,24.3,57.5,54.2,57.5c21.8,0,40.6-14.6,49.2-34.1H90.3v-34H180.5z M451.9,65.2h34V194h-34v-11.4c-10.7,8.9-24.4,14.2-40.1,14.2c-36.3,0-64-30-64-67.3c0-37.1,27.7-67.1,64-67.1c15.8,0,29.5,5.3,40.1,14.2L451.9,65.2L451.9,65.2z M449.8,129.5c0-18.3-15-33.3-33.5-33.3s-33.5,15-33.5,33.3c0,18.5,15,33.5,33.5,33.5S449.8,148.1,449.8,129.5z M268.2,62.4c-14.5,0-26.2,5.1-34.8,13.7V4.8h-33.8V194h33.8v-61.7c0-18.8,8.9-36.1,30.2-36.1c20.3,0,29.7,15.5,29.7,31.2V194h34v-66.6C327.4,91.4,308.1,62.4,268.2,62.4z M268.2,62.4C268.2,62.4,268.2,62.4,268.2,62.4C268.2,62.4,268.2,62.4,268.2,62.4L268.2,62.4z M854.3,65.2L854.3,65.2l-34.8,84.6l-34.5-84.6h-36.3L801.4,194h36.3l52.8-128.8H854.3z M715.1,164.3L715.1,164.3c-9.1,0-14.2-5.6-14.2-15.2V97h35.1V65.2h-35.1V36.5h-34v28.7h-21.3V97h21.3v52.1c0,33,17.5,47,44.7,47c16.5,0,28.5-8.9,35.8-17.3l-20.6-20.6C725,160.3,720.9,164.3,715.1,164.3z M605.6,157.7c-10.9,0-19.8,8.6-19.8,19.6c0,10.9,8.9,19.6,19.8,19.6s19.6-8.6,19.6-19.6C625.1,166.3,616.5,157.7,605.6,157.7z M545.1,82L545.1,82V65.2h-33.8V194h33.8v-50.3c0-39.4,15.5-47.5,39.4-47.5V62.4C567.2,62.4,554.2,69.3,545.1,82z"/></svg>';
const BACK   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const SHARE  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

/* ── helpers ───────────────────────────────────────────────────────
   NO FIRST-NAME-ONLY in anything a reader sees. "About Tarun" is
   over-familiar for a senior professional whose page this is, and the
   surname alone does not rescue it here: three of the four records are
   Mottas. Full name every time, and no honorific: applying Mr / Ms / Dr
   across a directory means holding a verified title for every person,
   and getting one wrong on someone's own profile is worse than not
   using them. */

/* THE CREDENTIALS MUST NOT RESTATE THE FACT LIST. City, years and
   qualification are already stated in the hero, and a record that
   repeats them produces a definition list saying what the reader
   finished reading a moment earlier.

   EXACT matches only, and this is the second version of the rule. The
   first was a substring test that also read the brief, and it was
   silently eating real credentials: "Architect" is a substring of
   "Council of Architecture (COA)", so a registered architect's
   registration vanished from his own page. A formal credential is not
   made redundant by the prose mentioning it in passing. */
const stripFacts = (p) => (p.facts || []).filter(f => {
  const v = String(f.value).toLowerCase().trim();
  const shown = [p.discipline, p.experience, p.city].filter(Boolean).map(x => x.toLowerCase().trim());
  return !shown.includes(v);
});

/* Credentials, rendered at the END OF THE ABOUT PROSE rather than in
   the hero. See the .pp-facts rules for why. */
const facts = p => !stripFacts(p).length ? '' : `
          <dl class="pp-facts pp-rise">
${stripFacts(p).map((f, i) => `            <div class="pp-fact" style="--d:${i * 60}ms"><dt class="pp-fact__label">${esc(f.label)}</dt><dd class="pp-fact__value">${esc(f.value)}</dd></div>`).join('\n')}
          </dl>`;

/* The figures block. Two to four, or nothing.

   ONE is not a block, it is a stray number on a hairline, so this
   requires two. Four is the cap because a fifth halves the width of all
   of them and they stop being legible at a glance, which is the only
   thing they are for.

   Every value comes from `figures[]` on the record. Nothing is derived
   and nothing is estimated: an invented number in the first screen of
   somebody's own profile is the worst place on the site to put one. */
/* ── the fact bar, closing the hero ──────────────────────────────
   WHICH EARNS THE BIGGER SPOT, THE SPECIALISATIONS OR THE FIGURES.

   Neither, and the question only looked hard because both were being
   asked to win the same slot. They are different kinds of claim and
   they want different things:

     SPECIALISATIONS answer "is this the right person for me", which is
     the question a directory exists to settle. Nearly every record has
     them. What that needs is POSITION and WIDTH: first cell, widest
     cell, so it is read before anything else on the line.

     FIGURES are proof, not navigation. They are rarer, they differ
     wildly between a developer and a researcher, and half the
     directory will never have two. What they need is SCALE: the
     display face, big, because a number is the one thing here a reader
     takes in without reading.

   So the bar gives the specialisations the first and widest cell and
   the figures the display type. Each gets what it is actually good at
   and neither is demoted.

   WHITE, with a hairline top and bottom. The reference sets this band
   in near-black, which is right on a page built around one photograph
   and wrong on a directory where two thirds of people have no
   photograph and the same band would be the only dark object on an
   otherwise pale page. Rules and space do the separating.

   IT DEGRADES BOTH WAYS. Specialisations and no figures is a
   competences strip. Figures and no specialisations is a numbers strip.
   Neither, and there is no bar at all. */
/* ── the bar that closes the hero ────────────────────────────────
   IT CARRIES THE SPECIALISATIONS, and the reason is which field a
   directory actually holds.

   It carried the figures first, and figures are the wrong tenant for a
   structural element: barely half the directory has two of them, so on
   most profiles the hero would simply have no bottom edge, and the ones
   that did would look like a different template. Specialisations are on
   nearly every record. Giving them the bar means almost every page in
   the directory closes its hero the same way, which is the whole job of
   a structural element.

   EQUAL COLUMNS, not packed left. Packed reads better for figures,
   which are short and even. These are phrases of wildly different
   lengths, and packing them left means the strip wraps at some widths,
   which puts a leading divider at the start of the second row: a rule
   separating a phrase from nothing. Equal columns wrap INSIDE a cell
   instead, where the divider stays where it belongs. */
const factbar = (p) => {
  const spec = (p.topics || []).slice(0, 5);
  if (!spec.length) return '';

  return `
      <div class="pp-fb pp-rise" style="--d:430ms">
        <div class="pp-fb__row">
          <p class="pp-fb__l"><span class="pp-fb__spark">${SPARK}</span>Specialises in</p>
${spec.map(t => `          <div class="pp-fb__cell">
            <p class="pp-fb__t">${t.href ? `<a href="${t.href}">${esc(t.label)}</a>` : esc(t.label)}</p>
          </div>`).join('\n')}
        </div>
      </div>`;
};

/* ── figures, back in the identity column ────────────────────────
   Between the brief and the action, because the numbers are the
   argument and the button is the ask.

   AT THE BAR'S SIZE, not at display scale. They spent a version at
   29px Gazpacho over a caps label, which is a size that only works when
   the numbers are the biggest claim on the screen. Beside a 60px name
   and a portrait they are not: they are supporting evidence, and 17px
   over a 13.5px gloss is what supporting evidence looks like. It also
   costs about forty pixels less of the first screen.

   Two minimum, four maximum. One is a stray number, and a fifth halves
   the width of all of them. */
const figures = p => (p.figures || []).length < 2 ? '' : `
          <div class="pp-figs pp-rise" style="--d:330ms" aria-label="Track record">
${p.figures.slice(0, 4).map(f => `            <div class="pp-fig">
              <span class="pp-fig__n">${esc(f.value)}</span>
              <span class="pp-fig__l">${esc(f.label)}</span>
            </div>`).join('\n')}
          </div>`;

/* THE FACTS, stacked under the role line. Icon then value, one per row,
   because a horizontal dateline of three icon-and-caps items has nowhere
   to go at 390px.

   Values are plain: "Mumbai", not "Lives in Mumbai". A host profile
   speaks in the first person about itself; a directory is written about
   someone in the third, and the icon already says what each row is. */
function idfacts(p, hasFigs) {
  /* Experience is a NUMBER, so when the figures are rendering it belongs
     there and repeating it here would be the same fact twice. With no
     figures it falls back into this list. */
  const items = [
    p.city                   ? [PIN,   p.city]       : null,
    p.experience && !hasFigs ? [CLOCK, p.experience] : null,
    p.discipline             ? [CERT,  p.discipline] : null,
  ].filter(Boolean);
  if (!items.length) return '';
  return `            <ul class="pp-idfacts pp-rise" style="--d:250ms">
${items.map(([icon, text]) => `              <li>${icon}${esc(text)}</li>`).join('\n')}
            </ul>`;
}

/* The name is carried TWICE and both are needed. aria-label names the
   link for a screen reader, which never sees the bubble; the bubble
   names it for a sighted reader, who never hears the label. */
const reach = p => !(p.links || []).length ? '' : `            <div class="pp-reach">
${p.links.map((l, i) => `              <div class="pp-reach__wrap tip${i === 0 ? ' tip--start' : ''}">
                <a class="pp-reach__link pp-reach__link--${l.kind} tip__anchor" href="${l.href}"${l.kind === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"'} aria-label="${esc(l.label)}" aria-describedby="tip-${p.slug}-${l.kind}">
                  <span class="pp-reach__icon">${REACH_ICON[l.kind] || WEB}</span>
                </a>
                <span class="tip__bubble" role="tooltip" id="tip-${p.slug}-${l.kind}">${esc(l.label)}</span>
              </div>`).join('\n')}
            </div>`;

/* The affiliation sits INSIDE the role line, the way a byline does. It
   was briefly its own section below the hero, wrapped in a heading and
   84px of padding: that inflates one fact into a chapter. */
const roleLine = p => {
  if (p.company) return `${esc(p.role)}, <a href="/brands/${p.company.slug}">${esc(p.company.name)}</a>`;
  if (p.affiliation) return `${esc(p.role)}, ${esc(p.affiliation)}`;
  return esc(p.role);
};

function hero(p, all) {
  const portrait = p.portrait
    ? `<div class="pp-portrait"><img class="img-fade" src="${p.portrait}" alt="${esc(p.name)}" fetchpriority="high" decoding="async"></div>`
    : `<div class="pp-portrait pp-portrait--mono"><span class="pp-portrait__mono" aria-hidden="true">${esc(p.monogram)}</span></div>`;

  /* Full height only where there is enough to fill it. A sparse record
     was being centred in a 100svh box and leaving a visible hole under
     it; a page with little to say should be short, not padded out. */
  const bar = factbar(p);
  const barItems = [p.city, p.experience, p.discipline].filter(Boolean).length
                 + (p.links || []).length + (bar ? 3 : 0);
  const tall = p.brief && barItems >= 3;

  return `    <header class="pp-hero${tall ? ' pp-hero--tall' : ''}" id="profile">
      <!-- MOBILE HERO OVERLAY: glass Back + Share pills over the hero.
           Fixed-positioned, fades out on body[data-past-image] once the
           portrait leaves the viewport; the sticky bottom bar picks up
           Back + Share from that point onward. Desktop hides these via
           the shared topbar CSS. Do NOT drop this block — the mobile
           navigation contract is: hero-overlay (before scroll) ->
           sticky-contact 3-part (after scroll), and losing either half
           strips the reader of any way back to /people on a phone. -->
      <div class="bpr-hero__overlay" aria-label="Hero actions">
        <a href="/people" class="bpr-hero__overlay-btn" aria-label="Back to People">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </a>
        <button type="button" class="bpr-hero__overlay-btn" data-brand-share data-brand="${esc(p.name)}" aria-label="Share this profile" title="Share">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
      <div class="pp-hero__grid">
        <div class="pp-portrait-wrap pp-rise">${portrait}</div>
        <div class="pp-hero__id">
          <div class="pp-hero__head">
            <p class="pp-badge pp-rise" style="--d:70ms">${esc(CATEGORIES[p.catId])}</p>
            <h1 class="pp-name pp-rise" style="--d:130ms">${esc(p.name)}</h1>
            <p class="pp-role pp-rise" style="--d:200ms">${roleLine(p)}</p>
${idfacts(p, (p.figures || []).length >= 2)}
          </div>
${p.brief ? `          <div class="pp-brief pp-rise" style="--d:290ms"><p>${esc(p.brief)}</p></div>` : ''}
${figures(p)}
          <!-- THE ACTION LIVES IN THE BAR, not here. It used to be a
               filled pill 30px under the name, which meant the reader met
               "Get in touch" twice on the first screen once the bar
               carried it too, and the hero's copy of it scrolled away
               exactly when a reader who had finished reading might want
               it. The bar's copy is always there, so the hero keeps only
               the quiet half of this row: the ways to reach them. -->
          <div class="pp-actions pp-rise" style="--d:390ms">
${reach(p)}
          </div>
        </div>
      </div>
<!-- The bar CLOSES the hero rather than following it: it spans both
     columns, so it belongs to the header and gives the block a bottom
     edge instead of trailing off into white under the portrait. -->
${bar}
    </header>`;
}

/* ── work, as an index ───────────────────────────────────────────
   Rows read, the held panel shows. Rows are NOT links: there is no
   project page to land on, and pointing them at /brands/{slug}#work
   ejected a reader out of the profile onto the practice's page.

   THREE RENDER MODES, chosen by what the record holds, because across
   twenty categories one layout cannot be right for everyone:

     index    at least one item ships an image. List plus held panel
     bare     items exist, no photography. The list takes the full
              measure and the kind moves to the far right of the row.
              This is the COMMON case in a directory, not a fallback
     gallery  opt-in via workMode, for people whose work IS the image

   And a fourth state that is not a mode: no work[] at all, so no
   section, no band and no tab, since the bar is built from the sections
   that rendered. */
function work(p) {
  if (!p.work?.length) return '';
  const items   = p.work;
  const hasArt  = items.some(w => w.image);
  const label   = p.workLabel || 'Selected work';
  const credit  = p.workCredit || (p.company ? `Delivered with ${p.company.name}.` : '');
  const firstArt = items.find(w => w.image);
  const mode = (p.workMode === 'gallery' && hasArt) ? 'gallery' : hasArt ? 'index' : 'bare';

  const body = mode === 'gallery'
    ? `        <div class="pp-work pp-rise">
${items.filter(w => w.image).map(w => `          <figure class="pp-work__item">
            <div class="pp-work__media"><img src="${w.image}" alt="${esc(w.title)}" loading="lazy" decoding="async"></div>
${w.title || w.meta ? `            <figcaption class="pp-work__cap">
${w.title ? `              <h3 class="pp-work__title">${esc(w.title)}</h3>` : ''}
${w.meta ? `              <p class="pp-work__meta">${esc(w.meta)}</p>` : ''}
            </figcaption>` : ''}
          </figure>`).join('\n')}
        </div>`
    : `        <div class="pp-idx${hasArt ? '' : ' pp-idx--bare'}"${hasArt ? ' data-pp-index' : ''}>
          <ul class="pp-idx__list pp-rise">
${items.map((w, i) => `            <li><div class="pp-idx__row" data-i="${i}"${hasArt ? ' tabindex="0"' : ''}>
              <span class="pp-idx__n">${String(i + 1).padStart(2, '0')}</span>
              <span class="pp-idx__t">${esc(w.title)}</span>
${w.meta ? `              <span class="pp-idx__m"><span>${esc(w.meta)}</span></span>` : ''}
${w.image ? `              <span class="pp-idx__thumb"><img src="${w.image}" alt="" loading="lazy" decoding="async"></span>` : ''}
            </div></li>`).join('\n')}
          </ul>
${hasArt ? `          <div class="pp-hold pp-rise" aria-hidden="true">
            <div class="pp-hold__frame">
${items.filter(w => w.image).map((w, i) => `              <img src="${w.image}" alt=""${i === 0 ? ' class="is-on"' : ''} data-i="${items.indexOf(w)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">`).join('\n')}
            </div>
            <div class="pp-hold__cap"><span data-hold-name>${esc(firstArt.title)}</span><span data-hold-meta>${esc(firstArt.meta || '')}</span></div>
          </div>` : ''}
        </div>`;

  return `
      <section class="pp-sec" id="work" aria-labelledby="work-h">
        <div class="pp-sec__head pp-rise">
          <h2 class="pp-sec__title" id="work-h">${esc(label)}</h2>
${credit ? `          <p class="pp-sec__note">${esc(credit)}</p>` : ''}
        </div>
${body}
      </section>`;
}

/* ── recognition ─────────────────────────────────────────────────
   CONFERRED, never claimed. An award, an appointment, a term served, an
   honour: things a third party gave this person, which is what makes
   the block worth having and also what makes it the most dangerous one
   on the page. Every entry comes from the record and nothing is
   inferred from a job title.

   Empty on a record with nothing verified, and that is the ordinary
   case rather than the failure: most people in a directory have never
   been given an award, and a profile that implies otherwise by leaving
   a heading over an empty column is worse than one that says nothing.

   year is optional, source is optional. "Appointed to the DCPR review
   committee" with neither is a complete entry; demanding a year would
   invite one to be guessed. */
const recognition = p => !(p.recognition || []).length ? '' : `
              <div class="pp-recog">
                <p class="pp-recog__label">Recognition</p>
                <ul class="pp-recog__list">
${p.recognition.map(r => `                  <li${r.year ? '' : ' class="is-undated"'}>
${r.year ? `                    <span class="pp-recog__y">${esc(r.year)}</span>` : ''}
                    <div>
                      <h4 class="pp-recog__t">${esc(r.title)}</h4>
${r.source ? `                      <p class="pp-recog__s">${esc(r.source)}</p>` : ''}
                    </div>
                  </li>`).join('\n')}
                </ul>
              </div>`;

/* ── about ───────────────────────────────────────────────────────
   The aside is what sticks now, not the statement inside it. Making
   the statement sticky and adding the areas as a sibling would have
   scrolled the areas up underneath it; they are one panel and they
   travel together. */
const about = p => !p.about?.length ? '' : `
      <section class="pp-sec" id="story" aria-labelledby="story-h">
        <!-- A LABEL, not a display title. "About Tarun Motta" was set in
             Gazpacho at 38px immediately above a Gazpacho statement at
             36px: two display blocks of one family stacked, and the
             lower one wrapped further so it read as the bigger of the
             two. The heading was the half worth cutting. The name is
             already at 60px one screen up, and the bar tab already reads
             About, so the section loses nothing by being marked rather
             than announced. -->
        <div class="pp-sec__head pp-rise">
          <p class="pp-sec__eyebrow" id="story-h">About</p>
        </div>
        <!-- Neither a statement NOR recognition on record: the prose
             takes the whole measure rather than sitting in the
             right-hand half beside an empty column, which is what an
             unconditional two-column grid did. Both are fields a
             directory will often lack, so their absence has to be the
             graceful case. The test used to name the areas, which have
             moved up to the hero. -->
        <div class="pp-about${p.statement || (p.recognition || []).length ? '' : ' pp-about--solo'}">
${p.statement || (p.recognition || []).length ? `          <div class="pp-about__aside pp-rise">
${p.statement ? `            <p class="pp-about__statement">${esc(p.statement)}</p>` : ''}
${recognition(p)}
          </div>` : ''}
          <div class="pp-about__prose pp-rise" style="--d:120ms">
${p.about.map(par => `            <p>${esc(par)}</p>`).join('\n')}
          </div>
${facts(p)}
        </div>
      </section>`;

function published(p) {
  if (!p.content?.length) return '';

  const groups = CONTENT_GROUPS
    .map(([key, label]) => [key, label, p.content.filter(c => c.group === key)])
    .filter(([, , items]) => items.length);
  if (!groups.length) return '';

  /* THE COLOURED CARD IS INTELLIGENCE'S, AND ONLY INTELLIGENCE'S.

     It briefly rendered for anything we had no photograph of, which put
     a tinted title card under a Voices op-ed and under a feature. The
     tint is not a "no image" treatment, it is Intelligence's identity:
     those articles are published without hero imagery by design and the
     rotating canvas is what carries the category. Borrowing it for other
     desks dilutes the one place it means something.

     `card: 'intel'` on an item forces it; otherwise the research group
     gets it, because that is the group Intelligence publishes into. */
  const isIntel = c => (c.card ? c.card === 'intel' : c.group === 'research');

  /* No still? The chassis already answers that: .bpr-mcard__media--gfx,
     a warm-white panel in place of the photograph, documented in the
     brand file as the fallback "when the source article has no usable OG
     image". It carries the source in Gazpacho the way a masthead plate
     would, rather than a category glyph it would have to claim.

     This is the ONE thing here the brand pages do not exercise: every
     card on a brand microsite happens to ship with a picture. A person
     will routinely have a Voices op-ed that does not, and the answer to
     that is never a borrowed photograph.

     The body then DROPS its eyebrow, or the same line renders twice: the
     first version set "Presented by TEEARCH" at 24px in the plate and
     again at 10px directly beneath it. */
  const media = c => c.image
    ? `            <div class="bpr-mcard__media">
              <img src="${c.image}" alt="" loading="lazy" decoding="async">
              <span class="bpr-mcard__type">${esc(c.type)}</span>
            </div>`
    : `            <div class="bpr-mcard__media bpr-mcard__media--gfx">
              <span class="pp-gfx">${esc(c.meta || c.type)}</span>
              <span class="bpr-mcard__type">${esc(c.type)}</span>
            </div>`;

  /* Markup copied from the shipped brand microsite, tag for tag: a
     media card is a direct <a> child of .bpr-spot-group__grid, an
     Intelligence card is an <a> inside an <li> of .bpr-intel-grid. Two
     containers rather than one because that is what the two card types
     already have, and folding them into a single <ul> meant adapter
     rules on this page that exist nowhere else in the portal.

     Only the heading LEVEL differs: h4, not the brand file's h3. Its
     sub-group label is an h3 and so is its card title, which puts two
     siblings at the same level; here the section is h2, the label h3,
     so the card is h4 and the outline reads correctly. */
  const mcard = c => `          <a class="bpr-mcard${c.video ? ' bpr-mcard--video' : ''}" href="${c.href}">
${media(c)}
            <div class="bpr-mcard__body">
${c.image || c.duration ? `              <span class="bpr-mcard__eyebrow">${esc([c.image ? c.meta : '', c.duration].filter(Boolean).join(' · '))}</span>` : ''}
              <h4 class="bpr-mcard__title">${esc(c.title)}</h4>
            </div>
          </a>`;

  /* Per-category watermark drawn top-right of the card. Copied
     BYTE-IDENTICAL from the finalized brand-profile intel cards
     (see brand-profile-teearch.html lines ~7047-7108) so person
     profiles render exactly the same marks the brand profiles do.
     Do NOT edit or re-author these — if the brand pattern updates,
     copy the new version here verbatim. Colours are the canonical
     Ghar.tv theme palette (sage / turmeric / terracotta / indigo)
     that the brand-profile intel cards ship with. */
  const INTEL_MARKS = {
    Ranking:  `<svg viewBox="0 0 240 140" fill="none">
                  <rect x="50" y="74" width="42" height="44" fill="#9aa96d"/>
                  <rect x="100" y="38" width="42" height="80" fill="#eda41c"/>
                  <rect x="150" y="58" width="42" height="60" fill="#d5613a"/>
                  <text x="71" y="105" text-anchor="middle" font-family="Gazpacho,Georgia,serif" font-size="22" font-weight="700" fill="#ffffff">2</text>
                  <text x="121" y="86" text-anchor="middle" font-family="Gazpacho,Georgia,serif" font-size="32" font-weight="700" fill="#ffffff">1</text>
                  <text x="171" y="98" text-anchor="middle" font-family="Gazpacho,Georgia,serif" font-size="20" font-weight="700" fill="#ffffff">3</text>
                  <line x1="36" y1="118" x2="206" y2="118" stroke="#e0c199" stroke-width="1"/>
                  <path d="M 121 12 L 124 22 L 134 22 L 126 28 L 129 38 L 121 32 L 113 38 L 116 28 L 108 22 L 118 22 Z" fill="#eda41c" stroke="#e0c199" stroke-width="1" stroke-linejoin="round"/>
                </svg>`,
    Analysis: `<svg viewBox="0 0 240 140" fill="none">
                  <circle cx="118" cy="60" r="46" fill="#ffffff" fill-opacity="0.7" stroke="#5f71a9" stroke-width="2.4"/>
                  <line x1="86" y1="44" x2="150" y2="44" stroke="#5f71a9" stroke-width="1" stroke-dasharray="3 3" opacity="0.45"/>
                  <line x1="86" y1="60" x2="150" y2="60" stroke="#5f71a9" stroke-width="1" stroke-dasharray="3 3" opacity="0.45"/>
                  <line x1="86" y1="76" x2="150" y2="76" stroke="#5f71a9" stroke-width="1" stroke-dasharray="3 3" opacity="0.45"/>
                  <polyline points="86,82 100,72 114,60 130,48 150,38" fill="none" stroke="#eda41c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="100" cy="72" r="2.6" fill="#eda41c"/>
                  <circle cx="114" cy="60" r="2.6" fill="#eda41c"/>
                  <circle cx="130" cy="48" r="2.8" fill="#eda41c"/>
                  <circle cx="150" cy="38" r="3.6" fill="#eda41c"/>
                  <line x1="152" y1="94" x2="190" y2="132" stroke="#5f71a9" stroke-width="6" stroke-linecap="round"/>
                </svg>`,
    Legal:    `<svg viewBox="0 0 240 140" fill="none">
                  <rect x="48" y="34" width="58" height="80" rx="5" fill="#ffffff" stroke="#e0c199" stroke-width="3"/>
                  <rect x="78" y="26" width="58" height="80" rx="5" fill="#ffffff" stroke="#e0c199" stroke-width="3"/>
                  <rect x="108" y="18" width="58" height="80" rx="5" fill="#ffffff" stroke="#5f71a9" stroke-width="4"/>
                  <rect x="120" y="34" width="34" height="6" rx="3" fill="#5f71a9" opacity=".5"/>
                  <rect x="120" y="48" width="34" height="6" rx="3" fill="#5f71a9" opacity=".5"/>
                  <rect x="120" y="62" width="22" height="6" rx="3" fill="#5f71a9" opacity=".5"/>
                  <circle cx="176" cy="96" r="30" fill="#eda41c"/>
                  <polyline points="164,96 172,105 190,84" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
  };
  /* Types the brand-profile pattern doesn't ship a mark for
     (e.g. "Cited in" on person profiles) render without a mark
     rather than a made-up one. */
  const intelMark = t => INTEL_MARKS[t] || '';

  const intelcard = c => `            <li><a class="bpr-intel-card" href="${c.href}">
              <span class="bpr-intel-card__type">${esc(c.type)}</span>
              <span class="bpr-intel-card__mark" aria-hidden="true">${intelMark(c.type)}</span>
              <h4 class="bpr-intel-card__title">${esc(c.title)}</h4>
              <span class="bpr-intel-card__foot">
                <span>${esc(c.meta)}</span>
                ${INTEL_ARROW}
              </span>
            </a></li>`;

  /* Every group is a rail with a paginator, exactly as the brand pages
     ship it. Nothing decides here whether the arrows are needed: the
     shared chassis toggles .is-overflowing on the outer and the
     stylesheet hides the paginator when the cards fit, which is most
     people, because two or three fit.

     RESTORED. This was rewritten to drop the labels and the rail below
     four items and to choose the card type per item rather than per
     group. Unasked for, on a section that was working, in a turn whose
     brief was something else. Deciding here what the shared chassis
     already decides at runtime is also how a page drifts away from the
     portal, and the whole reason this section is brand markup tag for
     tag is that Ghar.tv content looks the same wherever it appears. */
  const group = ([key, label, items]) => {
    const intel = items.every(isIntel);
    const track = intel
      ? `          <ul class="bpr-intel-grid rail">
${items.map(intelcard).join('\n')}
          </ul>`
      : `          <div class="bpr-spot-group__grid rail">
${items.map(mcard).join('\n')}
          </div>`;

    return `        <div class="bpr-spot-group pp-rise">
          <div class="bpr-spot-group__head">
            <h3 class="bpr-spot-group__label">${label}</h3>
            <div class="dc-paginator">
              <button type="button" class="dc-page-btn dc-page-btn--prev" aria-label="Previous">${PAG_PREV}</button>
              <button type="button" class="dc-page-btn dc-page-btn--next" aria-label="Next">${PAG_NEXT}</button>
            </div>
          </div>
          <div class="bpr-carousel rail-outer">
${track}
          </div>
        </div>`;
  };

  /* THE TITLE IS FOR THE READER, NOT FOR US.

     "Published and recorded" went first: accurate, and the language of
     a content ledger. "Read and watch" went next: an instruction, and
     it told the reader to do two things when a report is neither.
     "Spotlight" lasted longest and is the same mistake in better
     clothes. It is a media-kit word. It describes what the PLATFORM is
     doing for this person, which is the one point of view a reader does
     not hold, and the last one the subject of the page should be shown
     holding about themselves.

     "On Ghar.tv" is simply where these things are. It states a fact, it
     reads the same to a visitor and to the person whose page it is, and
     it does the one job this title has: separate our published record
     of them from the work above it, which is theirs. */
  return `
      <section class="pp-sec" id="published" aria-labelledby="published-h">
        <div class="pp-sec__head pp-rise">
          <h2 class="pp-sec__title" id="published-h">On Ghar.tv</h2>
        </div>
${groups.map(group).join('\n')}
      </section>`;
}


/* ── the foot: colleagues and the claim ─────────────────────────
   The peers are the co-founder answer: partners of one practice link to
   each other rather than competing for a single slot on a ranked list.

   THE AREAS OF WORK ARE NOT HERE ANY MORE. They were parked in this
   block on the reasoning that a taxonomy belongs with the other exits,
   and that was wrong on every axis: they are a claim about what the
   person does, which is About's subject, and putting them last meant
   they arrived after the reader had already been asked to get in touch.
   They now sit in the About aside, under the statement.

   Labels, not section titles. These are footnotes on someone's own
   page: useful, and not chapters about them. */
function foot(p, all) {
  /* Record peers link to their /people page. An external peer is a
     colleague with no page here: same card, their verified profile. */
  const list = [
    ...(p.company ? all.filter(x => x.slug !== p.slug && x.company?.slug === p.company.slug) : []),
    ...(p.company ? p.externalPeers || [] : []),
  ];
  if (!list.length) return '';

  const groups = [];

  if (list.length) {
    groups.push(`        <div class="pp-minor__group">
          <p class="pp-minor__label" id="team-h">Also at ${esc(p.company.name)}</p>
          <div class="pp-peers pp-rise">
${list.map(x => `            <a class="pp-peer" ${x.href ? `href="${x.href}" target="_blank" rel="noopener noreferrer"` : `href="/people/${x.slug}"`}>
              <span class="pp-peer__face">${x.portrait
                ? `<img src="${x.portrait}" alt="" loading="lazy" decoding="async">`
                : `<span aria-hidden="true">${esc(x.monogram)}</span>`}</span>
              <span class="pp-peer__id">
                <span class="pp-peer__name">${esc(x.name)}</span>
                <span class="pp-peer__role">${esc(x.role)}</span>
                <span class="pp-badge pp-badge--sm">${esc(CATEGORIES[x.catId])}</span>
              </span>
            </a>`).join('\n')}
          </div>
        </div>`);
  }

  return `
      <section class="pp-sec pp-sec--minor"${list.length ? ' id="team" aria-labelledby="team-h"' : ''}>
${groups.join('\n')}
      </section>`;
}

/* ── page ─────────────────────────────────────────────────────────── */
function render(p, all) {
  const title = `${p.name} | ${p.role}${p.company ? ', ' + p.company.name : ''} | Ghar.tv`;
  const desc  = p.brief ? p.brief.slice(0, 155) : `${p.name}, ${p.role}${p.company ? ' at ' + p.company.name : ''}.`;
  /* A record can render as a monogram while a real portrait file sits in
     brand_assets/people/ (not yet cropped for the hero). Share cards still
     use the photo: a logo preview for a named person reads as broken. */
  const ogFile = p.portrait || (existsSync(ROOT + `brand_assets/people/${p.slug}.jpg`) ? `brand_assets/people/${p.slug}.jpg` : null);
  const ogImg = ogFile ? 'https://www.ghar.tv/' + ogFile : 'https://www.ghar.tv/imgbo/logoog.png';

  /* Page-identifying tags in the shell's head. The title pattern is
     line-anchored and forbids < inside, because the head can carry a
     comment that mentions the tag. */
  const setHead = html => html
    .replace(/^([ \t]*)<title>[^<]*<\/title>/m, (_, ind) => `${ind}<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, () => `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical"[^>]*>/, () => `<link rel="canonical" href="https://www.ghar.tv/people/${p.slug}">`)
    .replace(/<meta property="og:type"[^>]*>/, () => `<meta property="og:type" content="profile">`)
    .replace(/<meta property="og:title"[^>]*>/, () => `<meta property="og:title" content="${esc(p.name)} | Ghar.tv">`)
    .replace(/<meta property="og:description"[^>]*>/, () => `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url"[^>]*>/, () => `<meta property="og:url" content="https://www.ghar.tv/people/${p.slug}">`)
    .replace(/<meta property="og:image"[^>]*>/, () => `<meta property="og:image" content="${ogImg}">`)
    .replace(/<meta name="twitter:title"[^>]*>/, () => `<meta name="twitter:title" content="${esc(p.name)} | Ghar.tv">`)
    .replace(/<meta name="twitter:description"[^>]*>/, () => `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace(/<meta name="twitter:image"[^>]*>/, () => `<meta name="twitter:image" content="${ogImg}">`);

  const knows = (p.topics || []).map(t => t.label);
  const jsonld = `{"@context":"https://schema.org","@type":"Person","name":${JSON.stringify(p.name)},"jobTitle":${JSON.stringify(p.role)},"url":"https://www.ghar.tv/people/${p.slug}"${p.company ? `,"worksFor":{"@type":"Organization","name":${JSON.stringify(p.company.name)},"url":"https://www.ghar.tv/brands/${p.company.slug}"}` : p.affiliation ? `,"worksFor":{"@type":"Organization","name":${JSON.stringify(p.affiliation)}}` : ''}${p.portrait ? `,"image":${JSON.stringify(ogImg)}` : ''}${knows.length ? `,"knowsAbout":${JSON.stringify(knows)}` : ''},"address":{"@type":"PostalAddress","addressLocality":${JSON.stringify(p.city)}}}`;

  /* The shell's chrome names its own person in exactly these places.
     Each swap asserts its hit count: a silent miss means a profile
     offers to contact or share somebody else. */
  const nameSwaps = (html, swaps, region) => {
    for (const [from, to, count] of swaps) {
      const hits = html.split(from).length - 1;
      if (hits !== count) throw new Error(`${region}: expected ${count}x ${from}, found ${hits} (${p.slug})`);
      html = html.split(from).join(to);
    }
    return html;
  };
  /* The parent brand's palette, or the neutral Ghar.tv one. A company whose
     page slug differs from its registry key names it in `palette`. */
  const palette = p.company ? (p.company.palette || p.company.slug) : 'ghar';
  if (!PALETTES[palette] && !palette.startsWith('{{')) throw new Error(`${p.slug}: no palette "${palette}" in scripts/brand-palettes.mjs`);
  /* DARK comes from the palette, never from the person or company record:
     a parent brand whose registry record says theme:'dark' gives every one
     of its people a dark page, and no second flag can drift from it.
     Guide: docs/AUTO-GENERATION-CONTRACT.md, "Person pages of a dark brand". */
  if (p.company && 'theme' in p.company) throw new Error(`${p.slug}: company.theme is retired, set theme:'dark' on the "${palette}" record in scripts/brand-palettes.mjs`);
  const dark = PALETTES[palette]?.theme === 'dark';
  const pre = nameSwaps(setHead(SHELL_PRE), [
    [`class="bpr-topbar__title">${SHELL_NAME}<`, `class="bpr-topbar__title">${esc(p.name)}<`, 1],
    [`data-brand="${SHELL_NAME}"`,              `data-brand="${esc(p.name)}"`,              2],
    [`data-palette="${SHELL_PALETTE}"`, `data-palette="${palette}"`, 1],
  ], 'shell head').replace(/(<script type="application\/ld\+json">\s*)[\s\S]*?(\s*<\/script>)/, (_, o, c) => o + jsonld + c);
  const post = nameSwaps(SHELL_POST, [
    [`id="brSharePreviewName">${SHELL_NAME}<`, `id="brSharePreviewName">${esc(p.name)}<`, 1],
    [`data-brand="${SHELL_NAME}"`,             `data-brand="${esc(p.name)}"`,             2],
  ], 'shell tail');

  for (const [label, needle] of [
    ['title',     `<title>${esc(title)}</title>`],
    ['canonical', `href="https://www.ghar.tv/people/${p.slug}"`],
    ['og:image',  `content="${ogImg}"`],
    ['json-ld',   jsonld],
  ]) {
    if (!pre.includes(needle)) throw new Error(`head: ${label} was not replaced for ${p.slug}`);
  }

  const workBlock  = work(p);
  const aboutBlock = about(p);
  const pubBlock   = published(p);
  const peersBlock = foot(p, all);

  return `${pre}<main id="main" class="bpr-page" data-brand-name="${esc(p.name)}"${p.portrait ? ` data-brand-share-image="/${p.portrait}"` : ''}${p.company ? ` data-parent-brand="${esc(p.company.slug)}"` : ''}${dark ? ` data-theme="dark"` : ''}>

  <div class="pp-wrap">
${hero(p, all)}
  </div>
  <div class="pp-wrap">
${aboutBlock}
  </div>
${workBlock || pubBlock ? `  <!-- ONE BAND for both. Work and Spotlight are the same kind of
       surface, made of photographs and cards, so they share a single
       change of ground rather than taking a stripe each. The page reads
       as three movements: the person on white, their output on warm,
       the way out on white. -->
  <div class="pp-band">
    <div class="pp-wrap">
${[workBlock, pubBlock].filter(Boolean).join('\n')}
    </div>
  </div>` : ''}
  <div class="pp-wrap">
${peersBlock}

    <!-- Closing dark card (.pp-contact). Emits the RICH pattern —
         dark ink card with a warm rust glow, cream typography, eyebrow
         + split-line title + description + tenant meta. Portal CSS
         (styles.css, body:is(.pp-page, [data-brand-format]) #contact
         .pp-contact__inner) paints the dark treatment; here we just
         emit the markup. The old lightweight .pp-closer block was
         swapped out. -->
    <section class="pp-contact" id="contact" aria-labelledby="ppContactTitle">
      <div class="pp-contact__inner pp-rise">
        <div class="pp-contact__body">
          <p class="pp-contact__eye">Get in touch</p>
          <h2 class="pp-contact__title" id="ppContactTitle"><span class="pp-contact__title-lead">Work with</span><span class="pp-contact__title-name">${esc(p.name)}</span></h2>
          <p class="pp-contact__lead">Send a note about a project, a commission, or a conversation worth recording. Nothing is published without your say.</p>
          <ul class="pp-contact__meta" data-pp-contact-meta aria-label="Direct contact"></ul>
        </div>
        <div class="pp-contact__cta">
          <button type="button" class="jm-btn jm-btn--primary pp-contact__cta-btn" data-brand-contact data-brand="${esc(p.name)}">
            Get in touch
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  </div>

${SHELL_MICROFOOTER}</main>${post}`;
}

/* ── the TEMPLATE ─────────────────────────────────────────────────── */
const TEMPLATE_COMPANY = {
  name: '{{COMPANY_NAME}}', slug: '{{COMPANY_SLUG}}', logo: '{{COMPANY_LOGO_PATH}}',
  line: '{{COMPANY_ONE_LINE}}',
};
const TEMPLATE = {
  slug: '{{SLUG}}', name: '{{FULL_NAME}}', monogram: '{{INITIALS}}', tier: 'lead',
  role: '{{ROLE}}', portrait: '{{PORTRAIT_PATH}}',
  /* Real key, not a token: the eyebrow is DERIVED from it, so a
     placeholder would render an empty first line. */
  catId: 'architects',
  discipline: '{{QUALIFICATION}}', experience: '{{YEARS_IN_PRACTICE}}',
  city: '{{CITY}}', claimed: true, brief: '{{BRIEF_TWO_SENTENCES}}',
  figures: [{ value: '{{FIGURE}}', label: '{{FIGURE_LABEL}}' },
            { value: '{{FIGURE}}', label: '{{FIGURE_LABEL}}' }],
  /* About must be present or the template ships without the section,
     and the credentials render INSIDE it, so their REPEAT fence would
     go missing with it. That is exactly how this build once broke. */
  statement: '{{STATEMENT_TWELVE_WORDS_MAX}}',
  about: ['{{ABOUT_PARAGRAPH_1}}', '{{ABOUT_PARAGRAPH_2}}'],
  facts:  [{ label: '{{FACT_LABEL}}', value: '{{FACT_VALUE}}' }],
  topics: [{ label: '{{TOPIC}}', href: '{{TOPIC_HREF_OR_NULL}}' }],
  /* Delete the array where nothing has been conferred. Leaving a
     placeholder in is how an invented award ships. */
  recognition: [{ year: '{{RECOGNITION_YEAR}}', title: '{{RECOGNITION_TITLE}}',
                  source: '{{RECOGNITION_SOURCE}}' }],
  company: TEMPLATE_COMPANY,
  work:    [{ title: '{{WORK_TITLE}}', meta: '{{WORK_META}}', image: '{{WORK_IMAGE_PATH}}' }],
  /* THREE items on purpose, one per card type the section can produce:
     a media card with a still, the same card with the masthead plate
     where no still exists, and the tinted Intelligence card, which is
     the ONLY place the tint is allowed. */
  content: [{ group: 'conversations', type: '{{CONTENT_TYPE}}', video: true,
              image: '{{CONTENT_IMAGE_PATH}}', duration: '{{DURATION}}',
              title: '{{VIDEO_TITLE}}', href: '{{VIDEO_HREF}}', meta: '{{VIDEO_META}}' },
            { group: 'writing', type: '{{CONTENT_TYPE}}', image: null,
              title: '{{CONTENT_TITLE}}', href: '{{CONTENT_HREF}}', meta: '{{CONTENT_META}}' },
            { group: 'research', type: '{{INTEL_TYPE}}', image: null,
              title: '{{INTEL_TITLE}}', href: '{{INTEL_HREF}}', meta: '{{INTEL_META}}' }],
};
/* A second record so the template's peer grid renders with a card in it. */
const TEMPLATE_PEER = {
  slug: '{{PEER_SLUG}}', name: '{{PEER_NAME}}', monogram: '{{PEER_INITIALS}}',
  role: '{{PEER_ROLE}}', portrait: '{{PEER_PORTRAIT_PATH}}', city: '{{PEER_CITY}}',
  catId: 'architects', topics: [{ label: '{{PEER_TOPIC}}', href: null }],
  company: TEMPLATE_COMPANY,
};

const HANDOFF = `<!--
  ===================================================================
  PERSON PROFILE TEMPLATE  ·  /people/{slug}
  Generated by scripts/build-person-profiles.mjs (npm run build:people).
  DO NOT hand-edit: edit the generator and re-run, or this drifts from
  the live pages. Both come from the same render().

  REVIEW THE STATES PAGE, NOT ONE PERSON
    _dev/templates/person-profile-states.html renders every data-gated
    state in one scroll from the same functions. Half of this template
    only appears for records that trigger it, so a single live profile
    shows perhaps a third of the design.

  ONE TEMPLATE, TWO HUNDRED PEOPLE
    Only four fields can be assumed of everyone: a name, a portrait or
    monogram, what they do and for whom, and a city. Architects arrive
    with photography and a registration; economists with neither and a
    long publication list; brokers, creators and founders with different
    combinations again. So the HERO is built from those four alone and
    every other block is a module that has to vanish cleanly.

  ONE PALETTE FOR EVERYONE, deliberately not per-profile. The brand
  microsites theme per tenant because that page IS the brand's house. A
  person page is a page in our directory: most people have no brand, and
  inheriting an employer's hex paints a paid caste across the directory.
  The portrait is the colour; everything else is white, warm-white, ink
  and hairlines.

  SURFACES: the page is WHITE, all of it. Structure comes from rules
  and space, never from tinted bands. The closer is a bordered white
  panel, NOT a dark slab. The only tint on the page is the Intelligence
  card, which is a card carrying its own identity, not a surface.

  RECORD
    slug, name, monogram (initials), role, portrait (path or null), city
    catId       REQUIRED. The /people directory category, one of:
                ${Object.keys(CATEGORIES).join(' | ')}
                The hero eyebrow is derived from it and renders as a
                FIELD ("Architecture"), never a personal title
                ("Architect"), which would be a claim about the person's
                registration that we would be making for them.
    discipline  the QUALIFICATION, short form. Hero fact list. Optional
    experience  "44 years in practice". Optional
    figures[]   { value, label } two to four. REAL numbers from the
                record only: never derived, never rounded up, never a
                tally of the sections below. Fewer than two and the
                block does not draw
    claimed     bool. Renders one line of small print at the FOOT, not a
                badge by the name: nearly everyone arriving through
                Brand Connect is confirmed by default, so a check on 95%
                of pages says nothing and marks the other 5% as doubtful
    brief       TWO sentences. Three restated About; one looked clipped
    facts[]     { label, value } credential pairs, rendered at the END
                OF THE ABOUT PROSE. For the LONG ones a meta line cannot
                hold: statutory registrations, memberships
    statement   one claim, TWELVE WORDS OR FEWER, asserted at build
    topics[]    { label, href }. Rendered in the ABOUT ASIDE as "Areas
                of work", as ruled rows and never as chips. href ONLY
                where the tag has a real landing page
    links[]     { kind, label, href } reach and social, max five. kinds:
                web | email | linkedin | instagram | youtube | x |
                facebook. VERIFIED URLS ONLY
    company     { name, slug, logo, line, palette? } or null. Color comes
                from scripts/brand-palettes.mjs under palette || slug,
                and so does DARK: theme:'dark' on that palette record
                stamps data-theme="dark". No theme field here (build fails)
    affiliation plain string for someone with no tenant brand
    work[]      { title, meta, image }
    workLabel   "Selected work" by default. Say what it IS
    workMode    'gallery' to opt into the plate grid. Otherwise derived
    externalPeers[] { name, monogram, role, catId, href } a colleague
                with no page of their own, after the record peers.
                href is a VERIFIED external profile, opened in a new tab
    content[]   { group, type, title, href, meta, image, video, duration }
                group is one of: ${CONTENT_GROUPS.map(g => g[0]).join(' | ')}
                An image WE OWN makes it a media card; without one it
                takes the masthead plate. The TINTED card is
                Intelligence's alone: group 'research', or card:'intel'

  WORK RENDERS THREE WAYS
    index    an item has an image: list plus held panel
    bare     items, no photography: full measure, kind on the right.
             The COMMON case across a directory, not a fallback
    gallery  workMode:'gallery', for people whose work IS the image

  EMPTY BEHAVIOUR, load-bearing
    company null   firm byline and peer block omitted; use affiliation
    work []        the work section omitted
    topics []      "Areas of work" omitted from the About aside
    content []     Spotlight omitted. NORMAL for a new person
    figures < 2    the figures block omitted
    brief null     brief omitted
    portrait null  Gazpacho monogram, in the hero AND in peer cards.
                   NEVER a stock, generic or stand-in face
    no peers       "Also at ..." omitted
    sparse hero    no .pp-hero--tall, so a thin record renders SHORT
    Every tab is built from the sections that actually rendered

  MOTION
    .pp-rise elements animate in on scroll. The hidden state applies only
    under body.pp-anim, which JS adds on boot, so a failed script leaves
    the page fully visible. prefers-reduced-motion disables it.
  ===================================================================
-->
`;

function toTemplate(html) {
  const fences = [
    ['fact',          /<div class="pp-fact"[\s\S]*?<\/div>/],
    ['figure',        /<div class="pp-fig">\n[\s\S]*?<\/div>/],
    /* One specialisation is one cell of the bar that closes the hero. */
    ['topic',         /<div class="pp-fb__cell">\n[\s\S]*?<\/div>/],
    ['idfact',        /<li>[\s\S]{0,400}?\{\{CITY\}\}<\/li>/],
    ['recognition',   /<li>\n\s*<span class="pp-recog__y">[\s\S]*?<\/li>/],
    /* The template record ships photography, so its work section is the
       index. The bare and gallery modes have no fence here; the states
       page is where those are shown. */
    ['work',          /<li><div class="pp-idx__row"[\s\S]*?<\/li>/],
    /* Two content fences, because the section renders two kinds of card
       and a generator working from this template has to see both. */
    ['content-media', /<a class="bpr-mcard bpr-mcard--video"[\s\S]*?<\/a>\n/],
    ['content-plate', /<a class="bpr-mcard"[\s\S]*?<\/a>\n/],
    ['content-intel', /<li><a class="bpr-intel-card"[\s\S]*?<\/li>/],
    ['peer',          /<a class="pp-peer"[\s\S]*?<\/a>/],
  ];
  for (const [name, re] of fences) {
    const m = re.exec(html);
    if (!m) throw new Error('template fence not found: ' + name);
    html = html.replace(re, `<!-- REPEAT ${name} start -->${m[0]}<!-- REPEAT ${name} end -->`);
  }
  /* A build artifact must never be indexed or read as a real person. */
  html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow">')
             .replace(/\n?\s*<link rel="canonical"[^>]*>/, '')
             .replace(/\n?\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  return html.replace(/^<!DOCTYPE html>/i, '<!DOCTYPE html>\n' + HANDOFF);
}


/* ═══════════════════════════════════════════════════════════════════
   THE STATES PAGE  ·  _dev/templates/person-profile-states.html

   Half the layouts here are DATA-GATED: bare work, the gallery, the
   masthead plate, the short hero, the empty cases. None of them appear
   on a live record that does not happen to trigger them, so three of
   them once shipped looking like "no change" while the only page anyone
   was checking was a single architect's.

   A reviewer cannot approve a template by reading one instance of it,
   and the token template next door is unreadable as a design because
   every string in it is {{SHOUTING}}. This page renders EVERY state, in
   one scroll, from the SAME section functions the live pages use.

   NOT A PERSON. Every record below is a labelled placeholder and the
   names are the states themselves.
   ═══════════════════════════════════════════════════════════════════ */
const SHOT = 'brand_assets/brand-photos/';
const STATES = [
  ['Hero · full record',
   'Brief, figures, facts and reach. Passes the .pp-hero--tall test, so it holds the screen.',
   { name: 'Complete Record', monogram: 'CR', role: 'Managing Director', catId: 'architects',
     discipline: 'Civil Engineer', experience: '44 years in practice', city: 'Mumbai',
     portrait: SHOT + 'teearch-project-1.png',
     figures: [{ value: 'Since 1982', label: 'Leading the practice' },
               { value: '44', label: 'Years in the discipline' },
               { value: '226 lakh', label: 'Sq ft on the largest mandate' }],
     brief: 'One sentence that places the person, and a second that says what the work is. The history belongs to About.',
     links: [{ kind: 'web', label: 'example.in', href: '#' },
             { kind: 'linkedin', label: 'in/example', href: '#' },
             { kind: 'email', label: 'hello@example.in', href: '#' }] }],

  ['Hero · sparse record, no portrait',
   'No figures, no qualification, no years, no reach, no company. Gazpacho monogram, one fact, and NO full-height hero: a thin record renders short instead of centred above a hole.',
   { name: 'Minimum Record', monogram: 'MR', role: 'Professor, Urban Studies', catId: 'research',
     affiliation: 'A University', city: 'Ahmedabad', portrait: null,
     brief: 'The least a record can carry and still make a page.', links: [] }],

  ['Work · index, with the held panel',
   'At least one item ships an image. The rows read and the panel beside them swaps on hover; the rows are not links, because there is no project page to land on.',
   { work: [{ title: 'First project', meta: 'Mumbai', image: SHOT + 'teearch-project-1.png' },
            { title: 'Second project', meta: 'Mumbai', image: SHOT + 'teearch-project-2.png' },
            { title: 'Third project', meta: 'Mumbai', image: SHOT + 'teearch-project-3.png' }] }],

  ['Work · bare, no photography',
   'The COMMON case across a directory, not a fallback: brokers, advisors, lawyers, journalists. The kind moves to the far right of the row so the width is doing work.',
   { workLabel: 'Selected reporting',
     work: [{ title: 'First piece', meta: 'Long read' },
            { title: 'Second piece', meta: 'Investigation' },
            { title: 'Third piece', meta: 'Explainer' }] }],

  ['Work · gallery, opt-in',
   'workMode: gallery, for people whose work IS the image. A 4:5 frame because the source material is shot upright, three across, caption under the plate.',
   { workMode: 'gallery', workLabel: 'Portfolio',
     work: [{ title: 'First plate', meta: 'Mumbai', image: SHOT + 'teearch-project-2.png' },
            { title: 'Second plate', meta: 'Mumbai', image: SHOT + 'teearch-project-3.png' },
            { title: 'Third plate', meta: 'Mumbai', image: SHOT + 'teearch-project-4.png' }] }],

  ['On Ghar.tv · the portal chassis, mixed kinds',
   'The brand microsite chassis, verbatim: a sub-group per kind, a Gazpacho label with a paginator, cards on the shared carousel. A media card where we own a still, the masthead plate where we do not, and the tinted card for Intelligence ALONE.',
   { content: [
      { group: 'conversations', type: 'Podcast', video: true, duration: '42 min',
        image: SHOT + 'teearch-project-1.png', title: 'A recorded conversation', href: '#', meta: 'GharTalks' },
      { group: 'conversations', type: 'Podcast', video: true, duration: '38 min',
        image: SHOT + 'teearch-project-2.png', title: 'A second recorded conversation', href: '#', meta: 'GharTalks' },
      { group: 'features', type: 'Feature', image: SHOT + 'teearch-project-3.png',
        title: 'A feature with a hero image we own', href: '#', meta: 'Editorial' },
      { group: 'writing', type: 'Op-ed', image: null,
        title: 'An argument, on the masthead plate', href: '#', meta: 'Industry Voices' },
      { group: 'research', type: 'Cited in', image: null,
        title: 'A report with no photography', href: '#', meta: 'Intelligence' } ] }],

  ['On Ghar.tv · one kind, two items',
   'The common case. One sub-group, two cards, and no paginator because the rail does not overflow. Nothing here is a carousel until the content makes it one.',
   { content: [
      { group: 'writing', type: 'Op-ed', image: null, title: 'First piece', href: '#', meta: 'Industry Voices' },
      { group: 'writing', type: 'Column', image: null, title: 'Second piece', href: '#', meta: 'Industry Voices' } ] }],

  ['Specialisations · no figures, so no bar',
   'The pills sit in the identity column and the fact bar is figures only, so a record with competences but nothing countable renders the pills and no bar at all. The two are independent.',
   { name: 'Specialised Record', brief: null,
     topics: [{ label: 'Redevelopment', href: null },
              { label: 'Liaisoning & statutory approvals', href: null },
              { label: 'Feasibility & TDR advisory', href: null }], links: [] }],

  ['About · statement, recognition and credentials',
   'A twelve-word statement holds the aside, recognition sits under it as year-and-entry rows, and long registrations render as definition pairs at the END of the prose. The aside sticks as one panel.',
   { name: 'Credentialled Record',
     statement: 'One claim, twelve words at most, the only display voice here.',
     recognition: [{ year: '2024', title: 'An award', source: 'The body that gave it' },
                   { year: '2021', title: 'A second award', source: 'A different body' },
                   { year: null, title: 'An appointment with no single year', source: 'A committee' }],
     about: ['First paragraph, carrying a touch more weight so the block has a way in.',
             'Second paragraph. The prose keeps a 62ch measure however wide the page gets.'],
     facts: [{ label: 'Registration', value: 'Registered Licensed Surveyor, MCGM (2004)' },
             { label: 'Also holds', value: 'MBA' },
             { label: 'Member', value: 'A professional association' }] }],

  ['About · prose only',
   'No statement and nothing conferred, which is the least populated pair across a directory: most people have never been given an award. The prose takes the whole measure rather than sitting beside an empty column.',
   { about: ['A record with no pull statement and no recognition. This has to be the graceful case, not the broken one, because most of them will be.'] }],

  ['Foot · colleagues and the claim',
   'Every route away from the page in one quiet block. The claim is a line of small print, never a badge beside the name.',
   { name: 'Complete Record', claimed: true }],
];

/* Defaults so a state can declare ONLY the fields it demonstrates. */
const stateRecord = (o) => ({
  slug: 'state', name: 'Placeholder Record', monogram: 'PR', role: 'Role',
  catId: 'architects', city: 'Mumbai', portrait: null, claimed: false,
  discipline: null, experience: null, brief: null, statement: null, figures: [],
  about: null, facts: [], topics: [], recognition: [], links: [], company: null,
  work: null, content: null, ...o,
});

function statesPage() {
  const base = render(stateRecord({ name: 'Template States', about: ['x'] }), []);
  /* THE REAL OPENING TAG, not the first '<main' in the file. The shell's
     head opens with a comment listing the markup contract, and that
     comment contains the word, so a loose search cut the head in half:
     the page shipped with no stylesheet, no chrome and no content. */
  const mainAt = base.indexOf('<main id="main"');
  if (mainAt < 0) throw new Error('states page: <main id="main"> not found in the rendered base');
  const head = base.slice(0, mainAt);
  for (const need of ['</head>', '<body', '/dist/person-profile.css', 'bpr-topbar']) {
    if (!head.includes(need)) throw new Error('states page head is missing ' + need);
  }

  const blocks = STATES.map(([title, note, rec]) => {
    const p = stateRecord(rec);
    const parts = [
      rec.brief !== undefined || rec.links || rec.figures || rec.topics ? hero(p, []) : '',
      rec.about ? about(p) : '',
      rec.work ? work(p) : '',
      rec.content ? published(p) : '',
      rec.claimed ? foot(p, []) : '',
    ].filter(Boolean).join('\n');
    return `  <section class="st-case">
    <div class="pp-wrap">
      <p class="st-case__n">${esc(title)}</p>
      <p class="st-case__note">${esc(note)}</p>
    </div>
    <div class="pp-wrap st-case__body">
${parts}
    </div>
  </section>`;
  }).join('\n');

  return `${head}<main id="main" class="bpr-page">
  <div class="pp-wrap">
    <header class="st-head">
      <p class="st-kicker">Component reference</p>
      <h1 class="st-title">Person profile: every state</h1>
      <p class="st-lead">Half of this template is data-gated, so a live record only ever shows the handful of layouts its own fields happen to trigger. Every state is rendered here from the same functions the live pages use, so this cannot drift from what ships. <strong>None of these is a person.</strong> The names are the states.</p>
    </header>
  </div>
${blocks}
</main>
<style>
  /* Reference chrome only. Nothing in this block ships on a profile. */
  body.pp-page .bpr-topbar__tabs,body.pp-page .bpr-topbar__cta,
  body.pp-page .bpr-sticky-contact{display:none !important}
  .st-head{padding:clamp(48px,7vw,90px) 0 clamp(30px,4vw,50px)}
  .st-kicker{font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;text-transform:uppercase;
    color:var(--faint,#6a6a6a);margin:0 0 14px}
  .st-title{font:700 clamp(32px,4.4vw,56px)/1.06 'Gazpacho',Georgia,serif;color:var(--ink);margin:0}
  .st-lead{font:400 clamp(15px,1.5vw,17px)/1.75 'Inter',sans-serif;color:var(--ink2);
    margin:18px 0 0;max-width:62ch}
  .st-case{padding:clamp(34px,4.5vw,60px) 0;border-top:1px solid var(--rule)}
  /* The specimens separate on their own hairline, like the
     sections they contain. */
  .st-case__n{font:600 11px/1 'Inter',sans-serif;letter-spacing:.08em;text-transform:uppercase;
    color:var(--ink);margin:0}
  .st-case__note{font:400 13.5px/1.65 'Inter',sans-serif;color:var(--muted);
    margin:10px 0 0;max-width:78ch}
  /* The cases are specimens, so nothing inside one may hold a screen or
     stick: a sticky aside and a 100svh hero both belong to a page that
     is only about one person. */
  .st-case__body{margin-top:clamp(22px,2.6vw,34px)}
  .st-case__body .pp-hero,.st-case__body .pp-hero--tall{min-height:0;padding-top:0}
  .st-case__body .pp-sec{padding-top:0}
  .st-case__body .pp-about__aside,.st-case__body .pp-hold{position:static}
  .st-case__body .pp-sec--minor{padding-bottom:0}
  /* The specimens are unreachable anchors; the reveal must never hide
     them, since a blank reference page is worse than no reference. */
  body.pp-anim .st-case__body .pp-rise{opacity:1 !important;transform:none !important}
</style>
${base.slice(base.lastIndexOf('</main>') + 7)}
`;
}

/* ── write ────────────────────────────────────────────────────────── */

/* ROOT-ABSOLUTE ASSET PATHS, and this was a live bug rather than tidying.

   The file is written to the project root, so "brand_assets/..." is
   correct relative to person-profile-tarun-motta.html. Nobody reads it
   there. Every route to this page keeps the pretty URL in the address
   bar (vercel.json rewrites /people/tarun-motta to the file without
   redirecting), so the browser resolved every one of those paths
   against /people/ and 404'd the lot: the portrait, the Ghar mark in
   the header, and all six work photographs, on all four profiles, in
   production as well as here.

   Scoped to brand_assets/ on purpose. The blanket "anything not already
   absolute" rewrite the states page uses would also catch
   href="javascript:void(0)" and turn it into a path. Every other
   relative URL emitted here is one of those or an in-page #anchor. */
const rootAbsolute = html =>
  html.replace(new RegExp(' (src|href)="brand_assets/', 'g'), ' $1="/brand_assets/');

/* MOBILE NAVIGATION CONTRACT — asserted per page, per rebuild.
   A profile on a phone has to expose FOUR things at all times:

     1. Hero-overlay Back pill  (Back to /people, glass, in-hero)
     2. Hero-overlay Share pill (Share this profile, glass, in-hero)
     3. Sticky-bar Back disc    (Back to /people, past the image)
     4. Sticky-bar Share disc   (Share this profile, past the image)

   Losing #1/#2 strips a phone reader of navigation while the hero is on
   screen; losing #3/#4 strips them of it for the rest of the page. The
   bar and overlay CSS still ships from brand-profile-teearch.html, but
   the MARKUP has to be emitted here. Both halves have been dropped once
   in the past by a well-meaning refactor — the assertion is what makes
   sure that never lands on production again. */
const NAV_CONTRACT = [
  ['bpr-hero__overlay',                        'hero-overlay wrapper'],
  ['bpr-hero__overlay-btn" aria-label="Back',  'hero-overlay Back pill'],
  ['bpr-hero__overlay-btn" data-brand-share',  'hero-overlay Share pill'],
  ['bpr-sticky-contact__back',                 'sticky-bar Back disc'],
  ['bpr-sticky-contact__primary',              'sticky-bar Contact fill'],
  ['bpr-sticky-contact__util',                 'sticky-bar Share disc'],
];
function assertMobileNav(html, slug) {
  for (const [needle, name] of NAV_CONTRACT) {
    if (!html.includes(needle)) {
      throw new Error(`person-profile-${slug}.html is missing the ${name} (searched for "${needle}") — mobile navigation contract broken`);
    }
  }
}

for (const p of PEOPLE) {
  const html = rootAbsolute(render(p, PEOPLE));
  assertMobileNav(html, p.slug);
  await fs.writeFile(ROOT + `person-profile-${p.slug}.html`, optimiseImages(html), 'utf8');
  console.log('  ' + `person-profile-${p.slug}.html`.padEnd(38) + (p.portrait ? '' : '[monogram, no portrait]'));
}

/* The template is a build artifact, not a shipped page, so it is written
   to _dev/templates/ rather than the project root. */
await fs.writeFile(ROOT + '_dev/templates/person-profile.html', optimiseImages(toTemplate(render(TEMPLATE, [TEMPLATE, TEMPLATE_PEER]))), 'utf8');
console.log('  _dev/templates/person-profile.html'.padEnd(40) + '[TEMPLATE, tokens + REPEAT fences]');

{
  let html = statesPage()
    /* ROOT-ABSOLUTE EVERY RELATIVE URL. This page is written two levels
       down in _dev/templates/, so "brand_assets/..." resolved against
       that folder and the images, stylesheets and logo 404'd. Targeted
       rather than <base href="/">, which would also rewrite every
       "#section" anchor into a navigation away from the page. */
    .replace(/\b(src|href)="(?!https?:|\/|#|mailto:|tel:|data:|")/g, '$1="/')  // empty src is JS-filled (share preview), leave it
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex,nofollow">')
    .replace(/^([ \t]*)<title>[^<]*<\/title>/m, '$1<title>Person profile: every state | Reference</title>')
    .replace(/\n?\s*<link rel="canonical"[^>]*>/, '')
    .replace(/\n?\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  /* A reference page that silently lost a specimen is worse than none,
     so every mode is asserted present before it is written. */
  for (const [need, label] of [
    ['pp-idx--bare',          'bare work index'],
    ['pp-hold__frame',        'work index with the held panel'],
    ['pp-work__item',         'work as an opt-in gallery'],
    ['bpr-mcard--video',      'On Ghar.tv media card with a play overlay'],
    ['bpr-mcard__media--gfx', 'On Ghar.tv masthead plate, no image we own'],
    ['bpr-intel-card',        'On Ghar.tv tinted card, Intelligence only'],
    ['bpr-spot-group__label', 'On Ghar.tv sub-group labels'],
    ['bpr-carousel',          'On Ghar.tv rail on the shared carousel'],
    ['pp-fig__n',             'figures in the identity column'],
    ['pp-badge',              'category badge'],
    ['pp-fb__t',              'specialisations in the bar that closes the hero'],
    ['pp-recog__list',        'recognition in the About aside'],
    ['pp-facts',              'credentials'],
    ['pp-about--solo',        'about with neither statement nor recognition'],
    ['pp-portrait--mono',     'monogram portrait'],
    ['pp-hero--tall',         'full-height hero'],
  ]) {
    if (!html.includes(need)) throw new Error(`states page is missing the ${label} specimen`);
  }
  await fs.writeFile(ROOT + '_dev/templates/person-profile-states.html', optimiseImages(html), 'utf8');
  console.log('  _dev/templates/person-profile-states.html'.padEnd(40) + `[REFERENCE, ${STATES.length} states]`);
}

console.log('\n' + PEOPLE.length + ' pages + 1 template + 1 reference written');
