(() => {
  'use strict';
  const E = window.TimeGame;
  const $ = id => document.getElementById(id);
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const storageKey = 'grammar-time-board.v1';
  let game = E.createGame(), storageAvailable = true, restored = false, saveMessage = '';
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (E.isValidState(saved)) { game = saved; restored = true; }
      else saveMessage = '旧进度无法读取，已准备新的一局。';
    }
  } catch { storageAvailable = false; saveMessage = '无法读取本机进度，这一局仍可正常游玩。'; }
  let mode = 'now', action = 'repair';
  let condition = { object: 'bridge', value: 'broken', not: false };
  let previousWorld = null;
  const letters = 'ABCD';
  const svg = paths => `<svg viewBox="0 0 200 100" aria-hidden="true">${paths}</svg>`;
  const drawings = {
    bridge(good) {
      return svg(good
        ? '<path d="M20 64h160M25 56h150M33 64v17m134-17v17M52 81V64m96 17V64M52 80c4-38 92-38 96 0M20 86h160"/><path d="M40 48v8m24-8v8m24-8v8m24-8v8m24-8v8m24-8v8"/>'
        : '<path d="M20 64h56l10-11m28 0 10 11h56M25 56h50m50 0h50M33 64v17m134-17v17M52 81V64m96 17V64M20 86h160"/><path d="m88 67 8 6-6 7m18-20-8-5" stroke="var(--red)"/><path d="M40 48v8m24-8v8m72-8v8m24-8v8"/>');
    },
    door(open) {
      return svg(open
        ? '<path d="M67 87V16h66v71M60 87h80M73 82V22h54v60"/><path d="M79 81V28h10v53z" fill="var(--wash)"/><path d="M111 39v30m-6-5 6 5 6-5" stroke="var(--red)"/>'
        : '<path d="M67 87V16h66v71M60 87h80M73 82V22h54v60z"/><path d="M82 32h35v18H82zm0 28h35v14H82z" stroke-width="1.3"/><circle cx="119" cy="56" r="2" fill="currentColor"/>');
    },
    key(held) {
      return svg(`<circle cx="69" cy="44" r="17"/><circle cx="69" cy="44" r="7"/><path d="M86 44h59v8h-9v9h-10V51h-10v-7"/>${held ? '<path d="m84 80 10 6 20-17" stroke="var(--red)"/>' : '<path d="M68 78h64m-57 0 5 13h41l5-13" stroke="var(--muted)" stroke-width="1.5"/>'}`);
    }
  };
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(game)); storageAvailable = true; }
    catch { storageAvailable = false; }
    updateSaveStatus();
  }
  function updateSaveStatus() {
    $('save-status').textContent = storageAvailable ? '回合进度自动保存在当前浏览器' : '本次无法保存进度，关闭页面后会丢失';
  }
  function activeId() { return game.phase === 'vote' ? game.vote.voters[game.vote.index] : game.current; }
  function nextId() { return (game.current + 1) % game.players.length; }
  function getMove() { return { mode, action, condition, sentence: $('sentence').value.trim() }; }
  function resetDraft() {
    mode = 'now'; action = 'repair';
    condition = { object: 'bridge', value: 'broken', not: false };
    if (game.world.bridge === 'good') action = game.world.key !== game.current ? 'take' : game.world.door === 'closed' ? 'open' : 'close';
    $('condition-not').checked = false;
    populateConditions();
    $('sentence').value = E.sentence(game, mode, action, condition);
    $('form-error').hidden = true;
  }
  function populateConditions() {
    const options = [
      ['bridge:broken', '桥是坏的'], ['bridge:good', '桥是好的'],
      ['door:closed', '门关着'], ['door:open', '门开着'], ['key:pot', '钥匙在花盆里'],
      ...game.players.map(p => [`key:${p.id}`, `钥匙在${p.name}手里`])
    ];
    $('condition-select').innerHTML = options.map(([v, label]) => `<option value="${v}">${escape(label)}</option>`).join('');
    $('condition-select').value = `${condition.object}:${condition.value}`;
  }
  function preview() {
    for (const button of $('mode-options').children) button.setAttribute('aria-pressed', button.dataset.mode === mode);
    for (const button of $('action-options').children) button.setAttribute('aria-pressed', button.dataset.action === action);
    $('condition-fields').hidden = mode !== 'condition';
    $('mode-hint').textContent = E.MODES[mode].hint;
    const result = E.preview(game, getMove());
    const immediate = ['past', 'now'].includes(mode);
    const heading = immediate ? `现在支付 ${result.cost} 信用 · ${E.ACTIONS[action].name}` : `留下一个${mode === 'future' ? '承诺' : mode === 'condition' ? '条件' : '进行动作'} · 现在免费`;
    const detail = result.reason || (mode === 'past' ? '世界立即改变，加上你的封签。其他人改变它需要多付 1 信用。' : '世界立即改变，这个结果可以被后来的句子改写。');
    $('move-summary').classList.toggle('invalid', !result.allowed);
    $('move-summary').innerHTML = `<strong>${escape(heading)}</strong><p>${escape(detail)}</p>`;
    $('commit').disabled = !result.allowed || !$('sentence').value.trim();
    $('rest').textContent = `先想一想，休息恢复 ${game.house.rest} 信用`;
    $('house-proposal').hidden = !game.house.enabled || game.house.used;
  }
  function renderPlayers() {
    $('round-label').textContent = `第 ${game.round} 轮`;
    $('round-marks').innerHTML = Array.from({ length: 8 }, (_, i) => `<i class="${i < game.round ? 'done' : ''}"></i>`).join('');
    $('players').style.setProperty('--player-count', game.players.length);
    $('players').className = `players ${game.players.length === 4 ? 'four' : game.players.length === 3 ? 'three' : 'two'}`;
    $('players').innerHTML = game.players.map(p => `<div class="player ${p.id === activeId() ? 'active' : ''}" ${p.id === activeId() ? 'aria-current="true"' : ''}>
      <span class="player-letter" aria-hidden="true">${letters[p.id]}</span><div class="player-info"><strong>${escape(p.name)}</strong><div class="player-meta"><span class="credit-coins" aria-hidden="true">${Array.from({ length: game.house.cap }, (_, i) => `<i class="${i < p.credit ? 'filled' : ''}"></i>`).join('')}</span><span>${p.credit} 信用</span></div></div><span class="player-cue">${game.winner === p.id ? '获胜' : p.id === activeId() ? game.phase === 'vote' ? '表决中' : '当前回合' : game.world.key === p.id ? '持有钥匙' : ''}</span></div>`).join('');
  }
  function renderWorld() {
    const who = activeId();
    const goals = { bridge: game.world.bridge === 'good', door: game.world.door === 'open', key: game.world.key === who };
    $('goal-summary').textContent = `${game.players[who].name}的目标 · ${Object.values(goals).filter(Boolean).length} / 3`;
    $('bridge-state').textContent = goals.bridge ? '桥已经修好' : '桥还坏着';
    $('door-state').textContent = goals.door ? '门开着' : '门关着';
    $('key-state').textContent = game.world.key === 'pot' ? '钥匙在花盆里' : `在${game.players[game.world.key].name}手里`;
    $('bridge-drawing').innerHTML = drawings.bridge(goals.bridge);
    $('door-drawing').innerHTML = drawings.door(goals.door);
    $('key-drawing').innerHTML = drawings.key(game.world.key !== 'pot');
    for (const object of Object.keys(goals)) {
      $(`${object}-check`).textContent = goals[object] ? '已达成' : '未达成';
      $(`${object}-check`).classList.toggle('reached', goals[object]);
      const seal = game.seals[object];
      $(`${object}-seal`).textContent = seal === null ? '' : `${letters[seal]} 的封签 · 改变额外付 1`;
      const article = document.querySelector(`[data-object="${object}"]`);
      article.classList.remove('changed');
      if (previousWorld && previousWorld[object] !== game.world[object]) {
        void article.offsetWidth;
        article.classList.add('changed');
      }
    }
    previousWorld = { ...game.world };
  }
  function pendingHTML(p) {
    const pending = p.pending;
    return `<div class="pending ${pending.cancelled ? 'cancelled' : ''}"><span class="pending-owner">${escape(p.name)}</span><p>${escape(pending.sentence)}</p><small>${pending.cancelled ? '已被打断，下回合移除' : `等待${escape(p.name)}的下个回合`}</small></div>`;
  }
  function renderTracks() {
    const seals = Object.entries(game.seals).filter(([, owner]) => owner !== null);
    $('past-track').innerHTML = seals.length ? seals.map(([object, owner]) => `<div class="pending"><span class="pending-owner">${escape(game.players[owner].name)}的封签</span><p>${E.OBJECTS[object]}的现状受保护</p><small>改变它额外支付 1 信用</small></div>`).join('') : '<p class="track-empty">已发生的事，也能被改写。这里留下短暂的封签。</p>';
    const empties = { progress: '一件正在做的事。没人改变目标，它就能完成。', future: '一句尚未兑现的话。未来会记得你的承诺。', condition: '先留一个条件，让下个回合的世界给出答案。' };
    for (const m of ['progress', 'future', 'condition']) {
      const pending = game.players.filter(p => p.pending?.mode === m);
      $(`${m}-track`).innerHTML = pending.length ? pending.map(pendingHTML).join('') : `<p class="track-empty">${empties[m]}</p>`;
    }
    $('house-status').hidden = !game.house.used;
    if (game.house.used) $('house-status').textContent = game.house.pending ? `${E.HOUSE[game.house.pending.kind]}（第 ${game.house.pending.round} 轮生效${game.house.pending.round > 8 ? '，本局将先结束' : ''}）` : `桌规已生效：${E.HOUSE[game.house.kind]}`;
  }
  function renderJournal() {
    $('journal-count').textContent = game.logs.length ? `${game.logs.filter(l => l.kind === 'sentence').length} 句话 · 查看记录` : '还没有人开口';
    $('journal').innerHTML = [...game.logs].reverse().map(item => `<li class="${escape(item.kind)}"><small>第 ${item.round} 轮 · ${escape(game.players[item.who].name)}</small>${escape(item.text)}</li>`).join('');
  }
  function renderTurn() {
    const p = game.players[activeId()];
    $('turn-stamp').textContent = letters[p.id];
    $('turn-heading').textContent = game.phase === 'act' ? `轮到${p.name}说一句` : game.phase === 'vote' ? `请${p.name}表决` : game.phase === 'finished' ? '故事暂时落笔' : `${p.name}已经说完`;
    $('turn-subtitle').textContent = game.phase === 'act' ? '选一种句式，再决定改变什么。' : game.phase === 'vote' ? '一条新桌规，需要每个人同意。' : game.phase === 'finished' ? '每句话，都在世界里留下了痕迹。' : '把这一回合交给下一位。';
    $('move-form').hidden = game.phase !== 'act';
    $('turn-result').hidden = game.phase === 'act';
    if (game.phase === 'act') { preview(); return; }
    if (game.phase === 'vote') {
      $('turn-result').innerHTML = `<p class="result-title">以后都……</p><p class="result-quote">${escape(E.HOUSE[game.vote.kind])}</p><p>${escape(p.name)}，你同意这条规则吗？<br>全部同意后，从下一轮开始生效。</p><div class="vote-buttons"><button class="primary-button" data-result="yes">我同意</button><button class="outline-button" data-result="no">这次不同意</button></div>`;
    } else if (game.phase === 'finished') {
      const won = game.winner !== null;
      $('turn-result').innerHTML = `<p class="result-title">${won ? `${escape(game.players[game.winner].name)}，<br>你让它们成真了。` : '八轮过去，<br>故事没有唯一结局。'}</p>${won ? '<ul class="result-goals"><li><span>✓</span>桥已经修好</li><li><span>✓</span>门开着</li><li><span>✓</span>钥匙在你手里</li></ul>' : '<p>本局平局。未来留下的话，不再额外结算。换一位先手，再试一种说法。</p>'}<button class="primary-button" data-result="restart">再开一局 <span aria-hidden="true">→</span></button>`;
    } else {
      const last = [...game.logs].reverse().find(item => item.kind === 'sentence' && item.who === game.current && item.round === game.round);
      $('turn-result').innerHTML = `<p class="result-title">话已落下。</p>${last ? `<p class="result-quote">${escape(last.text)}</p>` : ''}<p>此刻的世界与尚未生效的句子，都已记在棋盘上。下一位准备好后，开始自己的回合。</p><button class="primary-button" data-result="next">交给${escape(game.players[nextId()].name)} <span aria-hidden="true">→</span></button><p class="handoff-note">进入下一回合时，自动移除到期封签并结算待办。</p>`;
    }
  }
  function render() {
    renderPlayers(); renderWorld(); renderTracks(); renderJournal(); renderTurn(); updateSaveStatus();
    const notices = game.notices.filter(n => !n.startsWith('“')).slice(-3);
    $('announcement').innerHTML = notices.map(n => `<p>${escape(n)}</p>`).join('');
  }
  function perform(operation, reset = false) {
    try {
      game = operation();
      if (reset) resetDraft();
      save(); render();
      $('composer').focus({ preventScroll: true });
      if (matchMedia('(max-width:800px)').matches) $('composer').scrollIntoView({ behavior: 'instant', block: 'start' });
    } catch (error) {
      $('form-error').textContent = error.message;
      $('form-error').hidden = false;
    }
  }
  $('mode-options').innerHTML = Object.entries(E.MODES).map(([id, data]) => `<button type="button" class="mode-button" data-mode="${id}" aria-pressed="false">${data.name}</button>`).join('');
  $('action-options').innerHTML = Object.entries(E.ACTIONS).map(([id, data]) => `<button type="button" class="action-button" data-action="${id}" aria-pressed="false">${data.name}</button>`).join('');
  $('mode-options').addEventListener('click', event => {
    const button = event.target.closest('[data-mode]');
    if (!button || game.phase !== 'act') return;
    mode = button.dataset.mode;
    $('sentence').value = E.sentence(game, mode, action, condition);
    $('form-error').hidden = true; preview();
  });
  $('action-options').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || game.phase !== 'act') return;
    action = button.dataset.action;
    $('sentence').value = E.sentence(game, mode, action, condition);
    $('form-error').hidden = true; preview();
  });
  function changeCondition() {
    const [object, rawValue] = $('condition-select').value.split(':');
    condition = { object, value: object === 'key' && rawValue !== 'pot' ? Number(rawValue) : rawValue, not: $('condition-not').checked };
    $('sentence').value = E.sentence(game, mode, action, condition); preview();
  }
  $('condition-select').addEventListener('change', changeCondition);
  $('condition-not').addEventListener('change', changeCondition);
  $('sentence').addEventListener('input', preview);
  $('restore-sentence').addEventListener('click', () => { $('sentence').value = E.sentence(game, mode, action, condition); preview(); });
  $('commit').addEventListener('click', () => {
    if (!$('sentence').value.trim()) return;
    perform(() => E.applyMove(game, getMove()));
  });
  $('rest').addEventListener('click', () => perform(() => E.applyMove(game, { mode: 'rest' })));
  $('propose').addEventListener('click', () => perform(() => E.proposeRule(game, $('house-kind').value)));
  $('turn-result').addEventListener('click', event => {
    const intent = event.target.closest('[data-result]')?.dataset.result;
    if (intent === 'next') perform(() => E.nextTurn(game), true);
    if (intent === 'restart') openSetup();
    if (intent === 'yes' || intent === 'no') perform(() => E.voteRule(game, intent === 'yes'));
  });
  $('rules-toggle').addEventListener('click', () => {
    $('rules').hidden = !$('rules').hidden;
    $('rules-toggle').setAttribute('aria-expanded', String(!$('rules').hidden));
  });
  let setupNames = game.players.map(p => p.name);
  function fillFirstPlayers(preferred = 0) {
    $('first-player').innerHTML = [...$('player-names').querySelectorAll('input')].map((input, i) => `<option value="${i}">${escape(input.value.trim() || `玩家 ${letters[i]}`)}</option>`).join('');
    $('first-player').value = preferred < Number($('player-count').value) ? String(preferred) : '0';
  }
  function setupFields() {
    const first = Number($('first-player').value || 0);
    for (const input of $('player-names').querySelectorAll('input')) setupNames[Number(input.dataset.player)] = input.value;
    $('player-names').innerHTML = Array.from({ length: Number($('player-count').value) }, (_, i) => `<label for="name-${i}">玩家 ${letters[i]} 的名字<input id="name-${i}" data-player="${i}" maxlength="14" value="${escape(setupNames[i] || `玩家 ${letters[i]}`)}" autocomplete="off"></label>`).join('');
    fillFirstPlayers(first);
  }
  function openSetup() {
    setupNames = game.players.map(p => p.name);
    $('player-count').value = String(game.players.length);
    $('player-names').innerHTML = '';
    setupFields();
    $('first-player').value = String((game.first + 1) % game.players.length);
    $('enable-house').checked = game.house.enabled;
    $('setup-dialog').showModal();
  }
  $('new-game').addEventListener('click', openSetup);
  $('cancel-setup').addEventListener('click', () => $('setup-dialog').close());
  $('player-count').addEventListener('change', setupFields);
  $('player-names').addEventListener('input', () => fillFirstPlayers(Number($('first-player').value)));
  $('setup-form').addEventListener('submit', event => {
    event.preventDefault();
    const names = [...$('player-names').querySelectorAll('input')].map(input => input.value);
    const first = Number($('first-player').value);
    $('setup-dialog').close();
    previousWorld = null;
    perform(() => E.createGame(names, first, $('enable-house').checked), true);
  });
  resetDraft(); render();
  if (saveMessage || restored) $('announcement').insertAdjacentHTML('afterbegin', `<p>${escape(saveMessage || '已接回上一局，时间停在你离开的地方。')}</p>`);
})();
