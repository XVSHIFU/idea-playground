// shared.js — NPR / Toon utilities shared across the Lantern Way series.
// Loaded as an ES module by index.html. Requires three (provided via importmap).
import * as THREE from 'three';

// ---- Palette (dark, tender dusk) -------------------------------------------
export const PALETTE = {
  bgTop:      '#2E3A4F',
  bgHorizon:  '#3A4866',
  bgBottom:   '#4A5A78',
  bgNightTop: '#0E1422',
  bgNightBot: '#1A2438',
  terrainA:   '#2F4A3A', // mossy green
  terrainB:   '#3A4F5C', // deep teal
  torch:      '#FFB347', // only accent
  cold:       '#4A6FA5', // fear / dark blue
  coldDeep:   '#26344F',
  outline:    '#14161C',
  bed:        '#F2E6D0', // warm ivory (home)
  bedWarm:    '#FFD9A0',
  rock:       '#26323F',
  rockDark:   '#1B2530',
  trunk:      '#5A4632',
  leaf:       '#33503F',
  leafDark:   '#274034',
  moss:       '#3C5A3A',
  person:     '#E7D9C4',
  personCold: '#6E84A8',
  flame:      '#FFB347',
  flameCore:  '#FFE3B0'
};

// ---- Seedable PRNG (mulberry32) --------------------------------------------
export class PRNG {
  constructor(seed = 1) { this.s = (seed >>> 0) || 1; }
  next() {
    let t = (this.s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  bool(p = 0.5) { return this.next() < p; }
}

// ---- Seedable Perlin noise (2D) --------------------------------------------
export function makePerlin(seed) {
  const src = new Uint8Array(256);
  for (let i = 0; i < 256; i++) src[i] = i;
  const rng = new PRNG(seed);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const t = src[i]; src[i] = src[j]; src[j] = t;
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = src[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y) => {
    const g = h & 7;
    const u = g < 4 ? x : y;
    const v = g < 4 ? y : x;
    return ((g & 1) ? -u : u) + ((g & 2) ? -2 * v : 2 * v);
  };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = p[p[X] + Y], ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return lerp(x1, x2, v); // ~[-1,1]
  };
}

// ---- Toon gradient map (N-step grayscale, NearestFilter) ------------------
export function makeToonGradient(steps = 3) {
  const c = document.createElement('canvas');
  c.width = steps; c.height = 1;
  const ctx = c.getContext('2d');
  for (let i = 0; i < steps; i++) {
    // dark shadow -> bright, smooth-ish but quantized
    const v = Math.round(70 + 185 * (i / (steps - 1)));
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i, 0, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

// ---- Reverse-shell outline for a single Mesh -------------------------------
export function addOutline(mesh, thickness = 0.05, color = 0x14161C) {
  if (!mesh.geometry) return null;
  const og = mesh.geometry.clone();
  if (!og.attributes.normal) og.computeVertexNormals();
  const pos = og.attributes.position, nor = og.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i,
      pos.getX(i) + nor.getX(i) * thickness,
      pos.getY(i) + nor.getY(i) * thickness,
      pos.getZ(i) + nor.getZ(i) * thickness);
  }
  pos.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: false });
  const out = new THREE.Mesh(og, mat);
  out.name = 'outline';
  out.renderOrder = (mesh.renderOrder || 0) - 1;
  out.castShadow = false; out.receiveShadow = false;
  mesh.add(out);
  return out;
}

// ---- Reverse-shell outline for an InstancedMesh ----------------------------
export function addInstancedOutline(mesh, thickness = 0.06, color = 0x14161C) {
  const og = mesh.geometry.clone();
  if (!og.attributes.normal) og.computeVertexNormals();
  const pos = og.attributes.position, nor = og.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i,
      pos.getX(i) + nor.getX(i) * thickness,
      pos.getY(i) + nor.getY(i) * thickness,
      pos.getZ(i) + nor.getZ(i) * thickness);
  }
  pos.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide, fog: false });
  const inst = new THREE.InstancedMesh(og, mat, mesh.count);
  inst.renderOrder = (mesh.renderOrder || 0) - 1;
  inst.castShadow = false; inst.receiveShadow = false;
  for (let i = 0; i < mesh.count; i++) {
    const m = new THREE.Matrix4();
    mesh.getMatrixAt(i, m);
    inst.setMatrixAt(i, m);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (mesh.parent) mesh.parent.add(inst);
  return inst;
}

// ---- Critically-ish damped 1D spring --------------------------------------
export class Spring {
  constructor(v = 0, s = 140, d = 20) {
    this.value = v; this.target = v; this.vel = 0; this.s = s; this.d = d;
  }
  set(t) { this.target = t; }
  update(dt) {
    dt = Math.min(dt, 0.05);
    const f = (this.target - this.value) * this.s;
    const damp = this.vel * this.d;
    this.vel += (f - damp) * dt;
    this.value += this.vel * dt;
    return this.value;
  }
}

// ---- Small math helpers ----------------------------------------------------
export const clamp = (v, a, b) => (v < a ? a : (v > b ? b : v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
export const expDamp = (cur, target, tau, dt) => cur + (target - cur) * (1 - Math.exp(-dt / tau));
