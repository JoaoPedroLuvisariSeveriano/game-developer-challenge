import { Container, Sprite, Assets } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
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
    
    const createDecor = (id: string | number) => {
      const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${id}.png`;
      const tex = Assets.get(path);
      if (!tex) {
        console.warn('Tile missing:', path);
        return null;
      }
      return new Sprite(tex);
    };

    for (let row = 0; row < grid.length; row++) {
      if (!grid[row]) continue;
      for (let col = 0; col < grid[row].length; col++) {
        const tileId = grid[row][col];
        if (!tileId || isNaN(tileId) || tileId === 0) continue;

        const tileIdStr = tileId < 10 ? `0${tileId}` : `${tileId}`;
        const tile = createDecor(tileIdStr);
        if (!tile) continue; // Safe fallback

        tile.anchor.set(0); 
        
        const xPos = col * tileSize;
        const yPos = row * tileSize;
        if (!isNaN(xPos) && !isNaN(yPos)) {
          tile.position.set(xPos, yPos);
          container.addChild(tile);
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

    const radius = 96; // Exactly half of 192 (for AABB logic to be implemented)

    return { container, radius, isRect: true, width: 192, height: 192 };
  }
}
