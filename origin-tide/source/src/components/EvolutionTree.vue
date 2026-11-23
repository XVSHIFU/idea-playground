<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nodes, organismIds } from '../game/nodes'
import BioIcon from './BioIcon.vue'

const props = withDefaults(defineProps<{ unlocked: string[]; selected: string; energy: number; populations?: Record<string, number>; visible?: boolean }>(), { populations: () => ({}), visible: true })
const emit = defineEmits<{ select: [id: string]; collect: [x: number, y: number] }>()
const container = ref<HTMLDivElement>()
const svg = ref<SVGSVGElement>()
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const width = ref(1200)
const height = ref(800)
const dragging = ref(false)
const unlockedSet = computed(() => new Set(props.unlocked))
const positions: Record<string, [number, number]> = {
  membrane: [0, 150], rna: [145, -10], metabolism: [-40, -180],
  division: [-200, -360], flagellum: [175, -350], photosynthesis: [-355, -510],
  nucleus: [-15, -530], mitochondria: [170, -700], colony: [-230, -730],
  multicellular: [-20, -930], sponge: [-270, -1100], cnidaria: [180, -1130],
  bilateral: [340, -1300], worm: [125, -1460], trilobite: [-90, -1640],
  chordate: [320, -1640], reef: [-320, -1810], ecosystem: [10, -2000],
}
const mapNodes = nodes.map(node => ({ ...node, x: positions[node.id]![0], y: positions[node.id]![1], organism: organismIds.has(node.id) }))
const byId = new Map(mapNodes.map(node => [node.id, node]))
const links = mapNodes.flatMap(node => node.requires.map(id => ({ from: byId.get(id)!, to: node })))
const motes = Array.from({ length: 95 }, (_, i) => ({ x: -1500 + ((i * 199 + 71) % 3000), y: -3000 + ((i * 359 + 61) % 3800), r: .6 + (i % 4) * .55, alpha: .1 + (i % 5) * .04 }))
const bokeh = Array.from({ length: 27 }, (_, i) => ({ x: -1300 + ((i * 281 + 187) % 2800), y: -2700 + ((i * 431 + 153) % 3500), r: 12 + (i % 5) * 7, alpha: .11 + (i % 3) * .04 }))
const ripples = ref<{ id: number; x: number; y: number }[]>([])
const timers = new Set<ReturnType<typeof setTimeout>>()
let rippleId = 0
let observer: ResizeObserver | undefined
let initialized = false
let moved = false
let startPoint = { x: 0, y: 0 }
let pinching = false
let pressedNode: string | null = null
const pointers = new Map<number, { x: number; y: number }>()
function available(id: string) { return byId.get(id)!.requires.every(parent => unlockedSet.value.has(parent)) }
function affordable(id: string) { return available(id) && !unlockedSet.value.has(id) && props.energy >= byId.get(id)!.cost }
function cost(id: string) {
  const node = byId.get(id)!
  return unlockedSet.value.has(id) && node.organism ? Math.min(Number.MAX_VALUE, Math.ceil(node.cost * Math.pow(1.16, props.populations[id] ?? 1))) : node.cost
}
function format(value: number) {
  return value >= 1e12 ? value.toExponential(2) : value >= 1e8 ? `${(value / 1e8).toFixed(1)}亿` : value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value >= 1000 ? Math.ceil(value).toLocaleString('zh-CN') : String(Math.ceil(value))
}
function accessibleClick(event: MouseEvent, id: string) { if (event.detail === 0) emit('select', id) }
function reset() {
  scale.value = width.value < 600 ? .78 : Math.min(1.12, Math.max(.8, height.value / 740))
  if (props.unlocked.length > 2) focusSelected()
  else offset.value = { x: width.value * .5, y: height.value * .68 - 150 * scale.value }
}
function focusSelected() {
  const node = byId.get(props.selected) ?? mapNodes[0]!
  offset.value = { x: width.value * .5 - node.x * scale.value, y: height.value * .48 - node.y * scale.value }
}
function zoom(factor: number, x = width.value / 2, y = height.value / 2) {
  const next = Math.max(.32, Math.min(1.7, scale.value * factor))
  const ratio = next / scale.value
  offset.value = { x: x - (x - offset.value.x) * ratio, y: y - (y - offset.value.y) * ratio }
  scale.value = next
}
function wheel(event: WheelEvent) {
  event.preventDefault()
  const box = svg.value!.getBoundingClientRect()
  zoom(Math.exp(-event.deltaY * .0015), event.clientX - box.left, event.clientY - box.top)
}
function down(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if (pointers.size === 0) {
    startPoint = { x: event.clientX, y: event.clientY }; moved = false; pinching = false
    pressedNode = (event.target as Element).closest('[data-node-id]')?.getAttribute('data-node-id') ?? null
  }
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size > 1) { moved = true; pinching = true }
  svg.value!.setPointerCapture(event.pointerId)
  dragging.value = true
}
function move(event: PointerEvent) {
  const previous = pointers.get(event.pointerId)
  if (!previous) return
  const oldPoints = [...pointers.values()]
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y) > 5) moved = true
  const newPoints = [...pointers.values()]
  if (newPoints.length === 2) {
    const a = oldPoints[0]!, b = oldPoints[1]!, c = newPoints[0]!, d = newPoints[1]!
    const oldDistance = Math.hypot(a.x - b.x, a.y - b.y)
    const newDistance = Math.hypot(c.x - d.x, c.y - d.y)
    const box = svg.value!.getBoundingClientRect()
    const oldCenter = { x: (a.x + b.x) / 2 - box.left, y: (a.y + b.y) / 2 - box.top }
    const newCenter = { x: (c.x + d.x) / 2 - box.left, y: (c.y + d.y) / 2 - box.top }
    if (oldDistance > 4) zoom(newDistance / oldDistance, oldCenter.x, oldCenter.y)
    offset.value = { x: offset.value.x + newCenter.x - oldCenter.x, y: offset.value.y + newCenter.y - oldCenter.y }
  } else if (newPoints.length === 1 && moved) {
    offset.value = { x: offset.value.x + event.clientX - previous.x, y: offset.value.y + event.clientY - previous.y }
  }
}
function collect(x: number, y: number) {
  emit('collect', x, y)
  const id = ++rippleId
  ripples.value.push({ id, x, y })
  const timer = setTimeout(() => { ripples.value = ripples.value.filter(ripple => ripple.id !== id); timers.delete(timer) }, 900)
  timers.add(timer)
}
function up(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return
  if (event.type !== 'pointercancel' && !moved && !pinching) {
    if (pressedNode) emit('select', pressedNode)
    else { const box = svg.value!.getBoundingClientRect(); collect(event.clientX - box.left, event.clientY - box.top) }
  }
  pressedNode = null; pointers.delete(event.pointerId)
  if (svg.value?.hasPointerCapture(event.pointerId)) svg.value.releasePointerCapture(event.pointerId)
  dragging.value = pointers.size > 0
}
function keyPan(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return
  const directions: Record<string, [number, number]> = { ArrowUp: [0, 60], ArrowDown: [0, -60], ArrowLeft: [60, 0], ArrowRight: [-60, 0] }
  if (directions[event.key]) { event.preventDefault(); const [x, y] = directions[event.key]!; offset.value = { x: offset.value.x + x, y: offset.value.y + y } }
  else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.2) }
  else if (event.key === '-') { event.preventDefault(); zoom(1 / 1.2) }
  else if (event.key === 'Home') { event.preventDefault(); reset() }
  else if (event.key === ' ') { event.preventDefault(); collect(width.value / 2, height.value / 2) }
}
function resize() {
  const rect = container.value?.getBoundingClientRect()
  if (!rect || rect.width < 1 || rect.height < 1) return
  const oldWidth = width.value, oldHeight = height.value
  width.value = rect.width; height.value = rect.height
  if (!initialized) { reset(); initialized = true }
  else { offset.value.x += (width.value - oldWidth) / 2; offset.value.y += (height.value - oldHeight) / 2 }
}
watch(() => props.visible, async visible => { if (visible) { await nextTick(); resize() } else { pointers.clear(); dragging.value = false } })
onMounted(() => { observer = new ResizeObserver(resize); observer.observe(container.value!); resize() })
onBeforeUnmount(() => { observer?.disconnect(); for (const timer of timers) clearTimeout(timer) })
defineExpose({ focusSelected, reset, zoom })
</script>

<template>
  <div ref="container" class="evolution-tree">
    <svg ref="svg" class="tree-canvas" :class="{ dragging }" width="100%" height="100%" role="group" aria-label="生命进化树，拖动探索，滚轮或双指缩放" tabindex="0" @wheel="wheel" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @keydown="keyPan">
      <defs>
        <linearGradient id="evo-biome" x1="0" y1="-2400" x2="0" y2="500" gradientUnits="userSpaceOnUse"><stop stop-color="#0b203b"/><stop offset=".38" stop-color="#163a4b"/><stop offset=".57" stop-color="#1d3436"/><stop offset=".72" stop-color="#29371b"/><stop offset="1" stop-color="#18230d"/></linearGradient>
        <radialGradient id="evo-haze"><stop stop-color="#a6ad6d" stop-opacity=".22"/><stop offset=".5" stop-color="#a6ad6d" stop-opacity=".08"/><stop offset="1" stop-color="#a6ad6d" stop-opacity="0"/></radialGradient>
        <radialGradient id="evo-sea-haze"><stop stop-color="#57b1b0" stop-opacity=".16"/><stop offset="1" stop-color="#57b1b0" stop-opacity="0"/></radialGradient>
        <radialGradient id="evo-bokeh"><stop offset=".65" stop-color="#d8e8c2" stop-opacity=".3"/><stop offset="1" stop-color="#cddab4" stop-opacity="0"/></radialGradient>
        <radialGradient id="evo-disc" cx=".35" cy=".3"><stop stop-color="#333536"/><stop offset="1" stop-color="#171d20"/></radialGradient>
        <linearGradient id="evo-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9e2b6"/><stop offset=".2" stop-color="#afa98c"/><stop offset=".5" stop-color="#6c695c"/><stop offset=".8" stop-color="#b8b29a"/><stop offset="1" stop-color="#4b4c48"/></linearGradient>
        <radialGradient id="evo-aura"><stop offset=".5" stop-color="#55e7cf" stop-opacity="0"/><stop offset=".72" stop-color="#55e7cf" stop-opacity=".17"/><stop offset="1" stop-color="#55e7cf" stop-opacity="0"/></radialGradient>
        <filter id="evo-link-light" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="#1d2b19"/>
      <g :transform="`translate(${offset.x},${offset.y}) scale(${scale})`">
        <g pointer-events="none">
          <rect x="-18000" y="-18000" width="36000" height="36000" fill="url(#evo-biome)"/>
          <ellipse cx="-200" cy="-200" rx="800" ry="600" fill="url(#evo-haze)"/>
          <ellipse cx="280" cy="-800" rx="760" ry="550" fill="url(#evo-haze)" opacity=".6"/>
          <ellipse cx="-150" cy="-1500" rx="850" ry="620" fill="url(#evo-sea-haze)"/>
          <circle v-for="(m,i) in bokeh" :key="`b-${i}`" :cx="m.x" :cy="m.y" :r="m.r" fill="url(#evo-bokeh)" :opacity="m.alpha"/>
          <circle v-for="(m,i) in motes" :key="`m-${i}`" :cx="m.x" :cy="m.y" :r="m.r" fill="#c7dd99" :opacity="m.alpha"/>
        </g>
        <g class="connections" pointer-events="none">
          <g v-for="link in links" :key="`${link.from.id}-${link.to.id}`" :class="{ charged: unlockedSet.has(link.from.id) && !unlockedSet.has(link.to.id), dormant: !unlockedSet.has(link.from.id) }">
            <line :x1="link.from.x" :y1="link.from.y" :x2="link.to.x" :y2="link.to.y" class="link-glow"/>
            <line :x1="link.from.x" :y1="link.from.y" :x2="link.to.x" :y2="link.to.y" class="link-base"/>
            <line v-if="unlockedSet.has(link.from.id) && !unlockedSet.has(link.to.id)" :x1="link.from.x" :y1="link.from.y" :x2="link.to.x" :y2="link.to.y" class="link-current"/>
          </g>
        </g>
        <g v-for="node in mapNodes" :key="node.id" :data-node-id="node.id" :transform="`translate(${node.x},${node.y})`" class="tree-node" :class="{ organism: node.organism, trait: !node.organism, selected: selected === node.id, unlocked: unlockedSet.has(node.id), available: available(node.id), affordable: affordable(node.id) }" role="button" tabindex="0" :aria-label="`${node.subtitle}，${unlockedSet.has(node.id) ? '已发现' : available(node.id) ? `需要 ${node.cost} 熵` : '尚未解锁'}`" :aria-pressed="selected === node.id" @click.stop="accessibleClick($event,node.id)" @keydown.enter.stop.prevent="emit('select',node.id)" @keydown.space.stop.prevent="emit('select',node.id)">
          <title>{{ node.subtitle }} · {{ node.description }}</title>
          <template v-if="node.organism">
            <circle class="node-aura" r="84" fill="url(#evo-aura)"/>
            <circle class="node-shadow" cy="4" r="58" fill="#060909" opacity=".55"/>
            <circle class="node-ring" r="55" fill="url(#evo-disc)" stroke="#45c7b0" stroke-width="3.5"/>
            <circle class="selection-ring" r="59" fill="none" stroke-width="2.5"/>
            <circle r="50" fill="none" stroke="#a0daca" stroke-opacity=".15"/>
            <foreignObject class="node-art" x="-49" y="-49" width="98" height="98"><BioIcon :id="node.id" :size="98"/></foreignObject>
            <g v-if="unlockedSet.has(node.id)" transform="translate(47,-43)"><rect x="-19" y="-13" width="42" height="26" rx="13" fill="#101716"/><text x="2" y="5" text-anchor="middle" class="population">×{{ populations[node.id] ?? 1 }}</text></g>
            <g v-if="affordable(node.id)" class="purchase-cue" transform="translate(0,0)"><rect x="-13" y="-13" width="26" height="26" rx="2" fill="#19bfa1" stroke="#aeffe0" stroke-width="1"/><path d="M-6 1 0-5 6 1M0-4v10" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round"/></g>
            <text y="80" text-anchor="middle" class="node-name">{{ node.subtitle }}</text>
            <g v-if="!unlockedSet.has(node.id) || (populations[node.id] ?? 1) < 10000" transform="translate(0,101)"><path class="entropy-mark" d="M-34-8-29-2-22-1-29 4-31 10-34 3-42 1-36-2Z"/><text x="8" y="5" text-anchor="middle" class="node-cost">{{ format(cost(node.id)) }}</text></g>
            <text v-else y="106" text-anchor="middle" class="node-cost">数量已满</text>
          </template>
          <template v-else>
            <circle class="node-aura" r="60" fill="url(#evo-aura)"/>
            <rect x="-34" y="-30" width="68" height="68" fill="#050907" opacity=".5"/>
            <rect class="node-frame" x="-34" y="-34" width="68" height="68" rx="1" fill="url(#evo-metal)"/>
            <rect x="-29" y="-29" width="58" height="58" fill="#1b2322" stroke="#54574c"/>
            <foreignObject class="node-art" x="-28" y="-28" width="56" height="56"><BioIcon :id="node.id" :size="56"/></foreignObject>
            <path d="M-32 32v-64h64" fill="none" stroke="#f0ebcf" stroke-opacity=".6" stroke-width="1"/>
            <rect class="selection-ring" x="-37" y="-37" width="74" height="74" rx="1" fill="none" stroke-width="3"/>
            <g v-if="unlockedSet.has(node.id)" class="owned-check" transform="translate(24,-24)"><rect x="-10" y="-10" width="20" height="20" rx="1" fill="#18ad97" stroke="#b3f3dd"/><path d="m-6 0 4 4 8-8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></g>
            <text y="56" text-anchor="middle" class="node-name trait-name">{{ node.subtitle }}</text>
            <g v-if="!unlockedSet.has(node.id)" transform="translate(0,76)"><path class="entropy-mark" d="M-30-7-26-2-20-1-26 3-28 8-30 3-37 1-32-2Z"/><text x="8" y="5" text-anchor="middle" class="node-cost">{{ format(node.cost) }}</text></g>
          </template>
        </g>
      </g>
    </svg>
    <div class="biome-vignette"/>
    <div v-for="ripple in ripples" :key="ripple.id" class="collect-ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }"><i/><i/></div>
    <div class="tree-controls" @pointerdown.stop>
      <button type="button" title="定位选中生命" aria-label="定位选中生命" @click="focusSelected"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg></button>
      <button type="button" title="缩小" aria-label="缩小进化树" @click="zoom(1 / 1.2)"><svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>
      <button type="button" class="zoom-label" title="重置视角" aria-label="重置进化树视角" @click="reset">{{ Math.round(scale * 100) }}%</button>
      <button type="button" title="放大" aria-label="放大进化树" @click="zoom(1.2)"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg></button>
    </div>
  </div>
</template>

<style scoped>
.evolution-tree{position:relative;width:100%;height:100%;overflow:hidden;background:#1d2b19;color:#edf1df;isolation:isolate}.tree-canvas{display:block;touch-action:none;user-select:none;cursor:grab;outline:none}.tree-canvas.dragging{cursor:grabbing}.tree-canvas:focus-visible{outline:2px solid #7cdac9;outline-offset:-5px}.biome-vignette{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,#050d1670,transparent 24%,transparent 75%,#040d1840);box-shadow:inset 0 0 170px #040b1045}.tree-node{cursor:pointer;outline:none}.node-art{pointer-events:none;filter:grayscale(1) brightness(.56);opacity:.65;transition:filter .25s,opacity .25s}.tree-node.available .node-art,.tree-node.unlocked .node-art{filter:none;opacity:1}.node-ring{transition:stroke .2s,filter .2s}.tree-node:not(.available):not(.unlocked) .node-ring{stroke:#6f8b7c;stroke-opacity:.55}.tree-node:not(.available):not(.unlocked) .node-frame{filter:grayscale(1) brightness(.65)}.selection-ring{stroke:transparent;transition:stroke .2s}.node-aura{opacity:0;pointer-events:none}.tree-node.affordable .selection-ring{stroke:#6cf7d8}.tree-node.affordable .node-aura{opacity:1;animation:evo-pulse 2.6s ease-in-out infinite}.tree-node.selected .selection-ring,.tree-node:focus-visible .selection-ring{stroke:#fff;filter:drop-shadow(0 0 3px #d9ffff)}.tree-node:hover .node-ring{stroke:#b9ffeb}.tree-node:hover .node-frame{filter:brightness(1.2)}.node-name{fill:#f4f4e5;font:600 20px 'Microsoft YaHei','PingFang SC',sans-serif;paint-order:stroke;stroke:#172213;stroke-width:3px;stroke-linejoin:round}.trait-name{font-size:16px;font-weight:400;fill:#d3d4b9}.node-cost{fill:#59ddc4;font:500 15px 'Microsoft YaHei','PingFang SC',sans-serif;font-variant-numeric:tabular-nums;paint-order:stroke;stroke:#17231c;stroke-width:2px}.population{fill:#f9f8eb;font:600 14px 'Microsoft YaHei',sans-serif}.entropy-mark{fill:#e4b1f3;stroke:#91daf6;stroke-width:.7}.tree-node:not(.available):not(.unlocked) .node-name{fill:#939a84}.tree-node:not(.available):not(.unlocked) .node-cost{fill:#939f92}.tree-node:not(.available):not(.unlocked) .entropy-mark{opacity:.55}.purchase-cue{filter:drop-shadow(0 1px 3px #071a13);opacity:.94}.link-base{stroke:#cbd4ad;stroke-width:1.5;opacity:.7}.link-glow{stroke:#e3e9b7;stroke-width:4;opacity:.1;filter:url(#evo-link-light)}.charged .link-base{stroke:#8ce0cd;opacity:.8}.charged .link-glow{stroke:#95f9e4;opacity:.34;stroke-width:6}.dormant .link-base{opacity:.18}.dormant .link-glow{opacity:0}.link-current{stroke:#ceffed;stroke-width:3;stroke-dasharray:4 18;stroke-linecap:round;animation:evo-current 1.5s linear infinite;opacity:.8}.tree-controls{position:absolute;left:20px;bottom:24px;display:flex;align-items:center;gap:3px;padding:4px;background:#17201ec9;border:1px solid #b2c2ad29;border-radius:5px;backdrop-filter:blur(8px)}.tree-controls button{display:grid;place-items:center;width:33px;height:33px;padding:0;border:0;border-radius:3px;background:transparent;color:#c6d6c8;cursor:pointer}.tree-controls button:hover{background:#829e8c24}.tree-controls button:focus-visible{outline:2px solid #9dedcf}.tree-controls svg{width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round}.tree-controls .zoom-label{width:36px;font:10px ui-monospace,monospace;color:#99aea2}.collect-ripple{position:absolute;pointer-events:none;width:0;height:0}.collect-ripple i{position:absolute;left:-20px;top:-20px;width:40px;height:40px;border-radius:50%;border:1px solid #ccfbd7;animation:evo-wave .9s ease-out forwards}.collect-ripple i+i{animation-delay:.12s;border-color:#b9b4ff}@keyframes evo-wave{from{transform:scale(.3);opacity:1}to{transform:scale(3.5);opacity:0}}@keyframes evo-pulse{0%,100%{opacity:.4}50%{opacity:1}}@keyframes evo-current{to{stroke-dashoffset:-44}}@media(max-width:650px){.tree-controls{left:12px;bottom:82px;padding:3px}.tree-controls button{width:29px;height:29px}.tree-controls .zoom-label{width:32px}}@media(prefers-reduced-motion:reduce){.node-aura,.link-current{animation:none!important}.collect-ripple i{animation-duration:.01ms}.selection-ring,.node-art,.node-ring{transition:none}}
</style>
