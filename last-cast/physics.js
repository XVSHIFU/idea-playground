// Deterministic renderer-independent simulation. One boat-width = one metre.
export const DT = 1 / 120,
  G = 9.8,
  IMPULSE = 6.4;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export class PRNG {
  constructor(seed) {
    this.s = seed >>> 0;
  }
  next() {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) {
    return a + (b - a) * this.next();
  }
}
export const TYPES = [
  {
    name: "木马",
    mass: 1,
    r: 0.115,
    shape: [
      [-0.13, 0, 0, 0.11],
      [0.1, 0, 0, 0.12],
      [0.13, 0.15, 0, 0.075],
    ],
  },
  {
    name: "杯子",
    mass: 0.8,
    r: 0.105,
    shape: [
      [0, 0, 0, 0.105],
      [0.11, 0.015, 0, 0.055],
    ],
  },
  {
    name: "小钟",
    mass: 1.2,
    r: 0.125,
    shape: [
      [0, 0, 0, 0.125],
      [0, 0.12, 0, 0.08],
    ],
  },
  {
    name: "相框",
    mass: 0.8,
    r: 0.11,
    shape: [
      [-0.09, 0, 0, 0.07],
      [0.09, 0, 0, 0.07],
      [-0.09, 0.14, 0, 0.07],
      [0.09, 0.14, 0, 0.07],
      [0, 0.07, 0, 0.09],
    ],
  },
  {
    name: "木盒",
    mass: 1.2,
    r: 0.135,
    shape: [
      [-0.09, 0, 0, 0.135],
      [0.09, 0, 0, 0.135],
    ],
  },
  {
    name: "布偶",
    mass: 0.8,
    r: 0.105,
    shape: [
      [0, 0, 0, 0.105],
      [0, 0.14, 0, 0.08],
      [-0.09, -0.03, 0, 0.06],
      [0.09, -0.03, 0, 0.06],
    ],
  },
];
export const LEVELS = [
  {
    id: 1,
    name: "窗边那匹马",
    template: 0,
    main: 0,
    seed: 21017,
    floor: 0.48,
    frontWidth: 0.96,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.008,
    bounds: 4.3,
    boat: [0.3, 2.49],
    routes: [
      {
        x: 0.3,
        z: 2.37,
        wait: 1,
        side: "front",
      },
      {
        x: 2.6700000000000004,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 2,
    name: "桌上的杯子",
    template: 0,
    main: 1,
    seed: 28936,
    floor: 0.48,
    frontWidth: 1,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.012,
    bounds: 4.3,
    boat: [0.3, 3.210000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.0900000000000007,
        wait: 1,
        side: "front",
      },
      {
        x: 3.330000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 3,
    name: "别碰窗沿",
    template: 0,
    main: 4,
    seed: 36855,
    floor: 0.48,
    frontWidth: 0.82,
    sideWidth: 1.2,
    thickness: 0.25,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.016,
    bounds: 4.3,
    boat: [0.3, 2.07],
    routes: [
      {
        x: 0.3,
        z: 1.95,
        wait: 1,
        side: "front",
      },
      {
        x: 2.25,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 4,
    name: "等水抬一抬",
    template: 0,
    main: 5,
    seed: 44774,
    floor: 0.48,
    frontWidth: 1.05,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.35,
    drift: 0.02,
    bounds: 4.3,
    boat: [0.3, 3.210000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.0900000000000007,
        wait: 1,
        side: "front",
      },
      {
        x: 3.390000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 5,
    name: "从另一扇窗",
    template: 1,
    main: 2,
    seed: 52693,
    floor: 0.48,
    frontWidth: 0.85,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.008,
    bounds: 4.3,
    boat: [0.3, 2.07],
    routes: [
      {
        x: 0.3,
        z: 1.95,
        wait: 1,
        side: "front",
      },
      {
        x: 2.13,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 6,
    name: "低处先消失",
    template: 1,
    main: 3,
    seed: 60612,
    floor: 0.48,
    frontWidth: 0.95,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 0.7,
    drift: 0.012,
    bounds: 4.3,
    boat: [0.3, 3.150000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.150000000000001,
        wait: 1,
        side: "front",
      },
      {
        x: 3.390000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 7,
    name: "留一点距离",
    template: 1,
    main: 4,
    seed: 68531,
    floor: 0.48,
    frontWidth: 0.88,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.016,
    bounds: 4.3,
    boat: [0.3, 2.07],
    routes: [
      {
        x: 0.3,
        z: 1.95,
        wait: 1,
        side: "front",
      },
      {
        x: 2.25,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 8,
    name: "绕过那根柱",
    template: 1,
    main: 1,
    seed: 76450,
    floor: 0.48,
    frontWidth: 1.05,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: -0.1,
    waterEnd: 1.65,
    waterPower: 1.05,
    drift: 0.02,
    bounds: 4.3,
    boat: [0.3, 3.210000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.0900000000000007,
        wait: 1,
        side: "front",
      },
      {
        x: 3.330000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 9,
    name: "楼上的声音",
    template: 2,
    main: 2,
    seed: 84369,
    floor: 1.05,
    frontWidth: 0.95,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: 0.2,
    waterEnd: 2.3,
    waterPower: 1.05,
    drift: 0.008,
    bounds: 4.3,
    boat: [0.3, 2.07],
    routes: [
      {
        x: 0.3,
        z: 1.95,
        wait: 1,
        side: "front",
      },
      {
        x: 2.19,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 10,
    name: "只剩一道缝",
    template: 2,
    main: 3,
    seed: 92288,
    floor: 1.05,
    frontWidth: 0.72,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: 0.2,
    waterEnd: 2.3,
    waterPower: 1.05,
    drift: 0.012,
    bounds: 4.3,
    boat: [0.3, 3.150000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.150000000000001,
        wait: 1,
        side: "front",
      },
      {
        x: 3.450000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 11,
    name: "多绕一个弯",
    template: 2,
    main: 5,
    seed: 100207,
    floor: 1.05,
    frontWidth: 0.78,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: 0.2,
    waterEnd: 2.3,
    waterPower: 1.05,
    drift: 0.016,
    bounds: 4.3,
    boat: [0.3, 3.150000000000001],
    routes: [
      {
        x: 0.3,
        z: 3.0300000000000007,
        wait: 1,
        side: "front",
      },
      {
        x: 3.390000000000001,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
  {
    id: 12,
    name: "最后一竿",
    template: 2,
    main: 0,
    seed: 108126,
    floor: 1.05,
    frontWidth: 0.92,
    sideWidth: 1.2,
    thickness: 0.14,
    waterStart: 0.2,
    waterEnd: 2.3,
    waterPower: 1.05,
    drift: 0.02,
    bounds: 4.3,
    boat: [0.3, 2.43],
    routes: [
      {
        x: 0.3,
        z: 2.31,
        wait: 1,
        side: "front",
      },
      {
        x: 2.7300000000000004,
        z: 0.28,
        wait: 8,
        side: "side",
      },
    ],
  },
];
export function box(x, y, z, sx, sy, sz, kind = "wall") {
  return { x, y, z, sx, sy, sz, kind };
}
export function architecture(l) {
  const a = [],
    f = l.floor,
    h = l.template === 2 ? 2.6 : 1.9,
    t = l.thickness,
    add = (...v) => a.push(box(...v));
  add(0, f - 0.08, 0, 2, 0.16, 1.7, "floor");
  add(-0.73, h / 2, -0.85, 0.54, h, t);
  add(0.73, h / 2, -0.85, 0.54, h, t);
  add(0, (f + 0.22) / 2, -0.85, 0.92, f + 0.22, t);
  add(0, (h + f + 0.9) / 2, -0.85, 0.92, h - f - 0.9, t);
  add(-1, h / 2, 0, t, h, 1.7);
  const cy = 0.3,
    width = l.frontWidth,
    sill = f + 0.015,
    top = f + 0.88;
  add(
    (-1 + cy - width / 2) / 2,
    (sill + top) / 2,
    0.85,
    cy - width / 2 + 1,
    top - sill,
    t,
  );
  add(
    (cy + width / 2 + 1) / 2,
    (sill + top) / 2,
    0.85,
    1 - cy - width / 2,
    top - sill,
    t,
  );
  add(0, sill / 2, 0.85, 2, sill, t);
  add(0, (h + top) / 2, 0.85, 2, h - top, t);
  const ss = f - 0.04,
    st = f + 1.05,
    w = l.sideWidth;
  add(
    1,
    (ss + st) / 2,
    (-0.85 + 0.15 - w / 2) / 2,
    t,
    st - ss,
    0.15 - w / 2 + 0.85,
  );
  add(
    1,
    (ss + st) / 2,
    (0.15 + w / 2 + 0.85) / 2,
    t,
    st - ss,
    0.85 - 0.15 - w / 2,
  );
  add(1, ss / 2, 0, t, ss, 1.7);
  add(1, (h + st) / 2, 0, t, h - st, 1.7);
  add(0.3, f - 0.015, 0.86, width + 0.12, 0.09, t + 0.2, "sill");
  add(1.01, f - 0.07, 0.15, t + 0.2, 0.09, w + 0.12, "sill");
  if (l.template === 1) {
    add(-0.55, h / 2, 0.5, 0.14, h, 0.14, "pillar");
    add(-0.65, 0.65, 1.13, 0.55, 0.1, 0.55, "awning");
  }
  if (l.id === 8) add(0.65, f + 0.46, 0.68, 0.1, 0.92, 0.1, "pillar");
  if (l.template === 2) {
    add(-0.57, 0.49, 0.89, 0.48, 0.12, 0.14, "trim");
    add(-0.8, 0.48, 0.9, 0.07, 0.7, 0.12, "trim");
    add(-0.34, 0.48, 0.9, 0.07, 0.7, 0.12, "trim");
  }
  add(0, h + 0.01, 0, 2.22, 0.12, 1.95, "eave");
  return a.filter((b) => b.sx > 0 && b.sy > 0 && b.sz > 0);
}
export function makeWorld(level, seed = level.seed) {
  const rng = new PRNG(seed),
    l = structuredClone(level);
  const items = Array.from({ length: 6 }, (_, i) => {
    const type = (l.main + i) % 6,
      def = TYPES[type];
    let p =
      i === 0
        ? [0.3, l.floor + def.r + 0.018, 0.28]
        : [
            [-0.52, -0.27],
            [0.55, -0.46],
            [-0.5, 0.5],
            [0.65, -0.1],
            [-0.05, -0.6],
          ][i - 1];
    if (i) p = [p[0] + rng.range(-0.02, 0.02), l.floor + def.r + 0.018, p[1]];
    return {
      id: i,
      type,
      mass: def.mass,
      r: def.r,
      p,
      v: [0, 0, 0],
      yaw: 0,
      spin: 0,
      stable: 0,
      saved: false,
      wet: 0,
      touched: false,
      phase: rng.range(0, 6.28),
    };
  });
  return {
    level: l,
    seed,
    time: 0,
    water: l.waterStart,
    boat: { x: l.boat[0], z: l.boat[1], vx: 0, vz: 0 },
    items,
    boxes: architecture(l),
    events: [],
    state: "idle",
    active: -1,
    hook: null,
    round: 0,
    reels: 0,
    ended: false,
    success: false,
  };
}
export function rod(w) {
  return [w.boat.x, w.water + 1.35, w.boat.z];
}
export function boatBoxes(w) {
  let b = w.boat,
    y = w.water;
  return [
    box(b.x, y + 0.12, b.z, 0.88, 0.12, 1.65, "deck"),
    box(b.x - 0.49, y + 0.29, b.z, 0.1, 0.32, 1.85, "rail"),
    box(b.x + 0.49, y + 0.29, b.z, 0.1, 0.32, 1.85, "rail"),
    box(b.x, y + 0.29, b.z - 0.9, 0.9, 0.32, 0.1, "rail"),
    box(b.x, y + 0.29, b.z + 0.9, 0.9, 0.32, 0.1, "rail"),
  ];
}
export function balls(o) {
  let c = Math.cos(o.yaw),
    s = Math.sin(o.yaw);
  return TYPES[o.type].shape.map(([x, y, z, r]) => [
    o.p[0] + x * c + z * s,
    o.p[1] + y,
    o.p[2] - x * s + z * c,
    r,
  ]);
}
export function segmentBox(a, b, q, r = 0) {
  let near = 0,
    far = 1;
  const center = [q.x, q.y, q.z],
    size = [q.sx, q.sy, q.sz];
  for (let k = 0; k < 3; k++) {
    let d = b[k] - a[k],
      lo = center[k] - size[k] / 2 - r,
      hi = center[k] + size[k] / 2 + r;
    if (Math.abs(d) < 1e-10) {
      if (a[k] < lo || a[k] > hi) return null;
    } else {
      let t1 = (lo - a[k]) / d,
        t2 = (hi - a[k]) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      near = Math.max(near, t1);
      far = Math.min(far, t2);
      if (near > far) return null;
    }
  }
  return near;
}
function segmentSphere(a, b, c, r) {
  let d = b.map((v, k) => v - a[k]),
    m = a.map((v, k) => v - c[k]),
    A = d.reduce((s, v) => s + v * v, 0),
    B = m.reduce((s, v, k) => s + v * d[k], 0),
    C = m.reduce((s, v) => s + v * v, 0) - r * r;
  if (C < 0) return 0;
  let disc = B * B - A * C;
  if (disc < 0 || A < 1e-10) return null;
  let t = (-B - Math.sqrt(disc)) / A;
  return t >= 0 && t <= 1 ? t : null;
}
export function trace(w, a, b, objects = true) {
  let hit = null,
    t = 2;
  const offer = (v, h) => {
    if (v !== null && v < t) {
      t = v;
      hit = { ...h, t: v, p: a.map((x, k) => x + (b[k] - x) * v) };
    }
  };
  for (const q of w.boxes) offer(segmentBox(a, b, q, 0.018), { kind: q.kind });
  if (a[1] <= w.water) offer(0, { kind: "water" });
  else if (b[1] <= w.water)
    offer((w.water - a[1]) / (b[1] - a[1]), { kind: "water" });
  if (objects)
    for (const o of w.items)
      if (!o.saved)
        for (const c of balls(o))
          offer(segmentSphere(a, b, c, c[3] + 0.02), {
            kind: "item",
            id: o.id,
          });
  return hit;
}
export function blocked(w, o) {
  return trace(w, o.p, rod(w), false);
}
export function trajectory(w, target) {
  const p = rod(w),
    d = Math.hypot(target[0] - p[0], target[2] - p[2]);
  if (d > 4 || d < 0.15 || target[1] <= w.water) return null;
  const t = Math.max(0.18, d / 6.8),
    v = [
      (target[0] - p[0]) / t,
      (target[1] - p[1] + (G * t * t) / 2) / t,
      (target[2] - p[2]) / t,
    ];
  if (Math.hypot(...v) > 11) return null;
  return { p: [...p], v, age: 0 };
}
export function preview(w, target) {
  const h = trajectory(w, target);
  if (!h) return { points: [], hit: null };
  const points = [[...h.p]];
  for (let i = 0; i < 180; i++) {
    let n = h.p.map(
        (x, k) => x + h.v[k] * DT - (k === 1 ? (G * DT * DT) / 2 : 0),
      ),
      hit = trace(w, h.p, n);
    if (hit) {
      points.push(hit.p);
      return { points, hit };
    }
    h.p = n;
    h.v[1] -= G * DT;
    if (i % 3 === 0) points.push([...n]);
  }
  return { points, hit: null };
}
export function cast(w, target) {
  if (w.ended || w.state !== "idle" || Math.hypot(w.boat.vx, w.boat.vz) > 0.08)
    return false;
  const h = trajectory(w, target);
  if (!h) return false;
  w.state = "windup";
  w.hook = h;
  w.round = 0;
  w.events.push({ kind: "cast" });
  return true;
}
export function cancel(w) {
  if (w.state === "flight") return false;
  w.state = "return";
  w.round = 0;
  w.active = -1;
  return true;
}
export function reel(w) {
  if (w.state !== "hooked") return false;
  const o = w.items[w.active],
    hit = blocked(w, o);
  if (hit) {
    w.events.push({ kind: "blocked", p: hit.p });
    return false;
  }
  o.resting = false;
  const p = rod(w),
    d = p.map((v, k) => v - o.p[k]),
    len = Math.hypot(...d);
  for (let k = 0; k < 3; k++) o.v[k] += ((d[k] / len) * IMPULSE) / o.mass;
  o.spin += 0.12;
  w.state = "flight";
  w.round = 0;
  w.reels++;
  w.events.push({ kind: "reel" });
  return true;
}
function resolve(o, q, h) {
  let contact = false;
  for (const b of balls(o)) {
    let center = [q.x, q.y, q.z],
      size = [q.sx, q.sy, q.sz],
      closest = b
        .slice(0, 3)
        .map((v, k) =>
          clamp(v, center[k] - size[k] / 2, center[k] + size[k] / 2),
        );
    let n = closest.map((v, k) => b[k] - v),
      d = Math.hypot(...n);
    if (d >= b[3]) continue;
    if (d < 1e-9) {
      let gaps = size.map((v, k) => v / 2 - Math.abs(b[k] - center[k]));
      let k = gaps.indexOf(Math.min(...gaps));
      n = [0, 0, 0];
      n[k] = b[k] >= center[k] ? 1 : -1;
      d = 0;
    } else n = n.map((v) => v / d);
    const depth = b[3] - d + 0.00001;
    for (let k = 0; k < 3; k++) o.p[k] += n[k] * depth;
    let vn = o.v.reduce((s, v, k) => s + v * n[k], 0);
    if (vn < 0) {
      for (let k = 0; k < 3; k++) o.v[k] -= 1.18 * vn * n[k];
      if (n[1] > 0.5) {
        o.v[0] *= Math.exp(-h * 35);
        o.v[2] *= Math.exp(-h * 35);
        o.spin *= Math.exp(-h * 18);
        if (Math.abs(o.v[1]) < 0.12) o.v[1] = 0;
      }
    }
    if (q.kind === "deck" && n[1] > 0.5) contact = true;
  }
  return contact;
}
export function step(w, dt = DT, input = [0, 0]) {
  if (w.ended) return;
  w.time += dt;
  const l = w.level;
  w.water =
    l.waterStart +
    (l.waterEnd - l.waterStart) *
      Math.pow(clamp(w.time / 90, 0, 1), l.waterPower);
  let b = w.boat;
  const free = w.state === "idle",
    decay = Math.exp(-4.6 * dt);
  b.vx = (b.vx + (free ? input[0] * 3.84 * dt : 0)) * decay;
  b.vz = (b.vz + (free ? input[1] * 3.84 * dt : 0)) * decay;
  let nx = clamp(b.x + b.vx * dt, -l.bounds, l.bounds),
    nz = clamp(b.z + b.vz * dt, -l.bounds, l.bounds);
  if (!(Math.abs(nx) < 1.65 && Math.abs(nz) < 1.95)) {
    b.x = nx;
    b.z = nz;
  } else b.vx = b.vz = 0;
  w.round += dt;
  if (w.state === "windup" && w.round >= 0.16) w.state = "cast";
  if (w.state === "cast") {
    const h = w.hook,
      n = h.p.map(
        (x, k) => x + h.v[k] * dt - (k === 1 ? (G * dt * dt) / 2 : 0),
      ),
      hit = trace(w, h.p, n);
    h.v[1] -= G * dt;
    h.age += dt;
    if (hit) {
      h.p = hit.p;
      if (hit.kind === "item") {
        w.active = hit.id;
        w.state = "hooked";
        w.events.push({ kind: "hook", id: hit.id });
      } else {
        w.state = "return";
        w.round = 0;
        w.events.push({
          kind: hit.kind === "water" ? "splash" : "knock",
          p: hit.p,
        });
      }
    } else h.p = n;
    if (h.age > 2) {
      w.state = "return";
      w.round = 0;
    }
  }
  if (w.state === "return" && w.round >= 0.24) {
    w.state = "idle";
    w.hook = null;
    w.active = -1;
  }
  const bb = boatBoxes(w);
  for (const o of w.items) {
    if (o.saved) continue;
    if (o.resting && w.water < o.p[1] - o.r - 0.015) continue;
    o.resting = false;
    const subdivisions = Math.max(
        1,
        Math.ceil((Math.hypot(...o.v) * dt) / 0.025),
      ),
      h = dt / subdivisions;
    let deck = false;
    for (let sub = 0; sub < subdivisions; sub++) {
      o.v[1] -= G * h;
      const depth = w.water - (o.p[1] - o.r);
      if (depth > 0) {
        const lift = clamp(depth / (o.r * 1.5), 0, 1.7) * G * 1.4;
        o.v[1] += lift * h;
        o.v[1] *= Math.exp(-5 * h);
        o.v[0] +=
          (Math.sin(w.time * 0.43 + o.phase) * l.drift - o.v[0] * 1.1) * h;
        o.v[2] +=
          (Math.cos(w.time * 0.37 + o.phase) * l.drift - o.v[2] * 1.1) * h;
        o.spin *= Math.exp(-3 * h);
        o.wet = clamp(o.wet + h / 0.18, 0, 1);
        if (!o.inWater) {
          o.inWater = true;
          o.touched = true;
          w.events.push({ kind: "splash", p: [...o.p] });
          if (w.state === "flight" && w.active === o.id) {
            w.state = "return";
            w.round = 0;
          }
        }
      } else {
        o.inWater = false;
      }
      for (let k = 0; k < 3; k++) o.p[k] += o.v[k] * h;
      o.yaw += o.spin * h;
      for (const q of w.boxes) resolve(o, q, h);
      for (const q of bb) deck = resolve(o, q, h) || deck;
    }
    const inside =
        Math.abs(o.p[0] - b.x) < 0.44 - o.r &&
        Math.abs(o.p[2] - b.z) < 0.8 - o.r,
      slow =
        Math.hypot(o.v[0] - b.vx, o.v[1], o.v[2] - b.vz) < 0.15 &&
        Math.abs(o.spin) < 0.5;
    o.stable = deck && inside && slow ? o.stable + dt : 0;
    if (o.stable >= 0.35) {
      o.saved = true;
      w.events.push({ kind: "saved", id: o.id, type: o.type });
      if (w.active === o.id) {
        w.state = "return";
        w.round = 0;
      }
      if (o.id === 0) w.success = true;
    }
    if (Math.abs(o.p[0]) > l.bounds + 1 || Math.abs(o.p[2]) > l.bounds + 1) {
      o.p[0] = clamp(o.p[0], -l.bounds - 0.8, l.bounds + 0.8);
      o.p[2] = clamp(o.p[2], -l.bounds - 0.8, l.bounds + 0.8);
      o.v = [0, 0, 0];
      if (w.active === o.id) {
        w.state = "return";
        w.round = 0;
      }
    }
    if (!deck && Math.hypot(...o.v) < 0.03 && o.p[1] - o.r > w.water + 0.015)
      o.resting = true;
    if (
      w.state === "flight" &&
      w.active === o.id &&
      w.round > 0.65 &&
      Math.hypot(...o.v) < 0.08
    ) {
      w.state = "return";
      w.round = 0;
    }
  }
  for (let i = 0; i < w.items.length; i++)
    for (let j = i + 1; j < w.items.length; j++) {
      const a = w.items[i],
        b = w.items[j];
      if (a.saved || b.saved || (a.resting && b.resting)) continue;
      const dx = b.p[0] - a.p[0],
        dy = b.p[1] - a.p[1],
        dz = b.p[2] - a.p[2],
        d = Math.hypot(dx, dy, dz),
        r = a.r + b.r;
      if (d > 0 && d < r) {
        const n = [dx / d, dy / d, dz / d],
          overlap = r - d,
          inv = 1 / a.mass + 1 / b.mass;
        for (let k = 0; k < 3; k++) {
          a.p[k] -= (n[k] * overlap) / (a.mass * inv);
          b.p[k] += (n[k] * overlap) / (b.mass * inv);
        }
        let rel = n.reduce((s, v, k) => s + (b.v[k] - a.v[k]) * v, 0);
        if (rel < 0) {
          const impulse = (-1.18 * rel) / inv;
          for (let k = 0; k < 3; k++) {
            a.v[k] -= (n[k] * impulse) / a.mass;
            b.v[k] += (n[k] * impulse) / b.mass;
          }
        }
        a.resting = b.resting = false;
      }
    }
  if (w.state === "flight" && w.round > 6) {
    w.state = "return";
    w.round = 0;
  }
  if (w.time >= 90 || w.items.every((o) => o.saved)) {
    w.ended = true;
    w.state = "ended";
    w.events.push({ kind: "end", success: w.success });
  }
}
// Witness checks use exactly the same cast, impulse, collision and landing rules.
export function runRoute(level, seed, route) {
  const w = makeWorld(level, seed);
  for (const target of [
    [route.x, w.boat.z],
    [route.x, route.z],
  ]) {
    for (let i = 0; i < 2400; i++) {
      const b = w.boat,
        dx = target[0] - b.x,
        dz = target[1] - b.z;
      if (Math.hypot(dx, dz) < 0.012 && Math.hypot(b.vx, b.vz) < 0.025) break;
      step(w, DT, [
        clamp(dx * 5 - b.vx * 2, -1, 1),
        clamp(dz * 5 - b.vz * 2, -1, 1),
      ]);
    }
  }
  for (let i = 0; i < 120 || w.time < (route.wait || 0); i++) step(w);
  if (
    !cast(
      w,
      w.items[0].p.map((v, k) => v + (k === 1 ? 0.08 : 0)),
    )
  )
    return { ok: false, why: "range" };
  for (let i = 0; i < 300 && ["windup", "cast"].includes(w.state); i++) step(w);
  if (w.state !== "hooked" || w.active !== 0) return { ok: false, why: "cast" };
  if (!reel(w)) return { ok: false, why: "blocked" };
  for (let i = 0; i < 720 && !w.items[0].saved; i++) step(w);
  return {
    ok: w.items[0].saved,
    why: w.items[0].saved ? "landed" : "landing",
    time: w.time,
    p: w.items[0].p,
  };
}
export function findRoutes(l, seed) {
  if (l.routes?.length === 2 && l.routes.every((r) => runRoute(l, seed, r).ok))
    return structuredClone(l.routes);
  let routes = [];
  for (const side of ["front", "side"]) {
    let found = null;
    for (let d = 1.95; d <= 4.2 && !found; d += 0.06) {
      let route =
        side === "front"
          ? { x: 0.3, z: d, wait: 1, side }
          : { x: d, z: 0.28, wait: 8, side };
      if (runRoute(l, seed, route).ok) found = route;
    }
    if (found) routes.push(found);
  }
  return routes;
}
export function procedural(seed) {
  const rng = new PRNG(seed),
    base = LEVELS[Math.floor(rng.next() * 12)];
  for (let attempt = 0; attempt < 4; attempt++) {
    let l = structuredClone(base);
    l.name = "漂来的旧日";
    l.seed = seed;
    l.frontWidth = clamp(l.frontWidth + rng.range(-0.06, 0.12), 0.72, 1.12);
    l.sideWidth = clamp(l.sideWidth + rng.range(-0.05, 0.1), 1.1, 1.3);
    l.drift = rng.range(0.005, 0.025);
    l.waterPower = rng.range(0.9, 1.3);
    l.routes = findRoutes(l, seed);
    if (l.routes.length === 2) return l;
  }
  let l = structuredClone(LEVELS[0]);
  l.name = "漂来的旧日";
  l.seed = seed;
  l.routes = findRoutes(l, seed);
  l.fallback = true;
  return l;
}
