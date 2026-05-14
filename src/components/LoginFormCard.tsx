'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { getPostLoginRedirectPath } from '@/lib/request-routing';

function LoginFormCardContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Anmeldung fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.');
      return;
    }

    const session = await getSession();
    router.push(getPostLoginRedirectPath(session?.user?.role, searchParams.get('callbackUrl')));
  }

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Anmeldung</p>
        <h2 className="mt-2 text-2xl font-bold text-blue-950">Willkommen zurück</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Melde dich an, um deine geistliche Ahnenreihe weiterzuführen und alle geschützten Inhalte zu sehen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="deine@email.de"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            100 % kostenlos
          </span>
          <Link href="/passwort-vergessen" className="font-medium text-blue-700 transition hover:text-blue-900">
            Passwort vergessen?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Wird angemeldet…' : 'Anmelden'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Noch kein Konto?{' '}
        <Link href="/genealogie/registrieren" className="font-semibold text-blue-700 transition hover:text-blue-900">
          Kostenlos registrieren
        </Link>
      </p>
    </div>
  );
}

export default function LoginFormCard() {
  return (
    <Suspense fallback={<div role="status" aria-live="polite" className="rounded-[1.75rem] border border-white/70 bg-white p-8 text-sm text-slate-500 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">Laden…</div>}>
      <LoginFormCardContent />
    </Suspense>
  );
}
