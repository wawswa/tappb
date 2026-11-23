import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { BirdCard } from '@/components/BirdCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState, GridSkeleton } from '@/components/States';
import { getBirds } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fieldClass, primaryAction, secondaryAction } from '@/lib/ui';

export const Route = createFileRoute('/burung/')({
  component: BirdCatalogPage,
});

function BirdCatalogPage() {
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');

  const birds = birdsQuery.data ?? [];
  const term = search.trim().toLowerCase();
  const indexed = birds.map((bird, index) => ({ bird, index }));
  const filtered = term
    ? indexed.filter(({ bird }) =>
        [bird.name, bird.scientific_name, bird.family].some((value) =>
          value.toLowerCase().includes(term),
        ),
      )
    : indexed;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Katalog burung"
        meta="Panduan lapangan"
        subtitle="Katalog burung Indonesia, lengkap dengan nama ilmiah dan status konservasinya."
        action={
          isAdmin ? (
            <Link
              to="/admin/burung/baru"
              className={`${primaryAction} min-h-10 px-4`}
            >
              <PlusCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Burung
            </Link>
          ) : undefined
        }
      />

      <div className="mb-5">
        <label htmlFor="search-burung" className="mb-1.5 block text-[13px] font-medium text-ink">
          Cari burung
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            id="search-burung"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nama atau famili"
            className={`${fieldClass} pl-9`}
          />
        </div>
      </div>

      {birdsQuery.isLoading ? (
        <GridSkeleton count={6} />
      ) : birdsQuery.isError ? (
        <ErrorState
          message={birdsQuery.error.message}
          onRetry={() => void birdsQuery.refetch()}
        />
      ) : birds.length === 0 ? (
        <EmptyState
          title="Belum ada data burung"
          description="Katalog masih kosong. Coba muat ulang beberapa saat lagi."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Burung tidak ditemukan"
          description={`Tidak ada hasil untuk “${search.trim()}”. Coba kata kunci lain.`}
          action={
            <button
              type="button"
              onClick={() => setSearch('')}
              className={secondaryAction}
            >
              Hapus pencarian
            </button>
          }
        />
      ) : (
        <>
          <p className="mb-4 font-mono text-[11px] text-muted">
            {filtered.length} dari {birds.length} burung
          </p>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {filtered.map(({ bird, index }) => (
              <BirdCard key={bird.id} bird={bird} index={index} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
