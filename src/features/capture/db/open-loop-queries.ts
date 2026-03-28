import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { OpenLoopFormData } from '@/lib/validation';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

export async function getAllOpenLoops() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('open_loops')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getOpenLoopById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('open_loops')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getOpenLoopsByCategory(category: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('open_loops')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('category', category);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function createOpenLoop(data: OpenLoopFormData, userIdParam?: string) {
  const userId = userIdParam ?? (await uid());
  const id = generateId();
  const now = new Date().toISOString();

  const row = snakeKeys({
    id,
    userId,
    title: data.title,
    body: data.body ?? null,
    category: data.category ?? null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('open_loops').insert(row);
  if (error) throw error;

  await logEvent({
    eventType: EventType.OPEN_LOOP_CREATED,
    entityType: EntityType.OPEN_LOOP,
    entityId: id,
    userId,
  });

  return id;
}

export async function convertOpenLoop(id: string, convertedToType: string, convertedToId: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('open_loops')
    .update(
      snakeKeys({
        status: 'converted',
        convertedToType,
        convertedToId,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

  const loop = await getOpenLoopById(id);
  await logEvent({
    eventType: EventType.OPEN_LOOP_CONVERTED,
    entityType: EntityType.OPEN_LOOP,
    entityId: id,
    userId: loop?.userId as string | undefined,
    payloadJson: { convertedToType, convertedToId },
  });
}

export async function archiveOpenLoop(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('open_loops')
    .update(
      snakeKeys({
        status: 'archived',
        archivedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;
}
