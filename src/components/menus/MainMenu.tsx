import React from 'react';
import { useMatchStore } from '../../state/matchStore';

export const MainMenu: React.FC = () => {
  const setStatus = useMatchStore((s) => s.setStatus);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
      <h1 className="text-6xl font-black mb-12 tracking-wider text-blue-300">PIRATE BATTLE</h1>
      <div className="flex flex-col gap-4 w-64">
        <button onClick={() => setStatus('playing')} className="py-4 text-xl font-bold bg-blue-600 hover:bg-blue-500 rounded transition">Play</button>
        <button onClick={() => setStatus('options')} className="py-4 text-xl font-bold bg-gray-700 hover:bg-gray-600 rounded transition">Options</button>
      </div>
    </div>
  );
};
