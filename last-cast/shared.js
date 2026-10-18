// Adapted from lantern-way/shared.js: PRNG, three-step gradient and Spring.
// Outline improved to weld positional seams BEFORE computing smooth normals.
import * as T from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/addons/utils/BufferGeometryUtils.js";
export { PRNG } from "./physics.js";
export function makeToonGradient() {
  const c = document.createElement("canvas");
  c.width = 3;
  c.height = 1;
  const x = c.getContext("2d");
  [76, 166, 255].forEach((v, i) => {
    x.fillStyle = `rgb(${v},${v},${v})`;
    x.fillRect(i, 0, 1, 1);
  });
  const t = new T.CanvasTexture(c);
  t.minFilter = t.magFilter = T.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
export class Spring {
  constructor(v = 0, response = 0.24, zeta = 0.85) {
    this.value = v;
    this.target = v;
    this.vel = 0;
    this.w = (2 * Math.PI) / response;
    this.zeta = zeta;
  }
  update(dt) {
    for (let t = 0; t < dt; t += 1 / 240) {
      const h = Math.min(1 / 240, dt - t);
      this.vel +=
        ((this.target - this.value) * this.w * this.w -
          2 * this.zeta * this.w * this.vel) *
        h;
      this.value += this.vel * h;
    }
    return this.value;
  }
}
const outlineMaterial = new T.MeshBasicMaterial({
  color: "#15191C",
  side: T.BackSide,
});
export const gradient = makeToonGradient();
export function addOutline(mesh, indexed, thickness = 0.012) {
  let g = indexed.clone();
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g.deleteAttribute("color");
  g = mergeVertices(g, 0.0001);
  g.computeVertexNormals();
  const p = g.attributes.position,
    n = g.attributes.normal;
  for (let i = 0; i < p.count; i++)
    p.setXYZ(
      i,
      p.getX(i) + n.getX(i) * thickness,
      p.getY(i) + n.getY(i) * thickness,
      p.getZ(i) + n.getZ(i) * thickness,
    );
  const out = new T.Mesh(g, outlineMaterial);
  out.name = "outline";
  out.castShadow = false;
  mesh.add(out);
  return out;
}
export function part(
  geometry,
  color,
  p = [0, 0, 0],
  scale = [1, 1, 1],
  rot = [0, 0, 0],
) {
  const g = geometry.clone();
  g.applyMatrix4(
    new T.Matrix4().compose(
      new T.Vector3(...p),
      new T.Quaternion().setFromEuler(new T.Euler(...rot)),
      new T.Vector3(...scale),
    ),
  );
  const c = new T.Color(color),
    a = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < a.length; i += 3) {
    a[i] = c.r;
    a[i + 1] = c.g;
    a[i + 2] = c.b;
  }
  g.setAttribute("color", new T.BufferAttribute(a, 3));
  return g;
}
export function assembled(parts, outline = true) {
  const indexed = mergeGeometries(
    parts.map((g) => (g.index ? g.toNonIndexed() : g)),
    false,
  );
  indexed.computeVertexNormals();
  const mat = new T.MeshToonMaterial({
    vertexColors: true,
    gradientMap: gradient,
  });
  const mesh = new T.Mesh(indexed, mat);
  mesh.castShadow = mesh.receiveShadow = true;
  if (outline) addOutline(mesh, indexed);
  return mesh;
}
export const cube = (s) => new T.BoxGeometry(...s),
  ball = (r = 0.1) => new T.IcosahedronGeometry(r, 1);
export function disposeGroup(group) {
  group.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material !== outlineMaterial) o.material.dispose();
  });
  group.clear();
}
