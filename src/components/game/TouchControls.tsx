import React from 'react';


export const TouchControls: React.FC = () => {
  const triggerKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code })), 100);
  };

  const RoundBtn = ({ code, icon, size = 'w-16 h-16' }: { code: string, icon: string, size?: string }) => (
    <button 
      onPointerDown={() => triggerKey(code)} 
      className={`relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center ${size} pointer-events-auto bg-black/80 border-2 border-[#5d4037] shadow-[0_4px_10px_rgba(0,0,0,0.8)] text-white text-2xl hover:bg-black/90`}
    >
      <span className="relative z-10 drop-shadow-md">{icon}</span>
    </button>
  );

  return (
    <div className="absolute bottom-8 w-full px-8 flex justify-between md:hidden z-40 pointer-events-none">
      <div className="grid grid-cols-3 gap-2 w-48 h-48">
        <div></div>
        <RoundBtn code="KeyW" icon="⬆" />
        <div></div>
        <RoundBtn code="KeyA" icon="↶" />
        <div></div>
        <RoundBtn code="KeyD" icon="↷" />
      </div>

      <div className="flex flex-col gap-4 justify-end items-end">
        <div className="flex gap-4">
          <RoundBtn code="KeyQ" icon="🔥◀" />
          <RoundBtn code="KeyE" icon="▶🔥" />
        </div>
        <button 
          onPointerDown={() => triggerKey('Space')} 
          className="relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center w-24 h-24 pointer-events-auto mt-2 bg-gradient-to-t from-red-800 to-red-600 border-4 border-[#d4af37] shadow-[0_4px_15px_rgba(0,0,0,1)] text-white text-4xl"
        >
          <span className="relative z-10 drop-shadow-md">💣</span>
        </button>
      </div>
    </div>
  );
};
