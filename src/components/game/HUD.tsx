import React from 'react';
import { useMatchStore } from '../../state/matchStore';
import { TouchControls } from './TouchControls';
import { AtlasSprite } from '../ui/AtlasSprite';

export const HUD: React.FC = () => {
  const { hp, score, timeRemaining } = useMatchStore();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60).toString().padStart(2, '0');

  return (
    <>
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between pointer-events-none drop-shadow-lg z-30">
        
        {/* Top Left: Health Bar */}
        <div className="flex items-center mt-2 ml-2">
          <AtlasSprite name="icon_heart" className="w-12 h-12 z-20 -mr-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" />
          <div className="relative flex items-center justify-center min-w-[200px] h-8">
            <AtlasSprite name="bar_background" className="absolute inset-0 w-full h-full z-0 opacity-80" />
            
            <div className="absolute z-10 left-0 h-full overflow-hidden transition-all duration-300" style={{ width: `${Math.max(0, (hp / 10) * 100)}%` }}>
               <AtlasSprite name="bar_fill_green" className="h-full w-[200px]" />
            </div>
            
            <AtlasSprite name="bar_frame" className="absolute inset-0 w-full h-full z-20" />
            
            <span className="absolute z-30 font-display text-white text-xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)] pt-1">
              {hp} / 10
            </span>
          </div>
        </div>

        {/* Top Right: Status */}
        <div className="flex flex-col gap-3 mr-2">
          <div className="flex items-center bg-black/60 border-2 border-[#5d4037] rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm">
            <AtlasSprite name="icon_score" className="w-8 h-8 mr-3 drop-shadow-md" />
            <span className="font-display text-doubloon text-3xl tracking-wider w-20 text-right drop-shadow-md">{score}</span>
          </div>
          <div className="flex items-center bg-black/60 border-2 border-[#5d4037] rounded-lg px-4 py-2 shadow-lg backdrop-blur-sm">
            <AtlasSprite name="icon_time" className="w-8 h-8 mr-3 drop-shadow-md" />
            <span className="font-display text-foam text-3xl tracking-wider w-20 text-right drop-shadow-md">{minutes}:{seconds}</span>
          </div>
        </div>

      </div>
      <TouchControls />
    </>
  );
};
