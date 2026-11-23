import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const scene=new THREE.Scene(); scene.background=new THREE.Color(0xa9c8d0); scene.fog=new THREE.FogExp2(0xb7cdd0,.0092);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,320); camera.position.set(64,38,70);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08; document.querySelector('#app').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9eff4,0x48554a,1.7));
const sun=new THREE.DirectionalLight(0xffd5a2,3.3); sun.position.set(-36,70,28); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:180}); scene.add(sun);

const B=1.45,NX=61,NZ=55,hx=30,hz=27,H=Array.from({length:NX},()=>Array(NZ).fill(0));
const gauss=(x,z,cx,cz,sx,sz,h)=>h*Math.exp(-(((x-cx)/sx)**2+((z-cz)/sz)**2));
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
function heightAt(x,z){let h=1.2+gauss(x,z,5,-3,10,9,24)+gauss(x,z,-10,2,10,11,18)+gauss(x,z,15,9,8,8,15)+gauss(x,z,-2,15,13,8,12)+gauss(x,z,-18,-12,8,8,10)-gauss(x,z,1,4,6,7,5.5);h+=(Math.sin(x*.42)+Math.cos(z*.35)+Math.sin((x+z)*.23))*.65+(hash(x,z)-.5)*1.15;const e=Math.max(Math.abs(x)/(hx*.98),Math.abs(z)/(hz*.98));h*=THREE.MathUtils.smoothstep(1.06-e,0,.55);return Math.max(0,Math.floor(h))}
for(let x=0;x<NX;x++)for(let z=0;z<NZ;z++)H[x][z]=heightAt(x-hx,z-hz);
const cube=new THREE.BoxGeometry(B,B,B), geos={rock:[],moss:[],grass:[],snow:[],earth:[]};
function kind(y,h,x,z){const r=hash(x*3+y,z*5-y);if(h>19&&y>h-3)return r>.2?'snow':'rock';if(y===h-1)return h>12?(r>.35?'rock':'moss'):(r>.22?'grass':'moss');if(y>h-4)return r>.48?'rock':'earth';return'rock'}
for(let ix=0;ix<NX;ix++)for(let iz=0;iz<NZ;iz++){const h=H[ix][iz];if(!h)continue;const x=(ix-hx)*B,z=(iz-hz)*B;for(let y=Math.max(0,h-4);y<h;y++){const g=cube.clone();g.translate(x,(y+.5)*B,z);geos[kind(y,h,ix,iz)].push(g)}}
const mats={rock:new THREE.MeshStandardMaterial({color:0x66726d,roughness:.96}),moss:new THREE.MeshStandardMaterial({color:0x61755a,roughness:1}),grass:new THREE.MeshStandardMaterial({color:0x71885c,roughness:1}),snow:new THREE.MeshStandardMaterial({color:0xd9e1da,roughness:.92}),earth:new THREE.MeshStandardMaterial({color:0x675d4c,roughness:1})};
for(const k in geos){if(!geos[k].length)continue;const m=new THREE.Mesh(mergeGeometries(geos[k],false),mats[k]);m.castShadow=m.receiveShadow=true;scene.add(m);geos[k].forEach(g=>g.dispose())}cube.dispose();
const ground=new THREE.Mesh(new THREE.BoxGeometry(118,2.4,110),new THREE.MeshStandardMaterial({color:0x596b50,roughness:1}));ground.position.y=-1.2;ground.receiveShadow=true;scene.add(ground);

const falls=new THREE.Group();scene.add(falls);const water=new THREE.MeshPhysicalMaterial({color:0x82d7e6,transparent:true,opacity:.78,roughness:.18,transmission:.08,emissive:0x164e62,emissiveIntensity:.22});const foam=new THREE.MeshBasicMaterial({color:0xdffbff,transparent:true,opacity:.72});
function waterfall(ix,iz,w=2){const top=H[ix][iz],x=(ix-hx)*B,z=(iz-hz)*B-B*.57,h=Math.max(8,top-1)*B;for(let i=0;i<w;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(B*.72,h,B*.16),water);s.position.set(x+(i-(w-1)/2)*B*.72,h/2,z);falls.add(s)}const p=new THREE.Mesh(new THREE.BoxGeometry(B*(w+2.3),.18,B*2.7),water);p.position.set(x,.14,z-B*.7);falls.add(p);for(let i=0;i<9;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(B*.28,.13,B*.28),foam);f.position.set(x+(hash(i,4)-.5)*B*w*1.5,.3,z-B*.8+(hash(i,8)-.5)*B*1.6);falls.add(f)}}
waterfall(34,20,2);waterfall(22,24,1);

const treeCube=new THREE.BoxGeometry(1,1,1), trunks=[],leaves=[];for(let ix=3;ix<NX-3;ix+=3)for(let iz=3;iz<NZ-3;iz+=3){const h=H[ix][iz];if(h<2||h>9||hash(ix,iz)<.48)continue;const x=(ix-hx)*B,z=(iz-hz)*B,y=h*B,t=treeCube.clone();t.scale(.45,2,.45);t.translate(x,y+1,z);trunks.push(t);for(const [dx,dy,dz,s]of[[0,2.7,0,1.8],[-.8,2.25,0,1.2],[.8,2.25,0,1.2],[0,2.25,.8,1.2],[0,2.25,-.8,1.2]]){const l=treeCube.clone();l.scale(s,s,s);l.translate(x+dx,y+dy,z+dz);leaves.push(l)}}
for(const [a,mat]of[[trunks,new THREE.MeshStandardMaterial({color:0x514638,roughness:1})],[leaves,new THREE.MeshStandardMaterial({color:0x405d43,roughness:1})]])if(a.length){const m=new THREE.Mesh(mergeGeometries(a,false),mat);m.castShadow=m.receiveShadow=true;scene.add(m);a.forEach(g=>g.dispose())}treeCube.dispose();

const cloudCube=new THREE.BoxGeometry(1,1,1),clouds=[];function cloud(cx,cy,cz,s,seed){const group=new THREE.Group();for(let i=0;i<18;i++){const a=hash(i+seed,seed*7+i)*Math.PI*2,r=Math.sqrt(hash(i*3,seed+2))*s*4.5,m=new THREE.Mesh(cloudCube,new THREE.MeshLambertMaterial({color:0xe9f1ee,transparent:true,opacity:.22+hash(i,seed)*.24,depthWrite:false}));m.scale.set(s*(2.2+hash(i,1)*2.4),s*(.65+hash(i,2)*.65),s*(1.3+hash(i,3)*2.2));m.position.set(cx+Math.cos(a)*r,cy+(hash(i,4)-.5)*s*1.4,cz+Math.sin(a)*r);group.add(m)}group.userData={phase:seed*.9,speed:.045+hash(seed,9)*.04};scene.add(group);clouds.push(group)}
cloud(-22,18,-8,2.2,3);cloud(12,19,8,2.5,8);cloud(30,17,-14,2,13);cloud(-2,16,25,2.1,21);
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime(),r=82;camera.position.set(Math.cos(t*.055)*r,35+Math.sin(t*.08)*4,Math.sin(t*.055)*r);camera.lookAt(0,14,0);clouds.forEach(c=>{c.position.x=Math.sin(t*c.userData.speed+c.userData.phase)*5;c.position.z=Math.cos(t*c.userData.speed*.7+c.userData.phase)*2});falls.children.forEach((m,i)=>{if(m.material===water)m.material.emissiveIntensity=.18+.08*Math.sin(t*3+i)});renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
