import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../../game/engine/Game';
import { AssetLoader } from '../../game/Loader';

export const PixiCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initGame = async () => {
      try {
        await AssetLoader.loadAll();
        if (!isMounted) return;
        setLoading(false);

        if (!containerRef.current) return;

        const game = new Game();
        // Do not pass a canvas, let Pixi create its own
        await game.app.init({
          resizeTo: window,
          backgroundColor: 0x1099bb,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        
        containerRef.current.appendChild(game.app.canvas);
        
        await game.initGameLogic(); // Separate logic init since app is already inited
        
        gameRef.current = game;
      } catch (err) {
        console.error('[CRITICAL] Failed to initialize PixiJS or load assets:', err);
      }
    };

    initGame();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        // As requested: safely destroy everything, including the canvas DOM element
        gameRef.current.destroy();
        gameRef.current = null;
        
        // Unload textures from PixiJS cache so they can be freshly loaded on next mount
        AssetLoader.unloadAll().catch(console.error);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-2xl font-bold tracking-widest text-blue-300">LOADING ASSETS...</div>
        </div>
      )}
    </div>
  );
};
