import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversation, saveChatMessage, getUserById } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { userId: otherUserId } = await params;

  // Admin may read any conversation between any two users
  const myId = session.user.id;
  const messages = getConversation(myId, otherUserId);
  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { userId: toUserId } = await params;
  const { content } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: 'Nachricht darf nicht leer sein.' }, { status: 400 });
  }

  const recipient = getUserById(toUserId);
  if (!recipient) return NextResponse.json({ error: 'Empfänger nicht gefunden.' }, { status: 404 });

  // Only active members and admin may send messages
  if (session.user.role !== 'ADMIN') {
    const sender = getUserById(session.user.id);
    if (!sender || sender.status !== 'active') {
      return NextResponse.json({ error: 'Nur freigeschaltete Mitglieder können chatten.' }, { status: 403 });
    }
  }

  const msg = {
    id: `msg-${generateId()}`,
    fromUserId: session.user.id,
    toUserId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  await saveChatMessage(msg);
  return NextResponse.json(msg);
}
