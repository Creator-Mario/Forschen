'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { Video, User } from '@/types';

export default function AdminVideosPage() {
  const [items, setItems] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  async function load() {
    const [r, u] = await Promise.all([
      fetch('/api/videos?all=1'),
      fetch('/api/admin/users'),
    ]);
    setItems(await r.json());
    const userData = await u.json();
    if (Array.isArray(userData)) setUsers(userData);
  }

  useEffect(() => { load(); }, []);

  async function onAction(id: string, status: string, message?: string) {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'video', id, status, adminMessage: message }),
    });
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Videos moderieren</h1>
        <p className="text-gray-500 mb-8">
          {items.filter(i => i.status === 'pending' || i.status === 'created').length} ausstehend
        </p>
        <AdminModerationTable
          items={items}
          contentType="Video"
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
