const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SAVE='before-rain-zero-v1';
const fresh={water:0,power:0,bio:0,science:0,condenser:0,solar:0,moss:0,tower:false,clickLevel:1,totalWater:0,log:0,last:Date.now(),intro:false,stage:1,stage2Started:false,algae:0,soilBeds:0,grass:0,insects:0,humidity:12,oxygen:3,fertility:5,tech:[],naturalRain:false,scanAt:0};
let state={...fresh},lastFrame=performance.now(),toastTimer;
try{const saved=JSON.parse(localStorage.getItem(SAVE));if(saved)state={...fresh,...saved}}catch(e){}
if(!Array.isArray(state.tech))state.tech=[];
const clickNames=['破损集水器','冷凝滤网','毛细收集膜','静电凝水器','云雾捕获阵列'];
const clickGains=[1,3,8,25,80],clickCosts=[null,{water:100},{water:250,power:20},{water:600,science:10},{water:1500,science:30}];
const techDefs={
 capillary:{cost:10,req:['root'],name:'毛细收集膜'},photovoltaic:{cost:12,req:['root'],name:'高效光伏'},algaeTech:{cost:10,req:['root'],name:'藻类培养'},
 microCondense:{cost:24,req:['capillary'],name:'微孔冷凝'},cloudSeed:{cost:45,req:['capillary'],name:'生物云核'},storage:{cost:28,req:['photovoltaic'],name:'固态储能'},
 soilTech:{cost:22,req:['algaeTech'],name:'土壤微生物'},grassTech:{cost:34,req:['soilTech'],name:'蒸腾草甸'},insectTech:{cost:48,req:['grassTech'],name:'昆虫基因库'},
 symbiosis:{cost:58,req:['grassTech'],name:'共生网络'},naturalCycle:{cost:80,req:['cloudSeed','insectTech','symbiosis'],name:'自然水循环'}
};
const logs=['“如果你还能看到这段信息，请让这颗星球再下一次雨。”','记录 2847-09-12：大气循环已停止。我们把最后一颗种子送进零号塔。','天幕计划接管了所有气象节点。它说，这是伤亡最少的方案。','不要只恢复机器。让苔藓、河流与云自己找到彼此。','零，你的任务从来不是控制天气。你的任务，是学会何时放手。','档案 02：最稳定的系统不是从不犯错，而是能在偏离后重新找到平衡。','监测记录：藻类正在改变水体含氧量。仪器第一次无法预测每一个变量。','地下信号重复请求关闭地表生态。发送者拒绝提供身份验证。'];
const has=t=>t==='root'||state.tech.includes(t);
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(2)+'K':n<100?n.toFixed(1).replace('.0',''):Math.floor(n).toLocaleString();
function toast(msg){const e=$('#toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),1900)}
function save(){state.last=Date.now();localStorage.setItem(SAVE,JSON.stringify(state))}
function clickValue(){return clickGains[Math.min(4,state.clickLevel-1)]*(has('capillary')?1.5:1)}
function rates(){return{water:state.condenser*1.15*(1+state.moss*.12)*(has('microCondense')?1.35:1)+state.algae*.35,power:state.solar*.72*(has('photovoltaic')?1.3:1),bio:state.moss*.24+state.algae*.42+state.grass*.85,science:state.stage>=2?state.algae*.025+state.insects*.065:0}}
function costs(){return{condenser:Math.floor(40*Math.pow(1.57,state.condenser)),solar:Math.floor(60*Math.pow(1.68,state.solar)),moss:{water:Math.floor(120*Math.pow(1.58,state.moss)),power:Math.floor(20*Math.pow(1.45,state.moss))},algae:{water:Math.floor(280*Math.pow(1.55,state.algae)),power:Math.floor(45*Math.pow(1.42,state.algae))},soil:{water:Math.floor(420*Math.pow(1.6,state.soilBeds)),bio:Math.floor(35*Math.pow(1.5,state.soilBeds))},grass:{water:Math.floor(650*Math.pow(1.62,state.grass)),bio:Math.floor(80*Math.pow(1.48,state.grass))},insects:{water:Math.floor(900*Math.pow(1.65,state.insects)),bio:Math.floor(150*Math.pow(1.5,state.insects))}}}
function startStage2(){if(state.stage<2)state.stage=2;if(!state.stage2Started){state.stage2Started=true;state.science+=30;state.humidity=Math.max(25,state.humidity);state.oxygen=Math.max(8,state.oxygen);state.fertility=Math.max(12,state.fertility);toast('阶段 II 解锁 · 获得 30 科研数据');save()}}
function upgradeCollector(){if(state.clickLevel>=5)return toast('集水器已达到当前阶段上限');const c=clickCosts[state.clickLevel];if(state.water<c.water||(c.power&&state.power<c.power)||(c.science&&state.science<c.science))return toast('升级集水器所需资源不足');state.water-=c.water;if(c.power)state.power-=c.power;if(c.science)state.science-=c.science;state.clickLevel++;toast('升级为'+clickNames[state.clickLevel-1]+' · 每次 +'+fmt(clickValue())+' mL');save();render()}
function gainFloat(v){const z=$('.collector-zone'),f=document.createElement('span');f.className='gain-float';f.textContent='+'+fmt(v)+' mL';f.style.left=48+Math.random()*30+'px';f.style.top=28+Math.random()*25+'px';z.appendChild(f);setTimeout(()=>f.remove(),950)}
function mission(){
 if(state.stage<2){if(!state.condenser)return{n:1,t:'收集空气中的水分',p:'修复自动系统前，只能依靠破损集水器凝结微量水汽。',v:state.water,m:40,u:'mL'};if(!state.solar)return{n:2,t:'恢复能源系统',p:'修复太阳能阵列，为控制塔重新供电。',v:state.water,m:60,u:'mL'};if(!state.moss)return{n:3,t:'唤醒第一株植物',p:'在塔基播种耐旱苔藓，增强自然湿度。',v:Math.min(state.water/120,state.power/20),m:1,u:''};return{n:4,t:'制造第一场人工降雨',p:'储备水分、能源与生物质，启动零号气候塔。',v:Math.min(state.water/500,state.power/120,state.bio/30),m:1,u:''}}
 if(!has('algaeTech'))return{n:6,t:'研究藻类培养',p:'打开科技树，建立第一条可持续生态生产链。',v:state.science,m:10,u:'科研'};
 if(!state.algae)return{n:7,t:'让静水重新呼吸',p:'建造藻类培养池，提高水体含氧量并持续产生科研数据。',v:Math.min(state.water/280,state.power/45),m:1,u:''};
 if(!state.soilBeds)return{n:8,t:'重建活性土壤',p:'研究土壤微生物，并铺设第一块活性土壤。',v:has('soilTech')?Math.min(state.water/420,state.bio/35):state.science/22,m:1,u:''};
 if(!state.grass)return{n:9,t:'让草地越过河床',p:'建立蒸腾草甸，推动湿度、氧气与土壤协同增长。',v:has('grassTech')?Math.min(state.water/650,state.bio/80):state.science/34,m:1,u:''};
 if(!state.insects)return{n:10,t:'补全食物链的第一环',p:'解锁昆虫基因库，让授粉与分解循环开始运转。',v:has('insectTech')?Math.min(state.water/900,state.bio/150):state.science/48,m:1,u:''};
 if(!has('naturalCycle'))return{n:11,t:'让机器学会退场',p:'完成生物云核、共生网络和自然水循环研究。',v:[has('cloudSeed'),has('symbiosis'),has('naturalCycle')].filter(Boolean).length,m:3,u:'节点'};
 if(!state.naturalRain)return{n:12,t:'等待一场不受控制的雨',p:'把湿度、氧气和土壤恢复到稳定阈值。',v:Math.min(state.humidity/70,state.oxygen/55,state.fertility/60),m:1,u:''};
 return{n:13,t:'区域生态已经学会呼吸',p:'第一个自然水循环已稳定。新的区域正在等待唤醒。',v:1,m:1,u:''}
}
function card(t,i,title,desc,level,cost,extra=''){return'<button class="build-card '+extra+'" data-build="'+t+'"><span class="build-icon">'+i+'</span><span class="build-copy"><b>'+title+'</b><small>'+desc+'</small></span><span class="build-meta"><em>'+level+'</em><strong>'+cost+'</strong></span></button>'}
let lastDockHTML='';
function renderDock(){const d=$('#buildDock'),c=costs();let html;
 if(state.stage<2)html='<div class="dock-label"><span>建设</span><small>区域 01 · 干涸河床</small></div>'+card('condenser','◌','自动冷凝装置','持续收集水分','Lv.'+state.condenser,c.condenser+' 水')+card('solar','☼','修复太阳能阵列','恢复塔区供电',state.solar?'Lv.'+state.solar:'离线',c.solar+' 水')+card('moss','⌁','播种耐旱苔藓','增加湿度与生物质',state.moss?'Lv.'+state.moss:'未发现',c.moss.water+' 水 · '+c.moss.power+' 电')+card('tower','⌬','启动人工降雨','阶段 I 最终工程',state.tower?'已启动':'未启动','500 水 · 120 电 · 30 生物质','climate');
 else html='<div class="dock-label"><span>生态建设</span><small>区域 01 · 雨后湿地</small></div>'+card('algae','◌','藻类培养池','产氧 · 科研数据','Lv.'+state.algae,c.algae.water+' 水 · '+c.algae.power+' 电')+card('soil','⬡','活性土壤床','提升土壤肥力','Lv.'+state.soilBeds,c.soil.water+' 水 · '+c.soil.bio+' 生物质')+card('grass','⌁','蒸腾草甸','湿度 · 氧气 · 生物质','Lv.'+state.grass,c.grass.water+' 水 · '+c.grass.bio+' 生物质')+card('insects','✣','昆虫栖息地','授粉 · 分解 · 科研','Lv.'+state.insects,c.insects.water+' 水 · '+c.insects.bio+' 生物质','climate');
 if(html===lastDockHTML)return;
 lastDockHTML=html;d.innerHTML=html;
 $$('[data-build]').forEach(b=>b.addEventListener('click',()=>build(b.dataset.build)))
}
function unlocked(t){if(state.stage<2)return t==='condenser'||t==='solar'&&(state.condenser>0||state.totalWater>=40)||t==='moss'&&state.solar>0||t==='tower'&&state.moss>0;return{algae:has('algaeTech'),soil:has('soilTech')&&state.algae>0,grass:has('grassTech')&&state.soilBeds>0,insects:has('insectTech')&&state.grass>0}[t]}
function build(type){const c=costs();
 if(type==='condenser'){if(state.water<c.condenser)return toast('水分不足');state.water-=c.condenser;state.condenser++}
 else if(type==='solar'){if(state.water<c.solar)return toast('水分不足');state.water-=c.solar;state.solar++;toast('太阳能阵列重新上线')}
 else if(type==='moss'){if(state.water<c.moss.water||state.power<c.moss.power)return toast('资源不足');state.water-=c.moss.water;state.power-=c.moss.power;state.moss++;toast('耐旱苔藓开始扩张')}
 else if(type==='tower'){if(state.tower)return;if(state.water<500||state.power<120||state.bio<30)return toast('气候塔启动资源不足');state.water-=500;state.power-=120;state.bio-=30;state.tower=true;save();return rainEvent()}
 else if(type==='algae'){if(!has('algaeTech'))return toast('需要科技：藻类培养');if(state.water<c.algae.water||state.power<c.algae.power)return toast('资源不足');state.water-=c.algae.water;state.power-=c.algae.power;state.algae++;state.science+=5;state.oxygen+=7;state.humidity+=4;toast('藻类培养池上线 · 水体开始产生氧气')}
 else if(type==='soil'){if(!has('soilTech'))return toast('需要科技：土壤微生物');if(state.water<c.soil.water||state.bio<c.soil.bio)return toast('资源不足');state.water-=c.soil.water;state.bio-=c.soil.bio;state.soilBeds++;state.science+=7;state.fertility+=12;toast('活性土壤形成 · 微生物网络苏醒')}
 else if(type==='grass'){if(!has('grassTech'))return toast('需要科技：蒸腾草甸');if(state.water<c.grass.water||state.bio<c.grass.bio)return toast('资源不足');state.water-=c.grass.water;state.bio-=c.grass.bio;state.grass++;state.science+=9;state.humidity+=10;state.oxygen+=8;toast('草甸越过干涸河床')}
 else if(type==='insects'){if(!has('insectTech'))return toast('需要科技：昆虫基因库');if(state.water<c.insects.water||state.bio<c.insects.bio)return toast('资源不足');state.water-=c.insects.water;state.bio-=c.insects.bio;state.insects++;state.science+=12;state.fertility+=10;toast('授粉与分解循环已经建立')}
 save();render()
}
function techAvailable(id){return techDefs[id]&&techDefs[id].req.every(has)}
function buyTech(id){if(id==='root'||has(id))return;const d=techDefs[id];if(!techAvailable(id))return toast('前置科技尚未完成');if(state.science<d.cost)return toast('科研数据不足');state.science-=d.cost;state.tech.push(id);if(id==='capillary'&&state.clickLevel<2)state.clickLevel=2;toast('科技完成：'+d.name);save();render()}
function scanArchive(){const remain=Math.ceil((state.scanAt+60000-Date.now())/1000);if(remain>0)return toast('档案扫描冷却 '+remain+' 秒');state.scanAt=Date.now();state.science+=8;state.log=Math.min(logs.length-1,state.log+1);toast('发现旧文明气候记录 · +8 科研数据');save();render()}
function makeRain(){if($('#rain').children.length)return;for(let i=0;i<80;i++){const d=document.createElement('i');d.className='drop';d.style.left=Math.random()*110+'%';d.style.animationDuration=.55+Math.random()*.75+'s';d.style.animationDelay=-Math.random()*2+'s';$('#rain').appendChild(d)}}
function rainEvent(){makeRain();$('#rain').classList.add('active');$('#pulseRing').classList.add('go');setTimeout(()=>$('#rainEvent').classList.add('show'),1200);save();render()}
function checkNaturalRain(){if(state.naturalRain||!has('naturalCycle'))return;if(state.humidity>=70&&state.oxygen>=55&&state.fertility>=60){state.naturalRain=true;$('#rain').classList.remove('active');setTimeout(()=>$('#naturalEvent').classList.add('show'),700);save()}}
function render(){if(state.tower&&state.stage>=2)startStage2();const r=rates(),m=mission();
 $('#water').textContent=fmt(state.water)+' mL';$('#power').textContent=fmt(state.power);$('#bio').textContent=fmt(state.bio);$('#science').textContent=fmt(state.science);$('#waterRate').textContent='+'+fmt(r.water)+' /秒';$('#powerRate').textContent='+'+fmt(r.power)+' /秒';$('#bioRate').textContent='+'+fmt(r.bio)+' /秒';$('#scienceRes em').textContent=state.stage>=2?'+'+fmt(r.science)+' /秒':'区域 II 解锁';$('#scienceRes').classList.toggle('locked',state.stage<2);$('#techScience').textContent=fmt(state.science);
 $('#phaseLabel').textContent='阶段 '+(state.stage>=2?'II':'I');$('#phaseName').textContent=state.stage>=2?'生命萌芽':'荒漠苏醒';let prog=state.stage>=2?((state.algae>0)+(state.soilBeds>0)+(state.grass>0)+(state.insects>0)+(state.naturalRain?2:0))/6*100:Math.min(100,(state.totalWater/40)*15+state.condenser*10+state.solar*12+state.moss*14+(state.tower?35:0));$('#phaseBar').style.width=Math.min(100,prog)+'%';
 const mp=Math.min(100,m.v/m.m*100);$('.mission-kicker').textContent='当前任务 / '+String(m.n).padStart(2,'0');$('#missionTitle').textContent=m.t;$('#missionText').textContent=m.p;$('#missionBar').style.width=mp+'%';$('#missionCount').textContent=m.m===1?Math.floor(mp)+'%':fmt(Math.min(m.v,m.m))+' / '+m.m+' '+m.u;
 const v=clickValue(),next=clickCosts[state.clickLevel];$('#clickGain').textContent='每次 +'+fmt(v)+' mL';$('#collectorName').textContent=clickNames[state.clickLevel-1];$('#collectorLevel').textContent='Lv.'+state.clickLevel;$('#collectorUpgradeCost').textContent=next?'升级 · '+next.water+' 水'+(next.power?' · '+next.power+' 电':'')+(next.science?' · '+next.science+' 科研':''):'当前阶段已满级';
 $('#techBtn').classList.toggle('visible',state.stage>=2);$('#ecoReadout').classList.toggle('visible',state.stage>=2);[['humidity','humidity'],['oxygen','oxygen'],['fertility','soil']].forEach(([k,id])=>{$('#'+k).textContent=Math.floor(state[k])+'%';$('#'+id+'Bar').style.width=Math.min(100,state[k])+'%'});$('#ecoStatus').textContent=state.naturalRain?'自然循环':has('naturalCycle')?'临界稳定':'人工维持';
 $('#restoredLayer').style.opacity=state.tower?1:Math.min(.58,state.moss*.11+state.bio/220);const eco=Math.min(1,(state.humidity+state.oxygen+state.fertility)/240);$('#forestLayer').style.opacity=state.stage>=2?(state.naturalRain?1:eco*.72):0;$('#logText').textContent=logs[state.log];$('#logIndex').textContent=String(state.log+1).padStart(2,'0')+' / '+String(logs.length).padStart(2,'0');
 $$('.tech-node').forEach(n=>{const id=n.dataset.tech;n.classList.toggle('owned',has(id));n.classList.toggle('available',!has(id)&&techAvailable(id));n.disabled=id!=='root'&&!has(id)&&!techAvailable(id)});$('#techBadge').style.display=Object.keys(techDefs).some(id=>!has(id)&&techAvailable(id)&&state.science>=techDefs[id].cost)?'inline-grid':'none';const rem=Math.ceil((state.scanAt+60000-Date.now())/1000);$('#scanCooldown').textContent=rem>0?rem+' 秒':'+8 ◇';
 renderDock();$$('[data-build]').forEach(b=>{const u=unlocked(b.dataset.build);b.disabled=!u;b.classList.toggle('locked-build',!u)});checkNaturalRain()
}
$('#collectBtn').addEventListener('click',()=>{const v=clickValue();state.water+=v;state.totalWater+=v;if(state.stage>=2&&has('capillary'))state.science+=.02;gainFloat(v);render()});
$('#collectorUpgrade').addEventListener('click',upgradeCollector);$('#nextLog').addEventListener('click',()=>{state.log=(state.log+1)%logs.length;render();save()});
$('#wakeBtn').addEventListener('click',()=>{state.intro=true;$('#intro').classList.add('hidden');save();setTimeout(()=>toast('点击集水器，收集 40 mL 水分'),600)});
$('#continueBtn').addEventListener('click',()=>{$('#rainEvent').classList.remove('show');startStage2();render()});
let lastTechFocus=null;
function openTech(){if(state.stage<2)return;lastTechFocus=document.activeElement;$('#techModal').classList.add('show');$('#techBtn').setAttribute('aria-expanded','true');render();requestAnimationFrame(()=>$('#closeTech').focus())}
function closeTech(){if(!$('#techModal').classList.contains('show'))return;$('#techModal').classList.remove('show');$('#techBtn').setAttribute('aria-expanded','false');if(lastTechFocus&&lastTechFocus.focus)lastTechFocus.focus()}
$('#techBtn').setAttribute('aria-expanded','false');$('#techBtn').addEventListener('click',openTech);$('#closeTech').addEventListener('click',closeTech);$('#techModal').addEventListener('click',e=>{if(e.target===$('#techModal'))closeTech()});
$$('.tech-node').forEach(n=>n.addEventListener('click',()=>buyTech(n.dataset.tech)));$('#archiveScan').addEventListener('click',scanArchive);
$('#finishStage2').addEventListener('click',()=>{$('#naturalEvent').classList.remove('show');toast('阶段 III 区域地图将在后续更新开放');save()});
$('#resetBtn').addEventListener('click',()=>{if(confirm('确定清除零号塔的全部进度？')){localStorage.removeItem(SAVE);location.reload()}});$('#soundBtn').addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent==='◒'?'○':'◒';toast(e.currentTarget.textContent==='◒'?'环境音已开启':'环境音已关闭')});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&$('#techModal').classList.contains('show')){e.preventDefault();closeTech();return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 const interactive=e.target.closest&&e.target.closest('button,input,textarea,select,a,[contenteditable="true"]');
 if(interactive)return;
 if(e.key.toLowerCase()==='t'&&state.stage>=2){e.preventDefault();openTech();return}
 if(e.code==='Space'&&!$('#techModal').classList.contains('show')&&$('#intro').classList.contains('hidden')){e.preventDefault();$('#collectBtn').click()}
});
let treeX=0,treeY=0,treeScale=1,drag=null;const canvas=$('#treeCanvas'),viewport=$('#treeViewport');function treeTransform(){canvas.style.transform='translate('+treeX+'px,'+treeY+'px) scale('+treeScale+')'}
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.tech-node'))return;drag={x:e.clientX-treeX,y:e.clientY-treeY};viewport.setPointerCapture(e.pointerId)});viewport.addEventListener('pointermove',e=>{if(!drag)return;treeX=e.clientX-drag.x;treeY=e.clientY-drag.y;treeTransform()});viewport.addEventListener('pointerup',()=>drag=null);viewport.addEventListener('wheel',e=>{e.preventDefault();treeScale=Math.max(.7,Math.min(1.35,treeScale+(e.deltaY<0?.08:-.08)));treeTransform()},{passive:false});
if(state.intro)$('#intro').classList.add('hidden');if(state.tower){makeRain();if(!state.naturalRain)$('#rain').classList.add('active')}
const offline=Math.min(has('storage')?28800:14400,Math.max(0,(Date.now()-state.last)/1000));if(offline>5){const r=rates();state.water+=r.water*offline;state.power+=r.power*offline;state.bio+=r.bio*offline;state.science+=r.science*offline;setTimeout(()=>toast('离线 '+Math.floor(offline/60)+' 分钟 · 生态系统持续运行'),800)}
setInterval(()=>{const now=performance.now(),dt=Math.min(.6,(now-lastFrame)/1000);lastFrame=now;const r=rates();state.water+=r.water*dt;state.power+=r.power*dt;state.bio+=r.bio*dt;state.science+=r.science*dt;if(state.stage>=2){state.humidity=Math.min(100,state.humidity+(state.algae*.005+state.grass*.012)*dt);state.oxygen=Math.min(100,state.oxygen+(state.algae*.007+state.grass*.009)*dt);state.fertility=Math.min(100,state.fertility+(state.soilBeds*.012+state.insects*.01)*dt)}render()},500);
setInterval(save,5000);render();
