import { Application, Container, Ticker, TilingSprite, Sprite, Texture, Assets } from 'pixi.js';
import { Player } from './Player';
import { ProjectilePool } from './ProjectilePool';
import { EnemyManager } from './EnemyManager';
import { GameFeel } from '../utils/GameFeel';
import { Chaser } from '../entities/Chaser';
import { snapshotOptions } from '../../state/optionsStore';
import { useMatchStore } from '../../state/matchStore';
import { IslandBuilder } from './IslandBuilder';

export class Game {
  public app: Application;
  public world: Container;
  public backgroundLayer: Container;
  public ocean!: TilingSprite;
  public player!: Player;
  public pool!: ProjectilePool;
  public enemyManager!: EnemyManager;
  public feel!: GameFeel;
  public islands: { sprite: Sprite, x: number, y: number, radius: number, expiresAt?: number, isRect?: boolean, width?: number, height?: number }[] = [];
  
  public score = 0;
  public timeRemaining = 0;
  
  private isPaused = false;
  public isDestroyed = false;

  public readonly WORLD_WIDTH = 3000;
  public readonly WORLD_HEIGHT = 3000;

  constructor() {
    this.app = new Application();
    this.world = new Container();
    this.backgroundLayer = new Container();
  }

  async initGameLogic() {
    console.log('--- MARCO 8: Game.initLogic() iniciado ---');
    const config = snapshotOptions();
    this.timeRemaining = config.sessionTimeSeconds;
    this.score = 0;



    // Ocean Tiling Background
    console.log('--- MARCO 9: A ler textura do oceano ---');
    const oceanTexture = Assets.get('/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png');
    
    this.ocean = new TilingSprite({
      texture: oceanTexture || Texture.WHITE,
      width: this.app.screen.width,
      height: this.app.screen.height,
    });
    this.app.stage.addChildAt(this.ocean, 0);

    // Random Islands / Rocks
    // Create 5 islands
    for (let i = 0; i < 5; i++) {
      const { container: island, radius } = IslandBuilder.build();
      const x = Math.random() * this.WORLD_WIDTH;
      const y = Math.random() * this.WORLD_HEIGHT;
      island.position.set(x, y);
      const scale = 1.2 + Math.random() * 0.5;
      island.scale.set(scale);
      island.rotation = Math.random() * Math.PI * 2;
      this.backgroundLayer.addChild(island);

      this.islands.push({ sprite: island as any, x, y, radius: radius * scale });
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
    
    // Final Anchoring
    this.app.stage.addChild(this.backgroundLayer);
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

      // Cleanup expired islands (shipwrecks)
      const now = Date.now();
      for (let i = this.islands.length - 1; i >= 0; i--) {
        const island = this.islands[i];
        if (!island) continue;
        if (island.expiresAt && now >= island.expiresAt) {
          island.sprite.destroy();
          this.islands.splice(i, 1);
        }
      }

      this.player.update(dt);
      this.pool.update(dt);
      this.enemyManager.update(dt, this.player.x, this.player.y);

      if (this.player) {
        const safeX = this.player.x || 0;
        const safeY = this.player.y || 0;
        
        if (!isNaN(safeX) && !isNaN(safeY)) {
          this.world.pivot.x = safeX;
          this.world.pivot.y = safeY;
          this.backgroundLayer.pivot.x = safeX;
          this.backgroundLayer.pivot.y = safeY;
        }
        
        this.world.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.backgroundLayer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
      }
      
      // Apply camera shake/feel AFTER the camera is centered
      this.feel.update(dt);
      
      this.checkCollisions();

      // Sync HUD
      useMatchStore.getState().setMatchData(this.player.hp, this.score, this.timeRemaining);
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
      if (island.isRect) {
        const halfW = island.width / 2;
        const halfH = island.height / 2;
        const testX = Math.max(island.x - halfW, Math.min(entity.x, island.x + halfW));
        const testY = Math.max(island.y - halfH, Math.min(entity.y, island.y + halfH));
        const dx = entity.x - testX;
        const dy = entity.y - testY;
        const distSq = dx * dx + dy * dy;
        if (distSq < r * r) {
          const dist = Math.sqrt(distSq);
          if (dist === 0) {
            entity.y -= r; // arbitrary push out if center exactly matched
          } else {
            const overlap = r - dist;
            entity.x += (dx / dist) * overlap;
            entity.y += (dy / dist) * overlap;
          }
        }
      } else {
        const dx = entity.x - island.x;
        const dy = entity.y - island.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const overlap = (r + island.radius) - dist;
        if (overlap > 0 && dist > 0) {
          entity.x += (dx / dist) * overlap;
          entity.y += (dy / dist) * overlap;
        }
      }
    };

    for (const p of this.pool.projectiles) {
      if (!p.active) continue;
      
      // Check Projectile vs Islands
      let hitIsland = false;
      for (const island of this.islands) {
        if (!island) continue;
        if (checkIslandHit(p.x, p.y, 4, island)) {
          this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png');
          p.deactivate();
          hitIsland = true;
          break;
        }
      }
      if (hitIsland) continue;
      
      if (p.owner === 'player') {
        for (const e of this.enemyManager.enemies) {
          if (e.active && checkCollision(p.x, p.y, 4, e.x, e.y, e.radius)) {
            this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion1.png');
            p.deactivate();
            e.takeDamage(1);
            this.feel.flashTint(e.container);
            if (e.hp <= 0) {
              this.score += 1;
              this.feel.shake(15, 150);
              this.pool.spawnEffect(e.x, e.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
              e.wreck();
              this.islands.push({ sprite: e.container as any, x: e.x, y: e.y, radius: e.radius, expiresAt: Date.now() + 10000 });
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (checkCollision(p.x, p.y, 4, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(p.x, p.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png');
          p.deactivate();
          this.player.takeDamage(1);
          this.feel.flashTint(this.player.container);
          this.feel.shake(10, 100);
          if (this.player.hp <= 0) {
            this.pool.spawnEffect(this.player.x, this.player.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
            this.endGame('player_destroyed');
          }
        }
      }
    }

    // Player vs Islands
    for (const island of this.islands) {
      if (!island) continue;
      resolveIslandHit(this.player, 20, island);
    }

    for (const e of this.enemyManager.enemies) {
      if (!e.active) continue;

      // Enemy vs Islands
      for (const island of this.islands) {
        if (!island) continue;
        resolveIslandHit(e, e.radius, island);
      }

      if (e instanceof Chaser) {
        if (checkCollision(e.x, e.y, e.radius, this.player.x, this.player.y, 20)) {
          this.pool.spawnEffect(e.x, e.y, '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png');
          e.destroy();
          this.player.takeDamage(2);
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
        this.app.destroy({ removeView: true }, { children: true, texture: true, baseTexture: true });
      }
    } catch (e) {
      console.warn('Destroy safely bypassed:', e);
    }
  }
}
