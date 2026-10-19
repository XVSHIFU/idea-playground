// Toon gradient, reverse shell and PRNG adapted from lantern-way/shared.js.
// Local copy: this work never imports another project's files.
import * as THREE from "three";
import * as C from "cannon-es";
export const DT = 1 / 120,
  N = 20,
  ROPE_R = 0.035;
export class PRNG {
  constructor(seed = 1) {
    this.s = seed >>> 0;
  }
  next() {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
export function makeToonGradient() {
  const c = document.createElement("canvas");
  c.width = 3;
  c.height = 1;
  const x = c.getContext("2d");
  [90, 180, 255].forEach((v, i) => {
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(i, 0, 1, 1);
  });
  const t = new THREE.CanvasTexture(c);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
export function outlineGeometry(g, w = 0.018) {
  const o = g.clone(),
    p = o.attributes.position,
    n = o.attributes.normal,
    sums = new Map(),
    keys = [];
  for (let i = 0; i < p.count; i++) {
    const key = `${Math.round(p.getX(i) * 1e5)},${Math.round(p.getY(i) * 1e5)},${Math.round(p.getZ(i) * 1e5)}`;
    keys.push(key);
    let sum = sums.get(key);
    if (!sum) {
      sum = new THREE.Vector3();
      sums.set(key, sum);
    }
    sum.x += n.getX(i);
    sum.y += n.getY(i);
    sum.z += n.getZ(i);
  }
  for (const sum of sums.values()) sum.normalize();
  for (let i = 0; i < p.count; i++) {
    const sn = sums.get(keys[i]);
    p.setXYZ(
      i,
      p.getX(i) + sn.x * w,
      p.getY(i) + sn.y * w,
      p.getZ(i) + sn.z * w,
    );
  }
  return o;
}
export const names = [
  "先走两步",
  "侧一点",
  "鼻子过去了",
  "角还没过",
  "低低头",
  "抬一下",
  "前脚先过",
  "退半步",
  "手从上面走",
  "牛从下面过",
  "绳别贴着",
  "歪着也行",
  "绕到旁边",
  "从杆头走",
  "松开一点",
  "换个方向",
  "门在后面",
  "一个高一个低",
  "斜着借过",
  "先松再拉",
  "两根横杆",
  "别拉太直",
  "留一点松",
  "借过一下",
];
// Every layout is explicit; seed mode selects a layout and a complete mirror.
const layouts = [
  [1.4, 1.7, 0, 0, 0, 0],
  [1.25, 1.7, 0.12, 0.2, 0, 0],
  [1.1, 1.65, -0.1, -0.15, 0, 0],
  [0.98, 1.6, 0.18, 0, 0, 0],
  [1.3, 1.5, 0, 0.15, 1, 0],
  [1.2, 1.65, 0.1, -0.2, 1, 0],
  [1.15, 1.6, -0.14, 0.2, 1, 0],
  [1.2, 1.55, 0.17, -0.25, 1, -0.35],
  [1.3, 1.72, 0, 0, 1, 0],
  [1.2, 1.7, 0.1, 0.18, 1, 0],
  [1.18, 1.68, -0.12, -0.2, 1, 0],
  [1.16, 1.7, 0.22, 0.25, 1, 0],
  [1.3, 1.7, -0.2, 0.3, 1, 0.45],
  [1.25, 1.7, 0.2, -0.3, 1, -0.4],
  [1.22, 1.65, -0.17, 0.25, 1, 0.3],
  [1.2, 1.72, 0.18, -0.25, 1, -0.3],
  [1.3, 1.7, -0.18, 0.15, 1, 0],
  [1.28, 1.75, 0.12, -0.2, 2, 0],
  [1.2, 1.7, 0.25, 0.2, 1, 0.2],
  [1.25, 1.65, -0.2, -0.2, 1, -0.2],
  [1.3, 1.75, 0, 0, 2, 0],
  [1.26, 1.7, 0.14, 0.2, 2, 0.2],
  [1.3, 1.75, -0.14, -0.2, 2, -0.2],
  [1.22, 1.7, 0.18, 0.15, 2, 0],
];
export function level(index = 0, seed = 101 + index, mirror = 1) {
  const [w, h, angle, z, bars, off] = layouts[index % 24];
  const cy = h - 0.25,
    gate = [];
  const az = angle * mirror,
    cz = z * mirror;
  const map = (y, zz, x = 0) => [
    x + Math.sin(az) * (zz - cz),
    y,
    cz + Math.cos(az) * (zz - cz),
  ];
  for (let i = 0; i < 28; i++) {
    let t = (i / 28) * Math.PI * 2,
      u = ((i + 1) / 28) * Math.PI * 2;
    gate.push({
      a: map(cy + h * Math.sin(t), cz + w * Math.cos(t)),
      b: map(cy + h * Math.sin(u), cz + w * Math.cos(u)),
      r: 0.115,
      kind: "gate",
    });
  }
  const rods = [];
  if (bars)
    rods.push({
      a: [0.35, 1.95, (-0.78 + off) * mirror],
      b: [0.35, 1.95, (0.78 + off) * mirror],
      r: 0.115,
      kind: "rod",
    });
  if (bars === 2)
    rods.push({
      a: [1.35, 2.18, -0.85 * mirror],
      b: [1.35, 2.18, 0.85 * mirror],
      r: 0.115,
      kind: "rod",
    });
  for (const o of rods)
    for (const p of [o.a])
      gate.push({ a: [p[0], 0, p[2]], b: p, r: 0.06, kind: "post" });
  const spawn = [-2.65, 0.65, cz - 0.15 * mirror];
  const ropeLength = 4.1;
  return {
    id: index + 1,
    name: names[index],
    seed,
    mirror,
    spawn,
    yaw: az,
    ropeLength,
    gate,
    rods,
    exit: 1.15,
    handBounds: { min: [-5, 0.22, -3.4], max: [6.5, 2.85, 3.4] },
    w,
    h,
    cz,
    angle: az,
    witnesses: {
      high: [
        { t: 0, p: [-1.05, 0.4, cz] },
        { t: 2, p: [-0.4, 2.8, cz + 0.15 * mirror] },
        { t: 5, p: [2.6, 2.8, cz + (bars ? 2.5 : 0.2) * mirror] },
        { t: 9, p: [6.5, 2.55, cz + (bars ? 2.5 : 0.2) * mirror] },
        { t: 15, p: [6.5, 0.85, cz] },
      ],
      low: [
        { t: 0, p: [-1.05, 0.4, cz] },
        { t: 2, p: [-0.3, 0.75, cz + (index === 7 ? 0.2 : -0.35) * mirror] },
        { t: 3, p: null },
        { t: 3.3, p: [-0.3, 0.75, cz + (index === 7 ? 0.2 : -0.35) * mirror] },
        { t: 7, p: [3.2, 0.8, cz + (index === 7 ? 0.1 : -0.15) * mirror] },
        { t: 12, p: [6.5, 0.85, cz] },
        { t: 18, p: [6.5, 0.85, cz] },
      ],
    },
  };
}
export function seeded(seed) {
  const r = new PRNG(seed);
  return level(Math.floor(r.next() * 24), seed, r.next() < 0.5 ? -1 : 1);
}
const v = (a) => new C.Vec3(...a);
// Ellipsoid hulls are shared by collision and rendering; no shrinking on contact.
export const anatomy = [
  { c: [-0.13, 0.18, 0], s: [0.7, 0.51, 0.43], color: "cream", part: "body" },
  { c: [0.49, 0.38, 0], s: [0.39, 0.37, 0.34], color: "cream", part: "head" },
  { c: [0.79, 0.2, 0], s: [0.28, 0.21, 0.33], color: "pink", part: "nose" },
  ...[-1, 1].map((k) => ({
    c: [0.44, 0.72, k * 0.27],
    s: [0.1, 0.17, 0.1],
    color: "horn",
    part: "horn",
  })),
  ...[-0.48, 0.43].flatMap((x) =>
    [-1, 1].map((k) => ({
      c: [x, -0.29, k * 0.29],
      s: [0.125, 0.16, 0.125],
      color: "dark",
      part: "hoof",
    })),
  ),
];
function ellipsoid(s) {
  const vs = [],
    fs = [],
    rings = 6,
    segs = 10;
  vs.push(new C.Vec3(0, s[1], 0));
  for (let j = 1; j < rings; j++)
    for (let i = 0; i < segs; i++) {
      const a = (j / rings) * Math.PI,
        b = (i / segs) * Math.PI * 2;
      vs.push(
        new C.Vec3(
          Math.sin(a) * Math.cos(b) * s[0],
          Math.cos(a) * s[1],
          Math.sin(a) * Math.sin(b) * s[2],
        ),
      );
    }
  const bot = vs.length;
  vs.push(new C.Vec3(0, -s[1], 0));
  for (let i = 0; i < segs; i++) fs.push([0, 1 + ((i + 1) % segs), 1 + i]);
  for (let j = 0; j < rings - 2; j++)
    for (let i = 0; i < segs; i++) {
      let a = 1 + j * segs + i,
        b = 1 + j * segs + ((i + 1) % segs);
      fs.push([a, b, b + segs, a + segs]);
    }
  for (let i = 0; i < segs; i++)
    fs.push([
      bot,
      1 + (rings - 2) * segs + i,
      1 + (rings - 2) * segs + ((i + 1) % segs),
    ]);
  return new C.ConvexPolyhedron({ vertices: vs, faces: fs });
}
class Cable extends C.DistanceConstraint {
  constructor(a, b, d) {
    super(a, b, d, 140);
    this.distanceEquation.maxForce = 0;
    this.distanceEquation.setSpookParams(2e8, 4, DT);
  }
  update() {
    super.update();
    this.distanceEquation.enabled =
      this.bodyA.position.distanceTo(this.bodyB.position) >
      this.distance * 0.985;
  }
}
// Closest pair on two finite segments. Entire rope spans, not just node samples.
const q1 = new THREE.Vector3(),
  q2 = new THREE.Vector3(),
  u = new THREE.Vector3(),
  vv = new THREE.Vector3(),
  ww = new THREE.Vector3();
export function closest(a, b, c, d, out) {
  u.copy(b).sub(a);
  vv.copy(d).sub(c);
  ww.copy(a).sub(c);
  const A = u.dot(u),
    B = u.dot(vv),
    D = u.dot(ww),
    E = vv.dot(ww),
    F = vv.dot(vv),
    den = A * F - B * B;
  let s = den > 1e-10 ? THREE.MathUtils.clamp((B * E - D * F) / den, 0, 1) : 0,
    t = F > 0 ? (B * s + E) / F : 0;
  if (t < 0) {
    t = 0;
    s = THREE.MathUtils.clamp(-D / A, 0, 1);
  } else if (t > 1) {
    t = 1;
    s = THREE.MathUtils.clamp((B - D) / A, 0, 1);
  }
  q1.copy(a).addScaledVector(u, s);
  q2.copy(c).addScaledVector(vv, t);
  out.copy(q1).sub(q2);
  return s;
}
// Segment contacts participate in the same iterative velocity solve as the rigid
// body and unilateral cable constraints. Barycentric Jacobians distribute the
// reaction across BOTH endpoints of the complete span.
class SpanEquation extends C.Equation {
  constructor(a, b) {
    super(a, b, 0, 100);
    this.n = new THREE.Vector3();
    this.t = 0;
    this.g = 0;
    this.setSpookParams(1e8, 4, DT);
  }
  computeB(h) {
    const wa = 1 - this.t,
      wb = this.t,
      n = this.n;
    this.jacobianElementA.spatial.set(n.x * wa, n.y * wa, n.z * wa);
    this.jacobianElementB.spatial.set(n.x * wb, n.y * wb, n.z * wb);
    return (
      -this.g * this.a - this.computeGW() * this.b - h * this.computeGiMf()
    );
  }
}
class SpanContacts extends C.Constraint {
  constructor(nodes, obs) {
    super(nodes[0], nodes[N], { collideConnected: true });
    this.cache = [];
    for (let i = 0; i < N; i++)
      for (const o of obs)
        this.cache.push({ eq: new SpanEquation(nodes[i], nodes[i + 1]), o });
    this.count = 0;
  }
  update() {
    this.equations.length = 0;
    this.count = 0;
    for (const { eq, o } of this.cache) {
      eq.t = closest(eq.bi.position, eq.bj.position, o.a, o.b, eq.n);
      const d = eq.n.length();
      eq.g = d - o.r - ROPE_R;
      if (d > 1e-7 && eq.g < 0.025) {
        eq.n.multiplyScalar(1 / d);
        this.equations.push(eq);
        if (eq.g < 0.002) this.count++;
      }
    }
  }
}
export class Simulation {
  constructor(l) {
    this.reset(l);
  }
  reset(l) {
    this.level = l;
    this.time = 0;
    this.grabbed = false;
    this.grips = 0;
    this.won = false;
    this.contact = 0;
    this.tension = 0;
    this.segmentContacts = 0;
    const world = (this.world = new C.World({
      gravity: new C.Vec3(0, -9.81, 0),
    }));
    world.solver.iterations = 22;
    world.solver.tolerance = 1e-5;
    world.broadphase = new C.SAPBroadphase(world);
    world.defaultContactMaterial.friction = 0.0004;
    world.defaultContactMaterial.restitution = 0;
    world.defaultContactMaterial.contactEquationStiffness = 1e8;
    const floor = new C.Body({
      mass: 0,
      shape: new C.Plane(),
      collisionFilterGroup: 1,
      collisionFilterMask: 6,
    });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floor);
    this.obstacles = [...l.gate, ...l.rods];
    this.obstacleVectors = this.obstacles.map((o) => ({
      ...o,
      a: v(o.a),
      b: v(o.b),
    }));
    for (const o of this.obstacleVectors) {
      const body = new C.Body({
          mass: 0,
          collisionFilterGroup: 1,
          collisionFilterMask: 6,
        }),
        delta = o.b.vsub(o.a),
        len = delta.length(),
        mid = o.a.vadd(o.b).scale(0.5),
        rot = new C.Quaternion();
      delta.normalize();
      rot.setFromVectors(new C.Vec3(0, 1, 0), delta);
      body.addShape(new C.Cylinder(o.r, o.r, len, 10), mid, rot);
      body.addShape(new C.Sphere(o.r), o.a);
      world.addBody(body);
    }
    // Explicit physical rail boundary, not a flight rule. The ground has raised edges.
    for (const [pos, half] of [
      [
        [-6, 0.12, 0],
        [0.12, 0.25, 4],
      ],
      [
        [7, 0.12, 0],
        [0.12, 0.25, 4],
      ],
      [
        [0.5, 0.12, -4],
        [6.5, 0.25, 0.12],
      ],
      [
        [0.5, 0.12, 4],
        [6.5, 0.25, 0.12],
      ],
    ])
      world.addBody(
        new C.Body({
          mass: 0,
          shape: new C.Box(v(half)),
          position: v(pos),
          collisionFilterGroup: 1,
          collisionFilterMask: 6,
        }),
      );
    const cow = (this.cow = new C.Body({
      mass: 5,
      position: v(l.spawn),
      linearDamping: 0.18,
      angularDamping: 0.85,
      collisionFilterGroup: 2,
      collisionFilterMask: 1,
    }));
    cow.quaternion.setFromEuler(0, l.yaw, 0);
    for (const a of anatomy) cow.addShape(ellipsoid(a.s), v(a.c));
    world.addBody(cow);
    this.core = anatomy.flatMap((a) => {
      const sh = ellipsoid(a.s);
      return sh.vertices.map((p) => p.vadd(v(a.c)));
    });
    this.anchor = new C.Vec3(0.53, 0.16, 0);
    const start = cow.pointToWorldFrame(this.anchor);
    this.nodes = [];
    this.cables = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const node = new C.Body({
        mass: 0.045,
        shape: new C.Sphere(ROPE_R),
        position: new C.Vec3(
          start.x + t * 1.15,
          Math.max(0.07, start.y - Math.sin(t * Math.PI) * 0.65 - t * 0.4),
          start.z + Math.sin(t * Math.PI) * 0.2,
        ),
        linearDamping: 0.12,
        angularDamping: 1,
        collisionFilterGroup: 4,
        collisionFilterMask: 1,
      });
      world.addBody(node);
      this.nodes.push(node);
      if (i) {
        const cable = new Cable(this.nodes[i - 1], node, l.ropeLength / N);
        world.addConstraint(cable);
        this.cables.push(cable);
      }
    }
    this.spans = new SpanContacts(this.nodes, this.obstacleVectors);
    world.addConstraint(this.spans);
    world.addConstraint(
      new C.PointToPointConstraint(
        cow,
        this.anchor,
        this.nodes[0],
        new C.Vec3(),
        200,
      ),
    );
    this.end = this.nodes[N];
    this.target = this.end.position.clone();
    this.hand = this.end.position.clone();
    this.tmp = new C.Vec3();
    this.normal = new THREE.Vector3();
  }
  grab() {
    if (!this.grabbed) {
      this.grabbed = true;
      this.grips++;
      this.target.copy(this.end.position);
      this.hand.copy(this.end.position);
    }
  }
  release() {
    this.grabbed = false;
  }
  setTarget(a) {
    const b = this.level.handBounds;
    this.target.set(
      ...a.map((x, i) => Math.min(b.max[i], Math.max(b.min[i], x))),
    );
  }
  step() {
    const h = DT;
    this.time += h;
    if (this.grabbed) {
      this.target.vsub(this.hand, this.tmp);
      const d = this.tmp.length();
      if (d > 0)
        this.hand.vadd(this.tmp.scale(Math.min(1, (3.9 * h) / d)), this.hand);
      // Bounded spring force: target movement never teleports the endpoint.
      const omega = 2 / 0.09,
        k = 150,
        damper = 2 * 0.8 * Math.sqrt(150 * 0.18);
      this.hand.vsub(this.end.position, this.tmp);
      this.tmp.scale(k, this.tmp);
      this.tmp.x -= damper * this.end.velocity.x;
      this.tmp.y -= damper * this.end.velocity.y;
      this.tmp.z -= damper * this.end.velocity.z;
      const f = this.tmp.length();
      if (f > 30) this.tmp.scale(30 / f, this.tmp);
      this.end.force.vadd(this.tmp, this.end.force);
    }
    this.world.step(h);
    this.segmentContacts = this.spans.count;
    this.contact = 0;
    for (const c of this.world.contacts)
      if (c.bi === this.cow || c.bj === this.cow) {
        if (Math.abs(c.ni.y) < 0.8)
          this.contact = Math.max(
            this.contact,
            Math.min(1, Math.abs(c.multiplier) / 60),
          );
      }
    this.tension = Math.min(
      1,
      Math.abs(this.cables[0].distanceEquation.multiplier) / 35,
    );
    if (
      !this.won &&
      this.core.every(
        (p) => this.cow.pointToWorldFrame(p, this.tmp).x > this.level.exit,
      )
    )
      this.won = true;
  }
  state() {
    return {
      position: this.cow.position.toArray(),
      quaternion: this.cow.quaternion.toArray(),
      end: this.end.position.toArray(),
      won: this.won,
      grabbed: this.grabbed,
      tension: this.tension,
      grips: this.grips,
      segmentContacts: this.segmentContacts,
      time: this.time,
    };
  }
}
