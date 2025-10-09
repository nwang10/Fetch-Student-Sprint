import { z } from 'zod';

export const badgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  earnedAt: z.date(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
});

export type Badge = z.infer<typeof badgeSchema>;

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  totalPoints: z.number(),
  crowns: z.number(),
  badges: z.array(badgeSchema),
  flipsCount: z.number(),
  followersCount: z.number(),
  followingCount: z.number(),
  createdAt: z.date(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
