---
name: Airbnb skeleton + Clickl soul
description: Formula for the homepage rebuild — Airbnb UI patterns with Clickl-inspired warm editorial voice
type: feedback
originSessionId: 34186053-2766-4b0a-84f5-0a0985bee3ac
---
**Airbnb gives us the skeleton. Clickl gives us the soul.**

**Why:** User confirmed (2026-04-17) that Clickl doesn't give enough UI-pattern clarity for a full product rebuild, but Airbnb does. Existing index.html components that followed Airbnb — especially the search — are already "good enough" functionally. What's missing is the brand skin. Clickl's strength is voice/mood/palette, not component specs.

**How to apply:**

UI architecture layer (Airbnb-derived):
- Search bar patterns · filter pills · card grids · carousels · map interaction · comparison tools
- Responsive breakpoints and mobile behavior
- Navigation conventions (hamburger placement, profile icon, primary CTA)
- Discovery flows, listing detail pages, lead forms

Voice/skin layer (Clickl-inspired):
- Warm paper canvas (#faf7f2) — body and most sections
- Gazpacho serif for headlines and editorial moments
- Shape-as-glyph in type (house-silhouettes mid-sentence)
- 5 earned tones (Indigo Mist / Espresso / Turmeric / Ink / Terracotta), each on one section only
- Story-language copy ("a new home story starts with 5 new matches")
- Editorial proof cards, dense-hierarchy B2B flex

**Rebuild workflow per component:**
1. Is this UI pattern functionally right (matches Airbnb / discovery conventions)?
   - **Yes** → keep structure, reskin surface (warm paper, serif headings, shape glyphs, copy rewritten in story language)
   - **No** → replace the pattern entirely
2. Keep-list candidates from current index.html: search bar (confirmed by user), filter pills, card layouts that work, carousel patterns
3. Replace candidates: anything that reads as cold SaaS, uses default Tailwind blue/indigo, has no editorial voice, uses generic stock images

**Not:** start index.html from zero. **Yes:** audit component-by-component; keep what functions, re-dress what doesn't wear the voice.
