export type GuideItem = {
  id: string;
  userId: string | null;
  category: string;
  title: string;
  statement: string | null;
  meaning: string | null;
  exampleApplication: string | null;
  tagsJson: string | null;
  sourceOpenLoopId: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
};

export type Strategy = {
  id: string;
  userId: string | null;
  category: string;
  title: string;
  triggerText: string | null;
  contextText: string | null;
  responseStepsMarkdown: string | null;
  whyItMatters: string | null;
  exampleText: string | null;
  tagsJson: string | null;
  sourceOpenLoopId: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
};

export type StrategyGuideLink = {
  id: string;
  strategyId: string;
  guideItemId: string;
  createdAt: string;
};
