import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminOnly } from '@/components/AdminOnly';
import { BirdForm } from '@/components/BirdForm';
import { DeleteBirdButton } from '@/components/DeleteBirdButton';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/States';
import type { Bird, CreateBirdInput } from '@/lib/api';
import { ApiError, getBird, updateBird } from '@/lib/api';

export const Route = createFileRoute('/admin/burung/$birdId/edit')({
  component: AdminEditBirdPage,
});

function AdminEditBirdPage() {
  const { birdId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const birdQuery = useQuery({
    queryKey: ['birds', birdId],
    queryFn: () => getBird(birdId),
  });

  const mutation = useMutation({
    mutationFn: (input: CreateBirdInput) => updateBird(birdId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['birds', birdId], updated);
      queryClient.setQueryData<Bird[]>(['birds'], (current) =>
        current?.map((item) => (item.id === updated.id ? updated : item)),
      );
      void queryClient.invalidateQueries({ queryKey: ['birds'], exact: true });
      void navigate({
        to: '/burung/$birdId',
        params: { birdId },
      });
      window.scrollTo({ top: 0 });
    },
  });

  const mutationError =
    mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Edit burung"
        meta="Admin · Katalog"
        subtitle="Perbarui data katalog. Perubahan langsung tampil di halaman publik."
      />
      <AdminOnly redirect={`/admin/burung/${birdId}/edit`}>
        {birdQuery.isLoading ? (
          <div
            className="animate-pulse rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
            aria-hidden="true"
          >
            <div className="h-3 w-1/3 rounded-[2px] bg-sand/60" />
            <div className="mt-4 h-11 rounded-[8px] bg-sand/50" />
            <div className="mt-3 h-11 rounded-[8px] bg-sand/50" />
          </div>
        ) : birdQuery.isError ? (
          birdQuery.error instanceof ApiError && birdQuery.error.status === 404 ? (
            <EmptyState
              title="Burung tidak ditemukan"
              description="Data burung ini tidak tersedia di katalog."
            />
          ) : (
            <ErrorState
              message={birdQuery.error.message}
              onRetry={() => void birdQuery.refetch()}
            />
          )
        ) : birdQuery.data ? (
          <>
            <BirdForm
              initial={birdQuery.data}
              submitLabel="Simpan perubahan"
              pendingLabel="Menyimpan…"
              isPending={mutation.isPending}
              serverError={mutationError}
              onSubmit={(input) => mutation.mutate(input)}
            />

            <section className="mt-8 border-t border-rule pt-4">
              <h2 className="font-mono text-[11px] text-muted">Hapus burung</h2>
              <p className="mt-1 max-w-[52ch] text-sm leading-6 text-secondary">
                Menghapus burung juga menghapus seluruh spotting yang terkait. Tindakan ini
                tidak bisa dibatalkan.
              </p>
              <div className="mt-3">
                <DeleteBirdButton bird={birdQuery.data} />
              </div>
            </section>
          </>
        ) : null}
      </AdminOnly>
    </main>
  );
}
