import { PREFIX, GRACE, createBeing, settle, memory, inheritFarewell, gateReady, hash } from './engine.js';

const $ = id => document.getElementById(id);
const uid = () => crypto.randomUUID();
let state, channel, releaseLock, timer, animation, lastFrame = 0, openedGate = false;
let departed = false, storageFailed = false, memorySignature = '', ecologySignature = '';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const read = key => { try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; } };
function notice(text) { $('notice').textContent = text; $('notice').hidden = false; }
function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
  catch {
    if (!storageFailed) notice('浏览器无法保存这个宇宙。请允许此网站使用本地存储，再刷新页面。');
    storageFailed = true;
    return false;
  }
}
function entries(type) {
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX + type)) continue;
    const value = read(key.slice(PREFIX.length));
    if (value) result.push(value);
  }
  return result;
}
function validDeparture(being) {
  const exit = read('farewell:' + being.id);
  return exit && exit.at >= being.updated ? exit : null;
}
function peers() {
  const now = Date.now();
  return entries('being:').sort((a, b) => a.born - b.born).map(b => {
    const exit = validDeparture(b);
    return { ...b, presence: exit ? (now - exit.at >= GRACE ? 'departed' : 'leaving') : now - b.updated > 90000 ? 'unknown' : b.mode };
  });
}
function save() {
  state.updated = Date.now();
  write('being:' + state.id, state);
  channel?.postMessage({ type: 'change', id: state.id });
}
async function claim(id) {
  if (!navigator.locks) return false;
  return new Promise((resolve, reject) => {
    navigator.locks.request(PREFIX + id, { ifAvailable: true }, async lock => {
      resolve(Boolean(lock));
      if (lock) await new Promise(r => { releaseLock = r; });
    }).catch(reject);
  });
}
function newTab(fork) {
  settle(state, Date.now()); save();
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set(fork ? 'seed' : 'new', fork ? state.id : uid());
  const tab = window.open(url.href, '_blank');
  if (!tab) notice('新标签页没有打开。请允许弹出窗口，或手动复制当前网址打开新标签页。');
}
function receiveFarewells() {
  let changed = false;
  for (const exit of entries('farewell:')) {
    const source = read('being:' + exit.from);
    if (!source || exit.at < source.updated) continue;
    if (inheritFarewell(state, exit, Date.now())) changed = true;
  }
  if (changed) save();
}
function transition() {
  if (!state || departed) return;
  const now = Date.now();
  const previousMode = state.mode;
  const before = state.dark;
  settle(state, now);
  state.mode = document.hidden ? 'hidden' : 'visible';
  if (state.mode === 'visible' && previousMode === 'hidden') {
    if (state.dark - before >= 3 && state.mutations === 0) state.quote = '刚才，你去了哪里？';
    receiveFarewells();
  }
  save(); render();
  if (document.hidden) cancelAnimationFrame(animation);
  else animate(performance.now());
}
function leave(event) {
  if (!state || departed) return;
  settle(state, Date.now());
  state.mode = 'hidden'; save();
  if (event.persisted) { cancelAnimationFrame(animation); return; }
  const others = peers().filter(b => b.id !== state.id && ['visible', 'hidden'].includes(b.presence));
  others.sort((a, b) => b.updated - a.updated || a.id.localeCompare(b.id));
  write('farewell:' + state.id, {
    id: uid(), from: state.id, to: others[0]?.id || null, name: state.name,
    at: state.updated, energy: Math.round(state.energy * 0.5), hue: state.hue,
    words: state.memories.find(m => m.kind === 'dream')?.text || '曾经有一束光，停在我身上。'
  });
  channel?.postMessage({ type: 'change', id: state.id });
  departed = true; releaseLock?.();
}
function render() {
  if (!state) return;
  const all = peers();
  const active = all.filter(b => ['visible', 'hidden'].includes(b.presence));
  $('being-name').replaceChildren(document.createTextNode(state.name));
  const number = document.createElement('small'); number.textContent = '· ' + state.id.slice(0, 4).toUpperCase(); $('being-name').append(number);
  $('being-status').replaceChildren(Object.assign(document.createElement('i'), {}), document.createTextNode(document.hidden ? ' 在暗处做梦' : ' 被你看见'));
  $('lineage').replaceChildren(document.createTextNode(state.parent ? `第 ${state.generation + 1} 代生命` : '初代生命'), document.createElement('br'), document.createTextNode(state.parent ? `分自「${state.parentName}」` : '尚未分叉'));
  $('energy').textContent = Math.floor(state.energy);
  $('light').textContent = state.light < 60 ? Math.floor(state.light) : (state.light / 60).toFixed(1);
  $('light-unit').textContent = state.light < 60 ? '秒' : '分';
  $('dreams').textContent = state.mutations;
  if ($('quote').textContent !== state.quote) $('quote').textContent = state.quote;
  $('living-count').textContent = `${active.length} 个存在`;
  $('connection').textContent = channel ? '同源共生 · 记忆留在本机' : '静默共生 · 记忆留在本机';
  document.title = `${document.hidden ? '◌' : '●'} ${state.name}${state.parent ? '·枝' : ''} ${Math.floor(state.energy)} · 后台诸神`;
  const signature = JSON.stringify(state.memories);
  if (memorySignature !== signature) {
    memorySignature = signature;
    $('memory-count').textContent = String(state.memories.length).padStart(2, '0');
    $('memories').replaceChildren(...state.memories.map(m => {
      const li = document.createElement('li'), time = document.createElement('time'), p = document.createElement('p');
      time.dateTime = new Date(m.at).toISOString();
      const kind = { dream: '梦境', birth: '初生', inheritance: '回声', memory: '记忆' }[m.kind];
      time.textContent = `${new Date(m.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · ${kind}`;
      p.textContent = m.text; li.append(time, p); return li;
    }));
  }
  const visibleBeings = all.filter(b => b.presence !== 'departed').concat(all.filter(b => b.presence === 'departed').slice(-4));
  const ecosystemKey = JSON.stringify(visibleBeings.map(b => [b.id, b.presence, Math.floor(b.hue)]));
  if (ecosystemKey !== ecologySignature) {
    ecologySignature = ecosystemKey;
    $('beings').replaceChildren(...visibleBeings.map(b => {
      const el = document.createElement('div'); el.className = `being ${b.id === state.id ? 'self' : ''} ${b.presence}`;
      const orb = document.createElement('span'); orb.className = 'being-orb'; orb.style.color = `hsl(${b.hue} 24% 35%)`; orb.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span'), name = document.createElement('b'), status = document.createElement('small');
      name.textContent = b.name + (b.id === state.id ? ' · 此处' : '');
      status.textContent = { visible: '光里', hidden: '暗处', leaving: '正在远去', departed: '留下了回声', unknown: '远处 · 未确认' }[b.presence] + (b.parent ? ` · ${b.parentName}的分枝` : '');
      text.append(name, status); el.append(orb, text); return el;
    }));
  }
  const ready = gateReady(active);
  if (ready && !openedGate) {
    openedGate = true;
    memory(state, '光与暗在两个生命之间相遇。我们看见了一道门。', 'memory');
    state.quote = '原来光与黑暗，缺一不可。'; save();
  }
  $('gate').hidden = !ready;
  $('suggestion').textContent = active.length < 2 ? '试着打开第二个标签页。让另一个生命，在暗处醒来。' : state.dark < 12 ? '换一个标签页，停留十二秒。回来时，听听它做了什么梦。' : '它已学会独自做梦。你可以继续看着，也可以暂时离开。';
}

const canvas = $('organism'), ctx = canvas.getContext('2d');
let width = 0, height = 0;
function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width; height = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw(performance.now());
}
function draw(time) {
  if (!state || !width) return;
  ctx.clearRect(0, 0, width, height);
  const t = reducedMotion.matches ? 0 : time / 1800;
  const seed = hash(state.id), hue = state.hue;
  const growth = Math.min(1, state.energy / 80);
  const radius = Math.min(width * 0.19, height * 0.25) * (0.8 + growth * 0.35);
  ctx.save(); ctx.translate(width / 2, height / 2);
  // A radial colony: thin, independently moving filaments share one living core.
  for (let i = 0; i < 138; i++) {
    const angle = i * Math.PI * 2 / 138;
    const variation = Math.sin(i * 3.73 + seed) * 0.5 + 0.5;
    const length = radius * (1.05 + variation * 0.62 + growth * 0.2);
    const curl = Math.sin(i * 1.1 + t * 0.6) * (13 + state.mutations % 8 * 2);
    ctx.save();ctx.rotate(angle);
    ctx.strokeStyle = `hsla(${hue}, ${22 + variation * 12}%, ${28 + variation * 20}%, ${0.17 + variation * 0.34})`;
    ctx.lineWidth = i % 4 ? 0.55 : 0.9;
    ctx.beginPath();ctx.moveTo(radius * .21, 0);
    ctx.bezierCurveTo(radius * .62, curl * .9, length * .74, -curl, length + Math.sin(t + i) * 3, curl * .25);
    ctx.stroke();
    if (i % 3 === 0) {
      const x = length * .7;
      ctx.beginPath();ctx.moveTo(x, -curl * .1);ctx.quadraticCurveTo(x * 1.03, -12, x * 1.13, -9 - variation * 8);ctx.stroke();
    }
    if (i % 7 === 0) {
      ctx.fillStyle = `hsla(${hue},30%,38%,.55)`;
      ctx.beginPath();ctx.ellipse(length, curl * .25, 1.7, 1, angle, 0, Math.PI * 2);ctx.fill();
    }
    ctx.restore();
  }
  for (let ring = 0; ring < 22; ring++) {
    const r = radius * (.16 + ring * .023);
    ctx.beginPath();
    for (let j = 0; j <= 120; j++) {
      const a = j / 120 * Math.PI * 2;
      const wave = 1 + Math.sin(a * 5 + t * .35 + ring * .2) * .06 + Math.sin(a * 3 - t * .4) * .06;
      const x = Math.cos(a) * r * wave, y = Math.sin(a) * r * wave;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();ctx.strokeStyle = `hsla(${hue},30%,32%,${.14 + (22 - ring) / 100})`;ctx.lineWidth = .6;ctx.stroke();
  }
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * .23);
  core.addColorStop(0, `hsla(${hue},30%,25%,.85)`);core.addColorStop(.3, `hsla(${hue},28%,32%,.55)`);core.addColorStop(1, `hsla(${hue},25%,40%,0)`);
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,radius*.23,0,Math.PI*2);ctx.fill();
  for (let i=0;i<32;i++) {
    const angle = i * 2.39996 + seed, orbit = radius * (1.5 + (i % 7) * .15);
    const drift = Math.sin(t * .25 + i) * 4;
    ctx.fillStyle = i % 6 ? `hsla(${hue},25%,40%,.25)` : 'rgba(177,106,68,.55)';
    ctx.beginPath();ctx.arc(Math.cos(angle)*orbit+drift,Math.sin(angle)*orbit*.76, i%6 ? .8 : 1.3,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function animate(time) {
  cancelAnimationFrame(animation);
  if (document.hidden || departed) return;
  if (time - lastFrame > (reducedMotion.matches ? 1000 : 33)) { draw(time); lastFrame = time; }
  animation = requestAnimationFrame(animate);
}
async function init() {
  const probe = PREFIX + 'probe'; localStorage.setItem(probe, '1'); localStorage.removeItem(probe);
  sessionStorage.setItem(PREFIX + 'probe', '1'); sessionStorage.removeItem(PREFIX + 'probe');
  const params = new URLSearchParams(location.search);
  const previous = sessionStorage.getItem(PREFIX + 'id');
  let parent = params.has('seed') ? read('being:' + params.get('seed')) : null;
  let id = !params.has('seed') && !params.has('new') && previous ? previous : uid();
  let owns = await claim(id);
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!owns && navigation?.type === 'reload' && navigator.locks) { await new Promise(r => setTimeout(r, 150)); owns = await claim(id); }
  if (!owns) {
    parent ||= read('being:' + id);
    id = uid();
    if (navigator.locks) await claim(id);
  }
  state = read('being:' + id);
  if (state) {
    // A reload resumes the same being and invalidates its pending farewell.
    localStorage.removeItem(PREFIX + 'farewell:' + id);
    settle(state, Date.now());
  } else state = createBeing(id, Date.now(), parent);
  sessionStorage.setItem(PREFIX + 'id', id);
  history.replaceState(null, '', location.pathname);
  state.mode = document.hidden ? 'hidden' : 'visible';
  if ('BroadcastChannel' in window) {
    try { channel = new BroadcastChannel(PREFIX + 'sky'); channel.onmessage = () => { if (!departed) { receiveFarewells(); render(); } }; }
    catch { channel = null; }
  }
  window.addEventListener('storage', event => {
    if (event.key?.startsWith(PREFIX) && !departed) { receiveFarewells(); render(); }
  });
  $('create').onclick = () => newTab(false);
  $('fork').onclick = () => newTab(true);
  $('help-toggle').onclick = () => {
    const expanded = $('guide').hidden;
    $('guide').hidden = !expanded; $('help-toggle').setAttribute('aria-expanded', String(expanded));
  };
  document.addEventListener('visibilitychange', transition);
  // Some browser hosts omit visibilitychange while still updating document.hidden.
  // Focus events and the normal heartbeat reconcile that state without relying on timer precision.
  window.addEventListener('focus', () => setTimeout(transition, 0));
  window.addEventListener('blur', () => setTimeout(transition, 0));
  window.addEventListener('pagehide', leave);
  window.addEventListener('pageshow', event => { if (event.persisted) transition(); });
  new ResizeObserver(resize).observe(canvas);
  timer = setInterval(() => {
    if (departed) return;
    if (state.mode !== (document.hidden ? 'hidden' : 'visible')) transition();
    settle(state, Date.now()); receiveFarewells(); save(); render();
  }, 1000);
  save(); receiveFarewells(); render(); resize(); animate(performance.now());
}
init().catch(error => {
  console.error(error);
  clearInterval(timer); releaseLock?.();
  $('being-status').textContent = '还无法醒来';
  $('create').disabled = true; $('fork').disabled = true;
  notice(location.protocol === 'file:' ? '请用项目里的“启动.cmd”打开本地网址；直接双击 HTML 无法建立共同的宇宙。' : '这个宇宙未能启动。请允许本地存储并刷新页面；若仍失败，请查看浏览器控制台。');
});
