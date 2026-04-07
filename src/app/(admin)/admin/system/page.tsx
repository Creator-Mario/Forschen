'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminSystemPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Systemeinstellungen</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Plattformstatus</h2>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-700 text-sm">Plattform läuft normal</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Daten</h2>
            <p className="text-gray-600 text-sm mb-3">
              Die Plattform verwendet dateibasierte JSON-Datenspeicherung. Daten befinden sich im <code className="bg-slate-100 px-1 rounded">/data</code> Verzeichnis.
            </p>
            <p className="text-xs text-gray-400">
              Für Backups empfehlen wir regelmäßige Commits ins Repository.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">GitHub Actions</h2>
            <p className="text-gray-600 text-sm mb-2">
              Automatisierte Workflows sind konfiguriert für:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Tägliches Tageswort (5:00 UTC)</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Wöchentliches Wochenthema (Mo, 6:00 UTC)</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> GitHub Pages Deployment</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <h2 className="font-semibold text-amber-800 mb-2">Wichtiger Hinweis</h2>
            <p className="text-gray-700 text-sm">
              Stelle sicher, dass <code className="bg-white px-1 rounded">NEXTAUTH_SECRET</code> in den GitHub Repository Secrets gesetzt ist.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
