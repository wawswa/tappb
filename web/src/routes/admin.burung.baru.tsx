import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminOnly } from '@/components/AdminOnly';
import { BirdForm } from '@/components/BirdForm';
import { PageHeader } from '@/components/PageHeader';
import { createBird } from '@/lib/api';

export const Route = createFileRoute('/admin/burung/baru')({
  component: AdminNewBirdPage,
});

function AdminNewBirdPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createBird,
    onSuccess: (bird) => {
      void queryClient.invalidateQueries({ queryKey: ['birds'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      void navigate({
        to: '/burung/$birdId',
        params: { birdId: bird.id },
      });
      window.scrollTo({ top: 0 });
    },
  });

  const mutationError =
    mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Tambah burung"
        meta="Admin · Katalog"
        subtitle="Tambahkan spesies baru ke katalog. Foto boleh dikosongkan; placeholder akan dipakai."
      />
      <AdminOnly redirect="/admin/burung/baru">
        <BirdForm
          submitLabel="Simpan burung"
          pendingLabel="Menyimpan…"
          isPending={mutation.isPending}
          serverError={mutationError}
          onSubmit={(input) => mutation.mutate(input)}
        />
      </AdminOnly>
    </main>
  );
}
