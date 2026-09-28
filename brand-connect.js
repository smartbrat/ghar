/* ═══════════════════════════════════════════════════════════════════════
   BRAND CONNECT · SCROLL CHOREOGRAPHY
   Page-local. Nothing here is shared; /brand-connect is the only consumer.

   THE BRIEF: a product tour, the way a phone or a car launch page does it.
   That genre is built from four moves, and this file uses all four:
     a. things arrive THROUGH DEPTH, not by fading in place
     b. they are DEALT in sequence, tied to scroll position, not to a timer
     c. one thing is EMPHASISED at a time while its neighbours recede
     d. the page tells you WHERE YOU ARE in the sequence

   WHY THERE IS NO PIN.
   The genre normally pins a stage and plays the story against it. That
   needs a stage that fits the viewport. The two candidate bands here are
   1077px (#packages) and 1319px (.smap) against a 900px viewport, so
   pinning would hold them still with their lower halves cut off. Pinning
   also has previous on this codebase: design.html's Editor's Lead scene
   carries a comment saying a sticky pin reads as stuck rather than as a
   story. Each block plays its own short sequence as it arrives instead. A
   real pinned stage is possible but it means restructuring a band into a
   viewport-height stage, which is structural work on a shipped section,
   not a motion pass.

   TWO SETS OF LIMITS, DELIBERATELY.
   design-system #motion-pacing caps entry translation at +/-12px and scale
   at 0.92-1.08. That governs REVEALS: text arriving on screen. It does not
   govern SCENES, and the repo's own scenes ignore it on purpose, because a
   scene is a thing moving rather than a thing appearing (videoworks.js
   scales a stage .72 -> 1, design.html grows a panel 88% -> full). So:
   [data-reveal] text obeys the 12px cap; the dealt cards travel further.

   FALLBACK IS BY CONSTRUCTION, NOT BY CSS.
   Nothing here is hidden in the stylesheet. Every start state is written by
   gsap.set(), so the page renders complete if GSAP fails, if the CDN is
   blocked, if JS is off, or if this file 404s. #motion-triggers asks for a
   CSS end state rather than a JS one; never writing the hidden state to CSS
   is the cheapest way to honour that.

   NOTHING UN-BUILDS, AND NOTHING REPLAYS. A scrubbed timeline reverses by
   nature, which on the way back up takes a finished statement apart and then
   rebuilds it. So no content on this page is scrubbed: the hero plays once on
   load, and every block below plays once when it arrives. Scrolling back up is
   quiet, which is what scrolling back up should be. The only thing still tied
   to scroll position is the progress rail, which is a readout of where you
   are rather than an animation, and has to track both directions to be true.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  var OUT  = 'expo.out';
  var MOVE = 'power3.out';
  var desktop = function () { return window.innerWidth >= 744; };

  /* PLAY ONCE, ON TIME, WHEN THE BLOCK ARRIVES.
     This replaces a scrubbed forward-only scene, which was the wrong device
     for this page and produced the two faults reported against it: cards
     arriving one per scroll step, and the last card in a band still not
     shown after the band had been scrolled past.

     Both come from the same arithmetic. A scrubbed timeline spends its
     whole length over the trigger's scroll range, so on a 1319px band
     against a 900px viewport the fourth of four steps does not begin until
     the top of the band is roughly 1000px above the fold. The card is on
     screen and blank for most of the time it is on screen. Stretching a
     sequence over a tall element does not pace it, it strands it.

     So: the scroll position decides WHEN a block starts, and the timeline
     alone decides how it plays. A block always finishes within about a
     second of becoming visible, whatever the scroll speed, and a fast
     scroll never leaves anything behind. once:true, so nothing un-builds. */
  function onArrive(trigger, start, build) {
    if (!trigger) return;
    ScrollTrigger.create({
      trigger: trigger, start: start || 'top 84%', once: true,
      invalidateOnRefresh: true,
      onEnter: function () { build(gsap.timeline()); }
    });
  }

  /* ── 0 · PROGRESS RAIL ──────────────────────────────────────────────
     The "where am I" move. A 2px hairline across the top, scaled on the
     x axis by document progress. transform only, so it costs nothing per
     frame. It is the page's own red, at the one place on the page where
     red is already spent (the masthead), so it adds no new accent. */
  var rail = document.createElement('div');
  rail.className = 'bc-progress';
  rail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(rail);
  gsap.to(rail, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
  });

  /* ── 1 · HERO ───────────────────────────────────────────────────────
     Above the fold, so it plays on load. The headline lines lead, the
     supporting copy follows, the controls land last. */
  var heroBits = [].slice.call(document.querySelectorAll(
    '.hero h1 .t-line, .hero__lede, .hero__cta, .hero__help'
  ));
  if (heroBits.length) {
    gsap.set(heroBits, { opacity: 0, y: 12 });
    gsap.to(heroBits, {
      opacity: 1, y: 0, duration: 1.1, ease: OUT, stagger: 0.1, delay: 0.15,
      clearProps: 'transform'
    });
  }

  /* The two headline shapes are the page's product shot, so they are the
     one thing in the hero that arrives with weight: up from under the
     baseline and out of depth. They are set as type and carry a .11em
     overshoot that sits them on the baseline, so the transform origin is
     low: scaling from the centre would lift them off it. */
  var heroShapes = document.querySelectorAll('.hero .q-shape');
  if (heroShapes.length) {
    gsap.set(heroShapes, { opacity: 0, scale: 0.72, y: 10, transformOrigin: '50% 88%' });
    gsap.to(heroShapes, {
      opacity: 1, scale: 1, y: 0, duration: 1.5, ease: OUT, stagger: 0.16, delay: 0.32
    });
  }

  /* NO SCROLL EFFECT ON THE HERO. It had a scrubbed exit, receding and
     fading to 0.25 as it left, and that is a scrubbed effect's nature: it
     plays backwards on the way up, so returning to the top rebuilt the hero
     in front of you every time. Someone scrolling back to the top is not
     arriving, they are returning to something they have already seen, and
     replaying its entrance says otherwise.

     Forward-only was not the answer either: the hero would then have been
     stranded faded and lifted while sitting full on the screen. The load
     cascade above is the hero's whole motion. It plays once, because
     arriving happens once. */

  /* ── 2 · TEXT REVEALS ───────────────────────────────────────────────
     Headings and body copy only. These are reveals, so they keep to the
     12px cap. Anything that is part of a scene is driven by that scene
     and deliberately carries no [data-reveal]. */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    gsap.set(revealables, { opacity: 0, y: 12 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.09,
          ease: MOVE, overwrite: true, clearProps: 'transform'
        });
      }
    });
  }

  /* ── 3 · THE WHY BAND ───────────────────────────────────────────────
     This section had the weakest motion on the page: three rows sliding
     in from the left, which is a list appearing, not a claim being made.
     It now plays as a sequence with three distinct beats.

     BEAT ONE is the row arriving: the whole label unit slides in from the
     left and fades up, one row behind the last.
     BEAT TWO is the tile resolving. Each is a filled silhouette with the
     glyph knocked out of it, the one genuinely graphic element in the band
     and what the row is recognised by, so it grows from 0.62 with its own
     bottom edge as the origin, landing just after its row has started to
     move. It grows out of the row rather than swelling in place.
     BEAT THREE is the reach figure below, which is the band's payoff. */
  var accRows = [].slice.call(document.querySelectorAll('.why__acc .acc__item'));
  if (accRows.length) {
    var tiles = document.querySelectorAll('.why__acc .why__ic');
    var labels = document.querySelectorAll('.why__acc .why__lbl, .why__acc .acc__sign');

    /* THE ROWS THEMSELVES ARE NEVER HIDDEN. They are a disclosure control:
       something a visitor clicks. Putting a click target behind a scroll
       trigger means that if the trigger is ever wrong, the control is not
       merely unanimated, it is gone. Only the contents of a row are
       animated, so the worst case here is a plain accordion rather than a
       dead one. This is the difference between animating content and
       animating an interface, and it is why the package tiers and the
       pillars below may be hidden and these may not.

       ONE PROPERTY EACH. .why__lbl WRAPS the icon tile, so giving both an
       opacity produced 0 x 0 on the tile and swallowed its entrance; the
       tile only looked like it was fading with everything else. The label
       unit owns the fade and the slide, the tile owns the scale, and
       nothing animates the same pixels twice. */
    gsap.set(labels, { opacity: 0, x: -14 });
    gsap.set(tiles, { scale: 0.62, transformOrigin: '50% 100%' });

    onArrive(document.querySelector('.why__acc'), 'top 86%', function (tl) {
      tl.to(labels, {
        opacity: 1, x: 0, duration: 0.8, ease: MOVE, stagger: 0.13,
        clearProps: 'transform'
      })
        /* The tile lands a beat after its own row has started moving, so
           each row reads as arriving and then resolving, rather than as
           three rows fading at once. Overlapped, not queued: beats that
           never quite stop are what separates choreography from a list. */
        .to(tiles, {
          scale: 1, duration: 1, ease: 'back.out(1.6)', stagger: 0.13,
          clearProps: 'transform'
        }, 0.12);
    });
  }

  /* BEAT THREE: the figure. This is the band's payoff and it was arriving
     as one lump, so the three lines now land in reading order and the
     number itself comes out of depth behind them. The count-up is already
     wired in the page on its own observer; this only handles the approach,
     and the two are independent on purpose so a failure in either still
     leaves a correct, readable figure. */
  var reach = document.querySelector('.reach');
  if (reach) {
    var pre  = reach.querySelector('.reach__pre');
    var val  = reach.querySelector('.reach__val');
    var post = reach.querySelector('.reach__post');
    var ctx  = reach.querySelector('.reach__ctx');
    var lines = [pre, val, post, ctx].filter(Boolean);

    gsap.set(reach, { opacity: 1 });
    gsap.set(lines, { opacity: 0, y: 14 });
    if (val) gsap.set(val, { scale: 0.86, transformOrigin: '50% 60%' });

    onArrive(reach, 'top 86%', function (tl) {
      tl.to(pre,  { opacity: 1, y: 0, duration: 0.8, ease: MOVE, clearProps: 'transform' })
        .to(val,  { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: OUT, clearProps: 'transform' }, 0.18)
        .to(post, { opacity: 1, y: 0, duration: 0.8, ease: MOVE, clearProps: 'transform' }, 0.5)
        .to(ctx,  { opacity: 1, y: 0, duration: 0.9, ease: MOVE, clearProps: 'transform' }, 0.72);
    });
  }

  /* ── 4 · THE TIERS ARRIVE AS A SET ──────────────────────────────────
     All three are in view together. They were dealt one per scroll step,
     which is wrong for this content: the tiers are a COMPARISON, and a
     comparison you have to scroll through is not one. You cannot weigh
     three prices against each other if the third has not arrived yet.
     So: one trigger, one arrival, a 0.09s stagger that reads as weight
     rather than as sequence, and the feature card leads by a hair because
     it is the one the eye should land on first.
     Not scrubbed either. A scrubbed arrival ties the cards to scroll
     position, which is the same problem in a different costume. */
  var packs = [].slice.call(document.querySelectorAll('#packages .pack'));
  if (packs.length) {
    var feature = document.querySelector('#packages .pack--feature');
    var ordered = feature ? [feature].concat(packs.filter(function (p) { return p !== feature; })) : packs;
    gsap.set(packs, { opacity: 0, y: 48, scale: 0.9, transformOrigin: '50% 100%' });
    onArrive(document.querySelector('#packages .packs'), 'top 82%', function (tl) {
      tl.to(ordered, {
        opacity: 1, y: 0, scale: 1, duration: 1.1, ease: OUT, stagger: 0.09,
        clearProps: 'transform'
      });
    });
  }

  /* ── 5 · THE SURFACE MAP ────────────────────────────────
     The tallest band on the page, 1319px, and the one the scrubbed
     approach hurt most: the fourth pillar was not starting until the band
     was most of the way off the top of the screen.

     EACH PILLAR NOW WATCHES ITSELF. Its own top crossing 86% of the
     viewport is what starts it, so it plays as it arrives no matter how
     tall the band is, how fast the scroll is, or where in the grid it
     sits. The band no longer has a single clock; it has four, and each one
     is correct for the card it belongs to.

     Dropped along with the scrub: holding the pillars not yet reached at
     0.34 opacity. Its purpose was to keep one part of the map the subject,
     but it was a scroll-position effect, so a visitor who stopped
     mid-band was left looking at greyed-out cards with no way to recover
     them. The emphasis now lives inside the arrival instead, where it
     costs nothing to be wrong about.

     WITHIN A PILLAR the header leads and the channels cascade behind it at
     0.07s, fast enough to read as one card assembling rather than as four
     more items queuing. The dot is the pillar's only graphic mark, so it
     pops slightly ahead of its own name. */
  var smap = document.querySelector('.smap');
  var pillars = smap ? [].slice.call(smap.querySelectorAll('.pillar')) : [];
  pillars.forEach(function (p) {
    var dot  = p.querySelector('.pillar__dot');
    var name = p.querySelector('.pillar__name');
    var chans = p.querySelectorAll('.chan');

    gsap.set(p, { opacity: 0, y: 30 });
    if (dot)  gsap.set(dot, { scale: 0, transformOrigin: '50% 50%' });
    if (name) gsap.set(name, { opacity: 0, x: -12 });
    gsap.set(chans, { opacity: 0, y: 18, scale: 0.97, transformOrigin: '50% 0%' });

    onArrive(p, 'top 86%', function (tl) {
      tl.to(p, { opacity: 1, y: 0, duration: 0.85, ease: OUT, clearProps: 'transform' })
        .to(dot, { scale: 1, duration: 0.6, ease: 'back.out(2.2)', clearProps: 'transform' }, 0.1)
        .to(name, { opacity: 1, x: 0, duration: 0.7, ease: MOVE, clearProps: 'transform' }, 0.16)
        .to(chans, {
          opacity: 1, y: 0, scale: 1, duration: 0.75, ease: MOVE,
          stagger: 0.07, clearProps: 'transform'
        }, 0.24);
    });
  });

  /* The wrap-around strip under the grid is the map's footnote, so it
     arrives after the cards rather than with them, as one row. */
  var wrapGrid = document.querySelector('.smap__wrap-grid');
  if (wrapGrid) {
    var wrapLbl = document.querySelector('.smap__wrap-lbl');
    var wrapKids = wrapGrid.children;
    if (wrapLbl) gsap.set(wrapLbl, { opacity: 0, y: 12 });
    gsap.set(wrapKids, { opacity: 0, y: 14 });
    onArrive(wrapGrid, 'top 88%', function (tl) {
      if (wrapLbl) tl.to(wrapLbl, { opacity: 1, y: 0, duration: 0.7, ease: MOVE, clearProps: 'transform' });
      tl.to(wrapKids, {
        opacity: 1, y: 0, duration: 0.7, ease: MOVE, stagger: 0.05, clearProps: 'transform'
      }, 0.12);
    });
  }

  /* ── 6 · THE CLOSE ─────────────────────────────────────
     The dark contact panel is the last thing on the page, so it arrives as
     one object out of depth rather than as its parts, and its chips follow
     on the same timeline instead of on a second trigger further down the
     panel. A second trigger inside a panel this tall was the surface map's
     fault in miniature: the chips sit near the bottom, so they were only
     starting once the panel was nearly past. */
  var contact = document.querySelector('#contact');
  var ctaPanel = contact && contact.querySelector('.cta');
  if (ctaPanel) {
    var chips = contact.querySelectorAll('.cta__chip');
    gsap.set(ctaPanel, { opacity: 0, y: 40, scale: 0.94, transformOrigin: '50% 100%' });
    gsap.set(chips, { opacity: 0, y: 14 });
    onArrive(contact, 'top 82%', function (tl) {
      tl.to(ctaPanel, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: OUT, clearProps: 'transform' })
        .to(chips, { opacity: 1, y: 0, duration: 0.8, ease: MOVE, stagger: 0.09, clearProps: 'transform' }, 0.45);
    });
  }

  /* ── 7 · THE DISCLOSURE ROWS ─────────────────────────────
     The Why band's three rows are a <details> group with a name, so the
     browser owns opening, closing and exclusivity. Only the HEIGHT is
     animated here, and only because the platform cannot do it yet.

     WHY NOT ::details-content. That pseudo-element plus
     interpolate-size:allow-keywords is the correct answer and this chassis
     should use it the moment it works. Tested 2026-09-28 against Chrome
     153, which reports support for ::details-content, interpolate-size,
     calc-size() and transition-behavior: the row opens to the right height
     only if content-visibility is forced back to visible on [open], and
     even then block-size 0 -> auto does not interpolate, it holds and
     jumps at the end of the duration. Two separate faults, neither ours.
     Re-test before swapping this out, and check that a row actually passes
     through intermediate heights, not merely that it ends up correct.

     SO: the Web Animations API, the standard pattern for animating a
     disclosure widget. It measures the two heights and animates between
     them. Not a hack and not a third defensive CSS rule; it is what the
     platform offers until the CSS lands.

     EXCLUSIVITY IS BORROWED, NOT REPLACED. The rows keep their name
     attribute, so with this file absent, blocked or thrown, the group is
     still a correct exclusive accordion. The name is lifted only for the
     length of one transition, because the browser closes a sibling
     instantly and that would leave the outgoing row snapping shut while
     the incoming one animated. Restored on completion, always, including
     when an animation is cancelled by a fast second click. */
  var accGroups = [].slice.call(document.querySelectorAll('.acc'));
  accGroups.forEach(function (group) {
    var items = [].slice.call(group.querySelectorAll('.acc__item'));
    if (!items.length || !items[0].animate) return;
    group.classList.add('acc--js');

    var DUR = 380, EASE = 'cubic-bezier(.32,.72,0,1)';
    var busy = false;

    function heightOf(el) { return el.getBoundingClientRect().height; }

    /* Measure the other state and come straight back. Reading a height
       forces layout but never a paint, so within one task the row is never
       drawn in the state we only borrowed to measure. This is why the
       closed height is measured rather than taken from the summary: the
       row carries its own rules and padding, and summary height is not it. */
    function otherHeight(el, open) {
      var was = el.open;
      el.open = open;
      var h = heightOf(el);
      el.open = was;
      return h;
    }

    function glide(el, from, to, done) {
      el.style.overflow = 'hidden';
      el.style.height = from + 'px';
      var a = el.animate({ height: [from + 'px', to + 'px'] },
                         { duration: DUR, easing: EASE });
      /* ONE CLEANUP PATH, not an onfinish plus an oncancel. The inline
         height is what makes the row wrong if it is ever left behind, so
         the code that removes it must run on every ending the animation
         can have. finished resolves on completion and rejects on cancel,
         so catching the rejection and then cleaning up covers both, and
         covers a finish() driven from outside as well. */
      return a.finished.catch(function () {}).then(function () {
        el.style.overflow = '';
        el.style.height = '';
        if (done) done();
      });
    }

    items.forEach(function (item) {
      var summary = item.querySelector('summary');
      var body = item.querySelector('.acc__body');
      if (!summary || !body) return;

      summary.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (busy) return;
        busy = true;

        var opening = !item.open;
        var sibling = opening ? items.filter(function (o) {
          return o !== item && o.open;
        })[0] : null;

        var names = items.map(function (o) { return o.getAttribute('name'); });
        items.forEach(function (o) { o.removeAttribute('name'); });

        /* A ROW STAYS OPEN WHILE IT COLLAPSES. Setting open=false first
           would pull the body out of the box on frame one and leave an
           empty rectangle shrinking, which is the same nothing-happens
           the snap gave us. open flips at the END of the collapse. */
        var from = heightOf(item);
        var to = otherHeight(item, opening);
        if (opening) item.open = true;

        body.animate(
          opening ? { opacity: [0, 1] } : { opacity: [1, 0] },
          {
            duration: opening ? DUR : DUR * 0.55,
            delay: opening ? DUR * 0.25 : 0,
            easing: 'ease', fill: 'backwards'
          }
        );

        var jobs = [glide(item, from, to, function () {
          if (!opening) item.open = false;
        })];

        if (sibling) {
          var sibFrom = heightOf(sibling);
          var sibTo = otherHeight(sibling, false);
          var sibBody = sibling.querySelector('.acc__body');
          if (sibBody) sibBody.animate({ opacity: [1, 0] }, { duration: DUR * 0.5, easing: 'ease' });
          jobs.push(glide(sibling, sibFrom, sibTo, function () { sibling.open = false; }));
        }

        Promise.all(jobs).then(function () {
          items.forEach(function (o, i) { if (names[i]) o.setAttribute('name', names[i]); });
          busy = false;
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        });
      });
    });
  });

  /* Fonts change layout, so every start/end position is remeasured once
     they land. Without this each scene fires slightly early, against
     fallback metrics. */
  /* NO EAGER REFRESH HERE. Refreshing before layout has settled measures
     every band at roughly y=0, so a once:true trigger is created already
     past its own end and ScrollTrigger disposes of it without ever calling
     onEnter. That silently blanks the whole page: the start states are set,
     nothing ever clears them. Refresh only after fonts and after load, both
     of which are points where the measurement is worth trusting. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
