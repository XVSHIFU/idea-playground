import path from 'node:path';
import { mkdir, readFile, writeFile, copyFile, rm, lstat, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ROOT, loadProjects, collectPublicFiles, publicProject, inside } from './catalog.mjs';

export async function buildSite(root = ROOT) {
  root = await realpath(root);
  const projects = (await loadProjects(root)).filter(p => p.enabled !== false);
  const plans = await Promise.all(projects.map(async p => ({ project: p, files: await collectPublicFiles(p, root), public: await publicProject(p, root) })));
  const publicRoot = path.join(root, 'idea-hub/public');
  let html = await readFile(path.join(publicRoot, 'index.html'), 'utf8');
  for (const plan of plans) html = html.replaceAll(`./open/${plan.project.id}`, plan.public.url);
  if (/\.\/open\//.test(html)) throw new Error('Hub HTML links to a missing/disabled project. Update the featured entry before building.');
  const output = path.resolve(root, 'dist');
  if (!inside(root, output) || path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unsafe output directory');
  const existing = await lstat(output).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
  if (existing?.isSymbolicLink()) throw new Error('Refusing to replace a linked dist directory');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'index.html'), html);
  for (const file of ['style.css', 'app.js', 'favicon.svg']) await copyFile(path.join(publicRoot, file), path.join(output, file));
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'catalog.json'), JSON.stringify(plans.map(plan => plan.public), null, 2));
  for (const plan of plans) {
    for (const name of plan.files) {
      const target = path.join(output, 'projects', plan.project.id, name);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(root, plan.project.id, name), target);
    }
    if (plan.public.preview) {
      const target = path.join(output, plan.public.preview);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(path.join(publicRoot, plan.public.preview), target);
    }
  }
  console.log(`Built ${plans.length} projects into ${output}`);
  return output;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildSite();
