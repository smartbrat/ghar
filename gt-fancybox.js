/* Ghar.tv Fancybox helpers — shared config for lightboxes portal-wide.
 *
 * What this file does:
 *   Replaces Fancybox v6.1's default single-click action (`toggleFull`,
 *   which leaps straight to natural size in one tap) with the semantic
 *   zoom-levels iterator (`iterateZoom`), which walks fit → cover →
 *   full → fit on each tap. Same "zoom levels" concept described at
 *   https://fancyapps.com/panzoom/guides/zoom-levels/
 *
 *   Also rejects "clicks" that are actually drag-releases (pointerdown
 *   → pan → pointerup) so panning a zoomed image doesn't accidentally
 *   cycle to the next zoom level.
 *
 * How it works:
 *   Fancybox v6.1 does not propagate the per-slide Panzoom's
 *   `clickAction` from any Fancybox-level option path we could find
 *   (top-level Panzoom, Carousel.Panzoom, or on-init option mutation
 *   all silently no-op against the actual per-slide instance).
 *
 *   So instead of routing through options, we install a single
 *   document-level capture-phase click interceptor that:
 *     1. Tracks pointerdown position on the panzoom content
 *     2. On click: if the pointer moved more than DRAG_THRESHOLD px
 *        between pointerdown and click, treats it as a drag-release
 *        and does nothing (Panzoom's own pan behavior stands)
 *     3. Otherwise: stopImmediatePropagations to block Fancybox's own
 *        click handler (`toggleFull`) and calls
 *        `panzoom.execute('iterateZoom')` on the active slide's
 *        panzoom instance
 *
 *   Any earlier capture-phase click listener that stopImmediates (e.g.
 *   the Work lightbox caption/sidebar toggle) runs first and prevents
 *   this interceptor from firing on that tap — so custom per-lightbox
 *   flows still work.
 *
 * Usage:
 *   Include with <script src="gt-fancybox.js"></script>. No page-level
 *   integration required — the interceptor auto-installs on
 *   DOMContentLoaded (or immediately if the DOM is already ready).
 *   The exposed `window.gtFancybox.mergeDefaults(opts)` API is kept
 *   as a no-op passthrough so page code can call it uniformly and we
 *   can layer more shared config here later.
 *
 * Load order:
 *   Load AFTER `fancybox.umd.js` so `window.Fancybox` is defined by
 *   the time the interceptor runs its first click. Load order relative
 *   to page-level Fancybox.bind() / show() calls does NOT matter — the
 *   interceptor operates on the live instance at click time.
 */
(function () {
  'use strict';

  /* Pixel distance below which a pointerdown → pointerup is treated
   * as a tap. Anything above is a drag; do not fire iterateZoom. */
  var DRAG_THRESHOLD = 6;

  /* Max ms between pointerdown and click for the event to count as
   * a tap. Long-press-then-release without movement is browser-legal
   * as a click but semantically a "hold", not a tap; don't zoom. */
  var TAP_MAX_DURATION = 500;

  var installed = false;
  var lastPointer = null; /* { x, y, t } captured on pointerdown */

  function onPointerDown(e) {
    if (!e.target || !e.target.closest) { lastPointer = null; return; }
    if (!e.target.closest('.f-panzoom__content')) { lastPointer = null; return; }
    lastPointer = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function clickInterceptor(e) {
    /* Only act on clicks that land on the Fancybox panzoom content
     * (the image itself, not the chrome, sidebar, thumbs, or backdrop). */
    if (!e.target || !e.target.closest) return;
    var content = e.target.closest('.f-panzoom__content');
    if (!content) return;
    var container = e.target.closest('.fancybox__container');
    if (!container) return;

    /* Drag detection — reject clicks that come from a drag-release
     * (pointer moved > DRAG_THRESHOLD px OR the interaction lasted
     * > TAP_MAX_DURATION ms). This is what stops a pan-drag from
     * accidentally triggering a zoom level change. */
    if (lastPointer) {
      var dx = Math.abs(e.clientX - lastPointer.x);
      var dy = Math.abs(e.clientY - lastPointer.y);
      var dt = Date.now() - lastPointer.t;
      lastPointer = null;
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD || dt > TAP_MAX_DURATION) {
        /* Was a drag or hold, not a tap. Let Panzoom keep whatever
         * state its own pan gesture left. Still block Fancybox's
         * default click so it doesn't toggleFull as a fallback. */
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
      }
    }

    /* Grab the active slide's panzoom via the live Fancybox instance. */
    if (typeof window.Fancybox === 'undefined') return;
    var instance = window.Fancybox.getInstance();
    if (!instance) return;
    var slide = instance.getSlide && instance.getSlide();
    var panzoom = slide && slide.panzoomRef;
    if (!panzoom || typeof panzoom.execute !== 'function') return;

    /* Block Fancybox's default click and step through zoom levels.
     *
     * Progression: each tap doubles the current scale (Fancybox v6
     * `zoomIn` action, hardcoded 2× step). At natural size the max
     * cap kicks in and `canZoomIn()` returns false — the next tap
     * resets to fit and the cycle re-arms.
     *
     * Typical cycle on a large image (natural ~6× fitted):
     *   tap 1: fit (1×)   → 2×
     *   tap 2: 2×         → 4×
     *   tap 3: 4×         → natural (capped)
     *   tap 4: natural    → reset to fit
     *
     * On small images (natural ≤ 2× fitted), the cycle short-circuits:
     *   tap 1: fit → natural  (canZoomIn immediately false)
     *   tap 2: natural → reset
     *
     * This gives finer zoom control than Fancybox's built-in
     * `iterateZoom` (which cycled fit → cover → full in ~3 taps
     * with a big jump from cover to full). Natural size is still
     * the cap — no pixelation past the source image resolution. */
    e.stopImmediatePropagation();
    e.preventDefault();
    if (panzoom.getScale() > 1.05 && typeof panzoom.canZoomIn === 'function' && !panzoom.canZoomIn()) {
      panzoom.execute('reset');
    } else {
      panzoom.execute('zoomIn');
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    /* Pointerdown tracker in capture phase so we see it before any
     * per-page pan handlers might synthesize their own events. */
    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    document.addEventListener('click', clickInterceptor, { capture: true });
  }

  /* API stub. No-op passthrough today; kept so page code can consistently
   * call `window.gtFancybox.mergeDefaults(opts)` and future shared
   * config that DOES route through Fancybox options can plug in here
   * without touching every bind site. */
  function mergeDefaults(options) {
    install();
    return options || {};
  }

  /* Auto-install so bare `data-fancybox` anchors work without any page
   * integration. Idempotent — safe to call install() multiple times. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }

  window.gtFancybox = {
    install: install,
    mergeDefaults: mergeDefaults,
    DRAG_THRESHOLD: DRAG_THRESHOLD,
    TAP_MAX_DURATION: TAP_MAX_DURATION,
  };
})();
