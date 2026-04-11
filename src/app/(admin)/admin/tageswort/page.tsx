'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState, FormEvent } from 'react';
import type { Tageswort } from '@/types';
import { formatDate } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import Link from 'next/link';

const EMPTY_FORM: Omit<Tageswort, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  verse: '',
  text: '',
  context: '',
  questions: ['', '', '', '', ''],
  published: false,
};

export default function AdminTageswortPage() {
  const [items, setItems] = useState<Tageswort[]>([]);
  const [editing, setEditing] = useState<Tageswort | null>(null);
  const [form, setForm] = useState<Omit<Tageswort, 'id'>>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function load() {
    fetch('/api/tageswort?all=1')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data.sort((a, b) => b.date.localeCompare(a.date))); });
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setMsg(null);
  }

  function openEdit(item: Tageswort) {
    setEditing(item);
    setForm({
      date: item.date,
      verse: item.verse,
      text: item.text,
      context: item.context,
      questions: item.questions?.length ? [...item.questions] : ['', '', '', '', ''],
      published: item.published ?? false,
    });
    setShowForm(true);
    setMsg(null);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const payload: Tageswort = {
      id: editing ? editing.id : `tw-${generateId()}`,
      ...form,
      questions: form.questions.filter(q => q.trim() !== ''),
    };

    try {
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch('/api/tageswort', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: editing ? 'Gespeichert.' : 'Erstellt.' });
        setShowForm(false);
        setEditing(null);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setMsg({ type: 'error', text: data.error ?? `Fehler (${res.status}).` });
      }
    } catch {
      setMsg({ type: 'error', text: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setLoading(false);
    }
  }

  async function togglePublished(item: Tageswort) {
    try {
      const updated = { ...item, published: !item.published };
      await fetch('/api/tageswort', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      load();
    } catch {
      setMsg({ type: 'error', text: 'Statusänderung fehlgeschlagen.' });
    }
  }

  async function handleDelete(item: Tageswort) {
    if (!confirm(`Tageswort „${item.verse}" wirklich löschen?`)) return;
    try {
      await fetch('/api/tageswort', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      load();
    } catch {
      setMsg({ type: 'error', text: 'Löschen fehlgeschlagen.' });
    }
  }

  function setQuestion(idx: number, val: string) {
    const qs = [...form.questions];
    qs[idx] = val;
    setForm(f => ({ ...f, questions: qs }));
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tageswort verwalten</h1>
            <p className="text-gray-500 text-sm mt-1">Tägliche Bibelverse erstellen, bearbeiten und veröffentlichen</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              + Neu erstellen
            </button>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline self-center">← Admin</Link>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
          </div>
        )}

        {/* Create / Edit form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editing ? 'Tageswort bearbeiten' : 'Neues Tageswort'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Datum</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bibelstelle (z.B. Johannes 3,16)</label>
                  <input
                    type="text"
                    value={form.verse}
                    onChange={e => setForm(f => ({ ...f, verse: e.target.value }))}
                    required
                    placeholder="Johannes 3,16"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bibeltext</label>
                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Der vollständige Bibelvers…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kontext / Einführung</label>
                <textarea
                  value={form.context}
                  onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                  rows={2}
                  placeholder="Kurzer Kontext oder Einleitung zum Vers…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Forschungsfragen (bis zu 5)</label>
                <div className="space-y-2">
                  {form.questions.map((q, i) => (
                    <input
                      key={i}
                      type="text"
                      value={q}
                      onChange={e => setQuestion(i, e.target.value)}
                      placeholder={`Frage ${i + 1}…`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm text-gray-700">Sofort veröffentlichen</label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Speichern…' : (editing ? 'Aktualisieren' : 'Erstellen')}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{item.verse}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.published ? 'Veröffentlicht' : 'Entwurf'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{formatDate(item.date)}</p>
                  <p className="text-gray-600 text-sm italic truncate">&ldquo;{item.text}&rdquo;</p>
                  {item.questions && item.questions.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{item.questions.length} Forschungsfrage{item.questions.length !== 1 ? 'n' : ''}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.published ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {item.published ? '⏸ Zurückziehen' : '✅ Veröffentlichen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    ✏️ Bearbeiten
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    🗑️ Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-400">Noch keine Tageswort-Einträge vorhanden.</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
