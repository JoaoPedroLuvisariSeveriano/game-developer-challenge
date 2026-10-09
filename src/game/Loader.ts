import { Assets } from 'pixi.js';
import manifest from '../generated/asset-manifest.json';

export class AssetLoader {
  static async loadAll() {
    // Assets are now loaded asynchronously on demand using Sprite.from() 
    // with explicit URLs to the Kenney Pirate Pack.
    return Promise.resolve();
  }
}
