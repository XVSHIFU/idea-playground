import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONFIG,
  TARGETS,
  createGame,
  step,
  snapshot,
  drainEvents,
  lossOf,
  windowUnlocked,
  isLowFuel,
  bodyCelsius,
  maxBodyHeat,
  scoreOf,
  starsOf,
} from './engine.js';

const DT = 1 / 60;

/** 一个不贪心的小机器人：冷了就烤火，够暖就去暖下一件还没暖好的东西。 */
function autoplay(state, { reserve = 60, maxSeconds = 400 } = {}) {
  const frames = Math.ceil(maxSeconds / DT);
  for (let i = 0; i < frames && state.phase === 'playing'; i++) {
    let hold = null;
    if (state.bodyHeat < reserve) {
      hold = 'brazier';
    } else {
      const next = TARGETS.find(target => !state.targets[target.id].done
        && (target.id !== 'window' || windowUnlocked(state)));
      if (next) hold = next.id;
    }
    step(state, DT, { hold });
  }
  return state;
}

test('传热守恒：目标得到的净热 + 路上散掉的 = 你失去的热', () => {
  const state = createGame(3);
  const bodyBefore = state.bodyHeat;
  for (let i = 0; i < 120; i++) step(state, DT, { hold: 'tea' });
  const gained = state.targets.tea.heat;
  const { spent, wasted, basal } = state.totals;
  assert.ok(Math.abs(gained + wasted - spent) < 1e-9, '净热 + 损耗必须等于支出');
  assert.ok(Math.abs(spent + basal - (bodyBefore - state.bodyHeat)) < 1e-9, '支出与代谢共同解释体温下降');
  assert.ok(wasted / spent > 0.2 && wasted / spent < 0.3, '开局损耗率应在 25% 上下');
  assert.ok(wasted > 0, '损耗不能为零：热量不能无损搬运');
});

test('守恒在每一帧都成立，且体温不会跌破失败线以下', () => {
  const state = createGame(4);
  for (let i = 0; i < 600; i++) {
    const spentBefore = state.totals.spent;
    const wastedBefore = state.totals.wasted;
    const heatBefore = state.targets.cat.heat;
    step(state, DT, { hold: 'cat' });
    const spent = state.totals.spent - spentBefore;
    const wasted = state.totals.wasted - wastedBefore;
    const gained = state.targets.cat.heat - heatBefore;
    assert.ok(Math.abs(gained + wasted - spent) < 1e-9, `第 ${i} 帧账不平`);
    assert.ok(state.bodyHeat >= 0, '体温不会变成负数');
  }
});

test('体温降到 30 度就睡着，结算为失败', () => {
  const state = createGame(5);
  state.bodyHeat = 1;
  for (let i = 0; i < 60 * 5 && state.phase === 'playing'; i++) step(state, DT, { hold: 'flower' });
  assert.equal(state.phase, 'asleep');
  assert.equal(state.bodyHeat, 0);
  assert.equal(snapshot(state).bodyC, CONFIG.failBodyC);
  assert.equal(state.result.stars, 0);
  assert.equal(state.result.score, 0);
});

test('柴烧完之后火盆给不出任何热量', () => {
  const state = createGame(6);
  state.bodyHeat = 40;
  state.fuel = 0;
  for (let i = 0; i < 120; i++) step(state, DT, { hold: 'brazier' });
  assert.equal(state.totals.borrowed, 0);
  assert.ok(state.bodyHeat < 40, '没有柴的时候，烤火只会继续变冷');
});

test('火盆只还八成：烧掉的柴不会全部回到你身上', () => {
  const state = createGame(7);
  state.bodyHeat = 20;
  state.fuel = 200;
  for (let i = 0; i < 60; i++) step(state, DT, { hold: 'brazier' });
  const { borrowed, fuelBurned } = state.totals;
  assert.ok(borrowed > 0);
  const gross = fuelBurned - CONFIG.fuelIdlePerSec * 1;
  assert.ok(Math.abs(borrowed / gross - CONFIG.brazierEfficiency) < 0.01, '返还率应约为 80%');
});

test('柴见底之后回温速率减半', () => {
  const rich = createGame(8);
  rich.bodyHeat = 30;
  rich.fuel = CONFIG.fuelMax;
  step(rich, DT, { hold: 'brazier' });
  const richGain = rich.totals.borrowed;

  const poor = createGame(8);
  poor.bodyHeat = 30;
  poor.fuel = CONFIG.fuelMax * 0.1;
  assert.equal(isLowFuel(poor), true);
  step(poor, DT, { hold: 'brazier' });
  const poorGain = poor.totals.borrowed;

  assert.ok(richGain > 0);
  assert.ok(poorGain < richGain * 0.6, '柴不足时回温应明显变慢');
});

test('暖好的东西会锁定，不再吸走体温', () => {
  const state = createGame(9);
  for (let i = 0; i < 60 * 40 && !state.targets.tea.done; i++) step(state, DT, { hold: 'tea' });
  assert.equal(state.targets.tea.done, true);
  assert.equal(state.targets.tea.heat, TARGETS[0].need);
  const spentBefore = state.totals.spent;
  const heatBefore = state.targets.tea.heat;
  const bodyBefore = state.bodyHeat;
  for (let i = 0; i < 60; i++) step(state, DT, { hold: 'tea' });
  assert.equal(state.totals.spent, spentBefore, '锁定后不应再支出热量');
  assert.equal(state.targets.tea.heat, heatBefore);
  assert.ok(state.bodyHeat < bodyBefore, '锁定后只有基础代谢在掉体温');
});

test('窗上的冰要等茶、猫、花都暖好才肯化', () => {
  const state = createGame(10);
  assert.equal(windowUnlocked(state), false);
  const bodyBefore = state.bodyHeat;
  for (let i = 0; i < 60 * 3; i++) step(state, DT, { hold: 'window' });
  assert.equal(state.targets.window.heat, 0, '锁着的时候不吸收热量');
  assert.ok(state.bodyHeat < bodyBefore, '只有代谢在掉体温');

  const events = drainEvents(state);
  assert.ok(events.some(event => event.type === 'blocked'));

  for (const id of ['tea', 'cat', 'flower']) state.targets[id].done = true;
  assert.equal(windowUnlocked(state), true);
  for (let i = 0; i < 60; i++) step(state, DT, { hold: 'window' });
  assert.ok(state.targets.window.heat > 0, '解锁之后才开始化冰');
});

test('四件东西的净热量保持「茶最便宜、冰最贵」的梯度', () => {
  const needs = TARGETS.map(target => target.need);
  assert.deepEqual(needs, [40, 55, 70, 95]);
  for (let i = 1; i < needs.length; i++) assert.ok(needs[i] > needs[i - 1]);
});

test('夜里越深，路上散得越多；茶与花会把它压回来', () => {
  const early = createGame(11);
  const late = createGame(11);
  late.elapsed = CONFIG.nightSeconds * 0.9;
  assert.ok(lossOf(late) > lossOf(early) + 0.1, '深夜的损耗应明显更高');

  const warmed = createGame(11);
  warmed.targets.tea.done = true;
  warmed.lossMod = -0.06;
  assert.ok(lossOf(warmed) < lossOf(early), '喝茶之后损耗率应下降');
});

test('把四件东西都暖好就算赢，并给出分数与星级', () => {
  const state = autoplay(createGame(12));
  assert.equal(state.phase, 'won');
  assert.ok(TARGETS.every(target => state.targets[target.id].done));
  assert.equal(state.result.phase, 'won');
  assert.ok(state.result.score > 0);
  assert.ok(state.result.stars >= 1 && state.result.stars <= 3);
  assert.ok(state.result.seconds < CONFIG.nightSeconds);
  assert.equal(state.result.score, scoreOf(state));
  assert.equal(state.result.stars, starsOf(state.result.score, 'won'));
});

test('一夜用完还没化开窗，就是天亮', () => {
  const state = createGame(13);
  for (let i = 0; i < 60 * 400 && state.phase === 'playing'; i++) step(state, DT, { hold: null });
  assert.equal(state.phase, 'dawn');
  assert.equal(state.elapsed, CONFIG.nightSeconds);
  assert.ok(state.targets.window.done === false);
  assert.equal(state.result.stars, 0);
});

test('同样的种子与同样的操作序列，结果完全一致', () => {
  const run = () => {
    const state = createGame(4242);
    const script = [
      [0, 180, 'brazier'],
      [180, 420, 'tea'],
      [420, 540, 'brazier'],
      [540, 900, 'cat'],
      [900, 1320, 'flower'],
      [1320, 1500, 'brazier'],
      [1500, 2400, 'window'],
    ];
    let frame = 0;
    for (const [from, to, hold] of script) {
      for (; frame < to; frame++) {
        if (frame < from) continue;
        step(state, DT, { hold });
      }
    }
    return state;
  };
  const first = run();
  const second = run();
  assert.deepEqual(snapshot(first), snapshot(second));
  assert.deepEqual(first.ledger, second.ledger);
  assert.deepEqual(first.totals, second.totals);
  assert.equal(first.phase, second.phase);
});

test('单步推进被钳制，切回标签页不会一帧吃掉半个夜晚', () => {
  const state = createGame(15);
  step(state, 5, { hold: null });
  assert.ok(state.elapsed <= CONFIG.maxStep + 1e-9);
  step(state, Number.NaN, { hold: null });
  step(state, -1, { hold: null });
  assert.ok(state.elapsed <= CONFIG.maxStep + 1e-9);
});

test('体温换算与上限一致', () => {
  const state = createGame(16);
  assert.equal(bodyCelsius(state), CONFIG.startBodyC);
  assert.equal(state.bodyHeat, (CONFIG.startBodyC - CONFIG.failBodyC) * CONFIG.heatPerCelsius);
  state.bodyHeat = maxBodyHeat();
  assert.equal(bodyCelsius(state), CONFIG.maxBodyC);
});
