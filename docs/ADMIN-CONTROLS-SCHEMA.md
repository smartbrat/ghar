# Admin Controls Schema

> How admins configure profile sections, distribution pins/suppressions,
> and entitlement overrides. This doc is the contract between the
> composer / distribution resolver and the admin UI the programmer
> builds. Wireframes are ASCII — real UI design happens once schema is
> signed off.

---

## 1. The core table — `profile_section_configs`

```sql
CREATE TABLE profile_section_configs (
  id                    INT PRIMARY KEY AUTO_INCREMENT,
  entity_type           ENUM('brand','person') NOT NULL,
  entity_id             INT NOT NULL,
  section_id            VARCHAR(80) NOT NULL,        -- FK to PROFILE-SECTIONS-SPEC.json section id
  is_enabled            BOOLEAN DEFAULT TRUE,        -- admin can force-hide a section that composition rules would show
  is_pinned_open        BOOLEAN DEFAULT FALSE,       -- admin can force-show a section that composition rules would hide
  display_order         INT NULL,                    -- override composition rule display_order
  variant               VARCHAR(80) NULL,            -- override composition rule variant_default
  motion_profile        VARCHAR(80) NULL,            -- override composition rule motion_profile
  content_source        ENUM('auto','manual_select','manual_content','custom_html') DEFAULT 'auto',
  content_source_data   JSON,                        -- shape depends on content_source (see §3)
  heading_override      VARCHAR(300) NULL,
  ai_regenerate_enabled BOOLEAN DEFAULT TRUE,        -- if false, AI regeneration skips this section
  last_admin_edit_at    DATETIME NULL,               -- when a human last touched this config
  last_ai_regen_at      DATETIME NULL,
  updated_at            DATETIME NOT NULL,
  updated_by            VARCHAR(120),
  UNIQUE KEY entity_section (entity_type, entity_id, section_id),
  KEY idx_entity (entity_type, entity_id),
  FOREIGN KEY (entity_id) REFERENCES brands(id) ON DELETE CASCADE
);
```

**Precedence at compose time:**

1. Composition rule provides defaults (per-category).
2. `profile_section_configs` overrides where present.
3. Entitlement gates hide sections that would otherwise render.

---

## 2. The four content modes

Every section that renders data-driven content honours one of four modes.

### 2.1 `auto` (default)

Content Resolver picks. Fully automated. Regenerates when related data
changes.

```json
{
  "content_source": "auto",
  "content_source_data": null
}
```

Example: `work` section with 12 projects in the DB → composer picks
the top 8 for `grid` variant based on `featured DESC, delivered_at DESC`.

### 2.2 `manual_select`

Admin picks specific entity IDs. Composer renders those, in the given
order.

```json
{
  "content_source": "manual_select",
  "content_source_data": {
    "ids": [42, 87, 103, 15],
    "featured_id": 42
  }
}
```

Example: `work` section — admin picked 4 specific projects, pinned #42 as the featured hero.

Composer respects the ordering. If any listed id is deleted, composer
skips it and logs a warning to admin.

### 2.3 `manual_content`

Admin types content directly. Composer renders the text/media instead
of resolver output.

```json
{
  "content_source": "manual_content",
  "content_source_data": {
    "heading": "The practice",
    "lede": "We build things that outlive the developer.",
    "paragraphs": [
      "First paragraph markdown-safe rich text.",
      "Second paragraph."
    ],
    "items": [
      { "label": "Location", "value": "Mumbai" },
      { "label": "Registered", "value": "COA" }
    ]
  }
}
```

Content shape depends on the section. See section entries in
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json) for the
`fields[]` map per section.

Example: `about` section — admin wrote a custom lede + paragraphs.

### 2.4 `custom_html`

Escape hatch. Admin pastes raw HTML. Sanitised on save against the
[`EDITOR-blocks-spec.json`](EDITOR-blocks-spec.json)
`rawHtmlAllowlist`. **Admin-only** (role check).

```json
{
  "content_source": "custom_html",
  "content_source_data": {
    "html": "<div class='bpr-custom'>… sanitised HTML …</div>"
  }
}
```

Use when a section genuinely needs bespoke markup that no variant
supports. If two brands ever need the same custom HTML, promote it to
a variant.

---

## 3. `content_source_data` shape per section

Not every section supports every mode. And each section's
`manual_content` shape differs. Reference table:

| section | auto | manual_select | manual_content shape | custom_html |
|---|---|---|---|---|
| hero | ✓ | — | `{ name, tagline, eyebrow, hero_image_url, logo_url }` | admin only |
| about | ✓ | — | `{ heading, lede, paragraphs[], sub_eyebrow? }` | admin only |
| work | ✓ | `{ ids[], featured_id? }` | `{ heading, items: [{ title, city, image_url }] }` | admin only |
| recognition | ✓ | `{ ids[] }` | `{ heading, items: [{ title, body?, year? }] }` | admin only |
| team | ✓ | `{ person_ids[] }` | `{ heading, items: [{ name, role, portrait_url?, initials }] }` | admin only |
| timeline | ✓ | — | `{ heading, items: [{ year, title, body? }] }` | admin only |
| presence | ✓ | — | `{ heading, items: [{ city, address?, phone? }] }` | admin only |
| spotlight | ✓ | `{ article_ids[], intel_ids[], voice_ids[] }` | — | — |
| intelligence | ✓ | `{ report_ids[] }` | — | admin only |
| voices | ✓ | `{ voice_ids[] }` | — | — |
| products | ✓ | `{ product_ids[] }` | `{ heading, items: [{ name, image_url, sub? }] }` | admin only |
| clients | ✓ | — | `{ heading, items: [{ name, logo_url, category? }] }` | admin only |
| film | ✓ | — | `{ video_url, poster_url, caption? }` | — |
| contact | ✓ | — | `{ heading, lede, meta_rows: [{ icon, label, value }] }` | — |
| closer | ✓ | — | `{ title, lede, primary_cta, secondary_cta }` | — |

Person sections follow the same pattern with `pp-*` shapes.

---

## 4. Admin UI wireframe — profile editor

Top-level per-tenant admin screen. Renders the section list with per-section controls.

```
┌───────────────────────────────────────────────────────────────────┐
│ BRAND: TEEARCH  [/brands/teearch]                                  │
│                                                                    │
│ [Preview live]  [Save draft]  [Publish]                            │
│                                                                    │
│ ┌──────────────────────────────────────────────────┐              │
│ │ Category:    Architecture                     ▾  │              │
│ │ Package:     Spotlight  [Change]                 │              │
│ │ Motion:      Editorial                        ▾  │              │
│ │ Theme:       --brand=#c67e35  --brand-soft=…  ✎  │              │
│ └──────────────────────────────────────────────────┘              │
│                                                                    │
│ SECTIONS (drag to reorder)                          [+ Add section]│
│                                                                    │
│ ┌ ═══ HERO ═══ ═════════════════════ [required] ═══ [motion:editorial] ┐│
│ │ Variant: ambient ▾    Content source: auto ▾                  │  │
│ │ Warm SVG hero — Horizon-style. Data: hero.svg + logo + tagline│  │
│ │ [Edit hero image / SVG] [Edit metrics] [Edit socials]         │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌ ═══ ABOUT ═══ ═════════════════════ [required] ══════════════ ┐  │
│ │ Variant: seamless ▾   Content source: manual_content ✎        │  │
│ │ Editorial About that flows into Work. 3 paragraphs.           │  │
│ │ [Edit lede + paragraphs] [Suggest with AI]                    │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌ ═══ WORK ═══ ═══════════════════ [preferred] ═════════════════┐  │
│ │ Variant: grid ▾       Content source: manual_select           │  │
│ │ 8 projects selected · [Change selection]                      │  │
│ │ ▸ Sabhyata Sanctuary (Mumbai)  · pinned as featured           │  │
│ │ ▸ Vidya Sagar Residence (Alibaug)                             │  │
│ │ ▸ … 6 more                                                    │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌ ═══ INTELLIGENCE ═══ ═════════════ [premium] 🔒 ═════════════ ┐  │
│ │ Requires: intelligence_integration                             │  │
│ │ Package (Spotlight) includes this capability. But no reports  │  │
│ │ found — section will hide until reports exist.                │  │
│ │ [Commission a report]                                         │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌ ═══ FILM ═══ ═══════════════════════ [premium] 🔒 ═════════════┐ │
│ │ Requires: commissioned_film                                    │  │
│ │ Package (Spotlight) does NOT include this capability.          │  │
│ │ [Upgrade to Partner]                                           │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌ ═══ CONTACT ═══ ══════════════════ [required] ══════════════ ┐  │
│ │ Variant: light ▾      Content source: auto ▾                 │  │
│ │ [Edit contact meta]                                           │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ─────────────────────────────────────────────────                  │
│ ▸ Disabled sections (0)                                            │
│ ▸ Irrelevant for Architecture category — hidden from library:      │
│    products · timeline · closer                                    │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

**Signals in the wireframe:**

- Section badge (`[required]`, `[preferred]`, `[premium]` etc.) mirrors composition rule priority.
- 🔒 icon = entitlement gate.
- ✎ icon = manual override active on this field.
- ▾ = dropdown.
- Drag handle on each section (not shown) for reordering.
- Sections marked `irrelevant` by composition rules are grouped at the bottom, not shown in the section library.

---

## 5. Per-section editor — worked example

Clicking `[Edit lede + paragraphs]` on the About section opens:

```
┌───────────────────────────────────────────────────────────────────┐
│ Edit: ABOUT  (variant: seamless · content_source: manual_content) │
│                                                                    │
│ Heading                                                            │
│ ┌────────────────────────────────────────────┐                    │
│ │ The practice                               │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ Lede (display-scale opening line)                                  │
│ ┌────────────────────────────────────────────┐                    │
│ │ We build things that outlive the developer.│                    │
│ │                                            │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ Paragraphs                                                         │
│ ┌────────────────────────────────────────────┐  [Suggest with AI] │
│ │ 1. TEEARCH was founded in Mumbai in 1997…  │  [Insert paragraph]│
│ │                                            │  [Reorder]          │
│ │ 2. Twenty-eight years and 480,000 sq ft…   │  [Delete]           │
│ │                                            │                    │
│ │ 3. The practice has always believed in…    │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ Sub-eyebrow (optional)                                             │
│ ┌────────────────────────────────────────────┐                    │
│ │ The practice                               │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ ─────────────────────────────────────────────────                  │
│ ☐ Ai regenerate enabled                                            │
│ Last human edit: 2026-08-15 by editor@ghar.tv                      │
│ Last AI regen: 2026-08-10                                          │
│                                                                    │
│ [Cancel]  [Save changes]                                           │
└───────────────────────────────────────────────────────────────────┘
```

**Field-level controls:**
- Inline rich-text editor for prose (uses [`EDITOR-blocks-spec.json`](EDITOR-blocks-spec.json) inline formatting vocabulary — bold / italic / link / mark)
- `[Suggest with AI]` invokes the AI composition suggester for THIS field only (see [`AI-INGESTION.md`](AI-INGESTION.md))
- `AI regenerate enabled` toggle — when off, this section is excluded from any brand-wide AI regeneration

---

## 6. Distribution admin — pins + suppressions

Per-surface admin surface:

```
┌───────────────────────────────────────────────────────────────────┐
│ SURFACE: brand_directory  ( /brands )                              │
│                                                                    │
│ FEATURED SLOTS (4, requires entitlement: category_priority)        │
│ ┌────────────────────────────────────────────┐                    │
│ │ 1. TEEARCH               [pin] [suppress]  │                    │
│ │ 2. Avirahi               [pin] [suppress]  │                    │
│ │ 3. Scarlet Splendour     [pin] [suppress]  │                    │
│ │ 4. Godrej Properties     [pin] [suppress]  │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ ORGANIC RESULTS (24 per page — showing first 12)                   │
│ ┌────────────────────────────────────────────┐                    │
│ │ 5. Horizon Architects    [pin] [suppress]  │                    │
│ │ 6. Obeetee               [pin] [suppress]  │                    │
│ │ …                                          │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ CURRENT PINS  (2)                                                  │
│ ┌────────────────────────────────────────────┐                    │
│ │ TEEARCH → slot 1 (expires: never)          │  [Remove]          │
│ │ Avirahi → slot 2 (expires: 2026-12-31)     │  [Remove]          │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ CURRENT SUPPRESSIONS  (0)                                          │
│                                                                    │
│ [Add pin]  [Add suppression]                                       │
└───────────────────────────────────────────────────────────────────┘
```

---

## 7. Entitlement admin — per-brand overrides

Per-brand entitlement view:

```
┌───────────────────────────────────────────────────────────────────┐
│ TEEARCH — Entitlements                                             │
│                                                                    │
│ Package: Spotlight                       [Change package]          │
│                                                                    │
│ FROM PACKAGE (17 capabilities)                                     │
│ ┌────────────────────────────────────────────┐                    │
│ │ ✓ basic_profile (1)                        │                    │
│ │ ✓ enhanced_profile (1)                     │                    │
│ │ ✓ custom_hero_ambient (1)                  │                    │
│ │ ✓ premium_theme (1)                        │                    │
│ │ ✓ motion_cinematic (1)                     │                    │
│ │ ✓ category_priority (∞)                    │                    │
│ │ ✓ voices_curation (6)                      │                    │
│ │ ✓ editorial_recommendation (∞)             │                    │
│ │ ✓ person_profile_enhanced (3)              │                    │
│ │ ✓ intelligence_integration (2)             │                    │
│ │ … 7 more                                   │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ ADD-ONS  (1)                                                       │
│ ┌────────────────────────────────────────────┐                    │
│ │ ✓ commissioned_film (1)                    │                    │
│ │   Granted: 2026-08-01                      │  [Revoke]          │
│ │   Expires: 2027-08-01                      │                    │
│ │   Reason: Q4 2026 brand campaign           │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ NOT AVAILABLE (Package tier)                                       │
│ ┌────────────────────────────────────────────┐                    │
│ │ ✗ sponsored_story                          │  [Grant add-on]    │
│ │ ✗ ghartalks_appearance                     │  [Grant add-on]    │
│ │ ✗ videoworks_short                         │  [Grant add-on]    │
│ │ ✗ homepage_placement                       │  [Grant add-on]    │
│ │ … 6 more                                   │                    │
│ └────────────────────────────────────────────┘                    │
│                                                                    │
│ [Upgrade to Partner]                                               │
└───────────────────────────────────────────────────────────────────┘
```

---

## 8. Draft vs published

Every entity carries a `status` (draft / published / archived) and every
`profile_section_configs` change goes into draft state by default.

**Publish flow:**

1. Admin edits sections.
2. Changes save to draft state (`profile_section_configs_draft` — mirror table OR JSON column).
3. Admin clicks Preview — renders composer with draft configs.
4. Admin clicks Publish — atomically copies draft → live configs. Cache invalidates.
5. Old configs archived (kept for rollback).

**Auto-publish** for AUTO-mode content sections that pull from resolver: no admin action needed; the resolver's latest output is always live.

---

## 9. AI regeneration — how it interacts with admin edits

Regeneration passes ONLY touch sections where:

- `content_source = 'auto'` OR
- `content_source = 'manual_content'` AND `ai_regenerate_enabled = true`

Never touches:

- `content_source = 'manual_select'` (admin explicitly picked the entities)
- `content_source = 'custom_html'` (admin escape hatch)
- Sections with `ai_regenerate_enabled = false`
- Sections where `last_admin_edit_at > last_ai_regen_at` and admin has locked the section

**"Regenerate" button** in the section editor gives admin explicit control. Regenerating a section:

1. Runs AI composition suggester for the section (see [`AI-INGESTION.md`](AI-INGESTION.md)).
2. Presents proposed changes as diff.
3. Admin accepts / rejects.
4. Accepted changes update the config; `last_ai_regen_at` updated.

---

## 10. Audit log

Every admin edit + every AI regeneration + every entitlement change is logged.

```sql
CREATE TABLE admin_action_log (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor          VARCHAR(120),                     -- admin@ghar.tv OR 'ai_regenerator'
  action_type    ENUM('section_edit','section_reorder','section_enable','section_disable','variant_change',
                       'entitlement_grant','entitlement_revoke','package_change',
                       'pin_add','pin_remove','suppression_add','suppression_remove',
                       'publish','archive'),
  entity_type    ENUM('brand','person','surface'),
  entity_id      INT NOT NULL,
  section_id     VARCHAR(80) NULL,
  changes_json   JSON,                             -- before/after snapshot
  reason         TEXT,                             -- for revocations / suppressions
  ip             VARCHAR(45),
  user_agent     VARCHAR(300),
  created_at     DATETIME NOT NULL,
  KEY idx_entity (entity_type, entity_id),
  KEY idx_actor (actor, created_at),
  KEY idx_action (action_type, created_at)
);
```

Retention: 2 years. Then compressed to monthly summaries.

---

## 11. Role-based access

Not every admin can do everything. Suggested roles:

| role | can | cannot |
|---|---|---|
| `editor` | Edit section content, variants, per-brand pins/suppressions | Change package assignments, grant entitlement overrides, edit rate cards |
| `admin` | All of editor + package assignments + entitlement overrides + suppression reasons | Custom HTML paste — no wait, admin CAN — see below |
| `senior_editor` | Same as `editor` + custom HTML paste | Same as editor for other things |
| `commercial` | View analytics, package usage, revenue; grant entitlement add-ons | Edit content |

Custom HTML paste requires `admin` OR `senior_editor` role — per
[`EDITOR-migration-plan.md §5.5`](EDITOR-migration-plan.md) admin-only
raw HTML pattern.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json),
[`ENTITLEMENTS.md`](ENTITLEMENTS.md),
[`AI-INGESTION.md`](AI-INGESTION.md).
