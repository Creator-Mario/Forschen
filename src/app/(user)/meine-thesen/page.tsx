'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ThesisCard from '@/components/ThesisCard';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { These } from '@/types';
import Link from 'next/link';

export default function MeineThesenPage() {
  const { data: session } = useSession();
  const [thesen, setThesen] = useState<These[]>([]);

  useEffect(() => {
    fetch('/api/thesen?all=1')
      .then(r => r.json())
      .then((data: These[]) => {
        if (session?.user.id) {
          setThesen(data.filter(t => t.userId === session.user.id));
        }
      });
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Meine Thesen</h1>
          <Link href="/thesen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Neue These
          </Link>
        </div>

        {thesen.length > 0 ? (
          <div className="space-y-5">
            {thesen.map(t => <ThesisCard key={t.id} these={t} showStatus />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Du hast noch keine Thesen verfasst.</p>
            <Link href="/thesen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
              Erste These schreiben →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
