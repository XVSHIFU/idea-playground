import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const allowed = new Set(['/index.html', '/app.js', '/engine.js', '/style.css', '/favicon.svg']);
const port = Number(process.env.PORT || 4177);
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const route = pathname === '/' ? '/index.html' : pathname;
  if (!allowed.has(route)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(path.join(root, route));
    res.writeHead(200, { 'Content-Type': `${types[path.extname(route)]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Unable to read application file'); }
}).listen(port, '127.0.0.1', () => console.log(`后台诸神 http://127.0.0.1:${port}`));
