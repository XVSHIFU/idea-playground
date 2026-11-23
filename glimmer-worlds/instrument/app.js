/* 弦汐 · performance surface and sample-accurate score transport. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,Number(n)||0));
  const defaults = {tide:.58,light:.48,space:.5,drift:.22,volume:.55,voice:'silk'};
  const scales = {dminor:[50,53,55,57,60,62,65,67],aminor:[45,48,50,52,55,57,60,62],cmajor:[48,50,52,55,57,60,62,64]};
  const scaleLabels = {dminor:'D minor pentatonic',aminor:'A minor pentatonic',cmajor:'C major pentatonic'};
  const names = ['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const keys = ['a','s','d','f','g','h','j','k'];
  const score = window.TideScore;
  const synth = new TideSynth();
  let params = {...defaults}, scaleName = 'dminor', octave = 0, ready = false, wakePending = null, toastTimer, recordingSince = 0, recordingBusy = false, previousFrame = 0;
  let playing = false, offset = 0, startedAt = 0, scoreIndex = 0, transportRevision = 0, lastSection = -1;
  const scheduledVisuals = [], heldKeys = new Set();
  const view = new TideView($('instrument'), {onPluck(index,velocity,position){perform(index,velocity,position,false);}});
  const noteName = midi => `${names[((midi%12)+12)%12]}${Math.floor(midi/12)-1}`;
  const timeText = seconds => `${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;
  function toast(text) { clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4500); }
  function download(blob,filename) { const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000); }
  function syncParams() {
    synth.setParams(params);view.setParams(params);
    for(const key of ['tide','light','space','drift','volume']){if($(key))$(key).value=Math.round(params[key]*100);if($(key+'-value'))$(key+'-value').textContent=Math.round(params[key]*100);}
    document.querySelectorAll('[data-voice]').forEach(button=>{const active=button.dataset.voice===params.voice;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    $('voice-description').textContent={silk:'柔和的起音，缓缓盛开的泛音。',glass:'清澈的非整数泛音，像光穿过水面。',wood:'短促、温暖，带着木质的颗粒。'}[params.voice];
  }
  function saveSettings() { try{localStorage.setItem('glimmer.tide.settings.v1',JSON.stringify({params,scaleName,octave}));}catch(error){/* The instrument does not require persistent storage. */} }
  function syncScale() {
    view.setScale(scales[scaleName]);view.setOctave(octave);
    $('scale').value=scaleName;$('octave-value').textContent=octave===0?'原位':octave<0?'低八度':'高八度';
    $('octave-down').disabled=octave<=-1;$('octave-up').disabled=octave>=1;
    $('current-note').textContent=scaleLabels[scaleName];
    document.querySelectorAll('[data-string]').forEach(button=>{const index=Number(button.dataset.string),name=noteName(scales[scaleName][index]+octave*12);button.querySelector('small').textContent=name;button.setAttribute('aria-label',`第 ${index+1} 弦 ${name}，键盘 ${keys[index].toUpperCase()}`);});
  }
  async function ensureAudio() {
    if(ready && synth.context?.state==='running')return true;
    if(wakePending)return wakePending;
    wakePending=(async()=>{try{await synth.unlock();ready=true;view.setActive(true);synth.setParams(params);$('sound-status').innerHTML='<span></span>声音已醒来';$('sound-status').classList.add('active');$('wake').classList.add('awake');$('wake').innerHTML='弦汐已醒来 '+icon('volume');$('wake-note').textContent='试着划过弦面，或按下 A S D F';return true;}catch(error){toast(error.message || '浏览器暂时无法开启声音，请换用较新的 Chrome、Edge 或 Safari。');return false;}finally{wakePending=null;}})();
    return wakePending;
  }
  function flashKey(index,velocity=.7) { const button=document.querySelector(`[data-string="${index}"]`);if(!button)return;button.classList.add('pressed');clearTimeout(button._releaseTimer);button._releaseTimer=setTimeout(()=>{if(!heldKeys.has(keys[index]))button.classList.remove('pressed');},140+velocity*160); }
  async function perform(index,velocity=.7,position=.5,visual=true) {
    index=clamp(index,0,7);const midi=scales[scaleName][index]+octave*12;
    if(visual)view.pluck(index,velocity,position);
    flashKey(index,velocity);
    $('current-note').textContent=`${noteName(midi)} · ${Math.round(velocity*100)}%`;
    $('gesture-readout').textContent=position<.2||position>.8?'靠近弦端 · 清亮':'掠过弦腹 · 温润';
    if(await ensureAudio())synth.pluck(midi,velocity,position);
  }
  function currentTime() { if(!playing||!synth.context)return clamp(offset,0,score.duration);return clamp(synth.context.currentTime-startedAt,0,score.duration); }
  function noteIndexAt(time) { let lo=0,hi=score.notes.length;while(lo<hi){const mid=(lo+hi)>>1;if(score.notes[mid].time<time-.002)lo=mid+1;else hi=mid;}return lo; }
  function updatePlayButton() { $('score-play').innerHTML=icon(playing?'pause':'play');$('score-play').classList.toggle('playing',playing);$('score-play').setAttribute('aria-label',playing?'暂停河岸回声':'播放河岸回声');$('score-play').setAttribute('aria-pressed',String(playing));$('performance-note').textContent=playing?'弦汐正在实时演奏 · 你也可以加入':'播放时，也可以加入你的演奏'; }
  function closestString(midi) { const scale=scales[scaleName];let best=0,dist=Infinity;for(let i=0;i<scale.length;i++){const pitchDistance=Math.abs((((midi-scale[i])+6)%12+12)%12-6);const d=pitchDistance*2+Math.abs(midi-(scale[i]+octave*12))*.06;if(d<dist){dist=d;best=i;}}return best; }
  function scheduleScore() {
    if(!playing||!synth.context)return;
    const now=synth.context.currentTime, horizon=now+.22;
    while(scoreIndex<score.notes.length){const note=score.notes[scoreIndex];const when=startedAt+note.time;if(when>horizon)break;scoreIndex++;if(when<now-.1)continue;synth.pluck(note.midi,note.velocity,note.position,Math.max(now+.005,when),note.duration,note);scheduledVisuals.push({at:Math.max(now,when),index:closestString(note.midi),velocity:note.velocity,position:note.position,midi:note.midi});}
    if(now-startedAt>=score.duration){offset=score.duration;playing=false;scheduledVisuals.length=0;updatePlayButton();$('gesture-readout').textContent='河岸安静下来，轮到你的声音了。';}
  }
  async function playScore() {
    const revision=++transportRevision;
    if(!await ensureAudio() || revision!==transportRevision)return;
    if(offset>=score.duration-.1)offset=0;
    synth.stop();scheduledVisuals.length=0;
    startedAt=synth.context.currentTime-offset+.08;
    scoreIndex=noteIndexAt(offset);playing=true;updatePlayButton();scheduleScore();
  }
  function pauseScore(silence=true) { transportRevision++;offset=currentTime();playing=false;scheduledVisuals.length=0;if(silence)synth.stop();updatePlayButton(); }
  async function toggleScore(){if(playing)pauseScore();else await playScore();}
  function seekTo(seconds) { const continuePlaying=playing;pauseScore();offset=clamp(seconds,0,score.duration);updateTransport();if(continuePlaying)playScore(); }
  function updateTransport() {
    const position=currentTime();$('score-time').textContent=timeText(position);$('score-seek').value=position;$('score-seek').setAttribute('aria-valuetext',`${Math.floor(position/60)} 分 ${Math.floor(position%60)} 秒`);$('score-progress').style.width=`${position/score.duration*100}%`;
    let section=score.sections.findIndex(s=>position>=s.start&&position<s.end);if(section<0)section=score.sections.length-1;
    if(section!==lastSection){lastSection=section;const act=score.sections[section];$('section-name').textContent=act.name;$('section-description').textContent=act.description;document.querySelectorAll('[data-section]').forEach(button=>button.classList.toggle('active',Number(button.dataset.section)===section));}
  }
  function drawScore() {
    const bars=160,energy=new Float32Array(bars);
    for(const note of score.notes){const start=Math.floor(note.time/score.duration*bars),width=Math.max(1,Math.ceil(Math.min(5,note.duration)/score.duration*bars));for(let j=0;j<width;j++){const index=start+j;if(index<bars)energy[index]+=note.velocity*(1-j/width)*.7;}}
    const maximum=Math.max(.01,...energy);
    $('score-waveform').innerHTML=Array.from(energy,(value,index)=>{const height=3+Math.sqrt(value/maximum)*32;return `<line x1="${index*5+2}" x2="${index*5+2}" y1="${21-height/2}" y2="${21+height/2}" stroke="${index<34?'#799a92':index<80?'#9ba990':index<126?'#bda775':'#7e9a8f'}" stroke-width="1.6" stroke-linecap="round"/>`;}).join('');
  }
  async function toggleRecording() {
    if(recordingBusy)return;recordingBusy=true;
    try{
      if(synth.isRecording){$('record-label').textContent='正在收起…';const blob=await synth.recordStop();if(blob&&blob.size){const type=blob.type||synth.recordMime||'';const extension=type.includes('ogg')?'ogg':type.includes('mp4')?'m4a':'webm';download(blob,`弦汐-即兴-${new Date().toISOString().replace(/[:.]/g,'-')}.${extension}`);toast('这一段声音已经保存。');}else toast('这次没有录到声音，请唤醒乐器后重新录制。');recordingSince=0;
      }else{if(!await ensureAudio())return;await synth.recordStart();recordingSince=performance.now();toast('开始录制乐器的声音。再点一次结束并下载。');}
    }catch(error){toast(error.message||'这个浏览器不支持现场录音。你仍可下载完成的原创作品。');recordingSince=0;}
    finally{recordingBusy=false;$('record').classList.toggle('recording',!!synth.isRecording);$('record').setAttribute('aria-pressed',String(!!synth.isRecording));$('record-label').textContent=synth.isRecording?'结束录制':'录下此刻';}
  }
  function stopAll() { pauseScore();synth.setSustain(false);heldKeys.clear();document.querySelectorAll('[data-string]').forEach(button=>button.classList.remove('pressed'));$('gesture-readout').textContent='余音已收起。随时再拨一根弦。'; }
  function showNotes() { $('notes-panel').hidden=false;$('close-notes').focus({preventScroll:true}); }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.string!=null){perform(Number(button.dataset.string),.72,.5);return;}
    if(button.dataset.voice){params.voice=button.dataset.voice;syncParams();saveSettings();return;}
    if(button.dataset.section!=null){seekTo(score.sections[Number(button.dataset.section)].start);return;}
    switch(button.id){
      case'wake':if(await ensureAudio()){for(let i=0;i<3;i++){const index=[0,3,5][i],delay=i*.15;setTimeout(()=>{synth.pluck(scales[scaleName][index]+octave*12,.35,.5);view.pluck(index,.35,.5);flashKey(index,.35);},delay*1000);}}break;
      case'score-play':toggleScore();break;
      case'record':toggleRecording();break;
      case'silence':stopAll();break;
      case'reset-sound':params={...defaults};scaleName='dminor';octave=0;syncParams();syncScale();saveSettings();toast('声音回到初见时的样子。');break;
      case'octave-down':octave=Math.max(-1,octave-1);syncScale();saveSettings();break;
      case'octave-up':octave=Math.min(1,octave+1);syncScale();saveSettings();break;
      case'show-notes':case'score-notes':showNotes();break;
      case'close-notes':$('notes-panel').hidden=true;$('show-notes').focus({preventScroll:true});break;
    }
  });
  document.addEventListener('input',event=>{const target=event.target;if(target.dataset.param){params[target.dataset.param]=Number(target.value)/100;synth.setParams(params);view.setParams(params);if($(target.dataset.param+'-value'))$(target.dataset.param+'-value').textContent=target.value;saveSettings();}if(target.id==='score-seek')seekTo(Number(target.value));});
  $('scale').addEventListener('change',event=>{scaleName=event.target.value;syncScale();saveSettings();});
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;
    if(event.key==='Escape'){stopAll();$('notes-panel').hidden=true;return;}
    if(!$('notes-panel').hidden)return;
    const key=event.key.toLowerCase();
    if(keys.includes(key)){event.preventDefault();if(heldKeys.has(key))return;heldKeys.add(key);perform(keys.indexOf(key),event.shiftKey?.82:.67,.5);return;}
    if(event.key==='Shift'){synth.setSustain(true);$('gesture-readout').textContent='延音 · 让声音多停留一会儿';return;}
    if(event.repeat)return;
    if(key==='z'){octave=Math.max(-1,octave-1);syncScale();saveSettings();}
    if(key==='x'){octave=Math.min(1,octave+1);syncScale();saveSettings();}
    if(event.code==='Space'&&!event.target.closest('button,a')){event.preventDefault();toggleScore();}
  });
  document.addEventListener('keyup',event=>{const key=event.key.toLowerCase();if(keys.includes(key)){heldKeys.delete(key);document.querySelector(`[data-string="${keys.indexOf(key)}"]`)?.classList.remove('pressed');}if(event.key==='Shift')synth.setSustain(false);});
  window.addEventListener('blur',()=>{heldKeys.clear();synth.setSustain(false);document.querySelectorAll('[data-string]').forEach(button=>button.classList.remove('pressed'));});
  window.addEventListener('resize',()=>view.resize());
  setInterval(scheduleScore,40);
  let uiTimer=0;
  function frame(now){const dt=Math.min(.1,(now-previousFrame)/1000||0);previousFrame=now;const contextNow=synth.context?.currentTime||0;while(scheduledVisuals.length&&scheduledVisuals[0].at<=contextNow){const event=scheduledVisuals.shift();view.pluck(event.index,event.velocity,event.position);flashKey(event.index,event.velocity);$('current-note').textContent=`${noteName(event.midi)} · 河岸回声`;}
    const level=ready?clamp(synth.getLevel(),0,1):0;view.setLevel(level);view.draw(now);$('level-fill').style.height=`${Math.sqrt(level)*100}%`;uiTimer+=dt;
    if(uiTimer>.1){uiTimer=0;updateTransport();if(synth.isRecording&&recordingSince){$('record-label').textContent=`结束 ${timeText((now-recordingSince)/1000)}`;if(now-recordingSince>600000&&!recordingBusy){toggleRecording();toast('这段录音已达到十分钟，正在为你保存。');}}}
    requestAnimationFrame(frame);
  }
  try{const saved=JSON.parse(localStorage.getItem('glimmer.tide.settings.v1')||'null');if(saved&&saved.params){for(const key of ['tide','light','space','drift','volume'])if(Number.isFinite(saved.params[key]))params[key]=clamp(saved.params[key],0,1);if(['silk','glass','wood'].includes(saved.params.voice))params.voice=saved.params.voice;if(scales[saved.scaleName])scaleName=saved.scaleName;if([-1,0,1].includes(saved.octave))octave=saved.octave;}}catch(error){/* Use the original tuning when stored settings are unavailable. */}
  syncParams();syncScale();drawScore();updateTransport();requestAnimationFrame(frame);
})();
