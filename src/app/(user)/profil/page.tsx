'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import UserAvatar from '@/components/UserAvatar';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';

const MAX_PROFILE_IMAGE_FILE_SIZE = 1024 * 1024;
const ACCEPTED_PROFILE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function ProfilPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [weeklyFaithEmailEnabled, setWeeklyFaithEmailEnabled] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
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

  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;

    async function loadAccountData() {
      try {
        const res = await fetch('/api/user/account');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setName(data.name ?? '');
        setEmail(data.email ?? '');
        setProfileImage(data.profileImage ?? '');
        setWeeklyFaithEmailEnabled(data.weeklyFaithEmailEnabled === true);
      } catch (err) {
        console.error('Account loading failed:', err);
      }
    }

    void loadAccountData();

    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handleAccountSave(e: FormEvent) {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    setAccountLoading(true);

    try {
      const res = await fetch('/api/user/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, profileImage: profileImage || null, weeklyFaithEmailEnabled }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAccountError(data.error || 'Private Daten konnten nicht gespeichert werden.');
      } else {
        setName(data.user.name);
        setEmail(data.user.email);
        setProfileImage(data.user.profileImage ?? '');
        setWeeklyFaithEmailEnabled(data.user.weeklyFaithEmailEnabled === true);
        let successMessage = 'Deine Kontoeinstellungen wurden gespeichert.';
        try {
          await update({ name: data.user.name, email: data.user.email });
        } catch (updateError) {
          console.error('Session update failed:', updateError);
          successMessage = 'Deine Kontoeinstellungen wurden gespeichert. Bitte lade die Seite neu, damit alle Anzeigen aktualisiert werden.';
        }
        setAccountSuccess(successMessage);
      }
    } catch (err) {
      console.error('Account update failed:', err);
      setAccountError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setAccountLoading(false);
    }
  }

  async function handleProfileImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAccountError('');
    setAccountSuccess('');

    if (!ACCEPTED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setAccountError('Bitte lade ein PNG-, JPG-, WEBP- oder GIF-Bild hoch.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_FILE_SIZE) {
      setAccountError('Das Profilbild darf höchstens 1 MB groß sein.');
      e.target.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Das Bild konnte nicht gelesen werden.'));
      };
      reader.onerror = () => reject(new Error('Das Bild konnte nicht gelesen werden.'));
      reader.readAsDataURL(file);
    }).catch(error => {
      setAccountError(error instanceof Error ? error.message : 'Das Bild konnte nicht gelesen werden.');
      return '';
    });

    if (!dataUrl) return;
    setProfileImage(dataUrl);
    e.target.value = '';
  }

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
            <UserAvatar
              name={name || session?.user.name || ''}
              imageSrc={profileImage}
              className="h-16 w-16 text-2xl"
              textClassName="text-2xl font-bold"
            />
            <div>
              <div className="font-semibold text-gray-800 text-lg">{name || session?.user.name}</div>
              <div className="text-gray-500 text-sm">{email || session?.user.email}</div>
              <div className="text-xs mt-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {session?.user.role === 'ADMIN' ? 'Administrator' : 'Mitglied'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="font-semibold text-gray-700 mb-4">Kontoeinstellungen</h2>
            <form onSubmit={handleAccountSave} className="space-y-4">
              <div>
                <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">
                  Vollständiger Name
                </label>
                <input
                  id="profileName"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  id="profileEmail"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Profilbild
                </label>
                <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={name || session?.user.name || ''}
                      imageSrc={profileImage}
                      className="h-20 w-20 text-3xl"
                      textClassName="text-3xl font-bold"
                    />
                    <div className="text-sm text-gray-500">
                      <p>Erlaubte Formate: PNG, JPG, WEBP oder GIF.</p>
                      <p>Maximale Dateigröße: 1 MB.</p>
                    </div>
                  </div>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleProfileImageChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage('');
                        setAccountSuccess('');
                      }}
                      className="self-start text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Profilbild entfernen
                    </button>
                  )}
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={weeklyFaithEmailEnabled}
                  onChange={e => setWeeklyFaithEmailEnabled(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                />
                <span className="text-gray-600">
                  Ich möchte wöchentlich eine persönliche E-Mail mit christlichem Inhalt, einer biblischen Geschichte,
                  Erklärungen, Reflexionsfragen und einem Segenswunsch erhalten.
                </span>
              </label>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-500">Rolle</span>
                <span className="font-medium">{session?.user.role === 'ADMIN' ? 'Administrator' : 'Nutzer'}</span>
              </div>
              {accountError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                  {accountError}
                </div>
              )}
              {accountSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-3 py-2">
                  {accountSuccess}
                </div>
              )}
              <button
                type="submit"
                disabled={accountLoading}
                className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {accountLoading ? 'Wird gespeichert…' : 'Kontoeinstellungen speichern'}
              </button>
            </form>
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
                minLength={PASSWORD_MIN_LENGTH}
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
                minLength={PASSWORD_MIN_LENGTH}
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
