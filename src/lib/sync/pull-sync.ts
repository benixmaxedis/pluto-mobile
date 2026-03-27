interface PullResult {
  pulled: number;
}

/**
 * Fetch changes from the backend that occurred after `since` and
 * upsert them into the local database.
 *
 * For v1 this is a placeholder — no real API calls are made.
 */
export async function pullRemoteChanges(since: string): Promise<PullResult> {
  // TODO: GET /api/sync/pull?since=<since>
  // The response would contain rows grouped by table.
  // For each table, upsert rows using INSERT ... ON CONFLICT.

  console.log(`[sync/pull] Would pull remote changes since ${since}`);

  // Placeholder: nothing pulled yet
  return { pulled: 0 };
}
