/* Brand palette registry: the ONE source of brand color for brand profiles
   AND the person profiles linked to them.

   Every hex comes from the brand's logo file or its own live website
   (sampled 2026-09-16, evidence in `src`). Never guess a color. A soft or
   canvas tint may be derived from the primary; say so in `src`.

   `npm run build:palettes` checks WCAG contrast on every pair below, fails on
   any miss, and writes dist/brand-theme.css. A page opts in with
   <body data-palette="<slug>">; person pages get their parent brand's slug
   from the generator. Contract: docs/BRAND-PROFILE-TOKEN-CONTRACT.md.

   Roles
     primary      buttons, topbar CTA, sticky bar CTA          [bg, text]
     hover        hover state of every primary                   [bg, text]
     text         small accent text on the page ground (4.5:1)
     ink          contact card, dark bands, chip borders
     cta          contact button on the ink card                  [bg, text]
     ctaHover     its hover                                        [bg, text]
     alt          secondary accent: card glow, large stat numbers
     canvas       section bands, image placeholders
     soft         chip grounds (share/menu), avatar + tile grounds
     theme        'dark' when the page ground is dark (text + stat measured on ink)

   native: true   the tenant's own chassis design paints buttons, hovers, the
                  contact card and placeholders from these tokens; the forced
                  surface rules in brand-theme.roles.css skip it. Contrast
                  misses are reported, not fatal (user-approved originals).
   contact        extra --contact-* tokens (native tenants)
   person         token overrides on that brand's person pages only
   tokens         any other brand token the tenant reads
   noInk          do not emit --brand-ink (tenant relied on chassis fallbacks) */

export const PALETTES = {
  'godrej-properties': {
    primary: ['#27262e', '#ffffff'], hover: ['#000000', '#ffffff'], text: '#27262e',
    ink: '#27262e', cta: ['#c2aa61', '#27262e'], ctaHover: ['#ffffff', '#27262e'],
    alt: '#c2aa61', canvas: '#f9f6f3', soft: '#f3f2f0',
    src: 'godrejproperties.com: body text + .btn-black #27262e (74), .btn:hover #000, gold headings #c2aa61, .bg-seashell #f9f6f3. soft derived.',
  },
  'avirahi': {
    primary: ['#384aa0', '#ffffff'], hover: ['#1e357c', '#ffffff'], text: '#384aa0',
    ink: '#0c1332', cta: ['#ff6c00', '#0c1332'], ctaHover: ['#ff8500', '#0c1332'],
    alt: '#ff6c00', canvas: '#f5f5f5', soft: '#ebedf6',
    src: 'avirahi.com: headings + form buttons #384aa0 (33), .blue-bg #1e357c, footer #0c1332, .request-quote #ff6c00 / #ff8500, .location-advantages #f5f5f5. soft derived.',
  },
  'saint-gobain': {
    primary: ['#17428c', '#ffffff'], hover: ['#0c1f3e', '#ffffff'], text: '#17428c',
    ink: '#0c1f3e', cta: ['#ff7800', '#0c1f3e'], ctaHover: ['#e06b00', '#0c1f3e'],
    alt: '#ed0530', canvas: '#f4f4f4', soft: '#e8ecf4',
    src: 'saint-gobain.co.in: --dark-blue #17428c (85), footer #0c1f3e, --brand-orange #ff7800 hover #e06b00, --sg-stat-red #ed0530, --bg-gray #f4f4f4. Logo navy #254a9a. soft derived.',
  },
  'obeetee': {
    native: true, noInk: true,
    primary: ['#8a6e42', '#ffffff'], hover: ['#745c36', '#ffffff'], text: '#8a6e42',
    ink: '#3a2e1c', cta: ['#79613a', '#ffffff'], ctaHover: ['#79613a', '#ffffff'],
    alt: '#8a6e42', canvas: '#f1ebe1', soft: '#f1ebe1',
    contact: { '--contact-surface': '#f1ebe1' },
    src: 'Logo gold-brown #8a6e42 (original tenant palette, restored 2026-09-16 at user request). Contact card on the brand soft #f1ebe1 (user: the old #faf7f2 had no relation to the brand). ink is only used by the contrast check.',
  },
  'asian-paints': {
    primary: ['#431a80', '#ffffff'], hover: ['#5a2bb3', '#ffffff'], text: '#431a80',
    ink: '#232426', cta: ['#fcaf17', '#232426'], ctaHover: ['#fdbf45', '#232426'],
    alt: '#f14950', canvas: '#f5f0e4', soft: '#fff7e8',
    src: 'asianpaints.com: --primary-color #431a80 hover #5a2bb3, --dark-color #232426 (37), --accent-color CTA #fcaf17 hover #fdbf45, display heading red #f14950, cream section #f5f0e4, outline hover #fff7e8.',
  },
  'scarlet-splendour': {
    primary: ['#d50032', '#ffffff'], hover: ['#942125', '#ffffff'], text: '#d50032',
    ink: '#30011e', cta: ['#f1e4c6', '#30011e'], ctaHover: ['#ffffff', '#30011e'],
    alt: '#db6064', canvas: '#fdf2f5', soft: '#fbe6eb',
    src: 'scarletsplendour.com: .btn-primary #d50032 (97) hover #942125, .slidemenu wine #30011e, menu links #f1e4c6, menu titles #db6064. canvas + soft derived.',
  },
  'horizon-architects': {
    native: true,
    primary: ['#f98619', '#ffffff'], hover: ['#d27013', '#ffffff'], text: '#f98619',
    ink: '#3d2e28', cta: ['#f98619', '#1b1512'], ctaHover: ['#ffa040', '#1b1512'],
    alt: '#6c9e3f', canvas: '#f5f1e6', soft: '#fde1cb',
    tokens: { '--brand-alt-soft': '#ddebc9', '--brand-chip': '#3d2e28' },
    contact: {
      '--contact-surface': '#1b1512', '--contact-ink': '#f5f2ec',
      '--contact-ink-muted': 'rgba(245,242,236,.72)', '--contact-eyebrow-color': 'rgba(245,242,236,.66)',
      '--contact-border': 'rgba(255,255,255,.07)', '--contact-divider': 'rgba(255,255,255,.10)',
      '--contact-panel-bg': 'rgba(255,255,255,.035)', '--contact-panel-border': 'rgba(255,255,255,.07)',
      '--contact-cta-bg': '#f98619', '--contact-cta-fg': '#1b1512', '--contact-cta-hover-bg': '#ffa040',
    },
    src: 'Logo orange #f98619 + wordmark green #6c9e3f (original tenant palette, restored 2026-09-16 at user request). Dark contact card #1b1512 is the tenant design.',
  },
  'teearch': {
    native: true,
    primary: ['#c67e35', '#ffffff'], hover: ['#a7692b', '#ffffff'], text: '#c67e35',
    ink: '#4a2a10', cta: ['#ae6f2f', '#ffffff'], ctaHover: ['#ae6f2f', '#ffffff'],
    alt: '#c67e35', canvas: '#f0e6d6', soft: '#f0e6d6',
    person: { '--brand-ink': '#1a1410', '--brand-soft': '#f5e4cf' },
    src: 'Logo copper #c67e35 (original tenant palette, restored 2026-09-16 at user request). The white contact card is the tenant design.',
  },
  'studiofov': {
    native: true, theme: 'dark',
    primary: ['#ca3248', '#ffffff'], hover: ['#aa293b', '#ffffff'], text: '#ca3248',
    ink: '#0f0f0f', cta: ['#ca3248', '#ffffff'], ctaHover: ['#ca3248', '#ffffff'],
    alt: '#ca3248', canvas: '#0f0f0f', soft: '#f5f5f5',
    person: { '--brand': '#c93340', '--brand-text': '#c93340', '--brand-soft': '#f5f0e8', '--brand-ink': '#0f0d0e' },
    src: 'Logo + studiofov.com red #ca3248, near-black ground. Hover and the glass contact card are the original tenant design, restored 2026-09-16 at user request.',
  },
  /* Person with no linked brand: neutral Ghar.tv palette. */
  'ghar': {
    primary: ['#111111', '#ffffff'], hover: ['#000000', '#ffffff'], text: '#111111',
    ink: '#161616', cta: ['#ffffff', '#111111'], ctaHover: ['#ededed', '#111111'],
    alt: '#6a6a6a', canvas: '#f7f7f7', soft: '#f0f0f0',
    src: 'Portal ink and neutrals.',
  },
};
