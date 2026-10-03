const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Moth, normalizeBytes } = require('../engine');

test('normalizes whole bytes and rejects malformed or oversized messages without mutating state', () => {
  assert.equal(normalizeBytes('a0ff 11'), 'A0 FF 11');
  const moth = new Moth();
  for (const bad of ['', '1', '0 1', 'GG', '<script>', '11'.repeat(9)]) assert.throws(() => moth.receive(bad));
  assert.deepEqual(moth.history, []);
  assert.equal(normalizeBytes('FF'.repeat(8)).split(' ').length, 8);
});
test('alternation develops an unsolicited prediction after four inputs', () => {
  const moth = new Moth();
  for (const value of ['11', '22', '11']) assert.equal(moth.receive(value).prediction, null);
  const result = moth.receive('22');
  assert.equal(result.reply, '22'); assert.equal(result.prediction, '11');
});
test('same input responds differently after an emitted prediction', () => {
  const naive = new Moth(), learned = new Moth();
  for (const value of ['11', '22', '11', '22']) learned.receive(value);
  learned.predict('11');
  assert.equal(naive.receive('33').reply, '33');
  const surprise = learned.receive('33');
  assert.equal(surprise.reply, '00'); assert.ok(surprise.delay > 320); assert.equal(surprise.prediction, null);
});
test('repeated surprises can become a new habit, replacing the previous opening', () => {
  const moth = new Moth();
  for (const value of ['11', '22', '11', '22']) moth.receive(value);
  moth.predict('11'); moth.receive('33'); moth.receive('33');
  assert.equal(moth.receive('33').prediction, '33');
  moth.rest(); assert.deepEqual(moth.reconnect(), ['33']);
});
test('rest preserves the opening but clears unfulfilled expectations; reset clears memory', () => {
  const moth = new Moth();
  for (const value of ['11', '22', '11', '22']) moth.receive(value);
  moth.predict('11'); moth.rest();
  const opening = moth.reconnect(); assert.deepEqual(opening, ['11', '22']);
  opening.push('FF'); assert.deepEqual(moth.reconnect(), ['11', '22']);
  assert.equal(moth.receive('33').reply, '33');
  moth.reset(); assert.deepEqual(moth.reconnect(), []); assert.deepEqual(moth.history, []);
});
test('longer patterns and multi-byte messages are learned; irregular history does not invent a pattern', () => {
  const moth = new Moth();
  for (const value of ['A0 FF', '11', '22', 'A0 FF', '11']) moth.receive(value);
  assert.equal(moth.receive('22').prediction, 'A0 FF');
  moth.reset();
  for (let i = 0; i < 100; i++) assert.equal(moth.receive(i.toString(16).padStart(2, '0')).prediction, null);
  assert.equal(moth.history.length, 32);
});
