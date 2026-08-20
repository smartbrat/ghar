/* ===================================================================
   PERSON PROFILE BUILDER  ·  /people/{slug}

   Emits:
     person-profile.html            the TEMPLATE ({{TOKENS}} + REPEAT fences)
     person-profile-{slug}.html     one rendered page per record

   Both come from the SAME render(), so the template cannot drift from
   what ships. Run: npm run build:people
   =================================================================== */
import { promises as fs } from 'node:fs';
import {
  SHELL_HEAD, SHELL_BODY, SHELL_TAIL, CHROME_CSS, PERSON_CARD_CSS, TOPBAR_CSS,
  SHARE_CSS, SHARE_HTML, SHARE_JS, STICKY_CSS, TOPBAR_JS,
  SPOT_CSS, INTEL_CSS, RAIL_CSS, PLAY_CSS,
  CONTENT_GROUPS, CATEGORIES, PEOPLE, esc,
} from './person-profile-data.mjs';

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

/* ═══════════════════════════════════════════════════════════════════
   .pp-* PERSON PROFILE

   This is a PORTFOLIO, not a directory entry and not a brand microsite.
   The distinction is load-bearing and it is where the previous version
   went wrong: that one was assembled out of brand-microsite components,
   so its projects appeared as a rail of 320px media cards among tinted
   Intelligence tiles and a dark tenant contact band, and the whole page
   read as a company's page with someone's face at the top.

   A portfolio leads with the person and then shows the WORK LARGE. Six
   real project photographs at full editorial scale is the substance of
   this page; everything else is set quietly around them.

   MOTION POLICY
   Transform and opacity only. CSS transitions driven by an
   IntersectionObserver with NO GSAP dependency: the shared carousel
   pulls GSAP from a third-party CDN and we have already seen that
   request fail, so nothing load-bearing may depend on it. The hidden
   state applies only under body.pp-anim, added by JS on boot, so if the
   script never runs the page renders fully visible.
   ═══════════════════════════════════════════════════════════════════ */
const CSS = `
    /* The slim bar is 56px and it is what --mainnav-h now means on this
       page. Every sticky offset below reads that one variable, so the
       bar's height is stated once. main.js normally publishes it from
       the portal navbar; there is no portal navbar here. */
    /* ═══════════════════════════════════════════════════════════════
       THE PAGE IS WHITE. All of it.

       This took three goes and the last two were the same mistake in
       different clothes. It started warm-white end to end with one
       unexplained white stripe around Work. Then it inverted to a rule
       that sounded principled, reading surfaces white and object
       surfaces warm, which put a tinted band under Work and Spotlight.

       That second rule was still the warm-white habit with an argument
       attached. Its premise was that a white card needs a tinted ground
       to read as an object, and that is simply not true here: every
       card in those sections already carries its own hairline border,
       so it sits on white perfectly well. The band was solving a
       problem the cards had already solved.

       So: white, and structure comes from RULES AND SPACE. Each section
       opens on a hairline with a short ink mark above its title, the
       two sections that hold photographs get extra air around them, and
       the closer is a bordered white panel.  Nothing is separated by
       paint.

       This lands back on the portal rule it should have started from:
       white is primary, and NO COLOUR IS A VALID ANSWER. The only tint
       left anywhere is the Intelligence card, which is a CARD carrying
       its own identity, not a surface under a section.
       ═══════════════════════════════════════════════════════════════ */
    /* TWO BAR HEIGHTS, and the difference is the point.

       --mainnav-h is the SCROLLED bar, 56px, and it is what every
       sticky offset and scroll-margin below reads, because those all
       resolve at a moment when the page has already been scrolled.

       --pp-bar-rest is the bar BEFORE any scroll, and it is taller. At
       56px the pills sat 8px off the top edge of the screen, which is
       the gap you leave inside a component, not the gap you leave above
       one. The first thing a reader sees on the page was jammed into
       the corner of the window. 84px puts them at 22px and lets the
       chrome breathe against the top of the viewport.

       The bar collapses to 56px on scroll. That costs nothing, because
       a fixed bar changes height without moving a pixel of the page,
       and it is worth having: chrome that tightens as you read gives
       the content back the room the first screen could afford to spend.

       body pads for the REST height, never the scrolled one, or the
       hero would start under a transparent bar. */
    .pp-page{background:#fff;--mainnav-h:56px;--bpr-topbar-h:56px;--pp-bar-rest:84px}
    body.pp-page{padding-top:var(--pp-bar-rest)}
    @media(min-width:768px){
      body.pp-page .bpr-topbar{height:var(--pp-bar-rest);
        transition:background .3s ease,backdrop-filter .3s ease,border-color .3s ease,height .3s cubic-bezier(.2,.7,.2,1)}
      body[data-scrolled].pp-page .bpr-topbar{height:var(--mainnav-h)}
    }
    /* The shared stylesheet sets body{overflow-x:hidden}, which computes
       overflow-y to auto and makes BODY a scroll container. Every
       position:sticky on the page then resolves against that container
       instead of the viewport, so the section nav and the work index's
       held panel scrolled away instead of sticking.

       clip clips identically without creating a scrollport, which is
       exactly the substitution brand-profile-teearch.html already makes
       for the same reason. Paired with overflow-y left visible. */
    body.pp-page{overflow-x:clip;overflow-y:visible}
    /* THE TABS HAD NO ANIMATION, they teleported. Sampling every frame
       for 900ms after a click gave exactly one scroll position: the
       destination. The section-anchor tabs, the share sheet's links and
       every in-page href were all doing a hard jump, which on a page
       this long reads as the browser reloading rather than as moving.

       scroll-behavior belongs on the SCROLL CONTAINER, and on this page
       that is the root element, not body. The shared stylesheet's
       body{overflow-x:hidden} used to make body the scrollport, which
       is why this page substitutes clip; with that fixed, document
       scrolling resolves against <html> and the property has to go
       there to have any effect at all.

       html rather than a scoped selector is safe here because this
       stylesheet is written into the page's own <style> block and
       reaches nothing else. It matches the homepage, which has set
       html{scroll-behavior:smooth} since it shipped, so the portal
       moves the same way on every page a reader lands on.

       Honoured, not imposed: reduced motion turns it straight back off,
       because a long programmatic scroll is exactly the kind of motion
       that setting exists to stop. */
    html{scroll-behavior:smooth}
    @media(prefers-reduced-motion:reduce){
      html{scroll-behavior:auto}
    }
    .pp-wrap{max-width:var(--max-w);margin:0 auto;padding:0 var(--pad-h)}

    /* ── motion ─────────────────────────────────────────────────── */
    body.pp-anim .pp-rise{opacity:0;transform:translateY(16px)}
    body.pp-anim .pp-rise.is-in{opacity:1;transform:none}
    body.pp-anim .pp-rise{
      transition:opacity .72s cubic-bezier(.2,.7,.2,1) var(--d,0ms),
                 transform .72s cubic-bezier(.2,.7,.2,1) var(--d,0ms);
    }
    @media (prefers-reduced-motion: reduce){
      body.pp-anim .pp-rise{opacity:1 !important;transform:none !important;transition:none !important}
    }

    /* ── hero ────────────────────────────────────────────────────
       Portrait 4:5, taller than the directory card's 4:3, because this
       is the one page where the person IS the subject. An ambient wash
       in the firm's hex sits behind it for depth: constrained accent,
       never a page-wide mood. */
    /* NO bar clearance in this padding. The shell already sets
       body{padding-top:var(--mainnav-h)} to clear the fixed bar, so
       adding it again pushed the hero 56px down, and with a 100svh
       min-height the credential strip fell 26px past the fold. */
    /* TRIMMED when the bar's rest height grew by 28px. The clearance
       above the identity block is the bar's padding plus this one, so
       the two are a single budget: leaving both untouched would have
       dropped the portrait 28px down the screen to buy the pills their
       air. Roughly half comes back here, which nets out at about 12px
       lower than before and keeps the fold where it was. */
    /* The BOTTOM padding is small because the fact bar's own lower rule
       is what closes the hero. It was 60px, which is right when the last
       thing in the header is a button floating in white and wrong when
       it is a ruled edge: the rule already says "this block ends", and
       60px under it was 60px of the first screen spent on nothing. */
    .pp-hero{position:relative;padding:clamp(10px,1.4vw,22px) 0 clamp(16px,1.8vw,24px)}
    .pp-hero__grid{display:grid;gap:clamp(24px,4vw,54px);grid-template-columns:minmax(0,1fr)}
    @media(min-width:880px){
      /* start, not center. The portrait is 468px and the identity
         column 400px, so centring floated the text 34px down and the
         eyebrow no longer lined up with anything. Sharing a top edge
         reads as a decision; a 34px offset reads as a mistake.

         AND IT STAYS INSIDE THE GRID. The portrait was briefly bled to
         the left viewport edge and enlarged, sold as breaking the grid
         on purpose. It was not a composition, it was one box moved: the
         page kept its 118px gutter everywhere else, so the photograph
         alone started at 0 and simply looked misaligned, and at 490px
         wide it swamped a text column that had not changed. A bleed
         only reads as intent when the whole hero is built for it.
         Nothing else here was, so this is back where it belongs. */
      .pp-hero__grid{grid-template-columns:minmax(0,clamp(300px,26vw,390px)) minmax(0,1fr);align-items:start}
    }
    /* ── TABLETS ─────────────────────────────────────────────────
       THE PORTRAIT WAS EATING THE WHOLE SCREEN. Everything from 744 to
       879 was falling through to the phone layout, where the portrait
       is one full-width column at 4:5. That is right at 390px, where
       the column is 342 wide and the picture 427 tall. At an iPad's
       834 it made a 774 by 967 photograph: taller than the viewport,
       so the reader met a face filling the screen and had to scroll a
       whole page before reaching the name, which appeared at y=1133.

       A phone stacks because it has no width to divide. A tablet has
       plenty, so it divides it, and the only thing it needs of its own
       is a narrower portrait track: 26vw is tuned for a 1440 screen and
       leaves the text column too thin down here. 32vw against a 300px
       cap gives a portrait of about 246 at 768 and 267 at 834, with 450
       to 490 left for the name and the brief.

       Starts at 700 rather than 744 so the small-tablet and large-phone
       band is covered too; below that the stack is genuinely correct.

       879.98, NOT 879. A viewport is not always a whole number: the
       browser reports 879 for innerWidth here and resolves the media
       width at 879.4, which is neither <= 879 nor >= 880, so BOTH rules
       missed and the layout dropped to the phone stack inside a band
       less than a pixel wide. The same fractional grid already shows up
       on this page in the 0.571px hairlines. Ending the range just
       under the next breakpoint closes it. */
    @media(min-width:700px) and (max-width:879.98px){
      .pp-hero__grid{grid-template-columns:minmax(0,clamp(230px,32vw,300px)) minmax(0,1fr);
        gap:clamp(24px,3.2vw,34px);align-items:start}
    }

    /* The head sits INSIDE the identity column beside the portrait, so
       the whole identity reads as one block. It briefly ran full width
       above the split as a masthead: the name got real display scale
       there, but it detached the name from the role, location and brief
       that qualify it, and the portrait lost its partner.

       NO overlap with the portrait either. Pulling the text back over
       the photo's edge put the name across his face and hid the eyebrow
       behind the image. A portrait is not a background. */
    /* THE GAPS ESCALATE: 12, 14, 18, 30.

       Two earlier attempts were both wrong in the same way, by using
       gaps a reader cannot tell apart. The first ran 14 / 14 / 16 / 30,
       flat and then a cliff. The second overcorrected to 12 / 10 / 12 /
       28, which glued the facts to the role and made the drop to the
       brief read as a hole.

       Spacing has to encode how closely two things belong, so each step
       away from the name opens a little further:

         eyebrow → name   12   a label sitting on its heading
         name → role      14   the role qualifies the name
         role → facts     18   a different KIND of fact, so a real step
         facts → brief    30   prose starts, the largest break

       Optical gaps run larger than these numbers because the leading of
       each line adds to them, which is why 18 already reads clearly
       against 14 and 30 does not need to be 40. */
    .pp-hero__head{margin-bottom:clamp(24px,2.6vw,30px)}
    /* 62ch is a READING measure, so it belongs to the prose and to
       nothing else. It was applied to every child of the column, which
       silently cost the facts and the figures 139px of a 765px column at
       1440px: three figures were dividing 626px and the third label
       wrapped, while the empty space sat unused to their right.

       The brief keeps the cap, because a line of body copy past about
       70 characters is measurably harder to track back from. A row of
       icons and a grid of numbers have no such limit: they are scanned,
       not read, and they look under-set in a column they do not fill. */
    .pp-hero__id > *{max-width:min(100%,62ch)}
    .pp-hero__id > .pp-hero__head{max-width:none}
    .pp-portrait-wrap{position:relative}
    /* NO SHAPE BEHIND THE PORTRAIT, and the reference is the reason.

       There was a soft disc here, first as a 38px blur and then as a
       flat fill, both trying to reproduce the circle behind the head in
       the reference. That circle is part of the PHOTOGRAPH: a studio
       backdrop, not a page graphic. Rebuilding a photographic artifact
       in CSS gives you a pale ellipse spreading past the frame with
       nothing anchoring it, which reads as a stain rather than as a
       form, and no amount of tuning the radius or the opacity fixes
       something that was never a design device in the first place.

       A portrait with a hairline, a radius and a shadow is already
       composed. The wrap stays for positioning only. */
    .pp-portrait-wrap{position:relative}
    .pp-portrait{position:relative;z-index:1;aspect-ratio:4/5;border-radius:24px;overflow:hidden;
      background:var(--brand-soft,#f0ebe0);border:1px solid var(--rule);
      box-shadow:0 30px 60px -34px rgba(26,23,20,.42)}
    .pp-portrait img{width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block;
      transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
    .pp-portrait:hover img{transform:scale(1.03)}
    /* SOURCE ORDER, not specificity. This block sits AFTER the base
       .pp-portrait rules on purpose: both selectors are a bare class, so
       a media query placed earlier in the sheet loses to the plain rule
       below it and the ratio silently did not change. The same trap has
       already cost this stylesheet once, with .pp-facts. */
    @media(min-width:880px){
      /* TALLER ON THE SPLIT LAYOUT ONLY. 4/5 was set when the column
         beside it held a name, a role and a paragraph. It now also holds
         the fact row and the figures, so the column measured 495px
         against a 468px portrait and the picture stopped 27px short of
         the text it is paired with, which reads as a misalignment rather
         than as a composition.

         3/4 puts it at 499px at 1440, level with the column. Deliberately
         a fixed ratio and not a stretch to the column's height: a record
         with more to say would pull the frame to 3/5 and crop a face to
         a letterbox. The portrait leading slightly on a sparse record is
         the better failure.

         Scoped here, so the phone keeps its square (see the note in the
         max-width block: a 4/5 frame put the name below the fold at
         390px). */
      .pp-portrait{aspect-ratio:3/4}
    }
    .pp-portrait--mono{display:flex;align-items:center;justify-content:center}
    .pp-portrait__mono{font:700 clamp(76px,13vw,132px)/1 'Gazpacho',Georgia,serif;color:var(--brand,var(--ink))}

    /* The FIELD the person works in, keyed to the /people directory
       category. Not their qualification, which now sits in the foot bar.
       See CATEGORIES in person-profile-data.mjs for why. */
    /* A BADGE, not a caption. As 10px grey caps floating on white it
       was the weakest thing in the hero, and it is the reader's first
       word about this person: it says which of the six directory fields
       they are filed under, which is the one fact on the page that
       exists to be compared against everybody else.

       So it gets an edge. The pill is the same white-and-hairline as
       the reach marks below it, which is what makes it read as a field
       the record CARRIES rather than as a heading somebody wrote, and
       full-strength ink instead of grey because a 10px word needs the
       contrast to survive at that size. It stays 10px: the badge is
       doing the work of being seen now, so the type does not have to.

       No colour and no mark. Six categories tinted six ways would put a
       colour code across a directory that has no colour code, and the
       accent stays reserved.

       BLOCK, shrink-wrapped by max-content, not inline-flex. An inline
       box sits on the parent's baseline and inherits its line box, so
       the 12px gap under it silently became 16px and the badge no
       longer sat at the top of the column.

       ONE CLASS, used twice. The same badge marks the subject's own
       category in the hero and each colleague's category on the peer
       cards at the foot, which is what makes it read as a FIELD the
       directory keeps rather than as decoration: same shape, same
       words, same meaning, wherever it appears. --sm is the only
       difference, and it is only a size. */
    .pp-badge{display:block;width:max-content;max-width:100%;
      font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;text-transform:uppercase;
      color:var(--ink);margin:0 0 12px;padding:7px 11px 6px 12px;
      border:1px solid var(--rule);border-radius:999px;background:#fff}
    .pp-badge--sm{font-size:9px;padding:5px 9px 4px 10px;margin:0}
    /* Sized for a COLUMN, not full width: a masthead's 94px would wrap
       awkwardly beside a 390px portrait.

       NOTHING SITS BESIDE THE NAME. A verified check used to, and it had
       to go: nearly every person arrives through Brand Connect and is
       confirmed by default, so a badge on 95% of pages carries no
       information and instead marks the other 5% as suspect. That 5% is
       the editorially curated experts, which is precisely backwards. The
       claim survives as one line of small print at the foot of the page,
       where it is a fact about the record rather than a rosette. */
    .pp-name{font:700 clamp(36px,4.6vw,60px)/1.03 'Gazpacho',Georgia,serif;color:var(--ink);margin:0}
    /* The city used to sit on this line, 13px and muted against an 18px
       role, baseline-aligned and floating. It is a filter fact, not part
       of a title, so it moved to the foot bar with the other facts. This
       line is now only what they do and who they do it for. */
    .pp-role{font:500 clamp(15.5px,1.8vw,18px)/1.5 'Inter',sans-serif;color:var(--ink2);margin:14px 0 0}
    .pp-role a{color:inherit;text-decoration:none;
      background-image:linear-gradient(var(--ink),var(--ink));background-size:100% 1px;
      background-repeat:no-repeat;background-position:0 100%;
      transition:background-size .3s cubic-bezier(.2,.7,.2,1)}
    .pp-role a:hover{background-size:100% 2px}
    /* Topic chips. They opened the page as a strip under the hero and
       now close it, beside the other route back into the directory:
       they are navigation, and their old home said the same thing the
       eyebrow had already said, with nothing to click. Margin comes from
       the block that holds them. */
    .pp-tags{display:flex;flex-wrap:wrap;gap:7px;list-style:none;padding:0;margin:0}
    .pp-tags li{display:inline-flex}
    .pp-tags span,.pp-tags a{font:500 11px/1 'Inter',sans-serif;padding:8px 11px;border-radius:6px;
      background:rgba(26,23,20,.05);color:var(--ink2);text-decoration:none}
    .pp-tags a{transition:background .22s ease,color .22s ease}
    .pp-tags a:hover{background:var(--ink);color:#fff}

    /* PAIRED CTAs follow the portal's canonical two-button treatment, the
       one in design-system.html under "Live, grouped form": primary DARK,
       secondary a subtle warm white. Colour values come from
       .jm-btn--primary / .jm-btn--secondary rather than being reinvented.
       Only the GEOMETRY is local: .jm-btn is a full-width form submit and
       these are inline page CTAs, so they stay pills.

       The secondary once used a transparent fill that inverted to solid
       ink on hover, which put TWO dark buttons side by side and destroyed
       the hierarchy. A secondary stays quiet on hover. */
    .pp-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
    .pp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
      padding:13px 22px;border-radius:999px;
      background:#fff;color:var(--ink);border:1px solid var(--field-rule,rgba(26,23,20,.18));
      font:600 13px/1 'Inter',sans-serif;cursor:pointer;text-decoration:none;
      transition:background .22s ease,border-color .22s ease,box-shadow .22s ease,gap .22s ease,transform .15s ease}
    .pp-btn:hover{border-color:var(--ink);background:var(--warm-white,#faf7f2);gap:12px}
    .pp-btn:active{transform:scale(.98)}
    .pp-btn:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
    .pp-btn svg{width:14px;height:14px;flex-shrink:0}
    .pp-btn--primary{background:var(--ink);color:#fff;border-color:var(--ink)}
    .pp-btn--primary:hover{background:#222;border-color:#222;box-shadow:0 4px 16px rgba(0,0,0,.12)}

    .pp-brief{margin:0}
    .pp-brief p{font:400 clamp(16px,1.7vw,18px)/1.8 'Inter',sans-serif;color:var(--ink2);
      margin:0;max-width:60ch}

    /* ── credentials ─────────────────────────────────────────────
       Definition pairs, not stat tiles. A registration number inflated
       into a display figure would misrepresent what it is.

       THEY LIVE IN ABOUT NOW, at the end of the prose. They were a strip
       across the foot of the hero, which fails at both ends of the
       directory: most people have none, so the hero ended on a rule with
       nothing under it, and the people who DO have them have long ones
       ("Registered Licensed Surveyor, MCGM (2004)") that a one-line meta
       bar cannot hold. Down here a reader has already asked for depth,
       the column is 62ch wide, and an empty list simply does not render.

       Two columns maximum for that reason: three was sized for the full
       1560px hero and would set these at 20ch each in the prose column. */
    .pp-facts{display:grid;margin:clamp(30px,3.6vw,44px) 0 0;padding:0;border-top:1px solid var(--rule)}
    @media(min-width:640px){.pp-facts{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:36px}}
    .pp-fact{display:flex;flex-direction:column;gap:4px;padding:17px 0;border-bottom:1px solid var(--rule)}
    .pp-fact__label{font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;text-transform:uppercase;
      color:var(--faint,#6a6a6a)}
    .pp-fact__value{font:500 14.5px/1.45 'Inter',sans-serif;color:var(--ink)}

    /* ── hero figures ────────────────────────────────────────────
       THE NUMBERS, ABOVE THE FOLD AND INSIDE THE IDENTITY COLUMN.

       A reader arriving from a byline or a search result should be able
       to size someone up without scrolling, and a page whose first
       screen is a portrait and a paragraph makes them scroll to find
       out. It is also the part of the hero a search engine can read as
       structure rather than prose.

       THEY SAT IN A FULL-WIDTH BAND under the portrait first, which was
       the brand microsite's metric ribbon copied across. On a brand page
       that band closes a full-width masthead; here the hero is a
       photograph beside a narrow column, so the numbers ended up under
       the picture rather than beside the person and read as page
       furniture. In the column they are part of the identity, in the
       measure the eye is already reading, and the order becomes brief,
       figures, action: the numbers are the argument and the button is
       the ask, so the argument comes first.

       COUNT-AWARE. The 2x2 grid that makes this layout look good in a
       mock wants four figures, and most people honestly hold two or
       three. Two and three share one row; only four folds to 2x2.
       Nothing here creates pressure to invent a fourth.

       REAL FIGURES ONLY, from the record, never derived and never
       rounded up. There is no "10,000+" and no count of the sections
       below: an earlier version put "06 Projects, 02 Published" here and
       it was a tally of things the reader was about to scroll past. A
       person with nothing countable renders no block at all, which is
       most of a directory, so its absence has to be the graceful case. */
    /* COUNT-AWARE. The 2x2 grid that makes this layout look good in a
       mock wants four figures, and most people honestly hold two or
       three. Two and three share one row; only four folds to 2x2.
       Nothing here creates pressure to invent a fourth.

       REAL FIGURES ONLY, from the record, never derived and never
       rounded up. There is no "10,000+" and no count of the sections
       below: an earlier version put "06 Projects, 02 Published" here and
       it was a tally of things the reader was about to scroll past. A
       person with nothing countable renders no block at all, which is
       most of a directory, so its absence has to be the graceful case. */
    /* ── figures, in the identity column ─────────────────────────
       No rule above them and no rule below. The bar underneath already
       gives the hero its horizontal lines, and a third one twelve pixels
       further up turns the bottom of the column into a stack of
       hairlines. Space separates them from the brief instead.

       auto-fit, so two figures divide the column and three or four
       divide it just as well without a rule per count. */
    .pp-figs{display:grid;gap:16px 26px;margin:clamp(20px,2.2vw,26px) 0 0;
      grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))}
    .pp-fig{min-width:0}
    /* Gazpacho on the value, per the portal rule that a number set at
       14px or over takes the display face. Line-height never below 1.25:
       Gazpacho clips its descenders tighter than that, and "Since 1982"
       wraps in a 150px cell. */
    /* UP from 17px. At that size the values were the same weight as the
       specialisations below them and lighter than the role line above,
       so the one part of the column carrying quantities read as caption.
       22px is a clear step under the 60px name without approaching it. */
    .pp-fig__n{display:block;margin-bottom:4px;
      font:700 22px/1.25 'Gazpacho',Georgia,serif;color:var(--ink)}
    .pp-fig__l{display:block;font:400 13px/1.45 'Inter',sans-serif;color:var(--muted)}

    /* ── the bar that closes the hero ────────────────────────
       WHITE, and that is the correction.

       It ran as a committed dark panel with a grain overlay, on the
       argument that a dark object gives the hero a bottom edge and reads
       as identity on every profile. Both true, and both beside the
       point. This hero already carries a bordered badge, a display name,
       an icon meta row, three Gazpacho figures and four outlined
       circles, so the one thing it did not need was a sixth material. A
       dark grained rectangle under all of that is not a closing edge,
       it is a seventh voice in a column that already has six.

       So the bar stops being an object. A hairline, a label, and the
       phrases themselves in the page's own body face at body size: the
       hero closes on a rule, the way an editorial page does.

       THE LABEL SITS ON TOP. Inline it took the first column of the row,
       and the row is the part that has to hold three to five phrases.
       Stacked it costs 15px of height and hands every phrase its full
       column width back.

       THE ITEMS ARE NOT DISPLAY TYPE. At 17px Gazpacho they read as
       three headlines competing with the 60px name two inches above.
       15px Inter is the weight of a fact rather than a claim, which is
       what a specialisation is, and it puts them in the same voice as
       the brief they sit under instead of inventing a fifth one. */
    /* RULED TOP AND BOTTOM. With only the top rule the row had an open
       foot, so its 16px of bottom padding ran straight on into the 30px
       of hero below it and the block read as top-heavy even though the
       two paddings were already equal. A closed band gives the eye
       something to measure the second 16px against, and it gives the
       header's vertical rule a second end to meet: it now runs from the
       hairline above to the hairline below rather than stopping in air.

       Every vertical measure inside the band is symmetrical. The parts
       carry 16px top and bottom, the row stretches to the tallest of
       them, and each part centres its own contents inside that height,
       so the label, its mark and the phrases all sit on one optical
       centre line. */
    .pp-fb{margin-top:clamp(34px,3.8vw,50px);
      border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
    /* THE EYEBROW TOKEN, EXACTLY: 10px, .1em, --faint. The hero's other
       small caps is the category badge at the top of the column, and a
       second uppercase label at a different size, weight and colour is
       how a column starts looking assembled rather than designed.

       INK, not --faint, and that is the header doing its job. Grey is
       the colour of a caption, something the eye is invited to skip. The
       badge at the top of this column is already 10px ink caps, so this
       is not a second token: it is the same one, and the two ends of the
       hero now speak in one voice.

       The size and tracking are the badge's to the decimal. What
       separates the header from the phrases beside it is 10px caps
       against 15px sentence case, which is a difference of kind rather
       than of degree, and no amount of it can be mistaken for one of the
       items. */
    .pp-fb__l{display:inline-flex;align-items:center;gap:9px;margin:0;flex:0 0 auto;
      padding:16px 26px 16px 0;border-right:1px solid var(--rule);
      font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;
      text-transform:uppercase;color:var(--ink)}
    /* MONOCHROME, and full ink. It was ochre, which made a 12px glyph the
       only colour on the first screen and gave a decorative mark more
       voice than the category badge above it. In ink it is a typographic
       mark rather than a highlight, and it can afford the extra 2px
       because it is no longer competing on hue. */
    .pp-fb__spark{display:inline-flex;width:18px;height:18px;flex-shrink:0;color:var(--ink)}
    .pp-fb__spark svg{width:100%;height:100%;display:block}
    /* A ROW, NOT A GRID, and that is what makes it a list.

       It was five auto-fill tracks with a rule ticked over each one, and
       two things were wrong with that. Fixed tracks set every phrase in
       a 218px bay whatever its length, so "Redevelopment" sat in a third
       of a screen of its own; and the leading tick, drawn in ink to mark
       where the row began, read as a SELECTED state on the item beneath
       it, which is the one thing a flat list must never imply.

       So the tracks go and the phrases size themselves. A hairline
       between each pair separates them without claiming anything about
       any of them, and the rule across the top of the row does the
       framing the ticks were doing.

       The divider is an ::after on the item, never a ::before. Both put
       a rule between every pair; only the trailing one degrades well
       when the row wraps, where a leading rule would open a line with a
       stray mark.

       TWO CLASSES OF RULE, and this is what finally makes it a group
       rather than a line of text with a caption stuck on the front.

       The header is split from the list by a rule that runs the FULL
       height of the row, from the hairline above it to the floor of the
       hero. The items are split from each other by a 13px tick floating
       at their centre. One is structure and one is punctuation, and the
       difference in length says which is which before the type does.

       That is also what the vertical padding is doing on the parts
       rather than on the panel: the header's rule can only reach the
       hairline above if the space between them belongs to the header.

       The spacing either side of the header's rule is deliberately
       WIDER than the spacing either side of an item tick, 26 against 24,
       so the two systems agree even where they nearly meet. */
    .pp-fb__row{display:flex;flex-wrap:wrap;align-items:stretch;gap:0 24px}
    .pp-fb__cell{min-width:0;display:flex;align-items:center;gap:24px;padding:16px 0}
    .pp-fb__cell:not(:last-child)::after{content:'';flex:0 0 auto;align-self:center;
      width:1px;height:13px;background:rgba(26,23,20,.16)}
    /* SENTENCE CASE. These ran as 12.5px caps for a version, on the
       argument that caps is what the reference strips use and what these
       words are. Both true, and it cost more than it bought: caps put
       the phrases in the same register as the header above them, so the
       one distinction the band depends on had to be carried by size and
       colour alone, and long entries like "Liaisoning & statutory
       approvals" read slower set that way.

       15px at weight 500 is the reading size, and the header stays a
       header because it is 10px caps and these are not. */
    .pp-fb__t{margin:0;font:500 15px/1.5 'Inter',sans-serif;color:var(--ink)}
    .pp-fb__t a{color:inherit;text-decoration:none;
      background-image:linear-gradient(var(--ink),var(--ink));background-size:0 1px;
      background-repeat:no-repeat;background-position:0 100%;
      transition:background-size .35s cubic-bezier(.2,.7,.2,1)}
    .pp-fb__t a:hover{background-size:100% 1px}
    /* NARROW: THE HEADER'S RULE ROTATES, it does not disappear.

       Stacking the phrases was right and stopping there was not: three
       lines of ink under a grey caption, with the band's own two rules a
       long way above and below, is a paragraph, not a group. The header
       was left doing its job on type alone.

       So the same two classes of rule survive the breakpoint, turned
       ninety degrees. The rule that separated header from list runs
       across the header instead of down its right side, because a
       vertical rule on a full-width header would sit against the right
       margin pointing at nothing. The item ticks stand down entirely:
       stacked phrases are already on separate lines, and a phrase that
       wraps inside itself makes a tick beside it meaningless.

       THE TICKS ROTATE TOO. They were dropped here on the reasoning that
       stacked phrases are already on separate lines and need no help,
       which was true and produced exactly the problem: an evenly spaced
       column of plain text with nothing holding it together. The rule
       between two items is not there to prove they are different lines,
       it is there to make the set read as a ruled list. Turned flat it
       does that, and the band becomes a specification a thumb can scan
       rather than a paragraph.

       The result is the same object at both widths. Band, header, rule,
       list, in a column rather than a row. */
    /* UP TO 879, not 743, which is where the hero's own two-column
       layout begins. The single-line row needs about 790px to hold a
       header and three phrases; a tablet hero is 786 wide at an iPad's
       834, so the row was wrapping into a second line that started
       under the header aligned to nothing. The panel form has no such
       floor, and the two treatments now change over at exactly the
       width where the hero itself changes. Same fractional-viewport
       guard as the hero: 879.98 rather than 879. */
    @media(max-width:879.98px){
      /* A PANEL HERE, TWO RULES THERE, and the difference is what the
         band has to do at each width.

         On the desktop the band is the floor of a full-height hero: it
         is pinned to the fold with the whole composition standing on it,
         so two hairlines are all the framing it needs and a filled card
         would read as an object dropped on the floor rather than as the
         floor itself. Nothing on a phone is pinned. The hero is a scroll
         of stacked blocks, the band is one of them, and a pair of
         hairlines around a column of text is the weakest way to say
         "these belong together" in a stack where everything else is
         also separated by space.

         So the tint carries the grouping here and the rules carry it
         there. #f9f9f7 is the homepage's own panel tone rather than a
         new grey, and it is doing what a tint is actually good at:
         marking one block as a set. Nothing inside it is tinted, which
         is the distinction that matters, because a fill on each phrase
         would have made three chips out of a list. */
      .pp-fb{margin-top:clamp(30px,6.5vw,38px);padding:0 clamp(16px,2.4vw,24px);
        background:#f9f9f7;border-radius:16px;border-top:0;border-bottom:0}
      .pp-fb__row{gap:10px 0}
      /* NO RULES INSIDE THE PANEL. Ruling a list that is already inside
         a tinted card is saying the same thing twice: the panel edge has
         already grouped these, and the internal hairlines only chopped
         the group back into slices. The panel took over that job when it
         arrived, and the rules should have come out with it. */
      .pp-fb__l{flex:0 0 100%;padding:18px 0 0;border-right:0}
      /* Bigger here than on the desktop. It leads a full-width eyebrow
         at the top of a panel rather than sitting in a 56px row, so it
         has the height to carry and the eyebrow needs the anchor. */
      .pp-fb__spark{width:20px;height:20px}
      /* 18px clear of the eyebrow, against 10px between the entries, so
         the header separates from the set by more than the set separates
         from itself. That relation is the only thing making it a header
         now that no rule is doing it. */
      .pp-fb__l + .pp-fb__cell{margin-top:8px}
      .pp-fb__cell{flex:0 0 100%;padding:0;gap:12px;align-items:flex-start}
      /* A BULLET, not a tick: the desktop's vertical ticks divide items
         standing side by side, and nothing needs dividing in a stack.
         What a stack wants is a marker saying every line is one of a
         kind. Sized and offset to sit on the first line's optical
         centre, and grey rather than ink, because a list marker is
         punctuation and should never out-weigh the word it points at. */
      .pp-fb__cell::before{content:'';flex:0 0 auto;
        width:5px;height:5px;border-radius:50%;margin-top:9px;
        background:rgba(26,23,20,.3)}
      .pp-fb__cell:last-child{padding-bottom:18px}
      .pp-fb__cell:not(:last-child)::after{display:none}
    }

    /* ── identity meta ───────────────────────────────────────────
       City and qualification, sitting DIRECTLY UNDER THE BRIEF inside
       the identity column, with the reach pills alongside the action.

       They used to be a bar across the foot of the hero, mirroring the
       brand microsite's meta row. On a brand page that row closes a
       full-width hero and reads as the foot of a masthead. On a person's
       page the hero is a portrait beside a narrow column, so the same
       device put the city 400px away from the name it belongs to, under
       the photograph, with a rule between them. It read as page
       furniture rather than as part of the identity.

       Under the brief it is what it actually is: the last line of who
       this person is and where they are. The figures ribbon keeps the
       foot to itself, which is the right thing to span the full width
       because a number strip is a band, not a caption. */
    /* ── identity facts, STACKED ─────────────────────────────────
       A VERTICAL LIST UNDER THE NAME, one fact per row, icon then value.

       This was a horizontal dateline above the name for about an hour,
       and it failed on a phone: three items with icons and letter-spaced
       caps have nowhere to go at 390px, so they wrapped into a ragged
       two-line block sitting on top of the name. A row that has to fit
       three things side by side is the wrong shape for the narrowest
       column on the page.

       Stacked, it cannot break. It is also the shape a profile actually
       wants: these are attributes of a person, and a reader scans
       attributes down a list far faster than along a line.

       SENTENCE CASE, 14px, not the old 11px caps. Caps were a
       compromise for sitting above a 60px name without competing with
       it. Below the name there is nothing to compete with, so the facts
       can be set at a size a reader does not have to lean into, and
       shouted caps in a stacked list read as a form.

       ONE THING stays above the name: the category eyebrow. An
       orientation label belongs there, and it is short enough never to
       wrap. Everything else moved below, because the role and the
       attributes only make sense once you know whose they are. */
    /* MOBILE-FIRST, so the default is the shape that cannot break: a
       column. Two or three facts read as a short list under the role and
       nothing has to fit anywhere. */
    /* TWO GAPS, and they have to differ or the row stops reading as
       items. An icon belongs to the word beside it, so 7px binds them
       into one object; the gap BETWEEN items has to be clearly larger
       than that or "Mumbai" and the next icon look equally spaced and
       the eye groups them wrongly. 11px against 28px was too close to
       call, which is why the row read as five loose things rather than
       two facts. 7 against 30 is unambiguous.

       Icons drop 17px to 16px: at 14px text a 17px glyph sat taller than
       the line it labels and pushed the row's optical baseline down. */
    .pp-idfacts{display:flex;flex-direction:column;gap:10px;margin:18px 0 0;
      padding:0;list-style:none;font:400 14px/1.45 'Inter',sans-serif;color:var(--ink2)}
    .pp-idfacts li{display:flex;align-items:center;gap:7px}
    .pp-idfacts svg{width:16px;height:16px;flex-shrink:0;color:var(--ink);opacity:.75}
    /* From 640px there is room for one line, and one line is better
       there: it costs two rows of height in the part of the page that
       has to hold the portrait, the name, the brief and the action
       together, and three short facts side by side are still scannable
       at that width.

       WRAP IS LEFT ON deliberately. The row is the preference, not a
       promise: a record with a long qualification ("Civil Engineer,
       Licensed Surveyor") on a 700px column would otherwise be clipped
       or force a horizontal scroll. Wrapping drops the overflowing fact
       to a second line, and because every item carries its own icon it
       still reads as a fact rather than as a stray fragment. */
    @media(min-width:640px){
      .pp-idfacts{flex-direction:row;flex-wrap:wrap;gap:10px 30px}
    }

    /* This inset the reach marks 4px from the CTA that used to sit
       beside them. That button is in the bar now and the marks start the
       row, so the inset would only push them off the column's left
       edge, out of line with the name and the brief above. */

    /* ── hero foot ───────────────────────────────────────────────
       THE BAR IS GONE. It carried the city, the qualification and the
       reach pills across the full width under the portrait, which is
       where the brand microsites close their hero and the wrong place
       here: a brand's hero is one full-width masthead, a person's is a
       photograph beside a narrow column, so the same device put the city
       400px from the name it belongs to with a rule between them. All of
       it moved up into the identity column, under the brief.

       What is left at the foot is the figures ribbon alone, and that
       belongs full width because a strip of numbers is a band rather
       than a caption. When a record has no figures the foot does not
       render at all. */

    /* Reach: a MARK, and it stays one size.

       It started as the brand hero's hover-expand pill, a 36px circle
       that grew sideways to reveal the handle. That mechanic is wrong
       here and it was wrong there. Six of them in a row means six
       controls that each move their neighbours when a cursor crosses
       them, so the row rearranges itself under the pointer; the label
       can only ever open in one direction, so the last pill opens over
       whatever sits beside it; and touch has no hover at all, which is
       why the labels had to ship permanently open on a phone, where a
       row of six wrapped to three lines of text nobody asked to read.

       So the circle is a fixed 36px and the name lives in a tooltip on
       the shared .tip chassis, which sits OVER the layout and moves
       nothing. The icon comes up to 18px, half the circle: at 14px it
       was a speck in a lot of white and the platform glyph, which is
       the only thing identifying the link at rest, was the part being
       starved.

       The brand values assume a dark hero: white-alpha glass and white
       strokes. This hero is white, so the resting state takes ink on
       white with a hairline. Every hover value is the platform's real
       hex, unchanged. */
    .pp-reach{display:inline-flex;align-items:center;gap:8px;flex-shrink:0}
    .pp-reach__wrap{display:inline-flex;flex:0 0 auto}
    .pp-reach__link{width:36px;height:36px;flex:0 0 auto;
      display:inline-flex;align-items:center;justify-content:center;
      border-radius:999px;
      background:#fff;border:1px solid var(--rule);color:var(--ink);text-decoration:none;
      transition:background .3s ease,border-color .3s ease,color .3s ease}
    .pp-reach__link:hover,.pp-reach__link:focus-visible{color:#fff;outline:none}
    .pp-reach__link--web:hover,.pp-reach__link--web:focus-visible,
    .pp-reach__link--email:hover,.pp-reach__link--email:focus-visible{
      background:var(--ink);border-color:var(--ink)}
    .pp-reach__link--linkedin:hover,.pp-reach__link--linkedin:focus-visible{
      background:#0A66C2;border-color:#0A66C2}
    .pp-reach__link--instagram:hover,.pp-reach__link--instagram:focus-visible{
      background:#E4405F;border-color:#E4405F}
    .pp-reach__link--youtube:hover,.pp-reach__link--youtube:focus-visible{
      background:#FF0000;border-color:#FF0000}
    .pp-reach__link--x:hover,.pp-reach__link--x:focus-visible{
      background:#000;border-color:#000}
    .pp-reach__link--facebook:hover,.pp-reach__link--facebook:focus-visible{
      background:#1877F2;border-color:#1877F2}
    .pp-reach__icon{width:18px;height:18px;flex-shrink:0;display:inline-flex}
    .pp-reach__icon svg{width:100%;height:100%;display:block}
    @media(prefers-reduced-motion:reduce){
      .pp-reach__link{transition:none}
    }

    /* FULL SCREEN, gated on THREE things now: width, height, and whether
       the record has enough to fill a screen.

       Below 880px the layout stacks and one screen cannot hold portrait
       plus identity plus facts. Under 640px tall (laptops with browser
       chrome, split screens) forcing full height squeezes everything
       into an unreadable band.

       The third gate is .pp-hero--tall, which the generator adds only
       when the record carries a brief AND at least three items across
       the foot bar. Without it, a sparse record centred its short
       identity block in a 100svh box and left a 200px hole between the
       bar and the section below, which is exactly what the thinnest
       page in the set was doing. A page with little to say should be
       short, not padded out to look full.

       min-height, never height: a person with seven facts needs more
       room than one with two, and a fixed height would clip them. */
    /* AND A CEILING ON THE HEIGHT, which the tablets exposed.

       Holding the fold is worth doing on a laptop, where the hero fills
       roughly a screen and the specialisations land on the bottom edge
       of it. On an iPad Pro in portrait the viewport is 1366 tall, so
       the same rule stretched the hero to 1282 around a 400px portrait
       and left about 350px of white above the content and 380 more
       between the reach marks and the pinned row. A full-height hero
       only reads as composed while the content can plausibly fill it.

       Above 1100 the hero takes its natural height instead, which on a
       tall screen puts the whole first screen and the start of About in
       view at once: a better use of the room than stretched emptiness.
       Laptops from 640 to 1100 are unaffected. */
    @media(min-width:880px) and (min-height:640px) and (max-height:1100px){
      .pp-hero--tall{
        /* The screen MINUS the bar, because body already pads for it,
           and it pads for the REST height, so this subtracts the same
           one. Subtracting the scrolled 56px instead would leave the
           hero 28px taller than the room actually left on the screen
           and push its own foot past the fold. */
        min-height:calc(100svh - var(--pp-bar-rest,84px));
        display:flex;flex-direction:column;
        padding-top:clamp(8px,1.1vw,18px);padding-bottom:clamp(18px,2.2vw,30px);
      }
      /* THE SPECIALISATIONS SIT ON THE FLOOR, and this is the rule that
         puts them there.

         justify-content:center used to centre the whole stack, which
         left the row 120px clear of the hero's bottom edge and 55px
         clear of the column above it: attached to neither, floating in
         an empty area.

         Auto margins on the GRID rather than on the row. Auto margins
         consume free space before justify-content ever sees it, so an
         auto top margin on the row alone would have pinned the row
         correctly and shoved the portrait to the ceiling with it.
         Splitting the space across the grid's top and bottom margins
         keeps the portrait and the identity column centred exactly
         where they already sit, and spends the surplus below them.

         The row's own margin-top survives underneath as the minimum gap
         for the case where there is no free space to hand out. Nothing
         is gated to a full-height record: a hero that is not tall is
         not a flex column, so a sparse record and every phone get the
         row at the end of the flow. */
      .pp-hero--tall .pp-hero__grid{flex:0 0 auto;margin-top:auto;margin-bottom:auto}
    }

    /* The slim bar's at-rest palette assumes a dark hero photograph
       behind it: white text on white-alpha glass. A person's hero is
       warm-white, so the pills take ink strokes from the first pixel.
       These are the SAME declarations the bar already applies at
       body[data-scrolled], so the two states never fight; the only
       thing scroll still changes is the bar's own background. */
    /* DESKTOP ONLY. At phone width the shared bar gives every template
       the same white disc with an ink glyph and a soft shadow, and this
       page has no reason to be the one exception: a reader moving
       between a brand microsite and a person profile should find the
       same controls looking the same way. Here the ink outline stays,
       because a flat warm-white hero needs no lift to separate a pill
       from it. */
    /* THE MARK TAKES INK FROM THE FIRST PIXEL. The shared bar's at-rest
       palette is written for a dark hero photograph, so the G glyph and
       the vertical label are both #fff and turn ink only at
       body[data-scrolled]. A brand microsite opens on a full-bleed
       photograph; this page opens on white, so at rest the mark was
       white on white and the left of the bar looked empty.

       Not gated to desktop: the hero is white at every width. */
    body.pp-page .bpr-topbar__mark-home,
    body.pp-page .bpr-topbar__mark-vertical{color:var(--ink)}
    @media(min-width:768px){
      body.pp-page .bpr-topbar__share{
        background:transparent;color:var(--ink);border-color:rgba(26,23,20,.16)}
      body.pp-page .bpr-topbar__share:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
      /* THE BAR'S CTA IS THERE FROM THE FIRST PIXEL. It used to wait for
         body[data-scrolled] because the hero carried its own copy 30px
         below it and the reader would have been offered the same button
         twice on one screen. The hero's copy is gone, so the bar owns
         the action outright and hiding it would leave the first screen
         with no way to act at all. */
      body.pp-page .bpr-topbar__cta{display:inline-flex}
    }
    /* The action on a phone is the bottom bar, never the top one. */
    @media(max-width:767px){
      body.pp-page .bpr-topbar__cta{display:none}
    }
    body.pp-page .bpr-topbar__tabs a{color:var(--muted)}
    body.pp-page .bpr-topbar__tabs a:hover{background:rgba(26,23,20,.06);color:var(--ink)}
    /* No second fill in the row: the bar carries one filled pill and it
       is the CTA. Weight and full-strength ink mark the active tab. */
    body.pp-page .bpr-topbar__tabs a.is-active{
      background:transparent;color:var(--ink);font-weight:600}

    /* TRANSPARENT until scrolled, the microsite's own behaviour. Over
       the hero the bar is just its pills floating on the page; past it
       the bar earns a surface and a rule so the content scrolling
       underneath does not run into the controls.

       Stated outside the mobile block on purpose: the inherited mobile
       rules give the bar an opaque fill at every scroll position, and a
       page-scoped selector outrules them at both breakpoints without a
       second copy of this.

       WHITE, and this rule was left behind when the surfaces changed. It
       used to be warm white with a comment saying "this page's ground IS
       warm white and a pure-white bar would read as a seam", which was
       true when the whole page was warm. The page is white now, so the
       same rule produced the opposite of its own intent: a warm strip
       across the top of a white page, seam and all.

       The bar takes the ground it sits ON, which for the whole first
       screen and the About section is white. It crosses the warm object
       band further down, and that is correct: chrome floating over
       content should read as a different plane, and the blur is what
       says so. */
    body.pp-page .bpr-topbar{
      background:transparent;border-bottom-color:transparent;
      -webkit-backdrop-filter:none;backdrop-filter:none}
    /* SOLID WHITE, NOT GLASS, and this was a visible defect rather than
       a preference.

       The inherited value is 92% white over blur(14px) saturate(140%).
       On a brand microsite the backdrop is photography, so the blur
       reads as glass and the tint it picks up looks intended. This page
       is white with dark text on it, and blurred body copy at 8% opacity
       paints a grey wash that moves as the reader scrolls: the bar came
       out white across its left half, where only margin was passing
       under it, and grey across its right half, where a column of prose
       was. Half a bar in a different colour, changing continuously.

       The subnav directly beneath it is a flat #ffffff and always was,
       so past the hero the two chromes sat edge to edge in two
       different whites. That is what made the top of the page look
       broken: not the geometry, which measures correctly, but two
       stacked surfaces that should read as one piece of chrome and did
       not.

       Solid white matches the subnav exactly and cannot be tinted by
       what scrolls under it. The blur was earning its keep as the thing
       that said "different plane"; the hairline below does that job on a
       page whose ground is white anyway. */
    body[data-scrolled].pp-page .bpr-topbar{
      background:#fff;
      -webkit-backdrop-filter:none;backdrop-filter:none;
      /* Firmer than var(--rule). Over the white sections the bar's fill
         and the page under it are the same colour, so this hairline is
         the ONLY thing separating them, and a 1px border lands on a
         fractional device-pixel grid and gets snapped thinner (0.57px
         measured here), thinning its effective colour with it. The inner
         divider between the two rows stays at var(--rule): quieter,
         because it divides one surface rather than two. */
      border-bottom-color:rgba(26,23,20,.16)}

    /* ── persistent bottom bar ───────────────────────────────────
       The shell ships the PORTAL's mobile bottom bar (Ghar, Post
       Property, Account, Menu). That is the portal's chrome, and on a
       profile it is four ways to leave and no way to act on the page you
       are reading. It stands down here for the same reason the portal
       navbar did, and the profile bar takes its place: Ghar mark, Get in
       touch, Share. */
    body.pp-page #bottomBar,
    body.pp-page .bottom-bar,
    body.pp-page .mobile-bottom-bar{display:none !important}
    /* The bar's primary used .bpr-btn.bpr-btn--light, whose styles live
       in the brand page's own block and were never carried, so the
       button had no geometry and its arrow rendered at the SVG's
       natural size: a full-width black slab with a giant arrow across
       half the screen. It takes .pp-btn--primary instead, which is this
       page's canonical dark CTA and already sizes its own glyph. Light
       would have been wrong anyway: the brand bar is dark, this one is
       white. */
    body.pp-page .bpr-sticky-contact__primary{flex:1 1 auto;max-width:none}
    /* INK, not brand red. The inherited bar CTA is #ee324b, which on a
       brand microsite is the one apex action on the page and earns it.
       Here it does not: this page's CTA language is already ink, set by
       the dark-primary treatment in the hero and repeated in the closer
       and the mobile bar, and a red pill would be the only red on the
       page and a third treatment of the same action. Red also stays
       reserved at roughly 5% a view.

       These declarations arrived with the floating bottom-centre pill
       this replaced; the pill's tinted shadows went with it, because a
       button sitting in a bar has nothing to cast one onto. */
    body.pp-page .bpr-topbar__cta{
      background:var(--ink,#1a1714);border-color:var(--ink,#1a1714);color:#fff}
    body.pp-page .bpr-topbar__cta:hover{
      background:#2a2320;border-color:#2a2320;color:#fff}

    /* ── the bar on mobile ───────────────────────────────────────
       The inherited rules hide .bpr-topbar__left and __actions below
       768px and keep the whole bar off-screen until data-scrolled. That
       is right on a brand microsite, which ships a sticky bottom bar
       owning Back, Contact and Share. This page does not: it carries the
       portal's mobile bottom bar, which has none of them. Left as
       inherited, a phone got no back, no share and no Ghar mark at all,
       and nothing above the fold until you scrolled.

       So the bar stays put and keeps its pills, laid out as two rows:
       controls, then the tabs full-width. --mainnav-h is restated to the
       taller height because body's top padding is derived from it. */
    @media(max-width:767px){
      /* FIXED, NOT ABSOLUTE, and this was a straight inheritance bug.

         The shared bar sets position:absolute on a phone, and its own
         comment says why: "Actions (Contact + Share) leave the top bar
         and move to the bottom sticky bar where the thumb sits. Only
         the mark chip remains." That is a coherent trade on a brand
         microsite, whose bottom bar carries Contact, Share and the Ghar
         mark together.

         This page took the first half and not the second. Its bottom
         bar carries the one action and nothing else, by an earlier
         decision on this page, so an absolute top bar meant Share and
         the Ghar mark scrolled off with the hero and never came back.
         Measured at 2235px down the page the bar sat at -2235: pinned
         to the document rather than the viewport, gone for the entire
         rest of the profile.

         Fixing it costs no layout. body already reserves --pp-bar-rest
         of top padding for a bar it expected to be fixed, so nothing
         reflows, and the page's own data-scrolled rule already gives
         the bar a solid surface at this width, so nothing runs under
         transparent chrome either.

         TWO LAYERS, NOT THREE.
           Top bar    the mark left, share right, always there.
           Bottom bar the one action, full width, alone.

         The section tabs stay on desktop, where the row already exists
         and they cost nothing. On a phone they were spending a
         permanent 44px on anchor links that mostly do what a thumb
         flick does, and they were the specific reason a third chrome
         layer existed at all.

         The bar keeps its clearance now that it holds visible controls
         from the first pixel. It gave that clearance up while it held
         only a tab strip that stayed invisible until you scrolled,
         which is a different bar: space reserved for nothing is dead,
         space reserved for three pills is not. The hero's own top
         padding comes down to compensate, so the portrait still starts
         higher than it did before any of this. */
      body.pp-page .bpr-topbar{position:fixed}
      /* The phone bar sizes itself: height:auto around a 40px pill, so
         its rest height IS its padding plus that pill, and --pp-bar-rest
         states the total for body's top padding to match. The top
         padding runs 2px heavier than the bottom for the same reason
         the desktop bar grew, and the desktop collapse-on-scroll does
         not apply here because this bar has no second height to go to. */
      body.pp-page{--mainnav-h:44px;--bpr-topbar-h:44px;--pp-bar-rest:58px}
      body.pp-page .bpr-topbar{transform:none;opacity:1;pointer-events:auto;height:auto}
      /* Room under the pills. Trimmed to 10px while the bar held only
         an invisible tab strip, which left the portrait 3px off the
         back pill once the pills came back: the two read as one stuck
         object rather than as chrome above a photograph. 24px puts a
         clear gap under the bar without returning to the 76px the hero
         started at. */
      body.pp-page .pp-hero{padding-top:clamp(24px,5vw,30px)}
      body.pp-page .bpr-topbar__left,
      body.pp-page .bpr-topbar__actions{display:inline-flex}
      /* Desktop only. */
      body.pp-page .bpr-topbar__subnav{display:none}
      body.pp-page .bpr-topbar__inner{
        min-height:44px;justify-content:space-between;gap:12px;padding:10px 16px 8px}

      /* ONE DECISION in the bottom bar. It held the Ghar mark, Get in
         touch and Share, then Back as well, which left the primary
         about half the row and surrounded it with lookalike circles,
         one of them an exit. Missing Share costs nothing; missing the
         action costs the page. The utilities are all in the top bar. */
      body.pp-page .bpr-sticky-contact{padding-left:16px;padding-right:16px}
      body.pp-page .bpr-sticky-contact__primary{flex:1 1 100%}

      /* THE BAR IS THE CLOSER'S BUTTON. The closer carried its own "Get
         in touch" directly above the docked one: the same label, the
         same modal, a few pixels apart. The section keeps its heading,
         its lead and the "See more people" exit, and the bar underneath
         supplies the action.

         The brand pages solve the same collision the other way, sliding
         the bar out on data-contact-in-view, and that is right there:
         their #contact is a real form carrying the address and the
         response time, so it is a shorter path than bar to modal. This
         closer is a heading and a button to the identical modal, so a
         retreating bar would buy nothing and would slide back in anyway
         once the peers grid below scrolled up. */
      body.pp-page .pp-closer .pp-btn--primary{display:none}

      /* ── the portrait on a phone ───────────────────────────────
         SQUARE, at the full column width. The 4/5 frame ran 428px tall
         across a 390px screen and took the whole first screen on its
         own, so the name it belongs to sat below the fold: the hero
         opened with a picture rather than with a person. Losing 86px of
         height, and nothing of width, puts the name, role, city and the
         opening line of the brief on screen with the photograph while
         the portrait still reads at full scale.

         Width is what carries a face at this size, which is why the
         frame is not narrowed instead: a smaller square would have
         bought the same height back and shrunk the head to a thumbnail
         doing it. */
      .pp-portrait{aspect-ratio:1/1}
      /* A square crop takes less off the top of the source than a 4/5
         does, so the head no longer needs pulling up as hard. */
      .pp-portrait img{object-position:center 22%}
    }

    /* Sections clear the fixed bar when jumped to. */
    .pp-sec{scroll-margin-top:calc(var(--mainnav-h,56px) + 24px)}

    /* ── sections ───────────────────────────────────────────────── */
    /* No scroll-margin here. A flat 64px in this rule silently beat the
       bar-derived calc above it, being the later of two equal-specificity
       declarations, so anchors stopped tracking the bar's real height. */
    .pp-sec{padding:clamp(56px,7vw,96px) 0 0}
    .pp-sec__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;
      gap:12px 32px;margin-bottom:clamp(26px,3.2vw,38px);
      padding-top:20px;border-top:1px solid var(--rule);position:relative}
    /* A short accent rule in the tenant's hex above each section title.
       One small carrier of identity, repeated, instead of tinting whole
       surfaces. */
    .pp-sec__head::before{content:'';position:absolute;top:-1px;left:0;width:56px;height:2px;
      background:var(--brand,var(--ink))}
    .pp-sec__title{font:700 clamp(26px,3.2vw,38px)/1.12 'Gazpacho',Georgia,serif;color:var(--ink);margin:0}
    .pp-sec__note{font:400 13.5px/1.6 'Inter',sans-serif;color:var(--muted);margin:0;max-width:46ch}
    /* A section may open on a LABEL rather than a display title, and
       About is the one that has to. It ran "About Tarun Motta" in
       Gazpacho at 38px directly above a Gazpacho statement at 36px, so
       two display blocks of the same family sat on top of each other and
       the one that wrapped to five lines read as the larger of the two.
       Broken hierarchy, and the heading was the half worth cutting: the
       name is already set at 60px one screen above, and the bar tab
       already says About.

       At 10px caps the label still marks the section for scanning and
       still anchors the tab, and the statement becomes the only display
       voice in the block, which is what it was written to be. */
    .pp-sec__eyebrow{font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;
      text-transform:uppercase;color:var(--faint,#6a6a6a);margin:0}
    .pp-sec[hidden]{display:none !important}
    /* NO PAINT. This was a warm band around Work and Spotlight, on the
       reasoning that cards need a tinted ground to sit on. They do not:
       every card in those sections already carries its own hairline, so
       it reads as an object on white without help, and the band was
       just the warm-white habit coming back in through a side door.

       The wrapper survives for its PADDING, which is the extra air
       around the two sections that hold photographs. Structure on this
       page comes from rules and space, not from tinted stripes. */
    .pp-band{
      margin-top:clamp(56px,7vw,96px)}
    .pp-band .pp-sec{padding-top:clamp(56px,7vw,96px);padding-bottom:clamp(56px,7vw,96px)}
    .pp-band .pp-sec:first-child{padding-top:clamp(48px,6vw,80px)}

    /* ── WORK AS AN INDEX ────────────────────────────────────────
       Four gallery layouts were tried and rejected here: a card rail, a
       16:9 lead with 3:2 pairs, an equal 4:5 three-up, and paired
       staggered plates. The geometry was never the problem.

       A gallery makes a promise: look closely, there is a lot here.
       With two metadata fields per project it cannot keep that promise,
       and six large photographs with three words under each read as
       missing captions. An index makes the smaller, true promise: here
       is what they have worked on. Six rows carrying name, place and
       scope is COMPLETE as a list, and it is readable in seconds.

       The photograph is held in a panel beside the list and swaps as
       the pointer moves down it, so the imagery is still there for
       anyone who wants it without the page becoming a wall to browse.
       It also degrades honestly: a practice that supplied no
       photography gets a dignified index rather than grey rectangles,
       and rows get richer with real project data without a redesign. */
    .pp-idx{display:grid;grid-template-columns:minmax(0,1fr);gap:clamp(24px,3vw,48px)}
    @media(min-width:900px){
      .pp-idx{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);align-items:start}
      /* No photography on any item: the list takes the full width
         instead of leaving a column of empty frame beside it. */
      .pp-idx--bare{grid-template-columns:minmax(0,1fr)}
    }
    /* Without a panel to preview into, rows are not interactive and must
       not offer a pointer affordance or a hover shift. */
    .pp-idx--bare .pp-idx__row{cursor:default}
    @media(hover:hover){
      .pp-idx--bare .pp-idx__row:hover{padding-left:0}
      .pp-idx--bare .pp-idx__row:hover .pp-idx__t{color:var(--ink)}
    }
    /* WITHOUT THE PANEL, THE ROW HAS TO EARN THE WIDTH. In index mode
       the held image occupies the right half; in bare mode nothing does,
       so a 400px title sat at the left end of a 1194px rule with 800px
       of nothing after it, and the section read as a page missing its
       pictures rather than as an index.

       The meta moves to the far end of the same line. That is what a
       table of contents does, and it gives the row two anchors so the
       rule between them is doing work. */
    @media(min-width:700px){
      .pp-idx--bare .pp-idx__row{grid-template-columns:34px minmax(0,1fr) auto;
        align-items:baseline;gap:16px 24px}
      .pp-idx--bare .pp-idx__n{grid-row:1}
      .pp-idx--bare .pp-idx__t{grid-column:2;grid-row:1}
      .pp-idx--bare .pp-idx__m{grid-column:3;grid-row:1;justify-content:flex-end;
        text-align:right;flex-shrink:0}
    }
    .pp-idx__list{list-style:none;margin:0;padding:0;border-top:1px solid var(--rule)}
    .pp-idx__list li{border-bottom:1px solid var(--rule)}
    .pp-idx__row{display:grid;grid-template-columns:34px minmax(0,1fr);gap:2px 16px;
      padding:clamp(15px,1.7vw,22px) 0;width:100%;text-align:left;
      background:none;border:0;color:inherit;
      transition:padding-left .4s cubic-bezier(.2,.7,.2,1)}
    .pp-idx__n{grid-row:1 / span 2;font:600 11px/1.7 'Inter',sans-serif;
      color:var(--faint,#6a6a6a);font-variant-numeric:tabular-nums;padding-top:3px}
    .pp-idx__t{font:700 clamp(17px,1.55vw,22px)/1.28 'Gazpacho',Georgia,serif;color:var(--ink)}
    .pp-idx__m{display:flex;flex-wrap:wrap;gap:3px 14px;
      font:400 12.5px/1.5 'Inter',sans-serif;color:var(--muted)}
    @media(hover:hover){
      .pp-idx__row:hover,.pp-idx__row:focus-visible{padding-left:12px;outline:none}
      .pp-idx__row:hover .pp-idx__t,
      .pp-idx__row:focus-visible .pp-idx__t{color:var(--brand,var(--ink))}
    }
    /* The held panel. Sticky, clearing the navbar AND the section nav.
       Every image is stacked in it rather than swapped by src, so
       nothing has to load mid-hover. */
    .pp-hold{display:none}
    @media(min-width:900px){
      .pp-hold{display:block;position:sticky;top:calc(var(--mainnav-h,80px) + 78px)}
      .pp-hold__frame{position:relative;aspect-ratio:4/5;overflow:hidden;
        background:var(--brand-soft,#f0ebe0);border-radius:12px}
      .pp-hold__frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
        opacity:0;transition:opacity .5s ease}
      .pp-hold__frame img.is-on{opacity:1}
      .pp-hold__cap{display:flex;justify-content:space-between;gap:14px;margin-top:11px;
        padding-top:10px;border-top:1px solid var(--rule);
        font:400 11.5px/1.4 'Inter',sans-serif;color:var(--muted)}
    }
    /* Touch has no hover, so each row carries its own thumbnail. Small,
       inline, and never a grid. */
    .pp-idx__thumb{display:none}
    @media(max-width:899px){
      .pp-idx__row{grid-template-columns:34px minmax(0,1fr) 66px;align-items:center}
      .pp-idx__thumb{display:block;grid-row:1 / span 2;grid-column:3;
        width:66px;aspect-ratio:4/5;overflow:hidden;border-radius:8px;
        background:var(--brand-soft,#f0ebe0)}
      .pp-idx__thumb img{width:100%;height:100%;object-fit:cover;display:block}
    }

    /* ── WORK: the gallery mode ──────────────────────────────────
       ASPECT RATIO IS THE WHOLE DESIGN HERE, and getting it wrong is
       what made the first two attempts look bad.

       Measure the source before choosing a frame. Every one of these
       photographs is portrait or near-square: 0.82, 0.93, 0.96, 1.08,
       1.17, 1.40. They are towers, shot upright. Forcing them into a
       16:9 lead and 3:2 supporting tiles meant object-fit:cover threw
       away more than half the height of the tallest one and served a
       horizontal slice of middle floors against sky. No amount of
       layout polish rescues a crop that has deleted the subject.

       4:5 is the frame the source material asks for. It shows the
       0.82 image almost whole, and crops the 1.40 one evenly on both
       sides rather than beheading it.

       Three equal columns, no featured item. The lead-spans-two-columns
       idea also guaranteed an orphan: six items minus a double-width
       first leaves five in a two-column grid, so the last tile always
       sat alone beside a hole. Six in a three-up grid is two full rows.

       The frame is deliberately plain: no card, no border, no shadow.
       The photographs are the content and the caption sits under the
       image the way a plate caption does. */
    .pp-work{display:grid;grid-template-columns:minmax(0,1fr);
      gap:clamp(30px,3.2vw,44px) clamp(20px,2vw,28px)}
    @media(min-width:560px){.pp-work{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(min-width:960px){.pp-work{grid-template-columns:repeat(3,minmax(0,1fr))}}
    .pp-work__item{display:block;text-decoration:none;color:inherit}
    .pp-work__media{position:relative;overflow:hidden;border-radius:12px;aspect-ratio:4/5;
      background:var(--brand-soft,#f0ebe0)}
    .pp-work__media img{width:100%;height:100%;object-fit:cover;display:block;
      transition:transform 1.1s cubic-bezier(.2,.7,.2,1)}
    .pp-work__item:hover .pp-work__media img{transform:scale(1.04)}
    /* Stacked, not a baseline row. In a 400px tile the title and the
       location fought for one line and the location was pushed hard
       against the right edge, away from the name it belongs to. */
    .pp-work__cap{margin-top:16px}
    .pp-work__title{font:700 clamp(17px,1.55vw,21px)/1.28 'Gazpacho',Georgia,serif;
      color:var(--ink);margin:0;display:inline;
      background-image:linear-gradient(var(--ink),var(--ink));background-size:0 1px;
      background-repeat:no-repeat;background-position:0 100%;
      transition:background-size .4s cubic-bezier(.2,.7,.2,1)}
    .pp-work__item:hover .pp-work__title{background-size:100% 1px}
    .pp-work__meta{margin:7px 0 0;
      font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;text-transform:uppercase;
      color:var(--faint,#6a6a6a)}

    /* ── ABOUT: the story ────────────────────────────────────────
       The section a personal page actually lives on, and the one this
       page went without for too long. What sat here instead was a
       "Focus" list: three nouns set at 30px, restating the chips
       already in the hero. That is padding, not content.

       The material was always available. The founding year, the policy
       work and the project scale are on record in the client brief and
       already published on the practice's own page; they were simply
       never brought onto the person's.

       Layout is the classic editorial split: a statement held on the
       left while the prose runs beside it. The statement is DESCRIPTION,
       never a quotation, because no verified quote exists for these
       people and a sentence in someone's mouth is the one thing this
       page must not invent. */
    /* Row and column gaps are set SEPARATELY. One shorthand gave the
       credentials an 88px column gap as their row gap as well, and on
       top of their own 44px margin that opened 132px between the last
       paragraph and its own credential list. Columns need the air;
       stacked rows do not. */
    .pp-about{display:grid;column-gap:clamp(24px,3vw,48px);row-gap:clamp(30px,3.4vw,44px);
      grid-template-columns:minmax(0,1fr)}
    .pp-about .pp-facts{margin-top:0}
    @media(min-width:900px){
      .pp-about{grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr);
        column-gap:clamp(40px,5vw,88px)}
      /* THE ASIDE sticks, not the statement inside it. The statement
         used to hold itself against the scroll while the areas below it
         would have travelled up underneath: they are one panel and they
         move together. */
      .pp-about__aside{position:sticky;top:calc(var(--mainnav-h,56px) + 40px);align-self:start}
      /* No statement: one column, and the prose keeps its own measure
         rather than running the full 1560px. */
      .pp-about--solo{grid-template-columns:minmax(0,1fr)}
      /* The credentials follow the PROSE, not the statement. Left to
         auto-placement they dropped into row 2 of the first column,
         underneath a sticky statement, which read as a caption on it.
         Last column resolves correctly in the solo case too, where
         there is only one. */
      .pp-about .pp-facts{grid-column:-2 / -1}
    }
    /* Down from 36px, and paired with a twelve-word cap on the field
       itself (asserted in the data module). Size alone was never the
       problem: a seventeen-word statement wraps five lines at any
       display size and stops being a statement. */
    .pp-about__statement{font:700 clamp(22px,2.5vw,31px)/1.24 'Gazpacho',Georgia,serif;
      color:var(--ink);margin:0;max-width:20ch}
    .pp-about__prose > p{font:400 clamp(16px,1.55vw,18px)/1.82 'Inter',sans-serif;
      color:var(--ink2);margin:0 0 1.15em;max-width:62ch}
    .pp-about__prose > p:last-child{margin-bottom:0}
    /* The opening paragraph carries a touch more weight so the block has
       a way in, the way a standfirst does. */
    .pp-about__prose > p:first-child{font-size:clamp(17.5px,1.75vw,20px);line-height:1.68;color:var(--ink)}

    /* ── recognition ─────────────────────────────────────────────
       What was CONFERRED on this person: an award, an appointment, an
       honour, a term served. Not what they hold, which is the
       credentials block at the foot of the prose, and not what their
       firm holds, which belongs to the firm's own page. Third-party
       validation is the strongest thing a profile can carry and the
       easiest to fabricate, so it renders from the record and from
       nothing else.

       The portal already has this list: .bpr-recog-list on the brand
       microsites, year in the left column with title and source
       stacked beside it. Reused as its own class here for one reason
       only, that the brand version is two columns wide inside a full
       measure and this sits in a 400px aside, so it runs as one column
       with the same type scale, the same 64px year column and the same
       border-top divider. Nothing else changes.

       Year is OPTIONAL. An appointment held from 2019 with no end and
       an award given in a named year are both real entries, and a list
       that demanded a year would push the first one into a lie. */
    .pp-recog{margin-top:clamp(26px,3vw,36px);padding-top:18px;border-top:1px solid var(--rule)}
    .pp-recog__label{margin:0 0 14px;font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;
      text-transform:uppercase;color:var(--faint,#6a6a6a)}
    .pp-recog__list{list-style:none;margin:0;padding:0;display:grid;row-gap:16px}
    .pp-recog__list li{display:grid;grid-template-columns:52px minmax(0,1fr);gap:14px;
      align-items:baseline;padding-top:16px;border-top:1px solid var(--rule)}
    .pp-recog__list li:first-child{padding-top:0;border-top:0}
    /* No year on the entry and the title takes the whole row rather
       than indenting past an empty column. */
    .pp-recog__list li.is-undated{grid-template-columns:minmax(0,1fr)}
    .pp-recog__y{font:700 17px/1 'Gazpacho',Georgia,serif;color:var(--ink);letter-spacing:0}
    .pp-recog__t{margin:0 0 3px;font:600 14.5px/1.4 'Inter',sans-serif;color:var(--ink)}
    .pp-recog__s{margin:0;font:400 13px/1.5 'Inter',sans-serif;color:var(--muted)}

    /* ── PUBLISHED ───────────────────────────────────────────────
       No rules here. Both card types, the sub-group and the carousel
       arrive verbatim from the brand microsite (SPOT_CSS, INTEL_CSS,
       PLAY_CSS, RAIL_CSS), which is the whole point: Ghar.tv content
       looks the same wherever it appears.

       What WAS here is gone: a .pp-lead promoted card and a .pp-pub
       list of text rows, both written for this page alone. They were a
       second treatment of content the portal had already solved, and a
       reader moving between a brand page and a person's could see it.

       ONE rule below, and it is not an override. Every card on a brand
       microsite happens to ship with a picture, so the chassis paints
       the no-image panel but never has to put anything in it. A person
       routinely will: an op-ed has no photograph we own. */
    /* The masthead plate that stands in for a missing photograph. The
       chassis paints the warm-white canvas and only styles an svg inside
       it, so the source line needs its own rule: Gazpacho, held back, the
       way a plate caption sits rather than a headline. */
    .pp-page .bpr-mcard__media--gfx{padding:0 24px;text-align:center}
    .pp-page .pp-gfx{font:700 clamp(17px,1.8vw,24px)/1.25 'Gazpacho',Georgia,serif;
      color:var(--ink);opacity:.42}

    /* ── peers ───────────────────────────────────────────────────
       THE SHORT FORM OF A DIRECTORY CARD, and short is the whole brief.

       Three versions came before this one. The first used the full
       .bpr-person directory tile, a 4:3 portrait with a tag list and a
       CTA each, which gave the practice's other partners more visual
       weight than the subject's own story and turned the tail of the
       page into a second directory. The second overshot to a 46px
       circle with 14.5px type, an avatar in a notification row. The
       third was a horizontal card with a square portrait bled to the
       edge, name and role and city beside it and a chevron at the end.

       This one is CENTRED around a round portrait, and the round
       portrait is the thing that makes it read as a short form. A
       rectangular photograph is a picture the layout has to place; a
       disc is a mark, and a card built around a mark can hold three
       lines and look finished, where the same card built around a
       rectangle looks like a directory tile with fields missing.

       So it carries three lines and stops: name, role, category badge.
       No city, because the section already says where they are; no
       role suffix, because the section heading already names the firm;
       no chevron, because the whole card is the link and a centred
       composition has no line for one to sit on.

       The badge is the SAME badge the hero puts under the subject's own
       name. That is the piece that ties the foot of the page back to
       the top and says these are entries in one directory, and it is
       also what the red category label in the reference was doing.
       Red does not do it here: the accent is reserved for what a reader
       can act on, and a category is a fact. */
    .pp-peers{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}
    @media(min-width:1080px){
      /* auto-fill, so a 240px card stays a 240px card. auto-fit would
         collapse the empty tracks and stretch two colleagues across the
         full measure, which is how a short list ends up looking like a
         wide one with holes in it. */
      .pp-peers{grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))}
    }
    .pp-peer{display:flex;flex-direction:column;align-items:center;text-align:center;
      gap:16px;padding:30px 20px 26px;text-decoration:none;color:inherit;
      border:1px solid var(--rule);border-radius:18px;background:#fff;
      transition:border-color .25s ease,box-shadow .35s cubic-bezier(.2,.7,.2,1),transform .25s ease}
    .pp-peer:hover{border-color:rgba(26,23,20,.28);
      box-shadow:0 18px 38px -26px rgba(26,23,20,.45);transform:translateY(-3px)}
    .pp-peer__face{width:clamp(84px,8vw,96px);aspect-ratio:1/1;border-radius:50%;
      overflow:hidden;background:var(--brand-soft,#f0ebe0);
      display:flex;align-items:center;justify-content:center}
    .pp-peer__face img{width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block;
      transition:transform 1s cubic-bezier(.2,.7,.2,1)}
    /* Transform on the IMAGE, never on the anchor: a transform on the
       click target creates a containing block and has cost this portal
       a dead card before. */
    .pp-peer:hover .pp-peer__face img{transform:scale(1.05)}
    /* Monogram, never a stand-in face. A disc is the one frame that
       makes two Gazpacho letters read as a mark rather than as a
       missing photograph. */
    .pp-peer__face span{font:700 clamp(26px,3vw,32px)/1 'Gazpacho',Georgia,serif;
      color:var(--brand,var(--ink))}
    .pp-peer__id{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;width:100%}
    /* Names wrap on two lines when they don't fit one — never truncated.
       "Pirojsha Godrej" / "Hemant Ghadigaonkar" (21 chars) crammed into
       a 145px card on mobile is what forced the nowrap+ellipsis in the
       first place; balance-wrap + a phone-only size step reads cleanly
       instead. */
    .pp-peer__name{display:block;max-width:100%;font:700 17px/1.25 'Gazpacho',Georgia,serif;
      color:var(--ink);word-break:break-word;overflow-wrap:break-word;
      text-wrap:balance;hyphens:auto}
    @media (max-width:743.98px){
      .pp-peer{padding:22px 12px 20px;gap:12px}
      .pp-peer__name{font-size:15px;line-height:1.22}
    }
    .pp-peer__role{display:block;max-width:100%;margin-bottom:5px;
      font:400 13px/1.4 'Inter',sans-serif;color:var(--muted)}

    /* It is the last thing before the footer and had zero padding
       beneath it, so the peer cards butted straight into the footer's
       top rule. */
    .pp-sec--minor{padding-top:clamp(44px,5vw,68px);
      padding-bottom:clamp(56px,7vw,96px)}
    .pp-minor__label{margin:0 0 20px;padding-top:18px;border-top:1px solid var(--rule);
      font:600 10px/1 'Inter',sans-serif;letter-spacing:.1em;text-transform:uppercase;
      color:var(--faint,#6a6a6a)}
    /* The foot holds every route OUT of this page in one place: the
       practice's other partners, and the directory shelves this person
       sits on. Both are the same move, so they read as one block of
       small navigation rather than two competing chapters. */
    .pp-minor__group + .pp-minor__group{margin-top:clamp(32px,3.8vw,46px)}
    /* The peer grid is declared once, up with the card. A second
       copy lived here and won on source order, so editing the real one
       changed nothing. */
    /* Monogram stand-in, never a generic face: a stock portrait under a
       real person's name misrepresents that individual. */
    .pp-mono{display:flex;align-items:center;justify-content:center;width:100%;height:100%;
      background:var(--brand-soft,#f0ebe0)}
    .pp-mono span{font:700 clamp(30px,4vw,44px)/1 'Gazpacho',Georgia,serif;color:var(--brand,var(--ink))}

    /* ── closer ───────────────────────────────────────────────────
       NOT DARK. It was a full-width ink card with a tenant-coloured
       glow, which is a brand-microsite device: on those pages the dark
       band is a decision the brand made and the glow is their hex doing
       work. Neither is true here. Every person profile carrying an ink
       slab means the whole directory ends on the same heavy note, and
       the glow was tinting it by whoever employs them.

       It is a WARM PANEL on the white page instead: the same ground the
       object band uses, so the page's two non-white surfaces belong to
       one system rather than three. The weight is carried by the one
       ink button, which is where the weight should have been.

       Also smaller. A dark card wants to fill the measure to justify
       itself; a light one does not, so the panel keeps a reading width
       and stops the closer behaving like a second hero. */
    .pp-closer{margin:clamp(48px,6vw,80px) 0 clamp(56px,7vw,92px);
      padding:clamp(36px,4.6vw,60px) clamp(28px,4vw,64px);
      border:1px solid var(--rule);border-radius:22px;
      background:#fff;text-align:center}
    .pp-closer__title{font:700 clamp(24px,2.8vw,34px)/1.18 'Gazpacho',Georgia,serif;
      margin:0;color:var(--ink)}
    .pp-closer__lead{font:400 15px/1.72 'Inter',sans-serif;color:var(--muted);
      margin:12px auto 0;max-width:48ch}
    .pp-closer .pp-actions{justify-content:center;margin-top:24px}
    /* The buttons revert to the page's own pair: dark primary, quiet
       warm secondary. The inverted white-on-ink set existed only
       because the card behind them was ink. */
    .pp-closer .pp-btn{background:#fff}
    .pp-closer .pp-btn:hover{background:#fff;border-color:var(--ink)}
    .pp-closer .pp-btn--primary{background:var(--ink);color:#fff;border-color:var(--ink)}
    .pp-closer .pp-btn--primary:hover{background:#2a2320;border-color:#2a2320}
`;

/* CSS SANITY, checked once at module load.

   An editing slip once left a comment closed early and its remaining
   prose sitting bare in the stylesheet. CSS recovers by discarding rules
   until it finds its footing, so the page still rendered and the only
   symptom was that some rules further down had quietly stopped applying.
   Nothing threw. Both failures below are cheap to check and both are
   silent otherwise. */
{
  const opens = (CSS.match(/\/\*/g) || []).length;
  const closes = (CSS.match(/\*\//g) || []).length;
  if (opens !== closes) throw new Error(`CSS comments unbalanced: ${opens} open, ${closes} close`);
  const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const lb = (stripped.match(/\{/g) || []).length;
  const rb = (stripped.match(/\}/g) || []).length;
  if (lb !== rb) throw new Error(`CSS braces unbalanced: ${lb} open, ${rb} close`);
  for (const line of stripped.split('\n')) {
    const t = line.trim();
    if (!t || /[{};:]/.test(t) || t.startsWith('@') || t.endsWith(',')) continue;
    throw new Error(`CSS has stray text outside a comment: "${t.slice(0, 70)}"`);
  }
}

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

  const intelcard = c => `            <li><a class="bpr-intel-card" href="${c.href}">
              <span class="bpr-intel-card__type">${esc(c.type)}</span>
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
  const list = p.company
    ? all.filter(x => x.slug !== p.slug && x.company?.slug === p.company.slug)
    : [];
  if (!list.length) return '';

  const groups = [];

  if (list.length) {
    groups.push(`        <div class="pp-minor__group">
          <p class="pp-minor__label" id="team-h">Also at ${esc(p.company.name)}</p>
          <div class="pp-peers pp-rise">
${list.map(x => `            <a class="pp-peer" href="/people/${x.slug}">
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

/* ── the slim bar ────────────────────────────────────────────────
   The tabs live INSIDE it. They used to be a third sticky strip docked
   under an 80px portal navbar, which is two bars of chrome before any
   content.

   Tabs are built from the sections this record actually produced, in
   the order the page renders them, so the bar can never link to
   something the page omitted and the scroll spy can never disagree
   with the order. */
function topbar(p, all) {
  const hasPeers = !!p.company && all.some(x => x.slug !== p.slug && x.company?.slug === p.company.slug);
  const links = [
    ['profile', 'Profile'],
    p.about?.length ? ['story', 'About'] : null,
    p.work?.length ? ['work', 'Work'] : null,
    p.content?.length ? ['published', 'On Ghar.tv'] : null,
    hasPeers ? ['team', 'Team'] : null,
  ].filter(Boolean);

  return `  <div class="bpr-topbar" aria-label="Page chrome">
    <div class="bpr-topbar__inner">
      <!-- THE PORTAL MARK, not a back pill.

           This bar spent its life on the older shared chrome: a
           circular back pill on the left and a Ghar pill on the right,
           each naming itself through a tooltip. The shared microsite
           has since been rebuilt around one mark cluster, the G glyph
           anchored to home beside the vertical it belongs to, and this
           page slices its bar stylesheet straight out of that file. The
           moment the two vocabularies diverged this page was carrying
           markup nothing styled: three labels shipped permanently open
           and the pills lost their shape.

           So the markup follows. "People" is the way back to the
           directory now, which the old back pill did through an icon
           and a tooltip; a word does it without either.

           The tabs move out of the bar into __subnav, where the shared
           chrome now keeps them. -->
      <div class="bpr-topbar__left">
        <span class="bpr-topbar__mark">
          <a href="/" class="bpr-topbar__mark-home" aria-label="Ghar.tv home">
            <svg class="bpr-topbar__mark-glyph" viewBox="0 0 180.5 196.8" fill="currentColor" aria-hidden="true" focusable="false"><path d="M180.5,92.6l0,13.8c0,49.9-40.3,90.3-90.2,90.3S0,156.3,0,106.4V60.8c0-10.4,5.1-17.6,13.7-22.2l65.4-36c3-1.5,6.5-2.7,11.1-2.7c4.6,0,8.1,1.2,11.1,2.7l65.4,36l-30.6,23.9v0l0,0L97,40.9c-1.8-0.9-3.9-1.6-6.7-1.6c-2.8,0-4.9,0.7-6.7,1.6L44.3,62.5c-5.1,2.8-8.2,7.1-8.2,13.3v27.4c0,30,24.3,57.5,54.2,57.5c21.8,0,40.6-14.6,49.2-34.1H90.3v-34H180.5z"/></svg>
          </a>
          <a href="/people" class="bpr-topbar__mark-vertical">People</a>
        </span>
      </div>
      <div class="bpr-topbar__actions">
        <!-- The action, first in the cluster, ahead of the utilities.
             Revealed by CSS at body[data-scrolled], the same trigger
             that gives the bar its surface. Desktop only: on a phone
             the action is the bottom bar. -->
        <button type="button" class="bpr-topbar__cta" data-brand-contact data-brand="${esc(p.name)}">
          Get in touch
          ${ARROW}
        </button>
        <div class="bpr-topbar__share-wrap tip tip--below tip--end">
          <button type="button" class="bpr-topbar__share tip__anchor" data-brand-share data-brand="${esc(p.name)}" aria-label="Share this profile" aria-describedby="tip-share">
            <span class="bpr-topbar__share-label">Share</span>
            ${SHARE}
          </button>
          <span class="tip__bubble" role="tooltip" id="tip-share">Share this profile</span>
        </div>
      </div>
    </div>
  </div>
  <div class="bpr-topbar__subnav" aria-label="Section navigation">
    <div class="bpr-topbar__tabs" role="tablist" aria-label="Profile sections">
${links.map(([id, label], i) => `      <a href="#${id}"${i === 0 ? ' class="is-active"' : ''}>${label}</a>`).join('\n')}
    </div>
  </div>`;
}

/* The sheet ships with the source brand's name baked into three places.
   Each swap asserts its hit count, because a silent miss means a
   person's page offers to share a different tenant. */
function shareSheet(p) {
  const swaps = [
    ['aria-label="Share this brand"',       'aria-label="Share this profile"', 1],
    ['>Share this brand<',                  '>Share this profile<',            1],
    ['id="brSharePreviewName">TEEARCH<',    `id="brSharePreviewName">${esc(p.name)}<`, 1],
  ];
  let html = SHARE_HTML;
  for (const [find, repl, expect] of swaps) {
    const hits = html.split(find).length - 1;
    if (hits !== expect) throw new Error(`share sheet: "${find}" matched ${hits}, expected ${expect}`);
    html = html.split(find).join(repl);
  }
  if (html.includes('TEEARCH')) throw new Error('share sheet still carries the source brand name');
  return `${html}
<script>
(function () {
${SHARE_JS}})();
</script>`;
}

/* The page's own script, kept out of the template literal above so its
   braces and backslashes cannot be mistaken for interpolation. */
const PAGE_SCRIPT = String.raw`<script>
/* Reveal + section nav. Deliberately dependency-free: the shared
   carousel pulls GSAP from a CDN and that request has been observed to
   fail, so nothing structural may rely on it. body.pp-anim is added
   HERE, which means the hidden state only exists once this script is
   running: if it never runs, the page renders fully visible. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rise = [].slice.call(document.querySelectorAll('.pp-rise'));

  if (!reduce && 'IntersectionObserver' in window && rise.length) {
    document.body.classList.add('pp-anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    /* TWO frames before observing, and this is why the hero never
       animated while everything below it did.

       body.pp-anim is what applies the hidden state. Observe in the same
       frame and the IntersectionObserver reports the already-visible
       hero immediately, so those elements receive their hidden state and
       is-in within one paint. The browser has no two states to
       interpolate between, so it just draws the end state: the hero
       appeared instantly while every section further down, which
       genuinely crossed the threshold later, transitioned properly.

       Waiting two frames lets the hidden state paint first, so the hero
       plays its stagger on load. Below-fold elements are unaffected. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        rise.forEach(function (el) { io.observe(el); });
      });
    });

    /* FAILSAFE. Content must never be able to stay hidden. If the
       observer does not fire (odd viewports, print, capture tools, a
       browser that throttles it), everything reveals anyway. */
    setTimeout(function () {
      rise.forEach(function (el) { el.classList.add('is-in'); });
    }, 1600);
  }

  /* THE BAR'S THREE-STAGE BEHAVIOUR, sliced from the shipped microsite
     rather than written again here. See TOPBAR_JS in
     person-profile-data.mjs for why, and for the single asserted swap
     that points it at this page's hero. */
  (function () {
${TOPBAR_JS}  })();

  /* Work index: the held panel swaps on pointer or keyboard focus.
     Every image is already in the DOM, so nothing loads mid-hover. */
  var idx = document.querySelector('[data-pp-index]');
  if (idx) {
    var shots = [].slice.call(idx.querySelectorAll('.pp-hold__frame img'));
    var nm = idx.querySelector('[data-hold-name]');
    var mt = idx.querySelector('[data-hold-meta]');
    [].slice.call(idx.querySelectorAll('.pp-idx__row')).forEach(function (row) {
      var show = function () {
        var i = +row.getAttribute('data-i');
        shots.forEach(function (im) { im.classList.toggle('is-on', +im.getAttribute('data-i') === i); });
        if (nm) nm.textContent = row.querySelector('.pp-idx__t').textContent;
        if (mt) mt.textContent = row.querySelector('.pp-idx__m span').textContent;
      };
      row.addEventListener('mouseenter', show);
      row.addEventListener('focus', show);
    });
  }

  /* Spotlight rails, on the PORTAL'S OWN carousel. Same wiring as the
     brand microsites: find every .bpr-carousel, hand initCarousel its
     track and the paginator buttons from the sub-group head. The chassis
     handles drag on desktop, native scroll on touch, and hides the
     arrows by itself when the rail does not overflow, which is most
     people, because two or three cards fit.

     ghar-carousel.js is deferred and waits on GSAP, so window.initCarousel
     does not exist at parse. Poll for it, exactly as the shell does.
     NOTHING STRUCTURAL DEPENDS ON THIS: if the script never arrives the
     rail is still a flex row of real links, which is why the reveal and
     the section nav above are deliberately dependency-free. */
  (function railInit() {
    if (typeof window.initCarousel !== 'function') { setTimeout(railInit, 50); return; }
    document.querySelectorAll('.bpr-carousel').forEach(function (outer) {
      var track = outer.querySelector('.rail');
      if (!track) return;
      var head = outer.parentElement ? outer.parentElement.querySelector('.dc-paginator') : null;
      window.initCarousel({
        outer: outer,
        track: track,
        prevBtn: head ? head.querySelector('.dc-page-btn--prev') : null,
        nextBtn: head ? head.querySelector('.dc-page-btn--next') : null,
        snap: 'card',
        /* 10, not the default 5. A card click was being lost whenever
           the pointer wobbled a few pixels between down and up; this is
           the value the brand pages already settled on. */
        clickSlopPx: 10,
      });
    });
  })();

  /* Section nav highlight, built off the sections the page rendered. */
  var bar = document.querySelector('.bpr-topbar__tabs');
  if (bar && 'IntersectionObserver' in window) {
    var links = [].slice.call(bar.querySelectorAll('a'));
    var map = {}, targets = [];
    links.forEach(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      if (el) { map[el.id] = a; targets.push(el); }
    });
    if (targets.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.classList.remove('is-active'); });
          if (map[e.target.id]) map[e.target.id].classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      targets.forEach(function (t) { spy.observe(t); });
    }
  }
})();
</script>`;

/* ── page ─────────────────────────────────────────────────────────── */
function render(p, all) {
  const title = `${p.name} | ${p.role}${p.company ? ', ' + p.company.name : ''} | Ghar.tv`;
  const desc  = p.brief ? p.brief.slice(0, 155) : `${p.name}, ${p.role}${p.company ? ' at ' + p.company.name : ''}.`;
  const ogImg = p.portrait ? 'https://www.ghar.tv/' + p.portrait : 'https://www.ghar.tv/imgbo/logoog.png';

  /* Head: inherit the shipped boilerplate, swap the page-identifying
     tags. The title pattern is line-anchored and forbids < inside,
     because the shell's head can open with a comment LISTING the tags
     it carries: a lazy /<title>[\s\S]*?<\/title>/ matched that comment's
     word first and shipped an empty title. */
  const head = SHELL_HEAD
    .replace(/^([ \t]*)<title>[^<]*<\/title>/m, `$1<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="https://www.ghar.tv/people/${p.slug}">`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="profile">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(p.name)} | Ghar.tv">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="https://www.ghar.tv/people/${p.slug}">`)
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${ogImg}">`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(p.name)} | Ghar.tv">`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(desc)}">`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${ogImg}">`);

  for (const [label, needle] of [
    ['title',     `<title>${esc(title)}</title>`],
    ['canonical', `href="https://www.ghar.tv/people/${p.slug}"`],
    ['og:image',  `content="${ogImg}"`],
  ]) {
    if (!head.includes(needle)) throw new Error(`head: ${label} was not replaced for ${p.slug}`);
  }

  const body = SHELL_BODY.replace(/<body([^>]*)class="([^"]*)"/,
    (_, pre, cls) => `<body${pre}class="${[...new Set((cls + ' pp-page').split(/\s+/).filter(Boolean))].join(' ')}"`);

  const knows = (p.topics || []).map(t => t.label);
  const jsonld = `{"@context":"https://schema.org","@type":"Person","name":${JSON.stringify(p.name)},"jobTitle":${JSON.stringify(p.role)},"url":"https://www.ghar.tv/people/${p.slug}"${p.company ? `,"worksFor":{"@type":"Organization","name":${JSON.stringify(p.company.name)},"url":"https://www.ghar.tv/brands/${p.company.slug}"}` : p.affiliation ? `,"worksFor":{"@type":"Organization","name":${JSON.stringify(p.affiliation)}}` : ''}${p.portrait ? `,"image":${JSON.stringify(ogImg)}` : ''}${knows.length ? `,"knowsAbout":${JSON.stringify(knows)}` : ''},"address":{"@type":"PostalAddress","addressLocality":${JSON.stringify(p.city)}}}`;

  const workBlock  = work(p);
  const aboutBlock = about(p);
  const pubBlock   = published(p);
  const peersBlock = foot(p, all);

  return `${head}<style>
    /* Carried from the shell: positions and HIDES the shared contact
       modal. Without it the modal renders inline as a permanently open
       form at the bottom of every profile. */
${TOPBAR_CSS}
${STICKY_CSS}
${SHARE_CSS}
${CHROME_CSS}
    /* Carried from the shell: the canonical directory card, reused for
       the peer rail rather than re-invented. */
${PERSON_CARD_CSS}
    /* Carried from the brand microsite: Ghar.tv's published content
       looks the same wherever it appears, so the spotlight sub-groups,
       both card types and the shared carousel arrive verbatim rather
       than being restyled for this page. */
${SPOT_CSS}
${INTEL_CSS}
${PLAY_CSS}
${RAIL_CSS}
${CSS}
${PALETTE}
  </style>
  <script type="application/ld+json">
  ${jsonld}
  </script>
${body}${topbar(p, all)}

<!-- bpr-page is the hook the inherited share script reads: its preview
     resolver looks up main.bpr-page for the override image, and without
     the class it fell through to a brand hero photo and a brand logo,
     neither of which exists here, and rendered an empty tile. -->
<main id="main" class="bpr-page" data-brand-name="${esc(p.name)}"${p.portrait ? ` data-brand-share-image="${p.portrait}"` : ''}>

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

    <section class="pp-closer pp-rise">
      <h2 class="pp-closer__title">Work with ${esc(p.name)}</h2>
      <p class="pp-closer__lead">Send a note about a project, a commission, or a conversation worth recording. Nothing is published without your say.</p>
      <div class="pp-actions">
        <!-- Same name as every other trigger for this modal. It read
             "Send a note" here, "Invite to speak" in the hero and "Get
             in touch" in both bars: four labels, one action. -->
        <button type="button" class="pp-btn pp-btn--primary" data-brand-contact data-brand="${esc(p.name)}">Get in touch ${ARROW}</button>
        <a class="pp-btn" href="/people">See more people ${ARROW}</a>
      </div>
    </section>
  </div>

</main>
${SHELL_TAIL}
  <!-- Persistent mobile chrome — [Back disc] [Contact fill] [Share disc].
       Three-element bar mirroring the brand microsite. Desktop hides the
       whole bar (topbar carries these actions instead); mobile shows all
       three past the hero image (__back + __util fade in on
       body[data-past-image] via the shared sticky CSS). Do NOT collapse
       this to a single button — the __back and __util are the only way
       back to /people and the only way to share from mobile once the
       hero overlay fades. -->
  <div class="bpr-sticky-contact" aria-label="Profile actions">
    <!-- Back to /people — round outlined disc, left chevron. -->
    <a href="/people" class="bpr-sticky-contact__back" aria-label="Back to People">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
    </a>
    <!-- Primary — ink fill, flex-1. -->
    <button type="button" class="pp-btn pp-btn--primary bpr-sticky-contact__primary" data-brand-contact data-brand="${esc(p.name)}">
      Get in touch
      ${ARROW}
    </button>
    <!-- Share — round outlined disc, same family as Back. -->
    <button type="button" class="bpr-sticky-contact__util" data-brand-share data-brand="${esc(p.name)}" aria-label="Share this profile" title="Share">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>
  </div>
${shareSheet(p)}
${PAGE_SCRIPT}
`;
}

/* ── the TEMPLATE ─────────────────────────────────────────────────── */
const TEMPLATE_COMPANY = {
  name: '{{COMPANY_NAME}}', slug: '{{COMPANY_SLUG}}', logo: '{{COMPANY_LOGO_PATH}}',
  hex: '{{COMPANY_HEX}}', soft: '{{COMPANY_SOFT_HEX}}', line: '{{COMPANY_ONE_LINE}}',
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
    company     { name, slug, logo, hex, soft, line } or null
    affiliation plain string for someone with no tenant brand
    work[]      { title, meta, image }
    workLabel   "Selected work" by default. Say what it IS
    workMode    'gallery' to opt into the plate grid. Otherwise derived
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
   ONE PALETTE FOR EVERY PERSON. Deliberately NOT per-profile.

   The brand microsites theme per tenant and they are right to: that
   page IS the brand's house, and the brand owns a hex. A person page is
   a page in OUR directory, and inheriting the employer's colour here
   fails three ways.

   MOST PEOPLE HAVE NO BRAND. Researchers, journalists, brokers without
   an agency, anyone we curate editorially. Their hex would have to be
   invented, which is the same class of error as an invented statistic,
   in the most visible place on the page.

   IT PAINTS A PAID CASTE. This page ran gold for the three TEEARCH
   partners and plain ink for Darshini Mahadevia, so the profiles
   attached to a paying tenant looked richer than the expert we curated.
   That is the verified-checkmark mistake in colour.

   A DIRECTORY SHOULD READ AS ONE DIRECTORY. Two hundred profiles with
   two hundred accents makes /people to profile to back to profile a
   colour lottery, and the only thing the colour encodes is who employs
   them, which no reader is asking.

   So the frame is constant and neutral, and THE PORTRAIT IS THE COLOUR.
   It is the largest element on the page and the only one that genuinely
   differs every time.

   --brand stays a variable so the rules that read it do not all have to
   change, but it resolves to ink for everyone. --pp-wash is separate
   because a radial of ink behind a photograph is a grey smudge.
   ═══════════════════════════════════════════════════════════════════ */
const PALETTE = `    .pp-page{--brand:var(--ink,#111);--brand-soft:#f1ece3;--pp-wash:#e0c199}`;

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
  for (const need of ['</head>', '<body', '.pp-hero{', '#brContactModal{', 'bpr-topbar']) {
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
${SHELL_TAIL}
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
  await fs.writeFile(ROOT + `person-profile-${p.slug}.html`, html, 'utf8');
  console.log('  ' + `person-profile-${p.slug}.html`.padEnd(38) + (p.portrait ? '' : '[monogram, no portrait]'));
}

/* The template is a build artifact, not a shipped page, so it is written
   to _dev/templates/ rather than the project root. */
await fs.writeFile(ROOT + '_dev/templates/person-profile.html', toTemplate(render(TEMPLATE, [TEMPLATE, TEMPLATE_PEER])), 'utf8');
console.log('  _dev/templates/person-profile.html'.padEnd(40) + '[TEMPLATE, tokens + REPEAT fences]');

{
  let html = statesPage()
    /* ROOT-ABSOLUTE EVERY RELATIVE URL. This page is written two levels
       down in _dev/templates/, so "brand_assets/..." resolved against
       that folder and the images, stylesheets and logo 404'd. Targeted
       rather than <base href="/">, which would also rewrite every
       "#section" anchor into a navigation away from the page. */
    .replace(/\b(src|href)="(?!https?:|\/|#|mailto:|tel:|data:)/g, '$1="/')
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
  await fs.writeFile(ROOT + '_dev/templates/person-profile-states.html', html, 'utf8');
  console.log('  _dev/templates/person-profile-states.html'.padEnd(40) + `[REFERENCE, ${STATES.length} states]`);
}

console.log('\n' + PEOPLE.length + ' pages + 1 template + 1 reference written');
