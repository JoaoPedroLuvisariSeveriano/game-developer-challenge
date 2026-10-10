import React from 'react';
import { useMatchStore } from '../../state/matchStore';
import { TouchControls } from './TouchControls';


export const HUD: React.FC = () => {
  const { hp, score, timeRemaining } = useMatchStore();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = Math.floor(timeRemaining % 60).toString().padStart(2, '0');

  return (
    <>
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between pointer-events-none drop-shadow-lg z-30">
        
        {/* Top Left: Health Bar */}
        <div className="flex items-center mt-2 ml-2">
          {/* Heart Icon (Emoji or SVG) */}
          <div className="w-12 h-12 z-20 -mr-4 flex items-center justify-center bg-[#8b0000] rounded-full border-2 border-[#ffcccb] shadow-[0_0_10px_rgba(255,0,0,0.8)] text-white text-2xl font-bold">
            ❤
          </div>
          <div className="relative flex items-center justify-start w-[220px] h-[32px] bg-slate-900/80 backdrop-blur-sm rounded-r-full border-2 border-slate-700 overflow-hidden shadow-[inset_0_4px_4px_rgba(0,0,0,0.8)]">
            
            {/* Health Fill */}
            <div 
              className="absolute z-10 left-0 h-full transition-all duration-300 bg-gradient-to-r from-red-600 to-green-500 rounded-r-full"
              style={{ width: `${Math.max(0, (hp / 10) * 100)}%`, boxShadow: '0 0 10px rgba(0,255,0,0.5)' }}
            />
            
            {/* Health Text */}
            <span className="relative z-30 font-display text-white text-lg tracking-widest pl-8 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
              {hp} / 10
            </span>
          </div>
        </div>

        {/* Top Right: Status */}
        <div className="flex flex-col gap-3 mr-2">
          <div 
            className="relative flex items-center bg-slate-900/60 backdrop-blur-md border border-amber-500/30 rounded-l-full px-6 py-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(212,175,55,0.8)] text-xl font-bold text-black">
              ★
            </div>
            <span className="font-display text-[#d4af37] text-2xl tracking-wider w-24 text-right drop-shadow-md pl-4">{score}</span>
          </div>
          
          <div 
            className="relative flex items-center bg-slate-900/60 backdrop-blur-md border border-amber-500/30 rounded-l-full px-6 py-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00a8ff] rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_10px_rgba(0,168,255,0.8)] text-xl font-bold text-black">
              ⏱
            </div>
            <span className="font-display text-foam text-2xl tracking-wider w-24 text-right drop-shadow-md pl-4">{minutes}:{seconds}</span>
          </div>
        </div>

      </div>
      <TouchControls />
    </>
  );
};
