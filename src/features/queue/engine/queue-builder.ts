import type { Session } from '@/lib/constants';

export interface QueueItem {
  id: string;
  type: 'action' | 'routine_instance';
  title: string;
  session: Session | null;
  priority: 'normal' | 'high';
  status: string;
  isOverdue: boolean;
  carryForwardCount: number;
  sortOrder: number;
  createdAt: string;
}

export function buildQueue(
  date: string,
  session: Session,
  actions: QueueItem[],
  routineInstances: QueueItem[],
): QueueItem[] {
  const allItems = [...actions, ...routineInstances].filter((i) => i.status === 'pending');

  return allItems.sort((a, b) => {
    const scoreA = getItemScore(a, session);
    const scoreB = getItemScore(b, session);

    if (scoreA !== scoreB) return scoreB - scoreA;

    // Carried-forward items first within same tier
    if (a.carryForwardCount !== b.carryForwardCount) {
      return b.carryForwardCount - a.carryForwardCount;
    }

    // Then by manual sort order
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;

    // Then by creation date
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function getItemScore(item: QueueItem, currentSession: Session): number {
  const isHighPriority = item.priority === 'high';
  const isCurrentSession = item.session === currentSession || item.session === null;

  // 1. Overdue high-priority actions
  if (item.isOverdue && isHighPriority && item.type === 'action') return 100;

  // 2. High-priority actions for current session
  if (isHighPriority && isCurrentSession && item.type === 'action') return 80;

  // 3. Overdue normal-priority actions
  if (item.isOverdue && item.type === 'action') return 60;

  // 4. Routine instances for current session
  if (item.type === 'routine_instance' && isCurrentSession) return 40;

  // 5. Normal-priority actions for current session
  if (item.type === 'action' && isCurrentSession) return 20;

  return 0;
}
