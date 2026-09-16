/**
 * scripts/lib/images.mjs
 *
 * THE image rule engine for Ghar.tv. One source of truth, read by:
 *   scripts/images.mjs                 (audit + apply codemod)
 *   scripts/build-person-profiles.mjs  (generator output)
 *   .claude/hooks/image-guard.mjs      (blocks non-compliant writes)
 *
 * THE RULE (docs/IMAGE-OPTIMIZATION.md). Every raster <img> must:
 *   local-picture   local PNG/JPG/WebP sits in <picture> with AVIF + WebP srcset
 *   variants        those variants exist on disk (run npm run images:convert)
 *   dimensions      carries width + height (zero CLS)
 *   alt             carries an alt attribute ("" only for decorative)
 *   loading         loading="lazy", or eager/fetchpriority="high" for ATF only
 *   decoding        decoding="async"
 *   cdn-params      Unsplash has auto=format + w; Pexels has auto=compress + w
 *   hotlink         no raster hotlinked from a brand's own site: download it
 *                   into brand_assets/ and convert it
 *
 * JS-fed images (data-src / data-thumb, e.g. the gallery stage) get the same
 * cdn-params / hotlink / variants checks, plus:
 *   data-variant    a local master must be pointed at a WebP variant
 *                   (apply does it: thumb <=640w, src <=2560w)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const WIDTHS = [640, 1280, 2560];

const RASTER = /\.(png|jpe?g|webp|avif|gif)$/i;
// External hosts allowed as-is: placeholders, flags, YouTube thumbs
// (already optimised by the host), icon CDNs.
const HOST_ALLOW = /^https?:\/\/(placehold\.co|flagcdn\.com|i\.ytimg\.com|img\.youtube\.com|unpkg\.com|cdn\.jsdelivr\.net)\//i;

// Slot → sizes. Matched against the markup just before the <img>, nearest
// wins. Widths measured in the browser (see _dev/state/image-optimization.md).
export { HOST_ALLOW };
export const SLOT_SIZES = [
  [/bpr-hero__bg/, '100vw'],
  [/pp-portrait/, '(min-width: 744px) 380px, 100vw'],
  // Intrinsic-width logo tiles (width:auto, capped by max-width 240).
  [/__logo\b/, '240px'],
];
// Widest measured card is ~610px at 1440 (1-3 col grids); 40vw keeps
// non-Chrome browsers on the 640 variant at 1x, 1280 at 2x.
const LAZY_FALLBACK = '(min-width: 1024px) 40vw, 100vw';

let manifestCache;
export const MANIFEST_PATH = join(ROOT, 'brand_assets', 'image-manifest.json');
export function manifest() {
  if (manifestCache) return manifestCache;
  try { manifestCache = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); }
  catch { manifestCache = {}; }
  return manifestCache;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
};
const hasAttr = (tag, name) => new RegExp(`\\s${name}(\\s*=|[\\s/>])`, 'i').test(tag);
const addAttr = (tag, s) => tag.replace(/\s*\/?>$/, m => ` ${s}${m.trim() === '/>' ? ' />' : '>'}`);

const isLocal = src => src && !/^(https?:|data:|\/\/)/i.test(src) && RASTER.test(src.split('?')[0]);
const isDynamic = src => !src || src.includes('${') || src.includes('{{');

export const SOURCE_RE = /\.(png|jpe?g|webp|avif)$/i;
export const VARIANT_RE = /-\d{2,4}\.(webp|avif)$/i;

/**
 * Variant stem for a source. `hero.png` → `hero`, unless a sibling source
 * shares the stem (`hero.jpg`), then `hero-png`, so different images never
 * overwrite each other's variants. Used by the converter AND the markup.
 */
export function variantStem(fileName, siblings) {
  const stem = basename(fileName, extname(fileName));
  const clash = siblings.some(f => f !== fileName && SOURCE_RE.test(f) && !VARIANT_RE.test(f)
    && basename(f, extname(f)) === stem);
  return clash ? `${stem}-${extname(fileName).slice(1).toLowerCase()}` : stem;
}

/** Variants on disk for a local src: { avif:[{w,url}], webp:[{w,url}] } */
const dirCache = new Map();
export function variantsFor(src) {
  const clean = src.split(/[?#]/)[0];
  const rel = clean.replace(/^\//, '');
  const dir = dirname(rel);
  let files = dirCache.get(dir);
  if (!files) {
    try { files = readdirSync(join(ROOT, dir)); } catch { files = []; }
    dirCache.set(dir, files);
  }
  const stem = variantStem(basename(rel), files);
  const prefix = clean.startsWith('/') ? '/' : '';
  const out = { avif: [], webp: [] };
  const re = new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d{2,4})\\.(avif|webp)$`);
  for (const f of files) {
    const m = f.match(re);
    if (m) out[m[2]].push({ w: +m[1], url: `${prefix}${dir}/${f}` });
  }
  out.avif.sort((a, b) => a.w - b.w); out.webp.sort((a, b) => a.w - b.w);
  return out;
}

/**
 * Walk every <img> in an HTML string with its context. Skips <script>,
 * <style> and comments. cb(tag, {index, inPicture, before}) may return a
 * replacement string.
 */
export function eachImg(html, cb) {
  const masked = html.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, m => ' '.repeat(m.length));
  const pictures = [...masked.matchAll(/<picture\b[\s\S]*?<\/picture>/gi)].map(m => [m.index, m.index + m[0].length]);
  let out = '', last = 0;
  // Quote-aware: an attribute value may contain ">" (the logo tiles'
  // onerror inserts '<span class=&quot;..&quot;>TE</span>'). A naive
  // <img[^>]*> cut the tag there and wrote attributes INTO the handler.
  for (const m of masked.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const i = m.index, tag = html.slice(i, i + m[0].length);
    const inPicture = pictures.some(([a, b]) => i > a && i < b);
    const r = cb(tag, { index: i, inPicture, before: html.slice(Math.max(0, i - 400), i) });
    if (typeof r === 'string' && r !== tag) { out += html.slice(last, i) + r; last = i + tag.length; }
  }
  return out + html.slice(last);
}

const lineOf = (html, i) => html.slice(0, i).split('\n').length;

const maskCode = html => html.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi, m => ' '.repeat(m.length));

/**
 * JS-fed images: data-src / data-thumb on any element (gallery stages copy
 * them into an <img> or a lightbox at runtime, so no <picture> is possible).
 * cb(name, value, index) may return a replacement value (already escaped).
 */
const DATA_IMG = /\sdata-(src|thumb)\s*=\s*"([^"]*)"/gi;
export function eachDataImage(html, cb) {
  const masked = maskCode(html);
  let out = '', last = 0;
  for (const m of masked.matchAll(DATA_IMG)) {
    const raw = html.slice(m.index, m.index + m[0].length);
    const value = raw.match(/"([^"]*)"/)[1];
    const r = cb(m[1].toLowerCase(), value, m.index);
    if (typeof r === 'string' && r !== value) {
      out += html.slice(last, m.index) + raw.replace(`"${value}"`, `"${r}"`);
      last = m.index + raw.length;
    }
  }
  return out + html.slice(last);
}
const isCdn = src => /images\.(unsplash|pexels)\.com/.test(src);
const isRemoteRaster = src => /^https?:/i.test(src) && RASTER.test(src.split('?')[0]) || isCdn(src);
// Problems shared by <img src> and data-src/data-thumb for remote URLs.
function remoteProblem(src) {
  if (/images\.unsplash\.com/.test(src)) {
    if (!/[?&]auto=format/.test(src) || !/[?&]w=/.test(src)) return ['cdn-params', 'Unsplash URL needs auto=format and w='];
  } else if (/images\.pexels\.com/.test(src)) {
    if (!/[?&]auto=compress/.test(src) || !/[?&]w=/.test(src)) return ['cdn-params', 'Pexels URL needs auto=compress and w='];
  } else if (!HOST_ALLOW.test(src)) {
    return ['hotlink', `hotlinked raster ${src.slice(0, 80)}: download into brand_assets/ and convert`];
  }
  return null;
}
function cdnParams(src) {
  const u = new URL(src);
  if (u.hostname.includes('unsplash')) {
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
    if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
    if (!u.searchParams.has('w')) u.searchParams.set('w', '1600');
  } else {
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'compress');
    if (!u.searchParams.has('cs')) u.searchParams.set('cs', 'tinysrgb');
    if (!u.searchParams.has('w')) u.searchParams.set('w', '1600');
  }
  return u.toString();
}
// JS-fed images get ONE file, so WebP (universal) at the slot's cap:
// thumbs are gallery tiles (measured max 268px wide at 1920, so 640 covers 2x),
// data-src is the full-screen lightbox.
const DATA_CAP = { thumb: 640, src: 2560 };
function dataVariant(name, src) {
  const list = variantsFor(src).webp;
  if (!list.length) return null;
  const fit = list.filter(x => x.w <= DATA_CAP[name]);
  return (fit.length ? fit[fit.length - 1] : list[0]).url;
}

/** Problems for one HTML string: [{line, rule, msg, tag}] */
export function audit(html) {
  const problems = [];
  eachImg(html, (tag, { index, inPicture }) => {
    const src = (attr(tag, 'src') || '').replace(/&amp;/g, '&');
    if (isDynamic(src) || /^data:/i.test(src) || /\.svg(\?|$)/i.test(src)) return;
    const p = (rule, msg) => problems.push({ line: lineOf(html, index), rule, msg, src, tag: tag.slice(0, 140) });
    const high = /high/i.test(attr(tag, 'fetchpriority') || '');
    const loading = attr(tag, 'loading');

    if (isLocal(src)) {
      const v = variantsFor(src);
      if (!v.avif.length || !v.webp.length) p('variants', `no AVIF/WebP variants for ${src}, run npm run images:convert`);
      else if (!inPicture) p('local-picture', `${src} must be wrapped in <picture> with AVIF + WebP sources`);
    } else if (isRemoteRaster(src)) {
      const r = remoteProblem(src);
      if (r) p(...r);
    }
    if (!hasAttr(tag, 'width') || !hasAttr(tag, 'height')) p('dimensions', 'missing width and/or height');
    if (!hasAttr(tag, 'alt')) p('alt', 'missing alt attribute');
    if (!loading && !high) p('loading', 'missing loading="lazy" (or fetchpriority="high" for ATF)');
    if (!/async/i.test(attr(tag, 'decoding') || '')) p('decoding', 'missing decoding="async"');
  });
  eachDataImage(html, (name, value, index) => {
    const src = value.replace(/&amp;/g, '&');
    if (isDynamic(src) || /^data:/i.test(src) || /\.svg(\?|$)/i.test(src)) return;
    const p = (rule, msg) => problems.push({ line: lineOf(html, index), rule, msg: `data-${name}: ${msg}`, src, tag: `data-${name}="${value.slice(0, 120)}"` });
    if (isLocal(src)) {
      if (VARIANT_RE.test(src.split(/[?#]/)[0])) return;
      const v = variantsFor(src);
      if (!v.webp.length) p('variants', `no AVIF/WebP variants for ${src}, run npm run images:convert`);
      else p('data-variant', `${src} is a master: point it at a WebP variant (npm run images:fix)`);
    } else if (isRemoteRaster(src)) {
      const r = remoteProblem(src);
      if (r) p(...r);
    }
  });
  return problems;
}

/**
 * Mechanical fixes, idempotent: <picture> wrap, width/height from the
 * manifest, CDN params, decoding + loading defaults. Never invents alt text
 * and never localises hotlinks: those stay audit failures for a human.
 */
export function apply(html) {
  return eachDataImage(applyImgs(html), (name, value) => {
    const src = value.replace(/&amp;/g, '&');
    if (isDynamic(src) || /^data:/i.test(src)) return;
    if (isCdn(src)) return cdnParams(src).replace(/&/g, '&amp;');
    if (isLocal(src) && !VARIANT_RE.test(src.split(/[?#]/)[0])) return dataVariant(name, src) || undefined;
  });
}

function applyImgs(html) {
  const man = manifest();
  return eachImg(html, (tag, { inPicture, before }) => {
    // Decode &amp; first: parsing the raw attribute re-added CDN params on
    // every run and corrupted the URL.
    const src = (attr(tag, 'src') || '').replace(/&amp;/g, '&');
    if (isDynamic(src) || /^data:/i.test(src) || /\.svg(\?|$)/i.test(src)) return;
    let t = tag;

    if (isCdn(src)) {
      const next = cdnParams(src).replace(/&/g, '&amp;');
      const raw = tag.match(/\ssrc\s*=\s*"([^"]*)"/i);
      if (raw) t = t.replace(raw[0], ` src="${next}"`);
    }

    const high = /high/i.test(attr(t, 'fetchpriority') || '');
    if (!attr(t, 'decoding')) t = addAttr(t, 'decoding="async"');
    if (!attr(t, 'loading') && !high) t = addAttr(t, 'loading="lazy"');

    const local = isLocal(src);
    // Local keys are repo paths; remote keys are the final URL (probed by
    // `node scripts/images.mjs probe`).
    const key = local ? src.split(/[?#]/)[0].replace(/^\//, '') : attr(t, 'src').replace(/&amp;/g, '&');
    const m = man[key];
    if (m && !hasAttr(t, 'width') && !hasAttr(t, 'height')) t = addAttr(t, `width="${m.width}" height="${m.height}"`);
    // A wrapped <img>'s parent is the <picture>, so an onerror fallback that
    // reaches for this.parentElement (add is-fallback, set the tile text)
    // must skip past it. Only inside double-quoted handlers (single quotes
    // added). Idempotent: the rewrite no longer contains `this.parentElement`.
    const liftParent = x => x.replace(/(\son\w+\s*=\s*")([^"]*)"/gi,
      (_, a, js) => `${a}${js.replace(/\bthis\.parentElement\b/g, "(this.closest('picture')||this).parentElement")}"`);
    if (!local) return t;
    if (inPicture) return liftParent(t);

    const v = variantsFor(src);
    if (!v.avif.length || !v.webp.length) return t;
    t = liftParent(t);
    const lazy = /lazy/i.test(attr(t, 'loading') || '');
    let sizes = attr(t, 'sizes');
    if (!sizes) {
      let best = -1;
      for (const [re, s] of SLOT_SIZES) {
        const at = before.search(new RegExp(`${re.source}(?![\\s\\S]*${re.source})`));
        if (at > best) { best = at; sizes = s; }
      }
      sizes = sizes || (lazy ? LAZY_FALLBACK : '100vw');
      // No sizes="auto": on an intrinsic-width img (width:auto) it resolves
      // to 0px and the image collapses to 0x0 (measured on logo tiles).
    }
    const set = list => list.map(x => `${x.url} ${x.w}w`).join(', ');
    return `<picture><source type="image/avif" srcset="${set(v.avif)}" sizes="${sizes}">`
      + `<source type="image/webp" srcset="${set(v.webp)}" sizes="${sizes}">${t}</picture>`;
  });
}
