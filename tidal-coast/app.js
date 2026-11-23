(function () {
'use strict';
const $ = id => document.getElementById(id), T = 24;
const canvas = $('world'), ctx = canvas.getContext('2d');
const loaded = Core.load(); let state = loaded || Core.newGame();
let scene = state.scene, player = state.player, modal = null, selected = 'hoe';
let logicalW = 680, logicalH = 400, scale = 2, zoom = 2, dpr = 1, camera = {x:0,y:0}, cameraReady = false;
let keys = {}, joy = {x:0,y:0}, path = [], queued = null, pointer = null, hover = null;
let time = 0, lastFrame = 0, lastHud = 0, lastSave = 0, actionAt = -10, portalCooldown = 0;
let walkPhase = 0, moving = false, particles = [], floats = [], actionFx = null, fish = null;
let placement=null, lastSimulation=0, lastFootstep=0, showGrid=false;
let panelReturnFocus=null, bagFilter='all', bagSelection=null, toolNoticeUntil=0;
let cat = window.CatAI ? CatAI.create(state) : {x:12*T,y:16*T,dir:'right'}, audioCtx = null, sessionStart = Date.now();
const toolList = [
 {id:'hand',name:'空手',tip:'收获、交谈与互动'}, {id:'hoe',name:'锄头',tip:'翻出一块松软的土地'},
 {id:'water',name:'水壶',tip:'浇水后作物开始生长'}, {id:'axe',name:'斧头',tip:'清理树桩、树木与杂草'},
 {id:'pickaxe',name:'镐子',tip:'敲碎农场里的石块'}, {id:'rod',name:'鱼竿',tip:'走到水边，抛出鱼线'},
 {id:'radish-seed',name:'萝卜种子',tip:'3 分钟成熟'}, {id:'potato-seed',name:'土豆种子',tip:'12 分钟成熟'},
 {id:'strawberry-seed',name:'草莓种子',tip:'20 分钟初熟 · 可以多次收获'}
];
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const isFarmTile = (x,y) => scene==='farm'&&Core.farmTile(x,y)&&!['water','cliff'].includes(World.tile(scene,x,y));
const mapNow=()=>World.maps[scene];
const isInterior=()=>scene==='coop'||scene==='barn';
function restoreWalkablePosition(){
 if(World.passable(scene,player.x,player.y,state))return;
 let safe=null;for(let radius=8;radius<=144&&!safe;radius+=8)for(let n=0;n<16;n++){const a=n*Math.PI/8,x=player.x+Math.cos(a)*radius,y=player.y+Math.sin(a)*radius;if(World.passable(scene,x,y,state)){safe={x,y};break;}}
 Object.assign(player,safe||World.maps[scene].spawn);
}

function cameraGoal(){
 const m=mapNow(),mw=m.w*T,mh=m.h*T;let fx=player.x,fy=player.y;
 if(scene==='farm'&&player.x<35*T&&player.y<30*T){fx=clamp(18*T,player.x-logicalW*.28,player.x+logicalW*.28);fy=clamp(15*T,player.y-logicalH*.35,player.y+logicalH*.35);}
 return{x:mw<=logicalW?(mw-logicalW)/2:clamp(fx-logicalW/2+(logicalW>500?35:0),0,mw-logicalW),y:mh<=logicalH?(mh-logicalH)/2:clamp(fy-logicalH/2-(logicalH>300?35:20),0,mh-logicalH)};
}
function performAction(kind,target,apply,options={}){
 if(window.Action?.locked)return false;
 path=[];queued=null;face(target.x,target.y);
 if(window.Action)return Action.start(kind,player,target,time,{...options,onImpact:apply});
 apply();return true;
}
function enterLivestockScene(kind,o){
 if(!['coop','barn'].includes(kind)||!World.maps[kind])return;
 if(scene==='farm')state.livestockReturn={x:o?.x||player.x,y:(o?.y||player.y)+14};
 changeScene({to:kind,spawn:World.maps[kind].spawn});
}
function navigateLivestock(kind){
 closePanel();if(scene===kind)return;
 if(scene!=='farm')return toast('鸡舍与牛棚在农场，先沿小路回家吧。');
 const o=World.objects('farm',state,time).find(o=>o.interact==='livestockInterior'&&o.kind===kind);
 if(o)routeTo(o,{object:o,tx:Math.floor(o.x/T),ty:Math.floor(o.y/T)});
}
function openLivestockOrder(kind){
 const types=Object.entries(Core.ANIMALS).filter(([,a])=>a.building===kind),title=kind==='coop'?'鸡舍订购牌':'牛棚订购牌';
 openPanel('livestock-order','<div class="eyebrow">A NEW LITTLE NEIGHBOUR</div><h2>'+title+'</h2><p class="subtitle">新伙伴会直接住进棚舍。喂食、照料与收获，都在它们身旁完成。</p><div class="livestock-orders">'+types.map(([id,a])=>'<button class="livestock-order" data-order-animal="'+id+'" '+(state.money<a.price?'disabled':'')+'>'+iconMarkup(id,42)+'<span><b>'+a.name+'</b><small>'+a.price+' G · 领回棚舍</small></span><span>＋</span></button>').join('')+'</div><div class="panel-actions"><button id="orderFeed" class="secondary" '+(state.money<60?'disabled':'')+'>饲料 ×5 · 60 G</button><button id="backToAnimals" class="primary">回到小伙伴身边</button></div><p class="livestock-balance">口袋里有 '+state.money+' G</p>');
 document.querySelectorAll('[data-order-animal]').forEach(b=>b.onclick=()=>{const r=Core.buyAnimal(state,b.dataset.orderAnimal);feedback(r);if(r.ok)closePanel();else openLivestockOrder(kind);});
 $('orderFeed').onclick=()=>{feedback(Core.buy(state,'feed',5));openLivestockOrder(kind);};$('backToAnimals').onclick=closePanel;
}

function iconMarkup(id,size=40){return '<canvas width="'+size+'" height="'+size+'" data-icon="'+esc(id)+'" data-icon-size="'+size+'" style="--icon-size:'+size+'px" aria-hidden="true"></canvas>';}
function paintIcons(root=document){root.querySelectorAll('canvas[data-icon]').forEach(c=>{
 const fallback=Number(c.dataset.iconSize||c.getAttribute('width')||32);c.dataset.iconSize=fallback;c.style.setProperty('--icon-size',fallback+'px');
 const size=c.getBoundingClientRect().width||fallback,ratio=Math.min(2,devicePixelRatio||1);c.width=Math.round(size*ratio);c.height=Math.round(size*ratio);
 const cc=c.getContext('2d');cc.setTransform(ratio,0,0,ratio,0,0);cc.clearRect(0,0,size,size);cc.imageSmoothingEnabled=true;cc.imageSmoothingQuality='high';Art.icon(cc,c.dataset.icon,0,0,size);
});}
function setUtilityMenu(open){const menu=$('gameMenu'),toggle=$('menuToggle'),drawer=menu?.querySelector('.utility-buttons');menu?.classList.toggle('expanded',open);toggle?.setAttribute('aria-expanded',String(open));if(drawer){drawer.inert=!open;drawer.setAttribute('aria-hidden',String(!open));}}
function resize(){
 dpr=Math.min(2,devicePixelRatio||1);scale=zoom;
 logicalW=innerWidth/scale;logicalH=innerHeight/scale;
 canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);
 ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 if(!cameraReady){Object.assign(camera,cameraGoal());cameraReady=true;}
}

function toast(message,ok=true){if(!message)return;const node=document.createElement('div');node.className='toast '+(ok?'good':'bad');node.textContent=message;$('toasts').append(node);setTimeout(()=>node.remove(),3600);while($('toasts').children.length>3)$('toasts').firstChild.remove();}
function save(){const ok=Core.save(state);$('saveStatus').textContent=ok?'已保存':'此浏览器无法保存';return ok;}
function sound(kind){
 if(!state.sound)return;
 try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();
 const notes=kind==='harvest'?[523,659,784]:kind==='coin'?[660,880]:kind==='water'?[440,340]:kind==='fish'?[392,523,659,784]:kind==='dirt'?[110,85]:[280];
 notes.forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=kind==='dirt'?'triangle':'sine';o.frequency.setValueAtTime(f,audioCtx.currentTime+i*.065);g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.setValueAtTime(.055,audioCtx.currentTime+i*.065);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+i*.065+.15);o.connect(g);g.connect(audioCtx.destination);o.start(audioCtx.currentTime+i*.065);o.stop(audioCtx.currentTime+i*.065+.18);});}catch(e){}
}
function burst(x,y,kind='dirt'){
 const colors=kind==='water'?['#d8f4f3','#76bed4','#b5dfe0']:kind==='harvest'?['#fff0a3','#ebc462','#fff9d7']:kind==='plant'?['#a7c26e','#e6c88a','#82a35b']:['#af8756','#d4af76','#897043'];
 for(let i=0;i<12;i++)particles.push({x,y,vx:(Math.random()-.5)*56,vy:-15-Math.random()*35,life:.5+Math.random()*.4,max:1,color:colors[i%colors.length],size:i%3===0?2:1});
}
function floatText(x,y,text){floats.push({x,y,text,life:1.7});}
function feedback(result,x=player.x,y=player.y){
 toast(result.message,result.ok);if(result.ok){sound(result.effect||'coin');if(result.effect)burst(x,y,result.effect);if(result.earned!=null)floatText(x,y-15,'+'+result.earned+' G');else if(result.item&&!modal)floatText(x,y-15,'+'+(result.amount||1)+' '+Core.ITEMS[result.item]?.name);save();updateHud();}return result;
}
function selectTool(id){placement=null;selected=id;toolNoticeUntil=time+2400;if(!toolList.some(t=>t.id===id)&&Core.ITEMS[id]){toolList[8]={id,name:Core.ITEMS[id].name,tip:Core.ITEMS[id].description};buildTools();}document.querySelectorAll('.tool').forEach(el=>{el.classList.toggle('active',el.dataset.tool===id);el.setAttribute('aria-pressed',el.dataset.tool===id?'true':'false');});if(id==='rod')toast('到河岸或码头边，点击水面抛竿');updateContext();sound('select');}
function buildTools(){
 $('tools').innerHTML=toolList.map((t,i)=>'<button class="tool '+(t.id===selected?'active':'')+'" data-tool="'+t.id+'" title="'+(i+1)+' · '+t.name+' — '+t.tip+'" aria-label="'+t.name+'" aria-pressed="'+(t.id===selected)+'"><kbd>'+(i+1)+'</kbd>'+iconMarkup(t.id,48)+'<span class="quantity" id="qty-'+t.id+'"></span></button>').join('');
 $('tools').querySelectorAll('button').forEach(b=>b.onclick=()=>selectTool(b.dataset.tool));paintIcons($('tools'));
}
function updateHud(){
 $('money').textContent=state.money.toLocaleString();$('energyText').textContent=Math.floor(state.energy);$('energyFill').style.width=state.energy+'%';
 const cal=Core.calendar?Core.calendar(state):{seasonName:'春',dayOfSeason:1,clock:'08:00',weatherName:'晴'};Art.season=cal.season;Art.theme=state.theme||'clay';$('date').textContent=cal.seasonName+' '+cal.dayOfSeason+' 日';$('clock').textContent=cal.clock;if($('weatherText'))$('weatherText').textContent=cal.weatherName;const board=document.querySelector('.calendar');if(board)board.title=cal.weatherName+' · '+cal.clock;
 if($('toolCaption'))$('toolCaption').textContent=(toolList.find(t=>t.id===selected)?.name||Core.ITEMS[selected]?.name||selected)+(Core.ITEMS[selected]?' · '+(state.inventory[selected]||0):'');$('locationName').textContent=World.maps[scene].name;$('soundButton').classList.toggle('muted',!state.sound);$('soundButton').setAttribute('aria-pressed',String(state.sound));$('soundButton').title=state.sound?'关闭声音':'开启声音';
 toolList.filter(t=>Core.ITEMS[t.id]).forEach(t=>{const el=$('qty-'+t.id);if(el)el.textContent=state.inventory[t.id]||0;});
 const q=Core.quests.find(q=>!state.questClaims.includes(q.id));
 if(q){const p=Core.questProgress(state,q);$('questTitle').textContent=q.title;$('questDetail').innerHTML=esc(q.description)+' <b>'+Math.min(p.current,p.target)+'/'+p.target+'</b>'+(p.complete?'<br><button class="claim-mini" id="claimCurrent">领取 '+q.reward+' G</button>':'');const b=$('claimCurrent');if(b)b.onclick=e=>{e.stopPropagation();feedback(Core.claimQuest(state,q.id));};}
 else{$('questTitle').textContent='在海风里，慢慢生活';$('questDetail').textContent='委托已完成 · 继续建设与探索小镇';}
}
function openPanel(type,html){
 const same=modal===type,scroll=same?$('panel').scrollTop:0,focus=document.activeElement,focusId=same?focus?.id:null,focusItem=same?focus?.dataset?.item:null;
 if(!modal)panelReturnFocus=focus;window.Action?.cancel?.();placement=null;setUtilityMenu(false);
 if(fish)finishFishing(false,true);modal=type;path=[];queued=null;keys={};joy={x:0,y:0};$('joystick').firstElementChild.style.transform='';
 $('panel').dataset.page=type;$('panel').classList.toggle('compact-dialog',type==='livestock-order');$('panelContent').innerHTML=html;$('modalLayer').classList.remove('hidden');$('tooltip').style.display='none';
 const title=$('panelContent').querySelector('h2');if(title){title.id='panelTitle';$('panel').setAttribute('aria-labelledby','panelTitle');}
 paintIcons($('panelContent'));$('panel').scrollTop=scroll;
 queueMicrotask(()=>{if(modal!==type)return;const target=focusId?document.getElementById(focusId):focusItem?$('panelContent').querySelector('[data-item="'+CSS.escape(focusItem)+'"]'):null;(target||$('closePanel')).focus({preventScroll:true});});
}
function closePanel(){modal=null;$('modalLayer').classList.add('hidden');keys={};save();if(panelReturnFocus?.isConnected&&panelReturnFocus.offsetParent!==null)panelReturnFocus.focus({preventScroll:true});else canvas.focus({preventScroll:true});panelReturnFocus=null;}
function openWelcome(){
 openPanel('welcome','<div class="letter"><div class="eyebrow">A LETTER FROM THE COAST</div><div class="letter-seal">✦</div><h2>海风替我捎来一封信</h2><p>亲爱的旅人：<br>小镇上的老木屋，已经替你打扫好了。门前有一块地，河里有鱼，春天刚刚开始。<br>邻居送来了两颗成熟的萝卜、几包种子，还有住进鸡舍的米粒和团子。别着急，这里的日子很长。</p><div class="signature">—— 潮汐小镇的朋友们</div><div class="divider"></div><label for="playerName" class="eyebrow">该怎么称呼你？</label><input id="playerName" maxlength="12" value="'+esc(state.name==='旅行者'?'':state.name)+'" placeholder="写下你的名字" autocomplete="off"><div class="panel-actions" style="justify-content:center"><button class="primary" id="begin">搬进我的小屋 →</button></div><div class="intro-note">黏土海岸 · 八片原野 · 自动存档与离线成长</div></div>');
 $('begin').onclick=()=>{state.name=$('playerName').value.trim()||'旅行者';state.welcomed=true;closePanel();toast('欢迎，'+state.name+'！先用锄头翻一块田地吧。');sound('harvest');};
 $('playerName').onkeydown=e=>{if(e.key==='Enter')$('begin').click();};
}
function inventoryCategory(id){if(id.endsWith('-seed'))return'seeds';if(Core.ITEMS[id]?.energy)return'food';if(['crop','fish'].includes(Core.ITEMS[id]?.category)||Core.CROPS[id]||Core.FISH[id]||['egg','duckegg','milk','wool'].includes(id))return'produce';return'materials';}
function openBag(filter=bagFilter,picked=bagSelection){
 if(!['all','seeds','produce','materials','food'].includes(filter))filter='all';bagFilter=filter;const all=Object.entries(state.inventory).filter(([id,n])=>n>0&&Core.ITEMS[id]),entries=all.filter(([id])=>filter==='all'||inventoryCategory(id)===filter);
 bagSelection=entries.some(([id])=>id===picked)?picked:entries[0]?.[0]||null;
 const cats=[['all','全部'],['seeds','种子'],['produce','收获'],['materials','材料'],['food','食物']];
 openPanel('bag','<h2>随身背包</h2><div class="bag-toolbar" role="group" aria-label="物品分类">'+cats.map(([id,label])=>'<button data-bag-filter="'+id+'" class="'+(filter===id?'active':'')+'" aria-pressed="'+(filter===id)+'">'+label+'</button>').join('')+'<span>'+all.length+' 种物品</span></div><div class="bag-layout"><div class="bag-grid">'+entries.map(([id,n])=>'<button class="inventory-cell '+(id===bagSelection?'selected':'')+'" data-item="'+id+'" aria-label="'+esc(Core.ITEMS[id].name)+'，拥有 '+n+' 个" aria-pressed="'+(id===bagSelection)+'">'+iconMarkup(id,48)+'<b>'+n+'</b><span>'+esc(Core.ITEMS[id].name)+'</span></button>').join('')+Array.from({length:Math.max(0,24-entries.length)},()=>'<div class="inventory-cell empty" aria-hidden="true"></div>').join('')+'</div><aside class="bag-detail" id="bagDetail"></aside></div><div class="balance"><span>金币 <b>'+state.money+' G</b></span><span>体力 <b>'+Math.floor(state.energy)+' / 100</b></span><small>选择物品查看用途，再决定如何使用。</small></div>');
 const show=id=>{bagSelection=id;$('panelContent').querySelectorAll('[data-item]').forEach(b=>{b.classList.toggle('selected',b.dataset.item===id);b.setAttribute('aria-pressed',String(b.dataset.item===id));});const item=Core.ITEMS[id];if(!item){$('bagDetail').innerHTML='<p class="empty-state">这一栏还没有物品。</p>';return;}
  const seed=id.endsWith('-seed'),usable=seed||id==='fertilizer'||id==='bomb',placeable=item.placeable,eat=!!item.energy;
  const action=usable?'装备到工具栏':placeable?'放置到农场':eat?'食用 1 个':'',energy=Math.min(100-state.energy,item.energy||0);
  $('bagDetail').innerHTML=iconMarkup(id,82)+'<h3>'+esc(item.name)+'</h3><div class="bag-meta">拥有 ×'+state.inventory[id]+'</div><p>'+esc(item.description||'可用于制作、交易或小镇建设。')+'</p>'+(eat?'<p class="bag-meta">恢复体力 +'+Math.floor(energy)+'</p>':'')+'<div class="bag-actions">'+(action?'<button class="primary" id="bagUse" '+(eat&&state.energy>=100?'disabled':'')+'>'+action+'</button>':'<small>可存入仓库，或在工作台使用。</small>')+'</div>';
  paintIcons($('bagDetail'));if($('bagUse'))$('bagUse').onclick=()=>{if(eat){feedback(Core.eat(state,id));openBag(bagFilter,id);}else if(placeable){beginPlacement(id);}else{selectTool(id);closePanel();toast('已装备'+item.name);}};
 };
 $('panelContent').querySelectorAll('[data-bag-filter]').forEach(b=>b.onclick=()=>openBag(b.dataset.bagFilter));
 const cells=[...$('panelContent').querySelectorAll('[data-item]')];cells.forEach((b,i)=>{b.onclick=()=>show(b.dataset.item);b.onkeydown=e=>{const cols=getComputedStyle(b.parentElement).gridTemplateColumns.split(' ').length,offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];if(offset===undefined)return;e.preventDefault();const next=cells[clamp(i+offset,0,cells.length-1)];next?.focus();if(next)show(next.dataset.item);};});show(bagSelection);
}
function openShop(){openTrade('shop');}
function openSell(){openTrade('sell');}
function openTrade(mode,picked=null,count=1){
 const buying=mode==='shop',ids=buying?Object.keys(Core.ITEMS).filter(id=>Core.ITEMS[id].buyPrice):Object.entries(state.inventory).filter(([id,n])=>n>0&&Core.ITEMS[id]&&!id.endsWith('-seed')&&!Core.ITEMS[id].energy).map(([id])=>id);
 let current=ids.includes(picked)?picked:ids[0],quantity=count;const price=id=>buying?Core.ITEMS[id].buyPrice:Core.sellPrice(state,id);
 openPanel(mode,'<h2>'+(buying?'林芽种子铺':'农场出货箱')+'</h2><p class="subtitle">'+(buying?'选好种子，带回一季的期待。':'种子和食物留在背包，收获在这里结算。')+'</p><div class="bag-layout shop-layout"><div class="bag-grid shop-grid">'+(ids.length?ids.map(id=>'<button class="inventory-cell" data-trade-item="'+id+'" aria-label="'+esc(Core.ITEMS[id].name)+'">'+iconMarkup(id,48)+'<span>'+esc(Core.ITEMS[id].name)+'</span><small>'+price(id)+' G</small></button>').join(''):'<div class="empty-state">还没有可以出售的收获。</div>')+'</div><aside class="bag-detail shop-detail" id="tradeDetail"></aside></div><div class="balance">可用金币 <b>'+state.money+' G</b>'+(buying?'<button class="secondary" id="shopSell">出售收获</button>':'')+'</div>');
 function detail(id){current=id;if(!id){$('tradeDetail').innerHTML='<p>去收获作物、钓鱼，或采集一些材料吧。</p>';return;}const item=Core.ITEMS[id],owned=state.inventory[id]||0,max=buying?Math.min(999,Math.floor(state.money/price(id))):owned;quantity=clamp(quantity,1,Math.max(1,max));
  $('panelContent').querySelectorAll('[data-trade-item]').forEach(b=>{b.classList.toggle('selected',b.dataset.tradeItem===id);b.setAttribute('aria-pressed',String(b.dataset.tradeItem===id));});
  $('tradeDetail').innerHTML=iconMarkup(id,74)+'<h3>'+esc(item.name)+'</h3><div class="bag-meta">已拥有 ×'+owned+'</div><p>'+esc(item.description||'来自小镇的收获与材料。')+'</p><div class="trade-quantity"><button id="tradeMinus" aria-label="减少数量">−</button><label><span class="sr-only">数量</span><input id="tradeCount" type="number" min="1" max="'+Math.max(1,max)+'" value="'+quantity+'" inputmode="numeric"></label><button id="tradePlus" aria-label="增加数量">+</button></div><div class="trade-presets"><button id="tradeFive">5 个</button><button id="tradeMax">'+(buying?'可买上限':'全部')+'</button></div><div class="bag-actions"><button class="primary" id="tradeConfirm" '+(!max?'disabled':'')+'></button></div>';
  const refresh=(commit=true)=>{quantity=clamp(Math.floor(Number($('tradeCount').value)||1),1,Math.max(1,max));if(commit)$('tradeCount').value=quantity;$('tradeConfirm').textContent=(buying?'购买':'出售')+' '+quantity+' 个 · '+(buying?'':'＋')+(quantity*price(id))+' G';$('tradeMinus').disabled=quantity<=1;$('tradePlus').disabled=quantity>=max;$('tradeFive').disabled=max<1;$('tradeMax').disabled=max<1;};
  $('tradeMinus').onclick=()=>{$('tradeCount').value=quantity-1;refresh();};$('tradePlus').onclick=()=>{$('tradeCount').value=quantity+1;refresh();};$('tradeCount').oninput=()=>refresh(false);$('tradeCount').onchange=()=>refresh();$('tradeFive').onclick=()=>{$('tradeCount').value=Math.min(5,max);refresh();};$('tradeMax').onclick=()=>{$('tradeCount').value=max;refresh();};$('tradeConfirm').onclick=()=>{refresh();feedback(buying?Core.buy(state,id,quantity):Core.sell(state,id,quantity));openTrade(mode,id,quantity);};paintIcons($('tradeDetail'));refresh();
 }
 $('panelContent').querySelectorAll('[data-trade-item]').forEach(b=>b.onclick=()=>{quantity=1;detail(b.dataset.tradeItem);});if($('shopSell'))$('shopSell').onclick=openSell;detail(current);
}
function openStorage(tab='deposit',picked=null){
 if(!['deposit','withdraw'].includes(tab))tab='deposit';const deposit=tab==='deposit',container=deposit?state.inventory:state.storage,entries=Object.entries(container).filter(([id,n])=>n>0&&Core.ITEMS[id]);let current=entries.some(([id])=>id===picked)?picked:entries[0]?.[0];
 openPanel('storage','<h2>农场仓库</h2><div class="bag-toolbar"><button id="depositTab" class="'+(deposit?'active':'')+'">存入仓库</button><button id="withdrawTab" class="'+(!deposit?'active':'')+'">取回背包</button><span>'+entries.length+' 种物品</span></div><div class="bag-layout"><div class="bag-grid">'+entries.map(([id,n])=>'<button class="inventory-cell" data-store="'+id+'">'+iconMarkup(id,48)+'<b>'+n+'</b><span>'+esc(Core.ITEMS[id].name)+'</span></button>').join('')+Array.from({length:Math.max(0,18-entries.length)},()=>'<div class="inventory-cell empty" aria-hidden="true"></div>').join('')+'</div><aside class="bag-detail" id="storageDetail"></aside></div><div class="balance">仓库中存放 <b>'+Object.values(state.storage).reduce((a,n)=>a+n,0)+' 件物品</b></div>');
 const detail=id=>{current=id;$('panelContent').querySelectorAll('[data-store]').forEach(b=>{b.classList.toggle('selected',b.dataset.store===id);b.setAttribute('aria-pressed',String(b.dataset.store===id));});if(!id){$('storageDetail').innerHTML='<p class="empty-state">这里暂时没有物品。</p>';return;}const n=container[id];$('storageDetail').innerHTML=iconMarkup(id,82)+'<h3>'+esc(Core.ITEMS[id].name)+'</h3><div class="bag-meta">'+(deposit?'背包':'仓库')+'中 ×'+n+'</div><p>'+esc(Core.ITEMS[id].description)+'</p><div class="bag-actions"><button class="primary" id="storeOne">'+(deposit?'存入':'取出')+' 1 个</button><button class="secondary" id="storeAll">'+(deposit?'存入':'取出')+'全部 · '+n+' 个</button></div>';paintIcons($('storageDetail'));const transfer=count=>{feedback(Core.transfer(state,id,count,deposit));openStorage(tab,id);};$('storeOne').onclick=()=>transfer(1);$('storeAll').onclick=()=>transfer(n);};
 $('depositTab').onclick=()=>openStorage('deposit');$('withdrawTab').onclick=()=>openStorage('withdraw');$('panelContent').querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>detail(b.dataset.store));detail(current);
}
function openHome(){
 openPanel('home','<div class="eyebrow">HOME, SWEET HOME</div><h2>海风小屋</h2><p class="subtitle">窗台上有一束花，炉子里温着热茶。小屋随时欢迎你回来。</p><p>现在的体力：<b>'+Math.floor(state.energy)+' / 100</b><br>休息一会儿，恢复全部体力。田里的作物按真实时间继续生长。</p><div class="panel-actions"><button class="primary" id="rest">喝杯热茶 · 恢复体力</button><button class="secondary" id="homeStorage">整理仓库</button><button class="secondary" id="appearance">换件衣服</button></div>');
 $('rest').onclick=()=>{feedback(Core.rest(state));closePanel();};$('homeStorage').onclick=()=>openStorage();$('appearance').onclick=openAppearance;
}
function openAppearance(){
 const colors=['#688b9a','#bc7558','#818b53','#a7839c','#c6a257'];
 openPanel('appearance','<div class="eyebrow">YOUR LITTLE LIFE</div><h2>衣柜里的小心情</h2><p class="subtitle">一顶草帽，一件喜欢的衬衫。</p><label for="rename">你的名字</label><input id="rename" maxlength="12" value="'+esc(state.name)+'"><div class="setting-color">'+colors.map(c=>'<button class="color-option '+(state.color===c?'selected':'')+'" style="background:'+c+'" data-color="'+c+'" aria-label="选择衣服颜色"></button>').join('')+'</div><div class="panel-actions"><button class="primary" id="keepLook">穿好了，出门</button></div>');
 $('panelContent').querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.color=b.dataset.color;document.querySelectorAll('.color-option').forEach(el=>el.classList.toggle('selected',el===b));});$('keepLook').onclick=()=>{state.name=$('rename').value.trim()||state.name;closePanel();};
}
function openNpc(npc,index=0){
 if(!state.stats.talked.includes(npc.id)){state.stats.talked.push(npc.id);save();}
 openPanel('npc','<div class="dialogue-person"><canvas id="portrait" width="72" height="72" class="portrait"></canvas><div><div class="eyebrow">A FRIEND IN TOWN</div><h2>'+esc(npc.name)+'</h2><small>'+(npc.id==='lin'?'种子铺的主人':'听潮水的人')+'</small></div></div><div class="dialogue-line">'+esc(npc.dialogue[index])+'</div><div class="panel-actions"><button class="primary" id="nextDialogue">'+(index<npc.dialogue.length-1?'再聊两句 →':'下次见')+'</button>'+(npc.id==='lin'?'<button class="secondary" id="npcShop">看看种子</button>':'<button class="secondary" id="npcFish">请教钓鱼</button>')+'</div>');
 const pc=$('portrait').getContext('2d');pc.imageSmoothingEnabled=false;pc.scale(2,2);Art.character(pc,18,32,{style:npc.style,dir:'down',walk:0});
 $('nextDialogue').onclick=()=>index<npc.dialogue.length-1?openNpc(npc,index+1):closePanel();if($('npcShop'))$('npcShop').onclick=openShop;if($('npcFish'))$('npcFish').onclick=()=>{closePanel();selectTool('rod');toast('走到码头尽头，点击水面。鱼咬钩时按空格收线。');};
}
function openJournal(){
 openPanel('journal','<div class="eyebrow">LETTERS & LITTLE MILESTONES</div><h2>我的小镇手账</h2><p class="subtitle">不必赶路。每一个小小的开始，都值得记下来。</p>'+Core.quests.map(q=>{const p=Core.questProgress(state,q);return '<div class="quest-row"><div><strong>'+q.title+'</strong><p>'+q.description+' · '+Math.min(p.current,p.target)+'/'+p.target+'</p><small>奖励 '+q.reward+' G</small></div><button class="secondary" data-claim="'+q.id+'" '+(!p.complete||p.claimed?'disabled':'')+'>'+(p.claimed?'已完成':p.complete?'领取奖励':'进行中')+'</button></div>';}).join('')+'<div class="balance">已经收获 '+state.stats.harvested+' 份作物 · 钓到 '+state.stats.fish+' 尾鱼 · 认识 '+state.stats.talked.length+' 位邻居</div>');
 $('panelContent').querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{feedback(Core.claimQuest(state,b.dataset.claim));openJournal();});
}
function openMap(){
 openPanel('map','<div class="eyebrow">EVERY PATH LEADS SOMEWHERE</div><h2>海风小镇导览</h2><p class="subtitle">沿农场东侧的木桥进入小镇。地图用于认路，亲自走过去看看吧。</p><canvas id="mapCanvas" width="528" height="370" class="map-canvas"></canvas><div class="map-legend"><span>◆ 你的位置</span><span>农场右侧木桥 ⇄ 小镇西侧小路</span></div>');
 const mc=$('mapCanvas').getContext('2d');mc.imageSmoothingEnabled=false;
 const mini=(s,ox,oy)=>{mc.save();mc.translate(ox,oy);mc.scale(.235,.235);World.drawGround(mc,s,time,state);World.objects(s,state).sort((a,b)=>a.y-b.y).forEach(o=>Art.draw(mc,o.name,o.x,o.y,o));mc.restore();mc.fillStyle='#655437';mc.font='bold 13px sans-serif';mc.textAlign='center';mc.fillText(World.maps[s].name,ox+124,oy-13);};
 mc.fillStyle='#f5e6bd';mc.fillRect(0,0,528,370);mini('farm',10,55);mini('town',270,55);mc.fillStyle='#967c53';mc.font='12px sans-serif';mc.textAlign='left';
 const labels=[['海风小屋 · 休息与换装',17,270],['出货箱 · 即时出售',17,295],['河岸与木栈桥 · 钓鱼',17,320],['林芽种子铺 · 种子与野莓',278,270],['喷泉广场 · 邻里交谈',278,295],['东侧码头 · 钓鱼',278,320]];labels.forEach(v=>mc.fillText(...v));
 const px=(scene==='farm'?10:270)+player.x*.235,py=55+player.y*.235;mc.fillStyle='#fff2c5';mc.fillRect(px-4,py-4,9,9);mc.fillStyle='#bf684a';mc.fillRect(px-2,py-2,5,5);
}
function openHelp(){
 openPanel('help','<div class="eyebrow">A GENTLE START</div><h2>在小镇生活</h2><p class="subtitle">可以用键盘，也可以直接点击想去的地方。触屏上还有摇杆。</p><div class="controls-list"><kbd>WASD / 方向键</kbd><span>走动；点击地面也会自动寻路</span><kbd>1 — 9</kbd><span>选择工具和种子</span><kbd>E / 空格</kbd><span>使用工具，或与身边的对象互动</span><kbd>I / M / ESC</kbd><span>背包 / 地图 / 关闭面板</span></div><div class="divider"></div><p><b>种田：</b>锄头翻土 → 选择种子播种 → 水壶浇水 → 成熟后点击收获。两颗成熟的萝卜是邻居给你的见面礼。</p><p><b>钓鱼：</b>装备鱼竿，点击水面。浮漂下沉时收线，随后按住按钮让绿色区域上升，松开下降，把鱼留在区域里。</p><div class="help-note">萝卜 3 分钟、土豆 12 分钟、草莓 20 分钟成熟。浇水能保持 6 小时湿润；关闭页面后继续生长，不会自动收获或出售。进度保存在当前浏览器。<br>单机世界包含八片户外区域、矿洞、小屋以及可以走进去照料动物的鸡舍和牛棚。完整多人联机尚未接入。按 C 制作、J 手账、M 看地图、Shift 奔跑、滚轮调整远近。</div><div class="panel-actions"><button class="secondary" id="exportSave">导出存档</button><button class="secondary" id="importSave">导入存档</button><input type="file" id="saveFile" accept=".json,application/json" style="display:none"></div>');
 $('exportSave').onclick=()=>{save();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='潮汐小镇-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('存档已导出');};
 $('importSave').onclick=()=>$('saveFile').click();$('saveFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1000000)throw Error();const raw=JSON.parse(await f.text());if(![1,2,Core.VERSION].includes(raw.version)||!raw.player||!raw.inventory||!raw.plots||typeof raw.money!=='number')throw Error();const previous=localStorage.getItem('tide-town-v1');localStorage.setItem('tide-town-v1',JSON.stringify(raw));const next=Core.load();if(!next){if(previous)localStorage.setItem('tide-town-v1',previous);else localStorage.removeItem('tide-town-v1');throw Error();}window.Action?.cancel?.();state=next;scene=state.scene;player=state.player;restoreWalkablePosition();if(window.CatAI)cat=CatAI.create(state);cameraReady=false;resize();closePanel();updateHud();toast('存档已恢复，欢迎回家');}catch(e){toast('这不是有效的潮汐小镇存档',false);}};
}
function placedObjects(){return (state.decorations||[]).filter(d=>d.scene===scene).map(d=>({id:d.id,name:d.item,x:(d.tx+.5)*T,y:(d.ty+.8)*T,decorationId:d.id,kind:d.item,interact:['coop','barn'].includes(d.item)?'livestockInterior':['furnace','jar','cheesemaker','mill','dryer'].includes(d.item)?'process':'decoration',label:Core.ITEMS[d.item]?.name||d.item}));}
function interactiveObjects(){return World.objects(scene,state,time).concat(placedObjects()).concat(scene==='farm'?[{...cat,name:'cat',id:'farm-cat',interact:'petCat',label:'摸摸小橘',w:28,h:24}]:[]).filter(o=>o.interact||o.clearable||o.label||o.name==='chicken').concat(World.maps[scene].npcs);}
function findNear(){return interactiveObjects().map(o=>({o,d:dist(player,o)})).filter(v=>v.d<43).sort((a,b)=>a.d-b.d)[0]?.o;}
function nearestWater(){let best=null,bd=Infinity;const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(World.tile(scene,tx+dx,ty+dy)==='water'){const v={x:(tx+dx+.5)*T,y:(ty+dy+.5)*T};const d=dist(v,player);if(d<bd){bd=d;best=v;}}}return bd<72?best:null;}
function targetAhead(){const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[player.dir]||[0,1];return {tx:Math.floor((player.x+d[0]*18)/T),ty:Math.floor((player.y+d[1]*18)/T)};}
function updateContext(){
 if(modal||fish){$('context').innerHTML='';return;}if(placement){$('context').innerHTML='点击空地放置 '+esc(Core.ITEMS[placement]?.name||placement)+' · ESC 取消';return;}
 const near=findNear(),a=targetAhead();let txt='';
 if(selected==='rod'&&nearestWater())txt='<kbd>E</kbd> 抛竿 · 听听潮水的声音';
 else if(near?.interact||near?.dialogue)txt='<kbd>E</kbd> '+esc(near.label||('与'+near.name+'交谈'));
 else if(isFarmTile(a.tx,a.ty)){const p=state.plots[a.tx+','+a.ty];if(p?.crop&&Core.plotProgress(p)>=1)txt='<kbd>E</kbd> 收获'+Core.CROPS[p.crop].name;else if(p?.crop)txt=Core.plotIsWet(p)?Core.CROPS[p.crop].name+'正在生长 · '+formatTime(Core.plotRemaining(p))+'后成熟':'<kbd>3</kbd> 换上水壶，给种子一点水';else txt='<kbd>E</kbd> '+(selected==='hoe'?'翻土':selected.endsWith('-seed')?'播种':selected==='water'?'浇水':'选择锄头或种子');}
 else if(near?.clearable)txt='<kbd>E</kbd> '+(near.resource==='stone'?'用镐子清理石块':'用斧头清理')+'';
 else if(path.length)txt='沿着小路走一走…';
 else txt=time<toolNoticeUntil?'<kbd>'+String(Math.max(0,toolList.findIndex(t=>t.id===selected))+1)+'</kbd> '+esc(toolList.find(t=>t.id===selected)?.name||Core.ITEMS[selected]?.name||selected):'';
 $('context').innerHTML=txt;
}
function formatTime(ms){const s=Math.ceil(ms/1000);return s>=60?Math.floor(s/60)+'分'+String(s%60).padStart(2,'0')+'秒':s+'秒';}
function interact(o){
 if(o.interact==='livestockInterior')return enterLivestockScene(o.kind||o.name,o);
 if(o.interact==='gate')return feedback(World.toggleGate(state,o));
 if(o.interact==='petCat'){window.CatAI?.pet?.(cat,player);return performAction('pet',o,()=>{toast('小橘眯起眼睛，轻轻呼噜了一声。');sound('harvest');});}
 if(/^livestock/.test(o.interact||'')&&window.Interior){
  if(o.interact==='livestockOrder')return openLivestockOrder(o.kind||scene);
  const current=World.objects(scene,state,time).find(n=>n.id===o.id)||o;
  if(dist(player,current)>55)return routeTo(current,{object:current,tx:Math.floor(current.x/T),ty:Math.floor(current.y/T)});
  return performAction(o.interact==='livestockWater'?'water':o.interact==='livestockAnimal'?'pet':o.interact==='livestockFeed'?'plant':'harvest',current,()=>{const r=Interior.interact(state,current,Date.now());if(r?.openOrder)return openLivestockOrder(r.openOrder);if(r)feedback(r,current.x,current.y);},{item:current.name});
 }
 if(o.dialogue)return systems.npc(o);
 if(o.interact==='decoration'){openPanel('decoration','<div class="eyebrow">A LITTLE CORNER OF HOME</div><h2>'+esc(o.label)+'</h2><p class="subtitle">放在这里的每件小物，都让农场更像你的家。</p><button class="secondary" id="takeDecoration">收回背包</button>');$('takeDecoration').onclick=()=>{feedback(Core.removeDecoration(state,o.decorationId));closePanel();};return;}if(o.interact==='shop')return openShop();if(o.interact==='portal')return changeScene(o);if(o.interact==='rest')return systems.home();if(o.interact==='journal')return systems.journal();if(['craft','upgrade','museum','community','animals','process'].includes(o.interact)&&systems[o.interact])return systems[o.interact]();if(o.interact==='appearance')return openAppearance();if(o.interact==='mineCheckpoint')return openElevator();if(o.interact==='mineDown'||o.interact==='mineUp'){if(o.interact==='mineUp'&&state.mineFloor<=1){changeScene({to:'mountain',spawn:{x:48*T,y:21*T}});return;}const r=o.interact==='mineDown'?Core.descendMine(state):Core.ascendMine(state);feedback(r);if(r.ok){World.ensureMineFloor(state);const p=mapNow().spawn;player.x=p.x;player.y=p.y;path=[];cameraReady=false;resize();}return;}if(o.interact==='forage')return performAction('harvest',o,()=>feedback(Core.gather(state,o.id,o.resource||'berry',o.amount||1),o.x,o.y));if(o.interact==='sell')return openSell();if(o.interact==='storage')return openStorage();if(o.interact==='home')return systems.home();if(o.interact==='mail')return systems.journal();
 if(o.interact==='fisher'){const npc=Object.values(World.maps).flatMap(m=>m.npcs).find(n=>n.id==='he');if(npc)return systems.npc(npc);return systems.journal();}if(o.interact==='tavern'){openPanel('tavern','<div class="eyebrow">SALT & STORIES</div><h2>海盐酒馆</h2><p>「桌边坐吧，今天的海风有点凉。」</p><p class="subtitle">老板放下一小碟野莓。15 G 一份，可以恢复 25 点体力。</p><div class="panel-actions"><button class="primary" id="buyBerry" '+(state.money<15?'disabled':'')+'>买一份野莓 · 15 G</button></div>');$('buyBerry').onclick=()=>feedback(Core.buy(state,'berry',1));return;}
 if(o.interact==='home-town')return systems.home();
 if(o.clearable){const need=['wood','fiber','berry'].includes(o.resource)?'axe':'pickaxe';if(selected!==need)return toast('使用'+(need==='axe'?'斧头（4）':'镐子（5）')+'采集',false);return performAction(need,o,()=>{const r=Core.gather(state,o.id,o.resource,o.amount||(o.name==='tree'?5:3));if(r.ok){if(!state.cleared.includes(o.id))state.cleared.push(o.id);feedback({...r,effect:'dirt'},o.x,o.y);}else toast(r.message,false);});}
 if(o.name==='chicken'){return systems.animals();}
 if(o.label)return toast(o.label==='小镇 →'?'沿着东侧木桥走，就到小镇了。':o.label.includes('钓')?'站在木栈桥边，装备鱼竿，点击水面。':o.label);
}
function doAction(tx,ty,o){
 if(time-actionAt<200||modal||fish||window.Action?.locked)return;actionAt=time;
 if(o){face(o.x,o.y);interact(o);return;}
 const pos={x:(tx+.5)*T,y:(ty+.5)*T};face(pos.x,pos.y);
 if(selected==='rod'){const water=World.tile(scene,tx,ty)==='water'?pos:nearestWater();if(water&&dist(water,player)<88)startFishing(water);else toast('走近河岸或码头，朝水面抛竿',false);return;}
 if(isFarmTile(tx,ty)){
  const tool=selected,plot=state.plots[tx+','+ty],ready=plot?.crop&&Core.plotProgress(plot)>=1;
  if(!ready&&tool==='hand'){const r=Core.action(state,tool,tx,ty);return toast(r.message,r.ok);}
  const kind=ready?'harvest':tool.endsWith('-seed')?'seed':tool==='fertilizer'?'seed':tool;
  return performAction(kind,pos,()=>{const r=Core.action(state,tool,tx,ty);if(r.ok)feedback(r,pos.x,pos.y);else toast(r.message,false);},{item:plot?.crop});
 }
 const near=findNear();if(near)interact(near);else toast(selected.endsWith('-seed')||selected==='hoe'?'田地在小屋右侧，用锄头开始你的第一块菜园吧。':'靠近箱子、房门、居民或水岸后操作');
}
function keyboardAction(){if(modal||window.Action?.locked)return;if(fish){fishInput();return;}const a=targetAhead();if(selected==='rod'&&nearestWater()){startFishing(nearestWater());return;}const near=findNear();if(near&&(near.interact||near.dialogue||!isFarmTile(a.tx,a.ty))){doAction(0,0,near);return;}doAction(a.tx,a.ty);}
function face(x,y){const dx=x-player.x,dy=y-player.y;if(Math.abs(dx)>Math.abs(dy))player.dir=dx<0?'left':'right';else if(Math.abs(dy)>1)player.dir=dy<0?'up':'down';}
function pointerTarget(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*logicalW/r.width+camera.x,y:(e.clientY-r.top)*logicalH/r.height+camera.y,sx:e.clientX,sy:e.clientY};}
function hitObject(pos){
 const list=interactiveObjects().filter(o=>{
 if(o.dialogue)return Math.abs(pos.x-o.x)<13&&pos.y>o.y-30&&pos.y<o.y+8;
 const size=o.w&&o.h?{width:o.w,height:o.h}:Art.size(o.name)||{width:28,height:28};return Math.abs(pos.x-o.x)<size.width/2&&pos.y>o.y-size.height&&pos.y<o.y+6;
 });return list.sort((a,b)=>b.y-a.y)[0];
}
function routeTo(pos,action=null){
 if(!action)pos={...pos,x:(Math.floor(pos.x/T)+.5)*T,y:(Math.floor(pos.y/T)+.5)*T};
 const sx=Math.floor(player.x/T),sy=Math.floor(player.y/T),tx=Math.floor(pos.x/T),ty=Math.floor(pos.y/T);
 const open=[{x:sx,y:sy}],seen=new Map([[sx+','+sy,null]]);let end=null,i=0;
 const targetDistance=action?.object?32:action?.fish?58:13;
 while(i<open.length){const n=open[i++],p={x:(n.x+.5)*T,y:(n.y+.5)*T};if(dist(p,pos)<=targetDistance&&World.passable(scene,p.x,p.y,state)){end=n;break;}
 for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const x=n.x+dx,y=n.y+dy,key=x+','+y;if(x<0||x>=mapNow().w||y<0||y>=mapNow().h||seen.has(key)||!World.passable(scene,(x+.5)*T,(y+.5)*T,state))continue;let clear=true;for(let k=1;k<=4;k++)if(!World.passable(scene,p.x+dx*T*k/4,p.y+dy*T*k/4,state)){clear=false;break;}if(!clear)continue;seen.set(key,n);open.push({x,y});}}
 if(!end){toast('那里暂时走不过去，换一条小路吧',false);return false;}
 const route=[];let cur=end;while(cur){route.push({x:(cur.x+.5)*T,y:(cur.y+.5)*T});cur=seen.get(cur.x+','+cur.y);}route.reverse();if(route.length>1&&dist(player,route[0])<12)route.shift();path=route;queued=action;return true;
}
function clickWorld(e){
 if(modal||fish||window.Action?.locked)return;setUtilityMenu(false);const p=pointerTarget(e),tx=Math.floor(p.x/T),ty=Math.floor(p.y/T),o=hitObject(p);pointer=p;
 if(placement){if(dist(player,p)>110)return toast('靠近一点再摆放',false);if(!canPlaceHere(placement,tx,ty))return toast('选择农场里空旷的土地',false);const r=Core.place(state,placement,tx,ty);feedback(r,p.x,p.y);if(r.ok)placement=null;return;}
 if(selected==='bomb'){if(dist(player,p)>110)return toast('走近后再放炸弹',false);const r=Core.bomb(state,World.objects(scene,state),tx,ty);feedback(r,p.x,p.y);if(r.ok)burst(p.x,p.y,'harvest');return;}
 if(o&&(o.interact||o.dialogue||o.clearable||o.label)){if(dist(player,o)<43)doAction(tx,ty,o);else routeTo(o,{object:o,tx,ty});return;}
 if(selected==='rod'&&World.tile(scene,tx,ty)==='water'){const pos={x:(tx+.5)*T,y:(ty+.5)*T};if(dist(player,pos)<74)startFishing(pos);else routeTo(pos,{fish:pos,tx,ty});return;}
 if(isFarmTile(tx,ty)){const pos={x:(tx+.5)*T,y:(ty+.5)*T};if(dist(player,pos)<43)doAction(tx,ty);else routeTo(pos,{tx,ty});return;}
 if(World.passable(scene,p.x,p.y,state))routeTo({x:(tx+.5)*T,y:(ty+.5)*T});else if(World.tile(scene,tx,ty)==='water')toast('带上鱼竿（6），试试今天的手气。');
}
function updateTooltip(){
 if(!pointer||modal||fish){$('tooltip').style.display='none';return;}
 pointer.x=pointer.sx*logicalW/innerWidth+camera.x;pointer.y=pointer.sy*logicalH/innerHeight+camera.y;
 const tx=Math.floor(pointer.x/T),ty=Math.floor(pointer.y/T),o=hitObject(pointer);let html='';hover={tx,ty,o};
 if(o)html=o.label?'<b>'+esc(o.label)+'</b>':o.name==='chicken'?'<b>散步的小鸡</b>':'';
 if(o?.dialogue)html='<b>'+esc(o.name)+'</b><small>走近后交谈</small>';
 else if(o?.interact)html='<b>'+esc(o.label)+'</b><small>点击前往 · 靠近后 E 互动</small>';
 else if(o?.clearable)html='<b>'+(['wood','fiber'].includes(o.resource)?'杂木':Core.ITEMS[o.resource]?.name||'矿石')+'</b><small>使用'+(['wood','fiber'].includes(o.resource)?'斧头 4':'镐子 5')+'清理</small>';
 else if(isFarmTile(tx,ty)){const p=state.plots[tx+','+ty];if(p?.crop){const progress=Core.plotProgress(p);html='<b>'+Core.CROPS[p.crop].name+(progress>=1?' · 可以收获':'')+'</b><small>'+(progress>=1?(p.gift?'邻居的见面礼 · 点击收下':'点击收获'):Core.plotIsWet(p)?formatTime(Core.plotRemaining(p))+'后成熟':'等待浇水，尚未生长')+'</small><div class="tooltip-progress"><i style="width:'+progress*100+'%"></i></div>';}else html='<b>'+(p?'松软的田地':'等待开垦的土地')+'</b><small>'+(!p?'用锄头（2）翻土':selected.endsWith('-seed')?'点击播种':'选一包种子（7—9）')+'</small>';}
 else html='';
 if(html){$('tooltip').innerHTML=html;$('tooltip').style.display='block';$('tooltip').style.left=Math.min(innerWidth-220,pointer.sx+15)+'px';$('tooltip').style.top=Math.min(innerHeight-130,pointer.sy+17)+'px';}else $('tooltip').style.display='none';
}
function startFishing(water){
 const rodCost=Math.max(1,3-(state.tools.rod||0)*.5);if(state.energy<rodCost){toast('先吃点野莓，补充体力再来钓鱼。',false);return;}
 path=[];queued=null;keys={};face(water.x,water.y);state.energy-=rodCost;fish={zoneSize:.30+(Core.skillLevel?Core.skillLevel(state,'fishing')*.008:0)+(state.tools.rod||0)*.03,phase:'waiting',water,started:time,biteAt:time+1800+Math.random()*1700,biteEnd:0,zone:.35,velocity:0,fishY:.48,progress:.28,held:false,elapsed:0};$('fishing').classList.remove('hidden');$('fishing').classList.remove('bite');$('fishTrack').style.display='none';$('catchProgress').parentElement.style.display='none';$('fishInstruction').textContent='鱼线落进水里，静静等一会儿…';$('reelButton').textContent='等待鱼讯';$('fishTip').textContent='浮漂下沉时，按空格或点击收线';sound('water');save();updateHud();
}
function fishInput(){if(!fish)return;if(fish.phase==='bite'){fish.phase='catch';fish.elapsed=0;fish.held=false;$('fishing').classList.remove('bite');$('fishTrack').style.display='block';$('catchProgress').parentElement.style.display='block';$('fishInstruction').textContent='让鱼保持在绿色区域里';$('reelButton').textContent='按住上升 · 松开下降';$('fishTip').textContent='也可按住空格 / E · 捕获进度满格即可成功';sound('harvest');}else if(fish.phase==='catch')fish.held=true;}
function finishFishing(success,cancel=false){if(!fish)return;fish=null;$('fishing').classList.add('hidden');keys={};if(success){const r=Core.catchFish(state,'normal');feedback(r);sound('fish');burst(player.x,player.y-10,'harvest');}else if(!cancel)toast('鱼游走了，再抛一竿试试吧。',false);save();updateHud();}
function tickFishing(dt){
 if(!fish)return;fish.elapsed+=dt;
 if(fish.phase==='waiting'&&time>=fish.biteAt){fish.phase='bite';fish.biteEnd=time+2600;$('fishing').classList.add('bite');$('fishInstruction').textContent='咬钩了！现在收线！';$('reelButton').textContent='收线！';sound('coin');burst(fish.water.x,fish.water.y,'water');}
 else if(fish.phase==='bite'&&time>fish.biteEnd)finishFishing(false);
 else if(fish.phase==='catch'){
 const held=fish.held||keys[' ']||keys.e;fish.velocity+=((held?1.8:-1.4)-fish.velocity*3.8)*dt;fish.zone=clamp(fish.zone+fish.velocity*dt,0,1-fish.zoneSize);if(fish.zone===0||fish.zone===1-fish.zoneSize)fish.velocity*=.2;
 fish.fishY=clamp(.44+Math.sin(fish.elapsed*1.25)*.24+Math.sin(fish.elapsed*2.3)*.06,.07,.91);
 const inside=fish.fishY>=fish.zone&&fish.fishY<=fish.zone+fish.zoneSize;fish.progress=clamp(fish.progress+(inside?.19:-.065)*dt,0,1);
 $('catchZone').style.bottom=fish.zone*100+'%';$('catchZone').style.height=fish.zoneSize*100+'%';$('fishSprite').style.bottom='calc('+fish.fishY*100+'% - 12px)';$('catchProgress').style.width=fish.progress*100+'%';$('catchZone').style.background=inside?'#d2e982bb':'#bed76e66';
 if(fish.progress>=1)finishFishing(true);else if(fish.progress<=0||fish.elapsed>40)finishFishing(false);
 }
}
function changeScene(portal){
 if(portalCooldown>time||fish)return;window.Action?.cancel?.();if(isInterior()&&portal.to==='farm'&&state.livestockReturn){const r=state.livestockReturn;if(Number.isFinite(r.x)&&Number.isFinite(r.y)&&World.passable('farm',r.x,r.y,state))portal={...portal,spawn:{x:r.x,y:r.y}};delete state.livestockReturn;}portalCooldown=time+1400;path=[];queued=null;keys={};$('sceneFade').style.opacity='1';
 setTimeout(()=>{scene=portal.to;state.scene=scene;if(Core.visit)Core.visit(state,scene);if(scene==='mine'&&World.ensureMineFloor)World.ensureMineFloor(state);const target=portal.spawn||World.maps[scene].spawn;player.x=target.x;player.y=target.y;cameraReady=false;resize();pointer=null;hover=null;save();updateHud();$('sceneFade').style.opacity='0';toast('来到'+World.maps[scene].name);},280);
}
function tick(dt){
 if(time-lastSimulation>500){if(Core.tick)Core.tick(state);else Core.tickEnergy(state);lastSimulation=time;}tickFishing(dt);window.Action?.update(dt,time);moving=false;
 for(const n of World.maps[scene].npcs){if(n.homeX===undefined){n.homeX=n.x;n.homeY=n.y;}const cycle=(time/1000+(n.id==='lin'?0:4))%16,leg=Math.floor(cycle/4),p=(cycle%4)/4;const offsets=[[12*p,0],[12,12*p],[12*(1-p),12],[0,12*(1-p)]],off=offsets[leg];const nx=n.homeX+off[0]-6,ny=n.homeY+off[1]-6;if(!modal&&World.passable(scene,nx,ny,state)){n.x=nx;n.y=ny;n.dir=['right','down','left','up'][leg];n.walk=(time/180)%1;}}
 if(!modal&&!fish&&!window.Action?.locked&&portalCooldown<time+1100){let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y;
 if(Math.abs(dx)+Math.abs(dy)>.1){path=[];queued=null;}else if(path.length){const target=path[0],d=dist(player,target);if(d<3){player.x=target.x;player.y=target.y;path.shift();}else{dx=(target.x-player.x)/d;dy=(target.y-player.y)/d;}}
 const len=Math.hypot(dx,dy);if(len>.08){if(len>1){dx/=len;dy/=len;}const speed=keys.shift||path.length>10?145:100,step=speed*dt;const nx=player.x+dx*step,ny=player.y+dy*step;const prevX=player.x,prevY=player.y;if(World.passable(scene,nx,player.y,state))player.x=nx;if(World.passable(scene,player.x,ny,state))player.y=ny;moving=prevX!==player.x||prevY!==player.y;if(moving){face(player.x+dx*10,player.y+dy*10);walkPhase=(walkPhase+dt*7)%1;}else if(path.length){path=[];queued=null;}}
 if(!path.length&&queued){const q=queued;queued=null;if(q.object&&dist(player,q.object)<45)doAction(q.tx,q.ty,q.object);else if(q.fish&&dist(player,q.fish)<80)startFishing(q.fish);else if(!q.object&&!q.fish&&dist(player,{x:(q.tx+.5)*T,y:(q.ty+.5)*T})<45)doAction(q.tx,q.ty);}
 for(const p of World.maps[scene].portals)if(player.x>=p.x&&player.x<p.x+p.w&&player.y>=p.y&&player.y<p.y+p.h)changeScene(p);
 }
 if(window.CatAI)CatAI.update(cat,dt,time,state,player,scene);
 const goal=cameraGoal();camera.x+=(goal.x-camera.x)*Math.min(1,dt*5);camera.y+=(goal.y-camera.y)*Math.min(1,dt*5);
 particles=particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;return p.life>0;});floats=floats.filter(f=>{f.life-=dt;f.y-=dt*13;return f.life>0;});if(actionFx){actionFx.life-=dt;if(actionFx.life<=0)actionFx=null;}
}
function drawPlots(){
 if(scene!=='farm')return;
 for(const[key,p]of Object.entries(state.plots)){const[tx,ty]=key.split(',').map(Number),x=tx*T,y=ty*T;if(x<camera.x-30||y<camera.y-30||x>camera.x+logicalW+30||y>camera.y+logicalH+30)continue;Art.soil(ctx,x,y,Core.plotIsWet(p),{left:!!state.plots[(tx-1)+','+ty],right:!!state.plots[(tx+1)+','+ty],up:!!state.plots[tx+','+(ty-1)],down:!!state.plots[tx+','+(ty+1)]});}
}

function drawCropsAsEntities(entities){if(scene!=='farm')return;for(const[key,p]of Object.entries(state.plots)){if(!p.crop)continue;const [x,y]=key.split(',').map(Number),progress=Core.plotProgress(p);entities.push({y:y*T+18,draw:()=>{Art.crop(ctx,p.crop,progress>=1?3:progress>.55?2:progress>.18?1:0,x*T+12,y*T+12,time);if(progress>=1){const b=Math.round(Math.sin(time/500+x)*2);ctx.fillStyle='#fff0b0';ctx.fillRect(x*T+11,y*T-4+b,3,3);ctx.fillRect(x*T+12,y*T-6+b,1,7);ctx.fillRect(x*T+9,y*T-3+b,7,1);}}});}}
function render(){
 ctx.clearRect(0,0,logicalW,logicalH);ctx.fillStyle=(scene==='home'||isInterior())?'#3b3026':scene==='mine'?'#343943':'#8fa85c';ctx.fillRect(0,0,logicalW,logicalH);ctx.save();ctx.translate(-camera.x,-camera.y);World.drawGround(ctx,scene,time,state,{x:camera.x,y:camera.y,w:logicalW,h:logicalH});drawPlots();
 if(path.length){ctx.fillStyle='#fff5d18c';path.filter((_,i)=>i%2===0).forEach(p=>ctx.fillRect(p.x-1,p.y-1,2,2));const end=path[path.length-1];ctx.strokeStyle='#ffefbc';ctx.lineWidth=1;ctx.strokeRect(end.x-5,end.y-5,10,10);}
 if(hover&&isFarmTile(hover.tx,hover.ty)&&!modal){ctx.strokeStyle='#fff1ba';ctx.lineWidth=1;const x=hover.tx*T,y=hover.ty*T;ctx.strokeRect(x+1.5,y+1.5,21,21);}
 const entities=[];
 for(const d of (state.decorations||[])){if(d.scene&&d.scene!==scene)continue;const x=(d.tx+.5)*T,y=(d.ty+.8)*T;entities.push({y,draw:()=>Art.draw(ctx,d.item||d.itemId||d.type,x,y,{time})});}
 if(placement&&pointer){ctx.save();ctx.globalAlpha=.6;Art.draw(ctx,placement,(Math.floor(pointer.x/T)+.5)*T,(Math.floor(pointer.y/T)+.8)*T,{time});ctx.restore();}
 World.objects(scene,state,time).filter(o=>o.x>camera.x-180&&o.x<camera.x+logicalW+180&&o.y>camera.y-40&&o.y<camera.y+logicalH+190).forEach(o=>{let x=o.x,y=o.y;if(o.animated){x+=Math.sin(time/1700+(o.phase||0))*9;y+=Math.cos(time/2200+(o.phase||0))*4;}entities.push({y,draw:()=>{if(o.customRender==='interior'&&window.Interior)Interior.drawObject(ctx,{...o,x,y},time,state);else Art.draw(ctx,o.name,x,y,{...o,time});if(o.label&&o.name==='sign'){ctx.fillStyle='#5c513a';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText(o.label.includes('→')?'→':o.label.includes('←')?'←':'≈',Math.round(x),Math.round(y)-19);}}});});
 World.maps[scene].npcs.forEach(n=>{entities.push({y:n.y,draw:()=>{Art.character(ctx,n.x,n.y,{style:n.style,dir:n.dir,walk:modal?0:n.walk||0});ctx.font='8px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff4cf';ctx.fillRect(n.x-15,n.y-45,30,12);ctx.fillStyle='#746444';ctx.fillText(n.name,n.x,n.y-36);}});});
 drawCropsAsEntities(entities);
 if(scene==='farm')entities.push({y:cat.y,draw:()=>{if(window.CatAI)CatAI.draw(ctx,cat,time);else Art.character(ctx,cat.x,cat.y,{style:'cat',dir:cat.dir});}});
 entities.push({y:player.y,draw:()=>{
 if(!window.Action?.draw(ctx,player,time,state)){ctx.save();ctx.translate(player.x,player.y);ctx.scale(window.Action?.characterScale||1.3,window.Action?.characterScale||1.3);Art.character(ctx,0,0,{style:'player',dir:player.dir,walk:moving?walkPhase:0,color:state.color,hat:true});ctx.restore();}
 if(fish){ctx.strokeStyle='#f5e8bf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(player.x+5,player.y-18);ctx.quadraticCurveTo((player.x+fish.water.x)/2,Math.min(player.y,fish.water.y)-30,fish.water.x,fish.water.y);ctx.stroke();ctx.strokeStyle='#d7eddf99';ctx.strokeRect(fish.water.x-7,fish.water.y-2,14,4);ctx.fillStyle='#efcf97';ctx.fillRect(fish.water.x-1,fish.water.y-5+(fish.phase==='bite'?3:Math.round(Math.sin(time/250))),3,5);ctx.fillStyle='#bd654d';ctx.fillRect(fish.water.x-1,fish.water.y-5,3,2);}
 }});
 entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
 World.drawAtmosphere(ctx,scene,time,state,{x:camera.x,y:camera.y,w:logicalW,h:logicalH});
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);}ctx.globalAlpha=1;
 for(const f of floats){ctx.globalAlpha=Math.min(1,f.life);ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillStyle='#52623d';ctx.fillText(f.text,Math.round(f.x)+1,Math.round(f.y)+1);ctx.fillStyle='#fff0b5';ctx.fillText(f.text,Math.round(f.x),Math.round(f.y));}ctx.globalAlpha=1;
 ctx.restore();
}
function frame(t){time=t;const dt=Math.min(.04,(t-(lastFrame||t))/1000);lastFrame=t;tick(dt);render();if(t-lastHud>200){updateHud();updateContext();updateTooltip();lastHud=t;}if(t-lastSave>5000){save();lastSave=t;}requestAnimationFrame(frame);}
window.addEventListener('resize',()=>{resize();paintIcons();});window.addEventListener('blur',()=>{keys={};joy={x:0,y:0};if(fish)fish.held=false;save();});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys={};save();}});window.addEventListener('pagehide',save);
canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();sound('select');clickWorld(e);});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointer=pointerTarget(e);updateTooltip();});canvas.addEventListener('pointerleave',()=>{pointer=null;hover=null;$('tooltip').style.display='none';});canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.altKey||e.metaKey)return;
 const key=e.key.toLowerCase();if(!modal&&key===' '&&e.target.closest?.('button,input,select,textarea'))return;if(key==='escape'){e.preventDefault();if(modal)closePanel();else if($('gameMenu')?.classList.contains('expanded'))setUtilityMenu(false);else if(placement)placement=null;else if(fish)finishFishing(false,true);else{path=[];queued=null;}return;}
 if(modal){if(!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)&&({i:'bag',b:'bag',m:'map',j:'journal',c:'craft',o:'settings'})[key]===modal){e.preventDefault();closePanel();return;}if(key==='tab'){const nodes=[...$('panel').querySelectorAll('button:not(:disabled),input:not([type=file]),select,[tabindex="0"]')].filter(n=>n.offsetParent!==null);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}return;}
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();keys[key]=true;
 if(e.repeat)return;if(key==='e'||key===' '){keyboardAction();return;}if(fish)return;
 if(/^[1-9]$/.test(key))selectTool(toolList[Number(key)-1].id);else if(key==='i'||key==='b')openBag();else if(key==='m')systems.map();else if(key==='j')systems.journal();else if(key==='c')systems.craft();else if(key==='o')systems.settings();else if(key==='-'){zoom=clamp(zoom-.2,1,3.5);resize();}else if(key==='='){zoom=clamp(zoom+.2,1,3.5);resize();}
});window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();keys[key]=false;if((key===' '||key==='e')&&fish)fish.held=false;});
$('closePanel').onclick=closePanel;$('modalLayer').addEventListener('pointerdown',e=>{if(e.target===$('modalLayer'))closePanel();});$('bagButton').onclick=()=>openBag();$('mapButton').onclick=()=>systems.map();$('helpButton').onclick=openHelp;$('questToggle').onclick=()=>systems.journal();$('soundButton').onclick=()=>{state.sound=!state.sound;updateHud();save();sound('coin');};if($('menuToggle'))$('menuToggle').onclick=()=>setUtilityMenu(!$('gameMenu').classList.contains('expanded'));document.addEventListener('pointerdown',e=>{if($('gameMenu')&&!$('gameMenu').contains(e.target))setUtilityMenu(false);});setUtilityMenu(false);
$('mobileAction').addEventListener('pointerdown',e=>{e.preventDefault();$('mobileAction').setPointerCapture(e.pointerId);keyboardAction();});$('reelButton').addEventListener('pointerdown',e=>{e.preventDefault();$('reelButton').setPointerCapture(e.pointerId);fishInput();});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>$('reelButton').addEventListener(ev,()=>{if(fish)fish.held=false;}));$('cancelFishing').onclick=()=>finishFishing(false,true);
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>$('mobileAction').addEventListener(ev,()=>{if(fish)fish.held=false;}));
let joyPointer=null;const stick=$('joystick');function moveStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),max=r.width*.32;joy={x:dx/Math.max(max,d),y:dy/Math.max(max,d)};if(d<7)joy={x:0,y:0};stick.firstElementChild.style.transform='translate('+joy.x*max+'px,'+joy.y*max+'px)';}
stick.addEventListener('pointerdown',e=>{e.preventDefault();joyPointer=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});stick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveStick(e);});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stick.addEventListener(ev,()=>{joyPointer=null;joy={x:0,y:0};stick.firstElementChild.style.transform='';}));
function openElevator(){
 const floors=[1,5,10,15,20].filter(f=>f<=(state.mineCheckpoint||1));
 openPanel('elevator','<div class="eyebrow">THE OLD MINE LIFT</div><h2>回声矿井升降梯</h2><p class="subtitle">每抵达五层，便会永久记住这条下山的路。</p><div class="panel-actions">'+floors.map(f=>'<button class="primary" data-floor="'+f+'">第 '+f+' 层</button>').join('')+'<button class="secondary" id="mineExit">返回山道</button></div>');
 document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>{state.mineFloor=Number(b.dataset.floor);World.ensureMineFloor(state);closePanel();changeScene({to:'mine',spawn:World.maps.mine.spawn});});
 $('mineExit').onclick=()=>{closePanel();changeScene({to:'mountain',spawn:{x:48*T,y:21*T}});};
}
function canPlaceHere(id,tx,ty){
 if(scene!=='farm')return false;const size=Art.size(id),w=['coop','barn'].includes(id)?70:['fence'].includes(id)?20:14,h=['coop','barn'].includes(id)?35:10,x=(tx+.5)*T,y=(ty+.8)*T;
 for(let xx=x-w/2;xx<=x+w/2;xx+=8)for(let yy=y-h;yy<=y;yy+=8){if(!World.passable(scene,xx,yy,state)||state.plots[Math.floor(xx/T)+','+Math.floor(yy/T)]?.crop)return false;}return true;
}
function beginPlacement(itemId){placement=itemId;closePanel();toast('在农场空地点击放置 · ESC 取消');}
const systems=window.createSystemsUI?window.createSystemsUI({getState:()=>state,getScene:()=>scene,getPlayer:()=>player,openPanel,closePanel,feedback,iconMarkup,paintIcons,selectTool,changeScene,save,toast,beginPlacement,openShop,openStorage,openSell,openHelp,enterLivestock:navigateLivestock,navigateTo:o=>{closePanel();routeTo(o,o.walkOnly?null:{object:o,tx:Math.floor(o.x/T),ty:Math.floor(o.y/T)});}}):{home:openHome,npc:openNpc,journal:openJournal,map:openMap};
$('craftButton').onclick=()=>systems.craft();$('journalButton').onclick=()=>systems.journal();$('settingsButton').onclick=()=>systems.settings();
canvas.addEventListener('wheel',e=>{if(modal)return;e.preventDefault();zoom=clamp(zoom+(e.deltaY<0?.12:-.12),1,3.5);resize();},{passive:false});
zoom=innerWidth<600?1.5:innerWidth<1200?1.55:1.75;
if(World.ensureMineFloor&&scene==='mine')World.ensureMineFloor(state);
if(Core.visit)Core.visit(state,scene);
Art.theme=state.theme||'clay';restoreWalkablePosition();resize();buildTools();paintIcons();updateHud();
Promise.all([Art.ready,World.ready,window.CatAI?.ready,window.Interior?.ready]).then(()=>{paintIcons();$('loadingScreen')?.remove();requestAnimationFrame(frame);});
if(!loaded)openWelcome();else{const mature=Object.values(state.plots).filter(p=>p.crop&&Core.plotProgress(p)>=1).length;if(mature)setTimeout(()=>toast('欢迎回家！有 '+mature+' 块田地可以收获。'),500);}
// Read-only diagnostics support reproducible checks without changing game state.
window.TideTown={snapshot:()=>JSON.parse(JSON.stringify(state)),view:()=>({scene,camera:{...camera},logicalW,logicalH,selected,modal,pathLength:path.length,position:{x:player.x,y:player.y},maps:Object.keys(World.maps),assets:Art.loaded,placement,action:window.Action?.snapshot()||null,cat:{x:cat.x,y:cat.y,mode:cat.mode},fishing:fish?{phase:fish.phase,progress:fish.progress}:null})};
})();
