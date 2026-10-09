import { Enemy } from './Enemy';
import type { ProjectilePool } from '../engine/ProjectilePool';

export class Shooter extends Enemy {
  private speed = 1.5;
  private pool: ProjectilePool;
  private fireCooldown = 0;
  private safeDistance = 250;

  constructor(pool: ProjectilePool) {
    super(
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (5).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (11).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (23).png'
    );
    this.pool = pool;
    this.sprite.scale.set(0.6);
  }

  update(dt: number, playerX: number, playerY: number) {
    if (!this.active) return;
    
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Broadside angle: point side of ship towards player.
    // atan2(dy,dx) is the angle to the player. 
    // Usually ship faces "up" (rotation 0). To point the left side to player, 
    // rotation = atan2(dy, dx).
    this.container.rotation = Math.atan2(dy, dx);

    // Keep distance
    if (dist > this.safeDistance + 50) {
      // move towards player
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    } else if (dist < this.safeDistance - 50) {
      // retreat
      this.x -= (dx / dist) * this.speed * dt;
      this.y -= (dy / dist) * this.speed * dt;
    }

    this.container.x = this.x;
    this.container.y = this.y;

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 400) {
      // Fire from the side facing the player (left side, which is rotation - PI/2 relative to ship's up)
      // Since ship rotation points its left side at player, the player is exactly to the "left".
      // We'll just shoot a projectile towards the player angle.
      const angleToPlayer = Math.atan2(dy, dx) + Math.PI / 2; // Projectile spawn uses rotation-PI/2 for its velocity
      this.pool.spawn(this.x, this.y, angleToPlayer, 7, 'enemy', 0xff0000);
      this.fireCooldown = 120; // 2 seconds
    }
  }
}
