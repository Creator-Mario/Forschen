'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import UserAvatar from '@/components/UserAvatar';
import { useEffect, useState, useRef, useCallback, FormEvent, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

function ChatView() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const otherUserId = params.userId as string;

  // Admin may view a conversation between two other users via ?partner=<userId>
  const partnerParam = searchParams.get('partner');
  const isAdminView = session?.user.role === 'ADMIN' && !!partnerParam;

  const [messages, setMessages] = useState<Message[]>([]);
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerProfileImage, setHeaderProfileImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const url = isAdminView
      ? `/api/chat/${otherUserId}?partner=${partnerParam}`
      : `/api/chat/${otherUserId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    }
  }, [otherUserId, isAdminView, partnerParam]);

  useEffect(() => {
    if (isAdminView) {
      // Resolve names for both participants
      Promise.all([
        fetch(`/api/chat`).then(r => r.json()),
      ]).then(([allUsers]) => {
        if (Array.isArray(allUsers)) {
          const u1 = allUsers.find((x: { id: string; name: string }) => x.id === otherUserId);
          const u2 = allUsers.find((x: { id: string; name: string }) => x.id === partnerParam);
          setHeaderTitle(
            `${u1?.name || otherUserId} & ${u2?.name || partnerParam}`
          );
          setHeaderProfileImage(null);
        }
      });
    } else {
      // Load partner name from the partners list
      fetch('/api/chat')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const p = data.find((x: { id: string; name: string; profileImage?: string | null }) => x.id === otherUserId);
            if (p) {
              setHeaderTitle(p.name);
              setHeaderProfileImage(p.profileImage ?? null);
            }
          }
        });
    }

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [otherUserId, isAdminView, partnerParam, loadMessages]);

  // Mark incoming messages as read when the chat is opened (non-admin only)
  useEffect(() => {
    if (!isAdminView && session?.user.id) {
      fetch(`/api/chat/${otherUserId}`, { method: 'PATCH' }).catch(() => {});
    }
  }, [otherUserId, isAdminView, session?.user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/chat/${otherUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    });
    setLoading(false);
    if (res.ok) {
      setText('');
      loadMessages();
      // Mark own sent message as immediately visible (no unread for sender)
    }
  }

  const myId = session?.user.id;

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/chat" className="text-blue-600 hover:text-blue-800 text-sm">← Chats</Link>
          {isAdminView ? (
            <>
              <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                Admin-Ansicht (nur lesen)
              </span>
              <h1 className="font-semibold text-gray-800">{headerTitle || 'Lade…'}</h1>
            </>
          ) : (
            <>
              <UserAvatar
                name={headerTitle || '?'}
                imageSrc={headerProfileImage}
                className="h-9 w-9 shrink-0 text-sm"
                textClassName="text-sm font-semibold"
              />
              <h1 className="font-semibold text-gray-800">{headerTitle || 'Lade…'}</h1>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">Noch keine Nachrichten.</p>
          )}
          {messages.map(m => {
            const isMe = !isAdminView && m.fromUserId === myId;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatDate(m.createdAt)}
                    {isMe && m.readAt && <span className="ml-1" title="Gelesen">✓✓</span>}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input – hidden for admin view */}
        {!isAdminView && (
          <form onSubmit={handleSend} className="mt-3 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Nachricht schreiben…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              Senden
            </button>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ChatUserPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-64 text-gray-400">Laden…</div>}>
      <ChatView />
    </Suspense>
  );
}
