---
name: Junior Handoff — Designing Ghar.tv pages with Claude Desktop App
purpose: Step-by-step setup and workflow for a junior designer using the Claude Desktop App (no MCP, no terminal) to redesign Ghar.tv pages with the new theme.
---

# Designing Ghar.tv pages with Claude Desktop App

This is the practical, do-this-first guide. If you skim only one file, skim this one. After this, follow the file links it points to.

## What you have vs what you don't

You're using **Claude Desktop App** (the chat client), not Claude Code (the terminal coding agent). That changes some things:

| Thing | You have it? |
|---|---|
| Chat with Claude | ✓ |
| Project file uploads (attached on every message) | ✓ |
| Direct file editing on your computer | ✗ — Claude can't write to your disk |
| Terminal commands, dev server, screenshots | ✗ — no MCP |
| Slash commands (`/skills`, etc.) | Limited |
| Auto-loading of `CLAUDE.md` | ✗ — you must upload it manually |

So the workflow is: **you upload context** → **Claude generates HTML/CSS/JS** → **you copy the output into your editor** → **you run/screenshot the page yourself** → **you paste the screenshot back into Claude for feedback**.

## One-time setup (do once, not every session)

### 1 · Create a Claude Project
In the Desktop App:
- New project → name it "Ghar.tv Design"
- This Project will hold all the context files. Files attached here are loaded into every conversation in this Project — you don't re-upload each time.

### 2 · Upload these files to the Project
In **this exact order** so the Project's file list reads top-down logically:

**Tier A — must have (without these, Claude reverts to generic AI design):**
- `CLAUDE.md` (project rules — the source of truth)
- `docs/rules/README.md` (the reading order for the rules below)
- All 25 files inside `docs/rules/` (the design rules accumulated over months of iteration)
- `docs/BRIEF-design-page.md` (the page-specific brief for `/design`)

**Tier B — design references:**
- `design-system.html` (the catalog — atoms, framework rules, UI components, patterns)
- `index4.html` (the production reference — patterns applied)
- `styles4.css` (the canonical stylesheet — `.sec-*`, `.btn-text`, `.thumb-play`, card families)
- `gazpacho.css` (font-face for Gazpacho display type)

**Tier C — brand assets (only what's relevant to this page):**
- `brand_assets/logo.svg` (the canonical wordmark)
- `brand_assets/MADEOkineSansPERSONALUSE-Medium.otf` and `brand_assets/SuizaDEMO-SemiBold.otf` if Claude needs to reference fonts
- A couple of `brand_assets/people/*.jpg` if you're working on a section that needs faces

**Tier D — only for the /design redesign task:**
- The previous failed attempt at `/design.html` (so Claude can see what went wrong) — but **clearly label it as "FAILED ATTEMPT — flow only, ignore visuals"**

### 3 · Set the Project's custom instructions
In the Project's settings, paste this as the system prompt / custom instruction:

```
You are working on Ghar.tv — India's Real Estate Discovery, Intelligence,
Media and Events Platform. Before responding to any design task in this
Project:

1. Read CLAUDE.md (project rules)
2. Read docs/rules/README.md, then every file in docs/rules/ in the order it specifies
3. Read docs/BRIEF-design-page.md (the page-specific brief)
4. Read design-system.html (especially divisions 02 cr-* and 04 hp-*)
5. Read index4.html for production references

NEVER write code in your first response. Always start by:
- Acknowledging what page is being designed
- Stating which Composition Rules (cr-*) apply
- Listing which existing patterns from design-system.html / index4.html will be reused
- Proposing 2-3 visual options for the section being built
- Asking for sign-off before writing code

Build ONE section at a time. Show the HTML/CSS for that section. Wait for
sign-off before moving to the next. Do not batch. Do not ship "all sections"
in one message.

When generating code: split into index.html, styles.css, main.js (no inline
<style> or <script> blocks). Use the canonical tokens (--warm-white, --ink,
--espresso, --rule, --brand-red). Reuse .sec-* and .btn-text canonical
classes. Section CTAs are .btn-text only — never filled buttons or pills.
No negative letter-spacing on Gazpacho. No Gazpacho italics. No
shape-glyph as category mark. The brand wordmark is an SVG asset, never
typed in Gazpacho.

Mobile-first. Validate at 390px before desktop. 24px gaps. Container token:
clamp(1280px, 75vw, 1840px).
```

This makes every conversation in the Project start with the right guardrails.

## Per-task workflow (every conversation)

### Step 1 — Open a new chat in the Project
Title it after the task: "Design — /design Hero" or "Design — /design Designers section".

### Step 2 — First message (the starter prompt)
Paste this verbatim, edit only the **bolded** lines:

> I'm redesigning **`/design.html`** — Ghar.tv's Architecture & Design vertical.
>
> Today's task: **rebuild the Hero section** following `docs/BRIEF-design-page.md`.
>
> Before writing code:
> 1. Confirm you've read `CLAUDE.md`, `docs/rules/README.md` + the rules it lists, and `docs/BRIEF-design-page.md`.
> 2. Tell me which Composition Rules (`cr-*`) apply.
> 3. Tell me which existing patterns from `design-system.html` or `index4.html` you'll reuse.
> 4. Propose 2–3 visual options for the Hero (the brief lists three — Billboard quote, Editorial split, Magazine cover; pick one or propose your own variant).
> 5. Stop. Wait for me to choose before writing code.

Replace the bolded lines per task — `Designers section`, `Architecture row`, etc.

### Step 3 — Review the proposal
Claude should respond with the cr-* rules, the patterns it'll reuse, and 2-3 options. **Do not approve a vague answer.** If it skips the rules or jumps straight to code, reply with: *"Stop. Re-read `docs/rules/README.md` and the files it lists, then redo this with the rules and patterns explicitly named."*

### Step 4 — Pick an option
Reply with which option you want, plus any tweaks. *"Option B with the headline 'Homes worth talking about.' and the hero image being a real photo from `brand_assets/`."*

### Step 5 — Get the code
Now Claude builds the section. It should give you:
- A snippet for `index.html` (the markup for this section)
- The CSS additions for `styles.css`
- Any JS additions for `main.js`
- A note on what tokens it used and what classes it reused

### Step 6 — Paste into your editor
Open the page locally. Save the file. Open it in a browser.

### Step 7 — Screenshot and paste back
- **Desktop:** browser window at ~1440px wide. Screenshot full section (Cmd+Shift+4 on Mac, Win+Shift+S on Windows).
- **Mobile:** in the browser DevTools, set viewport to 390px wide. Screenshot.
- Paste both screenshots into the chat: *"Here's how it renders. Issues I see: [list]. Anything you want to adjust?"*

### Step 8 — Iterate
Up to 2-3 rounds per section. If you're past round 3 and still not right, **stop the chat, open a new one in the same Project**, and start the section over with the lessons learned.

### Step 9 — Sign-off and move to next section
Once a section is right, paste the final code into your master file, mark it done, start a new chat for the next section.

## Things to watch for (red flags in Claude's output)

| Red flag | Why it's wrong | What to do |
|---|---|---|
| First response is HTML/CSS code with no rule discussion | Skipped the brief and the rules | Stop. Tell it to re-read `docs/rules/README.md`. |
| Uses a filled button as a section CTA | Violates Composition Rule 03 | Tell it: "Use `.btn-text` only, see `cr-cta`." |
| Adds `letter-spacing: -0.02em` on a Gazpacho headline | Violates `feedback_letter_spacing.md` | Strip it. Default tracking only. |
| Adds dark theme to Featured Homes section | Color is semantic, not decorative — `feedback_color_semantics.md` | Reject. Warm-white default. |
| Floating colored topic chips, animated SVG house, orbit dots | This is the failed attempt aesthetic | Reject. Reference the brief's "What to absolutely avoid" list. |
| Uses 4 cards in a row "for symmetry" | Compactness violation — `feedback_compact_sections.md` | 3 cards. Three is enough. |
| Adds emoji or stock-Western faces | Violates Indian-first rule (CLAUDE.md §7.5) | Reject. |
| Uses `transition-all` | Violates anti-generic guardrails | Replace with `transition: transform .25s, opacity .25s` or specific properties. |
| Italicizes Gazpacho | Violates `feedback_no_gazpacho_italics.md` | Reject. Use color or weight contrast for emphasis. |
| Reinvents the navbar or footer | They exist in `index4.html` — reuse, don't rebuild | Tell it to copy from `index4.html`. |

## Sources of truth (what to send Claude when it goes wrong)

- **For the formula** — `docs/rules/feedback_airbnb_clickl_formula.md`
- **For the rules** — `docs/rules/README.md` + the files it lists
- **For "how should this section look"** — `docs/BRIEF-design-page.md`
- **For "what classes already exist"** — `design-system.html` (especially `cr-*` and `hp-*`)
- **For "show me how it's done in production"** — `index4.html`
- **For the page's purpose / non-goals** — `docs/BRIEF-design-page.md` "What it is NOT"

## Things you cannot do (and how to work around them)

| Limitation | Workaround |
|---|---|
| Claude can't run a dev server | You run `node serve.mjs` yourself in your terminal (or use VS Code's Live Preview). Then paste screenshots back into chat. |
| Claude can't take screenshots | You take them manually (1440px desktop + 390px mobile) and paste in. |
| Claude can't see your file structure | Tell it explicitly when you paste code: *"This goes into `styles.css` after the `/* nav */` block."* |
| Claude can't read updated CLAUDE.md without re-upload | Re-upload `CLAUDE.md` to the Project whenever it changes. |
| Claude's memory doesn't persist between Projects | Keep all design work inside the **same** Project so the file context stays loaded. |

## When to ask for help
- A section has needed >3 iterations and isn't getting closer → ping the senior designer / send the chat link, don't keep banging
- Claude keeps suggesting a pattern that contradicts the rules → screenshot the rule, paste it back
- You can't find a class or pattern in `design-system.html` → check `index4.html` (the production reference); if not there, it doesn't exist yet — ask before inventing

## Final reminder
The point of all this context is to make Claude **boring** in the right way. The wrong way to use Claude on this project is to ask it to "make a beautiful design page" and accept whatever it generates. The right way is to feed it the rules, hold it to one section at a time, and reject anything that drifts.

You'll know it's working when the output **looks like it belongs on `index4.html`** — same warm-white canvas, same Inter + Gazpacho pairing, same `.sec-head` rhythm, same `.btn-text` CTAs, same calm. That's the goal. Magazine craft, not AI flair.
