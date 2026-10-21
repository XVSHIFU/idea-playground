/**
 * 《借一度》热量账本引擎。
 *
 * 这个模块只做数字：不读写 DOM、window、localStorage 或 AudioContext，
 * 因此可以被 Node 直接 import（见 engine.test.mjs），也方便脱离画面配平。
 *
 * 两条守恒关系：
 * 1. 一次传热里，目标得到的净热 + 散在空气里的损耗 = 你失去的热，严格相等。
 * 2. 火盆不是白给的：烧掉的柴只有 80% 回到你身上，其余 20% 从烟囱走了。
 *
 * 单位说明：账本里的「度」是热量单位。1 ℃ 体温相当于 25 度热量，
 * 所以一条「给猫 6 度 / 你 −8 / 散了 2」的账单，换算成体温大约是 −0.3 ℃。
 */

/** 全部可调数值集中在这里，README 的数值表与之一一对应。 */
export const CONFIG = Object.freeze({
  /** 1 ℃ 体温折合多少度热量。 */
  heatPerCelsius: 25,
  /** 开局体温。 */
  startBodyC: 37,
  /** 体温低于此值即失败（你在椅子上睡着）。 */
  failBodyC: 30,
  /** 火盆最多把你烘到这里。 */
  maxBodyC: 38,
  /** 一夜的长度（秒），用尽即天亮。 */
  nightSeconds: 110,
  /** 按住冷东西时，每秒送进目标的净热量。 */
  transferRate: 7,
  /** 按住火盆时，每秒回到你身上的热量。 */
  brazierRate: 10,
  /** 火盆返还率：烧掉的柴只有八成变成你的体温。 */
  brazierEfficiency: 0.8,
  /** 柴低于这个比例时，回温速率减半。 */
  brazierLowFuelRatio: 0.3,
  /** 燃料不足时的回温倍率。 */
  brazierLowScale: 0.5,
  /** 一炉柴的总量。 */
  fuelMax: 360,
  /** 柴自然烧掉的速度（每秒）。 */
  fuelIdlePerSec: 0.3,
  /** 手悬在空中也在散热（每秒热量）。 */
  basalHeatPerSec: 0.55,
  /** 入夜时的转移损耗率。 */
  lossBase: 0.25,
  /** 夜将尽时的转移损耗率。 */
  lossEnd: 0.45,
  /** 损耗率下限，避免奖励叠加后变成无损搬运。 */
  lossMin: 0.12,
  /** 损耗率上限，避免深夜变成不可能。 */
  lossMax: 0.62,
  /** 单步最大推进，防止切回标签页时一帧吃掉半分钟。 */
  maxStep: 0.1,
  /** 账本起始时钟（当日分钟数）。 */
  clockStart: 22 * 60 + 14,
  /** 现实多少秒推进账本一分钟。 */
  secondsPerClockMinute: 10,
  /** 入夜室温，仅用于画面（℃）。 */
  ambientStartC: 16,
  /** 天将亮时室温，仅用于画面（℃）。 */
  ambientEndC: 8,
  /** 小于这个量的转移不单独落账，避免账本被抖动刷屏。 */
  ledgerThreshold: 0.4,
  /** 一直按着也会分段落账：小票一行一行打出来才像账本。 */
  ledgerChunkSeconds: 1.5,
});

/** 四件东西的净热量需求：茶最便宜，窗上冰最贵。 */
export const TARGETS = Object.freeze([
  Object.freeze({ id: 'tea', name: '冷茶', short: '茶', need: 40, verb: '暖好了' }),
  Object.freeze({ id: 'cat', name: '猫', short: '猫', need: 55, verb: '暖好了' }),
  Object.freeze({ id: 'flower', name: '花', short: '花', need: 70, verb: '开了' }),
  Object.freeze({ id: 'window', name: '窗上的冰', short: '窗', need: 95, verb: '化开了' }),
]);

/** 火盆也是一个可以按住的位置。 */
export const BRAZIER = 'brazier';

/** 键盘与指针可选的五个位置。 */
export const HOTSPOTS = Object.freeze([...TARGETS.map(target => target.id), BRAZIER]);

const TARGET_BY_ID = new Map(TARGETS.map(target => [target.id, target]));

/** 暖好之后的回报：都是「复利」，让后面的每一步更便宜。 */
export const REWARDS = Object.freeze({
  tea: Object.freeze({ healHeat: 25, lossDelta: -0.06, label: '喝下热茶' }),
  cat: Object.freeze({ healHeat: 0, lossDelta: 0, basalScale: 0.5, label: '猫凑到你身边' }),
  flower: Object.freeze({ healHeat: 50, lossDelta: -0.05, label: '花开了一点' }),
  window: Object.freeze({ healHeat: 0, lossDelta: 0, label: '窗化开了' }),
});

const EMPTY_INPUT = Object.freeze({ hold: null });
const EPSILON = 1e-6;

const clamp = (value, low, high) => (value < low ? low : value > high ? high : value);
const round = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/** 体温上限对应的热量。 */
export function maxBodyHeat() {
  return (CONFIG.maxBodyC - CONFIG.failBodyC) * CONFIG.heatPerCelsius;
}

/** 体温对应的热量总额（低于失败线即为 0）。 */
export function bodyCelsius(state) {
  return CONFIG.failBodyC + state.bodyHeat / CONFIG.heatPerCelsius;
}

/** 开局。同一个 seed 提供同样的初始扰动（目前用于画面抖动相位）。 */
export function createGame(seed = 1) {
  const numericSeed = Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 1;
  const state = {
    version: 1,
    seed: numericSeed,
    phase: 'playing',
    elapsed: 0,
    clock: CONFIG.clockStart,
    bodyHeat: (CONFIG.startBodyC - CONFIG.failBodyC) * CONFIG.heatPerCelsius,
    fuel: CONFIG.fuelMax,
    lossMod: 0,
    basalScale: 1,
    blockedCooldown: 0,
    targets: {},
    totals: { spent: 0, delivered: 0, wasted: 0, basal: 0, fuelBurned: 0, borrowed: 0 },
    hold: null,
    ledger: [],
    events: [],
    result: null,
  };
  for (const target of TARGETS) {
    state.targets[target.id] = { heat: 0, done: false, doneAt: 0 };
  }
  return state;
}

/** 当前损耗率：夜里越深，路上散得越多；茶与花会把它压回来。 */
export function lossOf(state) {
  const progress = clamp(state.elapsed / CONFIG.nightSeconds, 0, 1);
  const raw = CONFIG.lossBase + (CONFIG.lossEnd - CONFIG.lossBase) * progress + state.lossMod;
  return clamp(raw, CONFIG.lossMin, CONFIG.lossMax);
}

/** 室温，只影响画面。 */
export function ambientCelsius(state) {
  const progress = clamp(state.elapsed / CONFIG.nightSeconds, 0, 1);
  return CONFIG.ambientStartC + (CONFIG.ambientEndC - CONFIG.ambientStartC) * progress;
}

/** 剩余体温占「30 ℃–38 ℃」的比例，用于光晕强弱。 */
export function heatRatio(state) {
  return clamp(state.bodyHeat / maxBodyHeat(), 0, 1);
}

/** 剩余燃料比例。 */
export function fuelRatio(state) {
  return clamp(state.fuel / CONFIG.fuelMax, 0, 1);
}

/** 柴是不是已经见底（回温减半）。 */
export function isLowFuel(state) {
  return state.fuel <= CONFIG.fuelMax * CONFIG.brazierLowFuelRatio;
}

/** 一件东西暖到什么程度（0–1）。 */
export function progressOf(state, id) {
  const spec = TARGET_BY_ID.get(id);
  if (!spec) return 0;
  return clamp(state.targets[id].heat / spec.need, 0, 1);
}

/** 剩余时间（秒）。 */
export function timeLeft(state) {
  return Math.max(0, CONFIG.nightSeconds - state.elapsed);
}

/**
 * 窗上的冰是不是肯化了。
 *
 * 冰不认你手里这一度，它认整间屋子的温度：茶、猫、花三样都暖起来之后，
 * 手掌按上去才有反应。这条规则挡住了「直接扑向最贵的窗」这条捷径，
 * 让前三样的复利成为真正的前置条件。
 */
export function windowUnlocked(state) {
  return TARGETS.every(target => target.id === 'window' || state.targets[target.id].done);
}

/** 把当日分钟数写成 22:14。 */
export function clockText(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 分数：剩下的体温、剩下的柴、省下的时间。快但发冷，和慢但有余温，得分接近。 */
export function scoreOf(state) {
  const heat = state.bodyHeat;
  const fuel = state.fuel;
  const spare = Math.max(0, CONFIG.nightSeconds - state.elapsed);
  return Math.round(heat * 0.8 + fuel * 0.7 + spare * 2);
}

/** 星级：三星要求既暖又省。可达区间约 194–275（40 条模拟路线），258 需要贴着失败线走。 */
export function starsOf(score, phase) {
  if (phase !== 'won') return 0;
  if (score >= 258) return 3;
  if (score >= 212) return 2;
  return 1;
}

function normaliseHold(input) {
  if (!input) return null;
  const id = typeof input === 'string' ? input : input.hold;
  return HOTSPOTS.includes(id) ? id : null;
}

function pushLedger(state, entry) {
  state.ledger.push({ ...entry, clock: state.clock, at: state.elapsed });
  if (state.ledger.length > 80) state.ledger.shift();
  state.events.push({ type: 'ledger', entry: state.ledger[state.ledger.length - 1] });
}

function flushHold(state) {
  const hold = state.hold;
  if (!hold) return;
  state.hold = null;
  if (hold.id === BRAZIER) {
    if (hold.gain >= CONFIG.ledgerThreshold) {
      pushLedger(state, { kind: 'borrow', target: BRAZIER, gain: hold.gain, fuel: hold.fuel });
    }
    return;
  }
  if (hold.net >= CONFIG.ledgerThreshold) {
    pushLedger(state, { kind: 'transfer', target: hold.id, net: hold.net, spend: hold.spend, waste: hold.waste });
  }
}

function beginHold(state, hold) {
  if (state.hold && state.hold.id === hold) return;
  flushHold(state);
  state.hold = hold
    ? { id: hold, net: 0, spend: 0, waste: 0, fuel: 0, gain: 0, seconds: 0 }
    : null;
}

function applyTransfer(state, id, delta) {
  const spec = TARGET_BY_ID.get(id);
  const target = state.targets[id];
  if (!spec || !target || target.done) return;
  // 冰还没到时候：手按上去只会冷回来，热量不转移，也不扣你的体温。
  if (id === 'window' && !windowUnlocked(state)) {
    if (state.elapsed >= state.blockedCooldown) {
      state.blockedCooldown = state.elapsed + 5;
      state.events.push({ type: 'blocked', target: id });
    }
    return;
  }
  const remaining = spec.need - target.heat;
  if (remaining <= 0) return;
  const loss = lossOf(state);
  const netWanted = Math.min(remaining, CONFIG.transferRate * delta);
  const spendWanted = netWanted / (1 - loss);
  const spend = Math.min(spendWanted, state.bodyHeat);
  if (spend <= 0) return;
  // 净热来自你付的钱，剩下的就是散在路上的部分；两者相加严格等于支出。
  const net = spend * (1 - loss);
  const waste = spend - net;
  state.bodyHeat -= spend;
  target.heat = Math.min(spec.need, target.heat + net);
  state.totals.spent += spend;
  state.totals.delivered += net;
  state.totals.wasted += waste;
  const hold = state.hold;
  if (hold) {
    hold.net += net;
    hold.spend += spend;
    hold.waste += waste;
    hold.seconds += delta;
  }
  if (target.heat >= spec.need - EPSILON) completeTarget(state, id);
}

function applyBrazier(state, delta) {
  const capacity = maxBodyHeat() - state.bodyHeat;
  if (capacity <= 0) return;
  const scale = isLowFuel(state) ? CONFIG.brazierLowScale : 1;
  const gainWanted = Math.min(capacity, CONFIG.brazierRate * scale * delta);
  const fuelWanted = gainWanted / CONFIG.brazierEfficiency;
  const fuelUsed = Math.min(fuelWanted, state.fuel);
  if (fuelUsed <= 0) return;
  const gain = fuelUsed * CONFIG.brazierEfficiency;
  state.fuel = Math.max(0, state.fuel - fuelUsed);
  state.bodyHeat = Math.min(maxBodyHeat(), state.bodyHeat + gain);
  state.totals.borrowed += gain;
  state.totals.fuelBurned += fuelUsed;
  const hold = state.hold;
  if (hold) {
    hold.gain += gain;
    hold.fuel += fuelUsed;
    hold.seconds += delta;
  }
}

function completeTarget(state, id) {
  const target = state.targets[id];
  const spec = TARGET_BY_ID.get(id);
  if (!target || target.done) return;
  target.done = true;
  target.heat = spec.need;
  target.doneAt = state.elapsed;
  flushHold(state);
  const reward = REWARDS[id] || {};
  if (reward.healHeat) {
    state.bodyHeat = Math.min(maxBodyHeat(), state.bodyHeat + reward.healHeat);
  }
  if (reward.lossDelta) {
    state.lossMod = Math.max(-0.24, state.lossMod + reward.lossDelta);
  }
  if (reward.basalScale) {
    state.basalScale = Math.min(state.basalScale, reward.basalScale);
  }
  state.events.push({ type: 'complete', target: id, label: reward.label || spec.verb });
  if (id === 'window') finish(state, 'won');
}

function finish(state, phase) {
  if (state.phase !== 'playing') return;
  state.phase = phase;
  const score = phase === 'won' ? scoreOf(state) : 0;
  state.result = {
    phase,
    score,
    stars: starsOf(score, phase),
    bodyC: round(bodyCelsius(state), 1),
    fuel: Math.round(state.fuel),
    seconds: round(state.elapsed, 1),
    clock: state.clock,
    delivered: round(state.totals.delivered, 1),
    spent: round(state.totals.spent, 1),
    wasted: round(state.totals.wasted, 1),
    fuelBurned: round(state.totals.fuelBurned, 1),
  };
  state.events.push({ type: 'end', phase, score, stars: state.result.stars });
}

function settle(state) {
  if (state.phase !== 'playing') return;
  if (state.bodyHeat <= 0) {
    state.bodyHeat = 0;
    flushHold(state);
    finish(state, 'asleep');
    return;
  }
  if (state.elapsed >= CONFIG.nightSeconds) {
    state.elapsed = CONFIG.nightSeconds;
    flushHold(state);
    finish(state, 'dawn');
  }
}

/**
 * 推进一帧。
 * @param {object} state createGame() 的返回值，会被就地修改
 * @param {number} dt 秒；内部会钳制到 [0, CONFIG.maxStep]
 * @param {{hold?: string|null}|string|null} input hold 为要按住的位置
 * @returns {object} 同一个 state
 */
export function step(state, dt, input = EMPTY_INPUT) {
  if (!state || state.phase !== 'playing') return state;
  const numeric = Number(dt);
  const delta = clamp(Number.isFinite(numeric) ? numeric : 0, 0, CONFIG.maxStep);
  if (delta <= 0) return state;
  const hold = normaliseHold(input);

  state.elapsed += delta;
  state.clock = CONFIG.clockStart + Math.floor(state.elapsed / CONFIG.secondsPerClockMinute);

  // 柴一直在烧，取用只是让它烧得更快。
  const idleBurn = Math.min(state.fuel, CONFIG.fuelIdlePerSec * delta);
  state.fuel -= idleBurn;
  state.totals.fuelBurned += idleBurn;

  beginHold(state, hold);
  if (hold === BRAZIER) applyBrazier(state, delta);
  else if (hold) applyTransfer(state, hold, delta);

  // 一直按着的时候，每过一小段就把这一笔先打到账上，小票才是一行行长出来的。
  if (state.hold && state.hold.seconds >= CONFIG.ledgerChunkSeconds) flushHold(state);

  // 手悬在空中也在散热；猫凑过来之后这份代谢减半。
  const basal = Math.min(state.bodyHeat, CONFIG.basalHeatPerSec * state.basalScale * delta);
  state.bodyHeat -= basal;
  state.totals.basal += basal;

  settle(state);
  return state;
}

/** 取走这一帧攒下的事件（账本、暖好、结束）。 */
export function drainEvents(state) {
  if (!state || !state.events || state.events.length === 0) return [];
  return state.events.splice(0, state.events.length);
}

/** 给画面与无障碍播报用的快照。 */
export function snapshot(state) {
  const targets = {};
  for (const spec of TARGETS) {
    const target = state.targets[spec.id];
    targets[spec.id] = { heat: round(target.heat, 1), need: spec.need, done: target.done };
  }
  return {
    phase: state.phase,
    bodyC: round(bodyCelsius(state), 1),
    bodyRatio: round(heatRatio(state), 3),
    fuel: round(state.fuel, 1),
    fuelRatio: round(fuelRatio(state), 3),
    lowFuel: isLowFuel(state),
    loss: round(lossOf(state), 3),
    elapsed: round(state.elapsed, 1),
    timeLeft: round(timeLeft(state), 1),
    clock: state.clock,
    hold: state.hold ? state.hold.id : null,
    windowLocked: !windowUnlocked(state),
    targets,
  };
}
