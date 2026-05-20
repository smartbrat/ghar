---
name: Grid system rules
description: Consistent Airbnb-style grid system that must be applied to all sections — max-width 1600px, specific padding and gap values
type: feedback
---

All content sections must follow the same grid system, no exceptions.

- `--max-w: 1600px` — global content container cap
- `--pad-h: clamp(24px, 3vw, 80px)` — horizontal padding on all content containers
- `24px` gaps between cards and grid items (not 14px, not 16px)
- Every content container: `max-width: var(--max-w); margin: 0 auto; padding: 0 var(--pad-h)`
- Nav background goes full-width, but nav content row is constrained to the same `--max-w` grid
- Hero section is a full-screen backdrop (content centered, no max-width needed on the section itself)
- Full-width background sections are allowed, but the content inside must still respect the grid

**Why:** User compared against Airbnb and found our 1280px container too narrow. The wider 1600px container with 3vw padding gives ~94% content ratio at 1366px (matching Airbnb's ~95%), and all section edges align to the same invisible boundary.

**How to apply:** Before building any new section, ensure its content wrapper uses `max-width: var(--max-w)` with `padding: 0 var(--pad-h)` and `margin: 0 auto`. Card gaps are always `24px`.
