import React, { useEffect, useState } from 'react';
import { useMatchStore } from '../../state/matchStore';
import { usePlayerStore } from '../../state/playerStore';
import { useSubmitMatchMutation } from '../../api/hooks';
import { snapshotOptions } from '../../state/optionsStore';

export const GameOver: React.FC = () => {
  const { matchId, score, timeRemaining, endReason, setStatus } = useMatchStore();
  const { playerId, nickname } = usePlayerStore();
  const submitMatch = useSubmitMatchMutation();
  const config = snapshotOptions();
  
  const [submitted, setSubmitted] = useState(false);

  const durationMs = (config.sessionTimeSeconds - timeRemaining) * 1000;

  useEffect(() => {
    if (!submitted) {
      handleSubmit();
    }
  }, []);

  const handleSubmit = () => {
    submitMatch.mutate({
      matchId,
      playerId,
      nickname,
      playedAt: new Date().toISOString(),
      score,
      durationMs,
      endReason: endReason || 'player_destroyed',
      config
    }, {
      onSuccess: () => setSubmitted(true)
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white z-50 backdrop-blur-sm">
      <h1 className="text-6xl font-black text-red-500 mb-6 drop-shadow-lg">Game Over</h1>
      <p className="text-2xl mb-2 font-semibold">Reason: <span className="text-gray-300">{endReason === 'time_up' ? 'Time Up!' : 'Ship Destroyed'}</span></p>
      <p className="text-3xl mb-8 font-bold text-green-400">Score: {score}</p>

      <div className="mb-10 h-16 flex flex-col items-center justify-center">
        {submitMatch.isPending && <p className="text-yellow-400 animate-pulse font-semibold">Submitting match record...</p>}
        {submitMatch.isError && (
          <div className="flex flex-col items-center">
            <p className="text-red-400 mb-2 font-semibold">Failed to submit record (Network Error).</p>
            <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold transition">Retry Submit</button>
          </div>
        )}
        {submitMatch.isSuccess && <p className="text-green-400 font-bold">Record saved successfully!</p>}
      </div>

      <div className="flex gap-4">
        <button onClick={() => setStatus('playing')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded font-bold text-xl transition">Play Again</button>
        <button onClick={() => setStatus('menu')} className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded font-bold text-xl transition">Main Menu</button>
      </div>
    </div>
  );
};
