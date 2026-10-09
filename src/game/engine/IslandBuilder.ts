import { Container, Sprite } from 'pixi.js';

export class IslandBuilder {
  static build(): { container: Container, radius: number } {
    const container = new Container();
    const isTropical = Math.random() > 0.5;
    
    let grid: number[][];

    if (!isTropical) {
      // Sand Island Map 3x3
      grid = [
        [1, 2, 3],
        [17, Math.random() > 0.5 ? 18 : 20, 19],
        [33, 34, 35]
      ];
    } else {
      // Tropical Island Map 3x3
      grid = [
        [6, Math.random() > 0.5 ? 23 : 24, 9],
        [Math.random() > 0.5 ? 23 : 39, Math.random() > 0.5 ? 24 : 40, Math.random() > 0.5 ? 24 : 40],
        [36, Math.random() > 0.5 ? 39 : 40, 37]
      ];
    }
    
    const tileSize = 64;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const tileId = grid[row][col];
        const tileIdStr = tileId < 10 ? `0${tileId}` : `${tileId}`;
        const tile = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${tileIdStr}.png`);
        tile.anchor.set(0.5);
        tile.position.set((col - 1) * tileSize, (row - 1) * tileSize);
        container.addChild(tile);
      }
    }

    // Add Decorations
    const treeTiles = [70, 71, 72];
    const rockTiles = [49, 50, 51];
    const wreckTiles = [81, 82, 83];
    
    // Place 1-3 trees
    const numTrees = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTrees; i++) {
      const decorId = treeTiles[Math.floor(Math.random() * treeTiles.length)];
      const decor = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${decorId}.png`);
      decor.anchor.set(0.5);
      decor.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
      container.addChild(decor);
    }

    // Place 1-2 rocks
    const numRocks = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numRocks; i++) {
      const decorId = rockTiles[Math.floor(Math.random() * rockTiles.length)];
      const decor = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${decorId}.png`);
      decor.anchor.set(0.5);
      decor.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
      container.addChild(decor);
    }

    // Place a wreckage sometimes
    if (Math.random() > 0.5) {
      const decorId = wreckTiles[Math.floor(Math.random() * wreckTiles.length)];
      const decor = Sprite.from(`/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${decorId}.png`);
      decor.anchor.set(0.5);
      decor.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
      container.addChild(decor);
    }

    const radius = 90; // Appropriate collision radius for a 3x3 grid

    return { container, radius };
  }
}
