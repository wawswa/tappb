import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { Sighting } from '@/lib/api';
import { deleteSighting } from '@/lib/api';
import { dangerAction, secondaryAction } from '@/lib/ui';

export function DeleteSightingButton({
  sighting,
  compact = false,
}: {
  sighting: Sighting;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => deleteSighting(sighting.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['sightings', 'detail', sighting.id] });
      void queryClient.invalidateQueries({ queryKey: ['sightings'] });
      void queryClient.invalidateQueries({ queryKey: ['birds'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      void navigate({ to: '/spotting' });
      window.scrollTo({ top: 0 });
    },
  });

  const mutationError =
    mutation.error instanceof Error ? mutation.error.message : null;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          compact
            ? 'inline-flex min-h-11 items-center text-[13px] font-medium text-red-800 transition-colors hover:text-red-950'
            : dangerAction
        }
      >
        Hapus
      </button>
    );
  }

  return (
    <div
      role="alert"
      className="w-full rounded-[10px] border border-red-700/30 bg-red-50/60 p-4"
    >
      <p className="text-sm leading-6 text-red-900">
        Hapus spotting {sighting.bird_name} di {sighting.location_name}? Tindakan ini
        tidak bisa dibatalkan.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-red-800 px-4 text-sm font-medium text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Menghapus…' : 'Ya, hapus'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={mutation.isPending}
          className={`${secondaryAction} min-h-10 px-4`}
        >
          Batal
        </button>
      </div>
      {mutationError ? (
        <p className="mt-3 text-sm leading-6 text-red-900">{mutationError}</p>
      ) : null}
    </div>
  );
}
