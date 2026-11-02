import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { Artwork } from '@/components/common/Artwork';

export function QueuePanel() {
  const show = usePlayerStore((s) => s.showQueue);
  const setShow = usePlayerStore((s) => s.setShowQueue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const upNext = queue.slice(currentIndex + 1);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            key="queue-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShow(false)}
            style={{ zIndex: 29 }}
            className="fixed inset-0 bg-black/40 md:hidden"
          />
          <motion.aside
            key="queue"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass fixed bottom-0 right-0 top-0 z-30 flex w-full flex-col overflow-hidden md:w-80"
            aria-label="Queue"
          >
          <div className="flex items-center justify-between border-b border-separator px-5 py-4">
            <h2 className="text-body font-bold text-label">Queue</h2>
            <button onClick={() => setShow(false)} aria-label="Close queue" className="rounded-full p-1 text-label-secondary hover:text-label">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentTrack && (
              <div className="mb-6">
                <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-label-secondary">Now Playing</p>
                <QueueItem name={currentTrack.title} artist={currentTrack.artist} art={currentTrack.thumbnailUrl} dur={currentTrack.durationLabel} active />
              </div>
            )}
            {upNext.length > 0 ? (
              <div>
                <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-label-secondary">Playing Next</p>
                <div className="flex flex-col gap-1">
                  {upNext.map((t, i) => (
                    <button key={`${t.id}-${i}`} onClick={() => playQueue(queue, currentIndex + 1 + i)} className="w-full text-left">
                      <QueueItem name={t.title} artist={t.artist} art={t.thumbnailUrl} dur={t.durationLabel} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="pt-8 text-center text-caption text-label-secondary">Nothing up next</p>
            )}
          </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QueueItem({ name, artist, art, dur, active }: { name: string; artist: string; art: string | null | undefined; dur: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] px-2 py-2 hover:bg-label/[0.05]">
      <Artwork src={art} alt={name} className="h-10 w-10 shrink-0 rounded-art" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-track font-medium ${active ? 'text-accent' : 'text-label'}`}>{name}</p>
        <p className="truncate text-caption text-label-secondary">{artist}</p>
      </div>
      <span className="shrink-0 text-caption tabular-nums text-label-secondary">{dur}</span>
    </div>
  );
}
