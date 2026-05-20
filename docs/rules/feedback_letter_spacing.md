---
name: No negative letter-spacing on Gazpacho — ever
description: Gazpacho is rendered with default tracking at every size. Negative letter-spacing is reserved for Inter at display scale only.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**Rule:** Never apply negative `letter-spacing` to Gazpacho. Drop the property entirely on every Gazpacho rule, regardless of font-size — display headlines, mid-size titles, body, prices, stats, all of it. Default tracking is the right look.

Inter rules can keep negative letter-spacing where it serves the design (typically only at display sizes for the "compare with Gazpacho" demonstration in `design-system.html` `.bi-type-inter-aa`). For Inter at body and UI sizes, also default tracking.

**Why:** The user surfaced this on the Featured Projects price (`-0.02em` on 18px Gazpacho). On reviewing, they asked to remove it from all Gazpacho — and could not recall why we had ever added tracking. Their eye prefers Gazpacho with its native rhythm. The serif curves are designed to read confidently at scale without artificial tightening; negative tracking compresses the very details that make the typeface distinctive.

**How to apply:**
- Writing new Gazpacho rules: do not add `letter-spacing` at all.
- Reviewing existing CSS/inline styles: if a Gazpacho rule has `letter-spacing: -0.X`, remove the property.
- Cleaned up across `styles4.css`, `index4.html`, and `design-system.html` on 2026-05-03 — every Gazpacho rule had its negative letter-spacing stripped (the only remaining `-0.03em` is on `.bi-type-inter-aa`, which is the Inter typography sample).
- Positive letter-spacing on uppercase eyebrows (`0.1em`+) is unrelated and stays.
- If a future iteration suggests Gazpacho needs tightening at extreme sizes (>120px), surface it as a question — don't quietly add it back.
