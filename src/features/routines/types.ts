import type { InferSelectModel } from 'drizzle-orm';
import type {
  routineTemplates,
  routineSubtasks,
  routineInstances,
  routineInstanceSubtasks,
} from '@/lib/db/schema';

export type RoutineTemplate = InferSelectModel<typeof routineTemplates>;
export type RoutineSubtask = InferSelectModel<typeof routineSubtasks>;
export type RoutineInstance = InferSelectModel<typeof routineInstances>;
export type RoutineInstanceSubtask = InferSelectModel<typeof routineInstanceSubtasks>;
