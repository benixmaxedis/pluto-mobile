import { z } from 'zod';

export const ActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledSession: z.enum(['morning', 'afternoon', 'evening']).optional(),
  priority: z.enum(['normal', 'high']).default('normal'),
  isHeld: z.boolean().default(false),
  subtasks: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      isCompleted: z.boolean().optional(),
      completedAt: z.string().nullable().optional(),
      createdAt: z.string().optional(),
    }),
  ).optional(),
});

export type ActionFormData = z.infer<typeof ActionSchema>;

export const ActionSubtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Subtask title is required'),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export type ActionSubtaskFormData = z.infer<typeof ActionSubtaskSchema>;
