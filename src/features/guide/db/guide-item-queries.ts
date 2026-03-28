import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { GuideItemFormData } from '@/lib/validation';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

export async function getAllGuideItems() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('guide_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getGuideItemById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('guide_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getGuideItemsByCategory(category: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('guide_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('category', category)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function createGuideItem(data: GuideItemFormData, userIdParam?: string) {
  const userId = userIdParam ?? (await uid());
  const id = generateId();
  const now = new Date().toISOString();

  const row = snakeKeys({
    id,
    userId,
    title: data.title,
    category: data.category,
    statement: data.statement ?? null,
    meaning: data.meaning ?? null,
    exampleApplication: data.exampleApplication ?? null,
    tagsJson: data.tagsJson ?? null,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('guide_items').insert(row);
  if (error) throw error;

  await logEvent({
    eventType: EventType.GUIDE_ITEM_CREATED,
    entityType: EntityType.GUIDE_ITEM,
    entityId: id,
    userId,
  });

  return id;
}

export async function updateGuideItem(id: string, data: Partial<GuideItemFormData>) {
  const patch = snakeKeys({
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  } as Record<string, unknown>);
  const { error } = await getSupabase().from('guide_items').update(patch).eq('id', id);
  if (error) throw error;
}

export async function softDeleteGuideItem(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('guide_items')
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
