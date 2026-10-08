import { http } from './httpClient'
import type {
  HistoryPage,
  HistoryQuery,
  MatchSubmission,
  RankingPage,
  RankingQuery,
  SubmitMatchResponse,
} from './contracts'

/** Pure request functions (no React, no cache). Hooks in `hooks.ts` wrap these. */

export async function fetchRanking(query: RankingQuery, signal?: AbortSignal): Promise<RankingPage> {
  const { data } = await http.get<RankingPage>('/ranking', {
    params: {
      sessionTimeSeconds: query.config.sessionTimeSeconds,
      enemySpawnIntervalSeconds: query.config.enemySpawnIntervalSeconds,
      page: query.page,
      pageSize: query.pageSize,
    },
    signal,
  })
  return data
}

export async function fetchHistory(query: HistoryQuery, signal?: AbortSignal): Promise<HistoryPage> {
  const { data } = await http.get<HistoryPage>('/history', {
    params: { playerId: query.playerId, page: query.page, pageSize: query.pageSize },
    signal,
  })
  return data
}

/**
 * Registers a finished match. Idempotent: the server dedupes on `matchId`, so replaying the
 * exact same submission (retry after a timeout, double click, resend after refresh) returns the
 * existing record instead of creating a second one. The key is also sent as `Idempotency-Key`.
 */
export async function submitMatch(
  submission: MatchSubmission,
  signal?: AbortSignal,
): Promise<SubmitMatchResponse> {
  const { data } = await http.post<SubmitMatchResponse>('/history', submission, {
    headers: { 'Idempotency-Key': submission.matchId },
    signal,
  })
  return data
}
