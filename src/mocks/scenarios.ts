import type { ApiErrorCode } from '@/api/contracts'

export type Dataset = 'standard' | 'empty' | 'many'

export type Latency =
  | { kind: 'fixed'; ms: number }
  /** Seeded, uniformly distributed in [minMs, maxMs). Later requests may overtake earlier ones. */
  | { kind: 'random'; minMs: number; maxMs: number }
  /**
   * Every request is faster than the previous one, so responses arrive in reverse order:
   * delay = max(floorMs, startMs - n * stepMs).
   */
  | { kind: 'descending'; startMs: number; stepMs: number; floorMs: number }

interface FaultBase {
  /** Only the first N requests to the endpoint fail; later ones succeed. Omit = fail forever. */
  failFirst?: number
}

export type ReadFault =
  | (FaultBase & { type: 'http'; status: number; code: ApiErrorCode; message: string })
  | (FaultBase & { type: 'network' })
  | (FaultBase & { type: 'timeout' })

export type WriteFault =
  | ReadFault
  /** The server persists the record, then never answers (client times out). Replays must dedupe. */
  | (FaultBase & { type: 'timeout-after-commit' })

export type Endpoint = 'ranking' | 'history' | 'submit'

export interface Scenario {
  id: string
  label: string
  description: string
  dataset: Dataset
  latency: Latency
  faults: { ranking?: ReadFault; history?: ReadFault; submit?: WriteFault }
}

const NORMAL_LATENCY: Latency = { kind: 'random', minMs: 150, maxMs: 450 }

const unavailable = (failFirst?: number): ReadFault => ({
  type: 'http',
  status: 503,
  code: 'SERVICE_UNAVAILABLE',
  message: 'Service temporarily unavailable.',
  ...(failFirst !== undefined && { failFirst }),
})

export const SCENARIOS = [
  {
    id: 'default',
    label: 'Normal',
    description: 'Healthy API with realistic latency (150-450 ms). Populated ranking, empty personal history.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: {},
  },
  {
    id: 'empty',
    label: 'Empty lists',
    description: 'Ranking and history start empty (confirmed matches still show up).',
    dataset: 'empty',
    latency: NORMAL_LATENCY,
    faults: {},
  },
  {
    id: 'many-pages',
    label: 'Many pages',
    description: 'Large ranking (120 entries) and a long personal history (47 matches).',
    dataset: 'many',
    latency: NORMAL_LATENCY,
    faults: {},
  },
  {
    id: 'slow',
    label: 'Slow network',
    description: 'Every request takes 3 s.',
    dataset: 'standard',
    latency: { kind: 'fixed', ms: 3_000 },
    faults: {},
  },
  {
    id: 'variable-latency',
    label: 'Variable latency',
    description: 'Seeded random latency between 100 ms and 3.5 s.',
    dataset: 'standard',
    latency: { kind: 'random', minMs: 100, maxMs: 3_500 },
    faults: {},
  },
  {
    id: 'out-of-order',
    label: 'Out-of-order responses',
    description: 'Each request answers faster than the previous one: stale responses arrive last.',
    dataset: 'many',
    latency: { kind: 'descending', startMs: 3_000, stepMs: 900, floorMs: 100 },
    faults: {},
  },
  {
    id: 'ranking-500',
    label: 'Ranking: HTTP 500',
    description: 'GET /ranking always fails with 500. History and submit keep working.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: {
      ranking: {
        type: 'http',
        status: 500,
        code: 'INTERNAL_ERROR',
        message: 'Unexpected server error.',
      },
    },
  },
  {
    id: 'history-403',
    label: 'History: HTTP 403 (not retryable)',
    description: 'GET /history always fails with 403. Client errors must not be retried.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: {
      history: { type: 'http', status: 403, code: 'FORBIDDEN', message: 'You cannot access this history.' },
    },
  },
  {
    id: 'ranking-timeout',
    label: 'Ranking: timeout',
    description: 'GET /ranking never answers; Axios aborts after its timeout.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { ranking: { type: 'timeout' } },
  },
  {
    id: 'history-timeout',
    label: 'History: timeout',
    description: 'GET /history never answers; Axios aborts after its timeout.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { history: { type: 'timeout' } },
  },
  {
    id: 'offline',
    label: 'Connection failure',
    description: 'Every request fails at the network level (no HTTP response).',
    dataset: 'standard',
    latency: { kind: 'fixed', ms: 200 },
    faults: {
      ranking: { type: 'network' },
      history: { type: 'network' },
      submit: { type: 'network' },
    },
  },
  {
    id: 'flaky-reads',
    label: 'Flaky reads (recovers)',
    description: 'The first 2 GET requests per endpoint return 503, then everything works.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { ranking: unavailable(2), history: unavailable(2) },
  },
  {
    id: 'submit-timeout-after-commit',
    label: 'Submit: timeout after commit',
    description:
      'The first POST /history is persisted but never answered. The retry must return the existing record (duplicate: true), never a second one.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { submit: { type: 'timeout-after-commit', failFirst: 1 } },
  },
  {
    id: 'submit-unavailable',
    label: 'Submit: unavailable',
    description: 'POST /history always returns 503. Switch back to Normal to simulate recovery.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { submit: unavailable() },
  },
  {
    id: 'submit-outage-then-recover',
    label: 'Submit: outage, then recovery',
    description:
      'The first 5 POSTs fail with 503 (more than the silent retries), then the API recovers. A manual retry succeeds.',
    dataset: 'standard',
    latency: NORMAL_LATENCY,
    faults: { submit: unavailable(5) },
  },
] as const satisfies readonly Scenario[]

export type ScenarioId = (typeof SCENARIOS)[number]['id']

export const DEFAULT_SCENARIO_ID: ScenarioId = 'default'

export function isScenarioId(value: unknown): value is ScenarioId {
  return SCENARIOS.some((s) => s.id === value)
}

export function getScenario(id: ScenarioId): Scenario {
  // `find` cannot miss: `ScenarioId` is derived from the catalog itself.
  return SCENARIOS.find((s) => s.id === id) as Scenario
}
