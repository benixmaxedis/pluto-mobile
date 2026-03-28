import type { Session } from '@/lib/constants';

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
