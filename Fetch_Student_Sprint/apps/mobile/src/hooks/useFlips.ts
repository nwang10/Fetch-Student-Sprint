import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useFlipsStore } from '../stores/flipsStore';
import { Flip } from '@repo/types';

export function useFlips() {
  return useInfiniteQuery({
    queryKey: ['flips'],
    queryFn: ({ pageParam = 1 }) => apiClient.getFlips(pageParam, 10),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useLikeFlip() {
  const queryClient = useQueryClient();
  const toggleLike = useFlipsStore((state) => state.toggleLike);

  return useMutation({
    mutationFn: async ({ flipId, isLiked }: { flipId: string; isLiked: boolean }) => {
      if (isLiked) {
        await apiClient.unlikeFlip(flipId);
      } else {
        await apiClient.likeFlip(flipId);
      }
    },
    onMutate: async ({ flipId }) => {
      // Optimistic update
      toggleLike(flipId);

      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['flips'] });

      // Snapshot previous value
      const previousFlips = queryClient.getQueryData(['flips']);

      // Optimistically update
      queryClient.setQueryData(['flips'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: Flip[]) =>
            page.map((flip) =>
              flip.id === flipId
                ? {
                    ...flip,
                    isLiked: !flip.isLiked,
                    likeCount: flip.isLiked ? flip.likeCount - 1 : flip.likeCount + 1,
                  }
                : flip
            )
          ),
        };
      });

      return { previousFlips };
    },
    onError: (_err, { flipId }, context) => {
      // Revert optimistic update on error
      toggleLike(flipId);
      if (context?.previousFlips) {
        queryClient.setQueryData(['flips'], context.previousFlips);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flips'] });
    },
  });
}
