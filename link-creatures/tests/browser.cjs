// Set PLAYWRIGHT_PATH to an existing @playwright/test installation if needed.
const { chromium, expect } = require(process.env.PLAYWRIGHT_PATH || '@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  fs.mkdirSync('test-results', { recursive: true });
  await page.goto('http://127.0.0.1:4178/#v=1&id=abcde12345&h=108&s=65&l=3&r=30&c=25&m=12&g=0&e=0');
  await expect(page.locator('#creature-name')).toHaveText('苔芽·慢慢');
  const firstURL = page.url();
  await page.locator('#creature').click();
  await expect(page.locator('#response')).toContainText('触角');
  await page.locator('#rename').click(); await page.locator('#name-input').fill('苔芽·小满');
  await page.locator('#rename-form button').click();
  await page.reload(); await expect(page.locator('#creature-name')).toHaveText('苔芽·小满');
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  const namedURL = page.url();
  await page.locator('#reproduce').click();
  await expect(page.locator('#seed-result')).toBeVisible();
  const childURL = await page.locator('#seed-url').inputValue();
  expect(childURL).not.toEqual(namedURL); expect(page.url()).toEqual(namedURL);
  await page.locator('#copy-seed').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(childURL);
  await page.locator('#visit-seed').click(); await expect(page.locator('#generation')).toContainText('第 1 代');
  await page.goBack(); await expect(page.locator('#creature-name')).toHaveText('苔芽·小满');
  await page.locator('#cross-toggle').click();
  await page.locator('#parent-b').fill('not-a-seed'); await page.locator('#cross-form button').click();
  await expect(page.locator('#cross-error')).toContainText('无法识别');
  await page.locator('#parent-b').fill(namedURL); await page.locator('#cross-form button').click();
  await expect(page.locator('#cross-error')).toContainText('同一只');
  await page.locator('#parent-b').fill(childURL); await page.locator('#cross-form button').click();
  await expect(page.locator('#mutation-note')).toContainText('两位亲代');
  const mixedURL = await page.locator('#seed-url').inputValue();
  await page.locator('#visit-seed').click(); await expect(page.locator('#generation')).toHaveText('第 2 代 · 混合后代');
  await page.locator('.environment summary').click();
  const before = await page.locator('#organism').innerHTML();
  await page.locator('#light-mode').selectOption('night'); await page.locator('#space-mode').selectOption('narrow');
  expect(await page.locator('#organism').innerHTML()).not.toEqual(before);
  expect(page.url()).toEqual(mixedURL);
  await page.locator('#light-mode').selectOption('day'); await page.locator('#space-mode').selectOption('auto');
  await page.locator('.environment summary').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#space-value')).toHaveText('紧凑空间');
  await expect(page.locator('#toast')).toBeHidden();
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  // Keyboard interaction and reduced-motion support.
  await page.locator('#creature').focus(); await page.keyboard.press('Enter');
  expect(await page.locator('.living').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  // Corrupt links retain an existing observed seed rather than crashing.
  await page.evaluate(() => { location.hash = 'v=99'; });
  await expect(page.locator('#toast')).toContainText('已保留当前生物');
  // Independent environment opens the exact same genes.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mobilePage = await mobile.newPage(); await mobilePage.goto(firstURL);
  await expect(mobilePage.locator('#creature-name')).toHaveText('苔芽·慢慢');
  await expect(mobilePage.locator('#input-value')).toHaveText('触摸陪伴');
  await mobilePage.locator('#creature').tap(); await expect(mobilePage.locator('#response')).toContainText('触角');
  // file:// use and storage failures are supported explicitly.
  const local = await browser.newContext();
  await local.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  const localPage = await local.newPage(); localPage.on('pageerror', e => errors.push(e.message));
  await localPage.goto(pathToFileURL(path.resolve('index.html')).href);
  await expect(localPage.locator('#creature-name')).not.toBeEmpty();
  await expect(localPage.locator('.local-note')).toContainText('不可用');
  await localPage.locator('#reproduce').click(); await expect(localPage.locator('#seed-result')).toBeVisible();
  expect(errors).toEqual([]);
  // A legal unbroken name must wrap rather than widen the viewport.
  await page.locator('#rename').click();
  await page.locator('#name-input').fill('W'.repeat(24));
  await page.locator('#rename-form button').click();
  await page.locator('#reproduce').click();
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const heading = await page.locator('#creature-name').boundingBox();
    const sidebar = await page.locator('.specimen').boundingBox();
    expect(heading.x + heading.width).toBeLessThanOrEqual(sidebar.x + sidebar.width + 1);
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.screenshot({ path: `test-results/long-name-${width}.png`, fullPage: true });
  }
  await browser.close();
  console.log('PASS: rename/reload, reproduction, clipboard, ancestry, back navigation, hybrid errors/success, environment, keyboard, touch, 320/390/768/1440 widths, file URL, blocked storage; zero page errors.');
})().catch(error => { console.error(error); process.exit(1); });
