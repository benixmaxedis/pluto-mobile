import { eq, and, isNull, ne, or, lte, gt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { actions, actionSubtasks } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { toISODate } from '@/lib/utils/date';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { ActionFormData } from '@/lib/validation';

// ── Reads ────────────────────────────────────────────────

export async function getAllActions() {
  return db.select().from(actions).where(isNull(actions.deletedAt));
}

export async function getActionById(id: string) {
  const rows = await db.select().from(actions).where(eq(actions.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getActionsByDate(date: string) {
  return db
    .select()
    .from(actions)
    .where(
      and(
        isNull(actions.deletedAt),
        or(eq(actions.effectiveDate, date), eq(actions.scheduledDate, date)),
      ),
    );
}

export async function getPendingActions() {
  return db
    .select()
    .from(actions)
    .where(and(isNull(actions.deletedAt), eq(actions.status, 'pending')));
}

export async function getOverdueActions(today: string) {
  return db
    .select()
    .from(actions)
    .where(
      and(
        isNull(actions.deletedAt),
        eq(actions.status, 'pending'),
        eq(actions.isHeld, false),
        lte(actions.effectiveDate, today),
        ne(actions.effectiveDate, today),
      ),
    );
}

export async function getActionsForQueue(date: string) {
  return db
    .select()
    .from(actions)
    .where(
      and(
        isNull(actions.deletedAt),
        eq(actions.status, 'pending'),
        eq(actions.isHeld, false),
        or(
          eq(actions.effectiveDate, date),
          eq(actions.scheduledDate, date),
          // Include overdue items
          lte(actions.effectiveDate, date),
        ),
      ),
    );
}

export async function getSubtasksForAction(actionId: string) {
  return db
    .select()
    .from(actionSubtasks)
    .where(eq(actionSubtasks.actionId, actionId))
    .orderBy(actionSubtasks.sortOrder);
}

// ── Writes ───────────────────────────────────────────────

export async function createAction(data: ActionFormData, userId?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(actions).values({
    id,
    userId: userId ?? null,
    title: data.title,
    notes: data.notes ?? null,
    scheduledDate: data.scheduledDate ?? null,
    scheduledSession: data.scheduledSession ?? null,
    effectiveDate: data.scheduledDate ?? null,
    effectiveSession: data.scheduledSession ?? null,
    priority: data.priority ?? 'normal',
    isHeld: data.isHeld ?? false,
    status: 'pending',
    actionKind: 'normal',
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  await logEvent({
    eventType: EventType.ACTION_CREATED,
    entityType: EntityType.ACTION,
    entityId: id,
    userId,
  });

  return id;
}

export async function updateAction(
  id: string,
  data: Partial<ActionFormData> & { updatedAt?: string },
) {
  await db
    .update(actions)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));
}

export async function completeAction(id: string) {
  const now = new Date().toISOString();

  await db
    .update(actions)
    .set({
      status: 'completed',
      completedAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));

  // Complete all incomplete subtasks
  await db
    .update(actionSubtasks)
    .set({
      isCompleted: true,
      completedAt: now,
      updatedAt: now,
    })
    .where(and(eq(actionSubtasks.actionId, id), eq(actionSubtasks.isCompleted, false)));

  const action = await getActionById(id);
  await logEvent({
    eventType: EventType.ACTION_COMPLETED,
    entityType: EntityType.ACTION,
    entityId: id,
    userId: action?.userId ?? undefined,
    payloadJson: action?.momentumChainId
      ? { chainId: action.momentumChainId, chainStepId: action.momentumChainStepId }
      : undefined,
  });
}

export async function skipAction(id: string) {
  const now = new Date().toISOString();

  await db
    .update(actions)
    .set({
      status: 'skipped',
      skippedAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));

  const action = await getActionById(id);
  await logEvent({
    eventType: EventType.ACTION_SKIPPED,
    entityType: EntityType.ACTION,
    entityId: id,
    userId: action?.userId ?? undefined,
  });
}

export async function snoozeAction(
  id: string,
  untilDate: string,
  untilSession: 'morning' | 'afternoon' | 'evening',
) {
  const now = new Date().toISOString();

  await db
    .update(actions)
    .set({
      status: 'snoozed',
      snoozedUntilDate: untilDate,
      snoozedUntilSession: untilSession,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));

  const action = await getActionById(id);
  await logEvent({
    eventType: EventType.ACTION_SNOOZED,
    entityType: EntityType.ACTION,
    entityId: id,
    userId: action?.userId ?? undefined,
    payloadJson: { untilDate, untilSession },
  });
}

export async function moveAction(
  id: string,
  toDate: string,
  toSession: 'morning' | 'afternoon' | 'evening',
) {
  const now = new Date().toISOString();

  await db
    .update(actions)
    .set({
      effectiveDate: toDate,
      effectiveSession: toSession,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));

  const action = await getActionById(id);
  await logEvent({
    eventType: EventType.ACTION_MOVED,
    entityType: EntityType.ACTION,
    entityId: id,
    userId: action?.userId ?? undefined,
    payloadJson: { toDate, toSession },
  });
}

export async function softDeleteAction(id: string) {
  await db
    .update(actions)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(actions.id, id));
}

// ── Subtasks ─────────────────────────────────────────────

export async function createSubtask(actionId: string, title: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(actionSubtasks).values({
    id,
    actionId,
    title,
    isCompleted: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function toggleSubtask(id: string, isCompleted: boolean) {
  await db
    .update(actionSubtasks)
    .set({
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(actionSubtasks.id, id));
}

export async function deleteSubtask(id: string) {
  await db.delete(actionSubtasks).where(eq(actionSubtasks.id, id));
}
