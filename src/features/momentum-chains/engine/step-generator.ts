import type { Session } from '@/lib/constants';
import type { MomentumChainStep } from '../types';

export interface ChainStepContext {
  chainId: string;
  chainName: string;
  steps: MomentumChainStep[];
  completedStepIds: Set<string>;
}

/**
 * Determines the next eligible step in a momentum chain.
 *
 * Only the next incomplete step is surfaced — subsequent steps
 * remain hidden until earlier ones are completed. This keeps
 * the queue clean and focused.
 */
export function getNextEligibleStep(
  context: ChainStepContext,
  currentSession: Session,
): MomentumChainStep | null {
  const sortedSteps = [...context.steps].sort((a, b) => a.orderIndex - b.orderIndex);

  for (const step of sortedSteps) {
    if (context.completedStepIds.has(step.id)) continue;

    // If step has a session constraint, check it
    if (step.defaultSession && step.defaultSession !== currentSession) {
      // Step isn't for this session — but it's the next one, so don't skip ahead
      return null;
    }

    return step;
  }

  // All steps completed
  return null;
}

/**
 * Checks whether a chain step is relevant for the current session
 * based on its default_session and lead_offset_sessions.
 */
export function isStepRelevantForSession(
  step: MomentumChainStep,
  currentSession: Session,
): boolean {
  if (!step.defaultSession) return true;
  return step.defaultSession === currentSession;
}
