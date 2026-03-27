import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps, syncFields, softDelete } from './helpers';
import { guideItems } from './guide-items';

export const strategies = sqliteTable('strategies', {
  ...id,
  userId: text('user_id'),
  category: text('category').notNull(),
  title: text('title').notNull(),
  triggerText: text('trigger_text'),
  contextText: text('context_text'),
  responseStepsMarkdown: text('response_steps_markdown'),
  whyItMatters: text('why_it_matters'),
  exampleText: text('example_text'),
  tagsJson: text('tags_json'),
  sourceOpenLoopId: text('source_open_loop_id'),
  ...timestamps,
  ...syncFields,
  ...softDelete,
});

export const strategyGuideLinks = sqliteTable('strategy_guide_links', {
  ...id,
  strategyId: text('strategy_id')
    .notNull()
    .references(() => strategies.id, { onDelete: 'cascade' }),
  guideItemId: text('guide_item_id')
    .notNull()
    .references(() => guideItems.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
