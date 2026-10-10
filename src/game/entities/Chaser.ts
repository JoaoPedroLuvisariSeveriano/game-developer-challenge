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
    
    // Chase logic
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const angleToPlayer = Math.atan2(dy, dx);
    this.x += Math.cos(angleToPlayer) * this.speed * dt;
    this.y += Math.sin(angleToPlayer) * this.speed * dt;
    
    // Look at player
    this.container.rotation = angleToPlayer + Math.PI / 2;

    this.container.x = this.x;
    this.container.y = this.y;
  }
}
