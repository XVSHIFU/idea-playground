/* Pure, deterministic model. No wall clock, DOM, random state or storage. */
(function (root) {
  'use strict';
  function normalizeBytes(value) {
    const trimmed = String(value).trim();
    if (!trimmed || !/^[\da-f\s]+$/i.test(trimmed)) throw new Error('请输入十六进制字节，例如 11 或 A0 FF。');
    const groups = trimmed.split(/\s+/);
    if (groups.some(group => group.length % 2)) throw new Error('每个字节需要两位字符，例如 01，不能只写 1。');
    const compact = groups.join('');
    if (compact.length > 16) throw new Error('一次最多发送 8 个字节，请缩短输入。');
    return compact.toUpperCase().match(/.{2}/g).join(' ');
  }
  class Moth {
    constructor() { this.reset(); }
    reset() { this.history = []; this.opening = []; this.expected = null; }
    receive(value) {
      const bytes = normalizeBytes(value);
      const interrupted = this.expected !== null && bytes !== this.expected;
      this.expected = null;
      this.history.push(bytes);
      if (this.history.length > 32) this.history.shift();
      const pattern = this.findPattern();
      if (pattern && !interrupted) this.opening = pattern.slice();
      return { bytes, reply: interrupted ? '00' : bytes, delay: interrupted ? 1050 : 320,
        prediction: !interrupted && pattern ? pattern[0] : null };
    }
    findPattern() {
      const h = this.history;
      for (let size = 1; size <= 4; size++) {
        const repeats = size === 1 ? 3 : 2;
        if (h.length < size * repeats) continue;
        const tail = h.slice(-size);
        if (h.slice(-size * repeats).every((v, i) => v === tail[i % size])) return tail;
      }
      return null;
    }
    predict(bytes) { this.expected = bytes; return bytes; }
    rest() { this.expected = null; }
    reconnect() { this.expected = null; return this.opening.slice(); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { Moth, normalizeBytes };
  else root.ProtocolZoo = { Moth, normalizeBytes };
})(typeof globalThis !== 'undefined' ? globalThis : this);
