# Data model and GitHub issues

Executable schema lives in [`supabase/migrations/`](../supabase/migrations/). Human-readable specs and acceptance criteria are tracked in **[benixmaxedis/pluto-mobile](https://github.com/benixmaxedis/pluto-mobile)**.

## Schema issues (closed) — table coverage

| Issue | Tables / topic |
|-------|------------------|
| [#26](https://github.com/benixmaxedis/pluto-mobile/issues/26) | `actions`, `action_subtasks` |
| [#30](https://github.com/benixmaxedis/pluto-mobile/issues/30) | `routine_templates`, `routine_subtasks`, `routine_instances`, `routine_instance_subtasks` |
| [#34](https://github.com/benixmaxedis/pluto-mobile/issues/34) | `open_loops`, `guide_items`, `strategies`, `strategy_guide_links` |
| [#43](https://github.com/benixmaxedis/pluto-mobile/issues/43) | `journal_entries`, `chat_messages`, `activity_events`, `app_preferences` (event types, journal JSON shapes) |
| [#73](https://github.com/benixmaxedis/pluto-mobile/issues/73) | `momentum_chains`, `momentum_chain_steps` |

When changing columns or adding tables, open a PR that updates the migration file and references these issues (e.g. “Refs #30”) where relevant.

## Working with issues (GitHub CLI)

```bash
gh issue list --repo benixmaxedis/pluto-mobile --state open
gh issue view <N> --repo benixmaxedis/pluto-mobile
```

Use **Fixes #N** / **Refs #N** in PR descriptions so work stays linked.

## Git remote

This codebase is intended to push to **`benixmaxedis/pluto-mobile`**. Confirm with:

```bash
git remote -v
```

`origin` should point at `https://github.com/benixmaxedis/pluto-mobile.git` (or the SSH equivalent).
