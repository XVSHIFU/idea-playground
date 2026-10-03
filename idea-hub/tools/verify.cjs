const { chromium } = require(process.env.PLAYWRIGHT_PATH || '../../protocol-zoo/node_modules/@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = process.env.HUB_URL || 'http://127.0.0.1:4200';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const output = path.join(root, '.impeccable/review'); await fs.mkdir(output, { recursive: true });
  try {
    await page.goto(origin); await page.locator('.project').last().waitFor();
    assert.equal(await page.locator('.project').count(), 7);
    await page.getByRole('button', { name: '数字生命' }).click(); assert.equal(await page.locator('.project').count(), 2);
    await page.getByRole('button', { name: '全部作品' }).click();
    await page.getByRole('searchbox').fill('缓存'); assert.equal(await page.locator('.project').count(), 1);
    await page.getByRole('searchbox').fill('找不到的作品'); assert.equal(await page.locator('#empty').isVisible(), true);
    await page.getByRole('button', { name: '查看全部作品' }).click(); assert.equal(await page.locator('.project').count(), 7);
    await page.getByRole('button', { name: '一起玩' }).click(); assert.equal(await page.locator('.project').count(), 2);
    await page.getByRole('searchbox').fill('越抢越变形'); assert.equal(await page.locator('.project').count(), 1);
    const clayCard = page.locator('[data-id="clay-auction"]');
    await clayCard.locator('img').evaluate(img => img.decode());
    const clayPopupPromise = page.waitForEvent('popup'); await clayCard.locator('.enter').click();
    const clayPopup = await clayPopupPromise; await clayPopup.waitForLoadState();
    assert.equal(new URL(clayPopup.url()).port, '4193');
    assert.match(await clayPopup.locator('#turn-heading').innerText(), /轮到甲/);
    await clayPopup.close();
    await page.getByRole('searchbox').fill(''); await page.getByRole('button', { name: '全部作品' }).click();
    const popupPromise = page.waitForEvent('popup'); await page.locator('#random').click();
    const popup = await popupPromise; await popup.waitForLoadState(); assert.notEqual(new URL(popup.url()).port, '4200'); await popup.close();
    const projects = await (await fetch(origin + '/api/projects')).json();
    const entryResults = [];
    for (const project of projects) {
      const trial = await context.newPage(); const failures = [];
      trial.on('pageerror', error => failures.push(error.message));
      trial.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      await trial.goto(new URL(project.url, origin + '/').href); await trial.waitForTimeout(500);
      assert.deepEqual(failures, [], project.id);
      entryResults.push({ id: project.id, title: await trial.title(), url: trial.url(), action: project.action });
      await trial.close();
    }
    const overflow = [];
    for (const width of [1440, 390, 320, 768]) {
      await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); window.scrollTo(0, 0); });
      overflow.push({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
      assert.equal(overflow.at(-1).overflow, false, `overflow at ${width}`);
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, width === 1440 ? 'desktop.png' : 'mobile.png'), fullPage: true, animations: 'disabled' });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const contrast = await page.evaluate(() => {
      const parse = color => color.match(/[\d.]+/g)?.map(Number);
      const luminance = rgb => rgb.slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      return [...document.querySelectorAll('body *')].filter(el => el.getClientRects().length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(el => {
        const style = getComputedStyle(el); let ancestor = el; let bg;
        while (ancestor) { const color = parse(getComputedStyle(ancestor).backgroundColor); if (color && (color.length < 4 || color[3] === 1)) { bg = color; break; } ancestor = ancestor.parentElement; }
        const fg = parse(style.color); if (!fg || !bg) return null;
        const lum = [luminance(fg), luminance(bg)].sort((a, b) => b - a); const ratio = (lum[0] + .05) / (lum[1] + .05);
        const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
        return ratio < (large ? 3 : 4.5) ? { text: el.textContent.trim().slice(0, 40), ratio, color: style.color, background: bg } : null;
      }).filter(Boolean);
    });
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify({ errors, entryResults, overflow, contrast }, null, 2));
    console.log(JSON.stringify({ entries: entryResults, overflow, contrast, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
