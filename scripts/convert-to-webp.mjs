/* Batch-convert brand_assets PNG/JPG to WebP.
 *
 * Usage: node scripts/convert-to-webp.mjs
 *
 * - Quality 85 (visually lossless for photos, near-lossless for logos)
 * - Skips files whose WebP is newer than the source
 * - Preserves the original PNG/JPG alongside the new WebP (used as
 *   the <picture> fallback in HTML for legacy clients)
 * - Reports byte-savings summary at the end
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

const ROOT = 'brand_assets';
const EXT_RE = /\.(png|jpe?g)$/i;

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else if (EXT_RE.test(name)) out.push(full);
  }
  return out;
}

const files = await walk(ROOT);
let totalSrc = 0;
let totalDst = 0;
let skipped = 0;
let converted = 0;

for (const src of files) {
  const { dir, name } = parse(src);
  const dst = join(dir, `${name}.webp`);

  const srcStat = await stat(src);
  let dstStat = null;
  try { dstStat = await stat(dst); } catch {}

  if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
    skipped++;
    totalSrc += srcStat.size;
    totalDst += dstStat.size;
    continue;
  }

  try {
    await sharp(src)
      .webp({ quality: 85, effort: 6 })
      .toFile(dst);
  } catch (err) {
    console.warn(`  ${src} — skipped (sharp could not decode: ${err.message.split('\n')[0]})`);
    totalSrc += srcStat.size;
    skipped++;
    continue;
  }

  const newStat = await stat(dst);
  totalSrc += srcStat.size;
  totalDst += newStat.size;
  converted++;
  console.log(`  ${src.padEnd(50)} ${(srcStat.size / 1024).toFixed(0).padStart(5)} KB → ${(newStat.size / 1024).toFixed(0).padStart(5)} KB  (${((1 - newStat.size / srcStat.size) * 100).toFixed(0)}% smaller)`);
}

const pct = ((1 - totalDst / totalSrc) * 100).toFixed(1);
console.log(`\nConverted ${converted}, skipped ${skipped} (up-to-date).`);
console.log(`Source total: ${(totalSrc / 1024 / 1024).toFixed(2)} MB`);
console.log(`WebP   total: ${(totalDst / 1024 / 1024).toFixed(2)} MB  (${pct}% smaller)`);
