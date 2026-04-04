import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
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
    ws = new WebSocket('ws://localhost:${WS_PORT}');
    ws.onmessage = function(e){ if(e.data === 'reload') location.reload(); };
    ws.onclose = function(){ setTimeout(connect, 1000); };
  }
  connect();
})();
</script>
`;

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

// HTTP server
createServer(async (req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(__dirname, safePath);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) {
      let data = await readFile(join(filePath, 'index.html'), 'utf-8');
      data = data.replace('</body>', RELOAD_SCRIPT + '</body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return res.end(data);
    }
    const ext = extname(filePath).toLowerCase();
    if (ext === '.html') {
      let data = await readFile(filePath, 'utf-8');
      data = data.replace('</body>', RELOAD_SCRIPT + '</body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return res.end(data);
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + pathname);
  }
}).listen(PORT, () => {
  console.log(`\n  Ghar.tv dev server → http://localhost:${PORT}`);
  console.log(`  Live-reload WebSocket → ws://localhost:${WS_PORT}\n`);
});
