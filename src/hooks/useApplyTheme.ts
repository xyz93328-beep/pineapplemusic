import { useEffect } from 'react';
import { useUIStore, type ThemeMode } from '@/store/uiStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isDark(theme: ThemeMode): boolean {
  if (theme === 'system') return window.matchMedia(DARK_QUERY).matches;
  return theme === 'dark';
}

export function useApplyTheme() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => root.classList.toggle('dark', isDark(theme));
    apply();

    if (theme !== 'system') return;
    const media = window.matchMedia(DARK_QUERY);
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
