import { configKey } from '@/config/options'
import { PAGINATION, type HistoryQuery, type RankingQuery } from './contracts'

const pageOf = (q: { page?: number }) => q.page ?? 1
const sizeOf = (q: { pageSize?: number }) => q.pageSize ?? PAGINATION.defaultPageSize

/**
 * Hierarchical query keys. Invalidating `queryKeys.ranking.all` refreshes every ranking page
 * and config; the `list` keys carry every input that changes the response.
 */
export const queryKeys = {
  ranking: {
    all: ['ranking'] as const,
    list: (q: RankingQuery) => ['ranking', 'list', configKey(q.config), pageOf(q), sizeOf(q)] as const,
  },
  history: {
    all: ['history'] as const,
    list: (q: HistoryQuery) => ['history', 'list', q.playerId, pageOf(q), sizeOf(q)] as const,
  },
} as const

export const mutationKeys = {
  submitMatch: ['history', 'submit'] as const,
}
