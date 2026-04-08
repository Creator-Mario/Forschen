'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState, useRef, FormEvent, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

function ChatView() {
  const { data: session } = useSession();
  const params = useParams();
  const otherUserId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerName, setPartnerName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/chat/${otherUserId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    }
  }

  useEffect(() => {
    // Load partner name
    fetch('/api/chat')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const p = data.find((x: { id: string; name: string }) => x.id === otherUserId);
          if (p) setPartnerName(p.name);
        }
      });

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // loadMessages is defined inside the effect to avoid stale closures;
    // it is safe to omit since it only depends on otherUserId which is in the array.
  }, [otherUserId]);

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
    }
  }

  const myId = session?.user.id;

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/chat" className="text-blue-600 hover:text-blue-800 text-sm">← Chats</Link>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {partnerName.charAt(0).toUpperCase() || '?'}
          </div>
          <h1 className="font-semibold text-gray-800">{partnerName || 'Lade…'}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">Noch keine Nachrichten.</p>
          )}
          {messages.map(m => {
            const isMe = m.fromUserId === myId;
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
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
