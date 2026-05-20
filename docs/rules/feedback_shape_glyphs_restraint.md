---
name: House-shape glyphs are NOT category marks — use only as design moves
description: Shape glyphs are a vocabulary of design moves (inline noun, quotation, image mask, photo window) — NOT a category-marking system. Don't prefix eyebrows, tags, source lines, navigation labels, or any identity-bearing UI with a shape glyph. Strengthened 2026-05-08.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**Shape glyphs (`.hp-mark`, `.bi-shape`, the canonical 9 shapes) are NOT category marks.** Don't prefix any identity-bearing UI element with a shape glyph: section eyebrows, card tags, source attributions, nav labels, hero side cards, byline portraits, etc.

## Reaffirmed 2026-05-08 — design-system cleanup
The user reviewed design-system.html and explicitly rejected:
- **"Exhibit B — Shape as category mark"** in `hp-glyph` (the row of `[shape] Editorial / [shape] GharTalks / [shape] GharEvents …`) — DELETED entirely
- **Shape glyphs in `hp-cards` tags** (Property / Editorial / GharTalks / Event / People / Intelligence cards) — DELETED, tags now plain text
- **Shape glyph inline in `hp-hero` headline** (`Find the place that fits the way you [house] live`) — DELETED
- **Shape glyphs in `hp-hero` side cards** (GharTalks / GharEvents / VideoWorks / Brand Connect identifiers) — DELETED
- **Shape glyphs in `hp-data` source attributions** (`[shape] Ghar.tv Intelligence · …`) — DELETED

Section 03 (`hp-glyph`) intro reframed from "the house is a word — a letter in the alphabet" (which read as a rule) to "a vocabulary, not a stamp" with explicit "they are NOT a category-marking system" language.

The Homepage Playbook divider intro reframed from "Read it like a score, not a style guide" to "A library of design moves" with explicit "These exhibits are not section-design rules. They're a vocabulary you reach for when a future page needs the move."

## Where shapes ARE valid design moves
- **Image masks** (Photos in house shapes — `.masks` section) — ✓ rule. Large-scale only. **Never** inline at small text scale (the photo doesn't read).
- **Imagery on color** (Photos meet palette — `.color-cards` section) — ✓ rule
- **Inline shape replacing a noun** (Exhibit A `Shape as noun`; the small Content Cards "Home<shape>sanctuary." pattern) — ✓ design move, used sparingly. **Solid-color fill only** at small inline scale; don't try to fit a photo-masked shape inline at small sizes.
- **Photo-masked shape inline with type** (Exhibit B `Shape as window`) — ✓ design move at large editorial scale only (display-size headlines, billboard-scale moments). The photo needs ≥40px to read.
- ~~**Shape as quotation**~~ — REJECTED 2026-05-08. Removed from design-system.
- ~~**Shape as category mark**~~ — REJECTED 2026-05-07. Removed across all sections.

## Inline shape size guide (added 2026-05-08)
- **Small inline (~1em / 18-24px)**: solid color fill ONLY. Photo-masks are illegible at this scale.
- **Medium inline (~1.5-2em / 30-50px)**: photo-mask is OK if the moment is editorial.
- **Display inline (≥3em / 60px+)**: photo-mask reads clearly; this is the natural Voice — Billboard scale.

## How to apply
- **Default**: no shape glyph anywhere except the canonical brand mark (logo) and the brand-system showcases.
- **Eyebrows / tags / category labels**: plain text. The label does the work.
- **Source attributions / metadata lines**: plain text. No glyph.
- **Section identifiers / nav links**: plain text + optional Inter icon if needed.
- **Inline shape-as-noun**: only when user explicitly asks, or when the page is editorial/voice-led AND the moment earns it. Match the spacing pattern from Voice — Billboard (literal space character on BOTH sides of the inline shape; CSS `.bi-shape` or `.hp-mark` with small symmetric margin).
- **`hp-cards` and `hp-glyph` are reference exhibits, NOT rules** to apply across new pages. Treat the entire Homepage Playbook (`hp-*`) division as a library of design moves to reach for selectively, not a checklist.

## Stacks with
- `feedback_design_restraint.md` — shapes must have meaning or sense
- `project_design_system_composition_rules.md` — the framework rules every page MUST follow live in `cr-*`; the playbook (`hp-*`) is optional vocabulary
- `feedback_shared_classes_rule.md` — once a page reaches for a shape-as-design-move, define it inline; don't promote to a shared `.cat-mark` style class
