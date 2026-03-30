import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { ActionFormData } from '@/lib/validation';
import type { Action, ActionSubtask } from '../types';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

type ActionSubtaskInput = NonNullable<ActionFormData['subtasks']>[number];

function normalizeSubtasks(subtasks: ActionFormData['subtasks']): ActionSubtaskInput[] {
  return (subtasks ?? [])
    .map((subtask) => ({
      ...subtask,
      title: subtask.title.trim(),
    }))
    .filter((subtask) => subtask.title.length > 0);
}

async function syncSubtasksForAction(actionId: string, subtasks: ActionFormData['subtasks']) {
  const now = new Date().toISOString();
  const normalizedSubtasks = normalizeSubtasks(subtasks);

  const { data: existingData, error: existingError } = await getSupabase()
    .from('action_subtasks')
    .select('*')
    .eq('action_id', actionId);
  if (existingError) throw existingError;

  const existingRows = camelRows((existingData ?? []) as Record<string, unknown>[]) as ActionSubtask[];
  const existingById = new Map(existingRows.map((row) => [row.id, row]));
  const keepIds = new Set<string>();
  const updates: Array<{ id: string; row: Record<string, unknown> }> = [];
  const inserts: Record<string, unknown>[] = [];

  normalizedSubtasks.forEach((subtask, index) => {
    const existing = subtask.id ? existingById.get(subtask.id) : undefined;
    if (existing) {
      keepIds.add(existing.id);
      const isCompleted = subtask.isCompleted ?? existing.isCompleted ?? false;
      updates.push({
        id: existing.id,
        row: snakeKeys({
          title: subtask.title,
          sortOrder: index,
          isCompleted,
          completedAt: isCompleted ? (subtask.completedAt ?? existing.completedAt ?? null) : null,
          updatedAt: now,
        }),
      });
      return;
    }

    const isCompleted = subtask.isCompleted ?? false;
    inserts.push(
      snakeKeys({
        id: generateId(),
        actionId,
        title: subtask.title,
        isCompleted,
        completedAt: isCompleted ? (subtask.completedAt ?? now) : null,
        sortOrder: index,
        createdAt: subtask.createdAt ?? now,
        updatedAt: now,
      }),
    );
  });

  const idsToDelete = existingRows.filter((row) => !keepIds.has(row.id)).map((row) => row.id);
  if (idsToDelete.length > 0) {
    const { error } = await getSupabase()
      .from('action_subtasks')
      .delete()
      .eq('action_id', actionId)
      .in('id', idsToDelete);
    if (error) throw error;
  }

  for (const update of updates) {
    const { error } = await getSupabase()
      .from('action_subtasks')
      .update(update.row)
      .eq('action_id', actionId)
      .eq('id', update.id);
    if (error) throw error;
  }

  if (inserts.length > 0) {
    const { error } = await getSupabase().from('action_subtasks').insert(inserts);
    if (error) throw error;
  }
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
  const actions = camelRows((data ?? []) as Record<string, unknown>[]) as Action[];
  if (actions.length === 0) return actions;

  const { data: subtasksData, error: subtasksError } = await getSupabase()
    .from('action_subtasks')
    .select('*')
    .in(
      'action_id',
      actions.map((action) => action.id),
    )
    .order('sort_order', { ascending: true });
  if (subtasksError) throw subtasksError;

  const allSubtasks = camelRows((subtasksData ?? []) as Record<string, unknown>[]) as ActionSubtask[];
  const subtasksByAction = new Map<string, ActionSubtask[]>();
  allSubtasks.forEach((subtask) => {
    const existing = subtasksByAction.get(subtask.actionId) ?? [];
    existing.push(subtask);
    subtasksByAction.set(subtask.actionId, existing);
  });

  return actions.map((action) => {
    const subtasks = subtasksByAction.get(action.id) ?? [];
    const completed = subtasks.filter((subtask) => !!subtask.isCompleted).length;

    return {
      ...action,
      subtasks,
      subtaskProgress: subtasks.length > 0 ? { completed, total: subtasks.length } : null,
    };
  });
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

export async function getTerminalActionsForDate(date: string): Promise<Action[]> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('actions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .in('status', ['completed', 'skipped'])
    .or(`scheduled_date.eq.${date},effective_date.eq.${date}`);
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

  const subtasks = normalizeSubtasks(data.subtasks);
  if (subtasks.length > 0) {
    const subtaskRows = subtasks.map((subtask, index) =>
      snakeKeys({
        id: generateId(),
        actionId: id,
        title: subtask.title,
        isCompleted: subtask.isCompleted ?? false,
        completedAt: subtask.isCompleted ? (subtask.completedAt ?? now) : null,
        sortOrder: index,
        createdAt: subtask.createdAt ?? now,
        updatedAt: now,
      }),
    );
    const { error: subtaskError } = await getSupabase().from('action_subtasks').insert(subtaskRows);
    if (subtaskError) throw subtaskError;
  }

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
  const { subtasks, ...actionData } = data;
  const merged: Record<string, unknown> = {
    ...actionData,
    updatedAt: now,
    syncStatus: 'synced',
  };
  if (actionData.scheduledDate !== undefined) {
    merged.effectiveDate = actionData.scheduledDate ?? null;
  }
  if (actionData.scheduledSession !== undefined) {
    merged.effectiveSession = actionData.scheduledSession ?? null;
  }
  const patch = snakeKeys(merged);
  const { error } = await getSupabase().from('actions').update(patch).eq('id', id);
  if (error) throw error;

  if (subtasks !== undefined) {
    await syncSubtasksForAction(id, subtasks);
  }
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
