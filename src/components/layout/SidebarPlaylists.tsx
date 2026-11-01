import { NavLink } from 'react-router-dom';
import { Artwork, firstImageUrl } from '@/components/common/Artwork';
import { Skeleton } from '@/components/common/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { cn } from '@/lib/cn';
import { fetchUserPlaylists } from '@/services/spotify/api';

export function SidebarPlaylists() {
  const { state, retry } = useAsync((signal) => fetchUserPlaylists(signal), []);

  return (
    <div className="mt-5">
      <h2 className="px-3 pb-2 text-caption font-medium text-label-secondary">Playlists</h2>

      {state.status === 'loading' && (
        <div aria-hidden className="flex flex-col gap-3 px-3 py-1">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div className="px-3 text-caption text-label-secondary">
          <p>{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-1 font-medium text-accent-text underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <p className="px-3 text-caption text-label-secondary">No playlists yet.</p>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <nav aria-label="Playlists" className="flex flex-col gap-0.5">
          {state.data.map((playlist) => (
            <NavLink
              key={playlist.id}
              to={`/playlists/${playlist.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-[10px] px-3 py-1.5 text-body transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96]',
                  isActive ? 'bg-label/[0.08] text-accent-text' : 'text-label hover:bg-label/[0.05]',
                )
              }
            >
              <Artwork src={firstImageUrl(playlist.images)} alt="" className="h-8 w-8 shrink-0 rounded-[6px]" />
              <span className="truncate">{playlist.name}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
