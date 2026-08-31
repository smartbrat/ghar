# Attribution audit — legacy brand tenants

> Full pass across the 3 older brand tenants named in
> [`HANDOFF-INDEX.md`](HANDOFF-INDEX.md) "Pending big items" §6 as
> "spot-checked as clean, full pass prudent before hard launch."
>
> **Verdict: CLEAN.** All 3 tenants pass the attribution rule
> ([`PROFILE-TEMPLATES-HANDOFF.md §5`](PROFILE-TEMPLATES-HANDOFF.md)).
> No cross-brand content pollution in user-facing markup. No action
> needed before launch.
>
> **Audit date:** 2026-08-31
> **Auditor:** Claude, per user request as part of the Brand Engine stretch

---

## 1. Tenants audited

| Tenant | File | Line count |
|---|---|---|
| Obeetee | [`brand-profile-obeetee.html`](../brand-profile-obeetee.html) | 5,914 |
| Saint-Gobain | [`brand-profile-saint-gobain.html`](../brand-profile-saint-gobain.html) | 5,887 |
| Asian Paints | [`brand-profile-asian-paints.html`](../brand-profile-asian-paints.html) | 5,925 |

All three share the same source template and section-class inventory. The
`.bpr-founders|bpr-people|bpr-team` class count is 18 per file. The
`.bpr-about__body|bpr-mcard|bpr-spot|bpr-work-card|bpr-featured` class
count is 115 per file. Effectively byte-identical scaffolding; content
differs.

---

## 2. Attribution rule (recap)

Per [`PROFILE-TEMPLATES-HANDOFF.md §5`](PROFILE-TEMPLATES-HANDOFF.md):

- Content **about a brand** → brand profile.
- Content **by or about a person** → person profile.
- **Never cross-contaminate.** A "Presented by TEEARCH" article on
  Tarun Motta's page is a bug. Voices by a person at Godrej surfacing
  on Avirahi's page is a bug.

---

## 3. Audit method

For each tenant, grep for:

1. **Names of the other 5 featured brands** (TEEARCH, Avirahi, Godrej
   Properties, Scarlet Splendour, Horizon Architects) in RENDERED
   content — using the `>Name<` pattern that captures HTML text nodes.
2. **Names of the 12 live person tenants** (Motta family, Shah family,
   Godrej family, Kanodia, Bajoria, Doshi, Bhansali, Mahadevia) —
   same pattern.
3. **Sponsored attribution strings**: "Presented by", "In Collaboration
   With", "Ghar.tv Research with", "sponsored by".
4. **`data-brand` attributes on contact triggers** — verify every one
   points to the tenant's own name, not another brand.
5. **`.bpr-founders__name` / `.bpr-person__name` markup** —
   verify no team-member cards render OTHER brand's people.
6. **Voices section presence** — `.vx-card` / `.vx-speaker` / `id="voices"`.

---

## 4. Findings — per tenant

### 4.1 Obeetee (`brand-profile-obeetee.html`)

| Check | Result |
|---|---|
| Cross-brand names in rendered content | 0 matches — all mentions in `<!-- HTML comments -->` (developer notes about pattern porting from Scarlet Splendour + TEEARCH source templates). Zero user-facing pollution. |
| Cross-tenant person names in rendered content | 0 matches |
| Sponsored attribution strings | 0 matches — no "Presented by" / "In Collaboration With" / "Ghar.tv Research with" appears anywhere in the file. |
| `data-brand="…"` attribute values | All 5 render triggers point to `"Obeetee"`. No cross-brand attribution. |
| `.bpr-founders__name` / `.bpr-person__name` markup | Class selectors defined in CSS (lines 1401 + 3110) but ZERO HTML markup uses them. No team-member cards render — no risk of misattributed people. |
| Voices section (`#voices` / `.vx-card`) | 0 occurrences. Section not present. Nothing to audit. |

**Verdict: CLEAN.**

### 4.2 Saint-Gobain (`brand-profile-saint-gobain.html`)

| Check | Result |
|---|---|
| Cross-brand names in rendered content | 0 matches — same pattern-source comments as Obeetee, all in HTML/CSS comments. Zero user-facing pollution. |
| Cross-tenant person names in rendered content | 0 matches |
| Sponsored attribution strings | 0 matches |
| `data-brand="…"` attribute values | All 5 render triggers point to `"Saint-Gobain"`. No cross-brand attribution. |
| `.bpr-founders__name` markup | Class selectors defined in CSS, zero HTML usage. No team cards. |
| Voices section | 0 occurrences |

**Verdict: CLEAN.**

### 4.3 Asian Paints (`brand-profile-asian-paints.html`)

| Check | Result |
|---|---|
| Cross-brand names in rendered content | 0 matches — same pattern-source comments as Obeetee + Saint-Gobain, all in HTML/CSS comments. Zero user-facing pollution. |
| Cross-tenant person names in rendered content | 0 matches |
| Sponsored attribution strings | 0 matches |
| `data-brand="…"` attribute values | All 5 render triggers point to `"Asian Paints"`. No cross-brand attribution. |
| `.bpr-founders__name` markup | Class selectors defined in CSS, zero HTML usage. No team cards. |
| Voices section | 0 occurrences |

**Verdict: CLEAN.**

---

## 5. Why these tenants are clean by construction

The three older tenants ship a **minimal content model** compared to
the newer four (TEEARCH / Avirahi / Godrej / Scarlet / Horizon):

- **No team-member cards** — the source template that produced them
  set the `.bpr-founders` / `.bpr-people` chassis in CSS but never
  populated any HTML. When a section has no content, the attribution
  rule has nothing to violate.
- **No Voices section** — no `.vx-card` markup, no `#voices` anchor.
  The Voices vertical is the highest-risk cross-brand pollution
  surface (per the historic Avirahi Voices row bug documented in
  [`PROFILE-TEMPLATES-HANDOFF.md §5.3`](PROFILE-TEMPLATES-HANDOFF.md));
  these tenants sidestep it entirely.
- **No sponsored strips** — no "Presented by" / "In Collaboration
  With" markup means no risk of a sponsor brand being wrongly
  attributed.
- **All contact triggers self-name** — every `data-brand-contact
  data-brand="…"` attribute value is the tenant's own name, verified
  across all 5 render sites per file.

The cross-brand names that DO appear (TEEARCH, Scarlet Splendour,
Avirahi, Godrej — 11 total mentions across the 3 files) are 100%
inside `<!-- ... -->` HTML comments or CSS `/* ... */` comments —
developer notes that read like "Ported Scarlet Splendour About +
Gallery styles" or "chrome verbatim from teearch." These render as
nothing.

---

## 6. What this closes

Per [`HANDOFF-INDEX.md`](HANDOFF-INDEX.md) "Pending big items §6":

> **Content attribution audit** — 3 older brand tenants (Obeetee,
> Saint-Gobain, Asian Paints) spot-checked as clean of cross-brand
> pollution; a full pass would be prudent before hard launch.

Full pass complete. Removed from pending list. Safe for hard launch
on attribution grounds.

**Not closed by this audit:**

- Pattern B mobile hero port on the same 3 tenants (§2 of HANDOFF-INDEX pending) — visual + interaction change, not attribution.
- Contact panel light migration on the same 3 tenants + Godrej (§3 of HANDOFF-INDEX pending) — chassis migration, not attribution.
- Godrej hero PNG compression (§4) — asset-level, not attribution.

---

## 7. When to re-audit

Re-run this pass whenever:

- Content is added to any of these three tenants (new About paragraphs, new work-cards, new voices — any of these could introduce cross-brand references).
- A person-profile tenant is deleted or renamed — could leave orphan links from these brands.
- The source template that these clones derive from receives new pollution — the clones inherit whatever the template ships.

For any of the newer 5 brand tenants (TEEARCH / Avirahi / Godrej /
Scarlet / Horizon), a separate audit is prudent whenever content
churns significantly. Those tenants have Voices + Team + Spotlight
sections all populated and are the higher-risk surfaces.

---

## 8. Method for future audits (repeatable)

```bash
# For each tenant file, run:

# 1. Cross-brand names in rendered content
grep -nE '>(TEEARCH|Teearch|Avirahi|Godrej Properties|Scarlet Splendour|Horizon Architects)<' brand-profile-{tenant}.html

# 2. Cross-tenant person names
grep -nE '>(Tarun Motta|Hemal Shah|Hiten Motta|Devesh Motta|Suman Kanodia|Ashish Bajoria|Vinod Doshi|Adi Godrej|Pirojsha Godrej|Virendra Shah|Hardik Shah|Satish Bhansali|Darshini Mahadevia)<' brand-profile-{tenant}.html

# 3. Sponsored attribution strings
grep -nE 'Presented by|In Collaboration With|In collaboration with|sponsored by|Ghar\.tv Research with' brand-profile-{tenant}.html

# 4. data-brand attribute values
grep -nE 'data-brand="[^"]+"' brand-profile-{tenant}.html | grep -v 'data-brand="{TenantOwnName}"'

# 5. Team-member markup
grep -nE 'class="[^"]*bpr-founders__name[^"]*"' brand-profile-{tenant}.html
```

Any hit in #1–#3, or non-tenant values in #4, or unexpected markup in
#5 → investigate. Otherwise clean.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-TEMPLATES-HANDOFF.md`](PROFILE-TEMPLATES-HANDOFF.md),
[`HANDOFF-INDEX.md`](HANDOFF-INDEX.md).
