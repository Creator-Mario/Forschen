'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
    } else {
      const session = await getSession();
      const callbackUrl = searchParams.get('callbackUrl');
      const safeCallbackUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : null;
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(safeCallbackUrl || '/dashboard');
      }
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Anmelden</h1>
          <p className="text-gray-500 text-sm">Willkommen zurück bei Der Fluss des Lebens</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="text-right">
              <Link href="/passwort-vergessen" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Passwort vergessen?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird angemeldet…' : 'Anmelden'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Noch kein Konto?{' '}
            <Link href="/registrieren" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
              Kostenlos registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
