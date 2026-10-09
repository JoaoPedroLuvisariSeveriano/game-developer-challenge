import { Container, Graphics, Sprite } from 'pixi.js';
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
    
    // Hull
    const hull = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/hullLarge (1).png');
    hull.anchor.set(0.5);
    hull.scale.set(0.5);
    this.container.addChild(hull);

    // Cannons
    const createCannon = (x: number, y: number, angle: number) => {
      const cannon = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/cannon.png');
      cannon.anchor.set(0.5);
      cannon.scale.set(0.5);
      cannon.position.set(x, y);
      cannon.rotation = angle;
      this.container.addChild(cannon);
    };
    
    // Front cannon
    createCannon(0, -30, 0);
    // Left cannons
    createCannon(-15, -10, -Math.PI / 2);
    createCannon(-15, 10, -Math.PI / 2);
    // Right cannons
    createCannon(15, -10, Math.PI / 2);
    createCannon(15, 10, Math.PI / 2);

    // Front Pole & Small Sail
    const frontPole = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/pole.png');
    frontPole.anchor.set(0.5);
    frontPole.scale.set(0.5);
    frontPole.position.set(0, -35);
    this.container.addChild(frontPole);

    const smallSail = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/sailSmall (1).png');
    smallSail.anchor.set(0.5);
    smallSail.scale.set(0.5);
    smallSail.position.set(0, -35);
    this.container.addChild(smallSail);

    // Main Pole & Nest
    const mainPole = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/pole.png');
    mainPole.anchor.set(0.5);
    mainPole.scale.set(0.5);
    mainPole.position.set(0, 5);
    this.container.addChild(mainPole);

    const nest = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/nest.png');
    nest.anchor.set(0.5);
    nest.scale.set(0.5);
    nest.position.set(0, 5);
    this.container.addChild(nest);

    // Main Sail
    const sail = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/sailLarge (14).png');
    sail.anchor.set(0.5);
    sail.scale.set(0.5);
    sail.position.set(0, 0);
    this.container.addChild(sail);

    // Crew member on deck
    const crew = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/crew (1).png');
    crew.anchor.set(0.5);
    crew.scale.set(0.4);
    crew.position.set(0, 22);
    this.container.addChild(crew);

    // Flag at the back
    const flag = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/flag (1).png');
    flag.anchor.set(0.5, 1);
    flag.scale.set(0.5);
    flag.position.set(0, 45);
    this.container.addChild(flag);
    
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
