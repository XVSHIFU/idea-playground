import test from 'node:test';
import assert from 'node:assert/strict';
import { createBeing, settle, inheritFarewell, gateReady, GRACE } from '../engine.js';

test('observation gains energy; returning from throttled darkness catches up exactly once', () => {
  const b = createBeing('alpha', 1000); b.mode = 'visible';
  settle(b, 11000); assert.equal(b.energy, 10); assert.equal(b.light, 10);
  b.mode = 'hidden'; settle(b, 47000);
  assert.equal(b.dark, 36); assert.equal(b.mutations, 3); assert.equal(b.memories[0].kind, 'dream');
  const energy = b.energy; settle(b, 47000);
  assert.equal(b.energy, energy); assert.equal(b.mutations, 3);
});
test('dark settlement does not depend on how often a timer wakes', () => {
  const a = createBeing('same', 0), b = createBeing('same', 0);
  for (let t = 1000; t <= 60000; t += 1000) settle(a, t);
  settle(b, 60000);
  assert.equal(a.mutations, b.mutations); assert.equal(a.dark, b.dark); assert.equal(a.hue, b.hue);
  assert.ok(Math.abs(a.energy - b.energy) < 1e-9);
});
test('a branch inherits bounded energy and separate memories without changing its parent', () => {
  const parent = createBeing('parent', 0); parent.energy = 100;
  const child = createBeing('child', 5000, parent);
  assert.equal(child.parent, parent.id); assert.equal(child.generation, 1); assert.equal(child.energy, 24);
  child.memories[0].text = 'changed'; assert.notEqual(parent.memories[0].text, 'changed'); assert.equal(parent.energy, 100);
});
test('farewells require a grace period and correct recipient and cannot be applied twice', () => {
  const b = createBeing('heir', 0);
  const exit = { id: 'unique-exit', to: 'heir', name: '苔', energy: 20, hue: 150, at: 1000, words: 'a memory' };
  assert.equal(inheritFarewell(b, exit, 1001), false);
  assert.equal(inheritFarewell(b, { ...exit, to: 'other' }, 1000 + GRACE), false);
  assert.equal(inheritFarewell(b, exit, 1000 + GRACE), true); assert.equal(b.energy, 22);
  assert.equal(inheritFarewell(b, exit, 10000), false); assert.equal(b.energy, 22);
});
test('gate needs two beings, each with both observation and darkness', () => {
  const a = createBeing('a', 0), b = createBeing('b', 0);
  a.energy = b.energy = 24; a.dark = 12;
  assert.equal(gateReady([a,b]), false); b.dark = 12;
  assert.equal(gateReady([a,b]), true); assert.equal(gateReady([a]), false);
});
test('clock rollback cannot award extra elapsed time', () => {
  const b = createBeing('clock', 5000); b.mode = 'visible';
  settle(b, 4000); settle(b, 6000);
  assert.equal(b.light, 1);
});
