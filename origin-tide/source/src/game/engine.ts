import { nodes, nodeById, organismIds, type EvolutionNode } from './nodes'

export interface GameState {
  version: 1
  energy: number
  totalEarned: number
  unlocked: string[]
  generators: number
  populations: Record<string, number>
  lastSaved: number
  startedAt: number
}

export const SAVE_KEY = 'origin-tide-v1'
export const OFFLINE_LIMIT_SECONDS = 8 * 60 * 60
const MAX_VALUE = 1e100
const MAX_GENERATORS = 500
export const MAX_POPULATION = 10000
export type OrganismQuantity = 1 | 10 | 100

function freshState(now: number): GameState {
  return { version: 1, energy: 0, totalEarned: 0, unlocked: [], generators: 0, populations: {}, lastSaved: now, startedAt: now }
}

function validateSave(raw: string): GameState {
  if (raw.length > 100000) throw new Error('存档文件过大，请选择本游戏导出的 JSON 存档。')
  let value: unknown
  try { value = JSON.parse(raw) } catch { throw new Error('无法读取存档：JSON 格式不正确。') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('这不是有效的生命潮汐存档。')
  const data = value as Record<string, unknown>
  if (data.version !== 1) throw new Error('存档版本不受支持。')
  for (const key of ['energy', 'totalEarned', 'generators', 'lastSaved', 'startedAt']) {
    if (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || (data[key] as number) < 0 || (data[key] as number) > MAX_VALUE) {
      throw new Error('存档包含无效的数值。')
    }
  }
  if (!Number.isInteger(data.generators) || (data.generators as number) > MAX_GENERATORS) throw new Error('存档中的代谢群数量无效。')
  if ((data.totalEarned as number) < (data.energy as number)) throw new Error('存档中的累计能量无效。')
  const now = Date.now()
  if ((data.startedAt as number) > (data.lastSaved as number) || (data.lastSaved as number) > now + 86400000) throw new Error('存档中的时间无效。')
  if (!Array.isArray(data.unlocked) || data.unlocked.length > nodes.length || data.unlocked.some(id => typeof id !== 'string' || !nodeById.has(id))) throw new Error('存档包含未知的进化节点。')
  const unlocked = data.unlocked as string[]
  const ids = new Set(unlocked)
  if (ids.size !== unlocked.length || unlocked.some(id => nodeById.get(id)!.requires.some(required => !ids.has(required)))) throw new Error('存档中的进化顺序无效。')
  if ((data.generators as number) > 0 && !ids.has('metabolism')) throw new Error('存档尚未解锁基础代谢。')
  const populations: Record<string, number> = {}
  const discoveredOrganisms = unlocked.filter(id => organismIds.has(id))
  if (data.populations === undefined) {
    // Version-one saves from before population buying retain one of each discovery.
    for (const id of discoveredOrganisms) populations[id] = 1
  } else {
    if (!data.populations || typeof data.populations !== 'object' || Array.isArray(data.populations)) throw new Error('存档中的生物数量无效。')
    const stored = data.populations as Record<string, unknown>
    const keys = Object.keys(stored)
    if (keys.length !== discoveredOrganisms.length || keys.some(id => !organismIds.has(id) || !ids.has(id))) throw new Error('存档包含尚未发现的生物。')
    for (const id of discoveredOrganisms) {
      const count = stored[id]
      if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > MAX_POPULATION) throw new Error('存档中的生物数量无效。')
      populations[id] = count
    }
  }
  return {
    version: 1, energy: data.energy as number, totalEarned: data.totalEarned as number,
    unlocked: [...unlocked], generators: data.generators as number, populations,
    lastSaved: data.lastSaved as number, startedAt: data.startedAt as number,
  }
}

/** Pure game state and wall-clock accounting. The view owns its update interval. */
export class GameEngine {
  state: GameState
  offlineSummary = { seconds: 0, energy: 0 }
  storageError = ''
  private disposed = false

  constructor() {
    this.state = freshState(Date.now())
    try {
      const saved = localStorage.getItem(SAVE_KEY)
      if (saved) {
        this.state = validateSave(saved)
        this.settleOffline()
      }
    } catch (error) {
      this.storageError = error instanceof Error ? error.message : '无法读取本地存档。'
    }
  }

  get production(): number {
    const base = this.state.unlocked.reduce((sum, id) => {
      const count = organismIds.has(id) ? (this.state.populations[id] ?? 1) : 1
      return sum + (nodeById.get(id)?.production ?? 0) * count
    }, 0)
    return base * (1 + this.state.generators * 0.08)
  }

  get population(): number {
    return Object.values(this.state.populations).reduce((sum, count) => sum + count, 0)
  }

  get clickPower(): number {
    return 1 + this.state.unlocked.reduce((sum, id) => sum + (nodeById.get(id)?.clickBonus ?? 0), 0)
  }

  get nextNode(): EvolutionNode | undefined {
    return nodes.find(node => !this.state.unlocked.includes(node.id) && node.requires.every(id => this.state.unlocked.includes(id)))
  }

  get generatorCost(): number { return Math.ceil(90 * Math.pow(1.18, this.state.generators)) }

  canBuy(node: EvolutionNode): boolean {
    return !this.state.unlocked.includes(node.id) && node.requires.every(id => this.state.unlocked.includes(id)) && this.state.energy >= node.cost
  }

  buyNode(id: string): boolean {
    if (this.disposed) return false
    this.tick()
    const node = nodeById.get(id)
    if (!node || !this.canBuy(node)) return false
    this.state.energy = Math.max(0, this.state.energy - node.cost)
    this.state.unlocked.push(id)
    if (organismIds.has(id)) this.state.populations[id] = 1
    this.save()
    return true
  }

  private priceAtPopulation(id: string, count: number): number {
    const node = nodeById.get(id)
    if (!node || !organismIds.has(id) || count >= MAX_POPULATION) return Number.MAX_VALUE
    return Math.min(Number.MAX_VALUE, Math.ceil(node.cost * Math.pow(1.16, count)))
  }

  /** Cost of the next individual. Discovery itself is bought with buyNode. */
  organismCost(id: string): number {
    if (!this.state.unlocked.includes(id)) return Number.MAX_VALUE
    return this.priceAtPopulation(id, this.state.populations[id] ?? 0)
  }

  /** Full requested batch price; buyOrganism may buy a smaller affordable batch. */
  organismBatchCost(id: string, quantity: OrganismQuantity): number {
    if (![1, 10, 100].includes(quantity) || !organismIds.has(id) || !this.state.unlocked.includes(id)) return Number.MAX_VALUE
    const count = this.state.populations[id] ?? 0
    if (count + quantity > MAX_POPULATION) return Number.MAX_VALUE
    let cost = 0
    for (let offset = 0; offset < quantity; offset++) {
      cost = Math.min(Number.MAX_VALUE, cost + this.priceAtPopulation(id, count + offset))
    }
    return cost
  }

  /** Returns the number actually bought; every individual pays its own rising cost. */
  buyOrganism(id: string, quantity: OrganismQuantity): number {
    if (this.disposed || ![1, 10, 100].includes(quantity) || !organismIds.has(id) || !this.state.unlocked.includes(id)) return 0
    this.tick()
    let purchased = 0
    while (purchased < quantity && (this.state.populations[id] ?? 0) < MAX_POPULATION) {
      const cost = this.organismCost(id)
      if (this.state.energy < cost) break
      this.state.energy = Math.max(0, this.state.energy - cost)
      this.state.populations[id] = (this.state.populations[id] ?? 0) + 1
      purchased++
    }
    if (purchased > 0) this.save()
    return purchased
  }

  buyGenerator(): boolean {
    if (this.disposed) return false
    this.tick()
    if (!this.state.unlocked.includes('metabolism') || this.state.generators >= MAX_GENERATORS || this.state.energy < this.generatorCost) return false
    this.state.energy -= this.generatorCost
    this.state.generators++
    this.save()
    return true
  }

  tap(): number {
    if (this.disposed) return 0
    this.tick()
    const amount = this.clickPower
    this.earn(amount)
    return amount
  }

  /** Settle each wall-clock span exactly once, including time in a background tab. */
  tick(now = Date.now()): number {
    if (this.disposed || !Number.isFinite(now)) return 0
    const seconds = Math.min(OFFLINE_LIMIT_SECONDS, Math.max(0, (now - this.state.lastSaved) / 1000))
    const amount = seconds * this.production
    this.earn(amount)
    this.state.lastSaved = now
    return amount
  }

  private earn(amount: number): void {
    this.state.energy = Math.min(MAX_VALUE, this.state.energy + amount)
    this.state.totalEarned = Math.min(MAX_VALUE, this.state.totalEarned + amount)
  }

  private settleOffline(): void {
    const now = Date.now()
    const seconds = Math.min(OFFLINE_LIMIT_SECONDS, Math.max(0, (now - this.state.lastSaved) / 1000))
    const energy = this.tick(now)
    this.offlineSummary = { seconds, energy }
  }

  save(): boolean {
    if (this.disposed) return false
    this.tick()
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state))
      this.storageError = ''
      return true
    } catch {
      this.storageError = '浏览器未能保存进度，请导出存档以免丢失。'
      return false
    }
  }

  exportSave(): string {
    this.tick()
    return JSON.stringify(this.state, null, 2)
  }

  importSave(raw: string): void {
    if (this.disposed) throw new Error('游戏已关闭，请刷新页面后导入。')
    const restored = validateSave(raw)
    // Preserve the state object's identity so a reactive view can retain its reference.
    Object.assign(this.state, restored)
    this.settleOffline()
    this.save()
  }

  dispose(): void {
    if (!this.disposed) this.save()
    this.disposed = true
  }
}
