import { Container, Sprite, Assets } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    const tileSize = 64;
    const isTropical = Math.random() > 0.5;
    
    // 1. Matrizes 9-Slice Perfeitas (4x4)
    let grid: number[][];
    if (!isTropical) {
      grid = [
        [1, 2, 2, 3],
        [17, 18, 18, 19],
        [17, 18, 18, 19],
        [33, 34, 34, 35]
      ];
    } else {
      grid = [
        [5, 6, 6, 7],
        [21, 22, 22, 23],
        [21, 22, 22, 23],
        [37, 38, 38, 39]
      ];
    }

    const rows = grid.length;
    const cols = grid[0].length;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileId = grid[r][c];
        const tileIdStr = tileId < 10 ? `0${tileId}` : `${tileId}`;
        const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${tileIdStr}.png`;
        const tex = Assets.get(path);
        
        if (tex) {
          const tile = new Sprite(tex);
          tile.anchor.set(0); 
          tile.position.set(c * tileSize, r * tileSize);
          container.addChild(tile);
        }
      }
    }
    
    const width = cols * tileSize;
    const height = rows * tileSize;
    
    // Pivot no centro matemático do retângulo
    container.pivot.set(width / 2, height / 2);

    // 3. Props (Vegetação e Rochas Nativas)
    const treeTiles = [70, 71, 72];
    const rockTiles = [49, 50, 51];
    
    const createDecor = (id: number) => {
      const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${id}.png`;
      const tex = Assets.get(path);
      return tex ? new Sprite(tex) : null;
    };

    const numProps = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numProps; i++) {
      const isTree = Math.random() > 0.5;
      const decorId = isTree ? treeTiles[Math.floor(Math.random() * treeTiles.length)] : rockTiles[Math.floor(Math.random() * rockTiles.length)];
      const decor = createDecor(decorId);
      
      if (decor) {
        decor.anchor.set(0.5);
        decor.scale.set(0.6); 
        
        // Coordenadas restritas aos blocos centrais de terreno
        const innerX = tileSize + Math.random() * (width - 2 * tileSize);
        const innerY = tileSize + Math.random() * (height - 2 * tileSize);
        
        decor.position.set(innerX, innerY);
        container.addChild(decor);
      }
    }

    return { container, isRect: true, width, height };
  }
}
