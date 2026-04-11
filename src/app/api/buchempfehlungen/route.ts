import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import { getApprovedBuchempfehlungen, getBuchempfehlungen, saveBuchempfehlung } from '@/lib/db';
import type { ContentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const all = searchParams.get('all');

  if (all) {
    if (session?.user.role === 'ADMIN') {
      return NextResponse.json(getBuchempfehlungen());
    }
    if (session) {
      const userId = session.user.id;
      return NextResponse.json(
        getBuchempfehlungen().filter(item => item.userId === userId || item.status === 'approved' || item.status === 'published')
      );
    }
  }

  return NextResponse.json(getApprovedBuchempfehlungen());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim() || !body.author?.trim() || !body.description?.trim() || !body.themeReference?.trim()) {
    return NextResponse.json({ error: 'Titel, Autor, Beschreibung und Themenbezug sind erforderlich.' }, { status: 400 });
  }

  const entry = {
    id: `buchempfehlung-${generateId()}`,
    userId: session.user.id,
    recommenderName: session.user.name,
    title: body.title.trim(),
    author: body.author.trim(),
    description: body.description.trim(),
    themeReference: body.themeReference.trim(),
    status: (session.user.role === 'ADMIN' ? 'published' : 'created') as ContentStatus,
    createdAt: new Date().toISOString(),
  };

  try {
    await saveBuchempfehlung(entry);
  } catch (err) {
    console.error('[buchempfehlungen] saveBuchempfehlung failed:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Buchempfehlung konnte nicht gespeichert werden.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: entry.id });
}
