# Story schema — the data shape for every /design article

> Editorial content on `/design` lives as ONE record type: **Story**. Stories sit at flat URLs `/design/{slug}` (no `/story/` segment — `/design` is already the namespace). Every Article Details page renders by reading these fields. Schema is CMS-controlled. Body uses structured blocks, not free HTML.
>
> **Locked:** 2026-06-10  
> **Reference template:** `design-article.html` (worked example: "Inside Bijoy Jain's Alibaug retreat")  
> **Sibling docs:** `docs/DESIGN-taxonomy.html`, `docs/BRANDS-curated.md`

---

## 1. Top-level Story fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes | URL — `/design/{slug}`. Must not collide with reserved pillar / series / material / style / city / audience / brands / people / collections slugs. CMS enforces. |
| `title` | string | yes | Hero title. Gazpacho display. |
| `subtitle` | string | optional | The "deck" — sits below title, sets up the story. Inter italic. |
| `summary` | string | yes (≤ 240 chars) | For card listings, OG, search snippets. Not shown on the article itself. |
| `hero_image` | `Image` object | yes | See `Image` shape below. |
| `author` | ref → `/people/{slug}` | yes | Byline links to author's Person record. |
| `published_at` | ISO date | yes | Displayed in byline. |
| `updated_at` | ISO date | optional | Shown only when `updated_at > published_at + 24h`. |
| `reading_time_min` | integer | derived | Auto from body word count (~225 wpm). |
| `pillar` | enum | yes | One of: `series` · `architecture` · `interiors` · `spaces` · `designers` · `vastu` · `guides`. Drives subnav active-state when present and the breadcrumb. |
| `series` | string (Series tag slug) | required if `pillar = series` | e.g. `studio-visit`, `material-stories`, `behind-the-build`, `home-tours`, `india-design-100`, `homes-worth-talking-about`, `celebrity-homes`. |
| `tags` | `Tags` object | yes | The 6 tag dimensions — see below. |
| `featured_brands` | array of refs → `/brands/{slug}` | optional | Inline + sidebar mentions. Order = importance. Max 6 (UI cap). |
| `featured_people` | array of refs → `/people/{slug}` | optional | Inline + sidebar mentions. Author is auto-excluded from this list. |
| `body` | array of `Block` | yes | Structured block stream — see "Body blocks" below. |
| `collaboration` | enum | yes | `editorial` (default) · `in-collaboration-with` · `presented-by` · `sponsored`. Drives eyebrow + byline treatment. |
| `sponsor` | ref → `/brands/{slug}` | required if `collaboration ≠ editorial` | Drives sponsored disclosure strip + "By [Brand]" byline override. |
| `cross_vertical_refs` | `CrossRefs` object | optional | See "Cross-vertical refs" below. |
| `seo_title` | string | optional | Falls back to `title` if absent. |
| `seo_description` | string | optional | Falls back to `summary` if absent. |
| `og_image` | `Image` object | optional | Falls back to `hero_image` if absent. |
| `previous_slugs` | array of strings | optional | For redirects when slug changes (history). |

---

## 2. `Tags` object — the 6 dimensions

CMS-controlled vocabulary. Free-text forbidden. See `docs/DESIGN-taxonomy.html` § 3 for the seed list.

```json
{
  "discipline": ["architecture"],
  "format": [],
  "material": ["stone", "mud", "wood"],
  "style": ["indo-modern"],
  "region": ["alibaug", "maharashtra"],
  "audience": ["residential", "luxury"]
}
```

Every array can be empty except `discipline` (at least one — drives `pillar` defaulting when ambiguous).

---

## 3. `Image` object

```json
{
  "src": "https://cdn.ghar.tv/stories/bijoy-jain/hero.jpg",
  "src_set": [
    { "w": 800,  "url": "..." },
    { "w": 1600, "url": "..." },
    { "w": 2400, "url": "..." }
  ],
  "alt": "Stone walls of a coastal retreat at dusk",
  "photo_credit": "Hélène Binet",
  "caption": "Optional caption — shown below image."
}
```

`alt` and `photo_credit` are mandatory. `caption` is optional.

---

## 4. Body blocks

Each block is `{ "type": "...", "data": {...} }`. The renderer iterates and outputs the appropriate HTML.

| Block type | Data shape | Renders as |
|---|---|---|
| `paragraph` | `{ "text": "..." }` | `<p class="art-content__p">` |
| `lead` | `{ "text": "..." }` | First paragraph, slightly larger type (`.art-lead`). Max one per story. |
| `h2` | `{ "text": "..." }` | `<h2 class="art-content__h2">` — Gazpacho section break. |
| `pull_quote` | `{ "text": "...", "attribution": "..." }` | `<blockquote class="art-pullquote">` |
| `image` | `Image` object | `<figure class="art-inline-image">` |
| `gallery` | `{ "images": [Image, ...] }` | `<figure class="art-gallery">` — 2-col on desktop, single on mobile |
| `brand_callout` | `{ "brand_slug": "...", "context": "..." }` | Inline mini-card linking to `/brands/{slug}`. Use to introduce a featured brand mid-flow. |
| `person_card` | `{ "person_slug": "...", "context": "..." }` | Inline mini-card linking to `/people/{slug}`. Use when a person enters the narrative. |
| `video_embed` | `{ "youtube_id": "...", "caption": "..." }` | Lazy YouTube facade (no autoplay) |
| `divider` | (none) | Editorial divider — three centred dots. Use sparingly. |

The renderer must reject unknown block types. New block types require schema change + template update.

---

## 5. `CrossRefs` — Across Ghar.tv

Each Story can link to up to 3 other vertical artifacts. The "Across Ghar.tv" section renders these as cards.

```json
{
  "ghartalks_episode": { "url": "...", "title": "...", "duration": "47 min" },
  "videoworks_film":   { "url": "...", "title": "...", "duration": "8 min"  },
  "voices_essay":      { "url": "...", "title": "...", "author": "..."     }
}
```

All keys optional. Section is hidden if all three are absent.

---

## 6. Auto-derived sections

These render below the body without explicit Story data:

- **More from this Series** — query: stories with `series === this.series`, ordered by `published_at DESC`, limit 3, excluding the current story. Hidden if `pillar !== series`.
- **Related stories** — query: stories with matching tags (priority: same `pillar`, then overlapping `tags.material`, then overlapping `tags.region`), excluding the current story + cross-vertical-ref stories, limit 3.

---

## 7. Sponsored treatment (v2 — not in template v1)

When `collaboration ≠ editorial`:

| collaboration value | Hero eyebrow | Byline | Sponsored strip |
|---|---|---|---|
| `editorial` (default) | `Series · {series.label}` or `{pillar.label}` | `By {author.name}` | none |
| `in-collaboration-with` | `In Collaboration With {sponsor.name}` | `By {author.name}` (editorial owns the byline) | one strip below byline |
| `presented-by` | `Presented By {sponsor.name}` | `By {author.name} for {sponsor.name}` | one strip below byline + one above footer |
| `sponsored` | `Sponsored — {sponsor.name}` (ink accent, NOT brand-red) | `By {sponsor.name}` (no editorial byline) | persistent strip at hero + byline + bottom |

v1 template implements `editorial` only. v2 adds the other three (Jaquar / Asian Paints worked examples).

---

## 8. URL routing rules (recap)

- `slug` MUST NOT match reserved tokens: `architecture` · `interiors` · `spaces` · `designers` · `vastu` · `guides` · `series` · `city` · `material` · `style` · `audience` · `brands` · `people` · `collections` · `discipline`.
- Story slugs are flat under `/design/{slug}`. NO `/design/story/{slug}`, NO `/design/architecture/{slug}` etc.
- `previous_slugs` enables URL history — old slugs 301-redirect to the canonical.

---

## 9. Worked example: Bijoy Jain Alibaug retreat

```json
{
  "slug": "bijoy-jain-alibaug-retreat",
  "title": "Inside Bijoy Jain's Alibaug retreat — where stone, water and quiet do the talking.",
  "subtitle": "A coastal studio in Alibaug. A practice built by hand. And what happens when a master of slow architecture builds a house for himself.",
  "summary": "Bijoy Jain has spent thirty years refining a way of building. The house he made for himself at the end of a forgotten road south of Mumbai is its purest expression.",
  "hero_image": {
    "src": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=2400&q=85&auto=format&fit=crop",
    "alt": "A coastal retreat by Studio Mumbai — stone walls and casuarina trees at dusk",
    "photo_credit": "Hélène Binet",
    "caption": "The eastern facade at last light. The casuarina forest comes right up to the wall."
  },
  "author": "/people/sumera-bhatia",
  "published_at": "2026-06-10",
  "reading_time_min": 12,
  "pillar": "series",
  "series": "studio-visit",
  "tags": {
    "discipline": ["architecture"],
    "format": ["studio"],
    "material": ["stone", "wood", "mud"],
    "style": ["indo-modern", "minimalist"],
    "region": ["alibaug", "maharashtra"],
    "audience": ["residential", "luxury", "premium"]
  },
  "featured_brands": ["/brands/studio-mumbai"],
  "featured_people": ["/people/bijoy-jain"],
  "collaboration": "editorial",
  "body": [
    { "type": "lead", "data": { "text": "There is a road south of Bombay..." } },
    { "type": "paragraph", "data": { "text": "..." } },
    { "type": "h2", "data": { "text": "The arrival" } },
    { "type": "paragraph", "data": { "text": "..." } },
    { "type": "image", "data": { "src": "...", "alt": "...", "photo_credit": "...", "caption": "..." } },
    { "type": "pull_quote", "data": { "text": "The hand has its own intelligence. You can't teach it from a screen.", "attribution": "Bijoy Jain" } },
    { "type": "h2", "data": { "text": "A practice in slow motion" } },
    { "type": "paragraph", "data": { "text": "..." } }
  ],
  "cross_vertical_refs": {
    "ghartalks_episode": { "url": "/ghartalks/bijoy-jain", "title": "Building Slowly — Bijoy Jain in conversation", "duration": "47 min" },
    "videoworks_film":   { "url": "/videoworks/studio-mumbai-portrait", "title": "Studio Mumbai — a portrait", "duration": "8 min" },
    "voices_essay":      { "url": "/voices/what-gets-lost-when-you-draw-on-a-screen", "title": "What gets lost when you draw on a screen", "author": "Bijoy Jain" }
  }
}
```

---

## 10. What this protects against

- **No new categories.** Stories surface across `/design` via their tags. The CMS never grows new folders.
- **No body HTML soup.** Body is structured blocks. Editors can't insert arbitrary inline styles, broken markup, or off-brand components.
- **No URL collisions.** Reserved tokens are enforced server-side.
- **No fragile bylines.** Author + sponsor are refs to real records, so a name change anywhere updates everywhere.
- **No fabricated taxonomy.** Tags pull from CMS-approved vocabulary; new tags require explicit approval per `docs/DESIGN-taxonomy.html` § 11.
