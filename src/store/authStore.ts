import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenSet } from '@/services/spotify/auth';

interface AuthState {
  session: TokenSet | null;
  refreshing: Promise<string> | null;
  setSession: (session: TokenSet | null) => void;
  setRefreshing: (refreshing: Promise<string> | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      refreshing: null,
      setSession: (session) => set({ session }),
      setRefreshing: (refreshing) => set({ refreshing }),
    }),
    {
      name: 'music-auth',
      partialize: (state) => ({ session: state.session }),
    },
  ),
);
