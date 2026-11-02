import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/common/IconButton';
import { SearchField } from '@/components/common/SearchField';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="flex shrink-0 items-center gap-2 px-3 py-2 md:gap-3 md:px-6 md:py-3">
      {/* Back/forward — desktop only */}
      <div className="hidden w-[68px] shrink-0 items-center gap-1 md:flex">
        <IconButton label="Go back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />
        </IconButton>
        <IconButton label="Go forward" onClick={() => navigate(1)}>
          <ChevronRight size={18} strokeWidth={2.25} aria-hidden />
        </IconButton>
      </div>

      {/* Search — full width on mobile, capped on desktop */}
      <SearchField className="flex-1 md:mx-auto md:max-w-[460px]" />

      {/* Theme toggle */}
      <div className="shrink-0 md:w-[68px] md:flex md:justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
