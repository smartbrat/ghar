---
name: /design page — brief
purpose: Page-specific brief for redesigning Ghar.tv's standalone Architecture & Design vertical. Use this together with docs/rules/* and design-system.html.
---

# /design — Architecture & Design vertical

> "Homes worth talking about." India's most beautiful residential spaces and the minds that shaped them.

## What it is
Ghar.tv's standalone Architecture & Design vertical. It is **not** the homepage's *Architecture & Design section* (that's a single section on `index4.html`). It's a **dedicated editorial vertical** — magazine-grade, Architectural-Digest-style, the place readers go when they want depth on Indian architecture, interiors, vastu, home tours, and design guides.

## What it is NOT
- ❌ Not a property listing page
- ❌ Not a blog roll with date-sorted articles
- ❌ Not a Pinterest-style image grid
- ❌ Not a generic "Articles + Sidebar" layout
- ❌ Not a feature-listing page selling Ghar.tv services
- ❌ Not the homepage section (that's just the "Architecture & Design" rail on `index4.html` with class `.ad4-*`)

## Voice & tone
- **Editorial, considered, premium** — like *Architectural Digest India*, not like a real-estate listings site
- **Indian first** — Indian architects, Indian homes, Indian materials, Indian climate, Indian vernacular
- **People-forward** — designers and architects are protagonists, not just bylines
- **Substance over style** — 12-minute reads, not 90-second listicles
- **No fabricated data** — real architects, real projects, real materials. If we don't have it, the section omits it rather than invents it.

## Page structure (FLOW)
This flow comes from the previous attempt at `/design` and from `ghar.tv/design` in production. **The flow is approved** — what failed was the visual execution. Follow the new theme rules in `docs/rules/` and the design-system to rebuild the visuals.

### 0 · Universal navigation (top)
Same canonical desktop navbar + mobile bottom bar as everywhere else on the portal. Reuse from `index4.html`. **Do not reinvent.** Logo on left, universal search bar in middle, Post Property pill + Profile + Menu cluster on the right. Mobile: the four-tab bottom bar.

### 1 · Sub-nav / chapter strip (just below nav)
Horizontal strip of in-page anchors: `Designers · Architecture · Vastu · Home Tours · Guides · Interiors · Celebrity Homes · Featured Homes`. Sticky on scroll if it fits the rules (see `feedback_responsive_patterns.md`). Active link picks up the canonical section eyebrow treatment.

### 2 · Hero
A single editorial moment. **Not** a generic SVG of a house with floating colored topic cards (that was the failed attempt). Options to propose to the user before building:
- **Option A — Billboard quote** in the spirit of `hp-billboard` from design-system: a single Gazpacho headline carrying the vertical's promise, with one shape-as-window inline at display scale, on warm-white. Lead, then one `.btn-text` CTA pointing into the page.
- **Option B — Editorial split** — Gazpacho headline left, a single hero image (an Indian home worth featuring) right. No floating cards. No orbit dots. No animated SVG house.
- **Option C — Magazine cover** — full-bleed warm-white canvas, oversized Gazpacho hero (like the masthead of an issue), single image-mask shape carrying a real photograph. One CTA.

**Reject:** orbiting dashed circles, floating colored topic chips with random emoji-style icons, generic line-drawn house illustrations, multi-color floating "Architecture · 200+ articles" tags, the whole "AI-illustrated landing page" aesthetic. That's the failed attempt.

**Headline options for the page** (no emoji, no italics, no negative letter-spacing):
- "Homes worth talking about."
- "The houses, and the minds that shaped them."
- "What India is building, and how."

### 3 · Designers — featured editorial cards
Profiles of Indian architects/studios. **Not** a row of "logo plates on warm-white tiles" (that was the failed attempt — visually weak, all the cards looked the same, the logo treatment was generic).

The right move: reuse the **`.intl4-card` family from design-system Card Taxonomy** (image-bleed-to-edge with a graphic panel) or the **`.ed4-article` family** (magazine-style image-on-top with Gazpacho display headline). Featured designer becomes a hero card; 3 supporting designers in a row of `.ad4-card` (padded image, category eyebrow, title, byline + reading time).

Real names that exist: Hafeez Contractor, Sanjay Puri Architects, Studio Lotus, Morphogenesis, Bijoy Jain (Studio Mumbai). Use only what you have real photos/projects for. Don't invent.

### 4 · Architecture
Featured + 3 supporting cards. Reuse the **Architecture & Design `.ad4-*` family** from `index4.html`/`design-system.html`. The featured one is a horizontal `.ad4-card` style or the editorial `.ed4-article` with Gazpacho display headline. The 3 supporting are standard `.ad4-card`.

Sample story angles (from the previous attempt, reuse as content): *Biophilic Architecture India: Homes That Breathe · The Courtyard House Returns to Modern India · Sustainable Homes in India: A Builder's Guide · Net-Zero Homes: India's Next Building Revolution*.

### 5 · Vastu
3-card row, all equal. Reuse **`.intl4-card` style** (image-bleed with `.intl4-card-gfx` graphic panel) — Vastu is the natural place for **custom data-viz SVG** per card (compass rose, 8-direction wheel, room-zone diagram). This is one section where a graphic panel earns its place because the content is genuinely diagrammatic.

Sample stories: *East-Facing 2BHK Vastu Floor Plans · Kitchen Placement: Direction & Zone · Main Door Vastu: All 8 Directions Explained*.

### 6 · Home Tours
**Video-first.** 2-up grid: one video card (canonical `.thumb-play` glassmorphic disc overlay, 16:9 thumbnail) and one image-led tour. The video uses the **shared `.thumb-play` overlay** from design-system. Reuse the `.gt4-card` thumbnail pattern — it already exists.

Don't invent two parallel tour rows like the failed attempt did (one with `display:none` on a "card2 + side2" layout, one with the new "ht-grid" layout). Pick one structure: 2-up grid with video left, image right.

### 7 · Guides
Horizontal row cards (thumbnail left, text right) — this is the right pattern for guides because they're skim-able utility content, not long-form editorial. The previous attempt's `.guide-card` layout structure was actually correct — what was wrong was the visual treatment (rounded radius, generic shadows, generic arrow icons). Reskin using:
- Border-radius matching `--r` token from design-system
- Monochrome shadows on warm-white
- `.btn-text` style "Read the guide →" inside each card if a CTA is needed
- Inter typography matching the design-system

Sample guides: *Italian Marble vs Indian Granite · Smart Home Setup India: What It Costs · False Ceiling Types, Materials & Cost Guide*.

### 8 · Interiors
3 article cards. Reuse the **`.intl4-card`** or **`.ed4-article`** family. **NO logo plates here** — these are editorial articles, not designer profiles. Image, eyebrow, Gazpacho title, meta line.

### 9 · Featured Homes
Featured + 3 cards. Reuse the same **Architecture pattern** (featured horizontal `.ad4-card` + 3 supporting). **No dark theme** — the previous attempt added a "luxury" dark variant (`.fh-card`); reject that. Warm-white default applies. Color is earned at three levels (`feedback_color_semantics.md`); a "Featured Homes" section doesn't earn a tone shift.

### 10 · Newsletter / CTA
**Not** the dark hero card with radial gradients and a 2-input form on white-tinted glass (that was generic AI). Reuse the **footer subscribe pattern from `index4.html`** ("Stay Updated" with the community-orbit illustration), or build a **single-input email card** in the warm-white canvas with `.btn-text` style submit. Keep it calm and editorial. The dark theme on the previous attempt was unearned.

### 11 · Footer
Same canonical 4-layer footer as the rest of the portal. Reuse from `index4.html`. **Do not reinvent.**

## Patterns to reuse (from design-system + index4)
| What | Reuse from |
|------|-----------|
| Section header (eyebrow + title left, lead + CTA right) | `cr-head` (Composition Rule 02) |
| The one CTA | `cr-cta` (`.btn-text` only) |
| Container width | `cr-grid` (`clamp(1280px, 75vw, 1840px)`) |
| Featured card (Architecture) | `.ad4-card` family |
| Article card (Editorial) | `.ed4-article` family |
| Image-with-graphic card (Vastu, Intelligence) | `.intl4-card` family |
| Video thumbnail | `.gt4-card` + shared `.thumb-play` overlay |
| Logo placement | `cr-logo` (Composition Rule 05) |
| Navbar (desktop + mobile bottom bar) | `index4.html` nav4-* block |
| Footer | `index4.html` footer |
| Carousel chassis | `.rail-outer / .rail` |
| Tag-strip pills (if needed for filter rows) | `.tag-strip-*` pattern |

## Theme tokens (use these, no others)
```css
--warm-white: #faf7f2;   /* default page surface */
--ink:        #1a1714;   /* primary text */
--espresso:   #3a3530;   /* secondary text on warm-white */
--rule:       #ddd6cb;   /* borders, dividers */
--brand-red:  #ee324b;   /* logo, primary action only */
```
Plus the Brand tints (`--brand-rose / blush / petal / mist`) and Theme tones (`--turmeric / terracotta / sand / sage / indigo`) — earned, semantic. See `feedback_color_semantics.md`.

## What to absolutely avoid (failures from previous attempt)
1. ❌ Generic "AI illustration" hero — line-drawn house with floating colored topic cards
2. ❌ Multi-color emoji-style icons in pill chips
3. ❌ Random brand colors (orange, purple, teal, pink) used decoratively
4. ❌ Dark "luxury" theme on the Featured Homes section
5. ❌ Dark newsletter CTA with radial gradients
6. ❌ Two parallel sections with one set to `display:none` (Home Tours had this)
7. ❌ "Logo plate" cards as the designer profile pattern
8. ❌ Italic Gazpacho anywhere
9. ❌ Negative letter-spacing on Gazpacho headlines
10. ❌ Filled button CTAs in editorial sections (they should all be `.btn-text`)
11. ❌ "Join Now" button in the navbar (it doesn't exist on Ghar.tv — see CLAUDE.md §4.3)
12. ❌ Stock-photo Western faces in Indian editorial content

## Build order
Per `feedback_one_section_at_a_time.md`:
1. Propose visual approach for the **hero** with 2-3 options. Wait for sign-off.
2. Build the hero. Show output. Wait for sign-off.
3. Build **Designers**. Show output. Wait for sign-off.
4. Build **Architecture**. … and so on.
5. Don't batch. Don't ship "all sections" in one go and ask which to fix.

## Files to keep open while building
- `CLAUDE.md` — project rules
- `docs/rules/README.md` — start here, then read the listed files
- `docs/BRIEF-design-page.md` — this file
- `design-system.html` — the catalog (especially divisions 02 `cr-*` and 04 `hp-*`)
- `index4.html` — production reference
- `styles4.css` — the canonical stylesheet (`.sec-*`, `.btn-text`, `.thumb-play`, card families)
