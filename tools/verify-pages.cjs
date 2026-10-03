const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
let playwright;
if (process.env.PLAYWRIGHT_PATH) playwright = require(process.env.PLAYWRIGHT_PATH);
else { try { playwright = require('@playwright/test'); } catch { playwright = require('../protocol-zoo/node_modules/@playwright/test'); } }
const root = path.resolve(__dirname, '..');
(async () => {
  const { createPreview } = await import(pathToFileURL(path.join(__dirname, 'preview.mjs')));
  const preview = await createPreview({ port: 0 });
  const channel = process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium');
  const browser = await playwright.chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  const errors = [], checked = new Set();
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    context.on('page', page => {
      page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
      page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.push(`${response.status()} ${response.url()}`); });
      page.on('request', request => {
        const url = new URL(request.url());
        if (url.origin === new URL(preview.url).origin && !url.pathname.startsWith('/idea-playground/') && !url.pathname.endsWith('/favicon.ico')) errors.push(`Root-relative request: ${url.pathname}`);
      });
    });
    const page = await context.newPage();
    await page.goto(preview.url); await page.locator('.project').last().waitFor();
    const catalog = await (await fetch(new URL('catalog.json', preview.url))).json();
    assert.equal(await page.locator('.project').count(), catalog.length);
    await page.getByRole('searchbox').fill('缓存'); assert.equal(await page.locator('.project').count(), 1);
    await page.getByRole('searchbox').fill('not-a-project'); assert.equal(await page.locator('#empty').isVisible(), true);
    await page.locator('#clear').click();
    const popupPromise = page.waitForEvent('popup'); await page.locator('#random').click();
    const popup = await popupPromise; await popup.waitForLoadState(); assert.ok(popup.url().includes('/idea-playground/projects/')); await popup.close();
    const queue = catalog.map(project => new URL(project.url, preview.url).href);
    while (queue.length) {
      const url = queue.shift().split('#')[0]; if (checked.has(url)) continue; checked.add(url);
      const trial = await context.newPage(); await trial.goto(url); await trial.waitForTimeout(180);
      const links = await trial.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.href));
      for (const link of links) {
        const parsed = new URL(link); const clean = parsed.origin + parsed.pathname;
        if (parsed.origin !== new URL(preview.url).origin || !parsed.pathname.startsWith('/idea-playground/')) continue;
        if (parsed.pathname.endsWith('.html') && !checked.has(clean)) queue.push(clean);
        if (/\.(pdf|md|txt)$/.test(parsed.pathname)) assert.equal((await fetch(clean)).status, 200, clean);
      }
      await trial.close();
    }
    const output = path.join(root, '.impeccable/review/pages'); await fs.mkdir(output, { recursive: true });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width !== 320) await page.screenshot({ path: path.join(output, `${width}.png`), fullPage: true });
    }
    assert.deepEqual(errors, []);
    const report = { projectCount: catalog.length, pagesChecked: [...checked], errors, widths: [1440, 390, 320] };
    await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); await preview.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
