'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  awaiting_admin_review: '⏳ Wartet auf Prüfung',
  question_to_user: '❓ Rückfrage gestellt',
  postponed: '⏸ Zurückgestellt',
};

const STATUS_COLORS: Record<string, string> = {
  awaiting_admin_review: 'bg-yellow-100 text-yellow-800',
  question_to_user: 'bg-orange-100 text-orange-800',
  postponed: 'bg-slate-100 text-slate-700',
};

export default function AdminVorstellungenPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function load() {
    fetch('/api/admin/vorstellungen')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); });
  }

  useEffect(() => { load(); }, []);

  async function handleAction(userId: string, action: string) {
    const note = noteMap[userId] || '';
    if (action === 'question' && !note.trim()) {
      alert('Bitte gib eine Rückfrage ein.');
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/vorstellungen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, note }),
      });
      if (res.ok) {
        const labels: Record<string, string> = {
          approve: 'Nutzer freigeschaltet.',
          question: 'Rückfrage gesendet.',
          postpone: 'Zurückgestellt.',
          delete: 'Abgelehnt.',
        };
        setFeedback({ type: 'success', msg: labels[action] ?? 'Aktion ausgeführt.' });
      } else {
        const d = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', msg: d.error ?? 'Fehler bei der Aktion.' });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setLoading(false);
      load();
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vorstellungen prüfen</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Neue Mitglieder müssen manuell freigeschaltet werden. Keine automatische Aktivierung.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
        </div>

        {feedback && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-400">
            Keine ausstehenden Vorstellungen.
          </div>
        ) : (
          <div className="space-y-6">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-xl shadow-md p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-lg">{u.name}</h2>
                    <p className="text-sm text-blue-600">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ID: {u.id} · Registriert: {formatDate(u.createdAt)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[u.status] || u.status}
                  </span>
                </div>

                {/* Intro texts */}
                {u.intro ? (
                  <div className="space-y-4 mb-5">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                        Motivation
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {u.intro.motivation}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                        Vorstellung
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {u.intro.vorstellung}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Eingereicht: {formatDate(u.intro.submittedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-5">Noch kein Vorstellungstext eingereicht.</p>
                )}

                {/* Admin note field */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Notiz / Rückfrage an Nutzer (optional für Freischaltung, Pflicht bei Rückfrage):
                  </label>
                  <textarea
                    rows={2}
                    value={noteMap[u.id] || ''}
                    onChange={e => setNoteMap(prev => ({ ...prev, [u.id]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="Interne Notiz oder Nachricht an den Nutzer…"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAction(u.id, 'approve')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    ✅ Freischalten
                  </button>
                  <button
                    onClick={() => handleAction(u.id, 'question')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-400 disabled:opacity-50 transition-colors"
                  >
                    ❓ Rückfrage an Nutzer
                  </button>
                  <button
                    onClick={() => handleAction(u.id, 'postpone')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-400 disabled:opacity-50 transition-colors"
                  >
                    ⏸ Zurückstellen
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Konto wirklich ablehnen und deaktivieren?')) {
                        handleAction(u.id, 'delete');
                      }
                    }}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition-colors"
                  >
                    🗑️ Ablehnen / Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
