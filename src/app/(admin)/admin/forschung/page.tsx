'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { ForschungsBeitrag } from '@/types';

export default function AdminForschungPage() {
  const [items, setItems] = useState<ForschungsBeitrag[]>([]);

  async function load() {
    const r = await fetch('/api/forschung?all=1');
    setItems(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function onModerate(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'forschung', id, status }),
    });
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Forschung moderieren</h1>
        <p className="text-gray-500 mb-8">{items.filter(i => i.status === 'pending').length} ausstehend</p>
        <AdminModerationTable items={items} titleField="title" authorField="authorName" contentField="content" onModerate={onModerate} />
      </div>
    </ProtectedRoute>
  );
}
