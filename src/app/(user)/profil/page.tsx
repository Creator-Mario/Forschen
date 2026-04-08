'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession, signOut } from 'next-auth/react';
import { useState, FormEvent } from 'react';

export default function ProfilPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDeleteAccount(e: FormEvent) {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Konto konnte nicht gelöscht werden.');
      } else {
        await signOut({ callbackUrl: '/' });
      }
    } catch (err) {
      console.error('Account deletion failed:', err instanceof Error ? err.message : String(err));
      setDeleteError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) {
      setPwError('Die neuen Passwörter stimmen nicht überein.');
      return;
    }
    setPwLoading(true);
    const res = await fetch('/api/user/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) {
      setPwError(data.error || 'Fehler beim Ändern des Passworts.');
    } else {
      setPwSuccess('Passwort erfolgreich geändert.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Mein Profil</h1>

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-2xl">
              {session?.user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-lg">{session?.user.name}</div>
              <div className="text-gray-500 text-sm">{session?.user.email}</div>
              <div className="text-xs mt-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {session?.user.role === 'ADMIN' ? 'Administrator' : 'Mitglied'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="font-semibold text-gray-700 mb-4">Kontoinformationen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{session?.user.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">E-Mail</span>
                <span className="font-medium">{session?.user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Rolle</span>
                <span className="font-medium">{session?.user.role === 'ADMIN' ? 'Administrator' : 'Nutzer'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password change */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="font-semibold text-gray-800 mb-6">Passwort ändern</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Aktuelles Passwort
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {pwError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-3 py-2">
                {pwSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {pwLoading ? 'Wird gespeichert…' : 'Passwort ändern'}
            </button>
          </form>
        </div>

        {/* Danger zone – account deletion */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-100">
          <h2 className="font-semibold text-red-700 mb-2">Konto löschen</h2>
          <p className="text-sm text-gray-500 mb-4">
            Wenn du dein Konto löschst, werden alle deine persönlichen Daten, Beiträge und
            Nachrichten dauerhaft und unwiderruflich entfernt.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Konto unwiderruflich löschen
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm font-medium text-red-700">
                Bitte gib dein Passwort ein, um die Löschung zu bestätigen:
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                required
                placeholder="Passwort eingeben"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {deleteError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleteLoading ? 'Wird gelöscht…' : 'Ja, Konto löschen'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

