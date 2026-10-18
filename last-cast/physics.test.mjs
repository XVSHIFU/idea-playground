import test from "node:test";
import assert from "node:assert/strict";
import {
  LEVELS,
  TYPES,
  makeWorld,
  step,
  cast,
  reel,
  cancel,
  trace,
  runRoute,
  procedural,
  DT,
  IMPULSE,
} from "./physics.js";
for (const l of LEVELS)
  for (const route of l.routes)
    test(`${l.id} ${l.name}: ${route.side} 完整移船、抛钩、收竿、落稳`, () => {
      const r = runRoute(l, l.seed, route);
      assert.equal(r.ok, true, JSON.stringify(r));
      assert.ok(r.time < 90);
    });
test("same seed reset gives exactly the same world and drift", () => {
  let a = makeWorld(LEVELS[0], 123),
    b = makeWorld(LEVELS[0], 123);
  for (let i = 0; i < 1500; i++) {
    step(a);
    step(b);
  }
  assert.deepEqual(a, b);
  assert.deepEqual(makeWorld(LEVELS[0], 123), makeWorld(LEVELS[0], 123));
});
test("fixed impulse occurs once, with mass-dependent speed", () => {
  let speeds = [];
  for (const type of [1, 0, 2]) {
    let w = makeWorld(LEVELS[0]);
    let o = w.items[0];
    o.type = type;
    o.mass = TYPES[type].mass;
    o.p = [0.3, 1.1, 1.2];
    w.state = "hooked";
    w.active = 0;
    assert.ok(reel(w));
    let v = [...o.v];
    assert.equal(reel(w), false);
    assert.deepEqual(o.v, v);
    assert.equal(w.reels, 1);
    speeds.push(Math.hypot(...v));
    assert.ok(Math.abs(speeds.at(-1) - IMPULSE / o.mass) < 1e-8);
  }
  assert.ok(speeds[0] > speeds[1] && speeds[1] > speeds[2]);
});
test("wall blocks hook AND pull; cancel does not rewind", () => {
  let w = makeWorld(LEVELS[0]);
  assert.equal(trace(w, [-0.8, 1, -2], [-0.8, 1.5, 0]).kind, "wall");
  let o = w.items[0];
  o.p = [-0.7, 0.7, -0.5];
  w.boat.x = -2;
  w.boat.z = 0;
  w.state = "hooked";
  w.active = 0;
  assert.equal(reel(w), false);
  step(w);
  let t = w.time,
    p = [...o.p];
  cancel(w);
  assert.equal(w.time, t);
  assert.deepEqual(o.p, p);
});
test("flyover does not count; deck contact must persist for 350ms", () => {
  let w = makeWorld(LEVELS[0]),
    o = w.items[0];
  o.p = [w.boat.x, w.water + 1, w.boat.z];
  o.v = [1, 0, 0];
  step(w);
  assert.equal(o.saved, false);
  o.p = [w.boat.x, w.water + 0.18 + 0.115, w.boat.z];
  o.v = [0, 0, 0];
  o.spin = 0;
  for (let i = 0; i < 35; i++) step(w);
  assert.equal(o.saved, false);
  for (let i = 0; i < 30; i++) step(w);
  assert.equal(o.saved, true);
  const n = w.events.filter((e) => e.kind === "saved" && e.id === 0).length;
  for (let i = 0; i < 50; i++) step(w);
  assert.equal(
    w.events.filter((e) => e.kind === "saved" && e.id === 0).length,
    n,
  );
});
test("water rises monotonically; deadline loses without main; saved main wins", () => {
  for (const saved of [false, true]) {
    let w = makeWorld(LEVELS[0]);
    w.items[0].saved = saved;
    w.success = saved;
    let water = w.water;
    for (let i = 0; i < 10801; i++) {
      step(w);
      assert.ok(w.water >= water);
      water = w.water;
    }
    assert.equal(w.ended, true);
    assert.equal(w.success, saved);
  }
});
test("submerged target cannot be cast through water", () => {
  let w = makeWorld(LEVELS[0]);
  assert.equal(cast(w, [0, w.water - 0.2, 0]), false);
  assert.equal(
    trace(w, [2, w.water + 0.2, 2], [2, w.water - 0.2, 2]).kind,
    "water",
  );
});
test("moving boat and in-flight object cannot accept another cast", () => {
  let w = makeWorld(LEVELS[0]);
  w.boat.vx = 0.3;
  assert.equal(cast(w, [0.3, 0.7, 0.28]), false);
  w.boat.vx = 0;
  assert.ok(cast(w, [0.3, 0.7, 0.28]));
  assert.equal(cast(w, [0.3, 0.7, 0.28]), false);
  w.state = "flight";
  assert.equal(cancel(w), false);
});
for (const seed of [1, 42, 999, 21017, 4294967295])
  test(`procedural ${seed}: repeatable and two physical witnesses`, () => {
    let a = procedural(seed),
      b = procedural(seed);
    assert.deepEqual(a, b);
    assert.equal(a.routes.length, 2);
    for (const r of a.routes) assert.equal(runRoute(a, seed, r).ok, true);
  });
