import React, { useEffect, useRef, useState } from 'react';
import { Game } from '../../game/engine/Game';
import { AssetLoader } from '../../game/Loader';

export const PixiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initGame = async () => {
      if (!canvasRef.current) return;
      
      try {
        await AssetLoader.loadAll();
        if (!isMounted) return;
        setLoading(false);

        const game = new Game();
        await game.init(canvasRef.current);
        gameRef.current = game;
      } catch (err) {
        console.error('Failed to initialize game:', err);
      }
    };

    initGame();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-2xl font-bold tracking-widest text-blue-300">LOADING ASSETS...</div>
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
