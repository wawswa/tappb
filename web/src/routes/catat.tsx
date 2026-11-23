import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState } from '@/components/States';
import { createSighting, getBirds } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fieldClass, labelClass, primaryAction, textAction } from '@/lib/ui';

type CatatSearch = { birdId?: string };

export const Route = createFileRoute('/catat')({
  validateSearch: (search: Record<string, unknown>): CatatSearch => ({
    birdId: typeof search.birdId === 'string' && search.birdId ? search.birdId : undefined,
  }),
  component: CatatPage,
});

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function CatatPage() {
  const { birdId: searchBirdId } = Route.useSearch();
  const { user, isLoading: authLoading } = useAuth();
  const birdsQuery = useQuery({ queryKey: ['birds'], queryFn: getBirds });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [birdId, setBirdId] = useState('');
  const [locationName, setLocationName] = useState('');
  const [spottedAt, setSpottedAt] = useState(() => toLocalInputValue(new Date()));
  const observerName = user?.display_name ?? '';
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const appliedSearchBird = useRef(false);

  useEffect(() => {
    if (appliedSearchBird.current) return;
    if (!searchBirdId || !birdsQuery.data) return;
    if (birdsQuery.data.some((bird) => bird.id === searchBirdId)) {
      setBirdId(searchBirdId);
    }
    appliedSearchBird.current = true;
  }, [searchBirdId, birdsQuery.data]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    setFormError(null);
    if (!user) {
      setFormError('Masuk terlebih dahulu untuk mencatat spotting.');
      return;
    }

    const trimmedLocation = locationName.trim();
    const trimmedObserver = observerName.trim();

    if (!birdId) {
      setFormError('Pilih burung yang diamati terlebih dahulu.');
      return;
    }
    if (!trimmedLocation) {
      setFormError('Lokasi pengamatan wajib diisi.');
      return;
    }
    if (!trimmedObserver) {
      setFormError('Nama pengamat wajib diisi.');
      return;
    }
    if (!spottedAt) {
      setFormError('Tanggal dan waktu spotting wajib diisi.');
      return;
    }

    const spottedDate = new Date(spottedAt);
    if (Number.isNaN(spottedDate.getTime())) {
      setFormError('Tanggal dan waktu spotting tidak valid.');
      return;
    }

    let latitudeValue: number | null = null;
    if (latitude.trim() !== '') {
      latitudeValue = Number(latitude);
      if (!Number.isFinite(latitudeValue) || latitudeValue < -90 || latitudeValue > 90) {
        setFormError('Latitude harus berupa angka antara -90 dan 90.');
        return;
      }
    }

    let longitudeValue: number | null = null;
    if (longitude.trim() !== '') {
      longitudeValue = Number(longitude);
      if (!Number.isFinite(longitudeValue) || longitudeValue < -180 || longitudeValue > 180) {
        setFormError('Longitude harus berupa angka antara -180 dan 180.');
        return;
      }
    }

    mutation.mutate({
      bird_id: birdId,
      location_name: trimmedLocation,
      observer_name: trimmedObserver,
      spotted_at: spottedDate.toISOString(),
      latitude: latitudeValue,
      longitude: longitudeValue,
      notes: notes.trim() || null,
    });
  }

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
        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
        >
          <fieldset disabled={mutation.isPending} className="space-y-5">
            <p className="font-mono text-[11px] text-muted">
              Field bertanda * wajib diisi
            </p>

            <div>
              <label htmlFor="bird_id" className={labelClass}>
                Burung <span className="text-muted">*</span>
              </label>
              <select
                id="bird_id"
                required
                value={birdId}
                onChange={(event) => setBirdId(event.target.value)}
                className={fieldClass}
              >
                <option value="">Pilih burung</option>
                {(birdsQuery.data ?? []).map((bird) => (
                  <option key={bird.id} value={bird.id}>
                    {bird.name} — {bird.scientific_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location_name" className={labelClass}>
                Lokasi <span className="text-muted">*</span>
              </label>
              <input
                id="location_name"
                type="text"
                required
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                placeholder="Contoh: Kebun Raya Bogor"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="spotted_at" className={labelClass}>
                Tanggal dan waktu <span className="text-muted">*</span>
              </label>
              <input
                id="spotted_at"
                type="datetime-local"
                required
                value={spottedAt}
                onChange={(event) => setSpottedAt(event.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="observer_name" className={labelClass}>
                Nama pengamat
              </label>
              <input
                id="observer_name"
                type="text"
                required
                readOnly
                value={observerName}
                className={`${fieldClass} text-secondary`}
              />
              <p className="mt-1 font-mono text-[11px] text-muted">
                Dari akun @{user.username}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="latitude" className={labelClass}>
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={-90}
                  max={90}
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  placeholder="-6.5975"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="longitude" className={labelClass}>
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={-180}
                  max={180}
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  placeholder="106.7993"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className={labelClass}>
                Catatan
              </label>
              <textarea
                id="notes"
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Perilaku, jumlah individu, atau detail lain yang menarik"
                className={fieldClass}
              />
              <p className="mt-1 text-right font-mono text-[11px] text-muted">
                {notes.length}/500
              </p>
            </div>
          </fieldset>

          {formError || mutationError ? (
            <p
              role="alert"
              className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-800"
            >
              {formError ?? mutationError}
            </p>
          ) : null}

          <div className="mt-6 space-y-1">
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`${primaryAction} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {mutation.isPending ? 'Menyimpan…' : 'Simpan spotting'}
            </button>
            <Link to="/spotting" className={`${textAction} w-full justify-center`}>
              Batal
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
