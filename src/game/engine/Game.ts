import { Application, Container, Ticker, TilingSprite, Sprite } from 'pixi.js';
import { Player } from './Player';
import { ProjectilePool } from './ProjectilePool';
import { EnemyManager } from './EnemyManager';
import { GameFeel } from '../utils/GameFeel';
import { Chaser } from '../entities/Chaser';
import { snapshotOptions } from '../../state/optionsStore';
import { useMatchStore } from '../../state/matchStore';

export class Game {
  public app: Application;
  public world: Container;
  public backgroundLayer: Container;
  public ocean!: TilingSprite;
  public player!: Player;
  public pool!: ProjectilePool;
  public enemyManager!: EnemyManager;
  public feel!: GameFeel;
  
  public score = 0;
  public timeRemaining = 0;
  
  private isPaused = false;

  constructor() {
    this.app = new Application();
    this.world = new Container();
    this.backgroundLayer = new Container();
  }

  async init(canvas: HTMLCanvasElement) {
    const config = snapshotOptions();
    this.timeRemaining = config.sessionTimeSeconds;
    useMatchStore.getState().resetMatch();
    this.score = 0;

    await this.app.init({
      canvas,
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.app.stage.addChild(this.backgroundLayer);
    this.app.stage.addChild(this.world);

    // Ocean Tiling Background
    this.ocean = new TilingSprite({
      texture: Sprite.from('tile_73').texture,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.backgroundLayer.addChild(this.ocean);

    // Random Islands / Rocks
    for (let i = 0; i < 15; i++) {
      // randomly pick an island/rock tile
      const tId = Math.floor(Math.random() * 5) + 80; // tiles 80-84 as islands?
      const island = Sprite.from(`tile_${tId}`);
      island.anchor.set(0.5);
      island.position.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
      island.scale.set(1.5 + Math.random() * 2);
      // subtle rotation
      island.rotation = Math.random() * Math.PI * 2;
      this.backgroundLayer.addChild(island);
    }

    this.feel = new GameFeel(this);

    this.pool = new ProjectilePool(200);
    this.world.addChild(this.pool.container);

    this.enemyManager = new EnemyManager(this.pool);
    // Use config to set spawn intervals inside EnemyManager if needed
    // Assuming EnemyManager handles its own spawn logic, we can pass config.enemySpawnIntervalSeconds
    
    this.world.addChild(this.enemyManager.container);

    this.player = new Player(this, this.pool);
    this.world.addChild(this.player.container);

    // Initial Sync
    useMatchStore.getState().setMatchData(this.player.hp, this.score, this.timeRemaining);

    this.app.ticker.add(this.update.bind(this));

    // Handle focus loss for auto-pause
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onBlur = () => {
    if (useMatchStore.getState().status === 'playing') {
      this.pause();
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      const status = useMatchStore.getState().status;
      if (status === 'playing') {
        this.pause();
      } else if (status === 'paused') {
        this.resume();
      }
    }
  };

  public pause() {
    this.isPaused = true;
    this.app.ticker.stop();
    useMatchStore.getState().setStatus('paused');
  }

  public resume() {
    this.isPaused = false;
    this.app.ticker.start();
    useMatchStore.getState().setStatus('playing');
  }

  update(ticker: Ticker) {
    if (this.isPaused) return;

    const dt = ticker.deltaTime;
    
    // time in seconds. Assuming 1 deltaTime ~ 1/60th sec
    this.timeRemaining -= (dt / 60);
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.endGame('time_up');
      return;
    }

    if (this.ocean) {
      this.ocean.tilePosition.x -= 0.5 * dt;
      this.ocean.tilePosition.y += 0.2 * dt;
    }

    this.feel.update(dt);
    this.player.update(dt);
    this.pool.update(dt);
    this.enemyManager.update(dt, this.player.x, this.player.y);
    
    this.checkCollisions();

    // Sync HUD
    useMatchStore.getState().setMatchData(this.player.hp, this.score, this.timeRemaining);
  }

  checkCollisions() {
    const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const dx = x1 - x2;
      const dy = y1 - y2;
      return (dx * dx + dy * dy) < ((r1 + r2) * (r1 + r2));
    };

    for (const p of this.pool.projectiles) {
      if (!p.active) continue;
      
      if (p.owner === 'player') {
        for (const e of this.enemyManager.enemies) {
          if (e.active && checkCollision(p.x, p.y, 4, e.x, e.y, e.radius)) {
            this.pool.spawnEffect(p.x, p.y, 'explosion_1');
            p.deactivate();
            e.takeDamage(1);
            this.feel.flashTint(e.container);
            if (e.hp <= 0) {
              this.score += 1;
              this.feel.shake(15, 150);
              this.pool.spawnEffect(e.x, e.y, 'explosion_3');
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (checkCollision(p.x, p.y, 4, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(p.x, p.y, 'explosion_2');
          p.deactivate();
          this.player.takeDamage(1);
          this.feel.flashTint(this.player.container);
          this.feel.shake(10, 100);
          if (this.player.hp <= 0) {
            this.pool.spawnEffect(this.player.x, this.player.y, 'explosion_3');
            this.endGame('player_destroyed');
          }
        }
      }
    }

    for (const e of this.enemyManager.enemies) {
      if (e.active && e instanceof Chaser) {
        if (checkCollision(e.x, e.y, e.radius, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(e.x, e.y, 'explosion_3');
          e.destroy();
          this.player.takeDamage(2);
          this.feel.flashTint(this.player.container);
          this.feel.shake(20, 250);
          if (this.player.hp <= 0) {
            this.pool.spawnEffect(this.player.x, this.player.y, 'explosion_3');
            this.endGame('player_destroyed');
          }
        }
      }
    }
  }

  endGame(reason: 'time_up' | 'player_destroyed') {
    this.isPaused = true;
    this.app.ticker.stop();
    // Notify store, which will show game over screen
    useMatchStore.getState().setMatchData(this.player.hp, this.score, this.timeRemaining);
    // Setting global status
    useMatchStore.getState().setGameOver(reason);
  }
  
  destroy() {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('keydown', this.onKeyDown);
    if (this.player) {
      this.player.destroy();
    }
    this.app.destroy(true, { children: true, texture: true });
  }
}
