#!/usr/bin/env node
// PostToolUse hook: keep the /components catalog in step with production.
//
// After a Write/Edit to a root page (*.html outside _dev/), runs
// scripts/component-drift.mjs for the components that page uses. If any no
// longer match what ships, the result is injected into context so the
// component source is updated in the SAME session, not "later".
//
// After a Write/Edit to a component source (_dev/reference/components/<id>.html)
// it re-checks that one component, so the loop closes with a clear "in sync".
//
// Why: the catalog is copied by hand. Page work kept moving (modal headers,
// forms, B2B sections) and nothing checked the copies, so /components
// quietly went stale. Wired in .claude/settings.json hooks.PostToolUse.

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', c => (raw += c));
process.stdin.on('end', () => {
  let file = '';
  try { file = (JSON.parse(raw).tool_input || {}).file_path || ''; } catch { process.exit(0); }
  const norm = file.replace(/\\/g, '/');
  const root = (process.env.CLAUDE_PROJECT_DIR || process.cwd()).replace(/\\/g, '/').replace(/\/$/, '');
  if (!norm.toLowerCase().startsWith(root.toLowerCase() + '/')) process.exit(0);
  const rel = norm.slice(root.length + 1);

  const isPage = /^[^/]+\.html$/.test(rel);
  const comp = rel.match(/^_dev\/reference\/components\/([^_/][^/]*)\.html$/);
  if (!isPage && !comp) process.exit(0);

  const args = [join(root, 'scripts/component-drift.mjs'), '--json', isPage ? `--page=${rel}` : comp[1]];
  let out;
  try { out = JSON.parse(execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 20000 })); }
  catch { process.exit(0); }

  const d = out.drifted || [];
  let msg;
  if (comp) {
    msg = d.length
      ? `component-drift: "${comp[1]}" still differs from production. Run \`node scripts/component-drift.mjs ${comp[1]}\` for the detail.`
      : `component-drift: "${comp[1]}" now matches production. Run \`npm run build:components\` before committing.`;
  } else {
    if (!d.length) process.exit(0);
    const lines = d.slice(0, 8).map(r => {
      const bits = [];
      if (r.added.length) bits.push(`new in production: ${r.added.slice(0, 4).join(', ')}`);
      if (r.removed.length) bits.push(`gone from production: ${r.removed.slice(0, 4).join(', ')}`);
      if (r.order) bits.push(`child order now ${r.order.production}`);
      if (r.css.length) bits.push(`${r.css.length} CSS rule(s) differ, e.g. ${r.css[0].selector}`);
      return `  - ${r.id}: ${bits.join('; ')}`;
    });
    msg =
      `════ COMPONENT CATALOG OUT OF SYNC (${rel}) ════\n` +
      `${d.length} component(s) used on this page no longer match their /components source:\n` +
      lines.join('\n') + (d.length > 8 ? `\n  ...and ${d.length - 8} more` : '') +
      `\n\nIf this edit changed a shared pattern, update _dev/reference/components/<id>.html NOW ` +
      `(@snippet, @style, api, notes), plus the matching design-system.html section, then ` +
      `\`npm run build:components\`. Detail: \`node scripts/component-drift.mjs <id>\`. ` +
      `If the difference is deliberate and page-specific, add it to that component's "driftIgnore" with the reason in "notes". ` +
      `Mid-edit on a page you are still changing: finish the page first, but do not end the task with drift open.`;
  }
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msg } }));
});
