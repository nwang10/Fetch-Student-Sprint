import { Router, Request, Response, NextFunction } from 'express';
import { createUserSchema } from '@repo/types';
import { z } from 'zod';

export const userRouter: Router = Router();

// Mock database (replace with actual DB later)
const users: any[] = [];

userRouter.get('/', (_req: Request, res: Response) => {
  res.json({ users });
});

userRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    res.status(201).json({ user: newUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
});

userRouter.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});
