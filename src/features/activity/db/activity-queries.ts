import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { activityEvents } from '@/lib/db/schema';
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
  await db.insert(activityEvents).values({
    id: generateId(),
    userId: params.userId ?? null,
    eventType: params.eventType,
    entityType: params.entityType,
    entityId: params.entityId,
    eventDate: toISODate(now),
    eventSession: getSessionForHour(now.getHours()),
    payloadJson: params.payloadJson ? JSON.stringify(params.payloadJson) : null,
    createdAt: now.toISOString(),
  });
}

export async function getEventsByDate(date: string, limit = 50) {
  return db
    .select()
    .from(activityEvents)
    .where(eq(activityEvents.eventDate, date))
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit);
}

export async function getEventsByDateRange(startDate: string, endDate: string, limit = 100) {
  return db
    .select()
    .from(activityEvents)
    .where(
      and(gte(activityEvents.eventDate, startDate), lte(activityEvents.eventDate, endDate)),
    )
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit);
}

export async function getEventsForEntity(entityType: string, entityId: string, limit = 20) {
  return db
    .select()
    .from(activityEvents)
    .where(
      and(eq(activityEvents.entityType, entityType), eq(activityEvents.entityId, entityId)),
    )
    .orderBy(desc(activityEvents.createdAt))
    .limit(limit);
}
