import { Container, Sprite, Assets, Graphics } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    
    // 1. Variedade de Tamanhos
    const radius = 60 + Math.random() * 40; 

    const graphics = new Graphics();
    
    // 2. Polígonos Suaves e Sincronizados (Areia e Relva)
    const steps = 40;
    const wavePhase1 = Math.random() * Math.PI * 2;
    const wavePhase2 = Math.random() * Math.PI * 2;
    
    const sandPoints: {x: number, y: number}[] = [];
    const grassPoints: {x: number, y: number}[] = [];

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      // Imperfeições partilhadas
      const wave = Math.sin(angle * 3 + wavePhase1) * 12 + Math.cos(angle * 5 + wavePhase2) * 6;
      
      const sandR = radius + wave;
      const grassR = (radius * 0.65) + (wave * 0.65);
      
      sandPoints.push({ x: Math.cos(angle) * sandR, y: Math.sin(angle) * sandR });
      grassPoints.push({ x: Math.cos(angle) * grassR, y: Math.sin(angle) * grassR });
    }

    const drawPolygon = (g: Graphics, points: {x: number, y: number}[], color: number) => {
      if (points.length === 0) return;
      g.beginFill(color);
      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.endFill();
    };

    // Desenhar camadas sincronizadas
    drawPolygon(graphics, sandPoints, 0xE6C280);
    drawPolygon(graphics, grassPoints, 0x4CAF50);

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
    const spawnedProps: {x: number, y: number}[] = [];
    
    for (let i = 0; i < numProps; i++) {
      const isTree = Math.random() > 0.5;
      const decorId = isTree ? treeTiles[Math.floor(Math.random() * treeTiles.length)] : rockTiles[Math.floor(Math.random() * rockTiles.length)];
      const decor = createDecor(decorId);
      
      if (decor) {
        decor.anchor.set(0.5);
        decor.scale.set(0.4); 
        
        let px = 0;
        let py = 0;
        let valid = false;
        let attempts = 0;
        
        while (!valid && attempts < 15) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (radius * 0.5); 
          px = Math.cos(angle) * dist;
          py = Math.sin(angle) * dist;
          
          valid = true;
          for (const sp of spawnedProps) {
            const dx = px - sp.x;
            const dy = py - sp.y;
            if (Math.sqrt(dx * dx + dy * dy) <= 35) {
              valid = false;
              break;
            }
          }
          attempts++;
        }
        
        if (valid) {
          decor.position.set(px, py);
          container.addChild(decor);
          spawnedProps.push({ x: px, y: py });
        }
      }
    }

    return { container, radius, isRect: false, width: radius * 2, height: radius * 2 };
  }
}
