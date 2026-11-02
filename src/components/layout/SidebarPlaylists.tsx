// Playlists sidebar section — YouTube doesn't expose a user library without
// OAuth, so we keep a "Recently Played" list from the player store instead.
import { NavLink } from 'react-router-dom';
import { Artwork } from '@/components/common/Artwork';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/cn';

export function SidebarPlaylists() {
  const queue = usePlayerStore((s) => s.queue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  // Show unique tracks from queue as a "Queue" shortcut — only when something is playing
  if (!currentTrack) return null;

  return (
    <div className="mt-5">
      <h2 className="px-3 pb-2 text-caption font-medium text-label-secondary">Now Playing</h2>
      <nav aria-label="Queue tracks" className="flex flex-col gap-0.5">
        {queue.slice(0, 10).map((track, i) => (
          <button
            key={`${track.id}-${i}`}
            onClick={() => usePlayerStore.getState().playQueue(queue, i)}
            className={cn(
              'flex items-center gap-3 rounded-[10px] px-3 py-1.5 text-left text-body transition-colors duration-150',
              currentTrack?.id === track.id
                ? 'bg-label/[0.08] text-accent-text'
                : 'text-label hover:bg-label/[0.05]',
            )}
          >
            <Artwork src={track.thumbnailUrl} alt="" className="h-8 w-8 shrink-0 rounded-[6px]" />
            <span className="truncate text-track">{track.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
