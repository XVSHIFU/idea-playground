/* 栖川 · a deterministic, browser-local living town. No network and no dependencies. */
(function (global) {
  'use strict';

  const VERSION = 1;
  const STEP = 1 / 12;
  const WIDTH = 30;
  const HEIGHT = 26;
  const MAX_PEOPLE = 180;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const round = n => Math.round(n * 100) / 100;
  const TYPES = {
    house:    { label: '民居', role: '待业', jobs: 0, capacity: 6, wage: 0, wood: 45, cost: 180, labor: 24 },
    farm:     { label: '农田', role: '农人', jobs: 3, capacity: 3, wage: 1.8, wood: 30, cost: 140, labor: 18 },
    market:   { label: '集市', role: '商贩', jobs: 3, capacity: 18, wage: 1.75, wood: 45, cost: 220, labor: 24 },
    workshop: { label: '工坊', role: '匠人', jobs: 3, capacity: 6, wage: 2.05, wood: 60, cost: 260, labor: 32 },
    clinic:   { label: '诊所', role: '医者', jobs: 3, capacity: 8, wage: 2.2, wood: 55, cost: 320, labor: 30 },
    cafe:     { label: '茶馆', role: '茶人', jobs: 3, capacity: 12, wage: 1.7, wood: 40, cost: 220, labor: 24 },
    hall:     { label: '议事厅', role: '事务员', jobs: 2, capacity: 10, wage: 1.7, wood: 60, cost: 320, labor: 32 },
    park:     { label: '花园', role: '待业', jobs: 0, capacity: 18, wage: 0, wood: 20, cost: 120, labor: 16 },
    sawmill:  { label: '林场', role: '护林人', jobs: 4, capacity: 4, wage: 1.85, wood: 50, cost: 220, labor: 24 }
  };
  const SURNAMES = ['林', '沈', '苏', '陆', '许', '陈', '周', '温', '顾', '宋', '江', '叶', '程', '孟', '方', '陶', '秦', '余'];
  const GIVEN = ['知夏', '时雨', '青禾', '云舟', '晚晴', '见山', '书宁', '听澜', '予安', '星野', '清和', '南枝', '木生', '小满', '远川', '芷晴', '如初', '明溪', '怀谷', '溪月', '一苇', '景行', '禾雨', '闻笙'];
  const COLORS = ['#b45b44', '#54796e', '#be9c58', '#6f8292', '#8c7891', '#cf8064', '#749963', '#d1b279'];
  const SEASONS = ['春', '夏', '秋', '冬'];
  const HOUSE_NAMES = ['听雨居', '青石小院', '南风里', '云影居', '向晚人家', '河畔小院', '栀子院', '梧桐居', '晴窗里', '松间居', '归云院'];

  class MinHeap {
    constructor() { this.items = []; }
    push(item) {
      const a = this.items; a.push(item); let i = a.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= item.f) break; a[i] = a[p]; i = p; }
      a[i] = item;
    }
    pop() {
      const a = this.items; const first = a[0]; const last = a.pop();
      if (a.length) {
        let i = 0;
        while (i * 2 + 1 < a.length) {
          let child = i * 2 + 1;
          if (child + 1 < a.length && a[child + 1].f < a[child].f) child++;
          if (a[child].f >= last.f) break;
          a[i] = a[child]; i = child;
        }
        a[i] = last;
      }
      return first;
    }
    get length() { return this.items.length; }
  }

  class TownEngine {
    constructor(seed = 271828, saved = null) {
      if (saved) {
        this.state = TownEngine._validate(saved);
        this._reindex();
        return;
      }
      const normalizedSeed = Number.isFinite(Number(seed)) ? (Number(seed) >>> 0) || 271828 : 271828;
      this.state = {
        version: VERSION, seed: normalizedSeed, rng: normalizedSeed, time: 7, day: 1,
        width: WIDTH, height: HEIGHT, weather: '晴', season: '春', temperature: 19,
        agents: [], buildings: [], tiles: [], events: [], history: [], projects: [],
        policies: { tax: 12, welfare: 35, openness: 65 },
        resources: { food: 260, wood: 180, goods: 70, treasury: 1200 },
        prices: { food: 3, goods: 7 }, nextId: 1,
        effects: { irrigationUntil: 0, droughtUntil: 0, festivalUntil: 0, festivalCooldown: 0 },
        totals: { arrivals: 0, departures: 0, births: 0, meals: 0, taxes: 0, trade: 0 },
        daily: { wages: 0, taxes: 0, foodProduced: 0, woodProduced: 0, goodsProduced: 0, foodEaten: 0, trade: 0, welfare: 0 },
        lastTrade: { income: 0, food: 0, wood: 0, goods: 0 },
        _remainder: 0, _socialAt: 7.5, _priceAt: 8, _nameSerial: 0
      };
      this._makeTerrain();
      this._makeBuildings();
      this._reindex();
      for (let i = 0; i < 42; i++) this._newResident(true);
      this._assignJobs();
      this._reindex();
      for (const a of this.state.agents) {
        a.homeComfort = 65 + this._rand() * 18;
        this._memory(a, `搬进${this._building(a.homeId).name}，开始在栖川生活。`);
      }
      // Neighbours arrive with a handful of modest relationships, not a complete social graph.
      for (let i = 0; i < this.state.agents.length; i++) {
        const a = this.state.agents[i];
        const b = this.state.agents[(i + 1) % this.state.agents.length];
        if (a.homeId === b.homeId) this._bond(a, b, 12 + this._rand() * 10);
      }
      this._event('life', '栖川醒来了', '42 位居民沿河安家。农田、工坊与集市开始了一天的生活。');
      this._event('economy', '共同的仓库', '居民购买粮食与用品，收入回到公库；在岗劳动领取工资。小城靠生产与对外贸易维持运转。');
      this._recordHistory();
    }

    _rand() {
      let n = this.state.rng >>> 0;
      n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
      this.state.rng = n >>> 0;
      return (n >>> 0) / 4294967296;
    }
    _pick(list) { return list[Math.floor(this._rand() * list.length)]; }
    _id(prefix) { return prefix + this.state.nextId++; }
    _tile(x, z) { return this.state.tiles[z * WIDTH + x]; }
    _building(id) { return this._buildings.get(id); }

    _makeTerrain() {
      for (let z = 0; z < HEIGHT; z++) {
        const river = 7.25 + Math.sin(z * 0.23) * 1.1;
        for (let x = 0; x < WIDTH; x++) {
          const water = Math.abs(x + 0.5 - river) < 1.45;
          this.state.tiles.push({ x, z, kind: water ? 'water' : 'grass', elevation: 0 });
        }
      }
      const road = (x, z) => {
        if (x < 0 || z < 0 || x >= WIDTH || z >= HEIGHT) return;
        const t = this._tile(x, z); t.kind = t.kind === 'water' ? 'bridge' : 'road';
      };
      for (let z = 2; z <= 24; z++) { road(14, z); road(22, z); road(3, z); }
      for (const z of [6, 10, 15, 19, 22]) {
        for (let x = (z === 10 || z === 19) ? 3 : 11; x <= 28; x++) road(x, z);
      }
      for (const z of [5, 8, 14, 17, 22]) for (let x = 0; x <= 3; x++) road(x, z);
    }

    _addBuilding(type, name, x, z, options = {}) {
      const spec = TYPES[type];
      const b = {
        id: this._id('b'), type, name, x, z, w: 2, d: 2, level: 1,
        capacity: spec.capacity, workers: [], progress: 1,
        door: { x, z: z + 2 }, builtDay: this.state.day, ...options
      };
      this.state.buildings.push(b);
      for (let zz = b.z; zz < b.z + b.d; zz++) for (let xx = b.x; xx < b.x + b.w; xx++) {
        const tile = this._tile(xx, zz);
        tile.occupied = b.id;
        tile.kind = type === 'farm' ? 'field' : 'grass';
      }
      return b;
    }

    _makeBuildings() {
      const houses = [[11, 3], [15, 3], [18, 3], [23, 3], [26, 3], [11, 7], [15, 7], [23, 7], [26, 7], [11, 20], [26, 20]];
      houses.forEach((p, i) => this._addBuilding('house', HOUSE_NAMES[i], p[0], p[1]));
      this._addBuilding('farm', '晨露田', 0, 3);
      this._addBuilding('farm', '青禾田', 0, 6);
      this._addBuilding('farm', '河湾田', 0, 12);
      this._addBuilding('farm', '南坡田', 0, 15);
      this._addBuilding('sawmill', '松风林场', 0, 20);
      this._addBuilding('market', '河岸集市', 18, 7);
      this._addBuilding('workshop', '木石工坊', 18, 11);
      this._addBuilding('workshop', '青瓦工坊', 23, 11);
      this._addBuilding('clinic', '济安诊所', 26, 11);
      this._addBuilding('cafe', '一盏茶馆', 11, 11);
      this._addBuilding('hall', '栖川议事厅', 15, 11);
      this._addBuilding('park', '河风花园', 18, 16, { w: 3, d: 2, capacity: 20 });
    }

    _reindex() {
      this._buildings = new Map(this.state.buildings.map(b => [b.id, b]));
      this._agents = new Map(this.state.agents.map(a => [a.id, a]));
      for (const t of this.state.tiles) delete t.occupied;
      for (const b of this.state.buildings) {
        for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) this._tile(x, z).occupied = b.id;
      }
    }

    _newResident(initial = false) {
      const s = this.state;
      const homes = s.buildings.filter(b => b.type === 'house' && b.progress >= 1);
      const occupancy = new Map(homes.map(h => [h.id, 0]));
      for (const a of s.agents) occupancy.set(a.homeId, (occupancy.get(a.homeId) || 0) + 1);
      const available = homes.filter(h => occupancy.get(h.id) < h.capacity);
      if (!available.length || s.agents.length >= MAX_PEOPLE) return null;
      available.sort((a, b) => occupancy.get(a.id) - occupancy.get(b.id));
      const home = available[Math.floor(this._rand() * Math.min(3, available.length))];
      const serial = s._nameSerial++;
      let name = SURNAMES[(serial + Math.floor(this._rand() * SURNAMES.length)) % SURNAMES.length] + GIVEN[serial % GIVEN.length];
      if (s.agents.some(a => a.name === name)) name += '·' + (serial + 1);
      const retired = serial % 11 === 8;
      const age = retired ? 66 + Math.floor(this._rand() * 12) : 19 + Math.floor(this._rand() * 40);
      const door = home.door;
      const a = {
        id: this._id('p'), name, age, role: retired ? '退休居民' : '待业', homeId: home.id, workId: null,
        x: initial ? door.x + 0.5 : 10.5, z: initial ? door.z + 0.5 : 19.5,
        targetId: home.id, action: initial ? '在家准备出门' : '前往新家',
        hunger: 16 + this._rand() * 32, energy: 70 + this._rand() * 24,
        social: 49 + this._rand() * 35, happiness: 68 + this._rand() * 15,
        health: 78 + this._rand() * 20, money: 55 + this._rand() * 65,
        traits: { friendliness: round(0.25 + this._rand() * 0.75), diligence: round(0.45 + this._rand() * 0.55), resilience: round(0.3 + this._rand() * 0.7) },
        friends: [], memories: [], color: COLORS[serial % COLORS.length],
        personality: '', bio: '', homeComfort: 70, joinedDay: s.day,
        _mode: 'home', _path: [], _pathIndex: 0, _decisionAt: s.time + this._rand() * 0.7,
        _workToday: 0, _wagesToday: 0, _unpaidToday: 0, _badDays: 0,
        _lastMeal: -12, _lastGoods: s.day - Math.floor(this._rand() * 4), _socialAt: s.time,
        _metToday: [], _lastHealthStory: 0, _retired: retired
      };
      a.personality = a.traits.friendliness > 0.72 ? '热心健谈' : a.traits.diligence > 0.8 ? '踏实认真' : a.traits.resilience > 0.7 ? '随和坚韧' : '安静细腻';
      a.bio = retired ? '愿意把闲暇留给邻里，也喜欢沿着河岸慢慢走。' : this._pick(['相信手里的活儿能让日子一点点变好。', '喜欢认识新邻居，盼着把这里住成故乡。', '做事有自己的节奏，对河边的生活充满期待。', '想攒下一点积蓄，也想找到聊得来的人。']);
      s.agents.push(a);
      if (this._agents) this._agents.set(a.id, a);
      if (!initial) {
        s.totals.arrivals++;
        this._memory(a, `带着行囊来到栖川，住进${home.name}。`);
        this._event('arrival', `${a.name}搬来了`, `空余住房与小城的生活吸引了新居民，${home.name}亮起了一扇新的窗。`, a.id, home.id);
        a._path = this._path(a.x, a.z, door.x, door.z);
      }
      return a;
    }

    _assignJobs() {
      const s = this.state;
      for (const b of s.buildings) b.workers = b.workers.filter(id => {
        const a = s.agents.find(p => p.id === id); return a && a.workId === b.id;
      });
      const vacancies = s.buildings.filter(b => b.progress >= 1 && TYPES[b.type].jobs > b.workers.length);
      const urgency = { farm: 0, clinic: 2, sawmill: 3, workshop: 4, market: 5, cafe: 6, hall: 7 };
      vacancies.sort((a, b) => (urgency[a.type] || 0) - (urgency[b.type] || 0));
      for (const a of s.agents) {
        if (a.workId || a._retired) continue;
        const workplace = vacancies.find(b => b.workers.length < TYPES[b.type].jobs);
        if (!workplace) { a.role = '待业'; continue; }
        a.workId = workplace.id; a.role = TYPES[workplace.type].role;
        workplace.workers.push(a.id);
        if (s.day > 1) this._memory(a, `在${workplace.name}找到了一份${a.role}的工作。`);
      }
    }

    _walkable(x, z) {
      if (x < 0 || z < 0 || x >= WIDTH || z >= HEIGHT) return false;
      const t = this._tile(x, z);
      return t.kind !== 'water' && !t.occupied;
    }

    _path(px, pz, tx, tz) {
      const sx = clamp(Math.floor(px), 0, WIDTH - 1), sz = clamp(Math.floor(pz), 0, HEIGHT - 1);
      const start = sz * WIDTH + sx, goal = tz * WIDTH + tx;
      if (start === goal) return [];
      if (!this._walkable(tx, tz)) return [];
      const open = new MinHeap();
      const distance = new Float64Array(WIDTH * HEIGHT); distance.fill(Infinity); distance[start] = 0;
      const parent = new Int16Array(WIDTH * HEIGHT); parent.fill(-1);
      const closed = new Uint8Array(WIDTH * HEIGHT);
      open.push({ index: start, f: 0 });
      while (open.length) {
        const current = open.pop().index;
        if (closed[current]) continue;
        if (current === goal) {
          const result = []; let i = goal;
          while (i !== start && i !== -1) { result.push({ x: i % WIDTH + 0.5, z: Math.floor(i / WIDTH) + 0.5 }); i = parent[i]; }
          return result.reverse();
        }
        closed[current] = 1;
        const cx = current % WIDTH, cz = Math.floor(current / WIDTH);
        for (const delta of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const x = cx + delta[0], z = cz + delta[1];
          if (!this._walkable(x, z)) continue;
          const index = z * WIDTH + x;
          if (closed[index]) continue;
          const t = this._tile(x, z);
          const cost = t.kind === 'road' || t.kind === 'bridge' ? 1 : 1.65;
          const next = distance[current] + cost;
          if (next < distance[index]) {
            distance[index] = next; parent[index] = current;
            open.push({ index, f: next + Math.abs(x - tx) + Math.abs(z - tz) });
          }
        }
      }
      return [];
    }

    _nearest(a, type) {
      return this.state.buildings.filter(b => b.type === type && b.progress >= 1).sort((b, c) =>
        Math.abs(b.x - a.x) + Math.abs(b.z - a.z) - Math.abs(c.x - a.x) - Math.abs(c.z - a.z)
      )[0] || null;
    }

    _go(a, building, mode) {
      if (!building) { building = this._building(a.homeId); mode = 'home'; }
      if (!building) return;
      if (a.targetId !== building.id || a._mode !== mode) {
        a.targetId = building.id; a._mode = mode;
        a._path = this._path(a.x, a.z, building.door.x, building.door.z); a._pathIndex = 0;
      }
      if (a._pathIndex < a._path.length) a.action = `前往${building.name}`;
    }

    _decide(a) {
      const s = this.state, hour = s.time % 24;
      const home = this._building(a.homeId);
      if (hour < 5.5 || hour >= 21.5 || a.energy < 19) { this._go(a, home, 'rest'); return; }
      if (a.health < 43 && hour >= 8 && hour < 18) { this._go(a, this._nearest(a, 'clinic'), 'heal'); return; }
      if (a.hunger > 48 && s.resources.food > 0.05) { this._go(a, this._nearest(a, 'market'), 'meal'); return; }
      if (a.workId && hour >= 7.5 && hour < 17.5 && a.energy > 24 && a.hunger < 82) {
        const work = this._building(a.workId);
        if (work) { this._go(a, work, work.progress < 1 ? 'build' : 'work'); return; }
      }
      if (a.hunger > 74 && s.resources.food < 0.1) { this._go(a, home, 'wait'); return; }
      if (hour >= 17 && hour < 21.3 || !a.workId && hour > 10 && hour < 17) {
        if (a._lastGoods <= s.day - 3 && a.money > s.prices.goods + s.prices.food * 4 && s.resources.goods >= 1) {
          this._go(a, this._nearest(a, 'market'), 'shop'); return;
        }
        if (a.social < 88 || s.effects.festivalUntil > s.time) {
          const type = s.weather === '雨' || s.weather === '雪' ? 'cafe' : 'park';
          this._go(a, this._nearest(a, type), 'social'); return;
        }
      }
      this._go(a, home, a.energy < 60 ? 'rest' : 'home');
    }

    _move(a, dt) {
      let travel = dt * (7.8 + a.traits.diligence * 2) * (a.energy < 25 ? 0.68 : 1);
      if (this.state.weather === '雨' || this.state.weather === '雪') travel *= 0.86;
      while (travel > 0 && a._pathIndex < a._path.length) {
        const target = a._path[a._pathIndex];
        const dx = target.x - a.x, dz = target.z - a.z, distance = Math.hypot(dx, dz);
        if (distance <= travel + 0.00001) {
          a.x = target.x; a.z = target.z; travel -= distance; a._pathIndex++;
        } else {
          a.x += dx / distance * travel; a.z += dz / distance * travel; travel = 0;
        }
      }
      return a._pathIndex < a._path.length;
    }

    _atDestination(a) {
      const b = this._building(a.targetId);
      return !!b && Math.hypot(a.x - (b.door.x + 0.5), a.z - (b.door.z + 0.5)) < 0.8;
    }

    _meal(a) {
      const s = this.state;
      if (s.time - a._lastMeal < 2 || a.hunger < 38) return;
      const price = s.prices.food;
      let amount = Math.min(1.4, s.resources.food, a.money / price);
      let publicMeal = false;
      if (amount < 0.25 && s.policies.welfare >= 70 && s.resources.treasury >= price && s.resources.food >= 1) {
        amount = 1; publicMeal = true;
      }
      if (amount < 0.05) { a.action = '粮钱不足，等待帮助'; return; }
      const paid = amount * price;
      if (publicMeal) { s.resources.treasury -= paid; s.daily.welfare += paid; }
      else { a.money = Math.max(0, a.money - paid); s.resources.treasury += paid; }
      s.resources.food = Math.max(0, s.resources.food - amount);
      s.daily.foodEaten += amount; s.totals.meals++;
      a.hunger = Math.max(0, a.hunger - amount * 34.5);
      a.energy = Math.min(100, a.energy + amount * 3);
      a._lastMeal = s.time;
      a.action = publicMeal ? '领取一份公共餐食' : '在集市吃一顿热饭';
      if (publicMeal) this._memory(a, '公共餐食帮自己度过了手头紧张的一天。');
      a._decisionAt = s.time + 0.3;
    }

    _work(a, b, dt) {
      const s = this.state, spec = TYPES[b.type];
      const skill = 0.72 + a.traits.diligence * 0.5;
      const gross = spec.wage * dt * skill;
      const tax = gross * s.policies.tax / 100;
      const net = gross - tax;
      const paid = Math.min(net, s.resources.treasury);
      const fraction = net > 0 ? paid / net : 1;
      s.resources.treasury -= paid; a.money += paid;
      a._workToday += dt; a._wagesToday += paid;
      a._unpaidToday += net - paid;
      s.daily.wages += paid; s.daily.taxes += tax * fraction; s.totals.taxes += tax * fraction;
      const effort = skill * (0.3 + fraction * 0.7) * (a.hunger > 65 ? 0.7 : 1);
      if (b.type === 'farm') {
        const seasons = { '春': 1.05, '夏': 1.1, '秋': 1.18, '冬': 0.55 };
        let weather = s.weather === '雨' ? 1.12 : s.weather === '旱' ? 0.42 : s.weather === '雪' ? 0.65 : 1;
        if (s.effects.irrigationUntil > s.time) weather = Math.max(weather, 1.1);
        const yieldAmount = 1.8 * dt * effort * seasons[s.season] * weather;
        s.resources.food += yieldAmount; s.daily.foodProduced += yieldAmount;
        a.action = s.weather === '旱' && s.effects.irrigationUntil <= s.time ? '照料受旱的作物' : '在田间耕作';
      } else if (b.type === 'sawmill') {
        const amount = 1.55 * dt * effort;
        s.resources.wood += amount; s.daily.woodProduced += amount; a.action = '养护林木、整理木料';
      } else if (b.type === 'workshop') {
        const amount = Math.min(1.0 * dt * effort, s.resources.wood / 0.45);
        s.resources.wood = Math.max(0, s.resources.wood - amount * 0.45);
        s.resources.goods += amount; s.daily.goodsProduced += amount;
        a.action = amount > 0 ? '把木料做成日用器物' : '等待工坊的木料';
      } else if (b.type === 'clinic') { a.action = '在诊所照顾居民'; }
      else if (b.type === 'cafe') { a.action = '备茶、招呼来客'; }
      else if (b.type === 'market') { a.action = '整理货摊、照看集市'; }
      else if (b.type === 'hall') { a.action = '整理账簿与邻里事务'; }
      if (fraction < 0.5) a.action += ' · 工资短缺';
    }

    _buildWork(a, b, dt) {
      const s = this.state;
      const project = s.projects.find(p => p.buildingId === b.id);
      if (!project) return;
      const wage = 1.8 * dt * (1 - s.policies.tax / 100);
      const paid = Math.min(wage, s.resources.treasury);
      s.resources.treasury -= paid; a.money += paid; a._wagesToday += paid; a._workToday += dt; s.daily.wages += paid;
      const effort = dt * (0.6 + a.traits.diligence * 0.6) * (paid >= wage * 0.5 ? 1 : 0.45);
      project.laborDone += effort;
      b.progress = Math.min(1, project.laborDone / project.laborRequired);
      a.action = `参与建造${b.name}`;
    }

    _act(a, dt) {
      const s = this.state;
      if (!this._atDestination(a)) { a.action = '沿小路前行'; a._decisionAt = Math.min(a._decisionAt, s.time + 0.5); return; }
      const b = this._building(a.targetId);
      switch (a._mode) {
        case 'rest':
          a.energy += dt * 10.2; a.action = s.time % 24 >= 21 || s.time % 24 < 7 ? '在家安睡' : '回家休息'; break;
        case 'home':
          a.energy += dt * 4.3; a.social += dt * 0.2; a.action = '在家料理生活'; break;
        case 'meal': this._meal(a); break;
        case 'work': this._work(a, b, dt); break;
        case 'build': this._buildWork(a, b, dt); break;
        case 'heal': {
          const doctors = b.workers.filter(id => { const p = this._agents.get(id); return p && p._mode === 'work' && this._atDestination(p); }).length;
          const healing = doctors > 0 ? 6 + doctors : 0.8;
          a.health += dt * healing; a.energy += dt * 2;
          s.resources.goods = Math.max(0, s.resources.goods - dt * 0.035);
          a.action = doctors ? '在诊所接受照料' : '在诊所静候医者';
          if (a.health >= 78) {
            this._memory(a, `${b.name}的照料让身体恢复了。`); a._decisionAt = s.time;
          }
          break;
        }
        case 'social':
          a.social += dt * (b.type === 'park' ? 1.5 : 2.2);
          a.energy += dt * 0.7;
          a.action = s.effects.festivalUntil > s.time ? '参加河岸节，与邻居相聚' : b.type === 'park' ? '在花园歇脚、等候朋友' : '在茶馆听邻里闲谈';
          break;
        case 'shop':
          if (a._lastGoods < s.day && s.resources.goods >= 1 && a.money >= s.prices.goods) {
            a.money -= s.prices.goods; s.resources.treasury += s.prices.goods; s.resources.goods--;
            a.homeComfort = Math.min(100, a.homeComfort + 9); a.happiness += 3;
            a._lastGoods = s.day; a.action = '为家里添置日用器物';
            a._decisionAt = s.time + 0.3;
          } else { a._lastGoods = s.day; a._decisionAt = s.time; }
          break;
        case 'wait': a.action = '留在家中，等待粮食补给'; break;
        default: a.action = '在河岸小歇';
      }
    }

    _advance(dt) {
      const s = this.state;
      const beforeDay = s.day;
      s.time += dt; s.day = Math.floor((s.time + 0.000001) / 24) + 1;
      if (s.day !== beforeDay) this._newDay();
      for (const a of s.agents) {
        a.hunger += dt * (1.92 + (a._mode === 'work' || a._mode === 'build' ? 0.12 : 0));
        a.energy -= dt * 1.9;
        a.social -= dt * (0.65 + a.traits.friendliness * 0.65);
        if (a.hunger > 84) a.health -= dt * (a.hunger - 80) * 0.15;
        else if (a.hunger < 65 && a.energy > 40) a.health += dt * 0.25;
        if (s.time >= a._decisionAt) {
          this._decide(a); a._decisionAt = s.time + 0.6 + this._rand() * 0.35;
        }
        const moving = this._move(a, dt);
        if (moving) {
          const target = this._building(a.targetId); a.action = target ? `前往${target.name}` : '沿河岸行走';
          a.energy -= dt * 0.55;
        } else this._act(a, dt);
        const moneySafety = clamp(a.money / (s.prices.food * 10), 0, 1);
        const jobSafety = a.workId || a._retired ? 1 : 0.45;
        let targetMood = (100 - a.hunger) * 0.24 + a.energy * 0.17 + a.social * 0.2 + a.health * 0.14 + a.homeComfort * 0.1 + moneySafety * 10 + jobSafety * 5;
        if (s.effects.festivalUntil > s.time) targetMood += 6;
        if (a._unpaidToday > 2) targetMood -= 7;
        a.happiness += (targetMood - a.happiness) * Math.min(1, dt * 0.28);
        for (const key of ['hunger', 'energy', 'social', 'health', 'happiness']) a[key] = clamp(a[key], 0, 100);
        a.money = clamp(a.money, 0, 1e9);
      }
      if (s.time >= s._socialAt) { this._socialize(); s._socialAt = s.time + 0.75; }
      if (s.time >= s._priceAt) { this._updatePrices(); s._priceAt = s.time + 2; }
      this._finishProjects();
      for (const key of ['food', 'wood', 'goods', 'treasury']) s.resources[key] = clamp(s.resources[key], 0, 1e10);
    }

    step(hours) {
      if (!Number.isFinite(hours) || hours <= 0) return;
      this.state._remainder += Math.min(hours, 24);
      let steps = 0;
      while (this.state._remainder + 1e-10 >= STEP && steps < 288) {
        this.state._remainder -= STEP;
        this._advance(STEP); steps++;
      }
      this.state._remainder = Math.max(0, this.state._remainder);
    }

    _bond(a, b, amount) {
      if (a.id === b.id) return;
      for (const [person, other] of [[a, b], [b, a]]) {
        let friend = person.friends.find(f => f.id === other.id);
        if (!friend) { friend = { id: other.id, score: 0 }; person.friends.push(friend); }
        friend.score = clamp(friend.score + amount, 0, 100);
        person.friends.sort((c, d) => d.score - c.score);
        if (person.friends.length > 18) person.friends.length = 18;
      }
    }

    _socialize() {
      const s = this.state;
      const groups = new Map();
      for (const a of s.agents) {
        if (!this._atDestination(a) || !['social', 'home', 'work', 'meal'].includes(a._mode)) continue;
        if (!groups.has(a.targetId)) groups.set(a.targetId, []);
        groups.get(a.targetId).push(a);
      }
      for (const people of groups.values()) {
        if (people.length < 2) continue;
        for (const a of people) {
          if (s.time < a._socialAt) continue;
          const others = people.filter(p => p.id !== a.id);
          const b = this._pick(others);
          const before = (a.friends.find(f => f.id === b.id) || { score: 0 }).score;
          const boost = 1.8 + (a.traits.friendliness + b.traits.friendliness) * 2 + (s.effects.festivalUntil > s.time ? 2 : 0);
          this._bond(a, b, boost);
          a.social = Math.min(100, a.social + 5 + boost);
          b.social = Math.min(100, b.social + 3 + boost * 0.5);
          a._socialAt = s.time + 1.4;
          b._socialAt = Math.max(b._socialAt, s.time + 0.6);
          const after = (a.friends.find(f => f.id === b.id) || { score: 0 }).score;
          if (before < 30 && after >= 30) {
            const place = this._building(a.targetId);
            this._memory(a, `与${b.name}渐渐熟悉，见面时总能聊上几句。`);
            this._memory(b, `${a.name}成为了可以说说心里话的邻居。`);
            if (s.events.filter(e => e.day === s.day && e.type === 'life').length < 5) {
              this._event('life', '又多了一位朋友', `${a.name}与${b.name}在${place ? place.name : '河畔'}渐渐熟络。一起度过的时间让归属感增加了。`, a.id);
            }
          }
          if (before < 65 && after >= 65) {
            this._memory(a, `和${b.name}成了相互信任的老朋友。`);
            this._memory(b, `与${a.name}的友谊已不止于点头之交。`);
          }
          if (a.money > 70 && b.money < 4 && after > 45) {
            const gift = Math.min(6, a.money - 50); a.money -= gift; b.money += gift;
            this._memory(b, `${a.name}借出${Math.round(gift)}枚钱，让自己先把饭吃好。`);
            a._socialAt = s.time + 4;
          }
        }
      }
    }

    _updatePrices() {
      const s = this.state, foodDays = s.resources.food / Math.max(1, s.agents.length * 1.45);
      const scarcity = clamp(2.8 / Math.max(0.45, foodDays), 0.7, 3.2);
      const target = clamp(2.5 * scarcity, 1.8, 8);
      s.prices.food = round(s.prices.food * 0.88 + target * 0.12);
      const goodsPerPerson = s.resources.goods / Math.max(1, s.agents.length);
      s.prices.goods = round(s.prices.goods * 0.9 + clamp(7.5 / Math.max(0.8, goodsPerPerson), 4.5, 12) * 0.1);
    }

    _weather() {
      const s = this.state;
      const seasonIndex = Math.floor((s.day - 1) / 30) % 4;
      s.season = SEASONS[seasonIndex];
      const roll = this._rand();
      let weather;
      if (s.effects.droughtUntil > s.time) weather = '旱';
      else if (s.season === '冬') weather = roll < 0.3 ? '雪' : roll < 0.65 ? '阴' : '晴';
      else if (s.season === '夏') weather = roll < 0.13 ? '旱' : roll < 0.36 ? '雨' : roll < 0.5 ? '阴' : '晴';
      else weather = roll < 0.25 ? '雨' : roll < 0.43 ? '阴' : '晴';
      const previous = s.weather; s.weather = weather;
      s.temperature = Math.round([18, 29, 19, 5][seasonIndex] + this._rand() * 8 - 4 + (weather === '旱' ? 4 : weather === '雨' ? -2 : 0));
      if (previous !== weather) {
        const text = weather === '旱' ? '河岸迎来干燥天气，未引水的农田产量下降。粮仓的余量会变得重要。' : weather === '雨' ? '雨水滋养了农田，居民放慢脚步，把相聚的地方挪进茶馆。' : weather === '雪' ? '雪落在屋顶。冬日作物长得更慢，先前的储备开始派上用场。' : '天气转好，河岸与田间又热闹起来。';
        this._event('weather', `今日${weather} · ${s.temperature}°C`, text);
      }
      if ((s.day - 1) % 30 === 0 && s.day > 1) this._event('weather', `${s.season}天到了`, `小城进入新的季节，农田产出与天气也随之改变。`);
    }

    _dailyTrade() {
      const s = this.state, p = s.agents.length;
      const food = Math.max(0, Math.min(45, s.resources.food - p * 4.8));
      const wood = Math.max(0, Math.min(28, s.resources.wood - 150));
      const goods = Math.max(0, Math.min(22, s.resources.goods - p * 1.7));
      const income = food * 1.6 + wood * 2.2 + goods * 5.5;
      s.resources.food -= food; s.resources.wood -= wood; s.resources.goods -= goods;
      s.resources.treasury += income; s.daily.trade += income; s.totals.trade += income;
      s.lastTrade = { income: round(income), food: round(food), wood: round(wood), goods: round(goods) };
      if (income >= 15) this._event('economy', '河路商队带来收入', `卖出富余粮食${Math.round(food)}、木料${Math.round(wood)}、器物${Math.round(goods)}，公库收入${Math.round(income)}枚钱。必要储备留在镇内。`);
    }

    _welfare() {
      const s = this.state;
      const budget = Math.min(s.resources.treasury * 0.09, s.agents.length * 2.4) * s.policies.welfare / 100;
      const eligible = s.agents.filter(a => a.money < s.prices.food * 14).sort((a, b) => a.money - b.money);
      if (!eligible.length || budget < 0.1) return;
      let remaining = budget;
      const needs = eligible.map(a => Math.max(1, s.prices.food * 14 - a.money));
      const totalNeed = needs.reduce((a, b) => a + b, 0);
      eligible.forEach((a, i) => {
        const payment = Math.min(remaining, budget * needs[i] / totalNeed);
        a.money += payment; remaining -= payment;
        if (payment > 3 && s.day % 4 === 0) this._memory(a, `收到公共生活补助${Math.round(payment)}枚钱。`);
      });
      const spent = budget - remaining; s.resources.treasury -= spent; s.daily.welfare += spent;
    }

    _newDay() {
      const s = this.state;
      this._recordHistory(s.day - 1);
      const previousDaily = { ...s.daily };
      s.daily = { wages: 0, taxes: 0, foodProduced: 0, woodProduced: 0, goodsProduced: 0, foodEaten: 0, trade: 0, welfare: 0 };
      this._weather();
      this._dailyTrade();
      this._welfare();
      const upkeep = Math.min(s.resources.treasury, s.buildings.filter(b => b.progress >= 1).length * 0.32);
      s.resources.treasury -= upkeep;
      for (const a of s.agents) {
        a.homeComfort = Math.max(35, a.homeComfort - 1.5);
        a._badDays = a.happiness < 37 || a.hunger > 80 ? a._badDays + 1 : Math.max(0, a._badDays - 1);
        if (a._unpaidToday > 3) this._memory(a, '公库吃紧，今天的劳动没能领到足额工资。');
        if (a._wagesToday > 2 && s.day % 5 === 0) this._memory(a, `昨天工作${a._workToday.toFixed(1)}小时，带回${Math.round(a._wagesToday)}枚钱。`);
        if (a.hunger > 80 && s.day - a._lastHealthStory >= 3) {
          this._memory(a, '吃饭成了眼下最挂念的事情。'); a._lastHealthStory = s.day;
        }
        a._workToday = 0; a._wagesToday = 0; a._unpaidToday = 0; a._metToday = [];
        for (const f of a.friends) f.score = Math.max(0, f.score - 0.45);
        a.friends = a.friends.filter(f => f.score > 0.5 && this._agents.has(f.id));
        if (s.day % 365 === 0) a.age++;
      }
      const unhappy = s.agents.filter(a => a._badDays >= 3).sort((a, b) => b._badDays - a._badDays || a.happiness - b.happiness);
      if (unhappy.length && this._rand() < 0.5) this._leave(unhappy[0]);
      const stats = this.getStats();
      if (stats.capacity > stats.population && stats.population < MAX_PEOPLE && s.resources.food > 60 && s.resources.treasury > 60) {
        const appeal = stats.population === 0 ? 0.8 : clamp((stats.happiness - 45) / 38, 0, 1);
        const probability = appeal * (s.policies.openness / 100) * 0.65;
        if (this._rand() < probability) this._newResident();
      }
      this._reindex(); this._assignJobs();
      this._staffProjects();
      this._civicPlan();
      if (stats.foodDays < 1) this._event('economy', '粮仓告急', `现有粮食约够${Math.max(0, stats.foodDays).toFixed(1)}天，粮价正在上涨。增加农田、引水或购买补给都能缓解压力。`);
      if (s.resources.treasury < 90) this._event('economy', '公库需要喘口气', '现金储备不足，工资与公共补助可能缩减。观察生产、消费与对外贸易的收支。');
      if (s.day % 3 === 0) this._event('life', `第${s.day - 1}日的生活账`, `居民生产了${Math.round(previousDaily.foodProduced)}份粮食、吃掉${Math.round(previousDaily.foodEaten)}份，领取工资${Math.round(previousDaily.wages)}枚钱。`);
    }

    _leave(a) {
      const s = this.state;
      const friends = a.friends.filter(f => f.score > 30);
      for (const f of friends) {
        const friend = this._agents.get(f.id);
        if (friend) { this._memory(friend, `${a.name}离开了栖川，常坐的位置空了下来。`); friend.social = Math.max(0, friend.social - 8); }
      }
      this._event('departure', `${a.name}告别了小城`, '连续几天的饥饿或低落让这位居民决定寻找新的生活。改善粮食、收入与邻里关系，能让更多人愿意留下。', a.id);
      s.agents = s.agents.filter(p => p.id !== a.id);
      for (const b of s.buildings) b.workers = b.workers.filter(id => id !== a.id);
      for (const p of s.projects) p.workers = p.workers.filter(id => id !== a.id);
      s.totals.departures++; this._agents.delete(a.id);
    }

    _staffProjects() {
      const s = this.state;
      for (const project of s.projects) {
        const b = this._building(project.buildingId);
        if (!b || project.workers.length >= 3) continue;
        const candidates = s.agents.filter(a => !a._retired && !a.workId).slice(0, 3 - project.workers.length);
        for (const a of candidates) {
          a._previousWorkId = null; a.workId = b.id; a.role = '建造工'; a._decisionAt = s.time;
          project.workers.push(a.id); b.workers.push(a.id);
          this._memory(a, `接手${b.name}的工程，让未完成的建设继续下去。`);
        }
      }
    }

    _civicPlan() {
      const s = this.state;
      // A cautious public decision: preserve a cash/food buffer and undertake at most one new project.
      if (s.day < 4 || s.projects.length || s.resources.treasury < 650 || s.resources.wood < 90) return;
      const stats = this.getStats();
      let kind = null;
      if (stats.foodDays < 2.2) kind = 'farm';
      else if (stats.population >= stats.capacity * 0.86 && s.policies.openness > 25) kind = 'house';
      else if (stats.employment < 73 && stats.population > 45 && s.resources.goods < stats.population * 2) kind = 'workshop';
      if (!kind) return;
      const result = this.build(kind);
      if (result.ok) this._event('policy', '邻里议事有了新决定', `居民根据眼下的粮食、住房与工作需要，共同决定增建一处${TYPES[kind].label}。建设与工资仍由实际公库承担。`, undefined, result.buildingId);
    }

    _recordHistory(day = this.state.day) {
      const s = this.state, stats = this.getStats();
      const record = { day, population: stats.population, happiness: round(stats.happiness), food: round(s.resources.food), treasury: round(s.resources.treasury), price: s.prices.food };
      const existing = s.history.findIndex(h => h.day === day);
      if (existing >= 0) s.history[existing] = record; else s.history.push(record);
      if (s.history.length > 90) s.history.splice(0, s.history.length - 90);
    }

    _memory(a, text) {
      if (a.memories[0] && a.memories[0].day === this.state.day && a.memories[0].text === text) return;
      a.memories.unshift({ day: this.state.day, text });
      if (a.memories.length > 16) a.memories.length = 16;
    }

    _event(type, title, text, agentId, buildingId) {
      const s = this.state;
      const e = { id: this._id('e'), day: s.day, hour: Math.floor(s.time % 24), type, title, text };
      if (agentId) e.agentId = agentId;
      if (buildingId) e.buildingId = buildingId;
      s.events.unshift(e);
      if (s.events.length > 100) s.events.length = 100;
    }

    setPolicy(key, value) {
      const ranges = { tax: [0, 30], welfare: [0, 100], openness: [0, 100] };
      if (!Object.prototype.hasOwnProperty.call(ranges, key) || !Number.isFinite(Number(value))) return { ok: false, message: '无法识别这项政策。' };
      const next = Math.round(clamp(Number(value), ranges[key][0], ranges[key][1]));
      if (this.state.policies[key] === next) return { ok: true, message: '政策保持不变。' };
      this.state.policies[key] = next;
      const descriptions = {
        tax: ['调整工资税率', `工资税率调整为${next}%。税额留在公库，可支配收入随之变化。`],
        welfare: ['调整公共保障', `每日公共预算的${next}%用于帮助手头紧张的居民；可用预算受公库余额限制。`],
        openness: ['调整迁入开放度', `迁入开放度调整为${next}%。空余住房与生活状况仍会影响是否有人前来。`]
      };
      this._event('policy', descriptions[key][0], descriptions[key][1]);
      return { ok: true, message: descriptions[key][1] };
    }

    intervene(kind) {
      const s = this.state;
      if (kind === 'supplies') {
        if (s.resources.treasury < 180) return { ok: false, message: '补充粮食需要180枚钱，公库余额不足。' };
        s.resources.treasury -= 180; s.resources.food += 90;
        this._event('economy', '补给船靠岸', '用180枚钱从外地购入90份粮食。仓库恢复余量后，集市粮价会逐渐回落。');
        return { ok: true, message: '90份粮食已入仓。' };
      }
      if (kind === 'rain') {
        if (s.resources.treasury < 80) return { ok: false, message: '人工引水需要80枚钱，公库余额不足。' };
        if (s.effects.irrigationUntil > s.time + 48) return { ok: false, message: '引水设施仍在发挥作用，暂时无需重复投入。' };
        s.resources.treasury -= 80; s.effects.irrigationUntil = s.time + 72;
        this._event('policy', '把河水引入田间', '投入80枚钱，未来三天农田获得稳定灌溉，即使遇到干旱也能保持产出。');
        return { ok: true, message: '未来三天，河水将保护农田。' };
      }
      if (kind === 'drought') {
        if (s.effects.droughtUntil > s.time) return { ok: false, message: '这段旱季仍未结束。' };
        s.effects.droughtUntil = s.time + 72; s.weather = '旱'; s.temperature = Math.max(30, s.temperature);
        this._event('weather', '一段旱季开始了', '未来三天没有雨水。未灌溉的农田产出下降，居民会通过粮价与饭碗感受到变化。');
        return { ok: true, message: '三天旱季开始，留意粮食与居民的生活。' };
      }
      if (kind === 'festival') {
        if (s.effects.festivalCooldown > s.time) return { ok: false, message: '上一场河岸节才刚过去，让居民先回到日常生活。' };
        if (s.resources.treasury < 150 || s.resources.food < 20) return { ok: false, message: '河岸节需要150枚钱与20份粮食。' };
        s.resources.treasury -= 150; s.resources.food -= 20;
        s.effects.festivalUntil = s.time + 36; s.effects.festivalCooldown = s.time + 72;
        for (const a of s.agents) { a.social = Math.min(100, a.social + 9); a.hunger = Math.max(0, a.hunger - 9); this._memory(a, '小城举办河岸节，街坊把食物与故事带到一起。'); }
        this._event('life', '今夜，去河岸相聚', '河岸节拉近了邻里关系。未来一天半，居民更愿意在闲暇时相聚，友谊也成长得更快。');
        return { ok: true, message: '河岸节开场了，傍晚去花园看看。' };
      }
      return { ok: false, message: '暂时没有这项行动。' };
    }

    _availablePlot(type) {
      const candidates = [];
      if (type === 'farm') {
        for (const z of [0, 9, 17, 23]) for (const x of [0, 4]) candidates.push([x, z]);
      }
      for (const z of [3, 7, 11, 16, 20, 23]) for (const x of [11, 15, 18, 23, 26]) candidates.push([x, z]);
      for (const [x, z] of candidates) {
        if (z + 2 >= HEIGHT || x + 1 >= WIDTH) continue;
        let valid = true;
        for (let zz = z; zz < z + 2; zz++) for (let xx = x; xx < x + 2; xx++) {
          const t = this._tile(xx, zz);
          if (!t || t.kind === 'water' || t.kind === 'road' || t.kind === 'bridge' || t.occupied) valid = false;
        }
        if (valid && this._walkable(x, z + 2) && this._path(14.5, 10.5, x, z + 2).length) return { x, z };
      }
      return null;
    }

    build(kind) {
      if (!['house', 'farm', 'workshop', 'park', 'clinic'].includes(kind)) return { ok: false, message: '目前不能建造这种建筑。' };
      const s = this.state, spec = TYPES[kind];
      if (s.projects.length >= 3) return { ok: false, message: '已有三处工地，请等一处竣工后再开工。' };
      if (s.resources.wood < spec.wood || s.resources.treasury < spec.cost) return { ok: false, message: `建造${spec.label}需要木料${spec.wood}与${spec.cost}枚钱。` };
      const plot = this._availablePlot(kind);
      if (!plot) return { ok: false, message: '这片河谷暂时没有合适的空地了。' };
      const builders = s.agents.filter(a => !a._retired && a.role !== '建造工').sort((a, b) => {
        const priority = p => !p.workId ? 0 : p.role === '匠人' ? 1 : 2;
        return priority(a) - priority(b) || b.traits.diligence - a.traits.diligence;
      }).slice(0, 3);
      if (!builders.length) return { ok: false, message: '还没有能够参与建造的居民。' };
      s.resources.wood -= spec.wood; s.resources.treasury -= spec.cost;
      const count = s.buildings.filter(b => b.type === kind).length + 1;
      const name = kind === 'house' ? `新邻里·${count}院` : kind === 'farm' ? `新禾田·${count}` : kind === 'park' ? `四时花园·${count}` : kind === 'clinic' ? `安和诊所·${count}` : `新木工坊·${count}`;
      const b = this._addBuilding(kind, name, plot.x, plot.z, { progress: 0 });
      const project = { id: this._id('j'), buildingId: b.id, type: kind, name, startedDay: s.day, laborDone: 0, laborRequired: spec.labor, workers: builders.map(a => a.id), cost: spec.cost, wood: spec.wood };
      s.projects.push(project);
      for (const a of builders) {
        a._previousWorkId = a.workId;
        const old = this._building(a.workId); if (old) old.workers = old.workers.filter(id => id !== a.id);
        a.workId = b.id; a.role = '建造工'; b.workers.push(a.id); a._decisionAt = s.time;
        this._memory(a, `加入${name}的建造，想为小城添一处新地方。`);
      }
      this._reindex();
      // A new footprint can close a shortcut; travellers choose a fresh path around the worksite.
      for (const a of s.agents) {
        const destination = this._building(a.targetId);
        if (destination && a._pathIndex < a._path.length) {
          a._path = this._path(a.x, a.z, destination.door.x, destination.door.z);
          a._pathIndex = 0;
        }
      }
      this._event('build', `${name}开工`, `${builders.map(a => a.name).join('、')}将参与建造。木料与启动资金已投入，工程随在场劳动推进。`, undefined, b.id);
      return { ok: true, message: `${name}已经开工，居民会在工作时间前往工地。`, buildingId: b.id };
    }

    _finishProjects() {
      const s = this.state;
      const finished = s.projects.filter(p => p.laborDone >= p.laborRequired);
      for (const p of finished) {
        const b = this._building(p.buildingId); if (!b) continue;
        b.progress = 1; b.workers = []; b.builtDay = s.day;
        for (const id of p.workers) {
          const a = this._agents.get(id); if (!a || a.workId !== b.id) continue;
          const previous = this._building(a._previousWorkId);
          if (previous && previous.progress >= 1 && previous.workers.length < TYPES[previous.type].jobs) {
            a.workId = previous.id; a.role = TYPES[previous.type].role; previous.workers.push(a.id);
          } else { a.workId = null; a.role = a._retired ? '退休居民' : '待业'; }
          delete a._previousWorkId; a._decisionAt = s.time;
          this._memory(a, `亲手参与建成了${b.name}。`);
        }
        s.projects = s.projects.filter(project => project.id !== p.id);
        this._event('build', `${b.name}竣工了`, b.type === 'house' ? `六个新的居住名额向未来的邻居敞开。` : b.type === 'park' ? '居民多了一处可以歇脚、交朋友的地方。' : '新的工作岗位与公共空间开始服务小城。', undefined, b.id);
      }
      if (finished.length) this._assignJobs();
    }

    getStats() {
      const s = this.state, count = s.agents.length;
      const happiness = count ? s.agents.reduce((sum, a) => sum + a.happiness, 0) / count : 0;
      const active = s.agents.filter(a => !a._retired);
      const employed = active.filter(a => a.workId && this._building(a.workId));
      const bonds = s.agents.reduce((sum, a) => sum + a.friends.filter(f => f.score >= 30 && this._agents.has(f.id)).length, 0);
      return {
        population: count, happiness: round(happiness),
        foodDays: round(s.resources.food / Math.max(1, count * 1.45)),
        treasury: round(s.resources.treasury), food: round(s.resources.food), wood: round(s.resources.wood), goods: round(s.resources.goods),
        foodPrice: s.prices.food, employment: active.length ? Math.round(employed.length / active.length * 100) : 0,
        capacity: s.buildings.filter(b => b.type === 'house' && b.progress >= 1).reduce((sum, b) => sum + b.capacity, 0),
        births: s.totals.births, arrivals: s.totals.arrivals, departures: s.totals.departures,
        socialBonds: Math.floor(bonds / 2), projects: s.projects.length,
        averageMoney: count ? round(s.agents.reduce((sum, a) => sum + a.money, 0) / count) : 0,
        season: s.season, weather: s.weather, temperature: s.temperature,
        cropMultiplier: ({ '春': 1.05, '夏': 1.1, '秋': 1.18, '冬': 0.55 })[s.season]
      };
    }

    serialize() { return JSON.stringify(this.state); }

    static restore(json) {
      if (typeof json !== 'string' || json.length > 6000000) throw new Error('存档不是有效的栖川文件，或文件过大。');
      let data;
      try { data = JSON.parse(json); } catch (_) { throw new Error('无法读取存档，请选择栖川导出的 JSON 文件。'); }
      return new TownEngine(271828, data);
    }

    static _validate(source) {
      const fail = () => { throw new Error('这份存档缺少必要数据或已损坏，请换一份栖川存档。'); };
      const number = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
      const string = (v, max = 200) => typeof v === 'string' && v.length <= max;
      if (!source || typeof source !== 'object' || source.version !== VERSION || source.width !== WIDTH || source.height !== HEIGHT) fail();
      if (!number(source.time, 0, 1e8) || !number(source.day, 1, 5e6) || !number(source.rng, 0, 4294967295) || !number(source.nextId, 1, 1e12)) fail();
      if (!Array.isArray(source.agents) || source.agents.length > MAX_PEOPLE || !Array.isArray(source.buildings) || source.buildings.length > 100) fail();
      if (!Array.isArray(source.tiles) || source.tiles.length !== WIDTH * HEIGHT || !Array.isArray(source.events) || source.events.length > 100 || !Array.isArray(source.history) || source.history.length > 90 || !Array.isArray(source.projects) || source.projects.length > 3) fail();
      if (!source.resources || !source.prices || !source.policies || !source.effects || !source.totals || !source.daily) fail();
      for (const key of ['food', 'wood', 'goods', 'treasury']) if (!number(source.resources[key], 0, 1e10)) fail();
      for (const key of ['food', 'goods']) if (!number(source.prices[key], 0.01, 100)) fail();
      for (const [key, max] of [['tax', 30], ['welfare', 100], ['openness', 100]]) if (!number(source.policies[key], 0, max)) fail();
      for (const key of ['irrigationUntil', 'droughtUntil', 'festivalUntil', 'festivalCooldown']) if (!number(source.effects[key], 0, 1e8 + 1000)) fail();
      for (const key of ['arrivals', 'departures', 'births', 'meals', 'taxes', 'trade']) if (!number(source.totals[key], 0, 1e14)) fail();
      for (const key of ['wages', 'taxes', 'foodProduced', 'woodProduced', 'goodsProduced', 'foodEaten', 'trade', 'welfare']) if (!number(source.daily[key], 0, 1e12)) fail();
      if (!SEASONS.includes(source.season) || !['晴', '阴', '雨', '旱', '雪'].includes(source.weather) || !number(source.temperature, -80, 80)) fail();
      if (!number(source._remainder, 0, 24) || !number(source._socialAt, 0, 1e8 + 1000) || !number(source._priceAt, 0, 1e8 + 1000) || !number(source._nameSerial, 0, 1e12)) fail();
      const buildingIds = new Set(), agentIds = new Set();
      const occupancy = new Set();
      for (let i = 0; i < source.tiles.length; i++) {
        const t = source.tiles[i];
        if (!t || t.x !== i % WIDTH || t.z !== Math.floor(i / WIDTH) || !['grass', 'water', 'road', 'bridge', 'field'].includes(t.kind) || !number(t.elevation, 0, 10)) fail();
      }
      for (const b of source.buildings) {
        if (!b || !string(b.id, 50) || buildingIds.has(b.id) || !Object.prototype.hasOwnProperty.call(TYPES, b.type) || !string(b.name, 100)) fail();
        if (!Number.isInteger(b.x) || !Number.isInteger(b.z) || !Number.isInteger(b.w) || !Number.isInteger(b.d) || !number(b.x, 0, WIDTH - 1) || !number(b.z, 0, HEIGHT - 1) || !number(b.w, 1, 4) || !number(b.d, 1, 4) || b.x + b.w > WIDTH || b.z + b.d >= HEIGHT) fail();
        if (!number(b.progress, 0, 1) || !number(b.capacity, 0, 100) || !number(b.level, 1, 10) || !b.door || !Number.isInteger(b.door.x) || !Number.isInteger(b.door.z) || !number(b.door.x, 0, WIDTH - 1) || !number(b.door.z, 0, HEIGHT - 1) || !Array.isArray(b.workers) || b.workers.length > MAX_PEOPLE) fail();
        for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
          const key = z * WIDTH + x; if (occupancy.has(key) || source.tiles[key].kind === 'water') fail(); occupancy.add(key);
        }
        buildingIds.add(b.id);
      }
      for (const a of source.agents) {
        if (!a || !string(a.id, 50) || agentIds.has(a.id) || !string(a.name, 100) || !string(a.action, 200) || !string(a.role, 50) || !buildingIds.has(a.homeId) || a.workId !== null && !buildingIds.has(a.workId)) fail();
        if (!number(a.x, 0, WIDTH) || !number(a.z, 0, HEIGHT) || !number(a.age, 0, 100000) || !number(a.money, 0, 1e9) || !number(a.homeComfort, 0, 100)) fail();
        for (const key of ['hunger', 'energy', 'social', 'happiness', 'health']) if (!number(a[key], 0, 100)) fail();
        if (!a.traits) fail();
        for (const key of ['friendliness', 'diligence', 'resilience']) if (!number(a.traits[key], 0, 1)) fail();
        if (!Array.isArray(a.friends) || a.friends.length > 18 || !Array.isArray(a.memories) || a.memories.length > 16 || !Array.isArray(a._path) || a._path.length > WIDTH * HEIGHT || !number(a._pathIndex, 0, a._path.length)) fail();
        for (const f of a.friends) if (!f || !string(f.id, 50) || !number(f.score, 0, 100)) fail();
        for (const m of a.memories) if (!m || !number(m.day, 1, 5e6) || !string(m.text, 500)) fail();
        for (const point of a._path) if (!point || !number(point.x, 0, WIDTH) || !number(point.z, 0, HEIGHT)) fail();
        for (const key of ['_decisionAt', '_socialAt']) if (!number(a[key], 0, 1e8 + 1000)) fail();
        for (const key of ['_workToday', '_wagesToday', '_unpaidToday', '_badDays']) if (!number(a[key], 0, 1e12)) fail();
        if (!number(a._lastMeal, -24, 1e8) || !number(a._lastGoods, -10, 5e6) || !number(a._lastHealthStory, 0, 5e6) || !string(a._mode, 30) || !string(a.color, 30)) fail();
        if (!['home', 'rest', 'meal', 'work', 'build', 'heal', 'social', 'shop', 'wait'].includes(a._mode)) fail();
        agentIds.add(a.id);
      }
      for (const b of source.buildings) for (const id of b.workers) if (!agentIds.has(id)) fail();
      for (const p of source.projects) if (!p || !buildingIds.has(p.buildingId) || !number(p.laborDone, 0, 10000) || !number(p.laborRequired, 1, 10000) || !Array.isArray(p.workers) || p.workers.length > MAX_PEOPLE || p.workers.some(id => !agentIds.has(id))) fail();
      for (const e of source.events) if (!e || !string(e.title, 300) || !string(e.text, 1000) || !number(e.day, 1, 5e6) || !number(e.hour, 0, 24) || !string(e.type, 40)) fail();
      for (const h of source.history) if (!h || !number(h.day, 1, 5e6) || !number(h.population, 0, MAX_PEOPLE) || !number(h.happiness, 0, 100) || !number(h.food, 0, 1e10) || !number(h.treasury, 0, 1e10) || !number(h.price, 0, 100)) fail();
      // Copy plain data; never retain a caller's live object or prototype chain.
      const s = JSON.parse(JSON.stringify(source));
      s.day = Math.floor((s.time + 0.000001) / 24) + 1;
      s.seed = Number.isFinite(s.seed) ? s.seed >>> 0 : 271828;
      for (const a of s.agents) {
        a.friends = a.friends.filter(f => agentIds.has(f.id) && f.id !== a.id);
        a._retired = !!a._retired;
        a.personality = typeof a.personality === 'string' ? a.personality.slice(0, 100) : '安静细腻';
        a.bio = typeof a.bio === 'string' ? a.bio.slice(0, 500) : '';
        a._metToday = [];
      }
      return s;
    }
  }

  TownEngine.BUILDINGS = TYPES;
  TownEngine.VERSION = VERSION;
  global.TownEngine = TownEngine;
})(typeof window !== 'undefined' ? window : globalThis);
