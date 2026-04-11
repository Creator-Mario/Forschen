'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  email?: string;
  unreadCount: number;
}

interface MemberOption {
  id: string;
  name: string;
}

function getValidSelectedMemberId(currentId: string, availableMembers: MemberOption[]) {
  if (availableMembers.some(member => member.id === currentId)) return currentId;
  return availableMembers[0]?.id || '';
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/chat').then(r => r.json()),
      fetch('/api/mitglieder').then(r => r.json()),
    ])
      .then(([chatData, memberData]) => {
        if (Array.isArray(chatData)) setPartners(chatData);
        if (Array.isArray(memberData)) {
          const availableMembers = memberData
            .filter((member: MemberOption) => member.id !== session?.user.id)
            .sort((a: MemberOption, b: MemberOption) => a.name.localeCompare(b.name, 'de'));
          setMembers(availableMembers);
          setSelectedMemberId(current => getValidSelectedMemberId(current, availableMembers));
        }
      })
      .finally(() => setLoading(false));
  }, [session?.user.id]);

  const selectedMember = members.find(member => member.id === selectedMemberId);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nachrichten</h1>
        <p className="text-gray-500 text-sm mb-8">
          Private 1-zu-1-Chats – nur für freigeschaltete Mitglieder
        </p>

        <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Neuen Chat starten</p>
              <h2 className="mt-1 text-xl font-bold text-gray-800">Registrierte Mitglieder direkt auswählen</h2>
              <p className="mt-1 text-sm text-gray-600">
                Wähle einen Namen aus und öffne sofort den privaten Chat.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-80">
              <select
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {members.length === 0 ? (
                  <option value="">Keine Mitglieder verfügbar</option>
                ) : (
                  members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                disabled={!selectedMember}
                onClick={() => {
                  if (!selectedMember) return;
                  router.push(`/chat/${encodeURIComponent(selectedMember.id)}`);
                }}
                className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold text-white transition-all ${
                  selectedMember
                    ? 'bg-blue-700 shadow-lg shadow-blue-200 hover:bg-blue-600'
                    : 'bg-slate-300'
                }`}
              >
                💬 Chat öffnen
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Laden…</div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-400">
            Noch keine Gespräche vorhanden. Besuche die{' '}
            <Link href="/mitglieder/vorstellungen" className="text-blue-600 hover:underline">
              Mitglieder-Vorstellungen
            </Link>
            , um eine Nachricht zu senden.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md divide-y">
            {partners.map(p => (
              <Link
                key={p.id}
                href={`/chat/${p.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {p.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {p.unreadCount > 9 ? '9+' : p.unreadCount}
                    </span>
                  )}
                  <span className="text-blue-500 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
