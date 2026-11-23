# SpotBird

Katalog burung Indonesia dan buku catatan spotting, dibangun sebagai **Progressive Web App**
di atas **API Express + PostgreSQL** milik sendiri.

- Frontend: React 19, TypeScript, Vite 8, TanStack Router (SPA), TanStack Query, Tailwind CSS 4,
  `vite-plugin-pwa` + Workbox.
- Backend: Express 5, `pg`, PostgreSQL 16, struktur `config/models/controllers/routes`
  mengikuti Modul 1.
- Database pengembangan berjalan di **Podman rootless**. Skrip database juga mendeteksi
  Docker sebagai fallback; kode API tidak berubah.

## Struktur repository

```
api/                 API Express + skema & seed PostgreSQL
web/                 PWA React (Vite + TanStack Router/Query)
scripts/             Skrip Podman/Docker untuk database lokal
```

## Prasyarat

- Node.js 26+ dan pnpm 10 (`packageManager` menetapkan pnpm 10.33.4)
- Podman rootless (disarankan) atau Docker

## Quick start

```bash
pnpm install
cp api/.env.example api/.env
pnpm db:up
pnpm --filter spotbird-api create-user admin "Admin SpotBird" admin "ganti-password-admin"
pnpm --filter spotbird-api create-user pengamat "Pengamat" user "ganti-password-user"
pnpm dev
```

Akun admin dapat menambah burung; akun user dapat mencatat spotting, lalu mengubah atau
menghapus catatannya sendiri. Login di
<http://localhost:5173/masuk>.

Buka:

- Web: <http://localhost:5173>
- API health: <http://localhost:3001/api/health>

`pnpm db:up` membuat container `spotbird-db` (PostgreSQL 16, user/password/database
`spotbird`, volume `spotbird_pgdata`, port host `5433`). Pada pembuatan pertama, `schema.sql`
dan `seed.sql` dijalankan otomatis oleh image PostgreSQL sehingga tersedia 12 burung dan
12 spotting.

## Script

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Jalankan API (3001) dan web (5173) bersamaan |
| `pnpm dev:api` | Jalankan API saja dengan `node --watch` |
| `pnpm dev:web` | Jalankan Vite dev server |
| `pnpm build` | Build produksi PWA ke `web/dist` |
| `pnpm preview` | Sajikan hasil build di port 4173 (proxy `/api` ke 3001) |
| `pnpm typecheck` | Typecheck TypeScript |
| `pnpm db:up` | Buat/nyalakan container database dan tunggu siap |
| `pnpm db:reset` | Hapus container + volume, buat ulang, jalankan schema & seed |
| `pnpm db:psql` | Shell `psql` interaktif ke database |
| `pnpm --filter spotbird-api create-user <username> "<nama>" <admin\|user> "<password>"` | Buat akun atau reset password/role |

## Konfigurasi

`api/.env` (contoh di `api/.env.example`):

```env
DATABASE_URL=postgresql://spotbird:spotbird@localhost:5433/spotbird
PORT=3001
```

- `DATABASE_URL` wajib; API berhenti dengan pesan jelas jika kosong.
- `HOST` opsional, default `127.0.0.1` agar API tidak terbuka ke jaringan. Set `0.0.0.0`
  hanya bila API perlu diakses langsung dari perangkat lain.
- `VITE_API_URL` opsional untuk build web. Default `/api` (diproksikan ke API saat dev/preview).
- Jika port bentrok, ubah `PORT`, target proxy di `web/vite.config.ts`, pemetaan port di
  `scripts/db-up.sh`, dan `DATABASE_URL` secara bersamaan.

### Memakai PostgreSQL hosted/Supabase

Kode API memakai driver `pg` biasa, jadi tidak ada perubahan kode:

1. Jalankan `api/db/schema.sql` lalu `api/db/seed.sql` pada database hosted (SQL Editor atau
   `psql`).
2. Isi `DATABASE_URL` dengan connection string hosted (gunakan pooler dan `sslmode=require`
   bila penyedia mensyaratkannya).
3. Lewati `pnpm db:up` dan jalankan `pnpm dev:api`.

## API

Base URL: `http://localhost:3001/api`. Respons memakai `snake_case`; list berupa array polos;
error berupa `{ "error": "..." }`.

| Method | Path | Akses | Keterangan |
|---|---|---|---|
| GET | `/health` | publik | `{ "status": "ok" }` |
| POST | `/auth/login` | publik | Login, set cookie sesi 7 hari |
| POST | `/auth/logout` | publik | Hapus sesi |
| GET | `/auth/me` | publik | `{ "user": ... }` atau `{ "user": null }` |
| GET | `/birds` | publik | Semua burung urut nama + `sighting_count` |
| GET | `/birds/:id` | publik | Detail burung + `sighting_count`; 404 jika tidak ada |
| POST | `/birds` | admin | Tambah burung (201) |
| PUT | `/birds/:id` | admin | Update penuh burung |
| DELETE | `/birds/:id` | admin | Hapus burung (sighting terkait ikut terhapus) |
| GET | `/sightings?bird_id=&limit=` | publik | Daftar spotting terbaru + data burung; `limit` 1–100 |
| GET | `/sightings/:id` | publik | Detail spotting + data burung |
| POST | `/sightings` | user/admin | Tambah spotting (201); `observer_name` diambil dari sesi |
| PUT | `/sightings/:id` | pemilik/admin | Update penuh spotting; `observer_name` tetap |
| DELETE | `/sightings/:id` | pemilik/admin | Hapus spotting |
| GET | `/stats` | publik | `bird_count`, `sighting_count`, `species_spotted` |

Field burung: `id, slug, name, scientific_name, family, description, habitat, diet, size_cm,
conservation_status, image_url, image_credit, image_source_url, created_at, sighting_count`.

Field spotting: `id, bird_id, user_id, observer_name, location_name, latitude, longitude, spotted_at,
notes, created_at, bird_name, bird_image_url, bird_scientific_name`.

Validasi mengembalikan 400 dengan pesan bahasa Indonesia. `latitude`/`longitude`/`size_cm`
dikonversi menjadi angka atau `null`; tanggal berupa string ISO.

Contoh:

```bash
curl -s http://localhost:3001/api/stats
curl -s "http://localhost:3001/api/sightings?limit=3"
```

## Akun dan peran

- **Admin** — boleh menambah, mengubah, dan menghapus burung; boleh mencatat spotting, serta
  mengubah dan menghapus spotting milik siapa pun.
- **User** — boleh mencatat spotting, serta mengubah dan menghapus spotting miliknya sendiri;
  katalog tetap bisa dibaca tanpa login.
- Spotting lama tanpa pemilik (`user_id` kosong, termasuk data seed) hanya bisa diubah admin.
- Tidak ada pendaftaran publik. Akun dibuat atau diubah lewat CLI:

```bash
pnpm --filter spotbird-api create-user <username> "<nama tampilan>" <admin|user> "<password>"
```

Perintah ini membuat akun baru atau mereset password/role bila username sudah ada.
Password disimpan sebagai hash scrypt. Sesi disimpan di tabel `sessions`; cookie
`spotbird_session` bersifat `HttpOnly`, `SameSite=Lax`, dan `Secure` saat diakses lewat
HTTPS, berlaku 7 hari.

Halaman:

- `/masuk` — login admin dan user; role ditentukan oleh akun.
- `/admin/burung/baru` — form tambah burung, hanya untuk admin.
- `/admin/burung/$birdId/edit` — edit dan hapus burung, hanya untuk admin. Hapus memakai
  konfirmasi dan ikut menghapus spotting burung tersebut.
- `/catat` — wajib login; nama pengamat diambil dari akun.
- `/spotting/$sightingId/edit` — edit spotting; hanya pemilik atau admin. Detail spotting
  menampilkan panel **Edit spotting** dan **Hapus** untuk keduanya.

Di halaman detail burung, admin melihat panel **Edit burung** dan **Hapus**. Di halaman
detail spotting, pemilik dan admin melihat panel **Edit spotting** dan **Hapus**; hapus
memakai konfirmasi di tempat.

Database lama perlu migrasi sekali (urut):

```bash
podman exec -i spotbird-db psql -U spotbird -d spotbird -v ON_ERROR_STOP=1 \
  < api/db/migrations/001_auth.sql
podman exec -i spotbird-db psql -U spotbird -d spotbird -v ON_ERROR_STOP=1 \
  < api/db/migrations/002_sighting_owner.sql
```

## Reset database

```bash
pnpm db:reset
```

Perintah ini menghapus container dan volume `spotbird_pgdata`, lalu membuat ulang database
dari `schema.sql` + `seed.sql`. Database akhir berisi 12 burung, 12 spotting, dan 10 spesies
teramati. Akun tidak ikut di-seed; buat ulang dengan perintah `create-user` di atas.

## PWA dan uji offline

Service worker hanya aktif pada build produksi:

```bash
pnpm build
pnpm preview
```

Buka <http://localhost:4173>, tunggu service worker aktif, lalu reload sekali agar halaman
dikontrol service worker. Setelah halaman dan data pernah dibuka:

1. Putuskan koneksi (DevTools → Network → Offline).
2. Reload `/burung`; app shell dan data dari cache tetap tampil, banner
   “Mode offline — data tersimpan tetap dapat dibaca.” muncul.
3. Detail burung yang pernah dibuka tetap tersedia; rute yang belum pernah dibuka
   menampilkan error state dengan tombol “Coba lagi”.

Konfigurasi PWA: manifest `standalone`, ikon 192/512 + maskable, precache app shell
(termasuk 12 foto), `NetworkFirst` untuk `/api/` dengan timeout 3 detik dan cache 7 hari.
Endpoint `/api/auth/` sengaja dikecualikan dari cache agar status sesi tidak tersimpan di
service worker. Registrasi memakai `registerType: 'autoUpdate'`.

## Deployment

Deployment aktif: **<https://spotbird.myeong.xyz>**

Arsitektur: aplikasi tetap berjalan di mesin lokal, sedangkan host publik hanya menjadi
reverse proxy nginx melalui Tailscale. DNS `spotbird.myeong.xyz` diproksikan Cloudflare
(mode SSL Full); origin memakai sertifikat Let's Encrypt khusus domain tersebut.

```
Browser
  | HTTPS
  v
Cloudflare edge (spotbird.myeong.xyz)
  | HTTPS (Full)
  v
Host publik 139.190.105.194 (Tailscale 100.64.0.3)
  nginx :80/:443 -> proxy_pass http://100.64.0.2:4173
  TLS Let's Encrypt spotbird.myeong.xyz
        ^
        | Tailscale
        v
Mesin lokal (Tailscale 100.64.0.2)
  PostgreSQL Podman  127.0.0.1:5433   container spotbird-db
  API Express        127.0.0.1:3001   systemd --user spotbird-api
  Web (vite preview) 0.0.0.0:4173     systemd --user spotbird-web
```

Konsekuensi: mesin lokal dan Tailscale harus menyala. Jika salah satu mati, URL publik
menampilkan 502, tetapi PWA yang sudah pernah dibuka tetap memakai cache service worker.

Operasional:

```bash
# status & log service lokal
systemctl --user status spotbird-api spotbird-web
journalctl --user -u spotbird-api -f
journalctl --user -u spotbird-web -f

# setelah mengubah web
pnpm build && systemctl --user restart spotbird-web

# database
pnpm db:up
pnpm db:psql
```

Container `spotbird-db` memakai restart policy `always`; unit user `podman-restart.service`
diaktifkan bersama linger sehingga database ikut hidup setelah reboot.

Di host publik:

- Konfigurasi vhost utama: `/etc/nginx/sites-available/spotbird-myeong` (symlink di
  `sites-enabled`). Vhost `spotbird` untuk hostname sslip tetap ada sebagai alias.
- Sertifikat: `/etc/letsencrypt/live/spotbird.myeong.xyz/`; perpanjangan otomatis oleh
  timer Certbot.
- `sw.js`, `registerSW.js`, dan manifest dikirim dengan `Cache-Control: no-store` serta
  `Cloudflare-CDN-Cache-Control: no-store` agar update PWA tidak tertahan cache edge.
- Proxy mengizinkan `GET`/`HEAD`/`OPTIONS`, ditambah POST untuk `/api/auth/login`,
  `/api/auth/logout`, `/api/sightings`, dan `/api/birds`, serta `PUT`/`DELETE` khusus
  `/api/birds/<uuid>` dan `/api/sightings/<uuid>`. API tetap menolak operasi tulis burung
  dari non-admin (`403`), POST spotting tanpa sesi (`401`), dan edit/hapus spotting oleh
  selain pemilik atau admin (`403`). Login dibatasi 20 permintaan/menit per IP.
  `PUT`/`DELETE` untuk endpoint lain tetap ditolak `403` di edge.
- `nginx -t && systemctl reload nginx` setelah mengubah konfigurasi.

Alternatif tanpa proxy: build web (`pnpm build`), sajikan `web/dist` sebagai situs statis,
deploy `api/` (mis. Vercel dengan `api/vercel.json`), dan set `VITE_API_URL` ke URL API
publik saat build. Service worker dan instalasi PWA memerlukan **HTTPS** (kecuali
`localhost`), sehingga opsi reverse proxy + TLS di atas dipakai untuk deployment ini.

## Pemetaan ketentuan tugas

| # | Ketentuan | Implementasi |
|---|---|---|
| 1 | API/web service sendiri sesuai Modul 1 | `api/` Express 5 + PostgreSQL dengan `config/`, `models/`, `controllers/`, `routes/`, env, dan CORS. Seluruh data UI berasal dari API. |
| 2 | Bottom navigation bar | 5 item permanen di root layout: Beranda, Katalog, Spotting, Catat, Tentang. |
| 3 | Minimal 5 halaman | 11 route: `/`, `/burung`, `/burung/$birdId`, `/spotting`, `/spotting/$sightingId`, `/spotting/$sightingId/edit`, `/catat`, `/tentang`, `/masuk`, `/admin/burung/baru`, `/admin/burung/$birdId/edit`. |
| 4 | 2 halaman list + detail | Katalog → detail burung; Spotting → detail spotting. |
| 5 | Profile/About aplikasi | `/tentang`: deskripsi, fitur, tech stack, panduan pasang, kredit. |
| 6 | PWA | Manifest, service worker Workbox, ikon, app shell offline, cache API `NetworkFirst`. |

## Kredit foto

Foto berasal dari Wikimedia Commons. Masing-masing file memuat nama fotografer dan lisensi
yang digunakan:

| Burung | Fotografer | Lisensi | Sumber |
|---|---|---|---|
| Merbah Cerukcuk | DexDroid29 | CC0 | [Commons](https://commons.wikimedia.org/wiki/File:Yellowventedbulbulbydexdroid1.jpeg) |
| Kutilang | Ariefrahman | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Pycnonotus_aurigaster_pair.JPG) |
| Cinenen Pisang | Charles J. Sharp | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Common_tailorbird_(Orthotomus_sutorius_guzuratus)_male_Kerala.jpg) |
| Burung Gereja | Laitche | Public domain | [Commons](https://commons.wikimedia.org/wiki/File:Tree_Sparrow_August_2007_Osaka_Japan.jpg) |
| Tekukur Biasa | iNaturalist/zinogre | CC BY-SA 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Spilopelia_chinensis_Zhengzhou_20220915,_crop.jpg) |
| Cekakak Sungai | JJ Harrison | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Todiramphus_chloris_2_-_Laem_Phak_Bia.jpg) |
| Blekok Sawah | Ariefrahman | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Ardeola_speciosa.JPG) |
| Kowak Malam Kelabu | ramidos | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Nycticorax_nycticorax_457953189.jpg) |
| Elang Bondol | Afsar Nayakkan | CC BY 4.0 | [Commons](https://commons.wikimedia.org/wiki/File:Haliastur_indus_136698204.jpg) |
| Jalak Bali | JJ Harrison | CC BY-SA 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Bali_Myna_0A2A9443.jpg) |
| Kepodang | J.M.Garg | CC BY 3.0 | [Commons](https://commons.wikimedia.org/wiki/File:Black-naped_Oriole_eyeing_on_Lannea_coromandelica_fruits_W_IMG_7449.jpg) |
| Rangkong Badak | JP Bennett | CC BY 2.0 | [Commons](https://commons.wikimedia.org/wiki/File:Buceros_rhinoceros_-Singapore_Zoo_-pair-8a.jpg) |

Lisensi lengkap setiap karya tersedia pada halaman sumbernya. Informasi spesies dirujuk
dari artikel Wikipedia terkait.
