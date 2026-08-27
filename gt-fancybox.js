/* Ghar.tv Fancybox helpers — shared config for lightboxes portal-wide.
 *
 * 2026-08-25 (this pass)
 * ─────────────────────────────────────────────────────────────────────
 * TWO document-level capture-phase interceptors ride on top of every
 * Fancybox lightbox on the portal:
 *
 *   A. IMAGE-CLICK on Work slides ONLY
 *      Fancybox default is `toggleFull` (fit ↔ natural size). For the
 *      brand-profile Work lightbox we want the visual step to be
 *      COVER, not full — the caption/sidebar hide first, then the
 *      next tap fills the frame with the image (cover), and the tap
 *      after that returns to fit while restoring the caption. Every
 *      step is reversible; the whole cycle takes at most three taps.
 *
 *      Cycle for Work:
 *        tap 1  fit + caption          →  fit + caption HIDDEN
 *        tap 2  fit + caption hidden   →  COVER + caption hidden
 *        tap 3  cover + caption hidden →  fit + caption RESTORED
 *
 *      Non-Work lightboxes (About Gallery, Certifications) keep
 *      Fancybox's default `toggleFull` — we don't intercept their
 *      image clicks at all.
 *
 *   B. BACKDROP / CHROME CLICK on ANY lightbox
 *      Any click that lands outside the image (on the backdrop, the
 *      empty chrome zone around it, the sidebar column, the caption
 *      strip) is treated as "step back", NOT "close":
 *        • If the container is marked .caption-hidden  →  restore
 *          the caption/sidebar and cancel the click.
 *        • Else if the container is marked .has-zoomed →  reset
 *          the panzoom to fit and cancel the click.
 *        • Else                                        →  let
 *          Fancybox handle it. Close is still available via the
 *          explicit X button (the close button, prev/next arrows,
 *          sidebar toggle, and thumbs are all excluded because they
 *          have their own click paths that stop this interceptor.)
 *
 *   The interceptors are drag-aware: any click preceded by a
 *   pointerdown → pointermove > DRAG_THRESHOLD px is treated as a
 *   pan-release and ignored (so pinch/pan gestures never cycle the
 *   zoom or restore the caption by accident). Mouse pan on desktop
 *   is Fancybox's own Panzoom drag behaviour — we don't touch it,
 *   the drag-detection here only cancels our OWN interceptor logic.
 *
 * Load order:
 *   Load AFTER fancybox.umd.js so window.Fancybox is defined by the
 *   time any click fires. Auto-installs on DOMContentLoaded (or
 *   immediately if the DOM is already parsed). The exposed
 *   window.gtFancybox.mergeDefaults(opts) API is a pass-through kept
 *   so page-level bind sites can uniformly call it without needing
 *   to know whether shared config is layered in.
 */
(function () {
  'use strict';

  var DRAG_THRESHOLD = 6;          /* px */
  var TAP_MAX_DURATION = 500;      /* ms */

  var installed = false;
  var lastPointer = null;          /* { x, y, t } captured on pointerdown */

  function onPointerDown(e) {
    if (!e.target || !e.target.closest) { lastPointer = null; return; }
    if (!e.target.closest('.fancybox__container')) { lastPointer = null; return; }
    lastPointer = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function wasDrag(e) {
    if (!lastPointer) return false;
    var dx = Math.abs(e.clientX - lastPointer.x);
    var dy = Math.abs(e.clientY - lastPointer.y);
    var dt = Date.now() - lastPointer.t;
    lastPointer = null;
    return (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD || dt > TAP_MAX_DURATION);
  }

  /* Elements inside .fancybox__container that OWN their own click
   * behaviour and must be left alone by our backdrop interceptor.
   * A click on any of these should reach Fancybox's own handlers. */
  var CHROME_SELECTORS = [
    '.f-button',                   /* close, prev/next, toolbar buttons */
    '.f-carousel__nav',            /* nav wrapper */
    '.fancybox__thumbs',           /* thumbstrip */
    '.fancybox__sidebar',          /* sidebar plugin content */
    '.fancybox__caption',
    '.f-caption',
    '[data-fancybox-close]',
    '[data-fancybox-prev]',
    '[data-fancybox-next]',
  ].join(',');

  function currentInstance() {
    if (typeof window.Fancybox === 'undefined') return null;
    return window.Fancybox.getInstance() || null;
  }

  function currentSlide() {
    var inst = currentInstance();
    if (!inst || typeof inst.getSlide !== 'function') return null;
    return inst.getSlide();
  }

  function isWorkSlide(slide) {
    if (!slide) return false;
    var trig = slide.triggerEl;
    if (!trig || !trig.classList) return false;
    /* Trigger element is the <a class="bpr-work"> anchor on the
     * profile page. The Work lightbox binds `data-fancybox="work"`
     * on those anchors, so we can also check the group. */
    if (trig.classList.contains('bpr-work')) return true;
    if (trig.getAttribute && trig.getAttribute('data-fancybox') === 'work') return true;
    return false;
  }

  /* ─── A. IMAGE-CLICK on Work slides ───────────────────────── */
  function handleImageClick(e, container) {
    var slide = currentSlide();
    if (!isWorkSlide(slide)) return false;   /* not our concern */

    var panzoom = slide && slide.panzoomRef;
    if (!panzoom || typeof panzoom.execute !== 'function') return false;

    /* State machine uses container flags we own — .caption-hidden
     * and .has-zoomed — instead of Fancybox's `will-zoom-out`
     * because that class only tracks a zoom-in-vs-zoom-out button
     * hint and does not fire reliably after a zoom call. */
    var captionHidden = container.classList.contains('caption-hidden');
    var hasZoomed     = container.classList.contains('has-zoomed');

    /* tap 1: caption visible → hide caption, no zoom */
    if (!captionHidden && !hasZoomed) {
      container.classList.add('caption-hidden');
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }

    /* tap 2: caption hidden + at fit → zoom the image so it visibly
     * fills the frame. `toggleCover` computes cover-fit automatically,
     * but on many Work photos (landscape 16:9 in a landscape modal)
     * the cover scale is almost the fit scale, so the visual move is
     * imperceptible. We measure the delta and, if it's under 40 %,
     * we top it up with a 2× zoom so the reader can actually SEE the
     * image get bigger. Everything still counts as "one step" from
     * the reader's point of view. */
    if (captionHidden && !hasZoomed) {
      var before = (typeof panzoom.getScale === 'function') ? panzoom.getScale() : 1;
      panzoom.execute('toggleCover');
      /* Panzoom animates; poll one frame later for the new scale. */
      requestAnimationFrame(function () {
        var after = (typeof panzoom.getScale === 'function') ? panzoom.getScale() : before;
        if (after / before < 1.4) {
          /* Cover barely moved — force a proper zoom. */
          if (typeof panzoom.zoomTo === 'function') {
            panzoom.zoomTo(before * 2, { friction: 0.15 });
          } else {
            panzoom.execute('zoomIn');
          }
        }
      });
      container.classList.add('has-zoomed');
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }

    /* tap 3: zoomed → return to fit AND restore caption in one step */
    if (hasZoomed) {
      if (typeof panzoom.execute === 'function') {
        panzoom.execute('reset');
      }
      container.classList.remove('has-zoomed');
      container.classList.remove('caption-hidden');
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
    return false;
  }

  /* ─── B. BACKDROP / CHROME CLICK on ANY lightbox ──────────── */
  function handleBackdropClick(e, container) {
    /* Ignore clicks on interactive chrome — those have their own paths. */
    if (e.target.closest && e.target.closest(CHROME_SELECTORS)) return false;

    /* If the modal is in a "reader interacted" state, step back
     * instead of closing. */
    var captionHidden = container.classList.contains('caption-hidden');
    var hasZoomed = container.classList.contains('has-zoomed');

    if (!captionHidden && !hasZoomed) return false;   /* nothing to undo */

    /* Reset zoom first, then restore caption. Two separate ticks so
     * the reader can see both steps if they click twice in a row. */
    if (hasZoomed) {
      var slide = currentSlide();
      var panzoom = slide && slide.panzoomRef;
      if (panzoom && typeof panzoom.execute === 'function') {
        panzoom.execute('reset');
      }
      container.classList.remove('has-zoomed');
      /* Leave caption-hidden intact so the NEXT click can restore it. */
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }

    if (captionHidden) {
      container.classList.remove('caption-hidden');
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
    return false;
  }

  function clickInterceptor(e) {
    if (!e.target || !e.target.closest) return;
    var container = e.target.closest('.fancybox__container');
    if (!container) return;

    /* Drag guard — if this click came from a pan-release, drop it. */
    if (wasDrag(e)) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }

    var onImage = !!e.target.closest('.f-panzoom__content');
    if (onImage) {
      handleImageClick(e, container);
      return;
    }
    handleBackdropClick(e, container);
  }

  function install() {
    if (installed) return;
    installed = true;
    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    document.addEventListener('click', clickInterceptor, { capture: true });
  }

  /* Pass-through: page-level bind sites can call this and layer any
   * future shared Fancybox options in one place. Today it just
   * returns the incoming options unchanged. */
  function mergeDefaults(options) {
    install();
    return options || {};
  }

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
