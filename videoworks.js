/* ════════════════════════════════════════════════════════════════════════════
   VideoWorks — Cinematic Landing
   ────────────────────────────────────────────────────────────────────────────
   Motion stack: GSAP core + ScrollTrigger (already loaded site-wide).
   Hand-rolled char splitter — no SplitText dependency.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.warn('[VideoWorks] GSAP not loaded — falling back to static reveal.');
    document.querySelectorAll('.vw-hero__lead, .vw-hero__cta').forEach(el => {
      el.style.opacity = '1';
    });
    document.querySelectorAll('.vw-char__inner').forEach(el => {
      el.style.transform = 'none';
    });
    return;
  }

  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Char split for the headline ─────────────────────────────────────── */
  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(ch => {
      const outer = document.createElement('span');
      outer.className = 'vw-char';
      const inner = document.createElement('span');
      inner.className = 'vw-char__inner';
      inner.textContent = ch === ' ' ? ' ' : ch;
      outer.appendChild(inner);
      el.appendChild(outer);
    });
  });

  /* ── 2. Custom cursor ───────────────────────────────────────────────────── */
  const cursor = document.querySelector('[data-cursor]');
  if (cursor && isFinePointer && !prefersReduced) {
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    window.addEventListener('mousemove', (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    }, { passive: true });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ── 3. Magnetic buttons + cursor expand on hover ───────────────────────── */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const strength = parseFloat(el.dataset.magneticStrength) || 0.32;
      const x = gsap.quickTo(el, 'x', { duration: 0.65, ease: 'expo.out' });
      const y = gsap.quickTo(el, 'y', { duration: 0.65, ease: 'expo.out' });

      el.addEventListener('mouseenter', () => {
        cursor && cursor.classList.add('is-magnetic');
      });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * strength;
        const dy = (e.clientY - r.top - r.height / 2) * strength;
        x(dx); y(dy);
      });
      el.addEventListener('mouseleave', () => {
        x(0); y(0);
        cursor && cursor.classList.remove('is-magnetic');
      });
    });
  }

  /* ── 4. Reveal timeline (page load) ─────────────────────────────────────── */
  const startReveal = () => {
    if (prefersReduced) {
      gsap.set('.vw-char__inner', { y: 0 });
      gsap.set('.vw-hero__lead, .vw-hero__cta', { opacity: 1 });
      return;
    }

    gsap.set('.vw-hero__lead, .vw-hero__cta', { y: 18 });

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.from('.vw-nav', {
        y: -18,
        opacity: 0,
        duration: 0.9,
        delay: 0.15
      })
      .from('.vw-frame__corner', {
        opacity: 0,
        scale: 0.7,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power2.out'
      }, '-=0.7')
      .from('.vw-hero__meta', {
        y: 14,
        opacity: 0,
        duration: 0.8
      }, '-=0.55')
      .to('.vw-char__inner', {
        y: 0,
        duration: 1.2,
        stagger: 0.045,
        ease: 'expo.out'
      }, '-=0.45')
      .to('.vw-hero__lead', {
        opacity: 1,
        y: 0,
        duration: 1.0
      }, '-=0.7')
      .to('.vw-hero__cta', {
        opacity: 1,
        y: 0,
        duration: 0.85
      }, '-=0.65')
      .from('.vw-hero__foot > div', {
        y: 12,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08
      }, '-=0.5');
  };

  if (document.readyState === 'complete') {
    startReveal();
  } else {
    window.addEventListener('load', startReveal, { once: true });
  }

  /* ── 5. Subtle parallax on video as cursor moves ────────────────────────── */
  if (isFinePointer && !prefersReduced) {
    const video = document.querySelector('.vw-hero__video');
    if (video) {
      const vx = gsap.quickTo(video, 'x', { duration: 1.8, ease: 'expo.out' });
      const vy = gsap.quickTo(video, 'y', { duration: 1.8, ease: 'expo.out' });
      const hero = document.querySelector('.vw-hero');
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left - r.width / 2) / r.width;
        const cy = (e.clientY - r.top - r.height / 2) / r.height;
        vx(cx * -28);
        vy(cy * -18);
      }, { passive: true });
    }
  }
})();
