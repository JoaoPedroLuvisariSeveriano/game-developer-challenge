import { Container, Graphics, Sprite, Texture, Assets } from 'pixi.js';
import type { Game } from './Game';
import type { ProjectilePool } from './ProjectilePool';
import { AudioEngine } from './AudioEngine';

export class Player {
  public container: Container;
  public graphics: Graphics;
  private pool: ProjectilePool;
  
  public x = 0;
  public y = 0;
  public rotation = 0;
  public hp = 10;
  public maxHp = 10;
  public sprite!: Sprite;
  private game: Game;
  
  private fireCooldownFront = 0;
  private fireCooldownSide = 0;

  // Input state
  private keys: Record<string, boolean> = {};

  constructor(_game: Game, pool: ProjectilePool) {
    this.game = _game;
    this.container = new Container();
    this.pool = pool;
    
    this.graphics = new Graphics(); // Keep just for typing if needed, but we won't use it
    
    // Main Ship Sprite
    const texPath = '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (6).png';
    const tex = Assets.get(texPath);
    this.sprite = tex ? new Sprite(tex) : new Sprite(Texture.WHITE);
    if (!tex) {
      this.sprite.width = 64;
      this.sprite.height = 64;
    }
    this.sprite.anchor.set(0.5);
    // Keep proportions correct, just scale down slightly if needed
    this.sprite.scale.set(0.8);
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

  takeDamage(amount: number) {
    this.hp -= amount;
    
    // Torn sails at <= 50%
    if (this.hp <= this.maxHp / 2 && this.hp > 0) {
      const tex = Assets.get('/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (12).png');
      if (tex) this.sprite.texture = tex;
    }

    if (this.hp <= 0) {
      const tex = Assets.get('/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (24).png');
      if (tex) this.sprite.texture = tex;
      console.log('Game Over');
    }
  }

  update(dt: number) {
    const speed = 5 * dt;
    const rotationSpeed = 0.05 * dt;

    let nextX = this.x;
    let nextY = this.y;

    let isMoving = false;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      nextX += Math.cos(this.rotation - Math.PI / 2) * speed;
      nextY += Math.sin(this.rotation - Math.PI / 2) * speed;
      isMoving = true;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      nextX -= Math.cos(this.rotation - Math.PI / 2) * speed;
      nextY -= Math.sin(this.rotation - Math.PI / 2) * speed;
      isMoving = true;
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.rotation -= rotationSpeed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.rotation += rotationSpeed;
    }

    if (isMoving && Math.random() > 0.5) {
      // Spawn a simple wake effect behind the ship
      const wx = this.x - Math.cos(this.rotation - Math.PI / 2) * 30;
      const wy = this.y - Math.sin(this.rotation - Math.PI / 2) * 30;
      this.game.pool.spawnEffect(wx, wy, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
    }

    // Shooting
    if (this.fireCooldownFront > 0) this.fireCooldownFront -= dt;
    if (this.fireCooldownSide > 0) this.fireCooldownSide -= dt;

    if (this.keys['Space'] && this.fireCooldownFront <= 0) {
      // Frontal shot
      this.pool.spawn(this.x, this.y, this.rotation, 10, 'player');
      this.fireCooldownFront = 20;
      AudioEngine.play('shoot');
    }

    if (this.keys['KeyQ'] && this.fireCooldownSide <= 0) {
      // Left side shots
      for (let i = -1; i <= 1; i++) {
        const offset = i * 15;
        const px = this.x + Math.cos(this.rotation) * offset;
        const py = this.y + Math.sin(this.rotation) * offset;
        this.pool.spawn(px, py, this.rotation - Math.PI / 2, 10, 'player');
      }
      this.fireCooldownSide = 40;
      AudioEngine.play('shoot');
    }

    if (this.keys['KeyE'] && this.fireCooldownSide <= 0) {
      // Right side shots
      for (let i = -1; i <= 1; i++) {
        const offset = i * 15;
        const px = this.x + Math.cos(this.rotation) * offset;
        const py = this.y + Math.sin(this.rotation) * offset;
        this.pool.spawn(px, py, this.rotation + Math.PI / 2, 10, 'player');
      }
      this.fireCooldownSide = 40;
      AudioEngine.play('shoot');
    }

    // Map bounds (simulated limits)
    const padding = 32;
    const minX = padding;
    const minY = padding;
    const maxX = (this.game?.app?.screen?.width || window.innerWidth) - padding;
    const maxY = (this.game?.app?.screen?.height || window.innerHeight) - padding;

    if (isNaN(nextX)) nextX = minX;
    if (isNaN(nextY)) nextY = minY;

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
