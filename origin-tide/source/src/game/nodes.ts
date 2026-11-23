export type EvolutionNode = {
  id: string
  name: string
  subtitle: string
  description: string
  cost: number
  production: number
  clickBonus?: number
  requires: string[]
  scene: 'micro' | 'ocean'
  icon: string
  x: number
  y: number
}

/** A playable, deliberately simplified journey; branches are not a literal phylogeny. */
export const nodes: EvolutionNode[] = [
  { id: 'membrane', name: '一层边界', subtitle: '细胞膜', description: '柔软的膜将内部与外界分开。生命第一次拥有了自己的空间。', cost: 12, production: 0, clickBonus: 1, requires: [], scene: 'micro', icon: 'Circle', x: 350, y: 80 },
  { id: 'rna', name: '生命的抄本', subtitle: '遗传分子', description: '能够复制的信息被保留下来。微小的差异，打开无限的可能。', cost: 36, production: 0, clickBonus: 1, requires: ['membrane'], scene: 'micro', icon: 'Dna', x: 350, y: 200 },
  { id: 'metabolism', name: '原核细胞', subtitle: '原核细胞', description: '最初的细胞开始代谢，从环境中持续获取能量。繁殖更多细胞，让生命自行生长。', cost: 90, production: 3, requires: ['rna'], scene: 'micro', icon: 'Zap', x: 350, y: 320 },
  { id: 'division', name: '一变为二', subtitle: '细胞分裂', description: '新细胞从母体分离。原本孤独的微观世界，渐渐变得热闹。', cost: 160, production: 3, requires: ['metabolism'], scene: 'micro', icon: 'Copy', x: 220, y: 440 },
  { id: 'flagellum', name: '追逐微光', subtitle: '鞭毛运动', description: '细长的鞭毛划动原汤，让细胞主动寻找更好的生存之地。', cost: 220, production: 2, clickBonus: 1, requires: ['metabolism'], scene: 'micro', icon: 'Waves', x: 480, y: 440 },
  { id: 'photosynthesis', name: '收藏阳光', subtitle: '光合作用', description: '光被转化为生命可以利用的能量。原汤中出现更多绿色的身影。', cost: 350, production: 6, requires: ['division'], scene: 'micro', icon: 'Sun', x: 130, y: 560 },
  { id: 'nucleus', name: '有序的内心', subtitle: '细胞核', description: '遗传物质被包裹在细胞核中。更复杂的内部结构逐渐形成。', cost: 600, production: 12, requires: ['division', 'flagellum'], scene: 'micro', icon: 'Atom', x: 350, y: 560 },
  { id: 'mitochondria', name: '共生之约', subtitle: '线粒体', description: '共生带来新的能量来源。细胞中的小小动力站，支持更复杂的生命。', cost: 1000, production: 22, requires: ['nucleus'], scene: 'micro', icon: 'BatteryCharging', x: 480, y: 680 },
  { id: 'colony', name: '不再独行', subtitle: '细胞群落', description: '细胞聚在一起、交换物质。合作使它们能在变化的环境中延续。', cost: 1800, production: 32, requires: ['photosynthesis', 'nucleus'], scene: 'micro', icon: 'Network', x: 220, y: 680 },
  { id: 'multicellular', name: '走向海洋', subtitle: '多细胞生命', description: '不同细胞开始分工。新的生命尺度已经到来，远古浅海向你敞开。', cost: 3000, production: 55, requires: ['colony', 'mitochondria'], scene: 'ocean', icon: 'Shell', x: 350, y: 800 },
  { id: 'sponge', name: '海底的呼吸', subtitle: '原始海绵', description: '海绵附着在海底，让水流穿过身体，从中滤取养分。', cost: 10000, production: 90, requires: ['multicellular'], scene: 'ocean', icon: 'Flower2', x: 130, y: 920 },
  { id: 'cnidaria', name: '漂浮的伞', subtitle: '刺胞动物', description: '水母舒展透明的伞体，随着水流缓缓起伏。海洋有了新的节律。', cost: 20000, production: 140, requires: ['multicellular'], scene: 'ocean', icon: 'Umbrella', x: 350, y: 920 },
  { id: 'bilateral', name: '前进的方向', subtitle: '两侧对称', description: '头与尾、左与右逐渐分明。身体开始适应朝一个方向移动。', cost: 45000, production: 240, requires: ['cnidaria'], scene: 'ocean', icon: 'GitBranch', x: 480, y: 1040 },
  { id: 'worm', name: '沙中的旅人', subtitle: '蠕虫状动物', description: '柔软的分节身体在海床蜿蜒，探索沉积物中丰富的食物。', cost: 90000, production: 400, requires: ['bilateral'], scene: 'ocean', icon: 'Activity', x: 350, y: 1160 },
  { id: 'trilobite', name: '披甲而行', subtitle: '三叶虫', description: '分节的外骨骼保护身体，成对的附肢在海底留下细小的足迹。', cost: 180000, production: 700, requires: ['worm'], scene: 'ocean', icon: 'Bug', x: 160, y: 1280 },
  { id: 'chordate', name: '游向远方', subtitle: '早期脊索动物', description: '身体内部的支撑与摆动的尾部，让游泳变得更加灵活。', cost: 400000, production: 1200, requires: ['worm'], scene: 'ocean', icon: 'Fish', x: 480, y: 1280 },
  { id: 'reef', name: '海底花园', subtitle: '礁体群落', description: '固着生物形成复杂的栖息地，为海洋中的小生命提供庇护。', cost: 800000, production: 2200, requires: ['sponge', 'trilobite'], scene: 'ocean', icon: 'Sprout', x: 160, y: 1400 },
  { id: 'ecosystem', name: '生命的潮汐', subtitle: '早期海洋生态', description: '游动、滤食、捕食与共生交织在一起。你的海洋已成为生生不息的世界。', cost: 1500000, production: 4000, requires: ['reef', 'chordate'], scene: 'ocean', icon: 'Globe2', x: 350, y: 1520 },
]

export const nodeById = new Map(nodes.map(node => [node.id, node]))

/** Organisms can be multiplied after discovery; the other nodes are one-time traits. */
export const organismIds = new Set<string>([
  'metabolism', 'colony', 'multicellular', 'sponge', 'cnidaria',
  'worm', 'trilobite', 'chordate', 'reef', 'ecosystem',
])
