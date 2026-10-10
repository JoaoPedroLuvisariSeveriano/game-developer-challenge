import { Enemy } from './Enemy';
import type { ProjectilePool } from '../engine/ProjectilePool';

export class Shooter extends Enemy {
  private speed = 1.5;
  private pool: ProjectilePool;
  private fireCooldown = 0;


  constructor(pool: ProjectilePool) {
    super(
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (5).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (11).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (23).png'
    );
    this.pool = pool;
    this.sprite.scale.set(0.6);
  }

  override spawn(x: number, y: number, hp: number) {
    super.spawn(x, y, hp);
    this.fireCooldown = 0; // Reset cooldown on pool spawn
  }

  update(dt: number, playerX: number, playerY: number) {
    if (!this.active) return;
    dt = dt || 1;
    
    let dx = playerX - this.x;
    let dy = playerY - this.y;
    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1 || isNaN(dist)) dist = 1;
    const angleToPlayer = Math.atan2(dy, dx);
    
    // Relentless pursuit: Seek & Shoot
    const vx = Math.cos(angleToPlayer) * this.speed * dt;
    const vy = Math.sin(angleToPlayer) * this.speed * dt;
    this.x += vx;
    this.y += vy;
    
    // Rotate to face player (sprite faces up, so add PI/2)
    this.container.rotation = angleToPlayer + Math.PI / 2;
    this.container.x = this.x;
    this.container.y = this.y;

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && dist < 450) {
      // Fire single frontal shot
      const spawnX = this.x + Math.cos(angleToPlayer) * 30; // Front tip of ship
      const spawnY = this.y + Math.sin(angleToPlayer) * 30;
      
      // The pool uses angle - PI/2 internally because sprites face up
      this.pool.spawn(spawnX, spawnY, angleToPlayer + Math.PI / 2, 7, 'enemy');
      this.fireCooldown = 120; // 2 seconds cooldown
    }
  }
}
