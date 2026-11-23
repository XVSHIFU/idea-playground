import * as THREE from 'three';
import { DESTINATIONS, DISCOVERIES, normalAt, sample, RADIUS, WATER, seededRandom, type Region } from './world';
export type GameStatus = {region:Region;swimming:boolean;zoom:number;moving:boolean;screen:{x:number;y:number};ready:boolean};
export type GameCallbacks = {status:(s:GameStatus)=>void;discover:(id:string)=>void;ready:()=>void;error:(s:string)=>void};
const UP = new THREE.Vector3(0,1,0);
const clamp = THREE.MathUtils.clamp;
const mat = (c:string,extra={}) => new THREE.MeshStandardMaterial({color:c,roughness:.85,...extra});
const palette={green:mat('#6b9f47'),dark:mat('#387b52'),light:mat('#9bb65a'),trunk:mat('#92694c'),sand:mat('#f0c97f'),orange:mat('#f2944c'),cream:mat('#fff2d0'),brown:mat('#654d3c'),black:mat('#263b35'),pink:mat('#f4b1a3'),white:mat('#fffcef')};
function mesh(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0){const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;return a;}
function ball(m:THREE.Material,x:number,y:number,z:number,sx:number,sy=sx,sz=sx,segments=12){const a=mesh(new THREE.SphereGeometry(1,segments,8),m,x,y,z);a.scale.set(sx,sy,sz);return a;}
function orient(o:THREE.Object3D,n:THREE.Vector3,r:number){o.position.copy(n).multiplyScalar(r);o.quaternion.setFromUnitVectors(UP,n);}
function disposeTree(o:THREE.Object3D){o.traverse((q)=>{if(q instanceof THREE.Mesh || q instanceof THREE.Line){q.geometry.dispose();const ms=Array.isArray(q.material)?q.material:[q.material];ms.forEach(m=>m.dispose());}});}
export class MiniWorld {
  scene=new THREE.Scene(); camera=new THREE.PerspectiveCamera(42,1,.1,180); renderer:THREE.WebGLRenderer;
  normal=normalAt(-.37,.27); forward=new THREE.Vector3(); cameraNorth=new THREE.Vector3();
  heading=new THREE.Vector3(); zoom=0; targetZoom=0; yaw=0; pitch=0;
  keys=new Set<string>(); joystick={x:0,y:0}; target:THREE.Vector3|null=null;
  player=new THREE.Group(); body=new THREE.Group(); leftLeg=new THREE.Group();rightLeg=new THREE.Group();leftArm=new THREE.Group();rightArm=new THREE.Group();tail=new THREE.Group(); floatRing:THREE.Mesh; ripple=new THREE.Group();
  ground:THREE.Mesh;sea:THREE.Mesh;sun:THREE.DirectionalLight;ray=new THREE.Raycaster();cursor=new THREE.Vector2();marker=new THREE.Group();
  collected=new Set<string>(); treasures:{id:string;normal:THREE.Vector3;group:THREE.Group;star:THREE.Mesh;index:number}[]=[];
  animals:{root:THREE.Group;mesh:THREE.Group;phase:number}[]=[];clouds:THREE.Group[]=[]; particles:{mesh:THREE.Mesh;v:THREE.Vector3;life:number}[]=[];
  destroyed=false;paused=false;swimming=false;moving=false;elapsed=0;jumpHeight=0;jumpVelocity=0;raf=0;lastTime=0;lastReport=0;frames=0;fps=60;fpsTime=0;
  travel:{from:THREE.Vector3;to:THREE.Vector3;t:number}|null=null;
  sound=true;audio:AudioContext|null=null;pointerMap=new Map<number,{x:number;y:number;startX:number;startY:number}>();pinch=0;dragged=false;
  resizeObserver:ResizeObserver;listeners:(()=>void)[]=[];onContextLost:(e:Event)=>void;
  constructor(public host:HTMLElement,public cb:GameCallbacks,found:string[]=[],rendererFactory=()=>new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})){
    this.collected=new Set(found);this.cameraNorth.copy(UP).addScaledVector(this.normal,-UP.dot(this.normal)).normalize();this.heading.copy(this.cameraNorth).negate();
    this.renderer=rendererFactory();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));this.renderer.setClearColor(0x000000,0);
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
    this.renderer.domElement.setAttribute('aria-label','Mini World. Tap the planet to walk, drag to look around, and scroll to zoom.');this.renderer.domElement.setAttribute('role','application');
    host.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight('#fff8e2','#7dabad',2.1));
    this.sun=new THREE.DirectionalLight('#fff1d1',3.1);this.sun.castShadow=true;const shadowSize=host.clientWidth<650?1024:2048;this.sun.shadow.mapSize.set(shadowSize,shadowSize);this.sun.shadow.camera.left=-19;this.sun.shadow.camera.right=19;this.sun.shadow.camera.top=19;this.sun.shadow.camera.bottom=-19;this.sun.shadow.normalBias=.05;this.sun.shadow.bias=-.0001;this.sun.shadow.camera.far=100;this.scene.add(this.sun,this.sun.target);
    const fill=new THREE.DirectionalLight('#b9e9ed',1.4);fill.position.set(25,-5,20);this.scene.add(fill);
    this.ground=this.createTerrain();this.sea=mesh(new THREE.SphereGeometry(WATER,128,80),new THREE.MeshPhysicalMaterial({color:'#48beca',roughness:.38,metalness:.06,clearcoat:.35,clearcoatRoughness:.4}));this.sea.receiveShadow=true;this.sea.castShadow=false;this.scene.add(this.sea);
    this.populate();this.createLandmarks();this.createClouds();this.makePlayer();
    this.floatRing=mesh(new THREE.TorusGeometry(.49,.13,8,28),mat('#ffdb71'));this.floatRing.rotation.x=Math.PI/2;this.floatRing.position.y=.35;this.player.add(this.floatRing);this.floatRing.visible=false;
    for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(.65+i*.2,.016,4,40),new THREE.MeshBasicMaterial({color:'#effffd',transparent:true,opacity:.6-i*.13}));r.rotation.x=Math.PI/2;r.position.y=.025;this.ripple.add(r);}this.scene.add(this.ripple);this.ripple.visible=false;
    const markerMat=new THREE.MeshBasicMaterial({color:'#fff5c2',transparent:true,opacity:.9});const ring=mesh(new THREE.TorusGeometry(.29,.038,5,32),markerMat);ring.rotation.x=Math.PI/2;this.marker.add(ring);this.scene.add(this.marker);this.marker.visible=false;
    this.makeTreasures();this.scene.add(this.player);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();this.bind();
    this.onContextLost=(e)=>{e.preventDefault();this.paused=true;this.cb.error('The little world needs a fresh start. Tap Reload to hop back in.');};this.renderer.domElement.addEventListener('webglcontextlost',this.onContextLost);
    this.updateCamera(1,true);this.lastTime=performance.now();this.raf=requestAnimationFrame(this.tick);cb.ready();
  }
  createTerrain(){
    const geo=new THREE.SphereGeometry(RADIUS,180,120);const p=geo.attributes.position;const colors=[];const n=new THREE.Vector3();const green=new THREE.Color('#a6c96a');const sand=new THREE.Color('#f3d28d');const shore=new THREE.Color('#f7e4ad');
    for(let i=0;i<p.count;i++){n.fromBufferAttribute(p,i).normalize();const s=sample(n);p.setXYZ(i,n.x*s.radius,n.y*s.radius,n.z*s.radius);const c=(s.landRegion==='forest'?green:sand).clone();if(s.depth<.09)c.lerp(shore,1-THREE.MathUtils.smoothstep(s.depth,.015,.09));else c.multiplyScalar(.96+.055*Math.sin(n.x*41+n.y*24)*Math.cos(n.z*31));colors.push(c.r,c.g,c.b);}
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const ground=mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));this.scene.add(ground);return ground;
  }
  populate(){
    const rng=seededRandom();const trunk:THREE.Matrix4[]=[];const crowns:THREE.Matrix4[][]=[[],[],[]];const shrubs:THREE.Matrix4[]=[];const rocks:THREE.Matrix4[]=[];const cactus:THREE.Matrix4[]=[];const flowers:THREE.Matrix4[][]=[[],[],[]];
    const dummy=new THREE.Object3D();const q=new THREE.Quaternion();const local=new THREE.Vector3();
    const transform=(n:THREE.Vector3,rad:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,angle=0)=>{q.setFromUnitVectors(UP,n);dummy.position.copy(n).multiplyScalar(rad).add(local.set(x,y,z).applyQuaternion(q));dummy.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(UP,angle));dummy.scale.set(sx,sy,sz);dummy.updateMatrix();return dummy.matrix.clone();};
    const avoid=(n:THREE.Vector3)=>n.angleTo(this.normal)<.12||DISCOVERIES.some(d=>n.angleTo(normalAt(d.lon,d.lat))<.075);
    for(let i=0;i<1550;i++){
      const n=normalAt(rng()*Math.PI*2-Math.PI,Math.asin(rng()*2-1));const s=sample(n);if(s.swimming||s.depth<.09||avoid(n))continue;
      if(s.region==='forest'){
        if(rng()<.68){const size=.5+rng()*.65;trunk.push(transform(n,s.radius,0,size*.4,0,.10*size,.85*size,.10*size));const set=Math.floor(rng()*3);crowns[set].push(transform(n,s.radius,0,1.03*size,0,.54*size,1.0*size,.54*size));crowns[set].push(transform(n,s.radius,0,1.6*size,0,.4*size,.95*size,.4*size));}
        else {shrubs.push(transform(n,s.radius,0,.18,0,.3,.26,.3));for(let j=0;j<3;j++){flowers[j].push(transform(n,s.radius,(rng()-.5)*.8,.16,(rng()-.5)*.8,.075,.075,.075));}}
      }else if(rng()<.35){
        const h=.55+rng()*.6;cactus.push(transform(n,s.radius,0,h*.5,0,.13,h*.5,.13));cactus.push(transform(n,s.radius,-.27,h*.48,0,.23,.105,.105));cactus.push(transform(n,s.radius,-.45,h*.67,0,.105,h*.25,.105));cactus.push(transform(n,s.radius,.23,h*.35,0,.2,.105,.105));cactus.push(transform(n,s.radius,.38,h*.49,0,.105,h*.2,.105));
      }else if(rng()<.25){rocks.push(transform(n,s.radius,0,.1,0,.22+rng()*.2,.2,.18+rng()*.25,rng()*6));}
    }
    const instance=(geometry:THREE.BufferGeometry,material:THREE.Material,matrices:THREE.Matrix4[])=>{if(!matrices.length)return;const o=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>o.setMatrixAt(i,m));o.castShadow=true;o.receiveShadow=true;o.instanceMatrix.needsUpdate=true;this.scene.add(o);};
    instance(new THREE.CylinderGeometry(1,1,1,6),palette.trunk,trunk);
    ['#3f8b5d','#69a361','#91b568'].forEach((c,i)=>instance(new THREE.ConeGeometry(1,1,7),mat(c),crowns[i]));
    instance(new THREE.IcosahedronGeometry(1,1),palette.green,shrubs);instance(new THREE.DodecahedronGeometry(1),mat('#c8b394'),rocks);instance(new THREE.SphereGeometry(1,8,6),mat('#73a76b'),cactus);
    ['#fff2b0','#f3b6b7','#d8def6'].forEach((c,i)=>instance(new THREE.IcosahedronGeometry(1,0),mat(c),flowers[i]));
    // Small glints on the water make the sea readable without busy textures.
    const waterLines=new THREE.BufferGeometry();const linePositions:number[]=[];
    for(let i=0;i<450;i++){const n=normalAt(rng()*6.28-3.14,Math.asin(rng()*2-1));if(!sample(n).swimming)continue;const tangent=new THREE.Vector3().crossVectors(n,UP).normalize();const center=n.clone().multiplyScalar(WATER+.022);const len=.08+rng()*.12;linePositions.push(...center.clone().addScaledVector(tangent,-len).toArray(),...center.clone().addScaledVector(tangent,len).toArray());}
    waterLines.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));this.scene.add(new THREE.LineSegments(waterLines,new THREE.LineBasicMaterial({color:'#d5fbef',transparent:true,opacity:.42})));
  }
  place(group:THREE.Group,lon:number,lat:number,extra=0){const n=normalAt(lon,lat);orient(group,n,Math.max(sample(n).radius,WATER)+extra);this.scene.add(group);return group;}
  createLandmarks(){
    // The woodland's tiny welcome cabin.
    const hut=new THREE.Group();hut.add(mesh(new THREE.BoxGeometry(1.25,.8,1),mat('#eac395'),0,.4,0));
    const roof=mesh(new THREE.ConeGeometry(1.03,.7,4),mat('#ca7252'),0,1.05,0);roof.rotation.y=Math.PI/4;roof.scale.z=.9;hut.add(roof);
    hut.add(mesh(new THREE.BoxGeometry(.29,.5,.05),mat('#63877b'),0,.25,.53));hut.add(mesh(new THREE.BoxGeometry(.21,.22,.05),mat('#fff5ba'),-.39,.48,.53));hut.add(mesh(new THREE.BoxGeometry(.21,.22,.05),mat('#fff5ba'),.39,.48,.53));
    hut.add(mesh(new THREE.CylinderGeometry(.035,.035,1.6,6),palette.trunk,.95,.8,.05));const flag=mesh(new THREE.BoxGeometry(.5,.29,.03),mat('#e9a855'),1.18,1.41,.05);hut.add(flag);this.place(hut,-.56,.62);
    // A friendly sandstone arch.
    const arch=new THREE.Group();const stone=mat('#cf9d68');arch.add(mesh(new THREE.CylinderGeometry(.3,.43,1.7,6),stone,-.65,.85,0),mesh(new THREE.CylinderGeometry(.36,.45,1.7,6),stone,.65,.85,0),mesh(new THREE.BoxGeometry(1.8,.48,.65),stone,0,1.72,0));this.place(arch,.95,.44);
    // Soft, snow-tipped peaks along the northern wood.
    for(let i=0;i<5;i++){const mountain=new THREE.Group();const h=1.7+Math.sin(i*2)*.5;mountain.add(mesh(new THREE.ConeGeometry(1.15,h,5),mat('#91a89a'),0,h/2,0));mountain.add(mesh(new THREE.ConeGeometry(.47,h*.42,5),mat('#f3f4dc'),0,h*.8,0));this.place(mountain,-.8+i*.12,.79+Math.sin(i)*.04);}
    // Mushrooms, rabbits, fish and a turtle have a life of their own.
    const mushroom=new THREE.Group();for(let i=0;i<3;i++){const x=(i-1)*.3;const size=i===1?1:.65;mushroom.add(mesh(new THREE.CylinderGeometry(.07*size,.09*size,.32*size,8),palette.cream,x,.16*size,0));mushroom.add(ball(mat('#df7964'),x,.34*size,0,.23*size,.14*size,.23*size));mushroom.add(ball(palette.cream,x+.08*size,.43*size,.02,.035));}this.place(mushroom,-.55,.14);
    const bunny=new THREE.Group();bunny.add(ball(palette.cream,0,.24,0,.24,.28,.3),ball(palette.cream,0,.5,.15,.22),ball(palette.cream,-.1,.78,.13,.065,.25,.08),ball(palette.cream,.1,.78,.13,.065,.25,.08),ball(palette.pink,-.1,.79,.19,.028,.16,.02),ball(palette.pink,.1,.79,.19,.028,.16,.02),ball(palette.black,-.08,.54,.34,.024),ball(palette.black,.08,.54,.34,.024));const bunnyRoot=this.place(new THREE.Group(),-.65,.43);bunnyRoot.add(bunny);this.animals.push({root:bunnyRoot,mesh:bunny,phase:0});
    const turtle=new THREE.Group();turtle.add(ball(mat('#76a662'),0,.17,0,.34,.23,.42),ball(mat('#b5cd83'),0,.13,.46,.15));for(const x of [-1,1])for(const z of [-1,1])turtle.add(ball(mat('#a4c581'),x*.31,.07,z*.23,.18,.06,.12));turtle.add(ball(palette.black,-.065,.19,.58,.018),ball(palette.black,.065,.19,.58,.018));const tr=this.place(new THREE.Group(),-.14,-.49,.03);tr.add(turtle);this.animals.push({root:tr,mesh:turtle,phase:2});
    for(let i=0;i<7;i++){const fish=new THREE.Group();fish.add(ball(mat(i%2?'#f3c469':'#f08e6e'),0,.1,0,.2,.15,.35),ball(palette.black,.12,.16,.23,.025));const tail=mesh(new THREE.ConeGeometry(.18,.27,3),palette.orange,0,.1,-.4);tail.rotation.x=-Math.PI/2;fish.add(tail);const root=this.place(new THREE.Group(),.18+(i-3)*.045,-.63+Math.sin(i)*.03,.07);root.add(fish);this.animals.push({root,mesh:fish,phase:i+.5});}
    // A little beach umbrella next to the dune shore.
    const parasol=new THREE.Group();parasol.add(mesh(new THREE.CylinderGeometry(.035,.035,1.3,6),palette.trunk,0,.65,0));parasol.add(mesh(new THREE.ConeGeometry(.65,.35,10),mat('#f0a191'),0,1.3,0));this.place(parasol,.43,-.23);
  }
  createClouds(){
    const rng=seededRandom(36);for(let i=0;i<9;i++){const g=new THREE.Group();const material=mat('#ffffff',{transparent:true,opacity:.86,depthWrite:false});for(let j=0;j<4;j++)g.add(ball(material,(j-1.5)*.48,Math.sin(j)*.14,0,.48+Math.sin(j)*.12,.29,.37));const angle=i/9*Math.PI*2;g.position.set(Math.cos(angle)*17,Math.sin(angle)*13, -1.5-rng()*6);g.rotation.z=angle*.3;this.scene.add(g);this.clouds.push(g);}
  }
  makePlayer(){
    this.player.add(this.body);this.body.add(ball(palette.orange,0,.53,0,.29,.36,.23));
    this.body.add(ball(palette.cream,0,.51,.18,.18,.23,.08));this.body.add(ball(palette.orange,0,1.04,.04,.39,.34,.30));
    for(const x of [-1,1]){const ear=mesh(new THREE.ConeGeometry(.14,.33,3),palette.orange,x*.25,1.37,.02);ear.rotation.z=-x*.17;this.body.add(ear);const inner=mesh(new THREE.ConeGeometry(.075,.21,3),palette.brown,x*.25,1.38,.08);inner.rotation.z=-x*.17;this.body.add(inner);this.body.add(ball(palette.cream,x*.17,.93,.265,.20,.14,.11),ball(palette.black,x*.14,1.09,.31,.039,.05,.028),ball(palette.white,x*.13,1.105,.333,.011));}
    this.body.add(ball(palette.black,0,.98,.385,.052,.039,.035));
    const brim=mesh(new THREE.CylinderGeometry(.39,.41,.065,18),mat('#eac475'),0,1.31,.09);const cap=mesh(new THREE.CylinderGeometry(.23,.31,.20,16),mat('#f2d28b'),0,1.43,.04);this.body.add(brim,cap,mesh(new THREE.CylinderGeometry(.302,.31,.065,16),mat('#829c68'),0,1.35,.04));
    this.body.add(ball(mat('#617e5b'),0,.59,-.23,.25,.27,.13));this.body.add(mesh(new THREE.BoxGeometry(.14,.08,.06),mat('#ead4a0'),0,.65,-.37));
    for(const [leg,x] of [[this.leftLeg,-.15],[this.rightLeg,.15]] as [THREE.Group,number][]){leg.position.set(x,.32,0);leg.add(ball(palette.orange,0,-.12,0,.105,.16,.1),ball(palette.brown,0,-.25,.065,.12,.075,.16));this.body.add(leg);}
    for(const [arm,x] of [[this.leftArm,-.31],[this.rightArm,.31]] as [THREE.Group,number][]){arm.position.set(x,.7,0);arm.add(ball(palette.orange,0,-.12,0,.095,.21,.095),ball(palette.brown,0,-.27,.015,.09));this.body.add(arm);}
    this.tail.position.set(0,.42,-.2);const tail=ball(palette.orange,0,.09,-.29,.17,.19,.37);tail.rotation.x=.45;this.tail.add(tail,ball(palette.cream,0,.22,-.53,.13,.14,.18));this.body.add(this.tail);
    const shadow=mesh(new THREE.CircleGeometry(.42,32),new THREE.MeshBasicMaterial({color:'#526146',transparent:true,opacity:.19,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;this.player.add(shadow);
  }
  makeTreasures(){
    const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2;const r=i%2?.17:.35;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025});
    DISCOVERIES.forEach((d,i)=>{const g=new THREE.Group();const n=normalAt(d.lon,d.lat);orient(g,n,Math.max(WATER,sample(n).radius));const star=mesh(geo,mat('#ffce56',{emissive:'#e4a328',emissiveIntensity:.12}),0,1.04,0);g.add(star);const ring=mesh(new THREE.TorusGeometry(.48,.018,4,32),new THREE.MeshBasicMaterial({color:'#fff4bd',transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.08;g.add(ring);g.visible=!this.collected.has(d.id);this.scene.add(g);this.treasures.push({id:d.id,normal:n,group:g,star,index:i});});
  }
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  listen(target:EventTarget,event:string,fn:EventListener,options?:AddEventListenerOptions){target.addEventListener(event,fn,options);this.listeners.push(()=>target.removeEventListener(event,fn,options));}
  bind(){
    const canvas=this.renderer.domElement;
    this.listen(window,'keydown',((e:KeyboardEvent)=>{if(this.paused||e.target instanceof HTMLInputElement)return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' ','+','=','-','m'].includes(k)){e.preventDefault();this.unlockAudio();if(k===' '&&!e.repeat)this.jump();else if(k==='+'||k==='=')this.setZoom(this.targetZoom+.13);else if(k==='-')this.setZoom(this.targetZoom-.13);else if(k==='m')this.overview();else this.keys.add(k);}}) as EventListener);
    this.listen(window,'keyup',((e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());}) as EventListener);
    this.listen(window,'blur',(()=>this.clearInput()) as EventListener);this.listen(document,'visibilitychange',(()=>{if(document.hidden)this.clearInput();this.lastTime=performance.now();}) as EventListener);
    this.listen(canvas,'wheel',((e:WheelEvent)=>{e.preventDefault();if(!this.paused)this.setZoom(this.targetZoom-e.deltaY*.0012);}) as EventListener,{passive:false});
    this.listen(canvas,'pointerdown',((e:PointerEvent)=>{if(this.paused)return;this.unlockAudio();canvas.setPointerCapture(e.pointerId);this.pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});if(this.pointerMap.size===1)this.dragged=false;if(this.pointerMap.size===2){const [a,b]=[...this.pointerMap.values()];this.pinch=Math.hypot(a.x-b.x,a.y-b.y);this.dragged=true;}}) as EventListener);
    this.listen(canvas,'pointermove',((e:PointerEvent)=>{const p=this.pointerMap.get(e.pointerId);if(!p||this.paused)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(this.pointerMap.size===2){const [a,b]=[...this.pointerMap.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y);this.setZoom(this.targetZoom+(dist-this.pinch)*.003);this.pinch=dist;return;}if(Math.hypot(p.x-p.startX,p.y-p.startY)>6)this.dragged=true;if(this.dragged){this.yaw-=dx*.006;this.pitch=clamp(this.pitch+dy*.003,-.35,.45);}}) as EventListener);
    this.listen(canvas,'pointerup',((e:PointerEvent)=>{const p=this.pointerMap.get(e.pointerId);if(p&&!this.dragged&&!this.paused)this.walkAt(e.clientX,e.clientY);this.pointerMap.delete(e.pointerId);}) as EventListener);
    this.listen(canvas,'pointercancel',((e:PointerEvent)=>{this.pointerMap.delete(e.pointerId);this.dragged=true;}) as EventListener);
  }
  clearInput(){this.keys.clear();this.joystick={x:0,y:0};this.pointerMap.clear();}
  setPaused(v:boolean){this.paused=v;this.clearInput();this.target=null;this.marker.visible=false;}
  setZoom(v:number){this.targetZoom=clamp(v,0,1);}
  overview(){this.targetZoom=0;this.pitch=0;this.yaw=0;this.target=null;this.marker.visible=false;}
  go(region:Region){this.unlockAudio();const d=DESTINATIONS[region];this.travel={from:this.normal.clone(),to:normalAt(d.lon,d.lat),t:0};this.target=null;this.marker.visible=false;this.targetZoom=.92;this.yaw=0;this.pitch=0;this.chime([392,523],.14);}
  walkAt(x:number,y:number){const rect=this.host.getBoundingClientRect();this.cursor.set((x-rect.left)/rect.width*2-1,-(y-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.cursor,this.camera);const hit=this.ray.intersectObjects([this.ground,this.sea],false)[0];if(!hit)return;this.target=hit.point.clone().normalize();orient(this.marker,this.target,Math.max(WATER,sample(this.target).radius)+.045);this.marker.visible=true;if(this.targetZoom<.45)this.targetZoom=.83;}
  jump(){if(this.paused||this.travel)return;this.unlockAudio();if(this.jumpHeight<.04){this.jumpVelocity=this.swimming?3.4:5;this.chime(this.swimming?[440,660]:[330,440],.07);if(this.swimming)this.burst(this.normal.clone().multiplyScalar(WATER+.2),'#e4fff7',10);}}
  unlockAudio(){if(!this.sound)return;try{this.audio??=new AudioContext();if(this.audio.state==='suspended')void this.audio.resume();}catch{}}
  chime(notes:number[],duration=.15){if(!this.sound||!this.audio)return;const now=this.audio.currentTime;notes.forEach((note,i)=>{const osc=this.audio!.createOscillator(),gain=this.audio!.createGain();osc.type='sine';osc.frequency.value=note;gain.gain.setValueAtTime(0,now+i*duration);gain.gain.linearRampToValueAtTime(.055,now+i*duration+.02);gain.gain.exponentialRampToValueAtTime(.001,now+(i+1)*duration+.15);osc.connect(gain);gain.connect(this.audio!.destination);osc.start(now+i*duration);osc.stop(now+(i+1)*duration+.17);});}
  burst(p:THREE.Vector3,color:string,count=20){const material=mat(color,{emissive:color,emissiveIntensity:.15});for(let i=0;i<count;i++){const m=mesh(new THREE.IcosahedronGeometry(.05+Math.random()*.035,0),material);m.position.copy(p);this.scene.add(m);const v=new THREE.Vector3((Math.random()-.5)*2,Math.random()*2,(Math.random()-.5)*2).addScaledVector(p.clone().normalize(),1.2);this.particles.push({mesh:m,v,life:1+Math.random()*.5});}}
  transport(to:THREE.Vector3){const q=new THREE.Quaternion().setFromUnitVectors(this.normal,to);this.cameraNorth.applyQuaternion(q).normalize();this.heading.applyQuaternion(q).normalize();this.normal.copy(to);}
  tick=(now:number)=>{
    if(this.destroyed)return;this.raf=requestAnimationFrame(this.tick);const dt=Math.min((now-this.lastTime)/1000,.045);this.lastTime=now;
    this.frames++;if(now-this.fpsTime>1000){this.fps=this.frames;this.frames=0;this.fpsTime=now;}
    if(!this.paused){this.elapsed+=dt;this.step(dt);}
    this.updateCamera(dt);this.renderer.render(this.scene,this.camera);
    if(now-this.lastReport>100){const pos=this.player.position.clone().addScaledVector(this.normal,1.7).project(this.camera);const s=sample(this.normal);this.cb.status({region:s.region,swimming:this.swimming,zoom:this.targetZoom,moving:this.moving,screen:{x:(pos.x+1)*this.host.clientWidth/2,y:(1-pos.y)*this.host.clientHeight/2},ready:true});this.lastReport=now;}
  };
  step(dt:number){
    let move=new THREE.Vector3();const wasMoving=this.moving;this.moving=false;
    if(this.travel){this.travel.t=Math.min(1,this.travel.t+dt*.65);const t=this.travel.t;const eased=t*t*(3-2*t);const q=new THREE.Quaternion().setFromUnitVectors(this.travel.from,this.travel.to);const partial=new THREE.Quaternion().identity().slerp(q,eased);this.transport(this.travel.from.clone().applyQuaternion(partial));this.jumpHeight=Math.sin(t*Math.PI)*2;this.jumpVelocity=0;if(t>=1){this.travel=null;this.jumpHeight=0;}}
    else {
      const x=(this.keys.has('arrowright')||this.keys.has('d')?1:0)-(this.keys.has('arrowleft')||this.keys.has('a')?1:0)+this.joystick.x;
      const y=(this.keys.has('arrowup')||this.keys.has('w')?1:0)-(this.keys.has('arrowdown')||this.keys.has('s')?1:0)-this.joystick.y;
      const north=this.cameraNorth.clone().applyAxisAngle(this.normal,this.yaw).normalize();const right=new THREE.Vector3().crossVectors(north,this.normal).normalize();
      if(Math.abs(x)+Math.abs(y)>.08){if(!wasMoving&&this.targetZoom<.35)this.targetZoom=.85;move.copy(north).multiplyScalar(y).addScaledVector(right,x);if(move.length()>1)move.normalize();this.target=null;this.marker.visible=false;}
      else if(this.target){const angle=this.normal.angleTo(this.target);if(angle<.025){this.target=null;this.marker.visible=false;}else move.copy(this.target).addScaledVector(this.normal,-this.target.dot(this.normal)).normalize().multiplyScalar(Math.min(1,angle*RADIUS/.8));}
      const speed=this.swimming?3.45:3.7;
      if(move.lengthSq()>.004){this.moving=true;const dest=this.normal.clone().addScaledVector(move,dt*speed/RADIUS).normalize();this.heading.lerp(move.clone().normalize(),Math.min(1,dt*12)).normalize();this.transport(dest);}
      this.jumpVelocity-=dt*13;this.jumpHeight=Math.max(0,this.jumpHeight+this.jumpVelocity*dt);if(this.jumpHeight===0)this.jumpVelocity=0;
    }
    const surface=sample(this.normal);this.swimming=surface.swimming;const base=Math.max(surface.radius,WATER);
    const heading=this.heading.clone().addScaledVector(this.normal,-this.heading.dot(this.normal)).normalize();const right=new THREE.Vector3().crossVectors(this.normal,heading).normalize();const basis=new THREE.Matrix4().makeBasis(right,this.normal,heading);this.player.quaternion.setFromRotationMatrix(basis);
    const bob=this.swimming?Math.sin(this.elapsed*3)*.035:0;this.player.position.copy(this.normal).multiplyScalar(base+this.jumpHeight+(this.swimming?-.24:.025)+bob);
    const gait=this.elapsed*(this.swimming?9:12);this.body.position.y=this.moving&&!this.swimming?Math.abs(Math.sin(gait))*.045:Math.sin(this.elapsed*2.5)*.012;
    this.leftLeg.rotation.x=this.moving?Math.sin(gait)*.65:0;this.rightLeg.rotation.x=-this.leftLeg.rotation.x;
    this.leftArm.rotation.x=this.moving?-Math.sin(gait)*.65:Math.sin(this.elapsed*2)*.04;this.rightArm.rotation.x=-this.leftArm.rotation.x;
    this.leftArm.rotation.z=this.swimming?-.95:-.12;this.rightArm.rotation.z=this.swimming?.95:.12;this.tail.rotation.y=Math.sin(this.elapsed*5)*.17;
    this.floatRing.visible=this.swimming;this.ripple.visible=this.swimming;orient(this.ripple,this.normal,WATER+.035);this.ripple.scale.setScalar(1+(Math.sin(this.elapsed*5)+1)*.13);
    for(const t of this.treasures){if(!t.group.visible)continue;t.star.position.y=1.05+Math.sin(this.elapsed*2+t.index)*.12;t.star.rotation.y=this.elapsed*.8+t.index;if(!this.travel&&this.normal.angleTo(t.normal)*RADIUS<1.15){t.group.visible=false;this.collected.add(t.id);this.cb.discover(t.id);this.burst(t.group.position.clone().addScaledVector(t.normal,.8),'#ffdf70',22);this.chime([523,659,784,1047]);}}
    this.animals.forEach(a=>{a.mesh.rotation.y=Math.sin(this.elapsed*.6+a.phase)*.8;a.mesh.position.y=Math.max(0,Math.sin(this.elapsed*2+a.phase))*.06;});
    this.clouds.forEach((c,i)=>{c.position.x+=Math.sin(this.elapsed*.2+i)*dt*.025;});
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;if(p.life<=0){this.scene.remove(p.mesh);p.mesh.geometry.dispose();this.particles.splice(i,1);if(!this.particles.some(other=>other.mesh.material===p.mesh.material))(p.mesh.material as THREE.Material).dispose();continue;}p.mesh.position.addScaledVector(p.v,dt);p.mesh.scale.setScalar(Math.min(1,p.life*2));}
    this.marker.scale.setScalar(1+Math.sin(this.elapsed*7)*.08);
  }
  updateCamera(dt:number,instant=false){
    this.zoom=THREE.MathUtils.damp(this.zoom,this.targetZoom,4.2,dt);
    const t=this.zoom;const north=this.cameraNorth.clone().applyAxisAngle(this.normal,this.yaw);const back=north.clone().negate();
    const aspect=this.camera.aspect;const overviewDistance=Math.max(48,13/(.86*aspect*Math.tan(THREE.MathUtils.degToRad(21))));
    const w=this.host.clientWidth,h=this.host.clientHeight;
    this.camera.setViewOffset(w,h,w>1000?-w*.085*(1-t):0,h*.02*(1-t),w,h);
    const altitude=THREE.MathUtils.lerp(overviewDistance,RADIUS+5.1+this.pitch*8,t);const distance=THREE.MathUtils.lerp(5.5,7.5-this.pitch*4,t);
    const pos=this.normal.clone().multiplyScalar(altitude).addScaledVector(back,distance);const target=this.normal.clone().multiplyScalar(THREE.MathUtils.lerp(.8,RADIUS+1.15,t));
    if(instant)this.camera.position.copy(pos);else this.camera.position.lerp(pos,1-Math.exp(-dt*6));
    this.camera.up.copy(north).multiplyScalar(1-t).addScaledVector(this.normal,t).normalize();this.camera.lookAt(target);
    this.sun.position.copy(this.normal).multiplyScalar(28).addScaledVector(north,25).add(new THREE.Vector3(-18,12,0));
    for(const c of this.clouds)c.visible=t<.65;
  }
  reset(found:string[]=[]){this.clearInput();this.collected=new Set(found);this.treasures.forEach(t=>t.group.visible=!this.collected.has(t.id));this.transport(normalAt(-.37,.27));this.cameraNorth.copy(UP).addScaledVector(this.normal,-UP.dot(this.normal)).normalize();this.heading.copy(this.cameraNorth).negate();this.jumpHeight=0;this.jumpVelocity=0;this.travel=null;this.overview();}
  snapshot(){return {position:this.normal.toArray(),radius:this.player.position.length(),surface:sample(this.normal),swimming:this.swimming,zoom:this.zoom,targetZoom:this.targetZoom,moving:this.moving,paused:this.paused,found:[...this.collected],target:this.target?.toArray()??null,fps:this.fps,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,finite:this.camera.position.toArray().every(Number.isFinite)&&this.player.position.toArray().every(Number.isFinite),jump:this.jumpHeight,travel:!!this.travel};}
  dispose(){this.destroyed=true;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.listeners.forEach(fn=>fn());this.renderer.domElement.removeEventListener('webglcontextlost',this.onContextLost);disposeTree(this.scene);this.renderer.dispose();this.renderer.domElement.remove();void this.audio?.close();}
}
