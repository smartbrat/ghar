---
name: Design Rules — Reading Order
purpose: For anyone (or any Claude session) starting design work on Ghar.tv. Read these in the order below before touching any page.
---

# Design Rules

These are the load-bearing rules accumulated from many design iterations on Ghar.tv. Every Claude session that does design work on this project should read **all** of them before proposing or building anything. Skim if you must, but don't skip — most "AI-generic" design output happens because Claude didn't have these rules in context.

## Reading order

### 1 · The formula (read first)
- `feedback_airbnb_clickl_formula.md` — **Airbnb skeleton + Clickl soul.** This is the design DNA. Internalize it before anything else.
- `project_index4_rebuild_brief.md` — Complete handoff: formula, rules, build order. The most important file for understanding what "looks right" on this project.
- `project_index4_purpose.md` — Directional, not showcase. The fundamental WHY behind every design decision.

### 2 · The framework (Composition Rules)
- `project_design_system_composition_rules.md` — Explains the `cr-*` division in `design-system.html`. These rules apply to **every** page.
- `feedback_shared_classes_rule.md` — `.sec-*` and `.btn-text` are canonical. One pattern wins. No per-section duplicates.
- `feedback_section_compactness_index4.md` — One primary unit per section. No glyph eyebrows. Warm-white default. Balanced 2-col header.
- `feedback_compact_sections.md` — The companion rule. Don't repeat the bloated section problem from the old `index.html`.

### 3 · The restraints (what NOT to do)
- `feedback_color_semantics.md` — Color is meaning, not decoration. Warm-white default; color is **earned** at three levels.
- `feedback_design_restraint.md` — Don't force shapes/colors. Upgrade, don't replace. Monochrome shadows on white.
- `feedback_shape_glyphs_restraint.md` — Shape glyphs are NOT category marks. Strict rules on inline shape sizing.
- `feedback_logo_discipline.md` — Logo never with a glyph. Brand name in a logo unit ≠ Gazpacho text. Strict.

### 4 · Typography
- `feedback_letter_spacing.md` — **NEVER negative letter-spacing on Gazpacho.** Default tracking at every size.
- `feedback_no_gazpacho_italics.md` — NEVER italicize Gazpacho display unless explicitly asked.
- `feedback_gazpacho_numbers.md` — Big numbers (≥14px display) use Gazpacho 700, not Inter.

### 5 · Layout & responsive
- `feedback_grid_system.md` — 24px gaps everywhere. Consistent wrap pattern.
- `feedback_container_width.md` — `clamp(1280px, 75vw, 1840px)` — don't replace with a fixed value.
- `feedback_responsive_patterns.md` — Breakpoints, carousels, overflow rules, layout anti-patterns.
- `feedback_text_overflow.md` — Always handle dynamic text on narrow screens.
- `feedback_css_practices.md` — No inline styles fighting CSS. No grey bg to "stand out". Source order matters.
- `feedback_carousel_pattern.md` — Standard bleed-edge carousel: negative margins + padding, drag-scroll.

### 6 · Process (how to work with the user)
- `feedback_discuss_first.md` — Present options, get approval before writing code. Especially for removals and design changes.
- `feedback_one_section_at_a_time.md` — Even when given a list of 4 sections, build ONE, screenshot, sign-off, then next. Batching = wasted work.
- `feedback_screenshot_location.md` — All screenshots go in `screenshots/claude-screenshots/`. Strict.

### 7 · Brand atoms
- `project_color_system.md` — The full 16-color Ghar.tv palette.
- `project_explore_shapes.md` — The 9 canonical house shapes and how they're used.

## Once you've read these
Open `design-system.html` and treat it as your reference catalog:
- **Division 01 — Foundations (`bi-*`)** — atoms (logo, color, typography, voice, the 9 shapes, masks, billboard quote).
- **Division 02 — Composition Rules (`cr-*`)** — framework rules every page MUST follow (grid, section head, the one CTA, CTA placement, logo discipline).
- **Division 03 — UI Components (`ui-*`)** — buttons (built), inputs/dropdowns/modals/toasts/tabs/tooltips/pagination/navbars (in progress).
- **Division 04 — Patterns (`hp-*`)** — applied recipes from index4: card families, hero, navigation, footer. Vocabulary, not mandates.

Then open `index4.html` to see the rules applied in production.

## When in doubt
- **A new pattern feels like it needs a new color/shape/font:** stop. Re-read `feedback_color_semantics.md` and `feedback_design_restraint.md`. The answer is almost always "use the existing vocabulary".
- **Tempted to use a filled button in an editorial section:** stop. Read `feedback_shared_classes_rule.md` (cr-cta). It's `.btn-text` only.
- **Tempted to italicize a Gazpacho headline:** don't. Use color or weight contrast instead.
- **Tempted to add a fourth card to a 3-card row "for symmetry":** don't. Read `feedback_compact_sections.md`.
