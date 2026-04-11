import { NextRequest, NextResponse } from 'next/server';
import { getApprovedThesen, getThesen, saveThese } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const all = searchParams.get('all');

  if (all) {
    if (session?.user.role === 'ADMIN') {
      return NextResponse.json(getThesen());
    }
    if (session) {
      // Return all of the current user's thesen plus all approved/published thesen from others.
      const userId = session.user.id;
      return NextResponse.json(
        getThesen().filter(t => t.userId === userId || t.status === 'approved' || t.status === 'published')
      );
    }
  }
  return NextResponse.json(getApprovedThesen());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const these = {
    id: `these-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title: body.title,
    content: body.content,
    bibleReference: body.bibleReference || '',
    status: (session.user.role === 'ADMIN' ? 'published' : 'created') as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  try {
    await saveThese(these);
  } catch (err) {
    console.error('[thesen] saveThese failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'These konnte nicht gespeichert werden.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, id: these.id });
}
