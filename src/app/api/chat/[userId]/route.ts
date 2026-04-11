import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversation, saveChatMessage, getUserById, deleteConversation, saveAdminLog, markMessagesAsRead } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { userId: otherUserId } = await params;

  // Admin may view a conversation between any two users via ?partner=<userId>
  if (session.user.role === 'ADMIN') {
    const { searchParams } = new URL(req.url);
    const partnerUserId = searchParams.get('partner');
    if (partnerUserId) {
      const messages = getConversation(otherUserId, partnerUserId);
      return NextResponse.json(messages);
    }
  }

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Kein Zugang.' }, { status: 403 });
  }

  const { userId: otherUserId } = await params;

  // The URL carries the second participant's ID; admin is deleting the conversation
  // between otherUserId and a third user passed as query param, OR the entire
  // outbox/inbox of otherUserId when used from the admin chat overview.
  const { searchParams } = new URL(req.url);
  const partnerUserId = searchParams.get('partner') || session.user.id;

  await deleteConversation(otherUserId, partnerUserId);

  await saveAdminLog({
    id: `log-${generateId()}`,
    adminId: session.user.id,
    action: 'chat_delete',
    targetType: 'chat',
    targetId: `${otherUserId}:${partnerUserId}`,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  const { userId: fromUserId } = await params;
  // Mark all messages from fromUserId to the current user as read
  await markMessagesAsRead(session.user.id, fromUserId);
  return NextResponse.json({ success: true });
}
