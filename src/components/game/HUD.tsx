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
          <img src="/assets/png/retina/ui/hud/icon_heart.png" alt="Heart" className="w-12 h-12 z-20 -mr-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" />
          <div className="relative flex items-center justify-center w-[220px] h-[36px] bg-[#1a110f] rounded-lg border-2 border-[#5d4037] overflow-hidden shadow-inner">
            
            <div className="absolute z-10 left-0 h-full transition-all duration-300" style={{ width: `${Math.max(0, (hp / 10) * 100)}%` }}>
               <img src="/assets/png/retina/ui/hud/health_fill_green.png" alt="HP Fill" className="h-full w-full object-cover object-left" />
            </div>
            
            <img src="/assets/png/retina/ui/hud/health_frame.png" alt="HP Frame" className="absolute inset-0 w-full h-full z-20 pointer-events-none mix-blend-overlay" />
            
            <span className="relative z-30 font-display text-white text-xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)] pt-1" style={{ WebkitTextStroke: '1px black' }}>
              {hp} / 10
            </span>
          </div>
        </div>

        {/* Top Right: Status */}
        <div className="flex flex-col gap-3 mr-2">
          <div className="relative flex items-center bg-black/60 border-2 border-[#d4af37] rounded-lg px-4 py-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm">
            <img src="/assets/png/retina/ui/hud/icon_score.png" alt="Score" className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 drop-shadow-md" />
            <span className="font-display text-[#d4af37] text-3xl tracking-wider w-24 text-right drop-shadow-md pl-4">{score}</span>
          </div>
          <div className="relative flex items-center bg-black/60 border-2 border-[#d4af37] rounded-lg px-4 py-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm">
            <img src="/assets/png/retina/ui/hud/icon_time.png" alt="Time" className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 drop-shadow-md" />
            <span className="font-display text-foam text-3xl tracking-wider w-24 text-right drop-shadow-md pl-4">{minutes}:{seconds}</span>
          </div>
        </div>

      </div>
      <TouchControls />
    </>
  );
};
