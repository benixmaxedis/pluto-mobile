import { text, integer } from 'drizzle-orm/sqlite-core';

export const id = {
  id: text('id').primaryKey(),
};

export const timestamps = {
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
};

export const syncFields = {
  syncStatus: text('sync_status', { enum: ['pending', 'synced', 'conflict'] }).default('pending'),
  syncVersion: integer('sync_version').default(0),
};

export const softDelete = {
  deletedAt: text('deleted_at'),
};
