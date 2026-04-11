'use client';

import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminModerationTableProps {
  items: Item[];
  titleField: string;
  authorField: string;
  contentField?: string;
  contentType: string;
  users?: User[];
  onAction: (id: string, status: string, message?: string) => void | Promise<void>;
  /** @deprecated use onAction instead */
  onModerate?: (id: string, status: 'approved' | 'rejected') => void;
}

export default function AdminModerationTable({
  items, titleField, authorField, contentField, contentType, users, onAction, onModerate,
}: AdminModerationTableProps) {
  const [questionModal, setQuestionModal] = useState<{ id: string } | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function getUserEmail(userId: string): string {
    if (!users) return '';
    return users.find(u => u.id === userId)?.email || '';
  }

  async function handleAction(id: string, status: string, message?: string) {
    setLoadingId(id);
    setFeedback(null);
    try {
      if (onAction) await onAction(id, status, message);
      else if (onModerate && (status === 'approved' || status === 'rejected')) onModerate(id, status);
      const labels: Record<string, string> = {
        published: 'Veröffentlicht.',
        postponed: 'Zurückgestellt.',
        question_to_user: 'Rückfrage gesendet.',
        deleted: 'Zurückgezogen.',
        hard_delete: 'Endgültig gelöscht.',
      };
      setFeedback({ type: 'success', msg: labels[status] ?? 'Aktion ausgeführt.' });
    } catch (err) {
      console.error('[AdminModerationTable] Action failed:', err);
      setFeedback({ type: 'error', msg: 'Aktion fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.' });
    } finally {
      setLoadingId(null);
    }
  }

  function openQuestionModal(id: string) {
    setQuestionText('');
    setQuestionModal({ id });
  }

  function submitQuestion() {
    if (!questionModal || !questionText.trim()) return;
    handleAction(questionModal.id, 'question_to_user', questionText.trim());
    setQuestionModal(null);
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      {feedback && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
        </div>
      )}
      <div className="space-y-4">
        {items.map(item => {
          const isExpanded = expandedIds.has(item.id);
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{String(item[titleField] || '')}</h3>
                  <p className="text-sm text-gray-500">
                    {String(item[authorField] || item.authorName || 'Unbekannt')}
                    {getUserEmail(item.userId) && (
                      <> · <span className="text-blue-600">{getUserEmail(item.userId)}</span></>
                    )}
                    {' '}· {formatDate(item.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Typ: <span className="font-medium">{contentType}</span>
                    {' '}· ID: <span className="font-mono">{item.userId}</span>
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              {contentField && item[contentField] && (
                <p className={`text-gray-600 text-sm leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {String(item[contentField])}
                </p>
              )}

              {item.adminMessage && (
                <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-800">
                  <span className="font-medium">Rückfrage an Nutzer:</span> {item.adminMessage}
                </div>
              )}

              {item.moderatorNote && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                  <span className="font-medium">Moderationsnotiz:</span> {item.moderatorNote}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleAction(item.id, 'published')}
                  disabled={loadingId === item.id}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  title="Veröffentlichen / Genehmigen"
                >
                  ✅ Veröffentlichen
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(item.id, 'postponed')}
                  disabled={loadingId === item.id}
                  className="bg-slate-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
                  title="Zurückstellen"
                >
                  ⏸ Zurückstellen
                </button>
                <button
                  type="button"
                  onClick={() => openQuestionModal(item.id)}
                  disabled={loadingId === item.id}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                  title="Frage an den Nutzer"
                >
                  ❓ Rückfrage
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(item.id, 'deleted')}
                  disabled={loadingId === item.id}
                  className="bg-red-200 text-red-800 px-3 py-1.5 rounded-lg text-sm hover:bg-red-300 transition-colors disabled:opacity-50"
                  title="Soft-Delete: Status auf gelöscht setzen (Daten bleiben erhalten)"
                >
                  🗑️ Zurückziehen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('ACHTUNG: Diesen Eintrag unwiderruflich aus der Datenbank löschen?')) {
                      handleAction(item.id, 'hard_delete');
                    }
                  }}
                  disabled={loadingId === item.id}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  title="Hard-Delete: Eintrag endgültig aus der Datenbank entfernen"
                >
                  💥 Endgültig löschen
                </button>
                {contentField && item[contentField] && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    title="Vollständigen Inhalt anzeigen"
                  >
                    👁️ {isExpanded ? 'Weniger anzeigen' : 'Im Detail anzeigen'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-400">Keine Einträge gefunden.</div>
        )}
      </div>

      {questionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Frage an den Nutzer</h3>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Deine Nachricht an den Nutzer..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={submitQuestion}
                disabled={!questionText.trim()}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Nachricht senden
              </button>
              <button
                type="button"
                onClick={() => setQuestionModal(null)}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
