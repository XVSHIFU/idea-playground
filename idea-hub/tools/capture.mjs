import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSite } from '../../tools/build.mjs';
import { ROOT, loadProjects, publicProject, readJson } from '../../tools/catalog.mjs';
import { createPreview } from '../../tools/preview.mjs';

const require = createRequire(import.meta.url);
const directory = path.join(ROOT, 'idea-hub/public/previews');
const originsFile = path.join(ROOT, 'idea-hub/.impeccable/preview-origins.json');

function loadPlaywright() {
  if (process.env.PLAYWRIGHT_PATH) return require(process.env.PLAYWRIGHT_PATH);
  try {
    return require('@playwright/test');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    return require(path.join(ROOT, 'protocol-zoo/node_modules/@playwright/test'));
  }
}

async function capture(browser, baseUrl, project) {
  const context = await browser.newContext({
    viewport: { width: 1100, height: 740 }, deviceScaleFactor: 1, locale: 'zh-CN', reducedMotion: 'reduce'
  });
  try {
    const page = await context.newPage();
    const errors = new Set();
    page.on('pageerror', error => errors.add(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) errors.add(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', request => {
      if (request.failure()?.errorText !== 'net::ERR_ABORTED' && !request.url().endsWith('/favicon.ico')) {
        errors.add(`${request.failure()?.errorText} ${request.url()}`);
      }
    });
    const response = await page.goto(new URL(project.url, baseUrl).href, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`Could not open ${project.url}`);
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(800);
    if (errors.size) throw new Error([...errors].join('\n'));

    const file = `${project.id}.png`;
    await page.screenshot({ path: path.join(directory, file), animations: 'disabled' });
    return {
      file, origin: page.url(), captured: new Date().toISOString(),
      description: 'Actual project screenshot in an isolated browser context; no user profile or existing save data.'
    };
  } finally {
    await context.close();
  }
}

async function main(args) {
  const all = args.includes('--all');
  if (all && args.length !== 1) throw new Error('Use --all or list project IDs.');
  const projects = (await loadProjects()).filter(project => project.enabled !== false);
  for (const id of all ? [] : args) {
    if (!projects.some(project => project.id === id)) throw new Error(`Unknown or disabled project: ${id}`);
  }

  const hubUrl = process.env.HUB_URL;
  const cards = await Promise.all(projects.map(project => publicProject(project, ROOT, hubUrl ? 'local' : 'static')));
  const targets = cards.filter(card => all || (args.length ? args.includes(card.id) : !card.preview));
  if (!targets.length) {
    console.log('All enabled projects already have a preview.');
    return;
  }

  const origins = new Map((await readJson(originsFile)).map(record => [record.file, record]));
  const { chromium } = loadPlaywright();
  const executablePath = process.env.BROWSER_EXECUTABLE;
  const proxy = process.env.HTTPS_PROXY;
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    channel: process.env.BROWSER_CHANNEL || (!executablePath && process.platform === 'win32' ? 'msedge' : undefined),
    proxy: proxy ? { server: proxy, bypass: 'localhost,127.0.0.1' } : undefined
  });
  try {
    const preview = hubUrl ? null : await createPreview({ port: 0, root: await buildSite() });
    try {
      const baseUrl = hubUrl ? new URL('/', hubUrl) : preview.url;
      await mkdir(directory, { recursive: true });
      for (const project of targets) {
        try {
          const record = await capture(browser, baseUrl, project);
          origins.set(record.file, record);
          console.log(`Captured ${record.file}`);
        } catch (error) {
          console.error(`${project.id}: ${error.message}`);
          process.exitCode = 1;
        }
      }
      await writeFile(originsFile, JSON.stringify([...origins.values()], null, 2) + '\n');
    } finally {
      await preview?.close();
    }
  } finally {
    await browser.close();
  }
}

await main(process.argv.slice(2));
