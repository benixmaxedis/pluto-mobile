# Pluto

**Momentum and regulation for ADHD / AuDHD.**

Pluto is not a task manager. It is a momentum tool that reduces decision load, gently handles missed items, and presents the next sensible thing to do.

Core question: **"What is the next thing I can do right now?"**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 55, React Native 0.83 |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based, bottom tabs) |
| State | Zustand (UI), TanStack Query (cache/mutations) |
| Database | Drizzle ORM + Expo SQLite (local-first) |
| Backend | Vercel API, Neon Postgres |
| Styling | NativeWind + Tailwind, theme tokens |
| Forms | React Hook Form + Zod |
| Animations | React Native Reanimated |
| Gestures | React Native Gesture Handler |
| Sheets | @gorhom/bottom-sheet |
| AI | OpenAI integration via Pluto assistant |

## Architecture

### Local-First

SQLite is the primary data source for all UI rendering. Data syncs to Neon Postgres in the background. The app works fully offline.

### State Ownership

| Layer | Owns |
|-------|------|
| **Zustand** | Ephemeral UI state (selected date, current session, active sheet, tabs) |
| **TanStack Query** | Data cache + mutations over SQLite reads/writes |
| **SQLite (Drizzle)** | All persistent domain data |
| **SecureStore** | Auth tokens |
| **Neon Postgres** | Remote sync mirror, user accounts |

### Queue-Driven

The app is queue-driven, not list-driven. A deterministic queue powers the Now page focus card.

**Queue priority order:**
1. Overdue high-priority actions
2. High-priority actions for current session
3. Overdue normal-priority actions
4. Routine instances for current session
5. Normal-priority actions for current session

### Sessions (not exact times)

| Session | Hours |
|---------|-------|
| Morning | 6:00 AM – 12:00 PM |
| Afternoon | 12:00 PM – 6:00 PM |
| Evening | 6:00 PM – 10:00 PM |

Sessions are broad guidance windows, not rigid schedules.

## Navigation

**Bottom tabs:** Now, Actions, Routines, Capture, Guide

**Secondary routes** (via hamburger menu): Activity, Pluto AI, Account, Settings

## Folder Structure

```
src/
├── app/                    # Expo Router pages
│   ├── (auth)/             # Sign in / sign up
│   └── (app)/              # Main app (bottom tabs + secondary)
├── components/
│   ├── ui/                 # Reusable primitives (Card, Button, etc.)
│   ├── cards/              # Domain-specific cards
│   ├── sheets/             # Bottom sheet flows
│   └── forms/              # React Hook Form forms
├── features/               # Feature modules
│   ├── actions/            # hooks/, db/, types.ts
│   ├── routines/
│   ├── queue/              # engine/ (queue-builder, carry-forward, session-resolver)
│   ├── capture/
│   ├── guide/
│   ├── activity/
│   ├── pluto/
│   ├── auth/
│   └── onboarding/
├── lib/
│   ├── db/schema/          # Drizzle ORM schema (one file per domain)
│   ├── sync/               # Background sync engine
│   ├── api/                # HTTP client
│   ├── theme/              # Colors, spacing, typography, shadows, animations
│   ├── constants/          # Enums, session config
│   ├── validation/         # Zod schemas
│   └── utils/              # Date, ID helpers
├── store/                  # Zustand stores
└── test/                   # Test setup and helpers
```

## Data Model

14 SQLite tables via Drizzle ORM:

- **actions** / **action_subtasks** — Completable tasks with scheduling, priority, carry-forward
- **routine_templates** / **routine_subtasks** — Recurring patterns with recurrence rules
- **routine_instances** / **routine_instance_subtasks** — Generated occurrences (14-30 day window)
- **open_loops** — Ultra-fast thought capture, convertible to other entities
- **guide_items** — Personal code (identity, beliefs, values, etc.)
- **strategies** / **strategy_guide_links** — Situational playbooks linked to guide items
- **journal_entries** — 5 Minute Journal (morning/evening)
- **activity_events** — Append-only event log for all state transitions
- **chat_messages** — Pluto AI conversation history
- **app_preferences** — User settings

## Key Behaviors

### Missed Actions
Automatically carried forward to the current session. No manual cleanup required.

### Missed Routines
Remain available for the rest of the day. Disappear after day ends. No guilt-heavy backlog.

### Activity Events
Every state transition (complete, skip, snooze, move, carry-forward) writes an event to the append-only log.

## Commands

```bash
npm start          # Start Expo dev server
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm test           # Jest tests
npm run db:generate # Generate Drizzle migrations
```

## Design

Dark theme only. Feature colors:

- **Actions** → Purple (#A78BFA)
- **Routines** → Teal (#2DD4BF)
- **Capture** → Blue (#60A5FA)
- **Guide** → Yellow (#FBBF24)
- **Strategies** → Orange (#FB923C)
- **Gradient** → Purple to Teal

Brand personality: calm, clever, slightly playful. Subtle Cheshire Cat energy.
