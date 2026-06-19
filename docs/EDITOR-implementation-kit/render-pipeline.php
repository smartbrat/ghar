<?php
/**
 * Ghar.tv article render pipeline.
 *
 * Called from the article view template. Takes the saved body of one article
 * section, resolves every block type back to display-ready HTML, applies
 * auto-injection rules for ads / brand cards / recirculation, and renders
 * the placement slots from the placement_registry.
 *
 * The stages are designed to be independently testable. Stage 1 only deals
 * with sanitised editor output. Stage 2 only injects. Stage 3 only fills
 * slots. None of them touches the database directly — they receive their
 * inputs as PHP arrays from the calling view.
 *
 * Usage in the article view:
 *
 *   require_once __DIR__ . '/render-pipeline.php';
 *
 *   $story  = load_story_with_metadata($article_id);   // your existing data layer
 *   $viewer = get_current_viewer();                    // tier, properties, role
 *
 *   foreach ($story['sections'] as $section) {
 *       echo render_section_body($section, $story, $viewer);
 *   }
 */

require_once __DIR__ . '/sanitize-editor-html.php';

/**
 * Entry point — renders one Content Section's HTML.
 * $section = ['title' => '...', 'body' => '...html from editor...', 'order' => 1]
 */
function render_section_body(array $section, array $story, array $viewer): string
{
    // Stage 1 — defence in depth: re-sanitise on read (cheap, idempotent)
    $body = sanitize_editor_html($section['body']);

    // Stage 2 — resolve callouts that store slugs to fully materialised HTML
    $body = resolve_callout_blocks($body);

    // Stage 3 — render placement slots (server fills them based on type + viewer)
    $body = render_placement_slots($body, $story, $viewer);

    // Stage 4 — render component embeds
    $body = render_component_embeds($body, $story);

    // Stage 5 — auto-inject ads / brand cards / recirculation per autoinjection_rules
    $body = apply_auto_injection($body, $story, $viewer);

    return $body;
}

/* ────────────────────────────────────────────────────────────────────────
 * Stage 2 — Callout resolution
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Editor stores callouts with `data-callout-kind` + `data-callout-slug`.
 * On render, look up the referenced record and replace name / sub / initials
 * with current values (so renaming a brand updates all stories at once).
 */
function resolve_callout_blocks(string $html): string
{
    return preg_replace_callback(
        '#<a\s+([^>]*data-callout-kind="([^"]+)"[^>]*data-callout-slug="([^"]+)"[^>]*)>(.*?)</a>#is',
        function ($m) {
            $kind = $m[2];
            $slug = $m[3];
            $record = lookup_callout_record($kind, $slug);
            if (!$record) {
                return $m[0]; // graceful fallback — keep the stored HTML
            }
            // Re-render the callout body with fresh data
            return render_callout_html($kind, $slug, $record);
        },
        $html
    );
}

function lookup_callout_record(string $kind, string $slug): ?array
{
    // Plug into your existing data layer; returns null if not found.
    switch ($kind) {
        case 'brand':     return db_fetch_brand_by_slug($slug);
        case 'person':    return db_fetch_person_by_slug($slug);
        case 'project':   return db_fetch_project_by_slug($slug);
        case 'read_next': return db_fetch_story_by_slug($slug);
    }
    return null;
}

function render_callout_html(string $kind, string $slug, array $record): string
{
    $href = match ($kind) {
        'brand'     => "/brands/$slug",
        'person'    => "/people/$slug",
        'project'   => $record['href'] ?? "/projects/$slug",
        'read_next' => "/design/$slug",
    };
    $label = $record['callout_label'] ?? match ($kind) {
        'brand'     => 'In this story',
        'person'    => 'About this person',
        'project'   => 'The project',
        'read_next' => 'Read next',
    };
    $initials = $record['initials'] ?? mb_substr($record['name'], 0, 2);
    $name = htmlspecialchars($record['name'], ENT_QUOTES);
    $sub  = htmlspecialchars($record['sub'] ?? '', ENT_QUOTES);

    return <<<HTML
<a href="$href" class="art-brand-callout" data-callout-kind="$kind" data-callout-slug="$slug">
  <div class="art-brand-callout__logo">$initials</div>
  <div>
    <span class="art-brand-callout__label">$label</span>
    <span class="art-brand-callout__name">$name</span>
    <span class="art-brand-callout__sub">$sub</span>
  </div>
  <svg class="art-brand-callout__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
</a>
HTML;
}

/* ────────────────────────────────────────────────────────────────────────
 * Stage 3 — Placement slot rendering
 * ──────────────────────────────────────────────────────────────────────── */

function render_placement_slots(string $html, array $story, array $viewer): string
{
    return preg_replace_callback(
        '#<div\s+class="art-slot"\s+([^>]+)></div>#is',
        function ($m) use ($story, $viewer) {
            $attrs = parse_data_attributes($m[1]);
            $type  = $attrs['data-slot-type'] ?? '';
            $size  = $attrs['data-slot-size'] ?? 'standard';
            $audience = $attrs['data-slot-audience'] ?? 'all';

            // Audience filter
            if (!viewer_matches_audience($viewer, $audience)) {
                return apply_fallback($attrs, $story, $viewer);
            }

            // Look up the placement renderer in placement_registry
            $registry = db_fetch_placement_registry($type);
            if (!$registry || !$registry['active']) {
                return '';
            }

            // Dispatch to the per-type renderer (lives at $registry['module_path'])
            return include_renderer($registry['module_path'], [
                'attrs'  => $attrs,
                'story'  => $story,
                'viewer' => $viewer,
                'size'   => $size,
            ]);
        },
        $html
    );
}

function parse_data_attributes(string $attrs): array
{
    $out = [];
    if (preg_match_all('#(data-[a-z\-]+)\s*=\s*"([^"]*)"#i', $attrs, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $out[$match[1]] = $match[2];
        }
    }
    return $out;
}

function viewer_matches_audience(array $viewer, string $audience): bool
{
    if ($audience === 'all') return true;
    $tier = $viewer['tier'] ?? 'logged_out';
    return match ($audience) {
        'logged_out' => $tier === 'logged_out',
        'logged_in'  => $tier !== 'logged_out',
        'subscriber' => $tier === 'subscriber',
        'broker'     => $viewer['role'] === 'broker',
        'developer'  => $viewer['role'] === 'developer',
        default      => false,
    };
}

function apply_fallback(array $attrs, array $story, array $viewer): string
{
    $fallback = $attrs['data-slot-fallback'] ?? 'collapse';
    return match ($fallback) {
        'collapse'            => '',
        'show_default'        => render_default_house_promo(),
        'show_recirculation'  => render_recirculation_card($story),
        default               => '',
    };
}

/* ────────────────────────────────────────────────────────────────────────
 * Stage 4 — Component embeds
 * ──────────────────────────────────────────────────────────────────────── */

function render_component_embeds(string $html, array $story): string
{
    return preg_replace_callback(
        '#<div\s+class="art-component"\s+([^>]+)></div>#is',
        function ($m) use ($story) {
            $attrs = parse_data_attributes($m[1]);
            $slug    = $attrs['data-component'] ?? '';
            $version = $attrs['data-component-version'] ?? '1.0.0';
            $props   = json_decode($attrs['data-component-props'] ?? '{}', true);

            $registry = db_fetch_component_registry($slug);
            if (!$registry || $registry['deprecated_at'] !== null) {
                return '<div class="art-component is-missing" aria-hidden="true">Component unavailable</div>';
            }

            // Scope check: story-scoped components only render on their story
            if ($registry['scope'] === 'story' &&
                !in_array($story['slug'], json_decode($registry['scope_refs'], true) ?? [], true)) {
                return '';
            }

            return include_renderer($registry['module_path'], [
                'slug'    => $slug,
                'version' => $version,
                'props'   => $props,
                'story'   => $story,
            ]);
        },
        $html
    );
}

/* ────────────────────────────────────────────────────────────────────────
 * Stage 5 — Auto-injection
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Walks the body as a sequence of top-level blocks, evaluates active rules
 * by descending priority, and splices in placement slots where rules match.
 * Respects: heading cohesion, never-stack-non-paragraphs, min-gap between
 * injections, explicit-slot wins, short-article skip.
 */
function apply_auto_injection(string $html, array $story, array $viewer): string
{
    $rules = db_fetch_active_autoinjection_rules(); // ordered by priority DESC

    $blocks = split_into_top_level_blocks($html);

    // Short-article skip
    $paragraph_count = count(array_filter($blocks, fn($b) => $b['tag'] === 'p'));
    if ($paragraph_count < 8) {
        // Only sponsor-brand-card runs on short articles
        $rules = array_filter($rules, fn($r) => $r['rule_id'] === 'sponsor-brand-card');
    }

    $injections = []; // array of ['at' => block_index, 'html' => block_html]

    foreach ($rules as $rule) {
        if (!rule_matches($rule, $story, $viewer, $blocks)) continue;
        if (editor_placed_same_type($blocks, $rule['inject']['slotType'])) continue;

        $at = resolve_position($rule['position'], $blocks);
        if ($at === null) continue;

        if (!position_is_safe($at, $blocks, $injections)) continue;

        $injections[] = [
            'at'   => $at,
            'html' => render_injected_slot($rule['inject'], $story, $viewer),
        ];
    }

    return splice_injections($blocks, $injections);
}

function split_into_top_level_blocks(string $html): array
{
    // Use DOMDocument because top-level blocks may contain nested HTML
    $dom = new DOMDocument('1.0', 'UTF-8');
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8"><div>' . $html . '</div>',
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    $blocks = [];
    foreach ($dom->getElementsByTagName('div')[0]->childNodes as $node) {
        if ($node->nodeType !== XML_ELEMENT_NODE) continue;
        $blocks[] = [
            'tag'  => strtolower($node->tagName),
            'html' => $dom->saveHTML($node),
            'class' => $node->getAttribute('class') ?? '',
        ];
    }
    return $blocks;
}

function position_is_safe(int $at, array $blocks, array $existing): bool
{
    // Heading cohesion — never break <h2>+<p> adjacency
    if ($at > 0 && in_array($blocks[$at - 1]['tag'], ['h2', 'h3'])) return false;
    if ($at < count($blocks) && in_array($blocks[$at]['tag'], ['h2', 'h3'])) return false;

    // Never inject within 2 blocks of an existing injection
    foreach ($existing as $inj) {
        if (abs($at - $inj['at']) < 2) return false;
    }

    // Never inject within final 3 blocks
    if ($at >= count($blocks) - 3) return false;

    // Never adjacent to special non-paragraph blocks
    $special_classes = ['art-stat', 'art-pullquote', 'art-note', 'art-brand-callout',
                        'art-video', 'art-audio', 'art-map', 'art-slot', 'art-component'];
    foreach ([$at - 1, $at] as $i) {
        if (!isset($blocks[$i])) continue;
        foreach ($special_classes as $cls) {
            if (str_contains($blocks[$i]['class'], $cls)) return false;
        }
    }
    return true;
}

function splice_injections(array $blocks, array $injections): string
{
    // Sort by position descending so we splice from the end → earlier indices stay valid
    usort($injections, fn($a, $b) => $b['at'] <=> $a['at']);
    foreach ($injections as $inj) {
        array_splice($blocks, $inj['at'], 0, [['tag' => 'div', 'html' => $inj['html'], 'class' => 'art-slot is-injected']]);
    }
    return implode("\n", array_column($blocks, 'html'));
}

/* ────────────────────────────────────────────────────────────────────────
 * Helpers — wired to the existing schema (intelligence_articles, brands,
 * people, projects) + the registries seeded by migrations.sql.
 *
 * Replace `db()` with whatever PDO/MySQLi handle the rest of /secreal uses;
 * the queries are kept simple so the integration is mechanical.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Returns the shared PDO handle. The intelligence/blog stack already opens
 * one in /secreal/lib/db.php — alias it here so this file stays portable.
 */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        // Defer to the existing /secreal/lib/db.php which sets $pdo.
        require_once $_SERVER['DOCUMENT_ROOT'] . '/secreal/lib/db.php';
        $pdo = $GLOBALS['pdo'] ?? throw new RuntimeException('PDO handle not exposed by /secreal/lib/db.php');
    }
    return $pdo;
}

function db_fetch_brand_by_slug(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, name, sub_title AS sub, initials, logo_url
                             FROM brands WHERE slug = :slug AND active = 1 LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function db_fetch_person_by_slug(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, name, designation AS sub, initials
                             FROM people WHERE slug = :slug AND active = 1 LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function db_fetch_project_by_slug(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, name, locality AS sub, project_url AS href
                             FROM projects WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function db_fetch_story_by_slug(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, title AS name, deck AS sub, hero_image_url AS image
                             FROM intelligence_articles WHERE slug = :slug AND status = "published" LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function db_fetch_placement_registry(string $type): ?array
{
    static $cache = [];
    if (isset($cache[$type])) return $cache[$type];
    $stmt = db()->prepare('SELECT slot_type, name, module_path, default_size, default_fallback, active
                             FROM placement_registry WHERE slot_type = :t LIMIT 1');
    $stmt->execute([':t' => $type]);
    return $cache[$type] = ($stmt->fetch(PDO::FETCH_ASSOC) ?: null);
}

function db_fetch_component_registry(string $slug): ?array
{
    $stmt = db()->prepare('SELECT slug, name, module_path, scope, scope_refs, prop_schema, deprecated_at
                             FROM component_registry WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $slug]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

function db_fetch_active_autoinjection_rules(): array
{
    static $rules = null;
    if ($rules !== null) return $rules;
    $stmt = db()->query('SELECT rule_id, description, match_when, inject, position, priority
                           FROM autoinjection_rules
                          WHERE active = 1
                          ORDER BY priority DESC, id ASC');
    $rules = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r['match_when'] = json_decode($r['match_when'], true) ?? [];
        $r['inject']     = json_decode($r['inject'],     true) ?? [];
        $r['position']   = json_decode($r['position'],   true) ?? [];
        $rules[] = $r;
    }
    return $rules;
}

/**
 * Match rule.match_when JSON against story + viewer + body shape.
 * Supported keys (extend as new rules are seeded):
 *   - viewerTier: ['logged_out','free',...]
 *   - viewerProperties: {key: value} — exact match on $viewer['properties'][key]
 *   - bodyParagraphCount: {min: N, max: N}
 *   - tagsIntersect: [tag,…]    OR   "ghartalks_guests" (a named set)
 *   - storyMetadata.sponsor: "isSet"
 *   - noBlockOfType: [type,…]   — skip if editor already placed one
 */
function rule_matches(array $rule, array $story, array $viewer, array $blocks): bool
{
    $cond = $rule['match_when'];
    $tier = $viewer['tier'] ?? 'logged_out';

    if (!empty($cond['viewerTier']) && !in_array('all', $cond['viewerTier'], true)
        && !in_array($tier, $cond['viewerTier'], true)) return false;

    if (!empty($cond['viewerProperties'])) {
        foreach ($cond['viewerProperties'] as $k => $expected) {
            if (($viewer['properties'][$k] ?? null) !== $expected) return false;
        }
    }

    if (!empty($cond['bodyParagraphCount'])) {
        $pc = count(array_filter($blocks, fn($b) => $b['tag'] === 'p'));
        if (isset($cond['bodyParagraphCount']['min']) && $pc < $cond['bodyParagraphCount']['min']) return false;
        if (isset($cond['bodyParagraphCount']['max']) && $pc > $cond['bodyParagraphCount']['max']) return false;
    }

    if (!empty($cond['tagsIntersect'])) {
        $storyTags = $story['tags'] ?? [];
        $needle    = is_string($cond['tagsIntersect'])
            ? named_tag_set($cond['tagsIntersect'])
            : $cond['tagsIntersect'];
        if (!array_intersect($storyTags, $needle)) return false;
    }

    if (($cond['storyMetadata.sponsor'] ?? null) === 'isSet'
        && empty($story['sponsor_brand_slug'])) return false;

    if (!empty($cond['noBlockOfType'])) {
        foreach ($cond['noBlockOfType'] as $type) {
            foreach ($blocks as $b) {
                if (str_contains($b['html'], 'data-block-type="' . $type . '"')) return false;
            }
        }
    }
    return true;
}

/** Named tag sets that auto-injection rules can target. Extend as needed. */
function named_tag_set(string $name): array
{
    return match ($name) {
        'ghartalks_guests' => array_column(
            db()->query('SELECT slug FROM tags WHERE collection = "ghartalks_guests"')->fetchAll(PDO::FETCH_ASSOC),
            'slug'
        ),
        default => [],
    };
}

function editor_placed_same_type(array $blocks, string $type): bool
{
    foreach ($blocks as $b) {
        if (str_contains($b['html'], 'data-slot-type="' . $type . '"')) return true;
    }
    return false;
}

/**
 * Resolve a position descriptor → block index. Supported shapes:
 *   {afterParagraph: N}      → after the Nth <p>
 *   {after: "first_h2"}      → after the first <h2>
 *   {beforeBlock: "last_h2"} → just before the final <h2>
 *   {beforeBlock: "first_h3OrAfterParagraph", fallback: "afterParagraph:10"}
 */
function resolve_position(array $position, array $blocks): ?int
{
    if (isset($position['afterParagraph'])) {
        $n = (int) $position['afterParagraph'];
        $count = 0;
        foreach ($blocks as $i => $b) {
            if ($b['tag'] === 'p' && ++$count === $n) return $i + 1;
        }
        return null;
    }
    if (isset($position['after']) && $position['after'] === 'first_h2') {
        foreach ($blocks as $i => $b) if ($b['tag'] === 'h2') return $i + 1;
        return null;
    }
    if (isset($position['beforeBlock'])) {
        $where = $position['beforeBlock'];
        if ($where === 'last_h2') {
            $last = null;
            foreach ($blocks as $i => $b) if ($b['tag'] === 'h2') $last = $i;
            return $last;
        }
        if ($where === 'first_h3OrAfterParagraph') {
            foreach ($blocks as $i => $b) if ($b['tag'] === 'h3') return $i;
            if (!empty($position['fallback']) && str_starts_with($position['fallback'], 'afterParagraph:')) {
                $n = (int) substr($position['fallback'], strlen('afterParagraph:'));
                return resolve_position(['afterParagraph' => $n], $blocks);
            }
        }
    }
    return null;
}

function render_injected_slot(array $inject, array $story, array $viewer): string
{
    $registry = db_fetch_placement_registry($inject['slotType']);
    if (!$registry || !$registry['active']) return '';
    return include_renderer($registry['module_path'], [
        'attrs'  => [
            'data-slot-type'     => $inject['slotType'],
            'data-slot-size'     => $inject['size'] ?? $registry['default_size'],
            'data-slot-audience' => 'all',
            'data-slot-fallback' => $inject['fallback'] ?? $registry['default_fallback'],
        ],
        'fill'   => $inject['fillWith'] ?? [],
        'story'  => $story,
        'viewer' => $viewer,
        'size'   => $inject['size'] ?? $registry['default_size'],
    ]);
}

function include_renderer(string $module_path, array $context): string
{
    if (!str_starts_with($module_path, '/')) return '';
    $abs = $_SERVER['DOCUMENT_ROOT'] . $module_path;
    if (!is_file($abs)) {
        error_log('[ghar-render] missing placement renderer: ' . $abs);
        return '';
    }
    extract($context);
    ob_start();
    include $abs;
    return ob_get_clean();
}

function render_default_house_promo(): string
{
    return '<aside class="art-slot art-slot--house-promo"><a href="/postproperty.php">Post your property — free on Ghar.tv</a></aside>';
}

function render_recirculation_card(array $story): string
{
    if (!empty($story['tags'])) {
        $stmt = db()->prepare('SELECT a.slug, a.title, a.hero_image_url
                                 FROM intelligence_articles a
                                 JOIN article_tags t ON t.article_id = a.id
                                WHERE t.tag IN (' . implode(',', array_fill(0, count($story['tags']), '?')) . ')
                                  AND a.slug <> ?
                                  AND a.status = "published"
                                ORDER BY a.published_at DESC LIMIT 3');
        $stmt->execute([...$story['tags'], $story['slug']]);
        $related = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($related) {
            $items = '';
            foreach ($related as $r) {
                $items .= sprintf(
                    '<li><a href="/design/%s">%s</a></li>',
                    htmlspecialchars($r['slug'], ENT_QUOTES),
                    htmlspecialchars($r['title'], ENT_QUOTES)
                );
            }
            return '<aside class="art-slot art-slot--recirculation"><span class="art-slot__label">Related</span><ul>' . $items . '</ul></aside>';
        }
    }
    return '';
}
