import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { timestamps } from './helpers';

export const appPreferences = sqliteTable('app_preferences', {
  userId: text('user_id').primaryKey(),
  currentTheme: text('current_theme').default('dark'),
  reducedMotionEnabled: integer('reduced_motion_enabled', { mode: 'boolean' }).default(false),
  hapticsEnabled: integer('haptics_enabled', { mode: 'boolean' }).default(true),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  ...timestamps,
});
