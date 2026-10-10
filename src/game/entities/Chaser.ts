import { Enemy } from './Enemy';

export class Chaser extends Enemy {
  private speed = 2.5;

  constructor() {
    super(
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (3).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (9).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (21).png'
    );
    this.sprite.scale.set(0.6);
  }

  update(dt: number, playerX: number, playerY: number) {
    if (!this.active) return;
    dt = dt || 1;
    
    // Chase logic
    let dx = playerX - this.x;
    let dy = playerY - this.y;
    if (isNaN(dx)) dx = 0;
    if (isNaN(dy)) dy = 0;
    
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1 || isNaN(dist)) dist = 1;
    
    const angleToPlayer = Math.atan2(dy, dx);
    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
    
    // Look at player
    this.container.rotation = angleToPlayer + Math.PI / 2;

    this.container.x = this.x;
    this.container.y = this.y;
  }
}
