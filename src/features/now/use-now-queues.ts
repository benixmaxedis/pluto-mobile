import { useMemo } from 'react';
import { Session } from '@/lib/constants';
import { useQueueForSession } from '@/features/queue/hooks/useQueue';
import { mergeJournalPromptsIntoSessionQueue } from '@/features/queue/journal-queue';
import { itemScheduledSessionAppearsInView } from '@/features/queue/session-attribution';
import type { QueueItem } from '@/features/queue/engine/queue-builder';

export type NowSessionFilter = Session | 'all';

function mergeForSession(
  data: QueueItem[] | undefined,
  date: string,
  session: Session,
  today: string,
  hasMorningJournal: boolean,
  hasEveningJournal: boolean,
): QueueItem[] {
  const all = data ?? [];
  const filtered = all.filter((item) => itemScheduledSessionAppearsInView(item.session, session));
  return mergeJournalPromptsIntoSessionQueue(filtered, date, session, {
    today,
    hasMorningJournal,
    hasEveningJournal,
  });
}

export function useNowQueues(
  date: string,
  today: string,
  hasMorningJournal: boolean,
  hasEveningJournal: boolean,
) {
  const qM = useQueueForSession(date, Session.MORNING);
  const qA = useQueueForSession(date, Session.AFTERNOON);
  const qE = useQueueForSession(date, Session.EVENING);

  const morning = useMemo(
    () => mergeForSession(qM.data, date, Session.MORNING, today, hasMorningJournal, hasEveningJournal),
    [qM.data, date, today, hasMorningJournal, hasEveningJournal],
  );
  const afternoon = useMemo(
    () =>
      mergeForSession(qA.data, date, Session.AFTERNOON, today, hasMorningJournal, hasEveningJournal),
    [qA.data, date, today, hasMorningJournal, hasEveningJournal],
  );
  const evening = useMemo(
    () => mergeForSession(qE.data, date, Session.EVENING, today, hasMorningJournal, hasEveningJournal),
    [qE.data, date, today, hasMorningJournal, hasEveningJournal],
  );

  const allSessions = useMemo(() => {
    const merged = [...morning, ...afternoon, ...evening];
    const seen = new Set<string>();
    const out: QueueItem[] = [];
    for (const item of merged) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
    return out;
  }, [morning, afternoon, evening]);

  const isFetching = qM.isFetching || qA.isFetching || qE.isFetching;

  return { morning, afternoon, evening, allSessions, isFetching };
}

export function pickQueueForFilter(
  filter: NowSessionFilter,
  morning: QueueItem[],
  afternoon: QueueItem[],
  evening: QueueItem[],
  allSessions: QueueItem[],
): QueueItem[] {
  if (filter === 'all') return allSessions;
  if (filter === Session.MORNING) return morning;
  if (filter === Session.AFTERNOON) return afternoon;
  return evening;
}
