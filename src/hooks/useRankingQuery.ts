import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { RankingPage, MatchConfig } from '@/api/contracts';

interface RankingQueryParams {
  page?: number;
  pageSize?: number;
  config: MatchConfig;
}

export function useRankingQuery(params: RankingQueryParams) {
  return useQuery({
    queryKey: ['ranking', params],
    queryFn: async () => {
      const response = await api.get<RankingPage>('/ranking', {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          sessionTimeSeconds: params.config.sessionTimeSeconds,
          enemySpawnIntervalSeconds: params.config.enemySpawnIntervalSeconds,
        },
      });
      return response.data;
    },
  });
}
