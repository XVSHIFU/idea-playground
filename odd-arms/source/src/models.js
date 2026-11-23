import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const HEROES = ['cat','frog','shroom','capybara','ramen','penguin','axolotl','avocado','robot','snail'];
const WEAPONS = ['sardine','cactus','plunger','banana','pizza','croissant','boomerang','donut-disc','duck','toaster','teapot','bubble-gun'];
const ENEMIES = ['red-chomper','spring-rabbit','crown-bear'];
const PROPS = ['workbench','mat-frame','corner','lamp','train','spool','rose-box','tool-roll','parts-tray'];
export const SLOT_IDS = [...HEROES.map(x=>'hero:'+x),...WEAPONS.map(x=>'weapon:'+x),...ENEMIES.map(x=>'enemy:'+x),...PROPS.map(x=>'prop:'+x)];
export function targetHeight(slot) { if(slot.startsWith('hero:'))return 2.1;if(slot==='enemy:red-chomper')return 1.35;if(slot==='enemy:spring-rabbit')return 1.6;if(slot==='enemy:crown-bear')return 2.3;return slot.startsWith('weapon:')?1.1:null; }
const geometries=new Map(), materials=new Map();
const colors={cream:0xfff3d5,white:0xf9f3e8,ink:0x162a34,orange:0xf79435,coral:0xf25438,teal:0x36b8b1,green:0x78bf57,yellow:0xffce43,gold:0xc7953e,brown:0x825031,pink:0xf19db6};
function geo(k,fn){if(!geometries.has(k))geometries.set(k,fn());return geometries.get(k);}
function mat(color,metal=0,rough=.27){color=colors[color]??color;const k=[color,metal,rough].join();if(!materials.has(k))materials.set(k,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough}));return materials.get(k);}
function mesh(g,geometry,color,p=[0,0,0],s=[1,1,1],r=[0,0,0],metal=0){const m=new THREE.Mesh(geometry,mat(color,metal));m.position.set(...p);m.scale.set(...s);m.rotation.set(r[0]??0,r[1]??0,r[2]??0);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function ball(g,c,p,s=[1,1,1]){return mesh(g,geo('sphere',()=>new THREE.SphereGeometry(1,20,14)),c,p,s);}
function box(g,c,p,s,r=[0,0,0],metal=0){return mesh(g,geo('roundbox',()=>new RoundedBoxGeometry(1,1,1,3,.12)),c,p,s,r,metal);}
function cyl(g,c,p,s=[1,1,1],r=[0,0,0],metal=0){return mesh(g,geo('cylinder',()=>new THREE.CylinderGeometry(1,1,1,24)),c,p,s,r,metal);}
function cone(g,c,p,s=[1,1,1],r=[0,0,0],metal=0){return mesh(g,geo('cone',()=>new THREE.ConeGeometry(1,1,20)),c,p,s,r,metal);}
function ring(g,c,p,radius=.5,tube=.07,r=[0,0,0],arc=Math.PI*2,metal=0){return mesh(g,geo('torus'+radius+':'+tube+':'+arc,()=>new THREE.TorusGeometry(radius,tube,8,32,arc)),c,p,[1,1,1],r,metal);}
function rod(g,c,a,b,thickness=.06,metal=0){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=cyl(g,c,new THREE.Vector3(...a).addScaledVector(v,.5).toArray(),[thickness,v.length(),thickness],[0,0,0],metal);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
function eye(g,x,y,z,size=.085){ball(g,'ink',[x,y,z],[size,size*1.18,size*.6]);ball(g,'white',[x-size*.22,y+size*.36,z+size*.48],[size*.22,size*.22,size*.13]);}
function face(g,y,z,spread=.25,size=.085){eye(g,-spread,y,z,size);eye(g,spread,y,z,size);ring(g,'ink',[0,y-.18,z],.1,.022,[0,0,Math.PI],Math.PI);}
function feet(g,c='white',y=.15){box(g,c,[-.27,y,.12],[.37,.3,.53]);box(g,c,[.27,y,.12],[.37,.3,.53]);}
function key(g,p=[0,1,-.43],size=.25){rod(g,'gold',p,[p[0],p[1],p[2]-.25],.07,.7);ring(g,'gold',[p[0]-size*.65,p[1],p[2]-.28],size*.6,.06,[0,0,0],Math.PI*2,.7);ring(g,'gold',[p[0]+size*.65,p[1],p[2]-.28],size*.6,.06,[0,0,0],Math.PI*2,.7);}
function gloves(g){ball(g,'coral',[-.69,.84,.24],[.3,.3,.3]);ball(g,'coral',[.69,.84,.24],[.3,.3,.3]);ring(g,'cream',[-.54,.84,.18],.15,.06,[0,Math.PI/2,0]);ring(g,'cream',[.54,.84,.18],.15,.06,[0,Math.PI/2,0]);}
function cat(g,simple){feet(g);ball(g,'white',[0,.72,0],[.48,.63,.36]);box(g,'orange',[0,.42,.05],[.9,.13,.65]);box(g,'teal',[0,.86,.35],[.34,.37,.1]);for(const x of [-.12,0,.12])box(g,'cream',[x,.9,.414],[.055,.07,.025]);for(const x of [-.58,.58]){ball(g,'white',[x,.78,.02],[.16,.4,.18]);ball(g,'orange',[x,.49,.12],[.17,.18,.17]);ball(g,'coral',[x,1.04,.04],[.2,.16,.2]);}
ball(g,'orange',[0,1.53,.04],[.55,.5,.46]);for(const x of [-.36,.36]){cone(g,'orange',[x,1.96,.03],[.23,.43,.2]);cone(g,'pink',[x,1.98,.13],[.12,.27,.08]);}ball(g,'cream',[0,1.34,.4],[.38,.23,.12]);face(g,1.57,.463,.21,.105);ball(g,'pink',[0,1.4,.52],[.068,.05,.043]);ring(g,'teal',[0,1.17,0],.48,.065,[Math.PI/2,0,0]);if(!simple){for(const x of [-.43,.43])for(let i=0;i<3;i++)box(g,'brown',[x,1.53+i*.12,.31],[.12,.045,.04],[0,0,x>0?.25:-.25]);for(let i=-1;i<=1;i++)box(g,'brown',[i*.14,1.91,.26],[.06,.18,.04],[0,0,-i*.2]);box(g,'white',[0,.85,-.4],[.6,.68,.25]);box(g,'teal',[0,.85,-.55],[.38,.36,.09]);const helmet=mesh(g,geo('helmet',()=>new THREE.SphereGeometry(1,32,24)),0xffffff,[0,1.59,0],[.68,.66,.62]);helmet.material=new THREE.MeshPhysicalMaterial({color:0xc9f9ff,transparent:true,opacity:.13,roughness:.06,metalness:.05,depthWrite:false,side:THREE.FrontSide});ring(g,'white',[0,1.16,0],.52,.04,[Math.PI/2,0,0]);ball(g,'white',[-.3,1.96,.48],[.07,.16,.025]);}}
function frog(g){feet(g,'coral');ball(g,'green',[0,.7,0],[.52,.57,.36]);ball(g,'cream',[0,.62,.29],[.36,.4,.1]);ball(g,'green',[0,1.35,.03],[.65,.39,.45]);for(const x of [-.37,.37]){ball(g,'green',[x,1.67,.14],[.25,.26,.23]);eye(g,x,1.7,.347,.11);}ring(g,'ink',[0,1.32,.44],.27,.024,[0,0,Math.PI],Math.PI);gloves(g);}
function shroom(g){feet(g,'brown');ball(g,'cream',[0,.75,0],[.4,.62,.35]);cone(g,'coral',[0,.83,-.25],[.66,.85,.3],[0,0,Math.PI]);ball(g,'coral',[0,1.55,0],[.86,.43,.7]);cyl(g,'cream',[0,1.36,0],[.8,.08,.64]);for(const [x,y,z,sz] of [[-.4,1.72,.4,.17],[.29,1.83,.23,.15],[.05,1.94,-.1,.16],[-.5,1.7,-.3,.13],[.54,1.64,.08,.13]])ball(g,'white',[x,y,z],[sz,.06,sz]);face(g,1.01,.34,.15,.065);}
function capybara(g){cyl(g,0x805942,[0,.28,0],[.8,.55,.72]);cyl(g,'teal',[0,.57,0],[.73,.04,.66]);ball(g,'brown',[0,.88,0],[.52,.5,.42]);ball(g,0xb88a59,[0,1.35,.12],[.57,.4,.45]);ball(g,0xc69b6f,[0,1.19,.43],[.4,.24,.19]);for(const x of [-.37,.37])ball(g,'brown',[x,1.65,0],[.16,.18,.14]);for(const x of [-.23,.23])box(g,'ink',[x,1.4,.54],[.14,.035,.02],[0,0,x*.4]);ball(g,'orange',[0,1.78,.01],[.17,.16,.17]);ball(g,'green',[.05,1.94,0],[.12,.035,.05]);}
function ramen(g){feet(g,'ink');ball(g,'ink',[0,.73,0],[.46,.55,.33]);box(g,'coral',[0,.9,.32],[.57,.54,.1]);ball(g,'cream',[0,1.45,0],[.43,.4,.35]);cyl(g,'ink',[0,1.82,0],[.48,.18,.43]);cone(g,'ink',[0,1.91,0],[.63,.3,.53]);face(g,1.5,.34,.17,.07);box(g,'coral',[0,1.67,.36],[.7,.08,.04]);ball(g,'white',[0,.92,.65],[.51,.3,.4]);cyl(g,'gold',[0,1.09,.65],[.47,.06,.36]);for(let i=0;i<7;i++)ring(g,'yellow',[(i-3)*.09,1.14,.65],.13,.022,[Math.PI/2,0,0]);rod(g,'brown',[.24,1.17,.62],[.57,1.7,.6],.025);rod(g,'brown',[.31,1.17,.62],[.65,1.7,.6],.025);ball(g,'green',[-.2,1.15,.69],[.13,.06,.1]);ball(g,'white',[.12,1.36,.6],[.07,.16,.07]);}
function penguin(g){feet(g,'orange');ball(g,'ink',[0,.92,0],[.55,.8,.4]);ball(g,'white',[0,.75,.29],[.43,.59,.13]);ball(g,'ink',[0,1.55,0],[.45,.43,.37]);ball(g,'white',[0,1.43,.28],[.36,.29,.14]);eye(g,-.17,1.57,.39,.075);eye(g,.17,1.57,.39,.075);cone(g,'orange',[0,1.42,.51],[.14,.3,.09],[Math.PI/2,0,0]);box(g,'coral',[0,.89,.43],[.11,.43,.045],[0,0,.05]);box(g,'coral',[0,1.13,.42],[.16,.13,.04],[0,0,.7]);for(const x of [-.53,.53])ball(g,'ink',[x,.9,0],[.14,.44,.24]);box(g,'brown',[.75,.5,0],[.4,.48,.2]);}
function axolotl(g){feet(g,'pink');ball(g,'pink',[0,.67,0],[.39,.49,.34]);ball(g,0xffc6d4,[0,.7,.28],[.26,.3,.09]);ball(g,'pink',[0,1.4,0],[.61,.46,.43]);face(g,1.4,.42,.23,.08);for(const s of [-1,1]){for(let i=0;i<3;i++){rod(g,'coral',[s*.5,1.32+i*.12,0],[s*(.8+(i===1?.1:0)),1.06+i*.3,.01],.065);ball(g,'coral',[s*(.8+(i===1?.1:0)),1.06+i*.3,.01],[.09,.09,.09]);}ball(g,'pink',[s*.47,.66,.03],[.12,.3,.13]);}box(g,'teal',[0,.7,-.36],[.6,.6,.22]);}
function avocado(g){feet(g,'green');ball(g,0x236c40,[0,1,0],[.6,.95,.39]);ball(g,0xb5d95a,[0,1,.28],[.5,.81,.18]);ball(g,0x9e542c,[0,.73,.43],[.29,.31,.14]);face(g,1.46,.4,.18,.085);gloves(g);}
function robot(g,simple){feet(g,'coral');box(g,'teal',[0,.8,0],[.87,.88,.56],[],.45);box(g,'cream',[0,.85,.31],[.6,.56,.08],[],.4);for(let i=0;i<3;i++)box(g,'ink',[0,.72+i*.1,.36],[.35,.025,.02]);box(g,'teal',[0,1.55,0],[1,.66,.62],[],.45);for(const x of [-.26,.26]){cyl(g,'gold',[x,1.6,.34],[.15,.08,.15],[Math.PI/2,0,0],.6);ball(g,'cream',[x,1.6,.4],[.09,.1,.04]);box(g,'teal',[x*2.5,.77,0],[.25,.55,.3]);ball(g,'gold',[x*2.5,.47,0],[.17,.17,.18]);}box(g,'ink',[0,1.35,.33],[.36,.09,.03]);rod(g,'gold',[0,1.9,0],[0,2.13,0],.05,.5);ball(g,'coral',[0,2.17,0],[.11,.11,.11]);key(g,[0,1,-.37],.33);}
function snail(g){ball(g,'teal',[0,.25,.2],[.83,.25,.63]);ball(g,'teal',[0,.62,.62],[.34,.51,.32]);ball(g,'brown',[0,.85,-.12],[.75,.76,.61]);ring(g,'gold',[0,.87,.49],.47,.08);ring(g,'gold',[0,.87,.5],.24,.075);ball(g,'gold',[0,.87,.51],[.1,.1,.05]);for(const x of [-.2,.2]){rod(g,'teal',[x,.95,.62],[x*1.25,1.37,.69],.065);ball(g,'cream',[x*1.25,1.4,.7],[.13,.14,.13]);eye(g,x*1.25,1.41,.81,.065);}cone(g,0xb4cad2,[0,1.02,.61],[.43,.29,.4],[],.6);box(g,'coral',[0,1.24,.58],[.1,.28,.38]);}
function weapon(g,id,simple){
if(id==='banana'||id==='croissant'){const c=id==='banana'?'yellow':0xc78536;ring(g,c,[0,.6,0],.6,id==='banana'?.13:.22,[0,0,-.15],Math.PI*1.05);for(const x of [-.6,.6])box(g,'ink',[x,.43,.01],[.15,.3,.13],[0,0,x]);if(id==='croissant')for(let i=1;i<6;i++){const a=i/6*Math.PI;ring(g,0xf3be67,[Math.cos(a)*.6,Math.sin(a)*.6+.6,0],.17,.026,[0,a,0]);}}
else if(id==='boomerang'){box(g,'orange',[-.24,.6,0],[.22,1,.13],[0,0,-.65]);box(g,'teal',[.24,.6,0],[.22,1,.13],[0,0,.65]);box(g,'cream',[0,.94,0],[.28,.17,.15]);}
else if(id==='donut-disc'){ring(g,0xc18b51,[0,.65,0],.47,.24);ring(g,'pink',[0,.65,.12],.46,.19);for(let i=0;i<14;i++){const a=i*2.4;box(g,i%2?'cream':'teal',[Math.cos(a)*.46,.65+Math.sin(a)*.46,.3],[.08,.027,.025],[0,0,a]);}}
else if(id==='pizza'){cyl(g,'gold',[0,.6,0],[.6,.15,.6],[Math.PI/2,0,0]);cyl(g,'yellow',[0,.6,.09],[.51,.05,.51],[Math.PI/2,0,0]);for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(g,'coral',[Math.cos(a)*.32,.6+Math.sin(a)*.32,.14],[.1,.1,.035]);}}
else if(id==='sardine'){ball(g,0x9ab8be,[0,.55,0],[.23,.62,.19]);cone(g,'teal',[0,1.19,0],[.36,.3,.12]);eye(g,.11,.23,.15,.05);for(let i=0;i<7;i++)cone(g,'white',[-.2,.22+i*.11,0],[.08,.13,.09],[0,0,-Math.PI/2]);}
else if(id==='cactus'){cyl(g,'brown',[0,.25,0],[.12,.5,.12]);ball(g,'green',[0,.81,0],[.24,.5,.23]);rod(g,'green',[-.18,.75,0],[-.42,.75,0],.1);rod(g,'green',[-.42,.75,0],[-.42,1.04,0],.1);rod(g,'green',[.15,.95,0],[.37,1.05,0],.1);for(let i=0;i<8;i++){const a=i*2.4;cone(g,'cream',[Math.cos(a)*.24,.53+i*.07,Math.sin(a)*.24],[.035,.14,.035],[Math.sin(a)*1.5,0,Math.cos(a)*-1.5]);}}
else if(id==='plunger'){cyl(g,'brown',[0,.79,0],[.065,.9,.065]);ball(g,'coral',[0,.23,0],[.4,.28,.4]);cyl(g,'coral',[0,.1,0],[.43,.12,.43]);}
else if(id==='duck'){ball(g,'yellow',[0,.46,0],[.49,.39,.39]);ball(g,'yellow',[0,.95,.18],[.3,.29,.3]);box(g,'orange',[0,.89,.48],[.25,.12,.3]);eye(g,-.17,1.01,.4,.055);eye(g,.17,1.01,.4,.055);ball(g,'gold',[-.38,.5,.01],[.16,.24,.27]);box(g,'teal',[0,.4,-.4],[.4,.45,.35]);cone(g,'coral',[0,.4,-.74],[.2,.4,.2],[-Math.PI/2,0,0]);}
else if(id==='toaster'){box(g,'coral',[0,.53,0],[1.05,.77,.63]);box(g,'cream',[0,.18,0],[1.13,.2,.69]);for(const x of [-.35,.35])box(g,'ink',[x,.06,0],[.17,.13,.4]);for(const z of [-.15,.15]){box(g,'ink',[0,.92,z],[.77,.035,.09]);box(g,'gold',[0,1.01,z],[.57,.33,.08]);box(g,'cream',[0,1.04,z+.05],[.45,.22,.025]);}eye(g,-.25,.57,.33,.09);eye(g,.25,.57,.33,.09);box(g,'ink',[-.25,.72,.35],[.27,.055,.035],[0,0,-.35]);box(g,'ink',[.25,.72,.35],[.27,.055,.035],[0,0,.35]);box(g,'ink',[0,.36,.34],[.22,.06,.025]);}
else if(id==='teapot'){ball(g,'white',[0,.58,0],[.49,.45,.42]);cyl(g,'teal',[0,.96,0],[.35,.08,.3]);ball(g,'teal',[0,1.07,0],[.09,.1,.09]);ring(g,'teal',[-.49,.62,0],.29,.075);cone(g,'white',[.53,.68,0],[.12,.65,.12],[0,0,-.8]);face(g,.67,.42,.18,.065);for(const x of [-.22,0,.22])ball(g,'teal',[x,.42,.38],[.045,.045,.02]);}
else if(id==='bubble-gun'){box(g,'pink',[0,.67,0],[.73,.43,.45]);box(g,'teal',[-.13,.29,0],[.2,.45,.26],[0,0,-.2]);cyl(g,'teal',[.47,.67,0],[.22,.27,.22],[0,0,Math.PI/2]);ring(g,'yellow',[.63,.67,0],.17,.05,[0,Math.PI/2,0]);ball(g,'teal',[-.21,1,0],[.22,.25,.22]);ball(g,0xb9e7ff,[.83,.93,0],[.12,.12,.12]);}
}
function enemy(g,id,simple){if(id==='red-chomper'){ball(g,'coral',[0,.62,0],[.59,.55,.49]);box(g,'ink',[0,.44,.43],[.83,.35,.12]);for(const x of [-.29,-.1,.1,.29]){cone(g,'cream',[x,.55,.51],[.11,.18,.04],[0,0,Math.PI]);cone(g,'cream',[x,.34,.51],[.1,.16,.04]);}eye(g,-.22,.82,.43,.095);eye(g,.22,.82,.43,.095);feet(g,'gold',.07);key(g,[0,.9,-.4],.22);}else if(id==='spring-rabbit'){ball(g,'yellow',[0,.99,0],[.46,.39,.35]);for(const x of [-.25,.25]){ball(g,'yellow',[x,1.55,0],[.13,.5,.14]);ball(g,'pink',[x,1.55,.12],[.065,.34,.025]);}face(g,1.02,.35,.18,.075);ball(g,'cream',[0,.84,.35],[.2,.13,.075]);for(let i=0;i<5;i++)ring(g,'gold',[0,.19+i*.12,0],.21,.045,[Math.PI/2,0,0],Math.PI*2,.7);box(g,'gold',[0,.06,0],[.63,.14,.45]);key(g,[0,1,-.3],.2);}else{ball(g,'brown',[0,.87,0],[.62,.76,.45]);ball(g,0xb58452,[0,.81,.34],[.4,.5,.16]);ball(g,'brown',[0,1.67,0],[.62,.52,.43]);for(const x of [-.47,.47])ball(g,0xb58452,[x,2.03,0],[.23,.24,.19]);ball(g,0xc29b70,[0,1.52,.42],[.29,.21,.13]);face(g,1.76,.41,.23,.085);ball(g,'ink',[0,1.62,.56],[.09,.06,.05]);feet(g,'brown');for(const x of [-.7,.7])ball(g,'brown',[x,.9,0],[.25,.44,.26]);cyl(g,'gold',[0,2.19,0],[.35,.2,.3],[],.6);for(let i=0;i<5;i++){let a=i/5*Math.PI*2;cone(g,'gold',[Math.cos(a)*.28,2.42,Math.sin(a)*.24],[.12,.4,.12],[],.6);}box(g,'teal',[-.3,.92,.48],[.24,.25,.025],[0,0,.3]);key(g,[0,1.2,-.4],.3);}}
function prop(g,id,simple){
if(id==='workbench'){box(g,0xa9663d,[0,-.95,0],[67,1.8,67]);for(let i=-6;i<=6;i++)box(g,0xb77646,[i*5,-.025,0],[4.94,.035,66]);}
else if(id==='mat-frame'){for(const z of [-24.5,24.5])box(g,'gold',[0,0,z],[50,.18,.3],[],.6);for(const x of [-24.5,24.5])box(g,'gold',[x,0,0],[.3,.18,49],[],.6);}
else if(id==='corner'){box(g,'gold',[0,0,0],[2.8,.2,2.8],[],.7);ring(g,'gold',[0,.16,0],.83,.12,[Math.PI/2,0,0],Math.PI*2,.7);for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(g,0xf5c66d,[Math.cos(a)*.6,.18,Math.sin(a)*.6],[.3,.1,.25]);}}
else if(id==='spool'){cyl(g,'brown',[0,.18,0],[1.55,.35,1.55]);cyl(g,'coral',[0,1.9,0],[1.17,3.4,1.17]);cyl(g,'brown',[0,3.7,0],[1.55,.3,1.55]);cyl(g,'gold',[0,3.88,0],[.8,.09,.8]);if(!simple)for(let i=0;i<22;i++)ring(g,0xf97b61,[0,.42+i*.14,0],1.17,.035,[Math.PI/2,0,0]);}
else if(id==='rose-box'){box(g,'coral',[0,1.3,0],[3.3,2.6,3.3]);for(const y of [.1,2.6])box(g,'gold',[0,y,0],[3.45,.16,3.45],[],.6);for(const x of [-1.6,1.6])for(const z of [-1.6,1.6])rod(g,'gold',[x,0,z],[x,2.7,z],.06,.7);for(let i=0;i<8;i++){let a=i*Math.PI/4;ball(g,'gold',[Math.cos(a)*.6,1.35+Math.sin(a)*.6,1.72],[.32,.25,.12]);}ball(g,'gold',[0,1.35,1.8],[.4,.4,.15]);ring(g,'gold',[0,1.35,1.72],1,.1,[],Math.PI*2,.7);}
else if(id==='lamp'){cyl(g,'gold',[0,.2,0],[1.7,.4,1.7],[],.7);rod(g,'gold',[0,.3,0],[0,4,0],.16,.7);rod(g,'gold',[0,4,0],[2.3,7,0],.15,.7);rod(g,'gold',[.3,4,0],[2.6,7,0],.09,.7);rod(g,'gold',[2.4,7,0],[5,6,0],.13,.7);ball(g,'gold',[2.4,7,0],[.27,.27,.27]);const sh=mesh(g,geo('shade',()=>new THREE.CylinderGeometry(.45,1.6,1.3,32,1,true)), 'gold',[5,5.5,0],[1,1,1],[],.75);sh.material=mat('gold',.7);ball(g,'cream',[5,5.03,0],[1.1,.15,1.1]);}
else if(id==='train'){box(g,'coral',[0,.55,0],[7,.55,2.7]);cyl(g,'teal',[1.1,1.8,0],[1.05,3.7,1.05],[0,0,Math.PI/2],.2);box(g,'teal',[-2.3,2,0],[2.2,2.5,2.4]);box(g,'gold',[-2.3,3.4,0],[2.8,.2,2.9]);for(const z of [-1.23,1.23]){box(g,'ink',[-2.3,2.4,z],[1.3,1.2,.04]);for(const x of [-2.4,2]){cyl(g,'gold',[x,.58,z*1.1],[.73,.23,.73],[Math.PI/2,0,0],.6);cyl(g,'brown',[x,.58,z*1.2],[.48,.1,.48],[Math.PI/2,0,0]);}}cyl(g,'gold',[1.7,3,0],[.32,1.3,.32],[],.6);ring(g,'gold',[2.98,1.8,0],.99,.09,[0,Math.PI/2,0],Math.PI*2,.7);}
else if(id==='tool-roll'){box(g,'brown',[0,.15,0],[4.5,.3,8]);for(let i=0;i<5;i++){let z=(i-2)*1.35;box(g,0x9c633b,[-.8,.38,z],[2.4,.18,.75]);rod(g,'gold',[0,.5,z],[1.8,.5,z],.1,.7);box(g,'ink',[1.85,.5,z],[.62,.3,.28]);}for(const z of [-3.4,3.4])box(g,'gold',[0,.4,z],[4.7,.2,.3]);}
else if(id==='parts-tray'){cyl(g,'gold',[0,.15,0],[3,.3,2.5],[],.7);ring(g,'brown',[0,.35,0],2.7,.18,[Math.PI/2,0,0]);for(let i=0;i<12;i++){const a=i*2.4,r=.5+(i%3)*.65;ball(g,[0x36b8b1,0xf25438,0xffce43][i%3],[Math.cos(a)*r,.55,Math.sin(a)*r],[.35,.3,.35]);}for(let i=0;i<4;i++)ring(g,'gold',[-1+i*.7,.7,.3],.35,.1,[Math.PI/2,.3*i,0],Math.PI*2,.7);}}

// Lightweight comparison models use a small, intentionally geometric vocabulary.
function simpleBall(g,c,p,s){return mesh(g,geo('simpleSphere',()=>new THREE.SphereGeometry(1,10,7)),c,p,s);}
function simpleBox(g,c,p,s,r=[]){return mesh(g,geo('simpleBox',()=>new THREE.BoxGeometry(1,1,1)),c,p,s,r);}
function simpleEyes(g,y,z,spread=.2){for(const x of [-spread,spread])simpleBall(g,'ink',[x,y,z],[.075,.09,.05]);}
function simpleModel(g,type,id){
 const b=(c,p,s)=>simpleBall(g,c,p,s),q=(c,p,s,r)=>simpleBox(g,c,p,s,r);
 if(type==='hero'){
  if(id==='cat'){b('white',[0,.65,0],[.42,.58,.35]);b('orange',[0,1.45,0],[.5,.45,.4]);for(const x of [-.32,.32])cone(g,'orange',[x,1.91,0],[.2,.37,.18]);q('teal',[0,.72,.35],[.28,.3,.06]);simpleEyes(g,1.47,.37);for(const x of [-.28,.28])q('white',[x,.1,.07],[.34,.2,.46]);ring(g,'teal',[0,1.12,0],.45,.07,[Math.PI/2,0,0]);}
  else if(id==='frog'){b('green',[0,.65,0],[.48,.58,.34]);b('green',[0,1.3,0],[.62,.34,.4]);for(const x of [-.33,.33])b('green',[x,1.57,.1],[.22,.22,.2]);simpleEyes(g,1.6,.29,.33);for(const x of [-.65,.65])b('coral',[x,.7,.15],[.26,.26,.26]);}
  else if(id==='shroom'){b('cream',[0,.68,0],[.33,.6,.3]);b('coral',[0,1.4,0],[.8,.38,.65]);q('coral',[0,.68,-.24],[.7,.9,.1]);b('white',[-.3,1.65,.23],[.17,.06,.16]);simpleEyes(g,.9,.29,.14);}
  else if(id==='capybara'){cyl(g,'brown',[0,.25,0],[.7,.5,.65]);cyl(g,'teal',[0,.51,0],[.65,.03,.6]);b('brown',[0,.85,0],[.45,.45,.37]);b(0xb88a59,[0,1.3,.08],[.5,.34,.4]);b('orange',[0,1.77,0],[.16,.16,.16]);simpleEyes(g,1.35,.45);for(const x of [-.33,.33])b('brown',[x,1.59,0],[.12,.15,.12]);}
  else if(id==='ramen'){q('ink',[0,.6,0],[.7,.9,.5]);b('cream',[0,1.35,0],[.4,.4,.33]);cone(g,'ink',[0,1.79,0],[.62,.3,.5]);simpleEyes(g,1.4,.31,.16);b('white',[0,.86,.49],[.5,.25,.33]);cyl(g,'yellow',[0,1.04,.49],[.46,.04,.31]);rod(g,'brown',[.25,1.05,.48],[.6,1.55,.48],.03);}
  else if(id==='penguin'){b('ink',[0,.91,0],[.5,.8,.38]);b('white',[0,.8,.3],[.37,.55,.12]);b('ink',[0,1.5,0],[.4,.39,.33]);simpleEyes(g,1.55,.33,.16);cone(g,'orange',[0,1.36,.43],[.14,.29,.09],[Math.PI/2,0,0]);q('coral',[0,.86,.43],[.12,.43,.03]);for(const x of [-.25,.25])q('orange',[x,.08,.15],[.34,.16,.42]);}
  else if(id==='axolotl'){b('pink',[0,.65,0],[.36,.52,.3]);b('pink',[0,1.3,0],[.58,.4,.4]);simpleEyes(g,1.34,.38);for(const s of [-1,1])for(const y of [1.08,1.37,1.62])rod(g,'coral',[s*.45,1.3,0],[s*.8,y,0],.07);q('teal',[0,.68,-.35],[.5,.5,.18]);}
  else if(id==='avocado'){b('green',[0,.9,0],[.6,.89,.38]);b(0xb5d95a,[0,.95,.3],[.47,.72,.13]);b('brown',[0,.65,.42],[.28,.3,.12]);simpleEyes(g,1.4,.38);for(const x of [-.7,.7])b('coral',[x,.75,.1],[.25,.25,.25]);}
  else if(id==='robot'){q('teal',[0,.68,0],[.76,.9,.5]);q('teal',[0,1.43,0],[.95,.6,.6]);simpleEyes(g,1.47,.33,.24);q('cream',[0,.78,.28],[.46,.43,.05]);for(const x of [-.25,.25])q('coral',[x,.08,.07],[.3,.16,.43]);q('gold',[0,1,-.47],[.65,.15,.18]);q('gold',[0,1,-.5],[.14,.5,.16]);}
  else if(id==='snail'){b('teal',[0,.22,.1],[.8,.22,.62]);b('brown',[0,.85,-.1],[.7,.72,.57]);ring(g,'gold',[0,.85,.47],.4,.07);b('teal',[0,.64,.57],[.31,.46,.28]);for(const x of [-.21,.21]){rod(g,'teal',[x,.8,.57],[x,1.32,.61],.06);b('cream',[x,1.35,.63],[.12,.12,.12]);}simpleEyes(g,1.35,.74,.21);cone(g,'gold',[0,1.04,.56],[.37,.25,.33]);}
 } else if(type==='enemy'){
  if(id==='red-chomper'){b('coral',[0,.56,0],[.58,.53,.48]);q('ink',[0,.42,.43],[.8,.3,.09]);for(const x of [-.25,0,.25])cone(g,'cream',[x,.5,.5],[.12,.17,.05],[0,0,Math.PI]);simpleEyes(g,.8,.4,.22);q('gold',[0,.07,0],[.7,.14,.43]);q('gold',[0,1.1,-.1],[.38,.12,.1]);}
  else if(id==='spring-rabbit'){b('yellow',[0,.88,0],[.44,.36,.34]);for(const x of [-.24,.24])b('yellow',[x,1.39,0],[.13,.42,.13]);simpleEyes(g,.91,.33,.17);for(let i=0;i<3;i++)ring(g,'gold',[0,.14+i*.15,0],.2,.045,[Math.PI/2,0,0]);q('gold',[0,.05,0],[.6,.1,.4]);}
  else{b('brown',[0,.75,0],[.6,.7,.43]);b('brown',[0,1.51,0],[.58,.48,.41]);for(const x of [-.45,.45])b('brown',[x,1.9,0],[.21,.21,.17]);b('cream',[0,1.4,.4],[.25,.18,.1]);simpleEyes(g,1.64,.38,.22);cyl(g,'gold',[0,2.02,0],[.32,.2,.27]);for(const x of [-.25,0,.25])cone(g,'gold',[x,2.23,0],[.11,.34,.12]);}
 } else if(type==='weapon'){
  if(id==='banana'||id==='croissant')ring(g,id==='banana'?'yellow':'gold',[0,.6,0],.58,id==='banana'?.12:.21,[],Math.PI);
  else if(id==='boomerang'){q('orange',[-.23,.55,0],[.2,.9,.13],[0,0,-.65]);q('teal',[.23,.55,0],[.2,.9,.13],[0,0,.65]);}
  else if(id==='pizza'){cyl(g,'gold',[0,.58,0],[.56,.15,.56],[Math.PI/2,0,0]);for(const x of [-.2,.2])b('coral',[x,.61,.1],[.12,.12,.04]);}
  else if(id==='donut-disc'){ring(g,'gold',[0,.6,0],.43,.22);ring(g,'pink',[0,.6,.1],.43,.16);}
  else if(id==='sardine'){b('teal',[0,.5,0],[.2,.51,.15]);cone(g,'teal',[0,1.1,0],[.33,.25,.1]);b('ink',[.1,.25,.12],[.04,.04,.03]);}
  else if(id==='cactus'){cyl(g,'brown',[0,.25,0],[.1,.5,.1]);b('green',[0,.77,0],[.2,.4,.2]);rod(g,'green',[-.15,.7,0],[-.4,.9,0],.1);}
  else if(id==='plunger'){cyl(g,'brown',[0,.76,0],[.06,.9,.06]);b('coral',[0,.2,0],[.38,.25,.38]);}
  else if(id==='duck'){b('yellow',[0,.38,0],[.43,.32,.34]);b('yellow',[0,.82,.15],[.27,.27,.25]);q('orange',[0,.79,.4],[.23,.11,.25]);simpleEyes(g,.89,.36,.14);q('teal',[0,.38,-.36],[.3,.36,.23]);}
  else if(id==='toaster'){q('coral',[0,.46,0],[.95,.7,.6]);q('cream',[0,.1,0],[1.02,.15,.63]);q('gold',[0,.93,0],[.65,.28,.1]);simpleEyes(g,.5,.32,.23);}
  else if(id==='teapot'){b('white',[0,.5,0],[.45,.42,.37]);ring(g,'teal',[-.45,.55,0],.26,.07);cone(g,'white',[.48,.63,0],[.12,.55,.12],[0,0,-.8]);cyl(g,'teal',[0,.9,0],[.32,.07,.27]);}
  else if(id==='bubble-gun'){q('pink',[0,.63,0],[.7,.4,.4]);q('teal',[-.13,.27,0],[.19,.4,.23]);cyl(g,'teal',[.43,.63,0],[.2,.25,.2],[0,0,Math.PI/2]);b('teal',[-.17,.94,0],[.2,.22,.2]);}
 }
}

// Bake only each child's local transform. The normalized root scale is retained.
// Material buckets yield one draw call per opaque color; helmet stays transparent.
function mergeOpaque(g,simple){
 const buckets=new Map(), keep=[];
 for(const child of g.children){
  if(!child.isMesh||child.material.transparent){keep.push(child);continue;}
  let material=child.material;
  if(simple)material=mat(material.color.getHex(),.05,.7);
  child.updateMatrix();
  let geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();
  geometry.applyMatrix4(child.matrix);
  for(const name of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(name))geometry.deleteAttribute(name);
  if(!buckets.has(material))buckets.set(material,[]);
  buckets.get(material).push(geometry);
 }
 g.clear();
 for(const [material,parts] of buckets){
  const geometry=mergeGeometries(parts,false);
  for(const part of parts)part.dispose();
  const combined=new THREE.Mesh(geometry,material);
  combined.castShadow=true;combined.receiveShadow=true;g.add(combined);
 }
 for(const child of keep)g.add(child);
 return g;
}
const prototypes=new Map();
export function buildModel(slot,simple=false){
 const cacheKey=slot+':'+simple;
 if(prototypes.has(cacheKey))return prototypes.get(cacheKey).clone(true);
 const g=new THREE.Group();g.name=slot;g.userData.slot=slot;g.userData.procedural=true;
 const [type,id]=slot.split(':');
 if(simple&&['hero','enemy','weapon'].includes(type))simpleModel(g,type,id);
 else if(type==='hero')({cat,frog,shroom,capybara,ramen,penguin,axolotl,avocado,robot,snail}[id]??cat)(g,simple);
 else if(type==='weapon')weapon(g,id,simple);
 else if(type==='enemy')enemy(g,id,simple);
 else if(type==='prop')prop(g,id,simple);
 else ball(g,'coral',[0,.5,0],[.5,.5,.5]);
 mergeOpaque(g,simple);g.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(g),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),height=targetHeight(slot);
 if(height&&size.y>0){for(const child of g.children){child.position.x-=center.x;child.position.y-=bounds.min.y;child.position.z-=center.z;}g.scale.setScalar(height/size.y);}
 prototypes.set(cacheKey,g);return g.clone(true);
}
