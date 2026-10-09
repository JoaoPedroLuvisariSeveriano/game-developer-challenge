import React, { useState } from 'react';
import { useOptionsStore } from '../../state/optionsStore';
import { WoodenModal } from '../ui/WoodenModal';
import { AtlasButton } from '../ui/AtlasButton';

export const OptionsMenu: React.FC = () => {
  const { options, saveOptions } = useOptionsStore();
  const [form, setForm] = useState(options);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const res = saveOptions(form);
    if (!res.ok) {
      setError(Object.values(res.errors)[0] || 'Invalid options');
      setSaved(false);
    } else {
      setError('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const alterTime = (delta: number) => {
    setForm(f => ({ ...f, sessionTimeSeconds: Math.max(60, Math.min(180, f.sessionTimeSeconds + delta)) }));
  };

  const alterSpawn = (delta: number) => {
    setForm(f => ({ ...f, enemySpawnIntervalSeconds: Math.max(0.5, Math.min(10, f.enemySpawnIntervalSeconds + delta)) }));
  };

  return (
    <WoodenModal title="OPTIONS">
      <div className="flex flex-col items-center justify-center gap-8 w-full h-full font-sans text-xl">
        {error && <p className="text-red-400 font-bold bg-black/50 px-4 py-2 rounded border border-red-900">{error}</p>}
        {saved && <p className="text-green-400 font-bold bg-black/50 px-4 py-2 rounded border border-green-900">Options Saved Successfully!</p>}
        
        <div className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-lg border border-[#5d4037] w-full max-w-md shadow-inner">
          <label className="font-bold text-lagoon-400 uppercase tracking-wider text-2xl">Session Time</label>
          <div className="flex items-center gap-6 mt-2">
            <button onClick={() => alterTime(-10)} className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full text-4xl font-display text-white hover:bg-gray-700 active:translate-y-1 transition-transform flex items-center justify-center pb-2 shadow-lg">-</button>
            <span className="text-5xl font-display text-doubloon w-32 text-center drop-shadow-md">{form.sessionTimeSeconds}s</span>
            <button onClick={() => alterTime(10)} className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full text-4xl font-display text-white hover:bg-gray-700 active:translate-y-1 transition-transform flex items-center justify-center pb-2 shadow-lg">+</button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-lg border border-[#5d4037] w-full max-w-md shadow-inner">
          <label className="font-bold text-lagoon-400 uppercase tracking-wider text-2xl">Enemy Spawn</label>
          <div className="flex items-center gap-6 mt-2">
            <button onClick={() => alterSpawn(-0.5)} className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full text-4xl font-display text-white hover:bg-gray-700 active:translate-y-1 transition-transform flex items-center justify-center pb-2 shadow-lg">-</button>
            <span className="text-5xl font-display text-doubloon w-32 text-center drop-shadow-md">{form.enemySpawnIntervalSeconds}s</span>
            <button onClick={() => alterSpawn(0.5)} className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full text-4xl font-display text-white hover:bg-gray-700 active:translate-y-1 transition-transform flex items-center justify-center pb-2 shadow-lg">+</button>
          </div>
        </div>

        <div className="mt-4">
          <AtlasButton onClick={handleSave} baseName="button_primary">
            Save Options
          </AtlasButton>
        </div>
      </div>
    </WoodenModal>
  );
};
