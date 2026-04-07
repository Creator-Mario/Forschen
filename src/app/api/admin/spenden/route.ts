export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSpenden } from '@/lib/db';

export async function GET() {
  let session = null;
  try { session = await getServerSession(authOptions); } catch (e) {
    // getServerSession reads request headers, which are unavailable during static build.
    // At runtime this should not throw; auth will just return null on unexpected errors.
    if (process.env.NODE_ENV !== 'production') console.error('getServerSession error:', e);
  }
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getSpenden());
}
