import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { Session } from '@/lib/constants';
import { getTerminalActionsForDate } from '@/features/actions/db/action-queries';
import { getTerminalRoutineInstancesByDate } from '@/features/routines/db/routine-queries';
import { actionTabSession, routineTabSession } from '../session-attribution';
import type { Action } from '@/features/actions/types';
import type { RoutineInstanceWithTemplateTitle } from '@/features/routines/types';

export type SessionHistoryEntry = {
  id: string;
  type: 'action' | 'routine_instance';
  title: string;
  outcome: 'completed' | 'skipped';
  sortKey: string;
};

function pushAction(
  a: Action,
  session: Session,
  skipped: SessionHistoryEntry[],
  completed: SessionHistoryEntry[],
) {
  if (actionTabSession(a) !== session) return;
  const title = a.title ?? 'Action';
  if (a.status === 'skipped') {
    skipped.push({
      id: a.id,
      type: 'action',
      title,
      outcome: 'skipped',
      sortKey: a.skippedAt ?? a.updatedAt ?? '',
    });
  } else if (a.status === 'completed') {
    completed.push({
      id: a.id,
      type: 'action',
      title,
      outcome: 'completed',
      sortKey: a.completedAt ?? a.updatedAt ?? '',
    });
  }
}

function pushRoutine(
  ri: RoutineInstanceWithTemplateTitle,
  session: Session,
  skipped: SessionHistoryEntry[],
  completed: SessionHistoryEntry[],
) {
  if (routineTabSession(ri) !== session) return;
  const title = ri.templateTitle || 'Routine';
  if (ri.status === 'skipped') {
    skipped.push({
      id: ri.id,
      type: 'routine_instance',
      title,
      outcome: 'skipped',
      sortKey: ri.skippedAt ?? ri.updatedAt ?? '',
    });
  } else if (ri.status === 'completed') {
    completed.push({
      id: ri.id,
      type: 'routine_instance',
      title,
      outcome: 'completed',
      sortKey: ri.completedAt ?? ri.updatedAt ?? '',
    });
  }
}

async function fetchSessionHistory(
  date: string,
  session: Session,
): Promise<{ skipped: SessionHistoryEntry[]; completed: SessionHistoryEntry[] }> {
  const [actions, routines] = await Promise.all([
    getTerminalActionsForDate(date),
    getTerminalRoutineInstancesByDate(date),
  ]);

  const skipped: SessionHistoryEntry[] = [];
  const completed: SessionHistoryEntry[] = [];

  for (const a of actions) {
    pushAction(a, session, skipped, completed);
  }
  for (const ri of routines) {
    pushRoutine(ri, session, skipped, completed);
  }

  const sortDesc = (x: SessionHistoryEntry, y: SessionHistoryEntry) => y.sortKey.localeCompare(x.sortKey);
  skipped.sort(sortDesc);
  completed.sort(sortDesc);

  return { skipped, completed };
}

export function useNowSessionHistory(date: string, session: Session) {
  return useQuery({
    queryKey: queryKeys.now.sessionHistory(date, session),
    queryFn: () => fetchSessionHistory(date, session),
  });
}
