/* Tide Town — walkable, inhabited clay livestock interiors.
 * Public API: Interior.{drawGround,objects,outdoorObjects,drawObject,passable,interact}.
 * Coordinates use the same 24-unit tile grid as World; no DOM/UI is created here.
 */
(function (root) {
  'use strict';
  const T=24, WIDTH=24*T, HEIGHT=20*T, cache=new Map();
  const roomImages={},status={ready:false,loaded:0,missing:[]};
  const ready=Promise.all(['coop','barn'].map(kind=>new Promise(resolve=>{
    if(typeof Image==='undefined'){status.missing.push(kind);resolve(false);return;}
    const image=new Image();roomImages[kind]=image;
    image.onload=()=>{status.loaded++;cache.clear();resolve(true);};
    image.onerror=()=>{status.missing.push(kind);resolve(false);};
    image.src='assets/'+kind+'-interior.png';
  }))).then(results=>{status.ready=results.every(Boolean);if(root.dispatchEvent&&typeof CustomEvent!=='undefined')root.dispatchEvent(new CustomEvent('interior-art-ready',{detail:status}));return status;});
  const P={dark:'#604638',wood:'#a77d53',woodLight:'#d3ab79',cream:'#e8d6ac',straw:'#d5b667',strawLight:'#ead18a',ink:'#66523c'};
  const OUTDOOR={
    coop:{x0:4.8*T,y0:20.7*T,x1:11.6*T,y1:23.8*T,feed:{x:5.4*T,y:23.2*T}},
    barn:{x0:4.1*T,y0:33.2*T,x1:12.2*T,y1:37.3*T,feed:{x:5*T,y:36.9*T}}
  };
  const hash=(a,b=0)=>{let n=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  const seedOf=id=>Array.from(String(id)).reduce((n,ch)=>(Math.imul(n,31)+ch.charCodeAt(0))|0,17);
  const kindOf=a=>['cow','sheep'].includes(a.type)?'barn':'coop';
  const ell=(c,x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(color){c.fillStyle=color;c.fill();}};
  const round=(c,x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}};
  const line=(c,x,y,x2,y2,color,width=1)=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();};
  function grad(c,x,y,h,a,b){const g=c.createLinearGradient(x,y,x+h*.15,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
  function polygon(c,points,color){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();}
  function shadow(c,x,y,rx,ry,alpha=.2){const g=c.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,'rgba(63,44,26,'+alpha+')');g.addColorStop(1,'rgba(63,44,26,0)');c.save();c.translate(x,y);c.scale(1,ry/rx);ell(c,0,0,rx,rx,(()=>{const q=c.createRadialGradient(0,0,0,0,0,rx);q.addColorStop(0,'rgba(63,44,26,'+alpha+')');q.addColorStop(1,'rgba(63,44,26,0)');return q;})());c.restore();}
  function straw(c,x,y,rx,ry,seed=1,count=35){for(let n=0;n<count;n++){const a=hash(seed+n,4)*Math.PI*2,r=Math.sqrt(hash(seed,n+7));const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r,angle=hash(seed+n,11)*Math.PI;const len=2+hash(seed+n,12)*7;line(c,px,py,px+Math.cos(angle)*len,py+Math.sin(angle)*len*.4,n%3?'#ddc27d':'#b89855',.55+hash(seed,n)*.6);}}
  function windowPanel(c,x,y,w=80,h=48){
    shadow(c,x+w*.5,y+h+2,w*.55,5,.18);round(c,x-5,y-5,w+10,h+10,6,grad(c,x,y,h,'#a98154','#74543c'));round(c,x,y,w,h,4,grad(c,x,y,h,'#e8eee0','#afc2a4'));
    for(let i=0;i<4;i++){const bx=x+8+i*18;ell(c,bx,y+h-5,12,10,'#9caf7f');ell(c,bx+4,y+h-1,9,6,'#7e9b67');}
    line(c,x+w*.5,y,x+w*.5,y+h,'#b28e61',4);line(c,x,y+h*.52,x+w,y+h*.52,'#b28e61',3);round(c,x-7,y+h-2,w+14,9,3,grad(c,x,y+h,9,'#e2bd88','#ad8456'));
    c.fillStyle='rgba(255,246,210,.32)';polygon(c,[[x+4,y+4],[x+w*.38,y+4],[x+4,y+h*.6]],'rgba(255,255,231,.32)');
  }
  function hayBale(c,x,y,w=48,h=32){shadow(c,x+w/2,y+h,w*.55,5,.17);round(c,x,y,w,h,7,grad(c,x,y,h,'#dfc780','#b89b58'));for(let i=0;i<23;i++){const xx=x+2+hash(i,6)*(w-4);line(c,xx,y+3,xx+hash(i,8)*3,y+h-3,i%2?'#edda9c':'#b99a57',.5);}for(const xx of[x+w*.22,x+w*.77]){line(c,xx,y+1,xx,y+h-1,'#927a4c',2);line(c,xx+1,y+2,xx+1,y+h-2,'#d5be81',.6);}round(c,x+1,y+1,w-2,h-2,6,null,'rgba(255,238,185,.26)');}
  function background(kind){
    // The generated set supplies only architecture/materials. Every animal,
    // feed trough, water basin, nest and collectible remains a live object.
    const production=roomImages[kind];if(production?.complete&&production.naturalWidth)return production;
    const key=kind+':'+(root.Art?.theme||'clay');if(cache.has(key))return cache.get(key);const cv=document.createElement('canvas');cv.width=WIDTH*2;cv.height=HEIGHT*2;const c=cv.getContext('2d');c.scale(2,2);
    c.fillStyle='#655145';c.fillRect(0,0,WIDTH,HEIGHT);
    // The room is a roofless cutaway: back wall, raised side walls, broad floor.
    round(c,24,28,528,432,10,grad(c,24,28,432,'#c3a273','#92704f'));
    round(c,42,106,492,344,4,grad(c,42,106,344,kind==='barn'?'#c7ae7d':'#d2b688',kind==='barn'?'#ad8c5d':'#b39166'));
    for(let row=0;row<15;row++){const y=108+row*23;line(c,44,y,532,y,'rgba(104,73,44,.25)',1.1);line(c,44,y+1.3,532,y+1.3,'rgba(255,232,180,.24)',.7);for(let col=0;col<5;col++){const x=44+col*99+(row%2)*44;if(x<532)line(c,x,y,x,y+22,'rgba(110,78,49,.15)',.8);}}
    for(let i=0;i<1700;i++){const x=46+hash(i,17)*484,y=110+hash(i,18)*335;ell(c,x,y,.25+hash(i,19)*.6,.15+hash(i,20)*.3,i%2?'rgba(243,219,172,.19)':'rgba(98,71,42,.08)');}
    // Quiet straw bedding in the two pens, with a clear walking aisle.
    for(const x of[140,435]){ell(c,x,275,91,81,'rgba(205,173,101,.22)');straw(c,x,275,87,78,Math.floor(x),260);}
    polygon(c,[[95,107],[159,107],[294,390],[155,390]],'rgba(255,239,178,.12)');polygon(c,[[408,107],[462,107],[393,355],[312,355]],'rgba(255,239,178,.09)');
    // Back plaster/clay wall and heavy timber beams.
    round(c,30,30,516,82,7,grad(c,30,30,82,'#ddcaa2','#bea27a'));
    for(let y=40;y<105;y+=18){line(c,36,y,540,y,'rgba(145,111,74,.13)',.8);for(let x=54+(y%36?0:21);x<538;x+=40)line(c,x,y,x,y+17,'rgba(145,111,74,.1)',.6);}
    round(c,29,102,518,12,3,grad(c,29,102,12,'#a77f53','#75553b'));round(c,30,28,516,12,4,grad(c,30,28,12,'#b18d5c','#866444'));
    for(const x of[35,282,530]){round(c,x,32,10,79,3,grad(c,x,32,79,'#b08c5e','#8a6748'));line(c,x+2,36,x+2,106,'#d2ad75',.8);}
    windowPanel(c,100,45,77,45);windowPanel(c,398,45,77,45);
    // Side walls expose their thickness, without a tall front wall hiding play.
    round(c,24,106,22,344,5,grad(c,24,106,344,'#a47e55','#80603f'));round(c,530,106,22,344,5,grad(c,530,106,344,'#b08a5e','#856241'));line(c,44,115,44,440,'rgba(237,205,152,.46)',1.3);line(c,531,115,531,441,'rgba(68,49,31,.3)',1.6);
    for(const x of[27,533])for(let y=120;y<440;y+=32)line(c,x,y,x+14,y,'rgba(77,52,32,.2)',1);
    round(c,36,444,204,13,4,grad(c,36,444,13,'#bc9464','#7b593d'));round(c,336,444,204,13,4,grad(c,336,444,13,'#bc9464','#7b593d'));
    round(c,240,439,96,23,3,grad(c,240,439,23,'#a98459','#c6a174'));for(let x=247;x<334;x+=13)line(c,x,441,x,459,'rgba(83,60,39,.3)',.8);
    // Stacked hay and a small hanging keeper's sign belong to the scene.
    hayBale(c,55,121,45,29);hayBale(c,488,126,36,27);hayBale(c,476,146,44,27);
    round(c,230,52,116,37,5,grad(c,230,52,37,'#e9d3a3','#d1b07c'));c.fillStyle='#73583b';c.font='bold 12px "Microsoft YaHei",sans-serif';c.textAlign='center';c.fillText(kind==='coop'?'米粒的鸡舍':'海风牛棚',288,75);line(c,243,85,333,85,'#b89663',.6);
    cache.set(key,cv);return cv;
  }
  function drawGround(c,kind,time=0,state,viewport){
    if(!['coop','barn'].includes(kind))return false;c.save();c.imageSmoothingEnabled=true;c.drawImage(background(kind),0,0,WIDTH,HEIGHT);
    // Warm living light, but no blur on navigable surfaces.
    const night=root.Core?.calendar(state).night;if(night){c.fillStyle='rgba(37,48,65,.17)';c.fillRect(24,28,528,430);const glow=c.createRadialGradient(288,92,5,288,92,180);glow.addColorStop(0,'rgba(255,209,124,.18)');glow.addColorStop(1,'rgba(255,209,124,0)');c.fillStyle=glow;c.fillRect(108,0,360,272);}
    for(let i=0;i<12;i++){const x=100+hash(i,4)*350+Math.sin(time*.0004+i)*5,y=120+(hash(i,7)*280+time*.003)%280;c.fillStyle='rgba(255,239,192,.4)';ell(c,x,y,.45,.65,'rgba(255,239,192,.4)');}
    c.restore();return true;
  }
  function herd(state,kind){return(state.animals||[]).filter(a=>kindOf(a)===kind);}
  function isOutside(state,a,index){const cal=root.Core?.calendar(state);if(!cal||cal.night||cal.hour<8||cal.hour>=17||['rain','storm','snow'].includes(cal.weather))return false;const count=herd(state,kindOf(a)).length;if(count===1)return cal.hour>=10&&cal.hour<14;const keeper=cal.day%count;return index!==keeper&&(count<=3||index%2!==cal.day%2);}
  function interpolate(a,b,t){const q=Math.max(0,Math.min(1,t)),u=q*q*(3-2*q);return a+(b-a)*u;}
  function roam(a,index,time,bounds,feedPoint){
    const seed=seedOf(a.id),duration=14000+hash(seed,1)*5000,t=Math.max(0,time)+hash(seed,2)*duration,cycle=Math.floor(t/duration),phase=(t%duration)/duration;
    const target=n=>({x:bounds.x0+hash(seed,n*2+30)*(bounds.x1-bounds.x0),y:bounds.y0+hash(seed,n*2+31)*(bounds.y1-bounds.y0)});
    const from=target(cycle),to=target(cycle+1),walking=phase<.42,progress=Math.min(1,phase/.42);let x=interpolate(from.x,to.x,progress),y=interpolate(from.y,to.y,progress),pose=walking?'walk':phase<.72?'peck':phase<.88?'idle':'rest';
    // Freshly fed animals gather at the trough, then resume their own routine.
    const sinceFeed=Date.now()-(a.fedAt||0);if(sinceFeed>=0&&sinceFeed<11000&&feedPoint){const f=Math.min(1,sinceFeed/1800);x=interpolate(x,feedPoint.x,f);y=interpolate(y,feedPoint.y,f);pose=sinceFeed<1800?'walk':'eat';}
    const petAge=Date.now()-(a.lastPetAt||0);if(petAge>=0&&petAge<1300)pose='pet';
    return{x,y,dir:to.x>=from.x?'right':'left',pose,walk:walking?((t%540)/540):0,seed,petAge};
  }
  function entity(fields){return Object.assign({customRender:'interior',kind:'coop'},fields);}
  function animalEntities(state,kind,time,outside){
    const list=herd(state,kind),out=[];list.forEach((a,i)=>{
      if(isOutside(state,a,i)!==outside)return;
      const col=i%2,left=col===0,slot=Math.floor(i/2),rect=outside?OUTDOOR[kind]:{x0:left?84:368,y0:211+Math.min(3,slot)*18,x1:left?203:494,y1:342};
      const feed=outside?{x:OUTDOOR[kind].feed.x+20+(i%4)*16,y:OUTDOOR[kind].feed.y-12}:{x:left?132+(i%3)*16:410+(i%3)*16,y:195};
      const motion=roam(a,i,time,rect,feed),big=kind==='barn',size=big?(a.type==='cow'?48:40):24;
      out.push(entity({id:'live-'+a.id,name:a.type,animalId:a.id,animal:a,kind,x:motion.x,y:motion.y,w:size+6,h:big?42:29,label:a.name+(a.readyAt&&Date.now()>=a.readyAt?' · 可以收取':!a.readyAt?' · 肚子有点饿':' · 悠闲地休息'),interact:'livestockAnimal',outside,motion,drawKind:'animal'}));
      if(a.readyAt&&Date.now()>=a.readyAt){const produce=root.Core.ANIMALS[a.type].produce;out.push(entity({id:'produce-'+a.id,name:produce,animalId:a.id,kind,x:motion.x+(big?23:15),y:motion.y+4,w:20,h:18,label:'收取'+root.Core.ITEMS[produce].name,interact:'livestockProduce',outside,drawKind:'produce'}));}
    });return out;
  }
  function objects(kind,state,time=0){
    if(!['coop','barn'].includes(kind))return[];const list=[
      entity({id:kind+'-feed-left',kind,name:'crate',drawKind:'trough',x:150,y:194,w:104,h:54,label:'添上饲料',interact:'livestockFeed'}),
      entity({id:kind+'-feed-right',kind,name:'crate',drawKind:'trough',x:426,y:194,w:104,h:54,label:'添上饲料',interact:'livestockFeed'}),
      entity({id:kind+'-water',kind,name:'well',drawKind:'water',x:288,y:169,w:56,h:34,label:'清水槽',interact:'livestockWater'}),
      entity({id:kind+'-order',kind,name:'sign',drawKind:'order',x:480,y:407,w:48,h:57,label:kind==='coop'?'小鸡与小鸭认养牌':'奶牛与绵羊认养牌',interact:'livestockOrder'}),
      entity({id:kind+'-rail-left',kind,name:'fence',drawKind:'rail',x:138,y:369,w:154,h:27}),
      entity({id:kind+'-rail-right',kind,name:'fence',drawKind:'rail',x:438,y:369,w:154,h:27}),
      entity({id:kind+'-rail-side-left',kind,name:'fence',drawKind:'sideRail',x:230,y:274,w:10,h:83}),
      entity({id:kind+'-rail-side-right',kind,name:'fence',drawKind:'sideRail',x:346,y:274,w:10,h:83})
    ];
    if(kind==='coop')for(let i=0;i<3;i++)list.push(entity({id:'nest-'+i,kind,name:'crate',drawKind:'nest',x:105+i*40,y:149,w:37,h:24}));
    else list.push(entity({id:'barn-brush',kind,name:'barrel',drawKind:'brush',x:69,y:420,w:25,h:28}));
    return list.concat(animalEntities(state,kind,time,false));
  }
  function outdoorObjects(state,time=0){
    const list=[];for(const kind of['coop','barn']){const animals=animalEntities(state,kind,time,true);list.push(...animals);if(animals.length){const p=OUTDOOR[kind].feed;list.push(entity({id:'outdoor-'+kind+'-feed',kind,name:'crate',drawKind:'trough',x:p.x,y:p.y,w:40,h:21,label:'院里的饲料槽',interact:'livestockFeed',outside:true}));}}
    return list;
  }
  function drawRail(c,o){
    const x=o.x-o.w/2,y=o.y;shadow(c,o.x,y,o.w*.5,4,.18);
    if(root.Art?.names?.includes('fence')){const count=Math.ceil(o.w/31),step=o.w/count;for(let i=0;i<count;i++)root.Art.draw(c,'fence',x+step*(i+.5),y+1,{scale:1.45});return;}
    round(c,x,y-20,o.w,7,2,grad(c,x,y-20,7,'#c58f51','#82532d'));for(let xx=x+3;xx<x+o.w;xx+=32)round(c,xx,y-27,7,29,2,grad(c,xx,y-27,29,'#d0a167','#96602f'));
  }
  function troughBody(c,o){
    const w=o.w,h=o.h;c.save();c.translate(o.x,o.y);c.scale(w/42,h/24);
    if(root.Art?.names?.includes('trough'))root.Art.draw(c,'trough',0,0);
    else{round(c,-21,-20,42,18,3,grad(c,-21,-20,18,'#bc884e','#815329'));round(c,-17,-19,34,8,2,'#644326');}
    c.restore();
  }
  function troughOpening(c,o,fill){
    const w=o.w,h=o.h;c.beginPath();c.moveTo(o.x-w*.34,o.y-h*.76);c.quadraticCurveTo(o.x,o.y-h*.82,o.x+w*.34,o.y-h*.76);c.lineTo(o.x+w*.33,o.y-h*.51);c.quadraticCurveTo(o.x,o.y-h*.45,o.x-w*.33,o.y-h*.51);c.closePath();c.fillStyle=fill;c.fill();
  }
  function drawTrough(c,o,state,time){
    const w=o.w,h=o.h;troughBody(c,o);const fed=herd(state,o.kind).some(a=>a.readyAt>Date.now());
    // The photographic clay sprite retains its wooden rim, feet and grain.
    // Only the recessed food surface changes when the feeding state changes.
    if(!fed){troughOpening(c,o,grad(c,o.x,o.y-h*.78,h*.29,'#745126','#ad7b38'));for(let i=0;i<7;i++){const x=o.x-w*.28+hash(i,2)*w*.56,y=o.y-h*.72+hash(i,3)*h*.17;line(c,x,y,x+2.5,y+.6,'#c6a35a',.65);}}
    const recent=Date.now()-(state.livestockTroughs?.[o.kind]||0);if(recent>=0&&recent<1500)for(let i=0;i<8;i++){const x=o.x-w*.27+i*w*.54/8,y=o.y-h*.92+(recent/1500)*h*.28;ell(c,x,y+Math.sin(i)*2,1,1.5,'#e4ba57');}
  }
  function drawWater(c,o,time,state){
    const vessel={...o,w:60,h:35};troughBody(c,vessel);troughOpening(c,vessel,grad(c,o.x,o.y-27,12,'#7baaa0','#376e70'));
    c.strokeStyle='rgba(225,238,202,.7)';c.lineWidth=.65;for(let i=0;i<2;i++){c.beginPath();c.ellipse(o.x+Math.sin(time*.0007+i)*2,o.y-22,11+i*5,1.5+i*.5,0,0,Math.PI*2);c.stroke();}
  }
  function drawOrder(c,o){const x=o.x,y=o.y;shadow(c,x,y+2,20,3,.18);round(c,x-3,y-47,6,48,2,grad(c,x,y-47,48,'#be9968','#8f6748'));round(c,x-24,y-56,48,41,5,grad(c,x,y-56,41,'#c49a68','#9c744b'));round(c,x-19,y-52,38,31,3,grad(c,x,y-52,31,'#f1dfb9','#d8c198'));c.fillStyle='#806749';c.font='bold 8px "Microsoft YaHei",sans-serif';c.textAlign='center';c.fillText('认养小伙伴',x,y-39);line(c,x-12,y-32,x+12,y-32,'#ae9571',.8);ell(c,x-2,y-25,1,1,'#b98861');}
  function drawNest(c,o){if(root.Art?.names?.includes('nest'))return root.Art.draw(c,'nest',o.x,o.y);const x=o.x,y=o.y;shadow(c,x,y+1,18,3,.14);round(c,x-18,y-24,36,25,3,grad(c,x,y-24,25,'#bc9763','#8a6744'));round(c,x-14,y-20,28,19,5,'#705338');ell(c,x,y-4,12,4,'#bda063');straw(c,x,y-5,11,3,Math.floor(x),18);line(c,x-18,y-23,x+18,y-23,'#d9b47a',1);}
  function drawAnimal(c,o,time,state){
    const a=o.animal,m=o.motion,big=o.kind==='barn',scale=big?(a.type==='cow'?1.45:1.4):a.type==='duck'?1.3:1.35;
    const bob=m.pose==='walk'?Math.sin(time*.014+m.seed)*.9:m.pose==='eat'||m.pose==='peck'?Math.sin(time*.006+m.seed)*.8:Math.sin(time*.0018+m.seed)*.15;
    c.save();c.translate(o.x,o.y+bob);if(m.dir==='left')c.scale(-1,1);
    if(m.pose==='rest'){c.scale(1.05,.88);c.translate(0,1);}else if(m.pose==='eat'||m.pose==='peck'){c.rotate(Math.sin(time*.005+m.seed)*.045);c.translate(0,1.2);}else if(m.pose==='pet'){c.rotate(Math.sin(time*.016)*.035);}
    if(root.Art)root.Art.draw(c,a.type,0,0,{scale,time});
    else{ell(c,0,-10,big?17:9,big?12:8,grad(c,-10,-22,24,'#f3e4bd','#baa380'));ell(c,big?14:7,-13,big?8:5,big?9:5,'#e9d6aa');}
    // A few moving body details complement the sculpted sprite silhouette.
    if(big){const tailX=-15,tailY=-15;c.beginPath();c.moveTo(tailX,tailY);c.quadraticCurveTo(tailX-6,tailY+Math.sin(time*.002+m.seed)*3,tailX-3,tailY+8);c.strokeStyle=a.type==='cow'?'#9b8c72':'#c9bda3';c.lineWidth=1.1;c.stroke();}
    c.restore();
    if(m.petAge>=0&&m.petAge<1700){const alpha=1-m.petAge/1700;c.save();c.globalAlpha=alpha;const y=o.y-(big?46:31)-m.petAge/130;if(root.Art)root.Art.icon(c,'heart',o.x-6,y,12);c.restore();}
    const near=state.scene===(o.outside?'farm':o.kind)&&Math.hypot((state.player?.x||0)-o.x,(state.player?.y||0)-o.y)<95;
    if(near&&!a.readyAt){c.save();round(c,o.x-7,o.y-(big?48:36),14,13,5,'rgba(248,232,192,.91)');if(root.Art)root.Art.icon(c,'hay',o.x-5,o.y-(big?47:35),10);c.restore();}
  }
  function drawObject(c,o,time=0,state){if(!o?.customRender||o.customRender!=='interior')return false;c.save();c.imageSmoothingEnabled=true;
    switch(o.drawKind){
      case'animal':drawAnimal(c,o,time,state);break;
      case'produce':{shadow(c,o.x,o.y,10,2,.15);straw(c,o.x,o.y-1,9,3,seedOf(o.id),12);if(root.Art)root.Art.icon(c,o.name,o.x-8,o.y-15,16);else ell(c,o.x,o.y-7,5,7,'#f5e7c7');break;}
      case'trough':drawTrough(c,o,state,time);break;
      case'water':drawWater(c,o,time,state);break;
      case'order':drawOrder(c,o);break;
      case'rail':drawRail(c,o);break;
      case'sideRail':for(let y=o.y-o.h+23;y<=o.y;y+=20){if(root.Art)root.Art.draw(c,'fence',o.x,y,{orientation:'vertical',scale:1.2});else round(c,o.x-3,y-16,6,26,2,'#a27340');}break;
      case'exit':{round(c,o.x-31,o.y-7,62,17,4,grad(c,o.x,o.y-7,17,'#bb915c','#88643d'));for(let i=0;i<12;i++)line(c,o.x-27+i*5,o.y-5,o.x-27+i*5,o.y+7,'#d0ac72',.5);round(c,o.x-25,o.y-5,50,13,2,'rgba(121,84,43,.45)');c.fillStyle='#f3dba7';c.font='bold 8px "Microsoft YaHei",sans-serif';c.textAlign='center';c.fillText('回到农场 ↓',o.x,o.y+4);break;}
      case'nest':drawNest(c,o);break;
      case'brush':if(root.Art)root.Art.draw(c,'barrel',o.x,o.y,{scale:1});line(c,o.x-3,o.y-20,o.x+5,o.y-36,'#aa8056',3);round(c,o.x+2,o.y-40,9,8,2,'#9e8e66');break;
    }
    c.restore();return true;
  }
  const colliders=[
    {x:43,y:132,w:52,h:34},{x:482,y:132,w:48,h:41},
    {x:98,y:176,w:104,h:18},{x:374,y:176,w:104,h:18},{x:260,y:146,w:56,h:23},
    {x:61,y:362,w:154,h:8},{x:361,y:362,w:154,h:8},
    {x:226,y:198,w:8,h:77},{x:342,y:198,w:8,h:77},
    {x:463,y:385,w:34,h:20}
  ];
  function passable(kind,x,y,state,time){
    if(!['coop','barn'].includes(kind))return true;if(!Number.isFinite(x)||!Number.isFinite(y))return false;
    if(y>=440)return x>=247&&x<=329&&y<HEIGHT;
    if(x<51||x>525||y<145||y>440)return false;
    return!colliders.some(r=>x>r.x-4&&x<r.x+r.w+4&&y>r.y-3&&y<r.y+r.h+3);
  }
  function interact(state,obj,now=Date.now()){
    const Core=root.Core;if(!Core||!obj)return{ok:false,message:'没有找到可以互动的对象。'};
    if(obj.interact==='livestockFeed')return Core.feedHerd(state,obj.kind,now);
    if(obj.interact==='livestockAnimal'||obj.interact==='livestockProduce'){
      const a=(state.animals||[]).find(a=>a.id===obj.animalId);if(!a)return{ok:false,message:'它走到另一边去了。'};
      if(a.readyAt&&a.readyAt<=now)return Core.collectAnimal(state,a.id,now);
      if(obj.interact==='livestockProduce')return{ok:false,message:'这份产物已经收好了。'};
      return Core.petAnimal(state,a.id,now);
    }
    if(obj.interact==='livestockWater'){state.livestockWatered=state.livestockWatered||{};state.livestockWatered[obj.kind]=now;return{ok:true,message:'给清水槽换上了新水，小伙伴们都有清水喝。',effect:'water',kind:obj.kind};}
    if(obj.interact==='livestockOrder')return{ok:true,message:obj.kind==='coop'?'从农场伙伴里认养小鸡或小鸭。':'从农场伙伴里认养奶牛或绵羊。',openOrder:obj.kind};
    return{ok:false,message:'这里是小伙伴们安稳的家。'};
  }
  const Interior={drawGround,objects,outdoorObjects,drawObject,passable,interact,isOutside,kindOf,WIDTH,HEIGHT,OUTDOOR,ready,status};
  root.Interior=Interior;root.Interiors=Interior;if(typeof module!=='undefined'&&module.exports)module.exports=Interior;
})(typeof window!=='undefined'?window:globalThis);
