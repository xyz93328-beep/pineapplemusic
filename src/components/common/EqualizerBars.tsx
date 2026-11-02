import { cn } from '@/lib/cn';

export function EqualizerBars({ playing, className }: { playing: boolean; className?: string }) {
  return (
    <span aria-label={playing ? 'Playing' : 'Paused'} className={cn('inline-flex items-end gap-[2px] h-4', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={playing ? { animationDelay: `${i * 0.15}s` } : { height: '4px' }}
          className={cn('w-[3px] rounded-full bg-accent', playing && 'animate-equalizer')}
        />
      ))}
    </span>
  );
}
