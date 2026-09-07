/* ════════════════════════════════════════════════════════════════════════════
   VideoWorks: /videoworks
   ────────────────────────────────────────────────────────────────────────────
   Two jobs: get the hero video on screen cheaply, and run the three-stage
   scroll story without spending the frame budget.

   WHAT THIS FILE DELIBERATELY NO LONGER DOES (all removed from the v1 build):
     - a custom cursor. `cursor:none` on every element plus a GSAP quickTo per
       mousemove is a main-thread write on every pointer event, and it takes
       the OS cursor away from anyone who depends on it.
     - a mousemove parallax writing transforms onto the <video> element, which
       re-composites the video layer continuously for an effect nobody asked
       for.
     - magnetic buttons. Same cost, and they fight the 44px touch target.
     - a per-character split of the H1, which produced ~11 wrapper elements
       per word before the page had painted anything.

   WHAT IT DOES INSTEAD:
     - loads the RIGHT video for the viewport and connection, after first
       paint, behind a poster;
     - drives one scrubbed timeline that only ever animates transform and
       opacity;
     - pauses the video whenever the hero is off screen, so a reader parked on
       the FAQ is not decoding 25fps of 1080p behind them.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════════════════════════════════
     1 · ADAPTIVE VIDEO LOADING

     The markup ships NO <source> children and no src. The poster paints
     immediately (128KB JPG, already in the HTML), and the real file is chosen
     and attached here once the page is idle. That way the hero renders on the
     first frame regardless of how the video is going, and a phone on a metered
     connection never pulls the 1080p file just because it happened to be first
     in the source list.

     Source-order selection in HTML cannot do this: <source media> is evaluated
     once at parse time against the viewport ONLY, so it cannot see saveData or
     effectiveType, and Chrome ignores `media` on <source> inside <video>
     entirely. Choosing in JS is the only way to honour all three.
     ══════════════════════════════════════════════════════════════════════════ */
  function attachVideo() {
    var video = document.querySelector('.vw-video');
    if (!video || video.dataset.attached) return;

    var conn = navigator.connection || {};
    // Save-Data, or a genuinely slow link: stay on the poster. The page still
    // reads correctly: the poster IS a frame of the film.
    if (conn.saveData === true || /^(slow-2g|2g)$/.test(conn.effectiveType || '')) {
      video.dataset.attached = 'skipped';
      return;
    }

    // 720p under 900px CSS or on 3g. Above that, 1080p, WebM first where the
    // browser will take it (VP9 is ~15% smaller here than the H.264 at
    // matched quality).
    var small = window.innerWidth < 900 || (conn.effectiveType === '3g');
    var sources = small
      ? [['/brand_assets/videoworks-hero-720.mp4', 'video/mp4']]
      : [['/brand_assets/videoworks-hero-web.webm', 'video/webm'],
         ['/brand_assets/videoworks-hero-web.mp4',  'video/mp4']];

    sources.forEach(function (s) {
      var el = document.createElement('source');
      el.src = s[0];
      el.type = s[1];
      video.appendChild(el);
    });

    video.dataset.attached = 'yes';
    video.load();
    var p = video.play();
    // Autoplay can still be refused (low power mode, some enterprise policy).
    // The poster stays up and nothing else on the page depends on playback.
    if (p && p.catch) p.catch(function () {});
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(attachVideo, { timeout: 2000 });
  } else {
    window.addEventListener('load', function () { setTimeout(attachVideo, 200); }, { once: true });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2 · PAUSE THE VIDEO WHEN THE HERO IS OFF SCREEN
     The page is eight sections long. Decoding video for the seven the reader
     is actually looking at is pure waste, and on a laptop it is the difference
     between the fan running and not.
     ══════════════════════════════════════════════════════════════════════════ */
  var scroller = document.getElementById('vwScroll');
  if (scroller && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var video = document.querySelector('.vw-video');
      if (!video || video.dataset.attached !== 'yes') return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0 }).observe(scroller);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2b · GLASS BAR STATE

     body.nav-over-hero paints the masthead as a low-tint glass pane while it
     sits on the film frame, and firms it up to a near-solid surface once the
     reader is past the fold. `data-scrolled` is the same hook the profile
     chassis uses, so the two behave identically; it is set here because
     main.js does not publish it globally.

     Threshold is 40px, matching the profile pages. Read in a rAF so a fast
     flick cannot queue a layout read per scroll event.
     ══════════════════════════════════════════════════════════════════════════ */
  (function () {
    var ticking = false;
    function apply() {
      ticking = false;
      if (window.scrollY > 40) document.body.setAttribute('data-scrolled', '');
      else document.body.removeAttribute('data-scrolled');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  })();

  /* ══════════════════════════════════════════════════════════════════════════
     3 · WORD SPLIT for the stage-3 reveal
     The canonical For Brokers pattern from index.html (main.js ~1950): split
     on whitespace, keep the whitespace tokens so the line still wraps
     naturally, wrap each word in a span whose COLOUR the timeline fills in.
     Word-level, not character-level: 26 spans instead of ~150.
     ══════════════════════════════════════════════════════════════════════════ */
  var heading = document.querySelector('[data-words]');
  if (heading) {
    var parts = heading.textContent.split(/(\s+)/);
    heading.innerHTML = parts.map(function (token) {
      return /^\s+$/.test(token) ? ' ' : '<span class="vw-rw">' + token + '</span>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4 · THE SCROLL TIMELINE
     One ScrollTrigger across the 300vh wrapper, scrubbed. Every tween below
     is transform or opacity: see the performance note at the top of
     videoworks.css for why that constraint is not negotiable on this page.
     ══════════════════════════════════════════════════════════════════════════ */
  if (prefersReduced) return;                       // CSS already shows the resolved layout
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#vwScroll',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  });

  /* EVERY TWEEN BELOW STATES ITS OWN DURATION ON PURPOSE.
     GSAP's default is 0.5, which on a 0-to-1 scrubbed timeline is HALF the
     scroll. Leaving it implicit is what made the first cut misbehave: the dim
     was still only a fifth of the way up at the point the text began to fill,
     so the line appeared over bright footage and could not be read. Durations
     here are fractions of the whole scroll, so they have to be deliberate. */

  /* STAGE 2 (0 → 0.5): the stage grows toward viewport fill while the four
     capability labels leave. `scale` on the WRAPPER, never on the video, and
     the framed treatment retires by fading its sibling overlay rather than by
     animating border-radius and box-shadow (both of which repaint). */
  tl.to('.vw-stage',        { scale: 2.2, duration: 0.5, ease: 'none' }, 0)
    .to('.vw-stage__frame', { opacity: 0, duration: 0.35, ease: 'none' }, 0)
    .to('.vw-feat--tl',     { xPercent: -120, yPercent: -80, opacity: 0, duration: 0.34, ease: 'power2.in' }, 0)
    .to('.vw-feat--tr',     { xPercent:  120, yPercent: -80, opacity: 0, duration: 0.34, ease: 'power2.in' }, 0)
    .to('.vw-feat--bl',     { xPercent: -120, yPercent:  80, opacity: 0, duration: 0.34, ease: 'power2.in' }, 0)
    .to('.vw-feat--br',     { xPercent:  120, yPercent:  80, opacity: 0, duration: 0.34, ease: 'power2.in' }, 0)
    .to('.vw-scroll-cue',   { opacity: 0, y: 24, duration: 0.2, ease: 'power2.in' }, 0);

  /* STAGE 3: the dim LEADS the text, and finishes before the first word
     lights. The reading surface has to exist before there is anything to
     read on it. */
  tl.to('.vw-stage__dim', { opacity: 1, duration: 0.22, ease: 'none' }, 0.28)
    .to('.vw-reveal',     { opacity: 1, duration: 0.05, ease: 'none' }, 0.5);

  /* The word-fill has to FIT. 26 words at the old 0.02 stagger plus a default
     0.5 duration ran to ~1.5 on a timeline that ends at 1, so the last third
     of the line never lit at all. Both numbers are derived from the real word
     count now, and the run is clamped to end at 0.94, just before the foot. */
  var words = document.querySelectorAll('.vw-rw');
  var fillStart = 0.5, fillEnd = 0.94, wordDur = 0.06;
  tl.to(words, {
    color: '#f5efe6',
    duration: wordDur,
    stagger: words.length > 1
      ? (fillEnd - fillStart - wordDur) / (words.length - 1)
      : 0,
    ease: 'none'
  }, fillStart)
    .to('[data-reveal-foot]', { opacity: 1, duration: 0.06, ease: 'none' }, 0.94);

  /* Gazpacho swaps in after first paint and changes the reveal line's height,
     which moves the whole pinned composition. Re-measure once it lands. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  /* ── Section reveals ──────────────────────────────────────────────────────
     Everything below the hero gets one cheap fade-up on entry. batch() so a
     row of cards animates as a row rather than each card firing its own
     trigger, which is the same posture as window.gharGridReveal() on the
     directory pages. */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: function (batch) {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power2.out',
        overwrite: true
      });
    }
  });
  gsap.set('[data-reveal]', { opacity: 0, y: 20 });
})();
