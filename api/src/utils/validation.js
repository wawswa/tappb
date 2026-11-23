const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONSERVATION_STATUSES = ['LC', 'NT', 'VU', 'EN', 'CR'];

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

function ensureBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Body harus berupa objek JSON');
  }
  return body;
}

export function requireString(value, label, { max = 2000 } = {}) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${label} wajib diisi`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ValidationError(`${label} maksimal ${max} karakter`);
  }
  return trimmed;
}

export function optionalString(value, label, { max = 2000 } = {}) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') {
    throw new ValidationError(`${label} harus berupa teks`);
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) {
    throw new ValidationError(`${label} maksimal ${max} karakter`);
  }
  return trimmed;
}

export function requireSlug(value) {
  const slug = requireString(value, 'Slug', { max: 120 });
  if (!SLUG_RE.test(slug)) {
    throw new ValidationError('Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung');
  }
  return slug;
}

export function requireConservationStatus(value) {
  const status = requireString(value, 'Status konservasi', { max: 2 }).toUpperCase();
  if (!CONSERVATION_STATUSES.includes(status)) {
    throw new ValidationError('Status konservasi harus salah satu dari LC, NT, VU, EN, CR');
  }
  return status;
}

export function optionalNumber(value, label, { min, max, integer = false } = {}) {
  if (value === undefined || value === null || value === '') return null;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new ValidationError(`${label} harus berupa angka`);
  }
  if (integer && !Number.isInteger(number)) {
    throw new ValidationError(`${label} harus berupa bilangan bulat`);
  }
  if (min !== undefined && number < min) {
    throw new ValidationError(`${label} minimal ${min}`);
  }
  if (max !== undefined && number > max) {
    throw new ValidationError(`${label} maksimal ${max}`);
  }
  return number;
}

export function optionalDate(value, label) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${label} harus berupa tanggal yang valid`);
  }
  return date.toISOString();
}

export function parseBirdPayload(rawBody) {
  const body = ensureBody(rawBody);
  return {
    slug: requireSlug(body.slug),
    name: requireString(body.name, 'Nama burung', { max: 120 }),
    scientific_name: requireString(body.scientific_name, 'Nama ilmiah', { max: 160 }),
    family: requireString(body.family, 'Famili', { max: 120 }),
    description: requireString(body.description, 'Deskripsi', { max: 2000 }),
    habitat: requireString(body.habitat, 'Habitat', { max: 1000 }),
    diet: requireString(body.diet, 'Pakan', { max: 1000 }),
    size_cm: optionalNumber(body.size_cm, 'Ukuran (cm)', { min: 1, max: 300, integer: true }),
    conservation_status: requireConservationStatus(body.conservation_status),
    image_url: optionalString(body.image_url, 'URL gambar', { max: 500 }) ?? '/birds/placeholder.svg',
    image_credit: optionalString(body.image_credit, 'Kredit gambar', { max: 300 }) ?? 'SpotBird',
    image_source_url: optionalString(body.image_source_url, 'Sumber gambar', { max: 500 }) ?? '',
  };
}

export function parseSightingPayload(rawBody) {
  const body = ensureBody(rawBody);
  if (!isUuid(body.bird_id)) {
    throw new ValidationError('Burung wajib dipilih');
  }
  return {
    bird_id: body.bird_id,
    location_name: requireString(body.location_name, 'Lokasi', { max: 200 }),
    latitude: optionalNumber(body.latitude, 'Latitude', { min: -90, max: 90 }),
    longitude: optionalNumber(body.longitude, 'Longitude', { min: -180, max: 180 }),
    spotted_at: optionalDate(body.spotted_at, 'Tanggal spotting') ?? new Date().toISOString(),
    notes: optionalString(body.notes, 'Catatan', { max: 500 }),
  };
}

export function parseLimit(value) {
  if (value === undefined) return 100;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return 100;
  return Math.min(100, Math.max(1, parsed));
}
