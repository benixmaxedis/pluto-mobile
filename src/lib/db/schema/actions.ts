import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields, softDelete } from './helpers';

export const actions = sqliteTable('actions', {
  ...id,
  userId: text('user_id'),
  title: text('title').notNull(),
  notes: text('notes'),
  scheduledDate: text('scheduled_date'),
  scheduledSession: text('scheduled_session', { enum: ['morning', 'afternoon', 'evening'] }),
  effectiveDate: text('effective_date'),
  effectiveSession: text('effective_session', { enum: ['morning', 'afternoon', 'evening'] }),
  priority: text('priority', { enum: ['normal', 'high'] }).default('normal'),
  status: text('status', { enum: ['pending', 'completed', 'skipped', 'snoozed'] }).default(
    'pending',
  ),
  isHeld: integer('is_held', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  skippedAt: text('skipped_at'),
  snoozedUntilDate: text('snoozed_until_date'),
  snoozedUntilSession: text('snoozed_until_session', {
    enum: ['morning', 'afternoon', 'evening'],
  }),
  carryForwardCount: integer('carry_forward_count').default(0),
  lastAutoMovedAt: text('last_auto_moved_at'),
  originalSessionForDay: text('original_session_for_day', {
    enum: ['morning', 'afternoon', 'evening'],
  }),
  sourceOpenLoopId: text('source_open_loop_id'),
  sourcePlutoDraftId: text('source_pluto_draft_id'),
  momentumChainId: text('momentum_chain_id'),
  momentumChainStepId: text('momentum_chain_step_id'),
  actionKind: text('action_kind', { enum: ['normal', 'chain_generated'] }).default('normal'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});

export const actionSubtasks = sqliteTable('action_subtasks', {
  ...id,
  actionId: text('action_id')
    .notNull()
    .references(() => actions.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
});
