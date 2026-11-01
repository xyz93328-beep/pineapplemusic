import { NavLink } from 'react-router-dom';
import { Artwork } from '@/components/common/Artwork';
import { cn } from '@/lib/cn';

interface MediaCardProps {
  to?: string;
  artwork: string | undefined;
  title: string;
  subtitle?: string;
  shape?: 'square' | 'circle';
}

export function MediaCard({ to, artwork, title, subtitle, shape = 'square' }: MediaCardProps) {
  const body = (
    <>
      <Artwork
        src={artwork}
        alt={title}
        shape={shape}
        className="w-full transition-transform duration-200 ease-out group-hover:scale-[1.02]"
      />
      <div className={cn('mt-3 min-w-0', shape === 'circle' && 'text-center')}>
        <p className="truncate text-track font-medium text-label">{title}</p>
        {subtitle && <p className="truncate text-caption text-label-secondary">{subtitle}</p>}
      </div>
    </>
  );

  if (!to) {
    return <div className="group min-w-0">{body}</div>;
  }

  return (
    <NavLink to={to} className="group block min-w-0 rounded-art outline-none">
      {body}
    </NavLink>
  );
}
