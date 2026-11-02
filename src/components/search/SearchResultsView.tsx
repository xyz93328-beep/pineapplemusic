import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Artwork } from '@/components/common/Artwork';
import { MediaCard } from '@/components/media/MediaCard';
import { EqualizerBars } from '@/components/common/EqualizerBars';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/cn';
import type { SearchResults, Track } from '@/services/youtube/types';

interface Props {
  query: string;
  results: SearchResults;
}

function TrackRow({ track, index, allTracks }: { track: Track; index: number; allTracks: Track[] }) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const isActive = currentTrack?.id === track.id;

  return (
    <li
      onDoubleClick={() => playQueue(allTracks, index)}
      onClick={() => playQueue(allTracks, index)}
      className={cn(
        'group flex cursor-pointer select-none items-center gap-3 rounded-[10px] px-3 py-2',
        'transition-colors duration-150 active:bg-label/10 hover:bg-label/[0.05]',
        isActive && 'bg-accent/10',
      )}
    >
      <div className="relative h-10 w-10 shrink-0">
        <Artwork src={track.thumbnailUrl} alt={track.title} className="h-full w-full rounded-art" />
        {isActive ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-art bg-black/40">
            <EqualizerBars playing={isPlaying} />
          </div>
        ) : (
          <button
            aria-label={`Play ${track.title}`}
            onClick={() => playQueue(allTracks, index)}
            className="absolute inset-0 flex items-center justify-center rounded-art bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >▶</button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-track font-medium', isActive ? 'text-accent' : 'text-label')}>
          {track.title}
        </p>
        <p className="truncate text-caption text-label-secondary">
          <Link to={`/artists/${track.artistId}`} onClick={(e) => e.stopPropagation()} className="hover:underline hover:text-label">
            {track.artist}
          </Link>
        </p>
      </div>
      <span className="shrink-0 tabular-nums text-caption text-label-secondary">{track.durationLabel}</span>
    </li>
  );
}

export function SearchResultsView({ query, results }: Props) {
  const total = results.tracks.length + results.artists.length + results.playlists.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Music size={32} className="text-label-secondary" aria-hidden />
        <p className="text-section font-bold text-label">No results for "{query}"</p>
        <p className="text-body text-label-secondary">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Top result */}
      {results.tracks[0] && (
        <section>
          <h2 className="mb-4 text-section font-bold text-label">Top Result</h2>
          <div className="flex items-center gap-5 rounded-panel bg-surface-elevated p-5">
            <Artwork src={results.tracks[0].thumbnailUrl} alt={results.tracks[0].title} className="h-24 w-24 shrink-0 rounded-art-lg" />
            <div className="min-w-0">
              <p className="text-caption text-label-secondary">Song</p>
              <p className="mt-1 truncate text-title font-bold text-label">{results.tracks[0].title}</p>
              <p className="truncate text-body text-label-secondary">{results.tracks[0].artist}</p>
              <button
                onClick={() => usePlayerStore.getState().playQueue(results.tracks, 0)}
                className="mt-3 flex h-9 items-center gap-2 rounded-pill bg-accent px-4 text-body font-bold text-white hover:bg-accent-hover active:scale-[0.96]"
              >▶ Play</button>
            </div>
          </div>
        </section>
      )}

      {/* Songs */}
      {results.tracks.length > 0 && (
        <section>
          <h2 className="mb-3 text-section font-bold text-label">Songs</h2>
          <ol className="flex flex-col gap-1">
            {results.tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} allTracks={results.tracks} />
            ))}
          </ol>
        </section>
      )}

      {/* Artists */}
      {results.artists.length > 0 && (
        <section>
          <h2 className="mb-3 text-section font-bold text-label">Artists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {results.artists.map((a) => (
              <MediaCard key={a.id} to={`/artists/${a.id}`} artwork={a.thumbnailUrl} title={a.name} subtitle="Artist" shape="circle" />
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {results.playlists.length > 0 && (
        <section>
          <h2 className="mb-3 text-section font-bold text-label">Playlists</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {results.playlists.map((p) => (
              <MediaCard key={p.id} to={`/playlists/${p.id}`} artwork={p.thumbnailUrl} title={p.title} subtitle={p.channelTitle} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
