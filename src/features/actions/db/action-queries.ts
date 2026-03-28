import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { ActionFormData } from '@/lib/validation';
import type { Action } from '../types';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

// ── Reads ────────────────────────────────────────────────

export async function getAllActions() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]) as Action[];
}

export async function getActionById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? (camelRow(data as Record<string, unknown>) as unknown as Action) : null;
}

export async function getActionsByDate(date: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .or(`effective_date.eq.${date},scheduled_date.eq.${date}`);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getPendingActions() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('status', 'pending');
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getOverdueActions(today: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('status', 'pending')
    .eq('is_held', false)
    .lt('effective_date', today);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getActionsForQueue(date: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('status', 'pending')
    .eq('is_held', false)
    .or(`effective_date.eq.${date},scheduled_date.eq.${date},effective_date.lte.${date}`);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]) as Action[];
}

export async function getSubtasksForAction(actionId: string) {
  const { data, error } = await getSupabase()
    .from('action_subtasks')
    .select('*')
    .eq('action_id', actionId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

// ── Writes ───────────────────────────────────────────────

export async function createAction(data: ActionFormData, userIdParam?: string) {
  const userId = userIdParam ?? (await uid());
  const id = generateId();
  const now = new Date().toISOString();

  const row = snakeKeys({
    id,
    userId,
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
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('actions').insert(row);
  if (error) throw error;

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
  await uid();
  const now = new Date().toISOString();
  const merged: Record<string, unknown> = {
    ...data,
    updatedAt: now,
    syncStatus: 'synced',
  };
  if (data.scheduledDate !== undefined) {
    merged.effectiveDate = data.scheduledDate ?? null;
  }
  if (data.scheduledSession !== undefined) {
    merged.effectiveSession = data.scheduledSession ?? null;
  }
  const patch = snakeKeys(merged);
  const { error } = await getSupabase().from('actions').update(patch).eq('id', id);
  if (error) throw error;
}

export async function completeAction(id: string) {
  const now = new Date().toISOString();

  const { error: e1 } = await getSupabase()
    .from('actions')
    .update(
      snakeKeys({
        status: 'completed',
        completedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (e1) throw e1;

  const { error: e2 } = await getSupabase()
    .from('action_subtasks')
    .update(
      snakeKeys({
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      }),
    )
    .eq('action_id', id)
    .eq('is_completed', false);
  if (e2) throw e2;

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
  const { error } = await getSupabase()
    .from('actions')
    .update(
      snakeKeys({
        status: 'skipped',
        skippedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

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
  const { error } = await getSupabase()
    .from('actions')
    .update(
      snakeKeys({
        status: 'snoozed',
        snoozedUntilDate: untilDate,
        snoozedUntilSession: untilSession,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

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
  const { error } = await getSupabase()
    .from('actions')
    .update(
      snakeKeys({
        effectiveDate: toDate,
        effectiveSession: toSession,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

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
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('actions')
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

// ── Subtasks ─────────────────────────────────────────────

export async function createSubtask(actionId: string, title: string) {
  const id = generateId();
  const now = new Date().toISOString();
  const row = snakeKeys({
    id,
    actionId,
    title,
    isCompleted: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });
  const { error } = await getSupabase().from('action_subtasks').insert(row);
  if (error) throw error;
  return id;
}

export async function toggleSubtask(id: string, isCompleted: boolean) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('action_subtasks')
    .update(
      snakeKeys({
        isCompleted,
        completedAt: isCompleted ? now : null,
        updatedAt: now,
      }),
    )
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSubtask(id: string) {
  const { error } = await getSupabase().from('action_subtasks').delete().eq('id', id);
  if (error) throw error;
}
