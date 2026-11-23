import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Bird } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { OfflineBanner } from '@/components/OfflineBanner';
import { primaryAction, secondaryAction } from '@/lib/ui';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RootError,
});

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <OfflineBanner />
      {children}
      <BottomNav />
    </div>
  );
}

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 pb-28 pt-20 sm:px-6">
      <Bird className="h-6 w-6 text-muted" strokeWidth={1.5} aria-hidden="true" />
      <p className="mt-4 font-mono text-[11px] text-muted">404</p>
      <h1 className="mt-1 text-3xl text-forest-deep">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-[42ch] text-sm leading-6 text-secondary">
        Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
      </p>
      <Link to="/" className={`${primaryAction} mt-6`}>
        Kembali ke Beranda
      </Link>
    </main>
  );
}

function RootError({ error }: { error: unknown }) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Aplikasi gagal memuat halaman ini.';

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 pb-28 pt-20 sm:px-6">
      <p className="font-mono text-[11px] text-muted">Kesalahan</p>
      <h1 className="mt-1 text-3xl text-forest-deep">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-[48ch] text-sm leading-6 text-secondary">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={primaryAction}
        >
          Muat ulang
        </button>
        <Link to="/" className={secondaryAction}>
          Beranda
        </Link>
      </div>
    </main>
  );
}
