export type RoutineTemplate = {
  id: string;
  userId: string | null;
  category: string;
  title: string;
  notes: string | null;
  defaultSession: string | null;
  isActive: boolean | null;
  recurrenceType: string;
  recurrenceDaysJson: string | null;
  recurrenceAnchorDate: string | null;
  sourceOpenLoopId: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
};

export type RoutineSubtask = {
  id: string;
  routineTemplateId: string;
  title: string;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};

export type RoutineInstance = {
  id: string;
  routineTemplateId: string;
  userId: string | null;
  instanceDate: string;
  scheduledSession: string | null;
  effectiveSession: string | null;
  status: string | null;
  completedAt: string | null;
  skippedAt: string | null;
  snoozedUntilSession: string | null;
  wasMoved: boolean | null;
  movedAt: string | null;
  sourceGenerationKey: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
};

/** Pending instances for a date, including joined template title and category for queue UI. */
export type RoutineInstanceWithTemplateTitle = RoutineInstance & { templateTitle: string; templateCategory: string };

export type RoutineInstanceSubtask = {
  id: string;
  routineInstanceId: string;
  templateSubtaskId: string | null;
  title: string;
  isCompleted: boolean | null;
  completedAt: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};
