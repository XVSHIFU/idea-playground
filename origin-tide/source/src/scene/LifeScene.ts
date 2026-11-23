import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js'

type Habitat = 'micro' | 'ocean'
type Actor = { object: THREE.Object3D; kind: string; origin: THREE.Vector3; phase: number; size: number; growth: number; bounce: number }
type Spark = { mesh: THREE.Mesh; velocity: THREE.Vector3; age: number }

/** Original procedural models; no external textures, models or network requests. */
export class LifeScene {
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(40, 1, .1, 100)
  private renderer: THREE.WebGLRenderer | SVGRenderer
  public readonly rendererMode: 'webgl' | 'svg'
  private controls: OrbitControls
  private world = new THREE.Group()
  private accents = new THREE.Group()
  private actors: Actor[] = []
  private sparks: Spark[] = []
  private rings: { mesh: THREE.Mesh; age: number }[] = []
  private ids = new Set<string>()
  private population = 1
  private populations: Record<string, number> = {}
  private habitat: Habitat = 'micro'
  private signature = ''
  private observer: ResizeObserver
  private frame = 0
  private last = 0
  private elapsed = 0
  private hitActor: Actor | null = null
  private animateUpgrade = false
  private oldActorCounts = new Map<string, number>()
  private newActorCounts = new Map<string, number>()
  private renderElapsed = 0
  private pointerStart: { x: number; y: number; time: number } | null = null
  private pointers = new Set<number>()
  private wasMultiTouch = false
  private hit = new THREE.Vector3()
  private ambient: THREE.Points
  private disposed = false
  private active = true
  private focusTarget: THREE.Vector3 | null = null
  private focusPosition: THREE.Vector3 | null = null
  private skyLight = new THREE.HemisphereLight(0xd9faff, 0x53562d, 1.6)
  private sunLight = new THREE.DirectionalLight(0xfff1c8, 2.1)

  constructor(private container: HTMLElement, private onTap: (x: number, y: number) => void, private onSelect?: (id: string) => void) {
    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.04
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer = renderer
      this.rendererMode = 'webgl'
    } catch {
      const renderer = new SVGRenderer()
      renderer.setQuality('high')
      renderer.setPrecision(2)
      renderer.overdraw = .25
      this.renderer = renderer
      this.rendererMode = 'svg'
    }
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'
    this.renderer.domElement.setAttribute('aria-label', '生命栖息地。拖动旋转，双指或滚轮缩放，轻触收集能量。')
    this.container.appendChild(this.renderer.domElement)
    this.scene.add(this.world, this.accents)
    this.scene.add(this.skyLight)
    this.scene.add(new THREE.AmbientLight(this.rendererMode === 'svg' ? 0xffffff : 0xc9e8e1, this.rendererMode === 'svg' ? .66 : .15))
    const sun = this.sunLight
    if (this.rendererMode === 'svg') sun.intensity = .8
    sun.position.set(-7, 12, 6)
    sun.castShadow = this.rendererMode === 'webgl'
    sun.shadow.mapSize.set(1024, 1024)
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 30 })
    sun.shadow.normalBias = .04
    this.scene.add(sun)
    const rim = new THREE.DirectionalLight(this.rendererMode === 'svg' ? 0xd7e4ff : 0x4dceff, this.rendererMode === 'svg' ? .15 : 1.8)
    rim.position.set(6, 2, -5)
    this.scene.add(rim)
    const moteCount = this.rendererMode === 'svg' ? 36 : 150
    const positions = new Float32Array(moteCount * 3)
    for (let i = 0; i < moteCount; i++) {
      positions[i * 3] = (Math.random() - .5) * 29
      positions[i * 3 + 1] = (Math.random() - .5) * 15
      positions[i * 3 + 2] = (Math.random() - .5) * 24
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.ambient = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xd4fff2, size: .055, transparent: true, opacity: .7, depthWrite: false }))
    this.scene.add(this.ambient)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement as unknown as HTMLElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = .065
    this.controls.enablePan = false
    this.controls.minDistance = 4
    this.controls.maxDistance = 30
    this.controls.maxPolarAngle = Math.PI * .60
    this.controls.minPolarAngle = Math.PI * .18
    this.controls.rotateSpeed = .5
    this.controls.zoomSpeed = .65
    this.renderer.domElement.addEventListener('pointerdown', this.pointerDown)
    this.renderer.domElement.addEventListener('pointerup', this.pointerUp)
    this.renderer.domElement.addEventListener('pointercancel', this.pointerCancel)
    this.observer = new ResizeObserver(this.resize)
    this.observer.observe(container)
    this.resize()
    this.rebuild()
    this.resetCamera()
    this.frame = requestAnimationFrame(this.animate)
  }

  setEvolution(ids: string[], population: number, populations: Record<string, number> = {}): void {
    const p = Math.max(1, Math.min(14, Math.floor(population)))
    const signature = [...ids].sort().join(',') + ':' + p + ':' + JSON.stringify(Object.entries(populations).sort(([a], [b]) => a.localeCompare(b)))
    if (signature === this.signature) return
    this.animateUpgrade = this.signature !== ''
    this.signature = signature
    this.ids = new Set(ids)
    this.population = p
    this.populations = { ...populations }
    this.rebuild()
  }

  setHabitat(habitat: Habitat): void {
    if (this.habitat === habitat) return
    this.habitat = habitat
    this.disposeObject(this.accents)
    this.accents.clear()
    this.sparks = []
    this.rings = []
    this.hit.set(0, 0, 0)
    this.rebuild()
    this.resetCamera()
  }

  resetCamera(): void {
    this.focusTarget = null
    this.focusPosition = null
    this.controls.maxPolarAngle = this.habitat === 'ocean' ? Math.PI * .49 : Math.PI * .68
    if (this.habitat === 'micro') {
      this.camera.position.set(0, .3, Math.max(14.8, 8.4 / this.camera.aspect))
      this.controls.target.set(0, 0, -.4)
    } else {
      this.camera.position.set(.3, 1.8, Math.max(12.6, 7.4 / this.camera.aspect))
      this.controls.target.set(0, -1, -2)
    }
    this.controls.update()
  }

  setActive(active: boolean): void {
    if (this.active === active || this.disposed) return
    this.active = active
    this.last = 0
    if (active) {
      this.resize()
      this.frame = requestAnimationFrame(this.animate)
    } else cancelAnimationFrame(this.frame)
  }

  focusOrganism(id: string): void {
    const kind = ({ membrane: 'vesicle', rna: 'dna', metabolism: 'prokaryote', division: 'prokaryote', flagellum: 'prokaryote', photosynthesis: 'photosynthetic', nucleus: 'eukaryote', mitochondria: 'eukaryote', colony: 'colony', multicellular: 'multicellular', sponge: 'sponge', cnidaria: 'jelly', bilateral: 'flatworm', worm: 'worm', trilobite: 'trilobite', chordate: 'fish', reef: 'coral', ecosystem: 'fish' } as Record<string, string>)[id]
    const actor = this.actors.find(actor => actor.kind === kind)
    if (!actor) return
    this.focusTarget = actor.object.position.clone()
    const direction = this.camera.position.clone().sub(this.controls.target).normalize()
    this.focusPosition = this.focusTarget.clone().add(direction.multiplyScalar(Math.max(6.8, 4.8 / this.camera.aspect)))
  }

  zoom(delta: number): void {
    const direction = this.camera.position.clone().sub(this.controls.target)
    const distance = THREE.MathUtils.clamp(direction.length() * Math.exp(delta * .13), this.controls.minDistance, this.controls.maxDistance)
    this.camera.position.copy(this.controls.target).add(direction.setLength(distance))
    this.controls.update()
  }

  burst(): void {
    if (this.hitActor) this.hitActor.bounce = 1
    const position = this.hit.clone()
    const sparkCount = this.rendererMode === 'svg' ? 7 : 18
    for (let i = 0; i < sparkCount; i++) {
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(.035 + Math.random() * .04), new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffe5a0 : 0xe6fff5, transparent: true, depthWrite: false }))
      mesh.position.copy(position)
      this.accents.add(mesh)
      this.sparks.push({ mesh, velocity: new THREE.Vector3((Math.random() - .5) * 2.4, Math.random() * 2.2, (Math.random() - .5) * 2.4), age: 0 })
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry(.25, .28, this.rendererMode === 'svg' ? 16 : 48), new THREE.MeshBasicMaterial({ color: 0xc8ffed, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false }))
    ring.position.copy(position)
    ring.quaternion.copy(this.camera.quaternion)
    this.accents.add(ring)
    this.rings.push({ mesh: ring, age: 0 })
  }

  private material(color: THREE.ColorRepresentation, options: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .62, metalness: .06, ...options })
  }

  private mesh(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, parent: THREE.Object3D, position = [0, 0, 0], scale = [1, 1, 1], options: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, this.material(color, options))
    mesh.position.set(position[0], position[1], position[2])
    mesh.scale.set(scale[0], scale[1], scale[2])
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  private blob(parent: THREE.Object3D, color: THREE.ColorRepresentation, radius: number, position: number[], scale = [1, 1, 1], detail = 1): THREE.Mesh {
    return this.mesh(new THREE.IcosahedronGeometry(radius, this.rendererMode === 'svg' ? Math.min(detail, 1) : detail), color, parent, position, scale)
  }

  private tube(parent: THREE.Object3D, points: THREE.Vector3[], color: THREE.ColorRepresentation, radius: number): THREE.Mesh {
    return this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), this.rendererMode === 'svg' ? 7 : 16, radius, this.rendererMode === 'svg' ? 4 : 5, false), color, parent)
  }

  private register(object: THREE.Object3D, kind: string, phase?: number): void {
    const ordinal = (this.newActorCounts.get(kind) || 0) + 1
    this.newActorCounts.set(kind, ordinal)
    const stablePhase = phase ?? (([...kind].reduce((sum, c) => sum + c.charCodeAt(0), 0) * .13 + ordinal * 2.399) % (Math.PI * 2))
    object.userData.baseRotation = object.rotation.clone()
    const isNew = ordinal > (this.oldActorCounts.get(kind) || 0)
    const growth = (isNew || (this.animateUpgrade && ['prokaryote', 'eukaryote', 'vesicle', 'multicellular'].includes(kind))) ? 0 : 1
    this.actors.push({ object, kind, origin: object.position.clone(), phase: stablePhase, size: object.scale.x, growth, bounce: 0 })
  }

  private bond(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, color = 0xa5b2b7, radius = .035): void {
    const delta = b.clone().sub(a)
    const mesh = this.mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 5), color, parent)
    mesh.position.copy(a).add(b).multiplyScalar(.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
  }

  private molecule(): THREE.Group {
    const group = new THREE.Group()
    const atoms: [number, number, number, number, number][] = [
      [0, 0, 0, 0x767280, .12], [.42, .25, .04, 0x767280, .12],
      [.8, .04, -.02, 0x767280, .12], [.4, .68, .02, 0xe52d51, .15],
      [1.16, .3, .01, 0xe52d51, .15], [.8, -.4, .08, 0x42b8ef, .15],
      [-.34, .24, .04, 0xecebe3, .1], [-.07, -.4, -.04, 0xecebe3, .1],
      [.63, -.68, .12, 0xecebe3, .095], [1.13, -.54, .14, 0xecebe3, .095],
    ]
    for (const [a, b] of [[0, 1], [1, 2], [1, 3], [2, 4], [2, 5], [0, 6], [0, 7], [5, 8], [5, 9]]) {
      this.bond(group, new THREE.Vector3(...atoms[a].slice(0, 3) as [number, number, number]), new THREE.Vector3(...atoms[b].slice(0, 3) as [number, number, number]))
    }
    atoms.forEach(([x, y, z, color, r]) => this.blob(group, color, r, [x - .45, y, z], [1, 1, 1], 1))
    // Bonds and atoms share the same origin after centering the molecule.
    group.children.slice(0, 9).forEach(child => child.position.x -= .45)
    return group
  }

  private dna(): THREE.Group {
    const group = new THREE.Group()
    const steps = this.rendererMode === 'svg' ? 12 : 20
    const strands = [[], []] as THREE.Vector3[][]
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps - .5) * 2.6, angle = i / steps * Math.PI * 3
      const a = new THREE.Vector3(Math.cos(angle) * .43, y, Math.sin(angle) * .43)
      const b = new THREE.Vector3(-a.x, y, -a.z)
      strands[0].push(a); strands[1].push(b)
      if (i % 2 === 0) {
        const middle = a.clone().add(b).multiplyScalar(.5)
        this.bond(group, a, middle, i % 4 ? 0x43d7d1 : 0x96e9df, .04)
        this.bond(group, middle, b, i % 4 ? 0x5d8ed9 : 0x368ed1, .04)
      }
    }
    strands.forEach((points, i) => {
      const ribbon = this.tube(group, points, i ? 0x1b9ad3 : 0x54d3ee, .105)
      ;(ribbon.material as THREE.MeshStandardMaterial).roughness = .38
      ;(ribbon.material as THREE.MeshStandardMaterial).emissive.setHex(0x075370)
      ;(ribbon.material as THREE.MeshStandardMaterial).emissiveIntensity = .2
    })
    return group
  }

  private capsuleShape(radius: number, length: number): THREE.Shape {
    const shape = new THREE.Shape(), half = length / 2
    shape.moveTo(-half, -radius)
    shape.lineTo(half, -radius)
    shape.absarc(half, 0, radius, -Math.PI / 2, Math.PI / 2, false)
    shape.lineTo(-half, radius)
    shape.absarc(-half, 0, radius, Math.PI / 2, Math.PI * 1.5, false)
    return shape
  }

  private prokaryote(photo = false): THREE.Group {
    const cell = new THREE.Group()
    const layer = (radius: number, depth: number, color: number, z: number) => this.mesh(
      new THREE.ExtrudeGeometry(this.capsuleShape(radius, .85), { depth, steps: 1, bevelEnabled: true, bevelSegments: 1, bevelSize: .045, bevelThickness: .045, curveSegments: 3 }),
      color, cell, [0, 0, z], [1, 1, 1], { roughness: .5 },
    )
    layer(.48, .44, photo ? 0x4c982a : 0x86a83d, -.35)
    layer(.40, .15, 0x42b2bb, .1)
    layer(.30, .05, photo ? 0x356745 : 0x8244a4, .26)
    const strand = Array.from({ length: 14 }, (_, i) => new THREE.Vector3((i - 6.5) * .075, Math.sin(i * 1.05) * .13, .36 + Math.cos(i * .7) * .025))
    this.tube(cell, strand, 0xe44677, .073)
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4
      this.blob(cell, i % 2 ? 0xf2cb58 : 0xb6dfe3, .04, [Math.cos(a) * .57, Math.sin(a) * .23, .36], [1, 1, 1], 0)
    }
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * .22
      for (const sign of [-1, 1]) {
        this.bond(cell, new THREE.Vector3(x, sign * .43, -.04), new THREE.Vector3(x + .06, sign * (.65 + i % 2 * .08), -.03), 0x67bbc7, .028)
      }
    }
    if (this.ids.has('flagellum')) {
      const points = Array.from({ length: 13 }, (_, i) => new THREE.Vector3(-.95 - i * .12, Math.sin(i * .75) * .22 - .2, -.02))
      this.tube(cell, points, 0x42b9d4, .045).name = 'flagellum'
    }
    return cell
  }

  private eukaryote(primitive = false): THREE.Group {
    const cell = new THREE.Group()
    const profile = [new THREE.Vector2(0, -.68), new THREE.Vector2(.46, -.61), new THREE.Vector2(.77, -.35), new THREE.Vector2(.9, -.02), new THREE.Vector2(.87, .25), new THREE.Vector2(.79, .29), new THREE.Vector2(.79, .02), new THREE.Vector2(.68, -.27), new THREE.Vector2(.41, -.51), new THREE.Vector2(0, -.56)]
    const shell = this.mesh(new THREE.LatheGeometry(profile, this.rendererMode === 'svg' ? 9 : 12), primitive ? 0x89a046 : 0x9e40a6, cell, [0, 0, 0], [1, 1, 1], { side: THREE.DoubleSide, roughness: .48 })
    shell.rotation.x = Math.PI / 2
    this.mesh(new THREE.TorusGeometry(.83, .045, 4, 12), primitive ? 0xc1cc6a : 0xc36eaf, cell, [0, 0, .255])
    if (!primitive) {
      this.blob(cell, 0x35c4d2, .40, [-.15, .08, .08], [1, 1.08, .85], 1)
      this.blob(cell, 0x285485, .24, [-.15, .1, .34], [1.03, 1, .37], 1)
      this.blob(cell, 0x6ddbeb, .10, [-.23, .16, .42], [1, 1, .5], 1)
      for (let i = 0; i < 3; i++) {
        this.tube(cell, Array.from({ length: 7 }, (_, j) => new THREE.Vector3(.14 + j * .085, -.36 + i * .12 + Math.sin(j * 1.1) * .04, .14)), 0x64c9be, .04)
      }
    } else {
      this.tube(cell, Array.from({ length: 10 }, (_, i) => new THREE.Vector3((i - 5) * .09, Math.sin(i * .9) * .23, .16)), 0xe3b25d, .055)
    }
    for (let i = 0; i < 6; i++) {
      const angle = i * 1.047, r = .55
      const organ = this.blob(cell, i % 2 ? 0xf3ca53 : 0xef9554, .12, [Math.cos(angle) * r, Math.sin(angle) * r, .13], [1.6, .65, .7], 1)
      organ.rotation.z = angle + .4
      if (this.ids.has('mitochondria') && !primitive) {
        const fold = this.tube(cell, Array.from({ length: 5 }, (_, j) => new THREE.Vector3(Math.cos(angle) * r + (j - 2) * .04, Math.sin(angle) * r + Math.sin(j * 2) * .025, .22)), 0xbf6345, .018)
        fold.name = 'mitochondrion'
      }
    }
    return cell
  }

  private micro(): void {
    this.scene.background = new THREE.Color(0x182114)
    this.scene.fog = new THREE.FogExp2(0x26361a, .028)
    this.skyLight.color.setHex(0xd6e9d0)
    this.skyLight.groundColor.setHex(0x435020)
    this.sunLight.color.setHex(0xfff4d6)
    ;(this.ambient.material as THREE.PointsMaterial).color.setHex(0xd9df83)
    ;(this.ambient.material as THREE.PointsMaterial).size = .04
    ;(this.ambient.material as THREE.PointsMaterial).opacity = .5
    // Soft, distant light volumes create depth without textures or a flat backdrop image.
    for (let i = 0; i < 15; i++) {
      const glow = new THREE.Mesh(new THREE.CircleGeometry(.25 + i % 4 * .3, 12), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x809650 : 0x779172, transparent: true, opacity: .035 + i % 3 * .015, depthWrite: false, side: THREE.DoubleSide }))
      glow.position.set(Math.sin(i * 2.39) * 11, Math.cos(i * 1.71) * 6, -8 - i % 4 * 2)
      this.world.add(glow)
    }
    const place = (object: THREE.Group, kind: string, x: number, y: number, z: number, size: number, tilt: number) => {
      object.position.set(x, y, z)
      object.scale.setScalar(size)
      object.rotation.set(.08, -.25 + tilt * .15, tilt)
      this.world.add(object); this.register(object, kind)
    }
    const moleculePlaces = [[-4.6, 2.3, -1, .8], [4.6, 2.5, -3, .85], [-3.2, -2.3, -1, .75], [3.7, -2.4, -2, .9], [-.7, 2.7, -5, .85], [2.8, .8, -6, .7], [-5.5, -.5, -5, .7], [.5, -2.4, -5, .65]]
    moleculePlaces.forEach(([x, y, z, size], i) => place(this.molecule(), 'molecule', x, y, z, size, i * .7))
    if (!this.ids.has('metabolism')) {
      place(this.eukaryote(true), 'vesicle', -.2, -.1, .2, this.ids.has('membrane') ? 1.35 : 1.12, -.18)
    }
    if (this.ids.has('rna')) {
      const positions = [[-3.1, .8, -.5, .8, -.23], [2.6, 1.3, -2, .67, .4], [1, -2, -2.3, .55, -.7], [-4.6, -1.4, -4, .55, .8]]
      positions.slice(0, this.ids.has('division') ? 4 : 2).forEach(([x, y, z, size, tilt]) => place(this.dna(), 'dna', x, y, z, size, tilt))
    }
    if (this.ids.has('metabolism')) {
      const positions = [[-.3, -.3, .8, 1.2, .25], [3.8, -.7, -1.7, .9, -.4], [-2.6, -1.7, -2, .72, .5], [-4.5, 2.5, -5, .6, .7], [1.4, 2.7, -4, .65, -.6], [4.5, 1.2, -5, .6, .6], [-4.6, .1, -2.5, .65, -.25], [1.8, -2.7, -4.5, .65, -.3]]
      const amount = Math.min(positions.length, this.quantity('metabolism', 8) + (this.ids.has('division') ? 1 : 0))
      positions.slice(0, amount).forEach(([x, y, z, size, tilt]) => place(this.prokaryote(), 'prokaryote', x, y, z, size, tilt))
    }
    if (this.ids.has('photosynthesis')) place(this.prokaryote(true), 'photosynthetic', -3.7, -.8, -.6, .8, -.7)
    if (this.ids.has('nucleus')) {
      place(this.eukaryote(), 'eukaryote', 2.2, -.2, .3, 1.15, .13)
      if (this.ids.has('mitochondria')) place(this.eukaryote(), 'eukaryote', -.7, 1.9, -3, .62, -.2)
    }
    if (this.ids.has('colony')) {
      const amount = this.quantity('colony', 3)
      for (let i = 0; i < amount; i++) {
        const group = new THREE.Group()
        for (let j = 0; j < 4; j++) {
          const cell = this.eukaryote()
          cell.scale.setScalar(.35)
          cell.position.set(Math.cos(j * 2.4) * .37, Math.sin(j * 2.4) * .36, j % 2 * .15)
          group.add(cell)
        }
        place(group, 'colony', -1.3 + i * 1.5, -2 + i % 2 * .3, -.3 - i * 2, .85, i * .4)
      }
    }
  }

  private plant(position: number[], height: number, color: number): THREE.Group {
    const plant = new THREE.Group()
    plant.position.set(...position as [number, number, number])
    for (let j = 0; j < (this.rendererMode === 'svg' ? 3 : 4); j++) {
      const angle = j * 1.6
      const h = height * (.65 + j * .1)
      const points = [new THREE.Vector3(), new THREE.Vector3(Math.cos(angle) * .17, h * .35, 0), new THREE.Vector3(Math.cos(angle) * .38, h * .75, Math.sin(angle) * .2), new THREE.Vector3(Math.cos(angle) * .27, h, Math.sin(angle) * .3)]
      this.tube(plant, points, color, .07)
      for (let k = 1; k < 4; k++) {
        const leaf = this.mesh(new THREE.SphereGeometry(.3, 5, 3), color, plant, [Math.cos(angle) * .2 + (k % 2 ? .14 : -.14), h * k / 4, Math.sin(angle) * .15], [.45, 1, .12])
        leaf.rotation.z = k % 2 ? -.5 : .5
      }
    }
    this.world.add(plant)
    this.register(plant, 'plant')
    return plant
  }

  private sponge(x: number, z: number, size = 1): void {
    const group = new THREE.Group()
    for (let i = 0; i < 3; i++) {
      const h = [1.1, .65, .85][i] * size, r = [.22, .19, .17][i] * size
      const tube = new THREE.Group()
      this.mesh(new THREE.CylinderGeometry(r, r * 1.25, h, 8, 1, true), i % 2 ? 0xc5678c : 0xce76a0, tube, [0, h / 2, 0])
      this.mesh(new THREE.CylinderGeometry(r * .73, r * .72, .23 * size, 8, 1, true), 0x6d3b68, tube, [0, h - .12 * size, 0], [1, 1, 1], { side: THREE.DoubleSide })
      const lip = this.mesh(new THREE.TorusGeometry(r * .88, r * .13, 4, 8), 0xe89aba, tube, [0, h, 0])
      lip.rotation.x = Math.PI / 2
      this.mesh(new THREE.CircleGeometry(r * .74, 8), 0x422f4e, tube, [0, h - .24 * size, 0]).rotation.x = -Math.PI / 2
      tube.position.set((i - 1) * .36 * size, 0, i % 2 * .24 * size)
      tube.rotation.z = (i - 1) * -.13
      group.add(tube)
    }
    group.position.set(x, this.groundY(x, z) + .03, z)
    this.register(group, 'sponge')
    this.world.add(group)
  }

  private coral(x: number, z: number, color: number): void {
    const group = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const a = i * 1.3
      const end = new THREE.Vector3(Math.cos(a) * .6, .75 + (i % 3) * .25, Math.sin(a) * .35)
      this.tube(group, [new THREE.Vector3(), new THREE.Vector3(end.x * .4, .45, end.z * .4), end], color, .1)
      this.blob(group, color, .13, end.toArray(), [1, 1, 1], 0)
      this.tube(group, [end.clone().multiplyScalar(.65), new THREE.Vector3(end.x + .25, end.y * .8, end.z + .15)], color, .065)
    }
    group.position.set(x, this.groundY(x, z), z)
    this.register(group, 'coral')
    this.world.add(group)
  }

  private jelly(position: number[], size: number): void {
    const jelly = new THREE.Group()
    this.mesh(new THREE.SphereGeometry(.7, 12, 6, 0, Math.PI * 2, 0, Math.PI * .58), 0x74cce2, jelly, [0, .1, 0], [1, .7, 1], { transparent: true, opacity: this.rendererMode === 'svg' ? .88 : .7, side: THREE.DoubleSide, depthWrite: false, roughness: .3 })
    this.blob(jelly, 0xc1a2e3, .24, [0, .17, 0], [1, .6, 1], 1)
    for (let j = 0; j < 8; j++) {
      const a = j * Math.PI / 4
      const r = j % 2 ? .45 : .23
      const tentacle = this.tube(jelly, Array.from({ length: 7 }, (_, k) => new THREE.Vector3(Math.cos(a) * r + Math.sin(k * .9 + j) * .06, -.05 - k * (j % 2 ? .19 : .26), Math.sin(a) * r + Math.cos(k + j) * .07)), j % 2 ? 0x83c0d8 : 0x8b9fdb, .029)
      tentacle.name = 'tentacle'
    }
    jelly.position.set(...position as [number, number, number])
    jelly.scale.setScalar(size)
    this.world.add(jelly)
    this.register(jelly, 'jelly')
  }

  private trilobite(position: number[], size: number): void {
    const animal = new THREE.Group()
    for (let i = 0; i < 8; i++) {
      const width = Math.sin((i + 1) / 9 * Math.PI) * .33 + .1
      this.blob(animal, i % 2 ? 0xc59158 : 0xa67448, .3, [0, .08, (i - 3.5) * .13], [width / .3, .5, .36], 1)
      for (const side of [-1, 1]) this.tube(animal, [new THREE.Vector3(side * width * .75, .03, (i - 3.5) * .13), new THREE.Vector3(side * (width + .16), -.05, (i - 3.5) * .13 - .04)], 0x755d40, .035)
    }
    this.blob(animal, 0xb88851, .30, [0, .08, -.62], [1.15, .5, .7])
    for (const side of [-1, 1]) this.blob(animal, 0x203b36, .035, [side * .15, .21, -.7], [1, 1, 1], 0)
    animal.position.set(...position as [number, number, number])
    animal.scale.setScalar(size)
    this.world.add(animal)
    this.register(animal, 'trilobite')
  }

  private fish(position: number[], size: number, color: number): void {
    const fish = new THREE.Group()
    // A tapered lancelet-like body with visible chevron muscle bands and a fin fold.
    this.blob(fish, color, .48, [0, 0, 0], [1.9, .43, .40], 1)
    this.blob(fish, 0xb9cd7b, .26, [.64, .01, 0], [1.25, .58, .66], 1)
    const tailShape = new THREE.Shape()
    tailShape.moveTo(.04, 0)
    tailShape.lineTo(-.62, .24)
    tailShape.lineTo(-.5, 0)
    tailShape.lineTo(-.62, -.24)
    tailShape.closePath()
    const tail = this.mesh(new THREE.ExtrudeGeometry(tailShape, { depth: .04, bevelEnabled: false }), color, fish, [-.72, 0, -.02])
    tail.name = 'tail'
    const finShape = new THREE.Shape()
    finShape.moveTo(-.72, .06); finShape.lineTo(-.4, .32); finShape.lineTo(.42, .20); finShape.lineTo(.7, .05); finShape.closePath()
    this.mesh(new THREE.ExtrudeGeometry(finShape, { depth: .018, bevelEnabled: false }), 0x8eab55, fish, [0, 0, -.009], [1, 1, 1], { transparent: true, opacity: .7, side: THREE.DoubleSide })
    for (const side of [-1, 1]) {
      this.blob(fish, 0x293a30, .022, [.74, .065, side * .14], [1, 1, .5], 0)
      for (let i = 0; i < 7; i++) {
        const x = -.55 + i * .17, z = side * (.155 - Math.abs(x) * .03)
        this.tube(fish, [new THREE.Vector3(x - .05, .13, z), new THREE.Vector3(x + .035, 0, z + side * .018), new THREE.Vector3(x - .05, -.13, z)], 0x658746, .012)
      }
    }
    fish.position.set(...position as [number, number, number])
    fish.scale.setScalar(size)
    this.world.add(fish)
    this.register(fish, 'fish')
  }

  private quantity(id: string, max: number): number {
    return Math.max(1, Math.min(max, Math.floor(this.populations[id] || 1)))
  }

  private groundY(x: number, z: number): number {
    return -3.0 + Math.sin(x * .23 + z * .14) * .35 + Math.cos(z * .31) * .2
      + Math.exp(-((x + 8) ** 2 + (z + 5) ** 2) / 26) * 1.8
      + Math.exp(-((x - 9) ** 2 + (z + 8) ** 2) / 34) * 2.2
  }

  private flatworm(x: number, z: number, size: number): void {
    const animal = new THREE.Group()
    // A flattened, ribbed oval body, visually distinct from segmented worms.
    this.blob(animal, 0xf0b354, .65, [0, .1, 0], [.65, .16, 1.45], 2)
    for (let i = 0; i < 9; i++) {
      const offset = (i - 4) * .15
      const width = Math.sqrt(Math.max(0, 1 - (offset / .76) ** 2)) * .38
      this.tube(animal, [new THREE.Vector3(-width, .19, offset), new THREE.Vector3(0, .23, offset + .03), new THREE.Vector3(width, .19, offset)], 0xce8b3d, .022)
    }
    animal.position.set(x, this.groundY(x, z) + .1, z)
    animal.scale.setScalar(size)
    this.world.add(animal)
    this.register(animal, 'flatworm')
  }

  private ocean(): void {
    this.scene.background = new THREE.Color(0x0a9bbd)
    this.scene.fog = new THREE.FogExp2(0x148fa7, .027)
    this.skyLight.color.setHex(0xb9f5ff)
    this.skyLight.groundColor.setHex(0x91916e)
    this.sunLight.color.setHex(0xfff0c0)
    ;(this.ambient.material as THREE.PointsMaterial).color.setHex(0xbdf6ff)
    ;(this.ambient.material as THREE.PointsMaterial).opacity = .35
    ;(this.ambient.material as THREE.PointsMaterial).size = .028
    const terrain = new THREE.PlaneGeometry(90, 90, this.rendererMode === 'svg' ? 24 : 76, this.rendererMode === 'svg' ? 24 : 76)
    terrain.rotateX(-Math.PI / 2)
    const vertices = terrain.getAttribute('position')
    const colors: number[] = []
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i), z = vertices.getZ(i)
      vertices.setY(i, this.groundY(x, z))
      const shade = .86 + Math.sin(z * 2.8 + Math.sin(x * .27) * 2) * .07 + Math.sin(x * .73 + z * .83) * .025
      const color = new THREE.Color(0xdad4a3).multiplyScalar(shade)
      colors.push(color.r, color.g, color.b)
    }
    terrain.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    terrain.computeVertexNormals()
    const floor = this.mesh(terrain, 0xffffff, this.world, [0, 0, 0], [1, 1, 1], { vertexColors: true, roughness: .95 })
    floor.castShadow = false
    // Distant angular outcrops frame a natural undersea vista, with no display pedestal.
    const rocks = [[-6, -2, 2.4], [5.8, -5, 3.1], [-7, -10, 3], [9, -13, 3.8], [-11, -6, 4], [1, -14, 2.5], [-4, 4, .8], [6, 3, 1.1]]
    rocks.forEach(([x, z, r], i) => {
      const rock = this.blob(this.world, i % 2 ? 0x315e83 : 0x376684, r, [x, this.groundY(x, z) + r * .38, z], [1.2, .8 + i % 3 * .13, 1], 0)
      rock.rotation.y = i * 1.71
      const ledge = this.blob(this.world, 0x477f94, r * .6, [x + r * .6, this.groundY(x + r * .6, z) + r * .17, z + .3], [1.4, .6, 1], 0)
      ledge.rotation.y = i
    })
    // A broken volcanic wall and distant ridges frame the seabed at several depths.
    for (let i = 0; i < 7; i++) {
      const x = 7.6 + i % 3 * 1.8, z = -7 - Math.floor(i / 3) * 3.2
      const height = 3.5 + i % 3 * 1.3
      const pillar = this.mesh(new THREE.CylinderGeometry(1 + i % 2 * .3, 1.6, height, 5, 1), i % 2 ? 0x345e6d : 0x426c78, this.world, [x, this.groundY(x, z) + height / 2, z])
      pillar.rotation.set(.05 * i, i * 1.7, (i % 2 ? -1 : 1) * .12)
    }
    for (let i = 0; i < 7; i++) {
      const rock = this.blob(this.world, 0x317f8c, 3 + i % 3, [-19 + i * 6, -1.6, -23 - i % 2 * 5], [1.4, .7, 1], 0)
      rock.rotation.y = i * 1.3
    }
    // Fine pale ripples lie on the sand, rather than becoming a floating platform.
    if (this.rendererMode === 'webgl') {
      for (let i = 0; i < 21; i++) {
        const z = -9 + i * .55
        const points = Array.from({ length: 12 }, (_, j) => {
          const x = -6 + j * 1.15, drift = Math.sin(x * .5 + i * .2) * .15
          return new THREE.Vector3(x, this.groundY(x, z + drift) + .008, z + drift)
        })
        const ripple = this.tube(this.world, points, 0xe4ddac, .014)
        ripple.castShadow = false
      }
    }
    for (let i = 0; i < (this.rendererMode === 'svg' ? 8 : 25); i++) {
      const bubble = new THREE.Group()
      const material = new THREE.MeshBasicMaterial({ color: 0xc7f6f0, transparent: true, opacity: .21, depthWrite: false, wireframe: true })
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(.03 + i % 3 * .02, 1), material)
      bubble.add(shell)
      bubble.position.set(Math.sin(i * 2.399) * 8, -2.5 + i % 7 * .8, Math.cos(i * 1.8) * 6 - 3)
      this.world.add(bubble); this.register(bubble, 'bubble', i * .57)
    }
    for (let i = 0; i < 28; i++) {
      const a = i * 2.399, r = 2.6 + i % 7 * .9
      const x = Math.cos(a) * r, z = Math.sin(a) * r - 2
      const stone = this.blob(this.world, i % 2 ? 0x9bb1a5 : 0xd4c789, .12 + i % 4 * .07, [x, this.groundY(x, z) + .08, z], [1.5, .5, 1], 0)
      stone.rotation.y = i
    }
    const plantPositions = [[-4, -3], [-3.5, -3.5], [4.6, -3], [4.9, -4], [-7, -6], [7, -8], [-4.5, 1.5], [4.8, 2], [-2.6, -7], [2.8, -6], [-8, -2], [7, -1]]
    plantPositions.filter((_, i) => this.rendererMode === 'webgl' || i % 2 === 0).forEach(([x, z], i) => this.plant([x, this.groundY(x, z), z], 1.2 + i % 4 * .55, i % 2 ? 0x48a069 : 0x73b653))
    const colony = new THREE.Group()
    colony.position.set(0, this.groundY(0, 0), 0)
    for (let i = 0; i < Math.min(15, 3 + this.quantity('multicellular', 12)); i++) {
      const x = Math.sin(i * 2.1) * (.5 + i * .025), z = Math.cos(i * 2.1) * (.5 + i * .025)
      this.blob(colony, i % 2 ? 0x92b74e : 0xb1c266, .32, [x, .24 + (i % 3) * .07, z], [1, .7, 1])
    }
    this.world.add(colony)
    this.register(colony, 'multicellular')
    if (this.ids.has('sponge')) {
      const locations = [[-2, .4], [2.5, -2], [4.6, 1.2], [-3, -4], [1, -5], [-4, 2], [4, -4], [-5, -2]]
      for (let i = 0; i < this.quantity('sponge', 8); i++) this.sponge(locations[i][0], locations[i][1], i === 0 ? 1.6 : 1 + i % 3 * .2)
    }
    if (this.ids.has('cnidaria')) {
      const locations = [[-.9, .6, -.5], [2.2, 1.3, -3.5], [-3.2, .4, -5], [4, 1.5, -1], [-4, 1.8, -2], [0, 2.3, -7]]
      for (let i = 0; i < this.quantity('cnidaria', 6); i++) this.jelly(locations[i], i === 0 ? 1.4 : .7 + i % 3 * .15)
    }
    if (this.ids.has('bilateral')) { this.flatworm(.5, 2, 1.4); this.flatworm(-2, -1, .9) }
    if (this.ids.has('worm')) {
      for (let j = 0; j < this.quantity('worm', 8); j++) {
        const worm = new THREE.Group()
        for (let i = 0; i < 16; i++) this.blob(worm, i % 2 ? 0xd96576 : 0xeb8892, .12, [(i - 7) * .13, .08 + Math.sin(i * .65) * .03, Math.sin(i * .6) * .16], [1, 1, 1], 0)
        const x = (j % 4) * 1.7 - 3, z = 2.5 - Math.floor(j / 4) * 4
        worm.position.set(x, this.groundY(x, z) + .1, z)
        worm.rotation.y = j
        this.world.add(worm)
        this.register(worm, 'worm')
      }
    }
    if (this.ids.has('trilobite')) {
      const locations = [[1.4, 1], [-2.8, -1.5], [3.4, -3], [-1, 3], [4.5, 1], [0, -5], [-4.5, 0], [2, 3]]
      for (let i = 0; i < this.quantity('trilobite', 8); i++) {
        const [x, z] = locations[i]
        this.trilobite([x, this.groundY(x, z) + .18, z], i === 0 ? 1.8 : 1.1 + i % 2 * .2)
      }
    }
    if (this.ids.has('chordate')) {
      for (let i = 0; i < this.quantity('chordate', 12); i++) {
        const a = i * 2.4
        this.fish(i === 0 ? [.6, -.5, .7] : [Math.sin(a) * 3.6, -.4 + i % 4 * .45, Math.cos(a) * 2.5 - 3], i === 0 ? 1.5 : .7 + i % 3 * .15, i % 2 ? 0xa4bd4e : 0x79ad43)
      }
    }
    if (this.ids.has('reef')) {
      const locations = [[-3.7, 2.1], [3.8, -.9], [.8, -4.4], [-5, -3], [4.5, -4], [-1, -6], [3.8, 2.5], [-5, 1]]
      for (let i = 0; i < this.quantity('reef', 8); i++) this.coral(locations[i][0], locations[i][1], [0xed806a, 0xc17bcd, 0xe5ba54][i % 3])
    }
    if (this.ids.has('ecosystem')) {
      for (let i = 0; i < Math.min(12, this.quantity('ecosystem', 6) * 2); i++) this.fish([Math.sin(i * 1.5) * 4, .3 + i % 3 * .4, Math.cos(i * 1.5) * 3 - 2], .4 + i % 2 * .2, i % 2 ? 0xe1c557 : 0x81b746)
      this.coral(-5, -.4, 0xd777a1)
      this.trilobite([3, this.groundY(3, 1.5) + .15, 1.5], 1.4)
    }
    // Broad translucent shafts taper downward from the imagined water surface.
    for (let i = 0; i < 7; i++) {
      const ray = this.mesh(new THREE.CylinderGeometry(.2, .9 + i % 3 * .25, 23, 4, 1, true), 0xbcefff, this.world, [-9 + i * 3, 6, -9 - i % 2 * 4], [1, 1, 1], { transparent: true, opacity: .035, depthWrite: false, side: THREE.DoubleSide, emissive: 0x8cdbff, emissiveIntensity: .8 })
      ray.rotation.z = -.28
      ray.castShadow = false
      ray.receiveShadow = false
    }
  }

  private rebuild(): void {
    this.oldActorCounts = new Map<string, number>()
    this.actors.forEach(actor => this.oldActorCounts.set(actor.kind, (this.oldActorCounts.get(actor.kind) || 0) + 1))
    this.newActorCounts.clear()
    this.hitActor = null
    this.disposeObject(this.world)
    this.world.clear()
    this.actors = []
    if (this.habitat === 'micro') this.micro()
    else this.ocean()
    this.animateUpgrade = false
  }

  private resize = (): void => {
    const width = Math.max(1, this.container.clientWidth)
    const height = Math.max(1, this.container.clientHeight)
    const previousAspect = this.camera.aspect
    this.camera.aspect = width / height
    if (width < 700) this.camera.setViewOffset(width, height, 0, height * .12, width, height)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
    if (Math.abs(previousAspect - this.camera.aspect) > .15) this.resetCamera()
    if (this.renderer instanceof THREE.WebGLRenderer) this.renderer.setSize(width, height, false)
    else this.renderer.setSize(width, height)
  }

  private pointerDown = (event: PointerEvent): void => {
    this.focusTarget = null
    this.focusPosition = null
    this.pointers.add(event.pointerId)
    if (this.pointers.size > 1) this.wasMultiTouch = true
    if (this.pointers.size === 1) {
      this.pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() }
      this.wasMultiTouch = false
    }
  }

  private pointerCancel = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId)
    this.pointerStart = null
  }

  private pointerUp = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId)
    const start = this.pointerStart
    this.pointerStart = null
    if (!start || event.button !== 0 || this.wasMultiTouch || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 8 || performance.now() - start.time > 600) return
    const rect = this.renderer.domElement.getBoundingClientRect()
    const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    const ray = new THREE.Raycaster()
    ray.setFromCamera(pointer, this.camera)
    const clickable = this.actors.filter(actor => !['bubble', 'plant'].includes(actor.kind))
    const hits = ray.intersectObjects(clickable.map(actor => actor.object), true)
    if (!hits.length) {
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(new THREE.Vector3()), this.controls.target)
      ray.ray.intersectPlane(plane, this.hit)
      this.hitActor = null
      this.onTap(event.clientX - rect.left, event.clientY - rect.top)
      return
    }
    this.hit.copy(hits[0].point)
    let selected: THREE.Object3D | null = hits[0].object
    this.hitActor = null
    while (selected && !this.hitActor) {
      this.hitActor = clickable.find(actor => actor.object === selected) || null
      selected = selected.parent
    }
    this.onTap(event.clientX - rect.left, event.clientY - rect.top)
    const nodeId = ({ vesicle: 'membrane', dna: 'rna', prokaryote: 'metabolism', photosynthetic: 'photosynthesis', eukaryote: 'nucleus', colony: 'colony', multicellular: 'multicellular', sponge: 'sponge', jelly: 'cnidaria', flatworm: 'bilateral', worm: 'worm', trilobite: 'trilobite', fish: 'chordate', coral: 'reef' } as Record<string, string>)[this.hitActor?.kind ?? '']
    if (nodeId && this.ids.has(nodeId)) this.onSelect?.(nodeId)
  }

  private animate = (time: number): void => {
    if (this.disposed || !this.active) return
    const dt = Math.min((time - (this.last || time)) / 1000, .05)
    this.last = time
    this.elapsed += dt
    const t = this.elapsed
    for (const actor of this.actors) {
      const { object, origin, phase, kind, size } = actor
      actor.growth = Math.min(1, actor.growth + dt)
      actor.bounce = Math.max(0, actor.bounce - dt * 2.2)
      const growth = 1 - Math.pow(1 - actor.growth, 3)
      const bounce = Math.sin(actor.bounce * Math.PI * 3) * actor.bounce * .13
      object.scale.setScalar(size)
      object.position.copy(origin)
      if (['vesicle', 'prokaryote', 'photosynthetic', 'eukaryote', 'colony'].includes(kind)) {
        object.position.y = origin.y + Math.sin(t * .6 + phase) * .16
        object.position.x = origin.x + Math.sin(t * .23 + phase) * .12
        object.rotation.y = object.userData.baseRotation.y + Math.sin(t * .23 + phase) * .23
        object.rotation.z = object.userData.baseRotation.z + Math.sin(t * .3 + phase) * .06
        const breathe = 1 + Math.sin(t * 1.4 + phase) * .018
        object.scale.set(size * breathe, size * (2 - breathe), size * breathe)
        const flag = object.getObjectByName('flagellum')
        if (flag) flag.rotation.x = Math.sin(t * 3 + phase) * .25
      } else if (kind === 'dna') {
        object.position.y = origin.y + Math.sin(t * .42 + phase) * .2
        object.rotation.y = object.userData.baseRotation.y + t * .13
        object.rotation.z = object.userData.baseRotation.z + Math.sin(t * .2 + phase) * .08
      } else if (kind === 'bubble') {
        object.position.y = -2.7 + ((t * (.15 + phase % .16) + phase) % 7)
        object.position.x = origin.x + Math.sin(t * .45 + phase) * .1
      } else if (kind === 'molecule') {
        object.position.y = origin.y + Math.sin(t * .25 + phase) * .4
        object.rotation.z = object.userData.baseRotation.z + t * .08
      } else if (kind === 'plant') {
        object.rotation.z = Math.sin(t * 1.1 + phase) * .04
        object.rotation.x = Math.cos(t * .8 + phase) * .03
      } else if (kind === 'jelly') {
        object.position.y = origin.y + Math.sin(t * .9 + phase) * .3
        object.position.x = origin.x + Math.sin(t * .3 + phase) * .3
        object.scale.set(size * (1 + Math.sin(t * 2 + phase) * .07), size * (1 - Math.sin(t * 2 + phase) * .08), size * (1 + Math.sin(t * 2 + phase) * .07))
        object.children.forEach(child => { if (child.name === 'tentacle') child.rotation.z = Math.sin(t * 2 + phase) * .06 })
      } else if (kind === 'fish') {
        const a = t * .22 + phase
        object.position.set(origin.x + Math.sin(a) * 1.4, origin.y + Math.sin(t * .9 + phase) * .14, origin.z + Math.cos(a) * .65)
        object.rotation.y = Math.atan2(Math.sin(a) * .65, Math.cos(a) * 1.4)
        const tail = object.getObjectByName('tail')
        if (tail) tail.rotation.y = Math.sin(t * 7 + phase) * .28
      } else if (kind === 'trilobite' || kind === 'worm' || kind === 'flatworm') {
        object.position.x = origin.x + Math.sin(t * .12 + phase) * .3
        object.rotation.y = Math.sin(t * .12 + phase) * .2 + phase
        object.position.y = this.groundY(object.position.x, object.position.z) + (kind === 'trilobite' ? .18 : .1)
      }
      object.scale.multiplyScalar(Math.max(.025, growth))
      object.scale.x *= 1 + bounce
      object.scale.y *= 1 - bounce
      object.scale.z *= 1 + bounce
      object.position.y -= (1 - growth) * .65
    }
    this.ambient.rotation.y = t * .008
    this.ambient.position.y = Math.sin(t * .1) * .25
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i]
      spark.age += dt
      spark.mesh.position.addScaledVector(spark.velocity, dt)
      spark.velocity.multiplyScalar(1 - dt * 1.4)
      ;(spark.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - spark.age / .9)
      spark.mesh.rotation.x += dt * 2
      if (spark.age > .9) { this.accents.remove(spark.mesh); this.disposeObject(spark.mesh); this.sparks.splice(i, 1) }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i]
      ring.age += dt
      ring.mesh.scale.setScalar(1 + ring.age * 5)
      ;(ring.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, .8 - ring.age)
      if (ring.age > .8) { this.accents.remove(ring.mesh); this.disposeObject(ring.mesh); this.rings.splice(i, 1) }
    }
    if (this.focusTarget && this.focusPosition) {
      this.controls.target.lerp(this.focusTarget, Math.min(1, dt * 4))
      this.camera.position.lerp(this.focusPosition, Math.min(1, dt * 4))
      if (this.camera.position.distanceTo(this.focusPosition) < .03) {
        this.focusTarget = null
        this.focusPosition = null
      }
    }
    this.controls.update()
    this.renderElapsed += dt
    if (this.rendererMode === 'webgl' || this.renderElapsed >= 1 / 24) {
      this.renderer.render(this.scene, this.camera)
      this.renderElapsed = 0
    }
    this.frame = requestAnimationFrame(this.animate)
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse(child => {
      const renderable = child as THREE.Mesh
      renderable.geometry?.dispose()
      if (renderable.material) {
        const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material]
        materials.forEach(material => material.dispose())
      }
    })
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.observer.disconnect()
    this.renderer.domElement.removeEventListener('pointerdown', this.pointerDown)
    this.renderer.domElement.removeEventListener('pointerup', this.pointerUp)
    this.renderer.domElement.removeEventListener('pointercancel', this.pointerCancel)
    this.controls.dispose()
    this.disposeObject(this.scene)
    this.scene.traverse(object => { if (object instanceof THREE.DirectionalLight) object.shadow.dispose() })
    if (this.renderer instanceof THREE.WebGLRenderer) this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
