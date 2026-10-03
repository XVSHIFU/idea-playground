const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const URL = process.env.TEST_URL || 'http://127.0.0.1:4177';
const PREFIX = 'background-gods:v1:';
const getState = page => page.evaluate(prefix => JSON.parse(localStorage.getItem(prefix + 'being:' + sessionStorage.getItem(prefix + 'id'))), PREFIX);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  // Connect without Playwright's forced visibility. This uses an isolated profile, never the user's.
  const profile = path.join(ROOT, 'test-results', 'browser-profile-' + Date.now());
  fs.mkdirSync(profile, { recursive: true });
  const executable = process.env.BROWSER_EXE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  const processHandle = spawn(executable, ['--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, '--disable-extensions', '--disable-backgrounding-occluded-windows', '--no-first-run', '--no-default-browser-check', '--window-position=0,0', 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  processHandle.on('error', error => { console.error(error); });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 50 && !fs.existsSync(portFile); i++) await delay(200);
  if (!fs.existsSync(portFile)) { processHandle.kill(); throw Error('Browser did not expose its local debug port. Set BROWSER_EXE to an installed Chromium browser.'); }
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const browser = await chromium.connectOverCDP('http://127.0.0.1:' + port, { noDefaults: true });
  try {
    const context = browser.contexts()[0];
    const errors = [];
    context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
    fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });
    const a = await context.newPage(); await a.goto(URL); await a.bringToFront(); await expect(a.locator('#being-status')).toContainText('被你看见');
    const first = await getState(a);
    await a.locator('#help-toggle').click(); await expect(a.locator('#guide')).toBeVisible();
    await a.locator('#help-toggle').click(); await expect(a.locator('#guide')).toBeHidden();
    const popup = context.waitForEvent('page'); await a.locator('#create').click(); const b = await popup;
    await b.waitForLoadState(); await b.bringToFront(); await expect(b.locator('#being-status')).toContainText('被你看见');
    const second = await getState(b);
    assert.notEqual(first.id, second.id); assert.equal(second.parent, null);
    await expect.poll(() => a.evaluate(() => document.hidden)).toBe(true);
    await expect(b.locator('#living-count')).toContainText('2 个存在');
    await delay(13200);
    await expect.poll(async () => (await getState(b)).light, { timeout: 10000 }).toBeGreaterThanOrEqual(12);
    await a.bringToFront(); await expect(a.locator('#dreams')).not.toHaveText('0');
    assert.ok((await getState(a)).dark >= 12);
    assert.ok((await getState(b)).light >= 12);
    await a.reload(); await expect(a.locator('#being-status')).toContainText('被你看见');
    assert.equal((await getState(a)).id, first.id);
    await delay(2500); assert.equal((await getState(b)).received.length, 0);
    await expect(a.locator('#living-count')).toContainText('2 个存在');
    const branch = context.waitForEvent('page'); await a.locator('#fork').click(); const c = await branch;
    await c.waitForLoadState(); await expect(c.locator('#lineage')).toContainText('第 2 代');
    const child = await getState(c); assert.equal(child.parent, first.id);
    await expect(c.locator('#living-count')).toContainText('3 个存在');
    await delay(2000);
    await c.close({ runBeforeUnload: true }); await a.bringToFront();
    await expect.poll(async () => (await getState(a)).received.length + (await getState(b)).received.length, { timeout: 10000 }).toBe(1);
    await delay(1500);
    assert.equal((await getState(a)).received.length + (await getState(b)).received.length, 1);
    await expect(a.locator('.departed')).toHaveCount(1);
    // Reproduce the sessionStorage copy performed by browser Duplicate Tab.
    const duplicate = await context.newPage();
    await duplicate.addInitScript(({ prefix, id }) => sessionStorage.setItem(prefix + 'id', id), { prefix: PREFIX, id: first.id });
    await duplicate.goto(URL); await expect(duplicate.locator('#lineage')).toContainText('第 2 代');
    const forked = await getState(duplicate); assert.notEqual(forked.id, first.id); assert.equal(forked.parent, first.id);
    await duplicate.close({ runBeforeUnload: true });
    await a.bringToFront();
    await a.setViewportSize({ width: 1440, height: 1000 }); await a.emulateMedia({ reducedMotion: 'reduce' });
    await a.screenshot({ path: path.join(ROOT, 'test-results/desktop-lived.png'), fullPage: true });
    for (const width of [320, 390, 768, 1440]) {
      await a.setViewportSize({ width, height: 900 });
      assert.equal(await a.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      if (width === 390) await a.screenshot({ path: path.join(ROOT, 'test-results/mobile.png'), fullPage: true });
    }
    // Fallback uses storage events if BroadcastChannel is unavailable.
    const fallback = await browser.newContext();
    await fallback.addInitScript(() => { window.BroadcastChannel = undefined; });
    const f1 = await fallback.newPage(); await f1.goto(URL); await expect(f1.locator('#connection')).toContainText('静默共生');
    const f2 = await fallback.newPage(); await f2.goto(URL); await expect(f2.locator('#living-count')).toContainText('2 个存在');
    await expect(f1.locator('#living-count')).toContainText('2 个存在');
    await fallback.close();
    assert.deepEqual(errors, []);
    console.log('PASS: real multi-tab visibility, darkness catch-up, independent creation, fork, reload continuity, close/inheritance exactly once, copied-session collision, storage fallback, help, 320/390/768/1440 layouts. No page errors.');
  } finally {
    if (browser.isConnected()) {
      const shutdown = await browser.newBrowserCDPSession();
      await shutdown.send('Browser.close').catch(() => {});
      await browser.close();
    }
    processHandle.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
