import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { BackLink } from '@/components/BackLink';
import { BirdImage } from '@/components/BirdImage';
import { DeleteSightingButton } from '@/components/DeleteSightingButton';
import { EmptyState, ErrorState } from '@/components/States';
import { ApiError, getSighting } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatCoordinate, formatDateTime } from '@/lib/format';
import { primaryAction } from '@/lib/ui';

export const Route = createFileRoute('/spotting/$sightingId')({
  component: SightingDetailPage,
});

function SightingDetailPage() {
  const { sightingId } = Route.useParams();
  const { user, isAdmin } = useAuth();

  const sightingQuery = useQuery({
    queryKey: ['sightings', 'detail', sightingId],
    queryFn: () => getSighting(sightingId),
  });

  if (sightingQuery.isError) {
    const notFound =
      sightingQuery.error instanceof ApiError && sightingQuery.error.status === 404;
    return (
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
        <BackLink to="/spotting">Kembali ke spotting</BackLink>
        {notFound ? (
          <EmptyState
            title="Spotting tidak ditemukan"
            description="Catatan pengamatan ini tidak tersedia atau sudah dihapus."
            action={
              <Link to="/spotting" className={primaryAction}>
                Lihat semua spotting
              </Link>
            }
          />
        ) : (
          <ErrorState
            message={sightingQuery.error.message}
            onRetry={() => void sightingQuery.refetch()}
          />
        )}
      </main>
    );
  }

  const sighting = sightingQuery.data;

  if (sightingQuery.isLoading || !sighting) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6" aria-hidden="true">
        <div className="h-3 w-28 animate-pulse rounded-[2px] bg-sand/60" />
        <div className="mt-4 aspect-[16/9] animate-pulse rounded-[6px] bg-sand/50" />
        <div className="mt-6 space-y-3 border-y border-rule py-4">
          <div className="h-4 w-2/3 animate-pulse rounded-[2px] bg-sand/50" />
          <div className="h-4 w-1/2 animate-pulse rounded-[2px] bg-sand/50" />
          <div className="h-4 w-3/4 animate-pulse rounded-[2px] bg-sand/50" />
        </div>
      </main>
    );
  }

  const isOwner = Boolean(user && sighting.user_id === user.id);
  const canManage = isAdmin || isOwner;
  const hasCoordinates = sighting.latitude !== null && sighting.longitude !== null;
  const rows = [
    { label: 'Tanggal', value: formatDateTime(sighting.spotted_at) },
    { label: 'Lokasi', value: sighting.location_name },
    {
      label: 'Koordinat',
      value: hasCoordinates
        ? formatCoordinate(sighting.latitude as number, sighting.longitude as number)
        : 'Tidak dicatat',
    },
    { label: 'Pengamat', value: sighting.observer_name },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <BackLink to="/spotting">Kembali ke spotting</BackLink>

      <p className="font-mono text-[11px] text-muted">Catatan lapangan</p>

      <Link
        to="/burung/$birdId"
        params={{ birdId: sighting.bird_id }}
        className="group mt-3 block"
      >
        <div className="overflow-hidden rounded-[6px] border border-rule bg-sand/30">
          <BirdImage
            src={sighting.bird_image_url}
            alt={`Foto ${sighting.bird_name}`}
            loading="eager"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] leading-tight text-forest-deep">
              {sighting.bird_name}
            </h1>
            <p className="mt-0.5 text-sm italic text-secondary">
              {sighting.bird_scientific_name}
            </p>
          </div>
          <span className="mt-2 shrink-0 font-mono text-[11px] text-forest group-hover:underline">
            Profil burung
          </span>
        </div>
      </Link>

      <dl className="mt-6 divide-y divide-rule border-y border-rule">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7rem_1fr] gap-4 py-3.5 sm:grid-cols-[9rem_1fr]"
          >
            <dt className="font-mono text-[11px] text-muted">{row.label}</dt>
            <dd className="text-sm leading-6 text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      {canManage ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-rule py-3">
          <span className="font-mono text-[11px] text-muted">
            {isAdmin && !isOwner ? 'Admin · kelola entri' : 'Spotting kamu'}
          </span>
          <div className="flex items-center gap-4">
            <Link
              to="/spotting/$sightingId/edit"
              params={{ sightingId: sighting.id }}
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-forest transition-colors hover:text-forest-deep"
            >
              Edit spotting
            </Link>
            <DeleteSightingButton sighting={sighting} compact />
          </div>
        </div>
      ) : null}

      {sighting.notes ? (
        <section className="mt-8 border-l-2 border-forest pl-4">
          <h2 className="font-mono text-[11px] text-muted">Catatan</h2>
          <p className="mt-2 text-lg leading-7 text-forest-deep">{sighting.notes}</p>
        </section>
      ) : null}

      <Link
        to="/burung/$birdId"
        params={{ birdId: sighting.bird_id }}
        className={`${primaryAction} mt-8 w-full`}
      >
        Lihat profil {sighting.bird_name}
      </Link>
    </main>
  );
}
