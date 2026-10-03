export const PREFIX = 'background-gods:v1:';
export const DARK_STEP = 12;
export const GRACE = 2200;
export const NAMES = ['苔', '汐', '萤', '芥', '雾', '蘖', '沫', '葭', '露', '尘', '蕨', '荧'];
const DREAMS = ['梦见自己的根，长进了另一片天空。', '在暗处，听见另一个名字。', '把没说出口的话，折成了一片叶。', '梦见一扇门。门后也是自己。', '在没有目光的地方，长出新的枝节。', '忘记了一点光，却记住了风。'];
export function hash(value) {
  let n = 2166136261;
  for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0;
}
export function memory(state, text, kind = 'memory', at = Date.now()) {
  state.memories.unshift({ text, kind, at });
  state.memories = state.memories.slice(0, 32);
}
export function createBeing(id, now, parent = null) {
  const seed = hash(id);
  const state = {
    id, name: NAMES[seed % NAMES.length], born: now, updated: now, last: now,
    parent: parent?.id || null, parentName: parent?.name || null,
    generation: parent ? parent.generation + 1 : 0,
    hue: parent ? (parent.hue + 27) % 360 : 135 + seed % 55,
    energy: parent ? Math.min(24, parent.energy * 0.4) : 2,
    light: 0, dark: 0, mutations: 0, mode: 'hidden',
    memories: [], received: [], quote: parent ? '我们曾做过同一个梦。' : '好暗。原来是你来了。'
  };
  if (parent?.memories.length) memory(state, `继承的碎片：${parent.memories[0].text}`, 'inheritance', now);
  memory(state, parent ? `从「${parent.name}」的记忆里，分出一条岔路。` : '第一次被看见。', 'birth', now);
  return state;
}
// All elapsed time comes from timestamps, never from counting interval callbacks.
export function settle(state, now) {
  const seconds = Math.max(0, now - state.last) / 1000;
  state.last = Math.max(state.last, now);
  if (state.mode === 'visible') {
    state.light += seconds;
    state.energy = Math.min(100, state.energy + seconds * 0.8);
  } else {
    const before = Math.floor(state.dark / DARK_STEP);
    state.dark += seconds;
    const after = Math.floor(state.dark / DARK_STEP);
    const steps = after - before;
    state.energy = Math.max(0, state.energy - seconds * 0.06);
    if (steps > 0) {
      state.mutations += steps;
      state.hue = (state.hue + steps * 7) % 360;
      const text = DREAMS[(hash(state.id) + after) % DREAMS.length];
      memory(state, steps > 1 ? `漫长的暗时间里，做了 ${steps} 个梦。${text}` : text, 'dream', now);
      state.quote = text;
    }
  }
  return state;
}
export function inheritFarewell(state, farewell, now) {
  if (farewell.to !== state.id || now - farewell.at < GRACE || state.received.includes(farewell.id)) return false;
  state.received.push(farewell.id);
  state.energy = Math.min(100, state.energy + farewell.energy);
  state.hue = (state.hue * 2 + farewell.hue) / 3;
  state.quote = `「${farewell.name}」留下的光，到了这里。`;
  memory(state, `「${farewell.name}」留下 ${Math.round(farewell.energy)} 点微光：${farewell.words}`, 'inheritance', now);
  return true;
}
export function gateReady(beings) {
  return beings.filter(b => b.energy >= 24 && b.dark >= 12).length >= 2;
}
