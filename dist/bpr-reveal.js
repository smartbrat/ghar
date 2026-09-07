// ============================================================
// dist/bpr-reveal.js  (Path B / Phase 1 / Round 2)
//
// Prepended: portal-wide image graceful load. Same block as the one
// in main.js — kept here so brand-profile + person-profile pages
// (which do not load main.js) still get the fade / blur-up behaviour.
// Idempotent; safe if both scripts happen to run on the same page.
// ============================================================
(function gharImgLoad(){
  var root = document.documentElement;
  if (root.classList.contains('js-imgfx-init')) return;
  root.classList.add('js-imgfx-init');
  root.classList.add('js-imgfx');

  function mark(img){
    if (!img || img.classList.contains('no-imgfx')) return;
    if (img.classList.contains('is-loaded')) return;
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
      return;
    }
    var onDone = function(){
      img.classList.add('is-loaded');
      img.removeEventListener('load', onDone);
      img.removeEventListener('error', onDone);
    };
    img.addEventListener('load', onDone);
    img.addEventListener('error', onDone);
  }
  function scan(node){
    if (!node || node.nodeType !== 1) return;
    if (node.tagName === 'IMG') { mark(node); return; }
    if (node.querySelectorAll) node.querySelectorAll('img').forEach(mark);
  }
  scan(document.body || document);
  if ('MutationObserver' in window) {
    new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) scan(added[j]);
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();

// ============================================================
// Original bpr-reveal.js content follows.
//
// Shared scroll-reveal observer for every brand-profile tenant.
// Extracted verbatim from Horizon Architects' inline decorator so
// behaviour matches the byte-canonical version already shipped.
//
// USAGE (in each tenant, right before the closing body tag):
//
//   <script src="/dist/bpr-reveal.js"></script>
//   <script>
//     bprReveal({
//       map: [
//         [".bpr-about__body",    "js-reveal--split-l"],
//         [".bpr-services__grid", "js-cascade--rise"]
//         // ...per-tenant selector list. Each row = [selector, class].
//         // Class prefix picks the group: "js-reveal" targets ONE
//         // element; "js-cascade" targets its > * children with
//         // staggered nth-child transition-delays.
//       ]
//       // Optional overrides (defaults shown):
//       //   threshold : 0.15,
//       //   rootMargin: "0px 0px -60px 0px"
//       // Horizon uses threshold 0 + rootMargin -160px for its
//       // per-child reveal philosophy.
//     });
//   </script>
//
// CSS classes referenced (.js-reveal--*, .js-cascade--*, nth-child
// transition-delays, prefers-reduced-motion opt-out) are defined in
// dist/brand-profile.min.css. If that CSS is not loaded, the JS still
// runs harmlessly: classes get added but nothing paints them.
// ============================================================
(function () {
  if (!('IntersectionObserver' in window)) return;

  window.bprReveal = function (config) {
    if (!config || !config.map || !config.map.length) return;

    var map        = config.map;
    var threshold  = (typeof config.threshold === 'number') ? config.threshold : 0.15;
    var rootMargin = config.rootMargin || '0px 0px -60px 0px';

    // Assign the reveal/cascade group + variant class to every element
    // matching each row's selector. "js-cascade" is a parent-level flip
    // that staggers its > * children; "js-reveal" is a single-target
    // flip on the element itself. Selector misses are silent.
    map.forEach(function (row) {
      var sel = row[0], cls = row[1];
      var group = cls.indexOf('js-cascade') === 0 ? 'js-cascade' : 'js-reveal';
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add(group);
        el.classList.add(cls);
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { threshold: threshold, rootMargin: rootMargin });

    document.querySelectorAll('.js-reveal, .js-cascade').forEach(function (el) {
      io.observe(el);
    });
  };
})();

// ============================================================
// PORTAL MODAL BACK-BUTTON HOOK + MOBILE BODY-SCROLL LOCK
// Same block as the one in main.js — kept here so brand-profile
// pages (which do not load main.min.js) get the same modal
// behaviour. Idempotent; safe if both scripts run on the same page.
// Any change to this block MUST be mirrored in main.js.
// ============================================================
(function ghModalHooks(){
  if (window.__ghModalHooksInit) return;
  window.__ghModalHooksInit = true;

  var CLASS = 'jm-open';
  var SEL = '[role="dialog"]';
  var _muteBack = false;

  function knownCloseFor(id){
    if (id === 'brContactModal' && typeof window.brContactClose === 'function') return window.brContactClose;
    if (id === 'brBriefModal' && typeof window.gharBriefClose === 'function') return window.gharBriefClose;
    if (id === 'joinModal' && typeof window.closeSignIn === 'function') return window.closeSignIn;
    if (id === 'subscribeModal' && typeof window.gharSubscribeClose === 'function') return window.gharSubscribeClose;
    if (id === 'brShareModal' && typeof window.brShareClose === 'function') return window.brShareClose;
    if (id === 'brWorkModal' && typeof window.brWorkClose === 'function') return window.brWorkClose;
    return null;
  }
  function fallbackClose(el){
    el.classList.remove(CLASS);
    var overlayId = (el.id || '').replace(/Modal$/, 'Overlay');
    var overlay = overlayId && document.getElementById(overlayId);
    if (overlay) overlay.classList.remove(CLASS);
    document.body.style.overflow = '';
  }

  function origOnOpen(el){
    try { history.pushState({modal: el.id || 'modal'}, ''); } catch(_) {}
  }
  function origOnClose(el){
    if (_muteBack) return;
    var s = null;
    try { s = history.state; } catch(_) {}
    if (s && s.modal === (el.id || 'modal')) {
      _muteBack = true;
      try { history.back(); } catch(_) {}
      setTimeout(function(){ _muteBack = false; }, 120);
    }
  }

  var _savedScrollY = 0;
  function _isMobile(){ return window.innerWidth < 744; }
  function lockBody(){
    if (!_isMobile()) return;
    if (document.body.dataset.jmLocked === '1') return;
    _savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    var b = document.body;
    b.dataset.jmLocked = '1';
    b.dataset.jmSavedScrollY = String(_savedScrollY);
    b.style.position = 'fixed';
    b.style.top = '-' + _savedScrollY + 'px';
    b.style.left = '0';
    b.style.right = '0';
    b.style.width = '100%';
  }
  function unlockBody(){
    var b = document.body;
    if (b.dataset.jmLocked !== '1') return;
    var y = parseInt(b.dataset.jmSavedScrollY || '0', 10) || 0;
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.width = '';
    delete b.dataset.jmLocked;
    delete b.dataset.jmSavedScrollY;
    window.scrollTo(0, y);
  }
  var FULLSCREEN_MODAL_IDS = ['brContactModal', 'brBriefModal', 'joinModal', 'subscribeModal'];
  function shouldSyncViewport(el){
    if (el.classList.contains('jm-modal')) return true;
    return FULLSCREEN_MODAL_IDS.indexOf(el.id) >= 0;
  }
  function syncModalToVisualViewport(){
    if (!_isMobile()) return;
    var open = document.querySelector(SEL + '.' + CLASS);
    if (!open) return;
    if (!shouldSyncViewport(open)) return;
    var vv = window.visualViewport;
    if (vv) {
      open.style.height = vv.height + 'px';
      open.style.top = vv.offsetTop + 'px';
    }
  }
  function clearModalViewportSize(el){
    if (!el) return;
    el.style.height = '';
    el.style.top = '';
  }

  function onOpen(el){
    origOnOpen(el);
    lockBody();
    syncModalToVisualViewport();
  }
  function onClose(el){
    origOnClose(el);
    clearModalViewportSize(el);
    setTimeout(unlockBody, 60);
  }

  function watchModal(el){
    if (el.__ghmodalWatched) return;
    el.__ghmodalWatched = true;
    var mo = new MutationObserver(function(mutations){
      for (var i = 0; i < mutations.length; i++){
        var m = mutations[i];
        if (m.attributeName !== 'class') continue;
        var wasOpen = ((m.oldValue || '').split(/\s+/).indexOf(CLASS) >= 0);
        var isOpen = el.classList.contains(CLASS);
        if (isOpen && !wasOpen) onOpen(el);
        else if (!isOpen && wasOpen) onClose(el);
      }
    });
    mo.observe(el, {attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  }

  function start(){
    var modals = document.querySelectorAll(SEL);
    for (var i = 0; i < modals.length; i++) watchModal(modals[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.addEventListener('popstate', function(e){
    var open = document.querySelector(SEL + '.' + CLASS);
    if (!open) return;
    _muteBack = true;
    var closer = knownCloseFor(open.id);
    if (closer) { try { closer(); } catch(_) { fallbackClose(open); } }
    else fallbackClose(open);
    setTimeout(function(){ _muteBack = false; }, 120);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncModalToVisualViewport);
    window.visualViewport.addEventListener('scroll', syncModalToVisualViewport);
  }
  window.addEventListener('resize', syncModalToVisualViewport);
})();
