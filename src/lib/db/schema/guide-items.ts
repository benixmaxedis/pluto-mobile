import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields, softDelete } from './helpers';

export const guideItems = sqliteTable('guide_items', {
  ...id,
  userId: text('user_id'),
  category: text('category').notNull(),
  title: text('title').notNull(),
  statement: text('statement'),
  meaning: text('meaning'),
  exampleApplication: text('example_application'),
  tagsJson: text('tags_json'),
  sourceOpenLoopId: text('source_open_loop_id'),
  sortOrder: integer('sort_order').default(0),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});
