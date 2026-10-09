import React from 'react';
import { AtlasSprite } from '../ui/AtlasSprite';

export const TouchControls: React.FC = () => {
  const triggerKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code })), 100);
  };

  const RoundBtn = ({ code, icon, size = 'w-16 h-16' }: { code: string, icon: string, size?: string }) => (
    <button 
      onPointerDown={() => triggerKey(code)} 
      className={`relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center ${size} pointer-events-auto`}
    >
      <AtlasSprite name="button_round_pressed" className="absolute inset-0 w-full h-full opacity-80" />
      <span className="relative z-10 font-display text-white text-2xl font-bold drop-shadow-md">{icon}</span>
    </button>
  );

  return (
    <div className="absolute bottom-8 w-full px-8 flex justify-between md:hidden z-40 pointer-events-none">
      <div className="grid grid-cols-3 gap-2 w-48 h-48">
        <div></div>
        <RoundBtn code="KeyW" icon="▲" />
        <div></div>
        <RoundBtn code="KeyA" icon="◀" />
        <RoundBtn code="KeyS" icon="▼" />
        <RoundBtn code="KeyD" icon="▶" />
      </div>

      <div className="flex flex-col gap-4 justify-end items-end">
        <div className="flex gap-4">
          <RoundBtn code="KeyQ" icon="L" />
          <RoundBtn code="KeyE" icon="R" />
        </div>
        <button 
          onPointerDown={() => triggerKey('Space')} 
          className="relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center w-24 h-24 pointer-events-auto mt-2"
        >
          <AtlasSprite name="button_round_pressed" className="absolute inset-0 w-full h-full" />
          <span className="relative z-10 font-display text-ember text-3xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">FIRE</span>
        </button>
      </div>
    </div>
  );
};
