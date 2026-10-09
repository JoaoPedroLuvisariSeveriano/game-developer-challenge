import { Container, Sprite } from 'pixi.js';
import type { Game } from './Game';

export class Player {
  public container: Container;
  public sprite: Sprite;
  
  public x = 0;
  public y = 0;
  public rotation = 0;

  // Input state
  private keys: Record<string, boolean> = {};

  constructor(game: Game) {
    this.container = new Container();
    
    // We use a hull from the manifest, e.g., 'hull_large_1'
    this.sprite = Sprite.from('hull_large_1');
    this.sprite.anchor.set(0.5);
    
    // Scale up the placeholder 1x1 image so we can see it
    this.sprite.scale.set(64); 
    this.sprite.tint = 0x00ff00; // Tint it green to differentiate it

    this.container.addChild(this.sprite);
    
    // Center initially
    this.container.x = window.innerWidth / 2;
    this.container.y = window.innerHeight / 2;
    this.x = this.container.x;
    this.y = this.container.y;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  update(dt: number) {
    const speed = 5 * dt;
    const rotationSpeed = 0.05 * dt;

    let nextX = this.x;
    let nextY = this.y;

    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      nextX += Math.cos(this.rotation - Math.PI / 2) * speed;
      nextY += Math.sin(this.rotation - Math.PI / 2) * speed;
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.rotation -= rotationSpeed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.rotation += rotationSpeed;
    }

    // Map bounds (simulated limits)
    const padding = 32;
    const minX = padding;
    const minY = padding;
    const maxX = window.innerWidth - padding;
    const maxY = window.innerHeight - padding;

    if (nextX < minX) nextX = minX;
    if (nextX > maxX) nextX = maxX;
    if (nextY < minY) nextY = minY;
    if (nextY > maxY) nextY = maxY;

    this.x = nextX;
    this.y = nextY;

    this.container.x = this.x;
    this.container.y = this.y;
    this.container.rotation = this.rotation;
  }
  
  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
