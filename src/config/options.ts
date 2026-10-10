/**
 * Player-facing game options (the two parameters exposed by the Options screen).
 *
 * Limits are documented here and enforced everywhere (UI form, store hydration, mock API):
 *  - `sessionTimeSeconds`: integer, 60..180 (challenge requirement).
 *  - `enemySpawnIntervalSeconds`: 0.5..10 (decimals allowed, rounded to 2 places). Below 0.5 s
 *    the arena saturates and the pools become the bottleneck; above 10 s a 60 s match would
 *    spawn too few enemies for both types to appear.
 */
export interface GameOptions {
  sessionTimeSeconds: number
  enemySpawnIntervalSeconds: number
  soundEnabled: boolean
}

export type OptionKey = keyof GameOptions

export const OPTION_LIMITS = {
  sessionTimeSeconds: { min: 60, max: 180, step: 5, label: 'Game session time', unit: 's' },
  enemySpawnIntervalSeconds: { min: 0.5, max: 10, step: 0.5, label: 'Enemy spawn time', unit: 's' },
  soundEnabled: { label: 'Sound Effects' },
} as const satisfies Record<OptionKey, unknown>

export const DEFAULT_OPTIONS: Readonly<GameOptions> = Object.freeze({
  sessionTimeSeconds: 90,
  enemySpawnIntervalSeconds: 2.5,
  soundEnabled: true,
})

export type OptionErrors = Partial<Record<OptionKey, string>>

export type OptionsValidation =
  | { ok: true; value: GameOptions }
  | { ok: false; errors: OptionErrors }

function toNumber(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.trim() !== '') return Number(raw)
  return Number.NaN
}

/** Validates (and normalises) untrusted input: form values, persisted JSON, API payloads. */
export function validateOptions(input: Partial<Record<OptionKey, unknown>>): OptionsValidation {
  const errors: OptionErrors = {}

  const session = toNumber(input.sessionTimeSeconds)
  const sessionLimits = OPTION_LIMITS.sessionTimeSeconds
  if (!Number.isFinite(session)) {
    errors.sessionTimeSeconds = `${sessionLimits.label} must be a number.`
  } else if (!Number.isInteger(session)) {
    errors.sessionTimeSeconds = `${sessionLimits.label} must be a whole number of seconds.`
  } else if (session < sessionLimits.min || session > sessionLimits.max) {
    errors.sessionTimeSeconds = `${sessionLimits.label} must be between ${sessionLimits.min} and ${sessionLimits.max} seconds.`
  }

  const spawn = toNumber(input.enemySpawnIntervalSeconds)
  const spawnLimits = OPTION_LIMITS.enemySpawnIntervalSeconds
  if (!Number.isFinite(spawn)) {
    errors.enemySpawnIntervalSeconds = `${spawnLimits.label} must be a number.`
  } else if (spawn < spawnLimits.min || spawn > spawnLimits.max) {
    errors.enemySpawnIntervalSeconds = `${spawnLimits.label} must be between ${spawnLimits.min} and ${spawnLimits.max} seconds.`
  }

  const soundEnabled = input.soundEnabled !== undefined ? Boolean(input.soundEnabled) : true

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      sessionTimeSeconds: session,
      enemySpawnIntervalSeconds: Math.round(spawn * 100) / 100,
      soundEnabled,
    },
  }
}

/** Stable identity of a configuration; rankings only compare matches sharing the same key. */
export function configKey(config: GameOptions): string {
  return `${config.sessionTimeSeconds}s/${config.enemySpawnIntervalSeconds}s`
}
