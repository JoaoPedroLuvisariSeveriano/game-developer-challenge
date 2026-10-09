import React from 'react';
import { AtlasButton } from './AtlasButton';
import { useMatchStore } from '../../state/matchStore';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const WoodenModal: React.FC<Props> = ({ title, children }) => {
  const setStatus = useMatchStore((s) => s.setStatus);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4 md:p-8">
      <div className="relative w-full max-w-4xl max-h-full bg-[#3e2723] rounded shadow-[0_0_40px_rgba(0,0,0,1)] border-[6px] md:border-[12px] border-[#2d1b15] flex flex-col p-6 md:p-10 overflow-hidden">
        
        {/* Subtle wood-like overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

        {/* Dynamic Title */}
        <h2 className="relative z-10 text-4xl md:text-6xl font-display text-doubloon text-center mb-8 drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)] tracking-widest uppercase shrink-0">
          {title}
        </h2>

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-foam">
          {children}
        </div>

        {/* Base Action Slot */}
        <div className="relative z-10 flex justify-center mt-8 pt-6 border-t-2 border-[#5d4037] shrink-0">
          <AtlasButton onClick={() => setStatus('menu')} baseName="button_primary">
            Main Menu
          </AtlasButton>
        </div>
      </div>
    </div>
  );
};
