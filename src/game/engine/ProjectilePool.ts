import { Container, Sprite, Texture, Assets } from 'pixi.js';
import { Projectile } from '../entities/Projectile';
import { AudioEngine } from './AudioEngine';

export class ProjectilePool {
  public projectiles: Projectile[] = [];
  public effects: Sprite[] = [];
  public container: Container;

  constructor(poolSize = 100) {
    this.container = new Container();
    for (let i = 0; i < poolSize; i++) {
      const p = new Projectile();
      this.projectiles.push(p);
      this.container.addChild(p.sprite);
    }
  }

  spawn(x: number, y: number, rotation: number, speed: number, owner: 'player' | 'enemy') {
    const p = this.projectiles.find(proj => !proj.active);
    if (p) {
      p.spawn(x, y, rotation, speed, owner);
      this.spawnEffect(x, y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/fire1.png');
      AudioEngine.play('cannon');
    }
    // If pool is exhausted, we just don't shoot (or we could dynamically expand)
  }

  spawnEffect(x: number, y: number, textureName: string) {
    const tex = Assets.get(textureName);
    const eff = tex ? new Sprite(tex) : new Sprite(Texture.WHITE);
    eff.anchor.set(0.5);
    eff.position.set(x, y);
    eff.scale.set(0.5);
    this.effects.push(eff);
    this.container.addChild(eff);
  }

  update(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p) continue;
      if (p.active) {
        p.update(dt);
      }
    }
    
    // update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      if (!eff) continue;
      
      eff.alpha -= 0.05 * dt;
      eff.scale.x += 0.02 * dt;
      eff.scale.y += 0.02 * dt;
      if (eff.alpha <= 0) {
        this.container.removeChild(eff);
        eff.destroy({ children: true, texture: false });
        (eff as any).isDead = true;
      }
    }
    
    this.effects = this.effects.filter(eff => !(eff as any).isDead);
  }
}
