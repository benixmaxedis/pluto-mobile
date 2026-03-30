import type { Session } from '@/lib/constants';

export type QueueItemType = 'action' | 'routine_instance' | 'journal_morning' | 'journal_evening';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  title: string;
  session: Session | null;
  priority: 'normal' | 'high';
  status: string;
  isOverdue: boolean;
  carryForwardCount: number;
  sortOrder: number;
  createdAt: string;
  actionKind?: 'normal' | 'chain_generated';
  /** For routine_instance items: the parent template ID (needed to open the edit form) */
  templateId?: string;
  /** For routine_instance items: the template category (drives the icon in the timeline). */
  routineCategory?: string;
  /** For action items: subtask completion progress. */
  subtaskProgress?: { total: number; completed: number };
}

/**
 * Builds the deterministic queue for the Now page.
 *
 * Priority order:
 * 1. Overdue actions (high priority first)
 * 2. High-priority actions for current session
 * 3. Chain-generated setup steps for current session
 * 4. Scheduled actions for current session
 * 5. Routine instances for current session
 * 6. Optional pulled-forward items
 *
 * Chain-generated steps are elevated above normal scheduled actions
 * because they reduce friction for important outcomes (sleep, nutrition, exercise).
 * Only the next relevant step per chain should be in the input — the step
 * generator handles sequencing.
 */
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
  const isChainGenerated = item.actionKind === 'chain_generated';

  // 1. Overdue high-priority actions
  if (item.isOverdue && isHighPriority && item.type === 'action') return 120;

  // 2. Overdue normal-priority actions
  if (item.isOverdue && item.type === 'action') return 100;

  // 3. High-priority actions for current session
  if (isHighPriority && isCurrentSession && item.type === 'action') return 80;

  // 4. Chain-generated setup steps for current session
  if (isChainGenerated && isCurrentSession && item.type === 'action') return 65;

  // 5. Normal-priority scheduled actions for current session
  if (item.type === 'action' && isCurrentSession && !isChainGenerated) return 40;

  // 6. Routine instances for current session
  if (item.type === 'routine_instance' && isCurrentSession) return 20;

  // Everything else (wrong session, etc.)
  return 0;
}
