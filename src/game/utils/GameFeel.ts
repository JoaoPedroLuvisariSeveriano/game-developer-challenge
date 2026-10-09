import { Container } from 'pixi.js';
import type { Game } from '../engine/Game';

export class GameFeel {
  private game: Game;
  private shakeTimer = 0;
  private shakeMagnitude = 0;
  private baseWorldX = 0;
  private baseWorldY = 0;

  constructor(game: Game) {
    this.game = game;
    this.baseWorldX = game.world.x;
    this.baseWorldY = game.world.y;
  }

  public shake(magnitude = 10, durationMs = 200) {
    this.shakeMagnitude = magnitude;
    this.shakeTimer = durationMs;
  }

  public async flashTint(container: Container, color = 0xff0000, durationMs = 100) {
    // A simple tint flash by finding all PIXI.Graphics/Sprite children
    // In PixiJS v8, Graphics and Sprite have a 'tint' property.
    const targets: any[] = [];
    
    // Naive deep search for tintable children
    const findTargets = (c: Container) => {
      if ('tint' in c) {
        targets.push(c);
      }
      c.children.forEach(child => findTargets(child));
    };
    findTargets(container);

    const originalTints = targets.map(t => t.tint);
    targets.forEach(t => t.tint = color);

    setTimeout(() => {
      targets.forEach((t, i) => {
        if (!t.destroyed) {
          t.tint = originalTints[i];
        }
      });
    }, durationMs);
  }

  update(dt: number) {
    // Assuming dt is in 60fps frame time roughly (~16.6ms)
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt * (1000 / 60);
      const offsetX = (Math.random() * 2 - 1) * this.shakeMagnitude;
      const offsetY = (Math.random() * 2 - 1) * this.shakeMagnitude;
      
      // Instead of caching base world position, just add to the game world's position dynamically
      // Game.ts will reset the position to the center of the screen every frame, and feel will add the offset
      this.game.world.x += offsetX;
      this.game.world.y += offsetY;
      this.game.backgroundLayer.x += offsetX;
      this.game.backgroundLayer.y += offsetY;
    }
  }
}
