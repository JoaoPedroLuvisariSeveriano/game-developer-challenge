import { Container, Sprite, Assets, Graphics } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    
    // 1. Variedade de Tamanhos
    const radius = 60 + Math.random() * 40; 

    const graphics = new Graphics();
    
    // 2. Metaballs (Círculos sobrepostos para bordas suaves)
    const drawMetaballs = (g: Graphics, baseRadius: number, color: number) => {
      g.beginFill(color);
      
      // Central circle
      g.drawCircle(0, 0, baseRadius * 0.85);
      
      // Círculos satélites nas bordas
      const numCircles = 5 + Math.floor(Math.random() * 3); // de 5 a 7
      for (let i = 0; i < numCircles; i++) {
        const angle = (i / numCircles) * Math.PI * 2 + (Math.random() * 0.5);
        const subRadius = baseRadius * 0.3 + (Math.random() * (baseRadius * 0.2)); 
        g.drawCircle(
          Math.cos(angle) * (baseRadius * 0.7),
          Math.sin(angle) * (baseRadius * 0.7),
          subRadius
        );
      }
      
      g.endFill();
    };

    // Areia
    drawMetaballs(graphics, radius, 0xE6C280);

    // Relva (30% menor)
    drawMetaballs(graphics, radius * 0.7, 0x4CAF50);

    container.addChild(graphics);

    // 3. Vegetação e Rochas Nativas
    const createDecor = (id: string | number) => {
      const path = `/assets/kenney_pirate-pack/PNG/Retina/Tiles/tile_${id}.png`;
      const tex = Assets.get(path);
      if (tex) {
        return new Sprite(tex);
      }
      return null;
    };

    const treeTiles = [70, 71, 72];
    const rockTiles = [49, 50, 51];
    
    // Distribuição de 2 a 4 props transparentes
    const numProps = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numProps; i++) {
      const isTree = Math.random() > 0.5;
      const decorId = isTree ? treeTiles[Math.floor(Math.random() * treeTiles.length)] : rockTiles[Math.floor(Math.random() * rockTiles.length)];
      const decor = createDecor(decorId);
      
      if (decor) {
        decor.anchor.set(0.5);
        decor.scale.set(0.4); 
        
        // Restrito perfeitamente à área da relva
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (radius * 0.5); 
        decor.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist);
        
        container.addChild(decor);
      }
    }

    return { container, radius, isRect: false, width: radius * 2, height: radius * 2 };
  }
}
