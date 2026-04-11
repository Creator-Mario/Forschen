import { NextRequest, NextResponse } from 'next/server';
import { getApprovedGebete, getGebete, saveGebet } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  // Prayers require login to view
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (searchParams.get('all')) {
    if (session.user.role === 'ADMIN') {
      return NextResponse.json(getGebete());
    }
    const userId = session.user.id;
    return NextResponse.json(
      getGebete().filter(g => g.userId === userId || g.status === 'approved' || g.status === 'published')
    );
  }
  return NextResponse.json(getApprovedGebete());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const gebet = {
    id: `gebet-${generateId()}`,
    userId: session.user.id,
    authorName: body.anonymous ? undefined : session.user.name,
    content: body.content,
    anonymous: !!body.anonymous,
    status: (session.user.role === 'ADMIN' ? 'published' : 'created') as ContentStatus,
    createdAt: new Date().toISOString(),
  };
  await saveGebet(gebet);
  return NextResponse.json({ success: true, id: gebet.id });
}
