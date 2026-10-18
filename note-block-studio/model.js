export const INSTRUMENTS = [
 {id:'harp',name:'草方块',label:'钢琴',en:'HARP',color:'#8ca75b',texture:'grass-top',icon:'grass',base:66,octave:0,volume:.8},
 {id:'bass',name:'橡木',label:'贝斯',en:'BASS',color:'#aa8865',texture:'wood-top',icon:'wood',base:42,octave:-24,volume:.78},
 {id:'basedrum',name:'石头',label:'底鼓',en:'KICK',color:'#929a94',texture:'stone',icon:'stone',base:66,octave:0,drum:true,volume:.9},
 {id:'snare',name:'沙子',label:'军鼓',en:'SNARE',color:'#d4c29a',texture:'sand',icon:'sand',base:66,octave:0,drum:true,volume:.45},
 {id:'hat',name:'玻璃',label:'踩镲',en:'HI-HAT',color:'#a3bdbe',texture:'glass',icon:'glass',base:66,octave:0,drum:true,volume:.36},
 {id:'bell',name:'金块',label:'钟琴',en:'BELL',color:'#cdb671',texture:'gold',icon:'gold',base:90,octave:24,volume:.48},
 {id:'flute',name:'黏土',label:'长笛',en:'FLUTE',color:'#a1aebc',texture:'clay',icon:'clay',base:78,octave:12,volume:.45},
 {id:'pling',name:'荧石',label:'叮咚',en:'PLING',color:'#d1b985',texture:'glowstone',icon:'glowstone',base:66,octave:0,volume:.38}
];
export const SCALES={pentatonic:[55,57,60,62,64,67,69,72,74,76,79],minor:[57,60,62,64,67,69,72,74,76,79,81],chromatic:Array.from({length:25},(_,i)=>54+i)};
export function noteName(m){const n=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];return n[m%12]+(Math.floor(m/12)-1)}
export function noteColor(m){const colors=['#a3b972','#b2bf80','#c7bc72','#d3b773','#d6a376','#c98d71','#c48a83','#b496b9','#aaa6c4','#8eadbd','#8eb4aa','#95b391'];return colors[m%12]}
const empty=()=>Array.from({length:8},()=>Array(16).fill(null));
function makePattern(defs){const p=empty();defs.forEach((r,i)=>r.forEach(v=>{p[i][v[0]]={pitch:v[1]??60,velocity:v[2]??.8}}));return p}
export const PRESETS=[
 {name:'草地上的午后',description:'轻轻的钢琴，和阳光一起慢下来。',bpm:88,scale:'pentatonic',swing:8,art:'♧',pattern:makePattern([
 [[0,60],[2,64],[4,67],[6,64],[8,62],[10,67],[12,69],[14,67]],
 [[0,60,.8],[6,67,.6],[8,57,.8],[14,64,.6]],
 [[0,60,.8],[8,60,.8]],[[4,60,.55],[12,60,.6]],[[2,60,.35],[6,60,.3],[10,60,.35],[14,60,.3]],
 [[0,72,.5],[8,69,.5]],[],[[7,72,.5],[15,74,.5]]])},
 {name:'雨林漫步',description:'木质低音与长笛，走进绿色的梦。',bpm:74,scale:'minor',swing:15,art:'♬',pattern:makePattern([
 [[0,57,.7],[4,64,.65],[8,60,.7],[12,67,.6]],[[0,57,.85],[7,64,.7],[8,60,.85],[15,67,.6]],
 [[0,60,.7],[6,60,.45],[8,60,.75]],[[4,60,.45],[12,60,.55]],[[2,60,.3],[6,60,.3],[10,60,.25],[14,60,.35]],
 [[3,69,.4],[11,72,.4]],[[0,69,.6],[3,67,.55],[6,64,.7],[8,72,.55],[11,69,.6],[14,67,.55]],[[15,69,.35]]])},
 {name:'红石小派对',description:'一点摇摆，让每块石头都跳起来。',bpm:116,scale:'pentatonic',swing:28,art:'⚡',pattern:makePattern([
 [[0,60,.85],[3,64,.7],[6,67,.8],[8,60,.85],[11,69,.7],[14,67,.8]],
 [[0,60,.8],[3,60,.65],[6,67,.7],[8,57,.8],[11,57,.65],[14,64,.7]],
 [[0,60,.85],[6,60,.8],[8,60,.85],[14,60,.75]],[[4,60,.7],[12,60,.75]],
 [[0,60,.32],[2,60,.4],[4,60,.3],[6,60,.45],[8,60,.3],[10,60,.45],[12,60,.3],[14,60,.4],[15,60,.25]],
 [[2,72,.5],[10,74,.5]],[],[[7,67,.55],[15,72,.6]]])}
];
export function initialState(){return {version:1,name:PRESETS[0].name,pattern:structuredClone(PRESETS[0].pattern),bpm:88,scale:'pentatonic',swing:8,volume:.7,reverb:.24,mutes:Array(8).fill(false),solos:Array(8).fill(false),defaultPitch:60,defaultVelocity:.8}}
export function validateState(s){
 if(!s||s.version!==1||!Array.isArray(s.pattern)||s.pattern.length!==8)throw Error('作品格式不正确');
 const result=initialState();
 result.pattern=s.pattern.map(row=>{if(!Array.isArray(row)||row.length!==16)throw Error('音序需要 8 轨 × 16 步');return row.map(n=>{if(n===null)return null;if(!n||!Number.isInteger(n.pitch)||n.pitch<36||n.pitch>96||!Number.isFinite(n.velocity)||n.velocity<.1||n.velocity>1)throw Error('音符数据不正确');return {pitch:n.pitch,velocity:n.velocity}})});
 for(const [key,min,max] of [['bpm',40,200],['swing',0,45],['volume',0,1],['reverb',0,.65],['defaultPitch',36,96],['defaultVelocity',.1,1]])if(Number.isFinite(s[key]))result[key]=Math.min(max,Math.max(min,s[key]));
 if(typeof s.name==='string')result.name=s.name.slice(0,32);
 if(Object.hasOwn(SCALES,s.scale))result.scale=s.scale;
 for(const k of ['mutes','solos'])if(Array.isArray(s[k])&&s[k].length===8)result[k]=s[k].map(Boolean);
 return result;
}
export function audible(s,row){return !s.mutes[row]&&(!s.solos.some(Boolean)||s.solos[row])}
export function shiftedPitch(pitch,dir,scale){const notes=SCALES[scale];if(dir>0)return notes.find(n=>n>pitch)??notes.at(-1);return [...notes].reverse().find(n=>n<pitch)??notes[0]}
export function stepDuration(bpm,swing,step){return 60/bpm/4*(1+(step%2===0?1:-1)*swing/100)}
