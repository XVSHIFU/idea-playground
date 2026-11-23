/* 潮汐小镇 · handcrafted clay sprite renderer.
 * Original generated RGBA atlases; draw calls retain the 24-unit game grid.
 * Source rectangles are tight alpha bounds, not a background illustration.
 */
(() => {
  'use strict';
  const P={ink:'#35464d',dark:'#42544a',soil:'#927052',wood:'#a7774b',oak:'#c79560',timber:'#704e42',pale:'#f1dbaa',cream:'#f8e7bb',sand:'#dcc38d',roof:'#c77657',roofDark:'#884a45',roofMid:'#d58b64',roofLight:'#edb47c',leaf:'#7f9948',leafDark:'#496b3e',leafMid:'#97ad51',leafLight:'#bdc77a',blue:'#6b9d9a',blueDark:'#4c727b',teal:'#507b73',sun:'#f4c76b'};
  const boxes={
    buildings:[[22,28,431,405],[497,58,369,347],[906,17,389,400],[1341,47,412,374],[38,450,405,415],[478,482,394,368],[939,511,354,346],[1384,439,316,422]],
    nature:[[23,29,272,277],[363,23,223,281],[642,29,275,273],[964,23,265,278],[22,394,271,196],[339,377,265,220],[651,376,264,221],[966,388,263,206],[21,707,271,190],[368,665,204,247],[648,689,269,209],[1021,651,153,263],[52,981,210,234],[356,993,225,223],[634,1009,295,199],[963,996,261,209]],
    characters:[[75,22,171,277],[389,22,170,278],[702,22,170,274],[1015,22,171,277],[83,337,149,275],[395,337,149,274],[707,337,148,273],[1022,338,149,273],[82,649,151,276],[396,649,151,275],[709,649,152,275],[1025,648,149,277],[79,966,158,267],[395,966,155,267],[706,965,157,268],[1021,966,157,267]],
    items:[[57,56,233,242],[332,58,275,236],[662,58,237,240],[968,53,241,250],[48,352,247,260],[351,356,230,254],[651,356,247,253],[997,395,180,184],[49,649,247,274],[336,651,267,269],[642,657,273,249],[961,657,248,252],[50,955,243,262],[335,963,263,254],[639,1017,276,156],[979,986,216,221]]
  };
  boxes.candyBuildings=[[15, 14, 441, 416], [491, 38, 381, 379], [900, 8, 402, 411], [1335, 42, 424, 384], [33, 443, 414, 431], [476, 472, 408, 389], [930, 509, 363, 360], [1376, 443, 337, 427]];
  boxes.candyNature=[[21, 26, 275, 281], [359, 20, 232, 285], [640, 24, 282, 282], [959, 19, 278, 286], [21, 392, 275, 200], [333, 376, 273, 224], [645, 376, 273, 224], [961, 386, 271, 212], [19, 709, 274, 194], [360, 664, 217, 253], [641, 686, 284, 221], [1011, 652, 170, 267], [42, 971, 223, 250], [353, 994, 227, 228], [622, 1010, 311, 207], [960, 993, 269, 222]];
  boxes.environment=[[23, 98, 399, 308], [516, 18, 282, 415], [896, 100, 418, 285], [1338, 113, 420, 243], [55, 567, 321, 228], [467, 527, 388, 291], [901, 594, 377, 193], [1314, 464, 455, 376]];
  boxes.livestock=[[44, 81, 550, 488], [692, 100, 510, 468], [94, 704, 433, 500], [665, 723, 536, 482]];
  boxes.ui=[[42,86,361,298],[482,51,356,368],[917,48,392,370],[1371,52,362,361],[78,490,306,346],[471,468,386,377],[981,480,257,365],[1362,490,340,342]];
  boxes.goods=[[113,79,453,503],[660,141,534,412],[65,673,509,515],[654,741,552,444]];
  const sprites={
    cottage:['buildings',0,168,144],house:['buildings',0,168,144],shop:['buildings',1,144,130],tavern:['buildings',2,144,130],blacksmith:['buildings',3,144,130],museum:['buildings',4,168,144],townhall:['buildings',4,168,144],fishinghut:['buildings',5,96,102],shed:['buildings',6,72,78],coop:['buildings',6,72,78],barn:['environment',7,120,110],lighthouse:['buildings',7,80,160],
    cow:['livestock',0,32,28],sheep:['livestock',1,28,26],duck:['livestock',2,18,18],nest:['livestock',3,36,30],bridge:['environment',0,96,55],dock:['environment',1,78,96],shoreRocks:['environment',2,62,36],wildflowers:['environment',3,34,23],grassClump:['environment',4,26,21],haystack:['environment',5,40,30],trough:['environment',6,42,24],tree:['nature',0,48,64],pine:['nature',1,42,66],fruitTree:['nature',2,48,64],appletree:['nature',2,48,64],orchard:['nature',2,48,64],cherryTree:['nature',3,48,64],cherry:['nature',3,48,64],bush:['nature',4,28,22],rock:['nature',5,22,18],ore:['nature',6,26,22],copper:['nature',6,26,22],stump:['nature',7,20,16],fence:['nature',8,24,22],barrel:['nature',9,20,25],chest:['nature',10,26,22],mailbox:['nature',11,20,32],chicken:['nature',12,16,18],cat:['nature',13,20,19],boat:['nature',14,64,36],flower:['nature',15,15,13]
  };
  const customSizes={shipping:[38,30],sign:[30,32],bench:[36,24],lamp:[20,55],crate:[22,22],weed:[20,18],shell:[13,10],mine:[96,74],ruin:[110,90],iron:[26,22],gold:[26,22],gem:[26,22],coal:[26,22],cow:[32,28],sheep:[28,26],duck:[18,18],bed:[64,50],table:[52,35],chair:[20,26],stove:[32,42],rug:[68,38],bookshelf:[58,54],sprinkler:[20,25],furnace:[34,40],'jam-machine':[27,33],'cheese-machine':[30,30],scarecrow:[24,40],well:[36,36],bridge:[72,48],slime:[22,19],torch:[12,32],ladder:[26,40],wardrobe:[38,60],fireplace:[50,60],mushroom:[17,19],jar:[27,33],cheesemaker:[30,30],mill:[36,42],dryer:[38,33],flowerpot:[22,25],fertilizer:[20,24],gate:[28,24],fenceGate:[28,24]};
  const images={},cache=new Map();
  const status={ready:false,loaded:0,missing:[]};
  const ready=Promise.all([...Object.keys(boxes),'groundGrass','groundEarth'].map(key=>new Promise(resolve=>{
    const im=new Image();images[key]=im;
    im.onload=()=>{status.loaded++;resolve(true);};
    im.onerror=()=>{status.missing.push(key);resolve(false);};
    im.src='assets/'+({candyBuildings:'candy-buildings',candyNature:'candy-nature',environment:'environment-details',livestock:'livestock',ui:'ui-icons',goods:'item-icons',groundGrass:'ground-grass',groundEarth:'ground-earth'}[key]||'clay-'+key)+'.png';
  }))).then(results=>{status.ready=results.every(Boolean);cache.clear();window.dispatchEvent(new CustomEvent('clay-art-ready',{detail:status}));return status;});
  function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}}
  function rounded(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
  function line(c,x1,y1,x2,y2,color,width=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.stroke();}
  function poly(c,pts,fill){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();}
  function grad(c,x,y,h,light,dark){const g=c.createLinearGradient(x,y,x+h*.2,y+h);g.addColorStop(0,light);g.addColorStop(1,dark);return g;}
  function shadow(c,x,y,w,h=3){c.save();c.translate(x,y);c.scale(1,h/w);const g=c.createRadialGradient(0,0,0,0,0,w);g.addColorStop(0,'rgba(36,49,29,.26)');g.addColorStop(1,'rgba(36,49,29,0)');ellipse(c,0,0,w,w,g);c.restore();}
  function grain(c,x,y,w,h,seed=1,count=24){c.save();for(let i=0;i<count;i++){seed=(seed*1664525+1013904223)>>>0;let xx=x+(seed%1000)/1000*w;seed=(seed*1664525+1013904223)>>>0;let yy=y+(seed%1000)/1000*h;ellipse(c,xx,yy,.2+(i%3)*.13,.18,i%3?'#fff5d51c':'#4b351523');}c.restore();}
  function leaf(c,x,y,w,h,angle=0,color='#89a64b'){c.save();c.translate(x,y);c.rotate(angle);ellipse(c,0,0,w,h,grad(c,-w,-h,h*2,'#bac970',color));line(c,0,-h*.72,0,h*.72,'#5f7d3a',.35);c.restore();}
  function sprite(c,sheet,index,x,y,w,h,filter='',contain=true){
    if(Art.theme==='candy'){if(sheet==='buildings')sheet='candyBuildings';else if(sheet==='nature')sheet='candyNature';}
    const im=images[sheet],b=boxes[sheet]?.[index];if(!im?.complete||!im.naturalWidth||!b)return false;
    let dw=w,dh=h;if(contain){const scale=Math.min(w/b[2],h/b[3]);dw=b[2]*scale;dh=b[3]*scale;}
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(filter)c.filter=filter;c.drawImage(im,b[0],b[1],b[2],b[3],x-dw/2,y-dh,dw,dh);c.restore();return true;
  }
  function clayRock(c,x,y,w,h,color='#a7aba0'){shadow(c,x,y,w*.55,h*.11);ellipse(c,x,y-h*.42,w*.48,h*.47,grad(c,x-w/2,y-h,h,'#d0d0bb',color));poly(c,[[x-w*.43,y-h*.45],[x-w*.12,y-h*.85],[x+w*.2,y-h*.76],[x+w*.06,y-h*.32]],'#ffffff24');grain(c,x-w*.32,y-h*.65,w*.65,h*.5,31,30);}
  function procedural(name,c,w,h){
    const cx=w/2;
    if(name==='wardrobe'){shadow(c,cx,h-1,w*.46);rounded(c,2,3,w-4,h-5,4,grad(c,0,0,h,'#d3ab78','#94704c'));rounded(c,5,7,w-10,h-14,2,null,'#b58b5d');line(c,cx,7,cx,h-7,'#8c6645',1);ellipse(c,cx-3,h*.53,1.1,1.1,'#e6c47c');ellipse(c,cx+3,h*.53,1.1,1.1,'#e6c47c');grain(c,5,8,w-10,h-18,61,45);return;}
    if(name==='mushroom'){shadow(c,cx,h-1,w*.4,1.8);rounded(c,cx-2,h-12,4,11,2,grad(c,0,0,h,'#f4e0b8','#c6b28e'));ellipse(c,cx,h-12,w*.46,5,grad(c,0,h-17,10,'#cf997c','#a16e5b'));ellipse(c,cx-3,h-13,1,1,'#ead2b3');ellipse(c,cx+3,h-15,.9,.8,'#ead2b3');return;}
    if(name==='flowerpot'){shadow(c,cx,h-1,w*.44);poly(c,[[3,12],[w-3,12],[w-6,h-1],[6,h-1]],grad(c,0,12,h-12,'#cf9b73','#ad7659'));rounded(c,2,10,w-4,4,1,'#dbaa82');sprite(c,'nature',15,cx,15,w*.9,16);return;}
    if(name==='mill'){shadow(c,cx,h-1,w*.45);rounded(c,6,9,w-12,h-11,3,grad(c,0,0,h,'#d1b58c','#a08762'));poly(c,[[3,12],[cx,1],[w-3,12]],'#a37c55');ellipse(c,cx,19,8,8,'#d6bf91');for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;line(c,cx,19,cx+Math.cos(a)*15,19+Math.sin(a)*15,'#82694a',3);}rounded(c,cx-4,h-12,8,10,3,'#6c6450');return;}
    if(name==='dryer'){shadow(c,cx,h-1,w*.45);for(const x of [4,w-6])rounded(c,x,4,3,h-5,1,'#aa8152');for(let y=6;y<h-8;y+=7){line(c,5,y,w-5,y,'#c09c6a',2);for(let x=11;x<w-7;x+=9)sprite(c,'items',14,x,y+7,9,5);}return;}
    if(name==='fertilizer'){rounded(c,2,5,w-4,h-6,4,grad(c,0,4,h,'#d7c29a','#ac9471'));rounded(c,2,3,w-4,5,2,'#e0cda8');leaf(c,cx,h*.62,3,5,.5);return;}
    if(name==='shipping'){sprite(c,'nature',10,cx,h,w,h);rounded(c,cx-5,h-15,10,9,1,'#eee1b6','#aa895c');leaf(c,cx,h-10,2,3,.5);return;}
    if(['iron','gold','gem','coal'].includes(name)){const filter={iron:'saturate(.18)',gold:'hue-rotate(17deg) saturate(1.4)',gem:'hue-rotate(200deg) saturate(1.6)',coal:'saturate(.1) brightness(.55)'}[name];sprite(c,'nature',6,cx,h,w,h,filter);return;}
    if(name==='weed'){shadow(c,cx,h-1,8,2);for(let i=0;i<7;i++)leaf(c,cx+(i-3)*1.2,h-6-Math.abs(i-3),1.8,6,(i-3)*.27,i%2?'#71934a':'#91a951');return;}
    if(name==='sign'){shadow(c,cx,h-1,9);rounded(c,cx-2,11,4,h-12,1,grad(c,0,0,h,'#b9915d','#795439'));poly(c,[[2,3],[24,3],[29,9],[24,16],[2,16]],grad(c,0,0,17,'#edc990','#b78751'));line(c,3,4,23,4,'#f6dcb5',.9);grain(c,3,4,20,10,55,30);return;}
    if(name==='bench'||name==='table'||name==='chair'){shadow(c,cx,h-1,w*.48);let yy=name==='table'?9:12;rounded(c,4,yy,w-8,6,2,grad(c,0,yy,8,'#d6ad76','#a4764c'));rounded(c,5,yy+4,3,h-yy-5,1,'#8a6545');rounded(c,w-8,yy+4,3,h-yy-5,1,'#79563e');if(name!=='table'){rounded(c,4,2,w-8,10,2,grad(c,0,0,12,'#d2aa72','#9d714d'));line(c,5,7,w-5,7,'#b18459',.8);}grain(c,5,yy,w-10,5,3,20);return;}
    if(name==='lamp'||name==='torch'){shadow(c,cx,h-1,w*.4);rounded(c,cx-1.7,14,3.4,h-15,1,grad(c,0,0,w,'#718174','#364c49'));rounded(c,cx-5,h-4,10,3,1,'#45564b');rounded(c,cx-5,5,10,13,2,'#48534a');rounded(c,cx-3.5,7,7,9,1,grad(c,0,7,9,'#ffeab2','#e9b75f'));poly(c,[[cx-8,6],[cx,1],[cx+8,6]],'#4f5c50');line(c,cx,6,cx,16,'#7c7c60',1);return;}
    if(name==='crate'){shadow(c,cx,h-1,w*.48);rounded(c,1,3,w-2,h-5,2,grad(c,0,3,h,'#d6ac76','#9d7047'));for(let x=5;x<w-2;x+=5)line(c,x,5,x,h-3,'#9d734d',.7);line(c,3,5,w-3,h-4,'#e5be87',2);line(c,2,4,w-2,4,'#f0ce98',1.5);return;}
    if(name==='shell'){shadow(c,cx,h-1,w*.45,1);ellipse(c,cx,h*.48,w*.44,h*.45,grad(c,0,0,h,'#fff4de','#d6ad99'));for(let i=-2;i<=2;i++)line(c,cx,h-2,cx+i*2,2,'#d3b3a0',.6);return;}
    if(name==='mine'){shadow(c,cx,h-2,w*.48,5);ellipse(c,cx,h-5,w*.46,h*.83,grad(c,0,0,h,'#a3a69c','#6c756d'));ellipse(c,cx,h-4,w*.26,h*.62,'#273436');for(let i=0;i<9;i++){const a=Math.PI+(Math.PI*i/8),xx=cx+Math.cos(a)*w*.34,yy=h-6+Math.sin(a)*h*.7;clayRock(c,xx,yy+9,w*.23,h*.27,'#8e9991');}rounded(c,cx-24,h-8,48,5,1,'#806849');line(c,cx-14,h-8,cx-18,h,'#b8a68a',2);line(c,cx+14,h-8,cx+18,h,'#b8a68a',2);return;}
    if(name==='ruin'){shadow(c,cx,h-2,w*.48,5);for(let i=0;i<5;i++)clayRock(c,15+i*20,h-3,25,18,'#9a9c87');for(const x of [22,80]){rounded(c,x,15,14,58,3,grad(c,x,15,58,'#c5c3a7','#8e9982'));for(let yy=25;yy<70;yy+=14)line(c,x+1,yy,x+13,yy,'#809078',1);clayRock(c,x+7,22,22,14,'#adad96');}poly(c,[[16,18],[cx,2],[96,18],[88,23],[cx,12],[24,23]],'#b0b198');return;}
    if(name==='cow'||name==='sheep'||name==='duck'){
      shadow(c,cx,h-1,w*.45);if(name==='duck'){ellipse(c,cx,h-7,7,5,grad(c,0,0,h,'#fff5cc','#d4ca9e'));ellipse(c,cx+4,h-12,4,4,'#f2e7ba');ellipse(c,cx+5.5,h-13, .6,.8,'#3f4137');rounded(c,cx+7,h-11,4,2,1,'#e2ab4e');return;}
      const wool=name==='sheep';for(const x of [7,w-9])rounded(c,x,h-8,3,7,1,'#a88e72');ellipse(c,cx-2,h-11,w*.4,h*.32,grad(c,0,0,h,'#fff4d6','#d5c5a5'));if(wool){for(let i=0;i<13;i++){const a=i*2.4;ellipse(c,cx-3+Math.cos(a)*w*.25,h-12+Math.sin(a)*h*.19,4,3,'#f5ecd9');}}else{ellipse(c,cx-6,h-12,4,4,'#655c50');ellipse(c,cx+1,h-17,4,3,'#655c50');}ellipse(c,w-7,h-12,6,7,wool?'#8c7d6a':'#f0dfc0');ellipse(c,w-6,h-8,5,3,'#d3ad94');ellipse(c,w-5,h-14,.7,1,'#3c3b34');leaf(c,w-12,h-17,2.5,1.2,.4,'#c9b798');return;
    }
    if(name==='bed'){shadow(c,cx,h-1,w*.46);rounded(c,2,1,w-4,h-3,3,grad(c,0,0,h,'#b79161','#815c3f'));rounded(c,5,5,w-10,h-10,3,'#f5ead6');rounded(c,7,7,w-14,10,3,'#fff4e1');rounded(c,5,18,w-10,h-23,3,grad(c,0,18,h,'#8ea6a3','#668c88'));for(let x=9;x<w-6;x+=7)line(c,x,20,x,h-8,'#a2bbb4',.7);return;}
    if(name==='rug'){c.save();c.translate(cx,h/2);c.scale(1,.64);rounded(c,-w/2+2,-h/2+2,w-4,h-4,5,'#bd7f60');rounded(c,-w/2+5,-h/2+5,w-10,h-10,3,'#e1b38a','#8f654e');rounded(c,-w/2+8,-h/2+8,w-16,h-16,2,'#79938b');c.restore();return;}
    if(name==='bookshelf'){rounded(c,1,2,w-2,h-3,2,grad(c,0,0,h,'#c99c67','#79543c'));for(let row=0;row<3;row++){rounded(c,4,5+row*15,w-8,11,1,'#664d3d');for(let i=0;i<7;i++)rounded(c,6+i*6,6+row*15,4,10-(i%2),.7,['#78948c','#bd8768','#d8b776','#8b9898'][i%4]);}return;}
    if(name==='stove'||name==='furnace'||name==='fireplace'){shadow(c,cx,h-1,w*.48);rounded(c,3,12,w-6,h-14,4,grad(c,0,10,h,'#a3aaa3','#5c6d69'));rounded(c,w-11,0,6,17,1,'#5e6e68');rounded(c,8,19,w-16,h-25,4,'#3e4843');ellipse(c,cx,h-11,w*.2,5,'#e89747');ellipse(c,cx-1,h-13,w*.12,5,'#f7cd77');rounded(c,2,10,w-4,4,1,'#b2b3a3');return;}
    if(name==='sprinkler'){shadow(c,cx,h-1,8,2);ellipse(c,cx,h-4,7,3,'#648d91');rounded(c,cx-2,8,4,h-12,1,grad(c,0,0,h,'#b2c8b8','#638c8c'));line(c,3,8,w-3,8,'#7b9b98',3);ellipse(c,cx,8,4,3,'#b8c9b5');return;}
    if(name==='jam-machine'||name==='cheese-machine'||name==='jar'||name==='cheesemaker'){shadow(c,cx,h-1,w*.47);rounded(c,2,8,w-4,h-10,3,grad(c,0,0,h,'#dbb67e','#a78053'));rounded(c,4,2,w-8,11,3,(name==='jam-machine'||name==='jar')?'#be7a72':'#e6c37b');rounded(c,w-7,h-13,5,4,1,'#7b9692');rounded(c,7,15,w-14,8,2,'#f2deb3');return;}
    if(name==='scarecrow'){line(c,cx,h-2,cx,15,'#977142',3);line(c,2,21,w-2,21,'#987547',3);poly(c,[[cx-5,15],[cx+5,15],[cx+9,30],[cx-8,30]],'#83958a');ellipse(c,cx,11,6,7,'#d4aa72');ellipse(c,cx,6,11,3,'#caaa68');rounded(c,cx-5,0,10,6,3,'#d7b97b');ellipse(c,cx-2,11,.6,.7,'#594b37');ellipse(c,cx+2,11,.6,.7,'#594b37');return;}
    if(name==='well'){shadow(c,cx,h-1,w*.47);ellipse(c,cx,h-9,16,9,'#858f85');ellipse(c,cx,h-12,16,9,'#c4bca4');ellipse(c,cx,h-12,11,5,'#4d746e');for(const x of [5,w-7])rounded(c,x,5,3,h-16,1,'#a58155');poly(c,[[1,8],[cx,0],[w-1,8]],'#c4825e');return;}
    if(name==='bridge'){shadow(c,cx,h-2,w*.49);rounded(c,1,8,w-2,h-10,4,'#9b744e');for(let y=9;y<h-4;y+=6){rounded(c,3,y,w-6,5,1,grad(c,0,y,6,'#d2aa76','#af8457'));}for(const x of [4,w-7]){rounded(c,x,1,3,h-4,1,'#a57e51');for(const y of [2,h-12]){rounded(c,x-2,y,7,12,2,'#bb925d');ellipse(c,x+1.5,y,3.5,2,'#e3bd83');}}return;}
    if(name==='slime'){shadow(c,cx,h-1,w*.45);ellipse(c,cx,h-8,w*.45,h*.45,grad(c,0,0,h,'#a5ce95','#679a75'));ellipse(c,cx-4,h-9,1.2,1.7,'#435b46');ellipse(c,cx+4,h-9,1.2,1.7,'#435b46');line(c,cx-1,h-5,cx+1,h-5,'#587558',.8);return;}
    if(name==='ladder'){for(const x of [5,w-5])rounded(c,x,1,3,h-2,1,'#bd9363');for(let y=5;y<h-2;y+=6)rounded(c,5,y,w-8,2,1,'#d4ab76');return;}
    clayRock(c,cx,h,w,h,'#a4aa91');
  }
  function cached(name){const key=name+':'+Art.theme;if(!cache.has(key)){const [w,h]=customSizes[name]||[24,24];const can=document.createElement('canvas');can.width=Math.ceil(w*4);can.height=Math.ceil(h*4);const c=can.getContext('2d');c.scale(4,4);procedural(name,c,w,h);cache.set(key,can);}return cache.get(key);}
  function size(name,o={}){if((name==='fence'||name==='gate'||name==='fenceGate')&&o.orientation==='vertical')return{width:14,height:36};const d=sprites[name];const s=d?[d[2],d[3]]:customSizes[name]||[24,24];return {width:s[0],height:s[1]};}
  function draw(c,name,x,y,o={}){
    if(name==='gate'||name==='fenceGate'||(name==='fence'&&o.orientation==='vertical')){drawFence(c,name,x,y,o);return;}
    const d=sprites[name],sz=size(name,o),scale=o.scale||1,w=sz.width*scale,h=sz.height*scale;
    c.save();if(o.alpha!==undefined)c.globalAlpha=o.alpha;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    let filter=o.filter||'';if(/tree|Tree|orchard|pine|cherry|bush/.test(name)){if(Art.season===2)filter+=(filter?' ':'')+'hue-rotate(326deg) saturate(1.08)';else if(Art.season===3)filter+=(filter?' ':'')+'saturate(.12) brightness(1.36)';}
    if(d){const sway=(/tree|Tree|orchard|pine|cherry/.test(name)&&o.time)?Math.sin(o.time/1900+x)*.55:0;shadow(c,x,y-1,w*.35,Math.max(1,h*.037));if(!sprite(c,d[0],d[1],x+sway,y,w,h,filter,!['bridge','dock'].includes(name)))clayRock(c,x,y,w,h,'#b5b995');}
    else{if(filter)c.filter=filter;const im=cached(name);c.drawImage(im,x-w/2,y-h,w,h);}
    c.restore();
  }
  function groundTexture(name){const im=images[name==='earth'?'groundEarth':'groundGrass'];return im?.complete&&im.naturalWidth?im:null;}
  function fencePost(c,x,y){
    shadow(c,x,y,4,1.2);rounded(c,x-2.5,y-19,5,19,1.3,grad(c,x-2.5,y-19,19,'#d8ae78','#9f7147'));ellipse(c,x,y-19,2.6,1.7,'#e6c28d');ellipse(c,x-.2,y-19,.9,.6,null);c.strokeStyle='#b68b59';c.lineWidth=.35;c.stroke();for(let k=-1;k<2;k++)line(c,x+k*1.3,y-16,x+k*1.3+.4,y-3,'#9c704738',.45);
  }
  function drawFence(c,name,x,y,o={}){
    c.save();c.translate(x,y);const sc=o.scale||1;c.scale(sc,sc);if(o.alpha!==undefined)c.globalAlpha=o.alpha;
    const vertical=o.orientation==='vertical',gate=name==='gate'||name==='fenceGate',opened=gate&&!!o.open;
    const a=vertical?{x:-1,y:-17}:{x:-11,y:0},b=vertical?{x:1,y:0}:{x:11,y:0};
    const leafEnd=opened?(vertical?{x:a.x+18,y:a.y+5}:{x:a.x+5,y:a.y-16}):b;
    fencePost(c,a.x,a.y);
    for(const h of [7,14]){line(c,a.x,a.y-h,leafEnd.x,leafEnd.y-h,'#966b43',3.2);line(c,a.x,a.y-h-.9,leafEnd.x,leafEnd.y-h-.9,'#d9b07a',1.25);}
    if(gate){line(c,a.x+1,a.y-6,leafEnd.x-1,leafEnd.y-15,'#b48a58',2);ellipse(c,a.x,a.y-9,1.2,1.6,'#62736b');if(!opened)rounded(c,b.x-4,b.y-12,5,2,1,'#78694f');}
    fencePost(c,b.x,b.y);c.restore();
  }
  function character(c,x,y,o={}){
    if(['cat','cow','sheep','duck','chicken','slime'].includes(o.style)){const bob=o.walk?Math.sin(o.walk*Math.PI*2)*.5:0;draw(c,o.style,x,y+bob);return;}
    const dir=o.dir||'down',row={down:0,left:1,right:2,up:3}[dir]||0;
    const frame=o.walk?Math.floor((o.walk%1)*4):0,bob=o.walk?Math.sin(o.walk*Math.PI*2)*.35:0;
    let filter={shopkeeper:'hue-rotate(330deg) saturate(.84)',fisher:'hue-rotate(35deg) saturate(.7)',blacksmith:'saturate(.45) brightness(.86)',mayor:'hue-rotate(100deg) saturate(.6)',researcher:'hue-rotate(55deg)',innkeeper:'hue-rotate(290deg)',farmer:''}[o.style]||'';

    shadow(c,x,y,7.5,2.3);
    if(!sprite(c,'characters',row*4+frame,x,y+bob,22,31,filter)){ellipse(c,x,y-8,6,8,'#789b98');ellipse(c,x,y-21,7,7,'#e2bc97');ellipse(c,x,y-26,10,3,'#d8ba77');}
  }
  const cropIndex={radish:8,potato:9,strawberry:10,pumpkin:11,wheat:12,corn:13,tomato:10,pearlflower:15};
  function crop(c,type,stage,x,y,time=0){
    stage=Math.max(0,Math.min(3,Math.floor(stage)));const baseY=y+8.4;
    const im=images.items,leafB=boxes.items[15];
    const drawSeed=(w,h)=>{if(!im?.complete||!im.naturalWidth)return;const cut=leafB[3]*.79;c.drawImage(im,leafB[0],leafB[1],leafB[2],cut,x-w/2,baseY-h,w,h);};
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    if(stage===0){shadow(c,x,baseY-.4,2.5,.8);drawSeed(7.2,8.5);c.restore();return;}
    if(stage===1){shadow(c,x,baseY-.4,3.2,1);drawSeed(11.5,12.8);c.restore();return;}
    const sway=Math.sin(time/1700+x*.4)*.22;
    if(stage===2){
      shadow(c,x,baseY-.5,5,1.15);
      if(type==='corn'||type==='wheat'){sprite(c,'environment',4,x+sway,baseY,18,type==='corn'?21:17);}
      else{const b=boxes.items[type==='pumpkin'?10:(cropIndex[type]??8)],leafHeight=b[3]*(type==='strawberry'?.56:.65);if(im?.complete&&im.naturalWidth)c.drawImage(im,b[0],b[1],b[2],leafHeight,x-9.5+sway,baseY-17,19,17);}
      c.restore();return;
    }
    shadow(c,x,baseY-.7,type==='pumpkin'?8:6,1.4);
    if(type==='tomato'){
      line(c,x,baseY-2,x,baseY-26,'#678849',1.4);for(let i=0;i<6;i++){const yy=baseY-5-i*3.4;leaf(c,x+(i%2?1:-1)*5.3,yy,4.5,2.2,i%2?.5:-.5);}
      for(const [dx,dy]of [[-4.5,-5],[4.5,-11],[0,-18]]){ellipse(c,x+dx,baseY+dy,3.8,3.5,grad(c,x+dx-3,baseY+dy-4,8,'#df9570','#b7624e'));leaf(c,x+dx,baseY+dy-3,2,.7);ellipse(c,x+dx-1.3,baseY+dy-1.5,.65,.45,'#f5bb934d');}c.restore();return;
    }
    if(type==='pearlflower'){sprite(c,'environment',3,x+sway,baseY,25,20);c.restore();return;}
    const dims={radish:[24,28],potato:[27,26],strawberry:[27,24],pumpkin:[28,26],corn:[27,38],wheat:[25,35]}[type]||[22,25];
    sprite(c,'items',cropIndex[type]??8,x+sway,baseY,dims[0],dims[1]);
    c.restore();
  }
  const itemIndex={hoe:0,water:1,'watering-can':1,axe:2,pickaxe:3,rod:4,bag:6,backpack:6,coin:7,radish:8,potato:9,strawberry:10,pumpkin:11,wheat:12,corn:13,fish:14,sardine:14,carp:14,bass:14,tuna:14,eel:14,salmon:14,crucian:14,goldcarp:14,trout:14,glacierfish:14,glowfish:14};
  const uiIndex={map:0,book:1,craft:2,gear:3,leaf:4,sun:5,help:6,music:7};
  const goodsIndex={berry:0,feed:1,fertilizer:2,bread:3};
  function icon(c,name,x,y,s=32){
    const quality=/-((?:silver)|(?:gold)|(?:rainbow))$/.exec(name);if(quality)name=name.slice(0,-quality[0].length);
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    if(goodsIndex[name]!==undefined){
      const index=goodsIndex[name],b=boxes.goods[index],h=b[3]*Math.min(s*.92/b[2],s*.92/b[3]);
      if(!sprite(c,'goods',index,x+s/2,y+(s+h)/2,s*.92,s*.92)){c.save();c.translate(x,y);c.scale(s/32,s/32);smallIcon(c,name);c.restore();}
    }
    else if(uiIndex[name]!==undefined){
      const index=uiIndex[name],b=boxes.ui[index],h=b[3]*Math.min(s*.92/b[2],s*.92/b[3]);
      if(!sprite(c,'ui',index,x+s/2,y+(s+h)/2,s*.92,s*.92)){c.save();c.translate(x,y);c.scale(s/32,s/32);smallIcon(c,name);c.restore();}
    }
    else if(name.endsWith('-seed')){sprite(c,'items',5,x+s/2,y+s,s*.88,s*.92);const id=name.slice(0,-5);if(itemIndex[id]!==undefined)sprite(c,'items',itemIndex[id],x+s/2,y+s*.74,s*.38,s*.38);}
    else if(itemIndex[name]!==undefined){sprite(c,'items',itemIndex[name],x+s/2,y+s,s*.9,s*.92,({goldcarp:'sepia(.7) saturate(1.4)',glowfish:'hue-rotate(50deg) brightness(1.2)',glacierfish:'brightness(1.22) saturate(.5)',trout:'hue-rotate(325deg)'}[name]||''));}
    else if(sprites[name]||customSizes[name]){draw(c,name,x+s/2,y+s,{scale:Math.min(s/size(name).width,s/size(name).height)*.9});}
    else{c.save();c.translate(x,y);c.scale(s/32,s/32);smallIcon(c,name);c.restore();}
    if(quality){const col={silver:'#d6e4df',gold:'#efc265',rainbow:'#cc9bdf'}[quality[1]];ellipse(c,x+s*.8,y+s*.82,s*.13,s*.13,col);c.fillStyle='#5b624e';c.font='bold '+Math.max(8,s*.2)+'px sans-serif';c.textAlign='center';c.fillText('★',x+s*.8,y+s*.9);}
    c.restore();
  }
  function smallIcon(c,name){
    if(name==='leaf'){leaf(c,16,16,8,12,.6,'#719640');return;}
    if(name==='gear'){for(let i=0;i<8;i++){const a=i*Math.PI/4;c.save();c.translate(16,16);c.rotate(a);rounded(c,-2.8,-14,5.6,8,1,'#a98148');c.restore();}ellipse(c,16,16,10.5,10.5,grad(c,4,4,24,'#c8a26a','#8b693c'));ellipse(c,16,16,6.7,6.7,'#d3a66c');ellipse(c,16,16,2.6,2.6,'#6a512e');return;}
    if(name==='craft'){line(c,7,27,24,7,'#a97a47',4);line(c,6,6,26,26,'#cb9c62',4);c.save();c.translate(7,7);c.rotate(-.75);rounded(c,-5,-3,11,7,2,grad(c,-5,-3,7,'#c9cac0','#7c8881'));c.restore();poly(c,[[21,5],[27,9],[11,24],[6,20]],'#b2b9ae');for(let i=0;i<5;i++)line(c,10+i*3,23-i*3,8+i*3,21-i*3,'#e1dfcc',1);return;}
    if(name==='help'){c.beginPath();c.moveTo(8,10);c.bezierCurveTo(7,1,26,1,25,11);c.bezierCurveTo(25,17,16,17,16,22);c.lineCap='round';c.lineWidth=5;c.strokeStyle=grad(c,7,3,25,'#dbb176','#9f713f');c.stroke();ellipse(c,16,28,2.6,2.6,'#bd8d52');return;}
    if(name==='music'){line(c,11,25,11,8,'#a5733d',3.5);line(c,26,21,26,4,'#a5733d',3.5);line(c,11,8,26,4,'#d2a164',4.2);ellipse(c,7.5,25.5,5,3.4,grad(c,3,22,8,'#d4a16b','#9c6637'));ellipse(c,22.5,21.5,5,3.4,grad(c,18,18,8,'#d4a16b','#9c6637'));return;}
    if(name==='octopus'){for(let i=0;i<6;i++){c.beginPath();c.moveTo(16,19);c.quadraticCurveTo(4+i*5,31,3+i*5,23);c.strokeStyle='#b88b98';c.lineWidth=3.7;c.lineCap='round';c.stroke();}ellipse(c,16,13,9,10,grad(c,0,3,21,'#d5acb2','#aa7d91'));ellipse(c,13,15,1,1.3,'#504653');ellipse(c,19,15,1,1.3,'#504653');return;}
    if(name==='crab'){for(let i=0;i<3;i++){line(c,10,15+i*3,3,14+i*5,'#ba7a59',2);line(c,22,15+i*3,29,14+i*5,'#ba7a59',2);}ellipse(c,16,18,9,7,grad(c,0,10,15,'#dfab77','#b87956'));for(const x of [5,27]){line(c,x,16,x,7,'#c38962',2);ellipse(c,x,6,4,4,'#dda879');}ellipse(c,12,13,1.2,1.7,'#4e4e3e');ellipse(c,20,13,1.2,1.7,'#4e4e3e');return;}
    if(name==='sun'){for(let i=0;i<8;i++){const a=i*Math.PI/4;line(c,16+Math.cos(a)*11,16+Math.sin(a)*11,16+Math.cos(a)*14,16+Math.sin(a)*14,'#d7a04b',1.7);}ellipse(c,16,16,8,8,grad(c,0,7,17,'#ffe9a2','#efbb60'));return;}
    if(name==='hand'){c.save();c.translate(16,16);c.rotate(-.18);c.translate(-16,-16);c.lineWidth=.65;for(let i=0;i<4;i++)rounded(c,10+i*3.5,3+Math.abs(1.5-i)*2.4,3.5,17,1.8,grad(c,0,3,22,'#f6dabc','#d0a47b'),'#bb8c67');rounded(c,10,16,14,12,5,grad(c,0,15,14,'#edcba8','#d8ae87'),'#bb8c67');c.save();c.translate(10,19);c.rotate(-.5);rounded(c,-3,-4,5,11,2.5,'#ebc5a0','#bb8c67');c.restore();rounded(c,10,27,13,4,1,'#7d9a91');line(c,14,22,19,20,'#bd926d',.6);c.restore();return;}
    if(name==='book'){rounded(c,5,3,23,27,3,'#735c45');rounded(c,8,4,19,24,2,grad(c,0,0,28,'#a4b6a2','#6e8d7e'));rounded(c,5,4,4,24,1,'#9e7b52');line(c,11,10,23,10,'#e6d6b2',1.2);line(c,11,14,21,14,'#e6d6b2',1);line(c,11,18,22,18,'#e6d6b2',1);poly(c,[[20,3],[24,3],[24,11],[22,9],[20,11]],'#c88d6c');return;}
    if(name==='map'){poly(c,[[3,6],[11,3],[21,7],[29,4],[29,27],[21,30],[11,26],[3,29]],'#e6cea4');line(c,11,5,11,25,'#b9a17d',.7);line(c,21,8,21,28,'#b9a17d',.7);line(c,5,21,13,14,'#84a581',3);line(c,13,14,24,20,'#84a581',3);ellipse(c,23,12,3,3,'#c47b61');return;}
    if(name==='heart'){c.beginPath();c.moveTo(16,28);c.bezierCurveTo(1,18,1,7,9,6);c.bezierCurveTo(13,5,15,8,16,10);c.bezierCurveTo(20,2,29,6,29,13);c.bezierCurveTo(29,19,20,26,16,28);c.fillStyle=grad(c,0,5,25,'#e9a89d','#be7772');c.fill();return;}
    if(name==='wood'){c.save();c.translate(16,16);c.rotate(-.6);rounded(c,-12,-6,24,13,4,grad(c,0,-6,13,'#c79962','#8d623e'));ellipse(c,10,0,3,6,'#e2bc83');ellipse(c,10,0,1.8,3.8,null);c.strokeStyle='#ad8253';c.lineWidth=.7;c.stroke();c.restore();return;}
    if(['egg','milk','wool','cheese','jam','bread','flour','hay','bait','bomb','fertilizer'].includes(name)){
      if(name==='egg'){ellipse(c,16,17,8,11,grad(c,7,5,23,'#fff3d7','#d4c3a4'));return;}
      if(name==='milk'){rounded(c,9,8,14,22,4,grad(c,0,8,23,'#f5f2dc','#c5d4cb'));rounded(c,12,3,8,7,2,'#bfccbd');rounded(c,11,15,10,8,2,'#91a7a2');return;}
      if(name==='cheese'){poly(c,[[6,25],[6,13],[26,7],[27,25]],grad(c,0,7,19,'#f3d182','#c7a258'));for(const [x,y]of [[12,20],[19,15],[22,22]])ellipse(c,x,y,2,1.7,'#b68e42');return;}
      if(name==='jam'){rounded(c,7,7,18,23,5,grad(c,0,6,25,'#c87d78','#95605e'));rounded(c,7,5,18,5,2,'#d3b382');rounded(c,9,16,14,8,2,'#ead7b0');return;}
      if(name==='bomb'){ellipse(c,16,21,10,10,grad(c,6,11,20,'#80928a','#3e514d'));line(c,16,11,19,5,'#b9a77b',2);ellipse(c,20,4,2,2,'#e5ae61');return;}
      if(name==='wool'){for(let i=0;i<13;i++){const a=i*2.4;ellipse(c,16+Math.cos(a)*7,17+Math.sin(a)*7,5,4,'#e8dfcc');}return;}
      if(name==='hay'){sprite(c,'items',12,16,30,23,27);return;}
      rounded(c,6,8,20,22,5,grad(c,0,8,22,'#e6c898','#b99265'));rounded(c,5,6,22,5,2,'#d7b98c');leaf(c,16,19,4,6,.6);return;
    }
    if(name==='tomato'){ellipse(c,16,20,10,9,grad(c,5,11,19,'#e7a17b','#c07257'));for(let i=0;i<5;i++)leaf(c,16+Math.cos(i*1.26)*3,12+Math.sin(i*1.26)*2,3,1.3,i*1.26,'#729147');return;}
    if(name==='pearlflower'){draw(c,'flower',16,30,{scale:1.8});return;}
    if(name==='berry'){for(const [xx,yy]of [[11,21],[20,21],[16,14]])ellipse(c,xx,yy,5,5,grad(c,0,yy-5,10,'#dc9b8b','#b96868'));leaf(c,19,7,4,2,-.4);return;}
    if(name.includes('ore')||['copper','iron','gold','coal','gem','stone'].includes(name)){draw(c,name==='stone'?'rock':name.replace('-ore',''),16,29,{scale:1});return;}
    if(name.includes('bar')){poly(c,[[5,21],[11,10],[25,10],[28,21],[23,26],[5,26]],grad(c,0,8,20,name.includes('gold')?'#eac474':name.includes('iron')?'#aab9b4':'#d5a07a','#826e5e'));return;}
    rounded(c,6,7,20,22,4,grad(c,0,7,22,'#e6c593','#b68f61'));leaf(c,16,18,5,3,-.6);
  }
  function soil(c,x,y,wet=false,neighbors={}){
    // Loosened earth is a collection of irregular clods, not bordered boards.
    const n=neighbors&&typeof neighbors==='object'?neighbors:{};
    const tx=((Math.floor(x/24)%8)+8)%8,ty=((Math.floor(y/24)%8)+8)%8;
    const key='earth-mound-v3:'+tx+','+ty+':'+(+wet)+':'+(+!!n.down);
    let tile=cache.get(key);
    if(!tile){
      tile=document.createElement('canvas');tile.width=tile.height=104;
      const p=tile.getContext('2d');p.scale(4,4);p.translate(1,1);
      let seed=((tx+1)*73856093^(ty+1)*19349663)>>>0;
      const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const l=.85+rand()*.35,r=23.05-rand()*.3,t=1.0+rand()*.35,b=22.8+rand()*.25;
      const shape=()=>{p.beginPath();p.moveTo(l+2.6,t);p.bezierCurveTo(7,t-.5,8,t+.55,12,t+.12);p.bezierCurveTo(15,t-.3,18,t+.45,r-2.3,t+.15);p.quadraticCurveTo(r+.4,t+.6,r-.2,t+3);p.bezierCurveTo(r+.55,7,r-.35,10,r+.25,13);p.bezierCurveTo(r-.4,16,r+.5,19,r-.3,b-1.7);p.quadraticCurveTo(r-.3,b+.3,r-2.8,b);p.bezierCurveTo(17,b+.65,15,b-.25,11,b+.35);p.bezierCurveTo(8,b-.3,5,b+.4,l+2.2,b-.2);p.quadraticCurveTo(l-.25,b-.2,l,b-2.3);p.bezierCurveTo(l+.5,17,l-.5,14,l+.18,11);p.bezierCurveTo(l-.3,7,l+.65,5,l+.25,t+2);p.quadraticCurveTo(l+.45,t+.3,l+2.6,t);p.closePath();};
      p.save();p.translate(.15,.9);shape();p.fillStyle=wet?'#2f2a1c32':'#4b39232b';p.fill();p.restore();
      shape();p.clip();p.fillStyle=wet?'#624b35':'#9b744f';p.fillRect(0,0,24,24);
      // Full-strength photographed/generated earth material; multiply changes
      // moisture/color while retaining every granular highlight and crevice.
      const texture=groundTexture('earth');if(texture){
        const sw=texture.width/8,sh=texture.height/8;
        p.drawImage(texture,tx*sw,ty*sh,sw,sh,0,0,24,24);
        p.globalCompositeOperation='multiply';p.fillStyle=wet?'#70838d':'#a5b3c2';p.fillRect(0,0,24,24);p.globalCompositeOperation='source-over';
      }
      const depth=p.createLinearGradient(0,0,4,24);depth.addColorStop(0,wet?'#b9a27c1c':'#e8c79221');depth.addColorStop(.55,'#00000000');depth.addColorStop(1,wet?'#241e1950':'#49322145');p.fillStyle=depth;p.fillRect(0,0,24,24);
      // The lower silhouette is the rounded SIDE of a heaped clay earth patch.
      // Broken upper ridges are piles of soil, never a rectangular inset border.
      p.lineCap='round';p.beginPath();p.moveTo(3.4,b-1.2);p.bezierCurveTo(8,b+.1,13,b-1.15,20.3,b-.75);p.strokeStyle=wet?'#352b22af':'#67472d95';p.lineWidth=2.5;p.stroke();
      for(let edge=0;edge<3;edge++){
        const ex=3.0+edge*6.3,ey=t+1.0+(edge%2)*.25;
        p.beginPath();p.moveTo(ex,ey+.6);p.quadraticCurveTo(ex+2.4,ey-.75,ex+4.8,ey+.15);p.lineWidth=2.25;p.strokeStyle=wet?'#93724fbb':'#bb925ecc';p.stroke();
        p.beginPath();p.moveTo(ex+.5,ey+.05);p.quadraticCurveTo(ex+2.5,ey-.4,ex+3.9,ey+.05);p.lineWidth=.65;p.strokeStyle=wet?'#b49a6b80':'#dfba818a';p.stroke();
      }
      p.beginPath();p.moveTo(l+1.1,5.2);p.quadraticCurveTo(l-.1,9.5,l+1.15,12);p.strokeStyle=wet?'#8b6b4a91':'#bf966291';p.lineWidth=2.1;p.stroke();
      // Short, disconnected curved furrows. No line reaches an adjacent tile.
      p.lineCap='round';for(let j=0;j<5;j++){
        const xx=3+rand()*12,yy=4+rand()*15,len=3.0+rand()*4.4,curve=(rand()-.5)*2.6;
        p.beginPath();p.moveTo(xx,yy);p.quadraticCurveTo(xx+len*.45,yy+curve,xx+len,yy+(rand()-.5)*.7);p.strokeStyle=wet?'#2d251eae':'#4b34249a';p.lineWidth=1.5+rand()*.9;p.stroke();
      }
      // Tiny raised clods produce earthy volume rather than a regular wood grain.
      for(let j=0;j<18;j++){
        const xx=2.0+rand()*20,yy=2.2+rand()*19.6,rx=.52+rand()*1.02,ry=.42+rand()*.68;
        ellipse(p,xx+.2,yy+.38,rx*1.08,ry*.88,wet?'#30281f4d':'#573b254a');
        p.beginPath();p.moveTo(xx-rx,yy+.1);p.quadraticCurveTo(xx-rx*.7,yy-ry,xx+.1,yy-ry*.83);p.quadraticCurveTo(xx+rx*1.05,yy-ry*.45,xx+rx,yy+.1);p.quadraticCurveTo(xx+rx*.35,yy+ry,xx-rx*.75,yy+ry*.45);p.closePath();
        p.fillStyle=wet?(j%3?'#967653':'#73563b'):(j%3?'#bb9566':'#9a714b');p.fill();
        if(j%3===0)ellipse(p,xx-rx*.3,yy-ry*.4,rx*.45,ry*.2,wet?'#a78b5f45':'#d6ae7759');
      }
      for(let j=0;j<17;j++){const xx=1+rand()*22,yy=1+rand()*22;ellipse(p,xx,yy,.14+rand()*.2,.12+rand()*.12,j%2?(wet?'#c4ad7e3b':'#edcea64a'):(wet?'#28231c45':'#4d34283b'));}
      cache.set(key,tile);
    }
    c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(tile,x-1,y-1,26,26);c.restore();
  }
  const Art={draw,character,crop,icon,palette:P,size,names:[...Object.keys(sprites),...Object.keys(customSizes)],ready,status,theme:'clay',season:0,soil,sprite,groundTexture,drawFence,uiIcons:Object.keys(uiIndex),itemIcons:Object.keys(goodsIndex)};
  window.Art=Art;
})();
