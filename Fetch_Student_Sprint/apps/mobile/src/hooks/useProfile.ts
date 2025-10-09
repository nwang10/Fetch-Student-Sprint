import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useUserStore } from '../stores/userStore';
import { UserProfile } from '@repo/types';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => apiClient.getProfile(userId),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useUserStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => apiClient.updateProfile(updates),
    onSuccess: (updatedProfile) => {
      updateUser(updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
