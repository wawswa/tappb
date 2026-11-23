import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { useAuth, useLogin, useLogout } from '@/lib/auth';
import { fieldClass, labelClass, primaryAction, secondaryAction, textAction } from '@/lib/ui';

type LoginSearch = { redirect?: string };

function safeRedirect(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : undefined;
}

export const Route = createFileRoute('/masuk')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: safeRedirect(search.redirect),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { user, isAdmin, isLoading } = useAuth();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!username.trim() || !password) {
      setFormError('Username dan password wajib diisi.');
      return;
    }
    loginMutation.mutate(
      { username: username.trim(), password },
      {
        onSuccess: () => {
          window.location.assign(redirect ?? '/');
        },
      },
    );
  }

  const mutationError =
    loginMutation.error instanceof Error ? loginMutation.error.message : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:px-6">
      <PageHeader
        title="Masuk"
        meta="Akun"
        subtitle="Admin dapat menambah burung baru. Pengguna dapat mencatat spotting."
        accountLink={false}
      />

      {isLoading ? (
        <div className="max-w-md animate-pulse rounded-[14px] border border-rule bg-paper p-5">
          <div className="h-3 w-1/3 rounded-[2px] bg-sand/60" />
          <div className="mt-4 h-11 rounded-[8px] bg-sand/50" />
          <div className="mt-3 h-11 rounded-[8px] bg-sand/50" />
        </div>
      ) : user ? (
        <div className="max-w-md rounded-[14px] border border-rule bg-paper p-5 sm:p-6">
          <p className="font-mono text-[11px] text-muted">Sudah masuk</p>
          <p className="mt-1 font-serif text-2xl text-forest-deep">{user.display_name}</p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            @{user.username} · {user.role === 'admin' ? 'Admin' : 'Pengguna'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {isAdmin ? (
              <Link to="/admin/burung/baru" className={primaryAction}>
                Tambah burung
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className={secondaryAction}
            >
              {logoutMutation.isPending ? 'Keluar…' : 'Keluar'}
            </button>
          </div>
          <Link to="/" className={`${textAction} mt-3`}>
            Kembali ke beranda
          </Link>
        </div>
      ) : (
        <div className="max-w-md">
          <form
            onSubmit={handleSubmit}
            className="rounded-[14px] border border-rule bg-paper p-5 sm:p-6"
          >
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClass}
              />
            </div>

            {formError || mutationError ? (
              <p
                role="alert"
                className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-800"
              >
                {formError ?? mutationError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`${primaryAction} mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {loginMutation.isPending ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          <p className="mt-4 text-sm leading-6 text-secondary">
            Akun dikelola oleh admin. Hubungi pengelola SpotBird jika belum punya akun.
          </p>
        </div>
      )}
    </main>
  );
}
