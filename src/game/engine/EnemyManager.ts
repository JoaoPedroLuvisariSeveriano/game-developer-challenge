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

  spawnEnemy(playerX: number, playerY: number) {
    const inactive = this.enemies.filter(e => !e.active);
    if (inactive.length === 0) return;
    
    const e = inactive[Math.floor(Math.random() * inactive.length)];
    if (!e) return;
    
    // Spawn out of bounds
    const angle = Math.random() * Math.PI * 2;
    const distance = 800; // further than visible screen
    const sx = playerX + Math.cos(angle) * distance;
    const sy = playerY + Math.sin(angle) * distance;
    
    e.spawn(sx, sy, 3); // 3 HP
  }

  update(dt: number, playerX: number, playerY: number) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy(playerX, playerY);
      this.spawnTimer = 180; // roughly 3 seconds
    }

    for (const e of this.enemies) {
      if (e.active) {
        e.update(dt, playerX, playerY);
      }
    }
  }
}
