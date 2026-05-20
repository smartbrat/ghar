# Ghar.tv Homepage — Project Report

**Prepared by:** Mohan Aiyer  
**Date:** 11 April 2026  
**Status:** Homepage complete, ready for vertical page expansion  
**Live URL:** https://ghar-lime-sand.vercel.app  
**Repository:** https://github.com/smartbrat/ghar

---

## 1. Executive Summary

The Ghar.tv homepage has been built from the ground up as a **17-section, fully responsive, single-page experience** that positions Ghar.tv not as another property listing portal, but as **India's Real Estate Discovery, Intelligence, Media and Events Platform**.

Every section was researched, planned with full product understanding, designed to high standards, and iterated through multiple rounds before approval. The build prioritised **understanding-first architecture** — the entire platform's information architecture, product definitions, audience verticals, content strategy, and B2B offerings were documented and internalised before a single line of code was written.

This means the homepage serves as the **definitive blueprint for every vertical page that follows** — significantly reducing planning and design time for future builds.

### Key Numbers

| Metric | Value |
|--------|-------|
| Total sections | 17 |
| Lines of production code | 6,600+ |
| CSS (embedded) | ~2,500 lines |
| JavaScript (embedded) | ~5,500 lines |
| Git commits | 15 |
| Brand assets | 14 files (logos, fonts, portraits) |
| Footer links | 40+ |
| Off-canvas menu items | 30+ |

---

## 2. What Was Built

### 2.1 Homepage Sections (17 total)

| # | Section | What It Does |
|---|---------|-------------|
| 1 | **Hero + Search** | Three-panel layout with universal search bar. B2B side cards (GharTalks, GharEvents, VideoWorks, Brand Connect). Centre panel = universal consumer entry point. Scroll animation transitions into ecoForYou. |
| 2 | **ecoForYou** | Four audience verticals (Buyers & Owners, Brokers, Developers, Allied Businesses). Each card with illustrations drives exploration of their dedicated vertical. |
| 3 | **Editorial** | Content discovery hub with topic filters. Daily updates on markets, launches, policy, and investment opportunities. |
| 4 | **Intelligence** | Standalone vertical with 7 category filters (Reports, Market, Infrastructure, Rankings, Analysis, Investment, Legal). Card grid with article previews. |
| 5 | **Architecture & Design** | Premium design editorial with category pills, designer spotlights, and featured home tours. Aspirational, Architectural Digest-inspired. |
| 6 | **GharTalks** | Flagship podcast/talk show. YouTube facade with real thumbnails, featured episode card, recent episodes carousel. Real episode data — no fabricated content. |
| 7 | **Industry Voices** | Written expert perspectives. Featured voice with glass-panel card, editorial quote-driven layout. Separate identity from GharTalks. |
| 8 | **GharEvents** | Dark immersive section. 4 franchise events (India Property Show, India Luxury Property Show, India PropTech Expo, India Senior Living Show) with custom SVG illustrations and cursor glow animation. |
| 9 | **For Brokers / SuperPro** | Authority-first broker positioning. Hero layout with orbit graphic, compact features. "Brokers — Dominate your market." |
| 10 | **Developer Mandate** | End-to-end marketing solution for developers. Centered layout with ecosystem graphic, XXL display typography. |
| 11 | **VideoWorks** | B2B branded content studio showcase. Ghar.tv's equivalent of BBC Storyworks for Indian real estate. |
| 12 | **Brand Connect** | B2B advertising and content partnerships. |
| 13 | **Creator Network** | Connects property influencers, journalists, and educators with Ghar.tv's audience and brands. |
| 14 | **People** | Editorial showcase of industry leaders. Horizontal auto-playing carousel with portrait cards featuring 10 real Indian industry leader photos. |
| 15 | **Ghar Services** | Lead-gen services cluster — Ghar Finance (home loans), Ghar Design (interiors), Ghar Move (relocation). |
| 16 | **Tools** | Decision-support utilities — EMI Calculator, Loan Eligibility, Stamp Duty Calculator, Area Converter, Ready Reckoner. |
| 17 | **Ecosystem Map** | Closing section. Radial SVG visualization showing all platform verticals connected through Ghar.tv with CSS-driven entrance animations. |

### 2.2 Footer (4-layer structure)

| Layer | Details |
|-------|---------|
| **Join Ghar.tv CTA** | Community orbit illustration with 12 Indian face avatars (Unsplash, rights-free) positioned on trigonometry-calculated orbital rings around the G lettermark. Copy positions Ghar.tv as media-first: "Where India understands real estate." |
| **Brand Bar** | Left-aligned logo, platform tagline, social icons (YouTube, Instagram, X, LinkedIn, Facebook). |
| **6-Column Link Grid** | Discover, Content, Media & Events, For Business, Tools & Services, Company — 40+ links covering the full sitemap. |
| **Bottom Bar** | G logomark, copyright, Zybeq Ventures Pvt Ltd, contact info (email + phone), legal links (Terms, Privacy, Cancellation, Disclaimer). |

### 2.3 Off-Canvas Navigation Menu

| Feature | Details |
|---------|---------|
| **Trigger** | Desktop hamburger button + mobile bottom bar "Menu" button |
| **Panel** | Right-slide, max 420px width (88vw on mobile), dark overlay with click-outside-to-close |
| **Multi-level** | L1 → L2 panel slide transition with independent scroll containers (no scroll position bleed between levels) |
| **Prominent CTAs** | Join Ghar.tv (onboarding modal trigger), Post Property, Post Requirement, Property Leads |
| **Expandable sections** | For Buyers & Owners, For Allied Businesses, Content, Media & Events, Services, Tools |
| **Direct links** | For Brokers (SuperPro), For Developers (Mandate) |
| **Footer** | Utility links (About Us, Contact Us, Careers, Q&A) + social icons |

### 2.4 Navigation System

| Component | Details |
|-----------|---------|
| **Desktop Nav** | Fixed top bar, 116px height at 1080px+. Logo left, expanded search center, Post Property + hamburger right. |
| **Tablet Nav** | Compact search trigger, Post Property button. |
| **Mobile Nav** | Compact search bar at top, fixed bottom bar (Ghar, Post Property, Login, Menu). Mobile search modal with city selection, property type, buy/rent mode. |

---

## 3. Design System Established

A comprehensive design system was built and documented, ensuring consistency across the homepage and all future pages.

### 3.1 Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#ffffff` | Primary background |
| `--ink` | `#111111` | Primary text, headings |
| `--ink2` | `#374151` | Secondary text |
| `--muted` | `#6a6a6a` | Body text, descriptions |
| `--rule` | `#e8e8e8` | Borders, dividers |
| `--bg2` | `#f7f7f5` | Surface layer (footer) |
| `--red` | `#ee324b` | Brand accent — STRICTLY limited to ~5% (CTAs only) |

### 3.2 Typography

| Role | Font | Details |
|------|------|---------|
| Display | Gazpacho Bold | Large headings only. letter-spacing: -0.025em, line-height: 1.08 |
| Everything else | Inter | Body, UI, navigation, CTAs. line-height: 1.8 for body, 1.7 for small. |

### 3.3 Layout & Spacing

| Element | Standard |
|---------|----------|
| Max-width | 1280px (Airbnb-style tighter container) |
| Horizontal padding | `clamp(24px, 3vw, 80px)` — scales with viewport |
| Vertical section padding | `clamp(80px, 9vw, 120px)` |
| Grid gaps | 24px universal |
| Card border-radius | 20px (large), 12px (small) |
| Base spacing scale | 8, 16, 24, 32, 48, 64, 96 |

### 3.4 Component Standards

| Component | Standard |
|-----------|----------|
| **CTA Buttons** | 3 styles only: `.btn-primary` (outline), `.btn-accent` (filled dark), `.btn-ghost` (transparent for dark BGs) |
| **Section Headers** | Unified `.sec-hdr` — title left, description right on desktop, stacked on mobile |
| **Carousels** | Bleed-edge pattern: negative margins + padding, drag-scroll, no parent overflow:hidden |
| **Responsive** | Mobile-first CSS. Breakpoints: 480px, 744px, 1024px, 1080px. Every section validated at 390px. |

---

## 4. Product & Content Architecture

Before building each section, the full product context was researched and documented. This means **future vertical pages can be built significantly faster** because the foundational thinking is already done.

### 4.1 Consumer Verticals

| Vertical | Positioning | Key Insight |
|----------|-------------|-------------|
| **Buyers & Owners** | Property discovery, market intelligence, decision support | Understanding-first, not transaction-first |
| **Brokers** | Authority-building via SuperPro, ecosystem presence | NOT lead generation. "Dominate your market." |
| **Developers** | Project marketing via Developer Mandate | End-to-end: strategy, branded content, distribution |
| **Allied Businesses** | B2B partnerships via Brand Connect | Brands reaching Ghar.tv's audience. CTA: "Partner With Us" |

### 4.2 Content Verticals (all defined with positioning, content types, and page structure)

| Vertical | Sub-categories / Series |
|----------|------------------------|
| **Editorial** | Daily updates, market news, policy, launches |
| **Intelligence** | Reports, Market, Infrastructure, Rankings, Analysis, Investment, Legal |
| **Design** | Architecture, Interiors, Vastu, Home Tours, Guides, Featured Homes, Celebrity Homes, Designers |
| **Industry Voices** | 7 series — written expert perspectives, op-eds, market commentary |
| **People** | Developer, Architect, Broker, Economist, Founder profiles |
| **Building India** | Metro impact, airports, expressways, industrial corridors, smart cities, megaprojects |

### 4.3 Media Verticals

| Product | Positioning |
|---------|-------------|
| **GharTalks** | India's foremost real estate podcast. "Conversations." |
| **VideoWorks** | Branded content studio — brands pay Ghar.tv to produce and distribute their story |
| **Videos** | Video content hub |

### 4.4 Events

4 franchise events defining India's real estate industry calendar:
1. **India Property Show** — Flagship
2. **India Luxury Property Show** — Luxury
3. **India PropTech Expo** — Innovation
4. **India Senior Living Show** — Specialist

### 4.5 Services & Tools

| Services (Lead-gen) | Tools (Self-serve) |
|---------------------|-------------------|
| Ghar Finance (home loans) | EMI Calculator |
| Ghar Design (interior design) | Loan Eligibility |
| Ghar Move (relocation) | Stamp Duty Calculator |
| | Area Converter |
| | Ready Reckoner |

### 4.6 Full Sitemap Coverage

The complete URL structure has been mapped across all verticals including sub-pages already built by the team:
- Design sub-pages (Interiors, Celebrity Homes, detail pages)
- Intelligence sub-pages (Rankings, Reports, Analysis, Market, Infrastructure, Investment, Legal)
- People profiles
- GharTalks, VideoWorks, GharEvents, Industry Voices dedicated pages

---

## 5. Technical Quality

### 5.1 Animation & Interaction

| Area | Implementation |
|------|----------------|
| Scroll animations | GSAP ScrollTrigger for scroll-driven reveals across all sections |
| Entrance animations | CSS keyframe animations with IntersectionObserver triggers |
| Carousels | GSAP Draggable with velocity-based inertia |
| Micro-interactions | Hover states on every interactive element, spring-style easing |
| Performance rule | Only `transform` and `opacity` animated — never `transition-all` |

### 5.2 Mobile Experience

| Feature | Detail |
|---------|--------|
| Mobile search modal | Full-screen modal with city search, property type selection, buy/rent mode |
| Fixed bottom bar | 4-button navigation (Ghar, Post Property, Login, Menu) |
| Viewport fix | Comprehensive fix for Chrome mobile URL bar viewport jump |
| Touch targets | Minimum 44px height on all interactive elements |
| Lazy loading | Images loaded only when entering viewport |

### 5.3 Video Handling

YouTube facade pattern throughout — no iframe loaded until user interacts. Reduces initial page weight significantly. All videos are YouTube embeds, never self-hosted.

---

## 6. Code Optimization Plan (Next Phase)

The following optimizations are planned to be implemented after all sections are finalised, to ensure the fastest possible loading and SEO-friendliness.

### 6.1 Performance Optimization

| Optimization | Impact | Priority |
|-------------|--------|----------|
| **Extract CSS to external file** | Enables browser caching, reduces HTML payload. Currently ~2,500 lines of CSS are embedded inline. Move to `styles.css` with cache-busting hash. | High |
| **Extract JS to external file** | Same benefit. ~5,500 lines of JS should move to `main.js` with `defer` attribute. | High |
| **Minify HTML/CSS/JS** | Reduce total payload by ~30-40%. Use build tools (esbuild/terser for JS, cssnano for CSS, html-minifier). | High |
| **Image optimization** | Convert brand_assets PNGs/JPGs to WebP/AVIF with `<picture>` fallbacks. Add explicit `width`/`height` attributes to prevent layout shift. | High |
| **Preload critical fonts** | Add `<link rel="preload" as="font">` for Inter (400, 500, 600, 700) and Gazpacho Bold. Use `font-display: swap`. | High |
| **Defer non-critical scripts** | GSAP, ScrollTrigger, Draggable can all load with `defer`. Only inline the minimal scroll-detection JS. | Medium |
| **Critical CSS inlining** | Extract above-the-fold CSS (~50 lines for hero + nav) and inline it, load the rest asynchronously. | Medium |
| **Remove unused Tailwind** | Currently loading full Tailwind CDN (~300KB). Replace with only the utilities actually used, or purge. | High |
| **Lazy-load below-fold sections** | Use `content-visibility: auto` on sections below the fold to skip rendering until scroll. | Medium |
| **Compress SVGs** | Run SVGO on all inline SVGs (ecosystem map, section illustrations, social icons). | Low |

### 6.2 SEO Optimization

| Optimization | Impact | Priority |
|-------------|--------|----------|
| **Semantic HTML** | Replace generic `<div>` wrappers with `<article>`, `<aside>`, `<main>`, `<section>` with proper `aria-` attributes. | High |
| **Meta tags** | Add comprehensive `<meta>` tags: description, og:title, og:description, og:image, twitter:card, canonical URL. | High |
| **Structured data (JSON-LD)** | Add schema.org markup: Organization, WebSite, SearchAction (for sitelinks search), BreadcrumbList, Event (for GharEvents), VideoObject (for GharTalks). | High |
| **Heading hierarchy** | Audit and fix h1→h6 hierarchy. Ensure single `<h1>`, logical nesting. Currently some sections may have skipped levels. | Medium |
| **Alt text** | Add descriptive alt text to all images (currently many are empty `alt=""`). Especially People portraits and Design section images. | Medium |
| **Internal linking** | Ensure all footer and off-canvas menu links use proper relative URLs that will resolve on the production domain. | Medium |
| **Sitemap.xml** | Generate XML sitemap covering all pages (homepage + all vertical pages). | Medium |
| **robots.txt** | Create robots.txt allowing all crawlers, pointing to sitemap. | Low |
| **Page speed targets** | Target Lighthouse scores: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95. | Ongoing |
| **Open Graph images** | Create custom OG images for homepage and each major section for social sharing. | Low |

### 6.3 Build Pipeline (Recommended)

To support the optimizations above, establish a simple build pipeline:

```
Source (index.html)
  ↓
  Extract CSS → styles.css → cssnano → styles.min.css
  Extract JS  → main.js   → terser  → main.min.js
  Images      → sharp/squoosh → WebP/AVIF
  HTML        → html-minifier → index.html
  ↓
Production build (dist/)
  ↓
Deploy to Vercel
```

Tools recommended: **Vite** (bundler), **sharp** (image optimization), **SVGO** (SVG optimization). No framework migration needed — Vite can handle plain HTML/CSS/JS with zero config.

---

## 7. Iteration & Quality Process

Each section went through a rigorous multi-step process:

1. **Product understanding** — Full context on what the vertical is, who it serves, how it's positioned, what content it contains. No section was built without this foundation.
2. **Design discussion** — Options presented, direction approved before any code was written. Multiple approaches explored for complex sections.
3. **Build** — Section coded using the established design system. Mobile-first CSS, responsive validation.
4. **Screenshot comparison** — Automated Puppeteer screenshots at desktop (1440px) and mobile (390px), compared against design intent.
5. **Refinement** — Multiple rounds of visual polish, spacing adjustments, responsive fixes, animation tuning.
6. **Consistency pass** — Cross-section audit ensuring CTAs, headers, colors, spacing, and interaction patterns are uniform across all 17 sections.

### Major Milestones

| Commit | What Changed |
|--------|-------------|
| `560b70a` | Initial commit — hero, ecoForYou, editorial, intelligence, design sections |
| `68fe9bb` | GharTalks section with YouTube facade pattern |
| `70f55e6` | GharEvents — dark immersive with SVG illustrations |
| `4342b6f` | For Brokers — authority-first with SuperPro |
| `c7175a0` | Developer Mandate + cross-section refinements |
| `47f0270` | Remaining 7 sections (VideoWorks, Brand Connect, Creator Network, People, Services, Tools, Ecosystem) |
| `c029c5a` → `fb1f794` | Three rounds of responsive fixes, carousel patterns, mobile viewport fixes |
| `38cc201` | **Design consistency overhaul** — CTA unification (8 styles → 3), header standardization, dark→white conversions |
| `83441c6` → `9b88756` | Footer (Join CTA, 6-column links, brand bar) + Off-canvas navigation menu |

---

## 8. What This Enables Next

Because the homepage establishes the full design system, product architecture, and content strategy, the team can build vertical pages efficiently with minimal additional planning.

| Page | What's Already Done |
|------|-------------------|
| **Intelligence hub + 7 sub-pages** | Section design, card patterns, filter UI, 7 category definitions, article card layout |
| **Design hub + sub-pages** | Category pills, designer spotlights, article cards, home tour layout |
| **GharTalks dedicated page** | YouTube facade pattern, episode cards, featured layout, real episode data structure |
| **Industry Voices hub** | Editorial card pattern, quote-driven layout, 7 series defined |
| **GharEvents pages (4 events)** | Event card design, SVG illustration pattern, franchise positioning |
| **For Brokers / SuperPro** | Hero layout, feature grid, CTA pattern, product positioning |
| **Developer Mandate page** | Content structure, page copy, product definition documented |
| **People profiles** | Portrait card design, data structure, drag-scroll pattern |
| **Tools pages (5 calculators)** | Card design established, needs functional calculator UI |
| **Onboarding modal** | Full flow documented (WhatsApp OTP → user type selection → profile creation) |
| **Logged-in navigation** | Architecture noted — user menu replaces Join CTA in off-canvas, bottom bar adapts |

---

## 9. Complete Commit History

```
9b88756  Redesign footer + add off-canvas navigation menu
83441c6  Add site footer — Join CTA, 6-column links, brand bar, legal strip
6fd3016  Brand Connect breathing space + Industry Voices button restyle
38cc201  Design consistency overhaul — CTA unification, dark→white, section redesigns
836eea6  Polish pass — carousel fixes, word-reveal animation, responsive tweaks
fb1f794  Fix mobile Chrome URL bar viewport jump — comprehensive approach
f31bfb6  Fix mobile viewport jumpiness + carousel/chip improvements
c029c5a  Responsive fixes — carousel patterns, touch-screen glow, section refinements
47f0270  Add remaining 7 homepage sections
c7175a0  Add Developer Mandate section + cross-section refinements
4342b6f  Add For Brokers section — authority-first broker platform
70f55e6  Add GharEvents section — dark immersive events vertical
68fe9bb  Add GharTalks section — flagship video talk show showcase
560b70a  Initial commit — Ghar.tv homepage
```

---

*This document covers the complete scope, decisions, and technical foundation of the Ghar.tv homepage build. The design system and product architecture documented here serve as the foundation for all future vertical pages.*
