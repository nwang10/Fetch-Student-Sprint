import { z } from 'zod';

export const challengeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['threshold_unlock', 'leaderboard', 'timed']),
  status: z.enum(['upcoming', 'live', 'completed']),
  startDate: z.date(),
  endDate: z.date(),
  currentProgress: z.number(),
  threshold: z.number().optional(),
  prize: z.string().optional(),
  rules: z.array(z.string()),
  participants: z.number(),
  imageUrl: z.string().url().optional(),
});

export type Challenge = z.infer<typeof challengeSchema>;

export const leaderboardEntrySchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  userAvatar: z.string().url().optional(),
  points: z.number(),
  rank: z.number(),
  badges: z.array(z.string()),
  crowns: z.number(),
  flipsCount: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const storeLeaderboardSchema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  storeLogoUrl: z.string().url().optional(),
  entries: z.array(leaderboardEntrySchema),
  rules: z.object({
    varietyBonus: z.number().optional(),
    frequencyMultiplier: z.number().optional(),
    pointsPerFlip: z.number(),
  }),
  weekEnding: z.date(),
});

export type StoreLeaderboard = z.infer<typeof storeLeaderboardSchema>;
