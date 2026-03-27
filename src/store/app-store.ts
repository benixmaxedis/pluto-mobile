import { create } from 'zustand';
import { Session } from '@/lib/constants';
import { toISODate } from '@/lib/utils/date';
import { getSessionForHour } from '@/lib/constants/sessions';

interface AppState {
  selectedDate: string;
  currentSession: Session;
  isOnboarded: boolean;

  setSelectedDate: (date: string) => void;
  setCurrentSession: (session: Session) => void;
  setOnboarded: (value: boolean) => void;
  refreshSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedDate: toISODate(new Date()),
  currentSession: getSessionForHour(new Date().getHours()),
  isOnboarded: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  refreshSession: () =>
    set({
      selectedDate: toISODate(new Date()),
      currentSession: getSessionForHour(new Date().getHours()),
    }),
}));
