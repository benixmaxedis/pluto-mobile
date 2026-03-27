import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  actions,
  openLoops,
  routineTemplates,
  routineInstances,
  guideItems,
  strategies,
  momentumChains,
} from '@/lib/db/schema';

interface PushResult {
  pushed: number;
}

/**
 * Query all rows with sync_status='pending' across every syncable table,
 * batch them, and POST to the backend.
 *
 * For v1 this only logs what would be synced — real API calls are placeholder.
 */
export async function pushPendingChanges(): Promise<PushResult> {
  const pendingActions = await db
    .select()
    .from(actions)
    .where(eq(actions.syncStatus, 'pending'));

  const pendingOpenLoops = await db
    .select()
    .from(openLoops)
    .where(eq(openLoops.syncStatus, 'pending'));

  const pendingRoutineTemplates = await db
    .select()
    .from(routineTemplates)
    .where(eq(routineTemplates.syncStatus, 'pending'));

  const pendingRoutineInstances = await db
    .select()
    .from(routineInstances)
    .where(eq(routineInstances.syncStatus, 'pending'));

  const pendingGuideItems = await db
    .select()
    .from(guideItems)
    .where(eq(guideItems.syncStatus, 'pending'));

  const pendingStrategies = await db
    .select()
    .from(strategies)
    .where(eq(strategies.syncStatus, 'pending'));

  const pendingChains = await db
    .select()
    .from(momentumChains)
    .where(eq(momentumChains.syncStatus, 'pending'));

  const totalPending =
    pendingActions.length +
    pendingOpenLoops.length +
    pendingRoutineTemplates.length +
    pendingRoutineInstances.length +
    pendingGuideItems.length +
    pendingStrategies.length +
    pendingChains.length;

  if (totalPending === 0) {
    return { pushed: 0 };
  }

  // TODO: POST batched payload to backend API
  // POST /api/sync/push { actions, openLoops, routines, ... }
  console.log(`[sync/push] ${totalPending} pending rows ready to push`);

  // On successful push, mark rows as synced:
  // await markAsSynced(actions, pendingActions.map(r => r.id));
  // ... repeat for each table

  return { pushed: totalPending };
}
