import { NextRequest, NextResponse } from 'next/server';
import { getWochenthemaList, getCurrentWochenthema, saveWochenthema } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all');
  if (all) {
    return NextResponse.json(getWochenthemaList());
  }
  return NextResponse.json(getCurrentWochenthema() || null);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  saveWochenthema(body);
  return NextResponse.json({ success: true });
}
