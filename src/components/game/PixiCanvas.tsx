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
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold z-10">
          Loading Assets...
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
