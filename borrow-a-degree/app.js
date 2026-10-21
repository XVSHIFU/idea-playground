/**
 * 《借一度》画面、输入、声音、存档与文案。
 *
 * 所有热量数字都来自 engine.js（纯逻辑）；这里只负责把它画出来、听起来、
 * 念给屏幕阅读器听，并把最好的一次记进 localStorage。
 */

import {
  CONFIG,
  TARGETS,
  BRAZIER,
  createGame,
  step,
  drainEvents,
  snapshot,
  clockText,
} from './engine.js';

/* ------------------------------------------------------------------ */
/* 小工具                                                              */
/* ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const FIXED_STEP = 1 / 60;
const MAX_LEDGER_ROWS = 12;
const WINDOW_NEED = (TARGETS.find(target => target.id === 'window') || { need: 95 }).need;

const clamp = (value, low, high) => (value < low ? low : value > high ? high : value);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - (1 - t) * (1 - t);

/** 确定性伪随机：只用于画面上的冰花与噪点，不影响模拟。 */
function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5; state >>>= 0;
    return state / 4294967296;
  };
}

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** 在两个十六进制颜色之间取中间值。 */
function mix(from, to, t) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const k = clamp(t, 0, 1);
  return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
}

function mmss(seconds) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** 画面用到的基础色。其余颜色在绘制时就地取，避免一张用不上的大表。 */
const PALETTE = {
  night: '#12161c',
  wood: '#3a2f29',
  woodLight: '#57443a',
  petal: '#b88288',
  petalWarm: '#e6a9a2',
};

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

const dom = {
  stage: document.getElementById('stage'),
  canvas: document.getElementById('scene'),
  hotspots: document.getElementById('hotspots'),
  hint: document.getElementById('handHint'),
  announce: document.getElementById('announce'),
  receipt: document.getElementById('receipt'),
  ledger: document.getElementById('ledger'),
  ledgerEmpty: document.getElementById('ledgerEmpty'),
  receiptClock: document.getElementById('receiptClock'),
  bodyValue: document.getElementById('bodyValue'),
  bodyMeter: document.getElementById('bodyMeter'),
  fuelValue: document.getElementById('fuelValue'),
  fuelMeter: document.getElementById('fuelMeter'),
  timeValue: document.getElementById('timeValue'),
  timeMeter: document.getElementById('timeMeter'),
  lossValue: document.getElementById('lossValue'),
  fuelNote: document.getElementById('fuelNote'),
  restart: document.getElementById('restart'),
  sound: document.getElementById('sound'),
  fold: document.getElementById('fold'),
  card: document.getElementById('card'),
  cardKicker: document.getElementById('cardKicker'),
  cardTitle: document.getElementById('cardTitle'),
  cardLine: document.getElementById('cardLine'),
  cardStars: document.getElementById('cardStars'),
  statBody: document.getElementById('statBody'),
  statFuel: document.getElementById('statFuel'),
  statTime: document.getElementById('statTime'),
  statScore: document.getElementById('statScore'),
  cardBest: document.getElementById('cardBest'),
  again: document.getElementById('again'),
};

const hotspotButtons = [...dom.hotspots.querySelectorAll('.hotspot')];
const ctx = dom.canvas.getContext('2d');

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reduceQuery.matches;
if (typeof reduceQuery.addEventListener === 'function') {
  reduceQuery.addEventListener('change', event => { reduced = event.matches; });
}

/* ------------------------------------------------------------------ */
/* 存档：键名一律带 borrow-a-degree: 前缀，绝不整库清空                  */
/* ------------------------------------------------------------------ */

const STORE_KEY = {
  best: 'borrow-a-degree:best',
  sound: 'borrow-a-degree:sound',
};

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* 无痕模式或配额不足：记不住就记不住，不影响这一夜。 */
  }
}

/* ------------------------------------------------------------------ */
/* 声音：全部用 Web Audio 现场合成，首次交互之后才解锁                    */
/* ------------------------------------------------------------------ */

const audio = {
  context: null,
  master: null,
  muted: readStored(STORE_KEY.sound, false) === true,

  unlock() {
    if (this.muted) return;
    try {
      if (!this.context) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        this.context = new Ctor();
        this.master = this.context.createGain();
        this.master.gain.value = 0.42;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    } catch (error) {
      this.context = null;
    }
  },

  /** 一个温柔的短音：正弦为主，带一点滑音与指数衰减。 */
  note(freq, { dur = 0.5, gain = 0.06, type = 'sine', slide = 0.985, delay = 0 } = {}) {
    if (this.muted || !this.context || !this.master) return;
    try {
      const now = this.context.currentTime + delay;
      const osc = this.context.createOscillator();
      const env = this.context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), now + dur * 0.85);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(gain, now + Math.min(0.08, dur * 0.25));
      env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(env);
      env.connect(this.master);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } catch (error) {
      /* 音画不同步、设备被占用都不该打断游戏。 */
    }
  },

  warm(id) {
    const base = { tea: 349.23, cat: 293.66, flower: 392, window: 261.63 }[id] || 330;
    this.note(base, { dur: 1.1, gain: 0.05 });
    this.note(base * 1.5, { dur: 1.4, gain: 0.032, delay: 0.09 });
  },

  borrow() {
    this.note(112, { dur: 0.7, gain: 0.04, type: 'triangle', slide: 1.06 });
  },

  blocked() {
    this.note(174, { dur: 0.34, gain: 0.028, type: 'sine', slide: 0.94 });
  },

  end(phase) {
    if (phase === 'won') {
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        this.note(freq, { dur: 1.8, gain: 0.045, delay: index * 0.16 });
      });
      return;
    }
    if (phase === 'asleep') {
      this.note(196, { dur: 2.6, gain: 0.05, slide: 0.99 });
      this.note(146.83, { dur: 3.2, gain: 0.032, delay: 0.28, slide: 0.985 });
      return;
    }
    this.note(329.63, { dur: 1.4, gain: 0.038, slide: 0.97 });
    this.note(261.63, { dur: 2, gain: 0.03, delay: 0.24, slide: 0.97 });
  },
};

function syncSoundButton() {
  dom.sound.textContent = audio.muted ? '音效 · 关' : '音效 · 开';
  dom.sound.setAttribute('aria-pressed', audio.muted ? 'false' : 'true');
}

/* ------------------------------------------------------------------ */
/* 场景布局：宽屏横向、窄屏纵向，两种排法都不裁切                        */
/* ------------------------------------------------------------------ */

function layoutScene(width, height) {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const wide = w / h >= 0.95 && w >= 560;

  if (wide) {
    const u = clamp(Math.min(w / 1000, h / 700), 0.58, 1.75);
    const floorY = h * 0.87;
    const radius = 78 * u;
    const tableY = h * 0.655;
    return {
      wide, u, w, h, floorY,
      brazier: { x: w * 0.155, y: floorY - radius * 0.62, r: radius, hit: Math.max(radius * 1.15, 38) },
      table: { x: w * 0.29, y: tableY, w: w * 0.46, h: Math.max(10, 14 * u) },
      tea: { x: w * 0.352, y: tableY - 40 * u, hit: Math.max(42 * u, 38) },
      cat: { x: w * 0.512, y: tableY - 30 * u, hit: Math.max(52 * u, 42) },
      flower: { x: w * 0.664, y: tableY - 46 * u, hit: Math.max(42 * u, 38) },
      window: {
        x: w * 0.866,
        y: h * 0.335,
        hw: Math.min(100 * u, w * 0.13),
        hh: Math.min(124 * u, h * 0.3),
        hit: Math.max(96 * u, 44),
      },
    };
  }

  const u = clamp(Math.min(w / 460, h / 780), 0.55, 1.45);
  const floorY = h * 0.95;
  const radius = 76 * u;
  const tableY = h * 0.56;
  return {
    wide, u, w, h, floorY,
    brazier: { x: w * 0.27, y: floorY - radius * 0.62, r: radius, hit: Math.max(radius * 1.15, 40) },
    table: { x: w * 0.05, y: tableY, w: w * 0.9, h: Math.max(9, 12 * u) },
    tea: { x: w * 0.205, y: tableY - 38 * u, hit: Math.max(42 * u, 36) },
    cat: { x: w * 0.5, y: tableY - 28 * u, hit: Math.max(50 * u, 40) },
    flower: { x: w * 0.795, y: tableY - 44 * u, hit: Math.max(42 * u, 36) },
    window: {
      x: w * 0.63,
      y: h * 0.175,
      hw: Math.min(94 * u, w * 0.29),
      hh: Math.min(108 * u, h * 0.19),
      hit: Math.max(88 * u, 44),
    },
  };
}

let scene = layoutScene(800, 600);
let lastStageSize = '';

function resize() {
  const rect = dom.stage.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);
  const signature = `${width}x${height}@${dpr}`;
  if (signature === lastStageSize) return;
  lastStageSize = signature;
  dom.canvas.width = Math.round(width * dpr);
  dom.canvas.height = Math.round(height * dpr);
  dom.canvas.style.width = `${width}px`;
  dom.canvas.style.height = `${height}px`;
  scene = layoutScene(width, height);
  scene.dpr = dpr;
  placeHotspots();
  if (fx.handX === null) {
    // 还没动过手：让手掌先停在火盆边上亮着。
    fx.handX = scene.brazier.x + scene.brazier.r * 0.9;
    fx.handY = scene.brazier.y - scene.brazier.r * 0.7;
  }
  // 改尺寸会把画布清空一次；如果正好赶上页面隐藏（rAF 停摆）或首帧之前，
  // 没有下一帧来重画，画面就会空着。所以这里立刻补画一帧。
  render(0);
}

function placeHotspots() {
  for (const button of hotspotButtons) {
    const spot = scene[button.dataset.target];
    if (!spot) continue;
    const size = Math.max(44, spot.hit * 2);
    button.style.left = `${spot.x - size / 2}px`;
    button.style.top = `${spot.y - size / 2}px`;
    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
  }
}

/* ------------------------------------------------------------------ */
/* 运行时状态                                                          */
/* ------------------------------------------------------------------ */

let game = createGame(Math.floor(Math.random() * 4294967295));
let clock = 0;
let simAccumulator = 0;
let lastFrame = 0;
let lastHudAt = 0;

let pointerHold = null;
let keyHold = null;
let hoverId = null;
let focusedId = null;

const fx = {
  handX: null,
  handY: null,
  pressing: false,
  glow: { tea: 0, cat: 0, flower: 0, window: 0 },
  fade: 0,
  dawn: 0,
  lastBodyAnnounce: 0,
  lowFuelTold: false,
  dawnTold: false,
};

/* 冰花与噪点：一次生成，之后只做显隐。 */
const frostRandom = makeRandom(20261020);
const frost = Array.from({ length: 44 }, () => ({
  x: frostRandom(),
  y: frostRandom(),
  angle: frostRandom() * TAU,
  size: 0.3 + frostRandom() * 0.9,
}));

const noiseRandom = makeRandom(1998);

function makeNoiseTile() {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tileCtx = tile.getContext('2d');
  const image = tileCtx.createImageData(128, 128);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 190 + Math.floor(noiseRandom() * 65);
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = Math.floor(noiseRandom() * 30);
  }
  tileCtx.putImageData(image, 0, 0);
  return tile;
}

/** 纸纹画在 DOM 层：一张贴图，交给合成层重复，不占 canvas 的每帧预算。 */
function installGrain() {
  try {
    const url = makeNoiseTile().toDataURL('image/png');
    document.getElementById('grain').style.backgroundImage = `url(${url})`;
  } catch (error) {
    /* 取不到贴图就安静地少一层质感。 */
  }
}

/* 渐变按尺寸缓存，避免每帧重新构造。 */
const gradientCache = { key: '', backdrop: null, floor: null, pool: null, vignette: null };

function ensureGradients(s) {
  const key = `${Math.round(s.w)}x${Math.round(s.h)}`;
  if (gradientCache.key === key) return gradientCache;
  gradientCache.key = key;

  const sky = ctx.createLinearGradient(0, 0, 0, s.h);
  sky.addColorStop(0, '#080b0f');
  sky.addColorStop(0.45, PALETTE.night);
  sky.addColorStop(1, '#191f27');
  gradientCache.backdrop = sky;

  const floor = ctx.createLinearGradient(0, s.floorY, 0, s.h);
  floor.addColorStop(0, '#262d35');
  floor.addColorStop(0.3, '#1b2128');
  floor.addColorStop(1, '#0d1116');
  gradientCache.floor = floor;

  const pool = ctx.createRadialGradient(
    s.brazier.x, s.floorY + 2, 4,
    s.brazier.x, s.floorY + 2, s.brazier.r * 5.2,
  );
  pool.addColorStop(0, 'rgba(255,150,84,.17)');
  pool.addColorStop(0.5, 'rgba(255,132,70,.06)');
  pool.addColorStop(1, 'rgba(255,132,70,0)');
  gradientCache.pool = pool;

  // 墙上被火烤出来的一块暖
  const warmX = s.brazier.x;
  const warmY = s.brazier.y - s.brazier.r * 1.7;
  const warm = ctx.createRadialGradient(warmX, warmY, 8, warmX, warmY, Math.max(s.w, s.h) * 0.8);
  warm.addColorStop(0, 'rgba(126,74,42,.32)');
  warm.addColorStop(0.4, 'rgba(86,52,32,.14)');
  warm.addColorStop(1, 'rgba(60,36,24,0)');
  gradientCache.warm = warm;

  const vignette = ctx.createRadialGradient(
    s.w / 2, s.h * 0.44, Math.min(s.w, s.h) * 0.22,
    s.w / 2, s.h * 0.52, Math.max(s.w, s.h) * 0.8,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,.66)');
  gradientCache.vignette = vignette;

  return gradientCache;
}

/* ------------------------------------------------------------------ */
/* 画面                                                                */
/* ------------------------------------------------------------------ */

function paintBackdrop(s) {
  const cache = ensureGradients(s);
  ctx.fillStyle = cache.backdrop;
  ctx.fillRect(0, 0, s.w, s.h);

  // 墙上被火烤出来的一块暖
  ctx.fillStyle = cache.warm;
  ctx.fillRect(0, 0, s.w, s.h);

  // 墙上的木板缝，很淡。
  ctx.strokeStyle = 'rgba(241,227,204,.04)';
  ctx.lineWidth = 1;
  for (let x = s.w * 0.04; x < s.w; x += 72 * s.u) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, s.floorY - 6 * s.u);
    ctx.stroke();
  }

  // 地板
  ctx.fillStyle = cache.floor;
  ctx.fillRect(0, s.floorY, s.w, s.h - s.floorY);

  // 火在地上的一滩光
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = cache.pool;
  ctx.fillRect(0, s.floorY - 4, s.w, s.h - s.floorY + 4);
  ctx.restore();

  // 踢脚线与地板的透视线
  ctx.strokeStyle = 'rgba(241,227,204,.11)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, s.floorY);
  ctx.lineTo(s.w, s.floorY);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(241,227,204,.05)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo((s.w * i) / 6, s.h);
    ctx.lineTo(s.w * 0.5 + ((s.w * i) / 6) * 0.24, s.floorY);
    ctx.stroke();
  }
}

function paintFireGlow(s, snap) {
  const fuel = snap.fuelRatio;
  const flicker = reduced ? 1 : 0.9 + 0.1 * Math.sin(clock * 7.1) * Math.sin(clock * 2.3 + 1.1);
  const radius = (200 + 260 * fuel) * s.u * flicker;
  const cx = s.brazier.x;
  const cy = s.brazier.y - s.brazier.r * 0.3;
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
  glow.addColorStop(0, `rgba(255,178,110,${0.3 * fuel + 0.08})`);
  glow.addColorStop(0.32, `rgba(255,132,66,${0.15 * fuel + 0.04})`);
  glow.addColorStop(1, 'rgba(255,132,66,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function paintWindowLight(s, progress) {
  if (progress <= 0.02) return;
  const { x, y, hw, hh } = s.window;
  const glow = ctx.createRadialGradient(x, y, 8, x, y, Math.max(hw, hh) * 2.4);
  glow.addColorStop(0, `rgba(140,182,206,${0.16 * progress})`);
  glow.addColorStop(1, 'rgba(140,182,206,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(hw, hh) * 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawBrazier(s, snap) {
  const { x, y, r } = s.brazier;
  const fuel = snap.fuelRatio;
  const flicker = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(clock * 8.3);
  const holding = snap.hold === BRAZIER;

  // 三脚架
  ctx.strokeStyle = 'rgba(241,227,204,.18)';
  ctx.lineWidth = 2.4;
  for (const direction of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + direction * r * 0.34, y + r * 0.5);
    ctx.lineTo(x + direction * r * 0.62, y + r * 1.02);
    ctx.stroke();
  }

  // 盆身
  const bowl = ctx.createLinearGradient(x, y, x, y + r);
  bowl.addColorStop(0, '#2c241f');
  bowl.addColorStop(0.55, '#231c18');
  bowl.addColorStop(1, '#171310');
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.bezierCurveTo(x - r * 0.96, y + r * 0.5, x - r * 0.52, y + r * 0.78, x, y + r * 0.79);
  ctx.bezierCurveTo(x + r * 0.52, y + r * 0.78, x + r * 0.96, y + r * 0.5, x + r, y);
  ctx.closePath();
  ctx.fillStyle = bowl;
  ctx.fill();
  ctx.strokeStyle = 'rgba(241,227,204,.2)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // 盆沿
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.27, 0, 0, TAU);
  ctx.fillStyle = '#2a211c';
  ctx.fill();
  ctx.strokeStyle = `rgba(255,168,102,${0.24 + 0.4 * fuel})`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 余烬
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * TAU + 0.6;
    const ex = x + Math.cos(angle) * r * 0.58;
    const ey = y + Math.sin(angle) * r * 0.15;
    const pulse = reduced ? 0.7 : 0.5 + 0.5 * Math.sin(clock * (2.4 + i * 0.7) + i);
    const alpha = clamp((0.18 + 0.62 * fuel) * pulse, 0, 1);
    const ember = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 0.16);
    ember.addColorStop(0, `rgba(255,214,160,${alpha})`);
    ember.addColorStop(0.5, `rgba(226,112,58,${alpha * 0.7})`);
    ember.addColorStop(1, 'rgba(226,112,58,0)');
    ctx.fillStyle = ember;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.16, 0, TAU);
    ctx.fill();
  }

  // 火苗：柴越少越矮
  const tongueScale = [0.74, 1, 0.82];
  const tongueWidth = [0.24, 0.3, 0.22];
  const tongues = fuel > 0.001 ? 3 : 0;
  for (let i = 0; i < tongues; i++) {
    const sway = reduced ? 0 : Math.sin(clock * (4.4 + i * 1.3) + i * 2.1) * r * 0.1;
    const flickerScale = reduced ? 1 : 0.84 + 0.16 * Math.sin(clock * 5.1 + i * 1.7);
    const height = r * (0.5 + 0.95 * fuel) * tongueScale[i] * flickerScale;
    const baseX = x + (i - 1) * r * 0.27;
    const width = r * tongueWidth[i];
    const flame = ctx.createLinearGradient(0, y - height, 0, y + r * 0.1);
    flame.addColorStop(0, `rgba(255,236,196,${0.12 + 0.55 * fuel})`);
    flame.addColorStop(0.45, `rgba(255,168,96,${0.22 + 0.5 * fuel})`);
    flame.addColorStop(1, 'rgba(255,110,50,0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(baseX - width, y + r * 0.06);
    ctx.bezierCurveTo(baseX - width * 0.86, y - height * 0.42, baseX - width * 0.22 + sway, y - height * 0.68, baseX + sway * 1.3, y - height);
    ctx.bezierCurveTo(baseX + width * 0.46 + sway, y - height * 0.6, baseX + width * 1.02, y - height * 0.32, baseX + width, y + r * 0.06);
    ctx.closePath();
    ctx.fill();
  }
  if (tongues > 0) {
    const core = ctx.createRadialGradient(x, y - r * 0.06, 1, x, y - r * 0.06, r * 0.55);
    core.addColorStop(0, `rgba(255,240,206,${0.24 + 0.36 * fuel})`);
    core.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.04, r * 0.5, r * 0.34, 0, 0, TAU);
    ctx.fill();
  }

  if (holding) {
    const breathe = reduced ? 1 : 0.86 + 0.14 * Math.sin(clock * 3.4);
    const ring = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.1 * breathe);
    ring.addColorStop(0, 'rgba(255,190,130,.16)');
    ring.addColorStop(1, 'rgba(255,190,130,0)');
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.1 * breathe, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // 明灭的小火星
  if (!reduced && fuel > 0.15) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const phase = (clock * (0.34 + i * 0.07) + i * 0.23) % 1;
      const sparkY = y - phase * r * 3.1;
      const sparkX = x + Math.sin(clock * 1.7 + i * 2.2) * r * 0.42;
      const alpha = (1 - phase) * 0.5 * fuel;
      ctx.fillStyle = `rgba(255,196,140,${alpha})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 1.5 * s.u, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawTable(s) {
  const { x, y, w, h } = s.table;
  const board = ctx.createLinearGradient(0, y, 0, y + h * 3);
  board.addColorStop(0, PALETTE.woodLight);
  board.addColorStop(0.3, PALETTE.wood);
  board.addColorStop(1, '#241c18');
  ctx.fillStyle = board;
  roundRectPath(ctx, x, y, w, h, 3 * s.u);
  ctx.fill();
  ctx.strokeStyle = 'rgba(241,227,204,.16)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 桌面被火照亮的一条边
  const light = ctx.createLinearGradient(x, 0, x + w * 0.5, 0);
  light.addColorStop(0, 'rgba(255,168,102,.34)');
  light.addColorStop(1, 'rgba(255,168,102,0)');
  ctx.fillStyle = light;
  ctx.fillRect(x, y, w * 0.5, Math.max(1.6, 2 * s.u));

  // 桌腿
  ctx.fillStyle = '#1e1713';
  ctx.fillRect(x + w * 0.08, y + h, 5 * s.u, s.floorY - y - h);
  ctx.fillRect(x + w * 0.88, y + h, 5 * s.u, s.floorY - y - h);
}

function drawWarmHalo(x, y, radius, strength) {
  if (strength <= 0.01) return;
  const halo = ctx.createRadialGradient(x, y, 0, x, y, radius);
  halo.addColorStop(0, `rgba(255,176,112,${0.2 * strength})`);
  halo.addColorStop(0.6, `rgba(255,150,88,${0.07 * strength})`);
  halo.addColorStop(1, 'rgba(255,150,88,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawTea(s, progress) {
  const { x, y } = s.tea;
  const u = s.u;
  const warm = progress;
  drawWarmHalo(x, y - 4 * u, 74 * u, warm);

  // 影子与碟
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 25 * u, 30 * u, 6 * u, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(241,227,204,${0.26 + 0.16 * warm})`;
  ctx.lineWidth = 1.4 * u;
  ctx.beginPath();
  ctx.ellipse(x, y + 21 * u, 28 * u, 7 * u, 0, 0, TAU);
  ctx.stroke();

  // 杯身
  const body = ctx.createLinearGradient(x - 20 * u, y - 16 * u, x + 20 * u, y + 18 * u);
  body.addColorStop(0, mix('#2c343d', '#7d4c33', warm));
  body.addColorStop(1, mix('#1d232a', '#553226', warm));
  ctx.beginPath();
  ctx.moveTo(x - 19 * u, y - 14 * u);
  ctx.lineTo(x + 19 * u, y - 14 * u);
  ctx.quadraticCurveTo(x + 17 * u, y + 14 * u, x + 11 * u, y + 18 * u);
  ctx.quadraticCurveTo(x, y + 21 * u, x - 11 * u, y + 18 * u);
  ctx.quadraticCurveTo(x - 17 * u, y + 14 * u, x - 19 * u, y - 14 * u);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = `rgba(241,227,204,${0.3 + 0.2 * warm})`;
  ctx.lineWidth = 1.5 * u;
  ctx.stroke();

  // 杯口与茶水
  ctx.beginPath();
  ctx.ellipse(x, y - 14 * u, 19 * u, 5.4 * u, 0, 0, TAU);
  ctx.fillStyle = mix('#242c34', '#7a4429', warm);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y - 14 * u, 15 * u, 4 * u, 0, 0, TAU);
  ctx.fillStyle = mix('#1b2229', '#a8613a', warm * 0.9);
  ctx.fill();

  // 把手
  ctx.beginPath();
  ctx.arc(x + 20 * u, y + 1 * u, 7 * u, -1.1, 1.4);
  ctx.strokeStyle = `rgba(241,227,204,${0.24 + 0.16 * warm})`;
  ctx.lineWidth = 1.6 * u;
  ctx.stroke();

  // 热气
  if (warm > 0.06) {
    const phase = reduced ? 0 : clock;
    ctx.save();
    ctx.strokeStyle = `rgba(241,227,204,${0.06 + 0.2 * warm})`;
    ctx.lineWidth = 1.3 * u;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      ctx.globalAlpha = 0.9 - i * 0.35;
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const along = k / 12;
        const sway = Math.sin(phase * 0.9 + along * 3.6 + i * 2.1) * (4 + 8 * along) * u;
        const sx = x + sway + (i === 0 ? -6 : 7) * u;
        const sy = y - 18 * u - along * (30 + 22 * warm) * u;
        if (k === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 暖好之后杯口的一圈光
  if (progress > 0.98) {
    ctx.strokeStyle = 'rgba(255,196,140,.5)';
    ctx.lineWidth = 1.4 * u;
    ctx.beginPath();
    ctx.ellipse(x, y - 14 * u, 20 * u, 6 * u, 0, 0, TAU);
    ctx.stroke();
  }
}

function drawCat(s, progress, snap) {
  const { x, y } = s.cat;
  const u = s.u;
  const warm = progress;
  const breathe = reduced ? 1 : 1 + Math.sin(clock * 1.5) * 0.02;
  const done = snap.targets.cat.done || progress > 0.98;
  drawWarmHalo(x, y, 96 * u, warm);

  ctx.fillStyle = 'rgba(0,0,0,.34)';
  ctx.beginPath();
  ctx.ellipse(x + 4 * u, y + 27 * u, 46 * u, 8 * u, 0, 0, TAU);
  ctx.fill();

  const fur = mix('#4c443d', '#7d5c46', warm);
  const furHead = mix('#584e45', '#8a6449', warm);
  const line = `rgba(241,227,204,${0.26 + 0.2 * warm})`;

  // 身体
  ctx.beginPath();
  ctx.ellipse(x + 5 * u, y + 8 * u, 41 * u, 23 * u * breathe, -0.06, 0, TAU);
  ctx.fillStyle = fur;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6 * u;
  ctx.stroke();

  // 背上的一道亮边
  ctx.beginPath();
  ctx.ellipse(x + 5 * u, y + 8 * u, 41 * u, 23 * u * breathe, -0.06, Math.PI * 1.12, Math.PI * 1.94);
  ctx.strokeStyle = `rgba(241,227,204,${0.14 + 0.14 * warm})`;
  ctx.lineWidth = 1.2 * u;
  ctx.stroke();

  // 头
  const headX = x - 24 * u;
  const headY = y - 6 * u + (reduced ? 0 : Math.sin(clock * 1.5) * 0.7 * u);
  ctx.beginPath();
  ctx.ellipse(headX, headY, 21 * u, 18 * u, 0.06, 0, TAU);
  ctx.fillStyle = furHead;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6 * u;
  ctx.stroke();

  // 耳朵
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + direction * 15 * u, headY - 9 * u);
    ctx.lineTo(headX + direction * 18 * u, headY - 25 * u);
    ctx.lineTo(headX + direction * 3 * u, headY - 15 * u);
    ctx.closePath();
    ctx.fillStyle = furHead;
    ctx.fill();
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.3 * u;
    ctx.stroke();
    if (warm > 0.4) {
      ctx.beginPath();
      ctx.moveTo(headX + direction * 13 * u, headY - 11 * u);
      ctx.lineTo(headX + direction * 15 * u, headY - 20 * u);
      ctx.lineTo(headX + direction * 7 * u, headY - 14 * u);
      ctx.closePath();
      ctx.fillStyle = `rgba(206,146,132,${0.35 * warm})`;
      ctx.fill();
    }
  }

  // 睡着的眼睛与鼻子
  ctx.strokeStyle = 'rgba(14,16,18,.75)';
  ctx.lineWidth = 1.5 * u;
  ctx.lineCap = 'round';
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(headX + direction * 6.5 * u, headY - 1 * u, 3.6 * u, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(212,150,128,.9)';
  ctx.beginPath();
  ctx.arc(headX, headY + 4.5 * u, 1.7 * u, 0, TAU);
  ctx.fill();

  // 胡须
  if (warm > 0.35) {
    ctx.strokeStyle = `rgba(241,227,204,${0.16 * warm})`;
    ctx.lineWidth = 0.9 * u;
    for (const direction of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(headX + direction * 10 * u, headY + (3 + i * 3) * u);
        ctx.lineTo(headX + direction * (25 + i * 3) * u, headY + (1 + i * 5) * u);
        ctx.stroke();
      }
    }
  }

  // 尾巴：暖好之后蜷得更紧
  const curl = done ? 1 : warm * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 40 * u, y + 12 * u);
  ctx.bezierCurveTo(
    x + 62 * u, y + 6 * u,
    x + 56 * u, y - 16 * u - 8 * u * curl,
    x + 30 * u, y - 12 * u - 10 * u * curl,
  );
  ctx.strokeStyle = mix('#3a3430', '#6b4f3d', warm);
  ctx.lineWidth = 7 * u;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = `rgba(241,227,204,${0.1 + 0.1 * warm})`;
  ctx.lineWidth = 1 * u;
  ctx.stroke();

  // 呼吸的一点微光
  if (warm > 0.2) {
    const pulse = reduced ? 0.85 : 0.6 + 0.4 * Math.sin(clock * 1.5);
    ctx.fillStyle = `rgba(255,178,116,${0.06 * warm * pulse})`;
    ctx.beginPath();
    ctx.ellipse(x + 5 * u, y + 8 * u, 46 * u, 27 * u, 0, 0, TAU);
    ctx.fill();
  }
}

function drawFlower(s, progress, snap) {
  const { x, y } = s.flower;
  const u = s.u;
  const warm = progress;
  const open = easeOut(clamp(warm, 0, 1));
  drawWarmHalo(x, y - 16 * u, 92 * u, warm);

  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + 27 * u, 26 * u, 5 * u, 0, 0, TAU);
  ctx.fill();

  // 花盆
  ctx.beginPath();
  ctx.moveTo(x - 22 * u, y + 4 * u);
  ctx.lineTo(x + 22 * u, y + 4 * u);
  ctx.lineTo(x + 16 * u, y + 27 * u);
  ctx.lineTo(x - 16 * u, y + 27 * u);
  ctx.closePath();
  const pot = ctx.createLinearGradient(x - 22 * u, 0, x + 22 * u, 0);
  pot.addColorStop(0, '#5b4238');
  pot.addColorStop(0.45, '#3d2c26');
  pot.addColorStop(1, '#251a17');
  ctx.fillStyle = pot;
  ctx.fill();
  ctx.strokeStyle = 'rgba(241,227,204,.26)';
  ctx.lineWidth = 1.5 * u;
  ctx.stroke();
  // 盆沿
  ctx.beginPath();
  ctx.ellipse(x, y + 4 * u, 22 * u, 4.6 * u, 0, 0, TAU);
  ctx.fillStyle = '#4a342c';
  ctx.fill();
  ctx.strokeStyle = 'rgba(241,227,204,.3)';
  ctx.lineWidth = 1.2 * u;
  ctx.stroke();

  // 茎
  const lean = Math.sin(reduced ? 0 : clock * 0.6) * 1.8 * u;
  ctx.beginPath();
  ctx.moveTo(x, y + 4 * u);
  ctx.bezierCurveTo(x - 4 * u, y - 12 * u, x + lean, y - 26 * u, x + lean, y - 36 * u);
  ctx.strokeStyle = mix('#33473a', '#4e6f52', warm);
  ctx.lineWidth = 2.6 * u;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 叶
  for (const direction of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      x + direction * 9 * u, y - 12 * u + direction * 2 * u,
      10 * u, 4 * u, direction * 0.62, 0, TAU,
    );
    ctx.fillStyle = mix('#30453a', '#53784f', warm);
    ctx.fill();
    ctx.strokeStyle = 'rgba(241,227,204,.14)';
    ctx.lineWidth = 0.9 * u;
    ctx.stroke();
  }

  // 花：越暖张得越开
  const petalCount = 5;
  const bloomX = x + lean;
  const bloomY = y - 37 * u;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * TAU - Math.PI / 2 + open * 0.2;
    const spread = lerp(1.4 * u, 12 * u, open);
    const px = bloomX + Math.cos(angle) * spread;
    const py = bloomY + Math.sin(angle) * spread;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, lerp(4.2, 6.4, open) * u, lerp(6.4, 9 * u, open) * u, 0, 0, TAU);
    ctx.fillStyle = mix(PALETTE.petal, PALETTE.petalWarm, warm * 0.95);
    ctx.globalAlpha = 0.62 + 0.34 * open;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(241,227,204,${0.18 + 0.22 * warm})`;
    ctx.lineWidth = 1 * u;
    ctx.stroke();
    ctx.restore();
  }

  // 花心
  ctx.beginPath();
  ctx.arc(bloomX, bloomY, 3.6 * u, 0, TAU);
  ctx.fillStyle = mix('#7d6a4a', '#f0c983', warm);
  ctx.fill();

  if (snap.targets.flower.done) {
    ctx.strokeStyle = 'rgba(255,196,140,.3)';
    ctx.lineWidth = 1.3 * u;
    ctx.beginPath();
    ctx.arc(bloomX, bloomY, 18 * u, 0, TAU);
    ctx.stroke();
  }
}

function drawWindow(s, progress, snap) {
  const { x, y, hw, hh } = s.window;
  const u = s.u;
  const left = x - hw;
  const top = y - hh;
  const width = hw * 2;
  const height = hh * 2;
  const melt = clamp(progress, 0, 1);
  const done = snap.targets.window.done;

  ctx.save();
  roundRectPath(ctx, left, top, width, height, 8 * u);
  ctx.clip();

  // 窗外
  const sky = ctx.createLinearGradient(0, top, 0, top + height);
  sky.addColorStop(0, mix('#0a1019', '#22303e', melt * 0.9));
  sky.addColorStop(0.55, mix('#111a24', '#3d4b56', melt * 0.8));
  sky.addColorStop(1, mix('#161f28', '#7a5a44', melt));
  ctx.fillStyle = sky;
  ctx.fillRect(left, top, width, height);

  // 远处的雪坡与树影
  ctx.fillStyle = `rgba(190,214,228,${0.05 + 0.1 * melt})`;
  ctx.beginPath();
  ctx.moveTo(left, top + height * 0.78);
  ctx.quadraticCurveTo(left + width * 0.3, top + height * 0.66, left + width * 0.62, top + height * 0.76);
  ctx.quadraticCurveTo(left + width * 0.85, top + height * 0.82, left + width, top + height * 0.74);
  ctx.lineTo(left + width, top + height);
  ctx.lineTo(left, top + height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(14,20,26,${0.5 - 0.3 * melt})`;
  ctx.lineWidth = 2.2 * u;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const tx = left + width * (0.16 + i * 0.23);
    const ty = top + height * (0.7 + (i % 2) * 0.05);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, ty - height * (0.1 + (i % 3) * 0.04));
    ctx.stroke();
  }

  // 冰花：化开一点就少一点
  const remaining = 1 - melt;
  if (remaining > 0.02) {
    const wash = ctx.createRadialGradient(
      x, y, Math.min(hw, hh) * 0.18,
      x, y, Math.max(hw, hh) * 1.08,
    );
    wash.addColorStop(0, `rgba(198,219,231,${0.015 * remaining})`);
    wash.addColorStop(1, `rgba(198,219,231,${0.2 * remaining})`);
    ctx.fillStyle = wash;
    ctx.fillRect(left, top, width, height);
  }

  const visible = Math.round(frost.length * remaining);
  ctx.strokeStyle = `rgba(206,226,238,${0.2 + 0.5 * remaining})`;
  ctx.lineWidth = 1.05 * u;
  ctx.beginPath();
  for (let i = 0; i < visible; i++) {
    const item = frost[i];
    const px = left + item.x * width;
    const py = top + item.y * height;
    const radius = (6 + item.size * 15) * u;
    const cos = Math.cos(item.angle);
    const sin = Math.sin(item.angle);
    // 一根主枝
    ctx.moveTo(px, py);
    ctx.lineTo(px + cos * radius, py + sin * radius);
    // 三对小枝，像霜结出来的蕨叶
    for (let k = 1; k <= 3; k++) {
      const along = k / 4;
      const bx = px + cos * radius * along;
      const by = py + sin * radius * along;
      const twig = radius * (0.42 - k * 0.07);
      for (const side of [-1, 1]) {
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + Math.cos(item.angle + side * 0.85) * twig,
          by + Math.sin(item.angle + side * 0.85) * twig,
        );
      }
    }
  }
  ctx.stroke();

  // 融化的水线
  if (melt > 0.08) {
    ctx.strokeStyle = `rgba(206,228,240,${0.16 + 0.24 * melt})`;
    ctx.lineWidth = 1.3 * u;
    for (let i = 0; i < 5; i++) {
      const startX = left + width * (0.18 + i * 0.17);
      const length = height * melt * (0.35 + 0.16 * ((i * 7) % 4));
      ctx.beginPath();
      ctx.moveTo(startX, top + height * 0.12);
      for (let k = 1; k <= 6; k++) {
        const along = k / 6;
        ctx.lineTo(startX + Math.sin(along * 5 + i) * 2.2 * u, top + height * 0.12 + length * along);
      }
      ctx.stroke();
    }
  }

  // 天亮的颜色
  if (melt > 0.55) {
    const dawn = (melt - 0.55) / 0.45;
    const glow = ctx.createRadialGradient(x, top + height * 0.72, 4, x, top + height * 0.72, width * 0.9);
    glow.addColorStop(0, `rgba(255,206,158,${0.34 * dawn})`);
    glow.addColorStop(1, 'rgba(255,206,158,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(left, top, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();

  // 窗框
  ctx.strokeStyle = `rgba(120,96,78,${0.85})`;
  ctx.lineWidth = Math.max(4, 8 * u);
  roundRectPath(ctx, left, top, width, height, 8 * u);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(241,227,204,.16)';
  ctx.lineWidth = 1.4 * u;
  roundRectPath(ctx, left, top, width, height, 8 * u);
  ctx.stroke();

  // 窗棂
  ctx.strokeStyle = 'rgba(96,74,60,.9)';
  ctx.lineWidth = Math.max(2.4, 4 * u);
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, top + height);
  ctx.moveTo(left, y);
  ctx.lineTo(left + width, y);
  ctx.stroke();

  // 窗台
  ctx.fillStyle = '#211a16';
  ctx.fillRect(left - 8 * u, top + height, width + 16 * u, Math.max(4, 7 * u));
  ctx.strokeStyle = 'rgba(241,227,204,.14)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(left - 8 * u, top + height, width + 16 * u, Math.max(4, 7 * u));

  if (done) {
    ctx.strokeStyle = 'rgba(255,214,170,.34)';
    ctx.lineWidth = 2 * u;
    roundRectPath(ctx, left - 6 * u, top - 6 * u, width + 12 * u, height + 12 * u, 10 * u);
    ctx.stroke();
  }
}

function drawLabels(s, snap) {
  const u = s.u;
  const size = clamp(14 * Math.min(1.3, 1 / Math.max(u, 0.74)), 11, 16);
  ctx.save();
  ctx.font = `500 ${size}px ui-sans-serif, system-ui, "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(6, 8, 12, .85)';
  ctx.shadowBlur = 10 * u;
  const items = [
    { id: 'tea', x: s.tea.x, y: s.tea.y - 72 * u, name: '冷茶' },
    { id: 'cat', x: s.cat.x, y: s.cat.y - 48 * u, name: '猫' },
    { id: 'flower', x: s.flower.x, y: s.flower.y - 74 * u, name: '花' },
    { id: 'window', x: s.window.x, y: s.window.y + s.window.hh + 20 * u, name: '窗上的冰' },
  ];
  for (const item of items) {
    const target = snap.targets[item.id];
    ctx.fillStyle = target && target.done ? 'rgba(255,206,158,.92)' : 'rgba(241,227,204,.76)';
    ctx.fillText(item.name, item.x, item.y);
  }
  ctx.restore();
}

function drawHoldRing(snap) {
  const hold = snap.hold;
  if (!hold || hold === BRAZIER) return;
  const spot = scene[hold];
  if (!spot) return;
  const progress = clamp(snap.targets[hold].heat / snap.targets[hold].need, 0, 1);
  const radius = spot.hit * 0.92;
  ctx.save();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(255,196,140,.16)';
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, radius, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,180,112,.8)';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, radius, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
  ctx.stroke();
  ctx.restore();
}

function drawFocusRing() {
  const id = focusedId || (hoverId && !fx.pressing ? hoverId : null);
  if (!id) return;
  const spot = scene[id];
  if (!spot) return;
  ctx.save();
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = focusedId ? 'rgba(241,227,204,.6)' : 'rgba(241,227,204,.24)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, spot.hit * 1.06, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawHand(snap) {
  if (fx.handX === null) return;
  const heat = snap.bodyRatio;
  const overTarget = fx.pressing || hoverId !== null;
  let strength = clamp(0.24 + 0.62 * heat, 0.18, 0.92);
  if (!overTarget) strength *= 0.45;
  const x = fx.handX;
  const y = fx.handY;
  const u = s_u();
  const flicker = reduced ? 1 : 0.94 + 0.06 * Math.sin(clock * 3.2);
  const radius = (48 + (fx.pressing ? 10 : 0)) * u * flicker * (overTarget ? 1 : 0.8);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y, 1, x, y, radius * 2.15);
  glow.addColorStop(0, `rgba(255,224,186,${0.42 * strength})`);
  glow.addColorStop(0.38, `rgba(255,158,96,${0.18 * strength})`);
  glow.addColorStop(1, 'rgba(255,158,96,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.15, 0, TAU);
  ctx.fill();
  ctx.restore();

  // 手印：四根手指加一只掌心
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.36);
  ctx.strokeStyle = `rgba(255,228,198,${0.4 * strength})`;
  ctx.lineWidth = Math.max(1.2, 1.5 * u);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const fx0 = (-13 + i * 8.4) * u;
    const length = (i === 0 || i === 3 ? 12 : 16) * u;
    ctx.beginPath();
    ctx.moveTo(fx0, -5 * u);
    ctx.lineTo(fx0 + (i - 1.5) * 0.7 * u, -5 * u - length);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, 4 * u, 15 * u, 12.5 * u, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function s_u() {
  return clamp(scene.u, 0.55, 1.75);
}

function paintOverlay(s, dt) {
  ctx.fillStyle = ensureGradients(s).vignette;
  ctx.fillRect(0, 0, s.w, s.h);

  // 两种结局各自的光：睡着是慢慢暗下去，天亮是慢慢亮起来
  const targetFade = game.phase === 'asleep' ? 1 : 0;
  const targetDawn = game.phase === 'dawn' ? 1 : game.phase === 'won' ? 0.55 : 0;
  fx.fade += (targetFade - fx.fade) * Math.min(1, dt * 1.1);
  fx.dawn += (targetDawn - fx.dawn) * Math.min(1, dt * 1.6);
  if (fx.fade > 0.002) {
    ctx.fillStyle = `rgba(5,7,10,${0.84 * fx.fade})`;
    ctx.fillRect(0, 0, s.w, s.h);
  }
  if (fx.dawn > 0.002) {
    ctx.fillStyle = `rgba(132,170,192,${0.42 * fx.dawn})`;
    ctx.fillRect(0, 0, s.w, s.h);
  }
}

function render(dt) {
  const s = scene;
  ctx.setTransform(s.dpr || 1, 0, 0, s.dpr || 1, 0, 0);
  ctx.clearRect(0, 0, s.w, s.h);

  const snap = snapshot(game);

  paintBackdrop(s);
  paintFireGlow(s, snap);
  paintWindowLight(s, snap.targets.window.heat / WINDOW_NEED);

  // 每件东西的暖度做一个缓动，晕才不会跳。
  for (const spec of TARGETS) {
    const goal = clamp(snap.targets[spec.id].heat / spec.need, 0, 1);
    if (spec.id === 'window') continue;
    fx.glow[spec.id] += (goal - fx.glow[spec.id]) * Math.min(1, dt * 5);
  }
  const windowGoal = clamp(snap.targets.window.heat / WINDOW_NEED, 0, 1);
  fx.glow.window += (windowGoal - fx.glow.window) * Math.min(1, dt * 3.4);

  drawWindow(s, fx.glow.window, snap);
  drawBrazier(s, snap);
  drawTable(s);
  drawFlower(s, fx.glow.flower, snap);
  drawCat(s, fx.glow.cat, snap);
  drawTea(s, fx.glow.tea);
  drawLabels(s, snap);
  drawHoldRing(snap);
  drawFocusRing();
  drawHand(snap);
  paintOverlay(s, dt);
}

/* ------------------------------------------------------------------ */
/* 账本小票                                                            */
/* ------------------------------------------------------------------ */

/* 连续的同一笔账合并成一行：纯烤火会产生几十行一样的字，
   小票反而变噪音。合并后时间取区间，数字求和。 */
const ledgerGroups = [];

function sumField(group, key, entry) {
  const value = Number(entry[key]);
  if (Number.isFinite(value)) group[key] += value;
}

function ledgerTime(group) {
  const from = clockText(group.startClock);
  if (Math.round(group.endClock) <= Math.round(group.startClock)) return from;
  return `${from}–${clockText(group.endClock)}`;
}

function fillLedgerRow(row, group) {
  row.textContent = '';
  const time = document.createElement('span');
  time.className = 't';
  time.textContent = ledgerTime(group);
  row.append(time, ' ');

  if (group.kind === 'borrow') {
    row.append('向火盆借 ');
    const gain = document.createElement('b');
    gain.textContent = String(Math.max(1, Math.round(group.gain)));
    row.append(gain, ' 度 ');
    const sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = '／';
    row.append(sep, ` 柴 −${Math.max(1, Math.round(group.fuel))}`);
    return;
  }

  const spec = TARGETS.find(target => target.id === group.target);
  row.append(`给${spec ? spec.short : '它'} `);
  const net = document.createElement('b');
  net.textContent = String(Math.max(1, Math.round(group.net)));
  row.append(net, ' 度 ');
  const sep1 = document.createElement('span');
  sep1.className = 'sep';
  sep1.textContent = '／';
  const spend = document.createElement('b');
  spend.textContent = String(Math.max(1, Math.round(group.spend)));
  const sep2 = document.createElement('span');
  sep2.className = 'sep';
  sep2.textContent = '／';
  row.append(sep1, ' 你 −');
  row.append(spend, ' ');
  row.append(sep2, ` 路上散了 ${Math.round(group.waste)}`);
}

function appendLedger(entry) {
  const last = ledgerGroups[ledgerGroups.length - 1];
  const sameKind = last && last.kind === entry.kind &&
    (last.target || null) === (entry.target || null);

  if (sameKind) {
    last.endClock = entry.clock;
    for (const key of ['net', 'spend', 'waste', 'gain', 'fuel']) sumField(last, key, entry);
    fillLedgerRow(last.el, last);
  } else {
    const group = {
      kind: entry.kind,
      target: entry.target,
      startClock: entry.clock,
      endClock: entry.clock,
      net: 0, spend: 0, waste: 0, gain: 0, fuel: 0,
    };
    for (const key of ['net', 'spend', 'waste', 'gain', 'fuel']) sumField(group, key, entry);
    group.el = document.createElement('li');
    fillLedgerRow(group.el, group);
    ledgerGroups.push(group);
    dom.ledger.append(group.el);
  }

  while (ledgerGroups.length > MAX_LEDGER_ROWS) {
    const dropped = ledgerGroups.shift();
    if (dropped.el.parentNode) dropped.el.remove();
  }
  dom.ledgerEmpty.hidden = true;
  dom.ledger.scrollTop = dom.ledger.scrollHeight;
}

/* ------------------------------------------------------------------ */
/* 文案与结算                                                          */
/* ------------------------------------------------------------------ */

const ENDING_COPY = {
  won: {
    title: '窗化开了',
    line: '冰水顺着玻璃往下走，天亮进来了一点。',
    flavour: {
      3: '你没让自己空着走完这一夜。',
      2: '够暖了。再多留一度，会更从容。',
      1: '勉强够用，但这一夜算得漂亮。',
    },
  },
  asleep: {
    title: '你在椅子上睡着了',
    line: '体温降到 30 度。屋子还冷着，天也快亮了。',
    flavour: '睡着不算输，只是这一夜没能走完。',
  },
  dawn: {
    title: '天亮了，窗还封着',
    line: '夜用完了。冰花在晨光里白得发亮。',
    flavour: '下一次，把每一度花得再晚一点。',
  },
};

let cardOpen = false;
let cardTimer = 0;

function openCard() {
  const result = game.result;
  if (!result) return;
  const copy = ENDING_COPY[result.phase] || ENDING_COPY.dawn;

  dom.cardKicker.textContent = `夜里 ${clockText(result.clock)}`;
  dom.cardTitle.textContent = copy.title;
  dom.cardLine.textContent = result.phase === 'won'
    ? `${copy.line}\n${copy.flavour[result.stars] || copy.flavour[1]}`
    : `${copy.line}\n${copy.flavour}`;
  dom.statBody.textContent = `${result.bodyC.toFixed(1)} °C`;
  dom.statFuel.textContent = String(result.fuel);
  dom.statTime.textContent = mmss(result.seconds);
  dom.statScore.textContent = result.phase === 'won' ? String(result.score) : '—';

  const stars = ['★', '★', '★'];
  dom.cardStars.replaceChildren();
  for (let i = 0; i < 3; i++) {
    const filled = i < result.stars;
    const span = document.createElement(filled ? 'b' : 'span');
    span.textContent = filled ? stars[i] : '☆';
    span.style.fontWeight = filled ? '600' : '400';
    dom.cardStars.append(span);
  }
  dom.cardStars.setAttribute('aria-label', `评价 ${result.stars} 星，共 3 星`);

  const best = readStored(STORE_KEY.best, null);
  const bestScore = best && typeof best.score === 'number' ? best.score : 0;
  if (result.phase === 'won') {
    if (!best || result.score > bestScore) {
      writeStored(STORE_KEY.best, {
        score: result.score,
        stars: result.stars,
        seconds: result.seconds,
        bodyC: result.bodyC,
        at: Date.now(),
      });
      dom.cardBest.textContent = `这是最好的一次 · ${result.score}`;
    } else {
      dom.cardBest.textContent = `最好的一次 · ${bestScore}（${best.stars || 0} 星）`;
    }
  } else {
    dom.cardBest.textContent = bestScore > 0 ? `最好的一次 · ${bestScore}` : '还没有走完过一整夜。';
  }

  dom.card.hidden = false;
  cardOpen = true;
  dom.again.focus({ preventScroll: true });
}

function closeCard() {
  dom.card.hidden = true;
  cardOpen = false;
}

function announce(text) {
  if (!text) return;
  dom.announce.textContent = '';
  window.requestAnimationFrame(() => { dom.announce.textContent = text; });
}

function setHint(text) {
  if (dom.hint.textContent !== text) dom.hint.textContent = text;
}

const HINT_DEFAULT = '按住火盆回温，按住冷掉的东西传热。';
const HINT_LOCKED = '冰太厚了。先把茶、猫、花暖起来。';

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'ledger') {
      appendLedger(event.entry);
      continue;
    }
    if (event.type === 'complete') {
      const spec = TARGETS.find(target => target.id === event.target);
      const label = spec ? `${spec.name}${spec.verb}` : '暖好了';
      announce(label);
      setHint(label);
      audio.warm(event.target);
      continue;
    }
    if (event.type === 'blocked') {
      announce('冰太厚了。先把茶、猫、花暖起来。');
      setHint(HINT_LOCKED);
      audio.blocked();
      continue;
    }
    if (event.type === 'end') {
      audio.end(event.phase);
      announce(ENDING_COPY[event.phase] ? ENDING_COPY[event.phase].title : '这一夜结束了');
      // 先让画面自己说完：睡着要暗下去，天亮要亮起来，再落小票。
      const phase = event.phase;
      window.clearTimeout(cardTimer);
      cardTimer = window.setTimeout(() => {
        if (game.phase === phase) openCard();
      }, phase === 'won' ? 1500 : 1200);
    }
  }
}

/* ------------------------------------------------------------------ */
/* HUD 与无障碍标签                                                    */
/* ------------------------------------------------------------------ */

function updateHud() {
  const snap = snapshot(game);
  dom.bodyValue.textContent = snap.bodyC.toFixed(1);
  dom.bodyMeter.style.width = `${(snap.bodyRatio * 100).toFixed(1)}%`;
  dom.bodyMeter.dataset.low = snap.bodyC < 32.4 ? 'true' : 'false';
  dom.fuelValue.textContent = String(Math.round(snap.fuel));
  dom.fuelMeter.style.width = `${(snap.fuelRatio * 100).toFixed(1)}%`;
  dom.timeValue.textContent = mmss(snap.timeLeft);
  dom.timeMeter.style.width = `${((snap.timeLeft / CONFIG.nightSeconds) * 100).toFixed(1)}%`;
  dom.lossValue.textContent = `${Math.round(snap.loss * 100)}%`;
  dom.fuelNote.textContent = snap.bodyC < 31.4 ? '太冷了，回火盆' : snap.lowFuel ? '火小了' : '火还旺';
  dom.fuelNote.dataset.cold = snap.bodyC < 31.4 ? 'true' : 'false';
  dom.receiptClock.textContent = clockText(snap.clock);

  for (const button of hotspotButtons) {
    const id = button.dataset.target;
    if (id === BRAZIER) {
      button.setAttribute('aria-label', `火盆，柴 ${Math.round(snap.fuel)}${snap.lowFuel ? '，快烧完了' : ''}。按住回温`);
      continue;
    }
    const spec = TARGETS.find(target => target.id === id);
    const target = snap.targets[id];
    if (!spec) continue;
    if (target.done) {
      button.setAttribute('aria-label', `${spec.name}，${spec.verb}`);
    } else if (id === 'window' && snap.windowLocked) {
      button.setAttribute('aria-label', `${spec.name}，还封着，屋里暖起来才会化。暖了 ${Math.round(target.heat)}／${spec.need} 度`);
    } else {
      button.setAttribute('aria-label', `${spec.name}，暖了 ${Math.round(target.heat)}／${spec.need} 度。按住传热`);
    }
  }

  if (game.phase === 'playing') {
    if (snap.lowFuel && !fx.lowFuelTold) {
      fx.lowFuelTold = true;
      announce('柴快烧完了，火小了一半。');
    }
    if (snap.loss >= 0.4 && !fx.dawnTold) {
      fx.dawnTold = true;
      announce('夜里更冷了，路上会散得更多。');
    }
    const whole = Math.floor(snap.bodyC);
    if (clock - fx.lastBodyAnnounce > 8 && snap.bodyC < 33.5) {
      fx.lastBodyAnnounce = clock;
      announce(`你的体温 ${whole} 度。`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 输入                                                                */
/* ------------------------------------------------------------------ */

function hitTest(clientX, clientY) {
  const rect = dom.canvas.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  let best = null;
  let bestDistance = Infinity;
  for (const id of ['brazier', 'tea', 'cat', 'flower', 'window']) {
    const spot = scene[id];
    if (!spot) continue;
    const distance = Math.hypot(px - spot.x, py - spot.y);
    if (distance <= spot.hit && distance < bestDistance) {
      best = id;
      bestDistance = distance;
    }
  }
  return best;
}

function setHandFromEvent(event) {
  const rect = dom.canvas.getBoundingClientRect();
  fx.handX = clamp(event.clientX - rect.left, 0, rect.width);
  fx.handY = clamp(event.clientY - rect.top, 0, rect.height);
}

function currentHold() {
  return pointerHold || keyHold || null;
}

dom.canvas.addEventListener('pointerdown', event => {
  audio.unlock();
  setHandFromEvent(event);
  const id = hitTest(event.clientX, event.clientY);
  if (!id) return;
  event.preventDefault();
  dom.canvas.setPointerCapture?.(event.pointerId);
  pointerHold = id;
  fx.pressing = true;
  if (id === BRAZIER) audio.borrow();
  if (id === 'window' && snapshot(game).windowLocked) setHint(HINT_LOCKED);
});

dom.canvas.addEventListener('pointermove', event => {
  setHandFromEvent(event);
  const id = hitTest(event.clientX, event.clientY);
  hoverId = id;
  // 按着的时候拖到别的东西上，热量就改往那件东西去。
  if (pointerHold && id && id !== pointerHold) pointerHold = id;
  if (!id) return;
  const snap = snapshot(game);
  if (id === 'window' && snap.windowLocked) {
    setHint(HINT_LOCKED);
    return;
  }
  if (id === BRAZIER) {
    setHint('按住火盆，把热量借回来——只还八成。');
    return;
  }
  const spec = TARGETS.find(target => target.id === id);
  if (!spec) return;
  const target = snap.targets[id];
  setHint(target && target.done ? `${spec.name}${spec.verb}，不再散热。` : `按住${spec.name}，把热递过去。`);
}, { passive: true });

function releasePointer(event) {
  if (event && event.pointerId !== undefined && dom.canvas.hasPointerCapture?.(event.pointerId)) {
    dom.canvas.releasePointerCapture(event.pointerId);
  }
  pointerHold = null;
  fx.pressing = false;
}

dom.canvas.addEventListener('pointerup', releasePointer);
dom.canvas.addEventListener('pointercancel', releasePointer);
dom.canvas.addEventListener('lostpointercapture', releasePointer);
dom.canvas.addEventListener('pointerleave', () => { hoverId = null; });
dom.canvas.addEventListener('contextmenu', event => event.preventDefault());

for (const button of hotspotButtons) {
  button.addEventListener('focus', () => { focusedId = button.dataset.target; });
  button.addEventListener('blur', () => {
    if (focusedId === button.dataset.target) focusedId = null;
  });
}

window.addEventListener('keydown', event => {
  if (event.key === ' ' || event.code === 'Space') {
    const active = document.activeElement;
    const target = active && active.dataset ? active.dataset.target : null;
    // 焦点在普通按钮上时，空格归按钮自己用。
    if (!target && active && active.tagName === 'BUTTON' && !cardOpen) return;
    if (cardOpen) {
      // 结算卡弹出时玩家可能还压着空格，系统 repeat 会把卡片一眼吞掉。
      event.preventDefault();
      if (event.repeat) return;
      restart();
      return;
    }
    if (!target) {
      event.preventDefault();
      const first = hotspotButtons[0];
      if (first) {
        first.focus({ preventScroll: true });
        keyHold = first.dataset.target;
        fx.pressing = true;
        audio.unlock();
        if (keyHold === BRAZIER) audio.borrow();
      }
      return;
    }
    event.preventDefault();
    audio.unlock();
    keyHold = target;
    fx.pressing = true;
    if (keyHold === BRAZIER && !event.repeat) audio.borrow();
    return;
  }
  if (event.key === 'Enter' && cardOpen) {
    event.preventDefault();
    if (event.repeat) return;
    restart();
    return;
  }
  if (event.code === 'KeyR') restart();
  if (event.code === 'KeyM') toggleSound();
  if (event.code === 'Escape') {
    keyHold = null;
    fx.pressing = false;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const active = document.activeElement;
    const target = active && active.dataset ? active.dataset.target : null;
    if (!target) return;
    event.preventDefault();
    const index = hotspotButtons.findIndex(button => button.dataset.target === target);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = hotspotButtons[(index + step + hotspotButtons.length) % hotspotButtons.length];
    next.focus({ preventScroll: true });
  }
});

window.addEventListener('keyup', event => {
  if (event.key === ' ' || event.code === 'Space') {
    keyHold = null;
    if (!pointerHold) fx.pressing = false;
  }
});

window.addEventListener('blur', () => {
  pointerHold = null;
  keyHold = null;
  fx.pressing = false;
});

/* ------------------------------------------------------------------ */
/* 开关与重开                                                          */
/* ------------------------------------------------------------------ */

function toggleSound() {
  audio.muted = !audio.muted;
  writeStored(STORE_KEY.sound, audio.muted);
  syncSoundButton();
  if (!audio.muted) audio.unlock();
}

function resetLedger() {
  ledgerGroups.length = 0;
  dom.ledger.replaceChildren();
  dom.ledgerEmpty.hidden = false;
}

function restart() {
  audio.unlock();
  window.clearTimeout(cardTimer);
  closeCard();
  game = createGame(Math.floor(Math.random() * 4294967295));
  simAccumulator = 0;
  pointerHold = null;
  keyHold = null;
  hoverId = null;
  fx.pressing = false;
  fx.glow = { tea: 0, cat: 0, flower: 0, window: 0 };
  fx.fade = 0;
  fx.dawn = 0;
  fx.lowFuelTold = false;
  fx.dawnTold = false;
  fx.lastBodyAnnounce = 0;
  resetLedger();
  setHint(HINT_DEFAULT);
  updateHud();
  announce('又一夜。火盆在左边。');
}

dom.restart.addEventListener('click', () => restart());
dom.again.addEventListener('click', () => restart());
dom.sound.addEventListener('click', () => toggleSound());
dom.fold.addEventListener('click', () => {
  const open = dom.receipt.classList.toggle('open');
  dom.fold.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* ------------------------------------------------------------------ */
/* 主循环                                                              */
/* ------------------------------------------------------------------ */

function frame(now) {
  window.requestAnimationFrame(frame);
  if (document.hidden) {
    lastFrame = now;
    return;
  }
  const raw = (now - lastFrame) / 1000;
  lastFrame = now;
  const dt = clamp(Number.isFinite(raw) ? raw : 0, 0, 0.1);
  clock += dt;

  if (game.phase === 'playing') {
    simAccumulator += dt;
    let guard = 0;
    while (simAccumulator >= FIXED_STEP && guard < 8) {
      step(game, FIXED_STEP, { hold: currentHold() });
      simAccumulator -= FIXED_STEP;
      guard += 1;
      if (game.phase !== 'playing') break;
    }
    if (guard >= 8) simAccumulator = 0;
    const events = drainEvents(game);
    if (events.length > 0) handleEvents(events);
  }

  render(dt);

  if (now - lastHudAt > 170) {
    lastHudAt = now;
    updateHud();
  }
}

/* ------------------------------------------------------------------ */
/* 启动                                                                */
/* ------------------------------------------------------------------ */

syncSoundButton();
installGrain();
resize();
updateHud();

if (typeof ResizeObserver === 'function') {
  new ResizeObserver(() => resize()).observe(dom.stage);
} else {
  window.addEventListener('resize', resize);
}

document.addEventListener('visibilitychange', () => {
  lastFrame = performance.now();
  simAccumulator = 0;
  if (document.hidden) {
    pointerHold = null;
    keyHold = null;
    fx.pressing = false;
  }
});

window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

lastFrame = performance.now();
window.requestAnimationFrame(frame);
