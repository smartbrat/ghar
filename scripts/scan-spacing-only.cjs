/* Scan for CSS rules whose body is ONLY margin-* / padding-* declarations.
   These are the worst kind of per-section drift — a fresh class name for
   nothing more than a margin value, with each section picking a slightly
   different clamp(). User flagged these as a BIG PROBLEM 2026-06-09.

   Usage:  node scripts/scan-spacing-only.cjs <file>
*/
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/scan-spacing-only.cjs <file>'); process.exit(1); }
const raw = fs.readFileSync(file, 'utf8');

let css;
if (file.endsWith('.html')) {
  const blocks = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  css = blocks.join('\n');
} else {
  css = raw;
}
css = css.replace(/\/\*[\s\S]*?\*\//g, '');

// Parse top-level rules + recurse into @media.
const rules = [];
function walk(src, ctx) {
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    let depth = 0, sel = '';
    while (i < src.length) {
      const c = src[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === '{' && depth === 0) break;
      else if (c === ';' && depth === 0) { i++; sel = ''; break; }
      sel += c; i++;
    }
    if (i >= src.length || src[i] !== '{') continue;
    let bDepth = 1; i++;
    const bodyStart = i;
    while (i < src.length && bDepth > 0) {
      if (src[i] === '{') bDepth++;
      else if (src[i] === '}') bDepth--;
      if (bDepth > 0) i++;
    }
    const body = src.slice(bodyStart, i);
    i++;
    const trimSel = sel.trim();
    if (/^@(media|supports|container)\b/.test(trimSel)) {
      walk(body, ctx ? `${ctx} ${trimSel}` : trimSel);
    } else if (/^@/.test(trimSel)) {
      // skip
    } else {
      rules.push({ sel: trimSel, body: body.trim(), ctx: ctx || '' });
    }
  }
}
walk(css, '');

// Decl filter: a rule is "spacing-only" if every declaration is margin-* or padding-*.
function isSpacingOnly(body) {
  const decls = body.split(';').map(d => d.trim()).filter(Boolean);
  if (decls.length === 0) return false;
  for (const d of decls) {
    const name = d.split(':')[0].trim();
    if (!/^(margin|padding)(-(top|right|bottom|left))?$/.test(name)) return false;
  }
  return true;
}

const spacingRules = rules.filter(r => isSpacingOnly(r.body));

// Group by normalized body (whitespace-collapsed) so we surface near-duplicates
// where different sections use almost-identical values.
function normBody(b) {
  return b.split(';').map(d => d.replace(/\s+/g, ' ').trim()).filter(Boolean).sort().join(';');
}

// Group by (ctx, property-set-only) — declarations stripped of values — so we can find
// rules that set the SAME property (e.g. all "margin-bottom: <something>") with
// different value clamps. Those are the user's flagged case.
function propertySet(body) {
  return body.split(';')
    .map(d => d.split(':')[0].trim())
    .filter(Boolean)
    .sort()
    .join(',');
}

const byProperty = new Map();
for (const r of spacingRules) {
  const key = (r.ctx || 'BASE') + ' | ' + propertySet(r.body);
  if (!byProperty.has(key)) byProperty.set(key, []);
  byProperty.get(key).push(r);
}

const groups = [...byProperty.entries()]
  .filter(([_, arr]) => arr.length >= 2)
  .map(([key, arr]) => ({ key, arr, count: arr.length }))
  .sort((a, b) => b.count - a.count);

console.log(`\nFile: ${file}`);
console.log(`Total spacing-only rules (body = margin-*/padding-* only): ${spacingRules.length}`);
console.log(`Groups (≥2 selectors setting the same property set): ${groups.length}\n`);

for (let i = 0; i < Math.min(20, groups.length); i++) {
  const g = groups[i];
  const [ctx, props] = g.key.split(' | ');
  console.log(`── #${i + 1} — ${g.count} selectors set [${props}]  ctx: ${ctx === 'BASE' ? '(base)' : ctx}`);
  for (const r of g.arr) {
    console.log(`     ${r.sel.replace(/\s+/g, ' ').slice(0, 80).padEnd(80)}  →  ${r.body.replace(/\s+/g, ' ').trim()}`);
  }
  console.log();
}
