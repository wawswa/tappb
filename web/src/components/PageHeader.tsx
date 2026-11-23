import type { ReactNode } from 'react';
import { AccountLink } from './AccountLink';

export function PageHeader({
  title,
  subtitle,
  meta,
  action,
  accountLink = true,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  action?: ReactNode;
  accountLink?: boolean;
}) {
  return (
    <header className="mb-6 border-b border-rule pb-5">
      <div className="flex min-h-4 items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-muted">{meta ?? ''}</p>
        {accountLink ? <AccountLink /> : null}
      </div>
      <div className="mt-1 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-[1.1] text-forest-deep">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-[46ch] text-sm leading-6 text-secondary">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
    </header>
  );
}
