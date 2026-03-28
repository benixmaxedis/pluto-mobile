-- Repair: routine_templates created without sync columns (e.g. partial or pre-migration table).
-- PostgREST PGRST204 if these are missing while the client sends sync_status / sync_version.

ALTER TABLE routine_templates
  ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';

ALTER TABLE routine_templates
  ADD COLUMN IF NOT EXISTS sync_version integer DEFAULT 0;

NOTIFY pgrst, 'reload schema';
