'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState, FormEvent } from 'react';
import type { Wochenthema } from '@/types';
import { getCurrentPublicationWeek } from '@/lib/publishing';
import { getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

function makeId(): string {
  return `wt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function currentIsoWeek(): string {
  return getCurrentPublicationWeek();
}

const BLANK: Omit<Wochenthema, 'id'> = {
  week: '',
  title: '',
  introduction: '',
  bibleVerses: ['', '', '', '', ''],
  problemStatement: '',
  researchQuestions: ['', '', '', '', ''],
  status: 'draft',
  createdAt: '',
};

export default function AdminWochenthemaPage() {
  const [items, setItems] = useState<Wochenthema[]>([]);
  const [editing, setEditing] = useState<Wochenthema | null>(null);
  const [form, setForm] = useState<Omit<Wochenthema, 'id'>>(BLANK);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function load() {
    fetch('/api/wochenthema?all=1')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems([...data].reverse()); });
  }

  useEffect(() => { load(); }, []);

  function padArray(arr: string[], len: number): string[] {
    const copy = [...arr];
    while (copy.length < len) copy.push('');
    return copy;
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...BLANK, week: currentIsoWeek(), createdAt: new Date().toISOString() });
    setShowForm(true);
    setMsg(null);
  }

  function openEdit(item: Wochenthema) {
    setEditing(item);
    setForm({
      week: item.week,
      title: item.title,
      introduction: item.introduction,
      bibleVerses: padArray(item.bibleVerses ?? [], 5),
      problemStatement: item.problemStatement,
      researchQuestions: padArray(item.researchQuestions ?? [], 5),
      status: item.status,
      createdAt: item.createdAt ?? new Date().toISOString(),
    });
    setShowForm(true);
    setMsg(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const payload: Wochenthema = {
      id: editing ? editing.id : makeId(),
      ...form,
      bibleVerses: form.bibleVerses.filter(v => v.trim() !== ''),
      researchQuestions: form.researchQuestions.filter(q => q.trim() !== ''),
    };

    try {
      const res = await fetch('/api/wochenthema', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: editing ? 'Gespeichert.' : 'Erstellt.' });
        setShowForm(false);
        setEditing(null);
        load();
      } else {
        const d = await res.json().catch(() => ({}));
        setMsg({ type: 'error', text: d.error ?? `Fehler (${res.status}).` });
      }
    } catch {
      setMsg({ type: 'error', text: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: Wochenthema, status: Wochenthema['status']) {
    try {
      await fetch('/api/wochenthema', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status }),
      });
      load();
    } catch {
      setMsg({ type: 'error', text: 'Statusänderung fehlgeschlagen.' });
    }
  }

  async function handleDelete(item: Wochenthema) {
    if (!confirm(`Wochenthema "${item.title}" wirklich endgueltig loeschen?`)) return;
    try {
      await fetch('/api/wochenthema', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      load();
    } catch {
      setMsg({ type: 'error', text: 'Löschen fehlgeschlagen.' });
    }
  }

  function setVerse(idx: number, val: string) {
    const arr = [...form.bibleVerses];
    arr[idx] = val;
    setForm(f => ({ ...f, bibleVerses: arr }));
  }

  function setQuestion(idx: number, val: string) {
    const arr = [...form.researchQuestions];
    arr[idx] = val;
    setForm(f => ({ ...f, researchQuestions: arr }));
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Wochenthema verwalten</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} Einträge insgesamt
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              + Neu erstellen
            </button>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {editing ? 'Wochenthema bearbeiten' : 'Neues Wochenthema erstellen'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Woche (z.B. 2025-W20)
                  </label>
                  <input
                    type="text"
                    value={form.week}
                    onChange={e => setForm(f => ({ ...f, week: e.target.value }))}
                    required
                    placeholder="2025-W20"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e =>
                      setForm(f => ({ ...f, status: e.target.value as Wochenthema['status'] }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="draft">Entwurf</option>
                    <option value="published">Veröffentlicht</option>
                    <option value="archived">Archiviert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Titel</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="Thema dieser Woche..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Einführung</label>
                <textarea
                  value={form.introduction}
                  onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))}
                  required
                  rows={4}
                  placeholder="Einleitung und Hintergrund zum Thema..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Wochenfrage / Problemstellung
                </label>
                <textarea
                  value={form.problemStatement}
                  onChange={e => setForm(f => ({ ...f, problemStatement: e.target.value }))}
                  required
                  rows={2}
                  placeholder="Die zentrale Frage dieser Woche..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Bibelstellen (bis zu 5)
                </label>
                <div className="space-y-2">
                  {form.bibleVerses.slice(0, 5).map((v, i) => (
                    <input
                      key={i}
                      type="text"
                      value={v}
                      onChange={e => setVerse(i, e.target.value)}
                      placeholder={`Bibelstelle ${i + 1} (z.B. Johannes 3,16)`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Forschungsfragen (bis zu 5)
                </label>
                <div className="space-y-2">
                  {form.researchQuestions.slice(0, 5).map((q, i) => (
                    <input
                      key={i}
                      type="text"
                      value={q}
                      onChange={e => setQuestion(i, e.target.value)}
                      placeholder={`Forschungsfrage ${i + 1}...`}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Speichern...' : editing ? 'Aktualisieren' : 'Erstellen'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Woche: {item.week}</p>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {item.introduction}
                  </p>
                  {item.bibleVerses && item.bibleVerses.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{item.bibleVerses.join(' · ')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {item.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() => changeStatus(item, 'published')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors whitespace-nowrap"
                    >
                      ✅ Veröffentlichen
                    </button>
                  )}
                  {item.status === 'published' && (
                    <button
                      type="button"
                      onClick={() => changeStatus(item, 'archived')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                      📦 Archivieren
                    </button>
                  )}
                  {item.status === 'archived' && (
                    <button
                      type="button"
                      onClick={() => changeStatus(item, 'draft')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors whitespace-nowrap"
                    >
                      ↩ Als Entwurf
                    </button>
                  )}
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
            <div className="text-center py-8 text-gray-400">Noch keine Wochenthemen vorhanden.</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
