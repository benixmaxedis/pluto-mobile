import { Session } from '@/lib/constants';
import type { QueueItem } from './engine/queue-builder';

export function mergeJournalPromptsIntoSessionQueue(
  sessionFilteredItems: QueueItem[],
  date: string,
  session: import('@/lib/constants').Session,
  opts: {
    today: string;
    hasMorningJournal: boolean;
    hasEveningJournal: boolean;
  },
): QueueItem[] {
  if (date !== opts.today) return sessionFilteredItems;

  const morning: QueueItem = {
    id: `journal-morning-${date}`,
    type: 'journal_morning',
    title: 'Morning journal',
    session: Session.MORNING,
    priority: 'normal',
    status: 'pending',
    isOverdue: false,
    carryForwardCount: 0,
    sortOrder: -999,
    createdAt: '0000-01-01T00:00:00.000Z',
  };

  const evening: QueueItem = {
    id: `journal-evening-${date}`,
    type: 'journal_evening',
    title: 'Evening journal',
    session: Session.EVENING,
    priority: 'normal',
    status: 'pending',
    isOverdue: false,
    carryForwardCount: 0,
    sortOrder: 999_999,
    createdAt: '9999-12-31T23:59:59.999Z',
  };

  let items = [...sessionFilteredItems];

  if (session === Session.MORNING && !opts.hasMorningJournal) {
    if (!items.some((i) => i.id === morning.id)) {
      items = [morning, ...items];
    }
  }

  if (session === Session.EVENING && !opts.hasEveningJournal) {
    if (!items.some((i) => i.id === evening.id)) {
      items = [...items, evening];
    }
  }

  return items;
}

export function isJournalQueueItem(item: QueueItem): boolean {
  return item.type === 'journal_morning' || item.type === 'journal_evening';
}
