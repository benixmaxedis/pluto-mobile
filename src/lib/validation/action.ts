import { z } from 'zod';

export const ActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledSession: z.enum(['morning', 'afternoon', 'evening']).optional(),
  priority: z.enum(['normal', 'high']).default('normal'),
  isHeld: z.boolean().default(false),
});

export type ActionFormData = z.infer<typeof ActionSchema>;

export const ActionSubtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required'),
});

export type ActionSubtaskFormData = z.infer<typeof ActionSubtaskSchema>;
