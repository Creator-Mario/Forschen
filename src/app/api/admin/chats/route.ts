import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatMessages, getUsers } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Kein Zugang.' }, { status: 403 });
  }

  const messages = getChatMessages();

  // Build a set of unique conversation pairs (sorted so userId1 < userId2 lexicographically)
  const pairMap = new Map<string, { userId1: string; userId2: string; count: number; lastAt: string }>();

  for (const m of messages) {
    const [a, b] = [m.fromUserId, m.toUserId].sort();
    const key = `${a}:${b}`;
    const existing = pairMap.get(key);
    if (!existing) {
      pairMap.set(key, { userId1: a, userId2: b, count: 1, lastAt: m.createdAt });
    } else {
      existing.count += 1;
      if (m.createdAt > existing.lastAt) existing.lastAt = m.createdAt;
    }
  }

  // Load all users once and build a lookup map to avoid N+1 reads
  const userMap = new Map(getUsers().map(u => [u.id, u]));

  const pairs = Array.from(pairMap.values()).map(p => ({
    userId1: p.userId1,
    userId2: p.userId2,
    user1Name: userMap.get(p.userId1)?.name || p.userId1,
    user1ProfileImage: userMap.get(p.userId1)?.profileImage ?? null,
    user2Name: userMap.get(p.userId2)?.name || p.userId2,
    user2ProfileImage: userMap.get(p.userId2)?.profileImage ?? null,
    messageCount: p.count,
    lastAt: p.lastAt,
  })).sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return NextResponse.json(pairs);
}
