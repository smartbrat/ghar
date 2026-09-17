---
name: brand-profile-work
description: MUST be loaded before ANY work on brand-profile-*.html or person-profile-*.html files. Carries the auto-generation contract, composition rules, chassis selection, palette-sampling rule, and content-scraping rule. Ghar.tv portal specific.
---

# Brand / Person Profile Work — Contract

**This skill is the enforcement layer for tenant work. Load it every time. Do not skip.**

## Hard rules — violate any, the work fails

1. **NEVER clone a shipped brand file** (`brand-profile-godrej-properties.html`, `brand-profile-horizon-architects.html`, etc.) as the base for a new tenant. Cloning drags in that tenant's chassis assumptions, colors, section order, and content, and the entire session becomes strip-and-repatch. This is the #1 recurring bug — do not repeat.

2. **START from the template skeleton** per `docs/AUTO-GENERATION-CONTRACT.md` §3:
   - `_dev/templates/brand-profile-developer.html` — for **developer** family (Godrej, Avirahi type)
   - `_dev/templates/brand-profile-service.html` — for **architecture / interior / materials / furniture / visualization / lighting / consulting** service brands (Horizon, Saint-Gobain, TEEARCH, Studio FOV type)
   - `_dev/templates/brand-profile.html` — neutral base
   - `_dev/templates/person-profile.html` — person base

3. **CHOOSE FAMILY from `docs/COMPOSITION-RULES.md`** — the file specifies for each brand category (developer / architect / interior / materials / furniture / lighting / finance / proptech / vastu) which sections render, in what order, at what priority, with which variant. Read the row for the tenant's category before writing markup.

4. **SAMPLE COLOR from the real logo file** — never guess.
   - `curl -sSL <logo-url> -o brand_assets/brands/{slug}/logo.png`
   - Read the file (image tool) to visually confirm the color
   - Add a record to `scripts/brand-palettes.mjs` (roles: primary, hover, text, ink, cta, ctaHover, alt, canvas, soft; logo + the brand's own site CSS, evidence in `src`), run `npm run build:palettes` (fails on any WCAG miss), stamp `<body data-palette="{slug}">` and link `/dist/brand-theme.css` last in `<head>`. NEVER inline color tokens on `:root` or `<main style>`
   - Text-extraction is unreliable for palette (Studio FOV was called "blue/teal" by extraction, actually crimson red)

5. **SCRAPE CONTENT from the brand's own site** — never invent.
   - Team names, project names, founding years, films, addresses, phone, emails — all real
   - If the site doesn't publish a fact, omit that section or fallback per the composition rule (empty state, monogram, wordmark tile)
   - Fabricated content is the #2 recurring bug

6. **DARK THEME LIVES IN SHARED CSS** — per-tenant dark opt-in is:
   - `body[data-theme="dark"]` on the `<body>` tag
   - Colors from the palette registry (`theme: 'dark'` in the record), never inline tokens
   - Dark surface overrides for `.bpr-story__colophon`, `.bpr-person`, `.bpr-location`, `.bpr-proj__*` live in the SHARED stylesheet, not per-tenant inline. If a shared surface renders cream on dark, fix the shared CSS, not the tenant.
   - **Person pages of a dark brand are dark automatically.** The generator reads `theme: 'dark'` from the parent brand's palette record and stamps `data-theme="dark"` on `<main>`. Never add `theme` to a company or person record (the build fails). Everything else (white-alpha hairlines, cream text tiers, flat Specialises In card, button + hover colours, editorial prose-only About) is shared CSS. Guide + verify checklist: `docs/AUTO-GENERATION-CONTRACT.md` §2 "Person pages of a dark brand".

7. **IMAGE PIPELINE** per `docs/AUTO-GENERATION-CONTRACT.md` §4.9:
   - Drop source PNG/JPG in `brand_assets/{subfolder}/`
   - Run `node _dev/tools/convert-images.mjs {subfolder}` for WebP/AVIF + LQIP manifest
   - Author markup with `<picture>` + responsive `sizes` + `loading` + explicit `width`/`height`
   - Hero and portrait ATF: inline `--dom` + `--lqip` from the manifest, add `imgfx-blurup` class

## Auto-generation flow — the correct sequence

Every new brand profile follows this exact sequence. Skipping any step re-creates the recurring bugs.

1. Ask the user for the brand's own website URL. If they don't have one, stop and ask — do not invent.
2. Load `docs/AUTO-GENERATION-CONTRACT.md` and `docs/COMPOSITION-RULES.md` in full.
3. Scrape the site — homepage + about + team + work + contact. Save the extracted content as a structured JSON blob in scratchpad.
4. Download the logo to `brand_assets/brands/{slug}/logo.png`, Read the image, sample the accent color hex.
5. Classify the brand's category (developer / architect / interior / materials / furniture / lighting / finance / proptech / vastu) and pick the correct template.
6. `cp _dev/templates/brand-profile-{family}.html brand-profile-{slug}.html`
7. Populate real content (name, tagline, palette tokens, hero, sections per composition rule, contact).
8. For each image referenced: download source → convert-images.mjs → `<picture>` markup with LQIP.
9. Add routes to `serve.mjs` + `vercel.json` (both, never one alone).
10. Run audits: `node _dev/tools/audit-chassis-drift.mjs && node _dev/tools/audit-visual-proof.mjs && node _dev/tools/audit-token-coverage.mjs`
11. Visual verify at 1440 and 390 viewports (both, always).
12. Commit; do not push unless user says "push".

## When a bug appears in a shipped tenant

Small mechanical edit (typo, single-line fix, one token swap) — proceed normally with a targeted Edit.

Whole-file rewrite, palette change, section addition, new-tenant creation — the checklist above applies, not a patch.

## Enforcement

A PreToolUse hook at `.claude/hooks/brand-profile-guard.mjs` injects a reminder into context whenever Write or Edit targets a root-level `brand-profile-*.html` or `person-profile-*.html`. Skipping the contract will be visible in the next tool call as a fresh reminder. Don't fight the hook — follow the contract.

## Chassis / component decision guide

Picked based on the tenant's real content (not aesthetic preference):

**Brand film (dedicated section after hero):**
- **Use `.hv-block` (Horizon style)** — full-bleed thumbnail with Gazpacho title overlay + play disc + label. Best for brand films. CSS in `dist/brand-profile.min.css`, JS in `/dist/hv-video.js`. Load GSAP + ScrollTrigger so hv-video.js applies its built-in scale-scrub scroll animation.
- **Avoid `.bpr-film`** (Godrej style) unless you specifically want the scale-scrub thumbnail with caption row below — leaves black space at the bottom that reads as broken.

**Sub-group video cards (in `#spotlight`):**
- Use `.bpr-mcard bpr-mcard--video hv-card` — same click-swap behavior via hv-video.js
- Ensure `.bpr-mcard__media` has `aspect-ratio: 16/9` locked to prevent layout shift when iframe replaces poster

**Hero graphic (ambient artwork):**
- If static/decorative → external `<img src=".svg">` is fine
- If it needs to animate → INLINE the SVG (CSS can't cross an `<img>` shadow boundary)
- Force `.bpr-hero__ambient { color: var(--brand) }` so `currentColor` inside inline SVG paints the accent

**On Ghar.tv sub-groups:**
- Films / GharTalks / Editorial / Intelligence / Events — populate with REAL Ghar.tv coverage or add `hidden` attribute
- Never ship placehold.co cards or fabricated titles

## Hard-earned patterns (from `[[project_brand_profile_lessons_learned]]`)

**15 failure modes catalogued** — read that file before starting. Highlights:
- Clone shipped file → all wrong; use skeleton template
- Fabricate content → user catches every time; scrape brand's own site
- Guess palette → three wrong iterations; download logo + Read image + sample
- Wrong slug path → verify with `curl` before commit
- Shared CSS bug (topbar CTA dark on red) → match specificity in tenant override, then fix shared
- Video click layout shift → `.bpr-mcard__media { aspect-ratio: 16/9 }`
- External img SVG can't animate → inline SVG needed
- Shared CSS wins on specificity → prefix override with same ancestor chain
- Fabricated Ghar.tv cards → real content OR hidden
- Modal `data-brand="..."` reads old slug → grep both cases after rename
- Section reveal on scroll causes empty screenshot → scroll programmatically before capturing
- Delegate design to subagent → produces fabrications; only delegate content swaps with full source in prompt

## Related

- `[[project_brand_profile_lessons_learned]]` — complete failure catalog
- `[[feedback_never_clone_shipped_brand_files]]` — hook enforcement
- `[[feedback_dark_tenant_color_hierarchy]]` — dark palette rules
- `docs/AUTO-GENERATION-CONTRACT.md` — authoritative contract
- `docs/COMPOSITION-RULES.md` — per-category section stacks
- `docs/BRAND-PROFILE-TOKEN-CONTRACT.md` — token slot registry
- `docs/BRAND-CAPABILITY-MATRIX.md` — feature × package matrix
- `_dev/reference/design-system.html` — component catalog
- `_dev/tools/audit-*.mjs` — audit toolkit
