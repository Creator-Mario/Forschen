'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { SpendenRecord } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminSpendenPage() {
  const [spenden, setSpenden] = useState<SpendenRecord[]>([]);

  useEffect(() => {
    fetch('/api/admin/spenden').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setSpenden(data);
    });
  }, []);

  const total = spenden.reduce((acc, s) => acc + s.amount, 0);

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Spendenübersicht</h1>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="text-blue-600 text-sm font-medium mb-1">Gesamtbetrag</div>
          <div className="text-3xl font-bold text-blue-800">{total.toFixed(2)} EUR</div>
          <div className="text-gray-500 text-sm mt-1">{spenden.length} Spenden insgesamt</div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Betrag</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nachricht</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              </tr>
            </thead>
            <tbody>
              {spenden.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.amount.toFixed(2)} {s.currency}</td>
                  <td className="px-4 py-3 text-gray-600">{s.message || '–'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
