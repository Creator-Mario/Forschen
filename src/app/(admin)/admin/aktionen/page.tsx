'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { Aktion, User } from '@/types';
import { isModerationQueueStatus } from '@/lib/utils';

export default function AdminAktionenPage() {
  const [items, setItems] = useState<Aktion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoadError(null);
    try {
      const [r, u] = await Promise.all([
        fetch('/api/aktionen?all=1'),
        fetch('/api/admin/users'),
      ]);
      const data = await r.json();
      if (Array.isArray(data)) setItems(data);
      else setLoadError('Fehler beim Laden der Aktionen.');
      const userData = await u.json();
      if (Array.isArray(userData)) setUsers(userData);
    } catch (err) {
      console.error('[admin/aktionen] load failed:', err);
      setLoadError('Fehler beim Laden der Daten. Bitte Seite neu laden.');
    }
  }

  useEffect(() => { load(); }, []);

  const moderationItems = items.filter(item => isModerationQueueStatus(item.status));

  async function onAction(id: string, status: string, message?: string) {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'aktion', id, status, adminMessage: message }),
    });
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Aktionen moderieren</h1>
        <p className="text-gray-500 mb-8">
          {moderationItems.length} ausstehend
        </p>
        {loadError && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            ❌ {loadError}
          </div>
        )}
        <AdminModerationTable
          items={moderationItems}
          contentType="Aktion"
          users={users}
          titleField="title"
          authorField="authorName"
          contentField="description"
          onAction={onAction}
        />
      </div>
    </ProtectedRoute>
  );
}
