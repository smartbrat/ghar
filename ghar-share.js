/* ghar-share.js — the portal's share sheet.
 * ---------------------------------------------------------------------------
 * Drop-in: add this script and give any element `data-share`. Nothing else.
 * The sheet's markup is injected by this file, so a page never carries a copy.
 *
 *   <script src="/ghar-share.js" defer></script>
 *   <button data-share>Share</button>
 *
 * WHY THIS FILE EXISTS. The same share sheet had been pasted inline into 27
 * files (every brand profile, every person profile, five _dev templates), each
 * with a comment saying it was "Ported from brand-profile-avirahi.html". The
 * markup, the CSS and ~120 lines of behaviour were duplicated in every one.
 * Adding /voices/{slug} as a consumer would have made it 28. Behaviour lives
 * here, the .bsm-* CSS lives in styles.css, and both are now edited once.
 *
 * COEXISTS WITH THE OLD INLINE COPIES. If a page already has #brShareModal in
 * its HTML, this file does nothing at all: it does not inject, does not bind,
 * and leaves window.brShareOpen alone. So it is safe to add site-wide before
 * those 27 pages are stripped, and each can be migrated on its own.
 *
 * WHAT THE TRIGGER CAN SAY. All optional; each falls back to page metadata:
 *   data-share-title  the thing being shared   (else og:title, else <title>)
 *   data-share-image  the preview image        (else og:image; hidden if none)
 *   data-share-url    what to share            (else location, minus its hash)
 *   data-share-label  heading on the sheet     (else "Share this page")
 *   data-share-variant "story" for a type-led article preview with no avatar
 *   data-share-eyebrow series/format line, story variant only
 *
 * Either of the text fields can instead name a SELECTOR on the page, which is
 * what a one-file template serving many articles needs:
 *   data-share-title-from=".art-title"  data-share-eyebrow-from=".art-eyebrow"
 *
 * The share targets are plain links to each network's public share endpoint,
 * so nothing here loads third-party script and no SDK sees the reader. The one
 * external call is the QR image, and only once the reader opens that panel.
 */
(function () {
  'use strict';

  // A page with the old inline sheet wins. See COEXISTS above.
  if (document.getElementById('brShareModal')) return;

  var SVG = {
    close: '<svg viewBox="0 0 24 24" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.13 1.6 5.93L0 24l6.34-1.66a11.88 11.88 0 0 0 5.7 1.45h.01c6.55 0 11.88-5.32 11.88-11.87a11.8 11.8 0 0 0-3.41-8.44zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.67-.24-.38a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.43-9.88 9.9-9.88 2.64 0 5.13 1.03 6.99 2.89a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.87 9.88zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.19-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.65 22.65 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.361H7.332v3.209h2.753v8.196h3.312z"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.5 18v-8h-2.5v8h2.5zm-1.25-9.1a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9zM18 18v-4.4c0-2.34-1.26-3.4-2.94-3.4-1.36 0-1.96.74-2.31 1.26v-1.06H10.25c.03.72 0 8 0 8h2.5v-4.47c0-.22.02-.44.08-.6.18-.44.58-.9 1.26-.9.89 0 1.24.67 1.24 1.66V18H18z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>',
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M14 20h3M20 14v7M17 17h4"/></svg>',
    native: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>'
  };

  function tile(id, cls, label, icon, isLink) {
    return isLink
      ? '<a class="bsm-tile bsm-tile--' + cls + '" href="#" id="' + id + '" target="_blank" rel="noopener noreferrer" aria-label="Share on ' + label + '">' +
        '<span class="bsm-tile__icon">' + icon + '</span><span class="bsm-tile__label">' + label + '</span></a>'
      : '<button type="button" id="' + id + '" class="bsm-tile bsm-tile--' + cls + '">' +
        '<span class="bsm-tile__icon">' + icon + '</span><span class="bsm-tile__label" id="gsCopyLabel">' + label + '</span></button>';
  }

  var host = document.createElement('div');
  host.innerHTML =
    '<div id="gsShareOverlay" class="jm-overlay"></div>' +
    '<div id="gsShareModal" class="jm-modal jm-size-md" role="dialog" aria-modal="true" aria-labelledby="gsShareHeading">' +
      '<button class="jm-close" type="button" id="gsShareCloseBtn" aria-label="Close">' + SVG.close + '</button>' +
      '<div class="jm-body">' +
        '<div class="jm-heading" id="gsShareHeading" style="text-align:center; margin-bottom:16px;">Share this page</div>' +
        '<div class="bsm-preview" id="gsPreview">' +
          // IDENTITY layout: portrait/logo + name. Used by /brands and /people.
          '<span class="bsm-preview__media"><img id="gsPreviewImg" src="" alt="" loading="lazy" decoding="async"></span>' +
          // Both layouts share one .bsm-preview__meta so DOM order decides what
          // renders: name / eyebrow / headline / slug, with the unused pair
          // hidden. Putting the story nodes AFTER .bsm-preview__meta printed
          // the domain above the eyebrow, which read as a stray line.
          '<span class="bsm-preview__meta">' +
            '<span class="bsm-preview__name" id="gsPreviewName"></span>' +
            // STORY layout: eyebrow + headline + domain, no avatar. See the
            // .bsm-preview--story note in styles.css for why an article does
            // not get an identity chip.
            '<span class="bsm-preview__eyebrow" id="gsPreviewEyebrow" hidden></span>' +
            '<span class="bsm-preview__headline" id="gsPreviewHeadline" hidden></span>' +
            '<span class="bsm-preview__slug" id="gsPreviewSlug"></span>' +
          '</span>' +
        '</div>' +
        '<div class="bsm-tiles" role="group" aria-label="Share options">' +
          tile('gsCopyBtn', 'copy', 'Copy link', SVG.copy, false) +
          tile('gsWa', 'wa', 'WhatsApp', SVG.wa, true) +
          tile('gsX', 'x', 'X', SVG.x, true) +
          tile('gsFb', 'fb', 'Facebook', SVG.fb, true) +
          tile('gsLi', 'li', 'LinkedIn', SVG.li, true) +
          '<a class="bsm-tile bsm-tile--mail" href="#" id="gsMail" aria-label="Share by email">' +
            '<span class="bsm-tile__icon">' + SVG.mail + '</span><span class="bsm-tile__label">Email</span></a>' +
        '</div>' +
        '<div class="bsm-qr-toggle__wrap">' +
          '<button type="button" class="bsm-qr-toggle" id="gsQrToggle" aria-controls="gsQrWrap" aria-expanded="false">' +
            SVG.qr + '<span id="gsQrToggleLabel">Show QR code</span></button>' +
        '</div>' +
        '<div class="bsm-qr" id="gsQrWrap" hidden>' +
          '<img id="gsQr" src="" alt="" width="180" height="180" loading="lazy" decoding="async"></div>' +
        '<button type="button" class="jm-btn jm-btn--primary bsm-native" id="gsNativeBtn" hidden>Share via other apps' + SVG.native + '</button>' +
      '</div>' +
    '</div>';

  function boot() {
    while (host.firstChild) document.body.appendChild(host.firstChild);

    var $ = function (id) { return document.getElementById(id); };
    var overlay = $('gsShareOverlay'), modal = $('gsShareModal');
    var previewImg = $('gsPreviewImg'), previewName = $('gsPreviewName'), previewSlug = $('gsPreviewSlug');
    var preview = $('gsPreview'), previewEyebrow = $('gsPreviewEyebrow'), previewHeadline = $('gsPreviewHeadline');
    var copyBtn = $('gsCopyBtn'), copyLbl = $('gsCopyLabel');
    var qrWrap = $('gsQrWrap'), qrImg = $('gsQr'), qrToggle = $('gsQrToggle'), qrToggleLbl = $('gsQrToggleLabel');
    var nativeBtn = $('gsNativeBtn'), heading = $('gsShareHeading');
    var lastFocus = null, shareUrl = '', shareTitle = '';

    function meta(prop) {
      var el = document.querySelector('meta[property="' + prop + '"], meta[name="' + prop + '"]');
      return el ? el.getAttribute('content') : '';
    }

    window.gharShareOpen = function (opts) {
      opts = opts || {};
      shareUrl = opts.url || location.href.split('#')[0];
      shareTitle = opts.title || meta('og:title') || document.title;

      var enc = encodeURIComponent(shareUrl);
      var text = shareTitle;
      var both = encodeURIComponent(text + ': ' + shareUrl);

      heading.textContent = opts.label || 'Share this page';

      var story = opts.variant === 'story';
      preview.classList.toggle('bsm-preview--story', story);
      // Each layout hides the other's nodes outright rather than relying on
      // CSS, so a variant switch can never leave a stray avatar behind.
      [previewEyebrow, previewHeadline].forEach(function (el) {
        if (story) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
      });
      [previewName, previewImg.parentNode].forEach(function (el) {
        if (story) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
      });

      if (story) {
        previewEyebrow.textContent = opts.eyebrow || '';
        if (!opts.eyebrow) previewEyebrow.setAttribute('hidden', '');
        previewHeadline.textContent = shareTitle;
        // Domain only: the headline already said what the page is.
        previewSlug.textContent = shareUrl.replace(/^https?:\/\//, '').split('/')[0];
      } else {
        previewName.textContent = shareTitle;
        previewSlug.textContent = shareUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }

      // No image is a real state, not a broken one: hide the frame rather than
      // render an empty circle. See feedback_dynamic_content_flex.
      //
      // AND HIDE IT IF THE IMAGE FAILS TO LOAD. og:image is an absolute URL on
      // www.ghar.tv, so on localhost it 404s and the circle rendered the alt
      // text instead: a ring of clipped words where a portrait should be. The
      // same thing would happen in production the day an og:image goes missing,
      // so this is a real fallback, not a dev-only convenience.
      var img = story ? '' : (opts.image || meta('og:image') || '');
      if (img) {
        previewImg.parentNode.removeAttribute('hidden');
        previewImg.alt = shareTitle;
        previewImg.onerror = function () {
          this.onerror = null;
          this.removeAttribute('src');
          this.parentNode.setAttribute('hidden', '');
        };
        previewImg.src = img;
      } else {
        previewImg.onerror = null;
        previewImg.removeAttribute('src');
        previewImg.parentNode.setAttribute('hidden', '');
      }

      $('gsWa').href = 'https://wa.me/?text=' + both;
      $('gsX').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + enc;
      $('gsLi').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc;
      $('gsFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + enc;
      $('gsMail').href = 'mailto:?subject=' + encodeURIComponent(shareTitle) + '&body=' + both;

      // NO QR ON A STORY. A QR code answers "get this onto another device in
      // the room": someone at a stand or an event holding out a phone. That is
      // a real action for /brands/{slug} and /people/{slug}, which is where it
      // shipped. A reader already inside an article is on the device they are
      // reading on, so it buys a row of chrome for an action almost nobody
      // takes, and the image is fetched from a third party, which hands the
      // article URL to an outside service. Off here, kept for profiles.
      if (story) {
        qrToggle.parentNode.setAttribute('hidden', '');
      } else {
        qrToggle.parentNode.removeAttribute('hidden');
      }
      qrImg.dataset.src = 'https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=' + enc;
      qrImg.alt = 'QR code for ' + shareTitle;
      qrWrap.setAttribute('hidden', '');
      qrToggle.setAttribute('aria-expanded', 'false');
      qrToggleLbl.textContent = 'Show QR code';

      if ('share' in navigator) nativeBtn.removeAttribute('hidden');
      else nativeBtn.setAttribute('hidden', '');

      lastFocus = document.activeElement;
      overlay.classList.add('jm-open');
      modal.classList.add('jm-open');
      $('gsShareCloseBtn').focus();
    };

    window.gharShareClose = function () {
      overlay.classList.remove('jm-open');
      modal.classList.remove('jm-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    function flash(msg) {
      copyBtn.setAttribute('data-copied', '');
      copyLbl.textContent = msg;
      setTimeout(function () {
        copyBtn.removeAttribute('data-copied');
        copyLbl.textContent = 'Copy link';
      }, 1600);
    }

    function legacyCopy() {
      var t = document.createElement('textarea');
      t.value = shareUrl;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.top = '-1000px';
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
      flash(ok ? 'Copied' : 'Press Ctrl+C');
    }

    copyBtn.addEventListener('click', function () {
      if (!shareUrl) return;
      // clipboard API needs a secure context; file:// and plain http fall back.
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl).then(function () { flash('Copied'); }).catch(legacyCopy);
      } else {
        legacyCopy();
      }
    });

    qrToggle.addEventListener('click', function () {
      var hidden = qrWrap.hasAttribute('hidden');
      if (hidden) {
        if (!qrImg.getAttribute('src') && qrImg.dataset.src) qrImg.src = qrImg.dataset.src;
        qrWrap.removeAttribute('hidden');
        qrToggle.setAttribute('aria-expanded', 'true');
        qrToggleLbl.textContent = 'Hide QR code';
      } else {
        qrWrap.setAttribute('hidden', '');
        qrToggle.setAttribute('aria-expanded', 'false');
        qrToggleLbl.textContent = 'Show QR code';
      }
    });

    nativeBtn.addEventListener('click', function () {
      if (!('share' in navigator)) return;
      navigator.share({ title: shareTitle, text: shareTitle, url: shareUrl }).catch(function () {});
    });

    $('gsShareCloseBtn').addEventListener('click', window.gharShareClose);
    overlay.addEventListener('click', window.gharShareClose);

    document.addEventListener('click', function (e) {
      var trig = e.target.closest ? e.target.closest('[data-share]') : null;
      if (!trig) return;
      e.preventDefault();
      // A trigger can name a SELECTOR instead of repeating the copy, so a
      // template that serves many articles from one file does not have to
      // write the headline into an attribute it cannot know at build time.
      function fromSel(attr) {
        var sel = trig.getAttribute(attr);
        if (!sel) return '';
        var el = document.querySelector(sel);
        return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
      }
      window.gharShareOpen({
        url: trig.getAttribute('data-share-url') || '',
        title: trig.getAttribute('data-share-title') || fromSel('data-share-title-from'),
        image: trig.getAttribute('data-share-image') || '',
        label: trig.getAttribute('data-share-label') || '',
        variant: trig.getAttribute('data-share-variant') || '',
        eyebrow: trig.getAttribute('data-share-eyebrow') || fromSel('data-share-eyebrow-from')
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !modal.classList.contains('jm-open')) return;
      window.gharShareClose();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
