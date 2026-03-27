import type { InferSelectModel } from 'drizzle-orm';
import type { chatMessages } from '@/lib/db/schema';

export type ChatMessage = InferSelectModel<typeof chatMessages>;
