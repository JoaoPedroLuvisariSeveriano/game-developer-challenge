import { Enemy } from './Enemy';
import type { ProjectilePool } from '../engine/ProjectilePool';

export class Shooter extends Enemy {
  private speed = 1.5;
  private pool: ProjectilePool;
  private fireCooldown = 0;
  private safeDistance = 200;

  constructor(pool: ProjectilePool) {
    super('ship_5');
    this.pool = pool;
    this.sprite.tint = 0xaaaaff; // lightly tint
  }

  update(dt: number, playerX: number, playerY: number) {
    if (!this.active) return;
    
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    this.container.rotation = Math.atan2(dy, dx) + Math.PI / 2;

    if (dist > this.safeDistance) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }

    this.container.x = this.x;
    this.container.y = this.y;

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 400) {
      this.pool.spawn(this.x, this.y, this.container.rotation, 7, 'enemy', 0xff0000);
      this.fireCooldown = 120; // roughly 2 seconds at 60fps
    }
  }
}
