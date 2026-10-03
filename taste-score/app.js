import { TASTES, TECHNIQUES, buildProfile, loudestStep, timingGap } from './engine.js';
import { RECIPES } from './recipes.js';
import { createAudio } from './audio.js';

const STORAGE_KEY = 'taste-score:state:v1';
const canvas = document.querySelector('#plot');
const context = canvas.getContext('2d');
const audio = createAudio();
const dom = {
  dishName: document.querySelector('#dish-name'),
  dishLine: document.querySelector('#dish-line'),
  factMinutes: document.querySelector('#fact-minutes'),
  factSound: document.querySelector('#fact-sound'),
  techniqueButtons: document.querySelector('#technique-buttons'),
  techniqueNote: document.querySelector('#technique-note'),
  plotRange: document.querySelector('#plot-range'),
  plotEnd: document.querySelector('#plot-end'),
  steps: document.querySelector('#steps'),
  stepCounter: document.querySelector('#step-counter'),
  status: document.querySelector('#listen-status'),
  play: document.querySelector('#play'),
  playLabel: document.querySelector('#play-label'),
  stop: document.querySelector('#stop'),
  speed: document.querySelector('#speed'),
  speedValue: document.querySelector('#speed-value'),
  guessOptions: document.querySelector('#guess-options'),
  reveal: document.querySelector('#reveal'),
  hidden: document.querySelector('#hidden'),
  tasteBars: document.querySelector('#taste-bars'),
  audioLine: document.querySelector('#audio-line'),
  tasteLine: document.querySelector('#taste-line'),
  gapLine: document.querySelector('#gap-line'),
  paletteBody: document.querySelector('#palette-body'),
  paletteGap: document.querySelector('#palette-gap'),
  prev: document.querySelector('#dish-prev'),
  next: document.querySelector('#dish-next')
};

const stored = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
})();

const state = {
  dishIndex: Math.max(0, RECIPES.findIndex(recipe => recipe.id === stored.dishId)),
  techniqueId: TECHNIQUES.some(item => item.id === stored.techniqueId) ? stored.techniqueId : TECHNIQUES[0].id,
  speed: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(stored.speed) ? stored.speed : 1,
  revealed: !!stored.revealed,
  cursor: 0,
  playing: false
};

let profile = null;
let bursts = [];
let frame = null;

const recipe = () => RECIPES[state.dishIndex];

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dishId: recipe().id, techniqueId: state.techniqueId, speed: state.speed, revealed: state.revealed
    }));
  } catch { /* 存档不可用时不影响这次浏览 */ }
}

const level = value => value > 0.66 ? '很重' : value > 0.45 ? '偏重' : value > 0.28 ? '有一点' : '很淡';

/* 听觉侧的两个词只由曲线推出：亮度对比与咸味的积累量 */
const soundWords = metrics => [
  metrics.bright > metrics.deep * 1.1 ? '偏亮、收得快' : '偏厚、拖着尾巴',
  metrics.saltPops >= 3 ? `${metrics.saltPops} 下咸的点` : metrics.saltPops >= 1 ? '一下咸的点' : '咸味连成一片'
].join(' · ');

function labelFor(key, value) {
  const taste = TASTES.find(item => item.key === key);
  return `${taste.name}${level(value)}`;
}

function formatTime(minutes) {
  return profile && profile.minutes > 3
    ? `${Math.floor(minutes)}:${String(Math.round((minutes % 1) * 60)).padStart(2, '0')}`
    : `${minutes.toFixed(1)} 秒`.replace('.0 ', ' ');
}

function build() {
  /* 存档里可能留着这道菜讲不通的做法（例如焦糖洋葱 × 白灼），落到第一个讲得通的 */
  if (!recipe().techniques.includes(state.techniqueId)) state.techniqueId = recipe().techniques[0];
  profile = buildProfile(recipe(), state.techniqueId);
  bursts = [];
  for (const annotation of profile.annotations) {
    const from = Math.round(annotation.from / profile.resolution);
    const to = Math.min(profile.times.length - 1, Math.round(annotation.to / profile.resolution));
    let peak = 0;
    for (const taste of TASTES) {
      for (let index = from; index <= to; index += 1) peak = Math.max(peak, profile.curves[taste.key][index]);
    }
    if (peak >= 0.25) bursts.push({ from: annotation.from, to: annotation.to, peak: Math.min(1, peak) });
  }
  state.cursor = 0;
}

function renderStatic() {
  const current = recipe();
  dom.dishName.textContent = current.name;
  dom.dishLine.textContent = current.line;
  dom.factMinutes.textContent = `${current.steps.reduce((sum, step) => sum + step.minutes, 0)} 分钟`;
  dom.factSound.textContent = `${profile.total.toFixed(0)} 秒 · ${soundWords(profile.metrics)}`;
  dom.plotRange.textContent = '0 分';
  dom.plotEnd.textContent = `${profile.minutes} 分`;

  const technique = TECHNIQUES.find(item => item.id === state.techniqueId);
  dom.techniqueNote.textContent = technique.note;
  /* 讲不通的做法不放进选择：糖的焦化需要锅，白灼讲不出焦糖洋葱 */
  for (const button of dom.techniqueButtons.children) {
    const fits = current.techniques.includes(button.dataset.technique);
    button.disabled = !fits;
    button.setAttribute('aria-pressed', String(button.dataset.technique === state.techniqueId));
    button.title = fits ? '' : `${current.name}讲不通这种做法`;
  }

  dom.steps.replaceChildren();
  const ordered = [...profile.annotations].sort((a, b) => a.from - b.from);
  ordered.forEach((annotation, index) => {
    const item = document.createElement('li');
    item.dataset.id = annotation.id;
    item.dataset.from = String(annotation.from);
    item.dataset.to = String(annotation.to);
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `从第 ${index + 1} 步开始听：${annotation.action}`);
    const minute = document.createElement('span');
    minute.className = 'step-minute';
    minute.textContent = `${annotation.minutes} 分`;
    const body = document.createElement('span');
    body.className = 'step-body';
    const action = document.createElement('span');
    action.className = 'step-action';
    action.textContent = annotation.action;
    const note = document.createElement('span');
    note.className = 'step-note';
    note.textContent = annotation.note;
    body.append(action, note);
    button.append(minute, body);
    button.addEventListener('click', () => {
      state.cursor = annotation.from;
      draw();
      if (!audio.preview(profile, annotation.from)) return;
      setStatus(`${annotation.action}：先听这一步最重的那种味道，再决定要不要整段听。`);
    });
    item.append(button);
    dom.steps.append(item);
  });
  dom.stepCounter.textContent = `${ordered.length} 步`;

  dom.tasteBars.replaceChildren();
  for (const taste of TASTES) {
    const value = profile.residue[taste.key];
    const item = document.createElement('li');
    item.dataset.key = taste.key;
    item.dataset.armed = String(state.revealed);
    const name = document.createElement('span');
    name.textContent = taste.name;
    const bar = document.createElement('span');
    bar.className = 'bar';
    const fill = document.createElement('i');
    fill.style.background = taste.color;
    fill.style.width = `${Math.round(value * 100)}%`;
    bar.append(fill);
    const figure = document.createElement('span');
    figure.className = 'figure';
    figure.textContent = value.toFixed(2);
    item.append(name, bar, figure);
    dom.tasteBars.append(item);
  }

  dom.speed.value = String(state.speed);
  dom.speedValue.textContent = `${state.speed}×`;
  document.body.dataset.revealed = String(state.revealed);
  dom.reveal.disabled = state.revealed;
  dom.hidden.disabled = !state.revealed;

  describe();
  highlight();
}

/* 听觉与味觉的对照文字：数字全部来自曲线本身 */
function describe() {
  const { metrics, profile: peaks } = profile;
  /* "最重"按峰值排：舌头对最重的那一下比对一个很淡却持续很久的底味更敏感 */
  const ranked = Object.entries(peaks).sort((a, b) => b[1] - a[1]);
  const top = ranked.filter(([, value]) => value > 0.1).slice(0, 2);
  const quiet = ranked.filter(([, value]) => value < 0.08).slice(0, 2).map(([key]) => `${TASTES.find(taste => taste.key === key).name}几乎没留下`);
  const gap = timingGap(profile);

  if (metrics.bright > metrics.deep * 1.1) {
    dom.audioLine.textContent = `听觉上，咸的点敲了 ${metrics.saltPops} 下，最多时候有 ${metrics.layers} 层声音同时挂着；整体亮、收得快，是短促的一类。`;
  } else {
    dom.audioLine.textContent = `听觉上，咸的点敲了 ${metrics.saltPops} 下，最多时候有 ${metrics.layers} 层声音同时挂着；低音厚、拖着尾巴，是持续的一类。`;
  }
  dom.tasteLine.textContent = top.length
    ? `尝到时最重的是${top.map(([key, value]) => labelFor(key, value)).join('和')}${quiet.length ? `，${quiet.join('、')}` : ''}。`
    : '这一段几乎什么都没留下。';
  dom.gapLine.textContent = gap
    ? `听觉的高点在 ${formatTime(gap.listeningAt)} 附近，味觉的高点落在全段的 ${Math.round(gap.tastingRatio * 100)}% 处：这两处并不在同一个位置，舌头留下的是整段的总和，而耳朵记得的是顺序。`
    : '这一步没有明显的听觉落点，整段都比较平。';

  dom.paletteGap.textContent = '“麻”暂时没有合适的对应：它更像一段持续的震颤，不像一种味道。这也是这套记谱里我故意留着的空位。';
}

function highlight() {
  const time = state.playing || state.revealed ? state.cursor : -1;
  const ordered = [...profile.annotations].sort((a, b) => a.from - b.from);
  let active = null;
  ordered.forEach((annotation, index) => {
    const item = dom.steps.children[index];
    if (!item) return;
    const inside = time >= annotation.from && time <= annotation.to;
    item.dataset.active = String(inside);
    item.dataset.past = String(state.playing && time > annotation.to);
    if (inside) active = annotation;
  });
  return active;
}

function setStatus(text) {
  if (dom.status.textContent === text) return;
  dom.status.textContent = text;
}

function layout() {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

function xFor(time) { return (time / profile.total) * canvas.clientWidth; }

function draw() {
  if (!profile) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const filled = state.revealed;
  context.clearRect(0, 0, width, height);

  /* 横向线条，便于读出强度 */
  context.strokeStyle = '#e2e6e0';
  context.lineWidth = 1;
  for (let row = 0; row <= 4; row += 1) {
    const y = 14 + (row / 4) * (height - 40);
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  /* 每一步的起步线 */
  context.strokeStyle = '#d0d6cf';
  for (const annotation of profile.annotations) {
    const x = xFor(annotation.from);
    context.beginPath();
    context.moveTo(x, 8);
    context.lineTo(x, height - 24);
    context.stroke();
  }

  const played = state.cursor;
  /* 揭晓后画完整段；播放中画到光标；停下时留一小段刚听过的尾巴 */
  const trace = filled ? profile.total : Math.min(profile.total, played + 1.2);

  for (const taste of TASTES) {
    const curve = profile.curves[taste.key];
    context.beginPath();
    let started = false;
    for (let index = 0; index < profile.times.length; index += 1) {
      const time = profile.times[index];
      if (time > trace) break;
      const x = xFor(time);
      const y = height - 24 - curve[index] * (height - 40);
      if (!started) { context.moveTo(x, y); started = true; } else context.lineTo(x, y);
    }
    if (!started) continue;
    context.strokeStyle = filled ? taste.color : 'rgba(29,36,33,0.42)';
    context.lineWidth = filled ? 1.6 : 1.1;
    context.lineJoin = 'round';
    context.stroke();
    if (!filled) continue;
    context.lineTo(xFor(Math.min(trace, profile.total)), height - 24);
    context.lineTo(0, height - 24);
    context.closePath();
    context.fillStyle = taste.color;
    context.globalAlpha = 0.2;
    context.fill();
    context.globalAlpha = 1;
  }

  /* 每一锅的"响"点：最亮的一瞬 */
  if (!filled) {
    for (const burst of bursts) {
      const x = xFor(burst.from);
      const w = Math.max(2, xFor(burst.to) - x);
      const size = 2.6 + burst.peak * 4.4;
      context.fillStyle = `rgba(179,84,30,${0.16 + burst.peak * 0.3})`;
      context.fillRect(x, height - 18, w, size);
    }
  }

  if (state.cursor > 0 || state.playing) {
    const x = xFor(Math.min(state.cursor, profile.total));
    context.strokeStyle = '#b3541e';
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(x, 6);
    context.lineTo(x, height - 18);
    context.stroke();
    context.fillStyle = '#b3541e';
    context.beginPath();
    context.arc(x, 8, 3.2, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = '#5d6663';
  context.font = '11px "Microsoft YaHei", sans-serif';
  context.textBaseline = 'top';
  context.fillText('强', 2, 8);
  context.textBaseline = 'alphabetic';
}

function setPlaying(playing) {
  state.playing = playing;
  dom.play.setAttribute('aria-pressed', String(playing));
  dom.playLabel.textContent = playing ? '正在按谱听' : '听一听这道菜';
  dom.stop.disabled = !playing;
}

function play() {
  if (state.playing) { stop(); return; }
  state.cursor = 0;
  if (!audio.unlock()) {
    setStatus('这个浏览器没有可用的音频输出，曲线和文字仍然可用。');
    return;
  }
  const started = audio.play(profile, {
    speed: state.speed,
    onTick(time) {
      state.cursor = time;
      const active = highlight();
      if (active) setStatus(`${active.action}${active.note ? `：${active.note}` : ''}`);
      draw();
    },
    onEnd() {
      setPlaying(false);
      state.cursor = profile.total;
      highlight();
      draw();
      setStatus('这一段听完了。现在可以猜你尝到了什么，或者换一种做法再听一遍。');
    }
  });
  if (!started) return;
  setPlaying(true);
  setStatus('正在按谱播放。留意哪一处最响，以及它出现在什么时候。');
}

function stop() {
  audio.stop();
  setPlaying(false);
  state.cursor = 0;
  highlight();
  draw();
}

function reveal() {
  state.revealed = true;
  save();
  renderStatic();
  draw();
  setStatus('曲线被填满的部分，是整段烹饪累积下来、留在舌头上的那一份。');
}

function hide() {
  state.revealed = false;
  save();
  renderStatic();
  draw();
  setStatus('味觉曲线已经藏起来，可以再听一遍。');
}

function changeTechnique(id) {
  state.techniqueId = id;
  save();
  stop();
  build();
  renderStatic();
  draw();
  setStatus(`换成${TECHNIQUES.find(item => item.id === id).name}，整份记谱重算了一遍。`);
}

function changeDish(step) {
  state.dishIndex = (state.dishIndex + step + RECIPES.length) % RECIPES.length;
  state.revealed = false;
  save();
  stop();
  build();
  renderStatic();
  draw();
  setStatus(`${recipe().name}：先听一遍，再猜你尝到了什么。`);
}

function buildControls() {
  for (const technique of TECHNIQUES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.technique = technique.id;
    button.setAttribute('aria-pressed', String(technique.id === state.techniqueId));
    button.textContent = technique.name;
    button.addEventListener('click', () => {
      for (const other of dom.techniqueButtons.children) other.setAttribute('aria-pressed', String(other === button));
      changeTechnique(technique.id);
    });
    dom.techniqueButtons.append(button);
  }

  for (const taste of TASTES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.guess = taste.key;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = taste.name;
    button.addEventListener('click', () => {
      const already = button.getAttribute('aria-pressed') === 'true';
      for (const other of dom.guessOptions.children) other.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', String(!already));
      if (!already) setStatus(`记下你猜的${taste.name}。揭晓之后，可以看看它和曲线对不对得上。`);
    });
    dom.guessOptions.append(button);
  }

  for (const taste of TASTES) {
    const row = document.createElement('tr');
    const name = document.createElement('th');
    name.scope = 'row';
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = taste.color;
    name.append(swatch, taste.name);
    const sound = document.createElement('td');
    sound.textContent = taste.note;
    const why = document.createElement('td');
    why.textContent = taste.actual;
    row.append(name, sound, why);
    dom.paletteBody.append(row);
  }

  dom.play.addEventListener('click', play);
  dom.stop.addEventListener('click', stop);
  dom.reveal.addEventListener('click', reveal);
  dom.hidden.addEventListener('click', hide);
  dom.prev.addEventListener('click', () => changeDish(-1));
  dom.next.addEventListener('click', () => changeDish(1));
  dom.speed.addEventListener('input', () => {
    state.speed = Number(dom.speed.value);
    dom.speedValue.textContent = `${state.speed}×`;
    save();
    if (state.playing) { audio.stop(); setPlaying(false); play(); }
  });

  canvas.tabIndex = 0;
  canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    state.cursor = ratio * profile.total;
    if (!state.playing) audio.preview(profile, state.cursor);
    highlight();
    draw();
  });
  canvas.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      state.cursor = Math.min(profile.total, Math.max(0, state.cursor + (event.key === 'ArrowRight' ? 1 : -1) * profile.total * 0.04));
      highlight();
      draw();
    }
  });

  window.addEventListener('keydown', event => {
    if (event.key !== ' ' || event.target.closest('button, input, textarea, summary')) return;
    event.preventDefault();
    play();
  });
  window.addEventListener('resize', layout);
  window.addEventListener('pagehide', () => audio.stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.playing) stop(); });
}

build();
buildControls();
renderStatic();
layout();
setPlaying(false);
setStatus(`${recipe().name}：先按谱听一遍，再猜你尝到了什么。`);
