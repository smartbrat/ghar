/* CSS duplicate-rule scanner.
   Groups CSS rules by a normalized body signature so we can find
   "same body, different selector" duplicates across a single file
   (styles.css for the shared chassis, or a page-scoped inline block).

   Usage:  node scripts/scan-dupes.cjs <path-to-css-or-html>
*/
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/scan-dupes.cjs <file>'); process.exit(1); }
const raw = fs.readFileSync(file, 'utf8');

// If HTML, pull all <style>...</style> blocks; if CSS, use as-is.
let css;
if (file.endsWith('.html')) {
  const blocks = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  css = blocks.join('\n');
} else {
  css = raw;
}

// Strip comments.
css = css.replace(/\/\*[\s\S]*?\*\//g, '');

// Walk top-level rules. We only flatten ONE level of nesting (i.e. @media blocks).
const rules = [];
function pushRule(sel, body, ctx) {
  rules.push({ sel: sel.trim(), body: body.trim(), ctx });
}
function walk(src, ctx) {
  let i = 0;
  while (i < src.length) {
    // skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    // find selector up to { (respecting parens, since (max-width:...) inside @media)
    let depth = 0, sel = '', start = i;
    while (i < src.length) {
      const c = src[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === '{' && depth === 0) break;
      else if (c === ';' && depth === 0) { // @import / @charset / etc. ends with ;
        i++;
        sel = '';
        break;
      }
      sel += c;
      i++;
    }
    if (i >= src.length || src[i] !== '{') continue;
    // find matching close brace
    let bDepth = 1; i++;
    let bodyStart = i;
    while (i < src.length && bDepth > 0) {
      if (src[i] === '{') bDepth++;
      else if (src[i] === '}') bDepth--;
      if (bDepth > 0) i++;
    }
    const body = src.slice(bodyStart, i);
    i++; // skip closing }
    const trimmedSel = sel.trim();
    if (/^@(media|supports|container)\b/.test(trimmedSel)) {
      // recurse into the block
      walk(body, ctx ? `${ctx} ${trimmedSel}` : trimmedSel);
    } else if (/^@(keyframes|font-face|page|property|layer|charset|import|namespace)/.test(trimmedSel)) {
      // skip — not a "declarations" rule
    } else {
      pushRule(trimmedSel, body, ctx || '');
    }
  }
}
walk(css, '');

// Normalize body: drop whitespace, sort declarations.
function normBody(b) {
  return b
    .split(';')
    .map(d => d.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .sort()
    .join(';');
}

// Group by (ctx, normBody) so that an @media body and a base body don't collide.
const groups = new Map();
for (const r of rules) {
  // Selectors may be a comma list; split so each piece counts independently.
  // But for dupe detection we want to flag rules where the WHOLE body matches.
  const key = (r.ctx || 'BASE') + '||' + normBody(r.body);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}

// Print dupe groups sorted by impact (count × body length).
const dupeGroups = [...groups.entries()]
  .filter(([_, arr]) => arr.length >= 2)
  .map(([key, arr]) => {
    const bodyLen = arr[0].body.length;
    return { key, arr, score: arr.length * bodyLen };
  })
  .sort((a, b) => b.score - a.score);

console.log(`\nFile: ${file}`);
console.log(`Total rules: ${rules.length}`);
console.log(`Dupe groups (≥2 selectors w/ identical body): ${dupeGroups.length}\n`);

const limit = +(process.argv[3] || 25);
for (let i = 0; i < Math.min(limit, dupeGroups.length); i++) {
  const g = dupeGroups[i];
  const [ctx] = g.key.split('||');
  console.log(`── #${i + 1}  (${g.arr.length} selectors, body ${g.arr[0].body.replace(/\s+/g, ' ').trim().length} chars)  ctx: ${ctx === 'BASE' ? '(base)' : ctx}`);
  for (const r of g.arr) console.log(`     ${r.sel.replace(/\s+/g, ' ').slice(0, 110)}`);
  console.log(`     body: ${g.arr[0].body.replace(/\s+/g, ' ').trim().slice(0, 160)}`);
  console.log();
}
