import { Sprite, Container, Texture, Assets } from 'pixi.js';

export class Projectile {
  public sprite: Sprite;
  public active = false;
  
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  
  public owner: 'player' | 'enemy' = 'player';
  public life = 0;

  constructor() {
    const texPath = '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/cannonBall.png';
    const tex = Assets.get(texPath);
    this.sprite = tex ? new Sprite(tex) : new Sprite(Texture.WHITE);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.5); // Adjust size as needed
    this.sprite.visible = false;
  }

  spawn(x: number, y: number, rotation: number, speed: number, owner: 'player' | 'enemy', color = 0xffa500) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(rotation - Math.PI / 2) * speed;
    this.vy = Math.sin(rotation - Math.PI / 2) * speed;
    this.owner = owner;
    this.life = 100; // frames or distance
    this.active = true;
    
    // Tint the cannon ball slightly if we want, or keep original
    // this.sprite.tint = color;
    
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.visible = true;
  }

  deactivate() {
    this.active = false;
    this.sprite.visible = false;
  }

  update(dt: number) {
    if (!this.active) return;
    
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    if (this.life <= 0) {
      this.deactivate();
    }
  }
}

