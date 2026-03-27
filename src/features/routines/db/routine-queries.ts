import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import {
  routineTemplates,
  routineSubtasks,
  routineInstances,
  routineInstanceSubtasks,
} from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { RoutineTemplateFormData } from '@/lib/validation';

// ── Template reads ───────────────────────────────────────

export async function getAllTemplates() {
  return db.select().from(routineTemplates).where(isNull(routineTemplates.deletedAt));
}

export async function getActiveTemplates() {
  return db
    .select()
    .from(routineTemplates)
    .where(and(isNull(routineTemplates.deletedAt), eq(routineTemplates.isActive, true)));
}

export async function getTemplateById(id: string) {
  const rows = await db
    .select()
    .from(routineTemplates)
    .where(eq(routineTemplates.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getTemplatesByCategory(category: string) {
  return db
    .select()
    .from(routineTemplates)
    .where(and(isNull(routineTemplates.deletedAt), eq(routineTemplates.category, category)));
}

export async function getTemplateSubtasks(templateId: string) {
  return db
    .select()
    .from(routineSubtasks)
    .where(eq(routineSubtasks.routineTemplateId, templateId))
    .orderBy(routineSubtasks.sortOrder);
}

// ── Template writes ──────────────────────────────────────

export async function createTemplate(data: RoutineTemplateFormData, userId?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(routineTemplates).values({
    id,
    userId: userId ?? null,
    title: data.title,
    notes: data.notes ?? null,
    category: data.category,
    defaultSession: data.defaultSession ?? null,
    recurrenceType: data.recurrenceType,
    recurrenceDaysJson: data.recurrenceDaysJson ?? null,
    recurrenceAnchorDate: data.recurrenceAnchorDate ?? now.split('T')[0],
    isActive: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  return id;
}

export async function updateTemplate(id: string, data: Partial<RoutineTemplateFormData>) {
  await db
    .update(routineTemplates)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(routineTemplates.id, id));
}

export async function softDeleteTemplate(id: string) {
  await db
    .update(routineTemplates)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(routineTemplates.id, id));
}

// ── Instance reads ───────────────────────────────────────

export async function getInstancesByDate(date: string) {
  return db
    .select()
    .from(routineInstances)
    .where(and(isNull(routineInstances.deletedAt), eq(routineInstances.instanceDate, date)));
}

export async function getInstanceById(id: string) {
  const rows = await db
    .select()
    .from(routineInstances)
    .where(eq(routineInstances.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPendingInstancesByDate(date: string) {
  return db
    .select()
    .from(routineInstances)
    .where(
      and(
        isNull(routineInstances.deletedAt),
        eq(routineInstances.instanceDate, date),
        eq(routineInstances.status, 'pending'),
      ),
    );
}

export async function getInstanceSubtasks(instanceId: string) {
  return db
    .select()
    .from(routineInstanceSubtasks)
    .where(eq(routineInstanceSubtasks.routineInstanceId, instanceId))
    .orderBy(routineInstanceSubtasks.sortOrder);
}

// ── Instance writes ──────────────────────────────────────

export async function completeInstance(id: string) {
  const now = new Date().toISOString();

  await db
    .update(routineInstances)
    .set({
      status: 'completed',
      completedAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(routineInstances.id, id));

  // Complete all incomplete instance subtasks
  await db
    .update(routineInstanceSubtasks)
    .set({
      isCompleted: true,
      completedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(routineInstanceSubtasks.routineInstanceId, id),
        eq(routineInstanceSubtasks.isCompleted, false),
      ),
    );

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_COMPLETED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId ?? undefined,
  });
}

export async function skipInstance(id: string) {
  const now = new Date().toISOString();

  await db
    .update(routineInstances)
    .set({
      status: 'skipped',
      skippedAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(routineInstances.id, id));

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_SKIPPED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId ?? undefined,
  });
}

export async function snoozeInstance(
  id: string,
  untilSession: 'morning' | 'afternoon' | 'evening',
) {
  const now = new Date().toISOString();

  await db
    .update(routineInstances)
    .set({
      status: 'snoozed',
      snoozedUntilSession: untilSession,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(routineInstances.id, id));

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_SNOOZED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId ?? undefined,
    payloadJson: { untilSession },
  });
}

export async function moveInstance(
  id: string,
  toSession: 'morning' | 'afternoon' | 'evening',
) {
  const now = new Date().toISOString();

  await db
    .update(routineInstances)
    .set({
      effectiveSession: toSession,
      wasMoved: true,
      movedAt: now,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(routineInstances.id, id));

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_MOVED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId ?? undefined,
    payloadJson: { toSession },
  });
}
