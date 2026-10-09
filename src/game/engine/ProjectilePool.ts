import { Container, Sprite } from 'pixi.js';
import { Projectile } from '../entities/Projectile';

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

  spawn(x: number, y: number, rotation: number, speed: number, owner: 'player' | 'enemy', color?: number) {
    const p = this.projectiles.find(proj => !proj.active);
    if (p) {
      p.spawn(x, y, rotation, speed, owner, color);
      this.spawnEffect(x, y, 'fire_1');
    }
    // If pool is exhausted, we just don't shoot (or we could dynamically expand)
  }

  spawnEffect(x: number, y: number, textureName: string) {
    const eff = Sprite.from(textureName);
    eff.anchor.set(0.5);
    eff.position.set(x, y);
    eff.scale.set(0.5);
    this.effects.push(eff);
    this.container.addChild(eff);
  }

  update(dt: number) {
    for (const p of this.projectiles) {
      if (p.active) {
        p.update(dt);
      }
    }
    
    // update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const eff = this.effects[i];
      eff.alpha -= 0.05 * dt;
      eff.scale.x += 0.02 * dt;
      eff.scale.y += 0.02 * dt;
      if (eff.alpha <= 0) {
        this.container.removeChild(eff);
        eff.destroy();
        this.effects.splice(i, 1);
      }
    }
  }
}
