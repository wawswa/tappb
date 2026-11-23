export type ConservationStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR';

export interface Bird {
  id: string;
  slug: string;
  name: string;
  scientific_name: string;
  family: string;
  description: string;
  habitat: string;
  diet: string;
  size_cm: number | null;
  conservation_status: ConservationStatus;
  image_url: string;
  image_credit: string;
  image_source_url: string;
  created_at: string;
  sighting_count: number;
}

export interface Sighting {
  id: string;
  bird_id: string;
  user_id: string | null;
  observer_name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  spotted_at: string;
  notes: string | null;
  created_at: string;
  bird_name: string;
  bird_image_url: string;
  bird_scientific_name: string;
}

export interface Stats {
  bird_count: number;
  sighting_count: number;
  species_spotted: number;
}

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface CreateBirdInput {
  slug: string;
  name: string;
  scientific_name: string;
  family: string;
  description: string;
  habitat: string;
  diet: string;
  size_cm?: number | null;
  conservation_status: ConservationStatus;
  image_url?: string;
  image_credit?: string;
  image_source_url?: string;
}

export interface SightingInput {
  bird_id: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  spotted_at?: string;
  notes?: string | null;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Tidak dapat menghubungi server. Periksa koneksi Anda.');
  }

  if (!response.ok) {
    let message = 'Terjadi kesalahan. Coba lagi.';
    try {
      const data = (await response.json()) as { error?: string };
      if (typeof data.error === 'string' && data.error) {
        message = data.error;
      }
    } catch {
      // Respons tanpa body JSON: pakai pesan umum.
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export function getBirds() {
  return request<Bird[]>('/birds');
}

export function getBird(id: string) {
  return request<Bird>(`/birds/${encodeURIComponent(id)}`);
}

export function getSightings(
  { birdId, limit }: { birdId?: string | null; limit?: number | null } = {},
) {
  const params = new URLSearchParams();
  if (birdId) params.set('bird_id', birdId);
  if (limit !== undefined && limit !== null) params.set('limit', String(limit));
  const query = params.toString();
  return request<Sighting[]>(`/sightings${query ? `?${query}` : ''}`);
}

export function getSighting(id: string) {
  return request<Sighting>(`/sightings/${encodeURIComponent(id)}`);
}

export function getStats() {
  return request<Stats>('/stats');
}

export function createSighting(input: SightingInput) {
  return request<Sighting>('/sightings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateSighting(id: string, input: SightingInput) {
  return request<Sighting>(`/sightings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteSighting(id: string) {
  return request<{ message: string }>(`/sightings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function createBird(input: CreateBirdInput) {
  return request<Bird>('/birds', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateBird(id: string, input: CreateBirdInput) {
  return request<Bird>(`/birds/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteBird(id: string) {
  return request<{ message: string }>(`/birds/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function getMe() {
  return request<{ user: AuthUser | null }>('/auth/me');
}

export function login(input: { username: string; password: string }) {
  return request<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout() {
  return request<{ user: null }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
