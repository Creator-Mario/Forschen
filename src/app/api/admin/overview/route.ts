import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getThesen, getForschung, getGebete, getVideos, getAktionen, getUsers,
} from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = getUsers();

  function enrichUser(userId: string) {
    const u = users.find(u => u.id === userId);
    return { userName: u?.name || 'Unbekannt', userEmail: u?.email || '', userId };
  }

  const thesen = getThesen().map(t => ({
    ...t, contentType: 'these' as const, displayTitle: t.title, ...enrichUser(t.userId),
  }));
  const forschung = getForschung().map(f => ({
    ...f, contentType: 'forschung' as const, displayTitle: f.title, ...enrichUser(f.userId),
  }));
  const gebete = getGebete().map(g => ({
    ...g, contentType: 'gebet' as const,
    displayTitle: g.content ? (g.content.length > 60 ? g.content.substring(0, 60) + '…' : g.content) : '(kein Inhalt)',
    ...enrichUser(g.userId),
  }));
  const videos = getVideos().map(v => ({
    ...v, contentType: 'video' as const, displayTitle: v.title, ...enrichUser(v.userId),
  }));
  const aktionen = getAktionen().map(a => ({
    ...a, contentType: 'aktion' as const, displayTitle: a.title, ...enrichUser(a.userId),
  }));

  const all = [...thesen, ...forschung, ...gebete, ...videos, ...aktionen]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(all);
}
