export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers } from '@/lib/db';

export async function GET() {
  let session = null;
  try { session = await getServerSession(authOptions); } catch { /* static build */ }
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = getUsers().map(u => ({ ...u, password: '[HIDDEN]' }));
  return NextResponse.json(users);
}
