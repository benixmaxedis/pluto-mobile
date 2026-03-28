import { useMemo } from 'react';
import { Session } from '@/lib/constants';
import { useNowSessionHistory, type SessionHistoryEntry } from '@/features/queue/hooks/useNowSessionHistory';
import type { NowSessionFilter } from './use-now-queues';

function mergeHistory(
  parts: { skipped: SessionHistoryEntry[]; completed: SessionHistoryEntry[] }[],
): { skipped: SessionHistoryEntry[]; completed: SessionHistoryEntry[] } {
  const skipped = parts.flatMap((p) => p.skipped);
  const completed = parts.flatMap((p) => p.completed);
  const sortDesc = (a: SessionHistoryEntry, b: SessionHistoryEntry) =>
    b.sortKey.localeCompare(a.sortKey);
  skipped.sort(sortDesc);
  completed.sort(sortDesc);
  return { skipped, completed };
}

export function useMergedNowHistory(date: string, filter: NowSessionFilter) {
  const hM = useNowSessionHistory(date, Session.MORNING);
  const hA = useNowSessionHistory(date, Session.AFTERNOON);
  const hE = useNowSessionHistory(date, Session.EVENING);

  const data = useMemo(() => {
    if (filter === 'all') {
      const m = hM.data ?? { skipped: [], completed: [] };
      const a = hA.data ?? { skipped: [], completed: [] };
      const e = hE.data ?? { skipped: [], completed: [] };
      return mergeHistory([m, a, e]);
    }
    if (filter === Session.MORNING) return hM.data ?? { skipped: [], completed: [] };
    if (filter === Session.AFTERNOON) return hA.data ?? { skipped: [], completed: [] };
    return hE.data ?? { skipped: [], completed: [] };
  }, [filter, hM.data, hA.data, hE.data]);

  const isFetched =
    filter === 'all'
      ? hM.isFetched && hA.isFetched && hE.isFetched
      : filter === Session.MORNING
        ? hM.isFetched
        : filter === Session.AFTERNOON
          ? hA.isFetched
          : hE.isFetched;

  return { ...data, isFetched };
}
