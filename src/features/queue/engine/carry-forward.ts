import type { Session } from '@/lib/constants';

export interface CarryForwardAction {
  id: string;
  effectiveDate: string | null;
  effectiveSession: Session | null;
  status: string;
  carryForwardCount: number;
}

export interface CarryForwardResult {
  actionId: string;
  updates: {
    effectiveDate: string;
    effectiveSession: Session;
    carryForwardCount: number;
    lastAutoMovedAt: string;
  };
}

export function computeCarryForwards(
  actions: CarryForwardAction[],
  today: string,
  currentSession: Session,
): CarryForwardResult[] {
  const results: CarryForwardResult[] = [];

  for (const action of actions) {
    if (action.status !== 'pending') continue;
    if (!action.effectiveDate) continue;
    if (action.effectiveDate >= today) continue;

    results.push({
      actionId: action.id,
      updates: {
        effectiveDate: today,
        effectiveSession: currentSession,
        carryForwardCount: action.carryForwardCount + 1,
        lastAutoMovedAt: new Date().toISOString(),
      },
    });
  }

  return results;
}
