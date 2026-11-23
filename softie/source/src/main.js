import * as THREE from 'three/src/Three.WebGPU.js';
import { texture, uniform, mix, float } from 'three/src/nodes/TSL.js';
import Renderer from 'three/src/renderers/common/Renderer.js';
import WebGPUBackend from 'three/src/renderers/webgpu/WebGPUBackend.js';
import StandardNodeLibrary from 'three/src/renderers/webgpu/nodes/StandardNodeLibrary.js';
import { SlimePhysics, clamp } from './physics.js';
import './style.css';

const $ = id => document.getElementById(id);
const canvas = $('slime-canvas');
const stage = $('playground');
const physics = new SlimePhysics();
const palette = { mint: '#78cba5', pink: '#eda0be', lavender: '#b3a1df', peach: '#eeb58a' };
let renderer, mesh, camera, scene, bodyMaterial, tint, shadow, bubbleMesh;
let rest, positions, bubbles = [], ready = false, pointerId = null, accumulator = 0, last = 0, elapsed = 0;
let fpsFrames = 0, fpsTime = 0, renderScale = Math.min(devicePixelRatio, 1.6), slowWindows = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane();
const grabWorld = new THREE.Vector3();
const dragWorld = new THREE.Vector3();
const normal = new THREE.Vector3();
const tmp = new THREE.Object3D();
let dragBodyStart = [0, 0];

function makeFace() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
  const ctx = c.getContext('2d');
  // This is a pigment map on the slime's own UVs, never separate face geometry.
  for (const x of [939, 1109]) {
    let g = ctx.createRadialGradient(x - 4, 456, 1, x, 465, 21);
    g.addColorStop(0, '#344b3b'); g.addColorStop(.6, '#15261b'); g.addColorStop(1, '#122017');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, 465, 19, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fcfff8'; ctx.beginPath(); ctx.ellipse(x - 5, 457, 5.5, 5, -.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff33'; ctx.beginPath(); ctx.ellipse(x + 4, 475, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#183922'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1003, 494); ctx.bezierCurveTo(1004, 523, 1044, 523, 1045, 494); ctx.stroke();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeEnvironment() {
  const width = 1024, height = 512;
  const data = new Float32Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width, v = y / height;
      let value = .32 + .48 * (1 - v);
      // Large photographic softboxes, with a narrow mullion in the key light.
      if (u > .13 && u < .32 && v > .14 && v < .37) value = 5.0;
      if (u > .21 && u < .216 && v > .14 && v < .37) value = .9;
      if (u > .64 && u < .72 && v > .22 && v < .53) value = 2.8;
      value += 1.8 * Math.exp(-((u - .48) ** 2 / .014 + (v - .12) ** 2 / .009));
      const i = (y * width + x) * 4;
      data[i] = value; data[i + 1] = value * 1.015; data[i + 2] = value * .99; data[i + 3] = 1;
    }
  }
  const env = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  env.mapping = THREE.EquirectangularReflectionMapping; env.needsUpdate = true;
  return env;
}

function makeShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'); const g = ctx.createRadialGradient(128, 128, 2, 128, 128, 128);
  g.addColorStop(0, '#405c4266'); g.addColorStop(.35, '#405c424d'); g.addColorStop(.7, '#405c4216'); g.addColorStop(1, '#405c4200');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const mat = new THREE.MeshBasicNodeMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.6), mat);
  plane.rotation.x = -Math.PI / 2; plane.position.y = .012; plane.renderOrder = -1;
  return plane;
}

function buildScene() {
  scene = new THREE.Scene(); scene.background = new THREE.Color('#f4f4f1');
  camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 2.1, 4.9); camera.lookAt(0, 1.0, 0);
  scene.add(new THREE.HemisphereLight('#ffffff', '#a4bfa7', 2.1));
  const key = new THREE.DirectionalLight('#fffdf5', 2.7); key.position.set(-3, 6, 5); scene.add(key);
  const fill = new THREE.DirectionalLight('#edfff8', 1.2); fill.position.set(4, 2, -3); scene.add(fill);
  scene.environment = makeEnvironment();
  shadow = makeShadow(); scene.add(shadow);

  const geometry = new THREE.SphereGeometry(1, 80, 56); geometry.rotateY(-Math.PI / 2);
  positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i), t = (y + 1) * .5;
    const a = Math.atan2(z, x);
    const lobe = 1 + .026 * Math.cos(a * 5 + .5) * Math.pow(1 - t, 2);
    const width = (1.48 + .17 * (1 - t)) * lobe;
    positions.setXYZ(i, x * width, Math.max(.065, .99 + y * 1.09), z * width * .84);
  }
  rest = positions.array.slice(); positions.setUsage(THREE.DynamicDrawUsage);
  geometry.computeVertexNormals(); geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  const face = texture(makeFace()); tint = uniform(new THREE.Color(palette.mint));
  bodyMaterial = new THREE.MeshPhysicalNodeMaterial({
    roughness: .19, metalness: 0, transmission: .55, thickness: .85,
    ior: 1.36, clearcoat: 1, clearcoatRoughness: .15,
    attenuationColor: new THREE.Color('#a2e9bb'), attenuationDistance: 2.3,
    envMapIntensity: 1.15, specularIntensity: 1,
  });
  bodyMaterial.colorNode = mix(tint, face.rgb, face.a);
  bodyMaterial.transmissionNode = float(.55).mul(face.a.oneMinus());
  bodyMaterial.roughnessNode = mix(float(.19), float(.3), face.a);
  bodyMaterial.clearcoatNode = mix(float(1), float(.18), face.a);
  mesh = new THREE.Mesh(geometry, bodyMaterial); mesh.frustumCulled = false; mesh.renderOrder = 1; scene.add(mesh);

  const bubbleMat = new THREE.MeshPhysicalNodeMaterial({color:'#c7f5dd',roughness:.12,metalness:.05,transparent:true,opacity:.34,depthWrite:false,clearcoat:1,envMapIntensity:1.4});
  bubbleMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), bubbleMat, 24);
  let seed = 12; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 24; i++) {
    let x, y, z;
    do { x = (random() - .5) * 2.5; y = .25 + random() * 1.65; z = (random() - .3) * 1.7; }
    while ((x / 1.4) ** 2 + ((y - 1) / 1.1) ** 2 + (z / 1.2) ** 2 > .86);
    bubbles.push({ x, y, z, r: .018 + random() ** 3 * .058, phase: random() * 6.28 });
  }
  bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bubbleMesh.frustumCulled = false; scene.add(bubbleMesh);
}

function deformPoint(x, y, z, out) {
  const p = physics, q = p.squash;
  const dx = x - p.anchor[0], dy = y - p.anchor[1], dz = z - p.anchor[2];
  const influence = Math.exp(-(dx * dx + dy * dy + dz * dz) / (1.15 + p.softness * 1.05));
  const floorWeight = clamp(y / .35, 0, 1);
  out[0] = x * (1 + q * .49) + p.shear * y + p.local[0] * influence * (.35 + floorWeight * .65);
  out[1] = Math.max(.045 - p.y, y * (1 - q) + p.local[1] * influence * floorWeight);
  out[2] = z * (1 + q * .42) + p.local[2] * influence * floorWeight;
}

const point = [0, 0, 0];
function updateMesh() {
  for (let i = 0; i < positions.count; i++) {
    const j = i * 3; deformPoint(rest[j], rest[j + 1], rest[j + 2], point);
    positions.setXYZ(i, point[0], point[1], point[2]);
  }
  positions.needsUpdate = true; mesh.geometry.computeVertexNormals();
  mesh.position.set(physics.x, physics.y, 0); mesh.geometry.computeBoundingSphere();
  bubbles.forEach((b, i) => {
    deformPoint(b.x, b.y + Math.sin(elapsed * .7 + b.phase) * .008, b.z, point);
    tmp.position.set(point[0] + physics.x, point[1] + physics.y, point[2]);
    tmp.scale.set(b.r * (1 + physics.squash * .4), b.r * (1 - physics.squash), b.r);
    tmp.updateMatrix(); bubbleMesh.setMatrixAt(i, tmp.matrix);
  });
  bubbleMesh.instanceMatrix.needsUpdate = true;
  shadow.position.x = physics.x; const scale = 1 + physics.y * .19;
  shadow.scale.set(scale + physics.squash * .28, scale, 1);
  shadow.material.opacity = .9 / (1 + physics.y * 1.6);
}

function resize() {
  if (!renderer) return;
  const {width, height} = stage.getBoundingClientRect();
  camera.aspect = width / height;
  camera.position.z = width < 600 ? 4.7 : 4.9;
  camera.lookAt(0, 1.0, 0);
  camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
}

function setRay(e) {
  const r = canvas.getBoundingClientRect();
  mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
}

function bindInteractions() {
  canvas.addEventListener('pointerdown', e => {
    if (!ready || pointerId !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    setRay(e); const hit = raycaster.intersectObject(mesh)[0]; if (!hit) return;
    e.preventDefault(); pointerId = e.pointerId; canvas.setPointerCapture(pointerId);
    canvas.classList.add('grabbing'); grabWorld.copy(hit.point);
    camera.getWorldDirection(normal); dragPlane.setFromNormalAndCoplanarPoint(normal, grabWorld);
    const i = hit.face.a * 3;
    physics.grab([rest[i], rest[i + 1], rest[i + 2]], hit.normal.toArray());
    dragBodyStart = [physics.x, physics.y];
    $('hint').querySelector('span').innerHTML = 'Aaaand stretch… <i>·</i> Let go when you’re ready';
  });
  canvas.addEventListener('pointermove', e => {
    if (!ready) return; setRay(e);
    if (pointerId === e.pointerId && physics.dragging) {
      if (raycaster.ray.intersectPlane(dragPlane, dragWorld)) {
        dragWorld.sub(grabWorld);
        physics.drag([dragWorld.x + dragBodyStart[0], dragWorld.y + dragBodyStart[1], dragWorld.z]);
      }
    } else if (pointerId === null) canvas.style.cursor = raycaster.intersectObject(mesh).length ? 'grab' : 'default';
  });
  function release(e) {
    if (pointerId === null || (e?.pointerId !== undefined && e.pointerId !== pointerId)) return;
    const id = pointerId; pointerId = null; physics.release();
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    canvas.classList.remove('grabbing'); canvas.style.cursor = '';
    $('hint').querySelector('span').innerHTML = 'Drag to stretch <i>·</i> Release to wobble';
  }
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release); window.addEventListener('blur', () => release());
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); last = 0; accumulator = 0; });
  $('poke').addEventListener('click', () => { release(); physics.poke(); });
  $('reset').addEventListener('click', () => {
    release(); physics.reset(); physics.softness = .7; physics.damping = .45;
    setColor('mint'); for (const [id, val] of [['softness',70],['damping',45]]) { $(id).value = val; updateRange(id); }
  });
  canvas.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); physics.poke(); } if(e.code === 'Escape') release(); });
  document.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => setColor(b.dataset.color)));
  for (const id of ['softness', 'damping']) $(id).addEventListener('input', () => updateRange(id));
}

function setColor(name) {
  tint.value.set(palette[name]);
  bodyMaterial.attenuationColor.copy(tint.value).lerp(new THREE.Color('white'), .4);
  $('color-name').textContent = name[0].toUpperCase() + name.slice(1);
  canvas.setAttribute('aria-label', `Soft, translucent ${name} slime`);
  document.querySelectorAll('.swatch').forEach(b => { const active = b.dataset.color === name; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', active); });
}

function updateRange(id) { const v = Number($(id).value); physics[id] = v / 100; $(id).style.setProperty('--fill', `${v}%`); $(`${id}-value`).innerHTML = `${v}<span>%</span>`; }

function fail(error) {
  ready = false; renderer?.setAnimationLoop(null); $('loading').hidden = true; $('error').hidden = false;
  $('error-text').textContent = 'This softie needs WebGPU. Open it in a WebGPU-enabled browser with graphics acceleration turned on, then try again.';
  $('status-label').textContent = 'WebGPU unavailable'; $('status-dot').classList.remove('ready');
  $('poke').disabled = true; $('reset').disabled = true;
  console.error('Softie WebGPU:', error);
}

function frame(time) {
  if (document.hidden || !ready) return;
  const frameTime = last ? (time - last) / 1000 : 1 / 60;
  const dt = Math.min(frameTime, .06); last = time; elapsed += dt;
  accumulator += dt;
  while (accumulator >= 1 / 120) { physics.step(1 / 120); accumulator -= 1 / 120; }
  updateMesh(); renderer.render(scene, camera);
  fpsFrames++; fpsTime += frameTime;
  if (fpsTime > 1.5) {
    const fps = Math.round(fpsFrames / fpsTime); $('fps').textContent = `${fps} FPS`;
    if (fps < 49) slowWindows++; else slowWindows = 0;
    if (slowWindows >= 3 && renderScale > .85) { renderScale = Math.max(.85, renderScale - .2); renderer.setPixelRatio(renderScale); resize(); slowWindows = 0; }
    fpsFrames = 0; fpsTime = 0;
  }
}

async function start() {
  try {
    if (!navigator.gpu || !isSecureContext) throw new Error('WebGPU requires a supported browser and secure context.');
    // Deliberately construct the backend directly: the stock WebGPURenderer
    // installs an automatic WebGL fallback. This renderer has no fallback.
    const options = { canvas, antialias: true, alpha: false, powerPreference: 'high-performance' };
    renderer = new Renderer(new WebGPUBackend(options), { ...options, getFallback: null });
    renderer.library = new StandardNodeLibrary(); renderer.isWebGPURenderer = true;
    renderer.setPixelRatio(renderScale); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.onDeviceLost = info => fail(new Error(info.message || 'GPU device lost'));
    await renderer.init();
    if (!renderer.backend.isWebGPUBackend) throw new Error('A WebGPU backend is required.');
    buildScene(); resize(); updateMesh();
    await renderer.compileAsync(scene, camera);
    renderer.render(scene, camera);
    ready = true; $('loading').hidden = true; $('status-dot').classList.add('ready');
    $('poke').disabled = false; $('reset').disabled = false;
    bindInteractions(); new ResizeObserver(resize).observe(stage);
    renderer.setAnimationLoop(frame);
  } catch (error) { fail(error); }
}
$('retry').addEventListener('click', () => location.reload());
start();
