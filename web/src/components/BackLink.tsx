import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function BackLink({
  to,
  children,
}: {
  to: '/burung' | '/spotting';
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-secondary transition-colors duration-150 hover:text-forest"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      {children}
    </Link>
  );
}
