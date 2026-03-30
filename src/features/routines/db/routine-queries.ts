import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { RoutineTemplateFormData } from '@/lib/validation';
import type { RoutineInstance, RoutineInstanceWithTemplateTitle, RoutineTemplate } from '../types';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

// ── Template reads ───────────────────────────────────────

export async function getAllTemplates() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_templates')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]) as RoutineTemplate[];
}

export async function getActiveTemplates() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_templates')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('is_active', true);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getTemplateById(id: string): Promise<RoutineTemplate | null> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? (camelRow(data as Record<string, unknown>) as unknown as RoutineTemplate) : null;
}

export async function getTemplatesByCategory(category: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_templates')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('category', category);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getTemplateSubtasks(templateId: string) {
  const { data, error } = await getSupabase()
    .from('routine_subtasks')
    .select('*')
    .eq('routine_template_id', templateId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

// ── Template writes ──────────────────────────────────────

export async function createTemplate(data: RoutineTemplateFormData, userIdParam?: string) {
  const userId = userIdParam ?? (await uid());
  const id = generateId();
  const now = new Date().toISOString();

  const row = snakeKeys({
    id,
    userId,
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
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('routine_templates').insert(row);
  // #region agent log
  fetch('http://127.0.0.1:7822/ingest/58830526-64c4-4c68-a2d9-f7f616baef68', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'bbf797' },
    body: JSON.stringify({
      sessionId: 'bbf797',
      hypothesisId: 'H1-H4',
      location: 'routine-queries.ts:createTemplate',
      message: 'routine_templates insert result',
      data: {
        rowKeys: Object.keys(row),
        errMsg: error?.message ?? null,
        errCode: error?.code ?? null,
        errDetails: error?.details ?? null,
        errHint: error?.hint ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  if (__DEV__) {
    console.warn('[debug bbf797] routine_templates insert', {
      rowKeys: Object.keys(row),
      error: error?.message,
      code: error?.code,
    });
  }
  // #endregion
  if (error) throw error;
  return id;
}

export async function updateTemplate(id: string, data: Partial<RoutineTemplateFormData>) {
  const patch = snakeKeys({
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  } as Record<string, unknown>);
  const { error } = await getSupabase().from('routine_templates').update(patch).eq('id', id);
  if (error) throw error;
}

export async function softDeleteTemplate(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('routine_templates')
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

// ── Instance reads ───────────────────────────────────────

export async function getInstancesByDate(date: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('instance_date', date);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getInstanceById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getPendingInstancesByDate(date: string): Promise<RoutineInstanceWithTemplateTitle[]> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select(
      `
      *,
      routine_templates (
        title,
        category
      )
    `,
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('instance_date', date)
    .eq('status', 'pending');
  if (error) throw error;
  const rows = camelRows((data ?? []) as Record<string, unknown>[]);
  return rows.map((row) => {
    const nested = row.routineTemplates;
    const t = nested && typeof nested === 'object' && nested !== null ? (nested as Record<string, unknown>) : null;
    const templateTitle = t && 'title' in t ? String(t.title ?? '') : '';
    const templateCategory = t && 'category' in t ? String(t.category ?? '') : '';
    const { routineTemplates: _rt, ...rest } = row;
    return { ...rest, templateTitle, templateCategory } as RoutineInstanceWithTemplateTitle;
  });
}

export async function getCompletedInstancesByDate(date: string): Promise<RoutineInstanceWithTemplateTitle[]> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select(
      `
      *,
      routine_templates (
        title,
        category
      )
    `,
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('status', 'completed')
    .gte('completed_at', `${date}T00:00:00`)
    .lte('completed_at', `${date}T23:59:59`);
  if (error) throw error;
  const rows = camelRows((data ?? []) as Record<string, unknown>[]);
  return rows.map((row) => {
    const nested = row.routineTemplates;
    const t = nested && typeof nested === 'object' && nested !== null ? (nested as Record<string, unknown>) : null;
    const templateTitle = t && 'title' in t ? String(t.title ?? '') : '';
    const templateCategory = t && 'category' in t ? String(t.category ?? '') : '';
    const { routineTemplates: _rt, ...rest } = row;
    return { ...rest, templateTitle, templateCategory } as RoutineInstanceWithTemplateTitle;
  });
}

export async function getSkippedInstancesByDate(date: string): Promise<RoutineInstanceWithTemplateTitle[]> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select(
      `
      *,
      routine_templates (
        title,
        category
      )
    `,
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('status', 'skipped')
    .eq('instance_date', date);
  if (error) throw error;
  const rows = camelRows((data ?? []) as Record<string, unknown>[]);
  return rows.map((row) => {
    const nested = row.routineTemplates;
    const t = nested && typeof nested === 'object' && nested !== null ? (nested as Record<string, unknown>) : null;
    const templateTitle = t && 'title' in t ? String(t.title ?? '') : '';
    const templateCategory = t && 'category' in t ? String(t.category ?? '') : '';
    const { routineTemplates: _rt, ...rest } = row;
    return { ...rest, templateTitle, templateCategory } as RoutineInstanceWithTemplateTitle;
  });
}

export async function getTerminalRoutineInstancesByDate(
  date: string,
): Promise<RoutineInstanceWithTemplateTitle[]> {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('routine_instances')
    .select(
      `
      *,
      routine_templates (
        title,
        category
      )
    `,
    )
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('instance_date', date)
    .in('status', ['completed', 'skipped']);
  if (error) throw error;
  const rows = camelRows((data ?? []) as Record<string, unknown>[]);
  return rows.map((row) => {
    const nested = row.routineTemplates;
    const templateTitle =
      nested && typeof nested === 'object' && nested !== null && 'title' in nested
        ? String((nested as { title: unknown }).title ?? '')
        : '';
    const { routineTemplates: _rt, ...rest } = row;
    return { ...rest, templateTitle } as RoutineInstanceWithTemplateTitle;
  });
}

export async function getInstanceSubtasks(instanceId: string) {
  const { data, error } = await getSupabase()
    .from('routine_instance_subtasks')
    .select('*')
    .eq('routine_instance_id', instanceId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

// ── Instance writes ──────────────────────────────────────

export async function completeInstance(id: string) {
  const now = new Date().toISOString();

  const { error: e1 } = await getSupabase()
    .from('routine_instances')
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
    .from('routine_instance_subtasks')
    .update(
      snakeKeys({
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      }),
    )
    .eq('routine_instance_id', id)
    .eq('is_completed', false);
  if (e2) throw e2;

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_COMPLETED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId as string | undefined,
  });
}

export async function skipInstance(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('routine_instances')
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

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_SKIPPED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId as string | undefined,
  });
}

export async function snoozeInstance(
  id: string,
  untilSession: 'morning' | 'afternoon' | 'evening',
) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('routine_instances')
    .update(
      snakeKeys({
        status: 'snoozed',
        snoozedUntilSession: untilSession,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_SNOOZED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId as string | undefined,
    payloadJson: { untilSession },
  });
}

export async function moveInstance(id: string, toSession: 'morning' | 'afternoon' | 'evening') {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('routine_instances')
    .update(
      snakeKeys({
        effectiveSession: toSession,
        wasMoved: true,
        movedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;

  const instance = await getInstanceById(id);
  await logEvent({
    eventType: EventType.ROUTINE_MOVED,
    entityType: EntityType.ROUTINE_INSTANCE,
    entityId: id,
    userId: instance?.userId as string | undefined,
    payloadJson: { toSession },
  });
}
