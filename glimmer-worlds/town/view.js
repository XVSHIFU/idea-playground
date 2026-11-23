/* 栖川 · a small landscape observatory. All artwork is drawn locally. */
(function () {
  'use strict';

  const TW = 21;
  const TH = 10.5;
  const FONT = '"Microsoft YaHei", "PingFang SC", system-ui, sans-serif';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const point = (x, z, height = 0) => ({ x: (x - z) * TW, y: (x + z) * TH - height });
  const hash = (x, z, salt = 0) => {
    const n = Math.sin(x * 127.1 + z * 311.7 + salt * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  };
  const poly = (ctx, points, fill, stroke, width = 1) => {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  };
  const line = (ctx, points, color, width = 1) => {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  const ellipse = (ctx, x, y, rx, ry, color) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  };
  function rounded(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function contains(points, x, y) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i], b = points[j];
      if (((a.y > y) !== (b.y > y)) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }

  class TownView {
    constructor(canvas, engine, callbacks = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.engine = engine;
      this.callbacks = callbacks;
      this.layer = 'life';
      this.selection = null;
      this.hover = null;
      this.following = null;
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.pointers = new Map();
      this.drag = null;
      this.hits = [];
      this.props = [];
      this.cache = null;
      this.cacheKey = '';
      this.width = 1;
      this.height = 1;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._listeners = [];
      this.canvas.style.touchAction = 'none';
      this.canvas.style.cursor = 'grab';
      this.canvas.setAttribute('aria-label', '栖川等距地图。拖动平移，滚轮缩放，点击居民或建筑查看。');
      this._bindInput();
      this.resize();
      this.observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => this.resize()) : null;
      if (this.observer) this.observer.observe(this.canvas.parentElement || this.canvas);
    }

    get state() { return this.engine.state; }

    resize() {
      const rect = (this.canvas.parentElement || this.canvas).getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      const s = this.state;
      this.bounds = { left: -s.height * TW - 24, right: s.width * TW + 24, top: -66, bottom: (s.width + s.height) * TH + 40 };
      const bw = this.bounds.right - this.bounds.left, bh = this.bounds.bottom - this.bounds.top;
      this.fit = Math.max(0.12, Math.min((this.width - 30) / bw, (this.height - 58) / bh));
      this._camera();
    }

    _camera() {
      this.scale = this.fit * this.zoom;
      const b = this.bounds;
      this.origin = {
        x: this.width / 2 - (b.left + b.right) * this.scale / 2 + this.pan.x,
        y: this.height / 2 - (b.top + b.bottom) * this.scale / 2 + this.pan.y - 3
      };
    }

    _screen(p) { return { x: this.origin.x + p.x * this.scale, y: this.origin.y + p.y * this.scale }; }
    _local(event) { const r = this.canvas.getBoundingClientRect(); return { x: event.clientX - r.left, y: event.clientY - r.top }; }

    setEngine(engine) {
      this.engine = engine;
      this.cacheKey = '';
      this.selection = null;
      this.hover = null;
      this.following = null;
      this.home();
      this.resize();
    }

    setLayer(layer) { this.layer = ['life', 'mood', 'work'].includes(layer) ? layer : 'life'; }
    setSelection(kind, id) { this.selection = kind && id != null ? { kind, id } : null; }
    focusAgent(id) {
      const agent = this.state.agents.find(a => a.id === id);
      if (!agent) return;
      this.following = id;
      this.setSelection('agent', id);
      this.zoom = Math.max(this.zoom, 1.55);
      this._center(point(agent.x, agent.z), true);
    }

    focusBuilding(id) {
      const b = this.state.buildings.find(item => item.id === id);
      if (!b) return;
      this.following = null;
      this.setSelection('building', id);
      this.zoom = Math.max(this.zoom, 1.35);
      this._center(point(b.x + b.w / 2, b.z + b.d / 2, 14), true);
    }

    _center(p, immediate = false) {
      this._camera();
      const current = this._screen(p);
      const amount = immediate || this.reduceMotion ? 1 : 0.07;
      this.pan.x += (this.width / 2 - current.x) * amount;
      this.pan.y += (this.height * 0.48 - current.y) * amount;
      this._camera();
    }

    home() {
      this.zoom = 1;
      this.pan = { x: 0, y: 0 };
      this.following = null;
      this._camera();
    }

    zoomBy(factor, anchor = { x: this.width / 2, y: this.height / 2 }) {
      if (!Number.isFinite(factor)) return;
      const before = { x: (anchor.x - this.origin.x) / this.scale, y: (anchor.y - this.origin.y) / this.scale };
      this.zoom = clamp(this.zoom * factor, 0.6, 3.8);
      this._camera();
      const after = this._screen(before);
      this.pan.x += anchor.x - after.x;
      this.pan.y += anchor.y - after.y;
      this.following = null;
      this._camera();
    }

    _bindInput() {
      const on = (name, fn, options) => {
        this.canvas.addEventListener(name, fn, options);
        this._listeners.push([name, fn, options]);
      };
      on('pointerdown', event => {
        if (event.button !== 0 && event.pointerType !== 'touch') return;
        const p = this._local(event);
        this.pointers.set(event.pointerId, p);
        this.canvas.setPointerCapture(event.pointerId);
        this.drag = { start: p, last: p, moved: false, pinched: this.pointers.size > 1 };
        if (this.pointers.size === 2) {
          const [a, b] = [...this.pointers.values()];
          this.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
          this.pinchCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        }
        this.canvas.style.cursor = 'grabbing';
      });
      on('pointermove', event => {
        const p = this._local(event);
        if (this.pointers.has(event.pointerId)) {
          this.pointers.set(event.pointerId, p);
          if (this.pointers.size >= 2) {
            const [a, b] = [...this.pointers.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            if (this.pinchDistance > 0) this.zoomBy(distance / this.pinchDistance, center);
            if (this.pinchCenter) {
              this.pan.x += center.x - this.pinchCenter.x;
              this.pan.y += center.y - this.pinchCenter.y;
            }
            this.pinchDistance = distance;
            this.pinchCenter = center;
            this.drag.pinched = true;
            this.drag.moved = true;
          } else if (this.drag) {
            if (Math.hypot(p.x - this.drag.start.x, p.y - this.drag.start.y) > 4) this.drag.moved = true;
            if (this.drag.moved) {
              this.pan.x += p.x - this.drag.last.x;
              this.pan.y += p.y - this.drag.last.y;
              this.following = null;
            }
            this.drag.last = p;
          }
          this._camera();
          return;
        }
        this.hover = this._pick(p.x, p.y);
        this.canvas.style.cursor = this.hover ? 'pointer' : 'grab';
        if (this.callbacks.onHover) this.callbacks.onHover(this.hover?.kind || null, this.hover?.id ?? null, event.clientX, event.clientY);
      });
      const release = event => {
        if (!this.pointers.has(event.pointerId)) return;
        const p = this._local(event);
        const isClick = this.drag && !this.drag.moved && !this.drag.pinched && event.type !== 'pointercancel';
        this.pointers.delete(event.pointerId);
        if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
        if (isClick) {
          const hit = this._pick(p.x, p.y);
          this.setSelection(hit?.kind, hit?.id);
          if (!hit || hit.kind !== 'agent') this.following = null;
          if (this.callbacks.onSelect) this.callbacks.onSelect(hit?.kind || null, hit?.id ?? null);
        }
        if (this.pointers.size) {
          const next = [...this.pointers.values()][0];
          this.drag = { start: next, last: next, moved: true, pinched: true };
        } else { this.drag = null; this.pinchDistance = 0; this.pinchCenter = null; }
        this.canvas.style.cursor = this.hover ? 'pointer' : 'grab';
      };
      on('pointerup', release);
      on('pointercancel', release);
      on('pointerleave', () => { this.hover = null; if (this.callbacks.onHover) this.callbacks.onHover(null, null); });
      on('wheel', event => { event.preventDefault(); this.zoomBy(Math.exp(-event.deltaY * 0.0013), this._local(event)); }, { passive: false });
    }

    _pick(x, y) {
      let nearest = null, distance = 12;
      for (const hit of this.hits) {
        if (hit.kind !== 'agent') continue;
        const d = Math.hypot(x - hit.center.x, y - hit.center.y);
        if (d < Math.max(9, hit.radius) && d < distance) { nearest = hit; distance = d; }
      }
      if (nearest) return { kind: nearest.kind, id: nearest.id };
      for (let i = this.hits.length - 1; i >= 0; i--) {
        const hit = this.hits[i];
        if (hit.kind === 'building' && contains(hit.polygon, x, y)) return { kind: hit.kind, id: hit.id };
      }
      return null;
    }

    _visibleTile(tile) {
      if (!tile) return false;
      if (tile.occupied || ['road', 'bridge', 'water', 'field'].includes(tile.kind)) return true;
      const s = this.state, x = tile.x, z = tile.z;
      return x + z >= 2 && (s.width - 1 - x) + z >= 2 && x + (s.height - 1 - z) >= 2 && (s.width - 1 - x) + (s.height - 1 - z) >= 2;
    }

    _ensureTerrain() {
      const s = this.state;
      const key = `${s.seed}:${s.width}:${s.height}:${s.season}:${s.weather === '干旱' || s.weather === '旱' ? 'dry' : ''}:${s.buildings.length}`;
      if (this.cache && this.cacheKey === key) return;
      this.cacheKey = key;
      this.props = [];
      const margin = 70, left = -s.height * TW - margin, top = -margin;
      const width = (s.width + s.height) * TW + margin * 2;
      const height = (s.width + s.height) * TH + margin * 2;
      const cache = document.createElement('canvas');
      cache.width = Math.ceil(width); cache.height = Math.ceil(height);
      const ctx = cache.getContext('2d');
      ctx.translate(-left, -top);
      const winter = s.season === '冬', autumn = s.season === '秋';
      const ground = winter ? ['#d7decb', '#d2dac6', '#dce1d0', '#ccd6bf'] : autumn ? ['#bdc193', '#b7bc8c', '#c4c69b', '#b1b986'] : ['#abbf92', '#b0c497', '#b5c89b', '#a7bc8c'];
      const occupied = (x, z) => s.buildings.some(b => x > b.x - 0.7 && x < b.x + b.w + 0.7 && z > b.z - 0.7 && z < b.z + b.d + 0.7);
      const tileAt = (x, z) => x >= 0 && z >= 0 && x < s.width && z < s.height ? s.tiles[z * s.width + x] : null;
      const sorted = [...s.tiles].filter(t => this._visibleTile(t)).sort((a, b) => a.x + a.z - b.x - b.z);
      for (const tile of sorted) {
        const { x, z, kind } = tile;
        const A = point(x, z), B = point(x + 1, z), C = point(x + 1, z + 1), D = point(x, z + 1);
        const water = kind === 'water';
        const depth = water ? 13 : 21;
        if (!this._visibleTile(tileAt(x + 1, z))) {
          poly(ctx, [B, C, { x: C.x, y: C.y + depth }, { x: B.x, y: B.y + depth }], water ? '#699da6' : '#a19376');
          if (!water) line(ctx, [{ x: B.x, y: B.y + 6 }, { x: C.x, y: C.y + 6 }], '#b8aa89', 3);
        }
        if (!this._visibleTile(tileAt(x, z + 1))) {
          poly(ctx, [D, C, { x: C.x, y: C.y + depth }, { x: D.x, y: D.y + depth }], water ? '#81b4bb' : '#b6a584');
          if (!water) line(ctx, [{ x: D.x, y: D.y + 6 }, { x: C.x, y: C.y + 6 }], '#c9b898', 3);
        }
        let fill = ground[Math.floor(hash(x, z, s.seed) * ground.length)];
        if (water) fill = ['#83b8bd', '#79afb6', '#7db4b9'][Math.floor(hash(x, z, 2) * 3)];
        else if (kind === 'road') fill = ['#dbd2b7', '#ded6bd', '#d8ceb1'][Math.floor(hash(x, z, 2) * 3)];
        else if (kind === 'bridge') fill = '#c5b899';
        else if (kind === 'field') fill = winter ? '#b7b89a' : '#a5ac70';
        poly(ctx, [A, B, C, D], fill);
        if (kind === 'road') {
          if (hash(x, z, 7) > 0.68) {
            const pebble = point(x + 0.2 + hash(x, z, 8) * 0.6, z + 0.2 + hash(x, z, 9) * 0.6);
            ellipse(ctx, pebble.x, pebble.y, 1.4, 0.65, '#bfb599');
          }
          for (const [dx, dz, p1, p2] of [[-1, 0, A, D], [1, 0, B, C], [0, -1, A, B], [0, 1, D, C]]) {
            const neighbor = tileAt(x + dx, z + dz);
            if (neighbor && neighbor.kind !== 'road' && neighbor.kind !== 'bridge') line(ctx, [p1, p2], '#aab58b', 1);
          }
        } else if (kind === 'bridge') {
          for (let i = 0; i < 5; i++) line(ctx, [point(x + i / 5, z, 3), point(x + i / 5, z + 1, 3)], '#b0a280', 0.8);
          if (tileAt(x, z - 1)?.kind !== 'bridge') {
            line(ctx, [point(x, z, 9), point(x + 1, z, 9)], '#e7d9b9', 2.5);
            line(ctx, [point(x, z), point(x, z, 10)], '#a49372', 2.5);
          }
          if (tileAt(x, z + 1)?.kind !== 'bridge') {
            line(ctx, [point(x, z + 1, 9), point(x + 1, z + 1, 9)], '#f0e3c6', 2.5);
            line(ctx, [point(x + 1, z + 1), point(x + 1, z + 1, 10)], '#a49372', 2.5);
          }
        } else if (kind === 'field') {
          for (let i = 0; i < 4; i++) {
            line(ctx, [point(x + 0.08, z + 0.12 + i * 0.23), point(x + 0.92, z + 0.12 + i * 0.23)], winter ? '#9b9f7f' : '#c1bc78', 2.4);
          }
        } else if (kind === 'grass' && !occupied(x + 0.5, z + 0.5)) {
          const n = hash(x, z, s.seed + 21);
          const border = x < 3 || z < 2 || x > s.width - 3 || z > s.height - 3;
          const density = x < 6 ? 0.43 : border ? 0.35 : 0.085;
          if (n < density) {
            this.props.push({ type: 'tree', x: x + 0.25 + hash(x, z, 11) * 0.5, z: z + 0.25 + hash(x, z, 12) * 0.5, size: 0.7 + hash(x, z, 13) * 0.55, variant: hash(x, z, 14) > 0.63 ? 'pine' : 'round', seed: n });
          } else if (n > 0.87) {
            const p = point(x + 0.5, z + 0.5);
            const grassColor = winter ? '#b8c4ac' : '#92aa76';
            for (let i = 0; i < 3; i++) {
              const q = point(x + 0.2 + hash(x, z, 20 + i) * 0.6, z + 0.2 + hash(x, z, 30 + i) * 0.6);
              line(ctx, [{ x: q.x - 1.6, y: q.y - 1 }, { x: q.x, y: q.y - 3.5 }, { x: q.x + 1.6, y: q.y - 1 }], grassColor, 0.8);
            }
            if (n > 0.97 && !winter) {
              ellipse(ctx, p.x + 2, p.y - 3, 1.4, 1.1, autumn ? '#d8a36d' : '#eee3b2');
              ellipse(ctx, p.x - 3, p.y - 2, 1.2, 1.1, '#e3d2c1');
            }
          }
        }
        if (water) {
          for (const [dx, dz, p1, p2] of [[-1, 0, A, D], [1, 0, B, C], [0, -1, A, B], [0, 1, D, C]]) {
            const neighbor = tileAt(x + dx, z + dz);
            if (neighbor && !['water', 'bridge'].includes(neighbor.kind)) line(ctx, [p1, p2], '#b8d0b1', 2.3);
          }
        }
      }
      this.cache = { canvas: cache, left, top };
    }

    _tree(ctx, item) {
      const p = point(item.x, item.z), k = item.size || 1;
      const winter = this.state.season === '冬', autumn = this.state.season === '秋';
      const sway = this.reduceMotion ? 0 : Math.sin(this.animationTime * 0.7 + item.x) * 0.5;
      ellipse(ctx, p.x + 5 * k, p.y + 1, 11 * k, 4.5 * k, 'rgba(48,76,51,0.15)');
      line(ctx, [{ x: p.x, y: p.y }, { x: p.x + sway, y: p.y - 24 * k }], '#877b57', 2.8 * k);
      if (item.variant === 'pine') {
        const dark = winter ? '#789381' : '#3f745b', light = winter ? '#a5b4a0' : '#5f8b64';
        for (let i = 0; i < 3; i++) {
          const y = p.y - (8 + i * 8) * k, r = (13 - i * 2.5) * k;
          poly(ctx, [{ x: p.x - r + sway, y }, { x: p.x + sway, y: y - 18 * k }, { x: p.x + r + sway, y }], dark);
          poly(ctx, [{ x: p.x - r + sway, y }, { x: p.x + sway, y: y - 18 * k }, { x: p.x + 2 * k + sway, y: y - 2 * k }], light);
          if (winter) line(ctx, [{ x: p.x - r * 0.65, y: y - 5 * k }, { x: p.x, y: y - 18 * k }, { x: p.x + r * 0.3, y: y - 12 * k }], '#dce3d6', 2.5 * k);
        }
      } else {
        const tones = winter ? ['#a4b5a0', '#c7d1bb', '#dce1d0'] : autumn ? ['#9a9b57', '#c0ab62', '#d0b373'] : ['#528063', '#749665', '#8ca773'];
        ellipse(ctx, p.x + 3 * k + sway, p.y - 20 * k, 12 * k, 12.5 * k, tones[0]);
        ellipse(ctx, p.x - 5 * k + sway, p.y - 23 * k, 10 * k, 11 * k, tones[1]);
        ellipse(ctx, p.x + sway, p.y - 31 * k, 9 * k, 10 * k, tones[1]);
        ellipse(ctx, p.x - 3 * k + sway, p.y - 31 * k, 6.5 * k, 7.5 * k, tones[2]);
        line(ctx, [{ x: p.x, y: p.y - 10 * k }, { x: p.x - 4 * k, y: p.y - 22 * k }], '#7c8055', 1.2 * k);
      }
    }

    _box(ctx, x, z, w, d, height, colors, base = 0) {
      const A = point(x, z, base + height), B = point(x + w, z, base + height), C = point(x + w, z + d, base + height), D = point(x, z + d, base + height);
      poly(ctx, [B, C, point(x + w, z + d, base), point(x + w, z, base)], colors[2] || colors[1]);
      poly(ctx, [D, C, point(x + w, z + d, base), point(x, z + d, base)], colors[1]);
      poly(ctx, [A, B, C, D], colors[0]);
    }

    _roof(ctx, x, z, w, d, height, rise, colors) {
      const e = 0.12;
      const A = point(x - e, z - e, height), B = point(x + w + e, z - e, height), C = point(x + w + e, z + d + e, height), D = point(x - e, z + d + e, height);
      const R0 = point(x - e, z + d / 2, height + rise), R1 = point(x + w + e, z + d / 2, height + rise);
      poly(ctx, [B, R1, C], colors[2] || '#d1bf98');
      poly(ctx, [A, B, R1, R0], colors[1]);
      poly(ctx, [R0, R1, C, D], colors[0]);
      line(ctx, [R0, R1], colors[3] || '#df9470', 1.5);
      line(ctx, [D, C], 'rgba(74,56,41,0.2)', 1.4);
      for (let i = 0.28; i < w; i += 0.32) {
        line(ctx, [point(x + i, z + d / 2, height + rise), point(x + i, z + d + e, height)], 'rgba(255,222,179,0.13)', 0.8);
      }
      if (this.state.season === '冬') {
        poly(ctx, [R0, R1, { x: mix(R1.x, C.x, 0.35), y: mix(R1.y, C.y, 0.35) }, { x: mix(R0.x, D.x, 0.5), y: mix(R0.y, D.y, 0.5) }], '#e8e8d9');
      }
    }

    _window(ctx, x, z, face, height, width = 0.25, tall = 6, lit = false) {
      const points = face === 'z' ? [point(x, z, height + tall), point(x + width, z, height + tall), point(x + width, z, height), point(x, z, height)] : [point(x, z, height + tall), point(x, z + width, height + tall), point(x, z + width, height), point(x, z, height)];
      poly(ctx, points, lit ? '#f2ce80' : '#68817a', lit ? '#a98b56' : '#b4a98e', 0.6);
      const centerTop = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
      const centerBottom = { x: (points[2].x + points[3].x) / 2, y: (points[2].y + points[3].y) / 2 };
      line(ctx, [centerTop, centerBottom], lit ? '#c79d63' : '#b1b69a', 0.65);
    }

    _awning(ctx, x, z, width, height, color) {
      const count = Math.max(4, Math.round(width * 6));
      for (let i = 0; i < count; i++) {
        const x0 = x + width * i / count, x1 = x + width * (i + 1) / count;
        poly(ctx, [point(x0, z, height + 3), point(x1, z, height + 3), point(x1, z + 0.48, height), point(x0, z + 0.48, height)], i % 2 ? '#ece1c4' : color);
        poly(ctx, [point(x0, z + 0.48, height), point(x1, z + 0.48, height), point(x1, z + 0.48, height - 3), point(x0, z + 0.48, height - 3)], i % 2 ? '#d4c5a3' : color);
      }
      line(ctx, [point(x, z + 0.48), point(x, z + 0.48, height)], '#897b59', 1.3);
      line(ctx, [point(x + width, z + 0.48), point(x + width, z + 0.48, height)], '#897b59', 1.3);
    }

    _building(ctx, b) {
      const x = b.x + 0.12, z = b.z + 0.12, w = Math.max(0.6, b.w - 0.24), d = Math.max(0.6, b.d - 0.24);
      const seed = hash(b.x, b.z, 18), lit = this.night > 0.25;
      const selected = this.selection?.kind === 'building' && this.selection.id === b.id;
      if (selected || this.hover?.kind === 'building' && this.hover.id === b.id) {
        poly(ctx, [point(b.x - 0.12, b.z - 0.12, 1), point(b.x + b.w + 0.12, b.z - 0.12, 1), point(b.x + b.w + 0.12, b.z + b.d + 0.12, 1), point(b.x - 0.12, b.z + b.d + 0.12, 1)], selected ? 'rgba(243,219,157,0.42)' : 'rgba(255,245,210,0.26)', '#e4bf6b', 2.4);
      }
      if (b.type === 'park') {
        this._park(ctx, b);
        this._buildingHit(b, 20);
        return;
      }
      const progress = Number.isFinite(b.progress) ? b.progress : 1;
      if (progress < 1) { this._construction(ctx, b, progress); this._buildingHit(b, 26); return; }
      const baseHeight = { house: 22, farm: 18, market: 23, workshop: 27, clinic: 25, cafe: 21, hall: 35, sawmill: 22 }[b.type] || 23;
      const h = baseHeight + (b.type === 'house' && seed > 0.63 ? 8 : 0) + Math.max(0, (b.level || 1) - 1) * 5;
      const foundation = [point(x, z, 0), point(x + w, z), point(x + w + 0.5, z + d + 0.25), point(x + 0.5, z + d + 0.25)];
      poly(ctx, foundation.map(p => ({ x: p.x + 9, y: p.y + 3 })), 'rgba(54,66,43,0.16)');
      this._box(ctx, x - 0.05, z - 0.05, w + 0.1, d + 0.1, 3, ['#d4ccb1', '#bfb497', '#a99e84']);
      let walls = ['#eddfbf', '#e6d6b3', '#cbb994'];
      let roof = ['#bd7354', '#a96049', '#d4bb93', '#db9270'];
      if (b.type === 'workshop') { walls = ['#c4b19a', '#b5a18a', '#998a78']; roof = ['#637c77', '#526c67', '#a99c85', '#91a294']; }
      if (b.type === 'clinic') { walls = ['#f2e9d0', '#eae0c4', '#d2c6a8']; roof = ['#6e9686', '#5a8074', '#e2d5b9', '#91b09a']; }
      if (b.type === 'cafe') { walls = ['#e7cdb8', '#dfbca3', '#c39e84']; roof = ['#be765d', '#a66050', '#d9b69b', '#dc9a7c']; }
      if (b.type === 'sawmill') { walls = ['#bd9b6e', '#ac895d', '#8c704d']; roof = ['#7d8b72', '#65745f', '#aa8d65', '#9baa8b']; }
      if (b.type === 'farm') { this._farm(ctx, b, h, lit); this._buildingHit(b, h + 14); return; }
      if (b.type === 'house' && seed < 0.3) roof = ['#8d9782', '#74816e', '#ccbe9d', '#adb29a'];
      this._box(ctx, x, z, w, d, h, walls, 3);
      const doorX = x + w * 0.45;
      poly(ctx, [point(doorX, z + d + 0.015, 13), point(doorX + 0.28, z + d + 0.015, 13), point(doorX + 0.28, z + d + 0.015, 3), point(doorX, z + d + 0.015, 3)], '#746e55');
      const door = point(doorX + 0.22, z + d + 0.03, 7);
      ellipse(ctx, door.x, door.y, 0.65, 0.65, '#d6bf83');
      const numberWindows = Math.max(1, Math.floor(w / 0.7));
      for (let i = 0; i < numberWindows; i++) {
        const wx = x + 0.2 + i * (w - 0.2) / numberWindows;
        if (i !== Math.floor(numberWindows / 2) || h > 26) this._window(ctx, wx, z + d + 0.02, 'z', h > 26 ? 19 : 10, 0.26, 6, lit && hash(b.x, i, 2) > 0.2);
      }
      for (let i = 0; i < Math.max(1, Math.floor(d / 0.7)); i++) this._window(ctx, x + w + 0.02, z + 0.22 + i * 0.68, 'x', h > 26 ? 18 : 9, 0.28, 6, lit);
      this._roof(ctx, x, z, w, d, h + 3, b.type === 'hall' ? 16 : 13, roof);
      if (b.type === 'market') {
        this._awning(ctx, x + 0.05, z + d, w - 0.1, 15, '#bb7955');
        for (let i = 0; i < 3; i++) this._box(ctx, x + 0.12 + i * 0.44, z + d + 0.1, 0.34, 0.26, 4, [i === 0 ? '#b4bb6d' : i === 1 ? '#ca9b54' : '#aa7756', '#b29b6e', '#9b865d']);
        const flag = point(x + w * 0.8, z + d * 0.5, h + 34);
        line(ctx, [flag, { x: flag.x, y: flag.y + 18 }], '#77775b', 1);
        poly(ctx, [flag, { x: flag.x + 11, y: flag.y + 3 }, { x: flag.x, y: flag.y + 8 }], '#d6b469');
      } else if (b.type === 'cafe') {
        this._awning(ctx, x + 0.05, z + d, w * 0.75, 14, '#668c78');
        for (let i = 0; i < 2; i++) {
          const p = point(x + 0.4 + i * 0.75, z + d + 0.65, 5);
          line(ctx, [{ x: p.x, y: p.y }, { x: p.x, y: p.y + 6 }], '#8e7f5b', 1.4);
          ellipse(ctx, p.x, p.y, 5.7, 3.1, '#e3d3ac');
          ellipse(ctx, p.x + 1, p.y - 1.2, 1.1, 1, '#f5ebd2');
        }
      } else if (b.type === 'clinic') {
        const p = point(x + w * 0.66, z + d + 0.03, 21);
        ctx.fillStyle = '#f0e8cf'; ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
        ctx.fillStyle = '#6c927b'; ctx.fillRect(p.x - 1.3, p.y - 3.6, 2.6, 7.2); ctx.fillRect(p.x - 3.6, p.y - 1.3, 7.2, 2.6);
      } else if (b.type === 'hall') {
        const tx = x + w * 0.35, tz = z + d * 0.28;
        this._box(ctx, tx, tz, 0.65, 0.65, 20, ['#ece1bd', '#dfd0a9', '#c4b38b'], h + 10);
        this._roof(ctx, tx, tz, 0.65, 0.65, h + 30, 11, roof);
        const clock = point(tx + 0.34, tz + 0.67, h + 21);
        ellipse(ctx, clock.x, clock.y, 4.2, 4.2, '#f3e8c9');
        const hand = (this.state.time % 12) / 12 * Math.PI * 2 - Math.PI / 2;
        line(ctx, [{ x: clock.x, y: clock.y - 2.7 }, clock, { x: clock.x + Math.cos(hand) * 2.2, y: clock.y + Math.sin(hand) * 2.2 }], '#7b7a61', 0.85);
      } else if (b.type === 'workshop' || b.type === 'house') {
        const cx = x + w * 0.22, cz = z + d * 0.43;
        this._box(ctx, cx, cz, 0.23, 0.25, b.type === 'workshop' ? 23 : 12, ['#aa9580', '#927e6a', '#7b6c5b'], h + 8);
        if (b.type === 'workshop' || this.night > 0.2) this._smoke(ctx, point(cx + 0.12, cz + 0.12, h + (b.type === 'workshop' ? 32 : 21)), b.id);
      } else if (b.type === 'sawmill') {
        for (let i = 0; i < 3; i++) {
          const a = point(x + 0.25 + i * 0.33, z + d + 0.2, 3);
          const b2 = point(x + 0.25 + i * 0.33, z + d + 0.8, 3);
          line(ctx, [a, b2], '#b39462', 5);
          ellipse(ctx, b2.x, b2.y, 2.8, 2.8, '#d1b985');
          ellipse(ctx, b2.x, b2.y, 1.1, 1.1, '#aa8759');
        }
      }
      if (this.layer === 'work' && b.type !== 'house' && b.type !== 'park') this._workBadge(ctx, b, h + 28);
      this._buildingHit(b, h + (b.type === 'hall' ? 42 : 18));
    }

    _farm(ctx, b, h, lit) {
      const x = b.x + 0.12, z = b.z + 0.12, w = Math.min(1.05, b.w - 0.22), d = Math.min(1.1, b.d - 0.22);
      for (let i = 0; i < 5; i++) {
        const rz = b.z + 0.2 + (b.d - 0.3) * i / 5;
        line(ctx, [point(b.x + w + 0.2, rz), point(b.x + b.w - 0.1, rz)], '#b8ad69', 3.5);
        for (let j = 0; j < Math.max(1, Math.floor((b.w - w) * 3)); j++) {
          const q = point(b.x + w + 0.25 + j * 0.24, rz, 1);
          line(ctx, [{ x: q.x - 1, y: q.y }, { x: q.x, y: q.y - 3.5 }, { x: q.x + 1.5, y: q.y - 1 }], this.state.season === '秋' ? '#d0af60' : '#6e945a', 1.2);
        }
      }
      this._box(ctx, x, z, w, d, h, ['#dfc59e', '#cfb58c', '#b89b74']);
      this._roof(ctx, x, z, w, d, h, 13, ['#b96c4e', '#a25b43', '#c8ac85', '#d79069']);
      this._window(ctx, x + w + 0.02, z + d * 0.35, 'x', 8, 0.24, 5, lit);
      poly(ctx, [point(x + 0.3, z + d + 0.02, 10), point(x + 0.7, z + d + 0.02, 10), point(x + 0.7, z + d + 0.02), point(x + 0.3, z + d + 0.02)], '#8f7958');
      const hay = point(x + 0.5, z + d + 0.45);
      ellipse(ctx, hay.x, hay.y - 3, 6, 3.5, '#c4aa66'); ellipse(ctx, hay.x, hay.y - 5.5, 6, 3, '#d8c084');
      if (this.layer === 'work') this._workBadge(ctx, b, h + 24);
    }

    _park(ctx, b) {
      const x = b.x, z = b.z;
      poly(ctx, [point(x + 0.1, z + 0.1), point(x + b.w - 0.1, z + 0.1), point(x + b.w - 0.1, z + b.d - 0.1), point(x + 0.1, z + b.d - 0.1)], '#a0b58b');
      line(ctx, [point(x + 0.2, z + b.d / 2), point(x + b.w - 0.2, z + b.d / 2)], '#d6cdb2', 7);
      line(ctx, [point(x + b.w / 2, z + 0.1), point(x + b.w / 2, z + b.d - 0.1)], '#d6cdb2', 7);
      const center = point(x + b.w / 2, z + b.d / 2, 2);
      ellipse(ctx, center.x, center.y, 12, 6.5, '#dfd4b4'); ellipse(ctx, center.x, center.y - 1.2, 9.5, 4.7, '#87b8b3');
      line(ctx, [{ x: center.x, y: center.y - 2 }, { x: center.x, y: center.y - 11 }], '#e8edda', 1.2);
      for (const [dx, dz] of [[0.32, 0.4], [b.w - 0.35, b.d - 0.4]]) this._tree(ctx, { x: x + dx, z: z + dz, size: 0.64, variant: 'round' });
      const p1 = point(x + 0.35, z + b.d - 0.25, 3), p2 = point(x + 0.95, z + b.d - 0.25, 3);
      line(ctx, [p1, p2], '#a18a5f', 3); line(ctx, [{ x: p1.x, y: p1.y - 3 }, { x: p2.x, y: p2.y - 3 }], '#b8a174', 2);
    }

    _construction(ctx, b, progress) {
      const x = b.x + 0.12, z = b.z + 0.12, w = b.w - 0.24, d = b.d - 0.24;
      this._box(ctx, x, z, w, d, 3 + progress * 15, ['#d5c9a9', '#c3b696', '#b2a483']);
      const height = 30;
      for (const [dx, dz] of [[0, 0], [w, 0], [w, d], [0, d]]) line(ctx, [point(x + dx, z + dz), point(x + dx, z + dz, height)], '#a18c61', 1.6);
      for (const h of [10, 20, 30]) line(ctx, [point(x, z, h), point(x + w, z, h), point(x + w, z + d, h), point(x, z + d, h), point(x, z, h)], '#bba574', 1.4);
      line(ctx, [point(x, z + d), point(x + w, z + d, height)], '#b49d6b', 1.1);
      line(ctx, [point(x + w, z), point(x + w, z + d, height)], '#b49d6b', 1.1);
      const p = point(x + w / 2, z + d / 2, height + 14);
      rounded(ctx, p.x - 18, p.y - 5, 36, 12, 3); ctx.fillStyle = '#efe3be'; ctx.fill();
      rounded(ctx, p.x - 15, p.y - 1, 30, 4, 2); ctx.fillStyle = '#d6c9a2'; ctx.fill();
      if (progress > 0) { rounded(ctx, p.x - 15, p.y - 1, Math.max(2, 30 * progress), 4, 2); ctx.fillStyle = '#6f9278'; ctx.fill(); }
    }

    _workBadge(ctx, b, height) {
      const p = point(b.x + b.w / 2, b.z + b.d / 2, height);
      const workers = b.workers?.length || 0;
      const colors = { farm: '#809554', market: '#bd8e4d', workshop: '#6b8591', clinic: '#719582', cafe: '#bb886f', hall: '#8a8675', sawmill: '#937a56' };
      ellipse(ctx, p.x, p.y, 10, 10, colors[b.type] || '#7e967a');
      ctx.font = `bold 10px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fffaf0'; ctx.fillText(String(workers), p.x, p.y + 0.5);
    }

    _buildingHit(b, height) {
      const ps = [point(b.x, b.z, height * 0.7), point(b.x + b.w, b.z, height * 0.7), point(b.x + b.w, b.z + b.d, height * 0.7), point(b.x + b.w, b.z + b.d), point(b.x, b.z + b.d), point(b.x, b.z, height * 0.7)];
      this.hits.push({ kind: 'building', id: b.id, polygon: ps.map(p => this._screen(p)) });
    }

    _smoke(ctx, p, id) {
      if (this.reduceMotion) return;
      const salt = typeof id === 'number' ? id : String(id).length;
      for (let i = 0; i < 3; i++) {
        const phase = ((this.animationTime * 0.16 + i / 3 + salt * 0.1) % 1 + 1) % 1;
        const x = p.x + phase * 12 + Math.sin(phase * 4) * 2;
        const y = p.y - phase * 32;
        ellipse(ctx, x, y, 2 + phase * 5, 2 + phase * 3, `rgba(235,233,214,${(1 - phase) * 0.26})`);
      }
    }

    _agent(ctx, agent) {
      if (!Number.isFinite(agent.x) || !Number.isFinite(agent.z)) return;
      const p = point(agent.x, agent.z);
      const moving = Array.isArray(agent.path) && agent.path.length > 0 || /前往|走|赶|回家|路上|迁/.test(agent.action || '');
      const pace = moving && !this.reduceMotion ? Math.sin(this.state.time * 18 + (Number(agent.id) || 0)) : 0;
      const selected = this.selection?.kind === 'agent' && this.selection.id === agent.id;
      const hover = this.hover?.kind === 'agent' && this.hover.id === agent.id;
      const happiness = clamp(agent.happiness || 0, 0, 100);
      const coat = agent.color || ['#ab765b', '#668c90', '#ba9b5e', '#617a5d', '#8c7d9a'][Math.abs(Number(agent.id) || 0) % 5];
      if (this.layer === 'mood') ellipse(ctx, p.x, p.y, 9, 4.5, happiness > 65 ? 'rgba(76,137,99,0.45)' : happiness > 38 ? 'rgba(211,165,67,0.5)' : 'rgba(183,91,68,0.55)');
      if (selected || hover) {
        ctx.beginPath(); ctx.ellipse(p.x, p.y, selected ? 7.5 : 6, selected ? 4 : 3, 0, 0, Math.PI * 2); ctx.strokeStyle = selected ? '#f1d480' : '#fff4cf'; ctx.lineWidth = 1.7; ctx.stroke();
      }
      ellipse(ctx, p.x + 2, p.y + 0.5, 3.7, 1.6, 'rgba(40,62,48,0.24)');
      line(ctx, [{ x: p.x - 1.4, y: p.y - 3 }, { x: p.x - 1.6 + pace * 1.1, y: p.y }], '#595f52', 1.2);
      line(ctx, [{ x: p.x + 1.3, y: p.y - 3 }, { x: p.x + 1.6 - pace * 1.1, y: p.y }], '#595f52', 1.2);
      const bob = moving ? Math.abs(pace) * 0.55 : 0;
      rounded(ctx, p.x - 2.5, p.y - 9 - bob, 5, 6.6, 1.9); ctx.fillStyle = coat; ctx.fill();
      line(ctx, [{ x: p.x - 2.3, y: p.y - 7 - bob }, { x: p.x - 3.1, y: p.y - 4 + pace - bob }], coat, 1.3);
      line(ctx, [{ x: p.x + 2.3, y: p.y - 7 - bob }, { x: p.x + 3.1, y: p.y - 4 - pace - bob }], coat, 1.3);
      ellipse(ctx, p.x, p.y - 11 - bob, 2.35, 2.55, '#d5b190');
      ctx.beginPath(); ctx.arc(p.x, p.y - 11.7 - bob, 2.4, Math.PI, Math.PI * 2); ctx.fillStyle = '#5f5b49'; ctx.fill();
      if (/农|伐木/.test(agent.role || '')) {
        ellipse(ctx, p.x, p.y - 12 - bob, 4, 1.25, '#d3bc7b');
        ellipse(ctx, p.x, p.y - 13.3 - bob, 2.3, 1.5, '#d8c38a');
      }
      if (/休息|睡/.test(agent.action || '') && selected) {
        ctx.font = `8px ${FONT}`; ctx.fillStyle = '#576c5d'; ctx.textAlign = 'left'; ctx.fillText('z', p.x + 5, p.y - 13);
      }
      const center = this._screen({ x: p.x, y: p.y - 6 });
      this.hits.push({ kind: 'agent', id: agent.id, center, radius: 6.5 * this.scale });
    }

    _water(ctx) {
      const s = this.state, t = this.animationTime;
      for (const tile of s.tiles) {
        if (tile.kind !== 'water' || hash(tile.x, tile.z, 42) < 0.55) continue;
        const phase = this.reduceMotion ? 0.4 : (t * 0.12 + hash(tile.x, tile.z, 43)) % 1;
        const p = point(tile.x + 0.35 + phase * 0.3, tile.z + 0.25 + phase * 0.5, 0.5);
        const alpha = 0.12 + Math.sin(phase * Math.PI) * 0.22;
        line(ctx, [{ x: p.x - 5, y: p.y }, { x: p.x + 3, y: p.y - 1.8 }], `rgba(233,246,233,${alpha})`, 1.1);
        if (tile.z === s.height - 1) line(ctx, [{ x: p.x - 3, y: p.y + 7 }, { x: p.x - 3, y: p.y + 16 }], 'rgba(217,238,224,0.35)', 1.1);
      }
    }

    _nightLamps(ctx) {
      if (this.night < 0.08) return;
      for (const b of this.state.buildings) {
        if (b.type === 'farm' || b.type === 'park' || b.progress < 1) continue;
        const p = point(b.x + b.w * 0.65, b.z + b.d + 0.15, 4);
        const glow = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 17);
        glow.addColorStop(0, `rgba(250,209,120,${0.2 * this.night})`);
        glow.addColorStop(1, 'rgba(250,209,120,0)');
        ellipse(ctx, p.x, p.y, 22, 13, glow);
      }
    }

    _labels(ctx) {
      let item = this.selection || this.hover;
      if (!item) {
        if (this.zoom < 1.7 && this.layer === 'life') {
          for (const type of ['hall', 'market', 'farm']) {
            const b = this.state.buildings.find(x => x.type === type);
            if (!b) continue;
            const p = this._screen(point(b.x + b.w / 2, b.z + b.d / 2, type === 'hall' ? 80 : 49));
            this._label(ctx, p, b.name, null, true);
          }
        }
        return;
      }
      if (item.kind === 'agent') {
        const agent = this.state.agents.find(a => a.id === item.id);
        if (!agent) return;
        const p = this._screen(point(agent.x, agent.z, 20));
        this._label(ctx, p, agent.name, agent.action || agent.role, false);
      } else {
        const b = this.state.buildings.find(building => building.id === item.id);
        if (!b) return;
        const p = this._screen(point(b.x + b.w / 2, b.z + b.d / 2, b.type === 'hall' ? 86 : b.type === 'park' ? 42 : 61));
        this._label(ctx, p, b.name, b.progress < 1 ? `建造中 · ${Math.round(b.progress * 100)}%` : null, false);
      }
    }

    _label(ctx, p, title, subtitle, quiet) {
      if (!title || p.x < -70 || p.x > this.width + 70 || p.y < -50 || p.y > this.height + 50) return;
      ctx.save();
      const fontSize = quiet ? 10.5 : 12;
      ctx.font = `${quiet ? '500' : '600'} ${fontSize}px ${FONT}`;
      const textWidth = ctx.measureText(title).width;
      const subtitleWidth = subtitle ? (ctx.font = `10px ${FONT}`, ctx.measureText(subtitle).width) : 0;
      const width = Math.max(textWidth, subtitleWidth) + (quiet ? 16 : 22), height = subtitle ? 41 : quiet ? 22 : 28;
      const x = clamp(p.x - width / 2, 8, Math.max(8, this.width - width - 8));
      const y = clamp(p.y - height, 8, Math.max(8, this.height - height - 8));
      if (!quiet) { ctx.shadowColor = 'rgba(40,58,46,0.12)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; }
      rounded(ctx, x, y, width, height, quiet ? 4 : 6); ctx.fillStyle = quiet ? 'rgba(247,243,225,0.84)' : '#faf5e6'; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#315340'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${quiet ? '500' : '600'} ${fontSize}px ${FONT}`;
      ctx.fillText(title, x + width / 2, y + (subtitle ? 13 : height / 2));
      if (subtitle) { ctx.font = `10px ${FONT}`; ctx.fillStyle = '#6d7767'; ctx.fillText(subtitle, x + width / 2, y + 29); }
      if (!quiet) poly(ctx, [{ x: p.x - 3.5, y: y + height }, { x: p.x + 3.5, y: y + height }, { x: p.x, y: y + height + 4 }], '#faf5e6');
      ctx.restore();
    }

    _atmosphere(ctx) {
      const s = this.state, t = this.animationTime;
      const rain = /雨|暴风|风暴/.test(s.weather || '');
      const snow = s.season === '冬' && /雪|雨/.test(s.weather || '');
      if (rain && !this.reduceMotion) {
        ctx.save();
        ctx.strokeStyle = 'rgba(91,130,139,0.22)'; ctx.lineWidth = 0.8;
        for (let i = 0; i < 80; i++) {
          const x = (hash(i, 4, 18) * this.width + t * 18) % this.width;
          const y = (hash(i, 8, 19) * this.height + t * (snow ? 24 : 170)) % this.height;
          if (snow) ellipse(ctx, x, y, 1.7, 1.7, 'rgba(250,249,237,0.65)');
          else line(ctx, [{ x, y }, { x: x - 3, y: y + 8 }], 'rgba(99,134,142,0.26)', 0.8);
        }
        ctx.restore();
      }
      if (!rain && this.night < 0.3 && !this.reduceMotion) {
        ctx.save();
        for (let i = 0; i < 4; i++) {
          const travel = (t * 0.012 + i * 0.23) % 1;
          const x = this.width * (0.12 + travel * 0.8);
          const y = this.height * (0.13 + i * 0.035) + Math.sin(t * 0.3 + i) * 12;
          const flap = Math.sin(t * 5 + i) * 1.6;
          line(ctx, [{ x: x - 4, y: y - 2 + flap }, { x, y }, { x: x + 4, y: y - 2 + flap }], 'rgba(76,100,83,0.38)', 1);
        }
        ctx.restore();
      }
      if (this.night > 0.6 && !this.reduceMotion) {
        for (let i = 0; i < 20; i++) {
          const p = this._screen(point(1.5 + hash(i, 4) * 5, 2 + hash(i, 2) * 21, 4 + Math.sin(t + i) * 3));
          const a = (Math.sin(t * 1.5 + i * 2) + 1) * 0.2 * this.night;
          ellipse(ctx, p.x, p.y, 1.1, 1.1, `rgba(232,222,147,${a})`);
        }
      }
    }

    _compass(ctx) {
      const x = this.width - 33, y = this.height - 42;
      ctx.save(); ctx.globalAlpha = 0.7;
      line(ctx, [{ x: x - 8, y: y + 4 }, { x: x + 8, y: y - 4 }], '#89927c', 1);
      line(ctx, [{ x: x - 8, y: y - 4 }, { x: x + 8, y: y + 4 }], '#89927c', 1);
      poly(ctx, [{ x: x + 8, y: y - 4 }, { x: x + 3, y: y - 4 }, { x: x + 6, y: y }], '#536d57');
      ctx.font = `9px ${FONT}`; ctx.fillStyle = '#60745d'; ctx.textAlign = 'center'; ctx.fillText('北', x + 14, y - 9);
      ctx.restore();
    }

    draw(timestamp = 0) {
      if (!this.ctx || !this.state || this.width < 2 || this.height < 2) return;
      this.animationTime = this.reduceMotion ? 0 : timestamp / 1000;
      const hour = ((this.state.time % 24) + 24) % 24;
      this.night = hour < 5 ? 0.85 : hour < 7 ? (7 - hour) / 2 * 0.85 : hour < 17 ? 0 : hour < 20 ? (hour - 17) / 3 * 0.85 : 0.85;
      if (this.following != null) {
        const agent = this.state.agents.find(a => a.id === this.following);
        if (agent) this._center(point(agent.x, agent.z, 10)); else this.following = null;
      }
      this._camera();
      this._ensureTerrain();
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#f1efe6'; ctx.fillRect(0, 0, this.width, this.height);
      if (this.night > 0) { ctx.fillStyle = `rgba(74,98,101,${this.night * 0.16})`; ctx.fillRect(0, 0, this.width, this.height); }
      ctx.save();
      ctx.translate(this.origin.x, this.origin.y);
      ctx.scale(this.scale, this.scale);
      const s = this.state;
      const corners = [point(1, 1), point(s.width - 1, 1), point(s.width - 1, s.height - 1), point(1, s.height - 1)];
      ctx.save();
      ctx.shadowColor = 'rgba(51,63,47,0.18)'; ctx.shadowBlur = 27; ctx.shadowOffsetY = 20;
      poly(ctx, corners.map(p => ({ x: p.x, y: p.y + 12 })), '#babba6');
      ctx.restore();
      ctx.drawImage(this.cache.canvas, this.cache.left, this.cache.top);
      this._water(ctx);
      this.hits = [];
      const objects = [
        ...this.props.map(item => ({ kind: 'tree', item, depth: item.x + item.z })),
        ...s.buildings.map(item => ({ kind: 'building', item, depth: item.x + item.z + item.w + item.d - 0.2 })),
        ...s.agents.map(item => ({ kind: 'agent', item, depth: item.x + item.z + 0.05 }))
      ];
      objects.sort((a, b) => a.depth - b.depth || (a.kind === 'agent' ? 1 : -1));
      for (const object of objects) {
        if (object.kind === 'tree') this._tree(ctx, object.item);
        else if (object.kind === 'building') this._building(ctx, object.item);
        else this._agent(ctx, object.item);
      }
      if (this.night > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'source-atop';
        poly(ctx, [point(0, 0, 95), point(s.width, 0, 95), point(s.width, s.height), point(0, s.height)], `rgba(35,66,81,${this.night * 0.2})`);
        ctx.restore();
      }
      this._nightLamps(ctx);
      ctx.restore();
      this._atmosphere(ctx);
      this._labels(ctx);
      this._compass(ctx);
    }

    destroy() {
      for (const [name, fn, options] of this._listeners) this.canvas.removeEventListener(name, fn, options);
      this.observer?.disconnect();
      this.pointers.clear();
    }
  }

  window.TownView = TownView;
})();
