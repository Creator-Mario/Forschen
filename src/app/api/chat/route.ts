import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversationPartners, getUserById, getChatMessages } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 });

  // Admin sees all unique conversation pairs
  if (session.user.role === 'ADMIN') {
    // Return all users who have messages for admin overview
    const { getUsers } = await import('@/lib/db');
    const msgs = getChatMessages();
    const userIds = new Set<string>();
    for (const m of msgs) {
      userIds.add(m.fromUserId);
      userIds.add(m.toUserId);
    }
    const users = getUsers()
      .filter(u => userIds.has(u.id))
      .map(u => ({ id: u.id, name: u.name, email: u.email, unreadCount: 0 }));
    return NextResponse.json(users);
  }

  const myId = session.user.id;
  const partnerIds = getConversationPartners(myId);
  const allMessages = getChatMessages();

  const partners = partnerIds
    .map(id => getUserById(id))
    .filter(Boolean)
    .map(u => {
      const unreadCount = allMessages.filter(
        m => m.fromUserId === u!.id && m.toUserId === myId && !m.readAt
      ).length;
      return { id: u!.id, name: u!.name, unreadCount };
    });

  return NextResponse.json(partners);
}
