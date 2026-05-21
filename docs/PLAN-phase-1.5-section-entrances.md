# PLAN — Phase 1.5: Section Entrances

> Per-section entrance motion as a small, reusable system. NO ScrollSmoother. Mobile-aware. Composited props only. Holds the perf line we set in the mobile-lag pass.

## Why this matters

The homepage references Apple, Stripe, Linear, Freepik, Squarespace (per CLAUDE.md and `project_index4_purpose`). A few sections already animate on entry (`ecosystem`, `fd-features`, `fd-cta-row`, VideoWorks hero). Most don't. Adding a consistent entrance feel makes the page read as "designed" rather than "static cards stacked vertically" — without spending the lag budget we just clawed back.

## What's deliberately NOT in scope

- **ScrollSmoother** — declined. Would unwind today's mobile perf work, fights `position: sticky` on the nav, conflicts with `content-visibility: auto` we just added, and breaks Ctrl+F. The previous decision to omit it from `index4` was correct.
- **Scrubbing animations** — no scroll-linked progress bars, no parallax layers, no scroll-driven typography reveals. Every animation fires on entry once and stops.
- **Per-element bespoke choreography** — we pick 2–3 reusable patterns and apply them consistently across sections. The pattern *is* the design language. Variety here = portfolio reel.

## The three reusable patterns

### Pattern A — `reveal-rise`

The default. Single element fades up from `translateY(16px)` to `0` while `opacity` interpolates `0 → 1`. Duration 0.9s, `ease`.

```css
.reveal-rise { opacity: 0; transform: translateY(16px); will-change: opacity, transform; }
.reveal-rise.is-in { opacity: 1; transform: none; transition: opacity .9s ease, transform .9s ease; }
```

Apply to:
- Section eyebrow + headline + lead + CTA cluster (treat as one "head" unit)
- Single feature cards (For Brokers SuperPro card, Creator Network profile card, etc.)
- Hero stage in cinematic sections (VideoWorks)

### Pattern B — `reveal-stagger`

A child of `reveal-rise` for grids and rails. Each direct child reveals with a 60–100ms stagger. Total cascade ≤ 1s.

```css
.reveal-stagger > * { opacity: 0; transform: translateY(12px); }
.reveal-stagger.is-in > * { opacity: 1; transform: none; transition: opacity .7s ease, transform .7s ease; }
.reveal-stagger.is-in > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger.is-in > *:nth-child(2) { transition-delay: 80ms; }
.reveal-stagger.is-in > *:nth-child(3) { transition-delay: 160ms; }
.reveal-stagger.is-in > *:nth-child(4) { transition-delay: 240ms; }
/* extend up to :nth-child(8) for the longest grid we have */
```

Apply to:
- Discover city tiles
- Intelligence pills + report cards
- Architecture & Design home-tour rail
- GharTalks episode rail
- GharEvents shape-as-card row
- Services card grid
- Tools utility grid
- Brand Connect 3-pillar row
- Creator Network journey strip (the 4 shape steps)

### Pattern C — `reveal-headline`

For section headlines only. The headline letter-block fades in with a tiny `scale(0.98) → 1` plus opacity. 1.2s, slow ease-out. Reads as "settling in."

```css
.reveal-headline { opacity: 0; transform: scale(0.98); transform-origin: left center; }
.reveal-headline.is-in { opacity: 1; transform: none; transition: opacity 1.2s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1); }
```

Apply to:
- Section `.sec-title` elements only when the section has no other lead/CTA cluster (rare — most sections use Pattern A on the whole head unit instead)
- Use sparingly. If everything has a headline-scale reveal, none of them feel special.

## The trigger mechanism

One IntersectionObserver, one `is-in` class. No GSAP needed for these three patterns. No ScrollTrigger.

```js
// In main.js (or a new section-reveals.js loaded with defer)
(function(){
  if (!('IntersectionObserver' in window)) {
    // No-IO fallback: snap all reveals to is-in immediately.
    document.querySelectorAll('.reveal-rise, .reveal-stagger, .reveal-headline')
      .forEach(el => el.classList.add('is-in'));
    return;
  }

  // Respect prefers-reduced-motion — snap to final state with no transition.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-rise, .reveal-stagger, .reveal-headline')
      .forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target); // once
      }
    }
  }, {
    threshold: 0.15,                        // fire when 15% visible
    rootMargin: '0px 0px -10% 0px'          // start 10% before the bottom of the viewport
  });

  document.querySelectorAll('.reveal-rise, .reveal-stagger, .reveal-headline')
    .forEach(el => io.observe(el));
})();
```

### Mobile gating

If the S25 Ultra still feels heavy after the rest of Phase 1, gate the entrance animations on mobile by adding this CSS:

```css
@media (max-width: 743px) {
  .reveal-rise, .reveal-stagger > *, .reveal-headline {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Decision: ship animations on all viewports initially. If lag returns on mobile, flip the switch in one place.

## Why this is cheap

- One IO instance, one listener for the whole page
- `unobserve` after fire — observer eventually has zero targets
- `opacity` and `transform` are composited — no paint cost
- `will-change: opacity, transform` only on the initial-state classes; the `is-in` state can drop it (the browser auto-promotes during transition anyway)
- No requestAnimationFrame loops
- No GSAP for these — GSAP is loaded already for carousels, but these reveals don't need it

## Where GSAP IS still useful (not part of this pattern)

Keep GSAP for animations that need:
- Spring physics (rare on this site)
- Complex sequencing (the VideoWorks 10-second cinematic intro)
- SVG morphing or path animations (the ecosystem map's radial expansion, if we keep it)
- Carousel transforms with momentum/inertia (already in place)

For straight "section enters viewport → fade up" reveals, IO + CSS transitions are simpler, smaller, and faster.

## Section-by-section application matrix

| Section | Head unit | Body |
|---|---|---|
| `dc-section` Discover | A | B on city grid |
| `intl4` Intelligence | A | B on report grid |
| `ad4` Architecture & Design | A | B on home-tour rail |
| `ed4` Editorial | A | B on article grid |
| `sv4` Services | A | B on service cards |
| `gt4` GharTalks | A | B on episode rail |
| `vc4` Voices | A | A on single hero card |
| `ge4` GharEvents | A | B on 3 shape cards |
| `fb4` For Brokers | A | A on SuperPro card |
| `dm4` For Developers | A | A on radial graphic + project marketing card |
| `vw4` VideoWorks | Keep existing cinematic intro | — |
| `bc4v2` Brand Connect | A | B on 3 pillars |
| `cn4` Creator Network | A | B on journey strip |
| `#people` Community | A | B on rail |
| `#brands` Community | A | B on rail |
| `#tools` Tools | A | B on grid |
| `#ecosystem` Ecosystem map | Keep existing entrance | — |

Hero (`e4-hero`) — already has its own entrance via the `gsap-pending` removal. Don't re-instrument.

## Effort

- CSS + JS scaffolding: 30 min
- Adding `class="reveal-rise"` / `class="reveal-stagger"` to the right elements in 17 sections: 1.5 hours
- Visual QA pass across the page on mobile and desktop: 45 min
- **Total: ~3 hours**

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| ScrollTriggers already in place (`ecosystem`, `fd-features`, `fd-cta-row`) conflict with reveal-rise classes | Audit before adding. Either keep the GSAP version or convert to reveal-rise — don't double-up. |
| `is-in` class collides with existing class names | Prefix to `r-in` if needed. None found today. |
| Stagger CSS uses fixed `nth-child` count, breaks if a grid has > 8 children | Default to no delay past `:nth-child(8)`. Acceptable — eyes don't track stagger past ~6 anyway. |
| Patterns feel "samey" by the end of the page | Pattern A on heads + Pattern B on bodies means viewer sees two motifs alternating with rhythm, not 17 unique animations. This is intentional consistency, not laziness. |

## Acceptance criteria

- [ ] One `IntersectionObserver` is registered (verify with `getEventListeners(document)` in devtools)
- [ ] Every reveal element gets `is-in` once and `unobserve` fires (verify by re-scrolling — no second animation)
- [ ] No `transition` or `animation` uses `filter`, `width`, `height`, `top`, `left`, `margin`, or `padding` in the new CSS
- [ ] On mobile (412×915), scroll the entire page top-to-bottom: no perceptible scroll lag (the test that started all this)
- [ ] `prefers-reduced-motion: reduce` snaps all reveals to final state
- [ ] Visual feel: page reads as "animated and crafted" without feeling busy or precious

## When to do this

After Phase 1 lands. The two are independent, but Phase 1's Tailwind replacement makes the layout stable, which makes IntersectionObserver thresholds reliable. Order: Phase 1 → Phase 1.5 → Phase 2 → Phase 3.
