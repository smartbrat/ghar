# Brand Engine Architecture — the skeleton

> **Purpose.** The proposed architecture for the Ghar.tv Brand Connect + Entity
> Publishing + Distribution Engine. Reads as the skeleton a programmer + team
> can implement against, and the shape a studio can commission tenant #9
> against without further design decisions.
>
> **Companion audit.** Read [`BRAND-ENGINE-AUDIT.md`](./BRAND-ENGINE-AUDIT.md)
> first — it establishes what already exists and what the gaps are. This
> document proposes how to close the gaps.
>
> **Not a rewrite.** The audit's central finding is: the article side of the
> house already has ~50% of what the brief asks for (block registry,
> auto-injection, component registry, sponsored semantics, structured
> metadata). This document extends the same shape to Brand + Person profiles,
> and adds an explicit entity + relationship + distribution layer around all
> three. Every shipped tenant page (8 brands, 12 people) has to be
> reproducible by the engine — visuals are approved and load-bearing.
>
> **How to read.** §1 is the mental model in one page. §§2–10 detail each
> layer. §§11–14 are the build sequence — folder structure, migration order,
> reference implementation phases, deliverables checklist. §15 is the
> handoff — what the programmer builds vs what the studio delivers.
>
> **What is deferred.** The reference chassis rebuilds themselves
> (`_dev/templates/brand-profile.html` + `person-profile.html` becoming
> canonical section-registry-driven templates) + the design-system.html
> catalog entries at `#brand-profile-fallbacks` come after this document is
> reviewed. The capability matrix (audit §E completed for the visual layer;
> extends here into a per-capability × per-package matrix once §7 packages
> stabilise) is authored last, once the entitlement engine is real.

---

## 1. The mental model in one page

Read this in one pass. Every layer below is just this diagram, elaborated.

```
                           GHAR.TV ENTITY LAYER

                    Brand ← relationships → Person
                       ↓                       ↓
                       └───→ Project ←────────┘
                              ↓
                       Product · Article · Video · Event
                              ↓
                       ┌──────┴─────────────────────────┐
                       │                                 │
                Content Resolver               Distribution Resolver
                       │                                 │
        ┌──────────────┴─────────┐                      │
        │                        │                      │
  Brand Page Composer   Person Page Composer            │
        │                        │                      │
  Section Registry ──────────────┤                      │
        │                        │                      │
  Composition Rules              │                      │
  (category-aware)               │                      │
        │                        │                      │
  Theme + Motion tokens          │                      │
        │                        │                      │
  Admin overrides                │                      │
        │                        │                      │
  Entitlement gates ─────────────┼──────────────────────┤
        │                        │                      │
   Rendered profiles       Rendered profiles     Rendered entity cards
   (brand + person)                              on N surfaces across
                                                 the portal
                                                         │
                                                 ┌───────┴───────┐
                                                 │               │
                                        Organic distribution   Promoted
                                        (relationship-driven)   (paid,
                                                                package-
                                                                gated)
```

**Layers, top to bottom:**

1. **Entities + relationships.** Facts. Brand X exists. Person Y exists. Person Y is currently a partner at Brand X (with a role and a start date). Project Z was designed by Brand X with Person Y as principal architect. All facts live in typed records + typed relationships; nothing else.

2. **Content resolver.** Given an entity id, return everything Ghar.tv knows about it — its direct fields, its relationships, and every content record linked to it (articles, videos, GharTalks episodes, intelligence reports, projects, listings). One resolver per entity type. Callers ask for what they need; the resolver caches.

3. **Section registry + composition rules.** For a profile page, the composer walks the section registry (which sections exist) + the composition rules for the entity's category (which of those sections are eligible + priority order) + the resolved content (which of the eligible sections actually have data), applies admin overrides, applies entitlement gates, and produces a rendered page. Same pattern for brands and people; different registries.

4. **Distribution resolver.** For a surface elsewhere on the portal (a project page's "brands used" strip, a locality page's "architects in Mumbai" rail, an article's "read more from this person" module), the resolver returns eligible entities based on the relationships that surface declares it consumes, filtered by admin pins + suppressions, ranked by relationship strength + entitlement + editorial priority.

5. **Entitlement gates + admin controls + theme + motion + SEO.** All cross-cutting layers that read from entity records + surface config + a small entitlement engine. Never bake commercial state into markup.

**The two hard rules that keep this from decaying into template-per-brand:**

- **Entity facts and presentation choices are separate.** Person Y works at Brand X: fact, lives in the join table. Person Y's profile shows the Research variant of `#work`: presentation choice, lives in the per-profile config record. Changing the config never changes the fact.
- **Entity facts and commercial state are separate.** Person Y exists: fact. Person Y's profile is enhanced because Brand X is on the Spotlight package: entitlement, lives in the package record. Person Y still exists in the directory when Brand X's package expires — just with the baseline treatment.

Every downstream recommendation follows from this diagram.

---

## 2. The entity layer

Six first-class entity types. All persist regardless of commercial state.

| Entity | Table | Key today | Key tomorrow |
|---|---|---|---|
| **Brand** | `brands` | shipped shape in [`docs/BACKEND-INTEGRATION-GUIDE.md`](../../docs/BACKEND-INTEGRATION-GUIDE.md) | + `primary_category_id` FK to `brand_categories_taxonomy`, + `package_id` FK (nullable) |
| **Person** | `people` | shipped shape | + `primary_discipline_id`; **remove** `brand_id` direct FK (move to relationship table) |
| **Project** | `projects` (new) | — | id, slug, name, city, developer_brand_id, architect_brand_id?, principal_person_id?, project_type, status, delivered_at, hero_image_url, description_lede |
| **Product** | `products` (new) | — | id, slug, name, brand_id (owner), category, sub_category, hero_image_url, description_lede |
| **Article** | `articles` | shipped shape (giarticle.php + [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json)) | already covered |
| **Video** | `videos` | (existing table) | metadata; not new |
| **Event** | `events` | (existing table) | metadata; not new |

### 2.1 Relationships — many-to-many join tables

The load-bearing gap from audit §F.4. Replace direct FKs with typed join tables.

**`brand_person_relationships`:**

```sql
CREATE TABLE brand_person_relationships (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  brand_id          INT NOT NULL,
  person_id         INT NOT NULL,
  role              VARCHAR(120) NOT NULL,        -- "Partner", "Principal Architect", "CEO"
  relationship_type ENUM('founder','current','past','advisor','board','contributor'),
  is_founder        BOOLEAN DEFAULT FALSE,
  is_leadership     BOOLEAN DEFAULT FALSE,
  is_featured       BOOLEAN DEFAULT FALSE,        -- surfaces on brand's Team spotlight
  display_order     INT DEFAULT 100,
  start_date        DATE NULL,
  end_date          DATE NULL,
  is_current        BOOLEAN GENERATED ALWAYS AS (end_date IS NULL),
  visibility        ENUM('public','discoverable','private') DEFAULT 'public',
  claimed_by_person BOOLEAN DEFAULT FALSE,        -- person has confirmed the association
  claimed_by_brand  BOOLEAN DEFAULT FALSE,        -- brand has confirmed the association
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,
  UNIQUE KEY brand_person_current (brand_id, person_id, end_date)
);
```

**`brand_project_relationships`:**

```sql
CREATE TABLE brand_project_relationships (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  brand_id          INT NOT NULL,
  project_id        INT NOT NULL,
  role              ENUM('developer','architect','pmc','landscape','interior','material_supplier','consultant'),
  is_lead           BOOLEAN DEFAULT FALSE,
  display_order     INT DEFAULT 100,
  visibility        ENUM('public','discoverable','private') DEFAULT 'public'
);
```

**`person_project_relationships`:**

```sql
CREATE TABLE person_project_relationships (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  person_id         INT NOT NULL,
  project_id        INT NOT NULL,
  role              VARCHAR(120),                 -- "Principal Architect", "Lead Designer"
  is_lead           BOOLEAN DEFAULT FALSE,
  display_order     INT DEFAULT 100
);
```

**Article ↔ entity relationships already exist via** `articles.sponsored_by_brand_id`, `articles.author_slug`, `articles.featured_brands` (per [`docs/STORY-schema.md`](../../docs/STORY-schema.md)), plus the editor's `brand_callout` / `person_callout` / `project_callout` blocks. Add a normalised `article_entity_mentions` join table (article_id, entity_type, entity_id, mention_kind) if not already present, so recirculation queries are indexable.

### 2.2 Migration from current DB

Nothing shipped uses these relationship tables today; the migration is additive. Steps:

1. **Add relationship tables.** No data yet.
2. **Backfill.** For every existing `people.brand_id`, insert a `brand_person_relationships` row with `relationship_type='current'`, `is_current=TRUE`, `role` copied from `people.role`.
3. **Keep `people.brand_id`.** As a *derived* column, kept in sync with the current primary relationship. Rendering code can still read it; new code reads the join table.
4. **Deprecate** `people.brand_id` after 3 months, after the relationship table has stabilised.

### 2.3 Entity resolution — the "never duplicate people" rule (brief §14)

Every ingest that names a Person walks a resolver:

1. Normalise the name (lowercase, strip titles, split first+last).
2. Query existing `people` where `name` matches OR `slug` matches OR any `person_alias` matches.
3. If a single confident match: reuse. Create a relationship record if the new context implies one.
4. If multiple matches: block for admin review, present the candidates, admin picks or creates new.
5. If zero matches: create a new `people` record + relationship.

Confidence signals (weighted):

- Exact name match with same primary city: 0.9
- Exact name match with same associated brand: 0.85
- Same LinkedIn URL: 0.99 (definitive)
- Same email domain + partial name: 0.7
- Same profession + same city + first-name match: 0.6

AI-assisted where useful, admin-final always. Same pattern for Brand entity resolution (name + website + logo hash + city + category signals).

---

## 3. The Section Registry for profile pages

The article side has [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json). This is the analogue for profile SECTIONS. New file: **`docs/PROFILE-SECTIONS-SPEC.json`**.

### 3.1 Shape (matches the editor spec's shape for cognitive continuity)

```json
{
  "$schema": "ghar.tv profile-sections spec v1",
  "name": "Ghar.tv brand + person profile section spec",
  "version": "1.0.0",
  "lastUpdated": "2026-08-31",

  "globalRules": {
    "brandChassis": ".bpr-*",
    "personChassis": ".pp-*",
    "sectionWrap": "max-width: var(--max-w); margin: 0 auto; padding: var(--pad-v) var(--pad-h)",
    "themeTokens": ["--brand", "--brand-soft"],
    "motionAttribute": "data-motion-profile",
    "autoHideRule": "Every section that can be absent has a `hidden` attribute + CSS rule that collapses it when the backend has no data. Never delete the section node."
  },

  "sections": {
    "hero": { ... },
    "about": { ... },
    "work": { ... },
    ...
  },

  "compositionRules": { ... },
  "surfaceRegistry": { ... },
  "entitlements": { ... }
}
```

### 3.2 Section entry — one example (the pattern applies to every section)

```json
"work": {
  "id": "work",
  "name": "Notable projects / Work",
  "aliases": ["projects"],
  "applies_to": ["brand", "person"],
  "anchor_id": "work",
  "description": "The entity's projects. On a brand page this is the full portfolio (or a curated set + link to more). On a person page this is a 4-item teaser + link to the brand's full portfolio.",

  "variants": {
    "spotlight": {
      "label": "Featured project spotlight",
      "chassis_class": "bpr-featured",
      "when_to_use": "1 headline project drives everything below it.",
      "min_items": 1,
      "max_items": 1
    },
    "grid": {
      "label": "Project grid",
      "chassis_class": "bpr-work-grid",
      "when_to_use": "3–8 delivered projects, no single hero.",
      "min_items": 3,
      "max_items": 8
    },
    "carousel": {
      "label": "Project carousel",
      "chassis_class": "bpr-work-rail",
      "when_to_use": "9+ projects — rail with paginator + See all link.",
      "min_items": 9,
      "max_items": 24
    },
    "editorial": {
      "label": "Editorial project set",
      "chassis_class": "bpr-work-editorial",
      "when_to_use": "Brand chose to present projects with editorial context, not a grid.",
      "min_items": 2,
      "max_items": 6
    },
    "teaser": {
      "label": "Person-page teaser",
      "chassis_class": "pp-idx pp-idx--bare",
      "when_to_use": "Person profile. 4-item indexed list + link out to brand's full portfolio.",
      "min_items": 1,
      "max_items": 4,
      "always_paired_with": "pp-work__more"
    }
  },

  "fields": [
    { "id": "items", "type": "array<Project>", "resolver": "content_resolver" },
    { "id": "featured_id", "type": "int?", "used_by_variants": ["spotlight", "editorial"] },
    { "id": "heading", "type": "string", "default": "Notable projects" },
    { "id": "framing_note", "type": "string?", "used_by_variants": ["teaser"] },
    { "id": "see_all_href", "type": "url?", "used_by_variants": ["teaser", "carousel"] }
  ],

  "content_availability_rules": {
    "empty": "Hide the section entirely.",
    "single_item": "Force `spotlight` variant regardless of other variant config.",
    "two_items": "Choose between `spotlight` (if `featured_id` is set) or a compact grid.",
    "three_to_eight_items": "Default `grid`; admin can override to `editorial`.",
    "nine_plus_items": "Default `carousel`; admin can select curated set of ≤8 for `grid`."
  },

  "fallbacks": {
    "no_photography": "Use the project's typed hero placeholder (city + type composed as a Gazpacho card).",
    "brand_no_projects_but_intelligence_exists": "Suppress this section; the Intelligence section carries the brand's authority instead.",
    "person_no_projects": "Suppress. Person profile does not force-show an empty Work section."
  },

  "entitlement_gates": {
    "carousel_paginator": "any",
    "editorial_variant": "premium",
    "spotlight_hero_image_upload": "any"
  },

  "surfaces_that_consume_project_data": [
    "brand_page",
    "person_page",
    "project_page",
    "brands_directory_card",
    "search_result_card"
  ]
}
```

### 3.3 The initial section list

Start with the sections that already exist (audit §A.3 + §B.3). Nothing invented.

**Brand sections:**

| id | Aliases (dropped) | Variants (initial) | Notes |
|---|---|---|---|
| `hero` | — | classic · split · ambient · film | Split = current Pattern B. Ambient = Horizon warm SVG. Film = Godrej commissioned film. |
| `about` | `story` | default · seamless · editorial | seamless = current `bpr-about--seamless-wrap`; editorial = future. |
| `work` | `projects` | spotlight · grid · carousel · editorial · teaser | See §3.2 above. |
| `recognition` | — | strip · list | Awards + honours. Currently `bpr-sec--attached` on developer family; strip is that; list is a longer form. |
| `team` | — | grid · leadership · founder | Grid = default; leadership = 2–4 spotlit partners; founder = 1 spotlit founder. |
| `timeline` | — | vertical · horizontal | Currently vertical on developer family. |
| `presence` | — | list · map · city_cards | City list, static map, or per-city cards. |
| `spotlight` | — | mixed · editorial_only · intelligence_only · voices_only | Currently mixed (editorial + intelligence + voices) on service family. |
| `intelligence` | — | title_card · report_list | Per [[project_intelligence_titlecard_pattern]]. |
| `voices` | — | rail · grid · card_only | .vx-card driven. |
| `products` | — | catalog · collection · featured | For product brands (Scarlet, Obeetee, Saint-Gobain, Asian Paints). |
| `clients` | — | logo_wall · category_grid | For service brands. |
| `film` | — | inline · hero_replacement | Commissioned film (Godrej pattern). |
| `contact` | — | light · dark | Currently variant on the light/dark contact panel decision. |
| `microft` | — | default | Micro-footer with Ghar.tv credit. Not the portal footer. |
| `sticky_contact` | — | default | Mobile bottom sticky bar. |

**Person sections:**

| id | Variants | Notes |
|---|---|---|
| `hero` | classic · portrait_first · monogram | monogram is not a fallback — it's the majority case (audit §B.5). |
| `facts` | strip · bordered_grid | bordered_grid = current mobile-only pattern. |
| `about` | manifesto · statement · none | manifesto = lede + bio paragraphs; statement = 12-word claim only; none = no about section (sparse record). |
| `specialises` | warm_panel · chip_list | warm_panel = current. |
| `work` | teaser · grid_bare | teaser = current 4-item + link-out; grid_bare = for people without a linked brand. |
| `voices` | grid · native_rail | native_rail = current mobile responsive behaviour (uncommitted stretch). |
| `published` | multi_kind · single_kind · empty_note | multi_kind = mixed article/podcast/research; single_kind = one type only; empty_note = "no published coverage yet" panel. |
| `recognition` | list · none | Awards + honours + appointments. |
| `credentials` | pair_list · none | Formal registrations. |
| `related` | co_workers · similar_discipline · none | "Also at {brand}" or "Similar architects in Mumbai". |
| `contact` | button · form | Now button after uncommitted stretch. |
| `closer` | default · none | Final CTA card. |

**Cross-cutting variants (apply to any section):**

- `--tight` (reduced vertical padding — current `bpr-sec--tight`)
- `--attached` (visual link to prior section — current `bpr-sec--attached`)
- `--minor` (de-prioritised — current `pp-sec--minor`)
- `--dark` (dark panel treatment)

Register these as MODIFIERS in the spec, separate from primary variants.

### 3.4 The composer

```
Given (entity_id, entity_type):
  entity ← load entity + relationships
  category ← entity.primary_category (brand) OR entity.primary_discipline (person)
  entitlements ← resolveEntitlements(entity)
  content ← contentResolver(entity_id, entity_type)
  config ← loadProfileConfig(entity_id) OR compositionRules[category].defaultConfig

  page ← []
  for each section in Section Registry:
    if not compositionRules[category].includes(section.id):
      continue
    if not entitlements.gates_pass(section.entitlement_gates):
      continue
    if not content.has_data_for(section):
      apply section.fallbacks OR hide
      continue
    variant ← config.variant_override(section) OR chooseVariant(section, content, entitlements)
    section_html ← render(section, variant, content, config.overrides(section))
    page.append(section_html)

  page ← applyMotionProfile(page, config.motion_profile OR defaults[category])
  page ← applyThemeTokens(page, entity.brand_colors)
  return page
```

Two composers — `composeBrandPage(brand_id)` and `composePersonPage(person_id)` — sharing the same Section Registry lookup + config + entitlement machinery. Different registries for brand vs person sections.

---

## 4. Composition Rules per category

The brief §46 pattern: `required / preferred / optional / premium / fallback / irrelevant` per section per category.

**Data table `category_composition_rules`:**

```sql
CREATE TABLE category_composition_rules (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  entity_type       ENUM('brand','person'),
  category_slug     VARCHAR(80) NOT NULL,             -- brand: 'developer', 'architect', 'materials', 'furniture', 'finance', 'proptech'
                                                      -- person: 'architects', 'interiors', 'developers', 'brandleaders', 'advisors', 'research'
  section_id        VARCHAR(80) NOT NULL,             -- FK to profile-sections-spec
  priority          ENUM('required','preferred','optional','premium','fallback','irrelevant'),
  variant_default   VARCHAR(80),                      -- default variant for this section in this category
  display_order     INT DEFAULT 100,                  -- order in the composed page
  UNIQUE KEY category_section (entity_type, category_slug, section_id)
);
```

### 4.1 Seed data — brand

**Developer** (Real Estate Developer):

| section | priority | variant | order |
|---|---|---|---|
| hero | required | classic | 10 |
| about | required | default | 20 |
| work | preferred | grid | 30 |
| recognition | preferred | strip | 40 |
| team | preferred | founder | 50 |
| timeline | optional | vertical | 60 |
| presence | required | city_cards | 70 |
| intelligence | premium | title_card | 80 |
| voices | optional | grid | 90 |
| spotlight | optional | mixed | 100 |
| film | premium | inline | 110 |
| contact | required | dark | 200 |

**Architect** (Architecture Practice):

| section | priority | variant | order |
|---|---|---|---|
| hero | required | ambient | 10 |
| about | required | seamless | 20 |
| work | required | editorial | 30 |
| team | preferred | leadership | 40 |
| recognition | preferred | strip | 50 |
| presence | preferred | list | 60 |
| voices | optional | grid | 70 |
| spotlight | optional | mixed | 80 |
| contact | required | light | 200 |

**Materials** (Building Materials / Paints / Sanitaryware / etc.):

| section | priority | variant | order |
|---|---|---|---|
| hero | required | classic | 10 |
| about | required | default | 20 |
| products | required | catalog | 30 |
| clients | preferred | logo_wall | 40 |
| work | optional | grid | 50 |
| team | fallback | grid | 60 |
| presence | preferred | list | 70 |
| voices | optional | grid | 80 |
| contact | required | light | 200 |

**Furniture / Design** (Scarlet Splendour, Obeetee):

| section | priority | variant | order |
|---|---|---|---|
| hero | required | split | 10 |
| about | required | default | 20 |
| products | required | collection | 30 |
| team | preferred | grid | 40 |
| work | optional | grid | 50 |
| presence | preferred | list | 60 |
| voices | optional | grid | 70 |
| contact | required | light | 200 |

**Finance** (Home Loans / NBFCs / Insurance):

| section | priority | variant | order |
|---|---|---|---|
| hero | required | classic | 10 |
| about | required | default | 20 |
| products | required | featured | 30 |
| presence | required | city_cards | 40 |
| recognition | optional | strip | 50 |
| voices | optional | grid | 60 |
| contact | required | dark | 200 |

The remaining categories (PropTech, Interior Studios, Vastu Consulting, Lighting) follow the same shape. Rows go in a seed migration.

### 4.2 Seed data — person

Person composition rules are constrained by the universality rule (audit §B.2) — every person shares the same base treatment (white, warm-white, ink, hairlines, portrait-or-monogram). Category still shapes which sections are EMPHASISED, but not the visual theme.

**Architects:**

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

**Advisors / Analysts / Research:**

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
| related | optional | similar_discipline | 90 |
| contact | required | button | 200 |
| closer | required | default | 210 |

**Brand leadership** (Developers / Founders / CEOs):

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
| contact | required | button | 200 |
| closer | required | default | 210 |

### 4.3 Category selection is a fact, not a choice

`brands.primary_category_id` is set at entity creation. A brand isn't manually assigned to a template — it's assigned to a category, and the composer picks the composition rule set. A brand CAN belong to multiple categories (developer + PMC), but one is `primary`.

---

## 5. Distribution Surface Registry

The reverse of the article-side auto-injection engine. Article side = inject entities INTO articles. This side = surface entities on N pages.

**File: `docs/DISTRIBUTION-SURFACES.json`.**

### 5.1 Shape

```json
{
  "surfaces": {
    "brand_directory": {
      "id": "brand_directory",
      "path": "/brands",
      "renders": "brands.html",
      "eligible_entity_types": ["brand"],
      "relationship_requirements": [],
      "slots": {
        "featured": { "count": 4, "type": "promoted", "requires_entitlement": "category_priority" },
        "organic": { "count": 96, "type": "organic", "ranking": "featured_desc, name_asc" }
      },
      "filters_available": ["category", "sub_category", "city", "locality", "recognition", "search"]
    },

    "brand_page_related_brands": {
      "id": "brand_page_related_brands",
      "path": "/brands/{brand_slug}#related-brands",
      "eligible_entity_types": ["brand"],
      "relationship_requirements": [
        { "source": "brand_project_relationships", "same_project_as_current_brand": true }
      ],
      "slots": {
        "organic": { "count": 4, "type": "organic", "ranking": "relationship_recency_desc" }
      }
    },

    "person_page_also_at_brand": {
      "id": "person_page_also_at_brand",
      "path": "/people/{person_slug}#related",
      "eligible_entity_types": ["person"],
      "relationship_requirements": [
        { "source": "brand_person_relationships", "same_brand_as_current_person": true, "current_only": true }
      ],
      "slots": {
        "organic": { "count": 3, "type": "organic", "ranking": "leadership_first, display_order_asc" }
      }
    },

    "project_page_brands_involved": {
      "id": "project_page_brands_involved",
      "path": "/projects/{project_slug}#brands",
      "eligible_entity_types": ["brand"],
      "relationship_requirements": [
        { "source": "brand_project_relationships", "project_id_matches": true }
      ],
      "slots": {
        "organic": { "count": 12, "type": "organic", "ranking": "role_asc, is_lead_first" }
      }
    },

    "locality_page_professionals": {
      "id": "locality_page_professionals",
      "path": "/{city_slug}/{locality_slug}#professionals",
      "eligible_entity_types": ["person"],
      "relationship_requirements": [
        { "field_match": { "person.city": "{city_slug}" } }
      ],
      "slots": {
        "organic": { "count": 6, "type": "organic", "ranking": "featured_first, published_at_desc" },
        "promoted": { "count": 2, "type": "promoted", "requires_entitlement": "premium_distribution" }
      }
    },

    "homepage_brand_carousel": {
      "id": "homepage_brand_carousel",
      "path": "/#hp-brands",
      "eligible_entity_types": ["brand"],
      "slots": {
        "featured": { "count": 8, "type": "promoted", "requires_entitlement": "homepage_placement" },
        "organic": { "count": 4, "type": "organic", "ranking": "recency_desc" }
      }
    },

    "newsletter_brand_spotlight": {
      "id": "newsletter_brand_spotlight",
      "path": "newsletter",
      "eligible_entity_types": ["brand"],
      "slots": {
        "featured": { "count": 1, "type": "promoted", "requires_entitlement": "newsletter_distribution" }
      }
    }
  }
}
```

### 5.2 The resolver

```
resolveEntitiesForSurface(surface_id, context) → { organic: [Entity], promoted: [Entity] }

  surface ← DISTRIBUTION-SURFACES.json[surface_id]
  organic ← []
  promoted ← []

  for slot in surface.slots.organic:
    candidates ← queryEligibleEntities(surface.eligible_entity_types, surface.relationship_requirements, context)
    candidates ← applyRanking(candidates, slot.ranking)
    candidates ← applyAdminSuppressions(candidates)
    candidates ← applyAdminPins(candidates)
    organic.push(candidates.slice(0, slot.count))

  for slot in surface.slots.promoted:
    candidates ← queryEntitiesWithEntitlement(surface.eligible_entity_types, slot.requires_entitlement, context)
    candidates ← applyRanking(candidates, slot.ranking OR "package_tier_desc, recency_desc")
    candidates ← applyAdminSuppressions(candidates)
    promoted.push(candidates.slice(0, slot.count))

  return { organic, promoted }
```

Every surface's rendering code calls this resolver. Never manually places entity cards.

### 5.3 Admin controls per surface

Admin UI for surfaces:

- **View**: current organic + promoted resolution for each surface
- **Pin**: force a specific entity into a slot (regardless of ranking)
- **Suppress**: exclude a specific entity from a surface entirely
- **Priority override**: nudge an entity's rank up or down
- **Slot config**: change slot count, ranking rule (from a small vocabulary)

---

## 6. Entitlement contract

Capabilities are string keys. Packages are bundles of keys. Brand has a package. Never hardcode `if (brand.package === 'spotlight')` anywhere.

### 6.1 The tables

```sql
CREATE TABLE capabilities (
  key             VARCHAR(80) PRIMARY KEY,
  label           VARCHAR(160) NOT NULL,
  description     TEXT,
  scope           ENUM('profile_section','distribution','content_production','analytics','service'),
  is_automated    BOOLEAN,                    -- brief §74 — this is highly scalable vs requires human work
  cost_tier       ENUM('none','low','medium','high')
);

CREATE TABLE packages (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  slug            VARCHAR(80) UNIQUE,          -- 'presence', 'spotlight', 'partner'
  name            VARCHAR(160),
  description     TEXT,
  monthly_price   INT,                         -- INR, internal only
  is_public       BOOLEAN,
  active          BOOLEAN
);

CREATE TABLE package_capabilities (
  package_id      INT,
  capability_key  VARCHAR(80),
  limit_int       INT NULL,                    -- e.g. "3 person profiles" — limit=3
  PRIMARY KEY (package_id, capability_key)
);

CREATE TABLE brand_entitlement_overrides (
  brand_id        INT,
  capability_key  VARCHAR(80),
  action          ENUM('grant','revoke','override_limit'),
  limit_int       INT NULL,
  granted_at      DATETIME,
  granted_by      VARCHAR(120),                -- admin who did it
  PRIMARY KEY (brand_id, capability_key)
);
```

### 6.2 The capability vocabulary

Initial set. Add more as the product grows.

**Profile section capabilities:**

| key | scope | automated | cost_tier |
|---|---|---|---|
| `basic_profile` | profile_section | yes | none |
| `enhanced_profile` | profile_section | yes | low |
| `custom_hero_ambient` | profile_section | yes | low |
| `commissioned_film` | profile_section | no | high |
| `premium_theme` | profile_section | yes | low |
| `motion_cinematic` | profile_section | yes | none |

**Person profile capabilities:**

| key | scope | automated | cost_tier |
|---|---|---|---|
| `person_profile` | profile_section | yes | none |
| `person_profile_enhanced` | profile_section | yes | low |
| `person_profile_leadership_grid` | profile_section | yes | none |

**Distribution capabilities:**

| key | scope | automated | cost_tier |
|---|---|---|---|
| `directory_listing` | distribution | yes | none |
| `category_priority` | distribution | yes | low |
| `homepage_placement` | distribution | yes | medium |
| `newsletter_distribution` | distribution | no | medium |
| `premium_distribution` | distribution | yes | medium |
| `editorial_recommendation` | distribution | yes | low |

**Content production capabilities:**

| key | scope | automated | cost_tier |
|---|---|---|---|
| `sponsored_story` | content_production | no | high |
| `ghartalks_appearance` | content_production | no | high |
| `videoworks_short` | content_production | no | high |
| `videoworks_long` | content_production | no | high |
| `intelligence_integration` | content_production | no | medium |
| `voices_curation` | content_production | no | low |
| `creator_campaign` | content_production | no | high |

**Analytics capabilities:**

| key | scope | automated | cost_tier |
|---|---|---|---|
| `analytics_basic` | analytics | yes | none |
| `analytics_full` | analytics | yes | low |
| `lead_capture` | analytics | yes | low |
| `lead_routing` | analytics | yes | low |

### 6.3 The resolver

```
resolveEntitlements(brand_id) → { capabilities: Set<string>, limits: Map<string, int> }

  brand ← load brand
  package ← brand.package_id ? load package : null
  entitlements ← package ? loadPackageCapabilities(package) : []

  overrides ← loadBrandEntitlementOverrides(brand_id)
  for override in overrides:
    apply grant / revoke / override_limit

  return { capabilities: Set(entitlements), limits: Map(...) }
```

Every renderer calls this. Every section registry check gates against it. Distribution surfaces read `requires_entitlement` from their config and gate against it.

### 6.4 Packages as configuration, not marketing text

The public [`brand-connect.html`](../../brand-connect.html) page renders package descriptions from the same `packages` + `package_capabilities` tables the entitlement engine reads. Marketing copy for a package (headline, deck, "what you get" bullet list) is editable text; the actual capability set is the same source of truth as what gets enforced.

Adding a new package = INSERT row in `packages` + N INSERT rows in `package_capabilities`. No frontend change, no template swap.

---

## 7. Motion System

Codify the recipe the recent stretch of tuning landed on. Kill per-page inline observer setups.

### 7.1 Motion profiles

Small vocabulary:

| profile | when to use | tokens |
|---|---|---|
| `minimal` | Financial institutions, technical brands, sparse people profiles. | fade only, no transform |
| `editorial` | Default. Architects, design brands, magazine-style. | rise (translateY 20 → 0), 0.6s, per-item, no cascade |
| `cinematic` | Developer brands, luxury tenants (Godrej, Scarlet-tier). | rise + scale, GSAP scrub on key stages |
| `dynamic` | Product brands with a lot of imagery. | print (opacity + skew) on cards, fade on text |

### 7.2 The token contract

```css
:root {
  --motion-duration-fast: 0.35s;
  --motion-duration-base: 0.6s;
  --motion-duration-slow: 1.2s;

  --motion-easing-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-easing-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-easing-decel: cubic-bezier(0, 0, 0.2, 1);

  --motion-rise-distance: 20px;
  --motion-print-skew: 3deg;
  --motion-scale-in-from: 0.94;
}
```

### 7.3 Per-page + per-section attribute

```html
<main data-motion-profile="editorial">
  <section class="bpr-sec" id="about">…</section>
  <section class="bpr-sec" id="work" data-motion-profile="cinematic">…</section>
</main>
```

Page-level default; section-level override. Every section defaults to its category's composition-rule motion (unless overridden).

### 7.4 The shared observer

Move to [`main.js`](../../main.js) (which becomes `dist/main.min.js`):

```js
window.gharProfileMotion = {
  init() {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', '');
      }
    }, {
      threshold: 0,
      rootMargin: '0px 0px -160px 0px'   // the recipe from the recent stretch
    });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
};
```

Section registry: each section declares which of its children get `data-reveal` (per the section's variant defaults). No more per-page setup blocks.

---

## 8. Admin controls schema

The brief §28 four-mode content contract.

### 8.1 Per-section config record

```sql
CREATE TABLE profile_section_configs (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  entity_type         ENUM('brand','person'),
  entity_id           INT NOT NULL,
  section_id          VARCHAR(80) NOT NULL,        -- FK to Section Registry
  is_enabled          BOOLEAN DEFAULT TRUE,
  display_order       INT NULL,                    -- override composition rule order
  variant             VARCHAR(80),                 -- override composition rule variant
  content_source      ENUM('auto','manual_select','manual_content','custom_html'),
  content_source_data JSON,                        -- selected IDs, manual text, custom HTML
  heading_override    VARCHAR(200),
  motion_profile      VARCHAR(80),
  updated_at          DATETIME,
  updated_by          VARCHAR(120),
  UNIQUE KEY entity_section (entity_type, entity_id, section_id)
);
```

### 8.2 The four content modes

| mode | content_source_data example | behaviour |
|---|---|---|
| `auto` | `null` | Content resolver picks. |
| `manual_select` | `{"ids": [42, 87, 103]}` | Admin picked these specific entity IDs. |
| `manual_content` | `{"heading": "Selected work", "paragraphs": ["…", "…"], "items": [...]}` | Admin typed content directly. |
| `custom_html` | `{"html": "<div>...</div>"}` | Admin pasted HTML. Sanitised on save per the [`docs/EDITOR-blocks-spec.json`](../../docs/EDITOR-blocks-spec.json) `rawHtmlAllowlist`. Admin-only. |

### 8.3 The admin UI

```
BRAND: TEEARCH                             [Preview]  [Save]  [Publish]

Category: Architecture (Service)
Package: Spotlight
Theme: --brand=#c67e35, --brand-soft=#f4e4d5
Motion profile: editorial

Sections (drag to reorder):

┌───────────────────────────────────────────────────┐
│ HERO                              [required]      │
│ Variant: split       Content: auto                │
│ [Edit hero image] [Edit metrics]                  │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ ABOUT                             [required]      │
│ Variant: seamless    Content: manual_content      │
│ [Edit lede] [Edit paragraphs] [Edit team]         │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ WORK                              [preferred]     │
│ Variant: grid        Content: manual_select       │
│ Selected: 8 projects  [Select projects]           │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ INTELLIGENCE                      [premium]       │
│ Package does not include intelligence_integration │
│ [Upgrade package] [Hide section]                  │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│ VOICES                            [optional]      │
│ Variant: grid        Content: auto                │
│ Auto-resolving 4 voices from person relationships │
└───────────────────────────────────────────────────┘

+ Add section (from library)
```

Category composition rules determine what's `required / preferred / optional / premium / fallback / irrelevant`. Package entitlements determine what's `premium` — locked or accessible.

### 8.4 AI never overwrites manual overrides

Every section config carries a `content_source`. When AI regeneration runs (§9), it operates ONLY on sections with `content_source = 'auto'`. Manual overrides persist across regenerations.

---

## 9. AI Ingestion Contract

The Brand Connect onboarding pipeline. What goes in, what comes out.

### 9.1 Input

A "Brand kit" — supplied by the brand or fetched from public sources:

```json
{
  "name": "Horizon Architects",
  "website": "https://horizonarchitects.com",
  "logo_url": "https://…/logo.svg",
  "primary_category_hint": "architecture",
  "media_urls": [
    "https://…/portfolio-2024.pdf",
    "https://…/founder-portrait.jpg",
    "https://…/office-shot-1.jpg",
    "https://…/project-1.jpg"
  ],
  "supplied_facts": {
    "founded_year": 2005,
    "city": "Mumbai",
    "founders": ["Hemal Shah"]
  }
}
```

### 9.2 Pipeline

```
1. Extract
   - Scrape website → about paragraphs, project titles, team names, images
   - Parse PDF portfolio → project list with attributes
   - OCR + face detection on media → identify portraits vs projects vs offices
   - Extract structured data (JSON-LD, meta tags) from website

2. Resolve entities
   - Brand: dedupe against existing brands (name, website, logo hash)
   - People: dedupe each extracted name against existing people (§2.3)
   - Projects: dedupe each extracted project against existing projects

3. Propose relationships
   - Brand ↔ Person: role, is_founder, is_leadership
   - Brand ↔ Project: role (developer/architect/pmc)
   - Person ↔ Project: role (principal/lead)

4. Suggest composition
   - Pick category composition rules
   - For each auto-mode section, propose content

5. Admin review
   - Review extracted entities, correct or reject
   - Review proposed relationships, confirm or reject
   - Review AI-drafted copy for each section, edit or reject

6. Publish
   - Commit entity records + relationships
   - Commit section configs
   - Register /brands/{slug} route
   - Emit distribution graph updates
```

### 9.3 Output

```json
{
  "brand": {
    "record": { "slug": "horizon-architects", "name": "Horizon Architects", ... },
    "provenance": { "founded_year": "supplied", "city": "supplied", "about_paragraphs": "ai_extracted:website" }
  },
  "people_created": [
    { "record": { "slug": "hemal-shah", "name": "Hemal Shah", ... }, "confidence": 0.95 }
  ],
  "people_matched": [],
  "projects_created": [ ... ],
  "projects_matched": [ ... ],
  "relationships_created": [
    { "type": "brand_person", "brand_id": 42, "person_id": 87, "role": "Founder", "is_founder": true }
  ],
  "section_configs_created": [
    { "section_id": "hero", "variant": "ambient", "content_source": "auto" },
    { "section_id": "about", "variant": "seamless", "content_source": "manual_content", "content_source_data": { "heading": "Practice", "paragraphs": ["...", "..."] } }
  ],
  "review_flags": [
    { "kind": "low_confidence_match", "message": "Person 'H. Shah' might match existing 'Hemal Shah' (0.65 confidence). Confirm?" }
  ]
}
```

### 9.4 What AI never does

- Never publish without admin review.
- Never overwrite `content_source != 'auto'` sections.
- Never invent statistics, project names, awards, dates, quotations.
- Never create a person without a real portrait ([[feedback_no_person_without_portrait]]) — flag for portrait sourcing instead.
- Never set commercial state — package assignment is admin-only.

---

## 10. Content Resolvers

Central resolvers that every composer + surface reads from.

### 10.1 Brand content resolver

```
resolveBrandContent(brand_id) → BrandContentBundle:
  {
    brand: Brand,
    people: [ { person: Person, relationship: BrandPersonRelationship } ],
    projects: [ { project: Project, relationship: BrandProjectRelationship } ],
    products: [ Product ],
    articles_by: [ Article ],         // articles about the brand
    articles_mentioning: [ Article ], // articles that mention the brand
    videos: [ Video ],
    ghartalks: [ GharTalksEpisode ],
    intelligence_reports: [ IntelligenceReport ],
    voices_by_associated_people: [ VoiceEntry ],
    events_attended: [ Event ],
    awards: [ Award ]
  }
```

Cache aggressively. Invalidate on any related record update.

### 10.2 Person content resolver

```
resolvePersonContent(person_id) → PersonContentBundle:
  {
    person: Person,
    brands: [ { brand: Brand, relationship: BrandPersonRelationship } ],  // multiple
    projects: [ { project: Project, relationship: PersonProjectRelationship } ],
    articles_by: [ Article ],         // authored by the person
    articles_about: [ Article ],      // interviews, features, mentions
    voices_by: [ VoiceEntry ],
    ghartalks: [ GharTalksEpisode ],
    videos: [ Video ],
    events_spoken_at: [ Event ],
    awards: [ Award ],
    registrations: [ Registration ],
    colleagues: [ Person ]            // co-workers at current brand(s)
  }
```

### 10.3 Content attribution enforcement (audit §B.4 + F.13)

Every resolver query MUST respect the attribution rule. The queries themselves enforce it:

```sql
-- Person's published coverage: only articles BY or ABOUT the person
SELECT * FROM articles
WHERE author_slug = :person_slug
   OR id IN (SELECT article_id FROM article_entity_mentions
             WHERE entity_type = 'person' AND entity_id = :person_id
                   AND mention_kind IN ('subject', 'author'));

-- Never JOIN to person's employer brand articles unless the article
-- explicitly names the person.
```

Wrong pattern (bug source): `SELECT * FROM articles WHERE brand_id = person.brand_id`.

---

## 11. Folder / file structure

Use existing conventions. Nothing invented.

### 11.1 What ships in this repo (frontend + specs)

```
/                                       ← production (static HTML today, dynamic tomorrow)
├── brand-profile-*.html                ← today: per-tenant static; tomorrow: 1 dynamic template file consumed by PHP
├── person-profile-*.html               ← same
├── brands.html, people.html            ← directories (data-driven from distribution resolver)
├── brand-connect.html                  ← commercial landing (data-driven from packages table)
├── vercel.json                         ← rewrites
├── serve.mjs                           ← local dev server
├── dist/                               ← minified CSS + JS + PhotoSwipe
├── partials/                           ← shared HTML fragments
├── scripts/                            ← build tools
├── brand_assets/                       ← images (per-brand subfolders)
└── docs/                               ← programmer-facing handoff
    ├── HANDOFF-INDEX.md                ← entry point (existing)
    ├── BACKEND-INTEGRATION-GUIDE.md    ← DB + routing + endpoints (existing)
    ├── TEMPLATES-USAGE.md              ← per-template data contracts (existing)
    ├── PROFILE-TEMPLATES-HANDOFF.md    ← brand + person profile chassis (existing)
    ├── EDITOR-blocks-spec.json         ← article block registry (existing)
    ├── EDITOR-migration-plan.md        ← article editor migration (existing)
    ├── STORY-schema.md                 ← article data model (existing)
    ├── VOICES-HANDOFF.md               ← voices vertical (existing)
    │
    ├── PROFILE-SECTIONS-SPEC.json      ← NEW — the profile-side block registry (§3)
    ├── COMPOSITION-RULES.md            ← NEW — category → section priority + variant defaults (§4)
    ├── ENTITY-RELATIONSHIPS.md         ← NEW — many-to-many relationship tables + resolvers (§2)
    ├── DISTRIBUTION-SURFACES.json      ← NEW — surface registry + resolver (§5)
    ├── ENTITLEMENTS.md                 ← NEW — capability keys + packages (§6)
    ├── MOTION-SYSTEM.md                ← NEW — profiles + tokens + shared observer (§7)
    ├── ADMIN-CONTROLS-SCHEMA.md        ← NEW — section config schema + admin UI shape (§8)
    ├── AI-INGESTION.md                 ← NEW — Brand Connect onboarding pipeline (§9)
    ├── BRAND-CAPABILITY-MATRIX.md      ← NEW — capability × package matrix (authored last)
    └── HANDOFF-INDEX.md                ← updated to reference all new docs
```

### 11.2 What lives under `_dev/` (design + reference)

```
_dev/
├── README.md
├── templates/                          ← source-of-truth templates the programmer implements
│   ├── brand-profile.html              ← REBUILT as section-registry-driven canonical template
│   ├── person-profile.html             ← REBUILT as section-registry-driven canonical template
│   ├── brand-profile-states.html       ← NEW — every brand section state rendered in one scroll
│   ├── person-profile-states.html      ← existing — kept as reference
│   ├── brand-profile-service.html      ← DEPRECATE after migration (rolled into brand-profile.html + composition rules)
│   ├── brand-profile-developer.html    ← DEPRECATE after migration (same)
│   └── person.html                     ← deprecate (rolled into person-profile.html)
├── reference/
│   ├── design-system.html              ← ADD entries at #brand-profile-fallbacks:
│   │                                       - Section variants catalog (all §3.3 sections)
│   │                                       - Modifier vocabulary (--tight, --attached, --minor, --dark)
│   │                                       - Motion profile visual demos
│   │                                       - Composition rule visualisations (which sections light up per category)
│   ├── BRAND-ENGINE-AUDIT.md           ← the audit doc (existing)
│   └── BRAND-ENGINE-ARCHITECTURE.md    ← this doc
└── prototypes/, archive/, scratch/, tools/    ← as today
```

### 11.3 Backend (programmer's territory, not this repo)

Suggested structure. Adapt to existing Ghar.tv PHP conventions.

```
secreal/
├── entities/
│   ├── Brand.php
│   ├── Person.php
│   ├── Project.php
│   └── Product.php
├── relationships/
│   ├── BrandPersonRelationship.php
│   ├── BrandProjectRelationship.php
│   └── PersonProjectRelationship.php
├── resolvers/
│   ├── BrandContentResolver.php        (§10.1)
│   ├── PersonContentResolver.php       (§10.2)
│   ├── EntitlementResolver.php         (§6.3)
│   └── DistributionResolver.php        (§5.2)
├── composers/
│   ├── BrandPageComposer.php           (§3.4)
│   └── PersonPageComposer.php          (§3.4)
├── registries/
│   ├── SectionRegistry.php             ← loads PROFILE-SECTIONS-SPEC.json
│   ├── CompositionRulesRegistry.php    ← loads COMPOSITION-RULES.md → seed table
│   └── SurfaceRegistry.php             ← loads DISTRIBUTION-SURFACES.json
├── ingest/
│   ├── BrandKitIngester.php            (§9)
│   ├── EntityDeduplicator.php
│   └── AICompositionSuggester.php
├── admin/
│   ├── ProfileSectionConfigController.php  (§8)
│   ├── EntitlementController.php
│   └── SurfaceAdminController.php
└── controllers/
    ├── BrandProfileController.php      ← /brands/{slug}
    ├── PersonProfileController.php     ← /people/{slug}
    ├── BrandsDirectoryController.php   ← /brands
    └── PeopleDirectoryController.php   ← /people
```

---

## 12. Migration Strategy — preserve approved visuals

Every shipped tenant page has to be visually reproducible. Nothing regresses.

### 12.1 Phase 0 — Section-ID normalisation + docs

**Blocking for everything.** Effort: 1 week.

- [ ] Publish `PROFILE-SECTIONS-SPEC.json` (§3). Freeze section IDs.
- [ ] Rename `#story` → `#about` on developer-family tenants (Godrej + Avirahi), with `previous_anchors=["#story"]` for URL redirects.
- [ ] Rename `#projects` → `#work` on developer-family tenants, ditto.
- [ ] Publish `COMPOSITION-RULES.md` (§4) with seed data.
- [ ] Publish `ENTITY-RELATIONSHIPS.md` (§2) — schema only, no migration yet.
- [ ] Publish `MOTION-SYSTEM.md` (§7) — extract the observer setup to `main.js`.
- [ ] Update `HANDOFF-INDEX.md` to reference the new docs.
- [ ] Add section-variants catalog entries to `_dev/reference/design-system.html#brand-profile-fallbacks`.

### 12.2 Phase 1 — Shared CSS extraction

Effort: 2 weeks.

- [ ] Diff every brand tenant's inline CSS. Extract common rules into `dist/brand-profile.min.css`.
- [ ] Same for person tenants → `dist/person-profile.min.css`.
- [ ] Each tenant HTML retains only tenant-specific overrides.
- [ ] Visual regression check per tenant (screenshot before + after, no diffs).

Documented as pending in [`docs/PROFILE-TEMPLATES-HANDOFF.md §14`](../../docs/PROFILE-TEMPLATES-HANDOFF.md). Reference chassis rebuild (§13) depends on this.

### 12.3 Phase 2 — DB schema evolution

Effort: 1 week (schema only, no migration).

- [ ] Add relationship tables (§2.1).
- [ ] Add `projects`, `products` tables (§2).
- [ ] Add `capabilities`, `packages`, `package_capabilities`, `brand_entitlement_overrides` (§6).
- [ ] Add `category_composition_rules` (§4).
- [ ] Add `profile_section_configs` (§8).
- [ ] Seed all reference data (composition rules, capabilities, initial packages).

### 12.4 Phase 3 — Backend composer + resolvers

Effort: 3–4 weeks.

- [ ] `BrandContentResolver` + `PersonContentResolver` (§10).
- [ ] `EntitlementResolver` + `DistributionResolver`.
- [ ] `BrandPageComposer` + `PersonPageComposer`.
- [ ] Wire `/brands/{slug}` + `/people/{slug}` routes to composers.
- [ ] Regression: composer output must byte-match current tenant HTML for every one of the 8 brand + 12 person tenants (modulo the section-ID normalisation from Phase 0).

### 12.5 Phase 4 — Reference tenant migration

Effort: 1 week.

- [ ] Pick ONE tenant. Recommend **TEEARCH** (well-defined, current best-in-class, service family).
- [ ] Extract its content into structured records (Brand + People + Projects + relationships + section configs).
- [ ] Delete `brand-profile-teearch.html` from root.
- [ ] `/brands/teearch` now renders from composer.
- [ ] Visual verification.

### 12.6 Phase 5 — Second-family proof

Effort: 1 week.

- [ ] Pick ONE developer-family tenant. Recommend **Avirahi** (moderate complexity).
- [ ] Same treatment.
- [ ] Verify that the same composer produces radically different visual output based on composition rules + section configs.

### 12.7 Phase 6 — Distribution engine

Effort: 3 weeks.

- [ ] Implement Distribution Surface Registry + Resolver (§5).
- [ ] Wire `/brands` directory to `resolveEntitiesForSurface('brand_directory')`.
- [ ] Wire `/people` directory ditto.
- [ ] Add related-brands / related-people strips on profile pages via resolver.
- [ ] Add homepage carousel via resolver.
- [ ] Admin controls for pinning / suppressing per surface.

### 12.8 Phase 7 — AI ingestion pipeline

Effort: 4–6 weeks.

- [ ] Extraction (website scraping, PDF parsing, image analysis).
- [ ] Entity deduplication (§2.3).
- [ ] AI composition suggestion.
- [ ] Admin review UI.
- [ ] End-to-end test: ingest a brand kit → publish live profile in one workflow.

### 12.9 Phase 8 — Batch migration of remaining tenants

Effort: 2 weeks.

- [ ] Migrate remaining 7 brand tenants + 11 person tenants.
- [ ] Delete per-tenant HTML files.
- [ ] Root is production only, everything is dynamic.

**Total effort estimate:** 4–5 months, one experienced PHP/JS backend developer + one frontend developer + admin/product for review milestones. Phases 0–2 can start in parallel; Phases 3–5 are sequential; Phases 6–8 can overlap.

---

## 13. Reference implementation deliverables

After this doc is signed off, the studio produces:

1. **`_dev/templates/brand-profile.html` — REBUILT** as the section-registry-driven canonical template. Every section variant present, each wrapped in a data attribute the programmer strips down per tenant. Modelled after `person-profile-states.html`.

2. **`_dev/templates/person-profile.html` — REBUILT** ditto.

3. **`_dev/templates/brand-profile-states.html` — NEW**. Every brand section state rendered in one scroll (like the existing person-profile-states.html). Reference for `[hidden]` auto-hide behaviour.

4. **`_dev/reference/design-system.html#brand-profile-fallbacks`** — populated with:
   - Section variants catalog (every §3.3 section, every variant, rendered example)
   - Modifier vocabulary (--tight, --attached, --minor, --dark, with rendered examples)
   - Motion profile demos (minimal / editorial / cinematic / dynamic)
   - Composition rule visualisation (which sections light up per category)

5. **`docs/PROFILE-SECTIONS-SPEC.json`** — the full section registry as JSON, matching the shape shown in §3.1.

6. **`docs/COMPOSITION-RULES.md`** — the full category × section priority tables (§4.1 – §4.2) plus how to add a new category.

7. **`docs/ENTITY-RELATIONSHIPS.md`** — the relationship model (§2) + SQL migration snippets + resolver signatures.

8. **`docs/DISTRIBUTION-SURFACES.json`** — the surface registry as JSON, matching §5.1.

9. **`docs/ENTITLEMENTS.md`** — capability vocabulary + package definitions + admin override schema (§6).

10. **`docs/MOTION-SYSTEM.md`** — motion profile catalog + tokens + shared observer contract (§7).

11. **`docs/ADMIN-CONTROLS-SCHEMA.md`** — per-section config schema + admin UI wireframes (§8).

12. **`docs/AI-INGESTION.md`** — pipeline contract + input/output schemas + review workflow (§9).

13. **`docs/BRAND-CAPABILITY-MATRIX.md`** — capability × package matrix, authored LAST once §6 packages are stabilised.

14. **`docs/HANDOFF-INDEX.md`** — updated to reference all of the above under new "Brand Engine Architecture" section.

---

## 14. Deliverables — programmer vs studio

Clear boundary. The programmer builds against these specs; the studio delivers these files.

### 14.1 Studio delivers (Claude / design lead)

- All docs listed in §11.1 under "NEW" (the specs).
- Rebuilt reference templates (§13.1 – §13.3).
- Updated design-system catalog entries (§13.4).
- Visual regression baseline (screenshots of every current tenant).
- Migration ticket list ordered by Phase (§12).

### 14.2 Programmer builds

- DB schema migrations (from `ENTITY-RELATIONSHIPS.md`).
- Entity classes + relationship classes.
- Content resolvers (from `PROFILE-SECTIONS-SPEC.json` field contracts).
- Composers (from spec + composition rules).
- Distribution resolver (from `DISTRIBUTION-SURFACES.json`).
- Entitlement resolver (from `ENTITLEMENTS.md`).
- Admin UI (from `ADMIN-CONTROLS-SCHEMA.md`).
- AI ingestion pipeline (from `AI-INGESTION.md`).
- Routing (from existing `BACKEND-INTEGRATION-GUIDE.md` Option A pattern).
- All backend performance work (caching, DB indexes, query optimisation).

### 14.3 Product / editorial decides

- Package definitions (which capabilities go in Presence / Spotlight / Partner).
- Rate card (external of this doc — internal only).
- Per-tenant content curation (which projects a brand features, which people a brand highlights).
- Editorial pins / suppressions on distribution surfaces.
- Category vocabulary evolutions.
- Sponsored content editorial decisions.

---

## 15. How this reads to a programmer joining today

The message to the programmer, in one paragraph:

> Ghar.tv is an entity publishing system. Brands, People, Projects, Products, Articles are first-class typed records with typed relationships between them. Two composers — brand and person — walk a section registry, a composition-rules table, an entitlement engine, and a content resolver to produce profile pages. A distribution resolver surfaces entity cards on N pages across the portal. An admin controls per-section AUTO/MANUAL/CUSTOM behaviour + package assignment. An AI ingestion pipeline turns a brand kit into a proposed set of records + relationships for admin review. Nothing about a tenant is hardcoded; every tenant is data + configuration on top of shared code. The article side of the house already works this way (see EDITOR-blocks-spec.json + auto-injection); extend the same pattern to profiles + add the entity + distribution layers on top.

The rest is implementation.

---

## Housekeeping

- **This doc is a proposal, not a decision.** The user reviews, corrects, commissions.
- **The audit + this architecture doc are companions.** Read the audit first for evidence; this doc for the response.
- **Neither doc has been committed to git.** Both live under `_dev/reference/` (which is gitignored except for `design-system.html`). To hand to the programmer, either:
  - Add exceptions to `.gitignore` for both files, then commit.
  - Or copy both to `docs/` (which is not gitignored) as `docs/BRAND-ENGINE-AUDIT.md` + `docs/BRAND-ENGINE-ARCHITECTURE.md`.
- **The reference chassis + design-system catalog entries + capability matrix** are the natural next studio deliverables. They come after this doc is reviewed + the section registry is signed off.
- **The uncommitted batch** from the previous stretch (pp-contact form → button, voices cleanup + native rail, intel foot fix, pp-contact grid alignment) is still held for the user's push authorization. Independent of this doc.

**Last updated:** 2026-08-31 (Claude, architecture proposal in response to the 126-item Brand Connect + Entity Publishing + Distribution Engine brief). Companion to [`BRAND-ENGINE-AUDIT.md`](./BRAND-ENGINE-AUDIT.md).
