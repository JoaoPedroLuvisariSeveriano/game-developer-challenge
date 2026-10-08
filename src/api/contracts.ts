import type { GameOptions } from '@/config/options'

/**
 * Wire contracts shared by the API client, the MSW handlers and the UI.
 * Single source of truth: if a shape changes, both ends fail to compile.
 */

export type EndReason = 'time_up' | 'player_destroyed'

/** Configuration snapshot a match was played with (taken when the match started). */
export type MatchConfig = GameOptions

/** Body of `POST /history`. `matchId` is generated client-side and is the idempotency key. */
export interface MatchSubmission {
  matchId: string
  playerId: string
  nickname: string
  /** ISO-8601 timestamp of when the match ended. */
  playedAt: string
  score: number
  /** Effective active play time in milliseconds (paused time excluded). */
  durationMs: number
  endReason: EndReason
  config: MatchConfig
}

/** A match as stored by the server. */
export interface MatchRecord extends MatchSubmission {
  /** ISO-8601 timestamp of when the server confirmed the record. */
  recordedAt: string
}

export interface RankingEntry {
  /** 1-based position within the (config-filtered) ranking, global across pages. */
  rank: number
  matchId: string
  playerId: string
  nickname: string
  score: number
  playedAt: string
  durationMs: number
  endReason: EndReason
  config: MatchConfig
}

export interface Page<T> {
  items: T[]
  /** 1-based. */
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PageParams {
  page?: number
  pageSize?: number
}

export interface RankingQuery extends PageParams {
  /** Rankings only compare matches played with the same configuration. */
  config: MatchConfig
}

export interface HistoryQuery extends PageParams {
  playerId: string
}

export type RankingPage = Page<RankingEntry> & { config: MatchConfig }
export type HistoryPage = Page<MatchRecord>

/** Response of `POST /history`. */
export interface SubmitMatchResponse {
  record: MatchRecord
  /**
   * `true` when the server already had this `matchId` and returned the existing record
   * instead of creating a new one (HTTP 200 instead of 201).
   */
  duplicate: boolean
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    details?: Record<string, string>
  }
}

export type ApiErrorCode =
  | 'INVALID_QUERY'
  | 'INVALID_BODY'
  | 'MATCH_ID_CONFLICT'
  | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'

export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 50,
} as const

export const END_REASONS: readonly EndReason[] = ['time_up', 'player_destroyed']
