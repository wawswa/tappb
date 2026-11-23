import type { ReactNode } from 'react';
import { Bird, RotateCcw } from 'lucide-react';
import { primaryAction } from '@/lib/ui';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-rule border-y border-rule" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse py-3.5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-[4px] bg-sand/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded-[2px] bg-sand/60" />
              <div className="h-3 w-3/5 rounded-[2px] bg-sand/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-[14px] border border-rule bg-paper"
        >
          <div className="aspect-[4/3] bg-sand/60" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 rounded-[2px] bg-sand/50" />
            <div className="h-5 w-2/3 rounded-[2px] bg-sand/60" />
            <div className="h-3 w-1/2 rounded-[2px] bg-sand/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message = 'Gagal memuat data.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-[12px] border border-rule bg-paper px-4 py-5"
    >
      <p className="text-sm leading-6 text-secondary">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={`${primaryAction} mt-4 min-h-10 px-4`}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-y border-rule py-10 text-center">
      <Bird className="mx-auto h-5 w-5 text-muted" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-3 text-base font-medium text-forest-deep">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-[38ch] text-sm leading-6 text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
