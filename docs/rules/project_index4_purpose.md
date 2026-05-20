---
name: index4 purpose — directional home page, not showcase
description: The fundamental WHY of index4. It exists to be a minimal directional gateway, not a comprehensive single-page showcase. Re-read before every section build.
type: project
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
# Why index4.html exists

**Index4 is a DIRECTIONAL home page, not a comprehensive single-page showcase.**

Each section's job is to **point** to a dedicated page (e.g. `/editorial`, `/voices`, `/events`, `/intelligence`). Sections are entry points, not mini-pages. A user reaching the bottom should feel oriented and curious — never tired.

## The two failures of index.html that index4 must fix

1. **Heaviness.** Every section in index.html grew into its own world — header + featured + grid + strip + pillars + CTAs. The page became a marathon. By the time a user is 60% scrolled they've already disengaged.
2. **Tonal inconsistency.** Sections felt like different sites stitched together. No connective tissue — each section had its own colour vocabulary, type rhythm, and density. The whole lacked a unified design sense even when individual elements were well-executed.

## Why design-system.html exists and how to read it

design-system.html is the canonical reference for the new design theme. It contains TWO distinct kinds of content — and conflating them is what caused yesterday's section rebuild to fail.

| Layer | Examples | How to use |
|---|---|---|
| **Rules / guidelines** (apply globally) | Foundation colors, the 5 earned tones, type system, spacing tokens, brand voice, shape-is-glyph philosophy, no-italic-Gazpacho, 24px grid, warm paper canvas | Non-negotiable. Honor everywhere. |
| **Design references** (apply where applicable) | Image masks (Exhibit D shape-as-window), imagery-in-color, data patterns, micro-UI patterns, the hp-glyph exhibits, hp-cards taxonomy | Patterns to reach for **when a section earns them**. Judgment call, not checklist. |

User explicitly said: "some parts on this page were customized to look good… image masks, imagery in color, imagery, data patterns and micro-UI which had good design reference as well not just as a rule/guide book which I had asked you to use wherever applicable but, you went on to develop same index.html problems again and using elements which didn't earn the place it looked forced."

## How to apply this to every section build

- **Brief, not exhaustive.** A 3-card grid that opens a door is better than a 12-element collage summarizing the whole vertical.
- **One earned visual idea per section.** Not three. If a section uses a masked image, it doesn't also need shape glyphs and a data pattern and a portrait stack.
- **Viewport-and-a-half rule.** If a section spans 3+ viewports vertically, it's becoming index.html. Cut.
- **Click-through is the success metric.** Does this section make someone want to visit the dedicated page? That's the test — NOT "does it explain the vertical".
- **Discuss layout before code.** Brief approach (3-5 lines), get sign-off, then build. One section at a time.

## Stacks with

- `feedback_compact_sections.md` — the compactness rule
- `feedback_one_section_at_a_time.md` — iterate per-section, never batch
- `feedback_shape_glyphs_restraint.md` — don't sprinkle shape glyphs as forced decoration
- `feedback_no_gazpacho_italics.md` — no italic on Gazpacho
- `feedback_airbnb_clickl_formula.md` — Airbnb skeleton + Clickl soul
- `project_index4_rebuild_brief.md` — the canonical handoff with the section rhythm
