import { Application, Container, Ticker, TilingSprite, Sprite, Texture, Assets } from 'pixi.js';
import { Player } from './Player';
import { ProjectilePool } from './ProjectilePool';
import { EnemyManager } from './EnemyManager';
import { GameFeel } from '../utils/GameFeel';
import { Chaser } from '../entities/Chaser';
import { snapshotOptions } from '../../state/optionsStore';
import { useMatchStore } from '../../state/matchStore';
import { IslandBuilder } from './IslandBuilder';
import { AudioEngine } from './AudioEngine';

export class Game {
  public app: Application;
  public world: Container;
  public backgroundLayer: Container;
  public ocean!: TilingSprite;
  public player!: Player;
  public pool!: ProjectilePool;
  public enemyManager!: EnemyManager;
  public feel!: GameFeel;
  
  private lastHp = -1;
  private lastScore = -1;
  private lastTimeInt = -1;
  public islands: { sprite: Sprite, x: number, y: number, radius: number, expiresAt?: number, isRect?: boolean, width?: number, height?: number, isDead?: boolean }[] = [];
  
  public score = 0;
  public timeRemaining = 0;
  
  private isPaused = false;
  public isDestroyed = false;

  constructor() {
    this.app = new Application();
    this.world = new Container();
    this.backgroundLayer = new Container();
  }

  private idleTicker: ((ticker: Ticker) => void) | null = null;
  public isCombatStarted = false;

  async initIdle() {
    console.log('--- MARCO 8: Game.initIdle() iniciado ---');
    const oceanTexture = Assets.get('/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png');
    
    this.ocean = new TilingSprite({
      texture: oceanTexture || Texture.WHITE,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.app.stage.addChildAt(this.ocean, 0);

    for (let i = 0; i < 5; i++) {
      const { container: island, radius } = IslandBuilder.build();
      const scale = 1.2 + Math.random() * 0.5;
      const finalRadius = radius * scale;
      
      let x = 0;
      let y = 0;
      let valid = false;
      let attempts = 0;
      
      while (!valid && attempts < 50) {
        x = Math.random() * this.app.screen.width;
        y = Math.random() * this.app.screen.height;
        valid = true;
        
        for (const existing of this.islands) {
          const dx = x - existing.x;
          const dy = y - existing.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= finalRadius + existing.radius + 80) {
            valid = false;
            break;
          }
        }
        attempts++;
      }
      
      if (valid) {
        island.position.set(x, y);
        island.scale.set(scale);
        this.backgroundLayer.addChild(island);
        this.islands.push({ sprite: island as any, x, y, radius: finalRadius });
      }
    }

    this.app.stage.addChild(this.backgroundLayer);

    this.idleTicker = (ticker: Ticker) => {
      if (this.ocean) {
        this.ocean.tilePosition.x -= 0.5 * ticker.deltaTime;
        this.ocean.tilePosition.y += 0.2 * ticker.deltaTime;
      }
    };
    this.app.ticker.add(this.idleTicker);
  }

  async startCombat() {
    if (this.isCombatStarted) return;
    this.isCombatStarted = true;

    if (this.idleTicker) {
      this.app.ticker.remove(this.idleTicker);
      this.idleTicker = null;
    }

    console.log('--- MARCO 9: Game.startCombat() iniciado ---');
    const config = snapshotOptions();
    this.timeRemaining = config.sessionTimeSeconds;
    this.score = 0;

    this.feel = new GameFeel(this);

    this.pool = new ProjectilePool(200);
    this.world.addChild(this.pool.container);

    this.enemyManager = new EnemyManager(this.pool);
    this.world.addChild(this.enemyManager.container);

    this.player = new Player(this, this.pool);
    this.world.addChild(this.player.container);

    useMatchStore.getState().setMatchData(this.player.hp, this.score, this.timeRemaining);

    this.app.ticker.add(this.update.bind(this));

    window.addEventListener('blur', this.onBlur);
    window.addEventListener('keydown', this.onKeyDown);
    
    this.app.stage.addChild(this.world);
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
    try {
      if (this.isPaused) return;

      const dt = ticker.deltaTime;
      
      const status = useMatchStore.getState().status;
      
      // time in seconds. Assuming 1 deltaTime ~ 1/60th sec
      if (status === 'playing') {
        this.timeRemaining -= (dt / 60);
        if (this.timeRemaining <= 0) {
          this.timeRemaining = 0;
          this.endGame('time_up');
          return;
        }

        // Mark expired islands (shipwrecks)
        const now = Date.now();
        for (let i = this.islands.length - 1; i >= 0; i--) {
          const island = this.islands[i];
          if (!island) continue;
          if (island.expiresAt && now >= island.expiresAt) {
            island.sprite.destroy();
            island.isDead = true;
          }
        }

        this.player.update(dt);
        this.pool.update(dt);
        this.enemyManager.update(dt, this.player.x, this.player.y, this.islands);
        this.feel.update(dt);
        this.checkCollisions();
        
        // Sweep islands
        this.islands = this.islands.filter(island => !island.isDead);
      }

      if (this.ocean) {
        this.ocean.tilePosition.x -= 0.5 * dt;
        this.ocean.tilePosition.y += 0.2 * dt;
      }

      // Sync HUD efficiently
      const currentHp = this.player.hp;
      const currentScore = this.score;
      const currentTimeInt = Math.ceil(this.timeRemaining);
      
      if (this.lastHp !== currentHp || this.lastScore !== currentScore || this.lastTimeInt !== currentTimeInt) {
        useMatchStore.getState().setMatchData(currentHp, currentScore, this.timeRemaining);
        this.lastHp = currentHp;
        this.lastScore = currentScore;
        this.lastTimeInt = currentTimeInt;
      }
    } catch (e) {
      console.error("GameLoop Crash:", e);
    }
  }

  checkCollisions() {
    const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const dx = x1 - x2;
      const dy = y1 - y2;
      return (dx * dx + dy * dy) < ((r1 + r2) * (r1 + r2));
    };

    const checkIslandHit = (cx: number, cy: number, cr: number, island: any) => {
      if (island.isRect) {
        const halfW = island.width / 2;
        const halfH = island.height / 2;
        const testX = Math.max(island.x - halfW, Math.min(cx, island.x + halfW));
        const testY = Math.max(island.y - halfH, Math.min(cy, island.y + halfH));
        const distSq = (cx - testX) * (cx - testX) + (cy - testY) * (cy - testY);
        return distSq < (cr * cr);
      } else {
        return checkCollision(cx, cy, cr, island.x, island.y, island.radius);
      }
    };

    const resolveIslandHit = (entity: { x: number, y: number }, r: number, island: any) => {
      const dx = entity.x - island.x;
      const dy = entity.y - island.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1; // previne div zero
      
      if (dist < r + island.radius) {
        const dirX = dx / dist;
        const dirY = dy / dist;
        entity.x = island.x + (dirX * (r + island.radius));
        entity.y = island.y + (dirY * (r + island.radius));
      }
    };

    for (let i = this.pool.projectiles.length - 1; i >= 0; i--) {
      const p = this.pool.projectiles[i];
      if (!p) continue;
      if (!p.active) continue;
      
      // Check Projectile vs Islands
      let hitIsland = false;
      for (let j = this.islands.length - 1; j >= 0; j--) {
        const island = this.islands[j];
        if (!island) continue;
        if (checkIslandHit(p.x, p.y, 4, island)) {
          this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png');
          AudioEngine.play('explosion');
          p.deactivate();
          hitIsland = true;
          break;
        }
      }
      if (hitIsland) continue;
      
      if (p.owner === 'player') {
        for (let k = this.enemyManager.enemies.length - 1; k >= 0; k--) {
          const e = this.enemyManager.enemies[k];
          if (!e) continue;
          if (e.active && checkCollision(p.x, p.y, 4, e.x, e.y, e.radius)) {
            this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion1.png');
            AudioEngine.play('explosion');
            p.deactivate();
            e.takeDamage(1);
            AudioEngine.play('damage');
            this.feel.flashTint(e.container);
            if (e.hp <= 0) {
              this.score += 1;
              this.feel.shake(15, 150);
              this.pool.spawnEffect(e.x, e.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
              AudioEngine.play('explosion');
              e.wreck();
              this.islands.push({ sprite: e.container as any, x: e.x, y: e.y, radius: e.radius, expiresAt: Date.now() + 10000 });
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (checkCollision(p.x, p.y, 4, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png');
          AudioEngine.play('explosion');
          p.deactivate();
          this.player.takeDamage(1);
          AudioEngine.play('damage');
          this.feel.flashTint(this.player.container);
          this.feel.shake(10, 100);
          if (this.player.hp <= 0) {
            this.pool.spawnEffect(this.player.x, this.player.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
            AudioEngine.play('explosion');
            this.endGame('player_destroyed');
          }
        }
      }
    }

    // Player vs Islands
    for (let i = this.islands.length - 1; i >= 0; i--) {
      const island = this.islands[i];
      if (!island) continue;
      resolveIslandHit(this.player, 20, island);
    }

    for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
      const e = this.enemyManager.enemies[i];
      if (!e) continue;
      if (!e.active) continue;

      // Enemy vs Islands
      for (let j = this.islands.length - 1; j >= 0; j--) {
        const island = this.islands[j];
        if (!island) continue;
        resolveIslandHit(e, e.radius, island);
      }

      if (e instanceof Chaser) {
        if (checkCollision(e.x, e.y, e.radius, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(e.x, e.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
          AudioEngine.play('explosion');
          e.destroy();
          this.player.takeDamage(2);
          AudioEngine.play('damage');
          this.feel.flashTint(this.player.container);
          this.feel.shake(20, 250);
          if (this.player.hp <= 0) {
            this.pool.spawnEffect(this.player.x, this.player.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
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
  
  public async startEngine(container: HTMLDivElement) {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x87CEEB,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    container.appendChild(this.app.canvas);
  }

  public destroy() {
    this.isDestroyed = true;
    try {
      window.removeEventListener('blur', this.onBlur);
      window.removeEventListener('keydown', this.onKeyDown);
      if (this.player) {
        this.player.destroy();
      }
      if (this.app && this.app.renderer) {
        this.app.destroy({ removeView: true }, { children: true, texture: true });
      }
    } catch (e) {
      console.warn('Destroy safely bypassed:', e);
    }
  }
}
