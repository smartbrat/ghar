# Brand Capability Matrix — capability × package

> The commercial reference. Which capabilities each package includes,
> which are add-ons, which are unavailable. Companion doc for the
> `/brand-connect` public landing page + the internal rate card.
>
> **Rule.** This document lives in `docs/` (programmer + editorial
> shared). The rate card ([`RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md))
> lives alongside and is **internal only** — never render publicly.
>
> **Source of truth.** The `packages` + `package_capabilities` +
> `capabilities` tables (see [`ENTITLEMENTS.md`](ENTITLEMENTS.md) §1).
> This document is the human-readable projection. If tables change,
> update this doc; if this doc changes, update tables.

---

## 1. The matrix

Rows = capabilities (grouped by scope). Columns = the three seed packages.

**Legend:**

- **✓** — included with unlimited use
- **✓ (N)** — included with a numeric limit
- **✓ (Nyr)** — included with a per-year limit
- **✗** — not included; not available as add-on
- **☆** — not included; available as add-on

### Profile section capabilities

| Capability | Presence | Spotlight | Partner |
|---|---|---|---|
| `basic_profile` | ✓ (1) | ✓ (1) | ✓ (1) |
| `enhanced_profile` | ✗ | ✓ (1) | ✓ (1) |
| `custom_hero_ambient` | ✗ | ✓ (1) | ✓ (1) |
| `commissioned_film` | ✗ | ☆ | ✓ (1yr) |
| `premium_theme` | ✗ | ✓ (1) | ✓ (1) |
| `motion_cinematic` | ✗ | ✓ | ✓ |
| `contact_dark_variant` | ✓ | ✓ | ✓ |
| `person_profile` | ✓ (1) | ✓ (1) | ✓ (1) |
| `person_profile_enhanced` | ✗ | ✓ (3) | ✓ (10) |
| `person_profile_leadership_grid` | ✗ | ✓ (1) | ✓ (1) |

### Distribution capabilities

| Capability | Presence | Spotlight | Partner |
|---|---|---|---|
| `directory_listing` | ✓ | ✓ | ✓ |
| `category_priority` | ✗ | ✓ | ✓ |
| `locality_priority` | ✗ | ☆ | ✓ |
| `homepage_placement` | ✗ | ☆ | ✓ |
| `newsletter_distribution` | ✗ | ☆ | ✓ (4yr) |
| `premium_distribution` | ✗ | ☆ | ✓ |
| `editorial_recommendation` | ✗ | ✓ | ✓ |
| `search_priority` | ✗ | ☆ | ✓ |

### Content production capabilities

| Capability | Presence | Spotlight | Partner |
|---|---|---|---|
| `sponsored_story` | ✗ | ☆ | ✓ (4yr) |
| `ghartalks_appearance` | ✗ | ☆ | ✓ (2yr) |
| `videoworks_short` | ✗ | ☆ | ✓ (2yr) |
| `videoworks_long` | ✗ | ☆ | ✓ (1yr) |
| `intelligence_integration` | ✗ | ✓ (2) | ✓ |
| `voices_curation` | ✗ | ✓ (6) | ✓ |
| `creator_campaign` | ✗ | ☆ | ✓ (1yr) |
| `event_sponsorship` | ✗ | ☆ | ✓ (1yr) |

### Analytics capabilities

| Capability | Presence | Spotlight | Partner |
|---|---|---|---|
| `analytics_basic` | ✓ | ✓ | ✓ |
| `analytics_full` | ✗ | ✓ | ✓ |
| `lead_capture` | ✓ | ✓ | ✓ |
| `lead_routing` | ✗ | ✓ | ✓ |
| `analytics_export` | ✗ | ☆ | ✓ |

### Service capabilities

| Capability | Presence | Spotlight | Partner |
|---|---|---|---|
| `account_manager` | ✗ | ✓ (1) | ✓ (1) |
| `custom_component` | ✗ | ☆ | ✓ (1yr) |
| `priority_support` | ✗ | ☆ | ✓ |
| `onboarding_assistance` | ✗ | ☆ | ✓ |

---

## 2. Package positioning

### Presence (₹15,000 / month)

> **The baseline.** For brands that want to exist on Ghar.tv but don't need distribution or content.

- Basic brand profile at `/brands/{slug}` with the default template.
- Directory listing on `/brands` — organic, no priority.
- Basic contact form + lead capture.
- Basic page-view analytics.
- One person profile (typically the founder).

**Best for:** Emerging brands establishing a public identity. Small studios. Regional developers with 1–2 projects.

**Not enough for:** Brands that want editorial coverage, distribution, or premium visual treatment.

### Spotlight (₹60,000 / month)

> **The middle.** For brands that want authority + curated content + moderate distribution.

Everything in Presence, plus:

- Enhanced profile (all premium section variants).
- Custom ambient hero SVG.
- Premium brand theme customisation.
- Cinematic motion profile.
- Priority placement in category directories.
- Editorial recommendation across article recirculation.
- Up to 6 curated voice entries.
- Up to 3 enhanced person profiles + one leadership grid variant.
- Up to 2 intelligence report integrations.
- Full analytics + lead routing to brand's CRM.
- Dedicated account manager.

**Best for:** Established brands with a strong body of work + editorial appetite. Architecture practices with a signature aesthetic. Materials brands with product depth.

**Not enough for:** Brands that want a commissioned film, GharTalks appearance, homepage placement, or unlimited person profiles.

### Partner (₹200,000 / month)

> **The top.** For brands where Ghar.tv becomes a strategic marketing partner.

Everything in Spotlight, plus:

- 1 commissioned brand film per year.
- 4 sponsored stories per year.
- 2 GharTalks appearances per year.
- 2 short-form + 1 long-form VideoWorks per year.
- Homepage carousel placement.
- Newsletter feature (4 per year).
- Locality + search priority.
- Unlimited premium distribution slots.
- Up to 10 enhanced person profiles.
- 1 creator campaign + 1 event sponsorship per year.
- 1 custom bespoke component per year.
- Priority support + white-glove onboarding.
- Analytics export.

**Best for:** Real estate developers with active project marketing. Luxury brands. Materials brands with national reach. Design brands establishing authority across categories.

**Best for editorial partners:** Brands where Ghar.tv is committed to producing original content over the year.

---

## 3. Add-ons

Individual capabilities purchasable outside a package (via `brand_entitlement_overrides` in [`ENTITLEMENTS.md §7`](ENTITLEMENTS.md)).

Add-on pricing is internal only — see [`RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md).

**Common add-ons:**

| Add-on | Typical use case |
|---|---|
| `commissioned_film` | Spotlight brand doing a launch campaign |
| `sponsored_story` | Presence brand with one story to tell |
| `ghartalks_appearance` | Founder of a Presence-tier brand who has news |
| `homepage_placement` | Spotlight brand with a project launch |
| `newsletter_distribution` | Brand with time-sensitive announcement |
| `videoworks_short` | Presence or Spotlight brand doing an event |
| `event_sponsorship` | Brand sponsoring a specific GharEvents franchise |

Add-ons carry `expires_at` — the capability grants for the campaign
window then reverts.

---

## 4. Custom bundles

Not every commercial arrangement fits Presence / Spotlight / Partner.

**Custom bundle** = a private package (`is_public = FALSE`) with a
bespoke capability set.

**Existing custom bundle candidates** (not yet created):

- `godrej-corporate` — bespoke bundle for Godrej Group (parent + subsidiaries).
- `enterprise-developer` — for developers with 20+ projects wanting bulk.
- `campaign-annual` — one-off yearly campaign bundle with heavy content-production.

Commercial team defines bundle contents. Programmer creates via
`INSERT INTO packages` + `INSERT INTO package_capabilities`.

---

## 5. Trial + demo

**Trial:** any brand can be given a 30-day free trial of any package via
`brand_entitlement_overrides` with `action='grant'` on every capability
in the package and `expires_at = NOW() + INTERVAL 30 DAY`.

**Demo:** internal demo tenants (`is_public = FALSE` on the brand
itself) get any package for free permanently, for sales conversations.

---

## 6. Upgrade / downgrade

Handled at the entitlement level (see [`ENTITLEMENTS.md §9`](ENTITLEMENTS.md)).

**Common paths:**

- Presence → Spotlight: usually driven by editorial (brand wants to publish a sponsored story or commission an intelligence report).
- Spotlight → Partner: usually driven by distribution + film ambition.
- Downgrade: rare; retention issue. Downgrade preserves published content (film, stories) but stops new content production.

---

## 7. What each package COSTS Ghar.tv (rough)

Internal only. See rate card for details. This gives an order-of-magnitude sense.

| Package | Marginal cost per brand per month (approx.) | Where the cost sits |
|---|---|---|
| Presence | ₹500 – ₹1,000 | Hosting + storage + lead-forwarding infra |
| Spotlight | ₹8,000 – ₹15,000 | AM time + editorial curation + intel report proration |
| Partner | ₹80,000 – ₹120,000 | Film crew + editorial commissioning + GharTalks production + homepage inventory opportunity cost |

The margin at Partner is the highest ROI slot in the business. Every
Partner conversation matters.

---

## 8. The public `/brand-connect` page consumes this data

The [`brand-connect.html`](../brand-connect.html) commercial landing
reads from the `packages` + `package_capabilities` tables at render
time. The table above is the canonical human-readable version; the
public page's package-comparison table auto-derives from the same data.

**Editable at the public layer:**
- Package name (display)
- Package headline / deck (marketing copy)
- Package hero image
- CTA copy

**Derived from tables — cannot drift:**
- Which capabilities are included per package
- Numeric limits per capability
- Whether a capability is add-on-available

---

## 9. What a brand actually receives

Concrete deliverables per package. This is the sales conversation
crib-sheet.

### Presence

- `/brands/{slug}` page — one, live within 48 hours of onboarding.
- Directory listing.
- Contact form → leads to brand.
- Monthly analytics snapshot.
- Founder person profile.

### Spotlight

Everything in Presence, plus:

- Enhanced profile with premium visual treatment (ambient hero, cinematic motion, curated projects grid).
- Category priority (top 4–8 in `/brands?cat=X` for the brand's category).
- Featured in article recirculation.
- Team page with up to 3 enhanced person profiles (co-founders / principal architects).
- 2 intelligence reports co-published per year.
- 6 curated voice entries.
- Full analytics + CRM lead routing.
- Named account manager.
- Response SLA: 24 hours.

### Partner

Everything in Spotlight, plus:

- 1 commissioned brand film per year (5–10 min, Ghar.tv-produced).
- 4 sponsored editorial stories per year.
- 2 GharTalks podcast appearances per year (founder / leadership).
- 2 short VideoWorks + 1 long VideoWorks per year.
- Homepage carousel presence.
- 4 newsletter features per year.
- Locality + search priority.
- Up to 10 enhanced person profiles.
- 1 creator network campaign per year.
- 1 GharEvents sponsorship per year.
- Bespoke component build (1 per year).
- Response SLA: 4 hours.

---

## 10. How to change this matrix

**Any change to a package is a commercial decision.** Product / editorial owns it. Sequence:

1. Product proposes change (add capability / change limit / add package).
2. Editorial + tech review — check downstream impact on live tenants.
3. Update the tables:
   - `INSERT` into `capabilities` if new capability
   - `INSERT / UPDATE / DELETE` in `package_capabilities`
   - `UPDATE packages.updated_at`
4. Update this doc's matrix.
5. Notify all customers on affected packages (grandfather existing agreements OR renegotiate).
6. Update `brand-connect.html` marketing copy if needed.

---

## 11. Grandfathering

Existing customers keep their contracted capability set even if the
package changes.

**Implementation:** on any package change, snapshot the customer's
current capability set into `brand_entitlement_overrides` with
`granted_by = 'grandfather'` before applying the new package.

Query at renewal time: does the customer want to move to the new
package OR keep the grandfathered set?

---

## 12. Historical package evolution

Track when each package changed. Not the tables — separate audit log.

```sql
CREATE TABLE package_change_log (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  package_id     INT NOT NULL,
  change_type    ENUM('capability_added','capability_removed','limit_changed','price_changed','description_changed','deactivated','reactivated'),
  before         JSON,
  after          JSON,
  reason         TEXT,
  changed_by     VARCHAR(120),
  changed_at     DATETIME NOT NULL
);
```

Feeds sales conversations ("Yes, Spotlight used to include X, we moved
that to Partner in 2027 — here's why").

---

**Last updated:** 2026-08-31. Companion:
[`ENTITLEMENTS.md`](ENTITLEMENTS.md),
[`RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md),
[`BRAND-ENGINE-ARCHITECTURE.md`](BRAND-ENGINE-ARCHITECTURE.md).
