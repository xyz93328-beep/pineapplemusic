import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StateMessageProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function StateMessage({ title, description, icon, action, className }: StateMessageProps) {
  return (
    <div role="status" className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}>
      {icon && <div className="text-label-secondary">{icon}</div>}
      <p className="text-section font-bold text-label">{title}</p>
      {description && <p className="max-w-sm text-body text-label-secondary">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 flex h-9 items-center rounded-pill bg-label/[0.08] px-5 text-body font-medium text-label transition-[background-color,transform] duration-200 ease-out hover:bg-label/[0.14] active:scale-[0.96]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
