---
description: Kick off a new Ghar.tv brand profile the correct way — enforces the auto-generation contract from step 1. Args = brand slug (kebab-case).
---

You are creating a new Ghar.tv brand profile. Follow this exact sequence. Do not skip steps. Do not clone shipped brand files.

**Slug provided:** $ARGUMENTS

## Step 0 — Load the contract (MANDATORY)

Read these files in full before doing anything else:
- `docs/AUTO-GENERATION-CONTRACT.md`
- `docs/COMPOSITION-RULES.md`
- `docs/BRAND-PROFILE-TOKEN-CONTRACT.md`

If you cannot read them, stop.

## Step 1 — Ask the user for inputs

Ask (do not proceed until answered):
1. Brand's own website URL (e.g. `https://studiofov.com/`)
2. Brand's category from the COMPOSITION-RULES vocabulary: developer / architect / interior / materials / furniture / lighting / finance / proptech / vastu
3. Whether this brand's page should be dark theme or light theme

## Step 2 — Scrape the brand's website

Use WebFetch on homepage + about + work/portfolio + team + contact pages. Extract:
- Legal name and tagline (verbatim)
- Services / disciplines list
- Founder(s) and team names + roles + portrait URLs (real only)
- Real project list with names, clients, cities, image URLs
- Founding year (if published)
- Client list
- Real addresses, phone, email
- Social handles (Instagram, LinkedIn, Facebook, YouTube)
- Any brand film YouTube/Vimeo IDs

Save the scraped data as structured JSON in scratchpad. If a field is not published on the site, mark it TODO — do NOT invent.

## Step 3 — Sample the real palette

- `mkdir -p brand_assets/brands/$ARGUMENTS`
- Download the logo file to `brand_assets/brands/$ARGUMENTS/logo.png` (via curl)
- Read the image (tool renders it) — sample the accent color hex from your visual
- Neutral fallback tokens: near-black `#0F0D0E` (ink), off-white `#F5F0E8` or `#f5f5f5` (soft)
- Save your palette decision as a comment in scratchpad

## Step 4 — Download all real project images locally

For every project image URL scraped in step 2:
- `curl -sSL <url> -o brand_assets/brands/$ARGUMENTS/<name>.webp` (or .jpg)
- After all downloaded: `node _dev/tools/convert-images.mjs brands/$ARGUMENTS` for WebP/AVIF variants + LQIP manifest

## Step 5 — Copy the correct template

Based on the category from step 1:
- developer → `cp _dev/templates/brand-profile-developer.html brand-profile-$ARGUMENTS.html`
- architect | interior | materials | furniture | lighting → `cp _dev/templates/brand-profile-service.html brand-profile-$ARGUMENTS.html`
- other → `cp _dev/templates/brand-profile.html brand-profile-$ARGUMENTS.html`

**NEVER clone a shipped brand file** (godrej / horizon / suman / etc.).

## Step 6 — Populate the template

Follow the category's row in `docs/COMPOSITION-RULES.md` — section order, variant per section, motion profile.

- Head: title, meta description, canonical, og/twitter, preload logo, theme-color
- `<main>` inline tokens: `--brand`, `--brand-soft`, `--brand-ink` from step 3
- `<body data-theme="dark">` if dark
- Hero: real logo, real tagline, real name, real meta row
- About: real prose from scraped content (no invention)
- Work: real projects with local image paths from step 4
- Team: real people as monogram tiles (portraits only if real)
- Locations: real addresses from step 2
- Contact: real email, phone, sales@, etc.
- Every section that has no real data → hidden or empty-state fallback per composition rule

## Step 7 — Add routes

Update BOTH:
- `serve.mjs` — add `'/brands/$ARGUMENTS': '/brand-profile-$ARGUMENTS.html'`
- `vercel.json` — add `{ "source": "/brands/$ARGUMENTS", "destination": "/brand-profile-$ARGUMENTS" }`

## Step 8 — Audit

Run:
- `node _dev/tools/audit-chassis-drift.mjs` — no divergent per-tenant CSS
- `node _dev/tools/audit-visual-proof.mjs` — no empty `[hidden]` scaffolds
- `node _dev/tools/audit-token-coverage.mjs` — no hardcoded colors that should be tokens

Fix anything that flags before proceeding.

## Step 9 — Visual verify

Playwright screenshot at:
- 1440×900 (desktop)
- 390×844 (mobile)

Both must render correctly. Compare against a similar-category shipped tenant (`_dev/reference/tenant-matrix.html`) side by side.

## Step 10 — Commit (do NOT push)

`git add` the changed files (brand profile, routes, brand assets folder).  
`git commit` with a clear message.  
**Do not push** unless the user explicitly says "push".

---

**Reminder:** Every step above enforces a rule that has been violated in past sessions and cost hours of rework. Skipping any step re-creates those bugs. Follow it.
