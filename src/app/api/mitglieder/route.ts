import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';

export async function GET() {
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
