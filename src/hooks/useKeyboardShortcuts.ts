import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export function useKeyboardShortcuts() {
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setShowNowPlaying = usePlayerStore((s) => s.setShowNowPlaying);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        togglePlay();
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.code === 'ArrowLeft') { e.preventDefault(); prev(); return; }
      if (meta && e.code === 'ArrowRight') { e.preventDefault(); next(); return; }
      if (meta && e.code === 'KeyF') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
        return;
      }
      if (e.code === 'KeyL' && !isInput) {
        e.preventDefault();
        setShowNowPlaying(!usePlayerStore.getState().showNowPlaying);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, next, prev, setShowNowPlaying]);
}
