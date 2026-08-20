# Brand Service Template · SVG Animation Generation Spec

**Audience:** backend / generation programmer building the pipeline that produces per-tenant SVG graphics for the Brand Service Template.

**Purpose:** define the rules, targets, output format, and integration points a generated SVG (hero graphic + About-section graphic) must satisfy before it is written to a tenant record and served live on `brand-profile-*.html`.

**Status:** authoritative. Any generation service (LLM prompt template, procedural pipeline, human-in-the-loop tool) must produce output that passes every rule below. Deviations require sign-off.

**Reference implementation:** [`brand-profile-teearch.html`](../brand-profile-teearch.html) — the first live tenant on this chassis. Use it as the concrete example of where the graphic sits, how it is themed via `--brand`, and what "restrained, considered" looks like at production quality.

---

## 0. What we are generating, and what stays constant

We generate **two** SVG graphics per tenant:

1. **Hero graphic** (right column of the hero section)
2. **About-section graphic** (right column of the About section)

We do NOT regenerate:

- The template chassis (nav, hero layout, About layout, Offerings, Team, Certifications, Intelligence carousel, footer). This is the shared `brand-profile.html` template with per-tenant CSS variables.
- The brand name, tagline, copy, or images. Those come from the tenant record.
- The `--brand`, `--brand-soft`, `--brand-ink` colour variables. Those are derived once from the brand's primary hex and applied uniformly.

**Consistency comes from the chassis. Variation comes from the two SVG graphics.** Never redesign the chassis per brand.

---

## 1. Animation Implementation Hierarchy

Use the simplest reliable method.

### Option 1: CSS animation (preferred)

Prefer CSS when the animation only requires:
- Opacity
- Transform
- Stroke drawing (`stroke-dashoffset`)
- Stroke-dash movement (marching ants)
- Simple gradient shifts
- Repeating ambient motion

CSS-only SVG animation is appropriate for simpler animation. More complex or interactive behaviour may require JavaScript.

### Option 2: Native SVG animation (SMIL)

May be used for suitable self-contained animations where browser support is acceptable.

### Option 3: Lightweight vanilla JavaScript

Use vanilla JavaScript only when required for:
- Scroll-triggered playback
- Intersection Observer
- Mouse or pointer interaction
- Programmatic control
- Playback management
- Dynamic colour inputs
- Multiple coordinated states

**Do not use GSAP, Three.js or any other animation library unless specifically requested.**

---

## 2. Performance Requirements

The animated SVG will appear on real production pages. Performance is mandatory.

### Size targets

| Asset | Preferred | Acceptable maximum |
|---|---|---|
| Hero graphic (elaborate) | under 150 KB | 250 KB |
| About-section graphic | under 100 KB | 150 KB |

### Frame-rate targets

- 60 fps on modern desktop
- Smooth and stable on mid-range mobile devices

### Rules

- Minimise the number of paths.
- Simplify path points.
- Reuse elements through `<symbol>` and `<use>` where useful.
- Animate transforms and opacity where possible.
- Avoid animating expensive blur filters continuously.
- Avoid animating large masks every frame.
- Avoid excessive drop shadows.
- Avoid hundreds of independently animated particles.
- Do not animate layout-affecting dimensions repeatedly.
- Pause off-screen animations using Intersection Observer.
- Avoid continuous JavaScript loops when CSS is sufficient.
- Avoid unnecessary DOM nodes.
- Use `will-change` sparingly.
- Test at mobile dimensions.

---

## 3. Accessibility Requirements

Respect users who prefer reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none !important;
    transition: none !important;
  }
}
```

When reduced motion is active:
- Show the final composed state.
- Do not hide the graphic.
- Remove all looping motion.
- Preserve full visual meaning.

Also:
- Include `<title>` and `<desc>` on the SVG.
- Add `role="img"` where meaningful.
- Use `aria-hidden="true"` only when the graphic is purely decorative.
- Do not communicate critical information through animation alone.
- Maintain sufficient contrast.

---

## 4. Integration Requirements

Output must work as **inline SVG** inside the Ghar.tv template. Inline is preferred because it allows direct styling, responsive changes and animation control.

For every generation, provide all of the following:

1. Desktop SVG
2. Mobile SVG (or a clearly defined mobile composition)
3. CSS animation
4. Optional lightweight JavaScript
5. Integration HTML
6. Reduced-motion behaviour
7. Short implementation notes

When JavaScript animation is embedded inside an SVG, inline SVG or an `<object>` embedding approach may be required. CSS-based SVGs offer simpler embedding options.

---

## 5. Responsive Implementation

Use a `<picture>`-like switch at component level or separate desktop and mobile SVG markup.

**Do not** rely solely on `preserveAspectRatio` to convert a complex desktop composition into mobile. Compose separately.

Recommended structure:

```html
<div class="brand-visual" aria-hidden="true">
  <div class="brand-visual__desktop">
    <!-- desktop inline SVG -->
  </div>

  <div class="brand-visual__mobile">
    <!-- mobile inline SVG -->
  </div>
</div>
```

```css
.brand-visual__desktop { display: block; }
.brand-visual__mobile  { display: none;  }

@media (max-width: 767px) {
  .brand-visual__desktop { display: none;  }
  .brand-visual__mobile  { display: block; }
}
```

---

## 6. Animation Lifecycle

Use Intersection Observer so animations only play when visible.

```js
const animatedVisuals = document.querySelectorAll(
  '[data-animated-brand-visual]'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle(
        'is-visible',
        entry.isIntersecting
      );
    });
  },
  { threshold: 0.2 }
);

animatedVisuals.forEach(element => observer.observe(element));
```

The component should:
- Start when approximately 20% visible.
- Pause when off-screen.
- Avoid resetting repeatedly during minor scrolling.
- Maintain its ambient state after the entrance animation.
- Avoid restarting aggressively every time it re-enters the viewport.

---

## 7. Naming Conventions

Use clear IDs and class names.

**Good**

```
legal-column-outline
document-layer-01
verification-path
trust-node
blueprint-grid
ambient-pulse
```

**Bad**

```
path123
group56
shape-copy-8
layer-final-final
```

Descriptive element IDs are also useful when exported elements need to be addressed programmatically. Preserve element names as IDs during any export workflow.

---

## 8. Brand-Specific Variation Rules

Every generated SVG must differ meaningfully in:
- Composition
- Primary metaphor
- Path structure
- Animation rhythm
- Density
- Focal point
- Supporting motif

**Do not simply recolour the same SVG for each brand.**

Maintain consistency through:
- Quality
- Restraint
- Spacing
- Motion principles
- Technical standards
- Accessibility
- Ghar.tv integration

Consistency comes from the system, not from identical graphics.

---

## 9. Negative Instructions

Do not create:
- Generic particle waves for every brand
- Neon crypto visuals
- Animated stock illustrations
- Cartoon characters
- Decorative blobs without meaning
- Excessive glow
- Rapid movement
- Bouncing icons
- Constant spinning
- Large animated gradients behind text
- Dense details on mobile
- Fake 3D rendered as raster
- Embedded PNG or JPEG backgrounds
- Huge SVG files
- Hundreds of particle elements
- Animation that harms readability
- Identical desktop and mobile compositions
- Autoplay motion without reduced-motion support

---

## 10. Required Output Format

Before writing any code, the generator must produce this concise creative-direction block:

```
Brand essence:
[3 to 5 qualities]

Visual metaphor:
[Core conceptual metaphor]

Graphic vocabulary:
[Chosen shapes, structures and systems]

Motion vocabulary:
[Chosen motion behaviours]

Colour source:
[Brand identity / Ghar.tv Theme Colors]

Desktop composition:
[Short explanation]

Mobile composition:
[Short explanation]

About-section adaptation:
[Short explanation]
```

Then, in order:

- **A.** Desktop SVG
- **B.** Mobile SVG
- **C.** CSS
- **D.** Optional JavaScript
- **E.** Integration markup
- **F.** Performance notes
- **G.** Accessibility notes

Code must be complete and directly usable. **No pseudocode.**

---

## 11. Repository integration hooks

The generator hands two artefacts to the templating layer per tenant. This section maps the outputs above to concrete files and classes in the current repo.

### Hero graphic

- Mounted inside: `<div class="bpr-hero__ambient" aria-hidden="true">` (see [`brand-profile-teearch.html`](../brand-profile-teearch.html) around the `<section class="bpr-hero bpr-hero--split">` block).
- Sits behind the hero content column, top-anchored on desktop, top-anchored on iPad, and repositioned between logo and name on mobile via the existing CSS.
- CSS variables available in scope: `--brand`, `--brand-soft`, `--brand-ink`, `--ink-strong`, `--pad-h`, `--pad-v`, `--max-w`.
- Existing animation state hook: the root section receives `.is-hero-loaded` when the entry cascade should begin. Any generated CSS must gate entry animations on `.bpr-hero--split.is-hero-loaded ...`.

### About-section graphic

- Mounted inside: `<div class="bpr-about__illus" aria-hidden="true">` within `<section class="bpr-about bpr-about--seamless">` (again, reference `brand-profile-teearch.html`).
- Wrapping IO trigger: the section wrapper receives `.is-in-view` when the section has scrolled into view. Any generated CSS must gate entry animations on `.bpr-about--seamless-wrap.is-in-view ...`.
- Same colour variables available.

### Chassis rule

Chassis markup, class names, and per-tenant theming pattern do NOT change per brand. Only the innards of `.bpr-hero__ambient` and `.bpr-about__illus` are regenerated. See related memory: `feedback_no_bespoke_ap_style_disaster` — default is same template + `--brand` swap; graphics vary, chassis does not.

---

## 12. Generation contract (backend implementation)

The generator (LLM prompt template, procedural service, or hybrid) must accept a tenant record and return a validated bundle.

### Input schema (per tenant)

```
{
  brand_slug        : string,          // e.g. "teearch"
  brand_name        : string,          // display name
  brand_essence     : string[],        // 3 to 5 qualities
  primary_hex       : string,          // e.g. "#c67e35"
  industry          : string,          // "architecture", "legal", "finance", etc.
  short_description : string,          // one sentence positioning
  logo_url          : string,          // for face detection only, NOT embedded
  existing_photos   : string[]         // brand-owned imagery URLs, optional
}
```

### Output schema (per tenant)

```
{
  creative_direction : {
    brand_essence, visual_metaphor,
    graphic_vocabulary, motion_vocabulary,
    colour_source,
    desktop_composition, mobile_composition,
    about_adaptation
  },
  hero_desktop_svg   : string,   // inline SVG markup
  hero_mobile_svg    : string,   // inline SVG markup
  hero_css           : string,   // scoped to .bpr-hero--split .bpr-hero__ambient
  about_desktop_svg  : string,
  about_mobile_svg   : string,
  about_css          : string,   // scoped to .bpr-about--seamless .bpr-about__illus
  optional_js        : string?,  // vanilla only, no libraries
  perf_notes         : string,
  a11y_notes         : string,
  bytes              : {
    hero_desktop, hero_mobile,
    about_desktop, about_mobile
  }
}
```

### Automated validation before write

Reject the bundle and regenerate if any of these fail:

- `bytes.hero_desktop > 250 KB` OR `bytes.about_desktop > 150 KB`
- SVG contains `<image href>` pointing at a raster (PNG / JPEG / GIF / WEBP embedded or linked)
- CSS contains `@import`, `url(http...)`, or references a font not already loaded by the chassis
- JavaScript references any external library (`gsap`, `three`, `anime`, `lottie`, etc.) or CDN URL
- Missing `@media (prefers-reduced-motion: reduce)` reset in CSS
- Missing `<title>` and `<desc>` inside each SVG
- Any CSS selector does NOT begin with the required scope prefix (`.bpr-hero--split .bpr-hero__ambient` for hero CSS, `.bpr-about--seamless .bpr-about__illus` for About CSS)
- Any generated ID collides with an existing chassis ID (validate against a static allow-list)
- Mobile composition byte-identical to desktop composition (mobile SVG must be a separate composition, not a copy)

### Storage

- Persist the validated bundle on the tenant record, versioned. Keep the previous version so a rollback is possible without regenerating.
- The rendered page reads the current version at render time and inlines the SVG blocks + CSS into the appropriate slots.

### Render-time injection

- Hero: inject `hero_desktop_svg` and `hero_mobile_svg` into `.bpr-hero__ambient` inside the responsive `<div class="brand-visual__desktop">` / `<div class="brand-visual__mobile">` wrapper. Concatenate `hero_css` into the page `<style>`.
- About: same pattern for `.bpr-about__illus`.
- Any generated `optional_js` is appended once at end of body, deferred, guarded by an existence check on the target element.

---

## 13. Rollout and QA

1. **Sandbox first.** Run the generator against a fixed set of 5 test tenants across different industries (architecture, legal, finance, real estate, design). Human review the creative-direction block before spending compute on the SVG.
2. **Byte-diff check.** For each tenant, confirm mobile SVG is not byte-identical to desktop SVG.
3. **Visual regression on the reference tenant.** Regenerating for TEEARCH must produce output that renders in the same slots without breaking layout. Compare against a saved baseline screenshot before promoting a new generator prompt.
4. **Reduced-motion smoke test.** Force `prefers-reduced-motion: reduce` and confirm every generated CSS respects it (final composed state visible, no looping motion).
5. **Perf smoke test.** DevTools Performance panel over 10 seconds on a mid-range mobile emulation: no frames dropping below 55 fps, no continuous main-thread work.
6. **Live rollout.** Ship behind a per-tenant flag. Roll out to a small cohort first. Watch Core Web Vitals for LCP and CLS regressions.

---

## 14. Rules learned from TEEARCH (first live tenant)

These rules were extracted during the TEEARCH hero animation iteration. Every future generation MUST respect them.

### 14.1 Motion, not opacity, is the animation

- Ambient loops must animate **transform, position, or drawing** (translate, rotate, scale, stroke-dashoffset). Never animate opacity as the primary effect on watermark-alpha elements. Opacity phases on faint gradient fills read as "blinking" not "living".
- The word "animation" here means the eye can see something MOVE. If a change is only detectable when comparing two screenshots side by side, it is not animation, it is noise.

### 14.2 Blocks, not lines

- Fine-line redraw loops (window grids, ground grid lines etc.) at 0.5-0.9px stroke-width are visually invisible during ambient motion. Do not use them as the primary continuous effect.
- Continuous motion should sit on **solid mass elements** (building faces, slab plates, gradient-filled polygons). Thin-line stroke pulses are only appropriate as supporting details.

### 14.3 Stack-drop pattern (SVGator translate + step-end swap)

For "block being added / assembled" motion, use this exact pattern:

- Solid slab starts OUTSIDE the visible SVG frame (translated below the ground plane for a rise-in, or above for a drop-in).
- Slab translates into its target position using a Material easing curve.
- On arrival, opacity step-ends 1 → 0 and a pre-positioned "landed" version step-ends 0 → 1 at the same instant. The falling shape appears to explode into the assembled structure.
- OR, using a single-element variant: the same slab keeps opacity 1 during translate, then step-ends to 0 for the reset tail while transform silently returns to the starting position.

**Reject alternatives:**
- CSS `clip-path: inset()` retreats that "reveal" the tower from the bottom up. Reads as a fade-in mask, not a physical block.
- Continuous fill-opacity phases on tower faces (0.55 ↔ 1). Reads as flicker.
- Continuous stroke-opacity pulses on thin window rows. Invisible.

### 14.4 Sequence rules for stacking layers

- **Maximum 3 layers** for stacking-block patterns. 4+ layers overlap existing tower geometry (top face, roof) and produce visual conflicts.
- **Entry sequence: bottom → top.** Layer 1 (foundation) arrives first, layer 2 (middle) second, layer 3 (top) last.
- **Exit sequence: same as entry, NOT reversed.** Layer 1 leaves first, layer 3 leaves last. Consistency reads as rhythm.
- **Never place a stacking layer at a position already occupied by the tower's own geometry** (e.g. do not put a "roof slab" at the same Y as the tower's existing top face).

### 14.5 Timing rules

- **Cycle length: 20-24s minimum.** Shorter cycles read as rushed and jittery.
- **Continuous ambient must wait for the entry rise to settle** before starting. Add `animation-delay` equal to (entry-rise delay + entry-rise duration + ~1s breath). For the TEEARCH tower this is 3s.
- **Symmetric rise and fall durations.** Each layer's rise and fall should be the same duration (e.g. 6% each of a 24s cycle = 1.44s each).
- **Full-hold in the middle of the cycle.** The "complete assembled" state should visibly hold for at least 40% of the cycle (~10s at 24s cycle).

### 14.6 Easing pairs

- **Rise easing: `cubic-bezier(0, 0, 0.2, 1)`** — Material decel. Starts fast, settles gently at the target.
- **Fall easing: `cubic-bezier(0.4, 0, 1, 1)`** — Material accel. Starts gently, gravity finish.
- The two curves are mirror images. Applied together they read as rise + fall of the same physical block.

### 14.7 Visibility rules

- Stacking layers must have **base state `opacity: 0`** until their turn to animate. Never leave them at opacity 1 before their animation window.
- Use `step-end` opacity toggles inside keyframes to snap on / off at motion boundaries. Never fade opacity 0 → 1 — that is a fade-in, not an entry.
- After a layer's exit motion completes, opacity returns to 0 (via step-end) so the layer is fully hidden during the empty tail before the cycle wraps.

### 14.8 Clipping rules

Rising/falling layers must be clipped to the graphic area so they never bleed into surrounding page content. Use BOTH:
1. `overflow: hidden` on the CSS parent container.
2. An explicit SVG `<clipPath>` referenced by the `<g>` group containing the animated layers. Rectangle should span the tower body only, not the whole SVG viewBox.

### 14.9 Performance rules

- Add `will-change: transform, opacity` to any element with continuous animation. Enables GPU compositing.
- Use `transform` (not `top` / `left`) for all position changes.
- Never animate `stroke-dashoffset` on paths with `stroke-dasharray: <large-number>` — the resulting redraw is expensive.

### 14.10 Reduced-motion still applies

The `@media (prefers-reduced-motion: reduce)` reset must catch every one of the keyframes above. If the reset is scoped narrowly, the continuous ambient loops may keep running for users who requested reduced motion. Prefer a wildcard reset on the SVG's animated container.

### 14.11 Verify visually, not just computationally

- The final review MUST include comparison screenshots taken 3-5 seconds apart, showing that the animation state visibly differs between frames. Do not sign off on "computed styles look right" alone. Motion that reads at 60fps in the browser sometimes cannot be seen in a static frame at all.
- If a layer's opacity swing produces less visible change than the background gradient's own alpha, the animation is not visible. Use a different mechanism.

---

## 15. Open questions for implementation

These are decisions the backend programmer must make and record here once resolved:

- **Regeneration trigger.** On new tenant onboarding, on brand-record change, on manual request, or scheduled? Cost per generation caps daily runs.
- **Provider.** Which LLM(s) or procedural pipelines are approved for generation? Provider allow-list needs to be defined.
- **Caching layer.** Generated SVGs are large enough to warrant a CDN or edge cache. Which layer holds them?
- **Preview flow.** How does the tenant / editor preview a candidate generation before promoting it to live?
- **Rollback.** UI or CLI for rolling back to the previous version if a live regeneration regresses the brand's page.

---

_Related memory (internal, session-loading): `project_service_template_animation_spec` in the local memory index points at this doc as the source of truth._
