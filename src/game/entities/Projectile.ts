import { Graphics } from 'pixi.js';

export class Projectile {
  public graphics: Graphics;
  public active = false;
  
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  
  public owner: 'player' | 'enemy' = 'player';
  public life = 0;

  constructor() {
    this.graphics = new Graphics();
    this.graphics.circle(0, 0, 4);
    this.graphics.fill(0xffa500); // Orange by default
    this.graphics.visible = false;
  }

  spawn(x: number, y: number, rotation: number, speed: number, owner: 'player' | 'enemy', color = 0xffa500) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(rotation - Math.PI / 2) * speed;
    this.vy = Math.sin(rotation - Math.PI / 2) * speed;
    this.owner = owner;
    this.life = 100; // frames or distance
    this.active = true;
    
    this.graphics.clear();
    this.graphics.circle(0, 0, 4);
    this.graphics.fill(color);
    
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.visible = true;
  }

  deactivate() {
    this.active = false;
    this.graphics.visible = false;
  }

  update(dt: number) {
    if (!this.active) return;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    
    this.graphics.x = this.x;
    this.graphics.y = this.y;

    if (this.life <= 0) {
      this.deactivate();
    }
  }
}
