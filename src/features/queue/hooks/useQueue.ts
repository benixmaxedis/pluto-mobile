import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useAppStore } from '@/store/app-store';
import { buildQueue, type QueueItem } from '../engine/queue-builder';
import { getActionsForQueue } from '@/features/actions/db/action-queries';
import { getPendingInstancesByDate } from '@/features/routines/db/routine-queries';
import type { Session } from '@/lib/constants';
import { actionTabSession, routineTabSession } from '../session-attribution';

async function fetchQueue(date: string, session: Session): Promise<QueueItem[]> {
  const [rawActions, rawInstances] = await Promise.all([
    getActionsForQueue(date),
    getPendingInstancesByDate(date),
  ]);

  const actionItems: QueueItem[] = rawActions.map((a) => ({
    id: a.id,
    type: 'action' as const,
    title: a.title,
    session: actionTabSession(a),
    priority: (a.priority ?? 'normal') as 'normal' | 'high',
    status: a.status ?? 'pending',
    isOverdue: !!a.effectiveDate && a.effectiveDate < date,
    carryForwardCount: a.carryForwardCount ?? 0,
    sortOrder: a.sortOrder ?? 0,
    createdAt: a.createdAt,
    actionKind: (a.actionKind ?? 'normal') as 'normal' | 'chain_generated',
  }));

  const instanceItems: QueueItem[] = rawInstances.map((ri) => ({
    id: ri.id,
    type: 'routine_instance' as const,
    title: ri.templateTitle || 'Routine',
    session: routineTabSession(ri),
    priority: 'normal' as const,
    status: ri.status ?? 'pending',
    isOverdue: false, // Routine instances don't carry forward
    carryForwardCount: 0,
    sortOrder: ri.sortOrder ?? 0,
    createdAt: ri.createdAt,
  }));

  return buildQueue(date, session, actionItems, instanceItems);
}

export function useQueue() {
  const { selectedDate, currentSession } = useAppStore();

  return useQuery({
    queryKey: queryKeys.queue.forSession(selectedDate, currentSession),
    queryFn: () => fetchQueue(selectedDate, currentSession),
  });
}

export function useQueueForSession(date: string, session: Session) {
  return useQuery({
    queryKey: queryKeys.queue.forSession(date, session),
    queryFn: () => fetchQueue(date, session),
  });
}

export function useFocusItem() {
  const queue = useQueue();
  return {
    ...queue,
    data: queue.data?.[0] ?? null,
  };
}

export function useQueuePreview(count = 5) {
  const queue = useQueue();
  return {
    ...queue,
    data: queue.data?.slice(1, count + 1) ?? [],
  };
}

