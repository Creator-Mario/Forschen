import { NextRequest, NextResponse } from 'next/server';
import { getApprovedThesen, getThesen, saveThese } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const all = searchParams.get('all');

  if (all && session?.user.role === 'ADMIN') {
    return NextResponse.json(getThesen());
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
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  await saveThese(these);
  return NextResponse.json({ success: true, id: these.id });
}
