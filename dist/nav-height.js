/* Ghar.tv nav-height.js
   Measures the site's fixed nav bars and publishes their heights to CSS
   as --mainnav-h and --subnav-h. Loaded synchronously (no defer / async)
   so both CSS variables are set before first paint, preventing the
   layout jump that would happen if we ran deferred behind main.min.js.

   Extracted 2026-09-15 from a 15–21 line inline block that was inlined
   in 36 root pages across 4 near-identical variants. The variants
   differed only in whether they also measured .subnav; this file
   measures both and no-ops on --subnav-h if .subnav is absent, so
   every previous behaviour is preserved. */
(function(){
  var mainNav = document.querySelector('#mainNav');
  var subnav  = document.querySelector('.subnav');
  if (!mainNav) return;
  function syncH(){
    var mh = mainNav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--mainnav-h', mh + 'px');
    if (subnav){
      var sh = subnav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--subnav-h', sh + 'px');
    }
  }
  syncH();
  window.addEventListener('resize', syncH, { passive: true });
  if (document.readyState !== 'complete'){
    window.addEventListener('load', syncH, { once: true });
  }
})();
