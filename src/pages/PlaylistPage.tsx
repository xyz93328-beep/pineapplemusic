import { useParams } from 'react-router-dom';
import { Play, Shuffle, Music } from 'lucide-react';
import { fetchPlaylist, fetchPlaylistTracks } from '@/services/youtube/api';
import { useAsync } from '@/hooks/useAsync';
import { usePlayerStore } from '@/store/playerStore';
import { Artwork } from '@/components/common/Artwork';
import { Skeleton } from '@/components/common/Skeleton';
import { StateMessage } from '@/components/common/StateMessage';
import { TrackTable } from '@/components/media/TrackTable';

function PlaylistSkeleton() {
  return (
    <div className="pb-8 pt-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="h-52 w-52 shrink-0 rounded-art-lg" />
        <div className="flex flex-col justify-end gap-3">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-9 w-64 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const { state: metaState, retry: retryMeta } = useAsync(
    (signal) => (id ? fetchPlaylist(id, signal) : Promise.reject(new Error('No ID'))),
    [id],
  );
  const { state: tracksState, retry: retryTracks } = useAsync(
    (signal) => (id ? fetchPlaylistTracks(id, signal) : Promise.resolve([])),
    [id],
  );

  const isLoading = metaState.status === 'loading' || tracksState.status === 'loading';
  const isError = metaState.status === 'error' || tracksState.status === 'error';

  if (isLoading) return <PlaylistSkeleton />;
  if (isError) {
    return (
      <StateMessage
        title="Couldn't load playlist"
        description={metaState.status === 'error' ? metaState.message : tracksState.status === 'error' ? tracksState.message : ''}
        action={{ label: 'Try again', onClick: () => { retryMeta(); retryTracks(); } }}
        className="pt-16"
      />
    );
  }

  if (metaState.status !== 'success' || tracksState.status !== 'success') return null;

  const playlist = metaState.data;
  const tracks = tracksState.data;

  function handlePlay() {
    if (tracks.length > 0) playQueue(tracks, 0);
  }

  function handleShuffle() {
    if (tracks.length > 0) {
      toggleShuffle();
      playQueue(tracks, Math.floor(Math.random() * tracks.length));
    }
  }

  return (
    <div className="pb-32 pt-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        <Artwork
          src={playlist.thumbnailUrl}
          alt={playlist.title}
          className="h-52 w-52 shrink-0 rounded-art-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        />
        <div className="flex flex-col gap-2">
          <p className="text-caption font-semibold uppercase tracking-widest text-label-secondary">Playlist</p>
          <h1 className="text-large-title font-bold text-label">{playlist.title}</h1>
          {playlist.description && (
            <p className="max-w-md text-body text-label-secondary line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-caption text-label-secondary">
            {playlist.channelTitle} · {playlist.trackCount || tracks.length} songs
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={handlePlay}
              disabled={tracks.length === 0}
              className="flex h-10 items-center gap-2 rounded-pill bg-accent px-5 text-body font-bold text-white transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-[0.96] disabled:opacity-50"
            >
              <Play size={16} fill="currentColor" aria-hidden /> Play
            </button>
            <button
              onClick={handleShuffle}
              disabled={tracks.length === 0}
              className="flex h-10 items-center gap-2 rounded-pill bg-surface-elevated px-5 text-body font-bold text-label transition-[background-color,transform] duration-200 hover:bg-surface-raised active:scale-[0.96] disabled:opacity-50"
            >
              <Shuffle size={16} aria-hidden /> Shuffle
            </button>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <StateMessage icon={<Music size={32} aria-hidden />} title="No tracks" description="This playlist has no tracks." className="pt-16" />
      ) : (
        <TrackTable tracks={tracks} onPlay={(_, i) => playQueue(tracks, i)} className="mt-8" />
      )}
    </div>
  );
}
