-- Repair partial installs: tables may exist without sync columns (CREATE IF NOT EXISTS skipped full DDL).
-- Fixes PostgREST PGRST204 for inserts that send sync_status / sync_version.

ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE actions
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE routine_instances
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE routine_instances
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE open_loops
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE open_loops
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE guide_items
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE guide_items
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE strategies
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE strategies
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

ALTER TABLE activity_events
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';

ALTER TABLE momentum_chains
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';
ALTER TABLE momentum_chains
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

NOTIFY pgrst, 'reload schema';
