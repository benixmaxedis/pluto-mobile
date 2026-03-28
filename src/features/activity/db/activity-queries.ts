import { getSupabase } from '@/lib/supabase/client';
import { getOptionalUserId, getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { toISODate } from '@/lib/utils/date';
import type { EventType, EntityType, Session } from '@/lib/constants';
import { getSessionForHour } from '@/lib/constants/sessions';

interface LogEventParams {
  eventType: EventType;
  entityType: EntityType;
  entityId: string;
  userId?: string;
  payloadJson?: Record<string, unknown>;
}

export async function logEvent(params: LogEventParams): Promise<void> {
  const now = new Date();
  const uid = params.userId ?? (await getOptionalUserId());
  const row = snakeKeys({
    id: generateId(),
    userId: uid,
    eventType: params.eventType,
    entityType: params.entityType,
    entityId: params.entityId,
    eventDate: toISODate(now),
    eventSession: getSessionForHour(now.getHours()) as Session,
    payloadJson: params.payloadJson ? JSON.stringify(params.payloadJson) : null,
    createdAt: now.toISOString(),
    syncStatus: 'synced',
  });
  const { error } = await getSupabase().from('activity_events').insert(row);
  if (error) throw error;
}

export async function getEventsByDate(date: string, limit = 50) {
  const userId = await getCurrentUserId();
  const { data, error } = await getSupabase()
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .eq('event_date', date)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getEventsByDateRange(startDate: string, endDate: string, limit = 100) {
  const userId = await getCurrentUserId();
  const { data, error } = await getSupabase()
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getEventsForEntity(entityType: string, entityId: string, limit = 20) {
  const userId = await getCurrentUserId();
  const { data, error } = await getSupabase()
    .from('activity_events')
    .select('*')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}
