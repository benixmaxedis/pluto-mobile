# Pluto Mobile — Project Conventions

## Stack
- Expo SDK 55, React Native 0.83, TypeScript (strict)
- Expo Router (file-based routing, bottom tabs)
- Zustand (UI state), TanStack Query (data cache), Drizzle ORM + SQLite (persistence)
- NativeWind + Tailwind for styling, theme tokens in src/lib/theme/ (Plus Jakarta Sans + Michroma display via @expo-google-fonts)
- Zod for validation, React Hook Form for forms
- @gorhom/bottom-sheet for sheets/modals

## Architecture
- Local-first: SQLite is source of truth, background sync to Neon Postgres
- Feature-based folder structure under src/features/
- Queue-driven: Now page shows focus card from deterministic queue
- Session-based scheduling: morning (6-12), afternoon (12-18), evening (18-22)
- Momentum Chains: lightweight step sequences that reduce friction for sleep/nutrition/exercise outcomes

## Momentum Chains
- Chains are templates; steps generate normal actions in the queue
- Only the next incomplete step is surfaced — no flooding
- Chain-generated actions have actionKind='chain_generated' and get priority tier 4 (above normal actions, below high-priority)
- Chains are optional, few in number, easy to enable/disable
- Domains: sleep, nutrition, exercise
- Step types: setup, execution, wind_down

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
