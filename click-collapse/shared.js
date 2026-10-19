// Deterministic fixed-step rules. PRNG and Spring adapted from last-cast/physics.js
// and last-cast/shared.js; kept here so this project publishes independently.
import * as C from 'cannon-es';
export const DT = 1/120, G = 9.8, BREAK_ENERGY = 7.6, PAD_ENERGY = 42;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class PRNG { constructor(s){this.s=s>>>0} next(){let t=this.s+=0x6d2b79f5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296} }
export class Spring { constructor(v=0,response=.18,zeta=.8){this.value=v;this.target=v;this.vel=0;this.w=2*Math.PI/response;this.zeta=zeta} update(dt){for(let t=0;t<dt;t+=1/240){const h=Math.min(1/240,dt-t);this.vel+=((this.target-this.value)*this.w*this.w-2*this.zeta*this.w*this.vel)*h;this.value+=this.vel*h}return this.value} }
export const NAMES=['松一颗','换一边','轻一点','偏着落','前面一根','后面一根','交叉着','先拆哪边','还来得及','接着拆','让重的先走','留条缝','托一下','低一点','斜着接','松手啦','半边悬着','打个转','从底下过','别碰它','拆成滑梯','空出软垫','两边都开','漂亮收场'];
export const NOTES=['红榫钉一松，支撑就松开。','左右不是同一个支撑。','细木轻，带木帽的更重。','留意陶兽在托盘的哪一边。','前面的支撑先露出来。','绕到后面看那颗榫钉。','斜撑仍连着，不会凭空消失。','试试交换拆除的先后。','木头在动，手也不用停。','上一块还没落地，继续拆。','让厚梁先离开落点。','给陶兽留一条下落的缝。','松开的把手还能抓。','托板别抬太高，顺着落势接。','握把偏在一边，受力会倾斜。','放手时，板子的速度会留下。','悬着的半边仍然会转。','铰链还在，整块板会绕着它转。','上面在落，下面也能接。','重梁的来路要留出来。','拆开木扇，把落势接成斜坡。','垫上要留空，不必清理场外。','前后两边都能打开。','快拆、轻托，接得漂亮。'];
const V=a=>new C.Vec3(...a);
function piece(id,p,size,mass=1,kind='beam',rotation=[0,0,0],extra={}) {return {id,p,size,mass,kind,rotation,...extra}}
// Each row changes topology, hinge direction, depth, obstructions or the catch path.
export const WITNESSES=[[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":72,"type":"grab","id":"tray","dy":0.3},{"step":112,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"pinB"},{"step":78,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"bracePin0"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":72,"type":"grab","id":"tray","dy":0.3},{"step":112,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinC"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"pinC"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinC"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"pinC"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"},{"step":114,"type":"cut","id":"bracePin1"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"bracePin1"},{"step":78,"type":"cut","id":"bracePin0"},{"step":96,"type":"cut","id":"pinB"},{"step":114,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"bracePin0"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"gatePin0"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"},{"step":114,"type":"cut","id":"gatePin1"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"gatePin1"},{"step":78,"type":"cut","id":"gatePin0"},{"step":96,"type":"cut","id":"pinB"},{"step":114,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"pinB"},{"step":78,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"},{"step":114,"type":"cut","id":"gatePin1"}]},{"name":"反向拆解","actions":[{"step":60,"type":"cut","id":"gatePin1"},{"step":78,"type":"cut","id":"gatePin0"},{"step":96,"type":"cut","id":"pinB"},{"step":114,"type":"cut","id":"pinA"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":72,"type":"grab","id":"tray","dy":0.3},{"step":112,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"fanPin0"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"fanPin0"},{"step":108,"type":"grab","id":"left","dy":0.3},{"step":148,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"fanPin0"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"fanPin0"},{"step":90,"type":"grab","id":"tray","dy":0.3},{"step":130,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":90,"type":"grab","id":"left","dy":0.3},{"step":130,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"bracePin0"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"bracePin0"},{"step":90,"type":"grab","id":"tray","dy":0.3},{"step":130,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"},{"step":114,"type":"cut","id":"bracePin1"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"},{"step":114,"type":"cut","id":"bracePin1"},{"step":126,"type":"grab","id":"left","dy":0.3},{"step":166,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"},{"step":108,"type":"grab","id":"left","dy":0.3},{"step":148,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":90,"type":"grab","id":"left","dy":0.3},{"step":130,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"fanPin0"},{"step":96,"type":"cut","id":"fanPin1"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"fanPin0"},{"step":96,"type":"cut","id":"fanPin1"},{"step":108,"type":"grab","id":"tray","dy":0.3},{"step":148,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"},{"step":114,"type":"cut","id":"gatePin0"},{"step":132,"type":"cut","id":"gatePin1"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"bracePin0"},{"step":114,"type":"cut","id":"gatePin0"},{"step":132,"type":"cut","id":"gatePin1"},{"step":144,"type":"grab","id":"left","dy":0.3},{"step":184,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"gatePin0"},{"step":108,"type":"grab","id":"left","dy":0.3},{"step":148,"type":"release"}]}],[{"name":"连续拆解","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"fanPin0"},{"step":114,"type":"cut","id":"fanPin1"}]},{"name":"托住再放","actions":[{"step":60,"type":"cut","id":"pinA"},{"step":78,"type":"cut","id":"pinB"},{"step":96,"type":"cut","id":"fanPin0"},{"step":114,"type":"cut","id":"fanPin1"},{"step":126,"type":"grab","id":"left","dy":0.3},{"step":166,"type":"release"}]}]];
const CONFIGS=[
 {single:true,handle:true}, {split:true}, {split:true,light:true,braces:1}, {single:true,offset:.36,handle:true},
 {split:true,axis:'z',front:true}, {split:true,axis:'z',back:true}, {split:true,braces:2}, {split:true,offset:-.38,braces:1},
 {split:true,gate:1}, {split:true,gate:2}, {split:true,heavy:1}, {split:true,gate:2,offset:.3},
 {single:true,handle:true}, {split:true,handle:true,low:true,fan:1}, {single:true,handle:true,offset:.4,fan:1}, {split:true,handle:true,axis:'z'},
 {single:true,handle:true,braces:1}, {split:true,handle:true,axis:'z',braces:2}, {split:true,handle:true,gate:1}, {split:true,handle:true,heavy:1},
 {single:true,handle:true,fan:2}, {split:true,handle:true,gate:2,braces:1}, {split:true,handle:true,axis:'z',gate:1}, {split:true,handle:true,fan:2,heavy:1}
];
export function makeLevel(index=0,seed=1000+index){
 index=clamp(index|0,0,23); const cfg=CONFIGS[index], parts=[], joints=[];
 const y=cfg.gate?3.9:cfg.low?2.4:2.65, depth=cfg.axis==='z', offset=cfg.offset||0;
 const axis=depth?[1,0,0]:[0,0,1];
 const convert=p=>depth?[p[2],p[1],p[0]]:p;
 const dims=s=>depth?[s[2],s[1],s[0]]:s;
 const add=(id,p,s,m,k='beam',extra={})=>parts.push(piece(id,convert(p),dims(s),m,k,[0,0,0],extra));
 const latch=(id,b,p,a='base',support=true)=>{
 if(a==='base'){a='anchor-'+id;add(a,[p[0],p[1]/2,p[2]+(p[2]>=0?.7:-.7)],[.12,p[1],.12],0,'post');}
 joints.push({id,a,b,p:convert(p),type:'lock',support,removable:true});
 };
 const hinge=(id,a,b,p)=>joints.push({id,a,b,p:convert(p),axis,type:'hinge',support:false,removable:false});
 add('base',[0,-.22,0],[9,.4,6.6],0,'table');
 // Real, visible anchor posts. No orphaned world-space anchor survives a cut.
 add('postL',[-1.94,y/2,0],[.25,y,.3],0,'post');
 if(cfg.split) add('postR',[1.94,y/2,0],[.25,y,.3],0,'post');
 if(cfg.single){
  add('tray',[0,y,0],[3.6,.16,1.55],cfg.light?.45:1.1,'tray',{handle:!!cfg.handle});
  hinge('pivotL','postL','tray',[-1.78,y,0]);
  latch('pinA','tray',[1.25,y,.82]);
 }else{
  add('left',[-.91,y,0],[1.78,.16,1.55],cfg.light?.32:.7,'tray',{handle:!!cfg.handle});
  add('right',[.91,y,0],[1.78,.16,1.55],cfg.light?.32:.7,'tray',{handle:!!cfg.handle});
  hinge('pivotL','postL','left',[-1.78,y,0]);hinge('pivotR','postR','right',[1.78,y,0]);
  latch('pinA','left',[-.55,y,.82]);latch('pinB','right',[.55,y,.82]);
 }
 const primary=cfg.single?'tray':'left';
 if(cfg.front||cfg.back){latch('pinC',cfg.back?'right':'left',[cfg.back?.8:-.8,y,-.82]);}
 for(let i=0;i<(cfg.braces||0);i++){
  const id='brace'+i, z=i?-1.18:1.18;
  add(id,[-.8,y-.65,z],[2.1,.15,.18],.3,'brace');
  const b=parts.at(-1);b.rotation=depth?[-.55,0,0]:[0,0,.55];
  // A real pinned brace connected to the moving leaf, not another world anchor.
  joints.push({id:'braceH'+i,a:primary,b:id,p:convert([-.8,y-.05,z]),axis,type:'hinge',support:false,removable:false});
  latch('bracePin'+i,id,[-1.6,y-1.2,z]);
 }
 for(let i=0;i<(cfg.gate||0);i++){
  const id='gate'+i, yy=2.12+i*.7, x=i?-.83:.83;
  add(id,[x,yy,0],[1.65,.14,1.5],.45,'tray',{handle:false});
  add('gatePost'+i,[i?-1.78:1.78,yy/2,0],[.18,yy,.22],0,'post');
  hinge('gatePivot'+i,'gatePost'+i,id,[i?-1.64:1.64,yy,0]);
  latch('gatePin'+i,id,[x,yy,.8]);
 }
 if(cfg.heavy){
  add('heavy',[-.15,y+1.25,-.1],[2.8,.4,.55],5,'heavy');
  latch('heavyPin','heavy',[.9,y+1.25,.22]);
 }
 for(let i=0;i<(cfg.fan||0);i++){
  const id='fan'+i, z=i?-1.2:1.2;
  add(id,[-.45,y-.22,z],[2.3,.2,.25],.55,'brace');
  add('fanPost'+i,[-1.62,(y-.22)/2,z*1.75],[.2,y-.22,.2],0,'post');
  joints.push({id:'fanH'+i,a:'fanPost'+i,b:id,p:convert([-1.55,y-.22,z*1.75]),axis:[1,0,0],type:'hinge',support:false,removable:false});
  latch('fanPin'+i,id,[.55,y-.22,z]);
 }
 const cushion={p:cfg.single?[1.85,.16,0]:[0,.16,0],half:cfg.single?[1,.16,1.1]:[1.1,.16,1.1],inner:cfg.single?[.78,.86]:[.86,.86],clearance:1.0};
 const beast=convert([offset,y+.47,0]);
 for(const d of parts)if(d.handle)d.handleLocal=[-d.size[0]*.27,.24,d.size[2]*.48];
 const level={id:index+1,name:NAMES[index],seed:seed>>>0,parts,joints,beast,cushion,range:{min:[-4,.3,-4],max:[4,5.2,4]},note:NOTES[index],routes:WITNESSES[index]};
 // Only rigid quarter-turns of verified structures, not unconstrained random towers.
 const turns=(seed>=1000&&seed<1024)?0:Math.floor(seed/24)%4;
 level.turns=turns;
 if(turns){const q=new C.Quaternion();q.setFromAxisAngle(new C.Vec3(0,1,0),turns*Math.PI/2);const rotate=a=>q.vmult(V(a)).toArray();for(const d of parts){d.p=rotate(d.p);const r=new C.Quaternion();r.setFromEuler(...d.rotation);q.mult(r,r);const e=new C.Vec3();r.toEuler(e,'YZX');d.quaternion=[r.x,r.y,r.z,r.w];}for(const j of joints){j.p=rotate(j.p);if(j.axis)j.axis=rotate(j.axis)}level.beast=rotate(beast);cushion.p=rotate(cushion.p);if(turns%2){cushion.half=[cushion.half[2],cushion.half[1],cushion.half[0]];cushion.inner.reverse()}}
 return level;
}
export class Simulation {
 constructor(level){
  this.level=level;this.time=0;this.steps=0;this.result='playing';this.removals=0;this.pending=[];this.events=[];this.hand=null;this.peakEnergy=0;this.padImpact=0;this.touchedPad=false;
  this.world=new C.World({gravity:new C.Vec3(0,-G,0),allowSleep:true});this.world.solver.iterations=16;this.world.solver.tolerance=1e-7;
  this.world.defaultContactMaterial.friction=.35;this.world.defaultContactMaterial.restitution=.015;
  this.wood=new C.Material('wood');this.clay=new C.Material('clay');this.soft=new C.Material('cushion');
  this.world.addContactMaterial(new C.ContactMaterial(this.wood,this.clay,{friction:.28,restitution:.025}));
  this.world.addContactMaterial(new C.ContactMaterial(this.soft,this.clay,{friction:.85,restitution:0,contactEquationStiffness:3e4,contactEquationRelaxation:8}));
  this.parts=level.parts.map(d=>{
   const b=new C.Body({mass:d.mass,material:this.wood,position:V(d.p),linearDamping:.035,angularDamping:.08});
   b.addShape(new C.Box(V(d.size.map(x=>x/2)))); if(d.quaternion)b.quaternion.set(...d.quaternion);else b.quaternion.setFromEuler(...d.rotation);b.userData=d;b.originalMass=d.mass;this.world.addBody(b);return {def:d,body:b};
  });
  this.byId=new Map(this.parts.map(p=>[p.def.id,p.body]));
  this.pad=new C.Body({mass:0,material:this.soft,position:V(level.cushion.p)});this.pad.addShape(new C.Box(V(level.cushion.half)));this.world.addBody(this.pad);
  this.beast=new C.Body({mass:1,material:this.clay,position:V(level.beast),linearDamping:.06,angularDamping:.16});
  this.beast.addShape(new C.Sphere(.30),new C.Vec3(0,-.04,0));this.beast.addShape(new C.Sphere(.22),new C.Vec3(0,.19,0));this.world.addBody(this.beast);
  this.joints=level.joints.map(d=>{
   const a=this.byId.get(d.a),b=this.byId.get(d.b),pa=a.pointToLocalFrame(V(d.p)),pb=b.pointToLocalFrame(V(d.p));
   const constraint=d.type==='hinge'?new C.HingeConstraint(a,b,{pivotA:pa,pivotB:pb,axisA:a.vectorToLocalFrame(V(d.axis)),axisB:b.vectorToLocalFrame(V(d.axis)),collideConnected:false,maxForce:1e5}):new C.LockConstraint(a,b,{maxForce:1e5});
   this.world.addConstraint(constraint);return {...d,aBody:a,bBody:b,local:pb,constraint,active:true,cutAt:-1};
  });
  this.updateSupport();this.pre=new Map();this.tmp={point:new C.Vec3(),vel:new C.Vec3(),delta:new C.Vec3(),force:new C.Vec3(),offset:new C.Vec3()};
 }
 updateSupport(){
  const fixed=new Set(this.parts.filter(p=>!p.def.mass).map(p=>p.def.id));let changed=true;
  while(changed){changed=false;for(const j of this.joints)if(j.active&&j.support){if(fixed.has(j.a)&&!fixed.has(j.b)){fixed.add(j.b);changed=true}if(fixed.has(j.b)&&!fixed.has(j.a)){fixed.add(j.a);changed=true}}}
  for(const p of this.parts)if(p.def.mass){const b=p.body,locked=fixed.has(p.def.id);if(locked!==p.locked){b.type=locked?C.Body.STATIC:C.Body.DYNAMIC;b.mass=locked?0:p.def.mass;b.updateMassProperties();b.wakeUp();p.locked=locked}}
 }
 cut(id){if(this.hand||this.result!=='playing')return false;const j=this.joints.find(j=>j.id===id);if(!j?.active||!j.removable||this.pending.includes(id))return false;this.pending.push(id);return true}
 handlePoint(id){const b=this.byId.get(id),d=b?.userData;if(!d?.handle)return null;return b.pointToWorldFrame(V(d.handleLocal))}
 grab(id){if(this.hand||this.result!=='playing')return false;const b=this.byId.get(id),p=this.parts.find(p=>p.def.id===id);if(!b||!p.def.handle||p.locked)return false;const point=this.handlePoint(id);this.hand={id,body:b,local:b.pointToLocalFrame(point),target:point.clone(),desired:point.clone(),load:0};b.wakeUp();return true}
 move(point){if(!this.hand)return;const {min,max}=this.level.range;this.hand.desired.set(clamp(point[0],min[0],max[0]),clamp(point[1],min[1],max[1]),clamp(point[2],min[2],max[2]))}
 release(){this.hand=null}
 pull(){
  const h=this.hand;if(!h)return;const t=this.tmp;h.desired.vsub(h.target,t.delta);const len=t.delta.length(),max=3.2*DT;if(len>max)t.delta.scale(max/len,t.delta);h.target.vadd(t.delta,h.target);
  h.body.pointToWorldFrame(h.local,t.point);h.body.getVelocityAtWorldPoint(t.point,t.vel);h.target.vsub(t.point,t.delta);t.delta.scale(140,t.force);t.vel.scale(2*.8*Math.sqrt(140*h.body.mass),t.vel);t.force.vsub(t.vel,t.force);
  const force=t.force.length(),limit=3*G;h.load=clamp(force/limit,0,1);if(force>limit)t.force.scale(limit/force,t.force);t.point.vsub(h.body.position,t.offset);h.body.applyForce(t.force,t.offset);
 }
 step(){
  this.events.length=0;this.padImpact=0;
  if(this.pending.length){for(const id of this.pending){const j=this.joints.find(j=>j.id===id);if(j.active){j.active=false;j.cutAt=this.time;this.world.removeConstraint(j.constraint);this.removals++;this.events.push({type:'cut',id})}}this.pending.length=0;this.updateSupport()}
  this.pull();
  // Capture velocities before solver impulses; never read post-solver speed for breakage.
  for(const b of this.world.bodies){let s=this.pre.get(b.id);if(!s){s={v:new C.Vec3(),w:new C.Vec3()};this.pre.set(b.id,s)}s.v.copy(b.velocity);s.w.copy(b.angularVelocity)}
  this.world.step(DT);this.steps++;this.time=this.steps*DT;
  let broken=false,padTouch=false,energyMax=0;
  for(const c of this.world.contacts){
   const aa=this.pre.get(c.bi.id),bb=this.pre.get(c.bj.id);if(!aa||!bb)continue;
   // v + omega cross r, projected on contact normal. Effective translational mass.
   const n=c.ni,ra=c.ri,rb=c.rj;
   const avx=aa.v.x+aa.w.y*ra.z-aa.w.z*ra.y,avy=aa.v.y+aa.w.z*ra.x-aa.w.x*ra.z,avz=aa.v.z+aa.w.x*ra.y-aa.w.y*ra.x;
   const bvx=bb.v.x+bb.w.y*rb.z-bb.w.z*rb.y,bvy=bb.v.y+bb.w.z*rb.x-bb.w.x*rb.z,bvz=bb.v.z+bb.w.x*rb.y-bb.w.y*rb.x;
   const speed=Math.max(0,(avx-bvx)*n.x+(avy-bvy)*n.y+(avz-bvz)*n.z);
   const inv=c.bi.invMass+c.bj.invMass,energy=inv>0?.5*speed*speed/inv:0;
   if(speed>.35)this.events.push({type:'impact',energy,heavy:(c.bi.originalMass||0)>3||(c.bj.originalMass||0)>3});
   if(c.bi===this.beast||c.bj===this.beast){const other=c.bi===this.beast?c.bj:c.bi;energyMax=Math.max(energyMax,energy);if(other===this.pad){padTouch=true;this.padImpact=Math.max(this.padImpact,energy);if(energy>PAD_ENERGY)broken=true}else if(energy>BREAK_ENERGY)broken=true;}
  }
  this.peakEnergy=Math.max(this.peakEnergy,energyMax);this.touchedPad=padTouch;
  if(this.result!=='playing')return;
  if(broken||this.beast.position.y<-.9||Math.abs(this.beast.position.x)>4.8||Math.abs(this.beast.position.z)>3.8){this.result='failed';this.release();this.events.push({type:'failed'});return}
  const p=this.beast.position,k=this.level.cushion;
  if(padTouch&&Math.abs(p.x-k.p[0])+.3<k.inner[0]&&Math.abs(p.z-k.p[2])+.3<k.inner[1]&&this.clear()){this.result='success';this.release();this.events.push({type:'success'})}
 }
 clear(){const k=this.level.cushion;for(const p of this.parts)if(p.def.mass){p.body.updateAABB();const a=p.body.aabb;if(a.upperBound.y>k.p[1]+k.half[1]+.02&&a.lowerBound.y<k.p[1]+k.half[1]+k.clearance&&a.upperBound.x>k.p[0]-k.inner[0]&&a.lowerBound.x<k.p[0]+k.inner[0]&&a.upperBound.z>k.p[2]-k.inner[1]&&a.lowerBound.z<k.p[2]+k.inner[1])return false}return true}
 snapshot(){return {result:this.result,time:this.time,removals:this.removals,peakEnergy:this.peakEnergy,beast:this.beast.position.toArray(),hand:this.hand?.id||null,clear:this.clear(),active:this.joints.filter(j=>j.active&&j.removable).map(j=>j.id)}}
}

export function replay(level,route,maxSteps=1800){
 const s=new Simulation(level);let maxHandForce=0,grabbed=false;const trace=[];
 for(let tick=0;tick<maxSteps;tick++){
  for(const a of route.actions)if(a.step===tick){if(a.type==='cut')s.cut(a.id);else if(a.type==='grab'){grabbed=s.grab(a.id)||grabbed;const p=s.handlePoint(a.id);s.move([p.x,p.y+a.dy,p.z]);}else if(a.type==='release')s.release();}
  s.step();if(s.hand)maxHandForce=Math.max(maxHandForce,s.hand.load*3*G);if(tick%12===0)trace.push(s.beast.position.toArray());if(s.result!=='playing')break;
 }
 return {snapshot:s.snapshot(),maxHandForce,grabbed,trace};
}
