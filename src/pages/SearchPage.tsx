import { Search } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAsync } from '@/hooks/useAsync';
import { searchYouTube } from '@/services/youtube/api';
import { SearchResultsView } from '@/components/search/SearchResultsView';
import { StateMessage } from '@/components/common/StateMessage';
import { Skeleton } from '@/components/common/Skeleton';
import type { SearchResults } from '@/services/youtube/types';

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-6 rounded-panel bg-surface-elevated p-6">
        <Skeleton className="h-36 w-36 shrink-0 rounded-art-lg" />
        <div className="flex flex-1 flex-col justify-center gap-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-8 w-52 rounded" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="mb-2 h-6 w-24 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}

export function SearchPage() {
  const query = useSearchStore((s) => s.query).trim();
  const debouncedQuery = useDebouncedValue(query, 400);

  const { state, retry } = useAsync<SearchResults | null>(
    (signal) =>
      debouncedQuery ? searchYouTube(debouncedQuery, signal) : Promise.resolve(null),
    [debouncedQuery],
  );

  return (
    <section className="pb-32 pt-6">
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
            description="Find songs, artists, and playlists. Type in the search field above."
          />
        )}

        {state.status === 'success' && state.data !== null && (
          <SearchResultsView query={debouncedQuery} results={state.data} />
        )}
      </div>
    </section>
  );
}
