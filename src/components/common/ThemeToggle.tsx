import { Monitor, Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/common/IconButton';
import { useUIStore, type ThemeMode } from '@/store/uiStore';

const THEME_ICON: Record<ThemeMode, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

const THEME_LABEL: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const cycleTheme = useUIStore((s) => s.cycleTheme);
  const Icon = THEME_ICON[theme];

  return (
    <IconButton label={`Theme: ${THEME_LABEL[theme]}. Change theme`} onClick={cycleTheme}>
      <Icon size={18} strokeWidth={2} aria-hidden />
    </IconButton>
  );
}
