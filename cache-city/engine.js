/* The story advances only when the player moves. No timers drive decay. */
export const places = {
  home: { names: ['白房间', '回信室', '白房间'], trace: '门边那道铅笔刻痕还在。', versions: ['门边留着一张纸条：“去钟楼看看，回来告诉我几点了。”窗外的城安静得像一封还没拆开的信。', '纸条折成了信封。收件人一栏写着：那个还会回来的人。', '墙壁重新变白。你记得这里曾经等过一封信。'], choices: ['回来告诉我几点了。', '这里有人在等我。'] },
  tower: { names: ['钟楼', '无钟之塔', '门房'], trace: '墙上一直有一个浅色的圆。', versions: ['铜钟停在 3:17。你把这个时间默念了一遍。楼梯上落着细细的灰，像没人用完的下午。', '钟面不见了，只留下圆形的浅色印记。这里每天下午会响一次，但没人记得什么在响。', '塔变成了门房。看门人指着那道圆印：“门牌以前就挂在这里。”一条通往院子的窄路出现了。'], choices: ['3:17。', '这里曾经有一口钟。'] },
  bakery: { names: ['面包店', '议事铺', '可颂市政厅'], trace: '空气里仍有黄油的香气。', versions: ['老板正在给最后一只可颂戴上纸帽。菜单写着：今日供应，面包与一些可靠的消息。', '长桌上没有面包，只有等待表决的菜单。每个人发言前都要先掸掉衣襟上的碎屑。', '一只戴帽子的可颂坐在市长的位置上。它郑重宣布：明天，全城的阴影都应当烤得酥脆。'], choices: ['面包店的老板最有威望。', '今日供应：热面包。'] },
  bridge: { names: ['小桥', '渡口', '干涸的河床'], trace: '两岸仍留着同样的石栏。', versions: ['水从桥下流过，带走倒映的地名。你在石栏上发现一句刻字：“对岸也在寻找这里。”', '桥面消失了。摆渡人坐在石栏旁，向每一段回忆收取一张船票。', '河水成了一条白色小径。你走在从前的水底，头顶没有桥，只有两岸熟悉的石栏。'], choices: ['对岸也在寻找这里。', '这里可以走过去。'] },
  garden: { names: ['小花园', '名字苗圃', '未命名花园'], trace: '那张绿色长椅没有挪过。', versions: ['长椅旁长着一丛没有挂牌的花。园丁说，叫不出名字的东西，在这里反而活得久。', '每块小木牌都发了芽。园丁把名字剪下来，放进盛满清水的玻璃瓶。', '花已经开满了曾经的小路。绿色长椅上放着一张空白名牌，像在等你坐下。'], choices: ['不必记住每一种花的名字。', '这里有一张绿色长椅。'] },
  yard: { names: ['院子', '钟声收藏室', '下午陈列馆'], trace: '院中悬着一根没有系东西的绳。', versions: ['门房后是一座小院。风穿过空绳，发出很轻的一声。也许钟只是换了一种存在方式。', '玻璃罐排在窗台上，每只都装着一声迟到的钟响。标签上没有日期。', '这里收藏着所有没有走完的下午。你在一个空位前停下，它恰好容得下 3:17。'], choices: ['钟声也可以被收藏。', '下午还没有结束。'] },
};
export const baseEdges = [['home','tower'],['home','garden'],['tower','bakery'],['bakery','bridge'],['bridge','garden']];
export function freshState() { return { version: 1, at: 'home', turns: 0, ages: Object.fromEntries(Object.keys(places).map(k=>[k,0])), stages: Object.fromEntries(Object.keys(places).map(k=>[k,0])), seen: ['home'], anchors: [], log: ['你从白房间出发。'], reported: false }; }
export function edges(s) { return [...baseEdges, ...(s.stages.tower >= 2 ? [['tower','yard']] : [])]; }
export function neighbors(s) { return edges(s).filter(e=>e.includes(s.at)).map(e=>e.find(x=>x!==s.at)); }
export function view(s,id=s.at) {
  const p=places[id], stage=s.stages[id], anchor=s.anchors.find(a=>a.id===id);
  let name=p.names[stage], body=p.versions[stage];
  if (stage>=2 && anchor) {
    if (id==='tower') { name=anchor.text==='3:17。'?'3:17 号门房':'修钟铺'; body=anchor.text==='3:17。'?'门牌上清清楚楚写着“3:17”。看门人说，这从来不是时间，而是一个地址。墙上的圆印没有反驳他。门后通往一座院子。':'桌上铺满了不再计时的钟。修钟人说：“你留下的那句话，让大家相信这里还需要一位修钟人。”铺子后面通往一座院子。'; }
    if (id==='bakery' && anchor.text.includes('热面包')) { name='夜间面包店'; body='议事桌又成了揉面台。无论城市如何改口，菜单都答应过供应热面包。于是，每一场会议结束后，总有人留下来生火。'; }
    if (id==='bridge') body += anchor.text.includes('走过去')?'那句话变成了路标。你依然可以步行穿过这里。':'两岸的人开始互写寻人启事。纸张铺成另一座桥。';
    if (id==='garden') body += anchor.text.includes('长椅')?'一切都改了名字，长椅却成了这里的地标。':'园丁收起所有名牌，让花只管开。';
    if (id==='home') body += anchor.text.includes('等我')?'窗边摆了第二把椅子。有人为你的回来留了位置。':'每一封新信都询问时间，却没有一封要求相同的答案。';
    if (id==='yard') body += anchor.text.includes('钟声')?'人们循着你留下的文字，把听到的钟声带来。':'闭馆时间从牌子上消失了。这里的下午愿意再等一会儿。';
  }
  return {name,body,trace:p.trace,stage,anchor};
}
function note(s,text) { s.log.unshift(text); s.log=s.log.slice(0,40); }
export function move(s,to) {
  if (!neighbors(s).includes(to)) return false;
  s.turns++; s.at=to;
  for (const id of Object.keys(places)) {
    if(id===to) {s.ages[id]=0;continue;}
    if(id==='yard' && s.stages.tower<2) continue;
    s.ages[id]=Math.min(3,s.ages[id]+1);
    if(s.ages[id]>=3 && s.stages[id]<2) { const old=view(s,id).name; s.stages[id]++; s.ages[id]=0; note(s,`${old}的含义漂移了。`); if(id==='tower' && s.stages[id]===2) note(s,'钟楼后面出现了一条通往院子的新路。'); }
  }
  if(!s.seen.includes(to)) s.seen.push(to);
  note(s,`你来到${view(s,to).name}。`); return true;
}
export function anchor(s,text,replaceId) {
  if(!places[s.at].choices.includes(text)) return false;
  const own=s.anchors.find(a=>a.id===s.at);
  if(own) own.text=text;
  else { if(s.anchors.length>=2) {if(!s.anchors.some(a=>a.id===replaceId)) return false; s.anchors=s.anchors.filter(a=>a.id!==replaceId);} s.anchors.push({id:s.at,text}); }
  note(s,`你在${view(s).name}留下“${text}”`); return true;
}
export function restore(raw) {
  try { const s=JSON.parse(raw); if(s.version!==1 || !places[s.at] || !Number.isInteger(s.turns) || s.turns<0 || !Array.isArray(s.seen) || !s.seen.every(k=>places[k]) || !Array.isArray(s.anchors) || s.anchors.length>2 || new Set(s.anchors.map(a=>a.id)).size!==s.anchors.length || !s.anchors.every(a=>places[a.id]?.choices.includes(a.text)) || !Array.isArray(s.log) || !s.log.every(t=>typeof t==='string') || !Object.keys(places).every(k=>Number.isInteger(s.stages[k])&&s.stages[k]>=0&&s.stages[k]<=2&&Number.isInteger(s.ages[k])&&s.ages[k]>=0&&s.ages[k]<=3)) return freshState(); return s; } catch { return freshState(); }
}
