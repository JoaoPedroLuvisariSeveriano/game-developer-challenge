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
    const game = new Game();
    gameRef.current = game;
    
    const bootGame = async () => {
      try {
        if (!containerRef.current || !gameRef.current) return;
        
        // 1. PURGA DA CACHE VETERANA: Limpa texturas do contexto WebGL morto
        try { Assets.reset(); } catch (e) { console.warn('Cache clear skip', e); }
        
        // 2. BOOT DO NOVO MOTOR: Cria novo WebGL Context e anexa ao DOM
        await gameRef.current.startEngine(containerRef.current);
        
        // 3. REIDRATAÇÃO: Força o download/decode das texturas para a GPU atual
        await AssetLoader.loadAll();
        
        // 4. LIBERTAÇÃO DA UI E LÓGICA
        if (isMounted) {
          setIsLoading(false);
          gameRef.current.initGameLogic();
        }
      } catch (e) {
        console.error('Boot Crash:', e);
      }
    };
    
    bootGame();
    
    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
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
