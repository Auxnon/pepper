import * as THREE from 'three'

export class Card {
  public mesh: THREE.Mesh
  private targetPosition: THREE.Vector3
  private targetRotation: THREE.Euler
  private isLifted: boolean = false
  private scene: THREE.Scene
  private value: string
  private suit: string

  constructor(scene: THREE.Scene, value: string, suit: string, position: THREE.Vector3) {
    this.scene = scene
    this.value = value
    this.suit = suit
    this.targetPosition = position.clone()
    this.targetRotation = new THREE.Euler(0, 0, 0)

    // Create card mesh
    this.mesh = this.createCardMesh()
    this.mesh.position.copy(position)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    scene.add(this.mesh)
  }

  private createCardMesh(): THREE.Mesh {
    // Card dimensions
    const width = 1
    const height = 1.4
    const thickness = 0.02

    // Create rounded rectangle shape for card
    const shape = new THREE.Shape()
    const radius = 0.1
    shape.moveTo(-width/2 + radius, -height/2)
    shape.lineTo(width/2 - radius, -height/2)
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius)
    shape.lineTo(width/2, height/2 - radius)
    shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2)
    shape.lineTo(-width/2 + radius, height/2)
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius)
    shape.lineTo(-width/2, -height/2 + radius)
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2)

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geometry.center()

    // Create materials for front and back
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // sides
      new THREE.MeshStandardMaterial({ color: this.getCardColor() }) // front/back
    ]

    const mesh = new THREE.Mesh(geometry, materials)
    mesh.rotation.x = Math.PI / 2 // Lay flat on table
    
    return mesh
  }

  private getCardColor(): number {
    // Color based on suit
    const suitColors: { [key: string]: number } = {
      'hearts': 0xff4444,
      'diamonds': 0xff8844,
      'clubs': 0x444444,
      'spades': 0x222222
    }
    return suitColors[this.suit] || 0xeeeeee
  }

  public lift(): void {
    this.isLifted = true
    this.targetPosition.y = 1.5
  }

  public drop(): void {
    this.isLifted = false
    this.targetPosition.y = 0
  }

  public setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z)
    if (!this.isLifted) {
      this.targetPosition.set(x, y, z)
    }
  }

  public setTargetPosition(x: number, y: number, z: number): void {
    this.targetPosition.set(x, y, z)
  }

  public setTargetRotation(x: number, y: number, z: number): void {
    this.targetRotation.set(x, y, z)
  }

  public update(): void {
    // Smooth interpolation to target position
    this.mesh.position.lerp(this.targetPosition, 0.1)
    
    // Smooth interpolation to target rotation
    this.mesh.rotation.x += (this.targetRotation.x - this.mesh.rotation.x) * 0.1
    this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.1
    this.mesh.rotation.z += (this.targetRotation.z - this.mesh.rotation.z) * 0.1
  }

  public remove(): void {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(m => m.dispose())
    } else {
      this.mesh.material.dispose()
    }
  }

  public getValue(): string {
    return this.value
  }

  public getSuit(): string {
    return this.suit
  }
}
