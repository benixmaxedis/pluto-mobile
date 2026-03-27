// ── Sessions ──────────────────────────────────────────────

export const Session = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
} as const;
export type Session = (typeof Session)[keyof typeof Session];

export const SESSION_HOURS = {
  [Session.MORNING]: { start: 6, end: 12 },
  [Session.AFTERNOON]: { start: 12, end: 18 },
  [Session.EVENING]: { start: 18, end: 22 },
} as const;

// ── Item status ──────────────────────────────────────────

export const ItemStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  SNOOZED: 'snoozed',
} as const;
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

// ── Priority ─────────────────────────────────────────────

export const Priority = {
  NORMAL: 'normal',
  HIGH: 'high',
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

// ── Action date-range tabs (derived, not stored) ─────────

export const ActionTab = {
  OVERDUE: 'overdue',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'this_week',
  NEXT_WEEK: 'next_week',
  THIS_MONTH: 'this_month',
  FUTURE: 'future',
  HOLD: 'hold',
  NOT_SCHEDULED: 'not_scheduled',
} as const;
export type ActionTab = (typeof ActionTab)[keyof typeof ActionTab];

// ── Life categories (routines, open loops, strategies) ───

export const LifeCategory = {
  SLEEP: 'sleep',
  HEALTH: 'health',
  HOME: 'home',
  WORK: 'work',
  FINANCE: 'finance',
  SELF_CARE: 'self_care',
  SOCIAL: 'social',
  LEARNING: 'learning',
  FAMILY: 'family',
  OTHER: 'other',
} as const;
export type LifeCategory = (typeof LifeCategory)[keyof typeof LifeCategory];

// ── Guide categories ─────────────────────────────────────

export const GuideCategory = {
  IDENTITY: 'identity',
  BELIEFS: 'beliefs',
  NEEDS: 'needs',
  VALUES: 'values',
  STANDARDS: 'standards',
  BOUNDARIES: 'boundaries',
  PRINCIPLES: 'principles',
} as const;
export type GuideCategory = (typeof GuideCategory)[keyof typeof GuideCategory];

// ── Recurrence ───────────────────────────────────────────

export const RecurrenceType = {
  WEEKLY: 'weekly',
  FORTNIGHTLY: 'fortnightly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually',
} as const;
export type RecurrenceType = (typeof RecurrenceType)[keyof typeof RecurrenceType];

export const DayOfWeek = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

// ── Activity event types ─────────────────────────────────

export const EventType = {
  ACTION_CREATED: 'action_created',
  ACTION_COMPLETED: 'action_completed',
  ACTION_SKIPPED: 'action_skipped',
  ACTION_SNOOZED: 'action_snoozed',
  ACTION_AUTO_CARRIED_FORWARD: 'action_auto_carried_forward',
  ACTION_MOVED: 'action_moved',
  ROUTINE_COMPLETED: 'routine_completed',
  ROUTINE_SKIPPED: 'routine_skipped',
  ROUTINE_SNOOZED: 'routine_snoozed',
  ROUTINE_MOVED: 'routine_moved',
  OPEN_LOOP_CREATED: 'open_loop_created',
  OPEN_LOOP_CONVERTED: 'open_loop_converted',
  GUIDE_ITEM_CREATED: 'guide_item_created',
  STRATEGY_CREATED: 'strategy_created',
  JOURNAL_COMPLETED: 'journal_completed',
  MOMENTUM_CHAIN_CREATED: 'momentum_chain_created',
  MOMENTUM_CHAIN_UPDATED: 'momentum_chain_updated',
  MOMENTUM_CHAIN_SUGGESTED_BY_PLUTO: 'momentum_chain_suggested_by_pluto',
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

// ── Entity types ─────────────────────────────────────────

export const EntityType = {
  ACTION: 'action',
  ROUTINE_INSTANCE: 'routine_instance',
  OPEN_LOOP: 'open_loop',
  GUIDE_ITEM: 'guide_item',
  STRATEGY: 'strategy',
  JOURNAL: 'journal',
  MOMENTUM_CHAIN: 'momentum_chain',
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

// ── Momentum chain domains ───────────────────────────────

export const ChainDomain = {
  SLEEP: 'sleep',
  NUTRITION: 'nutrition',
  EXERCISE: 'exercise',
} as const;
export type ChainDomain = (typeof ChainDomain)[keyof typeof ChainDomain];

// ── Chain step types ─────────────────────────────────────

export const ChainStepType = {
  SETUP: 'setup',
  EXECUTION: 'execution',
  WIND_DOWN: 'wind_down',
} as const;
export type ChainStepType = (typeof ChainStepType)[keyof typeof ChainStepType];

// ── Action kind ──────────────────────────────────────────

export const ActionKind = {
  NORMAL: 'normal',
  CHAIN_GENERATED: 'chain_generated',
} as const;
export type ActionKind = (typeof ActionKind)[keyof typeof ActionKind];

// ── Chain created by ─────────────────────────────────────

export const ChainCreatedBy = {
  USER: 'user',
  SYSTEM: 'system',
  PLUTO: 'pluto',
} as const;
export type ChainCreatedBy = (typeof ChainCreatedBy)[keyof typeof ChainCreatedBy];

// ── Journal types ────────────────────────────────────────

export const JournalType = {
  MORNING: 'morning',
  EVENING: 'evening',
} as const;
export type JournalType = (typeof JournalType)[keyof typeof JournalType];

// ── Open loop status ─────────────────────────────────────

export const OpenLoopStatus = {
  ACTIVE: 'active',
  CONVERTED: 'converted',
  ARCHIVED: 'archived',
} as const;
export type OpenLoopStatus = (typeof OpenLoopStatus)[keyof typeof OpenLoopStatus];

// ── Sync status ──────────────────────────────────────────

export const SyncStatus = {
  PENDING: 'pending',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
} as const;
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus];
