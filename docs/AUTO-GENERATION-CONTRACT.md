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

## 6. Change history

- **2026-09-02** — initial version. Consolidates the templatization
  standard reached at the end of the brand + person profile work; ties
  together the token contract, the audit toolkit, and the shipped
  template files. See [[project_templatization_completion_plan]] for
  the pending follow-up items.
