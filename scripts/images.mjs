#!/usr/bin/env node
/**
 * scripts/images.mjs: enforce the portal image rule (scripts/lib/images.mjs).
 *
 *   node scripts/images.mjs audit [--strict] [files...]   report violations
 *   node scripts/images.mjs apply [--dry] [files...]      mechanical fixes
 *   node scripts/images.mjs localize [files...]            hotlinks -> brand_assets/
 *   node scripts/images.mjs probe [files...]               width/height for remote imgs
 *   node scripts/images.mjs snippet <src> "<alt>" [--eager] compliant markup for one image
 *
 * Files default to STRICT_SET (pages already migrated, and the build fails on
 * them). `audit --all` reports every root page. Move a page into STRICT_SET
 * once `apply` + hand fixes leave it clean: the set only ever grows.
 *
 * npm run images           localize + convert + apply + probe + strict audit
 * npm run images:audit     strict audit (part of npm run build)
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, dirname } from 'node:path';
import { ROOT, MANIFEST_PATH, audit, apply } from './lib/images.mjs';

// Some brand sites (Scarlet Splendour) 403 a bare Node fetch.
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36', accept: 'image/avif,image/webp,image/*,*/*;q=0.8' };

// Node fetch first; some CDNs (Cloudflare on scarletsplendour.com) 403 Node's
// TLS fingerprint but serve curl, so fall back to it.
async function download(url) {
  const res = await fetch(url, { headers: UA }).catch(() => null);
  if (res && res.ok) return Buffer.from(await res.arrayBuffer());
  try {
    return execFileSync('curl', ['-sSfL', '-A', UA['user-agent'], '-H', `Accept: ${UA.accept}`, url], { maxBuffer: 64 << 20 });
  } catch { throw new Error(`HTTP ${res ? res.status : 'error'}`); }
}

// Every root page since 2026-09-16 (all 55 migrated, 0 violations).
export const STRICT_GLOBS = [/\.html$/];
const TEMPLATE_DIR = '_dev/templates';

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter(a => a.startsWith('--')));
let files = rest.filter(a => !a.startsWith('--'));

const rootHtml = readdirSync(ROOT).filter(f => f.endsWith('.html'));
if (!files.length) {
  files = flags.has('--all')
    ? rootHtml
    : [...rootHtml.filter(f => STRICT_GLOBS.some(re => re.test(f))),
       ...readdirSync(join(ROOT, TEMPLATE_DIR)).filter(f => f.endsWith('.html')).map(f => `${TEMPLATE_DIR}/${f}`)];
}

if (cmd === 'apply') {
  let changed = 0;
  for (const f of files) {
    const path = join(ROOT, f);
    const before = readFileSync(path, 'utf8');
    // --rewrap: unwrap the <picture> blocks apply() itself emitted (exact
    // shape) and rebuild them, so slot sizes or new variants reach pages
    // wrapped by an older rule. Hand-authored <picture> markup never matches.
    const input = flags.has('--rewrap')
      ? before.replace(/<picture><source type="image\/avif" srcset="[^"]*" sizes="[^"]*"><source type="image\/webp" srcset="[^"]*" sizes="[^"]*">(<img\b(?:[^>"']|"[^"]*"|'[^']*')*>)<\/picture>/g, '$1')
      : before;
    const after = apply(input);
    if (apply(after) !== after) {
      console.error(`NOT IDEMPOTENT, nothing written: ${f}. Fix scripts/lib/images.mjs first.`);
      process.exit(1);
    }
    if (after === before) continue;
    changed++;
    const pics = (after.match(/<picture\b/g) || []).length - (before.match(/<picture\b/g) || []).length;
    console.log(`${flags.has('--dry') ? 'would fix' : 'fixed'}  ${f}  (+${pics} <picture>)`);
    if (!flags.has('--dry')) writeFileSync(path, after, 'utf8');
  }
  console.log(`${changed} file(s) ${flags.has('--dry') ? 'would change' : 'changed'}`);
} else if (cmd === 'snippet') {
  // Compliant markup for one converted image: snippet <src> "<alt>" [--eager]
  const [rawSrc, alt = ''] = rest.filter(a => !a.startsWith('--'));
  // Git Bash rewrites /brand_assets/x into C:/Program Files/Git/brand_assets/x.
  const src = (rawSrc || '').replace(/^[A-Za-z]:\/.*?(?=\/(brand_assets|kit-assets)\/)/, '');
  const eager = flags.has('--eager');
  const tag = `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  const out = apply(tag);
  const probs = audit(out);
  console.log(out);
  if (probs.length) { console.error(probs.map(p => `[${p.rule}] ${p.msg}`).join('\n')); process.exit(1); }
} else if (cmd === 'localize') {
  await localize(files);
} else if (cmd === 'probe') {
  await probe(files);
} else if (cmd === 'audit') {
  const byRule = {};
  let total = 0;
  for (const f of files) {
    const probs = audit(readFileSync(join(ROOT, f), 'utf8'));
    if (!probs.length) continue;
    total += probs.length;
    console.log(`\n${relative(ROOT, join(ROOT, f))}  ${probs.length}`);
    for (const p of probs) {
      byRule[p.rule] = (byRule[p.rule] || 0) + 1;
      if (!flags.has('--summary')) console.log(`  L${p.line}  [${p.rule}] ${p.msg}`);
    }
  }
  console.log(`\n${total} image violation(s) in ${files.length} file(s)`, byRule);
  if (total && flags.has('--strict')) {
    console.error('\nImage rule failed. Run `npm run images`, then fix what remains by hand (see docs/IMAGE-OPTIMIZATION.md).');
    process.exit(1);
  }
} else {
  console.log('usage: node scripts/images.mjs audit|apply|localize|probe|snippet [--strict|--dry|--all|--summary] [files...]');
  process.exit(2);
}

// ── localize: hotlinked rasters → brand_assets/, src rewritten ─────────
// brand-profile-<slug> → brand_assets/brands/<slug>/, ghar.tv CMS →
// brand_assets/ghartv/, anything else → brand_assets/remote/<host>/.
// Also rewrites the person-profile data file so the generator agrees.
async function localize(list) {
  const sharp = (await import('sharp')).default;
  const DATA = 'scripts/person-profile-data.mjs';
  const map = new Map();
  for (const f of list) {
    for (const p of audit(readFileSync(join(ROOT, f), 'utf8')).filter(p => p.rule === 'hotlink')) {
      if (map.has(p.src)) continue;
      const u = new URL(p.src);
      const slug = (f.match(/brand-profile-([\w-]+)\.html$/) || [])[1];
      const dir = /(^|\.)ghar\.tv$/.test(u.hostname) ? 'brand_assets/ghartv'
        : slug ? `brand_assets/brands/${slug}` : `brand_assets/remote/${u.hostname}`;
      map.set(p.src, `${dir}/${decodeURIComponent(u.pathname.split('/').pop())}`);
    }
  }
  for (const [url, rel] of map) {
    let buf;
    try { buf = await download(url); }
    catch (e) { console.error(`FAIL ${e.message} ${url}`); map.delete(url); continue; }
    // Block pages come back 200 as HTML: never save one under an image name
    // (brand-photos/scarlet-signature.avif was exactly that).
    try { await sharp(buf).metadata(); }
    catch { console.error(`FAIL not an image ${url}`); map.delete(url); continue; }
    mkdirSync(join(ROOT, dirname(rel)), { recursive: true });
    writeFileSync(join(ROOT, rel), buf);
    console.log(`downloaded ${rel}`);
  }
  for (const f of [...list, DATA]) {
    const path = join(ROOT, f);
    let s = readFileSync(path, 'utf8');
    const before = s;
    for (const [url, rel] of map) s = s.split(url).join(`/${rel}`).split(url.replace(/&/g, '&amp;')).join(`/${rel}`);
    if (s !== before) { writeFileSync(path, s, 'utf8'); console.log(`rewrote ${f}`); }
  }
  console.log(`${map.size} image(s) localised. Next: npm run images`);
}

// ── probe: real width/height for remote images, cached in the manifest ─
async function probe(list) {
  const sharp = (await import('sharp')).default;
  const urls = new Set();
  for (const f of list) {
    for (const p of audit(readFileSync(join(ROOT, f), 'utf8'))) {
      if (p.rule === 'dimensions' && /^https?:/i.test(p.src)) urls.add(p.src);
    }
  }
  let man = {};
  try { man = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); } catch {}
  const todo = [...urls].filter(u => !man[u]);
  let next = 0, ok = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (next < todo.length) {
      const u = todo[next++];
      try {
        const meta = await sharp(await download(u)).metadata();
        man[u] = { width: meta.width, height: meta.height, remote: true };
        ok++;
      } catch (e) { console.error(`probe fail ${e.message} ${u.slice(0, 90)}`); }
    }
  }));
  writeFileSync(MANIFEST_PATH, JSON.stringify(man, null, 2), 'utf8');
  console.log(`probed ${ok}/${todo.length} remote image(s) (${urls.size - todo.length} cached)`);
}
