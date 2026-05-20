---
name: Logo discipline — strict, non-negotiable rules
description: The Ghar.tv logo (full wordmark or G letterform) is NEVER paired with a shape glyph. The brand name in a logo unit is NEVER typed in Gazpacho — it must use the canonical SVG logo asset. Gazpacho is fine for "Ghar.tv" inside a sentence/title, never as a wordmark.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**Two strict rules, no exceptions.**

## Rule 1 — Logo never with a glyph
Wherever the Ghar.tv logo (full wordmark, G letterform, or G + Suiza tagline lockup) appears, no shape glyph (the canonical 9 house shapes) sits next to it. The logo carries its own identity. A shape next to it competes for the same job and reads as a second mark — destroying the logo.

This anti-pattern showed up repeatedly in design-system.html on 2026-05-08 across:
- **Footer Layer 2 (brand bar)** — house-glyph badge + Gazpacho-rendered "Ghar.tv" text — REPLACED with canonical full wordmark SVG
- **Footer Layer 4 (bottom bar)** — house-glyph badge next to "© 2026 Ghar.tv" — REPLACED with G letterform SVG
- **Micro-UI Exhibit A (notification toast)** — house-glyph icon + "Ghar.tv" text — REPLACED with G letterform SVG (the toast is now a real Ghar.tv-branded notification)

## Rule 2 — Brand name in logo unit ≠ Gazpacho text
"Ghar.tv" the wordmark is an SVG asset, NOT typed text. Anywhere the brand name functions as a logo unit (footer, navbar, app icon, brand bar, signature line) it must use the canonical SVG. Gazpacho-rendered "Ghar.tv" is wrong here even without an accompanying glyph.

**Allowed**: "Ghar.tv" inside running editorial copy, headlines, or display titles, follows the surrounding font like any other word. Gazpacho is fine — it's a sentence, not a logo unit.

## Canonical logo assets (use these, don't recreate)
The full SVG paths live in `design-system.html` (bi-logo section, around line 2604) and are duplicated where needed:

- **Full wordmark** (use in footers, navbars, hero areas):
  `<svg viewBox="0 0 890.6 196.8"><path fill="#ee324b" d="M180.5,92.6...Z"/></svg>`
- **G letterform** (use for icons, avatars, copyright lines, toast icons):
  `<svg viewBox="-2 0 185 197"><path fill="#ee324b" d="M180.5,92.6...Z"/></svg>` (the same M180.5 path; viewBox is the only difference)

Both render in brand-red (`#ee324b`). On dark surfaces, override fill to `#fff` if needed.

## Documented in design-system.html
**Composition Rule 05 · Logo Discipline** (`<section class="cr-logo">`) inside the `cr-*` division. Five exhibit rows showing 2 rejected patterns + 3 valid uses. Future page builds inherit this rule.

## How to apply
- **Before placing any logo, navbar mark, footer mark, or notification icon**: use the canonical SVG asset, not a shape glyph.
- **Before typing "Ghar.tv" in a brand bar / footer / signature**: replace with the SVG wordmark.
- **In editorial copy, headlines, display titles**: just type "Ghar.tv" normally — it's a word, not a logo unit.
- **In a notification or toast that represents the Ghar.tv brand sending a message**: G letterform icon + "Ghar.tv" text in Inter is correct (icon = brand sender, text = sender label, no shape pairing).

## Stacks with
- `feedback_shape_glyphs_restraint.md` — shapes are not category marks
- `project_design_system_composition_rules.md` — `cr-logo` is now part of the framework rules
- `feedback_no_gazpacho_italics.md` — typography discipline