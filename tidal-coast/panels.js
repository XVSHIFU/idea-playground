/* Tide Town — in-world journals, workshops and community systems. */
(function () {
  'use strict';
  window.createSystemsUI = function (api) {
    const $ = id => document.getElementById(id);
    const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const st = () => api.getState();
    const item = id => Core.ITEMS[id] || {name:id, description:''};
    const icon = (id,size=40) => api.iconMarkup(id,size);
    const money = () => '<div class="sys-purse">可用金币 <strong>'+Number(st().money || 0).toLocaleString()+'</strong> G</div>';
    const duration = ms => {const seconds = Math.max(0,Math.ceil(ms/1000));return seconds >= 60 ? Math.floor(seconds/60)+'分'+String(seconds%60).padStart(2,'0')+'秒' : seconds+'秒';};
    const arrays = obj => Array.isArray(obj) ? obj : Object.entries(obj||{}).map(([id,v])=>({id,...v}));
    const canPay = (cost,coins=0) => st().money >= coins && Object.entries(cost||{}).every(([id,n])=>(st().inventory[id]||0)>=n);
    const material = (cost,coins=0) => '<div class="sys-materials">'+Object.entries(cost||{}).map(([id,n])=>'<span class="'+((st().inventory[id]||0)<n?'missing':'')+'">'+esc(item(id).name)+' <b>'+(st().inventory[id]||0)+'/'+n+'</b></span>').join('')+(coins?'<span class="'+(st().money<coins?'missing':'')+'">金币 <b>'+coins+'</b></span>':'')+'</div>';
    const button = (label,attrs='',disabled=false,style='primary') => '<button class="'+style+'" '+attrs+(disabled?' disabled':'')+'>'+label+'</button>';
    function shell(type,kicker,title,description,content) {
      api.openPanel(type,'<div class="system-page" data-system-page="'+type+'"><div class="eyebrow">'+esc(kicker)+'</div><h2>'+esc(title)+'</h2>'+(description?'<p class="subtitle">'+esc(description)+'</p>':'')+content+'</div>');
      api.paintIcons($('panelContent'));
    }
    function bind(attr,callback) {$('panelContent').querySelectorAll('['+attr+']').forEach(el=>el.onclick=()=>callback(el.getAttribute(attr),el));}
    function act(result,again){api.feedback(result);if(again)again();}
    function tabs(list,active,attr){return '<div class="sys-tabs">'+list.map(([id,name])=>'<button '+attr+'="'+id+'" class="'+(id===active?'active':'')+'">'+name+'</button>').join('')+'</div>';}
    function liveJob(job) {const r=Core.MACHINES[job.recipe]||{};const ready=Date.now()>=job.readyAt;return '<article class="sys-job"><div class="sys-job-icon">'+icon(r.output||'jar')+'</div><div><strong>'+esc(r.name||'加工中')+'</strong><small>'+esc(item(r.output||'').name)+' ×'+(r.amount||1)+'</small><span class="sys-time" data-ready-at="'+job.readyAt+'">'+(ready?'已经做好了':duration(job.readyAt-Date.now()))+'</span></div>'+button(ready?'收取':'制作中','data-collect-job="'+job.id+'" data-job-ready="'+job.readyAt+'"',!ready)+'</article>';}

    function craft(category='all') {
      const recipes = Object.entries(Core.RECIPES||{});
      const placeable = Object.keys(Core.ITEMS).filter(id=>Core.ITEMS[id].placeable);
      const cats = [['all','全部配方'],['farm','农场设施'],['work','加工与工具'],['decor','布置农场']];
      const categoryOf = id => ['fence','lamp','bench','flowerpot'].includes(id)?'decor':['sprinkler','coop','barn','scarecrow'].includes(id)?'farm':'work';
      const owned = placeable.filter(id=>(st().inventory[id]||0)>0);
      const cards = recipes.filter(([id])=>category==='all'||categoryOf(id)===category).map(([id,r])=>{
        const level = r.skill && Core.skillLevel ? Core.skillLevel(st(),r.skill) : 10;
        const locked = r.skill && level<(r.level||0);
        return '<article class="sys-recipe"><div class="sys-item-heading">'+icon(r.output||id,48)+'<div><strong>'+esc(r.name)+'</strong><small>制作 '+(r.amount||1)+' 件 · 已有 '+(st().inventory[r.output||id]||0)+'</small></div></div><p>'+esc(r.description||'用亲手收集的材料，给农场添一点新东西。')+'</p>'+material(r.cost,r.coins)+(locked?'<small class="sys-lock">需要 '+esc(({farming:'农耕',mining:'采矿',foraging:'采集',fishing:'钓鱼'})[r.skill]||r.skill)+' '+r.level+' 级</small>':'')+button(locked?'尚未掌握':'制作','data-craft="'+id+'"',locked||!canPay(r.cost,r.coins))+'</article>';
      }).join('');
      shell('craft','MADE WITH YOUR OWN HANDS','木匠的工作台','材料从背包中取用。设施制作完成后，带回农场选择位置摆放。',tabs(cats,category,'data-craft-tab')+(owned.length?'<div class="sys-ribbon"><strong>等待安置</strong><div class="sys-place-list">'+owned.map(id=>button(esc(item(id).name)+' ×'+st().inventory[id],'data-place="'+id+'"',false,'secondary')).join('')+'</div></div>':'')+'<div class="sys-recipe-grid">'+cards+'</div>'+money()+'<div class="panel-actions">'+button('看看加工设备','id="openProcesses"',false,'secondary')+'</div>');
      bind('data-craft-tab',craft);bind('data-craft',id=>act(Core.craft(st(),id,1),()=>craft(category)));
      bind('data-place',id=>{api.closePanel();api.beginPlacement(id);});$('openProcesses').onclick=process;
    }

    function process() {
      if(Core.tick)Core.tick(st());
      const jobs=st().jobs||[], built=st().built||{};
      const cards=Object.entries(Core.MACHINES||{}).map(([id,r])=>{
        const has=(built[r.machine]||0)>0;const busy=jobs.filter(j=>Core.MACHINES[j.recipe]?.machine===r.machine).length >= (built[r.machine]||0);
        return '<article class="sys-recipe"><div class="sys-item-heading">'+icon(r.output,44)+'<div><strong>'+esc(r.name)+'</strong><small>'+esc(item(r.machine).name)+' · '+duration(r.durationMs)+'</small></div></div>'+material(r.input)+'<p>产出 '+esc(item(r.output).name)+' ×'+(r.amount||1)+'</p>'+button(!has?'先建造'+esc(item(r.machine).name):busy?'设备忙碌中':'开始加工','data-process="'+id+'"',!has||busy||!canPay(r.input))+'</article>';
      }).join('');
      shell('process','A LITTLE TIME, A LITTLE MAGIC','农场加工坊','放入原料，等一会儿收取成品。离线期间，加工时间也会继续。',jobs.length?'<div class="sys-section-label">正在制作 · '+jobs.length+'</div><div class="sys-jobs">'+jobs.map(liveJob).join('')+'</div><div class="sys-section-label">制作清单</div><div class="sys-recipe-grid">'+cards+'</div>':'<div class="sys-recipe-grid">'+cards+'</div>');
      bind('data-process',id=>act(Core.startProcess(st(),id),process));bind('data-collect-job',id=>act(Core.collectProcess(st(),id),process));
    }

    function upgrade() {
      const tools=[['hoe','锄头'],['water','水壶'],['axe','斧头'],['pickaxe','镐子'],['rod','鱼竿']];
      const cards=tools.map(([id,name])=>{
        const c=Core.upgradeCost(st(),id),lv=st().tools?.[id]||0;
        return '<article class="sys-recipe"><div class="sys-item-heading">'+icon(id,48)+'<div><strong>'+name+'</strong><small>'+['基础','铜制','铁制','金制'][Math.min(lv,3)]+' · 等级 '+lv+'</small></div></div><p>'+esc(c.description||'升级后体力消耗降低，让每天的工作更轻松。')+'</p>'+(!c.maxed?material(c.cost,c.coins):'<div class="sys-complete">已经是最好的伙伴了</div>')+button(c.maxed?'已升至最高级':'升级至 '+(c.level||lv+1)+' 级','data-upgrade="'+id+'"',c.maxed||!canPay(c.cost,c.coins))+'</article>';
      }).join('');
      shell('upgrade','THE SOUND OF THE FORGE','岩叔的铁匠铺','带上矿石、金属锭和金币，让手边的旧工具陪你走得更远。','<div class="sys-recipe-grid">'+cards+'</div>'+money());
      bind('data-upgrade',id=>act(Core.upgradeTool(st(),id),upgrade));
    }

    function museum() {
      const donated=st().museum||[];
      const ids=[...Object.keys(Core.CROPS),...Object.keys(Core.FISH||{}),'gem','shell','copper','iron','gold','mushroom'];
      const known=ids.map(id=>[id,item(id)]);
      const inv=Object.entries(st().inventory).filter(([id,n])=>n>0&&!id.endsWith('-seed')&&ids.includes(item(id).crop||id)&&!donated.includes(item(id).crop||id));
      const all = known;
      shell('museum','EVERY LITTLE THING HAS A STORY','潮汐自然博物馆','每个展品只需捐出一份。亲手发现的风景，会在这里慢慢拼成小镇的故事。','<div class="sys-museum-summary"><b>'+donated.length+'</b><span>件藏品已点亮<br><small>新捐赠会获得金币与经验</small></span></div>'+(inv.length?'<div class="sys-section-label">背包里可以捐赠的发现</div><div class="sys-donation-grid">'+inv.map(([id])=>'<button class="sys-donate" data-donate="'+id+'">'+icon(id,36)+'<span>'+esc(item(id).name)+'</span><small>捐赠 1 份</small></button>').join('')+'</div>':'<div class="sys-note">背包里暂时没有新的展品。去钓鱼、采矿，或带一份刚收获的作物回来吧。</div>')+'<div class="sys-section-label">展品图鉴</div><div class="sys-collection">'+all.map(([id,i])=>'<div class="sys-collection-item '+(donated.includes(id)?'collected':'undiscovered')+'">'+icon(id,35)+'<span>'+esc(i.name)+'</span><small>'+(donated.includes(id)?'已入馆':'等待发现')+'</small></div>').join('')+'</div>');
      bind('data-donate',id=>act(Core.donate(st(),id),museum));
    }

    function community() {
      const projects=Object.entries(Core.PROJECTS||{}).map(([id,p],index)=>{
        const done=!!st().projects?.[id];
        return '<article class="sys-project '+(done?'finished':'')+'"><span class="sys-project-number">0'+(index+1)+'</span><div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p>'+(done?'<div class="sys-complete">已修复 · 小镇记得你的帮助</div>':material(p.cost,p.coins))+'</div>'+button(done?'已完成':'提交材料并修复','data-project="'+id+'"',done||!canPay(p.cost,p.coins))+'</article>';
      }).join('');
      shell('community','A TOWN WE BUILD TOGETHER','让小镇重新亮起来','每一块木板、每一枚矿石，都能让旧地方重新有故事。工程材料一次提交，永久生效。','<div class="sys-projects">'+projects+'</div>'+money());
      bind('data-project',id=>act(Core.buildProject(st(),id),community));
    }

    function animals() {
      const current=api.getScene();
      const rooms=[['coop','鸡舍','小鸡和小鸭住在这里。推门进去，往饲槽添草，再看看窝里有没有新下的蛋。','egg'],['barn','牛棚','走到奶牛和绵羊身边，照顾它们，也收下今天准备好的礼物。','milk']];
      shell('livestock-wayfinding','A LITTLE VISIT TO THE FARM','去看看农场里的伙伴','动物就在畜舍里生活。沿着农场小路走到门前，推门进去看看。','<div class="sys-livestock-destinations">'+rooms.map(([id,name,description,img])=>'<button class="sys-livestock-destination" data-enter-livestock="'+id+'">'+icon(img,44)+'<span><strong>'+name+'</strong><small>'+description+'</small></span><b>'+(current===id?'回到场景':current==='farm'?'带我走过去 →':'查看农场位置 →')+'</b></button>').join('')+'</div>'+(current==='farm'?'':'<p class="sys-hint">'+(['coop','barn'].includes(current)?'你已经在畜舍里。靠近饲槽、动物或产物后按 E 互动。':'先沿道路返回农场，再从畜舍门口进入。')+'</p>'));
      bind('data-enter-livestock',kind=>{if(current===kind){api.closePanel();return;}if(current!=='farm'){map('farm');return;}api.closePanel();if(api.enterLivestock)api.enterLivestock(kind);else{const o=(World.landmarks?.('farm')||World.maps.farm.landmarks||[]).find(o=>o.to===kind||o.kind===kind);if(o&&api.navigateTo)api.navigateTo(o);else api.toast('沿农场西侧小路，走到'+(kind==='coop'?'鸡舍':'牛棚')+'门前。');}});
    }

    function journal(tab='quests') {
      const nav=tabs([['quests','小镇委托'],['skills','生活技能'],['friends','小镇居民'],['journey','旅行记录']],tab,'data-journal-tab');let html='';
      if(tab==='quests')html=Core.quests.map(q=>{const p=Core.questProgress(st(),q);return '<div class="sys-quest '+(p.claimed?'complete':'')+'"><div class="sys-check">'+(p.claimed?'✓':'')+'</div><div><strong>'+esc(q.title)+'</strong><p>'+esc(q.description)+'</p><div class="sys-progress"><i style="width:'+Math.round(p.ratio*100)+'%"></i></div><small>'+Math.min(p.current,p.target)+' / '+p.target+' · 奖励 '+(q.rewardCoins||q.reward)+' G</small></div>'+button(p.claimed?'已完成':p.complete?'领取奖励':'进行中','data-claim="'+q.id+'"',!p.complete||p.claimed,'secondary')+'</div>';}).join('');
      if(tab==='skills')html='<div class="sys-skills">'+Object.entries({farming:'农耕',fishing:'钓鱼',mining:'采矿',foraging:'采集',social:'邻里'}).map(([id,name])=>{const xp=st().skills?.[id]||0,level=Core.skillLevel?Core.skillLevel(st(),id):0;return '<div class="sys-skill"><div><strong>'+name+'</strong><span>Lv. '+level+' <small>/ 10</small></span></div><div class="sys-level-dots">'+Array.from({length:10},(_,n)=>'<i class="'+(n<level?'filled':'')+'"></i>').join('')+'</div><small>累计 '+xp+' 点经验</small></div>';}).join('')+'</div><div class="sys-note">种植与收获、成功钓鱼、敲开矿石、采集林间物产，以及帮助邻居，都能积累对应经验。</div>';
      if(tab==='friends')html='<div class="sys-friends">'+Object.entries(Core.NPCS||{}).map(([id,n])=>{const points=st().friendship?.[id]?.points||0;return '<button class="sys-friend" data-friend="'+id+'"><span class="sys-friend-initial">'+esc(n.name.slice(-1))+'</span><span><strong>'+esc(n.name)+'</strong><small>'+esc(n.role)+'</small><span class="sys-hearts">'+hearts(points)+'</span></span><small>'+points+' 好感</small></button>';}).join('')+'</div>';
      if(tab==='journey')html='<div class="sys-travel-stats"><div><b>'+Number(st().stats.harvested||0)+'</b><span>份作物收获</span></div><div><b>'+Number(st().stats.fish||0)+'</b><span>尾鱼收入背包</span></div><div><b>'+Number(st().stats.sold||0)+'</b><span>份产品售出</span></div></div><div class="sys-section-label">沿着小路发现的地方</div><div class="sys-places">'+Object.entries(World.maps).filter(([id])=>id!=='home').map(([id,m])=>{const seen=visited(id);return '<button data-show-map="'+id+'" class="'+(seen?'visited':'')+'"><span>'+(seen?'●':'○')+'</span>'+esc(m.name)+'<small>'+(interiorIds.has(id)?'农场 · 室内':m.w+' × '+m.h+' 格')+'</small></button>';}).join('')+'</div>';
      shell('journal','THE DAYS WE KEEP','我的小镇手账','有些日子收获满满，有些日子只是沿着海岸走了走。都值得记下来。',nav+html);
      bind('data-journal-tab',journal);bind('data-claim',id=>act(Core.claimQuest(st(),id),()=>journal('quests')));bind('data-show-map',map);bind('data-friend',id=>{const n=findNpc(id);if(n){api.toast(n.name+'通常在'+World.maps[n.scene].name+'。走到身边就能交谈和赠礼。');map(n.scene);}else api.toast('沿着小镇的道路去认识这位邻居吧。');});
    }
    function hearts(points) {const n=Math.min(5,Math.floor(points/100));return '<span aria-label="好感度 '+points+'">'+Array.from({length:5},(_,i)=>'<i class="'+(i<n?'filled':'')+'">♥</i>').join('')+'</span>';}
    function findNpc(id) {for(const[scene,m]of Object.entries(World.maps)){const n=(m.npcs||[]).find(n=>n.id===id);if(n)return{...n,scene};}return null;}
    function visited(id) {const v=st().visited||st().stats.visited||[];return id===api.getScene()||(Array.isArray(v)?v.includes(id):!!v[id]);}

    function npc(person,index=0,first=true) {
      if(!person)return;
      if(first&&Core.talk){Core.talk(st(),person.id);api.save();}
      const def=Core.NPCS?.[person.id]||{},f=st().friendship?.[person.id]||{},lines=person.dialogue||['今天也是适合散步的一天。'];
      const gifts=Object.entries(st().inventory).filter(([id,n])=>n>0&&!id.endsWith('-seed')&&!['sprinkler','coop','barn','furnace','jar','mill','cheesemaker','bomb','fence','lamp'].includes(id));
      shell('npc','A FRIEND ON A FAMILIAR ROAD',person.name,def.role||person.role||'小镇的邻居','<div class="sys-npc-heading"><canvas id="systemPortrait" width="144" height="144" aria-label="'+esc(person.name)+'"></canvas><div><span class="sys-hearts">'+hearts(f.points||0)+'</span><small>好感度 '+(f.points||0)+'</small></div></div><div class="dialogue-line">'+esc(lines[index%lines.length])+'</div><div class="panel-actions">'+button(index<lines.length-1?'再聊两句':'下次见','id="systemNextDialogue"')+(person.id==='lin'?button('看看种子','id="systemNpcShop"',false,'secondary'):'')+'</div><div class="sys-gift-row"><label for="giftSelect">送一份小礼物</label><select id="giftSelect"><option value="">从背包中选择</option>'+gifts.map(([id,n])=>'<option value="'+esc(id)+'">'+esc(item(id).name)+' ×'+n+'</option>').join('')+'</select>'+button('送给'+esc(person.name),'id="giveGift"',!gifts.length,'secondary')+'</div><small class="sys-hint">每天交谈与赠礼都能增进感情。礼物会从背包里扣除一份。</small>');
      const cc=$('systemPortrait').getContext('2d');cc.imageSmoothingEnabled=true;cc.scale(3.4,3.4);Art.character(cc,21,37,{style:person.style||'merchant',dir:'down',walk:0});
      $('systemNextDialogue').onclick=()=>index<lines.length-1?npc(person,index+1,false):api.closePanel();if($('systemNpcShop'))$('systemNpcShop').onclick=api.openShop;
      $('giveGift').onclick=()=>{const id=$('giftSelect').value;if(!id)return api.toast('先挑选一件礼物吧。',false);act(Core.gift(st(),person.id,id),()=>npc(person,index,false));};
    }

    const interiorIds=new Set(['home','coop','barn']);
    const interiorNames={home:'小屋内',coop:'鸡舍内',barn:'牛棚内'};
    const regionOf=id=>interiorIds.has(id)?'farm':id;
    function map(selected=api.getScene()) {
      if(typeof selected!=='string'||!World.maps[selected])selected=api.getScene();
      const requested=selected,current=api.getScene(),inside=interiorIds.has(current);
      selected=regionOf(selected);
      const m=World.maps[selected],isHere=selected===current,withinRegion=selected===regionOf(current);
      const landmarks=(World.landmarks?World.landmarks(selected,st()):m.landmarks||m.objects||[]).filter(o=>o.label&&o.interact!=='forage'&&!o.clearable).map(o=>interiorIds.has(o.to)?{...o,label:interiorNames[o.to],interiorTo:o.to}:o).slice(0,24);
      const portals=(m.portals||[]).filter(p=>World.maps[p.to]&&!interiorIds.has(p.to));
      const indoorNote=selected==='farm'&&(inside||interiorIds.has(requested))?'<div class="sys-interior-location"><strong>'+(inside?'当前位置：'+esc(interiorNames[current]):'查看：'+esc(interiorNames[requested]))+'</strong><span>属于'+esc(m.name)+(inside?' · 地图标记在建筑门口':' · 从农场门前进入')+'</span></div>':'';
      shell('map','FOLLOW THE LITTLE PATHS','潮汐群落地图','选择一片区域查看道路与地标。当前区域的地标可以标记路线，沿小路亲自走过去。','<div class="sys-world-map"><canvas id="systemWorldMap" width="760" height="370" aria-label="世界区域地图"></canvas></div>'+indoorNote+'<div class="sys-region-title"><div><strong>'+esc(m.name)+'</strong><small>'+m.w+' × '+m.h+' 格'+(isHere?' · 你在这里':withinRegion?' · 你在这里的'+esc(interiorNames[current]):'')+'</small></div><span>'+esc(m.description||'')+'</span></div><canvas id="systemRegionMap" width="600" height="320" aria-label="'+esc(m.name)+'区域地图"></canvas><div class="sys-exits">'+portals.map(p=>'<button data-region="'+p.to+'">'+esc(({east:'东行',west:'西行',north:'北行',south:'南行'})[p.direction]||'沿路')+' → '+esc(World.maps[p.to].name)+'</button>'+(isHere?'<button class="sys-exit-walk" data-walk-exit="'+p.to+'">沿路前往 '+esc(World.maps[p.to].name)+' ↗</button>':'')).join('')+'</div><div class="sys-landmarks">'+landmarks.map((o,i)=>'<button data-landmark="'+i+'" '+(!isHere?'disabled':'')+'><span>'+esc(o.label)+'</span><small>'+(isHere?(o.interiorTo?'前往建筑门口 →':'标记路线 →'):withinRegion&&inside?'离开室内后可导航':'在此区域内可导航')+'</small></button>').join('')+'</div>');
      bind('data-region',map);bind('data-walk-exit',id=>{const p=portals.find(p=>p.to===id);api.closePanel();api.navigateTo({x:p.x+p.w/2,y:p.y+p.h/2,walkOnly:true});});bind('data-landmark',i=>{const o=landmarks[Number(i)];api.closePanel();if(['coop','barn'].includes(o.interiorTo)&&api.enterLivestock)api.enterLivestock(o.interiorTo);else if(api.navigateTo)api.navigateTo(o);else api.toast(o.label+'：坐标 '+Math.round(o.x/24)+'，'+Math.round(o.y/24));});
      drawWorldMap(selected);
      const c=$('systemRegionMap'),cc=c.getContext('2d');cc.imageSmoothingEnabled=true;
      if(World.drawMap)World.drawMap(cc,selected,8,8,584,304,st());else drawFallbackMap(cc,selected,600,320);
      if(withinRegion){const door=(World.maps.farm.landmarks||[]).find(o=>o.to===current);const p=inside?(World.maps[current].exteriorSpawn||World.maps[current].portals?.find(p=>p.to==='farm')?.spawn||door||World.maps.farm.spawn):api.getPlayer();const scale=Math.min(584/(m.w*24),304/(m.h*24));const ox=8+(584-m.w*24*scale)/2,oy=8+(304-m.h*24*scale)/2;cc.fillStyle='#fff5dc';cc.strokeStyle='#a64f36';cc.lineWidth=2;cc.beginPath();cc.arc(ox+p.x*scale,oy+p.y*scale,5,0,Math.PI*2);cc.fill();cc.stroke();}
    }

    function drawFallbackMap(c,scene,w,h) {
      const m=World.maps[scene],sx=w/m.w,sy=h/m.h,colors={grass:'#a2b87e',path:'#dfc591',water:'#7fb4b1',sand:'#e7d9af',stone:'#a4a89a',dirt:'#b39770',floor:'#b69a7b'};
      c.fillStyle=colors.grass;c.fillRect(0,0,w,h);
      for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){c.fillStyle=colors[World.tile(scene,x,y)]||colors.grass;c.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy));}
      (m.landmarks||[]).forEach(o=>{c.fillStyle='#a9674c';c.beginPath();c.arc(o.x/24*sx,o.y/24*sy,3,0,Math.PI*2);c.fill();});
    }
    function drawWorldMap(selected) {
      const canvas=$('systemWorldMap'),c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
      c.clearRect(0,0,w,h);c.fillStyle='#ede2c4';c.fillRect(0,0,w,h);
      c.fillStyle='#b7d0c7';c.beginPath();c.moveTo(0,h-38);c.bezierCurveTo(180,h-72,440,h+30,w,h-60);c.lineTo(w,h);c.lineTo(0,h);c.fill();
      const regions=Object.entries(World.maps).filter(([id])=>!interiorIds.has(id));
      const positions={},defaultPos={ruins:[0,1],forest:[1,1],farm:[1,0],town:[2,0],mountain:[2,-1],quarry:[3,-1],lake:[3,0],beach:[2,1],mine:[2,-2]};
      regions.forEach(([id,m])=>{const p=m.mapPosition||{x:defaultPos[id]?.[0]||0,y:defaultPos[id]?.[1]||0};positions[id]={x:92+p.x*183,y:45+(p.y+2)*84};});
      c.strokeStyle='#aa9770';c.lineWidth=3;c.lineCap='round';c.setLineDash([5,7]);const drawn=new Set();
      for(const[id,m]of regions){for(const p of m.portals||[]){if(!positions[p.to])continue;const key=[id,p.to].sort().join(':');if(drawn.has(key))continue;drawn.add(key);const a=positions[id],b=positions[p.to];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
      c.setLineDash([]);const hit=[];
      for(const[id,m]of regions){const p=positions[id],active=id===selected,here=id===regionOf(api.getScene());
        c.save();c.shadowColor='#8b775a30';c.shadowBlur=5;c.shadowOffsetY=4;c.fillStyle=active?'#698764':visited(id)?'#faf2d7':'#e4d9b9';c.strokeStyle=active?'#486a4c':'#ae9974';c.lineWidth=active?3:1.4;c.beginPath();c.roundRect(p.x-66,p.y-22,132,45,12);c.fill();c.stroke();c.restore();
        c.textAlign='center';c.font='bold 15px "Microsoft YaHei",sans-serif';c.fillStyle=active?'#fff5dc':'#635a42';c.fillText(m.name,p.x,p.y+1);c.font='10px sans-serif';c.fillStyle=active?'#e3ead0':'#8c7a56';c.fillText(here?(interiorIds.has(api.getScene())?'● 在'+interiorNames[api.getScene()]:'● 你在这里'):m.w+' × '+m.h+' 格',p.x,p.y+16);hit.push({id,x:p.x-68,y:p.y-24,w:136,h:49});
      }
      canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*w/r.width,y=(e.clientY-r.top)*h/r.height;const node=hit.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);if(node)map(node.id);};
    }

    function settings() {
      const theme=st().theme||'clay';
      shell('settings','MAKE YOURSELF AT HOME','小镇设置','声音、画面主题与自己的生活节奏。','<div class="sys-setting"><div><strong>小镇的声音</strong><p>工具声、收获声与轻轻的回应。</p></div>'+button(st().sound?'已开启':'已关闭','id="toggleSystemSound"',false,'secondary')+'</div><div class="sys-section-label">世界主题</div><div class="sys-themes"><button class="sys-theme '+(theme==='clay'?'active':'')+'" data-theme="clay"><span class="sys-theme-preview clay"></span><strong>海风黏土</strong><small>主线 · 手作海滨农场</small></button><button class="sys-theme '+(theme==='candy'?'active':'')+'" data-theme="candy"><span class="sys-theme-preview candy"></span><strong>食物世界</strong><small>试验主题 · 饼干建筑与糖果植物</small></button></div><div class="sys-note">切换后，建筑与植被换成饼干、蛋糕和糖果。角色与道具暂时保留黏土版本，游戏进度与主线共用。</div><div class="panel-actions">'+button('操作与存档','id="systemHelp"',false,'secondary')+button('我的生活手账','id="systemJournal"',false,'secondary')+'</div>');
      $('toggleSystemSound').onclick=()=>{st().sound=!st().sound;api.save();settings();};bind('data-theme',theme=>{st().theme=theme;if(Art)Art.theme=theme;api.save();api.toast(theme==='clay'?'海风黏土主题已启用':'食物世界 · 试验主题已启用');settings();});$('systemHelp').onclick=()=>api.openHelp?.();$('systemJournal').onclick=()=>journal();
    }
    function home() {
      const cal=Core.calendar?Core.calendar(st()):{dayOfSeason:1,seasonName:'春'};
      shell('home','HOME IS A LITTLE LIGHT','海风小屋','窗台上有一束花，炉子里温着热茶。小屋随时欢迎你回来。','<div class="sys-home-window"><span></span><span></span><span></span><span></span></div><div class="sys-home-note">'+esc(cal.seasonName)+'季第 '+cal.dayOfSeason+' 日<br><strong>今天辛苦了，'+esc(st().name)+'。</strong><small>体力 '+Math.floor(st().energy)+' / 100</small></div><div class="sys-home-actions">'+button('喝杯热茶 · 恢复体力','id="systemRest"')+button('睡到明天早晨','id="systemSleep"')+button('整理仓库','id="systemStorage"',false,'secondary')+button('查看加工','id="systemProcess"',false,'secondary')+'</div><p class="sys-hint">休息立即恢复体力；睡觉推进游戏日历。作物与加工按各自计时成长。</p>');
      $('systemRest').onclick=()=>{act(Core.rest(st()));api.closePanel();};$('systemSleep').onclick=()=>{act(Core.sleep(st()));api.closePanel();};$('systemStorage').onclick=api.openStorage;$('systemProcess').onclick=process;
    }
    function menu() {
      const entries=[['journal','小镇手账','委托 · 技能 · 居民','map'],['craft','手作工作台','制作 · 农场布置','axe'],['process','农场加工','投料 · 收取成品','jar'],['animals','去看看伙伴','走进鸡舍 · 牛棚','egg'],['museum','自然图鉴','发现 · 捐赠收藏','fish'],['community','小镇建设','修复 · 解锁新生活','wood'],['map','世界地图','道路 · 地标导航','map'],['settings','小镇设置','声音 · 主题 · 存档','bag']];
      shell('menu','A LITTLE WORLD OF YOUR OWN','今天，想做些什么？','带上工具，慢慢把日子过成喜欢的样子。','<div class="sys-menu">'+entries.map(([id,name,desc,img])=>'<button data-menu="'+id+'">'+icon(img,42)+'<strong>'+name+'</strong><small>'+desc+'</small></button>').join('')+'</div>');bind('data-menu',id=>methods[id]());
    }
    function tickLive() {
      if(!document.querySelector('.system-page'))return;
      document.querySelectorAll('[data-ready-at]').forEach(el=>{const ms=Number(el.dataset.readyAt)-Date.now();el.textContent=ms<=0?'已经做好了':duration(ms);});
      document.querySelectorAll('[data-job-ready]').forEach(el=>{if(Number(el.dataset.jobReady)<=Date.now()){el.disabled=false;el.textContent='收取';}});

    }
    setInterval(tickLive,1000);
    const methods={craft,process,upgrade,museum,community,animals,journal,npc,map,settings,home,menu,help:()=>api.openHelp?.()};
    return methods;
  };
})();
