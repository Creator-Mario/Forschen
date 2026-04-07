export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSpenden } from '@/lib/db';

export async function GET() {
  let session = null;
  try { session = await getServerSession(authOptions); } catch { /* static build */ }
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(getSpenden());
}
