/* Scan for CSS rules whose body is a SINGLE declaration. The biggest
   source of drift is per-section class names whose body is just one
   property — a margin, a color, a transform. Group by the property
   name to surface every place that role recurs.

   Usage:  node scripts/scan-single-prop.cjs <file>
*/
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage'); process.exit(1); }
const raw = fs.readFileSync(file, 'utf8');

let css;
if (file.endsWith('.html')) {
  const blocks = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  css = blocks.join('\n');
} else {
  css = raw;
}
css = css.replace(/\/\*[\s\S]*?\*\//g, '');

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

// Filter: a rule is "single-property" if its body has exactly ONE declaration.
function declCount(body) {
  return body.split(';').map(d => d.trim()).filter(Boolean).length;
}
function singleProp(body) {
  return body.split(';').map(d => d.trim()).filter(Boolean)[0]?.split(':')[0]?.trim();
}
function singleValue(body) {
  const d = body.split(';').map(d => d.trim()).filter(Boolean)[0] || '';
  return d.split(':').slice(1).join(':').trim();
}

const singles = rules.filter(r => declCount(r.body) === 1);

// Group by (property, context) — IGNORING value — so rules touching the SAME
// property in the SAME context but with DIFFERENT values surface together.
// These are the "different prefix, slightly different value" pattern.
const groups = new Map();
for (const r of singles) {
  const key = (r.ctx || 'BASE') + ' | ' + singleProp(r.body);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}

const sorted = [...groups.entries()]
  .map(([key, arr]) => ({ key, arr }))
  .filter(g => g.arr.length >= 3) // only flag where there are at least 3 instances of same property
  .sort((a, b) => b.arr.length - a.arr.length);

console.log(`\nFile: ${file}`);
console.log(`Single-property rules: ${singles.length}`);
console.log(`Property-groups with ≥3 instances: ${sorted.length}\n`);

for (let i = 0; i < Math.min(30, sorted.length); i++) {
  const g = sorted[i];
  const [ctx, prop] = g.key.split(' | ');
  console.log(`── ${prop}  (${g.arr.length} rules in ${ctx === 'BASE' ? '(base)' : ctx})`);

  // Show values, grouped by value so we can see the drift
  const byValue = new Map();
  for (const r of g.arr) {
    const v = singleValue(r.body);
    if (!byValue.has(v)) byValue.set(v, []);
    byValue.get(v).push(r.sel);
  }
  const vs = [...byValue.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [v, sels] of vs) {
    console.log(`     value: ${v.padEnd(40)}  ${sels.length} sels`);
    for (const s of sels) {
      console.log(`         ${s.replace(/\s+/g, ' ').slice(0, 90)}`);
    }
  }
  console.log();
}
