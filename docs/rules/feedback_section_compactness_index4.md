---
name: index4 sections — warm-white default, balanced header, no glyph eyebrows, one primary unit
description: Reinforced 2026-05-07 after GharTalks v1 repeated the index.html heavy-section problem (espresso surface + featured tile + rail + foot row + glyph eyebrow). Sections in index4 default to warm white, balanced 2-col header, no glyph in eyebrow, one primary unit only.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
User flagged the first GharTalks build as "the same problem from index.html to the new design — we need a compressed/minified version" with four specific issues:

1. **Don't repeat the heavy-section problem** — featured tile + episode rail + browse-all card + foot row was 4 stacked parts. Same density mistake as the original `index.html` sections.
2. **Don't use a glyph in the eyebrow by default.** Stacks with `feedback_shape_glyphs_restraint`. Even if the section's hp-glyph is the GharTalks pentagon, do not prefix the eyebrow with it unless the section truly earns it.
3. **Header must be left/right balanced**, not stacked-left. Use the Intelligence section pattern: `.intl4-head-l` (eyebrow + Gazpacho title) on the left + `.intl4-lead` paragraph on the right. Below 1024px stacks vertically.
4. **Skip the espresso surface for GharTalks.** Override of the hp-score 5-earned-tones table from `project_index4_rebuild_brief`: GharTalks should sit on the warm-white body canvas, not a dark "listening room" surface. No section bg break.

## Why

Index4 is a *directional gateway*, not a comprehensive single-page showcase (`project_index4_purpose`). Adding a featured-card unit AND a rail AND a browse-all card AND a foot row recreates the index.html marathon — the user has corrected this multiple times. One primary unit per section is the rule.

The dark surface override is not GharTalks-specific reasoning — it's about the same fatigue. A dark inset on a warm-paper page is itself a heavy element; readers feel it as "another section trying to be its own world". Keep the canvas calm. Color/character lives in the cards, the type, the small details — not in section-wide tonal breaks.

## How to apply

- **Default surface = `var(--warm-white)` body bg** for every section in index4 unless the user explicitly approves a colored surface for that section. The hp-score earned-tones table is a *reference*, not a checklist — apply only when a section truly earns it (and even then, ask first).
- **Default header pattern** = Intelligence-style 2-column: eyebrow + Gazpacho title left, lead paragraph right (1024+); stacks vertically below 1024. Mirrors `.intl4-head` in `styles4.css` ~line 801. Don't put CTAs in this header band — let lead carry the inline link, or place a small text CTA at the foot.
- **Default eyebrow** = plain Inter uppercase, no glyph, no shape mark, no icon. Just the section name in muted color.
- **One primary unit per section.** A grid/rail of equal cards is one unit. A featured tile + secondary rail is two units — don't do that here. If a single piece deserves emphasis, surface it as the first card in the same grid (the way the Design section moves the video card into the carousel below 1024).
- **Click-through, not summary.** The header lead + the unit + a single tail CTA is enough. The dedicated page does the rest.

## Stacks with

- `project_index4_purpose.md` — directional gateway, viewport-and-a-half rule
- `feedback_compact_sections.md` — the original "don't bloat" rule
- `feedback_shape_glyphs_restraint.md` — no forced shape glyphs
- `feedback_one_section_at_a_time.md` — build one, screenshot, sign off
- `project_index4_rebuild_brief.md` — earned-tones table is a *reference*, apply only when earned

## Supersedes for GharTalks specifically

- `project_index4_ghartalks.md` v1 (espresso + featured tile + rail + browse-all) — rebuilt 2026-05-07 to warm-white compact form. The v1 memory should be considered historical only.
- `project_index4_rebuild_brief` row #6 (GharTalks = Espresso `#3a3530`) — overridden by user. GharTalks now sits on warm-white default.
