export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { getApprovedAktionen, getAktionen, saveAktion } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let session = null;
  try { session = await getServerSession(authOptions); } catch (e) {
    // getServerSession reads request headers, which are unavailable during static build.
    // At runtime this should not throw; auth will just return null on unexpected errors.
    if (process.env.NODE_ENV !== 'production') console.error('getServerSession error:', e);
  }
  if (searchParams.get('all') && session?.user.role === 'ADMIN') {
    return NextResponse.json(getAktionen());
  }
  return NextResponse.json(getApprovedAktionen());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const aktion = {
    id: `aktion-${generateId()}`,
    userId: session.user.id,
    authorName: session.user.name,
    title: body.title,
    description: body.description,
    location: body.location || '',
    dateEvent: body.dateEvent || '',
    contactInfo: body.contactInfo || '',
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  saveAktion(aktion);
  return NextResponse.json({ success: true, id: aktion.id });
}
