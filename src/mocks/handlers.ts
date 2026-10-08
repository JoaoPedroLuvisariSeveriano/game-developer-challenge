import { END_REASONS, PAGINATION, type ApiErrorBody, type ApiErrorCode, type MatchRecord, type MatchSubmission, type RankingEntry } from '@/api/contracts'
import { configKey, validateOptions } from '@/config/options'
import { env } from '@/config/env'
import { delay, http, HttpResponse } from 'msw'
import { mockControl } from './control'
import { findRecord, insertRecord, readRecords, runtime } from './db'
import { historyFixtures, rankingFixtures } from './fixtures'
import { seededUnit } from './prng'
import type { Endpoint, Latency } from './scenarios'

// ---------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: Record<string, string>,
): Response {
  const body: ApiErrorBody = { error: { code, message, ...(details && { details }) } }
  return HttpResponse.json(body, { status })
}

function latencyMs(latency: Latency, seed: number, seq: number): number {
  switch (latency.kind) {
    case 'fixed':
      return latency.ms
    case 'random':
      return Math.floor(latency.minMs + seededUnit(seed, seq) * (latency.maxMs - latency.minMs))
    case 'descending':
      return Math.max(latency.floorMs, latency.startMs - (seq - 1) * latency.stepMs)
  }
}

type FaultOutcome =
  | { action: 'pass' }
  | { action: 'respond'; response: Response }
  /** Submit only: commit the record, then never answer. */
  | { action: 'hang-after-commit' }

/** Applies the active scenario's latency and (if any) its failure for this endpoint. */
async function simulateNetwork(endpoint: Endpoint): Promise<FaultOutcome> {
  const control = mockControl.getState()
  const scenario = mockControl.getScenario()

  const seq = ++runtime.requestSeq
  const hits = ++runtime.faultHits[endpoint]

  const wait = control.latencyOverrideMs ?? latencyMs(scenario.latency, control.seed, seq)
  if (wait > 0) await delay(wait)

  const fault = scenario.faults[endpoint]
  if (!fault) return { action: 'pass' }
  if (fault.failFirst !== undefined && hits > fault.failFirst) return { action: 'pass' }

  switch (fault.type) {
    case 'http':
      return { action: 'respond', response: errorResponse(fault.status, fault.code, fault.message) }
    case 'network':
      return { action: 'respond', response: HttpResponse.error() }
    case 'timeout':
      await delay('infinite')
      return { action: 'pass' } // unreachable: the client aborts first
    case 'timeout-after-commit':
      return { action: 'hang-after-commit' }
  }
}

function parsePositiveInt(raw: string | null, fallback: number): number | null {
  if (raw === null) return fallback
  const value = Number(raw)
  return Number.isInteger(value) && value >= 1 ? value : null
}

type PaginationResult =
  | { ok: true; page: number; pageSize: number }
  | { ok: false; details: Record<string, string> }

function parsePagination(params: URLSearchParams): PaginationResult {
  const page = parsePositiveInt(params.get('page'), 1)
  const pageSize = parsePositiveInt(params.get('pageSize'), PAGINATION.defaultPageSize)
  const details: Record<string, string> = {}
  if (page === null) details.page = 'page must be an integer >= 1.'
  if (pageSize === null || pageSize > PAGINATION.maxPageSize) {
    details.pageSize = `pageSize must be an integer between 1 and ${PAGINATION.maxPageSize}.`
  }
  if (page === null || pageSize === null || Object.keys(details).length > 0) return { ok: false, details }
  return { ok: true, page, pageSize }
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: items.length,
    // At least one (empty) page so UIs can render "Page 1 of 1" for empty lists.
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  }
}

/** Ranking order: score desc, then earliest `playedAt`, then `matchId` (fully deterministic). */
function compareRanking(a: MatchRecord, b: MatchRecord): number {
  return b.score - a.score || a.playedAt.localeCompare(b.playedAt) || a.matchId.localeCompare(b.matchId)
}

/** History order: most recent first, `matchId` as the tie-breaker. */
function compareHistory(a: MatchRecord, b: MatchRecord): number {
  return b.playedAt.localeCompare(a.playedAt) || a.matchId.localeCompare(b.matchId)
}

function validateSubmission(
  body: unknown,
): { ok: true; value: MatchSubmission } | { ok: false; details: Record<string, string> } {
  const details: Record<string, string> = {}
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>

  const text = (key: 'matchId' | 'playerId', max: number) => {
    const v = b[key]
    if (typeof v !== 'string' || v.trim() === '' || v.length > max) details[key] = `${key} is required (max ${max} chars).`
  }
  text('matchId', 100)
  text('playerId', 100)

  if (typeof b.nickname !== 'string' || b.nickname.trim() === '' || b.nickname.length > 20) {
    details.nickname = 'nickname is required (max 20 chars).'
  }
  if (typeof b.playedAt !== 'string' || Number.isNaN(Date.parse(b.playedAt))) {
    details.playedAt = 'playedAt must be an ISO-8601 date.'
  }
  if (!Number.isInteger(b.score) || (b.score as number) < 0) details.score = 'score must be an integer >= 0.'
  if (!Number.isInteger(b.durationMs) || (b.durationMs as number) < 0) {
    details.durationMs = 'durationMs must be an integer >= 0.'
  }
  if (!END_REASONS.includes(b.endReason as never)) details.endReason = `endReason must be one of ${END_REASONS.join(', ')}.`

  const config = validateOptions((b.config ?? {}) as Record<string, unknown>)
  if (!config.ok) Object.assign(details, Object.fromEntries(Object.entries(config.errors).map(([k, v]) => [`config.${k}`, v])))

  if (Object.keys(details).length > 0 || !config.ok) return { ok: false, details }

  return {
    ok: true,
    value: {
      matchId: b.matchId as string,
      playerId: b.playerId as string,
      nickname: (b.nickname as string).trim(),
      playedAt: new Date(b.playedAt as string).toISOString(),
      score: b.score as number,
      durationMs: b.durationMs as number,
      endReason: b.endReason as MatchSubmission['endReason'],
      config: config.value,
    },
  }
}

function sameSubmission(a: MatchSubmission, b: MatchSubmission): boolean {
  return (
    a.matchId === b.matchId &&
    a.playerId === b.playerId &&
    a.nickname === b.nickname &&
    a.playedAt === b.playedAt &&
    a.score === b.score &&
    a.durationMs === b.durationMs &&
    a.endReason === b.endReason &&
    configKey(a.config) === configKey(b.config)
  )
}

const route = (path: string) => `${env.apiBaseUrl}${path}`

// ---------------------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------------------

export const handlers = [
  http.get(route('/ranking'), async ({ request }) => {
    const outcome = await simulateNetwork('ranking')
    if (outcome.action === 'respond') return outcome.response

    const params = new URL(request.url).searchParams
    const config = validateOptions({
      sessionTimeSeconds: params.get('sessionTimeSeconds'),
      enemySpawnIntervalSeconds: params.get('enemySpawnIntervalSeconds'),
    })
    const pagination = parsePagination(params)
    if (!config.ok || !pagination.ok) {
      const details = { ...(config.ok ? {} : config.errors), ...(pagination.ok ? {} : pagination.details) }
      return errorResponse(400, 'INVALID_QUERY', 'Invalid ranking query.', details)
    }
    const { page, pageSize } = pagination

    const key = configKey(config.value)
    const dataset = mockControl.getScenario().dataset
    const sorted = [
      ...rankingFixtures(config.value, dataset),
      ...readRecords().filter((r) => configKey(r.config) === key),
    ].sort(compareRanking)

    const ranked: RankingEntry[] = sorted.map((r, index) => ({
      rank: index + 1,
      matchId: r.matchId,
      playerId: r.playerId,
      nickname: r.nickname,
      score: r.score,
      playedAt: r.playedAt,
      durationMs: r.durationMs,
      endReason: r.endReason,
      config: r.config,
    }))

    return HttpResponse.json({ ...paginate(ranked, page, pageSize), config: config.value })
  }),

  http.get(route('/history'), async ({ request }) => {
    const outcome = await simulateNetwork('history')
    if (outcome.action === 'respond') return outcome.response

    const params = new URL(request.url).searchParams
    const playerId = params.get('playerId')
    const pagination = parsePagination(params)
    if (!playerId || !pagination.ok) {
      const details = {
        ...(playerId ? {} : { playerId: 'playerId is required.' }),
        ...(pagination.ok ? {} : pagination.details),
      }
      return errorResponse(400, 'INVALID_QUERY', 'Invalid history query.', details)
    }
    const { page, pageSize } = pagination

    const dataset = mockControl.getScenario().dataset
    const sorted = [
      ...historyFixtures(playerId, dataset),
      ...readRecords().filter((r) => r.playerId === playerId),
    ].sort(compareHistory)

    return HttpResponse.json(paginate(sorted, page, pageSize))
  }),

  http.post(route('/history'), async ({ request }) => {
    const outcome = await simulateNetwork('submit')
    if (outcome.action === 'respond') return outcome.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse(400, 'INVALID_BODY', 'Request body must be valid JSON.')
    }

    const validation = validateSubmission(body)
    if (!validation.ok) {
      return errorResponse(422, 'INVALID_BODY', 'Invalid match submission.', validation.details)
    }
    const submission = validation.value

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (idempotencyKey !== null && idempotencyKey !== submission.matchId) {
      return errorResponse(400, 'INVALID_BODY', 'Idempotency-Key must equal matchId.')
    }

    // Idempotency: same matchId + same payload -> return the stored record, create nothing.
    const existing = findRecord(submission.matchId)
    if (existing) {
      if (!sameSubmission(existing, submission)) {
        return errorResponse(409, 'MATCH_ID_CONFLICT', 'matchId already used with a different payload.')
      }
      return HttpResponse.json({ record: existing, duplicate: true }, { status: 200 })
    }

    const record: MatchRecord = { ...submission, recordedAt: new Date().toISOString() }
    insertRecord(record)

    if (outcome.action === 'hang-after-commit') {
      await delay('infinite')
    }

    return HttpResponse.json({ record, duplicate: false }, { status: 201 })
  }),
]
