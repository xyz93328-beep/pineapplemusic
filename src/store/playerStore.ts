import { create } from 'zustand';
import type { Track } from '@/services/youtube/types';

// ── YouTube IFrame API global types ──────────────────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (el: string | HTMLElement, opts: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1; ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerOptions {
  width?: number | string;
  height?: number | string;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    fs?: 0 | 1;
    iv_load_policy?: 1 | 3;
    modestbranding?: 1;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    origin?: string;
  };
  events?: {
    onReady?: (e: { target: YTPlayer }) => void;
    onStateChange?: (e: { data: number }) => void;
    onError?: (e: { data: number }) => void;
  };
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  destroy(): void;
}

// ── Store shape ───────────────────────────────────────────────────────────────

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  // Player lifecycle
  ready: boolean;
  containerId: string;

  // Queue / current track
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;

  // Playback state
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  volume: number;        // 0-100
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;

  // UI state
  showNowPlaying: boolean;
  showQueue: boolean;

  // Actions
  init: () => void;
  destroy: () => void;
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seekTo: (positionMs: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPositionMs: (ms: number) => void;
  setShowNowPlaying: (v: boolean) => void;
  setShowQueue: (v: boolean) => void;
  _onReady: () => void;
  _onStateChange: (state: number) => void;
  _onEnded: () => void;
}

// ── Module-level player reference (outside Zustand so it's not reactive) ─────

let ytPlayer: YTPlayer | null = null;
let positionInterval: ReturnType<typeof setInterval> | null = null;
let sdkReady = false;
let pendingVideoId: string | null = null;

const REPEAT_CYCLE: RepeatMode[] = ['off', 'all', 'one'];

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ready: false,
  containerId: 'yt-player-container',
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  volume: 80,
  muted: false,
  shuffle: false,
  repeatMode: 'off',
  showNowPlaying: false,
  showQueue: false,

  init() {
    if (document.getElementById('yt-iframe-api-script')) return;

    const script = document.createElement('script');
    script.id = 'yt-iframe-api-script';
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      sdkReady = true;
      const container = document.getElementById(get().containerId);
      if (!container) return;

      ytPlayer = new window.YT.Player(container, {
        width: '1',
        height: '1',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => get()._onReady(),
          onStateChange: (e) => get()._onStateChange(e.data),
        },
      });
    };
  },

  destroy() {
    if (positionInterval) clearInterval(positionInterval);
    positionInterval = null;
    ytPlayer?.destroy();
    ytPlayer = null;
    sdkReady = false;
    set({ ready: false, isPlaying: false, currentTrack: null });
  },

  playTrack(track) {
    const { queue } = get();
    // If track is already in queue keep it, otherwise set a fresh single-track queue
    const idx = queue.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      set({ currentIndex: idx, currentTrack: track });
    } else {
      set({ queue: [track], currentIndex: 0, currentTrack: track });
    }

    if (ytPlayer && get().ready) {
      ytPlayer.loadVideoById(track.videoId);
      set({ isPlaying: true, positionMs: 0 });
    } else {
      // SDK not ready yet — queue it up
      pendingVideoId = track.videoId;
    }
  },

  playQueue(tracks, startIndex = 0) {
    if (tracks.length === 0) return;
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    const track = tracks[idx];
    set({ queue: tracks, currentIndex: idx, currentTrack: track });

    if (ytPlayer && get().ready) {
      ytPlayer.loadVideoById(track.videoId);
      set({ isPlaying: true, positionMs: 0 });
    } else {
      pendingVideoId = track.videoId;
    }
  },

  togglePlay() {
    if (!ytPlayer) return;
    const { isPlaying } = get();
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  },

  next() {
    const { queue, currentIndex, shuffle, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (currentIndex < queue.length - 1) {
      nextIdx = currentIndex + 1;
    } else if (repeatMode === 'all') {
      nextIdx = 0;
    } else {
      return;
    }

    const track = queue[nextIdx];
    set({ currentIndex: nextIdx, currentTrack: track, positionMs: 0 });
    ytPlayer?.loadVideoById(track.videoId);
    set({ isPlaying: true });
  },

  prev() {
    const { queue, currentIndex, positionMs } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (positionMs > 3000) {
      ytPlayer?.seekTo(0, true);
      set({ positionMs: 0 });
      return;
    }

    const prevIdx = currentIndex > 0 ? currentIndex - 1 : 0;
    const track = queue[prevIdx];
    set({ currentIndex: prevIdx, currentTrack: track, positionMs: 0 });
    ytPlayer?.loadVideoById(track.videoId);
    set({ isPlaying: true });
  },

  seekTo(positionMs) {
    ytPlayer?.seekTo(positionMs / 1000, true);
    set({ positionMs });
  },

  setVolume(v) {
    const clamped = Math.max(0, Math.min(100, v));
    ytPlayer?.setVolume(clamped);
    set({ volume: clamped, muted: clamped === 0 });
  },

  toggleMute() {
    if (!ytPlayer) return;
    const { muted } = get();
    if (muted) {
      ytPlayer.unMute();
    } else {
      ytPlayer.mute();
    }
    set({ muted: !muted });
  },

  toggleShuffle() {
    set((s) => ({ shuffle: !s.shuffle }));
  },

  cycleRepeat() {
    const { repeatMode } = get();
    const idx = REPEAT_CYCLE.indexOf(repeatMode);
    set({ repeatMode: REPEAT_CYCLE[(idx + 1) % REPEAT_CYCLE.length] });
  },

  setPositionMs(ms) {
    set({ positionMs: ms });
  },

  setShowNowPlaying(v) {
    set({ showNowPlaying: v });
  },

  setShowQueue(v) {
    set({ showQueue: v });
  },

  _onReady() {
    const { volume } = get();
    ytPlayer?.setVolume(volume);
    set({ ready: true });

    if (pendingVideoId) {
      ytPlayer?.loadVideoById(pendingVideoId);
      set({ isPlaying: true });
      pendingVideoId = null;
    }
  },

  _onStateChange(state) {
    const YTState = { PLAYING: 1, PAUSED: 2, ENDED: 0, BUFFERING: 3 };

    if (state === YTState.PLAYING) {
      set({
        isPlaying: true,
        durationMs: Math.round((ytPlayer?.getDuration() ?? 0) * 1000),
      });
      // Start position ticker
      if (positionInterval) clearInterval(positionInterval);
      positionInterval = setInterval(() => {
        const pos = ytPlayer?.getCurrentTime() ?? 0;
        set({ positionMs: Math.round(pos * 1000) });
      }, 250);
    } else if (state === YTState.PAUSED) {
      set({ isPlaying: false });
      if (positionInterval) { clearInterval(positionInterval); positionInterval = null; }
    } else if (state === YTState.ENDED) {
      if (positionInterval) { clearInterval(positionInterval); positionInterval = null; }
      get()._onEnded();
    } else if (state === YTState.BUFFERING) {
      // keep isPlaying true while buffering
    }
  },

  _onEnded() {
    const { repeatMode, queue, currentIndex, shuffle } = get();
    if (repeatMode === 'one') {
      ytPlayer?.seekTo(0, true);
      ytPlayer?.playVideo();
      return;
    }

    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (currentIndex < queue.length - 1) {
      nextIdx = currentIndex + 1;
    } else if (repeatMode === 'all') {
      nextIdx = 0;
    } else {
      set({ isPlaying: false });
      return;
    }

    const track = queue[nextIdx];
    set({ currentIndex: nextIdx, currentTrack: track, positionMs: 0 });
    ytPlayer?.loadVideoById(track.videoId);
    set({ isPlaying: true });
  },
}));
