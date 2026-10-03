(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TimeGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MODES = {
    past: { name: '过去', cost: 2, hint: '立即生效，加一道封签' },
    now: { name: '现在', cost: 1, hint: '立即生效，随时可被改变' },
    progress: { name: '正在', cost: 0, hint: '下回合完成，中途可能被打断' },
    future: { name: '未来', cost: 0, hint: '下回合兑现，成功恢复信用' },
    condition: { name: '如果', cost: 0, hint: '下回合检查条件，再尝试行动' }
  };
  const ACTIONS = {
    repair: { name: '修桥', object: 'bridge', value: 'good', phrase: '把桥修好', ongoing: '修桥' },
    break: { name: '拆桥', object: 'bridge', value: 'broken', phrase: '把桥拆坏', ongoing: '拆桥' },
    open: { name: '开门', object: 'door', value: 'open', phrase: '把门打开', ongoing: '开门' },
    close: { name: '关门', object: 'door', value: 'closed', phrase: '把门关上', ongoing: '关门' },
    take: { name: '拿钥匙', object: 'key', value: 'self', phrase: '把钥匙拿到自己手里', ongoing: '拿钥匙' },
    hide: { name: '藏钥匙', object: 'key', value: 'pot', phrase: '把钥匙藏进花盆', ongoing: '藏钥匙' }
  };
  const OBJECTS = { bridge: '桥', door: '门', key: '钥匙' };
  const HOUSE = {
    cap: '以后都把信用上限设为 4。',
    reward: '以后都让兑现承诺领取 2 信用。',
    rest: '以后都让休息领取 2 信用。'
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  const player = s => s.players[s.current];
  const desired = (action, who) => ACTIONS[action].value === 'self' ? who : ACTIONS[action].value;
  function log(s, text, kind = 'event', who = s.current) {
    s.logs.push({ round: s.round, who, text, kind });
    if (s.logs.length > 200) s.logs.shift();
    s.notices.push(text);
  }
  function credit(s, who, delta) {
    s.players[who].credit = Math.max(0, Math.min(s.house.cap, s.players[who].credit + delta));
  }
  function createGame(names = ['玩家 A', '玩家 B'], first = 0, houseEnabled = false) {
    if (!Array.isArray(names) || names.length < 2 || names.length > 4) throw Error('请选择 2 至 4 位玩家。');
    if (!Number.isInteger(first) || first < 0 || first >= names.length) throw Error('先手玩家不存在。');
    return {
      schema: 1, players: names.map((name, id) => ({ id, name: String(name).trim().slice(0, 14) || `玩家 ${'ABCD'[id]}`, credit: 2, pending: null })),
      world: { bridge: 'broken', door: 'closed', key: 'pot' },
      seals: { bridge: null, door: null, key: null }, current: first, first, round: 1, turns: 0,
      phase: 'act', winner: null, vote: null, logs: [], notices: ['桥坏了，门关着，钥匙藏在花盆里。故事从这里开始。'],
      house: { enabled: Boolean(houseEnabled), used: false, kind: null, pending: null, cap: 3, reward: 1, rest: 1 }
    };
  }
  function validCondition(s, c) {
    if (!c || typeof c.not !== 'boolean') return false;
    if (c.object === 'bridge') return ['good', 'broken'].includes(c.value);
    if (c.object === 'door') return ['open', 'closed'].includes(c.value);
    return c.object === 'key' && (c.value === 'pot' || Number.isInteger(c.value) && c.value >= 0 && c.value < s.players.length);
  }
  function conditionText(s, c) {
    if (!validCondition(s, c)) return '桥还是坏的';
    const text = c.object === 'bridge' ? `桥是${c.value === 'good' ? '好的' : '坏的'}`
      : c.object === 'door' ? `门是${c.value === 'open' ? '开着的' : '关着的'}`
      : c.value === 'pot' ? '钥匙在花盆里' : `钥匙在${s.players[c.value].name}手里`;
    return c.not ? `并非“${text}”` : text;
  }
  function sentence(s, mode, action, condition) {
    if (mode === 'rest') return '我先想一想。';
    const a = ACTIONS[action];
    if (!a) return '';
    if (mode === 'past') return `我昨天已经${a.phrase}了。`;
    if (mode === 'now') return `我现在${a.phrase}。`;
    if (mode === 'progress') return `我正在${a.ongoing}。`;
    if (mode === 'future') return `我下回合会${a.phrase}。`;
    if (mode === 'condition') return `如果下回合开始时${conditionText(s, condition)}，我就${a.phrase}。`;
    return '';
  }
  function requirements(s, action, who, base = 0) {
    const a = ACTIONS[action];
    const seal = s.seals[a.object];
    const cost = base + (seal === null ? 0 : 1);
    if (s.world[a.object] === desired(action, who)) return { allowed: false, cost: 0, reason: '这个结果已经成立了，换一个动作试试。', satisfied: true };
    if (['open', 'hide'].includes(action) && s.world.key !== who) return { allowed: false, cost, reason: '要做这个动作，生效时钥匙必须在你手里。' };
    if (s.players[who].credit < cost) return { allowed: false, cost, reason: `需要 ${cost} 信用，你现在有 ${s.players[who].credit}。可以先休息，或选择延迟句式。` };
    return { allowed: true, cost, reason: seal === null ? '' : `目标上有 ${s.players[seal].name} 的封签，额外支付 1 信用。` };
  }
  function preview(s, move) {
    if (s.phase !== 'act') return { allowed: false, cost: 0, reason: '请先完成当前回合。' };
    if (move.mode === 'rest') return { allowed: true, cost: 0, reason: `休息领取 ${s.house.rest} 信用，上限 ${s.house.cap}。` };
    if (!Object.hasOwn(MODES, move.mode) || !Object.hasOwn(ACTIONS, move.action)) return { allowed: false, cost: 0, reason: '请选择一种句式和一个动作。' };
    if (move.mode === 'condition' && !validCondition(s, move.condition)) return { allowed: false, cost: 0, reason: '请选一个明确的条件。' };
    if (['past', 'now'].includes(move.mode)) return requirements(s, move.action, s.current, MODES[move.mode].cost);
    let reason = '现在不花信用；到你下回合开始时结算。';
    if (['open', 'hide'].includes(move.action)) reason += '届时你需要持有钥匙。';
    if (s.seals[ACTIONS[move.action].object] !== null) reason += '届时若封签仍在，需要额外 1 信用。';
    if (s.round === 8) reason = '这是最后一轮。这句话可以留下，但本局不会再结算它。';
    return { allowed: true, cost: 0, reason };
  }
  function change(s, action, who, base = 0, sealed = false) {
    const check = requirements(s, action, who, base);
    if (!check.allowed) return check;
    const object = ACTIONS[action].object;
    credit(s, who, -check.cost);
    s.world[object] = desired(action, who);
    s.seals[object] = sealed ? who : null;
    for (const p of s.players) {
      if (p.pending && p.pending.mode === 'progress' && ACTIONS[p.pending.action].object === object && !p.pending.cancelled) {
        p.pending.cancelled = true;
        log(s, `${p.name}的“正在${ACTIONS[p.pending.action].ongoing}”被打断了。`, 'cancel', p.id);
      }
    }
    return check;
  }
  function hasWon(s, who) { return s.world.bridge === 'good' && s.world.door === 'open' && s.world.key === who; }
  function finish(s) {
    s.turns += 1;
    if (hasWon(s, s.current)) {
      s.phase = 'finished'; s.winner = s.current;
      log(s, `${player(s).name}的三个目标同时成立，获胜！`, 'win');
    } else if (s.turns >= s.players.length * 8) {
      s.phase = 'finished';
      log(s, '八轮结束，本局平局。尚未到期的句子留在时间里。', 'draw');
    } else s.phase = 'handoff';
    return s;
  }
  function applyMove(state, move) {
    const check = preview(state, move);
    if (!check.allowed) throw Error(check.reason);
    const s = clone(state), who = s.current, p = player(s);
    s.notices = [];
    const text = String(move.sentence || sentence(s, move.mode, move.action, move.condition)).trim().slice(0, 240);
    log(s, `“${text}”`, 'sentence');
    if (move.mode === 'rest') {
      credit(s, who, s.house.rest);
      log(s, `${p.name}休息，信用变为 ${p.credit}。`);
    } else if (['past', 'now'].includes(move.mode)) {
      const result = change(s, move.action, who, MODES[move.mode].cost, move.mode === 'past');
      log(s, `${p.name}${ACTIONS[move.action].name}，支付 ${result.cost} 信用${move.mode === 'past' ? '，并放下封签' : ''}。`);
    } else {
      p.pending = { mode: move.mode, action: move.action, condition: move.mode === 'condition' ? clone(move.condition) : null, sentence: text, cancelled: false, round: s.round };
      log(s, `${p.name}留下${MODES[move.mode].name === '未来' ? '承诺' : MODES[move.mode].name === '正在' ? '进行中的动作' : '一个条件'}，下回合开始时结算。`);
    }
    return finish(s);
  }
  function nextTurn(state) {
    if (state.phase !== 'handoff') throw Error('当前还不能交接回合。');
    const s = clone(state);
    s.current = (s.current + 1) % s.players.length;
    s.round = Math.floor(s.turns / s.players.length) + 1;
    s.phase = 'act'; s.notices = [];
    if (s.house.pending && s.house.pending.round <= s.round) {
      const kind = s.house.pending.kind;
      s.house.kind = kind; s.house[kind] = kind === 'cap' ? 4 : 2; s.house.pending = null;
      log(s, `新桌规生效：${HOUSE[kind]}`, 'rule');
    }
    for (const object of Object.keys(s.seals)) {
      if (s.seals[object] === s.current) {
        s.seals[object] = null;
        log(s, `${OBJECTS[object]}上的${player(s).name}封签到期了。`);
      }
    }
    const p = player(s), pending = p.pending;
    p.pending = null;
    if (pending) {
      if (pending.cancelled) log(s, `${p.name}的进行动作已被打断，移除待办。`, 'cancel');
      else if (pending.mode === 'condition' && ((s.world[pending.condition.object] === pending.condition.value) === pending.condition.not)) {
        log(s, `${p.name}的条件不成立，移除待办。`);
      } else {
        const result = change(s, pending.action, s.current);
        const success = result.allowed || result.satisfied;
        if (pending.mode === 'future') credit(s, s.current, success ? s.house.reward : -1);
        const outcome = success ? result.satisfied ? '目标已经成立' : `${ACTIONS[pending.action].name}完成${result.cost ? '，为封签支付 1 信用' : ''}` : `未能完成：${result.reason}`;
        log(s, `${p.name}的${MODES[pending.mode].name}句子到期，${outcome}${pending.mode === 'future' ? `；${success ? '兑现' : '失约'}后信用为 ${p.credit}` : ''}。`, success ? 'resolve' : 'cancel');
      }
    }
    return s;
  }
  function proposeRule(state, kind) {
    if (state.phase !== 'act' || !state.house.enabled || state.house.used || !Object.hasOwn(HOUSE, kind)) throw Error('本回合不能提出这条桌规。');
    const s = clone(state);
    s.notices = []; s.phase = 'vote';
    s.vote = { kind, voters: Array.from({ length: s.players.length - 1 }, (_, i) => (s.current + i + 1) % s.players.length), index: 0 };
    log(s, `${player(s).name}提议：“${HOUSE[kind]}”`, 'rule');
    return s;
  }
  function voteRule(state, yes) {
    if (state.phase !== 'vote' || typeof yes !== 'boolean') throw Error('当前没有待表决的桌规。');
    const s = clone(state), vote = s.vote;
    log(s, `${s.players[vote.voters[vote.index]].name}${yes ? '同意' : '不同意'}提案。`, 'rule', vote.voters[vote.index]);
    if (!yes) {
      credit(s, s.current, s.house.rest);
      s.vote = null;
      log(s, `提案未通过，${player(s).name}按休息结算，信用为 ${player(s).credit}。`);
      return finish(s);
    }
    vote.index += 1;
    if (vote.index < vote.voters.length) return s;
    s.house.used = true;
    s.house.pending = { kind: vote.kind, round: s.round + 1 };
    s.vote = null;
    log(s, '全员同意，桌规从下一轮开始生效。', 'rule');
    return finish(s);
  }
  function isValidState(s) {
    try {
      const ids = value => Number.isInteger(value) && value >= 0 && value < s.players.length;
      if (s.schema !== 1 || !Array.isArray(s.players) || s.players.length < 2 || s.players.length > 4) return false;
      if (!ids(s.current) || !ids(s.first) || !['act', 'handoff', 'vote', 'finished'].includes(s.phase)) return false;
      if (!Number.isInteger(s.round) || s.round < 1 || s.round > 8 || !Number.isInteger(s.turns) || s.turns < 0 || s.turns > s.players.length * 8) return false;
      if (!['good', 'broken'].includes(s.world.bridge) || !['open', 'closed'].includes(s.world.door) || !(s.world.key === 'pot' || ids(s.world.key))) return false;
      if (!['bridge', 'door', 'key'].every(k => s.seals[k] === null || ids(s.seals[k]))) return false;
      if (!s.house || ![3, 4].includes(s.house.cap) || ![1, 2].includes(s.house.reward) || ![1, 2].includes(s.house.rest) || typeof s.house.enabled !== 'boolean' || typeof s.house.used !== 'boolean') return false;
      if (s.house.pending && (!Object.hasOwn(HOUSE, s.house.pending.kind) || !Number.isInteger(s.house.pending.round))) return false;
      if (s.house.kind !== null && !Object.hasOwn(HOUSE, s.house.kind)) return false;
      if (!s.players.every((p, i) => p.id === i && typeof p.name === 'string' && p.name.length <= 14 && Number.isInteger(p.credit) && p.credit >= 0 && p.credit <= s.house.cap && (!p.pending || ['progress', 'future', 'condition'].includes(p.pending.mode) && Object.hasOwn(ACTIONS, p.pending.action) && typeof p.pending.sentence === 'string' && typeof p.pending.cancelled === 'boolean' && (p.pending.mode !== 'condition' || validCondition(s, p.pending.condition))))) return false;
      if (!Array.isArray(s.logs) || s.logs.length > 200 || !s.logs.every(l => typeof l.text === 'string' && ids(l.who) && Number.isInteger(l.round))) return false;
      if (!Array.isArray(s.notices) || !s.notices.every(n => typeof n === 'string') || !(s.winner === null || ids(s.winner))) return false;
      if (s.phase === 'vote' && (!s.vote || !Object.hasOwn(HOUSE, s.vote.kind) || !Array.isArray(s.vote.voters) || !s.vote.voters.length || !s.vote.voters.every(ids) || !Number.isInteger(s.vote.index) || !ids(s.vote.voters[s.vote.index]))) return false;
      return true;
    } catch { return false; }
  }
  return { MODES, ACTIONS, OBJECTS, HOUSE, createGame, preview, sentence, conditionText, applyMove, nextTurn, proposeRule, voteRule, hasWon, isValidState };
});
