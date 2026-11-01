import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('skeleton animate-shimmer rounded-[6px]', className)} />;
}
