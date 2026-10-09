import React from 'react';
import { useMatchStore } from '../../state/matchStore';

export const PauseMenu: React.FC = () => {
  const setStatus = useMatchStore(s => s.setStatus);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-50 backdrop-blur-sm">
      <h1 className="text-5xl font-bold mb-8 text-blue-300">Paused</h1>
      <div className="flex gap-4">
        <button 
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))} 
          className="px-8 py-4 bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded font-bold text-xl transition"
        >
          Resume
        </button>
        <button 
          onClick={() => setStatus('menu')} 
          className="px-8 py-4 bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded font-bold text-xl transition"
        >
          Quit to Menu
        </button>
      </div>
    </div>
  );
};
