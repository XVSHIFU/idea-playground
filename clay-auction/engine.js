(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ClayAuction = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const COLORS = ['#cd624c', '#527bb5', '#62876a'];
  const DEFAULTS = [
    { name: '甲', wish: '一个浅碟' },
    { name: '乙', wish: '一座高塔' },
    { name: '丙', wish: '带一个洞的东西' }
  ];
  const WIDTH = 800, HEIGHT = 570, RADIUS = 13;
  const base = Array.from({ length: 37 }, (_, i) => {
    const angle = i / 36 * Math.PI * 2;
    return [400 + 99 * Math.cos(angle), 396 + 28 * Math.sin(angle)];
  });
  function create(players = DEFAULTS, first = 0) {
    if (!Array.isArray(players) || players.length !== 3 || !Number.isInteger(first) || first < 0 || first > 2) throw new Error('请设置三位参与者。');
    return { version: 1, initial: players.map((p, i) => ({ name: String(p.name || DEFAULTS[i].name).trim().slice(0, 12), wish: String(p.wish || DEFAULTS[i].wish).trim().slice(0, 60) })), first,
      players: players.map((p, i) => ({ name: String(p.name || DEFAULTS[i].name).trim().slice(0, 12), wish: String(p.wish || DEFAULTS[i].wish).trim().slice(0, 60), color: COLORS[i], remaining: 5, out: false })),
      turn: first, leader: null, winner: null, status: 'playing', pieces: [], events: [], title: '' };
  }
  function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function segmentDistance(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return distance(p, [a[0] + t * dx, a[1] + t * dy]);
  }
  function samples(points) {
    const result = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const steps = Math.max(1, Math.ceil(distance(points[i - 1], points[i]) / 5));
      for (let k = 1; k <= steps; k++) result.push([points[i - 1][0] + (points[i][0] - points[i - 1][0]) * k / steps, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * k / steps]);
    }
    return result;
  }
  function length(points) { return points.slice(1).reduce((sum, p, i) => sum + distance(points[i], p), 0); }
  function validShape(points) {
    return Array.isArray(points) && points.length >= 2 && points.length <= 240 && points.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) && p[0] >= 20 && p[0] <= WIDTH - 20 && p[1] >= 20 && p[1] <= HEIGHT - 20) && length(points) >= 18 && length(points) <= 245;
  }
  function attached(state, points) {
    const existing = [base, ...state.pieces.map(p => p.points)];
    return samples(points).some(p => {
      if (((p[0] - 400) / 109) ** 2 + ((p[1] - 396) / 39) ** 2 <= 1) return true;
      return existing.some(path => path.slice(1).some((b, i) => segmentDistance(p, path[i], b) <= RADIUS * 2 - 3));
    });
  }
  function settle(state, previous) {
    for (let step = 1; step <= 3; step++) {
      const next = (previous + step) % 3;
      if (!state.players[next].out && state.players[next].remaining > 0 && next !== state.leader) { state.turn = next; return; }
    }
    state.status = 'finished'; state.turn = null; state.winner = state.leader;
  }
  function act(state, action) {
    if (state.status !== 'playing') throw new Error('这一轮已经落槌。');
    const next = JSON.parse(JSON.stringify(state));
    const player = next.players[next.turn];
    const who = next.turn;
    if (action.type === 'bid') {
      if (!validShape(action.points)) throw new Error('请在台面内画一段 18–245 单位长的泥条。');
      const points = action.points.map(p => p.map(n => Math.round(n * 10) / 10));
      if (!validShape(points)) throw new Error('这段泥太短了，请再画长一点。');
      if (!attached(next, points)) throw new Error('这块还没接上。请让它碰到已有的泥。');
      next.pieces.push({ owner: who, points }); player.remaining--; next.leader = who;
      next.events.push({ type: 'bid', who, points }); settle(next, who);
    } else if (action.type === 'exit') {
      player.out = true; next.events.push({ type: 'exit', who }); settle(next, who);
    } else if (action.type === 'wish') {
      const wish = String(action.wish || '').trim().slice(0, 60);
      if (!wish) throw new Error('写下你现在想要的样子。');
      if (wish === player.wish) return next;
      player.wish = wish; next.events.push({ type: 'wish', who, wish });
    } else throw new Error('未知操作。');
    return next;
  }
  function restore(raw) {
    if (!raw || raw.version !== 1 || !Array.isArray(raw.events)) throw new Error('存档格式无法识别。');
    let result = create(raw.initial, raw.first);
    for (const event of raw.events) {
      if (event.who !== result.turn) throw new Error('存档回合顺序不完整。');
      result = act(result, event);
    }
    result.title = String(raw.title || '').slice(0, 40);
    return result;
  }
  function preset(kind, x, y, rotation = 0) {
    let path;
    if (kind === 'arch') path = Array.from({ length: 29 }, (_, i) => { const t = Math.PI - i / 28 * Math.PI; return [Math.cos(t) * 54, -Math.sin(t) * 64 + 30]; });
    else if (kind === 'loop') path = Array.from({ length: 41 }, (_, i) => { const t = i / 40 * Math.PI * 2; return [Math.cos(t) * 33, Math.sin(t) * 33]; });
    else if (kind === 'curve') path = Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [(t - .5) * 118, Math.sin(t * Math.PI * 2) * 30]; });
    else path = [[0, -76], [0, 76]];
    const r = rotation * Math.PI / 180;
    return path.map(([a, b]) => [x + a * Math.cos(r) - b * Math.sin(r), y + a * Math.sin(r) + b * Math.cos(r)]);
  }
  return { COLORS, DEFAULTS, WIDTH, HEIGHT, RADIUS, base, create, act, restore, validShape, attached, length, distance, preset };
});
