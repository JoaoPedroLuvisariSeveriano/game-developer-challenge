import { Assets } from 'pixi.js';

export class AssetLoader {
  static async loadAll() {
    const kenneyTextures = [
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_80.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_81.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_82.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_83.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_84.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion1.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/fire1.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/cannonBall.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (3).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (5).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/hullLarge (1).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/cannon.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/sailLarge (14).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/flag (2).png'
    ];

    await Assets.load(kenneyTextures);
  }
}
