import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields, softDelete } from './helpers';

export const momentumChains = sqliteTable('momentum_chains', {
  ...id,
  userId: text('user_id'),
  name: text('name').notNull(),
  domain: text('domain', { enum: ['sleep', 'nutrition', 'exercise'] }).notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdBy: text('created_by', { enum: ['user', 'system', 'pluto'] }).default('user'),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});

export const momentumChainSteps = sqliteTable('momentum_chain_steps', {
  ...id,
  chainId: text('chain_id')
    .notNull()
    .references(() => momentumChains.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  notes: text('notes'),
  defaultSession: text('default_session', { enum: ['morning', 'afternoon', 'evening'] }),
  leadOffsetSessions: integer('lead_offset_sessions'),
  stepType: text('step_type', { enum: ['setup', 'execution', 'wind_down'] }).default('setup'),
  orderIndex: integer('order_index').notNull().default(0),
  isOptional: integer('is_optional', { mode: 'boolean' }).default(false),
  ...timestamps,
});
