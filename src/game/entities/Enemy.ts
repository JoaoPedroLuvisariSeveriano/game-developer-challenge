import { Container, Sprite, Texture, Assets } from 'pixi.js';

export abstract class Enemy {
  public container: Container;
  public sprite: Sprite;
  public active = false;
  
  public x = 0;
  public y = 0;
  public hp = 1;
  public maxHp = 1;
  public radius = 20;
  protected normalTexture!: string;
  protected tornTexture!: string;
  protected wreckTexture!: string;

  constructor(textureName: string, tornName?: string, wreckName?: string) {
    this.normalTexture = textureName;
    this.tornTexture = tornName || textureName;
    this.wreckTexture = wreckName || textureName;
    
    this.container = new Container();
    const tex = Assets.get(textureName);
    this.sprite = tex ? new Sprite(tex) : new Sprite(Texture.WHITE);
    this.sprite.anchor.set(0.5);
    
    this.container.addChild(this.sprite);
    this.container.visible = false;
  }

  spawn(x: number, y: number, hp: number) {
    this.x = x;
    this.y = y;
    this.hp = hp;
    this.maxHp = hp;
    this.active = true;
    const tex = Assets.get(this.normalTexture);
    if (tex) this.sprite.texture = tex;
    this.container.x = x;
    this.container.y = y;
    this.container.visible = true;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= this.maxHp / 2 && this.hp > 0) {
      const tex = Assets.get(this.tornTexture);
      if (tex) this.sprite.texture = tex;
    }
  }

  wreck() {
    this.active = false;
    const tex = Assets.get(this.wreckTexture);
    if (tex) this.sprite.texture = tex;
    // Tint slightly greyish to look dead
    this.sprite.tint = 0x888888;
  }

  destroy() {
    this.active = false;
    this.container.visible = false;
  }

  abstract update(dt: number, playerX: number, playerY: number): void;
}
