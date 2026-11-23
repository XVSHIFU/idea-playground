(() => {
  'use strict';

  const QA_MODE = location.hostname === '127.0.0.1' ? new URLSearchParams(location.search).get('qa') : null;
  const SAVE_KEY = QA_MODE ? `gray-domain-era-qa-${QA_MODE}` : 'gray-domain-era-save-v1';
  const SAVE_VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const round2 = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const now = () => Date.now();

  const RESOURCE_DEFS = {
    matter: { name: '物质', short: 'M', color: '#75d8e4', baseClick: 1 },
    energy: { name: '能源', short: 'E', color: '#e8ab5b', baseClick: 0.8 },
    data: { name: '数据', short: 'D', color: '#a88cf4', baseClick: 0.35 },
    population: { name: '人口', short: 'P', color: '#83d6ad', baseClick: 0 }
  };

  const STAGES = {
    1: { name: '危机萌芽期', label: '阶段 01', cap: 1 },
    2: { name: '科技封锁期', label: '阶段 02', cap: 1.5 },
    3: { name: '行星工业期', label: '阶段 03', cap: 3 }
  };

  const BUILDINGS = {
    solar: {
      id: 'solar', code: 'BLD-SOLAR', name: '太阳能阵列', icon: '☼', ratio: 1.15,
      cost: { matter: 12 }, output: { energy: 0.8 }, input: {}, jobs: 0,
      desc: '无需维护的基础发电设施，是所有停机状态的恢复入口。',
      unlock: s => true, lockText: ''
    },
    mine: {
      id: 'mine', code: 'BLD-MINE', name: '自动矿机', icon: '⬡', ratio: 1.16,
      cost: { matter: 20 }, output: { matter: 0.45 }, input: { energy: 0.18 }, jobs: 1,
      desc: '持续开采山谷矿脉；能源供给比例会直接改变产出。',
      unlock: s => s.buildings.solar >= 1, lockText: '建成一座太阳能阵列后解锁'
    },
    lab: {
      id: 'lab', code: 'BLD-LAB', name: '数据观测台', icon: '◉', ratio: 1.17,
      cost: { matter: 55 }, output: { data: 0.2 }, input: { energy: 0.3 }, jobs: 2,
      desc: '把观测误差转化为科研数据，并让封锁痕迹逐渐显形。',
      unlock: s => !!s.tech.SCI01 && s.buildings.mine >= 1, lockText: '完成「观测统计」且拥有自动矿机'
    },
    store: {
      id: 'store', code: 'BLD-STORE', name: '分布仓储', icon: '▦', ratio: 1.18,
      cost: { matter: 80 }, output: {}, input: { energy: 0.05 }, jobs: 0,
      desc: '每座增加 500 物质、120 能源与 200 数据容量。',
      unlock: s => !!s.tech.ENG01, lockText: '完成「功率调度」后解锁'
    },
    hab: {
      id: 'hab', code: 'BLD-HAB', name: '栖居模块', icon: '⌂', ratio: 1.2,
      cost: { matter: 180 }, output: {}, input: { energy: 0.2 }, jobs: 0,
      desc: '增加 10 人口容量，并启动受生命保障约束的人口增长。',
      unlock: s => !!s.tech.BIO01, lockText: '完成「闭环生态」后解锁'
    },
    fusion: {
      id: 'fusion', code: 'BLD-FUSION', name: '聚变堆', icon: '◎', ratio: 1.21,
      cost: { matter: 650, data: 250 }, output: { energy: 12 }, input: { matter: 0.06 }, jobs: 3,
      desc: '高密度能源核心；需要持续物质注入，支持行星工业跃迁。',
      unlock: s => !!s.tech.ENG03, lockText: '完成「聚变点火」后解锁'
    },
    orbital: {
      id: 'orbital', code: 'BLD-ORBITAL', name: '轨道铸造站', icon: '◇', ratio: 1.22,
      cost: { matter: 5000, data: 1200 }, output: { matter: 18 }, input: { energy: 6 }, jobs: 4,
      desc: '把工业链延伸至轨道；建成即完成本次 MVP 的文明目标。',
      unlock: s => s.stage >= 3, lockText: '进入行星工业期后解锁'
    }
  };

  const TECHS = {
    SCI01: { id: 'SCI01', branch: '科学计算', name: '观测统计', cost: 60, time: 20, x: 55, y: 35, pre: [], stage: 1, desc: '解锁数据指令与数据观测台。' },
    SCI02: { id: 'SCI02', branch: '科学计算', name: '分布计算', cost: 320, time: 180, x: 320, y: 35, pre: ['SCI01'], stage: 1, extra: s => s.buildings.lab >= 2, extraText: '需要 2 座数据观测台', desc: '数据产量 +15%，解锁一项预排研究。' },
    SCI03: { id: 'SCI03', branch: '科学计算', name: '封锁检验', cost: 2200, time: 900, x: 640, y: 35, pre: ['SCI02', 'INT02'], stage: 3, desc: '记录可重复性，开启突破实验档案。' },
    ENG01: { id: 'ENG01', branch: '材料能源', name: '功率调度', cost: 40, time: 15, x: 55, y: 165, pre: [], stage: 1, desc: '解锁分布仓储与设施能源诊断。' },
    ENG02: { id: 'ENG02', branch: '材料能源', name: '复合烧结', cost: 200, time: 120, x: 320, y: 165, pre: ['ENG01'], stage: 1, desc: '所有建筑物质成本降低 8%。' },
    ENG03: { id: 'ENG03', branch: '材料能源', name: '聚变点火', cost: 1600, time: 720, x: 640, y: 165, pre: ['ENG02', 'SCI02'], stage: 2, desc: '解锁聚变堆，能源容量乘 1.5。' },
    NAV01: { id: 'NAV01', branch: '航天工程', name: '轨道力学', cost: 180, time: 90, x: 320, y: 295, pre: ['SCI01'], stage: 2, desc: '解锁轨道观测层与轨道目标。' },
    NAV02: { id: 'NAV02', branch: '航天工程', name: '自治探针', cost: 850, time: 360, x: 640, y: 295, pre: ['NAV01', 'ENG02'], stage: 3, desc: '完成首枚静默探针设计，建立星图前置。' },
    BIO01: { id: 'BIO01', branch: '生命治理', name: '闭环生态', cost: 120, time: 80, x: 55, y: 425, pre: ['ENG01'], stage: 1, desc: '解锁栖居模块与人口增长。' },
    BIO02: { id: 'BIO02', branch: '生命治理', name: '认知排班', cost: 650, time: 300, x: 320, y: 425, pre: ['BIO01'], stage: 2, desc: '派驻位 +1，岗位不足惩罚降低 20%。' },
    INT01: { id: 'INT01', branch: '情报隐匿', name: '信号卫生', cost: 90, time: 45, x: 320, y: 555, pre: ['SCI01'], stage: 1, desc: '解锁文明暴露监测，主动通信暴露 -10%。' },
    INT02: { id: 'INT02', branch: '情报隐匿', name: '噪声晶格', cost: 480, time: 240, x: 640, y: 555, pre: ['INT01'], stage: 2, desc: '启用低功率观测方案，危机代价降低。' }
  };

  const CHARACTERS = {
    luolan: { name: '洛岚', rarity: 'R', job: '科学家', stat: 62, avatar: '#79d9e5', passive: '观测台数据 +12%', active: '复验脉冲：获得 8 分钟数据产量', cooldown: 21600 },
    yuanche: { name: '袁澈', rarity: 'R', job: '工程师', stat: 66, avatar: '#e6a75d', passive: '矿机能源消耗 -8%', active: '旁路维修：矿机效率强化 10 分钟', cooldown: 14400 },
    tianmo: { name: '田默', rarity: 'R', job: '情报员', stat: 64, avatar: '#9b87dc', passive: '显示事件隐藏信息', active: '频谱标注：揭示下一事件概率', cooldown: 14400 },
    heqing: { name: '贺青', rarity: 'R', job: '生态学家', stat: 68, avatar: '#72c69c', passive: '栖居容量 +8%', active: '封闭循环：人口增长 ×1.5，持续 30 分钟', cooldown: 14400 },
    suyao: { name: '苏曜', rarity: 'SR', job: '能源工程师', stat: 82, avatar: '#5fcbd9', passive: '聚变堆物质消耗 -15%', active: '堆芯超频：能源产量 ×2.2，持续 60 秒', cooldown: 21600 },
    yeqiong: { name: '叶穹', rarity: 'SR', job: '舰队指挥官', stat: 84, avatar: '#8fa9d8', passive: '危机响应窗口 +20%', active: '安静航线：下一次危机选项成本 -20%', cooldown: 21600 },
    gongyin: { name: '宫茵', rarity: 'SR', job: '文明战略家', stat: 86, avatar: '#d398ce', passive: '事件负面持续时间 -10%', active: '临时授权：可重选下一次事件', cooldown: 28800 },
    nahid: { name: '纳希德·奥兰', rarity: 'SR', job: '信号专家', stat: 88, avatar: '#70b2c8', passive: '信号事件奖励 +18%', active: '静默监听：推进当前研究 8%', cooldown: 21600 },
    jiyuan: { name: '纪原', rarity: 'SSR', job: '粒子物理学家', stat: 98, avatar: '#e9b45e', passive: '科技完成返还 12% 数据', active: '反证窗口：当前研究立即推进 18%', cooldown: 43200 },
    helian: { name: '赫连弈', rarity: 'SSR', job: '巨构工程师', stat: 97, avatar: '#e79e64', passive: '建筑里程碑返还 8% 成本', active: '结构折叠：下一座建筑成本 -35%', cooldown: 86400 },
    yilan: { name: '伊澜·索恩', rarity: 'SSR', job: '舰队战术家', stat: 99, avatar: '#d3a6e7', passive: '重大危机损失 -10%', active: '自适应阵形：将下一次损失改为撤退', cooldown: 43200 },
    shenmi: { name: '沈弥', rarity: 'SSR', job: '文明建模师', stat: 96, avatar: '#d7c078', passive: '混合路线奖励 +15%', active: '多方可证：下一事件双选项成本 -20%', cooldown: 43200 }
  };

  const EVENT_DEFS = {
    errorNight: { name: '误差之夜', stage: 1, image: './assets/early-research-valley.webp', intro: '三套互不相连的传感器，在同一秒记录到了完全相同的误差。它不像噪声，更像某种对观测行为本身的回应。' },
    blockadePulse: { name: '封锁脉冲', stage: 2, image: './assets/blockade-pulse.webp', intro: '紫白干涉环贯穿暮色星谷，所有基础实验开始给出互相矛盾的答案。你有十分钟决定文明如何保存自己的科学。' },
    coreHarmony: { name: '堆芯和声', stage: 2, image: './assets/early-research-valley.webp', intro: '聚变堆出现了可以提高输出的稳定振荡，但没有任何现有模型能够解释它。' },
    silentProbe: { name: '静默探针', stage: 3, image: './assets/orbital-dawn.webp', intro: '母星背面发现一个不发射信号的观测装置。它的表面温度与宇宙背景完全一致。' },
    narrowEcho: { name: '窄带回声', stage: 4, image: './assets/orbital-dawn.webp', intro: '深空阵列接收到间隔精确、来源不明的窄带信号。' },
    arkWithoutRegistry: { name: '无籍方舟', stage: 4, image: './assets/orbital-dawn.webp', intro: '一支没有身份编码的流亡舰队请求进入行星系。' },
    lightsQuota: { name: '灯火配额', stage: 2, image: './assets/blockade-pulse.webp', intro: '能源峰值正在把文明的轮廓写进深空。是否熄灭一部分灯火？' },
    blankArchive: { name: '档案庭的空白页', stage: 5, image: './assets/cover.webp', intro: '高等档案中缺少了一页，而且缺失的轮廓恰好与你的文明相同。' }
  };

  function newState() {
    return {
      version: SAVE_VERSION,
      createdAt: now(), lastSaved: now(), playSeconds: 0,
      stage: 1, command: 100, combo: 0, lastPulse: 0, clickMode: 'matter',
      exposure: 0, stability: 1,
      resources: { matter: 0, energy: 20, data: 0, population: 12, signals: 0 },
      buildings: Object.fromEntries(Object.keys(BUILDINGS).map(id => [id, 0])),
      modules: Object.fromEntries(Object.keys(BUILDINGS).map(id => [id, 0])),
      tech: {}, research: null, researchQueue: [],
      characters: {}, assignments: [], cooldowns: {},
      pity: { pullsSinceSSR: 0, pullsInTenBlock: 0, hasSRPlusInBlock: false, totalPulls: 0 },
      missionIndex: 0, completedMissions: [],
      events: { seen: [], pending: [], decisions: {} },
      crisis: { available: false, resolved: false, expiresAt: null },
      routes: { light: 0, veil: 0, voyage: 0 },
      modifiers: [], flags: { revealNextEvent: false, safeResponse: false, foldNextBuild: false },
      stats: { totalClicks: 0, manualMatter: 0, cumulativeData: 0, totalBuildings: 0, tenPulls: 0, maxCombo: 0 },
      settings: { sound: true, effects: true },
      history: [{ at: now(), title: '暮色星谷重新通电', text: '你接管了仅剩十二个可调度人口的观测前哨。' }]
    };
  }

  let state = newState();
  let production = { matter: 0, energy: 0, data: 0, population: 0, efficiency: 1, jobs: 0 };
  let caps = { matter: 200, energy: 40, data: 120, population: 20 };
  let buyMode = '1';
  let openPanelName = null;
  let journalTab = 'missions';
  let hasExistingSave = false;
  let offlineSummary = null;
  let lastFrame = performance.now();
  let lastRender = 0;
  let lastPanelRender = 0;
  let lastAutoSave = now();
  let lastSoundAt = 0;
  let techView = { x: 50, y: 20, scale: 0.86, dragging: false, px: 0, py: 0 };

  const audio = {
    context: null,
    ensure() {
      if (!state.settings.sound) return null;
      if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
      if (this.context.state === 'suspended') this.context.resume();
      return this.context;
    },
    tone(freq = 360, duration = 0.06, gain = 0.025, type = 'sine') {
      const ctx = this.ensure();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const volume = ctx.createGain();
      oscillator.type = type; oscillator.frequency.value = freq;
      volume.gain.setValueAtTime(gain, ctx.currentTime);
      volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      oscillator.connect(volume).connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + duration);
    }
  };

  function formatNumber(value) {
    if (!Number.isFinite(value)) return '0';
    const abs = Math.abs(value);
    const units = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    for (const [base, suffix] of units) {
      if (abs >= base) return `${(value / base).toFixed(abs >= base * 100 ? 0 : abs >= base * 10 ? 1 : 2)}${suffix}`;
    }
    if (abs >= 100) return Math.floor(value).toLocaleString('zh-CN');
    if (abs >= 10) return value.toFixed(1).replace(/\.0$/, '');
    return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.ceil(seconds));
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60 ? `${seconds % 60}秒` : ''}`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}时${minutes ? `${minutes}分` : ''}`;
  }

  function deepMerge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    for (const [key, value] of Object.entries(saved)) {
      if (Array.isArray(value)) base[key] = value;
      else if (value && typeof value === 'object' && base[key] && typeof base[key] === 'object') deepMerge(base[key], value);
      else base[key] = value;
    }
    return base;
  }

  function hasTech(id) { return !!state.tech[id]; }
  function isAssigned(id) { return state.assignments.includes(id); }
  function hasCharacter(id) { return !!state.characters[id]; }
  function totalBuildings() { return Object.values(state.buildings).reduce((sum, count) => sum + count, 0); }
  function activeModifier(type) { return state.modifiers.find(mod => mod.type === type && mod.remaining > 0); }

  function addHistory(title, text) {
    state.history.unshift({ at: now(), title, text });
    state.history = state.history.slice(0, 80);
  }

  function computeCaps() {
    const stageMultiplier = STAGES[state.stage]?.cap || 1;
    const stores = state.buildings.store || 0;
    const habs = state.buildings.hab || 0;
    const heqingBonus = isAssigned('heqing') ? 0.08 : 0;
    const energyTech = hasTech('ENG03') ? 1.5 : 1;
    caps = {
      matter: (200 + stores * 500) * stageMultiplier,
      energy: (40 + stores * 120) * stageMultiplier * energyTech,
      data: (120 + stores * 200) * stageMultiplier,
      population: (20 + habs * 10) * (1 + heqingBonus)
    };
    state.resources.matter = clamp(state.resources.matter, 0, caps.matter);
    state.resources.energy = clamp(state.resources.energy, 0, caps.energy);
    state.resources.data = clamp(state.resources.data, 0, caps.data);
    state.resources.population = clamp(state.resources.population, 0, caps.population);
    return caps;
  }

  function milestoneBonus(count) {
    let bonus = 0;
    if (count >= 10) bonus += 0.25;
    if (count >= 25) bonus += 0.5;
    if (count >= 50) bonus += 1;
    if (count >= 100) bonus += 2;
    return bonus;
  }

  function roleCategoryBonus(resource) {
    let bonus = 0;
    for (const id of state.assignments) {
      const character = CHARACTERS[id];
      if (!character) continue;
      if (resource === 'data' && ['科学家', '粒子物理学家', '信号专家'].includes(character.job)) bonus += character.stat * 0.002;
      if (resource === 'matter' && ['工程师', '巨构工程师'].includes(character.job)) bonus += character.stat * 0.002;
      if (resource === 'energy' && ['能源工程师'].includes(character.job)) bonus += character.stat * 0.002;
    }
    return Math.min(1.5, bonus);
  }

  function buildingMultiplier(id, resource) {
    const count = state.buildings[id] || 0;
    const moduleMultiplier = Math.pow(2.4, state.modules[id] || 0);
    const milestone = 1 + milestoneBonus(count);
    let techBonus = 0;
    let characterBonus = roleCategoryBonus(resource);
    let routeBonus = 0;
    if (resource === 'data' && hasTech('SCI02')) techBonus += 0.15;
    if (resource === 'data' && id === 'lab' && isAssigned('luolan')) characterBonus += 0.12;
    if (resource === 'matter' && id === 'mine' && activeModifier('mineBoost')) characterBonus += 0.2;
    if (resource === 'data' && state.flags.permanentLabBonus) routeBonus += state.flags.permanentLabBonus;
    if (resource === 'energy' && activeModifier('energyOverdrive')) routeBonus += 1.2;
    return moduleMultiplier * milestone * (1 + Math.min(4, techBonus)) * (1 + Math.min(1.5, characterBonus)) * (1 + Math.min(2, routeBonus));
  }

  function computeProduction() {
    computeCaps();
    const b = state.buildings;
    const requiredJobs = b.mine + b.lab * 2 + b.fusion * 3 + b.orbital * 4;
    let workforce = requiredJobs > 0 ? Math.min(1, state.resources.population / requiredJobs) : 1;
    if (hasTech('BIO02') && workforce < 1) workforce += (1 - workforce) * 0.2;

    const mineEnergyFactor = isAssigned('yuanche') ? 0.92 : 1;
    const energyDemand = b.mine * 0.18 * mineEnergyFactor + b.lab * 0.3 + b.store * 0.05 + b.hab * 0.2 + b.orbital * 6;
    const fusionMatterFactor = isAssigned('suyao') ? 0.85 : 1;
    const fusionMatterDemand = b.fusion * 0.06 * fusionMatterFactor;
    const fusionFuelRatio = fusionMatterDemand <= 0 ? 1 : (state.resources.matter > 0.001 || b.mine > 0 ? 1 : 0);
    const solarEnergy = b.solar * 0.8 * buildingMultiplier('solar', 'energy');
    const fusionEnergy = b.fusion * 12 * buildingMultiplier('fusion', 'energy') * fusionFuelRatio * workforce;
    const grossEnergy = solarEnergy + fusionEnergy;
    const energyEfficiency = state.resources.energy > 0.001 || energyDemand <= grossEnergy ? 1 : clamp(grossEnergy / Math.max(energyDemand, 0.0001), 0, 1);

    const mineMatter = b.mine * 0.45 * buildingMultiplier('mine', 'matter') * energyEfficiency * workforce;
    const orbitalMatter = b.orbital * 18 * buildingMultiplier('orbital', 'matter') * energyEfficiency * workforce;
    const labData = b.lab * 0.2 * buildingMultiplier('lab', 'data') * energyEfficiency * workforce;
    const lifeSupport = energyDemand <= 0 ? 1 : energyEfficiency;
    let popGrowth = state.resources.population * 0.02 * (1 - state.resources.population / Math.max(caps.population, 1)) * lifeSupport / 3600;
    if (activeModifier('populationBoost')) popGrowth *= 1.5;

    production = {
      matter: mineMatter + orbitalMatter - fusionMatterDemand * fusionFuelRatio,
      energy: grossEnergy - energyDemand * energyEfficiency,
      data: labData,
      population: Math.max(0, popGrowth),
      efficiency: energyEfficiency,
      jobs: requiredJobs
    };
    return production;
  }

  function grantResource(type, amount, track = true) {
    if (!Number.isFinite(amount) || amount === 0) return 0;
    if (type === 'signals') {
      state.resources.signals = Math.max(0, state.resources.signals + amount);
      return amount;
    }
    computeCaps();
    const cap = caps[type] ?? Infinity;
    const before = state.resources[type] || 0;
    state.resources[type] = clamp(before + amount, 0, cap);
    const accepted = state.resources[type] - before;
    if (type === 'data' && accepted > 0 && track) state.stats.cumulativeData += accepted;
    return accepted;
  }

  function applyProduction(dt, flow = computeProduction()) {
    grantResource('matter', flow.matter * dt, true);
    grantResource('energy', flow.energy * dt, false);
    grantResource('data', flow.data * dt, true);
    grantResource('population', flow.population * dt, false);
  }

  function advanceWorld(dt, offline = false) {
    if (dt <= 0) return;
    const flow = computeProduction();
    if (flow.energy < 0 && state.resources.energy + flow.energy * dt < 0) {
      const untilEmpty = clamp(state.resources.energy / Math.max(-flow.energy, 0.0001), 0, dt);
      if (untilEmpty > 0) applyProduction(untilEmpty, flow);
      state.resources.energy = 0;
      if (dt - untilEmpty > 0.001) applyProduction(dt - untilEmpty, computeProduction());
    } else {
      applyProduction(dt, flow);
    }
    state.command = clamp(state.command + 5 * dt, 0, 100);
    if (now() - state.lastPulse > 2000 && state.combo > 0) state.combo = Math.max(0, state.combo - 8 * dt);
    state.playSeconds += dt;
    for (const modifier of state.modifiers) modifier.remaining -= dt;
    state.modifiers = state.modifiers.filter(modifier => modifier.remaining > 0);
    if (!offline) maybeTriggerEvents();
  }

  function researchSpeed() {
    let bonus = 0;
    for (const id of state.assignments) {
      const character = CHARACTERS[id];
      if (character && ['科学家', '粒子物理学家', '信号专家'].includes(character.job)) bonus += character.stat * 0.002;
    }
    return Math.min(4, 1 + bonus);
  }

  function simulateTime(seconds, offline = false) {
    let remaining = Math.max(0, seconds);
    while (remaining > 0.0001) {
      let step = Math.min(remaining, offline ? 60 : 0.25);
      if (state.research) step = Math.min(step, state.research.remaining);
      advanceWorld(step, offline);
      if (state.research) {
        state.research.remaining = Math.max(0, state.research.remaining - step);
        if (state.research.remaining <= 0.0001) completeResearch(state.research.id, offline);
      }
      remaining -= step;
    }
    computeProduction();
  }

  function actualResearchTime(tech) {
    return tech.time / researchSpeed();
  }

  function techAvailable(tech) {
    if (state.stage < tech.stage) return { ok: false, reason: `需要${STAGES[tech.stage].name}` };
    const missing = tech.pre.filter(id => !hasTech(id));
    if (missing.length) return { ok: false, reason: `前置：${missing.map(id => TECHS[id].name).join('、')}` };
    if (tech.extra && !tech.extra(state)) return { ok: false, reason: tech.extraText };
    return { ok: true, reason: '' };
  }

  function startResearch(id) {
    const tech = TECHS[id];
    if (!tech || hasTech(id) || state.research?.id === id || state.researchQueue.some(item => item.id === id)) return;
    const availability = techAvailable(tech);
    if (!availability.ok) return toast('研究未解锁', availability.reason, 'warning');
    if (state.resources.data + 1e-6 < tech.cost) {
      const deficit = tech.cost - state.resources.data;
      const eta = production.data > 0 ? formatTime(deficit / production.data) : '暂无自动数据来源';
      return toast('数据不足', `还需 ${formatNumber(deficit)} D · ${eta}`, 'warning');
    }
    const queued = !!state.research;
    if (queued && (!hasTech('SCI02') || state.researchQueue.length >= 1)) return toast('研究队列占用', hasTech('SCI02') ? '预排队列已有一项研究' : '完成「分布计算」后可预排一项', 'warning');
    grantResource('data', -tech.cost, false);
    const item = { id, total: actualResearchTime(tech), remaining: actualResearchTime(tech) };
    if (queued) {
      state.researchQueue.push(item);
      toast('已加入预排队列', tech.name);
    } else {
      state.research = item;
      toast('研究启动', `${tech.name} · ${formatTime(item.total)}`);
      audio.tone(420, 0.12, 0.03, 'triangle');
    }
    saveGame();
    renderTech();
  }

  function completeResearch(id, offline = false) {
    const tech = TECHS[id];
    state.tech[id] = true;
    state.research = null;
    if (isAssigned('jiyuan')) grantResource('data', tech.cost * 0.12, true);
    addHistory(`完成科技：${tech.name}`, tech.desc);
    if (id === 'SCI01' && !state.events.seen.includes('errorNight') && !state.events.pending.includes('errorNight')) state.events.pending.push('errorNight');
    if (!offline) {
      toast('科技突破', `${tech.name}：${tech.desc}`, 'reward');
      audio.tone(680, 0.24, 0.045, 'sine');
    }
    if (state.researchQueue.length) state.research = state.researchQueue.shift();
    maybeCompleteMission();
    saveGame();
  }

  const MISSIONS = [
    { id: 'firstMatter', title: '唤醒采集臂', text: '向山谷发送 12 次物质采集指令。', value: s => s.stats.manualMatter, target: 12, condition: s => s.stats.manualMatter >= 12, reward: () => grantResource('energy', 8, false) },
    { id: 'firstSolar', title: '点亮第一束光', text: '建设 1 座太阳能阵列。', value: s => s.buildings.solar, target: 1, condition: s => s.buildings.solar >= 1, reward: () => grantResource('matter', 20, true) },
    { id: 'firstMine', title: '让机器接管重复劳动', text: '建设 1 台自动矿机，解锁稳定物质流。', value: s => s.buildings.mine, target: 1, condition: s => s.buildings.mine >= 1, reward: () => grantResource('data', 110, true) },
    { id: 'firstScience', title: '把误差变成证据', text: '完成科技「观测统计」。', value: s => hasTech('SCI01') ? 1 : 0, target: 1, condition: () => hasTech('SCI01'), reward: () => grantResource('matter', 50, true) },
    { id: 'firstLab', title: '建立可重复观测', text: '建设 1 座数据观测台。', value: s => s.buildings.lab, target: 1, condition: s => s.buildings.lab >= 1, reward: () => grantResource('data', 50, true) },
    { id: 'breakBlockade', title: '连接分布式证据链', text: '累计获得 500 D，完成「分布计算」，并拥有 3 座观测台。', value: s => Math.min(500, s.stats.cumulativeData), target: 500, condition: s => s.stats.cumulativeData >= 500 && hasTech('SCI02') && s.buildings.lab >= 3, reward: () => advanceStage(2) },
    { id: 'firstTen', title: '从旧档案重建专家', text: '使用阶段奖励执行首次十连招募。', value: s => s.stats.tenPulls, target: 1, condition: s => s.stats.tenPulls >= 1, reward: () => grantResource('matter', 200, true) },
    { id: 'firstAssign', title: '让人改变系统', text: '派驻至少 1 位专家，使角色参与资源循环。', value: s => s.assignments.length, target: 1, condition: s => s.assignments.length >= 1, reward: () => grantResource('data', 150, true) },
    { id: 'resolveCrisis', title: '回应封锁脉冲', text: '在三种文明方案中作出一次不可撤销的危机选择。', value: s => s.crisis.resolved ? 1 : 0, target: 1, condition: s => s.crisis.resolved, reward: () => { grantResource('matter', 400, true); grantResource('data', 220, true); } },
    { id: 'planetaryLeap', title: '点燃行星工业', text: '建成聚变堆、累计 20 座设施，并完成首场危机。', value: s => Math.min(20, totalBuildings()), target: 20, condition: s => s.buildings.fusion >= 1 && totalBuildings() >= 20 && s.crisis.resolved, reward: () => advanceStage(3) },
    { id: 'orbitalDawn', title: '把生产线送入轨道', text: '建设第一座轨道铸造站，完成「轨道黎明」目标。', value: s => s.buildings.orbital, target: 1, condition: s => s.buildings.orbital >= 1, reward: () => showMvpComplete() }
  ];

  function maybeCompleteMission() {
    let safety = 0;
    while (state.missionIndex < MISSIONS.length && safety++ < 4) {
      const mission = MISSIONS[state.missionIndex];
      if (!mission.condition(state)) break;
      state.completedMissions.push(mission.id);
      state.missionIndex += 1;
      mission.reward?.();
      addHistory(`目标完成：${mission.title}`, mission.text);
      toast('阶段目标完成', mission.title, 'reward');
      audio.tone(520 + state.missionIndex * 18, 0.16, 0.035, 'triangle');
    }
  }

  function advanceStage(stage) {
    if (stage <= state.stage) return;
    state.stage = stage;
    if (stage === 2) {
      state.resources.signals += 10;
      state.exposure = Math.max(state.exposure, 6);
      state.crisis = { available: true, resolved: false, expiresAt: now() + 10 * 60 * 1000 };
      addHistory('进入科技封锁期', '天空出现无法归因的干涉弧光；角色派驻与文明暴露正式生效。');
    }
    if (stage === 3) {
      addHistory('进入行星工业期', '聚变能源让文明第一次触及轨道，山谷不再是世界的边界。');
      if (!state.events.pending.includes('silentProbe') && !state.events.seen.includes('silentProbe')) state.events.pending.push('silentProbe');
    }
    computeCaps(); computeProduction();
    showStageModal(stage);
    saveGame();
  }

  function saveGame(showToast = false) {
    try {
      state.lastSaved = now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      lastAutoSave = state.lastSaved;
      const indicator = $('#saveState');
      if (indicator) {
        indicator.classList.add('saving'); indicator.textContent = ' 正在同步';
        setTimeout(() => { indicator.classList.remove('saving'); indicator.innerHTML = '<i></i>已同步'; }, 450);
      }
      if (showToast) toast('文明已保存', '状态已写入本地存档');
    } catch (error) {
      toast('保存失败', '浏览器未允许本地存储，请检查隐私设置。', 'warning');
    }
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      state = deepMerge(newState(), parsed);
      hasExistingSave = true;
      const elapsed = (now() - Number(state.lastSaved || now())) / 1000;
      if (elapsed > 5) {
        const capped = Math.min(elapsed, 24 * 3600);
        let effective = Math.min(capped, 2 * 3600);
        if (capped > 2 * 3600) effective += Math.min(capped - 2 * 3600, 6 * 3600) * 0.75;
        if (capped > 8 * 3600) effective += (capped - 8 * 3600) * 0.4;
        const before = { matter: state.resources.matter, energy: state.resources.energy, data: state.resources.data, population: state.resources.population };
        const techBefore = Object.keys(state.tech).length;
        simulateTime(effective, true);
        offlineSummary = {
          elapsed: capped, effective,
          gains: {
            matter: state.resources.matter - before.matter,
            energy: state.resources.energy - before.energy,
            data: state.resources.data - before.data,
            population: state.resources.population - before.population
          },
          techs: Object.keys(state.tech).length - techBefore
        };
      }
      if (elapsed < -300) addHistory('检测到时间回拨', '离线收益已忽略；存档状态本身保持不变。');
      if (state.crisis.available && !state.crisis.resolved) state.crisis.expiresAt = Math.max(now() + 10 * 60 * 1000, state.crisis.expiresAt || 0);
      state.lastSaved = now();
    } catch (error) {
      console.warn('Save load failed', error);
      state = newState();
    }
  }

  function buildingDiscount() {
    let discount = hasTech('ENG02') ? 0.08 : 0;
    if (state.flags.foldNextBuild) discount += 0.35;
    return Math.min(0.35, discount);
  }

  function geometricCost(base, ratio, owned, quantity) {
    if (quantity <= 0) return 0;
    return base * Math.pow(ratio, owned) * (Math.pow(ratio, quantity) - 1) / (ratio - 1);
  }

  function buildingCost(id, quantity = 1) {
    const building = BUILDINGS[id];
    const owned = state.buildings[id] || 0;
    const result = {};
    for (const [resource, base] of Object.entries(building.cost)) {
      let cost = geometricCost(base, building.ratio, owned, quantity);
      if (resource === 'matter') cost *= (1 - buildingDiscount());
      result[resource] = Math.ceil(cost);
    }
    return result;
  }

  function canAfford(cost) {
    return Object.entries(cost).every(([resource, amount]) => (state.resources[resource] || 0) + 1e-6 >= amount);
  }

  function maxAffordable(id) {
    const building = BUILDINGS[id];
    if (!building.unlock(state)) return 0;
    let low = 0, high = 1;
    while (high < 10000 && canAfford(buildingCost(id, high))) high *= 2;
    high = Math.min(high, 10000);
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (canAfford(buildingCost(id, mid))) low = mid;
      else high = mid - 1;
    }
    return low;
  }

  function buyQuantity(id) {
    const owned = state.buildings[id] || 0;
    if (buyMode === '10') return 10;
    if (buyMode === 'milestone') {
      const next = [10, 25, 50, 100].find(value => value > owned);
      return next ? next - owned : 10;
    }
    if (buyMode === 'max') return maxAffordable(id);
    return 1;
  }

  function buyBuilding(id) {
    const building = BUILDINGS[id];
    if (!building || !building.unlock(state)) return toast('设施未解锁', building?.lockText || '条件未满足', 'warning');
    const quantity = buyQuantity(id);
    if (quantity <= 0) return toast('资源不足', '当前没有可购买的设施', 'warning');
    const cost = buildingCost(id, quantity);
    if (!canAfford(cost)) {
      const deficits = Object.entries(cost).filter(([r, v]) => state.resources[r] < v).map(([r, v]) => `${RESOURCE_DEFS[r]?.name || r} ${formatNumber(v - state.resources[r])}`);
      return toast('资源不足', `还需 ${deficits.join('、')}`, 'warning');
    }
    const before = state.buildings[id];
    for (const [resource, amount] of Object.entries(cost)) grantResource(resource, -amount, false);
    state.buildings[id] += quantity;
    state.stats.totalBuildings = totalBuildings();
    const crossedMilestone = [10, 25, 50, 100].some(mark => before < mark && state.buildings[id] >= mark);
    if (crossedMilestone && isAssigned('helian')) grantResource('matter', (cost.matter || 0) * 0.08, true);
    if (state.flags.foldNextBuild) state.flags.foldNextBuild = false;
    if (id === 'fusion' && !state.events.seen.includes('coreHarmony') && !state.events.pending.includes('coreHarmony')) state.events.pending.push('coreHarmony');
    computeCaps(); computeProduction();
    addHistory(`建设：${building.name} ×${quantity}`, `设施总数达到 ${state.buildings[id]}。`);
    toast('建设完成', `${building.name} +${quantity}`, 'reward');
    audio.tone(id === 'fusion' ? 180 : 260, 0.18, 0.04, 'sawtooth');
    maybeCompleteMission();
    saveGame();
    renderBuildings(); renderScene();
  }

  function switchMode(directionOrMode) {
    const modes = ['matter', 'energy', 'data'];
    const available = modes.filter(mode => mode !== 'data' || hasTech('SCI01'));
    if (available.includes(directionOrMode)) state.clickMode = directionOrMode;
    else if (typeof directionOrMode === 'number') {
      const index = available.indexOf(state.clickMode);
      state.clickMode = available[(index + directionOrMode + available.length) % available.length];
    }
    renderModes();
  }

  const pulseTimes = [];
  function pulse(clientX, clientY) {
    const timestamp = performance.now();
    while (pulseTimes.length && timestamp - pulseTimes[0] > 1000) pulseTimes.shift();
    if (pulseTimes.length >= 8) return;
    pulseTimes.push(timestamp);
    const resource = state.clickMode;
    if (resource === 'data' && !hasTech('SCI01')) return toast('数据指令尚未校准', '完成「观测统计」后解锁', 'warning');
    const def = RESOURCE_DEFS[resource];
    const commandLevel = Math.min(20, Math.floor(state.stats.totalClicks / 250));
    const techMultiplier = resource === 'data' && hasTech('SCI02') ? 1.15 : 1;
    const roleMultiplier = 1 + Math.min(1.5, roleCategoryBonus(resource));
    if (timestamp - state.lastPulse <= 1200) state.combo = Math.min(20, state.combo + 1);
    else if (timestamp - state.lastPulse > 2000) state.combo = 0;
    const critChance = 0.05;
    const critical = Math.random() < critChance;
    const commandFactor = state.command > 0 ? 1 : 0.2;
    const amount = round2(def.baseClick * (1 + 0.08 * commandLevel) * techMultiplier * roleMultiplier * (1 + 0.025 * Math.floor(state.combo)) * (critical ? 3 : 1) * commandFactor);
    const accepted = grantResource(resource, amount, true);
    if (state.command > 0) state.command = Math.max(0, state.command - 1);
    state.stats.totalClicks += 1;
    if (resource === 'matter') state.stats.manualMatter += accepted;
    state.stats.maxCombo = Math.max(state.stats.maxCombo, Math.floor(state.combo));
    state.lastPulse = timestamp;
    if (state.stage >= 2 && resource === 'data') state.exposure = Math.min(100, state.exposure + 0.002);
    if (timestamp - lastSoundAt > 230) {
      audio.tone(250 + state.combo * 7 + (critical ? 220 : 0), 0.05, critical ? 0.045 : 0.022, 'triangle');
      lastSoundAt = timestamp;
    }
    clickFeedback(clientX, clientY, accepted, def, critical);
    maybeCompleteMission();
  }

  function clickFeedback(clientX, clientY, amount, def, critical) {
    const layer = $('#particleLayer');
    const rect = layer.getBoundingClientRect();
    const x = Number.isFinite(clientX) ? clientX - rect.left : rect.width * 0.53;
    const y = Number.isFinite(clientY) ? clientY - rect.top : rect.height * 0.45;
    const float = document.createElement('span');
    float.className = 'float-number';
    float.style.cssText = `left:${x + 12}px;top:${y - 10}px;--float-color:${def.color}`;
    float.textContent = `${critical ? '暴击 ' : ''}+${formatNumber(amount)} ${def.short}`;
    const ring = document.createElement('i');
    ring.className = 'click-ring'; ring.style.cssText = `left:${x}px;top:${y}px;--float-color:${def.color}`;
    layer.append(float, ring);
    if (state.settings.effects) {
      for (let i = 0; i < (critical ? 9 : 4); i++) {
        const spark = document.createElement('i'); spark.className = 'spark';
        spark.style.cssText = `left:${x}px;top:${y}px;--float-color:${def.color};transform:rotate(${i * 360 / (critical ? 9 : 4)}deg)`;
        layer.appendChild(spark); setTimeout(() => spark.remove(), 600);
      }
    }
    setTimeout(() => { float.remove(); ring.remove(); }, 1000);
  }

  function pickCharacter(rarity) {
    const pool = Object.entries(CHARACTERS).filter(([, character]) => character.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)][0];
  }

  function drawRecruit() {
    const pityNumber = state.pity.pullsSinceSSR + 1;
    const hardPity = pityNumber >= 80;
    const ssrChance = hardPity ? 1 : pityNumber >= 61 ? Math.min(0.97, 0.02 + 0.05 * (pityNumber - 60)) : 0.02;
    const tenthBlockPull = state.pity.pullsInTenBlock + 1 >= 10;
    const guaranteeSR = tenthBlockPull && !state.pity.hasSRPlusInBlock;
    const roll = Math.random();
    let rarity = roll < ssrChance ? 'SSR' : guaranteeSR || roll < ssrChance + 0.18 ? 'SR' : 'R';
    if (rarity === 'SSR') state.pity.pullsSinceSSR = 0;
    else state.pity.pullsSinceSSR += 1;
    state.pity.pullsInTenBlock += 1;
    if (rarity !== 'R') state.pity.hasSRPlusInBlock = true;
    if (state.pity.pullsInTenBlock >= 10) {
      state.pity.pullsInTenBlock = 0;
      state.pity.hasSRPlusInBlock = false;
    }
    state.pity.totalPulls += 1;
    const id = pickCharacter(rarity);
    const duplicate = !!state.characters[id];
    if (!duplicate) state.characters[id] = { level: 1, rank: 0, shards: 0 };
    else state.characters[id].shards += rarity === 'SSR' ? 120 : rarity === 'SR' ? 60 : 20;
    return { id, rarity, duplicate, shards: duplicate ? (rarity === 'SSR' ? 120 : rarity === 'SR' ? 60 : 20) : 0 };
  }

  function recruit(count) {
    if (![1, 10].includes(count)) return;
    if (state.resources.signals < count) return toast('招募凭证不足', `需要 ${count} 张，当前 ${state.resources.signals} 张`, 'warning');
    state.resources.signals -= count;
    const results = Array.from({ length: count }, () => drawRecruit());
    if (count === 10) state.stats.tenPulls += 1;
    showRecruitResults(results);
    addHistory(`完成 ${count} 次档案重建`, `获得 ${results.filter(r => !r.duplicate).length} 位新专家。`);
    maybeCompleteMission(); saveGame();
  }

  function assignmentLimit() { return hasTech('BIO02') ? 3 : 2; }

  function toggleAssignment(id) {
    if (!hasCharacter(id)) return;
    const index = state.assignments.indexOf(id);
    if (index >= 0) state.assignments.splice(index, 1);
    else {
      if (state.assignments.length >= assignmentLimit()) return toast('派驻位已满', '完成「认知排班」可增加一个派驻位', 'warning');
      state.assignments.push(id);
    }
    computeCaps(); computeProduction();
    maybeCompleteMission(); saveGame(); renderRoster();
  }

  function activeCharacter() {
    return state.assignments.map(id => ({ id, character: CHARACTERS[id], ready: Math.max(0, (state.cooldowns[id] || 0) - now()) })).sort((a, b) => a.ready - b.ready)[0] || null;
  }

  function useActiveSkill() {
    const active = activeCharacter();
    if (!active || active.ready > 0) return;
    const { id, character } = active;
    if (id === 'luolan') grantResource('data', Math.max(10, production.data * 480), true);
    else if (id === 'yuanche') state.modifiers.push({ type: 'mineBoost', remaining: 600, value: 0.2 });
    else if (id === 'tianmo') state.flags.revealNextEvent = true;
    else if (id === 'heqing') state.modifiers.push({ type: 'populationBoost', remaining: 1800, value: 1.5 });
    else if (id === 'suyao') state.modifiers.push({ type: 'energyOverdrive', remaining: 60, value: 2.2 });
    else if (id === 'yeqiong') state.flags.safeResponse = true;
    else if (id === 'nahid' && state.research) state.research.remaining *= 0.92;
    else if (id === 'jiyuan' && state.research) state.research.remaining *= 0.82;
    else if (id === 'helian') state.flags.foldNextBuild = true;
    else if (['gongyin', 'yilan', 'shenmi'].includes(id)) state.flags.safeResponse = true;
    else grantResource('data', Math.max(5, production.data * 180), true);
    state.cooldowns[id] = now() + character.cooldown * 1000;
    toast('主动协议已执行', `${character.name} · ${character.active}`, 'reward');
    audio.tone(720, 0.2, 0.04, 'sine');
    saveGame();
  }

  function eventCost(cost = {}) {
    const factor = state.flags.safeResponse ? 0.8 : 1;
    return Object.fromEntries(Object.entries(cost).map(([resource, amount]) => [resource, Math.ceil(amount * factor)]));
  }

  function eventOptions(id) {
    if (id === 'errorNight') return [
      { title: '公开原始数据', cost: {}, text: '立即获得 40 D；文明暴露 +1。', effect: () => { grantResource('data', 40, true); state.exposure += 1; state.routes.light += 1; } },
      { title: '封闭交叉复验', cost: { energy: 16 }, text: '暴露不变；观测台数据永久 +2%。', effect: () => { state.flags.permanentLabBonus = (state.flags.permanentLabBonus || 0) + 0.02; state.routes.veil += 1; } },
      { title: '搬移传感器', cost: { matter: 25 }, text: '获得 20 D；为远征路线记录一次倾向。', effect: () => { grantResource('data', 20, true); state.routes.voyage += 1; } }
    ];
    if (id === 'blockadePulse') return [
      { title: '公开全部验证链', cost: {}, text: '获得 220 D，暴露 +6；铸光倾向 +2。', effect: () => { grantResource('data', 220, true); state.exposure += 6; state.routes.light += 2; state.flags.permanentLabBonus = (state.flags.permanentLabBonus || 0) + 0.04; } },
      { title: '关闭广播，内部复验', cost: { energy: 60 }, text: '暴露 -3；数据产量永久 +8%；隐幕倾向 +2。', effect: () => { state.exposure = Math.max(0, state.exposure - 3); state.routes.veil += 2; state.flags.permanentLabBonus = (state.flags.permanentLabBonus || 0) + 0.08; } },
      { title: '建立移动观测网', cost: { matter: 150 }, text: '获得 120 D；数据产量永久 +12%；远征倾向 +2。', effect: () => { grantResource('data', 120, true); state.routes.voyage += 2; state.flags.permanentLabBonus = (state.flags.permanentLabBonus || 0) + 0.12; } }
    ];
    if (id === 'coreHarmony') return [
      { title: '扩大稳定振荡', cost: {}, text: '能源超频 60 秒，暴露 +2。', effect: () => { state.modifiers.push({ type: 'energyOverdrive', remaining: 60, value: 2.2 }); state.exposure += 2; state.routes.light += 1; } },
      { title: '保守停堆检查', cost: { energy: 40 }, text: '获得 180 D，隐幕倾向 +1。', effect: () => { grantResource('data', 180, true); state.routes.veil += 1; } },
      { title: '复制到轨道试验', cost: { matter: 240 }, text: '获得 300 D，远征倾向 +1。', effect: () => { grantResource('data', 300, true); state.routes.voyage += 1; } }
    ];
    if (id === 'silentProbe') return [
      { title: '原位拆解', cost: { data: 180 }, text: 'NAV02 研究成本返还 25%（若未研究则获得 210 D）。', effect: () => { grantResource('data', 210, true); state.routes.light += 2; state.exposure += 2; } },
      { title: '封装并保持沉默', cost: { matter: 300 }, text: '暴露 -5，隐幕倾向 +2。', effect: () => { state.exposure = Math.max(0, state.exposure - 5); state.routes.veil += 2; } },
      { title: '反向追踪轨迹', cost: { energy: 160 }, text: '获得 420 D，远征倾向 +2，暴露 +1。', effect: () => { grantResource('data', 420, true); state.routes.voyage += 2; state.exposure += 1; } }
    ];
    if (id === 'lightsQuota') return [
      { title: '执行低功率夜', cost: {}, text: '暴露 -4，能源产出降低的代价由停机承担。', effect: () => { state.exposure = Math.max(0, state.exposure - 4); state.routes.veil += 1; } },
      { title: '维持工业节奏', cost: {}, text: '物质产量强化 10 分钟，暴露 +3。', effect: () => { state.modifiers.push({ type: 'mineBoost', remaining: 600, value: 0.2 }); state.exposure += 3; state.routes.voyage += 1; } },
      { title: '把负载转入仓储', cost: { matter: 120 }, text: '获得 150 D，暴露 +1。', effect: () => { grantResource('data', 150, true); state.exposure += 1; state.routes.light += 1; } }
    ];
    return [
      { title: '记录并保持静默', cost: {}, text: '事件进入档案，不产生即时损失。', effect: () => { state.routes.veil += 1; } },
      { title: '投入资源分析', cost: { data: 100 }, text: '获得一项铸光倾向。', effect: () => { state.routes.light += 1; } }
    ];
  }

  function payEventCost(cost) {
    const finalCost = eventCost(cost);
    if (!canAfford(finalCost)) return false;
    for (const [resource, amount] of Object.entries(finalCost)) grantResource(resource, -amount, false);
    if (state.flags.safeResponse) state.flags.safeResponse = false;
    return true;
  }

  function chooseEvent(id, index) {
    const option = eventOptions(id)[index];
    if (!option || !payEventCost(option.cost)) return toast('无法执行该方案', '资源条件不足', 'warning');
    option.effect();
    if (!state.events.seen.includes(id)) state.events.seen.push(id);
    state.events.pending = state.events.pending.filter(eventId => eventId !== id);
    state.events.decisions[id] = index;
    if (id === 'blockadePulse') state.crisis = { ...state.crisis, available: false, resolved: true };
    addHistory(`事件决策：${EVENT_DEFS[id].name}`, option.title);
    closeModal();
    toast('文明决策已记录', `${EVENT_DEFS[id].name} · ${option.title}`, 'reward');
    maybeCompleteMission(); computeProduction(); saveGame();
  }

  let lastEventCheck = 0;
  function maybeTriggerEvents() {
    if (state.playSeconds - lastEventCheck < 5) return;
    lastEventCheck = state.playSeconds;
    if (state.buildings.fusion >= 1 && !state.events.seen.includes('coreHarmony') && !state.events.pending.includes('coreHarmony')) state.events.pending.push('coreHarmony');
    if (state.stage >= 2 && state.exposure >= 20 && !state.events.seen.includes('lightsQuota') && !state.events.pending.includes('lightsQuota')) state.events.pending.push('lightsQuota');
    if (state.crisis.available && !state.crisis.resolved && state.crisis.expiresAt && now() > state.crisis.expiresAt && !state.crisis.overdue) {
      state.crisis.overdue = true; state.exposure = Math.min(100, state.exposure + 5);
      addHistory('封锁脉冲响应超时', '文明没有被摧毁，但额外留下了 5 点暴露痕迹。危机仍可补救。');
      toast('危机响应超时', '暴露 +5；成果未被清空，仍可立即处理。', 'warning');
    }
  }

  function toast(title, message, type = '') {
    const stack = $('#toastStack');
    if (!stack) return;
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.innerHTML = `<b>${title}</b><span>${message}</span>`;
    stack.appendChild(node);
    setTimeout(() => { node.style.opacity = '0'; node.style.transform = 'translateX(-12px)'; }, 4200);
    setTimeout(() => node.remove(), 4700);
  }

  function openModal(markup) {
    const root = $('#modalRoot');
    root.innerHTML = markup;
    root.classList.remove('hidden');
  }

  function closeModal() {
    const root = $('#modalRoot');
    root.classList.add('hidden');
    root.innerHTML = '';
  }

  function showEvent(id) {
    const event = EVENT_DEFS[id];
    if (!event) return;
    const options = eventOptions(id);
    const isCrisis = id === 'blockadePulse';
    const reveal = state.flags.revealNextEvent || isAssigned('tianmo');
    const optionsHtml = options.map((option, index) => {
      const cost = eventCost(option.cost);
      const affordable = canAfford(cost);
      const costText = Object.keys(cost).length ? Object.entries(cost).map(([resource, value]) => `${RESOURCE_DEFS[resource]?.name || resource} ${formatNumber(value)}`).join(' · ') : '无资源成本';
      return `<button class="event-option" data-event-choice="${index}" ${affordable ? '' : 'disabled'}>
        <b>${option.title}</b><p>${option.text}</p><span>${costText}${reveal ? ' · 结果确定' : ''}</span>
      </button>`;
    }).join('');
    const countdown = isCrisis && state.crisis.expiresAt ? `<span>MAJOR CRISIS · ${formatTime((state.crisis.expiresAt - now()) / 1000)} 响应窗口</span>` : `<span>CIVILIZATION EVENT · 阶段 ${event.stage}</span>`;
    openModal(`<article class="modal-card event-modal" data-event-id="${id}">
      <div class="event-image" style="background-image:url('${event.image}')"></div>
      <div class="event-copy">${countdown}<h2>${event.name}</h2><p>${event.intro}</p><div class="event-options">${optionsHtml}</div></div>
      <div class="modal-close-row"><button data-close-modal>暂后处理 · Esc</button></div>
    </article>`);
    state.flags.revealNextEvent = false;
  }

  function showRecruitResults(results) {
    const cards = results.map((result, index) => {
      const character = CHARACTERS[result.id];
      return `<div class="recruit-result ${result.rarity}" style="--avatar:${character.avatar};--rarity:${result.rarity === 'SSR' ? '#e8ab5b' : result.rarity === 'SR' ? '#a88cf4' : '#75d8e4'};animation-delay:${index * 0.09}s">
        <i>${character.name.slice(0, 1)}</i><b>${character.name}</b><span>${result.rarity} · ${character.job}</span><small>${result.duplicate ? `重复档案 · +${result.shards} 碎片` : '首次重建'}</small>
      </div>`;
    }).join('');
    openModal(`<article class="recruit-card"><span class="eyebrow">SIGNAL RECONSTRUCTION</span><h2>专家档案重建完成</h2><div class="recruit-results">${cards}</div><div class="modal-close-row"><button data-close-modal>收录结果</button></div></article>`);
    const best = results.some(r => r.rarity === 'SSR') ? 860 : results.some(r => r.rarity === 'SR') ? 650 : 430;
    audio.tone(best, 0.35, 0.05, 'sine');
    renderRoster();
  }

  function showStageModal(stage) {
    const data = stage === 2 ? {
      label: 'CIVILIZATION TRANSITION 02', title: '科技封锁期',
      text: '分布式证据链证明了异常并非仪器故障。角色派驻、文明暴露与重大危机现已生效；你获得了 10 张招募凭证。',
      image: './assets/blockade-pulse.webp', button: '进入异常天空'
    } : {
      label: 'CIVILIZATION TRANSITION 03', title: '行星工业期',
      text: '聚变能源与二十座设施组成了第一条行星工业链。轨道铸造站已经解锁，主场景也将从山谷扩展至轨道黎明。',
      image: './assets/orbital-dawn.webp', button: '展开轨道层'
    };
    openModal(`<article class="stage-modal" style="background-image:url('${data.image}')"><div><span>${data.label}</span><h2>${data.title}</h2><p>${data.text}</p><button class="primary-button" data-close-modal>${data.button}</button></div></article>`);
    audio.tone(stage === 2 ? 470 : 620, 0.5, 0.055, 'sine');
  }

  function showMvpComplete() {
    addHistory('轨道黎明', '第一座轨道铸造站开始运转；本次 MVP 的完整文明循环已经达成。');
    openModal(`<article class="stage-modal"><div><span>MVP EPOCH COMPLETE</span><h2>轨道黎明</h2><p>你已经完成从手动采集、自动生产、科技路线、角色派驻到文明危机的完整闭环。世界仍会继续生产与研究；星图、文明竞争与纪元重置将在后续版本开启。</p><button class="primary-button" data-close-modal>继续经营文明</button></div></article>`);
    saveGame();
  }

  function showOfflineSummary() {
    if (!offlineSummary || offlineSummary.elapsed < 5) return;
    const gains = ['matter', 'energy', 'data'].map(resource => `<div><span>${RESOURCE_DEFS[resource].name}</span><b>${offlineSummary.gains[resource] >= 0 ? '+' : ''}${formatNumber(offlineSummary.gains[resource])}</b></div>`).join('');
    openModal(`<article class="offline-card"><span>OFFLINE SETTLEMENT</span><h2>文明在你离开时继续运行</h2><p>离线 ${formatTime(offlineSummary.elapsed)}，按分段效率折算为 ${formatTime(offlineSummary.effective)}。仓储上限、能源消耗与研究计时均已逐步结算。</p><div class="offline-gains">${gains}</div>${offlineSummary.techs ? `<p>另有 ${offlineSummary.techs} 项研究在离线期间完成。</p>` : ''}<button class="primary-button" data-close-modal>接管观测站</button></article>`);
    offlineSummary = null;
    saveGame();
  }

  function showResetConfirm() {
    openModal(`<article class="confirm-card"><h2>清除当前文明？</h2><p>此操作会删除本浏览器中的资源、角色、科技和保底记录，无法撤销。</p><div class="confirm-actions"><button data-close-modal>取消</button><button class="danger-button" id="confirmReset">确认清除</button></div></article>`);
  }

  function renderTopbar() {
    computeCaps(); computeProduction();
    const resources = ['matter', 'energy', 'data', 'population'];
    $('#resourceBar').innerHTML = resources.map(resource => {
      const def = RESOURCE_DEFS[resource];
      const value = state.resources[resource];
      const cap = caps[resource];
      const ps = production[resource] || 0;
      const rate = resource === 'population' ? `${ps >= 0 ? '+' : ''}${formatNumber(ps * 3600)}/h` : `${ps >= 0 ? '+' : ''}${formatNumber(ps)}/s`;
      return `<div class="resource-item ${ps < 0 ? 'negative' : ''}" style="--resource-color:${def.color}"><div class="resource-top"><span>${def.name} ${def.short}</span><i></i></div><div class="resource-value"><b>${formatNumber(value)}</b><small>${rate}</small></div><div class="resource-cap"><i style="width:${clamp(value / Math.max(cap, 1) * 100, 0, 100)}%"></i></div></div>`;
    }).join('');
    $('#stageName').textContent = STAGES[state.stage].name;
  }

  function renderMission() {
    const mission = MISSIONS[state.missionIndex];
    $('#stageIndex').textContent = STAGES[state.stage].label;
    $('#stageTitle').textContent = STAGES[state.stage].name;
    if (!mission) {
      $('#currentMission').innerHTML = '<span>当前目标</span><b>继续扩张文明</b><p>本次 MVP 目标已经全部完成。</p><div class="mission-progress"><i style="width:100%"></i></div>';
      return;
    }
    const value = mission.value(state);
    const progress = clamp(value / mission.target * 100, 0, 100);
    $('#currentMission').innerHTML = `<span>当前目标 ${state.missionIndex + 1}/${MISSIONS.length}</span><b>${mission.title}</b><p>${mission.text}</p><div class="mission-progress"><i style="width:${progress}%"></i></div>`;
  }

  function previewClickValue(mode) {
    const def = RESOURCE_DEFS[mode];
    const commandLevel = Math.min(20, Math.floor(state.stats.totalClicks / 250));
    const techMultiplier = mode === 'data' && hasTech('SCI02') ? 1.15 : 1;
    return round2(def.baseClick * (1 + 0.08 * commandLevel) * techMultiplier * (1 + roleCategoryBonus(mode)) * (1 + 0.025 * Math.floor(state.combo)) * (state.command > 0 ? 1 : 0.2));
  }

  function renderModes() {
    const modes = ['matter', 'energy', 'data'];
    $('#modeSwitch').innerHTML = modes.map(mode => {
      const def = RESOURCE_DEFS[mode];
      const locked = mode === 'data' && !hasTech('SCI01');
      return `<button data-mode="${mode}" class="${state.clickMode === mode ? 'active' : ''} ${locked ? 'locked' : ''}" style="--mode-color:${def.color}" ${locked ? 'disabled' : ''}>${def.short}<b>${def.name}</b></button>`;
    }).join('');
    const def = RESOURCE_DEFS[state.clickMode];
    $('#pulseValue').textContent = `+${formatNumber(previewClickValue(state.clickMode))} ${def.name}`;
    $('#reticleLabel').textContent = `采集${def.name}`;
    $('#comboText').textContent = `×${Math.floor(state.combo)}`;
    $('#critText').textContent = '5%';
  }

  function renderScene() {
    const world = $('#world');
    world.className = `world stage-${state.stage}`;
    for (const id of Object.keys(BUILDINGS)) $(`.prop-${id}`)?.classList.toggle('visible', state.buildings[id] > 0);
    $('#commandText').textContent = `${Math.floor(state.command)} / 100`;
    $('#commandMeter').style.width = `${state.command}%`;
    const exposureBlock = $('#exposureBlock');
    exposureBlock.classList.toggle('locked-risk', state.stage < 2 && !hasTech('INT01'));
    $('#exposureText').textContent = state.stage < 2 && !hasTech('INT01') ? '未监测' : `${formatNumber(state.exposure)} / 100`;
    $('#exposureMeter').style.width = `${state.exposure}%`;
    document.body.classList.toggle('low-effects', !state.settings.effects);

    const current = state.research;
    $('#researchTicker').classList.toggle('hidden', !current);
    if (current) {
      $('#researchName').textContent = TECHS[current.id].name;
      $('#researchProgress').style.width = `${(1 - current.remaining / current.total) * 100}%`;
      $('#researchTime').textContent = formatTime(current.remaining);
    }
    const crisisVisible = state.crisis.available && !state.crisis.resolved;
    $('#crisisBeacon').classList.toggle('hidden', !crisisVisible);
    if (crisisVisible) {
      const remaining = state.crisis.expiresAt ? (state.crisis.expiresAt - now()) / 1000 : 0;
      $('#crisisCountdown').textContent = remaining > 0 ? formatTime(remaining) : '超时 · 仍可补救';
      $('#crisisBeacon').classList.toggle('urgent', remaining <= 120);
    }
    const active = activeCharacter();
    const button = $('#activeSkillButton');
    if (!active) { button.disabled = true; button.innerHTML = '<span>主动协议</span><b>暂无派驻技能</b>'; }
    else {
      const seconds = Math.max(0, active.ready / 1000);
      button.disabled = seconds > 0;
      button.innerHTML = `<span>${CHARACTERS[active.id].name} · 主动协议</span><b>${seconds > 0 ? `冷却 ${formatTime(seconds)}` : CHARACTERS[active.id].active.split('：')[0]}</b>`;
    }
    renderNotices();
  }

  function renderNotices() {
    const affordableBuilding = Object.values(BUILDINGS).some(building => building.unlock(state) && canAfford(buildingCost(building.id, 1)));
    const availableTech = Object.values(TECHS).some(tech => !hasTech(tech.id) && state.research?.id !== tech.id && techAvailable(tech).ok && state.resources.data >= tech.cost);
    $('#buildingNotice').classList.toggle('on', affordableBuilding);
    $('#techNotice').classList.toggle('on', availableTech);
    $('#rosterNotice').classList.toggle('on', state.resources.signals > 0 || state.assignments.length < Math.min(assignmentLimit(), Object.keys(state.characters).length));
    $('#journalNotice').classList.toggle('on', state.events.pending.length > 0);
  }

  function buildingEffectText(building) {
    const outputs = Object.entries(building.output).map(([resource, value]) => `+${formatNumber(value)} ${RESOURCE_DEFS[resource].short}/s`);
    if (building.id === 'store') outputs.push('+500 M / +120 E / +200 D 容量');
    if (building.id === 'hab') outputs.push('+10 人口容量');
    const inputs = Object.entries(building.input).map(([resource, value]) => `-${formatNumber(value)} ${RESOURCE_DEFS[resource].short}/s`);
    return [...outputs, ...inputs].join(' · ');
  }

  function renderBuildings() {
    if (!$('#buildingList')) return;
    const modes = [['1', '×1'], ['10', '×10'], ['milestone', '至里程碑'], ['max', '最大']];
    $('#buyMode').innerHTML = modes.map(([value, label]) => `<button data-buy-mode="${value}" class="${buyMode === value ? 'active' : ''}">${label}</button>`).join('');
    $('#buildingList').innerHTML = Object.values(BUILDINGS).map(building => {
      const unlocked = building.unlock(state);
      const quantity = unlocked ? buyQuantity(building.id) : 1;
      const cost = buildingCost(building.id, Math.max(1, quantity));
      const costText = Object.entries(cost).map(([resource, amount]) => `${RESOURCE_DEFS[resource]?.short || resource} ${formatNumber(amount)}`).join(' · ');
      const affordable = unlocked && quantity > 0 && canAfford(cost);
      return `<article class="building-card ${unlocked ? '' : 'locked'}"><div class="building-icon">${building.icon}</div><div><h3>${building.name}<span>Lv.${state.buildings[building.id]}</span></h3><p>${building.desc}</p><small>${buildingEffectText(building)} · 岗位 ${building.jobs}</small></div><button data-buy-building="${building.id}" ${affordable ? '' : 'disabled'}>${unlocked ? `建设 ×${Math.max(1, quantity)}` : '未解锁'}<b>${unlocked ? costText : ''}</b></button>${unlocked ? '' : `<span class="lock-reason">${building.lockText}</span>`}</article>`;
    }).join('');
  }

  function techStatus(tech) {
    if (hasTech(tech.id)) return 'done';
    if (state.research?.id === tech.id || state.researchQueue.some(item => item.id === tech.id)) return 'running';
    return techAvailable(tech).ok ? 'available' : 'locked';
  }

  function renderTech() {
    const nodesRoot = $('#techNodes');
    const linksRoot = $('#techLinks');
    if (!nodesRoot || !linksRoot) return;
    nodesRoot.innerHTML = Object.values(TECHS).map(tech => {
      const status = techStatus(tech);
      const running = state.research?.id === tech.id ? ` · ${formatTime(state.research.remaining)}` : state.researchQueue.some(item => item.id === tech.id) ? ' · 已预排' : '';
      const availability = techAvailable(tech);
      return `<button class="tech-node ${status}" data-tech="${tech.id}" style="left:${tech.x}px;top:${tech.y}px"><span>${tech.id} · ${tech.branch}</span><b>${tech.name}</b><small>${tech.desc}</small><em>${status === 'locked' ? availability.reason : status === 'done' ? '研究完成' : `${formatNumber(tech.cost)} D · ${formatTime(actualResearchTime(tech))}${running}`}</em></button>`;
    }).join('');
    const lines = [];
    for (const tech of Object.values(TECHS)) {
      for (const preId of tech.pre) {
        const pre = TECHS[preId];
        if (!pre) continue;
        const active = hasTech(preId);
        lines.push(`<path class="tech-link ${active ? 'active' : ''}" d="M ${pre.x + 176} ${pre.y + 46} C ${pre.x + 225} ${pre.y + 46}, ${tech.x - 45} ${tech.y + 46}, ${tech.x} ${tech.y + 46}"/>`);
      }
    }
    linksRoot.innerHTML = lines.join('');
    applyTechTransform();
  }

  function renderRoster() {
    const max = assignmentLimit();
    $('#assignmentCount').textContent = `${state.assignments.length} / ${max}`;
    $('#assignmentSlots').innerHTML = Array.from({ length: max }, (_, index) => {
      const id = state.assignments[index];
      return id ? `<div class="assignment-slot filled"><i>${CHARACTERS[id].name[0]}</i><span>${CHARACTERS[id].name}<br>${CHARACTERS[id].job}</span></div>` : '<div class="assignment-slot"><i>＋</i><span>空闲派驻位</span></div>';
    }).join('');
    $('#rosterList').innerHTML = Object.entries(CHARACTERS).map(([id, character]) => {
      const owned = hasCharacter(id);
      const assigned = isAssigned(id);
      const record = state.characters[id];
      const rarityColor = character.rarity === 'SSR' ? '#e8ab5b' : character.rarity === 'SR' ? '#a88cf4' : '#75d8e4';
      return `<article class="character-card rarity-${character.rarity} ${owned ? '' : 'locked'}" style="--avatar:${character.avatar};--rarity:${rarityColor}"><header><div class="character-avatar">${character.name[0]}</div><div><h3>${character.name}<small>${character.rarity}</small></h3><p>${character.job} · 核心属性 ${character.stat}</p></div></header><p>${character.passive}<br>${character.active}</p><footer><span>${owned ? `Lv.${record.level} · 碎片 ${record.shards}` : '档案尚未重建'}</span><button data-assign="${id}" ${owned ? '' : 'disabled'}>${assigned ? '撤回' : '派驻'}</button></footer></article>`;
    }).join('');
    const signals = state.resources.signals;
    $('#singleRecruitButton').disabled = signals < 1;
    $('#singleRecruitButton').textContent = `单次 · ${signals}`;
    $('#recruitButton').disabled = signals < 10;
    $('#recruitButton').textContent = signals >= 10 ? `十次招募 · ${signals}` : `十次需 10 · ${signals}`;
    $('#pityMeter').style.width = `${Math.min(100, state.pity.pullsSinceSSR / 80 * 100)}%`;
    $('#pityText').textContent = `${state.pity.pullsSinceSSR} / 80`;
  }

  function renderJournal() {
    const root = $('#journalContent');
    $$('#journalTabs button').forEach(button => button.classList.toggle('active', button.dataset.tab === journalTab));
    if (journalTab === 'missions') {
      root.innerHTML = MISSIONS.map((mission, index) => `<article class="journal-entry ${index < state.missionIndex ? 'complete' : index === state.missionIndex ? 'current' : ''}"><span>${index < state.missionIndex ? 'COMPLETED' : index === state.missionIndex ? 'CURRENT' : 'LOCKED'} · 目标 ${index + 1}</span><h3>${mission.title}</h3><p>${mission.text}</p></article>`).join('');
    } else if (journalTab === 'events') {
      root.innerHTML = `<div class="event-archive">${Object.entries(EVENT_DEFS).map(([id, event]) => {
        const pending = state.events.pending.includes(id) || (id === 'blockadePulse' && state.crisis.available);
        const seen = state.events.seen.includes(id);
        return `<article class="event-tile ${seen || pending ? 'discovered' : ''}"><span>${pending ? '等待决策' : seen ? '已归档' : `阶段 ${event.stage} · 未发现`}</span><b>${seen || pending ? event.name : '未知事件'}</b><p>${seen || pending ? event.intro : '继续发展文明以解锁该档案。'}</p>${pending ? `<button data-open-event="${id}">处理事件</button>` : ''}</article>`;
      }).join('')}</div>`;
    } else {
      root.innerHTML = state.history.map(item => `<article class="journal-entry complete"><span>${new Date(item.at).toLocaleString('zh-CN', { hour12: false })}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('');
    }
  }

  function renderAll(forcePanels = false) {
    renderTopbar(); renderMission(); renderModes(); renderScene();
    if (forcePanels || performance.now() - lastPanelRender > 900) {
      if (openPanelName === 'buildings') renderBuildings();
      if (openPanelName === 'tech') renderTech();
      if (openPanelName === 'roster') renderRoster();
      if (openPanelName === 'journal') renderJournal();
      lastPanelRender = performance.now();
    }
  }

  function openPanel(name) {
    closePanels();
    const panel = $(`#panel-${name}`);
    if (!panel) return;
    openPanelName = name;
    panel.classList.add('open');
    $('#panelBackdrop').classList.remove('hidden');
    if (name === 'buildings') renderBuildings();
    if (name === 'tech') renderTech();
    if (name === 'roster') renderRoster();
    if (name === 'journal') renderJournal();
    if (name === 'settings') {
      $('#soundToggle').checked = state.settings.sound;
      $('#effectsToggle').checked = state.settings.effects;
    }
  }

  function closePanels() {
    $$('.panel.open').forEach(panel => panel.classList.remove('open'));
    $('#panelBackdrop')?.classList.add('hidden');
    openPanelName = null;
  }

  function applyTechTransform() {
    const canvas = $('#techCanvas');
    if (!canvas) return;
    canvas.style.transform = `translate(${techView.x}px,${techView.y}px) scale(${techView.scale})`;
    $('#techZoomLabel').textContent = `${Math.round(techView.scale * 100)}%`;
  }

  function resetTechView() {
    techView = { ...techView, x: 50, y: 20, scale: 0.86, dragging: false };
    applyTechTransform();
  }

  function offlineEffectiveSeconds(elapsed) {
    const capped = Math.min(Math.max(0, elapsed), 24 * 3600);
    let effective = Math.min(capped, 2 * 3600);
    if (capped > 2 * 3600) effective += Math.min(capped - 2 * 3600, 6 * 3600) * 0.75;
    if (capped > 8 * 3600) effective += (capped - 8 * 3600) * 0.4;
    return { capped, effective };
  }

  let gameStarted = false;
  let hiddenAt = 0;

  function enterGame() {
    gameStarted = true;
    $('#bootScreen').classList.add('hidden');
    $('#game').classList.remove('hidden');
    renderAll(true);
    if (!hasExistingSave) saveGame();
    setTimeout(showOfflineSummary, 280);
  }

  function wireEvents() {
    $('#enterGame').addEventListener('click', enterGame);
    $('#newGameFromBoot').addEventListener('click', () => {
      if (!window.confirm('建立新纪元将清除当前浏览器存档。继续吗？')) return;
      localStorage.removeItem(SAVE_KEY); state = newState(); hasExistingSave = false; offlineSummary = null;
      $('#enterGame').textContent = '启动暮色星谷'; $('#newGameFromBoot').classList.add('hidden');
    });

    $$('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
    $$('.close-panel').forEach(button => button.addEventListener('click', closePanels));
    $('#panelBackdrop').addEventListener('click', closePanels);

    $('#sceneInteract').addEventListener('click', event => pulse(event.clientX, event.clientY));
    $('#pulseButton').addEventListener('click', event => {
      const rect = $('#sceneInteract').getBoundingClientRect();
      pulse(event.detail ? rect.left + rect.width * 0.53 : undefined, event.detail ? rect.top + rect.height * 0.45 : undefined);
    });
    $('#modeSwitch').addEventListener('click', event => {
      const button = event.target.closest('[data-mode]');
      if (button && !button.disabled) switchMode(button.dataset.mode);
    });
    $('#activeSkillButton').addEventListener('click', useActiveSkill);

    $('#buyMode').addEventListener('click', event => {
      const button = event.target.closest('[data-buy-mode]');
      if (!button) return;
      buyMode = button.dataset.buyMode; renderBuildings();
    });
    $('#buildingList').addEventListener('click', event => {
      const button = event.target.closest('[data-buy-building]');
      if (button) buyBuilding(button.dataset.buyBuilding);
    });

    $('#techNodes').addEventListener('click', event => {
      const node = event.target.closest('[data-tech]');
      if (!node || node.classList.contains('locked') || node.classList.contains('done') || node.classList.contains('running')) return;
      startResearch(node.dataset.tech);
    });
    const viewport = $('#techViewport');
    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const before = techView.scale;
      const next = clamp(before * (event.deltaY > 0 ? 0.9 : 1.1), 0.55, 1.45);
      const mx = event.clientX - rect.left, my = event.clientY - rect.top;
      techView.x = mx - (mx - techView.x) * (next / before);
      techView.y = my - (my - techView.y) * (next / before);
      techView.scale = next; applyTechTransform();
    }, { passive: false });
    viewport.addEventListener('pointerdown', event => {
      if (event.target.closest('.tech-node')) return;
      techView.dragging = true; techView.px = event.clientX; techView.py = event.clientY;
      viewport.classList.add('dragging'); viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener('pointermove', event => {
      if (!techView.dragging) return;
      techView.x += event.clientX - techView.px; techView.y += event.clientY - techView.py;
      techView.px = event.clientX; techView.py = event.clientY; applyTechTransform();
    });
    viewport.addEventListener('pointerup', () => { techView.dragging = false; viewport.classList.remove('dragging'); });
    $('#techFit').addEventListener('click', resetTechView);

    $('#rosterList').addEventListener('click', event => {
      const button = event.target.closest('[data-assign]');
      if (button) toggleAssignment(button.dataset.assign);
    });
    $('#singleRecruitButton').addEventListener('click', () => recruit(1));
    $('#recruitButton').addEventListener('click', () => recruit(10));

    $('#journalTabs').addEventListener('click', event => {
      const button = event.target.closest('[data-tab]');
      if (!button) return;
      journalTab = button.dataset.tab; renderJournal();
    });
    $('#journalContent').addEventListener('click', event => {
      const button = event.target.closest('[data-open-event]');
      if (button) showEvent(button.dataset.openEvent);
    });

    $('#crisisBeacon').addEventListener('click', () => showEvent('blockadePulse'));
    $('#manualSave').addEventListener('click', () => saveGame(true));
    $('#resetSave').addEventListener('click', showResetConfirm);
    $('#soundToggle').addEventListener('change', event => { state.settings.sound = event.target.checked; saveGame(); });
    $('#effectsToggle').addEventListener('change', event => { state.settings.effects = event.target.checked; renderScene(); saveGame(); });

    $('#modalRoot').addEventListener('click', event => {
      const choice = event.target.closest('[data-event-choice]');
      if (choice) {
        const card = choice.closest('[data-event-id]');
        chooseEvent(card.dataset.eventId, Number(choice.dataset.eventChoice));
        return;
      }
      if (event.target.closest('[data-close-modal]')) closeModal();
      if (event.target.closest('#confirmReset')) {
        localStorage.removeItem(SAVE_KEY); state = newState(); offlineSummary = null; hasExistingSave = false;
        closeModal(); closePanels(); renderAll(true); saveGame(); toast('新文明已建立', '暮色星谷恢复为初始状态。');
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (!$('#modalRoot').classList.contains('hidden')) closeModal();
        else if (openPanelName) closePanels();
        return;
      }
      if (!gameStarted) return;
      const target = event.target;
      if (target.matches('input,textarea,select,[contenteditable="true"]')) return;
      if (event.code === 'Space' && target.closest('button')) return;
      if (event.code === 'Space') {
        event.preventDefault(); const rect = $('#sceneInteract').getBoundingClientRect(); pulse(rect.left + rect.width * 0.53, rect.top + rect.height * 0.45);
      } else if (event.key.toLowerCase() === 'q') switchMode(-1);
      else if (event.key.toLowerCase() === 'e') switchMode(1);
      else if (event.key.toLowerCase() === 'b') openPanel('buildings');
      else if (event.key.toLowerCase() === 't') openPanel('tech');
      else if (event.key.toLowerCase() === 'r') openPanel('roster');
      else if (event.key.toLowerCase() === 'j') openPanel('journal');
      else if (event.key.toLowerCase() === 'f') {
        const hud = $('.mission-hud'); hud.classList.remove('shake'); void hud.offsetWidth; hud.classList.add('shake');
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { hiddenAt = now(); if (gameStarted) saveGame(); }
      else if (hiddenAt && gameStarted) {
        const elapsed = (now() - hiddenAt) / 1000; hiddenAt = 0;
        if (elapsed > 5) {
          const { capped, effective } = offlineEffectiveSeconds(elapsed);
          const before = { matter: state.resources.matter, energy: state.resources.energy, data: state.resources.data };
          simulateTime(effective, true);
          offlineSummary = { elapsed: capped, effective, gains: { matter: state.resources.matter - before.matter, energy: state.resources.energy - before.energy, data: state.resources.data - before.data }, techs: 0 };
          showOfflineSummary(); renderAll(true);
        }
      }
    });
    window.addEventListener('beforeunload', () => { if (gameStarted) saveGame(); });
  }

  function gameLoop(timestamp) {
    const dt = clamp((timestamp - lastFrame) / 1000, 0, 0.5);
    lastFrame = timestamp;
    if (gameStarted) {
      simulateTime(dt, false);
      if (timestamp - lastRender > 180) { renderAll(false); lastRender = timestamp; }
      if (now() - lastAutoSave >= 30000) saveGame();
    }
    requestAnimationFrame(gameLoop);
  }

  function init() {
    loadGame();
    if (QA_MODE && !hasExistingSave) {
      state = newState();
      const qaStageThree = QA_MODE.startsWith('stage3');
      state.stage = qaStageThree ? 3 : 2;
      Object.assign(state.resources, { matter: qaStageThree ? 5100 : 1400, energy: 420, data: qaStageThree ? 2160 : 900, population: 18, signals: 20 });
      Object.assign(state.buildings, { solar: 8, mine: 7, lab: 3, store: 3, hab: 1, fusion: qaStageThree ? 1 : 0, orbital: 0 });
      Object.assign(state.tech, { SCI01: true, SCI02: true, ENG01: true, ENG02: true, BIO01: true, INT01: true });
      if (qaStageThree) Object.assign(state.tech, { ENG03: true, NAV01: true, INT02: true });
      for (const id of ['luolan', 'yuanche', 'tianmo', 'heqing', 'suyao', 'yeqiong']) state.characters[id] = { level: 1, rank: 0, shards: 0 };
      state.missionIndex = qaStageThree ? 10 : 6;
      state.completedMissions = MISSIONS.slice(0, state.missionIndex).map(mission => mission.id);
      state.stats.cumulativeData = 600; state.stats.totalBuildings = totalBuildings();
      state.exposure = 12;
      state.crisis = qaStageThree ? { available: false, resolved: true, expiresAt: null } : { available: true, resolved: false, expiresAt: now() + 600000 };
    }
    computeCaps(); computeProduction();
    if (hasExistingSave) {
      $('#enterGame').textContent = '继续观测文明';
      $('#newGameFromBoot').classList.remove('hidden');
    }
    wireEvents();
    renderAll(true);
    requestAnimationFrame(gameLoop);
  }

  init();
})();
