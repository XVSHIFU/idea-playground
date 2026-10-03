const { chromium } = require(process.env.CLAY_PLAYWRIGHT_MODULE || '../../protocol-zoo/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  const output = path.join(root, '.impeccable/review'); await fs.mkdir(output, { recursive: true });
  const url = pathToFileURL(path.join(root, 'index.html')).href;
  const tap = async (x, y) => { const box = await page.locator('#stage').boundingBox(); await page.mouse.click(box.x + x / 800 * box.width, box.y + y / 570 * box.height); };
  let server;
  try {
    await page.goto(url); await page.locator('#turn-heading').waitFor();
    assert.match(await page.locator('#turn-heading').innerText(), /甲/);
    await tap(100, 100); assert.equal(await page.locator('#bid').isDisabled(), true);
    await tap(400, 350); assert.equal(await page.locator('#bid').isEnabled(), true);
    await page.locator('#bid').click(); assert.match(await page.locator('#turn-heading').innerText(), /乙/);
    await page.locator('[data-shape=rod]').click(); await tap(450, 300); await page.locator('#bid').click();
    assert.match(await page.locator('#turn-heading').innerText(), /丙/);
    await page.locator('[data-shape=arch]').click(); await tap(400, 270); await page.locator('#bid').click();
    await page.locator('#wish').fill('一只有提梁的小篮子'); await page.locator('#wish-form button').click();
    assert.match(await page.locator('#history').innerText(), /小篮子/);
    await page.reload(); assert.equal(await page.locator('#pieces > g').count(), 3); assert.match(await page.locator('#wish').inputValue(), /小篮子/);
    await page.locator('#timeline').fill('1'); assert.equal(await page.locator('#pieces > g').count(), 1); assert.equal(await page.locator('#exit').isDisabled(), true);
    await page.locator('#return-now').click(); assert.equal(await page.locator('#pieces > g').count(), 3);
    await page.locator('#stage').focus(); await page.keyboard.press('ArrowRight'); assert.equal(await page.locator('#draft > g').count(), 1);
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#draft > g').count(), 0);
    await page.locator('#freehand').click();
    const box = await page.locator('#stage').boundingBox();
    await page.mouse.move(box.x + 360 / 800 * box.width, box.y + 392 / 570 * box.height); await page.mouse.down();
    await page.mouse.move(box.x + 440 / 800 * box.width, box.y + 385 / 570 * box.height, { steps: 10 }); await page.mouse.up();
    assert.equal(await page.locator('#bid').isEnabled(), true); await page.locator('#bid').click();
    const layout = [];
    for (const width of [1440, 390, 320, 768]) {
      await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      layout.push({ width, overflow }); assert.equal(overflow, false, `overflow ${width}`);
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, width === 1440 ? 'desktop.png' : 'mobile.png'), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (let i = 0; i < 2; i++) { await page.locator('#exit').click(); await page.locator('#confirm-exit').click(); }
    assert.match(await page.locator('#result-heading').innerText(), /甲/);
    await page.locator('#art-title').fill('大家的篮子');
    const downloadEvent = page.waitForEvent('download'); await page.locator('#download').click(); const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), '大家的篮子.svg'); const artifact = path.join(output, 'export.svg'); await download.saveAs(artifact);
    assert.match(await fs.readFile(artifact, 'utf8'), /大家的篮子/);
    await page.screenshot({ path: path.join(output, 'finished.png'), fullPage: true });
    await page.reload(); assert.match(await page.locator('#work-title').innerText(), /大家的篮子/); assert.equal(await page.locator('#result').isVisible(), true);
    await page.locator('#new-game').click(); await page.locator('[name=name0]').fill('新玩家'); await page.locator('#first').selectOption('1'); await page.locator('#setup-form button[type=submit]').click();
    assert.match(await page.locator('#turn-heading').innerText(), /乙/);
    for (let i = 0; i < 3; i++) { await page.locator('#exit').click(); await page.locator('#confirm-exit').click(); }
    assert.match(await page.locator('#result-heading').innerText(), /流拍/);
    const rules = await ctx.newPage(); await rules.goto(pathToFileURL(path.join(root, 'rules.html')).href); assert.match(await rules.locator('h1').innerText(), /拍卖会/); await rules.close();
    const blocked = await browser.newContext(); await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('denied'); }; });
    const blockedPage = await blocked.newPage(); await blockedPage.goto(url); assert.match(await blockedPage.locator('#storage-status').innerText(), /无法保存/); await blocked.close();
    server = spawn(process.execPath, ['server.cjs'], { cwd: root, env: { ...process.env, PORT: '14193' }, windowsHide: true });
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', code => reject(new Error(`server exited ${code}`))); });
    assert.equal((await fetch('http://127.0.0.1:14193/')).status, 200);
    for (const file of ['README.md', 'PRODUCT.md', 'integration.json', 'tests/browser.cjs', '%2e%2e/package.json']) assert.equal((await fetch(`http://127.0.0.1:14193/${file}`)).status, 404, file);
    assert.deepEqual(errors, []); await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify({ layout, pageErrors: errors, checks: ['round', 'attachment', 'freehand', 'keyboard', 'wish', 'history', 'restore', 'export', 'restart', 'unsold', 'storage-denied', 'resource-boundary'] }, null, 2));
    console.log(JSON.stringify({ layout, pageErrors: errors, result: 'passed' }, null, 2));
  } finally { if (server) server.kill(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
