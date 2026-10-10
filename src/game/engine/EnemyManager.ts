import { Container } from 'pixi.js';
import { Enemy } from '../entities/Enemy';
import { Chaser } from '../entities/Chaser';
import { Shooter } from '../entities/Shooter';
import type { ProjectilePool } from './ProjectilePool';

export class EnemyManager {
  public enemies: Enemy[] = [];
  public container: Container;
  private pool: ProjectilePool;
  
  private spawnTimer = 0;

  constructor(pool: ProjectilePool) {
    this.container = new Container();
    this.pool = pool;
    
    // Pre-allocate some enemies for object pooling
    for (let i = 0; i < 20; i++) {
      const e = i % 2 === 0 ? new Chaser() : new Shooter(this.pool);
      this.enemies.push(e);
      this.container.addChild(e.container);
    }
  }

  spawnEnemy(playerX: number, playerY: number, islands: any[]) {
    const inactive = this.enemies.filter(e => !e.active);
    if (inactive.length === 0) return;
    
    const e = inactive[Math.floor(Math.random() * inactive.length)];
    if (!e) return;
    
    let valid = false;
    let attempts = 0;
    let sx = 0, sy = 0;

    while (!valid && attempts < 10) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const distance = 400 + Math.random() * 200; // spawn outside screen roughly
      sx = playerX + Math.cos(angle) * distance;
      sy = playerY + Math.sin(angle) * distance;

      valid = true;
      for (const island of islands) {
        if (!island) continue;
        const dx = sx - island.x;
        const dy = sy - island.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20 + island.radius + 50) {
          valid = false;
          break;
        }
      }
    }
    
    if (valid) e.spawn(sx, sy, 3); // 3 HP
  }

  update(dt: number, playerX: number, playerY: number, islands: any[]) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy(playerX, playerY, islands);
      this.spawnTimer = 180; // roughly 3 seconds
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;
      if (e.active) {
        e.update(dt, playerX, playerY);
      }
    }
  }
}
