# Auto-generation contract — Brand Profile + Person Profile

> The Ghar.tv portal ships thousands of profile pages (one per brand,
> one per person). Every page uses the SAME shared chassis. Only the
> **content** and the **tokens** in a per-tenant `:root` change from
> tenant to tenant. This doc is the authoritative brief for anything
> (a backend service, an AI generator, a human template-filler) that
> writes a new tenant.
>
> Companion docs:
> [BRAND-PROFILE-TOKEN-CONTRACT.md](BRAND-PROFILE-TOKEN-CONTRACT.md) —
> every token slot on the shared chassis, defaults, and dark-opt-in
> pattern. Templates to start from:
> [`_dev/templates/brand-profile-developer.html`](../_dev/templates/brand-profile-developer.html),
> [`_dev/templates/brand-profile-service.html`](../_dev/templates/brand-profile-service.html),
> [`_dev/templates/person-profile.html`](../_dev/templates/person-profile.html).

---

## 1. Brand Profile — required inputs

| Slot | Type | Notes |
|---|---|---|
| `slug` | kebab-case | Also the URL path segment: `/brands/<slug>` |
| `name` | string | Legal / trading name as displayed |
| `tagline` | string | Optional one-liner under the hero name |
| `city, state` | strings | Rendered in the hero meta row |
| `--brand` | hex | Primary brand accent, required |
| `--brand-soft` | hex | Soft variant for backgrounds, required |
| `hero_image` | url | 16:9 minimum, 1920 wide preferred; used behind `.bpr-hero__bg` |
| `logo` | url or inline SVG | Wordmark or symbol; goes in the logo tile |
| `logo_bg` | `white` \| `dark` | Which background the tile paints behind the logo. See [[feedback_brand_logo_background_contrast]] |
| `about_lead` | markdown | 1-3 sentences, editorial voice |
| `about_body` | markdown | 3-5 short paragraphs |
| `about_subs` | list of {eye, body} | Sub-pillars under About (e.g. "Craft", "Delivery"), 2-4 entries |
| `founders` | list of {name, role, portrait} | Portraits are REAL only. If unavailable, use monogram tile (see [[feedback_team_photos_real_only]]) |
| `certifications` | list of {name, logo} | Optional |
| `works` | markdown / WYSIWYG | Company work summary — used in `.bpr-work__wysiwyg` |
| `projects` | list of {name, city, year, image, url?} | Real projects with real images |
| `recognitions` | list of {title, source, year} | Awards, press, rankings |
| `contact` | `{website, phone, email, address, socials}` | All optional individually; card renders whatever exists |

### Optional inputs (light-vs-dark contact card)

Every brand tenant defaults to a LIGHT contact card (warm-white surface,
brand-color CTA button). A tenant that WANTS a dark card sets the
opt-in tokens in `:root`:

```css
:root {
  --brand: #003B71;             /* required */
  --brand-soft: #ccd6df;         /* required */
  /* Dark contact card opt-in — omit to keep light default */
  --contact-surface       : #12181f;
  --contact-ink           : #f5f2ec;
  --contact-ink-muted     : rgba(245,242,236,.72);
  --contact-eyebrow-color : rgba(245,242,236,.7);
  --contact-border        : rgba(255,255,255,.06);
  --contact-divider       : rgba(255,255,255,.10);
  --contact-cta-bg        : #f5f2ec;
  --contact-cta-fg        : #12181f;
  --contact-cta-hover-bg  : #ffffff;
  --contact-glow-alpha    : .35;
}
```

Full slot list: [BRAND-PROFILE-TOKEN-CONTRACT.md](BRAND-PROFILE-TOKEN-CONTRACT.md).

### Sections — always vs optional

| Section | Behaviour |
|---|---|
| Hero | Always. Even a sparse hero renders. |
| About | Always. `bpr-about__body` is required content. |
| Founders / Team | Optional. If `founders` is empty, the whole `.bpr-team` section stays `[hidden]` (CSS collapses it). |
| Materials | Optional. Materials tenants (Saint-Gobain, Asian Paints, Obeetee) enable; developers usually omit. |
| Certifications | Optional. |
| Work | Always. Every brand has something to say about their work. |
| Recognitions | Optional. |
| Projects (`.bpr-projects` / `.bpr-cities`) | Optional. |
| Timeline | Optional. |
| Spotlight (Films / GharTalks / Editorial / Intelligence / Events sub-groups) | Section always present. Each sub-group renders only if it has cards. Empty sub-group scaffolds MUST be removed, not left hidden. See [[project_templatization_completion_plan]] item 2 and [audit-visual-proof.mjs](../_dev/tools/audit-visual-proof.mjs). |
| Contact | Always. Card carries whatever contact meta the brand provided. |
| Micro-footer | Always. |

---

## 2. Person Profile — required inputs

| Slot | Type | Notes |
|---|---|---|
| `slug` | kebab-case | URL: `/people/<slug>` |
| `name` | string | e.g. "Ar. Hemal Shah" (title prefix optional but conventional) |
| `role` | string | e.g. "Founder, Horizon Architects" |
| `portrait` | url | REAL portrait. No person ships without one. See [[feedback_no_person_without_portrait]]. |
| `bio_lead` | markdown | 1-3 sentences |
| `bio_body` | markdown | 2-4 short paragraphs |
| `at_brand` | `{name, slug, logo?}` | Which brand they're primarily affiliated with, for the "Also at BRAND" card grid |
| `voices` | list of `{title, format, source, url, date}` | Industry Voices articles / interviews they authored or featured in |
| `contact` | `{website, phone, email, socials}` | Same shape as brand contact; renders whatever exists |

Person profiles currently DEFAULT to light contact card (warm-white
surface, ink CTA — `.pp-page` overrides `--brand` to `var(--ink)` by
default). Same token contract as brand profiles applies if a tenant
wants dark; see [BRAND-PROFILE-TOKEN-CONTRACT.md](BRAND-PROFILE-TOKEN-CONTRACT.md).

### Sections — always vs optional

| Section | Behaviour |
|---|---|
| Hero | Always. Portrait + name + role + reach chips. |
| Bio | Always. |
| Voices | Optional. Renders `.pp-voices-grid` if `voices` has entries. |
| Peers / Also at BRAND | Optional. Renders if `at_brand` has other people. |
| Contact | Always. |

---

## 3. Templates to start from

Do NOT hand-write a new tenant HTML from scratch. Start from one of
these templates and populate:

- **Brand — developer family** (`_dev/templates/brand-profile-developer.html`)
  Full Spotlight sub-groups populated with `placehold.co` sample cards.
  Best starting point for a developer brand (Godrej, Avirahi type).

- **Brand — service family** (`_dev/templates/brand-profile-service.html`)
  For architecture / materials / interiors service brands (Horizon,
  Saint-Gobain, Teearch type).

- **Brand — base** (`_dev/templates/brand-profile.html`)
  Neutral starting point. Sparser scaffolds than the two above.

- **Person** (`_dev/templates/person-profile.html`)
  Base person tenant. All 13 shipped person tenants started here.

### Live reference tenants (already shipped, can be diffed)

Brand: `brand-profile-horizon-architects.html` (dark contact opt-in +
canonical `.bpr-intel-card` chassis + full Spotlight),
`brand-profile-avirahi.html` (full Spotlight, mobile fixes applied),
`brand-profile-godrej-properties.html` (dark contact + Intelligence
cards). Person: `person-profile-hemal-shah.html` (canonical light
contact), `person-profile-tarun-motta.html`.

---

## 4. Design rules the generator MUST honour

These carry over from CLAUDE.md and the memory system. A generator
that ignores them will ship broken pages:

1. **Real assets only.** No fabricated stats, invented project names,
   or generated portraits. If a real asset is not available, use the
   canonical fallback: monogram tile for people, wordmark tile for
   brands, empty state for stats. See [[feedback_no_person_without_portrait]],
   [[feedback_no_fabricated_brand_precedent]], [[feedback_brand_assets_from_source]].
2. **No em-dashes anywhere.** See [[feedback_no_em_dash_ever]].
3. **No colored edge stripes on cards** — top/left/right/bottom. See
   [[feedback_no_top_accent_strip]] (rule extended 2026-09-02).
4. **Card ground is NEUTRAL.** Card surface never carries a brand tint;
   brand shows up in ONE bold moment (usually the CTA).
5. **Empty section-level `[hidden]` scaffolds must be populated OR
   removed.** Never ship an empty demo scaffold. Run
   `node _dev/tools/audit-visual-proof.mjs` before commit.
6. **Chassis before decoration.** Never fork a class into `bpr-hero--
   godrej`. Per-tenant differences go in the `:root` token block.
7. **Shared portal chrome is byte-identical.** Nav + bottom bar +
   off-canvas + footer come from `partials/` via `scripts/build-partials.mjs`;
   never hand-edit them in a tenant file.
8. **Fonts and asset paths use root-relative `/…/` URLs**, not
   file-relative. Every tenant file lives at project root; templates
   under `_dev/templates/` are auto-mapped by `serve.mjs` to their
   root URL.
9. **Images ship in modern formats + responsive widths + blur-up on
   ATF.** For every hero, portrait, or heavy grid image the generator
   lands, it MUST:
   (a) land the source PNG / JPG in the correct `brand_assets/`
   subfolder, (b) invoke `node _dev/tools/convert-images.mjs
   <subfolder>` so WebP + AVIF variants at 640 / 1280 / 2560 widths
   AND the LQIP + dominant-colour manifest
   (`brand_assets/image-manifest.json`) are refreshed, (c) author the
   markup as a full `<picture>` block per
   [docs/IMAGE-OPTIMIZATION.md](IMAGE-OPTIMIZATION.md) §2.3 with
   correct `sizes`, `loading` (`eager` + `fetchpriority="high"` for
   ATF, `lazy` for below), `decoding="async"`, and explicit `width` /
   `height` (CLS-safe), (d) for hero and portrait containers ONLY,
   read the manifest and inline `--dom` + `--lqip` plus the
   `imgfx-blurup` class per [IMAGE-OPTIMIZATION §3.2](IMAGE-OPTIMIZATION.md#32--the-container-markup)
   so ATF paints the image's own colours immediately and cross-fades
   to sharp. Below-fold grid images keep the shared skeleton shimmer
   from Level 1 — do not inline LQIP on cards (HTML weight blows up).
   The portal-wide graceful fade in Level 1 is already wired for
   every `<img>` — do not opt out with `no-imgfx` on content imagery.

---

## 5. Before publishing a new tenant

Run the audit toolkit:

```bash
node _dev/tools/audit-chassis-drift.mjs      # divergent inline CSS across tenants
node _dev/tools/audit-visual-proof.mjs        # empty [hidden] scaffolds
node _dev/tools/audit-token-coverage.mjs      # hardcoded colors that should be tokens
```

Open `/tenant-matrix` in the browser (served from
`_dev/reference/tenant-matrix.html`) — every tenant renders side-by-side
at desktop + mobile so a new tenant can be visually compared against
existing ones.

Take a Playwright screenshot at 1440 + 390 of every section on the new
tenant and diff against the reference tenant it's modelled on. Any
unintended visual difference should route back to the tenant's `:root`
tokens, never to inline `<style>` overrides.

---

## 6. Failure catalog — 15 patterns that keep re-appearing

Every one of these has happened multiple times. Each entry: symptom → root cause → fix. Read this section before writing any tenant.

**1. Wrong chassis (clone of a shipped tenant).** Symptom: hero looks developer-shaped when the brand is a studio, sections don't fit, hours of stripping. Root cause: cloned `brand-profile-godrej-properties.html` (or similar) as the base. Fix: START from `_dev/templates/brand-profile-{family}.html`. The PreToolUse hook at `.claude/hooks/brand-profile-guard.mjs` reminds you on every edit.

**2. Wrong chassis-family choice.** Symptom: developer template used for viz studio, or service template for a materials brand. Fix: pick family per `docs/COMPOSITION-RULES.md` taxonomy — developer / architect / interior / materials / furniture / lighting / finance / proptech / vastu. Vis-studio / boutique practice = `interior` or `architect`.

**3. Fabricated content.** Symptom: user catches invented team names, film titles, GharTalks episodes, editorial features. Fix: scrape the brand's own website (WebFetch), never invent. Empty-state > fake-state.

**4. Palette guessed.** Symptom: 2–4 wrong palette iterations before settling on the real one. Fix: `curl` the logo file to disk, Read the image tool-renders it, sample the accent hex from your visual. Text extraction of the brand site is UNRELIABLE.

**5. Wrong asset paths after slug rename.** Symptom: logo doesn't load, ambient graphic 404s. Fix: after slug rename, `grep -c` the old slug in the file — must be 0. Rename brand-assets folder + files to match. Verify with `curl` before commit.

**6. Shared CSS bug (topbar CTA dark on red).** Symptom: brand-red pill button has near-black text — unreadable. Root cause: shared rule `body:is(.pp-page, [data-brand-format])[data-theme="dark"] .bpr-topbar__cta { color: var(--brand-ink) !important }` overrides even `!important`. Fix (stopgap): per-tenant override at the same specificity forcing `color: #fff !important`. Fix (proper): update the shared rule so brand-red CTAs always take white text.

**7. Video-click layout shift.** Symptom: clicking `.bpr-mcard--video` swaps `<img>` for iframe; page jumps because media wrapper has no aspect-ratio. Fix: `.bpr-mcard__media { aspect-ratio: 16/9; overflow: hidden }` — TODO in shared CSS.

**8. Wrong film chassis for the content.** Symptom: `.bpr-film` (Godrej scale-scrub + caption row) leaves black space at the bottom; overlay chassis reads better. Fix: for a brand film use `.hv-block` (Horizon overlay style) — Gazpacho title + play disc + label ON the thumbnail. CSS in `dist/brand-profile.min.css`, JS in `/dist/hv-video.js`. Load GSAP + ScrollTrigger so hv-video.js applies its built-in scale-scrub.

**9. External `<img>` SVG can't animate.** Symptom: added CSS animation to `.foo-*` classes inside an SVG loaded via `<img src=".svg">` — nothing animates. Root cause: CSS from the parent document can't cross the shadow boundary an `<img>` imposes. Fix: INLINE the SVG when animation is needed.

**10. `currentColor` inheriting the wrong hue.** Symptom: inline SVG using `stroke="currentColor"` paints dark warm-brown when you wanted crimson. Root cause: parent inherited `color: var(--brand-ink)`. Fix: force `.bpr-hero__ambient { color: var(--brand) }` so currentColor resolves to the accent.

**11. Shared CSS wins on specificity even against `!important`.** Symptom: your override doesn't apply despite `!important`. Root cause: shared rule uses `:is()` or ancestor chain adding specificity. Fix: match or exceed with the same ancestor chain in the tenant selector.

**12. Empty "On Ghar.tv" sub-groups with placeholder cards.** Symptom: Films / GharTalks / Editorial / Intelligence / Events ship with placehold.co cards or fabricated titles. Fix: real Ghar.tv coverage OR add `hidden` attribute to the sub-group `<div>`.

**13. Modal branding reads old slug.** Symptom: contact modal heading reads "Contact StudiFOV" (old misspelling). Root cause: `data-brand="..."` attributes on trigger buttons contain the old slug. Fix: after slug rename, grep BOTH capitalization variants ("StudiFov" and "StudiFOV") and swap all references.

**14. Section reveal on scroll causes empty screenshots.** Symptom: full-page screenshot shows section eyebrows but no card content — IntersectionObserver hasn't fired. Fix (for verification only): scroll programmatically before screenshotting. Not a bug in the file — real users scrolling see the reveal fine.

**15. Delegated design to subagent → fabrication.** Symptom: subagent invented team names, picked wrong chassis, applied wrong palette. Root cause: 250-word brief for 13,000-line rewrite is insufficient context. Fix: only delegate content SWAPS where every fact is provided in the prompt. Never delegate chassis / palette / design decisions.

See `[[project_brand_profile_lessons_learned]]` memory for detailed diagnosis + fixes per pattern.

---

## 7. Change history

- **2026-09-08** — added §6 (failure catalog) codifying 15 recurring patterns from brand-profile sessions. Session 2026-09-07/08 (Studio FOV) exposed most of them.
- **2026-09-02** — initial version. Consolidates the templatization
  standard reached at the end of the brand + person profile work; ties
  together the token contract, the audit toolkit, and the shipped
  template files. See [[project_templatization_completion_plan]] for
  the pending follow-up items.
