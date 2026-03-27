import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { openLoops } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { OpenLoopFormData } from '@/lib/validation';

export async function getAllOpenLoops() {
  return db.select().from(openLoops).where(eq(openLoops.status, 'active'));
}

export async function getOpenLoopById(id: string) {
  const rows = await db.select().from(openLoops).where(eq(openLoops.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getOpenLoopsByCategory(category: string) {
  return db
    .select()
    .from(openLoops)
    .where(and(eq(openLoops.status, 'active'), eq(openLoops.category, category)));
}

export async function createOpenLoop(data: OpenLoopFormData, userId?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(openLoops).values({
    id,
    userId: userId ?? null,
    title: data.title,
    body: data.body ?? null,
    category: data.category ?? null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  await logEvent({
    eventType: EventType.OPEN_LOOP_CREATED,
    entityType: EntityType.OPEN_LOOP,
    entityId: id,
    userId,
  });

  return id;
}

export async function convertOpenLoop(
  id: string,
  convertedToType: string,
  convertedToId: string,
) {
  const now = new Date().toISOString();

  await db
    .update(openLoops)
    .set({
      status: 'converted',
      convertedToType,
      convertedToId,
      updatedAt: now,
      syncStatus: 'pending',
    })
    .where(eq(openLoops.id, id));

  const loop = await getOpenLoopById(id);
  await logEvent({
    eventType: EventType.OPEN_LOOP_CONVERTED,
    entityType: EntityType.OPEN_LOOP,
    entityId: id,
    userId: loop?.userId ?? undefined,
    payloadJson: { convertedToType, convertedToId },
  });
}

export async function archiveOpenLoop(id: string) {
  await db
    .update(openLoops)
    .set({
      status: 'archived',
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(openLoops.id, id));
}
