import {INSTRUMENTS,audible,stepDuration} from './model.js';
export class SoundEngine{
 constructor(onStatus){this.ctx=null;this.raw={};this.buffers={};this.onStatus=onStatus;this.ready=null;this.activeSources=new Set();this.pending=[];this.playing=false;this.step=0;this.lastStep=-1;this.metronome=false;this.generation=0;this.fallbackNoise=null;this.timer=null}
 async preload(){
  const result=await Promise.allSettled(INSTRUMENTS.map(async ins=>{const res=await fetch(`./assets/audio/${ins.id}.ogg`);if(!res.ok)throw Error(ins.id);this.raw[ins.id]=await res.arrayBuffer()}));
  this.onStatus(Object.keys(this.raw).length,false);return result;
 }
 async unlock(){
  if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});this.graph=this.makeGraph(this.ctx,.7,.24);this.noise=this.makeNoise(this.ctx);}
  if(this.ctx.state!=='running')await this.ctx.resume();
  if(!this.ready)this.ready=(async()=>{await this.preloaded;await Promise.allSettled(INSTRUMENTS.map(async ins=>{if(this.raw[ins.id])this.buffers[ins.id]=await this.ctx.decodeAudioData(this.raw[ins.id].slice(0))}));this.onStatus(Object.keys(this.buffers).length,true)})();
  await this.ready;return this.ctx;
 }
 makeNoise(ctx){const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),a=b.getChannelData(0);let seed=1234567;for(let i=0;i<a.length;i++){seed=(seed*16807)%2147483647;a[i]=(seed/2147483647)*2-1}return b}
 makeGraph(ctx,volume,reverb){
  const master=ctx.createGain();master.gain.value=volume*.55;
  const input=ctx.createGain();const convolver=ctx.createConvolver();const wet=ctx.createGain();wet.gain.value=reverb;
  const impulse=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.7),ctx.sampleRate);let seed=728391;for(let c=0;c<2;c++){const a=impulse.getChannelData(c);for(let i=0;i<a.length;i++){seed=(seed*16807)%2147483647;a[i]=(seed/2147483647*2-1)*Math.pow(1-i/a.length,3.8)*.7}}
  convolver.buffer=impulse;const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-6;limiter.knee.value=10;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.13;
  input.connect(master);input.connect(convolver);convolver.connect(wet);wet.connect(master);master.connect(limiter);limiter.connect(ctx.destination);
  return {input,master,wet,limiter};
 }
 settings(state){if(this.graph){this.graph.master.gain.setTargetAtTime(state.volume*.55,this.ctx.currentTime,.03);this.graph.wet.gain.setTargetAtTime(state.reverb,this.ctx.currentTime,.06)}}
 voice(ctx,graph,row,n,time,offline=false){
  const ins=INSTRUMENTS[row],gain=ctx.createGain();gain.gain.value=n.velocity*ins.volume;gain.connect(graph.input);
  const register=(source,end)=>{if(!offline){this.activeSources.add(source);source.onended=()=>{this.activeSources.delete(source);source.disconnect();gain.disconnect()}}source.start(time);if(end)source.stop(time+end)};
  if(this.buffers[ins.id]){
   const source=ctx.createBufferSource();source.buffer=this.buffers[ins.id];
   // The stored note is the composition pitch; each instrument is voiced in its own register.
   source.playbackRate.value=ins.drum?Math.pow(2,(n.pitch-60)/24):Math.pow(2,(n.pitch+ins.octave-ins.base)/12);
   source.connect(gain);register(source);return;
  }
  if(ins.drum){
   if(ins.id==='basedrum'){const o=ctx.createOscillator();o.frequency.setValueAtTime(130,time);o.frequency.exponentialRampToValueAtTime(42,time+.2);gain.gain.setValueAtTime(n.velocity*.7,time);gain.gain.exponentialRampToValueAtTime(.0001,time+.28);o.connect(gain);register(o,.3)}
   else {const source=ctx.createBufferSource();source.buffer=offline?this.makeNoise(ctx):this.noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=ins.id==='hat'?7000:1300;source.connect(f);f.connect(gain);const d=ins.id==='hat'?.06:.14;gain.gain.setValueAtTime(n.velocity*.35,time);gain.gain.exponentialRampToValueAtTime(.0001,time+d);register(source,d+.01)}
  }else{
   const f=440*Math.pow(2,(n.pitch+ins.octave-69)/12),o=ctx.createOscillator();o.type=ins.id==='bass'?'triangle':'sine';o.frequency.value=f;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(n.velocity*ins.volume*.45,time+.006);const decay=ins.id==='flute'?.5:1;gain.gain.exponentialRampToValueAtTime(.0001,time+decay);o.connect(gain);register(o,decay+.03);
  }
 }
 async preview(row,n,state){await this.unlock();this.settings(state);this.voice(this.ctx,this.graph,row,n,this.ctx.currentTime+.008)}
 click(time,accent=false){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=accent?1550:1050;g.gain.setValueAtTime(.055,time);g.gain.exponentialRampToValueAtTime(.001,time+.03);o.connect(g);g.connect(this.graph.input);o.start(time);o.stop(time+.04);o.onended=()=>{o.disconnect();g.disconnect()}}
 async start(getState){await this.unlock();if(this.playing)return;this.getState=getState;this.settings(getState());this.playing=true;this.nextTime=this.ctx.currentTime+.055;this.pending=[];this.tick();this.timer=setInterval(()=>this.tick(),25)}
 tick(){if(!this.playing)return;const s=this.getState();let scheduled=0;
  // A throttled tab resumes at the next beat instead of emitting a burst of old events.
  if(this.nextTime<this.ctx.currentTime-.2)this.nextTime=this.ctx.currentTime+.02;
  while(this.nextTime<this.ctx.currentTime+.11&&scheduled++<8){const step=this.step;for(let r=0;r<8;r++)if(s.pattern[r][step]&&audible(s,r))this.voice(this.ctx,this.graph,r,s.pattern[r][step],this.nextTime);if(this.metronome&&step%4===0)this.click(this.nextTime,step===0);this.pending.push({step,time:this.nextTime});this.nextTime+=stepDuration(s.bpm,s.swing,step);this.step=(this.step+1)%16;}
 }
 consume(){const out=[];if(!this.ctx)return out;while(this.pending.length&&this.pending[0].time<=this.ctx.currentTime){const e=this.pending.shift();this.lastStep=e.step;out.push(e)}return out}
 pause(reset=false){this.playing=false;clearInterval(this.timer);this.timer=null;this.pending=[];for(const s of this.activeSources){try{s.stop()}catch{}}this.activeSources.clear();this.step=reset?0:(this.lastStep+1)%16;if(reset)this.lastStep=-1;}
 seek(step){const was=this.playing;const getter=this.getState;this.pause();this.step=step;this.lastStep=step-1;if(was)this.start(getter)}
 async renderWav(state){
  await this.unlock();const seconds=60/state.bpm*4*4;const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  if(!Offline)throw Error('此浏览器不支持离线导出');
  const ctx=new Offline(2,Math.ceil((seconds+2.2)*44100),44100),graph=this.makeGraph(ctx,state.volume,state.reverb);
  let time=.05;for(let loop=0;loop<4;loop++)for(let s=0;s<16;s++){for(let r=0;r<8;r++)if(state.pattern[r][s]&&audible(state,r))this.voice(ctx,graph,r,state.pattern[r][s],time,true);time+=stepDuration(state.bpm,state.swing,s)}
  const b=await ctx.startRendering(),length=b.length*4,buffer=new ArrayBuffer(44+length),v=new DataView(buffer);const str=(pos,s)=>{for(let i=0;i<s.length;i++)v.setUint8(pos+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,36+length,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,44100,true);v.setUint32(28,176400,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,length,true);let pos=44;const l=b.getChannelData(0),r=b.getChannelData(1);for(let i=0;i<b.length;i++){for(const data of [l,r]){const n=Math.max(-1,Math.min(1,data[i]));v.setInt16(pos,n<0?n*32768:n*32767,true);pos+=2}}return new Blob([buffer],{type:'audio/wav'});
 }
}
