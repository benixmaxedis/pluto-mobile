/**
 * Data now lives in Supabase Postgres; there is no separate “push local SQLite” step.
 * Keep this module for callers (e.g. sync-engine) — it is a no-op.
 */
interface PushResult {
  pushed: number;
}

export async function pushPendingChanges(): Promise<PushResult> {
  return { pushed: 0 };
}
