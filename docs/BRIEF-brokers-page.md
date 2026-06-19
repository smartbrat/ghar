# BRIEF — For Brokers Page (`/brokers`)

> Handoff brief for building the dedicated **Brokers** vertical page on Ghar.tv.
> The same template will follow for **Developers**, **Buyers & Owners**, and **Brand Partners** — **Brokers first.**
> Prepared 2026-05-30.

---

## 0. How to use this brief

This is the single source of truth for the page. Read it fully before building. It combines:
- The **product positioning + rules** from `CLAUDE.md` and accumulated project decisions
- The **design system** the live homepage (`index.html`) uses — which this page MUST match
- The **content/understanding** carried over from the existing `brokers.html` reference (see §1)

If anything here conflicts with the older `brokers.html` file, **this brief wins.**

---

## 1. ⚠️ How to treat the existing `brokers.html`

`brokers.html` was created early (roughly, by a senior, via Claude) and then had **content added during the homepage build**. It is in the repo **for content and understanding ONLY.**

**DISCARD its design completely.** Do NOT carry over any of:
- ❌ Its dark **navy `#162233` + gold `#c9a84c`** theme (the current system is **warm-white**)
- ❌ Its fonts (**Playfair Display / DM Sans / DM Mono**) — the system is **Inter + Gazpacho**
- ❌ Its full-screen dark sections, red eyebrows, gold tiers, grid-overlay hero
- ❌ Its nav, sticky bar, or any component styling

**Use it only to understand** what the broker offering contains (tiers, AI Academy, territory model, FAQ themes, copy angles). Everything visual is rebuilt from scratch on the current design system (§4).

**Also do NOT carry over (discipline — see §3):**
- ❌ The **fabricated testimonials** (Rajesh Mehta / Priya Nair / Amir Khan — invented people)
- ❌ The **marketing stats** "10× platform pays back", "90 days to impact" (fabricated)
- ❌ Hard portal call-outs that name competitors in a comparison ("Without Ghar.tv" vs others)

---

## 2. The one rule that governs everything

**Ghar.tv is NEVER a "lead-selling portal" for brokers.** The framing is **authority, visibility, personal brand, micro-market dominance**. Leads are a *secondary outcome*, never the pitch.

- ❌ Banned: "get more leads", "buy leads", "lead packages", cold-list framing
- ✅ Correct: "serious buyer visibility", "reach buyers actively exploring Ghar.tv through genuine platform authority", "become the name people search for"

> The `brokers.html` FAQ already nails the right voice: *"They sell leads. We build authority. A lead is a transaction — it ends when the call does. Authority is a business — it compounds."* Keep this spirit.

**Brand line:** *"For brokers who want to dominate their market."*
**Tone:** Intelligent, empowering, trustworthy, editorial, premium.

---

## 3. Discipline (non-negotiable)

- **No fabricated statistics.** "India has ~15 lakh brokers" is a defensible market fact and fine. Product rules like "3 seats per micro-market" are fine. But invented performance claims ("10×", "90 days", "tripled inbound") are NOT. If a number is needed and unknown, change the metric rather than invent a figure. Stats read as early-stage truth (e.g. `2,500+ brokers`, not `50,000+`).
- **No fake testimonials or fake broker names.** Until real broker quotes exist, do not invent them. Use the reusable AI portrait `brand_assets/people/template-broker.png` only as a clearly-illustrative *example profile*, never as a "real customer."
- **No competitor names** in user-facing copy (99acres, Housing.com, MagicBricks, Airbnb, etc.) — internal understanding only.
- **Brand red `#ee324b` ≤ ~5% of any view** — CTAs, active/hover, brand identity only. Never on eyebrows, tags, dots, borders, or decoration.

---

## 4. Design system — must match the live homepage (`index.html`)

### Canvas & surfaces
- **Page canvas = warm-white `#faf7f2`.** White `#ffffff` is reserved for *floating objects* (cards, pills, search bars) — never a full section background.
- ⚠️ `CLAUDE.md §2.1` lists the token `--bg: #ffffff`, but the **live `index.html` canvas is warm-white `#faf7f2`**. Match the live page. Inner pages allow white where it genuinely serves the design, but default to warm-white so the page feels continuous with the homepage the visitor arrived from.

### Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#111111` | Headings, primary text |
| `--muted` / `--faint` | `#6a6a6a` | Body, eyebrows, meta |
| `--rule` | `#e8e8e8` | Borders, dividers |
| `--accent` (brand red) | `#ee324b` | CTAs / active / hover / brand only (≤5%) |

**Earned theme tones** — rotate by *meaning*, not decoration (terracotta is NOT a default): `--turmeric #d4a048` · `--terracotta #c4775a` · `--sand` · `--sage #a8b5a0` · `--indigo #8e9aaf`. The SuperPro mark uses terracotta + turmeric (§6).

### Typography
- **Inter** for everything (body, UI, labels, nav, CTAs).
- **Gazpacho Bold** for large display headings ONLY. Default tracking — **never negative letter-spacing on Gazpacho, never italic Gazpacho.** Numbers/prices/stats ≥14px display use Gazpacho 700.
- Eyebrow labels: Inter, 10px, weight 600, `letter-spacing .1em`, uppercase, color `--faint` — never red.

### Spacing & grid
- Section wrapper: `max-width: var(--max-w); margin: 0 auto; padding: var(--pad-v) var(--pad-h)`.
- Homepage container = `clamp(1280px, 75vw, 1840px)`. **24px grid gaps everywhere.** 8px spacing scale.
- **Mobile-first, non-negotiable.** Validate at 390px first. Touch targets ≥44px. Desktop via `@media(min-width:744px)`.

### Inner-page navigation (`body.simple-nav`)
Inner pages use the simplified nav, NOT the homepage three-panel hero nav:
- Single **760px search pill at every viewport**, 56px tall, 80px nav height
- **No scroll animation** on the nav
- Search modal opens as a **centered card on desktop**
- Reference implementation: `design.html`. Use it for the nav shell.

### Anti-generic guardrails
No default Tailwind blue/indigo. Layered, color-tinted shadows (never flat `shadow-md`). Animate only `transform`/`opacity`, never `transition-all`. Every clickable element gets hover + focus-visible + active. Card hover = border/shadow/transform, **never a background gradient.** Text links never go red on hover — motion only (gap + arrow), color stays ink.

---

## 5. Where this page sits

The homepage `For Brokers` section (`#brokers` in `index.html`) drives traffic here via **three distinct destinations** — your build must satisfy all three:

| Homepage link | Destination | Visitor expects |
|---|---|---|
| `Explore the broker platform →` | **`/brokers`** | The full broker vertical (this page) |
| Sample profile card → `See a SuperPro page →` | **`/brokers/preview`** | A live demo of a real SuperPro broker's page |
| SuperPro card → `Explore SuperPro →` | **`/brokers/superpro`** | The SuperPro flagship tier, in depth |

> Build order: **`/brokers` (hub) first**, then `/brokers/superpro`, then `/brokers/preview`.

---

## 6. SuperPro mark (`sp-mark`) — shared brand atom

- `Super` in **terracotta `#c4775a`**, `Pro` in **turmeric `#d4a048`**
- Inter 700, tight kerning (`-.005em`), no italics
- 4-point **sparkle prefix** in turmeric (2.6s twinkle; respects `prefers-reduced-motion`)
- Sizes: `sp-mark--sm` (12px, inline) and `sp-mark--md` (32px, card headers)
- **Brand marks never change on hover** — they are identity anchors.

---

## 7. Page content blueprint (`/brokers`)

The homepage section is a *gateway*. This page is the *full story*. Suggested section order — adapt, but keep it compact and editorial (one primary unit per section, not stacked maximalism):

### A. Hero
- Gazpacho headline carrying the positioning. Strong angles from the reference: *"Be the name people search for."* / *"India has ~15 lakh brokers. Most are invisible."* / *"Authority over listings. Growth over portfolio."*
- Lead paragraph: authority / visibility / brand framing.
- Primary CTA (action CTAs allowed here — see §10).

### B. "Three broker identities" (optional framing device)
A who-are-you device from the reference — *Authority Broker* (recognised name, buyers call first), *Digital Broker* (AI-powered, always visible, competes above its weight), *Growth Broker* (scaling from a few deals to many, one area to several). Reframe on the warm system if used.

### C. "Why top brokers join Ghar.tv" — advantage cards
1. **Personal Brand Authority** (anchor) — recognised expert; your profile, voice, reputation on a platform serious buyers trust.
2. **Micro-Market Dominance** — own your neighbourhood online with dedicated area pages; once taken, closed to competitors.
3. **Premium Personal Website** — a full branded digital headquarters, not a template/profile.
4. **Cinematic Property Videos** — walkthroughs & neighbourhood films at production quality (VideoWorks).
5. **Market Intelligence** — pricing signals, demand shifts, micro-market data.
6. **Personal Marketing Engine** — editorial features, video interviews, consistent visibility across Ghar.tv.
7. **Serious Buyer Visibility** — intent-driven inbound from buyers exploring Ghar.tv, not cold traffic.
8. **AI-Ready Programme** — see the AI Academy block (E).

### D. Membership tiers
⚠️ **DECISION TO CONFIRM (see §12):** the live homepage uses **SuperPro** as the flagship; `brokers.html` defines **four** tiers (Basic / Premium / Super Broker / White Glove). Reconcile before building. Documented content for each (reskin onto warm system, ghost CTAs for lower tiers, the one red CTA for the flagship application):

1. **Basic (Tier 01)** — Get found, get started. Verified profile + trust badge, listings, contact visibility, basic analytics, searchable by micro-market. *Free to join.* CTA: "Claim your profile."
2. **Premium (Tier 02)** — Ahead of most brokers in your city. Everything in Basic + featured profile / priority in search, more listings with enhanced visibility, name on micro-market pages, AI listing generator, lead management/CRM, monthly content kit, monthly micro-market intelligence report, priority support. *Pricing on request.* CTA: "Start dominating."
3. **Super Broker / SuperPro (Tier 03)** — Own your micro-market; be the name. Everything in Premium + dedicated exclusive micro-market authority page, personal branded website, cinematic property video, editorial feature, video interview, advanced analytics, monthly AI masterclass, AI certification, AI prompt library, white-glove onboarding + account manager. Scarcity: "Once your seat is taken, it is closed to competitors. Limited seats per micro-market." CTA: "Apply for Super Broker / SuperPro."
4. **White Glove (Tier 04, by application)** — Build a real estate empire. Everything in Super + full personal brand build, dedicated content team, developer mandate introductions, NRI investor visibility, India Property Festival speaker, quarterly 1:1, exclusive intelligence, co-branded campaigns, first access to AI features. *By application only.* CTA: "Apply for White Glove."

### E. Ghar.tv AI Academy (a distinct, ownable pillar)
Positioned as *"India's first AI literacy programme for real estate professionals."* Content blocks:
- **Live Monthly Masterclass** — hands-on, broker-specific (led by founder **Suhas Kataria** — practicing broker + AI practitioner). ⚠️ Confirm public attribution by name (§12).
- **Ghar.tv AI Certification** — structured, shareable (LinkedIn/WhatsApp).
- **AI Prompt Library** — India-specific listing copy, negotiation, market reports, buyer FAQs.
- **First Access** — every new AI feature before public release.
- Voice: empowering, not fear-based — "You can fear AI, or you can own it."

### F. Market Authority Network
- **3 Super Broker seats max per territory** — once filled, market closed (contractually protected, publicly visible).
- Territory cards/table: city + micro-market + seat status (taken / N remaining / available). Real example markets from the reference: Bandra West, Powai, Lower Parel (Mumbai); Koregaon Park, Wakad (Pune); Jubilee Hills (Hyderabad); Indiranagar (Bengaluru); Golf Course Road (Delhi NCR).
- Footer line: *"20+ micro-markets across Mumbai, Bengaluru, Pune, Hyderabad, and Dubai."*

### G. Feature comparison (optional)
A what-you-get matrix across tiers — but compare *tiers to each other*, NOT Ghar.tv vs named competitors.

### H. City TV Channels (broker media exposure)
Super Brokers become featured experts on city media channels — formats like *Mumbai Market Pulse* (weekly), *Powai Expert Update* (monthly), *Worli Luxury Watch* (monthly), *Project Spotlight Series*, *GharTalks: Market Voices*. Live "pulse" dots on active channels. (Can be deferred if the page runs long.)

### I. FAQ
Authority-first Q&As. Strong themes already written in the reference (reuse the voice, drop competitor names):
- Why Ghar.tv vs lead portals → "They sell leads. We build authority."
- Is my micro-market seat actually exclusive? → Yes, contractually, max 3 per market.
- What is the AI Masterclass / AI Certification?
- I'm not tech-savvy — can I use this? → Built for brokers, not developers.
- How quickly will I see results? → measurable visibility in ~30 days; inbound builds over 90–180 days (frame honestly, not as a guarantee).
- Can I switch tiers? → upgrade anytime; downgrading releases your seat.
- How do I apply for White Glove? → application, evaluated for fit; team responds within 48 hours.

### J. Closing CTA
*"Build your real estate brand. Own your market."* — primary + secondary button + note: *"Founding seats available in selected micro-markets."*

---

## 8. `/brokers/superpro` — flagship deep page
Everything in §7-D-3 plus §7-E, expanded. The SuperPro bundle in full:
- **Your Personal Digital Headquarters** — premium personal website + custom domain. Capability chips: Premium design · SEO-ready · Listings integration · Video embeds · Market insight pages · Custom domain.
- Cinematic property video production (VideoWorks) · micro-market authority pages · personal brand development · featured placement across Ghar.tv · dedicated marketing support.
- Scarcity: "Invite only · 3 seats per micro-market · Once filled, closed."

## 9. `/brokers/preview` — the sample SuperPro page
A convincing live demo of a real SuperPro broker's page (premium personal HQ). Use `brand_assets/people/template-broker.png` (Indian male, navy suit) as the clearly-illustrative example. This is the proof behind the homepage's "See a SuperPro page →".

---

## 10. CTAs & account model
- The **homepage** section CTAs are navigation-only. **This dedicated page is where brokers join** — per the account model, **brokers join via the SuperPro / Super Broker application (OTP signup)**. So action CTAs ("Apply…", "Claim your profile", "Start dominating") are correct here.
- CTA hierarchy: section main CTA = bordered pill (`.btn-text`); card-internal CTA = text + arrow (`.btn-link`, no border). Never mix the roles.

---

## 11. IA & cross-links
- `/brokers` (hub) · `/brokers/membership` · `/brokers/superpro` · `/brokers/preview`
- `/brokers/city-networks` · `/brokers/micro-market-specialists` · `/brokers/featured-brokers` · `/brokers/resources` · `/brokers/events`
- `/brokers/{city}/{broker-slug}` — individual profiles
- **Cross-links:** profiles ↔ `/people/brokers/{slug}` · Super Brokers in `/voices/broker-voices`, GharTalks, city video channels · broker events in `/events` · developer mandate intros → Developer Mandate vertical · India Property Festival → GharEvents.

---

## 12. Decisions to confirm with the project owner before building
1. **Tier model:** 3 tiers (Basic / Premium / SuperPro) per the live homepage, OR 4 tiers (adding **White Glove**) per `brokers.html`?
2. **Flagship naming:** is the flagship branded **SuperPro** (the live `sp-mark` on the homepage, links to `/brokers/superpro`) or **"Super Broker"** (the reference page label)? Recommend **SuperPro** for consistency with what's live.
3. **AI Academy:** keep as a headline pillar, and is naming founder **Suhas Kataria** in public copy approved?
4. **Pricing display:** "Free to join" / "Pricing on request" / "By application" — confirm what's shown publicly.
5. **Sections to include vs defer** (City TV Channels, comparison table) for v1.

---

## 13. Build workflow
1. **Read first:** `CLAUDE.md` (full), `design-system.html` (the catalog — palette, type, shapes, `hp-*` playbook, `cr-*` composition rules), and the live `index.html` (production reference) incl. its `#brokers` section. *(Note: `CLAUDE.md` references a `docs/rules/` folder and a `JUNIOR-HANDOFF.md` that do not currently exist in the repo — the load-bearing rules live in `CLAUDE.md` + `design-system.html` + the live page + this brief.)*
2. **Split architecture:** markup / `styles.css` / `main.js` — no inline `<style>`/`<script>`. Tailwind via CDN. Placeholder images via `https://placehold.co/`.
3. **Always serve on localhost** (`node serve.mjs` → `http://localhost:3000`), never screenshot `file:///`.
4. **Screenshot loop:** build → screenshot (save inside `screenshots/claude-screenshots/`) → compare against the homepage's For Brokers section for visual consistency → fix → repeat (≥2 rounds).
5. **One section at a time** — build, screenshot, get sign-off, then the next. Don't batch.

---

## 14. Hard don'ts (quick reference)
❌ Any design/theme from `brokers.html` (navy/gold/Playfair) ❌ lead-gen language ❌ default Tailwind blue/indigo ❌ red on non-interactive elements ❌ `transition-all` ❌ flat `shadow-md` ❌ card hover background gradients ❌ negative tracking or italics on Gazpacho ❌ fabricated stats ❌ fake testimonials / fake broker names ❌ naming competitors in copy ❌ adding sections not in this brief without discussing first.
