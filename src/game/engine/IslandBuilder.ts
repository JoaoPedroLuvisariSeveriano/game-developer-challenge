import { Container, Sprite } from 'pixi.js';

export class IslandBuilder {
  static build(): { container: Container, radius: number } {
    const container = new Container();
    
    // Base land tiles (using 13, 14, 29, 30 for a cohesive look if possible, or random)
    const baseTiles = [13, 14, 29, 30]; 
    
    // We position them in a 2x2 grid. Kenney tiles are usually 64x64
    const positions = [
      { x: -32, y: -32, tile: 13 },
      { x: 32, y: -32, tile: 14 },
      { x: -32, y: 32, tile: 29 },
      { x: 32, y: 32, tile: 30 }
    ];

    for (const pos of positions) {
      const tile = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${pos.tile}.png`);
      tile.anchor.set(0.5);
      tile.position.set(pos.x, pos.y);
      container.addChild(tile);
    }

    // Add some random decorations (trees/rocks proxy)
    const decorTiles = [61, 62, 77, 78];
    const numDecors = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numDecors; i++) {
      const decorId = decorTiles[Math.floor(Math.random() * decorTiles.length)];
      const decor = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${decorId}.png`);
      decor.anchor.set(0.5);
      decor.scale.set(0.8); // slight scale down for decor
      decor.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
      container.addChild(decor);
    }

    // Add some wood wreckage
    if (Math.random() > 0.5) {
      const wood = Sprite.from('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/wood (1).png');
      wood.anchor.set(0.5);
      wood.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
      wood.rotation = Math.random() * Math.PI;
      container.addChild(wood);
    }

    const radius = 55; // Appropriate collision radius for the assembled container

    return { container, radius };
  }
}
