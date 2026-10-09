import React from 'react';
import { useMatchStore } from '../../state/matchStore';
import { TouchControls } from './TouchControls';

export const HUD: React.FC = () => {
  const { hp, score, timeRemaining } = useMatchStore();

  return (
    <>
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between text-white font-bold text-2xl pointer-events-none drop-shadow-md">
        <div>HP: <span className="text-red-400">{hp}</span></div>
        <div>Time: <span className="text-yellow-400">{Math.ceil(timeRemaining)}s</span></div>
        <div>Score: <span className="text-green-400">{score}</span></div>
      </div>
      <TouchControls />
    </>
  );
};
