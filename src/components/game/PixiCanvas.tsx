import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../../game/engine/Game';
import { AssetLoader } from '../../game/Loader';

export const PixiCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hasInitialized = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let isMounted = true;
    
    const initGame = async () => {
      try {
        try {
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Asset loading timed out, forcing start')), 3000)
          );
          await Promise.race([AssetLoader.loadAll(), timeout]);
        } catch (e) {
          console.warn('[CRITICAL] Some assets failed to load or timed out:', e);
        }
        
        if (!isMounted) return;

        if (!containerRef.current) return;

        const game = new Game();
        // Do not pass a canvas, let Pixi create its own
        await game.app.init({
          resizeTo: window,
          backgroundColor: 0x87CEEB, // Sky blue as requested
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        
        game.app.canvas.className = "block w-full h-full absolute inset-0 z-10";
        
        if (containerRef.current) {
          containerRef.current.appendChild(game.app.canvas);
        } else {
          console.error('[CRITICAL] Container ref is null after app.init');
        }
        
        await game.initGameLogic(); // Separate logic init since app is already inited
        
        if (!isMounted) {
          game.destroy();
          return;
        }
        
        gameRef.current = game;
      } catch (err) {
        console.error('[CRITICAL] Failed to initialize PixiJS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initGame();

    return () => {
      isMounted = false;
      hasInitialized.current = false;
      if (gameRef.current) {
        // As requested: safely destroy everything, including the canvas DOM element
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-[#87CEEB] z-0">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-2xl font-bold tracking-widest text-blue-300">LOADING ASSETS...</div>
        </div>
      )}
    </div>
  );
};
