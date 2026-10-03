const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');
const fresh = (n = 2, house = false) => E.createGame(Array.from({ length: n }, (_, i) => 'ABCD'[i]), 0, house);
const move = (s, mode, action, condition) => E.applyMove(s, { mode, action, condition });
const step = (s, mode, action, condition) => E.nextTurn(move(s, mode, action, condition));

test('immediate actions charge credit, never mutate input, and require the key to open the door', () => {
  const s = fresh();
  assert.throws(() => move(s, 'now', 'open'), /钥匙/);
  const next = move(s, 'now', 'repair');
  assert.equal(next.world.bridge, 'good');
  assert.equal(next.players[0].credit, 1);
  assert.equal(s.world.bridge, 'broken');
  assert.throws(() => move(next, 'now', 'take'), /回合/);
});
test('past seals charge every actor extra and expire only on their owners next turn', () => {
  let s = step(fresh(), 'past', 'repair');
  assert.equal(s.seals.bridge, 0);
  assert.equal(s.players[0].credit, 0);
  const check = E.preview(s, { mode: 'now', action: 'break' });
  assert.equal(check.cost, 2);
  s = step(s, 'now', 'break');
  assert.equal(s.players[1].credit, 0);
  assert.equal(s.seals.bridge, null);
  let t = step(fresh(), 'past', 'repair');
  t = step(t, 'rest');
  assert.equal(t.seals.bridge, null);
  assert.equal(t.world.bridge, 'good');
});
test('a sealed key does not add to opening a door', () => {
  let s = fresh(); s.world.key = 0; s.seals.key = 1;
  assert.equal(E.preview(s, { mode: 'now', action: 'open' }).cost, 1);
});
test('progress is cancelled even if the object changes back before resolution', () => {
  let s = step(fresh(3), 'progress', 'repair');
  s = step(s, 'now', 'repair');
  assert.equal(s.players[0].pending.cancelled, true);
  s = step(s, 'now', 'break');
  assert.equal(s.world.bridge, 'broken');
  assert.equal(s.players[0].pending, null);
});
test('progress survives unrelated object changes', () => {
  let s = step(fresh(), 'progress', 'repair');
  s = step(s, 'now', 'take');
  assert.equal(s.world.bridge, 'good');
  assert.equal(s.players[0].credit, 2);
});
test('a promise survives target changes and rewards execution', () => {
  let s = step(fresh(3), 'future', 'repair');
  s = step(s, 'now', 'repair');
  s = step(s, 'now', 'break');
  assert.equal(s.world.bridge, 'good');
  assert.equal(s.players[0].credit, 3);
  assert.equal(s.players[0].pending, null);
});
test('already satisfied pending outcomes succeed without paying for a seal', () => {
  let s = step(fresh(), 'future', 'repair');
  s = step(s, 'past', 'repair');
  assert.equal(s.players[0].credit, 3);
  assert.equal(s.seals.bridge, 1);
  assert.equal(s.players[1].credit, 0);
});
test('a promise checks key ownership at execution and penalizes failure', () => {
  let s = fresh(); s.world.key = 0;
  s = step(s, 'future', 'open');
  s = step(s, 'now', 'take');
  assert.equal(s.world.door, 'closed');
  assert.equal(s.players[0].credit, 1);
});
test('pending failure cannot overdraw credit and obeys target seals', () => {
  let s = fresh(); s.players[0].credit = 0;
  s = step(s, 'future', 'repair');
  s = step(s, 'future', 'repair');
  assert.equal(s.world.bridge, 'good');
  assert.equal(s.players[0].credit, 1);
  let t = fresh(); t.players[0].credit = 0; t.seals.bridge = 1;
  t = step(t, 'future', 'repair'); // B's beginning expires B seal.
  t = step(t, 'past', 'repair'); // Target satisfied: promise succeeds without fee.
  assert.equal(t.players[0].credit, 1);
  let u = fresh(); u.world.bridge = 'good'; u.players[0].credit = 0;
  u = step(u, 'future', 'break');
  u = step(u, 'now', 'break');
  // Build a genuine sealed obstacle on B's turn in a three-player game.
  let v = fresh(3); v.players[0].credit = 0;
  v = step(v, 'future', 'break');
  v = step(v, 'past', 'repair');
  v = step(v, 'rest');
  assert.equal(v.world.bridge, 'good');
  assert.equal(v.players[0].credit, 0);
  assert.equal(v.seals.bridge, 1);
});
test('conditions check once at the owners next start, including negation', () => {
  let s = step(fresh(), 'condition', 'repair', { object: 'door', value: 'open', not: false });
  assert.equal(s.world.bridge, 'broken');
  s = step(s, 'rest');
  assert.equal(s.world.bridge, 'broken');
  assert.equal(s.players[0].pending, null);
  let t = step(fresh(), 'condition', 'repair', { object: 'door', value: 'open', not: true });
  t = step(t, 'rest');
  assert.equal(t.world.bridge, 'good');
  assert.throws(() => move(fresh(), 'condition', 'repair', { object: 'thoughts', value: 'yes' }), /条件/);
});
test('one conditional result does not immediately trigger another players condition', () => {
  let s = step(fresh(), 'condition', 'repair', { object: 'door', value: 'closed', not: false });
  s = step(s, 'condition', 'break', { object: 'bridge', value: 'good', not: false });
  assert.equal(s.world.bridge, 'good');
  assert.notEqual(s.players[1].pending, null);
});
test('complete example ends in victory only at the end of the current players turn', () => {
  let s = step(fresh(), 'future', 'repair');
  s = step(s, 'rest');
  assert.equal(s.players[0].credit, 3);
  s = step(s, 'now', 'take');
  s = step(s, 'rest');
  s = move(s, 'past', 'open');
  assert.equal(s.phase, 'finished');
  assert.equal(s.winner, 0);
  assert.equal(s.round, 3);
  assert.throws(() => E.nextTurn(s), /不能/);
});
test('rounds count full orbits from any first player and stop after eight rounds', () => {
  let s = E.createGame(['A', 'B', 'C', 'D'], 2);
  for (let turn = 0; turn < 32; turn++) {
    assert.equal(s.current, (turn + 2) % 4);
    assert.equal(s.round, Math.floor(turn / 4) + 1);
    s = move(s, turn === 31 ? 'future' : 'rest', turn === 31 ? 'repair' : undefined);
    if (turn < 31) s = E.nextTurn(s);
  }
  assert.equal(s.phase, 'finished'); assert.equal(s.winner, null);
  assert.equal(s.world.bridge, 'broken');
  assert.notEqual(s.players[1].pending, null);
});
test('house rules require every other player, start next round, and only pass once', () => {
  let s = E.proposeRule(fresh(3, true), 'cap');
  assert.equal(s.phase, 'vote');
  s = E.voteRule(s, true); assert.equal(s.phase, 'vote');
  s = E.voteRule(s, true); assert.equal(s.phase, 'handoff');
  assert.equal(s.house.cap, 3);
  s = E.nextTurn(s); s = step(s, 'rest');
  assert.equal(s.house.cap, 3);
  s = step(s, 'rest'); assert.equal(s.house.cap, 4);
  assert.throws(() => E.proposeRule(s, 'rest'), /不能/);
});
test('rejected proposals consume the turn as rest and remain available later', () => {
  let s = E.proposeRule(fresh(3, true), 'reward');
  s = E.voteRule(s, false);
  assert.equal(s.phase, 'handoff'); assert.equal(s.players[0].credit, 3);
  assert.equal(s.house.used, false);
  assert.throws(() => E.proposeRule(fresh(), 'cap'), /不能/);
});
test('invalid input and broken saves are rejected; a valid save round trips', () => {
  assert.throws(() => move(fresh(), 'unknown', 'repair'), /选择/);
  assert.throws(() => move(fresh(), 'now', 'teleport'), /选择/);
  assert.throws(() => E.createGame(['A']), /2 至 4/);
  let s = step(fresh(), 'future', 'take');
  assert.equal(E.isValidState(JSON.parse(JSON.stringify(s))), true);
  for (const bad of [null, {}, { ...s, current: 9 }, { ...s, round: 99 }, { ...s, logs: [{}] }]) assert.equal(E.isValidState(bad), false);
});
