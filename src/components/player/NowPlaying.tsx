import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Mic2,
} from 'lucide-react';
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

  function handleInteraction(clientX: number, rect: DOMRect) {
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(Math.round(ratio * durationMs));
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div
        role="slider"
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={durationMs}
        aria-valuenow={positionMs}
        className="relative h-1 w-full cursor-pointer rounded-full bg-white/20 active:h-[6px] transition-all"
        onClick={(e) => handleInteraction(e.clientX, e.currentTarget.getBoundingClientRect())}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleInteraction(touch.clientX, e.currentTarget.getBoundingClientRect());
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleInteraction(touch.clientX, e.currentTarget.getBoundingClientRect());
        }}
      >
        <div
          className="h-full rounded-full bg-white/90 transition-[width] duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] tabular-nums text-white/60">
        <span>{fmt(positionMs)}</span>
        <span>-{fmt(Math.max(0, durationMs - positionMs))}</span>
      </div>
    </div>
  );
}

// ── Lyrics panel ──────────────────────────────────────────────────────────────
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-body">
        Loading lyrics…
      </div>
    );
  }
  if (!synced && !plain) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-body">
        Lyrics not available
      </div>
    );
  }

  if (synced) {
    return (
      <div className="h-full overflow-y-auto px-6 py-8 scroll-smooth">
        <div className="flex flex-col gap-4 pb-24">
          {synced.map((line, i) => {
            const isActive = i === activeIndex;
            const dist = Math.abs(i - activeIndex);
            const blur = isActive ? 0 : Math.min(4, dist * 0.7);
            return (
              <button
                key={i}
                ref={isActive ? activeRef : null}
                onClick={() => seekTo(Math.round(line.time * 1000))}
                style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
                className={cn(
                  'text-left font-bold leading-snug transition-all duration-300',
                  'text-[22px] md:text-lyric',
                  isActive
                    ? 'scale-[1.03] origin-left text-white opacity-100'
                    : 'text-white/35 hover:text-white/60',
                )}
              >
                {line.text || '\u00A0'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
      <div className="pb-24">
        {plain!.split('\n').map((line, i) => (
          <p key={i} className="text-body leading-relaxed text-white/70">{line || '\u00A0'}</p>
        ))}
      </div>
    </div>
  );
}

// ── Tabs for mobile (Controls / Lyrics) ──────────────────────────────────────
type Tab = 'controls' | 'lyrics';

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

  const [activeTab, setActiveTab] = useState<Tab>('controls');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShow(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setShow]);

  // Reset to controls tab whenever a new track opens
  useEffect(() => { if (show) setActiveTab('controls'); }, [show]);

  if (!currentTrack) return null;

  const controls = (
    <div className="flex flex-col items-center gap-5 px-6 pb-8 pt-4 w-full max-w-sm mx-auto">
      {/* Artwork */}
      <motion.div
        animate={{ scale: isPlaying ? 1 : 0.88 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full"
      >
        <Artwork
          src={currentTrack.thumbnailUrl}
          alt={currentTrack.title}
          className="aspect-square w-full rounded-art-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />
      </motion.div>

      {/* Title + lyrics toggle */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-bold text-white leading-tight">{currentTrack.title}</h1>
          <p className="mt-0.5 truncate text-body text-white/60">{currentTrack.artist}</p>
        </div>
        {/* Lyrics tab toggle (mobile) */}
        <button
          onClick={() => setActiveTab(activeTab === 'lyrics' ? 'controls' : 'lyrics')}
          aria-label="Toggle lyrics"
          className={cn(
            'shrink-0 rounded-full p-2 transition-colors',
            activeTab === 'lyrics' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50',
          )}
        >
          <Mic2 size={18} />
        </button>
      </div>

      {/* Scrubber */}
      <div className="w-full"><NowPlayingScrubber /></div>

      {/* Transport */}
      <div className="flex w-full items-center justify-between">
        <button
          onClick={toggleShuffle}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          className={cn('p-2', shuffle ? 'text-accent' : 'text-white/50')}
        >
          <Shuffle size={20} />
        </button>
        <button
          onClick={prev}
          aria-label="Previous"
          className="p-2 text-white active:opacity-60"
        >
          <SkipBack size={34} fill="currentColor" />
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-90 transition-transform"
        >
          {isPlaying
            ? <Pause size={28} fill="currentColor" />
            : <Play size={28} fill="currentColor" className="translate-x-0.5" />}
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="p-2 text-white active:opacity-60"
        >
          <SkipForward size={34} fill="currentColor" />
        </button>
        <button
          onClick={cycleRepeat}
          aria-label={`Repeat: ${repeatMode}`}
          className={cn('p-2', repeatMode !== 'off' ? 'text-accent' : 'text-white/50')}
        >
          {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>

      {/* Volume */}
      <div className="flex w-full items-center gap-3">
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="shrink-0 p-1 text-white/50 active:text-white"
        >
          {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range" min={0} max={100} step={1} value={muted ? 0 : volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
          aria-label="Volume"
          className="flex-1 h-1 cursor-pointer accent-white"
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="now-playing"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Now Playing"
        >
          {/* Blurred background */}
          <div className="absolute inset-0 bg-black">
            {currentTrack.thumbnailUrl && (
              <img
                src={currentTrack.thumbnailUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40"
                style={{ filter: 'blur(80px) saturate(200%)' }}
              />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* ── MOBILE layout: single column, tab-switched ── */}
          <div className="relative flex h-full flex-col md:hidden overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-2 shrink-0">
              <button
                onClick={() => setShow(false)}
                aria-label="Close Now Playing"
                className="rounded-full bg-white/10 p-2 text-white/70 active:bg-white/20"
              >
                <ChevronDown size={20} />
              </button>
              <p className="text-caption font-semibold uppercase tracking-widest text-white/50">
                Now Playing
              </p>
              <div className="w-9" />
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'controls' ? (
                controls
              ) : (
                <LyricsPanel
                  title={currentTrack.title}
                  artist={currentTrack.artist}
                  durationMs={durationMs}
                />
              )}
            </div>
          </div>

          {/* ── DESKTOP layout: two-column ── */}
          <div className="relative hidden h-full md:flex">
            {/* Left: controls */}
            <div className="flex w-[400px] shrink-0 flex-col items-center justify-center gap-6 px-10 py-16">
              <button
                onClick={() => setShow(false)}
                aria-label="Close Now Playing"
                className="absolute left-5 top-5 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20"
              >
                <ChevronDown size={20} />
              </button>
              {controls}
            </div>

            {/* Right: lyrics */}
            <div className="flex-1 overflow-hidden">
              <LyricsPanel
                title={currentTrack.title}
                artist={currentTrack.artist}
                durationMs={durationMs}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
