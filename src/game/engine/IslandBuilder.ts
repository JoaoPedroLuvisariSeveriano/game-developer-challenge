import { Container, Sprite, Assets, Texture, Graphics } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    const radius = 85; // Exact radius used for physics collision

    // Draw vector terrain
    const graphics = new Graphics();
    
    // Sand base (Matches collision radius perfectly)
    graphics.beginFill(0xE6C280);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();

    // Grass top (Slightly smaller)
    graphics.beginFill(0x4CAF50);
    graphics.drawCircle(0, 0, radius * 0.7);
    graphics.endFill();

    container.addChild(graphics);

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

    // Add Decorations
    const treeTiles = [70, 71, 72];
    const rockTiles = [49, 50, 51];
    const wreckTiles = [81, 82, 83];
    
    const placeDecors = (tiles: number[], num: number) => {
      for (let i = 0; i < num; i++) {
        const decorId = tiles[Math.floor(Math.random() * tiles.length)];
        const decor = createDecor(decorId);
        if (decor) {
          decor.anchor.set(0.5);
          decor.scale.set(0.4); // Scale down giant props
          
          // Confine to grass area safely
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (radius * 0.6); // Keeping it inside grass
          decor.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist);
          
          container.addChild(decor);
        }
      }
    };

    // Place props
    placeDecors(treeTiles, Math.floor(Math.random() * 3) + 1);
    placeDecors(rockTiles, Math.floor(Math.random() * 2) + 1);
    
    if (Math.random() > 0.5) {
      placeDecors(wreckTiles, 1);
    }

    return { container, radius, isRect: false, width: 192, height: 192 };
  }
}
