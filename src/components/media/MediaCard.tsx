import { Link } from 'react-router-dom';
import { Artwork } from '@/components/common/Artwork';
import { cn } from '@/lib/cn';

interface MediaCardProps {
  to?: string;
  artwork: string | undefined | null;
  title: string;
  subtitle?: string;
  shape?: 'square' | 'circle';
  onClick?: () => void;
}

export function MediaCard({ to, artwork, title, subtitle, shape = 'square', onClick }: MediaCardProps) {
  const content = (
    <>
      <Artwork
        src={artwork}
        alt={title}
        shape={shape}
        className={cn('w-full', shape === 'circle' ? 'rounded-full' : 'rounded-art')}
      />
      <div className="mt-2 min-w-0">
        <p className="truncate text-track font-semibold text-label">{title}</p>
        {subtitle && <p className="truncate text-caption text-label-secondary">{subtitle}</p>}
      </div>
    </>
  );

  const cls = 'group flex flex-col transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]';

  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button className={cn(cls, 'text-left')} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={cls}>{content}</div>;
}
