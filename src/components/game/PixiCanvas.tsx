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
        if (!containerRef.current) return;
        
        // 1. Liga o motor e cola na tela PRIMEIRO.
        containerRef.current.innerHTML = ''; // Expurgo de Telas Zumbis
        await game.startEngine(containerRef.current);
        
        // 2. Carrega as texturas reais
        try {
          await Assets.init();
          await AssetLoader.loadAll();
        } catch (e) {
          console.warn("Assets failed to load, falling back to Texture.WHITE", e);
        }
        
        // 3. Tira a tela de loading e inicia o jogo
        if (isMounted) {
          setIsLoading(false); // FORÇA A TELA A SUMIR
          game.initGameLogic(); // INICIA O JOGO
        }
      } catch (fatalError) {
        console.error("FATAL ENGINE CRASH:", fatalError);
      }
    };
    
    bootGame();
    
    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
      // Purga do Cache de Assets
      Assets.reset();
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
