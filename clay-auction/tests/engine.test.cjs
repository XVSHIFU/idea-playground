const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');
const bid = state => E.act(state, { type: 'bid', points: E.preset('arch', 400, 350) });
test('bid consumes one piece, retains owner, and advances the challenger', () => {
  const before = E.create(), after = bid(before);
  assert.equal(before.pieces.length, 0); assert.equal(after.players[0].remaining, 4);
  assert.equal(after.pieces[0].owner, 0); assert.equal(after.turn, 1); assert.equal(after.leader, 0);
});
test('all decline before bidding: unsold', () => {
  let s = E.create(); for (let i = 0; i < 3; i++) s = E.act(s, { type: 'exit' });
  assert.equal(s.status, 'finished'); assert.equal(s.winner, null);
});
test('bidder keeps the work after both others exit; cannot act after finish', () => {
  let s = bid(E.create()); s = E.act(s, { type: 'exit' }); s = E.act(s, { type: 'exit' });
  assert.equal(s.winner, 0); assert.equal(s.pieces.length, 1);
  assert.throws(() => bid(s), /落槌/);
});
test('withdrawn contributions stay and withdrawn players never return', () => {
  let s = bid(bid(bid(E.create()))); s = E.act(s, { type: 'exit' });
  assert.equal(s.turn, 1); s = bid(s); assert.equal(s.turn, 2); s = bid(s);
  assert.equal(s.turn, 1); assert.equal(s.pieces[0].owner, 0); assert.equal(s.players[0].out, true);
});
test('fifteen bids terminate; last bidder may win with no material left', () => {
  let s = E.create(); for (let i = 0; i < 15; i++) s = bid(s);
  assert.equal(s.status, 'finished'); assert.equal(s.winner, 2); assert.equal(s.pieces.length, 15);
  assert.deepEqual(s.players.map(p => p.remaining), [0, 0, 0]);
});
test('one remaining bidder must place a bid; a current leader need not outbid themselves', () => {
  let s = E.create(); s = E.act(s, { type: 'exit' }); s = E.act(s, { type: 'exit' });
  assert.equal(s.status, 'playing'); assert.equal(s.turn, 2); s = bid(s);
  assert.equal(s.winner, 2); assert.equal(s.players[2].remaining, 4);
});
test('reject floating, malformed and overlong pieces, accept segment intersections', () => {
  const s = E.create(); assert.throws(() => E.act(s, { type: 'bid', points: [[100, 100], [150, 100]] }), /没接上/);
  for (const points of [[[NaN, 396], [400, 396]], [[0, 0], [400, 396]], [[300, 390], [700, 390]]]) assert.throws(() => E.act(s, { type: 'bid', points }));
  const attached = E.act(s, { type: 'bid', points: [[400, 396], [400, 200]] });
  assert.equal(E.attached(attached, [[330, 230], [480, 230]]), true);
});
test('wish change costs nothing and persists through replay; corrupted derived fields ignored', () => {
  let s = E.act(E.create(), { type: 'wish', wish: '突然想要小篮子' });
  assert.equal(s.turn, 0); assert.equal(s.players[0].remaining, 5); s = bid(s);
  assert.deepEqual(E.restore(JSON.parse(JSON.stringify(s))), s);
  const raw = JSON.parse(JSON.stringify(s)); raw.winner = 2; raw.players[0].remaining = 500;
  assert.deepEqual(E.restore(raw), s); raw.events[0].who = 2; assert.throws(() => E.restore(raw));
});
test('all presets obey shape bounds and retain holes as paths', () => {
  for (const kind of ['arch', 'rod', 'curve', 'loop']) for (const angle of [-180, -90, 0, 90, 180]) assert.ok(E.validShape(E.preset(kind, 400, 350, angle)), `${kind} ${angle}`);
});
test('quantization cannot commit a stroke that replay would reject', () => {
  assert.throws(() => E.act(E.create(), { type: 'bid', points: [[390, 390], [402.73, 402.73]] }), /太短/);
});
