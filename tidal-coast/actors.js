/* Articulated farm work and a small cat with a life of its own.
 * All positions use the world's 24-unit tiles. update() takes seconds;
 * time is the requestAnimationFrame timestamp in milliseconds.
 * No inventory/world changes happen here: onImpact is the single commit point.
 */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2, T = 24;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const phase = (t, a, b) => smooth((t - a) / (b - a));
  function facing(dx, dy) { return Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down'; }
  function ellipse(c, x, y, rx, ry, color, rotation = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rotation, 0, TAU); c.fillStyle = color; c.fill(); }
  function stroke(c, points, color, width) { c.beginPath(); c.moveTo(...points[0]); for (let i = 1; i < points.length; i++) c.lineTo(...points[i]); c.strokeStyle = color; c.lineWidth = width; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  function gradient(c, x, y, length, top, bottom) { const g = c.createLinearGradient(x, y, x + length * .2, y + length); g.addColorStop(0, top); g.addColorStop(1, bottom); return g; }
  function capsule(c, a, b, width, top, bottom) { stroke(c, [a, b], bottom, width + .5); stroke(c, [[a[0] - .35, a[1] - .4], [b[0] - .35, b[1] - .4]], gradient(c, a[0], Math.min(a[1], b[1]), Math.max(3, Math.abs(b[1] - a[1])), top, bottom), width); }
  function shadow(c, x, y, rx, ry, alpha = .2) { const g = c.createRadialGradient(x, y, .1, x, y, rx); g.addColorStop(0, 'rgba(49,49,31,' + alpha + ')'); g.addColorStop(1, 'rgba(49,49,31,0)'); c.save(); c.translate(x, y); c.scale(1, ry / rx); ellipse(c, 0, 0, rx, rx, g); c.restore(); }
  const actorCache = new Map();
  const workAtlas = typeof Image !== 'undefined' ? new Image() : null;
  const toolAtlas = typeof Image !== 'undefined' ? new Image() : null;
  const workFrames = [[75,30,190,352],[364,19,199,361],[656,43,222,337],[972,76,229,305],[74,427,184,349],[359,418,212,357],[659,440,210,336],[971,472,218,305],[61,836,207,374],[362,836,200,377],[647,852,230,361],[971,885,228,332]];
  const workFeet = [157,466,750,1061,157,468,753,1061,157,469,746,1067];
  const workHands = [[232,223],[389,133],[832,298],[1180,348],[194,623],[389,534],[802,696],[1167,749],[245,1016],[469,944],[836,1098],[1174,1157]];
  if (workAtlas) workAtlas.src = 'assets/farmer-actions.png';
  if (toolAtlas) toolAtlas.src = 'assets/clay-items.png';
  function workPose(c, a, pose, drawTool) {
    if (!workAtlas?.complete || !workAtlas.naturalWidth) return false;
    const p = clamp(a.elapsed / a.duration), side = a.dir === 'left' ? -1 : 1;
    let col = 0;
    if (['hoe','axe','pickaxe'].includes(a.kind)) col = p < .17 ? 0 : p < .48 ? 1 : p < .87 ? 2 : 0;
    else if (['plant','harvest','pet'].includes(a.kind)) col = p < .18 ? 0 : p < .4 ? 2 : p < .78 ? 3 : p < .93 ? 2 : 0;
    const row = a.dir === 'up' ? 2 : a.dir === 'down' ? 1 : 0, index = row * 4 + col;
    const b = workFrames[index], scale = .086, base = b[1] + b[3] - 1;
    const bob = a.kind === 'water' ? Math.sin(p * Math.PI) * .35 : col === 2 ? Math.sin(p * Math.PI) * .28 : 0;
    const hand = workHands[index]; pose.hand = [(hand[0] - workFeet[index]) * scale * side, (hand[1] - base) * scale + bob];
    pose.backHand = [-side * 3.4, -9 + (col === 3 ? 3.4 : 0)];
    shadow(c, 0, .7, 9, 2.5, .23);
    if (a.dir === 'up' && drawTool) drawTool();
    c.save(); c.translate(0,bob); c.scale(side,1); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(workAtlas,b[0],b[1],b[2],b[3],(b[0]-workFeet[index])*scale,-(b[3]-1)*scale,b[2]*scale,b[3]*scale);c.restore();
    if (a.dir !== 'up' && drawTool) drawTool();
    if (drawTool && a.kind !== 'plant') ellipse(c,pose.hand[0],pose.hand[1],1.15,1.2,'#e8b98f');
    return true;
  }
  function farmerImage(dir, color) {
    const key = dir + ':' + (color || '') + ':' + (global.Art?.status?.loaded || 0);
    if (actorCache.has(key)) return actorCache.get(key);
    const image = document.createElement('canvas'); image.width = 176; image.height = 176;
    const c = image.getContext('2d'); c.scale(4, 4);
    global.Art.character(c, 22, 39, {style: 'player', dir, color, walk: 0, hat: true});
    actorCache.set(key, image); if (actorCache.size > 16) actorCache.delete(actorCache.keys().next().value);
    return image;
  }
  function part(c, image, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh) { c.drawImage(image, sx * 4, sy * 4, sw * 4, sh * 4, dx, dy, dw, dh); }
  function arm(c, shoulder, hand, back = false) {
    const elbow = [(shoulder[0] + hand[0]) / 2 - (back ? 1.3 : -1.5), (shoulder[1] + hand[1]) / 2 + 2.2];
    capsule(c, shoulder, elbow, 4.7, back ? '#ddc9a8' : '#f2e5c8', '#b9a286');
    capsule(c, elbow, hand, 3.3, '#ecc39a', '#c78c63');
    ellipse(c, hand[0] - .2, hand[1] - .2, 2.1, 2.2, gradient(c, hand[0], hand[1] - 2, 4, '#f1cba4', '#c9936e'));
  }
  function puppet(c, a, pose, color, drawTool) {
    if (workPose(c,a,pose,drawTool)) return;
    const image = farmerImage(a.dir, color), side = a.dir === 'left' ? -1 : 1;
    const leanX = pose.leanX || 0, crouch = pose.crouch || 0;
    shadow(c, 0, .7, 9, 2.5, .23);
    // Boots remain planted; knees compress while the torso and head hinge forward.
    part(c, image, 9, 32, 26, 7, -13, -7 + crouch * .28, 26, 7 - crouch * .28);
    if (a.dir === 'up' && drawTool) drawTool();
    const backShoulder = [leanX - side * 4.4, -13 + crouch];
    arm(c, backShoulder, pose.backHand || [leanX - side * 5.5, -6 + crouch], true);
    c.save(); c.translate(leanX, -7 + crouch); c.rotate(pose.bodyAngle || 0);
    // Only the center of the original torso is retained; the old hanging arms
    // are excluded so the articulated arms never turn into four hands.
    ellipse(c, 0, -4.5, 5.5, 6.2, gradient(c, -5, -10, 11, '#e9dcc2', '#baa98f'));
    part(c, image, 17, 24, 10, 9, -5, -9, 10, 9);
    c.restore();
    const frontShoulder = [leanX + side * 4.3, -13 + crouch];
    arm(c, frontShoulder, pose.hand || [leanX + side * 6, -6 + crouch]);
    c.save(); c.translate(leanX + (pose.headX || 0), -14 + crouch); c.rotate(pose.headAngle || 0);
    part(c, image, 1, 7, 42, 18, -21, -18, 42, 18); c.restore();
    if (a.dir !== 'up' && drawTool) drawTool();
    // Fingers cover the handle, visibly attaching the tool to the character.
    if (pose.hand && drawTool) ellipse(c, pose.hand[0], pose.hand[1], 1.8, 1.8, '#e8b98f');
  }
  function drawSwingTool(c, kind, hand, head) {
    const dx = head[0] - hand[0], dy = head[1] - hand[1], n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
    if (toolAtlas?.complete && toolAtlas.naturalWidth) {
      const data = {hoe: [[57,56,233,242],[213,126],[88,273]], axe: [[662,58,237,240],[806,132],[688,277]], pickaxe: [[968,53,241,250],[1096,92],[1048,282]]}[kind];
      const [b, tip, butt] = data, ax = tip[0] - butt[0], ay = tip[1] - butt[1];
      c.save(); c.translate(head[0],head[1]); c.rotate(Math.atan2(dy,dx));
      const scale = (n+6)/Math.hypot(ax,ay);
      // The inventory sprite is deliberately chunky. Preserve its clay grain
      // but narrow the shaft perpendicular to its axis for a held world tool.
      c.scale(scale,Math.min(scale,.052)); c.rotate(-Math.atan2(ay,ax)); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(toolAtlas,b[0],b[1],b[2],b[3],b[0]-tip[0],b[1]-tip[1],b[2],b[3]); c.restore(); return;
    }
    capsule(c, [hand[0] - ux * 7, hand[1] - uy * 7], head, 2.1, '#dfb680', '#91613e');
    stroke(c, [[hand[0] - ux * 6 - .3, hand[1] - uy * 6 - .3], [head[0] - .3, head[1] - .3]], '#f0cca1', .45);
    c.save(); c.translate(...head); c.rotate(Math.atan2(dy, dx) - Math.PI / 2);
    if (kind === 'pickaxe') {
      c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(-5, -4, 0, -3); c.quadraticCurveTo(6, -3, 10, 4); c.quadraticCurveTo(2, 0, -1, 0); c.closePath(); c.fillStyle = gradient(c, 0, -4, 9, '#c8cfca', '#687e80'); c.fill();
      stroke(c, [[-7, 1], [-1, -1], [5, 0]], '#e0ded0', .6);
    } else if (kind === 'axe') {
      c.beginPath(); c.moveTo(-2, -3); c.lineTo(7, -5); c.quadraticCurveTo(11, 0, 7, 6); c.lineTo(-2, 3); c.closePath(); c.fillStyle = gradient(c, 0, -5, 11, '#c8cfc6', '#6e8584'); c.fill(); stroke(c, [[7, -4], [8.5, 0], [7, 5]], '#e0e1d4', 1.1);
    } else {
      c.beginPath(); c.roundRect(-7, -2.5, 14, 5, 1.1); c.fillStyle = gradient(c, 0, -3, 6, '#bac7bf', '#5b777b'); c.fill(); stroke(c, [[-6, 1.7], [6, 1.7]], '#d6d8c6', .7);
    }
    ellipse(c, 0, -.5, 2, 2, '#7c9089'); c.restore();
  }
  function drawCan(c, hand, side, tilt) {
    if (global.Art?.sprite && global.Art.status?.ready) {
      c.save(); c.translate(hand[0],hand[1]); c.rotate(side*tilt); c.scale(-side,1);
      global.Art.sprite(c,'items',1,0,10.4,14,14); c.restore();
      const x=side*5.1,y=3.6,angle=side*tilt;
      return [hand[0]+x*Math.cos(angle)-y*Math.sin(angle),hand[1]+x*Math.sin(angle)+y*Math.cos(angle)];
    }
    c.save(); c.translate(hand[0] + side * 3.7, hand[1] - 1); c.rotate(side * tilt); c.scale(side, 1);
    c.beginPath(); c.ellipse(-5, -2, 3.7, 4.2, 0, -Math.PI * .35, Math.PI * 1.45); c.strokeStyle = '#719898'; c.lineWidth = 1.8; c.stroke();
    c.beginPath(); c.roundRect(-4, -6, 11, 10, 2.4); c.fillStyle = gradient(c, 0, -6, 10, '#a5c1b7', '#608e91'); c.fill();
    ellipse(c, 1, -5.3, 5.4, 1.7, '#b6cec0'); ellipse(c, 1, -5.6, 2.4, .8, '#688d85');
    c.beginPath(); c.moveTo(5, -1); c.lineTo(12, -5); c.lineTo(13, -2.2); c.lineTo(6, 2); c.closePath(); c.fillStyle = '#80a8a3'; c.fill();
    ellipse(c, 12.5, -3.5, 1.8, 2.8, '#bad0c4', -.35); stroke(c, [[-2.8, -3], [-2.8, 1]], '#d6e0c7', .55);
    c.restore();
    const x = 12.5 * side, y = -3.5, angle = side * tilt;
    return [hand[0] + side * 3.7 + x * Math.cos(angle) - y * Math.sin(angle), hand[1] - 1 + x * Math.sin(angle) + y * Math.cos(angle)];
  }
  function drawWater(c, from, to, p, elapsed) {
    if (p < .25 || p > .84) return;
    const fade = Math.min(phase(p, .25, .32), 1 - phase(p, .76, .84));
    c.save(); c.globalAlpha = fade;
    const control = [(from[0] + to[0]) * .5, Math.min(from[1], to[1]) - 2.5];
    for (let stream = -1; stream <= 1; stream++) {
      c.beginPath(); c.moveTo(from[0], from[1]); c.quadraticCurveTo(control[0] + stream * 1.5, control[1], to[0] + stream * 2.6, to[1]); c.strokeStyle = stream ? '#aad4d6a8' : '#e3f1ddc9'; c.lineWidth = stream ? .7 : 1.1; c.stroke();
    }
    for (let i = 0; i < 11; i++) {
      const f = (elapsed * 2.5 + i / 11) % 1, inv = 1 - f;
      const x = inv * inv * from[0] + 2 * inv * f * control[0] + f * f * to[0];
      const y = inv * inv * from[1] + 2 * inv * f * control[1] + f * f * to[1];
      ellipse(c, x + Math.sin(i * 3) * f * 2.2, y, .55, 1, '#f0f6de');
    }
    const cycle = (elapsed * 5) % 1;
    c.strokeStyle = '#c9e4df99'; c.lineWidth = .65; c.beginPath(); c.ellipse(to[0], to[1] + 1, 2 + cycle * 5, 1 + cycle * 2, 0, 0, TAU); c.stroke();
    for (let i = 0; i < 5; i++) { const f = (elapsed * 3 + i / 5) % 1; ellipse(c, to[0] + (i - 2) * f * 3, to[1] - Math.sin(f * Math.PI) * (3 + i % 2 * 2), .55, .7, '#dfefdf'); }
    c.restore();
  }
  const timings = {hoe: [.78, .5], axe: [.83, .54], pickaxe: [.82, .52], water: [1.08, .43], plant: [.8, .48], harvest: [.83, .56], pet: [1.15, .47]};
  let current = null;
  const Action = {
    characterScale: 1.3,
    get assetsReady() { return !!(workAtlas?.complete && workAtlas.naturalWidth); },
    start(kind, player, target, time = 0, options = {}) {
      if (current || !player || !target) return false;
      if (typeof options === 'function') options = {onImpact: options};
      if (kind.endsWith('-seed') || kind === 'seed' || kind === 'sow') kind = 'plant';
      if (kind === 'hand' || kind === 'gather') kind = 'harvest';
      if (kind === 'watering-can') kind = 'water';
      if (!timings[kind]) return false;
      const to = {x: Number.isFinite(target.x) ? target.x : (target.tx + .5) * T, y: Number.isFinite(target.y) ? target.y : (target.ty + .5) * T};
      if (!Number.isFinite(to.x) || !Number.isFinite(to.y)) return false;
      const dx = to.x - player.x, dy = to.y - player.y, dir = Math.abs(dx) + Math.abs(dy) > .5 ? facing(dx, dy) : player.dir || 'down';
      current = {kind, player, target: to, origin: {x: player.x, y: player.y}, dir, started: time, elapsed: 0, duration: timings[kind][0], impact: timings[kind][1], didImpact: false, options};
      player.dir = dir; return true;
    },
    update(dt) {
      const a = current; if (!a) return;
      a.elapsed += clamp(dt, 0, .1); a.player.x = a.origin.x; a.player.y = a.origin.y; a.player.dir = a.dir;
      if (!a.didImpact && a.elapsed >= a.impact) { a.didImpact = true; a.options.onImpact?.(a); }
      if (current === a && a.elapsed >= a.duration) { current = null; a.options.onComplete?.(a); }
    },
    cancel() { const a = current; current = null; if (a) a.options.onCancel?.(a); },
    get locked() { return !!current; },
    get active() { return current; },
    snapshot() { return current ? {kind: current.kind, progress: clamp(current.elapsed / current.duration), didImpact: current.didImpact, target: {...current.target}} : null; },
    draw(c, player, time, state = {}) {
      const a = current; if (!a || a.player !== player) return false;
      const scale = Action.characterScale || 1;
      const p = clamp(a.elapsed / a.duration), dx = (a.target.x - a.origin.x) / scale, dy = (a.target.y - a.origin.y) / scale;
      const side = a.dir === 'left' ? -1 : a.dir === 'right' ? 1 : dx < -2 ? -1 : 1;
      const toward = [dx / (Math.hypot(dx, dy) || 1), dy / (Math.hypot(dx, dy) || 1)];
      const reach = Math.sin(Math.PI * p), pose = {leanX: toward[0] * reach * 2, crouch: 0, headAngle: 0};
      c.save(); c.translate(a.origin.x, a.origin.y); c.scale(scale,scale); c.imageSmoothingEnabled = true;
      if (['hoe', 'axe', 'pickaxe'].includes(a.kind)) {
        const up = phase(p, .02, .3), drop = phase(p, .34, .65), recover = phase(p, .73, 1);
        const raised = [-toward[0] * 8 - side * 5, -43];
        const rest = [side * 12, -5];
        const head = [mix(mix(rest[0], raised[0], up), dx, drop), mix(mix(rest[1], raised[1], up), dy - 2, drop)];
        head[0] = mix(head[0], rest[0], recover); head[1] = mix(head[1], rest[1], recover);
        pose.crouch = drop * (1 - recover) * 3.8; pose.leanX = toward[0] * drop * (1 - recover) * 4;
        pose.headAngle = side * .08 * drop * (1 - recover); pose.headX = toward[0] * drop * 1.4;
        const shoulder = [pose.leanX + side * 4, -13 + pose.crouch];
        const hx = head[0] - shoulder[0], hy = head[1] - shoulder[1], n = Math.hypot(hx, hy) || 1;
        pose.hand = [shoulder[0] + hx / n * 8.5, shoulder[1] + hy / n * 8.5];
        pose.backHand = [pose.hand[0] - hx / n * 3.2, pose.hand[1] - hy / n * 3.2];
        puppet(c, a, pose, state.color, () => drawSwingTool(c, a.kind, pose.hand, head));
        if (p > .64 && p < .85) { c.save(); c.globalAlpha = (1 - (p - .64) / .21) * .32; c.strokeStyle = '#efe0b6'; c.lineWidth = 1; c.beginPath(); c.ellipse(dx, dy + 1, 4 + (p - .64) * 32, 1.3 + (p - .64) * 10, 0, 0, TAU); c.stroke(); c.restore(); }
      } else if (a.kind === 'water') {
        const pour = phase(p, .08, .24) * (1 - phase(p, .81, 1));
        pose.leanX = toward[0] * pour * 2.2; pose.crouch = pour * .8; pose.headAngle = side * .04 * pour;
        pose.hand = [side * (6 + pour * 2.8), -12 + toward[1] * pour * 3];
        pose.backHand = [side * 2, -11 + pour];
        puppet(c, a, pose, state.color, () => { const spout = drawCan(c, pose.hand, side, .1 + .38 * pour); drawWater(c, spout, [dx, dy], p, a.elapsed); });
      } else {
        const bend = phase(p, .04, .37) * (1 - phase(p, .69, .98));
        pose.crouch = bend * (a.kind === 'plant' ? 6 : 4.5); pose.leanX = toward[0] * bend * 4;
        pose.headAngle = side * .13 * bend; pose.headX = toward[0] * bend * 1.2;
        const handTarget = [clamp(dx, -25, 25), clamp(dy - 4, -13, 14)];
        pose.hand = [mix(side * 6, handTarget[0], bend), mix(-8, handTarget[1], bend)];
        if (a.kind === 'harvest' && p > .59) pose.hand[1] -= Math.sin(phase(p, .59, .95) * Math.PI) * 10;
        if (a.kind === 'pet') pose.hand[0] += Math.sin(p * Math.PI * 7) * 2.1 * bend;
        pose.backHand = [-side * 5, -9 + pose.crouch];
        puppet(c, a, pose, state.color, a.kind === 'plant' ? () => {
          ellipse(c, pose.backHand[0], pose.backHand[1] + 1, 3.5, 4.2, gradient(c, 0, pose.backHand[1] - 3, 8, '#dec298', '#a77a52'));
          stroke(c, [[pose.backHand[0] - 2, pose.backHand[1] - 2], [pose.backHand[0] + 2, pose.backHand[1] - 2]], '#876d48', .6);
        } : null);
        if (a.kind === 'plant' && p > .44 && p < .73) for (let i = 0; i < 5; i++) {
          const f = clamp((p - .44 - i * .018) / .18), sx = mix(pose.hand[0], dx + (i - 2) * 2, f), sy = mix(pose.hand[1], dy + i % 2, f) - Math.sin(f * Math.PI) * 3;
          if (f > 0 && f < 1) ellipse(c, sx, sy, .65, .45, '#d9b378', i);
        }
        if (a.kind === 'harvest' && a.didImpact && p < .96) {
          c.save(); const item = a.options.item; if (item && global.Art) global.Art.icon(c, item, pose.hand[0] - 4, pose.hand[1] - 6, 8); else { ellipse(c, pose.hand[0], pose.hand[1] - 2, 2.2, 2.8, '#dba084'); stroke(c, [[pose.hand[0], pose.hand[1] - 4], [pose.hand[0] + 1, pose.hand[1] - 7]], '#7f9950', 1.2); } c.restore();
        }
      }
      c.restore(); return true;
    }
  };

  function random(cat) { cat.seed = (cat.seed * 1664525 + 1013904223) >>> 0; return cat.seed / 4294967296; }
  const catPlaces = [
    {x: 10.2 * T, y: 12.9 * T, wish: 'sit'}, {x: 13 * T, y: 15.8 * T, wish: 'nap'},
    {x: 15.1 * T, y: 13.4 * T, wish: 'sniff'}, {x: 13.5 * T, y: 19.5 * T, wish: 'groom'},
    {x: 7.9 * T, y: 15 * T, wish: 'sniff'}, {x: 10.5 * T, y: 23.1 * T, wish: 'sit'},
    {x: 22.3 * T, y: 17.5 * T, wish: 'sniff'}
  ];
  function canCatStand(x, y, state) {
    const w = global.World; if (!w?.passable('farm', x, y, state)) return false;
    return [[-3, 0], [3, 0], [0, 2]].every(([dx, dy]) => w.passable('farm', x + dx, y + dy, state));
  }
  function freePoint(point, state) {
    if (canCatStand(point.x, point.y, state)) return {...point};
    for (let radius = 8; radius < 90; radius += 8) for (let i = 0; i < 12; i++) { const a = i * TAU / 12, p = {x: point.x + Math.cos(a) * radius, y: point.y + Math.sin(a) * radius}; if (canCatStand(p.x, p.y, state)) return p; }
    return null;
  }
  function clearLine(a, b, state) {
    const steps = Math.ceil(dist(a, b) / 4);
    for (let i = 1; i <= steps; i++) if (!canCatStand(mix(a.x, b.x, i / steps), mix(a.y, b.y, i / steps), state)) return false;
    return true;
  }
  function catRoute(cat, target, state) {
    if (clearLine(cat, target, state)) return [target];
    const grid = 12, sx = Math.round(cat.x / grid), sy = Math.round(cat.y / grid), tx = Math.round(target.x / grid), ty = Math.round(target.y / grid);
    const key = (x, y) => x + ',' + y, queue = [{x: sx, y: sy}], seen = new Map([[key(sx, sy), null]]);
    let end = null;
    for (let i = 0; i < queue.length && i < 1800; i++) {
      const node = queue[i], at = {x: node.x * grid, y: node.y * grid};
      if (Math.abs(node.x - tx) + Math.abs(node.y - ty) <= 1 && clearLine(at, target, state)) { end = node; break; }
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const x = node.x + dx, y = node.y + dy, id = key(x, y), to = {x: x * grid, y: y * grid};
        if (seen.has(id) || Math.abs(to.x - cat.anchor.x) > 300 || Math.abs(to.y - cat.anchor.y) > 260 || !clearLine(at, to, state)) continue;
        seen.set(id, node); queue.push({x, y});
      }
    }
    if (!end) return [];
    const route = [target]; for (let n = end; n; n = seen.get(key(n.x, n.y))) route.push({x: n.x * grid, y: n.y * grid});
    route.reverse(); if (route.length && dist(cat, route[0]) < 9) route.shift();
    // Smooth corners only where the entire segment is passable.
    const smoothRoute = []; let from = {x: cat.x, y: cat.y}, i = 0;
    while (i < route.length) { let last = i; for (let j = i + 1; j < route.length && j < i + 9; j++) { if (!clearLine(from, route[j], state)) break; last = j; } smoothRoute.push(route[last]); from = route[last]; i = last + 1; }
    return smoothRoute;
  }
  function setCatState(cat, mode, duration) { cat.mode = mode; cat.elapsed = 0; cat.remaining = duration; cat.moving = false; }
  function chooseCatActivity(cat, state) {
    const roll = random(cat);
    if (roll < .55 || dist(cat, cat.anchor) > 250) {
      const index = (cat.place + 1 + Math.floor(random(cat) * (catPlaces.length - 1))) % catPlaces.length;
      const place = catPlaces[index], to = freePoint({x: place.x + (random(cat) - .5) * 14, y: place.y + (random(cat) - .5) * 12}, state);
      const route = to ? catRoute(cat, to, state) : [];
      if (route.length) { cat.place = index; cat.route = route; cat.arrival = place.wish; cat.speed = 18 + random(cat) * 8; setCatState(cat, 'stroll', 35); return; }
    }
    const mode = roll < .68 ? 'sniff' : roll < .8 ? 'sit' : roll < .9 ? 'groom' : 'nap';
    const duration = {sniff: 2.8, sit: 4.8, groom: 4.2, nap: 12}[mode] * (.8 + random(cat) * .7);
    setCatState(cat, mode, duration);
  }
  function clay(c, x, y, rx, ry, light, dark, rot = 0) { ellipse(c, x, y, rx, ry, gradient(c, x - rx * .6, y - ry, ry * 2, light, dark), rot); }
  function catHead(c, x, y, direction, time, eyesClosed = false, tilt = 0) {
    c.save(); c.translate(x, y); c.rotate(tilt);
    const side = direction === 'left' ? -1 : 1, back = direction === 'up', profile = direction === 'left' || direction === 'right';
    for (const ex of [-4.3, 4.3]) {
      c.beginPath(); c.moveTo(ex - 2, -2); c.quadraticCurveTo(ex - 1, -8.5, ex + 1.2, -7); c.lineTo(ex + 2, -2); c.closePath(); c.fillStyle = '#c99459'; c.fill();
      if (!back) { c.beginPath(); c.moveTo(ex - .8, -3.5); c.lineTo(ex, -6.5); c.lineTo(ex + 1, -3); c.closePath(); c.fillStyle = '#dba78b'; c.fill(); }
    }
    clay(c, 0, 0, profile ? 5.3 : 6.2, 5.2, '#e9bf7e', '#bd804b');
    for (let i = -1; i <= 1; i++) stroke(c, [[i * 2, -4.6], [i * 1.6 + .3, -2.3]], '#a872448c', 1.15);
    if (!back) {
      const muzzle = profile ? side * 3.5 : 0;
      clay(c, muzzle, 2.4, profile ? 3.2 : 4, 2.4, '#f3dec0', '#e1c19b');
      const eyes = profile ? [side * 2.1] : [-2.3, 2.3], blink = eyesClosed || time % 6400 > 6220;
      for (const ex of eyes) if (blink) { c.beginPath(); c.moveTo(ex - 1, .1); c.quadraticCurveTo(ex, .8, ex + 1, .1); c.strokeStyle = '#574b36'; c.lineWidth = .7; c.stroke(); } else ellipse(c, ex, -.1, .7, 1.1, '#414532');
      ellipse(c, muzzle + (profile ? side * .9 : 0), 2, .95, .6, '#ae7c6d');
      stroke(c, [[muzzle, 2.5], [muzzle, 3.4]], '#b89576', .45);
      for (const sign of [-1, 1]) { if (profile && sign !== side) continue; stroke(c, [[muzzle + sign * 2, 2.1], [muzzle + sign * 6.3, 1.3]], '#f4e2c299', .45); stroke(c, [[muzzle + sign * 2, 2.8], [muzzle + sign * 5.8, 3.5]], '#f4e2c299', .45); }
    }
    c.restore();
  }
  function catTail(c, baseX, baseY, side, time, resting = false) {
    const wave = Math.sin(time / 690) * (resting ? .65 : 2.5);
    c.beginPath(); c.moveTo(baseX, baseY); c.bezierCurveTo(baseX - side * 8, baseY + 3, baseX - side * 12, baseY - 5 + wave, baseX - side * 8, baseY - 8 + wave);
    c.strokeStyle = '#b97e48'; c.lineWidth = 3.7; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = '#dfb279'; c.lineWidth = 2.4; c.stroke();
  }
  // Separate original clay assets, generated for this character. The procedural
  // puppet below remains a loading fallback, never the normal finished cat.
  const catAtlas = typeof Image !== 'undefined' ? new Image() : null;
  const catFrames = [[67,64,251,226],[428,63,253,230],[786,63,257,233],[1152,63,251,228],[104,427,189,229],[434,412,205,244],[789,425,211,230],[1152,481,233,168],[64,769,260,255],[430,774,233,246],[799,775,225,237],[1131,772,254,248]];
  if (catAtlas) catAtlas.src = 'assets/cat-poses.png';
  function spriteCat(c, cat, time) {
    if (!catAtlas?.complete || !catAtlas.naturalWidth) return false;
    const mode = cat.mode, moving = cat.moving, side = cat.dir === 'left' ? -1 : 1;
    let frame = mode === 'nap' ? 7 : mode === 'stretch' ? 8 : mode === 'groom' ? 6 : mode === 'sniff' ? 11 : mode === 'look' && ['left','right'].includes(cat.dir) ? 5 : 4;
    if (moving) frame = cat.dir === 'up' ? 9 + Math.floor(cat.walk * 2) % 2 : Math.floor(cat.walk * 4) % 4;
    const b = catFrames[frame], scale = .093, w = b[2] * scale, h = b[3] * scale;
    // Quantized sub-pixel motion suggests photographed stop-motion while the
    // actual travel remains smooth. Poses are distinct images, not flat icons.
    const stopTime = Math.floor(time / 110) * 110;
    const breathe = Math.sin(stopTime / (mode === 'nap' ? 1150 : 850)) * .012;
    const bob = moving ? Math.cos(cat.walk * TAU * 2) * .38 : mode === 'groom' ? Math.sin(stopTime / 150) * .25 : 0;
    shadow(c, 0, .8, mode === 'nap' ? 13 : 11, 2.6, .22);
    c.save(); c.translate(0, bob); c.scale(side, 1 + breathe); c.rotate(mode === 'groom' ? Math.sin(stopTime / 230) * .014 : mode === 'look' ? Math.sin(stopTime / 740) * .01 : 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(catAtlas, b[0], b[1], b[2], b[3], -w / 2, -h, w, h); c.restore();
    if (mode === 'nap' && cat.elapsed > 2) { c.save(); c.globalAlpha = .28 + Math.sin(time / 900) * .12; c.fillStyle = '#eee7ca'; c.font = '6px serif'; c.fillText('z', 8, -20 - (time / 1000 % 2) * 2); c.restore(); }
    return true;
  }
  function catHeart(c, cat) {
    if (cat.heart <= 0) return;
    c.save(); c.translate(2, -26 - (2.1 - cat.heart) * 3); c.globalAlpha = Math.min(1, cat.heart * 1.5); c.fillStyle = '#c88577'; c.beginPath(); c.moveTo(0, 2); c.bezierCurveTo(-6, -1, -3, -5, 0, -2); c.bezierCurveTo(3, -5, 6, -1, 0, 2); c.fill(); c.restore();
  }
  const CatAI = {
    get assetsReady() { return !!(catAtlas?.complete && catAtlas.naturalWidth); },
    create(state, options = {}) {
      const anchor = options.anchor || {x: 13 * T, y: 15.7 * T}, initial = freePoint(anchor, state) || anchor;
      return {x: initial.x, y: initial.y, dir: 'down', anchor: {...anchor}, mode: 'sniff', elapsed: 0, remaining: 2.2, walk: 0, moving: false, seed: options.seed || 74193, route: [], place: 1, arrival: 'sit', speed: 22, attention: 0, nearPlayer: false, heart: 0};
    },
    update(cat, dt, time, state, player, scene = 'farm') {
      if (!cat) return;
      dt = clamp(dt, 0, .1); cat.elapsed += dt; cat.remaining -= dt; cat.attention = Math.max(0, cat.attention - dt); cat.heart = Math.max(0, cat.heart - dt); cat.moving = false;
      if (!canCatStand(cat.x, cat.y, state)) { const p = freePoint(cat, state); if (p) { cat.x = p.x; cat.y = p.y; cat.route = []; setCatState(cat, 'look', 1.3); } }
      const near = scene === 'farm' && player && dist(cat, player) < 42;
      if (near && !cat.nearPlayer && cat.attention <= 0 && !['nap', 'pet'].includes(cat.mode)) {
        cat.resume = cat.mode === 'stroll' ? {route: cat.route.slice(), arrival: cat.arrival} : null;
        setCatState(cat, 'look', 1.5 + random(cat) * .7); cat.attention = 17 + random(cat) * 8;
      }
      cat.nearPlayer = !!near;
      if (['look', 'pet'].includes(cat.mode) && near) cat.dir = facing(player.x - cat.x, player.y - cat.y);
      if (cat.mode === 'stroll') {
        const target = cat.route[0];
        if (!target || cat.remaining <= 0) { cat.route = []; setCatState(cat, cat.arrival || 'sniff', cat.arrival === 'nap' ? 11 + random(cat) * 9 : 2.5 + random(cat) * 4); }
        else {
          const d = dist(cat, target), step = Math.min(d, cat.speed * dt), dx = (target.x - cat.x) / (d || 1), dy = (target.y - cat.y) / (d || 1);
          if (d < 2) cat.route.shift();
          else if (clearLine(cat, {x: cat.x + dx * step, y: cat.y + dy * step}, state)) { cat.x += dx * step; cat.y += dy * step; cat.dir = facing(dx, dy); cat.walk = (cat.walk + dt * 2.9) % 1; cat.moving = true; }
          else { cat.route = []; setCatState(cat, 'sniff', 1.4); }
        }
      } else if (cat.remaining <= 0) {
        if (cat.mode === 'nap') setCatState(cat, 'stretch', 2.2);
        else if (cat.mode === 'look' && cat.resume?.route?.length) { cat.route = cat.resume.route; cat.arrival = cat.resume.arrival; cat.resume = null; setCatState(cat, 'stroll', 35); }
        else chooseCatActivity(cat, state);
      }
    },
    pet(cat, player) {
      if (!cat || !player || dist(cat, player) > 37) return false;
      cat.route = []; cat.resume = null; cat.dir = facing(player.x - cat.x, player.y - cat.y); cat.heart = 2.1; cat.attention = 22; setCatState(cat, 'pet', 3); return true;
    },
    description(cat) { return {stroll: '沿着院子散步', sniff: '闻闻草地里的气味', sit: '坐着晒太阳', groom: '认真舔毛', nap: '蜷着打盹', stretch: '睡醒伸了个懒腰', look: '抬头看了看你', pet: '舒服地眯起眼睛'}[cat?.mode] || '在院子里'; },
    draw(c, cat, time = 0) {
      if (!cat) return; c.save(); c.translate(cat.x, cat.y);
      if (spriteCat(c, cat, time)) { catHeart(c, cat); c.restore(); return; }
      const mode = cat.mode, side = cat.dir === 'left' ? -1 : 1, profile = cat.dir === 'left' || cat.dir === 'right';
      const breathe = Math.sin(time / 1200) * .25, gait = cat.walk * TAU, bob = cat.moving ? Math.cos(gait * 2) * .45 : breathe;
      shadow(c, 0, .8, mode === 'nap' ? 13 : profile ? 12 : 10, 2.7, .2);
      if (mode === 'nap') {
        clay(c, 0, -3.4, 10.5, 6 + breathe, '#e0b57a', '#b8804e');
        for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(-3 + i * 3, -4, 2.2, 4, -.5, 3.8, 5.7); c.strokeStyle = '#ad784866'; c.lineWidth = 1.2; c.stroke(); }
        catHead(c, 5, -3.4, 'down', time, true, .24);
        c.beginPath(); c.moveTo(-8, -2); c.bezierCurveTo(-10, 4, 7, 5, 9, -.5); c.strokeStyle = '#c58d54'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke();
        if (cat.elapsed > 2) { c.save(); c.globalAlpha = .32 + Math.sin(time / 900) * .15; c.fillStyle = '#eee7ca'; c.font = '6px serif'; c.fillText('z', 8, -15 - (time / 1000 % 2) * 2); c.restore(); }
      } else if (cat.moving || mode === 'sniff') {
        const longitudinal = profile ? 1 : .65, lean = mode === 'sniff' ? 3 + Math.sin(time / 180) * .5 : 0;
        catTail(c, -side * 6.8 * longitudinal, -7 + bob, side, time);
        for (let i = 0; i < 4; i++) { const front = i < 2, x = (front ? side * 5.5 : -side * 5.5) * longitudinal + (i % 2 ? 1 : -1), cycle = Math.sin(gait + (i === 0 || i === 3 ? 0 : Math.PI)), foot = cat.moving ? cycle * 1.9 : 0; capsule(c, [x, -5 + bob], [x + foot, -1 - (cat.moving ? Math.max(0, -cycle) * 1.8 : 0)], 2.9, '#e2b87f', '#b07b4f'); ellipse(c, x + foot, -.4, 2, 1.1, '#ead1a8'); }
        clay(c, 0, -7 + bob, 9.3 * longitudinal, profile ? 4.6 : 6, '#e7bc7f', '#bd8751');
        for (let i = -1; i <= 1; i++) stroke(c, [[i * 3, -10 + bob], [i * 3 + .8, -7.5 + bob]], '#ae784966', 1.4);
        const hx = profile ? side * (7 + lean * .35) : 0, hy = cat.dir === 'up' ? -12 + lean * .2 : profile ? -9 + lean : -5 + lean * .5;
        catHead(c, hx, hy + bob, cat.dir, time, false, mode === 'sniff' ? side * .12 : Math.sin(gait) * .025);
      } else {
        catTail(c, -side * 4, -3, side, time, true);
        clay(c, 0, -5.5 + breathe, 6.7, 7.5, '#e3b77a', '#b9804b');
        clay(c, 0, -4.3, 3.5, 4.8, '#f1ddbc', '#d3b48b');
        for (const x of [-3.8, 3.8]) { capsule(c, [x, -5], [x, -.5], 3, '#e7c08b', '#bf8d5f'); ellipse(c, x, -.2, 2.6, 1.35, '#f2dcbb'); }
        const grooming = mode === 'groom', tilt = grooming ? .22 + Math.sin(time / 190) * .12 : mode === 'look' ? Math.sin(time / 700) * .09 : .02;
        catHead(c, grooming ? 1.6 : 0, -12 + breathe + (grooming ? 1.6 : 0), mode === 'look' ? cat.dir : 'down', time, mode === 'pet', tilt);
        if (grooming) { capsule(c, [4, -5], [3 + Math.sin(time / 180) * .6, -10], 2.8, '#efd4a8', '#c69b70'); if (Math.sin(time / 180) > .2) ellipse(c, 2, -7.9, 1.2, .55, '#d69d93'); }
      }
      catHeart(c, cat);
      c.restore();
    }
  };
  global.Action = Action; global.CatAI = CatAI;
})(window);
