import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helpers';

export const chatMessages = sqliteTable('chat_messages', {
  ...id,
  userId: text('user_id'),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  ...timestamps,
});
