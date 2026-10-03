(function (root) {
  'use strict';
  const ranges = { h: [0, 359], s: [0, 100], l: [2, 6], r: [0, 100], c: [0, 100], m: [1, 30] };
  const keys = Object.keys(ranges);
  const labels = { h: '色相', s: '体态', l: '肢体', r: '节奏', c: '亲和', m: '突变率' };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const integer = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  function id() {
    const bytes = new Uint8Array(5);
    root.crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  function fresh() {
    return { v: 1, id: id(), h: integer(70, 165), s: integer(25, 75), l: integer(3, 5), r: integer(15, 65), c: integer(20, 75), m: integer(8, 20), g: 0, e: 0, p: [], n: '' };
  }
  function encode(seed) {
    const p = new URLSearchParams({ v: '1', id: seed.id });
    for (const k of keys) p.set(k, seed[k]);
    p.set('g', seed.g); p.set('e', seed.e);
    if (seed.p.length) p.set('p', seed.p.join('.'));
    if (seed.n) p.set('n', seed.n);
    return '#' + p.toString();
  }
  function parse(input) {
    if (typeof input !== 'string' || input.length > 4096) throw Error('链接过长或格式不正确，请粘贴完整种子链接。');
    const hash = input.includes('#') ? input.slice(input.indexOf('#') + 1) : input.trim();
    const p = new URLSearchParams(hash);
    if (p.get('v') !== '1') throw Error('无法识别这个种子版本，请使用本页生成的链接。');
    if (!/^[a-f0-9]{10}$/.test(p.get('id') || '')) throw Error('种子身份不完整，请重新复制链接。');
    const out = { v: 1, id: p.get('id') };
    for (const [k, [a, b]] of Object.entries({ ...ranges, g: [0, 1000000], e: [0, 100] })) {
      const value = p.get(k);
      if (!/^\d{1,7}$/.test(value || '') || +value < a || +value > b) throw Error('种子基因不完整或超出范围，请检查链接。');
      out[k] = +value;
    }
    out.p = p.has('p') ? p.get('p').split('.') : [];
    if (out.p.length > 2 || out.p.some(x => !/^[a-f0-9]{10}$/.test(x))) throw Error('亲代记录不正确，请重新复制链接。');
    out.n = p.get('n') || '';
    if (out.n.length > 24) throw Error('种子名字过长，最多支持 24 个字符。');
    return out;
  }
  function mutate(seed) {
    const changes = [];
    const selected = keys.filter(() => Math.random() < seed.m / 100);
    if (!selected.length) selected.push(keys[integer(0, keys.length - 1)]);
    for (const key of selected) {
      const before = seed[key], [min, max] = ranges[key];
      const delta = (Math.random() < .5 ? -1 : 1) * integer(1, key === 'l' ? 1 : key === 'h' ? 20 : 9);
      let after = key === 'h' ? (before + delta + 360) % 360 : clamp(before + delta, min, max);
      if (before === after) after = clamp(before - delta, min, max);
      seed[key] = after;
      changes.push({ key, label: labels[key], before, after });
    }
    return changes;
  }
  function breed(a, b, care = 0) {
    if (Math.max(a.g, b?.g || 0) >= 1000000) throw Error('这条谱系已达到代数上限，请孵化一颗新的初生种子。');
    const child = { ...a, id: id(), n: '', g: Math.max(a.g, b?.g || 0) + 1, p: b ? [a.id, b.id] : [a.id] };
    if (b) {
      // Both parents always contribute at least one gene.
      const split = integer(1, keys.length - 1);
      const order = [...keys];
      for (let i = order.length - 1; i > 0; i--) { const j = integer(0, i); [order[i], order[j]] = [order[j], order[i]]; }
      order.forEach((key, i) => { child[key] = i < split ? a[key] : b[key]; });
    }
    child.e = clamp(Math.round((b ? (a.e + b.e) / 2 : a.e) * .65 + Math.min(care, 30)), 0, 100);
    return { child, changes: mutate(child) };
  }
  function name(seed) {
    if (seed.n) return seed.n;
    const colors = seed.h < 50 ? '蜜橘' : seed.h < 90 ? '麦芽' : seed.h < 165 ? '苔芽' : seed.h < 230 ? '蓝汐' : seed.h < 295 ? '暮紫' : '绯桃';
    const suffix = seed.c < 35 ? '慢慢' : seed.r > 65 ? '跳跳' : seed.s > 60 ? '绒绒' : '团团';
    return colors + '·' + suffix;
  }
  const api = { ranges, keys, labels, fresh, encode, parse, breed, name, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SeedGenes = api;
})(globalThis);
