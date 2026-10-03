const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const allowed = new Set(['index.html', 'style.css', 'engine.js', 'app.js']);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const server = http.createServer((req, res) => {
  const filename = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!allowed.has(filename)) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(__dirname, filename), (err, content) => {
    if (err) { res.writeHead(500); return res.end('Unable to read file'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(filename)], 'Cache-Control': 'no-store' }); res.end(content);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(Number(process.env.PORT) || 4173, '127.0.0.1', () => console.log(`Protocol Zoo: http://127.0.0.1:${server.address().port}`));
