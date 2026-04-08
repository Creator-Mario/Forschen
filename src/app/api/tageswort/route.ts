import { NextRequest, NextResponse } from 'next/server';
import { getTodayTageswort, saveTageswort } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const today = getTodayTageswort();
  return NextResponse.json(today || null);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  await saveTageswort(body);
  return NextResponse.json({ success: true });
}
