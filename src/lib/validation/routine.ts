import { z } from 'zod';

export const RoutineTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  category: z.enum([
    'sleep', 'health', 'home', 'work', 'finance',
    'self_care', 'social', 'learning', 'family', 'other',
  ]),
  defaultSession: z.enum(['morning', 'afternoon', 'evening']).optional(),
  recurrenceType: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually']),
  recurrenceDaysJson: z.string().optional(),
  recurrenceAnchorDate: z.string().optional(),
});

export type RoutineTemplateFormData = z.infer<typeof RoutineTemplateSchema>;
