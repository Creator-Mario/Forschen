'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { Tageswort } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminTageswortPage() {
  const [items, setItems] = useState<Tageswort[]>([]);

  useEffect(() => {
    fetch('/api/tageswort').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setItems(data);
      else if (data) setItems([data]);
    });
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Tageswort verwalten</h1>

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.verse}</h3>
                  <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
              <p className="text-gray-600 text-sm italic">&ldquo;{item.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
