// ============================================================
// dist/hv-video.js  (2026-09-03)
//
// Shared YouTube-video click-to-play + smooth-scroll cue + optional
// GSAP scroll-scale parallax for brand-profile tenants.
//
// Companion CSS: .hv-* rules in dist/brand-profile.min.css.
//
// Markup contract (see .hv-* CSS block for the surfaces):
//
//   Hero film block:
//     <div class="hv-block" id="film">
//       <button class="hv-thumb" data-hv-play="{ytId}">
//         <img class="hv-poster-img" src="..." alt="">
//         ... scrim + title + disc + label ...
//       </button>
//       <div class="hv-player" hidden></div>
//     </div>
//
//   Rail card:
//     <div class="bpr-mcard bpr-mcard--video hv-card"
//          data-hv-play="{ytId}" role="button" tabindex="0">
//       <div class="bpr-mcard__media"><img ...><span ...>Film</span></div>
//       <div class="bpr-mcard__body"> ... eyebrow + title ... </div>
//     </div>
//
//   Hero cue pill:
//     <a class="hv-cue" href="#film" data-hv-scroll>
//       ... glyph + label + duration ...
//     </a>
//
// Runs itself on load; no init call needed. GSAP is opt-in: if
// window.gsap + ScrollTrigger are on the page the .hv-block scrubs
// from scale(.72) → 1 as it enters the viewport. Without GSAP the
// block stays at scale(.72) --- so tenants that don't want the
// parallax should set `transform: none` on .hv-block via :root or
// a tenant-scoped override.
// ============================================================
(function () {

  /* Build a plain YouTube iframe with the attribute set that we
     confirmed keeps YouTube's native hover UI functional. */
  function makeIframe (id) {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + id +
      '?autoplay=1&rel=0&iv_load_policy=3';
    iframe.title = 'YouTube video player';
    iframe.setAttribute('allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
      'gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;border:0;display:block;';
    return iframe;
  }

  /* 1. Click-to-play. Handles two surfaces:
     - .hv-block  --- iframe fills the sibling .hv-player slot
     - .hv-card   --- iframe fills .bpr-mcard__media in place */
  document.addEventListener('click', function (e) {
    var trig = e.target.closest('[data-hv-play]');
    if (!trig) return;
    var id = trig.getAttribute('data-hv-play');
    if (!id) return;

    var block = trig.closest('.hv-block');
    if (block) {
      var player = block.querySelector('.hv-player');
      if (!player) return;
      player.appendChild(makeIframe(id));
      player.hidden = false;
      trig.hidden = true;
      return;
    }

    if (trig.classList.contains('hv-card')) {
      var media = trig.querySelector('.bpr-mcard__media');
      if (!media) return;
      media.style.position = 'relative';
      media.innerHTML = '';
      media.appendChild(makeIframe(id));
    }
  });

  /* Keyboard access on .hv-card (it's a <div role="button">). */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var trig = e.target.closest('.hv-card[data-hv-play]');
    if (!trig) return;
    e.preventDefault();
    trig.click();
  });

  /* 2. Hero cue pill --- smooth-scroll to the target then auto-play. */
  document.addEventListener('click', function (e) {
    var cue = e.target.closest('[data-hv-scroll]');
    if (!cue) return;
    var href = cue.getAttribute('href') || '#film';
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var topbar = document.querySelector('.bpr-topbar');
    var offset = (topbar ? topbar.offsetHeight : 64) + 32;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    var play = target.querySelector('[data-hv-play]');
    if (play && !play.hidden) {
      /* Wait for smooth-scroll to settle so autoplay fires as the video
         finishes scaling in, not before. */
      setTimeout(function () { play.click(); }, reduce ? 0 : 700);
    }
  });

  /* 3. GSAP scroll-scale parallax --- opt-in. If GSAP + ScrollTrigger
     are on the page, the .hv-block scrubs from scale(.72) → 1 as it
     enters the viewport. Anchor top so the block grows DOWNWARD.
     Reduced-motion opts out entirely. Mobile starts at .88 (CSS). */
  function initFilmParallax () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return setTimeout(initFilmParallax, 60);
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var block = document.querySelector('.hv-block');
    if (!block) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(block, {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: block,
        start: 'top bottom',
        end: 'top 35%',
        scrub: 0.5,
        invalidateOnRefresh: true
      }
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
  initFilmParallax();

})();
