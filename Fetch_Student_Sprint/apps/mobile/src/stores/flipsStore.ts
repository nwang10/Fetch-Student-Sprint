import { create } from 'zustand';
import { Flip } from '@repo/types';

interface FlipsStore {
  flips: Flip[];
  optimisticLikes: Set<string>;
  addFlip: (flip: Flip) => void;
  toggleLike: (flipId: string) => void;
  updateFlip: (flipId: string, updates: Partial<Flip>) => void;
  setFlips: (flips: Flip[]) => void;
}

export const useFlipsStore = create<FlipsStore>((set) => ({
  flips: [],
  optimisticLikes: new Set(),

  addFlip: (flip) =>
    set((state) => ({
      flips: [flip, ...state.flips],
    })),

  toggleLike: (flipId) =>
    set((state) => {
      const optimisticLikes = new Set(state.optimisticLikes);
      const flips = state.flips.map((flip) => {
        if (flip.id === flipId) {
          const wasLiked = flip.isLiked;
          const isOptimistic = optimisticLikes.has(flipId);

          if (isOptimistic) {
            optimisticLikes.delete(flipId);
          } else {
            optimisticLikes.add(flipId);
          }

          return {
            ...flip,
            isLiked: !wasLiked,
            likeCount: wasLiked ? flip.likeCount - 1 : flip.likeCount + 1,
          };
        }
        return flip;
      });

      return { flips, optimisticLikes };
    }),

  updateFlip: (flipId, updates) =>
    set((state) => ({
      flips: state.flips.map((flip) =>
        flip.id === flipId ? { ...flip, ...updates } : flip
      ),
    })),

  setFlips: (flips) => set({ flips }),
}));
