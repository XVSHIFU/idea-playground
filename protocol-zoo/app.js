(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const moth = new ProtocolZoo.Moth();
  const log = $('log');
  let mode = 'connected', busy = false, session = 1, started = performance.now(), packetCount = 0;
  let records = [], tasks = [], predictionTask = null;
  function later(callback, delay) {
    const task = { callback, remaining: delay, due: performance.now() + delay, timer: null };
    const fire = () => { tasks = tasks.filter(t => t !== task); callback(); };
    task.fire = fire;
    if (mode !== 'paused') task.timer = setTimeout(fire, delay);
    tasks.push(task);
    return task;
  }
  function cancel(task) { if (!task) return; clearTimeout(task.timer); tasks = tasks.filter(t => t !== task); }
  function cancelAll() { tasks.forEach(t => clearTimeout(t.timer)); tasks = []; predictionTask = null; busy = false; }
  function stamp(ms) { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor(ms % 1000)).padStart(3, '0')}`; }
  function append(direction, bytes, tag = '') {
    const nearBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 55;
    $('empty')?.remove();
    const elapsed = performance.now() - started;
    records.push({ elapsed: Math.round(elapsed), direction, bytes, tag });
    const row = document.createElement('div'); row.className = `entry ${direction}${tag === '主动信号' ? ' proactive' : ''}`;
    const time = document.createElement('time'); time.textContent = stamp(elapsed);
    const from = document.createElement('span'); from.className = 'direction'; from.textContent = direction === 'tx' ? 'TX →' : direction === 'rx' ? 'RX ←' : '—';
    const content = document.createElement('span'); content.className = 'payload';
    const payload = document.createElement(direction === 'system' ? 'span' : 'code'); payload.textContent = bytes; content.append(payload);
    if (tag) { const label = document.createElement('span'); label.className = 'tag'; label.textContent = tag; content.append(label); }
    row.append(time, from, content); log.append(row);
    if (direction !== 'system') packetCount++;
    $('packet-count').textContent = `${packetCount} 个字节包`;
    // Bound DOM work while retaining the full transcript for export.
    if (log.children.length > 400) log.firstElementChild.remove();
    if (nearBottom || direction === 'tx') { log.scrollTop = log.scrollHeight; $('latest').hidden = true; }
    else $('latest').hidden = false;
  }
  function render() {
    const unavailable = mode !== 'connected' || busy;
    $('send').disabled = unavailable; $('bytes').disabled = mode !== 'connected';
    document.querySelectorAll('[data-byte]').forEach(b => b.disabled = unavailable);
    $('pause').disabled = mode === 'resting'; $('pause').textContent = mode === 'paused' ? '继续通信' : '暂停';
    $('rest').textContent = mode === 'resting' ? '重新连接' : '让它休息';
    $('status').textContent = mode === 'paused' ? '已暂停' : mode === 'resting' ? '休息中' : '已连接';
    $('status-light').classList.toggle('inactive', mode !== 'connected');
    $('session-hint').textContent = mode === 'paused' ? '通信计时已冻结，继续后接上。' : mode === 'resting' ? '线路已断开，这次形成的习惯仍然保留。' : busy ? '信号已发出。' : '你可以发送，也可以等待。';
  }
  function send(raw) {
    if (mode !== 'connected' || busy) return;
    let result;
    try { result = moth.receive(raw); }
    catch (error) { $('input-error').textContent = error.message; $('bytes').setAttribute('aria-invalid', 'true'); $('bytes').focus(); return; }
    $('input-error').textContent = ''; $('bytes').removeAttribute('aria-invalid'); $('bytes').value = '';
    cancel(predictionTask); predictionTask = null;
    append('tx', result.bytes); busy = true; render();
    later(() => {
      append('rx', result.reply); busy = false; render();
      if (result.prediction) predictionTask = later(() => { predictionTask = null; append('rx', moth.predict(result.prediction), '主动信号'); }, 1150);
    }, result.delay);
  }
  $('send-form').addEventListener('submit', event => { event.preventDefault(); send($('bytes').value); });
  document.querySelectorAll('[data-byte]').forEach(button => button.addEventListener('click', () => send(button.dataset.byte)));
  $('bytes').addEventListener('input', () => { $('input-error').textContent = ''; $('bytes').removeAttribute('aria-invalid'); });
  $('pause').addEventListener('click', () => {
    if (mode === 'resting') return;
    if (mode === 'paused') {
      mode = 'connected'; tasks.forEach(t => { t.due = performance.now() + t.remaining; t.timer = setTimeout(t.fire, t.remaining); });
      append('system', '继续通信');
    } else {
      mode = 'paused'; tasks.forEach(t => { clearTimeout(t.timer); t.remaining = Math.max(0, t.due - performance.now()); });
      append('system', '通信已暂停');
    }
    render();
  });
  $('rest').addEventListener('click', () => {
    if (mode !== 'resting') { cancelAll(); moth.rest(); mode = 'resting'; append('system', '连接关闭 · 休息'); }
    else {
      mode = 'connected'; append('system', '连接恢复');
      const opening = moth.reconnect();
      if (opening.length) {
        busy = true;
        opening.forEach((bytes, i) => later(() => { append('rx', bytes, '重连信号'); if (i === opening.length - 1) { busy = false; render(); } }, 500 + i * 420));
      }
    }
    render();
  });
  $('reset').addEventListener('click', () => $('reset-dialog').showModal());
  $('reset-dialog').addEventListener('close', () => {
    if ($('reset-dialog').returnValue !== 'reset') return;
    cancelAll(); moth.reset(); mode = 'connected'; records = []; packetCount = 0; started = performance.now(); session++;
    log.replaceChildren(); $('notes').value = ''; $('note-count').textContent = '0 字'; $('bytes').value = ''; $('input-error').textContent = ''; $('bytes').removeAttribute('aria-invalid'); $('latest').hidden = true;
    $('session-number').textContent = String(session).padStart(3, '0');
    append('system', '新会话已连接 · 发送一个字节开始'); render(); $('bytes').focus();
  });
  $('notes').addEventListener('input', () => $('note-count').textContent = `${Array.from($('notes').value).length} 字`);
  $('help-toggle').addEventListener('click', () => { $('help').hidden = !$('help').hidden; $('help-toggle').setAttribute('aria-expanded', String(!$('help').hidden)); });
  $('latest').addEventListener('click', () => { log.scrollTop = log.scrollHeight; $('latest').hidden = true; });
  log.addEventListener('scroll', () => { if (log.scrollHeight - log.scrollTop - log.clientHeight < 55) $('latest').hidden = true; });
  $('export').addEventListener('click', () => {
    const body = ['协议动物园 / MOTH/0', `SESSION ${String(session).padStart(3, '0')}`, '', ...records.map(r => `${stamp(r.elapsed)}  ${r.direction.toUpperCase().padEnd(6)} ${r.bytes}${r.tag ? `  [${r.tag}]` : ''}`), '', '观察手记', $('notes').value || '（尚无笔记）'].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', body], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `protocol-zoo-session-${session}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
})();
