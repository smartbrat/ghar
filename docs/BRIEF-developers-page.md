# BRIEF — For Developers Page (`/developers`)

> Handoff brief for building the dedicated **Developers** vertical page on Ghar.tv.
> Companion to `BRIEF-brokers-page.md` — same template, same design system, same disciplines.
> Prepared 2026-06-20.

---

## 0. How to use this brief

This is the single source of truth for the page. Read it fully before building. It combines:
- The **product positioning + rules** from `CLAUDE.md` and accumulated project decisions.
- The **design system** the live homepage (`index.html`) uses — which this page MUST match.
- The **content/understanding** carried over from the existing `developers.html` reference (see §1) and the rich narrative saved from the homepage build iterations (folded into §7).

If anything here conflicts with the older `developers.html` file, **this brief wins.**

The homepage already has a finished **For Developers** section (`#developers` in `index.html`). That section is the *gateway*; this page is the *full story*. Your build must feel like the same product the visitor just scrolled past — same canvas, same type, same calm.

---

## 1. ⚠️ How to treat the existing `developers.html`

`developers.html` was built early (same lineage as the old `brokers.html`) and then had content added during the homepage build. It is in the repo **for content and understanding ONLY.**

**DISCARD its design completely.** Do NOT carry over any of:
- ❌ Its dark **navy `#162233` + gold `#c9a84c`** theme — the current system is **warm-white `#faf7f2`**.
- ❌ Its fonts (**Playfair Display / DM Sans / DM Mono**) — the system is **Inter + Gazpacho**.
- ❌ Its full-screen dark sections, **red eyebrows** (eyebrows are NEVER red), grid-overlay hero, gold accents.
- ❌ Its nav, fixed top bar, sticky mobile CTA bar, or any component styling.

**Use it only to understand** what the developer offering contains (the three service lines, the GharEvents line-up, the mandate workflow, the FAQ themes, the copy angles). Everything visual is rebuilt from scratch on the current design system (§4).

**Also do NOT carry over (discipline — see §3). The old page violates these and they must not survive the rebuild:**
- ❌ The **fabricated testimonials** ("Marketing Head, Tier-1 Mumbai developer", "17 site-visits in a single weekend… 9 NRI", "Sales Director", "Managing Director" — all invented).
- ❌ The **fabricated stats**: `650+ cities`, `1000s of channel partners`, `1×/2×/3× outcomes`, `90 days to impact`, `30–45 days speed to launch`, `first qualified leads within 10 days`. None of these are real — **no active mandates exist yet.**
- ❌ The **competitor comparison table** ("Agency · In-house · Ghar.tv"). Even though it doesn't name brands, it's a competitive call-out built on invented capability claims. Rebuild as a *what's-included* story, not a vs-table (§7-G).
- ❌ Hard sales language and the `Zybeq Ventures` legal line in the footer (use the standard site footer instead).

---

## 2. The positioning that governs everything

Ghar.tv for developers is **not "another vendor" and not "a portal you advertise on."** It is an **integrated marketing partner that understands real estate from carpet area to closing** — one team accountable for strategy, content, distribution, and reporting under a single mandate (or any standalone service).

- ❌ Banned framing: "buy a listing", "advertise your project on our portal", "lead packages", agency-beauty-contest language, anything that reduces Ghar.tv to media space.
- ✅ Correct framing: *"one integrated mandate or any standalone service, delivered by a team that has closed units, not just ads"*, *"your project woven into the platform buyers already trust"*, *"strategy through distribution, one partner, full accountability."*

**Positioning line (live homepage H2):** *"The marketing your project deserves."*
**Tone:** Intelligent, premium, editorial, confident — but welcoming and developer-first, never competitive or salesy.

**The platform advantage (the real differentiator — internalise it):**
> A traditional agency runs your campaign. Ghar.tv makes your project part of a living media ecosystem — editorial coverage, intelligence reports, event showcases, video distribution. Your project isn't just advertised. It's woven into the platform buyers already trust.

That ecosystem is literally the homepage orbit graphic: **Your Project** at the hub, surrounded by **VideoWorks · Microsite · GharEvents · Intelligence · GharTalks · Editorial.** Use the same six-spoke mental model on this page.

---

## 3. Discipline (non-negotiable)

- **No fabricated statistics.** No active mandates exist yet, so there are **no results, no case studies, no performance numbers** to show. If a number is needed and unknown, change the metric rather than invent a figure. Defensible market facts (e.g. category context) are fine; invented performance claims are not. Stats, where unavoidable, read as early-stage truth — not `50,000+`-style inflation.
- **No fabricated project names.** Use `Your Project` / anonymous placeholders in every mockup (microsite, event booth, film thumbnail) — exactly as the homepage does.
- **No fake testimonials or fake developer names.** Until real quotes exist, the page has **no testimonial section.** Don't invent one.
- **No competitor names** in user-facing copy (99acres, Housing.com, MagicBricks, etc.) — internal understanding only. No vs-tables built on invented claims.
- **Brand red `#ee324b` ≤ ~5% of any view** — CTAs, active/hover, brand identity only. Never on eyebrows, tags, dots, borders, or decoration.
- **Product names stand alone** — `VideoWorks`, `GharTalks`, `GharEvents`, `Project Marketing`, `Mandate`. Never "VideoWorks · Studio" or "GharTalks · Show". The name IS the brand.

---

## 4. Design system — must match the live homepage (`index.html`)

### Canvas & surfaces
- **Page canvas = warm-white `#faf7f2`.** White `#ffffff` is reserved for *floating objects* (cards, pills, search bars) — never a full section background.
- ⚠️ `CLAUDE.md §2.1` lists `--bg: #ffffff`, but the **live page canvas is warm-white `#faf7f2`**. Match the live page so this page feels continuous with the homepage the visitor arrived from. White is allowed on inner pages where it genuinely serves the design (e.g. the Project Marketing card is pure white + hairline border) — but default to warm-white.

### Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | Headings, primary text |
| `--muted` / `--faint` | `#6a6a6a` | Body, eyebrows, meta |
| `--rule` | `#e8e8e8` | Borders, dividers |
| `--accent` (brand red) | `#ee324b` | CTAs / active / hover / brand only (≤5%) |

**Earned theme tones** — rotate by *meaning*, not decoration (terracotta is NOT a default). The homepage section uses all five exactly once, mapped to the surfaces:
`--turmeric #d4a048` (VideoWorks / cinema) · `--terracotta #c4775a` (Microsite / brand warmth) · `--sage #a8b5a0` (GharTalks / studio) · `--indigo #8e9aaf` (GharEvents / evening event) · `--sand` (neutral panel). Keep this mapping if you re-use the surfaces.

### Typography
- **Inter** for everything (body, UI, labels, nav, CTAs).
- **Gazpacho Bold** for large display headings ONLY. Default tracking — **never negative letter-spacing on Gazpacho, never italic Gazpacho.** Numbers/prices ≥14px display use Gazpacho 700.
- Eyebrow labels: Inter, 10px, weight 600, `letter-spacing .1em`, uppercase, color `--faint` — **never red** (the old page got this wrong).
- ⚠️ `@font-face` (Inter block) + the `gazpacho.css` link must live **inline in this page's `<head>`**, not only in `styles.css` — otherwise the page silently falls back to system sans. Copy the head block from a current standalone page (e.g. `design.html`).

### Spacing & grid
- Section wrapper: `max-width: var(--max-w); margin: 0 auto; padding: var(--pad-v) var(--pad-h)`.
- Homepage container = `clamp(1280px, 75vw, 1840px)`. **24px grid gaps everywhere.** 8px spacing scale.
- **Mobile-first, non-negotiable.** Validate at 390px first. Touch targets ≥44px. Desktop via `@media(min-width:744px)`.

### Inner-page navigation (`body.simple-nav`)
Use the simplified inner-page nav, NOT the homepage three-panel hero nav:
- Single **760px search pill at every viewport**, 56px tall, 80px nav height.
- **No scroll animation** on the nav.
- Search modal opens as a **centered card on desktop**.
- Reference implementation: `design.html`. Use it for the nav shell, and re-use the **shared chrome (nav + footer + modals) byte-identical** — copy-paste verbatim, don't re-style per page.

### Anti-generic guardrails
No default Tailwind blue/indigo. Layered, color-tinted shadows (never flat `shadow-md`). Animate only `transform`/`opacity`, never `transition-all`. Every clickable element gets hover + focus-visible + active. **Card hover = border/shadow/transform, never a background gradient.** **Text links never go red on hover — motion only (gap widen + arrow shift), color stays ink.**

---

## 5. Where this page sits

The homepage **For Developers** section (`#developers` in `index.html`) drives traffic here via **two distinct destinations** — your build must satisfy both:

| Homepage link | Destination | Visitor expects |
|---|---|---|
| Header CTA `Explore developer solutions →` | **`/developers`** | The full developer vertical (this page) |
| Project Marketing card → `Explore Project Marketing →` | **`/developers/project-marketing`** | The Project Marketing service in depth (§8) |

> Build order: **`/developers` (hub) first**, then `/developers/project-marketing`.

The homepage section itself is: eyebrow `For Developers` → Gazpacho H2 *"The marketing your project deserves."* → lead *"Strategy, films, brand stories, microsites, editorial and events — one integrated mandate or any standalone service, delivered by a team that has closed units, not just ads."* → LEFT a **radial 6-node orbit graphic** (Your Project hub + VideoWorks · Microsite · GharEvents · Intelligence · GharTalks · Editorial) → RIGHT the **white Project Marketing card** (6 services + CTA). Carry these exact words and this exact ecosystem framing forward.

---

## 6. Brand atoms you'll re-use (don't reinvent)

These already exist in `design-system.html` / `styles.css` — **grep first, reuse verbatim** (Reuse-First Protocol). The page should not introduce new prefixes for chassis that already exist.

- **`feat-list`** — the canonical icon + title + one-liner list used by the Project Marketing card. Reuse for any "what's included" list.
- **`btn-text`** — bordered pill, for the **section's primary CTA**.
- **`btn-link`** (+ `btn-link--gap-top`) — text + arrow, no border, for **card-internal / inline CTAs**. Never mix the two roles.
- **`sec-head` / `sec-eyebrow` / `sec-title` / `sec-lead`** — the shared section header chassis. Use it for every section header on the page.
- **Product wordmarks** — `VideoWorks`, `GharTalks`, `GharEvents` render with their existing treatments; `Project Marketing` is a Gazpacho 700 wordmark in **terracotta**. Brand marks never change on hover.
- **The orbit graphic** (`dm4-orbit-svg`) — if you want the ecosystem visual on this page, lift the existing SVG rather than redrawing it.

---

## 7. Page content blueprint (`/developers`)

The homepage section is a *gateway*. This page is the *full story*. Suggested section order — adapt, but keep it **compact and editorial: one primary unit per section**, not stacked maximalism. Build one section at a time and get sign-off before the next.

### A. Hero
- Gazpacho headline carrying the positioning. Re-use or evolve the homepage line: *"The marketing your project deserves."* Alternative angles from the saved narrative: *"Everything your project needs. Under one roof."*
- Lead paragraph (authority / partnership framing, not vendor framing): the homepage lead works verbatim — *"Strategy, films, brand stories, microsites, editorial and events — one integrated mandate or any standalone service, delivered by a team that has closed units, not just ads."*
- Primary CTA: **`Partner with us →`** (enquiry — see §10). Optional secondary: `Explore services` (jumps down the page).
- No fabricated stat strip under the hero (the old page's `650+ / 1000s / 5 / 1` bar comes out).

### B. The integrated mandate (the core idea)
The single most important concept: **one relationship, full accountability.** Use the saved three-paragraph narrative (reworded to taste):
> When you mandate Ghar.tv, you get a dedicated team that understands real estate from carpet area to closing. We start with strategy — your buyer, your market, your positioning. From there, everything flows: VideoWorks produces your cinematic content; our editorial team weaves your project into Ghar.tv's content network; your project gets a stage at India Property Show; and we build you a dedicated microsite that converts the audience these channels generate. Every month, you get performance data and we sharpen the strategy together. **One relationship. Full accountability.**

Pair this with the **ecosystem orbit graphic** (reuse from homepage): *Your Project* hub → VideoWorks · Microsite · GharEvents · Intelligence · GharTalks · Editorial.

### C. Three service lines
The offering resolves into three engageable service lines (each standalone OR bundled in the mandate). This is the spine of the page:

1. **Project Marketing** — strategy → positioning → digital → leads → CRM → sales enablement. (Deep page at `/developers/project-marketing`, §8.)
2. **VideoWorks** — cinematic project films, walkthroughs, drone/aerials, developer brand stories, buyer stories, reels, photography, distribution. Links to the VideoWorks vertical.
3. **GharEvents** — proprietary event IPs putting the project in front of curated, qualified buyers (§F). Links to the GharEvents vertical.

Frame as "engage one, or all three under one mandate."

### D. Project Marketing — the six services (canonical, matches the live card)
Use the **exact six** from the homepage Project Marketing card, with the `feat-list` chassis. These are the locked operational services — don't substitute:

1. **Positioning & brand** — Market study, project positioning, brand foundation.
2. **Digital marketing** — Search, display and programmatic across India.
3. **CP Network** — Activated channel-partner network across launch cities — onboarding, training and incentives.
4. **Lead generation** — AI buyer matching, qualified enquiry delivery.
5. **CRM integration** — Lead routing, follow-up workflows, dashboards.
6. **PR & editorial** — Industry Voices, GharTalks and curated coverage.

(The richer, longer-form descriptions for each — Strategy & Positioning, Cinematic Production, Editorial Presence, GharEvents Stage, Project Microsite, Intelligence & Reporting — are saved in the project memory `Developer Mandate dedicated page content` and can be used to expand the deep page in §8.)

### E. What you plug into (the ecosystem advantage)
A short editorial block on the surfaces a mandated project lives across — the credibility row, reframed as platform reach, NOT as invented stats:
- **VideoWorks** — cinematic films, walkthroughs, brand stories.
- **Microsite** — a branded, performance-built digital home for the project (placeholder URL `your-project.ghar.tv`, no fake project name).
- **GharTalks** — founder/leadership conversations on India's real estate podcast.
- **Intelligence** — market context, benchmarks, monthly reporting.
- **Editorial** — project woven into Ghar.tv's content network (design, intelligence, news verticals).
- **GharEvents** — a stage in front of curated buyers (§F).

Four credibility markers (qualitative, not numeric — safe to show):
- Domain expertise — *real estate specialists, not generalists.*
- Built-in distribution — *platform audience across every channel.*
- Integrated services — *strategy through distribution, one partner.*
- Performance accountability — *monthly data, adjusted strategy.*

### F. GharEvents line-up
⚠️ **DECISION TO CONFIRM (see §12):** `CLAUDE.md §6.4` defines **four** signature events; the old `developers.html` and the GharEvents project memory list **five** (adding a virtual/online festival). Reconcile before building. The four locked in `CLAUDE.md`:

1. **India Property Show** — Flagship.
2. **India Luxury Property Show** — Luxury (HNI/UHNI/NRI).
3. **India PropTech Expo** — Innovation.
4. **India Senior Living Show** — Specialist.

Positioned as **industry platforms**, not just events. Use anonymous booth/stage mockups (`Featured Exhibitor`, `Your Project`) — no fabricated attendance numbers.

### G. How a mandate works (the engagement)
Replace the old "vs Agency/In-house" comparison table with an honest **process story** — what working with Ghar.tv looks like, *without* invented timelines:
- **Strategy** — discovery on project, developer, micro-market, buyer segment → positioning, content plan, budget allocation across marketing / video / events.
- **Build & launch** — creative, microsite, launch film, campaigns go live across Ghar.tv and paid channels.
- **Scale & optimise** — event placement, editorial features, monthly intelligence reporting, strategy review.

Keep the phases qualitative. **Do not assert "first leads in 10 days" / "30–45 days to launch"** — those were fabricated. If a cadence must be shown, frame it as a typical *shape* of engagement, clearly illustrative.

### H. FAQ
Reuse the *voice and themes* from the old page's FAQ (it's genuinely good), but **strip every fabricated number and the Ghar.ae claim** unless confirmed (§12). Strong themes to keep:
- Do we have to take all three services? → No — each line is engageable independently; the mandate rewards taking all three.
- How is this different from a regular agency? → Agencies are horizontal; Ghar.tv is vertical — real-estate-native team, owned audiences, owned events.
- What project sizes / segments do you work with? → residential, luxury, senior living, commercial, mixed-use (keep ranges honest / illustrative).
- How long is an engagement? → mandates tied to the launch + sales cycle; VideoWorks project-based; GharEvents per-event.
- How do you measure success? → sales velocity, qualified site visits, conversion — not vanity media metrics.
- NRI / international buyers? → only if the Dubai/Ghar.ae capability is confirmed for public copy (§12).
- How do we start? → a short call; we come back with scope and approach.

### I. Closing CTA
Warm, confident, not salesy: *"Great projects deserve great marketing."* → primary **`Partner with us →`** + secondary (e.g. `Download capabilities deck` only if a real deck exists). No fabricated urgency.

---

## 8. `/developers/project-marketing` — the deep service page

Everything in §7-D, expanded into a full page using the richer saved descriptions (project memory `Developer Mandate dedicated page content`):
- **Strategy & Positioning** — audience profiling, competitive positioning, launch timing, content strategy that connects every service in the mandate.
- **Cinematic Production (VideoWorks)** — brand films, walkthroughs, launch content; scripted, shot on location, distributed across Ghar.tv's audience.
- **Editorial Presence** — project spotlights, intelligence context, design coverage — woven into content buyers already read.
- **GharEvents Stage** — the project showcased at Ghar.tv's signature events, face-to-face with serious buyers.
- **Project Microsite** — branded, SEO-ready, conversion-focused home for the project that captures the audience the campaigns generate.
- **Intelligence & Reporting** — monthly engagement data, audience behaviour, benchmarks — an active feedback loop, not just a report.

Same warm-white system, same chassis. Primary CTA = **`Partner with us →`** (enquiry).

---

## 9. CTAs & account model

⚠️ **This is the key difference from Brokers.** Per `CLAUDE.md §4.4`, **Developers do NOT create an account and have NO dashboard — they engage via an enquiry form (no login).**

- The **homepage** section CTAs are navigation-only (they point here).
- **This dedicated page is the conversion point.** The correct primary CTA is an **enquiry / "Partner with us"** action that opens a contact/enquiry form — *not* a "Join / Sign up / Apply for an account" flow (that's the Broker model, not this one).
- CTA hierarchy: section main CTA = bordered pill (`btn-text`); card-internal CTA = text + arrow (`btn-link`, no border). Never mix the roles.
- The enquiry CTA label should read as partnership, not commitment-heavy sales: `Partner with us`, `Talk to our team`, `Start a conversation` — pick one and use it consistently.

---

## 10. IA & cross-links

- **`/developers`** (hub — this page) · **`/developers/project-marketing`** (deep service page).
- Cross-links OUT to the verticals the mandate plugs into:
  - VideoWorks → the VideoWorks vertical.
  - GharEvents → `/events` / the GharEvents vertical (and individual event pages).
  - GharTalks → the GharTalks vertical.
  - Intelligence → the Intelligence vertical.
  - Editorial / Industry Voices → the relevant content verticals.
- Cross-links IN: the homepage `#developers` section; the off-canvas menu's `For Developers` link (already routes to `/developers`); and broker→developer mandate introductions referenced from the Brokers vertical.

---

## 11. Decisions to confirm with the project owner before building

1. **GharEvents count:** **four** events (per `CLAUDE.md §6.4`) or **five** (adding the virtual/online festival, per the old page + GharEvents memory)? Recommend aligning to the four in `CLAUDE.md` unless told otherwise.
2. **NRI / Dubai (Ghar.ae):** is the Dubai platform / `Ghar.ae` capability approved for public-facing copy, or internal-only for now? The old FAQ leans on it heavily.
3. **Enquiry CTA wording + destination:** confirm the exact label (`Partner with us` vs `Talk to our team`) and where it goes (on-page form, modal, or a `/contact`-style route).
4. **Capabilities deck:** does a real downloadable deck exist? If not, drop that secondary CTA.
5. **Sections to include vs defer for v1** (e.g. the "How a mandate works" process block, the deep `/developers/project-marketing` page) — confirm v1 scope.
6. **Any real proof yet?** Confirm there are still **no active mandates / case studies / testimonials** to show, so the page stays placeholder-honest. (If real material now exists, it changes §3 and §7-H.)

---

## 12. Build workflow

1. **Read first:** `CLAUDE.md` (full), `design-system.html` (the catalog — palette, type, shapes, `hp-*` playbook, `cr-*` composition rules, `feat-list`/`btn-text`/`btn-link` chassis), the live `index.html` (production reference, incl. its `#developers` section), and `design.html` (the `body.simple-nav` inner-page shell). *(Note: `CLAUDE.md` references a `docs/rules/` folder and `JUNIOR-HANDOFF.md` that don't currently exist — the load-bearing rules live in `CLAUDE.md` + `design-system.html` + the live page + this brief.)*
2. **Run the Reuse-First Protocol** before writing any component — grep `design-system.html`, `styles.css`, `main.js` for an existing asset. Reuse design and function from their own sources; don't fork a new prefix.
3. **Split architecture:** markup / `styles.css` / `main.js` — no inline `<style>`/`<script>` blocks (the head `@font-face` is the one allowed exception). Tailwind via CDN. Placeholder images via `https://placehold.co/`.
4. **Shared chrome byte-identical** — copy nav + footer + modals verbatim from a current page; don't re-style.
5. **Always serve on localhost** (`node serve.mjs` → `http://localhost:3000`), never screenshot `file:///`. Screenshots go inside `screenshots/claude-screenshots/`.
6. **Screenshot loop:** build → screenshot → compare against the homepage's For Developers section for visual continuity → fix → repeat (≥2 rounds), at 390px first.
7. **One section at a time** — build, screenshot, get sign-off, then the next. Don't batch.

---

## 13. Hard don'ts (quick reference)

❌ Any design/theme from `developers.html` (navy/gold/Playfair) ❌ red eyebrows / red on non-interactive elements ❌ fabricated stats (`650+ cities`, `90 days`, `30–45 days`, `1×/2×/3×`, lead-count claims) ❌ fabricated project names ❌ fake testimonials ❌ competitor vs-tables ❌ "buy a listing / advertise on our portal" framing ❌ account/dashboard/sign-up flow for developers (they enquire, no login) ❌ default Tailwind blue/indigo ❌ `transition-all` ❌ flat `shadow-md` ❌ card hover background gradients ❌ negative tracking or italics on Gazpacho ❌ secondary descriptors on product names ❌ forking a new class prefix when a shared chassis exists ❌ adding sections not in this brief without discussing first.
