import type { ConservationStatus } from '@/lib/api';
import { CONSERVATION_INFO } from '@/lib/conservation';

export function ConservationBadge({
  status,
  className = '',
}: {
  status: ConservationStatus;
  className?: string;
}) {
  const info = CONSERVATION_INFO[status] ?? {
    label: status,
    dotClassName: 'bg-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-secondary ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${info.dotClassName}`}
        aria-hidden="true"
      />
      {info.label}
    </span>
  );
}
