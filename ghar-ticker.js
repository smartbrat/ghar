/* ═════════════════════════════════════════════════════════════════════
   ghar-ticker.js — canonical brand-ticker / logo-ticker / marquee
   shared across the portal.

   CONTINUOUS-DRIFT marquee with initCarousel-style smooth drag layered
   on top. rAF advances the GSAP `x` transform by ~0.5px per frame for
   the continuous flow (not discrete card steps). Duplicated set lets
   the loop wrap silently when x reaches -halfWidth. Drag pauses the
   loop; pointermove writes are rAF-batched through `gsap.set`; release
   projects momentum and glides with power3.out; configurable cool-down
   before drift resumes. Same drag mechanic as the home-page category-
   tags carousel — just with continuous flow on top.

   This file is the CANONICAL source for the brand-ticker pattern. Per
   [[feedback_reuse_shared_classes]] every ticker on every page links
   this script and calls `window.initTicker(opts)`. Do NOT inline a
   second copy on any new page.

   Prerequisites the host page must satisfy:
     1. GSAP global (`gsap`) loaded before this script runs.
     2. The outer element must have `position:relative` (or otherwise
        be a transform context), `overflow-x:clip` (or hidden), and
        a mask-image fade on the left + right edges if you want soft
        boundaries. See `.ep-brands--ticker` in styles.css for the
        reference CSS.
     3. The track must contain TWO copies of every item (Set 1 + Set 2)
        so the wrap is invisible — when curX hits -halfWidth, Set 2
        slides into Set 1's prior position and the user sees no jump.

   Usage:
     initTicker({
       outer: document.querySelector('.ep-brands--ticker'),
       track: document.querySelector('.ep-ticker-track'),
       itemSelector: '.ep-brand',
     });

   Optional opts:
     speed         — px per frame for the drift (default 0.5)
     cooldownMs    — pause duration after user releases drag (default 1500)
     momentumMul   — velocity × this = drag-release glide distance (default 220)
     glideDur      — drag-release glide animation duration in seconds (default 0.45)

   Returns: nothing. The ticker is fire-and-forget once initialized.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  function initTicker(opts) {
    if (typeof gsap === 'undefined') {
      setTimeout(function () { initTicker(opts); }, 50);
      return;
    }
    var outer = opts.outer;
    var track = opts.track;
    if (!outer || !track) return;
    var itemSelector = opts.itemSelector || '> *';
    var SPEED = opts.speed != null ? opts.speed : 0.5;
    var COOLDOWN_MS = opts.cooldownMs != null ? opts.cooldownMs : 1500;
    var MOMENTUM_MUL = opts.momentumMul != null ? opts.momentumMul : 220;
    var GLIDE_DUR = opts.glideDur != null ? opts.glideDur : 0.45;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var inView = false, hovered = false, dragging = false, lastInteract = 0;
    var raf = 0, halfWidth = 0, curX = 0;

    /* halfWidth = distance between Set1[0] and Set2[0] (one full content cycle).
       Using offsetLeft difference keeps the wrap perfectly seamless — viewport-
       left shows the same item at the same offset both before and after wrap. */
    function measure() {
      var items = track.querySelectorAll(itemSelector);
      var setSize = Math.floor(items.length / 2);
      if (setSize >= 1 && items[setSize]) {
        halfWidth = items[setSize].offsetLeft - items[0].offsetLeft;
      } else {
        halfWidth = track.scrollWidth / 2;
      }
    }
    measure();
    window.addEventListener('resize', measure);
    if (document.readyState === 'complete') setTimeout(measure, 100);
    else window.addEventListener('load', function () { setTimeout(measure, 100); });

    function wrap(x) {
      while (x <= -halfWidth) x += halfWidth;
      while (x > 0) x -= halfWidth;
      return x;
    }

    function tick() {
      raf = 0;
      if (!inView || hovered || reducedMotion) return;
      if (dragging || (Date.now() - lastInteract) < COOLDOWN_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      curX = wrap(curX - SPEED);
      gsap.set(track, { x: curX });
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }

    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) start();
    }, { rootMargin: '120px 0px' }).observe(outer);

    outer.addEventListener('mouseenter', function () { hovered = true; });
    outer.addEventListener('mouseleave', function () { hovered = false; start(); });

    /* Drag — rAF-batched gsap.set writes. Velocity averaged over a 100ms window
       of recent pointermove samples so a tiny finger-jitter at release doesn't
       reverse the throw. Momentum × MOMENTUM_MUL with power2.out glide. */
    var dragStartX = 0, dragStartVal = 0;
    var hasMoved = false, pointerId = null;
    var pendingX = 0, rafPending = false;
    var velSamples = [];

    function flushDrag() { rafPending = false; gsap.set(track, { x: pendingX }); curX = pendingX; }
    function pushSample(x, t) {
      velSamples.push({ x: x, t: t });
      while (velSamples.length > 12) velSamples.shift();
      while (velSamples.length > 2 && t - velSamples[0].t > 100) velSamples.shift();
    }
    function windowedVelocity() {
      if (velSamples.length < 2) return 0;
      var a = velSamples[0], b = velSamples[velSamples.length - 1];
      var dt = Math.max(b.t - a.t, 1);
      var v = (b.x - a.x) / dt;
      if (Math.abs(v) < 0.06) return 0;
      return v;
    }

    outer.addEventListener('click', function (e) {
      if (hasMoved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    outer.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      gsap.killTweensOf(track);
      dragging = true; hasMoved = false;
      dragStartX = e.clientX;
      dragStartVal = curX;
      velSamples = [];
      pushSample(e.clientX, Date.now());
      pointerId = e.pointerId;
      outer.classList.add('is-dragging');
      try { outer.setPointerCapture(pointerId); } catch (_) {}
    });

    outer.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 5) hasMoved = true;
      pushSample(e.clientX, Date.now());
      pendingX = wrap(dragStartVal + dx);
      if (!rafPending) { rafPending = true; requestAnimationFrame(flushDrag); }
    });

    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      lastInteract = Date.now();
      outer.classList.remove('is-dragging');
      try { outer.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
      var vel = windowedVelocity();
      var momentum = vel * MOMENTUM_MUL;
      var target = curX + momentum;

      /* Reverse-direction bug fix (caught again 2026-06-10): the
         marquee is a continuous loop, so `target` can legitimately
         exit the [-halfWidth, 0] wrap range. If we just wrapped the
         target here, GSAP would animate from curX (near one boundary)
         to the WRAPPED target (near the opposite boundary) — visually
         reading as a snap-back in the reverse direction of the throw.
         Instead, pre-shift curX (and the actual GSAP track position)
         by halfWidth as many times as needed so the target stays in
         range. The duplicated marquee set means the pre-shift is
         visually identical — user sees a smooth continuous glide in
         the direction they threw. */
      if (halfWidth > 0) {
        while (target < -halfWidth) { curX += halfWidth; target += halfWidth; }
        while (target > 0)          { curX -= halfWidth; target -= halfWidth; }
        gsap.set(track, { x: curX });
      }

      gsap.to(track, {
        x: target,
        duration: GLIDE_DUR,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: function () { curX = gsap.getProperty(track, 'x'); },
        onComplete: function () { curX = wrap(gsap.getProperty(track, 'x')); gsap.set(track, { x: curX }); start(); }
      });
      setTimeout(function () { hasMoved = false; }, 0);
    }
    outer.addEventListener('pointerup', endDrag);
    outer.addEventListener('pointercancel', endDrag);
    outer.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  window.initTicker = initTicker;
})();
