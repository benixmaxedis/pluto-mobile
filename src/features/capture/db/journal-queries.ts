import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { journalEntries } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';

export async function getJournalEntry(date: string, type: 'morning' | 'evening') {
  const rows = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.entryDate, date), eq(journalEntries.journalType, type)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getJournalEntriesByDate(date: string) {
  return db.select().from(journalEntries).where(eq(journalEntries.entryDate, date));
}

export async function upsertJournalEntry(
  date: string,
  type: 'morning' | 'evening',
  answersJson: Record<string, unknown>,
  userId?: string,
) {
  const existing = await getJournalEntry(date, type);
  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(journalEntries)
      .set({
        answersJson: JSON.stringify(answersJson),
        updatedAt: now,
        syncStatus: 'pending',
      })
      .where(eq(journalEntries.id, existing.id));
    return existing.id;
  }

  const id = generateId();
  await db.insert(journalEntries).values({
    id,
    userId: userId ?? null,
    entryDate: date,
    journalType: type,
    session: type === 'morning' ? 'morning' : 'evening',
    answersJson: JSON.stringify(answersJson),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  await logEvent({
    eventType: EventType.JOURNAL_COMPLETED,
    entityType: EntityType.JOURNAL,
    entityId: id,
    userId,
    payloadJson: { journalType: type },
  });

  return id;
}
