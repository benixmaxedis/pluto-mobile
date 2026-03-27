import type { InferSelectModel } from 'drizzle-orm';
import type { activityEvents } from '@/lib/db/schema';

export type ActivityEvent = InferSelectModel<typeof activityEvents>;
