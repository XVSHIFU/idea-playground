/*
 * 味道的音符 · 记谱引擎
 *
 * 这一层不做声音，只把一次烹饪算成"随时间变化的味道强度"。
 * 它是整个作品的规矩所在：每道菜、每种做法都只是这份记谱的参数，
 * 因此"换一种做法"会真的改变同一道菜的曲线，而不是换一层外观。
 *
 * 术语：
 *   过程（process）—— 锅里正在发生的事，横轴是烹饪时间。
 *   此刻（instant）—— 某一瞬间的强度。
 *   留存（residue）—— 整段烹饪累积下来的总量，也就是舌头最后拿到的部分。
 * 听觉能追溯过程，舌头只能拿到留存，这是这个作品的出发点。
 */

export const TASTES = [
  { key: 'salt', name: '咸', aspect: 'salty', color: '#3f6f9a', note: '很短的点，亮度随强度上升', actual: '短时间内消失，不留在舌头上' },
  { key: 'acid', name: '酸', aspect: 'bright', color: '#7d8f22', note: '尖锐的短音，尾巴很短', actual: '入口一激，很快过去' },
  { key: 'sugar', name: '糖与焦化', aspect: 'caramel', color: '#a15a1e', note: '高音先出现，第二层慢慢浮上来', actual: '焦化的苦味会晚一些才被尝到' },
  { key: 'fat', name: '油脂', aspect: 'deep', color: '#8a6a4f', note: '很低、很圆、很长的音', actual: '覆盖性、没有明确边界' },
  { key: 'umami', name: '鲜', aspect: 'deep', color: '#6d5b8a', note: '不显眼但贯穿全程的中音', actual: '常常在事后才被发现' },
  { key: 'starch', name: '稠化', aspect: 'deep', color: '#8d8f84', note: '噪声被抹圆，起音变慢', actual: '入口更滑，层次被糊在一起' },
  { key: 'aroma', name: '香气', aspect: 'bright', color: '#4f7d5b', note: '许多短音留在空气里', actual: '先被闻到，很久以后还在' },
  { key: 'numbing', name: '麻', aspect: 'bright', color: '#a33a55', note: '两个几乎同高的音互相打，产生搏动', actual: '不是味道，是持续的高频震颤' }
];

export const TASTE_KEYS = TASTES.map(taste => taste.key);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const round = (value, digits = 3) => Number(value.toFixed(digits));

export function createSheet(value = 0) {
  return Object.fromEntries(TASTE_KEYS.map(key => [key, value]));
}

/* 做法对同一道菜的改造。削弱为 0 时整步消失，例如白灼不加油脂。 */
export const TECHNIQUES = [
  {
    id: 'stir', name: '爆炒', note: '大火短时，层次少而尖',
    duration: 0.45, saltSharp: 1.85, fat: 1, sugar: 0.55, starch: 0.5, acid: 0.85, umami: 0.8, aroma: 1.25, numbing: 0.75,
    weaken: {}
  },
  {
    id: 'braise', name: '慢炖', note: '小火长时，层层叠起来',
    duration: 3, saltSharp: 0.6, fat: 1.35, sugar: 0.85, starch: 1.3, acid: 0.55, umami: 1.3, aroma: 0.8, numbing: 1.3,
    weaken: {}
  },
  {
    id: 'blanch', name: '白灼', note: '水与时间短，几乎没有油',
    duration: 0.5, saltSharp: 1.6, fat: 0, sugar: 0.25, starch: 0.15, acid: 0.9, umami: 0.7, aroma: 0.7, numbing: 0.5,
    weaken: { fat: 0 }
  },
  {
    id: 'steam', name: '清蒸', note: '温度不到焦化，糖停在低处',
    duration: 1.4, saltSharp: 0.85, fat: 0.75, sugar: 0.15, starch: 0.5, acid: 0.7, umami: 1.1, aroma: 0.95, numbing: 0.6,
    weaken: {}
  }
];

export function getTechnique(techniqueId) {
  return TECHNIQUES.find(item => item.id === techniqueId) || TECHNIQUES[0];
}

/* 一步食材的贡献形状。
 * sharp 是"这一步有多尖"（爆炒 > 清蒸 > 慢炖），所有时间常数都用 snap() 折算：
 * 越尖越快，而不是直接 (1 - sharp)，否则 sharp 大于 1 时时间常数会变成负数。 */
const snap = sharp => 1 / (0.55 + Math.max(0.2, sharp) * 0.9);

const UNITS = {
  /* 咸：一碰就走，强度越高越亮 */
  saltHit(time, intensity, sharp, width) {
    const w = width * snap(sharp);
    if (Math.abs(time) > w * 4) return 0;
    return intensity * Math.exp(-(time * time) / (2 * w * w));
  },
  /* 酸：起音极快，尾巴极短 */
  acidSpike(time, intensity, sharp) {
    const rise = 0.16 * snap(sharp);
    const fall = 0.55 * snap(sharp);
    if (time < -rise * 3 || time > fall * 4) return 0;
    return intensity * (time < 0 ? Math.exp(time / rise) : Math.exp(-time / fall));
  },
  /* 糖与焦化：先出现，第二层延迟浮上来（焦化的苦比甜晚被尝到） */
  sugarBloom(time, intensity, sharp) {
    const rise = 0.85 * snap(sharp);
    const delay = rise * 1.15;
    if (time < -rise * 3 || time > rise * 5 + delay + 3.4) return 0;
    const first = time < 0 ? Math.exp(time / rise) : Math.exp(-time / (rise * 1.5));
    if (time < delay) return intensity * first;
    return intensity * (first * 0.6 + 0.4 * Math.exp(-Math.pow(time - delay, 2) / 2.4));
  },
  /* 油脂：起音慢、尾巴极长，但只覆盖这一步本身 */
  fatCoat(time, intensity, spanRaw, sharp) {
    const inhale = 0.7 * snap(sharp);
    /* 持续时间不能超过这一步本身；做法越慢，油膜铺得越开，否则一步会盖住整段烹饪 */
    const span = Math.min(spanRaw, 3.4);
    if (time < -inhale * 3 || time > span + 1.2) return 0;
    if (time < 0) return intensity * Math.exp(time / inhale);
    if (time <= span) return intensity;
    return intensity * Math.exp(-(time - span) / 0.85);
  },
  /* 鲜与稠化：平滑、缓慢地涨落 */
  smooth(time, intensity, spanRaw, sharp) {
    const rise = 0.9 * snap(sharp);
    const span = Math.min(spanRaw, 3.4);
    if (time < -rise * 3 || time > span + 1.4) return 0;
    if (time < 0) return intensity * Math.exp(time / rise);
    if (time <= span) return intensity;
    return intensity * Math.exp(-(time - span) / 1.05);
  },
  /* 香气：在这一步的整个跨度里持续 */
  aromaBody(time, intensity, spanRaw) {
    const span = Math.min(spanRaw, 3.4);
    if (time < -0.3 || time > span + 0.6) return 0;
    if (time < 0) return intensity * (1 + time / 0.3);
    if (time <= span) return intensity;
    return intensity * Math.exp(-(time - span) / 0.5);
  },
  /* 麻：在整段处理里反复敲 */
  numbingPulse(time, intensity, spanRaw, sharp) {
    const span = Math.min(spanRaw, 3.4);
    if (time < 0 || time > span) return 0;
    const rate = 2.6 + sharp * 4.5;
    const envelope = Math.min(1, time / 0.25) * Math.min(1, (span - time) / 0.25);
    return intensity * envelope * (0.35 + 0.65 * Math.abs(Math.sin(Math.PI * rate * time)));
  }
};

/* 做法如何改写每一步的曲率参数 */
function stepTaste(step, technique) {
  const peaks = createSheet();
  const shape = createSheet();
  const source = step.taste || {};
  const applied = createSheet(1);
  for (const key of TASTE_KEYS) {
    const weaken = technique.weaken[key];
    applied[key] = weaken === undefined ? 1 : weaken;
  }
  const sharp = technique.saltSharp;
  const wet = /水|汤|汁|酒|酱/.test(step.action || '');
  /* 记谱的时间尺度：即使是十来分钟的菜，也要留出可以听见的宽度；
     上限则保证一步很长的烹饪不会把整条曲线拉平。 */
  const span = clamp(step.length, 0.7, 3.2);
  const plateau = Math.min(span * 0.45, 1.2);

  const scale = (key, multiplier = 1) => (source[key] || 0) * applied[key] * multiplier;
  const anchor = Math.min(step.start + span * 0.55, step.start + span);

  peaks.salt = Math.max(
    scale('salt'),
    scale('salt') * (0.4 + sharp * 0.25),
    scale('salt') * 0.45
  );
  peaks.acid = scale('acid');
  peaks.sugar = scale('sugar');
  peaks.fat = scale('fat');
  peaks.starch = scale('starch') * (wet ? 1 : 0.6);
  peaks.umami = scale('umami') * (wet ? 1.15 : 0.85);
  peaks.aroma = scale('aroma');
  peaks.numbing = scale('numbing');

  shape.salt = offset => UNITS.saltHit(offset + span * 0.35, scale('salt'), sharp, 0.42) +
    UNITS.saltHit(offset, scale('salt') * (0.4 + sharp * 0.25), sharp, 0.34) +
    UNITS.saltHit(offset - span * 0.55, scale('salt') * 0.45, sharp, 0.34);
  shape.acid = offset => UNITS.acidSpike(offset, scale('acid'), sharp) + UNITS.acidSpike(offset - span * 0.7, scale('acid') * 0.35, sharp);
  shape.sugar = offset => UNITS.sugarBloom(offset - span * 0.22, scale('sugar'), sharp);
  shape.fat = offset => UNITS.fatCoat(offset - span * 0.1, scale('fat'), plateau * 0.8, sharp);
  shape.starch = offset => UNITS.smooth(offset - span * 0.45, peaks.starch, plateau, sharp);
  shape.umami = offset => UNITS.smooth(offset - span * 0.35, peaks.umami, plateau * 0.8, sharp);
  shape.aroma = offset => UNITS.aromaBody(offset - span * 0.05, scale('aroma'), plateau);
  shape.numbing = offset => UNITS.numbingPulse(offset - span * 0.1, scale('numbing'), plateau, sharp);

  return { peaks, shape, anchor };
}

export function techniqueDuration(recipe, techniqueId) {
  const technique = getTechnique(techniqueId);
  const base = recipe.steps.reduce((sum, step) => sum + step.minutes, 0);
  /* 平方根压缩：灶上时间差十倍，听起来的长度只差三倍左右 */
  return round(Math.max(10, 2.6 * Math.sqrt(base) * technique.duration), 1);
}

/* 把一道菜 × 一种做法算成记谱 */
export function buildProfile(recipe, techniqueId, options = {}) {
  const technique = getTechnique(techniqueId);
  const resolution = options.resolution || 0.04;
  const total = techniqueDuration(recipe, techniqueId);
  const profile = { salt: 0, acid: 0, sugar: 0, fat: 0, umami: 0, starch: 0, aroma: 0, numbing: 0 };
  const annotations = [];
  const minutes = recipe.steps.reduce((sum, step) => sum + step.minutes, 0);
  const scaleTime = total / minutes;

  const active = [];
  for (const step of recipe.steps) {
    if (step.removeIf && step.removeIf.includes(techniqueId)) continue;
    const start = Math.min(total, step.at * scaleTime);
    const length = Math.max(0.15, step.minutes * scaleTime);
    const { peaks, shape, anchor } = stepTaste({ ...step, start, length }, technique);
    for (const key of TASTE_KEYS) if (peaks[key] > profile[key]) profile[key] = peaks[key];
    active.push({ step, start, length, shape, anchor });
  }

  const peak = Math.max(...Object.values(profile), 0.0001);
  for (const key of TASTE_KEYS) profile[key] = round(profile[key] / peak);

  const count = Math.max(12, Math.round(total / resolution) + 1);
  const spacing = total / (count - 1);
  const times = [], curves = {};
  for (const key of TASTE_KEYS) curves[key] = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    const time = index * spacing;
    times.push(time);
    for (const item of active) {
      const offset = time - item.start;
      for (const key of TASTE_KEYS) {
        const value = item.shape[key](offset);
        if (value > 0) curves[key][index] += value;
      }
    }
  }

  /* 与音频同一套归一，保证看到的就是听到的 */
  let maxCurve = 0.0001;
  for (const key of TASTE_KEYS) for (const value of curves[key]) if (value > maxCurve) maxCurve = value;
  for (const key of TASTE_KEYS) for (let index = 0; index < count; index += 1) curves[key][index] = curves[key][index] / maxCurve;

  for (const item of active) {
    annotations.push({
      id: item.step.id,
      action: item.step.action,
      note: item.step.note || '',
      from: round(item.start, 2),
      to: round(item.start + item.length, 2),
      minutes: item.step.minutes
    });
  }

  return {
    recipeId: recipe.id,
    techniqueId,
    minutes,
    total: round(total, 1),
    resolution: spacing,
    times,
    curves,
    profile,
    annotations,
    residue: residueOf(curves),
    metrics: metricsOf({ times, curves, total })
  };
}

/* 舌头拿到的那一份：整段累积的总量。
 * 用高于 1 的次方再加权，是因为舌头对"最重的那一下"比对一个很淡却持续很久的底味更敏感。 */
export function residueOf(curves, weight = 1.6) {
  const keys = Object.keys(curves);
  const length = curves[keys[0]].length;
  const result = {};
  for (const key of TASTES) {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Math.pow(curves[key.key][index], weight);
    result[key.key] = round(sum / length);
  }
  return result;
}

/* 可以测量的听觉特征，全部由曲线本身推出 */
export function metricsOf({ times, curves, total }) {
  const indexAt = time => {
    let low = 0, high = times.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (times[mid] < time) low = mid + 1; else high = mid;
    }
    return low;
  };
  const value = (key, time) => curves[key][indexAt(clamp(time, 0, total))];

  const high = ['salt', 'acid', 'aroma', 'numbing'];
  const low = ['fat', 'umami', 'starch', 'sugar'];
  const mean = key => curves[key].reduce((sum, item) => sum + item, 0) / curves[key].length;
  const bright = high.reduce((sum, key) => sum + mean(key), 0) / high.length;
  const deep = low.reduce((sum, key) => sum + mean(key), 0) / low.length;

  let saltPops = 0;
  const popThreshold = 0.22;
  const gap = Math.max(0.14, total * 0.006);
  let lastPop = -Infinity;
  for (let index = 1; index < times.length; index += 1) {
    const now = curves.salt[index], before = curves.salt[index - 1];
    if (now >= popThreshold && before < popThreshold && times[index] - lastPop > gap) {
      saltPops += 1;
      lastPop = times[index];
    }
  }

  let overlapping = 0, maxOverlap = 0;
  for (const time of times) {
    overlapping = 0;
    for (const key of TASTE_KEYS) if (value(key, time) > 0.16) overlapping += 1;
    if (overlapping > maxOverlap) maxOverlap = overlapping;
  }

  /* 沿时间平均的"亮度"曲线：什么时候整体是亮的 */
  const brightness = new Float64Array(times.length);
  for (let index = 0; index < times.length; index += 1) {
    let now = 0;
    for (const key of high) now += curves[key][index];
    brightness[index] = now / high.length;
  }
  let peakIndex = 0;
  for (let index = 1; index < brightness.length; index += 1) if (brightness[index] > brightness[peakIndex]) peakIndex = index;

  /* 咸味在整段里积了多少：爆炒是几下短的点，慢炖是一层铺开的面。
     用固定的参考时长（6 秒）折算，这样"同样强度下炖得久"会真的积得更多。 */
  let saltMass = 0;
  const dt = total / Math.max(1, times.length - 1);
  for (let index = 0; index < times.length; index += 1) saltMass += curves.salt[index] * dt;

  return {
    saltPops,
    layers: maxOverlap,
    bright: round(bright, 3),
    deep: round(deep, 3),
    sharpness: round(clamp((bright - deep * 0.5) * 1.6), 3),
    peakAt: round(times[peakIndex], 2),
    decay: round(clamp(saltMass / 6, 0.03, 1), 3)
  };
}

/* 找出一道菜里最"响"的一步，用来说明听觉落点与味觉落点是否一致 */
export function loudestStep(profile) {
  let best = null;
  for (const item of profile.annotations) {
    const at = item.from;
    const index = Math.min(profile.times.length - 1, Math.max(0, Math.round(at / profile.resolution)));
    let energy = 0;
    for (const key of TASTE_KEYS) energy += profile.curves[key][index];
    if (!best || energy > best.energy) best = { ...item, energy: round(energy, 3) };
  }
  return best;
}

/* 听觉与味觉的落点差：这一项的数值就是作品想给人看的那个错位 */
export function timingGap(profile) {
  const loud = loudestStep(profile);
  if (!loud) return null;
  const at = round((loud.from + loud.to) / 2, 2);
  const total = profile.total || 1;
  return {
    listeningAt: at,
    listeningRatio: round(at / total, 3),
    tastingRatio: round(profile.metrics.peakAt / total, 3),
    aheadBy: round(at - profile.metrics.peakAt, 2)
  };
}

export const TASTE_BY_KEY = Object.fromEntries(TASTES.map(taste => [taste.key, taste]));
