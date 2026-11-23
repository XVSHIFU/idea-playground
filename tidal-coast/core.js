/* 潮汐小镇 · Clay edition — rendering-independent, browser-local simulation. */
(function (root) {
'use strict';
const VERSION=2, STORAGE_KEY='tide-town-v1', WET_MS=6*3600000, DAY_MS=12*60000, MAX_STACK=999999;
const SEASONS=['春','夏','秋','冬'];
const CROPS={
 radish:{name:'萝卜',seedPrice:10,sellPrice:24,growMs:180000,seasons:[0,2],description:'3 分钟成熟。新农场的第一份收获。'},
 potato:{name:'土豆',seedPrice:25,sellPrice:70,growMs:720000,seasons:[0,2],description:'12 分钟成熟，稳定而踏实。'},
 strawberry:{name:'草莓',seedPrice:60,sellPrice:35,growMs:1200000,regrowMs:900000,seasons:[0],description:'20 分钟初熟，之后每 15 分钟重新结果。'},
 pumpkin:{name:'南瓜',seedPrice:120,sellPrice:280,growMs:3600000,seasons:[2],description:'60 分钟成熟。硕大的秋日馈赠。'},
 corn:{name:'玉米',seedPrice:45,sellPrice:90,growMs:900000,regrowMs:600000,seasons:[1,2],description:'15 分钟初熟，之后每 10 分钟重新收获。'},
 tomato:{name:'番茄',seedPrice:35,sellPrice:64,growMs:600000,regrowMs:480000,seasons:[1],description:'10 分钟初熟，之后每 8 分钟结果。'},
 wheat:{name:'小麦',seedPrice:15,sellPrice:35,growMs:300000,seasons:[0,1,2],description:'5 分钟成熟，可以磨面粉或喂动物。'},
 pearlflower:{name:'珍珠花',seedPrice:500,sellPrice:1300,growMs:6*3600000,seasons:[0,3],description:'6 小时成熟。可赠礼、收藏或出售。'}
};
const ITEMS={};
function item(id,name,sellPrice,extra){ITEMS[id]=Object.assign({name,price:sellPrice,sellPrice,description:name+'，可用于小镇生活。'},extra||{});}
item('wood','木材',5,{description:'伐木获得，用于制作、建造与小镇修复。'});
item('stone','石料',4);item('copper','铜矿',14);item('iron','铁矿',25);item('gold','金矿',55);item('coal','煤炭',12);item('gem','蓝晶石',140);
item('berry','野莓',5,{buyPrice:15,energy:25,description:'食用恢复 25 点体力，也是一份友善的礼物。'});
item('mushroom','林间蘑菇',18,{energy:18});item('shell','彩贝',22);item('feed','牧草饲料',4,{buyPrice:12});
item('fertilizer','有机肥料',12,{buyPrice:28,description:'播种前使用，提高收获品质。'});
item('egg','鸡蛋',35);item('duckegg','鸭蛋',55);item('milk','牛奶',80);item('wool','羊毛',110);
item('copperbar','铜锭',60);item('ironbar','铁锭',100);item('goldbar','金锭',200);
item('flour','面粉',55);item('bread','乡村面包',100,{energy:60,buyPrice:130});item('jam','果酱',130);item('cheese','奶酪',190);item('driedfish','鱼干',100,{energy:35});
const FISH={
 fish:{name:'海鲈鱼',price:45,scenes:['beach','farm'],weight:7},
 sardine:{name:'沙丁鱼',price:30,scenes:['beach'],weight:9},
 tuna:{name:'金枪鱼',price:180,scenes:['beach'],weight:2,project:'dock'},
 octopus:{name:'章鱼',price:120,scenes:['beach'],weight:3,night:true},
 crab:{name:'海蟹',price:75,scenes:['beach'],weight:4},
 carp:{name:'鲤鱼',price:55,scenes:['farm','town','lake'],weight:8},
 crucian:{name:'鲫鱼',price:35,scenes:['farm','town','forest','lake'],weight:10},
 eel:{name:'鳗鱼',price:110,scenes:['forest','lake','town'],weight:3,weather:'rain'},
 goldcarp:{name:'金色鲤鱼',price:280,scenes:['lake'],weight:1},
 trout:{name:'虹鳟',price:85,scenes:['mountain','forest'],weight:7},
 glacierfish:{name:'冰晶鱼',price:300,scenes:['mountain'],weight:1,season:3},
 glowfish:{name:'夜光鱼',price:220,scenes:['ruins','mine','lake'],weight:2,night:true}
};
Object.entries(FISH).forEach(([id,f])=>item(id,f.name,f.price,{category:'fish',description:'在'+({farm:'农场河湾',town:'小镇河道',beach:'潮汐海岸',lake:'镜湖',forest:'森林溪流',mountain:'山涧',ruins:'旧灯塔湿地',mine:'矿洞暗河'}[f.scenes[0]])+'能够钓到。'}));
Object.entries(CROPS).forEach(([id,c])=>{
 item(id,c.name,c.sellPrice,{category:'crop',crop:id,description:'农场出产的新鲜'+c.name+'。'});
 item(id+'-seed',c.name+'种子',Math.floor(c.seedPrice/2),{buyPrice:c.seedPrice,crop:id,description:c.description});
 for(const [q,m,label] of [['silver',1.25,'银星'],['gold',1.5,'金星'],['rainbow',2,'彩虹']])item(id+'-'+q,label+c.name,Math.round(c.sellPrice*m),{category:'crop',crop:id,quality:q,description:label+'品质，售价为普通作物的 '+m+' 倍。'});
});
const RECIPES={
 furnace:{name:'熔炉',description:'把矿石炼成工具升级所需的金属锭。',cost:{stone:12,copper:5},coins:40,output:'furnace',amount:1},
 sprinkler:{name:'洒水器',description:'放置在农场，每次自动滋润周围 3×3 田地。',cost:{copperbar:2,iron:2},coins:50,output:'sprinkler',amount:1},
 coop:{name:'鸡舍',description:'放置后可饲养鸡与鸭，最多 6 只。',cost:{wood:20,stone:8},coins:160,output:'coop',amount:1},
 barn:{name:'牛棚',description:'放置后可饲养牛与羊，最多 4 只。',cost:{wood:35,stone:20,ironbar:2},coins:400,output:'barn',amount:1},
 jar:{name:'果酱罐',description:'将草莓与野莓变成香甜果酱。',cost:{wood:12,stone:6},coins:60,output:'jar',amount:1},
 cheesemaker:{name:'奶酪机',description:'将新鲜牛奶制成奶酪。',cost:{wood:15,copperbar:2},coins:120,output:'cheesemaker',amount:1},
 mill:{name:'石磨',description:'磨制面粉，也能把面粉烘焙成面包。',cost:{stone:15,wood:10},coins:80,output:'mill',amount:1},
 dryer:{name:'晒鱼架',description:'把海鲈鱼加工成耐储存的鱼干。',cost:{wood:10},coins:30,output:'dryer',amount:1},
 bomb:{name:'小炸弹',description:'炸开周围 5×5 格内的矿石与石块。',cost:{copper:3,coal:1},coins:10,output:'bomb',amount:1},
 fence:{name:'木栅栏',description:'放在农场装饰自己的道路与院子。',cost:{wood:2},coins:0,output:'fence',amount:2},
 lamp:{name:'庭院灯',description:'入夜后会亮起暖光。',cost:{wood:4,copper:2},coins:15,output:'lamp',amount:1},
 bench:{name:'花园长椅',description:'为院子添一个看海的位置。',cost:{wood:8},coins:10,output:'bench',amount:1},
 flowerpot:{name:'陶土花盆',description:'摆一盆四季盛开的花。',cost:{stone:4,wood:2},coins:20,output:'flowerpot',amount:1},
 fertilizer:{name:'有机肥料',description:'施在空田上，提高下一株作物的品质。',cost:{berry:2,wood:1},coins:0,output:'fertilizer',amount:2}
};
for(const [id,r] of Object.entries(RECIPES))if(!ITEMS[id])item(id,r.name,Math.max(1,Math.floor(r.coins/2)),{placeable:!['bomb','fertilizer'].includes(id),description:r.description});
const MACHINES={
 copperbar:{name:'熔炼铜锭',machine:'furnace',input:{copper:3,coal:1},output:'copperbar',amount:1,durationMs:30000},
 ironbar:{name:'熔炼铁锭',machine:'furnace',input:{iron:3,coal:1},output:'ironbar',amount:1,durationMs:45000},
 goldbar:{name:'熔炼金锭',machine:'furnace',input:{gold:3,coal:2},output:'goldbar',amount:1,durationMs:60000},
 jam:{name:'草莓果酱',machine:'jar',input:{strawberry:2,berry:2},output:'jam',amount:1,durationMs:60000},
 berryjam:{name:'野莓果酱',machine:'jar',input:{berry:8},output:'jam',amount:1,durationMs:75000},
 cheese:{name:'乡村奶酪',machine:'cheesemaker',input:{milk:1},output:'cheese',amount:1,durationMs:90000},
 flour:{name:'现磨面粉',machine:'mill',input:{wheat:2},output:'flour',amount:1,durationMs:30000},
 bread:{name:'烤面包',machine:'mill',input:{flour:1,egg:1},output:'bread',amount:1,durationMs:60000},
 driedfish:{name:'风干鱼',machine:'dryer',input:{fish:1},output:'driedfish',amount:1,durationMs:90000}
};
const ANIMALS={
 chicken:{name:'小鸡',price:180,building:'coop',produce:'egg',durationMs:180000},
 duck:{name:'小鸭',price:300,building:'coop',produce:'duckegg',durationMs:240000},
 cow:{name:'奶牛',price:600,building:'barn',produce:'milk',durationMs:300000},
 sheep:{name:'绵羊',price:850,building:'barn',produce:'wool',durationMs:360000}
};
const NPCS={
 lin:{name:'林芽',role:'种子铺店主',likes:['strawberry','pearlflower','jam'],lines:['欢迎回来，泥土闻起来总让人安心。','春天种下的期待，会在夏天变成故事。','我想把小镇的每一扇窗边都种满花。']},
 he:{name:'阿禾',role:'老渔夫',likes:['fish','tuna','driedfish'],lines:['听一听海浪。最好的鱼总在你放松的时候上钩。','码头修好以后，深海的鱼也会来拜访。','今天的潮汐不错，要不要再抛一竿？']},
 yan:{name:'岩叔',role:'铁匠',likes:['copperbar','ironbar','goldbar','gem'],lines:['好工具不催人赶路，只让手上的活轻松些。','矿石交给熔炉，耐心交给时间。','往矿洞深处走，记得带些吃的。']},
 moss:{name:'苔青',role:'森林研究员',likes:['mushroom','berry','pearlflower'],lines:['你看到林子里的光了吗？每个季节都不一样。','留一点野莓给鸟儿，明天也会有好收获。','旧遗迹那边偶尔会有发光的小鱼。']},
 su:{name:'苏姨',role:'酒馆老板',likes:['bread','cheese','milk'],lines:['来喝杯热茶吧，累了就慢一点。','小镇的故事，都藏在饭桌和晚风里。','夜里听得到灯塔的风，修好它就更热闹了。']},
 ning:{name:'宁远',role:'小镇管理员',likes:['shell','gem','pumpkin'],lines:['很高兴你来了，镇上又多了一盏亮着的灯。','每一块木材都会让大家的家园更好一点。','你的脚步让那些旧路重新有了声音。']}
};
const PROJECTS={
 dock:{name:'修复深海码头',description:'开放金枪鱼等深海鱼群，并获得 200 金币谢礼。',cost:{wood:25,stone:12,copperbar:2},coins:180},
 greenhouse:{name:'重建温室',description:'所有作物不再受到季节减速，品质几率提高。',cost:{wood:40,stone:25,ironbar:4},coins:500},
 lighthouse:{name:'点亮旧灯塔',description:'完成小镇复兴主线，解锁灯塔纪念章与稀有鱼的额外机会。',cost:{wood:50,stone:30,goldbar:3,gem:2},coins:800}
};
const SKILL_NAMES={farming:'农耕',fishing:'钓鱼',mining:'采矿',foraging:'采集',social:'社交'};
const TOOL_NAMES={hoe:'锄头',water:'浇水壶',axe:'斧头',pickaxe:'镐子',rod:'鱼竿'};
const SCENES={farm:[96,80],town:[128,128],forest:[96,96],beach:[112,72],mountain:[96,80],lake:[80,80],quarry:[64,64],ruins:[80,80],mine:[48,48],home:[24,20],coop:[24,20],barn:[24,20]};
const quests=[
 {id:'till',title:'让土地醒来',description:'用锄头翻好 4 块土地。',stat:'tilled',target:4,rewardCoins:25},
 {id:'plant',title:'种下第一份期待',description:'亲手播种 4 颗种子。',stat:'planted',target:4,rewardCoins:30},
 {id:'water',title:'一场小小的雨',description:'为 4 块新播种的田地浇水。',stat:'watered',target:4,rewardCoins:25},
 {id:'harvest',title:'属于你的收获',description:'收获 4 份自己种下的作物。',stat:'harvested',target:4,rewardCoins:60},
 {id:'fish',title:'来自潮汐的礼物',description:'成功钓到 1 条鱼。',stat:'fish',target:1,rewardCoins:50},
 {id:'traveler',title:'小镇的四个方向',description:'亲自到访 5 个区域。',stat:'visited',target:5,rewardCoins:120},
 {id:'woodland',title:'林间的礼物',description:'完成 12 次采集或伐木。',stat:'gathered',target:12,rewardCoins:120},
 {id:'mining',title:'岩层里的光',description:'成功开采 10 处矿石。',stat:'mined',target:10,rewardCoins:150},
 {id:'craft',title:'亲手制作',description:'完成 3 次制作。',stat:'crafted',target:3,rewardCoins:180},
 {id:'friends',title:'熟悉的面孔',description:'与全部 6 位居民打招呼。',stat:'talked',target:6,rewardCoins:200},
 {id:'cook',title:'好东西需要等待',description:'收取 5 份加工产品。',stat:'processed',target:5,rewardCoins:220},
 {id:'ranch',title:'清晨的鸡鸣',description:'收取 3 份动物产物。',stat:'animalProducts',target:3,rewardCoins:200},
 {id:'museum',title:'替小镇记住远方',description:'向博物馆捐赠 8 种物品。',stat:'donated',target:8,rewardCoins:300},
 {id:'deep',title:'听见山的心跳',description:'抵达矿洞第 10 层。',stat:'deepestMine',target:10,rewardCoins:400},
 {id:'fisher',title:'海的收藏家',description:'累计捕获 15 条鱼。',stat:'fish',target:15,rewardCoins:300},
 {id:'prosper',title:'丰收的院子',description:'亲手收获 40 份农作物。',stat:'harvested',target:40,rewardCoins:450},
 {id:'revive',title:'潮汐再一次亮起',description:'完成码头、温室与灯塔三项修复。',stat:'projects',target:3,rewardCoins:1000}
].map(q=>Object.freeze(Object.assign(q,{reward:q.rewardCoins})));
function num(v,d,min=0,max=Infinity){return typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):d;}
function int(v,d,min=0,max=Infinity){return Math.floor(num(v,d,min,max));}
function nowTime(t){return num(t,Date.now());}
function ok(message,extras){return Object.assign({ok:true,message},extras||{});}
function fail(message){return{ok:false,message};}
function validCount(n){return Number.isSafeInteger(n)&&n>0&&n<=MAX_STACK;}
function has(id){return Object.prototype.hasOwnProperty.call(ITEMS,id);}
function farmTile(x,y){return Number.isInteger(x)&&Number.isInteger(y)&&((x>=16&&x<=26&&y>=10&&y<=25)||(x>=48&&x<=68&&y>=32&&y<=47));}
// Layout migration is deliberately independent of World: keep every saved plant
// and its clocks, and move riverside facilities without changing their identity.
function migrateFarmLayout(source){
 if(int(source.farmLayoutVersion,0)>=2)return source;
 const out={...source},plots={},moving=[],reserve=Array.isArray(source.farmRelocationReserve)?source.farmRelocationReserve.slice():[];
 for(const[key,p]of Object.entries(source.plots||{})){
  if(!/^\d+,\d+$/.test(key))continue;const[x,y]=key.split(',').map(Number);
  if(x>=27&&x<=36&&y>=10&&y<=25)moving.push({key,x,y,plot:p});else plots[key]=p;
 }
 const secondary=[];for(let y=32;y<=47;y++)for(let x=48;x<=68;x++)secondary.push(x+','+y);
 for(const old of moving){const preferred=(48+old.x-27)+','+(32+old.y-10);const key=Object.prototype.hasOwnProperty.call(plots,preferred)?secondary.find(k=>!Object.prototype.hasOwnProperty.call(plots,k)):preferred;
  if(key)plots[key]=old.plot;else reserve.push({from:old.key,plot:old.plot});
 }
 // Normal old layouts have at most 160 plants to relocate into 336 free slots.
 // An overfilled, hand-merged save is retained in a reserve rather than discarded.
 out.plots=plots;out.farmRelocationReserve=reserve;
 const originals=Array.isArray(source.decorations)?source.decorations:[],staying=[],shifting=[];
 for(const d of originals){if(d&&d.scene==='farm'&&d.tx>=27&&d.tx<=35&&d.ty<32)shifting.push(d);else staying.push(d);}
 const occupied=new Set(Object.keys(plots));
 function footprint(d,x=d.tx,y=d.ty){const radius=['coop','barn'].includes(d.item)?2:['bench','mill','dryer','furnace'].includes(d.item)?1:0,keys=[];for(let yy=y-1;yy<=y;yy++)for(let xx=x-radius;xx<=x+radius;xx++)keys.push(xx+','+yy);return keys;}
 for(const d of staying)if(d&&d.scene==='farm')for(const key of footprint(d))occupied.add(key);
 const spots=[];for(let y=28;y<=30;y+=2)for(let x=48;x<=66;x+=3)spots.push([x,y]);for(let y=33;y<=47;y+=3)for(let x=48;x<=66;x+=3)spots.push([x,y]);
 for(const d of shifting){const target=spots.find(([x,y])=>footprint(d,x,y).every(key=>!occupied.has(key)));
  if(target){const moved={...d,tx:target[0],ty:target[1]};staying.push(moved);for(const key of footprint(moved))occupied.add(key);}
  else{ // Retain the item if an unusually dense mixed save has no safe landing.
   out.storage={...(out.storage||{})};out.storage[d.item]=int(out.storage[d.item],0)+1;out.farmRelocationStored=(out.farmRelocationStored||0)+1;
  }
 }
 out.decorations=staying;out.farmLayoutVersion=2;out.farmLayoutMigrated={plots:moving.length,decorations:shifting.length};return out;
}
function restoreRelocatedPlot(s,key){if(!s.farmRelocationReserve?.length||!s.plots[key]||s.plots[key].crop)return;const pending=s.farmRelocationReserve.shift();if(pending?.plot)s.plots[key]={...pending.plot};}
function blankPlot(){return{tilled:true,crop:null,plantedAt:null,growAt:null,wateredAt:null,wetUntil:0,growthMs:0,durationMs:0,quality:'normal',fertilized:false};}
function defaults(now){return{skills:{farming:0,fishing:0,mining:0,foraging:0,social:0},tools:{hoe:0,water:0,axe:0,pickaxe:0,rod:0},friendship:{},jobs:[],animals:[],built:{},projects:{},museum:[],discoveries:[],decorations:[],visited:['farm'],resourceRecords:{},dayBase:1,calendarStartAt:now,lastSimAt:now,lastRainDay:0,theme:'clay',mineFloor:1,mineCheckpoint:1,baseStructures:{coop:1,barn:1},legacyStructures:{},gates:{},livestockWelcomeClaimed:false,farmLayoutVersion:2};}
function newGame(name,color){
 const now=Date.now(),state=Object.assign({version:VERSION,name:typeof name==='string'&&name.trim()?name.trim().slice(0,18):'旅行者',color:typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color)?color:'#688b9a',money:200,energy:100,scene:'farm',player:{x:20.5*24,y:18.5*24,dir:'right'},inventory:{'radish-seed':6,'potato-seed':2,'strawberry-seed':1,'wheat-seed':3,berry:3},storage:{},plots:{},cleared:[],stats:{tilled:0,planted:0,watered:0,harvested:0,sold:0,fish:0,talked:[],gathered:0,mined:0,crafted:0,processed:0,animalProducts:0,donated:0,deepestMine:1,projects:0,visited:1},questClaims:[],createdAt:now,lastAt:now,lastSaved:now,energyUpdatedAt:now,sound:true},defaults(now));
 ['16,10','17,10'].forEach(key=>state.plots[key]=Object.assign(blankPlot(),{crop:'radish',plantedAt:now-CROPS.radish.growMs,growthMs:CROPS.radish.growMs,durationMs:CROPS.radish.growMs,gift:true}));
 // A living starter garden: actual growing plants, never painted into the backdrop.
 for(const [tx,ty,crop,progress] of [[18,10,'potato',.6],[19,10,'potato',.35],[16,11,'radish',.4],[17,11,'radish',.2],[18,11,'strawberry',.55],[19,11,'strawberry',.25]]){state.plots[tx+','+ty]=Object.assign(blankPlot(),{crop,gift:true,plantedAt:now-CROPS[crop].growMs*progress,growthMs:CROPS[crop].growMs*progress,durationMs:CROPS[crop].growMs,growAt:now,wetUntil:now+WET_MS});}
 // A compact six-by-four starter kitchen garden; all beds are real crops.
 for(let ty=10;ty<=13;ty++)for(let tx=16;tx<=21;tx++){
  const key=tx+','+ty;if(state.plots[key])continue;
  const crop=tx>=20?'wheat':ty===13?'radish':null,progress=tx>=20?.45+(ty-10)*.15:ty===13?.18+(tx-16)*.1:0;
  state.plots[key]=crop?Object.assign(blankPlot(),{crop,gift:true,plantedAt:now-CROPS[crop].growMs*progress,growthMs:CROPS[crop].growMs*progress,durationMs:CROPS[crop].growMs,growAt:now,wetUntil:now+WET_MS}):blankPlot();
 }

 ensureLivestock(state,null,now);
 return state;
}
// The original farmhouse grounds include one real coop and one barn. Additional
// player-built structures remain distinct and contribute extra capacity.
function ensureLivestock(s,source,now){
 now=nowTime(now);const raw=source||{},placed={};for(const d of s.decorations||[])placed[d.item]=(placed[d.item]||0)+1;
 s.baseStructures={coop:1,barn:1};s.legacyStructures={};
 if(raw.legacyStructures&&typeof raw.legacyStructures==='object')for(const [id,n]of Object.entries(raw.legacyStructures))if(ITEMS[id]?.placeable&&int(n,0)>0)s.legacyStructures[id]=int(n,0,0,500);
 // Old saves without the base-structure marker may contain built facilities
 // that predate explicit placement records. Keep them instead of deleting them.
 if(!raw.baseStructures)for(const [id,n]of Object.entries(raw.built||{}))if(ITEMS[id]?.placeable){const extra=Math.max(0,int(n,0,0,500)-(placed[id]||0));if(extra)s.legacyStructures[id]=Math.max(s.legacyStructures[id]||0,extra);}
 s.built={...s.baseStructures};for(const table of [placed,s.legacyStructures])for(const [id,n]of Object.entries(table))s.built[id]=(s.built[id]||0)+n;
 const already=raw.livestockWelcomeClaimed===true||(s.animals||[]).some(a=>/^welcome-chicken-/.test(a.id));
 s.livestockWelcomeClaimed=true;
 if(!already){
  const capacity=(s.built.coop||1)*6,used=s.animals.filter(a=>ANIMALS[a.type]?.building==='coop').length,n=Math.min(2,Math.max(0,capacity-used));
  for(let i=0;i<n;i++)s.animals.push({id:'welcome-chicken-'+(i+1),type:'chicken',name:i?'团子':'米粒',readyAt:0,friendship:12,fedAt:0,lastPetAt:0,lastPetDay:0,welcome:true});
  s.inventory.feed=Math.min(MAX_STACK,(s.inventory.feed||0)+6);s.livestockWelcomeGift={animals:n,feed:6};
 }
 return s;
}
function skillLevel(s,id){return Math.min(10,Math.floor(Math.sqrt((s.skills?.[id]||0)/35)));}
function xp(s,id,n){s.skills[id]=(s.skills[id]||0)+n;}
function cropDuration(p){return p&&CROPS[p.crop]?num(p.durationMs,CROPS[p.crop].growMs,1,48*3600000):0;}
function grownMs(p,now){if(!p||!CROPS[p.crop])return 0;now=nowTime(now);return Math.min(cropDuration(p),num(p.growthMs,0)+(Number.isFinite(p.growAt)?Math.max(0,Math.min(now,num(p.wetUntil,p.growAt))-p.growAt):0));}
function plotProgress(p,now){const d=cropDuration(p);return d?Math.min(1,grownMs(p,now)/d):0;}
function plotRemaining(p,now){return Math.max(0,cropDuration(p)-grownMs(p,now));}
function plotIsWet(p,now){return !!p&&num(p.wetUntil,0)>nowTime(now);}
function wetPlot(p,now){p.growthMs=grownMs(p,now);p.growAt=p.crop?now:null;p.wateredAt=now;p.wetUntil=now+WET_MS;}
function weatherForDay(day){return day%7===5?'storm':day%4===0?'rain':day%5===3?'cloudy':'sunny';}
function calendar(s,now){now=nowTime(now);const elapsed=Math.max(0,now-num(s.calendarStartAt,s.createdAt||now));const day=int(s.dayBase,1,1)+Math.floor(elapsed/DAY_MS),phase=(elapsed%DAY_MS)/DAY_MS,minutes=Math.floor(6*60+phase*18*60),hour=Math.floor(minutes/60),minute=minutes%60,season=Math.floor((day-1)/7)%4;let weather=weatherForDay(day);if(season===3&&(weather==='rain'||weather==='storm'))weather='snow';return{day,season,seasonName:SEASONS[season],dayOfSeason:(day-1)%7+1,year:Math.floor((day-1)/28)+1,hour,minute,clock:String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0'),weather,weatherName:{sunny:'晴',cloudy:'多云',rain:'小雨',storm:'雷雨',snow:'雪'}[weather],night:hour>=19,phase};}
function tickEnergy(s,now){now=nowTime(now);const old=num(s.energyUpdatedAt,num(s.lastAt,now),0,now),n=Math.floor((now-old)/30000);s.energy=num(s.energy,100,0,100);if(n>0){s.energy=Math.min(100,s.energy+n);s.energyUpdatedAt=s.energy===100?now:old+n*30000;}else if(s.energyUpdatedAt==null||s.energyUpdatedAt>now)s.energyUpdatedAt=now;return s.energy;}
function spendEnergy(s,amount,now){tickEnergy(s,now);if(s.energy<amount)return false;if(s.energy>=100)s.energyUpdatedAt=nowTime(now);s.energy-=amount;return true;}
function add(s,id,count){if(!has(id)||!validCount(count))return fail('物品或数量不正确。');const n=int(s.inventory[id],0);if(n+count>MAX_STACK)return fail('这一种物品已经装满了。');s.inventory[id]=n+count;const base=ITEMS[id].crop&&!id.endsWith('-seed')?ITEMS[id].crop:id;if((ITEMS[id].category==='crop'||ITEMS[id].category==='fish'||['gem','shell','copper','iron','gold'].includes(id))&&!s.discoveries.includes(base))s.discoveries.push(base);return ok('获得 '+ITEMS[id].name+' ×'+count,{item:id,amount:count});}
function remove(container,id,count){container[id]-=count;if(container[id]<=0)delete container[id];}
function affordable(s,cost,coins=0,mult=1){if(s.money<coins*mult)return false;return Object.entries(cost||{}).every(([id,n])=>(s.inventory[id]||0)>=n*mult);}
function costText(cost,coins=0){return Object.entries(cost||{}).map(([id,n])=>(ITEMS[id]?.name||id)+' ×'+n).concat(coins?[coins+' 金币']:[]).join('、');}
function pay(s,cost,coins=0,mult=1){Object.entries(cost||{}).forEach(([id,n])=>remove(s.inventory,id,n*mult));s.money-=coins*mult;}
function harvest(s,tx,ty,now){
 now=nowTime(now);if(!farmTile(tx,ty))return fail('这里不能收获。');const p=s.plots[tx+','+ty];if(!p?.crop)return fail('这里还没有作物。');if(plotProgress(p,now)<1)return fail('作物还在生长。');const id=p.crop,c=CROPS[id],gift=!!p.gift;
 const quality=gift?'normal':p.quality||'normal',itemId=quality==='normal'?id:id+'-'+quality;
 const r=add(s,itemId,1);if(!r.ok)return r;if(!gift){s.stats.harvested++;xp(s,'farming',12);}
 if(c.regrowMs){p.growthMs=0;p.durationMs=c.regrowMs;p.growAt=plotIsWet(p,now)?now:null;p.plantedAt=now;p.gift=false;p.waterCounted=false;}else{p.crop=null;p.plantedAt=null;p.growAt=null;p.growthMs=0;p.durationMs=0;p.gift=false;p.waterCounted=false;p.fertilized=false;}
 if(!c.regrowMs)restoreRelocatedPlot(s,tx+','+ty);
 return ok((gift?'收下邻居送来的':'收获 ')+ITEMS[itemId].name+' ×1'+(c.regrowMs?' · 植株会继续结果':''),{effect:'harvest',item:itemId,crop:id,amount:1,gift,quality});
}
function action(s,tool,tx,ty,now){
 now=nowTime(now);if(s.scene!=='farm')return fail('回到农场的田地上使用农具吧。');if(!farmTile(tx,ty))return fail('在农场的田地区域里播种吧。');const key=tx+','+ty;let p=s.plots[key];if(p?.crop&&plotProgress(p,now)>=1)return harvest(s,tx,ty,now);
 if(tool==='hoe'){if(p?.tilled)return fail(p.crop?'这里已经种下作物了。':'这块地已经翻好了。');if(!spendEnergy(s,Math.max(.5,2-(s.tools.hoe||0)*.4),now))return fail('体力不足，吃点食物或回小屋休息吧。');s.plots[key]=blankPlot();s.stats.tilled++;xp(s,'farming',2);return ok('土地翻好了，选一包种子播种吧。',{effect:'dirt'});}
 if(tool==='water'){
  if(!p?.tilled)return fail('先用锄头翻土。');if(plotIsWet(p,now)&&p.wetUntil-now>WET_MS/2)return fail('土壤还很湿润。');if(!spendEnergy(s,Math.max(.4,1-(s.tools.water||0)*.2),now))return fail('体力不足，吃点食物或回小屋休息吧。');
  const radius=s.tools.water>=2?1:0;for(let x=tx-radius;x<=tx+radius;x++)for(let y=ty-radius;y<=ty+radius;y++){const q=s.plots[x+','+y];if(!q)continue;wetPlot(q,now);if(q.crop&&!q.waterCounted&&!q.gift){s.stats.watered++;q.waterCounted=true;}}return ok('浇好水了！离线时作物也会生长。',{effect:'water',crop:p.crop});
 }
 if(tool==='fertilizer'){if(!p?.tilled||p.crop)return fail('肥料要用在已经翻好的空田上。');if(p.fertilized)return fail('这块田已经施过肥。');if(!(s.inventory.fertilizer>0))return fail('没有有机肥料了。');remove(s.inventory,'fertilizer',1);p.fertilized=true;return ok('土壤更肥沃了，下一株作物会更有精神。',{effect:'plant'});}
 if(typeof tool==='string'&&tool.endsWith('-seed')){
  const id=tool.slice(0,-5),c=CROPS[id];if(!c)return fail('没有这种种子。');if(!p?.tilled)return fail('先翻土，再播种。');if(p.crop)return fail('这里已经有作物了。');if(!(s.inventory[tool]>0))return fail(c.name+'种子用完了，去种子铺补货吧。');if(!spendEnergy(s,1,now))return fail('体力不足，先歇一歇吧。');remove(s.inventory,tool,1);
  const suited=c.seasons.includes(calendar(s,now).season)||s.projects.greenhouse,level=skillLevel(s,'farming'),roll=Math.random(),bonus=(p.fertilized?.2:0)+level*.018+(s.projects.greenhouse?.05:0);
  p.quality=roll<bonus*.08?'rainbow':roll<bonus*.38?'gold':roll<bonus+.06?'silver':'normal';Object.assign(p,{crop:id,plantedAt:now,growthMs:0,durationMs:Math.round(c.growMs*(suited?1:1.25)),growAt:plotIsWet(p,now)?now:null,gift:false,waterCounted:plotIsWet(p,now)});s.stats.planted++;xp(s,'farming',2);if(p.waterCounted)s.stats.watered++;
  return ok('种下了'+c.name+(p.growAt!==null?'，湿润的土地会照顾它。':'，记得浇水哦。')+(!suited?' 非应季生长慢 25%。':''),{effect:'plant',item:tool,crop:id,amount:1});
 }
 if(p?.crop)return fail(!plotIsWet(p,now)?'这株'+CROPS[p.crop].name+'口渴了。':CROPS[p.crop].name+'还有 '+Math.ceil(plotRemaining(p,now)/60000)+' 分钟成熟。');return fail(p?'选择种子，在这里播种。':'选择锄头，开始开垦。');
}
function buy(s,id,count=1){if(!has(id)||!ITEMS[id].buyPrice||!validCount(count))return fail('无法购买这个物品或数量。');const cost=ITEMS[id].buyPrice*count;if(s.money<cost)return fail('金币不足，需要 '+cost+' 金币。');const r=add(s,id,count);if(!r.ok)return r;s.money-=cost;return ok('买下 '+ITEMS[id].name+' ×'+count+' · −'+cost+' 金币',{item:id,amount:count,cost});}
function marketMultiplier(s,id,now){if(!ITEMS[id]||ITEMS[id].category!=='crop')return 1;const hash=Array.from(ITEMS[id].crop||id).reduce((v,c)=>v+c.charCodeAt(0),0);return 1+((calendar(s,now).day+hash)%5-2)*.05;}
function sellPrice(s,id,now){return has(id)?Math.round(ITEMS[id].sellPrice*marketMultiplier(s,id,now)):0;}
function sell(s,id,count=1){if(!has(id)||!validCount(count))return fail('出售的物品或数量不正确。');if(!(s.inventory[id]>=count))return fail('背包里没有这么多'+ITEMS[id].name+'。');const earned=sellPrice(s,id)*count;remove(s.inventory,id,count);s.money+=earned;s.stats.sold+=count;return ok('售出 '+ITEMS[id].name+' ×'+count+' · +'+earned+' 金币',{item:id,amount:count,earned,effect:'coin'});}
function transfer(s,id,count=1,toStorage){if(!has(id)||!validCount(count))return fail('存取的物品或数量不正确。');const from=toStorage?s.inventory:s.storage,to=toStorage?s.storage:s.inventory;if(!(from[id]>=count))return fail('没有这么多'+ITEMS[id].name+'。');if((to[id]||0)+count>MAX_STACK)return fail('这一种物品装满了。');remove(from,id,count);to[id]=(to[id]||0)+count;return ok((toStorage?'存入':'取出')+ITEMS[id].name+' ×'+count,{item:id,amount:count});}
function eat(s,now,itemId='berry'){if(typeof now==='string'){itemId=now;now=undefined;}tickEnergy(s,now);if(!ITEMS[itemId]?.energy)return fail('这个物品不能食用。');if(s.energy>=100)return fail('现在体力充沛，留着待会儿吃吧。');if(!(s.inventory[itemId]>0))return fail('背包里没有'+ITEMS[itemId].name+'。');const recovered=Math.min(100-s.energy,ITEMS[itemId].energy);remove(s.inventory,itemId,1);s.energy+=recovered;if(s.energy>=100)s.energyUpdatedAt=nowTime(now);return ok(ITEMS[itemId].name+' · 体力 +'+Math.round(recovered),{effect:'energy',amount:recovered});}
function rest(s,now){const amount=100-s.energy;s.energy=100;s.energyUpdatedAt=nowTime(now);return ok('在小屋歇了歇，体力恢复了。',{effect:'energy',amount});}
function catchFish(s,grade,now,rng){now=nowTime(now);const cal=calendar(s,now);let pool=Object.entries(FISH).filter(([id,f])=>f.scenes.includes(s.scene)&&(!f.project||s.projects[f.project])&&(!f.night||cal.night)&&(!f.weather||['rain','storm'].includes(cal.weather))&&(f.season==null||f.season===cal.season));if(!pool.length)pool=[['crucian',FISH.crucian]];const weight=f=>f.weight*(f.weight<=3?1+skillLevel(s,'fishing')*.08+(s.projects.lighthouse?.25:0):1);let r=(typeof rng==='function'?rng():Math.random())*pool.reduce((sum,[id,f])=>sum+weight(f),0),id=pool[pool.length-1][0];for(const [key,f] of pool){r-=weight(f);if(r<0){id=key;break;}}const added=add(s,id,1);if(!added.ok)return added;s.stats.fish++;xp(s,'fishing',16);const perfect=grade==='perfect'||typeof grade==='number'&&grade>=.9;return ok((perfect?'漂亮的收杆！':'钓到了！')+ITEMS[id].name+' ×1',{effect:'fish',item:id,amount:1,grade:perfect?'perfect':'good'});}
function questProgress(s,q){if(typeof q==='string')q=quests.find(x=>x.id===q);if(!q)return{current:0,target:1,complete:false,claimed:false,ratio:0};const value=s.stats[q.stat],current=Array.isArray(value)?value.length:int(value,0);return{current:Math.min(current,q.target),target:q.target,complete:current>=q.target,claimed:s.questClaims.includes(q.id),ratio:Math.min(1,current/q.target)};}
function claimQuest(s,id){const q=quests.find(x=>x.id===id);if(!q)return fail('没有找到这份委托。');const p=questProgress(s,q);if(p.claimed)return fail('这份奖励已经领取过了。');if(!p.complete)return fail('委托还没有完成。');s.questClaims.push(id);s.money+=q.rewardCoins;return ok('完成「'+q.title+'」 · +'+q.rewardCoins+' 金币',{effect:'coin',earned:q.rewardCoins,quest:id});}
function craft(s,id,count=1){const r=RECIPES[id];if(!r||!validCount(count)||count>99)return fail('配方或数量不正确。');if(r.skill&&skillLevel(s,r.skill)<r.level)return fail(SKILL_NAMES[r.skill]+'等级不足。');if(!affordable(s,r.cost,r.coins,count))return fail('需要 '+costText(r.cost,r.coins)+'。');if((s.inventory[r.output]||0)+r.amount*count>MAX_STACK)return fail('背包装不下了。');pay(s,r.cost,r.coins,count);add(s,r.output,r.amount*count);s.stats.crafted+=count;xp(s,'foraging',5*count);return ok('制作完成：'+r.name+' ×'+r.amount*count,{item:r.output,amount:r.amount*count,effect:'craft'});}
function place(s,itemId,tx,ty){if(!ITEMS[itemId]?.placeable)return fail('这个物品不能摆放。');if(s.scene!=='farm')return fail('回自己的农场摆放吧。');if(!Number.isInteger(tx)||!Number.isInteger(ty)||tx<2||ty<2||tx>93||ty>77)return fail('这个位置不适合摆放。');if(!(s.inventory[itemId]>0))return fail('背包里没有'+ITEMS[itemId].name+'。');if(s.decorations.some(d=>d.scene==='farm'&&d.tx===tx&&d.ty===ty)||s.plots[tx+','+ty]?.crop)return fail('这里已经有东西了。');remove(s.inventory,itemId,1);const d={id:'placed-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),item:itemId,scene:'farm',tx,ty};s.decorations.push(d);s.built[itemId]=(s.built[itemId]||0)+1;return ok('摆好了'+ITEMS[itemId].name+'。',{decoration:d,effect:'craft'});}
function removeDecoration(s,id){const index=s.decorations.findIndex(d=>d.id===id);if(index<0)return fail('没有找到这件家具。');const d=s.decorations[index];if(['coop','barn'].includes(d.item)&&s.animals.some(a=>ANIMALS[a.type].building===d.item))return fail('里面还住着动物，暂时不能收起。');if(s.jobs.some(j=>MACHINES[j.recipe]?.machine===d.item))return fail('设备仍在加工，先收取产品吧。');const r=add(s,d.item,1);if(!r.ok)return r;s.decorations.splice(index,1);s.built[d.item]=Math.max(0,(s.built[d.item]||0)-1);return ok('收起了'+ITEMS[d.item].name+'。');}
function startProcess(s,id,now){const r=MACHINES[id];if(!r)return fail('没有这个加工配方。');const capacity=s.built[r.machine]||0;if(!capacity)return fail('先制作并在农场放置'+ITEMS[r.machine].name+'。');if(s.jobs.filter(j=>MACHINES[j.recipe]?.machine===r.machine).length>=capacity)return fail('设备正忙，完成后先收取产品。');if(!affordable(s,r.input))return fail('需要 '+costText(r.input)+'。');pay(s,r.input);now=nowTime(now);const job={id:'job-'+now+'-'+Math.random().toString(36).slice(2,7),recipe:id,startedAt:now,readyAt:now+r.durationMs};s.jobs.push(job);return ok('开始'+r.name+'，'+Math.ceil(r.durationMs/1000)+' 秒后可以收取。',{job});}
function collectProcess(s,jobId,now){const index=s.jobs.findIndex(j=>j.id===jobId);if(index<0)return fail('没有这个加工任务。');const job=s.jobs[index],r=MACHINES[job.recipe];if(nowTime(now)<job.readyAt)return fail('还需要 '+Math.ceil((job.readyAt-nowTime(now))/1000)+' 秒。');const result=add(s,r.output,r.amount);if(!result.ok)return result;s.jobs.splice(index,1);s.stats.processed+=r.amount;return ok('收取 '+ITEMS[r.output].name+' ×'+r.amount,{item:r.output,amount:r.amount,effect:'harvest'});}
function buyAnimal(s,type){const a=ANIMALS[type];if(!a)return fail('没有这种动物。');const capacity=(s.built[a.building]||0)*(a.building==='coop'?6:4);if(!capacity)return fail('先制作并放置'+ITEMS[a.building].name+'。');if(s.animals.filter(n=>ANIMALS[n.type].building===a.building).length>=capacity)return fail('动物住处已满，需要扩建。');if(s.money<a.price)return fail('需要 '+a.price+' 金币。');s.money-=a.price;const animal={id:'animal-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),type,name:a.name,readyAt:0,friendship:0,fedAt:0,lastPetAt:0,lastPetDay:0};s.animals.push(animal);return ok(a.name+'搬进了农场！记得喂食。',{animal});}
function feedAnimal(s,id,now){const a=s.animals.find(x=>x.id===id);if(!a)return fail('没有找到这只动物。');if(a.readyAt)return fail(nowTime(now)>=a.readyAt?'先收取它准备好的产物吧。':'它吃得饱饱的，正在休息。');const feed=s.inventory.feed?'feed':s.inventory.wheat?'wheat':null;if(!feed)return fail('需要牧草饲料或小麦。');remove(s.inventory,feed,1);now=nowTime(now);a.fedAt=now;a.readyAt=now+ANIMALS[a.type].durationMs;a.friendship=Math.min(100,a.friendship+3);return ok('喂好了'+a.name+'，它开心地蹭了蹭你。',{animal:a});}
function collectAnimal(s,id,now){const a=s.animals.find(x=>x.id===id);if(!a)return fail('没有找到这只动物。');if(!a.readyAt)return fail('先喂食，它才有精神生产。');if(nowTime(now)<a.readyAt)return fail('它还在休息，再等 '+Math.ceil((a.readyAt-nowTime(now))/1000)+' 秒。');const itemId=ANIMALS[a.type].produce,amount=a.friendship>=60?2:1,r=add(s,itemId,amount);if(!r.ok)return r;a.readyAt=0;s.stats.animalProducts+=amount;xp(s,'farming',10);return ok('收取'+ITEMS[itemId].name+' ×'+amount+'，记得再次喂食。',{item:itemId,amount,effect:'harvest'});}
function petAnimal(s,id,now){const a=s.animals.find(x=>x.id===id);if(!a)return fail('它已经跑到另一边去了。');now=nowTime(now);a.lastPetAt=now;const day=calendar(s,now).day;if(a.lastPetDay===day)return ok(a.name+'认出了你的手，开心地靠了过来。',{animalId:id,effect:'heart',gained:0});a.lastPetDay=day;a.friendship=Math.min(100,a.friendship+5);xp(s,'farming',2);return ok('轻轻摸了摸'+a.name+' · 亲密度 +5',{animalId:id,effect:'heart',gained:5});}
function feedHerd(s,kind,now){if(!['coop','barn'].includes(kind))return fail('这里不是牲畜住处。');const herd=s.animals.filter(a=>ANIMALS[a.type]?.building===kind),hungry=herd.filter(a=>!a.readyAt);if(!herd.length)return fail('这里还没有动物。看看墙上的认养牌吧。');if(!hungry.length)return fail(herd.some(a=>a.readyAt<=nowTime(now))?'先收取已经准备好的产物，再来添饲料吧。':'它们吃得饱饱的，饲槽暂时不需要再添。');let fed=0;for(const a of hungry){const r=feedAnimal(s,a.id,now);if(!r.ok)break;fed++;}if(!fed)return fail('饲料用完了。背包里需要牧草饲料或小麦。');s.livestockTroughs=s.livestockTroughs||{};s.livestockTroughs[kind]=nowTime(now);return ok('把饲料撒进槽里，'+fed+' 只小伙伴围了过来。'+(fed<hungry.length?' 还有 '+(hungry.length-fed)+' 只在等饲料。':''),{kind,fed,effect:'feed'});}
function upgradeCost(s,id){if(!TOOL_NAMES[id])return null;const current=int(s.tools[id],0,0,3),level=current+1;return{name:['','铜制','铁制','金制'][Math.min(3,level)]+TOOL_NAMES[id],level,cost:current>=3?{}:{[['copperbar','ironbar','goldbar'][current]]:2+current},coins:current>=3?0:[150,400,900][current],maxed:current>=3};}
function upgradeTool(s,id){const cost=upgradeCost(s,id);if(!cost)return fail('没有这种工具。');if(cost.maxed)return fail('这件工具已经是最高等级。');if(!affordable(s,cost.cost,cost.coins))return fail('升级需要 '+costText(cost.cost,cost.coins)+'。');pay(s,cost.cost,cost.coins);s.tools[id]=cost.level;return ok(cost.name+'做好了！使用工具会更省力。',{tool:id,level:cost.level,effect:'craft'});}
function friend(s,id){return s.friendship[id]||(s.friendship[id]={points:0,lastTalkDay:0,lastGiftDay:0});}
function talk(s,id,now){const npc=NPCS[id];if(!npc)return fail('这位居民正在忙。');const f=friend(s,id),day=calendar(s,now).day;if(!s.stats.talked.includes(id))s.stats.talked.push(id);const fresh=f.lastTalkDay!==day;if(fresh){f.points=Math.min(1000,f.points+8);f.lastTalkDay=day;xp(s,'social',5);}const tier=Math.min(2,Math.floor(f.points/150));return ok(npc.lines[(day+tier)%npc.lines.length],{npc:id,friendship:f.points,gained:fresh?8:0,hearts:Math.min(5,Math.floor(f.points/100))});}
function gift(s,id,itemId,now){const npc=NPCS[id];if(!npc||!has(itemId))return fail('无法赠送。');if(!(s.inventory[itemId]>0))return fail('背包里没有这件礼物。');const f=friend(s,id),day=calendar(s,now).day;if(f.lastGiftDay===day)return fail('今天已经送过礼物了，明天再来吧。');const base=ITEMS[itemId].crop||itemId,liked=npc.likes.includes(base),points=liked?40:15;remove(s.inventory,itemId,1);f.points=Math.min(1000,f.points+points);f.lastGiftDay=day;xp(s,'social',10);return ok(npc.name+(liked?'很喜欢这份礼物！':'收下礼物，向你道了谢。')+' 好感 +'+points,{points,liked});}
function buildProject(s,id){const p=PROJECTS[id];if(!p)return fail('没有这个公共工程。');if(s.projects[id])return fail('这项工程已经完成。');if(!affordable(s,p.cost,p.coins))return fail('还需要 '+costText(p.cost,p.coins)+'。');pay(s,p.cost,p.coins);s.projects[id]=true;s.stats.projects=Object.values(s.projects).filter(Boolean).length;xp(s,'social',60);if(id==='dock')s.money+=200;return ok(p.name+'完成了！'+p.description,{project:id,effect:'coin'});}
function donate(s,itemId){if(!has(itemId)||!(s.inventory[itemId]>0))return fail('背包里没有这件藏品。');const base=ITEMS[itemId].crop&&!itemId.endsWith('-seed')?ITEMS[itemId].crop:itemId;if(!(CROPS[base]||FISH[base]||['gem','shell','copper','iron','gold','mushroom'].includes(base)))return fail('博物馆收藏农作物、鱼类和自然标本。');if(s.museum.includes(base))return fail('这件藏品已经收录了，留给自己吧。');remove(s.inventory,itemId,1);s.museum.push(base);s.stats.donated=s.museum.length;const reward=s.museum.length%5===0?150:20;s.money+=reward;xp(s,'social',8);return ok('捐赠了'+ITEMS[itemId].name+' · 收藏奖励 +'+reward+' 金币',{item:base,earned:reward,effect:'coin'});}
function visit(s,scene){if(!SCENES[scene])return fail('未知区域。');if(!s.visited.includes(scene)){s.visited.push(scene);s.stats.visited=s.visited.length;return ok('发现了新的地方。',{scene,newVisit:true});}return ok('又回到了熟悉的地方。',{scene,newVisit:false});}
function gather(s,objectId,resource,count=1,now){if(typeof objectId!=='string'||!objectId||!has(resource)||!validCount(count)||count>50)return fail('这里没有可采集的资源。');if(s.cleared.includes(objectId))return fail('这里已经收集过了。');const ore=['stone','copper','iron','gold','coal','gem'].includes(resource),required={iron:1,gold:2,gem:2}[resource]||0;if(ore&&(s.tools.pickaxe||0)<required)return fail('升级镐子后才能开采这种矿石。');const cost=ore?Math.max(1,3-(s.tools.pickaxe||0)*.6):resource==='wood'?Math.max(1,3-(s.tools.axe||0)*.6):1;if(s.energy<cost)return fail('体力不足，吃点食物再继续。');if((s.inventory[resource]||0)+count>MAX_STACK)return fail('背包装不下了。');spendEnergy(s,cost,now);add(s,resource,count);s.cleared.push(objectId);s.resourceRecords[objectId]={resource,day:calendar(s,now).day};s.stats[ore?'mined':'gathered']++;xp(s,ore?'mining':'foraging',ore?9:7);return ok('收集 '+ITEMS[resource].name+' ×'+count,{item:resource,amount:count,effect:ore?'stone':'wood'});}
function bomb(s,objects,tx,ty,now){if(!(s.inventory.bomb>0))return fail('背包里没有小炸弹。');if(!['mine','quarry','mountain'].includes(s.scene))return fail('炸弹只适合在矿洞、山地或采石场使用。');const targets=(Array.isArray(objects)?objects:[]).filter(o=>o.clearable&&!s.cleared.includes(o.id)&&['stone','copper','iron','gold','coal','gem'].includes(o.resource)&&Math.abs(o.x/24-tx-.5)<=2.5&&Math.abs(o.y/24-ty-.5)<=2.5);if(!targets.length)return fail('附近没有能炸开的矿石。');remove(s.inventory,'bomb',1);const cleared=[];for(const o of targets){add(s,o.resource,2);s.cleared.push(o.id);cleared.push(o.id);s.stats.mined++;xp(s,'mining',5);}return ok('轰！炸开了 '+cleared.length+' 处矿石。',{cleared,effect:'explosion'});}
function descendMine(s){if(s.mineFloor>=20)return fail('已经抵达矿洞最深处，蓝晶石就在这一层。');s.mineFloor++;s.stats.deepestMine=Math.max(s.stats.deepestMine,s.mineFloor);if(s.mineFloor%5===0)s.mineCheckpoint=s.mineFloor;return ok('来到矿洞第 '+s.mineFloor+' 层'+(s.mineFloor%5===0?' · 已解锁电梯检查点':''),{floor:s.mineFloor});}
function ascendMine(s){if(s.mineFloor<=1)return fail('已经在矿洞入口层。');s.mineFloor--;return ok('回到矿洞第 '+s.mineFloor+' 层',{floor:s.mineFloor});}
function tick(s,now){
 now=nowTime(now);tickEnergy(s,now);if(now-(s.lastSimAt||0)<1000)return;const cal=calendar(s,now),last=s.lastSimAt||now;
 // Offline rain is replayed at day boundaries, with bounded work even for a long absence.
 const first=calendar(s,last).day,days=[];for(let d=first;d<=Math.min(cal.day,first+64);d++)days.push(d);if(!days.includes(cal.day))days.push(cal.day);for(const d of days){const start=s.calendarStartAt+(d-s.dayBase)*DAY_MS;if(start>now||start+DAY_MS<last)continue;const season=Math.floor((d-1)/7)%4;if(season!==3&&['rain','storm'].includes(weatherForDay(d))){const wetAt=Math.max(start,last);for(const p of Object.values(s.plots))if(p.tilled&&p.wetUntil<wetAt+DAY_MS)wetPlot(p,Math.max(wetAt,p.plantedAt||0));}}
 for(const d of s.decorations)if(d.item==='sprinkler'){for(let x=d.tx-1;x<=d.tx+1;x++)for(let y=d.ty-1;y<=d.ty+1;y++){const p=s.plots[x+','+y];if(p&&p.wetUntil<now+DAY_MS)wetPlot(p,Math.max(last,p.growAt||last));}}
 // Wild foods replenish on a new day. Trees and mined rocks stay cleared.
 const regrown=[];for(const [id,r]of Object.entries(s.resourceRecords))if(r.day<cal.day&&['berry','mushroom','shell'].includes(r.resource)){regrown.push(id);delete s.resourceRecords[id];}if(regrown.length){const ids=new Set(regrown);s.cleared=s.cleared.filter(id=>!ids.has(id));}s.lastSimAt=now;
}
function sleep(s,now){now=nowTime(now);tick(s,now);const cal=calendar(s,now),skip=Math.max(0,DAY_MS*(1-cal.phase));for(const p of Object.values(s.plots)){const wet=plotIsWet(p,now);p.growthMs=Math.min(cropDuration(p),grownMs(p,now)+(wet?Math.min(skip,p.wetUntil-now):0));p.growAt=p.crop&&wet?now:null;}for(const j of s.jobs)j.readyAt=Math.max(now,j.readyAt-skip);for(const a of s.animals)if(a.readyAt)a.readyAt=Math.max(now,a.readyAt-skip);s.dayBase=cal.day+1;s.calendarStartAt=now;s.lastSimAt=now-1001;rest(s,now);tick(s,now);return ok('睡了一个好觉。'+calendar(s,now).seasonName+'季第 '+calendar(s,now).dayOfSeason+' 日，新的海风来了。',{effect:'energy',day:cal.day+1});}
function cleanInventory(raw){const out={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;for(const id of Object.keys(ITEMS)){const n=int(raw[id],0,0,MAX_STACK);if(n>0)out[id]=n;}return out;}
function sanitize(raw,now){
 now=nowTime(now);if(!raw||typeof raw!=='object'||Array.isArray(raw)||![1,VERSION].includes(raw.version))return null;raw=migrateFarmLayout(raw);const base=newGame(),statKeys=Object.keys(base.stats),s=Object.assign(base,raw);s.version=VERSION;s.name=typeof raw.name==='string'&&raw.name.trim()?raw.name.trim().slice(0,18):'旅行者';s.color=typeof raw.color==='string'&&/^#[0-9a-f]{6}$/i.test(raw.color)?raw.color:'#688b9a';s.money=int(raw.money,200,0,1e9);s.energy=num(raw.energy,100,0,100);s.scene=SCENES[raw.scene]?raw.scene:'farm';const p=raw.player&&typeof raw.player==='object'?raw.player:{},dim=SCENES[s.scene];s.player={x:num(p.x,14.5*24,7,dim[0]*24-7),y:num(p.y,14.5*24,8,dim[1]*24-6),dir:['up','down','left','right'].includes(p.dir)?p.dir:'right'};s.inventory=raw.inventory?cleanInventory(raw.inventory):base.inventory;s.storage=cleanInventory(raw.storage);s.plots={};
 if(raw.plots&&typeof raw.plots==='object')for(const [key,p]of Object.entries(raw.plots)){if(!/^\d+,\d+$/.test(key))continue;const [x,y]=key.split(',').map(Number);if(!farmTile(x,y)||!p||typeof p!=='object'||!p.tilled)continue;const crop=CROPS[p.crop]?p.crop:null;s.plots[key]=Object.assign(blankPlot(),{crop,plantedAt:p.plantedAt==null?null:num(p.plantedAt,now,0,now),growAt:p.growAt==null?null:num(p.growAt,now,0,now),wateredAt:p.wateredAt==null?null:num(p.wateredAt,now,0,now),wetUntil:num(p.wetUntil,0,0,now+WET_MS),growthMs:num(p.growthMs,0,0,48*3600000),durationMs:crop?num(p.durationMs,CROPS[crop].growMs,1,48*3600000):0,gift:!!p.gift,waterCounted:!!p.waterCounted,quality:['normal','silver','gold','rainbow'].includes(p.quality)?p.quality:'normal',fertilized:!!p.fertilized});}
 const stats=raw.stats&&typeof raw.stats==='object'?raw.stats:{};s.stats={};for(const key of statKeys)s.stats[key]=key==='talked'?Array.isArray(stats.talked)?[...new Set(stats.talked.filter(x=>NPCS[x]))]:[]:int(stats[key],0,0,1e8);s.cleared=Array.isArray(raw.cleared)?[...new Set(raw.cleared.filter(x=>typeof x==='string'))].slice(0,100000):[];s.questClaims=Array.isArray(raw.questClaims)?quests.filter(q=>raw.questClaims.includes(q.id)).map(q=>q.id):[];
 s.createdAt=num(raw.createdAt,now,0,now);s.lastAt=num(raw.lastAt,now,0,now);s.lastSaved=num(raw.lastSaved,s.lastAt,0,now);s.energyUpdatedAt=num(raw.energyUpdatedAt,s.lastAt,0,now);s.sound=raw.sound!==false;s.theme=raw.theme==='candy'?'candy':'clay';s.skills={};s.tools={};for(const id of Object.keys(SKILL_NAMES))s.skills[id]=int(raw.skills?.[id],0,0,1e7);for(const id of Object.keys(TOOL_NAMES))s.tools[id]=int(raw.tools?.[id],0,0,3);s.friendship={};for(const id of Object.keys(NPCS)){const f=raw.friendship?.[id]||{};s.friendship[id]={points:int(f.points,0,0,1000),lastTalkDay:int(f.lastTalkDay,0),lastGiftDay:int(f.lastGiftDay,0)};}
 s.dayBase=int(raw.dayBase,1,1,1e7);s.calendarStartAt=num(raw.calendarStartAt,now,0,now);s.lastSimAt=num(raw.lastSimAt,s.lastAt,0,now);s.lastRainDay=int(raw.lastRainDay,0);s.mineFloor=int(raw.mineFloor,1,1,20);s.mineCheckpoint=int(raw.mineCheckpoint,1,1,20);s.stats.deepestMine=Math.max(s.stats.deepestMine,s.mineFloor);
 s.decorations=Array.isArray(raw.decorations)?raw.decorations.filter(d=>d&&typeof d.id==='string'&&ITEMS[d.item]?.placeable&&d.scene==='farm'&&Number.isInteger(d.tx)&&Number.isInteger(d.ty)&&d.tx>=2&&d.tx<=93&&d.ty>=2&&d.ty<=77).slice(0,500).map(d=>({id:d.id,item:d.item,scene:'farm',tx:d.tx,ty:d.ty})):[];s.built={};s.decorations.forEach(d=>s.built[d.item]=(s.built[d.item]||0)+1);
 s.jobs=Array.isArray(raw.jobs)?raw.jobs.filter(j=>j&&typeof j.id==='string'&&MACHINES[j.recipe]&&Number.isFinite(j.readyAt)).slice(0,100).map(j=>({id:j.id,recipe:j.recipe,startedAt:num(j.startedAt,now,0,now),readyAt:num(j.readyAt,now,0,now+3600000)})):[];
 s.animals=Array.isArray(raw.animals)?raw.animals.filter(a=>a&&typeof a.id==='string'&&ANIMALS[a.type]).slice(0,100).map(a=>({id:a.id,type:a.type,name:typeof a.name==='string'?a.name.slice(0,18):ANIMALS[a.type].name,readyAt:num(a.readyAt,0,0,now+3600000),fedAt:num(a.fedAt,0,0,now),friendship:int(a.friendship,0,0,100),lastPetAt:num(a.lastPetAt,0,0,now),lastPetDay:int(a.lastPetDay,0),welcome:!!a.welcome})):[];
 s.projects={};for(const id of Object.keys(PROJECTS))if(raw.projects?.[id])s.projects[id]=true;s.stats.projects=Object.keys(s.projects).length;s.museum=Array.isArray(raw.museum)?[...new Set(raw.museum.filter(id=>has(id)))]:[];s.stats.donated=s.museum.length;s.discoveries=Array.isArray(raw.discoveries)?[...new Set(raw.discoveries.filter(id=>has(id)))]:[];s.visited=Array.isArray(raw.visited)?[...new Set(raw.visited.filter(id=>SCENES[id]))]:['farm'];if(!s.visited.includes(s.scene))s.visited.push(s.scene);s.stats.visited=s.visited.length;if(raw.version===1){s.scene='farm';s.player={x:14.5*24,y:14.5*24,dir:'right'};s.migratedFrom=1;}s.resourceRecords={};if(raw.resourceRecords&&typeof raw.resourceRecords==='object')for(const [id,r]of Object.entries(raw.resourceRecords))if(s.cleared.includes(id)&&r&&has(r.resource))s.resourceRecords[id]={resource:r.resource,day:int(r.day,1,1)};ensureLivestock(s,raw,now);s.gates={};if(raw.gates&&typeof raw.gates==='object')for(const[id,open]of Object.entries(raw.gates))if(typeof open==='boolean')s.gates[id]=open;s.livestockTroughs={};for(const kind of ['coop','barn'])s.livestockTroughs[kind]=num(raw.livestockTroughs?.[kind],0,0,now);tick(s,now);return s;
}
function load(){try{if(!root.localStorage)return null;const text=root.localStorage.getItem(STORAGE_KEY);return text?sanitize(JSON.parse(text),Date.now()):null;}catch(_){return null;}}
function save(s){try{if(!root.localStorage)return false;const now=Date.now();tick(s,now);s.lastAt=now;s.lastSaved=now;root.localStorage.setItem(STORAGE_KEY,JSON.stringify(s));return true;}catch(_){return false;}}
for(const table of [CROPS,ITEMS,FISH,RECIPES,MACHINES,ANIMALS,NPCS,PROJECTS]){Object.values(table).forEach(Object.freeze);Object.freeze(table);}
const Core=Object.freeze({VERSION,STORAGE_KEY,WET_MS,DAY_MS,CROPS,ITEMS,FISH,RECIPES,MACHINES,ANIMALS,NPCS,PROJECTS,SKILL_NAMES,TOOL_NAMES,quests,newGame,load,save,sanitize,plotProgress,plotRemaining,plotIsWet,farmTile,migrateFarmLayout,action,harvest,add,buy,sell,transfer,eat,rest,catchFish,tickEnergy,spendEnergy,questProgress,claimQuest,calendar,tick,sleep,skillLevel,craft,place,removeDecoration,startProcess,collectProcess,buyAnimal,feedAnimal,collectAnimal,feedHerd,petAnimal,ensureLivestock,upgradeCost,upgradeTool,talk,gift,buildProject,donate,visit,gather,bomb,descendMine,ascendMine,marketMultiplier,sellPrice,costText});
root.Core=Core;if(typeof module!=='undefined'&&module.exports)module.exports=Core;
})(typeof window!=='undefined'?window:globalThis);
