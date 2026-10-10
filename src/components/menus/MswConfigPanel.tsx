import React from 'react';
import { useMockControl } from '../../mocks/useMockControl';
import { mockControl } from '../../mocks/control';
import { SCENARIOS, type ScenarioId } from '../../mocks/scenarios';

export const MswConfigPanel: React.FC = () => {
  const { scenarioId } = useMockControl();

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    mockControl.selectScenario(e.target.value as ScenarioId);
  };

  const handleReset = () => {
    mockControl.reset();
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900 p-6 rounded-lg border border-[#5d4037] w-full max-w-md shadow-inner mt-4">
      <label className="font-bold text-lagoon-400 uppercase tracking-wider text-xl text-center">
        MSW Scenarios (Debug)
      </label>
      
      <div className="flex flex-col gap-4 w-full">
        <select 
          value={scenarioId}
          onChange={handleScenarioChange}
          className="bg-black border-2 border-[#5d4037] text-white p-2 rounded w-full font-sans"
        >
          {SCENARIOS.map(s => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        
        <p className="text-gray-400 text-sm font-sans text-center h-12">
          {SCENARIOS.find(s => s.id === scenarioId)?.description}
        </p>
        
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-red-900 border-2 border-red-700 rounded text-white font-bold hover:bg-red-800 transition-colors uppercase text-sm"
        >
          Reset Mock Data
        </button>
      </div>
    </div>
  );
};
