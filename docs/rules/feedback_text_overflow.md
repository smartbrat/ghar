---
name: Text overflow handling on small screens
description: Always handle text wrapping on narrow screens — use ellipsis truncation or flex-column stacking, never let text break layout
type: feedback
---

When two or more text elements sit side by side in a row and the content is dynamic (names, dates, labels, descriptions), always plan for narrow screens (<480px):

1. **Prefer flex-column stacking** — wrap the row into `flex-direction:column` below a breakpoint where text starts colliding
2. **Use ellipsis truncation** when stacking isn't appropriate — `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` with a `max-width` or `min-width:0` on the flex child
3. **Never assume text length** — names, titles, labels are dynamic. Always test at 390px with long content mentally

**Why:** The editorial byline (author name + read time) broke on <480px because the name wrapped into the meta text. This applies to any row-based layout with dynamic text.

**How to apply:** For every new row-based element with text on both sides (bylines, card headers, nav items, metadata rows), add a stacking breakpoint or truncation. Check at 390px before moving on.
