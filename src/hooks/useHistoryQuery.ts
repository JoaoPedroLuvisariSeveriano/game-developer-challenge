import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { HistoryPage } from '@/api/contracts';

interface HistoryQueryParams {
  page?: number;
  pageSize?: number;
  playerId: string;
}

export function useHistoryQuery(params: HistoryQueryParams) {
  return useQuery({
    queryKey: ['history', params],
    queryFn: async () => {
      const response = await api.get<HistoryPage>('/history', {
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          playerId: params.playerId,
        },
      });
      return response.data;
    },
    enabled: !!params.playerId,
  });
}
