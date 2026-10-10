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
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4 md:p-8">
      <div 
        className="relative w-full max-w-4xl max-h-full flex flex-col p-6 md:p-10 overflow-hidden bg-slate-900/60 backdrop-blur-md border border-amber-500/30 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl"
      >

        {/* Dynamic Title */}
        <h2 className="relative z-10 text-4xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-black tracking-widest text-center mb-8 uppercase shrink-0">
          {title}
        </h2>

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 text-slate-200 overflow-y-auto">
          {children}
        </div>

        {/* Base Action Slot */}
        <div className="relative z-10 flex justify-center mt-8 pt-6 border-t border-slate-700/50 shrink-0">
          <AtlasButton onClick={() => setStatus('menu')}>
            Main Menu
          </AtlasButton>
        </div>
      </div>
    </div>
  );
};
