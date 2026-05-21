# PLAN — Phase 2: SEO and Discoverability

> Table-stakes for a portal. Social previews, structured data, sitemap, canonical URLs, PWA manifest. None of this affects rendered UX, but all of it affects whether the site is found and re-shared.

## Why this matters

The homepage today is missing:
- Open Graph and Twitter Card meta — links shared in WhatsApp, LinkedIn, Slack, Twitter render as plain URLs instead of a preview card
- Canonical URL meta — search engines may treat `/`, `/?utm_source=x`, `/?fbclid=y` as separate pages and dilute ranking
- JSON-LD structured data — Google's rich results require it; competitor portals (MagicBricks, 99acres, Housing) all have it
- PWA manifest + `apple-touch-icon` — installable on phones, themed launch screen
- `sitemap.xml` and `robots.txt` — search engines can't crawl what they can't find
- Per-page meta descriptions — only `index.html` has one; `for-brokers.html`, `for-developers.html`, etc. don't

These don't move performance scores but they're how a *portal* differs from a *prototype*.

## Effort

~2 hours. Mostly mechanical content authoring; the only judgment call is the OG image design.

---

## Step 1 · Open Graph + Twitter Card meta

Authoring: copy the description from `<meta name="description">`, choose an OG image, hardcode the canonical URL.

```html
<!-- in <head>, after <title> -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ghar.tv">
<meta property="og:title" content="Ghar.tv — Real Estate. For You.">
<meta property="og:description" content="India's Real Estate Discovery, Intelligence, Media and Events Platform.">
<meta property="og:url" content="https://ghar.tv/">
<meta property="og:image" content="https://ghar.tv/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Ghar.tv — Real Estate. For You.">
<meta name="twitter:description" content="India's Real Estate Discovery, Intelligence, Media and Events Platform.">
<meta name="twitter:image" content="https://ghar.tv/og-image.jpg">
```

**Asset to create:** `og-image.jpg` — 1200×630, Ghar.tv logo + tagline + warm canvas, JPEG ~80 KB. Brand-design task. Place in repo root.

**Per page:** every page (`for-brokers.html`, `for-developers.html`, etc.) needs its own OG meta with its own title, description, image. Authoring task — ~10 minutes per page.

**Acceptance:** Paste `https://ghar.tv/` into <https://www.opengraph.xyz/> and see a clean preview card.

---

## Step 2 · Canonical URL

Add to every page's `<head>`:

```html
<link rel="canonical" href="https://ghar.tv/">
```

For pages with `?utm_*` and `?fbclid=…` queries, this points search engines back to the bare URL.

**Acceptance:** Google Search Console "Canonical" check passes.

---

## Step 3 · JSON-LD structured data

Two schemas to start with — `Organization` and `WebSite`. Both go in `<script type="application/ld+json">` in `<head>`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ghar.tv",
  "url": "https://ghar.tv",
  "logo": "https://ghar.tv/brand_assets/logo.svg",
  "description": "India's Real Estate Discovery, Intelligence, Media and Events Platform.",
  "sameAs": [
    "https://www.linkedin.com/company/ghartv",
    "https://twitter.com/ghartv",
    "https://www.youtube.com/@ghartv"
    /* fill in real handles */
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Ghar.tv",
  "url": "https://ghar.tv",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://ghar.tv/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

When property listings exist, add `RealEstateListing` to each listing page.
When events exist (`/events/*`), add `Event` to each event page.
When podcast episodes exist (`/ghartalks/*`), add `PodcastEpisode` to each episode page.

**Acceptance:** Paste rendered HTML into <https://search.google.com/test/rich-results>. No errors.

---

## Step 4 · sitemap.xml + robots.txt

`robots.txt` at the repo root:

```
User-agent: *
Allow: /
Sitemap: https://ghar.tv/sitemap.xml
```

`sitemap.xml` at the repo root — list every routable URL. Author by hand for now; later, generate dynamically from the routes list (we have a CityRouter pattern in `main.js`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ghar.tv/</loc><priority>1.0</priority></url>
  <url><loc>https://ghar.tv/for-brokers</loc><priority>0.8</priority></url>
  <url><loc>https://ghar.tv/for-developers</loc><priority>0.8</priority></url>
  <url><loc>https://ghar.tv/for-buyers-owners</loc><priority>0.8</priority></url>
  <url><loc>https://ghar.tv/for-allied</loc><priority>0.8</priority></url>
  <url><loc>https://ghar.tv/videoworks</loc><priority>0.7</priority></url>
  <!-- All city pages — /mumbai, /bengaluru, /delhi, /hyderabad, /chennai, /pune, /kolkata, /ahmedabad, /noida, /gurugram -->
  <url><loc>https://ghar.tv/mumbai</loc><priority>0.7</priority></url>
  <url><loc>https://ghar.tv/bengaluru</loc><priority>0.7</priority></url>
  <!-- ...and so on -->
</urlset>
```

**Acceptance:** Submit `sitemap.xml` in Google Search Console; all URLs report "Submitted and indexed."

---

## Step 5 · PWA manifest + apple-touch-icon

`manifest.json` at the repo root:

```json
{
  "name": "Ghar.tv",
  "short_name": "Ghar",
  "description": "India's Real Estate Discovery, Intelligence, Media and Events Platform.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf7f2",
  "theme_color": "#faf7f2",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Add to every page's `<head>`:

```html
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png">
```

**Assets to create** (one-time brand-design task):
- `icons/icon-192.png` (192×192)
- `icons/icon-512.png` (512×512)
- `icons/icon-maskable.png` (512×512 with 80px safe area)
- `icons/apple-touch-icon.png` (180×180)
- `icons/favicon-32.png` (32×32)
- `icons/favicon-16.png` (16×16)

Source: `brand_assets/logo.svg` rasterized at each size, padded onto a warm-paper background.

**Acceptance:** Lighthouse PWA category scores > 0. Site is "installable" on a phone.

---

## Step 6 · Per-page meta descriptions

Audit:

```bash
grep -L 'name="description"' for-*.html videoworks.html
```

Author one description per page (~20-40 words each, action-oriented). Examples:

- `for-brokers.html`: "SuperPro by Ghar.tv — the premium platform for India's most ambitious real estate brokers. Branded digital HQ, video production, featured placement."
- `for-developers.html`: "Mandate by Ghar.tv — end-to-end marketing for property developers. Brand storytelling, project microsites, video production, lead generation."

**Acceptance:** Every page in the site has a unique, non-empty `<meta name="description">`.

---

## Combined acceptance criteria

- [ ] Pasting `https://ghar.tv/` into a social preview checker shows a clean OG card with image, title, description
- [ ] <https://search.google.com/test/rich-results> shows no errors for any page
- [ ] `https://ghar.tv/robots.txt` returns 200
- [ ] `https://ghar.tv/sitemap.xml` returns 200 and lists all routable URLs
- [ ] Lighthouse PWA category > 0 (preferably > 50)
- [ ] Every page has unique `<meta name="description">`, `<link rel="canonical">`, OG + Twitter meta
- [ ] Site can be added to home screen on Android + iOS

## Dependencies

- One-time design task: create `og-image.jpg`, `icon-192.png`, `icon-512.png`, `icon-maskable.png`, `apple-touch-icon.png`, favicon files. Junior designer in Figma, ~2 hours.
- Lands AFTER Phase 1 so the optimized HTML is the version submitted to search engines.
