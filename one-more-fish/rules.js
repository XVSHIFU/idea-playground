export const FISH = [
 {id:'silver',name:'银叶小鱼',color:'#d7efe3',fin:'#8dbdb4',weight:1,value:9,speed:22,min:0,max:1,desc:'近岸成群的小鱼，轻巧又安心。'},
 {id:'coral',name:'珊瑚鲷',color:'#ec9a7d',fin:'#ce7866',weight:2,value:22,speed:30,min:.12,max:.8,desc:'喜欢结伴游动，试试一网多捞几条。'},
 {id:'fat',name:'蓝胖胖',color:'#80b8c9',fin:'#4f91a8',weight:5,value:48,speed:14,min:.33,max:1,desc:'慢悠悠的大块头，一条就有 5 kg。'},
 {id:'puffer',name:'气鼓鼓河豚',color:'#dfc17a',fin:'#c2a763',weight:2.5,value:36,speed:20,min:.25,max:1,desc:'每隔一会儿鼓起来，暂时增加 2 kg 负担。'},
 {id:'eel',name:'闪闪电鳗',color:'#b5c989',fin:'#8aa06e',weight:3,value:58,speed:36,min:.55,max:1,desc:'装船后偶尔放电，短暂打断划船。'},
 {id:'gold',name:'落日金鱼',color:'#f7d16d',fin:'#e4a64d',weight:4,value:100,speed:37,min:.7,max:1,desc:'远海的金色小惊喜。值钱，也有分量。'},
 {id:'bottle',name:'漂流瓶',color:'#9bd8c0',fin:'#f3e6bb',weight:.5,value:16,speed:7,min:.15,max:1,desc:'带回码头，会读到写给大海的小纸条。'}
];
export const BOATS=[{name:'小木盆',capacity:16},{name:'橡木小舟',capacity:25},{name:'薄荷渔船',capacity:38},{name:'海湾小船长',capacity:52}];
export const UPGRADES={boat:{title:'换一艘好船',icon:'⛵',costs:[80,210,460],desc:'更大的载重，给贪心多留一点余地。'},net:{title:'织一张大网',icon:'◎',costs:[55,150,340],desc:'每级增加 18 的网幅，鱼群不再漏网。'},oar:{title:'换一对轻桨',icon:'≈',costs:[45,130,280],desc:'每级提高 18% 划速，满载也能从容返航。'}};
export const GOALS=[{id:'first',name:'第一次满载而归',desc:'累计带回 5 条鱼',need:5,key:'sold',reward:30},{id:'income',name:'有点厉害的小渔夫',desc:'累计卖鱼赚到 250 贝币',need:250,key:'earned',reward:60},{id:'species',name:'海湾的老朋友',desc:'带回全部 7 种海湾发现',need:7,key:'species',reward:120},{id:'captain',name:'小木盆的大梦想',desc:'把船升级到最高等级',need:3,key:'boat',reward:180},{id:'hundred',name:'再捞一百条',desc:'累计带回 100 条鱼',need:100,key:'sold',reward:200}];
export function defaultSave(){return{version:1,coins:0,boat:0,net:0,oar:0,sold:0,earned:0,trips:0,discovered:{},claimed:[],best:0,sound:false};}
export function cleanSave(input){const s=defaultSave();if(!input||input.version!==1)return s;for(const k of ['coins','sold','earned','trips','best'])s[k]=Number.isFinite(input[k])?Math.max(0,Math.floor(input[k])):0;for(const k of ['boat','net','oar'])s[k]=Number.isFinite(input[k])?Math.max(0,Math.min(3,Math.floor(input[k]))):0;s.discovered=Object.fromEntries(FISH.filter(f=>input.discovered?.[f.id]>0).map(f=>[f.id,Math.floor(input.discovered[f.id])]));s.claimed=GOALS.filter(g=>input.claimed?.includes(g.id)).map(g=>g.id);s.sound=!!input.sound;return s;}
export function weight(cargo){return cargo.reduce((n,f)=>n+FISH[f.type].weight,0);}
export function value(cargo){return cargo.reduce((n,f)=>n+FISH[f.type].value,0);}
export function goalValue(s,g){return g.key==='species'?Object.keys(s.discovered).length:s[g.key];}
export function settle(s,cargo,rescue=false){const gross=value(cargo),income=rescue?Math.floor(gross*.25):gross;const result={income,count:cargo.length,newSpecies:[],bonus:0,rescue};s.coins+=income;s.earned+=income;s.trips++;s.best=Math.max(s.best,income);if(!rescue){s.sold+=cargo.filter(f=>f.type!==6).length;for(const f of cargo){const id=FISH[f.type].id;if(!s.discovered[id])result.newSpecies.push(id);s.discovered[id]=(s.discovered[id]||0)+1;}}for(const g of GOALS){if(!s.claimed.includes(g.id)&&goalValue(s,g)>=g.need){s.claimed.push(g.id);s.coins+=g.reward;result.bonus+=g.reward;}}return result;}
export function buy(s,key){const u=UPGRADES[key];if(!u)return false;const cost=u.costs[s[key]];if(cost===undefined||s.coins<cost)return false;s.coins-=cost;s[key]++;return true;}

// One geometry definition drives preview, highlighting, and capture.
export function aimCenter(player,pointer,angle=0,reach=170){
 const goal=pointer||{x:player.x+Math.cos(angle)*100,y:player.y+Math.sin(angle)*100};
 const dx=goal.x-player.x,dy=goal.y-player.y,d=Math.hypot(dx,dy),scale=d>reach?reach/d:1;
 return{x:player.x+dx*scale,y:player.y+dy*scale};
}
export function netRadius(level,seconds){return 24+(108+level*18-24)*Math.max(0,Math.min(seconds/1.8,1));}
export function inNet(fish,net){return Math.hypot(fish.x-net.x,fish.y-net.y)<=net.r;}
export function escapeAction(scene,hasNet){if(scene==='sea')return hasNet?'cancel':'pause';if(scene==='pause')return'resume';if(scene==='harbor')return'closeHarbor';return'none';}
