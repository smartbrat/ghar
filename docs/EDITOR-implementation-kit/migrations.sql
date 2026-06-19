-- Ghar.tv editor migration — DB schema additions.
-- Target: MySQL 8 / MariaDB 10.5+ (JSON columns + ENUM in DDL required).
-- Run inside a transaction; take a snapshot first.
-- All ALTERs are additive (new nullable columns + new tables) — no data loss.
--
-- Dependency notes for the renderer (docs/EDITOR-implementation-kit/render-pipeline.php):
--   • `intelligence_articles` is the canonical article table for the
--     intelligence pillar; mirror this migration to `blog_articles` if
--     that table backs other pillars.
--   • The renderer also touches `brands`, `people`, `projects` and a
--     `tags` + `article_tags` pair (named tag sets and recirculation).
--     These are assumed to exist in the production schema — if they
--     don't, add them in a separate migration first.

START TRANSACTION;

-- ============================================================
-- 1. Story metadata columns on the existing articles table
-- ============================================================
-- Adapt table name to your actual one (intelligence_articles / blog_articles / etc.)

ALTER TABLE intelligence_articles
  ADD COLUMN deck TEXT NULL AFTER title,
  ADD COLUMN hero_image_credit VARCHAR(200) NULL AFTER image_caption,
  ADD COLUMN author_slug VARCHAR(80) NULL AFTER editorname,
  ADD COLUMN read_time_minutes INT NULL AFTER published_at,
  ADD COLUMN sponsor_brand_slug VARCHAR(80) NULL,
  ADD COLUMN sponsor_disclosure_label VARCHAR(40) DEFAULT 'Presented by',
  ADD COLUMN sponsor_paid_partnership TINYINT(1) DEFAULT 1,
  ADD COLUMN related_logic ENUM('auto-by-tag','auto-by-pillar','manual') DEFAULT 'auto-by-tag',
  ADD COLUMN related_manual_slugs JSON NULL,
  ADD COLUMN cross_vertical_links JSON NULL;

-- Mirror to blog_articles if blogs share the same template
-- ALTER TABLE blog_articles ADD COLUMN ... (same as above)

-- ============================================================
-- 2. Footnotes — one row per note, linked to article id + section
-- ============================================================
-- Footnote refs in body store `data-fn-id`; this table holds the body and
-- the renderer joins on save. Auto-numbering happens at render time, not save.

CREATE TABLE IF NOT EXISTS article_footnotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  article_type ENUM('intelligence','blog') NOT NULL,
  fn_id VARCHAR(40) NOT NULL,           -- stable ID issued by the editor
  body TEXT NOT NULL,                   -- the note content (rich inline)
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (article_id, article_type),
  UNIQUE (article_id, article_type, fn_id)
);

-- ============================================================
-- 3. Component registry — bespoke per-article components
-- ============================================================

CREATE TABLE IF NOT EXISTS component_registry (
  slug VARCHAR(80) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  module_path VARCHAR(255) NOT NULL,    -- e.g. /components/articles/alibaug-floorplan.php
  scope ENUM('global','story','series','pillar') NOT NULL DEFAULT 'story',
  scope_refs JSON,                      -- array of slugs the component is scoped to
  prop_schema JSON,                     -- JSON Schema for prop validation
  preview_image VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deprecated_at DATETIME NULL,
  INDEX (scope)
);

-- ============================================================
-- 4. Placement registry — what each slot_type renders to
-- ============================================================

CREATE TABLE IF NOT EXISTS placement_registry (
  slot_type VARCHAR(40) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  module_path VARCHAR(255) NOT NULL,    -- e.g. /placements/brand_profile.php
  default_size ENUM('compact','standard','wide','boxed') DEFAULT 'standard',
  default_fallback ENUM('collapse','show_default','show_recirculation') DEFAULT 'collapse',
  active TINYINT(1) DEFAULT 1
);

-- Seed the 15 slot types from EDITOR-blocks-spec.json
INSERT INTO placement_registry (slot_type, name, module_path, default_size, default_fallback) VALUES
  ('ad_display',        'Display ad',         '/placements/ad_display.php',         'standard', 'collapse'),
  ('ad_native',         'Native ad',          '/placements/ad_native.php',          'wide',     'collapse'),
  ('brand_profile',     'Brand profile',      '/placements/brand_profile.php',      'boxed',    'collapse'),
  ('person_profile',    'Person profile',     '/placements/person_profile.php',     'boxed',    'collapse'),
  ('newsletter_signup', 'Newsletter signup',  '/placements/newsletter_signup.php',  'boxed',    'collapse'),
  ('ghartalks_promo',   'GharTalks promo',    '/placements/ghartalks_promo.php',    'standard', 'collapse'),
  ('ghar_finance_widget','Ghar Finance widget','/placements/ghar_finance_widget.php','boxed',    'collapse'),
  ('ghar_design_widget','Ghar Design widget', '/placements/ghar_design_widget.php', 'boxed',    'collapse'),
  ('ghar_move_widget',  'Ghar Move widget',   '/placements/ghar_move_widget.php',   'boxed',    'collapse'),
  ('recirculation_by_tag', 'Recirculation by tag', '/placements/recirculation_by_tag.php', 'standard', 'show_recirculation'),
  ('recirculation_by_series','Recirculation by series', '/placements/recirculation_by_series.php', 'standard', 'show_recirculation'),
  ('trending_now',      'Trending now',       '/placements/trending_now.php',       'standard', 'collapse'),
  ('intelligence_module','Intelligence module','/placements/intelligence_module.php','wide',    'collapse'),
  ('events_module',     'Events module',      '/placements/events_module.php',      'wide',     'collapse'),
  ('custom',            'Custom',             '/placements/custom.php',             'standard', 'collapse');

-- ============================================================
-- 5. Auto-injection rules
-- ============================================================

CREATE TABLE IF NOT EXISTS autoinjection_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id VARCHAR(80) UNIQUE NOT NULL,
  description TEXT,
  match_when JSON NOT NULL,             -- e.g. {"viewerTier":["logged_out","free"],"bodyParagraphCount":{"min":8}}
  inject JSON NOT NULL,                 -- e.g. {"slotType":"ad_display","size":"standard"}
  position JSON NOT NULL,               -- e.g. {"afterParagraph":5}
  priority INT DEFAULT 50,
  active TINYINT(1) DEFAULT 1
);

-- Seed the 7 rules from EDITOR-blocks-spec.json
INSERT INTO autoinjection_rules (rule_id, description, match_when, inject, position, priority) VALUES
  ('sponsor-brand-card', 'On sponsored stories, inject the sponsor brand profile after the first H2.',
    '{"storyMetadata.sponsor":"isSet"}',
    '{"slotType":"brand_profile","fillWith":{"brandSlug":"{{storyMetadata.sponsor.brandSlug}}"}}',
    '{"after":"first_h2"}', 100),
  ('in-article-ad-display-1', 'Display ad after the 5th body paragraph for logged-out / free.',
    '{"viewerTier":["logged_out","free"],"bodyParagraphCount":{"min":8}}',
    '{"slotType":"ad_display","size":"standard"}',
    '{"afterParagraph":5}', 80),
  ('in-article-ad-display-2', 'Second display ad before the conclusion on long-reads.',
    '{"viewerTier":["logged_out","free"],"bodyParagraphCount":{"min":18}}',
    '{"slotType":"ad_display","size":"standard"}',
    '{"beforeBlock":"last_h2"}', 75),
  ('newsletter-signup', 'Newsletter prompt mid-article for logged-out non-subscribers.',
    '{"viewerTier":["logged_out"],"viewerProperties":{"newsletterSubscribed":false},"bodyParagraphCount":{"min":10}}',
    '{"slotType":"newsletter_signup","size":"boxed"}',
    '{"afterParagraph":8}', 60),
  ('ghartalks-cross-promo', 'GharTalks episode promo when the story tags include a guest.',
    '{"tagsIntersect":"ghartalks_guests","noBlockOfType":["audio_episode"]}',
    '{"slotType":"ghartalks_promo"}',
    '{"afterParagraph":12}', 50),
  ('ghar-finance-affiliate', 'Ghar Finance widget on home-loan / buyer-guide stories.',
    '{"tagsIntersect":["home-loans","buyer-guides"],"viewerTier":["all"]}',
    '{"slotType":"ghar_finance_widget","size":"boxed"}',
    '{"beforeBlock":"first_h3OrAfterParagraph","fallback":"afterParagraph:10"}', 40),
  ('recirculation-by-tag', 'Related-stories card on articles longer than 15 paragraphs.',
    '{"bodyParagraphCount":{"min":15}}',
    '{"slotType":"recirculation_by_tag"}',
    '{"beforeBlock":"last_h2"}', 30);

-- ============================================================
-- 6. Indexes for the query patterns the render pipeline will use
-- ============================================================
CREATE INDEX idx_articles_sponsor ON intelligence_articles (sponsor_brand_slug);
CREATE INDEX idx_articles_author ON intelligence_articles (author_slug);

COMMIT;
