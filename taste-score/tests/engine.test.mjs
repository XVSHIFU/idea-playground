/*
 * 这一组检查针对的是作品的规矩，不是像素：
 * 换一种做法，记谱是否真的变了；听觉落点与味觉落点是否真的错开。
 * 数值是我为这个作品选的，所以这些断言同时也是"我选得有没有效果"的第一道验证。
 *
 * 用 node:test 运行：node --test taste-score/tests/
 * 设 TASTE_SCORE_TESTS=direct 时只收集用例，由 run.mjs 顺序执行（不创建子进程）。
 */
import { test, run } from 'node:test';
import assert from 'node:assert/strict';

const direct = process.env.TASTE_SCORE_TESTS === 'direct';
if (direct) run().runOnly = [];
const cases = [];
const suite = direct
  ? (name, body) => cases.push({ name, run: body })
  : (name, body) => { cases.push({ name, run: body }); test(name, body); };

const { TASTE_KEYS, buildProfile, loudestStep, techniqueDuration, timingGap } = await import('../engine.js');
const { RECIPES, RECIPE_BY_ID } = await import('../recipes.js');

const ratio = profile => profile.metrics.peakAt / profile.total;

export async function runDirect(log = console.log) {
  let failed = 0;
  for (const { name, run: body } of cases) {
    try {
      await body();
      log(`ok   ${name}`);
    } catch (error) {
      failed += 1;
      log(`FAIL ${name}`);
      log(`     ${error.message}`);
    }
  }
  log(`\n${cases.length - failed}/${cases.length} 通过`);
  return failed;
}

suite('曲线归一、有界，并覆盖整段烹饪时间', () => {
  for (const recipe of RECIPES) {
    const profile = buildProfile(recipe, 'stir');
    assert.equal(profile.times[0], 0);
    assert.ok(Math.abs(profile.times[profile.times.length - 1] - profile.total) < 1e-6, `${recipe.id} 的时间轴没有覆盖整段`);
    let peak = 0;
    for (const key of TASTE_KEYS) {
      for (const value of profile.curves[key]) {
        assert.ok(Number.isFinite(value) && value >= 0 && value <= 1, `${recipe.id}.${key} 越界：${value}`);
        peak = Math.max(peak, value);
      }
      assert.ok(profile.profile[key] >= 0 && profile.profile[key] <= 1);
      assert.ok(profile.residue[key] >= 0 && profile.residue[key] <= 1);
    }
    assert.ok(peak > 0.9, `${recipe.id} 的曲线没有被归一化到可见高度`);
  }
});

suite('改做法会真的改写记谱，而不只是换一层外观', () => {
  const stir = buildProfile(RECIPE_BY_ID['garlic-greens'], 'stir');
  const braise = buildProfile(RECIPE_BY_ID['garlic-greens'], 'braise');
  assert.ok(braise.total > stir.total * 1.8, '慢炖应该显著拉长时间');
  /* 同一道菜：慢炖的咸味尾巴明显比爆炒长 */
  assert.ok(braise.metrics.decay > stir.metrics.decay * 1.5, `慢炖的咸味尾巴应该更长：${braise.metrics.decay} vs ${stir.metrics.decay}`);
  assert.notEqual(stir.metrics.sharpness, braise.metrics.sharpness);
  assert.ok(stir.metrics.layers >= 3 && braise.metrics.layers >= 3, '两种做法都应该有多层同时挂着');

  const blanch = buildProfile(RECIPE_BY_ID['garlic-greens'], 'blanch');
  const oilStep = blanch.annotations.find(item => item.id === 'heat-oil');
  assert.equal(oilStep, undefined, '白灼不应该留下"热油"这一步');
  assert.equal(blanch.profile.fat, 0, '白灼应该没有油脂层');
});

suite('听觉落点与味觉落点是错开的', () => {
  const stir = buildProfile(RECIPE_BY_ID['garlic-greens'], 'stir');
  const loud = loudestStep(stir);
  assert.ok(loud, '应该找得到最响的一步');
  /* 炒青菜最响的是下蒜与快炒，味觉落在整段靠前的位置 */
  assert.ok(ratio(stir) < 0.8, `听觉型菜式的味觉高点应该偏前，实际 ${ratio(stir)}`);
  assert.ok(timingGap(stir).listeningAt >= 0);

  const onion = buildProfile(RECIPE_BY_ID['caramel-onion'], 'stir');
  assert.ok(ratio(onion) > 0.6, `焦糖洋葱的味觉高点应该偏向结尾，实际 ${ratio(onion)}`);
  assert.ok(onion.metrics.layers >= 3, '焦糖洋葱应该有多层同时挂着');
  assert.ok(onion.metrics.saltPops >= 1, '加盐那一步应该留下可数的咸味点');
});

suite('焦化的第二层比第一层晚出现', () => {
  const profile = buildProfile(RECIPE_BY_ID['caramel-onion'], 'stir');
  const curve = profile.curves.sugar;
  let peakIndex = 0;
  for (let index = 1; index < curve.length; index += 1) if (curve[index] > curve[peakIndex]) peakIndex = index;
  const tail = Math.min(curve.length - 1, peakIndex + Math.round(1 / profile.resolution));
  assert.ok(curve[tail] > 0.2, '峰值之后一秒，糖与焦化的曲线应该仍有第二层');
});

suite('同一道菜换做法会给出不同的留存', () => {
  const stir = buildProfile(RECIPE_BY_ID['garlic-greens'], 'stir');
  const blanch = buildProfile(RECIPE_BY_ID['garlic-greens'], 'blanch');
  assert.ok(stir.residue.fat > blanch.residue.fat * 2, '白灼留下的油脂应该明显更少');

  /* "最重的那一下"按峰值排；舌头对最重的一下比对一个很淡却持续很久的底味更敏感 */
  const rank = id => Object.entries(buildProfile(RECIPE_BY_ID[id], 'stir').profile)
    .sort((a, b) => b[1] - a[1]).map(([key]) => key);
  const greens = rank('garlic-greens');
  const onion = rank('caramel-onion');
  assert.ok(greens.indexOf('salt') <= 3, `炒青菜应该以咸为前排，实际 ${greens.slice(0, 4).join('/')}`);
  assert.ok(onion.indexOf('sugar') <= 2, `焦糖洋葱应该以糖为前排，实际 ${onion.slice(0, 4).join('/')}`);
  assert.notDeepEqual(greens.slice(0, 2), onion.slice(0, 2), '两道菜的味觉前排不应该相同');
});

suite('做法时长与记谱时长一致', () => {
  for (const recipe of RECIPES) {
    for (const id of ['stir', 'braise', 'blanch', 'steam']) {
      const total = techniqueDuration(recipe, id);
      const profile = buildProfile(recipe, id);
      assert.equal(profile.total, Number(total.toFixed(1)));
    }
  }
});
