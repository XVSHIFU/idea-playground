/*
 * 在 Node 里用一个最小 DOM / Web Audio 桩真正 import 一次 app.js，
 * 目的是让选择器、初始化、渲染与交互回调全部实际执行一遍：
 *   node taste-score/tests/selfcheck.mjs
 * 它不检查视觉，只保证代码在任何浏览器运行前不会因为自己的错误而停住。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const problems = [];
const notes = [];

/* 页面里真实存在的 id 与元素，从 index.html 读出来，避免自造的假清单 */
const html = readFileSync(path.join(here, '../index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const labels = [...html.matchAll(/<span id="(play-label|speed-value|listen-status)"/g)].map(match => match[1]);

function element(tag = 'div', id = '') {
  const node = {
    tagName: tag.toUpperCase(),
    id,
    dataset: {},
    style: {},
    children: [],
    attributes: {},
    textContent: '',
    value: '',
    disabled: false,
    armed: null,
    innerArm: null,
    title: '',
    type: '',
    scope: '',
    tabIndex: 0,
    clientWidth: 640,
    clientHeight: 288,
    listeners: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === 'aria-pressed') this['aria-pressed'] = String(value);
      if (name === 'data-armed') this.dataset.armed = String(value);
      if (name === 'data-active') this.dataset.active = String(value);
      if (name === 'data-past') this.dataset.past = String(value);
    },
    getAttribute(name) {
      if (name === 'aria-pressed') return this['aria-pressed'] ?? null;
      return this.attributes[name] ?? null;
    },
    append(...nodes) {
      for (const node of nodes) {
        const child = typeof node === 'string' ? { textContent: node, children: [], dataset: {}, listeners: {}, setAttribute() {}, getAttribute: () => null, addEventListener() {}, append() {} } : node;
        this.children.push(child);
      }
      this.textContent = this.children.map(child => child.textContent ?? '').join('');
    },
    appendChild(node) { this.append(node); },
    replaceChildren(...nodes) { this.children.length = 0; this.append(...nodes); },
    addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); },
    removeEventListener() {},
    dispatch(type, event = {}) { for (const handler of this.listeners[type] || []) handler({ target: this, preventDefault() {}, ...event }); },
    closest() { return this; },
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; },
    focus() {},
    getContext() { return canvasContext; },
    /* button 的 setAttribute 之后，children 里可能有 span；用选择器访问只发生在 querySelector，不会是元素自身 */
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  Object.defineProperty(node, 'firstChild', { get() { return this.children[0] ?? null; } });
  return node;
}

const canvasContext = new Proxy({}, {
  get: (_, key) => {
    if (key === 'canvas') return undefined;
    return (...args) => { void args; };
  },
  set: () => true
});

const store = new Map();
for (const id of ids) store.set(id, element(id.includes('plot') ? 'canvas' : 'div', id));
/* 两个容器需要按真实结构装子元素 */
for (const id of ['technique-buttons', 'guess-options', 'steps', 'taste-bars', 'palette-body']) store.set(id, element('div', id));
store.get('plot').clientWidth = 640;
store.get('plot').clientHeight = 288;

  const body = element('body');
  const storage = new Map();
const documentStub = {
  body,
  hidden: false,
  querySelector(selector) {
    const match = /^#([\w-]+)$/.exec(selector);
    if (match) {
      if (!store.has(match[1])) problems.push(`app.js 取了一个页面里不存在的 id：#${match[1]}`);
      return store.get(match[1]) ?? null;
    }
    return element('div');
  },
  createElement: tag => element(tag),
  addEventListener() {},
  querySelectorAll: () => []
};

class FakeParam {
  constructor(value = 0) { this.value = value; }
  setValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
}
class FakeNode {
  constructor(context) { this.context = context; this.gain = new FakeParam(); this.frequency = new FakeParam(); this.Q = new FakeParam(); this.detune = new FakeParam(); this.threshold = new FakeParam(); this.knee = new FakeParam(); this.ratio = new FakeParam(); this.attack = new FakeParam(); this.release = new FakeParam(); this.buffer = null; this.type = 'sine'; this.listeners = {}; }
  connect(node) { this.connected = node; return node; }
  disconnect() {}
  start() {}
  stop() {}
  addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
}

let contexts = 0;
class FakeAudioContext {
  constructor() { contexts += 1; this.currentTime = 0; this.sampleRate = 48000; this.state = 'running'; this.destination = new FakeNode(this); }
  createGain() { return new FakeNode(this); }
  createOscillator() { return new FakeNode(this); }
  createBiquadFilter() { return new FakeNode(this); }
  createDynamicsCompressor() { return new FakeNode(this); }
  createConvolver() { return new FakeNode(this); }
  createBufferSource() { return new FakeNode(this); }
  createBuffer(channels, length) { return { length, numberOfChannels: channels, getChannelData: () => new Float32Array(length) }; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  close() { return Promise.resolve(); }
}

globalThis.window = {
  devicePixelRatio: 1,
  AudioContext: FakeAudioContext,
  addEventListener(type, handler) { (this.listeners ??= {})[type] = handler; },
  listeners: {}
};
globalThis.document = documentStub;
globalThis.localStorage = {
  getItem: key => store.get(`ls:${key}`) ?? null,
  setItem: (key, value) => store.set(`ls:${key}`, value),
  removeItem: key => store.delete(`ls:${key}`)
};
globalThis.requestAnimationFrame = handler => { setTimeout(() => handler(performance.now()), 0); return 1; };
globalThis.cancelAnimationFrame = () => {};
globalThis.performance ??= { now: () => Date.now() };

const audio = await import('../audio.js');
const engine = await import('../engine.js');
await import('../app.js');

/* 初始化之后应该已经填好了控件 */
const techniques = store.get('technique-buttons').children;
const guesses = store.get('guess-options').children;
const steps = store.get('steps').children;
const bars = store.get('taste-bars').children;
const palette = store.get('palette-body').children;
if (techniques.length !== 4) problems.push(`做法按钮应有 4 个，实际 ${techniques.length}`);
if (guesses.length !== 8) problems.push(`猜测按钮应有 8 个，实际 ${guesses.length}`);
if (steps.length < 4) problems.push(`步骤项应有至少 4 个，实际 ${steps.length}`);
if (bars.length !== 8) problems.push(`留存横条应有 8 条，实际 ${bars.length}`);
if (palette.length !== 8) problems.push(`对应表应有 8 行，实际 ${palette.length}`);
if (!store.get('dish-name').textContent) problems.push('菜名没有被写入');
if (!store.get('fact-sound').textContent.includes('秒')) problems.push('听觉概要没有被写入');
if (!store.get('audio-line').textContent) problems.push('听觉文字没有被写入');
if (!store.get('gap-line').textContent) problems.push('错位文字没有被写入');
notes.push(`初始化：${techniques.length} 种做法 / ${steps.length} 步 / ${bars.length} 条留存 / ${palette.length} 行对应表`);
notes.push(`听觉行：${store.get('audio-line').textContent}`);
notes.push(`味觉行：${store.get('taste-line').textContent}`);
notes.push(`错位行：${store.get('gap-line').textContent}`);

/* 交互：播放、停下、揭晓、藏起来、换做法、换菜 */
function press(id) {
  const node = store.get(id);
  if (!node) { problems.push(`找不到控件 #${id}`); return; }
  node.dispatch('click');
}
try {
  press('play');
  if (!store.get('play').getAttribute('aria-pressed')) problems.push('点击播放后 aria-pressed 不是 true');
  await new Promise(resolve => setTimeout(resolve, 30));
  press('stop');
  if (store.get('play').getAttribute('aria-pressed') !== 'false') problems.push('停下后 aria-pressed 没有被复位');
  const armed = () => store.get('taste-bars').children.every(item => item.dataset.armed === 'true');
  press('reveal');
  if (!armed()) problems.push('揭晓后留存横条没有变成已揭晓状态');
  if (store.get('reveal').disabled !== true) problems.push('揭晓后"揭晓"按钮没有停用');
  press('hidden');
  if (armed()) problems.push('藏起来之后留存横条仍是已揭晓状态');
  press('dish-next');
  press('dish-next');
  press('dish-prev');
  const techniqueButtons = store.get('technique-buttons').children;
  const enabled = techniqueButtons.filter(button => !button.disabled);
  notes.push(`换菜后可用做法：${enabled.map(button => button.textContent).join('/')}`);
  for (const button of techniqueButtons) if (!button.disabled) button.dispatch('click');
  for (const button of store.get('guess-options').children) button.dispatch('click');
  notes.push(`换过做法与猜测按钮后，当前做法：${techniqueButtons.find(button => button.getAttribute('aria-pressed') === 'true')?.textContent}`);
  notes.push(`当前听觉行：${store.get('audio-line').textContent}`);
} catch (error) {
  problems.push(`交互过程抛出异常：${error.stack || error.message}`);
}

/* 音频层：自己合成一遍，确认不会抛错，并且真的调度了事件 */
try {
  let ticks = 0;
  const engineProfile = engine.buildProfile((await import('../recipes.js')).RECIPES[0], 'stir');
  const before = contexts;
  const player = audio.createAudio();
  const ok = player.play(engineProfile, { speed: 1, onTick() { ticks += 1; }, onEnd() {} });
  if (!ok) problems.push('音频播放返回 false');
  await new Promise(resolve => setTimeout(resolve, 40));
  player.stop();
  notes.push(`音频：这一层创建了 ${contexts - before} 个 AudioContext，播放回调触发 ${ticks} 次`);
  if (contexts - before !== 1) problems.push(`AudioContext 数量异常：${contexts - before}`);
  if (ticks < 1) problems.push('播放期间没有回调');
  const unlocked = player.unlock();
  if (!unlocked) problems.push('unlock() 返回 false');
} catch (error) {
  problems.push(`音频层抛出异常：${error.stack || error.message}`);
}

for (const note of notes) console.log(`· ${note}`);
if (problems.length) {
  console.log('\n发现问题：');
  for (const problem of problems) console.log(`✖ ${problem}`);
  process.exitCode = 1;
} else {
  console.log('\n自检通过：初始化、渲染与交互回调都执行完毕，没有抛出异常。');
}
