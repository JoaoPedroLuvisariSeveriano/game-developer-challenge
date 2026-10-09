import { create } from 'zustand';
import type { EndReason } from '../../api/contracts';
import { createId } from '../../lib/id';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'options' | 'ranking' | 'history';

interface MatchState {
  matchId: string;
  status: GameStatus;
  hp: number;
  score: number;
  timeRemaining: number;
  endReason: EndReason | null;
  setStatus: (status: GameStatus) => void;
  setMatchData: (hp: number, score: number, timeRemaining: number) => void;
  setGameOver: (reason: EndReason) => void;
  resetMatch: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matchId: '',
  status: 'menu',
  hp: 10,
  score: 0,
  timeRemaining: 0,
  endReason: null,
  setStatus: (status) => set({ status }),
  setMatchData: (hp, score, timeRemaining) => {
    // Only trigger update if integer values change to avoid 60fps renders
    set((state) => {
      if (
        state.hp !== hp ||
        state.score !== score ||
        Math.ceil(state.timeRemaining) !== Math.ceil(timeRemaining)
      ) {
        return { hp, score, timeRemaining };
      }
      return state;
    });
  },
  setGameOver: (reason) => set({ status: 'gameover', endReason: reason }),
  resetMatch: () => set({ matchId: createId(), hp: 10, score: 0, timeRemaining: 0, endReason: null })
}));
