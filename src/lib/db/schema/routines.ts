import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields, softDelete } from './helpers';

export const routineTemplates = sqliteTable('routine_templates', {
  ...id,
  userId: text('user_id'),
  category: text('category').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  defaultSession: text('default_session', { enum: ['morning', 'afternoon', 'evening'] }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  recurrenceType: text('recurrence_type', {
    enum: ['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually'],
  }).notNull(),
  recurrenceDaysJson: text('recurrence_days_json'),
  recurrenceAnchorDate: text('recurrence_anchor_date'),
  sourceOpenLoopId: text('source_open_loop_id'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});

export const routineSubtasks = sqliteTable('routine_subtasks', {
  ...id,
  routineTemplateId: text('routine_template_id')
    .notNull()
    .references(() => routineTemplates.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
});

export const routineInstances = sqliteTable('routine_instances', {
  ...id,
  routineTemplateId: text('routine_template_id')
    .notNull()
    .references(() => routineTemplates.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  instanceDate: text('instance_date').notNull(),
  scheduledSession: text('scheduled_session', { enum: ['morning', 'afternoon', 'evening'] }),
  effectiveSession: text('effective_session', { enum: ['morning', 'afternoon', 'evening'] }),
  status: text('status', { enum: ['pending', 'completed', 'skipped', 'snoozed'] }).default(
    'pending',
  ),
  completedAt: text('completed_at'),
  skippedAt: text('skipped_at'),
  snoozedUntilSession: text('snoozed_until_session', {
    enum: ['morning', 'afternoon', 'evening'],
  }),
  wasMoved: integer('was_moved', { mode: 'boolean' }).default(false),
  movedAt: text('moved_at'),
  sourceGenerationKey: text('source_generation_key'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});

export const routineInstanceSubtasks = sqliteTable('routine_instance_subtasks', {
  ...id,
  routineInstanceId: text('routine_instance_id')
    .notNull()
    .references(() => routineInstances.id, { onDelete: 'cascade' }),
  templateSubtaskId: text('template_subtask_id').references(() => routineSubtasks.id),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
});
