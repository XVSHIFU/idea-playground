export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Fixed-step, damped elastic modes plus a localized surface spring. All dimensions
// are metres. The body floor is y=0; mesh points are also clamped at contact.
export class SlimePhysics {
  constructor() { this.softness = .70; this.damping = .45; this.reset(); }
  reset() {
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.squash = 0; this.squashV = 0; this.shear = 0; this.shearV = 0;
    this.local = [0, 0, 0]; this.localV = [0, 0, 0];
    this.anchor = [0, 1.1, 1]; this.normal = [0, 0, 1];
    this.target = [0, 0, 0]; this.dragging = false; this.age = 0; this.impacts = 0;
  }
  grab(anchor, normal) {
    this.anchor = [...anchor]; this.normal = [...normal]; this.target = [0, 0, 0];
    this.dragging = true; this.age = 0;
    this.squashV += .6;
  }
  drag(delta) { this.target = [clamp(delta[0], -2.3, 2.3), clamp(delta[1], -1.5, 2.8), clamp(delta[2], -1, 1)]; }
  release() {
    if (!this.dragging) return;
    this.dragging = false;
    this.vx = clamp(this.vx + this.localV[0] * .18, -2.4, 2.4);
    this.vy = clamp(this.vy + Math.max(0, this.localV[1]) * .16, -3, 3.6);
    this.shearV += this.local[0] * .9;
  }
  poke() {
    this.release(); this.vy = 2.2; this.squashV = 2.4;
    this.localV[2] = -1.4; this.shearV = (this.shearV > 0 ? -1 : 1) * .7;
  }
  step(dt) {
    const k = 48 + (1 - this.softness) * 116;
    const damping = 1.3 + this.damping * 11;
    this.age += dt;
    let bodyX = 0, bodyY = 0;
    if (this.dragging) {
      bodyX = this.target[0] * .29;
      bodyY = Math.max(0, this.target[1] - .25) * .58;
      this.vx += ((bodyX - this.x) * 28 - this.vx * 7) * dt;
      this.vy += ((bodyY - this.y) * 34 - this.vy * 7) * dt;
    } else {
      this.vx += (-this.x * 5 - this.vx * 2.5) * dt;
      this.vy -= 5.6 * dt;
    }
    this.x = clamp(this.x + this.vx * dt, -2, 2);
    this.y += this.vy * dt;
    if (this.y < 0) {
      if (this.vy < -.3) { this.squashV += Math.min(3.1, -this.vy * .9); this.impacts++; }
      this.y = 0;
      this.vy = Math.abs(this.vy) < .35 ? 0 : -this.vy * (.12 + (1 - this.damping) * .14);
    }
    let compress = this.dragging ? Math.max(0, -this.target[1]) * .2 + .035 : 0;
    this.squashV += ((compress - this.squash) * k - this.squashV * damping) * dt;
    this.squash = clamp(this.squash + this.squashV * dt, -.28, .4);
    this.shearV += (-this.shear * k * .55 - this.shearV * damping * .7) * dt;
    this.shear = clamp(this.shear + this.shearV * dt, -.3, .3);
    for (let j = 0; j < 3; j++) {
      const offset = j === 0 ? this.x : j === 1 ? this.y : 0;
      const dent = this.dragging ? -.14 * this.normal[j] * Math.exp(-this.age * 2) : 0;
      const goal = this.dragging ? this.target[j] - offset + dent : 0;
      this.localV[j] += ((goal - this.local[j]) * k - this.localV[j] * (this.dragging ? 15 : damping)) * dt;
      this.local[j] = clamp(this.local[j] + this.localV[j] * dt, -2.7, 3.1);
    }
  }
}
