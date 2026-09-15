#!/usr/bin/env node
/* Build the component library: /components, components.json, COMPONENTS.md.
 *
 * Why this exists:
 *   design-system.html is where rules are explained. It was never a place to
 *   pick a component up: 206 exhibits, but only about 21 pasteable snippets and
 *   no copy button on any of them. The most-used parts of the portal (carousel,
 *   off-canvas menu, share sheet, brief flow) had no code at all.
 *
 *   The library fixes that without creating a second copy to keep in sync.
 *   Every component is ONE source file. This script turns those files into the
 *   page the team browses AND the manifest an AI reads, so the two can never
 *   disagree, and it checks each snippet against the CSS it claims to need so a
 *   renamed class shows up here instead of on a live page.
 *
 * Source contract, one file per component:
 *
 *     _dev/reference/components/<id>.html
 *
 *     <!-- @meta
 *     { "id": "...", "name": "...", "category": "...", "kind": "paste", ... }
 *     -->
 *     <!-- @snippet -->          markup the user copies (required unless kind=call)
 *     <!-- @preview -->          markup rendered in the preview, if it differs
 *     <!-- @style -->            CSS that is NOT in a shared file and must be pasted too
 *     <!-- @js -->               JS the user copies (required for kind=call)
 *     <!-- @preview-style -->    preview-only scaffolding CSS, never copied
 *     <!-- @preview-script -->   preview-only JS (e.g. an init call), never copied
 *
 *   See _dev/reference/components/README.md for every @meta field.
 *
 * Run:
 *
 *     npm run build:components             build, print warnings
 *     npm run build:components -- --strict exit 1 on any warning
 *     node scripts/build-components.mjs --only rail-carousel,toast
 *                                          check a subset; writes nothing
 *     node scripts/build-components.mjs --only toast --preview
 *                                          also writes each preview to
 *                                          _dev/scratch/component-previews/<id>.html
 *                                          (open /_dev/scratch/component-previews/toast.html)
 *     npm run build:components -- --xref   also rewrites the "Get the code" links
 *                                          in design-system.html (idempotent)
 *
 * Outputs (all generated, never hand-edit):
 *     _dev/reference/components.html   served at /components
 *     _dev/reference/components.json   the manifest, for AI and tooling
 *     _dev/reference/COMPONENTS.md     a small index: id, kind, one line, source
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, '_dev/reference/components');
const OUT_HTML = path.join(ROOT, '_dev/reference/components.html');
const OUT_JSON = path.join(ROOT, '_dev/reference/components.json');
const OUT_MD = path.join(ROOT, '_dev/reference/COMPONENTS.md');

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const PREVIEW = args.includes('--preview');
const XREF = args.includes('--xref');
const onlyArg = args.find(a => a.startsWith('--only'));
const ONLY = onlyArg
  ? (onlyArg.includes('=') ? onlyArg.split('=')[1] : args[args.indexOf(onlyArg) + 1] || '')
      .split(',').map(s => s.trim()).filter(Boolean)
  : null;

const KINDS = ['paste', 'include', 'call'];
const STATUSES = ['shared', 'inline', 'include'];
const BLOCKS = ['meta', 'snippet', 'preview', 'style', 'js', 'preview-style', 'preview-script'];

/* Category order is the reading order of the page, simplest to most composed.
   A category not listed here is appended alphabetically, with a warning, so a
   typo in one file cannot silently start a new section. */
const CATEGORY_ORDER = [
  'Foundations',
  'Buttons & links',
  'Layout',
  'Primitives',
  'Cards',
  'Carousels',
  'Editorial blocks',
  'Data & stats',
  'Forms',
  'Overlays',
  'Feedback',
  'Navigation',
  'Shared chrome',
  'Search',
  'Motion',
  'Media',
  'Brand profile',
  'Person profile',
  'Directories',
  'Design pillar',
  'Industry Voices',
  'GharTalks',
  'Articles',
  'B2B pages',
  'Dark vertical',
];

const warnings = [];
const warn = (id, msg) => warnings.push(`  ${id}: ${msg}`);

/* ── Parse one source file ──────────────────────────────────────────── */

function parseSource(text, file) {
  const blocks = {};
  const metaMatch = text.match(/<!--\s*@meta\s*([\s\S]*?)-->/);
  if (!metaMatch) throw new Error(`${file}: missing <!-- @meta {...} --> block`);
  let meta;
  try { meta = JSON.parse(metaMatch[1]); }
  catch (e) { throw new Error(`${file}: @meta is not valid JSON (${e.message})`); }

  const rest = text.slice(metaMatch.index + metaMatch[0].length);
  const markerRe = /<!--\s*@([a-z-]+)\s*-->/g;
  const marks = [...rest.matchAll(markerRe)];
  marks.forEach((m, i) => {
    const name = m[1];
    if (!BLOCKS.includes(name)) throw new Error(`${file}: unknown block @${name}`);
    const start = m.index + m[0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index : rest.length;
    blocks[name] = dedent(rest.slice(start, end));
  });
  return { meta, blocks };
}

function dedent(s) {
  const lines = s.replace(/\r\n/g, '\n').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const indents = lines.filter(l => l.trim()).map(l => l.match(/^[ \t]*/)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map(l => l.slice(cut)).join('\n');
}

/* ── Validation ─────────────────────────────────────────────────────── */

let dsIds = null;
async function designSystemIds() {
  if (dsIds) return dsIds;
  const ds = await fs.readFile(path.join(ROOT, '_dev/reference/design-system.html'), 'utf8');
  dsIds = new Set([...ds.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
  return dsIds;
}

const fileCache = new Map();
async function readAsset(url) {
  const clean = url.split('?')[0];
  if (/^https?:/.test(clean)) return null;          // CDN: not checkable offline
  if (fileCache.has(clean)) return fileCache.get(clean);
  let body = null;
  try { body = await fs.readFile(path.join(ROOT, clean.replace(/^\//, '')), 'utf8'); }
  catch { body = undefined; }
  fileCache.set(clean, body);
  return body;
}

function classesIn(html) {
  const out = new Set();
  for (const m of (html || '').matchAll(/\sclass\s*=\s*"([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c && !c.includes('{') && !c.includes('$')) out.add(c);
  }
  return out;
}

const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cssEscape = c => c.replace(/([:/.\[\]%@!])/g, '\\\\?\\$1');

function classDefined(cls, css) {
  // Tailwind-style names carry escaped characters in the stylesheet (md\:flex).
  const pat = new RegExp(`\\.${cssEscape(cls).replace(/-/g, '\\-')}(?![\\w-])`);
  return pat.test(css);
}

async function validate(c, blocks) {
  const m = c;
  const req = ['id', 'name', 'category', 'kind', 'status', 'summary'];
  for (const k of req) if (!m[k]) warn(m.id || '?', `@meta.${k} is required`);
  if (!KINDS.includes(m.kind)) warn(m.id, `kind must be one of ${KINDS.join(' | ')}`);
  if (!STATUSES.includes(m.status)) warn(m.id, `status must be one of ${STATUSES.join(' | ')}`);
  if (m.kind === 'include' && !m.partial) warn(m.id, 'kind "include" needs @meta.partial');
  if (m.kind === 'call' && !blocks.js) warn(m.id, 'kind "call" needs a @js block');
  if (m.kind !== 'call' && !blocks.snippet && m.kind !== 'include') warn(m.id, 'needs a @snippet block');
  if (m.status === 'inline' && !blocks.style) warn(m.id, 'status "inline" needs the @style block to paste');
  if (!m.use?.length) warn(m.id, '@meta.use should list at least one "use when"');
  if (!m.avoid?.length) warn(m.id, '@meta.avoid should list at least one "avoid"');
  if (/—/.test(JSON.stringify(m) + Object.values(blocks).join(''))) {
    warn(m.id, 'contains an em dash (house rule: never)');
  }

  if (m.guideline) {
    if (!/^#[\w-]+$/.test(m.guideline)) warn(m.id, `guideline must be "#anchor" in design-system.html`);
    else if (!(await designSystemIds()).has(m.guideline.slice(1))) warn(m.id, `guideline ${m.guideline} is not an id in design-system.html`);
  }

  // Every declared asset must exist.
  const cssBodies = [];
  for (const href of m.css || []) {
    const body = await readAsset(href);
    if (body === undefined) warn(m.id, `css "${href}" does not exist`);
    else if (body) cssBodies.push(body);
  }
  const jsBodies = [];
  for (const src of m.js || []) {
    const body = await readAsset(src);
    if (body === undefined) warn(m.id, `js "${src}" does not exist`);
    else if (body) jsBodies.push(body);
  }

  // main.min.js calls gsap at load. Without GSAP ahead of it the script throws
  // part-way and every helper defined after that line (gharToast among them)
  // never exists. Measured in a preview, 2026-09-15.
  const jsList = m.js || [];
  const mainAt = jsList.findIndex(s => /main(\.min)?\.js/.test(s));
  const gsapAt = jsList.findIndex(s => /gsap(\.min)?\.js/.test(s));
  if (mainAt !== -1 && (gsapAt === -1 || gsapAt > mainAt)) {
    warn(m.id, 'main.min.js needs GSAP (and ScrollTrigger) listed BEFORE it in @meta.js');
  }

  // Every class in the markup must be painted by something the component
  // declares. This is the check that catches drift: a class renamed in
  // styles.css fails here, not on a page.
  let partialHtml = '';
  if (m.partial) {
    try { partialHtml = await fs.readFile(path.join(ROOT, 'partials', `${m.partial}.html`), 'utf8'); }
    catch { warn(m.id, `partial "partials/${m.partial}.html" does not exist`); }
  }
  const allCss = cssBodies.join('\n') + '\n' + (blocks.style || '') + '\n' + (blocks['preview-style'] || '');
  const hooks = new Set(m.hookClasses || []);
  const markup = (blocks.snippet || '') + '\n' + (blocks.preview || '');
  const missing = [...classesIn(markup)].filter(cls => !hooks.has(cls) && !classDefined(cls, allCss));
  if (missing.length) {
    warn(m.id, `classes not found in its declared CSS: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ` (+${missing.length - 12})` : ''}`);
  }

  // Every JS API it documents must exist in a script it declares.
  const allJs = jsBodies.join('\n') + '\n' + (blocks['preview-script'] || '');
  for (const a of m.api || []) {
    if (a.type !== 'js') continue;
    const name = a.name.replace(/\(.*$/, '').replace(/^window\./, '');
    if (!new RegExp(`\\b${escRe(name)}\\b`).test(allJs)) {
      warn(m.id, `js API "${name}" not found in its declared scripts`);
    }
  }
  return partialHtml;
}

/* ── Where is it used ───────────────────────────────────────────────── */

let rootPages = null;
async function loadRootPages() {
  if (rootPages) return rootPages;
  const files = (await fs.readdir(ROOT)).filter(f => f.endsWith('.html'));
  rootPages = await Promise.all(files.map(async f => ({ f, body: await fs.readFile(path.join(ROOT, f), 'utf8') })));
  return rootPages;
}

async function usedOn(signature) {
  if (!signature) return [];
  const pages = await loadRootPages();
  let re;
  if (signature.startsWith('.')) re = new RegExp(`class\\s*=\\s*"[^"]*(?<![\\w-])${escRe(signature.slice(1))}(?![\\w-])`);
  else if (signature.startsWith('[')) re = new RegExp(`\\s${escRe(signature.slice(1, -1))}(?=[\\s=>])`);
  else if (signature.startsWith('body.')) re = new RegExp(`<body[^>]*class\\s*=\\s*"[^"]*(?<![\\w-])${escRe(signature.slice(5))}(?![\\w-])`);
  else re = new RegExp(`\\b${escRe(signature)}\\b`);
  return pages.filter(p => re.test(p.body)).map(p => p.f).sort();
}

/* ── Preview document ───────────────────────────────────────────────── */

const FONT_FACE = `@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-var.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url('/fonts/inter-var-ext.woff2') format('woff2');unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:'Inter';font-style:italic;font-weight:100 900;font-display:swap;src:url('/fonts/inter-italic-var.woff2') format('woff2')}`;

/* inPage: the page already carries the snippet and @style as its code panels,
   so the embedded preview uses placeholders the page script fills from those
   panels' text. Each snippet ships in the page once, not three times. The
   standalone --preview files get the real text. */
const SNIPPET_TOKEN = '<!--@@SNIPPET@@-->';
const STYLE_TOKEN = '/*@@STYLE@@*/';
function previewDoc(c, blocks, partialHtml, inPage = false) {
  const p = c.preview || {};
  // An include's @snippet is page setup (body classes), not markup, so its
  // preview is the real partial. The @js block is never auto-run: a call
  // component wires a trigger in @preview-script instead of firing on load.
  const body = c.kind === 'include'
    ? (blocks.preview || partialHtml || '')
    : (blocks.preview || (inPage && blocks.snippet ? SNIPPET_TOKEN : blocks.snippet) || '');
  const style = inPage && blocks.style ? STYLE_TOKEN : (blocks.style || '');
  const pad = p.pad ?? 32;
  const links = ['/gazpacho.css', ...(c.css || [])]
    .map(h => `<link rel="stylesheet" href="${h}">`).join('');
  const scripts = (c.js || []).map(s => `<script src="${s}"></script>`).join('');
  const inline = blocks['preview-script'] ? `<script>${blocks['preview-script']}</script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<style>${FONT_FACE}</style>${links}`
    + `<style>html,body{background:${p.bg || '#ffffff'}}body{margin:0;padding:${typeof pad === 'number' ? pad + 'px' : pad};font-family:'Inter',system-ui,sans-serif;color:#111}${style}\n${blocks['preview-style'] || ''}</style>`
    + `</head><body${p.bodyClass ? ` class="${p.bodyClass}"` : ''}>${body}${scripts}${inline}</body></html>`;
}

/* ── Highlighting (display only; Copy always takes the raw text) ────── */

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function hlHtml(src) {
  let out = '';
  const re = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?>)|([^<]+|<)/g;
  for (const m of src.matchAll(re)) {
    if (m[1]) out += `<i>${esc(m[1])}</i>`;
    else if (m[3]) {
      const attrs = (m[4] || '').replace(/(\s+)([^\s=>\/]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+))?/g,
        (_, sp, n, eq, v) => `${sp}<u>${esc(n)}</u>${eq ? esc(eq) + `<s>${esc(v)}</s>` : ''}`);
      out += `<b>${esc(m[2])}${esc(m[3])}</b>${attrs}<b>${esc(m[5])}</b>`;
    } else out += esc(m[6]);
  }
  return out;
}

function hlCode(src) {
  let out = '';
  const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|([^/"'`]+|[/"'`])/g;
  for (const m of src.matchAll(re)) {
    if (m[1]) out += `<i>${esc(m[1])}</i>`;
    else if (m[2]) out += `<s>${esc(m[2])}</s>`;
    else out += esc(m[3]);
  }
  return out;
}

/* ── Render ─────────────────────────────────────────────────────────── */

const KIND_LABEL = { paste: 'Paste', include: 'Include', call: 'Call' };
const STATUS_LABEL = {
  shared: 'In shared CSS',
  inline: 'Inline CSS: paste it too',
  include: 'Generated partial',
};
const API_TYPE_LABEL = { class: 'class', modifier: 'modifier', attr: 'attribute', js: 'JS', token: 'token', 'body-class': 'body class', event: 'event', slot: 'slot' };

function includeSnippet(c) {
  const lines = [
    `<!-- ${c.placement || 'Place where it belongs in the page'}. Then run: npm run build:partials -->`,
    `<!-- PARTIAL ${c.partial}:start -->`,
    `<!-- PARTIAL ${c.partial}:end -->`,
  ];
  return lines.join('\n');
}

function renderArticle(c) {
  const tabs = [];
  if (c.kind === 'include') tabs.push({ key: 'include', label: 'Include', code: c.snippetInclude, lang: 'html' });
  if (c.snippet) tabs.push({ key: 'html', label: c.kind === 'include' ? 'Page setup' : 'HTML', code: c.snippet, lang: 'html' });
  if (c.styleBlock) tabs.push({ key: 'css', label: 'CSS', code: c.styleBlock, lang: 'code' });
  if (c.jsBlock) tabs.push({ key: 'js', label: 'JS', code: c.jsBlock, lang: 'code' });

  const deps = [...(c.css || []), ...(c.js || [])];
  const depHtml = deps.length
    ? deps.map(d => `<code class="cx-dep">${esc(d.replace(/\?.*$/, '').replace(/^https:\/\/[^/]+\//, ''))}</code>`).join('')
    : '<span class="cx-none">Nothing beyond the page</span>';

  const used = c.usedOn || [];
  const usedHtml = used.length
    ? `<details class="cx-used"><summary>Used on <b>${used.length}</b> page${used.length === 1 ? '' : 's'}</summary><p>${used.map(u => `<code>${esc(u)}</code>`).join(' ')}</p></details>`
    : `<span class="cx-used cx-used--none">${c.kind === 'call' ? 'Called from shared scripts' : 'Not on a shipped page yet'}</span>`;

  const api = (c.api || []).length ? `
      <div class="cx-block">
        <h3 class="cx-h3">API</h3>
        <div class="cx-table-wrap"><table class="cx-api">
          <thead><tr><th>Name</th><th>Type</th><th>What it does</th></tr></thead>
          <tbody>${c.api.map(a => `<tr data-type="${esc(a.type)}"><td><code>${esc(a.name)}</code></td><td><span class="cx-type">${esc(API_TYPE_LABEL[a.type] || a.type)}</span></td><td>${esc(a.desc)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>` : '';

  const p = c.preview || {};
  const viewports = p.viewports || ['fit', 'desktop', 'tablet', 'phone'];
  const initialVp = p.width || viewports[0];
  const vpLabel = { fit: 'Fit', desktop: '1280', tablet: '768', phone: '390' };

  const searchText = [c.id, c.name, c.category, c.kind, c.summary, ...(c.keywords || []), ...(c.api || []).map(a => a.name), c.signature || ''].join(' ').toLowerCase();

  return `
    <article class="cx" id="${esc(c.id)}" data-kind="${c.kind}" data-category="${esc(c.category)}" data-css="${esc((c.css || []).join('|'))}" data-js="${esc((c.js || []).join('|'))}"${c.partial ? ` data-partial="${esc(c.partial)}"` : ''}${c.guideline ? ` data-guideline="${esc(c.guideline)}"` : ''} data-search="${esc(searchText)}">
      <header class="cx-head">
        <div class="cx-titlerow">
          <h2 class="cx-title"><a href="#${esc(c.id)}">${esc(c.name)}</a></h2>
          <span class="cx-kind cx-kind--${c.kind}">${KIND_LABEL[c.kind]}</span>
          <span class="cx-status cx-status--${c.status}">${STATUS_LABEL[c.status] || ''}</span>
        </div>
        <p class="cx-summary">${esc(c.summary)}</p>
        <div class="cx-meta">
          <div class="cx-meta__row"><span class="cx-meta__k">Needs</span><span class="cx-meta__v">${depHtml}</span></div>
          <div class="cx-meta__row"><span class="cx-meta__k">Where</span><span class="cx-meta__v">${usedHtml}${c.guideline ? `<a class="cx-guide" href="/design-system${esc(c.guideline)}">Guidelines<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>` : ''}</span></div>
        </div>
      </header>

      ${c.notes ? `<div class="cx-note">${esc(c.notes)}</div>` : ''}

      <div class="cx-preview" data-vp="${initialVp}">
        <div class="cx-preview__bar">
          <span class="cx-preview__label">Preview</span>
          <div class="cx-vp" role="group" aria-label="Preview width">
            ${viewports.map(v => `<button type="button" data-vp-set="${v}" aria-pressed="${v === initialVp}">${vpLabel[v]}</button>`).join('')}
          </div>
        </div>
        <div class="cx-preview__stage">
          <div class="cx-preview__frame" style="height:${p.height || 160}px">
            <iframe title="${esc(c.name)} preview" data-preview-id="${esc(c.id)}"${p.height ? ` data-fixed-height="${p.height}"` : ''} scrolling="${p.scroll ? 'yes' : 'no'}"></iframe>
          </div>
        </div>
      </div>

      <div class="cx-code" data-tabs>
        <div class="cx-code__bar">
          <div class="cx-tabs" role="tablist">
            ${tabs.map((t, i) => `<button type="button" role="tab" data-tab="${t.key}" aria-selected="${i === 0}">${t.label}</button>`).join('')}
          </div>
          <div class="cx-actions">
            <button type="button" class="cx-btn" data-copy>Copy</button>
            <button type="button" class="cx-btn cx-btn--ghost" data-copy-ai title="Copies the component, its rules and dependencies as one block for an AI tool">Copy for AI</button>
          </div>
        </div>
        ${tabs.map((t, i) => `<pre class="cx-pre" data-panel="${t.key}"${i ? ' hidden' : ''}><code>${t.lang === 'html' ? hlHtml(t.code) : hlCode(t.code)}</code></pre>`).join('')}
      </div>

      <div class="cx-grid2">
        <div class="cx-block cx-block--use">
          <h3 class="cx-h3">Use it when</h3>
          <ul data-list="use">${(c.use || []).map(u => `<li>${esc(u)}</li>`).join('')}</ul>
        </div>
        <div class="cx-block cx-block--avoid">
          <h3 class="cx-h3">Avoid</h3>
          <ul data-list="avoid">${(c.avoid || []).map(u => `<li>${esc(u)}</li>`).join('')}</ul>
        </div>
      </div>
      ${api}
      <p class="cx-source">Source <code>_dev/reference/components/${esc(c.id)}.html</code></p>
    </article>`;
}

function sortCategories(list) {
  const cats = [...new Set(list.map(c => c.category))];
  for (const cat of cats) if (!CATEGORY_ORDER.includes(cat)) warn(`category`, `"${cat}" is not in CATEGORY_ORDER in build-components.mjs`);
  return cats.sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

async function main() {
  let files;
  try { files = (await fs.readdir(SRC_DIR)).filter(f => f.endsWith('.html') && !f.startsWith('_')).sort(); }
  catch { console.error(`No source directory at ${path.relative(ROOT, SRC_DIR)}`); process.exit(1); }

  const comps = [];
  const seen = new Set();
  for (const f of files) {
    const text = await fs.readFile(path.join(SRC_DIR, f), 'utf8');
    const { meta, blocks } = parseSource(text, f);
    if (ONLY && !ONLY.includes(meta.id)) continue;
    if (meta.id !== f.slice(0, -5)) warn(meta.id, `id must match the file name (${f})`);
    if (seen.has(meta.id)) warn(meta.id, 'duplicate id');
    seen.add(meta.id);

    const partialHtml = await validate(meta, blocks);
    const c = {
      ...meta,
      snippet: blocks.snippet || '',
      styleBlock: blocks.style || '',
      jsBlock: blocks.js || '',
      snippetInclude: meta.kind === 'include' ? includeSnippet(meta) : '',
      usedOn: await usedOn(meta.signature),
      source: `_dev/reference/components/${f}`,
    };
    if (meta.signature && !c.usedOn.length && meta.kind !== 'call' && meta.status !== 'inline' && !meta.unshipped) {
      warn(meta.id, `signature "${meta.signature}" matched no root page (typo, or set "unshipped": true)`);
    }
    c.previewDoc = previewDoc(meta, blocks, partialHtml);
    c.pagePreviewDoc = previewDoc(meta, blocks, partialHtml, true);
    comps.push(c);
  }

  if (ONLY) {
    if (PREVIEW) {
      const dir = path.join(ROOT, '_dev/scratch/component-previews');
      await fs.mkdir(dir, { recursive: true });
      for (const c of comps) await fs.writeFile(path.join(dir, `${c.id}.html`), c.previewDoc);
      console.log(`Previews: ${comps.map(c => `/_dev/scratch/component-previews/${c.id}.html`).join('  ')}`);
    }
    console.log(`Checked ${comps.length} component(s).`);
    if (warnings.length) { console.log(`\n${warnings.length} warning(s):\n${warnings.join('\n')}`); process.exit(STRICT ? 1 : 0); }
    console.log('No warnings.');
    return;
  }

  const cats = sortCategories(comps);
  const byCat = cats.map(cat => ({ cat, items: comps.filter(c => c.category === cat).sort((a, b) => a.name.localeCompare(b.name)) }));
  const ordered = byCat.flatMap(g => g.items);

  const counts = {
    total: ordered.length,
    paste: ordered.filter(c => c.kind === 'paste').length,
    include: ordered.filter(c => c.kind === 'include').length,
    call: ordered.filter(c => c.kind === 'call').length,
    inline: ordered.filter(c => c.status === 'inline').length,
  };

  /* JSON manifest: everything an AI or a tool needs, nothing it doesn't. */
  const manifest = {
    about: 'Ghar.tv component library. Generated by scripts/build-components.mjs from _dev/reference/components/*.html. Do not edit by hand.',
    howToUse: {
      paste: 'Copy "snippet" into the page. If status is "inline", also copy "style" into the page <style>. Load every file in "css" and "js".',
      include: 'Never paste this markup. Put the PARTIAL marker pair in the page, add the body classes in "snippet", then run npm run build:partials.',
      call: 'Load every file in "js", then call the function shown in "js_snippet".',
    },
    rules: 'Guidelines (why and when) live at /design-system. No em dashes. Brand red #ee324b only on logo, primary CTA and interactive states. White is the page ground.',
    counts,
    components: ordered.map(c => ({
      id: c.id, name: c.name, category: c.category, kind: c.kind, status: c.status,
      summary: c.summary, use: c.use || [], avoid: c.avoid || [],
      css: c.css || [], js: c.js || [], partial: c.partial || null,
      api: c.api || [], signature: c.signature || null,
      guideline: c.guideline ? `/design-system${c.guideline}` : null,
      keywords: c.keywords || [], used_on: c.usedOn,
      snippet: c.kind === 'include' ? c.snippetInclude + (c.snippet ? '\n\n' + c.snippet : '') : c.snippet,
      style: c.styleBlock || null, js_snippet: c.jsBlock || null,
      notes: c.notes || null, source: c.source,
    })),
  };

  /* Markdown index: small enough to read whole, points at one source file. */
  const md = [
    '# Ghar.tv component index',
    '',
    '> Generated by `npm run build:components`. Do not edit. Browse at `/components`.',
    '> Pick a component here, then read ONLY its source file. Full data: `components.json`.',
    '',
    `${counts.total} components: ${counts.paste} paste, ${counts.include} include, ${counts.call} call. ${counts.inline} still carry inline CSS.`,
    '',
    '**Kinds.** `paste`: copy the markup. `include`: never paste; add the PARTIAL marker and run `npm run build:partials`. `call`: load the script and call the function.',
    '',
    ...byCat.flatMap(g => [
      `## ${g.cat}`, '',
      '| id | kind | what it is | source |', '|---|---|---|---|',
      ...g.items.map(c => `| \`${c.id}\` | ${c.kind}${c.status === 'inline' ? ' (inline CSS)' : ''} | ${c.summary.replace(/\|/g, '\\|')} | \`${c.source}\` |`),
      '',
    ]),
  ].join('\n');

  const previews = Object.fromEntries(ordered.map(c => [c.id, c.pagePreviewDoc]));

  const nav = byCat.map(g => `
        <div class="lib-nav__group">
          <div class="lib-nav__cat">${esc(g.cat)} <span>${g.items.length}</span></div>
          <ul>${g.items.map(c => `<li><a href="#${esc(c.id)}" data-kind="${c.kind}" data-search="${esc([c.id, c.name, c.category, c.kind, c.summary, ...(c.keywords || []), ...(c.api || []).map(a => a.name), c.signature || ''].join(' ').toLowerCase())}"><span class="lib-nav__k lib-nav__k--${c.kind}" aria-hidden="true">${c.kind[0].toUpperCase()}</span>${esc(c.name)}</a></li>`).join('')}</ul>
        </div>`).join('');

  const template = await fs.readFile(path.join(SRC_DIR, '_page.html'), 'utf8');
  const html = template
    .replace('{{COUNT_TOTAL}}', counts.total)
    .replace('{{COUNT_PASTE}}', counts.paste)
    .replace('{{COUNT_INCLUDE}}', counts.include)
    .replace('{{COUNT_CALL}}', counts.call)
    .replace('{{COUNT_INLINE}}', counts.inline)
    .replace('{{NAV}}', nav)
    .replace('{{SECTIONS}}', byCat.map(g => `
    <section class="lib-cat" id="cat-${g.cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">
      <h2 class="lib-cat__title">${esc(g.cat)}</h2>
      ${g.items.map(renderArticle).join('\n')}
    </section>`).join('\n'))
    .replace('{{PREVIEWS_JSON}}', () => JSON.stringify(previews).replace(/</g, '\\u003c'));

  await fs.writeFile(OUT_HTML, html);
  await fs.writeFile(OUT_JSON, JSON.stringify(manifest, null, 2) + '\n');
  await fs.writeFile(OUT_MD, md + '\n');

  const kb = n => `${Math.round(n / 1024)}KB`;
  console.log(`Built ${counts.total} components (${counts.paste} paste, ${counts.include} include, ${counts.call} call; ${counts.inline} inline).`);
  console.log(`  ${path.relative(ROOT, OUT_HTML)}  ${kb(Buffer.byteLength(html))}`);
  console.log(`  ${path.relative(ROOT, OUT_JSON)}  ${kb(Buffer.byteLength(JSON.stringify(manifest)))}`);
  console.log(`  ${path.relative(ROOT, OUT_MD)}`);
  if (XREF) await writeXrefs(manifest.components);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):\n${warnings.join('\n')}`);
    if (STRICT) process.exit(1);
  }
}

/* ── --xref: "Get the code" links in design-system.html ─────────────────
   Every component with a guideline gets a link under the first heading (and
   its description paragraph) of that anchor. Each block sits between
   COMPONENTS-XREF markers, so a rerun strips and rewrites them all: links
   follow the manifest, and a component that drops its guideline loses its
   link. Nothing outside the markers is touched. */
async function writeXrefs(components) {
  const DS = path.join(ROOT, '_dev/reference/design-system.html');
  let ds = await fs.readFile(DS, 'utf8');
  ds = ds.replace(/\n[ \t]*<!-- COMPONENTS-XREF:start[^>]*-->[\s\S]*?<!-- COMPONENTS-XREF:end -->/g, '');
  const byAnchor = new Map();
  for (const c of components) {
    if (!c.guideline) continue;
    const anchor = c.guideline.split('#')[1];
    if (!byAnchor.has(anchor)) byAnchor.set(anchor, []);
    byAnchor.get(anchor).push(c);
  }
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  let placed = 0;
  // Insert from the bottom up so earlier offsets stay valid.
  const spots = [];
  for (const [anchor, comps] of byAnchor) {
    const at = ds.search(new RegExp(`\\sid="${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    if (at === -1) { warn(comps[0].id, `--xref: #${anchor} not in design-system.html`); continue; }
    const head = /<\/h[2-4]>/g; head.lastIndex = at;
    const h = head.exec(ds);
    if (!h) continue;
    let pos = h.index + h[0].length;
    // Step past the description paragraph when it directly follows the heading.
    const after = ds.slice(pos, pos + 1600);
    const p = after.match(/^\s*<p\b[\s\S]*?<\/p>/);
    if (p) pos += p[0].length;
    const indent = (ds.slice(0, h.index).match(/\n([ \t]*)[^\n]*$/) || [, '  '])[1];
    const links = comps.map(c =>
      `${indent}<a href="/components#${c.id}" class="ui-xref">Get the code, ${esc(c.name)} ${arrow}</a>`).join('\n');
    spots.push({ pos, text: `\n${indent}<!-- COMPONENTS-XREF:start #${anchor} (generated by build-components --xref) -->\n${indent}<div class="ui-xref-code">\n${links}\n${indent}</div>\n${indent}<!-- COMPONENTS-XREF:end -->` });
  }
  spots.sort((a, b) => b.pos - a.pos);
  for (const s of spots) { ds = ds.slice(0, s.pos) + s.text + ds.slice(s.pos); placed++; }
  await fs.writeFile(DS, ds);
  console.log(`  design-system.html  ${placed} "Get the code" blocks`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
