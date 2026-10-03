/*
 * 味道的音符 · 声音层
 *
 * 每种味道对应一种"声音行为"，不是给它配一段音效：
 *   咸＝极短的高频点   酸＝尖锐的短音   糖＝高音之后长出第二层
 *   油脂＝低而长的持续音   鲜＝贯穿全曲的中音   稠化＝被抹圆的噪声
 *   香气＝许多留在空气里的短音   麻＝两个几乎同高的音互相打
 *
 * 调度用的强度数值来自 engine.js 的曲线，所以界面看到的和听到的是同一份数据。
 * 参数（频率、衰减、阈值）是我为"像那种感觉"选的，不是听感实验的结论。
 */

const MASTER_GAIN = 0.5;
const LOOKAHEAD = 0.35;
const MAX_TAIL = 5;
const RATE_LIMIT = { salt: 0.13, acid: 0.16, aroma: 0.3 };
const POP = { salt: 0.24, acid: 0.26, aroma: 0.34, numbing: 0.22, sugar: 0.3 };

export function createAudio({ onTick, onEnd } = {}) {
  let context = null;
  let master = null;
  let noise = null;
  const active = new Set();
  let plan = null;
  let clock = null;

  function ensure() {
    if (context) return context;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 22;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.28;
    master = context.createGain();
    master.gain.value = MASTER_GAIN;
    const air = context.createConvolver();
    air.buffer = impulse(context, 1.5, 2.6);
    const send = context.createGain();
    send.gain.value = 0.16;
    const wet = context.createGain();
    wet.gain.value = 0.7;
    master.connect(compressor).connect(context.destination);
    master.connect(send).connect(air).connect(wet).connect(compressor);

    const length = Math.floor(context.sampleRate * 1.2);
    noise = context.createBuffer(1, length, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    return context;
  }

  function impulse(audio, seconds, decay) {
    const length = Math.max(1, Math.floor(audio.sampleRate * seconds));
    const buffer = audio.createBuffer(2, length, audio.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let index = 0; index < length; index += 1) {
        data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, decay);
      }
    }
    return buffer;
  }

  function track(node, stopAt) {
    active.add(node);
    if (typeof node.stop === 'function') node.stop(stopAt + 0.05);
    if (typeof node.disconnect === 'function') node.addEventListener?.('ended', () => active.delete(node));
    return node;
  }

  function voice({ type, frequency, detune = 0, gain = 0.1, attack = 0.005, decay = 0.3, hold = 0, when = 0, attackTime = 0, filter = null, gainNode = false }) {
    const start = attackTime || when;
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (detune) osc.detune.setValueAtTime(detune, start);
    const amp = context.createGain();
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + attack);
    amp.gain.setValueAtTime(Math.max(0.0002, gain), start + attack + hold);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + decay);
    let head = osc;
    if (filter) {
      const node = context.createBiquadFilter();
      node.type = filter.type;
      node.frequency.value = filter.frequency;
      if (filter.Q) node.Q.value = filter.Q;
      head = head.connect(node);
      node.connect(amp);
    } else {
      osc.connect(amp);
    }
    amp.connect(master);
    osc.start(start);
    osc.stop(start + attack + hold + decay + 0.05);
    active.add(osc);
    osc.addEventListener('ended', () => active.delete(osc));
    return gainNode ? amp : head;
  }

  function click({ kind, when, level, high, width = 1 }) {
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    const centre = kind === 'salt' ? 1500 + high * 2400 : 900 + high * 1700;
    filter.frequency.setValueAtTime(centre, when);
    filter.Q.value = kind === 'salt' ? 1.1 : 3.2;
    const amp = context.createGain();
    const decay = (kind === 'salt' ? 0.018 + (1 - high) * 0.02 : 0.05 + (1 - high) * 0.09) * width;
    amp.gain.setValueAtTime(0.0001, when);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.11 * level), when + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    source.connect(filter).connect(amp).connect(master);
    source.start(when);
    source.stop(when + decay + 0.02);
    active.add(source);
    source.addEventListener('ended', () => active.delete(source));
    if (kind === 'salt') voice({ type: 'sine', frequency: 1800 + high * 2600, gain: 0.035 * level, attack: 0.002, decay: 0.03 + (1 - high) * 0.04, when });
  }

  function sound(key, value, when, profile) {
    const metrics = profile.metrics;
    if (key === 'salt') return click({ kind: 'salt', when, level: value, high: metrics.sharpness, width: 0.6 + (1 - metrics.decay) });
    if (key === 'acid') return click({ kind: 'acid', when, level: value, high: 0.5 + metrics.sharpness * 0.5 });
    if (key === 'aroma') return voice({ type: 'triangle', frequency: 900 + value * 900, gain: 0.012 * value, attack: 0.004, decay: 0.26 + value * 0.3, when });
    if (key === 'sugar') {
      const level = value;
      const base = 620 + level * 220;
      const rise = 0.3 + (1 - metrics.decay) * 1.1;
      voice({ type: 'sine', frequency: base, gain: 0.07 * level, attack: 0.005, decay: 0.4, when });
      voice({ type: 'sine', frequency: base, gain: 0.05 * level, attack: rise, decay: 0.8 + level * 0.7, when });
      voice({ type: 'sine', frequency: base * 1.5, gain: 0.028 * level, attack: 0.005 + rise * 0.5, decay: 0.9, when });
      return undefined;
    }
    if (key === 'fat') {
      const level = value;
      return voice({
        type: 'sine', frequency: 58 + level * 48, gain: 0.13 * (0.5 + level), attack: 0.16 + (1 - metrics.decay) * 0.4,
        hold: 0.2, decay: 0.45 + metrics.decay * 2.2, when, filter: { type: 'lowpass', frequency: 240 + level * 260 }
      });
    }
    if (key === 'umami') {
      const level = value;
      const osc = voice({ type: 'triangle', frequency: 118 + level * 44, gain: 0.055 * (0.4 + level), attack: 0.4, hold: 0.3, decay: 1.5 + level * 1.6, when, filter: { type: 'lowpass', frequency: 900 } });
      voice({ type: 'triangle', frequency: (118 + level * 44) * 1.5, gain: 0.018 * level, attack: 0.6, hold: 0.2, decay: 1.4, when });
      return osc;
    }
    if (key === 'starch') {
      const level = value;
      const source = context.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280 + level * 420, when);
      const amp = context.createGain();
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.05 * level), when + 0.35);
      amp.gain.setValueAtTime(Math.max(0.0002, 0.05 * level), when + 0.5);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + 1.6 + level);
      source.connect(filter).connect(amp).connect(master);
      source.start(when);
      source.stop(when + 2.4);
      active.add(source);
      source.addEventListener('ended', () => active.delete(source));
      return source;
    }
    if (key === 'numbing') {
      const level = value;
      const beat = 3.5 + level * 9;
      const carrier = context.createOscillator();
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(196 + level * 60, when);
      const amp = context.createGain();
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.055 * level), when + 0.12);
      amp.gain.setValueAtTime(Math.max(0.0002, 0.055 * level), when + 0.5);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + 1.2 + level * 1.4);
      const mod = context.createOscillator();
      mod.type = 'square';
      mod.frequency.setValueAtTime(beat, when);
      const modDepth = context.createGain();
      modDepth.gain.setValueAtTime(0.04 * level, when);
      mod.connect(modDepth).connect(amp.gain);
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, when);
      filter.Q.value = 5;
      carrier.connect(filter).connect(amp).connect(master);
      [carrier, mod].forEach(node => { node.start(when); node.stop(when + 2.8); active.add(node); });
      return carrier;
    }
    return undefined;
  }

  function buildPlan(profile) {
    const events = [];
    const times = profile.times;
    const step = times.length > 1 ? times[1] - times[0] : 0.05;
    const last = {};
    const duration = profile.total || times[times.length - 1] || 1;
    for (let index = 0; index < times.length; index += 1) {
      const time = times[index];
      for (const key of Object.keys(profile.curves)) {
        const value = profile.curves[key][index];
        if (key in RATE_LIMIT) {
          const floor = POP[key] || 0.2;
          const previous = index > 0 ? profile.curves[key][index - 1] : 0;
          const since = time - (last[key] ?? -Infinity);
          if (value >= floor && previous < floor && since >= RATE_LIMIT[key]) {
            last[key] = time;
            events.push({ when: time, key, value });
          }
          continue;
        }
        const previous = index > 0 ? profile.curves[key][index - 1] / step : 0;
        const now = value / step;
        const rising = now > previous + 0.35;
        if (value >= 0.12 && (rising || index === 0) && time - (last[key] ?? -Infinity) > 0.34) {
          last[key] = time;
          events.push({ when: time, key, value });
        }
      }
    }
    events.sort((a, b) => a.when - b.when);
    return { events, duration };
  }

  function cursor(index) {
    if (!plan) return null;
    const { events, duration, profile, speed, startedAt } = plan;
    const played = (context.currentTime - startedAt) * speed;
    while (index < events.length && events[index].when <= played + LOOKAHEAD) {
      const event = events[index];
      const delay = (event.when - played) / speed;
      /* 已经过去的事件不再补发，否则尾巴会挤成一堆 */
      if (delay >= -0.08) sound(event.key, Math.min(1, event.value * 1.25), context.currentTime + Math.max(0.02, delay) + 0.02, profile);
      index += 1;
    }
    if (index >= events.length && played >= duration + 0.5) {
      stop();
      return null;
    }
    return index;
  }

  function loop() {
    /* stop() 可能已经把 plan 清掉，而这一帧还在路上 */
    if (!plan) return;
    const next = cursor(plan.index);
    if (next === null) return;
    plan.index = next;
    clock = requestAnimationFrame(loop);
  }

  function play(profile, options = {}) {
    const audio = ensure();
    if (!audio) return false;
    if (audio.state === 'suspended') audio.resume();
    stop();
    plan = { ...buildPlan(profile), index: 0, startedAt: audio.currentTime, profile, speed: options.speed || 1, onTick: options.onTick, onEnd: options.onEnd };
    tickHandle = requestAnimationFrame(tick);
    clock = requestAnimationFrame(loop);
    return true;
  }

  /* 点一下谱面，听这一瞬间最重的那种味道 */
  function preview(profile, time) {
    const audio = ensure();
    if (!audio) return false;
    if (audio.state === 'suspended') audio.resume();
    const index = Math.min(profile.times.length - 1, Math.max(0, Math.round(clamp(time, 0, profile.total) / profile.resolution)));
    let key = 'salt', value = 0;
    for (const name of Object.keys(profile.curves)) {
      const now = profile.curves[name][index];
      if (now > value) { value = now; key = name; }
    }
    if (value < 0.1) return false;
    sound(key, Math.min(1, value), audio.currentTime + 0.02, profile);
    return true;
  }

  let tickHandle = null;
  function tick() {
    if (!plan) return;
    const { duration, startedAt, speed, onTick } = plan;
    const now = Math.max(0, Math.min(duration, (context.currentTime - startedAt) * speed));
    onTick?.(now, duration);
    if (now < duration) tickHandle = requestAnimationFrame(tick);
    else onTick?.(duration, duration);
  }

  function stop() {
    if (clock) cancelAnimationFrame(clock);
    if (tickHandle) cancelAnimationFrame(tickHandle);
    clock = null;
    tickHandle = null;
    for (const node of active) {
      try { node.stop(); } catch { /* 已经停止的节点 */ }
      try { node.disconnect(); } catch { /* 已断开 */ }
    }
    active.clear();
    const finished = plan?.onEnd;
    plan = null;
    if (finished) finished();
  }

  return {
    play,
    stop,
    get playing() { return !!plan; },
    get ready() { return !!context; },
    unlock() { const audio = ensure(); if (audio && audio.state === 'suspended') audio.resume(); return !!audio; }
  };
}
