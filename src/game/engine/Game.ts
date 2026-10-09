import { Application, Container, Ticker } from 'pixi.js';
import { Player } from './Player';

export class Game {
  public app: Application;
  public world: Container;
  public player!: Player;

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

    this.player = new Player(this);
    this.world.addChild(this.player.container);

    this.app.ticker.add(this.update.bind(this));
  }

  update(ticker: Ticker) {
    const dt = ticker.deltaTime;
    this.player.update(dt);
  }
  
  destroy() {
    if (this.player) {
      this.player.destroy();
    }
    this.app.destroy(true, true);
  }
}
