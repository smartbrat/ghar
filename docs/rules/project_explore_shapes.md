---
name: Explore shapes theme build
description: design-system.html brand identity page — warm-white canvas, Clickl logo discipline, 9 shapes, 16-color Indian earth palette
type: project
originSessionId: 0fabd401-bf22-4e71-b09e-558b232fb498
---

## design-system.html — Ghar.tv Brand Identity / Design System Page

Clickl-inspired (by Unikorns on Behance) blended with Airbnb UI simplicity. This is the brand reference doc, not a product page.

### Canvas Rule (non-negotiable, 2026-04-17)
- **Body = warm-white `#faf7f2`.** Every section surface inherits warm-white.
- **Pure white `#fff` is a deliberate exception, NOT a default.** Only appears as inner cards/UI floating on the warm-white surface (the Clickl pattern: white objects on warm canvas).
- Any section-level `background: #fff` is a leak and must be removed.

### Current Page Structure (after 2026-04-17 rebuild)
1. **Top brand stack**: header, palette, shapes, masks, color-cards, billboard, brand-marks, quotes, stats, cards, social, community (sand), combo (sage closer — "Real Estate. For You.")
2. **Middle `bi-*` Brand Identity stack**: divider, logo, colors, rules (clear space + don'ts), type, imagery, voice, scale, apps (Clickl phone hero + 4 committed-tone tiles), restraint
3. **Bottom `hp-*` Homepage Playbook stack** (added 2026-04-17) — the complete implementation guide for the homepage rebuild. 12 sections:
   - **hp-divider** — "Home. The playbook." opener
   - **hp-voice** — 5-line manifesto with shape-as-glyph ("The house 🏠 is a glyph")
   - **hp-score** — 16-section rhythm map with 5 earned tones + summary card
   - **hp-glyph** — 4 exhibits proving shape = word (noun / category / quote / photo window)
   - **hp-cards** — 6 card types (property, editorial, podcast, event, person, intel) with shared DNA
   - **hp-data** — Data patterns (stat+shape-grid, histogram, growth bars)
   - **hp-principles** — 8 numbered rules + closing line "A homepage isn't a screen. It's an opening chapter."
   - **hp-nav** — Desktop navbar + mobile bottom bar + off-canvas menu
   - **hp-hero** — Three-panel composition (B2B sides + consumer center)
   - **hp-notify** — Micro-UI in story language (notification, live search, saved state, tooltip)
   - **hp-b2b** — SuperPro + Developer Mandate cards demonstrating the warm-voice authority flex
   - **hp-footer** — 4-layer footer (subscribe with orbit visual, brand bar, 6-col grid, bottom bar)

### Section Rhythm Rule (2026-04-17)
Homepage has 16 sections. **5 earn colored surfaces, 11 stay on warm paper. No two colored sections are adjacent** — every earned moment breathes.

| Section | Tone | Why |
|---|---|---|
| 03 Editorial | Indigo Mist #8e9aaf | The ink of written voice |
| 06 GharTalks | Espresso #3a3530 | Warm dark of a listening room |
| 08 GharEvents | Turmeric #d4a048 | Indian ceremony, haldi, festival gold |
| 11 VideoWorks | Ink #1a1714 | Deeper dark of a cinema |
| 14 Community | Terracotta #c4775a | Earth that holds people and brands |

**No color used twice. No adjacency.** Rhythm: colored at 3 · 6 · 8 · 11 · 14, gaps of 2/1/2/2. Intelligence (04) and Architecture & Design (05) stay warm paper — A&D uses colored cards INSIDE the section (terracotta/sand frames per featured home) rather than a section-level tone.

### Removed 2026-04-17
Entire "Theme in Action" (`ex-*`) block + `palette-compare` section — ~1326 lines deleted. Residue from the failed "everything on white" experiment.

### 9 Canonical Shapes
All shapes use `viewBox="0 0 200 200"`. Shapes 1–5 and 7–9 use `stroke-width="28" stroke-linejoin="round"`. Shape 6 is fill-only with cubic-curve geometry. Every shape's silhouette touches the same outer envelope (visible top ≈ y=12, visible base y=184, visible sides x=10/190) so they read as one icon family at the same size and proportion.

1. **Classic** (Ink) — centered peak: `M 100,26 L 176,82 L 176,170 L 24,170 L 24,82 Z`
2. **Peak-left** (Turmeric) — asymmetric left: `M 62,26 L 176,82 L 176,170 L 24,170 L 24,68 Z`
3. **Peak-right** (Sand) — asymmetric right: `M 138,26 L 176,68 L 176,170 L 24,170 L 24,82 Z`
4. **Manor** (Terracotta) — tall body, gentle pitch: `M 100,26 L 176,72 L 176,170 L 24,170 L 24,72 Z`
5. **Saltbox** (Espresso) — peak offset right + long sweeping left slope: `M 124,26 L 24,110 L 24,170 L 176,170 L 176,84 Z`
6. **Chimney Cottage** (Sage) — fill-only cubic-curve cottage with chimney notch: `M 22,184 C 15,184, 10,178, 10,170 L 10,80 C 10,73, 13,68, 18,64 L 113,12 C 120,7, 129,8, 133,14 C 136,17, 137,22, 137,27 L 137,58 C 137,63, 139,67, 143,69 C 147,70, 150,69, 154,66 L 173,49 C 181,42, 190,48, 190,59 L 190,170 C 190,178, 185,184, 178,184 Z`
7. **Lean-left** (Indigo Mist) — asymmetric tilt: `M 58,26 L 176,88 L 176,170 L 24,170 L 24,78 Z`
8. **Single-slope Shed** (Brand Rose) — corner peak top-left: `M 24,26 L 176,86 L 176,170 L 24,170 Z`
9. **Flat Modern** (Brand Blush) — corner peak top-right: `M 24,64 L 176,26 L 176,170 L 24,170 Z`

### Shape Usage Rules
- Shapes appear in only **3 contexts**: inline with headlines, photo masks (arch/gable cutouts), Color Cards pattern (2x2 theme color + masked photo).
- Never decorative background noise. Never with the logo.
- All shapes use exact canonical paths — no invented shapes.
- Masked images use `<mask>` with same stroke technique.
- Semi-transparent shapes on dark backgrounds use `stroke="none"`.
- Inline elements sized ~1.05-1.15em with `top: -0.16em to -0.18em`.
- Each shape in grid uses a UNIQUE color — zero repeats.

### Per-Tile Rule (Clickl)
Each colored tile commits to ONE tone, with WHITE UI content floating on top. Never ink-on-color or color-on-color stacking. No rainbow-mix within a section.

### Logo Discipline (Clickl-exceptional)
- Logo NEVER pairs with decorative shapes — shapes kill the logo.
- Monochrome only: black on light tones, white on black. No color-matched variants.
- Logo stays constant; the surface changes across the palette.

### Tiles
- Float — no borders.
- No border-top accent bars (explicitly disliked).

### Color System (16 colors)

**Foundation:**
- White #ffffff — inner cards only
- Warm White #faf7f2 — body canvas, default section bg
- Rule #ddd6cb — borders, dividers
- Muted #6a6a6a — secondary/muted text (WCAG AA 5.41:1 on white)
- Espresso #3a3530 — dark secondary, small text on white
- Ink #1a1714 — primary text, headings

**Brand & Accents (Brand Red family):**
- Brand Red #ee324b — CTAs, primary actions only
- Brand Rose #f29490 — category labels, featured text
- Brand Blush #f5b4b0 — accent borders, article card left borders
- Brand Petal #f9d2d0 — tag backgrounds, badge backgrounds
- Brand Mist #fce8e6 — large section backgrounds

**Theme Colors (Indian earth — ownable, deliberate moments not decoration):**
- Turmeric #d4a048 — warm gold
- Terracotta #c4775a — earthy red-brown
- Sand #d4b896 — neutral warm
- Sage #a8b5a0 — cool green accent
- Indigo Mist #8e9aaf — cool blue-grey accent

### Fonts
- Display: Gazpacho Bold (from gazpacho.css, base64 embedded) — editorial expression
- Body: Inter (Google Fonts)

### Why Warm-White "Adds Beauty"
Temperature-matches the earthy palette (sand/terracotta/turmeric), reads as paper/editorial rather than clinical screen, reduces glare, lets colored tiles feel like deliberate objects on a surface rather than panels on a white void.
