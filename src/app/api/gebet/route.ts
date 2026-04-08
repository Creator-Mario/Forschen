import { NextRequest, NextResponse } from 'next/server';
import { getApprovedGebete, getGebete, saveGebet } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if (searchParams.get('all') && session?.user.role === 'ADMIN') {
    return NextResponse.json(getGebete());
  }
  // Prayers require login to view
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  await saveGebet(gebet);
  return NextResponse.json({ success: true, id: gebet.id });
}
