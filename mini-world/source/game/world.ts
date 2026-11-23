import * as THREE from 'three';
export type Region = 'forest' | 'desert' | 'ocean';
export const RADIUS = 12;
export const WATER = 12.18;
export function normalAt(lon: number, lat: number) {
  return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat));
}
export function sample(n: THREE.Vector3) {
  const ripple = Math.sin(n.x * 17 + n.y * 9) * Math.cos(n.z * 13 - n.y * 11) * .026 + Math.sin(n.y * 27 + n.z * 7) * .015;
  const continents: [number, number, number, Region][] = [[-.49,.28,.67,'forest'],[.68,.06,.60,'desert'],[-2.1,-.25,.69,'forest'],[2.15,.3,.55,'desert']];
  let depth = -10; let region: Region = 'ocean';
  for (const [lon,lat,size,name] of continents) {
    const d = size - Math.acos(THREE.MathUtils.clamp(n.dot(normalAt(lon,lat)),-1,1)) + ripple;
    if (d > depth) { depth=d;region=name; }
  }
  const hill = (Math.sin(n.x * 10 + n.z * 4) * Math.cos(n.y * 12) + 1) * .13;
  const radius = RADIUS + THREE.MathUtils.smoothstep(depth, -.05, .16) * (.52 + hill) - Math.max(0,-depth) * .4;
  const swimming = radius < WATER + .015;
  return {radius,depth,region: swimming ? 'ocean' as Region : region,landRegion:region,swimming};
}
export const DESTINATIONS = {
  forest: {lon:-.37,lat:.27,name:'Whispering Woods',short:'Forest',tag:'A little wild. A lot of wonder.',color:'#698d48'},
  desert: {lon:.68,lat:.08,name:'Sunshine Dunes',short:'Desert',tag:'Warm sand and happy little surprises.',color:'#b98a45'},
  ocean: {lon:.08,lat:-.32,name:'Bubble Bay',short:'Ocean',tag:'Wiggle your toes. Make a splash.',color:'#398f9c'},
};
export const DISCOVERIES: {id:string; name:string; icon:string; region:Region;lon:number;lat:number;message:string}[] = [
  {id:'leaf',name:'Little leaf',icon:'🍃',region:'forest',lon:-.27,lat:.32,message:'A little leaf, just for you!'},
  {id:'mushroom',name:'Spotty mushroom',icon:'🍄',region:'forest',lon:-.55,lat:.14,message:'You found a spotty mushroom!'},
  {id:'bunny',name:'Bunny buddy',icon:'🐇',region:'forest',lon:-.65,lat:.43,message:'A new bunny friend!'},
  {id:'butterfly',name:'Blue butterfly',icon:'🦋',region:'forest',lon:-.18,lat:.59,message:'Hello, beautiful butterfly!'},
  {id:'cactus',name:'Cuddly cactus',icon:'🌵',region:'desert',lon:.61,lat:.17,message:'A happy little cactus!'},
  {id:'gem',name:'Sunshine crystal',icon:'💎',region:'desert',lon:.9,lat:.23,message:'A crystal full of sunshine!'},
  {id:'camel',name:'Desert friend',icon:'🐪',region:'desert',lon:.83,lat:-.18,message:'You made a desert friend!'},
  {id:'flower',name:'Desert flower',icon:'🌼',region:'desert',lon:.46,lat:-.1,message:'A flower growing in the sand!'},
  {id:'shell',name:'Seashell treasure',icon:'🐚',region:'ocean',lon:.06,lat:-.27,message:'Listen! A seashell from the sea!'},
  {id:'turtle',name:'Tiny turtle',icon:'🐢',region:'ocean',lon:-.14,lat:-.49,message:'A turtle wants to swim with you!'},
  {id:'fish',name:'Friendly fish',icon:'🐠',region:'ocean',lon:.18,lat:-.63,message:'A colorful fish says hello!'},
  {id:'starfish',name:'Ocean star',icon:'⭐',region:'ocean',lon:.37,lat:-.44,message:'You found a star in the ocean!'},
];
export function seededRandom(seed=8451) {return () => {seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
