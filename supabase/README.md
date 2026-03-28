# Supabase (Postgres)

**Data model notes:** Column-level specs and historical acceptance criteria are documented in GitHub issues [#26](https://github.com/benixmaxedis/pluto-mobile/issues/26), [#30](https://github.com/benixmaxedis/pluto-mobile/issues/30), [#34](https://github.com/benixmaxedis/pluto-mobile/issues/34), [#43](https://github.com/benixmaxedis/pluto-mobile/issues/43), and [#73](https://github.com/benixmaxedis/pluto-mobile/issues/73). See also [docs/DATA_MODEL.md](../docs/DATA_MODEL.md) for a table index and `gh` workflow.

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema (pick **one**):
   - **CLI (recommended):** see [CLI workflow](#cli-workflow) below (`npm run db:link` then `npm run db:push`).
   - **Dashboard:** In **SQL Editor**, paste and run the entire file `migrations/00000000000000_initial_schema.sql`. If you skip schema setup, `GET /rest/v1/routine_templates` (and other resources) returns **404** because the tables do not exist yet.
3. Copy **Project URL** and the **publishable** key (`sb_publishable_…`, or legacy **anon** JWT) into `.env` (see [.env.example](../.env.example)):
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (recommended) or `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## CLI workflow

Prerequisites: [Supabase CLI](https://supabase.com/docs/guides/cli) is installed as a dev dependency (`supabase` in `package.json`). From the repo root:

1. `npm install` (if you have not already).
2. `npm run db:link` — enter your **project ref** (from the URL `https://<ref>.supabase.co`) and the **database password** from **Project Settings → Database** (this is not the anon/publishable API key). This writes `supabase/.temp/project-ref` and related link state locally.
3. `npm run db:push` — applies everything under `supabase/migrations/` to the linked remote database.

If `db:push` reports no changes but tables are still missing, the migration may already be recorded; use the SQL Editor to verify tables, or inspect migration history in the dashboard.

### Link + push without prompts (PowerShell)

Use the **database password** from **Project Settings → Database** (not the publishable/anon API key). Replace the ref if your project URL differs.

```powershell
cd c:\repos\pluto-app
$env:SUPABASE_DB_PASSWORD = '<paste-database-password>'
npx supabase link --project-ref kawbuabfwtdnhhmbdtrz -p $env:SUPABASE_DB_PASSWORD --yes
npm run db:push
```

After a successful link, `npm run db:push` alone is usually enough for future migrations.

### Repair migration: `routine_templates.sync_status`

If inserts fail with PostgREST **PGRST204** / *Could not find the `sync_status` column*, apply pending migrations (includes `migrations/20260328060700_routine_templates_sync_columns.sql`) via `db:push` or run that file in the SQL Editor.

## Identity (no Supabase Auth)

The app does **not** use Supabase Auth (GoTrue). Each install gets a random **`user_id`** stored in device secure storage and sent on every query. Email/password and confirmation links are not used.

**Security note:** With the **anon / publishable** key in the client, anyone who has the key can call the API. Until you add a backend or custom JWTs, keep **RLS off** (as in the initial migration) or add policies that match your threat model—`auth.uid()`-based policies will **not** apply to these requests because there is no logged-in Supabase user.

Before production, decide on RLS plus either a trusted backend (service role), signed JWTs, or another auth provider—and scope rows accordingly.
