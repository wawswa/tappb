import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SightingCard } from '@/components/SightingCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/States';
import { getSightings } from '@/lib/api';
import { formatNumber } from '@/lib/format';
import { primaryAction } from '@/lib/ui';

export const Route = createFileRoute('/spotting/')({
  component: SpottingListPage,
});

function SpottingListPage() {
  const sightingsQuery = useQuery({
    queryKey: ['sightings', 'list', { birdId: null, limit: 100 }],
    queryFn: () => getSightings({ limit: 100 }),
  });

  const sightings = sightingsQuery.data ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Spotting"
        meta="Log lapangan"
        subtitle="Catatan pengamatan burung dari para pengamat."
        action={
          <Link
            to="/catat"
            className={`${primaryAction} min-h-10 px-4`}
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Catat
          </Link>
        }
      />

      {sightingsQuery.isLoading ? (
        <LoadingSkeleton count={5} />
      ) : sightingsQuery.isError ? (
        <ErrorState
          message={sightingsQuery.error.message}
          onRetry={() => void sightingsQuery.refetch()}
        />
      ) : sightings.length === 0 ? (
        <EmptyState
          title="Belum ada spotting"
          description="Catat pengamatan pertamamu dan mulai susun buku harian burung."
          action={
            <Link to="/catat" className={primaryAction}>
              Catat spotting
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-4 font-mono text-[11px] text-muted">
            {formatNumber(sightings.length)} catatan
          </p>
          <div className="divide-y divide-rule border-y border-rule">
            {sightings.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
