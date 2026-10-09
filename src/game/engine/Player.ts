import { Container, Graphics } from 'pixi.js';
import type { Game } from './Game';

export class Player {
  public container: Container;
  public graphics: Graphics;
  
  public x = 0;
  public y = 0;
  public rotation = 0;

  // Input state
  private keys: Record<string, boolean> = {};

  constructor(_game: Game) {
    this.container = new Container();
    
    // Fallback graphics to ensure visibility
    this.graphics = new Graphics();
    this.graphics.rect(-20, -20, 40, 40);
    this.graphics.fill(0xff0000); // Red color
    
    // To identify the front of the ship
    this.graphics.moveTo(0, -20);
    this.graphics.lineTo(20, 0);
    this.graphics.lineTo(-20, 0);
    this.graphics.fill(0xffff00);

    this.container.addChild(this.graphics);
    
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
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      nextX -= Math.cos(this.rotation - Math.PI / 2) * speed;
      nextY -= Math.sin(this.rotation - Math.PI / 2) * speed;
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
