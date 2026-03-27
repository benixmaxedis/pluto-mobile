import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields } from './helpers';

export const openLoops = sqliteTable('open_loops', {
  ...id,
  userId: text('user_id'),
  category: text('category'),
  title: text('title').notNull(),
  body: text('body'),
  status: text('status', { enum: ['active', 'converted', 'archived'] }).default('active'),
  convertedToType: text('converted_to_type'),
  convertedToId: text('converted_to_id'),
  archivedAt: text('archived_at'),
  ...timestamps,
  ...syncFields,
});
