'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminModerationTable from '@/components/AdminModerationTable';
import { useEffect, useState } from 'react';
import type { These } from '@/types';

export default function AdminThesenPage() {
  const [thesen, setThesen] = useState<These[]>([]);

  async function load() {
    const r = await fetch('/api/thesen?all=1');
    setThesen(await r.json());
  }

  useEffect(() => { load(); }, []);

  async function onModerate(id: string, status: 'approved' | 'rejected') {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'these', id, status }),
    });
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thesen moderieren</h1>
        <p className="text-gray-500 mb-8">{thesen.filter(t => t.status === 'pending').length} ausstehend</p>
        <AdminModerationTable
          items={thesen}
         
          titleField="title"
          authorField="authorName"
          contentField="content"
          onModerate={onModerate}
        />
      </div>
    </ProtectedRoute>
  );
}
