import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || path.resolve(root, '../protocol-zoo/node_modules/@playwright/test'));
const origin = process.env.HUB_URL || 'http://127.0.0.1:4200';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const directory = path.join(root, 'public/previews');
await mkdir(directory, { recursive: true });
const projects = await (await fetch(`${origin}/api/projects`)).json();
const provenance = [];
try {
  for (const project of projects) {
    if (!project.available) continue;
    const context = await browser.newContext({ viewport: { width: 1100, height: 740 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(new URL(project.url, `${origin}/`).href);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(directory, `${project.id}.png`), animations: 'disabled' });
    provenance.push({ file: `${project.id}.png`, origin: page.url(), captured: new Date().toISOString(), description: 'Actual local project screenshot in an isolated browser context; no user profile or existing save data.' });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(path.join(root, '.impeccable/preview-origins.json'), JSON.stringify(provenance, null, 2));
console.log(`Captured ${provenance.length} project previews.`);
