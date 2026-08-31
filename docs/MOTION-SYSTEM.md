# Motion System

> Codifies the per-page-inline observer setups that currently live in every
> brand + person tenant into a shared motion vocabulary + token contract +
> single shared observer. The best-in-class recipe from the recent stretch
> of Horizon Architects animation tuning becomes the shared default.
>
> **Load-bearing rule.** Kill per-page inline motion JS. Every profile page
> gets its motion from `data-motion-profile` at page + section level; the
> shared observer at `window.gharProfileMotion.init()` binds everything.

---

## 1. The four motion profiles

Small vocabulary. Every profile page picks one at page level (via
composition rules); any section can override at section level.

| profile | when to use | primary technique | tokens used |
|---|---|---|---|
| `minimal` | Financial institutions, technical brands, research-heavy person profiles | Opacity fade only, no transform | `--motion-duration-fast`, `--motion-easing-decel` |
| `editorial` | Default for architects, design brands, magazine-style pages | Rise (translateY 20 → 0) per-item, no cascade | `--motion-duration-base`, `--motion-easing-standard`, `--motion-rise-distance` |
| `cinematic` | Developer brands, luxury tenants (Godrej / Scarlet-tier) | Rise + scale, GSAP scrub on key stages | `--motion-duration-slow`, `--motion-easing-emphasized`, `--motion-rise-distance`, `--motion-scale-in-from` |
| `dynamic` | Product brands with a lot of imagery (Materials / Furniture / Lighting) | Print (opacity + skew) on cards, fade on text | `--motion-duration-base`, `--motion-easing-standard`, `--motion-print-skew` |

---

## 2. Motion tokens

```css
:root {
  /* Durations */
  --motion-duration-fast: 0.35s;
  --motion-duration-base: 0.6s;
  --motion-duration-slow: 1.2s;

  /* Easings */
  --motion-easing-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-easing-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-easing-decel: cubic-bezier(0, 0, 0.2, 1);

  /* Transform amounts */
  --motion-rise-distance: 20px;
  --motion-print-skew: 3deg;
  --motion-scale-in-from: 0.94;

  /* Stagger */
  --motion-stagger-fast: 60ms;
  --motion-stagger-base: 100ms;
  --motion-stagger-slow: 160ms;
}
```

Tokens live in `dist/styles.min.css` (or the pre-consolidation source
per-page inline block). Ship once, consumed everywhere.

---

## 3. Per-page + per-section attribute

```html
<!-- Page-level default -->
<main data-motion-profile="editorial">

  <!-- Section inherits page default -->
  <section class="bpr-sec" id="about" data-reveal>…</section>

  <!-- Section overrides -->
  <section class="bpr-sec" id="work" data-motion-profile="cinematic" data-reveal>…</section>

</main>
```

**Attribute inheritance:**

1. Page-level `data-motion-profile` on `<main>` is the default for every child
2. Section-level `data-motion-profile` overrides for that section subtree
3. Element-level `data-reveal-behavior` overrides for a specific element (rare — for the odd element that needs a different motion than its section)

**Composition rule integration:** every category's composition rules
declare a `motion_profile` per section (see
[`COMPOSITION-RULES.md`](COMPOSITION-RULES.md)). The composer emits the
attribute on the section node.

---

## 4. The shared observer

Single implementation. Lives in `main.js` (bundled into `dist/main.min.js`).

```javascript
window.gharProfileMotion = {
  observer: null,

  init() {
    if (this.observer) return; // idempotent

    // The recipe from the Horizon Architects animation tuning:
    //   threshold: 0
    //   rootMargin: '0px 0px -160px 0px' (fires when block is 160px inside viewport)
    //   per-item observation (no cascade groups)
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', '');
        this.observer.unobserve(entry.target);
      }
    }, {
      threshold: 0,
      rootMargin: '0px 0px -160px 0px'
    });

    document.querySelectorAll('[data-reveal]').forEach(el => this.observer.observe(el));
  },

  observeNew(root) {
    // For dynamically-added content — call after inserting new nodes
    if (!this.observer) this.init();
    (root || document).querySelectorAll('[data-reveal]:not([data-revealed])').forEach(el =>
      this.observer.observe(el)
    );
  }
};

// Auto-init on DOMContentLoaded
if (document.readyState !== 'loading') {
  window.gharProfileMotion.init();
} else {
  document.addEventListener('DOMContentLoaded', () => window.gharProfileMotion.init());
}
```

**What this replaces:** every tenant's trailing `<script>` block that
sets up its own IntersectionObserver with slightly different thresholds
+ rootMargins + selectors. The current codebase has ~20 slightly-drifted
copies. This kills all of them.

---

## 5. CSS integration

Each motion profile drives a small set of transitions on `[data-reveal]`
elements. Element hides on-mount (opacity 0 + transform); reveals via
attribute presence.

```css
/* Baseline hidden state — all reveal-eligible elements start here */
[data-reveal] {
  opacity: 0;
  transition-property: opacity, transform;
  transition-timing-function: var(--motion-easing-standard);
}

/* Revealed — attribute presence flips opacity + transform */
[data-reveal][data-revealed] {
  opacity: 1;
  transform: none;
}

/* Motion profile: minimal — fade only, no transform */
[data-motion-profile="minimal"] [data-reveal] {
  transition-duration: var(--motion-duration-fast);
  transition-timing-function: var(--motion-easing-decel);
}

/* Motion profile: editorial — rise + fade */
[data-motion-profile="editorial"] [data-reveal] {
  transform: translateY(var(--motion-rise-distance));
  transition-duration: var(--motion-duration-base);
}

/* Motion profile: cinematic — rise + scale + fade, longer duration */
[data-motion-profile="cinematic"] [data-reveal] {
  transform: translateY(var(--motion-rise-distance)) scale(var(--motion-scale-in-from));
  transition-duration: var(--motion-duration-slow);
  transition-timing-function: var(--motion-easing-emphasized);
}

/* Motion profile: dynamic — print (fade + skew), medium duration */
[data-motion-profile="dynamic"] [data-reveal] {
  transform: skewY(var(--motion-print-skew));
  transition-duration: var(--motion-duration-base);
}

/* Reduced motion — every profile respects the preference */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## 6. Which elements get `[data-reveal]`

The composer applies `[data-reveal]` based on the section's variant
config. Not everything animates.

**Default per-section reveal targets:**

| section | reveal elements |
|---|---|
| hero | `.bpr-hero__eyebrow`, `.bpr-hero__name`, `.bpr-hero__tagline`, `.bpr-hero__meta-row` (staggered), `.bpr-hero__socials`, `.bpr-badge` (via `bprBadgePop` keyframe, separate from the observer) |
| about | Every direct child `<p>` inside `.bpr-about__body`. Per-paragraph reveal — NOT the container. This is the fix from the recent Horizon tuning. |
| work — spotlight | `.bpr-featured__inner` |
| work — grid | Each `.bpr-work-card` (staggered) |
| work — carousel | Each `.bpr-work-rail__item` (staggered) |
| recognition | `.bpr-recog-list li` (staggered) |
| team | Each `.bpr-people-card` (staggered) |
| timeline | Each `.bpr-timeline__event` (staggered) |
| presence | `.bpr-presence__inner` |
| spotlight | Each spotlight card as a group — `.js-reveal--fade` for horizontal-rail sections (avoids the "jumpy" bug from carousel transform + reveal transform stacking) |
| intelligence | `.bpr-intel-grid` (single group, then per-card via CSS `nth-child` stagger) |
| voices | `.pp-voices-grid` (single group) |
| products | Each `.bpr-product-card` (staggered) |
| clients | `.bpr-clients__logos` (single group) |
| contact | `.bpr-contact__inner` |
| closer | `.pp-closer` |

Person profile equivalents follow the same shape with `.pp-*` classes.

---

## 7. Stagger

Achieved via CSS animation-delay based on nth-child, not via JS stagger.

```css
/* Grid stagger example */
[data-motion-profile="editorial"] .bpr-work-grid [data-reveal] {
  transition-delay: calc(var(--motion-stagger-base) * (var(--stagger-index, 0)));
}
```

Composer emits `style="--stagger-index: 0"`, `--stagger-index: 1`, etc.
on each grid item.

For carousels the composer emits `--stagger-index: 0` on every item to
avoid staggered reveals inside horizontal scroll rails (which read as
"jumpy" per the recent tuning).

---

## 8. Hero-specific motion — outside the shared observer

Some hero moments need bespoke animation that the shared observer can't
express. These stay as keyframes in the shared motion CSS.

**`bprBadgePop`** — the badge that pops in on hero mount (Horizon/Teearch):

```css
@keyframes bprBadgePop {
  0% { transform: scale(0.55); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.bpr-hero .bpr-badge {
  animation: bprBadgePop var(--motion-duration-base) var(--motion-easing-emphasized) 0.14s both;
}
```

**`bprHeroLogoPop`** — the in-flow logo pop on mobile Pattern-B tenants:

```css
@keyframes bprHeroLogoPop {
  0% { transform: translateY(-8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.bpr-hero--split .bpr-hero__logo {
  animation: bprHeroLogoPop var(--motion-duration-base) var(--motion-easing-emphasized) 0.05s both;
}
```

These are mount-only, not scroll-triggered. The shared observer doesn't
touch them.

---

## 9. GSAP scrub — for `cinematic` profile only

Sections marked `data-motion-profile="cinematic"` with the additional
`data-scrub` attribute get a scroll-linked GSAP animation.

```html
<section class="bpr-sec" data-motion-profile="cinematic" data-scrub>
  <div class="bpr-film__stage">…</div>
</section>
```

```javascript
// In main.js, gated on GSAP availability
if (window.gsap && window.ScrollTrigger) {
  document.querySelectorAll('[data-scrub]').forEach(el => {
    const stage = el.querySelector('.bpr-film__stage');
    if (!stage) return;

    gsap.fromTo(stage,
      { scale: window.innerWidth < 744 ? 0.88 : 0.72 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'center center',
          scrub: 0.5
        }
      }
    );
  });
}
```

GSAP is a heavier dependency (~40kb gzipped). Only tenants on
`cinematic` profile load it — enforced via composition rule:
`motion_profile = 'cinematic'` → composer injects the GSAP `<script>`
tag in the page's `<head>`.

---

## 10. Motion checklist for the composer

When emitting a profile page:

1. Read `motion_profile` from composition rules (per category) OR from `profile_section_configs.motion_profile` (per tenant override).
2. Set `data-motion-profile` attribute on `<main>`.
3. For each section, if it has its own `motion_profile` in its config, set `data-motion-profile` on the section.
4. For each section variant, look up the reveal-targets map (§6) and mark those elements with `data-reveal`.
5. For grid + list variants, emit `--stagger-index` on each item.
6. For hero, always emit `[data-reveal]` on the standard hero subelements.
7. For carousel sections, emit `.js-reveal--fade` group class (single fade, no stagger, no transform-stacking).
8. If any section is `cinematic` with `data-scrub`, ensure GSAP is loaded in `<head>`.

---

## 11. Testing motion

Manual QA:

- Every profile at every breakpoint: 390 / 768 / 1024 / 1440 / 1920.
- Every profile with `prefers-reduced-motion: reduce`: no motion visible.
- Every profile: scroll through the page, verify no "jumpy" or "premature" reveals.
- Carousel sections: verify reveal fires on the WHOLE rail, not per-card.
- Hero: badge + logo pop within 500ms of page load.

Automated regression (Playwright):

```javascript
test('every hero-first paragraph fires reveal in-viewport, not before', async ({ page }) => {
  await page.goto('/brands/horizon-architects');
  const firstAbout = page.locator('.bpr-about__body p').first();
  await firstAbout.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // motion duration
  const opacity = await firstAbout.evaluate(el => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeCloseTo(1, 1);
});
```

---

## 12. Migration from current per-page setup

Current state: every brand + person tenant has a trailing `<script>`
block with its own IntersectionObserver setup. Some 20 files.

**Migration steps:**

1. Ship `window.gharProfileMotion` in `main.js` (rebuild `dist/main.min.js`).
2. Ship the CSS from §5 in the shared `dist/brand-profile.min.css` + `dist/person-profile.min.css` (once the CSS consolidation lands).
3. In each tenant HTML, remove the per-page IntersectionObserver block. Add `data-motion-profile="editorial"` (or per composition rule) to `<main>`. Add `data-reveal` to reveal targets.
4. Regression per tenant.

Do NOT ship this migration until CSS consolidation (Phase 1 of
[BRAND-ENGINE-ARCHITECTURE.md §12](BRAND-ENGINE-ARCHITECTURE.md#12-migration-strategy--preserve-approved-visuals))
is done — otherwise the shared CSS won't be available and every page
will render without motion.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json),
[`COMPOSITION-RULES.md`](COMPOSITION-RULES.md).
