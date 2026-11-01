import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  cycleTheme: () => void;
  toggleSidebar: () => void;
}

const NEXT_THEME: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarCollapsed: false,
      cycleTheme: () => set((s) => ({ theme: NEXT_THEME[s.theme] })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'music-ui' },
  ),
);
