import { Assets } from 'pixi.js';

export class AssetLoader {
  static async loadAll() {
    const kenneyTextures = [
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_18.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_19.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_34.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_35.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_85.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_86.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_88.png',
      '/assets/kenney_pirate-pack/PNG/Retina/Ship parts/wood (1).png',
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
