import { z } from 'zod';

export const MomentumChainSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  domain: z.enum(['sleep', 'nutrition', 'exercise']),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type MomentumChainFormData = z.infer<typeof MomentumChainSchema>;

export const MomentumChainStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  notes: z.string().optional(),
  defaultSession: z.enum(['morning', 'afternoon', 'evening']).optional(),
  leadOffsetSessions: z.number().int().min(0).optional(),
  stepType: z.enum(['setup', 'execution', 'wind_down']).default('setup'),
  isOptional: z.boolean().default(false),
});

export type MomentumChainStepFormData = z.infer<typeof MomentumChainStepSchema>;
