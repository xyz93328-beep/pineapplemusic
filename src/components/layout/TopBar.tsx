import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/common/IconButton';
import { SearchField } from '@/components/common/SearchField';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
      <div className="flex w-[68px] shrink-0 items-center gap-1">
        <IconButton label="Go back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />
        </IconButton>
        <IconButton label="Go forward" onClick={() => navigate(1)}>
          <ChevronRight size={18} strokeWidth={2.25} aria-hidden />
        </IconButton>
      </div>

      <SearchField className="mx-auto w-full max-w-[460px]" />

      <div className="flex w-[68px] shrink-0 justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
