import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useSearchStore } from '@/store/searchStore';

interface SearchFieldProps {
  className?: string;
}

export function SearchField({ className }: SearchFieldProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  function openSearch() {
    if (location.pathname !== '/search') navigate('/search');
  }

  function handleChange(value: string) {
    setQuery(value);
    openSearch();
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        openSearch();
      }}
      className={cn('relative', className)}
    >
      <Search
        aria-hidden
        size={16}
        strokeWidth={2.25}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-secondary"
      />
      <input
        type="search"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search"
        aria-label="Search"
        className="h-9 w-full rounded-pill bg-label/[0.08] pl-10 pr-4 text-body text-label outline-none transition-shadow duration-200 ease-out placeholder:text-label-secondary focus:ring-2 focus:ring-accent"
      />
    </form>
  );
}
