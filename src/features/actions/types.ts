/** Row shape returned from Supabase (camelCase). */
export type Action = {
  id: string;
  userId: string | null;
  title: string;
  notes: string | null;
  scheduledDate: string | null;
  scheduledSession: string | null;
  effectiveDate: string | null;
  effectiveSession: string | null;
  priority: string | null;
  status: string | null;
  isHeld: boolean | null;
  completedAt: string | null;
  skippedAt: string | null;
  snoozedUntilDate: string | null;
  snoozedUntilSession: string | null;
  carryForwardCount: number | null;
  lastAutoMovedAt: string | null;
  originalSessionForDay: string | null;
  sourceOpenLoopId: string | null;
  sourcePlutoDraftId: string | null;
  momentumChainId: string | null;
  momentumChainStepId: string | null;
  actionKind: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: string | null;
  syncVersion: number | null;
  deletedAt: string | null;
  subtasks?: ActionSubtask[];
  subtaskProgress?: {
    completed: number;
    total: number;
  } | null;
};

export type ActionSubtask = {
  id: string;
  actionId: string;
  title: string;
  isCompleted: boolean | null;
  completedAt: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};
