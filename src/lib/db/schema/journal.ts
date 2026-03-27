import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields } from './helpers';

export const journalEntries = sqliteTable('journal_entries', {
  ...id,
  userId: text('user_id'),
  entryDate: text('entry_date').notNull(),
  journalType: text('journal_type', { enum: ['morning', 'evening'] }).notNull(),
  session: text('session', { enum: ['morning', 'afternoon', 'evening'] }),
  answersJson: text('answers_json'),
  summaryText: text('summary_text'),
  ...timestamps,
  ...syncFields,
});
