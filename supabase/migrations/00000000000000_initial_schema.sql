-- Run in Supabase SQL editor or via Supabase CLI.
-- Enable RLS and add policies before production (see README in supabase/).

CREATE TABLE IF NOT EXISTS actions (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  notes text,
  scheduled_date text,
  scheduled_session text,
  effective_date text,
  effective_session text,
  priority text DEFAULT 'normal',
  status text DEFAULT 'pending',
  is_held boolean DEFAULT false,
  completed_at text,
  skipped_at text,
  snoozed_until_date text,
  snoozed_until_session text,
  carry_forward_count integer DEFAULT 0,
  last_auto_moved_at text,
  original_session_for_day text,
  source_open_loop_id text,
  source_pluto_draft_id text,
  momentum_chain_id text,
  momentum_chain_step_id text,
  action_kind text DEFAULT 'normal',
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE TABLE IF NOT EXISTS action_subtasks (
  id text PRIMARY KEY,
  action_id text NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at text,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS routine_templates (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  notes text,
  default_session text,
  is_active boolean DEFAULT true,
  recurrence_type text NOT NULL,
  recurrence_days_json text,
  recurrence_anchor_date text,
  source_open_loop_id text,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE TABLE IF NOT EXISTS routine_subtasks (
  id text PRIMARY KEY,
  routine_template_id text NOT NULL REFERENCES routine_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS routine_instances (
  id text PRIMARY KEY,
  routine_template_id text NOT NULL REFERENCES routine_templates(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  instance_date text NOT NULL,
  scheduled_session text,
  effective_session text,
  status text DEFAULT 'pending',
  completed_at text,
  skipped_at text,
  snoozed_until_session text,
  was_moved boolean DEFAULT false,
  moved_at text,
  source_generation_key text,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE UNIQUE INDEX IF NOT EXISTS routine_instances_gen_key_idx ON routine_instances (source_generation_key)
  WHERE source_generation_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS routine_instance_subtasks (
  id text PRIMARY KEY,
  routine_instance_id text NOT NULL REFERENCES routine_instances(id) ON DELETE CASCADE,
  template_subtask_id text REFERENCES routine_subtasks(id),
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  completed_at text,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS open_loops (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  category text,
  title text NOT NULL,
  body text,
  status text DEFAULT 'active',
  converted_to_type text,
  converted_to_id text,
  archived_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guide_items (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  statement text,
  meaning text,
  example_application text,
  tags_json text,
  source_open_loop_id text,
  sort_order integer DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE TABLE IF NOT EXISTS strategies (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  trigger_text text,
  context_text text,
  response_steps_markdown text,
  why_it_matters text,
  example_text text,
  tags_json text,
  source_open_loop_id text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE TABLE IF NOT EXISTS strategy_guide_links (
  id text PRIMARY KEY,
  strategy_id text NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  guide_item_id text NOT NULL REFERENCES guide_items(id) ON DELETE CASCADE,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  entry_date text NOT NULL,
  journal_type text NOT NULL,
  session text,
  answers_json text,
  summary_text text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_user_date_type_idx
  ON journal_entries (user_id, entry_date, journal_type);

CREATE TABLE IF NOT EXISTS activity_events (
  id text PRIMARY KEY,
  user_id text,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  event_date text,
  event_session text,
  payload_json text,
  created_at text NOT NULL,
  sync_status text DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS app_preferences (
  user_id text PRIMARY KEY,
  current_theme text DEFAULT 'dark',
  reduced_motion_enabled boolean DEFAULT false,
  haptics_enabled boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS momentum_chains (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL,
  domain text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by text DEFAULT 'user',
  created_at text NOT NULL,
  updated_at text NOT NULL,
  sync_status text DEFAULT 'synced',
  sync_version integer DEFAULT 0,
  deleted_at text
);

CREATE TABLE IF NOT EXISTS momentum_chain_steps (
  id text PRIMARY KEY,
  chain_id text NOT NULL REFERENCES momentum_chains(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  default_session text,
  lead_offset_sessions integer,
  step_type text DEFAULT 'setup',
  order_index integer NOT NULL DEFAULT 0,
  is_optional boolean DEFAULT false,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS actions_user_deleted_idx ON actions (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS routine_templates_user_deleted_idx ON routine_templates (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS routine_instances_user_date_idx ON routine_instances (user_id, instance_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS activity_events_user_created_idx ON activity_events (user_id, created_at DESC);
