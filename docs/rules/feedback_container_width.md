---
name: Container width — 1280 floor, scales up on bigger monitors
description: `--max-w: clamp(1280px, 75vw, 1840px)` in index4.html. Laptop-class viewports (Lenovo Legion Pro 5i ≈ 1707 CSS at 150% scale) hit the 1280 floor and keep the calm Airbnb-style container. Bigger monitors (HP 1920×1080, 2560 desktop) widen smoothly up to a 1840 cap.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
The grid is a single `clamp()` value defined in `:root` of `index4.html`, NOT a fixed 1280px and NOT a stepped media-query bump. Both of those were tried earlier (2026-05-08) and rejected:

- **Fixed 1280px everywhere** — felt cramped on the user's external HP M24fwa 1920×1080 monitor (gutter ratio 16.7%) and very compact when inspected at 2560 (gutter ratio 25%).
- **Stepped `@media (min-width: 1800px) { :root { --max-w: 1400px } }`** — the jump was too coarse; at 2560 inspect, 1400 max-w still left ~580px gutter per side and felt empty.

## The current rule
```css
:root {
  --max-w: clamp(1280px, 75vw, 1840px);
  --pad-h: clamp(24px, 3vw, 64px);
}
```

Resolved widths verified against the live site:
- **1707 CSS (Legion Pro 5i @150% scaling)**: 75vw = 1280, floor wins → **1280px** grid, 213px gutter (12.5%) ✓ matches the user's "looks good" baseline
- **1920 CSS (HP M24fwa @100%)**: 75vw = 1440 → **1440px** grid, 240px gutter (12.5%)
- **2560 CSS (desktop / dev-tools sim)**: 75vw = 1920, capped → **1840px** grid, 360px gutter (14%)

The 75vw factor is derived from the laptop's "good" content-to-viewport ratio (1280 / 1707 ≈ 75%) — applying that uniformly preserves the calm feel at every screen size up to the cap.

## Why
- Single source of truth — no breakpoint hops, no per-section overrides
- Laptop (the user's daily driver) keeps its calm 1280 grid untouched
- External monitors don't feel compact anymore — the grid breathes proportionally
- Cap at 1840 prevents 4K+ screens from stretching into a billboard

## How to apply
- **All sections** in `index4.html` use `max-width: var(--max-w); margin: 0 auto; padding: 0 var(--pad-h)` on their inner wrapper. Don't invent custom max-widths.
- **Don't replace the clamp with a fixed value or breakpoint bump** without explicit user direction — this was iterated to.
- **If user reports compact feel at a new viewport size**, first ask for `window.innerWidth` to know the CSS width (Windows display scaling can mask the native panel resolution).
- The user's primary screen is a Lenovo Legion Pro 5i (2560×1600 native, 150% scaling = ~1707 CSS). Their external monitor is an HP M24fwa (1920×1080 native, 100% scaling). Treat both as canonical test points.

## Stacks with
- `feedback_grid_system.md` — 24px gaps, consistent wrap pattern
- `feedback_responsive_patterns.md` — breakpoints, carousel rules
