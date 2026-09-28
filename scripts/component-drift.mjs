#!/usr/bin/env node
/**
 * component-drift.mjs: does the /components catalog still match what ships?
 *
 *   npm run components:drift            report every drifted component
 *   npm run components:drift -- <id>    one component, full detail
 *   npm run components:drift -- --json  machine-readable
 *   npm run components:drift -- --page=x.html  only components used on x.html
 *   npm run components:drift -- --strict  exit 1 on any drift (used by build)
 *
 * The catalog is copied by hand from production, so every page-level change
 * silently leaves it behind. This reads each paste component's @snippet and
 * @style and compares them against the root pages its signature matches:
 *
 *   markup   the class set inside the signature element, and the order of
 *            its direct children (catches "header moved", "field added")
 *            (classes outside the component's own BEM blocks are content and
 *            are ignored; set "container": true in @meta for pure wrappers)
 *   css      for status "inline" components, each @style rule against the
 *            same selector in the pages' own <style> blocks
 *   override for status "shared" components, page <style> rules that restyle
 *            the component's own classes (the chassis has forked on a page)
 *
 * A difference that is deliberate goes in @meta "driftIgnore": class names,
 * CSS selectors, or "order", and the reason goes in "notes". Never add an
 * entry to silence a real change: update the snippet instead.
 *
 * include components are rendered from partials/ and cannot drift; call
 * components are JS and are checked by build-components (api names).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '_dev/reference/components');
const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const STRICT = args.includes('--strict');
const ONLY = args.find(a => !a.startsWith('--'));
const PAGE = (args.find(a => a.startsWith('--page=')) || '').slice(7).split(/[\\/]/).pop();

/* ---------- parsing ---------- */
function blocks(text) {
  const out = {};
  const meta = text.match(/<!--\s*@meta\s*([\s\S]*?)-->/);
  out.meta = meta ? JSON.parse(meta[1]) : null;
  const re = /<!--\s*@([a-z-]+)\s*-->/g;
  const marks = [];
  let m;
  while ((m = re.exec(text))) marks.push({ name: m[1], start: m.index, end: re.lastIndex });
  marks.forEach((mk, i) => { out[mk.name] = text.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : text.length).trim(); });
  return out;
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const stripNoise = s => s.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
const TAG = /<\/?([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const classesOf = attrs => ((attrs.match(/\bclass\s*=\s*"([^"]*)"/) || [])[1] || '').split(/\s+/).filter(Boolean);

/** Every subtree whose root matches `sig`: { classes:Set, kids:[firstClass of each direct child] } */
function subtrees(html, sig) {
  const attrRe = sig.attr && new RegExp(`\\s${sig.attr}(?=[\\s=>/]|$)`);
  const hit = (attrs, cl) => (attrRe ? attrRe.test(attrs) : cl.includes(sig.cls));
  html = stripNoise(html);
  const found = [];
  const stack = []; // { tag, capture? }
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    const [raw, name, attrs] = m;
    const tag = name.toLowerCase();
    const closing = raw[1] === '/';
    if (closing) {
      while (stack.length) { const top = stack.pop(); if (top.tag === tag) break; }
      continue;
    }
    const cl = classesOf(attrs);
    // record into every open capture
    for (const fr of stack) if (fr.cap) cl.forEach(c => fr.cap.classes.add(c));
    const parentCap = stack.length && stack[stack.length - 1].cap;
    if (parentCap) parentCap.kids.push(cl[0] ? '.' + cl[0] : tag);
    const selfClosing = VOID.has(tag) || /\/\s*$/.test(attrs);
    let cap = null;
    if (hit(attrs, cl)) { cap = { classes: new Set(cl), kids: [] }; found.push(cap); }
    if (!selfClosing) stack.push({ tag, cap });
  }
  return found;
}

const pageStyles = html => [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(x => x[1]).join('\n');

function rules(css) {
  const map = new Map();
  try {
    postcss.parse(css).walkRules(r => {
      const inAt = r.parent && r.parent.type === 'atrule' ? '@' + r.parent.name + ' ' + r.parent.params + ' ' : '';
      const decls = [];
      r.walkDecls(d => decls.push(d.prop + ':' + d.value.replace(/\s+/g, ' ').trim() + (d.important ? '!' : '')));
      for (const sel of r.selectors) map.set(inAt + sel.replace(/\s+/g, ' ').trim(), decls.sort().join(';'));
    });
  } catch { /* a page with a broken block: skip it, build:styles reports it */ }
  return map;
}

/* ---------- pages ---------- */
/* Pages still under development are not a source of truth for the catalog:
   their markup and CSS are in flux, so nothing is synced FROM them and they
   never count as drift. Remove a page from this list once it is signed off. */
const WIP_PAGES = new Set([
  'brand-connect.html', // Brand Connect refit, in development (user, 2026-09-24)
]);

const PAGES = readdirSync(ROOT).filter(f => f.endsWith('.html') && !WIP_PAGES.has(f)).map(f => {
  const body = readFileSync(join(ROOT, f), 'utf8');
  return { f, body, css: null };
});
const cssOf = p => (p.css ??= rules(pageStyles(p.body)));

/* ---------- compare ---------- */
/** BEM block of a class: "jm" for jm-hdr, "art-card" for art-card__body */
const block = c => c.includes('__') ? c.split('__')[0] : c.split('-')[0];
/** ".a > .a > .a > .b" -> ".a+ > .b": repeated cards are content, not structure */
const collapse = kids => kids.filter((k, i) => k !== kids[i - 1]).map((k, i, a) => kids.filter(x => x === k).length > 1 && a.indexOf(k) === i ? k + '+' : k).join(' > ');

/** ".x" or a bare "x__y" is a class; "[data-x]" is an attribute. Anything else is not markup. */
function parseSig(sig) {
  let m;
  if ((m = /^\.?([a-zA-Z][\w-]*)$/.exec(sig || ''))) return { cls: m[1], re: new RegExp(`class\\s*=\\s*"[^"]*(?<![\\w-])${m[1]}(?![\\w-])`) };
  if ((m = /^\[([\w-]+)\]$/.exec(sig || ''))) return { attr: m[1], re: new RegExp(`\\s${m[1]}(?=[\\s=>/])`) };
  return null;
}

function check(meta, b) {
  const r = { id: meta.id, kind: meta.kind, status: meta.status, pages: 0, added: [], removed: [], order: null, css: [], overrides: [] };
  /* include: the markup is generated from partials/, so it cannot drift, but
     a page can restyle the partial's elements in its own <style>. Then the
     real design lives in N page copies and the catalog (which loads only
     shared CSS) shows the old one. Report it as a fork. */
  if (meta.kind === 'include' && meta.partial) {
    const src = join(ROOT, 'partials', meta.partial + '.html');
    if (!existsSync(src)) return r;
    const ids = [...new Set([...readFileSync(src, 'utf8').matchAll(/\bid="([\w-]+)"/g)].map(x => x[1]))];
    if (!ids.length) return r;
    const idRe = new RegExp(`#(${ids.join('|')})(?![\\w-])`);
    const using = PAGES.filter(p => p.body.includes(`PARTIAL ${meta.partial}:start`));
    if (PAGE && !using.some(p => p.f === PAGE)) return r;
    r.pages = using.length;
    for (const p of using) {
      const hits = [...cssOf(p).keys()].filter(s => idRe.test(s));
      if (hits.length) r.overrides.push({ page: p.f, selectors: hits.length });
    }
    return r;
  }
  const sig = parseSig(meta.signature);
  if (meta.kind !== 'paste' || !sig) return r;
  const cls = sig.cls;
  const hook = new Set([...(meta.hookClasses || []), ...(meta.driftIgnore || [])]);
  const ignoreOrder = (meta.driftIgnore || []).includes('order');
  const snip = subtrees(b.snippet || '', sig);
  const using = PAGES.filter(p => sig.re.test(p.body));
  if (PAGE && !using.some(p => p.f === PAGE)) return r;
  r.pages = using.length;
  if (!using.length) return r;

  /* markup */
  const snipSet = new Set(snip.flatMap(s => [...s.classes]));
  const blocks_ = new Set([...snipSet].map(block));
  const count = new Map();
  const orders = new Map();
  for (const p of using) {
    const trees = subtrees(p.body, sig);
    const seen = new Set(trees.flatMap(t => [...t.classes]));
    seen.forEach(c => count.set(c, (count.get(c) || 0) + 1));
    // every instance counts, not just the first: a partial early in the page
    // (the mobile search modal) must not stand in for what the page ships
    for (const t of trees) { const k = collapse(t.kids); orders.set(k, (orders.get(k) || 0) + 1); }
  }
  if (snip.length) {
    const half = Math.max(1, Math.ceil(using.length / 2));
    const isVariant = c => /--|^is-|^has-|^js-/.test(c);
    r.added = [...count].filter(([c, n]) => n >= half && !snipSet.has(c) && !hook.has(c) && !isVariant(c) && blocks_.has(block(c)) && !meta.container).map(([c, n]) => `${c} (${n}/${using.length})`);
    r.removed = [...snipSet].filter(c => !count.has(c) && !hook.has(c) && !isVariant(c)).sort();
    const top = [...orders].sort((a, b2) => b2[1] - a[1])[0];
    const snipOrders = snip.map(t => collapse(t.kids));
    const snipOrder = snipOrders[0];
    const instances = [...orders.values()].reduce((a, n) => a + n, 0);
    const bare = o => o.replaceAll('+', '');
    if (!ignoreOrder && top && top[0] && snipOrder && !snipOrders.some(o => bare(o) === bare(top[0])) && top[1] >= Math.ceil(instances / 2))
      r.order = { snippet: snipOrder, production: top[0], pages: top[1] + ' of ' + instances + ' instances' };
  }

  /* css */
  if (meta.status === 'inline' && b.style) {
    const mine = rules(b.style);
    for (const [sel, decl] of mine) {
      const variants = new Map();
      for (const p of using) { const d = cssOf(p).get(sel); if (d !== undefined) variants.set(d, [...(variants.get(d) || []), p.f]); }
      if (!variants.size) continue;
      const top = [...variants].sort((a, b2) => b2[1].length - a[1].length)[0];
      // a rule only drifts when MOST pages using the component disagree; one tenant
      // overriding a value on top of the shared rule is that page's business
      if (top[0] !== decl && !hook.has(sel) && top[1].length >= Math.ceil(using.length / 2)) r.css.push({ selector: sel, pages: top[1].length, snippet: decl, production: top[0] });
    }
  } else if (meta.status === 'shared' && cls) {
    for (const p of using) {
      const hits = [...cssOf(p).keys()].filter(s => new RegExp(`\\.${cls}(?![\\w-])`).test(s));
      if (hits.length) r.overrides.push({ page: p.f, selectors: hits.length });
    }
  }
  return r;
}

/* ---------- run ---------- */
const files = readdirSync(SRC).filter(f => f.endsWith('.html') && !f.startsWith('_'));
const results = [];
for (const f of files) {
  const b = blocks(readFileSync(join(SRC, f), 'utf8'));
  if (!b.meta || (ONLY && b.meta.id !== ONLY)) continue;
  const r = check(b.meta, b);
  r.drift = r.added.length + r.removed.length + (r.order ? 1 : 0) + r.css.length;
  results.push(r);
}

const drifted = results.filter(r => r.drift).sort((a, b) => b.drift - a.drift);
const forked = results.filter(r => r.overrides.length >= 2);

if (JSON_OUT) { console.log(JSON.stringify({ drifted, forked }, null, 2)); }
else {
  const clip = s => (s.length > 160 && !ONLY ? s.slice(0, 157) + '...' : s);
  console.log(`component-drift: ${results.length} checked, ${drifted.length} drifted from production, ${forked.length} restyled on 2+ pages\n`);
  for (const r of drifted) {
    console.log(`■ ${r.id}  (${r.status}, ${r.pages} page${r.pages === 1 ? '' : 's'})`);
    if (r.added.length) console.log(`   in production, not in @snippet: ${clip(r.added.join(', '))}`);
    if (r.removed.length) console.log(`   in @snippet, on no page:         ${clip(r.removed.join(', '))}`);
    if (r.order) console.log(`   child order differs (${r.order.pages})\n     snippet:    ${clip(r.order.snippet)}\n     production: ${clip(r.order.production)}`);
    for (const c of r.css.slice(0, ONLY ? 99 : 4)) console.log(`   css ${c.selector} differs on ${c.pages} page(s)${ONLY ? `\n     snippet:    ${c.snippet}\n     production: ${c.production}` : ''}`);
    if (!ONLY && r.css.length > 4) console.log(`   ...and ${r.css.length - 4} more css rules`);
  }
  if (forked.length) {
    console.log(`\nShared components restyled inside page <style> blocks (fork candidates):`);
    for (const r of forked) console.log(`   ${r.id}: ${r.overrides.length} pages, e.g. ${r.overrides.slice(0, 3).map(o => `${o.page} (${o.selectors})`).join(', ')}`);
  }
}
if (STRICT && drifted.length) process.exit(1);
