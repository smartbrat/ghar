# Ghar.tv editor implementation kit

Copy-paste-ready starter files. The developer should read these in order:

1. **[README.md](README.md)** — this file
2. **[migrations.sql](migrations.sql)** — every DB column / table addition
3. **[sanitize-editor-html.php](sanitize-editor-html.php)** — server-side cleanup that runs on save
4. **[render-pipeline.php](render-pipeline.php)** — the full save → render flow with all stages
5. **[ghar-editor.js](ghar-editor.js)** — TinyMCE 7 unified init (load this on every form that has `.gh-editor` textareas)
6. **[plugins/](plugins/)** — three reference custom plugins (stat, callout, slot) — every other block follows the same shape

Three supporting docs:
- **[docs/EDITOR-blocks-spec.json](../EDITOR-blocks-spec.json)** — what each block outputs (the contract)
- **[docs/EDITOR-migration-plan.md](../EDITOR-migration-plan.md)** — phased migration plan
- **[design-article.html](../../design-article.html)** — visual reference, every block rendered

If the spec, plan, and this kit ever disagree, the spec wins.

---

## What's in here and what's not

**In the kit:**
- Sanitizer + iframe origin allowlist
- TinyMCE 7 init with the locked toolbar, format dropdown, and styles dropdown
- Three reference plugins covering the three shapes every custom block follows: dialog-driven insert (stat), API-picker insert (callout), enum-dropdown insert (placement slot)
- PHP render pipeline that stitches editor output + auto-injection + slot rendering + footnote renumbering
- SQL migrations for every new column / table

**Not in the kit (build from the references):**
- The other 16 custom plugins — copy `plugins/ghar-stat.js` for dialog-driven blocks, `plugins/ghar-callout.js` for API-picker blocks, `plugins/ghar-slot.js` for enum-dropdown blocks
- Per-slot-type renderers (`render_brand_profile()`, `render_ad_display()`, etc.) — wire each to your existing brand / ad / newsletter data
- Auto-injection rules table seed data — 7 example rules are in the spec; load them in your initial migration

---

## Sequence to follow

```
Day 1  → Run migrations.sql in dev, take a DB snapshot first
Day 1  → Drop sanitize-editor-html.php into secreal/lib/, wire it to the giarticle.php save handler
Day 2  → Download TinyMCE 7 community, drop ghar-editor.js into secreal/jseditor/
Day 2  → Add class="gh-editor" to every WYSIWYG textarea in giarticle.php
Day 2  → Smoke test: open giarticle.php, all 8 editors render, save round-trip still works
Day 3+ → Add plugins one at a time, ship each independently. Order:
         1. ghar-divider, ghar-anchor, ghar-superscript  (one-liners)
         2. ghar-stat, ghar-note, ghar-pullquote, ghar-speclist  (dialog-driven)
         3. ghar-image, ghar-video, ghar-audio, ghar-gallery, ghar-map  (media)
         4. ghar-callout × 4 variants, ghar-footnote, ghar-rawhtml  (API-driven)
         5. ghar-slot, ghar-component  (special)
Day N  → Wire render-pipeline.php into the article view template
Day N+1 → Build the per-slot-type PHP renderers as auto-inject rules go live
```

Each phase is independently shippable. The editor stays usable on every commit.

---

## Image pipeline — required changes for PhotoSwipe lightbox

The article template uses **PhotoSwipe v5** (MIT-licensed) to give every inline image, carousel image, and gallery photo a click-to-expand lightbox with pinch-zoom and prev/next swiping. The library is self-contained; the only change the backend needs to make is on the image upload pipeline.

### What the upload endpoint must emit

The existing `jbimages` / `/secreal/jseditor/upload.php` endpoint currently returns one URL after upload. For PhotoSwipe to work cleanly, it needs to return **three variants** and **the dimensions of each**:

```json
{
  "ok": true,
  "thumb":  { "url": "/uploads/2026/06/courtyard-900.webp",  "width": 900,  "height": 600 },
  "inline": { "url": "/uploads/2026/06/courtyard-2000.webp", "width": 2000, "height": 1333 },
  "hires":  { "url": "/uploads/2026/06/courtyard-2400.webp", "width": 2400, "height": 1600 }
}
```

- **thumb** → goes into the `<img src>` (lazy-loaded, ~900px wide)
- **inline** → optional intermediate for fullbleed/wide variants (~2000px)
- **hires** → goes into the PhotoSwipe `<a href>` (~2400px+, what the lightbox opens)

### Where to add the resize step

The upload PHP handler should:
1. Receive the original image (any size up to a sane max — 10 MB / 6000px)
2. Generate the three variants via GD or Imagick (the project already has Imagick installed for jbimages — verify)
3. Store all three in `/uploads/{year}/{month}/{slug}-{width}.webp` (WebP for size)
4. Return the JSON shape above

### How the editor block uses them

When the editor inserts an image via the image plugin, the saved markup looks like this:

```html
<figure class="art-inline-image art-inline-image--wide" data-pswp-gallery>
  <a class="pswp-link"
     href="/uploads/2026/06/courtyard-2400.webp"
     data-pswp-width="2400"
     data-pswp-height="1600"
     data-pswp-caption="The central courtyard. <em>Photography — Hélène Binet</em>"
     aria-label="Open photo at full size">
    <img src="/uploads/2026/06/courtyard-900.webp"
         alt="A stone courtyard"
         loading="lazy" decoding="async">
  </a>
  <figcaption>
    <span>The central courtyard.</span>
    <span class="art-inline-image__credit">Photography — Hélène Binet</span>
  </figcaption>
</figure>
```

The `ghar_image_caption` plugin in `ghar-editor.js` writes this shape directly — the renderer doesn't need to wrap anything on output. See [docs/EDITOR-blocks-spec.json#lightbox](../EDITOR-blocks-spec.json) for the contract.

### Self-hosting PhotoSwipe in production

The article template currently loads PhotoSwipe from unpkg (for the visual reference). For production:

1. Download `photoswipe@5.4.x` from npm or GitHub
2. Drop `photoswipe.css` and the two ESM modules (`photoswipe-lightbox.esm.js`, `photoswipe.esm.js`) into `/dist/photoswipe/`
3. Swap the `<link>` and the dynamic `import()` paths in the article template to the local URLs
4. Bundle size: ~28KB gzipped for all three files

### What this gives editors automatically

- Click any inline image → opens full-screen with caption + credit
- Click any carousel image → opens at that index, prev/next swipes through the 5-photo set
- Pinch-zoom on mobile
- Double-tap to zoom in/out
- Esc / swipe-down / click-outside to close

No per-image JS. No per-page wiring. The init script at the foot of the article template binds itself to any `[data-pswp-gallery]` it finds.

### Portrait, square, panoramic — all natively supported

PhotoSwipe handles any aspect ratio. Portrait photos use the same block markup, with two differences:

1. The figure gets the `.art-inline-image--portrait` modifier so the CSS caps height at 720px and centres the figure (otherwise tall portrait shots would dominate the reading column)
2. `data-pswp-width` and `data-pswp-height` carry the portrait dimensions (e.g. 1500 × 2250 for 2:3)

```html
<figure class="art-inline-image art-inline-image--portrait" data-pswp-gallery>
  <a class="pswp-link"
     href="/uploads/2026/06/staircase-1500x2250.webp"
     data-pswp-width="1500"
     data-pswp-height="2250"
     data-pswp-caption="A staircase lit from above. <em>Photography — Hélène Binet</em>">
    <img src="/uploads/2026/06/staircase-600x900.webp"
         alt="A staircase lit from above"
         loading="lazy" decoding="async">
  </a>
  <figcaption>…</figcaption>
</figure>
```

A live portrait sample sits in the Block Reference Library at the foot of `design-article.html`.

### The dimension-fidelity rule — the one thing that matters

The "jumpy open" feeling editors and viewers report is always the same root cause: a mismatch between the four dimension points. To get a smooth lightbox open animation, all four must agree per image:

| Point | Source |
|---|---|
| 1. Thumbnail file (CDN) | What the upload pipeline emits as `thumb.url` at exactly `thumb.width × thumb.height` |
| 2. CSS `aspect-ratio` on the displayed card | Should match the thumbnail's aspect, OR portrait variant for tall images |
| 3. Declared `data-pswp-width` × `data-pswp-height` on the anchor | The hi-res file's exact dimensions |
| 4. Hi-res file (CDN) | What the upload pipeline emits as `hires.url` at exactly `hires.width × hires.height` |

Whenever a content editor uploads a real photo, the upload pipeline ALREADY knows the actual dimensions (from ImageMagick / GD measuring the original) — it just needs to return them and the renderer must write them verbatim. Never override these numbers in CSS; never coerce aspect ratios with `object-fit: cover`. The rule is: respect what the upload tells you.

For the Unsplash placeholder photos in this template, we coerce aspect by adding `&w=…&h=…` to the URLs and matching the CSS aspect-ratio to the same shape. In production, that coercion goes away — the backend reports honest dimensions and they get written through unchanged.
