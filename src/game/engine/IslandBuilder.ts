import { Container, Sprite, Assets, Texture } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    const isTropical = Math.random() > 0.5;
    
    let grid: number[][];

    if (!isTropical) {
      // Sand Island Map 3x3
      grid = [
        [1, 2, 3],
        [17, 18, 19],
        [33, 34, 35]
      ];
    } else {
      // Tropical Island Map 3x3
      grid = [
        [5, 6, 7],
        [21, 22, 23],
        [37, 38, 39]
      ];
    }
    
    const tileSize = 64;
    
    const createDecor = (id: string | number) => {
      const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${id}.png`;
      const tex = Assets.get(path) || Texture.WHITE;
      const sprite = new Sprite(tex);
      if (tex === Texture.WHITE) {
        sprite.width = 64;
        sprite.height = 64;
      }
      return sprite;
    };

    for (let row = 0; row < grid.length; row++) {
      if (!grid[row]) continue;
      for (let col = 0; col < grid[row].length; col++) {
        const tileId = grid[row][col];
        if (!tileId || isNaN(tileId) || tileId === 0) continue;

        const tileIdStr = tileId < 10 ? `0${tileId}` : `${tileId}`;
        
        try {
          const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${tileIdStr}.png`;
          const tex = Assets.get(path);
          
          if (!tex) continue;
          
          const tile = new Sprite(tex);
          
          tile.anchor.set(0); 
          
          const xPos = col * tileSize;
          const yPos = row * tileSize;
          
          if (!isNaN(xPos) && !isNaN(yPos)) {
            tile.position.set(xPos, yPos);
            container.addChild(tile);
          }
        } catch (e) {
          console.warn("Tile ignorado", e);
        }
      }
    }
    
    // Center the island physically so the coordinates represent the middle
    container.pivot.set(tileSize * 1.5, tileSize * 1.5);

    // Add Decorations
    const treeTiles = [70, 71, 72];
    const rockTiles = [49, 50, 51];
    const wreckTiles = [81, 82, 83];
    
    // Place 1-3 trees
    const numTrees = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTrees; i++) {
      const decorId = treeTiles[Math.floor(Math.random() * treeTiles.length)];
      const decor = createDecor(decorId);
      if (decor) {
        decor.anchor.set(0.5);
        decor.position.set(96 + (Math.random() - 0.5) * 120, 96 + (Math.random() - 0.5) * 120);
        container.addChild(decor);
      }
    }

    // Place 1-2 rocks
    const numRocks = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numRocks; i++) {
      const decorId = rockTiles[Math.floor(Math.random() * rockTiles.length)];
      const decor = createDecor(decorId);
      if (decor) {
        decor.anchor.set(0.5);
        decor.position.set(96 + (Math.random() - 0.5) * 120, 96 + (Math.random() - 0.5) * 120);
        container.addChild(decor);
      }
    }

    // Place a wreckage sometimes
    if (Math.random() > 0.5) {
      const decorId = wreckTiles[Math.floor(Math.random() * wreckTiles.length)];
      const decor = createDecor(decorId);
      if (decor) {
        decor.anchor.set(0.5);
        decor.position.set(96 + (Math.random() - 0.5) * 120, 96 + (Math.random() - 0.5) * 120);
        container.addChild(decor);
      }
    }

    const radius = 85; // Solid circular collision radius

    return { container, radius, isRect: false, width: 192, height: 192 };
  }
}
