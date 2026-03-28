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
  plusHandler: (() => void) | null;

  openSheet: (sheet: SheetType, entityId?: string) => void;
  closeSheet: () => void;
  registerPlusHandler: (handler: () => void) => void;
  unregisterPlusHandler: () => void;
  triggerPlus: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeSheet: null,
  selectedEntityId: null,
  plusHandler: null,

  openSheet: (sheet, entityId) => set({ activeSheet: sheet, selectedEntityId: entityId ?? null }),
  closeSheet: () => set({ activeSheet: null, selectedEntityId: null }),
  registerPlusHandler: (handler) => set({ plusHandler: handler }),
  unregisterPlusHandler: () => set({ plusHandler: null }),
  triggerPlus: () => get().plusHandler?.(),
}));
