import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {INSTRUMENTS,noteColor,audible} from './model.js';
import {buildBlockGeometry} from './blocks.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const v=new THREE.Object3D(),color=new THREE.Color();
export class MusicWorld{
 constructor(canvas,getState,callbacks){
  this.canvas=canvas;this.getState=getState;this.callbacks=callbacks;this.tool='place';this.selected=null;this.hover=null;this.drag=null;this.lastPaint='';this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f6f6f2');this.scene.fog=new THREE.Fog('#f6f6f2',38,75);
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.94;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.camera=new THREE.OrthographicCamera(-12,12,8,-8,.1,120);this.camera.position.set(8,17,21);this.camera.lookAt(0,0,0);
  this.angle=.25;this.targetAngle=.25;this.elevation=.67;this.targetElevation=.67;this.zoom=1;this.targetZoom=1;this.top=false;
  this.ray=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.22);this.intersection=new THREE.Vector3();
  this.anim=Array.from({length:128},()=>({offset:0,velocity:0,pulse:0,exists:false,x:0,z:0}));this.particles=[];this.floating=[];this.time=0;this.lastFrame=0;this.step=-1;this.playheadTarget=-8;this.currentHead=-8;this.dirty=true;
  this.scene.add(new THREE.HemisphereLight(0xfdfbef,0xd0d5c5,.78));
  const sun=new THREE.DirectionalLight(0xfffaf0,.95);sun.position.set(-8,18,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:50});sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;sun.shadow.radius=3;this.scene.add(sun);
  const fill=new THREE.DirectionalLight(0xe6f0ff,.25);fill.position.set(8,5,-10);this.scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xf6f6f2,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.6;ground.receiveShadow=true;this.scene.add(ground);
  this.root=new THREE.Group();this.scene.add(this.root);
  this.blockSize=.82;this.restHeight=.21+this.blockSize/2;
  this.textures={};this.floor=[];this.makeStage();this.makeNotes();this.makeSelection();this.makeDecor();this.makeParticles();this.makePlayhead();
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.bindEvents();this.sync(true);
 }
 texture(name,fade=0){
  const key=name+'-'+fade;if(this.textures[key])return this.textures[key];
  const c=document.createElement('canvas');c.width=c.height=16;const ctx=c.getContext('2d');ctx.fillStyle='#c2ba9f';ctx.fillRect(0,0,16,16);
  const texture=new THREE.CanvasTexture(c);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.encoding=THREE.sRGBEncoding;
  const img=new Image();img.onload=()=>{ctx.clearRect(0,0,16,16);ctx.drawImage(img,0,0,16,16);if(fade){ctx.fillStyle=`rgba(247,245,227,${fade})`;ctx.fillRect(0,0,16,16)}texture.needsUpdate=true;this.dirty=true};img.src=`./assets/textures/${name}.png`;
  return this.textures[key]=texture;
 }
 blockMaterials(definition){return definition.textureNames.map(name=>this.standard('#ffffff',this.texture(name),definition.appearance.glass?{transparent:true,alphaTest:.05,depthWrite:false,side:THREE.DoubleSide}:{}))}
 standard(colorValue,map,extra={}){return new THREE.MeshStandardMaterial({color:colorValue,roughness:.82,metalness:0,map:map||null,...extra})}
 mesh(geometry,material,x=0,y=0,z=0,group=this.root){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
 makeStage(){
  this.mesh(new RoundedBoxGeometry(17.7,.5,9.6,2,.12),this.standard('#dfdfd1'),0,-.37,0);
  this.mesh(new RoundedBoxGeometry(17.75,.16,9.65,2,.1),this.standard('#fafaf2'),0,-.075,0);
  this.mesh(new RoundedBoxGeometry(17.3,.16,9.2,1,.06),this.standard('#a6ad95'),0,-.62,0);
  for(let r=0;r<8;r++){
   const block=buildBlockGeometry(r,.89,.19);
   const mesh=new THREE.InstancedMesh(block.geometry,this.blockMaterials(block),16);mesh.castShadow=true;mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
   for(let c=0;c<16;c++){v.position.set(c-7.5,.115,r-3.5);v.scale.set(1,1,1);v.rotation.set(0,0,0);v.updateMatrix();mesh.setMatrixAt(c,v.matrix);mesh.setColorAt(c,new THREE.Color(c%4===0?'#ffffff':'#f3f2e9'))}mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;this.root.add(mesh);this.floor.push(mesh);
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle=INSTRUMENTS[r].color;ctx.fillRect(14,14,36,36);ctx.font='bold 25px monospace';ctx.fillStyle='#fcfff7';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(r+1),32,33);
   const t=new THREE.CanvasTexture(canvas);t.encoding=THREE.sRGBEncoding;const label=new THREE.Mesh(new THREE.PlaneGeometry(.45,.45),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));label.rotation.x=-Math.PI/2;label.position.set(-8.35,.026,r-3.5);this.root.add(label);
  }
  const labels=document.createElement('canvas');labels.width=2048;labels.height=128;const ctx=labels.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 39px monospace';for(let c=0;c<16;c++){ctx.fillStyle=c%4===0?'#7c8966':'#a4ab95';ctx.fillText(String(c+1).padStart(2,'0'),c*128+64,65)}
  const t=new THREE.CanvasTexture(labels);t.encoding=THREE.sRGBEncoding;const label=new THREE.Mesh(new THREE.PlaneGeometry(16,.7),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));label.rotation.x=-Math.PI/2;label.position.set(0,.03,-4.2);this.root.add(label);
  for(let c=0;c<4;c++){const m=this.mesh(new THREE.BoxGeometry(.7,.015,.08),this.standard('#c8cdb9'),c*4-6,.03,4.28);m.castShadow=false}
  // A low, continuous redstone line along the front edge of the instrument.
  this.rail=this.mesh(new THREE.BoxGeometry(15.8,.018,.025),this.standard('#b87561'),0,.035,4.56);this.rail.castShadow=false;
 }
 makeNotes(){
  this.noteMeshes=INSTRUMENTS.map((_,row)=>{
   const block=buildBlockGeometry(row,this.blockSize);
   const mesh=new THREE.InstancedMesh(block.geometry,this.blockMaterials(block),16);
   mesh.name='sound-block-'+INSTRUMENTS[row].id;mesh.userData.row=row;
   mesh.castShadow=row!==4;mesh.receiveShadow=true;mesh.frustumCulled=false;
   mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   for(let col=0;col<16;col++)mesh.setColorAt(col,new THREE.Color('#ffffff'));
   this.root.add(mesh);return mesh;
  });
  // Pitch is a small front-face indicator; it never replaces a block face.
  this.markers=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,.045,.018),new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false}),128);
  this.markers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.markers.frustumCulled=false;this.root.add(this.markers);
  for(let i=0;i<128;i++)this.markers.setColorAt(i,new THREE.Color('#8ca75b').convertSRGBToLinear());
  const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d');ctx.fillStyle='#fffef2';
  for(const p of [[18,5,3,16],[18,5,8,3],[23,5,3,7],[11,18,10,6],[9,20,3,3]])ctx.fillRect(...p);
  this.noteSymbol=new THREE.CanvasTexture(c);this.noteSymbol.magFilter=THREE.NearestFilter;this.noteSymbol.minFilter=THREE.NearestFilter;
 }
 makeSelection(){
  this.outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.89,.89,.89)),new THREE.LineBasicMaterial({color:'#b56d50',transparent:true,opacity:.7}));this.root.add(this.outline);this.outline.visible=false;
  this.ghosts=this.noteMeshes.map(note=>{const materials=note.material.map(material=>{const copy=material.clone();copy.transparent=true;copy.opacity=.35;copy.depthWrite=false;return copy});const ghost=this.mesh(note.geometry,materials);ghost.castShadow=false;ghost.visible=false;return ghost});this.ghost=this.ghosts[0];
  this.hoverTile=new THREE.Mesh(new THREE.PlaneGeometry(.86,.86),new THREE.MeshBasicMaterial({color:'#fffbea',transparent:true,opacity:.4,depthWrite:false}));this.hoverTile.rotation.x=-Math.PI/2;this.hoverTile.position.y=.218;this.root.add(this.hoverTile);this.hoverTile.visible=false;
 }
 makeDecor(){
  const cube=new RoundedBoxGeometry(1,1,1,1,.018);const batches={};
  const block=(name,mat,x,y,z,sx=1,sy=1,sz=1)=>{if(!batches[name])batches[name]={mat,list:[]};batches[name].list.push([x,y,z,sx,sy,sz])};
  const grass=this.standard('#c0ce91',this.texture('grass-top',.16)),dirt=this.standard('#b9a086',this.texture('dirt')),wood=this.standard('#bdab8a',this.texture('wood',.16)),leaf=this.standard('#ffffff',this.texture('oak-leaves'),{alphaTest:.1}),leafDark=this.standard('#d2ddc2',this.texture('oak-leaves'),{alphaTest:.1});
  // Small landscape details keep the music table rooted in the overworld.
  block('dirt',dirt,-7.35,-.16,-5.25,2.55,.6,1.5);block('grass',grass,-7.35,.18,-5.25,2.57,.14,1.52);
  block('wood',wood,-7.8,1,-5.3,.38,1.9,.38);block('leaves',leaf,-7.8,2.2,-5.3,1.8,1.1,1.65);block('leafDark',leafDark,-7.72,2.85,-5.3,1.3,.55,1.25);block('leaves',leaf,-8.65,2,-5.25,.55,.65,.9);
  block('dirt',dirt,-7.5,-.22,4.9,2.1,.35,.75);block('grass',grass,-7.5,-.005,4.9,2.13,.11,.77);
  const stem=this.standard('#8eab62'),red=this.standard('#c57760'),yellow=this.standard('#e6ca7c'),cloud=this.standard('#ffffff');
  block('stem',stem,-7.85,.29,4.9,.05,.5,.05);block('red',red,-7.85,.55,4.9,.2,.16,.1);block('red',red,-7.85,.55,4.9,.1,.16,.2);block('stem',stem,-7.25,.18,4.8,.04,.3,.04);block('yellow',yellow,-7.25,.37,4.8,.16,.14,.16);block('stem',stem,-8.12,.18,4.8,.12,.3,.035);block('stem',stem,-8.2,.12,4.91,.04,.25,.09);
  block('stone',this.standard('#c5cbb7',this.texture('stone',.4)),8.15,.14,-4.3,.53,.43,.55);block('stone',this.standard('#c5cbb7'),8.44,.05,-4.65,.32,.25,.35);
  // A tiny switch and redstone torch frame the right end of the board.
  block('switch',this.standard('#a9ad9e'),8.31,.15,3.92,.3,.3,.3);block('switchStem',wood,8.31,.44,3.92,.065,.4,.065);block('red',red,8.31,.66,3.92,.15,.18,.15);
  for(const b of Object.values(batches)){const m=new THREE.InstancedMesh(cube,b.mat,b.list.length);b.list.forEach(([x,y,z,sx,sy,sz],i)=>{v.position.set(x,y,z);v.rotation.set(0,0,0);v.scale.set(sx,sy,sz);v.updateMatrix();m.setMatrixAt(i,v.matrix)});m.castShadow=true;m.receiveShadow=true;this.root.add(m)}
  // Atmospheric pixels are sparse and intentionally subordinate to the sequencer.
  this.motes=new THREE.InstancedMesh(new THREE.BoxGeometry(.045,.045,.045),new THREE.MeshBasicMaterial({color:'#bdcba0',transparent:true,opacity:.55}),14);this.motes.frustumCulled=false;this.scene.add(this.motes);
 }
 makeParticles(){this.particleMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.13,.13,.13),this.standard('#c1ad8a'),64);this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.particleMesh.frustumCulled=false;this.root.add(this.particleMesh);for(let i=0;i<64;i++){v.scale.setScalar(0);v.updateMatrix();this.particleMesh.setMatrixAt(i,v.matrix)}this.particleMesh.instanceMatrix.needsUpdate=true;}
 makePlayhead(){
  this.playhead=new THREE.Group();const beam=new THREE.Mesh(new THREE.PlaneGeometry(.036,8.3),new THREE.MeshBasicMaterial({color:'#bd6251',transparent:true,opacity:.66,depthWrite:false}));beam.rotation.x=-Math.PI/2;beam.position.y=.235;this.playhead.add(beam);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(.22,8.3),new THREE.MeshBasicMaterial({color:'#e2b196',transparent:true,opacity:.22,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.229;this.playhead.add(glow);
  for(const z of [-4.36,4.48]){const b=new THREE.Mesh(new THREE.BoxGeometry(.19,.065,.14),this.standard('#b96b51',null,{emissive:'#a74720',emissiveIntensity:.25}));b.position.set(0,.07,z);this.playhead.add(b)}this.root.add(this.playhead);this.playhead.visible=false;
 }
 resize(){const box=this.canvas.parentElement.getBoundingClientRect();this.width=box.width;this.height=box.height;this.renderer.setSize(this.width,this.height,false);const aspect=this.width/this.height;this.frustum=Math.max(10.8,20.7/aspect);this.camera.left=-this.frustum*aspect/2;this.camera.right=this.frustum*aspect/2;this.camera.top=this.frustum/2;this.camera.bottom=-this.frustum/2;this.camera.updateProjectionMatrix();this.dirty=true}
 sync(initial=false){const s=this.getState();for(let r=0;r<8;r++)for(let c=0;c<16;c++){const i=r*16+c,a=this.anim[i],n=s.pattern[r][c];if(n&&!a.exists){a.offset=this.reduced?0:initial?1.5+(r*.08+c*.015):1.2;a.velocity=0;}a.exists=!!n;a.x=c-7.5;a.z=r-3.5;}if(this.hover&&s.pattern[this.hover.row][this.hover.col])this.ghost.visible=false;this.dirty=true}
 select(row,col){this.selected=row===null?null:{row,col};this.dirty=true}
 setTool(tool){this.tool=tool;this.canvas.style.cursor=tool==='orbit'?'grab':tool==='erase'?'crosshair':'default';this.ghost.visible=false}
 setView(){this.top=!this.top;this.targetElevation=this.top?1.52:.67;this.targetAngle=this.top?0:.25;this.dirty=true}
 resetView(){this.top=false;this.targetElevation=.67;this.targetAngle=.25;this.targetZoom=1}
 trigger(step){this.step=step;this.playhead.visible=true;this.playheadTarget=step-7.5;this.currentHead=this.playheadTarget;const s=this.getState();for(let r=0;r<8;r++){const n=s.pattern[r][step];if(n&&audible(s,r)){const a=this.anim[r*16+step];if(!this.reduced){a.velocity=2.7*n.velocity;a.offset=.035}a.pulse=1;this.floatNote(r,step,n)}}this.dirty=true}
 hit(row,col){const a=this.anim[row*16+col];if(a){a.velocity=2.2;a.pulse=1;this.dirty=true}}
 stopped(reset=false){if(reset){this.step=-1;this.playhead.visible=false;}this.dirty=true}
 floatNote(row,col,n){if(this.reduced||this.floating.length>20)return;const mat=new THREE.SpriteMaterial({map:this.noteSymbol,color:noteColor(n.pitch),transparent:true,opacity:.9,depthWrite:false});const spr=new THREE.Sprite(mat);spr.position.set(col-7.5,1.4,row-3.5);spr.scale.set(.32,.32,.32);this.root.add(spr);this.floating.push({spr,life:0,x:spr.position.x,drift:Math.sin(col*7+row)*.22});}
 shatter(row,col){if(this.reduced)return;for(let j=0;j<8;j++){if(this.particles.length>=64)break;const angle=(j/8)*Math.PI*2;this.particles.push({x:col-7.5+(j%2-.5)*.2,y:.65,z:row-3.5,vx:Math.cos(angle)*1.5,vy:1.2+j*.1,vz:Math.sin(angle)*1.5,life:0})}this.dirty=true}
 pick(e){const rect=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);if(!(this.drag?.existing&&this.drag.moved)){const found=this.ray.intersectObjects(this.noteMeshes,false).find(hit=>this.anim[hit.object.userData.row*16+hit.instanceId]?.exists);if(found&&found.distance<80)return {row:found.object.userData.row,col:found.instanceId};}
  if(!this.ray.ray.intersectPlane(this.plane,this.intersection))return null;const col=Math.floor(this.intersection.x+8),row=Math.floor(this.intersection.z+4);if(col<0||col>15||row<0||row>7)return null;return {row,col};
 }
 bindEvents(){
  this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
  this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==2)return;this.canvas.setPointerCapture(e.pointerId);const cell=this.pick(e);this.drag={sx:e.clientX,sy:e.clientY,lastX:e.clientX,lastY:e.clientY,cell,moved:false,mode:this.tool==='orbit'?'orbit':e.button===2?'erase':this.tool};this.lastPaint='';if(this.drag.mode==='orbit'){this.canvas.style.cursor='grabbing';return}if(cell){if(this.drag.mode==='erase'){this.callbacks.erase(cell.row,cell.col);this.lastPaint=`${cell.row}:${cell.col}`}else if(this.getState().pattern[cell.row][cell.col]){this.drag.existing=true;this.callbacks.select(cell.row,cell.col)}else{this.callbacks.place(cell.row,cell.col);this.lastPaint=`${cell.row}:${cell.col}`;this.drag.paint=true}}});
  this.canvas.addEventListener('pointermove',e=>{
   const cell=this.pick(e);this.hover=cell;if(this.drag){const d=this.drag;const dx=e.clientX-d.lastX,dy=e.clientY-d.lastY;d.lastX=e.clientX;d.lastY=e.clientY;if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>6)d.moved=true;if(d.mode==='orbit'){this.targetAngle-=dx*.007;this.targetElevation=clamp(this.targetElevation+dy*.005,.35,1.53);this.top=false;return}if(cell&&d.moved){const key=`${cell.row}:${cell.col}`;if(d.mode==='erase'&&key!==this.lastPaint){this.callbacks.erase(cell.row,cell.col);this.lastPaint=key}else if(d.paint&&key!==this.lastPaint){this.callbacks.place(cell.row,cell.col);this.lastPaint=key}}}
   this.updateHover(cell,e);this.dirty=true;
  });
  const up=e=>{if(!this.drag)return;const d=this.drag,cell=this.pick(e);if(d.existing&&d.moved&&cell){this.callbacks.move(d.cell.row,d.cell.col,cell.row,cell.col)}else if(d.existing&&!d.moved&&cell){this.callbacks.audition(cell.row,cell.col)}this.drag=null;this.canvas.style.cursor=this.tool==='orbit'?'grab':'default';if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);this.dirty=true};
  this.canvas.addEventListener('pointerup',up);this.canvas.addEventListener('pointercancel',()=>{this.drag=null;this.dirty=true});
  this.canvas.addEventListener('pointerleave',()=>{if(!this.drag){this.hover=null;this.ghost.visible=false;this.hoverTile.visible=false;this.callbacks.hover(null);this.dirty=true}});
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();const cell=this.pick(e);if(cell&&this.getState().pattern[cell.row][cell.col]&&this.tool!=='orbit'){if(!this.wheelAt||performance.now()-this.wheelAt>95){this.callbacks.pitch(cell.row,cell.col,e.deltaY<0?1:-1);this.wheelAt=performance.now()}}else this.targetZoom=clamp(this.targetZoom-e.deltaY*.0005,.75,1.6);this.dirty=true},{passive:false});
 }
 updateHover(cell,e){const s=this.getState();if(cell&&this.tool!=='orbit'){const n=s.pattern[cell.row][cell.col];this.hoverTile.visible=true;this.hoverTile.position.set(cell.col-7.5,.221,cell.row-3.5);this.ghost.visible=false;this.ghost=this.ghosts[cell.row];this.ghost.visible=!n&&this.tool==='place';if(this.ghost.visible)this.ghost.position.set(cell.col-7.5,.62,cell.row-3.5);this.callbacks.hover(cell,e)}else{this.hoverTile.visible=false;this.ghost.visible=false;this.callbacks.hover(null)} }
 frame(now){const dt=Math.min((now-(this.lastFrame||now))/1000,.033);this.lastFrame=now;this.time+=dt;const s=this.getState();const t=this.time;
  this.angle+=(this.targetAngle-this.angle)*Math.min(1,dt*9);this.elevation+=(this.targetElevation-this.elevation)*Math.min(1,dt*9);this.zoom+=(this.targetZoom-this.zoom)*Math.min(1,dt*10);this.camera.zoom=this.zoom;this.camera.updateProjectionMatrix();const distance=29;this.camera.position.set(Math.sin(this.angle)*Math.cos(this.elevation)*distance,Math.sin(this.elevation)*distance,Math.cos(this.angle)*Math.cos(this.elevation)*distance);this.camera.lookAt(0,-.25,-.25);
  for(let r=0;r<8;r++)for(let c=0;c<16;c++){const i=r*16+c,a=this.anim[i],n=s.pattern[r][c];if(!n){v.position.set(c-7.5,-10,r-3.5);v.scale.setScalar(0);v.rotation.set(0,0,0);v.updateMatrix();this.noteMeshes[r].setMatrixAt(c,v.matrix);this.markers.setMatrixAt(i,v.matrix);continue;}
   if(!this.reduced){a.velocity+=(-a.offset*185-a.velocity*17)*dt;a.offset+=a.velocity*dt;if(Math.abs(a.offset)<.0005&&Math.abs(a.velocity)<.003){a.offset=0;a.velocity=0}}else a.offset=0;
   a.pulse=Math.max(0,a.pulse-dt*3.6);let x=c-7.5,z=r-3.5,y=this.restHeight+a.offset;
   if(this.drag?.existing&&this.drag.moved&&this.drag.cell.row===r&&this.drag.cell.col===c&&this.hover){x=this.hover.col-7.5;z=this.hover.row-3.5;y=1.2;}
   // The model stays an upright cube; motion only lifts it from its own cell.
   v.position.set(x,y,z);v.scale.setScalar(1);v.rotation.set(0,0,0);v.updateMatrix();
   this.noteMeshes[r].setMatrixAt(c,v.matrix);this.noteMeshes[r].setColorAt(c,color.set(audible(s,r)?'#ffffff':'#777777').convertSRGBToLinear());
   v.position.set(x,y-.27,z+this.blockSize/2+.012);v.updateMatrix();this.markers.setMatrixAt(i,v.matrix);
   color.set(noteColor(n.pitch)).convertSRGBToLinear();if(a.pulse)color.lerp(new THREE.Color('#ffffff'),a.pulse*.35);if(!audible(s,r))color.multiplyScalar(.4);this.markers.setColorAt(i,color);
  }
  for(const mesh of this.noteMeshes){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true}this.markers.instanceMatrix.needsUpdate=true;this.markers.instanceColor.needsUpdate=true;
  if(this.selected){const {row,col}=this.selected;const a=this.anim[row*16+col];this.outline.visible=!!s.pattern[row][col];this.outline.position.set(col-7.5,this.restHeight+a.offset,row-3.5)}else this.outline.visible=false;
  for(let i=this.floating.length-1;i>=0;i--){const f=this.floating[i];f.life+=dt;f.spr.position.y+=dt*.8;f.spr.position.x=f.x+Math.sin(f.life*2)*f.drift;f.spr.material.opacity=Math.max(0,.8-f.life*.65);if(f.life>1.3){this.root.remove(f.spr);f.spr.material.dispose();this.floating.splice(i,1)}}
  for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life+=dt;p.vy-=8*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.life>.65)this.particles.splice(i,1)}for(let i=0;i<64;i++){const p=this.particles[i];if(p){v.position.set(p.x,p.y,p.z);v.scale.setScalar(Math.max(0,1-p.life));v.rotation.set(p.life*4,p.life*3,p.life*5)}else v.scale.setScalar(0);v.updateMatrix();this.particleMesh.setMatrixAt(i,v.matrix)}this.particleMesh.instanceMatrix.needsUpdate=true;
  if(this.playhead.visible){this.playhead.position.x=this.currentHead;}
  for(let i=0;i<14;i++){v.position.set(Math.sin(i*31.7)*9,this.reduced?2:1.7+Math.sin(t*.35+i)*1.1,Math.cos(i*13.4)*5.4);v.scale.setScalar(.55+(i%3)*.2);v.rotation.set(t*.2,0,t*.1);v.updateMatrix();this.motes.setMatrixAt(i,v.matrix)}this.motes.instanceMatrix.needsUpdate=true;
  this.renderer.render(this.scene,this.camera);
 }
}
