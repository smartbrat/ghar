# Entity Relationships — the many-to-many layer

> How Brand ↔ Person ↔ Project ↔ Product relate, and how the resolvers
> query them. Replaces the current one-to-many `people.brand_id` FK
> with typed relationship join tables. Read alongside
> [`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json) (what
> consumes the resolved data) and
> [`BACKEND-INTEGRATION-GUIDE.md`](BACKEND-INTEGRATION-GUIDE.md) (the
> baseline schema this evolves from).

---

## 1. Why this exists

The shipped codebase treats a person as belonging to at most one brand
(`people.brand_id INT FK NULL`). The current 12-person tenant set
respects this — every person is filed under one primary brand.

The Brand Connect + Entity Publishing brief needs many-to-many:

- A founder who leaves one firm and joins another
- A partner sitting on multiple boards
- An analyst whose commentary appears on many brands' pages
- A person contributing to multiple projects across multiple brands
- A project with multiple brands (developer + architect + PMC + material suppliers)

The migration is **additive**. Existing `people.brand_id` becomes a
derived column that mirrors the person's current primary relationship
until deprecation. No shipped page breaks.

---

## 2. Entity tables — additions to existing schema

### 2.1 `brands` (existing — additions)

```sql
ALTER TABLE brands
  ADD COLUMN primary_category_id INT NULL AFTER category,       -- FK to brand_categories_taxonomy
  ADD COLUMN package_id INT NULL AFTER published,                -- FK to packages (see ENTITLEMENTS.md)
  ADD COLUMN status ENUM('draft','published','archived') DEFAULT 'draft',
  ADD COLUMN created_at DATETIME NOT NULL,
  ADD COLUMN updated_at DATETIME NOT NULL,
  ADD COLUMN claimed_at DATETIME NULL,                           -- when the brand acknowledged the page
  ADD COLUMN ai_ingested BOOLEAN DEFAULT FALSE,                  -- flagged by AI ingestion pipeline
  ADD KEY idx_status_category (status, primary_category_id),
  ADD KEY idx_package (package_id);
```

### 2.2 `brand_categories_taxonomy` (NEW)

```sql
CREATE TABLE brand_categories_taxonomy (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  slug           VARCHAR(80) UNIQUE NOT NULL,      -- 'developer', 'architect', 'materials', etc.
  label          VARCHAR(120) NOT NULL,
  parent_slug    VARCHAR(80) NULL,                 -- for sub-categories
  display_order  INT DEFAULT 100,
  is_active      BOOLEAN DEFAULT TRUE
);
```

Seed from [`COMPOSITION-RULES.md`](COMPOSITION-RULES.md) vocabulary.

### 2.3 `people` (existing — additions)

```sql
ALTER TABLE people
  ADD COLUMN primary_discipline_id INT NULL AFTER cat_id,       -- FK to person_disciplines_taxonomy
  ADD COLUMN status ENUM('draft','published','archived') DEFAULT 'draft',
  ADD COLUMN created_at DATETIME NOT NULL,
  ADD COLUMN updated_at DATETIME NOT NULL,
  ADD COLUMN ai_ingested BOOLEAN DEFAULT FALSE,
  ADD KEY idx_status_discipline (status, primary_discipline_id);

-- brand_id becomes derived — kept in sync with current primary relationship
-- until deprecation.
```

### 2.4 `person_disciplines_taxonomy` (NEW)

```sql
CREATE TABLE person_disciplines_taxonomy (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  slug           VARCHAR(80) UNIQUE NOT NULL,      -- 'architects', 'developers', 'brandleaders', etc.
  label          VARCHAR(120) NOT NULL,
  display_order  INT DEFAULT 100,
  is_active      BOOLEAN DEFAULT TRUE
);
```

### 2.5 `person_aliases` (NEW)

Supports entity resolution / dedupe (see §6).

```sql
CREATE TABLE person_aliases (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  person_id   INT NOT NULL,
  alias       VARCHAR(200) NOT NULL,
  alias_kind  ENUM('legal_name','maiden_name','handle','initials','misspelling'),
  source      VARCHAR(120),                         -- 'admin', 'ai_ingest', 'user_report'
  created_at  DATETIME NOT NULL,
  KEY idx_person (person_id),
  UNIQUE KEY uk_alias (alias)
);
```

Example: Suman Kanodia has alias 'Suman Bajoria' (married name); the
Scarlet Splendour team page links to `/people/suman-bajoria`.

### 2.6 `projects` (NEW)

```sql
CREATE TABLE projects (
  id                   INT PRIMARY KEY AUTO_INCREMENT,
  slug                 VARCHAR(200) UNIQUE NOT NULL,
  name                 VARCHAR(300) NOT NULL,
  city                 VARCHAR(120),
  locality             VARCHAR(120),
  project_type         ENUM('residential','commercial','mixed','institutional','industrial','hospitality','retail','religious','landscape'),
  status               ENUM('proposed','under_construction','delivered','archived') DEFAULT 'delivered',
  delivered_at         DATE NULL,
  hero_image_url       VARCHAR(500),
  description_lede     TEXT,
  description_body     MEDIUMTEXT,
  area_sqft            BIGINT NULL,
  units_count          INT NULL,
  budget_inr           BIGINT NULL,
  latitude             DECIMAL(10, 7) NULL,
  longitude            DECIMAL(10, 7) NULL,
  featured             BOOLEAN DEFAULT FALSE,
  ai_ingested          BOOLEAN DEFAULT FALSE,
  created_at           DATETIME NOT NULL,
  updated_at           DATETIME NOT NULL,
  KEY idx_city (city),
  KEY idx_type (project_type),
  KEY idx_status_delivered (status, delivered_at DESC)
);
```

### 2.7 `products` (NEW)

```sql
CREATE TABLE products (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  slug              VARCHAR(200) UNIQUE NOT NULL,
  brand_id          INT NOT NULL,                   -- owner (products belong to one brand)
  name              VARCHAR(300) NOT NULL,
  category          VARCHAR(120),                    -- 'sanitaryware', 'paint', 'sofa', 'chandelier'
  sub_category      VARCHAR(120),
  hero_image_url    VARCHAR(500),
  description_lede  TEXT,
  description_body  MEDIUMTEXT,
  price_inr         BIGINT NULL,
  featured          BOOLEAN DEFAULT FALSE,
  ai_ingested       BOOLEAN DEFAULT FALSE,
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL,
  KEY idx_brand (brand_id),
  KEY idx_category (category),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);
```

---

## 3. Relationship tables

### 3.1 `brand_person_relationships` (NEW — the load-bearing one)

```sql
CREATE TABLE brand_person_relationships (
  id                 INT PRIMARY KEY AUTO_INCREMENT,
  brand_id           INT NOT NULL,
  person_id          INT NOT NULL,
  role               VARCHAR(120) NOT NULL,          -- 'Partner', 'Principal Architect', 'CEO', 'Founder'
  relationship_type  ENUM('founder','current','past','advisor','board','contributor') NOT NULL,
  is_founder         BOOLEAN DEFAULT FALSE,
  is_leadership      BOOLEAN DEFAULT FALSE,
  is_featured        BOOLEAN DEFAULT FALSE,          -- surfaces on brand's team spotlight
  display_order      INT DEFAULT 100,
  start_date         DATE NULL,
  end_date           DATE NULL,                       -- NULL = current
  visibility         ENUM('public','discoverable','private') DEFAULT 'public',
  claimed_by_person  BOOLEAN DEFAULT FALSE,
  claimed_by_brand   BOOLEAN DEFAULT FALSE,
  source             ENUM('admin','ai_ingest','user_report','import') DEFAULT 'admin',
  created_at         DATETIME NOT NULL,
  updated_at         DATETIME NOT NULL,
  KEY idx_brand (brand_id, end_date),
  KEY idx_person (person_id, end_date),
  KEY idx_current (person_id, end_date, is_leadership),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);
```

**Note on `is_current`:** derived by `end_date IS NULL`. Do NOT store as
a separate column — it drifts from `end_date` and creates two sources of
truth for the same fact.

### 3.2 `brand_project_relationships` (NEW)

```sql
CREATE TABLE brand_project_relationships (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  brand_id       INT NOT NULL,
  project_id     INT NOT NULL,
  role           ENUM('developer','architect','pmc','landscape','interior','material_supplier','consultant','contractor') NOT NULL,
  is_lead        BOOLEAN DEFAULT FALSE,
  display_order  INT DEFAULT 100,
  visibility     ENUM('public','discoverable','private') DEFAULT 'public',
  created_at     DATETIME NOT NULL,
  updated_at     DATETIME NOT NULL,
  KEY idx_brand (brand_id),
  KEY idx_project (project_id),
  UNIQUE KEY uk_brand_project_role (brand_id, project_id, role),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 3.3 `person_project_relationships` (NEW)

```sql
CREATE TABLE person_project_relationships (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  person_id      INT NOT NULL,
  project_id     INT NOT NULL,
  role           VARCHAR(120) NOT NULL,               -- 'Principal Architect', 'Lead Designer'
  is_lead        BOOLEAN DEFAULT FALSE,
  display_order  INT DEFAULT 100,
  created_at     DATETIME NOT NULL,
  updated_at     DATETIME NOT NULL,
  KEY idx_person (person_id),
  KEY idx_project (project_id),
  UNIQUE KEY uk_person_project_role (person_id, project_id, role),
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### 3.4 `article_entity_mentions` (NEW — for content resolution)

Normalises the article-side entity mention data so recirculation +
attribution queries are indexable.

```sql
CREATE TABLE article_entity_mentions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  article_id     INT NOT NULL,
  entity_type    ENUM('brand','person','project','product'),
  entity_id      INT NOT NULL,
  mention_kind   ENUM('subject','author','sponsor','callout','tag','quoted'),
  created_at     DATETIME NOT NULL,
  KEY idx_entity (entity_type, entity_id, mention_kind),
  KEY idx_article (article_id)
);
```

Backfill from existing:
- `articles.sponsored_by_brand_id` → mention_kind='sponsor'
- `articles.author_slug` → resolve to person_id, mention_kind='author'
- `articles.featured_brands` → mention_kind='subject'
- Editor blocks (`brand_callout`, `person_callout`, `project_callout`) → mention_kind='callout'

---

## 4. Migration order (additive, non-breaking)

```
Step 1: Add taxonomy tables (brand_categories_taxonomy, person_disciplines_taxonomy)
        Seed with COMPOSITION-RULES.md vocabulary.
        Zero risk — no existing data affected.

Step 2: Add relationship tables (empty).
        Zero risk.

Step 3: Add projects + products tables (empty).
        Zero risk.

Step 4: Add article_entity_mentions table (empty).
        Zero risk.

Step 5: Backfill brand_person_relationships from people.brand_id.
        Every existing person → one row in brand_person_relationships
        with relationship_type='current', role=people.role.

Step 6: Backfill article_entity_mentions from existing article fields.

Step 7: Alter brands + people tables to add new columns (primary_category_id,
        package_id, status, timestamps).
        Additive; no data loss.

Step 8: Deploy code changes that READ from relationship tables in
        addition to the direct FKs.

Step 9: Wait 30 days. Verify no readers depend on people.brand_id.

Step 10: Deprecate people.brand_id. Mark DEPRECATED in schema comment.

Step 11 (later): Drop people.brand_id column.
```

Steps 1–7 are one migration. Step 8 is a code deploy. Steps 9–11 are
follow-up cleanups.

---

## 5. Resolver signatures

### 5.1 `resolveBrandContent(brand_id) → BrandContentBundle`

```php
class BrandContentResolver {
  public function resolve(int $brandId): BrandContentBundle {
    return new BrandContentBundle([
      'brand'                       => $this->loadBrand($brandId),
      'people'                      => $this->resolvePeople($brandId),         // brand_person_relationships JOIN people
      'projects'                    => $this->resolveProjects($brandId),       // brand_project_relationships JOIN projects
      'products'                    => $this->resolveProducts($brandId),       // products WHERE brand_id
      'articles_by'                 => $this->resolveArticlesBy($brandId),     // articles WHERE brand mentioned as subject
      'articles_mentioning'         => $this->resolveArticlesMentioning($brandId), // article_entity_mentions WHERE brand
      'videos'                      => $this->resolveVideos($brandId),
      'ghartalks'                   => $this->resolveGharTalks($brandId),
      'intelligence_reports'        => $this->resolveIntelligence($brandId),
      'voices_by_associated_people' => $this->resolveVoicesFromPeople($brandId), // attribution rule enforced
      'events_attended'             => $this->resolveEvents($brandId),
      'awards'                      => $this->resolveAwards($brandId),
    ]);
  }
}
```

### 5.2 `resolvePersonContent(person_id) → PersonContentBundle`

```php
class PersonContentResolver {
  public function resolve(int $personId): PersonContentBundle {
    return new PersonContentBundle([
      'person'          => $this->loadPerson($personId),
      'brands'          => $this->resolveBrands($personId),         // multiple; brand_person_relationships
      'projects'        => $this->resolveProjects($personId),
      'articles_by'     => $this->resolveArticlesBy($personId),     // author = person
      'articles_about'  => $this->resolveArticlesAbout($personId),  // article_entity_mentions WHERE person AND kind IN ('subject','callout','quoted')
      'voices_by'       => $this->resolveVoices($personId),
      'ghartalks'       => $this->resolveGharTalks($personId),
      'videos'          => $this->resolveVideos($personId),
      'events_spoken_at'=> $this->resolveEvents($personId),
      'awards'          => $this->resolveAwards($personId),
      'registrations'   => $this->resolveRegistrations($personId),
      'colleagues'      => $this->resolveColleagues($personId),     // brand_person_relationships JOIN people at same current brand
    ]);
  }
}
```

### 5.3 Attribution rule enforcement

Every resolver query MUST respect the attribution rule (see
[`PROFILE-TEMPLATES-HANDOFF.md §5`](PROFILE-TEMPLATES-HANDOFF.md)).

**Right pattern:**

```sql
-- Person's published coverage
SELECT a.* FROM articles a
WHERE a.author_slug = :person_slug
   OR a.id IN (
     SELECT article_id FROM article_entity_mentions
     WHERE entity_type = 'person' AND entity_id = :person_id
       AND mention_kind IN ('subject', 'author', 'quoted')
   );
```

**Wrong pattern (attribution bug):**

```sql
-- NEVER DO THIS
SELECT * FROM articles WHERE brand_id = (SELECT brand_id FROM people WHERE id = :person_id);
```

Query shape enforces the rule at the resolver layer, not at the presentation layer. A person profile can never accidentally show their employer's brand-attributed articles.

---

## 6. Entity resolution — the "never duplicate people" rule

Per brief §14. Every ingest that names a Person walks a resolver:

```
resolvePerson(candidateName, context = { city?, brand?, email?, linkedin?, profession? }):

  1. Normalise: lowercase, strip titles ('Ar.', 'Mr.', 'Ms.'), split first+last.

  2. Exact match against people.slug OR people.name OR person_aliases.alias.
     - Single match with confidence >= 0.85 → RETURN (matched, existing_id)
     - Multiple matches → BLOCK for admin review

  3. If linkedin URL supplied:
     - Query people WHERE JSON_EXTRACT(socials, '$.linkedin') = :linkedin
     - Match found → RETURN (matched, existing_id, confidence=0.99)

  4. If email supplied:
     - Match against known email domains for candidate's brand
     - Match → confidence 0.85

  5. Fuzzy match: Levenshtein distance ≤ 2 on name, exact match on city+profession
     - confidence 0.6 → BLOCK for admin review (never auto-reuse below 0.85)

  6. No match → CREATE new people row + relationship

  RETURN (created, new_id) OR (matched, existing_id, confidence) OR (blocked, candidates)
```

**Confidence weights (tunable):**

| signal | weight |
|---|---|
| Exact LinkedIn URL match | 0.99 |
| Exact name + same primary brand + same city | 0.95 |
| Exact name + same primary city | 0.90 |
| Exact name + same associated brand (any relationship type) | 0.85 |
| Fuzzy name (Levenshtein ≤ 2) + same city + same profession | 0.60 |
| Fuzzy name (Levenshtein ≤ 2) alone | 0.30 |

Threshold for auto-reuse: **0.85**. Below that: admin review.

**Special cases:**
- Married name / maiden name → both live as `person_aliases`. Resolver matches on either.
- Titles ("Ar.", "Prof.") stripped before comparison; retained in `people.role` per business logic.
- Common name collisions (multiple "Rahul Sharma") → resolver always blocks; admin disambiguates.

Same pattern for Brand entity resolution:

```
resolveBrand(candidateName, candidateWebsite, candidateLogoHash):

  1. Exact slug or name match → RETURN matched
  2. Website match (normalised domain) → confidence 0.99
  3. Logo perceptual hash match → confidence 0.90
  4. Fuzzy name → below 0.85: BLOCK for review
```

---

## 7. Deriving current primary relationships

For back-compat with the shipped code that reads `people.brand_id`:

```sql
-- Trigger: whenever brand_person_relationships changes, sync people.brand_id
DELIMITER $$
CREATE TRIGGER sync_person_brand_id
AFTER INSERT ON brand_person_relationships
FOR EACH ROW
BEGIN
  UPDATE people p
  SET p.brand_id = (
    SELECT bpr.brand_id FROM brand_person_relationships bpr
    WHERE bpr.person_id = NEW.person_id
      AND bpr.end_date IS NULL
      AND bpr.relationship_type = 'current'
    ORDER BY bpr.is_leadership DESC, bpr.display_order ASC
    LIMIT 1
  )
  WHERE p.id = NEW.person_id;
END $$
```

Similar trigger on UPDATE + DELETE. Keeps `people.brand_id` in sync until Step 11 of migration (drop column).

---

## 8. Access control

Not all relationships are public.

| visibility value | meaning |
|---|---|
| `public` | Renders on profile pages, distribution surfaces, search |
| `discoverable` | Renders on entity's own profile only; not surfaced elsewhere |
| `private` | Never rendered; admin/analytics access only |

Default: `public`.

**Use cases:**

- Board memberships that the brand hasn't announced → `discoverable`
- Advisory roles the person doesn't want public → `private`
- Historical relationships to a controversial past brand → `discoverable` (keeps the fact, hides from feed)

---

## 9. Content resolver caching

Every resolver call is cache-eligible. Cache key: `(entity_type, entity_id, viewer_context_hash)`. TTL: 5 minutes for `preview`, 1 hour for `published`.

Invalidation triggers:

| Change | Invalidates |
|---|---|
| entity record UPDATE | that entity's resolver bundle |
| relationship INSERT/UPDATE/DELETE | both endpoint entities' resolver bundles |
| article INSERT/UPDATE with `sponsored_by_brand_id` or `author_slug` | that brand's + author's bundles |
| article_entity_mention INSERT/DELETE | that entity's bundle |
| package_capabilities UPDATE | every brand on that package |

Cache implementation is programmer's choice (Redis, memcached, per-request memoization). The resolver interface is the contract; caching is opaque behind it.

---

## 10. Deprecation of `people.brand_id`

**Timeline:**

- **Weeks 1–4:** Ship migration + backfill (Steps 1–7).
- **Week 5:** Deploy code that reads relationship table primarily; `people.brand_id` becomes the fallback.
- **Weeks 6–8:** Monitor for readers of `people.brand_id`. Grep every code path.
- **Week 9:** Add DEPRECATED comment to column.
- **Week 12:** Drop `people.brand_id` in a schema-only migration.

**Rollback safety:** If Step 8 code deploy has a bug, `people.brand_id` is still populated and the previous code still works — revert deploy, no data lost.

---

## 11. Reading the current tenants — worked examples

### 11.1 Tarun Motta (existing person)

- `people.name = 'Tarun Motta'`
- `people.brand_id = 42` (TEEARCH)
- `people.role = 'Managing Partner'`

**After migration:**

- `people.brand_id = 42` (kept, mirror)
- `brand_person_relationships`:
  - `{ brand_id: 42, person_id: X, role: 'Managing Partner', relationship_type: 'current', is_founder: true, is_leadership: true, is_featured: true, start_date: NULL, end_date: NULL }`

### 11.2 Suman Kanodia (dual name)

- `people.name = 'Suman Kanodia'`
- `people.slug = 'suman-kanodia'`

**After migration:**

- `people` row unchanged.
- `person_aliases`:
  - `{ person_id: X, alias: 'Suman Bajoria', alias_kind: 'maiden_name' }`
- `brand_person_relationships`:
  - `{ brand_id: 51 (Scarlet), person_id: X, role: 'Co-founder', relationship_type: 'founder', is_founder: true, is_leadership: true }`

Scarlet template's `/people/suman-bajoria` link resolves via `person_aliases` lookup → `people.slug` → correct profile.

### 11.3 Godrej founders (future — dual affiliation)

Pirojsha Godrej currently `brand_id = Godrej Properties`. Adi Godrej currently `brand_id = Godrej Properties` too.

**Reality is richer:**

- Adi Godrej: `Chairman Emeritus, Godrej Group` (holding company) + `Board Member, Godrej Properties`
- Pirojsha Godrej: `Executive Chairman, Godrej Properties` + `Board Member, Godrej Group`

**With relationships:**

- Adi:
  - `{ brand_id: Godrej Group, role: 'Chairman Emeritus', relationship_type: 'current', is_founder: true }`
  - `{ brand_id: Godrej Properties, role: 'Board Member', relationship_type: 'board' }`
- Pirojsha:
  - `{ brand_id: Godrej Properties, role: 'Executive Chairman', relationship_type: 'current', is_leadership: true }`
  - `{ brand_id: Godrej Group, role: 'Board Member', relationship_type: 'board' }`

Adi's profile now surfaces both Godrej Group AND Godrej Properties in his "brands" section. Godrej Properties team page shows Pirojsha as leadership + Adi as board. Godrej Group team page (when it ships) shows Adi as chairman + Pirojsha as board.

The join table encodes the reality. Direct FK couldn't.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json),
[`BACKEND-INTEGRATION-GUIDE.md`](BACKEND-INTEGRATION-GUIDE.md),
[`AI-INGESTION.md`](AI-INGESTION.md).
