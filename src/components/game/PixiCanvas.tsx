import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../../game/engine/Game';
import { AssetLoader } from '../../game/Loader';
import { Assets } from 'pixi.js';
import { useMatchStore } from '../../state/matchStore';

export const PixiCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const status = useMatchStore(s => s.status);

  useEffect(() => {
    let isMounted = true;
    
    const engine = new Game();
    gameRef.current = engine;

    const bootGame = async () => {
      try {
        // 1. LOCK DE RECONCILIAÇÃO: Espera 100ms para o React terminar de destruir a árvore velha
        await new Promise(r => setTimeout(r, 100));

        // 2. Purga segura ANTES de carregar (garante que a cache velha já não está em uso)
        try { Assets.reset(); } catch(e) {}

        if (!containerRef.current || engine.isDestroyed || !isMounted) return;

        await engine.startEngine(containerRef.current as HTMLDivElement);
        await AssetLoader.loadAll();

        if (isMounted && !engine.isDestroyed) {
          engine.initIdle();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Boot Crash:', error);
      }
    };

    bootGame();

    return () => {
      isMounted = false;
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && status === 'playing' && gameRef.current && !gameRef.current.isCombatStarted) {
      gameRef.current.startCombat();
    }
  }, [status, isLoading]);

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
