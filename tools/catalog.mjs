import path from 'node:path';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const PUBLIC_EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.ttf', '.otf', '.woff', '.woff2', '.pdf', '.txt', '.md', '.mp3', '.wav', '.ogg', '.mp4', '.webm']);
export const inside = (base, target) => { const relative = path.relative(base, target); return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative)); };
export const exists = async file => { try { return (await stat(file)).isFile(); } catch { return false; } };
export const readJson = async file => JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const fail = message => { throw new Error(message); };

function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.includes(':') && !value.startsWith('/') && !value.split('/').some(part => !part || part.startsWith('.'));
}

export async function validateProjects(projects, root = ROOT) {
  if (!Array.isArray(projects)) fail('projects.json must be an array');
  const ids = new Set(), ports = new Set();
  for (const project of projects) {
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(project.id)) fail(`Invalid project id: ${project.id}`);
    if (ids.has(project.id)) fail(`Duplicate id: ${project.id}`); ids.add(project.id);
    if (!Number.isInteger(project.port) || project.port < 1024 || project.port > 65535 || project.port === 4200 || project.port === 4190 || ports.has(project.port)) fail(`Invalid or duplicate port: ${project.id}`);
    ports.add(project.port);
    if (project.directory !== `../${project.id}`) fail(`${project.id}: directory must be ../${project.id}`);
    for (const key of ['name', 'description', 'category', 'hint', 'label', 'identity']) if (typeof project[key] !== 'string' || !project[key].trim()) fail(`${project.id}: missing ${key}`);
    if (!/^#[a-f0-9]{6}$/i.test(project.color)) fail(`${project.id}: use a six-digit hex color`);
    for (const key of ['files', 'required']) if (!Array.isArray(project[key]) || !project[key].length) fail(`${project.id}: missing ${key}`);
    if (project.enabled !== undefined && typeof project.enabled !== 'boolean') fail(`${project.id}: enabled must be boolean`);
    if (project.publicDirectories !== undefined && !Array.isArray(project.publicDirectories)) fail(`${project.id}: publicDirectories must be an array`);
    for (const name of [...project.files, ...project.required, ...(project.publicDirectories || []), project.entry, ...(project.fallback ? [project.fallback] : [])]) if (!safeRelative(name)) fail(`${project.id}: unsafe public path ${name}`);
    for (const name of [...project.required, project.entry, ...(project.fallback ? [project.fallback] : [])]) {
      if (!project.files.includes(name) && !(project.publicDirectories || []).some(dir => name.startsWith(dir + '/'))) fail(`${project.id}: ${name} is not public`);
    }
    const directory = path.join(root, project.id);
    const canonical = await realpath(directory);
    if (!inside(await realpath(root), canonical)) fail(`${project.id}: project points outside repository`);
    if (project.enabled === false) continue;
    const publicFiles = await collectPublicFiles(project, root);
    const ready = project.required.every(name => publicFiles.includes(name));
    if (!ready && (!project.fallback || !publicFiles.includes(project.fallback))) fail(`${project.id}: required files incomplete and no usable fallback`);
    if (ready && !publicFiles.includes(project.entry)) fail(`${project.id}: missing entry`);
  }
  return projects;
}

export async function collectPublicFiles(project, root = ROOT) {
  const directory = await realpath(path.join(root, project.id));
  const result = new Set();
  async function add(name, allowMissing = false) {
    if (!safeRelative(name)) fail(`${project.id}: unsafe path ${name}`);
    const filename = path.join(directory, name);
    if (allowMissing && !await exists(filename)) {
      if ((project.required.includes(name) || name === project.entry) && project.fallback && await exists(path.join(directory, project.fallback))) return;
      fail(`${project.id}: declared public file is missing: ${name}`);
    }
    const canonical = await realpath(filename);
    if (!inside(directory, canonical)) fail(`${project.id}: public path escapes project: ${name}`);
    const info = await stat(canonical);
    if (info.isDirectory()) {
      for (const child of await readdir(filename, { withFileTypes: true })) {
        if (child.isSymbolicLink()) fail(`${project.id}: symbolic link is not a publishable asset: ${child.name}`);
        await add(`${name}/${child.name}`);
      }
    } else {
      if (!PUBLIC_EXTENSIONS.has(path.extname(name).toLowerCase())) fail(`${project.id}: unsupported public file ${name}`);
      result.add(name);
    }
  }
  for (const name of project.files) await add(name, true);
  for (const directory of project.publicDirectories || []) await add(directory);
  return [...result].sort();
}

export async function loadProjects(root = ROOT) {
  return validateProjects(await readJson(path.join(root, 'idea-hub/projects.json')), root);
}

export async function publicProject(project, root = ROOT, mode = 'static') {
  const ready = (await Promise.all(project.required.map(file => exists(path.join(root, project.id, file))))).every(Boolean);
  const entry = ready ? project.entry : project.fallback;
  const image = `previews/${project.id}.png`;
  return {
    id: project.id, name: project.name, category: project.category, description: project.description,
    hint: project.hint, label: project.label, color: project.color, available: !!entry,
    action: entry === project.fallback ? project.fallbackLabel || '打开试玩材料' : '进入体验',
    url: mode === 'static' ? `./projects/${project.id}/${entry}` : `./open/${project.id}`,
    preview: await exists(path.join(root, 'idea-hub/public', image)) ? `./${image}` : null
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const projects = await loadProjects();
  console.log(`Catalog valid: ${projects.filter(p => p.enabled !== false).length} enabled, ${projects.filter(p => p.enabled === false).length} drafts.`);
}
