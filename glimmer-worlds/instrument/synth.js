/* 弦汐 · modal strings, sympathetic light and a small imaginary room. */
(function (global) {
  'use strict';

  const DEFAULTS = Object.freeze({ tide: 0.58, light: 0.48, space: 0.5, drift: 0.22, volume: 0.55, voice: 'silk' });
  const MATERIALS = {
    silk: {
      ratios: [1, 2.002, 3.006, 4.012, 5.02, 6.03, 7.045, 8.06],
      weights: [1, 0.48, 0.28, 0.17, 0.115, 0.08, 0.055, 0.035],
      decay: 2.1, tide: 4.8, attack: 0.007, transient: 0.004
    },
    glass: {
      ratios: [1, 2.006, 2.99, 4.04, 5.43, 6.81, 8.23, 10.31],
      weights: [1, 0.45, 0.30, 0.19, 0.15, 0.11, 0.07, 0.045],
      decay: 2.5, tide: 6.5, attack: 0.0045, transient: 0.002
    },
    wood: {
      ratios: [1, 1.997, 3.98, 5.42, 7.02, 9.18],
      weights: [1, 0.36, 0.17, 0.12, 0.075, 0.04],
      decay: 0.65, tide: 2.3, attack: 0.003, transient: 0.013
    }
  };
  const MAX_POLYPHONY = 32;
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const nextFrame = () => new Promise(resolve => setTimeout(resolve, 0));

  function parameters(base, changes) {
    const result = { ...base };
    if (!changes || typeof changes !== 'object') return result;
    for (const key of ['tide', 'light', 'space', 'drift', 'volume']) {
      if (changes[key] !== undefined && Number.isFinite(Number(changes[key]))) result[key] = clamp(Number(changes[key]), 0, 1);
    }
    if (Object.prototype.hasOwnProperty.call(MATERIALS, changes.voice)) result.voice = changes.voice;
    return result;
  }

  function randomGenerator(seed) {
    let state = (seed >>> 0) || 129785;
    return () => {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }

  function createImpulse(context) {
    const length = Math.ceil(context.sampleRate * 3.4);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    const scale = 1.8 / Math.sqrt(context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      const random = randomGenerator(71053 + channel * 197);
      let memory = 0;
      for (let i = 0; i < length; i++) {
        const time = i / context.sampleRate;
        const noise = random() * 2 - 1;
        memory = memory * 0.42 + noise * 0.58;
        const arrival = clamp((time - 0.018 - channel * 0.004) / 0.07, 0, 1);
        data[i] = memory * scale * Math.exp(-time * 1.85) * arrival;
      }
      // Sparse early reflections locate the resonator before the diffuse tail arrives.
      for (const [time, gain] of [[0.023, 0.19], [0.047, 0.13], [0.079, 0.09], [0.117, 0.055]]) {
        const index = Math.floor((time + channel * 0.007) * context.sampleRate);
        data[index] += gain * (channel ? 0.94 : 1);
      }
    }
    return impulse;
  }

  function createNoise(context) {
    const length = Math.ceil(context.sampleRate * 0.12);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    const random = randomGenerator(810583);
    let previous = 0;
    for (let i = 0; i < length; i++) {
      const sample = random() * 2 - 1;
      data[i] = sample - previous * 0.6; previous = sample;
    }
    return buffer;
  }

  function createGraph(context, volume, recordingDestination = null) {
    const sum = context.createGain();
    const highPass = context.createBiquadFilter(); highPass.type = 'highpass'; highPass.frequency.value = 30; highPass.Q.value = 0.5;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -17; compressor.knee.value = 16; compressor.ratio.value = 3;
    compressor.attack.value = 0.006; compressor.release.value = 0.19;
    const shaper = context.createWaveShaper();
    const curve = new Float32Array(4096);
    for (let i = 0; i < curve.length; i++) { const x = i * 2 / (curve.length - 1) - 1; curve[i] = Math.tanh(x * 1.15) / 1.15; }
    shaper.curve = curve; shaper.oversample = '2x';
    const master = context.createGain(); master.gain.value = volume;
    const analyser = context.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.82;
    sum.connect(highPass); highPass.connect(compressor); compressor.connect(shaper); shaper.connect(master); master.connect(analyser);
    analyser.connect(context.destination);
    if (recordingDestination) analyser.connect(recordingDestination);

    const wetInput = context.createGain();
    const convolver = context.createConvolver(); convolver.normalize = false; convolver.buffer = createImpulse(context);
    const roomTone = context.createBiquadFilter(); roomTone.type = 'lowpass'; roomTone.frequency.value = 6300; roomTone.Q.value = 0.3;
    const wetOutput = context.createGain(); wetOutput.gain.value = 0.9;
    wetInput.connect(convolver); convolver.connect(roomTone); roomTone.connect(wetOutput); wetOutput.connect(sum);

    const echoInput = context.createGain();
    const echo = context.createDelay(1); echo.delayTime.value = 0.193;
    const echoTone = context.createBiquadFilter(); echoTone.type = 'lowpass'; echoTone.frequency.value = 2450; echoTone.Q.value = 0.3;
    const feedback = context.createGain(); feedback.gain.value = 0.19;
    const echoOutput = context.createGain(); echoOutput.gain.value = 0.32;
    echoInput.connect(echo); echo.connect(echoTone); echoTone.connect(feedback); feedback.connect(echo);
    echoTone.connect(echoOutput); echoOutput.connect(sum);

    return {
      sum, highPass, compressor, shaper, master, analyser, wetInput, convolver, roomTone, wetOutput,
      echoInput, echo, echoTone, feedback, echoOutput,
      noise: createNoise(context), meter: new Uint8Array(analyser.fftSize),
      nodes: [sum, highPass, compressor, shaper, master, analyser, wetInput, convolver, roomTone, wetOutput, echoInput, echo, echoTone, feedback, echoOutput]
    };
  }

  function voiceShape(midi, velocity, position, duration, params, sustain) {
    const pitch = clamp(finite(midi, 60), 24, 108);
    const speed = clamp(finite(velocity, 0.7), 0.015, 1);
    const point = clamp(finite(position, 0.5), 0.08, 0.92);
    const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
    const material = MATERIALS[params.voice];
    let ring = (material.decay + material.tide * params.tide) * clamp(Math.sqrt(220 / frequency), 0.8, 1.4);
    if (duration !== null && duration !== undefined && Number.isFinite(Number(duration))) {
      ring = Math.min(ring, Math.max(0.45, Number(duration) * 0.9 + 0.5 + params.tide * 1.6));
    }
    if (sustain) ring *= 1.8;
    ring = clamp(ring, 0.4, 10);
    const length = Math.min(24, ring * 2.5 + 0.12);
    const amplitude = 0.20 * Math.pow(speed, 1.35) * clamp(Math.sqrt(220 / frequency), 0.7, 1.35);
    const weights = material.weights.map((weight, i) => weight * Math.pow(0.28 + 0.9 * params.light, i * 0.44) * (0.48 + 0.52 * Math.abs(Math.sin(Math.PI * (i + 1) * point))));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return { midi: pitch, velocity: speed, position: point, frequency, material, ring, length, amplitude, weights: weights.map(weight => weight / total) };
  }

  function scheduleVoice(context, graph, id, midi, velocity, position, start, duration, params, overrides, sustain, ended) {
    const shape = voiceShape(midi, velocity, position, duration, params, sustain);
    const finish = start + shape.length;
    const output = context.createGain();
    output.gain.setValueAtTime(1, start);
    output.gain.setValueAtTime(1, Math.max(start, finish - 0.10));
    output.gain.linearRampToValueAtTime(0, finish);
    const panner = typeof context.createStereoPanner === 'function' ? context.createStereoPanner() : context.createGain();
    const pan = overrides && Number.isFinite(Number(overrides.pan)) ? clamp(Number(overrides.pan), -0.95, 0.95) : clamp((shape.midi - 60) / 30, -0.75, 0.75);
    if (panner.pan) panner.pan.setValueAtTime(pan, start);
    const wet = context.createGain(); wet.gain.setValueAtTime(params.space * 0.78, start);
    const echoSend = context.createGain(); echoSend.gain.setValueAtTime(params.space * 0.34, start);
    output.connect(panner); panner.connect(graph.sum); panner.connect(wet); wet.connect(graph.wetInput); panner.connect(echoSend); echoSend.connect(graph.echoInput);

    const oscillators = [], envelopes = [], nodes = [output, panner, wet, echoSend];
    const drift = context.createOscillator(); drift.type = 'sine'; drift.frequency.setValueAtTime(0.22 + params.drift * 0.8, start);
    const driftDepth = context.createGain(); driftDepth.gain.setValueAtTime(params.drift * 3.2, start);
    drift.connect(driftDepth); nodes.push(drift, driftDepth); oscillators.push(drift);
    const random = randomGenerator(9473 + (Math.round(shape.midi * 100) * 97) + id * 131);
    for (let i = 0; i < shape.material.ratios.length; i++) {
      const frequency = shape.frequency * shape.material.ratios[i];
      if (frequency > context.sampleRate * 0.43) continue;
      const oscillator = context.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.detune.setValueAtTime((random() - 0.5) * (0.7 + i * 0.4) * params.drift, start);
      driftDepth.connect(oscillator.detune);
      const envelope = context.createGain();
      const peak = shape.amplitude * shape.weights[i];
      const attack = shape.material.attack + i * 0.00035;
      const tau = shape.ring / (2.7 + i * (0.55 - 0.3 * params.light));
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(peak, start + attack);
      envelope.gain.setTargetAtTime(0, start + attack, tau);
      oscillator.connect(envelope); envelope.connect(output);
      oscillator.start(start); oscillator.stop(finish);
      oscillators.push(oscillator); nodes.push(oscillator, envelope);
      envelopes.push({ node: envelope, peak, tau, anchor: start + attack, attack, shape: 'partial' });
    }

    // A restrained, delayed harmonic response is the instrument's second gesture.
    for (let i = 0; i < 2; i++) {
      const oscillator = context.createOscillator(); oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(shape.frequency * (i + 2), start);
      oscillator.detune.setValueAtTime((i ? -1 : 1) * params.drift * 1.7, start);
      const envelope = context.createGain();
      const bloomAt = start + 0.06 + params.tide * 0.12;
      const peak = shape.amplitude * 0.025 * params.tide / (i + 1);
      const tau = shape.ring * 0.7;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.setValueAtTime(0, bloomAt);
      envelope.gain.linearRampToValueAtTime(peak, bloomAt + 0.2);
      envelope.gain.setTargetAtTime(0, bloomAt + 0.2, tau);
      oscillator.connect(envelope); envelope.connect(output);
      oscillator.start(start); oscillator.stop(finish);
      oscillators.push(oscillator); nodes.push(oscillator, envelope);
      envelopes.push({ node: envelope, peak, tau, anchor: bloomAt + 0.2, attack: bloomAt + 0.2 - start, shape: 'bloom' });
    }

    const transient = context.createBufferSource(); transient.buffer = graph.noise;
    const pickTone = context.createBiquadFilter(); pickTone.type = 'bandpass'; pickTone.frequency.setValueAtTime(1500 + params.light * 5200, start); pickTone.Q.value = 0.65;
    const pickEnvelope = context.createGain();
    const pickPeak = shape.velocity * shape.material.transient * (0.4 + params.light * 0.6);
    pickEnvelope.gain.setValueAtTime(0, start);
    pickEnvelope.gain.linearRampToValueAtTime(pickPeak, start + 0.0015);
    pickEnvelope.gain.exponentialRampToValueAtTime(0.000001, start + 0.055);
    transient.connect(pickTone); pickTone.connect(pickEnvelope); pickEnvelope.connect(output);
    transient.start(start); transient.stop(start + 0.07);
    nodes.push(transient, pickTone, pickEnvelope);

    drift.start(start); drift.stop(finish);
    const record = {
      id, start, end: finish, originalEnd: finish, ring: shape.ring, output, panner, wet, echoSend,
      drift, driftDepth, oscillators, envelopes, transient, nodes, params, overrides: overrides || {},
      sustained: sustain, released: false, cleaned: false, amplitude: shape.amplitude
    };
    drift.onended = () => {
      if (record.cleaned) return;
      record.cleaned = true;
      for (const node of record.nodes) { try { node.disconnect(); } catch (_) { /* Already detached by destruction. */ } }
      if (ended) ended(record.id);
    };
    return record;
  }

  function releaseVoice(record, now, fade = 0.055) {
    if (record.released || record.cleaned) return;
    record.released = true;
    const end = now + fade + 0.03;
    const parameter = record.output.gain;
    if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
    else { parameter.cancelScheduledValues(now); parameter.setValueAtTime(record.start > now ? 0 : 1, now); }
    parameter.setTargetAtTime(0, now, Math.max(0.004, fade / 4));
    parameter.setValueAtTime(0, end);
    for (const oscillator of record.oscillators) { try { oscillator.stop(end); } catch (_) { /* Voice already completed. */ } }
    try { record.transient.stop(end); } catch (_) { /* The short excitation has already ended. */ }
    record.end = end;
  }

  function sustainVoice(record, now, held) {
    if (record.released || record.cleaned || now < record.start || now >= record.end - 0.12) return;
    record.sustained = held;
    let latestTail = 0;
    for (const envelope of record.envelopes) {
      const elapsed = now - envelope.anchor;
      if (elapsed < 0) continue;
      const current = envelope.peak * Math.exp(-elapsed / envelope.tau);
      const tau = held ? Math.min(8, envelope.tau * 2.4) : Math.max(0.16, envelope.tau * 0.32);
      const parameter = envelope.node.gain;
      if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
      else { parameter.cancelScheduledValues(now); parameter.setValueAtTime(current, now); }
      parameter.setTargetAtTime(0, now, tau);
      envelope.peak = current; envelope.anchor = now; envelope.tau = tau;
      latestTail = Math.max(latestTail, tau * 4.8);
    }
    const end = now + clamp(latestTail, 0.4, held ? 18 : 5);
    record.output.gain.cancelScheduledValues(now);
    record.output.gain.setValueAtTime(1, now);
    record.output.gain.setValueAtTime(1, end - 0.1);
    record.output.gain.linearRampToValueAtTime(0, end);
    for (const oscillator of record.oscillators) { try { oscillator.stop(end); } catch (_) { /* Already ended. */ } }
    record.end = end;
  }

  class TideSynth {
    constructor() {
      this.context = null;
      this.ready = false;
      this.params = { ...DEFAULTS };
      this.isRecording = false;
      this.recordMime = '';
      this._graph = null;
      this._recordDestination = null;
      this._voices = new Map();
      this._serial = 1;
      this._sustain = false;
      this._meterValue = 0;
      this._destroyed = false;
      this._muted = false;
      this._recorder = null;
      this._recordChunks = [];
      this._recordError = null;
      this._recordResult = null;
      this._recordWaiters = [];
      this._recordStopping = false;
    }

    async unlock() {
      if (this._destroyed) throw new Error('这件乐器已经关闭，请刷新页面重新唤醒。');
      const AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (!AudioContextClass) throw new Error('当前浏览器不支持合成声音，请使用新版 Chrome、Edge、Firefox 或 Safari。');
      if (!this.context) {
        try {
          this.context = new AudioContextClass({ latencyHint: 'interactive' });
          if (typeof this.context.createMediaStreamDestination === 'function') this._recordDestination = this.context.createMediaStreamDestination();
          this._graph = createGraph(this.context, this.params.volume, this._recordDestination);
          this.context.onstatechange = () => { this.ready = !!this.context && this.context.state === 'running'; };
        } catch (_) {
          if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {});
          this.context = null; this._graph = null;
          throw new Error('声音引擎暂时无法启动，请关闭其他占用音频的页面后再试。');
        }
      }
      if (this.context.state !== 'running') {
        try { await this.context.resume(); } catch (_) { throw new Error('浏览器还没有允许播放声音，请点击“唤醒弦汐”再试。'); }
      }
      this.ready = this.context.state === 'running';
      if (!this.ready) throw new Error('声音仍被浏览器暂停，请再次点击乐器或唤醒按钮。');
      return this;
    }

    setParams(partial) {
      const previous = this.params;
      this.params = parameters(this.params, partial);
      if (!this.context || !this._graph) return this.params;
      const now = this.context.currentTime;
      if (previous.volume !== this.params.volume && !this._muted) this._graph.master.gain.setTargetAtTime(this.params.volume, now, 0.02);
      for (const voice of this._voices.values()) {
        if (voice.released || voice.cleaned || voice.start > now) continue;
        if (partial && partial.space !== undefined && voice.overrides.space === undefined) {
          voice.wet.gain.setTargetAtTime(this.params.space * 0.78, now, 0.045);
          voice.echoSend.gain.setTargetAtTime(this.params.space * 0.34, now, 0.045);
        }
        if (partial && partial.drift !== undefined && voice.overrides.drift === undefined) {
          voice.driftDepth.gain.setTargetAtTime(this.params.drift * 3.2, now, 0.08);
          voice.drift.frequency.setTargetAtTime(0.22 + this.params.drift * 0.8, now, 0.08);
        }
      }
      return this.params;
    }

    pluck(midi, velocity = 0.7, position = 0.5, when = null, duration = null, overrides = null) {
      if (!this.context || !this._graph || !this.ready || !Number.isFinite(Number(midi))) return null;
      const now = this.context.currentTime;
      const start = when === null || when === undefined ? now + 0.004 : Math.max(now + 0.002, finite(when, now));
      if (start > now + 600) return null;
      if (this._muted) {
        this._graph.master.gain.cancelScheduledValues(now);
        this._graph.master.gain.setTargetAtTime(this.params.volume, now, 0.018);
        this._graph.wetOutput.gain.setTargetAtTime(0.9, now, 0.04);
        this._graph.echoOutput.gain.setTargetAtTime(0.32, now, 0.04);
        this._muted = false;
      }
      const active = [...this._voices.values()].filter(voice => !voice.released && !voice.cleaned && voice.end > start);
      if (active.length >= MAX_POLYPHONY) {
        active.sort((a, b) => a.start - b.start);
        for (let i = 0; i <= active.length - MAX_POLYPHONY; i++) releaseVoice(active[i], now, 0.035);
      }
      const params = parameters(this.params, overrides);
      const id = this._serial++;
      const voice = scheduleVoice(this.context, this._graph, id, Number(midi), velocity, position, start, duration, params, overrides, this._sustain, endedId => this._voices.delete(endedId));
      this._voices.set(id, voice);
      return id;
    }

    setSustain(held) {
      const next = !!held;
      if (this._sustain === next) return;
      this._sustain = next;
      if (!this.context) return;
      const now = this.context.currentTime;
      for (const voice of this._voices.values()) sustainVoice(voice, now, next);
    }

    stop() {
      this._sustain = false;
      if (!this.context || !this._graph) return;
      const now = this.context.currentTime;
      for (const voice of this._voices.values()) releaseVoice(voice, now, 0.035);
      this._graph.master.gain.cancelScheduledValues(now);
      this._graph.master.gain.setTargetAtTime(0, now, 0.012);
      this._graph.wetOutput.gain.setTargetAtTime(0, now, 0.012);
      this._graph.echoOutput.gain.setTargetAtTime(0, now, 0.012);
      this._meterValue = 0;
      this._muted = true;
    }

    getLevel() {
      if (!this.ready || !this._graph) return 0;
      const graph = this._graph;
      graph.analyser.getByteTimeDomainData(graph.meter);
      let sum = 0;
      for (const sample of graph.meter) { const value = (sample - 128) / 128; sum += value * value; }
      const level = Math.min(1, Math.sqrt(sum / graph.meter.length) * 4.5);
      this._meterValue += (level - this._meterValue) * (level > this._meterValue ? 0.55 : 0.16);
      return clamp(this._meterValue, 0, 1);
    }

    recordStart() {
      if (!this.ready || !this.context) throw new Error('先唤醒弦汐，再开始录音。');
      if (this.isRecording) return;
      if (this._recordStopping) throw new Error('上一段录音还在保存，请稍候。');
      if (this._recorder && this._recorder.state !== 'inactive') throw new Error('上一段录音还在收尾，请稍候。');
      if (!global.MediaRecorder || !this._recordDestination) throw new Error('当前浏览器无法录下现场演奏。你仍可演奏，并下载《河岸回声》的完整音频。');
      const options = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType = options.find(type => typeof global.MediaRecorder.isTypeSupported === 'function' && global.MediaRecorder.isTypeSupported(type));
      let recorder;
      try {
        recorder = mimeType ? new global.MediaRecorder(this._recordDestination.stream, { mimeType, audioBitsPerSecond: 192000 }) : new global.MediaRecorder(this._recordDestination.stream);
      } catch (_) { throw new Error('浏览器未能创建录音，请换用新版 Chrome、Edge 或 Firefox。'); }
      this._recordChunks = []; this._recordError = null; this._recordResult = null; this._recordWaiters = [];
      this.recordMime = recorder.mimeType || mimeType || 'audio/webm';
      recorder.ondataavailable = event => { if (event.data && event.data.size) this._recordChunks.push(event.data); };
      recorder.onerror = () => {
        this._recordError = new Error('录音中断了，请保存已有演奏后重新开始。');
        this.isRecording = false;
        if (recorder.state !== 'inactive') { try { recorder.stop(); } catch (_) { /* The recorder may already be stopping. */ } }
      };
      recorder.onstop = () => {
        this.isRecording = false;
        this._recordStopping = false;
        this._recordResult = new Blob(this._recordChunks, { type: this.recordMime });
        this._recordChunks = [];
        const waiters = this._recordWaiters.splice(0);
        for (const waiter of waiters) {
          if (this._recordError && !this._recordResult.size) waiter.reject(this._recordError);
          else waiter.resolve(this._recordResult);
        }
      };
      try { recorder.start(250); }
      catch (_) { throw new Error('录音未能开始，请重新唤醒声音后再试。'); }
      this._recorder = recorder;
      this.isRecording = true;
    }

    recordStop() {
      const recorder = this._recorder;
      if (!recorder) return Promise.reject(new Error('还没有开始录音。'));
      if (recorder.state === 'inactive' && this._recordResult) {
        if (!this._recordResult.size && this._recordError) return Promise.reject(this._recordError);
        return Promise.resolve(this._recordResult);
      }
      return new Promise((resolve, reject) => {
        this._recordWaiters.push({ resolve, reject });
        this.isRecording = false;
        this._recordStopping = true;
        if (recorder.state !== 'inactive') {
          try { recorder.stop(); }
          catch (_) {
            this._recordStopping = false;
            this._recordWaiters = this._recordWaiters.filter(item => item.resolve !== resolve);
            reject(new Error('录音暂时无法保存，请再试一次。'));
          }
        }
      });
    }

    async destroy() {
      if (this._destroyed) return;
      this.stop();
      if (this.isRecording) { try { await this.recordStop(); } catch (_) { /* Closing is still possible after a recording error. */ } }
      this._destroyed = true; this.ready = false;
      if (this.context && this.context.state !== 'closed') { try { await this.context.close(); } catch (_) { /* Already closed. */ } }
      for (const voice of this._voices.values()) for (const node of voice.nodes) { try { node.disconnect(); } catch (_) {} }
      this._voices.clear();
      if (this._graph) for (const node of this._graph.nodes) { try { node.disconnect(); } catch (_) {} }
      this._graph = null;
    }

    static async renderComposition(score, suppliedParams = null, progress = null) {
      const report = amount => { if (typeof progress === 'function') { try { progress(amount); } catch (_) { /* Presentation callbacks cannot interrupt a render. */ } } };
      const OfflineContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
      if (!OfflineContext) throw new Error('当前浏览器不支持离线合成，请直接下载已经制作好的完整音频。');
      if (!score || !Array.isArray(score.notes) || score.notes.length > 3000 || !Number.isFinite(score.duration) || score.duration <= 0 || score.duration > 600) throw new Error('这份乐谱无法用于导出。');
      const base = parameters(DEFAULTS, suppliedParams);
      const notes = score.notes.filter(note => note && Number.isFinite(note.time) && note.time >= 0 && note.time <= score.duration && Number.isFinite(note.midi)).slice().sort((a, b) => a.time - b.time);
      if (!notes.length) throw new Error('乐谱中没有可以演奏的音符。');
      let length = score.duration + 4;
      for (const note of notes) {
        const params = parameters(base, note);
        const shape = voiceShape(note.midi, note.velocity, note.position, note.duration, params, false);
        length = Math.max(length, note.time + shape.length + 3.5);
      }
      const sampleRate = 44100;
      let context;
      try { context = new OfflineContext(2, Math.ceil(length * sampleRate), sampleRate); }
      catch (_) { throw new Error('设备没有足够空间进行离线合成，请直接下载已完成的音频文件。'); }
      report(0.02);
      const graph = createGraph(context, base.volume);
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        scheduleVoice(context, graph, i + 1, note.midi, note.velocity, note.position, note.time + 0.02, note.duration, parameters(base, note), note, false, null);
        if (i % 40 === 0) { report(0.04 + i / notes.length * 0.14); await nextFrame(); }
      }
      graph.master.gain.setValueAtTime(base.volume, Math.max(0, length - 2));
      graph.master.gain.linearRampToValueAtTime(0, length - 0.02);
      report(0.20);
      // These suspended checkpoints let the browser report real rendering progress without playing audio.
      if (typeof context.suspend === 'function') {
        for (let step = 1; step <= 5; step++) {
          const at = length * step / 6;
          context.suspend(at).then(() => { report(0.20 + step / 6 * 0.64); return context.resume(); }).catch(() => {});
        }
      }
      let rendered;
      try { rendered = await context.startRendering(); }
      catch (_) { throw new Error('离线合成未能完成，设备可能内存不足。已制作好的 WAV 与 MP3 仍可直接下载。'); }
      report(0.86);
      const blob = await TideSynth._wav(rendered, amount => report(0.86 + amount * 0.14));
      for (const node of graph.nodes) { try { node.disconnect(); } catch (_) {} }
      report(1);
      return blob;
    }

    static async _wav(buffer, progress) {
      const channels = Math.min(2, buffer.numberOfChannels);
      const frames = buffer.length;
      const byteCount = frames * channels * 2;
      const bytes = new ArrayBuffer(44 + byteCount);
      const view = new DataView(bytes);
      const write = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
      write(0, 'RIFF'); view.setUint32(4, 36 + byteCount, true); write(8, 'WAVE'); write(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
      view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true);
      view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, byteCount, true);
      const audio = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
      const random = randomGenerator(371903);
      const block = 131072;
      let offset = 44;
      for (let begin = 0; begin < frames; begin += block) {
        const end = Math.min(frames, begin + block);
        for (let frame = begin; frame < end; frame++) {
          for (let channel = 0; channel < channels; channel++) {
            const sample = clamp(audio[channel][frame] + (random() - random()) / 65536, -1, 1);
            view.setInt16(offset, Math.round(sample < 0 ? sample * 32768 : sample * 32767), true); offset += 2;
          }
        }
        if (progress) progress(end / frames);
        await nextFrame();
      }
      return new Blob([bytes], { type: 'audio/wav' });
    }
  }

  TideSynth.DEFAULTS = DEFAULTS;
  TideSynth.MATERIALS = MATERIALS;
  global.TideSynth = TideSynth;
})(typeof window !== 'undefined' ? window : globalThis);
