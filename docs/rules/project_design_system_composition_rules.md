---
name: design-system Composition Rules division (`cr-*`)
description: design-system.html now has a third division — Composition Rules (`cr-*`) — between Brand Identity (`bi-*`) and Homepage Playbook (`hp-*`). Documents the framework rules every new page inherits from index4. Batch 1 shipped 2026-05-08; further batches planned and will be added incrementally.
type: project
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
# Composition Rules in design-system.html

## Why a third division
The doc had `bi-*` (Brand Identity — atoms: logo, color, type, voice) and `hp-*` (Homepage Playbook — applied pattern variants per homepage moment). Missing in between: the **framework rules** that hold any new page coherent — grid token, section head pattern, CTA pattern, etc. The user wanted these baked into the design system so future page builds don't re-litigate them. Added 2026-05-08 as `cr-*` between `bi-restraint` (last bi section) and `hp-divider` (first hp section).

## Mental model (read in this order)
- **`bi-*` Brand Identity** — atoms (logo, color, typography, voice)
- **`cr-*` Composition Rules** — framework (how to build any page coherently)
- **`hp-*` Homepage Playbook** — applied variants (how patterns play out per homepage section)

## Batch 1 — shipped 2026-05-08
1. **`cr-divider`** — chapter intro (label + h2 "How to build any page." + paragraph)
2. **`cr-grid`** — Rule 01: container token. `clamp(1280px, 75vw, 1840px)` with code block + viewport→resolved-grid table covering 1707/1920/2200/2560 widths.
3. **`cr-head`** — Rule 02: section head pattern. Eyebrow on its own row, then 2-col row at desktop (title L / lead+CTA R). Includes a live mock + the markup snippet showing `.sec-head / .sec-eyebrow / .sec-title / .sec-lead / .btn-text`.
4. **`cr-cta`** — Rule 03: the one CTA. Default + hover preview rows + a "Rejected variants — do not reintroduce" panel listing pills, filled red buttons, ghost variants, 13/15px sizing.
5. **`cr-cta-place`** — Rule 04: CTA placement. Two side-by-side cards (✕ CTA in foot row vs ✓ CTA under description) with skeleton mocks of the section structure.
6. **`cr-logo`** — Rule 05: Logo discipline (added 2026-05-08 second pass). Five exhibit rows: 2 rejected (shape-glyph + Gazpacho text; real logo + decorative shape glyph), 3 valid (full wordmark, G letterform, "Ghar.tv" in a sentence). Strict, non-negotiable. See `feedback_logo_discipline.md` for the full rule.

## Batch 2 — partially shipped 2026-05-08
- **Video thumbnail overlay** — `.thumb-play` / `.thumb-play-btn` now embedded in design-system.html. Glassmorphic disc, no border, soft shadow. Treat as the canonical video-thumb overlay across the portal.
- **Card taxonomy rebuild** — The `hp-cards` section in design-system.html was rebuilt 2026-05-08 (second pass) to showcase the **5 actual section-specific card families** from index4, each labeled with its class name:
  1. **Featured Projects · `.dc-proj`** — portrait 4:5 image with hover-revealed fact pill + overlay info (name, price, meta) + corner arrow
  2. **Intelligence · `.intl4-card`** — image-bleed-to-edge with `.intl4-card-gfx` warm-paper graphic panel (custom data-viz SVG per category), title, desc, foot row with category + tags
  3. **Architecture & Design · `.ad4-card`** — padded image (4:3 inside 14px-padded white card), category eyebrow, title, desc, bordered foot row with byline + reading time
  4. **Editorial · `.ed4-article`** — magazine-style image-on-top, large Gazpacho display headline, uppercase meta line
  5. **GharTalks · `.gt4-card`** — 16:9 video thumbnail with shared `.thumb-play` overlay + duration chip, title, desc
  
  This replaced the old generic 6-card grid (Property/Editorial/Podcast/Event/Person/Intel) which tried to be one-size-fits-all. The new approach treats Card taxonomy as a **reference library** where future builds reach for the closest existing family rather than inventing a new card pattern. Single-eyebrow rule still holds: one category indicator per card, never two stacked.

## Batch 2 remainder — still planned
1. **Section compactness** — one primary unit per section, not 4 stacked parts. Example contrast: heavy index.html sections vs lean index4.html sections.
2. **Surface default** — warm-white default canvas; espresso/dark tone is "earned" at three levels (whole-section dark for narrative, dark hero card within a warm section, dark per-card glass for emphasis). Reference `feedback_section_compactness_index4.md`.
3. **Carousel chassis** — `.rail-outer` / `.rail` co-class chassis with overflow + cursor + bleed shared rules. Reference `project_carousel_chassis.md`.
4. **Tag-strip pills carousel** — `.tag-strip-*` pattern for the 7-9 chip filter rows used by Intelligence + Design.
5. **Carousel arrows** — `.intl4-arrow` / `.ad4-arrow` style — round 44px white-with-border, hover ink-fill.

## Section 07 — Navigation rebuild (2026-05-08)
The `hp-nav` section in design-system.html was updated to mirror index4's actual navigation:
- **Desktop navbar** (Exhibit A): canonical Ghar.tv wordmark SVG (left) → universal search bar with WHERE label + "Search by city, locality, project or pin-code" + Buy/Homes toggles + brand-red search button → Post Property pill + profile + menu cluster
- **Mobile bottom bar** (Exhibit B): four tabs — Ghar (canonical red G letterform, was a house-shape glyph), Post (+ icon), Account (person), Menu (hamburger)
- **Off-canvas menu** (Exhibit C): canonical wordmark + close → primary links (Post Property in red, Post Requirement, Property Leads) → Discover group (Buyers & Owners, Brand Partners, Browse by City) → Content & Media group (Editorial, Industry Voices, Architecture & Design, Intelligence, GharTalks, GharEvents) → For Business group (SuperPro, Mandate, VideoWorks, Brand Connect) → Tools & Services (Ghar Finance, Design, Move, EMI Calculator) → footer (Sign In, About, Contact)

Strict logo discipline applied: no shape-glyph + Gazpacho-text lockup anywhere in the navigation.

## Future batches — likely topics
- Big numbers in Gazpacho (≥14px display = Gazpacho 700)
- No negative letter-spacing on Gazpacho — ever
- No Gazpacho italics
- Color is semantic, not decoration
- Eyebrow restraint (no shape glyphs by default)
- Shared classes rule (`.sec-*` / `.btn-text` / `.thumb-play` — one canonical, no per-section duplicates)

## What's still missing — gradual UI elements
The user noted design-system also misses **UI elements** (form fields, dropdowns, modals, navbars, dropdowns, dialogs, tooltips, tabs, etc.). These will be added gradually as new pages need them. Don't try to build all at once — wait for a real page-build to surface the actual need.

## How to apply when adding to `cr-*`
- Insert new `cr-*` sections **before `<section class="hp-divider">`** (currently around line 3530+ depending on prior insertions).
- Keep CSS in a single shared `<style>` block at the top of the cr-* group; new sections can extend it.
- Use the doc's existing `.wrap`, `.sec-head`, `.sec-head__title`, `.sec-head__desc`, `.label` for the documentation framing.
- Use `cr-` prefix for any custom mock/exhibit classes inside the section.
- Use `.cr-btn` for any in-doc text-link CTAs (mirrors `.btn-text` from index4 — keeps the doc self-contained without linking styles4.css).
- Each rule gets a numbered label: `Rule NN · Topic`.

## Stacks with
- `feedback_shared_classes_rule.md` — the canonical rule the section head pattern and CTA pattern enforce
- `feedback_container_width.md` — source for the grid table data
- `project_index4_*` — implementations the rules were extracted from
- `feedback_section_compactness_index4.md` — basis for batch 2 compactness rule
