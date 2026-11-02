import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { Artwork } from '@/components/common/Artwork';
import { cn } from '@/lib/cn';
import { fetchLyrics } from '@/services/lrclib';
import type { LrcLine } from '@/services/lrclib';

// ── Scrubber ──────────────────────────────────────────────────────────────────
function NowPlayingScrubber() {
  const positionMs = usePlayerStore((s) => s.positionMs);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const pct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  function fmt(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(Math.round(ratio * durationMs));
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div onClick={handleClick} role="slider" aria-label="Playback position"
        aria-valuemin={0} aria-valuemax={durationMs} aria-valuenow={positionMs}
        className="h-1 w-full cursor-pointer rounded-full bg-white/20 hover:h-[5px] transition-all">
        <div className="h-full rounded-full bg-white/90 transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] tabular-nums text-white/60">
        <span>{fmt(positionMs)}</span>
        <span>-{fmt(Math.max(0, durationMs - positionMs))}</span>
      </div>
    </div>
  );
}

// ── Lyrics ────────────────────────────────────────────────────────────────────
function LyricsPanel({ title, artist, durationMs }: { title: string; artist: string; durationMs: number }) {
  const positionMs = usePlayerStore((s) => s.positionMs);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const [synced, setSynced] = useState<LrcLine[] | null>(null);
  const [plain, setPlain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!title) return;
    setLoading(true); setSynced(null); setPlain(null);
    const ctrl = new AbortController();
    fetchLyrics(title, artist, durationMs / 1000, ctrl.signal).then((r) => {
      setSynced(r.synced); setPlain(r.plain); setLoading(false);
    });
    return () => ctrl.abort();
  }, [title, artist, durationMs]);

  const positionSec = positionMs / 1000;
  let activeIndex = -1;
  if (synced) {
    for (let i = synced.length - 1; i >= 0; i--) {
      if (positionSec >= synced[i].time) { activeIndex = i; break; }
    }
  }

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex]);

  if (loading) return <div className="flex h-full items-center justify-center text-white/40">Loading lyrics…</div>;
  if (!synced && !plain) return <div className="flex h-full items-center justify-center text-white/40">Lyrics not available</div>;

  if (synced) {
    return (
      <div className="h-full overflow-y-auto px-6 py-16 scroll-smooth">
        <div className="flex flex-col gap-4">
          {synced.map((line, i) => {
            const isActive = i === activeIndex;
            const dist = Math.abs(i - activeIndex);
            const blur = isActive ? 0 : Math.min(4, dist * 0.8);
            return (
              <button key={i} ref={isActive ? activeRef : null}
                onClick={() => seekTo(Math.round(line.time * 1000))}
                style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
                className={cn(
                  'text-left font-bold leading-tight transition-all duration-300',
                  'text-lyric-sm md:text-lyric',
                  isActive ? 'scale-[1.02] origin-left text-white opacity-100' : 'text-white/35 hover:text-white/60',
                )}>
                {line.text || '\u00A0'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-16">
      {plain!.split('\n').map((line, i) => (
        <p key={i} className="text-body leading-relaxed text-white/70">{line || '\u00A0'}</p>
      ))}
    </div>
  );
}

// ── Main overlay ──────────────────────────────────────────────────────────────
export function NowPlaying() {
  const show = usePlayerStore((s) => s.showNowPlaying);
  const setShow = usePlayerStore((s) => s.setShowNowPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const durationMs = usePlayerStore((s) => s.durationMs);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setShow]);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="now-playing"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog" aria-modal="true" aria-label="Now Playing">
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black">
            {currentTrack.thumbnailUrl && (
              <img src={currentTrack.thumbnailUrl} alt="" aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40"
                style={{ filter: 'blur(80px) saturate(200%)' }} />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Layout */}
          <div className="relative flex h-full flex-col overflow-y-auto md:flex-row md:overflow-hidden">
            {/* Left: controls */}
            <div className="flex flex-1 flex-col items-center justify-start gap-6 px-6 py-12 md:max-w-[420px] md:justify-center md:py-16">
              <button onClick={() => setShow(false)} aria-label="Close"
                className="absolute left-4 top-4 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20">
                <ChevronDown size={20} />
              </button>

              {/* Artwork */}
              <motion.div animate={{ scale: isPlaying ? 1 : 0.88 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-[280px] md:max-w-xs">
                <Artwork src={currentTrack.thumbnailUrl} alt={currentTrack.title}
                  className="aspect-square w-full rounded-art-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)]" />
              </motion.div>

              {/* Title */}
              <div className="w-full max-w-xs text-center md:text-left">
                <h1 className="truncate text-title font-bold text-white">{currentTrack.title}</h1>
                <p className="mt-1 truncate text-body text-white/70">{currentTrack.artist}</p>
              </div>

              {/* Scrubber */}
              <div className="w-full max-w-xs"><NowPlayingScrubber /></div>

              {/* Transport */}
              <div className="flex w-full max-w-xs items-center justify-between">
                <button onClick={toggleShuffle} aria-label="Shuffle" aria-pressed={shuffle}
                  className={cn(shuffle ? 'text-accent' : 'text-white/50 hover:text-white')}>
                  <Shuffle size={22} />
                </button>
                <button onClick={prev} aria-label="Previous" className="text-white hover:text-white/70">
                  <SkipBack size={32} fill="currentColor" />
                </button>
                <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black active:scale-90">
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="translate-x-0.5" />}
                </button>
                <button onClick={next} aria-label="Next" className="text-white hover:text-white/70">
                  <SkipForward size={32} fill="currentColor" />
                </button>
                <button onClick={cycleRepeat} aria-label={`Repeat: ${repeatMode}`}
                  className={cn(repeatMode !== 'off' ? 'text-accent' : 'text-white/50 hover:text-white')}>
                  {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
                </button>
              </div>

              {/* Volume */}
              <div className="flex w-full max-w-xs items-center gap-3">
                <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="text-white/60 hover:text-white">
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input type="range" min={0} max={100} step={1} value={muted ? 0 : volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  aria-label="Volume" className="flex-1 h-1 cursor-pointer accent-white" />
              </div>
            </div>

            {/* Right: lyrics (desktop) */}
            <div className="hidden flex-1 overflow-hidden md:flex">
              <LyricsPanel title={currentTrack.title} artist={currentTrack.artist} durationMs={durationMs} />
            </div>

            {/* Lyrics (mobile - below controls) */}
            <div className="flex flex-1 md:hidden min-h-[300px]">
              <div className="w-full">
                <LyricsPanel title={currentTrack.title} artist={currentTrack.artist} durationMs={durationMs} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
