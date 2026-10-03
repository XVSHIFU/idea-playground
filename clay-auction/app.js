'use strict';
const E = window.ClayAuction;
const $ = selector => document.querySelector(selector);
const STORE = 'clay-auction:v1';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let state = E.create(), shape = 'arch', draft = [], origin = [400, 338], rotation = 0, drawing = false, review = null, storageOK = true;
let bootNotice = '';
try { const raw = localStorage.getItem(STORE); if (raw) state = E.restore(JSON.parse(raw)); }
catch { bootNotice = '无法读取旧进度，已准备新一轮。旧存档会在你确认下一次操作时替换。'; }
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); storageOK = true; }
  catch { storageOK = false; }
  $('#storage-status').textContent = storageOK ? '进度保存在当前浏览器 · 未确认的泥不保存' : '浏览器无法保存进度，请在离开前保存作品图';
}
function say(text) { $('#notice').textContent = text; }
function clay(points, color, opacity = 1) {
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return `<g opacity="${opacity}" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${path}" stroke="${color}" stroke-width="26" filter="url(#clay-shadow)"/><path d="${path}" stroke="#000" stroke-width="26" opacity=".06" transform="translate(0,2)"/><path d="${path}" stroke="${color}" stroke-width="23"/><path d="${path}" stroke="#fff" stroke-width="5" opacity=".15" transform="translate(-2,-4)"/></g>`;
}
function paint() {
  const visible = review === null ? state.pieces.length : review;
  $('#pieces').innerHTML = state.pieces.slice(0, visible).map(p => clay(p.points, E.COLORS[p.owner])).join('');
  $('#draft').innerHTML = draft.length > 1 && review === null ? clay(draft, E.COLORS[state.turn ?? 0], .7) : '';
  const valid = draft.length > 1 && E.validShape(draft) && E.attached(state, draft);
  $('#bid').disabled = !valid || review !== null || state.status !== 'playing';
  $('#clear-draft').disabled = !draft.length;
  $('#draft-status').textContent = review !== null ? '正在回看' : !draft.length ? '尚未放置' : !E.validShape(draft) ? '请缩短泥条或移回台面' : valid ? '接住了，可以出价' : '还没有碰到已有的泥';
  $('#stage-caption').textContent = review !== null ? `回看到第 ${review} 块出价 · 接上的泥都留了下来` : state.status === 'finished' ? '谁的主意，已经分不清了。' : state.pieces.length ? '你还想把它带回家吗？' : '一块底泥。十五次改变它的机会。';
  $('#return-now').hidden = review === null;
  $('#exit').disabled = review !== null;
  $('#freehand').disabled = state.status !== 'playing';
}
function render() {
  const playing = state.status === 'playing';
  $('#play-controls').hidden = !playing; $('#result').hidden = playing;
  $('#piece-count').textContent = `${state.pieces.length} 块出价`;
  $('#work-title').textContent = state.title || (playing ? '还没决定长成什么' : state.winner === null ? '这次，谁也没带走它' : '现在，它有了归属');
  $('#leader').textContent = state.leader === null ? '还没有人出价' : `最后出价：${state.players[state.leader].name}`;
  document.documentElement.style.setProperty('--clay', E.COLORS[state.turn ?? state.winner ?? 0]);
  $('#players').innerHTML = state.players.map((p, i) => {
    const status = state.winner === i && !playing ? '带走整件作品' : p.out ? '已退出' : state.turn === i ? '正在出价' : state.leader === i ? '暂时领先' : p.remaining === 0 ? '材料已用完' : '等下一次转向';
    return `<article class="player ${state.turn === i ? 'current' : ''} ${p.out ? 'out' : ''}" style="--player-color:${p.color}"><div class="player-head"><span class="player-dot" style="background:${p.color}"></span><h3>${escapeHTML(p.name)}</h3><span class="player-state">${status}</span></div><p class="player-wish">想要：${escapeHTML(p.wish)}</p><div class="material-row" aria-label="还剩 ${p.remaining} 块泥">${Array.from({ length: 5 }, (_, n) => `<span aria-hidden="true" class="pebble ${n >= p.remaining ? 'used' : ''}"></span>`).join('')}<span class="material-count">余 ${p.remaining} / 5</span></div></article>`;
  }).join('');
  if (playing) {
    const p = state.players[state.turn];
    $('#turn-heading').textContent = `轮到${p.name}`;
    $('#turn-dot').style.background = p.color;
    $('#turn-hint').textContent = `还剩 ${p.remaining} 块泥。下一块，会改变谁的主意？`;
    $('#wish').value = p.wish;
  } else {
    $('#result-heading').textContent = state.winner === null ? '这一轮流拍了。' : `${state.players[state.winner].name}，把它带走吧。`;
    $('#result-copy').textContent = state.winner === null ? '没有人出价，底泥仍然是底泥。下一轮，换一个开头也可以。' : `${state.pieces.length} 块泥留在了一起。回看下面的过程，聊聊哪一步让你改了主意。`;
    $('#art-title').value = state.title;
  }
  let bids = 0;
  $('#history').innerHTML = state.events.map(event => {
    const p = state.players[event.who];
    const text = event.type === 'bid' ? `第 ${++bids} 块 · ${p.name}接上一块泥` : event.type === 'wish' ? `${p.name}改了主意：${event.wish}` : `${p.name}退出了`;
    return `<li><span class="player-dot" style="background:${p.color}"></span>${escapeHTML(text)}</li>`;
  }).join('');
  $('#history-count').textContent = state.pieces.length ? `${state.pieces.length} 次塑形 · ${state.events.filter(e => e.type === 'wish').length} 次改主意` : '还没有出价';
  $('#timeline').max = state.pieces.length; $('#timeline').value = review ?? state.pieces.length; $('#timeline').disabled = !state.pieces.length;
  paint();
}
function resetDraft() { draft = []; drawing = false; rotation = 0; $('#rotation').value = 0; $('#rotation-value').textContent = '0°'; $('#exit-confirm').hidden = true; }
function commit(action) {
  try {
    const name = state.players[state.turn].name;
    state = E.act(state, action); resetDraft(); review = null; save(); render();
    say(action.type === 'bid' ? `${name}的这一块留下了。${state.status === 'playing' ? `请把操作交给${state.players[state.turn].name}。` : '这一轮落槌了。'}` : `${name}退出了，已经接上的泥仍留在这里。`);
    if (state.status === 'playing') $('#turn-heading').focus({ preventScroll: true });
  } catch (error) { say(error.message); }
}
function choose(kind) {
  shape = kind; resetDraft();
  document.querySelectorAll('[data-shape]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.shape === kind)));
  $('#rotation').disabled = kind === 'free';
  $('#placement-hint').textContent = kind === 'free' ? '按住台面画一条连续的泥。碰到已有的泥，就能接上。' : '点台面放上去，再调整方向。要碰到已有的泥。键盘也可用方向键和回车放置。';
  paint();
}
document.querySelectorAll('[data-shape]').forEach(b => b.addEventListener('click', () => choose(b.dataset.shape)));
function coordinates(event) {
  const matrix = $('#stage').getScreenCTM();
  const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return [Math.round(Math.max(20, Math.min(780, p.x)) * 10) / 10, Math.round(Math.max(20, Math.min(550, p.y)) * 10) / 10];
}
$('#stage').addEventListener('pointerdown', event => {
  if (state.status !== 'playing' || review !== null || event.button > 0) return;
  event.preventDefault(); $('#stage').focus({ preventScroll: true });
  origin = coordinates(event);
  if (shape === 'free') { drawing = true; draft = [origin]; $('#stage').setPointerCapture(event.pointerId); }
  else draft = E.preset(shape, ...origin, rotation);
  paint();
});
$('#stage').addEventListener('pointermove', event => {
  if (!drawing || draft.length >= 235) return;
  const p = coordinates(event), previous = draft.at(-1), distance = E.distance(previous, p);
  if (distance < 3) return;
  const remaining = 235 - E.length(draft);
  if (remaining < .2) return;
  const ratio = Math.min(1, remaining / distance);
  draft.push([previous[0] + (p[0] - previous[0]) * ratio, previous[1] + (p[1] - previous[1]) * ratio]); paint();
});
$('#stage').addEventListener('pointerup', () => { drawing = false; paint(); });
$('#stage').addEventListener('pointercancel', () => { drawing = false; paint(); });
$('#stage').addEventListener('keydown', event => {
  if (state.status !== 'playing' || review !== null) return;
  const directions = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] };
  if (directions[event.key]) {
    event.preventDefault(); const delta = directions[event.key];
    origin = [Math.max(95, Math.min(705, origin[0] + delta[0])), Math.max(95, Math.min(475, origin[1] + delta[1]))];
    if (shape === 'free') choose('arch');
    draft = E.preset(shape, ...origin, rotation); paint();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); if (shape === 'free') choose('arch'); draft = E.preset(shape, ...origin, rotation); paint();
  } else if (event.key === 'Escape') { resetDraft(); paint(); }
});
$('#rotation').addEventListener('input', event => { rotation = Number(event.target.value); $('#rotation-value').textContent = `${rotation}°`; if (draft.length && shape !== 'free') draft = E.preset(shape, ...origin, rotation); paint(); });
$('#clear-draft').addEventListener('click', () => { resetDraft(); paint(); });
$('#bid').addEventListener('click', () => commit({ type: 'bid', points: draft }));
$('#exit').addEventListener('click', () => { $('#exit-confirm').hidden = false; $('#confirm-exit').focus(); });
$('#cancel-exit').addEventListener('click', () => { $('#exit-confirm').hidden = true; $('#exit').focus(); });
$('#confirm-exit').addEventListener('click', () => commit({ type: 'exit' }));
$('#wish-form').addEventListener('submit', event => {
  event.preventDefault();
  try { state = E.act(state, { type: 'wish', wish: $('#wish').value }); save(); render(); say('记下了。你可以朝新的愿望继续出价。'); } catch (error) { say(error.message); }
});
$('#timeline').addEventListener('input', event => { review = Number(event.target.value) === state.pieces.length ? null : Number(event.target.value); $('#exit-confirm').hidden = true; paint(); });
$('#return-now').addEventListener('click', () => { review = null; $('#timeline').value = state.pieces.length; paint(); });
function showSetup() {
  $('#setup-fields').innerHTML = state.players.map((p, i) => `<div><label>第 ${i + 1} 位的名字<input name="name${i}" required maxlength="12" value="${escapeHTML(p.name)}"></label><label>开场时想要什么<input name="wish${i}" required maxlength="60" value="${escapeHTML(state.initial[i].wish)}"></label></div>`).join('');
  $('#setup').hidden = false; $('#setup input').focus(); $('#setup').scrollIntoView({ block: 'start', behavior: 'auto' });
}
$('#new-game').addEventListener('click', showSetup); $('#again').addEventListener('click', showSetup);
$('#cancel-setup').addEventListener('click', () => { $('#setup').hidden = true; $('#new-game').focus(); });
$('#setup-form').addEventListener('submit', event => {
  event.preventDefault(); const data = new FormData(event.target);
  state = E.create([0, 1, 2].map(i => ({ name: data.get(`name${i}`), wish: data.get(`wish${i}`) })), Number($('#first').value));
  resetDraft(); review = null; choose('arch'); save(); render(); $('#setup').hidden = true; say('新的一轮开始。先把你想要的样子说给同桌听。'); $('#turn-heading').focus({ preventScroll: false });
});
$('#art-title').addEventListener('input', () => { state.title = $('#art-title').value.trim().slice(0, 40); save(); $('#work-title').textContent = state.title || '现在，它有了归属'; });
$('#download').addEventListener('click', () => {
  const title = state.title || '越抢越变形的拍卖会';
  const names = state.players.map(p => p.name).join('、');
  const owner = state.winner === null ? '流拍 · 没有人带走它' : `归属：${state.players[state.winner].name}`;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1080" viewBox="0 0 800 720"><rect width="800" height="720" fill="#f5efd9"/><text x="42" y="55" fill="#293d32" font-size="24" font-family="sans-serif">${escapeHTML(title)}</text><text x="42" y="83" fill="#62644c" font-size="12" font-family="sans-serif">${escapeHTML(owner)} · ${state.pieces.length} 块共同的出价</text><g transform="translate(0,55)">${$('#stage defs').outerHTML}${$('#base-clay').outerHTML}${state.pieces.map(p => clay(p.points, E.COLORS[p.owner])).join('')}</g><text x="42" y="670" fill="#293d32" font-size="13" font-family="sans-serif">${escapeHTML(names)} · 共同塑形</text><text x="42" y="695" fill="#62644c" font-size="11" font-family="sans-serif">越抢越变形的拍卖会 / 每一次出价，都留在作品里面。</text></svg>`;
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/[<>:"/\\|?*]/g, '_')}.svg`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 3000);
  say('作品图已交给浏览器下载。SVG 可以直接打开，也可以继续编辑。');
});
window.addEventListener('storage', event => {
  if (event.key === STORE) { $('#storage-status').textContent = '另一个标签页改变了存档。本页未同步，请刷新后继续。'; $('#bid').disabled = true; $('#exit').disabled = true; $('#play-controls').inert = true; $('#setup-form').inert = true; say('请刷新本页，接上另一页的最新进度。'); }
});
render();
try { localStorage.setItem(`${STORE}:check`, '1'); localStorage.removeItem(`${STORE}:check`); }
catch { storageOK = false; $('#storage-status').textContent = '浏览器无法保存进度，请在离开前保存作品图'; }
if (bootNotice) say(bootNotice);
