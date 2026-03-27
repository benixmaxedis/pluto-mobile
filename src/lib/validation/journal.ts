import { z } from 'zod';

export const MorningJournalSchema = z.object({
  gratitude1: z.string().min(1),
  gratitude2: z.string().min(1),
  gratitude3: z.string().min(1),
  intention1: z.string().min(1),
  intention2: z.string().min(1),
  intention3: z.string().min(1),
  affirmation: z.string().min(1),
});

export type MorningJournalFormData = z.infer<typeof MorningJournalSchema>;

export const EveningJournalSchema = z.object({
  amazing1: z.string().min(1),
  amazing2: z.string().min(1),
  amazing3: z.string().min(1),
  improvement: z.string().min(1),
});

export type EveningJournalFormData = z.infer<typeof EveningJournalSchema>;
