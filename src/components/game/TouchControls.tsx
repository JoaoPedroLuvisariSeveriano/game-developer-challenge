import React from 'react';
import { AtlasSprite } from '../ui/AtlasSprite';

export const TouchControls: React.FC = () => {
  const triggerKey = (code: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code })), 100);
  };

  const RoundBtn = ({ code, iconSrc, size = 'w-16 h-16' }: { code: string, iconSrc: string, size?: string }) => (
    <button 
      onPointerDown={() => triggerKey(code)} 
      className={`relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center ${size} pointer-events-auto bg-black/50 border-2 border-doubloon/80 shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
    >
      <img src={iconSrc} alt="Control Icon" className="relative z-10 w-3/4 h-3/4 object-contain drop-shadow-md" />
    </button>
  );

  return (
    <div className="absolute bottom-8 w-full px-8 flex justify-between md:hidden z-40 pointer-events-none">
      <div className="grid grid-cols-3 gap-2 w-48 h-48">
        <div></div>
        <RoundBtn code="KeyW" iconSrc="/assets/png/retina/ui/controls/icon_forward.png" />
        <div></div>
        <RoundBtn code="KeyA" iconSrc="/assets/png/retina/ui/controls/icon_turn_left.png" />
        <div></div>
        <RoundBtn code="KeyD" iconSrc="/assets/png/retina/ui/controls/icon_turn_right.png" />
      </div>

      <div className="flex flex-col gap-4 justify-end items-end">
        <div className="flex gap-4">
          <RoundBtn code="KeyQ" iconSrc="/assets/png/retina/ui/controls/icon_fire_left.png" />
          <RoundBtn code="KeyE" iconSrc="/assets/png/retina/ui/controls/icon_fire_right.png" />
        </div>
        <button 
          onPointerDown={() => triggerKey('Space')} 
          className="relative rounded-full focus:outline-none select-none active:scale-95 transition-transform flex items-center justify-center w-24 h-24 pointer-events-auto mt-2 bg-ember border-4 border-doubloon shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
        >
          <img src="/assets/png/retina/ui/controls/icon_fire_front.png" alt="Fire Front" className="relative z-10 w-2/3 h-2/3 object-contain drop-shadow-md" />
        </button>
      </div>
    </div>
  );
};
