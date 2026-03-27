import type { InferSelectModel } from 'drizzle-orm';
import type { actions, actionSubtasks } from '@/lib/db/schema';

export type Action = InferSelectModel<typeof actions>;
export type ActionSubtask = InferSelectModel<typeof actionSubtasks>;
