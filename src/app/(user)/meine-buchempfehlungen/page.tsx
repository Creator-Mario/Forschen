'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import UserBookRecommendationCard from '@/components/UserBookRecommendationCard';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { NutzerBuchempfehlung } from '@/types';
import Link from 'next/link';

export default function MeineBuchempfehlungenPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<NutzerBuchempfehlung[]>([]);

  useEffect(() => {
    fetch('/api/buchempfehlungen?all=1')
      .then(r => r.json())
      .then((data: NutzerBuchempfehlung[]) => {
        if (session?.user.id) {
          setItems(data.filter(item => item.userId === session.user.id));
        }
      });
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Meine Buchempfehlungen</h1>
          <Link href="/buchempfehlungen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Neue Empfehlung
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="space-y-5">
            {items.map(item => <UserBookRecommendationCard key={item.id} item={item} showStatus />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Du hast noch keine Buchempfehlungen eingereicht.</p>
            <Link href="/buchempfehlungen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
              Erste Buchempfehlung hinzufügen →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
