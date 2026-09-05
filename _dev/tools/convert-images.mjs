#!/usr/bin/env node
/**
 * _dev/tools/convert-images.mjs
 *
 * One-shot image optimiser for Ghar.tv. Walks the target directory
 * (defaults to `brand_assets/`), and for every source .png / .jpg / .jpeg
 * emits WebP + AVIF at three widths (640 / 1280 / 2560) alongside the
 * original. Never upscales; never re-emits when the output is newer than
 * the source. Prints a per-file before/after byte report at the end.
 *
 * USAGE
 *   node _dev/tools/convert-images.mjs [dir1] [dir2] ...
 *
 *   # default (brand_assets recursive):
 *   node _dev/tools/convert-images.mjs
 *
 *   # a single subtree:
 *   node _dev/tools/convert-images.mjs brand_assets/brand-photos
 *
 *   # multiple:
 *   node _dev/tools/convert-images.mjs brand_assets people-photos
 *
 * OUTPUTS (co-located with the source)
 *   brand-photos/horizon-architects-hero.png                    (source, untouched)
 *   brand-photos/horizon-architects-hero-640.webp
 *   brand-photos/horizon-architects-hero-640.avif
 *   brand-photos/horizon-architects-hero-1280.webp
 *   brand-photos/horizon-architects-hero-1280.avif
 *   brand-photos/horizon-architects-hero-2560.webp
 *   brand-photos/horizon-architects-hero-2560.avif
 *
 * PAIR THE OUTPUT WITH A <picture> WRAPPER (see docs/IMAGE-OPTIMIZATION.md)
 *
 * PREREQUISITE
 *   npm install --save-dev sharp
 *
 * WHY THIS FILE IS TRACKED (despite living under _dev/)
 *   .gitignore has an explicit negation for this path so the tool ships
 *   to GitHub and Vercel. The programmer runs it on the server after
 *   installing sharp; the AI generation pipeline invokes it whenever new
 *   brand or people photos land. See docs/IMAGE-OPTIMIZATION.md.
 */

import { promises as fs, statSync } from 'node:fs';
import { extname, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (err) {
  console.error('\nMissing dependency: sharp\n');
  console.error('Install with:');
  console.error('  npm install --save-dev sharp\n');
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────
const WIDTHS = [640, 1280, 2560];
const FORMATS = ['webp', 'avif'];
const SOURCE_EXTS = new Set(['.png', '.jpg', '.jpeg']);
const QUALITY = { webp: 82, avif: 60 }; // avif is aggressive by design
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '_dev']);

// LQIP (Low-Quality Image Placeholder) settings. 24 px wide WebP at
// quality 30 lands ~500-1000 bytes and inlines cleanly as a base64 data
// URI. Paired with a dominant colour so ATF frames render the image's
// own tones + soft shapes the moment the HTML paints, and cross-fade to
// the sharp source when it arrives. See docs/IMAGE-OPTIMIZATION.md §3.
const LQIP_WIDTH = 24;
const LQIP_QUALITY = 30;
const MANIFEST_NAME = 'image-manifest.json';

// ── Args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const targets = args.length > 0 ? args : ['brand_assets'];

// ── Helpers ───────────────────────────────────────────────────────────
async function walk(dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch (err) {
    if (err.code === 'ENOENT') return out;
    throw err;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (SOURCE_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

function outputName(sourcePath, width, format) {
  const dir = dirname(sourcePath);
  const stem = basename(sourcePath, extname(sourcePath));
  return join(dir, `${stem}-${width}.${format}`);
}

function isFresh(srcPath, outPath) {
  try {
    const s = statSync(srcPath);
    const o = statSync(outPath);
    return o.mtimeMs >= s.mtimeMs;
  } catch {
    return false;
  }
}

async function convert(sourcePath) {
  const src = sharp(sourcePath, { failOn: 'none' });
  const meta = await src.metadata();
  const srcW = meta.width || 0;
  const srcH = meta.height || 0;
  const results = [];

  for (const width of WIDTHS) {
    // Never upscale. If the source is narrower than the target width,
    // skip that variant.
    if (srcW && srcW < width) continue;

    for (const format of FORMATS) {
      const outPath = outputName(sourcePath, width, format);
      if (isFresh(sourcePath, outPath)) {
        results.push({ outPath, status: 'skipped (up-to-date)', bytes: statSync(outPath).size });
        continue;
      }
      const pipeline = sharp(sourcePath, { failOn: 'none' }).resize({ width, withoutEnlargement: true });
      if (format === 'webp') pipeline.webp({ quality: QUALITY.webp, effort: 5 });
      if (format === 'avif') pipeline.avif({ quality: QUALITY.avif, effort: 5 });
      await pipeline.toFile(outPath);
      results.push({ outPath, status: 'written', bytes: statSync(outPath).size });
    }
  }

  return { results, srcW, srcH };
}

// Generate the LQIP (24 px WebP base64) + dominant colour for a source
// image, for inclusion in `image-manifest.json`. The dominant is the
// straight RGB mean across the LQIP thumbnail; it is the value the
// portal's `.imgfx-blurup` container paints as its ground before the
// preview data URI decodes.
async function lqipEntry(sourcePath) {
  const thumb = sharp(sourcePath, { failOn: 'none' })
    .resize({ width: LQIP_WIDTH, withoutEnlargement: true });
  const buf = await thumb.clone().webp({ quality: LQIP_QUALITY, effort: 6 }).toBuffer();
  const b64 = buf.toString('base64');
  const dataUri = `data:image/webp;base64,${b64}`;
  const { data, info } = await thumb.clone().raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const channels = info.channels;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < data.length; i += channels) {
    r += data[i]; g += data[i + 1]; b += data[i + 2];
  }
  const hex = '#' + [r, g, b]
    .map(v => Math.round(v / px).toString(16).padStart(2, '0'))
    .join('');
  return { dom: hex, lqip: dataUri, bytes: b64.length };
}

// ── Main ──────────────────────────────────────────────────────────────
console.log('Ghar.tv image optimiser');
console.log('Widths:', WIDTHS.join(', '));
console.log('Formats:', FORMATS.join(', '));
console.log('Targets:', targets.join(', '));
console.log('');

let totalSrcBytes = 0;
let totalOutBytes = 0;
let totalSources = 0;
let totalWritten = 0;
let totalSkipped = 0;

// Manifest: source path (repo-relative, forward-slash) → { dom, lqip }.
// Written once at the end of the run into each top-level target.
const manifest = {};

for (const target of targets) {
  const files = await walk(target);
  if (files.length === 0) {
    console.log(`(no images in ${target})`);
    continue;
  }
  for (const file of files) {
    const srcBytes = statSync(file).size;
    totalSrcBytes += srcBytes;
    totalSources += 1;

    let outputs, srcW, srcH;
    try {
      const r = await convert(file);
      outputs = r.results; srcW = r.srcW; srcH = r.srcH;
    }
    catch (err) {
      console.error(`FAIL ${file}: ${err.message}`);
      continue;
    }

    // LQIP + dominant colour for the manifest. Any read error is logged
    // but doesn't stop the run — the fallback is the CSS skeleton shimmer.
    let entry;
    try { entry = await lqipEntry(file); }
    catch (err) {
      console.error(`LQIP fail ${file}: ${err.message}`);
    }
    if (entry) {
      const key = file.split(/[\\/]/).join('/');
      manifest[key] = {
        dom: entry.dom,
        lqip: entry.lqip,
        width: srcW,
        height: srcH,
      };
    }

    const written = outputs.filter(o => o.status === 'written');
    const skipped = outputs.filter(o => o.status !== 'written');
    totalWritten += written.length;
    totalSkipped += skipped.length;
    const outBytes = outputs.reduce((s, o) => s + o.bytes, 0);
    totalOutBytes += outBytes;

    const kb = b => (b / 1024).toFixed(1) + ' KB';
    const lqipTag = entry ? `  lqip ${entry.bytes}b dom ${entry.dom}` : '';
    console.log(`${file}  ${kb(srcBytes)}  →  ${outputs.length} variants  ${kb(outBytes)}${lqipTag}`);
  }
}

// Write the manifest at the root of the first target directory. The AI
// generation pipeline reads this at template time to inline `--dom` +
// `--lqip` on hero and portrait containers. See docs/IMAGE-OPTIMIZATION.md.
if (Object.keys(manifest).length > 0) {
  const manifestDir = targets[0].split(/[\\/]/)[0] || '.';
  const manifestPath = join(manifestDir, MANIFEST_NAME);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest: ${manifestPath}  (${Object.keys(manifest).length} entries)`);
}

const kb = b => (b / 1024).toFixed(1) + ' KB';
const mb = b => (b / 1024 / 1024).toFixed(2) + ' MB';
console.log('');
console.log('── Summary ──');
console.log(`Sources scanned : ${totalSources}    ${mb(totalSrcBytes)}`);
console.log(`Variants written: ${totalWritten}`);
console.log(`Variants skipped: ${totalSkipped} (up-to-date)`);
console.log(`Output total    : ${mb(totalOutBytes)}`);
if (totalSrcBytes > 0) {
  const ratio = (totalOutBytes / (totalSrcBytes * WIDTHS.length * FORMATS.length)) * 100;
  console.log(`Avg per-variant : ${ratio.toFixed(1)}% of a same-size source (widths & formats considered)`);
}
