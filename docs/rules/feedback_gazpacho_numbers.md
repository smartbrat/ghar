---
name: Big numbers use Gazpacho
description: Numbers at large display sizes (prices, stats, ranking values) should be set in Gazpacho, not Inter
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
Whenever a UI element shows a number at a sizeable scale — pricing in property cards, stats, ranking podium numbers, percentages, money values, year labels at display weight — set it in `'Gazpacho', Georgia, serif` with `font-weight: 700`. Inter is for body, UI labels, eyebrows, meta text — never for prominent numeric values.

**Why:** Gazpacho's serif curves give numerals confidence and editorial weight at larger sizes; Inter at the same size reads functional/utilitarian. The user surfaced this on the Featured Projects price (₹4.5 Cr at 16px Inter) — switched to Gazpacho 18px 700.

**How to apply:**
- Default for any number ≥14px display: `font-family: 'Gazpacho', Georgia, serif; font-weight: 700;`
- For tracking: see [feedback_letter_spacing.md](feedback_letter_spacing.md) — short version: no negative letter-spacing on Gazpacho ≤22px.
- Eyebrow labels around the number ("Starting at", "Year-on-year", "Rank") stay Inter — they're typography around the number, not the number itself.
- Currency symbols, units, and decimal smalls can drop to Gazpacho 500/regular as a `<small>` for a subtle scale shift (see `hp-data-stat small`).
- Don't apply to ordinary body-size numerics inside paragraphs ("18 minute read", "Q1 2026") — those stay in flow with the surrounding Inter copy.
