import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Bird, ConservationStatus, CreateBirdInput } from '@/lib/api';
import { CONSERVATION_INFO } from '@/lib/conservation';
import { fieldClass, labelClass, primaryAction, textAction } from '@/lib/ui';

const STATUS_OPTIONS: ConservationStatus[] = ['LC', 'NT', 'VU', 'EN', 'CR'];

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BirdForm({
  initial,
  submitLabel,
  pendingLabel = 'Menyimpan…',
  isPending,
  serverError,
  onSubmit,
}: {
  initial?: Bird;
  submitLabel: string;
  pendingLabel?: string;
  isPending: boolean;
  serverError: string | null;
  onSubmit: (input: CreateBirdInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [scientificName, setScientificName] = useState(initial?.scientific_name ?? '');
  const [family, setFamily] = useState(initial?.family ?? '');
  const [sizeCm, setSizeCm] = useState(
    initial?.size_cm !== null && initial?.size_cm !== undefined
      ? String(initial.size_cm)
      : '',
  );
  const [status, setStatus] = useState<ConservationStatus>(
    initial?.conservation_status ?? 'LC',
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [habitat, setHabitat] = useState(initial?.habitat ?? '');
  const [diet, setDiet] = useState(initial?.diet ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [imageCredit, setImageCredit] = useState(initial?.image_credit ?? '');
  const [imageSourceUrl, setImageSourceUrl] = useState(initial?.image_source_url ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(toSlug(value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedScientific = scientificName.trim();
    const trimmedFamily = family.trim();
    const trimmedDescription = description.trim();
    const trimmedHabitat = habitat.trim();
    const trimmedDiet = diet.trim();

    if (
      !trimmedName ||
      !trimmedScientific ||
      !trimmedFamily ||
      !trimmedDescription ||
      !trimmedHabitat ||
      !trimmedDiet
    ) {
      setFormError('Semua field identitas dan deskripsi wajib diisi.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      setFormError('Slug hanya boleh huruf kecil, angka, dan tanda hubung.');
      return;
    }

    let sizeValue: number | null = null;
    if (sizeCm.trim() !== '') {
      sizeValue = Number(sizeCm);
      if (!Number.isInteger(sizeValue) || sizeValue < 1 || sizeValue > 300) {
        setFormError('Ukuran harus bilangan bulat antara 1 dan 300 cm.');
        return;
      }
    }

    onSubmit({
      name: trimmedName,
      slug: trimmedSlug,
      scientific_name: trimmedScientific,
      family: trimmedFamily,
      size_cm: sizeValue,
      conservation_status: status,
      description: trimmedDescription,
      habitat: trimmedHabitat,
      diet: trimmedDiet,
      image_url: imageUrl.trim() || '/birds/placeholder.svg',
      image_credit: imageCredit.trim() || 'SpotBird',
      image_source_url: imageSourceUrl.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
    >
      <fieldset disabled={isPending} className="space-y-6">
        <section>
          <h2 className="font-mono text-[11px] text-muted">Identitas</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bird-name" className={labelClass}>
                Nama burung <span className="text-muted">*</span>
              </label>
              <input
                id="bird-name"
                type="text"
                required
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Contoh: Cendrawasih Raja"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-slug" className={labelClass}>
                Slug <span className="text-muted">*</span>
              </label>
              <input
                id="bird-slug"
                type="text"
                required
                value={slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setSlugTouched(true);
                }}
                placeholder="cendrawasih-raja"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-scientific" className={labelClass}>
                Nama ilmiah <span className="text-muted">*</span>
              </label>
              <input
                id="bird-scientific"
                type="text"
                required
                value={scientificName}
                onChange={(event) => setScientificName(event.target.value)}
                placeholder="Cicinnurus regius"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-family" className={labelClass}>
                Famili <span className="text-muted">*</span>
              </label>
              <input
                id="bird-family"
                type="text"
                required
                value={family}
                onChange={(event) => setFamily(event.target.value)}
                placeholder="Paradisaeidae"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-size" className={labelClass}>
                Ukuran (cm)
              </label>
              <input
                id="bird-size"
                type="number"
                inputMode="numeric"
                min={1}
                max={300}
                step={1}
                value={sizeCm}
                onChange={(event) => setSizeCm(event.target.value)}
                placeholder="16"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-status" className={labelClass}>
                Status konservasi <span className="text-muted">*</span>
              </label>
              <select
                id="bird-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ConservationStatus)}
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} — {CONSERVATION_INFO[option].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="border-t border-rule pt-5">
          <h2 className="font-mono text-[11px] text-muted">Deskripsi</h2>
          <div className="mt-3">
            <label htmlFor="bird-description" className={labelClass}>
              Deskripsi <span className="text-muted">*</span>
            </label>
            <textarea
              id="bird-description"
              required
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ciri fisik, perilaku, dan hal yang membedakannya dari spesies lain"
              className={fieldClass}
            />
          </div>
        </section>

        <section className="border-t border-rule pt-5">
          <h2 className="font-mono text-[11px] text-muted">Habitat dan pakan</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bird-habitat" className={labelClass}>
                Habitat <span className="text-muted">*</span>
              </label>
              <textarea
                id="bird-habitat"
                required
                rows={3}
                maxLength={1000}
                value={habitat}
                onChange={(event) => setHabitat(event.target.value)}
                placeholder="Hutan hujan dataran rendah di Papua"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="bird-diet" className={labelClass}>
                Pakan <span className="text-muted">*</span>
              </label>
              <textarea
                id="bird-diet"
                required
                rows={3}
                maxLength={1000}
                value={diet}
                onChange={(event) => setDiet(event.target.value)}
                placeholder="Buah-buahan dan serangga"
                className={fieldClass}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-rule pt-5">
          <h2 className="font-mono text-[11px] text-muted">Foto (opsional)</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label htmlFor="bird-image" className={labelClass}>
                URL gambar
              </label>
              <input
                id="bird-image"
                type="text"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="/birds/cendrawasih-raja.jpg"
                className={fieldClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bird-credit" className={labelClass}>
                  Kredit foto
                </label>
                <input
                  id="bird-credit"
                  type="text"
                  value={imageCredit}
                  onChange={(event) => setImageCredit(event.target.value)}
                  placeholder="Nama fotografer · lisensi · Wikimedia Commons"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="bird-source" className={labelClass}>
                  URL sumber foto
                </label>
                <input
                  id="bird-source"
                  type="text"
                  value={imageSourceUrl}
                  onChange={(event) => setImageSourceUrl(event.target.value)}
                  placeholder="https://commons.wikimedia.org/wiki/File:..."
                  className={fieldClass}
                />
              </div>
            </div>
            <p className="font-mono text-[11px] text-muted">
              Kosongkan URL gambar untuk memakai placeholder katalog.
            </p>
          </div>
        </section>
      </fieldset>

      {formError || serverError ? (
        <p
          role="alert"
          className="mt-5 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-800"
        >
          {formError ?? serverError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`${primaryAction} w-full disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        <Link to="/burung" className={`${textAction} w-full justify-center`}>
          Batal
        </Link>
      </div>
    </form>
  );
}
