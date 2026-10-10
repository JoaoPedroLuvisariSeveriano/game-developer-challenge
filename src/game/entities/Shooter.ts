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
    
    // Determine movement direction: Orbit the player at safe distance
    let moveAngle = angleToPlayer + Math.PI / 2; // tangent (flanking)
    
    // Adjust radius
    if (dist > this.safeDistance + 20) {
      moveAngle -= 0.5; // spiral inwards
    } else if (dist < this.safeDistance - 20) {
      moveAngle += 0.5; // spiral outwards
    }

    const vx = Math.cos(moveAngle) * this.speed * dt;
    const vy = Math.sin(moveAngle) * this.speed * dt;
    
    this.x += vx;
    this.y += vy;
    
    // 1. SHIP ROTATION STRICTLY FOLLOWS MOVEMENT VECTOR
    // The sprite is drawn facing UP. So we add PI/2 to align "up" with the movement angle.
    const headingAngle = Math.atan2(vy, vx);
    this.container.rotation = headingAngle + Math.PI / 2;
    this.container.x = this.x;
    this.container.y = this.y;

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 450) {
      // 2. BROADSIDE LOGIC
      // Check relative angle between heading and player
      let relAngle = angleToPlayer - headingAngle;
      // Normalize to -PI to PI
      relAngle = Math.atan2(Math.sin(relAngle), Math.cos(relAngle));
      
      const absRelAngle = Math.abs(relAngle);
      const isBroadside = absRelAngle > (Math.PI / 2) - 0.5 && absRelAngle < (Math.PI / 2) + 0.5;
      
      if (isBroadside) {
        // Fire triple broadside towards the player
        // The bullets should be fired towards angleToPlayer
        // pool.spawn velocity uses angle - PI/2 internally because sprites face up.
        // So we feed it angleToPlayer + PI/2.
        const baseAngle = angleToPlayer + Math.PI / 2;
        this.pool.spawn(this.x, this.y, baseAngle - 0.15, 7, 'enemy');
        this.pool.spawn(this.x, this.y, baseAngle, 7, 'enemy');
        this.pool.spawn(this.x, this.y, baseAngle + 0.15, 7, 'enemy');
        this.fireCooldown = 150; // Throttle: 2.5 seconds cooldown
      }
    }
  }
}
