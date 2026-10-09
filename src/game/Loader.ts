import { Assets } from 'pixi.js';
import manifest from '../generated/asset-manifest.json';

export class AssetLoader {
  static async loadAll() {
    const assetsToLoad = manifest.paths.filter(p => p.endsWith('.png') || p.endsWith('.wav'));
    
    assetsToLoad.forEach(p => {
      const name = p.split('/').pop()?.split('.')[0] || p;
      Assets.add({ alias: name, src: `${manifest.root}/${p}` });
    });

    const keys = assetsToLoad.map(p => p.split('/').pop()?.split('.')[0] || p);
    await Assets.load(keys);
  }
}
