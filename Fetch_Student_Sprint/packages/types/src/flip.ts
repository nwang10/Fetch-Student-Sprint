import { z } from 'zod';

export const flipMediaSchema = z.object({
  type: z.enum(['image', 'video']),
  uri: z.string().url(),
  thumbnail: z.string().url().optional(),
  duration: z.number().optional(), // for videos
});

export type FlipMedia = z.infer<typeof flipMediaSchema>;

export const flipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string(),
  userAvatar: z.string().url().optional(),
  caption: z.string(),
  media: flipMediaSchema,
  receiptImage: z.string().url().optional(),
  pointsEarned: z.number(),
  brands: z.array(z.string()),
  challengeId: z.string().uuid().optional(),
  challengeName: z.string().optional(),
  likeCount: z.number(),
  commentCount: z.number(),
  isLiked: z.boolean(),
  createdAt: z.date(),
});

export type Flip = z.infer<typeof flipSchema>;

export const createFlipSchema = z.object({
  caption: z.string().min(1).max(500),
  mediaUri: z.string(),
  mediaType: z.enum(['image', 'video']),
  receiptUri: z.string().optional(),
  brands: z.array(z.string()),
  challengeId: z.string().uuid().optional(),
});

export type CreateFlip = z.infer<typeof createFlipSchema>;
