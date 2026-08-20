/* ===================================================================
   PERSON PROFILE · SHELL + DATA

   SHELL: people.html, for the MINIMAL PILL NAVBAR (body.simple-nav).

   This briefly moved to a brand microsite shell, on the reasoning that a
   profile is a tenant destination and should carry the microsite's own
   chrome. That was wrong, and wrong in a way worth writing down: a page
   assembled out of brand-microsite parts comes out reading like a brand
   microsite with a face on it. The topbar, the media rails, the tinted
   Intelligence cards and the dark contact band all carry a company's
   body language. A person's page needs the opposite, so it takes the
   quiet portal chrome and everything below it is written for a person.

   The page inherits a SHIPPED SHELL wholesale and replaces only two
   regions: the page stylesheet and <main>. Everything structural (head,
   font-face, css links, body classes, navStack, off-canvas, modals,
   footer, script tail, closing tags, PARTIAL markers) comes from
   people.html verbatim and cannot be partially copied.

   That rule exists because the older generator stitched individual
   chrome fragments together and failed silently five times: a missing
   script tail, a cut GSAP tag, an anchor that matched inside a COMMENT
   and duplicated the nav, a dropped #navStack wrapper that left a dead
   band across every page, and contact-modal CSS left behind so the
   modal rendered inline as a permanently open form. A page that is
   missing something still renders.
   =================================================================== */
import { promises as fs } from 'node:fs';

const ROOT  = 'd:/WORK/ghar-claude/';
const SHELL = 'people.html';
const src   = await fs.readFile(ROOT + SHELL, 'utf8');

function at(needle, from = 0) {
  const i = src.indexOf(needle, from);
  if (i < 0) throw new Error(`shell anchor missing from ${SHELL}: ${needle}`);
  return i;
}

/* The page stylesheet is the <style> that follows the nav.css link.
   Anything before it is head boilerplate we keep; the block itself is
   page-specific and gets replaced. */
const pageStyle    = at('<style>', at('nav.css'));
const pageStyleEnd = at('</style>', pageStyle);
const mainOpen     = at('<main');
const mainClose    = src.lastIndexOf('</main>');
if (mainClose < mainOpen) throw new Error('shell: </main> not found after <main>');

export const SHELL_HEAD = src.slice(0, pageStyle);               // doctype -> css links
const bodyRegion        = src.slice(pageStyleEnd + 8, mainOpen); // </head> -> end of chrome
export const SHELL_TAIL = src.slice(mainClose + 7);              // footer -> </html>

/* ═══════════════════════════════════════════════════════════════════
   THE PORTAL NAVBAR IS REMOVED from the person page.

   A profile takes the SLIM TOPBAR the brand microsites use, not the
   portal's full navbar. The portal bar leads with a property search
   field whose entire job is to send a reader somewhere else, and it is
   80px of chrome that says nothing about the person. The slim bar
   instead carries an escape hatch back to /people, the person's name
   fading in once the hero scrolls past, the section tabs, share, and
   the Ghar mark.

   It also removes a whole level of chrome: with the tabs living IN the
   bar there is no third sticky strip stacked under a second one.

   Cut at <header id="navStack">…</header>, which is the wrapper the
   nav partial sits inside. Everything else in the region (off-canvas
   menu, mobile bottom bar, search modal) is kept.
   ═══════════════════════════════════════════════════════════════════ */
const navOpen  = bodyRegion.indexOf('<header id="navStack">');
const navClose = bodyRegion.indexOf('</header>', navOpen);
if (navOpen < 0 || navClose < 0) throw new Error('shell: navStack wrapper not found');
export const SHELL_BODY = bodyRegion.slice(0, navOpen) + bodyRegion.slice(navClose + 9);
if (SHELL_BODY.includes('id="mainNav"')) throw new Error('shell: portal navbar survived the cut');
if (!SHELL_BODY.includes('id="ocMenu"')) throw new Error('shell: the cut took the off-canvas menu too');

/* The slim bar's stylesheet, lifted verbatim from a shipped microsite
   so the two never drift. Block runs from its own section fence to the
   next one. */
const topbarSrc = await fs.readFile(ROOT + 'brand-profile-teearch.html', 'utf8');
const tbStart = topbarSrc.indexOf('       0. TOP BAR');
if (tbStart < 0) throw new Error('topbar CSS: section header not found');
const tbFenceOpen = topbarSrc.lastIndexOf('/*', tbStart);
const tbEnd = topbarSrc.indexOf('       1. HERO', tbStart);
if (tbEnd < 0) throw new Error('topbar CSS: end fence not found');
export const TOPBAR_CSS = topbarSrc.slice(tbFenceOpen, topbarSrc.lastIndexOf('/*', tbEnd));
/* .bpr-topbar__cta is load-bearing now: the persistent desktop action
   lives in the bar, so its rules have to travel with the bar. */
for (const need of ['.bpr-topbar {', '.bpr-topbar__tabs', '.bpr-topbar__back',
                    '.bpr-topbar__ghar', '.bpr-topbar__cta {', 'body[data-scrolled]']) {
  if (!TOPBAR_CSS.includes(need)) throw new Error('TOPBAR_CSS is missing ' + need);
}
/* The bar name was removed at both breakpoints: it faded in at exactly
   the scroll position the CTA arrives at and competed for the row. */
if (TOPBAR_CSS.includes('.bpr-topbar__brand')) throw new Error('TOPBAR_CSS: the bar name is back');
/* The hero's own RULE, not any mention of it. The bar legitimately
   names the hero in a selector now: the pill treatment keys off
   body:has(.bpr-hero--light) so a tenant with a light hero gets ink
   pills instead of glass without a class to stamp. Only the hero's
   declaration block means the slice overran. */
if (TOPBAR_CSS.includes('.bpr-hero {')) throw new Error('TOPBAR_CSS ran past its block into the hero');

/* ═══════════════════════════════════════════════════════════════════
   THE SHARE SHEET, carried whole: stylesheet, markup and behaviour.

   people.html ships the CONTACT modal but not this one, so the profile
   bar's Share button had nothing to open. It briefly fell back to the
   native share sheet with a clipboard copy, which works but is not what
   the brand pages do, and a portal should not have two share
   experiences. All three regions come from the same shipped file so
   they cannot drift apart, and each is asserted: markup without CSS
   renders the sheet inline and permanently open, CSS without JS renders
   a button that does nothing.
   ═══════════════════════════════════════════════════════════════════ */
function slice(label, startNeedle, endNeedle, needs, from = 0) {
  const a = topbarSrc.indexOf(startNeedle, from);
  if (a < 0) throw new Error(`${label}: start anchor not found`);
  const b = topbarSrc.indexOf(endNeedle, a + startNeedle.length);
  if (b < 0) throw new Error(`${label}: end anchor not found`);
  const out = topbarSrc.slice(a, b);
  for (const n of needs) if (!out.includes(n)) throw new Error(`${label} is missing ${n}`);
  return out;
}

const shareCssStart = topbarSrc.lastIndexOf('/*', topbarSrc.indexOf('       SHARE SHEET'));
const SHARE_INNER_CSS = slice('SHARE_CSS', topbarSrc.slice(shareCssStart, shareCssStart + 4),
  '/* ═══', ['.bsm-preview {', '.bsm-tiles {', '.bsm-qr {', '.bsm-native'], shareCssStart);

/* The sheet's own POSITIONING lives in a different block from its
   contents. Taking only the .bsm-* block gave a modal that opened with
   no z-index and no fixed position, so it rendered behind the profile
   bar and read as "the button does nothing". Both blocks or neither. */
const SHARE_BOX_CSS = slice('SHARE_BOX_CSS', '    /* Share modal — mirrors #brContactModal positioning.', '/* ═══',
  ['#brShareOverlay{', '#brShareModal{', 'z-index:315', '.jm-open']);

export const SHARE_CSS = SHARE_BOX_CSS + '\n' + SHARE_INNER_CSS;

export const SHARE_HTML = slice('SHARE_HTML', '<div id="brShareOverlay"', '<!-- ═══ Trailing scripts',
  ['id="brShareModal"', 'brSharePreviewImg', 'brShareCopyBtn', 'brShareQr', 'bsm-tiles']);

export const SHARE_JS = slice('SHARE_JS', "      var overlay   = document.getElementById('brShareOverlay');",
  '    })();', ['window.brShareOpen', 'brShareClose', 'brShareCopy', 'data-brand-share']);
if (SHARE_JS.includes('brContactOpen')) throw new Error('SHARE_JS ran into the contact-modal block');

/* ═══════════════════════════════════════════════════════════════════
   THE BAR'S BEHAVIOUR, carried whole rather than reimplemented.

   The bar is a three-stage machine and only the first stage is obvious:

     data-scrolled   past ~40px. The bar goes solid and slim.
     data-past-hero  the hero has left. The subnav becomes eligible.
     data-nav-hidden set only while the reader is scrolling DOWN past
                     the hero. The main bar slides up and the subnav
                     rises into the top slot; scrolling up by more than
                     the deadzone drops the main bar back in above it.

   The page had a hand-written handler that set the first two and had
   never heard of the third, so the direction-aware handoff simply did
   not happen here: the subnav sat permanently below a bar that never
   moved. Rewriting it from the CSS a second time is how the two drift,
   so the handler is sliced from the shipped microsite exactly like the
   share sheet is.

   ONE SWAP, and it is asserted: the microsite keys off .bpr-hero, this
   page's hero is .pp-hero. Everything else, including the 12px
   direction deadzone and the 60px past-hero threshold, arrives
   unchanged so the two pages feel identical under the thumb.
   ═══════════════════════════════════════════════════════════════════ */
const TOPBAR_JS_RAW = slice('TOPBAR_JS', "      var hero = document.querySelector('.bpr-hero');",
  '    })();', ['data-past-hero', 'data-nav-hidden', '__dirMainHidden', '--bpr-topbar-h']);
export const TOPBAR_JS = (() => {
  const find = "document.querySelector('.bpr-hero')";
  const hits = TOPBAR_JS_RAW.split(find).length - 1;
  if (hits !== 1) throw new Error(`TOPBAR_JS: hero selector matched ${hits}, expected 1`);
  const out = TOPBAR_JS_RAW.split(find).join("document.querySelector('.pp-hero')");
  /* Only guard the EXACT anchor selector we replaced. `.bpr-hero__bg` /
     `.bpr-hero__ambient` legitimately survive as image-fallback
     selectors that also work when copied to a person page (they simply
     miss on a page that has none), so a substring `.bpr-hero` match is
     the wrong check — it was rejecting valid state. */
  if (out.includes(find)) throw new Error('TOPBAR_JS: the brand hero selector was not swapped');
  return out;
})();

/* The persistent bottom bar.

   This used to be TWO fenced blocks: a desktop floating CTA and the
   mobile bar, which is why the slice deliberately ran past the first
   fence it met. The floating pill is gone. The persistent desktop action
   is .bpr-topbar__cta, which sits in the bar itself and therefore
   arrives with TOPBAR_CSS, so this is one block again and the end anchor
   is the next fence after it. */
const stickyStart = topbarSrc.lastIndexOf('/*', topbarSrc.indexOf('       MOBILE BOTTOM BAR'));
const stickyMark  = topbarSrc.indexOf('.bpr-sticky-contact {', stickyStart);
if (stickyStart < 0 || stickyMark < 0) throw new Error('STICKY_CSS: anchors not found');
const stickyEnd   = topbarSrc.indexOf('/* ═══', stickyMark);
export const STICKY_CSS = topbarSrc.slice(stickyStart, stickyEnd < 0 ? undefined : stickyEnd);
for (const n of ['.bpr-sticky-contact {', '.bpr-sticky-contact__primary',
                 'data-contact-in-view']) {
  if (!STICKY_CSS.includes(n)) throw new Error('STICKY_CSS is missing ' + n);
}
if (STICKY_CSS.includes('.bpr-float-contact')) throw new Error('STICKY_CSS: the floating pill is back');

/* ═══════════════════════════════════════════════════════════════════
   THE SPOTLIGHT CHASSIS, carried whole from the brand microsite.

   Ghar.tv's own published content has to look the same wherever it
   appears, and the brand pages already settled what it looks like: a
   sub-group per content type, a Gazpacho label with a paginator, and a
   rail of cards on the portal's shared carousel. A person's page was
   instead setting the identical articles as a list of text rows, so the
   same GharTalks episode looked like one thing on /brands/teearch and
   another on /people/tarun-motta.

   Three regions, all verbatim so the two can never drift:

     SPOT_CSS   .bpr-spot-group + .bpr-mcard, the media card
     INTEL_CSS  .bpr-intel-card, title-as-visual, for anything with no
                image we own. That is the portal-wide rule for
                Intelligence and it is the right answer for a Voices
                op-ed too: no borrowed photography, ever
     RAIL_CSS   the shared carousel chassis and the paginator rules

   NOT a fork and not a re-implementation. Reuse both layers, design and
   function, because both are already correct for this content.
   ═══════════════════════════════════════════════════════════════════ */
const spotStart = topbarSrc.lastIndexOf('/*', topbarSrc.indexOf('       5. SPOTLIGHT'));
const intelStart = topbarSrc.indexOf('    /* ── Intelligence card.', spotStart);
if (spotStart < 0 || intelStart < 0) throw new Error('SPOT_CSS: anchors not found');
export const SPOT_CSS = topbarSrc.slice(spotStart, intelStart);
for (const n of ['.bpr-spot-group {', '.bpr-spot-group__label', '.bpr-mcard {',
                 '.bpr-mcard__media', '.bpr-mcard__type', '.bpr-mcard__title']) {
  if (!SPOT_CSS.includes(n)) throw new Error('SPOT_CSS is missing ' + n);
}

const intelEnd = topbarSrc.indexOf('    /* ═══', intelStart);
if (intelEnd < 0) throw new Error('INTEL_CSS: end fence not found');
export const INTEL_CSS = topbarSrc.slice(intelStart, intelEnd);
for (const n of ['.bpr-intel-grid {', '.bpr-intel-grid.rail', '.bpr-intel-card {',
                 'nth-child(4n+1)', '.bpr-intel-card__title']) {
  if (!INTEL_CSS.includes(n)) throw new Error('INTEL_CSS is missing ' + n);
}

/* The rail chassis and the paginator rules. Starts at the carousel
   comment that precedes .bpr-carousel.rail-outer.is-overflowing and runs
   to the next fence. The play overlay for video cards lives elsewhere in
   the file, so it is sliced separately below. */
const railStart = topbarSrc.lastIndexOf('    /*', topbarSrc.indexOf('.bpr-carousel.rail-outer.is-overflowing'));
const railEnd = topbarSrc.indexOf('    /* ═══', railStart);
if (railStart < 0 || railEnd < 0) throw new Error('RAIL_CSS: anchors not found');
export const RAIL_CSS = topbarSrc.slice(railStart, railEnd);
for (const n of ['.bpr-spot-group__grid', '.bpr-carousel > .rail > *',
                 'is-overflowing', '.dc-paginator']) {
  if (!RAIL_CSS.includes(n)) throw new Error('RAIL_CSS is missing ' + n);
}

const playStart = topbarSrc.indexOf('    /* Play-button overlay for video cards');
const playEnd = topbarSrc.indexOf('    /* ═══', playStart);
if (playStart < 0 || playEnd < 0) throw new Error('PLAY_CSS: anchors not found');
export const PLAY_CSS = topbarSrc.slice(playStart, playEnd);
if (!PLAY_CSS.includes('.bpr-mcard--video')) throw new Error('PLAY_CSS is missing .bpr-mcard--video');

/* CHROME CSS. The contact modal ships in SHELL_TAIL, but the CSS that
   positions and HIDES it lives in people.html's page <style>, which this
   generator replaces. Without it the modal rendered inline at the bottom
   of every profile as a permanently open form. Anything governing chrome
   that comes from the shell must be carried with it. */
const pageCss = src.slice(pageStyle, pageStyleEnd);
const chromeStart = pageCss.indexOf('/* ═══ Contact-brand modal');
if (chromeStart < 0) throw new Error('chrome CSS: contact-modal section not found in people.html');
const chromeEnd = pageCss.indexOf('/* ═══', chromeStart + 10);
export const CHROME_CSS = pageCss.slice(chromeStart, chromeEnd < 0 ? pageCss.length : chromeEnd);
for (const need of ['#brContactOverlay{', '#brContactModal{', 'pointer-events:none']) {
  if (!CHROME_CSS.includes(need)) throw new Error('CHROME_CSS is missing ' + need);
}

/* The peer rail reuses .bpr-person, the canonical directory card, which
   people.html defines. Carried across so the cards are not re-invented. */
const personStart = pageCss.indexOf('.bpr-person{');
if (personStart < 0) throw new Error('person-card CSS not found in people.html');
const personEnd = pageCss.indexOf('/* ═══', personStart);
export const PERSON_CARD_CSS = pageCss.slice(personStart, personEnd < 0 ? pageCss.length : personEnd);
for (const need of ['.bpr-person__media', '.bpr-person__name', '.bpr-person__role']) {
  if (!PERSON_CARD_CSS.includes(need)) throw new Error('PERSON_CARD_CSS is missing ' + need);
}

/* Assertions. Each one exists because its absence previously shipped. */
const CONTRACT = [
  [SHELL_HEAD, ['@font-face', 'gazpacho.css', 'dist/styles.min.css', 'nav.css'], 'SHELL_HEAD'],
  [SHELL_BODY, ['</head>', '<body', 'id="ocMenu"'], 'SHELL_BODY'],
  [SHELL_TAIL, ['PARTIAL footer:start', 'unpkg.com/gsap', 'ghar-carousel.js',
                'main.min.js', 'brContactModal', '</body>', '</html>'], 'SHELL_TAIL'],
];
for (const [region, needs, label] of CONTRACT) {
  for (const need of needs) {
    if (!region.includes(need)) throw new Error(`${label} is missing ${need}`);
  }
}
/* And the inverse: no region may contain another's chrome, or it renders twice. */
if (SHELL_TAIL.includes('PARTIAL nav:start'))    throw new Error('SHELL_TAIL swallowed the nav');
if (SHELL_BODY.includes('PARTIAL footer:start')) throw new Error('SHELL_BODY swallowed the footer');

/* ═══════════════════════════════════════════════════════════════════
   PUBLISHED-WORK GROUPS

   Named from the READER's side, never from ours. A section called
   "On Ghar.tv" stamps the platform onto a page that should read as the
   person's own, and it would also force us to either exclude work they
   published elsewhere or misstate where it came from. "Writing" and
   "Conversations" describe the artifact and stay true either way.

   There is deliberately NO parent heading above these groups. The brand
   microsite settled that: the sub-group labels carry the structure.

   The platform is credited where crediting is honest and useful: on the
   card's meta line, as a production credit, the way a citation works.

   The split that matters is AUTHORSHIP, not which desk produced it:

     writing        they wrote it. Industry Voices op-eds, columns,
                    commentary. The most valuable group on the page,
                    because it is the only one that is their own argument
     conversations  they spoke. GharTalks, recorded interviews
     features       someone wrote about them, or presented them
     research       Intelligence reports they authored or were cited in
     films, events  everything else, self-explanatory
   ═══════════════════════════════════════════════════════════════════ */
export const CONTENT_GROUPS = [
  ['writing',       'Writing'],
  ['conversations', 'Conversations'],
  ['features',      'Features'],
  ['research',      'Research'],
  ['films',         'Films'],
  ['events',        'Events'],
];

/* ═══════════════════════════════════════════════════════════════════
   THE HERO EYEBROW IS A FIELD, NEVER A TITLE.

   It used to be `discipline`, which on these records reads "Civil
   Engineer", "Architect (COA), MBA". That is a QUALIFICATION, and
   making it the first thing on the page has three faults. It is the
   most unevenly populated field we hold, so the self-made developer,
   the broker and the creator open on a blank or on something we had to
   invent. It ranks people by education on a directory that also carries
   people with none. And it answers the same question as the role line
   three lines below it, less usefully.

   The eyebrow is now the DIRECTORY CATEGORY, keyed to the same six
   parents people.html files the cards under, so it is provably the
   shelf the reader arrived from and every listed person has exactly one
   by definition.

   Rendered as a FIELD, not a personal noun: "Architecture", not
   "Architect". The distinction is load-bearing. Tarun Motta is a civil
   engineer who runs an architecture practice, so "ARCHITECTURE" is true
   of his work and "ARCHITECT" would be a claim about his registration
   that we would be making on his behalf. It also matches what the brand
   template already does one level up, where TEEARCH's eyebrow reads
   "ARCHITECTURE · PMC · ADVISORY".

   The qualification is not lost. It moves to the hero foot bar, beside
   the city and the years, as one fact among facts. */
export const CATEGORIES = {
  architects:   'Architecture',
  interiors:    'Interior design',
  developers:   'Development',
  brandleaders: 'Brand leadership',
  advisors:     'Advisory',
  research:     'Research',
};

/* ═══════════════════════════════════════════════════════════════════
   REACH, including social profiles.

   links[] renders in the hero foot bar as hover-expand pills. Supported
   kinds, each with its own platform hex on hover:

     web  email  linkedin  instagram  youtube  x  facebook

   Capped at five so a foot bar does not turn into a social wall; put the
   two the person actually uses first.

   ONE RULE, and it is the same one that has kept LinkedIn off all four
   of these pages so far: a VERIFIED profile URL or nothing. A handle
   constructed from someone's name is the same class of error as an
   invented quote, and it is worse here because it is clickable: it sends
   a reader to a stranger's account under this person's name. None of
   these four records has a social URL on file yet, so none renders one.
   Add them as they are confirmed; the markup is already waiting.
   ═══════════════════════════════════════════════════════════════════ */

/* ── data ──────────────────────────────────────────────────────────── */

/* Companies that host the demo founder profiles below. Each `company`
   object matches TEEARCH's shape so the render() peer + back-link paths
   don't need to branch. hex + soft are placeholder tenant palettes; the
   PERSON page ignores them (person pages are always ink-on-white per
   feedback_brand_theming_constraints) — they exist so the object shape
   matches TEEARCH's, not to theme anything. */
const GODREJ = {
  name: 'Godrej Properties', slug: 'godrej-properties',
  logo: 'brand_assets/brands/godrej-properties.svg',
  hex: '#003B71', soft: '#e6ecf3',
  line: 'Part of a 125+ year old group; one of India’s largest listed developers.',
  city: 'Mumbai',
  site: 'godrejproperties.com',
};
const AVIRAHI = {
  name: 'Avirahi Group', slug: 'avirahi',
  logo: 'brand_assets/brands/avirahi.webp',
  hex: '#a01e2c', soft: '#f5e6e8',
  line: 'Three decades of residential and commercial development across Mumbai and Avirahi City Dholera.',
  city: 'Mumbai',
  site: 'avirahi.com',
};
const SCARLET = {
  name: 'Scarlet Splendour', slug: 'scarlet-splendour',
  logo: 'brand_assets/brands/scarlet-splendour.png',
  hex: '#a01a1a', soft: '#f5dede',
  line: 'India’s theatrical luxury furniture house, exported to design galleries worldwide.',
  city: 'Kolkata',
  site: 'scarletsplendour.com',
};

const TEEARCH = {
  name: 'TEEARCH', slug: 'teearch', logo: 'brand_assets/brands/teearch.jpg',
  hex: '#c67e35', soft: '#f5e4cf',
  line: 'Architecture, liaisoning, project management and transaction advisory, Mumbai.',
  city: 'Mumbai',
  site: 'teearch.in',
  /* Firm-level, and deliberately NOT rendered on a person's page: an
     empanelment belongs to TEEARCH, and repeating it under an individual
     quietly transfers the firm's standing to the person. It lives on
     /brands/teearch. Kept here because the firm record is shared. */
  empanelments: ['LIC', 'SRA', 'MHADA', 'MSIDC', 'BMC', 'MMRDA', 'RCF'],
};

/* Projects and photography are from the client's brief and teearch.in.
   Nothing invented. Attributed to the FIRM wherever they render. */
const TEEARCH_WORK = [
  { title: 'BDD Chawl Redevelopment', meta: 'Mumbai',           image: 'brand_assets/brand-photos/teearch-project-1.png' },
  { title: 'LIC Jeevan Shanti',      meta: 'Mumbai',           image: 'brand_assets/brand-photos/teearch-project-2.png' },
  { title: 'Sheth Beaumonde',         meta: 'Mumbai',           image: 'brand_assets/brand-photos/teearch-project-3.png' },
  { title: 'Safal',                   meta: 'Mumbai',           image: 'brand_assets/brand-photos/teearch-project-4.png' },
  { title: 'Hospitality',             meta: 'Hotel project',    image: 'brand_assets/brand-photos/teearch-hotel-1.avif' },
  { title: 'Healthcare',              meta: 'Hospital project', image: 'brand_assets/brand-photos/teearch-hospital-1.avif' },
];

/* Four live articles carry TEEARCH attribution today. Only the blog
   feature ships a hero image we own; the three Intelligence pieces
   publish without one by design, so they render as title-as-visual
   cards rather than borrowing an unrelated photograph. `image: null`
   is what selects that. */
const TEEARCH_CONTENT = [
  /* The article's OWN hero image, from ghar.tv. It renders a media card
     rather than the masthead-plate fallback, which is the point of the
     fallback existing: use the real picture the moment we have one. */
  { group: 'features', type: 'Feature',
    image: 'https://www.ghar.tv/blog/pics/7574.png?1786631134',
    title: 'Since 1982: how Mumbai\u2019s building rules have changed',
    href: '/blog/since-1982-mumbais-building-rules/artid7574',
    meta: 'Presented by TEEARCH' },
  /* Both filed 18 Aug 2026. `type` takes each article's OWN category
     from ghar.tv (Analysis, Legal) rather than a label invented for the
     card, and the foot carries the disclosure the articles themselves
     print: prepared by Ghar.tv Research WITH TEEARCH. That is a
     collaboration and not a presentation, so neither says 'Presented
     by'. Newest first, which is the order the rail renders. */
  { group: 'research', type: 'Analysis', image: null,
    title: 'Motilal Nagar Redevelopment: Scale, Timelines and Execution Risk',
    href: '/intelligence/motilal-nagar-mhada-redevelopment-execution-risk-analysis/artgi1094',
    meta: 'Ghar.tv Research with TEEARCH' },
  { group: 'research', type: 'Legal', image: null,
    title: 'TEEARCH Compliance Map: Every Mumbai Building NOC Explained',
    href: '/intelligence/teearch-compliance-map-mumbai-building-noc-guide/artgi1096',
    meta: 'Ghar.tv Research with TEEARCH' },
  { group: 'research', type: 'Ranking', image: null,
    title: 'Top 10 project management consultants in Mumbai',
    href: '/intelligence/top-10-project-management-consultants-pmc-in-mumbai/artgi726',
    meta: 'Presented by TEEARCH' },
];

/* ═══════════════════════════════════════════════════════════════════
   TIER, and what it does NOT do any more.

   `tier` used to gate whole sections: a 'listed' person lost the work
   rail and the published stream, which left a co-founder with a page
   that was visibly thinner than their partner's. That is the wrong
   outcome for the two people most likely to be shown the page.

   It now records only which person the engagement nominates as the
   contact. Every person gets every section, and sections appear or
   vanish on whether that person HAS the content, which is what a
   backend would do anyway.

   Firm surfaces (work, published) render on every partner's page and are
   explicitly attributed to the firm, so nothing is misread as personal
   credit. The pages stay distinct because the entire first screen, the
   quote, and the peer list are person-specific.

   Not shown to readers in any form. A visible tier badge would tell a
   visitor that one architect ranks below another, which is untrue.
   ═══════════════════════════════════════════════════════════════════ */
export const PEOPLE = [
  {
    slug: 'tarun-motta', name: 'Tarun Motta', monogram: 'TM',
    role: 'Managing Director',
    /* Filed under Architects on people.html; the eyebrow renders
       "Architecture". His own qualification is civil engineering and it
       sits in the foot bar, where it is a fact rather than a headline. */
    catId: 'architects', discipline: 'Civil Engineer',
    experience: '44 years in practice',
    tier: 'lead',
    portrait: 'brand_assets/people/teearch-tarun-motta.jpg',
    city: 'Mumbai', claimed: true,
    /* Verified facts only: title, qualification, years, and what the firm
       does. No invented career history. */
    /* TWO SENTENCES, the rule for every record. Three restated most of
       what About says further down and made the hero a summary of the
       page; one left the column looking clipped beside a 4:5 portrait.
       Two places the person and says what the work is, and leaves the
       history to the section written for it. */
    brief: 'Tarun Motta leads TEEARCH from the execution side of Mumbai redevelopment, where statutory process and build reality meet. The practice works across architecture, liaisoning, project management and transaction advisory.',
    /* Real, and each one on record: the founding year and the tenure are
       from the client brief, the BDD figure is published on the firm's
       own page. Nothing derived, nothing rounded up. */
    figures: [
      { value: 'Since 1982', label: 'Leading the practice' },
      { value: '44', label: 'Years in civil engineering' },
      { value: '226 lakh', label: 'Sq ft, BDD Chawl redevelopment' },
    ],
    /* EMPTY ON PURPOSE. City, years and qualification are the foot
       bar's three facts now, so a labelled list repeating them would be
       the hero said twice. This block is for the LONG credentials that
       fit nowhere else: statutory registrations, memberships. Nothing on
       record for him qualifies, so it hides. */
    facts: [],
    /* Named from TEEARCH's own service list rather than from generic
       discipline words. "Architecture" says nothing that distinguishes
       this practice; liaisoning and TDR are the competences their
       empanelments and project list actually evidence. */
    topics: [
      { label: 'Redevelopment', href: null },
      { label: 'Liaisoning & statutory approvals', href: null },
      { label: 'Feasibility & TDR advisory', href: null },
    ],
    /* No verified quote on record. The section is omitted rather than
       filled: a sentence we wrote and attributed to him would be a
       fabrication, and this is the one block a reader trusts most. */
    /* The story, assembled from the client brief and what already ships
       on /brands/teearch. None of it is invented: the founding year, the
       policy work and the BDD figures are all on record. */
    /* NINE WORDS. It ran to seventeen and wrapped five lines at display
       size, which is why it read as a second heading fighting the
       section title above it rather than as a pull statement. The rule
       is now twelve words or fewer: this field is a claim, not a
       paragraph, and the prose beside it carries the detail. */
    statement: 'Four decades on the execution side of Mumbai redevelopment.',
    about: [
      'Tarun Motta founded TEEARCH in 1982 and has led it since, through the period in which Mumbai rewrote the rules it builds by. The practice now runs as a second-generation partnership working across architecture, liaisoning, project management and transaction advisory.',
      'His work sits on the statutory side of development. TEEARCH helped shape Mumbai’s Transfer of Development Rights policy and the DCPR 2034 regulations, and now navigates that same rulebook daily for its clients: cluster redevelopments, cooperative-society mandates, government schemes and institutional projects across the Mumbai Metropolitan Region.',
      'The scale runs from single-plot societies to the BDD Chawl redevelopment, 226 lakh square feet for more than 15,000 members.',
    ],
    quote: null,
    /* Real and already public on /brands/teearch. A partner's
       professional contact IS the practice's; nothing invented, and no
       LinkedIn until we hold a verified profile URL. */
    links: [
      { kind: 'web',   label: 'teearch.in',          href: 'https://www.teearch.in/' },
      { kind: 'email', label: 'accounts@teearch.in', href: 'mailto:accounts@teearch.in' },
    ],
    company: TEEARCH, work: TEEARCH_WORK, content: TEEARCH_CONTENT,
  },
  {
    slug: 'hiten-motta', name: 'Hiten Motta', monogram: 'HM',
    role: 'Partner',
    /* The SHORT form in the bar, the formal registration in the About
       credentials below. "Architect (COA), MBA" in a one-line meta strip
       was a credential list pretending to be a label. */
    catId: 'architects', discipline: 'Architect',
    experience: '18 years in practice',
    tier: 'listed',
    portrait: 'brand_assets/people/teearch-hiten-motta.jpg',
    city: 'Mumbai', claimed: true,
    brief: 'Hiten Motta works across TEEARCH\u2019s architecture and project management mandates in Mumbai. He is registered with the Council of Architecture and holds an MBA.',
    figures: [
      { value: '18', label: 'Years in practice' },
      { value: 'COA', label: 'Council of Architecture' },
      { value: 'MBA', label: 'Also holds' },
    ],
    /* Registrations only, and they read in full here because the About
       column has the width for them. */
    facts: [
      { label: 'Registration', value: 'Council of Architecture (COA)' },
      { label: 'Also holds',   value: 'MBA' },
    ],
    topics: [
      { label: 'Architecture', href: null },
      { label: 'Project management', href: null },
      { label: 'Redevelopment', href: null },
    ],
    statement: 'An architect’s eye on mandates that are usually settled by paperwork.',
    about: [
      'Hiten Motta is a partner at TEEARCH, registered with the Council of Architecture and holding an MBA, with 18 years in practice.',
      'Hiten Motta works across the firm’s architecture and project management mandates in Mumbai, in a practice built on the premise that the design decision and the statutory decision are rarely separable.',
    ],
    quote: null,
    /* Real and already public on /brands/teearch. A partner's
       professional contact IS the practice's; nothing invented, and no
       LinkedIn until we hold a verified profile URL. */
    links: [
      { kind: 'web',   label: 'teearch.in',          href: 'https://www.teearch.in/' },
      { kind: 'email', label: 'accounts@teearch.in', href: 'mailto:accounts@teearch.in' },
    ],
    company: TEEARCH, work: TEEARCH_WORK, content: TEEARCH_CONTENT,
  },
  {
    slug: 'devesh-motta', name: 'Devesh Motta', monogram: 'DM',
    role: 'Partner',
    catId: 'architects', discipline: 'Civil Engineer',
    experience: '21 years in the industry',
    tier: 'listed',
    /* No portrait exists. Renders a Gazpacho monogram, never a stand-in
       face, and he stays off the /people directory until one does. */
    portrait: null,
    city: 'Mumbai', claimed: true,
    /* Verbatim from the client's brief document. */
    brief: 'Devesh Motta reads what a site will and will not allow, before a drawing is made. He specialises in surveying, redevelopment, statutory approvals and project execution.',
    figures: [
      { value: '21', label: 'Years in the industry' },
      { value: 'Since 2004', label: 'Licensed Surveyor, MCGM' },
      { value: '3', label: 'Practices he partners in' },
    ],
    /* The record that proves the credentials block belongs in About and
       not in the hero bar: a statutory registration and two memberships,
       none of them stated elsewhere, and all three far too long to sit
       on a one-line meta strip beside the city. */
    facts: [
      { label: 'Registration',    value: 'Registered Licensed Surveyor, MCGM (2004)' },
      { label: 'Member',          value: 'PEATA' },
      { label: 'Life member',     value: 'Mandpeshwar Civic Federation' },
    ],
    topics: [
      { label: 'Surveying', href: null },
      { label: 'Redevelopment', href: null },
      { label: 'Statutory approvals', href: null },
    ],
    statement: 'Twenty-one years of reading what a site will and will not allow.',
    about: [
      'Devesh Motta is a partner at TEEARCH PMC, Atul Corporates and STD Consultants, with 21 years in the real estate and construction industry.',
      'Devesh Motta has been a Registered Licensed Surveyor with the MCGM since 2004, and specialises in surveying, redevelopment, statutory approvals and project execution: the work that decides what a redevelopment can actually become, before a drawing is made.',
      'Devesh Motta is a member of PEATA and a life member of the Mandpeshwar Civic Federation.',
    ],
    quote: null,
    /* Real and already public on /brands/teearch. A partner's
       professional contact IS the practice's; nothing invented, and no
       LinkedIn until we hold a verified profile URL. */
    links: [
      { kind: 'web',   label: 'teearch.in',          href: 'https://www.teearch.in/' },
      { kind: 'email', label: 'accounts@teearch.in', href: 'mailto:accounts@teearch.in' },
    ],
    company: TEEARCH, work: TEEARCH_WORK, content: TEEARCH_CONTENT,
  },

  /* ═════════════════════════════════════════════════════════════════
     The record that proves the template is not a satellite of a brand.

     Everything above shares one firm, which made it easy to build a page
     that was really about TEEARCH with a person's photograph on it. This
     person has NO tenant brand at all: `company: null`, so the firm row,
     the peer rail, the project rail and the back-to-firm link all drop
     out, and what remains is entirely the individual. It is also the
     only record whose published work is genuinely HERS rather than her
     employer's, which is what the page is supposed to be for.

     Details are the ones already curated in people.html and voices.html.
     Her affiliation is a university, so it renders as a plain line, not
     as a logo tile linking to a brand page she does not have.
     ═════════════════════════════════════════════════════════════════ */
  {
    slug: 'darshini-mahadevia', name: 'Darshini Mahadevia', monogram: 'DM',
    role: 'Professor, Urban Studies',
    /* NO qualification and NO years, and this record is the reason the
       foot bar had to tolerate that. "Urban researcher" was her
       discipline, which is the category, not a credential: with the
       eyebrow already reading "RESEARCH" it would have been the same
       word twice. We hold no verified degree or start year for her, and
       an academic's are not ours to estimate, so her bar carries the one
       fact we know. A bar with one true item beats three with two
       invented. */
    catId: 'research', discipline: null,
    tier: 'lead',
    portrait: 'brand_assets/people/darshini-mahadevia.png',
    city: 'Ahmedabad', claimed: false,
    /* Plain text, no logo and no /brands link: a university is an
       affiliation, not a tenant. */
    affiliation: 'Ahmedabad University',
    brief: 'Darshini Mahadevia researches urban housing, transport and labour, and how the three fail to line up in Indian cities. Her work asks whether the homes being built sit anywhere near the work their residents actually do.',
    /* NO RIBBON. We hold no verified year, degree date or publication
       count for her, and an academic's are not ours to estimate. She is
       the record that proves the figures block has to be optional: the
       hero simply ends on the fact bar. */
    /* Nothing on record that is not already in the role line or the
       prose, so the credentials block hides. */
    facts: [],
    topics: [
      { label: 'Urban studies', href: null },
      { label: 'Housing policy', href: null },
      { label: 'Transport', href: null },
    ],
    /* Unverified. The claim carried on voices.html is flagged in that
       file as placeholder copy, so it is not put in her mouth here. */
    statement: 'Housing policy that never asks where the work is.',
    about: [
      'Darshini Mahadevia researches urban housing, transport and labour, and how the three fail to line up in Indian cities.',
      'Her work returns to a question most housing policy skips: whether the homes being built sit anywhere near the work their residents are meant to do, and what a household pays in time and fare when they do not.',
    ],
    quote: null,
    /* No verified link on record. An unverified university URL under a
       named academic is the same class of error as an invented quote. */
    links: [],
    company: null, work: null,
    content: [
      { group: 'writing',  type: 'Op-ed', image: null,
        title: 'The commute is the housing policy nobody costed',
        href: '/voices/darshini-mahadevia-where-people-work',
        meta: 'Industry Voices' },
      { group: 'research', type: 'Cited in', image: null,
        title: 'Where affordable stock sits against job density',
        href: '/intelligence/affordable-housing-access',
        meta: 'Intelligence' },
    ],
  },

  /* ═════════════════════════════════════════════════════════════════
     UNCLAIMED FOUNDER PROFILES — presentation stubs.

     Four brand founders whose companies ship as full tenant pages
     under /brands. These records exist so /people links resolve and
     the founder → brand loop is complete for demos. All four are
     marked claimed: false so the reader sees the "unclaimed profile"
     line — none of these people have signed off on this content.

     PUBLIC BRAND FACTS ONLY. No fabricated qualifications, awards,
     tenures, publications or invented quotes. If a fact is not
     verifiable from the brand's own site or a widely-published
     corporate record, it is not on the page. Empty facts + figures
     blocks are the right rendering for what we can actually
     evidence — see the Darshini Mahadevia record above for the same
     pattern applied to an academic.

     Backend TODO before hard launch:
     1. Each founder confirms the copy and portrait.
     2. Verified LinkedIn / X / Instagram URLs added to links[].
     3. Set claimed: true on the record once the person has
        acknowledged the page in writing.
     ═════════════════════════════════════════════════════════════════ */
  {
    slug: 'adi-godrej', name: 'Adi Godrej', monogram: 'AG',
    /* Role stops at the title. The company name is appended by the
       renderer both in the meta line and in the <title>, so restating
       "Godrej Group" here produced "Chairman Emeritus, Godrej Group,
       Godrej Properties" in the tab and read as three separate
       roles. Same rule applied to the other three stub founders. */
    role: 'Chairman Emeritus',
    catId: 'brandleaders', discipline: null,
    portrait: 'brand_assets/people/adi-godrej.jpg',
    city: 'Mumbai', claimed: false,
    brief: 'Adi Godrej is Chairman Emeritus of the Godrej Group, the 125-year-old Indian conglomerate whose real-estate arm is one of the country’s largest listed developers.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Corporate leadership', href: null },
      { label: 'Group strategy', href: null },
      { label: 'Consumer and real estate', href: null },
    ],
    statement: 'Steward of a 125-year-old group that shaped modern Indian business.',
    about: [
      'Adi Godrej is Chairman Emeritus of the Godrej Group, the Mumbai-headquartered conglomerate whose businesses span consumer goods, agri, chemicals and real estate.',
      'His leadership of the group’s modernisation, professionalisation and philanthropy is the ground on which the property arm was spun into a listed, publicly-traded developer carrying the trust the family name is known for.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'godrejproperties.com', href: 'https://www.godrejproperties.com/' },
    ],
    company: GODREJ, work: null, content: [],
  },
  {
    slug: 'pirojsha-godrej', name: 'Pirojsha Godrej', monogram: 'PG',
    role: 'Executive Chairman',
    catId: 'developers', discipline: null,
    portrait: 'brand_assets/people/pirojsha-godrej.jpg',
    city: 'Mumbai', claimed: false,
    brief: 'Pirojsha Godrej is Executive Chairman of Godrej Properties, the group’s listed real-estate developer, and previously served as its Managing Director and Chief Executive.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Residential development', href: null },
      { label: 'Township planning', href: null },
      { label: 'Sustainability', href: null },
    ],
    statement: 'Building the next decade of Indian residential real estate.',
    about: [
      'Pirojsha Godrej is Executive Chairman of Godrej Properties, the listed developer within the Godrej Group.',
      'He led the company through a decade of geographic expansion into Mumbai, NCR, Pune and Bengaluru, and previously served as its Managing Director and Chief Executive.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'godrejproperties.com', href: 'https://www.godrejproperties.com/' },
    ],
    company: GODREJ, work: null, content: [],
  },
  {
    slug: 'vinod-doshi', name: 'Vinod Doshi', monogram: 'VD',
    role: 'Founder & Group Head',
    catId: 'developers', discipline: null,
    /* No verified public portrait on record. Renders the Gazpacho
       "VD" monogram fallback rather than a stock stand-in — the same
       rule Devesh Motta's record follows. Add the real portrait when
       Avirahi supplies one. */
    portrait: null,
    city: 'Mumbai', claimed: false,
    brief: 'Vinod Doshi is the founder of Avirahi Group, a Mumbai-based developer that has spent three decades on residential and commercial projects across the city’s western suburbs and, more recently, the Avirahi City Dholera township.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Residential development', href: null },
      { label: 'Redevelopment', href: null },
      { label: 'Township planning', href: null },
    ],
    statement: 'Three decades of Mumbai residential development.',
    about: [
      'Vinod Doshi founded Avirahi Group and has led the business through more than three decades of residential and commercial development, primarily across Mumbai’s western suburbs.',
      'The group’s work today spans that suburban portfolio and Avirahi City Dholera, the 170-acre township under development within Dholera SIR.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'avirahi.com', href: 'https://www.avirahi.com/' },
    ],
    company: AVIRAHI, work: null, content: [],
  },
  {
    slug: 'virendra-shah', name: 'Virendra Shah', monogram: 'VS',
    role: 'Founder & Group Head',
    catId: 'developers', discipline: null,
    /* Multiple people share this name in Indian real estate; no
       standalone verified portrait on record for the Avirahi Group
       founder specifically. Monogram until Avirahi supplies one. */
    portrait: null,
    city: 'Mumbai', claimed: false,
    brief: 'Virendra Shah is the founder and group head of Avirahi Group, the Mumbai-based developer with three decades of residential and commercial deliveries across the city’s western suburbs.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Residential development', href: null },
      { label: 'Township planning', href: null },
    ],
    statement: 'Three decades of building the Mumbai suburbs.',
    about: [
      'Virendra Shah founded Avirahi Group and leads its residential and commercial development book across Mumbai’s western suburbs and, more recently, Avirahi City Dholera.',
      'Under his leadership Avirahi has delivered projects at Borivali, Malad, Dahisar and Goregaon, and committed to a 170-acre integrated township at Dholera SIR.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'avirahi.com', href: 'https://www.avirahi.com/' },
    ],
    company: AVIRAHI, work: null, content: [],
  },
  {
    slug: 'hardik-shah', name: 'Hardik Shah', monogram: 'HS',
    role: 'Partner',
    catId: 'developers', discipline: null,
    portrait: null,
    city: 'Mumbai', claimed: false,
    brief: 'Hardik Shah is a partner at Avirahi Group with responsibility for the operations and client-relations side of the developer’s Mumbai book.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Operations', href: null },
      { label: 'Client relations', href: null },
    ],
    statement: 'Running Avirahi’s Mumbai operations.',
    about: [
      'Hardik Shah is a partner at Avirahi Group and oversees the operations and client-relations function for the developer’s Mumbai book.',
      'The role sits at the intersection of the site teams and the buyer-facing sales and post-possession service that a residential developer lives or dies by.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'avirahi.com', href: 'https://www.avirahi.com/' },
    ],
    company: AVIRAHI, work: null, content: [],
  },
  {
    slug: 'satish-bhansali', name: 'Satish Bhansali', monogram: 'SB',
    role: 'Partner',
    catId: 'developers', discipline: null,
    portrait: null,
    city: 'Mumbai', claimed: false,
    brief: 'Satish Bhansali is a partner at Avirahi Group, focused on the western-suburbs residential book that has anchored the developer since inception.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Residential development', href: null },
      { label: 'Partner panel', href: null },
    ],
    statement: 'Anchoring Avirahi’s western-suburbs residential book.',
    about: [
      'Satish Bhansali is a partner at Avirahi Group with a focus on the western-suburbs residential portfolio.',
      'His work spans the neighbourhood-scale apartment and mid-rise book that has anchored the developer since inception in Borivali West.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'avirahi.com', href: 'https://www.avirahi.com/' },
    ],
    company: AVIRAHI, work: null, content: [],
  },
  {
    slug: 'ashish-bajoria', name: 'Ashish Bajoria', monogram: 'AB',
    role: 'Co-Founder',
    catId: 'brandleaders', discipline: null,
    /* No standalone verified portrait; the founders photo carried on
       Suman's profile shows both, but we do not double it on his
       card. Renders the Gazpacho monogram until a solo shot is
       supplied. */
    portrait: null,
    city: 'Kolkata', claimed: false,
    brief: 'Ashish Bajoria co-founded Scarlet Splendour, the Kolkata-based luxury furniture house that pairs Italian design with Indian craft, alongside his co-founder and partner Suman Kanodia.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Luxury retail', href: null },
      { label: 'Global design collaboration', href: null },
      { label: 'Craft-led manufacturing', href: null },
    ],
    statement: 'Building the retail side of India’s most theatrical furniture house.',
    about: [
      'Ashish Bajoria is a co-founder of Scarlet Splendour and leads the studio’s retail expansion and global design partnerships, working alongside co-founder and partner Suman Kanodia.',
      'Under his commercial leadership, Scarlet Splendour’s collections have moved into design galleries in Milan, London, New York and Paris, and the studio has become one of the few Indian design brands with a genuinely global retail presence.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'scarletsplendour.com', href: 'https://www.scarletsplendour.com/' },
    ],
    company: SCARLET, work: null, content: [],
  },
  {
    slug: 'suman-kanodia', name: 'Suman Kanodia', monogram: 'SK',
    role: 'Co-Founder',
    catId: 'brandleaders', discipline: null,
    portrait: 'brand_assets/people/suman-kanodia.jpg',
    city: 'Kolkata', claimed: false,
    brief: 'Suman Kanodia is co-founder of Scarlet Splendour, the Kolkata-based luxury furniture house that pairs Italian design with Indian craft and sells to galleries and hospitality clients around the world.',
    figures: [],
    facts: [],
    topics: [
      { label: 'Furniture design', href: null },
      { label: 'Craft-industry brand-building', href: null },
      { label: 'Luxury retail', href: null },
    ],
    statement: 'Kolkata to the world in theatrical luxury furniture.',
    about: [
      'Suman Kanodia co-founded Scarlet Splendour with a distinct point of view: theatrical, colourful, Italian-inspired but Indian-made luxury furniture, sold to design galleries and hospitality clients around the world.',
      'Under her leadership the studio has become one of the few Indian design brands with a genuinely global retail presence, its collections carried by galleries in London, New York, Milan and Paris.',
    ],
    quote: null,
    links: [
      { kind: 'web', label: 'scarletsplendour.com', href: 'https://www.scarletsplendour.com/' },
    ],
    company: SCARLET, work: null, content: [],
  },

];

/* The eyebrow is the first thing on the page and it is derived, so a
   typo in catId would ship a blank line rather than throw. Checked here
   instead. Same list for the reach kinds, where an unknown one would
   render the globe icon and quietly mislabel a social profile. */
const REACH_KINDS = ['web', 'email', 'linkedin', 'instagram', 'youtube', 'x', 'facebook'];
for (const p of PEOPLE) {
  if (!CATEGORIES[p.catId]) throw new Error(`${p.slug}: catId "${p.catId}" is not a directory category`);
  for (const l of p.links || []) {
    if (!REACH_KINDS.includes(l.kind)) throw new Error(`${p.slug}: reach kind "${l.kind}" is not supported`);
  }
  if ((p.links || []).length > 5) throw new Error(`${p.slug}: more than five reach links`);
  if (p.statement && p.statement.split(/\s+/).length > 12) {
    throw new Error(`${p.slug}: statement is ${p.statement.split(/\s+/).length} words, the limit is 12`);
  }
  /* Five is what the hero line holds before it wraps to a third row and
     stops reading as a set. A record with more than five has not been
     edited yet: pick the five the work actually evidences. */
  if ((p.topics || []).length > 5) throw new Error(`${p.slug}: more than five specialisations`);
  /* An entry with no title is a year sitting alone in a column, which
     is how a half-filled record ships looking like a bug. */
  for (const r of p.recognition || []) {
    if (!r.title) throw new Error(`${p.slug}: a recognition entry has no title`);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   🚨 PLACEHOLDER CONTENT. TEMPORARY. NOT TRUE. 🚨

   Every optional block on this template is data-gated, so a real record
   shows only the handful of layouts its own fields happen to trigger,
   and Tarun's record shows about half of them. That makes it useless as
   the single page to judge the DESIGN against, which is what it is
   being used for right now.

   So this block fills his record with invented content until the layout
   is signed off. It exists to make one page show every section at once
   and for no other reason.

   TO REMOVE: set DEMO_FILL to false and re-run the build. That is the
   whole removal. Nothing else in the file references it, and every
   invented value lives inside this one object rather than being edited
   into the record above, so there is no hunting for what was fake.

   THE BUILD SHOUTS WHILE THIS IS ON. Every run prints a warning naming
   the person and the fields, so it cannot ship quietly. It must be off
   before these pages are deployed: fabricated awards and registrations
   on a real, named person's page are not a design placeholder, they are
   a false claim about somebody.
   ═══════════════════════════════════════════════════════════════════ */
export const DEMO_FILL = true;

const DEMO = {
  'tarun-motta': {
    /* Awards and appointments, the block that renders on nobody today. */
    recognition: [
      { year: '2024', title: 'Lifetime Contribution to Urban Redevelopment',
        source: 'Placeholder awarding body' },
      { year: '2019', title: 'Consultant of the Year, Redevelopment',
        source: 'Placeholder industry awards' },
      { year: null,  title: 'Appointed to a state policy review committee',
        source: 'Placeholder authority' },
    ],
    /* Formal registrations, which render as pairs at the foot of the
       About prose. His real record carries none. */
    facts: [
      { label: 'Registration', value: 'Placeholder Council registration (0000/00)' },
      { label: 'Member',       value: 'Placeholder professional association' },
      { label: 'Also holds',   value: 'Placeholder postgraduate qualification' },
    ],
    /* A fuller reach row, to see more than two marks in it. */
    links: [
      { kind: 'web',       label: 'teearch.in',           href: 'https://www.teearch.in/' },
      { kind: 'email',     label: 'accounts@teearch.in',  href: 'mailto:accounts@teearch.in' },
      { kind: 'linkedin',  label: 'Placeholder LinkedIn', href: '#' },
      { kind: 'instagram', label: 'Placeholder Instagram', href: '#' },
    ],
  },
};

if (DEMO_FILL) {
  const filled = [];
  for (const p of PEOPLE) {
    const d = DEMO[p.slug];
    if (!d) continue;
    Object.assign(p, d);
    filled.push(`${p.slug} (${Object.keys(d).join(', ')})`);
  }
  if (filled.length) {
    console.warn('\n  \x1b[43m\x1b[30m PLACEHOLDER CONTENT IS ON \x1b[0m');
    for (const f of filled) console.warn('  invented fields on ' + f);
    console.warn('  Set DEMO_FILL = false in scripts/person-profile-data.mjs before deploying.\n');
  }
}

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
