import React from 'react';

export const TouchControls: React.FC = () => {
  const triggerKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code })), 100);
  };

  return (
    <div className="absolute bottom-8 w-full px-8 flex justify-between md:hidden z-40 opacity-70 pointer-events-auto">
      <div className="grid grid-cols-3 gap-2 w-32 h-32">
        <div></div>
        <button onPointerDown={() => triggerKey('KeyW')} className="bg-gray-700 rounded-full focus:outline-none select-none">⬆</button>
        <div></div>
        <button onPointerDown={() => triggerKey('KeyA')} className="bg-gray-700 rounded-full focus:outline-none select-none">⬅</button>
        <button onPointerDown={() => triggerKey('KeyS')} className="bg-gray-700 rounded-full focus:outline-none select-none">⬇</button>
        <button onPointerDown={() => triggerKey('KeyD')} className="bg-gray-700 rounded-full focus:outline-none select-none">➡</button>
      </div>

      <div className="flex flex-col gap-2 justify-end items-end">
        <div className="flex gap-2">
          <button onPointerDown={() => triggerKey('KeyQ')} className="w-12 h-12 bg-red-800 rounded-full border-2 border-red-500 font-bold focus:outline-none select-none">L</button>
          <button onPointerDown={() => triggerKey('KeyE')} className="w-12 h-12 bg-red-800 rounded-full border-2 border-red-500 font-bold focus:outline-none select-none">R</button>
        </div>
        <button onPointerDown={() => triggerKey('Space')} className="w-20 h-20 bg-red-600 rounded-full border-4 border-red-400 font-bold text-xl focus:outline-none select-none">FIRE</button>
      </div>
    </div>
  );
};
