import { z } from 'zod';

export const StrategySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum([
    'sleep', 'health', 'home', 'work', 'finance',
    'self_care', 'social', 'learning', 'family', 'other',
  ]),
  triggerText: z.string().optional(),
  contextText: z.string().optional(),
  responseStepsMarkdown: z.string().optional(),
  whyItMatters: z.string().optional(),
  exampleText: z.string().optional(),
  tagsJson: z.string().optional(),
});

export type StrategyFormData = z.infer<typeof StrategySchema>;
