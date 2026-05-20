---
name: Sections must be compact, not bloated like production index.html
description: Build sections lean — fewer parts, simpler layout, less vertical real-estate. Don't repeat the heavy-section problem from index.html.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**Sections in index4.html must be COMPACT, not bloated.** A new section is NOT a featured-spread + side-stack + pillar grid + actions row. That maximalist structure is exactly the problem the rebuild was meant to fix.

**Why:** User said on 2026-05-06: "A major problem you did was repeating the same problem from index.html which was huge sections which needed a compact or minified version with simpler layout." All 4 sections built (Editorial, GharTalks, Voices, GharEvents) were rejected partly because they each carried 3-4 parts (header + featured + grid + strip + CTAs), making them tower vertically — same heaviness the index4 rebuild is supposed to escape.

**How to apply:**
- Default to ONE primary content unit per section + minimal header + a single CTA. Not three.
- Cut features before adding them. If a section has both "featured X" AND "grid of Y" AND "always-on strip" AND "pillar row" — drop one or two parts.
- Compare the proposed section's vertical height to the hero. If the section is ~taller than the hero, it's probably too tall.
- Header + 3-up grid + CTA is a fine pattern. Header + featured + 3-up + strip + 4-pillar + CTA is too much.
- Think Airbnb section sizes (search-grid in viewport with breathing room) not BBC long-read sections.
- Reference brevity over reference comprehensiveness — design-system's `hp-cards` shows 6 card *types* but a real page only uses 1-2 types per section.
