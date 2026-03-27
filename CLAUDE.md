# Pluto Mobile — Project Conventions

## Stack
- Expo SDK 55, React Native 0.83, TypeScript (strict)
- Expo Router (file-based routing, bottom tabs)
- Zustand (UI state), TanStack Query (data cache), Drizzle ORM + SQLite (persistence)
- NativeWind + Tailwind for styling, theme tokens in src/lib/theme/
- Zod for validation, React Hook Form for forms
- @gorhom/bottom-sheet for sheets/modals

## Architecture
- Local-first: SQLite is source of truth, background sync to Neon Postgres
- Feature-based folder structure under src/features/
- Queue-driven: Now page shows focus card from deterministic queue
- Session-based scheduling: morning (6-12), afternoon (12-18), evening (18-22)

## Conventions
- Path aliases: @/* -> src/*, @/components/*, @/lib/*, @/features/*
- Client-side UUIDs via crypto.randomUUID()
- All DB writes must also write activity_events for auditable actions
- Mutations via TanStack Query useMutation, invalidate relevant queries on success
- Prefer bottom sheets over full-page navigation for create/edit flows
- Dark theme only, use theme tokens not raw color values

## Commands
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm test` — Jest tests
- `npm run db:generate` — Generate Drizzle migrations
- `npm start` — Start Expo dev server
