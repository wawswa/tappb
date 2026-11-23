import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Bird, Sighting, SightingInput } from '@/lib/api';
import { fieldClass, labelClass, primaryAction } from '@/lib/ui';

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function SightingForm({
  birds,
  initial,
  initialBirdId,
  observerName,
  observerHint,
  submitLabel,
  pendingLabel = 'Menyimpan…',
  isPending,
  serverError,
  onSubmit,
  cancel,
}: {
  birds: Bird[];
  initial?: Sighting;
  initialBirdId?: string;
  observerName: string;
  observerHint: string;
  submitLabel: string;
  pendingLabel?: string;
  isPending: boolean;
  serverError: string | null;
  onSubmit: (input: SightingInput) => void;
  cancel: ReactNode;
}) {
  const [birdId, setBirdId] = useState(initial?.bird_id ?? initialBirdId ?? '');
  const [locationName, setLocationName] = useState(initial?.location_name ?? '');
  const [spottedAt, setSpottedAt] = useState(() =>
    toLocalInputValue(new Date(initial?.spotted_at ?? Date.now())),
  );
  const [latitude, setLatitude] = useState(String(initial?.latitude ?? ''));
  const [longitude, setLongitude] = useState(String(initial?.longitude ?? ''));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setFormError(null);

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

    onSubmit({
      bird_id: birdId,
      location_name: trimmedLocation,
      spotted_at: spottedDate.toISOString(),
      latitude: latitudeValue,
      longitude: longitudeValue,
      notes: notes.trim() || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
    >
      <fieldset disabled={isPending} className="space-y-5">
        <p className="font-mono text-[11px] text-muted">Field bertanda * wajib diisi</p>

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
            {birds.map((bird) => (
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
          <p className="mt-1 font-mono text-[11px] text-muted">{observerHint}</p>
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

      {formError || serverError ? (
        <p
          role="alert"
          className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-800"
        >
          {formError ?? serverError}
        </p>
      ) : null}

      <div className="mt-6 space-y-1">
        <button
          type="submit"
          disabled={isPending}
          className={`${primaryAction} w-full disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        {cancel}
      </div>
    </form>
  );
}
