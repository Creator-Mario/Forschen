'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { Video, User, Wochenthema } from '@/types';

export default function AdminVideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [themes, setThemes] = useState<Wochenthema[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoadError(null);
    try {
      const [r, u, t] = await Promise.all([
        fetch('/api/videos?all=1'),
        fetch('/api/admin/users'),
        fetch('/api/wochenthema?all=1'),
      ]);
      const data = await r.json();
      if (Array.isArray(data)) setItems(data);
      else setLoadError('Fehler beim Laden der Videos.');
      const userData = await u.json();
      if (Array.isArray(userData)) setUsers(userData);
      const themeData = await t.json();
      if (Array.isArray(themeData)) setThemes(themeData.filter(theme => theme.status === 'published'));
    } catch (err) {
      console.error('[admin/videos] load failed:', err);
      setLoadError('Fehler beim Laden der Daten. Bitte Seite neu laden.');
    }
  }

  useEffect(() => { load(); }, []);

  async function onAction(id: string, status: string, message?: string, wochenthemaId?: string) {
    const res = await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'video', id, status, adminMessage: message, wochenthemaId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Fehler beim Moderieren (${res.status})`);
    }
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Videos moderieren</h1>
        <p className="text-gray-500 mb-8">
          {items.filter(i => i.status === 'pending' || i.status === 'created').length} ausstehend
        </p>
        {loadError && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            ❌ {loadError}
          </div>
        )}
        <AdminModerationTable
          items={items}
          contentType="Video"
          users={users}
          titleField="title"
          authorField="authorName"
          contentField="description"
          onAction={onAction}
          themeOptions={themes}
          requireThemeForPublish
        />
      </div>
    </ProtectedRoute>
  );
}
