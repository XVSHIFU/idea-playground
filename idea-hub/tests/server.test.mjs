import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, writeFile, unlink, rmdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHub } from '../server.mjs';

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server.address().port;
}
async function close(server) { await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); }
async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'idea-hub-test-'));
  const files = { 'index.html': '<title>Test Project</title><p>ready</p>', 'app.js': 'console.log(1)', 'print.html': '<title>Test Print</title>', 'secret.md': 'private' };
  for (const [name, data] of Object.entries(files)) await writeFile(path.join(directory, name), data);
  t.after(async () => { for (const name of Object.keys(files)) { try { await unlink(path.join(directory, name)); } catch {} } await rmdir(directory); });
  const probe = http.createServer(); const port = await listen(probe); await close(probe);
  const project = { id: 'test', name: 'Test', directory, port, entry: 'index.html', required: ['index.html', 'app.js'], files: ['index.html', 'app.js', 'print.html'], identity: 'Test Project', fallback: 'print.html', fallbackLabel: 'Print' };
  return { directory, project };
}

test('concurrent entry requests start one server; only declared resources are served', async t => {
  const { project } = await fixture(t);
  const hub = await createHub({ port: 0, catalog: [project] }); t.after(hub.close);
  const responses = await Promise.all([fetch(`${hub.url}/open/test`), fetch(`${hub.url}/open/test`)]);
  assert.ok(responses.every(r => r.ok && r.url === `http://127.0.0.1:${project.port}/index.html`));
  const origin = `http://127.0.0.1:${project.port}`;
  for (const route of ['/secret.md', '/server.mjs', '/.env', '/%2e%2e%2fsecret.md', '/%5csecret.md']) assert.equal((await fetch(origin + route)).status, 404, route);
  assert.equal((await fetch(origin + '/%ZZ')).status, 400);
  assert.equal((await fetch(origin + '/index.html', { method: 'POST' })).status, 405);
  assert.equal((await fetch(hub.url + '/projects.json')).status, 404);
  assert.equal((await fetch(hub.url + '/open/unknown')).status, 404);
  assert.equal((await fetch(origin + '/app.js')).headers.get('content-type'), 'text/javascript; charset=utf-8');
});

test('incomplete web app uses working fallback; missing fallback becomes unavailable', async t => {
  const { directory, project } = await fixture(t);
  await unlink(path.join(directory, 'app.js'));
  const hub = await createHub({ port: 0, catalog: [project] }); t.after(hub.close);
  let catalog = await (await fetch(hub.url + '/api/projects')).json();
  assert.equal(catalog[0].action, 'Print');
  assert.equal((await fetch(hub.url + '/open/test')).url, `http://127.0.0.1:${project.port}/print.html`);
  await unlink(path.join(directory, 'print.html'));
  catalog = await (await fetch(hub.url + '/api/projects')).json();
  assert.equal(catalog[0].available, false);
  assert.equal((await fetch(hub.url + '/open/test')).status, 503);
});

test('occupied port rejects unrelated app; reuses matching app without owning its lifetime', async t => {
  const { project } = await fixture(t);
  let title = 'Different Application';
  const external = http.createServer((req, res) => res.end(`<title>${title}</title>`));
  project.port = await listen(external); t.after(() => close(external));
  const hub = await createHub({ port: 0, catalog: [project] });
  try {
    const response = await fetch(hub.url + '/open/test');
    assert.equal(response.status, 503);
    assert.match(await response.text(), /被其他程序占用/);
    title = 'Test Project';
    assert.equal((await fetch(hub.url + '/open/test')).status, 200);
  } finally { await hub.close(); }
  assert.equal((await fetch(`http://127.0.0.1:${project.port}`)).status, 200);
});
