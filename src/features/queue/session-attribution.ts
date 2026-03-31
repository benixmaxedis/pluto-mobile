import type { Session } from '@/lib/constants';
import { SESSION_ORDER } from '@/lib/constants/sessions';

/**
 * Whether a queue item’s scheduled session should show in the Now list for `viewSession` on the same calendar day.
 * Earlier sessions roll into later ones (morning → afternoon → evening). Later sessions never appear in an earlier view.
 * Does not change dates: only same-day session ordering. Unscheduled (`null`) is excluded here — callers add `|| session === null` if needed.
 */
export function itemScheduledSessionAppearsInView(itemSession: Session | null, viewSession: Session): boolean {
  if (itemSession === null) return false;
  if (itemSession === viewSession) return true;
  const iIdx = SESSION_ORDER.indexOf(itemSession);
  const vIdx = SESSION_ORDER.indexOf(viewSession);
  if (iIdx < 0 || vIdx < 0) return false;
  return iIdx < vIdx;
}

/**
 * Which session tab a routine belongs to: scheduled time unless the user explicitly moved it.
 */
export function routineTabSession(ri: {
  wasMoved?: boolean | null;
  effectiveSession?: string | null;
  scheduledSession?: string | null;
}): Session | null {
  if (ri.wasMoved) {
    return (ri.effectiveSession ?? ri.scheduledSession) as Session | null;
  }
  return ri.scheduledSession as Session | null;
}

/** Actions follow effective scheduling (carry-forward / move). */
export function actionTabSession(a: {
  effectiveSession?: string | null;
  scheduledSession?: string | null;
}): Session | null {
  return (a.effectiveSession ?? a.scheduledSession) as Session | null;
}
