import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;

  setAuthenticated: (userId: string) => void;
  setUnauthenticated: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  userId: null,

  setAuthenticated: (userId) => set({ isAuthenticated: true, userId, isLoading: false }),
  setUnauthenticated: () => set({ isAuthenticated: false, userId: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
