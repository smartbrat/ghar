# Entitlements — capability keys + package bundles

> How Brand Connect capabilities are stored, granted, and enforced.
> Replaces the current pattern of package-tier-baked-into-marketing-copy
> with an explicit capability engine that both admin controls and
> template rendering read from.
>
> **Load-bearing rule.** Nowhere in code should there be
> `if (brand.package === 'spotlight')`. Everywhere reads capabilities.
> Packages are just bundles of capabilities. Adding / renaming /
> repricing a package = config change, not a code change.
>
> **Companion docs:** [`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json)
> (which sections have entitlement gates),
> [`DISTRIBUTION-SURFACES.json`](DISTRIBUTION-SURFACES.json) (which
> surfaces have promoted slots that need entitlements).

---

## 1. The tables

```sql
CREATE TABLE capabilities (
  key            VARCHAR(80) PRIMARY KEY,
  label          VARCHAR(160) NOT NULL,
  description    TEXT,
  scope          ENUM('profile_section','distribution','content_production','analytics','service'),
  is_automated   BOOLEAN,               -- brief §74: highly scalable vs requires human work
  cost_tier      ENUM('none','low','medium','high'),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     DATETIME NOT NULL
);

CREATE TABLE packages (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  slug           VARCHAR(80) UNIQUE,     -- 'presence', 'spotlight', 'partner'
  name           VARCHAR(160),
  description    TEXT,
  monthly_price_inr  INT,                -- internal only; public brand-connect page shows this only if is_public
  annual_price_inr   INT,
  is_public      BOOLEAN DEFAULT TRUE,   -- true = shown on /brand-connect
  active         BOOLEAN DEFAULT TRUE,
  display_order  INT DEFAULT 100,
  created_at     DATETIME NOT NULL
);

CREATE TABLE package_capabilities (
  package_id     INT,
  capability_key VARCHAR(80),
  limit_int      INT NULL,                -- e.g. "3 person profiles" → limit=3; NULL = unlimited
  PRIMARY KEY (package_id, capability_key),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (capability_key) REFERENCES capabilities(key) ON DELETE CASCADE
);

CREATE TABLE brand_entitlement_overrides (
  brand_id       INT,
  capability_key VARCHAR(80),
  action         ENUM('grant','revoke','override_limit'),
  limit_int      INT NULL,
  granted_at     DATETIME NOT NULL,
  expires_at     DATETIME NULL,           -- NULL = permanent
  granted_by     VARCHAR(120),             -- admin who did it
  reason         TEXT,
  PRIMARY KEY (brand_id, capability_key),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  FOREIGN KEY (capability_key) REFERENCES capabilities(key) ON DELETE CASCADE
);
```

**`limit_int` semantics:**
- `NULL` in `package_capabilities` = unlimited use of the capability
- integer = numeric limit (e.g. "3 person profiles per brand")
- `override_limit` action lets admin bump limit for a specific brand

**`expires_at` semantics:**
- `NULL` = permanent
- past date = automatically ignored at resolve time

---

## 2. The initial capability vocabulary

Rows for seed migration. Add more as the product grows.

### 2.1 Profile section capabilities

Gates variants + section-level features on brand + person profiles.

| key | label | scope | automated | cost_tier |
|---|---|---|---|---|
| `basic_profile` | Basic brand profile page | profile_section | yes | none |
| `enhanced_profile` | Enhanced brand profile (premium variants) | profile_section | yes | low |
| `custom_hero_ambient` | Custom ambient SVG hero | profile_section | yes | low |
| `commissioned_film` | Commissioned hero film | profile_section | no | high |
| `premium_theme` | Custom brand theme tokens beyond default | profile_section | yes | low |
| `motion_cinematic` | Cinematic motion profile | profile_section | yes | none |
| `contact_dark_variant` | Dark contact panel variant | profile_section | yes | none |
| `person_profile` | Basic person profile | profile_section | yes | none |
| `person_profile_enhanced` | Enhanced person profile with all sections | profile_section | yes | low |
| `person_profile_leadership_grid` | Leadership grid variant on team section | profile_section | yes | none |

### 2.2 Distribution capabilities

Gates promoted slots across surfaces (see [`DISTRIBUTION-SURFACES.json`](DISTRIBUTION-SURFACES.json)).

| key | label | scope | automated | cost_tier |
|---|---|---|---|---|
| `directory_listing` | Listed in /brands and category pages | distribution | yes | none |
| `category_priority` | Priority placement in category directories | distribution | yes | low |
| `locality_priority` | Priority placement on locality pages | distribution | yes | low |
| `homepage_placement` | Featured slot on homepage carousel | distribution | yes | medium |
| `newsletter_distribution` | Featured brand in weekly newsletter | distribution | no | medium |
| `premium_distribution` | All promoted slots across all surfaces | distribution | yes | medium |
| `editorial_recommendation` | Recommended in article recirculation | distribution | yes | low |
| `search_priority` | Priority in search results | distribution | yes | low |

### 2.3 Content production capabilities

Gates human-produced content deliverables.

| key | label | scope | automated | cost_tier |
|---|---|---|---|---|
| `sponsored_story` | Sponsored editorial story | content_production | no | high |
| `ghartalks_appearance` | GharTalks podcast episode | content_production | no | high |
| `videoworks_short` | Short-form VideoWorks film | content_production | no | high |
| `videoworks_long` | Long-form VideoWorks film | content_production | no | high |
| `intelligence_integration` | Intelligence section + reports | content_production | no | medium |
| `voices_curation` | Curated voice entries | content_production | no | low |
| `creator_campaign` | Creator network campaign | content_production | no | high |
| `event_sponsorship` | GharEvents sponsorship slot | content_production | no | high |

### 2.4 Analytics capabilities

| key | label | scope | automated | cost_tier |
|---|---|---|---|---|
| `analytics_basic` | Basic page-view analytics | analytics | yes | none |
| `analytics_full` | Full analytics — impressions, referrers, dwell | analytics | yes | low |
| `lead_capture` | Contact form leads captured | analytics | yes | low |
| `lead_routing` | Leads routed to brand's own CRM | analytics | yes | low |
| `analytics_export` | CSV / API export | analytics | yes | low |

### 2.5 Service capabilities

Human-delivered account management + customisation.

| key | label | scope | automated | cost_tier |
|---|---|---|---|---|
| `account_manager` | Dedicated Ghar.tv account manager | service | no | medium |
| `custom_component` | Bespoke design component on profile | service | no | high |
| `priority_support` | SLA-backed support | service | no | low |
| `onboarding_assistance` | White-glove onboarding | service | no | medium |

---

## 3. Seed packages

**These are commercial drafts** based on the current Brand Connect
positioning. The tier names + capability bundles are the product team's
decision, not the programmer's. Adjust these seeds via product review
before the first live customer.

### Presence (baseline)

Minimum viable public brand profile.

```sql
INSERT INTO packages (slug, name, description, monthly_price_inr, is_public, active, display_order) VALUES
  ('presence', 'Presence', 'Basic brand profile with directory listing.', 15000, TRUE, TRUE, 10);
```

Capabilities:

| capability_key | limit |
|---|---|
| `basic_profile` | 1 |
| `directory_listing` | ∞ |
| `contact_dark_variant` | 1 |
| `analytics_basic` | ∞ |
| `lead_capture` | ∞ |
| `person_profile` | 1 |

### Spotlight (mid-tier)

Enhanced profile + curated content + moderate distribution.

```sql
INSERT INTO packages (slug, name, description, monthly_price_inr, is_public, active, display_order) VALUES
  ('spotlight', 'Spotlight', 'Enhanced profile, curated editorial, category priority.', 60000, TRUE, TRUE, 20);
```

Capabilities (in addition to Presence):

| capability_key | limit |
|---|---|
| `enhanced_profile` | 1 |
| `custom_hero_ambient` | 1 |
| `premium_theme` | 1 |
| `motion_cinematic` | 1 |
| `category_priority` | ∞ |
| `voices_curation` | 6 |
| `editorial_recommendation` | ∞ |
| `person_profile_enhanced` | 3 |
| `person_profile_leadership_grid` | 1 |
| `analytics_full` | ∞ |
| `lead_routing` | ∞ |
| `intelligence_integration` | 2 |
| `account_manager` | 1 |

### Partner (top tier)

Full-service partnership — homepage, film, GharTalks, everything.

```sql
INSERT INTO packages (slug, name, description, monthly_price_inr, is_public, active, display_order) VALUES
  ('partner', 'Partner', 'Full partnership — film, GharTalks, homepage placement, unlimited people.', 200000, TRUE, TRUE, 30);
```

Capabilities (in addition to Spotlight):

| capability_key | limit |
|---|---|
| `commissioned_film` | 1 per year |
| `sponsored_story` | 4 per year |
| `ghartalks_appearance` | 2 per year |
| `videoworks_short` | 2 per year |
| `videoworks_long` | 1 per year |
| `homepage_placement` | ∞ |
| `newsletter_distribution` | 4 per year |
| `premium_distribution` | ∞ |
| `locality_priority` | ∞ |
| `search_priority` | ∞ |
| `person_profile_enhanced` | 10 |
| `creator_campaign` | 1 per year |
| `event_sponsorship` | 1 per year |
| `custom_component` | 1 per year |
| `priority_support` | ∞ |
| `analytics_export` | ∞ |

---

## 4. The resolver

```php
class EntitlementResolver {
  private array $cache = [];

  public function resolve(int $brandId): EntitlementBundle {
    if (isset($this->cache[$brandId])) return $this->cache[$brandId];

    $brand = $this->loadBrand($brandId);

    // Start with package capabilities
    $capabilities = [];
    $limits = [];
    if ($brand->package_id) {
      $rows = $this->loadPackageCapabilities($brand->package_id);
      foreach ($rows as $row) {
        $capabilities[$row->capability_key] = true;
        $limits[$row->capability_key] = $row->limit_int; // NULL = unlimited
      }
    }

    // Apply overrides
    $overrides = $this->loadBrandOverrides($brandId);
    foreach ($overrides as $override) {
      if ($override->expires_at && $override->expires_at < now()) continue;

      switch ($override->action) {
        case 'grant':
          $capabilities[$override->capability_key] = true;
          $limits[$override->capability_key] = $override->limit_int;
          break;
        case 'revoke':
          unset($capabilities[$override->capability_key]);
          unset($limits[$override->capability_key]);
          break;
        case 'override_limit':
          if (isset($capabilities[$override->capability_key])) {
            $limits[$override->capability_key] = $override->limit_int;
          }
          break;
      }
    }

    $bundle = new EntitlementBundle($capabilities, $limits);
    $this->cache[$brandId] = $bundle;
    return $bundle;
  }

  public function has(int $brandId, string $capabilityKey): bool {
    return $this->resolve($brandId)->has($capabilityKey);
  }

  public function limit(int $brandId, string $capabilityKey): ?int {
    return $this->resolve($brandId)->limit($capabilityKey);
  }
}
```

---

## 5. Enforcement points

Every gate call. Cheap because the resolver is cached per-request.

### 5.1 Section rendering

```php
// In BrandPageComposer:
foreach ($sections as $section) {
  foreach ($section->entitlement_gates as $gate) {
    if (!$entitlementResolver->has($brandId, $gate)) {
      continue; // skip section
    }
  }
  // ... render section
}
```

### 5.2 Variant selection

```php
$variant = $config->variant ?? $rule->variant_default;
if ($variant->requires_entitlement && !$entitlementResolver->has($brandId, $variant->requires_entitlement)) {
  $variant = $section->firstFreeVariant(); // fall back
}
```

### 5.3 Distribution surface promoted slots

```php
// In DistributionResolver:
if ($slot->requires_entitlement) {
  $candidates = array_filter($candidates, fn($entity) =>
    $entitlementResolver->has($entity->id, $slot->requires_entitlement)
  );
}
```

### 5.4 Admin UI

```php
foreach ($availableSections as $section) {
  foreach ($section->entitlement_gates as $gate) {
    if (!$entitlementResolver->has($brandId, $gate)) {
      // Show "Upgrade to unlock" chip in admin UI
      $section->locked = true;
      $section->locked_reason = "Requires {$gate} — upgrade package";
    }
  }
}
```

---

## 6. The public /brand-connect page consumes the same data

The commercial landing at [`brand-connect.html`](../brand-connect.html)
reads from `packages` + `package_capabilities`. No divergence between
marketing copy and technical delivery.

```php
// Backend for /brand-connect
$publicPackages = Package::where('is_public', true)
  ->where('active', true)
  ->orderBy('display_order')
  ->with('capabilities')
  ->get();

// Template renders each package with:
//   - name, description (editable marketing text)
//   - monthly_price_inr (formatted per Indian conventions)
//   - capability bullet list (derived from package_capabilities JOIN capabilities.label)
```

**Marketing copy stays editable.** Package name, description, hero image — all admin-editable. Capability list — derived from the tables; can't drift.

**Rate card ([`docs/RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md)) is internal only** — never surfaces publicly. Includes overrides, custom bundles, negotiated deals, corporate rates.

---

## 7. Add-ons and custom deals

Not every commercial arrangement fits a package.

**Add-on:** grant a specific capability to a brand outside their package. Use `brand_entitlement_overrides` with `action='grant'`, `expires_at` set.

Example: TEEARCH on Spotlight package + one-off `commissioned_film` add-on for a specific campaign.

```sql
INSERT INTO brand_entitlement_overrides
  (brand_id, capability_key, action, granted_at, expires_at, granted_by, reason)
VALUES
  (42, 'commissioned_film', 'grant', NOW(), NOW() + INTERVAL 1 YEAR, 'admin@ghar.tv', 'Add-on for TEEARCH Q4 2026 campaign');
```

**Custom package:** create a new package with a bespoke capability set. Set `is_public = FALSE` so it doesn't appear on `/brand-connect`.

Example: Godrej Corporate — bespoke bundle for the parent group. Not offered to any other brand.

```sql
INSERT INTO packages (slug, name, description, monthly_price_inr, is_public, active, display_order) VALUES
  ('godrej-corporate', 'Godrej Corporate (bespoke)', 'Custom bundle for Godrej Group.', 500000, FALSE, TRUE, 999);
```

---

## 8. Migration for existing tenants

Every currently-live brand tenant gets assigned a package during Phase 2 of the [Brand Engine Architecture migration](BRAND-ENGINE-ARCHITECTURE.md).

**Assignment worksheet:**

| Tenant | Currently ships | Package assignment | Overrides needed |
|---|---|---|---|
| TEEARCH | Enhanced service template + film | Spotlight | + `commissioned_film` add-on |
| Horizon Architects | Enhanced service template + ambient hero | Spotlight | (none) |
| Avirahi | Developer template + team | Spotlight | (none) |
| Godrej Properties | Developer template + film + glass ribbon | Partner | (baseline) |
| Scarlet Splendour | Enhanced service template + product photography | Spotlight | (none) |
| Obeetee | Classic hero + basic sections | Presence | (none — legacy) |
| Saint-Gobain | Classic hero + basic sections | Presence | (none — legacy) |
| Asian Paints | Classic hero + basic sections | Presence | (none — legacy) |

Person profiles are individual entities and don't have their own packages. Enhanced person profiles are gated by their primary brand's `person_profile_enhanced` limit.

---

## 9. Package changes at the customer boundary

**Upgrade:** admin changes `brand.package_id`, capabilities become available immediately. Cached resolver bundle invalidates.

**Downgrade:** capabilities that were on the old package but not the new one become UNAVAILABLE. Content already published under those capabilities:

- Sections requiring the lost capability → gracefully collapse (`hidden` attribute set)
- Distribution slots requiring the lost capability → next distribution resolve stops surfacing the brand there
- Content-production deliverables already produced (film, sponsored story) → stay published (don't unpublish paid work)

**Cancellation:** brand.package_id set to NULL. Only `basic_profile` + `directory_listing` remain (via a special "cancelled" ruleset).

---

## 10. Testing entitlements

Every code path that gates should have a test that toggles the capability + verifies the gate.

```php
public function test_developer_section_intelligence_hidden_without_entitlement() {
  $brand = Brand::factory()->create(['package_id' => $this->presencePackage->id]);
  $composer = new BrandPageComposer();
  $html = $composer->compose($brand->id);
  $this->assertStringNotContainsString('bpr-intel-grid', $html);
}

public function test_developer_section_intelligence_shown_with_entitlement() {
  $brand = Brand::factory()->create(['package_id' => $this->spotlightPackage->id]);
  IntelligenceReport::factory()->for($brand)->count(3)->create();
  $composer = new BrandPageComposer();
  $html = $composer->compose($brand->id);
  $this->assertStringContainsString('bpr-intel-grid', $html);
}
```

---

## 11. Analytics

Every entitlement check is logged (async). Feeds:

- Which capabilities are actually used across the tenant base
- Which capabilities are gated (blocked) frequently — signals demand for upgrades
- Which packages have the highest utilisation ratio

Data table:

```sql
CREATE TABLE entitlement_check_log (
  id             BIGINT PRIMARY KEY AUTO_INCREMENT,
  brand_id       INT NOT NULL,
  capability_key VARCHAR(80),
  result         ENUM('granted','denied'),
  context        VARCHAR(200),      -- e.g. 'section:intelligence', 'surface:homepage_brand_carousel'
  checked_at     DATETIME NOT NULL,
  KEY idx_brand_time (brand_id, checked_at),
  KEY idx_capability (capability_key)
);
```

Partitioned by month. Rolled up nightly into `entitlement_usage_daily`.

---

**Last updated:** 2026-08-31. Companion:
[`PROFILE-SECTIONS-SPEC.json`](PROFILE-SECTIONS-SPEC.json),
[`DISTRIBUTION-SURFACES.json`](DISTRIBUTION-SURFACES.json),
[`RATE-CARD-brandconnect-internal.md`](RATE-CARD-brandconnect-internal.md).
