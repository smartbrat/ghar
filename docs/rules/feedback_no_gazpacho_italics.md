---
name: No Gazpacho italics — strong rule
description: NEVER use italic on Gazpacho headings/display unless the user explicitly asks for it. Strong-rule from user.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**NEVER use Gazpacho in italic style** (`font-style: italic` or `<em>` inside Gazpacho headings) unless the user explicitly and strongly requests it.

**Why:** User stated this is "a very strong rule" on 2026-05-06. Gazpacho is the brand display face for Ghar.tv — italics on it weaken the typography, and the design-system.html `em { font-style: italic; }` pattern is reference-only, not a default to apply. Repeated unsolicited use forced removal of multiple sections.

**How to apply:**
- Default Gazpacho headings to upright (no `font-style: italic`, no italic `<em>` styling).
- When emphasis is needed inside a Gazpacho heading, achieve it through color shift (e.g. `var(--espresso)` or `var(--muted)`) or weight contrast — NOT italic.
- Treat any `.x-title em { font-style: italic }` or similar CSS as a red flag — strip it before shipping.
- This rule overrides `hp-*` design-system patterns that show italic em styling. Those are visual references, not rules.
- Inter italic for body emphasis (small-text quotes, byline notes) is OK; the rule is specifically about Gazpacho.
- If a layout truly needs italic display, ASK FIRST: "I'm thinking italic Gazpacho here for X — OK, or use weight/color instead?"
