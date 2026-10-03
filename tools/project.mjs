import path from 'node:path';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ROOT, readJson, validateProjects } from './catalog.mjs';

const htmlEscape = value => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export async function registerProject(id, { root = ROOT, enable = false } = {}) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Use a lowercase project id, e.g. paper-moon');
  const catalogPath = path.join(root, 'idea-hub/projects.json');
  const catalog = await readJson(catalogPath);
  const entry = await readJson(path.join(root, id, 'integration.json'));
  if (entry.id !== id) throw new Error('integration.json id does not match its directory');
  entry.directory = `../${id}`;
  entry.enabled = enable;
  const index = catalog.findIndex(project => project.id === id);
  if (index < 0) catalog.push(entry); else catalog[index] = entry;
  await validateProjects(catalog, root);
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  await writeFile(path.join(root, id, 'integration.json'), JSON.stringify(entry, null, 2) + '\n');
  return entry;
}

export async function createProject(id, { root = ROOT, name = id } = {}) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Use a lowercase project id, e.g. paper-moon');
  const directory = path.join(root, id);
  try { await access(directory); throw new Error(`Directory already exists: ${id}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const catalog = await readJson(path.join(root, 'idea-hub/projects.json'));
  if (catalog.some(project => project.id === id)) throw new Error(`Project already registered: ${id}`);
  const used = new Set(catalog.map(project => project.port));
  let port = 4300; while (used.has(port) && port < 4400) port++;
  if (port === 4400) throw new Error('No unused template port left; assign a port manually');
  const entry = { id, name, category: '互动实验', description: '待填写：用一句话介绍这个创意。', hint: '待填写：第一次可以做什么。', label: '互动实验', color: '#e5eaf5', directory: `../${id}`, port, entry: 'index.html', required: ['index.html', 'style.css', 'app.js'], files: ['index.html', 'style.css', 'app.js'], identity: name, enabled: false };
  await mkdir(directory);
  for (const filename of ['index.html', 'style.css', 'app.js']) {
    const template = await readFile(new URL(`./templates/${filename}.template`, import.meta.url), 'utf8');
    await writeFile(path.join(directory, filename), template.replaceAll('__NAME__', htmlEscape(name)).replaceAll('__ID__', id));
  }
  await writeFile(path.join(directory, 'integration.json'), JSON.stringify(entry, null, 2) + '\n');
  await writeFile(path.join(directory, `${id}.code-workspace`), JSON.stringify({ folders: [{ name, path: '.' }] }, null, 2) + '\n');
  await writeFile(path.join(directory, 'README.md'), `# ${name}\n\n当前为未启用的项目骨架，不出现在游乐场和 Pages 构建中。直接打开 index.html 可以检查基础入口。\n\n完成内容后填写 integration.json 的简介、分类、提示和公开文件清单，在仓库根执行：\n\n\`npm run project:add -- ${id} --enable\`\n\n然后运行 \`npm run check\` 和 \`npm run build\`，检查 \`npm run preview\`。正式接入约定见 ../docs/ADDING_PROJECTS.md。\n`);
  await registerProject(id, { root });
  return directory;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, id, ...args] = process.argv.slice(2);
  if (!id || !['new', 'add'].includes(command)) throw new Error('Usage: npm run project:new -- my-idea --name "作品名" | npm run project:add -- my-idea --enable');
  if (command === 'new') {
    const nameIndex = args.indexOf('--name');
    if (nameIndex >= 0 && !args[nameIndex + 1]) throw new Error('--name needs a value');
    console.log(`Created draft: ${await createProject(id, { name: nameIndex >= 0 ? args[nameIndex + 1] : id })}`);
  } else {
    const entry = await registerProject(id, { enable: args.includes('--enable') });
    console.log(`Registered ${entry.id}: ${entry.enabled ? 'enabled' : 'draft'}. Restart the local hub to reload its catalog.`);
  }
}
