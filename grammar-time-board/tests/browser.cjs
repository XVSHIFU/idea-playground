const { chromium, expect } = require(process.env.GRAMMAR_PLAYWRIGHT_MODULE || '@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  const out = path.resolve(__dirname, '../.impeccable/review');
  fs.mkdirSync(out, { recursive: true });
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('#turn-heading')).toHaveText('轮到玩家 A说一句');
  await expect(page.locator('#commit')).toBeEnabled();
  await page.screenshot({ path: path.join(out, 'desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'mobile.png'), fullPage: true });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const choose = async (mode, action) => {
    await page.locator(`[data-mode="${mode}"]`).click();
    await page.locator(`[data-action="${action}"]`).click();
  };
  const next = async () => page.locator('[data-result="next"]').click();
  const rest = async () => { await page.locator('#rest').click(); await next(); };
  // Invalid immediate actions explain prerequisites, then a promise survives reload.
  await choose('now', 'open');
  await expect(page.locator('#commit')).toBeDisabled();
  await expect(page.locator('#move-summary')).toContainText('钥匙必须在你手里');
  await choose('future', 'repair');
  await page.locator('#sentence').fill('我答应，下回合把这座桥修好。');
  await page.locator('#commit').click();
  await expect(page.locator('#future-track')).toContainText('我答应，下回合把这座桥修好。');
  await page.reload();
  await expect(page.locator('#announcement')).toContainText('已接回上一局');
  await expect(page.locator('#future-track')).toContainText('我答应');
  await next(); await rest();
  await expect(page.locator('#bridge-state')).toHaveText('桥已经修好');
  await expect(page.locator('.player').first()).toContainText('3 信用');
  await choose('now', 'take'); await page.locator('#commit').click(); await next(); await rest();
  await choose('past', 'open'); await page.locator('#commit').click();
  await expect(page.locator('#turn-result')).toContainText('你让它们成真了');
  await expect(page.locator('#goal-summary')).toContainText('3 / 3');
  await page.screenshot({ path: path.join(out, 'victory.png'), fullPage: true });
  // A new four-player game accepts names safely, enables table rules, and rotates start.
  await page.locator('#new-game').click();
  await page.locator('#player-count').selectOption('4');
  await page.locator('#name-0').fill('<b>小桥</b>');
  await page.locator('#first-player').selectOption('0');
  await page.locator('#enable-house').check();
  await page.locator('#setup-form button[type="submit"]').click();
  await expect(page.locator('.player')).toHaveCount(4);
  expect(await page.locator('.player-info b').count()).toBe(0);
  await page.locator('#house-proposal summary').click();
  await page.locator('#propose').click();
  for (const name of ['玩家 B', '玩家 C', '玩家 D']) {
    await expect(page.locator('#turn-heading')).toContainText(name);
    await page.locator('[data-result="yes"]').click();
  }
  await expect(page.locator('#house-status')).toContainText('第 2 轮生效');
  await next(); await rest(); await rest(); await rest();
  await expect(page.locator('#house-status')).toContainText('已生效');
  await expect(page.locator('#house-proposal')).toBeHidden();
  // False conditions expire once; active-progress cancellation is visible on the board.
  await choose('condition', 'repair');
  await page.locator('#condition-select').selectOption('door:open');
  await page.locator('#commit').click(); await next();
  await rest(); await rest(); await rest();
  await expect(page.locator('#condition-track .pending')).toHaveCount(0);
  await expect(page.locator('#bridge-state')).toHaveText('桥还坏着');
  await choose('progress', 'repair'); await page.locator('#commit').click(); await next();
  await choose('now', 'repair'); await page.locator('#commit').click();
  await expect(page.locator('#progress-track .cancelled')).toContainText('被打断');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'mobile-pending.png'), fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  // Restart cancellation keeps the existing game. Rules and keyboard focus remain usable.
  await page.locator('#new-game').click(); await page.keyboard.press('Escape');
  await expect(page.locator('#setup-dialog')).not.toBeVisible();
  await expect(page.locator('#bridge-state')).toHaveText('桥已经修好');
  await page.locator('#rules-toggle').click(); await expect(page.locator('#rules')).toBeVisible();
  await page.locator('#rules-toggle').click(); await expect(page.locator('#rules')).toBeHidden();
  expect(errors).toEqual([]);
  await browser.close();
  console.log('PASS: file:// offline play, invalid actions, promises, persistence, victory, 4 players, unanimous rules, conditions, interruption, restart cancellation, and responsive widths; no page errors.');
})().catch(error => { console.error(error); process.exit(1); });
