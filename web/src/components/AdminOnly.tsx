import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { primaryAction, secondaryAction } from '@/lib/ui';

export function AdminOnly({
  redirect,
  children,
}: {
  redirect: string;
  children: ReactNode;
}) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="animate-pulse rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
        aria-hidden="true"
      >
        <div className="h-3 w-1/3 rounded-[2px] bg-sand/60" />
        <div className="mt-4 h-11 rounded-[8px] bg-sand/50" />
        <div className="mt-3 h-11 rounded-[8px] bg-sand/50" />
        <div className="mt-3 h-11 rounded-[8px] bg-sand/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
        <p className="text-base font-medium text-forest-deep">Akses admin diperlukan</p>
        <p className="mt-1 max-w-[42ch] text-sm leading-6 text-secondary">
          Hanya akun admin yang dapat mengelola katalog burung.
        </p>
        <Link
          to="/masuk"
          search={{ redirect }}
          className={`${primaryAction} mt-4`}
        >
          Masuk sebagai admin
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
        <p className="text-base font-medium text-forest-deep">
          Akun @{user.username} bukan admin
        </p>
        <p className="mt-1 max-w-[42ch] text-sm leading-6 text-secondary">
          Kamu tetap bisa mencatat spotting lewat halaman Catat.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/catat" className={primaryAction}>
            Catat spotting
          </Link>
          <Link to="/" className={secondaryAction}>
            Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
