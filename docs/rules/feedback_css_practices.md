---
name: CSS practices and code organization
description: No inline styles fighting CSS, no !important unless modifier pattern, source order matters, discuss before acting
type: feedback
---

Never use inline styles on HTML elements for properties that are also controlled by CSS media queries — they override and cause specificity conflicts.

**Why:** Multiple incidents where inline `height:96px` on nav overrode the media query `height:116px`, or hero padding was duplicated in two media queries with the later one winning. Caused layout bugs and wasted debugging time.

**How to apply:**
- Base styles in CSS, not inline `style=""` attributes
- Media query overrides must come AFTER base rules in source order (same specificity = last wins)
- Only use `!important` for modifier classes that intentionally override all states (e.g. `.sec-hdr--center{display:block!important}`)
- Check for duplicate media queries targeting the same property — the last one wins
- When JS needs to override CSS temporarily (e.g. collapse nav), set inline style; when reverting, use `el.style.removeProperty()` or `el.style.height=""` to let CSS take over again
- Don't add grey backgrounds (`var(--bg2)`, `#f5f5f5`) to make things "stand out" — user dislikes this pattern
