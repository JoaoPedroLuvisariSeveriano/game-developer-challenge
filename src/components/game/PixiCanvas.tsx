import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../../game/engine/Game';
import { AssetLoader } from '../../game/Loader';
import { Assets } from 'pixi.js';

export const PixiCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // 1. Cria a ÚNICA instância da engine para este ciclo de vida
    const engine = new Game();
    gameRef.current = engine; // Atualiza a ref para o HUD consumir

    const bootGame = async () => {
      try {
        if (containerRef.current) containerRef.current.innerHTML = '';
        try { Assets.reset(); } catch(e) {}

        await engine.startEngine(containerRef.current as HTMLDivElement);
        await AssetLoader.loadAll();

        if (isMounted) {
          engine.initGameLogic();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Fatal Boot Error:', error);
      }
    };

    bootGame();

    return () => {
      isMounted = false;
      // 2. Destrói EXATAMENTE a engine que foi criada aqui
      engine.destroy(); 
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-[#87CEEB] z-0">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-2xl font-bold tracking-widest text-blue-300 mb-6">LOADING ASSETS...</div>
        </div>
      )}
    </div>
  );
};
