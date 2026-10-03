import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, rm, unlink, realpath } from 'node:fs/promises';
import { createProject, registerProject } from '../project.mjs';
import { loadProjects, readJson, validateProjects, exists } from '../catalog.mjs';
import { buildSite } from '../build.mjs';
import { createPreview } from '../preview.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'idea-playground-test-'));
  t.after(async () => {
    const canonical = await realpath(root);
    if (path.dirname(canonical) !== await realpath(os.tmpdir()) || !path.basename(canonical).startsWith('idea-playground-test-')) throw new Error('Unsafe test cleanup');
    await rm(canonical, { recursive: true, force: true });
  });
  await mkdir(path.join(root, 'idea-hub/public'), { recursive: true });
  await writeFile(path.join(root, 'idea-hub/projects.json'), '[]');
  for (const [name, text] of Object.entries({ 'index.html': '<title>Hub</title><a href="./open/test-project">Go</a>', 'app.js': "fetch('./catalog.json')", 'style.css': 'body{}', 'favicon.svg': '<svg/>' })) await writeFile(path.join(root, 'idea-hub/public', name), text);
  return root;
}

test('initializer creates isolated hidden draft; enabling validates and updates same record', async t => {
  const root = await fixture(t);
  await createProject('test-project', { root, name: '测试 <作品>' });
  let catalog = await loadProjects(root);
  assert.equal(catalog.length, 1); assert.equal(catalog[0].enabled, false);
  assert.match(await readFile(path.join(root, 'test-project/index.html'), 'utf8'), /测试 &lt;作品&gt;/);
  await assert.rejects(createProject('test-project', { root }), /already exists/);
  await assert.rejects(createProject('../outside', { root }), /lowercase/);
  await registerProject('test-project', { root, enable: true });
  catalog = await loadProjects(root); assert.equal(catalog.length, 1); assert.equal(catalog[0].enabled, true);
  await createProject('next-project', { root });
  catalog = await loadProjects(root); assert.notEqual(catalog[0].port, catalog[1].port);
});

test('build exports only declared assets, rewrites entry, and serves under repository subpath', async t => {
  const root = await fixture(t);
  await createProject('test-project', { root });
  await createProject('draft-project', { root });
  await registerProject('test-project', { root, enable: true });
  await writeFile(path.join(root, 'test-project/private.txt'), 'DO NOT PUBLISH');
  const output = await buildSite(root);
  const catalog = await readJson(path.join(output, 'catalog.json'));
  assert.equal(catalog.length, 1); assert.equal(catalog[0].preview, null);
  assert.equal(await exists(path.join(output, 'projects/test-project/private.txt')), false);
  assert.equal(await exists(path.join(output, 'projects/draft-project/index.html')), false);
  assert.match(await readFile(path.join(output, 'index.html'), 'utf8'), /\.\/projects\/test-project\/index.html/);
  const preview = await createPreview({ port: 0, root: output, base: '/nested-repository/' });
  try {
    assert.equal((await fetch(new URL(catalog[0].url, preview.url))).status, 200);
    assert.equal((await fetch(new URL('style.css', preview.url))).status, 200);
    assert.equal((await fetch(new URL('/style.css', preview.url))).status, 404);
    assert.equal((await fetch(new URL('./%2e%2e%2fpackage.json', preview.url))).status, 404);
  } finally { await preview.close(); }
});

test('catalog rejects path escapes, duplicate ports, and missing declared assets', async t => {
  const root = await fixture(t);
  await createProject('test-project', { root });
  const catalog = await loadProjects(root);
  await assert.rejects(validateProjects([{ ...catalog[0], files: ['../secret.txt'] }], root), /unsafe/);
  await assert.rejects(validateProjects([{ ...catalog[0], directory: '../other' }], root), /directory/);
  await assert.rejects(validateProjects([catalog[0], { ...catalog[0], id: 'second' }], root), /port/);
  await registerProject('test-project', { root, enable: true });
  await unlink(path.join(root, 'test-project/app.js'));
  await assert.rejects(buildSite(root), /missing/);
});

test('incomplete primary app can publish explicitly declared usable fallback', async t => {
  const root = await fixture(t);
  await createProject('test-project', { root });
  const manifestPath = path.join(root, 'test-project/integration.json');
  const manifest = await readJson(manifestPath);
  manifest.fallback = 'print.html'; manifest.fallbackLabel = '打开纸笔版'; manifest.files.push('print.html');
  await writeFile(manifestPath, JSON.stringify(manifest));
  await writeFile(path.join(root, 'test-project/print.html'), '<title>Print</title>');
  await unlink(path.join(root, 'test-project/app.js'));
  await registerProject('test-project', { root, enable: true });
  const output = await buildSite(root);
  assert.equal((await readJson(path.join(output, 'catalog.json')))[0].url, './projects/test-project/print.html');
});
