import { Application, Container, Ticker } from 'pixi.js';
import { Player } from './Player';
import { ProjectilePool } from './ProjectilePool';
import { EnemyManager } from './EnemyManager';
import { GameFeel } from '../utils/GameFeel';
import { Chaser } from '../entities/Chaser';

export class Game {
  public app: Application;
  public world: Container;
  public player!: Player;
  public pool!: ProjectilePool;
  public enemyManager!: EnemyManager;
  public feel!: GameFeel;
  
  public score = 0;

  constructor() {
    this.app = new Application();
    this.world = new Container();
  }

  async init(canvas: HTMLCanvasElement) {
    await this.app.init({
      canvas,
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.app.stage.addChild(this.world);

    this.feel = new GameFeel(this);

    this.pool = new ProjectilePool(200);
    this.world.addChild(this.pool.container);

    this.enemyManager = new EnemyManager(this.pool);
    this.world.addChild(this.enemyManager.container);

    this.player = new Player(this, this.pool);
    this.world.addChild(this.player.container);

    this.app.ticker.add(this.update.bind(this));
  }

  update(ticker: Ticker) {
    const dt = ticker.deltaTime;
    
    this.feel.update(dt);
    this.player.update(dt);
    this.pool.update(dt);
    this.enemyManager.update(dt, this.player.x, this.player.y);
    
    this.checkCollisions();
  }

  checkCollisions() {
    // Basic Circle Collision
    const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const dx = x1 - x2;
      const dy = y1 - y2;
      return (dx * dx + dy * dy) < ((r1 + r2) * (r1 + r2));
    };

    // Projectiles vs Enemies / Player
    for (const p of this.pool.projectiles) {
      if (!p.active) continue;
      
      if (p.owner === 'player') {
        for (const e of this.enemyManager.enemies) {
          if (e.active && checkCollision(p.x, p.y, 4, e.x, e.y, e.radius)) {
            p.deactivate();
            e.takeDamage(1);
            this.feel.flashTint(e.container);
            if (e.hp <= 0) {
              this.score += 1;
              this.feel.shake(15, 150);
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (checkCollision(p.x, p.y, 4, this.player.x, this.player.y, 20)) {
          p.deactivate();
          this.player.takeDamage(1);
          this.feel.flashTint(this.player.container);
          this.feel.shake(10, 100);
        }
      }
    }

    // Chaser vs Player
    for (const e of this.enemyManager.enemies) {
      if (e.active && e instanceof Chaser) {
        if (checkCollision(e.x, e.y, e.radius, this.player.x, this.player.y, 20)) {
          // Kamikaze hit
          e.destroy(); // Destroy enemy, no points
          this.player.takeDamage(2);
          this.feel.flashTint(this.player.container);
          this.feel.shake(20, 250);
        }
      }
    }
  }
  
  destroy() {
    if (this.player) {
      this.player.destroy();
    }
    this.app.destroy(true, true);
  }
}
