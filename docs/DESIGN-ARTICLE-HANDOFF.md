# Ghar.tv `/design/{slug}` Story Page — Full Handoff (PHP / MySQL / JS)

> Single guide for shipping `design-article.html` into the existing PHP / MySQL
> stack. The template is the **rendered output for one design story**; the dev
> job is to drive that template from the database via the editor pipeline.
>
> Companion docs:
> - [`EDITOR-implementation-kit/`](EDITOR-implementation-kit/) — DB schema, PHP
>   render pipeline, JS editor, server-side sanitizer.
> - [`STORY-schema.md`](STORY-schema.md) — story document schema (fields, types).
> - [`EDITOR-blocks-spec.json`](EDITOR-blocks-spec.json) — machine-readable block
>   contract used by the editor.
> - [`SEARCH-HANDOFF.md`](SEARCH-HANDOFF.md) — universal search modal wiring
>   (the modal at the top of every page). Backend contract + the mobile modal
>   + Recent Searches all live in this one file now. `SEARCH-MODAL-HANDOFF.md`
>   is a stub that redirects here.
>
> This handoff is the **page-level mapping**: which DOM block answers to which
> story field, where the slots are, and what each downstream section needs.

---

## 0. TL;DR for the busy dev

1. Treat `design-article.html` as the **single canonical rendering** of one
   story. Every editorial block, slot, callout, and downstream section you see
   has a stable class. Server renders blocks → emits the same DOM.
2. The page is built from **8 zones**: (a) shared chrome (nav/subnav/menu/sign-
   in/search-modal), (b) hero header, (c) optional disclosure strip,
   (d) reading body, (e) credits + series-foot, (f) downstream sections
   (more-from-series, across-ghar.tv, related-stories), (g) newsletter,
   (h) hidden block reference library (preview-only).
3. **Shared chrome is now extracted into `partials/`.** [`partials/footer.html`](../partials/footer.html)
   and [`partials/oc-menu.html`](../partials/oc-menu.html) are the single source
   of truth; `npm run build:partials` (run by `npm run build`) materializes them
   into every page between `<!-- PARTIAL <name>:start --> ... <!-- PARTIAL <name>:end -->`
   markers. At PHP integration, swap each marker pair for `<?php include 'partials/<name>.html'; ?>`
   (or Apache SSI). See [`partials/README.md`](../partials/README.md).
4. **Block-level dynamic content** lives in two systems:
   - `class="art-*"` — typed editorial blocks (hero, lead, image, pullquote,
     video, callout, table, etc.). Each maps to one block type in
     `EDITOR-blocks-spec.json`.
   - `class="art-slot" data-slot-type="…"` — server-side placements
     (sponsor brand profile, display ad, newsletter slot, etc.). The audience
     filter (`data-slot-audience`) controls who sees them.
5. **Block Reference Library** at the bottom (`#block-ref-lib`, currently
   `hidden`) is the editor's pick-list of blocks not present in this story.
   Renderer must keep it hidden in production; expose only behind a query
   string or role check (the template defaults to `?ref=1`).
6. **Recently shipped (this push):** the universal mobile search modal now
   reuses `ghar-carousel`'s `initCarousel` for its chip rails, and goes to a
   centered card at ≥744px. Drop-in across `index.html`, `design.html`, and
   `design-article.html` — no integration work required on your end.

---

## 1. File inventory

| File | Role | Dev action |
|---|---|---|
| `design-article.html` | The article template. Stamp blocks into this. | Render from CMS into the canonical DOM shown here. |
| `design.html` | The `/design` index. Same shared chrome. | Extract chrome into an SSI partial used by both. |
| `index.html` | Homepage. Same shared chrome. | Same partial. |
| `styles.css` → `dist/styles.min.css` | All CSS. `art-*` block styles live here. | Don't fork the file per page. Build with `npm run build:styles`. |
| `main.js` → `dist/main.min.js` | Universal search modal logic. | Wire backend per `SEARCH-HANDOFF.md`. Build with `npm run build:js`. |
| `ghar-carousel.js` | Shared carousel chassis. | Loaded by every page. Used by chip rails, image carousels. |
| `dist/photoswipe/photoswipe*.esm.min.js` | PhotoSwipe lightbox. | Loaded as ES module from `design-article.html`. |
| `docs/EDITOR-implementation-kit/` | DB schema, PHP renderer, JS editor, sanitizer. | Drive `design-article.html` from this. |

`gazpacho.css`, `fonts/inter-var*.woff2`, and the `<link>`/`@font-face` blocks
in `<head>` are part of the shared chrome — keep byte-identical across pages.

---

## 2. Page architecture (top → bottom)

```
┌─ Shared chrome ─ (byte-identical across pages) ──────────────────────┐
│ <nav id="mainNav">         universal top nav                          │
│ <nav class="subnav">       /design sub-nav pills                      │
│ <div class="art-progress"> reading-progress bar                       │
│ <div id="bottomBar">       mobile bottom bar                          │
│ <aside id="ocMenu">        off-canvas menu                            │
│ <div id="signInModal">     sign-in modal                              │
│ <div id="mobileModal">     universal search modal (drives chip rails) │
└──────────────────────────────────────────────────────────────────────┘
┌─ <main class="art-page" id="main"> ──────────────────────────────────┐
│  <article>                                                            │
│   ① <header class="art-hero">       eyebrow + title + deck + byline   │
│      + <figure class="art-hero-figure"> hero image                    │
│   ② <div class="art-disclosure-wrap"> SPONSOR DISCLOSURE (optional)   │
│   ③ <div class="art-body-wrap">                                       │
│      ├─ <div class="art-body"> ─ centered reading column              │
│      │   ├─ series-strip                                              │
│      │   ├─ tldr / takeaways                                          │
│      │   ├─ toc (auto-built)                                          │
│      │   ├─ lead (drop-cap)                                           │
│      │   ├─ specs                                                     │
│      │   ├─ art-slot · brand_profile  (sponsor card)                  │
│      │   ├─ headings / paragraphs / footnote refs                     │
│      │   ├─ inline-image / pullquote / video / callouts               │
│      │   ├─ blockquote / blockquote--byline                           │
│      │   ├─ art-slot · ad_display                                     │
│      │   ├─ image carousel (PhotoSwipe)                               │
│      │   ├─ art-component  (bespoke embed)                            │
│      │   ├─ stat-strip / table                                        │
│      │   ├─ ol / editor's-note / related-story callout                │
│      │   ├─ footnotes                                                 │
│      │   ├─ art-tags                                                  │
│      │   ├─ art-credits                                               │
│      │   └─ art-series-foot                                           │
│      └─ /art-body                                                     │
│   ④ <section> More from series                                        │
│   ⑤ <section> Across Ghar.tv (when the story is about a person/brand) │
│   ⑥ <section> Related stories                                         │
│   ⑦ <section class="art-newsletter">                                  │
│   ⑧ <section class="block-ref-lib" hidden>  preview-only catalog      │
│  </article>                                                           │
│  <button class="float-share">    desktop sticky share                 │
└──────────────────────────────────────────────────────────────────────┘
<footer> (shared chrome)
```

Body width is locked by `.art-body` (≈ 720px reading column). Hero figure +
inline-image variants (`--wide`, `--full-bleed`) and the image carousel break
out of that column intentionally — keep those modifier classes intact.

---

## 3. Hero header → schema mapping

```html
<header class="art-hero">
  <div class="art-hero__head">
    <span class="art-eyebrow">{{ pillar }} · {{ subTag }}</span>
    <h1 class="art-title">{{ title }}</h1>
    <p class="art-deck">{{ deck }}</p>
    <div class="art-byline">
      <a href="/people/{{ author.slug }}" class="art-byline__author">
        <img class="art-byline__avatar" src="{{ author.avatar }}" alt="{{ author.name }}" loading="lazy">
        <span class="art-byline__name">{{ author.name }}</span>
      </a>
      <span class="art-byline__sep">·</span>
      <span class="art-byline__date-wrap">
        {% if updatedAt %}<span class="art-byline__updated-tag">Updated</span>{% endif %}
        <time class="art-byline__date" datetime="{{ updatedAt or publishedAt }}">{{ (updatedAt or publishedAt) | dateLong }}</time>
        {% if updatedAt %}<a href="#correction" class="art-byline__updated-link">see editor's note</a>{% endif %}
      </span>
      <span class="art-byline__sep">·</span>
      <span class="art-byline__time">{{ readTimeMin }} min read</span>
    </div>
  </div>
  <figure class="art-hero-figure">
    <img src="{{ heroImage.src }}" alt="{{ heroImage.alt }}" fetchpriority="high">
    <figcaption>
      <span>{{ heroImage.caption }}</span>
      <span class="art-hero-figure__credit">Photography — {{ heroImage.credit }}</span>
    </figcaption>
  </figure>
</header>
```

**Rules:**
- `art-eyebrow` must use one of the 7 locked `/design` pillars (Series ·
  Architecture · Interiors · Spaces · Designers · Vastu · Guides) plus an
  optional sub-tag. NEVER use a city as eyebrow on `/design` stories.
- `art-byline__updated-tag` + `art-byline__updated-link` render only if a
  `corrections` block exists in the story document. The link's hash matches
  the `id` of the editor's-note block (default `#correction`).

---

## 4. Disclosure strip (sponsor only)

Sits between hero and body. **Omit entirely** for non-paid stories.

```html
<div class="art-disclosure-wrap">
  <div class="art-disclosure" role="note" aria-label="Sponsored content">
    <span class="art-disclosure__mark">{{ sponsor.initial }}</span>
    <span class="art-disclosure__line">
      In partnership with
      <span class="art-disclosure__brand">{{ sponsor.name }}</span>
    </span>
    <span class="art-disclosure__divider"></span>
    <span class="art-disclosure__tag">{{ partnershipType }}</span>
  </div>
</div>
```

`partnershipType` is one of: `Paid Partnership`, `Presented By`,
`In Collaboration With`. The strip is the **only place** that label appears in
the article body — don't repeat it inside the editorial copy.

---

## 5. Editorial block catalog (everything inside `.art-body`)

Every block has a class root. The table below is the contract: server must
emit this DOM for that block type, no class drift. All blocks are documented
inline in `design-article.html` with `<!-- BLOCK · NAME -->` markers.

| Block | Class root | Notes |
|---|---|---|
| Series strip (top) | `art-series-strip` | Part N of M + series name. Render when `story.series` is set. |
| TL;DR | `art-tldr` | Pre-article skimmer summary. |
| Key takeaways | `art-takeaways` | Bullet alternative to TL;DR. |
| Auto TOC | `details.art-toc` | JS auto-fills from H2s; hides if `<3`. Server emits empty shell. |
| Lead | `p.art-lead` (+ `.has-dropcap`) | First paragraph; drop-cap optional. |
| Spec list | `dl.art-specs` | Architect / Location / Year / Materials. |
| H2 / H3 | plain `<h2>` / `<h3>` | TOC builder reads H2 text + slugifies into `id`. |
| Paragraph | plain `<p>` | Can contain `<mark>`, `<sup>` (footnote refs), `<a>`. |
| UL / OL | plain `<ul>` / `<ol>` | Styled by `.art-body ul/ol`. |
| Inline image | `figure.art-inline-image` (+ `--wide`, `--portrait`, `--full-bleed`) | Wrap inner `<img>` in `<a class="pswp-link" data-pswp-caption="…">` for lightbox. |
| Image carousel | `figure.art-carousel` + `__track` + `__item` | Horizontal scroll-snap rail. All items share one `data-pswp-gallery`. |
| Video embed | `figure.art-video` + `__frame[data-video-id]` | YouTube façade. JS in the file swaps the still for the iframe on click. |
| Pull-quote | `blockquote.art-pullquote` (+ `--byline`) | Typographic quote. `--byline` adds avatar + role under quote. |
| Blockquote | `blockquote.art-blockquote` | Standard quotation (vs. typographic pull-quote). |
| Inline mark | `<mark>` | Highlighted phrase. |
| Footnote ref | `<sup id="fn-ref-N"><a href="#fn-N">N</a></sup>` | Paired with `<li id="fn-N">` in `.art-footnotes`. |
| Footnotes block | `section.art-footnotes` + `<ol>` | At end of body. |
| Brand callout | `a.art-brand-callout` | Same chassis used for: brand, person, project, read-next. Vary the `__label`. |
| Person callout | `a.art-brand-callout` | (same chassis; `__label = "About the architect"` etc.) |
| Project callout | `a.art-brand-callout` | (same chassis; `__label = "The project"`) |
| Read-next callout | `a.art-brand-callout` | (same chassis; `__label = "Read next"`) |
| Single big stat | `figure.art-stat` | One defining number + caption. |
| Stat strip | `div.art-stat-strip` + `__item` × 2-4 | Side-by-side smaller numbers. |
| Table | `div.art-table-wrap` > `table.art-table` (+ `--zebra`, `--cards`) | Editorial table. Modifiers stack. |
| Side-by-side compare | `div.art-compare` + `__col` (+ `--ink`) | Two columns + central "vs" divider. |
| Q&A | `div.art-qa` + `__pair` > `__q` + `__a` | Interview format (Industry Voices default). |
| Map | `figure.art-map` + `__frame` + `__pin` | Static map snapshot + pin + caption. |
| Audio episode | `a.art-audio` | GharTalks episode card. |
| Editor's note | `aside.art-note` (+ `--disclosure`, `--warning`, `--correction`) | Variants change the left-rule color. |
| Methodology | `aside.art-methodology` + `__list` (`<dl>`) | Trust panel for data stories. |
| Newsletter (mid-article) | `art-slot` with `data-slot-type="newsletter_signup"` (see §6) | |
| Divider | `p.art-divider` | Three centered dots. |
| Tags row | `div.art-tags-wrap` > `.art-tags` > `a.art-tag` | At foot of body. |
| Credits | `section.art-credits` > `__grid` > `__col` × N | "Written by / Edited by / In this story". |
| Series-foot nav | `aside.art-series-foot` | Prev / Next chapter with full meta. |

---

## 6. Placement slots (`art-slot`)

`art-slot` is the server-driven placement wrapper. Render → fill → optionally
hide per audience. Four attributes carry the contract:

```html
<div class="art-slot"
     data-slot-type="brand_profile | ad_display | newsletter_signup | … "
     data-slot-id="post-lead | in-article-1 | ref-newsletter | …"
     data-slot-size="boxed | standard | wide"
     data-slot-audience="all | logged_out | logged_in | non_subscriber">
   …slot contents…
</div>
```

**Audience filter:** server checks `data-slot-audience` against the current
viewer and skips emitting the block if it doesn't match. **Never** render the
slot empty — leave the DOM hole. (Empty `.art-component` shows a placeholder
treatment, by design, for editor preview only.)

Defined slot types:
- `brand_profile` — full sponsor card (logo + name + about + facts + CTA).
- `ad_display` — standard display ad (1:1 / 16:9 — server fits creative).
- `newsletter_signup` — embedded signup form, hides for already-subscribed.
- `brand_micro` — small inline brand strip (reserve for inventory).
- `event_promo` — GharEvents inline promo card (reserve for inventory).

Each slot is **logged on impression** server-side via the ID. Use the ID to
attribute revenue. Slot IDs must be unique per page (`post-lead`,
`in-article-1`, `in-article-2`, etc.). The template establishes the ID
convention — don't auto-generate, hand-author for stable analytics.

---

## 7. Custom components (`art-component`)

For bespoke embeds (per-story interactive: floorplan, chart, mini-map). The
class is the chassis; the component identity is in the data attributes.

```html
<div class="art-component"
     data-component="alibaug-house-floorplan"
     data-component-version="1.0.0"
     data-component-props='{"orientation":"south","showAnnotations":true}'>
  <!-- Server can render a static fallback inside here. -->
</div>
```

- Empty `.art-component` shows a dashed-border placeholder ("Component embed").
- Client-side: a component registry mounts the right module given
  `data-component` and hydrates with `data-component-props` (JSON-encoded).
- Versioning lives in the component manifest, not in the markup. Bump
  `data-component-version` when the prop schema changes.

The Alibaug floorplan in the template is a fully inline SVG — use this as a
proof of concept for the lowest-friction component (pure SVG, no JS needed).

---

## 8. Downstream sections (below `.art-body-wrap`)

These are part of **every** story, populated server-side from the story's
relationships. No editor control — they're algorithmic.

| Section | DOM root | Source |
|---|---|---|
| More from `{series}` | `section.art-section[aria-label*="series"]` + `.art-card-grid` | If `story.series`, fetch other stories in series, exclude self, limit 3. Hide section if `<2` results. |
| Across Ghar.tv (people/brand cross-links) | `section.art-section[aria-label*="across"]` + `.art-across-list` | If story has a primary person or brand subject, surface their other appearances: GharTalks episodes, VideoWorks films, Voices essays. Limit 3. |
| Related stories | `section.art-section[aria-label*="related"]` + `.art-card-grid` | Tag overlap or pillar match. Exclude self. Limit 3. |
| Newsletter | `section.art-newsletter` | Universal; always render. Server may swap the eyebrow/title per pillar. |
| Block reference library | `section.block-ref-lib#block-ref-lib` `hidden` | Render in DOM but keep `hidden`. Reveal only on `?ref=1` (or staff role). |

Card class: `a.art-card` with `__media`, `__eyebrow`, `__title`, `__meta`.
Across-card class: `a.art-across-card` with `__kind`, `__title`, `__meta`.

---

## 9. Auto-built features (already wired — don't touch unless changing)

| Feature | Selector | Behaviour |
|---|---|---|
| Reading progress bar | `#artProgressFill` | Bound to `.art-body` extent only (not page). Hides after the body ends. |
| Auto TOC | `#artToc` + `#artTocList` | Builds `<li><a href="#…">` per H2; slugifies title into `id` if missing; hides TOC if `<3` H2s. |
| Sticky desktop share | `#floatShare` | Hides once viewer reaches `.art-credits` / `.art-tags-wrap`. |
| PhotoSwipe lightbox | `[data-pswp-gallery]` | Each `figure[data-pswp-gallery]` is a gallery group. Inline images = single-item groups; the carousel groups all its items. Captions come from `data-pswp-caption` on the `a.pswp-link`. |
| Video façade swap | `.art-video__frame[data-video-id]` | Click swaps the poster for a YouTube `<iframe>`. Saves 500KB+ until played. |
| Modal search | `#mobileModal` + helper script | Universal across pages. See §11. |

Renderer must wrap inline-image `<img>` in `<a class="pswp-link"
data-pswp-caption="…">` (caption text duplicates the figcaption text) so the
lightbox finds it. Without the anchor wrapper, the image is just static.

---

## 10. Pillars · tags · URLs

- Pillar IDs (locked, 7): `series`, `architecture`, `interiors`, `spaces`,
  `designers`, `vastu`, `guides`.
- Story URL: flat — `/design/{slug}`. No `/design/architecture/{slug}` or
  `/tag/` namespacing.
- Series URL: `/design/series/{series-slug}`.
- Pillar landing: `/design/{pillarId}` (e.g. `/design/architecture`).
- Tag URLs in the foot: `/design/{tag-namespace}/{slug}` (e.g.
  `/design/material/stone-cladding`, `/design/city/alibaug`,
  `/design/audience/luxury`, `/design/style/indo-modern`). Tag namespaces are
  fixed: `material`, `city`, `style`, `audience`, `room`.
- Person URL: `/people/{slug}` · Brand URL: `/brands/{slug}` ·
  GharTalks: `/ghartalks/{slug}` · VideoWorks: `/videoworks/{slug}` ·
  Voices: `/voices/{slug}`.

Eyebrow on `/design` cards: always one of the 7 pillars (+ optional sub-tag).
Cities are metadata only — never use a city as the eyebrow.

---

## 11. Universal search modal (this push)

Shipped across `index.html`, `design.html`, `design-article.html`. No
integration work needed beyond what `SEARCH-HANDOFF.md` already covers, but
two structural changes are good to know:

1. **Chip carousels** (Popular cities + Browse-by-category) now reuse the
   shared `ghar-carousel.js` `initCarousel`. The helper at the bottom of each
   page wires it via a two-layer wrap:
   - inner `.rail-outer` is the `overflow:hidden` clip box that holds the
     rail (chips stop cleanly at the edge);
   - outer wrap is unclipped — chevron arrows attach there so they bleed
     past the rail edge without getting cut.
   The chassis defaults `arrowExcludeSelector: 'button'` would refuse drag on
   the chip buttons; the helper narrows it to `.dc-arrow` so chip tap fires
   `mobSelectCity` and drag still works.
2. **Desktop card behaviour:** at viewports ≥744px the modal becomes a
   centered 720px card with dim backdrop. CSS lives in `styles.css` next to
   the `#mobileModal` warm-paper retheme block. Inner pages do the same under
   `body.simple-nav`; index uses the unscoped variant added this push.

If you change page chrome and need to extract these helpers into a partial:
the script lives at the bottom of `<body>` and is self-contained (one IIFE +
the `wireChassis` function). It is byte-identical across pages.

---

## 12. Field-to-DOM cheat-sheet

A condensed mapping for the renderer. Field paths follow `STORY-schema.md`.

| Story field | Goes to | Block / class |
|---|---|---|
| `story.pillar` | hero eyebrow first half | `.art-eyebrow` |
| `story.subTag` | hero eyebrow second half | `.art-eyebrow` |
| `story.title` | hero title | `.art-title` |
| `story.deck` | hero deck | `.art-deck` |
| `story.author.{slug, name, avatar}` | byline author | `.art-byline__author` |
| `story.publishedAt` | byline date | `.art-byline__date[datetime]` |
| `story.updatedAt` | adds "Updated" tag + correction link | `.art-byline__updated-tag` + `__updated-link` |
| `story.readTimeMin` | byline read-time | `.art-byline__time` |
| `story.heroImage.{src,alt,caption,credit}` | hero figure | `.art-hero-figure` |
| `story.sponsor.{name,initial}` + `story.partnershipType` | disclosure strip | `.art-disclosure-wrap` |
| `story.series.{name,slug,part,total}` | series strip (top) + series-foot nav | `.art-series-strip` + `.art-series-foot` |
| `story.tldr` | TL;DR block | `.art-tldr` |
| `story.takeaways[]` | takeaways block (alternative to TL;DR) | `.art-takeaways__list` |
| `story.specs[{label,value,link?}]` | spec list | `dl.art-specs` |
| `story.blocks[]` | body blocks (see §5) | various `art-*` |
| `story.slots[]` | placements | `.art-slot[data-slot-*]` |
| `story.components[]` | custom embeds | `.art-component[data-component-*]` |
| `story.footnotes[]` | footnotes section | `section.art-footnotes` |
| `story.tags[{label,namespace,slug}]` | tags row | `a.art-tag` |
| `story.credits[{label,name,nameSlug,role}]` | credits grid | `.art-credits__col` |
| `story.corrections[{label,body}]` | editor's-note block in body | `.art-note#correction` |
| `series.episodes[]` (computed) | more-from-series | `.art-card-grid` (first downstream section) |
| `subject.appearances[]` (computed) | Across Ghar.tv | `.art-across-list` |
| `tags ∩ pillar` (computed) | related stories | `.art-card-grid` (last downstream section) |

---

## 13. Behavioural / styling rules the renderer must respect

- **Don't change `art-*` class names** — CSS, JS (TOC builder, progress bar,
  PhotoSwipe gallery, share-floater hide logic) all key off them.
- **Don't introduce per-page CSS for blocks.** Add to `styles.css` or, if
  truly one-off, declare in the inline `<style>` already at the top of
  `design-article.html` (alongside the existing `art-*` block CSS). New
  per-story custom components should ship their own CSS with the component
  module, not pollute `styles.css`.
- **Tags row + credits + series-foot always render in that order** even if
  one is empty — they form the recognised end-of-story pattern.
- **Block Reference Library stays hidden in production.** Leaving it visible
  on a real story = brand damage. The renderer should default to omitting
  the section entirely unless `?ref=1` is present (or a staff role check
  passes).
- **Use `<a class="pswp-link" data-pswp-caption="…">` around lightbox-able
  images.** Without it, PhotoSwipe finds nothing.
- **No accent red on decorative elements.** Quote rules, list bullets, eyebrow
  labels — all use `var(--rule)` or `var(--muted)`. Red (`var(--accent)`,
  `#ee324b`) is reserved for CTAs, the logo, and action links.

### Site-wide CSS policies the renderer should not fight

These rules live in `styles.css` and apply to every page, not just article
templates. The renderer never has to opt in — they fire automatically — but
the dev should know what they do so they don't accidentally re-introduce
patterns these rules suppress.

- **Focus rings are keyboard-only.** A site-wide rule
  `*:focus:not(:focus-visible) { outline: none }` strips the default
  browser outline on mouse click and touch tap. Keyboard users still land
  on `:focus-visible` and any `:focus-visible` rule paints a ring as
  normal. **When you add a new interactive element** (icon button, modal
  control, social link), pair it with a `:focus-visible` rule — otherwise
  keyboard users get no focus indicator on it. Form inputs are unaffected
  (input focus rules use `border-color`, not `outline`).
- **Touch-device hover suppression.** Inside `@media (hover: none)`, a
  blanket `*:hover` rule sets `transform: none` and
  `transition-property: none` to stop sticky touch-hover from triggering
  GPU-expensive transitions on carousel slides during a swipe. Excluded:
  `#ocMenu`, `#ocOverlay`, `#joinModal` (their own slide-in transforms
  must run on tap). **Don't add `box-shadow: inherit` here** — it used
  to be in this rule and silently wiped cards' rest-state shadows during
  sticky hover. Removed deliberately; the transition kill is the actual
  perf fix.
- **Mobile modal pattern.** At `≤743.98px`, **task modals** (Sign In,
  universal Search) go full-screen via `height: 100dvh` (dynamic
  viewport — accounts for the mobile URL bar). **Browse / picker modals**
  (Collections) stay as bottom sheets at `max-height: 88vh` anchored to
  `bottom: 0` with rounded top corners. New modals should pick a side
  and follow the convention: task = full-screen, browse = sheet.
- **Mobile search pill is uniform.** The `#mobSearchTrigger` and
  `#mobSearchRow` paddings are set once in `styles.css` for mobile and
  apply to every page (homepage and inner pages). Don't re-gate behind
  `body.simple-nav` — the canonical rules already drop the qualifier.

---

## 14. Build / deploy

```bash
npm run build:js     # main.js → dist/main.min.js
npm run build:styles # styles.css → dist/styles.min.css
```

Both are cheap (sub-second esbuild). Bump the `?v=` query string on the
`<link>` / `<script>` tags after every build so browser cache invalidates.

Server (PHP) flow:
1. URL `/design/{slug}` → look up story document.
2. Pass story to the renderer in `EDITOR-implementation-kit/render-pipeline.php`.
3. Pipeline emits `design-article.html`-shaped DOM into the canonical
   template. Block-by-block contract is `EDITOR-blocks-spec.json`.
4. Sanitize user-authored HTML via
   `EDITOR-implementation-kit/sanitize-editor-html.php` — same allow-list as
   the editor. Story documents in MySQL store sanitized HTML for the
   prose-style blocks; structural blocks store as JSON.
5. Run the audience filter on `art-slot` blocks before render.
6. Emit + ship.

---

## 15. Files in the latest push (commit `4b64494`)

| File | Why |
|---|---|
| `index.html` | Modal search: helper rewrites for chip-rail two-layer wrap, arrow positioning. |
| `design.html` | Same modal helper changes (chrome parity). |
| `design-article.html` | Same modal helper changes (chrome parity). |
| `main.js` | Suggestion-list spacing (row padding 6×10, line-height 1.2, eyebrow margins 14px top). Eyebrow row icons compacted. |
| `styles.css` | `#mobileModal` desktop card behaviour at ≥744px + `.ssp-modal-card` base flex rule. |
| `dist/main.min.js` | Rebuild. |
| `dist/styles.min.css` | Rebuild. |

Untracked (`ad-main.json`, `ad-structure.json`, `docs/BRIEF-developers-page.md`)
were NOT pushed — they're a separate workstream.

---

## 16. Open items / known gaps

- **Editor parity for `art-component`**: the editor JS in
  `EDITOR-implementation-kit/ghar-editor.js` needs a "component embed" block
  that writes `data-component`, `-version`, and `-props`. Today the editor
  treats it as a raw HTML pass-through. Tighten when the component registry
  ships.
- **`art-slot` audience runtime**: server-side filter exists in the kit; the
  client-side fallback (for slots that should disappear after a login event
  mid-session) isn't wired. Acceptable for v1 — close on full reload.
- **`floatShare` share intent**: button exists, click handler doesn't open
  the share sheet yet. Wire to Web Share API on mobile, copy-link fallback
  on desktop.
- **`art-progress` accuracy**: bound to `.art-body` extent. If a story is
  unusually short (<1 viewport of body), the bar reaches 100% before the
  user has scrolled. Cap the body extent to `max(bodyHeight, viewport)` in a
  future patch.
