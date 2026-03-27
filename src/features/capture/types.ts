import type { InferSelectModel } from 'drizzle-orm';
import type { openLoops, journalEntries } from '@/lib/db/schema';

export type OpenLoop = InferSelectModel<typeof openLoops>;
export type JournalEntry = InferSelectModel<typeof journalEntries>;
