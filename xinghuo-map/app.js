
const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d",{alpha:false});

const els = {
  opening: document.getElementById("opening"),
  startBtn: document.getElementById("startBtn"),
  demoBtn: document.getElementById("demoBtn"),
  toolbarDemoBtn: document.getElementById("toolbarDemoBtn"),
  musicBtn: document.getElementById("musicBtn"),
  replayBtn: document.getElementById("replayBtn"),
  soundBtn: document.getElementById("soundBtn"),
  shotBtn: document.getElementById("shotBtn"),
  bgm: document.getElementById("bgm"),
  sceneCaption: document.getElementById("sceneCaption"),
  sceneNo: document.getElementById("sceneNo"),
  sceneKicker: document.getElementById("sceneKicker"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneText: document.getElementById("sceneText"),
  stepIndicator: document.getElementById("stepIndicator"),
  finale: document.getElementById("finale"),
  finaleKicker: document.querySelector(".finale-kicker"),
  finaleNumber: document.querySelector(".finale-number"),
  finaleTitle: document.querySelector(".finale-title"),
  finaleSub: document.querySelector(".finale-sub"),
  toast: document.getElementById("toast")
};

const DPR = Math.min(devicePixelRatio || 1, 2);
let W=0,H=0,startTime=performance.now(),intro=0;
let stars=[],particles=[],sparks=[],fireworks=[],bgStars=[],textTargets=[],linkTravelers=[];
let mouse={x:-9999,y:-9999,active:false};
let litCount=0,nextIndex=0,activeScene=-1,demoTimers=[],finaleAt=-1,captionTimer=null,sceneActivatedAt=0;
let demoMode=false,pulseWaves=[],finaleTrails=[],linkBursts=[];
let camera={zoom:1,targetZoom:1,offsetX:0,offsetY:0,targetOffsetX:0,targetOffsetY:0,bars:0,targetBars:0,flash:0,shake:0};
let mapImg=new Image(); mapImg.src="./china_red_five_star_map.png"; let mapReady=false;
mapImg.onload=()=>{mapReady=true; buildScene();};

// ===== Audio system: file audio + synth fallback =====
let audioMode = 'none'; // none | file | synth
let audioCtx = null;
let masterGain = null;
let synthTimer = null;
let synthRunning = false;
let lastAudioStart = 0;
els.bgm.volume = 0.55;

function updateAudioUI(extraToast){
  if(audioMode === 'file'){
    els.soundBtn.textContent = '❚❚ 音乐';
    els.musicBtn.textContent = '❚❚ 音乐已播放';
    if(extraToast) showToast('音频文件播放成功');
  }else if(audioMode === 'synth'){
    els.soundBtn.textContent = '❚❚ 音乐';
    els.musicBtn.textContent = '❚❚ 内置配乐已播放';
    if(extraToast) showToast('已切换为内置配乐');
  }else{
    els.soundBtn.textContent = '♪ 音乐';
    els.musicBtn.textContent = '♪ 播放音乐';
  }
}

function showToast(text){
  const prev = els.toast.textContent;
  els.toast.textContent = text;
  els.toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(()=>{
    els.toast.classList.remove('show');
    els.toast.textContent = prev || '已保存截图';
  }, 1700);
}

function setupFinaleDom(){
  [els.finaleKicker, els.finaleNumber, els.finaleTitle, els.finaleSub].forEach(el=>{
    if(!el) return;
    el.style.opacity='0';
    el.style.transform='translateY(18px)';
    el.style.transition='opacity .65s ease, transform .65s ease';
  });
}

function revealFinalePart(el, delay){
  setTimeout(()=>{
    if(!el) return;
    el.style.opacity='1';
    el.style.transform='translateY(0)';
  }, delay);
}

function prepFinaleDom(){
  els.finale.classList.remove('show');
  [els.finaleKicker, els.finaleNumber, els.finaleTitle, els.finaleSub].forEach(el=>{
    if(!el) return;
    el.style.opacity='0';
    el.style.transform='translateY(18px)';
  });
}

function focusStar(star, strength=1.08, bars=.55, shake=4, duration=1500){
  camera.targetZoom = strength;
  camera.targetOffsetX = (W*0.5 - star.x) * 0.24;
  camera.targetOffsetY = (H*0.42 - star.y) * 0.24;
  camera.targetBars = Math.max(camera.targetBars, bars);
  camera.flash = Math.max(camera.flash, strength > 1.12 ? 0.72 : 0.28);
  camera.shake = Math.max(camera.shake, shake);
  pulseWaves.push({x:star.x,y:star.y,r:18,life:1,grow:12,color:'gold'});
  setTimeout(()=>{
    camera.targetZoom = demoMode ? 1.02 : 1;
    camera.targetOffsetX = 0;
    camera.targetOffsetY = 0;
    camera.targetBars = demoMode ? 0.42 : 0;
  }, duration);
}

function screenToWorld(x,y){
  const wx = (x - (W/2 + camera.offsetX)) / camera.zoom + W/2;
  const wy = (y - (H/2 + camera.offsetY)) / camera.zoom + H/2;
  return {x:wx,y:wy};
}

function drawPulseWaves(){
  if(!pulseWaves.length) return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  pulseWaves.forEach(w=>{
    const alpha = w.life * 0.28;
    ctx.strokeStyle = w.color==='gold' ? `rgba(255,220,140,${alpha})` : `rgba(255,90,60,${alpha})`;
    ctx.lineWidth = 3 * w.life + .5;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI*2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawCinematicOverlay(){
  const barH = (12 + H*0.055) * camera.bars;
  if(barH > 0.5){
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${0.88*Math.min(1,camera.bars+.08)})`;
    ctx.fillRect(0,0,W,barH);
    ctx.fillRect(0,H-barH,W,barH);
    ctx.restore();
  }
  if(camera.flash > 0.01){
    ctx.save();
    ctx.fillStyle = `rgba(255,246,230,${camera.flash*0.28})`;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
  }
  if(finaleAt>0){
    const elapsed = performance.now() - finaleAt;
    const fade = Math.min(1, elapsed/1000);
    ctx.save();
    ctx.fillStyle=`rgba(0,0,0,${0.22*fade})`;
    ctx.fillRect(0,0,W,H);
    ctx.restore();
    if(elapsed > 700 && elapsed < 2600){
      const a = Math.min(1, (elapsed-700)/700) * Math.min(1, (2600-elapsed)/900);
      ctx.save();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font=`900 ${Math.min(W*0.15, 170)}px Arial Black,Microsoft YaHei,sans-serif`;
      ctx.fillStyle=`rgba(255,232,164,${a*0.16})`;
      ctx.fillText('77', W/2, H/2-6);
      ctx.restore();
    }
  }
}

function seedFinaleTrails(){
  finaleTrails=[];
  const targetX=W/2, targetY=H/2-8;
  stars.forEach((s,si)=>{
    for(let i=0;i<28;i++){
      finaleTrails.push({
        sx:s.x, sy:s.y,
        ex:targetX + (Math.random()-.5)*80,
        ey:targetY + (Math.random()-.5)*54,
        cx:(s.x+targetX)/2 + (si<4 ? 110 : -90) + (Math.random()-.5)*90,
        cy:(s.y+targetY)/2 - 80 - Math.random()*120,
        t:-Math.random()*0.45,
        speed:0.020 + Math.random()*0.022,
        size:1.2 + Math.random()*2.5,
        gold:Math.random() > 0.28,
        alpha:.6 + Math.random()*0.35
      });
    }
  });
}

function drawFinaleTrails(){
  if(!finaleTrails.length) return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  finaleTrails.forEach(p=>{
    if(p.t < 0 || p.t > 1) return;
    const u=1-p.t;
    const x=u*u*p.sx + 2*u*p.t*p.cx + p.t*p.t*p.ex;
    const y=u*u*p.sy + 2*u*p.t*p.cy + p.t*p.t*p.ey;
    const prevT=Math.max(0,p.t-0.035);
    const uu=1-prevT;
    const px=uu*uu*p.sx + 2*uu*prevT*p.cx + prevT*prevT*p.ex;
    const py=uu*uu*p.sy + 2*uu*prevT*p.cy + prevT*prevT*p.ey;
    ctx.strokeStyle=p.gold?`rgba(255,224,150,${p.alpha*(1-p.t)})`:`rgba(255,96,70,${p.alpha*(1-p.t)})`;
    ctx.lineWidth=Math.max(0.6,p.size*0.42*(1-p.t)+0.25);
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(x,y); ctx.stroke();
    ctx.fillStyle=p.gold?`rgba(255,238,180,${p.alpha})`:`rgba(255,102,74,${p.alpha})`;
    ctx.beginPath(); ctx.arc(x,y,p.size*(1-p.t*0.45),0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function drawHeaderSparkBand(t){
  if(W < 760) return;
  const baseX=Math.min(W*0.18, 230), baseY=Math.min(H*0.25, 250);
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<22;i++){
    const px=baseX + i*10.5;
    const py=baseY + Math.sin(t*0.0015 + i*0.55)*7 + (i%4)*5;
    const r=1.2 + (i%5)*0.22;
    ctx.fillStyle=i%4===0?'rgba(255,226,150,.72)':'rgba(255,94,68,.44)';
    ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle='rgba(255,216,128,.18)';
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(baseX-10, baseY+8);
  ctx.quadraticCurveTo(baseX+65, baseY-12, baseX+140, baseY+4);
  ctx.quadraticCurveTo(baseX+210, baseY+18, baseX+285, baseY-2);
  ctx.stroke();
  const pulse = (Math.sin(t*0.003)+1)/2;
  const gx=baseX+105, gy=baseY+5;
  const grad=ctx.createRadialGradient(gx,gy,0,gx,gy,42);
  grad.addColorStop(0,`rgba(255,230,162,${0.38+pulse*0.12})`);
  grad.addColorStop(1,'rgba(255,230,162,0)');
  ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(gx,gy,42,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function currentSceneProgress(){
  if(activeScene < 0 || !sceneActivatedAt) return 0;
  return clamp((performance.now() - sceneActivatedAt)/1250, 0, 1);
}

function drawSceneTitleBurst(scene, p){
  if(!scene || p<=0) return;
  const e=ease(Math.min(1,p));
  const alpha=Math.min(1,p)*0.9;
  const x=W*0.50, y=H*0.18;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.font=`700 ${Math.min(W*0.016,16)}px Microsoft YaHei, PingFang SC, sans-serif`;
  ctx.fillStyle=`rgba(255,215,140,${alpha*0.75})`;
  ctx.fillText(scene.kicker, x, y-28+(1-e)*12);
  ctx.font=`900 ${Math.min(W*0.050,54)}px Microsoft YaHei, PingFang SC, sans-serif`;
  ctx.fillStyle=`rgba(255,244,220,${alpha*0.42})`;
  ctx.fillText(scene.title, x, y+(1-e)*20);
  ctx.font=`600 ${Math.min(W*0.018,17)}px Microsoft YaHei, PingFang SC, sans-serif`;
  ctx.fillStyle=`rgba(255,230,190,${alpha*0.52})`;
  ctx.fillText(scene.text, x, y+34+(1-e)*16);
  ctx.strokeStyle=`rgba(255,215,140,${alpha*0.28})`;
  ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(x-140*e,y+56); ctx.lineTo(x+140*e,y+56); ctx.stroke();
  ctx.restore();
}

function spawnLinkTravel(fromStar,toStar){
  if(!fromStar || !toStar) return;
  for(let i=0;i<12;i++){
    linkTravelers.push({
      fromX:fromStar.x, fromY:fromStar.y,
      toX:toStar.x, toY:toStar.y,
      ctrlX:(fromStar.x+toStar.x)/2 + 30 + Math.random()*38,
      ctrlY:(fromStar.y+toStar.y)/2 - 30 - Math.random()*34,
      t:-i*0.025,
      speed:0.035 + Math.random()*0.014,
      size:1.3 + Math.random()*1.7,
      alpha:0.65 + Math.random()*0.28,
      gold:Math.random() > 0.25
    });
  }
  setTimeout(()=>{
    pulseWaves.push({x:toStar.x,y:toStar.y,r:12,life:1,grow:9,color:'gold'});
  },520);
}

function drawStarConnections(t){
  if(stars.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<stars.length-1;i++){
    const a=stars[i], b=stars[i+1];
    const done = i < litCount-1;
    const next = i === litCount-1 && litCount < stars.length;
    const alpha = done ? 0.28 : (next ? 0.18 : 0.08);
    ctx.strokeStyle = done ? `rgba(255,220,140,${alpha})` : `rgba(255,110,82,${alpha})`;
    ctx.lineWidth = done ? 2.2 : 1.1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x+b.x)/2 + 36, (a.y+b.y)/2 - 34, b.x, b.y);
    ctx.stroke();
    if(next){
      const u = (Math.sin(t*0.003)+1)/2;
      const mx = (1-u)*(1-u)*a.x + 2*(1-u)*u*((a.x+b.x)/2 + 36) + u*u*b.x;
      const my = (1-u)*(1-u)*a.y + 2*(1-u)*u*((a.y+b.y)/2 - 34) + u*u*b.y;
      const g=ctx.createRadialGradient(mx,my,0,mx,my,20);
      g.addColorStop(0,'rgba(255,236,188,.9)');
      g.addColorStop(1,'rgba(255,236,188,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(mx,my,20,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawLinkTravelers(){
  if(!linkTravelers.length) return;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  linkTravelers.forEach(p=>{
    if(p.t < 0 || p.t > 1) return;
    const u=1-p.t;
    const x=u*u*p.fromX + 2*u*p.t*p.ctrlX + p.t*p.t*p.toX;
    const y=u*u*p.fromY + 2*u*p.t*p.ctrlY + p.t*p.t*p.toY;
    const prevT=Math.max(0,p.t-0.05);
    const uu=1-prevT;
    const px=uu*uu*p.fromX + 2*uu*prevT*p.ctrlX + prevT*prevT*p.toX;
    const py=uu*uu*p.fromY + 2*uu*prevT*p.ctrlY + prevT*prevT*p.toY;
    ctx.strokeStyle=p.gold ? `rgba(255,224,148,${p.alpha*(1-p.t)})` : `rgba(255,88,72,${p.alpha*(1-p.t)})`;
    ctx.lineWidth=1.0+p.size*0.3;
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(x,y); ctx.stroke();
    ctx.fillStyle=p.gold ? `rgba(255,245,210,${p.alpha})` : `rgba(255,102,76,${p.alpha})`;
    ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function ensureAudioContext(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
  if(!masterGain){
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(audioCtx.destination);
  }
}
function midiFreq(m){ return 440 * Math.pow(2, (m-69)/12); }
function tone(freq, start, dur, type='triangle', vol=0.12){
  if(!audioCtx || !masterGain) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(vol, start+0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start+dur);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(start); osc.stop(start+dur+0.05);
}
function clickChime(freq=760){
  try{
    ensureAudioContext();
    const now = audioCtx.currentTime;
    tone(freq, now, 0.18, 'sine', 0.05);
    tone(freq*1.5, now+0.04, 0.20, 'triangle', 0.03);
  }catch(e){}
}
function scheduleSynthLoop(){
  if(!synthRunning) return;
  ensureAudioContext();
  const beat = 60/72;
  const now = audioCtx.currentTime + 0.05;
  const chords=[[48,52,55],[53,57,60],[55,59,62],[48,52,55],[45,48,52],[53,57,60],[55,59,62],[48,52,55]];
  const motif=[72,74,76,79,76,74,72,null,71,72,74,76,74,72,71,null];
  chords.forEach((ch,bi)=>{
    const st=now+bi*beat*4;
    ch.forEach(m=>{
      tone(midiFreq(m), st, beat*3.6, 'triangle', 0.05);
      tone(midiFreq(m-12), st, beat*3.4, 'sine', 0.014);
    });
    tone(midiFreq(ch[0]-12), st, beat*1.2, 'sawtooth', 0.018);
    tone(midiFreq(ch[2]-12), st+beat*2, beat*1.1, 'sawtooth', 0.014);
  });
  motif.forEach((m,i)=>{
    if(m==null) return;
    const st=now+beat*0.7+i*(beat/2);
    tone(midiFreq(m), st, beat*0.58, 'sine', 0.034);
    if(i%4===0) tone(midiFreq(m+12), st, beat*0.20, 'triangle', 0.016);
  });
  clearTimeout(synthTimer);
  synthTimer = setTimeout(scheduleSynthLoop, beat*32*1000 - 60);
}
function startSynthBGM(){
  try{
    ensureAudioContext();
    synthRunning = true;
    audioMode = 'synth';
    if(masterGain) masterGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.04);
    scheduleSynthLoop();
    updateAudioUI(true);
    return true;
  }catch(e){
    console.warn('synth start failed', e);
    return false;
  }
}
async function startFileBGM(){
  try{
    els.bgm.currentTime = 0;
    await els.bgm.play();
    audioMode = 'file';
    updateAudioUI(true);
    return true;
  }catch(e){
    console.warn('file audio play failed, fallback to synth', e);
    return startSynthBGM();
  }
}
async function ensureBGM(){
  const now = Date.now();
  if(now - lastAudioStart < 300) return true;
  lastAudioStart = now;

  if(audioMode === 'file'){
    if(els.bgm.paused) {
      try{ await els.bgm.play(); }catch(e){ return startSynthBGM(); }
    }
    updateAudioUI();
    return true;
  }
  if(audioMode === 'synth'){
    ensureAudioContext();
    updateAudioUI();
    return true;
  }
  // prefer file audio first, fallback to synth
  return startFileBGM();
}
function stopBGM(){
  if(audioMode === 'file'){
    els.bgm.pause();
  }
  if(audioMode === 'synth'){
    synthRunning = false;
    clearTimeout(synthTimer);
    if(masterGain && audioCtx) masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
  }
  audioMode = 'none';
  updateAudioUI();
}
function toggleMusic(){
  if(audioMode === 'none') ensureBGM();
  else stopBGM();
}

const STAR_DATA = [
  {
    order:1, kicker:"01 · 科技创新", title:"科技创新",
    text:"以代码触摸未来",
    nx:.3518, ny:.4315, size:18
  },
  {
    order:2, kicker:"02 · 山河锦绣", title:"山河锦绣",
    text:"一行坐标，绘万里山河",
    nx:.3940, ny:.4521, size:18
  },
  {
    order:3, kicker:"03 · 家乡新貌", title:"家乡新貌",
    text:"灯火与列车，共赴新程",
    nx:.3920, ny:.4822, size:18
  },
  {
    order:4, kicker:"04 · 校园青春", title:"校园青春",
    text:"以青春与知识，接续星火",
    nx:.3480, ny:.5012, size:18
  },
  {
    order:5, kicker:"05 · 星火共鸣", title:"星火共鸣",
    text:"五星共耀，同赴中华荣光",
    nx:.2431, ny:.4604, size:32
  }
];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>1-Math.pow(1-t,3);

function bgRect(){
  const w=Math.min(W*0.60,740);
  const h=mapReady ? w*(mapImg.height/mapImg.width) : w*0.72;
  return {w,h,x:(W-w)*0.52,y:(H-h)*0.45+18};
}

function resize(){
  W=innerWidth; H=innerHeight;
  canvas.width=Math.floor(W*DPR); canvas.height=Math.floor(H*DPR);
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
  buildScene();
}

function buildScene(){
  stars=[];particles=[];sparks=[];fireworks=[];bgStars=[];textTargets=[];finaleTrails=[];linkTravelers=[];
  const r=bgRect();
  stars = STAR_DATA.map((s,i)=>({
    ...s,
    x:r.x+s.nx*r.w,
    y:r.y+s.ny*r.h,
    lit:false,
    hover:false,
    pulse:i*1.2
  }));

  const gap=W<720?8.8:7.0;
  for(let y=r.y+10;y<r.y+r.h-10;y+=gap){
    for(let x=r.x+10;x<r.x+r.w-10;x+=gap){
      const nx=(x-r.x)/r.w, ny=(y-r.y)/r.h;
      const inMass =
        nx > 0.02 && nx < 0.97 &&
        ny > 0.08 && ny < 0.94 &&
        !((nx>0.77 && ny>0.73) || (nx<0.10 && ny<0.36)) &&
        !((nx<0.18 && ny>0.76)) &&
        !((nx>0.91 && ny>0.67)) &&
        !((nx>0.84 && ny<0.20)) &&
        Math.random() > 0.16;
      if(inMass){
        particles.push({
          x:W*0.5+(Math.random()-0.5)*42,
          y:H*0.48+(Math.random()-0.5)*42,
          tx:x+(Math.random()-0.5)*2,
          ty:y+(Math.random()-0.5)*2,
          baseTx:x, baseTy:y,
          vx:0, vy:0,
          size:0.55+Math.random()*1.45,
          phase:Math.random()*Math.PI*2,
          delay:Math.random()*0.72,
          gold:Math.random()>0.84,
          mode:"map"
        });
      }
    }
  }

  for(let i=0;i<95;i++){
    bgStars.push({x:Math.random()*W,y:Math.random()*H,r:.45+Math.random()*1.3,a:.03+Math.random()*.08});
  }
}

function showCaption(scene){
  els.sceneNo.textContent=`${scene.order} / 5`;
  els.sceneKicker.textContent=scene.kicker;
  els.sceneTitle.textContent=scene.title;
  els.sceneText.textContent=scene.text;
  els.sceneCaption.classList.remove("hide");
  clearTimeout(captionTimer);
  captionTimer=setTimeout(()=>els.sceneCaption.classList.add("hide"),3600);
}
function resetCaption(){
  els.sceneNo.textContent="1 / 5";
  els.sceneKicker.textContent="FIVE STARS · START HERE";
  els.sceneTitle.textContent="点击第一颗副星";
  els.sceneText.textContent="沿着星光轨迹依次点亮五星，最终让星火汇聚成 77。";
  els.sceneCaption.classList.remove("hide");
}
function updateProgress(){
  els.stepIndicator.textContent=`当前进度：${litCount} / 5`;
}
function resetAll(){
  litCount=0; nextIndex=0; activeScene=-1; finaleAt=-1; sceneActivatedAt=0;
  stars.forEach(s=>{s.lit=false;s.hover=false;});
  particles.forEach(p=>{p.tx=p.baseTx;p.ty=p.baseTy;p.mode="map";});
  pulseWaves=[];
  finaleTrails=[];
  linkTravelers=[];
  camera.zoom=1; camera.targetZoom=demoMode?1.02:1;
  camera.offsetX=0; camera.offsetY=0; camera.targetOffsetX=0; camera.targetOffsetY=0;
  camera.bars=0; camera.targetBars=demoMode?0.42:0; camera.flash=0; camera.shake=0;
  prepFinaleDom();
  resetCaption();
  updateProgress();
}

function spark(x,y,n=36,boost=1,goldBias=.78){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,s=(.6+Math.random()*3.8)*boost;
    sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-.3*boost,life:1,decay:.011+Math.random()*.021,size:.7+Math.random()*2.2,gold:Math.random()<goldBias});
  }
}
function firework(x,y,n=88){
  spark(x,y,n,1.9,.82);
  setTimeout(()=>spark(x+(Math.random()-.5)*60,y+(Math.random()-.5)*42,48,1.25,.75),100);
}

function activate(index){
  const s=stars[index];
  if(!s || index !== nextIndex) return;
  const isMain = index === stars.length - 1;
  clickChime(isMain ? 980 : (660 + index*80));
  s.lit=true;
  litCount++;
  nextIndex=Math.min(5, nextIndex+1);
  activeScene=index;
  sceneActivatedAt=performance.now();
  showCaption(s);
  updateProgress();
  firework(s.x,s.y,isMain ? 170 : 95);
  if(!isMain && stars[index+1]) spawnLinkTravel(s, stars[index+1]);
  focusStar(s, isMain ? 1.18 : 1.08, isMain ? 0.92 : 0.58, isMain ? 13 : 4, isMain ? 2300 : 1450);

  if(isMain){
    camera.flash = 0.95;
    pulseWaves.push({x:s.x,y:s.y,r:28,life:1,grow:18,color:'gold'});
    pulseWaves.push({x:s.x,y:s.y,r:46,life:1,grow:22,color:'gold'});
    stars.slice(0,4).forEach((star,i)=>setTimeout(()=>firework(star.x,star.y,56), i*90));
    setTimeout(()=>{ camera.shake = Math.max(camera.shake, 10); }, 120);
  }

  if(litCount===5){
    setTimeout(triggerFinale,isMain ? 1450 : 900);
  }
}

function createTextTargets(text){
  const off=document.createElement("canvas"), oc=off.getContext("2d");
  off.width=Math.min(1000,W); off.height=Math.min(620,H);
  const fs=Math.min(off.width*.36,340);
  oc.clearRect(0,0,off.width,off.height);
  oc.fillStyle="#fff";
  oc.font=`900 ${fs}px Arial Black,Microsoft YaHei,sans-serif`;
  oc.textAlign="center"; oc.textBaseline="middle";
  oc.fillText(text, off.width/2, off.height/2 - 10);
  const data=oc.getImageData(0,0,off.width,off.height).data, pts=[], step=8;
  for(let y=0;y<off.height;y+=step){
    for(let x=0;x<off.width;x+=step){
      if(data[(y*off.width+x)*4+3]>100){
        pts.push({x:W/2-off.width/2+x, y:H/2-off.height/2+y});
      }
    }
  }
  return pts;
}

function triggerFinale(){
  if(finaleAt>0) return;
  finaleAt=performance.now();
  prepFinaleDom();
  camera.targetBars = 1;
  camera.targetZoom = 1.14;
  camera.flash = 1;
  textTargets=createTextTargets("77");
  seedFinaleTrails();
  clickChime(1080);
  setTimeout(()=>{
    for(let i=0;i<particles.length;i++){
      const p=particles[i], t=textTargets[i%textTargets.length];
      p.tx=t.x+(Math.random()-.5)*2;
      p.ty=t.y+(Math.random()-.5)*2;
      p.mode="text";
    }
    camera.shake = 8;
    pulseWaves.push({x:W/2,y:H/2,r:90,life:1,grow:26,color:'gold'});
  }, 920);

  stars.forEach((s,i)=>setTimeout(()=>firework(s.x,s.y,118),i*150));
  for(let i=0;i<7;i++){
    setTimeout(()=>{
      fireworks.push({
        x:W*(.14+.12*i), y:H*(.16+.05*(i%2)),
        radius:82+Math.random()*36, count:30, duration:2100,
        start:performance.now(), gold:i%2===0, seed:Math.random()*Math.PI*2
      });
    }, 250 + i*220);
  }

  setTimeout(()=>{
    els.finale.classList.add("show");
    revealFinalePart(els.finaleNumber, 180);
    revealFinalePart(els.finaleKicker, 180);
  }, 1450);
  setTimeout(()=>{
    revealFinalePart(els.finaleTitle, 0);
    clickChime(920);
    fireworks.push({x:W*0.50, y:H*0.22, radius:110, count:42, duration:2200, start:performance.now(), gold:true, seed:Math.random()*Math.PI*2});
  }, 2650);
  setTimeout(()=>{
    revealFinalePart(els.finaleSub, 0);
  }, 3600);
  setTimeout(()=>{
    els.finale.classList.remove("show");
    particles.forEach(p=>{p.tx=p.baseTx;p.ty=p.baseTy;p.mode="map";});
    finaleTrails=[];
    camera.targetZoom = demoMode ? 1.02 : 1;
    camera.targetBars = demoMode ? 0.42 : 0;
    finaleAt=-1;
  },9800);
}

function drawBackground(t){
  const bg=ctx.createRadialGradient(W*.56,H*.44,0,W*.52,H*.5,Math.max(W,H)*.82);
  bg.addColorStop(0,"#220708");
  bg.addColorStop(.40,"#130609");
  bg.addColorStop(.78,"#090609");
  bg.addColorStop(1,"#040405");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  ctx.save();
  for(let i=0;i<3;i++){
    const y0=H*(.18+i*.14);
    ctx.strokeStyle=i%2===0?"rgba(255,76,60,.10)":"rgba(255,208,112,.07)";
    ctx.lineWidth=30-i*7;
    ctx.beginPath(); ctx.moveTo(-80,y0);
    for(let x=-80;x<=W+80;x+=50){
      ctx.lineTo(x,y0+Math.sin(x*.006+t*.00045+i*1.8)*(18+i*7));
    }
    ctx.stroke();
  }
  ctx.restore();

  fireworks.forEach(f=>drawFireworkBurst(f,t));

  bgStars.forEach(s=>{
    ctx.fillStyle=`rgba(255,240,214,${s.a})`;
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
  });

  const floor=ctx.createLinearGradient(0,H*.65,0,H);
  floor.addColorStop(0,"rgba(255,100,60,0)");
  floor.addColorStop(1,"rgba(255,90,50,.045)");
  ctx.fillStyle=floor; ctx.fillRect(0,H*.65,W,H*.35);
}

function drawFireworkBurst(f,t){
  const age=(t-f.start)/f.duration;
  if(age<0||age>1) return;
  const alpha=1-age;
  ctx.save(); ctx.globalCompositeOperation="lighter";
  for(let i=0;i<f.count;i++){
    const a=(Math.PI*2/f.count)*i+f.seed;
    const r=age*f.radius*(.72+(i%5)*.08);
    const x=f.x+Math.cos(a)*r, y=f.y+Math.sin(a)*r;
    ctx.fillStyle=f.gold?`rgba(255,214,115,${alpha*.82})`:`rgba(255,92,70,${alpha*.74})`;
    ctx.beginPath();ctx.arc(x,y,1.8*alpha+.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawMapImage(t){
  const r=bgRect();
  if(!mapReady) return;

  ctx.save();
  ctx.shadowColor="rgba(255,62,48,.35)";
  ctx.shadowBlur=32;
  ctx.globalAlpha=.98;
  ctx.drawImage(mapImg,r.x,r.y,r.w,r.h);
  ctx.restore();

  const gx=r.x+((t*.06)%(r.w+240))-120;
  const grad=ctx.createLinearGradient(gx-120,r.y,gx+120,r.y);
  grad.addColorStop(0,"rgba(255,220,130,0)");
  grad.addColorStop(.5,"rgba(255,220,130,.10)");
  grad.addColorStop(1,"rgba(255,220,130,0)");
  ctx.save();
  ctx.fillStyle=grad;
  ctx.fillRect(r.x,r.y,r.w,r.h);
  ctx.globalCompositeOperation="destination-in";
  ctx.drawImage(mapImg,r.x,r.y,r.w,r.h);
  ctx.restore();
}

function drawParticles(t){
  ctx.save(); ctx.globalCompositeOperation="lighter";
  particles.forEach(p=>{
    const alpha=(.22+.72*intro)*(.64+Math.sin(t*.0022+p.phase)*.23);
    const gold=p.gold||p.mode==="text";
    ctx.fillStyle=gold?`rgba(255,208,104,${alpha})`:`rgba(255,62,62,${alpha})`;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size+(p.mode==="text"?.35:0),0,Math.PI*2); ctx.fill();
  });
  ctx.restore();
}

function starPath(x,y,r){
  const path=new Path2D();
  let rot=Math.PI/2*3;
  let step=Math.PI/5;
  path.moveTo(x,y-r);
  for(let i=0;i<5;i++){
    path.lineTo(x+Math.cos(rot)*r,y+Math.sin(rot)*r); rot+=step;
    path.lineTo(x+Math.cos(rot)*(r*0.42),y+Math.sin(rot)*(r*0.42)); rot+=step;
  }
  path.closePath();
  return path;
}

function drawStars(){
  ctx.save(); ctx.globalCompositeOperation="lighter";
  stars.forEach((s,i)=>{
    s.pulse += .035;
    const pulse=(Math.sin(s.pulse)+1)/2;
    const isNext = i===nextIndex && litCount<5;
    const isMain = i===stars.length-1;
    const glowR = s.size + (isNext?12:4) + pulse*3 + (s.lit?6:0) + (isMain && isNext ? 4 : 0);

    const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,glowR*2.2);
    g.addColorStop(0,`rgba(255,245,190,${s.lit||isNext?0.98:0.70})`);
    g.addColorStop(.18,`rgba(255,210,90,${s.lit||isNext?0.80:0.38})`);
    g.addColorStop(1,"rgba(255,170,60,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,glowR*2.2,0,Math.PI*2); ctx.fill();

    ctx.fillStyle=s.lit || isNext ? "#ffd83a" : "rgba(255,216,100,.70)";
    ctx.strokeStyle=s.lit ? "rgba(255,248,198,.95)" : "rgba(255,240,190,.52)";
    ctx.lineWidth=s.lit ? 1.3 : .8;
    const p=starPath(s.x,s.y,s.size);
    ctx.fill(p); ctx.stroke(p);

    if(isNext){
      ctx.strokeStyle="rgba(255,228,140,.42)";
      ctx.lineWidth=isMain ? 1.8 : 1.1;
      ctx.beginPath(); ctx.arc(s.x,s.y,glowR*1.45,0,Math.PI*2); ctx.stroke();
      if(isMain){
        ctx.strokeStyle="rgba(255,245,205,.28)";
        ctx.beginPath(); ctx.arc(s.x,s.y,glowR*1.95,0,Math.PI*2); ctx.stroke();
      }
    }
  });
  ctx.restore();
}

function roundRect(x,y,w,h,r,fillColor,strokeColor){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  ctx.fillStyle=fillColor; ctx.fill();
  ctx.strokeStyle=strokeColor; ctx.stroke();
}

function drawSceneEffects(t){
  if(activeScene < 0) return;
  const scene = STAR_DATA[activeScene];
  const p = currentSceneProgress();
  const e = ease(p);
  drawSceneTitleBurst(scene, p);

  if(activeScene===0){
    // 科技：芯片 + 数据环
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const cx=W*.72, cy=H*.40, s=110*e;
    ctx.strokeStyle=`rgba(120,228,255,${0.25+0.45*e})`;
    ctx.lineWidth=2;
    ctx.strokeRect(cx-s/2, cy-s/2, s, s);
    ctx.strokeRect(cx-s/2+18, cy-s/2+18, s-36, s-36);
    for(let i=0;i<8;i++){
      const k=clamp(e*1.2-i*0.08,0,1); if(k<=0) continue;
      ctx.beginPath();
      ctx.moveTo(cx-s/2-40*k, cy-s/2+16+i*10);
      ctx.lineTo(cx-s/2, cy-s/2+16+i*10);
      ctx.moveTo(cx+s/2, cy-s/2+16+i*10);
      ctx.lineTo(cx+s/2+40*k, cy-s/2+16+i*10);
      ctx.stroke();
    }
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.ellipse(cx,cy,(90+i*28)*e,(44+i*12)*e,-.25,0,Math.PI*2);
      ctx.strokeStyle=`rgba(120,228,255,${0.16+0.08*(4-i)})`; ctx.stroke();
    }
    for(let row=0;row<4;row++){
      const yy=H*(.30+row*.10);
      const reach=e*(W*.38);
      ctx.strokeStyle=`rgba(120,228,255,${0.16+row*.04})`;
      ctx.beginPath(); ctx.moveTo(W*.12,yy); ctx.lineTo(W*.12+reach*.55,yy); ctx.lineTo(W*.12+reach*.68,yy+20); ctx.lineTo(W*.12+reach,yy+20); ctx.stroke();
      const pulse=(t*.00022+row*.19)%1;
      const px=W*.12+reach*Math.min(pulse,e), py=yy+(pulse>.62?20:0);
      const g=ctx.createRadialGradient(px,py,0,px,py,18);
      g.addColorStop(0,'rgba(190,245,255,.95)'); g.addColorStop(1,'rgba(190,245,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,18,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  if(activeScene===1){
    // 山河：旭日 + 长城
    ctx.save();
    const sunX=W*.70, sunY=H*.24;
    const sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,110);
    sg.addColorStop(0,`rgba(255,220,134,${0.36+0.24*e})`); sg.addColorStop(1,'rgba(255,220,134,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sunX,sunY,70+40*e,0,Math.PI*2); ctx.fill();
    const layers=[{base:.63,amp:52,a:.15},{base:.72,amp:36,a:.11},{base:.80,amp:25,a:.08}];
    layers.forEach((L,idx)=>{
      ctx.beginPath(); ctx.moveTo(-20,H);
      for(let x=-20;x<=W*e+40;x+=12){
        const y=H*L.base-Math.sin(x*.012+idx*1.2)*L.amp*e-Math.cos(x*.019)*10*e;
        ctx.lineTo(x,y);
      }
      ctx.lineTo(W*e+40,H); ctx.closePath();
      ctx.fillStyle=`rgba(255,214,126,${L.a+e*0.04})`; ctx.fill();
    });
    const wall=[[.10,.56],[.20,.48],[.30,.50],[.40,.41],[.53,.46],[.65,.38],[.78,.41],[.90,.34]];
    const lim=Math.max(2, Math.floor((wall.length-1)*(0.25+e*0.95)));
    ctx.strokeStyle=`rgba(255,209,114,${0.58+0.30*e})`; ctx.lineWidth=3; ctx.shadowColor='rgba(255,182,90,.9)'; ctx.shadowBlur=14;
    ctx.beginPath();
    wall.slice(0,lim).forEach((p0,i)=>{ const x=W*p0[0], y=H*p0[1]; if(!i) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke();
    wall.slice(0,lim).forEach((p0,i)=>{ const x=W*p0[0], y=H*p0[1]; ctx.fillStyle='rgba(255,232,170,.92)'; ctx.fillRect(x-2,y-10,4,10);});
    ctx.restore();
  }

  if(activeScene===2){
    // 家乡：城市 + 高铁
    ctx.save();
    const baseY=H*.78;
    const xs=[.10,.18,.26,.35,.44,.54,.64,.74,.84];
    xs.forEach((px,idx)=>{
      const local=clamp(e*1.35-idx*0.06,0,1); if(local<=0) return;
      const bw=34+(idx%3)*12, bh=(78+((idx*27)%95))*local;
      const bx=W*px;
      ctx.fillStyle=`rgba(255,214,128,${0.08+0.12*local})`;
      ctx.fillRect(bx,baseY-bh,bw,bh);
      for(let wy=baseY-bh+10;wy<baseY-8;wy+=11){
        for(let wx=bx+6;wx<bx+bw-6;wx+=9){
          if(((wx+wy+idx)|0)%3===0){ ctx.fillStyle=`rgba(255,232,170,${0.35+0.3*local})`; ctx.fillRect(wx,wy,3,4); }
        }
      }
    });
    ctx.strokeStyle=`rgba(255,188,100,${0.24+0.18*e})`; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(W*.08,baseY); ctx.bezierCurveTo(W*.26,baseY-78*e,W*.46,baseY-110*e,W*.66,baseY-38*e); ctx.bezierCurveTo(W*.78,baseY+8*e,W*.88,baseY-34*e,W*.94,baseY-18*e); ctx.stroke();
    const trainT=(t*.00022)%1;
    const pts=[[.10,.78],[.28,.62],[.48,.58],[.67,.70],[.92,.65]];
    const seg=(pts.length-1)*Math.min(trainT,e), idx=Math.min(pts.length-2,Math.floor(seg));
    const u=seg-idx, a=pts[idx], b=pts[idx+1];
    const x=W*(a[0]+(b[0]-a[0])*u), y=H*(a[1]+(b[1]-a[1])*u);
    const gg=ctx.createRadialGradient(x,y,0,x,y,34);
    gg.addColorStop(0,'rgba(255,245,198,.95)'); gg.addColorStop(.22,'rgba(255,194,92,.78)'); gg.addColorStop(1,'rgba(255,90,40,0)');
    ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(x,y,30+8*e,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(255,241,210,${0.6*e})`; ctx.fillRect(x-18*e,y-5,36*e,10);
    ctx.restore();
  }

  if(activeScene===3){
    // 校园：教学楼 + 代码符号
    ctx.save();
    const bx=W*.62, by=H*.28, bw=260, bh=160;
    ctx.strokeStyle=`rgba(255,216,136,${0.24+0.2*e})`; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(bx,by+bh); ctx.lineTo(bx,by+40); ctx.lineTo(bx+bw*.5,by); ctx.lineTo(bx+bw,by+40); ctx.lineTo(bx+bw,by+bh); ctx.stroke();
    for(let i=0;i<6;i++){
      const local=clamp(e*1.4-i*0.08,0,1); if(local<=0) continue;
      const wx=bx+22+i*36; ctx.globalAlpha=local;
      ctx.strokeRect(wx,by+56,18,18); ctx.strokeRect(wx,by+90,18,18);
      ctx.globalAlpha=1;
    }
    ctx.strokeRect(bx+bw*.46,by+86,32,74*e);
    ctx.font=`900 ${Math.min(W*0.068, 72)}px ui-monospace,Consolas,monospace`;
    ctx.fillStyle=`rgba(255,230,174,${0.14+0.36*e})`;
    ctx.fillText('</>', W*.18, H*.42);
    const cx=W*.08, cy=H*.28, cw=390, ch=180;
    roundRect(cx,cy,cw,ch,16,`rgba(8,8,11,${0.22+0.44*e})`,`rgba(255,213,128,${0.18+0.12*e})`);
    ctx.font='13px ui-monospace,Consolas,monospace';
    const lines=["const youth = code + dream;","while (nation.growing) {","  us.create();","  us.explore();","  us.shine();","}","// 青春，与时代同频"];
    const visible=Math.max(1, Math.floor(lines.length*Math.min(1,e*1.2)));
    lines.slice(0,visible).forEach((line,i)=>{ ctx.fillStyle=i===6?`rgba(255,214,120,${0.78})`:`rgba(255,240,217,${0.60})`; ctx.fillText(line,cx+18,cy+30+i*21);});
    ctx.restore();
  }

  if(activeScene===4){
    // 共鸣：五束光汇向中心
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const cx=W*.54, cy=H*.46;
    stars.forEach((s,idx)=>{
      const local=clamp(e*1.25-idx*0.08,0,1); if(local<=0) return;
      ctx.strokeStyle=`rgba(255,214,118,${0.18+0.22*local})`; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.quadraticCurveTo((s.x+cx)/2 + 18, (s.y+cy)/2 - 18, cx, cy); ctx.stroke();
    });
    for(let k=0;k<5;k++){
      const rr=(66+k*34)*e + Math.sin(t*.002+k)*5;
      ctx.strokeStyle=`rgba(255,214,118,${0.22-k*0.03})`; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke();
    }
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,90);
    g.addColorStop(0,'rgba(255,245,186,.95)'); g.addColorStop(.28,'rgba(255,208,95,.40)'); g.addColorStop(1,'rgba(255,208,95,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,90,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawSparks(){
  ctx.save(); ctx.globalCompositeOperation="lighter";
  sparks.forEach(s=>{
    ctx.fillStyle=s.gold?`rgba(255,214,112,${s.life})`:`rgba(255,72,52,${s.life})`;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.size*s.life,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=s.gold?`rgba(255,228,157,${s.life*.28})`:`rgba(255,68,45,${s.life*.22})`;
    ctx.lineWidth=.65; ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*4,s.y-s.vy*4); ctx.stroke();
  });
  ctx.restore();
}

function update(t){
  intro=clamp((t-startTime)/2200,0,1);
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.075;
  camera.offsetX += (camera.targetOffsetX - camera.offsetX) * 0.08;
  camera.offsetY += (camera.targetOffsetY - camera.offsetY) * 0.08;
  camera.bars += (camera.targetBars - camera.bars) * 0.08;
  camera.flash *= 0.90;
  camera.shake *= 0.84;
  pulseWaves.forEach(w=>{ w.r += w.grow; w.life *= 0.91; });
  pulseWaves = pulseWaves.filter(w=>w.life > 0.03);
  finaleTrails.forEach(p=>{ p.t += p.speed; p.alpha *= (p.t > 0.7 ? 0.96 : 0.995); });
  finaleTrails = finaleTrails.filter(p=>p.t < 1.06 && p.alpha > 0.03);
  linkTravelers.forEach(p=>{ p.t += p.speed; p.alpha *= 0.992; });
  linkTravelers = linkTravelers.filter(p=>p.t < 1.06 && p.alpha > 0.05);
  particles.forEach(p=>{
    const local=clamp((intro-p.delay*.42)/.66,0,1), e=ease(local);
    let ax=(p.tx-p.x)*.034*e, ay=(p.ty-p.y)*.034*e;
    const b=Math.sin(t*.0015+p.phase)*.016;
    ax+=Math.cos(p.phase)*b; ay+=Math.sin(p.phase)*b;
    if(mouse.active && p.mode==="map"){
      const dx=p.x-mouse.x, dy=p.y-mouse.y, d2=dx*dx+dy*dy, R=118;
      if(d2<R*R&&d2>.01){
        const d=Math.sqrt(d2), f=(1-d/R)*.82;
        ax+=dx/d*f; ay+=dy/d*f;
      }
    }
    p.vx=(p.vx+ax)*.912; p.vy=(p.vy+ay)*.912;
    p.x+=p.vx; p.y+=p.vy;
  });

  stars.forEach(s=>{
    s.hover=Math.hypot(mouse.x-s.x,mouse.y-s.y)<Math.max(24,s.size+10);
  });

  sparks.forEach(s=>{
    s.x+=s.vx; s.y+=s.vy;
    s.vx*=.986; s.vy=s.vy*.986+.016;
    s.life-=s.decay;
  });
  sparks=sparks.filter(s=>s.life>0);

  fireworks=fireworks.filter(f=>(t-f.start)<f.duration);
}

function frame(t){
  update(t);
  ctx.save();
  const sx = (Math.random()-0.5) * camera.shake;
  const sy = (Math.random()-0.5) * camera.shake;
  ctx.translate(W/2 + camera.offsetX + sx, H/2 + camera.offsetY + sy);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-W/2, -H/2);
  drawBackground(t);
  drawMapImage(t);
  drawParticles(t);
  drawStarConnections(t);
  drawSceneEffects(t);
  drawPulseWaves();
  drawLinkTravelers();
  drawFinaleTrails();
  drawStars();
  drawSparks();
  ctx.restore();
  drawHeaderSparkBand(t);
  drawCinematicOverlay();
  requestAnimationFrame(frame);
}

function pointer(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left, y:e.clientY-r.top};
}
window.addEventListener("pointermove",e=>{
  const p=pointer(e);
  mouse.x=p.x; mouse.y=p.y; mouse.active=true;
});
window.addEventListener("pointerleave",()=>mouse.active=false);
window.addEventListener("pointerdown",async e=>{
  await ensureBGM();
  const pScreen=pointer(e);
  const p=screenToWorld(pScreen.x,pScreen.y);
  const s=stars[nextIndex];
  if(s && Math.hypot(s.x-p.x,s.y-p.y) < Math.max(28,s.size+12)) activate(nextIndex);
  else { clickChime(620); spark(p.x,p.y,24,.9,.72); }
});

function closeOpening(){ els.opening.classList.remove("show"); }
async function replay(isDemo=false){
  demoTimers.forEach(clearTimeout); demoTimers=[];
  demoMode = isDemo;
  document.body.classList.toggle("showcase-mode", demoMode);
  startTime=performance.now();
  buildScene();
  resetAll();
  closeOpening();
  await ensureBGM();
  if(demoMode){
    camera.targetBars = 0.42;
    camera.targetZoom = 1.02;
  }
}
async function demo(){
  await replay(true);
  const times=[3000,9000,15000,21000,27000];
  times.forEach((ms,i)=>demoTimers.push(setTimeout(()=>activate(i),ms)));
}

els.startBtn.addEventListener("click", replay);
els.demoBtn.addEventListener("click", demo);
els.toolbarDemoBtn.addEventListener("click", demo);
els.musicBtn.addEventListener("click", toggleMusic);
els.replayBtn.addEventListener("click", replay);
els.soundBtn.addEventListener("click", toggleMusic);

els.bgm.addEventListener('canplaythrough', ()=>console.log('audio ready'));
els.bgm.addEventListener('error', ()=>console.warn('audio file failed to load, synth fallback will be used'));

els.shotBtn.addEventListener("click",()=>{
  canvas.toBlob(blob=>{
    if(!blob) return;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="星火汇中华_运行画面.png";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    showToast('已保存截图');
  },"image/png");
});

window.addEventListener("keydown",e=>{
  if(e.code==="Space"){e.preventDefault(); closeOpening(); demo();}
  if(e.key.toLowerCase()==="r") replay();
  if(e.key.toLowerCase()==="m") toggleMusic();
});

window.addEventListener("resize",resize);
resize();
setupFinaleDom();
resetAll();
updateAudioUI();
requestAnimationFrame(frame);

setInterval(()=>{
  fireworks.push({
    x:W*(.18+Math.random()*.64),
    y:H*(.14+Math.random()*.24),
    radius:38+Math.random()*28,
    count:18+Math.floor(Math.random()*12),
    duration:1500+Math.random()*600,
    start:performance.now(),
    gold:Math.random()>.35,
    seed:Math.random()*Math.PI*2
  });
  if(fireworks.length>10) fireworks.shift();
},2100);
