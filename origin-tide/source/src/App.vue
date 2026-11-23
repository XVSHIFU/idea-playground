<script setup lang="ts">
import { computed, reactive, onMounted, onBeforeUnmount, ref, shallowRef, nextTick, watch } from 'vue'
import { Menu, X, Check, LockKeyhole, Focus, Network, Waves, Download, Upload, Volume2, VolumeX, Plus, Minus, Eye, Dna, ChevronRight, ChevronLeft, Sparkles, CircleDot } from 'lucide-vue-next'
import { GameEngine, MAX_POPULATION, type OrganismQuantity } from './game/engine'
import { nodes, organismIds, type EvolutionNode } from './game/nodes'
import { LifeScene } from './scene/LifeScene'
import BioIcon from './components/BioIcon.vue'
import EntropyIcon from './components/EntropyIcon.vue'
import EvolutionTree from './components/EvolutionTree.vue'

const game = new GameEngine()
game.state = reactive(game.state)
const state = game.state
const revision = ref(0)
const production = computed(() => { revision.value; return game.production })
const clickPower = computed(() => game.clickPower)
const nextNode = computed(() => game.nextNode)
const selectedId = ref(game.nextNode?.id ?? 'ecosystem')
const selected = computed(() => nodes.find(n => n.id === selectedId.value)!)
const owns = (id: string) => state.unlocked.includes(id)
const available = (n: EvolutionNode) => n.requires.every(owns)
const isLife = (n: EvolutionNode) => organismIds.has(n.id)
const quantity = ref<OrganismQuantity>(1)
const inspectorOpen = ref(false)
const drawerOpen = ref(false)
const drawerTab = ref<'life'|'traits'>(state.unlocked.includes('metabolism')?'life':'traits')
const oceanUnlocked = computed(() => owns('multicellular'))
const habitat = ref<'micro'|'ocean'>(oceanUnlocked.value ? 'ocean' : 'micro')
const view = ref<'tree'|'world'>('world')
const tree = ref<InstanceType<typeof EvolutionTree>>()
const sceneHost = ref<HTMLElement>()
const scene = shallowRef<LifeScene>()
const error3d = ref('')
const settings = ref<HTMLDialogElement>()
const offlineDialog = ref<HTMLDialogElement>()
const milestoneDialog = ref<HTMLDialogElement>()
const milestone = ref<EvolutionNode|null>(null)
const importInput = ref<HTMLInputElement>()
const importError = ref('')
const importDraft = ref<string|null>(null)
const offline = ref(game.offlineSummary)
const toast = ref('')
const flash = ref(0)
const soundOn = ref(true)
const purchasingId = ref('')
const floaters = ref<{id:number;x:number;y:number;amount:number}[]>([])
const timers = new Set<ReturnType<typeof setTimeout>>()
let audioContext: AudioContext|null = null
let toastTimer: ReturnType<typeof setTimeout>
let loop: ReturnType<typeof setInterval>
let autoSave: ReturnType<typeof setInterval>
let effectId = 0
const fmt = (n:number):string => !Number.isFinite(n)||n===Number.MAX_VALUE?'—':n>=1e12?n.toExponential(2).replace('e+','E'):n>=1e8?`${(n/1e8).toFixed(2)}亿`:n>=1e4?`${(n/1e4).toFixed(2)}万`:Math.floor(n).toLocaleString('zh-CN')
const rate = (n:number) => n<100?n.toLocaleString('zh-CN',{maximumFractionDigits:1}):fmt(n)
const unitRate = (n:EvolutionNode) => n.production*(1+state.generators*.08)
const population = (n:EvolutionNode) => state.populations[n.id]??0
const rowCost = (n:EvolutionNode) => owns(n.id)&&isLife(n)?game.organismBatchCost(n.id,quantity.value):n.cost
const rowQuantity = (n:EvolutionNode) => owns(n.id)&&isLife(n)?quantity.value:1
const purchasable = (n:EvolutionNode) => owns(n.id)?isLife(n)&&population(n)+quantity.value<=MAX_POPULATION&&state.energy>=rowCost(n):game.canBuy(n)
const progress = computed(() => nextNode.value?Math.min(100,state.energy/nextNode.value.cost*100):100)
const readyCount = computed(() => nodes.filter(n=>game.canBuy(n)).length)
const storageError = computed(() => { revision.value; return game.storageError })
const visibleLife = computed(() => nodes.filter(n=>isLife(n)&&(owns(n.id)||available(n))).reverse())
const visibleTraits = computed(() => nodes.filter(n=>!isLife(n)&&(owns(n.id)||available(n))).sort((a,b)=>Number(owns(a.id))-Number(owns(b.id))||a.cost-b.cost))
const selectedPrerequisites = computed(()=>selected.value.requires.filter(id=>!owns(id)).map(id=>nodes.find(n=>n.id===id)!.subtitle).join('、'))
const goalEffect = (n:EvolutionNode) => n.production?`产量 +${rate(unitRate(n))}/秒`:`点击 +${n.clickBonus??0} 熵`
const waiting = computed(()=>{if(!nextNode.value)return '';const left=nextNode.value.cost-state.energy;if(left<=0)return '可以进化';if(!production.value)return `还差 ${fmt(left)}`;const s=Math.ceil(left/production.value);return s<60?`约 ${s} 秒`:`约 ${Math.ceil(s/60)} 分钟`})
const isHolding = ref(false)
let holdDelay: ReturnType<typeof setTimeout>|undefined
let holdLoop: ReturnType<typeof setInterval>|undefined
let held = false
function later(fn:()=>void,ms:number){const t=setTimeout(()=>{fn();timers.delete(t)},ms);timers.add(t)}
function sound(type:'tap'|'evolve'|'buy'){
  if(!soundOn.value)return
  try{audioContext??=new AudioContext();if(audioContext.state==='suspended')void audioContext.resume().catch(()=>{});const ctx=audioContext,t=ctx.currentTime;const tones=type==='evolve'?[392,523.25,659.25,783.99]:type==='buy'?[523.25,659.25]:[340+Math.random()*100];tones.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+i*.09);g.gain.setValueAtTime(0,t+i*.09);g.gain.linearRampToValueAtTime(type==='tap'?.018:.035,t+i*.09+.01);g.gain.exponentialRampToValueAtTime(.001,t+i*.09+.25);o.connect(g);g.connect(ctx.destination);o.start(t+i*.09);o.stop(t+i*.09+.28);o.onended=()=>{o.disconnect();g.disconnect()}})}catch{soundOn.value=false}
}
function notify(message:string){toast.value=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',2600)}
function syncScene(){scene.value?.setEvolution([...state.unlocked],game.population+state.generators,{...state.populations});revision.value++}
function tap(x?:number,y?:number){
  const amount=game.tap();revision.value++;sound('tap');flash.value++
  const rect=sceneHost.value?.getBoundingClientRect()
  if(rect){const id=++effectId;floaters.value.push({id,x:x??rect.width/2,y:y??rect.height*.68,amount});if(floaters.value.length>24)floaters.value.shift();later(()=>{floaters.value=floaters.value.filter(f=>f.id!==id)},1000)}
  if(view.value==='world'&&x===undefined)scene.value?.burst()
}
function startHold(event:PointerEvent){if(event.button!==0)return;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);held=false;isHolding.value=true;holdDelay=setTimeout(()=>{held=true;tap();holdLoop=setInterval(()=>tap(),190)},400)}
function stopHold(){isHolding.value=false;clearTimeout(holdDelay);clearInterval(holdLoop)}
function collectClick(){if(!held)tap();held=false}
function selectNode(id:string){if(!nodes.some(n=>n.id===id))return;selectedId.value=id;inspectorOpen.value=true;if(window.innerWidth<700)drawerOpen.value=false}
function switchHabitat(h:'micro'|'ocean'){if(h==='ocean'&&!oceanUnlocked.value)return;habitat.value=h;scene.value?.setHabitat(h);view.value='world';syncScene()}
function observe(id?:string){const n=nodes.find(n=>n.id===id);if(n&&owns(n.id))switchHabitat(n.scene);view.value='world';inspectorOpen.value=false;scene.value?.setActive(true);if(n)scene.value?.focusOrganism(n.id)}
async function targetNext(){if(!nextNode.value)return;selectedId.value=nextNode.value.id;view.value='tree';inspectorOpen.value=true;if(window.innerWidth<700)drawerOpen.value=false;await nextTick();tree.value?.focusSelected()}
function toggleDrawer(){drawerOpen.value=!drawerOpen.value;if(drawerOpen.value&&window.innerWidth<700)inspectorOpen.value=false}
function toggleTree(){view.value=view.value==='tree'?'world':'tree';if(view.value==='world')scene.value?.resetCamera()}
function buy(n:EvolutionNode){
  if(!purchasable(n))return
  if(owns(n.id)){
    const count=game.buyOrganism(n.id,quantity.value)
    if(!count)return
    syncScene();sound('buy');purchasingId.value=n.id;later(()=>{if(purchasingId.value===n.id)purchasingId.value=''},350)
    return
  }
  if(!game.buyNode(n.id))return
  selectedId.value=n.id;syncScene();sound('evolve');inspectorOpen.value=true
  if(n.id==='metabolism')drawerTab.value='life'
  if(n.id==='multicellular'){switchHabitat('ocean');drawerOpen.value=false;inspectorOpen.value=false}
  if(['metabolism','multicellular','cnidaria','ecosystem'].includes(n.id)){
    milestone.value=n;void nextTick(()=>milestoneDialog.value?.showModal())
  }else notify(`${n.subtitle} · ${goalEffect(n)}`)
}
function finishMilestone(){milestoneDialog.value?.close();if(milestone.value)observe(milestone.value.id);milestone.value=null}
watch(view,v=>scene.value?.setActive(v==='world'&&!document.hidden))
function save(){game.save();revision.value++}
function onVisibility(){stopHold();if(document.hidden){save();scene.value?.setActive(false)}else{game.tick();revision.value++;scene.value?.setActive(view.value==='world')}}
function closeBackdrop(event:MouseEvent,dialog:HTMLDialogElement|undefined){if(event.target===dialog)dialog?.close()}
function exportSave(){const url=URL.createObjectURL(new Blob([game.exportSave()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`源初存档-${new Date().toISOString().slice(0,10)}.json`;a.click();later(()=>URL.revokeObjectURL(url),1000);notify('存档已导出')}
async function readImport(event:Event){const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;importError.value='';importDraft.value=null;try{if(file.size>100000)throw Error('请选择本游戏导出的 JSON 存档。');importDraft.value=await file.text()}catch(e){importError.value=(e as Error).message}input.value=''}
function confirmImport(){if(!importDraft.value)return;try{game.importSave(importDraft.value);revision.value++;importDraft.value=null;habitat.value=owns('multicellular')?'ocean':'micro';scene.value?.setHabitat(habitat.value);syncScene();selectedId.value=game.nextNode?.id??'ecosystem';inspectorOpen.value=false;settings.value?.close();notify('存档已恢复')}catch(e){importError.value=(e as Error).message;importDraft.value=null}}
function onKey(e:KeyboardEvent){if(e.code==='Space'&&e.target===document.body&&!settings.value?.open&&!offlineDialog.value?.open&&!milestoneDialog.value?.open){e.preventDefault();tap()}if(e.code==='Escape'){inspectorOpen.value=false;drawerOpen.value=false}}
onMounted(async()=>{
  await nextTick()
  try{if(sceneHost.value){scene.value=new LifeScene(sceneHost.value,(x,y)=>tap(x,y),id=>selectNode(id));scene.value.setHabitat(habitat.value);syncScene();scene.value.setActive(view.value==='world')}}catch(e){error3d.value='无法启动生命场景，请开启浏览器硬件加速后刷新。进度已保留。';console.error(e)}
  loop=setInterval(()=>{if(!document.hidden){game.tick();revision.value++}},100);autoSave=setInterval(save,5000)
  document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',save);window.addEventListener('keydown',onKey)
  if(offline.value.energy>0&&offline.value.seconds>30)offlineDialog.value?.showModal()
})
onBeforeUnmount(()=>{stopHold();clearInterval(loop);clearInterval(autoSave);clearTimeout(toastTimer);timers.forEach(clearTimeout);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',save);window.removeEventListener('keydown',onKey);game.dispose();scene.value?.dispose();void audioContext?.close()})
</script>

<template>
  <main class="evolution-game" :class="[view,habitat,{'drawer-open':drawerOpen,'inspecting':inspectorOpen}]">
    <div ref="sceneHost" class="habitat-scene" :aria-hidden="view!=='world'" :class="{inactive:view!=='world'}"></div>
    <EvolutionTree v-show="view==='tree'" ref="tree" :visible="view==='tree'" :unlocked="state.unlocked" :selected="selectedId" :energy="state.energy" :populations="state.populations" @select="selectNode" @collect="tap"/>
    <div class="edge-shade" aria-hidden="true"></div>

    <div class="resource-hud">
      <div class="entropy-counter"><div class="energy-value"><EntropyIcon :size="30"/><strong>{{ fmt(state.energy) }}</strong></div><div class="production-line" :class="{running:production>0}">{{ rate(production) }} / 秒 <span v-if="production>0">»</span></div></div>
      <button v-if="nextNode" class="next-goal" :class="{ready:game.canBuy(nextNode)}" @click="targetNext"><BioIcon :id="nextNode.id" :size="43"/><span class="goal-copy"><span>{{ isLife(nextNode)?'发现':'进化' }} <b>{{ nextNode.subtitle }}</b><small>{{ waiting }}</small></span><span class="goal-track"><i :style="{width:progress+'%'}"></i><em>{{ fmt(Math.min(state.energy,nextNode.cost)) }} / {{ fmt(nextNode.cost) }}</em></span></span><ChevronRight :size="17"/></button>
      <div v-else class="journey-complete"><Sparkles :size="16"/>早期海洋 · 生生不息</div>
    </div>
    <button class="menu-button glass-button" aria-label="游戏菜单" @click="settings?.showModal()"><Menu :size="24"/></button>
    <div class="era-mark"><Dna :size="23" :stroke-width="1.25"/><span>{{ view==='tree'?'生命之树':habitat==='micro'?'原始生命':'远古海洋' }}<small>{{ view==='tree'?`${state.unlocked.length} / 18 项进化`:habitat==='micro'?'约 38 亿年前':'约 5.4 亿年前' }}</small></span></div>

    <button class="drawer-handle" :class="{open:drawerOpen}" :aria-label="drawerOpen?'收起购买列表':'展开购买列表'" :aria-expanded="drawerOpen" @click="toggleDrawer"><ChevronLeft v-if="drawerOpen" :size="27"/><ChevronRight v-else :size="27"/><span v-if="!drawerOpen">进化</span><i v-if="readyCount&&!drawerOpen">{{ readyCount }}</i></button>
    <Transition name="drawer"><aside v-if="drawerOpen" class="purchase-drawer" aria-label="生命与进化购买列表">
      <div class="drawer-tabs"><button :class="{active:drawerTab==='life'}" @click="drawerTab='life'"><CircleDot :size="23"/>生命</button><button :class="{active:drawerTab==='traits'}" @click="drawerTab='traits'"><Dna :size="23"/>进化<i v-if="visibleTraits.some(n=>game.canBuy(n))"></i></button><button class="drawer-close" aria-label="关闭购买列表" @click="drawerOpen=false"><X :size="21"/></button></div>
      <div class="purchase-heading"><span>{{ drawerTab==='life'?'生命数量':'进化能力' }}</span><div v-if="drawerTab==='life'" class="batch-selector"><button v-for="q in ([1,10,100] as const)" :key="q" :class="{active:quantity===q}" @click="quantity=q">×{{ q }}</button></div><small v-else>{{ state.unlocked.filter(id=>!organismIds.has(id)).length }} 已获得</small></div>
      <div class="purchase-scroll">
        <template v-if="drawerTab==='life'">
          <div v-if="!visibleLife.length" class="first-organism"><BioIcon id="metabolism" :size="85"/><h3>生命即将诞生</h3><p>从细胞膜、遗传分子开始，<br/>解锁持续生产熵的原核细胞。</p><button @click="drawerTab='traits'">探索最初的进化<ChevronRight :size="15"/></button></div>
          <div v-for="n in visibleLife" :key="n.id" class="buy-row" :class="{selected:inspectorOpen&&selectedId===n.id,purchased:purchasingId===n.id,undiscovered:!owns(n.id)}">
            <button class="row-portrait" :aria-label="'查看'+n.subtitle" @click="selectNode(n.id)"><BioIcon :id="n.id" :size="64"/><b>×{{ population(n) }}</b></button>
            <button class="row-description" @click="selectNode(n.id)"><strong>{{ n.subtitle }}</strong><span><EntropyIcon :size="13"/>{{ rate(unitRate(n)*population(n)) }} / 秒</span></button>
            <button class="row-buy" :disabled="!purchasable(n)" :aria-label="`${owns(n.id)?'购买':'发现'}${n.subtitle} ${rowQuantity(n)}个，${fmt(rowCost(n))}熵`" @click="buy(n)"><span><small>{{ owns(n.id)?`×${quantity}`:'发现' }}</small><em>+{{ rate(unitRate(n)*rowQuantity(n)) }}/秒</em></span><b><EntropyIcon :size="18"/>{{ fmt(rowCost(n)) }}</b></button>
          </div>
        </template>
        <template v-else><div v-for="n in visibleTraits" :key="n.id" class="buy-row trait-row" :class="{completed:owns(n.id),selected:inspectorOpen&&selectedId===n.id}"><button class="row-portrait" :aria-label="'查看'+n.subtitle" @click="selectNode(n.id)"><BioIcon :id="n.id" :size="56"/></button><button class="row-description" @click="selectNode(n.id)"><strong>{{ n.subtitle }}</strong><span>{{ goalEffect(n) }}</span></button><button class="row-buy" :disabled="!purchasable(n)" @click="buy(n)"><template v-if="owns(n.id)"><Check :size="23"/><small>已进化</small></template><template v-else><small>进化</small><b><EntropyIcon :size="17"/>{{ fmt(n.cost) }}</b></template></button></div></template>
        <button class="drawer-tree-link" @click="view='tree';drawerOpen=false;targetNext()"><Network :size="18"/>在进化树中探索<ChevronRight :size="17"/></button>
      </div>
      <div class="drawer-production"><EntropyIcon :size="17"/><span>总产量</span><strong>{{ rate(production) }} / 秒</strong></div>
    </aside></Transition>

    <nav class="world-navigation" aria-label="生命场景">
      <button :class="{active:view==='world'&&habitat==='ocean'}" :disabled="!oceanUnlocked" :aria-label="oceanUnlocked?'远古海洋':'远古海洋尚未解锁'" @click="switchHabitat('ocean')"><Waves v-if="oceanUnlocked" :size="28"/><LockKeyhole v-else :size="23"/><span>海洋</span></button>
      <button :class="{active:view==='world'&&habitat==='micro'}" aria-label="微观世界" @click="switchHabitat('micro')"><CircleDot :size="28"/><span>微观</span></button>
      <button class="tree-toggle" :class="{active:view==='tree'}" :aria-label="view==='tree'?'返回生命场景':'打开进化树'" @click="toggleTree"><Network :size="34" :stroke-width="1.4"/><span>进化树</span><i v-if="readyCount">{{ readyCount }}</i></button>
    </nav>
    <div v-if="view==='world'" class="camera-controls"><button aria-label="放大场景" @click="scene?.zoom(-1)"><Plus :size="17"/></button><button aria-label="缩小场景" @click="scene?.zoom(1)"><Minus :size="17"/></button><button aria-label="重置视角" @click="scene?.resetCamera()"><Focus :size="17"/></button></div>
    <div v-if="!inspectorOpen&&!drawerOpen" class="scene-instruction"><span v-if="!state.unlocked.length">轻触生命，让第一次进化发生</span><span v-else-if="view==='tree'">拖动探索 · 点击节点进化</span><span v-else>拖动旋转 · 滚轮 / 双指缩放 · 点击收集熵</span></div>
    <button class="collect-entropy" :class="{holding:isHolding}" aria-label="收集熵，点击或按住" @pointerdown="startHold" @pointerup="stopHold" @pointercancel="stopHold" @lostpointercapture="stopHold" @click="collectClick"><span class="collect-symbol" :key="flash"><EntropyIcon :size="26"/></span><b>+{{ rate(clickPower) }}</b><small>收集熵</small></button>
    <div v-if="error3d&&view==='world'" class="scene-error"><p>{{ error3d }}</p><button @click="view='tree'">进入进化树</button></div>

    <Transition name="detail"><section v-if="inspectorOpen" class="node-inspector" :aria-label="selected.subtitle+'详情'">
      <button class="inspector-close" aria-label="关闭详情" @click="inspectorOpen=false"><X :size="18"/></button>
      <div class="inspector-heading"><BioIcon :id="selectedId" :size="75"/><div><small>{{ isLife(selected)?'生命':'进化' }}</small><h2>{{ selected.subtitle }}</h2><span class="selected-effect"><template v-if="selected.production">生产 <EntropyIcon :size="14"/>{{ rate(unitRate(selected)) }}/秒</template><template v-else>每次点击 +{{ selected.clickBonus??0 }} 熵</template></span></div></div>
      <div v-if="isLife(selected)&&owns(selected.id)" class="owned-production">×{{ population(selected) }} <span>生产 <EntropyIcon :size="13"/>{{ rate(unitRate(selected)*population(selected)) }}/秒</span><button aria-label="观察生物" @click="observe(selectedId)"><Eye :size="17"/></button></div>
      <p>{{ selected.description }}</p>
      <div v-if="isLife(selected)&&owns(selected.id)" class="detail-quantity"><span>购买数量</span><button v-for="q in ([1,10,100] as const)" :key="q" :class="{active:quantity===q}" @click="quantity=q">×{{ q }}</button></div>
      <button v-if="!owns(selected.id)||isLife(selected)" class="detail-purchase" :disabled="!purchasable(selected)" @click="buy(selected)"><template v-if="!available(selected)"><LockKeyhole :size="15"/><span>需要 {{ selectedPrerequisites }}</span></template><template v-else><span>{{ owns(selected.id)?`购买 ×${quantity}`:isLife(selected)?'发现生命':'进化' }}</span><b><EntropyIcon :size="20"/>{{ fmt(rowCost(selected)) }}</b></template></button>
      <div v-else class="trait-complete"><Check :size="16"/>进化已完成<button @click="observe(selectedId)">观察<Eye :size="15"/></button></div>
    </section></Transition>

    <div class="floating-amounts" aria-hidden="true"><div v-for="f in floaters" :key="f.id" :style="{left:f.x+'px',top:f.y+'px'}"><EntropyIcon :size="22"/><span>{{ rate(f.amount) }}</span></div></div>
    <Transition name="toast"><div v-if="toast" class="toast-message" role="status"><Check :size="16"/>{{ toast }}</div></Transition>
    <dialog ref="milestoneDialog" class="game-dialog milestone-dialog" @cancel="milestone=null"><template v-if="milestone"><span class="milestone-label">进 化 的 里 程 碑</span><div class="milestone-art"><BioIcon :id="milestone.id" :size="145"/></div><h2>{{ milestone.subtitle }}</h2><p>{{ milestone.description }}</p><div class="milestone-effect"><EntropyIcon :size="20"/>{{ goalEffect(milestone) }}</div><button class="dialog-primary" @click="finishMilestone">{{ milestone.id==='multicellular'?'进入远古海洋':'观察新的生命' }}<ChevronRight :size="19"/></button></template></dialog>
    <dialog ref="settings" class="game-dialog" @click="closeBackdrop($event,settings)"><button class="dialog-close" aria-label="关闭菜单" @click="settings?.close()"><X :size="22"/></button><Dna class="dialog-emblem" :size="35"/><h2>生命模拟</h2><p class="dialog-subtitle">{{ state.unlocked.length }} / 18 项进化 · {{ game.population }} 个生命</p><div class="menu-actions"><button @click="soundOn=!soundOn"><Volume2 v-if="soundOn" :size="20"/><VolumeX v-else :size="20"/><span>游戏音效</span><b>{{ soundOn?'开启':'关闭' }}</b></button><button @click="exportSave"><Download :size="20"/><span>导出存档</span><ChevronRight :size="17"/></button><button @click="importInput?.click()"><Upload :size="20"/><span>导入存档</span><ChevronRight :size="17"/></button></div><input ref="importInput" type="file" accept=".json,application/json" hidden @change="readImport"/><div class="import-confirm" v-if="importDraft"><p>导入将替换当前进度。你可以先导出当前存档。</p><button class="dialog-primary" @click="confirmImport">确认恢复</button><button class="text-button" @click="importDraft=null">取消</button></div><p class="error-text" v-if="importError||storageError" role="alert">{{ importError||storageError }}</p><p class="save-note">每 5 秒自动保存 · 离线最多积累 8 小时<br/>存档保存在当前浏览器</p><button class="dialog-primary" @click="settings?.close()">继续模拟</button></dialog>
    <dialog ref="offlineDialog" class="game-dialog offline-dialog"><BioIcon id="metabolism" :size="90"/><h2>生命从未停歇</h2><p>离开了 {{ Math.max(1,Math.floor(offline.seconds/60)) }} 分钟<br/>你的生命一直在产生熵</p><div class="offline-gain"><EntropyIcon :size="33"/>{{ fmt(offline.energy) }}</div><button class="dialog-primary" @click="offlineDialog?.close()">继续进化<ChevronRight :size="18"/></button><small>离线收益已计入</small></dialog>
  </main>
</template>
