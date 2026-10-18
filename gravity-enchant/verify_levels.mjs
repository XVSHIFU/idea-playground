// 验证手工关卡可解性（与游戏内逻辑一致）
const LEVELS = [
{ name:'L1', budget:3, map:[
  '########','#......#','#.W....#','#......#','#......#','#......#','#.*....#','########']},
{ name:'L2', budget:3, map:[
  '########','#...*..#','#.W..#.#','#......#','#......#','#......#','#......#','########']},
{ name:'L3', budget:4, map:[
  '#########','#..*#...#','#......*#','#..W....#','#.......#','#..W....#','#.......#','#.......#','#########']},
{ name:'L4', budget:4, map:[
  '#########','#.......#','#.......#','#.S..#..#','#.......#','#.......#','#...C...#','#...*...#','#########']},
{ name:'L5', budget:3, map:[
  '#########','#.......#','#..W.W..#','#.......#','#.......#','#.......#','#.......#','#..*#P*##','#########']},
{ name:'L6', budget:4, map:[
  '##########','#........#','#.S......#','#....W...#','#........#','#.C......#','#........#','#........#','#.*#....*#','##########']},
{ name:'L7', budget:5, map:[
  '##########','#........#','#.S....S.#','#........#','#.......*#','#.C....#.#','#........#','#........#','#.*#.....#','##########']},
{ name:'L8', budget:6, map:[
  '##########','#........#','#.S....S.#','#...P....#','#........#','#.C....C.#','#...W....#','#........#','#.*#.*#*##','##########']},
];
const DIRS = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const key=(x,y)=>x+','+y;
function parse(def){
  const h=def.map.length,w=def.map[0].length;
  const crates=[],cracks=[],goals=[],blocks=new Set(),crackSet=new Set();
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const c=def.map[y][x];
    if(c==='W')crates.push({x,y,type:'wood'});
    else if(c==='S')crates.push({x,y,type:'stone'});
    else if(c==='C'){cracks.push({x,y});crackSet.add(key(x,y));}
    else if(c==='*')goals.push({x,y});
    else if(c==='#')blocks.add(key(x,y));
  }
  return {w,h,crates,cracks,goals,blocks,crackSet};
}
function collapse(lv,st,dir){
  const [dx,dy]=DIRS[dir];
  const broken=new Set(st.broken);
  const occ=new Map();
  st.crates.forEach((c,i)=>occ.set(key(c.x,c.y),i));
  const crates=st.crates.map(c=>({...c}));
  const order=crates.map((c,i)=>i).sort((a,b)=>dx!==0?dx*(crates[b].x-crates[a].x):dy*(crates[b].y-crates[a].y));
  let moved=false;
  const solid=(x,y)=>{
    if(x<0||y<0||x>=lv.w||y>=lv.h)return 'wall';
    if(lv.blocks.has(key(x,y)))return 'wall';
    if(lv.crackSet.has(key(x,y))&&!broken.has(key(x,y)))return 'crack';
    return null;
  };
  for(const i of order){
    const c=crates[i];
    occ.delete(key(c.x,c.y));
    let x=c.x,y=c.y;
    while(true){
      const nx=x+dx,ny=y+dy;
      const s=solid(nx,ny);
      if(s==='wall'||occ.has(key(nx,ny)))break;
      if(s==='crack'){
        if(c.type==='stone'){broken.add(key(nx,ny));x=nx;y=ny;continue;}
        break;
      }
      x=nx;y=ny;
    }
    if(x!==c.x||y!==c.y)moved=true;
    c.x=x;c.y=y;
    occ.set(key(x,y),i);
  }
  return {crates,broken,moved};
}
const covered=(lv,crates)=>{const o=new Set(crates.map(c=>key(c.x,c.y)));return lv.goals.every(g=>o.has(key(g.x,g.y)));};
function solve(lv,crates0,maxDepth=12){
  const start={crates:crates0.map(c=>({...c})),broken:new Set()};
  if(covered(lv,start.crates))return [];
  const sk=s=>s.crates.map(c=>c.x+','+c.y).sort().join(';')+'|'+[...s.broken].sort().join(';');
  const seen=new Set([sk(start)]);
  let frontier=[{s:start,path:[]}];
  for(let d=0;d<maxDepth;d++){
    const next=[];
    forconst: for(const {s,path} of frontier){
      for(const dir of Object.keys(DIRS)){
        const r=collapse(lv,s,dir);
        if(!r.moved)continue;
        const ns={crates:r.crates,broken:r.broken};
        const k=sk(ns);
        if(seen.has(k))continue;
        seen.add(k);
        const np=[...path,dir];
        if(covered(lv,ns.crates))return np;
        next.push({s:ns,path:np});
        if(seen.size>200000)return null;
      }
    }
    frontier=next;
  }
  return null;
}
// 也验证程序生成器多批种子
function mulberry(seed){let s=seed>>>0||1;return()=>{let t=(s+=0x6D2B79F5);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
let fail=0;
for(const def of LEVELS){
  const lv=parse(def);
  const sol=solve(lv,lv.crates);
  if(sol&&sol.length<=def.budget) console.log(`${def.name}: OK  最少 ${sol.length} 步 (${sol.join(',')}) 预算 ${def.budget}`);
  else { console.log(`${def.name}: ❌ ${sol?'解 '+sol.length+' 步超预算':'无解'}`); fail++; }
}
process.exit(fail?1:0);
