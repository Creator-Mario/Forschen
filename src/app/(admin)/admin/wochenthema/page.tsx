'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { Wochenthema } from '@/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminWochenthemaPage() {
  const [items, setItems] = useState<Wochenthema[]>([]);

  useEffect(() => {
    fetch('/api/wochenthema?all=1').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
    });
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Wochenthema verwalten</h1>

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.week}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{item.introduction.substring(0, 150)}…</p>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-8 text-gray-400">Keine Einträge.</div>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
