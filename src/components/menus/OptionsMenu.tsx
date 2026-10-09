import React, { useState } from 'react';
import { useMatchStore } from '../../state/matchStore';
import { useOptionsStore } from '../../state/optionsStore';

export const OptionsMenu: React.FC = () => {
  const setStatus = useMatchStore((s) => s.setStatus);
  const { options, saveOptions } = useOptionsStore();
  const [form, setForm] = useState(options);
  const [error, setError] = useState('');

  const handleSave = () => {
    const res = saveOptions(form);
    if (!res.ok) {
      setError(Object.values(res.errors)[0] || 'Invalid options');
    } else {
      setError('');
      setStatus('menu');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
      <h1 className="text-4xl font-bold mb-8 text-blue-300">Options</h1>
      {error && <p className="text-red-400 mb-4 font-semibold">{error}</p>}
      <div className="flex flex-col gap-6 w-80 bg-gray-800 p-6 rounded-lg shadow-lg">
        <label className="flex flex-col font-semibold">
          Session Time (s):
          <input type="number" value={form.sessionTimeSeconds} onChange={e => setForm({...form, sessionTimeSeconds: Number(e.target.value)})} className="text-white bg-gray-700 p-2 mt-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500" />
        </label>
        <label className="flex flex-col font-semibold">
          Enemy Spawn Interval (s):
          <input type="number" step="0.5" value={form.enemySpawnIntervalSeconds} onChange={e => setForm({...form, enemySpawnIntervalSeconds: Number(e.target.value)})} className="text-white bg-gray-700 p-2 mt-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500" />
        </label>
        <div className="flex gap-4 mt-4">
          <button onClick={handleSave} className="flex-1 py-3 bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded font-bold transition">Save</button>
          <button onClick={() => setStatus('menu')} className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded font-bold transition">Cancel</button>
        </div>
      </div>
    </div>
  );
};
