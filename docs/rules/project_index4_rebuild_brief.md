---
name: Index4 rebuild brief
description: Complete handoff for building the new Ghar.tv homepage in index4.html — context, formula, reference, build plan
type: project
originSessionId: 34186053-2766-4b0a-84f5-0a0985bee3ac
---
# Ghar.tv Homepage Rebuild — Brief

Last updated: 2026-04-17. Old `index4.html` was a failed attempt — wiped and reset to a minimal starter. This brief is the single source of truth for the rebuild.

## What Ghar.tv is
India's Real Estate Discovery, Intelligence, Media and Events Platform. **Not a listing portal.** An understanding-first platform where people discover properties, read intelligence, consume media, attend industry events. Brand line: *Real Estate. For You.*

## The design formula
**Airbnb skeleton + Clickl soul.**
- UI architecture (search, filters, card grids, carousels, map, comparison) → Airbnb-derived patterns. Proven. Familiar to users.
- Voice, color, shape, type, copy → Clickl-inspired. Warm editorial.
- Per-component workflow: **keep the structure that works, reskin the surface.** Don't rebuild everything.

## Non-negotiable rules

### 1. Warm paper is the canvas
Body = `#faf7f2`. Every section inherits it. **Pure white is an object floating on paper** (inner cards, pills, search bars) — never a section surface. Any section-level `background: #fff` is a leak.

### 2. Five earned tones — no repeats, no adjacency
| # | Section | Tone | Hex | Why |
|---|---|---|---|---|
| 03 | Editorial | Indigo Mist | `#8e9aaf` | Ink of written voice |
| 06 | GharTalks | Espresso | `#3a3530` | Warm dark listening room |
| 08 | GharEvents | Turmeric | `#d4a048` | Ceremony, haldi, festival gold |
| 11 | VideoWorks | Ink | `#1a1714` | Deeper cinema dark |
| 14 | Community | Terracotta | `#c4775a` | Earth that holds people and brands |

Rhythm: colored at 3 · 6 · 8 · 11 · 14, gaps 2/1/2/2. Sections 4 (Intelligence) and 5 (Architecture & Design) stay warm paper — A&D uses colored cards INSIDE (terracotta/sand frames per featured home). Summary: **11 warm paper · 5 earned tones · 0 repeats · 0 rainbow**.

### 3. Shape is a glyph
Nine canonical house-shapes are typography. They live inside sentences, prefix categories, open quotes, mask photos. Never decoration. Never with the logo.

### 4. Stories, not specs
Every line written for the person reading. "A new home story starts with 5 new matches" beats "5 new listings match your filter."

### 5. The product is a polite guest
UI participates in the room — warm-paper surfaces into the product layer too. No cold SaaS dashboards.

## The reference artifact
**`d:\WORK\ghar-claude\design-system.html`** — scroll to the `hp-*` block (bottom third of the file). 12 designed components that encode every rule as a pattern ready to copy:

- **hp-voice** — 5-rule manifesto
- **hp-score** — section rhythm table with all 16 sections + summary
- **hp-glyph** — shape-as-typography (4 exhibits)
- **hp-cards** — 6 card types sharing one DNA (property, editorial, podcast, event, person, intel)
- **hp-data** — stat+shape-grid, histogram, growth bars
- **hp-principles** — 8 numbered rules
- **hp-nav** — desktop navbar + mobile bottom bar + off-canvas
- **hp-hero** — three-panel composition (consumer center + 4 B2B sides)
- **hp-notify** — notification, live search, saved state, tooltip — all story language
- **hp-b2b** — SuperPro + Developer Mandate (warm-voice authority flex)
- **hp-footer** — 4-layer (subscribe + brand bar + 6-col grid + legal)

**Reach for these patterns. Don't invent.**

## Current state of index4.html
Minimal starter: HTML5 scaffold, preconnect to Google Fonts, links to `gazpacho.css`, CSS custom properties for the full design system (foundation + 5 earned tones + accents + brand red family + spacing tokens), base element resets, `.wrap` container helper (max-width 1280px), `.display` and `.eyebrow` type utilities. Empty `<body>` with a build-header comment.

## Source material in index.html
The current production homepage. Airbnb-derived patterns work well — especially **search (confirmed good by user)**, filter pills, some card layouts, carousel behavior. Audit section-by-section: keep structure, reskin surface.

Related files:
- `main.js` (current homepage logic) · `styles.css` (current styles) · `ghar-core.css` (ATF-critical CSS from optimization pass)
- `main4.js`, `styles4.css` — artifacts of the previous failed index4 attempt. Decide per-section whether to reuse logic or reset. Likely reset styles4.css entirely; main4.js may have reusable JS (GSAP, carousel helpers).

## Section-by-section build order (hp-score rhythm)

| # | Section | Surface | Notes |
|---|---|---|---|
| — | Nav | warm | Desktop pill + mobile bottom bar + off-canvas |
| 01 | Hero + Search | warm | Three-panel: B2B left (Talks/Events) + consumer center + B2B right (Video/Brand) |
| 02 | ecoForYou | warm | 4 vertical cards: Buyers & Owners · Brokers · Developers · Brand Partners |
| 03 | Editorial | **Indigo Mist** | Featured long-read + article grid, ink voice |
| 04 | Intelligence | warm | 3-card intel grid (stat+shape-grid, histogram, growth bars) |
| 05 | Architecture & Design | warm | Colored CARDS inside (terracotta/sand/clay frames per featured home) |
| 06 | GharTalks | **Espresso** | Featured episode + podcast carousel on warm dark |
| 07 | Industry Voices | warm | Quote-led written perspectives, serif-forward |
| 08 | GharEvents | **Turmeric** | 4 signature franchise events on warm gold |
| 09 | SuperPro | warm | Broker authority — tight hierarchy, dense proof |
| 10 | Developer Mandate | warm | End-to-end marketing — competence via clarity |
| 11 | VideoWorks | **Ink** | Film craft — cinema dark |
| 12 | Brand Connect | warm | Partnership premium |
| 13 | Creator Network | warm | People-forward portraits |
| 14 | Community | **Terracotta** | Brands + People directory on clay warmth |
| 15 | Services cluster | warm | Ghar Finance · Design · Move — trio of service cards |
| 16 | Tools | warm | EMI, stamp duty, converters — desk tools on paper |
| — | Footer | warm | 4-layer: subscribe + brand bar + 6-col grid + legal |

## Tooling
- Server: `node serve.mjs` → http://localhost:3000
- Screenshot scoped: `node screenshot-scroll.mjs URL SELECTOR LABEL`
- Screenshot full: `node screenshot-fullpage.mjs` (output often too large — prefer scoped)
- Open index4 preview: http://localhost:3000/index4.html

## Working agreement (from memory)
- Discuss before building major sections — present approach, get approval, then code
- No unsolicited changes
- For GSAP/motion: `transform` + `opacity` only, never `transition-all`
- 24px grid gaps everywhere
- Mobile-first; validate at 390px before desktop
- Touch targets minimum 44px
- Real content only — no fabricated statistics or fake project names
- Indian/Asian faces when human subjects appear; if unavailable, use property photos or data imagery instead

## Next action
Start the build with Nav + Hero. Discuss approach first, then code. Screenshot as each section lands.
