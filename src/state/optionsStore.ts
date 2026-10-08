import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_OPTIONS, validateOptions, type GameOptions, type OptionsValidation } from '@/config/options'

export const OPTIONS_STORAGE_KEY = 'pirate-battle:options'

interface OptionsState {
  /** Last *saved* (validated) options. Form drafts live in component state, not here. */
  options: GameOptions
  /** Validates and persists. Returns the validation result so forms can show errors. */
  saveOptions: (draft: Partial<Record<keyof GameOptions, unknown>>) => OptionsValidation
  resetOptions: () => void
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set) => ({
      options: { ...DEFAULT_OPTIONS },
      saveOptions: (draft) => {
        const result = validateOptions(draft)
        if (result.ok) set({ options: result.value })
        return result
      },
      resetOptions: () => set({ options: { ...DEFAULT_OPTIONS } }),
    }),
    {
      name: OPTIONS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ options: state.options }),
      // Never trust storage: a corrupted or hand-edited value falls back to defaults.
      merge: (persisted, current) => {
        const stored = (persisted as { options?: Partial<Record<keyof GameOptions, unknown>> } | undefined)?.options
        const result = validateOptions(stored ?? {})
        return { ...current, options: result.ok ? result.value : { ...DEFAULT_OPTIONS } }
      },
    },
  ),
)

/**
 * Immutable copy of the options in effect *right now*. A match must call this once when it
 * starts; later edits on the Options screen only affect future matches.
 */
export function snapshotOptions(): GameOptions {
  return { ...useOptionsStore.getState().options }
}
