import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { assembled, part, cube, ball, Spring, disposeGroup } from "./shared.js";
import {
  LEVELS,
  TYPES,
  DT,
  G,
  PRNG,
  clamp,
  makeWorld,
  step,
  rod,
  balls,
  preview,
  cast,
  reel,
  cancel,
  blocked,
  procedural,
} from "./physics.js";
const $ = (id) => document.getElementById(id),
  C = {
    wall: "#D3C9B2",
    roof: "#655C55",
    wood: "#756052",
    ink: "#15191C",
    water: "#46545D",
    foam: "#9BA7A8",
    red: "#B97758",
  };
const store = {
  get(k, d) {
    try {
      return JSON.parse(localStorage.getItem("last-cast:" + k)) ?? d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("last-cast:" + k, JSON.stringify(v));
    } catch {}
  },
};
const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
renderer.setClearColor("#252C31");
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFShadowMap;
renderer.info.autoReset = false;
$("view").append(renderer.domElement);
const canvas = renderer.domElement;
const scene = new T.Scene(),
  camera = new T.OrthographicCamera(-5, 5, 4, -4, 0.1, 70);
camera.position.set(3.8, 6.7, 10);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.45, 0.6);
controls.enablePan = false;
controls.enableDamping = true;
controls.minPolarAngle = (35 * Math.PI) / 180;
controls.maxPolarAngle = (70 * Math.PI) / 180;
controls.minZoom = 0.8;
controls.maxZoom = 1.7;
controls.mouseButtons = {
  LEFT: null,
  MIDDLE: T.MOUSE.DOLLY,
  RIGHT: T.MOUSE.ROTATE,
};
controls.touches = { ONE: null, TWO: T.TOUCH.DOLLY_ROTATE };
controls.update();
const original = camera.position.clone();
scene.add(new T.AmbientLight("#dbe1df", 1.65));
const light = new T.DirectionalLight("#fff0d6", 2.5);
light.position.set(-3, 7, 5);
light.castShadow = true;
light.shadow.mapSize.set(
  innerWidth < 650 ? 1024 : 2048,
  innerWidth < 650 ? 1024 : 2048,
);
Object.assign(light.shadow.camera, {
  left: -5,
  right: 5,
  top: 5,
  bottom: -5,
  near: 0.5,
  far: 20,
});
light.shadow.bias = -0.001;
light.shadow.normalBias = 0.018;
scene.add(light);
const dynamic = new T.Group();
scene.add(dynamic);
const water = new T.Mesh(
  new T.PlaneGeometry(20, 20),
  new T.MeshToonMaterial({ color: C.water }),
);
water.rotation.x = -Math.PI / 2;
water.receiveShadow = true;
scene.add(water);
let world,
  levelIndex = clamp(store.get("level", 0), 0, 11),
  seed = store.get("seed", LEVELS[levelIndex].seed),
  endless = false,
  running = false,
  paused = false,
  mode = "fish",
  outlines = true,
  autoOrbit = false,
  aim = null,
  aiming = false,
  acc = 0,
  previous = performance.now(),
  entryTime = 0,
  endTime = 0,
  lastState = "",
  toastUntil = 0;
let house,
  boat,
  figures = [],
  items = [],
  rodMesh,
  arms,
  foams,
  pickables = [],
  soundOn = store.get("sound", true),
  sound = null;
const rodSpring = new Spring(0, 0.24, 0.65),
  lean = new Spring(0, 0.5, 0.9),
  boatTilt = new Spring(0, 0.65, 0.85);
let presentationTime = 0;
const keys = new Set(),
  pointers = new Map();
let joystick = [0, 0],
  joystickPointer = null;
const lineGeo = new T.BufferGeometry().setFromPoints([
  new T.Vector3(),
  new T.Vector3(),
  new T.Vector3(),
]);
const fishingLine = new T.Line(
  lineGeo,
  new T.LineBasicMaterial({ color: C.wall }),
);
scene.add(fishingLine);
const arcGeo = new T.BufferGeometry();
arcGeo.setAttribute(
  "position",
  new T.BufferAttribute(new Float32Array(600), 3),
);
const arc = new T.Line(
  arcGeo,
  new T.LineDashedMaterial({ color: C.wall, dashSize: 0.045, gapSize: 0.035 }),
);
arc.frustumCulled = false;
scene.add(arc);
arc.visible = false;
const targetRing = new T.Mesh(
  new T.RingGeometry(0.08, 0.095, 24),
  new T.MeshBasicMaterial({ color: C.red, side: T.DoubleSide }),
);
scene.add(targetRing);
targetRing.visible = false;
const hook = new T.Mesh(
  new T.TorusGeometry(0.025, 0.007, 4, 9, Math.PI * 1.6),
  new T.MeshToonMaterial({ color: C.wall }),
);
scene.add(hook);
const droplets = new T.InstancedMesh(
  ball(0.018),
  new T.MeshToonMaterial({ color: C.foam }),
  36,
);
droplets.instanceMatrix.setUsage(T.DynamicDrawUsage);
scene.add(droplets);
const particles = Array.from({ length: 36 }, () => ({
    life: 0,
    p: [0, 0, 0],
    v: [0, 0, 0],
  })),
  dummy = new T.Object3D();
let particleNext = 0;
const ray = new T.Raycaster(),
  pointer = new T.Vector2(),
  plane = new T.Plane(new T.Vector3(0, 1, 0), 0),
  tmp = new T.Vector3();
function b(parts, s, p, color = C.wood, rot) {
  parts.push(part(cube(s), color, p, [1, 1, 1], rot));
}
function s(parts, r, p, color = C.wall, scale = [1, 1, 1]) {
  parts.push(part(ball(r), color, p, scale));
}
function cyl(parts, r1, r2, h, p, color = C.wood, rot = [0, 0, 0]) {
  parts.push(
    part(new T.CylinderGeometry(r1, r2, h, 8), color, p, [1, 1, 1], rot),
  );
}
function houseModel() {
  let p = [];
  for (const q of world.boxes)
    b(
      p,
      [q.sx, q.sy, q.sz],
      [q.x, q.y, q.z],
      ["floor", "sill", "pillar", "eave", "trim", "awning"].includes(q.kind)
        ? C.wood
        : C.wall,
    );
  let h = world.level.template === 2 ? 2.6 : 1.9;
  // A pitched roof, with round ridge ends and individually readable timber trim.
  b(p, [1.36, 0.13, 2.03], [-0.55, h + 0.32, 0], C.roof, [0, 0, 0.47]);
  b(p, [1.36, 0.13, 2.03], [0.55, h + 0.32, 0], C.roof, [0, 0, -0.47]);
  cyl(p, 0.065, 0.065, 2.04, [0, h + 0.61, 0], C.wood, [Math.PI / 2, 0, 0]);
  const w = world.level.frontWidth,
    f = world.level.floor;
  for (const x of [0.3 - w / 2, 0.3 + w / 2])
    b(p, [0.055, 0.85, 0.075], [x, f + 0.46, 0.94], C.wood);
  b(p, [w + 0.12, 0.065, 0.08], [0.3, f + 0.88, 0.94], C.wood);
  // Arched relief above (not across) the rectangular collision opening.
  const arch = new T.TorusGeometry(w / 2, 0.035, 4, 12, Math.PI);
  p.push(part(arch, C.wood, [0.3, f + 0.91, 0.95], [1, 0.25, 1]));
  for (let j = 0; j < 3; j++)
    b(
      p,
      [0.6 - j * 0.08, 0.11, 0.25],
      [-0.55, 0.02 + j * 0.1, 1.15 - j * 0.17],
      C.roof,
    );
  const rng = new PRNG(seed);
  for (let i = 0; i < 9; i++)
    s(
      p,
      0.25,
      [rng.range(-1.15, 1.15), -0.05, rng.range(-0.9, 0.9)],
      "#5b6263",
      [1, 0.55, 1],
    );
  const m = assembled(p);
  m.name = "house";
  return m;
}
function boatModel() {
  const p = [];
  b(p, [0.88, 0.12, 1.65], [0, 0.12, 0]);
  b(p, [0.1, 0.32, 1.85], [-0.49, 0.29, 0]);
  b(p, [0.1, 0.32, 1.85], [0.49, 0.29, 0]);
  b(p, [0.9, 0.32, 0.1], [0, 0.29, -0.9]);
  b(p, [0.9, 0.32, 0.1], [0, 0.29, 0.9]);
  // Curved bow and stern cheeks remain outside the collision hull.
  for (const z of [-0.97, 0.97])
    s(p, 0.34, [0, 0.16, z], C.wood, [1.4, 0.45, 0.75]);
  for (let i = 0; i < 7; i++)
    b(p, [0.86, 0.012, 0.017], [0, 0.185, -0.7 + i * 0.23], "#5a493e");
  b(p, [0.91, 0.07, 0.18], [0, 0.31, 0.65], C.roof);
  b(p, [0.91, 0.07, 0.16], [0, 0.31, -0.64], C.roof);
  return assembled(p);
}
function person(companion) {
  const p = [],
    cloth = companion ? C.red : "#a8aaa0";
  s(p, 0.11, [0, 0.52, 0], C.wall, [1, 1.05, 1]);
  cyl(p, 0.085, 0.105, 0.21, [0, 0.31, 0], cloth);
  s(p, 0.08, [-0.08, 0.21, -0.07], cloth, [0.8, 0.8, 1.4]);
  s(p, 0.08, [0.08, 0.21, -0.07], cloth, [0.8, 0.8, 1.4]);
  const m = assembled(p);
  m.position.set(companion ? 0.15 : -0.13, 0, companion ? -0.63 : 0.65);
  return m;
}
function objectModel(type) {
  const p = [],
    wood = C.wood;
  if (type === 0) {
    s(p, 0.12, [0, 0.025, 0], wood, [1.5, 0.75, 0.75]);
    cyl(p, 0.045, 0.06, 0.19, [0.14, 0.12, 0], wood, [0, 0, -0.3]);
    s(p, 0.075, [0.17, 0.23, 0], wood, [1.3, 0.8, 0.7]);
    for (const x of [-0.1, 0.1])
      for (const z of [-0.06, 0.06])
        cyl(p, 0.022, 0.022, 0.13, [x, -0.07, z], wood);
    for (const z of [-0.08, 0.08])
      p.push(
        part(
          new T.TorusGeometry(0.2, 0.018, 4, 12, 1.7),
          wood,
          [0, 0.04, z],
          [1, 1, 1],
          [0, 0, 3.85],
        ),
      );
    b(p, [0.065, 0.025, 0.13], [0.02, 0.12, 0], C.red);
    s(p, 0.025, [0.18, 0.3, -0.035], wood);
    s(p, 0.025, [0.18, 0.3, 0.035], wood);
  }
  if (type === 1) {
    cyl(p, 0.1, 0.07, 0.18, [0, 0, 0], C.wall);
    p.push(
      part(new T.TorusGeometry(0.06, 0.025, 5, 10), C.wall, [0.11, 0.015, 0]),
    );
    cyl(p, 0.079, 0.079, 0.005, [0, 0.093, 0], C.roof);
  }
  if (type === 2) {
    s(p, 0.125, [0, 0.02, 0], wood, [1, 1.3, 0.7]);
    cyl(p, 0.087, 0.087, 0.012, [0, 0.06, 0.09], C.wall, [Math.PI / 2, 0, 0]);
    b(p, [0.008, 0.06, 0.012], [0, 0.075, 0.1], C.ink);
    b(p, [0.04, 0.008, 0.012], [0.016, 0.045, 0.1], C.ink);
    for (const x of [-0.09, 0.09]) s(p, 0.04, [x, -0.1, 0], wood);
  }
  if (type === 3) {
    for (const x of [-0.12, 0.12]) b(p, [0.035, 0.25, 0.045], [x, 0.06, 0]);
    for (const y of [-0.065, 0.185]) b(p, [0.27, 0.035, 0.045], [0, y, 0]);
    b(p, [0.22, 0.21, 0.018], [0, 0.06, -0.014], C.wall);
    s(p, 0.04, [-0.04, 0.105, 0.003], C.roof, [1, 1, 0.15]);
    s(p, 0.045, [0.05, 0.095, 0.003], C.roof, [1, 1, 0.15]);
    b(p, [0.15, 0.06, 0.012], [0, 0.022, 0.003], C.roof);
  }
  if (type === 4) {
    b(p, [0.38, 0.23, 0.24], [0, 0, 0]);
    b(p, [0.4, 0.035, 0.26], [0, 0.12, 0], C.roof);
    b(p, [0.04, 0.05, 0.02], [0, 0.03, 0.13], C.wall);
  }
  if (type === 5) {
    s(p, 0.1, [0, 0, 0], C.wall, [1, 1.2, 0.8]);
    s(p, 0.08, [0, 0.15, 0], C.wall);
    for (const x of [-0.06, 0.06]) s(p, 0.035, [x, 0.21, 0], C.wall);
    for (const x of [-0.1, 0.1])
      s(p, 0.055, [x, -0.05, 0.02], C.wall, [0.8, 1, 1]);
    b(p, [0.13, 0.035, 0.12], [0, 0.08, 0], C.red);
  }
  const m = assembled(p);
  m.userData.type = type;
  m.userData.wetLevel = { value: -10 };
  m.material.onBeforeCompile = (shader) => {
    shader.uniforms.wetLevel = m.userData.wetLevel;
    shader.vertexShader =
      "varying float objectHeight;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nobjectHeight=position.y;",
      );
    shader.fragmentShader =
      "varying float objectHeight; uniform float wetLevel;\n" +
      shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb*=mix(0.73,1.0,smoothstep(wetLevel-.025,wetLevel+.025,objectHeight));",
      );
  };
  return m;
}
function makeFoam() {
  const rng = new PRNG(seed),
    m = new T.InstancedMesh(
      new T.TorusGeometry(0.13, 0.009, 3, 18),
      new T.MeshToonMaterial({ color: C.foam }),
      32,
    );
  for (let i = 0; i < 32; i++) {
    dummy.position.set(rng.range(-4.7, 4.7), 0.006, rng.range(-4.7, 4.7));
    dummy.rotation.set(-Math.PI / 2, 0, rng.range(0, 6));
    dummy.scale.set(rng.range(0.3, 1.6), rng.range(0.15, 0.6), 1);
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
  }
  return m;
}
function reset(newSeed = false) {
  if (newSeed) {
    seed = (seed + 0x9e3779b9) >>> 0;
    store.set("seed", seed);
  }
  let l = endless ? procedural(seed) : LEVELS[levelIndex];
  world = makeWorld(l, seed);
  disposeGroup(dynamic);
  house = houseModel();
  dynamic.add(house);
  boat = boatModel();
  dynamic.add(boat);
  figures = [person(false), person(true)];
  boat.add(...figures);
  let ap = [];
  for (const x of [-0.08, 0.08])
    cyl(ap, 0.027, 0.025, 0.19, [x, 0.36, -0.075], C.red, [0.8, 0, 0]);
  arms = assembled(ap);
  figures[1].add(arms);
  let rp = [];
  cyl(rp, 0.012, 0.02, 0.98, [0.11, 0.88, -0.28], C.wood, [-0.6, 0, -0.12]);
  rodMesh = assembled(rp);
  figures[0].add(rodMesh);
  items = world.items.map((o) => {
    const m = objectModel(o.type);
    m.userData.id = o.id;
    dynamic.add(m);
    return m;
  });
  foams = makeFoam();
  dynamic.add(foams);
  pickables = [house, ...items];
  for (const p of particles) p.life = 0;
  running = false;
  paused = false;
  aiming = false;
  aim = null;
  acc = 0;
  entryTime = 0;
  endTime = 0;
  lastState = "";
  rodSpring.value = rodSpring.vel = rodSpring.target = 0;
  lean.value = lean.vel = lean.target = 0;
  keys.clear();
  joystick = [0, 0];
  pointers.clear();
  $("intro").hidden = false;
  $("overlay").hidden = true;
  $("menu").hidden = true;
  $("menuToggle").setAttribute("aria-expanded", "false");
  $("chapter").textContent =
    (endless ? "∞" : String(l.id).padStart(2, "0")) + " / " + l.name;
  $("introKicker").textContent =
    "CHAPTER " + String(l.id).padStart(2, "0") + " / " + l.name;
  $("story").textContent =
    `那${oMeasure(l.main)}${TYPES[l.main].name}，还在窗边。`;
  $("goal").textContent = "想带走 · " + TYPES[l.main].name;
  $("seed").textContent = "种子 " + seed;
  $("caption").textContent = "旧屋还在，窗里的声音也还在。";
  $("timer").textContent = "01:30";
  $("saved").textContent = "";
  store.set("level", levelIndex);
  store.set("seed", seed);
  setOutline();
  updateUI();
}
function oMeasure(i) {
  return ["匹", "只", "座", "幅", "个", "只"][i];
}
class Sound {
  constructor() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    this.rooms = [0, 1].map((_, i) => {
      const oscillator = this.ctx.createOscillator(),
        filter = this.ctx.createBiquadFilter(),
        gain = this.ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = i ? 146.83 : 98;
      gain.gain.value = 0.012;
      filter.type = "lowpass";
      filter.frequency.value = 900;
      oscillator.connect(filter).connect(gain).connect(this.master);
      oscillator.start();
      return { filter, gain };
    });
  }
  resume() {
    if (this.ctx) this.ctx.resume().catch(() => {});
  }
  update() {
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(
      soundOn && !paused ? 0.22 : 0,
      this.ctx.currentTime,
      0.08,
    );
    const l = world.level;
    this.rooms.forEach((r, i) => {
      const cover = clamp(
        (world.water - (l.floor - (i ? 0.04 : -0.015))) / (i ? 1.09 : 0.865),
        0,
        1,
      );
      r.filter.frequency.setTargetAtTime(
        950 - 850 * cover,
        this.ctx.currentTime,
        0.8,
      );
      r.gain.gain.setTargetAtTime(
        0.012 * (1 - cover * 0.9),
        this.ctx.currentTime,
        0.8,
      );
    });
  }
  play(kind, type = 0) {
    if (!this.ctx || !soundOn || paused) return;
    const c = this.ctx,
      t = c.currentTime,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = ["splash", "cast", "reel"].includes(kind) ? "triangle" : "sine";
    const freq =
      kind === "saved"
        ? [175, 620, 440, 260, 130, 330][type]
        : {
            cast: 280,
            hook: 540,
            reel: 190,
            knock: 105,
            splash: 70,
            blocked: 85,
          }[kind] || 180;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.15);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(
      kind === "saved" ? 0.15 : 0.1,
      t + 0.008,
    );
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      t + (kind === "saved" ? 0.45 : 0.17),
    );
    o.connect(g).connect(this.master);
    o.start();
    o.stop(t + 0.5);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
}
function audio() {
  try {
    if (!sound) sound = new Sound();
    sound.resume();
  } catch {
    soundOn = false;
    $("sound").textContent = "声音不可用 · 静音";
  }
}
function toast(text) {
  $("toast").textContent = text;
  $("toast").style.opacity = 1;
  toastUntil = performance.now() + 2600;
}
function start() {
  audio();
  running = true;
  paused = false;
  acc = 0;
  previous = performance.now();
  $("intro").hidden = true;
  $("caption").textContent = "按住旧物瞄准 · 松手抛钩 · 再点击收竿";
  updateUI();
}
function setOutline() {
  dynamic.traverse((o) => {
    if (o.name === "outline") o.visible = outlines;
  });
  $("outline").textContent = "描边：" + (outlines ? "开" : "关");
}
function updateUI() {
  const state = world.state,
    hooked = state === "hooked";
  $("reel").hidden = !hooked;
  $("cancel").hidden = !aiming && !["hooked", "cast", "windup"].includes(state);
  $("fish").disabled = !["idle", "hooked"].includes(state);
  $("move").disabled = state !== "idle";
  $("fish").setAttribute("aria-pressed", mode === "fish");
  $("move").setAttribute("aria-pressed", mode === "move");
  $("joystick").hidden =
    mode !== "move" || !running || paused || state !== "idle";
  $("pauseBottom").textContent = paused ? "▶" : "Ⅱ";
  $("pause").textContent = paused ? "继续 · P" : "暂停 · P";
  $("sound").textContent = "声音：" + (soundOn ? "开" : "关");
  if (state !== lastState) {
    const texts = {
      idle:
        mode === "move"
          ? "WASD / 方向键，或左下摇杆移船"
          : "按住旧物瞄准 · 松手抛钩",
      windup: "再带走这一件。",
      cast: "鱼钩先碰到什么，就会停在哪里。",
      hooked: "挂住了 · 再点击一次收竿",
      flight: "等它真正落稳。",
      return: "鱼钩回来了。",
    };
    if (running && !world.ended) $("caption").textContent = texts[state] || "";
    lastState = state;
  }
}
function modal(kind) {
  const wasPaused = paused;
  paused = true;
  aiming = false;
  keys.clear();
  joystick = [0, 0];
  $("menu").hidden = true;
  $("overlay").hidden = false;
  const actions = $("modalActions");
  actions.replaceChildren();
  const add = (label, fn) => {
    let b = document.createElement("button");
    b.textContent = label;
    b.onclick = fn;
    actions.append(b);
  };
  if (kind === "help") {
    $("modalKicker").textContent = "两种动作 / 一件惦记";
    $("modalTitle").textContent = "留一点距离。";
    $("modalText").textContent =
      "按住可见旧物瞄准，松手抛钩。挂钩后再点击一次收竿。WASD / 方向键移船；右键拖动观察，滚轮缩放。触屏在底部切换垂钓与移船，双指观察。白色弹道止于首次碰撞，赭红表示无法挂住。回钩后可以换位置。只有物件落进舱内并停稳，才算带回。Space 重试，R 换种子，P 暂停，M 静音，Esc 回钩，H 隐藏界面。";
    add("明白了", () => {
      $("overlay").hidden = true;
      paused = wasPaused;
      previous = performance.now();
      acc = 0;
      updateUI();
    });
  } else if (kind === "pause") {
    $("modalKicker").textContent = "水与时间都停在这里";
    $("modalTitle").textContent = "等你回来。";
    $("modalText").textContent = "角色始终安全。要带走的，是窗里的旧物。";
    add("继续这一竿", () => {
      paused = false;
      $("overlay").hidden = true;
      previous = performance.now();
      acc = 0;
      updateUI();
    });
    add("重试", () => reset());
  } else {
    $("modalKicker").textContent = "THE LAST CAST";
    $("modalTitle").textContent = world.success
      ? "这一件，带回家了。"
      : "这一回，没赶上。";
    let n = world.items.filter((o) => o.saved).length;
    const record = store.get("record:" + seed + ":" + world.level.id, null);
    $("modalText").textContent = world.success
      ? `船上留下了${n}件旧物。${record ? "这一种子最快带回：" + record.best.toFixed(1) + "秒。" : ""}`
      : "小船照常离岸。窗里的旧日，留在了水声里。";
    add("再试这一竿", () => reset());
    add("下一扇窗", () => {
      levelIndex = (levelIndex + 1) % 12;
      seed = LEVELS[levelIndex].seed;
      endless = false;
      $("level").value = levelIndex;
      reset();
    });
  }
  updateUI();
}
function pauseToggle() {
  if (world.ended) return;
  if (paused) {
    paused = false;
    $("overlay").hidden = true;
    previous = performance.now();
    acc = 0;
    updateUI();
  } else if (running) modal("pause");
}
function splash(p) {
  for (let i = 0; i < 8; i++) {
    const d = particles[particleNext++ % particles.length],
      a = (i * Math.PI) / 4;
    d.life = 0.45;
    d.p = [...p];
    d.v = [Math.sin(a) * 0.3, 0.5 + i * 0.06, Math.cos(a) * 0.3];
  }
}
function events() {
  for (const e of world.events) {
    sound?.play(e.kind, e.type);
    if (e.kind === "reel") {
      const o = world.items[world.active];
      if (o?.wet) splash(o.p);
      rodSpring.vel = -9;
      rodSpring.target = 0;
    }
    if (e.kind === "hook") {
      rodSpring.vel = 3;
      toast("挂住了，再收一次竿。");
    }
    if (e.kind === "blocked") {
      toast("鱼线挂在窗框上了。回钩，换个位置。");
      splash(e.p);
    }
    if (e.kind === "splash" && e.p) splash(e.p);
    if (e.kind === "saved") {
      items[e.id].userData.gather = {
        from: items[e.id].position.clone(),
        t: 0,
      };
      lean.vel = 1.5;
      $("saved").textContent = world.items
        .filter((o) => o.saved)
        .map((o) => ["♞", "∪", "◷", "▣", "▰", "♧"][o.type])
        .join("");
      toast(
        e.id === 0
          ? "带回了。还可以再带走几件。"
          : TYPES[e.type].name + "，落稳了。",
      );
      if (e.id === 0) {
        world.mainTime = world.time;
        const key = "record:" + seed + ":" + world.level.id,
          old = store.get(key, { best: Infinity, count: 0 });
        store.set(key, {
          best: Math.min(old.best || Infinity, world.time),
          count: Math.max(old.count, world.items.filter((o) => o.saved).length),
        });
      }
    }
    if (e.kind === "end") {
      endTime = 0;
      const key = "record:" + seed + ":" + world.level.id,
        old = store.get(key, null);
      if (world.success && old)
        store.set(key, {
          ...old,
          count: Math.max(old.count, world.items.filter((o) => o.saved).length),
        });
    }
  }
  world.events.length = 0;
}
function aimAt(clientX, clientY) {
  pointer.set((clientX / innerWidth) * 2 - 1, 1 - (clientY / innerHeight) * 2);
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObjects(pickables, false);
  let hit = hits.find(
    (h) =>
      h.object.userData.id === undefined ||
      !world.items[h.object.userData.id]?.saved,
  );
  if (hit && hit.point.y > world.water + 0.005) return hit.point.toArray();
  plane.constant = -world.water;
  const p = ray.ray.intersectPlane(plane, tmp);
  return p ? p.toArray() : null;
}
function clearAim() {
  aiming = false;
  aim = null;
  arc.visible = false;
  targetRing.visible = false;
  updateUI();
}
canvas.addEventListener("pointerdown", (e) => {
  audio();
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, use: "none" });
  const p = pointers.get(e.pointerId);
  if (pointers.size > 1) {
    for (const q of pointers.values()) q.use = "camera";
    clearAim();
    return;
  }
  if (e.button !== 0) {
    p.use = "camera";
    return;
  }
  if (!running || paused || world.ended) return;
  if (world.state === "hooked" && mode === "fish") {
    p.use = "reel";
    return;
  }
  if (
    mode === "fish" &&
    world.state === "idle" &&
    Math.hypot(world.boat.vx, world.boat.vz) < 0.08 &&
    !keys.size
  ) {
    p.use = "aim";
    canvas.setPointerCapture(e.pointerId);
    aiming = true;
    aim = aimAt(e.clientX, e.clientY);
    updateUI();
  }
});
canvas.addEventListener("pointermove", (e) => {
  const p = pointers.get(e.pointerId);
  if (p?.use === "aim" && aiming) aim = aimAt(e.clientX, e.clientY);
});
canvas.addEventListener("pointerup", (e) => {
  const p = pointers.get(e.pointerId);
  pointers.delete(e.pointerId);
  if (!p) return;
  if (!paused && running) {
    if (p.use === "aim" && aiming && aim) {
      if (!cast(world, aim)) toast("先把船停稳，再靠近一点。");
    } else if (p.use === "reel") reel(world);
  }
  clearAim();
  updateUI();
});
canvas.addEventListener("pointercancel", (e) => {
  pointers.delete(e.pointerId);
  clearAim();
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener("lostpointercapture", () => clearAim());
$("joystick").addEventListener("pointerdown", (e) => {
  if (paused || world.state !== "idle") return;
  joystickPointer = e.pointerId;
  $("joystick").setPointerCapture(e.pointerId);
  stickMove(e);
});
function stickMove(e) {
  if (e.pointerId !== joystickPointer) return;
  let r = $("joystick").getBoundingClientRect(),
    x = (e.clientX - r.left - 55) / 36,
    y = (e.clientY - r.top - 55) / 36,
    d = Math.max(1, Math.hypot(x, y));
  joystick = [x / d, y / d];
  $("stick").style.transform =
    `translate(${joystick[0] * 32}px,${joystick[1] * 32}px)`;
}
$("joystick").addEventListener("pointermove", stickMove);
for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
  $("joystick").addEventListener(name, () => {
    joystick = [0, 0];
    joystickPointer = null;
    $("stick").style.transform = "";
  });
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName))
    return;
  const k = e.key.toLowerCase();
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k))
    e.preventDefault();
  if (e.repeat) return;
  if (k === " ") {
    reset();
    return;
  }
  if (k === "r") {
    reset(true);
    return;
  }
  if (k === "m") $("sound").click();
  if (k === "p") pauseToggle();
  if (k === "h") document.body.classList.toggle("hidehud");
  if (k === "escape") {
    clearAim();
    if (!paused) cancel(world);
  }
  if (
    !paused &&
    running &&
    [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowdown",
      "arrowleft",
      "arrowright",
    ].includes(k)
  ) {
    keys.add(k);
    clearAim();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
document.addEventListener("visibilitychange", () => {
  if (document.hidden && running && !paused && !world.ended) modal("pause");
});
window.addEventListener("blur", () => {
  keys.clear();
  joystick = [0, 0];
  clearAim();
  if (running && !paused && !world.ended) modal("pause");
});
$("showHUD").onclick = () => document.body.classList.remove("hidehud");
$("start").onclick = start;
$("menuToggle").onclick = () => {
  const show = $("menu").hidden;
  $("menu").hidden = !show;
  $("menuToggle").setAttribute("aria-expanded", show);
};
LEVELS.forEach((l, i) => {
  const o = document.createElement("option");
  o.value = i;
  o.textContent = String(i + 1).padStart(2, "0") + " " + l.name;
  $("level").append(o);
});
$("level").value = levelIndex;
$("level").onchange = () => {
  levelIndex = +$("level").value;
  seed = LEVELS[levelIndex].seed;
  endless = false;
  reset();
};
$("mode").onclick = () => {
  endless = !endless;
  $("mode").textContent = endless ? "返回故事十二关" : "漂来的旧日";
  reset();
};
$("retry").onclick = () => reset();
$("random").onclick = () => reset(true);
$("sound").onclick = () => {
  audio();
  soundOn = !soundOn;
  store.set("sound", soundOn);
  updateUI();
};
$("outline").onclick = () => {
  outlines = !outlines;
  setOutline();
};
$("home").onclick = () => {
  camera.position.copy(original);
  camera.zoom = 1;
  controls.target.set(0, 0.45, 0.6);
  camera.updateProjectionMatrix();
  controls.update();
};
$("orbit").onclick = () => {
  autoOrbit = !autoOrbit;
  $("orbit").textContent = "慢速自转：" + (autoOrbit ? "开" : "关");
};
$("pause").onclick = pauseToggle;
$("pauseBottom").onclick = pauseToggle;
$("help").onclick = () => modal("help");
$("hud").onclick = () => document.body.classList.add("hidehud");
$("copy").onclick = () =>
  navigator.clipboard
    ?.writeText(String(seed))
    .then(() => toast("种子已复制"))
    .catch(() => toast("种子：" + seed));
$("fish").onclick = () => {
  mode = "fish";
  joystick = [0, 0];
  lastState = "";
  updateUI();
};
$("move").onclick = () => {
  if (world.state === "idle") {
    mode = "move";
    clearAim();
    lastState = "";
    updateUI();
  }
};
$("reel").onclick = () => {
  if (!paused) reel(world);
  updateUI();
};
$("cancel").onclick = () => {
  clearAim();
  if (!paused) cancel(world);
  updateUI();
};
function resize() {
  renderer.setSize(innerWidth, innerHeight);
  let aspect = innerWidth / innerHeight,
    h = innerWidth < 650 ? 5.5 : 4.15;
  camera.left = -h * aspect;
  camera.right = h * aspect;
  camera.top = h;
  camera.bottom = -h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();
const metrics = { samples: [], frames: [], draws: 0, maxDraws: 0 };
let lastHUD = 0;
function renderFrame(now) {
  requestAnimationFrame(renderFrame);
  const began = performance.now(),
    elapsed = (now - previous) / 1000,
    delta = Math.min(elapsed, 0.06);
  previous = now;
  const live = !paused;
  presentationTime += live ? delta : 0;
  if (live) {
    entryTime += delta;
    if (running && !world.ended) {
      acc += delta;
      let x =
          (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
          (keys.has("a") || keys.has("arrowleft") ? 1 : 0) +
          joystick[0],
        z =
          (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
          (keys.has("w") || keys.has("arrowup") ? 1 : 0) +
          joystick[1],
        length = Math.max(1, Math.hypot(x, z));
      for (let i = 0; acc >= DT && i < 7; i++) {
        step(world, DT, [x / length, z / length]);
        acc -= DT;
      }
      events();
    }
    if (world.ended) {
      endTime += delta;
      if (endTime > 1.4 && !paused) modal("result");
    }
  }
  water.position.y = world.water;
  foams.position.y = world.water + 0.007;
  boat.position.set(world.boat.x, world.water, world.boat.z);
  if (!running) boat.position.z += Math.max(0, 1 - entryTime / 0.65) * 0.8;
  if (world.ended) boat.position.z += Math.min(endTime, 1.4) * 0.7;
  boatTilt.target = -world.boat.vx * 0.06;
  if (live) boatTilt.update(delta);
  boat.rotation.z = boatTilt.value;
  lean.target = world.success
    ? 0
    : world.state === "flight"
      ? 0.6
      : world.time > 60
        ? 0.35
        : !running
          ? 0.18
          : 0;
  if (live) {
    lean.update(delta);
    rodSpring.update(delta);
  }
  figures[1].rotation.x = -lean.value * 0.32;
  arms.rotation.x = -lean.value;
  rodMesh.rotation.x = rodSpring.value;
  const rp = rod(world);
  let count = 0;
  for (const o of world.items) {
    const m = items[o.id];
    if (o.saved) {
      const slot = count++,
        target = new T.Vector3(
          world.boat.x + (slot % 2 ? -0.19 : 0.19),
          world.water + 0.29,
          world.boat.z - 0.3 + Math.floor(slot / 2) * 0.22,
        ),
        g = m.userData.gather;
      if (g && g.t < 0.28) {
        if (live) g.t += delta;
        m.position.lerpVectors(g.from, target, clamp(g.t / 0.28, 0, 1));
      } else m.position.copy(target);
      m.rotation.y = o.yaw;
      m.scale.setScalar(0.75);
    } else {
      m.position.fromArray(o.p);
      m.rotation.y = o.yaw;
    }
    if (o.wet > 0)
      m.userData.wetLevel.value = Math.max(
        m.userData.wetLevel.value,
        world.water - o.p[1],
      );
  }
  fishingLine.visible =
    !!world.hook && !["idle", "ended"].includes(world.state);
  hook.visible = fishingLine.visible;
  if (fishingLine.visible) {
    let end =
      world.state === "hooked" || world.state === "flight"
        ? world.items[world.active]?.p
        : world.hook.p;
    if (end) {
      if (world.state === "return") {
        let t = clamp(world.round / 0.24, 0, 1);
        end = end.map((v, k) => v + (rp[k] - v) * t);
      }
      const obstruction =
        world.state === "hooked"
          ? blocked(world, world.items[world.active])
          : null;
      const mid =
        obstruction?.p ||
        rp.map(
          (v, k) =>
            (v + end[k]) / 2 - (k === 1 && world.state === "cast" ? 0.06 : 0),
        );
      lineGeo.attributes.position.setXYZ(0, ...rp);
      lineGeo.attributes.position.setXYZ(1, ...mid);
      lineGeo.attributes.position.setXYZ(2, ...end);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.computeBoundingSphere();
      hook.position.fromArray(end);
      fishingLine.material.color.set(obstruction ? C.red : C.wall);
    }
  }
  if (aiming && aim) {
    const p = preview(world, aim);
    arc.visible = p.points.length > 0;
    const a = arcGeo.attributes.position;
    for (let i = 0; i < p.points.length; i++) a.setXYZ(i, ...p.points[i]);
    a.needsUpdate = true;
    arcGeo.setDrawRange(0, p.points.length);
    arc.computeLineDistances();
    arc.material.color.set(p.hit?.kind === "item" ? C.wall : C.red);
    targetRing.visible = !!p.hit;
    if (p.hit) {
      targetRing.position.fromArray(p.hit.p);
      targetRing.lookAt(camera.position);
    }
  } else {
    arc.visible = false;
    targetRing.visible = false;
  }
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.life > 0) {
      if (live) {
        p.life -= delta;
        p.v[1] -= G * delta;
        for (let k = 0; k < 3; k++) p.p[k] += p.v[k] * delta;
      }
      dummy.position.fromArray(p.p);
      dummy.scale.setScalar(Math.max(0, p.life / 0.45));
    } else dummy.scale.setScalar(0);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    droplets.setMatrixAt(i, dummy.matrix);
  }
  droplets.instanceMatrix.needsUpdate = true;
  if (now - lastHUD > 100) {
    lastHUD = now;
    let remaining = Math.max(0, Math.ceil(90 - world.time));
    $("timer").textContent =
      String(Math.floor(remaining / 60)).padStart(2, "0") +
      ":" +
      String(remaining % 60).padStart(2, "0");
    updateUI();
    sound?.update();
  }
  if (now > toastUntil) $("toast").style.opacity = 0;
  controls.enabled = !paused;
  controls.autoRotate = autoOrbit && (!running || world.ended) && !paused;
  controls.autoRotateSpeed = 0.35;
  controls.update();
  renderer.info.reset();
  renderer.render(scene, camera);
  metrics.draws = renderer.info.render.calls;
  metrics.maxDraws = Math.max(metrics.maxDraws, metrics.draws);
  if (running && !paused && !world.ended) {
    metrics.samples.push(performance.now() - began);
    metrics.frames.push(elapsed * 1000);
    if (metrics.samples.length > 1800) {
      metrics.samples.shift();
      metrics.frames.shift();
    }
  }
}
reset();
requestAnimationFrame(renderFrame);
// Read-only diagnostics, plus deterministic setup only when explicitly in test mode.
window.lastCast = {
  get state() {
    return {
      seed,
      time: world.time,
      water: world.water,
      stage: world.state,
      paused,
      running,
      success: world.success,
      items: world.items.map((o) => ({
        id: o.id,
        type: o.type,
        p: [...o.p],
        saved: o.saved,
      })),
      boat: { ...world.boat },
      reels: world.reels,
    };
  },
  metrics() {
    const percentile = (v, p) =>
      [...v].sort((a, b) => a - b)[Math.floor(v.length * p)] || 0;
    return {
      samples: metrics.samples.length,
      p95: percentile(metrics.samples, 0.95),
      fps:
        1000 /
        (metrics.frames.reduce((a, b) => a + b, 0) / metrics.frames.length),
      drawCalls: metrics.draws,
      maxDrawCalls: metrics.maxDraws,
      width: innerWidth,
      height: innerHeight,
      dpr: renderer.getPixelRatio(),
      renderer: renderer
        .getContext()
        .getParameter(
          renderer.getContext().getExtension("WEBGL_debug_renderer_info")
            ?.UNMASKED_RENDERER_WEBGL || renderer.getContext().RENDERER,
        ),
    };
  },
  project(p) {
    let v = new T.Vector3(...p).project(camera);
    return {
      x: ((v.x + 1) * innerWidth) / 2,
      y: ((1 - v.y) * innerHeight) / 2,
    };
  },
};
if (new URLSearchParams(location.search).has("test"))
  Object.assign(window.lastCast, {
    world: () => world,
    setup(i, route) {
      levelIndex = i;
      seed = LEVELS[i].seed;
      endless = false;
      reset();
      if (route) {
        world.boat.x = route.x;
        world.boat.z = route.z;
      }
      start();
    },
    advance(n) {
      for (let i = 0; i < n; i++) step(world);
      events();
    },
    castMain() {
      return cast(
        world,
        world.items[0].p.map((v, k) => v + (k === 1 ? 0.08 : 0)),
      );
    },
    reel() {
      return reel(world);
    },
    end() {
      world.time = 89.99;
    },
  });
