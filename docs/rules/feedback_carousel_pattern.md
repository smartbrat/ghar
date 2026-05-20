---
name: Card carousel pattern
description: Standard carousel CSS pattern for card grids on mobile/tablet — bleed edges, padding alignment, drag-scroll
type: feedback
---

Always use this exact pattern for card carousels on mobile/tablet:

```css
@media(max-width:BREAKPOINT){
  .container{
    display:flex;gap:16px;
    overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;
    padding-bottom:4px;
    margin-left:calc(-1 * var(--pad-h));
    margin-right:calc(-1 * var(--pad-h));
    padding-left:var(--pad-h);
    padding-right:var(--pad-h);
  }
  .container::-webkit-scrollbar{display:none}
  .container>*{flex-shrink:0;width:82vw}
  @media(min-width:480px){.container>*{width:65vw}}
  @media(min-width:744px){.container>*{width:48vw}}
}
```

**Why:** Negative margins bleed the scroll area to viewport edges. Padding-left aligns the first card with content. When scrolled, cards travel past both edges. This is how the Design section carousel works and is the approved pattern.

**How to apply:** Use this for every card-grid-to-carousel responsive pattern. Add `drag-scroll` class for mouse drag with momentum. The parent section must NOT have `overflow:hidden` or `overflow:clip` — contain overflow on specific child elements instead (e.g. background video containers).
