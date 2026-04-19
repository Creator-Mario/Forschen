'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';

export default function AdminSystemPage() {
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [emailMsg, setEmailMsg] = useState('');

  async function handleEmailTest() {
    setEmailStatus('loading');
    setEmailMsg('');
    try {
      const res = await fetch('/api/send-test-email');
      const data = await res.json();
      if (res.ok && data.ok) {
        setEmailStatus('ok');
        setEmailMsg(`✅ Test-E-Mail erfolgreich gesendet an: ${data.sentTo}`);
      } else {
        setEmailStatus('error');
        setEmailMsg(`❌ Fehler: ${data.error ?? 'Versand fehlgeschlagen – Server-Logs prüfen.'}`);
      }
    } catch {
      setEmailStatus('error');
      setEmailMsg('❌ Netzwerkfehler – bitte erneut versuchen.');
    }
  }

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

          {/* Email Test */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-2">E-Mail-System (Resend)</h2>
            <p className="text-gray-600 text-sm mb-4">
              Sendet eine Test-E-Mail an deine Admin-Adresse, um zu prüfen, ob Resend korrekt
              konfiguriert ist und ob E-Mails zugestellt werden.
            </p>
            <button
              type="button"
              onClick={handleEmailTest}
              disabled={emailStatus === 'loading'}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {emailStatus === 'loading' ? '⏳ Sende…' : '📧 Test-E-Mail senden'}
            </button>
            {emailMsg && (
              <p className={`mt-3 text-sm rounded-lg px-3 py-2 ${
                emailStatus === 'ok'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {emailMsg}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Daten</h2>
            <p className="text-gray-600 text-sm mb-3">
              Die Plattform verwendet dateibasierte JSON-Datenspeicherung. Daten befinden sich im{' '}
              <code className="bg-slate-100 px-1 rounded">/data</code> Verzeichnis und werden über
              die GitHub-API dauerhaft gespeichert.
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
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Railway Deployment (automatisch bei Push auf main)</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <h2 className="font-semibold text-amber-800 mb-2">Erforderliche Umgebungsvariablen (Produktion / Railway)</h2>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li><code className="bg-white px-1 rounded">NEXTAUTH_SECRET</code> – ein langer zufälliger String</li>
              <li><code className="bg-white px-1 rounded">NEXTAUTH_URL</code> – echte Live-URL der Webseite</li>
              <li><code className="bg-white px-1 rounded">GITHUB_TOKEN</code> – Personal Access Token (repo-Zugriff) für Datenpersistenz</li>
              <li><code className="bg-white px-1 rounded">GITHUB_OWNER</code> – Creator-Mario</li>
              <li><code className="bg-white px-1 rounded">GITHUB_REPO</code> – Forschen</li>
              <li><code className="bg-white px-1 rounded">ADMIN_RESET_TOKEN</code> – ein geheimes Wort für den Notfall-Reset</li>
              <li><code className="bg-white px-1 rounded">RESEND_API_KEY</code> – API-Key von{' '}
                <a href="https://resend.com/api-keys" className="underline text-blue-700" target="_blank" rel="noopener noreferrer">resend.com</a>
              </li>
              <li><code className="bg-white px-1 rounded">OPENAI_API_KEY</code> – aktiviert die KI-Generierung für Psalmen, Glauben-heute-Themen und Buchempfehlungen und ersetzt bestehende Fallback-Einträge automatisch</li>
              <li><code className="bg-white px-1 rounded">OPENAI_BASE_URL</code> – optionaler OpenAI-kompatibler Endpoint, falls nicht api.openai.com genutzt wird</li>
              <li><code className="bg-white px-1 rounded">OPENAI_MODEL</code> – optionaler Modellname für die KI-Generierung</li>
              <li><code className="bg-white px-1 rounded">OPENAI_TIMEOUT_MS</code> – optionales Timeout pro KI-Anfrage in Millisekunden</li>
              <li><code className="bg-white px-1 rounded">EMAIL_FROM</code> – verifizierte Resend-Absenderadresse (z.B. noreply@flussdeslebens.live)</li>
              <li><code className="bg-white px-1 rounded">EMAIL_LINK_BASE_URL</code> – optionale feste Basis-URL für Mail-Links, falls nötig (sonst wird automatisch die Live-Domain verwendet)</li>
              <li><code className="bg-white px-1 rounded">OPERATOR_EMAIL</code> – Kontaktadresse des Betreibers für Admin-Benachrichtigungen</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
