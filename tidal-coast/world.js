/* Tide Town — a connected handcrafted coast. Logical coordinates: 24 units/tile. */
(function (global) {
  'use strict';
  const T=24, CHUNK=384, RES=2, MAX_CACHE=28;
  const hash=(x,y,s=0)=>{let n=(x*374761393+y*668265263+s*1442695041)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  const palettes={
    farm:{grass:'#8faa50',light:'#b9cc78',dark:'#6e8b3e',path:'#d5b48a',sand:'#e4cda2',water:'#60a9a7',deep:'#317f91'},
    town:{grass:'#98ae58',light:'#c2ce87',dark:'#778c45',path:'#d4bd9b',sand:'#dfcba5',water:'#64ada8',deep:'#398793'},
    forest:{grass:'#6d8d48',light:'#a4ba70',dark:'#4c713c',path:'#b8a078',sand:'#d2c49a',water:'#6ba398',deep:'#3d7d80'},
    beach:{grass:'#a3b168',light:'#c2cb8b',dark:'#788c4a',path:'#d5bd91',sand:'#e8d3a8',water:'#70b6b1',deep:'#398c9c'},
    mountain:{grass:'#879c65',light:'#b4bf84',dark:'#667950',path:'#b9b097',sand:'#cec2a6',water:'#7cb0b0',deep:'#4d8193'},
    lake:{grass:'#91a65e',light:'#c2cd8a',dark:'#6c884e',path:'#cfb48c',sand:'#dfc99c',water:'#6faba0',deep:'#3c8588'},
    quarry:{grass:'#a5a18a',light:'#c8c3a7',dark:'#827d6b',path:'#c1b69b',sand:'#d6c9a7',water:'#76a5a6',deep:'#547f86'},
    ruins:{grass:'#779677',light:'#a9bf94',dark:'#537866',path:'#b2b89b',sand:'#c6c9ac',water:'#699e95',deep:'#3c7776'},
    mine:{grass:'#555866',light:'#848695',dark:'#353b49',path:'#7c776e',sand:'#9d927a',water:'#4b7f8d',deep:'#34515e'},
    home:{grass:'#a8815b',light:'#cfaa7a',dark:'#76583f',path:'#cfab7d',sand:'#d7bc91',water:'#60aaa2',deep:'#3b808c'},
    coop:{grass:'#b59865',light:'#e5ca8f',dark:'#826741',path:'#c7a774',sand:'#dfc491',water:'#7fa9ad',deep:'#507d88'},
    barn:{grass:'#a38660',light:'#d2b781',dark:'#765c40',path:'#b69b6f',sand:'#ddc28b',water:'#7fa9ad',deep:'#507d88'}
  };
  const specs=[
    ['farm','潮汐农场',96,80,14.5,14.5,1,0,'海风吹过家门前的菜园。东行入镇，向南通往森林。'],
    ['town','海风小镇',128,128,4,44.5,2,0,'街道、喷泉、六位邻居。种子铺、铁匠、博物馆和公共工程都在这里。'],
    ['forest','苔风森林',96,96,47,5,1,1,'溪流与古树之间藏着野莓、蘑菇、林间工坊与通向旧遗迹的小径。'],
    ['beach','银沙海岸',112,72,56,5,2,1,'拾贝、海钓、修复远洋码头。沿海岸向东，旧灯塔守着海湾。'],
    ['mountain','北岭山道',96,80,48,75,2,-1,'针叶林、山泉与矿洞。顺着东侧矿车轨道能到露天采石场。'],
    ['lake','镜湾湖',80,80,4,40,3,0,'静水、芦苇与湖心栈桥。这里的鱼群和海岸不同。'],
    ['quarry','风化采石场',64,64,4,32,3,-1,'露天矿脉和加工台。镐子敲落的矿石，能变成更好的工具。'],
    ['ruins','旧潮遗迹',80,80,75,40,0,1,'被藤蔓和潮水收回的旧庭院，等着收藏者再次发现。'],
    ['mine','回声矿洞',48,48,24,42,2,-2,'二十层地下矿脉。带好食物，梯子在每一层的另一头。'],
    ['home','海风小屋',24,20,12,15,0,0,'热茶、木床、衣柜与收藏柜。疲倦时，家总在这里。'],
    ['coop','农场鸡舍',24,20,12,17,0,1,'推门走进温暖的鸡舍，添饲料、照顾小鸡并收取新鲜鸡蛋。'],
    ['barn','农场牛棚',24,20,12,17,0,2,'草垛、饲槽与安静的牲畜。靠近奶牛和绵羊照顾它们。']
  ];
  const maps={}, grids={}, scenes={}, chunks=new Map(), buckets={};let activeMineFloor=1;
  let visual={season:0,theme:'clay',weather:'sunny',night:false,hour:9};
  function syncVisual(state){let cal={};try{if(global.Core?.calendar)cal=global.Core.calendar(state);}catch(_){}visual={season:cal.season||0,theme:state?.theme||'clay',weather:cal.weather||'sunny',night:!!cal.night,hour:cal.hour||9};}
  function paletteFor(id){const p={...palettes[id]};if(['mine','home','coop','barn'].includes(id))return p;
    if(visual.season===1){p.grass=id==='forest'?'#6b873c':'#92a74b';p.light='#c1ca75';p.dark='#6d853a';}
    if(visual.season===2){p.grass=id==='forest'?'#999057':'#b1a36a';p.light='#ddc28a';p.dark='#89784c';p.path='#cfac84';}
    if(visual.season===3){p.grass='#d9e1d1';p.light='#f5f3e6';p.dark='#a4b5a4';p.path='#c6c3b4';p.sand='#dedcc5';p.water='#79a2ad';p.deep='#527f94';}
    if(visual.theme==='candy'){p.grass='#b8c8b0';p.light='#e3e0c4';p.dark='#95ad9d';p.path='#dfb4a8';p.sand='#f0d9bb';p.water='#a7bdd1';p.deep='#758fac';}return p;}

  for(const[id,name,w,h,sx,sy,mx,my,description]of specs){maps[id]={id,name,w,h,spawn:{x:sx*T,y:sy*T},mapPosition:{x:mx,y:my},description,objects:[],npcs:[],portals:[],landmarks:[]};grids[id]=Array.from({length:h},()=>Array(w).fill('grass'));scenes[id]={shapes:[],roads:[],gardens:[],waterBounds:[]};}
  const fill=(id,x,y,w,h,type)=>{const m=maps[id],g=grids[id];for(let yy=Math.max(0,Math.floor(y));yy<Math.min(m.h,Math.ceil(y+h));yy++)for(let xx=Math.max(0,Math.floor(x));xx<Math.min(m.w,Math.ceil(x+w));xx++)g[yy][xx]=type;};
  function polygon(id,points,type){const px=points.map(p=>[p[0]*T,p[1]*T]);scenes[id].shapes.push({type,kind:'polygon',points:px});const m=maps[id];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){let yes=false;for(let a=0,b=points.length-1;a<points.length;b=a++){const A=points[a],B=points[b];if(((A[1]>y+.5)!==(B[1]>y+.5))&&(x+.5<(B[0]-A[0])*(y+.5-A[1])/(B[1]-A[1])+A[0]))yes=!yes;}if(yes)grids[id][y][x]=type;}}
  function ellipse(id,x,y,rx,ry,type){scenes[id].shapes.push({type,kind:'ellipse',x:x*T,y:y*T,rx:rx*T,ry:ry*T});const m=maps[id];for(let yy=Math.max(0,Math.floor(y-ry));yy<Math.min(m.h,y+ry);yy++)for(let xx=Math.max(0,Math.floor(x-rx));xx<Math.min(m.w,x+rx);xx++)if(((xx+.5-x)/rx)**2+((yy+.5-y)/ry)**2<1)grids[id][yy][xx]=type;}
  function rect(id,x,y,w,h,type){scenes[id].shapes.push({type,kind:'rect',x:x*T,y:y*T,w:w*T,h:h*T});fill(id,x,y,w,h,type);}
  function road(id,points,width=3,type='path'){scenes[id].roads.push({points:points.map(p=>[p[0]*T,p[1]*T]),width:width*T,type});for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<=Math.ceil(d*2);j++){const f=j/Math.max(1,Math.ceil(d*2)),x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f;fill(id,x-width/2,y-width/2,width,width,type);}}}
  const solid=(x,y,w=18,h=13)=>({x:x-w/2,y:y-h,w,h});
  function add(id,name,tx,ty,extra={}){const o={id:id+'-'+name+'-'+maps[id].objects.length,name,x:tx*T,y:ty*T,...extra};if(name==='fence'&&!o.solid)o.solid=o.orientation==='vertical'?{x:o.x-3,y:o.y-T/2,w:6,h:T}:{x:o.x-T/2,y:o.y-4,w:T,h:6};maps[id].objects.push(o);if(o.interact||o.label)maps[id].landmarks.push(o);return o;}
  function curvedRoad(id,points,width=1.6,type='path'){const out=[];for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];for(let j=0;j<10;j++){const t=j/10,t2=t*t,t3=t2*t;out.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3)));}}out.push(points[points.length-1]);road(id,out,width,type);}
  function pen(id,x0,y0,x1,y1,door){
    const base=door.side==='east'||door.side==='west'?y0:x0;door={...door,at:base+Math.round(door.at-base)};
    for(const y of [y0,y1])for(let x=x0+.5;x<x1;x+=1){if((door.side==='north'&&y===y0||door.side==='south'&&y===y1)&&Math.abs(x-door.at)<1.01)continue;add(id,'fence',x,y,{orientation:'horizontal'});}
    for(const x of [x0,x1])for(let y=y0+.5;y<y1;y+=1){if((door.side==='west'&&x===x0||door.side==='east'&&x===x1)&&Math.abs(y-door.at)<1.01)continue;add(id,'fence',x,y,{orientation:'vertical'});}
    const vertical=door.side==='east'||door.side==='west',x=vertical?(door.side==='east'?x1:x0):door.at,y=vertical?door.at:(door.side==='north'?y0:y1);
    const o=add(id,'gate',x,y,{id:door.gateId,gateId:door.gateId,interact:'gate',orientation:vertical?'vertical':'horizontal',label:door.label,defaultOpen:true,solid:vertical?{x:x*T-3,y:y*T-24,w:6,h:48}:{x:x*T-24,y:y*T-4,w:48,h:6}});return o;
  }
  function gateIsOpen(state,object){const o=typeof object==='string'?Object.values(maps).flatMap(m=>m.objects).find(o=>o.gateId===object):object;if(!o)return false;return typeof state?.gates?.[o.gateId]==='boolean'?state.gates[o.gateId]:!!o.defaultOpen;}
  function toggleGate(state,id){id=typeof id==='object'?id.gateId||id.id:id;const o=Object.values(maps).flatMap(m=>m.objects).find(o=>o.gateId===id);if(!o)return{ok:false,message:'没有找到这扇门。'};const r=o.solid,p=state.player;if(gateIsOpen(state,o)&&p&&state.scene==='farm'&&p.x>r.x-5&&p.x<r.x+r.w+5&&p.y>r.y-4&&p.y<r.y+r.h+4)return{ok:false,message:'先走出门口，再把门关上吧。'};state.gates=state.gates&&typeof state.gates==='object'?state.gates:{};state.gates[id]=!gateIsOpen(state,o);return{ok:true,open:state.gates[id],message:state.gates[id]?'推开了牧栏门。':'关好了牧栏门。'};}
  function building(id,name,x,y,w,h,interact,label,extra={}){const o=add(id,name,x,y,{solid:{x:x*T-w/2,y:y*T-h,w,h:h-9},interact,label,...extra});road(id,[[x,y],[x,y+2]],id==='farm'?1.65:2.3);return o;}
  function tree(id,x,y,pine=false,clearable=false){return add(id,pine?'pine':'tree',x,y,{solid:solid(x*T,y*T,16,12),clearable,resource:'wood',amount:5});}
  function resource(id,name,x,y,item,amount=3){return add(id,name,x,y,{solid:solid(x*T,y*T,16,10),clearable:true,resource:item,amount});}
  function gather(id,name,x,y,item){return add(id,name,x,y,{interact:'forage',resource:item,amount:1+Math.floor(hash(x,y,28)*2),label:{berry:'野莓丛',mushroom:'林间蘑菇',shell:'潮汐贝壳',gem:'古老晶石'}[item]||'可采集物',clearable:true});}
  function sign(id,x,y,label){return add(id,'sign',x,y,{label});}
  function portal(id,x,y,w,h,to,sx,sy,direction,label){maps[id].portals.push({x:x*T,y:y*T,w:w*T,h:h*T,to,spawn:{x:sx*T,y:sy*T},direction,label:label||maps[to].name});}
  function npc(id,key,name,style,x,y,role,lines){maps[id].npcs.push({id:key,name,style,x:x*T,y:y*T,dir:'down',role,dialogue:lines});}
  function scatter(id,count,seed=1,kind='mixed',exclude=()=>false){const m=maps[id];let done=0;for(let i=0;i<count*10&&done<count;i++){const x=2+hash(i,seed,2)*(m.w-4),y=3+hash(i,seed,3)*(m.h-6);if(tile(id,x,y)!=='grass'||exclude(x,y))continue;const nearbyRoad=scenes[id].roads.some(r=>r.points.some(p=>Math.hypot(p[0]/T-x,p[1]/T-y)<5));if(nearbyRoad||maps[id].objects.some(o=>o.solid&&Math.hypot(o.x/T-x,o.y/T-y)<2.3))continue;let n=hash(i,seed,8);if(kind==='rock'){resource(id,n<.14?'copper':n<.23?'iron':n<.3?'coal':'rock',x,y,n<.14?'copper':n<.23?'iron':n<.3?'coal':'stone',n<.3?2:3);}else if(n<.68){tree(id,x,y,kind==='pine'||n<.22,true);}else if(n<.8){add(id,'bush',x,y);}else if(n<.92){add(id,'flower',x,y,{variant:i});}else{resource(id,'rock',x,y,'stone');}done++;}}
  function decorateRoad(id,points){points.forEach((p,i)=>{add(id,'lamp',p[0],p[1]);if(i%2===0)add(id,'flower',p[0]+1,p[1]+.3,{variant:i});});}
  function makeFarm(){
    // A compact west-bank courtyard surrounds the main garden. Older east rows
    // migrate once in Core to the spacious second field across the creek.
    // One continuous stream, with independently shaped banks. It enters through
    // the northern trees; neither the upper widening nor the downstream inlet
    // is a separate round pond. Dense vertices also define the exact collision.
    const creekSections=[[-4,29.7,31.6],[0,29.3,31.1],[2,29.7,31.7],[4,29.1,32],[5.6,28.7,31.5],[7,29.1,31.6],[9,29.5,31.7],[11,29.2,31.5],[13,28.8,31],[15,29.3,31.7],[17,29.8,32.4],[19,29.5,32],[21,28.8,31.6],[23,28.9,32.2],[25,29.1,32.6],[27,28.8,33.8],[29,28.1,35.3],[31,27.9,37.5],[34,28.8,39.5],[36,30.4,40.1],[39,31.2,38.3],[42,31.4,35.5],[46,31.7,35.2],[51,33,36.7],[57,34.4,38],[63,33.2,36.9],[70,31.9,35.7],[77,33,36.3],[84,34.2,37.9]];
    const bankAt=y=>{let i=0;while(i<creekSections.length-2&&y>creekSections[i+1][0])i++;const a=creekSections[Math.max(0,i-1)],b=creekSections[i],c=creekSections[i+1],d=creekSections[Math.min(creekSections.length-1,i+2)],t=Math.max(0,Math.min(1,(y-b[0])/(c[0]-b[0]))),t2=t*t,t3=t2*t;return[1,2].map(k=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3)+(k===1?.12*Math.sin(y*2.4)+.05*Math.sin(y*5.1):.13*Math.sin(y*1.7+.7)+.04*Math.sin(y*4.2)));};
    const bankL=[],bankR=[];for(let y=-4;y<=84;y+=.25){const [left,right]=bankAt(y);bankL.push([left,y]);bankR.unshift([right,y]);}polygon('farm',bankL.concat(bankR),'water');
    scenes.farm.creekBanks=[bankL,bankR.slice().reverse()];
    polygon('farm',[[78,-2],[98,-2],[98,82],[73,82],[75,64],[78,51],[75,39],[79,25],[77,10]],'water');
    curvedRoad('farm',[[9.8,11.6],[10.9,12.5],[13,13.2],[14.1,15.4],[14.1,20.6],[14.4,25.5],[16.2,26.7],[22,27],[26.5,26],[28.3,24.7],[31.2,24.6],[35,25.4]],1.45);
    curvedRoad('farm',[[14.1,15.4],[14.4,11.2],[15.1,8.8],[22,8.7],[27.2,8.8],[30.5,9],[34,9.4],[40,10],[47,10],[57,16],[68,18.5],[95,18.5]],1.55);
    curvedRoad('farm',[[14.2,24.3],[14.4,29],[14.7,34],[16.7,39],[28,45],[45.7,60],[46,80]],1.65);
    curvedRoad('farm',[[47,10],[51,14],[54,18],[54,23]],1.4);curvedRoad('farm',[[46,60],[63,60],[72,53]],1.5);
    road('farm',[[27.8,9],[33.3,9]],2.2,'bridge');road('farm',[[27.6,24.7],[34.5,24.7]],2.1,'bridge');road('farm',[[31.5,22.5],[31.5,27.2]],2.8,'bridge');
    road('farm',[[74,18.5],[95,18.5]],2,'bridge');
    curvedRoad('farm',[[35,25.4],[43,26],[46,30],[46,40],[46,49],[59,49],[70,48],[70,31]],1.45);
    // Ground remains meadow until the player tills an individual saved plot.
    fill('farm',16,10,11,16,'soil');fill('farm',48,32,21,16,'soil');
    ellipse('farm',8.2,12.1,3.5,1.1,'earth');ellipse('farm',7.9,21.3,4.2,3.1,'earth');ellipse('farm',8.5,34,4.6,3.6,'earth');
    building('farm','cottage',10,11,136,58,'portal','海风小屋',{to:'home',spawn:{x:12*T,y:15*T}});
    building('farm','shed',5.4,13.7,60,34,'storage','老木仓');
    add('farm','shipping',14.25,12,{solid:solid(14.25*T,12*T,29,16),interact:'sell',label:'出货箱'});
    add('farm','chest',6.8,11.9,{solid:solid(6.8*T,11.9*T,21,12),interact:'storage',label:'仓库'});
    add('farm','mailbox',12.8,11.7,{interact:'mail',label:'农场信箱'});
    add('farm','barrel',13.15,10.8);add('farm','crate',6.8,10.7);
    building('farm','coop',7.5,19.3,69,34,'livestockInterior','推门进入鸡舍',{kind:'coop',to:'coop',spawn:{x:12*T,y:17*T}});
    building('farm','barn',8,31.2,112,53,'livestockInterior','推门进入牛棚',{kind:'barn',to:'barn',spawn:{x:12*T,y:17*T}});
    pen('farm',4.1,16.8,12.3,24.6,{side:'east',at:21,gateId:'coop-yard-gate',label:'鸡舍牧栏门'});
    pen('farm',3.4,28.5,13.1,38.2,{side:'east',at:34.4,gateId:'barn-yard-gate',label:'牛棚牧栏门'});
    add('farm','trough',5.4,23.2);add('farm','haystack',10.6,18.2);add('farm','haystack',5,29.9);add('farm','trough',5,36.9);
    building('farm','shed',54,23,80,41,'community','被藤蔓覆盖的温室',{project:'greenhouse'});
    building('farm','shed',72,53,72,36,'craft','南坡制作台');
    building('farm','shop',34.8,12.4,78,36,'shop','河畔种子摊',{scale:.62});
    curvedRoad('farm',[[33.5,9.4],[34.6,10.8],[34.8,13.8],[36.5,15.2],[38.5,17]],1.35);
    add('farm','crate',33.4,13);add('farm','barrel',36.2,12.9);add('farm','flowerpot',33.3,12.5);add('farm','flowerpot',36.3,12.4);
    add('farm','bridge',30.5,10.7,{groundFixture:true});add('farm','dock',31.5,27.2,{groundFixture:true});
    add('farm','boat',34.1,26.7);add('farm','bench',27.5,26.8);add('farm','lamp',29.4,24.5);add('farm','barrel',32.8,25.2);add('farm','crate',32.6,26.4);
    add('farm','lamp',13.5,16);add('farm','lamp',13.9,25.4);add('farm','well',11.6,14.5,{label:'庭院老井'});
    // Short stone and timber borders frame the orchard without enclosing crops.
    for(let x=15.3;x<=25.3;x+=1)add('farm','fence',x,7.9);
    [[17.8,6.6],[21.1,6.6],[24.3,6.6],[16.9,3.5],[20.3,3.4],[23.7,3.5]].forEach((p,i)=>add('farm','orchard',p[0],p[1],{variant:i,solid:solid(p[0]*T,p[1]*T,16,12)}));
    [[3.7,6.1],[4.8,9.1],[2.7,13.6],[2.9,19.8],[3.2,25.5],[1.7,30.1],[2,38.9],[9.7,40.8],[16.8,29.3],[23,29.4],[25.8,29.1],[25.5,27.9],[25.2,2.8],[26.1,9.3]].forEach((p,i)=>tree('farm',p[0],p[1],i%7===3,false));
    // Cluster shapes, reeds and stones are purpose-built sprites, not isolated dots.
    [[4.9,10.8],[5.1,12.1],[6.2,14.8],[10.8,13.6],[11.8,15.6],[13,17.3],[3.2,16],[4,25.4],[11.4,25.6],[14.8,28.1],[20.2,28.5],[26.1,28.4],[26.6,27.5],[26.1,8.4],[27.2,7.9],[33,8.2],[28.1,12.2],[28.2,16.1],[28.1,20.4],[27.5,23.4]].forEach((p,i)=>{add('farm','wildflowers',p[0],p[1],{variant:i});if(i%3===0)add('farm','bush',p[0]-.7,p[1]-.3);});
    // Broken groups of clay rocks overhang the banks; broad grassy gaps between
    // groups keep the stream from becoming a uniform stone or sandy outline.
    for(const [y,side,scale] of [[.8,-1,.78],[1.6,1,.93],[3.5,-1,.62],[4.7,1,.82],[6.2,-1,.86],[7.1,1,.61],[11.4,-1,.76],[12.3,1,.7],[14.6,-1,.62],[16.3,1,.87],[17.5,-1,.76],[19.4,1,.62],[21.4,-1,.88],[22,1,.69],[28,-1,.84],[29.7,1,.94],[32,-1,.8],[34.2,1,.95],[37.7,-1,.83]]){
      const bx=bankAt(y)[side===-1?0:1]+side*.12;
      add('farm','shoreRocks',bx,y+.3,{scale});
      if(Math.round(y)%3!==0)add('farm','grassClump',bx+side*.48,y+.14,{scale:.72});
      if(Math.round(y)%4===1)add('farm','wildflowers',bx+side*.72,y+.28,{scale:.68});
    }
    [[27.5,.9],[33.4,1.9],[27.7,3.3],[33.1,5.2]].forEach((p,i)=>tree('farm',p[0],p[1],i===1,false));
    for(const y of [1.2,2,3,5.9,6.5,12.7,13.5,16.8])for(const side of [-1,1]){
      const bx=bankAt(y)[side===-1?0:1]+side*(.42+hash(Math.round(y*10),side,19)*.3);
      add('farm','grassClump',bx,y+.2,{scale:.6+hash(Math.round(y*10),side,20)*.2});
    }
    for(let i=0;i<72;i++){const x=2+hash(i,81,2)*36,y=3+hash(i,81,3)*37;if(tile('farm',x,y)!=='grass'||x>=16&&x<27&&y>=10&&y<26)continue;add('farm',i%5?'grassClump':'wildflowers',x,y,{scale:.65+hash(i,83)*.4,variant:i});}
    [[5.8,11],[12.8,10.9],[6.8,14.8],[10.7,13.6],[13.3,16.8],[11.2,25.6]].forEach((p,i)=>add('farm','flowerpot',p[0],p[1],{variant:i}));
    resource('farm','stump',17,29.6,'wood');resource('farm','rock',15.6,31.5,'stone');resource('farm','rock',27.6,30.4,'stone');
    for(let i=0;i<11;i++)gather('farm','bush',57+hash(i,1,2)*16,16+hash(i,1,4)*8,'berry');
    scatter('farm',230,1,'mixed',(x,y)=>x<42&&y<42||x>27&&x<47||x>=46&&x<=70&&y>=26&&y<=50);
    // Meadow plants occupy unworked plots, and disappear as soon as a tile is tilled.
    for(const [tx,ty] of [[23,11],[25,11],[24,13],[25,15],[23,17],[25,18],[22,20],[25,22],[20,23],[18,20],[17,17],[24,24]]){add('farm','grassClump',tx+.5,ty+.8,{fallowDecoration:true,tx,ty,scale:.85});if((tx+ty)%3===0)add('farm','wildflowers',tx+.5,ty+.8,{fallowDecoration:true,tx,ty,scale:.72});}
    [[27.3,11.1],[27.6,13.4],[27.5,15.4],[27.4,18.2],[27.3,21.2],[16,26.6],[19,26.9],[22.3,27.7],[25.2,26.8],[33.5,14.8],[34.2,16],[35.4,17.4]].forEach((p,i)=>{add('farm','grassClump',p[0],p[1],{scale:.8});if(i%2===0)add('farm','wildflowers',p[0]-.25,p[1]+.1,{scale:.75});});
    scenes.farm.courtyard=[[9.5,11.6],[10.2,11.9],[10.8,12.4],[11.5,12.8],[12.3,13.3],[13.1,14.1]];
    scenes.farm.planters=[];
    sign('farm',26.9,10,'海风小镇 →');sign('farm',44,73,'苔风森林 ↓');sign('farm',28.1,26.1,'镜溪码头 · 抛竿钓鱼');sign('farm',46,31,'东坡耕地 →');
    portal('farm',94,17,2,4,'town',4,44.5,'east');portal('farm',44.5,78,4,2,'forest',47,5,'south');
  }
  function makeTown(){
    // Broad common, neighbourhood loops and waterways give the town a readable structure.
    const riverA=[],riverB=[];for(let y=-2;y<=130;y+=3){let x=89+Math.sin(y*.09)*2;riverA.push([x-2,y]);riverB.unshift([x+2,y]);}polygon('town',riverA.concat(riverB),'water');
    ellipse('town',27,100,11,8,'water');ellipse('town',111,18,10,10,'water');
    road('town',[[0,44],[28,44],[64,44],[91,44],[110,44]],2.8);
    road('town',[[64,0],[64,44],[64,84],[68,128]],2.8);road('town',[[28,22],[28,44],[28,76],[64,76],[104,76],[128,72]],2.2);
    road('town',[[28,22],[64,22],[104,22],[104,76],[104,104],[68,104]],2);
    road('town',[[28,76],[12,76],[12,107],[43,107],[43,84],[64,84]],2);road('town',[[64,62],[79,62],[79,97],[104,97]],2);
    rect('town',55,36,18,17,'paving');road('town',[[85,44],[95,44]],2.8,'bridge');road('town',[[85,22],[96,22]],2,'bridge');road('town',[[85,76],[96,76]],2.2,'bridge');road('town',[[85,97],[96,97]],2,'bridge');
    building('town','shop',48,42,120,53,'shop','林芽种子铺');road('town',[[48,44],[48,42]],2);
    building('town','tavern',35,42,121,53,'tavern','海盐酒馆');road('town',[[35,44],[35,42]],2);
    building('town','blacksmith',76,29,120,58,'upgrade','岩叔铁匠铺');road('town',[[76,29],[76,22]],2);
    building('town','museum',45,24,136,62,'museum','潮汐博物馆');road('town',[[45,24],[45,27],[64,27]],2);
    building('town','cottage',68,60,136,58,'community','小镇建设公所');road('town',[[64,60],[68,60]],2);
    building('town','fishinghut',99,58,80,42,'fisher','阿禾渔具屋');road('town',[[99,58],[104,58]],2);
    building('town','shed',75,73,70,34,'craft','公共手作工坊');road('town',[[75,73],[75,76]],2);
    building('town','cottage',17,31,136,58,'home-town','蓝窗民居');road('town',[[17,31],[28,31]],2);
    building('town','cottage',18,63,136,58,'home-town','风铃小院');road('town',[[18,63],[28,63]],2);
    building('town','cottage',43,91,136,58,'home-town','花匠之家');
    building('town','cottage',111,91,136,58,'home-town','远航者的家');road('town',[[104,91],[111,91]],2);
    building('town','cottage',107,36,136,58,'home-town','河东小屋');road('town',[[104,36],[107,36]],2);
    add('town','sign',59,48,{interact:'journal',label:'小镇公告栏'});
    npc('town','lin','林芽','shopkeeper',48,45.8,'种子铺主人',['每一颗种子都带着一个小小的季节。欢迎回来！','我的种子铺就在身后，萝卜适合起步，草莓可以反复收获。','有空把自己种的蔬菜带来看看吧。']);
    npc('town','su','苏姨','shopkeeper',35,45.8,'海盐酒馆老板',['进来歇一会儿吧。海边生活，总要给热汤留点时间。','听说北岭的矿洞重新露出入口了，别忘了带些吃的。','丰收节的长桌，永远有你一个位置。']);
    npc('town','yan','岩叔','fisher',76,31.5,'铁匠',['镐子敲在石头上的声音，能告诉你下面藏着什么。','铜矿和木材都带来，我替你看看工具。','矿洞越深，岩石越硬。先准备，再出发。']);
    npc('town','ning','宁远','shopkeeper',66,60.8,'小镇管理员',['欢迎安家。我们想把旧码头、温室和灯塔重新修起来。','一根木头、一块石料，都能让小镇向前一点。','小镇没有必须完成的期限，按自己的步调生活吧。']);
    decorateRoad('town',[[31,46],[40,46],[51,46],[62,35],[74,46],[62,58],[30,74],[64,74],[102,74],[46,25],[78,32]]);
    add('town','bench',58,44);add('town','bench',70,44);add('town','bench',63,51);
    for(let i=0;i<18;i++){const x=20+i*4.7;add('town','flower',x,18.5,{variant:i});if(i%3===0)tree('town',x,17);}
    scatter('town',450,2,'mixed',(x,y)=>x>53&&x<76&&y>34&&y<55);
    // A planted promenade welcomes the player before the central shop quarter.
    // All of these accents are decorative and leave the road/door footprints intact.
    for(let x=3.5;x<29;x+=.95){if(x>9&&x<12||x>20&&x<23)continue;add('town','fence',x,41.8);if(x<18||x>21)add('town','fence',x,48.1);}
    [[5,40.6],[9,40.5],[14,40.2],[18.8,40.4],[23.8,40.4],[28,40.6],[6.5,49.7],[12,49.8],[18,50],[24,49.8],[30,49.8]].forEach((p,i)=>add('town',i%3===0?'orchard':'tree',p[0],p[1],{variant:i}));
    [[4.7,46.8],[7.1,47.2],[9.3,47],[12.8,46.8],[15.2,47.1],[17.1,47],[22,47],[24.2,47.3],[27,47.1],[4.4,41.3],[7.7,41],[13,41.1],[16,41.2],[19.7,41.3],[24.4,41.1],[28.2,41.3]].forEach((p,i)=>add('town','bush',p[0],p[1],{variant:i}));
    for(let i=0;i<34;i++){const x=3.5+i*.78,y=i%2?46.7+hash(i,141)*.35:41.3+hash(i,142)*.25;add('town','flower',x,y,{variant:i});if(i%5===0)add('town','flower',x+.25,y+.35,{variant:i+1});}
    [[5.6,42],[12,42],[19,42],[26,42],[9.7,47.6],[21,47.6]].forEach(p=>add('town','lamp',p[0],p[1]));
    add('town','bench',11,47.3);add('town','bench',22,41.5);add('town','barrel',16.8,40.9);add('town','flower',16.8,40.4);
    // Gravel courtyards are small side pockets rather than widening the main road.
    ellipse('town',10.7,47.2,1.8,.85,'sand');ellipse('town',21.9,40.7,1.7,.8,'sand');
    [[5,39.1],[8.8,38.7],[14.7,38.8],[20.8,38.6],[25.8,38.8],[8.4,51],[16.7,51.2],[26.1,51]].forEach((p,i)=>{add('town','bush',p[0],p[1]);add('town','flower',p[0]+.6,p[1]+.3,{variant:i});});
    sign('town',5,42,'← 潮汐农场');sign('town',62,7,'北岭山道 ↑');sign('town',70,119,'银沙海岸 ↓');sign('town',119,70,'镜湾湖 →');
    portal('town',0,42,2,5,'farm',92,18.5,'west');portal('town',62,0,5,2,'mountain',48,75,'north');portal('town',66,126,5,2,'beach',56,5,'south');portal('town',126,70,2,5,'lake',4,40,'east');
  }
  function makeForest(){
    ellipse('forest',69,27,12,9,'water');const a=[],b=[];for(let y=-2;y<=98;y+=3){const x=61+Math.sin(y*.12)*5;a.push([x-1.3,y]);b.unshift([x+1.3,y]);}polygon('forest',a.concat(b),'water');
    road('forest',[[47,0],[47,20],[34,35],[34,56],[56,64],[96,64]],3);road('forest',[[34,56],[0,56]],3);road('forest',[[34,56],[34,80],[47,96]],3);road('forest',[[34,35],[20,35],[20,30]],2.5);road('forest',[[56,64],[69,64]],3,'bridge');
    building('forest','cottage',20,30,110,52,'craft','苔青的林间工坊');
    npc('forest','moss','苔青','shopkeeper',21,32.5,'森林研究员',['你听，树叶的声音和海浪很像。','林中的野莓和蘑菇可以采集，留一些给小动物就好。','沿西边的小路走，是被藤蔓覆盖的旧潮遗迹。']);
    for(let i=0;i<30;i++){const x=10+hash(i,3,2)*75,y=10+hash(i,3,4)*75;if(tile('forest',x,y)==='grass')gather('forest',i%3?'bush':'mushroom',x,y,i%3?'berry':'mushroom');}
    resource('forest','stump',32,42,'wood',8);resource('forest','stump',38,73,'wood',8);add('forest','bench',68,37);add('forest','sign',68,38,{label:'林间深潭 · 可钓鱼'});
    scatter('forest',650,3,'mixed');
    sign('forest',45,7,'潮汐农场 ↑');sign('forest',8,54,'← 旧潮遗迹');sign('forest',88,62,'镜湾湖 →');sign('forest',46,88,'银沙海岸 ↓');
    portal('forest',45,0,5,2,'farm',46,75,'north');portal('forest',0,54,2,5,'ruins',75,40,'west');portal('forest',94,62,2,5,'lake',40,75,'east');portal('forest',45,94,5,2,'beach',5,35,'south');
  }
  function makeBeach(){
    rect('beach',0,20,112,52,'sand');polygon('beach',[[-2,51],[12,49],[28,54],[45,50],[59,53],[76,48],[91,51],[114,45],[114,74],[-2,74]],'water');
    road('beach',[[56,0],[56,23],[56,35],[27,35],[0,35]],3);road('beach',[[56,35],[96,35],[96,30]],2.8);road('beach',[[56,35],[76,35],[76,52]],3);road('beach',[[74.5,47],[74.5,62]],3,'bridge');road('beach',[[72,60],[81,60]],3,'bridge');
    building('beach','fishinghut',45,26,80,42,'fisher','潮汐钓鱼屋');road('beach',[[45,26],[45,35],[56,35]],3);
    building('beach','lighthouse',96,30,64,70,'community','海角旧灯塔',{project:'lighthouse'});
    add('beach','sign',77,48,{interact:'community',project:'dock',label:'远洋码头修复计划'});add('beach','boat',82,60);add('beach','boat',79,57);
    npc('beach','he','阿禾','fisher',74.5,57,'渔夫',['海风里有鱼群的消息。今天想钓什么？','浮漂一沉，及时收线。按住与松开，让鱼留在捕获区里。','修好远洋码头以后，再来听我讲灯塔那边的故事。']);
    for(let i=0;i<24;i++){const x=8+hash(i,9,2)*95,y=36+hash(i,9,4)*12;if(tile('beach',x,y)==='sand')gather('beach','shell',x,y,'shell');}
    for(let i=0;i<26;i++){const x=3+hash(i,12,2)*106,y=7+hash(i,12,3)*13;if(tile('beach',x,y)==='grass')add('beach',i%3?'bush':'tree',x,y);}
    add('beach','bench',61,34);add('beach','barrel',74,48);add('beach','crate',78,49);add('beach','lamp',75,56);
    sign('beach',54,7,'海风小镇 ↑');sign('beach',7,33,'← 苔风森林');sign('beach',92,33,'海角旧灯塔 →');sign('beach',71,58,'海钓栈桥');
    portal('beach',54,0,5,2,'town',68,123,'north');portal('beach',0,33,2,5,'forest',47,91,'west');
  }
  function makeMountain(){
    polygon('mountain',[[66,4],[84,3],[88,8],[88,26],[81,33],[66,27],[62,17]],'water');
    road('mountain',[[48,80],[48,62],[36,49],[36,36],[48,26],[48,18]],3.5);road('mountain',[[36,36],[63,36],[96,36]],3);road('mountain',[[48,62],[70,62],[70,54]],2.5);
    building('mountain','mine',48,18,104,58,'portal','回声矿洞入口',{to:'mine',spawn:{x:24*T,y:42*T}});
    building('mountain','shed',70,54,66,35,'craft','山间补给台');add('mountain','bench',72,29);road('mountain',[[63,36],[71,36],[72,29]],2.5);
    for(let i=0;i<22;i++){const x=12+hash(i,5,4)*72,y=21+hash(i,5,8)*45;if(tile('mountain',x,y)==='grass')resource('mountain',i%3?'rock':'copper',x,y,i%3?'stone':'copper',3);}
    scatter('mountain',440,5,'pine');
    sign('mountain',46,72,'海风小镇 ↓');sign('mountain',87,34,'风化采石场 →');sign('mountain',46,23,'回声矿洞 · 20 层');
    portal('mountain',46,78,5,2,'town',64,5,'south');portal('mountain',94,34,2,5,'quarry',4,32,'east');
  }
  function makeLake(){
    ellipse('lake',42,35,22,22,'water');ellipse('lake',50,59,16,12,'water');
    road('lake',[[0,40],[14,40],[14,14],[42,8],[66,16],[72,41],[67,64],[40,72],[40,80]],3);road('lake',[[14,40],[28,40]],3,'bridge');road('lake',[[25,37],[25,46]],3,'bridge');
    building('lake','fishinghut',15,27,78,41,'fisher','镜湾垂钓亭');road('lake',[[14,27],[15,27]],3);
    add('lake','bench',18,44);add('lake','boat',30,44);add('lake','lamp',23,44);add('lake','sign',24,40,{label:'湖心钓点 · 湖鱼出没'});
    for(let i=0;i<15;i++){const x=8+hash(i,7,4)*62,y=8+hash(i,7,6)*64;if(tile('lake',x,y)==='grass')gather('lake','bush',x,y,'berry');}
    scatter('lake',220,6,'mixed');sign('lake',6,38,'← 海风小镇');sign('lake',38,73,'苔风森林 ↓');
    portal('lake',0,38,2,5,'town',123,72,'west');portal('lake',38,78,5,2,'forest',91,64,'south');
  }
  function makeQuarry(){
    rect('quarry',12,12,41,40,'paving');road('quarry',[[0,32],[20,32],[32,32],[32,12]],4);road('quarry',[[32,32],[48,32],[48,45]],3);
    building('quarry','shed',32,12,75,38,'craft','采石场加工台');add('quarry','crate',34,14);add('quarry','barrel',29,14);
    for(let y=17;y<=49;y+=5)for(let x=16;x<=51;x+=5){if(Math.abs(y-32)<4||Math.abs(x-32)<3||Math.abs(x-48)<2)continue;const r=hash(x,y,7),res=r<.33?'stone':r<.58?'copper':r<.76?'iron':r<.92?'coal':'gem';resource('quarry',res==='stone'?'rock':res,x+hash(x,y)*.8,y,res,2+Math.floor(r*3));}
    scatter('quarry',70,8,'pine',(x,y)=>x>10&&x<55&&y>10&&y<54);sign('quarry',7,30,'← 北岭山道');
    portal('quarry',0,30,2,5,'mountain',91,36,'west');
  }
  function makeRuins(){
    ellipse('ruins',22,25,12,9,'water');ellipse('ruins',53,61,13,8,'water');road('ruins',[[80,40],[60,40],[40,40],[24,46],[18,59]],3);road('ruins',[[40,40],[40,22],[48,16]],2.5);
    rect('ruins',32,30,18,18,'paving');building('ruins','ruin',40,34,140,65,'museum','旧潮纪念碑');building('ruins','ruin',48,16,100,45,'community','旧庭院的石刻',{project:'lighthouse'});
    for(let i=0;i<16;i++){const x=12+hash(i,8,3)*57,y=16+hash(i,8,4)*50;if(tile('ruins',x,y)==='grass')gather('ruins',i%4?'mushroom':'gem',x,y,i%4?'mushroom':'gem');}
    add('ruins','bench',34,43);add('ruins','chest',18,59,{interact:'museum',label:'旧庭院收藏箱'});scatter('ruins',240,9,'mixed');sign('ruins',71,38,'苔风森林 →');portal('ruins',78,38,2,5,'forest',5,56,'east');
  }
  function makeHome(){
    const id='home';fill(id,0,0,24,20,'wall');rect(id,2,4,20,13,'floor');rect(id,2,2,20,3,'wall');rect(id,9,9,6,5,'rug');road(id,[[12,15],[12,20]],3,'floor');
    add(id,'bed',5,8,{solid:solid(5*T,8*T,52,37),interact:'rest',label:'柔软的木床'});
    add(id,'chest',18,8,{solid:solid(18*T,8*T,28,16),interact:'storage',label:'收藏木箱'});
    add(id,'wardrobe',20,12,{solid:solid(20*T,12*T,30,36),interact:'appearance',label:'蓝色衣柜'});
    add(id,'table',8,12,{solid:solid(8*T,12*T,47,24),interact:'rest',label:'炉边热茶'});
    add(id,'flower',15,6);add(id,'lamp',4,12);add(id,'fireplace',12,6,{interact:'rest',label:'暖炉'});
    sign(id,13.7,16,'回到农场 ↓');portal(id,10.5,18,3,2,'farm',10,12.8,'south');
  }
  function makeLivestockRoom(id){
    const m=maps[id];fill(id,0,0,m.w,m.h,'wall');rect(id,1,3,22,15,'floor');road(id,[[12,16],[12,20]],3,'floor');
    const outside=id==='coop'?{x:7.5*T,y:20.7*T}:{x:8*T,y:32.6*T};m.interiorKind=id;m.exteriorSpawn=outside;
    // This visible door marker remains above the hotbar; it is also reachable
    // with E from the entry position, without putting the spawn in the exit zone.
    add(id,'sign',12,17.6,{interact:'portal',to:'farm',spawn:{...outside},label:'回到院子',doorMarker:true,customRender:'interior',drawKind:'exit',w:60,h:18,size:{width:60,height:18}});
    portal(id,10.5,17.85,3,2.15,'farm',outside.x/T,outside.y/T,'south','回到农场');
  }
  function makeMine(floor=1){
    const id='mine',m=maps.mine;m.name='回声矿洞 · '+floor+' 层';m.objects=[];m.landmarks=[];m.portals=[];grids.mine=Array.from({length:48},()=>Array(48).fill('wall'));scenes.mine={shapes:[],roads:[],gardens:[]};
    ellipse(id,24,24,20,20,'cave');rect(id,20,37,8,11,'cave');road(id,[[24,48],[24,38],[24,24],[24,9]],3,'cave');road(id,[[10,24],[38,24]],3,'cave');
    for(let i=0;i<100;i++){const x=7+hash(i,floor,10)*34,y=7+hash(i,floor,11)*31;if(tile(id,x,y)!=='cave'||Math.abs(x-24)<2.2||Math.abs(y-24)<2.2)continue;const r=hash(i,floor,12),res=r<.45?'stone':r<.65?'copper':r<.8?'coal':r<.92?(floor>=4?'iron':'copper'):r<.98?(floor>=9?'gold':'iron'):'gem';const o=resource(id,res==='stone'?'rock':res,x,y,res,1+Math.floor(r*3));o.id='mine-floor'+floor+'-vein'+i;}
    add(id,'ladder',24,9,{interact:floor>=20?'museum':'mineDown',label:floor>=20?'深层矿藏记录':'前往第 '+(floor+1)+' 层'});
    add(id,'ladder',27,40,{interact:'mineUp',label:floor===1?'返回山道':'返回上一层'});
    add(id,'lamp',22,38);add(id,'lamp',22,10);add(id,'lamp',10,23);add(id,'lamp',38,23);
    if(floor%5===0)add(id,'chest',30,22,{interact:'mineCheckpoint',label:'第 '+floor+' 层升降梯检查点'});
    portal(id,22,46,4,2,'mountain',48,21,'south','返回北岭');
    buildBuckets(id);for(const k of chunks.keys())if(k.startsWith('mine:'))chunks.delete(k);
  }
  function tile(id,x,y){return grids[id]?.[Math.floor(y)]?.[Math.floor(x)]||'wall';}
  const waterLookup=new Map();
  function waterGeometry(id){const source=scenes[id]?.shapes||[],old=waterLookup.get(id);if(old?.source===source&&old.length===source.length)return old;
    const shapes=source.filter(s=>s.type==='water'),cells=new Map();
    for(const s of shapes){const xs=s.points?.map(p=>p[0]),ys=s.points?.map(p=>p[1]),bounds=s.kind==='polygon'?{x:Math.min(...xs),y:Math.min(...ys),r:Math.max(...xs),b:Math.max(...ys)}:s.kind==='ellipse'?{x:s.x-s.rx,y:s.y-s.ry,r:s.x+s.rx,b:s.y+s.ry}:{x:s.x,y:s.y,r:s.x+s.w,b:s.y+s.h};
      for(let y=Math.floor(bounds.y/T);y<=Math.floor(bounds.b/T);y++)for(let x=Math.floor(bounds.x/T);x<=Math.floor(bounds.r/T);x++){const key=x+','+y;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(s);}}
    const out={source,length:source.length,shapes,cells};waterLookup.set(id,out);return out;
  }
  function containsPoint(s,x,y){if(s.kind==='ellipse')return((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<1;if(s.kind==='rect')return x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h;let inside=false;for(let a=0,b=s.points.length-1;a<s.points.length;b=a++){const A=s.points[a],B=s.points[b];if((A[1]>y)!==(B[1]>y)&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])inside=!inside;}return inside;}
  // Raw water includes the water beneath decks. Visual rendering and shoreline
  // collision read these same polygons, rather than a rounded tile mask.
  function waterAt(id,x,y){return(waterGeometry(id).cells.get(Math.floor(x/T)+','+Math.floor(y/T))||[]).some(s=>containsPoint(s,x,y));}
  function waterShapes(id){return waterGeometry(id).shapes.map(s=>({...s,...(s.points?{points:s.points.map(p=>p.slice())}:{})}));}
  function onBridge(id,x,y){return(scenes[id]?.roads||[]).some(r=>r.type==='bridge'&&r.points.some((b,i)=>{if(!i)return false;const a=r.points[i-1],dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,f=d?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/d)):0;return Math.hypot(x-a[0]-dx*f,y-a[1]-dy*f)<=r.width/2;}));}
  let clearRef=null,clearLen=-1,clearSet=new Set();
  function cleared(state,id){const a=state?.cleared;if(a!==clearRef||a?.length!==clearLen){clearRef=a;clearLen=a?.length;clearSet=new Set(a||[]);}return clearSet.has(id);}
  function objects(id,state,time=0){const interior=global.Interior||global.Interiors;const out=(maps[id]||maps.farm).objects.filter(o=>!o.groundFixture&&!cleared(state,o.id)&&!(o.fallowDecoration&&state?.plots?.[o.tx+','+o.ty]?.tilled)).map(o=>o.gateId?{...o,open:gateIsOpen(state,o)}:o);if((id==='coop'||id==='barn')&&interior?.objects)out.push(...interior.objects(id,state,time));else if(id==='farm'&&interior?.outdoorObjects)out.push(...interior.outdoorObjects(state,time));return out;}
  function buildBuckets(id){const m=maps[id],out=new Map(),colliders=m.objects.slice();if(id==='town')colliders.push({id:'town-fountain-footprint',solid:{x:64*T-32,y:44*T-16,w:64,h:22}});for(const o of colliders){if(!o.solid)continue;const r=o.solid;for(let y=Math.floor((r.y-4)/T);y<=Math.floor((r.y+r.h+5)/T);y++)for(let x=Math.floor((r.x-6)/T);x<=Math.floor((r.x+r.w+6)/T);x++){const k=x+','+y;if(!out.has(k))out.set(k,[]);out.get(k).push(o);}}buckets[id]=out;}
  const NO_DECORATIONS=Object.freeze([]);
  let decorationCache={ref:null,length:-1,first:null,last:null,buckets:new Map()};
  function decorationFootprint(d){
    if(!d||d.scene&&d.scene!=='farm')return null;
    const item=d.item||d.itemId||d.type;if(item==='lamp')return null;
    const x=(d.tx+.5)*T,y=(d.ty+.8)*T;if(!Number.isFinite(x)||!Number.isFinite(y))return null;
    let w=14,h=10,raise=3;
    if(item==='coop'||item==='barn'){w=70;h=32;}
    else if(item==='fence'){w=20;h=5;raise=2;}
    else if(item==='bench'){w=26;h=9;}
    else if(item==='flowerpot'){w=10;h=7;}
    else if(item==='sprinkler'){w=9;h=7;}
    return{x:x-w/2,y:y-h-raise,w,h};
  }
  function placedBuckets(state){
    const a=Array.isArray(state?.decorations)?state.decorations:NO_DECORATIONS;
    // Supported placement appends a unique id; removal splices. Ref, length and
    // end ids detect both operations in O(1), even a remove+append between ticks.
    const first=a[0]?.id,last=a[a.length-1]?.id;
    if(a!==decorationCache.ref||a.length!==decorationCache.length||first!==decorationCache.first||last!==decorationCache.last){
      const out=new Map();for(let i=0;i<a.length;i++){const d=a[i],r=decorationFootprint(d);if(!r)continue;const o={id:d.id,index:i,solid:r};
        for(let y=Math.floor((r.y-4)/T);y<=Math.floor((r.y+r.h+5)/T);y++)for(let x=Math.floor((r.x-6)/T);x<=Math.floor((r.x+r.w+6)/T);x++){const k=x+','+y;if(!out.has(k))out.set(k,[]);out.get(k).push(o);}}
      decorationCache={ref:a,length:a.length,first,last,buckets:out};
    }return decorationCache;
  }
  function passable(id,px,py,state,time=0){const m=maps[id];if(!m||px<6||py<6||px>m.w*T-6||py>m.h*T-6)return false;const tx=Math.floor(px/T),ty=Math.floor(py/T),kind=tile(id,tx,ty);if(kind==='wall'||(id==='farm'?waterAt(id,px,py)&&!onBridge(id,px,py):kind==='water'))return false;
    if((id==='coop'||id==='barn')&&(global.Interior||global.Interiors)?.passable&&!(global.Interior||global.Interiors).passable(id,px,py,state,time))return false;
    const inside=r=>px>r.x-4&&px<r.x+r.w+4&&py>r.y-2&&py<r.y+r.h+3;
    for(const o of buckets[id]?.get(tx+','+ty)||[]){if(!cleared(state,o.id)&&!(o.gateId&&gateIsOpen(state,o))&&inside(o.solid))return false;}
    if(id==='farm'){const cache=placedBuckets(state);for(const o of cache.buckets.get(tx+','+ty)||[]){if(cache.ref[o.index]?.id===o.id&&inside(o.solid))return false;}}
    return true;
  }
  function nearby(id,x,y,state,radius=44){return objects(id,state).concat(maps[id].npcs).map(o=>({...o,distance:Math.hypot(o.x-x,o.y-y)})).filter(o=>o.distance<radius).sort((a,b)=>a.distance-b.distance);}
  makeFarm();makeTown();makeForest();makeBeach();makeMountain();makeLake();makeQuarry();makeRuins();makeHome();makeLivestockRoom('coop');makeLivestockRoom('barn');makeMine(1);Object.keys(maps).forEach(buildBuckets);
  function shapePath(c,s,append=false){if(!append)c.beginPath();if(s.kind==='ellipse')c.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);else if(s.kind==='rect')c.roundRect(s.x,s.y,s.w,s.h,8);else{s.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}}
  function clipDryGround(c,id,x,y,w,h){c.beginPath();c.rect(x-10,y-10,w+20,h+20);for(const q of waterGeometry(id).shapes)shapePath(c,q,true);c.clip('evenodd');}
  function linePath(c,r){c.beginPath();r.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));}
  function clayColor(p,type){return{water:p.water,sand:p.sand,paving:p.path,grass:p.grass,soil:p.grass,cave:p.grass,floor:'#bb9267',wall:'#4f514f',rug:'#a75f4a'}[type]||p.path;}
  const materialPatterns=new WeakMap();let terrainTextureSignature='';const waterImage=typeof Image!=='undefined'?new Image():null;const ready=waterImage?new Promise(resolve=>{waterImage.onload=()=>{chunks.clear();resolve(true);};waterImage.onerror=()=>resolve(false);waterImage.src='assets/water-stream.png';}):Promise.resolve(false);
  function materialPattern(c,kind){const image=kind==='water'?waterImage:global.Art?.groundTexture?.(kind);if(!image||!(image.naturalWidth||image.width))return null;let cache=materialPatterns.get(c);if(!cache){cache={};materialPatterns.set(c,cache);}if(cache[kind]?.image===image)return cache[kind].pattern;const p=c.createPattern(image,'repeat');if(!p)return null;if(p.setTransform&&typeof DOMMatrix!=='undefined')p.setTransform(new DOMMatrix().scale(240/(image.naturalWidth||image.width)));cache[kind]={image,pattern:p};return p;}
  function syncGroundTextures(){const a=global.Art?.groundTexture?.('grass'),b=global.Art?.groundTexture?.('earth'),key=(a?.naturalWidth||a?.width||0)+':'+(b?.naturalWidth||b?.width||0)+':'+(waterImage?.naturalWidth||0);if(key!==terrainTextureSignature){terrainTextureSignature=key;chunks.clear();}}
  function drawTerrain(c,id,ox,oy,w,h){
    const p=paletteFor(id),s=scenes[id],grassMaterial=materialPattern(c,'grass'),earthMaterial=materialPattern(c,'earth'),waterMaterial=materialPattern(c,'water'),outdoor=!['home','coop','barn','mine'].includes(id);c.fillStyle=outdoor&&grassMaterial?grassMaterial:id==='mine'?'#383e4a':p.grass;c.fillRect(ox,oy,w,h);if(outdoor&&grassMaterial){c.save();c.globalAlpha=visual.theme==='candy'?.52:visual.season===3?.72:visual.season===2?.38:.12;c.fillStyle=p.grass;c.fillRect(ox,oy,w,h);c.restore();}
    if(id==='home')c.fillStyle='#514c44',c.fillRect(ox,oy,w,h);
    for(const q of s.shapes){
      shapePath(c,q);
      if(q.type==='water'){
        if(id!=='farm'){c.strokeStyle=earthMaterial||p.sand;c.lineWidth=9;c.lineJoin='round';c.stroke();}
        c.fillStyle=p.water;c.fill();c.save();c.clip();
        const pts=q.points||[],bx=q.kind==='ellipse'?q.x:q.kind==='rect'?q.x+q.w/2:pts.reduce((a,v)=>a+v[0],0)/pts.length,by=q.kind==='ellipse'?q.y:q.kind==='rect'?q.y+q.h/2:pts.reduce((a,v)=>a+v[1],0)/pts.length,br=q.kind==='ellipse'?Math.max(q.rx,q.ry):q.kind==='rect'?Math.max(q.w,q.h)/2:Math.max(...pts.map(v=>Math.hypot(v[0]-bx,v[1]-by)));
        const g=c.createRadialGradient(bx,by,0,bx,by,Math.max(1,br));g.addColorStop(0,p.deep);g.addColorStop(.65,p.water);g.addColorStop(1,'#9bc6b4');c.fillStyle=g;c.globalAlpha=waterMaterial?.12:.5;c.fillRect(ox,oy,w,h);
        if(waterMaterial){c.globalAlpha=.96;c.fillStyle=waterMaterial;c.fillRect(ox,oy,w,h);if(visual.theme==='candy'||visual.season===3){c.globalAlpha=.28;c.fillStyle=p.water;c.fillRect(ox,oy,w,h);}}
        if(id==='farm'){
          // A recessed, grassy bank casts its shadow into the stream. No sand
          // stroke or separate outline can form a bright ring around the water.
          c.globalAlpha=1;shapePath(c,q);c.strokeStyle='rgba(44,68,47,.22)';c.lineWidth=8;c.lineJoin='round';c.stroke();
          c.strokeStyle='rgba(79,111,69,.28)';c.lineWidth=3;c.stroke();
        }
        c.restore();
      }else{c.fillStyle=earthMaterial&&['earth','sand','paving'].includes(q.type)?earthMaterial:clayColor(p,q.type);c.fill();if(q.type==='paving'){c.strokeStyle='rgba(93,80,62,.12)';c.lineWidth=3;c.stroke();}}
    }
    c.lineCap='round';c.lineJoin='round';
    for(const r of s.roads){if(id==='farm'&&r.type==='bridge'&&r.points.every(p=>p[0]<40*T&&p[1]<32*T))continue;c.save();if(id==='farm'&&r.type!=='bridge')clipDryGround(c,id,ox,oy,w,h);linePath(c,r);c.strokeStyle=r.type==='bridge'?'#816247':r.type==='cave'?'#777369':r.type==='floor'?'#bb9267':'rgba(79,76,44,.24)';c.lineWidth=r.width+4;c.stroke();c.strokeStyle=r.type==='bridge'?'#c39b6d':r.type==='cave'?'#69686c':r.type==='floor'?'#bb9267':earthMaterial||p.path;c.lineWidth=r.width;c.stroke();c.strokeStyle='rgba(249,227,184,.09)';c.lineWidth=Math.max(1,r.width-6);c.stroke();
      if(r.type==='path'&&outdoor){c.fillStyle=grassMaterial||p.grass;for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;const nx=-dy/len,ny=dx/len,n=Math.ceil(len/7);for(let j=0;j<=n;j++){const f=j/Math.max(1,n),xx=a[0]+dx*f,yy=a[1]+dy*f;for(const side of [-1,1]){const wobble=hash(Math.round(xx),Math.round(yy),side+5)*3-1.5,edge=r.width/2+wobble;c.beginPath();c.ellipse(xx+nx*edge*side,yy+ny*edge*side,2.1,1.3,Math.atan2(dy,dx),0,Math.PI*2);c.fill();}}}}
      c.restore();
    }
    // Raised timber rails give traversable bridges a real miniature volume.
    for(const r of s.roads.filter(r=>r.type==='bridge'&&id!=='farm')){for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<8)continue;const nx=-dy/len,ny=dx/len,off=r.width/2-2;c.save();c.lineCap='round';for(const side of [-1,1]){const ax=a[0]+nx*off*side,ay=a[1]+ny*off*side,bx=b[0]+nx*off*side,by=b[1]+ny*off*side;c.strokeStyle='#72543c';c.lineWidth=4.2;c.beginPath();c.moveTo(ax,ay-9);c.lineTo(bx,by-9);c.stroke();c.strokeStyle='#caa578';c.lineWidth=2.6;c.beginPath();c.moveTo(ax,ay-10);c.lineTo(bx,by-10);c.stroke();const n=Math.max(1,Math.ceil(len/25));for(let j=0;j<=n;j++){const xx=ax+(bx-ax)*j/n,yy=ay+(by-ay)*j/n;const g=c.createLinearGradient(xx-3,0,xx+3,0);g.addColorStop(0,'#956b47');g.addColorStop(.4,'#d0a673');g.addColorStop(1,'#926a45');c.fillStyle=g;c.beginPath();c.roundRect(xx-3,yy-17,6,20,2);c.fill();c.fillStyle='#e0bd8c';c.beginPath();c.ellipse(xx,yy-17,3.3,1.8,0,0,Math.PI*2);c.fill();}}c.restore();}}
    c.save();if(id==='farm')clipDryGround(c,id,ox,oy,w,h);
    for(const g of s.gardens){c.save();c.shadowColor='rgba(65,56,33,.16)';c.shadowBlur=4;c.fillStyle=earthMaterial||'#b69a70';c.beginPath();c.roundRect(g.x-2,g.y-2,g.w+4,g.h+4,9);c.fill();c.shadowBlur=0;c.save();c.clip();for(let n=0;n<420;n++){const xx=g.x+hash(n,11,54)*g.w,yy=g.y+hash(n,12,55)*g.h,r=.3+hash(n,13,56)*1.2;c.fillStyle=n%3?'rgba(105,79,47,.16)':'rgba(238,209,158,.3)';c.beginPath();c.ellipse(xx,yy,r,r*.65,hash(n,15)*3,0,Math.PI*2);c.fill();}c.restore();c.restore();}
    if(id==='farm'){
      for(const a of s.courtyard||[]){const x=a[0]*T,y=a[1]*T;c.fillStyle='rgba(67,59,43,.17)';c.beginPath();c.ellipse(x+1,y+2,8,5,0,0,Math.PI*2);c.fill();const g=c.createLinearGradient(x,y-4,x,y+5);g.addColorStop(0,'#d0c7a7');g.addColorStop(1,'#a2987d');c.fillStyle=g;c.beginPath();c.ellipse(x,y,7.8,4.4,-.2,0,Math.PI*2);c.fill();c.strokeStyle='rgba(245,231,194,.45)';c.lineWidth=.6;c.beginPath();c.ellipse(x,y-.7,6.5,3.2,-.2,Math.PI,Math.PI*2);c.stroke();}
      for(const a of s.planters||[]){const x=a[0]*T,y=a[1]*T;c.fillStyle='rgba(76,59,37,.2)';c.beginPath();c.ellipse(x+2,y+2,8,3,0,0,Math.PI*2);c.fill();const g=c.createLinearGradient(x-7,y,x+7,y);g.addColorStop(0,'#b87c54');g.addColorStop(.4,'#dbab75');g.addColorStop(1,'#a56e4c');c.fillStyle=g;c.beginPath();c.roundRect(x-6,y-8,12,10,3);c.fill();c.fillStyle='#806346';c.beginPath();c.ellipse(x,y-8,6.5,2.7,0,0,Math.PI*2);c.fill();for(let n=0;n<5;n++){c.fillStyle=n%2?'#8ea755':'#627f3d';c.beginPath();c.ellipse(x+(n-2)*2,y-10-Math.abs(n-2)*.5,2,4,(n-2)*.35,0,Math.PI*2);c.fill();}}
    }
    const x0=Math.floor(ox/T)-1,y0=Math.floor(oy/T)-1,x1=Math.ceil((ox+w)/T)+1,y1=Math.ceil((oy+h)/T)+1;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const kind=tile(id,x,y);if(kind==='water'||kind==='wall')continue;
      if(kind==='bridge'&&!(id==='farm'&&x<40&&y<32)){c.fillStyle='#6e513a';for(let k=0;k<4;k++){const yy=y*T+k*6;c.fillRect(x*T,yy,24,.6);c.fillStyle='rgba(255,236,194,.28)';c.fillRect(x*T,yy+1,24,.7);c.fillStyle='#6e513a';}}
      else if(kind==='floor'){c.strokeStyle='rgba(90,59,35,.25)';c.lineWidth=.6;c.strokeRect(x*T,y*T,T,T);c.strokeStyle='rgba(246,212,163,.25)';c.beginPath();c.moveTo(x*T+3,y*T+2);c.lineTo(x*T+21,y*T+3);c.stroke();}
      const grass=(kind==='grass'||kind==='soil')&&id!=='mine'&&id!=='home';
      for(let n=0;n<(grass?8:5);n++){const xx=x*T+hash(x*11+n,y,8)*T,yy=y*T+hash(x,y*13+n,9)*T,v=hash(x+n,y,20);c.fillStyle=grass?(v>.5?'rgba(229,232,150,.15)':'rgba(49,77,30,.11)'):(v>.5?'rgba(255,243,208,.17)':'rgba(87,63,39,.11)');c.beginPath();c.ellipse(xx,yy,.45+v*.7,.35+v*.4,0,0,Math.PI*2);c.fill();}
      if(grass&&hash(x,y,31)<.13){c.strokeStyle='rgba(76,110,43,.28)';c.lineWidth=.8;const xx=x*T+13,yy=y*T+14;c.beginPath();c.moveTo(xx-2,yy);c.quadraticCurveTo(xx-2,yy-3,xx-4,yy-3);c.moveTo(xx,yy);c.quadraticCurveTo(xx,yy-4,xx+2,yy-5);c.stroke();}
      if(id==='farm'&&x<42&&y<32){
        const inGarden=s.gardens.some(g=>x*T>=g.x&&x*T<g.x+g.w&&y*T>=g.y&&y*T<g.y+g.h);
        if(grass&&!inGarden&&hash(x,y,94)<.7){for(let n=0;n<2;n++){const xx=x*T+hash(x*7+n,y,91)*T,yy=y*T+hash(x,y*9+n,92)*T,vv=hash(x+n,y,93);c.strokeStyle='rgba(57,86,36,.16)';c.lineWidth=1.25;c.beginPath();c.moveTo(xx-2,yy+1);c.quadraticCurveTo(xx,yy-3,xx+3,yy-4);c.stroke();c.strokeStyle='rgba(217,226,137,.23)';c.lineWidth=.7;c.beginPath();c.moveTo(xx-2,yy);c.quadraticCurveTo(xx-1,yy-4,xx-4,yy-5);c.moveTo(xx,yy);c.quadraticCurveTo(xx+2,yy-3,xx+3,yy-4);c.stroke();if(vv>.7){c.fillStyle='rgba(161,188,91,.26)';c.beginPath();c.ellipse(xx+5,yy-2,1.9,.8,-.45,0,Math.PI*2);c.fill();}}}
        if(kind==='path'){for(let n=0;n<3;n++){const xx=x*T+hash(x*7+n,y,96)*T,yy=y*T+hash(x,y*11+n,97)*T,vv=hash(x+n,y,98);c.fillStyle='rgba(107,89,62,.16)';c.beginPath();c.ellipse(xx+.6,yy+.8,1.5+vv,.7+vv*.5,0,0,Math.PI*2);c.fill();c.fillStyle=vv>.5?'rgba(237,219,175,.55)':'rgba(175,159,129,.37)';c.beginPath();c.ellipse(xx,yy,1.3+vv,.65+vv*.4,0,0,Math.PI*2);c.fill();}}
      }
    }
    // Scattered sunlit mottling replaces visible tile seams.
    for(let i=0;i<18;i++){const xx=ox+hash(ox+i,oy,52)*w,yy=oy+hash(ox,oy+i,53)*h;if(!['grass','soil'].includes(tile(id,xx/T,yy/T)))continue;const g=c.createRadialGradient(xx,yy,0,xx,yy,28+hash(i,ox)*35);g.addColorStop(0,'rgba(231,232,143,.055)');g.addColorStop(1,'rgba(231,232,143,0)');c.fillStyle=g;c.fillRect(xx-70,yy-70,140,140);}
    c.restore();
  }
  function getChunk(id,cx,cy){const key=id+':'+visual.season+':'+visual.theme+':'+cx+':'+cy;if(chunks.has(key)){const c=chunks.get(key);chunks.delete(key);chunks.set(key,c);return c;}const cv=document.createElement('canvas');cv.width=cv.height=CHUNK*RES;const c=cv.getContext('2d');c.scale(RES,RES);c.translate(-cx*CHUNK,-cy*CHUNK);drawTerrain(c,id,cx*CHUNK,cy*CHUNK,CHUNK,CHUNK);chunks.set(key,cv);while(chunks.size>MAX_CACHE)chunks.delete(chunks.keys().next().value);return cv;}
  function drawFountain(c,time){const x=64*T,y=44*T;c.save();c.fillStyle='rgba(52,70,48,.2)';c.beginPath();c.ellipse(x+4,y+4,34,15,0,0,Math.PI*2);c.fill();const g=c.createLinearGradient(x,y-24,x,y+7);g.addColorStop(0,'#ddd3b5');g.addColorStop(1,'#8e9787');c.fillStyle=g;c.beginPath();c.ellipse(x,y-5,32,18,0,0,Math.PI*2);c.fill();c.fillStyle='#70b3b2';c.beginPath();c.ellipse(x,y-8,26,12,0,0,Math.PI*2);c.fill();c.fillStyle='#c5c7b0';c.beginPath();c.roundRect(x-5,y-34,10,25,4);c.fill();c.beginPath();c.ellipse(x,y-34,15,6,0,0,Math.PI*2);c.fill();c.strokeStyle='rgba(220,243,227,.75)';c.lineWidth=1.4;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x+i*3,y-34);c.quadraticCurveTo(x+i*22,y-52,x+i*21,y-9+Math.sin(time/280+i)*2);c.stroke();}c.restore();}
  function drawGround(c,id,time=0,state,viewport){id=maps[id]?id:'farm';syncVisual(state);syncGroundTextures();if((id==='coop'||id==='barn')&&(global.Interior||global.Interiors)?.drawGround){(global.Interior||global.Interiors).drawGround(c,id,time,state,viewport);return;}if(id==='mine')ensureMineFloor(state);const m=maps[id],v=viewport||{x:0,y:0,w:Math.min(m.w*T,1200),h:Math.min(m.h*T,800)},x0=Math.max(0,Math.floor(v.x/CHUNK)),y0=Math.max(0,Math.floor(v.y/CHUNK)),x1=Math.min(Math.ceil(m.w*T/CHUNK)-1,Math.floor((v.x+v.w)/CHUNK)),y1=Math.min(Math.ceil(m.h*T/CHUNK)-1,Math.floor((v.y+v.h)/CHUNK));
    c.imageSmoothingEnabled=true;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)c.drawImage(getChunk(id,x,y),x*CHUNK,y*CHUNK,CHUNK,CHUNK);
    for(let y=Math.max(0,Math.floor(v.y/T)-1);y<Math.min(m.h,(v.y+v.h)/T+1);y++)for(let x=Math.max(0,Math.floor(v.x/T)-1);x<Math.min(m.w,(v.x+v.w)/T+1);x++){if(tile(id,x,y)!=='water'||hash(x,y,29)>.38)continue;const r=hash(x,y,29),xx=x*T+5+Math.sin(time/1700+r*9)*3,yy=y*T+8+r*18;c.strokeStyle='rgba(215,242,225,.35)';c.lineWidth=.8;c.beginPath();c.moveTo(xx-4,yy);c.quadraticCurveTo(xx+1,yy+1.5,xx+8,yy);c.stroke();}
    if(global.Art?.draw){for(const o of m.objects){if(!o.groundFixture||o.x<v.x-150||o.x>v.x+v.w+150||o.y<v.y-150||o.y>v.y+v.h+150)continue;global.Art.draw(c,o.name,o.x,o.y,{...o,time});}}
    if(id==='town'&&64*T>v.x-50&&64*T<v.x+v.w+50&&44*T>v.y-60&&44*T<v.y+v.h+60)drawFountain(c,time);
  }
  function drawAtmosphere(c,id,time=0,state,viewport){const m=maps[id],v=viewport||{x:0,y:0,w:1000,h:700};if(id==='mine'){for(const o of m.objects.filter(o=>o.name==='lamp')){if(o.x<v.x-80||o.x>v.x+v.w+80||o.y<v.y-80||o.y>v.y+v.h+80)continue;const g=c.createRadialGradient(o.x,o.y-25,2,o.x,o.y-25,90);g.addColorStop(0,'rgba(255,195,99,.16)');g.addColorStop(1,'rgba(255,195,99,0)');c.fillStyle=g;c.fillRect(o.x-90,o.y-115,180,180);}return;}
    if(['home','coop','barn'].includes(id))return;
    const nightAlpha=visual.night?.34:visual.hour>=17?.10:0;
    if(nightAlpha){c.fillStyle='rgba(24,43,70,'+nightAlpha+')';c.fillRect(v.x,v.y,v.w,v.h);}
    if(visual.night){for(const o of m.objects){if(!['lamp','cottage','tavern','lighthouse'].includes(o.name)||o.x<v.x-100||o.x>v.x+v.w+100||o.y<v.y-100||o.y>v.y+v.h+100)continue;const yy=o.y-(o.name==='lamp'?25:15),g=c.createRadialGradient(o.x,yy,1,o.x,yy,75);g.addColorStop(0,'rgba(255,206,116,.22)');g.addColorStop(1,'rgba(255,206,116,0)');c.fillStyle=g;c.fillRect(o.x-75,yy-75,150,150);}}
    if(visual.weather==='cloudy'){c.fillStyle='rgba(61,74,78,.065)';c.fillRect(v.x,v.y,v.w,v.h);}
    if(visual.weather==='rain'||visual.weather==='storm'){
      c.fillStyle=visual.weather==='storm'?'rgba(47,63,85,.15)':'rgba(60,85,101,.08)';c.fillRect(v.x,v.y,v.w,v.h);
      c.strokeStyle='rgba(215,234,235,.52)';c.lineWidth=.7;
      for(let i=0;i<(visual.weather==='storm'?125:85);i++){const x=v.x+((hash(i,17)*v.w-time*.035)%(v.w+25)+v.w+25)%(v.w+25),y=v.y+(hash(i,31)*v.h+time*.18)%(v.h+20);c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y+9);c.stroke();}
      if(visual.weather==='storm'&&Math.floor(time/180)%71===0){c.fillStyle='rgba(224,237,244,.13)';c.fillRect(v.x,v.y,v.w,v.h);}
    }
    if(visual.weather==='snow')for(let i=0;i<75;i++){const x=v.x+(hash(i,37)*v.w+Math.sin(time*.0005+i)*15+time*.004)%(v.w+8),y=v.y+(hash(i,49)*v.h+time*.015)%(v.h+8);c.fillStyle='rgba(255,254,242,.8)';c.beginPath();c.ellipse(x,y,1.2,1.2,0,0,Math.PI*2);c.fill();}
    for(let i=0;i<18;i++){const x=v.x+(hash(i,4)*v.w+time*.006*(.4+hash(i,8)))%v.w,y=v.y+(hash(i,8)*v.h+time*.003)%v.h;c.save();c.translate(x,y);c.rotate(Math.sin(time*.001+i)*.6);c.fillStyle=i%3?'rgba(250,237,181,.6)':'rgba(245,191,160,.65)';c.beginPath();c.ellipse(0,0,1.4,.7,0,0,Math.PI*2);c.fill();c.restore();}
    if(['farm','town','beach','lake'].includes(id)){for(let i=0;i<3;i++){const x=v.x+(time*.016+i*270)%(v.w+80)-40,y=v.y+40+i*100+Math.sin(time*.0007+i)*15;c.strokeStyle='rgba(255,253,233,.8)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-5,y-Math.sin(time*.008)*2);c.quadraticCurveTo(x-2,y-2,x,y);c.quadraticCurveTo(x+2,y-2,x+5,y-Math.sin(time*.008)*2);c.stroke();}}
  }
  function drawMap(c,id,x,y,w,h,state){syncVisual(state);const m=maps[id],p=paletteFor(id),s=scenes[id],scale=Math.min(w/(m.w*T),h/(m.h*T));c.save();c.translate(x+(w-m.w*T*scale)/2,y+(h-m.h*T*scale)/2);c.scale(scale,scale);c.fillStyle=p.grass;c.fillRect(0,0,m.w*T,m.h*T);for(const q of s.shapes){shapePath(c,q);c.fillStyle=clayColor(p,q.type);c.fill();}c.lineCap='round';for(const r of s.roads){if(id==='farm'&&r.type==='bridge'&&r.points.every(p=>p[0]<40*T&&p[1]<32*T))continue;c.save();if(id==='farm'&&r.type!=='bridge')clipDryGround(c,id,0,0,m.w*T,m.h*T);linePath(c,r);c.strokeStyle=r.type==='bridge'?'#b98c63':p.path;c.lineWidth=r.width;c.stroke();c.restore();}for(const o of m.landmarks){if(!o.interact)continue;c.fillStyle='#735a43';c.beginPath();c.roundRect(o.x-24,o.y-22,48,38,5);c.fill();c.fillStyle='#e0bd8a';c.fillRect(o.x-14,o.y-15,28,23);}c.restore();}
  function setMineFloor(floor){floor=Math.max(1,Math.min(20,Math.floor(floor)||1));if(floor!==activeMineFloor){activeMineFloor=floor;makeMine(floor);}return maps.mine;}
  function ensureMineFloor(state){return setMineFloor(state?.mineFloor||1);}
  const World={T,ready,maps,tile,objects,passable,waterAt,waterShapes,nearby,drawGround,drawAtmosphere,drawMap,palettes,setMineFloor,ensureMineFloor,landmarks:id=>maps[id]?.landmarks||[],farmBounds:{x:16,y:10,w:11,h:16},farmRegions:[{x:16,y:10,w:11,h:16},{x:48,y:32,w:21,h:16}],decorationFootprint,gateIsOpen,toggleGate,get mineFloor(){return activeMineFloor;},totalTiles:Object.values(maps).reduce((n,m)=>n+m.w*m.h,0)};
  global.World=World;global.TideWorld=World;if(typeof module!=='undefined'&&module.exports)module.exports=World;
})(typeof window!=='undefined'?window:globalThis);
