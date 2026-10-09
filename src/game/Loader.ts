import { Assets } from 'pixi.js';

export class AssetLoader {
  static async loadAll() {
    const kenneyTextures = [
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_13.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_14.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_29.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_30.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_45.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_46.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_61.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_62.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_77.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_78.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion1.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion2.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/explosion3.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Effects/fire1.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (6).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (12).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (24).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (3).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (9).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (21).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (5).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (11).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (23).png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/cannonBall.png'
    ];

    await Assets.load(kenneyTextures);
  }
}
