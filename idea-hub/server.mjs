import http from 'node:http';
import path from 'node:path';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon', '.webp': 'image/webp', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const exists = async file => { try { return (await stat(file)).isFile(); } catch { return false; } };
const inside = (base, target) => { const relative = path.relative(base, target); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); };

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

export async function serveFile(req, res, directory, files, publicDirectories = []) {
  if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Method not allowed');
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//, '') || 'index.html'; }
  catch { return send(res, 400, 'Bad request'); }
  if (name.includes('\\') || name.includes('\0') || name.split('/').some(part => part === '..' || part.startsWith('.'))) return send(res, 404, 'Not found');
  const ext = path.extname(name).toLowerCase();
  if (!mime[ext] || (!files.includes(name) && !publicDirectories.some(dir => name.startsWith(`${dir}/`)))) return send(res, 404, 'Not found');
  try {
    const [base, target] = await Promise.all([realpath(directory), realpath(path.resolve(directory, name))]);
    if (!inside(base, target)) return send(res, 404, 'Not found');
    const body = await readFile(target);
    send(res, 200, req.method === 'HEAD' ? '' : body, mime[ext]);
  } catch { send(res, 404, 'Not found'); }
}

export async function createHub({ port = Number(process.env.PORT || 4200), catalog, baseDirectory = root } = {}) {
  const projects = (catalog || JSON.parse(await readFile(path.join(root, 'projects.json'), 'utf8'))).filter(p => p.enabled !== false);
  const listeners = new Map();
  const starting = new Map();
  async function entryFor(project) {
    const directory = path.resolve(baseDirectory, project.directory);
    const ready = (await Promise.all(project.required.map(file => exists(path.join(directory, file))))).every(Boolean);
    if (ready) return project.entry;
    return project.fallback && await exists(path.join(directory, project.fallback)) ? project.fallback : null;
  }
  async function ensureProject(project) {
    if (listeners.has(project.id)) return;
    if (starting.has(project.id)) return starting.get(project.id);
    const pending = (async () => {
      const server = http.createServer((req, res) => serveFile(req, res, path.resolve(baseDirectory, project.directory), project.files, project.publicDirectories));
      try {
        await new Promise((resolve, reject) => {
          server.once('error', reject);
          server.listen(project.port, '127.0.0.1', resolve);
        });
        listeners.set(project.id, server);
      } catch (error) {
        if (error.code !== 'EADDRINUSE') throw error;
        try {
          const response = await fetch(`http://127.0.0.1:${project.port}/${await entryFor(project)}`, { signal: AbortSignal.timeout(1800), redirect: 'error' });
          const html = await response.text();
          const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
          if (!response.ok || !title.includes(project.identity)) throw new Error('identity mismatch');
        } catch { throw new Error(`端口 ${project.port} 被其他程序占用。请关闭占用该端口的程序，再回到入口重试。`); }
      }
    })();
    starting.set(project.id, pending);
    try { return await pending; } finally { starting.delete(project.id); }
  }
  const server = http.createServer(async (req, res) => {
    try {
      const route = new URL(req.url, 'http://localhost').pathname;
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Method not allowed');
      if (route === '/api/health') return send(res, 200, JSON.stringify({ app: 'idea-hub' }), mime['.json']);
      if (route === '/api/projects' || route === '/catalog.json') {
        const publicProjects = await Promise.all(projects.map(async p => {
          const entry = await entryFor(p);
          return { id: p.id, name: p.name, category: p.category, description: p.description, hint: p.hint, label: p.label, color: p.color,
            available: !!entry, action: entry === p.fallback ? p.fallbackLabel : '进入体验', url: `./open/${p.id}`, preview: await exists(path.join(root, 'public/previews', `${p.id}.png`)) ? `./previews/${p.id}.png` : null };
        }));
        return send(res, 200, JSON.stringify(publicProjects), mime['.json']);
      }
      if (route.startsWith('/open/')) {
        const project = projects.find(p => route === `/open/${p.id}`);
        if (!project) return send(res, 404, 'Unknown project');
        const entry = await entryFor(project);
        if (!entry) throw new Error('作品文件尚未齐备。请等待该项目完成，或检查项目目录后重试。');
        await ensureProject(project);
        res.writeHead(302, { Location: `http://127.0.0.1:${project.port}/${entry}`, 'Cache-Control': 'no-store' });
        return res.end();
      }
      return serveFile(req, res, path.join(root, 'public'), ['index.html', 'style.css', 'app.js', 'favicon.svg'], ['previews']);
    } catch (error) {
      const message = String(error.message).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
      send(res, 503, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>暂时无法打开 · 小创意游乐场</title><link rel="stylesheet" href="/style.css"><main class="error-page"><h1>这扇门暂时没打开。</h1><p>${message}</p><a href="/">回到游乐场</a><p>处理后可以刷新此页重试。</p></main></html>`, mime['.html']);
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}`, close: async () => {
    await Promise.allSettled([...starting.values()]);
    await Promise.all([server, ...listeners.values()].map(s => new Promise(resolve => { s.close(resolve); s.closeAllConnections(); })));
  } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const hub = await createHub();
  console.log(`小创意游乐场 ${hub.url}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await hub.close(); process.exit(0); });
}
