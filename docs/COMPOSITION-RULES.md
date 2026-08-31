# Composition Rules — category × section

> Which sections a profile renders, in what order, at what priority, with
> which default variant — per entity category. Read alongside
> [`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json) (the section
> registry) and [`ENTITLEMENTS.md`](ENTITLEMENTS.md) (which sections are
> gated by package).
>
> **Load-bearing rule.** These rules encode `required / preferred / optional
> / premium / fallback / irrelevant` per section per category. The composer
> reads them at render time. Admin per-tenant overrides via
> `profile_section_configs` win over these defaults.

---

## Priority vocabulary

| priority | meaning | composer behaviour |
|---|---|---|
| `required` | Section always renders for this category. Empty content = fallback OR editorial "we're gathering this" panel. | Never hide unless admin explicitly disables. |
| `preferred` | Section renders when data is available. Section hides silently when empty. | Default behaviour. Most sections are preferred. |
| `optional` | Section renders only when admin enables it in the per-tenant config OR content resolver returns data. | Hidden by default. |
| `premium` | Section requires an entitlement (see `PROFILE-SECTIONS-SPEC.json` `entitlement_gates`). | Hidden if entitlement missing; admin sees "upgrade to unlock" chip in admin UI. |
| `fallback` | Section renders only when other required sections are empty. | Rare — used to make sparse pages feel complete. |
| `irrelevant` | Section never renders for this category. | Not shown in admin section library either. |

---

## Composition table shape

```sql
CREATE TABLE category_composition_rules (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  entity_type       ENUM('brand','person'),
  category_slug     VARCHAR(80) NOT NULL,
  section_id        VARCHAR(80) NOT NULL,       -- FK to PROFILE-SECTIONS-SPEC.json
  priority          ENUM('required','preferred','optional','premium','fallback','irrelevant'),
  variant_default   VARCHAR(80),
  motion_profile    VARCHAR(80),                -- optional per-section motion override
  display_order     INT DEFAULT 100,
  UNIQUE KEY category_section (entity_type, category_slug, section_id)
);
```

Seed with the tables below.

---

## Brand categories — vocabulary

Aligned with the `/brands` directory's `data-cat` values and the
[`docs/BRIEF-brands-srp.md`](BRIEF-brands-srp.md) `PARENTS` taxonomy.

| category_slug | Label | Examples on Ghar.tv today |
|---|---|---|
| `developer` | Real Estate Developer | Godrej Properties, Avirahi Group |
| `architect` | Architecture Practice | TEEARCH, Horizon Architects |
| `interior` | Interior Studio | (future tenants) |
| `materials` | Building Materials | Saint-Gobain, Asian Paints |
| `furniture` | Furniture / Design | Scarlet Splendour, Obeetee |
| `lighting` | Lighting | (future tenants) |
| `finance` | Home Loans / NBFCs | (future tenants) |
| `proptech` | PropTech | (future tenants) |
| `vastu` | Vastu Consulting | (future tenants) |

---

## Person disciplines — vocabulary

Aligned with `people.cat_id` and [`docs/BRIEF-people-pages.md §4`](BRIEF-people-pages.md).

| category_slug | Label | Examples on Ghar.tv today |
|---|---|---|
| `architects` | Architects | Tarun/Devesh/Hiten Motta, Hemal Shah |
| `interiors` | Interior Designers | (future) |
| `developers` | Developers / Founders | Pirojsha Godrej, Adi Godrej, Vinod Doshi |
| `brandleaders` | Brand leadership | Ashish Bajoria, Suman Kanodia (Bajoria) |
| `advisors` | Advisors / Consultants | (future) |
| `research` | Research / Academia | Darshini Mahadevia |

---

## Brand seed rules

### Developer (Real Estate Developer)

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | classic | 10 | cinematic |
| about | required | default | 20 | editorial |
| work | required | grid | 30 | cinematic |
| recognition | preferred | strip | 40 | editorial |
| team | preferred | founder | 50 | editorial |
| timeline | optional | vertical | 60 | editorial |
| presence | required | city_cards | 70 | editorial |
| intelligence | premium | title_card | 80 | editorial |
| voices | optional | grid | 90 | editorial |
| spotlight | optional | mixed | 100 | editorial |
| film | premium | inline | 110 | cinematic |
| related | preferred | same_project_brands | 180 | editorial |
| contact | required | dark | 200 | minimal |
| products | irrelevant | — | — | — |
| clients | irrelevant | — | — | — |
| closer | irrelevant | — | — | — |

**Notes:**
- `hero.variant=classic` is legacy; new developer tenants should use `split` once Pattern-B port lands on Godrej.
- `contact.variant=dark` matches Godrej's current treatment. Migration to `light` is Phase 2 work.

### Architect (Architecture Practice)

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | ambient | 10 | editorial |
| about | required | seamless | 20 | editorial |
| work | required | editorial | 30 | editorial |
| team | preferred | leadership | 40 | editorial |
| recognition | preferred | strip | 50 | editorial |
| presence | preferred | list | 60 | editorial |
| voices | optional | grid | 70 | editorial |
| spotlight | optional | mixed | 80 | editorial |
| intelligence | premium | title_card | 90 | editorial |
| related | preferred | same_project_brands | 180 | editorial |
| contact | required | light | 200 | minimal |
| products | irrelevant | — | — | — |
| clients | preferred | logo_wall | 45 | editorial |
| timeline | irrelevant | — | — | — |
| film | premium | inline | 100 | cinematic |
| closer | irrelevant | — | — | — |

**Notes:**
- `hero.variant=ambient` is Horizon's warm SVG pattern. Fallback to `split` for tenants without an ambient graphic.
- `work.variant=editorial` gives each project story-shaped context. Requires `enhanced_profile`.

### Interior Studio

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | split | 10 | editorial |
| about | required | default | 20 | editorial |
| work | required | editorial | 30 | editorial |
| team | preferred | leadership | 40 | editorial |
| clients | preferred | logo_wall | 50 | editorial |
| recognition | preferred | strip | 60 | editorial |
| presence | preferred | list | 70 | editorial |
| voices | optional | grid | 80 | editorial |
| spotlight | optional | mixed | 90 | editorial |
| contact | required | light | 200 | minimal |

### Materials (Building Materials)

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | classic | 10 | dynamic |
| about | required | default | 20 | editorial |
| products | required | catalog | 30 | dynamic |
| clients | preferred | logo_wall | 40 | editorial |
| work | optional | grid | 50 | editorial |
| team | fallback | grid | 60 | editorial |
| presence | preferred | list | 70 | editorial |
| voices | optional | grid | 80 | editorial |
| spotlight | optional | mixed | 90 | editorial |
| contact | required | light | 200 | minimal |
| recognition | optional | strip | 55 | editorial |

### Furniture / Design

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | split | 10 | dynamic |
| about | required | default | 20 | editorial |
| products | required | collection | 30 | dynamic |
| team | preferred | grid | 40 | editorial |
| work | optional | grid | 50 | editorial |
| presence | preferred | list | 60 | editorial |
| voices | optional | grid | 70 | editorial |
| clients | optional | logo_wall | 80 | editorial |
| recognition | optional | strip | 90 | editorial |
| contact | required | light | 200 | minimal |

### Lighting

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | classic | 10 | dynamic |
| about | required | default | 20 | editorial |
| products | required | catalog | 30 | dynamic |
| clients | preferred | category_grid | 40 | editorial |
| work | optional | grid | 50 | editorial |
| presence | preferred | list | 60 | editorial |
| voices | optional | grid | 70 | editorial |
| contact | required | light | 200 | minimal |

### Finance (Home Loans / NBFCs)

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | classic | 10 | minimal |
| about | required | default | 20 | minimal |
| products | required | featured | 30 | minimal |
| presence | required | city_cards | 40 | minimal |
| recognition | optional | strip | 50 | minimal |
| voices | optional | grid | 60 | minimal |
| intelligence | premium | report_list | 70 | minimal |
| contact | required | dark | 200 | minimal |
| team | irrelevant | — | — | — |
| clients | irrelevant | — | — | — |

**Notes:**
- Motion profile is `minimal` throughout — reads as trustworthy, not showy. Financial audiences respond to calm.

### PropTech

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | split | 10 | dynamic |
| about | required | default | 20 | editorial |
| products | required | featured | 30 | dynamic |
| team | preferred | founder | 40 | editorial |
| clients | preferred | logo_wall | 50 | editorial |
| work | optional | grid | 60 | editorial |
| recognition | optional | strip | 70 | editorial |
| voices | optional | grid | 80 | editorial |
| intelligence | premium | report_list | 90 | editorial |
| contact | required | light | 200 | minimal |

### Vastu Consulting

| section | priority | variant | order | motion |
|---|---|---|---|---|
| hero | required | classic | 10 | minimal |
| about | required | default | 20 | minimal |
| specialises | preferred | warm_panel | 30 | minimal |
| team | preferred | founder | 40 | minimal |
| work | optional | grid | 50 | minimal |
| recognition | optional | strip | 60 | minimal |
| presence | preferred | list | 70 | minimal |
| voices | optional | grid | 80 | minimal |
| contact | required | light | 200 | minimal |

---

## Person seed rules

Person composition is constrained by the **universality rule** (see
[`BRIEF-people-pages.md §5`](BRIEF-people-pages.md)) — every person shares
the same base treatment (white, warm-white, ink, hairlines,
portrait-or-monogram). Category shapes which sections are EMPHASISED but
never the visual theme.

### Architects

| section | priority | variant | order |
|---|---|---|---|
| hero | required | portrait_first | 10 |
| facts | required | bordered_grid | 20 |
| about | required | manifesto | 30 |
| specialises | preferred | warm_panel | 40 |
| work | required | teaser | 50 |
| recognition | preferred | list | 60 |
| credentials | preferred | pair_list | 70 |
| voices | optional | grid | 80 |
| published | optional | multi_kind | 90 |
| related | preferred | co_workers | 100 |
| contact | required | button | 200 |
| closer | required | default | 210 |

Motion profile: `editorial` throughout.

### Interior Designers

Same as Architects with:
- `specialises.priority = required` (interior designers have stronger discipline signals)
- `work.variant = teaser` (still teaser; brand owns the portfolio)

### Developers / Founders

| section | priority | variant | order |
|---|---|---|---|
| hero | required | portrait_first | 10 |
| facts | required | bordered_grid | 20 |
| about | required | manifesto | 30 |
| work | preferred | teaser | 40 |
| recognition | preferred | list | 50 |
| published | preferred | multi_kind | 60 |
| voices | preferred | grid | 70 |
| related | required | co_workers | 80 |
| specialises | fallback | chip_list | 90 |
| credentials | optional | pair_list | 100 |
| contact | required | button | 200 |
| closer | required | default | 210 |

Motion profile: `cinematic` for hero, `editorial` throughout the body.

### Brand leadership (CEOs / MDs / Principal Officers)

Same as Developers with:
- `about.variant = manifesto` if bio available, otherwise `statement`
- `work.priority = optional` (they may not have hands-on projects)
- `voices.priority = required` (brand leaders' commentary is the point)

### Advisors / Analysts / Consultants

| section | priority | variant | order |
|---|---|---|---|
| hero | required | classic | 10 |
| facts | required | strip | 20 |
| about | required | statement | 30 |
| specialises | preferred | chip_list | 40 |
| work | fallback | grid_bare | 50 |
| published | required | multi_kind | 60 |
| voices | required | grid | 70 |
| recognition | optional | list | 80 |
| credentials | optional | pair_list | 90 |
| related | optional | similar_discipline | 100 |
| contact | required | button | 200 |
| closer | required | default | 210 |

Motion profile: `minimal`.

### Research / Academia

| section | priority | variant | order |
|---|---|---|---|
| hero | required | classic | 10 |
| facts | required | strip | 20 |
| about | required | manifesto | 30 |
| credentials | required | pair_list | 40 |
| published | required | multi_kind | 50 |
| specialises | preferred | chip_list | 60 |
| voices | preferred | grid | 70 |
| recognition | preferred | list | 80 |
| work | optional | grid_bare | 90 |
| related | optional | similar_discipline | 100 |
| contact | required | button | 200 |
| closer | required | default | 210 |

Motion profile: `minimal`.

---

## Rule inheritance

If a category is missing a rule for a section, the composer:

1. Checks a `default` catch-all category for the entity type
2. Falls back to `priority = preferred, variant = <first variant in registry>, order = 999`
3. Logs a warning to admin: "category `X` has no explicit rule for section `Y` — using default. Add a rule row."

---

## Adding a new category

1. Add row to `brand_categories_taxonomy` OR `person_disciplines_taxonomy`.
2. Add composition rules for every registered section — one row per section, even if `priority = irrelevant`.
3. Register the category in [`BRIEF-brands-srp.md`](BRIEF-brands-srp.md) `PARENTS` or [`BRIEF-people-pages.md`](BRIEF-people-pages.md) discipline list.
4. Add filter chip on `/brands` or `/people` directory.
5. Optional: add a category-specific hero graphic in `brand_assets/kit-assets/` if the category has a distinctive visual signature.

---

## Editing a rule for an existing category

Any composition rule change is a **product decision**, not a technical one.
Before editing:

1. Check which live tenants belong to this category.
2. Check whether the change breaks a currently-shipped tenant's expected layout.
3. Discuss with editorial. Composition rules encode editorial policy.

After editing:

1. Composer picks up the change on next render.
2. Cache invalidation for affected tenants.
3. Regression check per tenant (screenshot before/after).

---

## Per-tenant overrides

Any tenant can override any composition rule via `profile_section_configs`:

```sql
INSERT INTO profile_section_configs
  (entity_type, entity_id, section_id, is_enabled, display_order, variant, content_source)
VALUES
  ('brand', 42, 'timeline', TRUE, 65, 'horizontal', 'auto');
```

Overrides take precedence over composition rules. Admin UI surfaces the
composition rule as the default and shows overrides as diffs.

---

## Validation

On save (per `PROFILE-SECTIONS-SPEC.json` `validationOnSave`):

- Every section marked `required` for a category MUST have data OR admin must explicitly hide it.
- Every section with `requires_entitlement` MUST have the entitlement OR the section is silently skipped at render time.
- Variant MUST exist in the section's registered variant map.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json),
[`ENTITLEMENTS.md`](ENTITLEMENTS.md).
