import { Music } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ArtworkProps {
  src: string | undefined | null;
  alt: string;
  shape?: 'square' | 'circle';
  className?: string;
}

export function Artwork({ src, alt, shape = 'square', className }: ArtworkProps) {
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-art';

  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'flex aspect-square items-center justify-center bg-surface-raised text-label-secondary',
          radius,
          className,
        )}
      >
        <Music size={28} strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('aspect-square object-cover', radius, className)}
    />
  );
}
