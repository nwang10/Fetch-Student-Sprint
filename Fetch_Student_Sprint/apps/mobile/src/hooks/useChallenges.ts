import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useChallenges(status?: 'live' | 'upcoming' | 'completed') {
  return useQuery({
    queryKey: ['challenges', status],
    queryFn: () => apiClient.getChallenges(status),
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => apiClient.getChallenge(id),
    enabled: !!id,
  });
}
