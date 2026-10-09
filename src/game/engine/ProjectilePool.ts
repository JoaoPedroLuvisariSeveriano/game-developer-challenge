import { Container } from 'pixi.js';
import { Projectile } from '../entities/Projectile';

export class ProjectilePool {
  public projectiles: Projectile[] = [];
  public container: Container;

  constructor(poolSize = 100) {
    this.container = new Container();
    for (let i = 0; i < poolSize; i++) {
      const p = new Projectile();
      this.projectiles.push(p);
      this.container.addChild(p.graphics);
    }
  }

  spawn(x: number, y: number, rotation: number, speed: number, owner: 'player' | 'enemy', color?: number) {
    const p = this.projectiles.find(proj => !proj.active);
    if (p) {
      p.spawn(x, y, rotation, speed, owner, color);
    }
    // If pool is exhausted, we just don't shoot (or we could dynamically expand)
  }

  update(dt: number) {
    for (const p of this.projectiles) {
      if (p.active) {
        p.update(dt);
      }
    }
  }
}
