import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => apiClient.getStores(),
  });
}

export function useStoreLeaderboard(storeId: string | null) {
  return useQuery({
    queryKey: ['leaderboard', storeId],
    queryFn: () => apiClient.getStoreLeaderboard(storeId!),
    enabled: !!storeId,
  });
}
