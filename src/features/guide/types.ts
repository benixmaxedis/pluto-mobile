import type { InferSelectModel } from 'drizzle-orm';
import type { guideItems, strategies, strategyGuideLinks } from '@/lib/db/schema';

export type GuideItem = InferSelectModel<typeof guideItems>;
export type Strategy = InferSelectModel<typeof strategies>;
export type StrategyGuideLink = InferSelectModel<typeof strategyGuideLinks>;
