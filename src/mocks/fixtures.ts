import type { MatchConfig, MatchRecord } from '@/api/contracts'
import { configKey } from '@/config/options'
import { hashString, mulberry32 } from './prng'
import type { Dataset } from './scenarios'

/**
 * Deterministic fixtures: the same (config, dataset) always yields the exact same data, with no
 * dependency on `Date.now()` or `Math.random()`, so visual regression baselines stay stable.
 */

const NICKNAMES = [
  'Blackbeard', 'RedRackham', 'AnneBonny', 'MaryRead', 'CaptainKidd', 'HenryMorgan', 'BartRoberts',
  'CalicoJack', 'JeanLafitte', 'GraceOMalley', 'EdwardLow', 'StedeBonnet', 'SamBellamy', 'ZhengYiSao',
  'FrancoisLOlonnais', 'CharlesVane', 'BenHornigold', 'MadamCheng', 'OliverLevasseur', 'WilliamDampier',
  'IsabelaCorsair', 'SaltyPete', 'DaveyJones', 'CutlassKate', 'OneEyedJoe', 'MarinaTide', 'CaptainRum',
  'StormyNell', 'IronAnchor', 'PearlDiver',
] as const

const FIXTURE_EPOCH = Date.parse('2026-09-01T12:00:00.000Z')
const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

const RANKING_SIZE: Record<Dataset, number> = { standard: 34, many: 120, empty: 0 }
const HISTORY_SIZE: Record<Dataset, number> = { standard: 0, many: 47, empty: 0 }

const HISTORY_CONFIGS: readonly MatchConfig[] = [
  { sessionTimeSeconds: 90, enemySpawnIntervalSeconds: 2.5 },
  { sessionTimeSeconds: 60, enemySpawnIntervalSeconds: 2 },
  { sessionTimeSeconds: 120, enemySpawnIntervalSeconds: 3 },
]

function buildOutcome(rand: () => number, config: MatchConfig) {
  const maxScore = Math.max(4, Math.floor((config.sessionTimeSeconds / config.enemySpawnIntervalSeconds) * 0.7))
  const score = Math.floor(Math.pow(rand(), 1.4) * (maxScore + 1))
  const survived = rand() > 0.4
  const sessionMs = config.sessionTimeSeconds * 1000
  return {
    score,
    endReason: survived ? ('time_up' as const) : ('player_destroyed' as const),
    durationMs: survived ? sessionMs : Math.round(sessionMs * (0.25 + 0.7 * rand())),
  }
}

/** Other players' matches for a given configuration. */
export function rankingFixtures(config: MatchConfig, dataset: Dataset): MatchRecord[] {
  const key = configKey(config)
  const rand = mulberry32(hashString(`ranking:${key}`))

  return Array.from({ length: RANKING_SIZE[dataset] }, (_, i) => {
    const base = NICKNAMES[i % NICKNAMES.length] as string
    const lap = Math.floor(i / NICKNAMES.length)
    const nickname = lap === 0 ? base : `${base}${lap + 1}`
    const playedAt = new Date(FIXTURE_EPOCH - Math.floor(rand() * 20 * DAY_MS)).toISOString()
    return {
      matchId: `fixture-ranking-${key}-${i}`,
      playerId: `fixture-player-${nickname.toLowerCase()}`,
      nickname,
      playedAt,
      recordedAt: playedAt,
      config: { ...config },
      ...buildOutcome(rand, config),
    }
  })
}

/** Pre-existing matches of the *current* player (only for the `many` dataset). */
export function historyFixtures(playerId: string, dataset: Dataset): MatchRecord[] {
  const rand = mulberry32(hashString(`history:${playerId}`))

  return Array.from({ length: HISTORY_SIZE[dataset] }, (_, i) => {
    const config = HISTORY_CONFIGS[Math.floor(rand() * HISTORY_CONFIGS.length)] as MatchConfig
    const playedAt = new Date(FIXTURE_EPOCH - i * DAY_MS - Math.floor(rand() * 8 * HOUR_MS)).toISOString()
    return {
      matchId: `fixture-history-${hashString(playerId).toString(16)}-${i}`,
      playerId,
      nickname: 'You',
      playedAt,
      recordedAt: playedAt,
      config: { ...config },
      ...buildOutcome(rand, config),
    }
  })
}
