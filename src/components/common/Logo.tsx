import { Music } from 'lucide-react';
import { cn } from '@/lib/cn';

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-white">
        <Music size={18} strokeWidth={2.5} aria-hidden />
      </span>
      <div className={cn('flex items-center gap-2', collapsed && 'hidden')}>
        <span className="text-[19px] font-bold tracking-[-0.02em] text-label">Music</span>
        <span className="rounded-pill bg-label/10 px-2 py-0.5 text-caption font-medium text-label-secondary">
          Beta
        </span>
      </div>
    </div>
  );
}
