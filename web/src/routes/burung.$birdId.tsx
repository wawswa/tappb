import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { BackLink } from '@/components/BackLink';
import { BirdImage } from '@/components/BirdImage';
import { ConservationBadge } from '@/components/ConservationBadge';
import { DeleteBirdButton } from '@/components/DeleteBirdButton';
import { SightingCard } from '@/components/SightingCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/States';
import { ApiError, getBird, getBirds, getSightings } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { primaryAction } from '@/lib/ui';

export const Route = createFileRoute('/burung/$birdId')({
  component: BirdDetailPage,
});

function BirdDetailPage() {
  const { birdId } = Route.useParams();
  const { isAdmin } = useAuth();

  const birdQuery = useQuery({
    queryKey: ['birds', birdId],
    queryFn: () => getBird(birdId),
  });
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });
  const sightingsQuery = useQuery({
    queryKey: ['sightings', 'list', { birdId, limit: null }],
    queryFn: () => getSightings({ birdId }),
  });

  if (birdQuery.isError) {
    const notFound = birdQuery.error instanceof ApiError && birdQuery.error.status === 404;
    return (
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
        <BackLink to="/burung">Kembali ke katalog</BackLink>
        {notFound ? (
          <EmptyState
            title="Burung tidak ditemukan"
            description="Data burung ini tidak tersedia di katalog."
            action={
              <Link to="/burung" className={primaryAction}>
                Lihat katalog
              </Link>
            }
          />
        ) : (
          <ErrorState
            message={birdQuery.error.message}
            onRetry={() => void birdQuery.refetch()}
          />
        )}
      </main>
    );
  }

  const bird = birdQuery.data;

  if (birdQuery.isLoading || !bird) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6" aria-hidden="true">
        <div className="h-3 w-28 animate-pulse rounded-[2px] bg-sand/60" />
        <div className="mt-3 h-9 w-2/3 animate-pulse rounded-[2px] bg-sand/60" />
        <div className="mt-6 aspect-[4/3] animate-pulse rounded-[6px] bg-sand/50" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-[2px] bg-sand/50" />
          <div className="h-4 w-5/6 animate-pulse rounded-[2px] bg-sand/50" />
        </div>
      </main>
    );
  }

  const sightings = sightingsQuery.data ?? [];
  const birdIndex = (birdsQuery.data ?? []).findIndex((item) => item.id === bird.id);
  const folio = birdIndex >= 0 ? String(birdIndex + 1).padStart(3, '0') : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <BackLink to="/burung">Kembali ke katalog</BackLink>

      <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-muted">
        <span>{folio ? `No. ${folio}` : 'Katalog burung'}</span>
        <span>{bird.family}</span>
      </div>

      <h1 className="mt-2 text-[2.5rem] leading-[1.05] text-forest-deep sm:text-[3rem]">
        {bird.name}
      </h1>
      <p className="mt-1 text-base italic text-secondary">{bird.scientific_name}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ConservationBadge status={bird.conservation_status} />
        <span className="h-3 w-px bg-rule" aria-hidden="true" />
        <span className="font-mono text-[11px] text-muted">
          {bird.size_cm !== null ? `±${bird.size_cm} cm` : 'Ukuran tidak dicatat'}
        </span>
      </div>

      <div className="mt-6 overflow-hidden rounded-[6px] border border-rule bg-sand/30">
        <BirdImage
          src={bird.image_url}
          alt={`Foto ${bird.name}`}
          loading="eager"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted">
        Foto: {bird.image_credit}
        {bird.image_source_url ? (
          <>
            {' · '}
            <a
              href={bird.image_source_url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-rule underline-offset-2 hover:text-forest"
            >
              Sumber
            </a>
          </>
        ) : null}
      </p>

      {isAdmin ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-rule py-3">
          <span className="font-mono text-[11px] text-muted">Admin · kelola entri</span>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/burung/$birdId/edit"
              params={{ birdId: bird.id }}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-forest transition-colors hover:text-forest-deep"
            >
              Edit burung
            </Link>
            <DeleteBirdButton bird={bird} compact />
          </div>
        </div>
      ) : null}

      <section className="mt-8 border-t border-rule pt-5">
        <h2 className="font-mono text-[11px] text-muted">Deskripsi</h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-7 text-ink">{bird.description}</p>
      </section>

      <div className="mt-6 grid gap-6 border-t border-rule pt-5 sm:grid-cols-2">
        <section>
          <h2 className="font-mono text-[11px] text-muted">Habitat</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{bird.habitat}</p>
        </section>
        <section className="sm:border-l sm:border-rule sm:pl-6">
          <h2 className="font-mono text-[11px] text-muted">Pakan</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">{bird.diet}</p>
        </section>
      </div>

      <Link
        to="/catat"
        search={{ birdId: bird.id }}
        className={`${primaryAction} mt-8 w-full`}
      >
        <PlusCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        Catat spotting burung ini
      </Link>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
          <div>
            <p className="font-mono text-[11px] text-muted">Log lapangan</p>
            <h2 className="mt-1 text-2xl text-forest-deep">Spotting burung ini</h2>
          </div>
          <span className="pb-1 font-mono text-[11px] text-muted">
            {bird.sighting_count} catatan
          </span>
        </div>

        {sightingsQuery.isLoading ? (
          <LoadingSkeleton count={2} />
        ) : sightingsQuery.isError ? (
          <div className="mt-4">
            <ErrorState
              message={sightingsQuery.error.message}
              onRetry={() => void sightingsQuery.refetch()}
            />
          </div>
        ) : sightings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Belum ada spotting"
              description="Belum ada yang mencatat burung ini. Kamu bisa menjadi yang pertama."
              action={
                <Link to="/catat" search={{ birdId: bird.id }} className={primaryAction}>
                  Catat spotting
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-rule border-b border-rule">
            {sightings.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
