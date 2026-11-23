import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { SightingForm } from '@/components/SightingForm';
import { ErrorState } from '@/components/States';
import { createSighting, getBirds } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { primaryAction, textAction } from '@/lib/ui';

type CatatSearch = { birdId?: string };

export const Route = createFileRoute('/catat')({
  validateSearch: (search: Record<string, unknown>): CatatSearch => ({
    birdId: typeof search.birdId === 'string' && search.birdId ? search.birdId : undefined,
  }),
  component: CatatPage,
});

function CatatPage() {
  const { birdId: searchBirdId } = Route.useSearch();
  const { user, isLoading: authLoading } = useAuth();
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createSighting,
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['sightings'] });
      void queryClient.invalidateQueries({ queryKey: ['birds'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      void navigate({
        to: '/spotting/$sightingId',
        params: { sightingId: created.id },
      });
      window.scrollTo({ top: 0 });
    },
  });

  const presetBirdId = birdsQuery.data?.some((bird) => bird.id === searchBirdId)
    ? searchBirdId
    : undefined;

  const mutationError =
    mutation.error instanceof Error ? mutation.error.message : mutation.isError
      ? 'Gagal menyimpan spotting. Coba lagi.'
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Catat spotting"
        meta="Log lapangan"
        subtitle="Simpan pertemuanmu dengan burung, lengkap dengan lokasi dan waktu."
      />

      {authLoading ? (
        <div
          className="animate-pulse space-y-5 rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
          aria-hidden="true"
        >
          <div className="h-3 w-1/3 rounded-[2px] bg-sand/50" />
          <div className="h-11 w-full rounded-[8px] bg-sand/40" />
          <div className="h-11 w-full rounded-[8px] bg-sand/40" />
        </div>
      ) : !user ? (
        <div className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
          <p className="text-base font-medium text-forest-deep">
            Masuk untuk mencatat spotting
          </p>
          <p className="mt-1 max-w-[42ch] text-sm leading-6 text-secondary">
            Catatan pengamatan disimpan atas nama akunmu, jadi kamu perlu masuk dulu.
          </p>
          <Link
            to="/masuk"
            search={{
              redirect: searchBirdId
                ? `/catat?birdId=${encodeURIComponent(searchBirdId)}`
                : '/catat',
            }}
            className={`${primaryAction} mt-4`}
          >
            Masuk
          </Link>
        </div>
      ) : birdsQuery.isLoading ? (
        <div
          className="animate-pulse space-y-5 rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
          aria-hidden="true"
        >
          <div className="h-3 w-1/3 rounded-[2px] bg-sand/50" />
          <div className="h-11 w-full rounded-[8px] bg-sand/40" />
          <div className="h-3 w-1/4 rounded-[2px] bg-sand/50" />
          <div className="h-11 w-full rounded-[8px] bg-sand/40" />
          <div className="h-11 w-full rounded-[8px] bg-sand/40" />
        </div>
      ) : birdsQuery.isError ? (
        <ErrorState
          message={birdsQuery.error.message}
          onRetry={() => void birdsQuery.refetch()}
        />
      ) : (
        <SightingForm
          birds={birdsQuery.data ?? []}
          initialBirdId={presetBirdId}
          observerName={user.display_name}
          observerHint={`Dari akun @${user.username}`}
          submitLabel="Simpan spotting"
          isPending={mutation.isPending}
          serverError={mutationError}
          onSubmit={(input) => mutation.mutate(input)}
          cancel={
            <Link to="/spotting" className={`${textAction} w-full justify-center`}>
              Batal
            </Link>
          }
        />
      )}
    </main>
  );
}
