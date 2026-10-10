import React, { useSyncExternalStore } from 'react';
import { useMatchStore } from '../../state/matchStore';
import { mockControl } from '../../mocks/control';
import { SCENARIOS } from '../../mocks/scenarios';
import { AtlasButton } from '../ui/AtlasButton';

export const MainMenu: React.FC = () => {
  const setStatus = useMatchStore((s) => s.setStatus);
  const scenarioId = useSyncExternalStore(mockControl.subscribe, () => mockControl.getState().scenarioId);

  return (
    <div className="absolute inset-0 flex items-center justify-between px-12 md:px-24 z-50 overflow-hidden">
      
      {/* Left Column: Title and Buttons */}
      <div className="flex flex-col items-start gap-8 z-10 w-full md:w-auto">
        <h1 className="text-6xl md:text-8xl font-black tracking-widest text-doubloon font-display drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          PIRATE BATTLE
        </h1>
        
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-wrap gap-6">
            <AtlasButton onClick={() => {
              useMatchStore.getState().resetMatch();
              setStatus('playing');
            }} baseName="button_primary">
              Play
            </AtlasButton>
            <AtlasButton onClick={() => setStatus('options')} baseName="button_primary">
              Options
            </AtlasButton>
          </div>
          <div className="flex flex-wrap gap-6">
            <AtlasButton onClick={() => setStatus('ranking')} baseName="button_secondary" className="scale-90 origin-left">
              Ranking
            </AtlasButton>
            <AtlasButton onClick={() => setStatus('history')} baseName="button_secondary" className="scale-90 origin-left">
              Match History
            </AtlasButton>
          </div>
        </div>
      </div>

      {/* Right Column: Controls Panel */}
      <div 
        className="hidden md:block z-10 p-8 bg-[#1c2838] font-sans shadow-2xl max-w-sm w-full"
        style={{
          borderImage: "url('/assets/kenney_pirate-pack/PNG/Retina/Ship parts/wood (1).png') 20",
          borderStyle: "solid",
          borderWidth: "40px"
        }}
      >
        <h2 className="text-3xl font-display text-amber-400 text-center mb-6 tracking-wider drop-shadow-md">Controls</h2>
        <table className="w-full text-lg border-separate border-spacing-y-3">
          <tbody>
            <tr><td className="font-bold text-amber-50">Move Forward</td><td className="text-right"><kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">W</kbd> or <kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">▲</kbd></td></tr>
            <tr><td className="font-bold text-amber-50">Rotate Left</td><td className="text-right"><kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">A</kbd> or <kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">◀</kbd></td></tr>
            <tr><td className="font-bold text-amber-50">Rotate Right</td><td className="text-right"><kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">D</kbd> or <kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">▶</kbd></td></tr>
            <tr><td className="font-bold text-amber-400 pt-4 block">Frontal Attack</td><td className="text-right pt-4"><kbd className="bg-red-900 text-white font-bold px-4 py-1 rounded border-b-4 border-red-950 shadow-inner">SPACE</kbd></td></tr>
            <tr><td className="font-bold text-amber-50">Left Attack</td><td className="text-right"><kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">Q</kbd></td></tr>
            <tr><td className="font-bold text-amber-50">Right Attack</td><td className="text-right"><kbd className="bg-slate-900 text-amber-50 px-2 py-1 rounded border-b-4 border-slate-950 shadow-inner">E</kbd></td></tr>
          </tbody>
        </table>
        <div className="mt-8 text-center text-sm text-gray-400 font-bold border-t border-gray-700/50 pt-4">
          Touch controls automatically appear on mobile devices.
        </div>
      </div>

      {/* Bottom Left: MSW Network Selector */}
      <div className="absolute bottom-4 left-4 z-50 flex items-center opacity-40 hover:opacity-100 transition-opacity">
        <label className="text-xs text-gray-500 mr-2 uppercase tracking-widest font-bold">Network:</label>
        <select 
          className="bg-transparent text-gray-400 text-xs focus:outline-none cursor-pointer border-b border-gray-700 pb-1" 
          value={scenarioId}
          onChange={(e) => mockControl.selectScenario(e.target.value as any)}
        >
          {SCENARIOS.map(s => (
            <option key={s.id} value={s.id} className="bg-gray-900">{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
