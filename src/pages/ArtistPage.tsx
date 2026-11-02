import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchChannel, fetchChannelVideos, fetchChannelPlaylists } from '@/services/youtube/api';
import { useAsync } from '@/hooks/useAsync';
import { usePlayerStore } from '@/store/playerStore';
import { Artwork } from '@/components/common/Artwork';
import { Skeleton } from '@/components/common/Skeleton';
import { StateMessage } from '@/components/common/StateMessage';
import { TrackTable } from '@/components/media/TrackTable';
import { MediaCard } from '@/components/media/MediaCard';
import type { Track } from '@/services/youtube/types';

function ArtistSkeleton() {
  return (
    <div className="pb-8">
      <Skeleton className="h-64 w-full rounded-art-lg" />
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
      <div className="mt-8 flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const playQueue = usePlayerStore((s) => s.playQueue);

  const { state: artistState, retry } = useAsync(
    (signal) => (id ? fetchChannel(id, signal) : Promise.reject(new Error('No ID'))),
    [id],
  );
  const { state: tracksState } = useAsync(
    (signal) => (id ? fetchChannelVideos(id, signal) : Promise.resolve([])),
    [id],
  );
  const { state: playlistsState } = useAsync(
    (signal) => (id ? fetchChannelPlaylists(id, signal) : Promise.resolve([])),
    [id],
  );

  if (artistState.status === 'loading') return <ArtistSkeleton />;
  if (artistState.status === 'error') {
    return (
      <StateMessage title="Couldn't load artist" description={artistState.message} action={{ label: 'Try again', onClick: retry }} className="pt-16" />
    );
  }
  if (artistState.status !== 'success') return null;

  const artist = artistState.data;
  const topTracks: Track[] = tracksState.status === 'success' ? tracksState.data : [];
  const playlists = playlistsState.status === 'success' ? playlistsState.data : [];

  const subCount = artist.subscriberCount
    ? new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(artist.subscriberCount))
    : null;

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="relative h-64 w-full overflow-hidden rounded-art-lg">
        {artist.thumbnailUrl
          ? <img src={artist.thumbnailUrl} alt={artist.name} className="h-full w-full object-cover object-top" />
          : <div className="h-full w-full bg-surface-elevated" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-large-title font-bold text-white">{artist.name}</h1>
          {subCount && <p className="mt-1 text-body text-white/70">{subCount} subscribers</p>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => topTracks.length > 0 && playQueue(topTracks, 0)}
          disabled={topTracks.length === 0}
          className="flex h-10 items-center gap-2 rounded-pill bg-accent px-5 text-body font-bold text-white transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-[0.96] disabled:opacity-50"
        >
          <Play size={16} fill="currentColor" aria-hidden /> Play
        </button>
      </div>

      {topTracks.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-section font-bold text-label">Top Videos</h2>
          <TrackTable tracks={topTracks} onPlay={(_, i) => playQueue(topTracks, i)} showArtwork />
        </section>
      )}

      {playlists.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-section font-bold text-label">Playlists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((pl) => (
              <MediaCard key={pl.id} to={`/playlists/${pl.id}`} artwork={pl.thumbnailUrl} title={pl.title} subtitle={`${pl.trackCount} videos`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
