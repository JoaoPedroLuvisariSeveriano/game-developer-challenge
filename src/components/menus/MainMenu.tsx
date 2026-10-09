import React, { useSyncExternalStore } from 'react';
import { useMatchStore } from '../../state/matchStore';
import { mockControl } from '../../mocks/control';
import { SCENARIOS } from '../../mocks/scenarios';

export const MainMenu: React.FC = () => {
  const setStatus = useMatchStore((s) => s.setStatus);
  const scenarioId = useSyncExternalStore(mockControl.subscribe, () => mockControl.getState().scenarioId);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
      <h1 className="text-6xl font-black mb-12 tracking-wider text-blue-300">PIRATE BATTLE</h1>
      <div className="flex flex-col gap-4 w-64">
        <button onClick={() => setStatus('playing')} className="py-4 text-xl font-bold bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded transition">Play</button>
        <button onClick={() => setStatus('options')} className="py-4 text-xl font-bold bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded transition">Options</button>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 p-2 rounded text-xs text-gray-400 border border-gray-700 z-50">
        <label className="mr-2">MSW Network Scenario:</label>
        <select 
          className="bg-gray-800 text-white p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          value={scenarioId}
          onChange={(e) => mockControl.selectScenario(e.target.value as any)}
        >
          {SCENARIOS.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
