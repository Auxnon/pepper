import './style.css'
import * as THREE from 'three'
import { Card } from './Card'
import { Deck } from './Deck'

class CardGame {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private raycaster: THREE.Raycaster
  private mouse: THREE.Vector2
  private deck: Deck
  private cards: Card[] = []
  private selectedCard: Card | null = null
  private isDragging = false
  private dragPlane: THREE.Plane
  private dragOffset: THREE.Vector3
  private tableGroup: THREE.Group

  constructor() {
    // Initialize scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x2d5016)

    // Initialize camera with 45-degree angle view
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 10, 12)
    this.camera.lookAt(0, 0, 0)

    // Initialize renderer
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Initialize raycaster and mouse
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    this.dragOffset = new THREE.Vector3()

    // Create table group for organizing scene
    this.tableGroup = new THREE.Group()
    this.scene.add(this.tableGroup)

    // Setup scene
    this.setupLights()
    this.createTable()

    // Initialize deck
    this.deck = new Deck(this.scene)

    // Setup event listeners
    this.setupEventListeners()

    // Start animation loop
    this.animate()
  }

  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Rim light
    const rimLight = new THREE.DirectionalLight(0x8888ff, 0.3)
    rimLight.position.set(-5, 5, -5)
    this.scene.add(rimLight)
  }

  private createTable(): void {
    // Table surface
    const tableGeometry = new THREE.BoxGeometry(16, 0.5, 10)
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a4d2e,
      roughness: 0.7,
      metalness: 0.1
    })
    const table = new THREE.Mesh(tableGeometry, tableMaterial)
    table.position.y = -0.25
    table.receiveShadow = true
    this.tableGroup.add(table)

    // Table edge
    const edgeGeometry = new THREE.BoxGeometry(16.2, 0.3, 10.2)
    const edgeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a2511,
      roughness: 0.8
    })
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
    edge.position.y = -0.5
    this.tableGroup.add(edge)

    // Player area markers
    this.createPlayerMarker(0, 0, 4, 'Player')
    this.createPlayerMarker(0, 0, -4, 'Opponent')
  }

  private createPlayerMarker(x: number, y: number, z: number, label: string): void {
    const markerGeometry = new THREE.PlaneGeometry(5, 1)
    const markerMaterial = new THREE.MeshStandardMaterial({ 
      color: label === 'Player' ? 0x3a7d44 : 0x7d3a44,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.rotation.x = -Math.PI / 2
    marker.position.set(x, y + 0.01, z)
    this.tableGroup.add(marker)
  }

  private setupEventListeners(): void {
    // Mouse events
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))

    // Window resize
    window.addEventListener('resize', this.onWindowResize.bind(this))

    // Button events
    const shuffleBtn = document.getElementById('shuffle-btn')
    const dealBtn = document.getElementById('deal-btn')

    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => this.shuffleDeck())
    }

    if (dealBtn) {
      dealBtn.addEventListener('click', () => this.dealCards())
    }
  }

  private onMouseMove(event: MouseEvent): void {
    // Update mouse position
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    if (this.isDragging && this.selectedCard) {
      // Update raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // Find intersection with drag plane
      const intersection = new THREE.Vector3()
      this.raycaster.ray.intersectPlane(this.dragPlane, intersection)

      if (intersection) {
        // Update card position
        this.selectedCard.setPosition(
          intersection.x - this.dragOffset.x,
          this.selectedCard.mesh.position.y,
          intersection.z - this.dragOffset.z
        )
      }
    }
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return // Only left click

    // Update mouse position
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Check for card intersections
    const intersects = this.raycaster.intersectObjects(
      this.cards.map(card => card.mesh),
      false
    )

    if (intersects.length > 0) {
      // Find the card that was clicked
      const clickedMesh = intersects[0].object
      const card = this.cards.find(c => c.mesh === clickedMesh)

      if (card) {
        this.selectedCard = card
        this.isDragging = true

        // Lift the card
        card.lift()

        // Calculate drag offset
        const intersection = intersects[0].point
        this.dragOffset.set(
          intersection.x - card.mesh.position.x,
          0,
          intersection.z - card.mesh.position.z
        )
      }
    }
  }

  private onMouseUp(): void {
    if (this.selectedCard) {
      // Drop the card
      this.selectedCard.drop()
      this.selectedCard = null
    }
    this.isDragging = false
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private async shuffleDeck(): Promise<void> {
    console.log('Shuffling deck...')
    await this.deck.shuffle()
  }

  private async dealCards(): Promise<void> {
    console.log('Dealing 5 cards...')
    
    // Clear existing cards
    this.cards.forEach(card => card.remove())
    this.cards = []

    // Deal 5 cards to player position
    const dealtCards = await this.deck.deal(5)
    
    // Position cards in player's area
    dealtCards.forEach((card, index) => {
      const spacing = 1.5
      const startX = -(dealtCards.length - 1) * spacing / 2
      card.setTargetPosition(startX + index * spacing, 0, 4)
    })

    this.cards = dealtCards
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate())

    // Update all cards
    this.cards.forEach(card => card.update())
    this.deck.update()

    this.renderer.render(this.scene, this.camera)
  }
}

// Initialize the game when DOM is ready
new CardGame()
