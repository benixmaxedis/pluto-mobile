import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { StrategyFormData } from '@/lib/validation';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

export async function getAllStrategies() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('strategies')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getStrategyById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('strategies')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getStrategiesByCategory(category: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('strategies')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('category', category);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function createStrategy(data: StrategyFormData, userIdParam?: string) {
  const userId = userIdParam ?? (await uid());
  const id = generateId();
  const now = new Date().toISOString();

  const row = snakeKeys({
    id,
    userId,
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
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('strategies').insert(row);
  if (error) throw error;

  await logEvent({
    eventType: EventType.STRATEGY_CREATED,
    entityType: EntityType.STRATEGY,
    entityId: id,
    userId,
  });

  return id;
}

export async function updateStrategy(id: string, data: Partial<StrategyFormData>) {
  const patch = snakeKeys({
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  } as Record<string, unknown>);
  const { error } = await getSupabase().from('strategies').update(patch).eq('id', id);
  if (error) throw error;
}

export async function softDeleteStrategy(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('strategies')
    .update(
      snakeKeys({
        deletedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;
}

export async function linkStrategyToGuideItem(strategyId: string, guideItemId: string) {
  const row = snakeKeys({
    id: generateId(),
    strategyId,
    guideItemId,
    createdAt: new Date().toISOString(),
  });
  const { error } = await getSupabase().from('strategy_guide_links').insert(row);
  if (error) throw error;
}

export async function unlinkStrategyFromGuideItem(strategyId: string, guideItemId: string) {
  const { error } = await getSupabase()
    .from('strategy_guide_links')
    .delete()
    .eq('strategy_id', strategyId)
    .eq('guide_item_id', guideItemId);
  if (error) throw error;
}

export async function getLinkedGuideItems(strategyId: string) {
  const { data, error } = await getSupabase()
    .from('strategy_guide_links')
    .select('*')
    .eq('strategy_id', strategyId);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}
