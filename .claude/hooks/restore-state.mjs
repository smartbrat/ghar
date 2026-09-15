#!/usr/bin/env node
// SessionStart (matcher: compact) hook.
// After auto-compaction the conversation is replaced by a summary, which can
// drop decisions. This re-injects the newest _dev/state/*.md working file plus
// a few lines of git context, so a long thread keeps its understanding without
// paying to keep the full history in context. Stdout is added to context.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Portable: Claude Code exposes $CLAUDE_PROJECT_DIR to hooks. Fall back to
// process.cwd() so a teammate on any platform gets the same behavior.
const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const DIR = path.join(ROOT, '_dev/state');
const MAX_CHARS = 6000;          // cap so the re-injection itself stays cheap
const FRESH_MS = 3 * 864e5;      // only auto-inject a state file touched in 3 days

const out = [];
try {
  const files = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => ({ f, t: fs.statSync(path.join(DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);

  if (files.length && Date.now() - files[0].t < FRESH_MS) {
    let body = fs.readFileSync(path.join(DIR, files[0].f), 'utf8');
    if (body.length > MAX_CHARS) body = body.slice(0, MAX_CHARS) + '\n[...truncated, Read the file for the rest]';
    out.push(`## Context restored after compaction: _dev/state/${files[0].f}`, body);
  }
  const others = files.slice(files.length && Date.now() - files[0].t < FRESH_MS ? 1 : 0, 8).map(x => x.f);
  if (others.length) out.push(`Other state files (Read only if the task needs them): ${others.join(', ')}`);
} catch { /* no state dir yet */ }

try {
  const log = execSync('git log --oneline -5', { cwd: ROOT, encoding: 'utf8', timeout: 3000 }).trim();
  const st = execSync('git status --short', { cwd: ROOT, encoding: 'utf8', timeout: 3000 }).trim().split('\n').slice(0, 15).join('\n');
  out.push('## Recent commits', log, '## Uncommitted (first 15)', st || '(clean)');
} catch { /* not fatal */ }

out.push('Reminder: keep the active _dev/state file updated as decisions land (see TOKEN DISCIPLINE in CLAUDE.md).');
process.stdout.write(out.join('\n') + '\n');
