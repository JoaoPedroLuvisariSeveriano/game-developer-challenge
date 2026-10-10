import { Container, Sprite, Assets, Graphics } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    
    // 1. Variedade de Tamanhos
    const radius = 60 + Math.random() * 40; 

    const graphics = new Graphics();
    
    // 2. Polígono Suave e Ondulado
    const drawWavyPolygon = (g: Graphics, baseRadius: number, color: number) => {
      g.beginFill(color);
      const steps = 40;
      const wavePhase1 = Math.random() * Math.PI * 2;
      const wavePhase2 = Math.random() * Math.PI * 2;
      
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        // Ondulação contínua com sin e cos
        const r = baseRadius + Math.sin(angle * 3 + wavePhase1) * 12 + Math.cos(angle * 5 + wavePhase2) * 6;
        
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        
        if (i === 0) {
          g.moveTo(px, py);
        } else {
          g.lineTo(px, py);
        }
      }
      g.endFill();
    };

    // Areia
    drawWavyPolygon(graphics, radius, 0xE6C280);

    // Relva (30% menor)
    drawWavyPolygon(graphics, radius * 0.7, 0x4CAF50);

    // Formato Forçosamente Oval
    if (Math.random() > 0.5) {
      graphics.scale.set(1.4, 0.8);
    } else {
      graphics.scale.set(0.9, 1.3);
    }

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
