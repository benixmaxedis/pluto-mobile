import { z } from 'zod';

export const GuideItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum([
    'identity', 'beliefs', 'needs', 'values',
    'standards', 'boundaries', 'principles',
  ]),
  statement: z.string().optional(),
  meaning: z.string().optional(),
  exampleApplication: z.string().optional(),
  tagsJson: z.string().optional(),
});

export type GuideItemFormData = z.infer<typeof GuideItemSchema>;
