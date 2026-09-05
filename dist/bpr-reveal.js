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
