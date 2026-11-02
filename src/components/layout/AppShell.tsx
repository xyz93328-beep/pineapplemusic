import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { NowPlaying } from '@/components/player/NowPlaying';
import { QueuePanel } from '@/components/player/QueuePanel';
import { usePlayerStore } from '@/store/playerStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function AppShell() {
  const init = usePlayerStore((s) => s.init);
  const destroy = usePlayerStore((s) => s.destroy);

  useEffect(() => {
    init();
    return () => destroy();
  }, [init, destroy]);

  useKeyboardShortcuts();

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      {/* Hidden YouTube iframe mount point — must be in DOM before SDK ready */}
      <div id="yt-player-container" className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px overflow-hidden" aria-hidden="true" />

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/* pb accounts for TabBar (mobile) + MiniPlayer */}
        <main className="flex-1 overflow-y-auto px-4 pb-36 md:px-8 md:pb-28">
          <Outlet />
        </main>
      </div>

      <TabBar />
      <MiniPlayer />
      <QueuePanel />
      <NowPlaying />
    </div>
  );
}
