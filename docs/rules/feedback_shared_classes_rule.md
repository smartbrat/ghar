---
name: Shared classes for shared concerns — no per-section duplication
description: When multiple sections render the same thing (same font, size, line-height, behavior), use one shared class — not section-prefixed copies. Per-section prefixes only for section-specific layout/cards/decorative bits.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
User flagged 2026-05-07 that `.intl4-title`, `.gt4-title`, `.vc4-title` all rendered the same thing with the same CSS, just renamed per section — and that's how the mobile max-width bug snuck in (drifted between copies).

## The rule

If two or more places need the same visual or behavior, **one canonical class**. Section-prefixed (`.X-*`) classes only earn their place for things that are genuinely section-specific (layout grids, card markup, decorative bits, per-section accents).

### Header copy (canonical) — `styles4.css` `.sec-*` block
- `.sec-eyebrow` — Inter uppercase 10px, weight 700, letter-spacing .14em, muted color
- `.sec-title` — Gazpacho Bold display, clamp(34px, 4.4vw, 56px), default letter-spacing (NEVER negative — see `feedback_letter_spacing`). Section-scoped desktop max-widths layer on top via `.X-head .sec-title { max-width: 18ch }`.
- `.sec-lead` — Inter 15px, line-height 1.75, espresso color. Section-scoped desktop max-widths layer on top via `.X-head .sec-lead { max-width: 420px }`.

### Section head layout (canonical) — `styles4.css` `.sec-head` block
2-col header pattern used by Intelligence, Editorial, GharTalks, Voices. Below 1024 stacks vertically (eyebrow → title → lead → CTA); at ≥1024 splits to eyebrow+title left / lead+CTA right.

- `.sec-head` — flex container (column → row at ≥1024)
- `.sec-head-l` — left col, holds `.sec-eyebrow` + `.sec-title`
- `.sec-head-r` — right col, holds `.sec-lead` + CTA stacked (gap 22px). At ≥1024: `flex: 0 0 auto; max-width: 420px`.

Section-prefixed `.X-head` co-class still applied so per-section overrides (title max-width, larger margin-bottom) can scope onto descendants. Design (`.ad4-head`) does NOT use `.sec-head` — it uses CSS Grid because the right column is a video card, not a lead. Design's CTA goes inside the text column under the lead.

**CTA placement rule**: Section CTA always appears under the description (eyebrow → title → description → CTA), never in a foot row. Foot rows are reserved for arrows/dots/peek-related controls. (Established 2026-05-07 — user wants the title + description to set the case for action, then CTA right there to act on.)

### Section CTAs (canonical) — `styles4.css` `.btn-text` block
**ONE pattern. No pills, no buttons, no ghost variants.** Every section CTA — header, foot, inline — uses `.btn-text`.

- `.btn-text` — text + arrow link, Inter 14px / 600, ink color. Hover: brand-red + arrow slide. Used everywhere: "Explore Intelligence", "Explore Design", "Explore GharTalks", "Watch on YouTube", "Read the piece →", "Browse all voices →", "View all cities", "See all stories".

Rejected variants (do NOT reintroduce):
- ❌ `.btn-pill` (outline pill) — user explicitly rejected pills 2026-05-07. The mix of pills + text links across sections felt inconsistent. ONE pattern wins.
- ❌ Smaller 13px or larger 15px sizes — 14px is the canonical.
- ❌ Ghost/muted variant — even "Watch on YouTube" uses the same ink color as everything else.

### Other cross-section shared classes
- `.rail-outer / .rail` — carousel chassis (see `project_carousel_chassis.md`)
- `.thumb-play / .thumb-play-btn` — glassmorphic play overlay for video thumbnails. Used by GharTalks (`.gt4-card-thumb`) and Architecture & Design home-tour cards (`.ad4-card-img`). Canonical block lives in `styles4.css` near `.btn-text`. Hover scale + darken comes from per-section `:hover .thumb-play-btn` rules in the same canonical block (one rule, multiple parent selectors).

### Card eyebrow discipline — one category eyebrow per card
A card has ONE category eyebrow (`.intl4-card-cat` / `.ad4-card-cat` / `.hp-card-cat`) at the top of its body. Don't stack a second uppercase Inter eyebrow under it (e.g., `Editorial` followed by `Market story`, or `GharTalks` followed by `Episode 14`) — that's a duplicate-eyebrow anti-pattern. If supplementary info exists (episode number, story type, watch time), it goes in the foot row's byline/meta, not as a second eyebrow above the title. Caught in design-system.html's Card taxonomy section on 2026-05-08; cleaned up across Editorial and Podcast cards.

## Why
- One edit changes every section coherently — no more "fixed in one place but forgot the others" drift
- Fewer lines of CSS, easier to read
- Per-section prefixes were giving a *false sense of isolation* — the styles were identical anyway, so the only "isolation" was visual in the source code, not behavioral

## How to apply
- **Before adding a new `.X-title` / `.X-lead` / `.X-eyebrow` etc.** — check if a shared `.sec-*` (or other shared) class already does it. Use the shared one.
- **When you see two classes with identical rule blocks** — collapse to one shared class, delete the duplicates, update markup.
- **For section-specific layout** (grids, cards, rails, decorative chrome) — section prefix is fine, that's what it's for.
- **Same rule for JS** — shared behavior gets a shared helper (e.g., `initCarousel`), not per-section copies.

## Stacks with
- `feedback_letter_spacing.md` — no negative tracking on Gazpacho
- `feedback_code_quality.md` — conservative cleanup before removing
- `project_carousel_chassis.md` — example of shared chassis CSS done right
