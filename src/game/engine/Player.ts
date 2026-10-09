import { Container, Graphics } from 'pixi.js';
import type { Game } from './Game';
import type { ProjectilePool } from './ProjectilePool';

export class Player {
  public container: Container;
  public graphics: Graphics;
  private pool: ProjectilePool;
  
  public x = 0;
  public y = 0;
  public rotation = 0;
  public hp = 10;
  
  private fireCooldownFront = 0;
  private fireCooldownSide = 0;

  // Input state
  private keys: Record<string, boolean> = {};

  constructor(_game: Game, pool: ProjectilePool) {
    this.container = new Container();
    this.pool = pool;
    
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

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      console.log('Game Over');
    }
  }

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

    // Shooting
    if (this.fireCooldownFront > 0) this.fireCooldownFront -= dt;
    if (this.fireCooldownSide > 0) this.fireCooldownSide -= dt;

    if (this.keys['Space'] && this.fireCooldownFront <= 0) {
      // Frontal shot
      this.pool.spawn(this.x, this.y, this.rotation, 10, 'player', 0x00ff00);
      this.fireCooldownFront = 20;
    }

    if (this.keys['KeyQ'] && this.fireCooldownSide <= 0) {
      // Left side shots
      for (let i = -1; i <= 1; i++) {
        const offset = i * 15;
        const px = this.x + Math.cos(this.rotation) * offset;
        const py = this.y + Math.sin(this.rotation) * offset;
        this.pool.spawn(px, py, this.rotation - Math.PI / 2, 10, 'player', 0x00ff00);
      }
      this.fireCooldownSide = 40;
    }

    if (this.keys['KeyE'] && this.fireCooldownSide <= 0) {
      // Right side shots
      for (let i = -1; i <= 1; i++) {
        const offset = i * 15;
        const px = this.x + Math.cos(this.rotation) * offset;
        const py = this.y + Math.sin(this.rotation) * offset;
        this.pool.spawn(px, py, this.rotation + Math.PI / 2, 10, 'player', 0x00ff00);
      }
      this.fireCooldownSide = 40;
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
