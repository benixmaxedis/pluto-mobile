import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id } from './helpers';

export const activityEvents = sqliteTable('activity_events', {
  ...id,
  userId: text('user_id'),
  eventType: text('event_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  eventDate: text('event_date'),
  eventSession: text('event_session', { enum: ['morning', 'afternoon', 'evening'] }),
  payloadJson: text('payload_json'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  syncStatus: text('sync_status', { enum: ['pending', 'synced'] }).default('pending'),
});
