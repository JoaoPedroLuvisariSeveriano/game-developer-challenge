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
    const angleToPlayer = Math.atan2(dy, dx);
    
    // We want to orbit the player at safeDistance.
    // So target angle is angleToPlayer + 90 degrees (orbiting)
    // plus a small correction to get closer/farther if not at safeDistance.
    let moveAngle = angleToPlayer + Math.PI / 2; // tangent
    
    if (dist > this.safeDistance + 20) {
      // angle slightly towards player
      moveAngle -= 0.5;
    } else if (dist < this.safeDistance - 20) {
      // angle slightly away
      moveAngle += 0.5;
    }

    this.x += Math.cos(moveAngle) * this.speed * dt;
    this.y += Math.sin(moveAngle) * this.speed * dt;
    
    // Ship faces its movement direction
    this.container.rotation = moveAngle + Math.PI / 2;
    this.container.x = this.x;
    this.container.y = this.y;

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 400) {
      // Fire triple broadside towards the player
      // angleToPlayer is the angle towards player. 
      // The projectile spawn expects an angle where it fires straight out from rotation-PI/2.
      // So we just give angleToPlayer + PI/2 to pool.spawn to make it shoot towards angleToPlayer
      const baseAngle = angleToPlayer + Math.PI / 2;
      this.pool.spawn(this.x, this.y, baseAngle - 0.1, 7, 'enemy', 0xff0000);
      this.pool.spawn(this.x, this.y, baseAngle, 7, 'enemy', 0xff0000);
      this.pool.spawn(this.x, this.y, baseAngle + 0.1, 7, 'enemy', 0xff0000);
      this.fireCooldown = 120; // 2 seconds
    }
  }
}
