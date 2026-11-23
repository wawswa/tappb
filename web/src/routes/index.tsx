import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Bird, PlusCircle } from 'lucide-react';
import { AccountLink } from '@/components/AccountLink';
import { ConservationBadge } from '@/components/ConservationBadge';
import { BirdImage } from '@/components/BirdImage';
import { SightingCard } from '@/components/SightingCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/States';
import { getBirds, getSightings, getStats } from '@/lib/api';
import { formatNumber } from '@/lib/format';
import { primaryAction, secondaryAction } from '@/lib/ui';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });
  const recentQuery = useQuery({
    queryKey: ['sightings', 'list', { birdId: null, limit: 3 }],
    queryFn: () => getSightings({ limit: 3 }),
  });

  const birds = birdsQuery.data ?? [];
  const featured =
    birds.find((bird) => bird.slug === 'jalak-bali') ??
    birds.find((bird) => bird.conservation_status === 'CR') ??
    birds[0];
  const featuredIndex = featured ? birds.findIndex((bird) => bird.id === featured.id) : -1;
  const recent = recentQuery.data ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <section className="border-b border-rule pb-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[6px] bg-forest text-cream">
              <Bird className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="font-serif text-lg font-medium text-forest-deep">SpotBird</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-muted sm:inline">
              Katalog lapangan
            </span>
            <AccountLink />
          </div>
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="text-[2.6rem] leading-[1.05] text-forest-deep sm:text-5xl">
              Kenali burung di sekitarmu.
            </h1>
            <p className="mt-4 max-w-[34ch] text-base leading-7 text-secondary">
              Katalog burung Indonesia dan buku catatan pengamatan, dari taman kota sampai
              hutan hujan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/burung" className={primaryAction}>
                Jelajahi katalog
              </Link>
              <Link to="/catat" className={secondaryAction}>
                <PlusCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Catat spotting
              </Link>
            </div>
          </div>

          {birdsQuery.isLoading ? (
            <div className="animate-pulse" aria-hidden="true">
              <div className="aspect-[4/3] rounded-[6px] border border-rule bg-sand/50 lg:aspect-[4/5]" />
              <div className="mt-3 border-t border-rule pt-2">
                <div className="h-3 w-24 rounded-[2px] bg-sand/60" />
              </div>
            </div>
          ) : birdsQuery.isError ? (
            <div className="rounded-[6px] border border-rule bg-paper p-5">
              <p className="text-sm leading-6 text-secondary">
                Katalog belum dapat dimuat. Periksa koneksi lalu coba lagi.
              </p>
              <button
                type="button"
                onClick={() => void birdsQuery.refetch()}
                className={`${secondaryAction} mt-3 min-h-10 px-4`}
              >
                Coba lagi
              </button>
            </div>
          ) : featured ? (
            <Link
              to="/burung/$birdId"
              params={{ birdId: featured.id }}
              className="group block"
            >
              <div className="overflow-hidden rounded-[6px] border border-rule bg-sand/30">
                <BirdImage
                  src={featured.image_url}
                  alt={`Foto ${featured.name}`}
                  loading="eager"
                  className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
                />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-rule pt-2 font-mono text-[11px] text-muted">
                <span>No. {String(featuredIndex + 1).padStart(3, '0')}</span>
                <span>{formatNumber(featured.sighting_count)} catatan</span>
              </div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl leading-tight text-forest-deep">
                    {featured.name}
                  </p>
                  <p className="mt-0.5 text-sm italic text-secondary">
                    {featured.scientific_name}
                  </p>
                </div>
                <ConservationBadge status={featured.conservation_status} />
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section aria-label="Statistik SpotBird" className="grid grid-cols-3 border-b border-rule">
        {statsQuery.isLoading ? (
          [0, 1, 2].map((item) => (
            <div
              key={item}
              className={`py-4 ${item === 0 ? 'pr-4' : 'border-l border-rule pl-4'}`}
              aria-hidden="true"
            >
              <div className="h-8 w-10 animate-pulse rounded-[2px] bg-sand/60" />
              <div className="mt-2 h-3 w-14 animate-pulse rounded-[2px] bg-sand/40" />
            </div>
          ))
        ) : statsQuery.isError ? (
          <div className="col-span-3 py-4">
            <ErrorState
              message={statsQuery.error.message}
              onRetry={() => void statsQuery.refetch()}
            />
          </div>
        ) : (
          [
            { label: 'Burung', value: statsQuery.data?.bird_count ?? 0 },
            { label: 'Spotting', value: statsQuery.data?.sighting_count ?? 0 },
            { label: 'Spesies', value: statsQuery.data?.species_spotted ?? 0 },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`py-4 ${index === 0 ? 'pr-4' : 'border-l border-rule pl-4'}`}
            >
              <p className="font-serif text-[2rem] leading-none tabular-nums text-forest-deep">
                {formatNumber(stat.value)}
              </p>
              <p className="mt-2 text-[11px] text-muted">{stat.label}</p>
            </div>
          ))
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
          <div>
            <p className="font-mono text-[11px] text-muted">Log lapangan</p>
            <h2 className="mt-1 text-2xl text-forest-deep">Spotting terbaru</h2>
          </div>
          <Link
            to="/spotting"
            className="pb-1 text-[13px] font-medium text-forest hover:text-forest-deep"
          >
            Semua catatan
          </Link>
        </div>

        {recentQuery.isLoading ? (
          <LoadingSkeleton count={3} />
        ) : recentQuery.isError ? (
          <div className="mt-4">
            <ErrorState
              message={recentQuery.error.message}
              onRetry={() => void recentQuery.refetch()}
            />
          </div>
        ) : recent.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Belum ada spotting"
              description="Jadilah yang pertama mencatat pengamatan burung."
              action={
                <Link to="/catat" className={primaryAction}>
                  Catat spotting
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-rule border-b border-rule">
            {recent.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
