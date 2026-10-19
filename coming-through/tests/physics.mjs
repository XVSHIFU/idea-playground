/** Run with THREE_MODULE and CANNON_MODULE pointing at the pinned local ESM
 * dependencies (three@0.160.0 / cannon-es@0.20.0). No test code is published. */
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "coming-through-"));
try {
  let source = await readFile(new URL("../shared.js", import.meta.url), "utf8");
  for (const [name, key] of [
    ["three", "THREE_MODULE"],
    ["cannon-es", "CANNON_MODULE"],
  ]) {
    assert(process.env[key], `${key} is required`);
    source = source.replace(
      new RegExp(`from ['"]${name}['"]`),
      `from '${pathToFileURL(resolve(process.env[key])).href}'`,
    );
  }
  await writeFile(join(dir, "physics.mjs"), source);
  const { Simulation, level, DT, closest } = await import(
    pathToFileURL(join(dir, "physics.mjs"))
  );
  const results = [];
  const timings = [];
  for (let i = 0; i < 24; i++)
    for (const mirror of [1, -1])
      for (const route of ["high", "low"]) {
        if (process.env.TEST_LEVEL && i + 1 !== Number(process.env.TEST_LEVEL))
          continue;
        const l = level(i, 101 + i, mirror),
          s = new Simulation(l);
        for (let k = 0; k < 120; k++) s.step();
        s.grab();
        let contacts = 0,
          maxStretch = 0;
        for (let k = 0; k < 3000 && !s.won; k++) {
          const t = k * DT,
            ws = l.witnesses[route];
          let j = 0;
          while (j < ws.length - 2 && ws[j + 1].t < t) j++;
          const a = ws[j],
            b = ws[j + 1];
          if (!a.p) s.release();
          else {
            if (!s.grabbed) s.grab();
            const f = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
            s.setTarget(b.p ? a.p.map((x, n) => x + (b.p[n] - x) * f) : a.p);
          }
          const before = performance.now();
          s.step();
          timings.push(performance.now() - before);
          contacts += s.segmentContacts;
          for (const c of s.cables)
            maxStretch = Math.max(
              maxStretch,
              c.bodyA.position.distanceTo(c.bodyB.position) / c.distance,
            );
          assert(s.cow.position.toArray().every(Number.isFinite));
        }
        const row = {
          level: i + 1,
          mirror,
          route,
          won: s.won,
          seconds: +s.time.toFixed(2),
          contacts,
          maxStretch: +maxStretch.toFixed(3),
        };
        results.push(row);
        console.log(JSON.stringify(row));
      }
  // Slack produces no artificial pushing; release preserves state; replay is deterministic.
  const a = new Simulation(level(0)),
    b = new Simulation(level(0));
  for (let i = 0; i < 120; i++) {
    a.step();
    b.step();
  }
  assert.deepEqual(a.state(), b.state());
  a.grab();
  a.setTarget(a.end.position.toArray());
  for (let i = 0; i < 30; i++) a.step();
  assert(Math.abs(a.cow.position.x - b.cow.position.x) < 0.02);
  const prev = a.end.position.toArray();
  a.release();
  assert.deepEqual(a.end.position.toArray(), prev);
  assert(!a.grabbed);
  a.grab();
  assert.deepEqual(a.target.toArray(), prev);
  // Center-only crossing cannot win: rear hull is still before the exit.
  const c = new Simulation(level(0));
  c.cow.position.x = c.level.exit + 0.1;
  c.step();
  assert(!c.won);
  c.cow.position.x = 3.5;
  c.step();
  assert(c.won);
  timings.sort((a, b) => a - b);
  const summary = {
    routes: results.length,
    passed: results.filter((x) => x.won).length,
    physicsStepP95: timings[Math.floor(timings.length * 0.95)],
    node: process.version,
    platform: process.platform,
  };
  console.log(JSON.stringify(summary));
  assert.equal(
    summary.passed,
    summary.routes,
    "At least one witnessed route failed",
  );
} finally {
  await rm(dir, { recursive: true, force: true });
}
