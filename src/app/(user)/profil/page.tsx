'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';

export default function ProfilPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">Mein Profil</h1>

        <div className="bg-white rounded-xl shadow-md p-8">
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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
            <p>Möchtest du dein Konto löschen oder deine Daten anfragen? Wende dich an{' '}
              <a href="mailto:datenschutz@fluss-des-lebens.de" className="text-blue-600 hover:underline">
                datenschutz@fluss-des-lebens.de
              </a>
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
