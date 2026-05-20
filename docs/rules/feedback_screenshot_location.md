---
name: STRICT — All Claude screenshots go inside screenshots/claude-screenshots/
description: Every screenshot Claude takes — Playwright MCP, Puppeteer fallback, anything — must be written to ./screenshots/claude-screenshots/. NEVER drop PNG/JPG/JPEG/WEBP files at the project root. No exceptions.
type: feedback
originSessionId: 73c55e42-895a-4e0e-9811-e445489c072a
---
**Strict rule, no exceptions.** Every screenshot Claude generates lives inside `./screenshots/claude-screenshots/` — relative to the project root `d:/WORK/ghar-claude/`.

## Why
On 2026-05-08 the project root had accumulated 226 loose `.png` files from past Claude sessions (ad4-*.png, cities-*.png, design-*.png, ds-buttons-*.png, etc.). The user had to ask explicitly to "clear all the screenshots" and demanded a STRICT RULE going forward. Loose screenshot crud at the root makes `git status` unreadable, clutters file pickers, and mixes session artifacts with real source files.

## How to apply
- **Playwright MCP `browser_take_screenshot`**: always pass `filename: "screenshots/claude-screenshots/<descriptive-name>.png"`. The `filename` field is relative to project root, so this nests it correctly.
- **Puppeteer fallback (`node screenshot.mjs`)**: it already writes to `./screenshots/claude-screenshots/` — keep using it as-is, don't override the path.
- **Reading screenshots back**: pass the same nested path to the `Read` tool.
- **NEVER**: write a screenshot to the project root, to `.playwright-mcp/`, or to any ad-hoc location like `/tmp` or a sibling folder.
- **NEVER**: leave a screenshot at root "temporarily" intending to move it later. Save it correctly the first time.
- **If you find loose screenshots at root** in a future session: move them into `screenshots/archive-<date>-cleanup/` and continue. Don't ask the user — just clean up and proceed.

## Encoded in CLAUDE.md
The rule is also written into `d:/WORK/ghar-claude/CLAUDE.md` under "Browser Inspection Workflow" as a STRICT bullet, so it survives even if this memory is dropped.

## Stacks with
- `feedback_screenshots.md` — workflow rules (scroll-trigger animations, wait for reveals)
- `feedback_playwright_mcp.md` — MCP-first preference for browser inspection
