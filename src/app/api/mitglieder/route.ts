import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUsers } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const members = getUsers()
    .filter(u => u.role !== 'ADMIN' && u.status === 'active' && u.intro)
    .map(u => ({
      id: u.id,
      name: u.name,
      vorstellung: u.intro!.vorstellung,
      createdAt: u.createdAt,
    }));

  return NextResponse.json(members);
}
