import { createServer } from 'http';
import { readFile, readdir, stat } from 'fs/promises';
import { watch } from 'fs';
import { extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { WebSocketServer } from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const WS_PORT = 3001;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
};

// Live-reload snippet injected into HTML responses
const RELOAD_SCRIPT = `
<script>
(function(){
  var ws;
  function connect(){
    ws = new WebSocket('ws://' + location.hostname + ':${WS_PORT}');
    ws.onmessage = function(e){ if(e.data === 'reload') location.reload(); };
    ws.onclose = function(){ setTimeout(connect, 1000); };
  }
  connect();
})();
</script>
`;

// Inject the live-reload snippet at the LAST </body>, not the first. Pages
// carry the string "</body>" inside HTML comments (the subscribe-modal partial
// documents "insert just before </body>"), and a plain .replace() would bury
// the script inside that comment where it never runs.
function injectReload(html) {
  const i = html.lastIndexOf('</body>');
  if (i === -1) return html + RELOAD_SCRIPT;
  return html.slice(0, i) + RELOAD_SCRIPT + html.slice(i);
}

// WebSocket server for live-reload
let wsClients = new Set();
try {
  const wss = new WebSocketServer({ port: WS_PORT });
  wss.on('connection', (ws) => {
    wsClients.add(ws);
    ws.on('close', () => wsClients.delete(ws));
  });
} catch {
  // ws module not installed — skip live reload
  console.log('  ⚠ Install ws for live-reload: npm i ws');
}

function notifyReload() {
  for (const ws of wsClients) {
    try { ws.send('reload'); } catch {}
  }
}

// Watch for file changes
let debounce = null;
watch(__dirname, { recursive: true }, (event, filename) => {
  if (!filename) return;
  // Ignore node_modules, .git, screenshots, temp files
  if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('screenshots') || filename.includes('temporary')) return;
  const ext = extname(filename).toLowerCase();
  if (['.html', '.css', '.js', '.mjs', '.svg'].includes(ext)) {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log(`  ↻ ${filename} changed — reloading`);
      notifyReload();
    }, 150);
  }
});

// Rewrites — pretty URLs that don't map 1:1 to a file. Keep in sync with
// vercel.json `rewrites` so dev + prod resolve identically.
const REWRITES = {
  '/design':              '/design.html',
  '/design/architecture': '/design-architecture.html',
  '/design/series':       '/design-series.html',
  '/design/heritage':              '/design-heritage.html', /* CANONICAL — flat model, locked 2026-08-01 evening. Do not change. */
  '/design/architecture/heritage': '/design-heritage.html', /* legacy alias — kept so any links made during earlier iterations still resolve */
  '/design/tag/heritage':          '/design-heritage.html', /* legacy alias */
  '/design/partner-kit':  '/design-partner-kit.html',
  '/for-brands':          '/for-brands.html',
  '/brand-connect':       '/brand-connect.html', /* Brand Connect product landing — pitch page for the umbrella brand-partnerships product */
  '/brands':              '/brands.html',
  '/brands/search':       '/brands-search.html', /* SRP for the /brands finder */
  '/people/search':       '/people-search.html', /* SRP for the /people finder */
  /* Project-brief pages. Deliberately NOT /post-your-requirement.php: that is
     the PROPERTY requirement form (buy/rent). A project brief hires a person
     or sources from a brand, which is a different audience and dataset. */
  '/brands/brief':        '/brands-brief.html',
  '/people/brief':        '/people-brief.html',

  /* Brand microsites. Only these five are built, so only these five route.
     No /brands/:slug catch-all on purpose: the directory links 44 slugs and a
     shared fallback would show one brand's real team under another brand's
     URL. Mirrors vercel.json. */
  '/brands/teearch':            '/brand-profile-teearch.html',
  '/brands/asian-paints':       '/brand-profile-asian-paints.html',
  '/brands/godrej-properties':  '/brand-profile-godrej-properties.html',
  '/brands/avirahi':            '/brand-profile-avirahi.html',
  '/brands/obeetee':            '/brand-profile-obeetee.html',
  '/brands/saint-gobain':       '/brand-profile-saint-gobain.html',
  '/brands/scarlet-splendour':  '/brand-profile-scarlet-splendour.html',
  '/brands/horizon-architects': '/brand-profile-horizon-architects.html',

  '/people':              '/people.html',

  /* ── Industry Voices ──────────────────────────────────────────────────
     One article store at /voices/{slug}; deliberately NOT filed under the
     blog. The four view URLs below are the content model (who holds the
     pen), not topics. They all render the landing template today with a
     different pill active; when the backend takes over they become one
     route with a `view` param. Series URLs (/voices/developer-dialogues
     etc.) render the same template filtered by series. */
  '/voices':               '/voices.html',
  '/voices/conversations': '/voices-conversations.html',
  '/voices/perspectives':  '/voices-perspectives.html',
  '/voices/quotes':        '/voices-quotes.html',
  '/voices/speakers':      '/voices-speakers.html',
  '/voices/search':        '/voices-search.html',
  '/voices/contribute':    '/voices-search.html', /* placeholder until the intake form is built */
  '/voices/nominate':      '/voices-search.html', /* placeholder until the intake form is built */

  /* Person profiles. Only the built ones, no catch-all: a fallback would
     render one person's credentials under another person's URL. */
  '/people/tarun-motta':  '/person-profile-tarun-motta.html',
  '/people/hemal-shah':   '/person-profile-hemal-shah.html',
  '/people/hiten-motta':  '/person-profile-hiten-motta.html',
  '/people/devesh-motta': '/person-profile-devesh-motta.html',
  '/people/darshini-mahadevia': '/person-profile-darshini-mahadevia.html',
  '/people/adi-godrej':         '/person-profile-adi-godrej.html',
  '/people/pirojsha-godrej':    '/person-profile-pirojsha-godrej.html',
  '/people/vinod-doshi':        '/person-profile-vinod-doshi.html',
  '/people/suman-kanodia':      '/person-profile-suman-kanodia.html',
  '/people/ashish-bajoria':     '/person-profile-ashish-bajoria.html',
  '/people/virendra-shah':      '/person-profile-virendra-shah.html',
  '/people/hardik-shah':        '/person-profile-hardik-shah.html',
  '/people/satish-bhansali':    '/person-profile-satish-bhansali.html',
};

// Design vertical route fallbacks — only 3 templates + partner-kit are
// actually built. Fallbacks:
//   - Missing pillars (interiors/spaces/designers/vastu/guides) → Architecture template
//   - Known collection/tag slugs → Heritage template (the reference tag page)
//   - Any other /design/{slug} → Article template
// Mirrors vercel.json.
const DESIGN_PILLAR_PLACEHOLDER_RE = /^\/design\/(interiors|spaces|designers|vastu|guides)\/?$/i;
// Known collection/tag/franchise slugs from docs/DESIGN-taxonomy.html.
// Every hit renders the Heritage template so the team + reviewers see a real
// working tag/collection page for any chip click on /design.
const DESIGN_COLLECTION_SLUGS = new Set([
  // Series franchises
  'studio-visit','material-stories','behind-the-build','home-tours',
  'india-design-100','homes-worth-talking-about','celebrity-homes',
  // Style / theme tags
  'sustainable','small-spaces','awards','first-home','indian-crafts',
  'inspiration','vernacular','coastal','courtyards','restoration',
  'brutalist','tropical','havelis','colonial',
  // Material tags
  'cladding','stone-cladding','tiles-ceramics','concrete','metalwork',
  'glass-glazing','laminates','paint-finishes','wallcoverings','lighting',
  'sanitaryware','hardware-fittings','doors-windows','acoustics',
  'rugs-textiles','furniture','sustainable-materials',
  // Discipline tags
  'art','landscape','construction',
  // Audience tags
  'luxury','workplace','hospitality',
]);
const DESIGN_ARTICLE_RE = /^\/design\/([a-z0-9][a-z0-9-]*)\/?$/i;

// ── Voices ────────────────────────────────────────────────────────────────
// Series slugs render the landing filtered by franchise; everything else
// under /voices/{slug} is an individual piece. Four launch, three held as
// tags that graduate on evidence (10+ pieces AND editorial commitment) —
// same rule as the /design tag graduation. Mirrors vercel.json.
const VOICES_SERIES_SLUGS = new Set([
  'developer-dialogues', 'market-leaders', 'expert-opinion', 'design-conversations',
  // Held as tags, routed so links resolve while the archive fills:
  'founder-conversations', 'broker-voices', 'investor-voices',
]);
const VOICES_ARTICLE_RE = /^\/voices\/([a-z0-9][a-z0-9-]*)\/?$/i;

// ── _dev/ fallback ────────────────────────────────────────────────────────
// Everything that is not a shipped page lives under _dev/ (archive,
// prototypes, reference, templates, tools, scratch) so the project root
// holds production files only. Those pages stay reachable at their ORIGINAL
// root URL — /design-system, /opt2.html, /media-kit — because moving a file
// must not break the relative asset paths baked into it. Served from a root
// URL, `href="dist/styles.min.css"` resolves against `/`, which is what the
// file expects; served from /_dev/reference/... it would resolve against
// /_dev/reference/ and 404 every stylesheet and script.
//
// The map is built once at boot from the directory listing, so any HTML file
// dropped into a _dev subfolder later is reachable with no edit here. First
// match wins, and a real root-level file always wins over a _dev one because
// this only runs after the direct filesystem read has failed.
const devPages = new Map();  // 'design-system' -> '/_dev/reference/design-system.html'
try {
  for (const sub of await readdir(join(__dirname, '_dev'), { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    for (const f of await readdir(join(__dirname, '_dev', sub.name))) {
      if (!f.toLowerCase().endsWith('.html')) continue;
      const key = f.slice(0, -5).toLowerCase();
      if (!devPages.has(key)) devPages.set(key, `/_dev/${sub.name}/${f}`);
    }
  }
} catch { /* no _dev/ directory — nothing to map */ }

function devLookup(pathname) {
  const key = pathname.replace(/^\//, '').replace(/\.html$/i, '').toLowerCase();
  return key.includes('/') ? undefined : devPages.get(key);
}

// HTTP server
createServer(async (req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';

  /* Canonicalise brand + person profile URLs. The .html files live at
     root because vercel deploys static files, but the CANONICAL public
     URL is /brands/{slug} and /people/{slug}. 301 any request that
     hits the raw filename (with or without .html) to the canonical
     URL so there's a single indexable page per profile. */
  const brandCanon = pathname.match(/^\/brand-profile-([a-z0-9-]+)(?:\.html)?$/);
  if (brandCanon) {
    res.writeHead(301, { Location: `/brands/${brandCanon[1]}` });
    return res.end();
  }
  const personCanon = pathname.match(/^\/person-profile-([a-z0-9-]+)(?:\.html)?$/);
  if (personCanon) {
    res.writeHead(301, { Location: `/people/${personCanon[1]}` });
    return res.end();
  }

  if (REWRITES[pathname]) pathname = REWRITES[pathname];
  else if (DESIGN_PILLAR_PLACEHOLDER_RE.test(pathname)) pathname = '/design-architecture.html';
  else {
    const m = pathname.match(DESIGN_ARTICLE_RE);
    if (m) {
      const slug = m[1].toLowerCase();
      pathname = DESIGN_COLLECTION_SLUGS.has(slug)
        ? '/design-heritage.html'   // known collection → Heritage template as demo
        : '/design-article.html';   // unknown slug → article template
    } else {
      const v = pathname.match(VOICES_ARTICLE_RE);
      if (v) {
        const slug = v[1].toLowerCase();
        pathname = VOICES_SERIES_SLUGS.has(slug)
          ? '/voices.html'          // series → landing filtered by franchise
          : '/voices-article.html'; // everything else → one piece
      } else {
        /* Auto-fallback for /brands/{slug} and /people/{slug} added
           AFTER the REWRITES map was snapshotted at boot. This lets a
           freshly-committed brand-profile-{slug}.html / person-profile-
           {slug}.html resolve WITHOUT a serve.mjs restart. The lookup
           is safe: if the file does not exist, send() throws and the
           404 fires normally. It does not become a catch-all: only
           slugs that map to a real file resolve, so the memory rule
           "no /brands/:slug catch-all — cross-contamination risk"
           still holds (an unbuilt tenant simply 404s). */
        const b = pathname.match(/^\/brands\/([a-z0-9-]+)$/);
        if (b) pathname = '/brand-profile-' + b[1] + '.html';
        else {
          const p = pathname.match(/^\/people\/([a-z0-9-]+)$/);
          if (p) pathname = '/person-profile-' + p[1] + '.html';
        }
      }
    }
  }
  const send = async (p) => {
    const safePath = normalize(p).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(__dirname, safePath);
    const s = await stat(filePath);
    if (s.isDirectory()) {
      let data = await readFile(join(filePath, 'index.html'), 'utf-8');
      data = injectReload(data);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return res.end(data);
    }
    const ext = extname(filePath).toLowerCase();
    if (ext === '.html') {
      let data = await readFile(filePath, 'utf-8');
      data = injectReload(data);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return res.end(data);
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  };

  try {
    await send(pathname);
  } catch {
    // Not at the root — try the _dev/ archive under the same page name, so
    // prototypes and the component catalog keep their original URLs.
    const dev = devLookup(pathname);
    if (dev) {
      try { return await send(dev); } catch { /* fall through to 404 */ }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + pathname);
  }
}).listen(PORT, () => {
  console.log(`\n  Ghar.tv dev server → http://localhost:${PORT}`);
  console.log(`  Live-reload WebSocket → ws://localhost:${WS_PORT}\n`);
});
