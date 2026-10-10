import React from 'react';
import { useMatchStore } from '../../state/matchStore';
import { AtlasButton } from '../ui/AtlasButton';

export const PauseMenu: React.FC = () => {
  const setStatus = useMatchStore(s => s.setStatus);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50 p-4">
      <div 
        className="relative flex flex-col items-center p-8 md:p-12 text-center max-w-md w-full bg-[#1c2838]"
        style={{
          borderImage: "url('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/wood (1).png') 20",
          borderStyle: "solid",
          borderWidth: "40px"
        }}
      >
        <h1 className="relative z-10 text-5xl font-display text-doubloon mb-8 tracking-widest drop-shadow-md">PAUSED</h1>
        <div className="relative z-10 flex flex-col gap-4 w-full items-center">
          <AtlasButton onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))} baseName="button_primary">
            Resume
          </AtlasButton>
          <AtlasButton onClick={() => setStatus('menu')} baseName="button_secondary">
            Quit to Menu
          </AtlasButton>
        </div>
      </div>
    </div>
  );
};
