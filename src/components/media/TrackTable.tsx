import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Artwork } from '@/components/common/Artwork';
import { EqualizerBars } from '@/components/common/EqualizerBars';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/services/youtube/types';

interface TrackTableProps {
  tracks: Track[];
  showArtwork?: boolean;
  showTrackNumber?: boolean;
  onPlay?: (track: Track, index: number) => void;
  className?: string;
}

function ExplicitBadge() {
  return (
    <span
      aria-label="Explicit"
      className="inline-flex h-4 shrink-0 items-center rounded-[3px] bg-label/[0.15] px-1 text-[10px] font-bold text-label-secondary"
    >
      E
    </span>
  );
}

export function TrackTable({
  tracks,
  showArtwork = true,
  showTrackNumber = false,
  onPlay,
  className,
}: TrackTableProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  return (
    <ol className={cn('flex flex-col', className)}>
      {tracks.map((track, index) => {
        const isActive = currentTrack?.id === track.id;

        return (
          <li
            key={`${track.id}-${index}`}
            onDoubleClick={() => onPlay?.(track, index)}
            onClick={() => onPlay?.(track, index)}
            className={cn(
              'group flex cursor-pointer select-none items-center gap-3 rounded-[10px] px-3 py-2',
              'transition-colors duration-150 active:bg-label/10 hover:bg-label/[0.05]',
              isActive && 'bg-accent/10',
            )}
          >
            {/* Index / equalizer */}
            <div className="w-7 shrink-0 text-center">
              {isActive ? (
                <EqualizerBars playing={isPlaying} />
              ) : (
                <>
                  <span className={cn(
                    'text-track text-label-secondary group-hover:hidden',
                    showTrackNumber ? 'block' : 'hidden group-hover:block',
                  )}>
                    {showTrackNumber ? index + 1 : index + 1}
                  </span>
                  <button
                    aria-label={`Play ${track.title}`}
                    onClick={() => onPlay?.(track, index)}
                    className={cn(
                      'text-label-secondary hover:text-label',
                      showTrackNumber ? 'hidden group-hover:block' : 'hidden group-hover:block',
                    )}
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            {/* Artwork */}
            {showArtwork && (
              <div className="relative h-10 w-10 shrink-0">
                <Artwork src={track.thumbnailUrl} alt={track.title} className="h-full w-full rounded-art" />
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-art bg-black/40">
                    <EqualizerBars playing={isPlaying} />
                  </div>
                )}
                {!isActive && (
                  <button
                    aria-label={`Play ${track.title}`}
                    onClick={() => onPlay?.(track, index)}
                    className="absolute inset-0 flex items-center justify-center rounded-art bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ▶
                  </button>
                )}
              </div>
            )}

            {/* Title + artist */}
            <div className="min-w-0 flex-1">
              <p className={cn(
                'truncate text-track font-medium',
                isActive ? 'text-accent' : 'text-label',
              )}>
                {track.title}
              </p>
              <p className="truncate text-caption text-label-secondary">
                <Link
                  to={`/artists/${track.artistId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline hover:text-label"
                >
                  {track.artist}
                </Link>
              </p>
            </div>

            {/* Duration */}
            <span className="shrink-0 text-track tabular-nums text-label-secondary">
              {track.durationLabel}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
