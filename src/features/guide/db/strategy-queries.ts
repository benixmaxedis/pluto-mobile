import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { strategies, strategyGuideLinks } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { StrategyFormData } from '@/lib/validation';

export async function getAllStrategies() {
  return db.select().from(strategies).where(isNull(strategies.deletedAt));
}

export async function getStrategyById(id: string) {
  const rows = await db.select().from(strategies).where(eq(strategies.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getStrategiesByCategory(category: string) {
  return db
    .select()
    .from(strategies)
    .where(and(isNull(strategies.deletedAt), eq(strategies.category, category)));
}

export async function createStrategy(data: StrategyFormData, userId?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  await db.insert(strategies).values({
    id,
    userId: userId ?? null,
    title: data.title,
    category: data.category,
    triggerText: data.triggerText ?? null,
    contextText: data.contextText ?? null,
    responseStepsMarkdown: data.responseStepsMarkdown ?? null,
    whyItMatters: data.whyItMatters ?? null,
    exampleText: data.exampleText ?? null,
    tagsJson: data.tagsJson ?? null,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  await logEvent({
    eventType: EventType.STRATEGY_CREATED,
    entityType: EntityType.STRATEGY,
    entityId: id,
    userId,
  });

  return id;
}

export async function updateStrategy(id: string, data: Partial<StrategyFormData>) {
  await db
    .update(strategies)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(strategies.id, id));
}

export async function softDeleteStrategy(id: string) {
  await db
    .update(strategies)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(strategies.id, id));
}

export async function linkStrategyToGuideItem(strategyId: string, guideItemId: string) {
  await db.insert(strategyGuideLinks).values({
    id: generateId(),
    strategyId,
    guideItemId,
    createdAt: new Date().toISOString(),
  });
}

export async function unlinkStrategyFromGuideItem(strategyId: string, guideItemId: string) {
  await db
    .delete(strategyGuideLinks)
    .where(
      and(
        eq(strategyGuideLinks.strategyId, strategyId),
        eq(strategyGuideLinks.guideItemId, guideItemId),
      ),
    );
}

export async function getLinkedGuideItems(strategyId: string) {
  return db
    .select()
    .from(strategyGuideLinks)
    .where(eq(strategyGuideLinks.strategyId, strategyId));
}
