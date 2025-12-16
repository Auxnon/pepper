import * as THREE from 'three'
import { Card } from './Card'
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_THICKNESS,
  DECK_POSITION
} from './constants'

export class Deck {
  private scene: THREE.Scene
  private deckPosition: THREE.Vector3
  private isShuffling: boolean = false
  private shuffleCards: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.deckPosition = new THREE.Vector3(DECK_POSITION.x, DECK_POSITION.y, DECK_POSITION.z)
    
    // Create visual deck representation
    this.createDeckPile()
  }

  private createDeckPile(): void {
    // Create a stack of card representations
    const cardGeometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_THICKNESS, CARD_HEIGHT)
    const cardMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4444ff,
      roughness: 0.5
    })

    for (let i = 0; i < 10; i++) {
      const card = new THREE.Mesh(cardGeometry, cardMaterial)
      card.position.set(
        this.deckPosition.x,
        this.deckPosition.y + i * CARD_THICKNESS,
        this.deckPosition.z
      )
      card.rotation.x = Math.PI / 2
      card.castShadow = true
      this.scene.add(card)
      this.shuffleCards.push(card)
    }
  }

  private createCard(value: string, suit: string): Card {
    return new Card(
      this.scene,
      value,
      suit,
      this.deckPosition.clone()
    )
  }

  public async shuffle(): Promise<void> {
    if (this.isShuffling) return
    
    this.isShuffling = true

    // Animate shuffle - cards fly up and around
    const shufflePromises: Promise<void>[] = []

    this.shuffleCards.forEach((card, index) => {
      const promise = new Promise<void>((resolve) => {
        const startPos = card.position.clone()
        const startRot = card.rotation.clone()
        
        // Random target position in the air
        const targetPos = new THREE.Vector3(
          this.deckPosition.x + (Math.random() - 0.5) * 4,
          this.deckPosition.y + 3 + Math.random() * 2,
          this.deckPosition.z + (Math.random() - 0.5) * 4
        )

        const targetRot = new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        )

        const duration = 1000
        const delay = index * 50
        const startTime = Date.now() + delay

        const animate = () => {
          const now = Date.now()
          const elapsed = now - startTime

          if (elapsed < 0) {
            requestAnimationFrame(animate)
            return
          }

          if (elapsed < duration) {
            const progress = elapsed / duration
            const eased = this.easeInOutCubic(progress)

            // Move to random position
            card.position.lerpVectors(startPos, targetPos, eased)
            card.rotation.x = startRot.x + (targetRot.x - startRot.x) * eased
            card.rotation.y = startRot.y + (targetRot.y - startRot.y) * eased
            card.rotation.z = startRot.z + (targetRot.z - startRot.z) * eased

            requestAnimationFrame(animate)
          } else if (elapsed < duration * 2) {
            // Return to deck
            const progress = (elapsed - duration) / duration
            const eased = this.easeInOutCubic(progress)

            const finalPos = new THREE.Vector3(
              this.deckPosition.x,
              this.deckPosition.y + index * CARD_THICKNESS,
              this.deckPosition.z
            )
            const finalRot = new THREE.Euler(Math.PI / 2, 0, 0)

            card.position.lerpVectors(targetPos, finalPos, eased)
            card.rotation.x = targetRot.x + (finalRot.x - targetRot.x) * eased
            card.rotation.y = targetRot.y + (finalRot.y - targetRot.y) * eased
            card.rotation.z = targetRot.z + (finalRot.z - targetRot.z) * eased

            requestAnimationFrame(animate)
          } else {
            // Reset to final position
            card.position.set(
              this.deckPosition.x,
              this.deckPosition.y + index * CARD_THICKNESS,
              this.deckPosition.z
            )
            card.rotation.set(Math.PI / 2, 0, 0)
            resolve()
          }
        }

        animate()
      })

      shufflePromises.push(promise)
    })

    await Promise.all(shufflePromises)
    this.isShuffling = false
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  public async deal(count: number): Promise<Card[]> {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades']
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    
    const dealtCards: Card[] = []

    for (let i = 0; i < count; i++) {
      // Create a random card
      const suit = suits[Math.floor(Math.random() * suits.length)]
      const value = values[Math.floor(Math.random() * values.length)]
      
      const card = this.createCard(value, suit)
      
      // Animate card flying from deck
      await this.animateCardDeal(card, i)
      
      dealtCards.push(card)
    }

    return dealtCards
  }

  private async animateCardDeal(card: Card, index: number): Promise<void> {
    return new Promise((resolve) => {
      const startPos = this.deckPosition.clone()
      const arcHeight = 3
      const duration = 800
      const delay = index * 150
      const startTime = Date.now() + delay

      const animate = () => {
        const now = Date.now()
        const elapsed = now - startTime

        if (elapsed < 0) {
          requestAnimationFrame(animate)
          return
        }

        if (elapsed < duration) {
          const progress = elapsed / duration

          // Calculate arc position
          const y = Math.sin(progress * Math.PI) * arcHeight

          card.mesh.position.set(
            startPos.x,
            y,
            startPos.z
          )

          // Rotate card as it flies
          card.mesh.rotation.y = progress * Math.PI * 2

          requestAnimationFrame(animate)
        } else {
          card.mesh.rotation.y = 0
          card.mesh.rotation.x = Math.PI / 2
          resolve()
        }
      }

      animate()
    })
  }

  public update(): void {
    // Update logic if needed
  }
}
