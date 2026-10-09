import { Assets } from 'pixi.js';

export class AssetLoader {
  static kenneyTextures = [
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_01.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_02.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_03.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_06.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_09.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_17.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_18.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_19.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_20.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_23.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_24.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_33.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_34.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_35.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_36.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_37.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_39.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_40.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_49.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_50.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_51.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_70.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_71.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_72.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_73.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_81.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_82.png',
    '/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_83.png',
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

  static async loadAll() {
    const validAssets = this.kenneyTextures.filter(asset => typeof asset === 'string' && asset.trim() !== '');
    
    await Assets.load(validAssets, (progress) => {
      console.log(`[Loader] Assets loading progress: ${(progress * 100).toFixed(0)}%`);
    });
  }

  static async unloadAll() {
    await Assets.unload(this.kenneyTextures);
  }
}
