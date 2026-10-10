import { useEffect } from 'react'
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

const OFFLINE_KEY = 'pirate_offline_matches'

export function getOfflineMatches(): MatchSubmission[] {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOfflineMatch(sub: MatchSubmission) {
  const matches = getOfflineMatches()
  if (!matches.some(m => m.matchId === sub.matchId)) {
    matches.push(sub)
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(matches))
  }
}

function removeOfflineMatch(matchId: string) {
  const matches = getOfflineMatches().filter(m => m.matchId !== matchId)
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(matches))
}

/**
 * Sync offline matches automatically. Call this in App.tsx.
 */
export function useOfflineSync() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const sync = async () => {
      const offline = getOfflineMatches()
      if (offline.length === 0) return
      
      let success = false
      for (const match of offline) {
        try {
          await submitMatch(match)
          removeOfflineMatch(match.matchId)
          success = true
        } catch (e) {
          console.warn('[Offline Sync] Failed to sync match', match.matchId, e)
        }
      }
      
      if (success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ranking.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all })
      }
    }
    
    sync()
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [queryClient])
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
    onMutate: async (submission) => {
      // 1. Save to local storage before sending
      saveOfflineMatch(submission)
    },
    onSuccess: (_, variables) => {
      // 2. Remove on explicit success
      removeOfflineMatch(variables.matchId)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ranking.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all }),
      ])
    },
  })
}
