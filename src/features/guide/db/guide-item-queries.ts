import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { guideItems } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { GuideItemFormData } from '@/lib/validation';

export async function getAllGuideItems() {
  return db.select().from(guideItems).where(isNull(guideItems.deletedAt));
}

export async function getGuideItemById(id: string) {
  const rows = await db.select().from(guideItems).where(eq(guideItems.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getGuideItemsByCategory(category: string) {
  return db
    .select()
    .from(guideItems)
    .where(and(isNull(guideItems.deletedAt), eq(guideItems.category, category)))
    .orderBy(guideItems.sortOrder);
}

export async function createGuideItem(data: GuideItemFormData, userId?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(guideItems).values({
    id,
    userId: userId ?? null,
    title: data.title,
    category: data.category,
    statement: data.statement ?? null,
    meaning: data.meaning ?? null,
    exampleApplication: data.exampleApplication ?? null,
    tagsJson: data.tagsJson ?? null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  await logEvent({
    eventType: EventType.GUIDE_ITEM_CREATED,
    entityType: EntityType.GUIDE_ITEM,
    entityId: id,
    userId,
  });

  return id;
}

export async function updateGuideItem(id: string, data: Partial<GuideItemFormData>) {
  await db
    .update(guideItems)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(guideItems.id, id));
}

export async function softDeleteGuideItem(id: string) {
  await db
    .update(guideItems)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(guideItems.id, id));
}
