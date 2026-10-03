import http from 'node:http';
import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ROOT, inside, PUBLIC_EXTENSIONS } from './catalog.mjs';

export async function createPreview({ port = Number(process.env.PREVIEW_PORT || 4201), root = path.join(ROOT, 'dist'), base = '/idea-playground/' } = {}) {
  const canonicalRoot = await realpath(root);
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
  const server = http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/') { res.writeHead(302, { Location: base }); return res.end(); }
      if (!pathname.startsWith(base)) throw new Error('not found');
      let name = pathname.slice(base.length) || 'index.html';
      if (name.endsWith('/')) name += 'index.html';
      if (name.includes('\\') || name.split('/').some(part => part.startsWith('.'))) throw new Error('not found');
      const target = await realpath(path.resolve(canonicalRoot, name));
      if (!inside(canonicalRoot, target) || !PUBLIC_EXTENSIONS.has(path.extname(target)) || !(await stat(target)).isFile()) throw new Error('not found');
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(req.method === 'HEAD' ? '' : body);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}${base}`, close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }) };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const preview = await createPreview(); console.log(`Pages preview: ${preview.url}`);
}
