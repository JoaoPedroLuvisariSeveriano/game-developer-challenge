import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createId } from '@/lib/id'

export const PLAYER_STORAGE_KEY = 'pirate-battle:player'

export const NICKNAME_MAX_LENGTH = 20

interface PlayerState {
  /** Anonymous, stable identity used to scope the match history. */
  playerId: string
  nickname: string
  setNickname: (nickname: string) => boolean
}

const newPlayer = () => {
  const playerId = createId()
  return { playerId, nickname: `Captain-${playerId.slice(0, 4)}` }
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      ...newPlayer(),
      setNickname: (nickname) => {
        const trimmed = nickname.trim()
        if (trimmed.length === 0 || trimmed.length > NICKNAME_MAX_LENGTH) return false
        set({ nickname: trimmed })
        return true
      },
    }),
    {
      name: PLAYER_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ playerId: state.playerId, nickname: state.nickname }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<Pick<PlayerState, 'playerId' | 'nickname'>> | undefined
        const valid =
          typeof stored?.playerId === 'string' &&
          stored.playerId.length > 0 &&
          typeof stored.nickname === 'string' &&
          stored.nickname.length > 0
        return valid ? { ...current, playerId: stored.playerId!, nickname: stored.nickname! } : current
      },
    },
  ),
)
