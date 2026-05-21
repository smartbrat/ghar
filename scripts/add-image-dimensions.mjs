/* Add explicit width and height attributes to <img> tags in index.html.
 *
 * Dimensions sourced from:
 * - Unsplash URLs that already specify ?w=N&h=N — use those values
 * - Unsplash URLs that specify only ?w=N — infer h from common aspect (?q=80&fit=crop usually 4:3 or 4:5)
 * - i.ytimg.com — standard sizes: maxresdefault = 1280x720, hqdefault = 480x360
 *
 * Only touches <img> tags that don't already have width="..." attr.
 * Output is rewritten in place.
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = 'index.html';
const html = await readFile(FILE, 'utf8');

let added = 0;
let skipped = 0;

const result = html.replace(/<img\s+([^>]*?)src="([^"]+)"([^>]*?)>/g, (full, before, src, after) => {
  /* If width or height already present anywhere in the tag, leave it alone */
  if (/\bwidth=/.test(before + after) || /\bheight=/.test(before + after)) {
    skipped++;
    return full;
  }

  let w = null, h = null;

  if (src.includes('images.unsplash.com')) {
    const wMatch = src.match(/[?&]w=(\d+)/);
    const hMatch = src.match(/[?&]h=(\d+)/);
    if (wMatch && hMatch) { w = +wMatch[1]; h = +hMatch[1]; }
    else if (wMatch) {
      /* Single dimension given — assume 4:3 landscape (used in editorial + design rails) */
      w = +wMatch[1];
      h = Math.round(w * 3 / 4);
    }
  } else if (src.includes('i.ytimg.com')) {
    if (src.includes('maxresdefault')) { w = 1280; h = 720; }
    else if (src.includes('hqdefault'))  { w = 480; h = 360; }
    else if (src.includes('mqdefault'))  { w = 320; h = 180; }
    else { w = 480; h = 360; }
  }

  if (!w || !h) {
    skipped++;
    return full;
  }

  added++;
  return `<img ${before}src="${src}" width="${w}" height="${h}"${after}>`;
});

await writeFile(FILE, result);
console.log(`Added width/height to ${added} <img> tags. Skipped ${skipped} (already sized or non-matching source).`);
