import type { SyncResult } from './types';
import { pushPendingChanges } from './push-sync';
import { pullRemoteChanges } from './pull-sync';

/**
 * Run a full sync cycle: push local changes, then pull remote changes.
 */
export async function runSync(since?: string): Promise<SyncResult> {
  const pushResult = await pushPendingChanges();
  const pullResult = await pullRemoteChanges(since ?? new Date(0).toISOString());

  return {
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    conflicts: 0,
  };
}

export { pushPendingChanges } from './push-sync';
export { pullRemoteChanges } from './pull-sync';
