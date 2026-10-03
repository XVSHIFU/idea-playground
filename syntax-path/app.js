(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const scene = $('#scene');
  const key = 'syntax-path-notes-v1';
  const smallScreen = matchMedia('(max-width: 600px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const blank = () => ({ naturalness: '', text: '', completed: false });
  let notes = { A: blank(), B: blank() };
  let storageAvailable = true;
  let model = 'A', noteModel = 'A', step = 0, beadPosition = null, animation = 0, moving = false;
  const allowedRatings = ['', '自然', '需要上下文', '难以接受'];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    for (const id of ['A', 'B']) {
      if (saved && saved[id] && typeof saved[id] === 'object') {
        notes[id] = {
          naturalness: allowedRatings.includes(saved[id].naturalness) ? saved[id].naturalness : '',
          text: typeof saved[id].text === 'string' ? saved[id].text.slice(0, 6000) : '',
          completed: saved[id].completed === true
        };
      }
    }
  } catch { storageAvailable = false; }

  const rooms = [
    { id: 'entry', name: '我', subtitle: '入口庭院' },
    { id: 'verb', name: '看见了', subtitle: '主廊' },
    { id: 'hall', name: '共用门厅', subtitle: '一个接点' },
    { id: 'teacher', name: '老师', subtitle: '房间' },
    { id: 'and', name: '和', subtitle: '连接平台' },
    { id: 'friend', name: '朋友', subtitle: '房间' },
    { id: 'exit', name: '。', subtitle: '出口' }
  ];

  function itinerary() {
    const entry = { id: 'entry', title: '入口庭院', description: '你站在“我”的位置。沿着主廊，去看看这句话通向哪里。', next: '向前走' };
    const verb = { id: 'verb', title: '看见了', description: '动作把你带进主廊。前面是老师和朋友，但先留意通往侧室的门。', next: '继续向前' };
    const side = { id: 'side', title: '学生的', description: model === 'A' ? '你进入了“学生的”侧室。门接在共用门厅，关系延伸到老师和朋友。' : '你进入了同一间侧室。这次门开在老师房间里，“学生的”只与老师相连。', next: '返回接点' };
    const ending = [
      { id: 'and', title: '连接平台', description: '在“和”这里停一下，再走向另一个房间。', next: '走向朋友' },
      { id: 'friend', title: '朋友', description: model === 'A' ? '这个房间也在共用门厅的范围内。你刚刚经过的“学生的”，同样与它相连。' : '这个房间在修饰范围之外。当前的分组没有指定朋友属于谁。', next: '走到句末' },
      { id: 'exit', title: '一句话，走完了', description: '现在按原词序再读一遍。哪处连接让你回望？换一条小径，或在下面记下感受。', next: '换一种走法' }
    ];
    if (model === 'A') return [entry, verb,
      { id: 'hall', title: '共用门厅', description: '老师和朋友共用这个门厅。先抬起折页，去侧室看看。', next: '推门，进入侧室' }, side,
      { id: 'hall', title: '回到共用门厅', description: '你回到了进入时的接点。带着“学生的”这个关系，继续走过两个房间。', next: '走向老师' },
      { id: 'teacher', title: '老师', description: '老师是共用门厅后的第一间房。继续向前，关系还没有结束。', next: '继续向前' }, ...ending];
    return [entry, verb,
      { id: 'hall', title: '经过门槛', description: '这里没有通往侧室的门。再向前一点，走进老师的房间。', next: '走向老师' },
      { id: 'teacher', title: '老师', description: '侧室的门移到了这里。推开它，看看这间房与谁相连。', next: '推门，进入侧室' }, side,
      { id: 'teacher', title: '回到老师房间', description: '从老师房间进入，也回到老师房间。接下来走向“和”。', next: '继续向前' }, ...ending];
  }

  function positions() {
    const mobile = smallScreen.matches;
    const xs = [90, 225, 365, 505, 635, 775, 910];
    const ys = [74, 162, 250, 338, 426, 514, 610];
    const map = Object.fromEntries(rooms.map((room, i) => [room.id, mobile ? { x: 147, y: ys[i] } : { x: xs[i], y: 340 }]));
    const hinge = map[model === 'A' ? 'hall' : 'teacher'];
    map.side = mobile ? { x: 352, y: hinge.y } : { x: hinge.x, y: 132 };
    return { map, mobile, hinge };
  }
  const routePoint = point => ({ x: smallScreen.matches && point.x === 147 ? point.x - 43 : point.x, y: point.y + 22 });
  const pathString = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  function roomMarkup(room, position, mobile, visited, current) {
    const folded = $('#fold').checked;
    const w = mobile ? 112 : (room.id === 'exit' ? 68 : 108), h = mobile ? 65 : 82;
    const x = position.x - w / 2, y = position.y - h / 2;
    const depthX = folded ? (mobile ? 12 : 20) : 0, depthY = folded ? -12 : 0;
    const text = room.id === 'hall' && model === 'B' ? '门槛' : room.name;
    const subtext = room.id === 'hall' && model === 'B' ? '继续向前' : room.subtitle;
    return `<g class="room${visited ? ' visited' : ''}${current ? ' current' : ''}" data-room="${room.id}">
      <path class="room-top" d="M${x} ${y}l${depthX} ${depthY}h${w}l${-depthX} ${-depthY}z"/>
      <path class="room-side" d="M${x+w} ${y}l${depthX} ${depthY}v${h}l${-depthX} ${-depthY}z"/>
      <rect class="room-face" x="${x}" y="${y}" width="${w}" height="${h}"/>
      <text class="room-text" x="${position.x}" y="${position.y-5}">${text}</text>
      <text class="room-subtext" x="${position.x}" y="${position.y+12}">${subtext}</text></g>`;
  }

  function draw(animate = false) {
    cancelAnimationFrame(animation);
    moving = false;
    const steps = itinerary(), state = steps[step];
    const { map, mobile, hinge } = positions();
    const visited = new Set(steps.slice(0, step + 1).map(s => s.id));
    const points = steps.map(s => routePoint(map[s.id]));
    const full = pathString(points), traveled = pathString(points.slice(0, step + 1));
    const current = points[step];
    scene.setAttribute('viewBox', mobile ? '0 0 480 700' : '0 0 1000 500');
    scene.classList.toggle('diagram-hidden', $('#hide-labels').checked);
    const scope = mobile
      ? `<rect class="scope-area" x="65" y="${model === 'A' ? 204 : 291}" width="166" height="${model === 'A' ? 358 : 99}" rx="4"/>`
      : `<rect class="scope-area" x="${model === 'A' ? 300 : 438}" y="270" width="${model === 'A' ? 562 : 150}" height="133" rx="4"/>`;
    const doorX = mobile ? 244 : hinge.x, doorY = mobile ? hinge.y+22 : 235;
    const door = mobile
      ? `<line class="fold-line" x1="${doorX}" y1="${doorY-20}" x2="${doorX}" y2="${doorY+20}"/><g transform="translate(${doorX} ${doorY+20})"><path class="door-leaf${state.id === 'side' ? ' open' : ''}" d="M0 0V-40h12V0z"/></g>`
      : `<line class="fold-line" x1="${doorX-23}" y1="${doorY}" x2="${doorX+23}" y2="${doorY}"/><g transform="translate(${doorX-23} ${doorY})"><path class="door-leaf${state.id === 'side' ? ' open' : ''}" d="M0 0h46v-14H0z"/></g>`;
    scene.innerHTML = `<title id="scene-title">结构 ${model} 的句法小径</title>
      <desc id="scene-description">${model === 'A' ? '学生的侧室接到老师和朋友的共用门厅。' : '学生的侧室只接到老师房间。'}当前位置：${state.title}。使用旁边的向前和退一步按钮行走。</desc>
      ${scope}<path class="route-base" d="${full}"/>
      ${rooms.map(room => roomMarkup(room, map[room.id], mobile, visited.has(room.id), state.id === room.id)).join('')}
      ${roomMarkup({ id:'side', name:'学生的', subtitle:'侧室 · 原路返回' }, map.side, mobile, visited.has('side'), state.id === 'side')}
      <path class="route-base" d="${full}"/><path class="route-traveled" d="${traveled}"/>
      ${door}<circle class="end-dot" cx="${map.exit.x}" cy="${map.exit.y+22}" r="3"/>
      <text class="diagram-note" x="${mobile ? 147 : 570}" y="${mobile ? 672 : 447}">${model === 'A' ? '一扇门，关联两个房间' : '同一间侧室，换一个接点'}</text>
      <g id="bead"><circle class="bead-shell" r="9"/><circle class="bead-core" cx="-2" cy="-2" r="2.5"/></g>`;
    const bead = $('#bead');
    const from = beadPosition || current;
    const move = p => bead.setAttribute('transform', `translate(${p.x} ${p.y})`);
    if (animate && !reducedMotion.matches && (from.x !== current.x || from.y !== current.y)) {
      moving = true;
      const started = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - started) / 650);
        const ease = 1 - Math.pow(1-t, 3);
        beadPosition = { x: from.x + (current.x-from.x)*ease, y: from.y + (current.y-from.y)*ease };
        move(beadPosition);
        if (t < 1) animation = requestAnimationFrame(tick);
        else {
          moving = false;
          $('#next').disabled = false;
          $('#previous').disabled = step === 0;
        }
      };
      move(from); animation = requestAnimationFrame(tick);
    } else { beadPosition = current; move(current); }
    $('#place-title').textContent = state.title;
    $('#place-description').textContent = state.description;
    $('#step-count').textContent = `${step+1} / ${steps.length}`;
    $('#next').replaceChildren(document.createTextNode(state.next + ' '));
    const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = step === steps.length-1 ? '↗' : '→'; $('#next').append(arrow);
    $('#previous').disabled = step === 0 || moving;
    $('#next').disabled = moving;
    $('#step-progress').innerHTML = steps.map((_, i) => `<i class="${i === step ? 'current' : i < step ? 'passed' : ''}"></i>`).join('');
    $('#scene-name').textContent = model === 'A' ? '共用一间门厅' : '门开在老师房间里';
    $('#model-tag').textContent = `结构 ${model}`;
    $('#connection-description').textContent = model === 'A' ? '“学生的”接在共用门厅，同时关联老师与朋友。' : '“学生的”只接在老师房间；朋友属于谁，这里没有指定。';
    $('#bracket-reading').textContent = model === 'A' ? '我看见了［学生的［老师和朋友］］' : '我看见了［［学生的老师］和朋友］';
    $('#sentence-scope').innerHTML = model === 'A' ? '老师和朋友' : '老师<span class="outside-scope">和朋友</span>';
    document.querySelectorAll('[data-model]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === model)));
    if (step === steps.length-1 && !notes[model].completed) { notes[model].completed = true; save(); }
    updateWalkedStatus();
  }

  function save() {
    try { localStorage.setItem(key, JSON.stringify(notes)); storageAvailable = true; }
    catch { storageAvailable = false; }
    $('#save-status').textContent = storageAvailable ? '已保存在此浏览器' : '无法自动保存，请导出观察';
  }
  function updateWalkedStatus() {
    $('#walked-status').textContent = notes[noteModel].completed ? `结构 ${noteModel} 已走完，可以记下感受。` : `结构 ${noteModel}：走完后，再读一次原句。`;
  }
  function selectNote(id) {
    noteModel = id;
    document.querySelectorAll('[data-note]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.note === id)));
    $('#naturalness').value = notes[id].naturalness;
    $('#note').value = notes[id].text;
    updateWalkedStatus();
  }
  function switchModel(id) {
    if (id === model) return;
    model = id; step = 0; beadPosition = null;
    selectNote(id); draw();
  }
  function forward() {
    if (moving) return;
    if (step === itinerary().length-1) switchModel(model === 'A' ? 'B' : 'A');
    else { step++; draw(true); }
  }
  function previous() { if (!moving && step > 0) { step--; draw(true); } }
  document.querySelectorAll('[data-model]').forEach(b => b.addEventListener('click', () => switchModel(b.dataset.model)));
  document.querySelectorAll('[data-note]').forEach(b => b.addEventListener('click', () => selectNote(b.dataset.note)));
  $('#next').addEventListener('click', forward);
  $('#previous').addEventListener('click', previous);
  $('#restart').addEventListener('click', () => { step = 0; draw(); });
  $('#compare').addEventListener('click', () => switchModel(model === 'A' ? 'B' : 'A'));
  $('#fold').addEventListener('change', () => draw());
  $('#hide-labels').addEventListener('change', () => draw());
  $('#note').addEventListener('input', event => { notes[noteModel].text = event.target.value; save(); });
  $('#naturalness').addEventListener('change', event => { notes[noteModel].naturalness = event.target.value; save(); });
  $('#print').addEventListener('click', () => window.print());
  $('#export').addEventListener('click', () => {
    const body = ['# 句法小径观察', '', `导出时间：${new Date().toLocaleString('zh-CN')}`, '', '原句：我看见了学生的老师和朋友。', '', ...['A','B'].flatMap(id => [
      `## 结构 ${id}`, '', id === 'A' ? '学生的 → 老师和朋友的共用门厅' : '学生的 → 老师房间', '',
      `屏幕路径：${notes[id].completed ? '已走完' : '尚未走完'}`, `读法感受：${notes[id].naturalness || '未填写'}`, '', notes[id].text || '尚未填写观察。', ''
    ])].join('\n');
    const url = URL.createObjectURL(new Blob([body], { type:'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = '句法小径-观察.md'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('input,textarea,select,button,a,summary,[contenteditable]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); forward(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
  });
  smallScreen.addEventListener('change', () => { beadPosition = null; draw(); });
  if (!storageAvailable) $('#save-status').textContent = '无法读取笔记，请导出保留新观察';
  selectNote('A'); draw();
})();
