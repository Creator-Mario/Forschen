'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import PrayerCard from '@/components/PrayerCard';
import { useEffect, useState } from 'react';
import type { Gebet } from '@/types';
import Link from 'next/link';

export default function MeineGebetePage() {
  const [communityGebete, setCommunityGebete] = useState<Gebet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gebet')
      .then(r => r.json())
      .then((data: Gebet[]) => {
        if (Array.isArray(data)) setCommunityGebete(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Gebetsraum</h1>
          <Link href="/gebet/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Gebet einreichen
          </Link>
        </div>

        <h2 className="font-semibold text-gray-700 mb-4">Gebete der Gemeinschaft</h2>
        {loading ? (
          <p className="text-gray-400">Wird geladen...</p>
        ) : communityGebete.length > 0 ? (
          <div className="space-y-4">
            {communityGebete.map(g => <PrayerCard key={g.id} gebet={g} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Noch keine Gebete vorhanden.</div>
        )}
      </div>
    </ProtectedRoute>
  );
}
