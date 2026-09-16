#!/usr/bin/env node
// PreToolUse hook: HARD GATE for the portal image rule.
//
// Fires on Write/Edit to production HTML (root *.html, partials/, _dev/templates/).
// Builds the file as it WOULD look after the tool call, runs the shared rule
// engine (scripts/lib/images.mjs), and DENIES the call if it introduces any
// image violation that was not already there. Pre-existing violations on
// unmigrated pages do not block unrelated edits; new ones always do.
//
// Why: the image rule existed only as docs + a manual tool from 2026-09-05 and
// was never applied (0 variants, 0 <picture> on 23 profiles, 62.8 MB of PNG/JPG
// masters). A rule nobody checks gets skipped, so this one is checked.
//
// Wired in .claude/settings.json under hooks.PreToolUse[matcher:"Write|Edit"].
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', c => raw += c);
process.stdin.on('end', async () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const ti = input.tool_input || {};
  const file = (ti.file_path || '').replace(/\\/g, '/');
  const root = (process.env.CLAUDE_PROJECT_DIR || input.cwd || '').replace(/\\/g, '/').replace(/\/$/, '');
  if (!file.endsWith('.html') || !root) process.exit(0);
  const rel = file.toLowerCase().startsWith(root.toLowerCase() + '/') ? file.slice(root.length + 1) : null;
  if (!rel || !(/^[^/]+\.html$/.test(rel) || /^partials\//.test(rel) || /^_dev\/templates\//.test(rel))) process.exit(0);

  let before = '';
  try { before = readFileSync(file, 'utf8'); } catch {}
  let after;
  if (input.tool_name === 'Write') after = ti.content || '';
  else if (input.tool_name === 'Edit') {
    if (!ti.old_string || !before.includes(ti.old_string)) process.exit(0); // Edit itself will fail
    after = ti.replace_all ? before.split(ti.old_string).join(ti.new_string) : before.replace(ti.old_string, () => ti.new_string);
  } else process.exit(0);
  if (!/<img\b/i.test(after)) process.exit(0);

  let audit;
  try { ({ audit } = await import(pathToFileURL(join(root, 'scripts/lib/images.mjs')).href)); }
  catch { process.exit(0); }

  const key = p => `${p.rule}|${p.tag}`;
  const count = list => list.reduce((m, p) => m.set(key(p), (m.get(key(p)) || 0) + 1), new Map());
  const old = count(audit(before));
  const fresh = [];
  for (const p of audit(after)) {
    const n = old.get(key(p)) || 0;
    if (n > 0) old.set(key(p), n - 1); else fresh.push(p);
  }
  if (!fresh.length) process.exit(0);

  const lines = fresh.slice(0, 12).map(p => `  L${p.line} [${p.rule}] ${p.msg}`).join('\n');
  const reason =
    `IMAGE RULE: this ${input.tool_name} adds ${fresh.length} non-compliant image(s) to ${rel}.\n${lines}\n\n` +
    'Every image must be optimised BEFORE it is used:\n' +
    '  1. Local source in brand_assets/ (never hotlink a brand site), then `npm run images:convert`.\n' +
    '  2. Markup as <picture> with AVIF + WebP srcset + sizes, <img> with width, height, alt,\n' +
    '     decoding="async", loading="lazy" (ATF only: fetchpriority="high").\n' +
    '  3. Get the exact markup: `node scripts/images.mjs snippet /brand_assets/<path> "<alt>" [--eager]`.\n' +
    '     Hotlinks / remote dims on an existing page: `npm run images` fixes them in place.\n' +
    'Rule engine: scripts/lib/images.mjs. Docs: docs/IMAGE-OPTIMIZATION.md.';
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
  process.exit(0);
});
