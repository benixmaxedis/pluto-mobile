import { z } from 'zod';

export const OpenLoopSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional(),
  category: z
    .enum([
      'sleep', 'health', 'home', 'work', 'finance',
      'self_care', 'social', 'learning', 'family', 'other',
    ])
    .optional(),
});

export type OpenLoopFormData = z.infer<typeof OpenLoopSchema>;
