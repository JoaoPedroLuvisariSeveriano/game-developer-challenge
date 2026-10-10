import { Container, Sprite, Assets, Texture, Graphics } from 'pixi.js';

export class IslandBuilder {
  static build(): any {
    const container = new Container();
    const radius = 85; // Exact radius used for physics collision

    const graphics = new Graphics();
    
    const drawOrganicCircle = (g: Graphics, baseRadius: number, color: number) => {
      g.beginFill(color);
      const points = [];
      const steps = 14; 
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        // Variação de -7.5 a +7.5 no raio
        const r = baseRadius + (Math.random() * 15 - 7.5);
        points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      
      if (points.length > 0) {
        g.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          g.lineTo(points[i].x, points[i].y);
        }
        g.closePath();
      }
      g.endFill();
    };

    // Areia
    drawOrganicCircle(graphics, radius, 0xE6C280);

    // Relva
    drawOrganicCircle(graphics, radius * 0.75, 0x4CAF50);

    container.addChild(graphics);

    // Substituímos os tiles quadrados de terreno por navios destruídos (100% transparentes)
    if (Math.random() > 0.5) {
      const path = `/assets/kenney_pirate-pack/PNG/Retina/Ships/ship (24).png`;
      const tex = Assets.get(path);
      if (tex) {
        const wreck = new Sprite(tex);
        wreck.anchor.set(0.5);
        wreck.scale.set(0.6); // Escala adequada para a ilha
        wreck.rotation = Math.random() * Math.PI * 2;
        
        // Colocado perto da costa (entre a relva e a areia)
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (radius * 0.6); 
        wreck.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist);
        
        container.addChild(wreck);
      }
    }

    return { container, radius, isRect: false, width: 192, height: 192 };
  }
}
