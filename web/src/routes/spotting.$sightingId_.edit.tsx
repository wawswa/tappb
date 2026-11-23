import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { SightingForm } from '@/components/SightingForm';
import { EmptyState, ErrorState } from '@/components/States';
import type { SightingInput } from '@/lib/api';
import { ApiError, getBirds, getSighting, updateSighting } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { primaryAction, secondaryAction, textAction } from '@/lib/ui';

export const Route = createFileRoute('/spotting/$sightingId_/edit')({
  component: EditSightingPage,
});

function EditSightingPage() {
  const { sightingId } = Route.useParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const sightingQuery = useQuery({
    queryKey: ['sightings', 'detail', sightingId],
    queryFn: () => getSighting(sightingId),
  });
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });

  const mutation = useMutation({
    mutationFn: (input: SightingInput) => updateSighting(sightingId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['sightings', 'detail', sightingId], updated);
      void queryClient.invalidateQueries({ queryKey: ['sightings'] });
      void queryClient.invalidateQueries({ queryKey: ['birds'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      void navigate({
        to: '/spotting/$sightingId',
        params: { sightingId },
      });
      window.scrollTo({ top: 0 });
    },
  });

  const sighting = sightingQuery.data;
  const isOwner = Boolean(user && sighting?.user_id === user.id);
  const canManage = isAdmin || isOwner;
  const mutationError =
    mutation.error instanceof Error ? mutation.error.message : null;

  const notFound =
    sightingQuery.error instanceof ApiError && sightingQuery.error.status === 404;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Edit spotting"
        meta="Log lapangan"
        subtitle="Perbarui catatan pengamatan. Perubahan langsung tampil di log publik."
      />

      {authLoading || sightingQuery.isLoading || birdsQuery.isLoading ? (
        <div
          className="animate-pulse space-y-5 rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
          aria-hidden="true"
        >
          <div className="h-3 w-1/3 rounded-[2px] bg-sand/60" />
          <div className="mt-4 h-11 rounded-[8px] bg-sand/50" />
          <div className="mt-3 h-11 rounded-[8px] bg-sand/50" />
        </div>
      ) : sightingQuery.isError ? (
        notFound ? (
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
        )
      ) : birdsQuery.isError ? (
        <ErrorState
          message={birdsQuery.error.message}
          onRetry={() => void birdsQuery.refetch()}
        />
      ) : !sighting ? null : !user ? (
        <div className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
          <p className="text-base font-medium text-forest-deep">Masuk untuk mengubah spotting</p>
          <p className="mt-1 max-w-[42ch] text-sm leading-6 text-secondary">
            Hanya pengamat yang mencatat spotting ini (atau admin) yang dapat mengubahnya.
          </p>
          <Link
            to="/masuk"
            search={{ redirect: `/spotting/${sightingId}/edit` }}
            className={`${primaryAction} mt-4`}
          >
            Masuk
          </Link>
        </div>
      ) : !canManage ? (
        <div className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
          <p className="text-base font-medium text-forest-deep">
            Spotting ini bukan milikmu
          </p>
          <p className="mt-1 max-w-[42ch] text-sm leading-6 text-secondary">
            Catatan ini dibuat oleh {sighting.observer_name}. Kamu hanya dapat mengubah
            spotting yang kamu catat sendiri.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/spotting/$sightingId"
              params={{ sightingId }}
              className={secondaryAction}
            >
              Lihat spotting
            </Link>
            <Link to="/spotting" className={`${textAction} px-1`}>
              Kembali ke log
            </Link>
          </div>
        </div>
      ) : (
        <SightingForm
          key={sighting.id}
          birds={birdsQuery.data ?? []}
          initial={sighting}
          observerName={sighting.observer_name}
          observerHint={
            isOwner ? `Dari akun @${user.username}` : 'Nama pengamat tidak ikut berubah.'
          }
          submitLabel="Simpan perubahan"
          isPending={mutation.isPending}
          serverError={mutationError}
          onSubmit={(input) => mutation.mutate(input)}
          cancel={
            <Link
              to="/spotting/$sightingId"
              params={{ sightingId }}
              className={`${textAction} w-full justify-center`}
            >
              Batal
            </Link>
          }
        />
      )}
    </main>
  );
}
