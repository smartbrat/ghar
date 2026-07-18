/* ═════════════════════════════════════════════════════════════════════
   ghar-carousel.js — single GSAP-driven carousel for every horizontal
   rail on every page of the portal (cities, projects, intelligence,
   design pillars, designers, brand spotlight, collections, etc.).

   This file is the CANONICAL source. It is byte-faithful to the version
   originally inlined in index.html and is loaded by any page that uses
   the .rail-outer / .rail chassis. Do NOT inline a second copy on any
   new page — link this file with `<script src="ghar-carousel.js" defer>`.

   Prerequisites the host page must satisfy before loading this script:
     1. GSAP global (`gsap`) loaded. The function defers itself via
        setTimeout if gsap isn't ready yet.
     2. `window.__GHAR_IS_TOUCH__` set by an inline IIFE near the top
        of <body>. Touch detection is page-load critical and stays
        inline so CSS can react before paint. Standard snippet:
          var hasTouch = ('ontouchstart' in window) ||
                         ((navigator.maxTouchPoints || 0) > 0);
          window.__GHAR_IS_TOUCH__ = hasTouch && window.innerWidth < 1024;
          if (window.__GHAR_IS_TOUCH__) document.documentElement.classList.add('touch-device');

   See the doc comment on initCarousel below for the full option set.

   Per [[feedback_reuse_shared_classes]]: every horizontal rail across
   the portal uses the .rail-outer / .rail chassis (styles.css 3500-)
   and wires into this single initCarousel — no per-section reimplementation.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  /* ═══════════════════════════════════════════════════════════════════
     initCarousel — single GSAP-driven carousel for every horizontal
     rail on this page (cities, projects, intelligence cards, design
     cards, intelligence chips, design pills). Replaces what used to
     be three near-identical init functions.
     opts:
       outer        — the clip element
       track        — the rail (transform-translated child of outer)
       prevBtn      — optional Previous button
       nextBtn      — optional Next button
       arrowPrev    — optional in-rail Previous arrow (cities only)
       arrowNext    — optional in-rail Next arrow
       fadeL/fadeR  — optional fade gradient elements (cities only)
       snap         — 'card' (default) | 'page' | 'free'
                        card: arrow steps 1, drag-release snaps to nearest card
                        page: arrow steps floor(--n) cards, drag-release snaps to page boundary
                        free: arrow scrolls 70% of viewport, drag-release glides
       widthMode    — 'auto' (default) | 'fractional-n'
                        fractional-n: read --n from cssVarHost; size cards so floor(N)
                        full + fractional peek fit; toggles `.is-peeking` on outer
       cssVarHost   — element to read --n from (defaults to outer.closest('.dc-block, [data-block], section'))
       nVar         — CSS variable name for N (default '--n')
       autoplayMs   — interval in ms; 0 = no autoplay
       arrowExcludeSelector — pointerdown skip target (default 'button')
       clickSlopPx  — pointermove distance (px) before a pointerdown is
                      reclassified as a drag and the eventual click is
                      suppressed. Default 5 (preserves existing behaviour
                      for section-grid carousels). Modal chip rails pass
                      a higher value (e.g. 12) so small mouse / trackpad
                      jitter during a chip tap doesn't lose the click.
     ═══════════════════════════════════════════════════════════════════ */
  function initCarousel(opts) {
    if (typeof gsap === 'undefined') {
      setTimeout(function() {
        initCarousel(opts);
      }, 50);
      return;
    }
    var outer = opts.outer,
      track = opts.track;
    if (!outer || !track) return;
    var prevBtn = opts.prevBtn || null,
      nextBtn = opts.nextBtn || null;
    var arrowPrev = opts.arrowPrev || null,
      arrowNext = opts.arrowNext || null;
    var fadeL = opts.fadeL || null,
      fadeR = opts.fadeR || null;
    var snap = opts.snap || 'card';
    var widthMode = opts.widthMode || 'auto';
    var cssVarHost = opts.cssVarHost || outer.parentElement || outer;
    var nVar = opts.nVar || '--n';
    var autoplayMs = opts.autoplayMs || 0;
    var arrowExcludeSelector = opts.arrowExcludeSelector || 'button';
    var clickSlopPx = typeof opts.clickSlopPx === 'number' ? opts.clickSlopPx : 5;
    /* centerMode — when active, the chosen card is centered in the         viewport with neighbours peeking on both sides. Mirrors         index.html's eco-hero / GharEvents pattern. CSS handles card         width + side padding via `.is-centered`; JS just flips the class.         `centerMode: true` is always-on. `centerModeQuery: '(max-width:         899px)'` (or any media query) makes it dynamic — active only         while the query matches, normal paged behavior otherwise. */
    var centerModeStatic = opts.centerMode === true;
    var centerModeQuery = opts.centerModeQuery || null;
    var centerModeMQ = (centerModeQuery && window.matchMedia) ? window.matchMedia(centerModeQuery) : null;

    /* Touch detection comes from the once-at-load check at the top
       of the host page (window.__GHAR_IS_TOUCH__). Survives Samsung S
       Pen which defeats `(hover: none)` and `(any-pointer: fine)`. */
    var isTouch = !!window.__GHAR_IS_TOUCH__;
    if (isTouch) {
      outer.classList.add('is-native');
      /* Inject end-spacer so the rail's right gutter (pad-h) is part
         of scrollWidth — browsers don't honor trailing inner-flex
         padding in horizontal scroll-cap math, so without this the
         last card scrolls flush to the viewport edge instead of the
         section content-right grid line. Spacer width compensates
         for the rail's `gap` (which still applies between last card
         and the spacer) so the total right gutter equals one pad-h
         and not gap + pad-h. */
      if (!track.querySelector(':scope > .rail-end-spacer')) {
        var spacer = document.createElement('span');
        spacer.className = 'rail-end-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        var trackCS = getComputedStyle(track);
        var trackGap = parseFloat(trackCS.columnGap || trackCS.gap || '0') || 0;
        var padH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad-h')) || 24;
        /* Spacer is always pad-h wide; cancel the rail's `gap` with a
           negative margin-left so the spacer's RIGHT edge sits exactly
           one pad-h past the last card's right edge — total trailing
           scroll content past the last card = pad-h (not gap + pad-h). */
        spacer.style.flex = '0 0 ' + padH + 'px';
        spacer.style.marginLeft = '-' + trackGap + 'px';
        track.appendChild(spacer);
      }
    }

    function isCentered() {
      if (centerModeMQ) return centerModeMQ.matches;
      return centerModeStatic;
    }
    var current = 0;

    function items() {
      /* Skip children hidden via `display: none` — they're DOM-resident         layout zeroes (e.g. desktop-only `.bc4v2-divider` spans that hide         on phone) and counting them as carousel slots makes autoplay tick         through invisible positions and wrap back early. Also skip the
         injected `.rail-end-spacer` which exists only to extend
         scrollWidth so the last card lands at the section content-right
         gutter on native-scroll touch. */
      return Array.from(track.children).filter(function (c) {
        if (c.classList && c.classList.contains('rail-end-spacer')) return false;
        return getComputedStyle(c).display !== 'none';
      });
    }

    function gapPx() {
      return parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
    }

    function getN() {
      return parseFloat(getComputedStyle(cssVarHost).getPropertyValue(nVar)) || 1;
    }

    function pageStep() {
      return Math.max(1, Math.floor(getN()));
    } /* Card-width formula for paged carousels with fractional --n.         Integer N → cards fit content, no bleed. Fractional N → peek into         right bleed zone to viewport edge; toggle `.is-peeking` so CSS         applies bleed margins + pad-h track padding. */
    function applyCardWidth() {
      /* Sync `.is-centered` class to current matchMedia state so resize           across the breakpoint flips the carousel between center-mode           (CSS-driven card width) and paged (JS-driven fractional-n). */
      var centered = isCentered();
      outer.classList.toggle('is-centered', centered);
      var cs = items();
      if (!cs.length) return;
      if (centered) {
        /* CSS owns card width + side padding via `.is-centered`. Drop             `.is-peeking` and clear any inline width left from a prior             fractional-n pass at a different viewport. */
        outer.classList.remove('is-peeking');
        cs.forEach(function(c) {
          c.style.width = '';
        });
        return;
      }
      if (widthMode !== 'fractional-n') {
        /* Leaving centerMode at runtime in non-fractional carousels:             still need to clear any leftover width values. */
        cs.forEach(function(c) {
          c.style.width = '';
        });
        return;
      }
      var n = getN(),
        floorN = Math.floor(n);
      var isInt = (n === floorN),
        g = gapPx();
      outer.classList.toggle('is-peeking', !isInt);
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var w = isInt ? (outer.clientWidth - Math.max(0, n - 1) * g) / n : (outer.clientWidth - pad - floorN * g) / n;
      cs.forEach(function(c) {
        c.style.width = w + 'px';
      });
    }

    function maxX() {
      var cs = items();
      if (!cs.length) return 0;
      var last = cs[cs.length - 1];
      var padR = parseFloat(getComputedStyle(track).paddingRight) || 0;
      return Math.min(0, outer.clientWidth - padR - (last.offsetLeft + last.offsetWidth));
    }

    function clampX(x) {
      var m = maxX();
      return x > 0 ? 0 : x < m ? m : x;
    }

    function getX() {
      if (isTouch) return -outer.scrollLeft;
      var t = gsap.getProperty(track, 'x');
      return typeof t === 'number' ? t : 0;
    }
    function setX(x) {
      if (isTouch) {
        outer.scrollLeft = -x;
      } else {
        gsap.set(track, { x: x });
      }
    }

    function overflowing() {
      return track.scrollWidth - outer.clientWidth > 1;
    }

    function offsetForIndex(i) {
      var cs = items();
      if (!cs.length) return 0;
      var first = cs[0].offsetLeft;
      var target = cs[Math.max(0, Math.min(i, cs.length - 1))] || cs[0];
      return clampX(-(target.offsetLeft - first));
    }

    function nearestIndex(x) {
      var cs = items();
      if (!cs.length) return 0;
      var first = cs[0].offsetLeft;
      var best = 0,
        bestDist = Infinity;
      cs.forEach(function(c, i) {
        var ideal = clampX(-(c.offsetLeft - first));
        var d = Math.abs(ideal - x);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    function atStart() {
      return getX() >= -0.5;
    }

    function atEnd() {
      return getX() <= maxX() + 0.5;
    }

    function updateState() {
      var over = overflowing();
      outer.classList.toggle('is-overflowing', over);
      if (!over) {
        setX(0);
        outer.classList.add('is-start');
        outer.classList.remove('is-end');
        /* Skip arrow + fade work on touch — arrows are hidden via
           `@media (hover: none)` and fades aren't shown on touch. */
        if (isTouch) return;
        [prevBtn, arrowPrev, nextBtn, arrowNext].forEach(function(b) {
          if (!b) return;
          b.classList.add('is-disabled');
          if ('disabled' in b) b.disabled = true;
        });
        if (fadeL) fadeL.style.opacity = '0';
        if (fadeR) fadeR.style.opacity = '0';
        return;
      }
      var s = atStart(),
        e = atEnd();
      outer.classList.toggle('is-start', s);
      outer.classList.toggle('is-end', e);
      if (isTouch) return;
      [prevBtn, arrowPrev].forEach(function(b) {
        if (!b) return;
        b.classList.toggle('is-disabled', s);
        if ('disabled' in b) b.disabled = s;
      });
      [nextBtn, arrowNext].forEach(function(b) {
        if (!b) return;
        b.classList.toggle('is-disabled', e);
        if ('disabled' in b) b.disabled = e;
      });
      if (fadeL) fadeL.style.opacity = s ? '0' : '1';
      if (fadeR) fadeR.style.opacity = e ? '0' : '1';
    }

    function tween(target, dur) {
      var x = clampX(target);
      if (isTouch) {
        /* Native scroll path — browser handles smooth scrolling. */
        try {
          outer.scrollTo({ left: -x, behavior: 'smooth' });
        } catch (_) {
          outer.scrollLeft = -x;
        }
        /* Schedule a state update after the browser smooth-scroll
           settles. Native scroll events also keep state fresh
           continuously (see scroll listener below). */
        setTimeout(updateState, (dur != null ? dur : 0.6) * 1000 + 60);
        return;
      }
      gsap.to(track, {
        x: x,
        duration: dur != null ? dur : 0.6,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: updateState,
        onComplete: updateState,
      });
    }

    function goToIndex(idx, dur) {
      current = Math.max(0, Math.min(items().length - 1, idx));
      tween(offsetForIndex(current), dur);
    }

    function step(dir) {
      if (snap === 'free') {
        tween(getX() - dir * outer.clientWidth * 0.7);
      } else if (snap === 'page' && !isCentered()) {
        /* Page-step on desktop. In centerMode we step ONE card so each             click moves the next card to the centered position. */
        goToIndex(current + dir * pageStep());
      } else {
        goToIndex(current + dir);
      }
    }
    applyCardWidth();
    setX(0);
    updateState();
    /* Touch devices: native overflow scroll handles swipe + inertia +
       bounce; ZERO JS during the swipe (no drag handler, no wheel
       listener, no per-frame scroll work). Resize refreshes card
       widths. Lightweight autoplay path runs ON TOP — driven by a
       single setInterval calling outer.scrollTo (browser-compositor
       thread, not main-thread JS during the actual scroll), gated by
       IntersectionObserver so it only ticks when the rail is on
       screen, and paused for 8s after every user touch so it never
       fights the user's gesture. */
    if (isTouch) {
      var _resizeT;
      window.addEventListener('resize', function () {
        clearTimeout(_resizeT);
        _resizeT = setTimeout(applyCardWidth, 200);
      });
      var _reduceMotionT = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (autoplayMs && !_reduceMotionT && 'IntersectionObserver' in window) {
        var _autoTimerT = null;
        var _pauseUntilT = 0;
        var _idxT = 0;
        function _autoTickT() {
          if (Date.now() < _pauseUntilT) return;
          var cs = items();
          if (cs.length <= 1) return;
          /* Recompute index from scroll position — keeps autoplay in
             sync if the user manually swiped to a different card. */
          _idxT = nearestIndex(-outer.scrollLeft);
          var nextIdx = (_idxT + 1) % cs.length;
          _idxT = nextIdx;
          current = nextIdx;
          tween(offsetForIndex(nextIdx), 0.6);
        }
        /* Pause autoplay on any user interaction for 8s — touchstart
           is passive so it never blocks the swipe gesture. */
        var _pauseHandler = function () { _pauseUntilT = Date.now() + 8000; };
        outer.addEventListener('touchstart', _pauseHandler, { passive: true });
        outer.addEventListener('pointerdown', _pauseHandler, { passive: true });
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              if (!_autoTimerT) _autoTimerT = setInterval(_autoTickT, autoplayMs);
            } else if (_autoTimerT) {
              clearInterval(_autoTimerT);
              _autoTimerT = null;
            }
          });
        }, { threshold: 0.25 }).observe(outer);
      }
      return; /* Remaining desktop-only paths (drag, wheel, arrows) skipped. */
    }
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        applyCardWidth();
        if (snap === 'free') {
          setX(clampX(getX()));
        } else {
          current = Math.max(0, Math.min(items().length - 1, current));
          setX(offsetForIndex(current));
        }
        updateState();
      }, 120);
    });
    [prevBtn, arrowPrev].forEach(function(b) {
      if (b) b.addEventListener('click', function() {
        step(-1);
        pauseAuto();
      });
    });
    [nextBtn, arrowNext].forEach(function(b) {
      if (b) b.addEventListener('click', function() {
        step(1);
        pauseAuto();
      });
    }); /* Autoplay */
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoTimer = null,
      hovered = false,
      visible = false,
      resumeAt = 0;

    function autoTick() {
      if (!autoplayMs || hovered || !visible || Date.now() < resumeAt || snap === 'free') return;
      var stepN = (snap === 'page' && !isCentered()) ? pageStep() : 1;
      var last = Math.max(0, items().length - stepN);
      if (current >= last) goToIndex(0, 0.9);
      else goToIndex(current + stepN);
    }

    function startAuto() {
      if (!autoplayMs || reduceMotion) return;
      stopAuto();
      autoTimer = setInterval(autoTick, autoplayMs);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function pauseAuto() {
      resumeAt = Date.now() + 4000;
    }
    if (autoplayMs && !reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          visible = e.isIntersecting;
          if (visible) startAuto();
          else stopAuto();
        });
      }, {
        threshold: 0.15
      }).observe(outer);
    }
    outer.addEventListener('mouseenter', function() {
      hovered = true;
    });
    outer.addEventListener('mouseleave', function() {
      hovered = false;
    }); /* Pointer drag */
    var isDragging = false,
      isLocked = false,
      hasMoved = false;
    var dragStartX = 0,
      dragStartY = 0,
      dragStartVal = 0;
    var lastDragX = 0,
      lastDragT = 0,
      velX = 0,
      curX = 0,
      pointerId = null;
    outer.addEventListener('click', function(e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    function detachWindow() {
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowUp);
    }

    /* rAF-batched transform write — coalesces multiple pointermove
       events into one gsap.set per frame. This is the key fix that
       eliminates carousel stutter on high-refresh touchscreens (120Hz
       touch panels fire pointermove ~100-200 times/sec; without
       batching every event triggered an immediate gsap.set + layout
       read in updateState, which the compositor couldn't keep up
       with). Drag is desktop-by-design, but rAF batching makes the
       desktop drag path butter-smooth at every viewport width and
       input type (mouse, DevTools touch emulation, real touch). */
    var rafPending = false;
    function flushDragPos() {
      rafPending = false;
      gsap.set(track, { x: curX });
      updateState();
    }
    function onWindowMove(e) {
      if (!isDragging || e.pointerId !== pointerId) return;
      var dx = e.clientX - dragStartX,
        dy = e.clientY - dragStartY;
      if (!isLocked && e.pointerType === 'touch') {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          isDragging = false;
          detachWindow();
          startAuto();
          return;
        }
        if (Math.abs(dx) > 8) {
          isLocked = true;
          outer.classList.add('is-dragging');
        } else return;
      } else if (!isLocked) {
        /* Desktop mouse: require the same 8px horizontal threshold as
           touch before we lock into drag mode. Without this, any tiny
           mouse jitter between pointerdown and pointerup adds the
           `.is-dragging` class → styles.css `.rail-outer.is-dragging *
           { pointer-events: none }` blocks the descendant that mouseup
           fires on → click event lands on the wrong target (or misses
           the [data-fancybox] delegate entirely). Was dropping the
           FIRST click on Work cards intermittently. */
        if (Math.abs(dx) > 8) {
          isLocked = true;
          outer.classList.add('is-dragging');
        } else return;
      }
      var now = Date.now(),
        dt = Math.max(now - lastDragT, 1);
      velX = (e.clientX - lastDragX) / dt;
      lastDragX = e.clientX;
      lastDragT = now;
      if (Math.abs(dx) > clickSlopPx) hasMoved = true;
      curX = clampX(dragStartVal + dx);
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(flushDragPos);
      }
    }

    function onWindowUp(e) {
      if (e.pointerId !== pointerId) return;
      detachWindow();
      endDrag();
    }

    outer.addEventListener('pointerdown', function(e) {
      if (isTouch) return; /* native scroll handles touch — no JS drag */
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (snap === 'free' && !overflowing()) return;
      if (e.target.closest(arrowExcludeSelector)) return;
      gsap.killTweensOf(track);
      stopAuto();
      isDragging = true;
      isLocked = false;
      hasMoved = false;
      dragStartX = lastDragX = e.clientX;
      dragStartY = e.clientY;
      curX = dragStartVal = getX();
      lastDragT = Date.now();
      velX = 0;
      pointerId = e.pointerId;
      window.addEventListener('pointermove', onWindowMove, {
        passive: true
      });
      window.addEventListener('pointerup', onWindowUp);
      window.addEventListener('pointercancel', onWindowUp);
    });

    function endDrag() {
      if (!isDragging) {
        startAuto();
        return;
      }
      isDragging = false;
      outer.classList.remove('is-dragging');
      if (!isLocked) {
        startAuto();
        return;
      }
      isLocked = false;
      var momentum = velX * 380;
      var projected = clampX(curX + momentum);
      setTimeout(function() {
        hasMoved = false;
      }, 0);
      if (snap === 'free') {
        tween(projected, 0.7);
      } else if (snap === 'page' && !isCentered()) {
        /* Desktop: drag releases to nearest page boundary. */
        var n = pageStep();
        var perPage = offsetForIndex(n) - offsetForIndex(0);
        var pageIdx = perPage ? Math.round(projected / perPage) * n : 0;
        current = Math.max(0, Math.min(items().length - 1, pageIdx));
        tween(offsetForIndex(current), 0.7);
      } else {
        /* Card snap (also used by centerMode regardless of snap mode):             drag releases to nearest single card. */
        current = nearestIndex(projected);
        tween(offsetForIndex(current), 0.7);
      }
      pauseAuto();
      startAuto();
    }
    outer.addEventListener('touchmove', function(e) {
      if (isLocked) {
        try { e.preventDefault(); } catch (_) {}
      }
    }, { passive: false });
    outer.addEventListener('dragstart', function(e) {
      e.preventDefault();
    });
  }

  window.initCarousel = initCarousel;
})();
