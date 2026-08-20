# BRIEF — For Buyers & Owners Page (`/buyers`)

> Handoff brief for building the dedicated **Buyers & Owners** vertical page on Ghar.tv.
> Companion to `BRIEF-developers-page.md` and `BRIEF-brokers-page.md` — same template, same design system, same disciplines.
> Prepared 2026-06-23.

---

## 0. How to use this brief

This is the single source of truth for the page. Read it fully before building. It combines:
- The **product positioning + rules** from `CLAUDE.md` and accumulated project decisions.
- The **design system** the live homepage (`index.html`) uses — which this page MUST match.
- The **content/understanding** carried over from the existing legacy `buyers.html` (see §1) and the live homepage card (§5).

If anything here conflicts with the older `buyers.html` file, **this brief wins.**

The homepage already has a finished **Buyers & Owners** card — it is the *first* card in the `ecoForYou` hero (`.e4-card--buyers` in `index.html`). That card is the *gateway*; this page is the *full story*. Your build must feel like the same product the visitor just clicked — same canvas, same type, same calm.

⚠️ **This is the one CONSUMER vertical.** Developers, Brokers and Brand Partners are B2B. Buyers & Owners is the everyday end-user — the universal entry point to the whole platform. The center of the homepage search experience funnels here. Tone is welcoming and human first, intelligent second — never B2B/sales.

---

## 1. ⚠️ How to treat the existing `buyers.html`

`buyers.html` was built early (same lineage as the old `brokers.html` / `developers.html`) and is **local-only / gitignored** (untracked since commit `450fb57`, "Move 4 landing pages local-only"). It is in the repo **for content and understanding ONLY.**

**DISCARD its design completely.** Do NOT carry over any of:
- ❌ Its dark **navy `#162233` / `#1b2a40` / `#22334e` + gold `#c9a84c`** theme — the current system is **warm-white `#faf7f2`**.
- ❌ Its fonts (**Playfair Display / DM Sans / DM Mono**) — the system is **Inter + Gazpacho**.
- ❌ Its full-screen dark sections, gold accents, `--red` top-border cards, grid hero.
- ❌ Its nav, fixed top bar, sticky mobile CTA bar, or any component styling.

**Use it only to understand** the offering's shape. Its section spine is genuinely useful as a content map:
- **Dual audience split** — `01 · For Buyers & Tenants` and `02 · For Owners & Sellers` ("Two ways to use Ghar.tv"). Keep this dual framing (see §6).
- **"Three ways to list"** — the Post Property paths for owners/sellers.
- **"More than a portal" / "Portal vs platform"** — the platform-advantage idea (reframe, don't lift the vs-table — see §7-E).
- **"Why Ghar.tv"** — the differentiators.
- **FAQ** — voice and themes are reusable.

**Also do NOT carry over (discipline — see §3):**
- ❌ The **"Real voices" testimonials** — fabricated. No real buyer/owner quotes exist yet → no testimonial section.
- ❌ The **"How we compare" / Portal-vs-platform table** built on competitive claims — rebuild as a *what-you-get* story, not a vs-table.
- ❌ Any fabricated stats. The only approved figure is the homepage card's **`3,200+ users signed up`** (a user-approved early-stage placeholder, non-round on purpose).

---

## 2. The positioning that governs everything

Ghar.tv for buyers & owners is **not a listing portal.** It is an **understanding-first platform** — people come to discover properties, understand markets, and make confident decisions, not to be funneled into transactions.

- ❌ Banned framing: "India's largest listings", "millions of properties", lead-bait, "get instant callbacks", anything that reduces Ghar.tv to a classifieds board or smells like a portal arms-race.
- ✅ Correct framing: *"move with confidence"*, *"understand the market before you decide"*, *"AI-powered search, real market data, verified listings"*, *"discover, understand, decide."*

**Positioning line (from the live homepage card):** sub *"Find your next home. Or sell yours."* / copy *"AI-powered search, real market data, and verified listings — everything you need to move with confidence."*

**Brand line:** *Real Estate. For You.* (the homepage H1) — this vertical is the literal embodiment of "For You."

**Tone:** Calm, intelligent, empowering, trustworthy — Airbnb-style. Human and welcoming first. NOT salesy, NOT B2B, NOT listing-portal-loud.

**The platform advantage (internalise it):**
> A portal shows you listings and sells your contact details to the highest bidder. Ghar.tv helps you *understand* — real market data, intelligence, editorial, and verified listings — so you make the call, on your terms. Discovery-first, not transaction-first.

---

## 3. Discipline (non-negotiable)

- **No fabricated statistics.** Only the approved `3,200+ users signed up` placeholder is sanctioned. The card's `Search 650+ cities` claim is also live on the homepage — keep it consistent if reused, but confirm before inflating. If a number is needed and unknown, change the metric rather than invent a figure. Early-stage truth, never `10,000+`-style inflation (see memory `feedback_stats_calibration`).
- **No fabricated testimonials / buyer names.** Until real quotes exist, the page has **no testimonial section.**
- **No fake listings / fake project names.** Use anonymous placeholders + `https://placehold.co/` imagery in every mockup (search results, listing cards, saved-search UI).
- **No competitor names** in user-facing copy (99acres, Housing.com, MagicBricks, etc.) — internal understanding only. No vs-tables built on competitive claims.
- **Brand red `#ee324b` ≤ ~5% of any view** — CTAs, active/hover, brand identity only. Never on eyebrows, tags, dots, borders, or decoration.
- **Product names stand alone** — `GharTalks`, `Intelligence`, `Tools` etc. Never "Intelligence · Reports" or secondary descriptors.
- **Imagery = Indian/Asian faces or no-face alternatives** (property photos, city aerials, data imagery). This is an Indian platform (`CLAUDE.md §7.5`). The reusable AI broker portrait at `brand_assets/people/template-broker.png` is available if a person mock is needed.

---

## 4. Design system — must match the live homepage (`index.html`)

### Canvas & surfaces
- **Page canvas = warm-white `#faf7f2`** (`--warm-white`). White `#ffffff` is reserved for *floating objects* (cards, pills, search bars) — never a full section background.
- ⚠️ `CLAUDE.md §2.1` lists `--bg: #ffffff`, but the **live page canvas is warm-white `#faf7f2`**. Match the live page so this page feels continuous with the homepage card the visitor arrived from.

### Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | Headings, primary text |
| `--muted` / `--faint` | `#6a6a6a` | Body, eyebrows, meta |
| `--rule` | `#e8e8e8` | Borders, dividers |
| `--accent` (brand red) | `#ee324b` | CTAs / active / hover / brand only (≤5%) |

**This vertical's earned theme tone is Sage `#a8b5a0`** (`--tone` on `.e4-card--buyers`, deep `#5c6b53`). The Buyers card uses **Shape #1 (Classic house)** in Sage with a house-with-door icon. If you carry a theme tone onto this page, Sage is the buyers/owners color — calm, residential, grounded. Rotate other theme tones only by *meaning*, never decoration.

### Typography
- **Inter** for everything (body, UI, labels, nav, CTAs).
- **Gazpacho Bold** for large display headings ONLY. Default tracking — **never negative letter-spacing on Gazpacho, never italic Gazpacho.** Numbers/prices ≥14px display use Gazpacho 700.
- Eyebrow labels: Inter, 10px, weight 600, `letter-spacing .1em`, uppercase, color `--faint` — **never red**.
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
- Reference implementation: `design.html`. Re-use the **shared chrome (nav + footer + modals) byte-identical** — copy-paste verbatim, don't re-style per page (memory `feedback_shared_chrome_byte_identical`).

> ⚠️ **Search is the hero interaction for this vertical specifically.** This is the consumer search page. The inner-page search pill is more central here than on any B2B page — consider making search the primary above-the-fold moment, not an afterthought. See `docs/SEARCH-HANDOFF.md` for the search surface spec.

### Anti-generic guardrails
No default Tailwind blue/indigo. Layered, color-tinted shadows (never flat `shadow-md`). Animate only `transform`/`opacity`, never `transition-all`. Every clickable element gets hover + focus-visible + active. **Card hover = border/shadow/transform, never a background gradient.** **Text links never go red on hover — motion only (gap widen + arrow shift), color stays ink.**

---

## 5. Where this page sits + the exact homepage card copy

The homepage **Buyers & Owners** card (`.e4-card--buyers`, the first `ecoForYou` card in `index.html`) drives traffic here. **Both** the card's `Explore →` CTA **and** the off-canvas menu's `For Buyers & Owners` link route to **`/buyers`** (verified live in `index.html` — note: NOT the legacy `for-buyers-owners.html` slug that old memory references).

**Carry these EXACT words forward** (the page must feel continuous with the card):
- Title: **Buyers & Owners**
- Sub: **Find your next home. Or sell yours.**
- Copy: **AI-powered search, real market data, and verified listings — everything you need to move with confidence.**
- Four feature chips (`What you get`): **Search 650+ cities · Market data & tools · List free, forever · Reach broker network**
- Stat: **3,200+ users signed up**

> **The card intentionally combines Buyers / Tenants / Owners / Sellers into ONE card with a single CTA — no splits** (locked decision, memory `project_index4_eco_hero`). On the dedicated page you may *unfold* into the two modes (buy/rent vs own/sell), but the entry is unified.

---

## 6. Page content blueprint (`/buyers`)

The homepage card is a *gateway*. This page is the *full story*. Keep it **compact and editorial: one primary unit per section**, not stacked maximalism (memory `feedback_compact_sections`). Build one section at a time and get sign-off before the next.

The page serves **two audiences under one roof** — mirror the legacy `01 · Buyers & Tenants` / `02 · Owners & Sellers` split, but in the warm-white system.

### A. Hero
- Gazpacho headline carrying the positioning. Evolve the card line: *"Find your next home. Or sell yours."* or a discovery-first angle from the brand line *"Real Estate. For You."*
- Lead = the card copy verbatim works: *"AI-powered search, real market data, and verified listings — everything you need to move with confidence."*
- **Make search the hero affordance** — a prominent search entry (re-use the `body.simple-nav` search pill / search modal), not just a CTA button. This is the consumer search page.
- Optional: the four feature chips (`Search 650+ cities`, `Market data & tools`, `List free, forever`, `Reach broker network`) as a confidence row.

### B. For Buyers & Tenants (mode 01)
Discovery + understanding for someone looking to buy or rent:
- AI-powered search across 650+ cities.
- Real market data & decision tools (price trends, locality intelligence, EMI/affordability — cross-link the **Tools** vertical).
- Verified listings, save searches, shortlist.
- Connect to a vetted **broker network** when ready.
Frame as *understand the market, then decide* — not *get bombarded with calls*.

### C. For Owners & Sellers (mode 02)
- **List free, forever** (the card's promise — keep it).
- Post Property flow → reach buyers + the broker network.
- "Three ways to list" (from legacy: e.g. self-list / assisted / via broker — confirm the real options in §8).
- Honest framing: visibility to high-intent, real users — not inflated reach claims.

### D. Why Ghar.tv (the platform advantage — NOT a vs-table)
Reframe the legacy "Portal vs platform" idea as a positive *what-you-get* story:
- **Understanding-first** — market data, intelligence, editorial, not just listings.
- **Verified & calm** — no spam, no lead-reselling framing.
- **One ecosystem** — discovery connects to Intelligence, Tools, Design, GharTalks, brokers, events.
Qualitative markers only — no invented stats.

### E. What you plug into (the ecosystem)
A short editorial block on the surfaces a buyer/owner can explore — cross-links OUT:
- **Intelligence** — market reports, price trends, rankings.
- **Tools** — EMI, stamp duty, area converter, affordability.
- **Architecture & Design** — inspiration / "homes worth talking about".
- **GharTalks / Industry Voices** — learn from experts.
- **Brokers** — connect with vetted professionals.

### F. FAQ
Reuse the *voice and themes* from the legacy FAQ (strip any fabricated numbers). Likely themes: Is it free? (yes for owners — list free forever) · Are listings verified? · How is this different from a listings portal? · Do I need an account? (see §7) · How do I post a property/requirement?

### G. Closing CTA
Warm, human, not salesy. Primary CTA depends on the account model (§7): for buyers → **Post Requirement** / start a search; for owners → **Post Property**. No fabricated urgency.

---

## 7. ⚠️ CTAs & account model — the KEY difference from the B2B pages

Per `CLAUDE.md §4.4`, **Buyers / Owners / General Users DO create an account and DO get a dashboard.** They join **contextually** — there is **no "Join Now" / "Sign Up" button**. Account creation happens *through an action*:

| Action | Who | Result |
|---|---|---|
| **Post Property** | Owners / Sellers | OTP signup → dashboard |
| **Post Requirement** | Buyers / Tenants | OTP signup → dashboard |

- **"Join Now" does NOT exist anywhere.** Don't add a generic signup CTA.
- **Sign In** = phone + password (no OTP cost), with "Login with OTP" and "Forgot Password" fallbacks. **Sign Up** (new account) happens only inside Post Property / Post Requirement (requires OTP).
- The page's primary CTAs are therefore **`Post Property`** (owners) and **`Post Requirement`** (buyers) — both already exist as flows in the shared chrome / off-canvas. Search/explore is the soft entry; Post Property/Requirement is the conversion.
- CTA hierarchy: section main CTA = bordered pill (`btn-text`); card-internal CTA = text + arrow (`btn-link`, no border). Never mix the roles (memory `feedback_cta_hierarchy`).
- Text links never go red on hover — motion only.

> Contrast for context: **Developers** enquire with no login (no dashboard); **Brokers** apply via SuperPro (OTP signup, dashboard). **Buyers & Owners are the standard OTP-signup-with-dashboard model.** Don't copy the developer enquiry-form pattern here.

---

## 8. Brand atoms you'll re-use (don't reinvent — Reuse-First Protocol)

Grep `design-system.html` / `styles.css` / `main.js` FIRST. Reuse verbatim; don't fork a new prefix (memory `feedback_reuse_first_protocol`, `feedback_reuse_shared_classes`).

- **`sec-head` / `sec-eyebrow` / `sec-title` / `sec-lead`** — shared section header chassis. Use for every section header.
- **`feat-list`** — canonical icon + title + one-liner list (for "what you get" lists).
- **`btn-text`** — bordered pill for section primary CTA.
- **`btn-link`** (+ `btn-link--gap-top`) — text + arrow, card-internal / inline CTA.
- **Card chassis** — `.rail-outer` / `.rail` shared carousel chassis; existing card variants. Don't invent a new card prefix if one fits.
- **Shape #1 (Classic house) in Sage** — the buyers/owners visual identity if you want a hero graphic; lift the existing SVG rather than redrawing.
- **Search pill + search modal** — re-use the `body.simple-nav` implementation from `design.html`; see `docs/SEARCH-HANDOFF.md` and `docs/SEARCH-MODAL-HANDOFF.md`.
- **Shared chrome** — nav + footer + off-canvas + sign-in modal: copy byte-identical.

---

## 9. IA & cross-links

- **`/buyers`** (this page). Off-canvas `For Buyers & Owners` and the homepage card `Explore →` both already route here.
- Cross-links OUT: Intelligence, Tools, Architecture & Design, GharTalks, Industry Voices, Brokers, GharEvents.
- Cross-links IN: homepage `.e4-card--buyers`; off-canvas menu; footer "For You" column (`<li><a href="/buyers">For Buyers & Owners</a></li>` already live).
- Decide v1 sub-page scope: a single `/buyers` page may be enough; deeper sub-pages (e.g. a dedicated search results experience) are likely owned by the app/backend, not this marketing page — confirm.

---

## 10. Decisions to confirm with the project owner before building

1. **Search-as-hero:** how prominent should live search be on this page vs. linking out to the global search? (This is the consumer search vertical — recommend search-forward.)
2. **"Three ways to list":** confirm the real Post Property options (self-list / assisted / broker?) — the legacy page's three paths may be aspirational.
3. **`Search 650+ cities` claim:** is 650+ the confirmed number to show publicly? (It's live on the homepage card.)
4. **Sub-page scope for v1:** single `/buyers` marketing page, or additional flows? Where does the marketing page end and the product app begin?
5. **Any real proof yet?** Confirm there are still no real buyer/owner testimonials or case studies, so the page stays placeholder-honest.
6. **Primary CTA wording:** `Post Property` / `Post Requirement` confirmed as the two primary actions (vs a softer "Start your search")?

---

## 11. Build workflow

1. **Read first:** `CLAUDE.md` (full), `design-system.html` (the catalog — palette, type, shapes, `hp-*` playbook, `cr-*` composition rules, `feat-list`/`btn-text`/`btn-link` chassis), the live `index.html` (production reference, incl. its `.e4-card--buyers` card and search), `design.html` (the `body.simple-nav` inner-page shell), and `docs/SEARCH-HANDOFF.md`. *(Note: `CLAUDE.md` references a `docs/rules/` folder + `JUNIOR-HANDOFF.md` that don't currently exist — the load-bearing rules live in `CLAUDE.md` + `design-system.html` + the live page + this brief.)*
2. **Invoke the `frontend-design` skill** before writing any frontend code (every session).
3. **Run the Reuse-First Protocol** before writing any component — grep `design-system.html`, `styles.css`, `main.js`. Reuse design + function from their own sources; don't fork a new prefix.
4. **Split architecture:** markup / `styles.css` / `main.js` — no inline `<style>`/`<script>` blocks (the head `@font-face` is the one allowed exception). Tailwind via CDN. Placeholder images via `https://placehold.co/`.
5. **Shared chrome byte-identical** — copy nav + footer + modals verbatim from a current page; don't re-style.
6. **Always serve on localhost** (`node serve.mjs` → `http://localhost:3000`), never screenshot `file:///`. Screenshots go inside `screenshots/claude-screenshots/`.
7. **Screenshot loop:** build → screenshot → compare against the homepage Buyers card for visual continuity → fix → repeat (≥2 rounds), at 390px first.
8. **One section at a time** — build, screenshot, get sign-off, then the next. Don't batch (memory `feedback_one_section_at_a_time`).

---

## 12. Hard don'ts (quick reference)

❌ Any design/theme from `buyers.html` (navy/gold/Playfair) ❌ red eyebrows / red on non-interactive elements ❌ fabricated stats (only `3,200+ users signed up` is approved) ❌ fake listings / fake project names ❌ fake testimonials ❌ "largest listings / millions of properties" portal-arms-race framing ❌ lead-reselling / "instant callback" framing ❌ competitor vs-tables ❌ a generic "Join Now / Sign Up" button (account creation is contextual via Post Property / Post Requirement) ❌ copying the developer enquiry-no-login model (buyers/owners DO get a dashboard) ❌ default Tailwind blue/indigo ❌ `transition-all` ❌ flat `shadow-md` ❌ card hover background gradients ❌ negative tracking or italics on Gazpacho ❌ secondary descriptors on product names ❌ forking a new class prefix when a shared chassis exists ❌ non-Indian stock faces ❌ adding sections not in this brief without discussing first.
