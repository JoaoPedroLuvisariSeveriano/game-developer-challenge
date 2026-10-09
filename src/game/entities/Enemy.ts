import { Container, Sprite } from 'pixi.js';

export abstract class Enemy {
  public container: Container;
  public sprite: Sprite;
  public active = false;
  
  public x = 0;
  public y = 0;
  public hp = 1;
  public radius = 20;

  constructor(textureName: string) {
    this.container = new Container();
    this.sprite = Sprite.from(textureName);
    this.sprite.anchor.set(0.5);
    
    // Maybe some cannon or sail depending on enemy type, 
    // but the subclasses will handle specific parts if needed.
    // For simplicity, we just use a base texture.
    
    this.container.addChild(this.sprite);
    this.container.visible = false;
  }

  spawn(x: number, y: number, hp: number) {
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.active = true;
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
    }
  }

  destroy() {
    this.active = false;
    this.container.visible = false;
  }

  abstract update(dt: number, playerX: number, playerY: number): void;
}
