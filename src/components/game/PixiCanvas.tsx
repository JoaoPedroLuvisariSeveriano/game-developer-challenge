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
    
    const engine = new Game();
    gameRef.current = engine;

    const bootGame = async () => {
      try {
        // Purga a cache sem quebrar a DOM
        try { Assets.reset(); } catch(e) {}

        await engine.startEngine(containerRef.current as HTMLDivElement);
        await AssetLoader.loadAll();

        // DEFESA CRÍTICA: Se o React destruiu esta instância enquanto os assets carregavam, ABORTE.
        if (engine.isDestroyed || !isMounted) return;

        engine.initGameLogic();
        setIsLoading(false);
      } catch (error) {
        console.error('Boot Error:', error);
      }
    };

    bootGame();

    return () => {
      isMounted = false;
      // O PixiJS remove o canvas sozinho via { removeView: true } no destroy
      engine.destroy(); 
      try { Assets.reset(); } catch(e) {}
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
