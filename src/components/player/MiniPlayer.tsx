import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Mic2, ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { Artwork } from '@/components/common/Artwork';
import { cn } from '@/lib/cn';

function Scrubber() {
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const pct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (durationMs === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(Math.round(ratio * durationMs));
  }

  function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-7 shrink-0 text-right text-[11px] tabular-nums text-label-secondary">{fmt(positionMs)}</span>
      <div
        onClick={handleClick}
        role="slider" aria-label="Playback position"
        aria-valuemin={0} aria-valuemax={durationMs} aria-valuenow={positionMs}
        className="relative h-1 flex-1 cursor-pointer rounded-full bg-label/20 hover:h-[5px] transition-all"
      >
        <div className="h-full rounded-full bg-label/80 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 shrink-0 text-[11px] tabular-nums text-label-secondary">-{fmt(Math.max(0, durationMs - positionMs))}</span>
    </div>
  );
}

export function MiniPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const showQueue = usePlayerStore((s) => s.showQueue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setShowNowPlaying = usePlayerStore((s) => s.setShowNowPlaying);
  const setShowQueue = usePlayerStore((s) => s.setShowQueue);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="miniplayer"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+64px)] left-1/2 z-40 w-[calc(100%-1rem)] max-w-2xl -translate-x-1/2 md:bottom-5 md:w-[calc(100%-2.5rem)]"
      >
        <div className="glass rounded-2xl px-4 py-3">
          {/* ── Mobile layout ── */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setShowNowPlaying(true)}
              aria-label="Open Now Playing"
              className="shrink-0 active:opacity-70"
            >
              <Artwork src={currentTrack.thumbnailUrl} alt={currentTrack.title} className="h-11 w-11 rounded-art" />
            </button>
            {/* Title area — tap to open Now Playing */}
            <button
              onClick={() => setShowNowPlaying(true)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-track font-semibold text-label">{currentTrack.title}</p>
              <p className="truncate text-caption text-label-secondary">{currentTrack.artist}</p>
            </button>
            {/* Controls */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="shrink-0 p-2 text-label active:opacity-70"
            >
              {isPlaying
                ? <Pause size={24} fill="currentColor" />
                : <Play size={24} fill="currentColor" />}
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="shrink-0 p-2 text-label-secondary active:opacity-70"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden md:flex md:flex-col md:gap-2">
            <div className="flex items-center gap-4">
              {/* Left: transport */}
              <div className="flex flex-1 items-center gap-3">
                <button onClick={toggleShuffle} aria-label="Shuffle" aria-pressed={shuffle}
                  className={cn('transition-colors', shuffle ? 'text-accent' : 'text-label-secondary hover:text-label')}>
                  <Shuffle size={15} />
                </button>
                <button onClick={prev} aria-label="Previous" className="text-label-secondary hover:text-label">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-label text-surface transition-transform active:scale-90">
                  {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="translate-x-px" />}
                </button>
                <button onClick={next} aria-label="Next" className="text-label-secondary hover:text-label">
                  <SkipForward size={20} fill="currentColor" />
                </button>
                <button onClick={cycleRepeat} aria-label={`Repeat: ${repeatMode}`}
                  className={cn('transition-colors', repeatMode !== 'off' ? 'text-accent' : 'text-label-secondary hover:text-label')}>
                  {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
                </button>
              </div>

              {/* Center: art + title + scrubber */}
              <div className="flex flex-1 flex-col items-center gap-1">
                <button onClick={() => setShowNowPlaying(true)} className="flex items-center gap-2" aria-label="Open Now Playing">
                  <Artwork src={currentTrack.thumbnailUrl} alt={currentTrack.title} className="h-8 w-8 rounded-[6px]" />
                  <div className="min-w-0 text-left">
                    <p className="max-w-[180px] truncate text-track font-semibold text-label leading-tight">{currentTrack.title}</p>
                    <p className="max-w-[180px] truncate text-caption text-label-secondary leading-tight">{currentTrack.artist}</p>
                  </div>
                </button>
                <Scrubber />
              </div>

              {/* Right: lyrics + queue + volume */}
              <div className="flex flex-1 items-center justify-end gap-3">
                <button onClick={() => setShowNowPlaying(true)} aria-label="Lyrics" className="text-label-secondary hover:text-label">
                  <Mic2 size={15} />
                </button>
                <button onClick={() => setShowQueue(!showQueue)} aria-label="Queue" aria-pressed={showQueue}
                  className={cn('transition-colors', showQueue ? 'text-accent' : 'text-label-secondary hover:text-label')}>
                  <ListMusic size={15} />
                </button>
                <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="text-label-secondary hover:text-label">
                  {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range" min={0} max={100} step={1} value={muted ? 0 : volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  aria-label="Volume"
                  className="h-1 w-20 cursor-pointer accent-label"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
