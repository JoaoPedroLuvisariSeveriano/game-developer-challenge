import { Enemy } from './Enemy';

export class Chaser extends Enemy {
  private speed = 2.5;

  constructor() {
    super('/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (3).png'); // dark ship maybe
    this.sprite.tint = 0xffaaaa; // lightly tint to differentiate if needed, or don't
    this.sprite.scale.set(0.5);
  }

  update(dt: number, playerX: number, playerY: number) {
    if (!this.active) return;
    
    // Chase logic
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
      
      // Look at player
      this.container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    }

    this.container.x = this.x;
    this.container.y = this.y;
  }
}
