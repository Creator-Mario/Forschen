'use client';

import { signIn, signOut, getSession } from 'next-auth/react';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setLoading(false);
      setError('Anmeldung fehlgeschlagen.');
      return;
    }
    // Verify the authenticated user actually has the ADMIN role
    const session = await getSession();
    setLoading(false);
    if (session?.user?.role !== 'ADMIN') {
      await signOut({ redirect: false });
      setError('Kein Administratorzugang. Nur Administratoren können sich hier anmelden.');
      return;
    }
    router.push('/admin');
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-slate-400 text-sm mb-2">Verwaltungsbereich</div>
          <h1 className="text-2xl font-bold text-white">Administratorzugang</h1>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/admin-reset"
              className="text-slate-400 text-sm hover:text-slate-300 transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

