import { create } from 'zustand';
import { Session } from '@/lib/constants';
import { toISODate } from '@/lib/utils/date';
import { getSessionForHour } from '@/lib/constants/sessions';

/** Matches CreateDrawer option ids when the Now/Timeline card type is action or routine */
export type CreateDrawerPreferredOption = 'action' | 'routine';

interface AppState {
  selectedDate: string;
  currentSession: Session;
  isOnboarded: boolean;
  /** Expanded timeline row on Today/Now — highlights matching create type in the global drawer */
  createDrawerPreferredOption: CreateDrawerPreferredOption | null;

  setSelectedDate: (date: string) => void;
  setCurrentSession: (session: Session) => void;
  setOnboarded: (value: boolean) => void;
  setCreateDrawerPreferredOption: (option: CreateDrawerPreferredOption | null) => void;
  refreshSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: toISODate(new Date()),
  currentSession: getSessionForHour(new Date().getHours()),
  isOnboarded: false,
  createDrawerPreferredOption: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  setCreateDrawerPreferredOption: (option) => set({ createDrawerPreferredOption: option }),
  refreshSession: () =>
    set({
      selectedDate: toISODate(new Date()),
      currentSession: getSessionForHour(new Date().getHours()),
    }),
}));
