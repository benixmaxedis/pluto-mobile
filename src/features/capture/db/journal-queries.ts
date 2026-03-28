import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

export async function getJournalEntry(date: string, type: 'morning' | 'evening') {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .eq('journal_type', type)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getJournalEntriesByDate(date: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function upsertJournalEntry(
  date: string,
  type: 'morning' | 'evening',
  answersJson: Record<string, unknown>,
  userIdParam?: string,
) {
  const userId = userIdParam ?? (await uid());
  const existing = await getJournalEntry(date, type);
  const now = new Date().toISOString();

  if (existing) {
    const patch = snakeKeys({
      answersJson: JSON.stringify(answersJson),
      updatedAt: now,
      syncStatus: 'synced',
    });
    const { error } = await getSupabase().from('journal_entries').update(patch).eq('id', existing.id);
    if (error) throw error;
    return existing.id as string;
  }

  const id = generateId();
  const row = snakeKeys({
    id,
    userId,
    entryDate: date,
    journalType: type,
    session: type === 'morning' ? 'morning' : 'evening',
    answersJson: JSON.stringify(answersJson),
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error } = await getSupabase().from('journal_entries').insert(row);
  if (error) throw error;

  await logEvent({
    eventType: EventType.JOURNAL_COMPLETED,
    entityType: EntityType.JOURNAL,
    entityId: id,
    userId,
    payloadJson: { journalType: type },
  });

  return id;
}
