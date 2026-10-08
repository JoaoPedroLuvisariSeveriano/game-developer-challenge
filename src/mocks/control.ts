import type { MatchRecord } from '@/api/contracts'
import { clearRecords, readRecords, resetRuntime } from './db'
import {
  DEFAULT_SCENARIO_ID,
  SCENARIOS,
  getScenario,
  isScenarioId,
  type Scenario,
  type ScenarioId,
} from './scenarios'

/**
 * Runtime control plane of the mock API: pick a scenario, pin the seed, override latency,
 * or reset everything. Persisted in localStorage so the choice survives refreshes and the
 * deployed demo.
 *
 * Ways to drive it:
 *  - UI:         `useMockControl()` (a selector panel is built in a later phase)
 *  - URL:        `?mockScenario=offline&mockSeed=42&mockLatency=0`
 *  - Console/E2E `window.__PIRATE_MOCK__.selectScenario('offline')`
 */

export interface MockControlState {
  scenarioId: ScenarioId
  /** Seeds every random decision of the mock API (latency jitter). */
  seed: number
  /** When not null, replaces the scenario latency for every request (`0` = instant). */
  latencyOverrideMs: number | null
}

export const MOCK_CONTROL_STORAGE_KEY = 'pirate-battle:mock-control'

const DEFAULT_STATE: Readonly<MockControlState> = Object.freeze({
  scenarioId: DEFAULT_SCENARIO_ID,
  seed: 1,
  latencyOverrideMs: null,
})

function sanitize(input: unknown): MockControlState {
  const raw = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  return {
    scenarioId: isScenarioId(raw.scenarioId) ? raw.scenarioId : DEFAULT_STATE.scenarioId,
    seed: Number.isInteger(raw.seed) ? (raw.seed as number) : DEFAULT_STATE.seed,
    latencyOverrideMs:
      typeof raw.latencyOverrideMs === 'number' && raw.latencyOverrideMs >= 0 ? raw.latencyOverrideMs : null,
  }
}

function load(): MockControlState {
  let state = { ...DEFAULT_STATE }
  try {
    const stored = localStorage.getItem(MOCK_CONTROL_STORAGE_KEY)
    if (stored) state = sanitize(JSON.parse(stored))
  } catch {
    /* corrupted storage -> defaults */
  }

  // URL parameters win over storage (handy for sharing a reproduction link or for E2E).
  const params = new URLSearchParams(globalThis.location?.search ?? '')
  const scenario = params.get('mockScenario')
  const seed = params.get('mockSeed')
  const latency = params.get('mockLatency')
  if (isScenarioId(scenario)) state.scenarioId = scenario
  if (seed !== null && Number.isInteger(Number(seed))) state.seed = Number(seed)
  if (latency !== null && Number(latency) >= 0 && latency.trim() !== '') state.latencyOverrideMs = Number(latency)
  return state
}

let state: MockControlState = load()
const listeners = new Set<() => void>()

function commit(next: MockControlState): void {
  state = next
  try {
    localStorage.setItem(MOCK_CONTROL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable (private mode); control still works in memory */
  }
  listeners.forEach((listener) => listener())
}

// Keep several tabs consistent.
globalThis.addEventListener?.('storage', (event) => {
  if (event.key !== MOCK_CONTROL_STORAGE_KEY) return
  state = load()
  listeners.forEach((listener) => listener())
})

export const mockControl = {
  /** Stable reference between changes (safe for `useSyncExternalStore`). */
  getState: (): MockControlState => state,
  getScenario: (): Scenario => getScenario(state.scenarioId),
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** Switches scenario and restarts its failure counters. Confirmed records are kept. */
  selectScenario(id: ScenarioId): void {
    resetRuntime()
    commit({ ...state, scenarioId: id })
  },
  setSeed(seed: number): void {
    commit({ ...state, seed: Math.trunc(seed) })
  },
  setLatencyOverride(ms: number | null): void {
    commit({ ...state, latencyOverrideMs: ms === null ? null : Math.max(0, ms) })
  },
  /** Back to the initial state: default scenario/seed/latency, no confirmed records. */
  reset(): void {
    resetRuntime()
    clearRecords()
    commit({ ...DEFAULT_STATE })
  },
  /** Confirmed (server-side) records, for assertions in tests. */
  getRecords: (): MatchRecord[] => readRecords(),
}

export type MockControl = typeof mockControl

declare global {
  interface Window {
    __PIRATE_MOCK__?: MockControl & { scenarios: typeof SCENARIOS }
  }
}

if (typeof window !== 'undefined') {
  window.__PIRATE_MOCK__ = Object.assign(mockControl, { scenarios: SCENARIOS })
}
