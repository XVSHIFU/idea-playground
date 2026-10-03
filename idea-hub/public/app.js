const $ = selector => document.querySelector(selector);
let projects = [];
let category = '全部';
let visited = [];
try { const saved = JSON.parse(localStorage.getItem('idea-hub:visited') || '[]'); if (Array.isArray(saved)) visited = saved; } catch {}
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function filtered() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  return projects.filter(p => (category === '全部' || p.category === category) && `${p.name} ${p.description} ${p.label} ${p.category}`.toLocaleLowerCase().includes(query));
}
function render() {
  const list = filtered();
  $('#result-count').textContent = `${list.length} 个小创意`;
  $('#collection-title').firstChild.textContent = category === '全部' ? '随便逛逛' : category;
  $('#empty').hidden = list.length > 0;
  $('#projects').innerHTML = list.map(p => `<article class="project" data-id="${escape(p.id)}">
    <a class="preview" style="--preview-bg:${escape(p.color)}" href="${escape(p.url)}" target="_blank" rel="noopener" aria-label="${escape(p.action)}：${escape(p.name)}">${p.preview ? `<img src="${escape(p.preview)}" alt="${escape(p.name)}的实际画面" loading="lazy">` : `<span class="preview-fallback">${escape(p.name)}</span>`}</a>
    <div class="project-meta"><span>${escape(p.category)}</span><span>${escape(p.label)}</span></div>
    <h3><a href="${escape(p.url)}" target="_blank" rel="noopener">${escape(p.name)}</a></h3><p>${escape(p.description)}</p>
    <div class="project-bottom">${p.available ? `<a class="enter" href="${escape(p.url)}" target="_blank" rel="noopener" title="${escape(p.hint)}">${escape(p.action)}${arrow}</a>` : '<span class="unavailable">作品暂不可用</span>'}<span class="visited">${visited.includes(p.id) ? '去过这里' : ''}</span></div></article>`).join('');
  $('#projects').querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    const label = document.createElement('span'); label.className = 'preview-fallback'; label.textContent = projects.find(p => p.id === img.closest('article').dataset.id).name; img.replaceWith(label);
  }, { once: true }));
  document.querySelectorAll('.category').forEach(button => {
    const active = button.dataset.category === category;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
  chooseRandom();
}
function chooseRandom() {
  const pool = filtered().filter(p => p.available);
  const link = $('#random');
  if (pool.length) { link.href = pool[Math.floor(Math.random() * pool.length)].url; link.target = '_blank'; link.rel = 'noopener'; }
  else { link.href = '#collection'; link.removeAttribute('target'); }
}
async function load() {
  $('#status').textContent = '正在打开作品目录…'; $('#retry').hidden = true;
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error('load failed');
    projects = await response.json();
    const categories = ['全部', ...new Set(projects.map(p => p.category))];
    $('#categories').innerHTML = categories.map(c => `<button class="category" data-category="${escape(c)}" aria-pressed="false"><span>${c === '全部' ? '全部作品' : escape(c)}</span><span class="count">${projects.filter(p => c === '全部' || p.category === c).length}</span></button>`).join('');
    $('#status').textContent = ''; render();
  } catch { $('#status').textContent = '作品目录没有加载成功。请检查连接，然后重试。'; $('#retry').hidden = false; }
}
$('#categories').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; category = button.dataset.category; render(); });
$('#search').addEventListener('input', render);
$('#clear').addEventListener('click', () => { category = '全部'; $('#search').value = ''; render(); $('#search').focus(); });
$('#retry').addEventListener('click', load);
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  const id = projects.find(p => new URL(p.url, location.href).pathname === new URL(link.href, location.href).pathname)?.id;
  if (!id) return;
  if (!visited.includes(id)) visited.push(id);
  try { localStorage.setItem('idea-hub:visited', JSON.stringify(visited)); } catch {}
  document.querySelectorAll('.project').forEach(project => { if (project.dataset.id === id) project.querySelector('.visited').textContent = '去过这里'; });
  if (link.id === 'random') setTimeout(chooseRandom, 0);
});
load();
