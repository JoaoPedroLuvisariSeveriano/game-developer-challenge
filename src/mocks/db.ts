import type { MatchRecord } from '@/api/contracts'
import type { Endpoint } from './scenarios'

/**
 * Persistent "server" state of the mock API.
 *
 * Confirmed records live in localStorage so they survive refreshes (and are shared between
 * tabs). Fixtures are NOT stored: they are derived deterministically on every request.
 * Volatile counters (request sequence, fault hits) live in memory and reset on reload.
 */

export const MOCK_DB_STORAGE_KEY = 'pirate-battle:mock-db'

interface PersistedDb {
  version: 1
  records: MatchRecord[]
}

function isRecordLike(value: unknown): value is MatchRecord {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.matchId === 'string' &&
    typeof r.playerId === 'string' &&
    typeof r.score === 'number' &&
    typeof r.playedAt === 'string' &&
    typeof r.config === 'object' &&
    r.config !== null
  )
}

/** Reads from storage on every call so multiple tabs observe the same state. */
export function readRecords(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(MOCK_DB_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    const records = (parsed as Partial<PersistedDb> | null)?.records
    return Array.isArray(records) ? records.filter(isRecordLike) : []
  } catch {
    return []
  }
}

function writeRecords(records: MatchRecord[]): void {
  const payload: PersistedDb = { version: 1, records }
  localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(payload))
}

export function findRecord(matchId: string): MatchRecord | undefined {
  return readRecords().find((r) => r.matchId === matchId)
}

export function insertRecord(record: MatchRecord): void {
  writeRecords([...readRecords(), record])
}

export function clearRecords(): void {
  localStorage.removeItem(MOCK_DB_STORAGE_KEY)
}

// ---------------------------------------------------------------------------------------
// Volatile runtime counters
// ---------------------------------------------------------------------------------------

interface Runtime {
  /** Monotonic request counter; drives deterministic latency and out-of-order scenarios. */
  requestSeq: number
  /** Requests seen per endpoint; drives `failFirst`. */
  faultHits: Record<Endpoint, number>
}

const freshRuntime = (): Runtime => ({ requestSeq: 0, faultHits: { ranking: 0, history: 0, submit: 0 } })

export const runtime: Runtime = freshRuntime()

export function resetRuntime(): void {
  Object.assign(runtime, freshRuntime())
}
