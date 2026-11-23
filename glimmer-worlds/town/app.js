/* 栖川 · observation, persistence and interaction shell. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const num = value => Math.round(Number(value) || 0).toLocaleString('zh-CN');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
  const STORE = 'glimmer.qichuan.world.v1';
  let engine, restored = false, savingAllowed = true;
  try { const saved = localStorage.getItem(STORE); if (saved) { engine = TownEngine.restore(saved); restored = true; } } catch (error) { console.info('旧存档未读取，已准备新小城。', error.message); }
  if (!engine) engine = new TownEngine(271828);
  let paused = false, speed = 1, activePanel = null, selectedKind = null, selectedId = null, searchText = '', toastTimer, lastNews = '', lastPanelRefresh = 0;
  const view = new TownView($('world'), engine, {
    onSelect(kind, id) { if (kind === 'agent') selectAgent(id); else if (kind === 'building') selectBuilding(id); else closePanel(); },
    onHover(kind, id, clientX, clientY) {
      const tooltip = $('map-tooltip');
      if (!kind || activePanel) { tooltip.hidden = true; return; }
      const item = kind === 'agent' ? engine.state.agents.find(a => a.id === id) : engine.state.buildings.find(b => b.id === id);
      if (!item) { tooltip.hidden = true; return; }
      const rect = $('world').getBoundingClientRect();
      tooltip.textContent = kind === 'agent' ? `${item.name} · ${item.action || item.role}` : item.name;
      tooltip.hidden = false;
      tooltip.style.left = `${clamp(clientX - rect.left + 14, 8, rect.width - 180)}px`;
      tooltip.style.top = `${clamp(clientY - rect.top - 36, 8, rect.height - 45)}px`;
    }
  });
  const roleNames = {house:'住宅',farm:'农田',market:'集市',workshop:'作坊',clinic:'诊所',cafe:'茶馆',hall:'公所',park:'公园',sawmill:'林场'};
  const byId = id => engine.state.agents.find(a => a.id === id);
  const buildingById = id => engine.state.buildings.find(b => b.id === id);
  const buildingName = id => buildingById(id)?.name || '河谷中';
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4200); }
  function saveWorld(manual = false) {
    try { localStorage.setItem(STORE, engine.serialize()); savingAllowed = true; $('save-status').textContent = '这段生活已保存'; if (manual) toast('小城已经保存在这个浏览器里。'); }
    catch (error) { savingAllowed = false; $('save-status').textContent = '请导出文件留存'; if (manual) toast('浏览器暂时无法保存，请用「导出小城」下载存档。'); }
  }
  function updateTime() {
    const state = engine.state, time = ((state.time % 24) + 24) % 24;
    $('clock').textContent = `${String(Math.floor(time)).padStart(2, '0')}:${String(Math.floor(time % 1 * 60)).padStart(2, '0')}`;
    $('calendar').textContent = `${state.season || '春'} · 第 ${state.day} 天`;
    $('weather').textContent = state.weather || '晴';
    $('season-label').textContent = `${state.season || '春'}日河谷`;
  }
  function updateStats() {
    const stats = engine.getStats();
    $('stat-pop').textContent = num(stats.population);
    $('stat-mood').textContent = num(stats.happiness);
    $('stat-food').textContent = Number.isFinite(stats.foodDays) ? Math.max(0, stats.foodDays).toFixed(1) : '—';
    $('stat-money').textContent = num(stats.treasury);
    let thought = '日子在工作、相遇与一顿热饭之间，慢慢生长。';
    if (stats.population === 0) thought = '河谷暂时安静下来。充足的粮食和空房，能让新生活到来。';
    else if (stats.foodDays < 2) thought = '粮仓渐空。增加农田或补充粮食，能让居民安心一些。';
    else if (stats.happiness < 40) thought = '最近的生活有些艰难。看看居民的需求，或调整公共福利。';
    else if (stats.population >= stats.capacity) thought = '每一扇窗后都有故事。再添几间房，河谷就能接住新来的人。';
    else if (stats.happiness > 78) thought = '人们愿意留下来，也开始向远方的朋友说起这里。';
    else if (engine.state.weather === '雨') thought = '雨落在屋檐上，田里的庄稼正悄悄长高。';
    else if ((engine.state.time % 24) > 20) thought = '灯光一盏盏亮起。忙碌过后，每个人都需要一个归处。';
    $('town-thought').textContent = thought;
    return stats;
  }
  function updateNews() {
    const events = engine.state.events || [];
    const signature = events.slice(0, 25).map(e => e.id).join(',');
    if (signature === lastNews) return;
    lastNews = signature;
    $('news-count').textContent = `${events.length} 则记录`;
    $('news-list').innerHTML = events.slice(0, 25).map(e => `<button class="news-item" data-type="${esc(e.type)}" ${e.agentId != null ? `data-agent="${esc(e.agentId)}"` : e.buildingId != null ? `data-building="${esc(e.buildingId)}"` : `data-event="${esc(e.id)}"`}><span class="news-time">第 ${num(e.day)} 天 · ${String(Math.floor(e.hour || 0)).padStart(2, '0')}:00</span><span class="news-title">${esc(e.title)}</span><span class="news-copy">${esc(e.text)}</span></button>`).join('') || '<p class="empty-copy">河水缓缓流过。小城的第一封来信，很快就会抵达。</p>';
  }
  function setPaused(value) {
    paused = value;
    $('pause').innerHTML = icon(paused ? 'play' : 'pause');
    $('pause').setAttribute('aria-label', paused ? '继续小城' : '暂停小城');
    $('pause').setAttribute('aria-pressed', String(paused));
    $('live-dot').classList.toggle('paused', paused);
    $('time-label').textContent = paused ? '时光暂歇' : speed === 1 ? '让日子慢慢过' : speed === 3 ? '日子快一些' : '看季节流转';
  }
  function setSpeed(value) { speed = value; document.querySelectorAll('[data-speed]').forEach(button => { const active = Number(button.dataset.speed) === speed; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }); setPaused(false); }
  function showPanel(name, category) {
    activePanel = name;
    $('detail-panel').hidden = false;
    $('detail-category').textContent = category;
    $('map-tooltip').hidden = true;
    document.querySelectorAll('[data-panel]').forEach(button => button.classList.toggle('active', button.dataset.panel === name));
    $('observation-rail')?.classList.remove('mobile-open');
    document.querySelector('.observation-rail').classList.remove('mobile-open');
    $('mobile-overview').setAttribute('aria-expanded', 'false');
  }
  function closePanel() { activePanel = null; selectedKind = null; selectedId = null; $('detail-panel').hidden = true; view.setSelection(null, null); document.querySelectorAll('[data-panel]').forEach(button => button.classList.remove('active')); }
  function resolveAgent(id) { return engine.state.agents.find(a => String(a.id) === String(id)); }
  function resolveBuilding(id) { return engine.state.buildings.find(b => String(b.id) === String(id)); }
  function selectAgent(id) {
    const person = resolveAgent(id);
    if (!person) { toast('这位居民已经离开河谷，故事留在了小城来信里。'); return; }
    selectedKind = 'agent'; selectedId = person.id; showPanel('agent', '居民观察'); view.setSelection('agent', person.id); renderAgent();
  }
  function portrait(color) { const safeColor = /^#[0-9a-f]{3,8}$/i.test(color || '') ? color : '#8e9d73'; return `<div class="resident-portrait"><svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="42" rx="16" ry="4" fill="#cbd5bd"/><path d="M10 42c0-12 6-17 14-17s14 5 14 17" fill="${safeColor}"/><circle cx="24" cy="18" r="10" fill="#d9b792"/><path d="M14 17c-1-9 5-13 11-11 9 1 10 9 8 13l-4-9c-3 5-7 6-15 7" fill="#4d5543"/><circle cx="20" cy="18" r="1" fill="#535547"/><circle cx="28" cy="18" r="1" fill="#535547"/><path d="M21 23q3 2 6 0" fill="none" stroke="#a8765a" stroke-width="1.2"/></svg></div>`; }
  function need(label, value) { const v = clamp(value, 0, 100); return `<div class="need-row"><span>${label}</span><span class="need-track"><span class="need-fill ${v < 35 ? 'low' : ''}" style="width:${v}%"></span></span><span class="need-value">${Math.round(v)}</span></div>`; }
  function preserveScroll(render) { const panel = $('detail-panel'), pos = panel.scrollTop; render(); panel.scrollTop = pos; }
  function renderAgent() {
    const person = byId(selectedId);
    if (!person) { $('detail-content').innerHTML = '<h2 class="detail-title">远方的生活</h2><p class="panel-intro">这位居民已经离开小城。你仍能在小城来信里读到他留下的故事。</p>'; return; }
    const friends = (person.friends || []).map(f => ({person:byId(typeof f === 'object' ? f.id : f),score:f.score ?? 0})).filter(f => f.person).sort((a,b) => b.score-a.score).slice(0,5);
    $('detail-content').innerHTML = `${portrait(person.color)}<h2 class="detail-title">${esc(person.name)}</h2><p class="detail-subtitle">${num(person.age)} 岁 · ${esc(person.role || '居民')}<br>住在${esc(buildingName(person.homeId))}</p><div class="action-line">${esc(person.action || '正在河谷散步')}</div>${need('饱腹',100-person.hunger)}${need('精力',person.energy)}${need('社交',person.social)}${need('幸福',person.happiness)}${need('健康',person.health)}<div class="detail-section"><div class="detail-kv"><span>随身积蓄</span><span>${num(person.money)} 贝</span></div><div class="detail-kv"><span>工作地点</span><span>${esc(person.workId != null ? buildingName(person.workId) : '暂未入职')}</span></div></div><button class="detail-button" data-follow="${esc(person.id)}">${icon('pin')}跟随他的脚步</button><div class="detail-section"><h3>熟悉的人</h3>${friends.length ? friends.map(f => `<button class="friend" data-agent="${esc(f.person.id)}"><span>${esc(f.person.name)}</span><span>${f.score > 60 ? '相处亲近' : f.score > 25 ? '常常交谈' : '渐渐熟悉'} ${icon('arrow')}</span></button>`).join('') : '<p>相遇需要一点时间。</p>'}</div><div class="detail-section"><h3>记得的事</h3>${(person.memories || []).slice(0,6).map(m => `<div class="memory"><small>第 ${num(m.day)} 天</small>${esc(m.text)}</div>`).join('') || '<p>新的一天，还会有新的故事。</p>'}</div>`;
  }
  function selectBuilding(id) { const building = resolveBuilding(id); if (!building) return; selectedKind = 'building'; selectedId = building.id; showPanel('building', '建筑观察'); view.setSelection('building', building.id); renderBuilding(); }
  function renderBuilding() {
    const building = buildingById(selectedId); if (!building) return;
    const residents = engine.state.agents.filter(a => a.homeId === building.id);
    const workers = engine.state.agents.filter(a => a.workId === building.id);
    const descriptions = {house:'有人在这里结束一天，也有人在这里计划明天。空房让新的居民有机会留下。',farm:'食物从这里进入公共粮仓。天气、季节和实际工作的居民，共同决定收成。',market:'居民在这里购买食物，价格随库存变化。消费款回流公共金库，支持下一天的工资。',workshop:'木料在这里变为日用品，既供应居民，也让小城与外界交换资源。',clinic:'照料身体，也缓解生活的压力。诊所需要有居民在这里工作。',cafe:'一杯茶的时间，足够让两个陌生人渐渐熟悉。',hall:'公共金库支撑工资、福利和新建筑。城镇政策在每一天的生活中生效。',park:'一块可以停下来的地方。居民在这里恢复心情，也结识新的朋友。',sawmill:'林场提供建设与制作所需的木材。生产取决于实际出勤。'};
    $('detail-content').innerHTML = `<h2 class="detail-title">${esc(building.name)}</h2><p class="detail-subtitle">${esc(roleNames[building.type] || building.type)} · 河谷坐标 ${building.x}, ${building.z}</p><p class="panel-intro">${descriptions[building.type] || '这是小城生活的一部分。'}</p>${building.progress != null && building.progress < 1 ? `<div class="action-line">正在建造 · ${Math.round(building.progress*100)}%</div>` : ''}<div class="detail-kv"><span>容纳人数</span><span>${num(building.capacity)} 人</span></div><div class="detail-kv"><span>${building.type === 'house' ? '住在这里' : '在此工作'}</span><span>${(building.type === 'house' ? residents : workers).length} 人</span></div><div class="detail-section"><h3>${building.type === 'house' ? '这扇门后的居民' : '在这里相遇'}</h3>${(building.type === 'house' ? residents : workers).map(person => residentRow(person)).join('') || '<p>这里还在等待新的脚步。</p>'}</div><button class="detail-button secondary" data-focus-building="${esc(building.id)}">${icon('pin')}靠近看看</button>`;
  }
  function residentRow(person) { const color = /^#[0-9a-f]{3,8}$/i.test(person.color || '') ? person.color : '#82946a'; return `<button class="resident-row" data-agent="${esc(person.id)}"><span class="resident-avatar" style="background:${color}">${esc(person.name?.slice(-1))}</span><span><strong>${esc(person.name)}</strong><small>${esc(person.role)} · ${esc(person.action)}</small></span><span class="resident-mood" title="幸福感">${Math.round(person.happiness)}</span></button>`; }
  function renderResidents() { $('detail-content').innerHTML = `<h2 class="detail-title">河谷里的名字</h2><p class="detail-subtitle">${engine.state.agents.length} 位居民，各有自己的日常。</p><label class="sr-only" for="resident-search">搜索居民姓名或职业</label><input class="search-input" id="resident-search" placeholder="找一个名字，或一种职业" value="${esc(searchText)}"><div id="resident-results"></div>`; renderResidentResults(); }
  function renderResidentResults() { const people = engine.state.agents.filter(a => `${a.name} ${a.role}`.includes(searchText.trim())).sort((a,b) => a.name.localeCompare(b.name,'zh-CN')); if ($('resident-results')) $('resident-results').innerHTML = people.map(residentRow).join('') || '<p class="empty-copy">没有找到这个名字。试试更短的关键词。</p>'; }
  function renderPolicy() {
    const p = engine.state.policies;
    $('detail-content').innerHTML = `<h2 class="detail-title">给生活一点方向</h2><p class="panel-intro">居民会自己决定如何过日子。你调整的是他们生活的条件，影响会随时间逐步出现。</p><div class="policy-control"><label for="tax">工资税率 <output id="tax-value">${Math.round(p.tax)}%</output></label><input type="range" id="tax" data-policy="tax" min="0" max="30" value="${p.tax}"><p>工资中留给公共金库的比例。较高税率支持建设，也会减少居民手里的积蓄。</p></div><div class="policy-control"><label for="welfare">福利投入 <output id="welfare-value">${Math.round(p.welfare)}%</output></label><input type="range" id="welfare" data-policy="welfare" min="0" max="100" value="${p.welfare}"><p>每日公共福利预算的投入比例。优先帮助手头拮据的居民，实际支出受公共资金限制。</p></div><div class="policy-control"><label for="openness">迁入开放度 <output id="openness-value">${Math.round(p.openness)}%</output></label><input type="range" id="openness" data-policy="openness" min="0" max="100" value="${p.openness}"><p>让多少远方的人有机会来到河谷。空房、粮食和幸福感，仍然决定他们是否愿意留下。</p></div><p class="long-note">栖川采用合作社式公共经济：生产进入共享仓储，消费款回流公共金库，工资与福利从金库支付，盈余可与外界交换。</p>`;
  }
  function renderBuild() {
    const r = engine.state.resources;
    const options = [['house','河畔新居','让更多人有一个可以留下的家。',45,180],['farm','一方新田','增加食物产出，也增加耕作岗位。',30,140],['workshop','手作工坊','把木材变成日用品，增加工作与对外贸易。',60,260],['park','树下小园','留下可以休息、交谈和结识朋友的空间。',20,120],['clinic','河谷诊所','提供医疗照料，让疲惫的居民得到恢复。',55,320]];
    $('detail-content').innerHTML = `<h2 class="detail-title">让小城长大一点</h2><p class="panel-intro">选一处新的生活空间。小城会寻找合适的空地，居民会逐步完成建造。</p><div class="resource-strip"><span>木材 <strong>${num(r.wood)}</strong></span><span>资金 <strong>${num(r.treasury)} 贝</strong></span></div>${options.map(([type,name,description,wood,money]) => `<div class="build-option"><h3>${name}</h3><p>${description}</p><small>${wood} 木材 · ${money} 贝</small><button data-build="${type}" ${r.wood < wood || r.treasury < money ? 'disabled title="资源暂时不足"' : ''}>建造</button></div>`).join('')}<p class="long-note">新建筑需要时间，尚未完工时不会提供服务。地图空间有限，小城会在无合适空地时告诉你。</p>`;
  }
  function renderEvents() {
    $('detail-content').innerHTML = `<h2 class="detail-title">生活里的变奏</h2><p class="panel-intro">给河谷一个新的条件，看看居民怎样应对。每一次改变，都会留在小城的记录里。</p><div class="build-option"><h3>为田地引水</h3><p>修整水渠，给农田三天灌溉保护。</p><small>80 贝</small><button data-intervention="rain">引水</button></div><div class="build-option"><h3>经历一段旱季</h3><p>三天少雨。粮食、物价与心情会怎样变化？</p><small>持续 3 天</small><button data-intervention="drought">开始</button></div><div class="build-option"><h3>举办河岸节</h3><p>用一场相聚，给居民结识彼此的机会。</p><small>150 贝 · 20 粮食</small><button data-intervention="festival">筹办</button></div><div class="build-option"><h3>一船远方的粮食</h3><p>用公共资金换来 90 份粮食，缓解眼前的短缺。</p><small>180 贝</small><button data-intervention="supplies">采购</button></div><p class="long-note">不必急着干预。把时间调快一些，单纯看看日子如何变化，也很好。</p>`;
  }
  function renderChronicle() {
    const s = engine.getStats(), history = engine.state.history || [];
    let chart = '<p class="empty-copy">等完整的一天过去，小城会在这里留下第一笔记录。</p>';
    if (history.length > 1) {
      const points = history.slice(-45), maxY = Math.max(100,...points.map(h=>h.population));
      const path = key => points.map((p,i)=>`${i?'L':'M'}${(i/(points.length-1)*270+4).toFixed(1)},${(124-clamp(p[key],0,maxY)/maxY*110).toFixed(1)}`).join(' ');
      chart = `<svg class="timeline-chart" viewBox="0 0 280 140" role="img" aria-label="最近 ${points.length} 天的人口与幸福感趋势，共用零至 ${Math.ceil(maxY)} 刻度"><path d="M4 14H274M4 69H274M4 124H274" stroke="#dce2d3" fill="none"/><path d="${path('population')}" stroke="#527d60" stroke-width="2" fill="none"/><path d="${path('happiness')}" stroke="#b96649" stroke-width="2" fill="none"/></svg><div class="chart-axis"><span>第 ${points[0].day} 天</span><span>第 ${points[points.length-1].day} 天</span></div><div class="chart-legend"><span>人口（人）</span><span>幸福感（分）</span></div>`;
    }
    $('detail-content').innerHTML = `<h2 class="detail-title">河谷年鉴</h2><p class="detail-subtitle">第 ${engine.state.day} 天 · 每天记下一次生活的样子</p>${chart}<div class="detail-section"><h3>今天的小城</h3><div class="detail-kv"><span>就业率</span><span>${num(s.employment)}%</span></div><div class="detail-kv"><span>住房容量</span><span>${num(s.population)} / ${num(s.capacity)} 人</span></div><div class="detail-kv"><span>粮食价格</span><span>${Number(s.foodPrice || 0).toFixed(1)} 贝 / 份</span></div><div class="detail-kv"><span>粮食 / 木材 / 日用品</span><span>${num(s.food)} / ${num(s.wood)} / ${num(s.goods)}</span></div><div class="detail-kv"><span>累计迁入 / 离开</span><span>${num(s.arrivals)} / ${num(s.departures)}</span></div><div class="detail-kv"><span>熟人关系</span><span>${num(s.socialBonds)} 对</span></div></div><p class="long-note">这里记录的是虚构居民在一组规则下的生活。它让因果变得可观察，不用于预测真实城市。</p><a class="detail-button secondary" href="guide.html">翻开观察手记 ${icon('arrow')}</a>`;
  }
  function renderStorage() { $('detail-content').innerHTML = `<h2 class="detail-title">把故事留下来</h2><p class="panel-intro">小城会自动保存在这个浏览器里。下载一份存档，可以换一台设备继续这段生活。</p><div class="storage-actions"><button class="detail-button" id="export-world">${icon('download')}导出小城存档</button><button class="detail-button secondary" id="import-world">${icon('save')}导入已有存档</button><button class="detail-button secondary" id="manual-save">保存到此浏览器</button></div><p class="long-note">关闭页面后，小城的时间也会停下。再次打开时，它会从保存的那一刻继续。存档只保存在你的设备上。</p><button class="danger-link" id="request-reset">重新开始一座小城</button>`; }
  function openPanel(name) { if (activePanel === name) { closePanel(); return; } selectedKind = null; selectedId = null; view.setSelection(null,null); const labels = {residents:'认识居民',policy:'城镇政策',build:'建设小城',events:'条件与变化',chronicle:'观察记录',storage:'保存与继续'}; showPanel(name,labels[name] || '观察'); ({residents:renderResidents,policy:renderPolicy,build:renderBuild,events:renderEvents,chronicle:renderChronicle,storage:renderStorage})[name]?.(); $('detail-panel').scrollTop=0; }
  function exportWorld() { const blob = new Blob([engine.serialize()],{type:'application/json'}), url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href=url; anchor.download=`栖川-第${engine.state.day}天-${engine.state.seed}.json`; anchor.click(); setTimeout(()=>URL.revokeObjectURL(url),5000); toast('这段生活已经装进存档。'); }
  function resetWorld() { engine = new TownEngine((Date.now() ^ Math.floor(performance.now()*1000))>>>0); view.setEngine(engine); view.home(); closePanel(); lastNews=''; setPaused(false); saveWorld(); updateStats(); updateTime(); updateNews(); $('reset-dialog').close(); toast('另一座栖川，迎来了它的第一个清晨。'); }
  document.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.agent != null) { selectAgent(button.dataset.agent); return; }
    if (button.dataset.building != null) { selectBuilding(button.dataset.building); return; }
    if (button.dataset.event != null) { const item=engine.state.events.find(e=>String(e.id)===button.dataset.event); if(item)toast(item.text || item.title); return; }
    if (button.dataset.follow != null) { const person=resolveAgent(button.dataset.follow); if(person){ view.focusAgent(person.id); toast(`正在跟随${person.name}。拖动地图可回到自由观察。`); } return; }
    if (button.dataset.focusBuilding != null) { const b=resolveBuilding(button.dataset.focusBuilding); if(b)view.focusBuilding(b.id); return; }
    if (button.dataset.panel) { openPanel(button.dataset.panel); return; }
    if (button.dataset.speed) { setSpeed(Number(button.dataset.speed)); return; }
    if (button.dataset.layer) { view.setLayer(button.dataset.layer); document.querySelectorAll('[data-layer]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));}); $('map-legend').innerHTML = `<span class="legend-dot"></span>${{life:'每一个小小身影，都有自己的生活',mood:'暖色：需要关心 · 绿色：生活安稳',work:'沿着工作的脚步，看见资源怎样流动'}[button.dataset.layer]}`; return; }
    if (button.dataset.build) { const result=engine.build(button.dataset.build); toast(result.message); renderBuild(); updateStats(); updateNews(); return; }
    if (button.dataset.intervention) { const result=engine.intervene(button.dataset.intervention); toast(result.message); updateStats(); updateNews(); return; }
    switch(button.id) {
      case 'pause':setPaused(!paused);break;
      case 'zoom-in':view.zoomBy(1.2);break;
      case 'zoom-out':view.zoomBy(1/1.2);break;
      case 'fit-map':view.home();break;
      case 'close-detail':closePanel();break;
      case 'save-menu':openPanel('storage');break;
      case 'save-now':case 'manual-save':saveWorld(true);break;
      case 'export-world':exportWorld();break;
      case 'import-world':$('import-file').click();break;
      case 'request-reset':$('reset-dialog').showModal();break;
      case 'cancel-reset':$('reset-dialog').close();break;
      case 'confirm-reset':resetWorld();break;
      case 'dismiss-hint':$('map-hint').classList.add('hidden');break;
      case 'mobile-overview':{const rail=document.querySelector('.observation-rail');rail.classList.toggle('mobile-open');button.setAttribute('aria-expanded',String(rail.classList.contains('mobile-open')));if(rail.classList.contains('mobile-open'))closePanel();break;}
    }
  });
  document.addEventListener('input',event=>{const target=event.target;if(target.dataset.policy){engine.setPolicy(target.dataset.policy,Number(target.value));$(target.dataset.policy+'-value').textContent=target.value+'%';}if(target.id==='resident-search'){searchText=target.value;renderResidentResults();}});
  $('import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(file.size>8*1024*1024){toast('存档过大，请选择小于 8 MB 的栖川 JSON 存档。');event.target.value='';return;}
    try{const next=TownEngine.restore(await file.text());engine=next;view.setEngine(engine);view.home();closePanel();lastNews='';saveWorld();updateStats();updateTime();updateNews();toast(`欢迎回来。现在是小城的第 ${engine.state.day} 天。`);}catch(error){toast('这份文件不是可读取的栖川存档，当前小城未被替换。');}
    event.target.value='';
  });
  document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.ctrlKey||event.metaKey||event.altKey||$('reset-dialog').open)return;if(event.code==='Space'&&!event.target.closest('button,a')){event.preventDefault();setPaused(!paused);}if(event.key==='1')setSpeed(1);if(event.key==='2')setSpeed(3);if(event.key==='3')setSpeed(8);if(event.key.toLowerCase()==='h')view.home();if(event.key==='Escape')closePanel();});
  window.addEventListener('resize',()=>view.resize());
  window.addEventListener('pagehide',()=>saveWorld());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveWorld();});
  let last=performance.now(), uiClock=0, saveClock=0;
  function frame(now){const dt=Math.min(.15,Math.max(0,(now-last)/1000));last=now;if(!paused&&!document.hidden)engine.step(dt*.4*speed);view.draw(now);uiClock+=dt;saveClock+=dt;if(uiClock>.6){uiClock=0;updateTime();updateStats();updateNews();if(now-lastPanelRefresh>1800&&!$('detail-panel').contains(document.activeElement)){lastPanelRefresh=now;if(activePanel==='agent')preserveScroll(renderAgent);if(activePanel==='building')preserveScroll(renderBuilding);if(activePanel==='chronicle')preserveScroll(renderChronicle);}}if(saveClock>12){saveClock=0;saveWorld();}requestAnimationFrame(frame);}
  updateTime();updateStats();updateNews();view.resize();requestAnimationFrame(frame);
  if(restored){$('map-hint').querySelector('span').textContent=`欢迎回来。你离开时的故事，停在第 ${engine.state.day} 天。`;}
  setTimeout(()=>$('map-hint').classList.add('hidden'),16000);
})();
