import React, { useEffect, useState } from 'react';
import { useMatchStore } from '../../state/matchStore';
import { usePlayerStore } from '../../state/playerStore';
import { useSubmitMatchMutation } from '../../api/hooks';
import { snapshotOptions } from '../../state/optionsStore';
import { WoodenModal } from '../ui/WoodenModal';
import { AtlasButton } from '../ui/AtlasButton';

export const GameOver: React.FC = () => {
  const { matchId, score, timeRemaining, endReason, setStatus } = useMatchStore();
  const { playerId, nickname } = usePlayerStore();
  const submitMatch = useSubmitMatchMutation();
  const config = snapshotOptions();
  
  const [submitted, setSubmitted] = useState(false);
  const [playedAt] = useState(() => new Date().toISOString());
  const [step, setStep] = useState<1 | 2>(1);

  const durationMs = Math.round((config.sessionTimeSeconds - timeRemaining) * 1000);

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
      playedAt,
      score,
      durationMs,
      endReason: endReason || 'player_destroyed',
      config
    }, {
      onSuccess: () => setSubmitted(true)
    });
  };

  const title = endReason === 'time_up' ? "TIME'S UP" : "SHIP SUNK";

  if (step === 1) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm p-4">
        <div className="relative bg-[#3e2723] rounded-sm shadow-[0_0_40px_rgba(0,0,0,1)] border-[6px] md:border-[8px] border-[#2d1b15] flex flex-col items-center p-8 md:p-12 text-center max-w-md w-full">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
          
          <h2 className="relative z-10 text-4xl md:text-5xl font-display text-red-500 mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest uppercase">
            YOUR SHIP SANK!
          </h2>
          <p className="relative z-10 text-3xl font-display text-doubloon mb-10 tracking-widest drop-shadow-md">
            SCORE: {score}
          </p>

          <div className="relative z-10 w-full flex justify-center mt-4 pt-6 border-t-2 border-[#5d4037]">
            <AtlasButton onClick={() => setStep(2)} baseName="button_primary">
              SEE RESULTS
            </AtlasButton>
          </div>
        </div>
      </div>
    );
  }

  // Step 2
  return (
    <WoodenModal title={title}>
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mx-auto">
        
        <div className="bg-black/40 border border-[#5d4037] rounded-xl p-8 w-full flex flex-col items-center shadow-inner mb-6">
          <h3 className="text-2xl font-bold text-lagoon-400 uppercase tracking-widest mb-2 drop-shadow-md">Points Earned</h3>
          <p className="text-7xl font-display text-doubloon drop-shadow-[0_4px_4px_rgba(0,0,0,1)] mb-6">{score}</p>
          
          <div className="w-full h-px bg-[#5d4037] mb-6 shadow-sm"></div>
          
          <div className="flex justify-between w-full text-xl font-sans font-bold text-foam mb-3">
            <span className="text-gray-400">Survival Time</span>
            <span>{Math.round(durationMs / 1000)}s</span>
          </div>
          <div className="flex justify-between w-full text-xl font-sans font-bold text-foam">
            <span className="text-gray-400">Enemies Defeated</span>
            <span>{Math.floor(score / 100)}</span>
          </div>
        </div>

        <div className="h-16 flex flex-col items-center justify-center mb-6">
          {submitMatch.isPending && <p className="text-doubloon font-display text-2xl animate-pulse tracking-widest drop-shadow-md">RECORDING TO LOG...</p>}
          {submitMatch.isError && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-400 font-bold font-sans">Failed to record (Network Error).</p>
              <button onClick={handleSubmit} className="text-doubloon underline uppercase font-bold hover:text-white font-sans transition-colors">Retry Submit</button>
            </div>
          )}
          {submitMatch.isSuccess && <p className="text-lagoon-400 font-display text-2xl drop-shadow-md tracking-wider">Battle recorded in the Captain's Log.</p>}
        </div>

        <div className="flex justify-center w-full mt-2">
          <AtlasButton onClick={() => setStatus('playing')} baseName="button_primary" className="scale-110">
            PLAY AGAIN
          </AtlasButton>
        </div>
      </div>
    </WoodenModal>
  );
};
