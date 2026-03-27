import { create } from 'zustand';

type SheetType =
  | 'createAction'
  | 'editAction'
  | 'createRoutine'
  | 'editRoutine'
  | 'createOpenLoop'
  | 'convertOpenLoop'
  | 'planning'
  | null;

interface UIState {
  activeSheet: SheetType;
  selectedEntityId: string | null;

  openSheet: (sheet: SheetType, entityId?: string) => void;
  closeSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSheet: null,
  selectedEntityId: null,

  openSheet: (sheet, entityId) => set({ activeSheet: sheet, selectedEntityId: entityId ?? null }),
  closeSheet: () => set({ activeSheet: null, selectedEntityId: null }),
}));
