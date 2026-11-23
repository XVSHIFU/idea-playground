/* 弦汐 · Eight curved strings inside a suspended tidal resonator. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];
  const NOTES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const FONT = '"Microsoft YaHei", "PingFang SC", system-ui, sans-serif';
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hash = n => { const v = Math.sin(n * 127.13 + 76.7) * 43758.5453; return v - Math.floor(v); };

  function ellipse(ctx, x, y, rx, ry, color, stroke, lineWidth = 1) {
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU);
    if (color) { ctx.fillStyle = color; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  class TideView {
    constructor(canvas, callbacks = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.callbacks = callbacks;
      this.params = { tide: 0.58, light: 0.48, space: 0.5, drift: 0.22, volume: 0.55, voice: 'silk' };
      this.scale = [50, 53, 55, 57, 60, 62, 65, 67];
      this.octave = 0;
      this.active = false;
      this.level = 0;
      this.displayLevel = 0;
      this.time = 0;
      this.lastTimestamp = null;
      this.width = 1;
      this.height = 1;
      this.hover = -1;
      this.pointer = null;
      this.pointers = new Map();
      this.lastPluck = Array(8).fill(-Infinity);
      this.strings = Array.from({ length: 8 }, (_, i) => ({ energy: 0, age: 10, position: 0.5, phase: i * 0.71, flash: 0 }));
      this.ripples = [];
      this.particles = [];
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.listeners = [];
      this.canvas.style.touchAction = 'none';
      this.canvas.style.cursor = 'crosshair';
      this.canvas.setAttribute('aria-label', '弦汐，八弦数字乐器。点按或划过琴弦演奏；A、S、D、F、G、H、J、K 也可拨弦。');
      this._bind();
      this.resize();
      this.observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null;
      this.observer?.observe(canvas.parentElement || canvas);
    }

    resize() {
      const box = (this.canvas.parentElement || this.canvas).getBoundingClientRect();
      this.width = Math.max(1, box.width);
      this.height = Math.max(1, box.height);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      const narrow = this.width < 560;
      this.cx = this.width * 0.5;
      this.cy = this.height * (narrow ? 0.46 : 0.465);
      this.rx = Math.max(55, Math.min(this.width * (narrow ? 0.44 : 0.405), this.height * 0.91));
      this.ry = Math.max(35, Math.min(this.height * 0.32, this.rx * (narrow ? 0.78 : 0.535)));
      this.tilt = narrow ? -0.04 : -0.105;
      this.geometry = Array.from({ length: 8 }, (_, i) => {
        const fraction = (i - 3.5) / 3.5;
        const x = fraction * this.rx * 0.775;
        const half = this.ry * Math.sqrt(1 - Math.pow(x / (this.rx * 0.96), 2));
        return { x, top: -half * 0.91, bottom: half * 0.91, curve: this.rx * (0.048 - fraction * 0.008), width: 1.45 - i * 0.095 };
      });
    }

    setParams(partial = {}) {
      for (const key of ['tide', 'light', 'space', 'drift', 'volume']) {
        if (Number.isFinite(partial[key])) this.params[key] = clamp(partial[key], 0, 1);
      }
      if (['silk', 'glass', 'wood'].includes(partial.voice)) this.params.voice = partial.voice;
    }

    setActive(active) { this.active = Boolean(active); }
    setLevel(level) { this.level = Number.isFinite(level) ? clamp(level, 0, 1) : 0; }
    setScale(notes) { if (Array.isArray(notes) && notes.length === 8 && notes.every(Number.isFinite)) this.scale = [...notes]; }
    setOctave(octave) { if (Number.isFinite(octave)) this.octave = clamp(Math.round(octave), -1, 1); }

    pluck(index, velocity = 0.7, position = 0.5) {
      index = Math.round(index);
      if (index < 0 || index > 7 || !Number.isFinite(index)) return;
      velocity = clamp(Number.isFinite(velocity) ? velocity : 0.7, 0.05, 1);
      position = clamp(Number.isFinite(position) ? position : 0.5, 0.05, 0.95);
      const string = this.strings[index];
      string.energy = Math.min(1.6, string.energy * 0.25 + velocity * 1.25);
      string.age = 0;
      string.position = position;
      string.flash = velocity;
      for (let i = 0; i < 8; i++) {
        if (i === index) continue;
        const sympathy = velocity * 0.075 / (1 + Math.abs(index - i) * 0.4);
        this.strings[i].energy = Math.min(1.4, this.strings[i].energy + sympathy);
        if (this.strings[i].age > 4) this.strings[i].age = 0.6;
      }
      const p = this._stringPoint(index, position, false);
      this.ripples.push({ x: p.x, y: p.y, age: 0, velocity, index });
      if (this.ripples.length > 18) this.ripples.shift();
      if (!this.reduceMotion) {
        const count = 3 + Math.floor(velocity * 4);
        for (let i = 0; i < count; i++) {
          const seed = this.time * 13 + index * 71 + i * 7;
          const angle = hash(seed) * TAU;
          const speed = 7 + hash(seed + 1) * 18;
          this.particles.push({ x: p.x, y: p.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.55 - 7, age: 0, life: 0.65 + hash(seed + 2) * 0.95, velocity, radius: 0.6 + hash(seed + 3) * 0.7 });
        }
        if (this.particles.length > 110) this.particles.splice(0, this.particles.length - 110);
      }
    }

    _local(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - this.cx;
      const y = event.clientY - rect.top - this.cy;
      const c = Math.cos(this.tilt), s = Math.sin(this.tilt);
      return { x: x * c + y * s, y: -x * s + y * c };
    }

    _stringPoint(index, t, vibrate = true) {
      const g = this.geometry[index];
      let displacement = 0;
      const state = this.strings[index];
      if (vibrate && state.energy > 0.001) {
        if (this.reduceMotion) displacement = Math.sin(Math.PI * t) * state.energy * 2.5;
        else {
          for (let mode = 1; mode <= 4; mode++) {
            const harmonic = Math.sin(mode * Math.PI * state.position) / Math.pow(mode, 1.65);
            const damping = Math.exp(-state.age * (mode - 1) * (0.45 + this.params.light * 0.18));
            const phase = state.age * (13.5 + index * 0.75) * mode * Math.sqrt(1 + 0.018 * mode * mode);
            displacement += harmonic * Math.sin(mode * Math.PI * t) * Math.cos(phase) * damping;
          }
          displacement *= state.energy * Math.min(13, this.rx * 0.035);
        }
      }
      return { x: g.x + g.curve * Math.sin(Math.PI * t) + displacement, y: lerp(g.top, g.bottom, t) };
    }

    _nearest(p) {
      if (Math.pow(p.x / (this.rx * 1.08), 2) + Math.pow(p.y / (this.ry * 1.18), 2) > 1.2) return null;
      let best = null;
      for (let i = 0; i < 8; i++) {
        const g = this.geometry[i];
        const t = clamp((p.y - g.top) / (g.bottom - g.top), 0.04, 0.96);
        const q = this._stringPoint(i, t, false);
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (!best || distance < best.distance) best = { index: i, position: t, distance };
      }
      return best && best.distance < Math.max(18, this.rx * 0.15) ? best : null;
    }

    _trigger(index, velocity, position, stamp) {
      if (stamp - this.lastPluck[index] < 48) return;
      this.lastPluck[index] = stamp;
      this.pluck(index, velocity, position);
      if (this.callbacks.onPluck) this.callbacks.onPluck(index, velocity, position);
    }

    _bind() {
      const on = (name, callback, options) => {
        this.canvas.addEventListener(name, callback, options);
        this.listeners.push([name, callback, options]);
      };
      on('pointerdown', event => {
        if (event.button !== 0 && event.pointerType !== 'touch') return;
        const p = this._local(event);
        const nearest = this._nearest(p);
        if (!nearest) return;
        event.preventDefault();
        this.canvas.setPointerCapture(event.pointerId);
        this.pointers.set(event.pointerId, { p, stamp: event.timeStamp, index: nearest.index });
        this.hover = nearest.index;
        this.pointer = p;
        const pressure = event.pressure > 0 && event.pointerType !== 'mouse' ? clamp(0.3 + event.pressure * 0.7, 0.35, 0.95) : 0.68;
        this._trigger(nearest.index, pressure, nearest.position, event.timeStamp);
      });
      on('pointermove', event => {
        const p = this._local(event);
        const previous = this.pointers.get(event.pointerId);
        const nearest = this._nearest(p);
        this.hover = nearest?.index ?? -1;
        this.pointer = nearest ? p : null;
        this.canvas.style.cursor = nearest ? 'crosshair' : 'default';
        if (!previous) return;
        event.preventDefault();
        const delta = Math.max(4, event.timeStamp - previous.stamp);
        const speed = Math.hypot(p.x - previous.p.x, p.y - previous.p.y) / delta;
        const velocity = clamp(0.25 + Math.sqrt(speed) * 0.53, 0.25, 0.98);
        const crossings = [];
        for (let i = 0; i < 8; i++) {
          const g = this.geometry[i];
          const t0 = (previous.p.y - g.top) / (g.bottom - g.top), t1 = (p.y - g.top) / (g.bottom - g.top);
          const q0 = this._stringPoint(i, clamp(t0, 0, 1), false), q1 = this._stringPoint(i, clamp(t1, 0, 1), false);
          const d0 = previous.p.x - q0.x, d1 = p.x - q1.x;
          if (d0 * d1 <= 0 && Math.abs(d0 - d1) > 0.3) {
            const fraction = Math.abs(d0) / (Math.abs(d0) + Math.abs(d1));
            const t = lerp(t0, t1, fraction);
            if (t >= 0.035 && t <= 0.965) crossings.push({ index: i, position: t, fraction });
          }
        }
        crossings.sort((a, b) => a.fraction - b.fraction);
        for (const hit of crossings) this._trigger(hit.index, velocity, hit.position, event.timeStamp);
        this.pointers.set(event.pointerId, { p, stamp: event.timeStamp, index: nearest?.index ?? -1 });
      });
      const release = event => {
        this.pointers.delete(event.pointerId);
        if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
        if (event.pointerType === 'touch') { this.pointer = null; this.hover = -1; }
      };
      on('pointerup', release);
      on('pointercancel', release);
      on('pointerleave', () => { if (!this.pointers.size) { this.pointer = null; this.hover = -1; } });
    }

    _palette() {
      if (this.params.voice === 'glass') return { gold: [176, 199, 184], light: [157, 205, 206], bright: [223, 242, 231], dark: '#1d3b43' };
      if (this.params.voice === 'wood') return { gold: [206, 162, 99], light: [205, 178, 127], bright: [244, 225, 176], dark: '#34362e' };
      return { gold: [200, 163, 106], light: [143, 189, 181], bright: [226, 235, 212], dark: '#203b3e' };
    }

    _rgba(color, opacity) { return `rgba(${color[0]},${color[1]},${color[2]},${clamp(opacity, 0, 1)})`; }

    _body(ctx, palette, energy) {
      const rx = this.rx, ry = this.ry;
      const depth = Math.max(8, Math.min(20, rx * 0.05));
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.44)'; ctx.shadowBlur = rx * 0.11; ctx.shadowOffsetY = depth * 2;
      ellipse(ctx, 0, depth * 1.65, rx * 0.94, ry * 0.85, '#0b171d');
      ctx.restore();

      const shell = ctx.createLinearGradient(0, -ry, 0, ry + depth);
      shell.addColorStop(0, '#263c41'); shell.addColorStop(0.55, '#172d34'); shell.addColorStop(1, '#0d1b23');
      ellipse(ctx, 0, depth, rx, ry, shell, 'rgba(106,137,133,0.16)', 1);
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, depth, rx, ry, 0, 0.05, Math.PI - 0.05);
      ctx.strokeStyle = this._rgba(palette.gold, 0.23); ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();

      const rim = ctx.createLinearGradient(-rx, -ry, rx, ry);
      rim.addColorStop(0, '#718b7e'); rim.addColorStop(0.18, '#b7aa83'); rim.addColorStop(0.38, '#546c67'); rim.addColorStop(0.7, '#1b3439'); rim.addColorStop(1, '#728779');
      ellipse(ctx, 0, 0, rx, ry, '#193038', rim, 2.2);
      ellipse(ctx, 0, 0, rx - 6, ry - 5, '#142930', 'rgba(116,152,145,0.25)', 0.7);

      const bowl = ctx.createRadialGradient(-rx * 0.2, -ry * 0.35, 1, 0, 0, rx);
      bowl.addColorStop(0, palette.dark); bowl.addColorStop(0.48, '#152c34'); bowl.addColorStop(1, '#101f29');
      ellipse(ctx, 0, 0, rx - 11, ry - 9, bowl, 'rgba(8,20,27,0.6)', 1);

      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, 0, rx - 12, ry - 10, 0, 0, TAU); ctx.clip();
      const light = ctx.createRadialGradient(-rx * 0.28, -ry * 0.34, 0, -rx * 0.12, -ry * 0.2, rx * 0.8);
      light.addColorStop(0, this._rgba(palette.light, 0.045 + energy * 0.045)); light.addColorStop(1, this._rgba(palette.light, 0));
      ctx.fillStyle = light; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);

      // Resonance contours are generated from the current sound energy.
      const breath = this.reduceMotion ? 0 : Math.sin(this.time * 0.52) * this.params.drift * (this.active ? 1 : 0.15);
      for (let k = 0; k < 7; k++) {
        const radius = 0.17 + k * 0.108;
        const response = energy * (0.012 + k * 0.002);
        ctx.beginPath();
        for (let j = 0; j <= 100; j++) {
          const angle = j / 100 * TAU;
          const modal = (Math.sin(angle * 3 + this.time * 0.65) + Math.cos(angle * 5 - this.time * 0.25)) * response;
          const r = radius + (this.reduceMotion ? 0 : modal) + breath * 0.004;
          const x = Math.cos(angle) * rx * r, y = Math.sin(angle) * ry * r;
          if (!j) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.strokeStyle = this._rgba(palette.light, 0.028 + energy * 0.065); ctx.lineWidth = 0.65; ctx.stroke();
      }
      for (const ripple of this.ripples) {
        const life = 2.5 + this.params.space;
        const alpha = Math.pow(Math.max(0, 1 - ripple.age / life), 2) * ripple.velocity;
        const radius = this.reduceMotion ? 13 : 8 + ripple.age * (55 + this.params.space * 45);
        ellipse(ctx, ripple.x, ripple.y, radius, radius * 0.57, null, this._rgba(palette.light, alpha * 0.25), 0.8);
        if (!this.reduceMotion && ripple.age > 0.1) ellipse(ctx, ripple.x, ripple.y, radius * 0.72, radius * 0.40, null, this._rgba(palette.gold, alpha * 0.1), 0.55);
      }
      ctx.restore();

      // Two slim inset bridges carry the string anchors.
      for (const end of ['top', 'bottom']) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const g = this.geometry[i];
          const y = g[end];
          if (!i) ctx.moveTo(g.x, y); else ctx.lineTo(g.x, y);
        }
        ctx.strokeStyle = 'rgba(7,18,24,0.7)'; ctx.lineWidth = 6; ctx.stroke();
        ctx.strokeStyle = this._rgba(palette.gold, end === 'top' ? 0.3 : 0.42); ctx.lineWidth = 1.2; ctx.stroke();
      }

      ctx.beginPath(); ctx.ellipse(0, 0, rx - 1, ry - 1, 0, Math.PI * 1.04, Math.PI * 1.85);
      ctx.strokeStyle = this._rgba(palette.bright, 0.24); ctx.lineWidth = 0.7; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, rx - 1, ry - 1, 0, Math.PI * 0.12, Math.PI * 0.82);
      ctx.strokeStyle = this._rgba(palette.gold, 0.19); ctx.lineWidth = 0.7; ctx.stroke();
    }

    _drawString(ctx, index, palette) {
      const string = this.strings[index], g = this.geometry[index];
      const hover = this.hover === index;
      const energy = clamp(string.energy, 0, 1.4);
      const bright = 0.4 + this.params.light * 0.3 + energy * 0.3 + (hover ? 0.18 : 0);
      const color = index % 2 === 0 ? palette.gold : palette.light;
      const path = offset => {
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const p = this._stringPoint(index, j / 72, true);
          if (!j) ctx.moveTo(p.x + offset, p.y + 2); else ctx.lineTo(p.x + offset, p.y + 2);
        }
      };

      path(3); ctx.strokeStyle = 'rgba(2,12,18,0.43)'; ctx.lineWidth = 2.2; ctx.stroke();
      if (energy > 0.015 || hover) {
        path(0); ctx.strokeStyle = this._rgba(color, Math.min(0.1, 0.025 + energy * 0.07)); ctx.lineWidth = 8 + energy * 7; ctx.stroke();
        path(0); ctx.strokeStyle = this._rgba(color, Math.min(0.2, 0.06 + energy * 0.12)); ctx.lineWidth = 3.4 + energy * 3; ctx.stroke();
      }
      path(0);
      const gradient = ctx.createLinearGradient(g.x, g.top, g.x, g.bottom);
      gradient.addColorStop(0, this._rgba(color, 0.42));
      gradient.addColorStop(0.23, this._rgba(color, bright));
      gradient.addColorStop(0.55, this._rgba(palette.bright, Math.min(0.95, bright + 0.1)));
      gradient.addColorStop(0.82, this._rgba(color, bright));
      gradient.addColorStop(1, this._rgba(color, 0.43));
      ctx.strokeStyle = gradient; ctx.lineWidth = g.width + (hover ? 0.28 : 0); ctx.lineCap = 'round'; ctx.stroke();

      for (const y of [g.top, g.bottom]) {
        ellipse(ctx, g.x, y, 3.8, 3.5, '#1a2c30', this._rgba(palette.gold, 0.38), 0.8);
        ellipse(ctx, g.x - 0.3, y - 0.3, 1.4, 1.25, this._rgba(palette.bright, 0.45 + energy * 0.3));
      }
      if (string.flash > 0.015) {
        const p = this._stringPoint(index, string.position, true);
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11 + string.flash * 7);
        halo.addColorStop(0, this._rgba(palette.bright, string.flash * 0.52));
        halo.addColorStop(0.22, this._rgba(color, string.flash * 0.19));
        halo.addColorStop(1, this._rgba(color, 0));
        ellipse(ctx, p.x, p.y, 11 + string.flash * 7, 11 + string.flash * 7, halo);
        ellipse(ctx, p.x, p.y, 1.1 + string.flash, 1.1 + string.flash, this._rgba(palette.bright, string.flash * 0.8));
      }
      if (hover && this.pointer) {
        const t = clamp((this.pointer.y - g.top) / (g.bottom - g.top), 0.06, 0.94);
        const p = this._stringPoint(index, t, true);
        ellipse(ctx, p.x, p.y, 5.5, 5.5, null, this._rgba(palette.bright, 0.48), 0.7);
        ellipse(ctx, p.x, p.y, 1.7, 1.7, this._rgba(palette.bright, 0.75));
      }
    }

    _labels(ctx, palette) {
      const small = this.width < 460;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < 8; i++) {
        const g = this.geometry[i];
        const energy = clamp(this.strings[i].energy, 0, 1);
        const midi = Math.round(this.scale[i] + this.octave * 12);
        const label = NOTES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
        ctx.font = `400 ${small ? 8 : 9}px ${FONT}`;
        ctx.fillStyle = this._rgba(palette.gold, 0.4 + energy * 0.3);
        ctx.fillText(String(i + 1).padStart(2, '0'), g.x, g.top - (small ? 13 : 16));
        ctx.font = `500 ${small ? 10 : 12}px ${FONT}`;
        ctx.fillStyle = this._rgba(palette.bright, 0.53 + energy * 0.4 + (this.hover === i ? 0.1 : 0));
        ctx.fillText(label, g.x, g.bottom + (small ? 18 : 22));
        ctx.font = `400 ${small ? 8 : 9}px ${FONT}`;
        ctx.fillStyle = this._rgba(palette.light, 0.35 + energy * 0.4);
        ctx.fillText(KEYS[i], g.x, g.bottom + (small ? 33 : 39));
      }
    }

    _particles(ctx, palette) {
      for (const particle of this.particles) {
        const fade = Math.pow(Math.max(0, 1 - particle.age / particle.life), 2);
        const x = particle.x + particle.vx * particle.age;
        const y = particle.y + particle.vy * particle.age;
        ellipse(ctx, x, y, particle.radius, particle.radius, this._rgba(palette.bright, fade * particle.velocity * 0.62));
      }
    }

    _update(delta) {
      const decay = 0.68 + this.params.tide * 3.7;
      for (const string of this.strings) {
        string.age += delta;
        string.energy *= Math.exp(-delta / decay);
        string.flash *= Math.exp(-delta * 3.4);
        if (string.energy < 0.0005) string.energy = 0;
      }
      for (const ripple of this.ripples) ripple.age += delta;
      this.ripples = this.ripples.filter(ripple => ripple.age < 3.6);
      for (const particle of this.particles) particle.age += delta;
      this.particles = this.particles.filter(particle => particle.age < particle.life);
      this.displayLevel = lerp(this.displayLevel, this.level, 1 - Math.exp(-delta * 7));
    }

    draw(timestamp = 0) {
      if (!this.ctx || this.width < 2 || this.height < 2) return;
      const delta = this.lastTimestamp == null ? 0 : clamp((timestamp - this.lastTimestamp) / 1000, 0, 0.1);
      this.lastTimestamp = timestamp;
      this.time += delta;
      this._update(delta);
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#101c24'; ctx.fillRect(0, 0, this.width, this.height);
      const palette = this._palette();
      const energy = clamp(this.strings.reduce((sum, string) => sum + string.energy, 0) / 5 + this.displayLevel * 0.35, 0, 1);

      const ambient = ctx.createRadialGradient(this.cx, this.cy, this.rx * 0.12, this.cx, this.cy, this.rx * 1.55);
      ambient.addColorStop(0, 'rgba(49,77,77,0.15)'); ambient.addColorStop(0.63, 'rgba(28,53,61,0.08)'); ambient.addColorStop(1, 'rgba(16,28,36,0)');
      ctx.fillStyle = ambient; ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.translate(this.cx, this.cy);
      ctx.rotate(this.tilt);
      this._body(ctx, palette, energy);
      for (let i = 0; i < 8; i++) this._drawString(ctx, i, palette);
      this._particles(ctx, palette);
      this._labels(ctx, palette);
      ctx.restore();

      // A small measurement mark belongs to the instrument rather than a HUD.
      const markX = this.cx, markY = Math.min(this.height - 15, this.cy + this.ry + 70);
      ctx.save();
      ctx.strokeStyle = this._rgba(palette.gold, 0.18); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(markX - 23, markY); ctx.lineTo(markX - 7, markY); ctx.moveTo(markX + 7, markY); ctx.lineTo(markX + 23, markY); ctx.stroke();
      ellipse(ctx, markX, markY, 2.5, 2.5, null, this._rgba(palette.gold, this.active ? 0.5 + energy * 0.3 : 0.24), 0.7);
      if (this.active) ellipse(ctx, markX, markY, 0.9, 0.9, this._rgba(palette.bright, 0.4 + energy * 0.5));
      ctx.restore();
    }

    destroy() {
      for (const [name, callback, options] of this.listeners) this.canvas.removeEventListener(name, callback, options);
      this.observer?.disconnect();
      this.pointers.clear();
      this.ripples = [];
      this.particles = [];
    }
  }

  window.TideView = TideView;
})();
