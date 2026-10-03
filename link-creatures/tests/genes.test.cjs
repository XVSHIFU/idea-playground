const { test } = require('node:test');
const assert = require('node:assert/strict');
const G = require('../genes.js');

test('seed URLs preserve genes, Unicode names and ancestry', () => {
  const a = G.fresh(), b = G.fresh();
  const { child } = G.breed(a, b, 12); child.n = '苔芽 & 小雨 🌱';
  assert.deepEqual(G.parse('https://example.test/' + G.encode(child)), child);
  assert.deepEqual(child.p, [a.id, b.id]);
  assert.equal(child.g, 1);
});
test('breeding produces distinct, bounded, mutated children over successive generations', () => {
  let a = G.fresh(); const ids = new Set([a.id]);
  for (let i = 0; i < 1000; i++) {
    const { child, changes } = G.breed(a, null, 30);
    assert(!ids.has(child.id)); ids.add(child.id);
    assert.equal(child.g, a.g + 1);
    assert(changes.length >= 1);
    assert(G.keys.some(k => child[k] !== a[k]));
    assert.deepEqual(G.parse(G.encode(child)), child);
    assert(child.e <= 100); a = child;
  }
});
test('malformed and out-of-range seeds fail without silent coercion', () => {
  const hash = G.encode(G.fresh());
  for (const invalid of ['', '#hello', hash.replace('v=1', 'v=2'), hash.replace(/h=\d+/, 'h=999'), hash.replace(/l=\d+/, 'l=-2'), hash.replace(/c=\d+/, 'c=NaN'), hash.replace(/id=[a-f0-9]+/, 'id=<script>'), hash + '&p=broken']) {
    assert.throws(() => G.parse(invalid));
  }
});
test('both parents contribute before mutation and care remains inheritable', () => {
  const a = { ...G.fresh(), h: 0, s: 0, l: 2, r: 0, c: 0, m: 1 };
  const b = { ...G.fresh(), h: 300, s: 100, l: 6, r: 100, c: 100, m: 30, g: 8 };
  for (let i = 0; i < 100; i++) {
    const { child, changes } = G.breed(a, b, 20);
    const inherited = { ...child }; changes.forEach(c => { inherited[c.key] = c.before; });
    assert(G.keys.some(k => inherited[k] === a[k]));
    assert(G.keys.some(k => inherited[k] === b[k]));
    assert.equal(child.g, 9); assert.equal(child.e, 20);
  }
});
