import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function IconButton({ label, className, children, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label-secondary transition-[background-color,color,transform] duration-200 ease-out hover:bg-label/[0.08] hover:text-label active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
