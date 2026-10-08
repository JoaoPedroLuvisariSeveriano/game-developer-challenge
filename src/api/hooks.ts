import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchHistory, fetchRanking, submitMatch } from './endpoints'
import { mutationKeys, queryKeys } from './queryKeys'
import type { ApiError } from './errors'
import type {
  HistoryPage,
  HistoryQuery,
  RankingPage,
  RankingQuery,
  SubmitMatchResponse,
  MatchSubmission,
} from './contracts'

/**
 * Pagination keeps the previous page on screen while the next loads (no flicker), and
 * `refetchOnMount: 'always'` refreshes a tab each time it is shown again. TanStack Query only
 * commits the result of the *latest* key/fetch, so a slow stale response can never overwrite
 * newer data; `signal` additionally aborts superseded requests on the wire.
 */
export function useRankingQuery(query: RankingQuery) {
  return useQuery<RankingPage, ApiError>({
    queryKey: queryKeys.ranking.list(query),
    queryFn: ({ signal }) => fetchRanking(query, signal),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  })
}

export function useHistoryQuery(query: HistoryQuery) {
  return useQuery<HistoryPage, ApiError>({
    queryKey: queryKeys.history.list(query),
    queryFn: ({ signal }) => fetchHistory(query, signal),
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  })
}

/**
 * Registers a finished match and refreshes both tabs afterwards.
 * Invalidation runs on `onSettled`, not only on success: after a timeout the server may have
 * committed the record anyway, and the lists should reflect that.
 */
export function useSubmitMatchMutation() {
  const queryClient = useQueryClient()
  return useMutation<SubmitMatchResponse, ApiError, MatchSubmission>({
    mutationKey: mutationKeys.submitMatch,
    mutationFn: (submission) => submitMatch(submission),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ranking.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all }),
      ])
    },
  })
}
