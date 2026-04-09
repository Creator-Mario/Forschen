import { NextRequest, NextResponse } from 'next/server';
import { getApprovedForschung, getForschung, saveForschung } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if (searchParams.get('all')) {
    if (session?.user.role === 'ADMIN') {
      return NextResponse.json(getForschung());
    }
    if (session) {
      const userId = session.user.id;
      return NextResponse.json(
        getForschung().filter(f => f.userId === userId || f.status === 'approved' || f.status === 'published')
      );
    }
  }
  return NextResponse.json(getApprovedForschung());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const beitrag = {
    id: `forschung-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title: body.title,
    content: body.content,
    bibleReference: body.bibleReference || '',
    wochenthemaId: body.wochenthemaId || '',
    status: 'created' as const,
    createdAt: new Date().toISOString(),
  };
  await saveForschung(beitrag);
  return NextResponse.json({ success: true, id: beitrag.id });
}
