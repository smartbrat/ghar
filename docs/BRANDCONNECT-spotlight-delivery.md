# Brand Connect: what we actually deliver

Status: **built and working**, TEEARCH is the live reference implementation.
Nothing here is aspirational. Every line describes a surface that renders today
on `/brands` and `/people`.

Written because the packages were originally promised as "homepage spotlight"
against a carousel that could not honour it at scale. This is the corrected,
deliverable definition. Sales should quote from this file.

The document covers all three tiers (Listed, Featured, Signature) because
placement mechanics are what actually differentiates them at scale, and
"Featured" is only meaningful in contrast to what Listed and Signature get.

---

## MVP state (2026-08-06)

The In Focus hero block on `/brands` and `/people` is **temporarily hidden**
while the visual is being reworked (the previous 4:5-photo layout has been
retired, the replacement `.if-block` chassis is in `design-system.html` but
needs another pass before it ships).

What still renders today, unchanged:

- Every Featured and Signature tenant is pinned to grid position 0 of their
  category (top-of-category is the core deliverable).
- Their card carries a **tier badge** naming the paid package (`Featured` or
  `Signature`), so the priority reads visually without the hero block.
- Every named founder of a paid brand inherits the brand's tier badge on
  `/people` (co-founder inheritance rule — see §4).
- Listed tenants live in the alphabetical grid below, unbadged.

When the In Focus block un-hides, the rotation math in section 3 below fires
again on top of the pinned placement. Nothing about the sales language changes
in either state — the pin + the badge honour the top-of-category promise on
their own.

---

## Tier model — what each package buys on the directory

The three placement states are what actually differentiate the tiers at scale.
This is the deliverable sales can point at during a demo.

**2026-08-07 rename:** packages renamed from Presence / Spotlight / Partner
to **Listed / Featured / Signature** so package name = badge label = card
label. Sales, customer, and visitor all read the same word. Historical decks
still use the old names; rate and deliverables are unchanged.

| Tier | Grid placement | Card badge | Featured surface (post-MVP) |
|------|---------------|------------|-----------------------------|
| Listed | Alphabetical within category | None | None |
| Featured | Pinned to head of category (position 0) | `Featured` (warm Turmeric two-tone) | Rotates into the In Focus block. Share of days = share of package. |
| Signature | Pinned to head of category (position 0) | `Signature` (dark ink pill + Terracotta accent) | Permanent In Focus resident. Never rotates out. |

**Visual hierarchy is deliberate:** the Signature badge sits on a **darker**
pill than Featured, not just a different warm tint. A visitor reads the tier
at a glance without needing to remember which colour ranks higher.

**Why Listed has no badge:** three tiers with three badges reads like three
grades of "featured" and devalues the top two. Listed is the entry tier —
the honest signal is that the card is here, in the directory, at all. The
badge is what Featured and Signature tenants pay to earn.

**When Signature and Featured tenants share a category:** Signature holds
its pin permanently at position 0. If a Signature already holds position 0,
Featured tenants queue at positions 1..N in daily-rotating order (see
section 3). The Signature tier never rotates out.

**Class names + files:**

- CSS: `.brand-card__badge--featured` / `--signature` in `brands.html` inline
  block; `.bpr-person__badge--featured` / `--signature` in `people.html`
  inline block. Legacy aliases `--spotlight` (→ Featured) and `--partner`
  (→ Signature) are retained so any un-migrated markup still renders;
  migrate to the new names when a card is touched.
- The retired `--focus` class was tied to the In Focus hero. Both usages have
  been unstamped since the label makes a claim about a surface that no longer
  renders.

---

## The surfaces

| # | Deliverable | Where | Scales to N tenants? |
|---|---|---|---|
| 1 | Profile microsite | `/brands/{slug}` | Yes, one page each |
| 2 | Founder page, one nominated person | `/people/{slug}` | Yes, one page each |
| 3 | Top of category in the directory grid | `/brands`, `/people` | Yes, categories partition the set |
| 4 | In Focus block, rotating daily | `/brands`, `/people` | Yes, bounded at one visible (currently hidden — MVP) |
| 5 | Contact routed to the brand | contact modal, every card | Yes |

---

## 1. The In Focus block

A full-width identity block directly above the directory. **Exactly one renders
at a time**, however many tenants exist. That single decision is what makes the
package scale.

**Identity-led, not photo-led.** Brand colour canvas, the brand's own logo,
their name, one line, their city, a CTA. Photography is an *optional* media
column.

This matters commercially and editorially. The previous design was a 4:5 photo
card, which *required* a photograph. A brand without usable imagery got a stock
photo, and one such image (a Polish shipyard, and another of two Western people
at a whiteboard) was briefly live against TEEARCH's name. Identity-led removes
the incentive to fabricate: a brand with no photography still gets a complete,
honest, on-brand block.

Per tenant you need only:

- brand hex, verified against the brand's own site
- their logo file
- one sentence, factual
- city
- optionally, one real project image from their own work, never stock. Its
  RIGHT-EDGE tone must sit in the same colour family as the brand hex, or the
  panel gradient shows a seam

## 2. Rotation, and how it scales

Selection is **deterministic by date**, not random:

```
index = daysSinceLocalEpoch % numberOfBlocks
```

- Every tenant holds the slot an equal number of days.
- The schedule is computable months ahead, so a client can be told exactly
  which days are theirs.
- Two people opening the page on the same day see the same tenant, which
  matters when the team is demoing.
- Turnover is at local midnight, not UTC, so it reads correctly for an Indian
  audience.

**Share of days is share of blocks.** A tenant who should appear more often
simply gets more than one block in the rotator. That is how the Signature
tier outranks Featured without any new code.

**Why one at a time rather than a carousel:** a rail hides tenants behind a
swipe on small screens, and paid placement that needs a swipe is undelivered
inventory. With one block, the page shape is identical at 1 tenant or 30, and
nothing is ever hidden.

**Honest framing for the client:** you are not permanently in the banner, you
are in the banner 1 day in N, and you are *permanently* first in your category
in the directory below. Both are visible on every page load.

## 3. Top of category

The directory is one flowing grid that preserves DOM order when filtered, so
being first in the markup **is** the deliverable. A Featured (or Signature)
tenant is placed at the head of its category, and is therefore the first
result whenever a visitor filters to that category.

This scales cleanly because categories partition the set: twenty tenants across
seven categories is roughly three per category. Where two tenants share a
category, the same daily rotation decides who leads.

## 4. Co-founder inheritance on /people

Every **named founder** of a paid brand carries the brand's tier badge on
their `/people` card. Non-founder team members (associates, PMs, junior
architects, sales) get an ordinary profile with top-of-discipline ordering
but no badge.

The rule is **cap by role, not by count.** A firm with 3 co-founders and 12
associates gets 3 badged cards, not 12. A firm with 1 founder and 20
associates gets 1. Anti-flooding is preserved (a ten-person firm doesn't
overrun `/people`) without penalising firms that have legitimate multiple
equal founders.

Source of truth: the brand's own "Founders" or "Partners" list on their
site, mirrored into the brandconnect record as `founders: [<slug>, …]`.

**Earlier "one nominated person" rule (retired 2026-08-07):** it was too
tight. It broke the moment a firm with equal co-founders signed up (the
first case was TEEARCH: Tarun and Hiten Motta are both co-founders and
Principal Architects). Nominating one over the other creates internal
politics we shouldn't create.

TEEARCH now: Tarun Motta AND Hiten Motta both carry the Featured badge.
Devesh Motta and the rest of the team sit unbadged at top-of-discipline
order. All three are still on `/people/{slug}` as ordinary profiles.

---

## Live reference: TEEARCH

| Item | Value |
|---|---|
| Package | Featured (previously "Spotlight" — renamed 2026-08-07) |
| Brand hex | `#c67e35`, verified against teearch.in |
| Logo | `brand_assets/brands/teearch.jpg` |
| Featured media, /brands | `teearch-project-1.png`, real tower from their portfolio |
| Featured media, /people | `teearch-tarun-motta.jpg`, `teearch-hiten-motta.jpg`, real portraits |
| Badged founders | Tarun Motta, Hiten Motta (both co-founders) |
| Category | Interior design and architecture, first card |
| Profile | `/brands/teearch` |

**Quarantined:** `brand_assets/_quarantine-stock/` holds two stock photos
previously attached to TEEARCH. Do not reuse them. Brand imagery comes from the
brand's own site, never a stock library.

---

## Adding the next tenant

1. Append an `<aside class="dp-adslot sp-block">` to the `.sp-rotator` in
   `brands.html`, and add a record to the `SPOTLIGHT` array in the `/people`
   generator. Tier order first.
2. Set `--brand-canvas` to their verified hex on `.dp-adslot__inner`. Keep
   `--brand-text:#fff` unless the hex is light, in which case set it to
   `var(--ink)` and check the CTA pill still reads.
3. Check the image's **right-edge tone** sits in the same colour family as the
   hex. The panel gradient fades into it from 60%, and a mismatched family
   shows a visible seam.
4. Move their directory card to the head of its category.
5. Nominate exactly one person for `/people`.
6. Use their own imagery, or none. Never stock.

No other change is needed. Rotation, layout and mobile behaviour all follow.

---

## Implementation

| Piece | Lives in |
|---|---|
| Block visuals | `.dp-adslot` chassis, reused verbatim from the /design banners |
| Rotation + logo lockup, `.sp-*` | `styles.css`, shipped in `dist/styles.min.css` |
| Rotation, `gharSpotlightRotate()` | `main.js`, shipped in `dist/main.min.js` |
| `/brands` markup | `brands.html`, section "ACT 2 SPOTLIGHT" |
| `/people` markup | generated, `SPOTLIGHT` array in the generator |

Without JavaScript the first block renders, so the surface is never empty.
