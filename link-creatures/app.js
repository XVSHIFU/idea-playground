'use strict';
const G = window.SeedGenes;
const $ = id => document.getElementById(id);
const STORAGE = 'link-creatures-v1';
let current, offspring, records = [], care = 0, toastTimer, reactionTimer, storageOK = true;
let environment = {}, lastPointer = 0;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000);
}
function restore() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE) || '[]');
    if (!Array.isArray(stored)) throw Error('Invalid records');
    records = stored.slice(0, 80).flatMap(record => {
      try { return [{ seed: G.parse(record.hash), hash: record.hash, care: G.clamp(Number(record.care) || 0, 0, 30), seen: record.seen === true, date: typeof record.date === 'string' ? record.date : '' }]; }
      catch { return []; }
    });
  } catch { storageOK = false; toast('本地谱系暂时不可用；你仍可用链接保存和分享种子。'); }
}
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(records.map(({ hash, care, seen, date }) => ({ hash, care, seen, date })))); }
  catch { if (storageOK) toast('无法保存本地谱系，请复制种子链接留存。'); storageOK = false; }
  document.querySelector('.local-note').textContent = storageOK ? '仅保存在这台设备 · 最近 80 只' : '本地保存不可用 · 仅本次会话';
}
function remember(seed, seen = true, amount = 0) {
  const old = records.find(r => r.seed.id === seed.id);
  records = records.filter(r => r.seed.id !== seed.id);
  records.unshift({ seed: { ...seed }, hash: G.encode(seed), care: Math.max(old?.care || 0, amount), seen: seen || old?.seen || false, date: new Date().toISOString() });
  records = records.slice(0, 80);
  persist();
  renderLineage();
}
function seedLink(seed) { return location.href.split('#')[0] + G.encode(seed); }
function svgMarkup(seed, miniature = false) {
  const h = seed.h, sat = 29 + seed.m / 2;
  const light = miniature ? 61 : environment.night ? 53 : 63;
  const body = `hsl(${h} ${sat}% ${light}%)`, dark = `hsl(${h} 26% 38%)`, pale = `hsl(${h} 38% 78%)`;
  const width = 82 + seed.s * .38;
  const narrow = !miniature && environment.narrow;
  const sx = narrow ? .91 : 1, sy = narrow ? 1.07 : 1;
  const legs = Array.from({ length: seed.l }, (_, i) => {
    const t = (i / (seed.l - 1) - .5), x = 200 + t * width * 1.5;
    return `<path d="M${x} 230 Q${x + t * 30} ${283 + (i % 2) * 8} ${x + t * 40} ${280 + (i % 2) * 9}" fill="none" stroke="${dark}" stroke-width="${13 + seed.s / 13}" stroke-linecap="round"/>`;
  }).join('');
  const bodyPath = `M${200-width} 191 C${190-width} 126 160 105 200 112 C${247+width*.25} 95 ${205+width} 130 ${200+width} 195 C${208+width} 249 256 260 200 257 C145 267 ${194-width} 245 ${200-width} 191Z`;
  const spots = Array.from({ length: 5 }, (_, i) => `<ellipse cx="${148 + i * 25}" cy="${222 + Math.sin(i * 2 + seed.s) * 9}" rx="${3 + seed.m / 6}" ry="3" fill="${dark}" opacity=".22"/>`).join('');
  return `<g transform="translate(${200 * (1-sx)} ${190 * (1-sy)}) scale(${sx} ${sy})"><g class="living"><g class="feelers" stroke="${dark}" stroke-width="5" fill="none"><path d="M177 122Q169 84 151 70M223 119Q231 78 252 66"/><path d="M152 72C128 72 129 47 132 40C153 44 167 53 152 72Z" fill="${pale}" stroke="none"/><path d="M251 67C243 45 268 34 280 36C278 60 266 73 251 67Z" fill="${body}" stroke="none"/></g>${legs}<path d="${bodyPath}" fill="${body}"/><path d="M${207-width} 181C${213-width} 137 176 124 197 127" fill="none" stroke="${pale}" stroke-width="8" stroke-linecap="round" opacity=".65"/>${spots}<g class="eyes" fill="#293b2c"><ellipse cx="172" cy="183" rx="${seed.c < 35 ? 5 : 6}" ry="8"/><ellipse cx="226" cy="183" rx="${seed.c < 35 ? 5 : 6}" ry="8"/><circle cx="174" cy="180" r="1.8" fill="#fff"/><circle cx="228" cy="180" r="1.8" fill="#fff"/></g><path d="M192 199Q200 ${seed.c > 50 ? 207 : 201} 207 198" fill="none" stroke="#3d573a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="157" cy="198" rx="9" ry="5" fill="${pale}" opacity=".6"/><ellipse cx="241" cy="198" rx="9" ry="5" fill="${pale}" opacity=".6"/></g></g>`;
}
function setEnvironment() {
  const hour = new Date().getHours(), lightMode = $('light-mode').value, spaceMode = $('space-mode').value;
  environment = { night: lightMode === 'night' || lightMode === 'auto' && (hour < 6 || hour >= 19), narrow: spaceMode === 'narrow' || spaceMode === 'auto' && innerWidth < 720, touch: matchMedia('(pointer: coarse)').matches, language: navigator.language || 'zh-CN' };
  $('env-time').textContent = environment.night ? '月下 · 微光' : '日间 · 柔光';
  $('env-space').textContent = environment.narrow ? '窄域栖息地' : '开阔栖息地';
  $('light-value').textContent = (environment.night ? '夜间微光' : '日间柔光') + (lightMode !== 'auto' ? ' · 模拟' : '');
  $('space-value').textContent = (environment.narrow ? '紧凑空间' : '开阔空间') + (spaceMode !== 'auto' ? ' · 模拟' : '');
  $('input-value').textContent = environment.touch ? '触摸陪伴' : '指针探索';
  $('language-value').textContent = environment.language;
  $('interaction-hint').textContent = environment.touch ? '轻触它，建立一点默契' : '移动指针，看看它的反应';
  $('environment-description').textContent = `${environment.narrow ? '身体变得稍细长' : '身体舒展了一点'}，${environment.night ? '夜色让呼吸放慢、体色变深' : '日光让体色变浅、动作轻快'}。模拟不会改写基因。`;
  $('habitat').querySelector('.habitat').dataset.night = environment.night;
  if (current) renderOrganism();
}
function renderOrganism() {
  $('organism').innerHTML = svgMarkup(current);
  // A tiny stable language offset affects rhythm, never seed identity.
  const localeOffset = [...environment.language].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 5 / 20;
  const seconds = (6.5 - current.r * .044) * (environment.night ? 1.2 : 1) * (environment.narrow ? .93 : 1) + localeOffset;
  $('creature').style.setProperty('--breath', `${seconds}s`);
  document.documentElement.style.setProperty('--creature-color', `hsl(${current.h} 38% 50%)`);
}
function renderCurrent() {
  $('creature-name').textContent = G.name(current);
  $('specimen-id').textContent = `SEED / ${current.id.slice(0, 6).toUpperCase()}`;
  $('generation').textContent = `第 ${current.g} 代 · ${current.p.length === 2 ? '混合后代' : current.g ? '变异子代' : '初生种子'}`;
  const traits = [current.c < 35 ? '有一点害羞' : current.c > 65 ? '喜欢陪伴' : '慢热的好奇心', current.r < 40 ? '慢悠悠' : current.r > 65 ? '精力充沛' : '不紧不慢', `${current.l} 足生物`];
  if (current.e > 10) traits.push('继承了亲近记忆');
  $('traits').replaceChildren(...traits.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
  $('personality').textContent = current.c < 35 ? '你靠近时，它会悄悄缩起身体。多给一点耐心，它会记住你的温柔。' : current.c > 65 ? '总是好奇你在哪里，忍不住向你靠近。轻轻碰它一下，回应这份小小的信任。' : '它在自己的节奏里观察世界。先试探着靠近，再慢慢把你认作熟悉的朋友。';
  $('gene-list').innerHTML = G.keys.map(k => {
    const val = k === 'h' ? `${current[k]}°` : k === 'l' ? `${current[k]} 足` : k === 'm' ? `${current[k]}%` : `${current[k]}`;
    const [min, max] = G.ranges[k], percentage = 8 + (current[k] - min) / (max - min) * 92;
    return `<div><dt>${G.labels[k]}</dt><dd class="gene-track ${k === 'h' ? 'hue' : ''}" aria-hidden="true"><span style="width:${percentage}%"></span></dd><dd>${val}</dd></div>`;
  }).join('');
  $('response').textContent = care > 4 ? '它还记得你，轻轻地晃了晃。' : '它正在慢慢认识这个世界。';
  $('creature').setAttribute('aria-label', `轻触${G.name(current)}，与它互动`);
  document.title = `${G.name(current)} · 链接生物`;
  renderOrganism(); renderLineage();
}
function loadSeed(seed) {
  current = seed;
  care = records.find(r => r.seed.id === seed.id)?.care || 0;
  offspring = null;
  $('seed-result').hidden = true; $('rename-form').hidden = true;
  $('cross-panel').hidden = true; $('cross-toggle').setAttribute('aria-expanded', 'false');
  resetReaction();
  remember(current, true, care); renderCurrent();
}
function navigate(seed) {
  if (location.hash === G.encode(seed)) { loadSeed(seed); return; }
  location.hash = G.encode(seed);
}
function readLocation() {
  if (!location.hash || location.hash === '#habitat' || location.hash === '#lineage') return;
  try { loadSeed(G.parse(location.hash)); }
  catch (error) { toast(`${error.message} 已保留当前生物。`); history.replaceState(null, '', G.encode(current)); }
}
function renderLineage() {
  $('nav-count').textContent = records.length;
  $('lineage-count').textContent = `${records.length} 枚种子`;
  $('lineage-list').replaceChildren(...records.map(record => {
    const seed = record.seed, button = document.createElement('button');
    button.className = 'lineage-item' + (seed.id === current?.id ? ' current' : '');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '65 30 270 275'); svg.setAttribute('aria-hidden', 'true'); svg.innerHTML = svgMarkup(seed, true);
    const info = document.createElement('div'), name = document.createElement('strong'), meta = document.createElement('small');
    name.textContent = G.name(seed);
    meta.textContent = `第 ${seed.g} 代 · ${seed.id === current?.id ? '正在观察' : !record.seen ? '等待孵化' : seed.p.length === 2 ? '混合后代' : seed.g ? '变异子代' : '初生种子'}`;
    if (seed.id === current?.id) { meta.className = 'current-mark'; button.setAttribute('aria-current', 'true'); }
    const parents = seed.p.map(id => { const parent = records.find(r => r.seed.id === id); return parent ? G.name(parent.seed) : id.slice(0, 6); });
    button.title = parents.length ? `亲代：${parents.join(' × ')}` : '这是一颗初生种子';
    info.append(name, meta); button.append(svg, info);
    if (parents.length) { const ancestry = document.createElement('small'); ancestry.textContent = `来自 ${parents.join(' × ')}`; info.append(ancestry); }
    button.addEventListener('click', () => { navigate(seed); $('habitat').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' }); });
    return button;
  }));
}
function presentChild(result, cross = false) {
  offspring = result.child;
  remember(offspring, false);
  $('seed-title').textContent = `${G.name(offspring)}，诞生了。`;
  const changes = result.changes.map(c => `${c.label} ${c.before} → ${c.after}`).join('、');
  $('mutation-note').textContent = `${cross ? '两位亲代的基因在这里相遇' : `来自 ${G.name(current)} 的第 ${offspring.g} 代种子`}。变异：${changes}。${offspring.e ? '也带走了一点亲近的记忆。' : ''}`;
  $('seed-url').value = seedLink(offspring);
  $('seed-result').hidden = false;
  $('seed-result').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'nearest' });
}
function resetReaction() {
  clearTimeout(reactionTimer);
  $('creature').style.setProperty('--move-x', '0px'); $('creature').style.setProperty('--move-y', '0px'); $('creature').style.setProperty('--reaction', '1');
}
function interact() {
  care = Math.min(30, care + 3);
  $('response').textContent = care > 12 ? '它认出你了，开心地舒展开来。' : current.c < 35 ? '先是缩了一下，又悄悄向你伸出触角。' : '它轻轻晃了晃触角，像是在回应你。';
  $('creature').style.setProperty('--reaction', '1.06');
  remember(current, true, care);
  clearTimeout(reactionTimer); reactionTimer = setTimeout(resetReaction, 900);
}
$('creature').addEventListener('click', interact);
$('creature-space').addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reduced.matches || performance.now() - lastPointer < 80) return;
  lastPointer = performance.now();
  const rect = $('creature-space').getBoundingClientRect(), dx = event.clientX - (rect.left + rect.width / 2), dy = event.clientY - (rect.top + rect.height / 2);
  if (Math.hypot(dx, dy) > 230) { resetReaction(); return; }
  const friendly = current.c + current.e * .15 + care * .4 > 48;
  const direction = friendly ? 1 : -1;
  $('creature').style.setProperty('--move-x', `${G.clamp(dx * .13 * direction, -24, 24)}px`);
  $('creature').style.setProperty('--move-y', `${G.clamp(dy * .10 * direction, -13, 13)}px`);
  $('creature').style.setProperty('--reaction', friendly ? '1.025' : '.91');
  $('response').textContent = friendly ? '它注意到了你，正悄悄靠近。' : '嘘，它有点害羞。给它一点时间。';
});
$('creature-space').addEventListener('pointerleave', () => { resetReaction(); $('response').textContent = '安静下来，它又慢慢舒展开。'; });
$('reproduce').addEventListener('click', () => { try { presentChild(G.breed(current, null, care)); } catch (e) { toast(e.message); } });
$('new-seed').addEventListener('click', () => navigate(G.fresh()));
$('visit-seed').addEventListener('click', () => { if (offspring) navigate(offspring); });
$('copy-seed').addEventListener('click', async () => {
  if (!offspring) return;
  const link = seedLink(offspring);
  try { await navigator.clipboard.writeText(link); toast(location.protocol === 'file:' ? '已复制。跨设备分享前，请先把此目录放到静态网站。' : '子代链接已复制，把这颗种子交给另一个人吧。'); }
  catch { $('seed-url').focus(); $('seed-url').select(); toast('自动复制不可用，链接已选中，请手动复制。'); }
});
$('cross-toggle').addEventListener('click', () => {
  const opening = $('cross-panel').hidden;
  $('cross-panel').hidden = !opening; $('cross-toggle').setAttribute('aria-expanded', String(opening));
  if (opening) { $('parent-a').value = seedLink(current); $('cross-error').textContent = ''; $('parent-b').focus(); }
});
$('cross-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const a = G.parse($('parent-a').value.trim()), b = G.parse($('parent-b').value.trim());
    if (a.id === b.id) throw Error('这两个链接属于同一只生物。请换一颗不同的种子。');
    const inheritedCare = Math.round(((records.find(r => r.seed.id === a.id)?.care || 0) + (records.find(r => r.seed.id === b.id)?.care || 0)) / 2);
    const result = G.breed(a, b, inheritedCare);
    remember(a, false); remember(b, false);
    $('cross-error').textContent = ''; presentChild(result, true);
  } catch (error) { $('cross-error').textContent = error.message; }
});
$('rename').addEventListener('click', () => { $('rename-form').hidden = !$('rename-form').hidden; if (!$('rename-form').hidden) { $('name-input').value = G.name(current); $('name-input').focus(); $('name-input').select(); } });
$('rename-form').addEventListener('submit', event => {
  event.preventDefault(); const name = $('name-input').value.trim();
  if (!name) { $('name-input').setCustomValidity('请给它一个名字。'); $('name-input').reportValidity(); return; }
  current.n = name.slice(0, 24); history.replaceState(null, '', G.encode(current)); remember(current, true, care); renderCurrent(); $('rename-form').hidden = true; toast('名字已写进它的种子链接。');
});
$('name-input').addEventListener('input', () => $('name-input').setCustomValidity(''));
$('about-toggle').addEventListener('click', () => { $('about').hidden = !$('about').hidden; $('about-toggle').setAttribute('aria-expanded', String(!$('about').hidden)); });
document.querySelectorAll('a[href="#habitat"],a[href="#lineage"],#home').forEach(a => a.addEventListener('click', event => { event.preventDefault(); $(a.getAttribute('href') === '#lineage' ? 'lineage' : 'habitat').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' }); }));
$('light-mode').addEventListener('change', setEnvironment); $('space-mode').addEventListener('change', setEnvironment);
window.addEventListener('hashchange', readLocation);
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setEnvironment, 150); });
restore(); setEnvironment();
try { current = location.hash && !['#habitat', '#lineage'].includes(location.hash) ? G.parse(location.hash) : G.fresh(); }
catch (error) { current = G.fresh(); toast(`${error.message} 为你孵化了一颗新种子。`); }
history.replaceState(null, '', G.encode(current));
loadSeed(current);
setInterval(() => { if (!document.hidden) setEnvironment(); }, 60000);
