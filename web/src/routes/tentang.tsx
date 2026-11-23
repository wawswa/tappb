import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';
import { useAuth, useLogout } from '@/lib/auth';
import { primaryAction, secondaryAction } from '@/lib/ui';

export const Route = createFileRoute('/tentang')({
  component: AboutPage,
});

const FEATURES = [
  {
    title: 'Katalog burung',
    description: 'Katalog burung Indonesia dengan nama ilmiah, famili, dan status konservasi.',
  },
  {
    title: 'Buku spotting',
    description: 'Catat lokasi, waktu, koordinat, dan detail pengamatanmu.',
  },
  {
    title: 'Tetap terbaca offline',
    description: 'Halaman dan data yang pernah dibuka tersimpan di perangkat.',
  },
  {
    title: 'Bisa dipasang',
    description: 'Tambahkan ke layar utama dan buka seperti aplikasi biasa.',
  },
];

const TECH_STACK = [
  'React 19',
  'TypeScript',
  'Vite',
  'TanStack Router',
  'TanStack Query',
  'Tailwind CSS 4',
  'Express 5',
  'PostgreSQL',
  'Workbox',
];

function AboutPage() {
  const { user, isAdmin } = useAuth();
  const logoutMutation = useLogout();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Tentang SpotBird"
        meta="Versi 1.0.0"
        subtitle="Katalog dan buku harian pengamatan burung Indonesia."
      />

      <section>
        <p className="max-w-[62ch] text-[15px] leading-7 text-ink">
          SpotBird membantu pengamat burung mengenali spesies di sekitar dan menyimpan
          catatan pengamatan secara rapi. Seluruh data katalog dan spotting diambil dari
          API SpotBird sendiri, bukan data statis di sisi klien.
        </p>
      </section>

      <section className="mt-8 border-t border-rule pt-4">
        <h2 className="font-mono text-[11px] text-muted">Akun</h2>
        {user ? (
          <div className="mt-2">
            <p className="font-serif text-2xl text-forest-deep">{user.display_name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              @{user.username} · {user.role === 'admin' ? 'Admin' : 'Pengguna'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {isAdmin ? (
                <Link to="/admin/burung/baru" className={primaryAction}>
                  Tambah burung
                </Link>
              ) : (
                <Link to="/catat" className={primaryAction}>
                  Catat spotting
                </Link>
              )}
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className={secondaryAction}
              >
                {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <p className="max-w-[48ch] text-sm leading-6 text-secondary">
              Masuk untuk mencatat spotting. Akun admin juga dapat menambah burung baru ke
              katalog.
            </p>
            <Link to="/masuk" className={`${primaryAction} mt-3`}>
              Masuk
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8 border-t border-rule">
        <h2 className="py-3 font-mono text-[11px] text-muted">Fitur</h2>
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-rule py-4"
          >
            <span className="font-mono text-[11px] text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="text-base font-medium text-forest-deep">{feature.title}</h3>
              <p className="mt-1 text-sm leading-6 text-secondary">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 border-t border-rule pt-4">
        <h2 className="font-mono text-[11px] text-muted">Teknologi</h2>
        <p className="mt-2 text-sm leading-7 text-secondary">
          {TECH_STACK.join(' · ')}
        </p>
      </section>

      <section className="mt-8 border-t border-rule pt-4">
        <h2 className="font-mono text-[11px] text-muted">Pasang di perangkat</h2>
        <div className="mt-3 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-base font-medium text-forest-deep">Chrome di Android</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm leading-6 text-secondary">
              <li>Buka SpotBird di Chrome.</li>
              <li>
                Ketuk menu tiga titik, lalu pilih <strong className="font-medium text-ink">Instal aplikasi</strong>{' '}
                atau <strong className="font-medium text-ink">Tambahkan ke layar utama</strong>.
              </li>
              <li>Konfirmasi, lalu buka SpotBird dari layar utama.</li>
            </ol>
          </div>
          <div className="sm:border-l sm:border-rule sm:pl-6">
            <h3 className="text-base font-medium text-forest-deep">Safari di iPhone atau iPad</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm leading-6 text-secondary">
              <li>Buka SpotBird di Safari.</li>
              <li>Ketuk tombol Bagikan.</li>
              <li>
                Pilih <strong className="font-medium text-ink">Tambah ke Layar Utama</strong>, lalu ketuk{' '}
                <strong className="font-medium text-ink">Tambah</strong>.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mt-8 border-t border-rule pt-4">
        <h2 className="font-mono text-[11px] text-muted">Kredit data dan foto</h2>
        <p className="mt-2 max-w-[62ch] text-sm leading-6 text-secondary">
          Foto burung berasal dari Wikimedia Commons dengan lisensi public domain, CC0, CC
          BY, atau CC BY-SA. Nama fotografer, lisensi, dan tautan sumber tercantum pada
          halaman detail setiap burung. Informasi spesies dirujuk dari artikel Wikipedia
          terkait.
        </p>
        <a
          href="https://commons.wikimedia.org/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium text-forest underline decoration-rule underline-offset-4 hover:text-forest-deep"
        >
          Wikimedia Commons
        </a>
      </section>

      <div className="mt-8 border-t border-rule pt-6">
        <Link to="/burung" className={`${primaryAction} w-full`}>
          Mulai jelajahi katalog
        </Link>
      </div>
    </main>
  );
}
