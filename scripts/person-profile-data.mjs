/* ===================================================================
   PERSON PROFILE · SHELL + DATA

   SHELL: a SHIPPED PERSON PAGE (person-profile-adi-godrej.html).

   The page inherits everything outside <main> wholesale: head, meta,
   font-face, the /dist/person-profile.css link, JSON-LD slot, body
   classes, off-canvas, slim topbar, contact modal, microfooter PARTIAL,
   script tail, sticky bar, share sheet, closing tags. The generator
   writes only <main> plus the handful of per-person strings the chrome
   carries (title/meta/og/twitter, JSON-LD, the topbar name, three
   data-brand attributes, the share preview name).

   Why a person page and not people.html + fragments. The previous
   version stitched the chrome from people.html and a dozen CSS/HTML/JS
   slices of brand-profile-teearch.html, each found by a text anchor.
   The c413332 dedup moved that CSS into dist/ and every anchor went
   stale, so the build broke while the pages kept being hand-edited
   (share sheet, microfooter partial, nav-height.js). Stitching failed
   silently five times before that too. Reading the chrome from a page
   that already ships means a chrome edit made there (or by
   build:partials) carries to every profile on the next build, and there
   is nothing left to anchor on.

   All <main> content, including its inline styles, comes from render().
   The page stylesheet is /dist/person-profile.css; edit it there.
   =================================================================== */
import { promises as fs } from 'node:fs';

const ROOT  = 'd:/WORK/ghar-claude/';
const SHELL = 'person-profile-adi-godrej.html';
const src   = await fs.readFile(ROOT + SHELL, 'utf8');

/* The REAL opening tag: the head carries comments that mention <main. */
const mainOpen  = src.indexOf('<main id="main"');
const mainClose = src.lastIndexOf('</main>');
if (mainOpen < 0 || mainClose < mainOpen) throw new Error(`shell: <main id="main"> ... </main> not found in ${SHELL}`);

export const SHELL_PRE  = src.slice(0, mainOpen);        // doctype -> just before <main>
export const SHELL_POST = src.slice(mainClose + 7);      // after </main> -> </html>
/* The exemplar's own name, read from the page so a rename there cannot
   leave its name baked into every other profile. */
/* The shell's palette slug on <body>, swapped for each person's parent brand. */
export const SHELL_PALETTE = (src.slice(0, mainOpen).match(/<body[^>]*data-palette="([^"]*)"/) || [])[1];
if (!SHELL_PALETTE) throw new Error(`shell: data-palette missing on <body> in ${SHELL}`);
export const SHELL_NAME = (src.slice(mainOpen, src.indexOf('>', mainOpen)).match(/data-brand-name="([^"]*)"/) || [])[1];
if (!SHELL_NAME) throw new Error(`shell: data-brand-name missing on <main> in ${SHELL}`);

/* The microfooter is the one piece of shared chrome INSIDE <main>. It is a
   PARTIAL (build:partials stamps it), so it is carried verbatim, from the
   line holding its start marker up to </main>. */
const mfMarker = src.indexOf('<!-- PARTIAL microfooter:start -->', mainOpen);
if (mfMarker < 0 || mfMarker > mainClose) throw new Error(`shell: microfooter PARTIAL not found inside <main> in ${SHELL}`);
export const SHELL_MICROFOOTER = src.slice(src.lastIndexOf('\n', mfMarker) + 1, mainClose);
if (!SHELL_MICROFOOTER.includes('<!-- PARTIAL microfooter:end -->')) throw new Error('shell: microfooter end marker missing');

/* Assertions. Each one exists because its absence previously shipped. */
const CONTRACT = [
  [SHELL_PRE, ['@font-face', '/dist/styles.min.css', '/dist/person-profile.css', '/dist/brand-theme.css', '<title>',
               'rel="canonical"', 'application/ld+json', '</head>', '<body', 'id="ocMenu"',
               'bpr-topbar__title'], 'SHELL_PRE'],
  [SHELL_POST, ['brContactModal', 'main.min.js', 'bpr-sticky-contact__back',
                'bpr-sticky-contact__primary', 'bpr-sticky-contact__util', 'brShareModal',
                'brSharePreviewName', '</body>', '</html>'], 'SHELL_POST'],
];
for (const [region, needs, label] of CONTRACT) {
  for (const need of needs) {
    if (!region.includes(need)) throw new Error(`${label} (from ${SHELL}) is missing ${need}`);
  }
}
if (SHELL_PRE.includes('<main id="main"') || SHELL_POST.includes('<main id="main"')) {
  throw new Error('shell: <main> leaked into the chrome');
}

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
   don't need to branch. Color is NOT here: the person page takes its parent
   brand's palette from scripts/brand-palettes.mjs by slug. */
const GODREJ = {
  name: 'Godrej Properties', slug: 'godrej-properties',
  logo: 'brand_assets/brands/godrej-properties.svg',
  line: 'Part of a 125+ year old group; one of India’s largest listed developers.',
  city: 'Mumbai',
  site: 'godrejproperties.com',
};
const AVIRAHI = {
  name: 'Avirahi Group', slug: 'avirahi',
  logo: 'brand_assets/brands/avirahi.webp',
  line: 'Three decades of residential and commercial development across Mumbai and Avirahi City Dholera.',
  city: 'Mumbai',
  site: 'avirahi.com',
};
const SCARLET = {
  name: 'Scarlet Splendour', slug: 'scarlet-splendour',
  logo: 'brand_assets/brands/scarlet-splendour.png',
  line: 'India’s theatrical luxury furniture house, exported to design galleries worldwide.',
  city: 'Kolkata',
  site: 'scarletsplendour.com',
};

const TEEARCH = {
  name: 'TEEARCH', slug: 'teearch', logo: 'brand_assets/brands/teearch.jpg',
  line: 'Architecture, liaisoning, project management and transaction advisory, Mumbai.',
  city: 'Mumbai',
  site: 'teearch.in',
  /* Firm-level, and deliberately NOT rendered on a person's page: an
     empanelment belongs to TEEARCH, and repeating it under an individual
     quietly transfers the firm's standing to the person. It lives on
     /brands/teearch. Kept here because the firm record is shared. */
  empanelments: ['LIC', 'SRA', 'MHADA', 'MSIDC', 'BMC', 'MMRDA', 'RCF'],
};

/* StudiFOV — first DARK-THEME brand record on the portal, added to
   verify the dark-theme scaffolding (data-theme="dark" on <main>,
   CSS branch under body:is(...)[data-theme="dark"]). Bright teal
   accent on a near-black ground, in the CRED / modern-tech studio
   aesthetic the user called out. Fictional placeholder — swap the
   name, address, phone, etc. when the real brand onboards. */
const STUDIFOV = {
  /* Studio FOV — real brand, pulled from studiofov.com. 3D architectural
     walkthrough + scale-model company based in Delhi (Mumbai second
     office). Their site uses a dark navbar with red primary accent;
     for our Ghar.tv brand-profile tenant we adopt the full dark theme
     to test that pattern against a real dark-brand identity.

     Palette: registry key 'studiofov' in scripts/brand-palettes.mjs
     (this page slug is 'studifov'). */
  name: 'Studio FOV', slug: 'studifov', logo: 'brand_assets/brands/studio-fov.svg',
  palette: 'studiofov',
  theme: 'dark',
  line: '3D architectural walkthroughs and scale models for developers, architects and the real-estate industry, in Delhi and Mumbai.',
  city: 'Delhi',
  site: 'studiofov.com',
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
    image: '/brand_assets/ghartv/7574.png',
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
  /* Removed 2026-09-06: an "Arjun Nair" record fabricated for StudiFOV
     was scaffolded here to test the dark-theme branch. The name was
     invented (literally from the Delhi office street "Arjun Nagar"),
     the bio/credentials were invented, and studiofov.com lists no
     public founder profile to replace it with. Do NOT reinstate any
     StudiFOV person record without a real, verifiable name + role
     sourced from the brand directly. */

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
