import { Container, Graphics } from 'pixi.js';

export abstract class Enemy {
  public container: Container;
  public graphics: Graphics;
  public active = false;
  
  public x = 0;
  public y = 0;
  public hp = 1;
  public radius = 20;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
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
