# Ghar.tv editor migration plan — TinyMCE 3 → TinyMCE 7 + new block system

**Audience:** the backend / full-stack developer who will implement the article editor.
**Goal:** keep your PHP form, data model, and save endpoints intact while bringing the editor up to support every block in [docs/EDITOR-blocks-spec.json](EDITOR-blocks-spec.json) — including placement slots, component embeds, callouts, and in-between editorial elements.

This doc is a single-pass playbook. Each phase is independently shippable. Skip nothing in **Phase 0** — it removes a stored-XSS risk that exists today regardless of the rest.

---

## Why TinyMCE 7 (not CKEditor 5, not staying on TinyMCE 3)

| Option | Verdict |
|---|---|
| **Stay on TinyMCE 3.3.9** | Reject. Released 2010, no security patches, no modern plugin model. The `valid_elements` config today allows `<script src>` and unrestricted `<iframe>` — known stored-XSS surface. |
| **Migrate to CKEditor 5** | Possible but high-friction. Would require rewriting your save endpoint to accept CKEditor's JSON `model.data` format, retraining content editors, and re-implementing every `tw*` plugin from scratch in a different API. |
| **Upgrade to TinyMCE 7** ← *picked* | Modern release line (active 2024+). Compatible with the **existing per-section PHP form** — `textarea name="content1"` etc. stay the same. Custom block plugins use a clean API. Your `tw*` plugin patterns port forward mechanically. Most of your toolbar config is rename-only. |

The article data model — Key Takeaways + 6 Content Sections + FAQ + Remarks — stays exactly as it is. You're not migrating articles; you're swapping the editor that fills the same fields.

---

## Phase 0 — Security tightening (1 day, ship today on TinyMCE 3)

The current `valid_elements` is dangerous. Tighten it before anything else:

```js
// In whichever PHP / JS bootstraps tinyMCE.init for content1–content6, keytakeaways, remarks:
tinyMCE.init({
  // ... existing config ...

  // REMOVE: script, form, input, button, select, textarea, object, embed, param,
  //         font, big, bdo, kbd, samp, tt, var, fieldset, legend, optgroup, option
  // KEEP a narrower allowlist:
  valid_elements:
    'a[href|target=_blank|rel|title|class],' +
    'strong/b,em/i,sub,sup,mark,br,hr,' +
    '#p,h2,h3,' +
    'ol,ul,li,' +
    'dl,dt,dd,' +
    'blockquote[cite|class],cite,q[cite],' +
    'img[src|alt|width|height|class|loading=lazy|decoding=async],' +
    'figure[class],figcaption[class],' +
    'table[class],thead,tbody,tfoot,tr,th[scope|colspan|rowspan],td[colspan|rowspan],caption,' +
    'details[class],summary[class],' +
    'time[datetime],abbr[title],' +
    'div[class|data-*],span[class|data-*],aside[class|data-*],section[class|data-*]',

  // Remove `script` and tighten iframe:
  extended_valid_elements:
    'iframe[src|width|height|loading=lazy|allow|allowfullscreen|referrerpolicy|class|sandbox],' +
    'figure[class],figcaption[class]',

  // Allowed iframe origins — enforced server-side too (see below):
  // www.youtube.com, www.youtube-nocookie.com, player.vimeo.com, open.spotify.com, ghar.tv

  // Strip dangerous stuff:
  invalid_elements: 'script,style,link,base,meta,form,input,button,select,textarea,object,embed',

  // Never allow inline style attributes:
  // (style is no longer in any element's attribute list above)
});
```

**Server-side companion (PHP, run on save):**

```php
// secreal/lib/sanitize_editor_html.php
function sanitize_editor_html(string $html): string {
    // 1. Strip <script>, <style>, <link>, <base>, <meta>, on* attributes
    $html = preg_replace('#<(script|style|link|base|meta)[^>]*>.*?</\1>#is', '', $html);
    $html = preg_replace('#<(script|style|link|base|meta)[^>]*/?>#is', '', $html);
    $html = preg_replace('#\s+on[a-z]+\s*=\s*"[^"]*"#i', '', $html);
    $html = preg_replace("#\s+on[a-z]+\s*=\s*'[^']*'#i", '', $html);

    // 2. Strip style="" attributes (force class-based styling)
    $html = preg_replace('#\s+style\s*=\s*"[^"]*"#i', '', $html);
    $html = preg_replace("#\s+style\s*=\s*'[^']*'#i", '', $html);

    // 3. Validate iframe origins
    $allowed_iframe_origins = [
        'www.youtube.com', 'www.youtube-nocookie.com',
        'player.vimeo.com', 'open.spotify.com',
        'ghar.tv', 'www.ghar.tv'
    ];
    $html = preg_replace_callback(
        '#<iframe[^>]*src\s*=\s*["\']([^"\']+)["\'][^>]*>.*?</iframe>#is',
        function($m) use ($allowed_iframe_origins) {
            $host = parse_url($m[1], PHP_URL_HOST);
            return in_array($host, $allowed_iframe_origins) ? $m[0] : '';
        },
        $html
    );

    return $html;
}

// Call from giarticle.php save handler:
$_POST['content1'] = sanitize_editor_html($_POST['content1']);
// ... same for each section field
```

This is a **drop-in patch** that works against TinyMCE 3 today. Ship it before the upgrade.

---

## Phase 1 — TinyMCE 7 upgrade with full parity (3–5 days)

### 1.1 — Replace the script include

```php
<!-- DELETE -->
<script src="/secreal/jseditor/tiny_mce/tiny_mce.js"></script>

<!-- ADD (self-hosted, ~2 MB, GPL-free) -->
<script src="/secreal/jseditor/tinymce/tinymce.min.js"></script>
```

Download TinyMCE 7 community zip → drop into `/secreal/jseditor/tinymce/`. License: MIT.

### 1.2 — Unified init config (replaces every old `tinyMCE.init({...})` block)

```js
// /secreal/jseditor/ghar-editor.js — one config, applied to every content* + keytakeaways + remarks textarea
tinymce.init({
  selector: 'textarea.gh-editor',              // give your textareas this class in PHP
  license_key: 'gpl',                          // community / GPL mode (free)
  promotion: false,                            // hide Tiny's upsell
  branding: false,
  height: 360,

  plugins: [
    'lists', 'link', 'table', 'image',
    'paste', 'code', 'wordcount', 'searchreplace',
    'anchor', 'autolink', 'charmap', 'help',
    // Custom Ghar plugins (Phase 3+):
    'ghar_callout', 'ghar_slot', 'ghar_component',
    'ghar_video', 'ghar_audio', 'ghar_map',
    'ghar_stat', 'ghar_note', 'ghar_footnote',
    'ghar_speclist', 'ghar_gallery', 'ghar_pullquote',
    'ghar_divider', 'ghar_image_caption',
    'ghar_rawhtml'   // admin-only, hidden if not allowed
  ],

  toolbar: [
    // Row 1 — text
    'undo redo | blocks | bold italic link superscript | mark | ' +
    'bullist numlist speclist | h2 h3 | divider',
    // Row 2 — media + blocks
    'image_caption gallery video audio map | ' +
    'pullquote blockquote stat note footnote | ' +
    'callout_brand callout_person callout_project callout_read_next | ' +
    'slot component | code rawhtml'
  ].join(' | '),

  // Force Format dropdown to ONLY paragraph + H2 + H3
  block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3',

  // Styles preset — picked up by the Styles dropdown
  style_formats: [
    { title: 'Lead paragraph',       block: 'p',  classes: 'art-lead' },
    { title: 'Lead — with drop cap', block: 'p',  classes: 'art-lead has-dropcap' },
    { title: 'Divider (three dots)', block: 'p',  classes: 'art-divider' }
  ],
  style_formats_merge: false,

  // Hard sanitizer — same allowlist as Phase 0 but enforced by Tiny too
  valid_elements: '...same as Phase 0...',
  extended_valid_elements: '...same as Phase 0...',
  invalid_elements: 'script,style,link,base,meta,form,input,button,select,textarea,object,embed',

  // Cleanup pasted Word / Google Docs content
  paste_as_text: false,
  paste_remove_styles_if_webkit: true,
  paste_word_valid_elements: 'b,strong,i,em,h2,h3,p,br,ol,ul,li,a',

  // Show editor preview in roughly the same type as the published article
  content_css: '/styles.css,/secreal/jseditor/ghar-editor-preview.css',
  body_class: 'art-body',

  // Image upload — your existing jbimages endpoint
  images_upload_url: '/secreal/jseditor/upload.php',
  automatic_uploads: true,

  // Save round-trip (PHP form continues to work — textareas auto-sync on submit)
  setup: function(editor) {
    editor.on('SubmitContent', function() {
      tinymce.triggerSave();
    });
  }
});
```

In PHP, add `class="gh-editor"` to every editor-bound textarea:

```php
<textarea name="content1" id="content1" class="gh-editor"><?=$content1?></textarea>
```

That's literally the only PHP change in Phase 1. Save endpoint, DB columns, form structure — all untouched.

### 1.3 — Port the `tw*` plugins to v7 API

Old plugin signature:

```js
// TinyMCE 3
(function() {
  tinymce.create('tinymce.plugins.TwBlockquotePlugin', {
    init: function(ed, url) { /* ... */ },
    getInfo: function() { /* ... */ }
  });
  tinymce.PluginManager.add('twblockquote', tinymce.plugins.TwBlockquotePlugin);
})();
```

New plugin signature:

```js
// TinyMCE 7
tinymce.PluginManager.add('ghar_pullquote', function(editor) {
  editor.ui.registry.addButton('pullquote', {
    icon: 'quote',
    tooltip: 'Pull quote',
    onAction: () => {
      editor.insertContent(
        '<blockquote class="art-pullquote"><p>&ldquo;Your pulled line.&rdquo;</p><cite>Source</cite></blockquote>'
      );
    }
  });
});
```

Each `tw*` plugin maps to one `ghar_*` plugin. Copy the old plugin folder structure → rewrite each `init` body with the v7 API → register button + onAction.

**Effort:** ~30 min per plugin × ~5 ported plugins = half a day.

---

## Phase 2 — Toolbar discipline (1 day)

The current toolbar exposes underline, all 4 alignments, and arbitrary text color — all of which break the editorial style guide ([CLAUDE.md §2.2](../CLAUDE.md)).

```js
// Already in the Phase 1 toolbar config — but for completeness:
//   - NO underline (use bold/italic instead — underline reads as a link)
//   - NO justify / align-center / align-right (editorial = left-aligned only)
//   - NO arbitrary forecolor (color is a brand discipline, not editor-pickable)
//   - NO font_family / font_size pickers
//   - Format dropdown limited via `block_formats`
//   - Styles dropdown limited via `style_formats`
```

For admins who need an escape valve, expose `code` (HTML source) + `rawhtml` plugin (Phase 5).

---

## Phase 3 — Custom block plugins, Tier A (3–5 days)

These plugins each render one block from [EDITOR-blocks-spec.json](EDITOR-blocks-spec.json) into the editor. Output HTML matches what the article-body chassis (`.art-body` in [design-article.html](../design-article.html)) already expects.

### 3.1 — One-liner skeleton each plugin follows

```js
// /secreal/jseditor/ghar-plugins/ghar_stat.js
tinymce.PluginManager.add('ghar_stat', function(editor) {
  editor.ui.registry.addButton('stat', {
    icon: 'character-count',
    tooltip: 'Stat / figure block',
    onAction: () => editor.windowManager.open({
      title: 'Insert stat',
      body: {
        type: 'panel',
        items: [
          { type: 'input', name: 'num', label: 'Number / phrase (e.g. "12 years")' },
          { type: 'textarea', name: 'caption', label: 'Caption' }
        ]
      },
      buttons: [
        { type: 'cancel', text: 'Cancel' },
        { type: 'submit', text: 'Insert', primary: true }
      ],
      onSubmit: (api) => {
        const d = api.getData();
        editor.insertContent(`
          <figure class="art-stat">
            <div class="art-stat__num">${d.num}</div>
            <figcaption class="art-stat__caption">${d.caption}</figcaption>
          </figure>
        `);
        api.close();
      }
    })
  });
});
```

### 3.2 — Tier A plugins (priority order, ~30–60 min each)

| Plugin | Spec id | Fields | Notes |
|---|---|---|---|
| `ghar_image_caption` | `inline_image` | src + alt + caption + credit | Upgrade `jbimages` — return figure+figcaption+credit, not raw `<img>` |
| `ghar_video` | `video_youtube` | youtubeUrl → extract videoId | Render `.thumb-play` overlay (canonical, already in styles.css) |
| `ghar_stat` | `stat_block` | num + caption | Pattern shown above |
| `ghar_note` | `editors_note` | label + paragraphs | Two-field dialog, render `<aside class="art-note">` |
| `ghar_pullquote` | `pull_quote` | content + cite | Render `.art-pullquote` (distinct from blockquote) |
| `ghar_speclist` | `spec_list` | rows of {label, value} | Render `<dl class="art-specs">` |
| `ghar_divider` | `divider` | (no fields) | Insert `<p class="art-divider">· · ·</p>` |
| `ghar_footnote` | `footnotes` | content per note | Inserts `<sup>` ref, maintains foot list on save (see 3.3) |
| `ghar_anchor` | `anchor` | slug | Adds `id="..."` attribute to current heading |

### 3.3 — Footnote auto-numbering (server-side post-process)

On save, walk the saved content of all content sections in order, re-number every `<sup data-fn-id>` ref, and rebuild the `<section class="art-footnotes">` block at the foot of `remarks`. Pseudo-PHP:

```php
function renumber_footnotes(array $sections, string $remarks): array {
    $refs = [];
    foreach ($sections as &$html) {
        $html = preg_replace_callback(
            '#<sup\s+data-fn-id="([^"]+)">.*?</sup>#i',
            function($m) use (&$refs) {
                $id = $m[1];
                if (!isset($refs[$id])) $refs[$id] = count($refs) + 1;
                $n = $refs[$id];
                return "<sup id=\"fn-ref-$n\"><a href=\"#fn-$n\">$n</a></sup>";
            },
            $html
        );
    }
    // Rebuild the foot list from refs[]
    $listItems = '';
    foreach ($refs as $id => $n) {
        $body = lookup_footnote_body($id);   // from a footnotes table or JSON column
        $listItems .= "<li id=\"fn-$n\">$body <a href=\"#fn-ref-$n\">↩</a></li>";
    }
    $remarks = "<section class=\"art-footnotes\"><p class=\"art-footnotes__head\">Notes</p><ol>$listItems</ol></section>";
    return [$sections, $remarks];
}
```

Editor stores stable `data-fn-id`s; backend renumbers them deterministically. Same idea covers editing / reordering without breaking links.

---

## Phase 4 — Callout pickers (3–4 days)

The four callout variants share one chassis. Build one plugin, parametrize by `kind`:

```js
// /secreal/jseditor/ghar-plugins/ghar_callout.js
const CALLOUT_KINDS = {
  brand:     { label: 'Brand callout',  api: '/secreal/api/brands.php',   defaultLabel: 'In this story' },
  person:    { label: 'Person callout', api: '/secreal/api/people.php',   defaultLabel: 'About the architect' },
  project:   { label: 'Project callout', api: '/secreal/api/projects.php', defaultLabel: 'The project' },
  read_next: { label: 'Read next',      api: '/secreal/api/stories.php',  defaultLabel: 'Read next' }
};

tinymce.PluginManager.add('ghar_callout', function(editor) {
  Object.entries(CALLOUT_KINDS).forEach(([kind, cfg]) => {
    editor.ui.registry.addButton(`callout_${kind}`, {
      text: cfg.label,
      tooltip: cfg.label,
      onAction: () => openPicker(editor, kind, cfg)
    });
  });
});

async function openPicker(editor, kind, cfg) {
  editor.windowManager.open({
    title: cfg.label,
    body: {
      type: 'panel',
      items: [
        { type: 'urlinput', name: 'slug', label: 'Search…', filetype: 'file' },
        { type: 'input', name: 'label_override', label: 'Custom label (optional)' }
      ]
    },
    initialData: { slug: '', label_override: '' },
    onAction: async (api, details) => {
      // Hook urlinput to your /secreal/api/* endpoints — returns list of {slug, name, sub, initials}
    },
    buttons: [{ type: 'submit', text: 'Insert', primary: true }],
    onSubmit: (api) => {
      const d = api.getData();
      const href = (kind === 'read_next' ? '/design/' : `/${kind === 'person' ? 'people' : kind === 'project' ? 'design' : 'brands'}/`) + d.slug;
      const label = d.label_override || cfg.defaultLabel;
      editor.insertContent(`
        <a href="${href}" class="art-brand-callout" data-callout-kind="${kind}" data-callout-slug="${d.slug}">
          <div class="art-brand-callout__logo">${d.initials || '··'}</div>
          <div>
            <span class="art-brand-callout__label">${label}</span>
            <span class="art-brand-callout__name">${d.name}</span>
            <span class="art-brand-callout__sub">${d.sub || ''}</span>
          </div>
          <svg class="art-brand-callout__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>
      `);
      api.close();
    }
  });
}
```

### Backend endpoints needed (PHP)

```
GET /secreal/api/brands.php?q=jaq
  → [{ slug: "jaquar", name: "Jaquar", sub: "Bath & lighting · Mumbai", initials: "J" }, …]

GET /secreal/api/people.php?q=bijoy   → same shape
GET /secreal/api/projects.php?q=…    → same shape (returns { href, name, sub, initials })
GET /secreal/api/stories.php?q=…     → same shape (returns { slug, name, sub: "Series · read time", initials })
```

All four endpoints query existing tables (brands, people, projects, articles) with a `LIKE '%q%'` filter and return the first 10 matches. The backend already has these tables — this is wiring, not new data.

**Saved HTML stores both `data-callout-kind` and `data-callout-slug`** — lets you re-resolve broken links on render if a brand renames, and lets you analytics-track callout clicks.

---

## Phase 5 — Placement slot + component embed + raw HTML (4–5 days)

### 5.1 — Placement slot plugin

```js
// /secreal/jseditor/ghar-plugins/ghar_slot.js
const SLOT_TYPES = [
  { value: 'ad_display',        text: 'Display ad' },
  { value: 'ad_native',         text: 'Native ad' },
  { value: 'brand_profile',     text: 'Brand profile' },
  { value: 'person_profile',    text: 'Person profile' },
  { value: 'newsletter_signup', text: 'Newsletter signup' },
  { value: 'ghartalks_promo',   text: 'GharTalks promo' },
  { value: 'ghar_finance_widget', text: 'Ghar Finance widget' },
  { value: 'recirculation_by_tag', text: 'Recirculation by tag' },
  { value: 'trending_now',      text: 'Trending now' },
  { value: 'intelligence_module', text: 'Intelligence module' }
  // … full list in EDITOR-blocks-spec.json
];

tinymce.PluginManager.add('ghar_slot', function(editor) {
  editor.ui.registry.addButton('slot', {
    text: 'Placement',
    tooltip: 'Insert placement slot',
    onAction: () => editor.windowManager.open({
      title: 'Insert placement slot',
      body: {
        type: 'panel',
        items: [
          { type: 'selectbox', name: 'slotType', label: 'Slot type', items: SLOT_TYPES },
          { type: 'input', name: 'slotId', label: 'Slot id (e.g. in-article-1)' },
          { type: 'selectbox', name: 'size', label: 'Size', items: [
            { value: 'standard', text: 'Standard' },
            { value: 'compact', text: 'Compact' },
            { value: 'wide', text: 'Wide' },
            { value: 'boxed', text: 'Boxed' }
          ]},
          { type: 'selectbox', name: 'audience', label: 'Audience', items: [
            { value: 'all', text: 'All' },
            { value: 'logged_out', text: 'Logged-out only' },
            { value: 'subscriber', text: 'Subscribers only' }
          ]}
        ]
      },
      onSubmit: (api) => {
        const d = api.getData();
        editor.insertContent(
          `<div class="art-slot" data-slot-type="${d.slotType}" data-slot-id="${d.slotId}" data-slot-size="${d.size}" data-slot-audience="${d.audience}"></div>`
        );
        api.close();
      }
    })
  });
});
```

The empty `<div>` shows the labeled dashed stub in the editor (CSS already in [design-article.html](../design-article.html)). Server fills it at render time.

### 5.2 — Server-side slot renderer (PHP)

```php
// secreal/lib/render_slots.php — called on article render, NOT on save
function render_placement_slots(string $html, array $story, array $viewer): string {
    return preg_replace_callback(
        '#<div class="art-slot"\s+([^>]+)></div>#i',
        function($m) use ($story, $viewer) {
            $attrs = parse_data_attrs($m[1]);

            // Audience filter
            if (!matches_audience($attrs['data-slot-audience'], $viewer)) {
                return $attrs['data-fallback'] === 'collapse' ? '' : render_default($attrs);
            }

            // Dispatch to the per-type renderer
            switch ($attrs['data-slot-type']) {
                case 'brand_profile':
                    return render_brand_profile($story['sponsor']['brand_slug']);
                case 'ad_display':
                    return render_ad_display($attrs['data-slot-id'], $story);
                case 'newsletter_signup':
                    return render_newsletter_card();
                // …
            }
            return '';
        },
        $html
    );
}
```

### 5.3 — Component embed

```js
// /secreal/jseditor/ghar-plugins/ghar_component.js
tinymce.PluginManager.add('ghar_component', function(editor) {
  editor.ui.registry.addButton('component', {
    text: 'Custom component',
    tooltip: 'Insert bespoke component',
    onAction: async () => {
      // Fetch components scoped to this article + globals
      const articleSlug = window.__GHAR_STORY_SLUG__;   // set by giarticle.php
      const components = await fetch(`/secreal/api/components.php?article=${articleSlug}`).then(r => r.json());

      editor.windowManager.open({
        title: 'Insert custom component',
        body: {
          type: 'panel',
          items: [
            { type: 'selectbox', name: 'slug', label: 'Component', items: components.map(c => ({ value: c.slug, text: c.name })) },
            { type: 'textarea', name: 'props', label: 'Props (JSON)' }
          ]
        },
        onSubmit: (api) => {
          const d = api.getData();
          editor.insertContent(
            `<div class="art-component" data-component="${d.slug}" data-component-version="1.0.0" data-component-props='${escapeHtml(d.props)}'></div>`
          );
          api.close();
        }
      });
    }
  });
});
```

### 5.4 — Component registry (DB table)

```sql
CREATE TABLE component_registry (
  slug VARCHAR(80) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  module_path VARCHAR(255) NOT NULL,
  scope ENUM('global','story','series','pillar') NOT NULL DEFAULT 'story',
  scope_refs JSON,             -- array of slugs
  prop_schema JSON,            -- JSON Schema for prop validation
  preview_image VARCHAR(255),
  created_at DATETIME NOT NULL,
  deprecated_at DATETIME NULL
);
```

Engineers add a row here, drop the renderer at `/components/articles/{slug}.php`, and the editor picker shows it.

### 5.5 — Raw HTML plugin (admin-only)

```js
tinymce.PluginManager.add('ghar_rawhtml', function(editor) {
  // Read role from a global set by PHP: <script>window.__GHAR_USER_ROLE__='admin'</script>
  const role = window.__GHAR_USER_ROLE__;
  if (!['admin', 'senior_editor'].includes(role)) return;   // never registers the button

  editor.ui.registry.addButton('rawhtml', {
    text: 'Raw HTML',
    tooltip: 'Insert sanctioned raw HTML (admin only)',
    onAction: () => editor.windowManager.open({
      title: 'Insert raw HTML',
      body: { type: 'panel', items: [{ type: 'textarea', name: 'html', label: 'HTML (sanitised on save)' }] },
      onSubmit: (api) => {
        editor.insertContent(api.getData().html);
        api.close();
      }
    })
  });
});
```

The PHP sanitizer from Phase 0 already enforces the allowlist on save — admin pastes don't bypass it. They just get a wider toolbar surface for `<details>`, complex tables, etc.

---

## Phase 6 — Story metadata restructure (2–3 days)

The hero (title, deck, byline, sponsor, hero image+credit) and the credits panel should be **structured fields, not WYSIWYG output**. Today's `giarticle.php` already has separate inputs for some — extend to cover the full `storyMetadata` block from [EDITOR-blocks-spec.json](EDITOR-blocks-spec.json).

### 6.1 — DB column additions

```sql
ALTER TABLE intelligence_articles
  ADD COLUMN deck TEXT AFTER title,
  ADD COLUMN hero_image_credit VARCHAR(200) AFTER image_caption,
  ADD COLUMN author_slug VARCHAR(80) AFTER editorname,
  ADD COLUMN read_time_minutes INT AFTER published_at,
  ADD COLUMN sponsor_brand_slug VARCHAR(80) NULL,
  ADD COLUMN sponsor_disclosure_label VARCHAR(40) DEFAULT 'Presented by',
  ADD COLUMN related_logic ENUM('auto-by-tag','auto-by-pillar','manual') DEFAULT 'auto-by-tag',
  ADD COLUMN related_manual_slugs JSON NULL,
  ADD COLUMN cross_vertical_links JSON NULL;
```

(Mirror to `blog_articles` if blogs share the same template.)

### 6.2 — Form changes

Add UI for: deck textarea · hero image credit input · author picker · sponsor picker (toggles disclosure strip rendering) · related logic radio · cross-vertical links repeater.

These render outside the WYSIWYG so editors can't accidentally hand-format the hero.

### 6.3 — Read-time auto-compute

```php
function calculate_read_time(array $sections, string $key_takeaways, string $remarks): int {
    $text = strip_tags(implode(' ', $sections) . ' ' . $key_takeaways . ' ' . $remarks);
    $words = str_word_count($text);
    return max(1, (int) ceil($words / 200));   // ~200 wpm
}
```

Run on save; store in `read_time_minutes`.

---

## Phase 7 — Auto-injection engine (2–3 days)

Server-side rules from [EDITOR-blocks-spec.json#autoInjection](EDITOR-blocks-spec.json). PHP pseudocode:

```php
// secreal/lib/auto_inject.php — runs at RENDER time, never at save
function apply_auto_injection(array $blocks, array $story, array $viewer): array {
    $rules = load_active_rules();
    usort($rules, fn($a, $b) => $b['priority'] <=> $a['priority']);

    $injections = [];
    foreach ($rules as $rule) {
        if (!rule_matches($rule, $story, $viewer)) continue;
        if (editor_already_placed_same_type($blocks, $rule['inject']['slotType'])) continue;
        $position = resolve_position($rule['position'], $blocks);
        if (!$position_is_safe($position, $blocks, $injections)) continue;
        $injections[] = ['at' => $position, 'block' => render_injection($rule, $story, $viewer)];
    }

    return splice_injections($blocks, $injections);
}
```

Pin the seven seed rules from the spec into a small DB table:

```sql
CREATE TABLE autoinjection_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_id VARCHAR(80) UNIQUE,
  description TEXT,
  match_when JSON,
  inject JSON,
  position JSON,
  priority INT DEFAULT 50,
  active TINYINT DEFAULT 1
);
```

Marketing / editorial can later tune priorities without code changes.

---

## Implementation order — concrete checklist

Copy this into your tracker as one ticket per row:

- [ ] **P0.1** — Ship the tightened `valid_elements` + `invalid_elements` config on TinyMCE 3 (today)
- [ ] **P0.2** — Ship the PHP `sanitize_editor_html` post-processor on save (today)
- [ ] **P1.1** — Download TinyMCE 7 community, drop into `/secreal/jseditor/tinymce/`
- [ ] **P1.2** — Add `class="gh-editor"` to all content textareas in `giarticle.php`
- [ ] **P1.3** — Write `/secreal/jseditor/ghar-editor.js` with the unified init config
- [ ] **P1.4** — Port each `tw*` plugin → `ghar_*` plugin (5 plugins, ~half a day total)
- [ ] **P1.5** — Smoke-test: open giarticle.php → all 8 editors render → save round-trip works
- [ ] **P2.1** — Lock toolbar (remove underline, justify, forecolor); lock Format dropdown to p/h2/h3
- [ ] **P3.1–9** — Build Tier A plugins one by one, ship each independently
- [ ] **P3.x** — Server-side footnote renumbering (PHP post-process)
- [ ] **P4.1** — Build `/secreal/api/brands.php`, `people.php`, `projects.php`, `stories.php`
- [ ] **P4.2** — Build the unified `ghar_callout` plugin with 4 variants
- [ ] **P5.1** — `ghar_slot` plugin + 15 slot types in the dropdown
- [ ] **P5.2** — PHP slot renderer `render_placement_slots()`
- [ ] **P5.3** — Per-type slot renderers (brand_profile, ad_display, newsletter_signup, …)
- [ ] **P5.4** — `component_registry` table + `ghar_component` plugin + first registry entry
- [ ] **P5.5** — `ghar_rawhtml` plugin (admin-only) + role gate
- [ ] **P6.1** — DB ALTERs for story metadata
- [ ] **P6.2** — `giarticle.php` form changes for deck, sponsor, author picker, related logic, cross-vertical
- [ ] **P6.3** — `calculate_read_time()` on save
- [ ] **P7.1** — `autoinjection_rules` table + seed rows
- [ ] **P7.2** — `apply_auto_injection()` at render time
- [ ] **P7.3** — Wire the 7 seed rules; tune priorities

**Total effort (one experienced PHP/JS dev):** ~3–4 focused weeks.

---

## What the developer should treat as authoritative

| Question | Source of truth |
|---|---|
| What block types exist? | [EDITOR-blocks-spec.json](EDITOR-blocks-spec.json) |
| What HTML each block outputs? | `htmlTemplate` field in each `blocks.*` entry |
| What CSS classes the renderer must produce? | `cssClasses` field in each entry |
| What's visible (no developer guess)? | [design-article.html](../design-article.html) — every block has a real sample rendered |
| What's in the editor toolbar? | `toolbar.enabled` + `toolbar.disabled` in EDITOR-blocks-spec.json |
| What's locked in the dropdowns? | `toolbar.restrictions` in EDITOR-blocks-spec.json |
| Sanitizer allowlist? | `rawHtmlAllowlist` in EDITOR-blocks-spec.json + Phase 0 PHP code in this doc |
| Auto-injection rules? | `autoInjection.rules` in EDITOR-blocks-spec.json |

If the spec and this plan disagree, the spec wins — this doc shows the *how*, the spec is the *what*.

---

## Three things to confirm before writing code

1. **License** — TinyMCE 7 community is GPL-2.0 (free). If you're allergic to GPL in a closed-source project, the commercial TinyMCE Cloud is ~$40/mo per editor seat. Confirm before downloading.
2. **Image upload** — your `jbimages` endpoint at `/secreal/jseditor/upload.php` will keep working with TinyMCE 7's `images_upload_url`. Verify file size / mime checks are still in place.
3. **Backups** — take a full DB snapshot before any of the Phase 6 `ALTER TABLE`s. They're additive (no data loss risk) but the rollback procedure is "drop the new columns" if anything saves wrong.

That's everything. Hand this doc + [EDITOR-blocks-spec.json](EDITOR-blocks-spec.json) + [design-article.html](../design-article.html) to the developer and they have the full picture.
