import { Search } from 'lucide-react';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { StateMessage } from '@/components/common/StateMessage';
import { Skeleton } from '@/components/common/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchCatalog } from '@/services/spotify/api';
import type { SearchResults } from '@/services/spotify/types';
import { useSearchStore } from '@/store/searchStore';

function SearchSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-10">
      <div className="flex items-center gap-6 rounded-panel bg-surface-elevated p-6">
        <Skeleton className="h-28 w-28 shrink-0 md:h-36 md:w-36" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-10 w-10 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchPage() {
  const query = useSearchStore((s) => s.query).trim();
  const debouncedQuery = useDebouncedValue(query, 350);

  const { state, retry } = useAsync<SearchResults | null>(
    (signal) => (debouncedQuery ? searchCatalog(debouncedQuery, signal) : Promise.resolve(null)),
    [debouncedQuery],
  );

  return (
    <section className="pt-6 pb-8">
      <h1 className="text-large-title font-bold text-label">Search</h1>

      <div className="mt-8">
        {state.status === 'loading' && <SearchSkeleton />}

        {state.status === 'error' && (
          <StateMessage
            title="Search isn't working right now"
            description={state.message}
            action={{ label: 'Try again', onClick: retry }}
          />
        )}

        {state.status === 'success' && state.data === null && (
          <StateMessage
            icon={<Search size={32} aria-hidden />}
            title="Search Music"
            description="Find songs, albums, artists, and playlists. Type in the search field above."
          />
        )}

        {state.status === 'success' && state.data !== null && (
          <SearchResultsView query={debouncedQuery} results={state.data} />
        )}
      </div>
    </section>
  );
}
