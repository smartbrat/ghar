---
name: Responsive patterns and carousel rules
description: Established responsive breakpoints, carousel behavior, overflow handling, and layout rules for eco section and all future sections
type: feedback
---

## Breakpoints
- `<744px`: Mobile — single-column, 1-up carousel for card groups, progress bars (4 bars), touch+mouse drag
- `744px–1079px`: Tablet — 2-up carousel for card groups, progress bars (2 bars), transform-based sliding with `overflow-x:clip;overflow-y:visible` on wrappers
- `1080px+`: Desktop — full flex/grid layout, hover interactions, no carousel

## Carousel Implementation
- Uses CSS `transform:translateX()` for sliding, NOT native scroll
- Mobile: track `width:400%`, cards `width:25%`, shift by 25% per slide
- Tablet: track `width:200%`, cards `width:calc(25% - 24px)` with `margin:0 12px`, shift by 50% per slide
- JS must detect mode changes on resize (mobile↔tablet↔desktop) and do full `stopCarousel()→startCarousel()` when crossing breakpoints, not just `goTo(0)`
- Resize handler must be debounced (~150ms)

## Overflow Rules
- Carousel wrappers: use `overflow-x:clip;overflow-y:visible` (NOT `overflow:hidden` — it clips card bottoms/shadows)
- `overflow:hidden` + `overflow-y:visible` doesn't work in CSS — browser converts visible→auto. Use `clip` instead.
- Cards at 744-1079px should have `overflow:visible` to prevent illustration/shadow clipping

## Layout Anti-Patterns to Avoid
- Don't add `min-height:100vh` to sections unless strictly needed — it creates whitespace gaps on mobile
- Don't use `!important` base rules that get overridden everywhere — put shared properties in base, breakpoint-specific in media queries
- Don't duplicate CSS across media queries — define shared styles (like progress bar appearance) once in base
- Don't attach scroll-based JS to transform-based carousels — they don't emit scroll events
- Don't add `.drag-scroll` class to transform-based carousels — the canScroll check always fails

## Editorial Section
- Header row layout: 1024px+ (NOT 744px — too narrow for title+description side by side)
- Hero card row layout: 1024px+ (NOT 744px — text column too narrow at 768px)
- `.ed2-hero__excerpt` max-width only at 1024px+, full width below

**Why:** Multiple rounds of iteration fixing clipping, layout breaks at 768px, and whitespace issues. These rules prevent repeating those problems in future sections.

**How to apply:** Before building any new section with cards/carousels, follow these breakpoints and patterns. Test at 390px, 768px, 1024px, and 1366px minimum.
